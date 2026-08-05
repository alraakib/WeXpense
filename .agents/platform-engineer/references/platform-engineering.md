# Platform Engineering Reference

## Core Concepts
- **IDP**: Internal Developer Platform — self-service layer over infrastructure
- **DORA**: Deployment frequency, lead time, change failure rate, MTTR
- **SPACE**: Satisfaction, Performance, Activity, Communication, Efficiency
- **Golden Path**: Standardized, supported way to build and deploy services

## Backstage (Developer Portal)
- Software Catalog: Services, APIs, resources, components
- TechDocs: Documentation-as-code (MkDocs, Markdown)
- Scaffolder: Project templates with automated setup
- Plugins: CI/CD, monitoring, security, cost tracking

## Monorepo Tools
| Tool | Best For | Features |
|------|----------|----------|
| Turborepo | JS/TS projects | Parallel, remote caching, pipeline |
| Nx | Multi-language | Generators, dependency graph, affected |
| pnpm | JS/TS monorepos | Strict isolation, workspace protocol |
| Bazel | Large, multi-language | Hermetic, remote execution |

## Environment Management
- Dev: Local (Docker Compose, DevContainers)
- Ephemeral: Per-branch (Vercel preview, K8s + Telepresence)
- Staging: Shared, pre-production
- Canary: Traffic-split from production
- Production: Live traffic with feature flags

## Developer Productivity
- DORA: Deploy frequency (daily+), lead time (<1 day), CFR (<15%), MTTR (<1hr)
- Flow state: Minimize interruptions, batch context switches
- Feedback loops: Fast (lint/typecheck <5s), Medium (tests <2min), Slow (E2E <15min)
- Onboarding: DevContainers, documented setup scripts, onboarding checklist
