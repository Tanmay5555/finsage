import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* ---------- Helpers ---------- */

function normalizeNumberString(str: string): string {
  // Remove commas only between digits (thousands separators)
  return str.replace(/(?<=\d),(?=\d)/g, "");
}

interface CandidatePart {
  text?: string;
}

interface CandidateContent {
  parts?: CandidatePart[];
}

interface GeminiCandidate {
  content?: CandidateContent;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

function heuristicAmount(ocr: string): number | null {
  const candidates: { score: number; value: number }[] = [];
  const lines = ocr.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const keywords = [
    "total earnings",
    "net salary payable",
    "net salary",
    "net pay",
    "total earnings (a)",
    "gross pay",
    "gross salary",
    "total",
    "grand total",
    "amount paid",
  ];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (keywords.some(k => lower.includes(k))) {
      const nums = line.match(/\d[\d,]*\.?\d*/g) || [];
      for (const raw of nums) {
        const cleaned = normalizeNumberString(raw);
        if (!cleaned) continue;
        const num = Number.parseFloat(cleaned);
        if (!Number.isNaN(num)) {
          let score = 0;
          if (/net/.test(lower)) score += 3;
          if (/total/.test(lower)) score += 2;
          if (/earnings|salary/.test(lower)) score += 2;
          if (/grand/.test(lower)) score += 1;
            // Prefer realistic salary magnitudes
          if (num > 100) score += 1;
          candidates.push({ score, value: num });
        }
      }
    }
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score || b.value - a.value);
  return candidates[0].value;
}

/* ---------- Route Handler ---------- */

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { text?: string };
    const text = body?.text;

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // 1. Heuristic first (fast, no model call)
    const heuristic = heuristicAmount(text);
    if (heuristic !== null) {
      return NextResponse.json({ amount: heuristic, source: "heuristic" });
    }

    // 2. Model fallback
    const normalizedOCR = normalizeNumberString(text);

    const prompt = `
You are a financial extraction assistant.

From the OCR text below, identify the final payable amount. Look for the most relevant of:
"Net Salary Payable", "Net Salary", "Total Earnings", "Total Earnings (A)", "Net Pay", "Grand Total", "Total".

Rules:
- Return ONLY the numeric value
- No commas, currency symbols, words, or formatting
- If you see 15,000.00 or 15,000 output 15000.00 (preserve decimals if present)
- Prefer the *net* or *final* amount if multiple similar numbers appear.

OCR TEXT:
"""${normalizedOCR}"""
`.trim();

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 20 },
        }),
      }
    );

    if (!geminiRes.ok) {
      return NextResponse.json(
        { error: "Gemini API request failed" },
        { status: geminiRes.status }
      );
    }

    const result = (await geminiRes.json()) as GeminiResponse;
    let rawText =
      result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!rawText) {
      return NextResponse.json(
        { error: "No valid response from Gemini" },
        { status: 502 }
      );
    }

    rawText = normalizeNumberString(rawText);
    const match = rawText.match(/\d+(?:\.\d+)?/);
    const amount = match ? Number.parseFloat(match[0]) : null;

    if (amount == null || Number.isNaN(amount)) {
      return NextResponse.json(
        { error: "Failed to extract amount" },
        { status: 422 }
      );
    }

    return NextResponse.json({ amount, source: "gemini" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Gemini route error:", err);
    return NextResponse.json(
      { error: "Server error", message },
      { status: 500 }
    );
  }
}
