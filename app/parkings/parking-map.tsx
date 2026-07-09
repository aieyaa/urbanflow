"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import type { ParkingSpot } from "@/lib/parking/nantes";

const NANTES_CENTER: [number, number] = [47.2184, -1.5536];
const REFRESH_INTERVAL_MS = 60_000;

function occupancyColor(spot: ParkingSpot): string {
  if (spot.status !== 5) return "#6b7280";
  if (spot.capacity <= 0) return "#6b7280";

  const ratio = spot.available / spot.capacity;
  if (ratio > 0.3) return "#16a34a";
  if (ratio > 0.1) return "#ca8a04";
  return "#dc2626";
}

function statusLabel(spot: ParkingSpot): string {
  switch (spot.status) {
    case 1:
      return "Fermé";
    case 2:
      return "Abonnés uniquement";
    case 5:
      return spot.available > 0 ? `${spot.available} places disponibles` : "Complet";
    default:
      return "Statut indisponible";
  }
}

type ParkingMapProps = {
  initialParkings: ParkingSpot[];
};

export default function ParkingMap({ initialParkings }: ParkingMapProps) {
  const [parkings, setParkings] = useState(initialParkings);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/parking", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        setParkings(data.parkings);
      } catch (error) {
        console.error("[ParkingMap] refresh failed", error);
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const located = parkings.filter((p) => p.lat !== null && p.lon !== null);
  const unlocated = parkings.filter((p) => p.lat === null || p.lon === null);

  return (
    <div className="flex w-full flex-col gap-6">
      <MapContainer
        center={NANTES_CENTER}
        zoom={13}
        scrollWheelZoom={false}
        className="h-96 w-full rounded-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {located.map((spot) => (
          <CircleMarker
            key={spot.id}
            center={[spot.lat!, spot.lon!]}
            radius={9}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: occupancyColor(spot),
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{spot.name}</span>
                {spot.address && <span className="text-sm">{spot.address}</span>}
                <span className="text-sm">{statusLabel(spot)}</span>
                {spot.status === 5 && (
                  <span className="text-xs text-zinc-500">
                    Capacité totale : {spot.capacity} places
                  </span>
                )}
                {spot.pmrAccess && <span className="text-xs text-zinc-500">Accès PMR</span>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <ul className="flex w-full flex-col gap-2">
        {parkings.map((spot) => (
          <li
            key={spot.id}
            className="flex items-center justify-between gap-4 rounded-md border border-black/[.08] px-4 py-2 text-sm dark:border-white/[.145]"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: occupancyColor(spot) }}
              />
              <span className="font-medium">{spot.name}</span>
            </div>
            <span className="text-zinc-600 dark:text-zinc-400">{statusLabel(spot)}</span>
          </li>
        ))}
      </ul>

      {unlocated.length > 0 && (
        <p className="text-xs text-zinc-500">
          Localisation indisponible pour {unlocated.map((p) => p.name).join(", ")} — affichés
          uniquement dans la liste.
        </p>
      )}
    </div>
  );
}
