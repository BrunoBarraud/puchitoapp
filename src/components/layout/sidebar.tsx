import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { BadgeDollarSign, ChartColumnBig, CircleDollarSign, CreditCard, LayoutDashboard, Repeat2, Settings2, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

const links: Array<{ href: Route; label: string; icon: typeof LayoutDashboard }> = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/transactions", label: "Movimientos", icon: CircleDollarSign },
  { href: "/fixed-expenses", label: "Gastos fijos", icon: Repeat2 },
  { href: "/categories", label: "Categorías", icon: Tags },
  { href: "/budgets", label: "Presupuestos", icon: BadgeDollarSign },
  { href: "/installments", label: "Cuotas", icon: CreditCard },
  { href: "/reports", label: "Reportes", icon: ChartColumnBig },
  { href: "/settings", label: "Configuración", icon: Settings2 }
];

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden w-72 flex-col rounded-[2rem] border border-white/50 bg-[#2f241b] p-6 text-stone-100 shadow-soft lg:flex">
      <div className="mb-8 flex justify-center">
        <div className="rounded-[2.2rem] bg-white/10 p-3 shadow-inner">
          <Image src="/logo-puchito-app.png" alt="Puchito App" width={132} height={132} className="rounded-[1.8rem] object-cover" />
        </div>
      </div>
      <nav className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
              pathname === href ? "bg-brand-400/20 text-white" : "text-stone-300 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-3xl bg-white/10 p-4 text-sm text-stone-200">
        <p className="font-semibold text-white">Los gastos chicos también pegan.</p>
        <p className="mt-1 text-xs leading-relaxed">Registralos antes de que se te vaya el mes en boludeces.</p>
      </div>
    </aside>
  );
}
