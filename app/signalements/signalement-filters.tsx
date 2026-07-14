"use client";

import { SIGNALEMENT_CATEGORIES } from "@/lib/validations/signalements";

type SignalementFiltersProps = {
  category: string;
  status: string;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
};

export function SignalementFilters({
  category,
  status,
  onCategoryChange,
  onStatusChange,
}: SignalementFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCategoryChange("")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            category === ""
              ? "bg-foreground text-background"
              : "border border-black/[.08] hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.08]"
          }`}
        >
          Toutes catégories
        </button>
        {Object.entries(SIGNALEMENT_CATEGORIES).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onCategoryChange(key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              category === key
                ? "bg-foreground text-background"
                : "border border-black/[.08] hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.08]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className="w-fit rounded-full border border-black/[.08] bg-background px-4 py-2 text-sm font-medium dark:border-white/[.145]"
      >
        <option value="">Tous statuts</option>
        <option value="ouvert">Ouverts</option>
        <option value="resolu">Résolus</option>
      </select>
    </div>
  );
}
