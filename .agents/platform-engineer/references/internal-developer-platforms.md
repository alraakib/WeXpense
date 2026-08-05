# Internal Developer Platforms (IDP)

## Platform Engineering Concepts

- **Golden Paths:** Pre-approved, opinionated, documented workflows for common developer tasks (creating a service, deploying, adding a database). Not enforced, but incentivized via self-service convenience.
- **Paved roads:** Fully-managed infrastructure paths with baked-in security, observability, and compliance. Deviating means building your own road.
- **Self-service:** Developers provision infrastructure, deploy, and manage environments without filing tickets — via CLI, web portal, or API backed by the platform.
- **Platform as a product:** Treat the IDP as a product with users, UX research, SLIs, and iterative improvements — not an internal IT project.
- **Separation of concerns:** Platform team owns the infrastructure abstraction; developer teams own their application logic and configuration.

---

## IDP Reference Architecture

- **Control plane / orchestrator:** Backstage (open-source), Port, Humanitec, or custom solution — handles developer-facing portal, catalog, and workflows.
- **Provisioning layer:** Terraform, Pulumi, Crossplane, or AWS CDK for infrastructure-as-code. Humanitec uses `Resource Definition` drivers (Terraform, Helm, custom scripts).
- **Orchestration / runtime:** Kubernetes (most common), Nomad, or serverless (AWS Lambda, Cloud Run).
- **CI/CD pipeline:** ArgoCD, Flux, GitHub Actions, GitLab CI, Jenkins — triggered by GitOps merge to environment branches.
- **Service catalog:** Backstage Software Catalog, Port data model, or custom entity store — single source of truth for all services, resources, and ownership.

```
 Developer → Portal (Backstage) → Scaffolder → Terraform/Crossplane → K8s + ArgoCD
                                 → Catalog (entities, ownership, docs)
                                 → Observability (Datadog, Grafana, PagerDuty)
```

---

## Developer Self-Service

- **Environment provisioning:** Portals offer a form (or API) — pick project name, language, database, deploy strategy → platform creates repo + CI + infra + K8s namespace.
- **Database as a service:** Request a PostgreSQL/RDS instance, Redis cluster, or S3 bucket via portal — platform provisions and returns connection string (stored in Vault/Secrets Manager).
- **Deployment self-service:** One-click deploy to staging, promote to production, rollback. Platform handles canary analysis and traffic shifting.
- **Ephemeral environments:** Destroy temporary preview environments per PR/branch — reduces contention for shared staging.
- **Secret management:** Platform injects secrets from Vault, AWS Secrets Manager, or SOPS via CSI drivers or sidecars — devs never see raw secrets.

---

## Environment Management

| Type | Purpose | Lifespan | Provisioning |
|------|---------|----------|-------------|
| **Dev** | Daily development | Persistent | Shared cluster, minimal resources |
| **Staging** | Pre-prod validation | Persistent | Full replica of prod (smaller scale) |
| **Production** | Live traffic | Persistent | HA, multi-zone, autoscaling |
| **Ephemeral preview** | PR testing | Hours-days | Dynamic per branch, auto-cleanup |

- **Ephemeral environments:** Tools like `Telepresence` (traffic mirroring), `Kuberhealthy`, or custom GitOps workflows. TTL enforced via automated cron jobs.
- **Environment parity:** Use same deployment pipeline, container image, and config structure for all environments — only differ in secrets, scaling, and feature flags.

---

## Container Registries & Artifact Management

- **Container registry:** ECR (AWS), GCR/Artifact Registry (GCP), ACR (Azure), Docker Hub, Harbor (self-hosted).
- **Image scanning:** Trivy, Clair, Snyk, Grype — integrated into CI/CD pipeline, enforced admission controller in K8s (Ratify, Kyverno).
- **Image promotion:** Dev → Staging → Prod — images tagged and signed (`cosign`), promotion gated by scan results + tests.
- **Artifact storage:** JFrog Artifactory, Sonatype Nexus, Cloudsmith — for npm packages, Python wheels, JARs, Helm charts, generic binaries.
- **Helm/OCI registries:** Store Helm charts as OCI artifacts in container registry (OCI-compliant registries only).

---

## Developer Productivity Metrics (DORA)

| Metric | Definition | Elite | High | Medium | Low |
|--------|-----------|-------|------|--------|-----|
| **Deploy frequency** | How often code deployed to production | On-demand (multiple/day) | Weekly | Monthly | < Monthly |
| **Lead time** | Time from commit to production | < 1 hour | < 1 week | < 1 month | > 1 month |
| **MTTR** | Time to recover from failure | < 1 hour | < 1 day | < 1 week | > 1 week |
| **Change failure rate** | % of deployments causing failure | < 5% | < 10% | < 15% | > 15% |

- **Velocity vs stability:** High-performing teams achieve both high deploy frequency AND low change failure rate through CI/CD, canary deployments, feature flags.
- **Platform impact:** Measure DORA before/after platform initiatives to quantify ROI.
- **Measurement tools:** Alloy, Sleuth, Codeclimate, or custom dashboards from GitHub API + CI/CD pipeline data.

---

## Platform as a Product

- **Product lifecycle:** Research (surveys, interviews with devs) → Build → Launch → Gather feedback → Iterate.
- **Dev UX KPIs:** Time-to-first-deploy, number of tickets filed to platform team, NPS from developer surveys, platform adoption rate.
- **Platform backlog:** Treat feature requests from developers as product features — prioritize by impact x frequency.
- **Internal marketing:** Internal blog posts, lunch & learns, office hours, documented success stories to drive adoption.
- **Platform SLOs:** Uptime of portal, scaffolder success rate (< 5% failure), environment provisioning time (< 5 min).

---

## Developer Experience (DX) Optimization

- **Reduce cognitive load:** Abstract infrastructure complexity (networking, storage classes, node scaling) behind simple interface (dropdown choices in portal form).
- **Fast feedback loops:** Push → CI passes in < 10 min, preview environment in < 2 min, deploy to prod in < 30 min.
- **Consistent toolchain:** Centralized guidance on Node.js version, linting rules, CI templates, Docker base images — reduces "works on my machine" problems.
- **Documentation:** Integrate with Backstage TechDocs — docs live next to code, versioned per service. Minimum viable docs defined in platform policy.
- **Self-service debugging:** Provide standardized access to logs (Loki), traces (Jaeger/Tempo), metrics (Grafana), and dashboards per service.

---

## Internal Developer Portals vs Public Cloud Consoles

| Aspect | Internal Portal | Public Cloud Console |
|--------|---------------|---------------------|
| **Abstraction** | Business logic, team context, Golden Paths | Raw infrastructure primitives |
| **Permissions** | Role per team, scoped to owned resources | IAM across entire account/organization |
| **Audience** | Internal developers in organization | Anyone with cloud account |
| **Guardrails** | Built-in compliance, cost budgets, approval flows | Manual (unless custom IAM) |
| **Cost** | Open-source (Backstage) or per-user (Port, Humanitec) | Free console, infra costs separate |
