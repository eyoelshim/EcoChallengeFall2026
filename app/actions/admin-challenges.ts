"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { ActionCategory, ChallengeStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isCurrentUserAdmin, requireAdmin, requireSuperAdmin } from "@/lib/authz";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";
import { checkStatusAgainstDates, isReopening, statusForDates, toISODate } from "@/lib/challenge-lifecycle";

const CHALLENGES_PATH = "/admin/challenges";

async function requireAdminActor() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!(await isCurrentUserAdmin())) throw new Error("Forbidden");
  return db.user.findUnique({ where: { clerkId: userId } });
}

function isChallengeStatus(
  value: string | undefined,
): value is ChallengeStatus {
  return (
    !!value && Object.values(ChallengeStatus).includes(value as ChallengeStatus)
  );
}

export async function getAdminChallenges(filter?: {
  status?: string;
  search?: string;
}) {
  await requireAdmin();

  // The global challenge is the default app experience, not an admin-managed challenge
  const filters: Prisma.ChallengeWhereInput[] = [
    { id: { not: GLOBAL_CHALLENGE_ID } },
  ];
  if (isChallengeStatus(filter?.status))
    filters.push({ status: filter.status });
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
        // imageUrl holds inline base64 photos (MBs per row) and is never shown here
        omit: { imageUrl: true },
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
    deactivatedAt: uc.deactivatedAt,
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
    actions: challenge.challengeActions.map((challengeAction) => ({
      id: challengeAction.actionCatalog.id,
      title:
        challengeAction.titleOverride || challengeAction.actionCatalog.title,
      description: challengeAction.actionCatalog.description,
      category: challengeAction.actionCatalog.category,
      points:
        challengeAction.pointsOverride ?? challengeAction.actionCatalog.points,
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

// Just the editable fields, with dates as YYYY-MM-DD so they drop straight into <input type="date">
export async function getAdminChallengeForEdit(id: string) {
  await requireAdmin();
  if (id === GLOBAL_CHALLENGE_ID) return null;

  const challenge = await db.challenge.findUnique({ where: { id } });
  if (!challenge) return null;

  return {
    id: challenge.id,
    name: challenge.name,
    code: challenge.code,
    description: challenge.description ?? "",
    category: challenge.category ?? "",
    departmentId: challenge.departmentId ?? "",
    startDate: toISODate(challenge.startDate),
    endDate: toISODate(challenge.endDate),
    themeColor: challenge.themeColor ?? "#10B981",
    status: challenge.status,
  };
}

export async function getDepartmentOptions() {
  await requireAdmin();
  return db.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

// Departments for the form's dropdown and live challenges for "Clone Past Challenge"
export async function getChallengeFormOptions() {
  await requireAdmin();

  const [departments, challenges] = await Promise.all([
    db.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
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
      actions: challenge.challengeActions.map((challengeAction) => ({
        catalogId: challengeAction.actionCatalog.id,
        title:
          challengeAction.titleOverride || challengeAction.actionCatalog.title,
        description: challengeAction.actionCatalog.description ?? "",
        category: challengeAction.actionCatalog.category as string,
        points:
          challengeAction.pointsOverride ??
          challengeAction.actionCatalog.points,
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

// Fields shared by the create and edit forms
const challengeFieldsSchema = z.object({
  name: z.string().trim().min(1, "Challenge name is required."),
  description: z.string().trim().min(10, "Add a short description (at least 10 characters)."),
  category: z.string().trim().min(1, "Pick a category."),
  // Empty means "All departments". Use null rather than undefined so an update clears it instead of leaving it unchanged.
  departmentId: z
    .string()
    .optional()
    .transform((value) => value || null),
  startDate: z.string().regex(datePattern, "Start date is required."),
  endDate: z.string().regex(datePattern, "End date is required."),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid color."),
});

// Issue #57: startDate must be strictly before endDate
const endAfterStart = (data: { startDate: string; endDate: string }) => data.endDate > data.startDate;
const endNotAfterStartIssue = { path: ["endDate"], message: "End date must be after the start date." };

const createChallengeSchema = challengeFieldsSchema
  .extend({
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
  .refine(endAfterStart, endNotAfterStartIssue);

const updateChallengeSchema = challengeFieldsSchema
  .extend({ status: z.enum(ChallengeStatus, "Pick a status.") })
  .refine(endAfterStart, endNotAfterStartIssue);

export type ChallengeFormField =
  | "name"
  | "description"
  | "category"
  | "departmentId"
  | "startDate"
  | "endDate"
  | "themeColor"
  | "actions"
  | "status";

export type ChallengeFormResult = {
  error?: string;
  fieldErrors?: Partial<Record<ChallengeFormField, string>>;
};

// First validation message per field, for showing under each input
function firstFieldErrors(error: z.ZodError): ChallengeFormResult["fieldErrors"] {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !(field in errors)) errors[field] = issue.message;
  }
  return errors;
}

async function generateChallengeCode() {
  let code = "";
  do {
    code = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
      .padEnd(6, "0");
  } while (await db.challenge.findUnique({ where: { code } }));
  return code;
}

export async function createAdminChallenge(formData: FormData): Promise<ChallengeFormResult> {
  let challengeId: string;
  try {
    const actor = await requireAdminActor();

    const parsed = createChallengeSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error) };
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
          ? await tx.actionCatalog.findUnique({
              where: { id: action.catalogId },
            })
          : await tx.actionCatalog.findFirst({
              where: { title: action.title, category: action.category },
            });
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
          data: [...catalogIds].map((actionCatalogId) => ({
            challengeId: created.id,
            actionCatalogId,
          })),
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
    return {
      error: err instanceof Error ? err.message : "Something went wrong",
    };
  }

  revalidatePath(CHALLENGES_PATH);
  revalidatePath(`${CHALLENGES_PATH}/${challengeId}`);
  redirect(CHALLENGES_PATH);
}

export async function updateChallengeStatus(
  id: string,
  status: ChallengeStatus,
): Promise<{ error?: string }> {
  try {
    const actor = await requireAdminActor();
    if (!isChallengeStatus(status)) throw new Error("Invalid status");

    const challenge = await db.challenge.findUnique({ where: { id } });
    if (!challenge || challenge.id === GLOBAL_CHALLENGE_ID)
      throw new Error("Challenge not found");
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
    return {
      error: err instanceof Error ? err.message : "Something went wrong",
    };
  }

  revalidatePath(CHALLENGES_PATH);
  revalidatePath(`${CHALLENGES_PATH}/${id}`);
  return {};
}

// Edits a challenge's details and status. Also handles reopening an archived/completed challenge
// with new dates, e.g. rerunning Earth Month each year (stakeholder decision, Nov 5 2026).
export async function updateAdminChallenge(id: string, formData: FormData): Promise<ChallengeFormResult> {
  try {
    const actor = await requireAdminActor();
    const challenge = await db.challenge.findUnique({ where: { id } });
    if (!challenge || challenge.id === GLOBAL_CHALLENGE_ID) throw new Error("Challenge not found");

    const parsed = updateChallengeSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error) };
    const data = parsed.data;

    // Statuses aren't updated automatically as dates pass, so many challenges have a stale status.
    // Only check status against dates when the admin changes one of them, so unrelated edits still save.
    const statusChanged = data.status !== challenge.status;
    const datesChanged =
      data.startDate !== toISODate(challenge.startDate) || data.endDate !== toISODate(challenge.endDate);
    if (statusChanged || datesChanged) {
      const problem = checkStatusAgainstDates(challenge.status, data.status, data.startDate, data.endDate);
      if (problem) return { fieldErrors: { [problem.field]: problem.message } };
    }

    const reopened = isReopening(challenge.status, data.status);
    const statusNote = statusChanged ? `, ${challenge.status} → ${data.status}` : "";

    await db.$transaction([
      db.challenge.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          departmentId: data.departmentId,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          themeColor: data.themeColor,
          status: data.status,
        },
      }),
      db.activityLog.create({
        data: {
          userId: actor?.id,
          action: reopened ? "Challenge Reopened" : "Challenge Updated",
          details: `${data.name} (${challenge.code})${statusNote}, ${data.startDate} to ${data.endDate} by ${actor?.name ?? "Admin"}`,
        },
      }),
    ]);
  } catch (err) {
    console.error(err);
    return { error: err instanceof Error ? err.message : "Something went wrong" };
  }

  revalidatePath(CHALLENGES_PATH);
  revalidatePath(`${CHALLENGES_PATH}/${id}`);
  revalidatePath(`${CHALLENGES_PATH}/${id}/edit`);
  // Participant pages show the challenge name, dates, and color
  revalidatePath("/dashboard");
  revalidatePath("/log-action", "layout");
  redirect(`${CHALLENGES_PATH}/${id}`);
}

/**
 * Permanently deletes a challenge along with its teams, enrollments, team requests,
 * configured actions, and every action logged inside it.
 *
 * @param id Challenge id to delete.
 * @returns An empty object on success, or `{ error }` with a client-safe message.
 *
 * Intent: Hard deletion is SuperAdmin-only; regular admins archive instead via
 * updateChallengeStatus. Points earned in this challenge are removed with it, so
 * participants' lifetime totals drop. Most relations have no cascade in the schema,
 * so dependents are cleared explicitly in one transaction.
 */
export async function deleteChallenge(id: string): Promise<{ error?: string }> {
  try {
    await requireSuperAdmin();
    const actor = await requireAdminActor();

    const challenge = await db.challenge.findUnique({ where: { id } });
    if (!challenge || challenge.id === GLOBAL_CHALLENGE_ID) throw new Error("Challenge not found");

    await db.$transaction([
      db.teamMember.deleteMany({ where: { team: { challengeId: id } } }),
      db.team.deleteMany({ where: { challengeId: id } }),
      db.teamRequest.deleteMany({ where: { challengeId: id } }),
      db.userChallenge.deleteMany({ where: { challengeId: id } }),
      db.action.deleteMany({ where: { challengeId: id } }),
      db.challenge.delete({ where: { id } }),
      db.activityLog.create({
        data: {
          userId: actor?.id,
          action: "Challenge Deleted",
          details: `${challenge.name} (${challenge.code}) permanently deleted by ${actor?.name ?? "SuperAdmin"}`,
        },
      }),
    ]);
  } catch (err) {
    console.error(err);
    return { error: err instanceof Error ? err.message : "Something went wrong" };
  }

  revalidatePath(CHALLENGES_PATH);
  return {};
}

/**
 * Deactivates or reactivates one participant within one challenge.
 *
 * @param challengeId Challenge the participant is enrolled in.
 * @param userId Database id of the participant.
 * @param active True to reactivate, false to deactivate.
 * @returns An empty object on success, or `{ error }` with a client-safe message.
 *
 * Intent: Per-challenge deactivation (Nov 5 2026 decision, clarified): the participant can
 * still sign in and keeps their points, team, and other challenges, but the participant APIs
 * reject new actions and team changes here. Reversible, so any admin may do it.
 */
export async function setChallengeParticipantActive(
  challengeId: string,
  userId: string,
  active: boolean
): Promise<{ error?: string }> {
  try {
    const actor = await requireAdminActor();

    const enrollment = await db.userChallenge.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
      include: { user: { select: { name: true } }, challenge: { select: { name: true } } },
    });
    if (!enrollment || challengeId === GLOBAL_CHALLENGE_ID) throw new Error("Participant not found in this challenge");
    if (!!enrollment.deactivatedAt === !active) return {};

    await db.$transaction([
      db.userChallenge.update({
        where: { id: enrollment.id },
        data: { deactivatedAt: active ? null : new Date() },
      }),
      db.activityLog.create({
        data: {
          userId,
          action: active ? "Challenge Participant Reactivated" : "Challenge Participant Deactivated",
          details: `${enrollment.user.name} in ${enrollment.challenge.name} by ${actor?.name ?? "Admin"}`,
        },
      }),
    ]);
  } catch (err) {
    console.error(err);
    return { error: err instanceof Error ? err.message : "Something went wrong" };
  }

  revalidatePath(`${CHALLENGES_PATH}/${challengeId}`);
  return {};
}
