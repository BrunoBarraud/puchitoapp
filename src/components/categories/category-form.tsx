import { Category } from "@prisma/client";
import { ClientActionForm } from "@/components/ui/client-action-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { saveCategoryAction } from "@/server/actions/category-actions";

export function CategoryForm({ category }: { category?: Category | null }) {
  return (
    <Card>
      <h2 className="text-xl font-bold">{category ? "Editar categoria" : "Nueva categoria"}</h2>
      <ClientActionForm action={saveCategoryAction} className="mt-5 space-y-4">
        <input type="hidden" name="id" defaultValue={category?.id} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <Input name="name" defaultValue={category?.name} required />
          </Field>
          <Field label="Tipo">
            <Select name="type" defaultValue={category?.type ?? "EXPENSE"}>
              <option value="EXPENSE">Gasto</option>
              <option value="INCOME">Ingreso</option>
            </Select>
          </Field>
          <Field label="Color">
            <Input name="color" type="color" defaultValue={category?.color ?? "#946f31"} />
          </Field>
          <Field label="Icono">
            <Input name="icon" defaultValue={category?.icon ?? ""} placeholder="Wallet, Bus, Gift..." />
          </Field>
        </div>
        <Button pendingLabel="Guardando categoria...">{category ? "Actualizar categoria" : "Crear categoria"}</Button>
      </ClientActionForm>
    </Card>
  );
}
