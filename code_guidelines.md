# GreenStep: Coding Standards & Code Construction Guidelines

**Fall 2026 Edition — Senior Capstone (CISC480)**  
**Project:** Eco Challenge
**Tech Stack:** Next.js 15 (App Router), TypeScript 5, React 19, Prisma ORM (PostgreSQL), Clerk Authentication, Tailwind CSS  
**Authors & Contributors:** Uyen Thy Duong, Ebin Thomas, Eyoel Shimeles, Anna Mary Southern

---

## Quick Reference Checklist (Before Commit)

- [ ] Format with Prettier (80 char width, 2 spaces, double quotes " ")
- [ ] Wrap individual statements at column 70–80 (no long unwrapped lines)
- [ ] Use named exports only (export function / const), except Next.js page.tsx/layout.tsx
- [ ] Explicitly annotate return types on all functions and methods (: Promise<T>, : void, etc.)
- [ ] Add JSDoc routine header comments explaining parameters, return values, and architectural intent
- [ ] Follow naming conventions (lowerCamelCase for vars/functions, UpperCamelCase for
      types/components)
- [ ] Use descriptive, searchable names (avoid cryptic data, temp, res, c, d)
- [ ] Prefer interface over type for object shapes; forbid any (use unknown or concrete types)
- [ ] Functions have a single responsibility; decompose complex logic into focused helper methods
- [ ] Validate inputs and handle errors defensively at system boundaries (Server Actions & API routes)
- [ ] No debugging artifacts (zero console.log, commented-out dead code, or temporary mock flags)
- [ ] Branch created as type/short-description (e.g., feat/leaderboard, fix/auth-redirect)
- [ ] One logical change per commit with imperative message under 50 characters
- [ ] Code builds and lint checks pass cleanly (npm run build, npm run lint)

# Phase 1: Align and Research

During Phase 1, our team reviewed our active repository (`GreenStep`), audited our commit log and pull request discussions, and evaluated industry-standard style guides to establish a common technical foundation.

## 1.1 Review of Team Code Samples and Version Control System

An automated and manual audit of the 83 TypeScript and TSX files across `app/`, `components/`, and `lib/` revealed key areas where individual habits differed significantly:

| Dimension                              | Observed Variations Across Team                                                                                                                                                                               | Impact on Project & Team Velocity                                                                                   |
| :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------ |
| **String Delimiters**                  | 82 files use double quotes (`" "`), while single quotes (`' '`) appeared sporadically in string literals, array items, and UI error messages (e.g., in `mock-data.ts`, `lib/csv.ts`).                         | Causes unnecessary Git diff churn when different developers' formatters touch the same file.                        |
| **Module Exports**                     | 41 files used `export default` while 31 files used named `export const/function`. Notably, large UI components like `DashboardClient.tsx` used default exports, whereas `FeatureCard.tsx` used named exports. | Inconsistent auto-imports across VS Code; default exports make large-scale renaming and refactoring dangerous.      |
| **Function Signatures & Return Types** | Server Actions (`app/actions/challenge.ts`) and API routes (`app/api/stats/route.ts`) frequently omitted explicit return type annotations, while `lib/categories.ts` explicitly typed them.                   | Developers must infer return shapes by reading routine internals; silent type drift during database migrations.     |
| **Documentation & JSDoc**              | Only 9 out of 83 files began with a file-level JSDoc header. Routine headers were absent in critical Server Actions (`admin-actions.ts`), leaving parameters and database mutations undocumented.             | Onboarding delays; ambiguity regarding routine side-effects, permissions, and validation preconditions.             |
| **Statement Wrapping & Line Length**   | Over 1,567 lines across the codebase exceed 80 characters, with some complex ternary operators and Server Action signatures stretching beyond 118 columns (e.g., `lib/categories.ts`).                        | Requires horizontal scrolling on laptop screens and split-screen GitHub pull request diffs, hindering code reviews. |
| **Routine Sizing & Decomposition**     | Core client components swelled into monolithic mega-files (e.g., `DashboardClient.tsx` at 2,079 lines), containing mixed concerns (modals, charts, state machines, math).                                     | High risk of regression; difficult to write unit tests or isolate state synchronization bugs.                       |
| **Git Branching Conventions**          | Branch names varied wildly: `anna_mary/36_live_action_completions_&_real_CSV_exports` (included ampersands and capital letters), `EbinChallengesDB`, and `thy/fix_minor_issue`.                               | Inconsistent CI/CD triggers; branches cannot be cleanly categorized into features, bugfixes, or maintenance tasks.  |

