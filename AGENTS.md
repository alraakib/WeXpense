# WeXpense - Agent Implementation Guide

## Agent Behavior Rules

**FULL AUTONOMY — BUILD COMPLETE PROJECT WITHOUT STOPPING.**

1. When user says "build", "start", or similar — begin implementing the ENTIRE project from Phase 1 through Phase 6 without stopping.
2. DO NOT talk during implementation. No explanations, no summaries, no "here's what I'll do". Just write code and execute.
3. NEVER stop before completing the ENTIRE project. Every module, every feature, every endpoint, every component.
4. After completing EACH module, immediately write unit tests and run them. Fix failures before moving on.
5. After ALL modules are complete, write comprehensive E2E integration tests covering the full application.
6. Anticipate edge cases. Handle null/undefined, race conditions, permission checks, currency rounding, timezone handling, concurrent edits.
7. Zero tight coupling. Every module communicates through clean interfaces/contracts. Swap any implementation without breaking others.
8. Errors should be fixed silently by reading the error, understanding the code, and applying the fix.
9. If multiple files need changes, batch them all in one response.
10. Never add comments unless explicitly requested.
11. Never create README or documentation files unless explicitly requested.
12. Never run `npm init`, `bun init`, or similar scaffolding on existing projects — detect the existing setup and work within it.
13. After successful build and ALL tests pass, commit changes, push to GitHub (`git push origin main`), then deploy to production via SSH (`ssh rakib`) to VPS at `wexpense.is-from.bd`.
14. **NEVER write slop AI code.** No filler, no boilerplate ceremony, no AI-isms. Write like a senior engineer: dense, purposeful, production-grade code. No empty abstractions, no dead utility functions, no "for future use" scaffolding, no overly generic naming, no comments restating what the code does, no redundant defensive checks. Every file, function, and line must earn its place.
15. **Run `skill(unslop)` / `skill(slopbeth)` / `skill(slopgent)` before finalizing any code, prose, commit messages, or replies.** Apply the anti-AI-slop rules (diagnose → reconstruct → self-audit) to everything shipped. Prose in this repo is as important as code — no ChatGPT-flavored filler anywhere.

---

## Skills Directory

**Project skills are installed in `.agents/skills/<skill-name>/SKILL.md`** (project-local, installed via `npx skills add <owner>/<repo> -s <skill> --copy -y`).

**Load project-specific skills from `.agents/skills/` folder as needed:**

| Skill | Use When | Load Command |
|-------|----------|--------------|
| `elysiajs` | Backend API routes, middleware, Elysia patterns | `skill(elysiajs)` |
| `mantine-form` | Form handling, validation, Mantine useForm | `skill(mantine-form)` |
| `mantine-custom-components` | Custom Mantine components, styling | `skill(mantine-custom-components)` |
| `mantine-combobox` | Custom dropdowns, selects, autocomplete, multi-select | `skill(mantine-combobox)` |
| `mongodb-query-optimizer` | MongoDB queries, indexing, aggregation | `skill(mongodb-query-optimizer)` |
| `mongodb-schema-design` | Data models, collections, embedding vs referencing | `skill(mongodb-schema-design)` |
| `redis-core` | Redis operations, caching, pub/sub | `skill(redis-core)` |
| `stripe-best-practices` | Stripe billing, subscriptions, webhooks | `skill(stripe-best-practices)` |
| `better-auth-best-practices` | Better-Auth setup, session management, auth patterns | `skill(better-auth-best-practices)` |
| `better-auth-security-best-practices` | Auth hardening: rate limiting, CSRF, sessions, audit | `skill(better-auth-security-best-practices)` |
| `email-and-password-best-practices` | Email/password login, password reset, verification | `skill(email-and-password-best-practices)` |
| `organization-best-practices` | Workspaces, teams, members, invites, RBAC roles | `skill(organization-best-practices)` |
| `two-factor-authentication-best-practices` | 2FA: TOTP, OTP, backup codes, trusted devices | `skill(two-factor-authentication-best-practices)` |
| `vercel-react-best-practices` | React patterns, hooks, performance | `skill(vercel-react-best-practices)` |
| `vercel-composition-patterns` | React component composition, compound components | `skill(vercel-composition-patterns)` |
| `unslop` | Remove AI writing patterns from prose, code, commit messages, replies | `skill(unslop)` |
| `slopbeth` | Clean shipped artifacts (code, docs, commit messages) of AI tells | `skill(slopbeth)` |
| `slopgent` | Shape agent replies: honest, action-first, plain language | `skill(slopgent)` |
| `token-optimizer` | Reduce token consumption: file organization, context hygiene, model selection | `skill(token-optimizer)` |
| `test-driven-development` | Red-green-refactor, test pyramid, enforced test discipline | `skill(test-driven-development)` |
| `code-review-and-quality` | Multi-axis review before merge, severity labels, change sizing | `skill(code-review-and-quality)` |
| `code-simplification` | Reduce complexity while preserving exact behavior | `skill(code-simplification)` |
| `git-workflow-and-versioning` | Atomic commits, branching, semantic versioning, changelogs | `skill(git-workflow-and-versioning)` |
| `security-and-hardening` | OWASP Top 10 prevention, auth patterns, secrets, dependency auditing | `skill(security-and-hardening)` |
| `context-engineering` | Optimize agent context: rules files, context packing, progressive disclosure | `skill(context-engineering)` |
| `incremental-implementation` | Thin vertical slices — implement, test, verify, commit | `skill(incremental-implementation)` |
| `api-and-interface-design` | Stable API/interface contracts, module boundaries | `skill(api-and-interface-design)` |
| `debugging-and-error-recovery` | Systematic root-cause debugging, no guessing | `skill(debugging-and-error-recovery)` |
| `performance-optimization` | Measure-first performance, N+1 fixes, profiling workflows | `skill(performance-optimization)` |
| `hooks-pattern` | React hooks for reusing stateful logic | `skill(hooks-pattern)` |
| `compound-pattern` | Compound components with shared implicit state | `skill(compound-pattern)` |
| `presentational-container-pattern` | Separate view from logic for testability | `skill(presentational-container-pattern)` |
| `react-data-fetching` | TanStack Query, SWR, Suspense data fetching | `skill(react-data-fetching)` |
| `react-render-optimization` | Memoization, re-render reduction, state design | `skill(react-render-optimization)` |
| `react-server-components` | RSC for zero-bundle server rendering | `skill(react-server-components)` |
| `react-composition-2026` | Modern composition patterns, component API design | `skill(react-composition-2026)` |
| `render-props-pattern` | Render props for flexible composition | `skill(render-props-pattern)` |
| `module-pattern` | JS code organization and encapsulation | `skill(module-pattern)` |
| `observer-pattern` | Decoupled publish/subscribe | `skill(observer-pattern)` |
| `singleton-pattern` | Single shared instance management | `skill(singleton-pattern)` |
| `proxy-pattern` | Intercepting object operations (validation, access control) | `skill(proxy-pattern)` |
| `factory-pattern` | Centralized object creation | `skill(factory-pattern)` |
| `mediator-pattern` | Centralized component communication | `skill(mediator-pattern)` |
| `tree-shaking` | Dead code elimination in bundles | `skill(tree-shaking)` |
| `virtual-lists` | Windowing for large list rendering | `skill(virtual-lists)` |
| `route-based` | Route-level code splitting | `skill(route-based)` |
| `dynamic-import` | On-demand module loading | `skill(dynamic-import)` |
| `js-performance-patterns` | Framework-agnostic JS runtime performance | `skill(js-performance-patterns)` |

