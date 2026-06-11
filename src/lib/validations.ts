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
        message: "Debés indicar el primer vencimiento.",
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

const optionalMonth = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }
    return value;
  },
  z.coerce.number().int().min(1).max(12).optional()
);

const optionalYear = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }
    return value;
  },
  z.coerce.number().int().min(2000).max(2100).optional()
);

const fixedExpenseBaseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "El título es demasiado corto.").max(100),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0."),
  categoryId: z.string().min(1, "La categoría es obligatoria."),
  dayOfMonth: z.coerce.number().int().min(1).max(31).default(1),
  startMonth: z.coerce.number().int().min(1).max(12),
  startYear: z.coerce.number().int().min(2000).max(2100),
  endMonth: optionalMonth,
  endYear: optionalYear,
  active: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.undefined()])
    .transform((value) => value === "on" || value === "true"),
  notes: z.string().max(300).optional().or(z.literal(""))
});

export const fixedExpensePaymentSchema = z.object({
  fixedExpenseId: z.string().min(1),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0.")
});

export const fixedExpenseSchema = fixedExpenseBaseSchema.superRefine((data, ctx) => {
  const hasEndMonth = typeof data.endMonth === "number";
  const hasEndYear = typeof data.endYear === "number";

  if (hasEndMonth !== hasEndYear) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Completá mes y año de fin, o dejá ambos vacíos.",
      path: ["endMonth"]
    });
  }

  if (hasEndMonth && hasEndYear) {
    const startValue = data.startYear * 12 + data.startMonth;
    const endValue = data.endYear! * 12 + data.endMonth!;

    if (endValue < startValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de fin no puede ser anterior al inicio.",
        path: ["endMonth"]
      });
    }
  }
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

const importFixedExpenseSchema = fixedExpenseBaseSchema.extend({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

const importYearlySummarySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  incomeTotal: z.coerce.number(),
  expenseTotal: z.coerce.number(),
  balance: z.coerce.number(),
  monthlyBreakdown: z.unknown()
});

export const importSchema = z.object({
  categories: z.array(importCategorySchema).default([]),
  transactions: z.array(importTransactionSchema).default([]),
  budgets: z.array(importBudgetSchema).default([]),
  fixedExpenses: z.array(importFixedExpenseSchema).default([]),
  yearlySummaries: z.array(importYearlySummarySchema).default([])
});
