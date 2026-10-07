import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId");

    // Teams are scoped to a challenge. Without a challenge context there is
    // nothing meaningful to return.
    if (!challengeId) {
      return NextResponse.json([]);
    }

    const teams = await db.team.findMany({
      where: { challengeId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json(
      teams.map((team) => ({
        id: team.id,
        name: team.name,
        challengeId: team.challengeId,
        members: team.members.map((m) => ({
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          teamId: m.teamId,
        })),
      }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}
