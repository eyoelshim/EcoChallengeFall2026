# Team Coding Guidelines  
**GreenStep — TypeScript / Next.js Project**  
*Based on the Google TypeScript Style Guide*  
**Authors:** Oli Gurmessa, Hadi Shaar, Naisha Srivastav, Nate A  

---

## Overview

We follow the Google TypeScript Style Guide as our primary coding standard. These guidelines ensure consistency, readability, and maintainability across our TypeScript-based Next.js application. Each rule below is accompanied by a concrete example from our project (Google, 2024).

---

## Quick Reference Checklist (Before Commit)

- [ ] Format with Prettier (80 char width, 2 spaces, double quotes)  
- [ ] One logical change per commit  
- [ ] Commit message in imperative mood, under 50 characters  
- [ ] No commented-out code or console logs  
- [ ] Functions have a single responsibility  
- [ ] Validate inputs before processing  
- [ ] Code builds and lint checks pass (`npm run build`, `npm run lint`)  
- [ ] Use descriptive names (avoid `data`, `temp`)  
- [ ] Follow naming conventions (`camelCase`, `PascalCase`, etc.)  

---

# 1. Commenting

We use JSDoc for all code comments. Comments must be well-formed, as many tools extract metadata from them for validation and optimization.

## Rule: Use multi-line JSDoc for functions with parameters

✅ Correct — from our project (`FeatureCard` component)

```ts
/**
 * Renders a feature highlight card on the landing page.
 * @param icon A React node rendered as the card's icon.
 * @param title Short label displayed in bold.
 * @param description Supporting detail shown below the title.
 */
function FeatureCard({ icon, title, description }: FeatureCardProps) {
 ...
}
```

## Rule: Use single-line JSDoc for self-explanatory functions

✅ Correct

```ts
/** Redirects authenticated users away from the landing page. */
export default async function Home() {
 ...
}
```

## Rule: If single-line overflows, switch to multi-line

❌ Incorrect

```ts
/** Renders a feature card with an icon, title, and description for the homepage. */
```

✅ Correct

```ts
/**
 * Renders a feature card with an icon, title, and
 * description for the homepage.
 */
```

## Rule: Use `//` line comments for implementation comments

```ts
// Check whether user is authenticated
// Redirect only if session exists
```

## Rule: Every file should begin with file-level JSDoc

```ts
/**
 * File: FeatureCard.tsx
 * Author: Hadi Shaar
 * Created: 2026-04-20
 * Description: Renders a feature highlight card.
 * Contact: shaa6718@stthomas.edu
 */
```

---

# 2. Formatting

We use Prettier as our auto-formatter.

## Prettier Rules

| Rule | Setting |
|------|---------|
| Line width | 80 characters (`printWidth: 80`) |
| Indentation | 2 spaces (`tabWidth: 2`) |
| Quotes | Double quotes |
| Semicolons | Always (`semi: true`) |
| Trailing commas | Where valid in ES5 |
| Object braces | Spaces inside braces |
| Arrow functions | Remove unnecessary parentheses |
| JSX attributes | Double quotes, `>` on same line |

## Rule: Use 2-space indentation, double quotes, semicolons

```ts
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }
}
```

## Rule: Use trailing commas in multiline objects

```ts
type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};
```

---

# 3. Naming

## Naming Conventions

| Case | Use For |
|------|---------|
| camelCase | Variables, functions, methods, parameters |
| PascalCase | Components, interfaces, types |
| UPPER_CASE | Constants |

## Rule: PascalCase for components and types

```ts
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard(
  { icon, title, description }: FeatureCardProps
) {
 ...
}
```

## Rule: camelCase for variables and parameters

```ts
const { userId } = await auth();

function FeatureCard({ icon, title, description }) {
 ...
}
```

## Rule: Avoid generic names

❌ Incorrect

```ts
const data = await auth();

function Card({ a, b, c }) {
 ...
}
```

✅ Correct

```ts
const { userId } = await auth();

function FeatureCard({ icon, title, description }) {
 ...
}
```

## File Naming Conventions

- `PascalCase` → React components  
  - `FeatureCard.tsx`

- `camelCase` → utility files  
  - `authHelpers.ts`

- `kebab-case` → route folders  
  - `user-profile/`

Rules:

- File name should match main export  
- Use descriptive names  
- Avoid vague names like `utils.ts` unless scope is tiny  

---

# 4. Declarations

## a. Variables

### Rule: Use `const` unless reassignment is required

❌ Incorrect

```ts
var userId = await auth();
```

✅ Correct

```ts
const { userId } = await auth();
```

## Rule: One declaration per line

❌ Incorrect

