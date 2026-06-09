import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { logoutAction } from "@/server/actions/auth-actions";
import { Button } from "@/components/ui/button";

export function AppShell({
  children,
  pathname,
  email,
  title
}: {
  children: React.ReactNode;
  pathname: string;
  email: string;
  title: string;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 px-2 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] sm:p-4 lg:gap-6 lg:p-6">
      <Sidebar pathname={pathname} />
      <main className="min-w-0 flex-1 space-y-4 pb-32 sm:space-y-6 sm:pb-36 lg:pb-6">
        <Topbar />
        <section className="relative overflow-hidden rounded-[1.5rem] border border-[#eadfcb] bg-[#fffaf2]/95 p-4 shadow-[0_18px_40px_-28px_rgba(58,38,18,0.35)] backdrop-blur sm:rounded-[2rem] sm:p-5">
          <div className="absolute inset-x-4 top-0 h-1 rounded-full bg-gradient-to-r from-brand-500 via-brand-700 to-brand-500 sm:inset-x-5" />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-700 sm:text-xs sm:tracking-[0.3em]">Control de gastos personales</p>
              <h1 className="mt-1 truncate text-2xl font-black tracking-tight text-stone-900 sm:text-4xl">{title}</h1>
            </div>
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="max-w-full rounded-2xl bg-white px-3 py-2 text-xs text-stone-700 shadow-inner break-all sm:px-4 sm:text-sm">{email}</div>
              <form action={logoutAction}>
                <Button className="w-full rounded-2xl bg-stone-900 hover:bg-stone-700 sm:w-auto">Cerrar sesión</Button>
              </form>
            </div>
          </div>
        </section>
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
