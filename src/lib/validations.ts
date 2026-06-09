import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Ingresá un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.")
});

const transactionBaseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "El título es demasiado corto.").max(100),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0."),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "La categoría es obligatoria."),
  date: z.coerce.date(),
  notes: z.string().max(300).optional().or(z.literal("")),
  isInstallment: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.undefined()])
    .transform((value) => value === "on" || value === "true"),
  installmentCount: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      return value;
    },
    z.coerce.number().int().min(1).max(60).optional()
  ),
  firstDueDate: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      return value;
    },
    z.string().optional()
  )
});

export const transactionSchema = transactionBaseSchema.superRefine((data, ctx) => {
  if (data.isInstallment) {
    if (data.type !== "EXPENSE") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las cuotas solo se permiten para gastos.",
        path: ["isInstallment"]
      });
    }

    if (!data.installmentCount || data.installmentCount < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La compra en cuotas debe tener al menos 2 cuotas.",
        path: ["installmentCount"]
      });
    }

    if (!data.firstDueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debes indicar el primer vencimiento.",
        path: ["firstDueDate"]
      });
    }
  }
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(50),
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z.string().max(20).optional().or(z.literal("")),
  icon: z.string().max(30).optional().or(z.literal(""))
});

export const budgetSchema = z.object({
  id: z.string().optional(),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0."),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  categoryId: z.string().min(1)
});

const importCategorySchema = categorySchema.extend({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

const importTransactionSchema = transactionBaseSchema.extend({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

const importBudgetSchema = budgetSchema.extend({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const importSchema = z.object({
  categories: z.array(importCategorySchema).default([]),
  transactions: z.array(importTransactionSchema).default([]),
  budgets: z.array(importBudgetSchema).default([])
});
