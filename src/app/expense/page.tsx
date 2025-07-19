// app/expense/page.tsx
"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import ExpenseChart from "@/components/expense/ExpenseChart";
import ExpenseList from "@/components/expense/ExpenseList";
import AddExpenseForm from "@/components/expense/AddExpenseForm";

export default function ExpensePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Expense Management</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your expenses efficiently.
          </p>
        </div>

        {/* Chart + Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 min-h-[300px]">
            <ExpenseChart />
          </div>
          <div className="min-h-[300px]">
            <AddExpenseForm />
          </div>
        </div>

        {/* Expense List */}
        <ExpenseList />
      </div>
    </DashboardLayout>
  );
}