**Skill Sources (from `skills-lock.json`):**
| Skill | Source |
|-------|--------|
| `elysiajs` | `elysiajs/skills` |
| `mantine-form`, `mantine-custom-components`, `mantine-combobox` | `mantinedev/skills` |
| `mongodb-query-optimizer`, `mongodb-schema-design` | `mongodb/agent-skills` |
| `redis-core` | `redis/agent-skills` |
| `stripe-best-practices` | `stripe/ai` |
| `better-auth-best-practices`, `better-auth-security-best-practices`, `email-and-password-best-practices`, `organization-best-practices`, `two-factor-authentication-best-practices` | `better-auth/skills` |
| `vercel-react-best-practices`, `vercel-composition-patterns` | `vercel-labs/agent-skills` |
| `unslop` | `theclaymethod/unslop` |
| `slopbeth`, `slopgent` | `ehmo/slopkit` |
| `token-optimizer` | `alexismunoz1/token-optimizer` |
| `test-driven-development`, `code-review-and-quality`, `code-simplification`, `git-workflow-and-versioning`, `security-and-hardening`, `context-engineering`, `incremental-implementation`, `api-and-interface-design`, `debugging-and-error-recovery`, `performance-optimization` | `addyosmani/agent-skills` |
| `hooks-pattern`, `compound-pattern`, `presentational-container-pattern`, `react-data-fetching`, `react-render-optimization`, `react-server-components`, `react-composition-2026`, `render-props-pattern`, `module-pattern`, `observer-pattern`, `singleton-pattern`, `proxy-pattern`, `factory-pattern`, `mediator-pattern`, `tree-shaking`, `virtual-lists`, `route-based`, `dynamic-import`, `js-performance-patterns` | `PatternsDev/skills` |

**Rules:**
- Always load the relevant skill BEFORE implementing a module that uses that technology
- If unsure which skill to load, check the skill name against the task at hand
- Skills provide patterns, best practices, and code examples — use them as reference
- Never skip loading skills for core technologies (Elysia, Mantine, MongoDB, Redis)
- Skills live in `.agents/skills/` — never reference skills outside the project folder
- To add/update a skill: `npx skills add <owner>/<repo> -s <skill-name> --copy -y`

---

## 1. Project Overview
**WeXpense** is a modern, hosted SaaS platform for collaborative financial management. Designed for frictionless user experience, it serves individuals tracking personal budgets and teams/families managing shared expenses. It supports multi-currency wallets, multi-tenant workspaces, role-based approval workflows, and goal-based savings.

### Architecture Principles
*   **Loose Coupling:** Each domain (Auth, Billing, Transactions, etc.) is a separate module with clear interfaces. No direct imports across boundaries.
*   **Interface Contracts:** Every module exposes typed interfaces. Implementations can be swapped (e.g., MongoDB → Postgres, Redis → in-memory cache).
*   **Dependency Injection:** Services receive dependencies through constructor/config, not hard-coded imports.
*   **Single Docker Storage:** All services share one MongoDB instance and one Redis instance inside Docker. No per-service databases.
*   **No Monorepo Required:** Efficient single-project structure unless monorepo provides clear benefit. Optimize for performance and simplicity.

