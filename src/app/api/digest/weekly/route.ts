import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { buildWeeklyDigest, renderDigestText } from "@/lib/weeklyDigest";

/**
 * Returns the signed-in user's own last-7-days digest. Used today by the
 * dashboard (or any future in-app "this week" surface). Not yet wired to
 * outbound email/push — see the note in WORKFLOW.md / the digest feature
 * discussion: that needs an email provider (AWS SES fits naturally given
 * Bedrock is already on AWS) and a scheduler to actually push this to users
 * who haven't opened the app. This endpoint is the content layer that piece
 * would call into once those exist.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const digest = await buildWeeklyDigest(session.user.id);
  if (!digest) {
    return NextResponse.json({ error: "Could not build digest" }, { status: 404 });
  }

  return NextResponse.json({
    digest,
    text: renderDigestText(digest),
  });
}
