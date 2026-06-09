import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Ingresa un email valido."),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres.")
});

export const transactionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "El titulo es demasiado corto.").max(100),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0."),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "La categoria es obligatoria."),
  date: z.coerce.date(),
  notes: z.string().max(300).optional().or(z.literal(""))
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

const importTransactionSchema = transactionSchema.extend({
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
