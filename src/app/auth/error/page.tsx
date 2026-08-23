"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Shield, AlertCircle } from "lucide-react";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There's a server configuration problem. Please try again shortly.",
  AccessDenied: "Access was denied. You may not have permission to sign in.",
  Verification: "That sign-in link has expired or was already used.",
  OAuthSignin: "Couldn't start the Google sign-in. Please try again.",
  OAuthCallback: "Something went wrong while completing Google sign-in. Please try again.",
  OAuthCreateAccount: "Couldn't create an account with Google. Please try again.",
  EmailCreateAccount: "Couldn't create an account with that email.",
  Callback: "Something went wrong while signing you in. Please try again.",
  OAuthAccountNotLinked: "That email is already registered with a password. Sign in with your email and password instead, or use the same method you signed up with.",
  CredentialsSignin: "Invalid email or password.",
  SessionRequired: "Please sign in to continue.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("error");
  const message = (code && ERROR_MESSAGES[code]) || "Something went wrong while signing you in. Please try again.";

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
      <div className="w-full max-w-md card text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Sign-in error</h1>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <Link href="/auth/signin" className="btn-primary mt-6 inline-block">
          Try again
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
