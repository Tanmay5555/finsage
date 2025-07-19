"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

type Expense = {
  id: string;
  category: string;
  amount: number;
  date: string;
};

export default function ExpenseList() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "expenses"),
          where("userId", "==", user.uid),
          orderBy("date", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Expense[];
        setExpenses(data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user]);

  return (
    <Card className="bg-[#161b33] text-white h-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Latest Expenses</h2>
          <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
        </div>

        <ScrollArea className="h-[220px] pr-2">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md bg-muted/30" />
              ))}
            </div>
          ) : (
            <ul className="space-y-4">
              {expenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex justify-between items-center bg-[#1f2547] px-4 py-2 rounded-lg hover:bg-[#23294e] transition"
                >
                  <div>
                    <p className="text-sm font-medium">{expense.category}</p>
                    <p className="text-xs text-muted-foreground text-purple-300">
                      {new Date(expense.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-red-400 border-red-500 bg-transparent"
                  >
                    ₹{expense.amount}
                  </Badge>
                </li>
              ))}
              {expenses.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground text-center">
                  No expense records found.
                </p>
              )}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
