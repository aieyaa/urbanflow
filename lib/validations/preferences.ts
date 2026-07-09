import * as z from "zod";

export const transportModes = [
  "marche",
  "velo",
  "trottinette",
  "transport_commun",
  "voiture",
] as const;

export type TransportMode = (typeof transportModes)[number];

export const transportModeLabels: Record<(typeof transportModes)[number], string> = {
  marche: "Marche",
  velo: "Vélo",
  trottinette: "Trottinette",
  transport_commun: "Transports en commun",
  voiture: "Voiture",
};

export const optimizationCriteria = ["fastest", "eco"] as const;

export const optimizationCriteriaLabels: Record<
  (typeof optimizationCriteria)[number],
  string
> = {
  fastest: "Le plus rapide",
  eco: "Le plus écologique",
};

export const preferencesSchema = z.object({
  transportModes: z
    .array(z.enum(transportModes))
    .min(1, { error: "Sélectionnez au moins un mode de transport." }),
  optimizationCriteria: z.enum(optimizationCriteria, {
    error: "Choisissez un critère d'optimisation.",
  }),
  pmrAccessibility: z.boolean(),
});

export type PreferencesFormState =
  | {
      errors?: {
        transportModes?: string[];
        optimizationCriteria?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;
