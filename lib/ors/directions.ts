import "server-only";

export type OrsProfile = "foot-walking" | "cycling-regular" | "driving-car";

export type LatLon = { lat: number; lon: number };

export type Route = {
  distanceMeters: number;
  durationSeconds: number;
  geometry: [number, number][];
};

const ORS_DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions";

export async function getRoute(
  profile: OrsProfile,
  start: LatLon,
  end: LatLon
): Promise<Route | null> {
  const response = await fetch(`${ORS_DIRECTIONS_URL}/${profile}/geojson`, {
    method: "POST",
    headers: {
      Authorization: process.env.ORS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      coordinates: [
        [start.lon, start.lat],
        [end.lon, end.lat],
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("[getRoute] ORS error", profile, response.status, await response.text());
    return null;
  }

  const data = await response.json();
  const feature = data.features?.[0];

  if (!feature) {
    return null;
  }

  return {
    distanceMeters: feature.properties.summary.distance,
    durationSeconds: feature.properties.summary.duration,
    geometry: feature.geometry.coordinates.map(
      ([lon, lat]: [number, number]) => [lat, lon]
    ),
  };
}
