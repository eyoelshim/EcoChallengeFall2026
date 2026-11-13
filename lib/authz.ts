import { cache } from "react";
import {
  currentUser as fetchCurrentUser,
  type User,
} from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Clerk's currentUser() makes a network call every time; a layout and its page together
// used to call it three times per request. cache() dedupes it within a single request only,
// so role changes still take effect on the very next request.
const currentUser = cache(fetchCurrentUser);

// Clerk publicMetadata.role values that grant console access
export const CLERK_ADMIN_ROLE = "admin";
export const CLERK_SUPERADMIN_ROLE = "superadmin";

// Comma-separated emails in SUPERADMIN_EMAILS are always SuperAdmins, regardless of Clerk or DB role
export function getEnvSuperAdminEmails(): string[] {
  return (process.env.SUPERADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isEnvSuperAdminEmail(email: string | null | undefined) {
  return !!email && getEnvSuperAdminEmails().includes(email.toLowerCase());
}

function userEmails(user: User) {
  return user.emailAddresses.map((e) => e.emailAddress);
}

/**
 * Evaluates whether a given Clerk user possesses SuperAdmin privileges via
 * metadata role or matching email address in SUPERADMIN_EMAILS.
 *
 * @param user - Clerk User instance or null.
 * @returns Boolean indicating SuperAdmin eligibility.
 */
export function isSuperAdminUser(user: User | null): boolean {
  if (!user) return false;
  return (
    user.publicMetadata?.role === CLERK_SUPERADMIN_ROLE ||
    userEmails(user).some(isEnvSuperAdminEmail)
  );
}

/**
 * Evaluates whether a given Clerk user possesses Admin privileges via
 * metadata role or inherited SuperAdmin privileges.
 *
 * @param user - Clerk User instance or null.
 * @returns Boolean indicating Admin eligibility.
 */
export function isAdminUser(user: User | null): boolean {
  if (!user) return false;
  return (
    user.publicMetadata?.role === CLERK_ADMIN_ROLE || isSuperAdminUser(user)
  );
}

export async function isCurrentUserAdmin() {
  return isAdminUser(await currentUser());
}

export async function isCurrentUserSuperAdmin() {
  return isSuperAdminUser(await currentUser());
}

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  if (!isAdminUser(user)) redirect("/admin/unauthorized");
  return user;
}

/**
 * Guards permanent, structural deletions (challenges, departments, teams, user accounts).
 *
 * @returns The signed-in Clerk user, who is confirmed to be a SuperAdmin.
 * @throws {Error} "Unauthorized" if unauthenticated; "Forbidden: ..." if the user is not a SuperAdmin.
 *
 * Intent: Regular admins may archive and deactivate, but anything irreversible must be
 * escalated to a SuperAdmin (stakeholder decision, Nov 5 2026). Unlike requireAdmin this
 * throws instead of redirecting, so Server Actions can surface the 403 to the caller.
 */
export async function requireSuperAdmin(): Promise<User> {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  if (!isSuperAdminUser(user))
    throw new Error(
      "Forbidden: only SuperAdmins can permanently delete records",
    );
  return user;
}
