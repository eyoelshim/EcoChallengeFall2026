import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function isCurrentUserAdmin() {
  const user = await currentUser();
  return user?.publicMetadata?.role === "admin";
}

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  if (user.publicMetadata?.role !== "admin") redirect("/admin/unauthorized");
  return user;
}
