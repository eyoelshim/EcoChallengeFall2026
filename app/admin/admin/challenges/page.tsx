import React from "react";
import { Plus, Search } from "lucide-react";

export default function AdminChallengesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Challenges Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, update, and manage sustainability challenges for participating teams.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Challenge
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          Challenges management table and forms will be connected in Sprint 2.
        </p>
      </div>
    </div>
  );
}