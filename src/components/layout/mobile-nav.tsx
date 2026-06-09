"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const links: Array<{ href: Route; label: string }> = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/transactions", label: "Movs." },
  { href: "/categories", label: "Cat." },
  { href: "/budgets", label: "Presu." },
  { href: "/reports", label: "Grafs." },
  { href: "/settings", label: "Config." }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 rounded-3xl border border-white/70 bg-white/95 p-2 shadow-soft backdrop-blur lg:hidden">
      <div className="grid grid-cols-6 gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-2xl px-2 py-3 text-center text-xs font-semibold ${
              pathname === link.href ? "bg-brand-700 text-white" : "text-stone-600"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
