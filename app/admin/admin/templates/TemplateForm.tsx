"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Plus,
  Search,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import {
  getGlobalActions,
  createGlobalAction,
  createTemplate,
  updateTemplate,
  type TemplatePreset,
  type GlobalAction,
  CHALLENGE_CATEGORIES,
} from "../challenges/mock-data";
import MobilePreview from "@/components/shared/MobilePreview";

const THEME_PALETTES = [
  { name: "Emerald Green", hex: "#10B981" },
  { name: "Cyan Teal", hex: "#06B6D4" },
  { name: "Cobalt Blue", hex: "#3B82F6" },
  { name: "Amber Sun", hex: "#F59E0B" },
  { name: "Purple Bloom", hex: "#8B5CF6" },
  { name: "Rose Coral", hex: "#F43F5E" },
  { name: "Forest Dark", hex: "#047857" },
  { name: "Slate Steel", hex: "#475569" },
];

interface TemplateFormProps {
  initialData?: TemplatePreset;
  isEdit?: boolean;
}

export default function TemplateForm({ initialData, isEdit = false }: TemplateFormProps) {
  const router = useRouter();

  // Master catalog actions
  const [globalActions, setGlobalActions] = useState<GlobalAction[]>(() => getGlobalActions());

  // Form states
  const [name, setName] = useState(initialData?.name || "");
  const [code, setCode] = useState(initialData?.code || "");
  const [category, setCategory] = useState(initialData?.category || "Transportation");
  const [duration, setDuration] = useState(initialData?.duration || "1 week");
  const [days, setDays] = useState(initialData?.days || 7);
  const [description, setDescription] = useState(initialData?.description || "");
  const [themeColor, setThemeColor] = useState(initialData?.themeColor || "#10B981");

  // Selected bundled action IDs
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>(() => {
    if (initialData?.actions?.length) {
      // Match by title or id
      const initialTitles = new Set(initialData.actions.map((a) => a.title.toLowerCase()));
      const matched = getGlobalActions()
        .filter((ga) => initialTitles.has(ga.title.toLowerCase()))
        .map((ga) => ga.id);
      return matched.length > 0 ? matched : [];
    }
    return [];
  });

  // Action catalog search and category filter inside the selector
  const [actionSearch, setActionSearch] = useState("");
  const [actionCategoryFilter, setActionCategoryFilter] = useState("All");

  // Inline "Create Global Action" modal
  const [isCreateActionOpen, setIsCreateActionOpen] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState("");
  const [newActionDesc, setNewActionDesc] = useState("");
  const [newActionCategory, setNewActionCategory] = useState("Transportation");
  const [newActionPoints, setNewActionPoints] = useState(20);
  const [newActionError, setNewActionError] = useState<string | null>(null);

  // Validation errors
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle selection of an action
  const toggleAction = (actionId: string) => {
    setSelectedActionIds((prev) =>
      prev.includes(actionId) ? prev.filter((id) => id !== actionId) : [...prev, actionId]
    );
  };

  // Build the list of bundled action objects for the preview and save payload
  const bundledActions = useMemo(() => {
    return globalActions
      .filter((ga) => selectedActionIds.includes(ga.id))
      .map((ga) => ({
        id: ga.id,
        title: ga.title,
        description: ga.description,
        category: ga.category,
        points: ga.points,
      }));
  }, [globalActions, selectedActionIds]);

  // Filtered catalog actions shown in the selector
  const availableActions = useMemo(() => {
    return globalActions.filter((ga) => {
      if (actionCategoryFilter !== "All" && ga.category !== actionCategoryFilter) return false;
      if (actionSearch.trim()) {
        const q = actionSearch.toLowerCase();
        return ga.title.toLowerCase().includes(q) || ga.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [globalActions, actionCategoryFilter, actionSearch]);

  const handleCreateInlineAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) {
      setNewActionError("Action title is required.");
      return;
    }
    if (!newActionDesc.trim()) {
      setNewActionError("Action description is required.");
      return;
    }

    const created = createGlobalAction({
      title: newActionTitle,
      description: newActionDesc,
      category: newActionCategory,
      points: Number(newActionPoints) || 10,
    });

    const refreshed = getGlobalActions();
    setGlobalActions(refreshed);
    // Auto-select the newly created action for this template
    setSelectedActionIds((prev) => [...prev, created.id]);

    setIsCreateActionOpen(false);
    setNewActionTitle("");
    setNewActionDesc("");
    setNewActionCategory("Transportation");
    setNewActionPoints(20);
    setNewActionError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();
    const trimmedDesc = description.trim();

    if (!trimmedName) {
      setFormError("Template name is required.");
      return;
    }
    if (!trimmedCode) {
      setFormError("Template code is required (e.g. H2O-26).");
      return;
    }
    if (!trimmedDesc) {
      setFormError("Please provide a description of this template.");
      return;
    }
    if (bundledActions.length === 0) {
      setFormError("Please select at least 1 action to bundle with this template.");
      return;
    }

    setIsSubmitting(true);

    if (isEdit && initialData?.id) {
      updateTemplate(initialData.id, {
        name: trimmedName,
        code: trimmedCode,
        category,
        duration,
        days: Number(days) || 7,
        description: trimmedDesc,
        themeColor,
        actions: bundledActions,
      });
    } else {
      createTemplate({
        name: trimmedName,
        code: trimmedCode,
        category,
        duration,
        days: Number(days) || 7,
        description: trimmedDesc,
        themeColor,
        actions: bundledActions,
      });
    }

    router.push("/admin/admin/templates");
  };

  return (
    <div className="space-y-6">
      {/* Top back link */}
      <div>
        <Link
          href="/admin/admin/templates"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Templates</span>
        </Link>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {isEdit ? "Edit Challenge Template" : "Create Challenge Template"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure a reusable sprint preset with campaign defaults, brand theme colors, and bundled catalog actions.
        </p>
      </div>

      {/* Main Grid: Form on Left (7 cols), MobilePreview on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Authoring Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Template Basics */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                1. Template Overview
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sustainable Commute Week"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Template Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SCW-26"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {CHALLENGE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recommended Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 1 week, 10 days"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Days Offset
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the primary goals and guidelines for this sustainability campaign..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Section 2: Theme Color */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                2. Brand Theme Color
              </h2>
              <p className="text-xs text-slate-500">
                Paints the mobile app header, challenge badges, and leaderboard accents.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {THEME_PALETTES.map((pal) => (
                  <button
                    key={pal.hex}
                    type="button"
                    onClick={() => setThemeColor(pal.hex)}
                    title={pal.name}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      themeColor === pal.hex
                        ? "scale-110 border-slate-900 ring-2 ring-emerald-500"
                        : "border-white hover:scale-105"
                    }`}
                    style={{ backgroundColor: pal.hex }}
                  />
                ))}

                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                  />
                  <span className="text-xs font-mono font-medium text-slate-600 uppercase">
                    {themeColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Bundled Action Catalog */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    3. Bundled Actions ({selectedActionIds.length} Selected)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select actions from the Global Catalog to bundle with this template.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateActionOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors ring-1 ring-emerald-200/80 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Global Action</span>
                </button>
              </div>

              {/* Action Filter toolbar */}
              <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={actionSearch}
                    onChange={(e) => setActionSearch(e.target.value)}
                    placeholder="Search actions..."
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1">
                  {["All", ...CHALLENGE_CATEGORIES].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setActionCategoryFilter(c)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors shrink-0 ${
                        actionCategoryFilter === c
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Action Selection Box */}
              <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                {availableActions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No actions match your search.
                  </div>
                ) : (
                  availableActions.map((action) => {
                    const isSelected = selectedActionIds.includes(action.id);
                    return (
                      <div
                        key={action.id}
                        onClick={() => toggleAction(action.id)}
                        className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                          isSelected ? "bg-emerald-50/70" : "hover:bg-white bg-white/60"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {action.title}
                            </span>
                            <span className="text-xs font-bold text-emerald-700 shrink-0">
                              +{action.points} pts
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {action.description}
                          </p>
                          <span className="inline-block mt-1 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            {action.category}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isEdit ? "Save Template Changes" : "Create Challenge Template"}
              </button>
              <Link
                href="/admin/admin/templates"
                className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Right Column: Sticky Live Mobile Simulator */}
        <div className="lg:col-span-5 hidden lg:block sticky top-24">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Live Participant View
              </span>
              <span className="text-[11px] text-slate-400">Updates in real time</span>
            </div>

            <MobilePreview
              title={name}
              category={category}
              description={description}
              themeColor={themeColor}
              actions={bundledActions}
            />
          </div>
        </div>
      </div>

      {/* CREATE NEW GLOBAL ACTION MODAL */}
      {isCreateActionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Global Catalog Action</h3>
              <button
                type="button"
                onClick={() => setIsCreateActionOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {newActionError && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-50 text-xs text-red-700 border border-red-200">
                {newActionError}
              </div>
            )}

            <form onSubmit={handleCreateInlineAction} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Action Title *
                </label>
                <input
                  type="text"
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                  placeholder="e.g. Inspect Campus Faucet for Leaks"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newActionCategory}
                    onChange={(e) => setNewActionCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white"
                  >
                    {CHALLENGE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Points *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={newActionPoints}
                    onChange={(e) => setNewActionPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  value={newActionDesc}
                  onChange={(e) => setNewActionDesc(e.target.value)}
                  placeholder="What participants do to earn these points..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateActionOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  Save & Bundle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
