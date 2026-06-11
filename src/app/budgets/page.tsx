import { Budget, Category } from "@prisma/client";
import { AppShell } from "@/components/layout/app-shell";
import { BudgetForm } from "@/components/budgets/budget-form";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { parseMonthYear } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteBudgetAction } from "@/server/actions/budget-actions";

export default async function BudgetsPage({
  searchParams
}: {
  searchParams: Promise<{ month?: string; year?: string; editId?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const { month, year } = parseMonthYear(params);
  const categories = await prisma.category.findMany({ where: { userId: user.id, type: "EXPENSE" }, orderBy: { name: "asc" } });
  const budgetToEdit = params.editId ? await prisma.budget.findFirst({ where: { id: params.editId, userId: user.id } }) : null;
  const budgets: Array<Budget & { category: Category }> = await prisma.budget.findMany({
    where: { userId: user.id, month, year },
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });
  const expenses = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId: user.id,
      type: "EXPENSE",
      date: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) }
    },
    _sum: { amount: true }
  });
  const fixedExpenses = await prisma.fixedExpense.findMany({
    where: {
      userId: user.id,
      active: true
    }
  });

  async function deleteBudget(formData: FormData) {
    "use server";
    const id = formData.get("id");
    if (typeof id === "string") {
      await deleteBudgetAction(id);
    }
  }

  return (
    <AppShell pathname="/budgets" email={user.email} title="Presupuestos">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <BudgetForm categories={categories} month={month} year={year} budget={budgetToEdit} />
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold">Presupuestos mensuales</h2>
            <form className="grid w-full grid-cols-[0.8fr_1fr_0.9fr] gap-2 md:w-auto">
              <input name="month" type="number" min="1" max="12" defaultValue={month} className="min-w-0 rounded-xl border px-3 py-2 text-sm" />
              <input name="year" type="number" min="2000" max="2100" defaultValue={year} className="min-w-0 rounded-xl border px-3 py-2 text-sm" />
              <button className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white">Ver</button>
            </form>
          </div>
          <div className="mt-5 space-y-4">
            {budgets.map((budget) => {
              const fixedSpent = fixedExpenses
                .filter((item) => {
                  const current = year * 12 + month;
                  const start = item.startYear * 12 + item.startMonth;
                  const end = item.endYear && item.endMonth ? item.endYear * 12 + item.endMonth : Number.POSITIVE_INFINITY;

                  return item.categoryId === budget.categoryId && current >= start && current <= end;
                })
                .reduce((total, item) => total + Number(item.amount), 0);
              const spent = Number(expenses.find((entry) => entry.categoryId === budget.categoryId)?._sum.amount ?? 0) + fixedSpent;
              const total = Number(budget.amount);
              const ratio = total > 0 ? (spent / total) * 100 : 0;
              const over = spent > total;

              return (
                <div key={budget.id} className="rounded-2xl border border-stone-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{budget.category.name}</p>
                      <p className="text-sm text-stone-500">
                        {formatCurrency(spent)} de {formatCurrency(total)}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${over ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {ratio.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-3 h-3 rounded-full bg-stone-100">
                    <div className={`h-3 rounded-full ${over ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(ratio, 100)}%` }} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={`/budgets?editId=${budget.id}&month=${month}&year=${year}`} className="rounded-xl border px-3 py-1.5 text-xs font-semibold">
                      Editar
                    </a>
                    <form action={deleteBudget}>
                      <input type="hidden" name="id" value={budget.id} />
                      <button className="rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700">Eliminar</button>
                    </form>
                  </div>
                </div>
              );
            })}
            {budgets.length === 0 ? <p className="text-sm text-stone-500">No hay presupuestos creados para este mes.</p> : null}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
