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
import { collection, getDocs, Timestamp } from "firebase/firestore";
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

  useEffect(() => {
    const fetchYearlyData = async () => {
      setLoading(true);
  
      const monthly: SavingsDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
        month: monthNames[i],
        income: 0,
        expense: 0,
        savings: 0,
      }));
  
      try {
        const [incomeSnap, expenseSnap] = await Promise.all([
          getDocs(collection(db, "incomes")),
          getDocs(collection(db, "expenses")),
        ]);
  
        // Handle income documents
        incomeSnap.forEach((docSnap) => {
          const data = docSnap.data();
          let date: Date | null = null;
  
          if (data.date?.seconds) {
            date = new Date(data.date.seconds * 1000);
          } else if (typeof data.date?.toDate === "function") {
            date = data.date.toDate();
          }
  
          if (date && date.getFullYear() === year && typeof data.amount === "number") {
            const monthIndex = date.getMonth();
            monthly[monthIndex].income += data.amount;
  
            console.log(`📥 Income [${monthNames[monthIndex]}]: ₹${data.amount}`);
          }
        });
  
        // Handle expense documents
        expenseSnap.forEach((docSnap) => {
          const data = docSnap.data();
          let date: Date | null = null;
  
          if (data.date?.seconds) {
            date = new Date(data.date.seconds * 1000);
          } else if (typeof data.date?.toDate === "function") {
            date = data.date.toDate();
          }
  
          if (date && date.getFullYear() === year && typeof data.amount === "number") {
            const monthIndex = date.getMonth();
            monthly[monthIndex].expense += data.amount;
  
            console.log(`📤 Expense [${monthNames[monthIndex]}]: ₹${data.amount}`);
          }
        });
  
        monthly.forEach((entry) => {
          entry.savings = entry.income - entry.expense;
        });
  
        console.log("📊 Final Monthly Data:", monthly);
        setData(monthly);
      } catch (error) {
        console.error("❌ Error fetching savings trend data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchYearlyData();
  }, [year]);
  

  const handleDownloadCSV = () => {
    const header = "Month,Income,Expenses,Savings\n";
    const rows = data.map((d) => `${d.month},${d.income},${d.expense},${d.savings}`).join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
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
                contentStyle={{ backgroundColor: "#1e213a", border: "none", borderRadius: 8 }}
                labelStyle={{ color: "#c3c3c3" }}
                formatter={(value: number, name: string) =>
                  [`₹${value.toFixed(2)}`, name.charAt(0).toUpperCase() + name.slice(1)]
                }
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
