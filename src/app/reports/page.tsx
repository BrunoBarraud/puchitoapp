import { AppShell } from "@/components/layout/app-shell";
import { BalanceLineChart, CategoryExpenseChart, MonthlyComparisonChart } from "@/components/reports/chart-card";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { requireUser } from "@/lib/auth";
import { getReportData } from "@/server/queries/dashboard";

export default async function ReportsPage() {
  const user = await requireUser();
  const report = await getReportData(user.id);

  return (
    <AppShell pathname="/reports" email={user.email} title="Reportes">
      <div className="grid gap-6 xl:grid-cols-2">
        <MonthlyComparisonChart data={report.monthly} />
        <CategoryExpenseChart data={report.categoryTotals} />
        <BalanceLineChart data={report.monthly} />
        <Card>
          <h2 className="text-xl font-bold">Top 5 categorías con más gasto</h2>
          <div className="mt-5 space-y-4">
            {report.topCategories.map((category, index) => (
              <div key={category.name} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">{index + 1}</span>
                  <span className="min-w-0 truncate font-semibold">{category.name}</span>
                </div>
                <span className="shrink-0 font-bold">{formatCurrency(category.total)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
