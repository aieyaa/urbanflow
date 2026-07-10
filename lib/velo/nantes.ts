import "server-only";

export type BikeStation = {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lon: number;
  bikesAvailable: number;
  docksAvailable: number;
  capacity: number;
  isRenting: boolean;
  updatedAt: string;
};

const STATION_INFORMATION_URL =
  "https://api.cyclocity.fr/contracts/nantes/gbfs/v2/station_information.json";
const STATION_STATUS_URL = "https://api.cyclocity.fr/contracts/nantes/gbfs/v2/station_status.json";

type StationInformation = {
  station_id: string;
  name: string;
  address?: string;
  lat: number;
  lon: number;
  capacity: number;
};

type StationStatus = {
  station_id: string;
  num_bikes_available: number;
  num_docks_available: number;
  is_installed: boolean;
  is_renting: boolean;
  last_reported: number;
};

type GbfsResponse<T> = {
  data: { stations: T[] };
};

async function fetchGbfs<T>(url: string): Promise<T[]> {
  const response = await fetch(url, { next: { revalidate: 60 } });

  if (!response.ok) {
    console.error("[getBikeAvailability] GBFS error", url, response.status);
    return [];
  }

  const data: GbfsResponse<T> = await response.json();
  return data.data.stations;
}

export async function getBikeAvailability(): Promise<BikeStation[]> {
  const [information, status] = await Promise.all([
    fetchGbfs<StationInformation>(STATION_INFORMATION_URL),
    fetchGbfs<StationStatus>(STATION_STATUS_URL),
  ]);

  const statusByStationId = new Map(status.map((entry) => [entry.station_id, entry]));

  return information
    .map((station): BikeStation | null => {
      const stationStatus = statusByStationId.get(station.station_id);

      if (!stationStatus || !stationStatus.is_installed) {
        return null;
      }

      return {
        id: station.station_id,
        name: station.name,
        address: station.address ?? null,
        lat: station.lat,
        lon: station.lon,
        bikesAvailable: stationStatus.num_bikes_available,
        docksAvailable: stationStatus.num_docks_available,
        capacity: station.capacity,
        isRenting: stationStatus.is_renting,
        updatedAt: new Date(stationStatus.last_reported * 1000).toISOString(),
      };
    })
    .filter((station): station is BikeStation => station !== null);
}
