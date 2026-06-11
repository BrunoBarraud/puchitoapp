import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function getMonthRange(month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return { start, end };
}

function addCategoryExpense(
  map: Map<string, { categoryId: string; name: string; color: string; total: number; accumulatedTotal: number }>,
  categoryId: string,
  name: string,
  color: string | null,
  amount: number
) {
  const current = map.get(categoryId) ?? {
    categoryId,
    name,
    color: color ?? "#78716c",
    total: 0,
    accumulatedTotal: 0
  };

  current.total += amount;
  map.set(categoryId, current);
}

export async function getAnnualSummaryData(userId: string, year: number) {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const [transactions, installmentPayments] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lt: end },
        OR: [{ type: "INCOME" }, { type: "EXPENSE", installmentPlan: null }]
      }
    }),
    prisma.installmentPayment.findMany({
      where: {
        userId,
        dueDate: { gte: start, lt: end }
      }
    })
  ]);

  const months = Array.from({ length: 12 }, (_, index) => ({
    monthNumber: index + 1,
    month: new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric" }).format(new Date(year, index, 1)),
    income: 0,
    transactionExpense: 0,
    installmentExpense: 0,
    fixedExpense: 0,
    expense: 0,
    balance: 0
  }));

  for (const transaction of transactions) {
    const entry = months[transaction.date.getMonth()];
    const amount = Number(transaction.amount);

    if (transaction.type === "INCOME") {
      entry.income += amount;
    } else {
      entry.transactionExpense += amount;
    }
  }

  for (const payment of installmentPayments) {
    months[payment.dueDate.getMonth()].installmentExpense += Number(payment.amount);
  }

  for (const entry of months) {
    entry.expense = entry.transactionExpense + entry.installmentExpense + entry.fixedExpense;
    entry.balance = entry.income - entry.expense;
  }

  const incomeTotal = months.reduce((total, entry) => total + entry.income, 0);
  const expenseTotal = months.reduce((total, entry) => total + entry.expense, 0);

  return {
    year,
    months,
    incomeTotal,
    expenseTotal,
    balance: incomeTotal - expenseTotal
  };
}

export async function ensurePreviousYearSummary(userId: string) {
  const now = new Date();
  const previousYear = now.getFullYear() - 1;

  if (previousYear < 2000) {
    return null;
  }

  const existing = await prisma.yearlySummary.findUnique({
    where: {
      userId_year: {
        userId,
        year: previousYear
      }
    }
  });

  if (existing) {
    return null;
  }

  const summary = await getAnnualSummaryData(userId, previousYear);
  const hasData = summary.months.some((month) => month.income > 0 || month.expense > 0);

  if (!hasData) {
    return null;
  }

  return prisma.yearlySummary.create({
    data: {
      userId,
      year: previousYear,
      incomeTotal: summary.incomeTotal,
      expenseTotal: summary.expenseTotal,
      balance: summary.balance,
      monthlyBreakdown: summary.months
    }
  });
}

