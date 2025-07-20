// File: app/api/file-transaction/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import * as xlsx from "xlsx";
import { fetchGeminiText } from "@/lib/gemini";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_EXTENSIONS = [".pdf", ".csv", ".xlsx", ".xls"];
export const dynamic = "force-dynamic";

// ---------- Gemini Classification Prompt ----------
const CLASSIFICATION_PROMPT = (text: string) => `
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
`.trim();

// ---------- File Parsing Logic ----------
async function extractTextFromFile(file: File, buffer: Buffer): Promise<string> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }

  if (fileName.endsWith(".csv") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return xlsx.utils.sheet_to_csv(sheet);
  }

  throw new Error("Unsupported file type");
}

// ---------- Main Route ----------
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("receipt") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const fileExt = path.extname(file.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Save to temp dir (optional)
    const tempPath = path.join(tmpdir(), `${uuidv4()}-${file.name}`);
    await writeFile(tempPath, buffer);

    const extractedText = await extractTextFromFile(file, buffer);

    // ✅ Call Gemini with extracted text
    const rawResponse = await fetchGeminiText(CLASSIFICATION_PROMPT(extractedText));

    // ✅ Strip any ```json block formatting
    const cleanJson = rawResponse.replace(/```json|```/g, "").trim();

    let transactions: any[] = [];
    try {
      transactions = JSON.parse(cleanJson);
    } catch {
      transactions = [];
    }

    return NextResponse.json({ transactions });
  } catch (err: unknown) {
    console.error("❌ file-transaction error:", err);
    return NextResponse.json(
      {
        error: "Transaction extraction failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
