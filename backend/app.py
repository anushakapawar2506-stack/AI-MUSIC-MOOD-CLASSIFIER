
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

import librosa
import numpy as np
import os
import traceback
from datetime import datetime
from werkzeug.utils import secure_filename

from database import (
    create_history_table,
    save_prediction,
    get_predictions,
    delete_prediction,
    clear_predictions
)

from model import predict_mood_from_file
from gemini_service import generate_mood_explanation


# ==========================================
# FLASK APP
# ==========================================

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "https://ai-music-mood-classifier-frontend.onrender.com"
            ]
        }
    },
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    supports_credentials=False
)

# Allow only reasonably sized audio uploads (50 MB)
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024

# ==========================================
# UPLOAD CONFIGURATION
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"mp3", "wav", "ogg", "m4a", "flac"}

create_history_table()


def allowed_file(filename):
    return (
        bool(filename)
        and "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def save_uploaded_file(file):
    """Validate and save an uploaded audio file safely."""
    if not file or not file.filename:
        raise ValueError("No audio file selected.")

    if not allowed_file(file.filename):
        raise ValueError("Unsupported audio format.")

    filename = secure_filename(file.filename)

    if not filename:
        raise ValueError("Invalid audio filename.")

    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    return filename, file_path


def error_response(message, status=500):
    return jsonify({
        "success": False,
        "error": str(message)
    }), status


# ==========================================
# TEMPO ESTIMATION
# ==========================================

def estimate_tempo(rms):
    try:
        return round(80 + min(float(rms) * 500, 80), 2)
    except (TypeError, ValueError):
        return 80.0


# ==========================================
# AUDIO FEATURE EXTRACTION
# ==========================================

def extract_audio_features(file_path):
    try:
        audio, sr = librosa.load(
            file_path,
            sr=None,
            mono=True,
            duration=30
        )

        if audio.size == 0:
            raise ValueError("The uploaded audio file is empty or unreadable.")

        duration = librosa.get_duration(y=audio, sr=sr)

        rms_values = librosa.feature.rms(y=audio)[0]
        rms = float(np.mean(rms_values))

        zcr_values = librosa.feature.zero_crossing_rate(y=audio)[0]
        zcr = float(np.mean(zcr_values))

        centroid_values = librosa.feature.spectral_centroid(
            y=audio,
            sr=sr
        )[0]
        spectral_centroid = float(np.mean(centroid_values))

        tempo = estimate_tempo(rms)

        return {
            "duration": round(float(duration), 2),
            "sample_rate": int(sr),
            "tempo": round(float(tempo), 2),
            "rms": round(float(rms), 4),
            "zcr": round(float(zcr), 4),
            "spectral_centroid": round(float(spectral_centroid), 2)
        }

    except Exception:
        print("Audio feature extraction error:")
        traceback.print_exc()
        raise


# ==========================================
# RULE-BASED AUDIO MOOD PREDICTION
# ==========================================

def predict_mood_from_audio(audio, sr):
    try:
        rms_values = librosa.feature.rms(y=audio)[0]
        rms = float(np.mean(rms_values))
        tempo = estimate_tempo(rms)

        if tempo >= 130 and rms >= 0.12:
            mood, confidence, intensity = "Energetic", 87, "High"
        elif tempo >= 100 and rms >= 0.08:
            mood, confidence, intensity = "Happy", 84, "Medium"
        elif tempo < 80 and rms < 0.06:
            mood, confidence, intensity = "Relaxed", 82, "Low"
        elif tempo < 90:
            mood, confidence, intensity = "Sad", 76, "Low"
        else:
            mood, confidence, intensity = "Happy", 80, "Medium"

        return {
            "mood": mood,
            "confidence": confidence,
            "intensity": intensity
        }

    except Exception:
        print("Prediction error:")
        traceback.print_exc()
        raise


# ==========================================
# SERVE UPLOADED AUDIO
# ==========================================

@app.route("/uploads/<path:filename>", methods=["GET"])
def uploaded_file(filename):
    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        filename
    )


# ==========================================
# HOME API
# ==========================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "AI Music Mood Classifier Backend Running",
        "status": "Online"
    })


# ==========================================
# MAIN MOOD API
# ==========================================

