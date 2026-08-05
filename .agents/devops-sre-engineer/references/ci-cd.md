# CI/CD Reference

## GitHub Actions

### Core Concepts
- **Workflow**: YAML-defined automation in `.github/workflows/`
- **Event**: Trigger (push, PR, schedule, manual)
- **Job**: Group of steps on same runner
- **Step**: Individual task (shell or action)
- **Runner**: VM running workflows
- **Action**: Reusable unit (marketplace or custom)

### Workflow Structure
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "20"

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test

  deploy:
    needs: [test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          tags: myapp:${{ github.sha }}
```

### Best Practices
- Use `actions/cache` for dependency caching
- Use matrix builds for multi-version testing
- Use `secrets` for credentials (never plaintext)
- Use `needs` for job dependencies
- Use `if` conditions for conditional execution
- Use reusable workflows to avoid duplication
- Set resource limits on self-hosted runners
- Pin action versions by SHA (security)

## GitLab CI

### Key Features
- `.gitlab-ci.yml` in repo root
- **Runners**: Shell, Docker, Kubernetes executor
- **Stages**: Groups of jobs with ordering
- **Artifacts**: Pass files between stages
- **Cache**: Dependency caching between runs

## CI/CD Patterns
- **CI**: Lint -> Typecheck -> Unit Test -> Integration Test -> Build
- **CD**: Build Image -> Push Registry -> Deploy Staging -> E2E -> Deploy Prod
- **Trunk-Based**: Short-lived branches, frequent merges
- **GitFlow**: Feature branches, release branches, hotfixes
- **Environment Promotion**: Dev -> Staging -> Canary -> Production

## Tool-Specific
- **CircleCI**: Orbs, contexts, workflow orchestration
- **Jenkins**: Pipelines as Code (Jenkinsfile), plugin ecosystem
- **ArgoCD**: GitOps deployment, sync policies, health checks
- **Flux**: GitOps for K8s with automatic sync
- **CodeDeploy**: AWS deployment automation
