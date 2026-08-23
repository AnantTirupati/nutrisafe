import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment verified successfully — grants 30 days of Premium access.
      // Renewal is currently manual (return to /premium and pay again); real
      // auto-recurring billing needs the Razorpay Subscriptions API, which
      // isn't wired up yet — see MARKET.md.
      await connectDB();
      const PREMIUM_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;
      const existing = await User.findById(session.user.id).select("premiumExpiresAt").lean();
      const currentExpiry = existing?.premiumExpiresAt ? new Date(existing.premiumExpiresAt).getTime() : 0;
      const baseline = Math.max(currentExpiry, Date.now()); // stack renewal on top of remaining time, if any
      await User.findByIdAndUpdate(session.user.id, {
        isPremium: true,
        premiumSince: new Date(),
        premiumExpiresAt: new Date(baseline + PREMIUM_PERIOD_MS),
        premiumOrderId: razorpay_order_id,
      });

      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
