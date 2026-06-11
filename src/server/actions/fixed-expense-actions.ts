"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fixedExpenseSchema } from "@/lib/validations";
import type { ActionState } from "@/types";

function normalizeNotes(notes?: string) {
  return notes?.trim() ? notes.trim() : null;
}

export async function saveFixedExpenseAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = fixedExpenseSchema.safeParse({
      id: formData.get("id"),
      title: formData.get("title"),
      amount: formData.get("amount"),
      categoryId: formData.get("categoryId"),
      dayOfMonth: formData.get("dayOfMonth"),
      startMonth: formData.get("startMonth"),
      startYear: formData.get("startYear"),
      endMonth: formData.get("endMonth"),
      endYear: formData.get("endYear"),
      active: formData.get("active"),
      notes: formData.get("notes")
    });

    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Gasto fijo invalido." };
    }

    const category = await prisma.category.findFirst({
      where: {
        id: parsed.data.categoryId,
        userId: user.id,
        type: "EXPENSE"
      }
    });

    if (!category) {
      return { success: false, message: "La categoria no existe para este usuario." };
    }

    const data = {
      title: parsed.data.title,
      amount: parsed.data.amount,
      categoryId: parsed.data.categoryId,
      dayOfMonth: parsed.data.dayOfMonth,
      startMonth: parsed.data.startMonth,
      startYear: parsed.data.startYear,
      endMonth: parsed.data.endMonth ?? null,
      endYear: parsed.data.endYear ?? null,
      active: parsed.data.active,
      notes: normalizeNotes(parsed.data.notes)
    };

    if (parsed.data.id) {
      const existing = await prisma.fixedExpense.findFirst({
        where: { id: parsed.data.id, userId: user.id }
      });

      if (!existing) {
        return { success: false, message: "No se encontro el gasto fijo." };
      }

      await prisma.fixedExpense.update({
        where: { id: parsed.data.id },
        data
      });
    } else {
      await prisma.fixedExpense.create({
        data: {
          ...data,
          userId: user.id
        }
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/fixed-expenses");
    revalidatePath("/budgets");
    revalidatePath("/reports");
    revalidatePath("/settings");

    return { success: true, message: parsed.data.id ? "Gasto fijo actualizado." : "Gasto fijo creado." };
  } catch (error) {
    return { success: false, message: "No se pudo guardar el gasto fijo." };
  }
}

export async function deleteFixedExpenseAction(id: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    const existing = await prisma.fixedExpense.findFirst({
      where: { id, userId: user.id }
    });

    if (!existing) {
      return { success: false, message: "No se encontro el gasto fijo." };
    }

    await prisma.fixedExpense.delete({ where: { id } });

    revalidatePath("/dashboard");
    revalidatePath("/fixed-expenses");
    revalidatePath("/budgets");
    revalidatePath("/reports");
    revalidatePath("/settings");

    return { success: true, message: "Gasto fijo eliminado." };
  } catch (error) {
    return { success: false, message: "No se pudo eliminar el gasto fijo." };
  }
}
