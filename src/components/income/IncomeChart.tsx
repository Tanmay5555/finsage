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
import { format, parseISO, isValid } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type ChartData = {
  name: string;
  income: number;
};

const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function IncomeChart({ refreshKey = 0 }: { refreshKey?: number }) {
  const { user } = useAuth();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncomeData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const q = query(collection(db, "incomes"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);

        const monthlyTotals: Record<string, number> = {};

        snapshot.forEach((doc) => {
          const income = doc.data();
          const rawDate = income.date;

          let parsedDate: Date | null = null;

          if (typeof rawDate === "string") {
            parsedDate = parseISO(rawDate);
          } else if (rawDate?.seconds) {
            parsedDate = new Date(rawDate.seconds * 1000);
          } else if (rawDate instanceof Date) {
            parsedDate = rawDate;
          }

          if (!parsedDate || !isValid(parsedDate)) return;

          const month = format(parsedDate, "MMM");
          const amount = Number(income.amount || 0);

          monthlyTotals[month] = (monthlyTotals[month] || 0) + amount;
        });

        const chartData: ChartData[] = monthOrder.map((m) => ({
          name: m,
          income: monthlyTotals[m] || 0,
        }));

        setData(chartData);
      } catch (error) {
        console.error("Error fetching income chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomeData();
  }, [user, refreshKey]);

  return (
    <Card className="bg-[#161b33] text-white h-full min-h-[300px]">
      <CardContent className="p-4 flex flex-col h-full">
        <h2 className="text-lg font-semibold mb-2">📈 Income Trend</h2>
        <div className="flex-grow">
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
                  labelStyle={{ color: "#60a5fa" }}
                  itemStyle={{ color: "#60a5fa" }}
                  formatter={(value: number) => [`₹${value.toFixed(2)}`, "Income"]}
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
