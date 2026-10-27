"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Bike,
  Droplets,
  Zap,
  Recycle,
  Salad,
  Layers,
} from "lucide-react";
import {
  getGlobalActions,
  createGlobalAction,
  updateGlobalAction,
  deleteGlobalAction,
  type GlobalActionItem,
} from "@/app/actions/admin-actions";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; ring: string; icon: React.ElementType }> = {
  TRANSPORT: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200", icon: Bike },
  WATER: { bg: "bg-cyan-50", text: "text-cyan-700", ring: "ring-cyan-200", icon: Droplets },
  ENERGY: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", icon: Zap },
  RECYCLING: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", icon: Recycle },
  FOOD: { bg: "bg-purple-50", text: "text-purple-700", ring: "ring-purple-200", icon: Salad },
  Transportation: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200", icon: Bike },
  Water: { bg: "bg-cyan-50", text: "text-cyan-700", ring: "ring-cyan-200", icon: Droplets },
  Energy: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", icon: Zap },
  Waste: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", icon: Recycle },
  Food: { bg: "bg-purple-50", text: "text-purple-700", ring: "ring-purple-200", icon: Salad },
  "Campus-wide": { bg: "bg-slate-50", text: "text-slate-700", ring: "ring-slate-200", icon: Layers },
};

function getCategoryDisplay(cat: string): { label: string; icon: React.ElementType; style: { bg: string; text: string; ring: string } } {
  const meta = CATEGORY_COLORS[cat] || { bg: "bg-slate-50", text: "text-slate-700", ring: "ring-slate-200", icon: Layers };
  let label = cat;
  if (cat === "TRANSPORT") label = "Transportation";
  if (cat === "RECYCLING") label = "Waste & Recycling";
  if (cat === "WATER") label = "Water";
  if (cat === "ENERGY") label = "Energy";
  if (cat === "FOOD") label = "Food";
  return { label, icon: meta.icon, style: meta };
}

const CATEGORY_FILTER_OPTIONS = [
  { value: "All", label: "All" },
  { value: "TRANSPORT", label: "Transportation" },
  { value: "WATER", label: "Water" },
  { value: "ENERGY", label: "Energy" },
  { value: "RECYCLING", label: "Waste" },
  { value: "FOOD", label: "Food" },
];

type SortOption = "points-desc" | "points-asc" | "title-asc" | "newest";

export default function ActionCatalogPage() {
  const [actions, setActions] = useState<GlobalActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("points-desc");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<GlobalActionItem | null>(null);
  const [deletingAction, setDeletingAction] = useState<GlobalActionItem | null>(null);

  // Form states for Create/Edit
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("TRANSPORT");
  const [formPoints, setFormPoints] = useState(20);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadActions = async () => {
    try {
      setIsLoading(true);
      const data = await getGlobalActions();
      setActions(data);
    } catch (err) {
      console.error("Failed to load global action catalog:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenCreate = () => {
    setFormTitle("");
    setFormDescription("");
    setFormCategory("TRANSPORT");
    setFormPoints(20);
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (action: GlobalActionItem) => {
    setEditingAction(action);
    setFormTitle(action.title);
    setFormDescription(action.description);
    setFormCategory(action.category);
    setFormPoints(action.points);
    setFormError(null);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Action title is required.");
      return;
    }
    if (!formDescription.trim()) {
      setFormError("Action description is required.");
      return;
    }
    if (formPoints < 1) {
      setFormError("Point value must be at least 1.");
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createGlobalAction({
        title: formTitle,
        description: formDescription,
        category: formCategory,
        points: formPoints,
      });

      await loadActions();
      setIsCreateOpen(false);
      showToast(`Added "${created.title}" to Global Action Catalog.`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create action.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction) return;

    if (!formTitle.trim()) {
      setFormError("Action title is required.");
      return;
    }
    if (!formDescription.trim()) {
      setFormError("Action description is required.");
      return;
    }
    if (formPoints < 1) {
      setFormError("Point value must be at least 1.");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateGlobalAction(editingAction.id, {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        points: formPoints,
      });

      await loadActions();
      setEditingAction(null);
      showToast(`Updated "${formTitle}".`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update action.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAction) return;
    try {
      setIsSubmitting(true);
      const res = await deleteGlobalAction(deletingAction.id);
      if (res.success) {
        await loadActions();
        showToast(`Removed "${deletingAction.title}" from catalog.`);
        setDeletingAction(null);
      } else {
        alert(res.error || "Failed to delete action.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered and sorted action list
  const filteredActions = useMemo(() => {
    return actions
      .filter((a) => {
        if (categoryFilter !== "All" && a.category !== categoryFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "points-desc") return b.points - a.points;
        if (sortBy === "points-asc") return a.points - b.points;
        if (sortBy === "title-asc") return a.title.localeCompare(b.title);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [actions, search, categoryFilter, sortBy]);

  // Aggregate stats
  const totalPoints = useMemo(() => actions.reduce((sum, a) => sum + a.points, 0), [actions]);
  const avgPoints = actions.length > 0 ? Math.round(totalPoints / actions.length) : 0;
  const categoriesCount = useMemo(() => new Set(actions.map((a) => a.category)).size, [actions]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Global Action Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Master library of reusable sustainability actions. Admins can bundle these into challenge templates or attach them directly to active sprints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/admin/templates"
            className="px-3.5 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Manage Templates
          </Link>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Global Action</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Total Catalog Actions
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{actions.length}</div>
          <p className="text-xs text-slate-400 mt-0.5">Stored in Neon database</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Categories Covered
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{categoriesCount}</div>
          <p className="text-xs text-slate-400 mt-0.5">Transportation, Water, Energy, Waste, Food</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Average Point Weight
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{avgPoints} pts</div>
          <p className="text-xs text-slate-400 mt-0.5">Per action completion</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actions by title or description..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="points-desc">Points: High to Low</option>
              <option value="points-asc">Points: Low to High</option>
              <option value="title-asc">Title: A &rarr; Z</option>
              <option value="newest">Newest Added</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Category:</span>
          {CATEGORY_FILTER_OPTIONS.map((cat) => {
            const active = categoryFilter === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategoryFilter(cat.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-slate-500">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading global actions from database...
        </div>
      ) : filteredActions.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900">No actions found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search keywords or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActions.map((act) => {
            const display = getCategoryDisplay(act.category);
            const Icon = display.icon;
            return (
              <div
                key={act.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${display.style.bg} ${display.style.text} ${display.style.ring}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{display.label}</span>
                    </span>
                    <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                      +{act.points} pts
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-3 leading-snug">
                    {act.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                    {act.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Linked in <strong>{act.challengeCount ?? 0}</strong> challenges
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(act)}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                      title="Edit Action"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingAction(act)}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Action"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Create Global Action</h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Action Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Cold Water Wash"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                    Reward Points *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formPoints}
                    onChange={(e) => setFormPoints(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Completion Description *
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe what participants must do to earn these points..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save to Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Edit Global Action</h2>
              <button
                type="button"
                onClick={() => setEditingAction(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Action Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                    Reward Points *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formPoints}
                    onChange={(e) => setFormPoints(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Completion Description *
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAction(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Update Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-rose-50/50">
              <Trash2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 text-center">
              Delete Global Action
            </h2>
            <p className="text-xs text-slate-500 text-center mt-1.5 leading-relaxed">
              Are you sure you want to remove &ldquo;{deletingAction.title}&rdquo; from the catalog?
              Challenges that currently attach this action will have it unlinked.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingAction(null)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg transition-colors"
              >
                Keep Action
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
