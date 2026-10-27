"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Download,
  Filter,
  RotateCcw,
  CheckCircle2,
  Users,
  Award,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CATEGORY_COLORS, CATEGORY_BADGES } from "./mock-data";
import { getLiveData, getReportChallenges } from "@/app/actions/admin-reports";

const CATEGORY_OPTIONS = [
  { value: "TRANSPORT", label: "Transportation" },
  { value: "WATER", label: "Water Conservation" },
  { value: "ENERGY", label: "Energy Conservation" },
  { value: "RECYCLING", label: "Waste & Recycling" },
  { value: "FOOD", label: "Food" },
];

export default function ReportsPage() {
  const [, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [challenges, setChallenges] = useState<{ id: string; name: string }[]>([]);
  const [challengeFilter, setChallengeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [downloadNotice, setDownloadNotice] = useState(false);
  const [telemetryData, setTelemetryData] = useState<Awaited<ReturnType<typeof getLiveData>>>({
    categoryBreakdown: [],
    participationRows: [],
  });

  useEffect(() => {
    setMounted(true);
    getReportChallenges()
      .then((data) => setChallenges(data))
      .catch((err) => console.error("Failed to load report challenges:", err));
  }, []);

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getLiveData({
          challengeId: challengeFilter,
          category: categoryFilter,
          startDate: dateFrom,
          endDate: dateTo,
        });
        setTelemetryData(data);
      } catch (err) {
        console.error("Failed to fetch live reports data:", err);
      }
    });
  }, [challengeFilter, categoryFilter, dateFrom, dateTo]);

  // Aggregate actions by category for the dynamic chart
  const chartData = useMemo(() => {
    return telemetryData.categoryBreakdown.map((item) => ({
      name: item.category,
      count: item._count.id,
      color: CATEGORY_COLORS[item.category] || "#10B981",
    }));
  }, [telemetryData.categoryBreakdown]);

  const uniqueParticipantsCount = useMemo(() => {
    return new Set(telemetryData.participationRows.map((p) => p.userId)).size;
  }, [telemetryData.participationRows]);

  // Total points in filtered subset
  const totalPoints = useMemo(() => {
    return telemetryData.participationRows.reduce((acc, p) => acc + p.points, 0);
  }, [telemetryData.participationRows]);

  const hasActiveFilters = challengeFilter !== "All" || categoryFilter !== "All" || dateFrom !== "" || dateTo !== "";

  const handleResetFilters = () => {
    setChallengeFilter("All");
    setCategoryFilter("All");
    setDateFrom("");
    setDateTo("");
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams({ type: "participation" });
    if (challengeFilter && challengeFilter !== "All") params.set("challengeId", challengeFilter);
    if (categoryFilter && categoryFilter !== "All") params.set("category", categoryFilter);
    if (dateFrom) params.set("startDate", dateFrom);
    if (dateTo) params.set("endDate", dateTo);

    const exportUrl = `/api/export/csv?${params.toString()}`;
    const link = document.createElement("a");
    link.href = exportUrl;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Participation Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cross-challenge participation report with filterable records, category charts, and CSV export.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={telemetryData.participationRows.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Exporting filtered records from <strong>/api/export/csv</strong>...</span>
        </div>
      )}

      {/* Filter Toolbar (Challenge, Category, Date From, Date To) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-800 inline-flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-emerald-600" />
            Report Filters
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-3 space-y-1.5">
            <label htmlFor="challenge-filter" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Challenge
            </label>
            <select
              id="challenge-filter"
              value={challengeFilter}
              onChange={(e) => setChallengeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="All">All Challenges</option>
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label htmlFor="category-filter" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Category
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label htmlFor="date-from" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              From Date
            </label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label htmlFor="date-to" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              To Date
            </label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={telemetryData.participationRows.length === 0}
              className="w-full h-10 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards for the filtered subset */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Filtered Actions</span>
            <div className="p-2.5 rounded-lg text-emerald-600 bg-emerald-50 ring-1 ring-emerald-100">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {telemetryData.participationRows.length}
            </span>
            <p className="text-xs text-slate-400 mt-1">Actions in selected view</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Active Participants</span>
            <div className="p-2.5 rounded-lg text-blue-600 bg-blue-50 ring-1 ring-blue-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {uniqueParticipantsCount}
            </span>
            <p className="text-xs text-slate-400 mt-1">Distinct users logged</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Points Logged</span>
            <div className="p-2.5 rounded-lg text-amber-600 bg-amber-50 ring-1 ring-amber-100">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {totalPoints.toLocaleString()}
            </span>
            <p className="text-xs text-slate-400 mt-1">Points accumulated</p>
          </div>
        </div>
      </div>

      {/* Category Bar Chart (Recharts) */}
      {chartData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-base font-bold text-slate-900">Actions by Category</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of action completions by sustainability category in the current filtered set.
            </p>
          </div>

          {mounted ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                    height={50}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E2E8F0",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "0.875rem",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full flex items-center justify-center text-slate-400 text-sm">
              Loading chart...
            </div>
          )}
        </div>
      )}

      {/* Filterable Participation Results Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Results ({telemetryData.participationRows.length} {telemetryData.participationRows.length === 1 ? "record" : "records"})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed event completions matching the selected criteria.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Challenge
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {telemetryData.participationRows.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    <Link
                      href={`/admin/admin/users/${p.userId}`}
                      className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold"
                    >
                      {p.user?.name || "NA"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/admin/challenges/${p.challengeId}`}
                      className="text-slate-800 hover:text-emerald-700 hover:underline"
                    >
                      {p.challenge?.name || "NA"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-800 whitespace-nowrap font-medium">
                    {p.actionType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${
                        CATEGORY_BADGES[p.category] || "bg-slate-100 text-slate-700 ring-slate-200"
                      }`}
                    >
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">
                    {new Date(p.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs max-w-xs truncate">
                    {p.note || "—"}
                  </td>
                </tr>
              ))}
              {telemetryData.participationRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No records match your filters. Try resetting the challenge or date filters above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
