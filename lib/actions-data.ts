export type ActionItem = {
  title: string;
  description: string;
  points: number;
  category: "TRANSPORT" | "RECYCLING" | "ENERGY" | "FOOD" | "WATER";
  actionType: string;
};

export const actionsByCategory = {
  Transportation: [
    { title: "Biked to work", description: "Eco-friendly commute", points: 50, category: "TRANSPORT" as const, actionType: "Biked to work" },
    { title: "Used public transit", description: "Bus, train, or metro", points: 30, category: "TRANSPORT" as const, actionType: "Used public transit" },
    { title: "Carpooled", description: "Shared ride with colleagues", points: 25, category: "TRANSPORT" as const, actionType: "Carpooled" },
    { title: "Walked to work", description: "Zero emissions", points: 40, category: "TRANSPORT" as const, actionType: "Walked to work" },
    { title: "Electric vehicle", description: "Low-emission commute", points: 35, category: "TRANSPORT" as const, actionType: "Electric vehicle" },
    { title: "Skateboarded", description: "Fun and eco-friendly", points: 45, category: "TRANSPORT" as const, actionType: "Skateboarded" },
    { title: "Scootered to work", description: "Electric scooter commute", points: 35, category: "TRANSPORT" as const, actionType: "Scootered to work" },
  ],
  Recycling: [
    { title: "Recycled paper", description: "Office waste sorting", points: 15, category: "RECYCLING" as const, actionType: "Recycled paper" },
    { title: "Recycled plastic", description: "Bottles and containers", points: 15, category: "RECYCLING" as const, actionType: "Recycled plastic" },
    { title: "Composted food waste", description: "Organic waste", points: 20, category: "RECYCLING" as const, actionType: "Composted food waste" },
    { title: "E-waste disposal", description: "Electronics recycling", points: 30, category: "RECYCLING" as const, actionType: "E-waste disposal" },
    { title: "Reused materials", description: "Creative reuse", points: 25, category: "RECYCLING" as const, actionType: "Reused materials" },
    { title: "Recycled cardboard", description: "Box breakdown", points: 12, category: "RECYCLING" as const, actionType: "Recycled cardboard" },
    { title: "Donated old items", description: "Give items new life", points: 28, category: "RECYCLING" as const, actionType: "Donated old items" },
  ],
  Energy: [
    { title: "Turned off unused lights", description: "Office energy savings", points: 10, category: "ENERGY" as const, actionType: "Turned off unused lights" },
    { title: "Used natural lighting", description: "Reduced electricity", points: 15, category: "ENERGY" as const, actionType: "Used natural lighting" },
    { title: "Unplugged devices", description: "No phantom power", points: 12, category: "ENERGY" as const, actionType: "Unplugged devices" },
    { title: "Adjusted thermostat", description: "Optimal temperature", points: 20, category: "ENERGY" as const, actionType: "Adjusted thermostat" },
    { title: "Used energy-efficient equipment", description: "Smart devices", points: 18, category: "ENERGY" as const, actionType: "Used energy-efficient equipment" },
    { title: "Closed blinds for insulation", description: "Temperature control", points: 14, category: "ENERGY" as const, actionType: "Closed blinds for insulation" },
    { title: "Used laptop instead of desktop", description: "Lower power consumption", points: 16, category: "ENERGY" as const, actionType: "Used laptop instead of desktop" },
  ],
  Food: [
    { title: "Brought reusable mug", description: "No disposable cups", points: 20, category: "FOOD" as const, actionType: "Brought reusable mug" },
    { title: "Ate plant-based meal", description: "Vegetarian or vegan", points: 30, category: "FOOD" as const, actionType: "Ate plant-based meal" },
    { title: "Used reusable containers", description: "No single-use plastic", points: 15, category: "FOOD" as const, actionType: "Used reusable containers" },
    { title: "Avoided food waste", description: "Finished your meal", points: 25, category: "FOOD" as const, actionType: "Avoided food waste" },
    { title: "Bought local produce", description: "Farmer's market", points: 22, category: "FOOD" as const, actionType: "Bought local produce" },
    { title: "Packed lunch from home", description: "Reduced packaging", points: 18, category: "FOOD" as const, actionType: "Packed lunch from home" },
    { title: "Used reusable utensils", description: "No plastic cutlery", points: 12, category: "FOOD" as const, actionType: "Used reusable utensils" },
  ],
  Water: [
    { title: "Used refillable bottle", description: "No plastic bottles", points: 15, category: "WATER" as const, actionType: "Used refillable bottle" },
    { title: "Took shorter shower", description: "Water conservation", points: 20, category: "WATER" as const, actionType: "Took shorter shower" },
    { title: "Fixed a leak", description: "Reported or repaired", points: 40, category: "WATER" as const, actionType: "Fixed a leak" },
    { title: "Used low-flow fixtures", description: "Efficient water use", points: 25, category: "WATER" as const, actionType: "Used low-flow fixtures" },
    { title: "Collected rainwater", description: "Garden irrigation", points: 35, category: "WATER" as const, actionType: "Collected rainwater" },
    { title: "Turned off tap while washing", description: "Hand washing efficiency", points: 18, category: "WATER" as const, actionType: "Turned off tap while washing" },
    { title: "Watered plants efficiently", description: "Morning or evening watering", points: 22, category: "WATER" as const, actionType: "Watered plants efficiently" },
  ],
};

export const allActions: ActionItem[] = Object.values(actionsByCategory).flat();

export function findAction(actionType: string): ActionItem | undefined {
  return allActions.find((a) => a.actionType === actionType);
}
