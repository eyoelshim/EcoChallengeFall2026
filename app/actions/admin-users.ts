"use server";

import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Prisma, UserRole, UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import {
  CLERK_ADMIN_ROLE,
  CLERK_SUPERADMIN_ROLE,
  getEnvSuperAdminEmails,
  isCurrentUserAdmin,
  isCurrentUserSuperAdmin,
  isEnvSuperAdminEmail,
} from "@/lib/authz";

const USERS_PATH = "/admin/admin/users";

async function requireAdminActor() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!(await isCurrentUserAdmin())) throw new Error("Forbidden");
  return db.user.findUnique({ where: { clerkId: userId } });
}

// SUPERADMIN_EMAILS overrides the stored role, so filters and badges match real permissions
function effectiveRole(user: { email: string; role: UserRole }): UserRole {
  return isEnvSuperAdminEmail(user.email) ? UserRole.SUPERADMIN : user.role;
}

function roleWhere(role: UserRole): Prisma.UserWhereInput {
  const envEmails = getEnvSuperAdminEmails();
  const emailIn = { in: envEmails, mode: "insensitive" as const };
  if (role === UserRole.SUPERADMIN) {
    return { OR: [{ role }, { email: emailIn }] };
  }
  return { role, NOT: { email: emailIn } };
}

function isUserRole(value: string | undefined): value is UserRole {
  return !!value && Object.values(UserRole).includes(value as UserRole);
}

function isUserStatus(value: string | undefined): value is UserStatus {
  return !!value && Object.values(UserStatus).includes(value as UserStatus);
}

