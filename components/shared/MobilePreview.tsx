"use client";

import React from "react";
import {
  Circle,
  Home,
  PlusCircle,
  Trophy,
  User,
  Sparkles,
} from "lucide-react";

export interface MobilePreviewProps {
  title?: string;
  category?: string;
  description?: string;
  themeColor?: string;
  actions?: Array<{
    title: string;
    description?: string;
    category?: string;
    points: number;
  }>;
}

export default function MobilePreview({
  title = "Challenge Title",
  category = "Sustainability",
  description = "Participate in daily actions to earn points and climb the campus leaderboard.",
  themeColor = "#10B981",
  actions = [],
}: MobilePreviewProps) {
  const displayTitle = title.trim() || "Untitled Sprint";
  const displayDesc = description.trim() || "Join campus peers in logging daily sustainable habits.";
  const displayCategory = category.trim() || "General";

  return (
    <div className="w-[300px] h-[580px] bg-slate-950 rounded-[44px] p-2.5 shadow-2xl ring-1 ring-slate-800/80 mx-auto flex flex-col shrink-0 select-none">
      {/* Phone screen container */}
      <div className="w-full h-full bg-slate-50 rounded-[36px] overflow-hidden flex flex-col relative border border-slate-900">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
        </div>

        {/* Top App Bar with Challenge Theme */}
        <div
          className="pt-8 pb-4 px-4 text-white text-center transition-colors relative"
          style={{ backgroundColor: themeColor }}
        >
          <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold tracking-wider uppercase mb-1">
            {displayCategory}
          </span>
          <h3 className="text-sm font-bold leading-tight line-clamp-2 drop-shadow-xs">
            {displayTitle}
          </h3>
          <p className="text-[10px] text-white/80 mt-1 line-clamp-2 px-1">
            {displayDesc}
          </p>
        </div>

        {/* Action Checklist Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Actions ({actions.length})
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md ring-1 ring-emerald-200">
              {actions.reduce((sum, a) => sum + (Number(a.points) || 0), 0)} pts max
            </span>
          </div>

          {actions.length === 0 ? (
            <div className="text-center py-10 px-4 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
              <Sparkles className="w-6 h-6 mx-auto mb-1 text-slate-300" />
              <p className="text-[11px]">No actions staged yet.</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Select actions to see checklist preview.</p>
            </div>
          ) : (
            actions.map((act, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-2xs flex items-start gap-2 text-left"
              >
                <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-[11px] font-semibold text-slate-800 truncate">
                      {act.title}
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 shrink-0">
                      +{act.points}p
                    </span>
                  </div>
                  {act.description && (
                    <p className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">
                      {act.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Faux Mobile Bottom Nav */}
        <div className="h-12 bg-white border-t border-slate-200 flex items-center justify-around px-2 text-slate-400">
          <div className="flex flex-col items-center gap-0.5 text-emerald-600">
            <Home className="w-4 h-4" />
            <span className="text-[8px] font-medium">Home</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <PlusCircle className="w-4 h-4" />
            <span className="text-[8px] font-medium">Log</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Trophy className="w-4 h-4" />
            <span className="text-[8px] font-medium">Rank</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <User className="w-4 h-4" />
            <span className="text-[8px] font-medium">Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}
