import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { DEACTIVATED_IN_CHALLENGE_MESSAGE, isDeactivatedInChallenge } from "@/lib/participation";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await req.json();
    if (!teamId) {
      return NextResponse.json(
        { error: "teamId is required" },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const membership = await db.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: user.id,
          teamId,
        },
      },
      include: {
        team: { select: { id: true, name: true, challengeId: true } },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this team." },
        { status: 404 },
      );
    }

    // Deactivated participants stay on their team so its totals don't change
    if (membership.team.challengeId && (await isDeactivatedInChallenge(user.id, membership.team.challengeId))) {
      return NextResponse.json({ error: DEACTIVATED_IN_CHALLENGE_MESSAGE }, { status: 403 });
    }

    await db.teamMember.delete({
      where: {
        userId_teamId: {
          userId: user.id,
          teamId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      teamId,
      challengeId: membership.team.challengeId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to leave team" },
      { status: 500 },
    );
  }
}
