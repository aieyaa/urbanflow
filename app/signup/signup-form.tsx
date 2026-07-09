"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-md border border-black/[.1] bg-transparent px-3 py-2 dark:border-white/[.15]"
        />
        {state?.errors?.email && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="rounded-md border border-black/[.1] bg-transparent px-3 py-2 dark:border-white/[.15]"
        />
        {state?.errors?.password && (
          <ul className="text-sm text-red-600 dark:text-red-400">
            {state.errors.password.map((error) => (
              <li key={error}>- {error}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          className="rounded-md border border-black/[.1] bg-transparent px-3 py-2 dark:border-white/[.15]"
        />
        {state?.errors?.confirmPassword && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.confirmPassword[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-2">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            className="mt-1"
          />
          <label htmlFor="consent" className="text-sm">
            J&apos;accepte que mes données de géolocalisation et d&apos;habitudes
            de transport soient collectées et traitées conformément au RGPD.
          </label>
        </div>
        {state?.errors?.consent && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.consent[0]}
          </p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}

      <button
        disabled={pending}
        type="submit"
        className="mt-2 rounded-full bg-foreground px-5 py-2 text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {pending ? "Création du compte..." : "Créer mon compte"}
      </button>
    </form>
  );
}
