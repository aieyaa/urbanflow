"use server";

import { createClient } from "@/lib/supabase/server";
import type { TransportMode } from "@/lib/validations/preferences";

export type LogTripInput = {
  mode: TransportMode;
  distanceMeters: number;
  durationSeconds: number;
  carbonGrams: number;
};

export async function logTrip(
  input: LogTripInput
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour suivre ce trajet." };
  }

  const { error } = await supabase.from("trips").insert({
    user_id: user.id,
    mode: input.mode,
    distance_meters: Math.round(input.distanceMeters),
    duration_seconds: Math.round(input.durationSeconds),
    carbon_grams: Math.round(input.carbonGrams),
  });

  if (error) {
    console.error("[logTrip] Supabase error", error.code, error.message);
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." };
  }

  return { success: true };
}
