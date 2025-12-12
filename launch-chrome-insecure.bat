@echo off
echo Starting Chrome with insecure origin flag for testing...
echo This allows camera/microphone on http://192.168.100.12:5173
echo.

REM Try different Chrome installation paths
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --unsafely-treat-insecure-origin-as-secure="http://192.168.100.12:5173" --user-data-dir="C:\temp\chrome-test" "http://192.168.100.12:5173"
    goto :end
)

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --unsafely-treat-insecure-origin-as-secure="http://192.168.100.12:5173" --user-data-dir="C:\temp\chrome-test" "http://192.168.100.12:5173"
    goto :end
)

REM Try to find Chrome in user's local app data
if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    start "" "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" --unsafely-treat-insecure-origin-as-secure="http://192.168.100.12:5173" --user-data-dir="C:\temp\chrome-test" "http://192.168.100.12:5173"
    goto :end
)

echo ERROR: Chrome not found in default locations!
echo Please install Google Chrome or manually edit this script with the correct path.
pause
goto :end

:end
echo Chrome should now be starting...
echo If the camera still doesn't work, make sure to allow permissions when prompted.
timeout /t 3
