"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Network,
  Cpu,
  Palette,
  Cloud,
  Layers,
  Search,
  ArrowRight,
  Database,
  Sparkles,
  ShieldCheck,
  Zap,
  Code2,
  FileCode
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import clsx from "clsx";

const ARCHITECTURE_LAYERS = [
  {
    id: "frontend",
    title: "🖥️ Next.js App Router Layer",
    badge: "Frontend",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    nodes: [
      {
        name: "Root Layout & Global Providers",
        desc: "Root HTML structure wrapping AuthProvider, CurrencyProvider, ThemeProvider, and Toast notifications.",
        path: "src/app/layout.jsx"
      },
      {
        name: "Dashboard Shell & Ambient Glow",
        desc: "Protected layout with auth verification, ambient glowing background orbs, ThemeParticles, and responsive Sidebar navigation.",
        path: "src/components/layouts/DashboardLayout.jsx"
      },
      {
        name: "Main Financial Dashboard",
        desc: "Overview of user balances, real-time income vs expense charts, Gemini AI advice cards, and monthly transaction history.",
        path: "src/app/dashboard/page.jsx"
      },
      {
        name: "Savings Goals & AI Milestone Planner",
        desc: "Goal target creator, deposit tracker, and Gemini AI milestone recommendation engine.",
        path: "src/app/goals/page.jsx"
      }
    ]
  },
  {
    id: "theme",
    title: "🎨 Dynamic Theme & Aesthetics Engine",
    badge: "Visuals",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    nodes: [
      {
        name: "Preset Registry & Date/Time Detectors",
        desc: "Preset definitions for 4 Time Themes (Morning, Day, Sunset, Midnight) & 7 Festival Themes (Diwali, Holi, Navratri, Christmas, Eid, Tricolor, Halloween).",
        path: "src/lib/themes.js"
      },
      {
        name: "Theme Context & Admin Guard",
        desc: "Manages theme state with automatic festival & time detectors. Restricts Festival Themes strictly to Admin accounts.",
        path: "src/context/ThemeContext.jsx"
      },
      {
        name: "Floating Theme Micro-Particles",
        desc: "Framer Motion floating particles (glowing Diyas for Diwali, Gulal for Holi, Sunbeams for Morning, Snowflakes for Christmas).",
        path: "src/components/ui/ThemeParticles.jsx"
      },
      {
        name: "Header Theme Popover Widget",
        desc: "Top header popover widget for instant 1-click theme switching with Admin lock badges.",
        path: "src/components/ui/ThemeSelectorWidget.jsx"
      }
    ]
  },
  {
    id: "api",
    title: "⚙️ Next.js Serverless API Routes",
    badge: "Backend API",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    nodes: [
      {
        name: "Gemini AI Financial Insights API",
        desc: "Processes user budget summaries and streams personalized financial advice via Google Gemini 2.5 Flash API.",
        path: "src/app/api/insight/route.js"
      },
      {
        name: "Receipt OCR Amount Extractor",
        desc: "Extracts amounts, merchant names, and transaction dates from uploaded images & PDFs using Google Cloud Vision.",
        path: "src/app/api/amount-extract/route.js"
      },
      {
        name: "Bank Statement PDF Parser",
        desc: "Parses multi-page PDF bank statements and structures bulk transactions into Firestore database.",
        path: "src/app/api/file-transaction/route.js"
      },
      {
        name: "Financial Metrics Aggregator",
        desc: "Aggregates monthly income vs expense metrics and category breakdowns for statistics charts.",
        path: "src/app/api/stats/summary/route.js"
      }
    ]
  },
  {
    id: "cloud",
    title: "☁️ Firebase & Cloud Services",
    badge: "Cloud DB & AI",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    nodes: [
      {
        name: "Firebase App & Auth Handle",
        desc: "Sanitized Firebase initialization exporting auth, Firestore db, and storage handles.",
        path: "src/lib/firebase.js"
      },
      {
        name: "Auth Context & Admin Role Evaluator",
        desc: "Manages user login, registration, auth listener subscriber, and admin authorization verification.",
        path: "src/context/AuthContext.jsx"
      },
      {
        name: "Cloud Firestore Collections",
        desc: "NoSQL database collections (`incomes`, `expenses`, `goals`, `users`) indexed by userId.",
        path: "Cloud Firestore DB"
      },
      {
        name: "Google Gemini 2.5 Flash AI Engine",
        desc: "High-speed generative AI model powering financial advice, tips, and natural language categorization.",
        path: "@google/genai SDK"
      }
    ]
  }
];

