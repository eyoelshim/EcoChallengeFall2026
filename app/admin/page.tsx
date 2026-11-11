import React from "react";
import { getAdminDashboardTelemetry } from "@/app/actions/admin-dashboard";
import DashboardView from "./DashboardView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard Overview | GreenStep Admin",
  description: "Real-time sustainability metrics, leaderboards, and recent activities.",
};

export default async function AdminDashboardPage() {
  const telemetry = await getAdminDashboardTelemetry();

  return <DashboardView telemetry={telemetry} />;
}
