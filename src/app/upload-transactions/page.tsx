"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ExtractedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "CR" | "DR";
  classifiedAs: "Income" | "Expense";
}

export default function UploadTransactionsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<ExtractedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();

  const handleUpload = async () => {
    if (!file) return alert("Please select a file.");

    const formData = new FormData();
    formData.append("receipt", file);

    setLoading(true);
    try {
      const res = await fetch("/api/file-transaction", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("📦 Response from API:", data);
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions as ExtractedTransaction[]);
      } else {
        alert(data.error || "Failed to extract transactions.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const guessExpenseCategory = (desc: string = "") => {
    const d = desc.toLowerCase();
    if (d.includes("zomato") || d.includes("swiggy")) return "Food";
    if (d.includes("amazon") || d.includes("flipkart")) return "Shopping";
    if (d.includes("atm") || d.includes("withdrawal")) return "Cash";
    if (d.includes("rent")) return "Housing";
    if (d.includes("electricity") || d.includes("bill")) return "Utilities";
    return null;
  };

  const isValidDate = (d: unknown): boolean => {
    const date = new Date(d as string);
    return date instanceof Date && !isNaN(date.valueOf());
  };

  const handleSaveToFirebase = async () => {
    if (!user || transactions.length === 0) return;
    setSaving(true);

    try {
      for (const tx of transactions) {
        const entry = {
          amount: Math.abs(tx.amount),
          category:
            tx.classifiedAs === "Income"
              ? "Salary"
              : guessExpenseCategory(tx.description) || "Misc",
          date: isValidDate(tx.date) ? new Date(tx.date) : new Date(),
          createdAt: serverTimestamp(),
          userId: user.uid,
        };

        const collectionName =
          tx.classifiedAs.toLowerCase() === "income" ? "incomes" : "expenses";

        await addDoc(collection(db, collectionName), entry);
      }

      alert("✅ Transactions saved to Firebase!");
      setTransactions([]);
      setFile(null);
    } catch (err) {
      console.error("Firebase save error:", err);
      alert("Failed to save transactions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 text-center">
        <Card className="bg-[#161b33] shadow-lg border-none">
          <CardContent className="p-6">
            <h2 className="text-3xl font-bold text-white mb-2">📄 Upload Bank Statement</h2>
            <p className="text-muted-foreground text-base mb-6 text-purple-300">
              Upload a PDF, Excel, or CSV file and extract transactions using AI.
            </p>

            <div className="flex items-center justify-center gap-4 mb-6">
              <Input
                type="file"
                accept=".pdf,.xlsx,.xls,.csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full max-w-sm text-white file:text-white file:bg-[#1f2547] file:border-none"
              />
              <Button
                onClick={handleUpload}
                disabled={!file || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex items-center gap-2"
              >
                {loading ? "Extracting..." : "Upload"}
              </Button>
            </div>

            {transactions.length > 0 ? (
              <>
                <div className="bg-white rounded-xl shadow-md p-4 mb-4 text-left">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Extracted Transactions</h3>

                  {/* Summary */}
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>
                      💰 Total Income: ₹
                      {transactions
                        .filter((t) => t.classifiedAs === "Income")
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0)}
                    </span>
                    <span>
                      🧾 Total Expenses: ₹
                      {transactions
                        .filter((t) => t.classifiedAs === "Expense")
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0)}
                    </span>
                  </div>

                  {/* Table */}
                  <div className="max-h-[300px] overflow-auto rounded-lg">
                    <table className="w-full text-sm text-left border border-gray-200 rounded-md overflow-hidden">
                      <thead className="bg-gray-100 text-gray-700 font-medium sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2">📅 Date</th>
                          <th className="px-3 py-2">📌 Description</th>
                          <th className="px-3 py-2">💵 Amount</th>
                          <th className="px-3 py-2">🔁 Type</th>
                          <th className="px-3 py-2">🏷️ Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx, i) => (
                          <tr
                            key={i}
                            className="border-t hover:bg-gray-50 transition duration-150"
                          >
                            <td className="px-3 py-2">{tx.date}</td>
                            <td className="px-3 py-2">{tx.description}</td>
                            <td className="px-3 py-2 text-gray-900 font-semibold">
                              ₹{Math.abs(tx.amount)}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  tx.type === "CR"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {tx.type === "CR" ? "Credit" : "Debit"}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  tx.classifiedAs === "Income"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {tx.classifiedAs}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 text-right">
                    <Button
                      onClick={handleSaveToFirebase}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {saving ? "Saving..." : "💾 Save All to Database"}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground mt-6 text-purple-300">
                No transactions extracted yet. Upload a statement to begin.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
