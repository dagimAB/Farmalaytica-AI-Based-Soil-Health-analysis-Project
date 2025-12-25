"use client";

import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import SoilAnalysisForm from "../components/SoilAnalysisForm";
import SuccessToast from "../components/SuccessToast";
import WeatherCard from "../components/WeatherCard";
import AdviceAccordion from "../components/AdviceAccordion";
import { getRecommendationsFromLevels } from "@/utils/recommendations";

export default function HomePage() {
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [weather, setWeather] = useState<any | null>(null);
  const [farmSettings, setFarmSettings] = useState<any | null>(null);

  // hold last seen reading id so dashboard can show a toast when a new reading is saved
  useEffect(() => {
    if (recentScans.length > 0 && !lastSeenIdRef.current) {
      lastSeenIdRef.current = recentScans[0].id;
    }
  }, [recentScans]);
  const lastSeenIdRef = useRef<string | null>(null);

  // control which recommendation is open (for nutrient cards)
  const [adviceOpen, setAdviceOpen] = useState<number | null>(0);

  const addTaskFromAdvice = async (
    category = "soil",
    title?: string,
    description?: string
  ) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "AI Recommendation",
          description: description || "",
          category,
          createdFrom: "AI Recommendation",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage("Task added");
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 4000);
      } else {
        setToastMessage(data.error || "Failed to add task");
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 4000);
      }
    } catch (e) {
      setToastMessage("Network error");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 4000);
    }
  };

  // Fetch recent scans from the sensor API
  const fetchRecent = async () => {
    try {
      const res = await fetch("/api/sensor");
      if (!res.ok) {
        console.error("Failed to fetch recent scans", res.status);
        return;
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.readings)) {
        // normalize fields for display
        const normalized = data.readings.map((r: any) => ({
          id: r._id,
          date: new Date(r.createdAt).toLocaleString(),
          N: r.nitrogen,
          P: r.phosphorus,
          K: r.potassium,
          pH: r.pH,
          prediction: r.prediction || "--",
        }));

        setRecentScans(normalized);

        // If we have a last seen id and the newest reading is different, show toast
        if (normalized.length > 0) {
          const newest = normalized[0];
          if (lastSeenIdRef.current && lastSeenIdRef.current !== newest.id) {
            setToastMessage("New reading saved");
            setToastVisible(true);
            // auto-hide after 5s
            setTimeout(() => setToastVisible(false), 5000);
          }
          lastSeenIdRef.current = newest.id;
        } else {
          // no readings
        }

        // enable the Add to Task button if displayed
        setTimeout(() => {
          const btn = document.getElementById("addTaskBtn");
          if (btn) {
            btn.addEventListener("click", async () => {
              // Compose task content
              const title = weather?.message
                ? weather.message
                : recentScans[0]?.prediction === "Poor"
                ? "Soil: Investigate and treat"
                : "Action needed";
              const description = `Auto-generated task: Soil ${
                recentScans[0]?.prediction || ""
              } | Weather note: ${weather?.message || ""}`;
              try {
                const res = await fetch("/api/tasks", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title, description }),
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  setToastMessage("Task added");
                  setToastVisible(true);
                  setTimeout(() => setToastVisible(false), 4000);
                } else {
                  setToastMessage(data.error || "Failed to add task");
                  setToastVisible(true);
                  setTimeout(() => setToastVisible(false), 4000);
                }
              } catch (e) {
                setToastMessage("Network error");
                setToastVisible(true);
                setTimeout(() => setToastVisible(false), 4000);
              }
            });
          }
        }, 250);
      }
    } catch (err) {
      console.error("Error fetching recent scans", err);
    }
  };

  useEffect(() => {
    // Initial load
    fetchRecent();

    // Poll every 10 seconds for new readings
    const id = setInterval(fetchRecent, 10000);

    // Also fetch weather once at load and every 5 minutes
    const fetchWeather = async () => {
      try {
        const res = await fetch("/api/weather");
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.success && data.weather) {
          setWeather(data.weather);
        }
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    };

    // Fetch farm settings
    const fetchFarm = async () => {
      try {
        const r = await fetch("/api/farm");
        if (!r.ok) return;
        const d = await r.json();
        if (d && d.success) setFarmSettings(d.settings || null);
      } catch (e) {
        console.error("Farm fetch failed", e);
      }
    };

    fetchWeather();
    fetchFarm();
    const weatherId = setInterval(fetchWeather, 5 * 60 * 1000);

    return () => {
      clearInterval(id);
      clearInterval(weatherId);
    };
  }, []);

  return (
    <div className="dashboard-container bg-slate-50 dark:bg-slate-950 min-h-screen">
      <SuccessToast visible={toastVisible} message={toastMessage} />
      {/* Weather warning: small hint under Navbar on small screens */}
      {weather?.message && (
        <div style={{ position: "fixed", top: 56, right: 16, zIndex: 1000 }}>
          <div className="alert" style={{ borderRadius: 8 }}>
            {weather.message}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <h1 className="sidebar-title">Farmalytica</h1>
        <p
          className="sidebar-subtitle"
          style={{
            marginTop: "0.25rem",
            fontSize: "0.9rem",
            color: "var(--color-text-muted)",
          }}
        >
          AI-Driven Soil Health Intelligence for Precision Agriculture
        </p>
        <nav>
          <a href="#" className="sidebar-link">
            Dashboard
          </a>
          <a href="#" className="sidebar-link">
            Soil Analysis
          </a>
          <a href="#" className="sidebar-link">
            Reports
          </a>
        </nav>
        <div style={{ marginBottom: "2rem" }}>
          <h4 className="form-label" style={{ marginBottom: "0.5rem" }}>
            Recent Scans
          </h4>
          <ul style={{ fontSize: "0.9rem" }}>
            {recentScans.length === 0 && (
              <li style={{ color: "var(--color-text-muted)" }}>
                No scans yet.
              </li>
            )}
            {recentScans.map((scan, i) => (
              <li key={scan.id || i} className="card p-4 mb-2 rounded-md">
                <div className="font-bold text-primary">{scan.prediction}</div>
                <div className="text-slate-900 dark:text-slate-100">
                  N: {scan.N}, P: {scan.P}, K: {scan.K}, pH: {scan.pH}
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  {scan.date}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div
          style={{
            marginTop: "auto",
            fontSize: "0.9rem",
            color: "var(--color-text-muted)",
          }}
        >
          Precision Agriculture Terminal
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 600,
                marginBottom: "1rem",
              }}
            >
              Soil Health Dashboard
            </h2>

            <div className="card mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-600 dark:text-slate-300">Soil Health Status</div>
                  <div className="text-2xl font-extrabold">{recentScans[0]?.prediction || "--"}</div>
                </div>
                <div>
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 21s4-4 8-4 8 4 8 4V7C19 3.686 16.314 2 13 2S7 3.686 7 7v14z"
                        stroke="#22c55e"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Nutrient quick-cards (tap to open detail) */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  className="p-4 rounded-md bg-white/2 dark:bg-black/2 text-slate-900 dark:text-slate-100 text-left"
                  onClick={() => {
                    // open Nitrogen recommendation if present, else open first
                    const recs = getRecommendationsFromLevels(
                      {
                        N: Number(recentScans[0]?.N),
                        P: Number(recentScans[0]?.P),
                        K: Number(recentScans[0]?.K),
                        pH: Number(recentScans[0]?.pH),
                      },
                      recentScans[0]?.prediction
                    );
                    const idx = recs.findIndex((t) => t.toLowerCase().includes("nitrogen"));
                    setAdviceOpen(idx === -1 ? 0 : idx);
                  }}
                >
                  <div className="font-semibold">N</div>
                  <div className="text-sm">{recentScans[0]?.N}</div>
                </button>
                <button
                  className="p-4 rounded-md bg-white/2 dark:bg-black/2 text-slate-900 dark:text-slate-100 text-left"
                  onClick={() => {
                    const recs = getRecommendationsFromLevels(
                      {
                        N: Number(recentScans[0]?.N),
                        P: Number(recentScans[0]?.P),
                        K: Number(recentScans[0]?.K),
                        pH: Number(recentScans[0]?.pH),
                      },
                      recentScans[0]?.prediction
                    );
                    const idx = recs.findIndex((t) => t.toLowerCase().includes("phosphorus"));
                    setAdviceOpen(idx === -1 ? 0 : idx);
                  }}
                >
                  <div className="font-semibold">P</div>
                  <div className="text-sm">{recentScans[0]?.P}</div>
                </button>
                <button
                  className="p-4 rounded-md bg-white/2 dark:bg-black/2 text-slate-900 dark:text-slate-100 text-left"
                  onClick={() => {
                    const recs = getRecommendationsFromLevels(
                      {
                        N: Number(recentScans[0]?.N),
                        P: Number(recentScans[0]?.P),
                        K: Number(recentScans[0]?.K),
                        pH: Number(recentScans[0]?.pH),
                      },
                      recentScans[0]?.prediction
                    );
                    const idx = recs.findIndex((t) => t.toLowerCase().includes("potassium"));
                    setAdviceOpen(idx === -1 ? 0 : idx);
                  }}
                >
                  <div className="font-semibold">K</div>
                  <div className="text-sm">{recentScans[0]?.K}</div>
                </button>
                <button
                  className="p-4 rounded-md bg-white/2 dark:bg-black/2 text-slate-900 dark:text-slate-100 text-left"
                  onClick={() => {
                    const recs = getRecommendationsFromLevels(
                      {
                        N: Number(recentScans[0]?.N),
                        P: Number(recentScans[0]?.P),
                        K: Number(recentScans[0]?.K),
                        pH: Number(recentScans[0]?.pH),
                      },
                      recentScans[0]?.prediction
                    );
                    // pH recs might not contain the word pH - search for common pH phrases
                    let idx = recs.findIndex((t) => t.toLowerCase().includes("ph"));
                    if (idx === -1) idx = recs.findIndex((t) => t.toLowerCase().includes("soil is"));
                    setAdviceOpen(idx === -1 ? recs.length - 1 : idx);
                  }}
                >
                  <div className="font-semibold">pH</div>
                  <div className="text-sm">{recentScans[0]?.pH}</div>
                </button>

            </div>

            <section className="card">
              <h3 className="card-title">Soil Analysis Input</h3>
              <SoilAnalysisForm />
            </section>

            <section className="card">
              <h3 className="card-title">Soil Technical Analysis</h3>
              <div className="text-slate-600 dark:text-slate-300 italic">
                Detailed technical analysis and actionable advice are shown
                here.
              </div>

              {recentScans[0] ? (
                <div style={{ marginTop: "1rem" }}>
                  <AdviceAccordion
                    levels={{
                      N: Number(recentScans[0].N),
                      P: Number(recentScans[0].P),
                      K: Number(recentScans[0].K),
                      pH: Number(recentScans[0].pH),
                    }}
                    prediction={recentScans[0].prediction}
                    weather={weather}
                    farmSettings={farmSettings}
                    openIndex={adviceOpen}
                    onOpenChange={(i) => setAdviceOpen(i)}
                  />
                </div>
              ) : (
                <div
                  style={{
                    marginTop: "1rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  No recent scan available — submit values in the Soil Analysis
                  Input to generate advice.
                </div>
              )}
            </section>
          </div>

          <aside>
            <div style={{ position: "sticky", top: "1.5rem" }}>
              <WeatherCard
                location={weather?.location}
                temp={weather?.temp}
                description={weather?.description}
                rain24h={weather?.rain24h}
                warning={weather?.message}
              />

              <div style={{ height: "1rem" }} />

              <div className="card">
                <h3 className="card-title">Recent Scans</h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {recentScans.length === 0 && (
                    <div style={{ color: "var(--color-text-muted)" }}>
                      No scans yet.
                    </div>
                  )}

                  {recentScans.map((scan) => (
                    <div
                      key={scan.id}
                      className="p-4 rounded-md bg-white/2 dark:bg-black/2"
                    >
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {scan.prediction}
                      </div>
                      <div className="text-slate-900 dark:text-slate-100">
                        N: {scan.N}, P: {scan.P}, K: {scan.K}
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 text-sm">
                        {scan.date}
                      </div>
                      {scan.note && (
                        <div className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                          {scan.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
