"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "@/lib/validations";
import type { ActionState } from "@/types";

export async function saveBudgetAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = budgetSchema.safeParse({
      id: formData.get("id"),
      amount: formData.get("amount"),
      month: formData.get("month"),
      year: formData.get("year"),
      categoryId: formData.get("categoryId")
    });

    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Presupuesto invalido." };
    }

    const category = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, userId: user.id, type: "EXPENSE" }
    });

    if (!category) {
      return { success: false, message: "El presupuesto debe usar una categoria de gasto." };
    }

    const payload = {
      amount: parsed.data.amount,
      month: parsed.data.month,
      year: parsed.data.year,
      categoryId: parsed.data.categoryId
    };

    if (parsed.data.id) {
      const existing = await prisma.budget.findFirst({
        where: { id: parsed.data.id, userId: user.id }
      });

      if (!existing) {
        return { success: false, message: "No se encontro el presupuesto." };
      }

      await prisma.budget.update({
        where: { id: parsed.data.id },
        data: payload
      });
    } else {
      await prisma.budget.create({
        data: {
          ...payload,
          userId: user.id
        }
      });
    }

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return { success: true, message: parsed.data.id ? "Presupuesto actualizado." : "Presupuesto creado." };
  } catch (error) {
    return { success: false, message: "No se pudo guardar el presupuesto." };
  }
}

export async function deleteBudgetAction(id: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    const existing = await prisma.budget.findFirst({
      where: { id, userId: user.id }
    });

    if (!existing) {
      return { success: false, message: "No se encontro el presupuesto." };
    }

    await prisma.budget.delete({ where: { id } });
    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return { success: true, message: "Presupuesto eliminado." };
  } catch (error) {
    return { success: false, message: "No se pudo eliminar el presupuesto." };
  }
}
