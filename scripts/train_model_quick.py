import pandas as pd
import numpy as np
import joblib
import os
import json
import collections
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Setup Paths
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, '../farmalytica_model.pkl')
MODEL_META_PATH = os.path.join(BASE_DIR, '../model_meta.json')

print("--- Quick AI Training (International Standards) for Farmalytica ---")
print("Creating balanced synthetic dataset with boundary-fix for N=25...")

rng = np.random.default_rng(42)
n_per_class = 10000
feature_cols = ['N', 'P', 'K', 'pH']

# --- DATA GENERATION WITH BOUNDARY BUFFERS ---

# Poor: N(0-24.9), P(0-14.9), K(0-59.9)
poor = pd.DataFrame({
    'N': rng.uniform(0, 24.9, size=n_per_class),
    'P': rng.uniform(0, 14.9, size=n_per_class),
    'K': rng.uniform(0, 59.9, size=n_per_class),
    'pH': np.concatenate([rng.uniform(3.0, 5.49, size=n_per_class//2), 
                         rng.uniform(8.51, 9.5, size=n_per_class - n_per_class//2)])
})
poor['Health_Label'] = 'Poor'

# Average: N(25.0-50), P(15.0-35), K(60.0-130)
avg = pd.DataFrame({
    'N': rng.uniform(25.0, 50, size=n_per_class),
    'P': rng.uniform(15.0, 35, size=n_per_class),
    'K': rng.uniform(60.0, 130, size=n_per_class),
    'pH': np.concatenate([rng.uniform(5.5, 5.99, size=n_per_class//2), 
                         rng.uniform(7.51, 8.5, size=n_per_class - n_per_class//2)])
})
avg['Health_Label'] = 'Average'

# Optimal: N(50.1-100), P(35.1-75), K(130.1-250)
opt = pd.DataFrame({
    'N': rng.uniform(50.1, 100, size=n_per_class),
    'P': rng.uniform(35.1, 75, size=n_per_class),
    'K': rng.uniform(130.1, 250, size=n_per_class),
    'pH': rng.uniform(6.0, 7.5, size=n_per_class)
})
opt['Health_Label'] = 'Optimal'

# Merge and Shuffle
df = pd.concat([poor, avg, opt], ignore_index=True).sample(frac=1, random_state=42)

# --- TRAINING ---

X = df[feature_cols].values
y = df['Health_Label']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = DecisionTreeClassifier(random_state=42, max_depth=10)
clf.fit(X_train, y_train)

# --- SAVING & LOGS ---

# Save metadata for frontend feature order
with open(MODEL_META_PATH, 'w') as fh:
    json.dump({'features': feature_cols}, fh)

# Save the trained brain
joblib.dump(clf, MODEL_PATH)

print(f"Accuracy: {accuracy_score(y_test, clf.predict(X_test)):.4f}")
print("Training class distribution:", collections.Counter(y_train))
print(f"Model saved to: {MODEL_PATH}")
print("Done! Now run 'python check_model_and_labels.py' to verify the N=25 fix.")