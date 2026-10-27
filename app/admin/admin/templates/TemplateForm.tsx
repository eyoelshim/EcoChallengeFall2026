"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Plus,
  Search,
  Check,
  X,
} from "lucide-react";
import {
  getGlobalActions,
  createGlobalAction,
  type GlobalActionItem,
} from "@/app/actions/admin-actions";
import {
  createAdminTemplate,
  updateAdminTemplate,
  type AdminTemplateItem,
  type TemplateActionItem,
} from "@/app/actions/admin-templates";

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

const CATEGORIES = [
  "Transportation",
  "Water",
  "Energy",
  "Waste",
  "Food",
  "General Sustainability",
];

interface TemplateFormProps {
  initialData?: AdminTemplateItem;
  isEdit?: boolean;
}

export default function TemplateForm({ initialData, isEdit = false }: TemplateFormProps) {
  const router = useRouter();

  // Master catalog actions
  const [globalActions, setGlobalActions] = useState<GlobalActionItem[]>([]);
  const [isLoadingActions, setIsLoadingActions] = useState(true);

  // Form states
  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState(initialData?.category || "Transportation");
  const [description, setDescription] = useState(initialData?.description || "");
  const [themeColor, setThemeColor] = useState(initialData?.themeColor || "#10B981");

  // Selected bundled action IDs
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);

  // Action catalog search and category filter inside the selector
  const [actionSearch, setActionSearch] = useState("");
  const [actionCategoryFilter, setActionCategoryFilter] = useState("All");

  // Inline "Create Global Action" modal
  const [isCreateActionOpen, setIsCreateActionOpen] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState("");
  const [newActionDesc, setNewActionDesc] = useState("");
  const [newActionCategory, setNewActionCategory] = useState("TRANSPORT");
  const [newActionPoints, setNewActionPoints] = useState(20);
  const [newActionError, setNewActionError] = useState<string | null>(null);

  // Validation errors
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCatalog() {
      try {
        setIsLoadingActions(true);
        const actions = await getGlobalActions();
        setGlobalActions(actions);

        if (initialData?.actions?.length) {
          const ids: string[] = [];
          for (const act of initialData.actions) {
            const match = actions.find(
              (ga) =>
                ga.id === act.catalogId ||
                ga.title.trim().toLowerCase() === act.title.trim().toLowerCase()
            );
            if (match && !ids.includes(match.id)) {
              ids.push(match.id);
            }
          }
          setSelectedActionIds(ids);
        }
      } catch (err) {
        console.error("Failed to load catalog for template form:", err);
      } finally {
        setIsLoadingActions(false);
      }
    }

    loadCatalog();
  }, [initialData]);

  // Toggle selection of an action
  const toggleAction = (actionId: string) => {
    setSelectedActionIds((prev) =>
      prev.includes(actionId) ? prev.filter((id) => id !== actionId) : [...prev, actionId]
    );
  };

  // Build the list of bundled action objects for the preview and save payload
  const bundledActions: TemplateActionItem[] = useMemo(() => {
    return globalActions
      .filter((ga) => selectedActionIds.includes(ga.id))
      .map((ga) => ({
        catalogId: ga.id,
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

  const handleCreateInlineAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) {
      setNewActionError("Action title is required.");
      return;
    }
    if (!newActionDesc.trim()) {
      setNewActionError("Action description is required.");
      return;
    }

    try {
      const created = await createGlobalAction({
        title: newActionTitle.trim(),
        description: newActionDesc.trim(),
        category: newActionCategory,
        points: Number(newActionPoints) || 10,
      });

      const refreshed = await getGlobalActions();
      setGlobalActions(refreshed);
      setSelectedActionIds((prev) => [...prev, created.id]);

      setIsCreateActionOpen(false);
      setNewActionTitle("");
      setNewActionDesc("");
      setNewActionCategory("TRANSPORT");
      setNewActionPoints(20);
      setNewActionError(null);
    } catch (err) {
      setNewActionError(err instanceof Error ? err.message : "Failed to create action.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (!trimmedName) {
      setFormError("Template name is required.");
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

    try {
      setIsSubmitting(true);

      if (isEdit && initialData?.id) {
        const res = await updateAdminTemplate(initialData.id, {
          name: trimmedName,
          category,
          categories: [category],
          description: trimmedDesc,
          themeColor,
          actions: bundledActions,
        });
        if (!res.success) throw new Error(res.error || "Failed to update template.");
      } else {
        const res = await createAdminTemplate({
          name: trimmedName,
          category,
          categories: [category],
          description: trimmedDesc,
          themeColor,
          actions: bundledActions,
        });
        if (!res.success) throw new Error(res.error || "Failed to create template.");
      }

      router.push("/admin/admin/templates");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save template.");
    } finally {
      setIsSubmitting(false);
    }
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isEdit ? "Edit Template" : "New Challenge Template"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure reusable sustainability programs with preset durations, themes, and bundled activities.
          </p>
        </div>
      </div>

      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Unable to save template:</span> {formError}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                General Information
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sustainable Commute Week"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Sustainability Domain *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description & Program Goals *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the core purpose and objectives of this sustainability template..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Bundled Action Catalog Selector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Bundle Action Catalog ({bundledActions.length} Selected)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select actions that will automatically attach when an admin uses this template.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateActionOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Action</span>
                </button>
              </div>

              {/* Action Search & Filter inside selector */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={actionSearch}
                    onChange={(e) => setActionSearch(e.target.value)}
                    placeholder="Filter actions by keyword..."
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={actionCategoryFilter}
                  onChange={(e) => setActionCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="All">All Categories</option>
                  <option value="TRANSPORT">Transportation</option>
                  <option value="WATER">Water</option>
                  <option value="ENERGY">Energy</option>
                  <option value="RECYCLING">Waste</option>
                  <option value="FOOD">Food</option>
                </select>
              </div>

              {/* Action Cards Selection List */}
              {isLoadingActions ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading catalog actions...</div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                  {availableActions.map((act) => {
                    const isSelected = selectedActionIds.includes(act.id);
                    return (
                      <div
                        key={act.id}
                        onClick={() => toggleAction(act.id)}
                        className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected ? "bg-emerald-50/70" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                              isSelected
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 line-clamp-1">
                                {act.title}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 shrink-0">
                                {act.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {act.description}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-emerald-700 shrink-0 bg-white px-2 py-0.5 rounded border border-emerald-200">
                          +{act.points} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Theme & Preview */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Theme Accent Color
              </h2>
              <div className="grid grid-cols-4 gap-2.5">
                {THEME_PALETTES.map((theme) => {
                  const isSelected = themeColor.toLowerCase() === theme.hex.toLowerCase();
                  return (
                    <button
                      key={theme.hex}
                      type="button"
                      onClick={() => setThemeColor(theme.hex)}
                      title={theme.name}
                      className={`h-10 rounded-xl transition-all relative flex items-center justify-center shadow-xs ${
                        isSelected ? "ring-2 ring-offset-2 ring-slate-900 scale-105" : "hover:scale-102"
                      }`}
                      style={{ backgroundColor: theme.hex }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template Summary Card */}
            <div
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm border-t-4"
              style={{ borderTopColor: themeColor }}
            >
              <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Template Preview
              </h3>
              <div className="text-lg font-bold text-slate-900 mt-2">
                {name || "Untitled Template"}
              </div>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {category}
              </span>
              <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed">
                {description || "No description provided."}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                <span className="text-slate-500">Bundled Activities:</span>
                <span className="text-emerald-700 font-bold">{bundledActions.length} actions</span>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin/admin/templates"
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl text-center transition-colors shadow-2xs"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl text-center transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Inline Create Action Modal */}
      {isCreateActionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">New Global Action</h3>
              <button
                type="button"
                onClick={() => setIsCreateActionOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInlineAction} className="mt-4 space-y-4">
              {newActionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{newActionError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                  placeholder="e.g. Bring Reusable Cup"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={newActionCategory}
                    onChange={(e) => setNewActionCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white"
                  >
                    <option value="TRANSPORT">Transportation</option>
                    <option value="WATER">Water</option>
                    <option value="ENERGY">Energy</option>
                    <option value="RECYCLING">Waste</option>
                    <option value="FOOD">Food</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Points *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newActionPoints}
                    onChange={(e) => setNewActionPoints(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={newActionDesc}
                  onChange={(e) => setNewActionDesc(e.target.value)}
                  placeholder="How to complete this action..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateActionOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
