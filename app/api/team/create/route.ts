import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/authz";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!(await isCurrentUserAdmin())) {
      return NextResponse.json(
        { error: "Only admins can create teams directly" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, challengeId } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    if (!challengeId) return NextResponse.json({ error: "challengeId is required" }, { status: 400 });

    // Verify the challenge exists
    const challenge = await db.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

    // Duplicate check scoped to this challenge (same name is fine across different challenges)
    const existing = await db.team.findFirst({
      where: { name: name.trim(), challengeId },
    });
    if (existing) return NextResponse.json({ error: "A team with that name already exists in this challenge" }, { status: 400 });

    const team = await db.team.create({
      data: { name: name.trim(), challengeId },
    });

    // Auto-join the creator to the team
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (user) {
      await db.teamMember.create({
        data: { userId: user.id, teamId: team.id },
      });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}
