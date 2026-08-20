from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import traceback
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from audio_processing.audio_features import (
    extract_audio_features,
    compute_audio_tone_score
)
from text_processing.text_sarcasm import (
    extract_text_features,
    predict_sarcasm
)
from text_processing.sentiment import predict_sentiment
from speech_to_text.whisper_asr import transcribe_audio
from translation.translate_router import translate_router
from fusion.multimodal_fusion import fuse_sarcasm

# Database and Auth
from database.db_config import init_collections, close_db
from routes.auth_routes import auth_bp
from routes.history_routes import history_bp
from routes.admin_routes import admin_bp
from auth.auth_utils import optional_auth

app = Flask(__name__)

# CORS Configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
CORS(app, origins=cors_origins.split(","))

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"wav", "mp3", "m4a", "ogg", "flac", "aac"}

def allowed_file(filename):
    return "." in filename and \
        filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(history_bp, url_prefix="/api/history")
app.register_blueprint(admin_bp, url_prefix="/api/admin")

# Initialize database collections
try:
    init_collections()
    print("✅ Database initialized successfully")
except Exception as e:
    print(f"⚠️ Database initialization warning: {e}")
    print("   App will continue, but database features may not work")

# Health check endpoint
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "message": "MUSE backend is running"
    }), 200