@app.route("/mood", methods=["POST"])
def mood_prediction():
    try:
        if "file" not in request.files:
            return error_response("No audio file uploaded.", 400)

        filename, file_path = save_uploaded_file(request.files["file"])

        print("==========================================")
        print("Analyzing:", filename)

        features = extract_audio_features(file_path)

        # Use the trained model.
        model_result = predict_mood_from_file(file_path)

        mood = model_result["mood"]
        confidence = model_result["confidence"]
        intensity = model_result["intensity"]
        probabilities = model_result.get("probabilities", {})

        print("Mood:", mood)
        print("Confidence:", confidence)
        print("Intensity:", intensity)

        # Gemini explanation; keep analysis result even if explanation fails.
        try:
            gemini_explanation = generate_mood_explanation(
                mood,
                confidence,
                intensity,
                features["tempo"],
                features["rms"],
                features["zcr"],
                features["spectral_centroid"]
            )
        except Exception as gemini_error:
            print("Gemini explanation error:", gemini_error)
            gemini_explanation = (
                f"The model predicted {mood} mood with "
                f"{confidence}% confidence and {intensity} intensity."
            )

        save_prediction(
            filename,
            mood,
            confidence,
            intensity,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )

        print("Analysis completed:", filename)
        print("==========================================")

        return jsonify({
            "success": True,
            "filename": filename,
            "duration": features["duration"],
            "mood": mood,
            "confidence": confidence,
            "intensity": intensity,
            "gemini_explanation": gemini_explanation,
            "probabilities": probabilities,
            "features": features
        })

    except ValueError as e:
        return error_response(e, 400)

    except Exception as e:
        print("ERROR IN /mood")
        traceback.print_exc()
        return error_response(e, 500)


# ==========================================
# LYRICS ANALYSIS API
# ==========================================

@app.route("/lyrics", methods=["POST"])
def lyrics_analysis():
    try:
        data = request.get_json(silent=True) or {}
        lyrics = data.get("lyrics", "")

        if not isinstance(lyrics, str) or not lyrics.strip():
            return error_response("Lyrics cannot be empty.", 400)

        text = lyrics.lower()

        happy_words = [
            "happy", "love", "smile", "joy", "beautiful", "fun",
            "dance", "celebrate", "happiness", "laugh", "lovely",
            "wonderful"
        ]

        sad_words = [
            "sad", "cry", "tears", "alone", "pain", "broken",
            "miss", "lonely", "sorrow", "hurt", "lost", "goodbye"
        ]

        energetic_words = [
            "dance", "party", "fire", "power", "energy", "rock",
            "move", "crazy", "strong", "beat", "jump", "run"
        ]

        relaxed_words = [
            "calm", "peace", "relax", "quiet", "dream", "sleep",
            "slow", "peaceful", "serene", "soft", "nature"
        ]

        word_groups = {
            "Happy": happy_words,
            "Sad": sad_words,
            "Energetic": energetic_words,
            "Relaxed": relaxed_words
        }

        scores = {
            mood: sum(word in text for word in words)
            for mood, words in word_groups.items()
        }

        if max(scores.values()) == 0:
            mood = "Neutral"
            confidence = 50
        else:
            mood = max(scores, key=scores.get)
            total = sum(scores.values())
            confidence = round(scores[mood] / total * 100)

        all_words = (
            happy_words + sad_words + energetic_words + relaxed_words
        )
        keywords = list(dict.fromkeys(
            word for word in all_words if word in text
        ))

        meanings = {
            "Happy": (
                "The lyrics express positive emotions such as love, "
                "happiness, joy and uplifting feelings."
            ),
            "Sad": (
                "The lyrics express sadness, pain, loneliness or loss."
            ),
            "Energetic": (
                "The lyrics suggest energy, excitement, movement or power."
            ),
            "Relaxed": (
                "The lyrics suggest calm, peaceful and soothing emotions."
            ),
            "Neutral": (
                "There are not enough emotional keywords to identify "
                "a specific mood."
            )
        }

        return jsonify({
            "success": True,
            "mood": mood,
            "confidence": confidence,
            "scores": scores,
            "lyrics": lyrics,
            "emotional_meaning": meanings[mood],
            "keywords": keywords,
            "lyrics_length": len(lyrics)
        })

    except Exception as e:
        print("ERROR IN /lyrics")
        traceback.print_exc()
        return error_response(e, 500)


# ==========================================
# MOOD TRANSITION API
# ==========================================

