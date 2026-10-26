"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Building2 } from "lucide-react";
import { createMockGroup, type DepartmentGroup } from "../mock-data";
import { createDepartment, type department} from "../../../../actions/admin-groups";

const inputClass =
  "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors";

export default function CreateGroupPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [activeChallenge, setActiveChallenge] = useState("Campus Sustainability Challenge");
  const [createdGroup, setCreatedGroup] = useState<DepartmentGroup | null>(null);
  const [createdDepartment, setCreatedDepartment] = useState<department | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (!trimmedName) {
      setError("Please provide a department or group name.");
      return;
    }
    if (!trimmedDesc) {
      setError("Please provide a brief description.");
      return;
    }

    const newGroup = await createDepartment({
      name: trimmedName,
      description: trimmedDesc,
      //activeChallenge: activeChallenge.trim() || undefined,
    });

    setCreatedDepartment(newGroup);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setActiveChallenge("Campus Sustainability Challenge");
    setCreatedGroup(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/admin/admin/groups"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Departments
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create Department / Group
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Set up a new campus department or group to participate in eco-challenges.
        </p>
      </div>

      {createdDepartment ? (
        <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Department Created Successfully
              </h2>
              <p className="text-sm text-slate-500">
                Saved in demo state. This department is now available for challenge assignments.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Department Name:</span>
              <span className="font-semibold text-slate-900">{createdDepartment.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Active Challenge:</span>
              <span className="text-slate-700">{/*createdDepartment.activeChallenge*/} None</span>
            </div>
            <div className="pt-2 text-xs text-slate-500 border-t border-slate-200">
              {createdDepartment.description}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/admin/admin/groups"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              View All Departments
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Create Another Group
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm"
        >
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="dept-name" className="block text-sm font-medium text-slate-700">
              Department / Group Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="dept-name"
              type="text"
              required
              placeholder="e.g. School of Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dept-challenge" className="block text-sm font-medium text-slate-700">
              Initial Active Challenge
            </label>
            <input
              id="dept-challenge"
              type="text"
              placeholder="e.g. Water Challenge"
              value={activeChallenge}
              onChange={(e) => setActiveChallenge(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dept-desc" className="block text-sm font-medium text-slate-700">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="dept-desc"
              rows={4}
              required
              placeholder="Describe the department or group participants..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/admin/admin/groups"
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              Save Department
            </button>
          </div>
        </form>
      )}
    </div>
  );
}