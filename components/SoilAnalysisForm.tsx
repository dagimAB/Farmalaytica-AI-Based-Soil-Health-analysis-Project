import React, { useState, useEffect } from "react";
import HealthStatusCard from "./HealthStatusCard";
import SoilBarChart from "./SoilBarChart";
import { getRecommendationsFromLevels } from "@/utils/recommendations";

const IDEAL = { N: 75, P: 55, K: 190, pH: 6.8 };

function getStatus(prediction: string) {
  if (prediction === "Optimal") return "green";
  if (prediction === "Average") return "amber";
  if (prediction === "Poor") return "red";
  return "slate";
}

export default function SoilAnalysisForm() {
  const [inputs, setInputs] = useState({ N: "", P: "", K: "", pH: "" });
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Accept empty string or any numeric input (decimals allowed). We'll convert to Number on submit.
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    // Load recent scans from localStorage
    const scans = localStorage.getItem("recentScans");
    if (scans) setRecentScans(JSON.parse(scans));
  }, []);

  const saveScan = (scan: any) => {
    const updated = [scan, ...recentScans].slice(0, 5);
    setRecentScans(updated);
    localStorage.setItem("recentScans", JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPrediction(null);
    setLoading(true);
    // Use an AbortController to timeout slow requests
    const controller = new AbortController();
    const TIMEOUT_MS = 15000; // 15 seconds
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
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
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (res.ok) {
        setPrediction(data.prediction);
        saveScan({
          date: new Date().toLocaleString(),
          ...inputs,
          prediction: data.prediction,
        });
      } else if (res.status === 504) {
        setError(
          "Prediction timed out (server took too long). Try again or check server status."
        );
      } else {
        setError(data.error || "Prediction failed");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Prediction timed out (client). Try again shortly.");
      } else {
        setError("Network error");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        {(["N", "P", "K", "pH"] as const).map((key) => (
          <div key={key} className="input-group">
            <label htmlFor={key} className="form-label">
              {key === "pH" ? "Soil pH" : `${key} Level`}
            </label>
            <input
              id={key}
              name={key}
              type="number"
              step="any"
              autoComplete="off"
              className="form-input"
              value={inputs[key]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
      </div>
      <button type="submit" className="button-primary" disabled={loading}>
        {loading ? "Analyzing... (may take up to 15s)" : "Analyze Soil"}
      </button>
      {error && <div className="alert alert-error">{error}</div>}
      {/* Loading Skeletons */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card" style={{ height: "4rem" }} />
          <div className="card" style={{ height: "8rem" }} />
          <div className="card" style={{ height: "5rem" }} />
        </div>
      )}
      {/* Results */}
      {prediction && !loading && (
        <>
          <HealthStatusCard status={prediction} />
          <div className="mb-4">
            <div className="card">
              <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                Recommended Actions
              </span>
              <ul
                style={{
                  marginTop: "0.5rem",
                  marginLeft: "1rem",
                  color: "var(--color-text)",
                }}
              >
                {getRecommendationsFromLevels(
                  {
                    N: Number(inputs.N),
                    P: Number(inputs.P),
                    K: Number(inputs.K),
                    pH: Number(inputs.pH),
                  },
                  prediction
                ).map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
          <SoilBarChart
            userLevels={{
              N: Number(inputs.N),
              P: Number(inputs.P),
              K: Number(inputs.K),
            }}
            idealLevels={IDEAL}
            showTargetLine
          />
        </>
      )}
    </form>
  );
}
