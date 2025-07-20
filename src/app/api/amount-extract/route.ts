import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeNumberString(str: string): string {
  return str.replace(/(?<=\d),(?=\d)/g, "");
}

// Extract first numeric token (you can enhance scoring if needed)
function extractAmount(text: string): number | null {
  const cleaned = normalizeNumberString(text);
  // FIRST look for explicit NONE
  if (/^\s*NONE\s*$/i.test(cleaned)) return null;

  const match = cleaned.match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const val = Number.parseFloat(match[0]);
  return Number.isNaN(val) ? null : val;
}

export async function POST(req: NextRequest) {
  try {
    const { base64, mimeType } = await req.json();

    if (!base64) {
      return NextResponse.json({ error: "Missing 'base64' field" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY env var" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const model = "gemini-2.0-flash"; // adjust if you prefer another
    const prompt = `
You are a precise financial extraction assistant.

The attached PDF is a payslip, invoice, or receipt.

Return ONLY the final payable amount:
Priority labels:
1. Net Salary Payable / Net Salary / Net Pay
2. Total Earnings / Total Earnings (A)
3. Grand Total / Amount Paid / Total Amount / Total

Rules:
- Output ONLY the number (no commas, no currency symbol, no words).
- Keep decimals if present.
- If nothing matches, output EXACTLY: NONE
`.trim();

    const stream = await ai.models.generateContentStream({
      model,
      config: {
        // Keep plain text response
        responseMimeType: "text/plain",
        temperature: 0.1,
        maxOutputTokens: 128
      },
      contents: [
        {
          role: "user",
            parts: [
              {
                inlineData: {
                  data: base64,
                  mimeType: mimeType || "application/pdf"
                }
              },
              { text: prompt }
            ]
        }
      ]
    });

    // Accumulate streamed text
    let fullText = "";
    for await (const chunk of stream) {
      const piece = chunk.text;
      if (piece) fullText += piece;
    }

    const amount = extractAmount(fullText);

    if (amount == null) {
      return NextResponse.json(
        { error: "Failed to extract amount", rawText: fullText },
        { status: 422 }
      );
    }

    return NextResponse.json({
      amount,
      rawText: fullText,
      source: "gemini-inline-pdf"
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Gemini PDF extraction error:", message);
    return NextResponse.json(
      { error: "Gemini PDF extraction failed", message },
      { status: 500 }
    );
  }
}
