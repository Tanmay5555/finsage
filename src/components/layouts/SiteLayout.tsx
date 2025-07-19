"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">
            Finsage 💰
          </Link>

          <nav className="space-x-4 text-sm">
            {user ? (
              <>
                <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                <Button size="sm" variant="destructive" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:underline">Login</Link>
                <Link href="/register" className="hover:underline">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-muted/50 px-4 py-6">
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-white px-4 py-3 text-center text-sm text-muted-foreground">
        Built with 💖 by <strong>Finsage</strong> · 2025
      </footer>
    </div>
  );
}
