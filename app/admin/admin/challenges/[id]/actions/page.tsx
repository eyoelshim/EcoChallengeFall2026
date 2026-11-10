/**
 * @file page.tsx
 * @author Uyen Thy Duong
 * @date Fall 2026
 * @purpose Admin challenge action configuration page with strict One-Way Flow
 *   between the centralized Global Action Catalog and isolated challenge actions.
 */

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
  Globe,
  Lock,
} from "lucide-react";
import {
  getChallengeDetailForActions,
  getChallengeActions,
  addActionToChallenge,
  updateChallengeAction,
  removeActionFromChallenge,
  getGlobalActions,
  contributeActionToGlobalCatalog,
  type ChallengeActionItem,
  type GlobalActionItem,
  type ChallengeDetailSummary,
} from "@/app/actions/admin-actions";

interface CategoryOption {
  readonly value: string;
  readonly label: string;
}

interface CategoryBadgeConfig {
  readonly label: string;
  readonly style: string;
}

const CATEGORIES: readonly CategoryOption[] = [
  { value: "TRANSPORT", label: "Transportation" },
  { value: "WATER", label: "Water" },
  { value: "ENERGY", label: "Energy" },
  { value: "RECYCLING", label: "Waste" },
  { value: "FOOD", label: "Food" },
];

/**
 * Returns label and Tailwind CSS class styling for a category badge.
 *
 * @param categoryKey - Raw database action category string
 * @returns Category badge configuration containing label and style classes
 */
function getCategoryBadge(categoryKey: string): CategoryBadgeConfig {
  switch (categoryKey) {
    case "TRANSPORT":
    case "Transportation":
      return {
        label: "Transportation",
        style: "bg-blue-50 text-blue-700 ring-blue-200",
      };
    case "WATER":
    case "Water":
      return {
        label: "Water",
        style: "bg-cyan-50 text-cyan-700 ring-cyan-200",
      };
    case "ENERGY":
    case "Energy":
      return {
        label: "Energy",
        style: "bg-amber-50 text-amber-700 ring-amber-200",
      };
    case "RECYCLING":
    case "Waste":
    case "Waste & Recycling":
      return {
        label: "Waste",
        style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      };
    case "FOOD":
    case "Food":
      return {
        label: "Food",
        style: "bg-purple-50 text-purple-700 ring-purple-200",
      };
    default:
      return {
        label: categoryKey,
        style: "bg-slate-100 text-slate-700 ring-slate-200",
      };
  }
}

/**
 * Challenge action configuration management page for administrative users.
 *
 * @param props - Page route params containing challenge ID promise
 * @returns React JSX element rendering action inventory and modal controllers
 */
