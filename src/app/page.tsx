import Link from "next/link";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "@/components/ui/logo";

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#eadfcb] bg-[#fffaf2]/90 shadow-[0_24px_70px_-42px_rgba(58,38,18,0.55)] backdrop-blur">
        <div className="grid min-h-[620px] content-between gap-10 p-6 sm:p-10 lg:p-12">
          <div className="flex justify-center sm:justify-start">
            <div className="rounded-[1.75rem] border border-[#e2c88e] bg-[#f6eddc] p-4 shadow-[0_20px_60px_-46px_rgba(58,38,18,0.8)]">
              <Logo clean />
            </div>
          </div>

          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">Finanzas personales</p>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-stone-950 sm:text-6xl">
              Controlá esos gastos chicos que te funden.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
              Puchito App te ayuda a registrar ingresos, gastos, cuotas y presupuestos sin vueltas.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {user ? (
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-bold text-brand-100 transition hover:bg-stone-700">
                Ir al resumen
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-bold text-brand-100 transition hover:bg-stone-700">
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Link>
                <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d7c39e] bg-white/70 px-5 py-3 text-sm font-bold text-stone-900 transition hover:bg-white">
                  <UserPlus className="h-4 w-4" />
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
