"use server";

import { createClient } from "@/lib/supabase/server";

export type FavoriteStop = {
  stopId: string;
  stopName: string;
};

export async function listFavoriteStops(): Promise<FavoriteStop[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("favorite_stops")
    .select("stop_id, stop_name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[listFavoriteStops] Supabase error", error.code, error.message);
    return [];
  }

  return (data ?? []).map((row) => ({ stopId: row.stop_id, stopName: row.stop_name }));
}

export async function addFavoriteStop(
  stopId: string,
  stopName: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour ajouter un favori." };
  }

  const { error } = await supabase
    .from("favorite_stops")
    .upsert(
      { user_id: user.id, stop_id: stopId, stop_name: stopName },
      { onConflict: "user_id,stop_id" }
    );

  if (error) {
    console.error("[addFavoriteStop] Supabase error", error.code, error.message);
    return { success: false, message: "Une erreur est survenue." };
  }

  return { success: true };
}

export async function removeFavoriteStop(
  stopId: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour gérer vos favoris." };
  }

  const { error } = await supabase
    .from("favorite_stops")
    .delete()
    .eq("user_id", user.id)
    .eq("stop_id", stopId);

  if (error) {
    console.error("[removeFavoriteStop] Supabase error", error.code, error.message);
    return { success: false, message: "Une erreur est survenue." };
  }

  return { success: true };
}
