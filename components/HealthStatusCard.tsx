import React from "react";

export default function HealthStatusCard({ status }: { status: string }) {
  let label = status;
  if (status === "Optimal") {
    label = "Optimal";
  } else if (status === "Average") {
    label = "Average";
  } else if (status === "Poor") {
    label = "Poor";
  }
  const statusClass =
    status === "Optimal"
      ? "status-optimal"
      : status === "Average"
      ? "status-average"
      : status === "Poor"
      ? "status-poor"
      : "";
  return (
    <div className={`card ${statusClass}`} style={{ marginBottom: "1rem" }}>
      <span style={{ fontWeight: 700, fontSize: "1rem" }}>Health Status:</span>
      <span
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}
