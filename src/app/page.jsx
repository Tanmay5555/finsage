"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Zap, TrendingUp, Brain, FileUp, Globe, Target } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const features = [
    { icon: TrendingUp, title: "Income & Expense Tracking", desc: "Monitor daily, monthly, and yearly transactions with dynamic currency support.", color: "text-emerald-400" },
    { icon: Brain, title: "AI Financial Insights", desc: "Get intelligent, personalized budget recommendations powered by Google Gemini AI.", color: "text-purple-400" },
    { icon: Target, title: "Smart Savings Goals", desc: "Set financial goals, track milestone progress, and receive AI deposit plans.", color: "text-blue-400" },
    { icon: FileUp, title: "Bank Statement OCR", desc: "Extract statement transactions automatically from PDF, Excel, CSV, or receipt images.", color: "text-indigo-400" },
    { icon: Globe, title: "Multi-Currency Switcher", desc: "Instantly convert your entire dashboard between USD, EUR, INR, GBP, and JPY.", color: "text-amber-400" },
    { icon: ShieldCheck, title: "Secure Cloud Backup", desc: "All your data is encrypted and backed up in real time using Google Firebase.", color: "text-teal-400" }
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#090a15] text-white overflow-hidden flex flex-col justify-between">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Background Grid */}
      <InteractiveGridPattern
        className={cn(
          "absolute inset-0 -z-10 opacity-30",
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
        )}
        width={30}
        height={30}
        squares={[60, 60]}
        squaresClassName="fill-purple-500/20 hover:fill-purple-500/60"
      />

      {/* Header Navigation */}
      <header className="px-6 py-5 max-w-7xl w-full mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Finsage Logo" className="w-10 h-10 rounded-xl object-cover border border-purple-500/30 shadow-lg glow-purple" />
          <span className="text-2xl font-extrabold tracking-tight gradient-text-purple">Finsage</span>
        </div>

        <div>
          {user ? (
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow-lg hover:shadow-purple-500/25 transition">
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10 font-medium rounded-xl">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-xl shadow-lg hover:shadow-purple-500/25 transition">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-5xl w-full text-center space-y-8">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold backdrop-blur-md shadow-lg"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-bounce" />
            AI-Driven Personal Wealth & Finance Copilot
          </motion.div>

          {/* Hero Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight"
          >
            Take Control of Your Wealth with <br />
            <span className="gradient-text-purple">Finsage AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Track income, analyze expenses, extract statement transactions with OCR, and achieve smart savings goals with real-time AI guidance.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 pt-2"
          >
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-purple-500/30 transition transform hover:-translate-y-0.5">
                  🚀 Launch Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-purple-500/30 transition transform hover:-translate-y-0.5">
                    ✨ Create Free Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-purple-500/40 text-purple-300 hover:bg-purple-600/20 text-lg px-8 py-6 rounded-2xl backdrop-blur-md transition">
                    🔐 Login to Finsage
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Feature Grid with Framer Motion Entrance */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
          >
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="glass-card p-6 rounded-2xl border border-white/10 hover:border-purple-500/40 transition duration-300 relative group overflow-hidden"
                >
                  <div className="p-3 bg-[#171a36] rounded-xl w-fit mb-4 border border-white/10 group-hover:border-purple-500/30 transition">
                    <Icon className={cn("w-6 h-6", feat.color)} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400 relative z-10 border-t border-white/10 bg-[#090a15]/80 backdrop-blur-md">
        Developed with ❤️ by <span className="font-semibold text-white">Finsage Team</span> — <span className="gradient-text-purple font-bold">Tanmay Gupta</span>
      </footer>
    </div>
  );
}