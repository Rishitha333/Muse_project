"""
NLLB-200 Translation Module
Meta's No Language Left Behind (NLLB) - 200 languages support
Uses facebook/nllb-200-distilled-600M for efficient translation
"""

from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch

# Cache loaded models (important for performance)
NLLB_MODEL_CACHE = {}
MODEL_NAME = "facebook/nllb-200-distilled-600M"  # Balanced model (600M params)
# Alternative: "facebook/nllb-200-1.3B" for better quality but slower
# Alternative: "facebook/nllb-200-distilled-1.3B" for best balance

# Extended language mapping for NLLB-200
# NLLB uses special language codes (eng_Latn, hin_Deva, etc.)
NLLB_LANG_MAP = {
    "English": "eng_Latn",
    "Tamil": "tam_Taml",
    "Hindi": "hin_Deva",
    "Telugu": "tel_Telu",
    "Kannada": "kan_Knda",
    "Malayalam": "mal_Mlym",
    "Marathi": "mar_Deva",
    "Bengali": "ben_Beng",
    "Gujarati": "guj_Gujr",
    "Punjabi": "pan_Guru",
    "Urdu": "urd_Arab",
    "Spanish": "spa_Latn",
    "French": "fra_Latn",
    "German": "deu_Latn",
    "Italian": "ita_Latn",
    "Portuguese": "por_Latn",
    "Russian": "rus_Cyrl",
    "Chinese": "zho_Hans",
    "Japanese": "jpn_Jpan",
    "Korean": "kor_Hang",
    "Arabic": "arb_Arab",
    "Turkish": "tur_Latn",
    "Vietnamese": "vie_Latn",
    "Thai": "tha_Thai",
    "Indonesian": "ind_Latn",
    "Malay": "zsm_Latn",
    "Filipino": "fil_Latn",
    "Dutch": "nld_Latn",
    "Polish": "pol_Latn",
    "Swedish": "swe_Latn",
    "Norwegian": "nob_Latn",
    "Danish": "dan_Latn",
    "Finnish": "fin_Latn",
    "Greek": "ell_Grek",
    "Hebrew": "heb_Hebr",
    "Czech": "ces_Latn",
    "Romanian": "ron_Latn",
    "Hungarian": "hun_Latn",
    # Add more as needed from NLLB's 200 languages
}


def get_supported_languages():
    """Return list of all supported languages"""
    return list(NLLB_LANG_MAP.keys())


def load_nllb_model():
    """Load NLLB model and tokenizer (cached)"""
    if "model" not in NLLB_MODEL_CACHE:
        print(f"🔄 Loading NLLB-200 model: {MODEL_NAME}")
        print("   (First load takes ~30-60 seconds, then cached)")
        
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
        
        # Move to GPU if available
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = model.to(device)
        
        NLLB_MODEL_CACHE["model"] = model
        NLLB_MODEL_CACHE["tokenizer"] = tokenizer
        NLLB_MODEL_CACHE["device"] = device
        
        print(f"✅ NLLB-200 loaded on {device}")
    
    return (
        NLLB_MODEL_CACHE["tokenizer"],
        NLLB_MODEL_CACHE["model"],
        NLLB_MODEL_CACHE["device"]
    )


def translate_with_nllb(text, source_lang, target_lang, max_length=512):
    """
    Translate text using NLLB-200 model
    
    Args:
        text (str): Text to translate
        source_lang (str): Source language (e.g., "English", "Tamil")
        target_lang (str): Target language (e.g., "Hindi", "French")
        max_length (int): Maximum length of generated translation
        
    Returns:
        str: Translated text or original text if translation fails
    """
    try:
        # Clean input
        source_lang = source_lang.strip() if source_lang else source_lang
        target_lang = target_lang.strip() if target_lang else target_lang
        
        # Skip if same language or auto-detect
        if source_lang == "Auto Detect":
            print("⚠️ Auto-detect selected, skipping translation")
            return text
        
        if source_lang == target_lang:
            print(f"⚠️ Same source and target language: {source_lang}")
            return text
        
        # Get NLLB language codes
        src_code = NLLB_LANG_MAP.get(source_lang)
        tgt_code = NLLB_LANG_MAP.get(target_lang)
        
        if not src_code or not tgt_code:
            print(f"⚠️ Language not supported by NLLB: {source_lang} → {target_lang}")
            print(f"   Available languages: {', '.join(get_supported_languages())}")
            return None  # Signal to use fallback
        
        print(f"🌐 NLLB Translation: {source_lang} ({src_code}) → {target_lang} ({tgt_code})")
        
        # Load model
        tokenizer, model, device = load_nllb_model()
        
        # Prepare input
        tokenizer.src_lang = src_code
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Get target language token ID
        # Fix for transformers 5.0.0 - use convert_tokens_to_ids instead of lang_code_to_id
        try:
            # Try new method (transformers 5.0+)
            forced_bos_token_id = tokenizer.convert_tokens_to_ids(tgt_code)
        except:
            # Fallback to old method
            forced_bos_token_id = tokenizer.lang_code_to_id.get(tgt_code, tokenizer.convert_tokens_to_ids(tgt_code))
        
        # Generate translation
        translated_tokens = model.generate(
            **inputs,
            forced_bos_token_id=forced_bos_token_id,
            max_length=max_length,
            num_beams=5,  # Beam search for better quality
            early_stopping=True
        )
        
        # Decode translation
        translated_text = tokenizer.batch_decode(
            translated_tokens,
            skip_special_tokens=True
        )[0]
        
        print(f"✅ Translation successful ({len(text)} → {len(translated_text)} chars)")
        return translated_text
        
    except Exception as e:
        print(f"❌ NLLB translation error: {e}")
        import traceback
        traceback.print_exc()
        return None  # Signal to use fallback


def is_nllb_supported(source_lang, target_lang):
    """Check if language pair is supported by NLLB"""
    src_code = NLLB_LANG_MAP.get(source_lang)
    tgt_code = NLLB_LANG_MAP.get(target_lang)
    return src_code is not None and tgt_code is not None


# For backward compatibility
translate_text = translate_with_nllb
