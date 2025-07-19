"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SpendingCategoryChartProps {
  month: number;
  year: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
}

const COLORS = [
  "#60a5fa", "#fcd34d", "#a78bfa", "#34d399", "#f87171",
  "#818cf8", "#fb923c", "#c084fc", "#2dd4bf", "#e879f9",
];

export default function SpendingCategoryChart({ month, year }: SpendingCategoryChartProps) {
  const [data, setData] = useState<CategoryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parseDate = (raw: any): Date | null => {
      if (!raw) return null;
      if (raw.seconds) return new Date(raw.seconds * 1000);
      if (typeof raw === "string") return new Date(raw);
      if (raw instanceof Date) return raw;
      return null;
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const categoryExpenses: { [key: string]: number } = {};

      try {
        const expenseSnap = await getDocs(collection(db, "expenses"));
        expenseSnap.forEach((doc) => {
          const d = doc.data();
          const dt = parseDate(d.date);

          if (dt && dt.getFullYear() === year && dt.getMonth() === month) {
            const category = d.category || "Uncategorized";
            const amount = Number(d.amount) || 0;

            categoryExpenses[category] = (categoryExpenses[category] || 0) + amount;
          }
        });

        const formattedData: CategoryDataPoint[] = Object.keys(categoryExpenses).map((categoryName) => ({
          name: categoryName,
          value: categoryExpenses[categoryName],
        }));

        formattedData.sort((a, b) => b.value - a.value);
        setData(formattedData);
      } catch (err) {
        console.error("Error fetching spending category data:", err);
        setError("Failed to load spending category data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, year]);

  const selectedMonthName = new Date(year, month).toLocaleString("default", { month: "long" });

  return (
    <Card className="bg-[#161b33] text-white">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-2">Spending by Category</h2>
        <p className="text-sm mb-4 text-muted-foreground">
          For {selectedMonthName}, {year}
        </p>

        {loading && <div className="h-56 flex items-center justify-center text-gray-400">Loading category data...</div>}
        {error && <div className="h-56 flex items-center justify-center text-red-400">{error}</div>}
        {!loading && !error && (
          data.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={({ name, percent }) => percent && percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    isAnimationActive
                    animationDuration={800}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e213a", border: "none", borderRadius: "8px" }}
                    labelStyle={{ color: "#c3c3c3" }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value: number, name: string) => [`₹${value.toFixed(2)}`, name]}
                  />
                  <Legend
                    align="center"
                    verticalAlign="bottom"
                    wrapperStyle={{ color: "#fff", paddingTop: '8px' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-400">
              No spending data for {selectedMonthName}, {year}.
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
