@echo off
echo Restarting Backend Server...
echo.
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak >nul
cd /d "c:\Rishitha\MinorProject\MUSE\Muse_project\backend"
call venv311\Scripts\activate.bat
echo Starting Flask backend...
python app.py