export default function ChallengeActionsPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}): React.JSX.Element {
  const { id: challengeId } = use(params);

  const [challenge, setChallenge] = useState<ChallengeDetailSummary | null>(
    null,
  );
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [actions, setActions] = useState<ChallengeActionItem[]>([]);
  const [globalCatalog, setGlobalCatalog] = useState<GlobalActionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Modal display controllers
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState<boolean>(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>("");
  const [editingAction, setEditingAction] =
    useState<ChallengeActionItem | null>(null);
  const [deleteConfirmAction, setDeleteConfirmAction] =
    useState<ChallengeActionItem | null>(null);

  // Form field state
  const [formTitle, setFormTitle] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("TRANSPORT");
  const [formPoints, setFormPoints] = useState<number>(15);
  const [formDescription, setFormDescription] = useState<string>("");
  const [addToGlobalCatalog, setAddToGlobalCatalog] = useState<boolean>(false);
  const [contributeToGlobalOnEdit, setContributeToGlobalOnEdit] =
    useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  /**
   * Loads challenge metadata and associated actions from the database.
   */
  const loadChallengeAndActions = useCallback(async (): Promise<void> => {
    try {
      const [challengeData, challengeActionData] = await Promise.all([
        getChallengeDetailForActions(challengeId),
        getChallengeActions(challengeId),
      ]);
      setChallenge(challengeData);
      setActions(challengeActionData);
    } catch (caughtError) {
      console.error("Failed to load challenge actions:", caughtError);
    } finally {
      setHasMounted(true);
    }
  }, [challengeId]);

  useEffect(() => {
    loadChallengeAndActions();
  }, [loadChallengeAndActions]);

  /**
   * Fetches reusable actions from the master Global Action Catalog.
   */
  const loadCatalog = async (): Promise<void> => {
    try {
      const catalogData = await getGlobalActions();
      setGlobalCatalog(catalogData);
    } catch (caughtError) {
      console.error("Failed to load catalog:", caughtError);
    }
  };

  /**
   * Displays a temporary success toast notification.
   *
   * @param message - Notification text to present
   */
  const showToast = (message: string): void => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  /**
   * Opens modal to author a new challenge-specific action with catalog toggle.
   */
  const openAddModal = (): void => {
    setEditingAction(null);
    setFormTitle("");
    setFormCategory("TRANSPORT");
    setFormPoints(15);
    setFormDescription("");
    setAddToGlobalCatalog(false);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  /**
   * Opens modal to edit local overrides for an existing challenge action.
   *
   * @param actionItem - Selected challenge action to configure
   */
  const openEditModal = (actionItem: ChallengeActionItem): void => {
    setEditingAction(actionItem);
    setFormTitle(actionItem.title);
    setFormCategory(actionItem.category);
    setFormPoints(actionItem.points);
    setFormDescription(actionItem.description);
    setContributeToGlobalOnEdit(false);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  /**
   * Submits custom action creation or local point/title override update.
   *
   * @param formEvent - Form submission event
   */
  const handleSaveAction = async (
    formEvent: React.FormEvent,
  ): Promise<void> => {
    formEvent.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Action title is required.");
      return;
    }
    if (formPoints <= 0) {
      setFormError("Point value must be greater than zero.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingAction) {
        // One-Way flow update: updates local overrides on ChallengeAction link
        const updateResult = await updateChallengeAction(
          editingAction.actionCatalogId,
          challengeId,
          {
            title: formTitle.trim(),
            category: formCategory,
            points: Number(formPoints),
            description: formDescription.trim(),
            contributeToGlobal: contributeToGlobalOnEdit,
          },
        );

        if (!updateResult.success) {
          throw new Error(updateResult.error || "Failed to update action.");
        }

        showToast(
          contributeToGlobalOnEdit
            ? `Updated action and published "${formTitle.trim()}" to Global Catalog.`
            : `Updated isolated action "${formTitle.trim()}".`,
        );
      } else {
        // Creation of new challenge action (with optional catalog contribution)
        const addResult = await addActionToChallenge(challengeId, {
          title: formTitle.trim(),
          category: formCategory,
          points: Number(formPoints),
          description: formDescription.trim(),
          addToGlobalCatalog,
        });

        if (!addResult.success) {
          throw new Error(addResult.error || "Failed to create action.");
        }

        showToast(
          addToGlobalCatalog
            ? `Added "${formTitle.trim()}" to challenge and Global Catalog.`
            : `Added challenge-only action "${formTitle.trim()}".`,
        );
      }

      await loadChallengeAndActions();
      setIsFormModalOpen(false);
    } catch (caughtError) {
      setFormError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to save action.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Promotes a challenge-only action to the Global Action Catalog.
   *
   * @param actionItem - Target challenge action to publish
   */
  const handleContributeAction = async (
    actionItem: ChallengeActionItem,
  ): Promise<void> => {
    try {
      const contributionResult = await contributeActionToGlobalCatalog(
        actionItem.actionCatalogId,
        challengeId,
      );

      if (contributionResult.success) {
        await loadChallengeAndActions();
        showToast(
          `Contributed "${actionItem.title}" to the Global Action Catalog.`,
        );
      } else {
        alert(
          contributionResult.error || "Failed to contribute action to catalog.",
        );
      }
    } catch (caughtError) {
      console.error("Failed to contribute action:", caughtError);
    }
  };

  /**
   * Removes an action from the current challenge without deleting the catalog item.
   */
  const handleDelete = async (): Promise<void> => {
    if (!deleteConfirmAction) {
      return;
    }

    try {
      setIsSubmitting(true);
      const removeResult = await removeActionFromChallenge(
        challengeId,
        deleteConfirmAction.actionCatalogId,
      );

      if (removeResult.success) {
        await loadChallengeAndActions();
        showToast(`Removed action "${deleteConfirmAction.title}".`);
        setDeleteConfirmAction(null);
      } else {
        alert(removeResult.error || "Failed to remove action.");
      }
    } catch (caughtError) {
      console.error("Failed to remove action:", caughtError);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * One-click attaches an action from the Global Catalog to the active challenge.
   *
   * @param catalogItem - Global action to attach
   */
  const handleAttachFromCatalog = async (
    catalogItem: GlobalActionItem,
  ): Promise<void> => {
    try {
      const attachResult = await addActionToChallenge(challengeId, {
        catalogId: catalogItem.id,
        title: catalogItem.title,
        description: catalogItem.description,
        category: catalogItem.category,
        points: catalogItem.points,
      });

      if (attachResult.success) {
        await loadChallengeAndActions();
        showToast(`Attached "${catalogItem.title}" from catalog.`);
      } else {
        alert(attachResult.error || "Failed to attach action from catalog.");
      }
    } catch (caughtError) {
      console.error("Failed to attach action from catalog:", caughtError);
    }
  };

  const filteredActions = useMemo(() => {
    return actions.filter((actionItem) => {
      const matchesCategory =
        categoryFilter === "All" || actionItem.category === categoryFilter;
      const normalizedQuery = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !normalizedQuery ||
        actionItem.title.toLowerCase().includes(normalizedQuery) ||
        actionItem.description.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });
  }, [actions, categoryFilter, searchQuery]);

  const totalPointsPool = useMemo(() => {
    return actions.reduce(
      (runningSum, actionItem) => runningSum + actionItem.points,
      0,
    );
  }, [actions]);

  if (!hasMounted) {
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
          <h2 className="text-lg font-bold text-slate-900">
            Challenge Not Found
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            The challenge with ID &ldquo;{challengeId}&rdquo; could not be
            found.
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
            href={`/admin/admin/challenges/${challengeId}`}
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
            Configure custom sustainability activities and isolated point
            overrides for this sprint without mutating the Global Catalog.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setCatalogSearchQuery("");
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
            <span className="text-sm font-medium text-slate-500">
              Configured Actions
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900">
              {actions.length}
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Activities available in this sprint
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total Points Available
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 ring-1 ring-purple-100">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-purple-700">
              {totalPointsPool} pts
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Maximum points per daily round
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Primary Domain
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-slate-900">
              {challenge.category || "General"}
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Categorical focus area
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search actions by title or description..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Category:
          </span>
          {["All", ...CATEGORIES.map((cat) => cat.value)].map(
            (categoryName) => {
              const categoryLabel =
                categoryName === "All"
                  ? "All"
                  : CATEGORIES.find((cat) => cat.value === categoryName)
                      ?.label || categoryName;
              return (
                <button
                  key={categoryName}
                  type="button"
                  onClick={() => setCategoryFilter(categoryName)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === categoryName
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {categoryLabel}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Actions Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Challenge Actions ({filteredActions.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              One-Way flow active: Point and title customizations remain
              isolated to this challenge.
            </p>
          </div>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full ring-1 ring-emerald-200">
            One-Way Decoupled
          </span>
        </div>

        {filteredActions.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">
              No actions found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery || categoryFilter !== "All"
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
                  <th className="px-5 py-3">Library Scope</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActions.map((actionItem) => {
                  const badge = getCategoryBadge(actionItem.category);
                  const isOverridden =
                    actionItem.pointsOverride !== null &&
                    actionItem.pointsOverride !== undefined;

                  return (
                    <tr
                      key={actionItem.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {actionItem.title}
                        </div>
                        {actionItem.titleOverride && (
                          <div className="text-[11px] text-slate-400">
                            Base: {actionItem.baseTitle}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${badge.style}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-600">
                            +{actionItem.points} pts
                          </span>
                          {isOverridden && (
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                              title={`Catalog base: ${actionItem.basePoints} pts`}
                            >
                              Override
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {actionItem.isGlobal ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                            <Globe className="w-3 h-3 text-slate-500" />
                            Global Catalog
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 ring-1 ring-amber-200">
                              <Lock className="w-3 h-3 text-amber-600" />
                              Challenge Only
                            </span>
                            <button
                              type="button"
                              onClick={() => handleContributeAction(actionItem)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                              title="Contribute this action to the Global Action Catalog"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              Contribute
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                        {actionItem.description || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(actionItem)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit action overrides"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmAction(actionItem)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove from challenge"
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
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingAction
                    ? "Edit Challenge Action"
                    : "Add Custom Action"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingAction
                    ? "Adjust local point value and title overrides for this challenge."
                    : "Define a new action specifically for this challenge or contribute globally."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* One-Way Architecture Callout */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 flex items-start gap-2.5 text-xs text-emerald-900">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold">One-Way Flow Isolation</span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Modifications made here affect only this challenge. The Global
                  Action Catalog and other challenges remain unchanged.
                </p>
              </div>
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
                  value={formTitle}
                  onChange={(event) => setFormTitle(event.target.value)}
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
                    value={formCategory}
                    onChange={(event) => setFormCategory(event.target.value)}
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
                    value={formPoints}
                    onChange={(event) =>
                      setFormPoints(
                        Math.max(1, parseInt(event.target.value, 10) || 1),
                      )
                    }
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
                  value={formDescription}
                  onChange={(event) => setFormDescription(event.target.value)}
                  placeholder="Briefly explain what qualifies as completing this action..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Contribution Checkbox on Create */}
              {!editingAction && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addToGlobalCatalog}
                      onChange={(event) =>
                        setAddToGlobalCatalog(event.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-slate-800">
                        Add this action to the Global Action Catalog
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        If checked, this action is contributed into the master
                        catalog for all challenges. If unchecked, it remains
                        private to this challenge.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Contribution Option on Edit for Challenge-Only actions */}
              {editingAction && !editingAction.isGlobal && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contributeToGlobalOnEdit}
                      onChange={(event) =>
                        setContributeToGlobalOnEdit(event.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-slate-800">
                        Contribute this action to the Global Catalog
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Promote this challenge-specific action to the master
                        library so other challenges can discover and attach it.
                      </p>
                    </div>
                  </label>
                </div>
              )}

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
                  {isSubmitting
                    ? "Saving..."
                    : editingAction
                      ? "Save Local Overrides"
                      : "Create Action"}
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
                <h3 className="text-base font-bold text-slate-900">
                  Remove Challenge Action?
                </h3>
                <p className="text-xs text-rose-600 font-medium">
                  This will detach the action from this challenge
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to remove{" "}
              <strong className="text-slate-900">
                {deleteConfirmAction.title}
              </strong>{" "}
              (+{deleteConfirmAction.points} pts)?
              {deleteConfirmAction.isGlobal && (
                <span className="block mt-1 text-xs text-slate-500">
                  The action will remain available in the Global Action Catalog.
                </span>
              )}
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
                {isSubmitting ? "Removing..." : "Remove Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT FROM GLOBAL CATALOG MODAL (1-Click Import) */}
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
                  1-Click select reusable actions from the master library to
                  attach to {challenge.name}.
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
                value={catalogSearchQuery}
                onChange={(event) => setCatalogSearchQuery(event.target.value)}
                placeholder="Search catalog actions by title or description..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Catalog List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-96">
              {globalCatalog.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No actions currently available in the Global Catalog.
                </div>
              ) : (
                globalCatalog
                  .filter((catalogItem) => {
                    if (!catalogSearchQuery.trim()) {
                      return true;
                    }
                    const query = catalogSearchQuery.toLowerCase();
                    return (
                      catalogItem.title.toLowerCase().includes(query) ||
                      catalogItem.description.toLowerCase().includes(query)
                    );
                  })
                  .map((catalogItem) => {
                    const isAlreadyAttached = actions.some(
                      (actionItem) =>
                        actionItem.actionCatalogId === catalogItem.id ||
                        actionItem.title.toLowerCase() ===
                          catalogItem.title.toLowerCase(),
                    );
                    const badge = getCategoryBadge(catalogItem.category);

                    return (
                      <div
                        key={catalogItem.id}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm">
                              {catalogItem.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ring-1 ${badge.style}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {catalogItem.description ||
                              "No description provided."}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md ring-1 ring-emerald-200">
                            +{catalogItem.points} pts
                          </span>

                          {isAlreadyAttached ? (
                            <span className="text-xs font-semibold text-slate-400 px-3 py-1.5 bg-slate-100 rounded-lg cursor-not-allowed">
                              ✓ Attached
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleAttachFromCatalog(catalogItem)
                              }
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
                            >
                              + Attach
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
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
