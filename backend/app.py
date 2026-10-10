from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

import librosa
import numpy as np
import os
import traceback
from datetime import datetime

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

# ==========================================
# CORS CONFIGURATION FOR RENDER FRONTEND
# ==========================================

CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "https://ai-music-mood-classifier-frontend.onrender.com",
                "http://localhost:5173"
            ]
        }
    },
    methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ],
    allow_headers=[
        "Content-Type",
        "Authorization"
    ],
    supports_credentials=False
)

create_history_table()


# ==========================================
# UPLOAD CONFIGURATION
# ==========================================

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "uploads"
)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ==========================================
# ALLOWED AUDIO EXTENSIONS
# ==========================================

ALLOWED_EXTENSIONS = {
    "mp3",
    "wav",
    "ogg",
    "m4a"
}


def allowed_file(filename):

    return (
        "." in filename
        and
        filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )


# ==========================================
# TEMPO ESTIMATION
# ==========================================

def estimate_tempo(rms):

    try:

        tempo = 80 + min(
            float(rms) * 500,
            80
        )

        return round(
            tempo,
            2
        )

    except Exception:

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

        duration = librosa.get_duration(
            y=audio,
            sr=sr
        )

        rms_values = librosa.feature.rms(
            y=audio
        )[0]

        rms = float(
            np.mean(
                rms_values
            )
        )

        zcr_values = librosa.feature.zero_crossing_rate(
            audio
        )[0]

        zcr = float(
            np.mean(
                zcr_values
            )
        )

        spectral_centroid_values = librosa.feature.spectral_centroid(
            y=audio,
            sr=sr
        )[0]

        spectral_centroid = float(
            np.mean(
                spectral_centroid_values
            )
        )

        tempo = estimate_tempo(
            rms
        )

        return {

            "duration":
                round(
                    float(duration),
                    2
                ),

            "sample_rate":
                int(sr),

            "tempo":
                round(
                    float(tempo),
                    2
                ),

            "rms":
                round(
                    float(rms),
                    4
                ),

            "zcr":
                round(
                    float(zcr),
                    4
                ),

            "spectral_centroid":
                round(
                    float(spectral_centroid),
                    2
                )
        }

    except Exception as e:

        print(
            "Audio feature extraction error:",
            e
        )

        raise


# ==========================================
# AUDIO MOOD PREDICTION
# ==========================================

def predict_mood_from_audio(audio, sr):

    try:

        rms_values = librosa.feature.rms(
            y=audio
        )[0]

        rms = float(
            np.mean(
                rms_values
            )
        )

        tempo = estimate_tempo(
            rms
        )

        if (
            tempo >= 130
            and
            rms >= 0.12
        ):

            mood = "Energetic"
            confidence = 87
            intensity = "High"

        elif (
            tempo >= 100
            and
            rms >= 0.08
        ):

            mood = "Happy"
            confidence = 84
            intensity = "Medium"

        elif (
            tempo < 80
            and
            rms < 0.06
        ):

            mood = "Relaxed"
            confidence = 82
            intensity = "Low"

        elif tempo < 90:

            mood = "Sad"
            confidence = 76
            intensity = "Low"

        else:

            mood = "Happy"
            confidence = 80
            intensity = "Medium"

        return {

            "mood":
                mood,

            "confidence":
                confidence,

            "intensity":
                intensity
        }

    except Exception as e:

        print(
            "Prediction error:",
            e
        )

        raise


# ==========================================
# SERVE UPLOADED AUDIO
# ==========================================

@app.route(
    "/uploads/<path:filename>",
    methods=["GET"]
)
def uploaded_file(filename):

    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        filename
    )


# ==========================================
# HOME API
# ==========================================

@app.route(
    "/",
    methods=["GET"]
)
def home():

    return jsonify({

        "success":
            True,

        "message":
            "AI Music Mood Classifier Backend Running",

        "status":
            "Online"
    })


# ==========================================
# MAIN MOOD API
# ==========================================

