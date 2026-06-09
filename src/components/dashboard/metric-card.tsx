import { Card } from "@/components/ui/card";

export function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="h-1" style={{ backgroundColor: accent }} />
      <div className="p-5">
        <p className="text-sm text-stone-500">{label}</p>
        <p className="mt-3 text-3xl font-black tracking-tight text-stone-900">{value}</p>
      </div>
    </Card>
  );
}
