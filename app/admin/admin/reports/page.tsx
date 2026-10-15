"use client";

import React, { useState } from "react";
import { Download, TrendingUp, Leaf, Award, CheckCircle2 } from "lucide-react";

interface CategoryMetric {
  name: string;
  percentage: number;
  actions: number;
  co2SavedKg: number;
  colorClass: string;
  badgeClass: string;
}

const CATEGORY_DATA: CategoryMetric[] = [
  {
    name: "Transportation",
    percentage: 42,
    actions: 596,
    co2SavedKg: 180,
    colorClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  {
    name: "Waste & Recycling",
    percentage: 28,
    actions: 398,
    co2SavedKg: 95,
    colorClass: "bg-blue-500",
    badgeClass: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  {
    name: "Energy Conservation",
    percentage: 18,
    actions: 256,
    co2SavedKg: 74,
    colorClass: "bg-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    name: "Water Conservation",
    percentage: 12,
    actions: 170,
    co2SavedKg: 35,
    colorClass: "bg-cyan-500",
    badgeClass: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  },
];

export default function ReportsPage() {
  const [downloadNotice, setDownloadNotice] = useState(false);

  const handleExportCsv = () => {
    const rows = CATEGORY_DATA.map((item) => ({
      Category: item.name,
      ParticipationPercentage: `${item.percentage}%`,
      ActionsLogged: item.actions,
      EstimatedCO2PreventedKg: item.co2SavedKg,
    }));

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const val = row[header as keyof typeof row] ?? "";
            const escaped = String(val).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `greenstep-participation-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Participation Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Summary metrics, environmental impact, and category engagement breakdowns.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Participation CSV report downloaded successfully.</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Actions Logged</span>
            <div className="p-2.5 rounded-lg text-purple-600 bg-purple-50 ring-1 ring-purple-100">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-slate-900">1,420</span>
            <p className="text-xs text-emerald-600 font-medium mt-1">↑ +14% vs last week</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Estimated CO2 Prevented</span>
            <div className="p-2.5 rounded-lg text-emerald-600 bg-emerald-50 ring-1 ring-emerald-100">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-slate-900">384 kg</span>
            <p className="text-xs text-emerald-600 font-medium mt-1">Equivalent to 16 trees planted</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Active Participation Rate</span>
            <div className="p-2.5 rounded-lg text-blue-600 bg-blue-50 ring-1 ring-blue-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-slate-900">78.4%</span>
            <p className="text-xs text-emerald-600 font-medium mt-1">Across 3 active campus groups</p>
          </div>
        </div>
      </div>

      {/* Unified Category Breakdown Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900">Category Participation Breakdown</h2>
          <p className="text-xs text-slate-500 mt-1">
            Distribution of logged actions by sustainability theme.
          </p>
        </div>

        <div className="space-y-6">
          {CATEGORY_DATA.map((cat) => (
            <div key={cat.name} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{cat.name}</span>
                  <span className="text-xs text-slate-400">
                    ({cat.actions} actions · {cat.co2SavedKg} kg CO2)
                  </span>
                </div>
                <span className="font-bold text-slate-900">{cat.percentage}%</span>
              </div>

              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${cat.colorClass}`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}