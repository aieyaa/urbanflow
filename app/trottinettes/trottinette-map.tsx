"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, CircleMarker as LeafletCircleMarker } from "leaflet";
import type { ScooterStation } from "@/lib/trottinette/nantes";

const NANTES_CENTER: [number, number] = [47.2184, -1.5536];
const NANTES_ZOOM = 13;
const REFRESH_INTERVAL_MS = 30_000;
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

function occupancyColor(station: ScooterStation): string {
  if (!station.isRenting) return "#6b7280";
  if (station.capacity <= 0) return "#6b7280";

  const ratio = station.scootersAvailable / station.capacity;
  if (ratio > 0.3) return "#16a34a";
  if (ratio > 0.1) return "#ca8a04";
  return "#dc2626";
}

function statusLabel(station: ScooterStation): string {
  if (!station.isRenting) return "Station fermée";
  if (station.scootersAvailable <= 0) return "Aucune trottinette disponible";
  return `${station.scootersAvailable} trottinette${station.scootersAvailable > 1 ? "s" : ""} disponible${station.scootersAvailable > 1 ? "s" : ""}`;
}

type TrottinetteMapProps = {
  initialStations: ScooterStation[];
};

export default function TrottinetteMap({ initialStations }: TrottinetteMapProps) {
  const [stations, setStations] = useState(initialStations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef(new Map<string, LeafletCircleMarker>());

  const filteredStations = stations.filter((station) =>
    normalize(station.name).includes(normalize(query))
  );
  const pageCount = Math.max(1, Math.ceil(filteredStations.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pagedStations = filteredStations.slice(
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
        const response = await fetch("/api/trottinette", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        setStations(data.stations);
      } catch (error) {
        console.error("[TrottinetteMap] refresh failed", error);
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  function handleSelect(station: ScooterStation) {
    setSelectedId(station.id);
    mapRef.current?.flyTo([station.lat, station.lon], SELECTED_ZOOM);
    markerRefs.current.get(station.id)?.openPopup();
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
        {stations.map((station) => (
          <CircleMarker
            key={station.id}
            ref={(instance) => {
              if (instance) markerRefs.current.set(station.id, instance);
              else markerRefs.current.delete(station.id);
            }}
            center={[station.lat, station.lon]}
            radius={station.id === selectedId ? 13 : 9}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: occupancyColor(station),
              fillOpacity: 0.9,
              className: station.id === selectedId ? "marker-blink" : undefined,
            }}
            eventHandlers={{ click: () => setSelectedId(station.id) }}
          >
            <Popup>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{station.name}</span>
                <span className="text-sm">{statusLabel(station)}</span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {station.docksAvailable} place{station.docksAvailable > 1 ? "s" : ""} libre
                  {station.docksAvailable > 1 ? "s" : ""} · Capacité totale : {station.capacity}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <input
        type="text"
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        placeholder="Rechercher une station..."
        className="w-full rounded-md border border-black/[.1] bg-transparent px-3 py-2 text-sm dark:border-white/[.15]"
      />

      {pagedStations.length === 0 && (
        <p className="rounded-md border border-black/[.08] px-4 py-6 text-center text-sm text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
          Aucune station ne correspond à cette recherche.
        </p>
      )}

      <ul className="flex w-full flex-col gap-2">
        {pagedStations.map((station) => (
          <li key={station.id}>
            <button
              type="button"
              onClick={() => handleSelect(station)}
              className={`flex w-full items-center justify-between gap-4 rounded-md border px-4 py-2 text-left text-sm transition-colors ${
                station.id === selectedId
                  ? "border-black/[.3] bg-black/[.04] dark:border-white/[.4] dark:bg-white/[.08]"
                  : "border-black/[.08] hover:bg-black/[.02] dark:border-white/[.145] dark:hover:bg-white/[.05]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: occupancyColor(station) }}
                />
                <span className="font-medium">{station.name}</span>
              </div>
              <span className="text-zinc-600 dark:text-zinc-400">{statusLabel(station)}</span>
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
    </div>
  );
}
