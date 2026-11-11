import { db } from "@/lib/db";

export const DEACTIVATED_IN_CHALLENGE_MESSAGE =
  "You've been deactivated from this challenge. Contact an admin if you think this is a mistake.";

/**
 * Whether a participant has been deactivated in a specific challenge.
 *
 * @param userId Database id of the participant.
 * @param challengeId Challenge to check.
 * @returns True only when they are enrolled and an admin deactivated them there.
 *
 * Intent: Deactivation is per challenge, not per account. Deactivated participants keep
 * signing in, keep their points and team, and stay active in every other challenge; the
 * participant APIs call this to block new actions and team changes in this one.
 */
export async function isDeactivatedInChallenge(userId: string, challengeId: string): Promise<boolean> {
  const enrollment = await db.userChallenge.findUnique({
    where: { userId_challengeId: { userId, challengeId } },
    select: { deactivatedAt: true },
  });
  return !!enrollment?.deactivatedAt;
}