export default function LiveArchitecturePage() {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLayers = ARCHITECTURE_LAYERS.filter((layer) => {
    if (selectedCategory !== "all" && layer.id !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const titleMatch = layer.title.toLowerCase().includes(q);
    const nodeMatch = layer.nodes.some(
      (n) => n.name.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q) || n.path.toLowerCase().includes(q)
    );
    return titleMatch || nodeMatch;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 text-white">
        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold mb-2">
              <Network className="w-3.5 h-3.5" /> Interactive System Visualizer
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span className={clsx("bg-gradient-to-r bg-clip-text text-transparent", theme.headerGradient)}>
                Finsage AI Live Architecture
              </span>
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              Explore the end-to-end component topology, Next.js serverless API routes, AI engine pipelines, and Cloud Firestore structure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/archify.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition flex items-center gap-2"
            >
              <FileCode className="w-4 h-4" /> Open Fullscreen Visual Map ↗
            </a>
          </div>
        </header>

        {/* Data Pipeline Walkthrough Flow */}
        <Card className="bg-[#12162b]/80 border border-purple-500/20 shadow-2xl backdrop-blur-xl text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-purple-300">
              <Zap className="w-5 h-5 text-yellow-400" /> End-to-End Financial Processing Pipeline
            </CardTitle>
            <CardDescription className="text-gray-300 text-xs">
              How user actions flow from client interactions through serverless APIs to AI and Cloud Firestore.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 relative">
                <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                  <span>STEP 1</span>
                  <span>🖥️ Client</span>
                </div>
                <h4 className="font-semibold text-sm text-white">User Interaction</h4>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  User uploads a receipt image/PDF, creates a savings goal, or requests AI financial advice.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 relative">
                <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                  <span>STEP 2</span>
                  <span>⚙️ API Layer</span>
                </div>
                <h4 className="font-semibold text-sm text-white">Next.js Serverless Route</h4>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Route handler receives payload (`/api/amount-extract` or `/api/insight`), sanitizes input, and invokes cloud SDKs.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 relative">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>STEP 3</span>
                  <span>🤖 AI Engine</span>
                </div>
                <h4 className="font-semibold text-sm text-white">Cloud Vision & Gemini 2.5</h4>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Cloud Vision extracts amounts from images; Gemini 2.5 Flash generates tailored savings advice & tips.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 relative">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>STEP 4</span>
                  <span>☁️ Persistence</span>
                </div>
                <h4 className="font-semibold text-sm text-white">Cloud Firestore DB</h4>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Structured transaction data is saved to user-scoped Firestore collections (`expenses`, `incomes`, `goals`).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setSelectedCategory("all")}
              className={clsx(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition",
                selectedCategory === "all" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              )}
            >
              All Layers
            </button>
            <button
              onClick={() => setSelectedCategory("frontend")}
              className={clsx(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition",
                selectedCategory === "frontend" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              )}
            >
              Frontend
            </button>
            <button
              onClick={() => setSelectedCategory("theme")}
              className={clsx(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition",
                selectedCategory === "theme" ? "bg-pink-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              )}
            >
              Theme Engine
            </button>
            <button
              onClick={() => setSelectedCategory("api")}
              className={clsx(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition",
                selectedCategory === "api" ? "bg-sky-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              )}
            >
              API Routes
            </button>
            <button
              onClick={() => setSelectedCategory("cloud")}
              className={clsx(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition",
                selectedCategory === "cloud" ? "bg-emerald-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              )}
            >
              Firebase & AI
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search components or APIs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border-white/15 text-white text-xs pl-9 rounded-xl focus:border-cyan-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* System Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLayers.map((layer) => (
            <Card key={layer.id} className="bg-[#161b33]/90 border border-white/10 text-white shadow-xl">
              <CardHeader className="pb-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    {layer.title}
                  </CardTitle>
                  <span className={clsx("text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase", layer.badgeColor)}>
                    {layer.badge}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {layer.nodes.map((node, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition space-y-1">
                    <div className="font-semibold text-sm text-white flex items-center justify-between">
                      <span>{node.name}</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{node.desc}</p>
                    <span className="font-mono text-[10px] text-purple-300 block pt-1">{node.path}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
