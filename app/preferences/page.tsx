import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listFavoriteStops } from "@/app/actions/favorites";
import { PreferencesForm } from "./preferences-form";
import { NotificationSettings } from "./notification-settings";

export default async function PreferencesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, favoriteStops] = await Promise.all([
    supabase
      .from("profiles")
      .select("transport_modes, optimization_criteria, pmr_accessibility")
      .eq("user_id", user.id)
      .maybeSingle(),
    listFavoriteStops(),
  ]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-12 px-6 py-16">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold">Mes préférences de mobilité</h1>
          <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
            Adaptez vos itinéraires à vos besoins.
          </p>
        </div>
        <PreferencesForm
          initialTransportModes={profile?.transport_modes ?? []}
          initialOptimizationCriteria={profile?.optimization_criteria ?? "fastest"}
          initialPmrAccessibility={profile?.pmr_accessibility ?? false}
        />
      </div>

      <NotificationSettings initialFavoriteStops={favoriteStops} />
    </div>
  );
}
