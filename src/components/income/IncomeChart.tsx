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
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type ChartData = {
  name: string;
  income: number;
};

export default function IncomeChart() {
  const { user } = useAuth();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncomeData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "incomes"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);

        const monthlyTotals: Record<string, number> = {};

        snapshot.forEach((doc) => {
          const income = doc.data();
          const dateStr = income.date;
          const parsed = parseISO(dateStr);
          const month = format(parsed, "MMM");

          if (!monthlyTotals[month]) {
            monthlyTotals[month] = 0;
          }

          monthlyTotals[month] += income.amount || 0;
        });

        const chartData: ChartData[] = Object.entries(monthlyTotals).map(
          ([name, income]) => ({ name, income })
        );

        // Optional: sort months in order
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        chartData.sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name));

        setData(chartData);
      } catch (error) {
        console.error("Error fetching income chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomeData();
  }, [user]);

  return (
    <Card className="bg-[#161b33] text-white">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-2">Income Trend</h2>
        <div className="h-64">
          {loading ? (
            <Skeleton className="w-full h-full rounded-md bg-muted/30" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2c2f49" />
                <XAxis dataKey="name" stroke="#c3c3c3" />
                <YAxis stroke="#c3c3c3" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e213a", border: "none" }}
                  labelStyle={{ color: "#fbbf24" }}
                  itemStyle={{ color: "#fbbf24" }}
                />
                <Bar dataKey="income" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
