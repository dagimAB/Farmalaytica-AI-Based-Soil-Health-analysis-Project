"use client";

import React, { useEffect, useState } from "react";

export default function FarmSettingsPage() {
  const [name, setName] = useState("");
  const [areaHa, setAreaHa] = useState<number>(1);
  const [primaryCrop, setPrimaryCrop] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/farm");
      const data = await res.json();
      if (res.ok && data.success) {
        const s = data.settings || {};
        setName(s.name || "");
        setAreaHa(s.areaHa || 1);
        setPrimaryCrop(s.primaryCrop || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const save = async () => {
    try {
      const res = await fetch("/api/farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, areaHa, primaryCrop }),
      });
      const data = await res.json();
      if (res.ok && data.success) alert("Saved");
      else alert("Save failed");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ flex: 1, padding: "2.5rem" }}>
      <div className="card">
        <h2 className="card-title">Farm Settings</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div>
            <label className="form-label">Farm Name</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label className="form-label">Total Area (Hectares)</label>
            <input
              className="form-input"
              type="number"
              value={areaHa}
              onChange={(e) => setAreaHa(Number(e.target.value))}
            />
            <label className="form-label">Primary Crop</label>
            <input
              className="form-input"
              value={primaryCrop}
              onChange={(e) => setPrimaryCrop(e.target.value)}
            />
            <div style={{ marginTop: "1rem" }}>
              <button className="button-primary" onClick={save}>
                Save Settings
              </button>
            </div>
          </div>
          <div style={{ color: "var(--color-text-muted)" }}>
            These settings are used when estimating fertilizer quantities in the
            recommendations.
          </div>
        </div>
      </div>
    </div>
  );
}
