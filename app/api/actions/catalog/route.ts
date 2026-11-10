/**
 * @file app/api/actions/catalog/route.ts
 * @author GreenStep Development Team
 * @date Fall 2026
 * @purpose Live catalog API endpoint querying active ChallengeAction records
 *          with automatic fallback to the master ActionCatalog.
 */

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";
import { NextResponse } from "next/server";
import { ActionCategory } from "@prisma/client";

export interface ApiCatalogAction {
  readonly id: string;
  readonly catalogId: string;
  readonly challengeActionId?: string;
  readonly title: string;
  readonly actionType: string;
  readonly description: string;
  readonly category: ActionCategory;
  readonly points: number;
}

export interface ChallengeMetadata {
  readonly id: string;
  readonly name: string;
}

export interface CatalogApiResponse {
  readonly challenge?: ChallengeMetadata | null;
  readonly actions: ApiCatalogAction[];
  readonly action?: ApiCatalogAction | null;
  readonly error?: string;
}

/**
 * Handles GET requests to retrieve sustainability actions for a challenge.
 * Scopes queries to ChallengeAction if a valid challengeId is provided;
 * otherwise falls back to ActionCatalog. Also supports single action lookups
 * via the actionType query parameter.
 *
 * @param request - Incoming HTTP request with optional challengeId & actionType.
 * @returns JSON response containing catalog actions and optional challenge meta.
 */
export async function GET(
  request: Request,
): Promise<NextResponse<CatalogApiResponse>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", actions: [] },
        { status: 401 },
      );
    }

    const requestUrl = new URL(request.url);
    const challengeId = requestUrl.searchParams.get("challengeId") ?? undefined;
    const actionType = requestUrl.searchParams.get("actionType") ?? undefined;

    const isSpecificChallenge =
      challengeId &&
      challengeId !== GLOBAL_CHALLENGE_ID &&
      !challengeId.startsWith("CATEGORY_");

    const targetChallengeId = isSpecificChallenge ? challengeId : undefined;

    let challengeMeta: ChallengeMetadata | null = null;
    let actions: ApiCatalogAction[] = [];

    // 1. Retrieve challenge-specific actions if targetChallengeId is valid
    if (targetChallengeId) {
      const challengeRecord = await db.challenge.findUnique({
        where: { id: targetChallengeId },
        select: { id: true, name: true },
      });

      if (challengeRecord) {
        challengeMeta = challengeRecord;
        const challengeActions = await db.challengeAction.findMany({
          where: { challengeId: targetChallengeId },
          include: { actionCatalog: true },
          orderBy: { actionCatalog: { title: "asc" } },
        });

        if (challengeActions.length > 0) {
          actions = challengeActions.map((challengeAction) => ({
            id: challengeAction.actionCatalog.id,
            catalogId: challengeAction.actionCatalog.id,
            challengeActionId: challengeAction.id,
            title: challengeAction.actionCatalog.title,
            actionType: challengeAction.actionCatalog.title,
            description: challengeAction.actionCatalog.description ?? "",
            category: challengeAction.actionCatalog.category,
            points: challengeAction.actionCatalog.points,
          }));
        }
      }
    }

    // 2. Fallback: Query master ActionCatalog when no challenge actions exist
    if (actions.length === 0) {
      const catalogItems = await db.actionCatalog.findMany({
        orderBy: { title: "asc" },
      });

      actions = catalogItems.map((catalogItem) => ({
        id: catalogItem.id,
        catalogId: catalogItem.id,
        title: catalogItem.title,
        actionType: catalogItem.title,
        description: catalogItem.description ?? "",
        category: catalogItem.category,
        points: catalogItem.points,
      }));
    }

    // 3. Resolve single action lookup if actionType is provided
    if (actionType) {
      const normalizedSearchQuery = decodeURIComponent(actionType)
        .trim()
        .toLowerCase();

      let matchedAction = actions.find((item) => {
        const itemType = item.actionType.trim().toLowerCase();
        const itemTitle = item.title.trim().toLowerCase();
        return (
          itemType === normalizedSearchQuery ||
          itemTitle === normalizedSearchQuery
        );
      });

      // If not linked to challenge, check ActionCatalog directly by title
      if (!matchedAction) {
        const directCatalogItem = await db.actionCatalog.findFirst({
          where: {
            title: { equals: normalizedSearchQuery, mode: "insensitive" },
          },
        });

        if (directCatalogItem) {
          matchedAction = {
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
        action: matchedAction ?? null,
      });
    }

    return NextResponse.json({
      challenge: challengeMeta,
      actions,
    });
  } catch (caughtError) {
    console.error("Failed to load actions catalog:", caughtError);
    return NextResponse.json(
      { error: "Failed to load actions catalog", actions: [] },
      { status: 500 },
    );
  }
}
