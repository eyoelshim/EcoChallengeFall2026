"use client";

import React, { useState, useMemo } from "react";
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
  type GlobalAction,
  CHALLENGE_CATEGORIES,
} from "../challenges/mock-data";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; ring: string; icon: React.ElementType }> = {
  Transportation: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200", icon: Bike },
  Water: { bg: "bg-cyan-50", text: "text-cyan-700", ring: "ring-cyan-200", icon: Droplets },
  Energy: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", icon: Zap },
  Waste: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", icon: Recycle },
  Food: { bg: "bg-purple-50", text: "text-purple-700", ring: "ring-purple-200", icon: Salad },
  "Campus-wide": { bg: "bg-slate-50", text: "text-slate-700", ring: "ring-slate-200", icon: Layers },
};

type SortOption = "points-desc" | "points-asc" | "title-asc" | "newest";

export default function ActionCatalogPage() {
  const [actions, setActions] = useState<GlobalAction[]>(() => getGlobalActions());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("points-desc");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<GlobalAction | null>(null);
  const [deletingAction, setDeletingAction] = useState<GlobalAction | null>(null);

  // Form states for Create/Edit
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("Transportation");
  const [formPoints, setFormPoints] = useState(20);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenCreate = () => {
    setFormTitle("");
    setFormDescription("");
    setFormCategory("Transportation");
    setFormPoints(20);
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (action: GlobalAction) => {
    setEditingAction(action);
    setFormTitle(action.title);
    setFormDescription(action.description);
    setFormCategory(action.category);
    setFormPoints(action.points);
    setFormError(null);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
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

    const created = createGlobalAction({
      title: formTitle,
      description: formDescription,
      category: formCategory,
      points: formPoints,
    });

    setActions(getGlobalActions());
    setIsCreateOpen(false);
    showToast(`Added "${created.title}" to Global Action Catalog.`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
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

    updateGlobalAction(editingAction.id, {
      title: formTitle,
      description: formDescription,
      category: formCategory,
      points: formPoints,
    });

    setActions(getGlobalActions());
    setEditingAction(null);
    showToast(`Updated "${formTitle}".`);
  };

  const handleConfirmDelete = () => {
    if (!deletingAction) return;
    deleteGlobalAction(deletingAction.id);
    setActions(getGlobalActions());
    showToast(`Removed "${deletingAction.title}" from catalog.`);
    setDeletingAction(null);
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
        return (b.createdAt || "").localeCompare(a.createdAt || "");
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
          <p className="text-xs text-slate-400 mt-0.5">Ready for template bundling</p>
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
          {["All", ...CHALLENGE_CATEGORIES].map((cat) => {
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Points</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredActions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    <Sparkles className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No actions found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your search query or category filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredActions.map((action) => {
                  const meta = CATEGORY_COLORS[action.category] || {
                    bg: "bg-slate-50",
                    text: "text-slate-700",
                    ring: "ring-slate-200",
                    icon: Layers,
                  };
                  const CatIcon = meta.icon;

                  return (
                    <tr
                      key={action.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {action.title}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {action.description}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${meta.bg} ${meta.text} ${meta.ring}`}
                        >
                          <CatIcon className="w-3.5 h-3.5" />
                          {action.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs ring-1 ring-emerald-200/80">
                          +{action.points} pts
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(action)}
                            title="Edit Global Action"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingAction(action)}
                            title="Delete Action"
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with counts */}
        <div className="p-3 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Showing {filteredActions.length} of {actions.length} global actions
          </span>
          <span className="font-medium text-slate-600">
            GreenStep MPCA Sustainability Standards
          </span>
        </div>
      </div>

      {/* CREATE ACTION MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add New Global Action</h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Action Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Turn Off Tap While Brushing Teeth"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                    Points Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Completion Guidelines <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explain exactly what participants must do to earn these points..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Create Global Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ACTION MODAL */}
      {editingAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Edit Global Action</h2>
              <button
                type="button"
                onClick={() => setEditingAction(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Action Title <span className="text-red-500">*</span>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                    Points Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Completion Guidelines <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAction(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Global Action?</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This action will be permanently removed from the master catalog.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-900">{deletingAction.title}</div>
              <div className="text-slate-500">{deletingAction.category} &bull; {deletingAction.points} pts</div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAction(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
