import React from "react";
import Link from "next/link";
import { Bike, Zap, Recycle, Salad } from "lucide-react";

type Template = {
  id: string;
  name: string;
  category: string;
  duration: string;
  description: string;
  icon: React.ElementType; // a lucide-react icon
  iconColor: string; // Tailwind classes for the icon's square
};

// Hardcoded templates for Demo 1; not connected to the database yet.
const templates: Template[] = [
  {
    id: "commuter",
    name: "Commuter Challenge",
    category: "Transportation",
    duration: "2 weeks",
    description: "Encourage biking, walking, transit, and carpooling instead of driving solo.",
    icon: Bike,
    iconColor: "text-blue-600 bg-blue-50",
  },
  {
    id: "energy",
    name: "Energy Saver Sprint",
    category: "Energy",
    duration: "1 week",
    description: "Cut electricity use with lights-off, unplugging, and cold-wash habits.",
    icon: Zap,
    iconColor: "text-amber-600 bg-amber-50",
  },
  {
    id: "zero-waste",
    name: "Zero Waste Week",
    category: "Waste",
    duration: "1 week",
    description: "Minimize landfill waste through reusables, composting, and recycling.",
    icon: Recycle,
    iconColor: "text-emerald-600 bg-emerald-50",
  },
  {
    id: "food-based",
    name: "Food-Based Challenge",
    category: "Food",
    duration: "10 days",
    description: "Make greener food choices: less waste, more local, and fewer packaged meals.",
    icon: Salad,
    iconColor: "text-lime-600 bg-lime-50",
  },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Challenge Templates</h1>
        <p className="text-sm text-slate-500 mt-1">Start a new challenge from a reusable preset.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {templates.map((template) => {
          const Icon = template.icon;
          const iconBoxClass = "w-10 h-10 flex items-center justify-center rounded-lg " + template.iconColor;
          const details = template.category + " · " + template.duration;
          // Note: the form doesn't read ?template= yet, so it opens empty.
          const useTemplateLink = "/admin/admin/challenges/new?template=" + template.id;

          // flex-col + flex-1 on the description keeps every button at the card's bottom.
          return (
            <div
              key={template.id}
              className="flex flex-col bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow"
            >
              <div className={iconBoxClass}>
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-slate-900">{template.name}</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">{details}</p>
              <p className="mt-3 text-sm text-slate-600 flex-1">{template.description}</p>
              <Link
                href={useTemplateLink}
                className="mt-5 inline-flex justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Use Template
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
