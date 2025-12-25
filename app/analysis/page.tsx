"use client";

import React, { useState } from "react";
import AdviceAccordion from "@/components/AdviceAccordion";
import NPkChart from "@/components/NPkChart";

export default function AnalysisPage() {
  const [levels, setLevels] = useState({ N: 20, P: 10, K: 60, pH: 6.5 });
  const [prediction, setPrediction] = useState("Average");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLevels((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const [days, setDays] = useState<number>(30);

  const ranges = [7, 30, 90];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen p-6">
      <div className="card">
        <h2 className="card-title">Historical Analysis & Smart Advice</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="form-label text-slate-900 dark:text-slate-100">
              N
            </label>
            <input
              className="form-input"
              name="N"
              type="number"
              value={levels.N}
              onChange={handleChange}
            />
            <label className="form-label text-slate-900 dark:text-slate-100">
              P
            </label>
            <input
              className="form-input"
              name="P"
              type="number"
              value={levels.P}
              onChange={handleChange}
            />
            <label className="form-label text-slate-900 dark:text-slate-100">
              K
            </label>
            <input
              className="form-input"
              name="K"
              type="number"
              value={levels.K}
              onChange={handleChange}
            />
            <label className="form-label text-slate-900 dark:text-slate-100">
              pH
            </label>
            <input
              className="form-input"
              name="pH"
              type="number"
              step="any"
              value={levels.pH}
              onChange={handleChange}
            />
          </div>
          <div>
            <div className="text-slate-600 dark:text-slate-300 mb-2">
              Advice (Accordion)
            </div>
            <AdviceAccordion
              levels={levels}
              prediction={prediction}
              weather={null}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => setDays(r)}
                  aria-pressed={days === r}
                  className={`p-4 rounded-md ${
                    days === r
                      ? "border border-slate-700 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      : "border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {r}d
                </button>
              ))}
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              Toggle range to zoom
            </div>
          </div>

          <NPkChart days={days} />
        </div>
      </div>
    </div>
  );
}
