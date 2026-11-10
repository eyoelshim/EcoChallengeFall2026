import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The console used to live at /admin/admin; keep old links and bookmarks working
      { source: "/admin/admin/:path*", destination: "/admin/:path*", permanent: true },
      // Admins and SuperAdmins share one console; SuperAdmin-only controls appear based on role
      { source: "/superadmin/:path*", destination: "/admin/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
