"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations";
import type { ActionState } from "@/types";

function normalizeNotes(notes?: string) {
  return notes?.trim() ? notes.trim() : null;
}

export async function saveTransactionAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = transactionSchema.safeParse({
      id: formData.get("id"),
      title: formData.get("title"),
      amount: formData.get("amount"),
      type: formData.get("type"),
      categoryId: formData.get("categoryId"),
      date: formData.get("date"),
      notes: formData.get("notes")
    });

    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Movimiento invalido." };
    }

    const category = await prisma.category.findFirst({
      where: {
        id: parsed.data.categoryId,
        userId: user.id,
        type: parsed.data.type
      }
    });

    if (!category) {
      return { success: false, message: "La categoria no existe para este usuario." };
    }

    if (parsed.data.id) {
      const existing = await prisma.transaction.findFirst({
        where: { id: parsed.data.id, userId: user.id }
      });

      if (!existing) {
        return { success: false, message: "No se encontro el movimiento." };
      }

      await prisma.transaction.update({
        where: { id: parsed.data.id },
        data: {
          title: parsed.data.title,
          amount: parsed.data.amount,
          type: parsed.data.type,
          categoryId: parsed.data.categoryId,
          date: parsed.data.date,
          notes: normalizeNotes(parsed.data.notes)
        }
      });
    } else {
      await prisma.transaction.create({
        data: {
          title: parsed.data.title,
          amount: parsed.data.amount,
          type: parsed.data.type,
          categoryId: parsed.data.categoryId,
          date: parsed.data.date,
          notes: normalizeNotes(parsed.data.notes),
          userId: user.id
        }
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/reports");

    return { success: true, message: parsed.data.id ? "Movimiento actualizado." : "Movimiento creado." };
  } catch (error) {
    return { success: false, message: "No se pudo guardar el movimiento." };
  }
}

export async function deleteTransactionAction(id: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: user.id }
    });

    if (!existing) {
      return { success: false, message: "No se encontro el movimiento." };
    }

    await prisma.transaction.delete({ where: { id } });
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/reports");

    return { success: true, message: "Movimiento eliminado." };
  } catch (error) {
    return { success: false, message: "No se pudo eliminar el movimiento." };
  }
}
