import { Logo } from "@/components/ui/logo";

export function Topbar() {
  return (
    <header className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur sm:p-6">
      <div className="rounded-[1.75rem] border border-brand-200/70 bg-gradient-to-r from-[#fffaf0] via-[#f4e3bf] to-[#e8d09a] p-5 sm:p-6">
        <Logo />
      </div>
    </header>
  );
}
