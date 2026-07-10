import { getScooterStations } from "@/lib/trottinette/nantes";
import { MobilityTabs } from "@/components/mobility-tabs";
import TrottinetteMap from "./trottinette-map-loader";

export default async function TrottinettesPage() {
  const stations = await getScooterStations();

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <MobilityTabs />
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Disponibilité des trottinettes</h1>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Trottinettes disponibles en temps réel dans les bornes Naolib de Nantes.
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <TrottinetteMap initialStations={stations} />
      </div>
    </div>
  );
}
