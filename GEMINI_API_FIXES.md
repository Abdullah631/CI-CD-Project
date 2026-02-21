# Gemini API and CV Parser Fixes

## Issues Fixed

### 1. **FutureWarning: Deprecated google.generativeai Package**
- **Problem**: The `google.generativeai` package is deprecated and no longer receives updates
- **Solution**: Migrated to the new `google.genai` package
  - Updated [cv_parser.py](loginapi/cv_parser.py) line 4: `import google.genai as genai`
  - Updated [requirements.txt](requirements.txt): replaced `google-generativeai` with `google-genai`

### 2. **DateTimeField Naive Datetime Warning**
- **Problem**: Using `datetime.utcnow()` causes RuntimeWarning when Django timezone support is active
- **Solution**: Switched to Django's timezone-aware `timezone.now()`
  - Updated [views.py](loginapi/views.py) line 1093 in `upload_cv()` function
  - Added `from django.utils import timezone` import
  - Changed: `user.cv_last_updated = datetime.utcnow()` → `user.cv_last_updated = timezone.now()`

### 3. **Gemini API Rate Limit (429 Error)**
- **Problem**: Free tier quota exceeded (limit: 20 requests/day), causing CV analysis to fail
- **Solution**: Implemented retry logic with exponential backoff
  - Added `import time` to cv_parser.py
  - Implemented automatic retry with exponential backoff (1s, 2s, 4s...)
  - Maximum 3 retry attempts before failing gracefully
  - Better error messages for users instead of technical API errors

### 4. **Improved Error Messages**
- **Before**: "Gemini API rate limit exceeded. Please try again later."
- **After**: "AI service is currently at capacity. Please try uploading your CV again in a few moments. If this persists, please contact support."
- Other errors also provide more helpful guidance

## Changes Made

### Files Modified:

1. **[cv_parser.py](loginapi/cv_parser.py)**
   - Line 4: Updated import statement
   - Line 8: Added `import time` for retry delays
   - Line 72: Updated docstring
   - Lines 170-212: Added retry logic with exponential backoff
   - Lines 249-260: Improved error messages for rate limits

2. **[views.py](loginapi/views.py)**
   - Line 1087: Added `from django.utils import timezone`
   - Line 1093: Changed `datetime.utcnow()` to `timezone.now()`

3. **[requirements.txt](requirements.txt)**
   - Replaced `google-generativeai` with `google-genai`

## How Retry Logic Works

```
Attempt 1: Immediate call
  ↓ (If rate limited)
Attempt 2: Wait 1 second, retry
  ↓ (If rate limited)
Attempt 3: Wait 2 seconds, retry
  ↓ (If rate limited)
Return error message to user
```

## Testing the Fixes

After deploying these changes:

1. **Install new package**: `pip install -r requirements.txt` or `pip install google-genai`
2. **Upload a CV**: Should not show FutureWarning anymore
3. **Check logs**: Should not show DateTimeField RuntimeWarning
4. **Test rate limits**: If you exceed API quota, system will retry automatically with backoff

## Additional Notes

- The new `google.genai` package is the official maintained version going forward
- Retry logic prevents immediate failure when API quota is hit
- Users receive friendly error messages instead of technical API errors
- All timezone-aware datetime operations are now consistent with Django best practices

## API Quota Considerations

**Free Tier Limits:**
- 20 requests per day (per model, per project)
- Must wait 25.5 seconds between batches when quota exceeded

**For Production:**
- Consider upgrading to a paid tier for higher limits
- Or implement caching to avoid reprocessing the same CVs
- Monitor usage at: https://ai.dev/usage?tab=rate-limit
