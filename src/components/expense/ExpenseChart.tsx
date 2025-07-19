"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import dayjs from "dayjs";

type MonthlyExpense = {
  name: string;
  expense: number;
};

export default function ExpenseChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<MonthlyExpense[]>([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "expenses"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const rawExpenses = snapshot.docs.map(doc => doc.data());

        // Group by month
        const monthly: Record<string, number> = {};
        rawExpenses.forEach((exp: any) => {
          const month = dayjs(exp.date).format("MMM");
          monthly[month] = (monthly[month] || 0) + Number(exp.amount || 0);
        });

        // Convert to array and sort by known order
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const data = months.map(m => ({
          name: m,
          expense: monthly[m] || 0,
        }));

        setChartData(data);
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
      }
    };

    fetchExpenses();
  }, [user]);

  return (
    <Card className="bg-[#161b33] text-white">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-2">Expense Trend</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c2f49" />
              <XAxis dataKey="name" stroke="#c3c3c3" />
              <YAxis stroke="#c3c3c3" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e213a", border: "none" }}
                labelStyle={{ color: "#f87171" }}
                itemStyle={{ color: "#f87171" }}
              />
              <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
