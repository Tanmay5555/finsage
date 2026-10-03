"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon, LogIn, Sparkles, ArrowRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import ThemeParticles from "@/components/ui/ThemeParticles";
import ThemeSelectorWidget from "@/components/ui/ThemeSelectorWidget";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      toast.success("Welcome back to Finsage! 👋");
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error details:", err);
      const code = err?.code || "";
      let message = err instanceof Error ? err.message : "Login failed. Please try again.";

      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        message = "Invalid email or password. Please verify your credentials.";
      } else if (code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (code === "auth/too-many-requests") {
        message = "Access temporarily disabled due to many failed login attempts. Reset password or try again later.";
      } else if (code === "auth/network-request-failed") {
        message = "Network connection failed. Please check your internet connection.";
      } else if (code === "auth/invalid-api-key" || message.includes("API key")) {
        message = "Firebase API Key configuration error. Please check your environment setup.";
      } else if (code === "auth/unauthorized-domain") {
        message = "This domain is not authorized in your Firebase Auth settings.";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const backgroundStyle = {
    backgroundImage: `radial-gradient(ellipse at top left, ${theme.gradientFrom} 0%, ${theme.gradientVia} 40%, ${theme.gradientTo} 100%)`
  };

  return (
    <div
      style={backgroundStyle}
      className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden text-white transition-all duration-700"
    >
      {/* Background Ambient Glowing Orbs */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: theme.orbPrimary || "rgba(147, 51, 234, 0.25)" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: theme.orbSecondary || "rgba(79, 70, 229, 0.25)" }}
      />

      {/* Floating Theme Particles */}
      <ThemeParticles />

      {/* Top Header Theme Selector */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeSelectorWidget />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <form
          onSubmit={handleLogin}
          className="bg-[#12162b]/80 backdrop-blur-2xl border border-white/15 p-8 rounded-3xl shadow-2xl space-y-6"
        >
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-purple-200 mb-2">
              <span className="text-base">{theme.icon}</span> Active: {theme.name}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2">
              <span className={`bg-gradient-to-r ${theme.headerGradient} bg-clip-text text-transparent`}>
                Finsage AI
              </span>
            </h1>
            <p className="text-sm text-gray-300">Sign in to access your financial co-pilot</p>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Email Address</label>
              <Input
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl h-11"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            )}
          </Button>

          {/* Footer Navigation */}
          <div className="text-center pt-2 text-sm text-gray-300 border-t border-white/10">
            Don’t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-purple-300 hover:text-white underline underline-offset-4 transition inline-flex items-center gap-1 ml-1"
            >
              Create Account <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}