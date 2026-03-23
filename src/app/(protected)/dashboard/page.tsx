import Link from "next/link";
import { Scan, History, Heart, User, Bot, Salad, Crown, ArrowRight } from "lucide-react";
import { HealthChatbot } from "@/components/HealthChatbot";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const isPremium = session?.user?.isPremium;

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Scan a product, check your history, or update your profile.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/scan"
            className="card flex items-center gap-4 transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <Scan className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Scan food</h2>
              <p className="text-sm text-slate-600">Barcode, label photo, or type</p>
            </div>
          </Link>
          <Link
            href="/history"
            className="card flex items-center gap-4 transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Scan history</h2>
              <p className="text-sm text-slate-600">Past scans with risk levels</p>
            </div>
          </Link>
          <Link
            href="/safe-foods"
            className="card flex items-center gap-4 transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Safe for me</h2>
              <p className="text-sm text-slate-600">Low-risk foods you&apos;ve scanned</p>
            </div>
          </Link>
          <Link
            href="/diet-plan"
            className="group card flex items-center gap-4 transition-shadow hover:shadow-md border-transparent hover:border-violet-200"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 shadow-md shadow-violet-200 text-white group-hover:scale-105 transition-transform">
              <Salad className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-900">Diet &amp; Plan</h2>
                {isPremium ? (
                  <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-700 shadow-sm">
                    <Crown className="h-3 w-3" />
                    PREMIUM
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-600 transition-colors group-hover:bg-slate-200">
                    Upgrade <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-0.5">AI-personalised meal &amp; workout</p>
            </div>
          </Link>
          <Link
            href="/profile"
            className="card flex items-center gap-4 transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Profile</h2>
              <p className="text-sm text-slate-600">Conditions, allergies, diet</p>
            </div>
          </Link>
        </div>

        {/* Health AI Chat teaser */}
        <div className="mt-8">
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-200">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-slate-900">Health AI Chat</h2>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    NEW
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Get personalized nutrition advice, BMI calculations, meal plans, and symptom guidance — all tailored to your health profile.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "🥗 Meal planning",
                    "📊 BMI & calories",
                    "🩺 Symptom guidance",
                    "💧 Hydration tips",
                  ].map((feat) => (
                    <span
                      key={feat}
                      className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs text-emerald-700"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  👉 Click the <strong>Health AI</strong> button in the bottom-right corner to start chatting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating chatbot widget */}
      <HealthChatbot />
    </>
  );
}
