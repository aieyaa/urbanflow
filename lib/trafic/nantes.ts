import "server-only";

export type TrafficSegment = {
  id: number;
  label: string;
  state: string;
  speedKmh: number | null;
  travelTimeSeconds: number | null;
  updatedAt: string | null;
  path: [number, number][];
};

const RECORDS_URL =
  "https://data.nantesmetropole.fr/api/explore/v2.1/catalog/datasets/244400404_fluidite-axes-routiers-nantes-metropole/records";

type OdsRecord = {
  cha_id?: number;
  cha_lib?: string;
  etat_trafic?: string;
  mf1_vit?: number;
  tc1_temps?: number;
  mf1_hd?: string;
  geo_shape?: { geometry?: { coordinates?: [number, number][] } };
};

type OdsResponse = { results?: OdsRecord[] };

export async function getTrafficSegments(): Promise<TrafficSegment[]> {
  const url = new URL(RECORDS_URL);
  url.searchParams.set("limit", "100");

  const response = await fetch(url, { next: { revalidate: 60 } });

  if (!response.ok) {
    console.error("[getTrafficSegments] Nantes open data error", response.status);
    return [];
  }

  const data: OdsResponse = await response.json();

  return (data.results ?? [])
    .filter((record) => record.cha_id !== undefined)
    .map((record) => ({
      id: record.cha_id!,
      label: record.cha_lib ?? "Axe inconnu",
      state: record.etat_trafic ?? "Indéterminé",
      speedKmh: record.mf1_vit ?? null,
      travelTimeSeconds: record.tc1_temps ?? null,
      updatedAt: record.mf1_hd ?? null,
      path: (record.geo_shape?.geometry?.coordinates ?? []).map(
        ([lon, lat]) => [lat, lon] as [number, number]
      ),
    }));
}
