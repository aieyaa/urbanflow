"use client";

import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import type { ItineraryResult } from "@/app/actions/itinerary";

const MODE_COLORS: Record<string, string> = {
  marche: "#16a34a",
  velo: "#2563eb",
  trottinette: "#9333ea",
  voiture: "#dc2626",
  transport_commun: "#ca8a04",
};

type RouteMapProps = {
  origin: [number, number];
  destination: [number, number];
  results: ItineraryResult[];
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

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [32, 32] });
    }
  }, [map, points]);

  return null;
}

export default function RouteMap({ origin, destination, results }: RouteMapProps) {
  const allPoints = [origin, destination, ...results.flatMap((r) => r.geometry)];

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
      {results.map((result) => (
        <Polyline
          key={result.mode}
          positions={result.geometry}
          pathOptions={{ color: MODE_COLORS[result.mode] ?? "#000" }}
        />
      ))}
      <LiveUserLocation />
      <FitBounds points={allPoints} />
    </MapContainer>
  );
}
