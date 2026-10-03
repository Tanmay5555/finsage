"use client";

import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Sparkles, Sun, Calendar, Palette, Check, Clock, Lock, ShieldCheck } from "lucide-react";
import clsx from "clsx";

export default function ThemeSelectorWidget({ className = "" }) {
  const { mode, theme, setThemeMode, selectManualTheme, allThemes, activeFestival, isAdmin } = useTheme();
  const [open, setOpen] = useState(false);

  const timeThemes = allThemes.filter((t) => t.category === "time");
  const festivalThemes = allThemes.filter((t) => t.category === "festival");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-300 shadow-md backdrop-blur-md",
            theme.badgeBg || "bg-purple-500/20 text-purple-200 border-purple-500/30",
            className
          )}
        >
          <span className="text-base animate-bounce">{theme.icon}</span>
          <div className="flex flex-col items-start leading-tight">
            <span className="font-semibold text-white truncate max-w-[130px]">{theme.name}</span>
            <span className="text-[10px] text-gray-300 flex items-center gap-1 opacity-80">
              {mode === "auto-festival" ? (
                <>
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Auto Festival
                </>
              ) : mode === "auto-time" ? (
                <>
                  <Clock className="w-2.5 h-2.5 text-sky-300" /> Auto Time
                </>
              ) : (
                <>
                  <Palette className="w-2.5 h-2.5 text-pink-300" /> Custom Lock
                </>
              )}
            </span>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 bg-[#12162b]/95 backdrop-blur-xl border border-white/15 text-white p-4 shadow-2xl rounded-2xl z-50 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2 font-bold text-sm text-purple-300">
            <Palette className="w-4 h-4 text-purple-400" /> Dynamic Theme Studio
          </div>
          {isAdmin ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3" /> Admin Mode
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Standard User
            </span>
          )}
        </div>

        {/* Mode Selector Options */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Automatic Modes</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setThemeMode("auto-festival");
              }}
              className={clsx(
                "flex flex-col items-start p-2.5 rounded-xl border text-left transition-all text-xs relative overflow-hidden",
                mode === "auto-festival"
                  ? "bg-purple-600/30 border-purple-500 text-white font-semibold shadow-lg shadow-purple-500/20"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10",
                !isAdmin && "opacity-80"
              )}
            >
              <div className="w-full flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" /> Auto Festival
                </span>
                {!isAdmin && <Lock className="w-3 h-3 text-amber-400/80" />}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 leading-snug">
                {isAdmin
                  ? activeFestival
                    ? `Active: ${activeFestival.name}`
                    : "Adapts to calendar fests"
                  : "Admin Only 🔒"}
              </span>
            </button>

            <button
              onClick={() => {
                setThemeMode("auto-time");
              }}
              className={clsx(
                "flex flex-col items-start p-2.5 rounded-xl border text-left transition-all text-xs",
                mode === "auto-time"
                  ? "bg-blue-600/30 border-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
              )}
            >
              <span className="flex items-center gap-1.5 font-medium text-sky-300">
                <Clock className="w-3.5 h-3.5" /> Auto Time
              </span>
              <span className="text-[10px] text-gray-400 mt-1 leading-snug">Morning, Sunset & Night</span>
            </button>
          </div>
        </div>

        {/* Festival Preset Themes */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" /> Festival Celebrations
            </p>
            {!isAdmin && (
              <span className="text-[10px] text-amber-400/90 flex items-center gap-0.5 font-medium">
                <Lock className="w-2.5 h-2.5" /> Admin Only
              </span>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {festivalThemes.map((t) => {
              const isSelected = theme.id === t.id && mode === "manual";
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    selectManualTheme(t.id);
                  }}
                  className={clsx(
                    "w-full flex items-center justify-between p-2 rounded-xl text-xs transition border",
                    isSelected
                      ? "bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-purple-400 text-white font-semibold"
                      : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white",
                    !isAdmin && "opacity-70 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{t.icon}</span>
                    <span className="truncate">{t.name}</span>
                  </div>
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 text-purple-300" />
                  ) : !isAdmin ? (
                    <Lock className="w-3 h-3 text-amber-400/70" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Preset Themes */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Sun className="w-3 h-3 text-sky-400" /> Time of Day Presets
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {timeThemes.map((t) => {
              const isSelected = theme.id === t.id && mode === "manual";
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    selectManualTheme(t.id);
                  }}
                  className={clsx(
                    "flex items-center gap-1.5 p-2 rounded-xl text-xs transition border text-left",
                    isSelected
                      ? "bg-purple-600/40 border-purple-400 text-white font-semibold"
                      : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span>{t.icon}</span>
                  <span className="truncate text-[11px]">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
