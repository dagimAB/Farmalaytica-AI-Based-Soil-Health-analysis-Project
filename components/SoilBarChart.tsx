import React from "react";

interface SoilBarChartProps {
  userLevels: { N: number; P: number; K: number };
  idealLevels: { N: number; P: number; K: number };
  showTargetLine?: boolean;
}

export default function SoilBarChart({
  userLevels,
  idealLevels,
}: SoilBarChartProps) {
  const nutrients = ["N", "P", "K"] as const;
  return (
    <div className="card">
      <h4 className="card-title">N-P-K Levels</h4>
      <div className="stats-list">
        {nutrients.map((nutrient) => {
          const userVal = userLevels[nutrient];
          const idealVal = idealLevels[nutrient];
          const max = Math.max(userVal, idealVal, 1);
          return (
            <div key={nutrient}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  marginBottom: "0.25rem",
                }}
              >
                <span className="stat-label">{nutrient}</span>
                <span className="stat-sub">
                  User: {userVal} | Ideal: {idealVal}
                </span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div className="bar-container">
                  {/* User value bar */}
                  <div
                    className="bar user-bar"
                    style={{ width: `${(userVal / max) * 100}%` }}
                  />
                  {/* Ideal value bar */}
                  <div
                    className="bar ideal-bar"
                    style={{ width: `${(idealVal / max) * 100}%` }}
                  />
                  {/* Target line for ideal value */}
                  {typeof idealVal === "number" &&
                    typeof userLevels === "object" &&
                    typeof idealLevels === "object" && (
                      <>
                        <div
                          className="target-line"
                          style={{
                            left: `calc(${(idealVal / max) * 100}% - 2px)`,
                            zIndex: 10,
                          }}
                          title="Ideal Target"
                        />
                      </>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
