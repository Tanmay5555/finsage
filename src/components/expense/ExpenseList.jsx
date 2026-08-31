// ExpenseList.tsx

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";








const parseToDate = (raw) => {
  if (!raw) return null;
  if (raw instanceof Timestamp) return raw.toDate();
  if (raw?.seconds) return new Date(raw.seconds * 1000);
  if (raw instanceof Date) return raw;
  if (typeof raw === "string" || typeof raw === "number") {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const formatDate = (raw) => {
  const dateObj = parseToDate(raw);
  if (!dateObj) return "Unknown Date";

  return dateObj.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
};

export default function ExpenseList({ refreshKey = 0 }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestExpenses = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const q = query(
          collection(db, "expenses"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);

        const formatted = snapshot.docs.map((doc) => {
          const data = doc.data();
          const dateObj = parseToDate(data.date);
          return {
            id: doc.id,
            category: data.category || "Misc",
            amount: Number(data.amount) || 0,
            date: formatDate(data.date),
            timestamp: dateObj ? dateObj.getTime() : 0
          };
        });

        formatted.sort((a, b) => b.timestamp - a.timestamp);

        setExpenses(formatted);
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestExpenses();
  }, [user, refreshKey]);

  return (
    <Card className="bg-[#161b33] text-white h-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Latest Expenses</h2>
        </div>

        <ScrollArea className="h-[220px] pr-2">
          {loading ?
          <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) =>
            <Skeleton key={i} className="h-10 w-full rounded-md bg-muted/30" />
            )}
            </div> :
          expenses.length > 0 ?
          <ul className="space-y-4">
              {expenses.map(({ id, category, amount, date }) =>
            <li
              key={id}
              className="flex justify-between items-center bg-[#1f2547] px-4 py-2 rounded-lg hover:bg-[#23294e] transition">
              
                  <div>
                    <p className="text-sm font-medium">{category}</p>
                    <p className="text-xs text-purple-300 text-muted-foreground">{date}</p>
                  </div>
                  <Badge
                variant="outline"
                className="text-red-400 border-red-500 bg-transparent">
                
                    ₹{amount}
                  </Badge>
                </li>
            )}
            </ul> :

          <p className="text-sm text-muted-foreground text-center">
              No expense records found.
            </p>
          }
        </ScrollArea>
      </CardContent>
    </Card>);

}