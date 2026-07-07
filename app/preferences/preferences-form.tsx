"use client";

import { useActionState } from "react";
import { savePreferences } from "@/app/actions/preferences";
import {
  transportModes,
  transportModeLabels,
  optimizationCriteria,
  optimizationCriteriaLabels,
} from "@/lib/validations/preferences";

type PreferencesFormProps = {
  initialTransportModes: string[];
  initialOptimizationCriteria: string;
  initialPmrAccessibility: boolean;
};

export function PreferencesForm({
  initialTransportModes,
  initialOptimizationCriteria,
  initialPmrAccessibility,
}: PreferencesFormProps) {
  const [state, action, pending] = useActionState(savePreferences, undefined);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Modes de transport autorisés</legend>
        {transportModes.map((mode) => (
          <label key={mode} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="transportModes"
              value={mode}
              defaultChecked={initialTransportModes.includes(mode)}
            />
            {transportModeLabels[mode]}
          </label>
        ))}
        {state?.errors?.transportModes && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.transportModes[0]}
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Critère d&apos;optimisation</legend>
        {optimizationCriteria.map((criteria) => (
          <label key={criteria} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="optimizationCriteria"
              value={criteria}
              defaultChecked={initialOptimizationCriteria === criteria}
            />
            {optimizationCriteriaLabels[criteria]}
          </label>
        ))}
        {state?.errors?.optimizationCriteria && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.optimizationCriteria[0]}
          </p>
        )}
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="pmrAccessibility"
          defaultChecked={initialPmrAccessibility}
        />
        Activer l&apos;accessibilité PMR
      </label>

      {state?.message && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Préférences enregistrées.
        </p>
      )}

      <button
        disabled={pending}
        type="submit"
        className="mt-2 rounded-full bg-foreground px-5 py-2 text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
