# Code Review & Technical Debt Reference

## Code Review Best Practices

**What to look for (in order of priority):**

1. **Correctness** — Does the code handle the requirements? Are edge cases covered?
2. **Security** — Input validation, auth checks, secrets handling, injection risks
3. **Performance** — N+1 queries, memory leaks, unnecessary computations
4. **Design** — Consistent with architecture, separation of concerns, testability
5. **Maintainability** — Readability, naming, comments on non-obvious logic
6. **Completeness** — Tests, error handling, logging, documentation

**How to give feedback:**

- **Constructive**: "This approach has a race condition — consider using a mutex" (not "This is wrong")
- **Explain why**: "Caching this endpoint reduces DB load by 40%" not "Add caching here"
- **Ask questions**: "What happens if the database is unavailable here?" rather than "Add error handling"
- **Separate nitpicks**: Mark as `nit:` prefix for style preferences, non-blocking suggestions
- **Approach with blocking/non-blocking labels**: `blocking:` for correctness/security issues, `suggestion:` for improvements

## Code Review Process

**PR size limits:**

| Size | Lines Changed | Review Quality |
|------|---------------|----------------|
| Tiny | <50 | Quick scan, approve |
| Small | 50-200 | Thorough review |
| Optimal | 200-400 | Deep review |
| Large | 400-1000 | Surface review only — ask to split |
| Massive | >1000 | Reject — requires decomposition |

**Review turnaround SLAs:**

| Severity | Time | Action |
|----------|------|--------|
| Bug fix | <4 hours | Prioritize over feature reviews |
| Feature PR (standard) | <24 hours | Review same day |
| Draft/WIP | <48 hours | Review when marked ready |
| Urgent (hotfix) | <1 hour | Pager-worthy, block everything |

**Ownership rules:**
- Author merges after approvals (not reviewer)
- Minimum 1 approval for standard PRs, 2 for critical paths (auth, payments, data)
- Request changes = author fixes and re-requests review
- No self-approval (even for tiny changes)

## Technical Debt Management

**Debt Quadrants (Fowler):**

| | Reckless | Prudent |
|---|---|---|
| **Deliberate** | "No time to fix" shortcuts | "Ship now, refactor next sprint" with ticket |
| **Inadvertent** | "We didn't know better" | "We learned this is wrong" — discovered in review |

**Tracking format:**

```
| ID | Description | Category | Interest | Effort | Owner | Sprint |
|----|-------------|----------|----------|-------|-------|--------|
| TD-042 | Missing DB indexes on orders table | Performance | Query latency +300ms | 2h | @db-team | 23 |
| TD-043 | Monolithic build pipeline | Process | CI takes 18 minutes | 1w | @devops | Q3 |
| TD-044 | No error boundaries in payment flow | Stability | SEV2 risk | 2d | @fe-team | 24 |
```

**Allocation:**
- Dedicate 15-20% of sprint capacity to debt reduction
- Track debt items in the backlog with labels (`debt`, `interest-free`)
- Debt with compounding interest (blocking other work, causing incidents) takes priority

## Refactoring Strategies

| Strategy | When | Approach |
|----------|------|----------|
| **Strangler Fig** | Large monolith → microservices | Gradually replace components, route traffic incrementally |
| **Boy Scout Rule** | Ongoing debt | "Leave code cleaner than you found it" — improve locals while touching files |
| **Big Bang** | Small, well-defined scope | Team focuses on rewrite, done in 1-2 sprints (risky for large systems) |
| **Parallel Run** | Data migration | Run old + new systems simultaneously, compare outputs |
| **Feature Flag Gate** | High-risk changes | Toggle old/new behind feature flag, canary roll out |

## API Deprecation Policies

**Deprecation lifecycle:**

```
v2.1.0 — Mark endpoint deprecated in docs + response header (Sunset: 2026-12-31)
v2.3.0 — Add warning log on usage
v3.0.0 — Remove endpoint, return 410 Gone
```

**Required elements:**
- Response header: `Sunset: Sat, 31 Dec 2026 23:59:59 GMT` and `Deprecation: true`
- Migration guide published at deprecation time (not removal time)
- Minimum deprecation window: 6 months for public APIs, 1 sprint for internal
- Document migration path in API response for `410 Gone`: `{ error: "gone", message: "Use /api/v3/orders instead", migration_url: "/docs/migrations/v3" }`

## Code Quality Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Cyclomatic Complexity** | <10 per function | `lizard`, `eslint complexity`, SonarQube |
| **Afferent Coupling (Ca)** | Reasonable | Dependency analysis tools |
| **Efferent Coupling (Ce)** | Low | Incoming dependency count |
| **Instability** (Ce/(Ca+Ce)) | 0-1 | 0 = stable, 1 = unstable |
| **Test Coverage** | >80% lines, >90% branches | Istanbul/nyc, Jest coverage |
| **Duplication** | <5% | `jscpd`, SonarQube |
| **Lines per file** | <300 | `cloc`, SonarQube |
| **Comment density** | 15-25% | Too little = hard to maintain, too much = code is unclear |

**Review metrics (track and trend):**
- Average PR review time (target: <24h)
- PR merge rate (target: >85%)
- Rework rate (changes requested vs approved — target: <30%)

## Automated Review Tooling

| Tool | Purpose | CI Integration |
|------|---------|----------------|
| **ESLint / Prettier** | JS/TS linting + formatting | `lint-staged` pre-commit, CI gate |
| **SonarQube / SonarCloud** | Code quality gate, debt, bugs, security | Post-merge analysis, quality gate |
| **CodeRabbit** | AI-powered PR review comments | GitHub/GitLab app, automatic |
| **Semgrep / CodeQL** | SAST, custom security rules | CI pipeline, blocks on critical |
| **Vale / cspell** | Documentation linting, spelling | CI check on docs changes |
| **knip / depcheck** | Dead code and unused dependency detection | Pre-merge CI check |
| **Tarantula / mutation testing** | Test quality (not just coverage) | Nightly CI, PR quality gate |
