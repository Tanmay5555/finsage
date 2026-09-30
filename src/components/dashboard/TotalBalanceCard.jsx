"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { ArrowDown, ArrowUp, Wallet } from "lucide-react";

export default function TotalBalanceCard({ month, year }) {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();

  const [data, setData] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [currentIncome, setCurrentIncome] = useState(0);
  const [currentExpense, setCurrentExpense] = useState(0);
  const [change, setChange] = useState(null);

  const parseDate = (raw) => {
    if (!raw) return null;
    if (raw instanceof Timestamp) return raw.toDate();
    if (typeof raw === "string") return new Date(raw);
    if (raw instanceof Date) return raw;
    return null;
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const incomeQuery = query(
          collection(db, "incomes"),
          where("userId", "==", user.uid)
        );
        const expenseQuery = query(
          collection(db, "expenses"),
          where("userId", "==", user.uid)
        );

        const [incomeSnap, expenseSnap] = await Promise.all([
          getDocs(incomeQuery),
          getDocs(expenseQuery)
        ]);

        const balances = [];

        let thisMonthIncome = 0;
        let thisMonthExpense = 0;

        for (let i = 5; i >= 0; i--) {
          const targetDate = new Date(year, month - i, 1);
          const targetMonth = targetDate.getMonth();
          const targetYear = targetDate.getFullYear();

          let monthIncome = 0;
          let monthExpense = 0;

          incomeSnap.forEach((doc) => {
            const entry = doc.data();
            const dt = parseDate(entry.date);
            if (
              dt &&
              dt.getMonth() === targetMonth &&
              dt.getFullYear() === targetYear &&
              typeof entry.amount === "number"
            ) {
              monthIncome += entry.amount;
            }
          });

          expenseSnap.forEach((doc) => {
            const entry = doc.data();
            const dt = parseDate(entry.date);
            if (
              dt &&
              dt.getMonth() === targetMonth &&
              dt.getFullYear() === targetYear &&
              typeof entry.amount === "number"
            ) {
              monthExpense += entry.amount;
            }
          });

          balances.push({
            month: targetDate.toLocaleString("default", { month: "short" }),
            balance: monthIncome - monthExpense
          });

          if (targetMonth === month && targetYear === year) {
            thisMonthIncome = monthIncome;
            thisMonthExpense = monthExpense;
          }
        }

        const latestBalance = thisMonthIncome - thisMonthExpense;
        const prevBalance = balances[balances.length - 2]?.balance || 0;

        setData(balances);
        setCurrentIncome(thisMonthIncome);
        setCurrentExpense(thisMonthExpense);
        setCurrentBalance(latestBalance);

        if (prevBalance !== 0) {
          const percentChange = ((latestBalance - prevBalance) / Math.abs(prevBalance)) * 100;
          setChange(parseFloat(percentChange.toFixed(1)));
        } else {
          setChange(latestBalance !== 0 ? 100 : 0);
        }
      } catch (error) {
        console.error("Error fetching balance data:", error);
      }
    };

    fetchData();
  }, [user, month, year]);

  return (
    <Card className="bg-gradient-to-br from-[#1b1c3a] via-[#141630] to-[#0e0f22] text-white border border-purple-500/20 shadow-xl relative overflow-hidden h-full">
      <CardContent className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-400" />
            Total Balance
          </h2>
          {change !== null && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 border ${
                change >= 0
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/30"
              }`}
            >
              {change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              {Math.abs(change)}%
            </span>
          )}
        </div>

        <div className="text-4xl font-black tracking-tight text-white">
          {formatAmount(currentBalance)}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#0e2a22] to-[#0a1a15] border border-emerald-500/20">
            <p className="text-[11px] text-emerald-300 font-medium">Monthly Income</p>
            <p className="text-base font-bold text-emerald-400 mt-0.5">{formatAmount(currentIncome)}</p>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-[#2a0e18] to-[#1a0a10] border border-rose-500/20">
            <p className="text-[11px] text-rose-300 font-medium">Monthly Expense</p>
            <p className="text-base font-bold text-rose-400 mt-0.5">{formatAmount(currentExpense)}</p>
          </div>
        </div>

        <div className="h-20 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="month" stroke="#8884d8" tick={{ fontSize: 11 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e213a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                labelStyle={{ color: "#c3c3c3" }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#c084fc"
                strokeWidth={3}
                dot={{
                  r: 4,
                  stroke: "#a855f7",
                  strokeWidth: 2,
                  fill: "#161b33"
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}