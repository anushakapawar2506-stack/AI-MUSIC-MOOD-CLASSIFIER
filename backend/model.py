
import os
import gc
import joblib
import numpy as np
import librosa

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "mood_model.pkl")

if not os.path.isfile(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

model = joblib.load(MODEL_PATH)
print("Random Forest model loaded successfully!", flush=True)


def extract_ml_features(file_path):
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    y = None
    mfcc = chroma = rms = zcr = None

    try:
        y, sr = librosa.load(
            file_path,
            sr=22050,
            mono=True,
            duration=15,
            res_type="kaiser_fast",
            dtype=np.float32,
        )

        if y.size == 0:
            raise ValueError("Audio file is empty or invalid.")

        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_mean = np.mean(mfcc, axis=1)

        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)

        rms = librosa.feature.rms(y=y)
        rms_mean = float(np.mean(rms))

        zcr = librosa.feature.zero_crossing_rate(y=y)
        zcr_mean = float(np.mean(zcr))

        features = np.concatenate([
            mfcc_mean,
            chroma_mean,
            [rms_mean, zcr_mean],
        ]).astype(np.float32)

        if features.shape != (27,):
            raise ValueError(
                f"Expected 27 features, got {features.shape}"
            )

        if not np.all(np.isfinite(features)):
            raise ValueError("Invalid audio feature values.")

        return features

    finally:
        y = None
        mfcc = chroma = rms = zcr = None
        gc.collect()


def predict_mood_from_file(file_path):
    features = None
    feature_array = None
    probabilities = None

    try:
        features = extract_ml_features(file_path)
        feature_array = features.reshape(1, -1)

        prediction = model.predict(feature_array)[0]
        confidence = 0
        probabilities_dict = {}

        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(feature_array)[0]

            for class_name, probability in zip(
                model.classes_, probabilities
            ):
                probabilities_dict[str(class_name).capitalize()] = round(
                    float(probability) * 100, 2
                )

            confidence = round(float(np.max(probabilities)) * 100)

        intensity = (
            "High" if confidence >= 85
            else "Medium" if confidence >= 70
            else "Low"
        )

        return {
            "mood": str(prediction).capitalize(),
            "confidence": confidence,
            "intensity": intensity,
            "probabilities": probabilities_dict,
        }

    finally:
        features = None
        feature_array = None
        probabilities = None
        gc.collect()
