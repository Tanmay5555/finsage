// File: app/api/stats/summary/route.ts
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";








export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const fromDate = parseDateParam(searchParams.get("from"));
    const toDate = parseDateParam(searchParams.get("to"));

    if (!uid) {
      return NextResponse.json({ error: "Missing 'uid' parameter." }, { status: 400 });
    }

    const incomesQuery = query(collection(db, "incomes"), where("userId", "==", uid));
    const expensesQuery = query(collection(db, "expenses"), where("userId", "==", uid));

    const [incomeSnap, expenseSnap] = await Promise.all([
    getDocs(incomesQuery),
    getDocs(expensesQuery)]
    );

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    const isWithinRange = (rawDate) => {
      const date = parseFirestoreDate(rawDate);
      if (!date) return false;
      if (fromDate && date < fromDate) return false;
      if (toDate && date > toDate) return false;
      return true;
    };

    for (const doc of incomeSnap.docs) {
      const data = doc.data();
      if (typeof data.amount === "number" && isWithinRange(data.date)) {
        totalIncome += data.amount;
      }
    }

    for (const doc of expenseSnap.docs) {
      const data = doc.data();
      if (typeof data.amount === "number" && isWithinRange(data.date)) {
        totalExpense += data.amount;
        const category = typeof data.category === "string" ? data.category : "Other";
        categoryTotals[category] = (categoryTotals[category] || 0) + data.amount;
      }
    }

    const summary = {
      totalIncome,
      totalExpense,
      savings: totalIncome - totalExpense,
      categoryTotals
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error("/api/stats/summary error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate summary",
        message: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// ---------- Utilities ----------

function parseDateParam(param) {
  if (!param) return null;
  const d = new Date(param);
  return isNaN(d.getTime()) ? null : d;
}

function parseFirestoreDate(raw) {
  if (!raw) return null;
  if (typeof raw === "string") return new Date(raw);

  if (typeof raw === "object" && raw !== null) {
    const r = raw;
    if (typeof r.toDate === "function") return r.toDate();
    if (typeof r.seconds === "number") return new Date(r.seconds * 1000);
  }

  return null;
}