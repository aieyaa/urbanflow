"use client";

import { useEffect, useState } from "react";

type TrafficSegment = {
  id: number;
  label: string;
  state: string;
  speedKmh: number | null;
  travelTimeSeconds: number | null;
  updatedAt: string | null;
  path: [number, number][];
};

const STATE_ORDER = ["Bloqué", "Saturé", "Dense", "Fluide", "Indéterminé"];

const STATE_STYLES: Record<string, string> = {
  Fluide: "border-l-green-600 text-green-700 dark:text-green-400",
  Dense: "border-l-orange-600 text-orange-700 dark:text-orange-400",
  Saturé: "border-l-red-600 text-red-700 dark:text-red-400",
  Bloqué: "border-l-red-900 text-red-900 dark:text-red-500",
  Indéterminé: "border-l-zinc-400 text-zinc-500 dark:text-zinc-400",
};

function formatUpdatedAt(updatedAt: string | null) {
  if (!updatedAt) return null;
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

const PAGE_SIZE = 15;

export function TrafficCards() {
  const [segments, setSegments] = useState<TrafficSegment[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    function load() {
      fetch("/api/trafic")
        .then((response) => response.json())
        .then((data) => {
          if (!cancelled) setSegments(data.segments ?? []);
        })
        .catch((error) => console.error("[TrafficCards] fetch failed", error));
    }

    load();
    const intervalId = setInterval(load, 60_000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const sorted = [...segments].sort(
    (a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state)
  );

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Chargement des données de trafic...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {paged.map((segment) => (
        <li
          key={segment.id}
          className={`flex flex-col gap-1 rounded-md border border-l-4 border-black/[.1] bg-black/[.02] px-4 py-3 text-sm dark:border-white/[.15] dark:bg-white/[.03] ${
            STATE_STYLES[segment.state] ?? STATE_STYLES["Indéterminé"]
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-foreground">{segment.label}</span>
            <span className="font-medium">{segment.state}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-zinc-600 dark:text-zinc-400">
            {segment.speedKmh !== null && segment.speedKmh >= 0 && (
              <span>{segment.speedKmh} km/h</span>
            )}
            {segment.travelTimeSeconds !== null && segment.travelTimeSeconds >= 0 && (
              <span>{Math.round(segment.travelTimeSeconds)} s de trajet</span>
            )}
            {formatUpdatedAt(segment.updatedAt) && (
              <span>Maj {formatUpdatedAt(segment.updatedAt)}</span>
            )}
          </div>
        </li>
        ))}
      </ul>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-full border border-black/[.1] px-3 py-1 transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.15] dark:hover:bg-white/[.08]"
          >
            Précédent
          </button>
          <span className="text-zinc-600 dark:text-zinc-400">
            Page {currentPage} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount}
            className="rounded-full border border-black/[.1] px-3 py-1 transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.15] dark:hover:bg-white/[.08]"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
