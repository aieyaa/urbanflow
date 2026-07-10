import { getBikeAvailability } from "@/lib/velo/nantes";
import { MobilityTabs } from "@/components/mobility-tabs";
import VeloMap from "./velo-map-loader";

export default async function VelosPage() {
  const stations = await getBikeAvailability();

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <MobilityTabs />
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Disponibilité des vélos</h1>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Vélos et places disponibles en temps réel dans les stations Naolib de Nantes.
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <VeloMap initialStations={stations} />
      </div>
    </div>
  );
}
