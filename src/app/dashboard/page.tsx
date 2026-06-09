import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate, getMonthLabel } from "@/lib/formatters";
import { parseMonthYear } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/server/queries/dashboard";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const { month, year } = parseMonthYear(params);
  const data = await getDashboardData(user.id, month, year);

  return (
    <AppShell pathname="/dashboard" email={user.email} title="Resumen">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Balance del mes" value={formatCurrency(data.balance)} accent="#7d5928" />
        <MetricCard label="Ingresos" value={formatCurrency(data.income)} accent="#16a34a" />
        <MetricCard label="Gastos" value={formatCurrency(data.expense)} accent="#dc2626" />
        <MetricCard label="Movimientos" value={String(data.totalTransactions)} accent="#0284c7" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Últimos movimientos</h2>
              <p className="text-sm text-stone-500">{getMonthLabel(month, year)}</p>
            </div>
            <form className="grid grid-cols-3 gap-2">
              <input name="month" type="number" min="1" max="12" defaultValue={month} className="w-20 rounded-xl border px-3 py-2 text-sm" />
              <input name="year" type="number" min="2000" max="2100" defaultValue={year} className="w-24 rounded-xl border px-3 py-2 text-sm" />
              <button className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white">Ver</button>
            </form>
          </div>
          <div className="mt-5 space-y-3">
            {data.latestTransactions.length === 0 ? (
              <p className="text-sm text-stone-500">Todavia no hay movimientos para este mes.</p>
            ) : (
              data.latestTransactions.map((transaction) => (
                <div key={transaction.id} className="flex flex-col gap-3 rounded-2xl bg-stone-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{transaction.title}</p>
                    <p className="text-sm text-stone-500">
                      {transaction.category.name} - {formatDate(transaction.date)}
                    </p>
                  </div>
                  <p className={transaction.type === "INCOME" ? "font-bold text-emerald-600 sm:text-right" : "font-bold text-rose-600 sm:text-right"}>
                    {transaction.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(Number(transaction.amount))}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-bold">Gasto por categoria</h2>
          <div className="mt-5 space-y-4">
            {data.expenseByCategory.length === 0 ? (
              <p className="text-sm text-stone-500">No se usaron categorias de gasto este mes.</p>
            ) : (
              data.expenseByCategory.map((item) => (
                <div key={item.categoryId}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold">{item.name}</span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-stone-100">
                    <div className="h-3 rounded-full" style={{ width: `${Math.min((item.total / Math.max(data.expense, 1)) * 100, 100)}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
