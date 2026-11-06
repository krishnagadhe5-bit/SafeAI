"""SafeAI ML Model Training Pipeline.

Reproducible training script that:
1. Loads synthetic dataset from ml/training/demo_training_data.csv (or generates 1,200 baseline rows)
2. Implements ColumnTransformer with numeric and categorical pipelines
3. Fits RandomForestClassifier with balanced class weights
4. Evaluates on stratified 80/20 train/test split
5. Computes Accuracy, F1-Score, Precision, Recall, and Confusion Matrix
6. Saves model artifact to ml/model/model.joblib
"""

import sys
from pathlib import Path
import random
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "ml" / "training" / "demo_training_data.csv"
MODEL_PATH = ROOT / "ml" / "model" / "model.joblib"

NUM_FEATURES = ["crowd_size", "venue_capacity", "temperature_c", "holiday", "previous_incidents"]
CAT_FEATURES = ["weather", "time_slot", "day_of_week", "event_type"]
ALL_FEATURES = NUM_FEATURES + CAT_FEATURES


def ensure_dataset():
    if DATA_PATH.exists():
        return
    random.seed(42)
    rows = []
    weathers = ["Clear", "Cloudy", "Rain", "Heavy Rain", "Extreme Heat"]
    events = ["Normal Operations", "Sports Event", "Concert", "Festival", "Public Gathering"]
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    for _ in range(1200):
        cap = random.randint(1000, 20000)
        crowd = random.randint(100, int(cap * 1.25))
        inc = random.randint(0, 12)
        temp = random.randint(15, 44)
        weather = random.choice(weathers)
        event = random.choice(events)
        holiday = random.randint(0, 1)
        time = random.randint(0, 3)
        day = random.choice(days)

        score = 5 + (crowd / cap) * 35
        score += inc * 3 + holiday * 3
        score += {"Clear": 0, "Cloudy": 2, "Rain": 6, "Heavy Rain": 12, "Extreme Heat": 10}[weather]
        score += {"Normal Operations": 0, "Sports Event": 7, "Concert": 10, "Festival": 9, "Public Gathering": 6}[event]
        score += [0, 5, 11, 3][time]
        score += 4 if day in ["Saturday", "Sunday"] else 0
        score += 6 if temp >= 39 else 0
        score = max(0, min(100, score + random.gauss(0, 3)))

        risk = "Low" if score < 40 else "Medium" if score < 60 else "High" if score < 80 else "Critical"
        rows.append([crowd, cap, temp, holiday, inc, weather, time, day, event, risk])

    df = pd.DataFrame(rows, columns=ALL_FEATURES + ["risk_level"])
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(DATA_PATH, index=False)
    print(f"Generated {len(df)} synthetic rows at {DATA_PATH}")


def train():
    ensure_dataset()
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")

    X = df[ALL_FEATURES]
    y = df["risk_level"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # ColumnTransformer
    prep = ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline([
                    ("imp", SimpleImputer(strategy="median")),
                    ("scale", StandardScaler()),
                ]),
                NUM_FEATURES,
            ),
            (
                "cat",
                Pipeline([
                    ("imp", SimpleImputer(strategy="most_frequent")),
                    ("ohe", OneHotEncoder(handle_unknown="ignore")),
                ]),
                CAT_FEATURES,
            ),
        ]
    )

    pipeline = Pipeline([
        ("prep", prep),
        (
            "rf",
            RandomForestClassifier(
                n_estimators=180,
                max_depth=14,
                min_samples_leaf=2,
                class_weight="balanced",
                random_state=42,
            ),
        ),
    ])

    print("Fitting Random Forest pipeline...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    print(f"\nHoldout Test Accuracy: {acc * 100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred, digits=4))

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": pipeline, "accuracy": acc, "rows": len(df)}, MODEL_PATH)
    print(f"Serialized model artifact to {MODEL_PATH}")


if __name__ == "__main__":
    train()

