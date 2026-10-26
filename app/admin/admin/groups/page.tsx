"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, Building2, ChevronRight, Award, Check, X, Loader2 } from "lucide-react";
import { getMockGroups, type DepartmentGroup } from "./mock-data";
import { getAdminDepartments, getPendingTeamRequest, reviewTeamRequest, type department, type teamRequested} from "../../../actions/admin-groups";


interface reviewer {
  reviewerId: string;
}

export default function GroupsPage({reviewerId}: reviewer) {
  const [departments, setDepartment] = useState<department[]>([]);
  const [groups, setGroups] = useState<DepartmentGroup[]>([]);
  const [requests, setRequests] = useState<teamRequested[]>([])
  const [mounted, setMounted] = useState(false);
  const [processId, setProcessId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    async function getData() {
      const deptdata = await getAdminDepartments();
      const reqdata = await getPendingTeamRequest();
      setDepartment(deptdata as department[]);
      setRequests(reqdata as teamRequested[]);
      setGroups(getMockGroups());
    }
    getData();
  }, []);

  const review = async (id: string, actionType: "APPROVE" | "REJECT") => {
    setProcessId(id);
    await reviewTeamRequest({
        requestId: id,
        action: actionType,
        reviewerId: reviewerId
      });
  }

 
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Departments & Groups</h1>
          <p className="text-sm text-slate-500 mt-1">
            View, manage, and create campus departments and participant groups.
          </p>
        </div>

        <Link
          href="/admin/admin/groups/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </Link>
      </div>
      
      {/* pending groups grid*/}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Pending Team Creation Requests</h2>
          <p className="text-sm text-slate-500 mt-0.5">Review and approve pending team requests.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-5">Requested Team Name</th>
                <th className="py-3 px-5">Target Challenge</th>
                <th className="py-3 px-5">Requested By</th>
                <th className="py-3 px-5">Submission Date</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {mounted && requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-slate-900">{request.name}</div>
                      {request.message && (
                        <div className="text-xs text-slate-400 italic max-w-xs truncate" title={request.message}>
                          "{request.message}"
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">
                      {request.challenge?.name || "Unknown Challenge"}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="text-slate-900">{request.requestedBy?.name || "Anonymous User"}</div>
                      <div className="text-xs text-slate-400">{request.requestedBy?.email}</div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">
                      {new Date(request.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex gap-2">
                        <button
                          disabled={processId !== null}
                          onClick={() => review(request.id, "APPROVE")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 rounded-md text-xs font-semibold transition-colors"
                        >
                          {processId === request.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Approve
                        </button>
                        <button
                          disabled={processId !== null}
                          onClick={() => review(request.id, "REJECT")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50 rounded-md text-xs font-semibold transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    {!mounted ? "Connecting to Prisma DB..." : "No pending team requests found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid of groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(mounted ? departments : []).map((group) => (
          <div
            key={group.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 ring-1 ring-emerald-100">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                    {group.name}
                  </h2>
                  <span className="inline-block mt-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium ring-1 ring-emerald-200 truncate max-w-full">
                    {group._count.challenges}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                {group.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {group._count.users} {group._count.users === 1 ? "member" : "members"}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Have no measure of pts
                </span>
              </div>

              <Link
                href={`/admin/admin/groups/${group.id}`}
                className="w-full inline-flex items-center justify-between text-sm font-semibold text-emerald-600 hover:text-emerald-700 pt-1 group-hover:underline"
              >
                <span>Manage Department</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}