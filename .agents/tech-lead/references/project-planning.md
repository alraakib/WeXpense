# Project Planning Reference

## Estimation Techniques

| Technique | Use Case | Method |
|-----------|----------|--------|
| **T-shirt Sizing** | Early, high-uncertainty | Team votes XS/S/M/L/XL/XXL |
| **Planning Poker** | Sprint-level, team consensus | Fibonacci points (1,2,3,5,8,13,21) |
| **Three-Point** | Detailed, complex tasks | O = optimistic, P = pessimistic, M = most likely → (O+4M+P)/6 |
| **PERT** | Cross-team projects | Weighted avg with risk buffer |
| **Affinity Mapping** | Large backlog triage | Group items by size, estimate batches |

**Rules of thumb:**
- Any task > 13 points needs splitting
- 3 or more developers on a single story suggests it's too big
- Always capture confidence level: "2 weeks (high confidence)" vs "2 weeks (low confidence, new tech)"

## Sprint Planning Best Practices

**Before sprint planning:**
- Backlog is refined (stories have acceptance criteria, estimates are <13 points)
- Dependencies are identified and resolved or flagged
- Team capacity is calculated (vacation, ceremonies, overhead)

**During planning:**
- Team pulls work, PM doesn't assign it
- Velocity-based planning: pull stories up to historical average velocity
- Define sprint goal — one sentence describing the outcome
- Review each story: acceptance criteria, definition of done, test plan

**Definition of Done checklist:**
- Code merged to main branch
- Tests written and passing (unit + integration)
- Documentation updated
- Code reviewed
- Deployed to staging and verified

## Technical Roadmap Creation

**Now/Next/Later framework:**

```
Now (this quarter)         Next (next quarter)         Later (6-12 months)
├── Auth v2 migration      ├── Search v3 rewrite       ├── Multi-region HA
├── Rate limiting          ├── GraphQL adoption        ├── Event sourcing
├── P0 reliability fix     ├── CI pipeline v2          └── Platform API v2
└── Observability v1       └── Load testing infra
```

**OKR-driven roadmap:**
- Objective: "Deliver a world-class API platform"
- KR1: "Reduce p99 latency to <200ms" (current: 450ms)
- KR2: "Achieve 99.99% uptime" (current: 99.95%)
- KR3: "Publish public API with 100% documented endpoints"

Map initiatives to KRs. Each initiative should directly move one or more KRs.

## Risk Management

**Risk register format:**

| Risk | Probability | Impact | Score | Mitigation | Owner |
|------|-------------|--------|-------|------------|-------|
| DB migration data loss | Low | Critical | Medium | Test with prod clone, rollback plan | @alice |
| Vendor API deprecation | Medium | High | High | Abstract vendor layer, monitor changes | @bob |
| Team member unavailability | Medium | Medium | Medium | Cross-train, document bus factor | @charlie |

**Technical risks to track:**
- Performance regression under load
- Security vulnerabilities in dependencies
- Breaking changes in upstream libraries
- Scaling bottlenecks (database, queue, cache)
- Single points of failure (bus factor, SPOF in architecture)

## Stakeholder Communication

**Status update cadence:**
- **Daily**: Standup (blockers, progress toward sprint goal)
- **Weekly**: Written status (progress, blockers, risks, next week)
- **Monthly**: Metrics review (velocity, DORA, debt)
- **Quarterly**: Roadmap review, OKR grading, strategic pivots

**Escalation triggers:**
- Timeline slippage > 20%
- P0/P1 incident
- Security vulnerability with CVSS > 7
- Team capacity crisis
- Dependency failure (vendor shutdown, API deprecation)

## Breaking Down Epics

Epic → Stories → Tasks pattern:

```
Epic: Auth Service Migration
├── Story: Implement new auth endpoints
│   ├── Task: Scaffold Fastify routes
│   ├── Task: Implement JWT generation
│   ├── Task: Add rate limiting middleware
│   └── Task: Write integration tests
├── Story: Dual-write tokens (old + new)
│   ├── Task: Write to both systems
│   ├── Task: Add comparison validation
│   └── Task: Monitor error rates
└── Story: Cutover and cleanup
    ├── Task: Redirect traffic to new service
    ├── Task: Monitor for 48 hours
    └── Task: Remove old auth code
```

- Stories deliver value to a user; tasks are implementation details
- Epics cross multiple sprints; stories fit in one sprint

## Capacity Planning

**Weekly capacity formula:**

```
Team capacity = (team_size × days_in_sprint × hours_per_day) × availability
Example: (5 × 10 × 6) × 0.8 = 240 hours (or 48 points at 5h/point)
```

**Overhead factors:**
- Ceremonies: 10-15% (standups, planning, retro, review)
- Bug fixes: 10-15% (unplanned work)
- Tech debt: 15-20% (dedicated allocation)
- Code review: 5-10% (reviewing PRs)
- Learning/onboarding: 10-20% (new team members)

## Milestone Tracking & Velocity

**Burndown chart**: Remaining effort vs time — line should trend toward zero
**Velocity chart**: Points completed per sprint — use rolling average of 3 sprints
**Cycle time**: Time from first commit to merge — aim for <2 hours for small PRs

**When velocity is dropping:**
- Check for unplanned work eating capacity
- Verify stories aren't growing in scope (gold-plating)
- Check team health (burnout, turnover, context switching)

## Retrospective Formats

**Start/Stop/Continue:**
- **Start**: Things to begin doing (e.g., "start writing integration tests")
- **Stop**: Things to cease (e.g., "stop merging without review")
- **Continue**: Things working well (e.g., "continue daily standups")

**4Ls:**
- **Liked**: What went well (e.g., "liked the new CI pipeline")
- **Learned**: New insights (e.g., "learned that database pooling needs tuning")
- **Lacked**: What was missing (e.g., "lacked clarity on acceptance criteria")
- **Longed For**: Desired improvements (e.g., "longed for more pair programming")

**Plus/Delta (short format):**
- **+**: What worked
- **Δ**: What to change next sprint

**Gathering data before retro:** Review closed stories, cycle times, incident timeline, PR review times
