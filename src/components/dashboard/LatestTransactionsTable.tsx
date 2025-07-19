"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore"; // Import Timestamp for type safety

interface LatestTransactionsTableProps {
  month: number;
  year: number;
}

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: string;
  date: Date;
}

export default function LatestTransactionsTable({ month, year }: LatestTransactionsTableProps) {
  const [transactionsToDisplay, setTransactionsToDisplay] = useState<Transaction[]>([]);
  const [allMonthlyTransactions, setAllMonthlyTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedMonthName = new Date(year, month).toLocaleString("default", { month: "long" });

  useEffect(() => {
    // Define a more specific type for raw, including Timestamp from Firestore
    const parseDate = (raw: Timestamp | string | Date | undefined | null): Date | null => {
      if (!raw) return null;
      if (raw instanceof Timestamp) return raw.toDate(); // Convert Firestore Timestamp to Date
      if (typeof raw === "string") return new Date(raw);
      if (raw instanceof Date) return raw;
      return null;
    };

    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      const transactions: Transaction[] = [];

      try {
        const incomeSnap = await getDocs(collection(db, "incomes"));
        incomeSnap.forEach((doc) => {
          const d = doc.data();
          const dt = parseDate(d.date);
          if (dt && dt.getFullYear() === year && dt.getMonth() === month && typeof d.amount === "number") {
            transactions.push({
              id: doc.id,
              title: d.title || "Income",
              amount: d.amount,
              type: "Income",
              date: dt,
            });
          }
        });

        const expenseSnap = await getDocs(collection(db, "expenses"));
        expenseSnap.forEach((doc) => {
          const d = doc.data();
          const dt = parseDate(d.date);
          if (dt && dt.getFullYear() === year && dt.getMonth() === month && typeof d.amount === "number") {
            transactions.push({
              id: doc.id,
              title: d.title || "Expense",
              amount: -d.amount,
              type: d.category || "Expense",
              date: dt,
            });
          }
        });

        transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

        setAllMonthlyTransactions(transactions);
        setTransactionsToDisplay(transactions.slice(0, 50));
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [month, year]);

  const formatDate = (date: Date): string =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleDownloadStatement = () => {
    if (allMonthlyTransactions.length === 0) return;

    const csvHeader = "Date,Title,Type,Amount\n";
    const csvRows = allMonthlyTransactions
      .map((txn) => {
        const date = formatDate(txn.date);
        const title = `"${txn.title.replace(/"/g, '""')}"`;
        const type = `"${txn.type.replace(/"/g, '""')}"`;
        const amount = txn.amount.toFixed(2);
        return `${date},${title},${type},${amount}`;
      })
      .join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Statement_${selectedMonthName}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-[#161b33] text-white">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Latest Transactions</h2>
          <Button
            onClick={handleDownloadStatement}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex items-center gap-2"
            disabled={loading || allMonthlyTransactions.length === 0}
          >
            <Download size={16} />
            Download Statement
          </Button>
        </div>

        <p className="text-sm mb-4 text-muted-foreground">
          For {selectedMonthName}, {year}
        </p>

        {loading ? (
          <div className="h-60 flex items-center justify-center text-gray-400">
            Loading transactions...
          </div>
        ) : error ? (
          <div className="h-60 flex items-center justify-center text-red-400">{error}</div>
        ) : transactionsToDisplay.length > 0 ? (
          <ScrollArea className="h-60 pr-6">
            <ul className="space-y-4">
              {transactionsToDisplay.map((txn) => (
                <li
                  key={txn.id}
                  className="flex items-center justify-between border-b border-white/10 pb-2"
                >
                  <div>
                    <p className="font-medium">{txn.title}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(txn.date)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        txn.amount > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {txn.amount > 0 ? "+" : ""}₹{Math.abs(txn.amount).toFixed(2)}
                    </p>
                    <Badge
                      variant="secondary"
                      className="mt-1 bg-gray-700 text-gray-200 hover:bg-gray-600"
                    >
                      {txn.type}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <div className="h-60 flex items-center justify-center text-gray-400">
            No transactions found for {selectedMonthName}, {year}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
