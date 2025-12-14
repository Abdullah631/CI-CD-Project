@echo off
echo ========================================
echo RemoteHire.io - Network Mode Launcher
echo ========================================
echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.
echo Starting backend server...
python run_network.py
pause
