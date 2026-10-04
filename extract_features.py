import os
import librosa
import numpy as np
import pandas as pd

DATASET_PATH = "dataset"
OUTPUT_FILE = "dataset_features.csv"

rows = []

print("Starting feature extraction...")
print()

for mood in os.listdir(DATASET_PATH):

    folder = os.path.join(DATASET_PATH, mood)

    # फक्त mood folders process करायचे
    if not os.path.isdir(folder) or mood == "audio":
        continue

    files = [
        f for f in os.listdir(folder)
        if f.lower().endswith(".wav")
    ]

    print(f"Processing {mood}: {len(files)} files")

    for i, filename in enumerate(files, start=1):

        file_path = os.path.join(folder, filename)

        try:
            audio, sr = librosa.load(file_path, sr=None)

            # MFCC
            mfcc = librosa.feature.mfcc(
                y=audio,
                sr=sr,
                n_mfcc=13
            )

            # Chroma
            chroma = librosa.feature.chroma_stft(
                y=audio,
                sr=sr
            )

            # RMS
            rms = librosa.feature.rms(y=audio)

            # Zero Crossing Rate
            zcr = librosa.feature.zero_crossing_rate(audio)

            # Average features
            features = {}

            for j in range(13):
                features[f"mfcc_{j+1}"] = float(
                    np.mean(mfcc[j])
                )

            for j in range(12):
                features[f"chroma_{j+1}"] = float(
                    np.mean(chroma[j])
                )

            features["rms"] = float(np.mean(rms))
            features["zcr"] = float(np.mean(zcr))

            # Mood label
            features["mood"] = mood

            rows.append(features)

            if i % 50 == 0:
                print(f"  {i}/{len(files)} completed")

        except Exception as e:
            print(f"ERROR: {file_path}")
            print(e)

print()
print("Creating CSV...")

df = pd.DataFrame(rows)

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print()
print("===================================")
print("FEATURE EXTRACTION COMPLETED")
print("Total files:", len(df))
print("CSV file:", OUTPUT_FILE)
print("===================================")