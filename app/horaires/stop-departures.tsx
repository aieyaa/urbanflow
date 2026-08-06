"use client";

import { useEffect, useRef, useState } from "react";
import type { NaolibStop } from "@/lib/naolib/stops";
import type { Departure } from "@/lib/naolib/siri";
import { addFavoriteStop, removeFavoriteStop } from "@/app/actions/favorites";

const REFRESH_INTERVAL_MS = 60_000;
const PAGE_SIZE = 10;

function formatTime(isoTime: string) {
  return new Date(isoTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

const MODE_LABELS: Record<string, string> = {
  tram: "Tram",
  bus: "Bus",
};

function DepartureRow({ departure }: { departure: Departure }) {
  const displayTime = departure.expectedTime ?? departure.aimedTime;
  const modeLabel = MODE_LABELS[departure.mode] ?? departure.mode;

  return (
    <li className="flex items-center justify-between gap-4 rounded-md border border-black/[.1] px-4 py-3 text-sm dark:border-white/[.15]">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-medium ${
              departure.mode === "tram"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
            }`}
          >
            {modeLabel}
          </span>
          <span className="font-medium">{departure.line}</span>
        </div>
        <span className="text-zinc-600 dark:text-zinc-400">→ {departure.destination}</span>
      </div>
      <div className="flex flex-col items-end">
        <span>{formatTime(displayTime)}</span>
        {!departure.isRealtime && (
          <span className="text-xs text-zinc-600 dark:text-zinc-400">horaire théorique</span>
        )}
        {departure.isRealtime && departure.delayMinutes > 1 && (
          <span className="text-xs text-orange-600 dark:text-orange-400">
            +{departure.delayMinutes} min
          </span>
        )}
      </div>
    </li>
  );
}

type StopDeparturesProps = {
  initialFavoriteStopIds: string[];
};

export function StopDepartures({ initialFavoriteStopIds }: StopDeparturesProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NaolibStop[]>([]);
  const [selectedStop, setSelectedStop] = useState<NaolibStop | null>(null);
  const [departures, setDepartures] = useState<Departure[] | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [favoriteStopIds, setFavoriteStopIds] = useState(new Set(initialFavoriteStopIds));
  const [favoritePending, setFavoritePending] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  async function handleToggleFavorite() {
    if (!selectedStop) return;
    setFavoritePending(true);

    const isFavorite = favoriteStopIds.has(selectedStop.id);
    const response = isFavorite
      ? await removeFavoriteStop(selectedStop.id)
      : await addFavoriteStop(selectedStop.id, selectedStop.name);

    if (response.success) {
      setFavoriteStopIds((prev) => {
        const next = new Set(prev);
        if (isFavorite) {
          next.delete(selectedStop.id);
        } else {
          next.add(selectedStop.id);
        }
        return next;
      });
    }

    setFavoritePending(false);
  }

  function handleChange(value: string) {
    setQuery(value);
    setSelectedStop(null);
    setDepartures(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const response = await fetch(`/api/naolib/stops?q=${encodeURIComponent(value)}`);
      const data = await response.json();
      setSuggestions(data.stops ?? []);
    }, 300);
  }

  function handlePick(stop: NaolibStop) {
    setQuery(stop.name);
    setSuggestions([]);
    setSelectedStop(stop);
  }

  useEffect(() => {
    if (!selectedStop) return;

    setPage(0);
    let cancelled = false;

    async function fetchDepartures() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/naolib/departures?stopId=${encodeURIComponent(selectedStop!.id)}`
        );
        const data = await response.json();
        const nextDepartures: Departure[] = data.departures ?? [];
        if (!cancelled) {
          setDepartures(nextDepartures);
          const maxPage = Math.max(0, Math.ceil(nextDepartures.length / PAGE_SIZE) - 1);
          setPage((p) => Math.min(p, maxPage));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDepartures();
    const interval = setInterval(fetchDepartures, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedStop]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative flex flex-col gap-1">
        <label htmlFor="stop" className="text-sm font-medium">
          Arrêt
        </label>
        <input
          id="stop"
          type="text"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          autoComplete="off"
          placeholder="Commerce, Gare Nord, Bellevue..."
          className="rounded-md border border-black/[.1] bg-transparent px-3 py-2 dark:border-white/[.15]"
        />
        {suggestions.length > 0 && (
          <ul className="absolute top-full z-10 mt-1 w-full rounded-md border border-black/[.1] bg-background shadow-md dark:border-white/[.15]">
            {suggestions.map((stop) => (
              <li key={stop.id}>
                <button
                  type="button"
                  onClick={() => handlePick(stop)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-black/[.04] dark:hover:bg-white/[.08]"
                >
                  {stop.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedStop && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">{selectedStop.name}</h2>
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={favoritePending}
              className="rounded-full border border-black/[.1] px-3 py-1 text-xs transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.15] dark:hover:bg-white/[.08]"
            >
              {favoriteStopIds.has(selectedStop.id) ? "★ Favori" : "☆ Ajouter aux favoris"}
            </button>
          </div>
          {loading && departures === null && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Chargement...</p>
          )}
          {departures !== null && departures.length === 0 && (
            <p className="rounded-md border border-black/[.1] px-4 py-6 text-center text-sm text-zinc-600 dark:border-white/[.15] dark:text-zinc-400">
              Horaires temps réel indisponibles pour cet arrêt pour le moment.
            </p>
          )}
          {departures !== null && departures.length > 0 && (
            <>
              <ul className="flex flex-col gap-2">
                {departures.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((departure, index) => (
                  <DepartureRow
                    key={`${departure.line}-${departure.aimedTime}-${index}`}
                    departure={departure}
                  />
                ))}
              </ul>
              {departures.length > PAGE_SIZE && (
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="rounded-md border border-black/[.1] px-3 py-1 disabled:opacity-40 dark:border-white/[.15]"
                  >
                    Précédent
                  </button>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Page {page + 1} / {Math.ceil(departures.length / PAGE_SIZE)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((p) =>
                        Math.min(Math.ceil(departures.length / PAGE_SIZE) - 1, p + 1)
                      )
                    }
                    disabled={page >= Math.ceil(departures.length / PAGE_SIZE) - 1}
                    className="rounded-md border border-black/[.1] px-3 py-1 disabled:opacity-40 dark:border-white/[.15]"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
