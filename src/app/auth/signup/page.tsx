"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Shield, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Registration failed.");
      setLoading(false);
      return;
    }
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
    if (signInRes?.url) window.location.href = signInRes.url;
    else setError("Account created. Please sign in.");
  }

  async function handleGoogle() {
    setError("");
    await signIn("google", { callbackUrl: "/dashboard" });
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
        <h1 className="text-xl font-bold text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-600">
          Set up your NutriSafe account with email or Google.
        </p>
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input mt-1"
              placeholder="Your name"
            />
          </div>
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
              Password (min 8 characters)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input mt-1"
              minLength={8}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Create account"}
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
          Already have an account?{" "}
          <Link href="/auth/signin" className="font-medium text-primary-600 hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-slate-400">
          By creating an account, you agree to our{" "}
          <Link href="/legal/terms" className="underline hover:text-slate-600">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline hover:text-slate-600">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