export async function getDashboardData(userId: string, month: number, year: number) {
  const { start, end } = getMonthRange(month, year);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const filter = {
    userId,
    date: {
      gte: start,
      lt: end
    }
  };

  const [transactions, groupedCategories, installmentPayments, allTransactionTotals, dueInstallmentPayments, accumulatedTransactionTotals, accumulatedInstallmentPayments, allExpenseCategories, allInstallmentPayments, fixedExpensePayments, newYearSummary] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        ...filter,
        OR: [
          { type: "INCOME" },
          {
            type: "EXPENSE",
            installmentPlan: null
          }
        ]
      },
      include: {
        category: true,
        fixedExpensePayment: {
          include: {
            fixedExpense: true
          }
        },
        installmentPlan: {
          include: {
            payments: {
              orderBy: { installmentNumber: "asc" }
            }
          }
        }
      },
      orderBy: {
        date: "desc"
      }
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        ...filter,
        type: "EXPENSE",
        installmentPlan: null
      },
      _sum: {
        amount: true
      }
    }),
    prisma.installmentPayment.findMany({
      where: {
        userId,
        dueDate: {
          gte: start,
          lt: end
        }
      },
      include: {
        plan: {
          include: {
            category: true,
            transaction: true
          }
        }
      },
      orderBy: {
        dueDate: "asc"
      }
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        OR: [
          { type: "INCOME" },
          {
            type: "EXPENSE",
            installmentPlan: null
          }
        ]
      },
      _sum: {
        amount: true
      }
    }),
    prisma.installmentPayment.findMany({
      where: {
        userId,
        dueDate: {
          lte: today
        }
      },
      select: {
        amount: true
      }
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        date: {
          lt: end
        },
        OR: [
          { type: "INCOME" },
          {
            type: "EXPENSE",
            installmentPlan: null
          }
        ]
      },
      _sum: {
        amount: true
      }
    }),
    prisma.installmentPayment.findMany({
      where: {
        userId,
        dueDate: {
          lt: end
        }
      },
      select: {
        amount: true
      }
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "EXPENSE",
        installmentPlan: null
      },
      _sum: {
        amount: true
      }
    }),
    prisma.installmentPayment.findMany({
      where: { userId },
      include: {
        plan: {
          select: {
            categoryId: true
          }
        }
      }
    }),
    prisma.fixedExpensePayment.findMany({
      where: { userId, month, year },
      include: {
        fixedExpense: {
          include: {
            category: true
          }
        }
      },
      orderBy: { paidAt: "desc" }
    }),
    ensurePreviousYearSummary(userId)
  ]);

  const income = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const expense = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const totalIncome = Number(allTransactionTotals.find((item) => item.type === "INCOME")?._sum.amount ?? 0);
  const totalExpense = Number(allTransactionTotals.find((item) => item.type === "EXPENSE")?._sum.amount ?? 0);
  const accumulatedIncome = Number(accumulatedTransactionTotals.find((item) => item.type === "INCOME")?._sum.amount ?? 0);
  const accumulatedExpense = Number(accumulatedTransactionTotals.find((item) => item.type === "EXPENSE")?._sum.amount ?? 0);
  const installmentExpense = installmentPayments.reduce((total, payment) => total + Number(payment.amount), 0);
  const dueInstallmentExpense = dueInstallmentPayments.reduce((total, payment) => total + Number(payment.amount), 0);
  const accumulatedInstallmentExpense = accumulatedInstallmentPayments.reduce((total, payment) => total + Number(payment.amount), 0);
  const fixedExpense = fixedExpensePayments.reduce((total, item) => total + Number(item.amount), 0);
  const categories = await prisma.category.findMany({
    where: {
      id: {
        in: groupedCategories.map((item) => item.categoryId)
      }
    }
  });

  const accumulatedExpenseByCategory = new Map<string, number>();
  const expenseByCategoryMap = new Map<string, { categoryId: string; name: string; color: string; total: number; accumulatedTotal: number }>();

  for (const item of allExpenseCategories) {
    accumulatedExpenseByCategory.set(item.categoryId, Number(item._sum.amount ?? 0));
  }

  for (const payment of allInstallmentPayments) {
    const current = accumulatedExpenseByCategory.get(payment.plan.categoryId) ?? 0;
    accumulatedExpenseByCategory.set(payment.plan.categoryId, current + Number(payment.amount));
  }

  for (const item of groupedCategories) {
    const category = categories.find((entry) => entry.id === item.categoryId);

    addCategoryExpense(expenseByCategoryMap, item.categoryId, category?.name ?? "Sin categoría", category?.color ?? "#78716c", Number(item._sum.amount ?? 0));
  }

  for (const payment of installmentPayments) {
    addCategoryExpense(expenseByCategoryMap, payment.plan.categoryId, payment.plan.category.name, payment.plan.category.color, Number(payment.amount));
  }

  for (const item of expenseByCategoryMap.values()) {
    item.accumulatedTotal = accumulatedExpenseByCategory.get(item.categoryId) ?? item.total;
  }

  const monthlyMovements = transactions.map((transaction) => ({
    ...transaction,
    installmentLabel: transaction.fixedExpensePayment ? "Gasto fijo" : null as string | null
  }));
  const installmentMovements = installmentPayments.map((payment) => ({
    id: payment.id,
    title: `${payment.plan.transaction.title} - cuota ${payment.installmentNumber}/${payment.plan.installmentCount}`,
    amount: payment.amount,
    type: "EXPENSE" as const,
    date: payment.dueDate,
    category: payment.plan.category,
    installmentLabel: `${payment.installmentNumber}/${payment.plan.installmentCount} cuotas`
  }));
  const latestTransactions = [...monthlyMovements, ...installmentMovements]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);
  const totalMonthlyExpense = expense + installmentExpense;

  return {
    totalBalance: totalIncome - totalExpense - dueInstallmentExpense,
    accumulatedBalance: accumulatedIncome - accumulatedExpense - accumulatedInstallmentExpense,
    balance: income - totalMonthlyExpense,
    income,
    expense: totalMonthlyExpense,
    fixedExpense,
    totalTransactions: transactions.length + installmentPayments.length,
    latestTransactions,
    expenseByCategory: Array.from(expenseByCategoryMap.values()).sort((a, b) => b.total - a.total),
    upcomingInstallments: installmentPayments.slice(0, 5),
    fixedExpenses: fixedExpensePayments.slice(0, 5),
    newYearSummary
  };
}

