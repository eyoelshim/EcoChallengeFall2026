"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { ActionCategory, ChallengeStatus, UserStatus } from "@prisma/client";

import { CATEGORY_CONFIG } from "@/app/admin/admin/dashboard-display";

export type DashboardTelemetry = Awaited<ReturnType<typeof getAdminDashboardTelemetry>>;

export async function getAdminDashboardTelemetry() {
  await requireAdmin();

  // Execute parallel queries for atomic telemetry snapshot
  const [
    activeChallengesCount,
    upcomingChallengesCount,
    totalActionsTaken,
    activeUsersCount,
    pointsAggregate,
    departmentCountRaw,
    distinctLegacyDepts,
    recentActions,
    topUserPoints,
    categoryGroupCounts,
  ] = await db.$transaction([
    db.challenge.count({ where: { status: ChallengeStatus.ACTIVE } }),
    db.challenge.count({ where: { status: ChallengeStatus.UPCOMING } }),
    db.action.count(),
    db.user.count({ where: { status: UserStatus.ACTIVE } }),
    db.action.aggregate({ _sum: { points: true } }),
    db.department.count(),
    db.user.findMany({
      where: { departmentName: { not: null } },
      distinct: ["departmentName"],
      select: { departmentName: true },
    }),
    db.action.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            departmentName: true,
            department: { select: { id: true, name: true } },
          },
        },
        challenge: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.action.groupBy({
      by: ["userId"],
      _sum: { points: true },
      orderBy: { _sum: { points: "desc" } },
      take: 5,
    }),
    db.action.groupBy({
      by: ["category"],
      _count: { id: true },
      orderBy: {
        category: "asc",
      },
    }),
  ]);

  // Fetch profiles for the top points users
  const topUserIds = topUserPoints.map((p) => p.userId);
  const topUsers =
    topUserIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: topUserIds } },
          select: {
            id: true,
            name: true,
            role: true,
            departmentName: true,
            department: { select: { id: true, name: true } },
          },
        })
      : [];

  const userMap = new Map(topUsers.map((u) => [u.id, u]));

  const totalPointsEarned = pointsAggregate._sum?.points ?? 0;
  const avgPointsPerUser = activeUsersCount > 0 ? Math.round(totalPointsEarned / activeUsersCount) : 0;
  const estimatedCO2 = Math.round(totalActionsTaken * 0.27);
  const departmentsCount = departmentCountRaw > 0 ? departmentCountRaw : distinctLegacyDepts.length;

  // Completion rate: ratio of actions logged to expected participant goals (5 actions per active user baseline)
  const targetActions = Math.max(activeUsersCount * 5, 1);
  const completionRate = Math.min(100, Math.round((totalActionsTaken / targetActions) * 100));

  // Top 5 Leaderboard with relative percentage to rank 1
  const maxPoints = topUserPoints[0]?._sum?.points ?? 1;
  const leaderboard = topUserPoints.map((item, index) => {
    const user = userMap.get(item.userId);
    const points = item._sum?.points ?? 0;
    return {
      rank: index + 1,
      id: item.userId,
      name: user?.name ?? "Participant",
      role: user?.role ?? "GENERAL_USER",
      department: user?.department?.name ?? user?.departmentName ?? "Individual",
      points,
      pct: maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0,
    };
  });

  // Category Distribution across all 5 official categories
  const getCount = (val: unknown): number => {
    if (typeof val === "number") return val;
    if (val && typeof val === "object" && "id" in val) {
      return Number((val as { id?: number }).id ?? 0);
    }
    return 0;
  };

  const totalCategoryActions = categoryGroupCounts.reduce((acc, c) => acc + getCount(c._count), 0);
  const categoryDistribution = Object.values(ActionCategory).map((category) => {
    const found = categoryGroupCounts.find((c) => c.category === category);
    const count = getCount(found?._count);
    const pct = totalCategoryActions > 0 ? Math.round((count / totalCategoryActions) * 100) : 0;
    const meta = CATEGORY_CONFIG[category];
    return {
      category,
      label: meta.label,
      color: meta.color,
      badge: meta.badge,
      count,
      pct,
    };
  });

  return {
    kpis: {
      activeChallengesCount,
      upcomingChallengesCount,
      totalActionsTaken,
      activeUsersCount,
      totalPointsEarned,
      avgPointsPerUser,
      estimatedCO2,
      completionRate,
      departmentsCount,
    },
    leaderboard,
    categoryDistribution,
    recentActions: recentActions.map((action) => {
      const meta = CATEGORY_CONFIG[action.category];
      return {
        id: action.id,
        userId: action.user.id,
        userName: action.user.name,
        userDepartment: action.user.department?.name ?? action.user.departmentName ?? "Individual",
        actionType: action.actionType,
        category: action.category,
        label: meta?.label ?? action.category,
        badge: meta?.badge ?? "bg-slate-100 text-slate-700 ring-slate-200",
        points: action.points,
        note: action.note,
        challengeId: action.challenge?.id ?? null,
        challengeName: action.challenge?.name ?? "General Program",
        createdAt: action.createdAt.toISOString(),
      };
    }),
  };
}