### Tech Stack
*   **Runtime/Package Manager:** Bun
*   **Backend:** Elysia (Bun-native, highest throughput ~2.5M req/s, Eden Treaty for E2E type safety)
*   **Validation:** TypeBox (2-4x faster than Zod, native Elysia integration)
*   **Authentication:** Better-Auth
*   **Billing/Subscriptions:** Stripe or LemonSqueezy (SaaS Engine)
*   **Frontend:** React, Next.js (App Router)
*   **UI Component Library:** Mantine UI (v7+) — primary component system
*   **Icons:** Solar Icons (https://solar-icons.vercel.app/) — primary icon set
*   **Styling:** Tailwind CSS (utility classes for custom layouts), Mantine CSS modules (component-level)
*   **State Management:** Zustand (client), TanStack Query (server)
*   **Animations & UX Polish:** Motion (Framer Motion), Mantine transitions, Command Palette (Cmd+K via kbar or Mantine Spotlight)
*   **Charts:** Recharts or Mantine Dates + custom SVG charts
*   **Forms:** Mantine UseForm (built on native-hook-form) + TypeBox validation
*   **Notifications:** Mantine Notifications (toasts)
*   **Theming:** Mantine CSS variables, `@mantine/core` theme system (light/dark/color schemes)
*   **Database:** MongoDB (single instance in Docker, shared across all services)
*   **Cache/Queue:** Redis (single instance in Docker, shared across all services)
*   **Deployment:** Docker + Nginx reverse proxy

### Default Admin Account
*   **Email:** `alraakib@gmail.com`
*   **Password:** `Rkb243116`
*   **Role:** Super Admin (full system access, can manage configs, subscriptions, and all workspaces)
*   **Auto-provisioned on first run via seed script**

---

## 2. Infrastructure & Docker

### Docker Architecture
*   **Single MongoDB Container:** All collections in one database. Services access via shared connection pool.
*   **Single Redis Container:** All caching, sessions, queues, pub/sub in one instance. Namespace by key prefix per domain.
*   **Nginx Container:** Reverse proxy for API routes, static frontend assets, SSL termination.
*   **Backend Container:** Elysia API server with all domain modules.
*   **Frontend Container:** Next.js SSR/SSG build.

### Docker Compose
```
services:
  nginx:
    ports: ["80:80", "443:443"]
    depends_on: [frontend, backend]
  
  frontend:
    build: ./frontend
    depends_on: [backend]
  
  backend:
    build: ./backend
    depends_on: [mongo, redis]
  
  mongo:
    image: mongo:7
    volumes: [mongo_data:/data/db]
  
  redis:
    image: redis:7-alpine
    volumes: [redis_data:/data]
```

### Nginx Configuration
*   `/api/*` → Backend container (Elysia)
*   `/*` → Frontend container (Next.js)
*   Static asset caching, gzip compression, security headers
*   WebSocket proxy for real-time features

---

## 3. Redis Strategy

### Key Design Rules
*   **Prefix Every Key:** `{domain}:{entity}:{id}` — e.g., `auth:session:{sid}`, `billing:subscription:{userId}`, `cache:rates:{date}`
*   **TTL by Default:** Every key MUST have a TTL. No infinite cache without explicit reasoning.
*   **Cache-Aside Pattern:** Read from cache first, miss → read DB → write cache. Write → invalidate cache.
*   **No Cache Stampede:** Use lock pattern (SETNX) for expensive cache misses. Only one process rebuilds cache.

### Redis Use Cases & Key Patterns
| Use Case | Key Pattern | TTL | Strategy |
|----------|-------------|-----|----------|
| Session Storage | `auth:session:{sessionId}` | 7 days | Write-through on login, delete on logout |
| User Profile | `user:profile:{userId}` | 1 hour | Cache-aside, invalidate on update |
| Workspace Access | `workspace:access:{userId}:{workspaceId}` | 15 min | Cache-aside, invalidate on role change |
| Exchange Rates | `cache:rates:{date}` | 24 hours | Write once daily via cron job |
| Subscription Status | `billing:sub:{userId}` | 1 hour | Cache-aside, invalidate on billing webhook |
| Rate Limiting | `ratelimit:{ip}:{endpoint}` | 1 min | Sliding window counter |
| API Response Cache | `cache:api:{hash}` | 5 min | For read-heavy endpoints (dashboard stats) |
| Pending Invites | `workspace:invite:{token}` | 7 days | Write on invite, delete on accept |
| Recurring Job Lock | `lock:recurring:{jobId}` | 5 min | SETNX for distributed job scheduling |
| Real-time Balances | `wallet:balance:{walletId}` | 30 sec | Short TTL for near-real-time display |
| Feature Flags | `feature:{flagName}:{workspaceId}` | 5 min | Cache-aside, invalidate on flag toggle |
| User Rate Limit | `ratelimit:user:{userId}:{endpoint}` | 1 min | Per-user rate limiting for API abuse |
| Dashboard Stats | `cache:dashboard:{workspaceId}:{period}` | 10 min | Cache aggregated stats, invalidate on transaction |
| Budget Alerts | `budget:alert:{workspaceId}:{categoryId}` | 1 hour | Track budget threshold notifications |
| Search Index | `search:tx:{workspaceId}:{hash}` | 5 min | Cache search results for common queries |

### Cache Invalidation Rules
1. **User update** → invalidate `user:profile:{userId}`, `workspace:access:*`
2. **Transaction create/edit** → invalidate `wallet:balance:{walletId}`, `cache:api:{workspaceId}:*`, `monthly:snapshot:{workspaceId}:{month}`
3. **Role change** → invalidate `workspace:access:{userId}:*`
4. **Subscription change** → invalidate `billing:sub:{userId}`
5. **Daily cron** → write `cache:rates:{date}`

### WebSocket Redis Keys
*   `ws:connections:{userId}` — Set of connection IDs per user
*   `ws:subscriptions:{connectionId}` — Set of channels per connection
*   `ws:channel:{channelName}` — Pub/Sub channel for real-time events

---

### Background Job Queue (BullMQ)

**Why:** API responses must stay fast (<100ms). Heavy work goes to background: emails, notifications, export generation, exchange rate fetching, recurring expense processing.

**Library:** `bullmq` (Redis-based, best for Bun/Node.js, reliable, delayed jobs, retries, rate limiting)

```typescript
// src/shared/queue/index.ts
import { Queue, Worker } from 'bullmq'

const connection = { host: 'redis', port: 6379 }

// Email queue — immediate delivery with retry
export const emailQueue = new Queue('email', { connection })
export const emailWorker = new Worker('email', async (job) => {
  await sendEmail(job.data) // Resend/SendGrid
}, { connection, concurrency: 10 })

// Notification queue — in-app + push
export const notificationQueue = new Queue('notifications', { connection })
export const notificationWorker = new Worker('notifications', async (job) => {
  await createNotification(job.data)
  await emitWebSocket(job.data.userId, job.data) // Real-time push
}, { connection, concurrency: 20 })

// Export queue — CSV/PDF generation (heavy)
export const exportQueue = new Queue('exports', { connection })
export const exportWorker = new Worker('exports', async (job) => {
  const file = await generateExport(job.data)
  await notifyUser(job.data.userId, `Export ready: ${file.url}`)
}, { connection, concurrency: 2 }) // Low concurrency — CPU intensive

// Recurring expenses — scheduled processing
export const recurringQueue = new Queue('recurring', { connection })
export const recurringWorker = new Worker('recurring', async (job) => {
  await processRecurringExpenses(job.data.workspaceId)
}, { connection, concurrency: 5 })
```

**Job Patterns:**
```typescript
// Fire-and-forget email (API responds instantly)
await emailQueue.add('welcome', { userId, email, name })

// Delayed notification (remind in 3 days)
await notificationQueue.add('budget-alert', { userId, budgetId }, {
  delay: 3 * 24 * 60 * 60 * 1000 // 3 days
})

// Rate-limited external API calls (exchange rates)
await exchangeQueue.add('fetch-rates', {}, {
  jobId: `rates-${date}`, // Idempotent — prevent duplicates
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 }
})
```

**Queue Monitoring:**
*   **BullMQ Board:** `GET /api/admin/queues` — Dashboard for job stats (requires admin role)
*   **Metrics:** Jobs completed/failed/waiting per queue, processing time p95
*   **Alerting:** Alert on >10 failed jobs in 5 minutes

**Redis Key Patterns for Queues:**
*   `bull:email:*` — Email job data
*   `bull:notifications:*` — Notification job data
*   `bull:exports:*` — Export job data
*   `bull:recurring:*` — Recurring expense job data

**Performance Rules:**
1. **Never await queue.add()** in request handlers — fire-and-forget
2. **Set concurrency** based on resource needs (email=10, exports=2)
3. **Use job IDs** for idempotency (prevent duplicate processing)
4. **Implement dead letter queue** — Failed jobs after 3 retries → manual review
5. **Monitor queue depth** — Alert if >1000 pending jobs

---

## 4. MongoDB Schema Design

### Database: `wexpense`

### Collections
```
users              - Auth profiles, email, name, avatar
user_settings      - Preferences, base currency, theme, timezone
workspaces         - Workspace metadata, type (personal/shared)
workspace_members  - User-workspace relationship, role, status
wallets            - Funding sources, currency, balances
categories         - Transaction categories with icons/colors (supports parent/child hierarchy)
tags               - Flexible transaction tags (user-defined, workspace-scoped)
transactions       - All financial movements, supports splits and transfers
recurring_rules    - Recurring expense templates
savings_goals      - Goal targets and progress
budgets            - Category-level spending limits with period (monthly/yearly)
monthly_snapshots  - Pre-computed analytics per workspace/month
subscriptions      - Billing status per user
configs            - Global system config
audit_logs         - Action history for team workspaces
notifications      - In-app notifications (invites, alerts, milestones)
files              - File upload metadata (receipts, attachments)
feature_flags      - Per-tenant feature toggles for gradual rollouts
```

### Indexing Strategy
*   `users.email` — unique
*   `workspace_members.userId + workspaceId` — compound unique
*   `transactions.workspaceId + date` — compound
*   `transactions.walletId` — for balance queries
*   `wallets.workspaceId` — for listing
*   `monthly_snapshots.workspaceId + month` — compound unique
*   `notifications.userId + read` — for unread notifications
*   `budgets.workspaceId + categoryId` — for budget lookups
*   `recurring_rules.workspaceId + nextDueDate` — for upcoming recurring expenses
*   `savings_goals.workspaceId + status` — for active goals
*   `tags.workspaceId` — for listing tags
*   `categories.workspaceId` — for listing categories
*   `audit_logs.workspaceId + createdAt` — for activity feed
*   `files.transactionId` — for transaction attachments

### Edge Cases to Handle
*   **Currency Rounding:** Store amounts in smallest unit (cents), round only on display
*   **Concurrent Balance Updates:** Use atomic `$inc` operations, never read-modify-write
*   **Deleted Workspace:** Soft delete, cascade archive to snapshots
*   **Orphaned Transactions:** Foreign key validation before delete
*   **Timezone Handling:** Store all dates in UTC, convert on display per user timezone
*   **Decimal Precision:** Use MongoDB Decimal128 or store as integer cents

---

## 5. SaaS Configuration & Subscription Tiers

### Global Config (System Level)
Stored in `configs` collection, dictating operational state.
*   **App Metadata:** App name, icon URLs, maintenance mode, feature flags.
*   **Global Economics:** Supported currency codes (USD, BDT, BTC, etc.) and cached daily exchange rates.

### Subscription Tiers (Stripe/LemonSqueezy Linked)
*   **Free Tier (Hobby):** `max_workspaces: 1`, `max_wallets: 2`, basic reporting, community support.
*   **Pro Tier (Individual):** Unlimited wallets, custom categories, AI receipt scanning, advanced goal tracking.
*   **Team Tier (Collaborative):** Multiple shared workspaces, RBAC, approval workflows, audit log exports.

### User Settings (Personal Level)
*   **Preferences:** Base currency, theme (light/dark/system), timezone.
*   **Notifications:** Granular controls for email/push alerts.

---

## 6. Core Domain Entities & Rules

### Users, Auth, & Onboarding
*   **Frictionless Signup:** Passwordless magic links or OAuth (Google/GitHub) via Better-Auth.
*   **Onboarding Wizard:** 3-step setup (Set Base Currency → Create First Wallet → Add First Goal). Built with Mantine Stepper, TextInput, NumberInput, Select.
*   **Auto-Provisioning:** System provisions `UserSettings`, default **Personal Workspace**, and Cash Wallet on signup.

### Workspaces
*   **Personal Workspace:** Strictly 1 user (the owner).
*   **Shared Workspace (Team Tier):** Multiple users with RBAC.
    *   **Roles:** Admin (full control), Contributor (can add/edit own transactions), Viewer (read-only).
    *   **Join Flow:** Invite via email or secure shareable link.
    *   **Approval Workflow:** Pending members must be approved by an Admin before viewing balances or adding expenses.

### Wallets
*   **Properties:** Name, Currency, Initial Balance, Current Balance, Held Balance.
*   **Seamless Conversion:** UI displays converted equivalent using cached global rates when wallet currency differs from user base currency.

### Transactions
*   **Quick Add:** Modal accessible via Cmd/Ctrl+K palette.
*   **Fields:** Amount, Type (Income/Expense/Transfer), Custom Date, Category ID, Notes, Receipt URL.
*   **Shared Context:** `paid_by` field, `split_with` array for divided costs.

### Recurring Expenses
*   **Properties:** Amount, Frequency (Daily/Weekly/Monthly), Status (Active/Inactive), Next Due Date.
*   **Smart Prompts:** Highlights upcoming expenses 3 days before due, one-click mark as paid.

### Savings Goals
*   **Logic:** Target amount and date. Contributions mark money as "on hold" in source Wallet.
*   **Gamification:** Progress bars with milestone animations at 25%, 50%, 100%.
*   **Completion:** Held money finalized as expense, goal locked as `complete`.

### Analytics & Monthly Snapshots
*   **Pre-computed:** `MonthlySnapshot` record per Workspace for instant dashboard loading.
*   **Interactive Dashboards:** Charts that allow drill-down into specific categories.

---

## 7. Mantine UI Component Map

### Layout & Navigation
| Feature | Mantine Component |
|---------|-------------------|
| App Shell | `AppShell` with `Navbar`, `Header`, `Aside` |
| Sidebar Navigation | `NavLink`, `UnstyledButton` with icons |
| Breadcrumbs | `Breadcrumbs` |
| Page Layout | `Container`, `Stack`, `Group`, `SimpleGrid` |
| Responsive Grid | `SimpleGrid`, `Grid`, `Stack` with `useMediaQuery` |
| Tabs | `Tabs` (for settings, account views) |

### Data Display
| Feature | Mantine Component |
|---------|-------------------|
| Wallet Cards | `Card`, `Card.Section`, `Group`, `Stack` |
| Transaction List | `Table`, `ScrollArea`, `Text`, `Badge` |
| Balance Display | `Text` with `c()` prop for color coding |
| Goal Progress | `Progress` with `sections` prop |
| Dashboard Stats | `Paper`, `Text`, `ThemeIcon`, `Group` |
| Empty States | `Stack`, `Text`, `Button`, `Center` |
| Loading States | `Skeleton`, `Loader`, `Center` |
| Avatars | `Avatar`, `Avatar.Group` |
| Currency Display | Custom `Text` with locale-aware formatting |

### Forms & Inputs
| Feature | Mantine Component |
|---------|-------------------|
| Transaction Form | `TextInput`, `NumberInput`, `Select`, `DatePickerInput`, `Textarea` |
| Wallet Creation | `TextInput`, `Select` (currency), `NumberInput` (balance) |
| Category Management | `TextInput`, `ColorInput`, `ImageInput` |
| Goal Form | `TextInput`, `NumberInput`, `DatePickerInput` |
| Recurring Setup | `Select` (frequency), `Switch` (active), `NumberInput` |
| Settings | `Switch`, `Select` (currency/timezone), `ColorSchemeToggle` |
| Search/Filter | `TextInput` with `leftSection`, `Chip.Group` for filters |
| Validation | `useForm()` with Zod resolver |

### Feedback & Overlays
| Feature | Mantine Component |
|---------|-------------------|
| Confirmations | `Modal` with `Stack`, `Group`, `Button` |
| Quick Add | `Spotlight` (Cmd+K) or `Drawer` |
| Toast Notifications | `notifications.show()` from `@mantine/notifications` |
| Warnings | `Alert` with `IconAlertTriangle` |
| Tooltips | `Tooltip` on action buttons |
| Context Menu | `Menu` with `Menu.Item`, `Menu.Divider` |

### Navigation & Actions
| Feature | Mantine Component |
|---------|-------------------|
| Primary Actions | `Button` with variants (`filled`, `light`, `subtle`) |
| Floating Action | `ActionIcon` or `Button` with `fixed` position |
| Pagination | `Pagination` for transaction lists |
| Dropdown Menus | `Menu`, `Select`, `Autocomplete` |
| Links | `Anchor`, `NavLink`, `UnstyledButton` |
| Back/Cancel | `Button` with `variant="subtle"`, `Anchor` |

### Data Tables
| Feature | Mantine Component |
|---------|-------------------|
| Sortable Tables | `Table` with custom sort handlers |
| Row Actions | `Menu` within table rows |
| Bulk Actions | `Checkbox` + `ActionIcon` group |
| Virtual Scrolling | `ScrollArea` or `react-window` integration |
| Export | Custom button triggering CSV/JSON export |

### Theme & Customization
| Feature | Implementation |
|---------|----------------|
| Color Scheme | `MantineProvider` with `theme.colorScheme` |
| Custom Colors | `theme.colors` extension in theme object |
| Dark Mode | `useComputedColorScheme()`, `ActionIcon` toggle |
| Typography | `theme.fontFamily`, `Text` component props |
| Spacing | Mantine spacing scale (`xs`, `sm`, `md`, `lg`, `xl`) |
| Borders | `theme.radius`, `theme.border` |
| Shadows | `theme.shadows`, `Paper` with `shadow` prop |
| CSS Variables | `--mantine-color-*` for custom overrides |

---

## 8. Testing Strategy

### Unit Tests (Per Module)
After completing each module, write and run unit tests:
*   **Service Layer:** Mock DB/Redis, test business logic, edge cases, error handling
*   **Utility Functions:** Currency conversion, date formatting, validation schemas
*   **API Routes:** Request/response contract testing, auth middleware, permission checks
*   **React Components:** Render testing, form validation, user interaction mocks

### Integration Tests (Per Module)
*   **Database Operations:** Real MongoDB (test container), verify queries, indexes, transactions
*   **Redis Operations:** Real Redis (test container), verify cache patterns, TTL behavior
*   **API Endpoints:** Full HTTP cycle with test DB, verify status codes, response shapes

### E2E Tests (Full Application)
After all modules complete, write full application tests:
*   **Onboarding Flow:** Signup → Onboarding → First Workspace → First Wallet
*   **Transaction Lifecycle:** Add → Edit → Delete → Verify Balance Update
*   **Workspace Collaboration:** Invite → Accept → Role Change → Permission Enforcement
*   **Billing Flow:** Subscription Upgrade → Downgrade → Cancel → Feature Gating
*   **Recurring Expenses:** Create → Auto-trigger → Mark Paid → Balance Verify
*   **Savings Goals:** Create → Contribute → Milestone → Complete
*   **Multi-Currency:** Create Wallet → Add Transaction → Verify Conversion → Exchange Rate Update

### Test Execution
*   Run tests after each module: `bun test:module {module-name}`
*   Run full suite after completion: `bun test:all`
*   Coverage threshold: 80% minimum per module
*   Fix failures immediately, never skip

### Elysia-Specific Testing
```typescript
// Backend API test example
import { Elysia } from 'elysia'
import { describe, it, expect } from 'bun:test'

describe('Transaction API', () => {
  it('should create transaction with valid data', async () => {
    const app = new Elysia().use(transactionRoutes)
    const res = await app.handle(
      new Request('http://localhost/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100, type: 'expense', walletId: 'xxx' })
      })
    )
    expect(res.status).toBe(201)
  })
})
```

---

## 9. Implementation Roadmap

### Phase 1: Core Infrastructure & Auth
*   **Modules:** Project setup, Docker config, MongoDB schemas, Redis config, Auth (Better-Auth), User Settings
*   **Deliverables:** Working auth, user provisioning, Docker stack running, default admin account seeded
*   **Tests:** Auth flows, session management, user CRUD, admin provisioning

### Phase 2: Workspaces & Wallets
*   **Modules:** Workspace CRUD, RBAC, Invite system, Wallet CRUD, Multi-currency support
*   **Deliverables:** Personal/shared workspaces, wallet management, currency conversion
*   **Tests:** Permission enforcement, invite flow, balance calculations, concurrent balance updates

### Phase 3: Transaction Engine
*   **Modules:** Transaction CRUD, Categories (hierarchical), Tags, Recurring expenses, Quick Add (Cmd+K), Monthly snapshots
*   **Deliverables:** Full transaction management, automation, analytics
*   **Tests:** Transaction lifecycle, recurring triggers, snapshot generation, transfer atomicity

### Phase 4: Goals, Budgets & Analytics
*   **Modules:** Goal CRUD, Budget CRUD, Progress tracking, Dashboard charts, Audit logs, Notifications
*   **Deliverables:** Goal gamification, budget alerts, interactive analytics, activity tracking
*   **Tests:** Goal completion flow, budget threshold alerts, chart data accuracy, audit log integrity

### Phase 5: Billing & Polish
*   **Modules:** Stripe/LemonSqueezy integration, Subscription tiers, Feature flags, PWA, Performance optimization
*   **Deliverables:** SaaS billing, tier enforcement, offline support, optimized bundle
*   **Tests:** Billing webhooks, tier limits, upgrade/downgrade flows, feature flag toggling

### Phase 6: Deployment & Final Testing
*   **Modules:** Nginx config, SSL setup, Docker production build, E2E test suite
*   **Deliverables:** Production-ready deployment, comprehensive test coverage
*   **Tests:** Full E2E suite, load testing, security audit

---

## 10. Edge Cases & Defensive Coding

### Data Integrity
*   Never trust client-side calculations — validate all amounts server-side
*   Use MongoDB transactions for multi-document operations (e.g., transfer between wallets)
*   Implement idempotency keys for payment webhooks
*   Verify workspace membership before any data access

### Concurrency
*   Use atomic MongoDB operations (`$inc`, `$push`) for balance updates
*   Redis distributed locks for critical sections (recurring job execution)
*   Optimistic locking with version field for workspace settings

### Security
*   RBAC checks at API layer, not just frontend
*   Sanitize all user inputs (Zod validation)
*   Rate limiting per IP and per user
*   CORS configured per environment
*   No secrets in client bundle

### Performance
*   Paginate all list endpoints (default 20, max 100)
*   Use MongoDB aggregation pipelines for analytics, not application-level processing
*   Redis caching for read-heavy endpoints
*   Lazy load frontend routes
*   Optimize Mantine bundle with tree-shaking

### User Experience
*   Graceful error messages, never expose stack traces
*   Loading skeletons for all async data
*   Optimistic UI updates with rollback on failure
*   Offline support for read operations (PWA)
*   Currency formatting based on locale

---

## 11. API Design

### Conventions
*   RESTful routes: `GET /api/workspaces`, `POST /api/transactions`
*   Consistent response format: `{ success: boolean, data?: T, error?: string }`
*   Pagination: `?page=1&limit=20` with `{ data: T[], total: number, page: number, pages: number }`
*   Filtering: `?walletId=xxx&category=food&dateFrom=2024-01-01&dateTo=2024-12-31`

### Auth
*   Better-Auth session cookies (httpOnly, secure, sameSite)
*   Bearer token fallback for mobile API clients
*   Middleware: `requireAuth()`, `requireWorkspaceRole(role)`

### Webhooks
*   Stripe/LemonSqueezy webhooks for subscription events
*   Idempotency key validation
*   Background queue processing via Redis

---

## 12. Module Structure

```
src/
├── modules/
│   ├── auth/           # Better-Auth, sessions, OAuth
│   ├── users/          # User profiles, settings
│   ├── workspaces/     # Workspace CRUD, RBAC, invites
│   ├── wallets/        # Wallet CRUD, balances, multi-currency
│   ├── categories/     # Transaction categories
│   ├── tags/           # Transaction tags
│   ├── transactions/   # Transaction CRUD, splits, transfers
│   ├── recurring/      # Recurring expense automation
│   ├── goals/          # Savings goals, contributions
│   ├── budgets/        # Category spending limits
│   ├── analytics/      # Dashboard, charts, snapshots
│   ├── billing/        # Stripe/LemonSqueezy integration
│   ├── notifications/  # In-app notifications
│   ├── files/          # File upload metadata
│   ├── audit/          # Activity logging
│   ├── config/         # Global system config
│   └── feature-flags/  # Per-tenant feature toggles
├── shared/
│   ├── interfaces/     # TypeScript interfaces per module
│   ├── utils/          # Currency, date, validation helpers
│   ├── middleware/      # Auth, RBAC, rate limiting
│   └── db/             # MongoDB connection, Redis client
├── api/                # Elysia route definitions
└── frontend/           # Next.js app (if co-located)
```

### Module Contract
Every module MUST export:
1. `interfaces.ts` — TypeScript types for all entities, DTOs, and service contracts
2. `service.ts` — Business logic, depends only on interfaces
3. `repository.ts` — Database operations, implements repository interface
4. `routes.ts` — Elysia route definitions, uses service
5. `validation.ts` — TypeBox schemas for all inputs
6. `__tests__/` — Unit and integration tests

---

## 13. Elysia-Specific Patterns

### Eden Treaty Integration
```typescript
// Backend: src/api/routes.ts
import { Elysia, t } from 'elysia'

const app = new Elysia()
  .post('/api/transactions', async ({ body }) => {
    return await transactionService.create(body)
  }, { body: CreateTransactionSchema })
  .listen(3000)

export type App = typeof app

// Frontend: src/lib/api.ts
import { treaty } from '@elysiajs/eden'
import type { App } from '../../api'

const api = treaty<App>('http://localhost:3000')

// Fully typed request/response
const { data } = await api.transactions.post({ amount: 100, type: 'expense' })
```

### TypeBox Schema Pattern
```typescript
// Shared: src/modules/transactions/validation.ts
import { t } from 'elysia'

export const CreateTransactionSchema = t.Object({
  amount: t.Number({ minimum: 0.01, maximum: 999999999 }),
  type: t.Union([t.Literal('income'), t.Literal('expense'), t.Literal('transfer')]),
  walletId: t.String({ format: 'uuid' }),
  categoryId: t.Optional(t.String({ format: 'uuid' })),
  date: t.Optional(t.String({ format: 'date-time' })),
  notes: t.Optional(t.String({ maxLength: 500 })),
  splitWith: t.Optional(t.Array(t.Object({
    userId: t.String({ format: 'uuid' }),
    amount: t.Number({ minimum: 0.01 })
  })))
})
```

### Elysia Middleware Pattern
```typescript
// Shared middleware: src/shared/middleware/auth.ts
import { Elysia } from 'elysia'

export const requireAuth = new Elysia()
  .derive(async ({ headers, cookie }) => {
    const session = await authService.validateSession(cookie.session.value)
    if (!session) throw new Error('Unauthorized')
    return { user: session.user }
  })

export const requireWorkspaceRole = (role: 'admin' | 'contributor' | 'viewer') =>
  new Elysia()
    .use(requireAuth)
    .derive(async ({ user, params }) => {
      const membership = await workspaceService.getMembership(user.id, params.workspaceId)
      if (!membership || !hasPermission(membership.role, role)) {
        throw new Error('Forbidden')
      }
      return { membership }
    })
```

---

## 14. Additional SaaS Features

### Feature Flags System
*   **Purpose:** Gradual rollout of features per workspace/tenant
*   **Storage:** `feature_flags` collection in MongoDB + Redis cache
*   **Key Pattern:** `feature:{flagName}:{workspaceId}` with 5 min TTL
*   **Use Cases:** Beta features, A/B testing, tier-based feature gating

### Notifications System
*   **In-App Notifications:** Stored in `notifications` collection
*   **Types:** Workspace invites, budget alerts, goal milestones, recurring reminders
*   **Real-time:** WebSocket push for live updates (optional enhancement)
*   **User Controls:** Granular notification preferences per type

### File Upload & Storage
*   **Use Cases:** Receipt images, transaction attachments, profile avatars
*   **Storage:** Local filesystem in Docker volume (or S3-compatible in production)
*   **Metadata:** Stored in `files` collection, linked to transactions/goals
*   **Validation:** File type restrictions, size limits (10MB max)

### Export & Import
*   **Export Formats:** CSV, PDF for transactions and reports
*   **Import:** CSV import for bulk transaction entry
*   **Date Range:** User-selectable export periods
*   **Workspace-scoped:** Exports respect workspace boundaries

### Multi-Currency Exchange Rates
*   **Source:** Free API (exchangerate-api.com or similar)
*   **Cron Job:** Daily fetch and cache in `cache:rates:{date}`
*   **Fallback:** Use last cached rate if API unavailable
*   **Supported Currencies:** USD, BDT, EUR, GBP, BTC, ETH + user-requested

### Budget Management
*   **Per-Category Budgets:** Set spending limits per category
*   **Period:** Monthly or yearly budget cycles
*   **Alerts:** 80% and 100% threshold notifications
*   **Rollover:** Optional unused budget rollover to next period

### Transaction Tags
*   **User-Defined:** Custom tags per workspace
*   **Flexible:** Multiple tags per transaction
*   **Filtering:** Filter transactions by tag combinations
*   **Color Coding:** Optional color per tag for visual distinction

### Email Templates
*   **Transactional:** Welcome, password reset, workspace invite, receipt
*   **System:** Budget alerts, goal milestones, subscription changes
*   **Provider:** Resend or SendGrid (API key in env)
*   **Templating:** React Email or MJML for responsive templates

### Search & Filtering
*   **Full-Text Search:** Transaction notes, category names, tags
*   **Advanced Filters:** Date range, amount range, category, wallet, type
*   **Saved Filters:** Users can save and reuse filter combinations
*   **Debounced Search:** 300ms debounce for search input
*   **Search Index:** Redis-cached for common queries (5 min TTL)

---

## 15. Real-Time Features (WebSocket)

### Architecture Overview
*   **Protocol:** Elysia native WebSocket (uWebSocket under the hood)
*   **Scaling:** Redis Pub/Sub for multi-instance distribution
*   **Auth:** WebSocket handshake validates session cookie/token
*   **Reconnection:** Client auto-reconnects with exponential backoff

### WebSocket Endpoint
```
ws://{host}/ws?token={sessionToken}
```

### Channel System
Users subscribe to channels for specific data updates:

| Channel | Purpose | Example Event |
|---------|---------|---------------|
| `user:{userId}` | Personal notifications, settings changes | Profile updated, subscription changed |
| `workspace:{wsId}` | Workspace activity feed | Transaction added, member joined |
| `wallet:{walletId}` | Balance updates | Payment received, transfer completed |
| `budget:{budgetId}` | Budget alerts | 80% threshold reached, exceeded |
| `goal:{goalId}` | Goal milestones | 50% reached, goal completed |
| `recurring:{ruleId}` | Recurring reminders | Upcoming expense in 3 days |

### Redis Pub/Sub Pattern
```
Key Pattern: ws:channel:{channelName}
Message Format: { type: string, payload: object, timestamp: number }

Backend publishes → Redis → All instances receive → Forward to subscribed WebSocket clients
```

### Event Types
```typescript
type RealTimeEvent =
  | { type: 'transaction:created'; payload: Transaction }
  | { type: 'transaction:updated'; payload: Transaction }
  | { type: 'transaction:deleted'; payload: { id: string } }
  | { type: 'wallet:balance_updated'; payload: { walletId: string; balance: number } }
  | { type: 'budget:threshold'; payload: { budgetId: string; percentage: number } }
  | { type: 'goal:milestone'; payload: { goalId: string; milestone: 25 | 50 | 75 | 100 } }
  | { type: 'notification:new'; payload: Notification }
  | { type: 'workspace:member_joined'; payload: { userId: string; role: string } }
  | { type: 'workspace:member_left'; payload: { userId: string } }
  | { type: 'recurring:upcoming'; payload: { ruleId: string; dueDate: string } }
  | { type: 'snapshot:updated'; payload: { month: string } }
```

### Frontend Integration (TanStack Query + WebSocket)
```typescript
// Auto-invalidate queries on real-time events
useWebSocket(`ws://${host}/ws?token=${token}`, {
  onMessage: (event) => {
    const { type, payload } = JSON.parse(event.data)
    
    switch (type) {
      case 'transaction:created':
      case 'transaction:updated':
      case 'transaction:deleted':
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        queryClient.invalidateQueries({ queryKey: ['wallet-balance', payload.walletId] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
        break
      case 'wallet:balance_updated':
        queryClient.setQueryData(['wallet-balance', payload.walletId], payload.balance)
        break
      case 'budget:threshold':
        notifications.show({ title: 'Budget Alert', message: `Reached ${payload.percentage}%` })
        break
      case 'notification:new':
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        break
    }
  }
})
```

### Backend Event Emission Pattern
```typescript
// After any mutation, emit real-time event
async function emitToWorkspace(workspaceId: string, event: RealTimeEvent) {
  await redis.publish(`ws:channel:workspace:${workspaceId}`, JSON.stringify(event))
}

async function emitToUser(userId: string, event: RealTimeEvent) {
  await redis.publish(`ws:channel:user:${userId}`, JSON.stringify(event))
}

// Usage in transaction service
async function createTransaction(data: CreateTransaction) {
  const transaction = await db.transactions.insert(data)
  await updateWalletBalance(data.walletId, data.amount, data.type)
  
  // Emit to all workspace members
  await emitToWorkspace(data.workspaceId, {
    type: 'transaction:created',
    payload: transaction
  })
  
  return transaction
}
```

### Connection Management
```
Redis Key: ws:connections:{userId}
Type: Set
Value: Connection IDs (UUID per tab/device)
TTL: None (deleted on disconnect)

Redis Key: ws:subscriptions:{connectionId}
Type: Set
Value: Channel names this connection subscribes to
TTL: None (deleted on disconnect)
```

### Performance Considerations
*   **Message Batching:** Batch multiple events within 100ms window into single WebSocket message
*   **Selective Subscription:** Frontend only subscribes to channels relevant to current view
*   **Payload Compression:** Use perMessageDeflate for large payloads
*   **Heartbeat:** Ping/Pong every 30s to detect stale connections
*   **Rate Limiting:** Max 100 messages/sec per connection, 1000 messages/sec per workspace

---

## 16. Security Hardening

### Authentication Security
*   **Session Rotation:** Rotate session IDs after login and privilege changes
*   **CSRF Protection:** SameSite cookies + CSRF tokens for state-changing operations
*   **Rate Limiting:** Progressive delays after failed attempts (5 attempts → 1 min lock → 2 min → exponential)
*   **Password Hashing:** Better-Auth handles bcrypt/argon2 automatically

### API Security
*   **Input Sanitization:** TypeBox validation at route level, reject unknown fields
*   **SQL/NoSQL Injection:** Parameterized queries only, never interpolate user input
*   **Rate Limiting:** Per-IP (100 req/min) and per-user (200 req/min) via Redis sliding window
*   **CORS:** Strict origin allowlist per environment (dev/staging/prod)
*   **Security Headers:** CSP, X-Frame-Options, X-Content-Type-Options via Nginx

### Data Security
*   **Encryption at Rest:** MongoDB encryption for sensitive fields (SSN, API keys)
*   **Encryption in Transit:** TLS 1.3 enforced via Nginx SSL
*   **PII Handling:** Log redaction for emails, names in audit logs
*   **File Upload:** Validate MIME types, scan for malware (ClamAV optional), strip EXIF data
*   **Secrets Management:** Environment variables only, never in code or git

### Workspace Security
*   **Data Isolation:** Query-level workspace filtering on every data access
*   **Invite Tokens:** Cryptographically random, single-use, 7-day expiry
*   **Role Escalation Prevention:** Admin approval required for role changes
*   **Audit Trail:** Log all CRUD operations in shared workspaces

---

## 17. Performance Optimization

### Backend Optimization
*   **Connection Pooling:** MongoDB pool size 10-20 per container
*   **Redis Pipeline:** Batch multiple Redis operations into single round-trip
*   **Query Optimization:** Cover queries with indexes, use `projection` to limit fields
*   **Response Compression:** Gzip responses >1KB via Nginx
*   **Keep-Alive:** HTTP keep-alive for persistent connections

### Frontend Optimization
*   **Bundle Splitting:** Route-based code splitting with Next.js dynamic imports
*   **Mantine Tree-Shaking:** Import only used components (`@mantine/core/Button`)
*   **Image Optimization:** Next.js Image component with blur placeholders
*   **Font Loading:** Self-hosted Inter font, preload critical variants
*   **Prefetching:** TanStack Query staleTime + prefetch on hover

### Caching Strategy
*   **CDN:** Nginx serves static assets with `Cache-Control: max-age=31536000`
*   **API Cache:** Dashboard stats cached 10 min, invalidated on transaction write
*   **Query Cache:** MongoDB aggregation results cached per workspace/month
*   **Client Cache:** TanStack Query handles stale-while-revalidate

### Database Optimization
*   **Read Preferences:** Secondary reads for dashboard analytics
*   **Write Concern:** `w: majority` for financial data, `w: 1` for non-critical
*   **Compound Indexes:** Cover common query patterns (workspace + date + type)
*   **Aggregation Pipelines:** Pre-computed monthly snapshots avoid real-time aggregation

---

## 18. Monitoring & Observability

### Logging (Performant with Rotation)

**Logger:** Use `pino` (fastest Node.js/Bun logger, 5x faster than winston, zero string allocation in hot paths)
*   **Async Writes:** Non-blocking log emission, never block request handling
*   **Buffered Output:** Batch log writes every 1 second or 4KB buffer, flush on shutdown
*   **Minimum Overhead:** <0.5ms per log call in production

**Log Rotation (Auto-Cleanup):**
```typescript
// src/shared/utils/logger.ts
import pino from 'pino'
import { createWriteStream } from 'fs'

const logStream = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { destination: 1 }, // stdout
    },
    {
      target: 'pino/file',
      options: { 
        destination: './logs/app.log',
        mkdir: true
      }
    }
  ]
})

