import "server-only";

export type ScooterStation = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number;
  scootersAvailable: number;
  docksAvailable: number;
  isRenting: boolean;
};

const BASE_URL = "https://api.gbfs.v3.0.ecovelo.mobi/chantrerie";
const VEHICLE_TYPES_URL = "https://api.gbfs.v3.0.ecovelo.mobi/vehicle_types.json";
const STATION_INFORMATION_URL = `${BASE_URL}/station_information.json`;
const STATION_STATUS_URL = `${BASE_URL}/station_status.json`;
const SCOOTER_FORM_FACTOR = "scooter_standing";

type VehicleType = {
  vehicle_type_id: string;
  form_factor: string;
};

type StationInformation = {
  station_id: string;
  name: { language: string; text: string }[];
  lat: number;
  lon: number;
  capacity: number;
};

type StationStatus = {
  station_id: string;
  is_renting: boolean;
  num_docks_available: number;
  vehicle_types_available: { vehicle_type_id: string; count: number }[];
};

async function fetchGbfs<T>(url: string, key: string): Promise<T[]> {
  const response = await fetch(url, { next: { revalidate: 30 } });

  if (!response.ok) {
    console.error("[trottinette] GBFS error", url, response.status);
    return [];
  }

  const data = await response.json();
  return (data.data[key] ?? []) as T[];
}

export async function getScooterStations(): Promise<ScooterStation[]> {
  const [information, status, vehicleTypes] = await Promise.all([
    fetchGbfs<StationInformation>(STATION_INFORMATION_URL, "stations"),
    fetchGbfs<StationStatus>(STATION_STATUS_URL, "stations"),
    fetchGbfs<VehicleType>(VEHICLE_TYPES_URL, "vehicle_types"),
  ]);

  const scooterTypeIds = new Set(
    vehicleTypes
      .filter((type) => type.form_factor === SCOOTER_FORM_FACTOR)
      .map((type) => type.vehicle_type_id)
  );

  const statusByStationId = new Map(status.map((entry) => [entry.station_id, entry]));

  return information
    .map((station): ScooterStation | null => {
      const stationStatus = statusByStationId.get(station.station_id);
      if (!stationStatus) return null;

      const scootersAvailable = stationStatus.vehicle_types_available
        .filter((entry) => scooterTypeIds.has(entry.vehicle_type_id))
        .reduce((sum, entry) => sum + entry.count, 0);

      return {
        id: station.station_id,
        name: station.name[0]?.text ?? "Station",
        lat: station.lat,
        lon: station.lon,
        capacity: station.capacity,
        scootersAvailable,
        docksAvailable: stationStatus.num_docks_available,
        isRenting: stationStatus.is_renting,
      };
    })
    .filter((station): station is ScooterStation => station !== null);
}
