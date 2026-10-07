# GreenStep — Employee Sustainability Challenge

A gamified web app that replaces manual, spreadsheet-based sustainability
tracking with a fast, team-based digital platform. Employees log sustainable
actions, earn points and badges, build daily streaks, and compete on live team
and individual leaderboards during challenges such as Earth Month.

Built as a CISC480 Senior Capstone project (Spring 2026) for community partner
Minnesota GreenStep.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v3 |
| Auth | Clerk (`@clerk/nextjs` v6) |
| ORM | Prisma v6 |
| Database | PostgreSQL (Neon) |
| Charts | Recharts |
| Icons | lucide-react |
| Hosting | Vercel |

---

## Project Structure

```
app/
  (auth)/
    sign-in/[[...sign-in]]/page.tsx     # Clerk sign-in
    sign-up/[[...sign-up]]/page.tsx     # Clerk sign-up
  (dashboard)/
    dashboard/page.tsx                  # Server: syncs Clerk user -> DB
    dashboard/DashboardClient.tsx       # Main dashboard UI (tabs, charts, modals)
    admin/page.tsx                      # Admin: challenges, team requests, export
    log-action/page.tsx                 # Browse/search actions to log
    log-action/[actionType]/page.tsx    # Log a specific action (note/photo bonus)
    onboarding/page.tsx                 # First-run onboarding flow
  actions/challenge.ts                  # Server actions: create/join challenge
  api/
    actions/route.ts                    # Log + list actions, feeds, popular
    leaderboard/route.ts                # Team + individual leaderboards
    stats/route.ts                      # Performance chart data
    me/route.ts                         # Current-user summary
    onboarding/route.ts                 # Persist onboarding
    export/csv/route.ts                 # Admin CSV export
    challenge/leave/route.ts            # Leave a challenge
    team/{create,join,leave,list}/route.ts
    team/request/route.ts               # Create a team request
    team/request/[requestId]/route.ts   # Approve/reject (admin)
  layout.tsx                            # Root layout (ClerkProvider)
  page.tsx                              # Landing page
  error.tsx / not-found.tsx             # Error + 404 pages
  globals.css
components/                             # Shared UI components
lib/
  db.ts                                 # Prisma client singleton
  authz.ts                              # Admin check (Clerk publicMetadata)
  constants.ts                          # GLOBAL_CHALLENGE_ID
  global-challenge.ts                   # Ensures the global challenge exists
  team-requests.ts                      # Team-request create/review logic
  actions-data.ts                       # Catalog of loggable actions + points
prisma/schema.prisma                    # Database schema
scripts/                                # Dev seed scripts (seed-*.js)
middleware.ts                           # Clerk route protection
```

---

## Getting Started

### 1. Clone

```bash
git clone https://github.com/nagbemadon/GreenStepEmployee.git
cd GreenStepEmployee
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill `.env.local` with real values (ask a team member, or use your own Clerk +
Neon accounts):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — from
  [dashboard.clerk.com](https://dashboard.clerk.com)
- `DATABASE_URL` — your Neon (or other) PostgreSQL connection string

### 4. Generate the Prisma client and push the schema

```bash
npm run db:generate
npm run db:push
```

This project uses `prisma db push` to apply the schema; there is no migrations
folder.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Becoming an admin

Admin features (challenge creation, team-request approval, CSV export) require
the Clerk user's `publicMetadata.role` to be set to `"admin"` in the Clerk
dashboard.

### Seeding demo data (optional)

```bash
node scripts/seed-global-challenge.js
node scripts/seed-mock.js
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:push` | Push the schema to the database |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |

---

## Data Model

Seven Prisma models support multi-challenge participation, team membership, and
an admin-approved team-request workflow:

- **User** — `clerkId` (links to Clerk), name, email, department, streak,
  lastActionDate, onboarded
- **Challenge** — name, unique join `code`, optional start/end dates (a
  permanent "global" challenge is the default experience)
- **UserChallenge** — join table enrolling users in challenges
- **Team** — name, optional challenge scope
- **TeamMember** — join table for team membership
- **Action** — category, actionType, points, optional note/image, date
  (linked to a user and a challenge)
- **TeamRequest** — request to create a team, with PENDING/APPROVED/REJECTED
  status and an admin reviewer

Enums:

- `ActionCategory`: `TRANSPORT`, `WATER`, `ENERGY`, `RECYCLING`, `FOOD`
- `TeamRequestStatus`: `PENDING`, `APPROVED`, `REJECTED`

---

## Features

- Clerk authentication with a first-run onboarding flow
- Auto-enrollment in a global challenge; join additional challenges by code
- Action logging across five categories, with points and optional note/photo
  bonuses
- Daily streaks and earnable badges
- Team and individual leaderboards (all-time, rising, streaks, diversity) with
  category and time-range filters
- Personal and community activity feeds
- Performance chart (you vs. average) rendered with Recharts
- Admin tools: create challenges, review team requests, export participation
  data to CSV

---

## Team

- Oli Gurmessa
- Hadi Shaar
- Naisha Srivastav
- Nathanael Agbemadon (Nate)
