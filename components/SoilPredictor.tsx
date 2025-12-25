import React, { useState } from "react";

const labelColors: Record<string, string> = {
  Optimal: "status-optimal",
  Average: "status-average",
  Poor: "status-poor",
};

export default function SoilPredictor() {
  const [inputs, setInputs] = useState({ N: "", P: "", K: "", pH: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          N: Number(inputs.N),
          P: Number(inputs.P),
          K: Number(inputs.K),
          pH: Number(inputs.pH),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Map numeric prediction to label (customize as needed)
        let label = "Average";
        if (data.prediction === "0") label = "Poor";
        if (data.prediction === "1") label = "Average";
        if (data.prediction === "2") label = "Optimal";
        setResult(label);
      } else {
        setError(data.error || "Prediction failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card--narrow">
      <h2 className="card-title">Soil Health Predictor</h2>
      <form onSubmit={handleSubmit} className="form">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div>
            <label className="form-label">Nitrogen (N)</label>
            <input
              type="number"
              name="N"
              value={inputs.N}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Phosphorus (P)</label>
            <input
              type="number"
              name="P"
              value={inputs.P}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Potassium (K)</label>
            <input
              type="number"
              name="K"
              value={inputs.K}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">pH</label>
            <input
              type="number"
              name="pH"
              value={inputs.pH}
              onChange={handleChange}
              className="form-input"
              step="0.01"
              required
            />
          </div>
        </div>
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                className="spinner"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              </svg>
              Analyzing...
            </span>
          ) : (
            "Analyze Soil"
          )}
        </button>
      </form>
      {result && (
        <div className={`alert ${labelColors[result] || ""}`}>{result}</div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
    </div>
  );
}
