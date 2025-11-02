from django.db import models
import uuid


class Contributor(models.Model):
    """Contributor table - stores contributor information"""
    contributor_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contributor_name = models.CharField(max_length=255)
    age_range = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., '18-25', '26-35'")
    gender = models.CharField(max_length=50, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.contributor_name} ({self.contributor_id})"

    class Meta:
        db_table = 'contributor'
        ordering = ['-created_at']


class Recording(models.Model):
    """Recording table - stores recording metadata with links to Firebase Storage"""
    recording_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contributor = models.ForeignKey(
        Contributor,
        on_delete=models.CASCADE,
        related_name='recordings',
        db_column='contributor_id'
    )
    
    # Links to Firebase Storage (not actual files)
    raw_rec_link = models.URLField(max_length=512, blank=True, help_text="Firebase Storage URL for raw recording")
    clean_rec_link = models.URLField(max_length=512, blank=True, help_text="Firebase Storage URL for clean recording")
    
    # Transcriptions
    ogk_transcription = models.CharField(max_length=10000, blank=True, null=True, help_text="Transcription in original language")
    eng_transcription = models.CharField(max_length=10000, blank=True, null=True, help_text="Transcription in English")
    
    # Metadata
    rec_theme = models.CharField(max_length=255, blank=True, null=True, help_text="Theme of the recording")
    rec_duration = models.FloatField(null=True, blank=True, help_text="Duration in seconds")
    date_submitted = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Recording {self.recording_id} by {self.contributor.contributor_name}"

    class Meta:
        db_table = 'recording'
        ordering = ['-date_submitted']
