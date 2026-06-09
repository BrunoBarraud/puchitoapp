import { Card } from "@/components/ui/card";

export function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="h-1.5" style={{ backgroundColor: accent }} />
      <div className="p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</p>
        <p className="mt-3 text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">{value}</p>
      </div>
    </Card>
  );
}
