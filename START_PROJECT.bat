@echo off
echo ============================================================
echo MUSE Project - Quick Start Guide
echo ============================================================
echo.
echo Checking system status...
echo.

REM Check MongoDB
echo [1/3] MongoDB Status:
sc query MongoDB | findstr "RUNNING" >nul
if errorlevel 1 (
    echo     ❌ MongoDB is NOT running
    echo     Starting MongoDB...
    net start MongoDB >nul 2>&1
    if errorlevel 1 (
        echo     ❌ Failed to start MongoDB
        echo     Run: setup_mongodb.bat
        pause
        exit /b 1
    )
    echo     ✅ MongoDB started
) else (
    echo     ✅ MongoDB is running
)
echo.

REM Check Backend
echo [2/3] Backend Status:
curl -s http://127.0.0.1:5000/health >nul 2>&1
if errorlevel 1 (
    echo     ❌ Backend is NOT running
    echo     Starting backend...
    start "MUSE Backend" cmd /k "cd /d %~dp0 && venv311\Scripts\activate && python app.py"
    timeout /t 5 /nobreak >nul
    echo     ✅ Backend started at http://127.0.0.1:5000
) else (
    echo     ✅ Backend is running at http://127.0.0.1:5000
)
echo.

REM Check Frontend
echo [3/3] Frontend Status:
curl -s http://localhost:5173 >nul 2>&1
if not errorlevel 1 (
    echo     ✅ Frontend is running at http://localhost:5173
    goto :summary
)

curl -s http://localhost:5174 >nul 2>&1
if not errorlevel 1 (
    echo     ✅ Frontend is running at http://localhost:5174
    goto :summary
)

echo     ❌ Frontend is NOT running
echo     Starting frontend...
cd ..\frontend
start "MUSE Frontend" cmd /k "npm run dev"
echo     ⏳ Frontend starting... (opens in new window)
echo.

:summary
echo ============================================================
echo ✅ MUSE Project Status
echo ============================================================
echo.
echo Access your application:
echo.
echo 🌐 Frontend: http://localhost:5174 (or 5173)
echo 🔧 Backend:  http://127.0.0.1:5000
echo 💾 MongoDB:  Running locally
echo.
echo ============================================================
echo 📋 Quick Commands
echo ============================================================
echo.
echo Create test user:
echo     cd backend
echo     venv311\Scripts\activate
echo     python create_test_user.py
echo.
echo Test Login:
echo     Email: test@muse.com
echo     Password: test123
echo.
echo ============================================================
echo.
pause
