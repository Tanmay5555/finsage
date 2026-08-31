import { NextResponse } from "next/server";
import path from "path";
import * as xlsx from "xlsx";
import { fetchGeminiText, fetchGeminiWithInlineData } from "@/lib/gemini";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_EXTENSIONS = [".pdf", ".csv", ".xlsx", ".xls", ".png", ".jpg", ".jpeg", ".webp"];
export const dynamic = "force-dynamic";

const CLASSIFICATION_PROMPT = `
You are a precise financial transaction extractor.

Analyze the provided financial document (bank statement, payslip, receipt, or transaction slip).

Extract ALL transactions found into a JSON array of objects.
Each object must have these exact keys:
- "date": string (YYYY-MM-DD format if possible, or raw date string)
- "description": string (name of payee, merchant, or transaction details)
- "amount": number (positive numeric value only, e.g. 1500.50, no currency symbols)
- "type": string ("Credit" or "Debit")
- "classifiedAs": string ("Income" or "Expense")

Rules:
- If a line is a deposit/credit/salary/income, type = "Credit" and classifiedAs = "Income".
- If a line is a withdrawal/debit/bill/expense, type = "Debit" and classifiedAs = "Expense".
- Respond ONLY with the JSON array. Do not wrap in markdown or add conversational text.
- If no transactions are found, return [].
`.trim();

function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case ".pdf": return "application/pdf";
    case ".png": return "image/png";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".webp": return "image/webp";
    case ".csv": return "text/csv";
    case ".xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case ".xls": return "application/vnd.ms-excel";
    default: return "application/octet-stream";
  }
}

function extractJsonArray(text) {
  if (!text || typeof text !== "string") return [];

  // Strip code fences if present
  const cleaned = text.replace(/```json|```/gi, "").trim();

  // Try direct parse
  try {
    const directParse = JSON.parse(cleaned);
    if (Array.isArray(directParse)) return directParse;
  } catch {}

  // Fallback: extract array using regex
  const match = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Match parse failed:", e);
    }
  }

  return [];
}

function normalizeTransaction(t) {
  if (!t || typeof t !== "object") return null;

  let rawAmount = 0;
  if (typeof t.amount === "number") {
    rawAmount = t.amount;
  } else if (typeof t.amount === "string") {
    const cleanedStr = t.amount.replace(/,/g, "").replace(/[^0-9.]/g, "");
    rawAmount = parseFloat(cleanedStr);
  }

  if (isNaN(rawAmount) || rawAmount <= 0) return null;

  const rawType = String(t.type || "").toUpperCase().trim();
  const isCredit = rawType.includes("CREDIT") || rawType === "CR" || rawType === "INCOME";
  const type = isCredit ? "Credit" : "Debit";

  const rawClassified = String(t.classifiedAs || "").toUpperCase().trim();
  const classifiedAs = rawClassified.includes("INCOME") || isCredit ? "Income" : "Expense";

  return {
    date: String(t.date || new Date().toISOString().split("T")[0]).trim(),
    description: String(t.description || "Bank Transaction").trim(),
    amount: Math.abs(rawAmount),
    type,
    classifiedAs
  };
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("receipt");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded.", message: "Please select a file to upload." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large.", message: "File exceeds 10MB limit." }, { status: 400 });
    }

    const fileExt = path.extname(file.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json({
        error: "Unsupported file type.",
        message: `File format '${fileExt}' is not supported. Upload a PDF, PNG, JPG, CSV, or Excel file.`
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = getMimeType(file.name);

    let rawResponse = "";

    if (fileExt === ".pdf") {
      // Try text extraction first via pdf-parse
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const pdfData = await pdfParse(buffer);
        const extractedText = pdfData.text?.trim();

        if (extractedText && extractedText.length > 20) {
          rawResponse = await fetchGeminiText(`
${CLASSIFICATION_PROMPT}

DOCUMENT TEXT:
"""
${extractedText}
"""
          `.trim());
        }
      } catch (pdfErr) {
        console.warn("PDF text parse failed, falling back to multimodal inline data:", pdfErr);
      }

      // If text extraction didn't yield response (e.g. scanned image PDF), use inline base64
      if (!rawResponse) {
        const base64 = buffer.toString("base64");
        rawResponse = await fetchGeminiWithInlineData({
          base64,
          mimeType,
          prompt: CLASSIFICATION_PROMPT
        });
      }
    } else if (fileExt === ".csv" || fileExt === ".xlsx" || fileExt === ".xls") {
      try {
        const workbook = xlsx.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const csvText = xlsx.utils.sheet_to_csv(sheet);

        rawResponse = await fetchGeminiText(`
${CLASSIFICATION_PROMPT}

STATEMENT DATA:
"""
${csvText}
"""
        `.trim());
      } catch {
        const base64 = buffer.toString("base64");
        rawResponse = await fetchGeminiWithInlineData({
          base64,
          mimeType,
          prompt: CLASSIFICATION_PROMPT
        });
      }
    } else {
      // Image formats (.png, .jpg, .jpeg, .webp)
      const base64 = buffer.toString("base64");
      rawResponse = await fetchGeminiWithInlineData({
        base64,
        mimeType,
        prompt: CLASSIFICATION_PROMPT
      });
    }

    const parsedArray = extractJsonArray(rawResponse);
    const transactions = parsedArray.map(normalizeTransaction).filter(Boolean);

    return NextResponse.json({ transactions });
  } catch (err) {
    console.error("file-transaction API Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown extraction error";
    return NextResponse.json(
      {
        error: "Bank slip transaction extraction failed.",
        message: errorMessage
      },
      { status: 500 }
    );
  }
}