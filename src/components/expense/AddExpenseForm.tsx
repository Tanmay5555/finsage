"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CalendarIcon, IndianRupee } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AddExpenseForm() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const categoryOptions = [
    "Groceries",
    "Food",
    "Travel",
    "Rent",
    "Shopping",
    "Bills",
    "Medical",
    "Entertainment",
    "Misc",
    "Other",
  ];

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const ocrRes = await fetch("/api/ocr", { method: "POST", body: formData });
      const ocrData = await ocrRes.json();
      const extractedText = ocrData?.text;
      if (!extractedText) throw new Error("No text extracted");

      const geminiRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText }),
      });

      const geminiData = await geminiRes.json();
      if (!geminiData?.amount) {
        toast.error("Failed to extract amount from receipt");
        return;
      }

      setAmount(String(geminiData.amount));
      setDate(new Date());

      const lowerText = extractedText.toLowerCase();
      if (lowerText.includes("grocery") || lowerText.includes("supermarket")) setCategory("Groceries");
      else if (lowerText.includes("rent")) setCategory("Rent");
      else if (lowerText.includes("travel") || lowerText.includes("uber") || lowerText.includes("ola")) setCategory("Travel");
      else if (lowerText.includes("food") || lowerText.includes("restaurant")) setCategory("Food");
      else if (lowerText.includes("shopping")) setCategory("Shopping");
      else setCategory("Misc");

      toast.success("Expense details extracted successfully");
    } catch (err) {
      console.error("Auto extraction failed:", err);
      toast.error("Auto extraction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === "Other" || category === "Misc" ? customCategory : category;

    if (!amount || !finalCategory || !date) {
      toast.error("All fields are required.");
      return;
    }

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      await addDoc(collection(db, "expenses"), {
        amount: parseFloat(amount),
        category: finalCategory,
        date: date.toISOString(),
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      toast.success("Expense added successfully");
      setAmount("");
      setCategory("");
      setCustomCategory("");
      setDate(new Date());
    } catch (err) {
      console.error("Error adding expense:", err);
      toast.error("Failed to add expense");
    }
  };

  return (
    <Card className="bg-[#161b33] text-white border-none">
      <CardHeader>
        <CardTitle className="text-white text-xl">Add New Expense</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Upload Receipt */}
          <div className="space-y-1">
            <Label className="text-sm text-white">Upload Receipt (Optional)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleReceiptUpload}
              disabled={loading}
              className="text-white file:text-white file:bg-[#1f2547] file:border-none"
            />
            {loading && <p className="text-sm text-muted-foreground">Extracting...</p>}
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label htmlFor="amount" className="text-sm text-white">Amount (₹)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-[#1f2547] border border-border text-white pl-10"
              />
              <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400 pointer-events-none" />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1">
            <Label htmlFor="category" className="text-sm text-white">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#1f2547] border border-border text-white w-full py-2 px-3 rounded"
            >
              <option value="">Select category</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Custom Category if "Other" or "Misc" */}
          {(category === "Other" || category === "Misc") && (
            <div className="space-y-1">
              <Label htmlFor="customCategory" className="text-sm text-white">Custom Category</Label>
              <Input
                id="customCategory"
                type="text"
                placeholder="Enter category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="bg-[#1f2547] border border-border text-white"
              />
            </div>
          )}

          {/* Date Picker */}
          <div className="space-y-1">
            <Label htmlFor="date" className="text-sm text-white">Date</Label>
            <div className="relative">
              <DatePicker
                selected={date}
                onChange={(d) => setDate(d)}
                placeholderText="Select a date"
                className="bg-[#1f2547] text-white w-full py-2 px-3 rounded border border-border placeholder:text-muted-foreground pl-10"
              />
              <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-pink-400 pointer-events-none" />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full mt-2 bg-pink-600 hover:bg-pink-700 text-white"
          >
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
