"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

const TEMPLATES_PATH = "/admin/admin/templates";
const NEW_CHALLENGE_PATH = "/admin/admin/challenges/new";

export interface TemplateActionItem {
  catalogId?: string;
  title: string;
  description: string;
  category: string;
  points: number;
}

export interface AdminTemplateItem {
  id: string;
  name: string;
  code?: string;
  description: string;
  category: string;
  categories: string[];
  duration: string;
  days: number;
  themeColor: string;
  actions: TemplateActionItem[];
  createdAt: Date;
}

export async function getAdminTemplates(): Promise<AdminTemplateItem[]> {
  await requireAdmin();

  const templates = await db.challengeTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return templates.map((t) => {
    const rawActions = (t.actions as unknown as TemplateActionItem[]) || [];
    const primaryCategory = t.categories[0] || "General Sustainability";
    return {
      id: t.id,
      name: t.name,
      description: t.description ?? "",
      category: primaryCategory,
      categories: t.categories,
      duration: "1 week",
      days: 7,
      themeColor: t.themeColor ?? "#10B981",
      actions: rawActions.map((act) => ({
        catalogId: act.catalogId,
        title: act.title,
        description: act.description ?? "",
        category: act.category,
        points: act.points,
      })),
      createdAt: t.createdAt,
    };
  });
}

export async function getAdminTemplateById(id: string): Promise<AdminTemplateItem | null> {
  await requireAdmin();

  const t = await db.challengeTemplate.findUnique({
    where: { id },
  });
  if (!t) return null;

  const rawActions = (t.actions as unknown as TemplateActionItem[]) || [];
  const primaryCategory = t.categories[0] || "General Sustainability";

  return {
    id: t.id,
    name: t.name,
    description: t.description ?? "",
    category: primaryCategory,
    categories: t.categories,
    duration: "1 week",
    days: 7,
    themeColor: t.themeColor ?? "#10B981",
    actions: rawActions.map((act) => ({
      catalogId: act.catalogId,
      title: act.title,
      description: act.description ?? "",
      category: act.category,
      points: act.points,
    })),
    createdAt: t.createdAt,
  };
}

export async function createAdminTemplate(data: {
  name: string;
  description?: string;
  category?: string;
  categories?: string[];
  themeColor?: string;
  actions?: TemplateActionItem[];
}): Promise<{ success: boolean; template?: AdminTemplateItem; error?: string }> {
  await requireAdmin();

  try {
    const categories = data.categories?.length
      ? data.categories
      : data.category
      ? [data.category]
      : ["General Sustainability"];

    const actionsJson = (data.actions || []).map((a) => ({
      catalogId: a.catalogId,
      title: a.title,
      description: a.description || "",
      category: a.category,
      points: a.points,
    })) as unknown as Prisma.InputJsonValue;

    const created = await db.challengeTemplate.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        categories,
        themeColor: data.themeColor || "#10B981",
        actions: actionsJson,
      },
    });

    revalidatePath(TEMPLATES_PATH);
    revalidatePath(NEW_CHALLENGE_PATH);

    return {
      success: true,
      template: {
        id: created.id,
        name: created.name,
        description: created.description ?? "",
        category: categories[0] || "General Sustainability",
        categories: created.categories,
        duration: "1 week",
        days: 7,
        themeColor: created.themeColor ?? "#10B981",
        actions: (data.actions || []).map((act) => ({
          catalogId: act.catalogId,
          title: act.title,
          description: act.description ?? "",
          category: act.category,
          points: act.points,
        })),
        createdAt: created.createdAt,
      },
    };
  } catch (err) {
    console.error("Failed to create template:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to create template" };
  }
}

export async function updateAdminTemplate(
  id: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    categories?: string[];
    themeColor?: string;
    actions?: TemplateActionItem[];
  }
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const updateData: Prisma.ChallengeTemplateUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description.trim() || null;
    if (data.themeColor !== undefined) updateData.themeColor = data.themeColor;

    if (data.categories !== undefined) {
      updateData.categories = data.categories;
    } else if (data.category !== undefined) {
      updateData.categories = [data.category];
    }

    if (data.actions !== undefined) {
      updateData.actions = (data.actions || []).map((a) => ({
        catalogId: a.catalogId,
        title: a.title,
        description: a.description || "",
        category: a.category,
        points: a.points,
      })) as unknown as Prisma.InputJsonValue;
    }

    await db.challengeTemplate.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(TEMPLATES_PATH);
    revalidatePath(`${TEMPLATES_PATH}/${id}/edit`);
    revalidatePath(NEW_CHALLENGE_PATH);
    return { success: true };
  } catch (err) {
    console.error("Failed to update template:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to update template" };
  }
}

export async function deleteAdminTemplate(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    await db.challengeTemplate.delete({
      where: { id },
    });

    revalidatePath(TEMPLATES_PATH);
    revalidatePath(NEW_CHALLENGE_PATH);
    return { success: true };
  } catch (err) {
    console.error("Failed to delete template:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete template" };
  }
}
