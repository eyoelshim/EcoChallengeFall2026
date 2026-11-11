import type { ChallengeStatus } from "@prisma/client";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";

// Challenge lifecycle rules for participants (issue #54, stakeholder decision Nov 5 2026):
// - Participants can log actions for 14 days after a challenge's end date.
// - Archived challenges accept no new actions.
// - Completed/archived challenges are hidden from the participant's challenge switcher.

export const GRACE_PERIOD_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

type LifecycleChallenge = {
  id: string;
  status: ChallengeStatus;
  endDate: Date | null;
};

// endDate is stored as UTC midnight at the *start* of the last day, so the challenge runs until the next midnight
export function challengeEndsAt(endDate: Date): Date {
  return new Date(endDate.getTime() + DAY_MS);
}

// Logging stays open for the whole last day plus 14 more full days
export function loggingClosesAt(endDate: Date): Date {
  return new Date(challengeEndsAt(endDate).getTime() + GRACE_PERIOD_DAYS * DAY_MS);
}

// Returns why logging is blocked for this challenge, or null if participants can log to it.
// The global challenge has no dates and is always open.
export function loggingBlockedReason(challenge: LifecycleChallenge, now = new Date()): string | null {
  if (challenge.id === GLOBAL_CHALLENGE_ID) return null;
  if (challenge.status === "ARCHIVED") return "This challenge has been archived.";
  if (challenge.endDate && now >= loggingClosesAt(challenge.endDate)) {
    return "The 2-week grace period for logging actions to this challenge has ended.";
  }
  return null;
}

// Whether a challenge appears in the participant's challenge switcher: only Active/Upcoming ones
// that still accept actions. Statuses aren't updated automatically as dates pass, so the date check
// keeps finished challenges that are still marked Active from lingering in the switcher.
export function isVisibleToParticipant(challenge: LifecycleChallenge, now = new Date()): boolean {
  if (challenge.id === GLOBAL_CHALLENGE_ID) return true;
  if (challenge.status !== "ACTIVE" && challenge.status !== "UPCOMING") return false;
  return loggingBlockedReason(challenge, now) === null;
}
