@echo off
echo ============================================================
echo MUSE AUDIO ANALYSIS - QUICK TEST
echo ============================================================
echo.
echo Testing backend /analyze endpoint with different scenarios...
echo.

echo [TEST 1] English audio (no translation)
echo -----------------------------------------
curl -X POST http://127.0.0.1:5000/analyze -F "audio=@backend/uploads/call_recording_03.wav" -F "source_lang=Auto Detect" -F "target_lang=English"
echo.
echo.

echo [TEST 2] English to Telugu translation
echo -----------------------------------------
echo (This may take 30-60 seconds on first run while NLLB model loads...)
curl -X POST http://127.0.0.1:5000/analyze -F "audio=@backend/uploads/call_recording_03.wav" -F "source_lang=English" -F "target_lang=Telugu"
echo.
echo.

echo ============================================================
echo TESTS COMPLETE
echo ============================================================
echo.
echo If both tests succeeded, your backend is fully functional!
echo.
echo Next step: Test from frontend at http://localhost:5174/analyze
echo.
pause
