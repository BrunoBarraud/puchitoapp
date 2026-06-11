"use server";

import { InstallmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations";
import type { ActionState } from "@/types";

function normalizeNotes(notes?: string) {
  return notes?.trim() ? notes.trim() : null;
}

function addMonths(date: Date, monthsToAdd: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + monthsToAdd);
  return next;
}

function getInstallmentStatus(dueDate: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today ? InstallmentStatus.OVERDUE : InstallmentStatus.PENDING;
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
      notes: formData.get("notes"),
      isInstallment: formData.get("isInstallment"),
      installmentCount: formData.get("installmentCount"),
      firstDueDate: formData.get("firstDueDate")
    });

    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Movimiento inválido." };
    }

    const category = await prisma.category.findFirst({
      where: {
        id: parsed.data.categoryId,
        userId: user.id,
        type: parsed.data.type
      }
    });

    if (!category) {
      return { success: false, message: "La categoría no existe para este usuario." };
    }

    if (parsed.data.id) {
      const existing = await prisma.transaction.findFirst({
        where: { id: parsed.data.id, userId: user.id },
        include: { installmentPlan: true }
      });

      if (!existing) {
        return { success: false, message: "No se encontró el movimiento." };
      }

      if (existing.installmentPlan) {
        return {
          success: false,
          message: "Las compras en cuotas se editan desde la sección de cuotas."
        };
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
      await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
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

        if (parsed.data.isInstallment && parsed.data.type === "EXPENSE" && parsed.data.installmentCount && parsed.data.firstDueDate) {
          const firstDueDate = new Date(parsed.data.firstDueDate);
          const installmentCount = parsed.data.installmentCount;
          const installmentAmount = Number((parsed.data.amount / installmentCount).toFixed(2));

          const plan = await tx.installmentPlan.create({
            data: {
              transactionId: transaction.id,
              totalAmount: parsed.data.amount,
              installmentCount,
              installmentAmount,
              firstDueDate,
              userId: user.id,
              categoryId: parsed.data.categoryId
            }
          });

          await tx.installmentPayment.createMany({
            data: Array.from({ length: installmentCount }, (_, index) => {
              const dueDate = addMonths(firstDueDate, index);
              const isLast = index === installmentCount - 1;
              const amountForRow = isLast
                ? Number((parsed.data.amount - installmentAmount * (installmentCount - 1)).toFixed(2))
                : installmentAmount;

              return {
                planId: plan.id,
                installmentNumber: index + 1,
                amount: amountForRow,
                dueDate,
                status: getInstallmentStatus(dueDate),
                userId: user.id
              };
            })
          });
        }
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/reports");
    revalidatePath("/installments");

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
      return { success: false, message: "No se encontró el movimiento." };
    }

    await prisma.transaction.delete({ where: { id } });
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/reports");
    revalidatePath("/installments");

    return { success: true, message: "Movimiento eliminado." };
  } catch (error) {
    return { success: false, message: "No se pudo eliminar el movimiento." };
  }
}

export async function toggleInstallmentPaymentAction(id: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    const payment = await prisma.installmentPayment.findFirst({
      where: { id, userId: user.id }
    });

    if (!payment) {
      return { success: false, message: "No se encontró la cuota." };
    }

    const nextStatus = payment.status === InstallmentStatus.PAID ? getInstallmentStatus(payment.dueDate) : InstallmentStatus.PAID;

    await prisma.installmentPayment.update({
      where: { id },
      data: {
        status: nextStatus,
        paidAt: nextStatus === InstallmentStatus.PAID ? new Date() : null
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/reports");
    revalidatePath("/installments");

    return {
      success: true,
      message: nextStatus === InstallmentStatus.PAID ? "Cuota marcada como pagada." : "Cuota marcada como pendiente."
    };
  } catch (error) {
    return { success: false, message: "No se pudo actualizar la cuota." };
  }
}
