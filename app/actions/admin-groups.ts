"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

export interface DepartmentListItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  activeChallenge: string | null;
  membersCount: number;
  challengesCount: number;
  totalPoints: number;
  _count: {
    users: number;
    challenges: number;
  };
}

export interface DepartmentMemberItem {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  streak: number;
  actionsLogged: number;
}

export interface DepartmentDetailItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  activeChallenge: string | null;
  membersCount: number;
  challengesCount: number;
  totalPoints: number;
  challenges: Array<{ id: string; name: string; status: string }>;
  users: DepartmentMemberItem[];
  _count: {
    users: number;
    challenges: number;
  };
}

export interface TeamRequestItem {
  id: string;
  name: string;
  message: string | null;
  status: string;
  createdAt: Date | string;
  challengeId: string;
  challenge: {
    id: string;
    name: string;
  };
  requestedBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

type CreateDepartmentInput = {
  name: string;
  description?: string | null;
};

type ReviewTeamRequestInput = {
  requestId: string;
  action: "APPROVE" | "REJECT";
  reviewerId?: string;
};

/**
 * Fetch all departments with user and challenge counts, active challenge name,
 * and aggregated points earned by members.
 */
export async function getAdminDepartments(): Promise<DepartmentListItem[]> {
  await requireAdmin();

  try {
    const departments = await db.department.findMany({
      include: {
        users: { select: { id: true } },
        challenges: {
          where: { status: "ACTIVE" },
          select: { id: true, name: true },
          take: 1,
        },
        _count: {
          select: { users: true, challenges: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // Calculate total points for all users grouped by user ID
    const pointSums = await db.action.groupBy({
      by: ["userId"],
      _sum: { points: true },
    });
    const pointsByUser = new Map(pointSums.map((p) => [p.userId, p._sum.points ?? 0]));

    return departments.map((dept) => {
      const totalPoints = dept.users.reduce(
        (sum, u) => sum + (pointsByUser.get(u.id) ?? 0),
        0
      );
      return {
        id: dept.id,
        name: dept.name,
        description: dept.description,
        createdAt: dept.createdAt,
        activeChallenge: dept.challenges[0]?.name ?? null,
        membersCount: dept._count.users,
        challengesCount: dept._count.challenges,
        totalPoints,
        _count: dept._count,
      };
    });
  } catch (error) {
    console.error("Error in getAdminDepartments:", error);
    return [];
  }
}

/**
 * Fetch single department detail with full roster, direct profile links, and live metrics.
 */
export async function getAdminDepartment(id: string): Promise<DepartmentDetailItem | null> {
  await requireAdmin();

  try {
    const department = await db.department.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            streak: true,
            _count: { select: { actions: true } },
          },
          orderBy: { name: "asc" },
        },
        challenges: {
          select: { id: true, name: true, status: true },
          orderBy: { startDate: "desc" },
        },
        _count: {
          select: { users: true, challenges: true },
        },
      },
    });

    if (!department) return null;

    const userIds = department.users.map((u) => u.id);
    const pointSum =
      userIds.length > 0
        ? await db.action.aggregate({
            where: { userId: { in: userIds } },
            _sum: { points: true },
          })
        : { _sum: { points: 0 } };

    const activeChallenge =
      department.challenges.find((c) => c.status === "ACTIVE")?.name ?? null;

    return {
      id: department.id,
      name: department.name,
      description: department.description,
      createdAt: department.createdAt,
      activeChallenge,
      membersCount: department._count.users,
      challengesCount: department._count.challenges,
      totalPoints: pointSum._sum.points ?? 0,
      challenges: department.challenges,
      users: department.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        streak: u.streak,
        actionsLogged: u._count.actions,
      })),
      _count: department._count,
    };
  } catch (error) {
    console.error("Error in getAdminDepartment:", error);
    return null;
  }
}

/**
 * Fetch all pending team creation requests.
 */
