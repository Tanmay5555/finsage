"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ReceiptDonutChartProps {
  month: number;
  year: number;
}

interface DonutDataPoint {
  name: string;
  value: number;
}

const COLORS = ["#22c55e", "#ef4444", "#fbbf24", "#3b82f6"];

export default function ReceiptDonutChart({ month, year }: ReceiptDonutChartProps) {
  const [data, setData] = useState<DonutDataPoint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      let foodExpenses = 0;
      let nonFoodExpenses = 0;

      try {
        const expenseSnap = await getDocs(collection(db, "expenses"));
        expenseSnap.forEach((doc) => {
          const d = doc.data();
          const dt = d.date?.seconds ? new Date(d.date.seconds * 1000) : new Date(d.date);
          if (dt.getMonth() === month && dt.getFullYear() === year) {
            const category = d.category?.toLowerCase() || "non-food";
            const amount = d.amount || 0;
            if (category.includes("food") || category.includes("grocery") || category.includes("restaurant")) {
              foodExpenses += amount;
            } else {
              nonFoodExpenses += amount;
            }
          }
        });

        const chartData: DonutDataPoint[] = [];
        if (foodExpenses > 0) chartData.push({ name: "Food", value: foodExpenses });
        if (nonFoodExpenses > 0) chartData.push({ name: "Non-food", value: nonFoodExpenses });

        setData(chartData);
        setTotal(foodExpenses + nonFoodExpenses);
      } catch (err) {
        console.error("Error fetching receipt data:", err);
        setError("Failed to load receipt data.");
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
        <h2 className="text-lg font-semibold mb-2">Receipts Split Summary</h2>
        <p className="text-sm mb-4 text-muted-foreground">
          For {selectedMonthName}, {year}
        </p>

        {loading && <div className="h-52 flex items-center justify-center text-gray-400">Loading data...</div>}
        {error && <div className="h-52 flex items-center justify-center text-red-400">{error}</div>}
        {!loading && !error && (
          <>
            {data.length > 0 ? (
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      isAnimationActive
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e213a", border: "none", borderRadius: "6px" }}
                      labelStyle={{ color: "#c3c3c3" }}
                      itemStyle={{ color: "#fbbf24" }}
                      formatter={(value: number, name: string) => [`₹${value.toFixed(2)}`, name]}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ color: "#e2e8f0", marginTop: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-white">₹{total.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center text-gray-400">
                No data available for {selectedMonthName}, {year}.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
