from django.contrib import admin

from .models import Contributor, Recording


@admin.register(Contributor)
class ContributorAdmin(admin.ModelAdmin):
    list_display = ['contributor_name', 'age_range', 'gender', 'location', 'created_at']
    list_filter = ['age_range', 'gender', 'created_at']
    search_fields = ['contributor_name', 'location']


@admin.register(Recording)
class RecordingAdmin(admin.ModelAdmin):
    list_display = ['recording_id', 'contributor', 'rec_theme', 'rec_duration', 'date_submitted']
    list_filter = ['rec_theme', 'date_submitted']
    search_fields = ['ogk_transcription', 'eng_transcription', 'rec_theme', 'contributor__contributor_name']
    readonly_fields = ['recording_id', 'date_submitted', 'raw_rec_link', 'clean_rec_link']
