import "server-only";

export type ParkingSpot = {
  id: number;
  name: string;
  address: string | null;
  lat: number | null;
  lon: number | null;
  available: number;
  capacity: number;
  status: 0 | 1 | 2 | 5;
  pmrAccess: boolean;
  updatedAt: string;
};

const RECORDS_URL =
  "https://data.nantesmetropole.fr/api/records/1.0/search/";
const AVAILABILITY_DATASET = "244400404_parkings-publics-nantes-disponibilites";
const LOCATIONS_DATASET = "244400404_parkings-publics-nantes";

type AvailabilityFields = {
  grp_identifiant: number;
  grp_nom: string;
  grp_statut: 0 | 1 | 2 | 5;
  grp_disponible: number;
  grp_exploitation: number;
  grp_horodatage: string;
};

type LocationFields = {
  nom_complet: string;
  adresse?: string;
  location?: [number, number];
  capacite_voiture?: number;
  acces_pmr?: string;
};

type OdsResponse<T> = {
  records: { fields: T }[];
};

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/PARKING/g, "")
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

const NAME_ALIASES: Record<string, string> = {
  [normalizeName("BACO 1")]: normalizeName("BACO LU 1 COTE GARE"),
  [normalizeName("BACO 2")]: normalizeName("BACO LU 2 COTE CHU"),
  [normalizeName("CHU")]: normalizeName("CHU 1"),
  [normalizeName("FONDERIES")]: normalizeName("LES FONDERIES"),
  [normalizeName("CITE INT DES CONGRES")]: normalizeName("CITE DES CONGRES"),
  [normalizeName("GARE SUD-LIMITE 1H")]: normalizeName("GARE LIMITE 1H"),
};

async function fetchDataset<T>(dataset: string): Promise<T[]> {
  const url = new URL(RECORDS_URL);
  url.searchParams.set("dataset", dataset);
  url.searchParams.set("rows", "50");

  const response = await fetch(url, { next: { revalidate: 60 } });

  if (!response.ok) {
    console.error("[getParkingAvailability] Nantes open data error", dataset, response.status);
    return [];
  }

  const data: OdsResponse<T> = await response.json();
  return data.records.map((record) => record.fields);
}

export async function getParkingAvailability(): Promise<ParkingSpot[]> {
  const [availability, locations] = await Promise.all([
    fetchDataset<AvailabilityFields>(AVAILABILITY_DATASET),
    fetchDataset<LocationFields>(LOCATIONS_DATASET),
  ]);

  const locationsByName = new Map<string, LocationFields>();
  for (const location of locations) {
    locationsByName.set(normalizeName(location.nom_complet), location);
  }

  return availability.map((spot) => {
    const normalized = normalizeName(spot.grp_nom);
    const aliased = NAME_ALIASES[normalized];
    const location =
      locationsByName.get(normalized) ??
      (aliased ? locationsByName.get(normalizeName(aliased)) : undefined);

    return {
      id: spot.grp_identifiant,
      name: location?.nom_complet ?? spot.grp_nom,
      address: location?.adresse ?? null,
      lat: location?.location?.[0] ?? null,
      lon: location?.location?.[1] ?? null,
      available: spot.grp_disponible,
      capacity: location?.capacite_voiture ?? spot.grp_exploitation,
      status: spot.grp_statut,
      pmrAccess: location?.acces_pmr === "OUI",
      updatedAt: spot.grp_horodatage,
    };
  });
}
