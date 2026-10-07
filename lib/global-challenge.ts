import { db } from "@/lib/db";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";

export async function ensureGlobalChallengeExists() {
  await db.challenge.upsert({
    where: { id: GLOBAL_CHALLENGE_ID },
    update: {},
    create: {
      id: GLOBAL_CHALLENGE_ID,
      name: "GreenStep",
      code: "__GLOBAL__",
      startDate: null,
      endDate: null,
    },
  });
}
