import { getServiceAlerts } from "@/lib/naolib/siri";
import { StopDepartures } from "./stop-departures";

export default async function HorairesPage() {
  const alerts = await getServiceAlerts();

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Horaires en temps réel</h1>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Prochains passages aux arrêts Naolib, mis à jour en temps réel.
        </p>
      </div>

      <div className="w-full max-w-md">
        {alerts.length > 0 && (
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Perturbations en cours
            </h2>
            <ul className="flex flex-col gap-2">
              {alerts.map((alert, index) => (
                <li
                  key={index}
                  className="rounded-md border border-orange-600/30 bg-orange-600/5 px-4 py-3 text-sm dark:border-orange-400/30"
                >
                  <p className="font-medium">{alert.summary}</p>
                  {alert.description && (
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {alert.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <StopDepartures />
      </div>
    </div>
  );
}
