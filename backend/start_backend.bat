@echo off
echo ========================================
echo Starting MUSE Backend with venv311
echo ========================================
echo.

cd /d "c:\Rishitha\MinorProject\MUSE\Muse_project\backend"

echo Activating venv311...
call venv311\Scripts\activate.bat

echo.
echo Python version:
python --version

echo.
echo Checking MongoDB...
sc query MongoDB | findstr "RUNNING" >nul
if errorlevel 1 (
    echo WARNING: MongoDB is not running!
    echo Please start MongoDB service first.
    pause
    exit /b 1
)
echo MongoDB: RUNNING

echo.
echo ========================================
echo Starting Flask backend on http://127.0.0.1:5000
echo ========================================
echo.
python app.py
