import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Paths - Adjusted to point to root from the scripts folder
DATA_PATH = os.path.join(os.path.dirname(__file__), '../training_data.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../farmalytica_model.pkl')

print("--- Phase 3: AI Training for Farmalytica ---")

# 1. Load a random sample to save RAM (200k rows is statistically significant)
print(f"Loading data from {DATA_PATH}...")
df = pd.read_csv(DATA_PATH)

# 2. Professional Ethiopian Soil Quality Labeling Logic (EthioSIS Standards)
def label_soil_health(row):
    # Introduce a small buffer so edge values move to the higher category
    eps = 0.1

    # Nitrogen (mg/kg)
    if row['N'] < 25 - eps:
        n_score = 1  # Poor
    elif row['N'] < 50 - eps:
        n_score = 2  # Average
    elif row['N'] < 100 - eps:
        n_score = 3  # Optimal
    else:
        n_score = 4  # Very High

    # Phosphorus (mg/kg)
    if row['P'] < 15 - eps:
        p_score = 1  # Poor
    elif row['P'] < 35 - eps:
        p_score = 2  # Average
    elif row['P'] < 75 - eps:
        p_score = 3  # Optimal
    else:
        p_score = 4  # Very High

    # Potassium (mg/kg)
    if 'K' in row:
        if row['K'] < 60 - eps:
            k_score = 1  # Poor
        elif row['K'] < 130 - eps:
            k_score = 2  # Average
        elif row['K'] < 250 - eps:
            k_score = 3  # Optimal
        else:
            k_score = 4  # Very High
    else:
        k_score = 2  # If missing, assume average

    # pH (Acidity) with buffer
    ph = row['pH']
    if (6.0 - eps) <= ph <= (7.5 + eps):
        ph_score = 3  # Optimal
    elif ((5.5 - eps) <= ph < (6.0 - eps)) or ((7.5 + eps) < ph <= (8.5 + eps)):
        ph_score = 2  # Average
    else:
        ph_score = 1  # Poor (acidic <5.5 or alkaline >8.5)

    # Combined Health Index (N, P, K, pH)
    total = n_score + p_score + k_score + ph_score
    # total possible max = 13
    if total <= 5:
        return 'Poor'
    if total <= 9:
        return 'Average'
    return 'Optimal'

print("Labeling data based on Ethiopian Institutional Guidelines (vectorized)...")
# Ensure numeric columns for vectorized computation
df['N'] = pd.to_numeric(df['N'], errors='coerce')
df['P'] = pd.to_numeric(df['P'], errors='coerce')
df['K'] = pd.to_numeric(df['K'], errors='coerce')
df['pH'] = pd.to_numeric(df['pH'], errors='coerce')

# Clip extreme outliers to realistic agronomic ranges
df['N'] = df['N'].clip(lower=0, upper=200)
df['P'] = df['P'].clip(lower=0, upper=200)
df['K'] = df['K'].clip(lower=0, upper=300)
df['pH'] = df['pH'].clip(lower=0, upper=14)

# Quick diagnostics
print('N percentiles:', np.nanpercentile(df['N'].values, [0,50,95,99]))

# Drop missing essential values (N, P, pH)
df = df.dropna(subset=['N', 'P', 'pH']).reset_index(drop=True)

n = df['N'].values
p = df['P'].values
k = df['K'].values
ph = df['pH'].values

# Nitrogen score (use realistic ranges; Optimal-like N ~80+)
n_score = np.select([n < 10, n < 30, n < 80], [1, 2, 3], default=4)

# Phosphorus score
p_score = np.select([p < 15, p < 30], [1, 2], default=3)

# Potassium score (treat missing as medium)
k_score = np.select([k < 40, k < 80], [1, 2], default=3)
k_score = np.where(np.isnan(k), 2, k_score)

