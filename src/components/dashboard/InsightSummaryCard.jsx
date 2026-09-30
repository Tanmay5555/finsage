"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BadgeCheck, Lightbulb, TrendingUp, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function InsightSummaryCard({ month, year }) {
  const { user } = useAuth();

  const [insightPoints, setInsightPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const monthName = new Date(year, month).toLocaleString("default", {
    month: "long"
  });

  useEffect(() => {
    if (!user) return;

    const fetchInsight = async () => {
      setLoading(true);
      setInsightPoints([]);
      setError(null);

      let totalIncome = 0;
      let totalExpense = 0;

      try {
        const incomeQuery = query(
          collection(db, "incomes"),
          where("userId", "==", user.uid)
        );
        const incomeSnap = await getDocs(incomeQuery);
        incomeSnap.forEach((doc) => {
          const d = doc.data();
          const rawDate = d.date;

          let dt = null;
          if (rawDate?.seconds) dt = new Date(rawDate.seconds * 1000);
          else if (typeof rawDate === "string") dt = new Date(rawDate);
          else if (rawDate instanceof Date) dt = rawDate;

          if (
            dt &&
            dt.getFullYear() === year &&
            dt.getMonth() === month &&
            typeof d.amount === "number"
          ) {
            totalIncome += d.amount;
          }
        });

        const expenseQuery = query(
          collection(db, "expenses"),
          where("userId", "==", user.uid)
        );
        const expenseSnap = await getDocs(expenseQuery);
        expenseSnap.forEach((doc) => {
          const d = doc.data();
          const rawDate = d.date;

          let dt = null;
          if (rawDate?.seconds) dt = new Date(rawDate.seconds * 1000);
          else if (typeof rawDate === "string") dt = new Date(rawDate);
          else if (rawDate instanceof Date) dt = rawDate;

          if (
            dt &&
            dt.getFullYear() === year &&
            dt.getMonth() === month &&
            typeof d.amount === "number"
          ) {
            totalExpense += d.amount;
          }
        });

        const savings = totalIncome - totalExpense;

        const prompt = `
You are a helpful AI financial assistant.

Analyze this user's monthly finance summary and return exactly 2–3 concise bullet points:
* One insight about income
* One insight about spending
* One improvement tip (optional)

Respond ONLY with bullet points in markdown format using "*".

Month: ${monthName} ${year}
Total Income: ₹${totalIncome.toFixed(2)}
Total Expense: ₹${totalExpense.toFixed(2)}
Savings: ₹${savings.toFixed(2)}
        `.trim();

        const res = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: prompt })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error("API Error:", errData);
          throw new Error(String(errData.message || errData.error || "Unknown Gemini error"));
        }

        const data = await res.json();
        const content = data?.content?.trim();

        if (!content) {
          setError("No insight returned from Gemini.");
          return;
        }

        const bullets = content
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .map((line) => line.replace(/^[\*\-\•\d+\.]+\s*/, "").trim())
          .filter((line) => line.length > 0);

        setInsightPoints(bullets.slice(0, 3));
      } catch (err) {
        console.error("Insight fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to analyze your data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [month, year, user, monthName]);

  const iconMap = [
    <Lightbulb key="income" className="text-yellow-300 w-5 h-5 mt-1 shrink-0 animate-pulse" />,
    <BadgeCheck key="spending" className="text-teal-300 w-5 h-5 mt-1 shrink-0" />,
    <TrendingUp key="tip" className="text-purple-300 w-5 h-5 mt-1 shrink-0" />
  ];

  return (
    <Card className="bg-gradient-to-br from-[#1f1938] via-[#161a36] to-[#0f1126] text-white h-full min-h-[250px] border border-purple-500/20 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="w-24 h-24 text-purple-400" />
      </div>

      <CardContent className="p-5 flex flex-col gap-4 relative z-10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="gradient-text-purple">AI Financial Insights</span>
          </h2>
          <span className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/30">
            {monthName} {year}
          </span>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-purple-300">
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-medium animate-pulse">Analyzing financial data with Gemini AI...</p>
          </div>
        )}

        {error && (
          <p className="text-rose-400 text-center text-sm py-6 bg-rose-500/10 rounded-xl border border-rose-500/20 p-3">{error}</p>
        )}

        {!loading && !error && insightPoints.length > 0 && (
          <div className="flex flex-col gap-3">
            {insightPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition">
                {iconMap[idx]}
                <p className="text-gray-200 leading-relaxed">
                  <span className="font-semibold text-white">
                    {idx === 0
                      ? "Income Insight: "
                      : idx === 1
                      ? "Spending Insight: "
                      : "Improvement Tip: "}
                  </span>
                  {point}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && insightPoints.length === 0 && (
          <p className="text-gray-400 text-center py-6 text-sm">
            No insights available yet. Add transactions to generate AI advice!
          </p>
        )}
      </CardContent>
    </Card>
  );
}