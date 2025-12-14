"""Test AWS credentials and presigned URL generation"""
import os
from dotenv import load_dotenv
import boto3

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME')

print("Testing AWS Credentials...")
print(f"Access Key: {AWS_ACCESS_KEY_ID}")
print(f"Secret Key: {AWS_SECRET_ACCESS_KEY[:10]}... (truncated)")
print(f"Bucket: {AWS_STORAGE_BUCKET_NAME}")
print(f"Region: {AWS_S3_REGION_NAME}")

# Test 1: List objects in bucket
print("\n" + "="*60)
print("Test 1: Listing objects in bucket")
print("="*60)

try:
    s3_client = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_S3_REGION_NAME
    )
    
    response = s3_client.list_objects_v2(Bucket=AWS_STORAGE_BUCKET_NAME)
    
    if 'Contents' in response:
        print(f"✅ Found {len(response['Contents'])} objects:")
        for obj in response['Contents']:
            print(f"  - {obj['Key']}")
    else:
        print("⚠️ No objects found")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

# Test 2: Generate presigned URL
print("\n" + "="*60)
print("Test 2: Generate presigned URL")
print("="*60)

try:
    # Pick first file if exists
    if 'Contents' in response and len(response['Contents']) > 0:
        file_key = response['Contents'][0]['Key']
        print(f"Generating presigned URL for: {file_key}")
        
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': AWS_STORAGE_BUCKET_NAME,
                'Key': file_key,
            },
            ExpiresIn=3600
        )
        
        print(f"✅ Generated URL:")
        print(f"{presigned_url}")
        
        # Test the URL
        print(f"\nTesting URL...")
        import requests
        resp = requests.head(presigned_url)
        print(f"Response status: {resp.status_code}")
        if resp.status_code == 200:
            print(f"✅ URL works!")
        else:
            print(f"❌ URL failed: {resp.text}")
            
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
