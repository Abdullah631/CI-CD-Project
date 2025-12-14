"""
Custom storage backends for AWS S3
"""
from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class MediaStorage(S3Boto3Storage):
    """Storage for user uploaded media files (photos, resumes)"""
    location = 'media'
    file_overwrite = False  # Don't overwrite files with same name
    default_acl = None  # Use bucket's default ACL instead of 'private'
    region_name = settings.AWS_S3_REGION_NAME if hasattr(settings, 'AWS_S3_REGION_NAME') else 'eu-north-1'


class PublicMediaStorage(S3Boto3Storage):
    """Storage for public media files (if needed)"""
    location = 'public'
    file_overwrite = False
    default_acl = 'public-read'
