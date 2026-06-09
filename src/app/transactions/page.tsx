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
    ? await prisma.transaction.findFirst({ where: { id: params.editId, userId: user.id } })
    : null;
  const transactions = await prisma.transaction.findMany({
    where: transactionSearchWhere(user.id, {
      month,
      year,
      type: params.type,
      categoryId: params.categoryId,
      query: params.query
    }),
    include: { category: true },
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
          <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <input name="query" placeholder="Buscar por titulo" defaultValue={params.query ?? ""} className="rounded-2xl border px-4 py-2.5 text-sm sm:col-span-2 xl:col-span-2" />
            <select name="type" defaultValue={params.type ?? ""} className="rounded-2xl border px-4 py-2.5 text-sm">
              <option value="">Todos los tipos</option>
              <option value="INCOME">Ingreso</option>
              <option value="EXPENSE">Gasto</option>
            </select>
            <select name="categoryId" defaultValue={params.categoryId ?? ""} className="rounded-2xl border px-4 py-2.5 text-sm">
              <option value="">Todas las categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input name="month" type="number" min="1" max="12" defaultValue={month} className="rounded-2xl border px-4 py-2.5 text-sm" />
            <input name="year" type="number" min="2000" max="2100" defaultValue={year} className="rounded-2xl border px-4 py-2.5 text-sm" />
            <button className="rounded-2xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white">Filtrar</button>
          </form>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-500">
                <tr>
                  <th className="pb-3">Titulo</th>
                  <th className="pb-3">Categoria</th>
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Monto</th>
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