@app.route(
    "/mood",
    methods=["POST"]
)
def mood_prediction():

    try:

        if "file" not in request.files:

            return jsonify({

                "success":
                    False,

                "error":
                    "No audio file uploaded."
            }), 400

        file = request.files["file"]

        if file.filename == "":

            return jsonify({

                "success":
                    False,

                "error":
                    "No selected file."
            }), 400

        if not allowed_file(
            file.filename
        ):

            return jsonify({

                "success":
                    False,

                "error":
                    "Unsupported audio format."
            }), 400

        filename = file.filename

        file_path = os.path.join(
            app.config["UPLOAD_FOLDER"],
            filename
        )

        file.save(
            file_path
        )

        print(
            "=========================================="
        )

        print(
            "Analyzing:",
            filename
        )

        features = extract_audio_features(
            file_path
        )

        model_result = predict_mood_from_file(
            file_path
        )

        mood = model_result[
            "mood"
        ]

        confidence = model_result[
            "confidence"
        ]

        intensity = model_result[
            "intensity"
        ]

        probabilities = model_result.get(
            "probabilities",
            {}
        )

        print(
            "Mood:",
            mood
        )

        print(
            "Confidence:",
            confidence
        )

        print(
            "Intensity:",
            intensity
        )

        print(
            "Probabilities:",
            probabilities
        )

        print(
            "Generating Gemini explanation..."
        )

        gemini_explanation = generate_mood_explanation(

            mood,

            confidence,

            intensity,

            features["tempo"],

            features["rms"],

            features["zcr"],

            features["spectral_centroid"]
        )

        print(
            "Gemini Explanation:",
            gemini_explanation
        )

        save_prediction(

            filename,

            mood,

            confidence,

            intensity,

            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        )

        print(
            "=========================================="
        )

        return jsonify({

            "success":
                True,

            "filename":
                filename,

            "duration":
                features[
                    "duration"
                ],

            "mood":
                mood,

            "confidence":
                confidence,

            "intensity":
                intensity,

            "gemini_explanation":
                gemini_explanation,

            "probabilities":
                probabilities,

            "features":
                features
        })

    except Exception as e:

        print(
            "=========================================="
        )

        print(
            "ERROR IN /mood"
        )

        traceback.print_exc()

        print(
            "=========================================="
        )

        return jsonify({

            "success":
                False,

            "error":
                str(e)
        }), 500


# ==========================================
# LYRICS ANALYSIS API
# ==========================================

@app.route(
    "/lyrics",
    methods=["POST"]
)
def lyrics_analysis():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "success":
                    False,

                "error":
                    "No lyrics data received."
            }), 400

        lyrics = data.get(
            "lyrics",
            ""
        )

        if not lyrics.strip():

            return jsonify({

                "success":
                    False,

                "error":
                    "Lyrics cannot be empty."
            }), 400

        text = lyrics.lower()

        happy_words = [
            "happy",
            "love",
            "smile",
            "joy",
            "beautiful",
            "fun",
            "dance",
            "celebrate",
            "happiness",
            "laugh",
            "lovely",
            "wonderful"
        ]

        sad_words = [
            "sad",
            "cry",
            "tears",
            "alone",
            "pain",
            "broken",
            "miss",
            "lonely",
            "sorrow",
            "hurt",
            "lost",
            "goodbye"
        ]

        energetic_words = [
            "dance",
            "party",
            "fire",
            "power",
            "energy",
            "rock",
            "move",
            "crazy",
            "strong",
            "beat",
            "jump",
            "run"
        ]

        relaxed_words = [
            "calm",
            "peace",
            "relax",
            "quiet",
            "dream",
            "sleep",
            "slow",
            "peaceful",
            "serene",
            "soft",
            "nature"
        ]

        scores = {

            "Happy":
                sum(
                    word in text
                    for word in happy_words
                ),

            "Sad":
                sum(
                    word in text
                    for word in sad_words
                ),

            "Energetic":
                sum(
                    word in text
                    for word in energetic_words
                ),

            "Relaxed":
                sum(
                    word in text
                    for word in relaxed_words
                )
        }

        if max(
            scores.values()
        ) == 0:

            mood = "Neutral"
            confidence = 50

        else:

            mood = max(
                scores,
                key=scores.get
            )

            total = sum(
                scores.values()
            )

            confidence = round(
                (
                    scores[mood]
                    /
                    total
                ) * 100
            )

        all_emotional_words = (
            happy_words
            +
            sad_words
            +
            energetic_words
            +
            relaxed_words
        )

        keywords = []

        for word in all_emotional_words:

            if word in text:

                if word not in keywords:

                    keywords.append(
                        word
                    )

        if mood == "Happy":

            emotional_meaning = (
                "The lyrics express positive "
                "emotions such as love, happiness, "
                "joy and beautiful feelings. "
                "The overall emotional tone of "
                "the lyrics is positive and uplifting."
            )

        elif mood == "Sad":

            emotional_meaning = (
                "The lyrics express feelings of "
                "sadness, pain, loneliness or "
                "emotional loss. The overall "
                "emotional tone is melancholic "
                "and reflective."
            )

        elif mood == "Energetic":

            emotional_meaning = (
                "The lyrics express strong, "
                "energetic and exciting emotions. "
                "The words suggest movement, "
                "power, celebration or an active "
                "emotional atmosphere."
            )

        elif mood == "Relaxed":

            emotional_meaning = (
                "The lyrics express calm, peaceful "
                "and soothing emotions. The overall "
                "tone suggests relaxation, comfort "
                "and a peaceful state of mind."
            )

        else:

            emotional_meaning = (
                "The lyrics do not contain enough "
                "strong emotional keywords to "
                "identify a specific mood. The "
                "overall emotional tone appears neutral."
            )

        lyrics_length = len(
            lyrics
        )

        print(
            "=========================================="
        )

        print(
            "LYRICS ANALYSIS"
        )

        print(
            "Mood:",
            mood
        )

        print(
            "Confidence:",
            confidence
        )

        print(
            "Keywords:",
            keywords
        )

        print(
            "Lyrics Length:",
            lyrics_length
        )

        print(
            "=========================================="
        )

        return jsonify({

            "success":
                True,

            "mood":
                mood,

            "confidence":
                confidence,

            "scores":
                scores,

            "lyrics":
                lyrics,

            "emotional_meaning":
                emotional_meaning,

            "keywords":
                keywords,

            "lyrics_length":
                lyrics_length
        })

    except Exception as e:

        print(
            "=========================================="
        )

        print(
            "ERROR IN /lyrics"
        )

        traceback.print_exc()

        print(
            "=========================================="
        )

        return jsonify({

            "success":
                False,

            "error":
                str(e)
        }), 500


