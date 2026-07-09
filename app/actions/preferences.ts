"use server";

import { createClient } from "@/lib/supabase/server";
import {
  preferencesSchema,
  type PreferencesFormState,
} from "@/lib/validations/preferences";

export async function savePreferences(
  _prevState: PreferencesFormState,
  formData: FormData
): Promise<PreferencesFormState> {
  const validatedFields = preferencesSchema.safeParse({
    transportModes: formData.getAll("transportModes"),
    optimizationCriteria: formData.get("optimizationCriteria"),
    pmrAccessibility: formData.get("pmrAccessibility") === "on",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "Vous devez être connecté pour enregistrer vos préférences." };
  }

  const { transportModes, optimizationCriteria, pmrAccessibility } =
    validatedFields.data;

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      transport_modes: transportModes,
      optimization_criteria: optimizationCriteria,
      pmr_accessibility: pmrAccessibility,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[savePreferences] Supabase error", error.code, error.message);
    return { message: "Une erreur est survenue lors de l'enregistrement." };
  }

  return { success: true };
}
