# Documentation Patterns Reference

## README Structure

- **What** — One-line description of the project's purpose
- **Why** — Problem it solves, who it's for (1-2 paragraphs)
- **Quickstart** — Minimal setup with copy-paste commands
- **Features** — Bullet list of key capabilities (with badges)
- **API** — Link to full API docs (not inline unless tiny)
- **Configuration** — Table of env vars or config options
- **Contributing** — Link to CONTRIBUTING.md
- **License** — Standard license identifier
- **Badges** — CI status, coverage, version, license at top

## API Documentation

```
GET /api/v1/users
  Query: ?page=1&limit=20&sort=created_at&filter=active
  Response 200: { data: User[], meta: { page, limit, total } }
  Response 401: { error: "unauthorized", message: "Invalid token" }
  Response 429: { error: "rate_limited", retry_after: 30 }
```

- Document every endpoint with path, method, auth requirement
- Show request/response schemas (not just examples)
- Include error codes and their meanings
- Document rate limits, pagination, filtering conventions
- Authentication flow: header format, token expiry, refresh

## Diátaxis Framework

| Type | Question | Audience | Example |
|------|----------|----------|---------|
| **Tutorial** | "Can I learn?" | Newcomers | "Build your first app in 10 min" |
| **Guide** | "How do I X?" | Users with a goal | "Deploy to production" |
| **Reference** | "What is Y?" | All developers | "API endpoint reference" |
| **Explanation** | "Why does Z?" | Curious readers | "Architecture deep-dive" |

## Architecture Decision Records (ADR)

**Lifecycle**: Proposed → Accepted → Deprecated → Superseded

```
ADR-001: Title
Status: [Proposed | Accepted | Deprecated | Superseded by ADR-004]
Context: Problem statement and constraints
Decision: What was chosen and why (with rationale)
Consequences: Trade-offs, migration effort, risks
```

- One ADR per significant decision
- Date-stamp every entry
- Link superseded ADRs to their replacements
- Keep them short — 1-2 pages max

## Runbooks

**Structure for every runbook:**
1. **Purpose** — When to use this runbook (e.g., "When p99 latency exceeds 500ms")
2. **Prerequisites** — Access, permissions, tools needed
3. **Steps** — Numbered, ordered, exact commands to run
4. **Verification** — How to confirm the fix worked
5. **Rollback** — Reverse the change if needed
6. **Escalation** — Who to contact if it doesn't resolve

## Code Comments

- **When to comment**: Complex business logic, non-obvious trade-offs, security invariants, public API contracts (JSDoc/TSDoc)
- **When NOT to comment**: Obvious intent (`i++ // increment i`), self-documenting code (`const total = price * quantity`)
- Prefer good naming over comments — a function called `calculateDiscountedPrice()` needs fewer comments than `calc()`
- Use TODO/FIXME/HACK/TEMPORARY markers with owner and date: `// TODO(@alice): Remove after auth migration (2026-03-01)`

## Changelog Conventions

**Keep a Changelog format:**

```
# Changelog

## [2.1.0] - 2026-05-15
### Added
- New search endpoint with full-text filtering
- Markdown support in user bios

### Changed
- Bumped minimum Node version to 20
- Pagination defaults from 10 to 20

### Deprecated
- `/api/v1/legacy-search` endpoint (removal in v3.0)

### Fixed
- Race condition in concurrent session creation

### Security
- Patched XSS vulnerability in markdown renderer
```

- Follow SemVer: MAJOR (breaking), MINOR (feature), PATCH (fix)
- Each version links to its diff or release tag
- Group changes by type: Added, Changed, Deprecated, Removed, Fixed, Security

## Migration Guides

**Breaking changes require:**
1. **Before/after comparison** — Show the old and new APIs side by side
2. **Migration script** — Automated tool when possible (codemod)
3. **Upgrade steps** — Numbered, ordered sequence
4. **Deprecation timeline** — When old API will be removed
5. **Fallback period** — Dual-support window if possible

## README Badges & Shields

Common badges (shields.io format):
- `![CI](https://img.shields.io/github/actions/workflow/status/org/repo/ci.yml)`
- `![Coverage](https://img.shields.io/codecov/c/github/org/repo)`
- `![Version](https://img.shields.io/npm/v/package)`
- `![License](https://img.shields.io/github/license/org/repo)`
- `![Downloads](https://img.shields.io/npm/dm/package)`
- Group badges by category (CI, quality, community, version)
