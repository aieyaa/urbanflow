"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, CircleMarker as LeafletCircleMarker } from "leaflet";
import type { ParkingSpot } from "@/lib/parking/nantes";

const NANTES_CENTER: [number, number] = [47.2184, -1.5536];
const NANTES_ZOOM = 13;
const REFRESH_INTERVAL_MS = 60_000;
const SELECTED_ZOOM = 16;
const PAGE_SIZE = 5;

function DeselectOnMapClick({ onDeselect }: { onDeselect: () => void }) {
  useMapEvents({
    click: () => onDeselect(),
  });
  return null;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef(new Map<number, LeafletCircleMarker>());

  const filteredParkings = parkings.filter((spot) =>
    normalize(spot.name).includes(normalize(query))
  );
  const pageCount = Math.max(1, Math.ceil(filteredParkings.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pagedParkings = filteredParkings.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(0);
  }

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

  function handleSelect(spot: ParkingSpot) {
    setSelectedId(spot.id);
    if (spot.lat === null || spot.lon === null) return;
    mapRef.current?.flyTo([spot.lat, spot.lon], SELECTED_ZOOM);
    markerRefs.current.get(spot.id)?.openPopup();
  }

  function handleDeselect() {
    setSelectedId(null);
    mapRef.current?.flyTo(NANTES_CENTER, NANTES_ZOOM);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <MapContainer
        ref={mapRef}
        center={NANTES_CENTER}
        zoom={NANTES_ZOOM}
        scrollWheelZoom={false}
        className="h-96 w-full rounded-md"
      >
        <DeselectOnMapClick onDeselect={handleDeselect} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {located.map((spot) => (
          <CircleMarker
            key={spot.id}
            ref={(instance) => {
              if (instance) markerRefs.current.set(spot.id, instance);
              else markerRefs.current.delete(spot.id);
            }}
            center={[spot.lat!, spot.lon!]}
            radius={spot.id === selectedId ? 13 : 9}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: occupancyColor(spot),
              fillOpacity: 0.9,
              className: spot.id === selectedId ? "marker-blink" : undefined,
            }}
            eventHandlers={{ click: () => setSelectedId(spot.id) }}
          >
            <Popup>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{spot.name}</span>
                {spot.address && <span className="text-sm">{spot.address}</span>}
                <span className="text-sm">{statusLabel(spot)}</span>
                {spot.status === 5 && (
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    Capacité totale : {spot.capacity} places
                  </span>
                )}
                {spot.pmrAccess && <span className="text-xs text-zinc-600 dark:text-zinc-400">Accès PMR</span>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <input
        type="text"
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        placeholder="Rechercher un parking..."
        className="w-full rounded-md border border-black/[.1] bg-transparent px-3 py-2 text-sm dark:border-white/[.15]"
      />

      {pagedParkings.length === 0 && (
        <p className="rounded-md border border-black/[.08] px-4 py-6 text-center text-sm text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
          Aucun parking ne correspond à cette recherche.
        </p>
      )}

      <ul className="flex w-full flex-col gap-2">
        {pagedParkings.map((spot) => (
          <li key={spot.id}>
            <button
              type="button"
              onClick={() => handleSelect(spot)}
              disabled={spot.lat === null || spot.lon === null}
              className={`flex w-full items-center justify-between gap-4 rounded-md border px-4 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                spot.id === selectedId
                  ? "border-black/[.3] bg-black/[.04] dark:border-white/[.4] dark:bg-white/[.08]"
                  : "border-black/[.08] hover:bg-black/[.02] dark:border-white/[.145] dark:hover:bg-white/[.05]"
              }`}
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
            </button>
          </li>
        ))}
      </ul>

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="rounded-full border border-black/[.1] px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[.15]"
          >
            Précédent
          </button>
          <span className="text-zinc-600 dark:text-zinc-400">
            Page {currentPage + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(pageCount - 1, prev + 1))}
            disabled={currentPage >= pageCount - 1}
            className="rounded-full border border-black/[.1] px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[.15]"
          >
            Suivant
          </button>
        </div>
      )}

      {unlocated.length > 0 && (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Localisation indisponible pour {unlocated.map((p) => p.name).join(", ")} — affichés
          uniquement dans la liste.
        </p>
      )}
    </div>
  );
}