// Rotation config: delete logs older than 7 days OR when file exceeds 50MB
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label })
  }
}, logStream)

// Log retention policy:
// - app.log: Rotate daily, keep max 7 days (200MB total cap)
// - error.log: Rotate daily, keep max 30 days (500MB total cap)
// - audit.log: Keep 1 year (compliance), then archive to cold storage
// - Docker volume: Mount /var/log/wexpense, auto-cleanup via logrotate
```

**Structured Log Format:**
```json
{
  "level": "info",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_abc123",
  "userId": "user_xyz",
  "workspaceId": "ws_abc",
  "message": "Transaction created",
  "duration": 45,
  "metadata": { "walletId": "wallet_1", "amount": 100 }
}
```

**Log Levels by Environment:**
*   **Development:** `debug` — all logs, including SQL queries
*   **Staging:** `info` — info + warn + error
*   **Production:** `warn` — warn + error only (minimize I/O)

**Log Cleanup (Cron Job):**
```bash
# Daily at 02:00 UTC — runs inside Docker container
find /var/log/wexpense -name "*.log" -mtime +7 -delete
find /var/log/wexpense -name "*.log.gz" -mtime +30 -delete
```

**Performance Rules:**
1. **Never log in hot paths** (transaction loops, balance calculations)
2. **Sample debug logs** (1 in 100 requests in production)
3. **Sanitize PII** — redact emails, names, API keys before logging
4. **Use child loggers** — create per-request context, avoid repeated field injection
5. **Disable in tests** — set `LOG_LEVEL=silent` during test runs

### Metrics
*   **Request Metrics:** Latency p50/p95/p99, throughput, error rate
*   **Business Metrics:** Active users, transactions/day, workspace growth
*   **Infrastructure:** MongoDB connection pool, Redis memory, Docker container stats

### Health Checks
*   **Endpoint:** `GET /api/health` returns `{ status: "ok", db: "connected", redis: "connected" }`
*   **Docker:** Health check in docker-compose for container restart policy
*   **Nginx:** Upstream health checks for backend container

### Backup & Disaster Recovery
*   **MongoDB:** Daily `mongodump` to volume, retain 7 days
*   **Redis:** RDB snapshots every 15 min, AOF for durability
*   **Recovery:** Documented restore procedure in `scripts/restore.sh`
*   **RTO:** Recovery Time Objective < 1 hour
*   **RPO:** Recovery Point Objective < 15 minutes

### GDPR & Data Compliance
*   **Data Export:** `GET /api/user/export` returns all user data as JSON
*   **Right to Delete:** `DELETE /api/user/account` soft-deletes, purges after 30 days
*   **Data Retention:** Audit logs retained 1 year, then archived
*   **Consent:** Track marketing consent in `user_settings`
*   **No Third-Party Tracking:** No analytics without user consent

---

## 19. Development Workflow

### Code Organization
*   **Module Boundary:** Each module has its own directory with `index.ts` barrel export
*   **Shared Code:** `shared/` contains cross-cutting concerns (auth, validation, DB)
*   **API Layer:** `api/` contains only Elysia route definitions, delegates to modules
*   **Type Safety:** Eden Treaty ensures frontend/backend contract compliance

### Git Strategy
*   **Main Branch:** Production-ready code
*   **Feature Branches:** One branch per feature/module
*   **Commit Convention:** `feat:`, `fix:`, `chore:`, `test:` prefixes
*   **PR Reviews:** Required for main branch merges

### Environment Configuration
*   **Development:** `docker-compose.dev.yml` with hot reload, debug ports
*   **Production:** `docker-compose.yml` optimized builds, no dev dependencies
*   **Environment Variables:** `.env.example` with all required variables documented
*   **Secrets:** Never commit `.env` files, use Docker secrets or host env vars

---

## 20. CI/CD & Code Quality

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongo:
        image: mongo:7
        ports: ['27017:27017']
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test:all
        env:
          MONGO_URI: mongodb://localhost:27017/wexpense-test
          REDIS_URI: redis://localhost:6379

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ssh rakib "cd /var/www/WeXpense && git pull origin main && docker compose up -d --build"
```

