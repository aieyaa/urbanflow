import { WeatherWidget } from "./weather-widget";
import { TrafficCards } from "./traffic-cards";

export default function TraficPage() {
  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Trafic et météo</h1>
        <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          Fluidité des axes routiers de Nantes Métropole (mise à jour toutes les
          minutes) et conditions météo actuelles.
        </p>
      </div>

      <div className="flex w-full max-w-3xl flex-col gap-4">
        <WeatherWidget />
        <TrafficCards />
      </div>
    </div>
  );
}
