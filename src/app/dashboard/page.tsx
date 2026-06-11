import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatCurrencyCompact, formatDate, getMonthLabel } from "@/lib/formatters";
import { parseMonthYear } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/server/queries/dashboard";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
type LatestTransaction = DashboardData["latestTransactions"][number];
type UpcomingInstallment = DashboardData["upcomingInstallments"][number];
type ExpenseByCategoryItem = DashboardData["expenseByCategory"][number];
type FixedExpense = DashboardData["fixedExpenses"][number];

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ month?: string; year?: string; accumulated?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const { month, year } = parseMonthYear(params);
  const showAccumulatedBalance = params.accumulated === "on";
  const data = await getDashboardData(user.id, month, year);
  const mainBalanceLabel = showAccumulatedBalance ? `Acumulado hasta ${getMonthLabel(month, year)}` : "Total disponible";
  const mainBalanceValue = showAccumulatedBalance ? data.accumulatedBalance : data.totalBalance;
  const donationUrl = process.env.NEXT_PUBLIC_MERCADO_PAGO_DONATION_URL;

  return (
    <AppShell pathname="/dashboard" email={user.email} title="Resumen">
      {data.newYearSummary ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">Cierre anual</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-stone-900">Feliz año nuevo</h2>
          <p className="mt-2 text-sm text-stone-700">
            Se guardó el resumen de {data.newYearSummary.year}: ingresos {formatCurrency(Number(data.newYearSummary.incomeTotal))}, gastos{" "}
            {formatCurrency(Number(data.newYearSummary.expenseTotal))} y balance {formatCurrency(Number(data.newYearSummary.balance))}.
          </p>
        </Card>
      ) : null}

      {donationUrl ? (
        <Card className="overflow-hidden border-[#bfe9ff] bg-gradient-to-br from-[#effbff] via-[#fffaf2] to-[#fff2c7]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#00a8e8] text-sm font-black text-white shadow-[0_14px_28px_-18px_rgba(0,120,180,0.8)]">
                MP
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">Colaborá con Puchito</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-stone-900">Si la app te salva unos mangos, convidale un puchito al proyecto.</h2>
                <p className="mt-1 text-sm text-stone-600">Podés mandar una colaboración voluntaria por Mercado Pago. Cero obligación, puro mimo cafetero.</p>
              </div>
            </div>
            <a
              href={donationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-stone-900 px-5 py-3 text-sm font-black text-brand-100 shadow-[0_18px_36px_-22px_rgba(28,22,18,0.9)] transition hover:-translate-y-0.5"
            >
              Colaborar
            </a>
          </div>
        </Card>
      ) : null}

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-6">
        <MetricCard className="col-span-2 xl:col-span-1" label={mainBalanceLabel} value={formatCurrencyCompact(mainBalanceValue)} accent="#7d5928" />
        <MetricCard label="Balance del mes" value={formatCurrencyCompact(data.balance)} accent="#a16207" />
        <MetricCard label="Ingresos" value={formatCurrencyCompact(data.income)} accent="#16a34a" />
        <MetricCard label="Gastos" value={formatCurrencyCompact(data.expense)} accent="#dc2626" />
        <MetricCard label="Gastos fijos" value={formatCurrencyCompact(data.fixedExpense)} accent="#be123c" />
        <MetricCard label="Movimientos" value={String(data.totalTransactions)} accent="#0284c7" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-0">
          <div className="border-b border-[#efe2ca] px-4 py-5 sm:px-5">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-700">Actividad reciente</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-stone-900">Últimos movimientos</h2>
                <p className="mt-1 text-sm text-stone-500">{getMonthLabel(month, year)}</p>
              </div>
              <form className="grid grid-cols-[0.8fr_1fr_0.9fr] gap-2 sm:max-w-md">
                <input
                  name="month"
                  type="number"
                  min="1"
                  max="12"
                  defaultValue={month}
                  className="rounded-2xl border border-[#e6d7bd] bg-white px-3 py-2.5 text-sm shadow-inner"
                />
                <input
                  name="year"
                  type="number"
                  min="2000"
                  max="2100"
                  defaultValue={year}
                  className="rounded-2xl border border-[#e6d7bd] bg-white px-3 py-2.5 text-sm shadow-inner"
                />
                <button className="rounded-2xl bg-stone-900 px-3 py-2.5 text-sm font-semibold text-brand-100">Ver</button>
                <label className="col-span-3 flex items-start gap-2 rounded-2xl bg-[#fff5e7] px-3 py-3 text-sm text-stone-700">
                  <input
                    name="accumulated"
                    type="checkbox"
                    defaultChecked={showAccumulatedBalance}
                    className="mt-0.5 size-4 rounded border-[#d9c7a8] text-brand-700"
                  />
                  <span>
                    Ver saldo acumulado hasta este mes, sin usar el disponible actual.
                  </span>
                </label>
              </form>
            </div>
          </div>

          <div className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
            {data.latestTransactions.length === 0 ? (
              <div className="rounded-[1.5rem] bg-[#fff5e7] px-4 py-5 text-sm text-stone-600">
                Todavía no hay movimientos para este mes.
              </div>
            ) : (
              data.latestTransactions.map((transaction: LatestTransaction) => (
                <div key={transaction.id} className="rounded-[1.7rem] border border-[#eee3cf] bg-white px-4 py-4 shadow-[0_12px_28px_-24px_rgba(58,38,18,0.4)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-stone-900">{transaction.title}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        {transaction.category.name} - {formatDate(transaction.date)}
                      </p>
                      {transaction.installmentLabel ? (
                        <span className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          {transaction.installmentLabel}
                        </span>
                      ) : null}
                    </div>
                    <p className={transaction.type === "INCOME" ? "shrink-0 whitespace-nowrap text-right text-base font-black text-emerald-600 sm:text-lg" : "shrink-0 whitespace-nowrap text-right text-base font-black text-rose-600 sm:text-lg"}>
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(Number(transaction.amount))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="grid gap-5">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-700">Distribución</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-stone-900">Gasto por categoría</h2>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {data.expenseByCategory.length === 0 ? (
                <div className="rounded-[1.5rem] bg-[#fff5e7] px-4 py-5 text-sm text-stone-600">
                  No se usaron categorías de gasto este mes.
                </div>
              ) : (
                data.expenseByCategory.map((item: ExpenseByCategoryItem) => (
                  <div key={item.categoryId} className="min-w-0 rounded-[1.5rem] bg-white px-4 py-4 shadow-[0_12px_28px_-24px_rgba(58,38,18,0.35)]">
                    <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-stone-900">{item.name}</span>
                      <span className="font-semibold text-stone-700">{formatCurrency(item.total)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-stone-100">
                      <div className="h-3 rounded-full" style={{ width: `${Math.min((item.total / Math.max(data.expense, 1)) * 100, 100)}%`, backgroundColor: item.color }} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#fff7eb] px-3 py-2 text-xs">
                      <span className="font-semibold uppercase tracking-[0.18em] text-brand-700">Acumulado</span>
                      <span className="font-black text-stone-900">{formatCurrency(item.accumulatedTotal)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-700">Recurrentes</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-stone-900">Gastos fijos</h2>
              </div>
              <a href="/fixed-expenses" className="text-sm font-semibold text-brand-700">
                Ver todos
              </a>
            </div>
            <div className="mt-5 space-y-3">
              {data.fixedExpenses.length === 0 ? (
                <div className="rounded-[1.5rem] bg-[#fff5e7] px-4 py-5 text-sm text-stone-600">
                  No hay gastos fijos pagados este mes.
                </div>
              ) : (
                data.fixedExpenses.map((item: FixedExpense) => (
                  <div key={item.id} className="rounded-[1.5rem] bg-white px-4 py-4 shadow-[0_12px_28px_-24px_rgba(58,38,18,0.35)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-stone-900">{item.fixedExpense.title}</p>
                        <p className="mt-1 text-sm text-stone-500">
                          {item.fixedExpense.category.name} - pagado
                        </p>
                      </div>
                      <span className="shrink-0 text-base font-black text-rose-600">{formatCurrency(Number(item.amount))}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-700">Seguimiento</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-stone-900">Próximas cuotas</h2>
              </div>
              <a href="/installments" className="text-sm font-semibold text-brand-700">
                Ver todas
              </a>
            </div>
            <div className="mt-5 space-y-3">
              {data.upcomingInstallments.length === 0 ? (
                <div className="rounded-[1.5rem] bg-[#fff5e7] px-4 py-5 text-sm text-stone-600">
                  No hay cuotas registradas para este mes.
                </div>
              ) : (
                data.upcomingInstallments.map((payment: UpcomingInstallment) => (
                  <div key={payment.id} className="rounded-[1.5rem] bg-white px-4 py-4 shadow-[0_12px_28px_-24px_rgba(58,38,18,0.35)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-stone-900">{payment.plan.transaction.title}</p>
                        <p className="mt-1 text-sm text-stone-500">
                          Cuota {payment.installmentNumber} - vence {formatDate(payment.dueDate)}
                        </p>
                      </div>
                      <span className="text-base font-black text-stone-900">{formatCurrency(Number(payment.amount))}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
