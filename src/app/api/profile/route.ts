import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { HealthProfile } from "@/models/HealthProfile";
import { authOptions } from "@/lib/auth";
import {
  MEDICAL_CONDITIONS,
  ALLERGIES,
  DIETARY_PREFERENCES,
  type MedicalCondition,
  type Allergy,
  type DietaryPreference,
} from "@/models/HealthProfile";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  age: z.number().int().min(1).max(120).nullable().optional(),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  medicalConditions: z.array(z.enum(MEDICAL_CONDITIONS)).optional(),
  allergies: z.array(z.enum(ALLERGIES)).optional(),
  dietaryPreference: z.enum(DIETARY_PREFERENCES).optional(),
  additionalNotes: z.string().nullable().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    let profile = await HealthProfile.findOne({
      userId: session.user.id,
    }).lean();
    if (!profile) {
      // Create default profile for users who don't have one (e.g. existing accounts)
      const newProfile = await HealthProfile.create({
        userId: session.user.id,
        medicalConditions: [],
        allergies: [],
        dietaryPreference: "Non-Vegetarian",
      });
      profile = newProfile.toObject();
    }
    return NextResponse.json({
      profile: {
        ...profile,
        userId: profile.userId?.toString(),
        _id: profile._id?.toString(),
      },
      options: {
        medicalConditions: MEDICAL_CONDITIONS,
        allergies: ALLERGIES,
        dietaryPreferences: DIETARY_PREFERENCES,
      },
    });
  } catch (e) {
    console.error("Profile GET error:", e);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    await connectDB();
    let profile = await HealthProfile.findOneAndUpdate(
      { userId: session.user.id },
      {
        ...(parsed.data.age !== undefined && { age: parsed.data.age }),
        ...(parsed.data.gender !== undefined && { gender: parsed.data.gender }),
        ...(parsed.data.medicalConditions !== undefined && {
          medicalConditions: parsed.data.medicalConditions as MedicalCondition[],
        }),
        ...(parsed.data.allergies !== undefined && {
          allergies: parsed.data.allergies as Allergy[],
        }),
        ...(parsed.data.dietaryPreference !== undefined && {
          dietaryPreference: parsed.data.dietaryPreference as DietaryPreference,
        }),
        ...(parsed.data.additionalNotes !== undefined && {
          additionalNotes: parsed.data.additionalNotes,
        }),
      },
      { new: true }
    ).lean();
    if (!profile) {
      // Create profile with submitted data if none exists
      const newProfile = await HealthProfile.create({
        userId: session.user.id,
        age: parsed.data.age ?? null,
        gender: parsed.data.gender ?? null,
        medicalConditions: (parsed.data.medicalConditions as MedicalCondition[]) ?? [],
        allergies: (parsed.data.allergies as Allergy[]) ?? [],
        dietaryPreference: (parsed.data.dietaryPreference as DietaryPreference) ?? "Non-Vegetarian",
        additionalNotes: parsed.data.additionalNotes ?? null,
      });
      profile = newProfile.toObject();
    }
    return NextResponse.json({
      profile: {
        ...profile,
        userId: profile.userId?.toString(),
        _id: profile._id?.toString(),
      },
    });
  } catch (e) {
    console.error("Profile PUT error:", e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
