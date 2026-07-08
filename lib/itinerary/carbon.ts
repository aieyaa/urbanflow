import type { TransportMode } from "@/lib/validations/preferences";

const EMISSION_FACTORS_G_PER_KM: Record<TransportMode, number> = {
  marche: 0,
  velo: 0,
  trottinette: 25,
  transport_commun: 70,
  voiture: 193,
};

export function estimateCarbonGrams(mode: TransportMode, distanceMeters: number) {
  const km = distanceMeters / 1000;
  return Math.round(EMISSION_FACTORS_G_PER_KM[mode] * km);
}

export function estimateCarbonSavedGrams(mode: TransportMode, distanceMeters: number) {
  return Math.max(
    0,
    estimateCarbonGrams("voiture", distanceMeters) - estimateCarbonGrams(mode, distanceMeters)
  );
}
