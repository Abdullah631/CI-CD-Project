"""
Helper script to run Django server accessible on local network
"""
import socket
import subprocess
import sys

def get_local_ip():
    """Get the local IP address of this machine"""
    try:
        # Create a socket and connect to an external address
        # This doesn't actually send data, just determines the local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "Unable to determine IP"

def main():
    local_ip = get_local_ip()
    
    print("=" * 60)
    print("🚀 RemoteHire.io Backend - Network Mode")
    print("=" * 60)
    print(f"\n📡 Your local IP address: {local_ip}")
    print(f"\n✅ Backend will be accessible at:")
    print(f"   - http://localhost:8000 (this machine)")
    print(f"   - http://{local_ip}:8000 (other devices on network)")
    print(f"\n📱 Frontend should be accessed at:")
    print(f"   - http://{local_ip}:5173 (from other devices)")
    print("\n" + "=" * 60)
    print("Starting Django server on 0.0.0.0:8000...")
    print("Press Ctrl+C to stop the server")
    print("=" * 60 + "\n")
    
    # Run Django server on 0.0.0.0 to accept connections from any IP
    try:
        subprocess.run([
            sys.executable,
            "manage.py",
            "runserver",
            "0.0.0.0:8000"
        ])
    except KeyboardInterrupt:
        print("\n\n✋ Server stopped")

if __name__ == "__main__":
    main()
