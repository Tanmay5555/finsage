"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight } from "lucide-react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp,
    // Timestamp // Removed unused Timestamp import
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

type Income = {
    id: string;
    source: string;
    amount: number;
    date: string; // Assuming date is stored as a string or will be converted to string
};

export default function IncomeList() {
    const { user, loading: authLoading } = useAuth();
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return; // wait for auth to initialize
        if (!user) {
            console.log("User not found yet");
            return;
        }

        const fetchIncomes = async () => {
            setLoading(true);
            try {
                console.log("Fetching incomes for user:", user.uid);
                const q = query(
                    collection(db, "incomes"),
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(q);
                console.log("Income docs fetched:", snapshot.size);
                // Explicitly cast the data to Income type, ensuring date is handled
                const data = snapshot.docs.map((doc) => {
                    const docData = doc.data();
                    // Assuming 'date' from Firestore can be a Timestamp or string
                    // Convert Timestamp to ISO string if it's a Timestamp object
                    const dateString = docData.date instanceof Timestamp
                        ? docData.date.toDate().toISOString()
                        : docData.date;

                    return {
                        id: doc.id,
                        source: docData.source,
                        amount: docData.amount,
                        date: dateString,
                    } as Income;
                });

                setIncomes(data);
            } catch (error) {
                console.error("Error fetching incomes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchIncomes();
    }, [user, authLoading]);

    return (
        <Card className="bg-[#161b33] text-white h-full">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold">Latest Income</h2>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                </div>

                <ScrollArea className="h-[220px] pr-2">
                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full rounded-md bg-muted/30" />
                            ))}
                        </div>
                    ) : incomes.length > 0 ? (
                        <ul className="space-y-4">
                            {incomes.map((income) => (
                                <li
                                    key={income.id}
                                    className="flex justify-between items-center bg-[#1f2547] px-4 py-2 rounded-lg hover:bg-[#23294e] transition"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{income.source}</p>
                                        <p className="text-xs text-muted-foreground text-purple-300">
                                            {/* Ensure income.date is a valid date string for Date constructor */}
                                            {new Date(income.date).toLocaleDateString("en-IN", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="text-green-400 border-green-500 bg-transparent"
                                    >
                                        ₹{income.amount}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center">
                            No income records found.
                        </p>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
