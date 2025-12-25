"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type Reading = { createdAt: string; N: number; P: number; K: number };

export default function NPkChart({
  days = 30,
  target = { N: 75, P: 55, K: 190 },
}: {
  days?: number;
  target?: { N: number; P: number; K: number };
}) {
  const [data, setData] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/sensor")
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        if (json && json.success && Array.isArray(json.readings)) {
          // Map to readings and sort ascending
          const readings = json.readings
            .map((r: any) => ({
              createdAt: r.createdAt,
              N: r.nitrogen,
              P: r.phosphorus,
              K: r.potassium,
            }))
            .sort(
              (a: any, b: any) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
          setData(readings);
        }
      })
      .catch((e) => console.error("Chart load error", e))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Filter to last `days` days and aggregate daily average
  const series = useMemo(() => {
    const cutoff = Date.now() - days * 24 * 3600 * 1000;
    const filtered = data.filter(
      (d) => new Date(d.createdAt).getTime() >= cutoff
    );
    // Group by date
    const map = new Map<
      string,
      { N: number; P: number; K: number; count: number }
    >();
    for (const r of filtered) {
      const day = new Date(r.createdAt).toISOString().slice(0, 10);
      const cur = map.get(day) || { N: 0, P: 0, K: 0, count: 0 };
      cur.N += Number(r.N);
      cur.P += Number(r.P);
      cur.K += Number(r.K);
      cur.count += 1;
      map.set(day, cur);
    }
    const out: any[] = [];
    for (const [day, v] of map.entries()) {
      out.push({
        date: day,
        N: +(v.N / v.count).toFixed(2),
        P: +(v.P / v.count).toFixed(2),
        K: +(v.K / v.count).toFixed(2),
      });
    }
    // sort by date
    out.sort((a, b) => a.date.localeCompare(b.date));
    return out;
  }, [data, days]);

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div style={{ fontWeight: 700 }}>N-P-K Trends (last {days} days)</div>
        <div style={{ color: "var(--color-text-muted)" }}>
          {loading ? "Loading…" : `${series.length} points`}
        </div>
      </div>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fill: "var(--color-text-muted)" }} />
            <YAxis tick={{ fill: "var(--color-text-muted)" }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="N"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="P"
              stroke="#f59e42"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="K"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
            />
            <ReferenceLine
              y={target.N}
              label={{ value: "N target", position: "right" }}
              stroke="#16a34a"
              strokeDasharray="3 3"
            />
            <ReferenceLine
              y={target.P}
              label={{ value: "P target", position: "right" }}
              stroke="#b45309"
              strokeDasharray="3 3"
            />
            <ReferenceLine
              y={target.K}
              label={{ value: "K target", position: "right" }}
              stroke="#1e40af"
              strokeDasharray="3 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
