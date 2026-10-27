# GreenStep — Employee Sustainability Challenge

A gamified web platform that replaces manual, spreadsheet-based sustainability tracking with a fast, team-based digital experience. Employees log sustainable actions, earn points and badges, build daily streaks, and compete on live team and individual leaderboards during challenges such as Earth Month.

Minnesota GreenStep Cities and the Minnesota Pollution Control Agency (MPCA) staff use the integrated **Administrative Management Console** to create and manage challenges, configure custom action catalogs, review team requests, oversee participants with role-based access control, and generate audit-ready compliance reports.

Built as a CISC480 Senior Capstone project (Spring 2026) for community partner **Minnesota GreenStep**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, TypeScript, React 19) |
| **Styling** | Tailwind CSS v3 |
| **Authentication** | Clerk (`@clerk/nextjs` v6 / Core 3) with Role-Based Access Control |
| **Database & ORM** | PostgreSQL (Neon serverless) + Prisma ORM v6 |
| **Data Visualizations** | Recharts v3 |
| **Icons & Assets** | lucide-react |
| **Hosting & Deploy** | Vercel |

---

## Project Structure

```
app/
  (auth)/
    sign-in/[[...sign-in]]/page.tsx     # Clerk sign-in
    sign-up/[[...sign-up]]/page.tsx     # Clerk sign-up
  (dashboard)/
    dashboard/page.tsx                  # Server: syncs Clerk user -> DB
    dashboard/DashboardClient.tsx       # Participant dashboard (tabs, charts, modals)
    log-action/page.tsx                 # Browse/search actions to log
    log-action/[actionType]/page.tsx    # Log a specific action (note/photo bonus)
    onboarding/page.tsx                 # First-run onboarding flow
  admin/                                # Dedicated Admin Console root
    layout.tsx                          # Admin shell: AdminSidebar, AdminTopBar, route guards
    unauthorized/page.tsx               # Access denied notice for non-admin accounts
    admin/                              # Primary Admin routes
      page.tsx                          # Master Admin Dashboard (live Neon telemetry)
      DashboardView.tsx                 # Dashboard KPI widgets & live activity stream
      dashboard-display.ts              # Category color tokens & relative time formatter
      challenges/
        page.tsx                        # Challenge directory with status filter tabs
        new/page.tsx                    # Challenge creation with Template Quick-Start & Clone
        [id]/page.tsx                   # Challenge detail: leaderboard, roster, actions
        [id]/actions/page.tsx           # In-Challenge Action CRUD & Catalog Import
      actions/
        page.tsx                        # Global Action Catalog management (master library CRUD)
      templates/
        page.tsx                        # Reusable MPCA challenge templates directory
        new/page.tsx                    # Template creation with action catalog selector
        [id]/edit/page.tsx              # Template edit flow
        TemplateForm.tsx                # Shared template authoring form component
      users/
        page.tsx                        # User directory (search, role & status filters)
        UsersTable.tsx                  # Interactive table with deactivation modal
        new/page.tsx                    # User provisioning form
        [id]/page.tsx                   # User detail & lifetime points history
        [id]/UserDetail.tsx             # SuperAdmin role dropdown, streak, activity logs
      groups/
        page.tsx                        # Campus departments & pending team requests
        new/page.tsx                    # Create campus department
        [id]/page.tsx                   # Department detail & member roster
      reports/
        page.tsx                        # Cross-challenge reports, category chart & CSV
  actions/
    admin-dashboard.ts                  # Server Action: parallel telemetry via db.$transaction
    admin-users.ts                      # Server Action: users CRUD, Clerk role sync & logs
    challenge.ts                        # Server Action: participant create/join challenge
  api/
    actions/route.ts                    # Log + list actions, feeds, popular
    leaderboard/route.ts                # Team + individual leaderboards
    stats/route.ts                      # Performance chart data
    me/route.ts                         # Current-user summary
    onboarding/route.ts                 # Persist onboarding
    export/csv/route.ts                 # CSV export endpoint
    challenge/leave/route.ts            # Leave a challenge
    team/{create,join,leave,list}/route.ts
    team/request/route.ts               # Create a team request
    team/request/[requestId]/route.ts   # Approve/reject team requests
  layout.tsx                            # Root layout (ClerkProvider)
  page.tsx                              # Landing page
  error.tsx / not-found.tsx             # Error and 404 boundaries
components/                             # Shared UI components & layout shells
lib/
  db.ts                                 # Prisma client singleton
  authz.ts                              # Role helpers (SuperAdmin/Admin) & Clerk checks
  csv.ts                                # RFC-4180 client-side CSV generator
  constants.ts                          # Shared constants & global IDs
prisma/schema.prisma                    # Unified database schema
scripts/                                # Seeding and Clerk role sync utilities
middleware.ts                           # Clerk edge route protection
```

