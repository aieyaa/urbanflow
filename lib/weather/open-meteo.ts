import "server-only";

export type CurrentWeather = {
  temperatureC: number;
  precipitationMm: number;
  windSpeedKmh: number;
  weatherCode: number;
};

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const NANTES = { lat: 47.2184, lon: -1.5536 };

export async function getCurrentWeather(): Promise<CurrentWeather | null> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(NANTES.lat));
  url.searchParams.set("longitude", String(NANTES.lon));
  url.searchParams.set(
    "current",
    "temperature_2m,precipitation,weather_code,wind_speed_10m"
  );
  url.searchParams.set("timezone", "Europe/Paris");

  const response = await fetch(url, { next: { revalidate: 600 } });

  if (!response.ok) {
    console.error("[getCurrentWeather] Open-Meteo error", response.status);
    return null;
  }

  const data = await response.json();
  const current = data.current;

  if (!current) {
    return null;
  }

  return {
    temperatureC: current.temperature_2m,
    precipitationMm: current.precipitation,
    windSpeedKmh: current.wind_speed_10m,
    weatherCode: current.weather_code,
  };
}
