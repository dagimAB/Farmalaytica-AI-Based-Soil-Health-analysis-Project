import { NextRequest, NextResponse } from "next/server";

// Log presence of API key when module loads (visible in server logs on start)
console.log("OpenWeather API key present:", !!process.env.OPENWEATHER_API_KEY);

export async function GET(req: NextRequest) {
  try {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "OPENWEATHER_API_KEY not configured" },
        { status: 500 }
      );
    }
    const url = new URL("https://api.openweathermap.org/data/2.5/forecast");
    const lat = req.nextUrl.searchParams.get("lat") || "9.03"; // Addis Ababa lat
    const lon = req.nextUrl.searchParams.get("lon") || "38.74"; // Addis Ababa lon
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("appid", key);
    url.searchParams.set("units", "metric");

    const res = await fetch(url.toString());
    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json(
        { error: "Weather API error", detail: txt },
        { status: 502 }
      );
    }
    const data = await res.json();

    // Sum rainfall in the next 24 hours (list entries are 3-hourly)
    const now = Date.now();
    const next24 = now + 24 * 60 * 60 * 1000;
    let rain24 = 0;
    for (const entry of data.list || []) {
      const t = entry.dt * 1000;
      if (t >= now && t <= next24) {
        if (entry.rain && entry.rain["3h"]) rain24 += entry.rain["3h"];
      }
    }

    const delayFertilizer = rain24 > 5.0;
    const weather = {
      location: data.city?.name || "Local",
      temp: data.list?.[0]?.main?.temp,
      description: data.list?.[0]?.weather?.[0]?.description || null,
      rain24h: rain24,
      delayFertilizer,
      message: delayFertilizer
        ? "Rain expected: Delay fertilizer application."
        : null,
    };

    return NextResponse.json({ success: true, weather });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
