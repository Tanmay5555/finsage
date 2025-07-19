"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { collection, getDocs, Timestamp } from "firebase/firestore"; // Import Timestamp for type safety
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface SavingsTrendChartProps {
  year: number;
}

interface SavingsDataPoint {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function SavingsTrendChart({ year }: SavingsTrendChartProps) {
  const [data, setData] = useState<SavingsDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Define a more specific type for raw, including Timestamp from Firestore
  const parseDate = (raw: Timestamp | string | Date | undefined | null): Date | null => {
    if (!raw) return null;
    if (raw instanceof Timestamp) return raw.toDate(); // Convert Firestore Timestamp to Date
    if (typeof raw === "string") return new Date(raw);
    if (raw instanceof Date) return raw;
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const monthly: SavingsDataPoint[] = monthNames.map((m) => ({
        month: m,
        income: 0,
        expense: 0,
        savings: 0,
      }));

      try {
        const [incomeSnap, expenseSnap] = await Promise.all([
          getDocs(collection(db, "incomes")),
          getDocs(collection(db, "expenses")),
        ]);

        incomeSnap.forEach((doc) => {
          const entry = doc.data();
          const dt = parseDate(entry.date);
          if (dt && dt.getFullYear() === year && typeof entry.amount === "number") {
            monthly[dt.getMonth()].income += entry.amount;
          }
        });

        expenseSnap.forEach((doc) => {
          const entry = doc.data();
          const dt = parseDate(entry.date);
          if (dt && dt.getFullYear() === year && typeof entry.amount === "number") {
            monthly[dt.getMonth()].expense += entry.amount;
          }
        });

        for (const entry of monthly) {
          entry.savings = entry.income - entry.expense;
        }

        setData(monthly);
      } catch (err) {
        console.error("❌ Error loading savings data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  const handleDownloadCSV = () => {
    const header = "Month,Income,Expenses,Savings\n";
    const rows = data
      .map(
        (entry) =>
          `${entry.month},${entry.income.toFixed(2)},${entry.expense.toFixed(2)},${entry.savings.toFixed(2)}`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Savings_Trend_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-[#161b33] text-white">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">📈 Savings Trend - {year}</h2>
          <Button
            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm"
            onClick={handleDownloadCSV}
            disabled={data.length === 0}
          >
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading savings trend...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3652" />
              <XAxis dataKey="month" stroke="#c3c3c3" />
              <YAxis stroke="#c3c3c3" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e213a", borderRadius: 8 }}
                labelStyle={{ color: "#c3c3c3" }}
                formatter={(value: number, name: string) => [
                  `₹${value.toFixed(2)}`,
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
              />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="#34d399"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
