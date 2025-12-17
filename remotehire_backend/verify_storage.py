"""Verify Django storage backend"""
import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(__file__))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

print("="*60)
print("Django Storage Backend Verification")
print("="*60)

print(f"\nUSE_S3: {settings.USE_S3}")
if hasattr(settings, 'STORAGES'):
    print(f"STORAGES: {settings.STORAGES}")
elif hasattr(settings, 'DEFAULT_FILE_STORAGE'):
    print(f"DEFAULT_FILE_STORAGE: {settings.DEFAULT_FILE_STORAGE}")
print(f"default_storage class: {default_storage.__class__.__name__}")
print(f"default_storage module: {default_storage.__class__.__module__}")

if hasattr(default_storage, 'bucket_name'):
    print(f"S3 Bucket: {default_storage.bucket_name}")
    print(f"S3 Location: {default_storage.location}")

print("\n" + "="*60)
print("Testing File Save")
print("="*60)

try:
    test_content = ContentFile(b"Test from default_storage.save()")
    filename = default_storage.save('test-files/verify.txt', test_content)
    
    print(f"\n✅ File saved!")
    print(f"Saved filename: {filename}")
    print(f"File URL: {default_storage.url(filename)}")
    print(f"File exists: {default_storage.exists(filename)}")
    
    if hasattr(default_storage, 'bucket'):
        print(f"\nS3 Storage Details:")
        print(f"Bucket object: {default_storage.bucket}")
        
        # List files
        import boto3
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        response = s3_client.list_objects_v2(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
        if 'Contents' in response:
            print(f"\n📦 All files in S3:")
            for obj in response['Contents']:
                print(f"  - {obj['Key']}")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
