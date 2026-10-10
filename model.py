import os
import joblib
import numpy as np
import librosa


# ==========================================
# MODEL PATH
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "mood_model.pkl"
)


print("==========================================")
print("Loading AI Music Mood Classifier Model...")
print("Model Path:", MODEL_PATH)
print("==========================================")


# ==========================================
# LOAD TRAINED MODEL
# ==========================================

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Trained model not found: {MODEL_PATH}"
    )


model = joblib.load(MODEL_PATH)


print("Random Forest model loaded successfully!")
print("==========================================")


# ==========================================
# FEATURE EXTRACTION
# ==========================================

def extract_ml_features(file_path):

    # Load audio
    y, sr = librosa.load(
        file_path,
        sr=None,
        mono=True
    )

    if len(y) == 0:
        raise ValueError(
            "Audio file is empty."
        )

    # ======================================
    # MFCC - 13 FEATURES
    # ======================================

    mfcc = librosa.feature.mfcc(
        y=y,
        sr=sr,
        n_mfcc=13
    )

    mfcc_mean = np.mean(
        mfcc,
        axis=1
    )

    # ======================================
    # CHROMA - 12 FEATURES
    # ======================================

    chroma = librosa.feature.chroma_stft(
        y=y,
        sr=sr
    )

    chroma_mean = np.mean(
        chroma,
        axis=1
    )

    # ======================================
    # RMS - 1 FEATURE
    # ======================================

    rms = librosa.feature.rms(
        y=y
    )

    rms_mean = float(
        np.mean(rms)
    )

    # ======================================
    # ZERO CROSSING RATE - 1 FEATURE
    # ======================================

    zcr = librosa.feature.zero_crossing_rate(
        y
    )

    zcr_mean = float(
        np.mean(zcr)
    )

    # ======================================
    # COMBINE 27 FEATURES
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

    # ======================================
    # VALIDATE FEATURES
    # ======================================

    if len(features) != 27:
        raise ValueError(
            f"Expected 27 features, "
            f"got {len(features)}"
        )

    return features


# ==========================================
# PREDICT MOOD FROM AUDIO FILE
# ==========================================

def predict_mood_from_file(file_path):

    # ======================================
    # EXTRACT 27 ML FEATURES
    # ======================================

    features = extract_ml_features(
        file_path
    )

    # Convert to 2D array
    features = features.reshape(
        1,
        -1
    )

    # ======================================
    # PREDICTION
    # ======================================

    prediction = model.predict(
        features
    )[0]

    # ======================================
    # CONFIDENCE + PROBABILITIES
    # ======================================

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

    # ======================================
    # FINAL RESULT
    # ======================================

    return {
        "mood": str(
            prediction
        ).capitalize(),

        "confidence": confidence,

        "intensity": intensity,

        "probabilities": probabilities_dict
    }