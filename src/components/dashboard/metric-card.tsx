import { Card } from "@/components/ui/card";

export function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <div className="h-1.5" style={{ backgroundColor: accent }} />
      <div className="min-w-0 p-4 sm:p-5">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500 sm:text-[11px] sm:tracking-[0.18em]">{label}</p>
        <p className="mt-3 min-w-0 break-words text-[clamp(1.25rem,6vw,1.875rem)] font-black leading-tight tracking-tight text-stone-900">{value}</p>
      </div>
    </Card>
  );
}
