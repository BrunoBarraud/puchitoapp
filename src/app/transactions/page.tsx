import { AppShell } from "@/components/layout/app-shell";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { parseMonthYear } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionSearchWhere } from "@/server/queries/dashboard";
import { deleteTransactionAction } from "@/server/actions/transaction-actions";

export default async function TransactionsPage({
  searchParams
}: {
  searchParams: Promise<{ month?: string; year?: string; type?: string; categoryId?: string; query?: string; editId?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const { month, year } = parseMonthYear(params);
  const categories = await prisma.category.findMany({ where: { userId: user.id }, orderBy: [{ type: "asc" }, { name: "asc" }] });
  const transactionToEdit = params.editId
    ? await prisma.transaction.findFirst({ where: { id: params.editId, userId: user.id }, include: { installmentPlan: true } })
    : null;
  const transactions = await prisma.transaction.findMany({
    where: transactionSearchWhere(user.id, {
      month,
      year,
      type: params.type,
      categoryId: params.categoryId,
      query: params.query
    }),
    include: {
      category: true,
      installmentPlan: true
    },
    orderBy: { date: "desc" }
  });

  async function deleteTransaction(formData: FormData) {
    "use server";
    const id = formData.get("id");
    if (typeof id === "string") {
      await deleteTransactionAction(id);
    }
  }

  return (
    <AppShell pathname="/transactions" email={user.email} title="Movimientos">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <TransactionForm categories={categories} transaction={transactionToEdit} />
        <Card>
          <div className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-700">Consulta mensual</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-stone-900">Consulta de movimientos</h2>
            <p className="mt-1 text-sm text-stone-500">Filtrá los ingresos y gastos registrados para un mes específico.</p>
          </div>
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(180px,1.4fr)_minmax(130px,0.8fr)_minmax(160px,1fr)_86px_112px_110px]">
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-stone-500">Buscar</span>
              <input name="query" placeholder="Buscar por título" defaultValue={params.query ?? ""} className="min-w-0 rounded-2xl border px-4 py-2.5 text-sm" />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-stone-500">Tipo</span>
              <select name="type" defaultValue={params.type ?? ""} className="min-w-0 rounded-2xl border px-4 py-2.5 text-sm">
                <option value="">Todos</option>
                <option value="INCOME">Ingreso</option>
                <option value="EXPENSE">Gasto</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-stone-500">Categoría</span>
              <select name="categoryId" defaultValue={params.categoryId ?? ""} className="min-w-0 rounded-2xl border px-4 py-2.5 text-sm">
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-stone-500">Mes</span>
              <input name="month" type="number" min="1" max="12" defaultValue={month} className="min-w-0 rounded-2xl border px-4 py-2.5 text-sm" />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-stone-500">Año</span>
              <input name="year" type="number" min="2000" max="2100" defaultValue={year} className="min-w-0 rounded-2xl border px-4 py-2.5 text-sm" />
            </label>
            <div className="flex items-end">
              <button className="h-[42px] w-full rounded-2xl bg-stone-900 px-4 text-sm font-semibold text-white">Filtrar</button>
            </div>
          </form>
          <div className="mt-5 space-y-3 md:hidden">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="rounded-2xl border border-[#eadfcb] bg-white px-4 py-4 shadow-[0_12px_28px_-24px_rgba(58,38,18,0.35)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-stone-900">{transaction.title}</p>
                    <p className="mt-1 text-sm text-stone-500">{transaction.category.name}</p>
                    <p className="mt-1 text-xs text-stone-400">{formatDate(transaction.date)}</p>
                    {transaction.installmentPlan ? (
                      <span className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {transaction.installmentPlan.installmentCount} cuotas
                      </span>
                    ) : null}
                  </div>
                  <p className={`shrink-0 whitespace-nowrap text-right text-base font-black ${transaction.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                    {transaction.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(Number(transaction.amount))}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`/transactions?editId=${transaction.id}&month=${month}&year=${year}`}
                    className="rounded-xl border px-3 py-1.5 text-xs font-semibold"
                  >
                    Editar
                  </a>
                  <form action={deleteTransaction}>
                    <input type="hidden" name="id" value={transaction.id} />
                    <button className="rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700">Eliminar</button>
                  </form>
                </div>
              </div>
            ))}
            {transactions.length === 0 ? <p className="pt-2 text-sm text-stone-500">No se encontraron movimientos.</p> : null}
          </div>

          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="min-w-[680px] text-left text-sm">
              <thead className="text-stone-500">
                <tr>
                  <th className="pb-3">Título</th>
                  <th className="pb-3">Categoría</th>
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Monto</th>
                  <th className="pb-3">Cuotas</th>
                  <th className="pb-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t">
                    <td className="py-3 font-semibold">{transaction.title}</td>
                    <td className="py-3">{transaction.category.name}</td>
                    <td className="py-3">{formatDate(transaction.date)}</td>
                    <td className={`py-3 font-bold ${transaction.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                      {formatCurrency(Number(transaction.amount))}
                    </td>
                    <td className="py-3">
                      {transaction.installmentPlan ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          {transaction.installmentPlan.installmentCount} cuotas
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`/transactions?editId=${transaction.id}&month=${month}&year=${year}`}
                          className="rounded-xl border px-3 py-1.5 text-xs font-semibold"
                        >
                          Editar
                        </a>
                        <form action={deleteTransaction}>
                          <input type="hidden" name="id" value={transaction.id} />
                          <button className="rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700">Eliminar</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 ? <p className="pt-6 text-sm text-stone-500">No se encontraron movimientos.</p> : null}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
