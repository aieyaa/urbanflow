import * as z from "zod";

export const SIGNALEMENT_CATEGORIES = {
  nid_de_poule: "Bouchons",
  chaussee_degradee: "Chaussée dégradée",
  signalisation_cassee: "Feu / panneau cassé",
  eclairage_public: "Éclairage public en panne",
  obstacle_trottoir_piste: "Obstacles",
  arret_inaccessible: "Arrêt de transport inaccessible",
  incident_ligne: "Incident sur une ligne Naolib",
  retard_recurrent: "Retard récurrent",
  autre: "Autre",
} as const;

export type SignalementCategory = keyof typeof SIGNALEMENT_CATEGORIES;

export const signalementCategoryKeys = Object.keys(
  SIGNALEMENT_CATEGORIES
) as [SignalementCategory, ...SignalementCategory[]];

export const createSignalementSchema = z.object({
  category: z.enum(signalementCategoryKeys, {
    error: "Merci de choisir une catégorie.",
  }),
  title: z
    .string({ error: "Merci de donner un titre." })
    .trim()
    .min(3, { error: "3 caractères minimum." })
    .max(120, { error: "120 caractères maximum." }),
  description: z
    .string()
    .trim()
    .max(1000, { error: "1000 caractères maximum." })
    .optional()
    .or(z.literal("")),
  location_label: z
    .string({ error: "Merci d'indiquer un lieu." })
    .trim()
    .min(3, { error: "Merci d'indiquer un lieu." }),
  line_name: z.string().trim().max(50).optional().or(z.literal("")),
});

export type CreateSignalementFormState =
  | {
      errors?: {
        category?: string[];
        title?: string[];
        description?: string[];
        location_label?: string[];
        line_name?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;
