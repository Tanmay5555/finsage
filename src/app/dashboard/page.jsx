"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import TotalBalanceCard from "@/components/dashboard/TotalBalanceCard";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import InsightSummaryCard from "@/components/dashboard/InsightSummaryCard";
import SpendingCategoryChart from "@/components/dashboard/SpendingCategoryChart";
import LatestTransactionsTable from "@/components/dashboard/LatestTransactionsTable";
import SavingsTrendChart from "@/components/dashboard/SavingsTrendChart";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { Sparkles, Calendar as CalendarIcon, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const generateYears = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function DashboardPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [userName, setUserName] = useState("User");

  const years = generateYears(2020, currentYear + 5);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "User");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6 text-white"
      >
        {/* Animated Welcome Banner */}
        <motion.div variants={cardVariants} className="relative overflow-hidden rounded-2xl glass-card p-6 border border-white/10 glow-purple">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32 text-purple-400" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-500/30 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
                AI-Powered Financial Insights
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                👋 Welcome back, <span className="gradient-text-purple">{userName}</span>!
              </h1>
              <p className="text-sm md:text-base text-gray-300 mt-1 max-w-2xl">
                Track your net income, control monthly spending, and build long-term savings with real-time AI assistance.
              </p>
            </div>

            {/* Filter Selector */}
            <div className="flex items-center gap-2 bg-[#12152d] px-4 py-2 rounded-xl border border-white/10 shadow-inner">
              <Filter className="w-4 h-4 text-purple-400" />
              <div className="flex items-center gap-1 text-sm font-medium">
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(val) => setSelectedMonth(Number(val))}
                >
                  <SelectTrigger className="px-2 py-1 bg-purple-600/20 border-purple-500/30 text-purple-300 font-semibold h-8 focus:ring-0 focus:outline-none rounded-lg hover:bg-purple-600/30">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#191d3d] text-white border border-white/10 shadow-xl">
                    {MONTHS.map((month, idx) => (
                      <SelectItem key={month} value={idx.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedYear.toString()}
                  onValueChange={(val) => setSelectedYear(Number(val))}
                >
                  <SelectTrigger className="px-2 py-1 bg-purple-600/20 border-purple-500/30 text-purple-300 font-semibold h-8 focus:ring-0 focus:outline-none rounded-lg hover:bg-purple-600/30">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#191d3d] text-white border border-white/10 shadow-xl">
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Top Row Metrics */}
        <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="glass-card-hover rounded-2xl overflow-hidden">
            <TotalBalanceCard month={selectedMonth} year={selectedYear} />
          </motion.div>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="glass-card-hover rounded-2xl overflow-hidden">
            <IncomeExpenseChart year={selectedYear} />
          </motion.div>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="glass-card-hover rounded-2xl overflow-hidden">
            <InsightSummaryCard month={selectedMonth} year={selectedYear} />
          </motion.div>
        </motion.div>

        {/* Middle Row Charts */}
        <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="glass-card-hover rounded-2xl overflow-hidden">
            <SpendingCategoryChart month={selectedMonth} year={selectedYear} />
          </motion.div>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="glass-card-hover rounded-2xl overflow-hidden">
            <LatestTransactionsTable month={selectedMonth} year={selectedYear} />
          </motion.div>
        </motion.div>

        {/* Bottom Trend Chart */}
        <motion.div variants={cardVariants} className="grid grid-cols-1 gap-6">
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="glass-card-hover rounded-2xl overflow-hidden">
            <SavingsTrendChart year={selectedYear} />
          </motion.div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}