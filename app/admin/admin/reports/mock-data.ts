/**
 * @deprecated Mock participation datasets have been deprecated in favor of live Prisma queries via Neon.
 * This file is retained only for category styling mappings.
 */

export const CATEGORY_COLORS: Record<string, string> = {
  TRANSPORT: "#10B981", // emerald-500
  WATER: "#06B6D4", // cyan-500
  ENERGY: "#F59E0B", // amber-500
  RECYCLING: "#3B82F6", // blue-500
  FOOD: "#8B5CF6", // purple-500
  // Fallback for title-cased labels
  Transportation: "#10B981",
  "Water Conservation": "#06B6D4",
  "Energy Conservation": "#F59E0B",
  "Waste & Recycling": "#3B82F6",
};

export const CATEGORY_BADGES: Record<string, string> = {
  TRANSPORT: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  WATER: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  ENERGY: "bg-amber-50 text-amber-700 ring-amber-200",
  RECYCLING: "bg-blue-50 text-blue-700 ring-blue-200",
  FOOD: "bg-purple-50 text-purple-700 ring-purple-200",
  // Fallback for title-cased labels
  Transportation: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Water Conservation": "bg-cyan-50 text-cyan-700 ring-cyan-200",
  "Energy Conservation": "bg-amber-50 text-amber-700 ring-amber-200",
  "Waste & Recycling": "bg-blue-50 text-blue-700 ring-blue-200",
};