# ==========================================
# MOOD TRANSITION API
# ==========================================

@app.route(
    "/mood-transition",
    methods=["POST"]
)
def mood_transition():

    try:

        if "file" not in request.files:

            return jsonify({

                "success":
                    False,

                "error":
                    "No audio file uploaded."
            }), 400

        file = request.files["file"]

        if file.filename == "":

            return jsonify({

                "success":
                    False,

                "error":
                    "No selected file."
            }), 400

        filename = file.filename

        file_path = os.path.join(
            app.config["UPLOAD_FOLDER"],
            filename
        )

        file.save(
            file_path
        )

        audio, sr = librosa.load(
            file_path,
            sr=None,
            mono=True
        )

        duration = librosa.get_duration(
            y=audio,
            sr=sr
        )

        segment_length = 10

        transitions = []

        start_time = 0

        while start_time < duration:

            end_time = min(
                start_time + segment_length,
                duration
            )

            start_sample = int(
                start_time * sr
            )

            end_sample = int(
                end_time * sr
            )

            segment = audio[
                start_sample:end_sample
            ]

            if len(segment) == 0:

                break

            rms_values = librosa.feature.rms(
                y=segment
            )[0]

            rms = float(
                np.mean(
                    rms_values
                )
            )

            tempo = estimate_tempo(
                rms
            )

            if (
                tempo >= 130
                and
                rms >= 0.12
            ):

                mood = "Energetic"
                confidence = 87

            elif (
                tempo >= 100
                and
                rms >= 0.08
            ):

                mood = "Happy"
                confidence = 84

            elif (
                tempo < 80
                and
                rms < 0.06
            ):

                mood = "Relaxed"
                confidence = 82

            elif tempo < 90:

                mood = "Sad"
                confidence = 76

            else:

                mood = "Happy"
                confidence = 80

            transitions.append({

                "start":
                    round(
                        start_time,
                        2
                    ),

                "end":
                    round(
                        end_time,
                        2
                    ),

                "mood":
                    mood,

                "confidence":
                    confidence,

                "rms":
                    round(
                        rms,
                        4
                    ),

                "tempo":
                    round(
                        tempo,
                        2
                    )
            })

            start_time += segment_length

        mood_changes = []

        for i in range(
            1,
            len(transitions)
        ):

            previous_mood = transitions[
                i - 1
            ]["mood"]

            current_mood = transitions[
                i
            ]["mood"]

            if previous_mood != current_mood:

                mood_changes.append({

                    "from":
                        previous_mood,

                    "to":
                        current_mood,

                    "at":
                        transitions[i][
                            "start"
                        ]
                })

        return jsonify({

            "success":
                True,

            "filename":
                filename,

            "duration":
                round(
                    duration,
                    2
                ),

            "transitions":
                transitions,

            "mood_changes":
                mood_changes
        })

    except Exception as e:

        traceback.print_exc()

        return jsonify({

            "success":
                False,

            "error":
                str(e)
        }), 500


# ==========================================
# MULTI MOOD API
# ==========================================

