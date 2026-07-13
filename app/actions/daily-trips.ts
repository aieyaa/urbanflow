"use server";

import { createClient } from "@/lib/supabase/server";

export type DailyTrip = {
  id: string;
  label: string;
  origin: { label: string; lat: number; lon: number };
  destination: { label: string; lat: number; lon: number };
};

export async function listDailyTrips(): Promise<DailyTrip[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("daily_trips")
    .select(
      "id, label, origin_label, origin_lat, origin_lon, destination_label, destination_lat, destination_lon"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[listDailyTrips] Supabase error", error.code, error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    origin: { label: row.origin_label, lat: row.origin_lat, lon: row.origin_lon },
    destination: {
      label: row.destination_label,
      lat: row.destination_lat,
      lon: row.destination_lon,
    },
  }));
}

export type SaveDailyTripInput = {
  label: string;
  origin: { label: string; lat: number; lon: number };
  destination: { label: string; lat: number; lon: number };
};

export async function saveDailyTrip(
  input: SaveDailyTripInput
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour enregistrer un trajet quotidien." };
  }

  const label = input.label.trim();
  if (!label) {
    return { success: false, message: "Merci de donner un nom à ce trajet." };
  }

  const { error } = await supabase.from("daily_trips").insert({
    user_id: user.id,
    label,
    origin_label: input.origin.label,
    origin_lat: input.origin.lat,
    origin_lon: input.origin.lon,
    destination_label: input.destination.label,
    destination_lat: input.destination.lat,
    destination_lon: input.destination.lon,
  });

  if (error) {
    console.error("[saveDailyTrip] Supabase error", error.code, error.message);
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." };
  }

  return { success: true };
}

export async function deleteDailyTrip(
  id: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour gérer vos trajets quotidiens." };
  }

  const { error } = await supabase
    .from("daily_trips")
    .delete()
    .eq("user_id", user.id)
    .eq("id", id);

  if (error) {
    console.error("[deleteDailyTrip] Supabase error", error.code, error.message);
    return { success: false, message: "Une erreur est survenue." };
  }

  return { success: true };
}
