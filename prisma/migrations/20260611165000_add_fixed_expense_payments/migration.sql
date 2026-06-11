CREATE TABLE "FixedExpensePayment" (
    "id" TEXT NOT NULL,
    "fixedExpenseId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixedExpensePayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FixedExpensePayment_transactionId_key" ON "FixedExpensePayment"("transactionId");

CREATE UNIQUE INDEX "FixedExpensePayment_fixedExpenseId_month_year_key" ON "FixedExpensePayment"("fixedExpenseId", "month", "year");

CREATE INDEX "FixedExpensePayment_userId_month_year_idx" ON "FixedExpensePayment"("userId", "month", "year");

ALTER TABLE "FixedExpensePayment" ADD CONSTRAINT "FixedExpensePayment_fixedExpenseId_fkey"
FOREIGN KEY ("fixedExpenseId") REFERENCES "FixedExpense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FixedExpensePayment" ADD CONSTRAINT "FixedExpensePayment_transactionId_fkey"
FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FixedExpensePayment" ADD CONSTRAINT "FixedExpensePayment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
