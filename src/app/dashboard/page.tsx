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

// Shadcn UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const generateYears = (startYear: number, endYear: number) => {
  const years = [];
  for (let i = startYear; i <= endYear; i++) {
    years.push(i);
  }
  return years;
};

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [userName, setUserName] = useState<string>("User");

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
      <div className="flex flex-col gap-6 text-foreground">
        {/* Header */}

        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          👋 Welcome back, {userName}!
        </h1>
        <p className="text-base md:text-lg text-black-200">
          Welcome to <span className="font-semibold text-purple-300">Finsage</span>, your personal finance assistant. Track your income, control your spending, and build your savings — all in one place.
        </p>

        {/* Filters - Inline Dropdowns */}
        <div className="text-base md:text-lg text-black mt-2 flex flex-wrap items-center gap-1">
        <span>Showing insights and trends for Month</span>

          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(Number(value))}
          >
            <SelectTrigger className="underline underline-offset-4 px-1 py-0 bg-transparent border-none text-purple-400 font-medium h-auto min-w-0 w-auto focus:ring-0 focus:outline-none hover:text-purple-800">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="bg-[#1f2547] text-white border border-white/10 shadow-lg">
              {months.map((m, i) => (
                <SelectItem key={m} value={i.toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span>, Year</span>

          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(Number(value))}
          >
            <SelectTrigger className="underline underline-offset-4 px-1 py-0 bg-transparent border-none text-purple-400 font-medium h-auto min-w-0 w-auto focus:ring-0 focus:outline-none hover:text-purple-800">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-[#1f2547] text-white border border-white/10 shadow-lg">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>


        {/* Grid Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TotalBalanceCard month={selectedMonth} year={selectedYear} />
          <IncomeExpenseChart month={selectedMonth} year={selectedYear} />
          <InsightSummaryCard month={selectedMonth} year={selectedYear} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SpendingCategoryChart month={selectedMonth} year={selectedYear} />
          <LatestTransactionsTable month={selectedMonth} year={selectedYear} />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <SavingsTrendChart year={selectedYear} />
        </div>
      </div>
    </DashboardLayout>
  );
}