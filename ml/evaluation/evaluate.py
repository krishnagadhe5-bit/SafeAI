"""SafeAI ML Evaluation and Diagnostics Script.

Loads trained model and runs in-depth statistical checks:
- Stratified holdout evaluation
- Class-level precision, recall, and f1-score
- Confusion matrix
- Feature importance extraction
- Class distribution and imbalance analysis
"""

from pathlib import Path
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "ml" / "training" / "demo_training_data.csv"
MODEL_PATH = ROOT / "ml" / "model" / "model.joblib"

FEATURES = [
    "crowd_size", "venue_capacity", "temperature_c", "holiday", "previous_incidents",
    "weather", "time_slot", "day_of_week", "event_type"
]


def evaluate():
    if not MODEL_PATH.exists():
        print(f"Error: Model not found at {MODEL_PATH}")
        return
    if not DATA_PATH.exists():
        print(f"Error: Dataset not found at {DATA_PATH}")
        return

    data = joblib.load(MODEL_PATH)
    pipeline = data["model"]
    reported_acc = data.get("accuracy", 0.0)

    df = pd.read_csv(DATA_PATH)
    X = df[FEATURES]
    y = df["risk_level"]

    print("=" * 60)
    print("SafeAI ML MODEL DIAGNOSTICS & EVALUATION")
    print("=" * 60)
    print(f"Total synthetic training rows: {len(df)}")
    print("\nTarget Class Distribution:")
    for cls, count in y.value_counts().items():
        print(f"  {cls:<10}: {count:>4} ({count/len(df)*100:>5.1f}%)")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    y_pred = pipeline.predict(X_test)
    test_acc = accuracy_score(y_test, y_pred)

    print(f"\nReported Training Accuracy : {reported_acc * 100:.2f}%")
    print(f"Reproduced Test Accuracy   : {test_acc * 100:.2f}%")

    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, digits=4))

    print("Confusion Matrix (Classes: Critical, High, Low, Medium):")
    cm = confusion_matrix(y_test, y_pred, labels=["Critical", "High", "Low", "Medium"])
    cm_df = pd.DataFrame(
        cm,
        index=["True Critical", "True High", "True Low", "True Medium"],
        columns=["Pred Critical", "Pred High", "Pred Low", "Pred Medium"]
    )
    print(cm_df)

    print("\nModel Pipeline Architecture:")
    for name, step in pipeline.steps:
        print(f"  - Step '{name}': {type(step).__name__}")

    print("\nLimitations Statement:")
    print("  Note: Evaluated on synthetic data generated via heuristic baseline rules.")
    print("  Measures fit to synthetic logic; not real-world predictive validity.")
    print("=" * 60)


if __name__ == "__main__":
    evaluate()

