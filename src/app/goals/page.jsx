"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, serverTimestamp } from "firebase/firestore";
import { Target, Plus, Sparkles, Trash2, PiggyBank, Calendar, Trophy, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { label: "Emergency Fund", emoji: "🛡️" },
  { label: "Vacation & Travel", emoji: "✈️" },
  { label: "Vehicle / Car", emoji: "🚗" },
  { label: "Home / Housing", emoji: "🏡" },
  { label: "Electronics & Tech", emoji: "💻" },
  { label: "Education & Learning", emoji: "🎓" },
  { label: "Investment / Wealth", emoji: "💎" },
  { label: "Custom Goal", emoji: "🎯" }
];

export default function GoalsPage() {
  const { user } = useAuth();
  const { formatAmount, currency } = useCurrency();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].label);
  const [targetDate, setTargetDate] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

  // Add Funds Modal / Input state
  const [addFundsId, setAddFundsId] = useState(null);
  const [addFundsAmount, setAddFundsAmount] = useState("");

  // AI Advice State
  const [aiAdvice, setAiAdvice] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Fetch Goals from Firebase
  const fetchGoals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "goals"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setGoals(list);
    } catch (err) {
      console.error("Error fetching goals:", err);
      toast.error("Failed to load savings goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  // Create Goal
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please log in first.");

    const targetVal = parseFloat(targetAmount);
    const initialVal = parseFloat(currentAmount) || 0;

    if (!title.trim() || isNaN(targetVal) || targetVal <= 0) {
      return toast.error("Please enter a valid title and target amount.");
    }

    setSavingGoal(true);
    try {
      const categoryObj = CATEGORIES.find((c) => c.label === category) || CATEGORIES[0];
      const newDoc = {
        userId: user.uid,
        title: title.trim(),
        targetAmount: targetVal,
        currentAmount: initialVal,
        category: categoryObj.label,
        emoji: categoryObj.emoji,
        targetDate: targetDate || null,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "goals"), newDoc);
      toast.success("🎯 Savings Goal Created!");
      setTitle("");
      setTargetAmount("");
      setCurrentAmount("");
      setTargetDate("");
      fetchGoals();
    } catch (err) {
      console.error("Failed to create goal:", err);
      toast.error("Failed to create goal.");
    } finally {
      setSavingGoal(false);
    }
  };

  // Deposit funds into a goal
  const handleDepositFunds = async (goalId, existingAmount) => {
    const depositVal = parseFloat(addFundsAmount);
    if (isNaN(depositVal) || depositVal <= 0) {
      return toast.error("Enter a valid deposit amount.");
    }

    try {
      const goalRef = doc(db, "goals", goalId);
      const newTotal = existingAmount + depositVal;
      await updateDoc(goalRef, { currentAmount: newTotal });
      toast.success(`Deposited ${formatAmount(depositVal)}!`);
      setAddFundsId(null);
      setAddFundsAmount("");
      fetchGoals();
    } catch (err) {
      console.error("Deposit failed:", err);
      toast.error("Deposit failed.");
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (goalId) => {
    if (!confirm("Are you sure you want to delete this savings goal?")) return;
    try {
      await deleteDoc(doc(db, "goals", goalId));
      toast.success("Goal deleted.");
      fetchGoals();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Could not delete goal.");
    }
  };

  // Fetch AI Savings Advice
  const fetchAiAdvice = async () => {
    if (goals.length === 0) {
      return toast.error("Add at least one goal to get AI advice.");
    }

    setLoadingAi(true);
    setAiAdvice("");

    try {
      const goalsSummary = goals.map(
        (g) => `- ${g.emoji} ${g.title}: Saved ₹${g.currentAmount} out of target ₹${g.targetAmount} (Target Date: ${g.targetDate || "Open"})`
      ).join("\n");

      const prompt = `
You are Finsage AI Budgeting Planner.
Analyze these user savings goals:
${goalsSummary}

Current selected currency display: ${currency.name} (${currency.symbol})

Provide 3 actionable, highly encouraging AI advice points on:
1. Recommended monthly deposit to reach closest goal on time.
2. Smart spending cut suggestion to boost savings.
3. Long-term wealth tip.

Keep response in bullet points with emoji prefix. Plain text only.
      `.trim();

      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt })
      });

      const data = await res.json();
      setAiAdvice(data.content || "Keep saving consistently to reach your financial milestones!");
    } catch (err) {
      console.error("AI Advice error:", err);
      toast.error("Failed to generate AI advice.");
    } finally {
      setLoadingAi(false);
    }
  };

  // Calculations
  const totalTarget = goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0);
  const totalSaved = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const overallProgress = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 text-white">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <Target className="text-emerald-400 w-8 h-8" />
              Smart Savings Goals & AI Planner
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Set savings targets, track your milestones, and receive AI budget optimization tips.
            </p>
          </div>

          <Button
            onClick={fetchAiAdvice}
            disabled={loadingAi || goals.length === 0}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            {loadingAi ? "Analyzing Goals..." : "Get AI Savings Advice"}
          </Button>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#161b33] border-none text-white shadow-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-300 font-medium">Total Saved Across Goals</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">{formatAmount(totalSaved)}</h3>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                <PiggyBank className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#161b33] border-none text-white shadow-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-300 font-medium">Total Target Goal</p>
                <h3 className="text-2xl font-bold text-white mt-1">{formatAmount(totalTarget)}</h3>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <Trophy className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#161b33] border-none text-white shadow-md">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-purple-300 font-medium">Overall Progress</p>
                <span className="text-xs font-bold text-emerald-300">{overallProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Advice Output Section */}
        {aiAdvice && (
          <Card className="bg-gradient-to-r from-[#1e1e38] to-[#12162d] border border-purple-500/30 text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-purple-300">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Finsage AI Savings Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 leading-relaxed text-blue-100">
              {aiAdvice.split("\n").map((line, i) => (
                <p key={i} className="flex items-start gap-2">
                  <span>{line}</span>
                </p>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Goal Form */}
          <Card className="bg-[#161b33] border-none text-white shadow-md h-fit">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Add New Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <Label className="text-xs text-purple-300">Goal Title</Label>
                  <Input
                    placeholder="e.g. New Macbook Pro / Japan Trip"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-[#1f2547] text-white border-white/10 mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-purple-300">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-[#1f2547] text-white border-white/10 mt-1">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2547] text-white border-white/10">
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.label} value={c.label}>
                          {c.emoji} {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-purple-300">Target Amount (Base INR)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 150000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="bg-[#1f2547] text-white border-white/10 mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-purple-300">Already Saved (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 25000"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="bg-[#1f2547] text-white border-white/10 mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-purple-300">Target Date (Optional)</Label>
                  <Input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="bg-[#1f2547] text-white border-white/10 mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={savingGoal}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold mt-2"
                >
                  {savingGoal ? "Creating..." : "Save Goal"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Goals List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold">Your Active Goals ({goals.length})</h2>

            {loading ? (
              <p className="text-gray-400 text-center py-10">Loading goals...</p>
            ) : goals.length === 0 ? (
              <Card className="bg-[#161b33] border-none text-white p-8 text-center">
                <Target className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold">No Savings Goals Yet</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Create your first goal on the left to start tracking your savings progress!
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((g) => {
                  const pct = Math.min(100, Math.round(((g.currentAmount || 0) / (g.targetAmount || 1)) * 100));
                  const isCompleted = pct >= 100;

                  return (
                    <Card
                      key={g.id}
                      className="bg-[#161b33] border-none text-white shadow-md relative overflow-hidden flex flex-col justify-between"
                    >
                      {isCompleted && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> COMPLETED
                        </div>
                      )}

                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl p-2 bg-[#1f2547] rounded-xl">{g.emoji || "🎯"}</span>
                            <div>
                              <h3 className="font-bold text-base">{g.title}</h3>
                              <p className="text-xs text-purple-300">{g.category}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteGoal(g.id)}
                            className="text-gray-400 hover:text-red-400 transition p-1"
                            title="Delete goal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Amount & Progress */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">Saved: <strong className="text-emerald-400">{formatAmount(g.currentAmount || 0)}</strong></span>
                            <span className="text-gray-400">Target: {formatAmount(g.targetAmount)}</span>
                          </div>

                          <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct >= 100 ? "bg-emerald-400" : pct >= 50 ? "bg-blue-400" : "bg-yellow-400"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>{pct}% reached</span>
                            {g.targetDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {g.targetDate}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Add Funds Button / Input */}
                        {addFundsId === g.id ? (
                          <div className="flex items-center gap-2 pt-2">
                            <Input
                              type="number"
                              placeholder="Deposit amount"
                              value={addFundsAmount}
                              onChange={(e) => setAddFundsAmount(e.target.value)}
                              className="bg-[#1f2547] text-white text-xs border-white/10 h-8"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleDepositFunds(g.id, g.currentAmount || 0)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8 px-3"
                            >
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setAddFundsId(null)}
                              className="text-xs h-8 px-2 text-gray-400"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              setAddFundsId(g.id);
                              setAddFundsAmount("");
                            }}
                            className="w-full bg-[#1f2547] hover:bg-purple-600/30 text-purple-300 border border-purple-500/20 text-xs mt-2 flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Deposit Funds
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
