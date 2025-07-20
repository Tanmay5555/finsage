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

interface AddExpenseFormProps {
  onAdded?: () => void;
}

const CATEGORY_OPTIONS = [
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
] as const;

/* ---------- Helpers ---------- */

function autoDetectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/(grocery|supermarket|mart)/.test(lower)) return "Groceries";
  if (/(restaurant|food|cafe|dine)/.test(lower)) return "Food";
  if (/(uber|ola|travel|taxi|flight|train|bus)/.test(lower)) return "Travel";
  if (/rent/.test(lower)) return "Rent";
  if (/shopping|store|mall/.test(lower)) return "Shopping";
  if (/medical|pharma|hospital|clinic/.test(lower)) return "Medical";
  if (/bill|electricity|water|utility|internet/.test(lower)) return "Bills";
  if (/movie|entertainment|netflix|spotify|show/.test(lower)) return "Entertainment";
  return "Misc";
}

function normalizeAmountString(raw: string): string {
  return raw.replace(/(?<=\d),(?=\d)/g, "").trim();
}

async function safeJson<T = unknown>(res: Response): Promise<T | null> {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/* ---------- Component ---------- */

export default function AddExpenseForm({ onAdded }: AddExpenseFormProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showCustomCategory = category === "Other" || category === "Misc";

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoadingOCR(true);
    setCategory("");
    setCustomCategory("");

    const formData = new FormData();
    formData.append("receipt", file);

    try {
      // OCR Call
      const ocrRes = await fetch("/api/ocr", { method: "POST", body: formData });
      if (!ocrRes.ok) {
        const txt = await ocrRes.text();
        console.error("OCR error:", ocrRes.status, txt);
        toast.error("OCR failed");
        return;
      }
      const ocrData = await safeJson<{ text?: string }>(ocrRes);
      const extractedText = ocrData?.text;

      if (!extractedText || !extractedText.trim()) {
        toast.error("No text found in receipt");
        return;
      }

      // Gemini Call
      const geminiRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText }),
      });

      if (!geminiRes.ok) {
        const txt = await geminiRes.text();
        console.warn("Gemini API non-OK:", geminiRes.status, txt);
        toast.warning("Could not auto-extract amount. Please enter manually.");
      } else {
        const geminiData = await safeJson<{ amount?: number }>(geminiRes);
        if (geminiData?.amount) {
          setAmount(normalizeAmountString(String(geminiData.amount)));
        } else {
          toast.warning("Amount not detected. Enter manually.");
        }
      }

      // Auto category + date
      setDate(new Date());
      setCategory(autoDetectCategory(extractedText));
      toast.success("Receipt processed");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Auto extraction failed:", message);
      toast.error("Auto extraction failed");
    } finally {
      setLoadingOCR(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory =
      showCustomCategory ? customCategory.trim() : category;

    if (!amount || !finalCategory || !date) {
      toast.error("All fields are required.");
      return;
    }

    if (showCustomCategory && !customCategory.trim()) {
      toast.error("Please enter a custom category.");
      return;
    }

    const numeric = Number.parseFloat(normalizeAmountString(amount));
    if (Number.isNaN(numeric) || numeric <= 0) {
      toast.error("Enter a valid amount > 0");
      return;
    }

    if (!user) {
      toast.error("You must be logged in.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "expenses"), {
        amount: numeric,
        category: finalCategory,
        date: date.toISOString(),
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      toast.success("Expense added");
      setAmount("");
      setCategory("");
      setCustomCategory("");
      setDate(new Date());
      onAdded?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Error adding expense:", message);
      toast.error("Failed to add expense");
    } finally {
      setSubmitting(false);
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
              accept="image/*,application/pdf"
              onChange={handleReceiptUpload}
              disabled={loadingOCR || submitting}
              className="text-white file:text-white file:bg-[#1f2547] file:border-none"
            />
            {loadingOCR && (
              <p className="text-sm text-indigo-300 animate-pulse">
                Extracting data...
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label htmlFor="amount" className="text-sm text-white">
              Amount (₹)
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={submitting}
                className="bg-[#1f2547] border border-border text-white pl-10"
              />
              <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400 pointer-events-none" />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label htmlFor="category" className="text-sm text-white">
              Category
            </Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={submitting}
              className="bg-[#1f2547] border border-border text-white w-full py-2 px-3 rounded"
            >
              <option value="">Select category</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Custom Category */}
          {showCustomCategory && (
            <div className="space-y-1">
              <Label htmlFor="customCategory" className="text-sm text-white">
                Custom Category
              </Label>
              <Input
                id="customCategory"
                type="text"
                placeholder="Enter category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                disabled={submitting}
                className="bg-[#1f2547] border border-border text-white"
              />
            </div>
          )}

          {/* Date */}
          <div className="space-y-1">
            <Label htmlFor="date" className="text-sm text-white">
              Date
            </Label>
            <div className="relative">
              <DatePicker
                selected={date}
                onChange={(d) => setDate(d)}
                placeholderText="Select a date"
                className="bg-[#1f2547] text-white w-full py-2 px-3 rounded border border-border placeholder:text-muted-foreground pl-10"
                disabled={submitting}
              />
              <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-pink-400 pointer-events-none" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || loadingOCR}
            className="w-full mt-2 bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-70"
          >
            {submitting ? "Saving..." : "Add Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
