"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import type { ActionState } from "@/types";

export async function saveCategoryAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = categorySchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      type: formData.get("type"),
      color: formData.get("color"),
      icon: formData.get("icon")
    });

    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Categoria invalida." };
    }

    const payload = {
      name: parsed.data.name,
      type: parsed.data.type,
      color: parsed.data.color || null,
      icon: parsed.data.icon || null
    };

    if (parsed.data.id) {
      const existing = await prisma.category.findFirst({
        where: { id: parsed.data.id, userId: user.id }
      });

      if (!existing) {
        return { success: false, message: "No se encontro la categoria." };
      }

      await prisma.category.update({
        where: { id: parsed.data.id },
        data: payload
      });
    } else {
      await prisma.category.create({
        data: {
          ...payload,
          userId: user.id
        }
      });
    }

    revalidatePath("/categories");
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/budgets");
    revalidatePath("/reports");

    return { success: true, message: parsed.data.id ? "Categoria actualizada." : "Categoria creada." };
  } catch (error) {
    return { success: false, message: "No se pudo guardar la categoria." };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    const existing = await prisma.category.findFirst({
      where: { id, userId: user.id },
      include: {
        transactions: { take: 1 },
        budgets: { take: 1 }
      }
    });

    if (!existing) {
      return { success: false, message: "No se encontro la categoria." };
    }

    if (existing.transactions.length > 0 || existing.budgets.length > 0) {
      return {
        success: false,
        message: "Esta categoria esta siendo usada por movimientos o presupuestos."
      };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/categories");
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/budgets");
    revalidatePath("/reports");

    return { success: true, message: "Categoria eliminada." };
  } catch (error) {
    return { success: false, message: "No se pudo eliminar la categoria." };
  }
}
