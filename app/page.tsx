import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight">UrbanFlow</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        La mobilité urbaine intelligente pour la métropole de Nantes.
      </p>
      <Link
        href="/itineraire"
        className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Planifier un itinéraire
      </Link>
      {user ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Connecté en tant que <span className="font-medium">{user.email}</span>
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/preferences"
              className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Mes préférences
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center rounded-full border border-black/[.08] px-6 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Créer un compte
          </Link>
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-full border border-black/[.08] px-6 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Se connecter
          </Link>
        </div>
      )}
    </div>
  );
}
