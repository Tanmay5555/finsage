"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f", "#ffbb28"];

export default function Insights() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      collection(db, "users", user.uid, "transactions"),
      (snap) => {
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Transaction[];
        setTransactions(data);
      }
    );
    return () => unsub();
  }, [user]);

  // Group expenses by category
  const expenseData = transactions
    .filter((txn) => txn.type === "expense")
    .reduce<Record<string, number>>((acc, txn) => {
      acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expenseData).map(([cat, amt]) => ({
    name: cat,
    value: amt,
  }));

  // Total by date (income vs expense)
  const dateMap: Record<string, { income: number; expense: number }> = {};
  for (const txn of transactions) {
    const d = new Date(txn.date).toLocaleDateString();
    if (!dateMap[d]) dateMap[d] = { income: 0, expense: 0 };
    dateMap[d][txn.type] += txn.amount;
  }
  const barData = Object.entries(dateMap).map(([date, val]) => ({ date, ...val }));

  return (
    <div className="space-y-8 mt-12">
      <h2 className="text-xl font-semibold">Spending Insights</h2>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Expenses by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              dataKey="value"
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {pieData.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Income vs Expense (per day)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#4ade80" name="Income" />
            <Bar dataKey="expense" fill="#f87171" name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}