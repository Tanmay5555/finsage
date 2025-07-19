// src/components/Shell.tsx
"use client";

import { ReactNode } from "react";
import TopNav from "./TopNav";
import BottomNav from "./BottomNav";

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
      <TopNav />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
