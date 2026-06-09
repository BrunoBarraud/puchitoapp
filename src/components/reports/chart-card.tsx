"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";

export function MonthlyComparisonChart({ data }: { data: Array<{ month: string; income: number; expense: number }> }) {
  return (
    <Card className="h-96">
      <p className="mb-4 text-lg font-bold">Ingresos vs gastos</p>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="income" fill="#16a34a" radius={8} />
          <Bar dataKey="expense" fill="#dc2626" radius={8} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function CategoryExpenseChart({ data }: { data: Array<{ name: string; total: number; color: string }> }) {
  return (
    <Card className="h-96">
      <p className="mb-4 text-lg font-bold">Gastos por categoría</p>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="name" innerRadius={70} outerRadius={110}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function BalanceLineChart({ data }: { data: Array<{ month: string; balance: number }> }) {
  return (
    <Card className="h-96">
      <p className="mb-4 text-lg font-bold">Balance mensual</p>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="balance" stroke="#7d5928" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
