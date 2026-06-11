-- CreateTable
CREATE TABLE "FixedExpense" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "dayOfMonth" INTEGER NOT NULL DEFAULT 1,
    "startMonth" INTEGER NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endMonth" INTEGER,
    "endYear" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixedExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YearlySummary" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "incomeTotal" DECIMAL(12,2) NOT NULL,
    "expenseTotal" DECIMAL(12,2) NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL,
    "monthlyBreakdown" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YearlySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FixedExpense_userId_active_idx" ON "FixedExpense"("userId", "active");

-- CreateIndex
CREATE INDEX "FixedExpense_categoryId_idx" ON "FixedExpense"("categoryId");

-- CreateIndex
CREATE INDEX "YearlySummary_userId_year_idx" ON "YearlySummary"("userId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "YearlySummary_userId_year_key" ON "YearlySummary"("userId", "year");

-- AddForeignKey
ALTER TABLE "FixedExpense" ADD CONSTRAINT "FixedExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedExpense" ADD CONSTRAINT "FixedExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YearlySummary" ADD CONSTRAINT "YearlySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
