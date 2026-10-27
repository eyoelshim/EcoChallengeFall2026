import { ActionCategory } from "@prisma/client";

export function normalizeActionCategory(category: string | undefined): ActionCategory {
  if (!category) return ActionCategory.TRANSPORT;
  const upper = category.trim().toUpperCase();
  if (upper in ActionCategory) return upper as ActionCategory;
  if (upper.includes("TRANS") || upper.includes("BIKE") || upper.includes("COMMUT")) return ActionCategory.TRANSPORT;
  if (upper.includes("WATER") || upper.includes("H2O")) return ActionCategory.WATER;
  if (upper.includes("ENERGY") || upper.includes("POWER") || upper.includes("ELEC")) return ActionCategory.ENERGY;
  if (upper.includes("WASTE") || upper.includes("RECYCL") || upper.includes("ZERO")) return ActionCategory.RECYCLING;
  if (upper.includes("FOOD") || upper.includes("PLANT") || upper.includes("MEAL")) return ActionCategory.FOOD;
  return ActionCategory.TRANSPORT;
}

export function formatCategoryLabel(cat: ActionCategory | string): string {
  switch (cat) {
    case ActionCategory.TRANSPORT:
    case "TRANSPORT":
    case "Transportation":
      return "Transportation";
    case ActionCategory.WATER:
    case "WATER":
    case "Water":
      return "Water";
    case ActionCategory.ENERGY:
    case "ENERGY":
    case "Energy":
      return "Energy";
    case ActionCategory.RECYCLING:
    case "RECYCLING":
    case "Waste":
    case "Waste & Recycling":
      return "Waste";
    case ActionCategory.FOOD:
    case "FOOD":
    case "Food":
      return "Food";
    default:
      return String(cat);
  }
}
