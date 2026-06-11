import { AppShell } from "@/components/layout/app-shell";
import { FixedExpenseForm } from "@/components/fixed-expenses/fixed-expense-form";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { parseMonthYear } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFixedExpenseAction } from "@/server/actions/fixed-expense-actions";

function isActiveInMonth(item: { startMonth: number; startYear: number; endMonth: number | null; endYear: number | null; active: boolean }, month: number, year: number) {
  if (!item.active) {
    return false;
  }

  const current = year * 12 + month;
  const start = item.startYear * 12 + item.startMonth;
  const end = item.endYear && item.endMonth ? item.endYear * 12 + item.endMonth : Number.POSITIVE_INFINITY;

  return current >= start && current <= end;
}

export default async function FixedExpensesPage({
  searchParams
}: {
  searchParams: Promise<{ month?: string; year?: string; editId?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const { month, year } = parseMonthYear(params);
  const categories = await prisma.category.findMany({ where: { userId: user.id, type: "EXPENSE" }, orderBy: { name: "asc" } });
  const fixedExpenseToEdit = params.editId ? await prisma.fixedExpense.findFirst({ where: { id: params.editId, userId: user.id } }) : null;
  const fixedExpenses = await prisma.fixedExpense.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: [{ active: "desc" }, { title: "asc" }]
  });
  const monthlyTotal = fixedExpenses
    .filter((item) => isActiveInMonth(item, month, year))
    .reduce((total, item) => total + Number(item.amount), 0);

  async function deleteFixedExpense(formData: FormData) {
    "use server";
    const id = formData.get("id");
    if (typeof id === "string") {
      await deleteFixedExpenseAction(id);
    }
  }

  return (
    <AppShell pathname="/fixed-expenses" email={user.email} title="Gastos fijos">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <FixedExpenseForm categories={categories} fixedExpense={fixedExpenseToEdit} month={month} year={year} />
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-700">Recurrentes</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-stone-900">Gastos fijos</h2>
              <p className="mt-1 text-sm text-stone-500">Total del mes: {formatCurrency(monthlyTotal)}</p>
            </div>
            <form className="grid w-full grid-cols-[0.8fr_1fr_0.9fr] gap-2 md:w-auto">
              <input name="month" type="number" min="1" max="12" defaultValue={month} className="min-w-0 rounded-xl border px-3 py-2 text-sm" />
              <input name="year" type="number" min="2000" max="2100" defaultValue={year} className="min-w-0 rounded-xl border px-3 py-2 text-sm" />
              <button className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white">Ver</button>
            </form>
          </div>
          <div className="mt-5 space-y-4">
            {fixedExpenses.map((item) => {
              const activeThisMonth = isActiveInMonth(item, month, year);

              return (
                <div key={item.id} className="rounded-2xl border border-stone-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-stone-900">{item.title}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        {item.category.name} - dia {item.dayOfMonth}
                      </p>
                      <p className="mt-1 text-xs text-stone-400">
                        Desde {item.startMonth}/{item.startYear}
                        {item.endMonth && item.endYear ? ` hasta ${item.endMonth}/${item.endYear}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-black text-rose-600">{formatCurrency(Number(item.amount))}</p>
                      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${activeThisMonth ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                        {activeThisMonth ? "Cuenta este mes" : "Fuera del mes"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={`/fixed-expenses?editId=${item.id}&month=${month}&year=${year}`} className="rounded-xl border px-3 py-1.5 text-xs font-semibold">
                      Editar
                    </a>
                    <form action={deleteFixedExpense}>
                      <input type="hidden" name="id" value={item.id} />
                      <button className="rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700">Eliminar</button>
                    </form>
                  </div>
                </div>
              );
            })}
            {fixedExpenses.length === 0 ? <p className="text-sm text-stone-500">Todavia no hay gastos fijos cargados.</p> : null}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