## 1.2 Key Differences Decided On

### Decision 1: String Delimiters — Enforce Double Quotes (`" "`) Universally

- **Debate:** Whether to use single quotes (`'string'`) or double quotes (`"string"`).
- **Consensus & Resolution:** We unanimously adopt **double quotes (`"`)** for all TypeScript string literals, import statements, and JSX attributes.
- **Rationale:**
  1. **JSX/HTML Natural Fit:** React JSX attributes conventionally require double quotes (e.g., `<div className="flex px-4">`). Using double quotes everywhere eliminates constant mental context-switching between JS expressions and JSX markup.
  2. **Apostrophes in English Copy:** Our application displays user-facing text containing contractions (e.g., `"Earth's ecosystems"`, `"User's department"`, `"Couldn't load actions"`). Double-quoted strings allow natural punctuation without awkward backslash escaping (`\'`).
  3. **Existing Codebase Gravity:** 82 out of 83 files in our repository already use double quotes in their import statements. Aligning with the majority prevents thousands of lines of cosmetic Git diff noise.

### Decision 2: Export Strategy — Strict Named Exports with Framework Exceptions

- **Debate:** Whether to use `export default` or named exports `export function / export const`.
- **Consensus & Resolution:** Prohibit default exports across all shared components, helper modules, Server Actions, and utilities. Default exports are **only permitted** where mandated by Next.js App Router conventions (`page.tsx`, `layout.tsx`, `not-found.tsx`, `error.tsx`).
- **Rationale:** Default exports obscure symbol names, make grep/search across the codebase unreliable, and degrade automated IDE refactoring. Named exports enforce canonical, unmistakable naming project-wide.

### Decision 3: Statement Wrapping at Column 70–80

- **Debate:** Whether to permit wide lines up to 120 columns or strictly wrap at column 70–80.
- **Consensus & Resolution:** Enforce statement wrapping at column 70–80 (Prettier `printWidth: 80`).
- **Rationale:** Steve McConnell notes that lines wrapped around column 70–80 can be comfortably read in side-by-side terminal splits, mobile reviews, and printed code walkthroughs without line-truncation or wrap disorientation.

### Decision 4: Routine Header Comments vs. Intent Explanations

- **Debate:** Should every single helper have an extensive JSDoc block, or should comments focus only on "why"?
- **Consensus & Resolution:** Synthesize both principles:
  1. Every non-trivial routine and exported component must feature a **routine header block** documenting purpose, inputs, outputs, and side-effects (McConnell, p. 393).
  2. Inline implementation comments must explain the **intent and bigger architectural plan**, strictly avoiding mechanical restatements of obvious code (McConnell, p. 391).

---

## 1.3 Industry Standards Selections and Rationales

Our team formally adopts three respected industry standards, tailored to the GreenStep architecture:

```
+-------------------------------------------------------------------------------+
|                        GreenStep Coding Standards                             |
+-------------------------------------------------------------------------------+
        |                                       |
        v                                       v
+-------------------------------+       +-------------------------------+
| Google TypeScript Style Guide |       | Steve McConnell: Code Complete|
| (Industry Language Standard)  |       | (Software Construction & Q/A) |
| - Named Exports (§3.4)        |       | - Column 70-80 Wrapping (p388)|
| - lowerCamelCase Naming (§5.2)|       | - Intent over Mechanics (p391)|
| - Explicit Types & Interfaces |       | - Routine Header Blocks (p393)|
+-------------------------------+       +-------------------------------+
                                \       /
                                 v     v
                        +-------------------------------+
                        |   GitHub Flow & Conventional  |
                        | (Collaborative Version Control)|
                        | - Branch: type/short-desc     |
                        | - Imperative commits < 50 char|
                        | - 100% PR Peer Code Reviews   |
                        +-------------------------------+
```

### 1. Google TypeScript Style Guide (Google, 2024)

- **Citation:** Google. (2024). _Google TypeScript Style Guide_. https://google.github.io/styleguide/tsguide.html
- **Why It Fits Our Project:** GreenStep is built on TypeScript 5 and React 19. The Google TypeScript Style Guide provides battle-tested guidance on TypeScript's modern features, strictly banning error-prone legacy habits (such as `any`, namespace declarations, and uncontrolled default exports), while specifying clear identifier casings (`UpperCamelCase` for types, `lowerCamelCase` for functions/variables, `CONSTANT_CASE` for global values).

