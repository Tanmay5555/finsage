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
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"; // Import Timestamp for type safety
import { useAuth } from "@/context/AuthContext";
import dayjs from "dayjs";
import { Skeleton } from "@/components/ui/skeleton";

type MonthlyExpense = {
  name: string;
  expense: number;
};

// Define an interface for the expense data retrieved from Firestore
interface ExpenseData {
  date: Timestamp | string | Date; // Can be Timestamp, string, or Date
  amount: number;
  // Add other properties if they exist in your expense documents, e.g., category: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ExpenseChart({ refreshKey = 0 }: { refreshKey?: number }) {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<MonthlyExpense[]>([]);
  const [loading, setLoading] = useState(true);

  // Define a more specific type for raw, including Timestamp from Firestore
  const parseDate = (raw: Timestamp | string | Date | undefined | null): Date | null => {
    if (!raw) return null;
    if (raw instanceof Timestamp) return raw.toDate(); // Convert Firestore Timestamp to Date
    if (typeof raw === "string") return new Date(raw);   // ISO string
    if (raw instanceof Date) return raw;
    return null;
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const q = query(collection(db, "expenses"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        // Type rawExpenses as an array of ExpenseData
        const rawExpenses: ExpenseData[] = snapshot.docs.map((doc) => doc.data() as ExpenseData);

        const monthly: Record<string, number> = {};

        // Type exp as ExpenseData
        rawExpenses.forEach((exp: ExpenseData) => {
          const dt = parseDate(exp.date);
          if (!dt) return;

          const month = dayjs(dt).format("MMM");
          // Ensure exp.amount is treated as a number
          monthly[month] = (monthly[month] || 0) + Number(exp.amount || 0);
        });

        const data: MonthlyExpense[] = MONTHS.map((month) => ({
          name: month,
          expense: monthly[month] || 0,
        }));

        setChartData(data);
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user, refreshKey]);

  return (
    <Card className="bg-[#161b33] text-white h-full min-h-[300px]">
      <CardContent className="p-4 flex flex-col h-full">
        <h2 className="text-lg font-semibold mb-2">💸 Expense Trend</h2>
        <div className="flex-grow">
          {loading ? (
            <Skeleton className="w-full h-full rounded-md bg-muted/30" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2c2f49" />
                <XAxis dataKey="name" stroke="#c3c3c3" />
                <YAxis stroke="#c3c3c3" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e213a", border: "none" }}
                  labelStyle={{ color: "#f87171" }}
                  itemStyle={{ color: "#f87171" }}
                  formatter={(value: number) => [`₹${value.toFixed(2)}`, "Expense"]}
                />
                <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
