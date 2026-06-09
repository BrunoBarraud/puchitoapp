"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { BadgeDollarSign, ChartColumnBig, CircleDollarSign, CreditCard, LayoutDashboard, Settings2, Tags } from "lucide-react";

const links: Array<{
  href: Route;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
}> = [
  { href: "/dashboard", label: "Inicio", shortLabel: "Inicio", icon: LayoutDashboard },
  { href: "/transactions", label: "Movimientos", shortLabel: "Mov.", icon: CircleDollarSign },
  { href: "/categories", label: "Categorías", shortLabel: "Cat.", icon: Tags },
  { href: "/budgets", label: "Presupuestos", shortLabel: "Pres.", icon: BadgeDollarSign },
  { href: "/installments", label: "Cuotas", shortLabel: "Cuotas", icon: CreditCard },
  { href: "/reports", label: "Reportes", shortLabel: "Rep.", icon: ChartColumnBig },
  { href: "/settings", label: "Configuración", shortLabel: "Conf.", icon: Settings2 }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-2 bottom-2 z-50 rounded-[1.5rem] border border-[#eadfcb] bg-[#fffaf4]/95 p-1.5 shadow-[0_18px_35px_-24px_rgba(58,38,18,0.38)] backdrop-blur sm:inset-x-3 sm:bottom-3 sm:rounded-[2rem] sm:p-2 lg:hidden">
      <div className="grid grid-cols-7 gap-1">
        {links.map(({ href, label, shortLabel, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className={`flex h-11 min-w-0 flex-col items-center justify-center rounded-2xl px-1 text-[9px] font-semibold transition sm:h-12 sm:text-[10px] ${
                active ? "bg-stone-900 text-brand-100 shadow-sm" : "text-stone-600"
              }`}
            >
              <Icon className={`h-4 w-4 sm:mb-1 ${active ? "text-brand-100" : "text-stone-500"}`} />
              <span className="hidden max-w-full truncate sm:block">{shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
