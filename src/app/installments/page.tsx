import { InstallmentStatus } from "@prisma/client";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { requireUser } from "@/lib/auth";
import { toggleInstallmentPaymentAction } from "@/server/actions/transaction-actions";
import { getInstallmentPlans } from "@/server/queries/dashboard";

function statusLabel(status: InstallmentStatus) {
  if (status === "PAID") return "Pagada";
  if (status === "OVERDUE") return "Vencida";
  return "Pendiente";
}

function statusClasses(status: InstallmentStatus) {
  if (status === "PAID") return "bg-emerald-100 text-emerald-700";
  if (status === "OVERDUE") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

export default async function InstallmentsPage() {
  const user = await requireUser();
  const plans = await getInstallmentPlans(user.id);

  async function togglePayment(formData: FormData) {
    "use server";
    const id = formData.get("id");
    if (typeof id === "string") {
      await toggleInstallmentPaymentAction(id);
    }
  }

  return (
    <AppShell pathname="/installments" email={user.email} title="Cuotas">
      <div className="grid gap-6">
        <Card>
          <h2 className="text-xl font-bold">Compras en cuotas</h2>
          <p className="mt-2 text-sm text-stone-600">
            Registrá cuánto te falta pagar, los vencimientos y si cada cuota ya fue abonada o no.
          </p>
        </Card>
        <div className="grid gap-6">
          {plans.map((plan) => {
            const paidCount = plan.payments.filter((payment) => payment.status === "PAID").length;
            const remainingAmount = plan.payments
              .filter((payment) => payment.status !== "PAID")
              .reduce((total, payment) => total + Number(payment.amount), 0);

            return (
              <Card key={plan.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-stone-900">{plan.transaction.title}</h3>
                    <p className="mt-1 text-sm text-stone-500">
                      {plan.category.name} - compra total {formatCurrency(Number(plan.totalAmount))}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-700">
                    {paidCount}/{plan.installmentCount} cuotas pagadas
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-sm text-stone-500">Valor por cuota</p>
                    <p className="mt-2 text-xl font-bold">{formatCurrency(Number(plan.installmentAmount))}</p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-sm text-stone-500">Primer vencimiento</p>
                    <p className="mt-2 text-xl font-bold">{formatDate(plan.firstDueDate)}</p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-sm text-stone-500">Saldo pendiente</p>
                    <p className="mt-2 text-xl font-bold">{formatCurrency(remainingAmount)}</p>
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-[680px] text-left text-sm">
                    <thead className="text-stone-500">
                      <tr>
                        <th className="pb-3">Cuota</th>
                        <th className="pb-3">Monto</th>
                        <th className="pb-3">Vencimiento</th>
                        <th className="pb-3">Estado</th>
                        <th className="pb-3">Pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.payments.map((payment) => (
                        <tr key={payment.id} className="border-t">
                          <td className="py-3 font-semibold">
                            {payment.installmentNumber}/{plan.installmentCount}
                          </td>
                          <td className="py-3">{formatCurrency(Number(payment.amount))}</td>
                          <td className="py-3">{formatDate(payment.dueDate)}</td>
                          <td className="py-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(payment.status)}`}>
                              {statusLabel(payment.status)}
                            </span>
                          </td>
                          <td className="py-3">
                            <form action={togglePayment}>
                              <input type="hidden" name="id" value={payment.id} />
                              <button
                                className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                                  payment.status === "PAID"
                                    ? "bg-stone-200 text-stone-700"
                                    : "bg-brand-700 text-white"
                                }`}
                              >
                                {payment.status === "PAID" ? "Marcar pendiente" : "Marcar pagada"}
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
          {plans.length === 0 ? (
            <Card>
              <p className="text-sm text-stone-500">Todavía no cargaste compras en cuotas.</p>
            </Card>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
