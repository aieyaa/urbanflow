"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { logout } from "@/app/actions/auth";

const mainLinks = [{ href: "/", label: "Accueil" }];

const accountLinks = [
  { href: "/preferences", label: "Préférences" },
  { href: "/bilan-carbone", label: "Bilan carbone" },
];

const dispo = [
  { href: "/velos", label: "Vélos" },
  { href: "/parkings", label: "Parkings" },
  { href: "/covoiturage", label: "Covoiturage" },
];


function NavDropdown({
  label,
  links,
  onNavigate,
}: {
  label: string;
  links: { href: string; label: string }[];
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.08]"
      >
        {label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-10 mt-2 min-w-40 rounded-xl border border-black/[.08] bg-background p-1 shadow-lg dark:border-white/[.145]"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.08]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AccountDropdown({
  user,
  onNavigate,
}: {
  user: User;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative ml-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1 rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
      >
        Mon compte
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-2 min-w-44 rounded-xl border border-black/[.08] bg-background p-1 shadow-lg dark:border-white/[.145]"
        >
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 ml-3">
            <span className="font-medium">{user.email}</span>
          </p>
          {accountLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.08]"
            >
              {link.label}
            </Link>
          ))}
          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.08]"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export function Navbar({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex">
        {mainLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.08]"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/itineraire"
          className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.08]"
        >
          Itinéraire
        </Link>
        <Link
          href="/horaires"
          className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.08]"
        >
          Horaires
        </Link>
        <NavDropdown label="Disponibilités" links={dispo} />
        {user ? (
          <AccountDropdown user={user} />
        ) : (
          <div className="ml-2 flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Créer un compte
            </Link>
          </div>
        )}
      </nav>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Ouvrir le menu"
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/[.04] md:hidden dark:hover:bg-white/[.08]"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          {open ? (
            <path d="M5 5l10 10M15 5L5 15" />
          ) : (
            <path d="M3 5h14M3 10h14M3 15h14" />
          )}
        </svg>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full flex flex-col gap-1 border-t border-black/[.08] bg-background p-4 md:hidden dark:border-white/[.145]">
          {[
            ...mainLinks,
            { href: "/itineraire", label: "Itinéraire" },
            { href: "/horaires", label: "Horaires" },
            ...dispo,
          ].map(
            (link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.08]"
              >
                {link.label}
              </Link>
            )
          )}
          {user ? (
            <>
              <div className="my-1 border-t border-black/[.08] dark:border-white/[.145]" />
              {accountLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.08]"
                >
                  {link.label}
                </Link>
              ))}
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.08]"
                >
                  Se déconnecter
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="my-1 border-t border-black/[.08] dark:border-white/[.145]" />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.08]"
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.08]"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>
      ) : null}
    </>
  );
}
