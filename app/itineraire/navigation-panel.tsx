"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ItineraryResult } from "@/app/actions/itinerary";
import { nearestPointIndex, remainingDistanceMeters } from "@/lib/geo/distance";

const RouteMap = dynamic(() => import("./route-map"), { ssr: false });

function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

type NavigationPanelProps = {
  origin: [number, number];
  destination: [number, number];
  result: ItineraryResult;
  onExit: () => void;
};

export function NavigationPanel({ origin, destination, result, onExit }: NavigationPanelProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      const timeoutId = setTimeout(
        () => setGeoError("La géolocalisation n'est pas disponible sur cet appareil."),
        0
      );
      return () => clearTimeout(timeoutId);
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setGeoError(null);
      },
      () =>
        setGeoError(
          "Impossible de suivre votre position. Vérifiez que la géolocalisation est autorisée."
        ),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const progress = useMemo(() => {
    const reference = position ?? origin;
    const { index: nearestIndex, distanceMeters: offRouteMeters } = nearestPointIndex(
      reference,
      result.geometry
    );
    const remainingMeters = remainingDistanceMeters(nearestIndex, result.geometry);
    const pace = result.durationSeconds / Math.max(result.distanceMeters, 1);
    const remainingSeconds = remainingMeters * pace;

    const currentStep =
      result.steps.find((step) => nearestIndex >= step.startIndex && nearestIndex < step.endIndex) ??
      result.steps[result.steps.length - 1];
    const currentStepIndex = currentStep ? result.steps.indexOf(currentStep) : -1;
    const nextStep = currentStepIndex >= 0 ? result.steps[currentStepIndex + 1] : undefined;

    const arrived = remainingMeters < 20;

    return { remainingMeters, remainingSeconds, currentStep, nextStep, offRouteMeters, arrived };
  }, [position, origin, result]);

  return (
    <div className="flex flex-col gap-4">
      <RouteMap
        origin={origin}
        destination={destination}
        results={[result]}
        selectedMode={result.mode}
      />

      {geoError && (
        <p className="text-sm text-red-600 dark:text-red-400">{geoError}</p>
      )}

      {progress.arrived ? (
        <div className="rounded-md border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          Vous êtes arrivé à destination.
        </div>
      ) : (
        <div className="flex flex-col gap-2 rounded-md border border-black/[.1] px-4 py-3 dark:border-white/[.15]">
          <p className="text-base font-medium">
            {progress.currentStep?.instruction ?? "Suivez le tracé sur la carte."}
          </p>
          {progress.nextStep && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Ensuite : {progress.nextStep.instruction}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <span>{formatDistance(progress.remainingMeters)} restants</span>
            <span>{formatDuration(progress.remainingSeconds)}</span>
          </div>
          {!position && !geoError && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Recherche de votre position...
            </p>
          )}
          {position && progress.offRouteMeters > 50 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Vous semblez être à {formatDistance(progress.offRouteMeters)} du tracé.
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onExit}
        className="self-start rounded-full border border-black/[.1] px-4 py-2 text-sm transition-colors hover:bg-black/[.04] dark:border-white/[.15] dark:hover:bg-white/[.08]"
      >
        Quitter la navigation
      </button>
    </div>
  );
}
