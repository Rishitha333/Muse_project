from translation.marian_translate import translate_text as marian_translate
from translation.nllb_translate import (
    translate_with_nllb,
    is_nllb_supported,
    get_supported_languages
)


def translate_router(text, source_lang, target_lang):
    """
    Smart translation router with multi-model support:
    1. Try NLLB-200 (supports 200+ languages)
    2. Fallback to MarianMT for specific pairs
    3. Return original text if no translation available
    """
    # Normalize inputs
    source_lang = source_lang.strip() if source_lang else source_lang
    target_lang = target_lang.strip() if target_lang else target_lang

    print(f"🧠 Translation request: {source_lang} → {target_lang}")

    # Skip if same language or auto-detect
    if source_lang == "Auto Detect" or source_lang == target_lang:
        return text

    # ============================================
    # PRIMARY: Try NLLB-200 (supports 200+ languages)
    # ============================================
    if is_nllb_supported(source_lang, target_lang):
        print("🌐 Using NLLB-200 (Meta's multilingual model)")
        translated = translate_with_nllb(text, source_lang, target_lang)
        
        if translated is not None:
            return translated
        
        print("⚠️ NLLB-200 failed, trying fallback...")

    # ============================================
    # FALLBACK: MarianMT for specific high-quality pairs
    # ============================================
    supported_pairs = [
        ("English", "Hindi"),
        ("Hindi", "English"),
        ("English", "French"),
        ("French", "English"),
        ("English", "German"),
        ("German", "English"),
        ("English", "Spanish"),
        ("Spanish", "English"),
    ]

    if (source_lang, target_lang) in supported_pairs:
        print("🔄 Using MarianMT (fallback)")
        return marian_translate(text, source_lang, target_lang)

    # ============================================
    # NO TRANSLATION AVAILABLE
    # ============================================
    print("⚠️ Translation pair not supported by any model")
    print(f"   NLLB-200 supported languages: {len(get_supported_languages())} languages")
    print("⚠️ Returning original text")

    return text
