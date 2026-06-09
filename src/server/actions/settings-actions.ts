"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { importSchema } from "@/lib/validations";
import type { ActionState } from "@/types";

export async function exportDataAction() {
  const user = await requireUser();
  const [categories, transactions, budgets] = await Promise.all([
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { date: "desc" } }),
    prisma.budget.findMany({ where: { userId: user.id }, orderBy: [{ year: "desc" }, { month: "desc" }] })
  ]);

  return JSON.stringify(
    {
      categories,
      transactions,
      budgets
    },
    null,
    2
  );
}

export async function importDataAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireUser();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { success: false, message: "Subi un archivo JSON." };
    }

    const raw = await file.text();
    const parsedJson = JSON.parse(raw);
    const parsed = importSchema.safeParse(parsedJson);

    if (!parsed.success) {
      return { success: false, message: "La estructura del archivo importado no es válida." };
    }

    await prisma.$transaction(async (tx) => {
      const categoryIdMap = new Map<string, string>();

      for (const category of parsed.data.categories) {
        const created = await tx.category.create({
          data: {
            name: category.name,
            type: category.type,
            color: category.color || null,
            icon: category.icon || null,
            userId: user.id
          }
        });
        if (category.id) {
          categoryIdMap.set(category.id, created.id);
        }
      }

      for (const transaction of parsed.data.transactions) {
        const categoryId = categoryIdMap.get(transaction.categoryId) ?? transaction.categoryId;
        const ownsCategory = await tx.category.findFirst({
          where: { id: categoryId, userId: user.id }
        });

        if (!ownsCategory) {
          continue;
        }

        await tx.transaction.create({
          data: {
            title: transaction.title,
            amount: transaction.amount,
            type: transaction.type,
            categoryId,
            date: transaction.date,
            notes: transaction.notes || null,
            userId: user.id
          }
        });
      }

      for (const budget of parsed.data.budgets) {
        const categoryId = categoryIdMap.get(budget.categoryId) ?? budget.categoryId;
        const ownsCategory = await tx.category.findFirst({
          where: { id: categoryId, userId: user.id, type: "EXPENSE" }
        });

        if (!ownsCategory) {
          continue;
        }

        await tx.budget.upsert({
          where: {
            userId_categoryId_month_year: {
              userId: user.id,
              categoryId,
              month: budget.month,
              year: budget.year
            }
          },
          create: {
            amount: budget.amount,
            month: budget.month,
            year: budget.year,
            categoryId,
            userId: user.id
          },
          update: {
            amount: budget.amount
          }
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/categories");
    revalidatePath("/budgets");
    revalidatePath("/reports");
    revalidatePath("/settings");

    return { success: true, message: "Datos importados correctamente." };
  } catch (error) {
    return { success: false, message: "No se pudieron importar los datos." };
  }
}
