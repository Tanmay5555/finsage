"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Settings, DollarSign, Brain, Shield, Database, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState("INR");
  const [insightFrequency, setInsightFrequency] = useState("auto");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const savedCurrency = localStorage.getItem("finsage_currency");
    const savedFrequency = localStorage.getItem("finsage_insight_freq");
    if (savedCurrency) setCurrency(savedCurrency);
    if (savedFrequency) setInsightFrequency(savedFrequency);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem("finsage_currency", currency);
    localStorage.setItem("finsage_insight_freq", insightFrequency);
    toast.success("Settings saved successfully!");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearCache = () => {
    localStorage.removeItem("finsage_currency");
    localStorage.removeItem("finsage_insight_freq");
    setCurrency("INR");
    setInsightFrequency("auto");
    toast.info("Local settings cache cleared!");
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 text-foreground">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8 text-purple-400" /> Settings & Preferences
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Customize your Finsage experience, currency formats, AI behaviors, and privacy settings.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Currency & Formatting */}
          <Card className="bg-[#161b33] text-white border border-white/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="w-5 h-5 text-green-400" /> Currency & Regional
              </CardTitle>
              <CardDescription className="text-gray-400">
                Choose default currency symbol for balances and financial summaries.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency-select" className="text-sm font-medium text-gray-200">
                  Primary Currency
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency-select" className="bg-[#1f2547] text-white border-white/20">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1f2547] text-white border-white/20">
                    <SelectItem value="INR">₹ INR (Indian Rupee)</SelectItem>
                    <SelectItem value="USD">$ USD (US Dollar)</SelectItem>
                    <SelectItem value="EUR">€ EUR (Euro)</SelectItem>
                    <SelectItem value="GBP">£ GBP (British Pound)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-[#1f2547]/50 rounded-lg text-xs text-gray-300">
                Preview: <span className="font-semibold text-green-400">
                  {currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£"}1,250.00
                </span>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights Settings */}
          <Card className="bg-[#161b33] text-white border border-white/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Brain className="w-5 h-5 text-purple-400" /> AI Assistant & Insights
              </CardTitle>
              <CardDescription className="text-gray-400">
                Control how Gemini AI generates personalized tips and summary insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="insight-freq" className="text-sm font-medium text-gray-200">
                  Insight Analysis Mode
                </Label>
                <Select value={insightFrequency} onValueChange={setInsightFrequency}>
                  <SelectTrigger id="insight-freq" className="bg-[#1f2547] text-white border-white/20">
                    <SelectValue placeholder="Select Frequency" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1f2547] text-white border-white/20">
                    <SelectItem value="auto">Automatic (On Dashboard Load)</SelectItem>
                    <SelectItem value="manual">Manual Only (On Demand)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 text-xs text-purple-300">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Powered by Gemini 2.5 Flash for rapid financial breakdown.</span>
              </div>
            </CardContent>
          </Card>

          {/* Data & Local Storage */}
          <Card className="bg-[#161b33] text-white border border-white/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Database className="w-5 h-5 text-blue-400" /> Data & Local Storage
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage cached browser settings and local configurations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-300">
                All transaction data is securely stored in Firebase cloud. Clearing local cache will reset interface preferences to default.
              </p>
              <Button
                variant="outline"
                onClick={handleClearCache}
                className="w-full text-red-400 border-red-500/40 hover:bg-red-500/10 hover:text-red-300">
                Reset Preference Cache
              </Button>
            </CardContent>
          </Card>

          {/* Account Security Summary */}
          <Card className="bg-[#161b33] text-white border border-white/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="w-5 h-5 text-yellow-400" /> Account & Security
              </CardTitle>
              <CardDescription className="text-gray-400">
                Logged in authentication overview.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-gray-400">User Email:</span>
                <span className="font-medium text-white">{user?.email || "Not authenticated"}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-gray-400">Auth Method:</span>
                <span className="font-medium text-green-400">Firebase Auth</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-400">User ID:</span>
                <span className="font-mono text-xs text-purple-300">{user?.uid || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between bg-[#161b33] p-4 rounded-xl border border-white/10">
          <div className="text-sm text-gray-300">
            {savedSuccess ? (
              <span className="flex items-center gap-2 text-green-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Preferences saved!
              </span>
            ) : (
              "Click save to persist changes across your sessions."
            )}
          </div>
          <Button
            onClick={handleSaveSettings}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2">
            Save Preferences
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}