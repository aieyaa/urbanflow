"use client";

import { useActionState, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { searchItineraries, type ItineraryResult } from "@/app/actions/itinerary";
import { logTrip } from "@/app/actions/trips";
import { transportModeLabels, type TransportMode } from "@/lib/validations/preferences";

const RouteMap = dynamic(() => import("./route-map"), { ssr: false });

type Suggestion = { label: string; lat: number; lon: number };

function AddressField({
  name,
  label,
  onSelect,
  locatable,
}: {
  name: string;
  label: string;
  onSelect: (suggestion: Suggestion | null) => void;
  locatable?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleChange(value: string) {
    setQuery(value);
    setGeoError(null);
    onSelect(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`);
      const data = await response.json();
      setSuggestions(data.suggestions ?? []);
    }, 300);
  }

  function handlePick(suggestion: Suggestion) {
    setQuery(suggestion.label);
    setSuggestions([]);
    setGeoError(null);
    onSelect(suggestion);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }

    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        const response = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lon}`);
        const data = await response.json();
        handlePick({ label: data.label ?? "Ma position actuelle", lat, lon });
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        setGeoError(
          error.code === error.PERMISSION_DENIED
            ? "Géolocalisation refusée. Saisissez votre adresse manuellement."
            : "Impossible de récupérer votre position. Saisissez votre adresse manuellement."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="relative flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={name}
          type="text"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          autoComplete="off"
          required
          className="flex-1 rounded-md border border-black/[.1] bg-transparent px-3 py-2 dark:border-white/[.15]"
        />
        {locatable && (
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating}
            title="Utiliser ma position"
            className="shrink-0 rounded-md border border-black/[.1] px-3 text-sm transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.15] dark:hover:bg-white/[.08]"
          >
            {locating ? "..." : "📍"}
          </button>
        )}
      </div>
      {geoError && (
        <p className="text-sm text-red-600 dark:text-red-400">{geoError}</p>
      )}
      {suggestions.length > 0 && (
        <ul className="absolute top-full z-10 mt-1 w-full rounded-md border border-black/[.1] bg-background shadow-md dark:border-white/[.15]">
          {suggestions.map((suggestion) => (
            <li key={suggestion.label}>
              <button
                type="button"
                onClick={() => handlePick(suggestion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-black/[.04] dark:hover:bg-white/[.08]"
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

type TripLogState = { status: "idle" | "pending" | "done" | "error"; message?: string };

export function ItinerarySearchForm() {
  const [state, action, pending] = useActionState(searchItineraries, undefined);
  const [origin, setOrigin] = useState<Suggestion | null>(null);
  const [destination, setDestination] = useState<Suggestion | null>(null);
  const [tripLogs, setTripLogs] = useState<Partial<Record<TransportMode, TripLogState>>>({});

  async function handleChooseTrip(result: ItineraryResult) {
    setTripLogs((prev) => ({ ...prev, [result.mode]: { status: "pending" } }));

    const response = await logTrip({
      mode: result.mode,
      distanceMeters: result.distanceMeters,
      durationSeconds: result.durationSeconds,
      carbonGrams: result.carbonGrams,
    });

    setTripLogs((prev) => ({
      ...prev,
      [result.mode]: {
        status: response.success ? "done" : "error",
        message: response.message,
      },
    }));
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <form action={action} className="flex flex-col gap-4">
        <AddressField name="origin" label="Départ" onSelect={setOrigin} locatable />
        <AddressField name="destination" label="Arrivée" onSelect={setDestination} />

        <input type="hidden" name="originLat" value={origin?.lat ?? ""} />
        <input type="hidden" name="originLon" value={origin?.lon ?? ""} />
        <input type="hidden" name="destinationLat" value={destination?.lat ?? ""} />
        <input type="hidden" name="destinationLon" value={destination?.lon ?? ""} />

        {state?.message && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
        )}

        <button
          disabled={pending}
          type="submit"
          className="rounded-full bg-foreground px-5 py-2 text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          {pending ? "Recherche..." : "Rechercher"}
        </button>
      </form>

      {state?.results && state.results.length > 0 && origin && destination && (
        <div className="flex flex-col gap-4">
          <RouteMap
            origin={[origin.lat, origin.lon]}
            destination={[destination.lat, destination.lon]}
            results={state.results}
          />
          <ul className="flex flex-col gap-2">
            {state.results.map((result) => {
              const tripLog = tripLogs[result.mode] ?? { status: "idle" as const };

              return (
                <li
                  key={result.mode}
                  className="flex flex-col gap-2 rounded-md border border-black/[.1] px-4 py-3 text-sm dark:border-white/[.15]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {transportModeLabels[result.mode as TransportMode]}
                      {result.approximate && (
                        <span className="ml-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                          (estimation)
                        </span>
                      )}
                    </span>
                    <span>{formatDuration(result.durationSeconds)}</span>
                    <span>{formatDistance(result.distanceMeters)}</span>
                    <span>{result.carbonGrams} g CO2</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {tripLog.status === "done" ? (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        ✓ Trajet enregistré
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleChooseTrip(result)}
                        disabled={tripLog.status === "pending"}
                        className="rounded-full border border-black/[.1] px-3 py-1 text-xs transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.15] dark:hover:bg-white/[.08]"
                      >
                        {tripLog.status === "pending" ? "..." : "Choisir ce trajet"}
                      </button>
                    )}
                    {tripLog.status === "error" && tripLog.message && (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        {tripLog.message}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {state.unavailableModes && state.unavailableModes.length > 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Modes indisponibles pour l&apos;instant :{" "}
              {state.unavailableModes
                .map((mode) => transportModeLabels[mode as TransportMode])
                .join(", ")}{" "}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