### 2. Code Complete: A Practical Handbook of Software Construction (McConnell, 2004)

- **Citation:** McConnell, S. (2004). _Code Complete_ (2nd ed.). Microsoft Press / ProQuest Ebook Central.
- **Why It Fits Our Project:** While language style guides govern syntax, McConnell's classic text governs the _craft of code construction_. Specifically:
  - **Page 388, Bullet 2:** Recommends wrapping individual statements at column 70 so that code remains readable across varied editor viewports and printouts.
  - **Page 391, Bullet 2:** Emphasizes writing comments that capture the intent and broader architectural goals of code rather than repeating what the syntax already says.
  - **Page 393, Bullet 1:** Recommends consistent header block comments for routines to establish contracts, parameter semantics, and operational assumptions.

### 3. GitHub Flow and Conventional Commits Specification (2023)

- **Citation:** Conventional Commits. (2023). _Conventional Commits v1.0.0_. https://www.conventionalcommits.org/
- **Why It Fits Our Project:** With four developers committing concurrently across database migrations, Server Actions, and client components, strict Git hygiene prevents merge train bottlenecks, enables clean squash-merges, and ensures our release changelog remains auditable.

---

# Phase 2: The Top 12 Team Coding Guidelines

Below are the **Top 12 ratified coding and construction rules** for the GreenStep project. Each rule includes its source citation, the core intent behind it, and concrete examples taken directly from our repository.

---

### Rule 1: Use Named Exports; Prohibit Default Exports (Except Framework Route Handlers)

- **Standard & Citation:** Google TypeScript Style Guide §3.4 ("Use named exports in all code... Do not use default exports").
- **Intent Behind the Rule:** Default exports allow any importer to arbitrarily rename the imported symbol (e.g., `import Foo from "./Bar"`), leading to naming divergence, broken full-text search, and clumsy IDE refactoring. Named exports guarantee a single canonical name across the entire codebase.
- **Framework Exception:** Next.js App Router route entry points (`page.tsx`, `layout.tsx`, `not-found.tsx`, `error.tsx`) require default exports by framework convention. All internal UI components, utility libraries, and Server Actions must use named exports.

#### Project Examples:

❌ **Incorrect (Client Component using Default Export):**

```tsx
// app/(dashboard)/dashboard/DashboardClient.tsx
export default function DashboardClient({
  initialUser,
  stats,
}: DashboardProps) {
  // Impedes named search and encourages inconsistent naming when imported
  return <div>...</div>;
}
```

✅ **Correct (Named Export for Modular Component):**

```tsx
// app/(dashboard)/dashboard/DashboardClient.tsx (or components/dashboard/DashboardClient.tsx)
export function DashboardClient({ initialUser, stats }: DashboardProps) {
  return <div>...</div>;
}

// In app/(dashboard)/dashboard/page.tsx:
import { DashboardClient } from "./DashboardClient";
```

---

### Rule 2: Provide Routine Header Block Comments and Document Intent Rather Than Mechanics

- **Standard & Citation:** Steve McConnell, _Code Complete_, ProQuest Ebook Central, p. 391 bullet 2 & p. 393 bullet 1; Google TS Style Guide §4.5.
- **Intent Behind the Rule:** Comments that simply narrate what the code does (e.g., `// increment i`) add clutter without insight. High-value comments describe the **intent, architectural rationale, preconditions, side effects, and parameter semantics**. Every exported function must include a JSDoc routine header block.

#### Project Examples:

❌ **Incorrect (Mechanical or Missing Comments in Server Action):**

```ts
// app/actions/challenge.ts
// function to create a challenge
export async function createChallenge(data: { name: string; startDate?: Date; endDate?: Date }) {
  const { userId } = await auth();
  // check if userId is null
  if (!userId) throw new Error("Unauthorized");
  // generate a code
  let code = "";
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (await db.challenge.findUnique({ where: { code } }));
  ...
}
```

✅ **Correct (JSDoc Header Explaining Intent, Contracts, and Side Effects):**

