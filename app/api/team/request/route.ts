import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/authz";
import { db } from "@/lib/db";
import { createTeamRequest } from "@/lib/team-requests";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId");
    const scope = searchParams.get("scope");
    if (!challengeId) {
      return NextResponse.json({ error: "challengeId is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        challenges: {
          where: { challengeId },
          select: { challengeId: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin && user.challenges.length === 0) {
      return NextResponse.json(
        { error: "You must join the challenge before viewing requests" },
        { status: 400 },
      );
    }

    const requests = await db.teamRequest.findMany({
      where:
        isAdmin && scope === "all"
          ? { challengeId }
          : { challengeId, requestedById: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        requestedBy: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load team requests" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const request = await createTeamRequest({
      clerkId: userId,
      challengeId: body.challengeId,
      name: body.name ?? "",
      message: body.message,
    });

    return NextResponse.json(request);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit team request";
    const status =
      message === "User not found"
        ? 404
        : message === "Team name is required"
          ? 400
          : message.startsWith("You ")
            ? 400
            : message.startsWith("A team")
              ? 400
              : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
