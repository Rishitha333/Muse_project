# NLLB-200 API Usage Guide (Frontend)

## 🌐 New Language Support

Your application now supports **200+ languages** through NLLB-200!

## 📋 Updated Language List for Frontend

Add these languages to your frontend language selector:

```javascript
// Previous (Limited):
const languages = [
  "Auto Detect",
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Marathi"
];

// Updated (Extended with NLLB-200):
const languages = [
  "Auto Detect",
  // Indian Languages
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Urdu",
  
  // Major International Languages
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Turkish",
  "Vietnamese",
  "Thai",
  "Indonesian",
  "Malay",
  "Filipino",
  "Dutch",
  "Polish",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Greek",
  "Hebrew",
  "Czech",
  "Romanian",
  "Hungarian",
  // Add more as needed
];
```

## 🔌 API Endpoint (No Changes Required)

The existing API endpoint remains the same:

```javascript
// POST /analyze
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('text', transcriptText);
formData.append('source_lang', 'Tamil');      // ✨ Now supports 200+ languages
formData.append('target_lang', 'English');    // ✨ Now supports 200+ languages

const response = await fetch('http://localhost:5000/analyze', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.translated_transcript);  // Translated text
```

## 📝 Example Usage

### Scenario 1: Tamil to English (Indian languages)
```javascript
formData.append('source_lang', 'Tamil');
formData.append('target_lang', 'English');
// Works perfectly with NLLB-200!
```

### Scenario 2: Hindi to Korean (Cross-language)
```javascript
formData.append('source_lang', 'Hindi');
formData.append('target_lang', 'Korean');
// Now possible with NLLB-200!
```

### Scenario 3: English to Chinese (International)
```javascript
formData.append('source_lang', 'English');
formData.append('target_lang', 'Chinese');
// Fully supported!
```

## 🎨 Recommended UI Updates

### 1. Language Selector with Categories:
```javascript
const languageCategories = {
  "Indian Languages": [
    "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam",
    "Marathi", "Bengali", "Gujarati", "Punjabi", "Urdu"
  ],
  "European Languages": [
    "English", "Spanish", "French", "German", "Italian",
    "Portuguese", "Russian", "Polish", "Dutch", "Swedish"
  ],
  "Asian Languages": [
    "Chinese", "Japanese", "Korean", "Vietnamese", "Thai",
    "Indonesian", "Malay", "Filipino"
  ],
  "Middle Eastern": [
    "Arabic", "Turkish", "Hebrew"
  ]
};
```

### 2. Loading Indicator:
```javascript
// First translation may take 30-60s (model loading)
// Show loading indicator with message:
"Loading translation model... (first time only)"
```

### 3. Language Pair Validation:
```javascript
// Optional: Prevent selecting same source and target
if (sourceLanguage === targetLanguage && sourceLanguage !== "Auto Detect") {
  showWarning("Source and target languages are the same");
}
```

## 🔄 Backend Response Format (Unchanged)

```json
{
  "transcript": "வணக்கம், நான் உதவி செய்ய இங்கே இருக்கிறேன்",
  "translated_transcript": "Hello, I am here to help",
  "audio_tone_score": 0.35,
  "tone": "Calm",
  "sentiment": "Positive",
  "sentiment_score": 0.85,
  "text_sarcasm_score": 0.12,
  "sarcasm": "No Sarcasm",
  "overall_sarcasm_score": 0.15,
  "overall_sarcasm": "No Sarcasm"
}
```

## ⚡ Performance Notes

1. **First Translation**: May take 30-60 seconds (one-time model download)
2. **Subsequent Translations**: Fast (~1-2 seconds)
3. **Model Caching**: Model stays in memory for faster responses
4. **GPU Acceleration**: Automatically used if available

## 🐛 Error Handling

```javascript
try {
  const response = await fetch('/analyze', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Translation failed');
  }
  
  const result = await response.json();
  
  // Check if translation was successful
  if (result.translated_transcript === result.transcript) {
    console.warn('Translation returned original text (language pair may not be supported)');
  }
  
} catch (error) {
  console.error('Analysis error:', error);
  showError('Translation service is unavailable. Please try again.');
}
```

## 📱 Mobile Considerations

- First load on mobile may take longer (model download)
- Consider showing progress indicator
- Cache model after first download
- Consider limiting language list on mobile for better UX

## 🎯 Testing Checklist

- [ ] Test with Indian language pairs (Tamil ↔ English, Hindi ↔ Telugu)
- [ ] Test with international pairs (English ↔ Chinese, Spanish ↔ French)
- [ ] Test Auto Detect option
- [ ] Test same source and target language
- [ ] Test error handling (network issues)
- [ ] Test first-time model loading (30-60s)
- [ ] Test subsequent translations (should be fast)

## 🚀 Deployment Notes

1. Ensure backend server has sufficient memory (2GB+ RAM)
2. Model auto-downloads on first use (~600MB)
3. Consider pre-loading model on server startup (optional)
4. Monitor translation response times
5. Set appropriate timeout values (60s for first request, 10s for subsequent)

---

**Need help?** Check `NLLB_INTEGRATION.md` for detailed backend documentation.
