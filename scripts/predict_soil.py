import sys
import joblib
import os
import json

# Path to your saved brain
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../farmalytica_model.pkl')


def predict():
    try:
        # Load the model
        model = joblib.load(MODEL_PATH)

        # Get data from Node.js (passed as command line arguments)
        # Order: N, P, K, pH
        n = float(sys.argv[1])
        p = float(sys.argv[2])
        k = float(sys.argv[3])
        ph = float(sys.argv[4])

        # Make prediction
        prediction = model.predict([[n, p, k, ph]])

        # Output JSON result (stdout)
        print(json.dumps({"prediction": str(prediction[0])}))

    except Exception as e:
        # Print error JSON to stderr and exit with non-zero status
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    predict()
