"use client";

import { useState } from "react";
import type { Signalement } from "@/app/actions/signalements";
import {
  confirmSignalement,
  deleteSignalement,
  resolveSignalement,
  unconfirmSignalement,
} from "@/app/actions/signalements";
import { SIGNALEMENT_CATEGORIES } from "@/lib/validations/signalements";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SignalementList({
  signalements,
  onChanged,
}: {
  signalements: Signalement[];
  onChanged: () => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function withPending(id: string, fn: () => Promise<void>) {
    setPendingId(id);
    try {
      await fn();
      onChanged();
    } finally {
      setPendingId(null);
    }
  }

  if (signalements.length === 0) {
    return (
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Aucun signalement pour le moment.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {signalements.map((signalement) => (
        <li
          key={signalement.id}
          className="flex flex-col gap-2 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full border border-black/[.08] px-3 py-1 text-xs font-medium dark:border-white/[.145]">
              {SIGNALEMENT_CATEGORIES[signalement.category]}
            </span>
            {signalement.status === "resolu" && (
              <span className="rounded-full bg-green-600/10 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                Résolu
              </span>
            )}
          </div>

          <h3 className="font-medium">{signalement.title}</h3>
          {signalement.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {signalement.description}
            </p>
          )}
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {signalement.locationLabel}
            {signalement.lineName ? ` · ${signalement.lineName}` : ""}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Signalé le {formatDate(signalement.createdAt)}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={pendingId === signalement.id}
              onClick={() =>
                withPending(signalement.id, async () => {
                  if (signalement.confirmedByMe) {
                    await unconfirmSignalement(signalement.id);
                  } else {
                    await confirmSignalement(signalement.id);
                  }
                })
              }
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                signalement.confirmedByMe
                  ? "bg-foreground text-background"
                  : "border border-black/[.08] hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.08]"
              }`}
            >
              {signalement.confirmedByMe ? "Confirmé" : "Confirmer"} (
              {signalement.confirmationCount})
            </button>

            {signalement.isMine && signalement.status === "ouvert" && (
              <button
                type="button"
                disabled={pendingId === signalement.id}
                onClick={() =>
                  withPending(signalement.id, async () => {
                    await resolveSignalement(signalement.id);
                  })
                }
                className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.145] dark:hover:bg-white/[.08]"
              >
                Marquer résolu
              </button>
            )}

            {signalement.isMine && (
              <button
                type="button"
                disabled={pendingId === signalement.id}
                onClick={() =>
                  withPending(signalement.id, async () => {
                    await deleteSignalement(signalement.id);
                  })
                }
                className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.145] dark:text-red-400 dark:hover:bg-white/[.08]"
              >
                Supprimer
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
