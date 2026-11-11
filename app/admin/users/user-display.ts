// Labels and badge styles for live user data (DB enum values → UI)
import type { ActionCategory, UserRole, UserStatus } from "@prisma/client";

export const ROLE_OPTIONS: UserRole[] = ["SUPERADMIN", "ADMIN", "GENERAL_USER"];
export const STATUS_OPTIONS: UserStatus[] = ["ACTIVE", "DEACTIVATED"];

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPERADMIN: "SuperAdmin",
  ADMIN: "Admin",
  GENERAL_USER: "General User",
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Active",
  DEACTIVATED: "Deactivated",
};

export const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  SUPERADMIN: "bg-purple-50 text-purple-700 ring-purple-200",
  ADMIN: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  GENERAL_USER: "bg-slate-100 text-slate-700 ring-slate-200",
};

export const STATUS_BADGE_STYLES: Record<UserStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DEACTIVATED: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const CATEGORY_LABELS: Record<ActionCategory, string> = {
  TRANSPORT: "Transport",
  WATER: "Water",
  ENERGY: "Energy",
  RECYCLING: "Recycling",
  FOOD: "Food",
};

export function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
