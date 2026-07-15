"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DailyCarbon = { date: string; emitted: number; saved: number };
type Totals = { emitted: number; saved: number; count: number };

type CarbonDashboardProps = {
  week: Totals;
  month: Totals;
  monthModeLabel: string | null;
  totalSaved: number;
  dailySeries: DailyCarbon[];
  hasTrips: boolean;
};

// Palette slots 1 (blue) and 2 (aqua) — fixed categorical order, light/dark validated pair.
const COLORS = {
  light: { emitted: "#2a78d6", saved: "#1baf7a", grid: "#e1e0d9", tick: "#898781" },
  dark: { emitted: "#3987e5", saved: "#199e70", grid: "#2c2c2a", tick: "#898781" },
};

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribeToDarkMode(callback: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getIsDarkMode() {
  return window.matchMedia(DARK_QUERY).matches;
}

function getIsDarkModeServerSnapshot() {
  return false;
}

function useIsDarkMode() {
  return useSyncExternalStore(subscribeToDarkMode, getIsDarkMode, getIsDarkModeServerSnapshot);
}

function formatGrams(grams: number) {
  return grams >= 1000 ? `${(grams / 1000).toFixed(1)} kg` : `${Math.round(grams)} g`;
}

function formatAxisDate(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-black/[.1] px-4 py-3 dark:border-white/[.15]">
      <span className="text-xs text-zinc-600 dark:text-zinc-400">{label}</span>
      <span className="text-xl font-semibold">{value}</span>
    </div>
  );
}

export function CarbonDashboard({
  week,
  month,
  monthModeLabel,
  totalSaved,
  dailySeries,
  hasTrips,
}: CarbonDashboardProps) {
  const isDark = useIsDarkMode();
  const colors = isDark ? COLORS.dark : COLORS.light;

  if (!hasTrips) {
    return (
      <p className="rounded-md border border-black/[.1] px-4 py-6 text-center text-sm text-zinc-600 dark:border-white/[.15] dark:text-zinc-400">
        Choisissez un trajet depuis la page Itinéraire pour commencer à suivre votre bilan.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Récapitulatif du mois
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Trajets ce mois" value={String(month.count)} />
          <StatTile label="CO2 économisé (total)" value={formatGrams(totalSaved)} />
          <StatTile label="Mode le plus utilisé" value={monthModeLabel ?? "—"} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Cette semaine</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="CO2 émis" value={formatGrams(week.emitted)} />
          <StatTile label="CO2 économisé" value={formatGrams(week.saved)} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Ce mois</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="CO2 émis" value={formatGrams(month.emitted)} />
          <StatTile label="CO2 économisé" value={formatGrams(month.saved)} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Évolution (30 derniers jours)
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={colors.grid} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                tick={{ fill: colors.tick, fontSize: 12 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={(value: number) => formatGrams(value)}
                tick={{ fill: colors.tick, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                formatter={(value) => formatGrams(Number(value))}
                labelFormatter={(label) => formatAxisDate(String(label))}
              />
              <Legend verticalAlign="top" height={32} />
              <Area
                type="monotone"
                dataKey="emitted"
                name="CO2 émis"
                stroke={colors.emitted}
                strokeWidth={2}
                fill={colors.emitted}
                fillOpacity={0.1}
              />
              <Area
                type="monotone"
                dataKey="saved"
                name="CO2 économisé"
                stroke={colors.saved}
                strokeWidth={2}
                fill={colors.saved}
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
