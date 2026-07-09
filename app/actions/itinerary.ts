"use server";

import { createClient } from "@/lib/supabase/server";
import { getRoute, type OrsProfile } from "@/lib/ors/directions";
import { estimateCarbonGrams } from "@/lib/itinerary/carbon";
import type { TransportMode } from "@/lib/validations/preferences";

const MODE_TO_ORS_PROFILE: Partial<Record<TransportMode, OrsProfile>> = {
  marche: "foot-walking",
  velo: "cycling-regular",
  trottinette: "cycling-regular",
  voiture: "driving-car",
  transport_commun: "driving-car",
};

const TRANSIT_DURATION_MULTIPLIER = 1.6;
const TRANSIT_AVERAGE_WAIT_SECONDS = 5 * 60;

const DEFAULT_MODES: TransportMode[] = [
  "marche",
  "velo",
  "trottinette",
  "transport_commun",
  "voiture",
];

export type ItineraryResult = {
  mode: TransportMode;
  distanceMeters: number;
  durationSeconds: number;
  carbonGrams: number;
  geometry: [number, number][];
  approximate?: boolean;
};

export type ItinerarySearchState =
  | {
      results?: ItineraryResult[];
      unavailableModes?: TransportMode[];
      message?: string;
    }
  | undefined;

function parseCoord(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function searchItineraries(
  _prevState: ItinerarySearchState,
  formData: FormData
): Promise<ItinerarySearchState> {
  const originLat = parseCoord(formData.get("originLat"));
  const originLon = parseCoord(formData.get("originLon"));
  const destinationLat = parseCoord(formData.get("destinationLat"));
  const destinationLon = parseCoord(formData.get("destinationLon"));

  if (
    originLat === null ||
    originLon === null ||
    destinationLat === null ||
    destinationLon === null
  ) {
    return {
      message:
        "Merci de sélectionner une adresse de départ et d'arrivée dans les suggestions.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let allowedModes: TransportMode[] = DEFAULT_MODES;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("transport_modes")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.transport_modes?.length) {
      allowedModes = profile.transport_modes as TransportMode[];
    }
  }

  const start = { lat: originLat, lon: originLon };
  const end = { lat: destinationLat, lon: destinationLon };

  const unavailableModes: TransportMode[] = [];
  const results: ItineraryResult[] = [];

  for (const mode of allowedModes) {
    const profile = MODE_TO_ORS_PROFILE[mode];
    if (!profile) {
      unavailableModes.push(mode);
      continue;
    }

    const route = await getRoute(profile, start, end);
    if (!route) {
      continue;
    }

    const isTransit = mode === "transport_commun";
    const durationSeconds = isTransit
      ? Math.round(route.durationSeconds * TRANSIT_DURATION_MULTIPLIER) +
        TRANSIT_AVERAGE_WAIT_SECONDS
      : route.durationSeconds;

    results.push({
      mode,
      distanceMeters: route.distanceMeters,
      durationSeconds,
      carbonGrams: estimateCarbonGrams(mode, route.distanceMeters),
      geometry: route.geometry,
      approximate: isTransit,
    });
  }

  if (results.length === 0) {
    return {
      message: "Aucun itinéraire n'a pu être calculé pour ce trajet.",
      unavailableModes,
    };
  }

  return { results, unavailableModes };
}
