import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { HealthProfile } from "@/models/HealthProfile";
import { authOptions } from "@/lib/auth";
import { generateDietAndWorkoutPlan, type DietPlanInput } from "@/lib/gemini";
import { checkAndConsumeUsage } from "@/lib/usage";
import { isPremiumActive } from "@/lib/premium";
import { z } from "zod";

const PlanSchema = z.object({
  height: z.number().min(50).max(300),
  weight: z.number().min(20).max(500),
  goal: z.enum(["weight loss", "weight gain", "maintenance", "muscle gain"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very active"]),
  workoutLevel: z.enum(["beginner", "intermediate", "advanced"]),
  mealsPerDay: z.number().min(2).max(6),
  workoutTime: z.number().min(10).max(120),
  customRequest: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const premium = await isPremiumActive(session.user.id);
  if (!premium) {
    return NextResponse.json(
      { error: "Diet & Workout Plans are a premium feature. Upgrade to generate one." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = PlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const usage = await checkAndConsumeUsage(session.user.id, "dietPlan", true);
    if (!usage.allowed) {
      return NextResponse.json(
        { error: `You've reached your plan generation limit for this month (${usage.limit}/month). It resets next month.` },
        { status: 429 }
      );
    }

    const profileDoc = await HealthProfile.findOne({
      userId: session.user.id,
    }).lean();

    const input: DietPlanInput = {
      age: profileDoc?.age ?? 25,
      gender: profileDoc?.gender ?? "not specified",
      height: parsed.data.height,
      weight: parsed.data.weight,
      goal: parsed.data.goal,
      activityLevel: parsed.data.activityLevel,
      dietPreference: profileDoc?.dietaryPreference ?? "Non-Vegetarian",
      workoutLevel: parsed.data.workoutLevel,
      mealsPerDay: parsed.data.mealsPerDay,
      workoutTime: parsed.data.workoutTime,
      medicalConditions: profileDoc?.medicalConditions ?? [],
      allergies: profileDoc?.allergies ?? [],
      additionalNotes: profileDoc?.additionalNotes ?? undefined,
      customRequest: parsed.data.customRequest,
    };

    const plan = await generateDietAndWorkoutPlan(input);

    return NextResponse.json({ plan });
  } catch (e) {
    console.error("Diet plan error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate plan" },
      { status: 500 }
    );
  }
}