# pH score
ph_score = np.select([
    (ph >= 6.0) & (ph <= 7.5),
    ((ph >= 5.5) & (ph < 6.0)) | ((ph > 7.5) & (ph <= 7.8)),
], [3, 2], default=1)

# Combined total and labels
total = n_score + p_score + k_score + ph_score
labels = np.where(total <= 5, 'Poor', np.where(total <= 9, 'Average', 'Optimal'))

# Assign labels to dataframe
df['Health_Label'] = labels

# If there are zero 'Poor' samples, generate synthetic 'Poor' samples so the model can learn that class
poor_count = int((df['Health_Label'] == 'Poor').sum())
if poor_count == 0:
    print("No 'Poor' samples found; generating 5,000 synthetic 'Poor' samples...")
    n_synth = 5000
    rng = np.random.default_rng(42)
    synth_N = rng.uniform(1, 9, size=n_synth)       # N < 10
    synth_P = rng.uniform(1, 14, size=n_synth)      # P < 15
    synth_K = rng.uniform(1, 39, size=n_synth)      # K < 40
    ph_low = rng.uniform(3.5, 5.4, size=n_synth // 2)
    ph_high = rng.uniform(7.9, 9.0, size=n_synth - n_synth // 2)
    synth_pH = np.concatenate([ph_low, ph_high])
    synth_df = pd.DataFrame({"N": synth_N, "P": synth_P, "K": synth_K, "pH": synth_pH})
    synth_df["Health_Label"] = 'Poor'
    df = pd.concat([df, synth_df], ignore_index=True)
    print(f"Synthetic samples added: {n_synth}")

# Class balancing to address underrepresented classes (upsample minority classes)
print("Class distribution before balancing:\n", df['Health_Label'].value_counts())

def balance_classes_proportional(df, label_col='Health_Label'):
    counts = df[label_col].value_counts()
    n_classes = len(counts)
    # target per class is total rows divided by number of classes, capped at 100000 per class for full training
    target = min(int(len(df) / n_classes), 100000)
    dfs = [df[df[label_col] == cls] for cls in counts.index]
    resampled = []
    for cls_df in dfs:
        if len(cls_df) < target:
            resampled.append(cls_df.sample(target, replace=True, random_state=42))
        else:
            resampled.append(cls_df.sample(target, replace=False, random_state=42))
    return pd.concat(resampled).sample(frac=1, random_state=42).reset_index(drop=True)

balanced = balance_classes_proportional(df)
print("Class distribution after balancing:\n", balanced['Health_Label'].value_counts())

# Sample the balanced dataset to the target size for training
df_sample = balanced.sample(n=min(200000, len(balanced)), random_state=42)

# 3. Features and target
X = df_sample[['N', 'P', 'K', 'pH']].values
y = df_sample['Health_Label']

# 4. Split data (80% Train, 20% Test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Train RandomForestClassifier
# n_jobs=-1 uses all CPU cores for speed
print("Training the AI Brain (Random Forest) with class_weight='balanced'...")
# Define and verify feature ordering
feature_cols = ['N', 'P', 'K', 'pH']
print("Feature columns used for training:", feature_cols)
print(df_sample[feature_cols].head(3).to_string(index=False))

# Save model metadata (feature order) for inference validation
import json
MODEL_META_PATH = os.path.join(os.path.dirname(__file__), '../model_meta.json')
with open(MODEL_META_PATH, 'w') as fh:
    json.dump({'features': feature_cols}, fh)
print(f"Saved model metadata -> {MODEL_META_PATH}")

clf = RandomForestClassifier(n_estimators=100, n_jobs=-1, random_state=42, class_weight='balanced')
clf.fit(X_train, y_train)

# 6. Evaluate
y_pred = clf.predict(X_test)
print(f"\nTraining Results:")
print(f"Accuracy Score: {accuracy_score(y_test, y_pred):.4f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# 7. Save model
joblib.dump(clf, MODEL_PATH)
print(f"\nSuccess! Model saved to: {MODEL_PATH}")