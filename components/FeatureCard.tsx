/**
 * File: FeatureCard.tsx
 * Author: Hadi Shaar
 * Created: 2026-05-20
 * Description: Renders a feature highlight card on the landing page.
 * Contact: shaa6718@stthomas.edu
 */

import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

/**
 * Renders a feature highlight card on the landing page.
 * @param icon A React node rendered as the card's icon.
 * @param title Short label displayed in bold.
 * @param description Supporting detail shown below the title.
 */
export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl bg-white px-4 py-4 shadow-sm">
      {icon}
      <div>
        <p className="text-[14px] font-semibold text-[#111827]">{title}</p>
        <p className="text-[12px] text-[#9ca3af]">{description}</p>
      </div>
    </div>
  );
}