### Code Quality Tools
*   **ESLint:** `@elysiajs/eslint-plugin` + `typescript-eslint`
*   **Prettier:** Consistent formatting, configured in `.prettierrc`
*   **Husky:** Pre-commit hooks for lint-staged
*   **lint-staged:** Run ESLint + Prettier on staged files only

### API Documentation (OpenAPI)
*   **Plugin:** `@elysiajs/swagger`
*   **Endpoint:** `GET /swagger` for interactive API docs
*   **Auto-generated:** From TypeBox schemas
*   **Versioning:** API version in URL (`/api/v1/...`)

### Global Error Handler
```typescript
// src/shared/middleware/error-handler.ts
import { Elysia } from 'elysia'

export const errorHandler = new Elysia().onError(({ code, error }) => {
  const message = error instanceof Error ? error.message : 'Internal Server Error'
  
  switch (code) {
    case 'VALIDATION':
      return { success: false, error: message, status: 400 }
    case 'NOT_FOUND':
      return { success: false, error: message, status: 404 }
    case 'UNAUTHORIZED':
      return { success: false, error: message, status: 401 }
    case 'FORBIDDEN':
      return { success: false, error: message, status: 403 }
    default:
      console.error('[ERROR]', { code, message, stack: error?.stack })
      return { success: false, error: 'Internal Server Error', status: 500 }
  }
})
```

