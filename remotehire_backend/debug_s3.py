"""Debug S3 Upload Issue"""
import boto3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get AWS credentials
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')

print(f"Bucket: {AWS_STORAGE_BUCKET_NAME}")
print(f"Region: {AWS_S3_REGION_NAME}")
print(f"Access Key: {AWS_ACCESS_KEY_ID}")

# Create S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_S3_REGION_NAME
)

print("\n" + "="*60)
print("Checking ALL objects in bucket (no prefix)...")
print("="*60)

try:
    response = s3_client.list_objects_v2(Bucket=AWS_STORAGE_BUCKET_NAME)
    
    if 'Contents' in response:
        print(f"\n✅ Found {len(response['Contents'])} objects:")
        for obj in response['Contents']:
            print(f"  📄 {obj['Key']}")
            print(f"     Size: {obj['Size']} bytes")
            print(f"     Last Modified: {obj['LastModified']}")
            print()
    else:
        print("\n⚠️ No objects found in bucket at all")
        
    # Check bucket location
    location = s3_client.get_bucket_location(Bucket=AWS_STORAGE_BUCKET_NAME)
    print(f"\n📍 Bucket Location: {location['LocationConstraint']}")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
