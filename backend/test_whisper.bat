@echo off
echo ============================================================
echo Testing Faster-Whisper Integration
echo ============================================================
echo.

cd /d %~dp0

echo Activating virtual environment...
call venv311\Scripts\activate.bat

echo.
echo Running test...
python test_faster_whisper.py

echo.
echo ============================================================
echo Test Complete!
echo ============================================================
pause
