"use client";

import React from "react";
import { useCurrency, CURRENCIES } from "@/context/CurrencyContext";
import { Globe } from "lucide-react";

export function CurrencySelector({ className = "" }) {
  const { currency, setCurrencyCode } = useCurrency();

  return (
    <div className={`flex items-center gap-2 bg-[#1f2547] text-white px-3 py-1.5 rounded-lg border border-white/10 shadow-sm ${className}`}>
      <Globe className="w-4 h-4 text-purple-400" />
      <span className="text-xs text-gray-300 font-medium">Currency:</span>
      <select
        value={currency.code}
        onChange={(e) => setCurrencyCode(e.target.value)}
        className="bg-transparent text-xs font-semibold text-purple-300 focus:outline-none cursor-pointer pr-1"
      >
        {Object.values(CURRENCIES).map((c) => (
          <option key={c.code} value={c.code} className="bg-[#1f2547] text-white">
            {c.symbol} {c.code} ({c.name})
          </option>
        ))}
      </select>
    </div>
  );
}
