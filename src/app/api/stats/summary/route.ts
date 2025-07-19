// app/api/stats/summary/route.ts
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

    // ✅ Fix: support ISO string, Timestamp, or { seconds }
    const parseFirestoreDate = (raw: any): Date | null => {
      if (!raw) return null;

      if (typeof raw === "string") {
        const d = new Date(raw);
        return isNaN(d.getTime()) ? null : d;
      }

      if (typeof raw?.toDate === "function") return raw.toDate(); // Firestore Timestamp
      if (raw?.seconds) return new Date(raw.seconds * 1000);

      return null;
    };

    const isWithinRange = (rawDate: any): boolean => {
      const date = parseFirestoreDate(rawDate);
      if (!date) return false;
      if (fromDate && date < fromDate) return false;
      if (toDate && date > toDate) return false;
      return true;
    };

    incomesSnap.forEach((doc) => {
      const d = doc.data();
      if (typeof d.amount === "number" && isWithinRange(d.date)) {
        totalIncome += d.amount;
      }
    });

    expensesSnap.forEach((doc) => {
      const d = doc.data();
      if (typeof d.amount === "number" && isWithinRange(d.date)) {
        totalExpense += d.amount;
        const category = d.category || "Other";
        categoryTotals[category] = (categoryTotals[category] || 0) + d.amount;
      }
    });

    const savings = totalIncome - totalExpense;

    const result = {
      totalIncome,
      totalExpense,
      savings,
      categoryTotals,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ /api/stats/summary error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
