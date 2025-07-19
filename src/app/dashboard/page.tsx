"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import TotalBalanceCard from "@/components/dashboard/TotalBalanceCard";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import InsightSummaryCard from "@/components/dashboard/InsightSummaryCard";
import SpendingCategoryChart from "@/components/dashboard/SpendingCategoryChart";
import LatestTransactionsTable from "@/components/dashboard/LatestTransactionsTable";

// Shadcn UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import SavingsTrendChart from "@/components/dashboard/SavingsTrendChart";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Helper to generate years, adjust as needed
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

  const years = generateYears(2020, currentYear + 5); // Example: Years from 2020 to 5 years in the future

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 text-foreground">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Hi Sakshi, here are your financial stats
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select
            value={selectedMonth.toString()} // Shadcn Select expects string value
            onValueChange={(value) => setSelectedMonth(Number(value))}
          >
            <SelectTrigger className="w-[180px] bg-[#1f2547] text-white border-none">
              <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent className="bg-[#1f2547] text-white border-none">
              {months.map((m, i) => (
                <SelectItem key={m} value={i.toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Option 1: Using Shadcn Select for year (recommended for controlled input) */}
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(Number(value))}
          >
            <SelectTrigger className="w-[120px] bg-[#1f2547] text-white border-none">
              <SelectValue placeholder="Select a year" />
            </SelectTrigger>
            <SelectContent className="bg-[#1f2547] text-white border-none">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Option 2: Using Shadcn Input for year (if you prefer free typing)
          <Input
            type="number"
            min="2020"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-[120px] bg-[#1f2547] text-white border-none"
            placeholder="Year"
          />
          */}
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
          <SavingsTrendChart year={selectedYear}/>
        </div>
      </div>
    </DashboardLayout>
  );
}