export async function getAdminUsers(params: {
  role?: string;
  status?: string;
  departmentId?: string;
  department?: string;
  search?: string;
}) {
  await requireAdminActor();

  // Filters other than role/status, so the tab counts reflect the current search and department
  const baseFilters: Prisma.UserWhereInput[] = [];
  if (params.departmentId) baseFilters.push({ departmentId: params.departmentId });
  // Department table is not backfilled yet (#35), so also filter on the legacy free-text name
  if (params.department) baseFilters.push({ departmentName: params.department });
  const search = params.search?.trim();
  if (search) {
    baseFilters.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { departmentName: { contains: search, mode: "insensitive" } },
        { department: { name: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  const filters = [...baseFilters];
  if (isUserRole(params.role)) filters.push(roleWhere(params.role));
  if (isUserStatus(params.status)) filters.push({ status: params.status });

  const [users, pointSums, departmentRows, roleCounts, statusCounts, total] = await Promise.all([
    db.user.findMany({
      where: { AND: filters },
      include: {
        department: { select: { id: true, name: true } },
        _count: { select: { challenges: true, actions: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.action.groupBy({ by: ["userId"], _sum: { points: true } }),
    db.user.findMany({
      where: { departmentName: { not: null } },
      distinct: ["departmentName"],
      select: { departmentName: true },
      orderBy: { departmentName: "asc" },
    }),
    Promise.all(
      Object.values(UserRole).map(async (role) => [
        role,
        await db.user.count({ where: { AND: [...baseFilters, roleWhere(role)] } }),
      ] as const)
    ),
    Promise.all(
      Object.values(UserStatus).map(async (status) => [
        status,
        await db.user.count({ where: { AND: [...baseFilters, { status }] } }),
      ] as const)
    ),
    db.user.count({ where: { AND: baseFilters } }),
  ]);

  const pointsByUser = new Map(pointSums.map((row) => [row.userId, row._sum.points ?? 0]));

  return {
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department?.name ?? user.departmentName,
      role: effectiveRole(user),
      status: user.status,
      streak: user.streak,
      totalPoints: pointsByUser.get(user.id) ?? 0,
      actionsLogged: user._count.actions,
      challengesJoined: user._count.challenges,
      joinedAt: user.createdAt,
    })),
    departments: departmentRows.map((row) => row.departmentName as string),
    roleCounts: Object.fromEntries(roleCounts) as Record<UserRole, number>,
    statusCounts: Object.fromEntries(statusCounts) as Record<UserStatus, number>,
    total,
  };
}

export async function getAdminUserDetail(userId: string) {
  await requireAdminActor();

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      department: { select: { id: true, name: true } },
      challenges: {
        include: { challenge: { select: { id: true, name: true, code: true } } },
        orderBy: { createdAt: "asc" },
      },
      actions: {
        include: { challenge: { select: { id: true, name: true } } },
        orderBy: { date: "desc" },
      },
      teams: {
        include: { team: { select: { id: true, name: true, challenge: { select: { name: true } } } } },
      },
      activityLogs: { orderBy: { timestamp: "desc" } },
    },
  });
  if (!user) return null;

  const [lifetime, perChallenge] = await Promise.all([
    db.action.aggregate({ where: { userId }, _sum: { points: true } }),
    db.action.groupBy({ by: ["challengeId"], where: { userId }, _sum: { points: true } }),
  ]);
  const lifetimePoints = lifetime._sum.points ?? 0;

  // Joined challenges plus any challenge the user logged actions in
  const challengeNames = new Map<string, string>();
  for (const uc of user.challenges) challengeNames.set(uc.challenge.id, uc.challenge.name);
  for (const action of user.actions) {
    if (action.challenge) challengeNames.set(action.challenge.id, action.challenge.name);
  }
  const pointsByChallenge = new Map(perChallenge.map((row) => [row.challengeId, row._sum.points ?? 0]));

  const challengePoints = [...challengeNames].map(([challengeId, challengeName]) => ({
    challengeId,
    challengeName,
    points: pointsByChallenge.get(challengeId) ?? 0,
  }));
  const unassignedPoints = pointsByChallenge.get(null) ?? 0;
  if (unassignedPoints > 0) {
    challengePoints.push({ challengeId: "none", challengeName: "No challenge", points: unassignedPoints });
  }
  challengePoints.sort((a, b) => b.points - a.points);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department?.name ?? user.departmentName,
    role: effectiveRole(user),
    roleManagedByEnv: isEnvSuperAdminEmail(user.email),
    status: user.status,
    streak: user.streak,
    lastActionDate: user.lastActionDate,
    joinedAt: user.createdAt,
    lifetimePoints,
    challengePoints,
    teams: user.teams.map((tm) => ({
      id: tm.team.id,
      name: tm.team.name,
      challengeName: tm.team.challenge?.name ?? null,
    })),
    actions: user.actions.map((action) => ({
      id: action.id,
      challengeName: action.challenge?.name ?? null,
      actionType: action.actionType,
      category: action.category,
      points: action.points,
      note: action.note,
      date: action.date,
    })),
    activityLogs: user.activityLogs.map((log) => ({
      id: log.id,
      action: log.action,
      details: log.details,
      timestamp: log.timestamp,
    })),
  };
}

type MutationResult = { error?: string };

// Next.js hides thrown error messages from the client in production, so mutations return them instead
async function toResult(fn: () => Promise<void>): Promise<MutationResult> {
  try {
    await fn();
    return {};
  } catch (err) {
    console.error(err);
    return { error: err instanceof Error ? err.message : "Something went wrong" };
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<MutationResult> {
  return toResult(() => applyUserRole(userId, role));
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<MutationResult> {
  return toResult(() => applyUserStatus(userId, status));
}

async function applyUserRole(userId: string, role: UserRole) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");
  if (!(await isCurrentUserSuperAdmin())) throw new Error("Only SuperAdmins can change roles");
  if (!isUserRole(role)) throw new Error("Invalid role");

  const actor = await db.user.findUnique({ where: { clerkId } });
  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found");
  if (target.clerkId === clerkId) throw new Error("You can't change your own role");
  if (isEnvSuperAdminEmail(target.email)) {
    throw new Error("This user is a SuperAdmin via SUPERADMIN_EMAILS; change it there");
  }
  if (target.role === role) return;

  // Clerk metadata controls console access, so update it first; a Clerk failure leaves the DB unchanged
  const clerkRole =
    role === UserRole.SUPERADMIN ? CLERK_SUPERADMIN_ROLE : role === UserRole.ADMIN ? CLERK_ADMIN_ROLE : null;
  const client = await clerkClient();
  await client.users.updateUserMetadata(target.clerkId, { publicMetadata: { role: clerkRole } });

  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { role } }),
    db.activityLog.create({
      data: {
        userId,
        action: "Role Changed",
        details: `${target.role} → ${role} by ${actor?.name ?? "SuperAdmin"}`,
      },
    }),
  ]);

  revalidatePath(USERS_PATH);
  revalidatePath(`${USERS_PATH}/${userId}`);
}

async function applyUserStatus(userId: string, status: UserStatus) {
  const actor = await requireAdminActor();
  if (!isUserStatus(status)) throw new Error("Invalid status");

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found");
  if (actor && target.id === actor.id) throw new Error("You can't change your own status");
  if (target.status === status) return;

  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { status } }),
    db.activityLog.create({
      data: {
        userId,
        action: status === UserStatus.DEACTIVATED ? "User Deactivated" : "User Reactivated",
        details: `by ${actor?.name ?? "Admin"}`,
      },
    }),
  ]);

  revalidatePath(USERS_PATH);
  revalidatePath(`${USERS_PATH}/${userId}`);
}
