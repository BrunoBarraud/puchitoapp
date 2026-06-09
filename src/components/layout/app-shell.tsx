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
    <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 p-3 sm:p-4 lg:gap-6 lg:p-6">
      <Sidebar pathname={pathname} />
      <main className="flex-1 space-y-6 pb-24 lg:pb-6">
        <Topbar />
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-white/80 p-5 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-700">Control de gastos personales</p>
            <h1 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">{title}</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="max-w-full rounded-2xl bg-stone-100 px-4 py-2 text-sm text-stone-700 break-all">{email}</div>
            <form action={logoutAction}>
              <Button className="w-full bg-stone-900 hover:bg-stone-700 sm:w-auto">Cerrar sesion</Button>
            </form>
          </div>
        </section>
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
