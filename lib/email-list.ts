// Pure helpers shared by the invite form (client) and the invitation server code

// Upper bound per admin submission, to stay well inside Clerk's API rate limits
export const MAX_INVITES_PER_BATCH = 200;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type InviteStatus = "invited" | "already_member" | "failed";

export type InviteResult = {
  email: string;
  status: InviteStatus;
  error?: string;
};

/**
 * Splits pasted text into unique, lowercased email addresses.
 *
 * @param raw Emails separated by commas, semicolons, whitespace, or newlines.
 * @returns Valid addresses (deduplicated, in input order) and the tokens that are not emails.
 */
export function parseEmailList(raw: string): { valid: string[]; invalid: string[] } {
  const tokens = raw
    .split(/[\s,;]+/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  const valid = [...new Set(tokens.filter((token) => EMAIL_PATTERN.test(token)))];
  const invalid = [...new Set(tokens.filter((token) => !EMAIL_PATTERN.test(token)))];
  return { valid, invalid };
}
