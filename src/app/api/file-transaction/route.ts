import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import * as xlsx from "xlsx";

// Gemini Prompt Logic
const classifyWithGemini = async (text: string) => {
  const prompt = `
You are a personal finance assistant.

Classify each line as a transaction with these fields:
- date
- description
- amount
- type ("Credit" or "Debit")
- classifiedAs ("Income" or "Expense")

If a line doesn't contain a transaction, skip it.
Output a JSON array. Use today's date if no date is present.

TEXT:
"""${text}"""
`;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    }
  );

  const result = await geminiRes.json();
  const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  try {
    return JSON.parse(rawText);
  } catch {
    return [];
  }
};

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("receipt") as File;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempPath = path.join(tmpdir(), `${uuidv4()}-${file.name}`);
    await writeFile(tempPath, buffer);

    let extractedText = "";

    // Lazy import pdf-parse only when needed
    if (file.name.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (
      file.name.endsWith(".csv") ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls")
    ) {
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const csv = xlsx.utils.sheet_to_csv(sheet);
      extractedText = csv;
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const transactions = await classifyWithGemini(extractedText);
    return NextResponse.json({ transactions });
  } catch (err) {
    console.error("file-transaction error:", err);
    return NextResponse.json({ error: "Transaction extraction failed" }, { status: 500 });
  }
}