@app.route(
    "/multi-mood",
    methods=["POST"]
)
def multi_mood():

    try:

        if "file" not in request.files:

            return jsonify({

                "success":
                    False,

                "error":
                    "No audio file uploaded."
            }), 400

        file = request.files["file"]

        if file.filename == "":

            return jsonify({

                "success":
                    False,

                "error":
                    "No selected file."
            }), 400

        if not allowed_file(
            file.filename
        ):

            return jsonify({

                "success":
                    False,

                "error":
                    "Unsupported audio format."
            }), 400

        filename = file.filename

        file_path = os.path.join(
            app.config["UPLOAD_FOLDER"],
            filename
        )

        file.save(
            file_path
        )

        audio, sr = librosa.load(
            file_path,
            sr=None,
            mono=True,
            duration=30
        )

        rms_values = librosa.feature.rms(
            y=audio
        )[0]

        rms = float(
            np.mean(
                rms_values
            )
        )

        tempo = estimate_tempo(
            rms
        )

        happy_score = min(
            100,
            max(
                0,
                int(
                    60
                    +
                    (rms * 100)
                    +
                    (tempo - 100) * 0.2
                )
            )
        )

        energetic_score = min(
            100,
            max(
                0,
                int(
                    50
                    +
                    (rms * 150)
                    +
                    (tempo - 100) * 0.3
                )
            )
        )

        relaxed_score = min(
            100,
            max(
                0,
                int(
                    70
                    -
                    (rms * 120)
                    -
                    max(
                        tempo - 80,
                        0
                    ) * 0.2
                )
            )
        )

        sad_score = min(
            100,
            max(
                0,
                int(
                    65
                    -
                    (rms * 100)
                    -
                    max(
                        tempo - 70,
                        0
                    ) * 0.15
                )
            )
        )

        scores = {

            "Happy":
                happy_score,

            "Energetic":
                energetic_score,

            "Relaxed":
                relaxed_score,

            "Sad":
                sad_score
        }

        sorted_moods = sorted(
            scores.items(),
            key=lambda x: x[1],
            reverse=True
        )

        dominant_mood = sorted_moods[
            0
        ][0]

        mood_changes = 0

        return jsonify({

            "success":
                True,

            "filename":
                filename,

            "duration":
                round(
                    librosa.get_duration(
                        y=audio,
                        sr=sr
                    ),
                    2
                ),

            "dominant_mood":
                dominant_mood,

            "scores":
                scores,

            "mood_changes":
                mood_changes,

            "features": {

                "tempo":
                    round(
                        tempo,
                        2
                    ),

                "rms":
                    round(
                        rms,
                        4
                    )
            }
        })

    except Exception as e:

        traceback.print_exc()

        return jsonify({

            "success":
                False,

            "error":
                str(e)
        }), 500


# ==========================================
# HISTORY - GET
# ==========================================

@app.route(
    "/history",
    methods=["GET"]
)
def history():

    try:

        predictions = get_predictions()

        return jsonify({

            "success":
                True,

            "predictions":
                predictions
        })

    except Exception as e:

        traceback.print_exc()

        return jsonify({

            "success":
                False,

            "error":
                str(e)
        }), 500


# ==========================================
# HISTORY - DELETE ONE
# ==========================================

@app.route(
    "/history/<int:prediction_id>",
    methods=["DELETE"]
)
def delete_history(
    prediction_id
):

    try:

        result = delete_prediction(
            prediction_id
        )

        return jsonify({

            "success":
                True,

            "message":
                "Prediction deleted successfully.",

            "result":
                result
        })

    except Exception as e:

        traceback.print_exc()

        return jsonify({

            "success":
                False,

            "error":
                str(e)
        }), 500


# ==========================================
# HISTORY - DELETE ALL
# ==========================================

@app.route(
    "/history",
    methods=["DELETE"]
)
def delete_all_history():

    try:

        clear_predictions()

        return jsonify({

            "success":
                True,

            "message":
                "Prediction history cleared successfully."
        })

    except Exception as e:

        traceback.print_exc()

        return jsonify({

            "success":
                False,

            "error":
                str(e)
        }), 500


# ==========================================
# RUN FLASK SERVER
# ==========================================

if __name__ == "__main__":

    print(
        "=========================================="
    )

    print(
        "AI MUSIC MOOD CLASSIFIER BACKEND"
    )

    print(
        "Flask Server Starting..."
    )

    print(
        "URL: http://127.0.0.1:5000"
    )

    print(
        "=========================================="
    )

    app.run(
        debug=True,
        port=5000
    )
