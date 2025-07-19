// app/api/insight/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text }] }],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text(); // capture raw HTML if it’s an error
      return NextResponse.json({ error: "Gemini API failed", details: errorText }, { status: geminiRes.status });
    }

    const result = await geminiRes.json();

    const content = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      return NextResponse.json({ error: "No valid response from Gemini" }, { status: 500 });
    }

    return NextResponse.json({ content });
  } catch (err) {
    console.error("❌ /api/gemini-insight error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
