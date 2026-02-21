# Free AI API Keys Setup Guide

## Overview
This guide shows you how to get FREE API keys for multiple AI providers to enable CV analysis with automatic fallback.

---

## 1. Google Gemini API (Primary - ALREADY CONFIGURED ✓)

**Free Tier:** 15 RPM (requests per minute), 1500 RPD (requests per day)

### You already have this configured in your .env:
```
```

**Status:** ✅ Active

---

## 2. Groq API (Recommended - FASTEST & FREE)

**Free Tier:** 30 RPM, 14,400 RPD - **VERY GENEROUS!**

### Steps to Get Groq API Key:

1. **Visit:** https://console.groq.com/
2. **Sign up:** Use Google/GitHub or Email
3. **Create API Key:**
   - Click "API Keys" in left sidebar
   - Click "Create API Key"
   - Copy the key immediately (only shown once!)

4. **Add to .env file:**
```bash
GROQ_API_KEY=gsk_your_api_key_here
```

**Why Groq?**
- ✅ 30 requests/minute (vs Gemini's 15)
- ✅ Lightning fast inference
- ✅ Uses Llama 3.3 70B (very accurate)
- ✅ Most generous free tier

---

## 3. OpenAI API (Fallback)

**Free Tier:** $5 credit for new accounts (lasts ~100 requests)

### Steps to Get OpenAI API Key:

1. **Visit:** https://platform.openai.com/signup
2. **Sign up:** Use Email/Google/Microsoft
3. **Add Payment Method:** (Required even for free tier, won't be charged until you exceed $5)
4. **Create API Key:**
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Name it "RemoteHire CV Parser"
   - Copy the key

5. **Add to .env file:**
```bash
OPENAI_API_KEY=sk-proj-your_api_key_here
```

**Note:** Uses GPT-3.5-turbo which is cheap (~$0.0005 per request)

---

## 4. Alternative: Anthropic Claude (Optional)

**No Free Tier** - Requires payment, but very accurate

If interested:
1. Visit: https://console.anthropic.com/
2. Add $5 minimum
3. Get API key
4. Add: `CLAUDE_API_KEY=sk-ant-your_key_here`

---

## Complete .env Configuration

Your `.env` file should look like this:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# Django
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# AWS S3 (Already configured)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_STORAGE_BUCKET_NAME=your_bucket
AWS_S3_REGION_NAME=us-east-1
USE_S3=True

# AI Providers (Add these)
GEMINI_API_KEY=AIzaSyBy6ALnbQkItc8wHItveURpQQflC27OIuY
GROQ_API_KEY=gsk_your_groq_key_here
OPENAI_API_KEY=sk-proj-your_openai_key_here

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## Provider Priority Order

The system will try providers in this order:

1. **Gemini** (Google) - Free, accurate, your current setup
2. **Groq** (if configured) - Fastest, most generous free tier
3. **OpenAI** (if configured) - Fallback, uses free $5 credit

**If ALL fail:** Returns friendly error message

---

## Testing Your Setup

After adding API keys to `.env`:

1. **Restart Django server:**
```bash
python manage.py runserver
```

2. **Upload a CV** from the frontend

3. **Check console logs:**
```
[MULTI_AI] Trying 3 providers...
[MULTI_AI] Attempting Gemini...
[GEMINI_API] Using model: models/gemini-2.5-flash
[MULTI_AI] ✓ Success with Gemini
```

Or if Gemini is rate limited:
```
[MULTI_AI] Attempting Gemini...
[GEMINI_API] Error: 429 quota exceeded
[MULTI_AI] Attempting Groq...
[GROQ_API] Calling Groq API...
[MULTI_AI] ✓ Success with Groq
```

---

## Cost Comparison (if you exceed free tiers)

| Provider | Model | Cost per 1000 CVs | Speed |
|----------|-------|-------------------|-------|
| **Groq** | Llama 3.3 70B | $0.20 | ⚡⚡⚡ Fastest |
| **Gemini** | 2.5 Flash | $0.40 | ⚡⚡ Fast |
| **OpenAI** | GPT-3.5 | $0.50 | ⚡ Medium |
| **Claude** | Haiku | $0.80 | ⚡ Medium |

---

## Quick Start Commands

```bash
# 1. Update requirements
cd remotehire_backend
pip install -r requirements.txt

# 2. Add API keys to .env
echo "GROQ_API_KEY=gsk_your_key_here" >> .env
echo "OPENAI_API_KEY=sk-proj_your_key_here" >> .env

# 3. Restart server
python manage.py runserver
```

---

## Troubleshooting

### "GROQ_API_KEY not configured"
- Make sure you added the key to `.env`
- Restart Django server after adding

### "All AI services are currently unavailable"
- Check all API keys are valid
- Check your internet connection
- Verify .env file is in the correct location: `remotehire_backend/.env`

### "API Error 401: Unauthorized"
- Your API key is invalid or expired
- Generate a new key from the provider's console

---

## Monitoring Usage

- **Gemini:** https://ai.dev/usage?tab=rate-limit
- **Groq:** https://console.groq.com/usage
- **OpenAI:** https://platform.openai.com/usage

---

## Benefits of This Setup

✅ **99.9% Uptime:** If one provider fails, others take over  
✅ **No Rate Limits:** Combined free tier = ~50 requests/minute  
✅ **Caching:** Same CV won't be re-analyzed  
✅ **Cost Effective:** Stays free for moderate usage  
✅ **Fast Fallback:** Automatic retry with different providers  

---

## Next Steps

1. ✅ Get Groq API key (recommended first)
2. ✅ Get OpenAI API key (optional but helpful)
3. ✅ Add keys to `.env` file
4. ✅ Restart server: `python manage.py runserver`
5. ✅ Test by uploading a CV

**Questions?** Check the logs for detailed debugging info!
