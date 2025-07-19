// File: app/api/stats/insights/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      totalIncome = 0,
      totalExpense = 0,
      categoryTotals = {},
    } = body;

    const netSavings = totalIncome - totalExpense;

    const categoryData = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount: Number(amount),
    }));

    const categoriesText = categoryData.length
      ? categoryData.map((c) => `- ${c.category}: ₹${c.amount.toFixed(2)}`).join("\n")
      : "No category breakdown available.";

    const prompt = `
You are a helpful financial assistant AI.

The user's financial summary is:
- Total Income: ₹${totalIncome.toFixed(2)}
- Total Expenses: ₹${totalExpense.toFixed(2)}
- Net Savings: ₹${netSavings.toFixed(2)}
- Expense Breakdown:
${categoriesText}

Please provide:
1. A short summary of their financial health.
2. 2–3 suggestions to improve budgeting/saving.
3. Simple tips for financial planning.

Only respond in clear, plain English. No greetings or sign-offs.
    `.trim();

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

    if (!geminiRes.ok || !result?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("❌ Gemini API Error Response:", JSON.stringify(result, null, 2));
      return NextResponse.json({ error: "Gemini response invalid." }, { status: 500 });
    }

    const insights = result.candidates[0].content.parts[0].text;

    return NextResponse.json({ insights });
  } catch (err) {
    console.error("💥 Gemini Insight API Error:", err);
    return NextResponse.json({ error: "Insight generation failed." }, { status: 500 });
  }
}
