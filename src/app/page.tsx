import Link from "next/link";
import { Shield, Scan, Heart, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary-700">
            <Shield className="h-8 w-8" />
            NutriSafe
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Sign in
            </Link>
            <Link href="/auth/signup" className="btn-primary">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Safer food choices,{" "}
            <span className="text-primary-600">personalized for you</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            NutriSafe analyzes packaged food ingredients against your health conditions and
            allergies. Scan barcodes, upload labels, or type ingredients—get instant risk
            levels and simple, actionable insights.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth/signup" className="btn-primary text-base px-6 py-3">
              Create free account
            </Link>
            <Link href="/auth/signin" className="btn-secondary text-base px-6 py-3">
              Sign in
            </Link>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-bold text-slate-900">
              How it works
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">Your health profile</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Set conditions, allergies, and diet. We never share your health data.
                </p>
              </div>
              <div className="card text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <Scan className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">Scan or type</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Barcode scan, label photo, or manual input—we interpret complex labels.
                </p>
              </div>
              <div className="card text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">Instant risk level</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Low, medium, or high risk with plain-language explanations per ingredient.
                </p>
              </div>
              <div className="card text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">Smart recommendations</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Healthier alternatives and diet tips tailored to your profile.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        NutriSafe – Food Safety & Diet Assistant. Your health data stays private.
      </footer>
    </div>
  );
}
