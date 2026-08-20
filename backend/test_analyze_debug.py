"""
Debug script to test each component of the analyze endpoint
"""
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

print("=" * 60)
print("MUSE ANALYZE ENDPOINT DEBUG TEST")
print("=" * 60)

# Test 1: Load audio file
print("\n1️⃣ Testing Audio File Access...")
audio_file = "uploads/call_recording_03.wav"
if os.path.exists(audio_file):
    print(f"✅ Audio file found: {audio_file}")
    file_size = os.path.getsize(audio_file)
    print(f"   Size: {file_size} bytes ({file_size/1024:.1f} KB)")
else:
    print(f"❌ Audio file NOT found: {audio_file}")
    sys.exit(1)

# Test 2: Whisper Transcription
print("\n2️⃣ Testing Whisper Transcription...")
try:
    from speech_to_text.whisper_asr import transcribe_audio
    transcript_result = transcribe_audio(audio_file, "auto", return_details=True)
    
    if transcript_result and transcript_result.get("text"):
        print(f"✅ Whisper transcription successful")
        print(f"   Text: {transcript_result['text'][:100]}...")
        print(f"   Language: {transcript_result['language']}")
        print(f"   Duration: {transcript_result['duration']}s")
    else:
        print("❌ Whisper transcription failed - no text returned")
        sys.exit(1)
except Exception as e:
    print(f"❌ Whisper transcription error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 3: Audio Feature Extraction
print("\n3️⃣ Testing Audio Feature Extraction...")
try:
    from audio_processing.audio_features import extract_audio_features, compute_audio_tone_score
    features = extract_audio_features(audio_file)
    
    if features:
        print(f"✅ Audio features extracted")
        print(f"   Features keys: {list(features.keys())}")
        print(f"   Pitch values: {len(features.get('pitch', []))} samples")
        print(f"   Energy values: {len(features.get('energy', []))} samples")
        
        tone_score = compute_audio_tone_score(features)
        print(f"   Tone score: {tone_score}")
    else:
        print("❌ Audio feature extraction failed")
        sys.exit(1)
except Exception as e:
    print(f"❌ Audio feature error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 4: Text Feature Extraction
print("\n4️⃣ Testing Text Feature Extraction...")
try:
    from text_processing.text_sarcasm import extract_text_features, predict_sarcasm
    
    text_input = transcript_result["text"]
    text_embedding = extract_text_features(text_input)
    
    if text_embedding is not None:
        print(f"✅ Text features extracted")
        print(f"   Embedding shape: {len(text_embedding)} dimensions")
        
        sarcasm_score = predict_sarcasm(text_embedding)
        print(f"   Sarcasm score: {sarcasm_score}")
    else:
        print("❌ Text feature extraction failed")
        sys.exit(1)
except Exception as e:
    print(f"❌ Text processing error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 5: Translation
print("\n5️⃣ Testing Translation (may take 30s on first run)...")
try:
    from translation.translate_router import translate_router
    
    translated = translate_router(text_input[:100], "English", "Telugu")
    
    if translated:
        print(f"✅ Translation successful")
        print(f"   Result: {translated[:100]}...")
    else:
        print("❌ Translation failed")
        sys.exit(1)
except Exception as e:
    print(f"❌ Translation error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 6: Sentiment Analysis
print("\n6️⃣ Testing Sentiment Analysis...")
try:
    from text_processing.sentiment import predict_sentiment  
    
    sentiment_label, sentiment_confidence = predict_sentiment(text_input)
    
    print(f"✅ Sentiment analysis successful")
    print(f"   Sentiment: {sentiment_label}")
    print(f"   Confidence: {sentiment_confidence}")
except Exception as e:
    print(f"❌ Sentiment analysis error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 7: Multimodal Fusion
print("\n7️⃣ Testing Multimodal Fusion...")
try:
    from fusion.multimodal_fusion import fuse_sarcasm
    
    final_score = fuse_sarcasm(sarcasm_score, tone_score)
    
    print(f"✅ Multimodal fusion successful")
    print(f"   Final sarcasm score: {final_score}")
except Exception as e:
    print(f"❌ Multimodal fusion error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ ALL TESTS PASSED - Analyze endpoint should work!")
print("=" * 60)
