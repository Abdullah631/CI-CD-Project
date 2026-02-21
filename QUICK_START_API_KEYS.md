# 🚀 Quick Setup: Get Your API Keys in 10 Minutes

## 1. Groq (FASTEST - Do This First!)

**Time:** 2 minutes | **Free Tier:** 30 requests/minute

```bash
# Step 1: Visit
https://console.groq.com/

# Step 2: Sign up with Google/GitHub

# Step 3: Click "API Keys" → "Create API Key"

# Step 4: Copy key and add to .env:
GROQ_API_KEY=gsk_your_key_here
```

---

## 2. OpenAI (Reliable Fallback)

**Time:** 5 minutes | **Free Tier:** $5 credit (~100 requests)

```bash
# Step 1: Visit
https://platform.openai.com/signup

# Step 2: Sign up

# Step 3: Go to API Keys
https://platform.openai.com/api-keys

# Step 4: Create key and add to .env:
OPENAI_API_KEY=sk-proj_your_key_here
```

---

## 3. Update .env File

```bash
cd remotehire_backend
nano .env  # or use any text editor
```

Add these lines:
```bash
GROQ_API_KEY=gsk_your_actual_key_here
OPENAI_API_KEY=sk-proj_your_actual_key_here
```

---

## 4. Restart Server

```bash
# Terminal 1 (Backend)
cd remotehire_backend
python manage.py runserver

# Terminal 2 (Frontend) 
cd remotehire-frontend
npm run dev
```

---

## 5. Test It!

1. Go to candidate profile page
2. Upload a CV
3. Check console logs:
   ```
   [MULTI_AI] ✓ Success with Groq
   ```

4. Upload the SAME CV again:
   ```
   [CV_METADATA] ✓ Using cached metadata
   ⚡ 30x faster!
   ```

---

## ✅ You're Done!

**What You Have Now:**
- ✅ 3 AI providers (Gemini + Groq + OpenAI)
- ✅ Automatic fallback if one fails
- ✅ Smart caching (95% faster for repeat uploads)
- ✅ ~60 requests/minute capacity

**No API Keys Yet?**
- System still works with just Gemini (your current setup)
- Add keys anytime to improve reliability

---

## 📞 Quick Links

- Groq Console: https://console.groq.com/
- OpenAI Dashboard: https://platform.openai.com/
- Full Guide: See `AI_API_KEYS_SETUP.md`