---

## Admin Console — Migrated Features from Legacy System

All administrative capabilities from the legacy GreenStep admin console (`sp26_team2_greenstepchallenge_admin`) have been modernized and unified into this Next.js 15 App Router platform with Neon PostgreSQL, replacing legacy Supabase and Material UI dependencies.

### 1. Master Telemetry Dashboard (`/admin/admin`)
- **Live Database Telemetry:** Replaced static mock values with live queries executed via parallel Prisma `db.$transaction` operations.
- **Top KPI Cards:** Active Challenges count, Total Actions Logged, Active Participants count, and Total Points Earned with computed completion rates, average points per user, and estimated CO2 reductions.
- **Top Contributors Leaderboard:** Displays top 5 participants sorted dynamically by aggregate points with medal rank badges and proportional progress tracks.
- **Impact Categories Breakdown:** Visual volume distribution across all five official MPCA categories (`TRANSPORT`, `WATER`, `ENERGY`, `RECYCLING`, `FOOD`).
- **Live Recent Activity Feed:** Real-time stream of the 10 most recent participant action submissions with clickable user links, challenge links, category tags, points badges, and relative timestamps (`just now`, `5m ago`, `2h ago`).
- **Instant Telemetry Refresh:** Non-blocking refresh button powered by React `useTransition` and Next.js `router.refresh()`.
- **Quick Action Shortcut Tiles:** Instant navigation to launch challenges, invite users, add departments, or view analytics reports.

### 2. Challenge Management, In-Challenge Action CRUD & Cloning
- **Challenges Directory (`/admin/admin/challenges`):** Full table listing with search, category tags, and status filter tabs (`Active`, `Upcoming`, `Completed`).
- **Challenge Detail View (`/admin/admin/challenges/[id]`):** Deep-dive overview card, participant count, date range, challenge leaderboard, participant roster, and configured actions summary.
- **In-Challenge Action Management (`/admin/admin/challenges/[id]/actions`):**
  - Admins can add custom sustainability actions specifically for a given challenge or import existing actions directly from the **Global Action Catalog**.
  - Interactive Add/Edit modal dialog with fields for Action Title, Category, Point reward value, and logging instructions.
  - Confirmation modal safeguards for deleting actions.
  - Category filter pills (`All`, `Transportation`, `Energy`, `Waste`, `Food`, `Water`) and action search.
  - Metrics displaying configured action count, total point pool, and primary domain.
- **Challenge Cloning ("Clone from Past Challenge"):**
  - In `/admin/admin/challenges/new`, admins can clone past or archived challenges with one click.
  - Auto-populates challenge title, code, category, description, and automatically clones all associated action items.

### 3. Challenge Templates Authoring & Management (`/admin/admin/templates`)
- **Templates Directory (`/admin/admin/templates`):** Full management directory for reusable challenge sprint presets:
  - *Sustainable Commute Week* (Transportation, 1 week, 4 actions, 130 pts)
  - *H2O Hero Week* (Water Conservation, 1 week, 4 actions, 80 pts)
  - *Power Down Challenge* (Energy Efficiency, 1 week, 4 actions, 70 pts)
  - *Zero Waste Week* (Waste & Recycling, 1 week, 4 actions, 80 pts)
  - *Sustainable Food Challenge* (Sustainable Food, 10 days, 4 actions, 85 pts)
- **Full Template Authoring CRUD:**
  - **Create Template (`/admin/admin/templates/new`):** Author custom templates with name, code prefix, category, recommended duration, description, brand theme colors, and bundled actions.
  - **Edit Template (`/admin/admin/templates/[id]/edit`):** Update existing template parameters, change colors, or adjust bundled action sets.
  - **Delete Template:** Safe deletion with confirmation modal.
  - **Action Bundle Selector:** Browse all actions from the Global Action Catalog with category tabs and search, and select actions via checkboxes to bundle into the template.
  - **Inline Action Creation:** Create a new global action directly from within the template authoring form (`ActionFormDialog`).
