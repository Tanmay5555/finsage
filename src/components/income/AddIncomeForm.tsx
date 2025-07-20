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

interface AddIncomeFormProps {
  onAdded?: () => void;
}

const SOURCE_OPTIONS = [
  "Salary",
  "Freelancing",
  "Investments Return",
  "Business",
  "Gift",
  "Other",
] as const;

/* ---------- Helpers ---------- */

function normalizeAmountString(raw: string): string {
  return raw.replace(/(?<=\d),(?=\d)/g, "").trim();
}

function autoDetectSource(text: string): string {
  const lower = text.toLowerCase();
  if (/(salary|payslip|ctc|net pay)/.test(lower)) return "Salary";
  if (/(freelance|contract|gig)/.test(lower)) return "Freelancing";
  if (/(dividend|interest|roi|return|capital gain)/.test(lower)) return "Investments Return";
  if (/(business|invoice|sales|revenue)/.test(lower)) return "Business";
  if (/(gift|present|donation)/.test(lower)) return "Gift";
  return "Other";
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

export default function AddIncomeForm({ onAdded }: AddIncomeFormProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [customSource, setCustomSource] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showCustomSource = source === "Other";

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoadingOCR(true);
    try {
      const formData = new FormData();
      formData.append("receipt", file);

      // OCR
      const ocrRes = await fetch("/api/ocr", { method: "POST", body: formData });
      if (!ocrRes.ok) {
        const txt = await ocrRes.text();
        console.error("OCR failed:", ocrRes.status, txt);
        toast.error("OCR failed");
        return;
      }
      const ocrData = await safeJson<{ text?: string }>(ocrRes);
      const extractedText = ocrData?.text;

      if (!extractedText || !extractedText.trim()) {
        toast.error("No text detected in document");
        return;
      }

      // Gemini
      const geminiRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText }),
      });

      if (!geminiRes.ok) {
        const txt = await geminiRes.text();
        console.warn("Gemini non-OK:", geminiRes.status, txt);
        toast.warning("Could not auto-extract amount. Enter manually.");
      } else {
        const geminiData = await safeJson<{ amount?: number }>(geminiRes);
        if (geminiData?.amount) {
          setAmount(normalizeAmountString(String(geminiData.amount)));
          toast.success("Income amount extracted");
        } else {
          toast.warning("Amount not detected. Enter manually.");
        }
      }

      setSource(autoDetectSource(extractedText));
      setDate(new Date());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("OCR/Gemini error:", message);
      toast.error("Auto extraction failed");
    } finally {
      setLoadingOCR(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalSource = showCustomSource ? customSource.trim() : source;

    if (!amount || !finalSource || !date) {
      toast.error("All fields are required.");
      return;
    }

    if (showCustomSource && !customSource.trim()) {
      toast.error("Enter a custom source.");
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
      await addDoc(collection(db, "incomes"), {
        amount: numeric,
        source: finalSource,
        date: date.toISOString(),
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      toast.success("Income added");
      setAmount("");
      setSource("");
      setCustomSource("");
      setDate(new Date());
      onAdded?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Firestore error:", message);
      toast.error("Failed to add income");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-[#161b33] text-white border-none">
      <CardHeader>
        <CardTitle className="text-white text-xl">Add New Income</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Upload */}
          <div className="space-y-1">
            <Label className="text-sm text-white">
              Upload Payslip / Income Proof (Optional)
            </Label>
            <Input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleReceiptUpload}
              disabled={loadingOCR || submitting}
              className="text-white file:text-white file:bg-[#1f2547] file:border-none"
            />
            {loadingOCR && (
              <p className="text-sm text-indigo-300 animate-pulse">
                Extracting details...
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
                className="bg-[#1f2547] border text-white pl-10"
              />
              <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400 pointer-events-none" />
            </div>
          </div>

          {/* Source */}
          <div className="space-y-1">
            <Label htmlFor="source" className="text-sm text-white">
              Source
            </Label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={submitting}
              className="w-full bg-[#1f2547] text-white border px-3 py-2 rounded"
            >
              <option value="">Select Source</option>
              {SOURCE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            {showCustomSource && (
              <div className="space-y-1 mt-2">
                <Label htmlFor="customSource" className="text-sm text-white">
                  Custom Source
                </Label>
                <Input
                  id="customSource"
                  value={customSource}
                  onChange={(e) => setCustomSource(e.target.value)}
                  placeholder="Enter source"
                  disabled={submitting}
                  className="bg-[#1f2547] border text-white"
                />
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label htmlFor="date" className="text-sm text-white">
              Date
            </Label>
            <div className="relative">
              <DatePicker
                selected={date}
                onChange={(d) => setDate(d)}
                className="bg-[#1f2547] text-white w-full py-2 px-3 rounded border pl-10"
                placeholderText="Select a date"
                disabled={submitting}
              />
              <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-pink-400 pointer-events-none" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || loadingOCR}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-70"
          >
            {submitting ? "Saving..." : "Add Income"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
