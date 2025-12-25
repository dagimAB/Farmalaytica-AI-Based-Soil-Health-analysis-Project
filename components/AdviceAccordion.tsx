"use client";

import React, { useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import SuccessToast from "./SuccessToast";
import { Levels, getRecommendationsFromLevels } from "@/utils/recommendations";

type Weather = { rain24h?: number; message?: string | null } | null;

function generateCropSuggestions(): {
  title: string;
  why: string;
  improvement: string;
}[] {
  return [
    {
      title: "Maize",
      why: "Tolerant to varied soils and responds well to N and K fertilization; good market access.",
      improvement:
        "Expected yield improvement: ~20-35% with balanced NPK and correct timing.",
    },
    {
      title: "Teff",
      why: "Adapted to Ethiopian highlands; benefits from moderate N and timely P application.",
      improvement:
        "Expected yield improvement: ~10-25% when soil P and N corrected.",
    },
  ];
}

function makeMarkdown(rec: string, levels: Levels, weather: Weather) {
  const crops = generateCropSuggestions();
  const weatherNote = weather?.message
    ? `**Weather Impact**: ${weather.message}`
    : "**Weather Impact**: No significant rain expected in the next 24h";

  return `## Soil Diagnosis\n**Why**: ${rec}\n\n**Details**:\n- N: ${levels.N} mg/kg\n- P: ${levels.P} mg/kg\n- K: ${levels.K} mg/kg\n- pH: ${levels.pH}\n\n## Action Plan\n**Step-by-step**:\n- Soil test confirms need: apply recommended fertilizer based on soil test and crop stage.\n- Suggested approach: split N applications (e.g., 50% at planting, 25% at tillering, 25% at panicle initiation) when N is low.\n- Apply P as single dose at planting if low; apply K at planting or side-dress if low.\n\n## Weather Impact\n${weatherNote}\n\n## Crop Encyclopedia\n- **${crops[0].title}**: ${crops[0].why} \n  - ${crops[0].improvement}\n- **${crops[1].title}**: ${crops[1].why} \n  - ${crops[1].improvement}`;
}

export default function AdviceAccordion({
  levels,
  prediction,
  weather,
  farmSettings,
  openIndex,
  onOpenChange,
}: {
  levels: Levels;
  prediction: string;
  weather: Weather;
  farmSettings?: { name?: string; areaHa?: number; primaryCrop?: string };
  openIndex?: number | null;
  onOpenChange?: (i: number | null) => void;
}) {
  const recs = getRecommendationsFromLevels(levels, prediction);
  const [openInternal, setOpenInternal] = useState<number | null>(0);
  const open = openIndex !== undefined ? openIndex : openInternal;
  const setOpen = (i: number | null) => {
    if (onOpenChange) onOpenChange(i);
    else setOpenInternal(i);
  };

  const [toastVisible, setToastVisible] = useState(false);

  const makeMarkdownWithFarm = (rec: string) => {
    let base = makeMarkdown(rec, levels, weather);
    if (farmSettings && farmSettings.areaHa) {
      const area = Number(farmSettings.areaHa);
      let calc = "\n\n## Fertilizer Calculation\n";
      if (levels.N < 25)
        calc += `- Nitrogen: 50 kg/ha × ${area} ha = **${50 * area} kg**\n`;
      if (levels.P < 15)
        calc += `- Phosphorus: 30 kg/ha × ${area} ha = **${30 * area} kg**\n`;
      if (levels.K < 60)
        calc += `- Potassium: 40 kg/ha × ${area} ha = **${40 * area} kg**\n`;
      base = base + calc;
    }
    return base;
  };

  const scheduleRecommendation = async (rec: string) => {
    try {
      const area = farmSettings?.areaHa ? Number(farmSettings.areaHa) : 1;
      let title = "Follow recommendation";
      let description = makeMarkdownWithFarm(rec);

      // Create a simple title focusing on primary nutrient
      if (levels.N < 25) {
        const total = 50 * area;
        title = `Apply ${total}kg of Urea (${50}kg per hectare)`;
      } else if (levels.P < 15) {
        const total = 30 * area;
        title = `Apply ${total}kg of Phosphate (DAP/TSP) (${30}kg per hectare)`;
      } else if (levels.K < 60) {
        const total = 40 * area;
        title = `Apply ${total}kg of MOP (${40}kg per hectare)`;
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category: "fertilizer",
          createdFrom: "recommendation",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2500);
      } else {
        alert("Failed to schedule");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to schedule");
    }
  };

  return (
    <div>
      {recs.map((r, i) => (
        <div key={i} className="card mb-3">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="w-full text-left p-4"
            style={{ background: "transparent", border: "none" }}
          >
            <div className="flex items-center justify-between">
              <div className="text-slate-900 dark:text-slate-100 font-semibold">
                {r}
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                {open === i ? "▾" : "▸"}
              </div>
            </div>
          </button>
          {open === i && (
            <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
              <MarkdownRenderer md={makeMarkdownWithFarm(r)} />
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
                <button
                  className="button-primary"
                  onClick={() => scheduleRecommendation(r)}
                >
                  Schedule
                </button>
                <a href="/tasks" style={{ alignSelf: "center", color: "var(--color-text-muted)" }}>
                  View Tasks
                </a>
              </div>
            </div>
          )}
        </div>)}

      <SuccessToast visible={toastVisible} message="Scheduled in Tasks" />
        </div>
      ))}
    </div>
  );
}
