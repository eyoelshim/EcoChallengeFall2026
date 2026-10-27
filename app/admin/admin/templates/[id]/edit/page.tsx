"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TemplateForm from "../../TemplateForm";
import { getTemplateById, type TemplatePreset } from "@/app/admin/admin/challenges/mock-data";

interface EditTemplatePageProps {
  params: Promise<{ id: string }>;
}

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);
  const [template, setTemplate] = useState<TemplatePreset | null>(null);

  useEffect(() => {
    setMounted(true);
    setTemplate(getTemplateById(id) || null);
  }, [id]);

  if (!mounted) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading template configuration...
      </div>
    );
  }

  if (!template) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/admin/templates"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to templates
        </Link>
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
          <h2 className="text-lg font-bold text-slate-900">Template Not Found</h2>
          <p className="text-sm text-slate-500 mt-1">
            The template with ID &ldquo;{id}&rdquo; could not be found.
          </p>
          <Link
            href="/admin/admin/templates"
            className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Return to Templates Directory
          </Link>
        </div>
      </div>
    );
  }

  return <TemplateForm initialData={template} isEdit={true} />;
}
