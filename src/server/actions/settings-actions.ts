"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { importSchema } from "@/lib/validations";
import type { ActionState } from "@/types";

type CsvTransaction = {
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  categoryName: string;
  date: Date;
  notes?: string;
};

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && next === "\"") {
      current += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseDateValue(value: string) {
  const trimmed = value.trim();
  const isoDate = new Date(trimmed);

  if (!Number.isNaN(isoDate.getTime())) {
    return isoDate;
  }

  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseTransactionsCsv(raw: string) {
  const [headerLine, ...rows] = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!headerLine) {
    return [];
  }

  const headers = parseCsvLine(headerLine).map((header) => header.toLowerCase());
  const required = ["title", "amount", "type", "category", "date"];

  if (!required.every((key) => headers.includes(key))) {
    throw new Error("invalid_headers");
  }

  return rows.map((row) => {
    const values = parseCsvLine(row);
    const record = new Map(headers.map((header, index) => [header, values[index] ?? ""]));
    const type = record.get("type")?.toUpperCase();
    const amount = Number(record.get("amount"));
    const date = parseDateValue(record.get("date") ?? "");

    if (type !== "INCOME" && type !== "EXPENSE") {
      throw new Error("invalid_type");
    }

    if (!Number.isFinite(amount) || amount <= 0 || !date) {
      throw new Error("invalid_values");
    }

    return {
      title: record.get("title") ?? "",
      amount,
      type,
      categoryName: record.get("category") ?? "",
      date,
      notes: record.get("notes") ?? ""
    } satisfies CsvTransaction;
  });
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll("\"", "\"\"")}"`;
}

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

export async function exportTransactionsCsvAction() {
  const user = await requireUser();
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: "desc" }
  });
  const rows = transactions.map((transaction) =>
    [
      transaction.title,
      Number(transaction.amount),
      transaction.type,
      transaction.category.name,
      transaction.date.toISOString().slice(0, 10),
      transaction.notes ?? ""
    ]
      .map(csvEscape)
      .join(",")
  );

  return ["title,amount,type,category,date,notes", ...rows].join("\n");
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

export async function importTransactionsCsvAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireUser();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { success: false, message: "Subí un archivo CSV." };
    }

    const rows = parseTransactionsCsv(await file.text());

    await prisma.$transaction(async (tx) => {
      for (const row of rows) {
        if (!row.title.trim() || !row.categoryName.trim()) {
          continue;
        }

        const category = await tx.category.upsert({
          where: {
            userId_name_type: {
              userId: user.id,
              name: row.categoryName.trim(),
              type: row.type
            }
          },
          create: {
            name: row.categoryName.trim(),
            type: row.type,
            userId: user.id
          },
          update: {}
        });

        await tx.transaction.create({
          data: {
            title: row.title.trim(),
            amount: row.amount,
            type: row.type,
            categoryId: category.id,
            date: row.date,
            notes: row.notes?.trim() || null,
            userId: user.id
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

    return { success: true, message: "CSV importado correctamente." };
  } catch (error) {
    return { success: false, message: "No se pudo importar el CSV. Revisá columnas y formato." };
  }
}
