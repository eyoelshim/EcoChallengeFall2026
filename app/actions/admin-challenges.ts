"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { ActionCategory, ChallengeStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isCurrentUserAdmin, requireAdmin } from "@/lib/authz";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";

const CHALLENGES_PATH = "/admin/admin/challenges";

async function requireAdminActor() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!(await isCurrentUserAdmin())) throw new Error("Forbidden");
  return db.user.findUnique({ where: { clerkId: userId } });
}

function isChallengeStatus(value: string | undefined): value is ChallengeStatus {
  return !!value && Object.values(ChallengeStatus).includes(value as ChallengeStatus);
}

export async function getAdminChallenges(filter?: { status?: string; search?: string }) {
  await requireAdmin();

  // The global challenge is the default app experience, not an admin-managed challenge
  const filters: Prisma.ChallengeWhereInput[] = [{ id: { not: GLOBAL_CHALLENGE_ID } }];
  if (isChallengeStatus(filter?.status)) filters.push({ status: filter.status });
  const search = filter?.search?.trim();
  if (search) {
    filters.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const challenges = await db.challenge.findMany({
    where: { AND: filters },
    include: {
      department: { select: { id: true, name: true } },
      _count: { select: { users: true, actions: true } },
    },
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
  });

  return challenges.map((challenge) => ({
    id: challenge.id,
    name: challenge.name,
    code: challenge.code,
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    category: challenge.category,
    status: challenge.status,
    department: challenge.department?.name ?? null,
    participantCount: challenge._count.users,
    actionsLogged: challenge._count.actions,
  }));
}

export async function getAdminChallengeById(id: string) {
  await requireAdmin();
  if (id === GLOBAL_CHALLENGE_ID) return null;

  const challenge = await db.challenge.findUnique({
    where: { id },
    include: {
      department: { select: { id: true, name: true } },
      challengeActions: { include: { actionCatalog: true } },
      teams: {
        include: { members: { select: { userId: true } } },
        orderBy: { name: "asc" },
      },
      users: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
      actions: {
        take: 20,
        orderBy: { date: "desc" },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });
  if (!challenge) return null;

  const pointSums = await db.action.groupBy({
    by: ["userId"],
    where: { challengeId: id },
    _sum: { points: true },
    orderBy: { _sum: { points: "desc" } },
  });

  const teamByUser = new Map<string, string>();
  for (const team of challenge.teams) {
    for (const member of team.members) teamByUser.set(member.userId, team.name);
  }

  const participants = challenge.users.map((uc) => ({
    id: uc.user.id,
    name: uc.user.name,
    email: uc.user.email,
    team: teamByUser.get(uc.user.id) ?? null,
    joinedAt: uc.createdAt,
  }));
  const nameByUser = new Map(participants.map((p) => [p.id, p.name]));

  return {
    id: challenge.id,
    name: challenge.name,
    code: challenge.code,
    description: challenge.description,
    category: challenge.category,
    status: challenge.status,
    themeColor: challenge.themeColor,
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    department: challenge.department?.name ?? null,
    participantCount: participants.length,
    participants,
    teams: challenge.teams.map((team) => ({
      id: team.id,
      name: team.name,
      memberCount: team.members.length,
    })),
    actions: challenge.challengeActions.map(({ actionCatalog }) => ({
      id: actionCatalog.id,
      title: actionCatalog.title,
      description: actionCatalog.description,
      category: actionCatalog.category,
      points: actionCatalog.points,
    })),
    leaderboard: pointSums.map((row, index) => ({
      rank: index + 1,
      userId: row.userId,
      name: nameByUser.get(row.userId) ?? "Participant",
      team: teamByUser.get(row.userId) ?? null,
      points: row._sum.points ?? 0,
    })),
    recentActions: challenge.actions.map((action) => ({
      id: action.id,
      userName: action.user.name,
      actionType: action.actionType,
      category: action.category,
      points: action.points,
      date: action.date,
    })),
  };
}

// Departments for the form's dropdown and live challenges for "Clone Past Challenge"
export async function getChallengeFormOptions() {
  await requireAdmin();

  const [departments, challenges] = await Promise.all([
    db.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.challenge.findMany({
      where: { id: { not: GLOBAL_CHALLENGE_ID } },
      include: { challengeActions: { include: { actionCatalog: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    departments,
    challenges: challenges.map((challenge) => ({
      id: challenge.id,
      name: challenge.name,
      status: challenge.status,
      category: challenge.category,
      description: challenge.description,
      departmentId: challenge.departmentId,
      themeColor: challenge.themeColor,
      actions: challenge.challengeActions.map(({ actionCatalog }) => ({
        catalogId: actionCatalog.id,
        title: actionCatalog.title,
        description: actionCatalog.description ?? "",
        category: actionCatalog.category as string,
        points: actionCatalog.points,
      })),
    })),
  };
}

// Template presets use display categories; catalog actions use the enum
const ACTION_CATEGORY_ALIASES: Record<string, ActionCategory> = {
  Transportation: ActionCategory.TRANSPORT,
  Water: ActionCategory.WATER,
  Energy: ActionCategory.ENERGY,
  Waste: ActionCategory.RECYCLING,
  Food: ActionCategory.FOOD,
};

const stagedActionSchema = z.object({
  catalogId: z.string().optional(),
  title: z.string().trim().min(1),
  description: z.string().optional(),
  category: z
    .string()
    .transform((value) => ACTION_CATEGORY_ALIASES[value] ?? value)
    .pipe(z.enum(ActionCategory)),
  points: z.coerce.number().int().min(0),
});

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const createChallengeSchema = z
  .object({
    name: z.string().trim().min(1, "Challenge name is required."),
    description: z.string().trim().min(10, "Add a short description (at least 10 characters)."),
    category: z.string().trim().min(1, "Pick a category."),
    departmentId: z
      .string()
      .optional()
      .transform((value) => value || undefined),
    startDate: z.string().regex(datePattern, "Start date is required."),
    endDate: z.string().regex(datePattern, "End date is required."),
    themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid color."),
    actions: z
      .string()
      .optional()
      .transform((value, ctx) => {
        try {
          return value ? JSON.parse(value) : [];
        } catch {
          ctx.addIssue({ code: "custom", message: "Invalid staged actions." });
          return z.NEVER;
        }
      })
      .pipe(z.array(stagedActionSchema)),
  })
  .refine((data) => data.endDate >= data.startDate, {
    path: ["endDate"],
    message: "End date must be on or after the start date.",
  });

export type CreateChallengeField = "name" | "description" | "category" | "departmentId" | "startDate" | "endDate" | "themeColor" | "actions";

export type CreateChallengeResult = {
  error?: string;
  fieldErrors?: Partial<Record<CreateChallengeField, string>>;
};

async function generateChallengeCode() {
  let code = "";
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase().padEnd(6, "0");
  } while (await db.challenge.findUnique({ where: { code } }));
  return code;
}

function statusForDates(startDate: string, endDate: string): ChallengeStatus {
  const today = new Date().toISOString().slice(0, 10);
  if (endDate < today) return ChallengeStatus.COMPLETED;
  if (startDate <= today) return ChallengeStatus.ACTIVE;
  return ChallengeStatus.UPCOMING;
}

export async function createAdminChallenge(formData: FormData): Promise<CreateChallengeResult> {
  let challengeId: string;
  try {
    const actor = await requireAdminActor();

    const parsed = createChallengeSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return {
        fieldErrors: Object.fromEntries(
          Object.entries(fieldErrors).map(([field, messages]) => [field, messages?.[0]])
        ),
      };
    }
    const data = parsed.data;
    const code = await generateChallengeCode();

    const challenge = await db.$transaction(async (tx) => {
      const created = await tx.challenge.create({
        data: {
          name: data.name,
          code,
          description: data.description,
          category: data.category,
          departmentId: data.departmentId,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          themeColor: data.themeColor,
          status: statusForDates(data.startDate, data.endDate),
          createdBy: actor?.id,
        },
      });

      // Cloned actions keep their catalog entry; template actions reuse or add one by title + category
      const catalogIds = new Set<string>();
      for (const action of data.actions) {
        const existing = action.catalogId
          ? await tx.actionCatalog.findUnique({ where: { id: action.catalogId } })
          : await tx.actionCatalog.findFirst({ where: { title: action.title, category: action.category } });
        const catalog =
          existing ??
          (await tx.actionCatalog.create({
            data: {
              title: action.title,
              description: action.description || null,
              category: action.category,
              points: action.points,
            },
          }));
        catalogIds.add(catalog.id);
      }
      if (catalogIds.size > 0) {
        await tx.challengeAction.createMany({
          data: [...catalogIds].map((actionCatalogId) => ({ challengeId: created.id, actionCatalogId })),
        });
      }

      await tx.activityLog.create({
        data: {
          userId: actor?.id,
          action: "Challenge Created",
          details: `${created.name} (${created.code}) by ${actor?.name ?? "Admin"}`,
        },
      });

      return created;
    });
    challengeId = challenge.id;
  } catch (err) {
    console.error(err);
    // Next.js hides thrown error messages from the client in production, so return them instead
    return { error: err instanceof Error ? err.message : "Something went wrong" };
  }

  revalidatePath(CHALLENGES_PATH);
  revalidatePath(`${CHALLENGES_PATH}/${challengeId}`);
  redirect(CHALLENGES_PATH);
}

export async function updateChallengeStatus(id: string, status: ChallengeStatus): Promise<{ error?: string }> {
  try {
    const actor = await requireAdminActor();
    if (!isChallengeStatus(status)) throw new Error("Invalid status");

    const challenge = await db.challenge.findUnique({ where: { id } });
    if (!challenge || challenge.id === GLOBAL_CHALLENGE_ID) throw new Error("Challenge not found");
    if (challenge.status === status) return {};

    await db.$transaction([
      db.challenge.update({ where: { id }, data: { status } }),
      db.activityLog.create({
        data: {
          userId: actor?.id,
          action: "Challenge Status Changed",
          details: `${challenge.name}: ${challenge.status} → ${status} by ${actor?.name ?? "Admin"}`,
        },
      }),
    ]);
  } catch (err) {
    console.error(err);
    return { error: err instanceof Error ? err.message : "Something went wrong" };
  }

  revalidatePath(CHALLENGES_PATH);
  revalidatePath(`${CHALLENGES_PATH}/${id}`);
  return {};
}
