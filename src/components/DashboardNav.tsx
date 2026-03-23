"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Shield, LayoutDashboard, User, Scan, History, Heart, LogOut, Bot, Salad } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scan", label: "Scan food", icon: Scan },
  { href: "/history", label: "Scan history", icon: History },
  { href: "/safe-foods", label: "Safe for me", icon: Heart },
  { href: "/diet-plan", label: "Diet & Plan", icon: Salad },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/dashboard#health-ai", label: "Health AI", icon: Bot },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-primary-700">
          <Shield className="h-7 w-7" />
          NutriSafe
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
