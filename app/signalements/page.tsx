import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listSignalements } from "@/app/actions/signalements";
import { SignalementsClient } from "./signalements-client";

export default async function SignalementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const initialSignalements = await listSignalements();

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Signalements</h1>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Signalez un problème de voirie ou de transport en commun, et confirmez ceux
          qui vous concernent aussi.
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <SignalementsClient initialSignalements={initialSignalements} />
      </div>
    </div>
  );
}
