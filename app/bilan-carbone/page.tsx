import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { estimateCarbonGrams } from "@/lib/itinerary/carbon";
import { transportModeLabels, type TransportMode } from "@/lib/validations/preferences";
import { CarbonDashboard, type DailyCarbon } from "./carbon-dashboard";

const HISTORY_DAYS = 90;
const CHART_DAYS = 30;

type TripRow = {
  mode: TransportMode;
  distance_meters: number;
  carbon_grams: number;
  created_at: string;
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = startOfDay(date);
  monday.setDate(monday.getDate() - diffToMonday);
  return monday;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function savedGramsForTrip(trip: TripRow) {
  return Math.max(0, estimateCarbonGrams("voiture", trip.distance_meters) - trip.carbon_grams);
}

function sumSince(trips: TripRow[], since: Date) {
  const relevant = trips.filter((trip) => new Date(trip.created_at) >= since);
  return {
    emitted: relevant.reduce((total, trip) => total + trip.carbon_grams, 0),
    saved: relevant.reduce((total, trip) => total + savedGramsForTrip(trip), 0),
    count: relevant.length,
  };
}

function mostUsedMode(trips: TripRow[]): TransportMode | null {
  if (trips.length === 0) return null;

  const counts = new Map<TransportMode, number>();
  for (const trip of trips) {
    counts.set(trip.mode, (counts.get(trip.mode) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function buildDailySeries(trips: TripRow[]): DailyCarbon[] {
  const today = startOfDay(new Date());
  const days: DailyCarbon[] = [];

  for (let i = CHART_DAYS - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayTrips = trips.filter((trip) => {
      const tripDate = new Date(trip.created_at);
      return tripDate >= day && tripDate < nextDay;
    });

    days.push({
      date: day.toISOString().slice(0, 10),
      emitted: dayTrips.reduce((total, trip) => total + trip.carbon_grams, 0),
      saved: dayTrips.reduce((total, trip) => total + savedGramsForTrip(trip), 0),
    });
  }

  return days;
}

export default async function BilanCarbonePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const since = new Date();
  since.setDate(since.getDate() - HISTORY_DAYS);

  const { data: trips } = await supabase
    .from("trips")
    .select("mode, distance_meters, carbon_grams, created_at")
    .eq("user_id", user.id)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  const tripRows = (trips ?? []) as TripRow[];

  const week = sumSince(tripRows, startOfWeek(new Date()));
  const month = sumSince(tripRows, startOfMonth(new Date()));
  const monthMode = mostUsedMode(
    tripRows.filter((trip) => new Date(trip.created_at) >= startOfMonth(new Date()))
  );
  const totalSaved = tripRows.reduce((total, trip) => total + savedGramsForTrip(trip), 0);
  const dailySeries = buildDailySeries(tripRows);

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Mon bilan carbone</h1>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Suivez votre empreinte carbone et vos économies de CO2 sur vos trajets.
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <CarbonDashboard
          week={week}
          month={month}
          monthModeLabel={monthMode ? transportModeLabels[monthMode] : null}
          totalSaved={totalSaved}
          dailySeries={dailySeries}
          hasTrips={tripRows.length > 0}
        />
      </div>
    </div>
  );
}
