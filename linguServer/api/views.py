import os
import uuid

from django.conf import settings
from django.db.models import Q
from django.http import FileResponse, Http404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from .models import Contributor, Recording
from .serializers import (
    ContributorSerializer,
    RecordingSerializer,
    RecordingUploadSerializer
)
from .utils.audio_processing import process_audio


class ContributorViewSet(viewsets.ModelViewSet):
    """ViewSet for managing contributors"""
    queryset = Contributor.objects.all().order_by("-created_at")
    serializer_class = ContributorSerializer


class RecordingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing recordings with Firebase Storage integration"""
    queryset = Recording.objects.all().order_by("-date_submitted")
    serializer_class = RecordingSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_serializer_class(self):
        if self.action in ["create", "upload"]:
            return RecordingUploadSerializer
        return RecordingSerializer

    def get_serializer_context(self):
        """Add request to serializer context for URL generation"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def list(self, request, *args, **kwargs):
        """List recordings with optional search"""
        q = request.query_params.get("q")
        qs = self.get_queryset()
        
        if q:
            # Search in transcriptions, theme, or contributor name
            qs = qs.filter(
                Q(ogk_transcription__icontains=q)
                | Q(eng_transcription__icontains=q)
                | Q(rec_theme__icontains=q)
                | Q(contributor__contributor_name__icontains=q)
            )
        
        # Filter by contributor if provided
        contributor_id = request.query_params.get("contributor_id")
        if contributor_id:
            qs = qs.filter(contributor_id=contributor_id)
        
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page or qs, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Create a new recording:
        1. Save raw recording to local storage
        2. Process audio (noise reduction, normalization)
        3. Save clean recording to local storage
        4. Store file paths in database
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get validated data
        contributor_id = serializer.validated_data.pop('contributor_id')
        raw_recording_file = serializer.validated_data.pop('raw_recording')
        
        # Get contributor
        contributor = Contributor.objects.get(contributor_id=contributor_id)
        
        # Generate unique file names
        recording_id = uuid.uuid4()
        file_extension = os.path.splitext(raw_recording_file.name)[1] or '.wav'
        
        # Create directories if they don't exist
        raw_dir = os.path.join(settings.MEDIA_ROOT, 'recordings', 'raw')
        clean_dir = os.path.join(settings.MEDIA_ROOT, 'recordings', 'clean')
        os.makedirs(raw_dir, exist_ok=True)
        os.makedirs(clean_dir, exist_ok=True)
        
        # Step 1: Save raw recording
        raw_filename = f"{recording_id}_raw{file_extension}"
        raw_file_path = os.path.join(raw_dir, raw_filename)
        with open(raw_file_path, 'wb') as f:
            for chunk in raw_recording_file.chunks():
                f.write(chunk)
        
        # Step 2: Process audio
        clean_filename = f"{recording_id}_clean.wav"
        clean_file_path = os.path.join(clean_dir, clean_filename)
        duration, sample_rate = process_audio(raw_file_path, clean_file_path, target_sr=16000)
        
        # Step 3: Store relative paths in database
        raw_rel_path = f"recordings/raw/{raw_filename}"
        clean_rel_path = f"recordings/clean/{clean_filename}"
        
        # Step 4: Create Recording record with file paths
        recording = Recording.objects.create(
            recording_id=recording_id,
            contributor=contributor,
            raw_rec_link=raw_rel_path,
            clean_rec_link=clean_rel_path,
            ogk_transcription=serializer.validated_data.get('ogk_transcription', ''),
            eng_transcription=serializer.validated_data.get('eng_transcription', ''),
            rec_theme=serializer.validated_data.get('rec_theme', ''),
            rec_duration=duration,
        )
        
        return Response(
            RecordingSerializer(recording).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["get"], url_path='audio/(?P<audio_type>raw|clean)')
    def audio(self, request, pk=None, audio_type='clean'):
        """Serve audio file (raw or clean)"""
        instance = self.get_object()
        
        # Get the appropriate file path
        file_path = instance.clean_rec_link if audio_type == 'clean' else instance.raw_rec_link
        
        if not file_path:
            raise Http404("Audio file not found")
        
        # Construct full path
        full_path = os.path.join(settings.MEDIA_ROOT, file_path)
        
        if not os.path.exists(full_path):
            raise Http404("Audio file not found")
        
        # Serve the file
        return FileResponse(
            open(full_path, 'rb'),
            content_type='audio/wav' if file_path.endswith('.wav') else 'audio/webm',
            filename=os.path.basename(file_path)
        )
    
    @action(detail=True, methods=["get"]) 
    def stream(self, request, pk=None):
        """Get URLs for raw and clean recordings"""
        instance = self.get_object()
        request_scheme = request.scheme
        request_host = request.get_host()
        
        return Response({
            "raw_recording": f"{request_scheme}://{request_host}/api/recordings/{instance.recording_id}/audio/raw/" if instance.raw_rec_link else None,
            "clean_recording": f"{request_scheme}://{request_host}/api/recordings/{instance.recording_id}/audio/clean/" if instance.clean_rec_link else None,
        })