@app.route("/analyze", methods=["POST"])
@optional_auth
def analyze(current_user=None):
    print("\n==============================")
    print(">>> /analyze API HIT")

    if current_user:
        print(f"👤 User: {current_user['email']}")
    else:
        print("👤 Anonymous user")

    try:
        audio = request.files.get("audio")
        text = request.form.get("text")
        source_lang = request.form.get("source_lang")
        target_lang = request.form.get("target_lang")

        print(f"🌐 Source: {source_lang} | Target: {target_lang}")

        if not audio and not text:
            return jsonify({"error": "No input provided"}), 400

        result = {}
        audio_tone_score = None
        text_sarcasm_score = None

        # Language map (short code → full name)
        lang_map = {
            "en": "English",
            "ta": "Tamil",
            "kn": "Kannada",
            "hi": "Hindi",
            "te": "Telugu",
            "ml": "Malayalam",
            "mr": "Marathi",
        }

        # Add source and target language to result for history
        result["source_lang"] = source_lang
        result["target_lang"] = target_lang
        # Generate clean Call ID
        from datetime import datetime
        now = datetime.now()
        import random
        result["call_id"] = f"CR{now.strftime('%y%m%d')}-{now.strftime('%H%M%S')}-{random.randint(1000,9999)}"

        # ---------------- AUDIO PROCESSING ----------------
        if audio:
            try:
                if audio.filename == "":
                    return jsonify({"error": "Empty audio file"}), 400

                if not allowed_file(audio.filename):
                    return jsonify({
                        "error": "Unsupported audio format",
                        "allowed_formats": sorted(ALLOWED_EXTENSIONS)
                    }), 400

                print("▶ Saving audio file...")
                audio_path = os.path.join(UPLOAD_FOLDER, audio.filename)
                audio.save(audio_path)

                print("▶ Running Whisper STT...")
                transcript_result = transcribe_audio(
                    audio_path,
                    source_lang,
                    return_details=True
                )

                if not transcript_result or not transcript_result.get("text"):
                    raise Exception("Whisper failed to transcribe audio")

                transcript = transcript_result["text"]
                detected_lang = transcript_result.get("language", "unknown")
                language_probability = transcript_result.get("language_probability", 0.0)

                result["transcript"] = transcript
                result["detected_language"] = lang_map.get(detected_lang, detected_lang)
                result["transcript_length"] = len(transcript)
                result["word_count"] = len(transcript.split())
                result["stt_confidence"] = language_probability

                # ---------------- TRANSLATION ----------------
                effective_source_lang = (
                    lang_map.get(detected_lang, detected_lang)
                    if source_lang == "Auto Detect"
                    else source_lang
                )

                detected_lang_full = lang_map.get(detected_lang, detected_lang)
                if target_lang and target_lang.lower() != detected_lang_full.lower():
                    print(f"🌐 Translating: {effective_source_lang} → {target_lang}")
                    translated_text = translate_router(
                        transcript,
                        effective_source_lang,
                        target_lang
                    )
                    result["translated_transcript"] = translated_text
                    result["translation_successful"] = True
                    result["translation_confidence"] = 0.95
                else:
                    print(f"⏭ Translation skipped: same language ({detected_lang_full})")
                    result["translated_transcript"] = transcript
                    result["translation_skipped"] = True
                    result["translation_confidence"] = 1.0

                print("▶ Extracting audio features...")
                audio_features = extract_audio_features(audio_path)
                audio_tone_score = compute_audio_tone_score(audio_features)
                print(f"🎵 Audio tone score: {audio_tone_score}")
                result["audio_tone_score"] = round(float(audio_tone_score), 3)
                result["audio_processed"] = True

            except Exception:
                traceback.print_exc()
                return jsonify({"error": "Audio processing failed"}), 500

        # ---------------- TEXT PROCESSING ----------------
        if text or result.get("transcript"):
            try:
                text_input = text if text else result["transcript"]

                text_embedding = extract_text_features(text_input)
                text_sarcasm_score = predict_sarcasm(text_embedding)

                result["text_sarcasm_score"] = round(float(text_sarcasm_score), 3)
                result["text_processed"] = True

            except Exception:
                traceback.print_exc()
                return jsonify({"error": "Text processing failed"}), 500

        # ---------------- MULTIMODAL FUSION ----------------
        if audio_tone_score is not None and text_sarcasm_score is not None:
            final_sarcasm = fuse_sarcasm(
                text_sarcasm_score,
                audio_tone_score
            )
            result["final_sarcasm_score"] = round(float(final_sarcasm), 3)
        else:
            result["final_sarcasm_score"] = None

        # ---------------- SENTIMENT ----------------
        sentiment_text = text if text else result.get("transcript")

        if sentiment_text:
            sentiment_label, sentiment_confidence = predict_sentiment(sentiment_text)
            result["sentiment"] = sentiment_label
            result["sentiment_confidence"] = sentiment_confidence

        # ---------------- TONE LABEL (combined with sentiment) ----------------
        if audio_tone_score is not None:
            sentiment_for_tone = result.get("sentiment", "Neutral").lower()

            if audio_tone_score >= 0.7:
                if sentiment_for_tone == "negative":
                    result["tone"] = "Frustrated"
                elif sentiment_for_tone == "positive":
                    result["tone"] = "Energetic"
                else:
                    result["tone"] = "Tense"
            elif audio_tone_score >= 0.4:
                if sentiment_for_tone == "negative":
                    result["tone"] = "Disappointed"
                elif sentiment_for_tone == "positive":
                    result["tone"] = "Cheerful"
                else:
                    result["tone"] = "Neutral"
            else:
                if sentiment_for_tone == "negative":
                    result["tone"] = "Sad"
                elif sentiment_for_tone == "positive":
                    result["tone"] = "Calm"
                else:
                    result["tone"] = "Indifferent"

            print(f"🎭 Tone: {result['tone']} (score={audio_tone_score}, sentiment={sentiment_for_tone})")

        # ---------------- SAVE TO HISTORY ----------------
        if current_user:
            result["user_email"] = current_user.get("email", "Unknown")
            try:
                from database.models.analysis_history import AnalysisHistory
                analysis_id = AnalysisHistory.save_analysis(
                    current_user["user_id"],
                    result
                )
                result["analysis_id"] = analysis_id
                result["call_id"] = result.get("call_id")
            except Exception:
                pass

        print(">>> Analysis completed successfully")
        print("==============================\n")

        return jsonify(result)

    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    try:
        app.run(debug=True)
    finally:
        close_db()