### Structured Logging
```typescript
// src/shared/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  requestId?: string
  userId?: string
  workspaceId?: string
  duration?: number
  metadata?: Record<string, any>
  timestamp: string
}

export function log(entry: Omit<LogEntry, 'timestamp'>) {
  console.log(JSON.stringify({
    ...entry,
    timestamp: new Date().toISOString()
  }))
}
```

---

## 21. Deployment

### Git Setup (First Time)
```bash
git init
git remote add origin https://github.com/alraakib/WeXpense.git
git branch -M main
git add .
git commit -m "initial commit"
git push -u origin main
```

### VPS Deployment
*   **Host:** `ssh rakib` (VPS)
*   **Domain:** `wexpense.is-from.bd`
*   **SSL:** Cloudflare Managed SSL ( termination at Cloudflare edge)
*   **GitHub Auth:** VPS authenticated via `gh auth login` (no SSH keys needed)
*   **Deploy On Success:** After successful build and all tests pass, automatically deploy

### Deployment Steps
```bash
# 1. SSH into VPS
ssh rakib

# 2. Navigate to project directory
cd /var/www/WeXpense

# 3. Pull latest code from GitHub
git pull origin main

# 4. Build and start containers
docker compose -f docker-compose.yml up -d --build

# 5. Run migrations/seed if needed
docker compose exec backend bun run seed

# 6. Verify deployment
curl -s http://localhost:8080/api/health
```

