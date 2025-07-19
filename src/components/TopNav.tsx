// src/components/TopNav.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export default function TopNav() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur bg-background/80 border-b border-border">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <h1
          className="text-lg font-semibold tracking-tight text-primary cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          Finsage
        </h1>

        {user && (
          <Button
            onClick={handleLogout}
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
