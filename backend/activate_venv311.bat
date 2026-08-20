@echo off
REM Activate Python 3.11.9 virtual environment for MUSE project
REM Run this file to activate the environment: activate_venv311.bat

echo ========================================
echo Activating Python 3.11.9 environment
echo ========================================
echo.

call venv311\Scripts\activate.bat

echo.
echo ========================================
echo Environment activated successfully!
echo Python version: 3.11.9
echo ========================================
echo.
echo To run the Flask app:
echo   python app.py
echo.
echo To test NLLB-200:
echo   python test_nllb.py
echo.
echo To deactivate:
echo   deactivate
echo ========================================
