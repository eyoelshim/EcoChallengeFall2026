import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { teamId } = body;

    if (!teamId) return NextResponse.json({ error: "teamId is required" }, { status: 400 });

    const team = await db.team.findUnique({ where: { id: teamId } });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        teams: { include: { team: { select: { challengeId: true } } } },
        challenges: { select: { challengeId: true } },
      },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Team belongs to a challenge — user must have joined that challenge first
    if (team.challengeId) {
      const inChallenge = user.challenges.some(
        (uc) => uc.challengeId === team.challengeId
      );
      if (!inChallenge) {
        return NextResponse.json(
          { error: "You must join the challenge before picking a team" },
          { status: 400 }
        );
      }

      // One team per challenge
      const alreadyOnTeamInChallenge = user.teams.some(
        (tm) => tm.team.challengeId === team.challengeId
      );
      if (alreadyOnTeamInChallenge) {
        return NextResponse.json(
          { error: "You are already on a team in this challenge" },
          { status: 400 }
        );
      }
    }

    // Prevent duplicate membership in the same team
    if (user.teams.some((t) => t.teamId === teamId)) {
      return NextResponse.json(
        { error: "You are already a member of this team" },
        { status: 400 }
      );
    }

    await db.teamMember.create({ data: { userId: user.id, teamId } });

    return NextResponse.json({ success: true, teamId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to join team" }, { status: 500 });
  }
}
