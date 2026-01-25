@echo off
@echo off
setlocal enabledelayedexpansion

REM This batch file opens two separate Chrome windows with different user profiles
REM This allows testing video interview with both recruiter and candidate on same computer

echo ========================================
echo RemoteHire.io - Dual Chrome Camera Test
echo ========================================
echo.

REM Try to find Chrome in standard locations
set CHROME=
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" set "CHROME=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"

if "!CHROME!"=="" (
    echo ERROR: Chrome not found
    echo.
    echo Please ensure Google Chrome is installed in one of these locations:
    echo   - C:\Program Files\Google\Chrome\Application\
    echo   - C:\Program Files (x86)\Google\Chrome\Application\
    echo   - %LocalAppData%\Google\Chrome\Application\
    echo.
    pause
    exit /b 1
)

echo Chrome found: !CHROME!

echo.
echo Starting two Chrome windows for testing...
echo.

echo ========================================
echo INSTRUCTIONS:
echo ========================================
echo.
echo Window 1 (Recruiter):
echo   - Navigate to: http://localhost:5173
echo   - Sign in as RECRUITER
echo   - Go to Recruiter Dashboard
echo.
echo Window 2 (Candidate):
echo   - Navigate to: http://localhost:5173
echo   - Sign in as CANDIDATE
echo   - Accept the interview
echo.
echo Both windows should have independent camera access!
echo ========================================
echo.

REM Open Chrome with two different user profiles
echo Opening Recruiter window...
start "Recruiter Window" "" "!CHROME!" --profile-directory=Default http://localhost:5173

timeout /t 2 /nobreak

echo Opening Candidate window...
start "Candidate Window" "" "!CHROME!" --profile-directory="Guest Profile" http://localhost:5173

timeout /t 1 /nobreak

endlocal

echo.
echo Two Chrome windows opening...
echo Press any key to exit this script (Chrome will continue running)
pause
exit /b 0
