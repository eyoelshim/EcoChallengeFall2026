import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";
import { NextResponse } from "next/server";
import { ActionCategory } from "@prisma/client";

export type ApiCatalogAction = {
  id: string;
  catalogId: string;
  challengeActionId?: string;
  title: string;
  actionType: string;
  description: string;
  category: ActionCategory;
  points: number;
};

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId") ?? undefined;
    const actionType = searchParams.get("actionType") ?? undefined;

    const normalizedChallengeId =
      challengeId &&
      challengeId !== GLOBAL_CHALLENGE_ID &&
      !challengeId.startsWith("CATEGORY_")
        ? challengeId
        : undefined;

    let challengeMeta: { id: string; name: string } | null = null;
    let actions: ApiCatalogAction[] = [];

    // 1. Try challenge-specific actions if challengeId is provided and valid
    if (normalizedChallengeId) {
      const challenge = await db.challenge.findUnique({
        where: { id: normalizedChallengeId },
        select: { id: true, name: true },
      });

      if (challenge) {
        challengeMeta = challenge;
        const challengeActions = await db.challengeAction.findMany({
          where: { challengeId: normalizedChallengeId },
          include: { actionCatalog: true },
          orderBy: { actionCatalog: { title: "asc" } },
        });

        if (challengeActions.length > 0) {
          actions = challengeActions.map((ca) => ({
            id: ca.actionCatalog.id,
            catalogId: ca.actionCatalog.id,
            challengeActionId: ca.id,
            title: ca.actionCatalog.title,
            actionType: ca.actionCatalog.title,
            description: ca.actionCatalog.description ?? "",
            category: ca.actionCatalog.category,
            points: ca.actionCatalog.points,
          }));
        }
      }
    }

    // 2. Fallback: If no challenge actions exist or global challenge view, fetch from master ActionCatalog
    if (actions.length === 0) {
      const catalogItems = await db.actionCatalog.findMany({
        orderBy: { title: "asc" },
      });

      actions = catalogItems.map((ac) => ({
        id: ac.id,
        catalogId: ac.id,
        title: ac.title,
        actionType: ac.title,
        description: ac.description ?? "",
        category: ac.category,
        points: ac.points,
      }));
    }

    // 3. If a specific actionType was requested (e.g. for action detail page)
    if (actionType) {
      const decoded = decodeURIComponent(actionType).trim().toLowerCase();
      let matched = actions.find(
        (a) =>
          a.actionType.trim().toLowerCase() === decoded ||
          a.title.trim().toLowerCase() === decoded
      );

      // If still not matched, check ActionCatalog directly by title
      if (!matched) {
        const directCatalogItem = await db.actionCatalog.findFirst({
          where: {
            title: { equals: decoded, mode: "insensitive" },
          },
        });

        if (directCatalogItem) {
          matched = {
            id: directCatalogItem.id,
            catalogId: directCatalogItem.id,
            title: directCatalogItem.title,
            actionType: directCatalogItem.title,
            description: directCatalogItem.description ?? "",
            category: directCatalogItem.category,
            points: directCatalogItem.points,
          };
        }
      }

      return NextResponse.json({
        challenge: challengeMeta,
        actions,
        action: matched ?? null,
      });
    }

    return NextResponse.json({
      challenge: challengeMeta,
      actions,
    });
  } catch (error) {
    console.error("Failed to load actions catalog:", error);
    return NextResponse.json(
      { error: "Failed to load actions catalog" },
      { status: 500 }
    );
  }
}
