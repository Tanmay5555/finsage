// import { NextRequest, NextResponse } from "next/server";
// import { writeFile } from "fs/promises";
// import { tmpdir } from "os";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";
// import * as xlsx from "xlsx";
// import pdfParse from "pdf-parse";

// // Gemini Prompt Logic
// const classifyWithGemini = async (text: string) => {
//   const prompt = `
// You are a personal finance assistant.

// Classify each line as a transaction with these fields:
// - date
// - description
// - amount
// - type ("Credit" or "Debit")
// - classifiedAs ("Income" or "Expense")

// If a line doesn't contain a transaction, skip it.
// Output a JSON array. Use today's date if no date is present.

// Example line: "Zomato -432 DR" → { "date": "...", "description": "Zomato", "amount": -432, "type": "Debit", "classifiedAs": "Expense" }

// TEXT:
// """${text}"""
// `;

//   const geminiRes = await fetch(
//     `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         contents: [{ role: "user", parts: [{ text: prompt }] }],
//       }),
//     }
//   );

//   const result = await geminiRes.json();
//   const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
//   try {
//     const parsed = JSON.parse(rawText);
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     return [];
//   }
// };

// export const dynamic = "force-dynamic";

// export async function POST(req: NextRequest) {
//   const formData = await req.formData();
//   const file = formData.get("receipt") as File;
//   if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

//   try {
//     const buffer = Buffer.from(await file.arrayBuffer());
//     const tempPath = path.join(tmpdir(), `${uuidv4()}-${file.name}`);
//     await writeFile(tempPath, buffer);

//     let extractedText = "";

//     if (file.name.endsWith(".pdf")) {
//       const data = await pdfParse(buffer);
//       extractedText = data.text;
//     } else if (
//       file.name.endsWith(".csv") ||
//       file.name.endsWith(".xlsx") ||
//       file.name.endsWith(".xls")
//     ) {
//       const workbook = xlsx.read(buffer, { type: "buffer" });
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       const json = xlsx.utils.sheet_to_csv(sheet);
//       extractedText = json;
//     } else {
//       return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
//     }

//     const transactions = await classifyWithGemini(extractedText);

//     return NextResponse.json({ transactions });
//   } catch (err) {
//     console.error("❌ file-transaction error:", err);
//     return NextResponse.json({ error: "Transaction extraction failed" }, { status: 500 });
//   }
// }

"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function UploadTransactionsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-10 text-center">
        <Card className="bg-[#161b33]">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-white mb-4">🚧 Upload Transactions</h2>
            <p className="text-muted-foreground text-lg">
              This feature is <span className="text-yellow-400 font-semibold">Work in Progress</span>.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Soon you'll be able to upload your PDF/Excel/CSV bank statements and automatically extract & classify all your transactions using AI.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
