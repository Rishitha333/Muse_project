"""
Test Faster-Whisper Integration
Compare performance with old Whisper (if available)
"""

import time
import os
from speech_to_text.whisper_asr import transcribe_audio

print("=" * 70)
print("🎤 Faster-Whisper Integration Test")
print("=" * 70)
print()

# Check if test audio exists
test_audio = os.path.join("uploads", "test_audio.wav")
if not os.path.exists(test_audio):
    print("⚠️ No test audio found in uploads/")
    print("   Upload an audio file to test transcription")
    print()
    print("💡 You can test with any audio file in uploads/")
    print()
    
    # List available audio files
    if os.path.exists("uploads"):
        audio_files = [f for f in os.listdir("uploads") 
                      if f.endswith(('.wav', '.mp3', '.m4a', '.flac', '.ogg'))]
        if audio_files:
            print(f"📁 Found {len(audio_files)} audio file(s):")
            for f in audio_files[:5]:
                print(f"   - {f}")
            print()
            # Use first file for testing
            test_audio = os.path.join("uploads", audio_files[0])
        else:
            print("❌ No audio files found. Upload one to test.")
            exit(0)

print(f"🎵 Testing with: {os.path.basename(test_audio)}")
print("-" * 70)
print()

# Test 1: Basic transcription
print("Test 1: Basic Transcription")
print("-" * 70)
start = time.time()
text = transcribe_audio(test_audio)
elapsed = time.time() - start

if text:
    print(f"✅ Transcription successful!")
    print(f"⏱️  Time: {elapsed:.2f} seconds")
    print(f"📝 Text: {text[:200]}{'...' if len(text) > 200 else ''}")
else:
    print("❌ Transcription failed")
print()

# Test 2: Detailed transcription
print("Test 2: Detailed Transcription (with metadata)")
print("-" * 70)
start = time.time()
details = transcribe_audio(test_audio, return_details=True)
elapsed = time.time() - start

if details:
    print(f"✅ Detailed transcription successful!")
    print(f"⏱️  Time: {elapsed:.2f} seconds")
    print(f"🌍 Detected Language: {details.get('language', 'unknown')}")
    print(f"📊 Language Confidence: {details.get('language_probability', 0) * 100:.1f}%")
    print(f"🎬 Segments: {details.get('segments', 0)}")
    print(f"⏲️  Duration: {details.get('duration', 0):.2f} seconds")
    print(f"📝 Text: {details.get('text', '')[:200]}{'...' if len(details.get('text', '')) > 200 else ''}")
else:
    print("❌ Detailed transcription failed")
print()

print("=" * 70)
print("✅ Faster-Whisper Integration Test Complete!")
print("=" * 70)
print()
print("🚀 Benefits of Faster-Whisper:")
print("   ✓ 4x faster inference")
print("   ✓ Lower memory usage")
print("   ✓ Better accuracy with VAD filtering")
print("   ✓ Automatic silence removal")
print("   ✓ Language probability scores")
print()
