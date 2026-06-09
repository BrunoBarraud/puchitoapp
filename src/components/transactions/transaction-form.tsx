"use client";

import { useEffect, useState } from "react";
import { Category, InstallmentPlan, Transaction } from "@prisma/client";
import { ClientActionForm } from "@/components/ui/client-action-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { saveTransactionAction } from "@/server/actions/transaction-actions";

export function TransactionForm({
  categories,
  transaction
}: {
  categories: Category[];
  transaction?: (Transaction & { installmentPlan?: InstallmentPlan | null }) | null;
}) {
  const [type, setType] = useState(transaction?.type ?? "EXPENSE");
  const filteredCategories = categories.filter((category) => category.type === type);
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? filteredCategories[0]?.id ?? "");
  const [isInstallment, setIsInstallment] = useState(Boolean(transaction?.installmentPlan));

  useEffect(() => {
    const nextCategory = filteredCategories.find((category) => category.id === categoryId);
    if (!nextCategory) {
      setCategoryId(filteredCategories[0]?.id ?? "");
    }
  }, [filteredCategories, categoryId]);

  useEffect(() => {
    if (type !== "EXPENSE") {
      setIsInstallment(false);
    }
  }, [type]);

  return (
    <Card>
      <h2 className="text-xl font-bold">{transaction ? "Editar movimiento" : "Nuevo movimiento"}</h2>
      <ClientActionForm action={saveTransactionAction} className="mt-5 space-y-4">
        <input type="hidden" name="id" defaultValue={transaction?.id} />
        <input type="hidden" name="isInstallment" value={isInstallment ? "true" : "false"} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Titulo">
            <Input name="title" defaultValue={transaction?.title} placeholder="Supermercado, sueldo..." required />
          </Field>
          <Field label="Monto">
            <Input name="amount" type="number" step="0.01" defaultValue={Number(transaction?.amount ?? 0) || ""} required />
          </Field>
          <Field label="Tipo">
            <Select name="type" value={type} onChange={(event) => setType(event.target.value as "INCOME" | "EXPENSE")}>
              <option value="EXPENSE">Gasto</option>
              <option value="INCOME">Ingreso</option>
            </Select>
          </Field>
          <Field label="Categoria">
            <Select name="categoryId" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha">
            <Input
              name="date"
              type="date"
              defaultValue={transaction ? new Date(transaction.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
              required
            />
          </Field>
        </div>
        {type === "EXPENSE" ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isInstallment}
                onChange={(event) => setIsInstallment(event.target.checked)}
                disabled={Boolean(transaction?.installmentPlan)}
                className="mt-1 h-4 w-4 rounded border-stone-300"
              />
              <span>
                <span className="block font-semibold text-stone-900">Es una compra en cuotas</span>
                <span className="block text-sm text-stone-600">
                  Registra una compra financiada y genera automaticamente cada cuota.
                </span>
              </span>
            </label>
            {isInstallment ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Cantidad de cuotas">
                  <Input
                    name="installmentCount"
                    type="number"
                    min="2"
                    max="60"
                    defaultValue={transaction?.installmentPlan?.installmentCount ?? 2}
                    disabled={Boolean(transaction?.installmentPlan)}
                    required={isInstallment}
                  />
                </Field>
                <Field label="Primer vencimiento">
                  <Input
                    name="firstDueDate"
                    type="date"
                    defaultValue={
                      transaction?.installmentPlan?.firstDueDate
                        ? new Date(transaction.installmentPlan.firstDueDate).toISOString().slice(0, 10)
                        : new Date().toISOString().slice(0, 10)
                    }
                    disabled={Boolean(transaction?.installmentPlan)}
                    required={isInstallment}
                  />
                </Field>
              </div>
            ) : null}
            {transaction?.installmentPlan ? (
              <p className="mt-3 text-sm text-brand-700">
                Esta compra ya tiene un plan de cuotas generado. Los cambios se administran desde la seccion Cuotas.
              </p>
            ) : null}
          </div>
        ) : null}
        <Field label="Notas">
          <Textarea name="notes" defaultValue={transaction?.notes ?? ""} placeholder="Notas opcionales" />
        </Field>
        <Button pendingLabel="Guardando movimiento...">{transaction ? "Actualizar movimiento" : "Crear movimiento"}</Button>
      </ClientActionForm>
    </Card>
  );
}