```ts
// app/actions/challenge.ts
/**
 * Provisions a new company sustainability challenge and automatically enrolls
 * the creating administrator as an initial participant.
 *
 * @param input Challenge creation payload containing the display title and active date range.
 * @returns The newly persisted Challenge record.
 * @throws {Error} "Unauthorized" if unauthenticated; "Forbidden" if non-admin;
 *                 "Challenge name is required" if title is blank.
 *
 * Intent: We generate a 6-character collision-resistant alphanumeric code
 * so employee teams can effortlessly join via mobile without complex invite links.
 */
export async function createChallenge(
  input: CreateChallengeInput
): Promise<Challenge> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!(await isCurrentUserAdmin())) throw new Error("Forbidden");
  ...
}
```

---

### Rule 3: Enforce `lowerCamelCase` for Variables, Parameters, Functions, Methods, and Properties

- **Standard & Citation:** Google TypeScript Style Guide §5.2 ("Rules by identifier type: lowerCamelCase for variables, parameters, functions, methods, and properties").
- **Intent Behind the Rule:** Uniform identifier casing provides immediate semantic cues: uppercase indicates classes/types, all-caps indicate compile-time constants, and lowerCamelCase indicates variables, attributes, and execution routines.

#### Project Examples:

❌ **Incorrect (Snake_case, PascalCase for variables, inconsistent casing):**

```ts
// app/admin/admin/challenges/[id]/actions/page.tsx
const Challenge_Id = params.id;
const Action_list = await getActions(Challenge_Id);
function Handle_Click(User_Input: string) { ... }
```

✅ **Correct (Consistent lowerCamelCase across identifiers):**

```ts
// app/admin/admin/challenges/[id]/actions/page.tsx
const challengeId = params.id;
const actionList = await getActions(challengeId);
function handleClick(userInput: string): void { ... }
```

---

### Rule 4: Use Descriptive, Searchable Identifier Names (Avoid Cryptic Abbreviations)

- **Standard & Citation:** Google TypeScript Style Guide §5.1 ("Naming - Identifiers must be descriptive; avoid abbreviations unless universally understood").
- **Intent Behind the Rule:** Names like `data`, `res`, `temp`, `c`, or `val` force developers to read the implementation to determine the shape and meaning of the data. Descriptive names make code self-documenting and easy to search across large codebases.

#### Project Examples:

❌ **Incorrect (Vague, cryptic names):**

```ts
// app/api/stats/route.ts
const d = new Date();
const res = await db.user.findUnique({ where: { clerkId: userId } });
const c = await db.actionCompletion.findMany({ where: { userId: res.id } });
return NextResponse.json({ d, c });
```

✅ **Correct (Self-descriptive domain terminology):**

```ts
// app/api/stats/route.ts
const currentDate = new Date();
const targetUser = await db.user.findUnique({ where: { clerkId: userId } });
if (!targetUser)
  return NextResponse.json({ error: "User not found" }, { status: 404 });

const userCompletions = await db.actionCompletion.findMany({
  where: { userId: targetUser.id },
});
return NextResponse.json({ currentDate, userCompletions });
```

---

### Rule 5: Never Commit Directly to `main`; Use `type/short-description` Branches and Reviewed PRs

- **Standard & Citation:** GitHub Flow Documentation; Conventional Commits v1.0.0.
- **Intent Behind the Rule:** Pushing directly to `main` risks breaking the live application, triggers unexpected build failures in production (Vercel), and bypasses team discussion. Branch naming like `type/short-description` communicates the exact purpose of every branch and enables smooth collaboration.

#### Naming Convention:

`type/short-description` where `type` is one of:

- `feat/` — New feature or capability
- `fix/` — Bugfix or regression remedy
- `docs/` — Documentation, guidelines, or QA runbooks
- `refactor/` — Code restructuring with no behavioral change
- `chore/` — Dependency upgrades, build configuration, tooling

#### Project Examples:

❌ **Incorrect (Non-standard branch naming, direct commits):**

```bash
# Branch names with author prefixes, spaces, ampersands, or no type:
git checkout -b anna_mary/36_live_action_completions_&_real_CSV_exports
git checkout -b EbinChallengesDB
git checkout -b thy/fix_minor_issue
git commit -m "fixed stuff"
git push origin main  # STRIKE: Never push to main!
```

✅ **Correct (Structured branch naming with reviewed Pull Request):**

```bash
git checkout -b feat/stream-csv-export
git commit -m "feat(reports): stream real-time CSV exports for challenge logs"
git push origin feat/stream-csv-export
# Open GitHub Pull Request -> Assign 1 peer reviewer -> Merge upon approval
```

---

### Rule 6: Decompose Complex Logic into Concise, Focused Helper Methods

