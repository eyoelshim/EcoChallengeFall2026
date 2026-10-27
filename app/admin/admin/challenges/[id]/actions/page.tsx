"use client";

import React, { use, useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Award,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Target,
} from "lucide-react";
import {
  getChallengeDetailForActions,
  getChallengeActions,
  addActionToChallenge,
  updateChallengeAction,
  removeActionFromChallenge,
  getGlobalActions,
  type ChallengeActionItem,
  type GlobalActionItem,
} from "@/app/actions/admin-actions";

const CATEGORIES = [
  { value: "TRANSPORT", label: "Transportation" },
  { value: "WATER", label: "Water" },
  { value: "ENERGY", label: "Energy" },
  { value: "RECYCLING", label: "Waste" },
  { value: "FOOD", label: "Food" },
];

function getCategoryBadge(cat: string): { label: string; style: string } {
  switch (cat) {
    case "TRANSPORT":
    case "Transportation":
      return { label: "Transportation", style: "bg-blue-50 text-blue-700 ring-blue-200" };
    case "WATER":
    case "Water":
      return { label: "Water", style: "bg-cyan-50 text-cyan-700 ring-cyan-200" };
    case "ENERGY":
    case "Energy":
      return { label: "Energy", style: "bg-amber-50 text-amber-700 ring-amber-200" };
    case "RECYCLING":
    case "Waste":
    case "Waste & Recycling":
      return { label: "Waste", style: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
    case "FOOD":
    case "Food":
      return { label: "Food", style: "bg-purple-50 text-purple-700 ring-purple-200" };
    default:
      return { label: cat, style: "bg-slate-100 text-slate-700 ring-slate-200" };
  }
}

export default function ChallengeActionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [challenge, setChallenge] = useState<{
    id: string;
    name: string;
    code: string;
    category: string | null;
    themeColor: string | null;
    status: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [actions, setActions] = useState<ChallengeActionItem[]>([]);
  const [globalCatalog, setGlobalCatalog] = useState<GlobalActionItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [editingAction, setEditingAction] = useState<ChallengeActionItem | null>(null);
  const [deleteConfirmAction, setDeleteConfirmAction] = useState<ChallengeActionItem | null>(null);

  // Form field states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("TRANSPORT");
  const [points, setPoints] = useState(15);
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadChallengeAndActions = useCallback(async () => {
    try {
      const [chData, actData] = await Promise.all([
        getChallengeDetailForActions(id),
        getChallengeActions(id),
      ]);
      setChallenge(chData);
      setActions(actData);
    } catch (err) {
      console.error("Failed to load challenge actions:", err);
    } finally {
      setMounted(true);
    }
  }, [id]);

  useEffect(() => {
    loadChallengeAndActions();
  }, [loadChallengeAndActions]);

  const loadCatalog = async () => {
    try {
      const catalog = await getGlobalActions();
      setGlobalCatalog(catalog);
    } catch (err) {
      console.error("Failed to load catalog:", err);
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const openAddModal = () => {
    setEditingAction(null);
    setTitle("");
    setCategory("TRANSPORT");
    setPoints(15);
    setDescription("");
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (act: ChallengeActionItem) => {
    setEditingAction(act);
    setTitle(act.title);
    setCategory(act.category);
    setPoints(act.points);
    setDescription(act.description);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Action title is required.");
      return;
    }
    if (points <= 0) {
      setFormError("Point value must be greater than zero.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingAction) {
        const res = await updateChallengeAction(editingAction.actionCatalogId, id, {
          title: title.trim(),
          category,
          points: Number(points),
          description: description.trim(),
        });
        if (!res.success) throw new Error(res.error || "Failed to update action");
        showToast(`Updated action "${title.trim()}".`);
      } else {
        const res = await addActionToChallenge(id, {
          title: title.trim(),
          category,
          points: Number(points),
          description: description.trim(),
        });
        if (!res.success) throw new Error(res.error || "Failed to create action");
        showToast(`Added action "${title.trim()}".`);
      }

      await loadChallengeAndActions();
      setIsFormModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmAction) return;
    try {
      setIsSubmitting(true);
      const res = await removeActionFromChallenge(id, deleteConfirmAction.actionCatalogId);
      if (res.success) {
        await loadChallengeAndActions();
        showToast(`Removed action "${deleteConfirmAction.title}".`);
        setDeleteConfirmAction(null);
      } else {
        alert(res.error || "Failed to remove action.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachFromCatalog = async (ga: GlobalActionItem) => {
    try {
      const res = await addActionToChallenge(id, {
        catalogId: ga.id,
        title: ga.title,
        description: ga.description,
        category: ga.category,
        points: ga.points,
      });
      if (res.success) {
        await loadChallengeAndActions();
        showToast(`Attached "${ga.title}" to challenge.`);
      } else {
        alert(res.error || "Failed to attach action.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredActions = useMemo(() => {
    return actions.filter((act) => {
      const matchesCategory = categoryFilter === "All" || act.category === categoryFilter;
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        act.title.toLowerCase().includes(query) ||
        act.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [actions, categoryFilter, search]);

  const totalPointsPool = useMemo(() => {
    return actions.reduce((sum, a) => sum + a.points, 0);
  }, [actions]);

  if (!mounted) {
    return (
      <div className="p-12 text-center text-sm text-slate-500">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading challenge action configuration from database...
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/admin/challenges"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to challenges
        </Link>
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
          <h2 className="text-lg font-bold text-slate-900">Challenge Not Found</h2>
          <p className="text-sm text-slate-500 mt-1">
            The challenge with ID &ldquo;{id}&rdquo; could not be found.
          </p>
          <Link
            href="/admin/admin/challenges"
            className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Return to Challenges List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={`/admin/admin/challenges/${id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Challenge Detail
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Manage Actions · {challenge.name}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
              {challenge.code}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure custom sustainability activities and point rewards participants can log for this sprint.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setCatalogSearch("");
              loadCatalog();
              setIsCatalogModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Import from Catalog
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Custom Action
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Configured Actions</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900">{actions.length}</span>
            <p className="text-xs text-slate-500 mt-0.5">Activities available in this sprint</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Points Available</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 ring-1 ring-purple-100">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-purple-700">{totalPointsPool} pts</span>
            <p className="text-xs text-slate-500 mt-0.5">Maximum points per daily round</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Primary Domain</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-slate-900">{challenge.category || "General"}</span>
            <p className="text-xs text-slate-500 mt-0.5">Categorical focus area</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions by title or description..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Category:</span>
          {["All", ...CATEGORIES.map((c) => c.value)].map((cat) => {
            const label = cat === "All" ? "All" : CATEGORIES.find((c) => c.value === cat)?.label || cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Challenge Actions ({filteredActions.length})
          </h2>
          <span className="text-xs text-slate-500">
            Stored and synchronized with Neon database.
          </span>
        </div>

        {filteredActions.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No actions found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {search || categoryFilter !== "All"
                ? "No challenge actions match your search query or filter."
                : "No actions have been added to this challenge yet. Click 'Add Custom Action' or 'Import from Catalog' to configure activities."}
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Action
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Action Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Points</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActions.map((act) => {
                  const badge = getCategoryBadge(act.category);
                  return (
                    <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {act.title}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${badge.style}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-emerald-600 whitespace-nowrap">
                        +{act.points} pts
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 max-w-md truncate">
                        {act.description || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(act)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit action"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmAction(act)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete action"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Action Modal */}
      {isFormModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingAction ? "Edit Challenge Action" : "Add Custom Action"}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Action Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unplug Idle Lab Equipment"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Points *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={points}
                    onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Logging Instructions
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly explain what qualifies as completing this action..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingAction ? "Save Changes" : "Create Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Challenge Action?</h3>
                <p className="text-xs text-rose-600 font-medium">This will remove the action from this challenge</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to remove{" "}
              <strong className="text-slate-900">{deleteConfirmAction.title}</strong> (+{deleteConfirmAction.points} pts)?
              Participants will no longer be able to log new completions for this activity.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAction(null)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Removing..." : "Delete Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT FROM GLOBAL CATALOG MODAL */}
      {isCatalogModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Import from Global Action Catalog
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select reusable MPCA actions to attach to {challenge.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search catalog actions by title or description..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Catalog List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-96">
              {globalCatalog
                .filter((ga) => {
                  if (!catalogSearch.trim()) return true;
                  const q = catalogSearch.toLowerCase();
                  return (
                    ga.title.toLowerCase().includes(q) ||
                    ga.description.toLowerCase().includes(q)
                  );
                })
                .map((ga) => {
                  const alreadyAdded = actions.some(
                    (a) => a.actionCatalogId === ga.id || a.title.toLowerCase() === ga.title.toLowerCase()
                  );
                  const badge = getCategoryBadge(ga.category);
                  return (
                    <div
                      key={ga.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">
                            {ga.title}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ring-1 ${badge.style}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {ga.description || "No description provided."}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md ring-1 ring-emerald-200">
                          +{ga.points} pts
                        </span>

                        {alreadyAdded ? (
                          <span className="text-xs font-semibold text-slate-400 px-3 py-1.5 bg-slate-100 rounded-lg cursor-not-allowed">
                            ✓ Attached
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAttachFromCatalog(ga)}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
                          >
                            + Attach
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
