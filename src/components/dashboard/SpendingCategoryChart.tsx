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
import { collection, getDocs, Timestamp } from "firebase/firestore"; // Import Timestamp for type safety
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

// Define a more specific type for raw, including Timestamp from Firestore
const parseDate = (raw: Timestamp | string | Date | undefined | null): Date | null => {
  if (!raw) return null;
  if (raw instanceof Timestamp) return raw.toDate(); // Convert Firestore Timestamp to Date
  if (typeof raw === "string") return new Date(raw);
  if (raw instanceof Date) return raw;
  return null;
};

export default function SpendingCategoryChart({ month, year }: SpendingCategoryChartProps) {
  const [data, setData] = useState<CategoryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const categoryMap: Record<string, number> = {};

      try {
        const snapshot = await getDocs(collection(db, "expenses"));
        snapshot.forEach((doc) => {
          const d = doc.data();
          const dt = parseDate(d.date);
          if (
            dt &&
            dt.getFullYear() === year &&
            dt.getMonth() === month &&
            typeof d.amount === "number"
          ) {
            const category = d.category || "Uncategorized";
            categoryMap[category] = (categoryMap[category] || 0) + d.amount;
          }
        });

        const formattedData: CategoryDataPoint[] = Object.entries(categoryMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        setData(formattedData);
      } catch (err) {
        console.error("❌ Error fetching category data:", err);
        setError("Failed to load spending category data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, year]);

  const selectedMonthName = new Date(year, month).toLocaleString("default", {
    month: "long",
  });

  return (
    <Card className="bg-[#161b33] text-white">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-2">🧾 Spending by Category</h2>
        <p className="text-sm mb-4 text-muted-foreground">
          For {selectedMonthName}, {year}
        </p>

        {loading && (
          <div className="h-56 flex items-center justify-center text-gray-400">
            Loading category data...
          </div>
        )}

        {error && (
          <div className="h-56 flex items-center justify-center text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && data.length > 0 ? (
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
                  isAnimationActive
                  animationDuration={800}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    percent != null && percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                  }
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e213a",
                    borderRadius: "8px",
                    border: "none",
                  }}
                  labelStyle={{ color: "#c3c3c3" }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value: number, name: string) => [
                    `₹${value.toFixed(2)}`,
                    name,
                  ]}
                />
                <Legend
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ color: "#fff", paddingTop: 8 }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          !loading && !error && (
            <div className="h-56 flex items-center justify-center text-gray-400">
              No spending data for {selectedMonthName}, {year}.
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
