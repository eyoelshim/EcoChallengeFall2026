"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bike,
  Zap,
  Recycle,
  Salad,
  Droplets,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TEMPLATE_PRESETS, type TemplatePreset } from "../challenges/mock-data";

const TEMPLATE_ICONS: Record<string, { icon: React.ElementType; color: string; badge: string }> = {
  commuter: {
    icon: Bike,
    color: "text-blue-600 bg-blue-50 ring-blue-100",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  "h2o-hero": {
    icon: Droplets,
    color: "text-cyan-600 bg-cyan-50 ring-cyan-100",
    badge: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  },
  "power-down": {
    icon: Zap,
    color: "text-amber-600 bg-amber-50 ring-amber-100",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  "zero-waste": {
    icon: Recycle,
    color: "text-emerald-600 bg-emerald-50 ring-emerald-100",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  "food-based": {
    icon: Salad,
    color: "text-purple-600 bg-purple-50 ring-purple-100",
    badge: "bg-purple-50 text-purple-700 ring-purple-200",
  },
};

export default function TemplatesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const presets = Object.values(TEMPLATE_PRESETS);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Challenge Templates</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pre-configured sustainability sprint templates derived from MPCA client programs with bundled action catalogs.
          </p>
        </div>
        <Link
          href="/admin/admin/challenges/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <span>Blank Challenge</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {presets.map((template: TemplatePreset) => {
          const meta = TEMPLATE_ICONS[template.id] || {
            icon: Sparkles,
            color: "text-slate-600 bg-slate-50 ring-slate-100",
            badge: "bg-slate-100 text-slate-700 ring-slate-200",
          };
          const Icon = meta.icon;
          const isExpanded = expandedId === template.id;
          const totalPoints = template.actions.reduce((sum, a) => sum + a.points, 0);

          return (
            <div
              key={template.id}
              className="flex flex-col bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Category banner line */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: template.themeColor }}
              />

              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl ring-1 ${meta.color} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${meta.badge}`}>
                    {template.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    {template.duration}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">{template.name}</h2>
                <p className="font-mono text-xs text-slate-400 mt-0.5">Preset Code: {template.code}</p>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed min-h-[3rem]">
                  {template.description}
                </p>
              </div>

              {/* Bundled Actions Summary */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    {template.actions.length} Bundled Actions
                  </span>
                  <span className="text-emerald-700">+{totalPoints} total pts</span>
                </div>

                {/* Collapsible Action Preview */}
                <button
                  type="button"
                  onClick={() => toggleExpand(template.id)}
                  className="w-full flex items-center justify-between py-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <span>{isExpanded ? "Hide action preview" : "Preview bundled actions"}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="space-y-1.5 pt-1 animate-in fade-in">
                    {template.actions.map((act, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-50 text-xs flex items-center justify-between gap-2"
                      >
                        <span className="font-medium text-slate-800 truncate">{act.title}</span>
                        <span className="font-bold text-emerald-700 shrink-0">+{act.points} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Link */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Pre-populates form fields</span>
                <Link
                  href={`/admin/admin/challenges/new?template=${template.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
