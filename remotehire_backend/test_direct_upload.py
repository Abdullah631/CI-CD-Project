"""Test direct S3 upload with boto3"""
import boto3
import os
from dotenv import load_dotenv
from io import BytesIO

# Load environment variables
load_dotenv()

# Get AWS credentials
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')

print(f"Testing direct upload to S3...")
print(f"Bucket: {AWS_STORAGE_BUCKET_NAME}")
print(f"Region: {AWS_S3_REGION_NAME}")

# Create S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_S3_REGION_NAME
)

try:
    # Test upload directly
    test_content = b"Test upload from boto3 directly"
    test_key = "media/resumes/direct-test.txt"
    
    print(f"\nAttempting to upload: {test_key}")
    
    s3_client.put_object(
        Bucket=AWS_STORAGE_BUCKET_NAME,
        Key=test_key,
        Body=test_content,
        ContentType='text/plain'
    )
    
    print(f"✅ Upload successful!")
    
    # List objects
    print(f"\nListing objects...")
    response = s3_client.list_objects_v2(Bucket=AWS_STORAGE_BUCKET_NAME)
    
    if 'Contents' in response:
        print(f"\n✅ Found {len(response['Contents'])} objects:")
        for obj in response['Contents']:
            print(f"  📄 {obj['Key']} ({obj['Size']} bytes)")
    else:
        print("\n⚠️ Still no objects found")
        
except Exception as e:
    print(f"\n❌ Upload failed: {e}")
    import traceback
    traceback.print_exc()