- **Standard & Citation:** Steve McConnell, _Code Complete_ (Modular decomposition, Single Responsibility Principle); Google TS Style Guide §3.3.
- **Intent Behind the Rule:** Monolithic routines containing database queries, date calculations, validation, and UI transforms are difficult to read, nearly impossible to unit test, and prone to hidden side effects. Extracting concise helper methods isolates bugs and makes each step testable in isolation.

#### Project Examples:

❌ **Incorrect (Date-bucketing math inlined inside a 100-line route handler):**

```ts
// app/api/stats/route.ts
export async function GET(req: Request) {
  ...
  // Inlined date calculation logic mixed with database fetching
  if (range === "week") {
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const from = new Date(monday);
      from.setDate(monday.getDate() + i);
      const to = new Date(from);
      to.setHours(23, 59, 59, 999);
      buckets.push({ label: getDayLabel(from), from, to });
    }
  }
  ...
}
```

✅ **Correct (Isolated, testable helper functions in `lib/date-utils.ts`):**

```ts
// lib/date-utils.ts
export interface DateRangeBucket {
  readonly label: string;
  readonly fromDate: Date;
  readonly toDate: Date;
}

/**
 * Computes seven 24-hour UTC boundary buckets beginning on the Monday
 * of the reference week.
 */
export function buildWeeklyBuckets(referenceDate: Date): DateRangeBucket[] {
  const dayOfWeek = referenceDate.getDay();
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const fromDate = new Date(monday);
    fromDate.setDate(monday.getDate() + index);
    const toDate = new Date(fromDate);
    toDate.setHours(23, 59, 59, 999);

    return {
      label: getWeekdayAbbreviation(fromDate),
      fromDate,
      toDate,
    };
  });
}
```

---

### Rule 7: Standardize on Double Quotes (`"`) for All String Literals and JSX Attributes

- **Standard & Citation:** Google TypeScript Style Guide §4.2 ("Strings - Choose one style and be consistent"); Prettier Specification.
- **Intent Behind the Rule:** Eliminate formatting discrepancies between TypeScript files, prevent syntax switching between JSX attributes (`className="..."`) and string variables, and allow effortless use of apostrophes in English UI text without backslash escapes.

#### Project Examples:

❌ **Incorrect (Single quotes requiring awkward backslash escaping):**

```ts
// Inconsistent quote style with escaped contractions
const noticeMessage = "You haven't logged any sustainable actions today.";
const exportStatus = "Action catalog couldn't be loaded.";
```

✅ **Correct (Clean double quotes with unescaped apostrophes):**

```ts
// Double quotes allow natural apostrophes and align with JSX attributes
const noticeMessage = "You haven't logged any sustainable actions today.";
const exportStatus = "Action catalog couldn't be loaded.";
return <button className="rounded-lg bg-emerald-600 px-3 py-1.5">{noticeMessage}</button>;
```

---

### Rule 8: Wrap Individual Statements and Lines at Column 70–80

- **Standard & Citation:** Steve McConnell, _Code Complete_, ProQuest p. 388, bullet 2 ("Wrap individual statements at column 70 or so so that they don't wrap onto the next line"); Prettier `printWidth: 80`.
- **Intent Behind the Rule:** Statements exceeding 80 columns overflow standard split-screen editor views, require horizontal scrolling in GitHub pull request diffs, and obscure secondary parameters or chained method calls.

#### Project Examples:

❌ **Incorrect (Unwrapped 118-character single-line ternary / conditionals):**

```ts
// lib/categories.ts
if (upper.includes("TRANS") || upper.includes("BIKE") || upper.includes("COMMUT")) return ActionCategory.TRANSPORT;
if (upper.includes("ENERGY") || upper.includes("POWER") || upper.includes("ELEC")) return ActionCategory.ENERGY;

// app/actions/admin-actions.ts
export async function getGlobalActions(filters?: { search?: string; category?: string }): Promise<GlobalActionItem[]> {
```

✅ **Correct (Wrapped multi-line structure adhering to 80 columns):**

```ts
// lib/categories.ts
const isTransportKeyword =
  upper.includes("TRANS") ||
  upper.includes("BIKE") ||
  upper.includes("COMMUT");

if (isTransportKeyword) {
  return ActionCategory.TRANSPORT;
}

// app/actions/admin-actions.ts
export async function getGlobalActions(
  filters?: ActionQueryFilters
): Promise<GlobalActionItem[]> {
  ...
}
```

---

