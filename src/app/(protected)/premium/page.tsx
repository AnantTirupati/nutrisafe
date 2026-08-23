"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Crown, Check, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

export default function PremiumPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ active: boolean; expiresAt: string | null } | null>(null);

  async function loadStatus() {
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setStatus({ active: !!data.isPremium, expiresAt: data.premiumExpiresAt ?? null });
      }
    } catch {
      // Non-critical — the page still works with the session's cached flag as a fallback.
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  const isActive = status?.active ?? !!session?.user?.isPremium;

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create order on our backend
      const res = await fetch("/api/premium/create-order", { method: "POST" });
      const orderData = await res.json();

      if (!res.ok) throw new Error(orderData.error || "Failed to create order");

      // 2. Initialize Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NutriSafe Premium",
        description: "30 days of Premium Diet & Workout AI access",
        image: "https://nutrisafe.com/logo.png", // Fallback text icon
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 3. Verify payment signature on backend
          try {
            const verifyRes = await fetch("/api/premium/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");

            // 4. Update NextAuth session locally to reflect premium status immediately
            await update({ isPremium: true });
            await loadStatus();

            // Redirect to premium feature
            router.push("/diet-plan?upgraded=true");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed.");
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#f59e0b", // Amber 500
        },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(response.error.description || "Payment failed");
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const featureList = [
    "Up to 10 AI Diet & Workout Plans per month",
    "60 scans/day and 60 AI chat messages/day",
    "Save and Edit Unlimited Plans",
    "Advanced Ingredient Risk Analysis",
    "Priority AI Generation Speed",
  ];

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="relative min-h-[75vh] flex flex-col items-center justify-center py-12 px-4 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-10 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-10 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob [animation-delay:2000ms]" />
          <div className="absolute -bottom-10 left-32 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob [animation-delay:4000ms]" />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
              Upgrade to <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Premium</span>
            </h1>
            <p className="text-lg text-slate-600">
              Higher limits and full access to NutriSafe's AI Diet &amp; Workout Plan generator.
            </p>
          </div>

          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500" />

            <div className="p-8 sm:p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-6 w-6 text-amber-500" />
                    <h2 className="text-2xl font-bold text-slate-900">Monthly Plan</h2>
                  </div>
                  <p className="text-slate-500">
                    {isActive && status?.expiresAt
                      ? `Active until ${new Date(status.expiresAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`
                      : "30 days of access per payment"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-slate-900">₹500</div>
                  <div className="text-sm font-medium text-slate-400">/month</div>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {featureList.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              {error && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={loading}
                className="group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40 focus:ring-4 focus:ring-amber-500/30 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : isActive ? (
                  <>
                    <ShieldCheck className="h-5 w-5 text-white" /> Renew for 30 more days
                  </>
                ) : (
                  <>
                    Get Premium Now <ArrowRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
                  </>
                )}
                {/* Shine effect */}
                {!loading && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                )}
              </button>

              <div className="mt-4 text-center text-xs text-slate-500 space-y-1">
                <p>Secured by Razorpay. 100% safe &amp; encrypted processing.</p>
                <p>
                  Renews when you return here and pay again — not auto-charged.{" "}
                  We&apos;ll look at making this automatic once it's clear people want that.
                </p>
                <p>
                  Not right for you?{" "}
                  <Link href="/legal/refund-policy" className="underline hover:text-slate-700">
                    7-day refund policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
