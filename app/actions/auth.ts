"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  signupSchema,
  loginSchema,
  type SignupFormState,
  type LoginFormState,
} from "@/lib/validations/auth";

export async function signup(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const validatedFields = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    consent: formData.get("consent"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error("[signup] Supabase error", error.code, error.status, error.message);
    if (error.code === "user_already_exists") {
      return {
        errors: { email: ["Un compte existe déjà avec cette adresse email."] },
      };
    }
    return { message: "Une erreur est survenue lors de la création du compte." };
  }

  redirect("/signup/confirmation");
}

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { message: "Email ou mot de passe incorrect." };
  }

  const { email, password } = validatedFields.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[login] Supabase error", error.code, error.status, error.message);
    return { message: "Email ou mot de passe incorrect." };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
