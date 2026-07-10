import { getCarpoolSpots } from "@/lib/covoiturage/nantes";
import { MobilityTabs } from "@/components/mobility-tabs";
import CovoiturageMap from "./covoiturage-map-loader";

export default async function CovoiturageePage() {
  const spots = await getCarpoolSpots();

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <MobilityTabs />
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Aires de covoiturage</h1>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Lieux de rendez-vous pour le covoiturage à Nantes Métropole.
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <CovoiturageMap spots={spots} />
      </div>
    </div>
  );
}
