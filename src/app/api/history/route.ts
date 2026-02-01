import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ScanHistory } from "@/models/ScanHistory";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);
    const safeOnly = searchParams.get("safeOnly") === "true";
    await connectDB();
    let query = ScanHistory.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    if (safeOnly) {
      query = query.where("riskLevel").equals("low");
    }
    const history = await query;
    const list = history.map((h) => ({
      id: h._id.toString(),
      productName: h.productName,
      riskLevel: h.riskLevel,
      riskSummary: h.riskSummary,
      source: h.source,
      barcode: h.barcode,
      createdAt: h.createdAt,
    }));
    return NextResponse.json({ history: list });
  } catch (e) {
    console.error("History GET error:", e);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
