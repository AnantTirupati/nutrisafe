import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { HealthProfile } from "@/models/HealthProfile";
import { authOptions } from "@/lib/auth";
import {
  chatWithHealthBot,
  type ChatMessage,
  type UserProfileForAnalysis,
} from "@/lib/gemini";
import { checkAndConsumeUsage } from "@/lib/usage";
import { isPremiumActive } from "@/lib/premium";
import { z } from "zod";

const ChatSchema = z.object({
  message: z.string().max(2000).default(""),
  imageBase64: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        parts: z.array(z.object({ text: z.string() })).length(1),
      })
    )
    .max(40)
    .default([]),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = ChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { message, history, imageBase64 } = parsed.data;

    // Require either a message or an image
    if (!message.trim() && !imageBase64) {
      return NextResponse.json(
        { error: "Provide a message or an image." },
        { status: 400 }
      );
    }

    await connectDB();
    const premium = await isPremiumActive(session.user.id);
    const usage = await checkAndConsumeUsage(session.user.id, "chat", premium);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: `You've reached your chat limit for today (${usage.limit}/day).${
            premium ? "" : " Upgrade to Premium for a higher limit."
          }`,
        },
        { status: 429 }
      );
    }

    const profileDoc = await HealthProfile.findOne({
      userId: session.user.id,
    }).lean();

    const profile: UserProfileForAnalysis = profileDoc
      ? {
          age: profileDoc.age,
          medicalConditions: profileDoc.medicalConditions ?? [],
          allergies: profileDoc.allergies ?? [],
          dietaryPreference: profileDoc.dietaryPreference ?? "Non-Vegetarian",
          additionalNotes: profileDoc.additionalNotes ?? undefined,
        }
      : {
          medicalConditions: [],
          allergies: [],
          dietaryPreference: "Non-Vegetarian",
        };

    const reply = await chatWithHealthBot(
      message,
      history as ChatMessage[],
      profile,
      imageBase64
    );

    return NextResponse.json({ reply });
  } catch (e) {
    console.error("Chat error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Chat failed" },
      { status: 500 }
    );
  }
}
