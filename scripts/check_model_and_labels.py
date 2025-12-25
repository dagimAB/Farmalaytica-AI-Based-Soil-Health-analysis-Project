import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../farmalytica_model.pkl')
print('Model path:', MODEL_PATH)
try:
    model = joblib.load(MODEL_PATH)
    print('Loaded model. Classes:', getattr(model, 'classes_', None))
except Exception as e:
    print('Could not load model:', e)

# Local label function (same logic as train_model.py)
def label_soil_health(sample):
    n = sample['N']; p = sample['P']; k = sample['K']; ph = sample['pH']
    eps = 0.1
    # Nitrogen
    if n < 25 - eps:
        n_score = 1
    elif n < 50 - eps:
        n_score = 2
    elif n < 100 - eps:
        n_score = 3
    else:
        n_score = 4
    # Phosphorus
    if p < 15 - eps:
        p_score = 1
    elif p < 35 - eps:
        p_score = 2
    elif p < 75 - eps:
        p_score = 3
    else:
        p_score = 4
    # Potassium
    if k < 60 - eps:
        k_score = 1
    elif k < 130 - eps:
        k_score = 2
    elif k < 250 - eps:
        k_score = 3
    else:
        k_score = 4
    # pH
    if (6.0 - eps) <= ph <= (7.5 + eps):
        ph_score = 3
    elif ((5.5 - eps) <= ph < (6.0 - eps)) or ((7.5 + eps) < ph <= (8.5 + eps)):
        ph_score = 2
    else:
        ph_score = 1
    total = n_score + p_score + k_score + ph_score
    if total <= 5:
        return 'Poor'
    if total <= 9:
        return 'Average'
    return 'Optimal'

# Use model metadata to ensure feature order matches training
try:
    META_PATH = os.path.join(os.path.dirname(__file__), '../model_meta.json')
    import json
    with open(META_PATH, 'r') as fh:
        meta = json.load(fh)
    feature_order = meta.get('features', ['N','P','K','pH'])
    print('Loaded feature order from meta:', feature_order)
except Exception as e:
    print('Could not load model_meta.json, defaulting feature order to N,P,K,pH:', e)
    feature_order = ['N','P','K','pH']

samples = [
    {'N':5,'P':10,'K':30,'pH':5.2},
    {'N':25,'P':20,'K':50,'pH':6.5},
    {'N':95,'P':75,'K':120,'pH':6.8}
]

for s in samples:
    print('Sample:', s, 'Label:', label_soil_health(s))
    try:
        # Build input array in correct feature order
        x = [float(s[f]) for f in feature_order]
        pred = model.predict([x])
        print('Model prediction:', pred[0])
    except Exception as e:
        print('Model predict error:', e)
