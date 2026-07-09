import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-black/[.08] px-6 dark:border-white/[.145]">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        UrbanFlow
      </Link>
      <Navbar user={user} />
    </header>
  );
}
