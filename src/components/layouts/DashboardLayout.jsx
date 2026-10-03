"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import ThemeParticles from "@/components/ui/ThemeParticles";
import ThemeSelectorWidget from "@/components/ui/ThemeSelectorWidget";
import { motion } from "framer-motion";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0b16] text-purple-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium animate-pulse">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Generate dynamic inline background gradient based on active theme
  const backgroundStyle = {
    backgroundImage: `radial-gradient(ellipse at top left, ${theme.gradientFrom} 0%, ${theme.gradientVia} 40%, ${theme.gradientTo} 100%)`
  };

  return (
    <div
      style={backgroundStyle}
      className="flex h-screen text-white relative overflow-hidden transition-all duration-700 ease-in-out"
    >
      {/* Dynamic Background Ambient Glowing Orbs */}
      <div
        className="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: theme.orbPrimary || "rgba(147, 51, 234, 0.2)" }}
      />
      <div
        className="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: theme.orbSecondary || "rgba(79, 70, 229, 0.2)" }}
      />

      {/* Floating Theme Particles / Sparkles */}
      <ThemeParticles />

      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Top Header Bar with Theme Selector */}
        <header className="px-4 md:px-8 pt-4 pb-2 flex items-center justify-end gap-3 z-20">
          <ThemeSelectorWidget />
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 relative z-10">
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}