### Rule 9: Explicitly Annotate Return Types on All Functions and Methods

- **Standard & Citation:** Google TypeScript Style Guide §3.2 ("Explicit Types - Function signatures must explicitly declare return types"); McConnell, p. 393.
- **Intent Behind the Rule:** Omitting return types causes the TypeScript compiler to infer returns implicitly. An accidental modification inside a helper or Server Action can unintentionally alter the return shape without producing a compiler error at the definition site, causing cascading runtime failures in consumer components.

#### Project Examples:

❌ **Incorrect (Implicit return types in Server Actions and helpers):**

```ts
// lib/authz.ts
export async function isCurrentUserAdmin() {
  return isAdminUser(await currentUser());
}

// app/actions/challenge.ts
export async function joinChallenge(code: string) {
  // Returns different shapes implicitly or throws uncaught errors
  const challenge = await db.challenge.findUnique({ where: { code } });
  return challenge;
}
```

✅ **Correct (Explicit return type annotations):**

```ts
// lib/authz.ts
export async function isCurrentUserAdmin(): Promise<boolean> {
  return isAdminUser(await currentUser());
}

// app/actions/challenge.ts
export async function joinChallenge(
  invitationCode: string,
): Promise<ChallengeMembershipResult> {
  const challenge = await db.challenge.findUnique({
    where: { code: invitationCode.toUpperCase() },
  });
  if (!challenge) {
    throw new Error("Invalid challenge invitation code.");
  }
  return { success: true, challengeId: challenge.id };
}
```

---

### Rule 10: Prefer `interface` Over `type` for Object Shapes and Forbid the `any` Escape Hatch

- **Standard & Citation:** Google TypeScript Style Guide §3.1 & §3.2 ("Interfaces vs Type Aliases: Prefer interface for object shapes... Avoid `any`; use `unknown` if the type is truly dynamic").
- **Intent Behind the Rule:** TypeScript `interface` declarations provide clearer compiler error diagnostics, support declaration merging, and yield better build-time performance. The `any` type disables all static type-checking, nullifying the guarantees of TypeScript.

#### Project Examples:

❌ **Incorrect (Using `type` alias for objects, using `any`):**

```ts
// Bad: type alias for extensible data structure, loose any typing
type UserProfilePayload = {
  rawMetadata: any;
  preferences: Record<string, any>;
};
```

✅ **Correct (Strongly typed `interface` with structured unknown/generics):**

```ts
export interface UserPreferences {
  readonly emailNotificationsEnabled: boolean;
  readonly defaultChallengeFilter: string;
}

export interface UserProfilePayload {
  readonly rawMetadata: Record<string, unknown>;
  readonly preferences: UserPreferences;
}
```

---

### Rule 11: Defend System Boundaries with Explicit Input Validation and Typed Errors

- **Standard & Citation:** Google TypeScript Style Guide §3.5; OWASP Secure Coding Practices; McConnell, Chapter 8 ("Defensive Programming").
- **Intent Behind the Rule:** Never trust data arriving across network boundaries (API route bodies, query parameters, form submissions, or Server Action arguments). Validate boundary data immediately before passing it to database queries or authorization routines.

#### Project Examples:

❌ **Incorrect (Unvalidated input leading to potential crashes or SQL/Prisma injections):**

```ts
// app/actions/admin-actions.ts
export async function createGlobalAction(data: any) {
  await requireAdmin();
  // Blindly saving input without sanity checks
  return db.actionCatalog.create({
    data: {
      title: data.title,
      points: data.points,
      category: data.category,
    },
  });
}
```

✅ **Correct (Defensive boundary validation with normalized constraints):**

```ts
// app/actions/admin-actions.ts
export interface CreateActionCatalogInput {
  readonly title: string;
  readonly description?: string;
  readonly category: string;
  readonly points: number;
}

export async function createGlobalAction(
  input: CreateActionCatalogInput,
): Promise<GlobalActionItem> {
  await requireAdmin();

  const trimmedTitle = input.title?.trim();
  if (!trimmedTitle || trimmedTitle.length < 3) {
    throw new Error("Action title must be at least 3 characters in length.");
  }

  const sanitizedPoints = Math.max(
    1,
    Math.min(1000, Number(input.points) || 10),
  );
  const verifiedCategory = normalizeActionCategory(input.category);

  const createdAction = await db.actionCatalog.create({
    data: {
      title: trimmedTitle,
      description: input.description?.trim() || null,
      category: verifiedCategory,
      points: sanitizedPoints,
    },
  });

  revalidatePath("/admin/admin/actions");
  return formatActionItem(createdAction);
}
```

