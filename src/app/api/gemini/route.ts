// app/api/gemini/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const prompt = `
You are a financial assistant AI.

From the provided OCR text, extract the final amount:
- If it's a payslip, find **Total Earnings**, **Net Pay**, or **Gross Income**.
- If it's a receipt, find **Total**, **Grand Total**, or **Amount Paid**.

Return only the final numeric value. No currency, no explanation.

OCR Text:
"""${text}"""
`;

    const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );
      
      if (!geminiRes.ok) {
        return NextResponse.json({ error: "Gemini API request failed" }, { status: geminiRes.status });
      }
      
      const result = await geminiRes.json();
    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!rawText) {
      return NextResponse.json({ error: "No valid response from Gemini" }, { status: 500 });
    }

    const match = rawText.match(/[\d]+(?:\.\d{1,2})?/);
    const amount = match ? parseFloat(match[0]) : null;

    if (!amount) {
      return NextResponse.json({ error: "Failed to extract amount" }, { status: 500 });
    }

    return NextResponse.json({ amount });
  } catch (err) {
    console.error("❌ Gemini route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
