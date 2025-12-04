# backend/services/storage_service.py
from supabase_client import supabase
import uuid
from werkzeug.utils import secure_filename
import os

class StorageService:
    """Service for handling file uploads to Supabase Storage"""

    BUCKET_NAME = "post-images"
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

    @staticmethod
    def allowed_file(filename: str) -> bool:
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in StorageService.ALLOWED_EXTENSIONS

    @staticmethod
    def upload_post_image(file_data: bytes, filename: str) -> str:
        """
        Upload image to Supabase Storage
        Returns: public URL of uploaded image
        Raises: ValueError if upload fails
        """
        if not StorageService.allowed_file(filename):
            raise ValueError(f"File type not allowed. Allowed: {StorageService.ALLOWED_EXTENSIONS}")

        # Generate unique filename
        ext = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{ext}"
        storage_path = f"posts/{unique_filename}"

        try:
            # Upload to Supabase Storage
            supabase.storage.from_(StorageService.BUCKET_NAME).upload(
                storage_path,
                file_data,
                file_options={"content-type": f"image/{ext}"}
            )

            # Get public URL
            public_url = supabase.storage.from_(StorageService.BUCKET_NAME).get_public_url(storage_path)

            return public_url

        except Exception as e:
            raise ValueError(f"Failed to upload image: {str(e)}")

    @staticmethod
    def delete_post_image(image_url: str) -> bool:
        """
        Delete image from Supabase Storage
        Returns: True if deleted, False otherwise
        """
        try:
            # Extract path from URL
            # URL format: https://{project}.supabase.co/storage/v1/object/public/post-images/posts/{filename}
            if StorageService.BUCKET_NAME not in image_url:
                return False

            path = image_url.split(f"{StorageService.BUCKET_NAME}/")[1]
            supabase.storage.from_(StorageService.BUCKET_NAME).remove([path])
            return True

        except Exception:
            return False
