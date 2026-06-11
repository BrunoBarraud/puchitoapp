import { Budget, Category } from "@prisma/client";
import { AppShell } from "@/components/layout/app-shell";
import { BudgetForm } from "@/components/budgets/budget-form";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { parseMonthYear } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteBudgetAction } from "@/server/actions/budget-actions";

type BudgetWithCategory = Budget & { category: Category };

function getBudgetPeriodLabel(month: number, year: number) {
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}

function getBudgetProgress(
  budget: BudgetWithCategory,
  expenses: Array<{ categoryId: string; _sum: { amount: unknown } }>
) {
  const spent = Number(expenses.find((entry) => entry.categoryId === budget.categoryId)?._sum.amount ?? 0);
  const total = Number(budget.amount);
  const ratio = total > 0 ? (spent / total) * 100 : 0;
  const over = spent > total;

  return { spent, total, ratio, over };
}

function BudgetProgressCard({
  budget,
  expenses,
  month,
  year
}: {
  budget: BudgetWithCategory;
  expenses: Array<{ categoryId: string; _sum: { amount: unknown } }>;
  month: number;
  year: number;
}) {
  const { spent, total, ratio, over } = getBudgetProgress(budget, expenses);

  return (
    <div className="rounded-2xl border border-stone-200 p-4">
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
}

async function deleteBudget(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (typeof id === "string") {
    await deleteBudgetAction(id);
  }
}

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
  const budgets: BudgetWithCategory[] = await prisma.budget.findMany({
    where: { userId: user.id, month, year },
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });
  const upcomingBudgets: BudgetWithCategory[] = await prisma.budget.findMany({
    where: {
      userId: user.id,
      OR: [
        { year: { gt: year } },
        {
          year,
          month: { gt: month }
        }
      ]
    },
    include: { category: true },
    orderBy: [{ year: "asc" }, { month: "asc" }, { createdAt: "desc" }],
    take: 6
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
  const upcomingExpenseGroups = await Promise.all(
    upcomingBudgets.map((budget) =>
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId: user.id,
          type: "EXPENSE",
          categoryId: budget.categoryId,
          date: { gte: new Date(budget.year, budget.month - 1, 1), lt: new Date(budget.year, budget.month, 1) }
        },
        _sum: { amount: true }
      })
    )
  );
  const upcomingExpensesByBudgetId = new Map(upcomingBudgets.map((budget, index) => [budget.id, upcomingExpenseGroups[index] ?? []]));

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
            {budgets.map((budget) => (
              <BudgetProgressCard key={budget.id} budget={budget} expenses={expenses} month={month} year={year} />
            ))}
            {budgets.length === 0 ? <p className="text-sm text-stone-500">No hay presupuestos creados para este mes.</p> : null}
          </div>
        </Card>
      </div>
      <Card>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-700">A largo plazo</p>
          <h2 className="text-xl font-bold">Próximos presupuestos</h2>
          <p className="text-sm text-stone-500">Presupuestos de meses futuros para que no se pierdan aunque estés mirando el mes actual.</p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {upcomingBudgets.map((budget) => (
            <div key={budget.id} className="space-y-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{getBudgetPeriodLabel(budget.month, budget.year)}</p>
              <BudgetProgressCard budget={budget} expenses={upcomingExpensesByBudgetId.get(budget.id) ?? []} month={budget.month} year={budget.year} />
            </div>
          ))}
          {upcomingBudgets.length === 0 ? <p className="text-sm text-stone-500">No hay presupuestos futuros cargados.</p> : null}
        </div>
      </Card>
    </AppShell>
  );
}
