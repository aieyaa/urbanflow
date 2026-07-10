"use client";

import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import type { ItineraryResult } from "@/app/actions/itinerary";
import type { CarpoolSpot } from "@/lib/covoiturage/nantes";

const MODE_COLORS: Record<string, string> = {
  marche: "#16a34a",
  velo: "#2563eb",
  trottinette: "#9333ea",
  voiture: "#dc2626",
  transport_commun: "#ca8a04",
  covoiturage: "#0d9488",
};

type RouteMapProps = {
  origin: [number, number];
  destination: [number, number];
  results: ItineraryResult[];
  selectedMode?: string | null;
};

function LiveUserLocation() {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => setPosition(null),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!position) return null;

  return (
    <CircleMarker
      center={position}
      radius={7}
      pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#2563eb", fillOpacity: 1 }}
    />
  );
}

function CarpoolSpotsLayer() {
  const [spots, setSpots] = useState<CarpoolSpot[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/covoiturage")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setSpots(data.spots ?? []);
      })
      .catch((error) => console.error("[CarpoolSpotsLayer] fetch failed", error));

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {spots
        .filter((spot) => spot.lat !== null && spot.lon !== null)
        .map((spot) => (
          <CircleMarker
            key={spot.id}
            center={[spot.lat!, spot.lon!]}
            radius={7}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: "#0d9488",
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{spot.name}</span>
                {spot.address && <span className="text-sm">{spot.address}</span>}
                <span className="text-sm">
                  {spot.open ? `${spot.capacity} places` : "Fermé"}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
    </>
  );
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [32, 32] });
    }
  }, [map, points]);

  return null;
}

export default function RouteMap({ origin, destination, results, selectedMode }: RouteMapProps) {
  const selectedResult = selectedMode
    ? results.find((r) => r.mode === selectedMode)
    : undefined;

  const focusPoints = selectedResult
    ? [origin, destination, ...selectedResult.geometry]
    : [origin, destination, ...results.flatMap((r) => r.geometry)];

  return (
    <MapContainer
      center={origin}
      zoom={13}
      scrollWheelZoom={false}
      className="h-80 w-full rounded-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker center={origin} radius={8} pathOptions={{ color: "#000" }} />
      <CircleMarker center={destination} radius={8} pathOptions={{ color: "#000" }} />
      {results.map((result) => {
        const isSelected = !selectedMode || result.mode === selectedMode;
        return (
          <Polyline
            key={result.mode}
            positions={result.geometry}
            pathOptions={{
              color: MODE_COLORS[result.mode] ?? "#000",
              weight: result.mode === selectedMode ? 6 : 3,
              opacity: isSelected ? 1 : 0.25,
            }}
          />
        );
      })}
      {selectedMode === "covoiturage" && <CarpoolSpotsLayer />}
      <LiveUserLocation />
      <FitBounds points={focusPoints} />
    </MapContainer>
  );
}
