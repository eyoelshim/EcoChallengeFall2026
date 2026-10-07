import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";
import { ensureGlobalChallengeExists } from "@/lib/global-challenge";
import { NextResponse } from "next/server";
import { ActionCategory } from "@prisma/client";

type OnboardingAction = {
  actionType: string;
  category: ActionCategory;
  points: number;
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await ensureGlobalChallengeExists();

    const body = await req.json();
    const { department, actions }: { department: string; actions: OnboardingAction[] } = body;

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { challenges: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Tag onboarding actions to the user's most recent specific challenge,
    // or fall back to global so actions are never orphaned.
    const specificChallenge = user.challenges.find(
      (c) => c.challengeId !== GLOBAL_CHALLENGE_ID
    );
    const challengeId = specificChallenge?.challengeId ?? GLOBAL_CHALLENGE_ID;

    // Save all selected past actions
    if (actions.length > 0) {
      await db.action.createMany({
        data: actions.map((a) => ({
          userId: user.id,
          category: a.category,
          actionType: a.actionType,
          points: a.points,
          challengeId,
        })),
      });
    }

    // Mark user as onboarded and save department
    await db.user.update({
      where: { id: user.id },
      data: {
        onboarded: true,
        department: department || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
}