@app.route("/mood-transition", methods=["POST"])
def mood_transition():
    try:
        if "file" not in request.files:
            return error_response("No audio file uploaded.", 400)

        filename, file_path = save_uploaded_file(request.files["file"])

        audio, sr = librosa.load(
            file_path,
            sr=None,
            mono=True
        )

        if audio.size == 0:
            return error_response("The audio file is empty or unreadable.", 400)

        duration = librosa.get_duration(y=audio, sr=sr)
        segment_length = 10
        transitions = []
        start_time = 0

        while start_time < duration:
            end_time = min(start_time + segment_length, duration)
            segment = audio[int(start_time * sr):int(end_time * sr)]

            if segment.size == 0:
                break

            rms_values = librosa.feature.rms(y=segment)[0]
            rms = float(np.mean(rms_values))
            tempo = estimate_tempo(rms)

            if tempo >= 130 and rms >= 0.12:
                mood, confidence = "Energetic", 87
            elif tempo >= 100 and rms >= 0.08:
                mood, confidence = "Happy", 84
            elif tempo < 80 and rms < 0.06:
                mood, confidence = "Relaxed", 82
            elif tempo < 90:
                mood, confidence = "Sad", 76
            else:
                mood, confidence = "Happy", 80

            transitions.append({
                "start": round(start_time, 2),
                "end": round(end_time, 2),
                "mood": mood,
                "confidence": confidence,
                "rms": round(rms, 4),
                "tempo": round(tempo, 2)
            })

            start_time += segment_length

        mood_changes = []

        for i in range(1, len(transitions)):
            previous_mood = transitions[i - 1]["mood"]
            current_mood = transitions[i]["mood"]

            if previous_mood != current_mood:
                mood_changes.append({
                    "from": previous_mood,
                    "to": current_mood,
                    "at": transitions[i]["start"]
                })

        return jsonify({
            "success": True,
            "filename": filename,
            "duration": round(duration, 2),
            "transitions": transitions,
            "mood_changes": mood_changes
        })

    except ValueError as e:
        return error_response(e, 400)

    except Exception as e:
        print("ERROR IN /mood-transition")
        traceback.print_exc()
        return error_response(e, 500)


# ==========================================
# MULTI MOOD API
# ==========================================

@app.route("/multi-mood", methods=["POST"])
def multi_mood():
    try:
        if "file" not in request.files:
            return error_response("No audio file uploaded.", 400)

        filename, file_path = save_uploaded_file(request.files["file"])

        audio, sr = librosa.load(
            file_path,
            sr=None,
            mono=True,
            duration=30
        )

        if audio.size == 0:
            return error_response("The audio file is empty or unreadable.", 400)

        rms_values = librosa.feature.rms(y=audio)[0]
        rms = float(np.mean(rms_values))
        tempo = estimate_tempo(rms)

        happy_score = min(100, max(0, int(
            60 + rms * 100 + (tempo - 100) * 0.2
        )))

        energetic_score = min(100, max(0, int(
            50 + rms * 150 + (tempo - 100) * 0.3
        )))

        relaxed_score = min(100, max(0, int(
            70 - rms * 120 - max(tempo - 80, 0) * 0.2
        )))

        sad_score = min(100, max(0, int(
            65 - rms * 100 - max(tempo - 70, 0) * 0.15
        )))

        scores = {
            "Happy": happy_score,
            "Energetic": energetic_score,
            "Relaxed": relaxed_score,
            "Sad": sad_score
        }

        dominant_mood = max(scores, key=scores.get)

        return jsonify({
            "success": True,
            "filename": filename,
            "duration": round(
                librosa.get_duration(y=audio, sr=sr), 2
            ),
            "dominant_mood": dominant_mood,
            "scores": scores,
            "mood_changes": 0,
            "features": {
                "tempo": round(tempo, 2),
                "rms": round(rms, 4)
            }
        })

    except ValueError as e:
        return error_response(e, 400)

    except Exception as e:
        print("ERROR IN /multi-mood")
        traceback.print_exc()
        return error_response(e, 500)


# ==========================================
# HISTORY - GET
# ==========================================

@app.route("/history", methods=["GET"])
def history():
    try:
        return jsonify({
            "success": True,
            "predictions": get_predictions()
        })

    except Exception as e:
        print("ERROR IN /history")
        traceback.print_exc()
        return error_response(e, 500)


# ==========================================
# HISTORY - DELETE ONE
# ==========================================

@app.route("/history/<int:prediction_id>", methods=["DELETE"])
def delete_history(prediction_id):
    try:
        result = delete_prediction(prediction_id)

        return jsonify({
            "success": True,
            "message": "Prediction deleted successfully.",
            "result": result
        })

    except Exception as e:
        print("ERROR DELETING HISTORY ITEM")
        traceback.print_exc()
        return error_response(e, 500)


# ==========================================
# HISTORY - DELETE ALL
# ==========================================

@app.route("/history", methods=["DELETE"])
def delete_all_history():
    try:
        clear_predictions()

        return jsonify({
            "success": True,
            "message": "Prediction history cleared successfully."
        })

    except Exception as e:
        print("ERROR CLEARING HISTORY")
        traceback.print_exc()
        return error_response(e, 500)


# ==========================================
# MAX UPLOAD SIZE ERROR
# ==========================================

@app.errorhandler(413)
def file_too_large(error):
    return error_response(
        "Audio file is too large. Maximum upload size is 50 MB.",
        413
    )


# ==========================================
# RUN FLASK SERVER
# ==========================================

if __name__ == "__main__":
    print("==========================================")
    print("AI MUSIC MOOD CLASSIFIER BACKEND")
    print("Flask Server Starting...")
    print("URL: http://127.0.0.1:5000")
    print("==========================================")

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )
