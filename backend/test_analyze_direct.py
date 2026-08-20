"""
Direct test of analyze logic - bypassing Flask
"""
import os
import sys

# Set up path
sys.path.insert(0, os.path.dirname(__file__))

print("=" * 60)
print("DIRECT ANALYZE LOGIC TEST")
print("=" * 60)

# Simulate analyze endpoint logic
audio_path = "uploads/call_recording_03.wav"
source_lang = "English"
target_lang = "Telugu"

result = {}
audio_tone_score = None
text_sarcasm_score = None

print(f"\n✅ Audio file: {audio_path}")
print(f"✅ Source lang: {source_lang}")
print(f"✅ Target lang: {target_lang}")

# STEP 1: Whisper Transcription
print("\n" + "="*60)
print("STEP 1: WHISPER TRANSCRIPTION")
print("="*60)
try:
    from speech_to_text.whisper_asr import transcribe_audio
    
    transcript_result = transcribe_audio(
        audio_path,
        source_lang,
        return_details=True
    )
    
    if not transcript_result or not transcript_result.get("text"):
        raise Exception("Whisper failed to transcribe audio")
    
    transcript = transcript_result["text"]
    detected_lang = transcript_result.get("language", "unknown")
    
    result["transcript"] = transcript
    result["detected_language"] = detected_lang
    result["transcript_length"] = len(transcript)
    result["word_count"] = len(transcript.split())
    
    print(f"✅ Transcript: {transcript[:100]}...")
    print(f"✅ Detected language: {detected_lang}")
    print(f"✅ Word count: {result['word_count']}")
    
except Exception as e:
    print(f"❌ ERROR in Whisper transcription: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# STEP 2: Translation
print("\n" + "="*60)
print("STEP 2: TRANSLATION")
print("="*60)
try:
    from translation.translate_router import translate_router
    
    effective_source_lang = (
        "English" if source_lang == "Auto Detect" else source_lang
    )
    
    if target_lang and target_lang.lower() != detected_lang.lower():
        print(f"🔄 Translating: {effective_source_lang} → {target_lang}")
        translated_text = translate_router(
            transcript,
            effective_source_lang,
            target_lang
        )
        result["translated_transcript"] = translated_text
        result["translation_successful"] = True
        print(f"✅ Translation complete")
        print(f"   First 100 chars: {translated_text[:100]}...")
    else:
        result["translated_transcript"] = transcript
        result["translation_skipped"] = True
        print("⏭️  Translation skipped (same language)")
        
except Exception as e:
    print(f"❌ ERROR in Translation: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# STEP 3: Audio Features
print("\n" + "="*60)
print("STEP 3: AUDIO FEATURE EXTRACTION")
print("="*60)
try:
    from audio_processing.audio_features import extract_audio_features, compute_audio_tone_score
    
    print("🔊 Extracting audio features...")
    audio_features = extract_audio_features(audio_path)
    
    if not audio_features:
        raise Exception("Audio feature extraction returned None")
    
    print(f"✅ Features extracted: {list(audio_features.keys())}")
    print(f"   Pitch samples: {len(audio_features.get('pitch', []))}")
    print(f"   Energy samples: {len(audio_features.get('energy', []))}")
    
    audio_tone_score = compute_audio_tone_score(audio_features)
    result["audio_tone_score"] = round(float(audio_tone_score), 3)
    
    if audio_tone_score >= 0.7:
        result["tone"] = "Frustrated"
    elif audio_tone_score >= 0.4:
        result["tone"] = "Neutral"
    else:
        result["tone"] = "Calm"
    
    print(f"✅ Tone score: {audio_tone_score}")
    print(f"✅ Tone classification: {result['tone']}")
    
    result["audio_processed"] = True
    
except Exception as e:
    print(f"❌ ERROR in Audio Feature Extraction: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# STEP 4: Text Sarcasm
print("\n" + "="*60)
print("STEP 4: TEXT SARCASM DETECTION")
print("="*60)
try:
    from text_processing.text_sarcasm import extract_text_features, predict_sarcasm
    
    text_input = result["transcript"]
    
    print("📝 Extracting text features (mBERT)...")
    text_embedding = extract_text_features(text_input)
    
    if text_embedding is None:
        raise Exception("Text embedding extraction returned None")
    
    print(f"✅ Text embedding shape: {text_embedding.shape}")
    
    text_sarcasm_score = predict_sarcasm(text_embedding)
    result["text_sarcasm_score"] = round(float(text_sarcasm_score), 3)
    result["text_processed"] = True
    
    print(f"✅ Text sarcasm score: {text_sarcasm_score}")
    
except Exception as e:
    print(f"❌ ERROR in Text Sarcasm Detection: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# STEP 5: Multimodal Fusion
print("\n" + "="*60)
print("STEP 5: MULTIMODAL FUSION")
print("="*60)
try:
    from fusion.multimodal_fusion import fuse_sarcasm
    
    if audio_tone_score is not None and text_sarcasm_score is not None:
        final_sarcasm = fuse_sarcasm(
            text_sarcasm_score,
            audio_tone_score
        )
        result["final_sarcasm_score"] = round(float(final_sarcasm), 3)
        print(f"✅ Final sarcasm score: {final_sarcasm}")
    else:
        result["final_sarcasm_score"] = None
        print("⏭️  Fusion skipped (missing scores)")
        
except Exception as e:
    print(f"❌ ERROR in Multimodal Fusion: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# STEP 6: Sentiment
print("\n" + "="*60)
print("STEP 6: SENTIMENT ANALYSIS")
print("="*60)
try:
    from text_processing.sentiment import predict_sentiment
    
    sentiment_text = result.get("transcript")
    
    if sentiment_text:
        sentiment_label, sentiment_confidence = predict_sentiment(sentiment_text)
        result["sentiment"] = sentiment_label
        result["sentiment_confidence"] = sentiment_confidence
        print(f"✅ Sentiment: {sentiment_label} ({sentiment_confidence})")
    else:
        print("⏭️  Sentiment skipped (no transcript)")
        
except Exception as e:
    print(f"❌ ERROR in Sentiment Analysis: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# FINAL RESULT
print("\n" + "="*60)
print("✅ ALL STEPS COMPLETED SUCCESSFULLY!")
print("="*60)
print(f"\nFinal Result Keys: {list(result.keys())}")
print(f"\nJSON Result:")
import json
print(json.dumps(result, indent=2, ensure_ascii=False))
