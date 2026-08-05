# Mentoring & Engineering Culture Reference

## Onboarding New Team Members

**Day 1 — Foundation:**
- Buddy assigned (same team, different from manager)
- Machine setup script run, all tools installed
- README walkthrough: project structure, team norms, ceremony schedule
- First commit: fix a typo or add a test (shallow end of the pool)

**Week 1 — Context building:**
- Small bug fixes in a familiar domain (3-5 PRs merged)
- Pair with buddy on a feature story
- Read two ADRs and summarize them to buddy
- Deploy a change to staging

**Month 1 — Feature delivery:**
- Own a small feature end-to-end (design → code → test → deploy)
- Attend all ceremonies (planning, standup, retro)
- Present a 5-minute tech talk on their area

**Month 2-3 — Independence:**
- Lead a medium feature with design review
- Review PRs from other team members
- Begin domain specialization (auth, payments, infra, etc.)
- Give a tech talk or write an RFC

**Buddy responsibilities:**
- Daily sync for first 2 weeks (15 min)
- Review all onboarding PRs within 4 hours
- Escalate blockers on behalf of the new hire
- Be the "stupid questions" contact person

## Mentoring Techniques

**Pair Programming (learn by doing):**
- Driver writes code, navigator guides — switch roles every 20-30 min
- Best for: complex algorithms, unfamiliar codebase, critical systems
- Timebox to 2 hours max (mentally intensive)

**Mob Programming (team learning):**
- Entire team works on one problem, one screen
- Driver rotates every 10-15 minutes
- Best for: cross-cutting refactors, architecting new systems, design decisions
- Encourages shared ownership and knowledge distribution

**Office Hours (structured support):**
- 2 hours per week, calendar-invited recurring slot
- Anyone can bring questions (no appointment needed)
- Rotating host from senior team members
- Document questions and answers for async reference

**Code review as mentoring:**
- Explain the "why" behind changes requested
- Link to documentation, ADRs, or style guides
- Approve with nits for non-blocking style feedback
- Pair on review comments that need significant discussion

## Knowledge Sharing

**Structure for a tech talk (30 min):**

```
Context (5 min)    — What problem were we solving?
Approach (10 min)  — What did we try? What worked?
Results (5 min)    — Metrics, before/after, lessons
Discussion (10 min)— Q&A, alternative approaches, cross-team insights
```

- **RFCs**: Written proposals for significant changes (template: Context → Options → Decision → Consequences)
- **Brown bags**: Lunch-hour informal sessions, recorded for async consumption
- **Internal blog**: Monthly newsletter highlighting wins, failures, learnings
- **Slack channels**: `#tech-discussion`, `#architecture`, `#incidents` for persistent discussion
- **Wiki/git**: Every tech talk has a link to slides and a summary doc

**Knowledge sharing cadence:**
- Weekly: Team standup (sharing blockers and discoveries)
- Bi-weekly: Team tech talk (rotating presenter)
- Monthly: Guild/community of practice meeting
- Quarterly: Org-wide demo day or internal conference

## Incident Response Leadership

**When to join an incident:**
- SEV1/P0 — always join immediately
- SEV2 — join if it has been open >15 min without progress
- SEV3 — join if escalated by on-call engineer
- Any incident that involves your team's service

**Incident Commander responsibilities:**

1. **Triage**: Assign severity, page appropriate responders, declare in communication channel
2. **Coordinate**: Track who is investigating what, prevent duplicate work
3. **Communicate**: Regular status updates (every 5 min for SEV1, 15 min for SEV2, 30 min for SEV3)
4. **Document**: Record timeline, decisions, attempted fixes in incident doc
5. **Resolve**: Verify fix, monitor for stabilization period (15 min for SEV1)
6. **Follow-up**: File tickets for root cause fix, monitoring gaps, post-mortem

**Communication format during incident:**

```
Status: INVESTIGATING | MITIGATING | MONITORING | RESOLVED
Severity: SEV1
Impact: Orders service partially unavailable (15% of users)
Action: Rolling back v2.3.1 deployment
ETA: 10 minutes
Next update: In 5 minutes
```

## Blameless Post-Mortems

**Post-mortem culture rules:**
- Focus on systems, processes, and decisions — never people
- "Five Whys" root cause analysis (not five who's)
- Action items must be specific, assigned, and tracked
- Post-mortem is a learning tool, not a punishment
- Share post-mortems broadly (public within the org)

**Template:**

```
# Post-Mortem: [Title]

## Summary
Duration, severity, impact, trigger

## Timeline
- [timestamp] Event observed
- [timestamp] Incident declared
- [timestamp] Mitigation applied
- [timestamp] Resolved

## Root Cause
What happened, why it happened, contributing factors

## Action Items
| Action | Owner | Due Date | Type (mitigate/prevent/detect) |
|--------|-------|----------|-------------------------------|

## Lessons Learned
What went well, what went wrong, what to improve
```

## Engineering Culture Improvements

**Communities of Practice (CoPs):**
- Groups organized by interest: Frontend, Backend, DevOps, QA, Security
- Meet bi-weekly, share patterns, discuss tooling, set standards
- Produce artifacts: style guides, library recommendations, RFC templates

**Guilds:**
- Cross-team, interest-driven (e.g., "Testing Guild", "Performance Guild")
- More informal than CoPs, self-organizing
- Focus on advocacy and education rather than standards enforcement

**CIC (Continuous Improvement Culture):**
- Dedicated time for improvement (15-20% of sprint)
- Retro action items are treated as work, not wishes
- Run experiments: "Try Test-Driven Development for 2 weeks, then retro"
- Measure before and after (don't change for change's sake)

## Career Growth Frameworks

**IC (Individual Contributor) track:**
- Junior → Mid → Senior → Staff → Principal → Distinguished
- Senior: Technical depth, mentoring, delivers complex features independently
- Staff: Cross-team impact, technical strategy, mentorship at scale
- Principal: Org-wide technical direction, industry influence

**Management track:**
- Tech Lead → Engineering Manager → Senior EM → Director → VP
- Tech Lead: Technical decisions + people mentorship (hybrid)
- EM: People management, process, delivery, career growth for direct reports

**Growth conversations in 1:1s:**
- Quarterly: Career check-in ("Where do you want to be in 1 year? 3 years?")
- Monthly: Skill development ("What do you want to learn next?")
- Weekly: Project-level feedback, blockers, well-being

## Delegation and Trust-Building

**Staged delegation (Situational Leadership):**

| Stage | Approach | When |
|-------|----------|------|
| Direct | "Do it this way" | New team member, critical deadline |
| Coach | "Let's figure it out together" | Developing competence |
| Support | "You decide, let me know if stuck" | Competent, low confidence |
| Delegate | "You own this entirely" | Expert, high trust |

**Signs you're not delegating enough:**
- You're the bottleneck on decisions
- You're working on tasks another engineer could do
- You're in meetings about things someone else owns
- Your 1:1s are status updates instead of coaching

**Building trust:**
- Admit mistakes publicly: "I was wrong about the deployment strategy"
- Give credit publicly, provide feedback privately
- Follow through on commitments — if you say you'll do it, do it
- Ask for advice from junior engineers (demonstrates humility)
- Be consistent: same standards apply to everyone, including yourself