- **Quick Start Integration (`/admin/admin/challenges/new`):**
  - "From Template" dropdown pre-populates challenge parameters and automatically stages recommended actions.

### 4. Global Action Catalog Management (`/admin/admin/actions`)
- **Master Action Library:** Centralized repository of reusable sustainability actions derived from Minnesota GreenStep and MPCA standards.
- **Catalog Metrics Bar:** Real-time stats displaying total catalog actions, categories covered, and average point weights.
- **Search & Filtering:** Search by action title or description, filter by category pills (`Transportation`, `Water`, `Energy`, `Waste`, `Food`), and sort by points or title.
- **Full Action Catalog CRUD:**
  - **New Global Action Modal:** Add reusable actions with title, category, points, and completion instructions.
  - **Edit Global Action Modal:** Modify point weights or descriptions across the catalog.
  - **Delete Action Dialog:** Delete actions with confirmation.
- **Seamless Cross-Module Reuse:** Global catalog actions can be bundled into challenge templates or imported directly into specific active challenges.

### 5. User Directory & Role-Based Access Control (`/admin/admin/users`)
- **Directory Table:** Searchable table with debounced search input (300ms), role filter tabs (`All`, `SuperAdmin`, `Admin`, `General User`), status filter (`Active`, `Deactivated`), and department dropdown.
- **User Detail Profile (`/admin/admin/users/[id]`):** Summary card, lifetime points, current streak, actions logged, join date, per-challenge points history with progress bars, chronological action history, and team memberships.
- **Two-Way Clerk Role Synchronization:**
  - Role modifications by SuperAdmins update Clerk `publicMetadata.role` first; on success, a Prisma transaction updates `User.role` and creates an audit entry in `ActivityLog`.
  - Self-demotion and self-deactivation protection prevents admins from locking themselves out.
  - Environment variable fallback (`SUPERADMIN_EMAILS`) preserves root access regardless of database state.
- **Account Deactivation:** Modal confirmation to deactivate or reactivate accounts, recorded in the activity log.
- **Admin Activity Log:** Full audit trail tracking role and status mutations with actor attribution and timestamps.
- **CSV Export:** Client-side CSV export of user participation history and admin audit logs.

### 6. Group & Campus Department Management (`/admin/admin/groups`)
- **Department Cards:** Displays campus departments with live member counts and linked challenge numbers.
- **Department Detail (`/admin/admin/groups/[id]`):** View assigned participant rosters with links to individual profiles.
- **Pending Team Request Reviews:** Table displaying pending team creation requests submitted by mobile and web participants with one-click "Approve" and "Reject" workflow that automatically provisions `Team` and `TeamMember` records upon approval.
- **Create Department (`/admin/admin/groups/new`):** Add formal campus departments or organizational divisions.

### 7. Reports & Audit Analytics (`/admin/admin/reports`)
- **Interactive Analytics:** Filterable by challenge and date range.
- **Category Engagement Chart:** Visual action volume breakdown rendered with Recharts.
- **Full Participation Log Table:** Searchable table of action completions with clickable user and challenge links.
- **Compliance CSV Export:** Generates RFC-4180 compliant CSV files with full participant, department, challenge, category, points, and timestamp metadata.

---

## Role Permissions Matrix

Permissions are enforced on both the server (`lib/authz.ts`) and client:

| Feature / Action | SuperAdmin | Admin | General User |
|---|:---:|:---:|:---:|
| **View Participant Dashboard & Leaderboard** | ✓ | ✓ | ✓ |
| **Log Actions, Badges & Streaks** | ✓ | ✓ | ✓ |
| **Access Admin Console (`/admin`)** | ✓ | ✓ | ✗ |
| **View Admin Dashboard Telemetry** | ✓ | ✓ | ✗ |
| **View Challenges List & Details** | ✓ | ✓ | ✗ |
| **Create / Edit Challenges & Clone** | ✓ | ✓ | ✗ |
| **Manage In-Challenge Actions (CRUD)** | ✓ | ✓ | ✗ |
| **Manage Global Action Catalog (CRUD)** | ✓ | ✓ | ✗ |
| **Create, Edit & Delete Challenge Templates** | ✓ | ✓ | ✗ |
| **View Campus Departments & Rosters** | ✓ | ✓ | ✗ |
| **Approve / Reject Team Requests** | ✓ | ✓ | ✗ |
| **View Users Directory & Profiles** | ✓ | ✓ | ✗ |
| **Deactivate / Reactivate Users** | ✓ | ✓ | ✗ |
| **Change User Roles (SuperAdmin/Admin)** | ✓ | ✗ | ✗ |
| **View Reports & Export CSVs** | ✓ | ✓ | ✗ |

