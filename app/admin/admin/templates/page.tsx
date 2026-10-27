"use client";

import React, { useState, useEffect } from "react";
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
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import {
  getAdminTemplates,
  deleteAdminTemplate,
  type AdminTemplateItem,
} from "@/app/actions/admin-templates";

function getTemplateIcon(category: string, name: string) {
  const lower = `${category} ${name}`.toLowerCase();
  if (lower.includes("commute") || lower.includes("bike") || lower.includes("transit") || lower.includes("transport")) {
    return { icon: Bike, color: "text-blue-600 bg-blue-50 ring-blue-100", badge: "bg-blue-50 text-blue-700 ring-blue-200" };
  }
  if (lower.includes("water") || lower.includes("h2o")) {
    return { icon: Droplets, color: "text-cyan-600 bg-cyan-50 ring-cyan-100", badge: "bg-cyan-50 text-cyan-700 ring-cyan-200" };
  }
  if (lower.includes("power") || lower.includes("energy")) {
    return { icon: Zap, color: "text-amber-600 bg-amber-50 ring-amber-100", badge: "bg-amber-50 text-amber-700 ring-amber-200" };
  }
  if (lower.includes("waste") || lower.includes("recycle") || lower.includes("zero")) {
    return { icon: Recycle, color: "text-emerald-600 bg-emerald-50 ring-emerald-100", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
  }
  if (lower.includes("food") || lower.includes("meatless") || lower.includes("plant")) {
    return { icon: Salad, color: "text-purple-600 bg-purple-50 ring-purple-100", badge: "bg-purple-50 text-purple-700 ring-purple-200" };
  }
  return { icon: Sparkles, color: "text-slate-600 bg-slate-50 ring-slate-100", badge: "bg-slate-100 text-slate-700 ring-slate-200" };
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<AdminTemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<AdminTemplateItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await getAdminTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTemplate) return;
    try {
      setIsDeleting(true);
      const res = await deleteAdminTemplate(deletingTemplate.id);
      if (res.success) {
        await loadTemplates();
        showToast(`Template "${deletingTemplate.name}" deleted.`);
        setDeletingTemplate(null);
      } else {
        alert(res.error || "Failed to delete template.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Challenge Templates</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pre-configured sustainability sprint templates derived from MPCA client programs with bundled action catalogs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/admin/actions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ListChecks className="w-4 h-4 text-emerald-600" />
            <span>Action Catalog</span>
          </Link>
          <Link
            href="/admin/admin/templates/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </Link>
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-slate-500">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading challenge templates from database...
        </div>
      ) : templates.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No templates found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Create your first challenge template to bundle reusable sustainability actions for sprint launches.
          </p>
          <Link
            href="/admin/admin/templates/new"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((template: AdminTemplateItem) => {
            const meta = getTemplateIcon(template.category, template.name);
            const Icon = meta.icon;
            const isExpanded = expandedId === template.id;

            return (
              <div
                key={template.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden border-t-4"
                style={{ borderTopColor: template.themeColor || "#10B981" }}
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ring-1 ${meta.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 leading-snug">
                          {template.name}
                        </h2>
                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${meta.badge}`}>
                          {template.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/admin/templates/${template.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Template"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeletingTemplate(template)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {template.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{template.duration || "1 week"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{template.actions.length} bundled actions</span>
                    </div>
                  </div>

                  {/* Bundled Actions List (collapsible) */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => toggleExpand(template.id)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100/80 px-3 py-2 rounded-lg transition-colors"
                    >
                      <span>Preview Actions ({template.actions.length})</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {template.actions.map((act, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 border border-slate-100 text-xs"
                          >
                            <span className="font-medium text-slate-800 line-clamp-1 flex-1 pr-2">
                              {act.title}
                            </span>
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">
                              +{act.points} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {template.id.slice(0, 8)}...
                  </span>
                  <Link
                    href={`/admin/admin/challenges/new?template=${template.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-rose-50/50">
              <Trash2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 text-center">
              Delete Template?
            </h2>
            <p className="text-xs text-slate-500 text-center mt-1.5 leading-relaxed">
              Are you sure you want to delete &ldquo;{deletingTemplate.name}&rdquo;?
              Existing challenges created with this template will not be affected.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingTemplate(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
