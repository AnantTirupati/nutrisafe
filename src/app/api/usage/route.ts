import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getUsageSummary } from "@/lib/usage";
import { getPremiumStatus } from "@/lib/premium";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const premium = await getPremiumStatus(session.user.id);
  const usage = await getUsageSummary(session.user.id, premium.active);

  return NextResponse.json({ usage, isPremium: premium.active, premiumExpiresAt: premium.expiresAt });
}
