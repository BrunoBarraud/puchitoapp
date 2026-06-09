import { Budget, Category } from "@prisma/client";
import { ClientActionForm } from "@/components/ui/client-action-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { saveBudgetAction } from "@/server/actions/budget-actions";

export function BudgetForm({ budget, categories, month, year }: { budget?: Budget | null; categories: Category[]; month: number; year: number }) {
  return (
    <Card>
      <h2 className="text-xl font-bold">{budget ? "Editar presupuesto" : "Nuevo presupuesto"}</h2>
      <ClientActionForm action={saveBudgetAction} className="mt-5 space-y-4">
        <input type="hidden" name="id" defaultValue={budget?.id} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Monto">
            <Input name="amount" type="number" step="0.01" defaultValue={Number(budget?.amount ?? 0) || ""} required />
          </Field>
          <Field label="Categoria">
            <Select name="categoryId" defaultValue={budget?.categoryId ?? categories[0]?.id}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Mes">
            <Input name="month" type="number" min="1" max="12" defaultValue={budget?.month ?? month} required />
          </Field>
          <Field label="Anio">
            <Input name="year" type="number" min="2000" max="2100" defaultValue={budget?.year ?? year} required />
          </Field>
        </div>
        <Button pendingLabel="Guardando presupuesto...">{budget ? "Actualizar presupuesto" : "Crear presupuesto"}</Button>
      </ClientActionForm>
    </Card>
  );
}
