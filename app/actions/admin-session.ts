"use server";

import { isCurrentUserSuperAdmin } from "@/lib/authz";

/**
 * Reports whether the signed-in viewer is a SuperAdmin, for client components that
 * need to hide SuperAdmin-only controls (e.g. delete buttons).
 *
 * @returns True when the viewer is a SuperAdmin via Clerk metadata or SUPERADMIN_EMAILS.
 *
 * Intent: SUPERADMIN_EMAILS is server-only, so the client cannot derive this from Clerk
 * alone. This only drives visibility; the Server Actions enforce the rule themselves.
 */
export async function getViewerIsSuperAdmin(): Promise<boolean> {
  return isCurrentUserSuperAdmin();
}
