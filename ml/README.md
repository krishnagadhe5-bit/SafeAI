# SafeAI Machine Learning Pipeline Documentation

## 1. Model Overview

- **Algorithm**: `RandomForestClassifier` encapsulated in a scikit-learn `Pipeline`.
- **Hyperparameters**:
  - `n_estimators`: 180
  - `max_depth`: 14
  - `min_samples_leaf`: 2
  - `class_weight`: `"balanced"` (corrects for synthetic class distribution imbalance)
  - `random_state`: 42
- **Preprocessing**: `ColumnTransformer` with numeric scaling and categorical one-hot encoding.
- **Evaluation Strategy**: Stratified 80/20 train/test holdout split.
- **Holdout Accuracy**: 62.92%

## 2. Input Feature Specification

The model strictly requires 9 tabular features in the following exact column order:

| Index | Feature | Type | Expected Range / Values | Preprocessing Step |
|---|---|---|---|---|
| 0 | `crowd_size` | Numeric | $\ge 0$ integer | `SimpleImputer(median)` $\to$ `StandardScaler` |
| 1 | `venue_capacity` | Numeric | $> 0$ integer | `SimpleImputer(median)` $\to$ `StandardScaler` |
| 2 | `temperature_c` | Numeric | -50 to 60 float | `SimpleImputer(median)` $\to$ `StandardScaler` |
| 3 | `holiday` | Numeric (Binary) | 0 or 1 | `SimpleImputer(median)` $\to$ `StandardScaler` |
| 4 | `previous_incidents` | Numeric | $\ge 0$ integer | `SimpleImputer(median)` $\to$ `StandardScaler` |
| 5 | `weather` | Categorical | Clear, Cloudy, Rain, Heavy Rain, Extreme Heat | `SimpleImputer(most_frequent)` $\to$ `OneHotEncoder(ignore)` |
| 6 | `time_slot` | Categorical / Int | 0 (Morning), 1 (Afternoon), 2 (Evening), 3 (Night) | `SimpleImputer(most_frequent)` $\to$ `OneHotEncoder(ignore)` |
| 7 | `day_of_week` | Categorical | Monday - Sunday | `SimpleImputer(most_frequent)` $\to$ `OneHotEncoder(ignore)` |
| 8 | `event_type` | Categorical | Normal Operations, Sports Event, Concert, Festival, Public Gathering | `SimpleImputer(most_frequent)` $\to$ `OneHotEncoder(ignore)` |

## 3. Continuous Risk Score Calculation

The target prediction returns probabilities across the four classes: `['Critical', 'High', 'Low', 'Medium']`.
To compute an intuitive continuous index from 0 to 100:

$$\text{RiskScore} = \text{round}\left(\sum_{i} P(\text{class}_i) \times \text{AnchorScore}(\text{class}_i)\right)$$

Where:
- $\text{AnchorScore}(\text{Low}) = 20$
- $\text{AnchorScore}(\text{Medium}) = 50$
- $\text{AnchorScore}(\text{High}) = 70$
- $\text{AnchorScore}(\text{Critical}) = 90$

Risk Tiers:
- **Low**: Score $< 40$
- **Medium**: Score $40 \le s < 60$
- **High**: Score $60 \le s < 80$
- **Critical**: Score $\ge 80$

## 4. Reproducing Training and Diagnostics

To re-run training:
```bash
python ml/training/train.py
```

To run model diagnostics and print the classification report & confusion matrix:
```bash
python ml/evaluation/evaluate.py
```

## 5. Important Academic Limitations

- The dataset (`demo_training_data.csv`) is **synthetic**.
- The accuracy reflects performance against synthetic rules, not real-world safety efficacy.
- Do not use this model for operational emergency dispatch or live safety enforcement.

