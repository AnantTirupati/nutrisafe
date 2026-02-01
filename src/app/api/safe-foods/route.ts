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
    await connectDB();
    const safe = await ScanHistory.find({
      userId: session.user.id,
      riskLevel: "low",
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("productName productId barcode source createdAt")
      .lean();
    const list = safe.map((s) => ({
      id: s._id.toString(),
      productName: s.productName,
      productId: s.productId?.toString(),
      barcode: s.barcode,
      source: s.source,
      createdAt: s.createdAt,
    }));
    return NextResponse.json({ safeFoods: list });
  } catch (e) {
    console.error("Safe foods GET error:", e);
    return NextResponse.json({ error: "Failed to fetch safe foods" }, { status: 500 });
  }
}
