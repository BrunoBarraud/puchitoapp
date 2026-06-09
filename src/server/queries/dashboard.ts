import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function getMonthRange(month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return { start, end };
}

export async function getDashboardData(userId: string, month: number, year: number) {
  const { start, end } = getMonthRange(month, year);
  const filter = {
    userId,
    date: {
      gte: start,
      lt: end
    }
  };

  const [transactions, groupedCategories] = await Promise.all([
    prisma.transaction.findMany({
      where: filter,
      include: {
        category: true
      },
      orderBy: {
        date: "desc"
      }
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        ...filter,
        type: "EXPENSE"
      },
      _sum: {
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

  return {
    balance: income - expense,
    income,
    expense,
    totalTransactions: transactions.length,
    latestTransactions: transactions.slice(0, 5),
    expenseByCategory
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
