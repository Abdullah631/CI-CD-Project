# Network Testing Guide for RemoteHire.io

## Setup Instructions

### 1. Start Backend (on your main laptop)

**Option A - Using the helper script:**
```bash
cd remotehire_backend
start_network.bat
```

**Option B - Manual:**
```bash
cd remotehire_backend
.\venv\Scripts\Activate
python manage.py runserver 0.0.0.0:8000
```

The script will display your IP address (e.g., 192.168.1.100)

### 2. Start Frontend (on your main laptop)

```bash
cd remotehire-frontend
npm run dev -- --host
```

The `--host` flag makes Vite accessible from other devices on the network.

### 3. Access from Another Laptop

**On the other laptop (same network):**

1. Open a browser
2. Go to: `http://YOUR_IP:5173`
   - Replace YOUR_IP with the IP shown by the backend script
   - Example: `http://192.168.1.100:5173`

The frontend will automatically use `http://YOUR_IP:8000` for API calls.

## Troubleshooting

### Backend not accessible?

1. **Check Windows Firewall:**
   - Press Win + R, type `wf.msc`, press Enter
   - Click "Inbound Rules" > "New Rule"
   - Choose "Port" > Next
   - Enter port: 8000
   - Allow the connection
   - Apply to all profiles
   - Name it "Django Dev Server"

2. **Verify backend is running on 0.0.0.0:**
   - Look for: "Starting development server at http://0.0.0.0:8000/"
   - NOT "http://127.0.0.1:8000/"

### Frontend not accessible?

1. **Check Vite is running with --host:**
   ```bash
   npm run dev -- --host
   ```

2. **Vite will show:**
   ```
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.1.100:5173/
   ```

3. **Windows Firewall for port 5173:**
   - Same steps as backend, but use port 5173

### Can't find your IP?

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet)

**The IP you need:**
- Usually starts with: 192.168.x.x or 10.0.x.x
- NOT 127.0.0.1 or 0.0.0.0

## Quick Test

1. On main laptop - visit: `http://localhost:5173` (should work)
2. On main laptop - visit: `http://YOUR_IP:5173` (should work)
3. On other laptop - visit: `http://YOUR_IP:5173` (should work)

If step 2 works but step 3 doesn't, it's a firewall issue.

## Security Note

⚠️ This configuration is for local network testing only!
- Never expose this to the public internet
- CORS is set to allow all origins for development
- Django DEBUG is True
