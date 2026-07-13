"use client";

import { useEffect, useState } from "react";

type CurrentWeather = {
  temperatureC: number;
  precipitationMm: number;
  windSpeedKmh: number;
  weatherCode: number;
};

const WEATHER_LABELS: Record<number, string> = {
  0: "Ciel dégagé",
  1: "Peu nuageux",
  2: "Partiellement nuageux",
  3: "Couvert",
  45: "Brouillard",
  48: "Brouillard givrant",
  51: "Bruine légère",
  53: "Bruine",
  55: "Bruine dense",
  61: "Pluie légère",
  63: "Pluie",
  65: "Pluie forte",
  71: "Neige légère",
  73: "Neige",
  75: "Neige forte",
  80: "Averses légères",
  81: "Averses",
  82: "Averses violentes",
  95: "Orage",
};

export function WeatherWidget() {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/weather")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setWeather(data.weather ?? null);
      })
      .catch((error) => console.error("[WeatherWidget] fetch failed", error));

    return () => {
      cancelled = true;
    };
  }, []);

  if (!weather) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-md border border-black/[.1] px-4 py-3 text-sm dark:border-white/[.15]">
      <span className="font-medium">
        {WEATHER_LABELS[weather.weatherCode] ?? "Météo"}
      </span>
      <span>{Math.round(weather.temperatureC)} °C</span>
      <span>Vent {Math.round(weather.windSpeedKmh)} km/h</span>
      {weather.precipitationMm > 0 && (
        <span className="text-blue-600 dark:text-blue-400">
          {weather.precipitationMm.toFixed(1)} mm de précipitations
        </span>
      )}
    </div>
  );
}
