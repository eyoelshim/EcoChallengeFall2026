/**
 * @file admin-actions.ts
 * @author Uyen Thy Duong
 * @date Fall 2026
 * @purpose Server actions managing the Global Action Catalog and isolated
 *   in-challenge actions with one-way override workflows.
 */

"use server";

import { revalidatePath } from "next/cache";
import { ActionCategory, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin, requireSuperAdmin } from "@/lib/authz";
import { normalizeActionCategory } from "@/lib/categories";

const CHALLENGES_PATH = "/admin/challenges";
const ACTIONS_PATH = "/admin/actions";

export interface GlobalActionItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: ActionCategory;
  readonly points: number;
  readonly isGlobal: boolean;
  readonly challengeCount?: number;
  readonly createdAt: Date;
}

export interface ChallengeActionItem {
  readonly id: string;
  readonly actionCatalogId: string;
  readonly challengeId: string;
  readonly title: string;
  readonly description: string;
  readonly category: ActionCategory;
  readonly points: number;
  readonly pointsOverride?: number | null;
  readonly titleOverride?: string | null;
  readonly basePoints: number;
  readonly baseTitle: string;
  readonly isGlobal: boolean;
}

export interface ChallengeDetailSummary {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly category: string | null;
  readonly themeColor: string | null;
  readonly status: string;
}

export interface AddChallengeActionInput {
  readonly catalogId?: string;
  readonly title: string;
  readonly description?: string;
  readonly category: string;
  readonly points: number;
  readonly addToGlobalCatalog?: boolean;
}

export interface UpdateChallengeActionInput {
  readonly title: string;
  readonly description?: string;
  readonly category: string;
  readonly points: number;
  readonly contributeToGlobal?: boolean;
}

export interface ActionOperationResult {
  readonly success: boolean;
  readonly action?: ChallengeActionItem;
  readonly error?: string;
}

// ---------------------------------------------------------------------------
// Global Action Catalog Server Actions
// ---------------------------------------------------------------------------

/**
 * Retrieves all global action catalog entries available for challenge attachment.
 *
 * @param filters - Optional search query and category filters
 * @returns Promise resolving to an array of global action items
 */
export async function getGlobalActions(filters?: {
  readonly search?: string;
  readonly category?: string;
}): Promise<GlobalActionItem[]> {
  await requireAdmin();

  const whereCondition: Prisma.ActionCatalogWhereInput = {
    isGlobal: true,
  };

  if (filters?.search?.trim()) {
    const searchQuery = filters.search.trim();
    whereCondition.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  if (filters?.category && filters.category !== "All") {
    whereCondition.category = normalizeActionCategory(filters.category);
  }

  const catalogRecords = await db.actionCatalog.findMany({
    where: whereCondition,
    include: {
      _count: {
        select: { challengeActions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return catalogRecords.map((catalogRecord) => ({
    id: catalogRecord.id,
    title: catalogRecord.title,
    description: catalogRecord.description ?? "",
    category: catalogRecord.category,
    points: catalogRecord.points,
    isGlobal: catalogRecord.isGlobal,
    challengeCount: catalogRecord._count.challengeActions,
    createdAt: catalogRecord.createdAt,
  }));
}

/**
 * Creates a new action directly in the Global Action Catalog.
 *
 * @param actionData - Title, description, category, and base points
 * @returns Promise resolving to the created global action item
 */
export async function createGlobalAction(actionData: {
  readonly title: string;
  readonly description?: string;
  readonly category: string;
  readonly points: number;
}): Promise<GlobalActionItem> {
  await requireAdmin();

  const createdAction = await db.actionCatalog.create({
    data: {
      title: actionData.title.trim(),
      description: actionData.description?.trim() || null,
      category: normalizeActionCategory(actionData.category),
      points: Math.max(1, Number(actionData.points) || 10),
      isGlobal: true,
    },
  });

  revalidatePath(ACTIONS_PATH);

  return {
    id: createdAction.id,
    title: createdAction.title,
    description: createdAction.description ?? "",
    category: createdAction.category,
    points: createdAction.points,
    isGlobal: createdAction.isGlobal,
    challengeCount: 0,
    createdAt: createdAction.createdAt,
  };
}

/**
 * Updates a global action definition in the master catalog.
 *
 * @param actionId - Target action catalog identifier
 * @param updateData - Fields to update
 * @returns Promise resolving to the updated global action item
 */
export async function updateGlobalAction(
  actionId: string,
  updateData: {
    readonly title?: string;
    readonly description?: string;
    readonly category?: string;
    readonly points?: number;
  },
): Promise<GlobalActionItem> {
  await requireAdmin();

  const prismaUpdateData: Prisma.ActionCatalogUpdateInput = {};
  if (updateData.title !== undefined) {
    prismaUpdateData.title = updateData.title.trim();
  }
  if (updateData.description !== undefined) {
    prismaUpdateData.description = updateData.description.trim() || null;
  }
  if (updateData.category !== undefined) {
    prismaUpdateData.category = normalizeActionCategory(updateData.category);
  }
  if (updateData.points !== undefined) {
    prismaUpdateData.points = Math.max(1, Number(updateData.points) || 10);
  }

  const updatedAction = await db.actionCatalog.update({
    where: { id: actionId },
    data: prismaUpdateData,
  });

  revalidatePath(ACTIONS_PATH);
  revalidatePath(CHALLENGES_PATH);

  return {
    id: updatedAction.id,
    title: updatedAction.title,
    description: updatedAction.description ?? "",
    category: updatedAction.category,
    points: updatedAction.points,
    isGlobal: updatedAction.isGlobal,
    createdAt: updatedAction.createdAt,
  };
}

/**
 * Deletes an action from the Global Action Catalog. Permanent deletion is SuperAdmin-only.
 *
 * @param actionId - Action catalog record identifier
 * @returns Promise resolving to an operation status
 */
export async function deleteGlobalAction(
  actionId: string,
): Promise<ActionOperationResult> {
  try {
    await requireSuperAdmin();
    await db.actionCatalog.delete({
      where: { id: actionId },
    });
    revalidatePath(ACTIONS_PATH);
    revalidatePath(CHALLENGES_PATH);
    return { success: true };
  } catch (caughtError) {
    return {
      success: false,
      error:
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete global action.",
    };
  }
}

// ---------------------------------------------------------------------------
// In-Challenge Actions Server Actions (One-Way Override Flow)
// ---------------------------------------------------------------------------

/**
 * Retrieves summary metadata for a challenge to display on the action management page.
 *
 * @param challengeId - Identifier of the challenge
 * @returns Promise resolving to challenge metadata or null
 */
export async function getChallengeDetailForActions(
  challengeId: string,
): Promise<ChallengeDetailSummary | null> {
  await requireAdmin();

  return db.challenge.findUnique({
    where: { id: challengeId },
    select: {
      id: true,
      name: true,
      code: true,
      category: true,
      themeColor: true,
      status: true,
    },
  });
}

/**
 * Retrieves all actions linked to a specific challenge, applying isolated local overrides.
 *
 * @param challengeId - Target challenge identifier
 * @returns Promise resolving to list of challenge action items with resolved points and titles
 */
export async function getChallengeActions(
  challengeId: string,
): Promise<ChallengeActionItem[]> {
  await requireAdmin();

  const challengeActionLinks = await db.challengeAction.findMany({
    where: { challengeId },
    include: {
      actionCatalog: true,
    },
    orderBy: {
      actionCatalog: {
        points: "desc",
      },
    },
  });

  return challengeActionLinks.map((linkRecord) => {
    const effectivePoints =
      linkRecord.pointsOverride ?? linkRecord.actionCatalog.points;
    const effectiveTitle =
      linkRecord.titleOverride || linkRecord.actionCatalog.title;

    return {
      id: linkRecord.id,
      actionCatalogId: linkRecord.actionCatalog.id,
      challengeId: linkRecord.challengeId,
      title: effectiveTitle,
      description: linkRecord.actionCatalog.description ?? "",
      category: linkRecord.actionCatalog.category,
      points: effectivePoints,
      pointsOverride: linkRecord.pointsOverride,
      titleOverride: linkRecord.titleOverride,
      basePoints: linkRecord.actionCatalog.points,
      baseTitle: linkRecord.actionCatalog.title,
      isGlobal: linkRecord.actionCatalog.isGlobal,
    };
  });
}

/**
 * Attaches an action to a challenge. Supports 1-click import from catalog,
 * custom isolated actions (isGlobal: false), and optional contribution to catalog.
 *
 * @param challengeId - Target challenge identifier
 * @param actionInput - Action parameters and catalog contribution flag
 * @returns Promise resolving to operation result containing the linked challenge action
 */
export async function addActionToChallenge(
  challengeId: string,
  actionInput: AddChallengeActionInput,
): Promise<ActionOperationResult> {
  await requireAdmin();

  try {
    const normalizedCategory = normalizeActionCategory(actionInput.category);
    const requestedPoints = Math.max(1, Number(actionInput.points) || 10);
    const sanitizedTitle = actionInput.title.trim();
    const sanitizedDescription = actionInput.description?.trim() || null;
    const shouldContributeToGlobal = Boolean(actionInput.addToGlobalCatalog);

    let resolvedCatalogId = actionInput.catalogId;
    let computedPointsOverride: number | null = null;

    if (resolvedCatalogId) {
      // 1-Click Import from Global Catalog
      const existingCatalogItem = await db.actionCatalog.findUnique({
        where: { id: resolvedCatalogId },
      });

      if (!existingCatalogItem) {
        return {
          success: false,
          error: "Selected catalog action does not exist.",
        };
      }

      // If imported points differ from base catalog points, store override
      if (requestedPoints !== existingCatalogItem.points) {
        computedPointsOverride = requestedPoints;
      }
    } else {
      // Custom challenge action creation
      if (shouldContributeToGlobal) {
        // Admin opted to contribute to the Global Catalog
        const existingGlobalMatch = await db.actionCatalog.findFirst({
          where: {
            title: { equals: sanitizedTitle, mode: "insensitive" },
            category: normalizedCategory,
            isGlobal: true,
          },
        });

        if (existingGlobalMatch) {
          resolvedCatalogId = existingGlobalMatch.id;
          if (requestedPoints !== existingGlobalMatch.points) {
            computedPointsOverride = requestedPoints;
          }
        } else {
          const createdCatalogRecord = await db.actionCatalog.create({
            data: {
              title: sanitizedTitle,
              description: sanitizedDescription,
              category: normalizedCategory,
              points: requestedPoints,
              isGlobal: true,
            },
          });
          resolvedCatalogId = createdCatalogRecord.id;
        }
      } else {
        // Private / Challenge-isolated action (not exposed globally)
        const createdPrivateAction = await db.actionCatalog.create({
          data: {
            title: sanitizedTitle,
            description: sanitizedDescription,
            category: normalizedCategory,
            points: requestedPoints,
            isGlobal: false,
          },
        });
        resolvedCatalogId = createdPrivateAction.id;
      }
    }

    const linkedChallengeAction = await db.challengeAction.upsert({
      where: {
        challengeId_actionCatalogId: {
          challengeId,
          actionCatalogId: resolvedCatalogId,
        },
      },
      update: {
        pointsOverride: computedPointsOverride,
      },
      create: {
        challengeId,
        actionCatalogId: resolvedCatalogId,
        pointsOverride: computedPointsOverride,
      },
      include: {
        actionCatalog: true,
      },
    });

    revalidatePath(`${CHALLENGES_PATH}/${challengeId}`);
    revalidatePath(`${CHALLENGES_PATH}/${challengeId}/actions`);

    const effectivePoints =
      linkedChallengeAction.pointsOverride ??
      linkedChallengeAction.actionCatalog.points;
    const effectiveTitle =
      linkedChallengeAction.titleOverride ||
      linkedChallengeAction.actionCatalog.title;

    return {
      success: true,
      action: {
        id: linkedChallengeAction.id,
        actionCatalogId: linkedChallengeAction.actionCatalog.id,
        challengeId: linkedChallengeAction.challengeId,
        title: effectiveTitle,
        description: linkedChallengeAction.actionCatalog.description ?? "",
        category: linkedChallengeAction.actionCatalog.category,
        points: effectivePoints,
        pointsOverride: linkedChallengeAction.pointsOverride,
        titleOverride: linkedChallengeAction.titleOverride,
        basePoints: linkedChallengeAction.actionCatalog.points,
        baseTitle: linkedChallengeAction.actionCatalog.title,
        isGlobal: linkedChallengeAction.actionCatalog.isGlobal,
      },
    };
  } catch (caughtError) {
    return {
      success: false,
      error:
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to add action to challenge.",
    };
  }
}

/**
 * Updates an action within a challenge using strict One-Way Flow:
 * Modifying points or titles updates ChallengeAction.pointsOverride and
 * ChallengeAction.titleOverride without altering the ActionCatalog or affecting
 * other challenges.
 *
 * @param actionCatalogId - Linked action catalog identifier
 * @param challengeId - Scoped challenge identifier
 * @param updateData - New title, description, category, and points
 * @returns Promise resolving to operation status
 */
export async function updateChallengeAction(
  actionCatalogId: string,
  challengeId: string,
  updateData: UpdateChallengeActionInput,
): Promise<ActionOperationResult> {
  await requireAdmin();

  try {
    const sanitizedTitle = updateData.title.trim();
    const sanitizedPoints = Math.max(1, Number(updateData.points) || 10);
    const sanitizedDescription = updateData.description?.trim() || null;
    const normalizedCategory = normalizeActionCategory(updateData.category);

    // Fetch existing challenge action link
    const existingLink = await db.challengeAction.findUnique({
      where: {
        challengeId_actionCatalogId: {
          challengeId,
          actionCatalogId,
        },
      },
      include: {
        actionCatalog: true,
      },
    });

    if (!existingLink) {
      return {
        success: false,
        error: "Action is not associated with this challenge.",
      };
    }

    const isCatalogItemGlobal = existingLink.actionCatalog.isGlobal;

    // Handle catalog contribution if requested for a private action
    if (!isCatalogItemGlobal && updateData.contributeToGlobal) {
      await db.actionCatalog.update({
        where: { id: actionCatalogId },
        data: {
          isGlobal: true,
          title: sanitizedTitle,
          description: sanitizedDescription,
          category: normalizedCategory,
          points: sanitizedPoints,
        },
      });
    } else if (!isCatalogItemGlobal) {
      // Private challenge-only action: update catalog description/category metadata
      await db.actionCatalog.update({
        where: { id: actionCatalogId },
        data: {
          title: sanitizedTitle,
          description: sanitizedDescription,
          category: normalizedCategory,
        },
      });
    }

    // STRICT ONE-WAY FLOW: Store overrides on ChallengeAction link
    // Never mutate points on a global ActionCatalog record!
    await db.challengeAction.update({
      where: {
        challengeId_actionCatalogId: {
          challengeId,
          actionCatalogId,
        },
      },
      data: {
        pointsOverride: sanitizedPoints,
        titleOverride:
          sanitizedTitle !== existingLink.actionCatalog.title
            ? sanitizedTitle
            : null,
      },
    });

    revalidatePath(`${CHALLENGES_PATH}/${challengeId}`);
    revalidatePath(`${CHALLENGES_PATH}/${challengeId}/actions`);

    return { success: true };
  } catch (caughtError) {
    return {
      success: false,
      error:
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update challenge action.",
    };
  }
}

/**
 * Promotes a challenge-specific action into the Global Action Catalog,
 * allowing other challenges to discover and attach it.
 *
 * @param actionCatalogId - Target action catalog identifier
 * @param challengeId - Optional challenge ID to sync current overrides
 * @returns Promise resolving to operation status
 */
export async function contributeActionToGlobalCatalog(
  actionCatalogId: string,
  challengeId?: string,
): Promise<ActionOperationResult> {
  await requireAdmin();

  try {
    let titleToPublish: string | undefined;
    let pointsToPublish: number | undefined;

    if (challengeId) {
      const challengeAction = await db.challengeAction.findUnique({
        where: {
          challengeId_actionCatalogId: {
            challengeId,
            actionCatalogId,
          },
        },
      });

      if (challengeAction?.titleOverride) {
        titleToPublish = challengeAction.titleOverride;
      }
      if (challengeAction?.pointsOverride) {
        pointsToPublish = challengeAction.pointsOverride;
      }
    }

    await db.actionCatalog.update({
      where: { id: actionCatalogId },
      data: {
        isGlobal: true,
        ...(titleToPublish ? { title: titleToPublish } : {}),
        ...(pointsToPublish ? { points: pointsToPublish } : {}),
      },
    });

    revalidatePath(ACTIONS_PATH);
    if (challengeId) {
      revalidatePath(`${CHALLENGES_PATH}/${challengeId}`);
      revalidatePath(`${CHALLENGES_PATH}/${challengeId}/actions`);
    }

    return { success: true };
  } catch (caughtError) {
    return {
      success: false,
      error:
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to contribute action to global catalog.",
    };
  }
}

/**
 * Removes the association between an action and a challenge without deleting
 * the action from the Global Action Catalog. Permanent removal is SuperAdmin-only.
 *
 * @param challengeId - Target challenge identifier
 * @param actionCatalogId - Linked action catalog identifier
 * @returns Promise resolving to operation status
 */
export async function removeActionFromChallenge(
  challengeId: string,
  actionCatalogId: string,
): Promise<ActionOperationResult> {
  try {
    await requireSuperAdmin();
    await db.challengeAction.delete({
      where: {
        challengeId_actionCatalogId: {
          challengeId,
          actionCatalogId,
        },
      },
    });

    revalidatePath(`${CHALLENGES_PATH}/${challengeId}`);
    revalidatePath(`${CHALLENGES_PATH}/${challengeId}/actions`);
    return { success: true };
  } catch (caughtError) {
    return {
      success: false,
      error:
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to remove action from challenge.",
    };
  }
}
