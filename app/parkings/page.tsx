import { getParkingAvailability } from "@/lib/parking/nantes";
import { MobilityTabs } from "@/components/mobility-tabs";
import ParkingMap from "./parking-map-loader";

export default async function ParkingsPage() {
  const parkings = await getParkingAvailability();

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <MobilityTabs />
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Disponibilité des parkings</h1>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Places disponibles en temps réel dans les parkings publics Naolib de Nantes.
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <ParkingMap initialParkings={parkings} />
      </div>
    </div>
  );
}
