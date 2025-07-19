"use client";

import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore"; // Import Timestamp for type safety
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ArrowDown, ArrowUp } from "lucide-react";

interface Props {
  month: number;
  year: number;
}

export default function TotalBalanceCard({ month, year }: Props) {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [currentIncome, setCurrentIncome] = useState(0);
  const [currentExpense, setCurrentExpense] = useState(0);
  const [data, setData] = useState<{ month: string; balance: number }[]>([]);
  const [change, setChange] = useState<number | null>(null);

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
      const incomeSnap = await getDocs(collection(db, "incomes"));
      const expenseSnap = await getDocs(collection(db, "expenses"));

      const balances: { month: string; balance: number }[] = [];

      let income = 0;
      let expense = 0;

      // Analyze last 6 months including selected month
      for (let i = 5; i >= 0; i--) {
        const date = new Date(year, month - i, 1);
        const m = date.getMonth();
        const y = date.getFullYear();

        let monthIncome = 0;
        let monthExpense = 0;

        incomeSnap.forEach((doc) => {
          const d = doc.data();
          const dt = parseDate(d.date);
          if (
            dt &&
            dt.getMonth() === m &&
            dt.getFullYear() === y &&
            typeof d.amount === "number"
          ) {
            monthIncome += d.amount;
          }
        });

        expenseSnap.forEach((doc) => {
          const d = doc.data();
          const dt = parseDate(d.date);
          if (
            dt &&
            dt.getMonth() === m &&
            dt.getFullYear() === y &&
            typeof d.amount === "number"
          ) {
            monthExpense += d.amount;
          }
        });

        const balance = monthIncome - monthExpense;

        balances.push({
          month: date.toLocaleString("default", { month: "short" }),
          balance,
        });

        // Save current month’s data
        if (m === month && y === year) {
          income = monthIncome;
          expense = monthExpense;
        }
      }

      const current = income - expense;
      const previous = balances[balances.length - 2]?.balance || 0; // Safely access previous month's balance

      setData(balances);
      setCurrentIncome(income);
      setCurrentExpense(expense);
      setCurrentBalance(current);

      if (previous !== 0) {
        const percent = ((current - previous) / Math.abs(previous)) * 100;
        setChange(parseFloat(percent.toFixed(1)));
      } else {
        // If previous is 0, handle cases where current is also 0 or non-zero
        if (current !== 0) {
          setChange(100); // Represents a 100% increase from zero
        } else {
          setChange(0); // No change from zero
        }
      }
    };

    fetchData();
  }, [month, year]);

  return (
    <Card className="bg-[#161b33] text-white">
      <CardContent className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">💰 Total Balance</h2>
        <div className="text-4xl font-bold text-white">₹{currentBalance.toFixed(2)}</div>

        {change !== null && (
          <p
            className={`text-sm flex items-center gap-1 ${
              change >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {change >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {Math.abs(change)}% from last month
          </p>
        )}

        <div className="flex justify-between gap-4 text-sm mt-2">
          <p className="text-green-400">
            Income: <span className="font-semibold">₹{currentIncome.toFixed(2)}</span>
          </p>
          <p className="text-red-400">
            Expense: <span className="font-semibold">₹{currentExpense.toFixed(2)}</span>
          </p>
        </div>

        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="month" stroke="#8884d8" />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e213a", border: "none" }}
                labelStyle={{ color: "#c3c3c3" }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#ffb347"
                strokeWidth={2}
                dot={{
                  r: 4,
                  stroke: "#ffb347",
                  strokeWidth: 2,
                  fill: "#161b33",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
