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
    
    class Meta:
        model = Recording
        fields = [
            "recording_id",
            "contributor",
            "contributor_name",
            "raw_rec_link",
            "clean_rec_link",
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


