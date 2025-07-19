import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

function parseDateParam(param: string | null): Date | null {
  if (!param) return null;
  const d = new Date(param);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fromDate = parseDateParam(searchParams.get("from"));
    const toDate = parseDateParam(searchParams.get("to"));

    const incomesSnap = await getDocs(collection(db, "incomes"));
    const expensesSnap = await getDocs(collection(db, "expenses"));

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, number> = {};

    const parseFirestoreDate = (raw: unknown): Date | null => {
      if (!raw) return null;

      if (typeof raw === "string") {
        const d = new Date(raw);
        return isNaN(d.getTime()) ? null : d;
      }

      if (typeof raw === "object" && raw !== null) {
        const r = raw as { toDate?: () => Date; seconds?: number };

        if (typeof r.toDate === "function") return r.toDate();
        if (typeof r.seconds === "number") return new Date(r.seconds * 1000);
      }

      return null;
    };

    const isWithinRange = (rawDate: unknown): boolean => {
      const date = parseFirestoreDate(rawDate);
      if (!date) return false;
      if (fromDate && date < fromDate) return false;
      if (toDate && date > toDate) return false;
      return true;
    };

    incomesSnap.forEach((doc) => {
      const data = doc.data();
      if (typeof data.amount === "number" && isWithinRange(data.date)) {
        totalIncome += data.amount;
      }
    });

    expensesSnap.forEach((doc) => {
      const data = doc.data();
      if (typeof data.amount === "number" && isWithinRange(data.date)) {
        totalExpense += data.amount;
        const category = data.category || "Other";
        categoryTotals[category] = (categoryTotals[category] || 0) + data.amount;
      }
    });

    const savings = totalIncome - totalExpense;

    return NextResponse.json({
      totalIncome,
      totalExpense,
      savings,
      categoryTotals,
    });
  } catch (err) {
    console.error("❌ /api/stats/summary error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
