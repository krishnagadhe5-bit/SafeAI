"""ML model loading and prediction service.

The existing model is a scikit-learn Pipeline with:
  Step 1 — ColumnTransformer ('prep'):
      num: SimpleImputer(median) + StandardScaler -> [crowd_size, venue_capacity, temperature_c, holiday, previous_incidents]
      cat: SimpleImputer(most_frequent) + OneHotEncoder(handle_unknown=ignore) -> [weather, time_slot, day_of_week, event_type]
  Step 2 — RandomForestClassifier ('rf')

CRITICAL: time_slot in the model is an integer (0=Morning, 1=Afternoon, 2=Evening, 3=Night).
CRITICAL: holiday in the model is an integer (0 or 1).
CRITICAL: Feature column order must be exactly:
  [crowd_size, venue_capacity, temperature_c, holiday, previous_incidents, weather, time_slot, day_of_week, event_type]
"""

import logging
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from app.core.config import settings

logger = logging.getLogger(__name__)

TIME_SLOT_MAP = {"Morning": 0, "Afternoon": 1, "Evening": 2, "Night": 3}

FEATURE_COLUMNS = [
    "crowd_size", "venue_capacity", "temperature_c", "holiday", "previous_incidents",
    "weather", "time_slot", "day_of_week", "event_type",
]

CLASS_SCORES = {"Low": 20, "Medium": 50, "High": 70, "Critical": 90}


class MLService:
    """Singleton-style ML model service."""

    def __init__(self):
        self._model = None
        self._accuracy: float = 0.0
        self._training_rows: int = 0
        self._classes: list[str] = []

    def load(self, model_path: str | None = None) -> None:
        target = Path(model_path or settings.MODEL_PATH)
        if not target.is_absolute():
            resolved = Path(__file__).resolve().parents[2] / target
        else:
            resolved = target

        # Robust multi-path resolution
        if not resolved.exists():
            candidates = [
                Path(__file__).resolve().parents[1] / "model.joblib",
                Path(__file__).resolve().parents[2] / "backend" / "model.joblib",
                Path(__file__).resolve().parents[2] / "ml" / "model" / "model.joblib",
                Path("model.joblib").resolve(),
                Path("backend/model.joblib").resolve(),
            ]
            for c in candidates:
                if c.exists():
                    resolved = c
                    break
            else:
                raise FileNotFoundError(f"Model file not found at {resolved} or fallback locations")

        data = joblib.load(resolved)
        self._model = data["model"]
        self._accuracy = data.get("accuracy", 0.0)
        self._training_rows = data.get("rows", 0)
        self._classes = list(self._model.classes_)
        logger.info(
            "ML model loaded from %s: accuracy=%.3f, rows=%d, classes=%s",
            resolved, self._accuracy, self._training_rows, self._classes,
        )
            self._accuracy, self._training_rows, self._classes,
        )

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    @property
    def accuracy(self) -> float:
        return self._accuracy

    @property
    def training_rows(self) -> int:
        return self._training_rows

    @property
    def classes(self) -> list[str]:
        return self._classes

    @property
    def version(self) -> str:
        return f"RF-v1-{self._training_rows}rows-acc{self._accuracy:.3f}"

    def predict(self, inputs: dict[str, Any]) -> dict[str, Any]:
        """Run prediction with proper preprocessing.

        Args:
            inputs: dict with keys matching the assessment input fields.
                    time_slot should be a string (Morning/Afternoon/Evening/Night).
                    holiday should be a bool or int.

        Returns:
            dict with risk_level, risk_score, confidence, probabilities.
        """
        if not self.is_loaded:
            raise RuntimeError("ML model not loaded. Call load() first.")

        # Prepare the feature row with correct types and order
        row = {
            "crowd_size": int(inputs["crowd_size"]),
            "venue_capacity": int(inputs["venue_capacity"]),
            "temperature_c": float(inputs["temperature_c"]),
            "holiday": 1 if inputs.get("holiday") in (True, 1, "1", "true", "Yes") else 0,
            "previous_incidents": int(inputs.get("previous_incidents", 0)),
            "weather": str(inputs["weather"]),
            "time_slot": TIME_SLOT_MAP.get(str(inputs["time_slot"]), 0),
            "day_of_week": str(inputs["day_of_week"]),
            "event_type": str(inputs["event_type"]),
        }

        frame = pd.DataFrame([row], columns=FEATURE_COLUMNS)

        # Get prediction and probabilities
        probabilities = self._model.predict_proba(frame)[0]
        max_confidence = float(max(probabilities)) * 100

        # Calculate weighted risk score
        score = round(sum(
            float(p) * CLASS_SCORES.get(str(label), 50)
            for label, p in zip(self._model.classes_, probabilities)
        ))
        score = max(0, min(100, score))

        # Determine risk level from score
        if score < 40:
            risk_level = "Low"
        elif score < 60:
            risk_level = "Medium"
        elif score < 80:
            risk_level = "High"
        else:
            risk_level = "Critical"

        return {
            "risk_level": risk_level,
            "risk_score": score,
            "confidence": round(max_confidence, 1),
            "probabilities": {
                str(label): round(float(p), 4)
                for label, p in zip(self._model.classes_, probabilities)
            },
            "model_version": self.version,
        }


# Module-level singleton
ml_service = MLService()

