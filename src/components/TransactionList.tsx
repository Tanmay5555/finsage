"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export default function TransactionList() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Transaction[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
      setTransactions(data);
    });

    return () => unsubscribe();
  }, [user]);

  if (!transactions.length) {
    return (
      <div className="text-center text-muted-foreground mt-10">
        No transactions yet. Start by adding one!
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-10">
      <h2 className="text-xl font-semibold">Recent Transactions</h2>
      {transactions.map((txn) => (
        <Card key={txn.id} className="p-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium capitalize">
              {txn.category}{" "}
              <span className="text-muted-foreground text-sm">({txn.note || "No note"})</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(txn.date), "dd MMM yyyy")}
            </p>
          </div>
          <div className="text-right">
            <p
              className={`font-bold text-lg ${
                txn.type === "income" ? "text-green-600" : "text-red-600"
              }`}
            >
              {txn.type === "income" ? "+" : "-"}${txn.amount.toFixed(2)}
            </p>
            <Badge variant="outline" className="capitalize mt-1">
              {txn.type}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
