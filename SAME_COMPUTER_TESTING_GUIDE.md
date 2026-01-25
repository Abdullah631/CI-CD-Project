# How to Test Video Interview on Same Computer with Two Chrome Windows

This guide shows how to run both **Recruiter** and **Candidate** views on the same computer with **independent camera access**.

---

## The Problem

When running your app on one computer, opening two browser tabs connects them to the same browser session, which means:
- ❌ They share the same camera permission
- ❌ Only one can access the camera at a time
- ❌ Can't properly test video call features

## The Solution

Use **two separate Chrome profiles** with different user accounts signed in. This allows each "person" to have independent camera access.

---

## Prerequisites

1. **Google Chrome installed** (not Edge or other browsers)
2. **Backend running**: 
   ```powershell
   cd remotehire_backend
   python manage.py runserver 0.0.0.0:8000
   ```
3. **Frontend running**:
   ```powershell
   cd remotehire-frontend
   npm run dev
   ```

---

## Method 1: Using PowerShell Script (Recommended)

### Step 1: Run the Script

Open PowerShell and run:

```powershell
cd d:\d3\RemoteHire.io
.\run_two_chrome_interview.ps1
```

This will:
- ✅ Open Chrome Window 1 with **Default profile** (Recruiter)
- ✅ Open Chrome Window 2 with **Guest Profile** (Candidate)
- ✅ Both at `http://localhost:5173`
- ✅ Each with independent camera access

### Step 2: Sign In to Each Window

**In Window 1 (Recruiter):**
1. Sign in with your **Recruiter account**
2. Go to Recruiter Dashboard
3. Schedule or create an interview

**In Window 2 (Candidate):**
1. Sign in with your **Candidate account** (different login)
2. Go to Candidate Dashboard
3. Accept the interview from the recruiter
4. Click "Join Interview"

### Step 3: Allow Camera Permission

When the interview loads:
- Each window will ask for camera/microphone permission
- **Click "Allow"** in both windows
- Each window gets **independent camera access**
- You should see video from both sides!

---

## Method 2: Using Batch File

If you prefer a batch file instead:

```cmd
cd d:\d3\RemoteHire.io
run_two_chrome_interview.bat
```

Same steps as PowerShell method above.

---

## Method 3: Manual (Without Script)

If scripts don't work, do this manually:

### Open Chrome Window 1 (Recruiter):
```powershell
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
& $chrome --profile-directory=Default http://localhost:5173
```

### Open Chrome Window 2 (Candidate):
```powershell
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
& $chrome --profile-directory="Guest Profile" http://localhost:5173
```

---

## How It Works

| Aspect | Window 1 | Window 2 |
|--------|----------|----------|
| **Chrome Profile** | Default | Guest |
| **Signed In As** | Recruiter account | Candidate account |
| **Camera Access** | Independent | Independent |
| **URL** | http://localhost:5173 | http://localhost:5173 |
| **Role** | Recruiter Dashboard | Candidate Dashboard |

Each profile is completely separate:
- Different cookies/storage
- Different login sessions
- Different camera permissions
- Can both access camera simultaneously

---

## Troubleshooting

### Issue: "Chrome not found"
**Solution:** Ensure Chrome is installed in the standard location:
```
C:\Program Files\Google\Chrome\Application\chrome.exe
```

### Issue: Only one camera shows video
**Solution:** If you only have one physical webcam:
- One window will show your camera
- The other shows a black screen
- This is normal with a single camera
- Audio will still work on both sides

### Issue: One window shows "Camera in use"
**Solution:** 
- Chrome profiles are separate, but Windows camera is system-wide
- Only one app can use the camera at a time
- Try allowing both browsers in Windows camera settings
- Or test on two different computers instead

### Issue: Camera permission not prompted
**Solution:**
- Go to Chrome Settings → Privacy and Security → Camera
- Check that your site `http://localhost:5173` is allowed
- Add it to "Sites that can access your camera" if needed

---

## Testing Checklist

- [ ] Backend running on `0.0.0.0:8000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Two Chrome windows open with different profiles
- [ ] Recruiter account signed in Window 1
- [ ] Candidate account signed in Window 2
- [ ] Interview scheduled from recruiter side
- [ ] Candidate accepted interview
- [ ] Both clicked "Join Interview"
- [ ] Camera permission allowed on both windows
- [ ] Video visible on both sides (or audio if single camera)
- [ ] Microphone works both ways

---

## Advanced: Creating More Profiles

If you need more than 2 profiles:

```powershell
# List existing Chrome profiles
dir "$env:LOCALAPPDATA\Google\Chrome\User Data" | Where-Object { $_.PSIsContainer }

# Open with any profile
chrome.exe --profile-directory="Profile Name" http://localhost:5173
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Run PowerShell script | `.\run_two_chrome_interview.ps1` |
| Run batch file | `run_two_chrome_interview.bat` |
| Manual Window 1 | `chrome --profile-directory=Default http://localhost:5173` |
| Manual Window 2 | `chrome --profile-directory="Guest Profile" http://localhost:5173` |

---

**Now you can test the full video interview experience on one computer! 🎥📹**
