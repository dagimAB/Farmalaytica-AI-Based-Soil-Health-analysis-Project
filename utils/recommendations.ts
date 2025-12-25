export type Levels = { N: number; P: number; K: number; pH: number };

export function getRecommendationsFromLevels(
  levels: Levels,
  prediction: string
) {
  const recs: string[] = [];

  // Nitrogen guidance (international thresholds)
  if (!isNaN(levels.N)) {
    if (levels.N < 25) {
      recs.push(
        "Nitrogen is low (N < 25 mg/kg) — apply a nitrogen fertilizer appropriate for your crop (e.g., urea) and increase organic matter such as compost; use split applications to reduce leaching."
      );
    } else if (levels.N < 50) {
      recs.push(
        "Nitrogen is moderate (25 ≤ N < 50 mg/kg) — apply maintenance N according to crop demand and monitor growth responses."
      );
    } else if (levels.N < 100) {
      recs.push(
        "Nitrogen is in the Optimal range (50 ≤ N < 100 mg/kg) — maintain current management and avoid over-application."
      );
    }
  }

  // Phosphorus guidance
  if (!isNaN(levels.P)) {
    if (levels.P < 15) {
      recs.push(
        "Phosphorus is low (P < 15 mg/kg) — apply phosphate fertilizer (e.g., TSP or DAP) and incorporate organic amendments; banding improves efficiency."
      );
    } else if (levels.P < 35) {
      recs.push(
        "Phosphorus is moderate (15 ≤ P < 35 mg/kg) — consider maintenance P fertilization when crop demand is high."
      );
    } else if (levels.P < 75) {
      recs.push(
        "Phosphorus is in the Optimal range (35 ≤ P < 75 mg/kg) — maintain current management and monitor tissue tests if needed."
      );
    }
  }

  // Potassium guidance
  if (!isNaN(levels.K)) {
    if (levels.K < 60) {
      recs.push(
        "Potassium is low (K < 60 mg/kg) — apply potassium fertilizer (e.g., muriate of potash) according to crop need; monitor for crop response."
      );
    } else if (levels.K < 130) {
      recs.push(
        "Potassium is moderate (60 ≤ K < 130 mg/kg) — maintain K as needed for crop demand."
      );
    } else if (levels.K < 250) {
      recs.push(
        "Potassium is in the Optimal range (130 ≤ K < 250 mg/kg) — avoid excess application; follow crop-specific recommendations."
      );
    }
  }

  // pH guidance
  if (!isNaN(levels.pH)) {
    if (levels.pH < 5.5) {
      recs.push(
        "Soil is acidic (pH < 5.5) — apply agricultural lime to move pH toward ~6.5; consult local guidelines for rate."
      );
    } else if (levels.pH > 7.8) {
      recs.push(
        "Soil is alkaline (pH > 7.8) — consider practices to improve acidity or nutrient availability (organic matter, gypsum where appropriate); consult an agronomist."
      );
    } else if (
      (levels.pH >= 5.5 && levels.pH < 6.0) ||
      (levels.pH > 7.5 && levels.pH <= 7.8)
    ) {
      recs.push(
        "Soil pH is slightly off-optimal — minor corrective measures (small lime or organic amendments) may help maintain nutrient availability."
      );
    }
  }

  if (recs.length === 0) {
    if (prediction === "Optimal")
      recs.push(
        "Nutrient levels look good — maintain current management and monitor regularly."
      );
    else if (prediction === "Average")
      recs.push(
        "Overall status suggests attention is needed — run a detailed lab analysis, check recent management practices, and consult local agronomic guidance."
      );
    else
      recs.push(
        "Soil status indicates potential problems — seek a detailed soil test and agronomic advice for targeted remediation."
      );
  }

  return recs;
}
