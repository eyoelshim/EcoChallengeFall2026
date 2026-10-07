import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";
import { ensureGlobalChallengeExists } from "@/lib/global-challenge";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

const DUPLICATE_SUBMISSION_WINDOW_MS = 10_000;

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");
    const challengeId = searchParams.get("challengeId") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const challengeFilter = challengeId ? { challengeId } : {};
    const categoryFilter = category ? { category: category as "TRANSPORT" | "WATER" | "ENERGY" | "RECYCLING" | "FOOD" } : {};

    if (filter === "popular") {
      const popular = await db.action.groupBy({
        by: ["actionType", "category"],
        _count: { actionType: true },
        orderBy: { _count: { actionType: "desc" } },
        take: 10,
      });
      return NextResponse.json(
        popular.map((p) => ({
          actionType: p.actionType,
          category: p.category,
          count: p._count.actionType,
        }))
      );
    }

    if (filter === "global") {
      const showAll = searchParams.get("all") === "true";
      const recent = await db.action.findMany({
        where: { ...challengeFilter, ...categoryFilter },
        orderBy: { createdAt: "desc" },
        ...(showAll ? {} : { take: 10 }),
        include: {
          user: { select: { name: true } },
          challenge: { select: { name: true } },
        },
      });
      return NextResponse.json(
        recent.map((a) => ({
          id: a.id,
          actionType: a.actionType,
          points: a.points,
          createdAt: a.createdAt,
          userName: a.user.name,
          challengeId: a.challengeId,
          challengeName: a.challenge?.name ?? null,
        }))
      );
    }

    if (filter === "recent") {
      const recent = await db.action.findMany({
        where: { ...categoryFilter },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { actionType: true, category: true },
      });
      const seen = new Set<string>();
      const unique = recent
        .filter((a) => {
          if (seen.has(a.actionType)) return false;
          seen.add(a.actionType);
          return true;
        })
        .slice(0, 10);
      return NextResponse.json(unique);
    }

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const actions = await db.action.findMany({
      where: { userId: user.id, ...challengeFilter, ...categoryFilter },
      orderBy: { createdAt: "desc" },
      include: {
        challenge: { select: { name: true } },
      },
    });

    return NextResponse.json(
      actions.map((action) => ({
        ...action,
        challengeName: action.challenge?.name ?? null,
      }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load actions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      category,
      actionType,
      points,
      challengeId: bodyChallenge,
      note,
      imageUrl,
    } = body;

    if (!category || !actionType) {
      return NextResponse.json(
        { error: "category and actionType are required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        // Grab the user's most recent challenge as a fallback
        challenges: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Use the provided challengeId, or auto-assign from user's latest challenge,
    // always falling back to global so no action is ever orphaned.
    await ensureGlobalChallengeExists();

    const normalizedBodyChallenge =
      typeof bodyChallenge === "string" && bodyChallenge.startsWith("CATEGORY_")
        ? undefined
        : bodyChallenge;

    const challengeId: string =
      normalizedBodyChallenge ??
      user.challenges[0]?.challengeId ??
      GLOBAL_CHALLENGE_ID;

    const normalizedNote = note?.trim() || null;
    const normalizedImageUrl = imageUrl || null;

    // Bonus points for optional story/image
    const noteBonus = normalizedNote ? 10 : 0;
    const imageBonus = normalizedImageUrl ? 15 : 0;
    const totalPoints = (points ?? 0) + noteBonus + imageBonus;
    const duplicateCutoff = new Date(Date.now() - DUPLICATE_SUBMISSION_WINDOW_MS);

    const action = await db.$transaction(
      async (tx) => {
        const existingAction = await tx.action.findFirst({
          where: {
            userId: user.id,
            challengeId,
            category,
            actionType,
            points: totalPoints,
            note: normalizedNote,
            imageUrl: normalizedImageUrl,
            createdAt: { gte: duplicateCutoff },
          },
          orderBy: { createdAt: "desc" },
        });

        if (existingAction) {
          throw new Error("DUPLICATE_ACTION_SUBMISSION");
        }

        return tx.action.create({
          data: {
            userId: user.id,
            category,
            actionType,
            points: totalPoints,
            note: normalizedNote,
            imageUrl: normalizedImageUrl,
            challengeId,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    // ── Streak calculation ──────────────────────────────────────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);

    let newStreak = 1;
    if (user.lastActionDate) {
      const last = new Date(user.lastActionDate);
      last.setHours(0, 0, 0, 0);
      if (last.getTime() === todayStart.getTime()) {
        newStreak = user.streak; // already logged today
      } else if (last.getTime() === yesterdayStart.getTime()) {
        newStreak = user.streak + 1; // consecutive day
      } else {
        newStreak = 1; // gap, reset
      }
    }

    await db.user.update({
      where: { id: user.id },
      data: { streak: newStreak, lastActionDate: new Date() },
    });

    return NextResponse.json({ ...action, streak: newStreak });
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_ACTION_SUBMISSION") {
      return NextResponse.json(
        { error: "This action was already logged a moment ago." },
        { status: 409 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        { error: "This action was already logged a moment ago." },
        { status: 409 },
      );
    }

    console.error(error);
    return NextResponse.json({ error: "Failed to create action" }, { status: 500 });
  }
}
