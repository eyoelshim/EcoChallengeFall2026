import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { challengeId } = await req.json();
    if (!challengeId) {
      return NextResponse.json(
        { error: "challengeId is required" },
        { status: 400 },
      );
    }

    if (challengeId === GLOBAL_CHALLENGE_ID) {
      return NextResponse.json(
        { error: "The default All Activity challenge cannot be left." },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const membership = await db.userChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId: user.id,
          challengeId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this challenge." },
        { status: 404 },
      );
    }

    await db.$transaction([
      db.teamMember.deleteMany({
        where: {
          userId: user.id,
          team: { challengeId },
        },
      }),
      db.userChallenge.delete({
        where: {
          userId_challengeId: {
            userId: user.id,
            challengeId,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true, challengeId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to leave challenge" },
      { status: 500 },
    );
  }
}
