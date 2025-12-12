# HOW TO TEST VIDEO INTERVIEW ON TWO LAPTOPS

## Prerequisites

- Both laptops must be connected to the **SAME WiFi network**
- Find Laptop 1's IP address (run this in PowerShell on Laptop 1):
  ```
  ipconfig
  ```
  Look for "IPv4 Address" like `192.168.1.100` (yours will be different)

---

## ON LAPTOP 1 (Server - runs backend + frontend)

### Step 1: Start Django Backend

```powershell
cd remotehire_backend
python manage.py runserver 0.0.0.0:8000
```

### Step 2: Start Vite Frontend

Open a **new terminal** and run:

```powershell
cd remotehire-frontend
npm run dev -- --host
```

You'll see something like:

```
Local:   http://localhost:5173/
Network: http://192.168.1.100:5173/
```

**Copy the Network URL** (with your IP address)

---

## ON LAPTOP 2 (Client)

1. Open your browser
2. Go to the **Network URL** you copied from Laptop 1
   Example: `http://192.168.1.100:5173/`

---

## Testing the Video Interview

### On Laptop 1:

1. Sign in as **Recruiter**
2. Schedule an interview

### On Laptop 2:

1. Sign in as **Candidate** (different account)
2. Go to Candidate Interviews page
3. Accept the interview
4. Wait for the countdown (or set interview time to now)
5. Click "Join Interview"

### On Both Laptops:

- Click "Join Interview" when available
- Allow camera/microphone permissions
- You should see and hear each other!

---

## Troubleshooting

**Can't connect?**

- Make sure both laptops are on the same WiFi
- Check Windows Firewall - allow ports 5173 and 8000
- Make sure Django says `0.0.0.0:8000` not `127.0.0.1:8000`

**No video?**

- Allow camera permissions when prompted
- If one camera is in use, it will be audio-only (that's normal!)

---

## Quick Commands Reference

**Laptop 1 Terminal 1:**

```
cd remotehire_backend
python manage.py runserver 0.0.0.0:8000
```

**Laptop 1 Terminal 2:**

```
cd remotehire-frontend
npm run dev -- --host
```

**Laptop 2:**
Open browser → `http://YOUR_LAPTOP1_IP:5173/`

Done! 🎉
