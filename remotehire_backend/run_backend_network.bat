@echo off
echo Starting Django backend for network access...
echo.
echo Make sure to:
echo 1. Allow port 8000 in Windows Firewall
echo 2. Connect both devices to the same network
echo.
call venv\Scripts\activate.bat
python manage.py runserver 0.0.0.0:8000
pause
