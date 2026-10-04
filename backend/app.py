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


# ==========================================
# FLASK APP
# ==========================================

app = Flask(__name__)

CORS(app)

create_history_table()


# ==========================================
# UPLOAD CONFIGURATION
# ==========================================

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(__file__),
    "uploads"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


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
        filename.rsplit(
            ".",
            1
        )[1].lower()
        in ALLOWED_EXTENSIONS
    )


# ==========================================
# TEMPO ESTIMATION
# ==========================================

def estimate_tempo(rms):

    return round(
        80 + min(
            rms * 500,
            80
        ),
        2
    )


# ==========================================
# AUDIO FEATURE EXTRACTION
# ==========================================

def extract_audio_features(file_path):

    y, sr = librosa.load(
        file_path,
        sr=None,
        mono=True
    )

    if len(y) == 0:

        raise ValueError(
            "Audio file is empty."
        )

    duration = round(
        len(y) / sr,
        2
    )

    rms = librosa.feature.rms(
        y=y
    )

    rms_mean = float(
        np.mean(rms)
    )

    zcr = librosa.feature.zero_crossing_rate(
        y
    )

    zcr_mean = float(
        np.mean(zcr)
    )

    spectral_centroid = librosa.feature.spectral_centroid(
        y=y,
        sr=sr
    )

    centroid_mean = float(
        np.mean(
            spectral_centroid
        )
    )

    tempo = estimate_tempo(
        rms_mean
    )

    return {

        "duration":
            duration,

        "sample_rate":
            sr,

        "rms":
            round(
                rms_mean,
                4
            ),

        "zcr":
            round(
                zcr_mean,
                4
            ),

        "spectral_centroid":
            round(
                centroid_mean,
                2
            ),

        "tempo":
            tempo
    }


# ==========================================
# 10 SECOND AUDIO MOOD PREDICTION
# ==========================================

def predict_mood_from_audio(
    audio,
    sr
):

    # ======================================
    # MFCC
    # ======================================

    mfcc = librosa.feature.mfcc(
        y=audio,
        sr=sr,
        n_mfcc=13
    )

    mfcc_mean = np.mean(
        mfcc,
        axis=1
    )

    # ======================================
    # CHROMA
    # ======================================

    chroma = librosa.feature.chroma_stft(
        y=audio,
        sr=sr
    )

    chroma_mean = np.mean(
        chroma,
        axis=1
    )

    # ======================================
    # RMS
    # ======================================

    rms = librosa.feature.rms(
        y=audio
    )

    rms_mean = np.mean(
        rms
    )

    # ======================================
    # ZCR
    # ======================================

    zcr = librosa.feature.zero_crossing_rate(
        audio
    )

    zcr_mean = np.mean(
        zcr
    )

    # ======================================
    # 27 FEATURES
    # ======================================

    features = np.concatenate(
        [
            mfcc_mean,
            chroma_mean,
            [
                rms_mean,
                zcr_mean
            ]
        ]
    )

    features = features.reshape(
        1,
        -1
    )

    # ======================================
    # MODEL
    # ======================================

    from model import model

    prediction = model.predict(
        features
    )[0]

    confidence = 0

    probabilities_dict = {}

    if hasattr(
        model,
        "predict_proba"
    ):

        probabilities = model.predict_proba(
            features
        )[0]

        classes = model.classes_

        for class_name, probability in zip(
            classes,
            probabilities
        ):

            probabilities_dict[
                str(class_name).capitalize()
            ] = round(
                float(probability) * 100,
                2
            )

        confidence = round(
            float(
                np.max(probabilities)
            ) * 100
        )

    # ======================================
    # INTENSITY
    # ======================================

    if confidence >= 85:

        intensity = "High"

    elif confidence >= 70:

        intensity = "Medium"

    else:

        intensity = "Low"

    return {

        "mood":
            str(
                prediction
            ).capitalize(),

        "confidence":
            confidence,

        "intensity":
            intensity,

        "probabilities":
            probabilities_dict,

        "rms":
            round(
                float(
                    rms_mean
                ),
                4
            ),

        "tempo":
            estimate_tempo(
                float(
                    rms_mean
                )
            )
    }


# ==========================================
# SERVE UPLOADED AUDIO
# ==========================================

@app.route(
    "/uploads/<path:filename>"
)
def uploaded_file(filename):

    return send_from_directory(
        app.config[
            "UPLOAD_FOLDER"
        ],
        filename
    )


# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():

    return jsonify({

        "success":
            True,

        "message":
            "AI Music Mood Classifier Backend is Running",

        "status":
            "online"
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

        # ==================================
        # CHECK FILE
        # ==================================

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

        # ==================================
        # SAVE FILE
        # ==================================

        filename = file.filename

        file_path = os.path.join(
            app.config[
                "UPLOAD_FOLDER"
            ],
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

        # ==================================
        # AUDIO FEATURES
        # ==================================

        features = extract_audio_features(
            file_path
        )

        # ==================================
        # RANDOM FOREST PREDICTION
        # ==================================

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

        # ==================================
        # ACTUAL ML PROBABILITIES
        # ==================================

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

        # ==================================
        # SAVE HISTORY
        # ==================================

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

        # ==================================
        # FINAL RESPONSE
        # ==================================

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
# LYRICS ANALYSIS
# ==========================================

@app.route(
    "/lyrics",
    methods=["POST"]
)
def lyrics_analysis():

    try:

        data = request.get_json()

        lyrics = data.get(
            "lyrics",
            ""
        )

        if not lyrics.strip():

            return jsonify({

                "success":
                    False,

                "error":
                    "Lyrics are required."
            }), 400

        text = lyrics.lower()

        mood_keywords = {

            "Happy": [
                "happy",
                "love",
                "smile",
                "joy",
                "dance",
                "beautiful",
                "fun",
                "celebrate"
            ],

            "Sad": [
                "sad",
                "cry",
                "alone",
                "pain",
                "broken",
                "tears",
                "miss",
                "lost"
            ],

            "Energetic": [
                "energy",
                "party",
                "dance",
                "fire",
                "power",
                "run",
                "strong",
                "rock"
            ],

            "Relaxed": [
                "peace",
                "calm",
                "relax",
                "dream",
                "sleep",
                "quiet",
                "slow",
                "peaceful"
            ]
        }

        scores = {}

        for mood_name, keywords in mood_keywords.items():

            score = 0

            for keyword in keywords:

                if keyword in text:

                    score += 1

            scores[
                mood_name
            ] = score

        detected_mood = max(
            scores,
            key=scores.get
        )

        total_score = sum(
            scores.values()
        )

        if total_score == 0:

            confidence = 25

        else:

            confidence = round(
                (
                    scores[
                        detected_mood
                    ]
                    /
                    total_score
                )
                * 100
            )

        if confidence >= 80:

            emotional_meaning = (
                "Strong emotional expression detected."
            )

        elif confidence >= 50:

            emotional_meaning = (
                "Moderate emotional expression detected."
            )

        else:

            emotional_meaning = (
                "Mixed or unclear emotional expression."
            )

        found_keywords = []

        for keyword_list in mood_keywords.values():

            for keyword in keyword_list:

                if keyword in text:

                    found_keywords.append(
                        keyword
                    )

        return jsonify({

            "success":
                True,

            "mood":
                detected_mood,

            "confidence":
                confidence,

            "emotional_meaning":
                emotional_meaning,

            "keywords":
                list(
                    set(
                        found_keywords
                    )
                ),

            "lyrics_length":
                len(lyrics)
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
# MOOD TRANSITION
# ==========================================

@app.route(
    "/mood-transition",
    methods=["POST"]
)
def mood_transition():

    try:

        # ==================================
        # CHECK FILE
        # ==================================

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

        # ==================================
        # SAVE FILE
        # ==================================

        filename = file.filename

        file_path = os.path.join(
            app.config[
                "UPLOAD_FOLDER"
            ],
            filename
        )

        file.save(
            file_path
        )

        # ==================================
        # LOAD AUDIO
        # ==================================

        audio, sr = librosa.load(
            file_path,
            sr=None,
            mono=True
        )

        total_duration = len(
            audio
        ) / sr

        # ==================================
        # 10 SECOND SECTIONS
        # ==================================

        section_duration = 10

        sections = []

        start = 0

        while start < total_duration:

            end = min(
                start + section_duration,
                total_duration
            )

            start_sample = int(
                start * sr
            )

            end_sample = int(
                end * sr
            )

            section_audio = audio[
                start_sample:end_sample
            ]

            if len(section_audio) == 0:

                break

            result = predict_mood_from_audio(
                section_audio,
                sr
            )

            sections.append({

                "start":
                    round(
                        start,
                        2
                    ),

                "end":
                    round(
                        end,
                        2
                    ),

                "mood":
                    result[
                        "mood"
                    ],

                "confidence":
                    result[
                        "confidence"
                    ],

                "intensity":
                    result[
                        "intensity"
                    ],

                "rms":
                    result[
                        "rms"
                    ],

                "tempo":
                    result[
                        "tempo"
                    ],

                "probabilities":
                    result[
                        "probabilities"
                    ]
            })

            start += section_duration

        # ==================================
        # REAL MOOD TRANSITIONS
        # ==================================

        transitions = []

        for i in range(
            1,
            len(sections)
        ):

            previous_section = sections[
                i - 1
            ]

            current_section = sections[
                i
            ]

            previous_mood = previous_section[
                "mood"
            ]

            current_mood = current_section[
                "mood"
            ]

            # Only record actual mood changes
            if previous_mood != current_mood:

                transitions.append({

                    "from":
                        previous_mood,

                    "to":
                        current_mood,

                    # Exact point where
                    # new mood begins
                    "at":
                        current_section[
                            "start"
                        ],

                    # Section containing
                    # the new mood
                    "start":
                        current_section[
                            "start"
                        ],

                    "end":
                        current_section[
                            "end"
                        ],

                    "confidence":
                        current_section[
                            "confidence"
                        ],

                    "intensity":
                        current_section[
                            "intensity"
                        ],

                    "probabilities":
                        current_section[
                            "probabilities"
                        ]
                })

        # ==================================
        # OVERALL CONFIDENCE
        # ==================================

        overall_confidence = 0

        if sections:

            section_confidences = [

                section[
                    "confidence"
                ]

                for section in sections
            ]

            overall_confidence = round(
                sum(
                    section_confidences
                )
                /
                len(
                    section_confidences
                )
            )

        # ==================================
        # FINAL RESPONSE
        # ==================================

        return jsonify({

            "success":
                True,

            "filename":
                filename,

            "confidence":
                overall_confidence,

            "sections":
                sections,

            "transitions":
                transitions
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
# MULTI MOOD
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
            app.config[
                "UPLOAD_FOLDER"
            ],
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

        total_duration = len(
            audio
        ) / sr

        section_duration = 10

        sections = []

        mood_counts = {}

        start = 0

        while start < total_duration:

            end = min(
                start + section_duration,
                total_duration
            )

            start_sample = int(
                start * sr
            )

            end_sample = int(
                end * sr
            )

            section_audio = audio[
                start_sample:end_sample
            ]

            if len(section_audio) == 0:

                break

            result = predict_mood_from_audio(
                section_audio,
                sr
            )

            mood = result[
                "mood"
            ]

            mood_counts[
                mood
            ] = mood_counts.get(
                mood,
                0
            ) + 1

            sections.append({

                "start":
                    round(
                        start,
                        2
                    ),

                "end":
                    round(
                        end,
                        2
                    ),

                "mood":
                    mood,

                "confidence":
                    result[
                        "confidence"
                    ],

                "intensity":
                    result[
                        "intensity"
                    ],

                "rms":
                    result[
                        "rms"
                    ],

                "tempo":
                    result[
                        "tempo"
                    ],

                "probabilities":
                    result[
                        "probabilities"
                    ]
            })

            start += section_duration

        # ==================================
        # MOOD SUMMARY
        # ==================================

        total_sections = len(
            sections
        )

        moods = []

        for mood_name, count in mood_counts.items():

            percentage = 0

            if total_sections > 0:

                percentage = round(
                    (
                        count
                        /
                        total_sections
                    )
                    * 100,
                    2
                )

            mood_confidences = [

                section[
                    "confidence"
                ]

                for section in sections

                if section[
                    "mood"
                ] == mood_name
            ]

            average_confidence = 0

            if mood_confidences:

                average_confidence = round(
                    sum(
                        mood_confidences
                    )
                    /
                    len(
                        mood_confidences
                    )
                )

            moods.append({

                "mood":
                    mood_name,

                "percentage":
                    percentage,

                "confidence":
                    average_confidence
            })

        # ==================================
        # MOOD JOURNEY
        # ==================================

        journey = [

            section[
                "mood"
            ]

            for section in sections
        ]

        # ==================================
        # UNIQUE MOOD JOURNEY
        # ==================================

        unique_journey = []

        for section in sections:

            current_mood = section[
                "mood"
            ]

            if (
                not unique_journey
                or
                unique_journey[-1]
                != current_mood
            ):

                unique_journey.append(
                    current_mood
                )

        # ==================================
        # MOOD CHANGES
        # ==================================

        mood_changes = max(
            len(
                unique_journey
            ) - 1,
            0
        )

        # ==================================
        # FINAL RESPONSE
        # ==================================

        return jsonify({

            "success":
                True,

            "filename":
                filename,

            "moods":
                moods,

            "journey":
                journey,

            "unique_journey":
                unique_journey,

            "mood_changes":
                mood_changes,

            "sections":
                sections
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
# HISTORY
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
# DELETE ONE HISTORY RECORD
# ==========================================

@app.route(
    "/history/<int:prediction_id>",
    methods=["DELETE"]
)
def delete_history(
    prediction_id
):

    try:

        delete_prediction(
            prediction_id
        )

        return jsonify({

            "success":
                True,

            "message":
                "Prediction deleted successfully."
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
# CLEAR HISTORY
# ==========================================

@app.route(
    "/history",
    methods=["DELETE"]
)
def clear_history():

    try:

        clear_predictions()

        return jsonify({

            "success":
                True,

            "message":
                "Prediction history cleared."
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
# RUN SERVER
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )