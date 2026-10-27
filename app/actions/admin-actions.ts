"use server";

import { revalidatePath } from "next/cache";
import { ActionCategory, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { normalizeActionCategory } from "@/lib/categories";

const CHALLENGES_PATH = "/admin/admin/challenges";
const ACTIONS_PATH = "/admin/admin/actions";

export interface GlobalActionItem {
  id: string;
  title: string;
  description: string;
  category: ActionCategory;
  points: number;
  challengeCount?: number;
  createdAt: Date;
}

export interface ChallengeActionItem {
  id: string;
  actionCatalogId: string;
  challengeId: string;
  title: string;
  description: string;
  category: ActionCategory;
  points: number;
}

// ---------------------------------------------------------------------------
// Global Action Catalog Server Actions
// ---------------------------------------------------------------------------

export async function getGlobalActions(filters?: { search?: string; category?: string }): Promise<GlobalActionItem[]> {
  await requireAdmin();

  const where: Prisma.ActionCatalogWhereInput = {};
  if (filters?.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (filters?.category && filters.category !== "All") {
    where.category = normalizeActionCategory(filters.category);
  }

  const items = await db.actionCatalog.findMany({
    where,
    include: {
      _count: {
        select: { challengeActions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    category: item.category,
    points: item.points,
    challengeCount: item._count.challengeActions,
    createdAt: item.createdAt,
  }));
}

export async function createGlobalAction(data: {
  title: string;
  description?: string;
  category: string;
  points: number;
}): Promise<GlobalActionItem> {
  await requireAdmin();

  const created = await db.actionCatalog.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      category: normalizeActionCategory(data.category),
      points: Math.max(1, Number(data.points) || 10),
    },
  });

  revalidatePath(ACTIONS_PATH);
  return {
    id: created.id,
    title: created.title,
    description: created.description ?? "",
    category: created.category,
    points: created.points,
    challengeCount: 0,
    createdAt: created.createdAt,
  };
}

export async function updateGlobalAction(
  id: string,
  data: {
    title?: string;
    description?: string;
    category?: string;
    points?: number;
  }
): Promise<GlobalActionItem> {
  await requireAdmin();

  const updateData: Prisma.ActionCatalogUpdateInput = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.description !== undefined) updateData.description = data.description.trim() || null;
  if (data.category !== undefined) updateData.category = normalizeActionCategory(data.category);
  if (data.points !== undefined) updateData.points = Math.max(1, Number(data.points) || 10);

  const updated = await db.actionCatalog.update({
    where: { id },
    data: updateData,
  });

  revalidatePath(ACTIONS_PATH);
  revalidatePath(CHALLENGES_PATH);
  return {
    id: updated.id,
    title: updated.title,
    description: updated.description ?? "",
    category: updated.category,
    points: updated.points,
    createdAt: updated.createdAt,
  };
}

export async function deleteGlobalAction(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    await db.actionCatalog.delete({
      where: { id },
    });
    revalidatePath(ACTIONS_PATH);
    revalidatePath(CHALLENGES_PATH);
    return { success: true };
  } catch (err) {
    console.error("Failed to delete global action:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete action" };
  }
}

// ---------------------------------------------------------------------------
// In-Challenge Actions Server Actions
// ---------------------------------------------------------------------------

export async function getChallengeDetailForActions(challengeId: string) {
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

export async function getChallengeActions(challengeId: string): Promise<ChallengeActionItem[]> {
  await requireAdmin();

  const links = await db.challengeAction.findMany({
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

  return links.map((link) => ({
    id: link.id,
    actionCatalogId: link.actionCatalog.id,
    challengeId: link.challengeId,
    title: link.actionCatalog.title,
    description: link.actionCatalog.description ?? "",
    category: link.actionCatalog.category,
    points: link.actionCatalog.points,
  }));
}

export async function addActionToChallenge(
  challengeId: string,
  actionData: {
    catalogId?: string;
    title: string;
    description?: string;
    category: string;
    points: number;
  }
): Promise<{ success: boolean; action?: ChallengeActionItem; error?: string }> {
  await requireAdmin();

  try {
    const category = normalizeActionCategory(actionData.category);
    const points = Math.max(1, Number(actionData.points) || 10);
    const title = actionData.title.trim();
    const description = actionData.description?.trim() || null;

    let catalogId = actionData.catalogId;

    if (!catalogId) {
      // Find matching existing action in catalog or create new one
      const existing = await db.actionCatalog.findFirst({
        where: {
          title: { equals: title, mode: "insensitive" },
          category,
        },
      });

      if (existing) {
        catalogId = existing.id;
      } else {
        const createdCatalog = await db.actionCatalog.create({
          data: {
            title,
            description,
            category,
            points,
          },
        });
        catalogId = createdCatalog.id;
      }
    }

    const challengeAction = await db.challengeAction.upsert({
      where: {
        challengeId_actionCatalogId: {
          challengeId,
          actionCatalogId: catalogId,
        },
      },
      update: {},
      create: {
        challengeId,
        actionCatalogId: catalogId,
      },
      include: {
        actionCatalog: true,
      },
    });

    revalidatePath(`${CHALLENGES_PATH}/${challengeId}`);
    revalidatePath(`${CHALLENGES_PATH}/${challengeId}/actions`);

    return {
      success: true,
      action: {
        id: challengeAction.id,
        actionCatalogId: challengeAction.actionCatalog.id,
        challengeId: challengeAction.challengeId,
        title: challengeAction.actionCatalog.title,
        description: challengeAction.actionCatalog.description ?? "",
        category: challengeAction.actionCatalog.category,
        points: challengeAction.actionCatalog.points,
      },
    };
  } catch (err) {
    console.error("Failed to add action to challenge:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to add action" };
  }
}

export async function updateChallengeAction(
  actionCatalogId: string,
  challengeId: string,
  actionData: {
    title: string;
    description?: string;
    category: string;
    points: number;
  }
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    await db.actionCatalog.update({
      where: { id: actionCatalogId },
      data: {
        title: actionData.title.trim(),
        description: actionData.description?.trim() || null,
        category: normalizeActionCategory(actionData.category),
        points: Math.max(1, Number(actionData.points) || 10),
      },
    });

    revalidatePath(`${CHALLENGES_PATH}/${challengeId}`);
    revalidatePath(`${CHALLENGES_PATH}/${challengeId}/actions`);
    return { success: true };
  } catch (err) {
    console.error("Failed to update challenge action:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to update action" };
  }
}

export async function removeActionFromChallenge(
  challengeId: string,
  actionCatalogId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
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
  } catch (err) {
    console.error("Failed to remove action from challenge:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to remove action" };
  }
}