export async function getReportData(userId: string) {
  const now = new Date();
  const annualSummary = await getAnnualSummaryData(userId, now.getFullYear());
  const [transactions, installmentPayments, yearlySummaries] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        OR: [{ type: "INCOME" }, { type: "EXPENSE", installmentPlan: null }]
      },
      include: { category: true },
      orderBy: { date: "asc" }
    }),
    prisma.installmentPayment.findMany({
      where: { userId },
      include: {
        plan: {
          include: {
            category: true
          }
        }
      }
    }),
    prisma.yearlySummary.findMany({
      where: { userId },
      orderBy: { year: "desc" }
    })
  ]);

  const monthlyMap = new Map<string, { month: string; income: number; expense: number; balance: number }>();
  const categoryMap = new Map<string, { name: string; total: number; color: string }>();

  for (const transaction of transactions) {
    const key = `${transaction.date.getFullYear()}-${transaction.date.getMonth() + 1}`;
    const existingMonth = monthlyMap.get(key) ?? {
      month: new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric" }).format(transaction.date),
      income: 0,
      expense: 0,
      balance: 0
    };
    const amount = Number(transaction.amount);

    if (transaction.type === "INCOME") {
      existingMonth.income += amount;
    } else {
      existingMonth.expense += amount;
      const categoryEntry = categoryMap.get(transaction.categoryId) ?? {
        name: transaction.category.name,
        total: 0,
        color: transaction.category.color ?? "#78716c"
      };

      categoryEntry.total += amount;
      categoryMap.set(transaction.categoryId, categoryEntry);
    }

    existingMonth.balance = existingMonth.income - existingMonth.expense;
    monthlyMap.set(key, existingMonth);
  }

  for (const payment of installmentPayments) {
    const key = `${payment.dueDate.getFullYear()}-${payment.dueDate.getMonth() + 1}`;
    const existingMonth = monthlyMap.get(key) ?? {
      month: new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric" }).format(payment.dueDate),
      income: 0,
      expense: 0,
      balance: 0
    };
    const amount = Number(payment.amount);

    existingMonth.expense += amount;
    existingMonth.balance = existingMonth.income - existingMonth.expense;
    monthlyMap.set(key, existingMonth);

    const categoryEntry = categoryMap.get(payment.plan.categoryId) ?? {
      name: payment.plan.category.name,
      total: 0,
      color: payment.plan.category.color ?? "#78716c"
    };
    categoryEntry.total += amount;
    categoryMap.set(payment.plan.categoryId, categoryEntry);
  }

  const years = new Set<number>();
  for (const transaction of transactions) {
    years.add(transaction.date.getFullYear());
  }
  for (const payment of installmentPayments) {
    years.add(payment.dueDate.getFullYear());
  }
  const categoryTotals = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);

  return {
    monthly: Array.from(monthlyMap.entries())
      .sort(([a], [b]) => {
        const [yearA, monthA] = a.split("-").map(Number);
        const [yearB, monthB] = b.split("-").map(Number);
        return yearA === yearB ? monthA - monthB : yearA - yearB;
      })
      .map(([, value]) => value),
    categoryTotals,
    topCategories: categoryTotals.slice(0, 5),
    annualSummary,
    yearlySummaries
  };
}

export function transactionSearchWhere(
  userId: string,
  filters: {
    month?: number;
    year?: number;
    type?: string;
    categoryId?: string;
    query?: string;
  }
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.month && filters.year) {
    where.date = {
      gte: new Date(filters.year, filters.month - 1, 1),
      lt: new Date(filters.year, filters.month, 1)
    };
  }

  if (filters.type === "INCOME" || filters.type === "EXPENSE") {
    where.type = filters.type;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.query) {
    where.title = {
      contains: filters.query,
      mode: "insensitive"
    };
  }

  return where;
}

export async function getInstallmentPlans(userId: string) {
  return prisma.installmentPlan.findMany({
    where: { userId },
    include: {
      category: true,
      transaction: true,
      payments: {
        orderBy: { installmentNumber: "asc" }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}
