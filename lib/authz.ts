import { currentUser } from "@clerk/nextjs/server";

export async function isCurrentUserAdmin() {
  const user = await currentUser();
  return user?.publicMetadata?.role === "admin";
}
