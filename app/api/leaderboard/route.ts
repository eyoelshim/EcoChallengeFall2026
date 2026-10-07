import { db } from "@/lib/db";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";
import { NextResponse } from "next/server";

type RankableItem = {
  name: string;
  value: number;
};

type RankableTeam = {
  name: string;
  totalPoints: number;
};

function compareNames(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function addDenseRanks<T extends RankableItem>(items: T[]) {
  let previousValue: number | null = null;
  let currentRank = 0;

  return items.map((item) => {
    if (previousValue === null || item.value !== previousValue) {
      currentRank += 1;
      previousValue = item.value;
    }

    return { rank: currentRank, ...item };
  });
}

function addDenseRanksToTeams<T extends RankableTeam>(items: T[]) {
  let previousValue: number | null = null;
  let currentRank = 0;

  return items.map((item) => {
    if (previousValue === null || item.totalPoints !== previousValue) {
      currentRank += 1;
      previousValue = item.totalPoints;
    }

    return { rank: currentRank, ...item };
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // streak | diverse | rising | champs | null (team overall)
    const challengeId = searchParams.get("challengeId") ?? undefined;
    const category = searchParams.get("category") ?? undefined;

    // Get user IDs who are in this challenge (for individual leaderboards)
    async function getChallengeUserIds(): Promise<string[]> {
      if (!challengeId) return [];
      const members = await db.userChallenge.findMany({
        where: { challengeId },
        select: { userId: true },
      });
      return members.map((m) => m.userId);
    }

    // ── Streak: top users by current streak ──────────────────────────────
    if (type === "streak") {
      const userIds = await getChallengeUserIds();
      const users = await db.user.findMany({
        where: {
          streak: { gt: 0 },
          ...(userIds.length > 0 ? { id: { in: userIds } } : {}),
        },
        orderBy: { streak: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          streak: true,
          teams: { include: { team: { select: { name: true } } } },
        },
      });
      const ranked = addDenseRanks(
        users
          .map((u) => ({
            name: u.name,
            teamName: u.teams[0]?.team?.name ?? null,
            value: u.streak,
            unit: "day streak",
          }))
          .sort((a, b) => b.value - a.value || compareNames(a.name, b.name)),
      );
      return NextResponse.json(ranked);
    }

    // ── Diverse: top users by unique categories logged ────────────────────
    if (type === "diverse") {
      const userIds = await getChallengeUserIds();
      const users = await db.user.findMany({
        where: userIds.length > 0 ? { id: { in: userIds } } : {},
        include: {
          actions: {
            where: {
              ...(challengeId ? { challengeId } : {}),
              ...(category ? { category: category as "TRANSPORT" | "WATER" | "ENERGY" | "RECYCLING" | "FOOD" } : {}),
            },
            select: { category: true },
          },
          teams: { include: { team: { select: { name: true } } } },
        },
      });
      const ranked = addDenseRanks(
        users
          .map((u) => ({
            name: u.name,
            teamName: u.teams[0]?.team?.name ?? null,
            value: new Set(u.actions.map((a) => a.category)).size,
            unit: "categories",
          }))
          .sort((a, b) => b.value - a.value || compareNames(a.name, b.name)),
      );
      return NextResponse.json(ranked.slice(0, 10));
    }

    // ── Rising: top users by points in the last 7 days ───────────────────
    if (type === "rising") {
      const since = new Date();
      since.setDate(since.getDate() - 7);
      const userIds = await getChallengeUserIds();
      const actions = await db.action.findMany({
        where: {
          createdAt: { gte: since },
          ...(challengeId ? { challengeId } : {}),
          ...(category ? { category: category as "TRANSPORT" | "WATER" | "ENERGY" | "RECYCLING" | "FOOD" } : {}),
          ...(userIds.length > 0 ? { userId: { in: userIds } } : {}),
        },
        include: {
          user: {
            select: {
              name: true,
              teams: { include: { team: { select: { name: true } } } },
            },
          },
        },
      });
      const byUser: Record<string, { name: string; teamName: string | null; points: number }> = {};
      for (const a of actions) {
        if (!a.user) continue;
        if (!byUser[a.userId]) {
          byUser[a.userId] = {
            name: a.user.name,
            teamName: a.user.teams[0]?.team?.name ?? null,
            points: 0,
          };
        }
        byUser[a.userId].points += a.points;
      }
      const ranked = addDenseRanks(
        Object.values(byUser)
          .map((u) => ({
            name: u.name,
            teamName: u.teamName,
            value: u.points,
            unit: "pts this week",
          }))
          .sort((a, b) => b.value - a.value || compareNames(a.name, b.name)),
      ).slice(0, 10);
      return NextResponse.json(ranked);
    }

    // ── Champs: top users by all-time individual points ───────────────────
    if (type === "champs") {
      const isGlobal = challengeId === GLOBAL_CHALLENGE_ID;
      const limit = isGlobal ? 50 : 10;
      const userIds = await getChallengeUserIds();
      const users = await db.user.findMany({
        where: userIds.length > 0 ? { id: { in: userIds } } : {},
        include: {
          actions: {
            where: {
              ...(challengeId ? { challengeId } : {}),
              ...(category ? { category: category as "TRANSPORT" | "WATER" | "ENERGY" | "RECYCLING" | "FOOD" } : {}),
            },
            select: { points: true },
          },
          teams: { include: { team: { select: { name: true } } } },
        },
      });
      const usersWithPoints = users
        .map((u) => ({
          name: u.name,
          teamName: isGlobal ? null : (u.teams[0]?.team?.name ?? null),
          value: u.actions.reduce((s, a) => s + a.points, 0),
          unit: "pts total",
        }))
        .sort((a, b) => b.value - a.value || compareNames(a.name, b.name));
      const ranked = addDenseRanks(usersWithPoints);
      return NextResponse.json(ranked.slice(0, limit));
    }

    // ── Default: team leaderboard scoped to challenge ─────────────────────
    const teams = await db.team.findMany({
      where: challengeId ? { challengeId } : {},
      include: {
        members: {
          include: {
            user: {
              include: {
                actions: {
                  where: {
                    ...(challengeId ? { challengeId } : {}),
                    ...(category ? { category: category as "TRANSPORT" | "WATER" | "ENERGY" | "RECYCLING" | "FOOD" } : {}),
                  },
                  select: { points: true },
                },
              },
            },
          },
        },
      },
    });

    const leaderboard = teams
      .map((team) => {
        const totalPoints = team.members.reduce(
          (teamSum, member) =>
            teamSum + member.user.actions.reduce((s, a) => s + a.points, 0),
          0
        );
        return { id: team.id, name: team.name, totalPoints, memberCount: team.members.length };
      })
      .sort(
        (a, b) => b.totalPoints - a.totalPoints || compareNames(a.name, b.name)
      );

    return NextResponse.json(addDenseRanksToTeams(leaderboard));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
