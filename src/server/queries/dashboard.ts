import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function getMonthRange(month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return { start, end };
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

  const [transactions, groupedCategories, installmentPayments, allTransactionTotals, dueInstallmentPayments] = await Promise.all([
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
    })
  ]);

  const income = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const expense = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const totalIncome = Number(allTransactionTotals.find((item) => item.type === "INCOME")?._sum.amount ?? 0);
  const totalExpense = Number(allTransactionTotals.find((item) => item.type === "EXPENSE")?._sum.amount ?? 0);
  const installmentExpense = installmentPayments.reduce((total, payment) => total + Number(payment.amount), 0);
  const dueInstallmentExpense = dueInstallmentPayments.reduce((total, payment) => total + Number(payment.amount), 0);
  const categories = await prisma.category.findMany({
    where: {
      id: {
        in: groupedCategories.map((item) => item.categoryId)
      }
    }
  });

  const expenseByCategory = groupedCategories.map((item) => {
    const category = categories.find((entry) => entry.id === item.categoryId);

    return {
      categoryId: item.categoryId,
      name: category?.name ?? "Unknown",
      color: category?.color ?? "#78716c",
      total: Number(item._sum.amount ?? 0)
    };
  });
  const installmentExpenseByCategory = new Map<string, { categoryId: string; name: string; color: string; total: number }>();

  for (const payment of installmentPayments) {
    const current = installmentExpenseByCategory.get(payment.plan.categoryId) ?? {
      categoryId: payment.plan.categoryId,
      name: payment.plan.category.name,
      color: payment.plan.category.color ?? "#78716c",
      total: 0
    };

    current.total += Number(payment.amount);
    installmentExpenseByCategory.set(payment.plan.categoryId, current);
  }

  for (const item of installmentExpenseByCategory.values()) {
    const existing = expenseByCategory.find((category) => category.categoryId === item.categoryId);

    if (existing) {
      existing.total += item.total;
    } else {
      expenseByCategory.push(item);
    }
  }

  const monthlyMovements = transactions.map((transaction) => ({
    ...transaction,
    installmentLabel: null as string | null
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

  return {
    totalBalance: totalIncome - totalExpense - dueInstallmentExpense,
    balance: income - expense - installmentExpense,
    income,
    expense: expense + installmentExpense,
    totalTransactions: transactions.length + installmentPayments.length,
    latestTransactions,
    expenseByCategory: expenseByCategory.sort((a, b) => b.total - a.total),
    upcomingInstallments: installmentPayments.slice(0, 5)
  };
}

export async function getReportData(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: "asc" }
  });

  const monthlyMap = new Map<string, { month: string; income: number; expense: number; balance: number }>();
  const categoryMap = new Map<string, { name: string; total: number; color: string }>();

  for (const transaction of transactions) {
    const key = `${transaction.date.getFullYear()}-${transaction.date.getMonth() + 1}`;
    const existingMonth = monthlyMap.get(key) ?? {
      month: new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(transaction.date),
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

  const categoryTotals = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);

  return {
    monthly: Array.from(monthlyMap.values()),
    categoryTotals,
    topCategories: categoryTotals.slice(0, 5)
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
