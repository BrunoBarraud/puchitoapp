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
        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-700">Balance anual</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-stone-900">{report.annualSummary.year}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold text-emerald-700">Ingresos</p>
              <p className="mt-1 text-lg font-black text-stone-900">{formatCurrency(report.annualSummary.incomeTotal)}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 px-4 py-3">
              <p className="text-xs font-semibold text-rose-700">Gastos</p>
              <p className="mt-1 text-lg font-black text-stone-900">{formatCurrency(report.annualSummary.expenseTotal)}</p>
            </div>
            <div className="rounded-2xl bg-brand-50 px-4 py-3">
              <p className="text-xs font-semibold text-brand-700">Balance</p>
              <p className="mt-1 text-lg font-black text-stone-900">{formatCurrency(report.annualSummary.balance)}</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {report.annualSummary.months.map((month) => (
              <div key={month.monthNumber} className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm sm:grid-cols-[1fr_auto_auto_auto]">
                <span className="font-semibold text-stone-900">{month.month}</span>
                <span className="text-emerald-700">{formatCurrency(month.income)}</span>
                <span className="text-rose-700">{formatCurrency(month.expense)}</span>
                <span className="font-bold text-stone-900">{formatCurrency(month.balance)}</span>
              </div>
            ))}
          </div>
        </Card>
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
        <Card>
          <h2 className="text-xl font-bold">ResÃºmenes archivados</h2>
          <div className="mt-5 space-y-4">
            {report.yearlySummaries.map((summary) => (
              <div key={summary.id} className="rounded-2xl border border-stone-200 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-stone-900">{summary.year}</span>
                  <span className="font-black text-stone-900">{formatCurrency(Number(summary.balance))}</span>
                </div>
                <p className="mt-1 text-sm text-stone-500">
                  Ingresos {formatCurrency(Number(summary.incomeTotal))} - gastos {formatCurrency(Number(summary.expenseTotal))}
                </p>
              </div>
            ))}
            {report.yearlySummaries.length === 0 ? <p className="text-sm text-stone-500">Todavía no hay cierres anuales archivados.</p> : null}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
