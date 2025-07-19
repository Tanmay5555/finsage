"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CalendarIcon, IndianRupee, UploadCloud } from "lucide-react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AddIncomeForm() {
    const { user } = useAuth();
    const [amount, setAmount] = useState("");
    const [source, setSource] = useState("");
    const [customSource, setCustomSource] = useState("");
    const [showCustomSource, setShowCustomSource] = useState(false);
    const [date, setDate] = useState<Date | null>(new Date());
    const [loading, setLoading] = useState(false);

    const sourceOptions = [
        "Salary",
        "Freelancing",
        "Investments Return",
        "Business",
        "Gift",
        "Other",
    ];

    const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return toast.error("Please select a file");

        setLoading(true);

        const formData = new FormData();
        formData.append("receipt", file);

        try {
            const ocrRes = await fetch("/api/ocr", {
                method: "POST",
                body: formData,
            });

            const ocrData = await ocrRes.json();
            const extractedText = ocrData.text;

            if (!extractedText) {
                throw new Error("No text extracted from image");
            }

            const geminiRes = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: extractedText }),
            });

            const geminiData = await geminiRes.json();

            if (geminiData.amount) {
                setAmount(geminiData.amount.toString());
                toast.success("Income amount extracted");

                // Optional: try to set source based on text
                const lowerText = extractedText.toLowerCase();
                if (lowerText.includes("salary")) setSource("Salary");
                else if (lowerText.includes("freelance")) setSource("Freelancing");
                else if (lowerText.includes("gift")) setSource("Gift");
                else if (lowerText.includes("interest") || lowerText.includes("dividend")) setSource("Investments");
                else setSource("Other");

                setDate(new Date());
            } else {
                toast.error("Failed to extract amount from payslip");
            }
        } catch (err) {
            console.error("OCR/Gemini error:", err);
            toast.error("Error extracting info");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalSource = source === "Other" ? customSource : source;

        if (!amount || !finalSource || !date) {
            toast.error("All fields are required.");
            return;
        }

        try {
            await addDoc(collection(db, "incomes"), {
                amount: parseFloat(amount),
                source: finalSource,
                date: date.toISOString(),
                userId: user?.uid,
                createdAt: Timestamp.now(),
            });
            toast.success("Income added successfully");
            setAmount("");
            setSource("");
            setCustomSource("");
            setDate(new Date());
        } catch (err) {
            console.error("Error adding income:", err);
            toast.error("Failed to add income");
        }
    };

    return (
        <Card className="bg-[#161b33] text-white border-none">
            <CardHeader>
                <CardTitle className="text-white text-xl">Add New Income</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Upload Receipt */}
                    <div className="space-y-1">
                        <Label className="text-sm text-white">Upload Payslip / Income Proof</Label>
                        <Input type="file" accept="image/*" onChange={handleReceiptUpload} disabled={loading} className="text-white file:text-white file:bg-[#1f2547] file:border-none" />
                        {loading && <p className="text-sm text-muted-foreground">Extracting...</p>}
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
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-[#1f2547] border border-border text-white pl-10"
                            />
                            <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Source Dropdown */}
                    <div className="space-y-1">
                        <Label htmlFor="source" className="text-sm text-white">Source</Label>
                        <select
                            id="source"
                            value={source}
                            onChange={(e) => {
                                setSource(e.target.value);
                                setShowCustomSource(e.target.value === "Other");
                            }}
                            className="w-full bg-[#1f2547] text-white border border-border px-3 py-2 rounded"
                        >
                            <option value="">Select Source</option>
                            {sourceOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>

                        {/* If 'Other' selected, show input */}
                        {showCustomSource && (
                            <div className="space-y-1">
                                <Label htmlFor="customSource" className="text-sm text-white">Custom Source</Label>
                                <Input
                                    id="customSource"
                                    type="text"
                                    placeholder="Enter source"
                                    value={customSource}
                                    onChange={(e) => setCustomSource(e.target.value)}
                                    className="bg-[#1f2547] border border-border text-white"
                                />
                            </div>
                        )}
                    </div>


                    {/* Date Picker */}
                    <div className="space-y-1">
                        <Label htmlFor="date" className="text-sm text-white">
                            Date
                        </Label>
                        <div className="relative">
                            <DatePicker
                                selected={date}
                                onChange={(date) => setDate(date)}
                                className="bg-[#1f2547] text-white w-full py-2 px-3 rounded border border-border placeholder:text-muted-foreground pl-10"
                                placeholderText="Select a date"
                            />
                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-white pointer-events-none" />
                        </div>
                    </div>

                    <Button type="submit" className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                        Add Income
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
