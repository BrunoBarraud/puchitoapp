"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { BadgeDollarSign, ChartColumnBig, CircleDollarSign, CreditCard, LayoutDashboard, Settings2, Tags } from "lucide-react";

const links: Array<{
  href: Route;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/transactions", label: "Movs.", icon: CircleDollarSign },
  { href: "/categories", label: "Cat.", icon: Tags },
  { href: "/budgets", label: "Presu.", icon: BadgeDollarSign },
  { href: "/installments", label: "Cuotas", icon: CreditCard },
  { href: "/reports", label: "Grafs.", icon: ChartColumnBig },
  { href: "/settings", label: "Config.", icon: Settings2 }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 rounded-[2rem] border border-[#eadfcb] bg-[#fffaf4]/95 p-2 shadow-[0_18px_35px_-24px_rgba(58,38,18,0.38)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-7 gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-semibold transition ${
                active ? "bg-stone-900 text-brand-100 shadow-sm" : "text-stone-600"
              }`}
            >
              <Icon className={`mb-1 h-4 w-4 ${active ? "text-brand-100" : "text-stone-500"}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
