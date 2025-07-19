"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Download,Sparkles, Brain } from "lucide-react";
import * as XLSX from "xlsx";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";

export default function StatisticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [aiInsight, setAIInsight] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightVisible, setInsightVisible] = useState(false);

  const fetchStats = async () => {
    if (!dateRange) return;
    setLoading(true);
    setInsightVisible(true);
    setLoadingInsight(true);

    try {
      const res = await fetch(`/api/stats/summary?from=${dateRange.from?.toISOString()}&to=${dateRange.to?.toISOString()}`);
      const data = await res.json();
      setStats(data);

      const aiRes = await fetch("/api/stats/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const aiData = await aiRes.json();
      setAIInsight(aiData?.insights || "");
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setLoading(false);
      setLoadingInsight(false);
    }
  };

  const exportToExcel = () => {
    if (!stats) return;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([
      { Label: "Total Income", Amount: stats.totalIncome },
      { Label: "Total Expense", Amount: stats.totalExpense },
      { Label: "Savings", Amount: stats.totalIncome - stats.totalExpense },
      ...Object.entries(stats.categoryTotals || {}).map(([category, value]) => ({ Label: category, Amount: value }))
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Statistics");
    XLSX.writeFile(wb, "finsage-statistics.xlsx");
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-4xl font-bold mb-2">Financial Statistics</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Select a date range to view financial summary and AI-powered insights.
        </p>

        <div className="flex items-center gap-4 mb-6">
          <DateRangePicker date={dateRange} setDate={setDateRange} />
          <Button onClick={fetchStats} disabled={!dateRange || loading}>
            View Statistics
          </Button>
          <Button variant="outline" onClick={exportToExcel} disabled={!stats}>
            <Download className="w-4 h-4 mr-2" /> Export XLSX
          </Button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-[#161b33]">
              <CardContent className="p-4">
                <h4 className="text-sm text-muted-foreground text-white">Total Income</h4>
                <p className="text-2xl font-bold text-green-400">₹{stats.totalIncome}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#161b33]">
              <CardContent className="p-4">
                <h4 className="text-sm text-muted-foreground text-white">Total Expense</h4>
                <p className="text-2xl font-bold text-red-400">₹{stats.totalExpense}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#161b33]">
              <CardContent className="p-4">
                <h4 className="text-sm text-muted-foreground text-white">Net Savings</h4>
                <p className="text-2xl font-bold text-yellow-300">
                  ₹{stats.totalIncome - stats.totalExpense}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {stats?.categoryTotals && Object.keys(stats.categoryTotals).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(stats.categoryTotals).map(([category, value], idx) => (
              <Card key={idx} className="bg-[#1e2746]">
                <CardContent className="p-4">
                  <h4 className="text-sm text-muted-foreground text-purple-400">{category}</h4>
                  <p className="text-lg font-semibold text-white">₹{Number(value)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {insightVisible && (
          <Card className="bg-[#161b33] border border-dashed border-blue-500">
            <CardContent className="p-6">
            <CardTitle className="flex items-center gap-2 text-white mb-6">
                <Brain size={20} className="text-purple-400" /> Finsage AI Insights:
              </CardTitle>
              <div className="text-sm space-y-2">
                {loadingInsight ? (
                  <p className="text-blue-200">⏳ Generating insights based on your financial data...</p>
                ) : aiInsight ? (
                  aiInsight.split(/\n+/).map((line, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                     <Sparkles size={16} className="text-yellow-400 flex-shrink-0 mt-[2px]" />
                      <p className="text-emerald-300">{line.trim()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-red-300">⚠️ No insights available.</p>
                )}
              </div>

            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
