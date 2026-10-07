import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId");
    const category = searchParams.get("category");

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        streak: true,
        lastActionDate: true,
        teams: {
          include: { team: { select: { id: true, challengeId: true } } },
        },
        actions: {
          where: {
            ...(challengeId ? { challengeId } : {}),
            ...(category
              ? {
                  category: category as
                    | "TRANSPORT"
                    | "WATER"
                    | "ENERGY"
                    | "RECYCLING"
                    | "FOOD",
                }
              : {}),
          },
          select: { points: true },
        },
      },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Team scoped to challenge
    let teamId: string | null = null;
    if (challengeId) {
      const match = user.teams.find((tm) => tm.team.challengeId === challengeId);
      teamId = match?.teamId ?? null;
    } else {
      teamId = user.teams[0]?.teamId ?? null;
    }

    // Category-scoped stats (or global if no category)
    const categoryPoints = user.actions.reduce((sum, a) => sum + a.points, 0);
    const categoryActionCount = user.actions.length;

    return NextResponse.json({
      streak: user.streak,
      lastActionDate: user.lastActionDate,
      teamId,
      globalPoints: categoryPoints,
      globalActionCount: categoryActionCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
