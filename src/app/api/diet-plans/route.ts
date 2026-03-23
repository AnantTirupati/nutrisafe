import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DietPlan } from "@/models/DietPlan";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const CreatePlanSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = CreatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();
    const plan = await DietPlan.create({
      userId: session.user.id,
      name: parsed.data.name,
      content: parsed.data.content,
    });

    return NextResponse.json({ plan });
  } catch (e) {
    console.error("Save plan error:", e);
    return NextResponse.json(
      { error: "Failed to save plan" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const plans = await DietPlan.find({ userId: session.user.id })
      .select("_id name createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ plans });
  } catch (e) {
    console.error("Fetch plans error:", e);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
