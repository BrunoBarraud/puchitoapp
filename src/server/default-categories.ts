import { TransactionType } from "@prisma/client";

export const defaultCategories: Array<{
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}> = [
  { name: "Comida", type: "EXPENSE", color: "#ea580c", icon: "UtensilsCrossed" },
  { name: "Transporte", type: "EXPENSE", color: "#0284c7", icon: "Bus" },
  { name: "Universidad", type: "EXPENSE", color: "#7c3aed", icon: "GraduationCap" },
  { name: "Servicios", type: "EXPENSE", color: "#0f766e", icon: "ReceiptText" },
  { name: "Salud", type: "EXPENSE", color: "#dc2626", icon: "HeartPulse" },
  { name: "Salidas", type: "EXPENSE", color: "#db2777", icon: "Wine" },
  { name: "Compras", type: "EXPENSE", color: "#ca8a04", icon: "ShoppingBag" },
  { name: "Otros", type: "EXPENSE", color: "#57534e", icon: "CircleEllipsis" },
  { name: "Sueldo", type: "INCOME", color: "#16a34a", icon: "Wallet" },
  { name: "Trabajo freelance", type: "INCOME", color: "#059669", icon: "BriefcaseBusiness" },
  { name: "Regalo", type: "INCOME", color: "#2563eb", icon: "Gift" },
  { name: "Otros ingresos", type: "INCOME", color: "#4f46e5", icon: "BadgeDollarSign" }
];
