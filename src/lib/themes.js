/**
 * Theme Definitions & Automatic Date/Time Detectors for Finsage
 */

export const THEME_CATEGORIES = {
  TIME: "time",
  FESTIVAL: "festival"
};

export const THEMES = [
  // --- TIME BASED THEMES ---
  {
    id: "time-morning",
    name: "Morning Sunrise",
    category: THEME_CATEGORIES.TIME,
    icon: "🌅",
    description: "Golden hour sunrise with warm energetic hues",
    bgClass: "bg-slate-950",
    gradientFrom: "#1e1b4b",
    gradientVia: "#31103f",
    gradientTo: "#451a03",
    orbPrimary: "rgba(245, 158, 11, 0.25)", // Amber glow
    orbSecondary: "rgba(239, 68, 68, 0.2)", // Rose glow
    accentColor: "#f59e0b",
    textColor: "text-amber-300",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    cardBg: "rgba(30, 27, 75, 0.7)",
    headerGradient: "from-amber-400 via-orange-500 to-rose-500",
    particles: "sunbeams"
  },
  {
    id: "time-afternoon",
    name: "Day Breeze",
    category: THEME_CATEGORIES.TIME,
    icon: "☀️",
    description: "Bright energetic sky blue & emerald daylight",
    bgClass: "bg-slate-950",
    gradientFrom: "#0c2340",
    gradientVia: "#064e3b",
    gradientTo: "#0f172a",
    orbPrimary: "rgba(14, 165, 233, 0.25)", // Sky blue glow
    orbSecondary: "rgba(16, 185, 129, 0.2)", // Emerald glow
    accentColor: "#38bdf8",
    textColor: "text-sky-300",
    badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    cardBg: "rgba(15, 30, 55, 0.7)",
    headerGradient: "from-sky-400 via-teal-400 to-emerald-400",
    particles: "clouds"
  },
  {
    id: "time-evening",
    name: "Sunset Twilight",
    category: THEME_CATEGORIES.TIME,
    icon: "🌆",
    description: "Deep crimson, coral pink & violet twilight glow",
    bgClass: "bg-slate-950",
    gradientFrom: "#2e1065",
    gradientVia: "#4c0519",
    gradientTo: "#18181b",
    orbPrimary: "rgba(236, 72, 153, 0.25)", // Pink glow
    orbSecondary: "rgba(168, 85, 247, 0.2)", // Purple glow
    accentColor: "#f472b6",
    textColor: "text-pink-300",
    badgeBg: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    cardBg: "rgba(40, 15, 55, 0.7)",
    headerGradient: "from-pink-400 via-rose-400 to-purple-500",
    particles: "twilight-stars"
  },
  {
    id: "time-night",
    name: "Galactic Midnight",
    category: THEME_CATEGORIES.TIME,
    icon: "🌌",
    description: "Deep obsidian dark mode with electric purple cyan ambience",
    bgClass: "bg-[#090a15]",
    gradientFrom: "#0c0d1d",
    gradientVia: "#12152d",
    gradientTo: "#191d3d",
    orbPrimary: "rgba(147, 51, 234, 0.2)", // Purple glow
    orbSecondary: "rgba(79, 70, 229, 0.2)", // Indigo glow
    accentColor: "#c084fc",
    textColor: "text-purple-300",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    cardBg: "rgba(22, 27, 51, 0.75)",
    headerGradient: "from-purple-400 via-pink-400 to-blue-500",
    particles: "stars"
  },

  // --- FESTIVAL BASED THEMES ---
  {
    id: "festival-diwali",
    name: "Diwali Lights 🪔",
    category: THEME_CATEGORIES.FESTIVAL,
    icon: "🪔",
    description: "Sparkling royal gold, warm diya crimson & grand festive cheer",
    bgClass: "bg-[#180905]",
    gradientFrom: "#3a0905",
    gradientVia: "#4a1c03",
    gradientTo: "#1a0826",
    orbPrimary: "rgba(245, 158, 11, 0.35)", // Golden Diyas glow
    orbSecondary: "rgba(220, 38, 38, 0.3)", // Ruby Red glow
    accentColor: "#fbbf24",
    textColor: "text-yellow-300",
    badgeBg: "bg-amber-500/30 text-amber-300 border-amber-400/40 glow-purple",
    cardBg: "rgba(45, 15, 10, 0.8)",
    headerGradient: "from-yellow-300 via-amber-400 to-red-500",
    particles: "diyas",
    // Festival active window (approx Diwali window: Oct 15 - Nov 15)
    isFestivalActive: (month, day) => (month === 9 && day >= 20) || (month === 10 && day <= 15)
  },
  {
    id: "festival-holi",
    name: "Holi Color Splash 🎨",
    category: THEME_CATEGORIES.FESTIVAL,
    icon: "🎨",
    description: "High-energy vibrant gulal colors: Magenta, Cyan & Bright Yellow",
    bgClass: "bg-[#140824]",
    gradientFrom: "#581c87",
    gradientVia: "#be185d",
    gradientTo: "#0369a1",
    orbPrimary: "rgba(236, 72, 153, 0.35)", // Bright Pink
    orbSecondary: "rgba(6, 182, 212, 0.35)", // Cyan
    accentColor: "#f43f5e",
    textColor: "text-pink-300",
    badgeBg: "bg-pink-500/30 text-pink-200 border-pink-400/40",
    cardBg: "rgba(45, 15, 60, 0.8)",
    headerGradient: "from-pink-400 via-yellow-400 to-cyan-400",
    particles: "colorsplash",
    // Festival active window (approx Holi window: March 1 - March 31)
    isFestivalActive: (month, day) => month === 2
  },
  {
    id: "festival-navratri",
    name: "Navratri Garba 💃",
    category: THEME_CATEGORIES.FESTIVAL,
    icon: "💃",
    description: "Royal Garba tones: Marigold orange, peacock violet & vibrant magenta",
    bgClass: "bg-[#1d061a]",
    gradientFrom: "#4a044e",
    gradientVia: "#7c2d12",
    gradientTo: "#1e1b4b",
    orbPrimary: "rgba(249, 115, 22, 0.35)", // Orange glow
    orbSecondary: "rgba(192, 38, 211, 0.35)", // Magenta glow
    accentColor: "#fb923c",
    textColor: "text-orange-300",
    badgeBg: "bg-orange-500/30 text-orange-200 border-orange-400/40",
    cardBg: "rgba(45, 10, 40, 0.8)",
    headerGradient: "from-orange-400 via-amber-300 to-fuchsia-400",
    particles: "dandia-sparkles",
    // Festival active window (approx Navratri window: Oct 1 - Oct 20)
    isFestivalActive: (month, day) => month === 9 && day >= 1 && day <= 19
  },
  {
    id: "festival-christmas",
    name: "Christmas & New Year 🎄",
    category: THEME_CATEGORIES.FESTIVAL,
    icon: "🎄",
    description: "Festive Crimson red, Pine forest emerald & sparkling silver snow",
    bgClass: "bg-[#051a14]",
    gradientFrom: "#064e3b",
    gradientVia: "#881337",
    gradientTo: "#0f172a",
    orbPrimary: "rgba(225, 29, 72, 0.35)", // Crimson glow
    orbSecondary: "rgba(16, 185, 129, 0.35)", // Emerald glow
    accentColor: "#f43f5e",
    textColor: "text-emerald-300",
    badgeBg: "bg-emerald-500/30 text-emerald-200 border-emerald-400/40",
    cardBg: "rgba(10, 40, 30, 0.8)",
    headerGradient: "from-red-400 via-amber-300 to-emerald-400",
    particles: "snowflakes",
    // Festival active window (Dec 15 - Jan 5)
    isFestivalActive: (month, day) => (month === 11 && day >= 15) || (month === 0 && day <= 5)
  },
  {
    id: "festival-eid",
    name: "Eid Crescent 🌙",
    category: THEME_CATEGORIES.FESTIVAL,
    icon: "🌙",
    description: "Deep Emerald Green, Crescent Gold & Moonlit night elegance",
    bgClass: "bg-[#022016]",
    gradientFrom: "#022c22",
    gradientVia: "#064e3b",
    gradientTo: "#14532d",
    orbPrimary: "rgba(52, 211, 153, 0.35)", // Jade Emerald
    orbSecondary: "rgba(251, 191, 36, 0.3)", // Crescent Gold
    accentColor: "#34d399",
    textColor: "text-emerald-300",
    badgeBg: "bg-emerald-500/30 text-emerald-200 border-emerald-400/40",
    cardBg: "rgba(5, 45, 30, 0.8)",
    headerGradient: "from-emerald-300 via-teal-400 to-amber-300",
    particles: "crescent-stars",
    // Festival active window (approx April/May window)
    isFestivalActive: (month, day) => (month === 3 && day >= 10) || (month === 4 && day <= 15)
  },
  {
    id: "festival-independence",
    name: "Patriotic Tricolor 🇮🇳",
    category: THEME_CATEGORIES.FESTIVAL,
    icon: "🇮🇳",
    description: "Saffron, Snow Pure White, Emerald Green & Ashoka Navy Blue",
    bgClass: "bg-[#0c1829]",
    gradientFrom: "#7c2d12",
    gradientVia: "#0f172a",
    gradientTo: "#064e3b",
    orbPrimary: "rgba(249, 115, 22, 0.35)", // Saffron
    orbSecondary: "rgba(16, 185, 129, 0.35)", // Green
    accentColor: "#f97316",
    textColor: "text-orange-300",
    badgeBg: "bg-orange-500/30 text-orange-200 border-orange-400/40",
    cardBg: "rgba(20, 30, 50, 0.85)",
    headerGradient: "from-orange-400 via-slate-100 to-emerald-400",
    particles: "tricolor-sparks",
    // Festival active window (Aug 10-18, Jan 23-28)
    isFestivalActive: (month, day) =>
      (month === 7 && day >= 10 && day <= 18) || (month === 0 && day >= 23 && day <= 28)
  },
  {
    id: "festival-halloween",
    name: "Spooky Halloween 🎃",
    category: THEME_CATEGORIES.FESTIVAL,
    icon: "🎃",
    description: "Pumpkin Orange, Spooky Purple & Ghostly Lime ambience",
    bgClass: "bg-[#180924]",
    gradientFrom: "#4c1d95",
    gradientVia: "#7c2d12",
    gradientTo: "#09090b",
    orbPrimary: "rgba(249, 115, 22, 0.35)", // Pumpkin Orange
    orbSecondary: "rgba(147, 51, 234, 0.35)", // Spooky Purple
    accentColor: "#f97316",
    textColor: "text-orange-300",
    badgeBg: "bg-purple-500/30 text-orange-300 border-orange-400/40",
    cardBg: "rgba(35, 15, 50, 0.8)",
    headerGradient: "from-orange-400 via-purple-400 to-lime-400",
    particles: "halloween-bats",
    // Festival active window (Oct 25 - Nov 2)
    isFestivalActive: (month, day) => month === 9 && day >= 25
  }
];

/**
 * Determine Time of Day Theme based on local hour (0-23)
 */
export function getTimeOfDayTheme(hour = new Date().getHours()) {
  if (hour >= 6 && hour < 12) {
    return THEMES.find((t) => t.id === "time-morning");
  } else if (hour >= 12 && hour < 17) {
    return THEMES.find((t) => t.id === "time-afternoon");
  } else if (hour >= 17 && hour < 20) {
    return THEMES.find((t) => t.id === "time-evening");
  } else {
    return THEMES.find((t) => t.id === "time-night");
  }
}

/**
 * Determine if any festival theme is currently active for the given date
 */
export function getActiveFestivalTheme(date = new Date()) {
  const month = date.getMonth(); // 0-indexed (0 = Jan, 9 = Oct, 10 = Nov)
  const day = date.getDate();

  const festival = THEMES.find(
    (t) => t.category === THEME_CATEGORIES.FESTIVAL && t.isFestivalActive && t.isFestivalActive(month, day)
  );

  return festival || null;
}
