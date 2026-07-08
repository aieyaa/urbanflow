"use client";

import { useEffect, useRef, useState } from "react";
import type { NaolibStop } from "@/lib/naolib/stops";
import type { Departure } from "@/lib/naolib/siri";

const REFRESH_INTERVAL_MS = 60_000;

function formatTime(isoTime: string) {
  return new Date(isoTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function DepartureRow({ departure }: { departure: Departure }) {
  const displayTime = departure.expectedTime ?? departure.aimedTime;

  return (
    <li className="flex items-center justify-between gap-4 rounded-md border border-black/[.1] px-4 py-3 text-sm dark:border-white/[.15]">
      <div className="flex flex-col">
        <span className="font-medium">{departure.line}</span>
        <span className="text-zinc-600 dark:text-zinc-400">→ {departure.destination}</span>
      </div>
      <div className="flex flex-col items-end">
        <span>{formatTime(displayTime)}</span>
        {!departure.isRealtime && (
          <span className="text-xs text-zinc-500">horaire théorique</span>
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

export function StopDepartures() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NaolibStop[]>([]);
  const [selectedStop, setSelectedStop] = useState<NaolibStop | null>(null);
  const [departures, setDepartures] = useState<Departure[] | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

    let cancelled = false;

    async function fetchDepartures() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/naolib/departures?stopId=${encodeURIComponent(selectedStop!.id)}`
        );
        const data = await response.json();
        if (!cancelled) setDepartures(data.departures ?? []);
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
          {loading && departures === null && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Chargement...</p>
          )}
          {departures !== null && departures.length === 0 && (
            <p className="rounded-md border border-black/[.1] px-4 py-6 text-center text-sm text-zinc-600 dark:border-white/[.15] dark:text-zinc-400">
              Horaires temps réel indisponibles pour cet arrêt pour le moment.
            </p>
          )}
          {departures !== null && departures.length > 0 && (
            <ul className="flex flex-col gap-2">
              {departures.map((departure, index) => (
                <DepartureRow key={`${departure.line}-${departure.aimedTime}-${index}`} departure={departure} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
