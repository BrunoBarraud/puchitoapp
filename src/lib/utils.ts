import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getCurrentMonthYear() {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}

export function parseMonthYear(searchParams?: {
  month?: string;
  year?: string;
}) {
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const month = Number(searchParams?.month ?? currentMonth);
  const year = Number(searchParams?.year ?? currentYear);

  return {
    month: Number.isNaN(month) ? currentMonth : month,
    year: Number.isNaN(year) ? currentYear : year
  };
}
