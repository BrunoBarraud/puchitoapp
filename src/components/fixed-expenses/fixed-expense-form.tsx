import { Category, FixedExpense } from "@prisma/client";
import { ClientActionForm } from "@/components/ui/client-action-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveFixedExpenseAction } from "@/server/actions/fixed-expense-actions";

export function FixedExpenseForm({
  categories,
  fixedExpense,
  month,
  year
}: {
  categories: Category[];
  fixedExpense?: FixedExpense | null;
  month: number;
  year: number;
}) {
  return (
    <Card>
      <h2 className="text-xl font-bold">{fixedExpense ? "Editar gasto fijo" : "Nuevo gasto fijo"}</h2>
      <ClientActionForm action={saveFixedExpenseAction} className="mt-5 space-y-4">
        <input type="hidden" name="id" defaultValue={fixedExpense?.id} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <Input name="title" defaultValue={fixedExpense?.title} placeholder="Spotify, YouTube, Disney..." required />
          </Field>
          <Field label="Monto mensual">
            <Input name="amount" type="number" step="0.01" defaultValue={Number(fixedExpense?.amount ?? 0) || ""} required />
          </Field>
          <Field label="Categoria">
            <Select name="categoryId" defaultValue={fixedExpense?.categoryId ?? categories[0]?.id} required>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Dia de cobro">
            <Input name="dayOfMonth" type="number" min="1" max="31" defaultValue={fixedExpense?.dayOfMonth ?? 1} required />
          </Field>
          <Field label="Mes de inicio">
            <Input name="startMonth" type="number" min="1" max="12" defaultValue={fixedExpense?.startMonth ?? month} required />
          </Field>
          <Field label="Anio de inicio">
            <Input name="startYear" type="number" min="2000" max="2100" defaultValue={fixedExpense?.startYear ?? year} required />
          </Field>
          <Field label="Mes de fin">
            <Input name="endMonth" type="number" min="1" max="12" defaultValue={fixedExpense?.endMonth ?? ""} />
          </Field>
          <Field label="Anio de fin">
            <Input name="endYear" type="number" min="2000" max="2100" defaultValue={fixedExpense?.endYear ?? ""} />
          </Field>
        </div>
        <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <input name="active" type="checkbox" defaultChecked={fixedExpense?.active ?? true} className="mt-1 h-4 w-4 rounded border-stone-300" />
          <span>
            <span className="block font-semibold text-stone-900">Activo</span>
            <span className="block text-sm text-stone-600">Si esta activo se descuenta automaticamente en cada mes dentro del rango.</span>
          </span>
        </label>
        <Field label="Notas">
          <Textarea name="notes" defaultValue={fixedExpense?.notes ?? ""} placeholder="Notas opcionales" />
        </Field>
        <Button pendingLabel="Guardando gasto fijo...">{fixedExpense ? "Actualizar gasto fijo" : "Crear gasto fijo"}</Button>
      </ClientActionForm>
    </Card>
  );
}
