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
import {
  Settings,
  DollarSign,
  Brain,
  Shield,
  Database,
  Sparkles,
  CheckCircle2,
  Palette,
  Clock,
  Calendar,
  Check,
  Lock,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import clsx from "clsx";

export default function SettingsPage() {
  const { user } = useAuth();
  const { mode, theme, setThemeMode, selectManualTheme, allThemes, activeFestival, isAdmin } = useTheme();
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
    toast.success("Settings and theme preferences saved!");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearCache = () => {
    localStorage.removeItem("finsage_currency");
    localStorage.removeItem("finsage_insight_freq");
    localStorage.removeItem("finsage_theme_mode");
    localStorage.removeItem("finsage_theme_id");
    setCurrency("INR");
    setInsightFrequency("auto");
    setThemeMode("auto-time");
    toast.info("Local settings cache cleared!");
  };

  const timeThemes = allThemes.filter((t) => t.category === "time");
  const festivalThemes = allThemes.filter((t) => t.category === "festival");

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 text-foreground">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8 text-purple-400" /> Settings & Customization
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Customize your Finsage experience, time & festival theme triggers, AI behaviors, and currency formats.
          </p>
        </header>

        {/* --- DYNAMIC THEME & FESTIVAL STUDIO --- */}
        <Card className="bg-[#12162b]/80 border border-purple-500/20 shadow-2xl backdrop-blur-xl text-white">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2.5 text-2xl font-bold">
                  <Palette className="w-6 h-6 text-pink-400" /> Time & Festival Themes
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm mt-1">
                  Automate interface aesthetics based on time of day (Morning/Sunset/Night) and calendar festivals (Diwali, Holi, Navratri, Christmas, Eid, etc.).
                </CardDescription>
              </div>

              {/* Active Theme & Admin Status */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2.5 rounded-2xl">
                  <span className="text-2xl animate-pulse">{theme.icon}</span>
                  <div>
                    <div className="text-xs text-gray-400 font-medium">Currently Active</div>
                    <div className="text-sm font-semibold text-purple-300">{theme.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border text-xs font-semibold bg-purple-500/10 border-purple-500/30 text-purple-200">
                  {isAdmin ? (
                    <span className="flex items-center gap-1 text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Admin Access Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-300">
                      <Lock className="w-3.5 h-3.5 text-amber-400" /> Standard User
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Auto Mode Toggles */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                1. Select Theme Mode
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setThemeMode("auto-festival")}
                  className={clsx(
                    "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 relative overflow-hidden",
                    mode === "auto-festival"
                      ? "bg-gradient-to-br from-purple-600/40 via-pink-600/30 to-amber-600/20 border-purple-400 shadow-xl glow-purple"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300",
                    !isAdmin && "opacity-80"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm flex items-center gap-2 text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400" /> Auto Festival Mode
                    </span>
                    {mode === "auto-festival" ? (
                      <Check className="w-4 h-4 text-purple-300" />
                    ) : !isAdmin ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-300">
                    Automatically switches to vibrant festival themes (Diwali, Holi, Navratri, Christmas, etc.) on celebration dates.
                  </p>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 font-medium">
                    {isAdmin ? (activeFestival ? `Active: ${activeFestival.name}` : "Adapts to calendar fests") : "Admin Only 🔒"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeMode("auto-time")}
                  className={clsx(
                    "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2",
                    mode === "auto-time"
                      ? "bg-gradient-to-br from-blue-600/40 via-teal-600/30 to-sky-600/20 border-sky-400 shadow-xl glow-blue"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm flex items-center gap-2 text-sky-300">
                      <Clock className="w-4 h-4 text-sky-400" /> Auto Time Mode
                    </span>
                    {mode === "auto-time" && <Check className="w-4 h-4 text-sky-300" />}
                  </div>
                  <p className="text-xs text-gray-300">
                    Adapts interface colors automatically through Morning Sunrise (6AM), Day Breeze (12PM), Sunset (5PM), and Galactic Midnight (8PM).
                  </p>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-500/30 font-medium">
                    Available to All Users
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeMode("manual")}
                  className={clsx(
                    "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2",
                    mode === "manual"
                      ? "bg-gradient-to-br from-pink-600/40 via-purple-600/30 to-indigo-600/20 border-pink-400 shadow-xl"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm flex items-center gap-2 text-pink-300">
                      <Palette className="w-4 h-4 text-pink-400" /> Manual Custom Lock
                    </span>
                    {mode === "manual" && <Check className="w-4 h-4 text-pink-300" />}
                  </div>
                  <p className="text-xs text-gray-300">
                    Lock your favorite theme permanently regardless of time or date.
                  </p>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-200 border border-pink-500/30 font-medium">
                    Time Presets Unlocked
                  </span>
                </button>
              </div>
            </div>

            {/* Festival Theme Showcase Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" /> Festival Themes
                </Label>
                {!isAdmin && (
                  <span className="text-xs text-amber-400/90 flex items-center gap-1 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <Lock className="w-3 h-3" /> Admin Restricted Access
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {festivalThemes.map((t) => {
                  const isSelected = theme.id === t.id && mode === "manual";
                  return (
                    <div
                      key={t.id}
                      onClick={() => selectManualTheme(t.id)}
                      className={clsx(
                        "p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.02]",
                        isSelected
                          ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                          : "border-white/10 bg-white/5 hover:border-white/20",
                        !isAdmin && "opacity-70"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl group-hover:scale-110 transition-transform">{t.icon}</span>
                        {isSelected ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-black font-extrabold">
                            ACTIVE
                          </span>
                        ) : !isAdmin ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400 group-hover:text-white">
                            Select
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-sm text-white flex items-center justify-between">
                        <span>{t.name}</span>
                      </div>
                      <p className="text-[11px] text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Theme Showcase Grid */}
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" /> Time of Day Themes (Accessible by All)
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {timeThemes.map((t) => {
                  const isSelected = theme.id === t.id && mode === "manual";
                  return (
                    <div
                      key={t.id}
                      onClick={() => selectManualTheme(t.id)}
                      className={clsx(
                        "p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.02]",
                        isSelected
                          ? "border-sky-400 bg-sky-500/10 shadow-lg shadow-sky-500/20"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl group-hover:scale-110 transition-transform">{t.icon}</span>
                        {isSelected ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-400 text-black font-extrabold">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400 group-hover:text-white">
                            Select
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-sm text-white">{t.name}</div>
                      <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                        {t.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- GENERAL SETTINGS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Currency & Formatting */}
          <Card className="bg-[#161b33]/90 text-white border border-white/10 shadow-lg">
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
          <Card className="bg-[#161b33]/90 text-white border border-white/10 shadow-lg">
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
                <span>Powered by Gemini AI for rapid financial breakdown.</span>
              </div>
            </CardContent>
          </Card>

          {/* Data & Local Storage */}
          <Card className="bg-[#161b33]/90 text-white border border-white/10 shadow-lg">
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
          <Card className="bg-[#161b33]/90 text-white border border-white/10 shadow-lg">
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
                <span className="text-gray-400">Role Status:</span>
                <span className="font-medium text-amber-300">
                  {isAdmin ? "👑 Administrator" : "Standard User"}
                </span>
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