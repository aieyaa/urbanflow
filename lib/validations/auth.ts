import * as z from "zod";

export const signupSchema = z
  .object({
    email: z.email({ error: "Merci de saisir une adresse email valide." }).trim(),
    password: z
      .string()
      .min(8, { error: "8 caractères minimum." })
      .regex(/[a-zA-Z]/, { error: "Doit contenir au moins une lettre." })
      .regex(/[0-9]/, { error: "Doit contenir au moins un chiffre." })
      .regex(/[^a-zA-Z0-9]/, {
        error: "Doit contenir au moins un caractère spécial.",
      }),
    confirmPassword: z.string(),
    consent: z
      .string()
      .optional()
      .refine((value) => value === "on", {
        error: "Vous devez accepter la collecte de vos données pour continuer.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type SignupFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
        consent?: string[];
      };
      message?: string;
    }
  | undefined;

export const loginSchema = z.object({
  email: z.email({ error: "Merci de saisir une adresse email valide." }).trim(),
  password: z.string().min(1, { error: "Merci de saisir votre mot de passe." }),
});

export type LoginFormState =
  | {
      message?: string;
    }
  | undefined;
