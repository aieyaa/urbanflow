import "server-only";
import JSZip from "jszip";

export type NaolibStop = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};


const GTFS_ZIP_URL =
  "https://data.nantesmetropole.fr/api/datasets/1.0/244400404_transports_commun_naolib_nantes_metropole_gtfs/files/0cc0469a72de54ee045cb66d1a21de9e";

const STOP_PLACE_LOCATION_TYPE = "1";

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

type ParsedStops = {
  stopPlaces: NaolibStop[];
  quaysByParent: Map<string, string[]>;
};

async function fetchStops(): Promise<ParsedStops> {
  const response = await fetch(GTFS_ZIP_URL, { cache: "no-store" });

  if (!response.ok) {
    console.error("[naolib/stops] GTFS download error", response.status);
    return { stopPlaces: [], quaysByParent: new Map() };
  }

  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  const stopsFile = zip.file("stops.txt");

  if (!stopsFile) {
    console.error("[naolib/stops] stops.txt not found in GTFS archive");
    return { stopPlaces: [], quaysByParent: new Map() };
  }

  const content = await stopsFile.async("string");
  const lines = content.split("\n").filter((line) => line.trim().length > 0);
  const header = parseCsvLine(lines[0]);

  const idIndex = header.indexOf("stop_id");
  const nameIndex = header.indexOf("stop_name");
  const latIndex = header.indexOf("stop_lat");
  const lonIndex = header.indexOf("stop_lon");
  const locationTypeIndex = header.indexOf("location_type");
  const parentStationIndex = header.indexOf("parent_station");

  const stopPlaces: NaolibStop[] = [];
  const quaysByParent = new Map<string, string[]>();

  for (const line of lines.slice(1)) {
    const fields = parseCsvLine(line);
    const locationType = fields[locationTypeIndex];

    if (locationType === STOP_PLACE_LOCATION_TYPE) {
      const lat = Number(fields[latIndex]);
      const lon = Number(fields[lonIndex]);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        continue;
      }

      stopPlaces.push({ id: fields[idIndex], name: fields[nameIndex], lat, lon });
      continue;
    }

    const parentId = fields[parentStationIndex];
    if (!parentId) {
      continue;
    }

    const quays = quaysByParent.get(parentId) ?? [];
    quays.push(fields[idIndex]);
    quaysByParent.set(parentId, quays);
  }

  return { stopPlaces, quaysByParent };
}

let stopsCache: Promise<ParsedStops> | null = null;

function getParsedStops(): Promise<ParsedStops> {
  if (!stopsCache) {
    stopsCache = fetchStops();
  }
  return stopsCache;
}

export async function getStops(): Promise<NaolibStop[]> {
  return (await getParsedStops()).stopPlaces;
}

export async function getQuayIds(stopPlaceId: string): Promise<string[]> {
  const { quaysByParent } = await getParsedStops();
  return quaysByParent.get(stopPlaceId) ?? [];
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export async function searchStops(query: string): Promise<NaolibStop[]> {
  if (query.trim().length < 2) {
    return [];
  }

  const stops = await getStops();
  const normalizedQuery = normalize(query);

  return stops.filter((stop) => normalize(stop.name).includes(normalizedQuery)).slice(0, 10);
}
