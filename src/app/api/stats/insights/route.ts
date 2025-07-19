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
      amount,
    }));

    const categoriesText = categoryData.length
      ? categoryData.map((c) => `- ${c.category}: ₹${c.amount}`).join("\n")
      : "No category breakdown available.";

    const prompt = `
You are a financial analyst AI.

Here is the user's financial summary:
- Total Income: ₹${totalIncome}
- Total Expenses: ₹${totalExpense}
- Net Savings: ₹${netSavings}
- Expense Categories:
${categoriesText}

Based on this, provide:
1. Summary of user's financial health.
2. 2–3 improvement suggestions.
3. Budget planning tips.

Respond in 2–3 paragraphs, plain text.
`;

    console.log("📤 Gemini Prompt:\n", prompt);

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
    console.log("📥 Gemini Response:\n", JSON.stringify(result, null, 2));

    const insights = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ insights });
  } catch (err) {
    console.error("💥 Gemini stats insight error:", err);
    return NextResponse.json({ error: "Insight generation failed" }, { status: 500 });
  }
}
