"use client";

import React, { use, useState, useEffect, useMemo } from "react";
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
  getMockChallenge,
  getChallengeActions,
  addChallengeAction,
  updateChallengeAction,
  deleteChallengeAction,
  CHALLENGE_CATEGORIES,
  type Challenge,
  type ChallengeActionItem,
  type ChallengeCategory,
} from "../../mock-data";

export default function ChallengeActionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [actions, setActions] = useState<ChallengeActionItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ChallengeActionItem | null>(null);
  const [deleteConfirmAction, setDeleteConfirmAction] = useState<ChallengeActionItem | null>(null);

  // Form field states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Transportation");
  const [points, setPoints] = useState(15);
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const found = getMockChallenge(id);
    if (found) {
      setChallenge(found);
      setActions(getChallengeActions(id));
      if (found.category && CHALLENGE_CATEGORIES.includes(found.category as ChallengeCategory)) {
        setCategory(found.category);
      }
    }
  }, [id]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const openAddModal = () => {
    setEditingAction(null);
    setTitle("");
    setCategory(challenge?.category || "Transportation");
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

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Action title is required.");
      return;
    }
    if (points <= 0) {
      setFormError("Point value must be greater than zero.");
      return;
    }

    if (editingAction) {
      updateChallengeAction(editingAction.id, {
        title: title.trim(),
        category,
        points: Number(points),
        description: description.trim(),
      });
      showToast(`Updated action "${title.trim()}".`);
    } else {
      addChallengeAction(id, {
        title: title.trim(),
        category,
        points: Number(points),
        description: description.trim(),
      });
      showToast(`Added action "${title.trim()}".`);
    }

    setActions(getChallengeActions(id));
    setIsFormModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteConfirmAction) return;
    deleteChallengeAction(deleteConfirmAction.id);
    setActions(getChallengeActions(id));
    showToast(`Removed action "${deleteConfirmAction.title}".`);
    setDeleteConfirmAction(null);
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

  if (!challenge) {
    return (
      <div className="p-12 text-center text-sm text-slate-500">
        Loading challenge action configuration...
      </div>
    );
  }

  const categoryBadgeColors: Record<string, string> = {
    Transportation: "bg-blue-50 text-blue-700 ring-blue-200",
    Energy: "bg-amber-50 text-amber-700 ring-amber-200",
    Waste: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Food: "bg-purple-50 text-purple-700 ring-purple-200",
    Water: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    "Campus-wide": "bg-slate-100 text-slate-700 ring-slate-200",
  };

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
              Manage Actions · {challenge.title}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
              {challenge.code}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure custom sustainability activities and point rewards participants can log for this sprint.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Custom Action
        </button>
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
            <span className="text-xl font-bold text-slate-900">{challenge.category}</span>
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
          {["All", ...CHALLENGE_CATEGORIES].map((cat) => (
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
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Actions Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Challenge Actions ({filteredActions.length})
          </h2>
          <span className="text-xs text-slate-500">
            Admins can add, modify, or remove actions at any time.
          </span>
        </div>

        {filteredActions.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No actions found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {search || categoryFilter !== "All"
                ? "No challenge actions match your search query or filter."
                : "No actions have been added to this challenge yet. Click 'Add Custom Action' to create your first activity."}
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
                  <th className="px-5 py-3.5">Action Title & Description</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5 text-right">Points</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActions.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 max-w-md">
                      <div className="font-semibold text-slate-900">{act.title}</div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {act.description || "No specific instructions provided."}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
                          categoryBadgeColors[act.category] || "bg-slate-100 text-slate-700 ring-slate-200"
                        }`}
                      >
                        {act.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                        +{act.points} pts
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(act)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Edit Action"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmAction(act)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Action"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingAction ? "Edit Challenge Action" : "Add Custom Challenge Action"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Attached to sprint: <span className="font-semibold">{challenge.title}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAction} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Action Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Bike or Walk to Campus"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {CHALLENGE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Reward Points *
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    step={5}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
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
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  {editingAction ? "Save Changes" : "Create Action"}
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
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm"
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
