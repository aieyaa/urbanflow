import Link from "next/link";

const columns = [
  {
    title: "Mobilité",
    links: [
      { href: "/itineraire", label: "Itinéraire" },
      { href: "/horaires", label: "Horaires" },
      { href: "/parkings", label: "Parkings" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/preferences", label: "Préférences" },
      { href: "/bilan-carbone", label: "Bilan carbone" },
      { href: "/login", label: "Se connecter" },
    ],
  },
  {
    title: "A propos",
    links: [
      { href: "/propos", label: "A propos" },
      { href: "/contact", label: "Contact" },
      { href: "/mentions", label: "Mentions légales" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-black/[.08] px-6 py-10 dark:border-white/[.145]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <p className="text-lg font-semibold tracking-tight">UrbanFlow</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            La métropole de Nantes.
          </p>
        </div>
        <div className="flex gap-12">
          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-2">
              <p className="text-sm font-medium">{column.title}</p>
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-5xl text-xs text-zinc-600 dark:text-zinc-400">
        © {new Date().getFullYear()} UrbanFlow Nantes. Tous droits réservés. <br />
        Eléa
      </p>
    </footer>
  );
}