---

### Rule 12: Maintain Strict Git Hygiene and Zero Debugging Debris in Production Code

- **Standard & Citation:** Conventional Commits v1.0.0; Google Engineering Practices ("Code Health").
- **Intent Behind the Rule:** Debugging artifacts like `console.log`, commented-out "ghost" blocks, and temporary test flags bloat bundle size, leak sensitive user metadata to browser consoles, and create confusion during maintenance.

#### Project Examples:

❌ **Incorrect (Debugging artifacts left in production PR):**

```tsx
export default async function Dashboard() {
  const user = await currentUser();
  console.log("Logged in user clerkId:", user?.id); // SENSITIVE LEAK
  // const tempFlag = true;
  // if (tempFlag) redirect("/maintenance");

  return <div>{/* <h1>Old Title</h1> */} ...</div>;
}
```

✅ **Correct (Clean, purposeful production code):**

```tsx
export async function Dashboard() {
  const authenticatedUser = await requireAuthenticatedUser();
  return <DashboardView user={authenticatedUser} />;
}
```

---

# Quick-Review Checklist (Before Every Commit & PR)

Developers must review this checklist prior to pushing commits or requesting peer review:

```markdown
### Pre-Commit & Pull Request Checklist

#### Category A: Formatting & Layout

- [ ] Code is formatted with Prettier (`printWidth: 80`, `tabWidth: 2`, `semi: true`).
- [ ] Double quotes (`"`) are used universally for strings, imports, and JSX attributes.
- [ ] No single lines or statements exceed column 70–80.
- [ ] No trailing whitespace or inconsistent line breaks.

#### Category B: Naming & Semantics

- [ ] Variables, parameters, functions, and properties use `lowerCamelCase`.
- [ ] Components, interfaces, types, and classes use `UpperCamelCase`.
- [ ] Global compile-time constants use `CONSTANT_CASE`.
- [ ] Identifiers are descriptive and searchable (no `data`, `temp`, `c`, `val`).

#### Category C: Commenting & Documentation

- [ ] File begins with a standardized JSDoc file header (File, Author, Date, Purpose).
- [ ] Every non-trivial function has a JSDoc routine header (@param, @returns, @throws).
- [ ] Comments explain the **intent and architectural plan**, not mechanical syntax.
- [ ] Complex JSX sections include structural layout comments.

#### Category D: Typing & Declarations

- [ ] All functions and methods have explicit return type annotations.
- [ ] Object models use `interface` rather than `type`.
- [ ] No uses of `any` (replace with `unknown`, generics, or concrete types).
- [ ] Variables use `const` unless reassignment is explicitly required (`let`). Never use `var`.

#### Category E: Architecture & Functional Practices

- [ ] Functions obey the Single Responsibility Principle; complex routines decomposed into helpers.
- [ ] Shared components, helpers, and Server Actions use **named exports** (no default export).
- [ ] System boundaries (API routes, Server Actions) defensively validate inputs.
- [ ] Errors are handled explicitly with domain-specific feedback, not silently caught.

#### Category F: Git Essentials & Clean Hygiene

