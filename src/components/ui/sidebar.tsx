import Link from "next/link";
import { LayoutDashboard, Receipt, BarChart2, User } from "lucide-react";
import Image from "next/image";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#0e0f23] text-white flex flex-col p-6 border-r border-gray-800">
      <div className="mb-10">
        <h1 className="text-xl font-bold">💸 Finsage</h1>
        <p className="text-xs text-muted-foreground">Finance Assistant</p>
      </div>

      <nav className="flex-1 space-y-4">
        <Link href="/dashboard" className="flex items-center gap-2 hover:text-primary">
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        <Link href="/dashboard/receipts" className="flex items-center gap-2 hover:text-primary">
          <Receipt className="w-5 h-5" />
          Receipts
        </Link>
        <Link href="/dashboard/statistics" className="flex items-center gap-2 hover:text-primary">
          <BarChart2 className="w-5 h-5" />
          Statistics
        </Link>
        <Link href="/dashboard/account" className="flex items-center gap-2 hover:text-primary">
          <User className="w-5 h-5" />
          Account
        </Link>
      </nav>

      <div className="mt-auto text-sm">
        <div className="text-xs text-muted-foreground">Trial: 7 days left</div>
        <button className="mt-2 bg-blue-600 rounded px-3 py-1 text-sm font-semibold">Upgrade</button>
      </div>
    </aside>
  );
}

export {Sidebar}