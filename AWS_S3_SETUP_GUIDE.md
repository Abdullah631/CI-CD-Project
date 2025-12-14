# AWS S3 Setup Guide for RemoteHire.io CV Storage

## 🎯 Overview

Your application now supports **both local file storage** (development) and **AWS S3** (production). You can switch between them anytime.

## 📋 Prerequisites

- AWS Account (Free tier available)
- Credit card for AWS verification (won't be charged on free tier)

---

## 🚀 Step-by-Step AWS S3 Setup

### Step 1: Create AWS Account

1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the registration process
4. **Free tier includes**: 5GB S3 storage, 20,000 GET requests, 2,000 PUT requests/month

### Step 2: Create S3 Bucket

1. **Login to AWS Console**: https://console.aws.amazon.com/
2. **Search for "S3"** in the services search bar
3. Click **"Create bucket"**
4. **Configure bucket:**
   - **Bucket name**: `remotehire-cv-storage` (must be globally unique, change if needed)
   - **Region**: Select closest to your users (e.g., `us-east-1`)
   - **Block Public Access**: ✅ **Keep all blocked** (files will be private with signed URLs)
   - **Versioning**: Optional (recommended for backup)
   - **Encryption**: Enable server-side encryption (recommended)
5. Click **"Create bucket"**

### Step 3: Create IAM User for Django

1. **Go to IAM**: https://console.aws.amazon.com/iam/
2. Click **"Users"** → **"Create user"**
3. **User name**: `remotehire-django-app`
4. Click **"Next"**
5. **Permissions**: Select **"Attach policies directly"**
6. Search and select: **"AmazonS3FullAccess"** (for simplicity)
   - For production, use custom policy with minimal permissions (see below)
7. Click **"Next"** → **"Create user"**

### Step 4: Generate Access Keys

1. Click on the newly created user (`remotehire-django-app`)
2. Go to **"Security credentials"** tab
3. Scroll to **"Access keys"**
4. Click **"Create access key"**
5. Select **"Application running outside AWS"**
6. Click **"Next"** → **"Create access key"**
7. **⚠️ IMPORTANT**: Copy both:
   - **Access key ID** (looks like: `AKIAIOSFODNN7EXAMPLE`)
   - **Secret access key** (looks like: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
   - **Save these securely** - you won't see the secret again!

### Step 5: Configure Django

**Update your `.env` file:**

```env
# AWS S3 Configuration
USE_S3=True  # Change to True to enable S3
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE  # Your actual key
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY  # Your actual secret
AWS_STORAGE_BUCKET_NAME=remotehire-cv-storage  # Your bucket name
AWS_S3_REGION_NAME=us-east-1  # Your bucket region
```

### Step 6: Test the Setup

1. Restart your Django server
2. Upload a test CV through your application
3. Check your S3 bucket - you should see the file in `media/resumes/` folder
4. Try downloading/viewing the CV

---

## 🔒 Production Security Best Practices

### Minimal IAM Policy (Recommended for Production)

Instead of `AmazonS3FullAccess`, create custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::remotehire-cv-storage",
        "arn:aws:s3:::remotehire-cv-storage/*"
      ]
    }
  ]
}
```

To apply:

1. IAM → Policies → Create policy
2. JSON tab → paste above (change bucket name)
3. Name it: `RemoteHireS3Policy`
4. Attach to your IAM user

---

## 📊 API Endpoints Overview

### CV Upload

```http
POST /api/candidate/upload-cv/
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: cv=<file>
```

### Download CV

```http
GET /api/candidate/<user_id>/cv/download/
Authorization: Bearer <token>
```

**Returns**:

- **S3**: Presigned URL (valid 1 hour)
- **Local**: Direct file download

### View CV (Inline)

```http
GET /api/candidate/<user_id>/cv/view/
Authorization: Bearer <token>
```

**Returns**:

- **S3**: Presigned URL for inline viewing
- **Local**: PDF displayed in browser

### Delete CV

```http
DELETE /api/candidate/delete-cv/
Authorization: Bearer <token>
```

### Get CV Metadata

```http
GET /api/candidate/<user_id>/cv-metadata/
Authorization: Bearer <token>
```

---

## 🔄 Switching Between Local and S3

### Use Local Storage (Development)

```env
USE_S3=False
```

- Files stored in `remotehire_backend/media/resumes/`
- Good for local testing

### Use S3 (Production)

```env
USE_S3=True
```

- Files stored in AWS S3 bucket
- Scalable and reliable

---

## 💰 Cost Estimation

### AWS S3 Free Tier (First 12 months)

- ✅ 5 GB storage
- ✅ 20,000 GET requests
- ✅ 2,000 PUT requests

### After Free Tier (Pay as you go)

**Scenario**: 1,000 users, average CV size 500KB

- **Storage**: 500MB = $0.01/month
- **Requests**: ~1,000 uploads + 5,000 views = $0.05/month
- **Total**: ~$0.06/month

**Scenario**: 100,000 users

- **Storage**: 50GB = $1.15/month
- **Total**: ~$5-10/month

---

## 🛡️ Security Features Implemented

✅ **Private files**: All CVs are private by default  
✅ **Presigned URLs**: Time-limited access (1 hour)  
✅ **Authorization**: Candidates can only access own CV, recruiters can access all  
✅ **File validation**: Only PDF, DOC, DOCX, TXT allowed  
✅ **Secure deletion**: Files removed from S3 when deleted  
✅ **No public access**: S3 bucket blocks all public access

---

## 🧪 Testing Checklist

- [ ] Create AWS account
- [ ] Create S3 bucket
- [ ] Create IAM user with S3 access
- [ ] Generate access keys
- [ ] Update `.env` with credentials
- [ ] Set `USE_S3=True`
- [ ] Restart Django server
- [ ] Upload test CV
- [ ] Verify file in S3 console
- [ ] Test download endpoint
- [ ] Test view endpoint
- [ ] Test delete endpoint
- [ ] Monitor AWS costs in billing dashboard

---

## 🆘 Troubleshooting

### Error: "Access Denied"

- Check IAM user has S3 permissions
- Verify access keys are correct
- Ensure bucket name matches

### Error: "Bucket not found"

- Check bucket name spelling
- Verify region is correct
- Ensure bucket exists in AWS console

### Error: "Invalid signature"

- Check AWS secret key is correct
- Verify region matches bucket region
- Check system time is correct

### Files not appearing in S3

- Verify `USE_S3=True` in `.env`
- Check Django server was restarted
- Look for errors in Django console

---

## 📚 Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Django Storages Documentation](https://django-storages.readthedocs.io/)
- [Boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)
- [AWS Free Tier Details](https://aws.amazon.com/free/)

---

## ✅ Summary

Your RemoteHire.io application now has:

- ✅ Complete AWS S3 integration
- ✅ Secure CV upload/download/view/delete
- ✅ Works with both local and cloud storage
- ✅ Production-ready scalability
- ✅ Cost-effective solution

**Current status**: Using **local storage** (development)  
**To go live**: Set `USE_S3=True` and add AWS credentials
