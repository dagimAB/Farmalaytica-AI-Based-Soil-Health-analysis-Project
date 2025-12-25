import numpy as np
import joblib
import os
import json
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from collections import Counter

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, '../farmalytica_model.pkl')
META_PATH = os.path.join(BASE_DIR, '../model_meta.json')

print('--- Minimal Quick Train (no pandas) ---')
rng = np.random.default_rng(42)
n_per_class = 2000  # smaller to run fast

# Poor
poor_N = rng.uniform(0, 24.9, size=n_per_class)
poor_P = rng.uniform(0, 14.9, size=n_per_class)
poor_K = rng.uniform(0, 59.9, size=n_per_class)
poor_pH = np.concatenate([rng.uniform(3.0, 5.49, size=n_per_class//2), rng.uniform(8.51, 9.5, size=n_per_class - n_per_class//2)])
poor = np.stack([poor_N, poor_P, poor_K, poor_pH], axis=1)
poor_y = np.array(['Poor'] * n_per_class)

# Average
avg_N = rng.uniform(25.0, 50, size=n_per_class)
avg_P = rng.uniform(15.0, 35, size=n_per_class)
avg_K = rng.uniform(60.0, 130, size=n_per_class)
avg_pH = np.concatenate([rng.uniform(5.5, 5.99, size=n_per_class//2), rng.uniform(7.51, 8.5, size=n_per_class - n_per_class//2)])
avg = np.stack([avg_N, avg_P, avg_K, avg_pH], axis=1)
avg_y = np.array(['Average'] * n_per_class)

# Optimal
opt_N = rng.uniform(50.1, 100, size=n_per_class)
opt_P = rng.uniform(35.1, 75, size=n_per_class)
opt_K = rng.uniform(130.1, 250, size=n_per_class)
opt_pH = rng.uniform(6.0, 7.5, size=n_per_class)
opt = np.stack([opt_N, opt_P, opt_K, opt_pH], axis=1)
opt_y = np.array(['Optimal'] * n_per_class)

# Merge
X = np.vstack([poor, avg, opt])
y = np.concatenate([poor_y, avg_y, opt_y])

# Shuffle
idx = rng.permutation(len(X))
X = X[idx]
y = y[idx]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = DecisionTreeClassifier(random_state=42, max_depth=12, class_weight='balanced')
clf.fit(X_train, y_train)

# Save meta
with open(META_PATH, 'w') as fh:
    json.dump({'features': ['N', 'P', 'K', 'pH']}, fh)

joblib.dump(clf, MODEL_PATH)

print('Class distribution (train):', Counter(y_train))
print('Accuracy:', accuracy_score(y_test, clf.predict(X_test)))
print('Model written to', MODEL_PATH)
print('Done')