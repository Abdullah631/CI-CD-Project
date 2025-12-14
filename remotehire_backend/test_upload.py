"""Test S3 file upload"""
import os
import sys
from django.core.files.base import ContentFile

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(__file__))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from django.conf import settings
from loginapi.models import User

print("Testing S3 Upload Configuration...")
print(f"USE_S3: {settings.USE_S3}")
print(f"Bucket: {settings.AWS_STORAGE_BUCKET_NAME if settings.USE_S3 else 'N/A'}")
if hasattr(settings, 'STORAGES'):
    print(f"Storage Backend: {settings.STORAGES['default']['BACKEND']}")
elif hasattr(settings, 'DEFAULT_FILE_STORAGE'):
    print(f"Storage Backend: {settings.DEFAULT_FILE_STORAGE if settings.USE_S3 else 'Local'}")

if settings.USE_S3:
    # Test creating a file
    print("\nTesting file upload to S3...")
    
    # Create test content
    test_content = ContentFile(b"Test CV upload from Django")
    
    # Get a test user (or create one)
    try:
        user = User.objects.filter(role='candidate').first()
        if user:
            print(f"Using user: {user.username} (ID: {user.id})")
            
            # Save a test file
            user.cv.save('test-upload.txt', test_content, save=True)
            
            print(f"✅ File uploaded successfully!")
            print(f"File URL: {user.cv.url}")
            print(f"File name in storage: {user.cv.name}")
            
            # Try to verify the file exists in storage
            print(f"\nVerifying file in storage...")
            print(f"Storage backend: {user.cv.storage.__class__.__name__}")
            print(f"Bucket: {user.cv.storage.bucket_name}")
            print(f"File exists check: {user.cv.storage.exists(user.cv.name)}")
            
            # Verify in S3
            import boto3
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            
            # List objects
            response = s3_client.list_objects_v2(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Prefix='media/'
            )
            
            if 'Contents' in response:
                print(f"\n📦 Files in S3 bucket:")
                for obj in response['Contents']:
                    print(f"  - {obj['Key']} ({obj['Size']} bytes)")
            else:
                print("\n⚠️ No files found in bucket")
                
        else:
            print("No candidate user found to test with")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
else:
    print("\n⚠️ S3 is not enabled. Set USE_S3=True in .env")