```ts
const icon = <Leaf />, title = "Track Actions";
```

✅ Correct

```ts
const icon = <Leaf />;
const title = "Track Actions";
const description = "Transport, energy, water";
```

---

## b. Classes

### Rule: Use `readonly` when values never change

```ts
class FeatureConfig {
  readonly title: string;
  readonly description: string;

  constructor(title: string, description: string) {
    this.title = title;
    this.description = description;
  }
}
```

### Rule: Use TypeScript `private`, not `#private`

❌ Incorrect

```ts
class AuthService {
  #userId: string;
}
```

✅ Correct

```ts
class AuthService {
  private userId: string;
}
```

---

## c. Functions

### Rule: Prefer named function declarations

❌ Incorrect

```ts
const FeatureCard = ({ icon }: Props) => {
  return <div />;
};
```

✅ Correct

```ts
function FeatureCard(
  { icon, title, description }: FeatureCardProps
) {
  return (
    <div>
      ...
    </div>
  );
}
```

### Rule: Use arrow functions for callbacks

```tsx
<button onClick={() => handleSignIn()}>
  Get Started
</button>
```

---

## d. Types and Interfaces

### Rule: Prefer `interface` over `type` for objects

❌ Incorrect

```ts
type FeatureCardProps = {
  title: string;
};
```

✅ Correct

```ts
interface FeatureCardProps {
  title: string;
}
```

### Rule: Annotate types at declaration site

❌ Incorrect

```ts
const horse = {
  sound: "neigh",
};
```

✅ Correct

```ts
const horse: Animal = {
  sound: "neigh",
};
```

---

## e. Naming Summary

| Convention | Applies To |
|-----------|-------------|
| UpperCamelCase | Classes, interfaces, types, enums |
| lowerCamelCase | Variables, functions, properties |
| CONSTANT_CASE | Global constants |

Rules:

- No `_privateField`
- No interface prefixes like `IUser`

Use:

```ts
interface User {}
```

Not:

```ts
interface IUser {}
```

---

# 5. Functional Practices

## Rule: One clear responsibility per function

```ts
export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return <main>...</main>;
}
```

## Rule: Validate inputs before processing

```ts
export async function POST(req: Request) {
  const body = await req.json();

  if (!body.actionId || !body.userId) {
    return new Response(
      "Missing fields",
      { status: 400 }
    );
  }
}
```

## Rule: Handle errors explicitly

❌ Incorrect

```ts
const user = await db.getUser(userId);
return user.name;
```

✅ Correct

```ts
const user = await db.getUser(userId);

if (!user) {
  return new Response(
    "User not found",
    { status: 404 }
  );
}

return user.name;
```

## Rule: Separate business logic from UI

```ts
// lib/auth.ts
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return userId;
}
```

```ts
// app/dashboard/page.tsx
export default async function Dashboard() {
  const userId = await requireAuth();
}
```

---

# 6. Version Control

All changes to `main` require a branch and pull request.

## a. Commit one logical change at a time

✅ Good

```bash
git commit -m "Add FeatureCard component"
```

❌ Too broad

```bash
git commit -m "Add page fix auth update icons"
```

---

## b. Commit before refactoring

```bash
git add .
git commit -m "Checkpoint before refactor"
```

---

## c. Branch naming

```bash
feature/landing-page
feature/user-auth
fix/null-check-userid
chore/update-deps
```

Format:

```text
type/short-description
```

---

## d. Commit messages use imperative mood

❌ Incorrect

```bash
git commit -m "I added the sign in button"
```

✅ Correct

```bash
git commit -m "Add sign-in button"
git commit -m "Fix null pointer"
```

---

## e. Code must pass checks

```bash
npm run build
npm run lint
```

Both must pass before a PR is ready. (Automated tests are not yet
configured for this project; see the To-Do / Future Enhancements section
of the Project Report.)

---

## f. Never commit directly to main

```bash
git checkout -b feature/leaderboard
git push origin feature/leaderboard
```

Open PR on GitHub.

---

## g. Sync with main frequently

```bash
git fetch origin
git merge origin/main
```

or

```bash
git rebase origin/main
```

---

## h. No debugging artifacts

❌ Incorrect

```ts
console.log(userId);
// redirect("/dashboard");
```

✅ Correct

```ts
if (userId) {
  redirect("/dashboard");
}
```

---

# References

Google. (2024). *TypeScript Style Guide.*  
https://google.github.io/styleguide/tsguide.html

Conventional Commits. (2023). *Conventional Commits v1.0.0.*  
https://www.conventionalcommits.org/

Prettier. (2024). *Prettier Documentation.*  
https://prettier.io/docs/en/
