from transformers import MarianMTModel, MarianTokenizer

# Cache loaded models (important for performance)
MODEL_CACHE = {}

# Language mapping (UI → Marian codes)
LANG_MAP = {
    "English": "en",
    "Tamil": "ta",
    "Hindi": "hi",
    "Telugu": "te",
    "Kannada": "kn",
    "Malayalam": "ml",
    "Marathi": "mr"
}

def get_model_name(src, tgt):
    return f"Helsinki-NLP/opus-mt-{src}-{tgt}"

def translate_text(text, source_lang, target_lang):
    try:
        # ✅ CLEAN INPUT (VERY IMPORTANT)
        source_lang = source_lang.strip() if source_lang else source_lang
        target_lang = target_lang.strip() if target_lang else target_lang

        if source_lang == "Auto Detect":
            return text

        src = LANG_MAP.get(source_lang)
        tgt = LANG_MAP.get(target_lang)

        if not src or not tgt or src == tgt:
            print(f"⚠️ Translation skipped: {source_lang} → {target_lang}")
            return text

        model_name = get_model_name(src, tgt)

        if model_name not in MODEL_CACHE:
            tokenizer = MarianTokenizer.from_pretrained(model_name)
            model = MarianMTModel.from_pretrained(model_name)
            MODEL_CACHE[model_name] = (tokenizer, model)
        else:
            tokenizer, model = MODEL_CACHE[model_name]

        inputs = tokenizer(text, return_tensors="pt", padding=True)
        translated = model.generate(**inputs)
        translated_text = tokenizer.decode(
            translated[0],
            skip_special_tokens=True
        )

        return translated_text

    except Exception as e:
        print("Translation error:", e)
        return text
