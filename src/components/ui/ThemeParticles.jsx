"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeParticles() {
  const { theme } = useTheme();

  const particleItems = useMemo(() => {
    const type = theme.particles || "stars";
    const count = 14;

    const symbols = {
      diyas: ["🪔", "✨", "🪔", "🔥", "✨"],
      colorsplash: ["🎨", "💖", "💛", "💙", "✨"],
      "dandia-sparkles": ["💃", "✨", "💫", "🪔", "✨"],
      snowflakes: ["❄️", "✨", "🌨️", "⭐", "❄️"],
      "crescent-stars": ["🌙", "⭐", "✨", "🌟", "⭐"],
      "tricolor-sparks": ["🧡", "🤍", "💚", "✨", "🇮🇳"],
      "halloween-bats": ["🦇", "🎃", "👻", "✨", "🎃"],
      sunbeams: ["🌅", "✨", "☀️", "⭐"],
      clouds: ["☀️", "☁️", "✨", "🌤️"],
      "twilight-stars": ["🌅", "✨", "💖", "💫"],
      stars: ["✨", "💫", "⭐", "✨"]
    };

    const currentSymbols = symbols[type] || symbols.stars;

    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      symbol: currentSymbols[i % currentSymbols.length],
      left: `${(i * 7 + (i % 3) * 23) % 94 + 3}%`,
      top: `${(i * 11 + (i % 5) * 19) % 90 + 5}%`,
      duration: 6 + (i % 5) * 2.5,
      delay: (i % 4) * 0.8,
      size: 14 + (i % 4) * 6,
      opacity: 0.25 + (i % 3) * 0.15
    }));
  }, [theme.particles]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particleItems.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{
            opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5],
            y: [-12, 12, -12],
            x: [-6, 6, -6],
            scale: [0.9, 1.15, 0.9]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            fontSize: `${p.size}px`,
            filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))"
          }}
          className="select-none select-none opacity-40 hover:opacity-100 transition-opacity"
        >
          {p.symbol}
        </motion.div>
      ))}
    </div>
  );
}
