"use client";

import React from "react";

type Props = {
  location?: string;
  temp?: number;
  description?: string;
  rain24h?: number;
  warning?: string | null;
};

export default function WeatherCard({
  location = "Local",
  temp,
  description,
  rain24h,
  warning,
}: Props) {
  return (
    <div
      className="card"
      style={{ display: "flex", gap: "1rem", alignItems: "center" }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 12,
          background: "rgba(255,255,255,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* simple cloud icon */}
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 17.58A4.992 4.992 0 0017 9h-1.26A6 6 0 106 17"
            stroke="#fff"
            strokeOpacity="0.9"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ fontWeight: 700 }}>{location}</div>
          {typeof temp === "number" && (
            <div style={{ fontWeight: 700 }}>{temp}°C</div>
          )}
          {description && (
            <div style={{ color: "var(--color-text-muted)" }}>
              {description}
            </div>
          )}
        </div>
        <div style={{ marginTop: "0.5rem", color: "var(--color-text-muted)" }}>
          {typeof rain24h === "number"
            ? `Next 24h rain: ${rain24h.toFixed(1)} mm`
            : "No forecast available"}
        </div>
        {warning && (
          <div className="alert" style={{ marginTop: "0.75rem" }}>
            {warning}
          </div>
        )}
      </div>
    </div>
  );
}
