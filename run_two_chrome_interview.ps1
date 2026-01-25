# PowerShell script to open two Chrome instances for testing video interview on same computer
# This allows both Recruiter and Candidate to test with independent camera access

Write-Host "========================================"
Write-Host "RemoteHire.io - Dual Chrome Camera Test"
Write-Host "========================================"
Write-Host ""
Write-Host "Starting two Chrome windows for testing..."
Write-Host ""

# Find Chrome installation
$chromePath = $null
$possiblePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $chromePath = $path
        break
    }
}

if (!$chromePath) {
    Write-Host "ERROR: Chrome not found!" -ForegroundColor Red
    Write-Host "Please ensure Google Chrome is installed"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Chrome found: $chromePath" -ForegroundColor Green
Write-Host ""

# Display instructions
Write-Host "========================================"
Write-Host "INSTRUCTIONS:"
Write-Host "========================================"
Write-Host ""
Write-Host "Window 1 (Recruiter):" -ForegroundColor Cyan
Write-Host "  - Navigate to: http://localhost:5173"
Write-Host "  - Sign in as RECRUITER account"
Write-Host "  - Go to Recruiter Dashboard"
Write-Host "  - Schedule or view interview"
Write-Host ""
Write-Host "Window 2 (Candidate):" -ForegroundColor Yellow
Write-Host "  - Navigate to: http://localhost:5173"
Write-Host "  - Sign in as CANDIDATE account"
Write-Host "  - Accept the interview"
Write-Host "  - Click 'Join Interview'"
Write-Host ""
Write-Host "Both windows should have INDEPENDENT camera access!" -ForegroundColor Green
Write-Host ""
Write-Host "To allow camera access:"
Write-Host "  1. When prompted, click 'Allow' for camera/microphone"
Write-Host "  2. If only one camera available, one will be audio-only"
Write-Host ""
Write-Host "========================================"
Write-Host ""

# Create Chrome profile directories if they don't exist
$chromeUserDataPath = "$env:LOCALAPPDATA\Google\Chrome\User Data"

# Open two Chrome windows with different profiles
Write-Host "Opening Recruiter window (Default profile)..." -ForegroundColor Cyan
& $chromePath --profile-directory=Default "http://localhost:5173" &

# Wait a moment for first window to fully open
Start-Sleep -Seconds 2

Write-Host "Opening Candidate window (Guest Profile)..." -ForegroundColor Yellow
& $chromePath --profile-directory="Guest Profile" "http://localhost:5173" &

Write-Host ""
Write-Host "Two Chrome windows are opening..." -ForegroundColor Green
Write-Host ""
Write-Host "Press Enter to close this script (Chrome will continue running)"
Read-Host ""

exit 0
