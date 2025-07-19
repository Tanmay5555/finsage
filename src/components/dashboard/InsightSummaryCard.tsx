import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BadgeCheck, Lightbulb, TrendingUp } from "lucide-react";

interface Props {
  month: number;
  year: number;
}

export default function InsightSummaryCard({ month, year }: Props) {
  const [insightPoints, setInsightPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      setInsightPoints([]);
      setError(null);

      let totalIncome = 0;
      let totalExpense = 0;

      try {
        const incomeSnap = await getDocs(collection(db, "incomes"));
        incomeSnap.forEach(doc => {
          const d = doc.data();
          let dt: Date;
          if (d.date instanceof Date) dt = d.date;
          else if (d.date?.seconds) dt = new Date(d.date.seconds * 1000);
          else if (typeof d.date === 'string') dt = new Date(d.date);
          else return;

          if (dt.getFullYear() === year && dt.getMonth() === month) {
            totalIncome += d.amount || 0;
          }
        });

        const expenseSnap = await getDocs(collection(db, "expenses"));
        expenseSnap.forEach(doc => {
          const d = doc.data();
          let dt: Date;
          if (d.date instanceof Date) dt = d.date;
          else if (d.date?.seconds) dt = new Date(d.date.seconds * 1000);
          else if (typeof d.date === 'string') dt = new Date(d.date);
          else return;

          if (dt.getFullYear() === year && dt.getMonth() === month) {
            totalExpense += d.amount || 0;
          }
        });

        const savings = totalIncome - totalExpense;

        const prompt = `
You are a helpful AI financial assistant.

Analyze this user's monthly finance summary and return exactly 2-3 concise bullet points:
- One insight about income
- One insight about spending
- One tip to improve (optional)

Respond ONLY with bullet points in markdown format (using '*').

Month: ${monthName} ${year}
Total Income: ₹${totalIncome.toFixed(2)}
Total Expense: ₹${totalExpense.toFixed(2)}
Savings: ₹${savings.toFixed(2)}
`;

        const response = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: prompt }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(`Gemini API route error: ${errData.error || "Unknown error"}`);
        }

        const result = await response.json();
        const markdownText = result?.content?.trim();

        if (markdownText) {
          const bullets = markdownText
            .split("\n")
            .filter((line: string) => line.trim().startsWith("*"))
            .map((line: string) => line.replace(/^\*\s*/, "").trim());

          setInsightPoints(bullets.slice(0, 3));
        } else {
          setError("No insight returned from Gemini.");
        }

      } catch (err) {
        console.error("❌ Insight fetch error:", err);
        setError("Failed to analyze your data. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [month, year]);

  const iconMap = [
    <Lightbulb key="income" className="text-yellow-300 w-5 h-5 mt-1" />,
    <BadgeCheck key="spending" className="text-teal-300 w-5 h-5 mt-1" />,
    <TrendingUp key="tip" className="text-purple-300 w-5 h-5 mt-1" />,
  ];

  return (
    <Card className="bg-[#161b33] text-white h-full min-h-[250px]">
      <CardContent className="p-5 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white">📘 AI Financial Insights</h2>
        <p className="text-sm text-muted-foreground mb-1">
          For <span className="text-white font-medium">{monthName} {year}</span>
        </p>

        {loading && (
          <p className="text-blue-200 text-center text-base py-6">
            ⏳ Analyzing your financial data with Gemini...
          </p>
        )}

        {error && (
          <p className="text-red-400 text-center text-base py-6">{error}</p>
        )}

        {!loading && !error && insightPoints.length > 0 && (
          <div className="flex flex-col gap-4">
            {insightPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3 text-base leading-relaxed">
                {iconMap[idx] || <BadgeCheck className="text-green-300 w-10 h-10 mt-1" />}
                <p className="text-blue-100">
                  <span className="font-semibold text-white">
                    {idx === 0 ? "Income Insight: " : idx === 1 ? "Spending Insight: " : "Improvement Tip: "}
                  </span>
                  {point}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && insightPoints.length === 0 && (
          <p className="text-gray-400 text-center py-6">
            No insights available yet. Add some transactions to get started!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
