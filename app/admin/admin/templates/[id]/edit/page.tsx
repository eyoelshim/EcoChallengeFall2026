import React from "react";
import { notFound } from "next/navigation";
import TemplateForm from "../../TemplateForm";
import { getTemplateById } from "@/app/admin/admin/challenges/mock-data";

interface EditTemplatePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { id } = await params;
  const template = getTemplateById(id);

  if (!template) {
    notFound();
  }

  return <TemplateForm initialData={template} isEdit={true} />;
}
