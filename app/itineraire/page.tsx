import { ItinerarySearchForm } from "./itinerary-search-form";

export default function ItinerairePage() {
  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Planifier un itinéraire</h1>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Saisissez un départ et une arrivée pour comparer les modes de transport.
        </p>
      </div>
      <ItinerarySearchForm />
    </div>
  );
}