### Nginx Configuration (on VPS)
```nginx
server {
    listen 80;
    server_name wexpense.is-from.bd;
    
    # Cloudflare handles SSL, forward to backend
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # WebSocket upgrade
    location /ws {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### Cloudflare Setup (Already Done)
*   **DNS A Record:** `wexpense.is-from.bd` → VPS IP
*   **SSL Mode:** Full (Strict) — Cloudflare terminates SSL, backend receives HTTP
*   **Always Use HTTPS:** Enabled
*   **Auto Minify:** JS, CSS, HTML enabled
*   **Brotli:** Enabled for compression

### Post-Deployment Verification
*   Health check: `https://wexpense.is-from.bd/api/health`
*   WebSocket: `wss://wexpense.is-from.bd/ws`
*   Admin login: `alraakib@gmail.com` / `Rkb243116`

### Rollback Strategy
```bash
# If deployment fails, rollback to previous version
git log --oneline -5  # Find last working commit
git checkout <commit-hash>
docker compose -f docker-compose.yml up -d --build
```

---

## 22. Configuration Files

### Required Files
```
├── .env.example                    # Environment variables template
├── docker-compose.yml              # Production Docker setup
├── docker-compose.dev.yml          # Development with hot reload
├── backend/
│   ├── Dockerfile                  # Elysia backend build
│   └── .env                        # Backend env (not committed)
├── frontend/
│   ├── Dockerfile                  # Next.js frontend build
│   └── .env.local                  # Frontend env (not committed)
└── nginx/
    └── nginx.conf                  # Nginx config for VPS
```

