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
  Legend,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Props {
  year: number;
  month: number;
}

interface DataPoint {
  month: string;
  income: number;
  expenses: number;
}

const shortMonthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function IncomeExpenseChart({  year }: Props) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const monthlyData: Record<number, { income: number; expenses: number }> = {};
      for (let i = 0; i < 12; i++) {
        monthlyData[i] = { income: 0, expenses: 0 };
      }

      try {
        const incomeSnap = await getDocs(collection(db, "incomes"));
        incomeSnap.forEach((doc) => {
          const d = doc.data();
          const dt = d.date?.seconds ? new Date(d.date.seconds * 1000) : new Date(d.date);
          if (dt.getFullYear() === year) {
            const monthIndex = dt.getMonth();
            monthlyData[monthIndex].income += Number(d.amount || 0);
          }
        });

        const expenseSnap = await getDocs(collection(db, "expenses"));
        expenseSnap.forEach((doc) => {
          const d = doc.data();
          const dt = d.date?.seconds ? new Date(d.date.seconds * 1000) : new Date(d.date);
          if (dt.getFullYear() === year) {
            const monthIndex = dt.getMonth();
            monthlyData[monthIndex].expenses += Number(d.amount || 0);
          }
        });

        const formattedData = Object.entries(monthlyData).map(([index, values]) => ({
          month: shortMonthNames[Number(index)],
          income: values.income,
          expenses: values.expenses,
        }));

        setData(formattedData);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError("Failed to load chart data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  return (
    <Card className="bg-[#161b33] text-white">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-2">Income & Expenses by Month (F.Y. {year})</h2>
        {loading && <div className="text-center text-gray-400">Loading...</div>}
        {error && <div className="text-center text-red-400">{error}</div>}
        {!loading && !error && data.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="month" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e213a", border: "none" }}
                  labelStyle={{ color: "#c3c3c3" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend wrapperStyle={{ color: "#fff" }} />
                <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {!loading && !error && data.length === 0 && (
          <div className="text-center text-gray-400">No data available for {year}.</div>
        )}
      </CardContent>
    </Card>
  );
}
