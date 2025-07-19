// src/components/BottomNav.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Plus, PieChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Add", href: "/dashboard/expenses", icon: Plus },
  { name: "Insights", href: "/dashboard/insights", icon: PieChart },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-md md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center text-xs text-muted-foreground transition hover:text-primary",
                isActive && "text-primary"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              {item.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
