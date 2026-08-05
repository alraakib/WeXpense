# Developer Portals & Backstage

## Backstage Architecture

- **Frontend:** React-based SPA, plugin architecture using `@backstage/core-plugin-api`. Each plugin renders in its own `RoutedPage` or `card` entity.
- **Backend:** Node.js + Express, plugin-based using `@backstage/backend-plugin-api`. Built-in services: catalog, scaffolder, auth, techdocs, search.
- **Plugin isolation:** Plugins communicate through the Backstage plugin API — no direct cross-plugin coupling. Data fetched via `useApi()` with injectable `ApiRef`.
- **Auth providers:** OAuth2 (GitHub, GitLab, Google, Okta, Auth0, Azure AD), OIDC, SAML, custom auth with `@backstage/plugin-auth-backend`.
- **Identity resolution:** Guest mode (dev), OIDC-backed (prod). User entity stored in `BackstageUserIdentity` via auth plugin.

---

## Software Catalog

- **Entities:** Core object model with `kind`, `metadata`, `spec`, `relations`.
- **Built-in kinds:** `Component`, `API`, `Resource`, `System`, `Domain`, `Group`, `User`, `Location`, `Template`.
- **Relations:** `dependsOn`, `dependencyOf`, `ownedBy`, `ownerOf`, `partOf`, `hasPart`, `providesApi`, `consumesApi`.
- **Annotations:** Key-value metadata on entities — `backstage.io/techdocs-ref`, `backstage.io/view-url`, `kubectl-view-url`.
- **Catalog ingestion:** File-based (`catalog-info.yaml`), SaaS integrations (GitHub, GitLab, Bitbucket), LDAP, custom entity providers.
- **Entity lifecycle:** Register → ingest → process (relations, labels, annotations) → store in PostgreSQL → serve via catalog API.

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    github.com/project-slug: org/my-service
    backstage.io/techdocs-ref: dir:.
spec:
  type: service
  lifecycle: production
  owner: team-alpha
  system: payments-platform
  dependsOn:
    - component:default/auth-service
  providesApis:
    - payment-api
```

---

## TechDocs

- **Engine:** MkDocs (Python) or TechDocs CLI. `mkdocs.yml` configures nav, theme (Material for MkDocs), plugins.
- **Storage:** Local filesystem, Google Cloud Storage, AWS S3, Azure Blob Storage. Configured in `app-config.yaml` under `techdocs.builder` and `techdocs.publisher`.
- **Generation flow:** Clone repo → `techdocs-cli generate` → publish to storage bucket → Backstage serves via `techdocs-backend`.
- **Entity association:** `backstage.io/techdocs-ref: dir:.` annotation in `catalog-info.yaml` links entity to its docs.
- **Search integration:** Documentation content indexed into Backstage search — uses Lunr (in-memory) or Elasticsearch.

---

## Scaffolder

- **Template model:** YAML-defined (or JSON) templates with `template.yaml`. Schema: `parameters` (input), `steps`, `output`.
- **Built-in steps:** `fetch:template`, `fetch:plain`, `fetch:cookiecutter`, `catalog:register`, `fs:read`, `fs:write`, `serie:echo`.
- **Custom actions:** Extend scaffolder via `createTemplateAction` — arbitrary Node.js logic executed in scaffolder backend.
- **Step execution:** Backend worker processes steps sequentially with `BackstageUserIdentity` context. Step results passed between steps.
- **Post-scaffold:** Output `entityRef` to auto-register generated component in the catalog.

```yaml
# template.yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: create-node-service
  title: Create Node.js Service
spec:
  owner: platform-team
  type: service
  parameters:
    - title: Service Details
      properties:
        name:
          type: string
          description: Service name
  steps:
    - id: fetch-base
      name: Fetch Template
      action: fetch:template
      input:
        url: ./templates/node-service
        values:
          name: ${{ parameters.name }}
```

---

## Kubernetes Plugin

- **Service ownership:** Links K8s resources (Deployments, Services, Pods) to Backstage entities via labels/annotations (`backstage.io/kubernetes-id`, `backstage.io/kubernetes-namespace`).
- **Cluster configuration:** Multiple clusters configured in `app-config.yaml` under `kubernetes.clusterLocatorMethods`.
- **Deployment visibility:** View pod status, replica counts, resource usage, logs directly in Backstage.
- **K8s proxy:** `kubernetes-backend` proxies authenticated requests to K8s API server using in-cluster or `kubeconfig` auth.

---

## API Docs Integration

- **OpenAPI:** `@backstage/plugin-api-docs` renders OpenAPI 3.0 specs via Swagger UI or Redoc. Entity `kind: API` with `spec.type: openapi`.
- **GraphQL:** Support via `spec.type: graphql` with schema explorer.
- **AsyncAPI:** Event-driven API specs rendered using AsyncAPI viewer plugin.
- **gRPC/Protobuf:** Proto schema display via custom plugin or `spec.type: grpc`.

---

## Scorecards & Governance

- **Backstage Scorecards plugin:** Custom checks (scored criteria) against entities — lint rules for catalog metadata.
- **Governance policies:** Ensure ownership, documentation, PagerDuty, and SLA annotations exist on production services.
- **Custom checks:** `scorecards-integrator` plugin allows writing custom check logic.
- **Compliance dashboards:** Overview of passing/failing entities across the ecosystem.

---

## Deployment & Ops

- **Container:** Official Docker image (`backstage/backstage`) with `Dockerfile` generated by `npx @backstage/create-app`.
- **Database:** PostgreSQL (required for prod), SQLite for local dev.
- **K8s deployment:** Helm chart (`backstage/helm-charts`) — ConfigMap for app-config, StatefulSet for backend, Ingress/TLS, optional Redis for caching.
- **App configuration:** `app-config.yaml` + `app-config.production.yaml` layered via env `APP_CONFIG_*` prefix or `--config` flag.
- **Plugin installation:** Add plugin package → register in `packages/app/src/App.tsx` (frontend) and `packages/backend` (backend).
