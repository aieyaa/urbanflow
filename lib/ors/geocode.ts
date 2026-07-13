import "server-only";

export type GeocodeSuggestion = {
  label: string;
  lat: number;
  lon: number;
};

const BAN_SEARCH_URL = "https://api-adresse.data.gouv.fr/search/";
const BAN_REVERSE_URL = "https://api-adresse.data.gouv.fr/reverse/";
const NANTES_FOCUS = { lat: 47.2184, lon: -1.5536 };

export async function autocompleteAddress(
  query: string
): Promise<GeocodeSuggestion[]> {
  if (query.trim().length < 3) {
    return [];
  }

  const url = new URL(BAN_SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("lat", String(NANTES_FOCUS.lat));
  url.searchParams.set("lon", String(NANTES_FOCUS.lon));
  url.searchParams.set("limit", "5");

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    console.error("[autocompleteAddress] BAN error", response.status, await response.text());
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

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<string | null> {
  const url = new URL(BAN_REVERSE_URL);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    console.error("[reverseGeocode] BAN error", response.status, await response.text());
    return null;
  }

  const data = await response.json();
  return data.features?.[0]?.properties?.label ?? null;
}
