"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    if (res?.url) window.location.href = res.url;
  }

  async function handleGoogle() {
    setError("");
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 font-extrabold text-primary-700"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <Shield className="h-8 w-8" />
        NutriSafe
      </Link>
      <div className="w-full max-w-md card">
        <h1 className="text-xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600">
          Use your email or Google to continue.
        </p>
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        <form onSubmit={handleCredentials} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input mt-1"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input mt-1"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Sign in"}
          </button>
        </form>
        <div className="mt-4 flex items-center gap-4">
          <span className="flex-1 border-t border-slate-200" />
          <span className="text-sm text-slate-500">or</span>
          <span className="flex-1 border-t border-slate-200" />
        </div>
        <button
          type="button"
          onClick={handleGoogle}
          className="btn-secondary mt-4 w-full"
        >
          Continue with Google
        </button>
        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-primary-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
