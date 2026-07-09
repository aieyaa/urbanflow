import "server-only";

export type GeocodeSuggestion = {
  label: string;
  lat: number;
  lon: number;
};

const ORS_GEOCODE_URL = "https://api.openrouteservice.org/geocode/autocomplete";
const NANTES_FOCUS = { lat: 47.2184, lon: -1.5536 };

export async function autocompleteAddress(
  query: string
): Promise<GeocodeSuggestion[]> {
  if (query.trim().length < 3) {
    return [];
  }

  const url = new URL(ORS_GEOCODE_URL);
  url.searchParams.set("api_key", process.env.ORS_API_KEY!);
  url.searchParams.set("text", query);
  url.searchParams.set("focus.point.lat", String(NANTES_FOCUS.lat));
  url.searchParams.set("focus.point.lon", String(NANTES_FOCUS.lon));
  url.searchParams.set("size", "5");

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    console.error("[autocompleteAddress] ORS error", response.status, await response.text());
    return [];
  }

  const data = await response.json();

  return (data.features ?? []).map(
    (feature: {
      properties: { label: string };
      geometry: { coordinates: [number, number] };
    }) => ({
      label: feature.properties.label,
      lon: feature.geometry.coordinates[0],
      lat: feature.geometry.coordinates[1],
    })
  );
}

const ORS_REVERSE_GEOCODE_URL = "https://api.openrouteservice.org/geocode/reverse";

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<string | null> {
  const url = new URL(ORS_REVERSE_GEOCODE_URL);
  url.searchParams.set("api_key", process.env.ORS_API_KEY!);
  url.searchParams.set("point.lat", String(lat));
  url.searchParams.set("point.lon", String(lon));
  url.searchParams.set("size", "1");

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    console.error("[reverseGeocode] ORS error", response.status, await response.text());
    return null;
  }

  const data = await response.json();
  return data.features?.[0]?.properties?.label ?? null;
}
