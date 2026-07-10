"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/parkings", label: "Parkings" },
  { href: "/velos", label: "Vélos" },
  { href: "/trottinettes", label: "Trottinettes" },
  { href: "/covoiturage", label: "Covoiturage" },
];

export function MobilityTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 rounded-full border border-black/[.08] p-1 dark:border-white/[.145]">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-foreground text-background"
                : "hover:bg-black/[.04] dark:hover:bg-white/[.08]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
