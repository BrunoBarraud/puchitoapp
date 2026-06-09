import { Logo } from "@/components/ui/logo";

export function Topbar() {
  return (
    <header className="rounded-[2rem] border border-[#eee3cf] bg-[#fffaf2]/95 p-4 shadow-[0_18px_40px_-28px_rgba(58,38,18,0.35)] backdrop-blur sm:p-5">
      <div className="rounded-[1.75rem] border border-[#e2c88e] bg-gradient-to-r from-[#fff8ea] via-[#f1dcad] to-[#e5c680] p-4 sm:p-5">
        <Logo />
      </div>
    </header>
  );
}
