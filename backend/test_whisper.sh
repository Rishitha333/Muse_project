#!/bin/bash
# Faster-Whisper Quick Start Script

echo "============================================================"
echo "🚀 Testing Faster-Whisper Integration"
echo "============================================================"
echo ""

cd "$(dirname "$0")"

# Activate virtual environment
if [ -f "venv311/Scripts/activate.bat" ]; then
    source venv311/Scripts/activate
elif [ -f "venv311/bin/activate" ]; then
    source venv311/bin/activate
fi

echo "Running Faster-Whisper test..."
echo ""

python test_faster_whisper.py

echo ""
echo "============================================================"
echo "✅ Test Complete!"
echo "============================================================"