- [ ] Branch is created from up-to-date `main` using `type/short-description` format.
- [ ] Commits represent atomic logical units with imperative messages under 50 characters.
- [ ] Zero `console.log` statements, commented-out dead code, or debugging flags.
- [ ] Local build and linter pass with zero errors (`npm run build`, `npm run lint`).
```

---

# Repository Code Review & Refactoring Roadmap

To assist the team in bringing the existing GreenStep codebase into compliance with these newly ratified standards, this section catalogs specific files and patterns in our repository that require refactoring:

### 1. Server Actions (`app/actions/`)

- **Files:** `app/actions/challenge.ts`, `app/actions/admin-actions.ts`, `app/actions/admin-users.ts`
- **Violations Found:**
  1. _Missing Return Types (Rule 9):_ `createChallenge` (line 7), `joinChallenge` (line 41), `getUserChallenges` omit explicit return signatures.
  2. _Inlined Long Signatures (Rule 8):_ Line 7 of `challenge.ts` is 97 characters; line 36 of `admin-actions.ts` is 105 characters.
  3. _Missing Routine JSDoc Headers (Rule 2):_ None of the Server Actions have routine header blocks documenting parameter constraints or error states.
  4. _Embedded Helper Logic (Rule 6):_ Random challenge code generation (`Math.random().toString(36)...`) is embedded in `createChallenge` instead of an isolated helper (`generateUniqueChallengeCode()`).
- **Required Action:** Extract parameter interfaces, add JSDoc headers, add explicit return types, and extract code-generation helper.

### 2. API Routes (`app/api/`)

- **Files:** `app/api/stats/route.ts`, `app/api/export/csv/route.ts`, `app/api/team/request/route.ts`
- **Violations Found:**
  1. _Missing Return Types (Rule 9):_ Route handlers like `export async function GET(req: Request)` lack `: Promise<NextResponse>` return annotations.
  2. _Monolithic Inline Math (Rule 6):_ `app/api/stats/route.ts` contains 50+ lines of date-bucketing math directly inside the HTTP GET handler.
  3. _Unwrapped Long Lines (Rule 8):_ Lines 18 and 57 in `app/api/stats/route.ts` exceed 86 characters.
- **Required Action:** Annotate return types as `Promise<NextResponse>`, extract date calculations into `lib/date-utils.ts`, and wrap lines at column 70–80.

### 3. Utility Libraries (`lib/`)

- **Files:** `lib/categories.ts`, `lib/authz.ts`, `lib/csv.ts`
- **Violations Found:**
  1. _Extreme Line Lengths (Rule 8):_ `lib/categories.ts` lines 7–11 exceed 100–118 characters.
  2. _Missing Return Types (Rule 9):_ `lib/authz.ts` functions (`isEnvSuperAdminEmail`, `userEmails`, `isSuperAdminUser`, `isAdminUser`, `requireAdmin`) omit explicit return type annotations.
  3. _Single Quote Inconsistencies (Rule 7):_ `lib/csv.ts` line 13 uses `'""'`.
- **Required Action:** Wrap conditional checks across multiple lines, annotate all return types with boolean / Promise signatures, and standardize on double quotes.

### 4. Client Components & Next.js Pages (`app/` & `components/`)

- **Files:** `app/(dashboard)/dashboard/DashboardClient.tsx`, `app/(dashboard)/dashboard/page.tsx`
- **Violations Found:**
  1. _Component Mega-Files (Rule 6):_ `DashboardClient.tsx` is 2,079 lines long, housing multiple tab views, modal dialogs, and animations in a single file.
  2. _Default Export on Non-Page Component (Rule 1):_ `DashboardClient.tsx` uses `export default function DashboardClient`. Only `page.tsx` should use default exports.
  3. _Inlined Async IIFE (Rule 6):_ `app/(dashboard)/dashboard/page.tsx` uses an inline `await (async () => { ... })()` for user upsert logic rather than a clean helper in `lib/users.ts`.
- **Required Action:** Decompose `DashboardClient.tsx` into modular child components in `components/dashboard/`, switch `DashboardClient` to a named export, and move user synchronization into `lib/users.ts`.

### 5. Version Control & Git Habits

- **Violations Found in Git Log:**
  1. Branches named with personal initials, issue numbers, and ampersands: `anna_mary/36_live_action_completions_&_real_CSV_exports`, `EbinChallengesDB`, `thy/fix_minor_issue`.
  2. Commit messages lacking type prefixes: e.g., "Merge pull request #50", "fixed minor issue".
- **Required Action:** Strictly enforce branch format `type/short-description` (e.g., `feat/live-action-csv`, `fix/admin-state-desync`) and mandate Conventional Commit prefixes in all future PRs.

---

# References & Industry Citations

1. **Google LLC.** (2024). _Google TypeScript Style Guide_. Google Open Source Project Documentation.  
   Available at: https://google.github.io/styleguide/tsguide.html

2. **McConnell, Steve.** (2004). _Code Complete: A Practical Handbook of Software Construction_ (2nd ed.). Microsoft Press / ProQuest Ebook Central.

3. **Conventional Commits.** (2023). _Conventional Commits v1.0.0 Specification_.  
   Available at: https://www.conventionalcommits.org/

4. **GitHub Inc.** (2024). _GitHub Flow: Branching, Pull Requests, and Collaborative Code Review_. GitHub Docs.  
   Available at: https://docs.github.com/en/get-started/using-github/github-flow

5. **Prettier Core Team.** (2024). _Prettier: An Opinionated Code Formatter_.  
   Available at: https://prettier.io/docs/en/
