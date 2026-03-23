"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sparkles, Crown } from "lucide-react";

export function PremiumGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />
      </div>
    );
  }

  // If user is premium, render children normally
  if (session?.user?.isPremium) {
    return <>{children}</>;
  }

  // If NOT premium, show blurred overlay
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
      {/* Blurred "dummy" content simulating the Diet Plan feature */}
      <div className="pointer-events-none select-none blur-sm opacity-50 p-6 md:p-10 bg-white">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 rounded-xl bg-slate-200" />
            <div>
              <div className="h-6 w-48 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-72 rounded bg-slate-100" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-[200px] w-full rounded-2xl bg-slate-100" />
          <div className="h-[150px] w-full rounded-2xl bg-slate-100" />
        </div>
      </div>

      {/* Luxury Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 p-6 text-center backdrop-blur-md">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-yellow-400 to-orange-500 shadow-xl shadow-amber-500/20 ring-4 ring-white">
          <Crown className="h-10 w-10 text-white" />
        </div>
        <h2 className="mb-2 text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Unlock Premium AI Features
        </h2>
        <p className="mb-8 max-w-md text-slate-600">
          Get unlimited access to highly personalised Diet & Workout plans, advanced health analytics, and priority AI generation.
        </p>
        <Link
          href="/premium"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-slate-900 px-8 py-3.5 font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5"
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Upgrade to Premium</span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        </Link>
      </div>
    </div>
  );
}
