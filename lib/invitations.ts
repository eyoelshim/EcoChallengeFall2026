import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import type { InviteResult } from "@/lib/email-list";

// Clerk calls in flight at once while sending a batch
const INVITE_CONCURRENCY = 5;

/**
 * Builds the absolute URL of an app path from the incoming request, so invitation links
 * point at whichever deployment (localhost, preview, production) sent them.
 */
export async function appUrl(path: string): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}${path}`;
}

function errorMessage(err: unknown): string {
  if (isClerkAPIResponseError(err)) return err.errors[0]?.longMessage ?? err.errors[0]?.message ?? err.message;
  return err instanceof Error ? err.message : "Something went wrong";
}

/**
 * Sends one Clerk invitation email and pre-creates (or refreshes) the pending user row.
 *
 * @param email Lowercased email address to invite.
 * @param departmentId Department to pre-assign, or null to let the participant choose at onboarding.
 * @param redirectUrl Absolute sign-up URL the invitation link should open.
 * @returns The outcome for this address; never throws, so one bad address can't sink a batch.
 *
 * Intent: Clerk sends the email; the pending row (status INVITED, no clerkId) holds the
 * department so the dashboard can link it by email on first sign-in. Re-inviting a pending
 * address simply sends a fresh email, which is how expired invitations get renewed.
 * Clerk is called first so a failed email never leaves an "Invited" row nobody was told about.
 */
export async function inviteParticipant(
  email: string,
  departmentId: string | null,
  redirectUrl: string
): Promise<InviteResult> {
  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing?.clerkId) return { email, status: "already_member" };

    const department = departmentId
      ? await db.department.findUnique({ where: { id: departmentId }, select: { id: true, name: true } })
      : null;

    const client = await clerkClient();
    await client.invitations.createInvitation({ emailAddress: email, redirectUrl, ignoreExisting: true });

    // Keep both department fields in sync: the Users filter reads the legacy name, Groups read the id
    const departmentData = department ? { departmentId: department.id, departmentName: department.name } : {};
    if (existing) {
      await db.user.update({ where: { id: existing.id }, data: departmentData });
    } else {
      await db.user.create({
        data: { email, name: email.split("@")[0], status: UserStatus.INVITED, ...departmentData },
      });
    }

    return { email, status: "invited" };
  } catch (err) {
    console.error(`Failed to invite ${email}:`, err);
    return { email, status: "failed", error: errorMessage(err) };
  }
}

/**
 * Invites a list of addresses with bounded concurrency, preserving input order in the results.
 */
export async function inviteParticipants(
  emails: string[],
  departmentId: string | null,
  redirectUrl: string
): Promise<InviteResult[]> {
  const results: InviteResult[] = [];
  for (let i = 0; i < emails.length; i += INVITE_CONCURRENCY) {
    const chunk = emails.slice(i, i + INVITE_CONCURRENCY);
    results.push(...(await Promise.all(chunk.map((email) => inviteParticipant(email, departmentId, redirectUrl)))));
  }
  return results;
}

/**
 * Revokes any still-pending Clerk invitations for an address, so a removed invitee's
 * email link stops working. A no-op when none exist.
 */
export async function revokePendingInvitations(email: string): Promise<void> {
  const client = await clerkClient();
  const { data } = await client.invitations.getInvitationList({ status: "pending", query: email });
  await Promise.all(
    data
      .filter((invitation) => invitation.emailAddress.toLowerCase() === email.toLowerCase())
      .map((invitation) => client.invitations.revokeInvitation(invitation.id))
  );
}
