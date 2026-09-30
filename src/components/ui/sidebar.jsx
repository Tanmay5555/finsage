"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart2,
  IndianRupee,
  TrendingDown,
  User,
  Settings,
  Menu,
  X,
  FileUp,
  Target,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { CurrencySelector } from "@/components/ui/CurrencySelector";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-400", hoverBg: "hover:bg-blue-600/20" },
  { href: "/income", label: "Manage Income", icon: IndianRupee, color: "text-emerald-400", hoverBg: "hover:bg-emerald-600/20" },
  { href: "/expense", label: "Manage Expenses", icon: TrendingDown, color: "text-rose-400", hoverBg: "hover:bg-rose-600/20" },
  { href: "/goals", label: "Savings & AI Planner", icon: Target, color: "text-purple-400", hoverBg: "hover:bg-purple-600/20" },
  { href: "/upload-transactions", label: "Upload Bank Statement", icon: FileUp, color: "text-indigo-400", hoverBg: "hover:bg-indigo-600/20" },
  { href: "/statistics", label: "Statistics", icon: BarChart2, color: "text-amber-400", hoverBg: "hover:bg-amber-600/20" }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Toggle Button (Visible on small screens) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl bg-[#161b33] text-white border border-purple-500/30 shadow-lg backdrop-blur-md"
        >
          {isOpen ? <X className="w-6 h-6 text-purple-400" /> : <Menu className="w-6 h-6 text-purple-400" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed z-40 lg:static top-0 left-0 h-full w-64 bg-gradient-to-b from-[#0c0d1d] via-[#12152d] to-[#191d3d] text-white flex flex-col p-5 shadow-2xl border-r border-white/10 transition-transform duration-300 ease-in-out backdrop-blur-xl",
          {
            "-translate-x-full": !isOpen,
            "translate-x-0": isOpen,
            "lg:translate-x-0": true
          }
        )}
      >
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="mb-6 flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition cursor-pointer"
          >
            <img src="/logo.png" alt="Finsage Logo" className="w-9 h-9 rounded-lg object-cover border border-purple-500/30 shadow-md" />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight gradient-text-purple">Finsage AI</h1>
              <p className="text-[10px] text-purple-300 font-medium tracking-wide">Smart Financial Copilot</p>
            </div>
          </motion.div>
        </Link>

        {/* Currency Switcher Widget */}
        <div className="mb-5">
          <CurrencySelector className="w-full justify-between backdrop-blur-md" />
        </div>

        <nav className="flex-1 space-y-2 text-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition duration-200 font-medium relative group",
                    item.hoverBg,
                    isActive
                      ? "bg-purple-600/30 text-white font-semibold border border-purple-500/40 shadow-lg glow-purple"
                      : "text-gray-300 hover:text-white"
                  )}
                >
                  <Icon className={clsx("w-5 h-5 transition-transform group-hover:scale-110", item.color)} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10 text-sm space-y-2">
          <Link href="/account">
            <motion.div
              whileHover={{ x: 4 }}
              className={clsx(
                "flex items-center gap-3 px-3.5 py-2 rounded-xl transition hover:bg-white/10",
                pathname === "/account" ? "bg-white/10 text-white font-semibold" : "text-gray-400"
              )}
            >
              <User className="w-4 h-4 text-purple-300" />
              <span>Account</span>
            </motion.div>
          </Link>

          <Link href="/settings">
            <motion.div
              whileHover={{ x: 4 }}
              className={clsx(
                "flex items-center gap-3 px-3.5 py-2 rounded-xl transition hover:bg-white/10",
                pathname === "/settings" ? "bg-white/10 text-white font-semibold" : "text-gray-400"
              )}
            >
              <Settings className="w-4 h-4 text-purple-300" />
              <span>Settings</span>
            </motion.div>
          </Link>
        </div>
      </aside>

      {/* Overlay when sidebar is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}

export { Sidebar };