import boto3
from dotenv import load_dotenv
import os

load_dotenv()

print("Testing AWS S3 connection...")
print(f"Bucket: {os.getenv('AWS_STORAGE_BUCKET_NAME')}")
print(f"Region: {os.getenv('AWS_S3_REGION_NAME')}")

try:
    s3 = boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_S3_REGION_NAME')
    )
    
    bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME')
    
    print(f"\n✅ Credentials loaded successfully!")
    print(f"Testing bucket access: {bucket_name}")
    
    # Test bucket access directly (doesn't need ListAllMyBuckets permission)
    try:
        # Try to list objects in the bucket
        s3.list_objects_v2(Bucket=bucket_name, MaxKeys=1)
        print(f"✅ Bucket '{bucket_name}' is accessible!")
        
        # Test upload permission
        test_key = 'media/test-connection.txt'
        s3.put_object(
            Bucket=bucket_name,
            Key=test_key,
            Body=b'RemoteHire.io S3 test successful!'
        )
        print(f"✅ Upload test: SUCCESS")
        
        # Test read permission
        obj = s3.get_object(Bucket=bucket_name, Key=test_key)
        print(f"✅ Read test: SUCCESS")
        
        # Clean up test file
        s3.delete_object(Bucket=bucket_name, Key=test_key)
        print(f"✅ Delete test: SUCCESS")
        
        print(f"\n🎉 All S3 operations working perfectly!")
        print(f"📝 Your app is now configured to use AWS S3 for CV storage.")
        print(f"\n✨ AWS S3 is ACTIVE and ready to store CVs!")
        
    except Exception as e:
        print(f"\n⚠️  Bucket access failed: {str(e)}")
        if 'NoSuchBucket' in str(e):
            print(f"\n❌ Bucket '{bucket_name}' does not exist.")
            print(f"Create it in AWS Console: https://s3.console.aws.amazon.com/s3/buckets")
        elif 'AccessDenied' in str(e):
            print(f"\n❌ Your IAM user doesn't have permissions for this bucket.")
            print(f"Add S3 permissions in IAM Console.")
        
except Exception as e:
    print(f"\n❌ Connection failed: {str(e)}")
    print("\nPlease check:")
    print("1. AWS_ACCESS_KEY_ID is correct")
    print("2. AWS_SECRET_ACCESS_KEY is correct")
    print("3. IAM user has S3 permissions")
