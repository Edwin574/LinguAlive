from rest_framework import serializers

from .models import Contributor, Recording


class ContributorSerializer(serializers.ModelSerializer):
    """Serializer for Contributor model"""
    class Meta:
        model = Contributor
        fields = [
            "contributor_id",
            "contributor_name",
            "age_range",
            "gender",
            "location",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["contributor_id", "created_at", "updated_at"]


class RecordingSerializer(serializers.ModelSerializer):
    """Serializer for Recording model with contributor info"""
    contributor_name = serializers.CharField(source='contributor.contributor_name', read_only=True)
    raw_recording_url = serializers.SerializerMethodField()
    clean_recording_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Recording
        fields = [
            "recording_id",
            "contributor",
            "contributor_name",
            "raw_rec_link",
            "clean_rec_link",
            "raw_recording_url",
            "clean_recording_url",
            "ogk_transcription",
            "eng_transcription",
            "rec_theme",
            "rec_duration",
            "date_submitted",
        ]
        read_only_fields = [
            "recording_id",
            "raw_rec_link",
            "clean_rec_link",
            "date_submitted",
        ]
    
    def get_raw_recording_url(self, obj):
        """Generate URL for raw recording"""
        if not obj.raw_rec_link:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/recordings/{obj.recording_id}/audio/raw/')
        return None
    
    def get_clean_recording_url(self, obj):
        """Generate URL for clean recording"""
        if not obj.clean_rec_link:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/recordings/{obj.recording_id}/audio/clean/')
        return None


class RecordingUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading recordings (includes file upload)"""
    raw_recording = serializers.FileField(write_only=True, required=True)
    contributor_id = serializers.UUIDField(write_only=True, required=True)
    
    class Meta:
        model = Recording
        fields = [
            "contributor_id",
            "raw_recording",
            "ogk_transcription",
            "eng_transcription",
            "rec_theme",
        ]
        
    def validate_contributor_id(self, value):
        """Ensure contributor exists"""
        try:
            Contributor.objects.get(contributor_id=value)
        except Contributor.DoesNotExist:
            raise serializers.ValidationError("Contributor not found.")
        return value