### Environment Variables (.env.example)
```bash
# Database
MONGO_URI=mongodb://mongo:27017/wexpense
REDIS_URI=redis://redis:6379

# Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:8080

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Billing
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
APP_URL=http://localhost:3000
API_URL=http://localhost:8080

# Exchange Rates
EXCHANGE_RATE_API_KEY=
```

---

## 23. Frontend Routes & Pages

### Route Structure
```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx                    # Dashboard home
│   │   ├── transactions/
│   │   │   ├── page.tsx                # Transaction list
│   │   │   └── [id]/page.tsx           # Transaction detail
│   │   ├── wallets/
│   │   │   ├── page.tsx                # Wallet list
│   │   │   └── [id]/page.tsx           # Wallet detail
│   │   ├── goals/
│   │   │   ├── page.tsx                # Goals list
│   │   │   └── [id]/page.tsx           # Goal detail
│   │   ├── budgets/page.tsx            # Budget management
│   │   ├── recurring/page.tsx          # Recurring expenses
│   │   ├── analytics/page.tsx          # Charts & reports
│   │   ├── workspace/
│   │   │   ├── page.tsx                # Workspace settings
│   │   │   └── members/page.tsx        # Member management
│   │   └── settings/
│   │       ├── page.tsx                # User settings
│   │       └── billing/page.tsx        # Subscription management
│   ├── onboarding/
│   │   ├── page.tsx                    # 3-step wizard
│   │   └── layout.tsx
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Landing/redirect
├── components/
│   ├── shared/                         # Reusable components
│   ├── transactions/                   # Transaction-specific
│   ├── wallets/                        # Wallet-specific
│   ├── goals/                          # Goal-specific
│   └── dashboard/                      # Dashboard widgets
└── lib/
    ├── api.ts                          # Eden Treaty client
    ├── stores/                         # Zustand stores
    └── hooks/                          # Custom React hooks
```

### Key Frontend Features
*   **Quick Add (Cmd+K):** Spotlight modal for instant transaction entry
*   **Optimistic Updates:** UI updates immediately, rolls back on error
*   **Loading Skeletons:** Skeleton loaders for all async data
*   **Dark Mode:** System preference detection + manual toggle
*   **Responsive:** Mobile-first design with Mantine breakpoints
*   **Offline Support:** Service worker for read-only PWA access
*   **Accessibility:** WCAG 2.1 AA compliant, keyboard navigable, screen reader friendly
*   **Keyboard Shortcuts:** Cmd+K (Quick Add), Cmd+/ (Help), Escape (Close modals)
*   **Drag & Drop:** File upload via Mantine Dropzone, transaction reordering

### Accessibility Standards
*   **Focus Management:** Visible focus indicators, logical tab order
*   **ARIA Labels:** All interactive elements labeled
*   **Color Contrast:** 4.5:1 minimum for text, 3:1 for large text
*   **Alt Text:** All images and icons have descriptive alt text
*   **Form Labels:** All inputs associated with labels
*   **Error Announcements:** Screen reader announcements for validation errors

---

## 24. Scripts & Automation

### Required Scripts
```bash
# Package.json scripts
"dev": "bun run --watch src/index.ts"
"build": "bun build src/index.ts --outdir ./dist"
"start": "bun run dist/index.js"
"test": "bun test"
"test:module": "bun test src/modules/{module}/"
"test:all": "bun test --coverage"
"seed": "bun run src/scripts/seed.ts"
"migrate": "bun run src/scripts/migrate.ts"
"cron:rates": "bun run src/scripts/cron-exchange-rates.ts"
```

### Seed Script (src/scripts/seed.ts)
```typescript
// Creates default admin account on first run
// Email: alraakib@gmail.com
// Password: Rkb243116
// Role: Super Admin
```

### Cron Jobs
*   **Exchange Rates:** Daily fetch at 00:00 UTC, cache in `cache:rates:{date}`
*   **Recurring Expenses:** Every hour, check for due expenses, create transactions
*   **Budget Alerts:** Every 6 hours, check budget thresholds, send notifications
*   **Cleanup:** Daily, remove expired sessions, old rate limits
