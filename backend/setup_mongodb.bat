@echo off
echo ============================================================
echo MongoDB Installation Guide for MUSE Project
echo ============================================================
echo.
echo Your project has been cleaned and configured for local MongoDB!
echo All MongoDB Atlas cloud files have been removed.
echo.
echo ============================================================
echo NEXT STEP: Install MongoDB Community Edition
echo ============================================================
echo.
echo 1. Opening MongoDB download page...
start https://www.mongodb.com/try/download/community-server
echo.
echo 2. Download Instructions:
echo    - Select: Windows
echo    - Version: 8.0 (or latest)
echo    - Package: MSI
echo    - Click "Download"
echo.
echo 3. Installation Steps:
echo    a) Run the downloaded .msi file
echo    b) Choose "Complete" installation
echo    c) CHECK: "Install MongoDB as a Service" ✓
echo    d) CHECK: "Install MongoDB Compass" ✓ (optional GUI)
echo    e) Click "Install"
echo.
echo 4. After installation, MongoDB will start automatically
echo.
pause
echo.
echo ============================================================
echo Verifying MongoDB Installation...
echo ============================================================
echo.

REM Check if MongoDB service exists
sc query MongoDB >nul 2>&1
if errorlevel 1 (
    echo ❌ MongoDB service not found
    echo    Please complete the installation first
    echo.
    echo    Make sure you checked:
    echo    - "Install MongoDB as a Service"
    echo.
    echo    Then restart this script.
    goto :end
)

REM Check if MongoDB is running
sc query MongoDB | findstr "RUNNING" >nul
if errorlevel 1 (
    echo ⚠️ MongoDB service exists but not running
    echo.
    echo Starting MongoDB...
    net start MongoDB
    echo.
) else (
    echo ✓ MongoDB is running!
)

echo.
echo ============================================================
echo Testing Database Connection...
echo ============================================================
echo.

cd %~dp0
call venv311\Scripts\activate.bat
python -c "from database.db_config import get_db; db = get_db(); print('✅ SUCCESS: Database ready to use!')" 2>nul

if errorlevel 1 (
    echo ❌ Connection test failed
    echo    Make sure MongoDB is running: net start MongoDB
) else (
    echo.
    echo ============================================================
    echo ✅ Installation Complete!
    echo ============================================================
    echo.
    echo Your MUSE project is ready to run with local MongoDB!
    echo.
    echo To start the backend:
    echo    start_backend.bat
    echo.
    echo To create a test user:
    echo    python create_test_user.py
    echo.
)

:end
echo.
pause