export async function getPendingTeamRequests(): Promise<TeamRequestItem[]> {
  await requireAdmin();

  try {
    const requests = await db.teamRequest.findMany({
      where: { status: "PENDING" },
      include: {
        requestedBy: { select: { id: true, name: true, email: true } },
        challenge: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests.map((req) => ({
      id: req.id,
      name: req.name,
      message: req.message,
      status: req.status,
      createdAt: req.createdAt,
      challengeId: req.challengeId,
      challenge: req.challenge,
      requestedBy: req.requestedBy,
    }));
  } catch (error) {
    console.error("Error in getPendingTeamRequests:", error);
    return [];
  }
}

// Singular alias for backwards compatibility
export const getPendingTeamRequest = getPendingTeamRequests;

/**
 * Review a team creation request (APPROVE or REJECT).
 * Securely determines reviewer via Clerk auth session if not supplied.
 * Creates Team and TeamMember records atomically on approval.
 */
export async function reviewTeamRequest({
  requestId,
  action,
  reviewerId,
}: ReviewTeamRequestInput) {
  await requireAdmin();

  let actorId = reviewerId;
  if (!actorId) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");
    const adminUser = await db.user.findUnique({ where: { clerkId: clerkUserId } });
    actorId = adminUser?.id;
  }

  if (!actorId) {
    throw new Error("Admin reviewer user record not found in database.");
  }

  return db.$transaction(async (tx) => {
    const request = await tx.teamRequest.findUnique({
      where: { id: requestId },
      include: {
        requestedBy: true,
        challenge: { select: { id: true, name: true } },
      },
    });

    if (!request) {
      throw new Error("Team request not found.");
    }

    if (request.status !== "PENDING") {
      throw new Error("This request has already been reviewed.");
    }

    if (action === "REJECT") {
      const updated = await tx.teamRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          reviewedById: actorId,
          reviewedAt: new Date(),
        },
      });

      await tx.activityLog.create({
        data: {
          userId: actorId,
          action: "Team Request Rejected",
          details: `Rejected team "${request.name}" for challenge "${request.challenge.name}" requested by ${
            request.requestedBy.name || request.requestedBy.email
          }`,
        },
      });

      return updated;
    }

    // Check duplicate team name in the same challenge
    const duplicateTeam = await tx.team.findFirst({
      where: { challengeId: request.challengeId, name: request.name },
      select: { id: true },
    });
    if (duplicateTeam) {
      throw new Error(`A team with name "${request.name}" already exists in this challenge.`);
    }

    // Create Team
    const team = await tx.team.create({
      data: {
        name: request.name,
        challengeId: request.challengeId,
      },
    });

    // Attach user as TeamMember
    await tx.teamMember.create({
      data: {
        userId: request.requestedById,
        teamId: team.id,
      },
    });

    // Ensure user is enrolled in the challenge
    await tx.userChallenge.upsert({
      where: {
        userId_challengeId: {
          userId: request.requestedById,
          challengeId: request.challengeId,
        },
      },
      create: {
        userId: request.requestedById,
        challengeId: request.challengeId,
      },
      update: {},
    });

    // Update TeamRequest status to APPROVED
    const updated = await tx.teamRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewedById: actorId,
        reviewedAt: new Date(),
      },
    });

    // Record activity audit log
    await tx.activityLog.create({
      data: {
        userId: actorId,
        action: "Team Request Approved",
        details: `Approved team "${request.name}" for challenge "${request.challenge.name}" (Team ID: ${team.id})`,
      },
    });

    return updated;
  });
}

/**
 * Create a new Department record in PostgreSQL.
 */
export async function createDepartment(input: CreateDepartmentInput) {
  await requireAdmin();

  const { userId: clerkUserId } = await auth();
  const actor = clerkUserId ? await db.user.findUnique({ where: { clerkId: clerkUserId } }) : null;

  const trimmedName = input.name.trim();
  if (!trimmedName) {
    throw new Error("Department name is required.");
  }

  const existing = await db.department.findUnique({
    where: { name: trimmedName },
  });
  if (existing) {
    throw new Error(`A department with the name "${trimmedName}" already exists.`);
  }

  const department = await db.department.create({
    data: {
      name: trimmedName,
      description: input.description?.trim() || null,
    },
  });

  if (actor) {
    await db.activityLog.create({
      data: {
        userId: actor.id,
        action: "Department Created",
        details: `Created department "${department.name}" by ${actor.name ?? "Admin"}`,
      },
    });
  }

  revalidatePath("/admin/admin/groups");
  return department;
}
