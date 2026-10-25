import { currentUser, type User } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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

function isSuperAdminUser(user: User | null) {
  if (!user) return false;
  return (
    user.publicMetadata?.role === CLERK_SUPERADMIN_ROLE ||
    userEmails(user).some(isEnvSuperAdminEmail)
  );
}

function isAdminUser(user: User | null) {
  if (!user) return false;
  return user.publicMetadata?.role === CLERK_ADMIN_ROLE || isSuperAdminUser(user);
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
