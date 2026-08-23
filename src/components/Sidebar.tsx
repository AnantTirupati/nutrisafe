"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Shield, LayoutDashboard, User, Scan, History, LogOut, Bot, Salad, Bookmark, Crown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "Scan history", icon: History },
  { href: "/diet-plan", label: "Diet & Plan", icon: Salad },
  { href: "/my-plans", label: "My Plans", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: User },
];

const HEALTH_AI_ITEM = { label: "Health AI", icon: Bot };

function Logo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 font-extrabold text-primary-700"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <Shield className="h-7 w-7 shrink-0" />
      NutriSafe
    </Link>
  );
}

function NavLinks({ pathname, isPremium, onNavigate }: { pathname: string; isPremium?: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {nav.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === href
              ? "bg-primary-50 text-primary-700"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1">{label}</span>
          {href === "/diet-plan" && isPremium && (
            <Crown className="h-4 w-4 shrink-0 text-amber-500" />
          )}
        </Link>
      ))}
      <button
        type="button"
        onClick={() => {
          document.getElementById("health-chatbot-toggle")?.click();
          onNavigate?.();
        }}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        <HEALTH_AI_ITEM.icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{HEALTH_AI_ITEM.label}</span>
      </button>

      <div className="mt-8 mb-2 rounded-2xl bg-primary-50 p-4 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <Scan className="h-5 w-5" />
        </div>
        <p className="text-sm font-bold text-slate-900">Get Mobile App</p>
        <p className="mt-1 text-xs text-slate-500">Scan foods on the go</p>
      </div>
    </nav>
  );
}

function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      aria-label="Sign out"
      title="Sign out"
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        className
      )}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      Sign out
    </button>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isPremium = session?.user?.isPremium;
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop: fixed left rail */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
        <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-6">
          <Logo />
        </div>
        <div className="p-4 pb-0">
          <Link href="/scan" className="flex w-full items-center justify-between rounded-xl bg-primary-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-800 shadow-sm shadow-primary-700/20">
            Scan &amp; Safe Foods <span>+</span>
          </Link>
        </div>
        <NavLinks pathname={pathname} isPremium={isPremium} />
        <div className="shrink-0 border-t border-slate-200 p-3">
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile: slim top bar + hamburger */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setDrawerOpen((v) => !v)}
          aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={drawerOpen}
          aria-controls="mobile-sidebar-drawer"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile: drawer + scrim */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        id="mobile-sidebar-drawer"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white shadow-xl transition-transform duration-200 lg:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6">
          <Logo />
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 pb-0">
          <Link onClick={() => setDrawerOpen(false)} href="/scan" className="flex w-full items-center justify-between rounded-xl bg-primary-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-800 shadow-sm shadow-primary-700/20">
            Scan &amp; Safe Foods <span>+</span>
          </Link>
        </div>
        <NavLinks pathname={pathname} isPremium={isPremium} onNavigate={() => setDrawerOpen(false)} />
        <div className="shrink-0 border-t border-slate-200 p-3">
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
