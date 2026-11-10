"use server";

import { db } from "@/lib/db";
import { parseEmailList } from "@/lib/email-list";
import { appUrl, inviteParticipant } from "@/lib/invitations";

export type JoinRequestResult = { status?: "invited" | "already_member"; error?: string };

// Optional comma-separated allow-list (e.g. "stpaul.gov,minneapolismn.gov"); empty allows any domain
function isAllowedDomain(email: string): boolean {
  const allowed = (process.env.JOIN_ALLOWED_EMAIL_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) return true;
  const domain = email.split("@")[1];
  return allowed.some((d) => domain === d || domain.endsWith(`.${d}`));
}

/**
 * Handles the evergreen /join link: emails the visitor a Clerk invitation and pre-creates
 * their pending user with the department they picked.
 *
 * @param input.email The visitor's email address.
 * @param input.departmentId The department they selected.
 * @returns `{ status }` on success, or `{ error }` with a visitor-safe message.
 *
 * Intent: This is a public, unauthenticated action, so it only ever invites the address that
 * was typed (the visitor must open that inbox to finish) and never grants roles. Set
 * JOIN_ALLOWED_EMAIL_DOMAINS to restrict sign-ups to municipal domains.
 */
export async function requestJoinInvitation(input: {
  email: string;
  departmentId: string;
}): Promise<JoinRequestResult> {
  const { valid } = parseEmailList(input.email);
  if (valid.length !== 1) return { error: "Enter a single valid email address." };
  const email = valid[0];
  if (!isAllowedDomain(email)) return { error: "Please use your work email address." };

  const department = await db.department.findUnique({ where: { id: input.departmentId }, select: { id: true } });
  if (!department) return { error: "Please choose your department." };

  const result = await inviteParticipant(email, department.id, await appUrl("/sign-up"));
  if (result.status === "failed") return { error: "We couldn't send your invitation. Please try again shortly." };
  return { status: result.status };
}
