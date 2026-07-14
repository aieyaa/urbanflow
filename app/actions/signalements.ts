"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createSignalementSchema,
  type CreateSignalementFormState,
  type SignalementCategory,
} from "@/lib/validations/signalements";

export type SignalementStatus = "ouvert" | "resolu";

export type Signalement = {
  id: string;
  userId: string;
  category: SignalementCategory;
  status: SignalementStatus;
  title: string;
  description: string | null;
  locationLabel: string;
  lineName: string | null;
  createdAt: string;
  confirmationCount: number;
  confirmedByMe: boolean;
  isMine: boolean;
};

export type SignalementFilters = {
  category?: string;
  status?: string;
};

export async function listSignalements(
  filters?: SignalementFilters
): Promise<Signalement[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  let query = supabase
    .from("signalements_with_counts")
    .select(
      "id, user_id, category, status, title, description, location_label, line_name, created_at, confirmation_count"
    )
    .order("created_at", { ascending: false });

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[listSignalements] Supabase error", error.code, error.message);
    return [];
  }

  const { data: myConfirmations, error: confirmationsError } = await supabase
    .from("signalement_confirmations")
    .select("signalement_id")
    .eq("user_id", user.id);

  if (confirmationsError) {
    console.error(
      "[listSignalements] Supabase error",
      confirmationsError.code,
      confirmationsError.message
    );
  }

  const confirmedIds = new Set((myConfirmations ?? []).map((row) => row.signalement_id));

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    category: row.category,
    status: row.status,
    title: row.title,
    description: row.description,
    locationLabel: row.location_label,
    lineName: row.line_name,
    createdAt: row.created_at,
    confirmationCount: row.confirmation_count ?? 0,
    confirmedByMe: confirmedIds.has(row.id),
    isMine: row.user_id === user.id,
  }));
}

export async function createSignalement(
  _prevState: CreateSignalementFormState,
  formData: FormData
): Promise<CreateSignalementFormState> {
  const validatedFields = createSignalementSchema.safeParse({
    category: formData.get("category"),
    title: formData.get("title"),
    description: formData.get("description"),
    location_label: formData.get("location_label"),
    line_name: formData.get("line_name"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "Connectez-vous pour signaler un problème." };
  }

  const { category, title, description, location_label, line_name } =
    validatedFields.data;

  const { error } = await supabase.from("signalements").insert({
    user_id: user.id,
    category,
    title,
    description: description || null,
    location_label,
    line_name: line_name || null,
  });

  if (error) {
    console.error("[createSignalement] Supabase error", error.code, error.message);
    return { message: "Une erreur est survenue lors de l'enregistrement." };
  }

  return { success: true };
}

export async function confirmSignalement(
  id: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour confirmer un signalement." };
  }

  const { error } = await supabase
    .from("signalement_confirmations")
    .insert({ signalement_id: id, user_id: user.id });

  if (error && error.code !== "23505") {
    console.error("[confirmSignalement] Supabase error", error.code, error.message);
    return { success: false, message: "Une erreur est survenue." };
  }

  return { success: true };
}

export async function unconfirmSignalement(
  id: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour gérer vos confirmations." };
  }

  const { error } = await supabase
    .from("signalement_confirmations")
    .delete()
    .eq("signalement_id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[unconfirmSignalement] Supabase error", error.code, error.message);
    return { success: false, message: "Une erreur est survenue." };
  }

  return { success: true };
}

export async function deleteSignalement(
  id: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour gérer vos signalements." };
  }

  const { error } = await supabase
    .from("signalements")
    .delete()
    .eq("user_id", user.id)
    .eq("id", id);

  if (error) {
    console.error("[deleteSignalement] Supabase error", error.code, error.message);
    return { success: false, message: "Une erreur est survenue." };
  }

  return { success: true };
}

export async function resolveSignalement(
  id: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Connectez-vous pour gérer vos signalements." };
  }

  const { error } = await supabase
    .from("signalements")
    .update({ status: "resolu" })
    .eq("user_id", user.id)
    .eq("id", id);

  if (error) {
    console.error("[resolveSignalement] Supabase error", error.code, error.message);
    return { success: false, message: "Une erreur est survenue." };
  }

  return { success: true };
}
