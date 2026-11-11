import type { ChallengeStatus } from "@prisma/client";

// Challenge lifecycle rules shared by the admin console (server actions and forms).
// Kept free of server-only imports so client components can use it too.

// Challenge dates are stored as UTC midnight, so compare them as UTC YYYY-MM-DD strings
export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toISODate(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function statusForDates(startDate: string, endDate: string): ChallengeStatus {
  const today = todayISODate();
  if (endDate < today) return "COMPLETED";
  if (startDate <= today) return "ACTIVE";
  return "UPCOMING";
}

const CLOSED_STATUSES: ChallengeStatus[] = ["COMPLETED", "ARCHIVED"];
const OPEN_STATUSES: ChallengeStatus[] = ["ACTIVE", "UPCOMING"];

export function isClosedStatus(status: ChallengeStatus): boolean {
  return CLOSED_STATUSES.includes(status);
}

// Moving a finished challenge back to Active/Upcoming, e.g. to rerun Earth Month next year
export function isReopening(from: ChallengeStatus, to: ChallengeStatus): boolean {
  return CLOSED_STATUSES.includes(from) && OPEN_STATUSES.includes(to);
}

type StatusDateCheck = {
  field: "status" | "startDate" | "endDate";
  message: string;
};

// Checks that a chosen status makes sense for the chosen dates. Returns null when it does.
// Completed/Archived are allowed with any dates so admins can close a challenge early.
export function checkStatusAgainstDates(
  from: ChallengeStatus,
  to: ChallengeStatus,
  startDate: string,
  endDate: string
): StatusDateCheck | null {
  const today = todayISODate();

  if (isReopening(from, to) && endDate < today) {
    return { field: "endDate", message: "Set an end date of today or later to reopen this challenge." };
  }
  if (to === "ACTIVE" && startDate > today) {
    return {
      field: "status",
      message: "This challenge hasn't started yet. Choose Upcoming, or move the start date to today or earlier.",
    };
  }
  if (to === "ACTIVE" && endDate < today) {
    return { field: "endDate", message: "An active challenge can't have already ended. Move the end date to today or later." };
  }
  if (to === "UPCOMING" && startDate <= today) {
    return {
      field: "status",
      message: "An upcoming challenge must start after today. Choose Active, or move the start date later.",
    };
  }
  return null;
}
