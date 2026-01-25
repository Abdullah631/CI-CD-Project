#!/usr/bin/env python3
"""
Open two Chrome windows with different profiles for testing video interview
This allows both Recruiter and Candidate to test on the same computer
"""

import subprocess
import os
import sys
import time

def find_chrome():
    """Find Chrome installation path"""
    possible_paths = [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        os.path.expandvars("%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe"),
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    return None

def main():
    print("=" * 48)
    print("RemoteHire.io - Dual Chrome Camera Test")
    print("=" * 48)
    print()
    
    # Find Chrome
    chrome_path = find_chrome()
    
    if not chrome_path:
        print("ERROR: Chrome not found!")
        print()
        print("Please ensure Google Chrome is installed in one of these locations:")
        for path in [
            "C:\\Program Files\\Google\\Chrome\\Application\\",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\",
            os.path.expandvars("%LocalAppData%\\Google\\Chrome\\Application\\"),
        ]:
            print(f"  - {path}")
        print()
        input("Press Enter to exit...")
        sys.exit(1)
    
    print(f"Chrome found: {chrome_path}")
    print()
    
    print("=" * 48)
    print("INSTRUCTIONS:")
    print("=" * 48)
    print()
    print("Window 1 (Recruiter):")
    print("  - Navigate to: http://localhost:5173")
    print("  - Sign in as RECRUITER")
    print("  - Go to Recruiter Dashboard")
    print()
    print("Window 2 (Candidate):")
    print("  - Navigate to: http://localhost:5173")
    print("  - Sign in as CANDIDATE")
    print("  - Accept the interview")
    print()
    print("Both windows should have independent camera access!")
    print("=" * 48)
    print()
    
    print("Opening Recruiter window (Default profile)...")
    subprocess.Popen([
        chrome_path,
        "--profile-directory=Default",
        "http://localhost:5173"
    ])
    
    print("Waiting 2 seconds...")
    time.sleep(2)
    
    print("Opening Candidate window (Guest Profile)...")
    subprocess.Popen([
        chrome_path,
        '--profile-directory=Guest Profile',
        "http://localhost:5173"
    ])
    
    print()
    print("Two Chrome windows opening...")
    print()
    print("Press Enter to exit (Chrome will continue running)")
    input()
    
    print("Goodbye!")

if __name__ == "__main__":
    main()
