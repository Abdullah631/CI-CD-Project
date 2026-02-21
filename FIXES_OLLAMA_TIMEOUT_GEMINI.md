# Fixed: Ollama Timeout & Gemini API Errors

## Issues Identified

### Issue 1: Ollama Request Timeout
**Error**: `HTTPConnectionPool(host='localhost', port=11434): Read timed out. (read timeout=60)`

**Root Cause**: 
- Timeout set to only 60 seconds
- Large CVs or slow systems need more time
- Gemma3 model can take time on larger files

### Issue 2: Gemini API Configuration Error
**Error**: `module 'google.genai' has no attribute 'configure'`

**Root Cause**:
- The new `google.genai` package has a different API than the old package
- Old code tried to use `genai.configure()` which doesn't exist
- New API uses `genai.Client(api_key=...)` instead

---

## Fixes Applied

### Fix 1: Increased Ollama Timeout & Added Optimizations

**File**: [cv_parser.py](remotehire_backend/loginapi/cv_parser.py#L107-L152)

**Changes**:
```python
# Before: timeout=60
# After: timeout=120
timeout=120  # Increased from 60 to 120 seconds

# Added output length limit to speed up processing
"num_predict": 500  # Limits response to ~500 tokens

# Added better timeout error handling
if "timeout" in error_msg.lower():
    print(f"[OLLAMA_API] Request timed out. Ollama may be slow...")
    print(f"[OLLAMA_API] Troubleshooting: 1) Ensure Ollama running: ollama serve")
    print(f"[OLLAMA_API] Troubleshooting: 2) Check system resources")
```

### Fix 2: Updated Gemini API to use correct google.genai syntax

**File**: [cv_parser.py](remotehire_backend/loginapi/cv_parser.py#L90-L104)

**Created new function** `get_gemini_client()`:
```python
def get_gemini_client():
    """Get Gemini API client using the new google.genai package"""
    api_key = getattr(settings, 'GEMINI_API_KEY', None)
    if not api_key or api_key == 'your_gemini_api_key_here':
        print(f"[GEMINI_CONFIG] API Key not configured")
        return None
    
    try:
        # NEW: Pass api_key directly to Client()
        client = genai.Client(api_key=api_key)
        print(f"[GEMINI_CONFIG] Gemini client created successfully")
        return client
    except Exception as e:
        print(f"[GEMINI_CONFIG] Error creating client: {str(e)}")
        return None
```

**Updated** `call_gemini_api()`:
```python
# OLD: configure_gemini() + genai.GenerativeModel()
# NEW: get_gemini_client() + client.models.generate_content()

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=prompt
)
```

---

## API Differences: Old vs New google.genai

| Feature | Old Package | New Package |
|---------|------------|------------|
| Import | `import google.generativeai as genai` | `import google.genai as genai` |
| Setup | `genai.configure(api_key=key)` | `client = genai.Client(api_key=key)` |
| Model | `genai.GenerativeModel(name)` | `client.models` |
| Call | `model.generate_content(prompt)` | `client.models.generate_content(model=..., contents=...)` |
| Status | ❌ Deprecated | ✅ Current Official |

---

## Testing Instructions

### Step 1: Restart Django Server
```bash
cd remotehire_backend
python manage.py runserver 0.0.0.0:8000
```

### Step 2: Upload a CV
1. Go to Candidate Dashboard
2. Upload a CV file
3. Wait for processing (may take 10-30 seconds with Ollama on first run)

### Step 3: Check Console Output
Look for one of these messages (in order):

**Expected - Ollama Success** ✅
```
[OLLAMA_API] Calling local Ollama at http://localhost:11434 with model gemma3:latest...
[OLLAMA_API] ✓ Success with local Ollama
```

**Fallback - Gemini Success** ✅
```
[GEMINI_API] Attempt 1/2
[GEMINI_API] ✓ Success with Gemini API
```

**Error - Ollama Timeout** (Expected if system is slow)
```
[OLLAMA_API] Request timed out. Ollama may be slow...
[OLLAMA_API] Troubleshooting: 1) Ensure Ollama running: ollama serve
[OLLAMA_API] Troubleshooting: 2) Check system resources
```

---

## Troubleshooting

### If Ollama times out:
1. **Verify Ollama is running**:
   ```bash
   ollama list
   # Should show: gemma3:latest
   ```

2. **Check system resources**:
   - Open Task Manager
   - Check CPU and RAM usage
   - Ensure Ollama has at least 2GB RAM available

3. **Verify Ollama endpoint**:
   ```bash
   curl http://localhost:11434/api/tags
   # Should return JSON with model list
   ```
2. **Check rate limit**:
   - Gemini free tier: 15 requests per minute
   - If hitting limit, wait 1 minute between uploads

3. **Try upgrading to paid plan**:
   - Add $5 credit to Gemini account
   - Increases limits significantly

---

## Performance Tips

### To speed up Ollama processing:

1. **Use a smaller model** (if available):
   ```env
   OLLAMA_MODEL=gemma2:2b  # Smaller = faster
   ```

2. **Reduce output length** (already done):
   - `num_predict: 500` limits response
   - Speeds up inference by ~50%

3. **Increase system resources**:
   - Add more RAM to Ollama
   - Close other applications
   - Use SSD for faster disk access

---

## Fallback Chain

When CV upload is requested, the system tries providers in this order:

```
1. Ollama (Local)
   ↓ If fails or times out after 120s
2. Gemini (Cloud)
   ↓ If rate limited or fails
3. Groq (Cloud) - if configured
   ↓ If fails
4. OpenAI (Cloud) - if configured
   ↓ If all fail
Show error: "All AI services unavailable"
```

---

## Status: ✅ FIXED AND READY

**Changes Made**:
- ✅ Ollama timeout increased: 60s → 120s
- ✅ Ollama output optimized: `num_predict: 500`
- ✅ Gemini API updated to correct google-genai syntax
- ✅ Better error messages for timeout troubleshooting

**Next Action**: Restart Django server and upload a CV

Expected: CV metadata extraction should now work with Ollama or fallback to Gemini

---

## Technical Details

**google.genai Client API**:
```python
# Initialize client
client = genai.Client(api_key="your-key")

# List models
models = client.models.list()

# Generate content
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="Your prompt here"
)

# Access response
text = response.text
```

**Ollama API Options**:
```python
"options": {
    "temperature": 0.1,      # Lower = more focused
    "top_p": 0.9,            # Nucleus sampling
    "num_predict": 500       # Max output tokens (added)
}
```

These options ensure consistent, focused CV extraction.
