import "server-only";

export type CarpoolSpot = {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  lat: number | null;
  lon: number | null;
  capacity: number;
  pmrCapacity: number;
  lit: boolean;
  open: boolean;
  bikeShelter: boolean;
  evCharging: boolean;
};

const RECORDS_URL = "https://data.nantesmetropole.fr/api/records/1.0/search/";
const DATASET = "244400404_lieux-covoiturage-nantes-metropole";

type CarpoolFields = {
  id_lieu?: string;
  nom_lieu?: string;
  com_lieu?: string;
  ad_lieu?: string;
  geo_point_2d?: [number, number];
  nbre_pl?: number;
  nbre_pmr?: number;
  lumiere?: string;
  ouvert?: string;
  abri_velo?: string;
  borne_recharge_ve?: string;
};

type OdsResponse = {
  records: { fields: CarpoolFields }[];
};

export async function getCarpoolSpots(): Promise<CarpoolSpot[]> {
  const url = new URL(RECORDS_URL);
  url.searchParams.set("dataset", DATASET);
  url.searchParams.set("rows", "200");

  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    console.error("[getCarpoolSpots] Nantes open data error", response.status);
    return [];
  }

  const data: OdsResponse = await response.json();

  return data.records.map((record, index) => {
    const fields = record.fields;
    return {
      id: fields.id_lieu ?? String(index),
      name: fields.nom_lieu ?? "Aire de covoiturage",
      city: fields.com_lieu ?? null,
      address: fields.ad_lieu ?? null,
      lat: fields.geo_point_2d?.[0] ?? null,
      lon: fields.geo_point_2d?.[1] ?? null,
      capacity: fields.nbre_pl ?? 0,
      pmrCapacity: fields.nbre_pmr ?? 0,
      lit: fields.lumiere === "true",
      open: fields.ouvert !== "false",
      bikeShelter: fields.abri_velo === "true",
      evCharging: fields.borne_recharge_ve === "true",
    };
  });
}
