import os
import tempfile
import uuid

from django.conf import settings
from django.db.models import Q
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
from .utils.firebase_storage import upload_file_to_firebase


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
        1. Upload raw recording to Firebase Storage
        2. Download temporarily to process
        3. Process audio (noise reduction, normalization)
        4. Upload clean recording to Firebase Storage
        5. Store Firebase URLs in database
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
        
        raw_storage_path = f"recordings/raw/{recording_id}_raw{file_extension}"
        clean_storage_path = f"recordings/clean/{recording_id}_clean.wav"
        
        # Create temporary directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            # Step 1: Upload raw recording to Firebase
            raw_file_path = os.path.join(temp_dir, f"raw{file_extension}")
            with open(raw_file_path, 'wb') as f:
                for chunk in raw_recording_file.chunks():
                    f.write(chunk)
            
            # Upload raw recording to Firebase Storage
            raw_url = upload_file_to_firebase(
                file_path=raw_file_path,
                destination_path=raw_storage_path,
                content_type=raw_recording_file.content_type or 'audio/wav'
            )
            
            # Step 2: Process audio (download, process, get duration)
            clean_file_path = os.path.join(temp_dir, "clean.wav")
            duration, sample_rate = process_audio(raw_file_path, clean_file_path, target_sr=16000)
            
            # Step 3: Upload clean recording to Firebase Storage
            clean_url = upload_file_to_firebase(
                file_path=clean_file_path,
                destination_path=clean_storage_path,
                content_type='audio/wav'
            )
        
        # Step 4: Create Recording record with Firebase URLs
        recording = Recording.objects.create(
            recording_id=recording_id,
            contributor=contributor,
            raw_rec_link=raw_url,
            clean_rec_link=clean_url,
            ogk_transcription=serializer.validated_data.get('ogk_transcription', ''),
            eng_transcription=serializer.validated_data.get('eng_transcription', ''),
            rec_theme=serializer.validated_data.get('rec_theme', ''),
            rec_duration=duration,
        )
        
        return Response(
            RecordingSerializer(recording).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["get"]) 
    def stream(self, request, pk=None):
        """Get download URLs for raw and clean recordings"""
        instance = self.get_object()
        return Response({
            "raw_recording": instance.raw_rec_link,
            "clean_recording": instance.clean_rec_link,
        })
