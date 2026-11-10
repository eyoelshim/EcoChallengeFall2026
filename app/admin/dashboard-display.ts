import type { ActionCategory } from "@prisma/client";

export const CATEGORY_CONFIG: Record<
  ActionCategory,
  { label: string; color: string; badge: string }
> = {
  TRANSPORT: {
    label: "Transportation",
    color: "#3B82F6",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  WATER: {
    label: "Water Conservation",
    color: "#06B6D4",
    badge: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  },
  ENERGY: {
    label: "Energy Efficiency",
    color: "#F59E0B",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  RECYCLING: {
    label: "Waste & Recycling",
    color: "#10B981",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  FOOD: {
    label: "Sustainable Food",
    color: "#8B5CF6",
    badge: "bg-purple-50 text-purple-700 ring-purple-200",
  },
};

export function formatTimeAgo(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.max(0, Math.floor(diffInMs / 1000));

  if (diffInSecs < 60) return "just now";
  const diffInMins = Math.floor(diffInSecs / 60);
  if (diffInMins < 60) return `${diffInMins}m ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
