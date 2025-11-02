"""
Firebase Storage utility functions for uploading recordings.

This module handles uploading files to Firebase Cloud Storage and returning
downloadable URLs that are stored in the Django database.

Free Tier Limits (Spark Plan):
- 5 GB storage
- 1 GB/day downloads
- 20K operations/day
"""
import os
import io
from typing import Optional
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, storage
from django.conf import settings


# Initialize Firebase Admin SDK (singleton pattern)
_firebase_app = None


def initialize_firebase():
    """Initialize Firebase Admin SDK if not already initialized."""
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
    
    # Check if Firebase is already initialized
    try:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app
    except ValueError:
        pass
    
    # Initialize with credentials
    # Option 1: Use service account JSON file (recommended for production)
    service_account_path = getattr(settings, 'FIREBASE_SERVICE_ACCOUNT_PATH', None)
    
    if service_account_path and os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
    else:
        # Option 2: Use environment variables (useful for development)
        # You can set these in your .env file or environment
        firebase_cred = {
            "type": "service_account",
            "project_id": getattr(settings, 'FIREBASE_PROJECT_ID', 'lingualive-34f02'),
            "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID', ''),
            "private_key": os.getenv('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
            "client_email": os.getenv('FIREBASE_CLIENT_EMAIL', ''),
            "client_id": os.getenv('FIREBASE_CLIENT_ID', ''),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        }
        
        # If no credentials provided, use default (for local testing)
        if not firebase_cred.get('private_key'):
            # Try to use default credentials (gcloud CLI or GCP service account)
            cred = credentials.ApplicationDefault()
        else:
            cred = credentials.Certificate(firebase_cred)
    
    storage_bucket = getattr(settings, 'FIREBASE_STORAGE_BUCKET', 'lingualive-34f02.firebasestorage.app')
    
    _firebase_app = firebase_admin.initialize_app(
        cred,
        {
            'storageBucket': storage_bucket
        }
    )
    
    return _firebase_app


def upload_file_to_firebase(
    file_path: str,
    destination_path: str,
    content_type: Optional[str] = None
) -> str:
    """
    Upload a file to Firebase Storage and return a public download URL.
    
    Args:
        file_path: Path to the local file to upload
        destination_path: Path where the file should be stored in Firebase Storage
                         (e.g., 'recordings/raw/audio.wav')
        content_type: MIME type of the file (e.g., 'audio/wav', 'audio/mpeg')
    
    Returns:
        str: Public download URL for the uploaded file
    
    Raises:
        Exception: If upload fails
    """
    initialize_firebase()
    
    bucket = storage.bucket()
    blob = bucket.blob(destination_path)
    
    # Set content type if provided
    if content_type:
        blob.content_type = content_type
    
    # Upload the file
    blob.upload_from_filename(file_path)
    
    # Make the file publicly accessible (for proof of concept)
    # In production, you might want to use signed URLs instead
    blob.make_public()
    
    # Return the public URL
    return blob.public_url


def upload_file_content_to_firebase(
    file_content: bytes,
    destination_path: str,
    content_type: Optional[str] = None
) -> str:
    """
    Upload file content (bytes) directly to Firebase Storage.
    
    Useful when you have file content in memory (e.g., from Django's InMemoryUploadedFile).
    
    Args:
        file_content: File content as bytes
        destination_path: Path where the file should be stored in Firebase Storage
        content_type: MIME type of the file
    
    Returns:
        str: Public download URL for the uploaded file
    """
    initialize_firebase()
    
    bucket = storage.bucket()
    blob = bucket.blob(destination_path)
    
    if content_type:
        blob.content_type = content_type
    
    # Upload from bytes
    blob.upload_from_string(file_content, content_type=content_type or 'application/octet-stream')
    
    # Make publicly accessible
    blob.make_public()
    
    return blob.public_url


def delete_file_from_firebase(storage_path: str) -> bool:
    """
    Delete a file from Firebase Storage.
    
    Args:
        storage_path: Path to the file in Firebase Storage
    
    Returns:
        bool: True if deleted successfully, False otherwise
    """
    try:
        initialize_firebase()
        bucket = storage.bucket()
        blob = bucket.blob(storage_path)
        blob.delete()
        return True
    except Exception as e:
        print(f"Error deleting file from Firebase: {e}")
        return False


def get_file_url(storage_path: str) -> Optional[str]:
    """
    Get the public URL for a file in Firebase Storage (if it exists and is public).
    
    Args:
        storage_path: Path to the file in Firebase Storage
    
    Returns:
        str: Public URL if file exists and is public, None otherwise
    """
    try:
        initialize_firebase()
        bucket = storage.bucket()
        blob = bucket.blob(storage_path)
        
        if blob.exists():
            return blob.public_url
        return None
    except Exception as e:
        print(f"Error getting file URL from Firebase: {e}")
        return None

