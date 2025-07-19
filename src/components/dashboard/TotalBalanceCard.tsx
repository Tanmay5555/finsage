"use client";

import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
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

  useEffect(() => {
    const fetchData = async () => {
      const incomeSnap = await getDocs(collection(db, "incomes"));
      const expenseSnap = await getDocs(collection(db, "expenses"));

      let monthlyData: { [key: string]: number } = {};
      let income = 0;
      let expense = 0;

      // Build balance chart from past 6 months
      const balances: { month: string; balance: number }[] = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(year, month - i);
        const m = d.getMonth();
        const y = d.getFullYear();
        let monthIncome = 0;
        let monthExpense = 0;

        incomeSnap.forEach((doc) => {
          const data = doc.data();
          const dt = new Date(data.date);
          if (dt.getMonth() === m && dt.getFullYear() === y) {
            monthIncome += data.amount;
          }
        });

        expenseSnap.forEach((doc) => {
          const data = doc.data();
          const dt = new Date(data.date);
          if (dt.getMonth() === m && dt.getFullYear() === y) {
            monthExpense += data.amount;
          }
        });

        balances.push({
          month: d.toLocaleString("default", { month: "short" }),
          balance: monthIncome - monthExpense,
        });

        if (m === month && y === year) {
          income = monthIncome;
          expense = monthExpense;
        }
      }

      const current = income - expense;
      const previous = balances[balances.length - 2]?.balance || 0;

      setData(balances);
      setCurrentBalance(current);
      setCurrentIncome(income);
      setCurrentExpense(expense);
      if (previous !== 0) {
        const percent = ((current - previous) / previous) * 100;
        setChange(parseFloat(percent.toFixed(1)));
      } else {
        setChange(null);
      }
    };

    fetchData();
  }, [month, year]);

  return (
    <Card className="bg-[#161b33] text-white">
      <CardContent className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Total Balance</h2>
        <div className="text-4xl font-bold text-white">₹{currentBalance}</div>

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
            Income: <span className="font-semibold">₹{currentIncome}</span>
          </p>
          <p className="text-red-400">
            Expense: <span className="font-semibold">₹{currentExpense}</span>
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
