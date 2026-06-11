import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({ label, value, accent, className }: { label: string; value: string; accent: string; className?: string }) {
  return (
    <Card className={cn("min-w-0 overflow-hidden p-0", className)}>
      <div className="h-1.5" style={{ backgroundColor: accent }} />
      <div className="min-w-0 p-3 sm:p-5">
        <p className="min-h-[2em] text-[9px] font-semibold uppercase leading-tight tracking-[0.1em] text-stone-500 sm:text-[11px] sm:tracking-[0.18em]">{label}</p>
        <p className="mt-3 min-w-0 whitespace-nowrap text-[clamp(1.1rem,5.1vw,1.875rem)] font-black leading-tight tracking-tight text-stone-900">{value}</p>
      </div>
    </Card>
  );
}
