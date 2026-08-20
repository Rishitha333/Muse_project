from faster_whisper import WhisperModel
import os

# Load model once (important for performance)
# Using base model - options: tiny, base, small, medium, large-v2, large-v3
# Device: "cpu" or "cuda" for GPU
# Compute type: "int8" for CPU (faster), "float16" for GPU
model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8",  # Fast inference on CPU
    num_workers=4,        # Parallel processing
)

print("✅ Faster-Whisper model loaded: base (optimized)")

# Language name to ISO code mapping
LANGUAGE_CODES = {
    "auto detect": None,
    "auto": None,
    "english": "en",
    "spanish": "es",
    "french": "fr",
    "german": "de",
    "italian": "it",
    "portuguese": "pt",
    "dutch": "nl",
    "russian": "ru",
    "chinese": "zh",
    "japanese": "ja",
    "korean": "ko",
    "hindi": "hi",
    "bengali": "bn",
    "tamil": "ta",
    "telugu": "te",
    "malayalam": "ml",
    "kannada": "kn",
    "marathi": "mr",
    "gujarati": "gu",
    "urdu": "ur",
    "arabic": "ar",
    "turkish": "tr",
    "persian": "fa",
    "vietnamese": "vi",
    "thai": "th",
    "indonesian": "id",
    "malay": "ms",
    "filipino": "tl",
    "tagalog": "tl",
    "polish": "pl",
    "ukrainian": "uk",
    "romanian": "ro",
    "czech": "cs",
    "hungarian": "hu",
    "greek": "el",
    "hebrew": "he",
    "swedish": "sv",
    "danish": "da",
    "norwegian": "no",
    "finnish": "fi",
}

def normalize_language_code(lang):
    """Convert language name to ISO code for Whisper"""
    if not lang:
        return None
    
    lang_lower = lang.lower().strip()
    
    # Check if already an ISO code (2-3 letters)
    if len(lang_lower) <= 3 and lang_lower.isalpha():
        return lang_lower
    
    # Look up in mapping
    return LANGUAGE_CODES.get(lang_lower, None)

def transcribe_audio(audio_path, source_lang="auto", return_details=False):
    """
    Transcribe audio using Faster-Whisper (4x faster than standard Whisper)
    
    Args:
        audio_path (str): Path to audio file
        source_lang (str): Source language code or "auto" for auto-detection
        return_details (bool): If True, return dict with text, language, and other details
        
    Returns:
        str or dict: Transcribed text, or detailed result dictionary if return_details=True
    """
    try:
        # Configure transcription parameters
        # Convert language name to ISO code
        language = normalize_language_code(source_lang)
        
        # Transcribe with Faster-Whisper
        # Returns (segments, info)
        segments, info = model.transcribe(
            audio_path,
            language=language,
            beam_size=5,              # Balance between speed and accuracy
            vad_filter=True,          # Voice Activity Detection (removes silence)
            vad_parameters=dict(
                min_silence_duration_ms=500  # More aggressive silence removal
            ),
        )
        
        # Convert segments generator to list and extract text
        segments_list = list(segments)
        full_text = " ".join([segment.text for segment in segments_list]).strip()
        
        if return_details:
            # Calculate duration from segments
            duration = 0
            if segments_list:
                duration = segments_list[-1].end if segments_list else 0
            
            # Return detailed information
            return {
                "text": full_text,
                "language": info.language,
                "language_probability": round(info.language_probability, 2),
                "segments": len(segments_list),
                "duration": round(duration, 2),
                "detected_language": info.language
            }
        else:
            # Return just the text (backward compatibility)
            return full_text
            
    except Exception as e:
        print("Faster-Whisper transcription error:", e)
        import traceback
        traceback.print_exc()
        return None

