import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# ==========================================
# 1. Load Dataset
# ==========================================

print("Loading dataset...")

df = pd.read_csv("dataset_features.csv")

print("Dataset shape:", df.shape)

# ==========================================
# 2. Separate Features and Labels
# ==========================================

X = df.drop("mood", axis=1)
y = df["mood"]

print("Features:", X.shape)
print("Labels:", y.shape)

# ==========================================
# 3. Train-Test Split
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))

# ==========================================
# 4. Create Random Forest Model
# ==========================================

print()
print("Training Random Forest model...")

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# ==========================================
# 5. Test Model
# ==========================================

print()
print("Testing model...")

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print()
print("===================================")
print("MODEL TRAINING COMPLETED")
print("===================================")
print("Accuracy:", round(accuracy * 100, 2), "%")

print()
print("Classification Report:")
print(classification_report(y_test, y_pred))

# ==========================================
# 6. Save Model
# ==========================================

model_file = "mood_model.pkl"

joblib.dump(model, model_file)

print()
print("===================================")
print("MODEL SAVED")
print("File:", model_file)
print("===================================")