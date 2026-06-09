import { Logo } from "@/components/ui/logo";

export function Topbar() {
  return (
    <header className="rounded-[1.5rem] border border-[#eee3cf] bg-[#fffaf2]/95 p-2.5 shadow-[0_18px_40px_-28px_rgba(58,38,18,0.35)] backdrop-blur sm:rounded-[2rem] sm:p-5">
      <div className="rounded-[1.25rem] border border-[#e2c88e] bg-[#f6eddc] p-3 sm:rounded-[1.75rem] sm:p-5">
        <Logo clean />
      </div>
    </header>
  );
}
