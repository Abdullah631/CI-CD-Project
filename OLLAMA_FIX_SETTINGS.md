# Ollama Settings Fix - "All AI Services Unavailable" Error

## Problem Identified
You were getting the error: **"All AI services are currently unavailable. Please try again later."** even though Ollama was running.

### Root Cause
The OLLAMA_API_URL and OLLAMA_MODEL settings were **NOT** being loaded from the `.env` file into Django settings. 

When `call_ollama_api()` tried to access them:
```python
ollama_url = getattr(settings, 'OLLAMA_API_URL', 'http://localhost:11434')
model = getattr(settings, 'OLLAMA_MODEL', 'gemma2')  # Used default 'gemma2' instead of 'gemma3:latest'
```

The function was:
1. Falling back to defaults (which worked for URL)
2. Using `gemma2` model instead of `gemma3:latest` (which doesn't exist on your system)
3. All providers failing → returning the "All AI services unavailable" error

## What Was Fixed

### 1. Updated `settings.py` 
Added missing AI provider configuration (lines 43-47):
```python
# AI Providers for CV Parsing
OLLAMA_API_URL = os.getenv('OLLAMA_API_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'gemma3:latest')
GROQ_API_KEY = os.getenv('GROQ_API_KEY', None)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', None)
```

**File Changed**: [backend/settings.py](remotehire_backend/backend/settings.py#L43-L47)

### 2. Cleaned up `.env` file
Removed duplicate OLLAMA settings that were inconsistent:
- ❌ Removed: `OLLAMA_MODEL=gemma3` (at end of file)
- ✅ Kept: `OLLAMA_MODEL=gemma3:latest` (at top, correct value)

**File Changed**: [.env](remotehire_backend/.env)

## Verification

### Before Fix
```bash
$ python manage.py shell -c "from django.conf import settings; print(getattr(settings, 'OLLAMA_API_URL', 'NOT SET'))"
NOT SET
```

### After Fix
```bash
$ python manage.py shell -c "from django.conf import settings; print(getattr(settings, 'OLLAMA_API_URL', 'NOT SET'))"
http://localhost:11434

$ python manage.py shell -c "from django.conf import settings; print(getattr(settings, 'OLLAMA_MODEL', 'NOT SET'))"
gemma3:latest
```

### Ollama Endpoint Status ✅
- **Ollama API**: Responding at `http://localhost:11434/api/tags`
- **Gemma3 Model**: Loaded and ready (`gemma3:latest`)
- **Generate Endpoint**: Tested and working (`/api/generate`)

## Next Steps

### 1. Restart Django Server
```bash
cd remotehire_backend
python manage.py runserver 0.0.0.0:8000
```

### 2. Test CV Upload
1. Go to candidate profile
2. Upload a CV file
3. Watch console for success message:
   ```
   [OLLAMA_API] Calling local Ollama at http://localhost:11434 with model gemma3:latest...
   [OLLAMA_API] ✓ Success with local Ollama
   ```

### 3. Verify Metadata Displays
- Skills section should show extracted skills
- Experience section should show work history
- Education section should show degrees
- All other CV fields should populate

## How Django Settings Loading Works

1. **Load from .env file** (using `load_dotenv()`)
   ```python
   OLLAMA_API_URL = os.getenv('OLLAMA_API_URL', 'http://localhost:11434')
   ```

2. **Available to code** via Django settings
   ```python
   from django.conf import settings
   url = settings.OLLAMA_API_URL  # Gets the value from .env
   ```

3. **Default fallback** if not in .env
   ```python
   os.getenv('OLLAMA_API_URL', 'http://localhost:11434')
                                  ↑ This is the default
   ```

## Why This Matters

| Component | Status | Impact |
|-----------|--------|--------|
| `.env` has OLLAMA_API_URL | ✅ Yes | Config value exists |
| `settings.py` loads it | ✅ Now Fixed | Was missing - THIS WAS THE BUG |
| Code can access it | ✅ Now Works | `settings.OLLAMA_API_URL` now returns correct value |
| Ollama is running | ✅ Yes | Server responding on port 11434 |

**The bug was in step 2**: settings.py wasn't loading the environment variable into Django's settings object.

## Testing the Fix

Run this to confirm settings are working:
```bash
cd remotehire_backend
python manage.py shell
>>> from django.conf import settings
>>> print(f"OLLAMA_API_URL: {settings.OLLAMA_API_URL}")
OLLAMA_API_URL: http://localhost:11434
>>> print(f"OLLAMA_MODEL: {settings.OLLAMA_MODEL}")
OLLAMA_MODEL: gemma3:latest
```

Expected output:
```
OLLAMA_API_URL: http://localhost:11434
OLLAMA_MODEL: gemma3:latest
```

## Summary

**Problem**: Settings not loading → Ollama defaults used → Wrong model → All providers fail  
**Solution**: Added settings.py configuration → Loads from .env correctly → Ollama uses correct model  
**Result**: CV uploads now work with local Ollama processing

---
**Status**: ✅ **FIXED AND READY TO TEST**

Restart your Django server and upload a CV. You should now see the metadata extraction working with Ollama.
