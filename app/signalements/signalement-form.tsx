"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { createSignalement } from "@/app/actions/signalements";
import { SIGNALEMENT_CATEGORIES } from "@/lib/validations/signalements";

export function SignalementForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createSignalement, undefined);

  useEffect(() => {
    if (state?.success) {
      startTransition(() => {
        setOpen(false);
        onCreated();
      });
    }
  }, [state, onCreated]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-fit rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Signaler un problème
      </button>
    );
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium">
          Catégorie
        </label>
        <select
          id="category"
          name="category"
          defaultValue=""
          className="rounded-lg border border-black/[.08] bg-background px-3 py-2 text-sm dark:border-white/[.145]"
        >
          <option value="" disabled>
            Choisissez une catégorie
          </option>
          {Object.entries(SIGNALEMENT_CATEGORIES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        {state?.errors?.category && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.category[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          Titre
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Ex : Nid de poule rue de Strasbourg"
          className="rounded-lg border border-black/[.08] bg-background px-3 py-2 text-sm dark:border-white/[.145]"
        />
        {state?.errors?.title && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.errors.title[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="location_label" className="text-sm font-medium">
          Lieu
        </label>
        <input
          id="location_label"
          name="location_label"
          type="text"
          placeholder="Ex : Rue de Strasbourg, devant le n°12"
          className="rounded-lg border border-black/[.08] bg-background px-3 py-2 text-sm dark:border-white/[.145]"
        />
        {state?.errors?.location_label && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.location_label[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="line_name" className="text-sm font-medium">
          Ligne concernée (optionnel)
        </label>
        <input
          id="line_name"
          name="line_name"
          type="text"
          placeholder="Ex : Tramway 1"
          className="rounded-lg border border-black/[.08] bg-background px-3 py-2 text-sm dark:border-white/[.145]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description (optionnel)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="rounded-lg border border-black/[.08] bg-background px-3 py-2 text-sm dark:border-white/[.145]"
        />
        {state?.errors?.description && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}

      <div className="flex gap-2">
        <button
          disabled={pending}
          type="submit"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          {pending ? "Envoi..." : "Envoyer"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-black/[.08] px-5 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.08]"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