---

## Unified Data Model (Neon PostgreSQL)

The unified Prisma schema reconciles participant tracking with administrative governance models:

- **User** — `clerkId`, `name`, `email`, `departmentName` (legacy mapped), `departmentId`, `role` (`SUPERADMIN`, `ADMIN`, `GENERAL_USER`), `status` (`ACTIVE`, `DEACTIVATED`), `streak`, `lastActionDate`, `onboarded`
- **Department** — `id`, `name` (unique), `description`, relations to `User[]` and `Challenge[]`
- **Challenge** — `id`, `name`, `code` (unique), `description`, `category`, `status` (`UPCOMING`, `ACTIVE`, `COMPLETED`, `ARCHIVED`), `startDate`, `endDate`, `themeColor`, `createdBy`, `departmentId`, relations to `UserChallenge[]`, `Team[]`, `Action[]`, `ChallengeAction[]`
- **Action** — `userId`, `challengeId`, `category` (`TRANSPORT`, `WATER`, `ENERGY`, `RECYCLING`, `FOOD`), `actionType`, `points`, `note`, `imageUrl`, `date`, `createdAt`
- **ActionCatalog** — Global action library: `id`, `title`, `description`, `category`, `points`, relations to `ChallengeAction[]`
- **ChallengeAction** — Join table linking catalog actions to challenges with cascade delete
- **ChallengeTemplate** — Reusable sprint presets: `id`, `name`, `description`, `categories[]`, `themeColor`, `actions` (JSON bundle)
- **ActivityLog** — Admin audit trail: `id`, `userId` (set null on delete), `action`, `details`, `timestamp`
- **Team** & **TeamMember** — Team competition units and membership join table
- **TeamRequest** — Team creation requests with `PENDING`, `APPROVED`, `REJECTED` status

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/eyoelshim/EcoChallengeFall2026.git
cd EcoChallengeFall2026
npm install
```

### 2. Environment Configuration

Copy the example environment template:

```bash
cp .env.example .env.local
```

Fill `.env.local` with your credentials:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY` — from [Clerk Dashboard](https://dashboard.clerk.com)
- `DATABASE_URL` — Neon PostgreSQL connection string (`postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require`)
- `SUPERADMIN_EMAILS` — Comma-separated list of emails that are granted root SuperAdmin access (e.g. `kristin.mroz@mpca.mn.gov,admin@stthomas.edu`)

### 3. Synchronize Database & Generate Client

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

> **Note:** `npm run db:seed` executes `prisma/seed.ts` using idempotent upserts to populate foundational data (departments, standard action catalog, and active/upcoming challenge presets) for local development and Neon environments.

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the participant app, or navigate to [http://localhost:3000/admin/admin](http://localhost:3000/admin/admin) to access the Administrative Management Console.

### 5. Sync Clerk Roles (Optional)

If you have existing users in Clerk and wish to synchronize their roles to the database:

```bash
node scripts/sync-clerk-roles.js         # Dry run: previews detected changes
node scripts/sync-clerk-roles.js --apply # Commits role changes to database
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Next.js development server on port 3000 |
| `npm run build` | Compiles optimized production build |
| `npm run start` | Launches production server |
| `npm run lint` | Runs Next.js ESLint validation |
| `npm run db:generate` | Regenerates Prisma Client types |
| `npm run db:push` | Synchronizes Prisma schema directly with Neon PostgreSQL |
| `npm run db:studio` | Opens Prisma Studio GUI in browser |

---

## Team

- Oli Gurmessa
- Hadi Shaar
- Naisha Srivastav
- Nathanael Agbemadon (Nate)
- Uyen Thy Duong
- Eyoel Woldehawariat
- Ebin Thomas
