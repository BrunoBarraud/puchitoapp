"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fixedExpensePaymentSchema, fixedExpenseSchema } from "@/lib/validations";
import type { ActionState } from "@/types";

function normalizeNotes(notes?: string | null) {
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
      startMonth: formData.get("startMonth") ?? new Date().getMonth() + 1,
      startYear: formData.get("startYear") ?? new Date().getFullYear(),
      endMonth: undefined,
      endYear: undefined,
      active: formData.get("active"),
      notes: formData.get("notes")
    });

    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Gasto fijo inválido." };
    }

    const category = await prisma.category.findFirst({
      where: {
        id: parsed.data.categoryId,
        userId: user.id,
        type: "EXPENSE"
      }
    });

    if (!category) {
      return { success: false, message: "La categoría no existe para este usuario." };
    }

    const data = {
      title: parsed.data.title,
      amount: parsed.data.amount,
      categoryId: parsed.data.categoryId,
      dayOfMonth: parsed.data.dayOfMonth,
      startMonth: parsed.data.startMonth,
      startYear: parsed.data.startYear,
      endMonth: null,
      endYear: null,
      active: parsed.data.active,
      notes: normalizeNotes(parsed.data.notes)
    };

    if (parsed.data.id) {
      const existing = await prisma.fixedExpense.findFirst({
        where: { id: parsed.data.id, userId: user.id }
      });

      if (!existing) {
        return { success: false, message: "No se encontró el gasto fijo." };
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

export async function payFixedExpenseAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = fixedExpensePaymentSchema.safeParse({
      fixedExpenseId: formData.get("fixedExpenseId"),
      month: formData.get("month"),
      year: formData.get("year"),
      amount: formData.get("amount")
    });

    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Pago inválido." };
    }

    const fixedExpense = await prisma.fixedExpense.findFirst({
      where: {
        id: parsed.data.fixedExpenseId,
        userId: user.id,
        active: true
      }
    });

    if (!fixedExpense) {
      return { success: false, message: "No se encontró el gasto fijo." };
    }

    const existingPayment = await prisma.fixedExpensePayment.findUnique({
      where: {
        fixedExpenseId_month_year: {
          fixedExpenseId: fixedExpense.id,
          month: parsed.data.month,
          year: parsed.data.year
        }
      }
    });

    if (existingPayment) {
      return { success: false, message: "Este gasto fijo ya está marcado como pagado este mes." };
    }

    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          title: fixedExpense.title,
          amount: parsed.data.amount,
          type: "EXPENSE",
          categoryId: fixedExpense.categoryId,
          date: new Date(parsed.data.year, parsed.data.month - 1, Math.min(fixedExpense.dayOfMonth, 28)),
          notes: normalizeNotes(fixedExpense.notes),
          userId: user.id
        }
      });

      await tx.fixedExpensePayment.create({
        data: {
          fixedExpenseId: fixedExpense.id,
          month: parsed.data.month,
          year: parsed.data.year,
          amount: parsed.data.amount,
          transactionId: transaction.id,
          userId: user.id
        }
      });

      await tx.fixedExpense.update({
        where: { id: fixedExpense.id },
        data: {
          amount: parsed.data.amount
        }
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/fixed-expenses");
    revalidatePath("/budgets");
    revalidatePath("/reports");
    revalidatePath("/transactions");

    return { success: true, message: "Gasto fijo pagado y registrado como movimiento." };
  } catch (error) {
    return { success: false, message: "No se pudo registrar el pago del gasto fijo." };
  }
}

export async function deleteFixedExpenseAction(id: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    const existing = await prisma.fixedExpense.findFirst({
      where: { id, userId: user.id }
    });

    if (!existing) {
      return { success: false, message: "No se encontró el gasto fijo." };
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
