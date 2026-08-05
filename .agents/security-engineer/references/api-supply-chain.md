# API & Supply Chain Security Reference

## API Security

### REST API Security
- **Authentication**: JWT (short-lived), OAuth 2.0 + PKCE, API keys (for M2M)
- **Authorization**: Validate permissions per endpoint (not just at gateway)
- **Rate Limiting**: Per endpoint, per user/IP, sliding window, token bucket
- **Input Validation**: Validate all inputs at API boundaries
- **Output Encoding**: Proper JSON escaping, never return full stack traces
- **TLS**: Enforce HTTPS, HSTS, disable weak cipher suites
- **CORS**: Restrict origins, methods, headers (never `*` with credentials)
- **Security Headers**: All standard headers applied

### GraphQL Security
- **Depth Limiting**: Prevent deeply nested queries
- **Query Complexity**: Calculate and limit query cost
- **Rate Limiting**: Per operation, per client
- **Authentication**: Validate at resolver level (not just transport)
- **Batching Attacks**: Limit batch sizes
- **Persisted Queries**: Allowlist approach for production
- **Field-Level Authorization**: Granular permission checks per field

### gRPC Security
- **TLS**: mTLS for all service communication
- **Interceptors**: Auth, logging, rate limiting at interceptor level
- **Deadlines/Timeouts**: Set on all calls (prevent resource exhaustion)
- **Payload Limits**: Configure max message size

## Supply Chain Security

### SBOM (Software Bill of Materials)
- **Formats**: CycloneDX (OWASP), SPDX (Linux Foundation)
- **Generation**: `npm sbom`, `cyclonedx-bom`, `syft`
- **Content**: Components, versions, licenses, dependency relationships, hashes
- **Usage**: Vulnerability scanning, license compliance, dependency tracking

### SLSA (Supply Chain Levels for Software Artifacts)
- **SLSA 1**: Build process documented, provenance generation
- **SLSA 2**: Signed provenance, hosted build service
- **SLSA 3**: Hermetic builds, reproducible, verified provenance
- **SLSA 4**: Two-party review, all dependencies SLSA 3+

### Sigstore / Cosign
- Sign container images with `cosign sign`
- Verify signatures in deployment (K8s admission controller)
- Keyless signing using OIDC (GitHub, GitLab, Google)
- Transparency log for public audit

### Dependency Management
- **Lock files**: `package-lock.json`, `yarn.lock`, `Cargo.lock`, `go.sum`
- **Automated updates**: Dependabot, Renovate, Snyk
- **Policy**: Pin exact versions (not ranges) for production dependencies
- **Private registry**: npm Enterprise, GitHub Packages, Artifactory
- **SBOM generation**: In CI/CD pipeline
- **Vulnerability scanning**: Pre-merge in CI

### Secure CI/CD Pipeline
- **Isolated runners**: Ephemeral, per-job runners
- **Minimal permissions**: OIDC-based cloud access (no static credentials)
- **Signed commits**: GPG or SSH commit signing
- **Signed artifacts**: Cosign for images, Sigstore for attestations
- **Immutable tags**: Use commit SHA or semantic version, never `latest`
- **Branch protection**: Required reviews, status checks, linear history
- **Secret scanning**: gitleaks, truffleHog in CI and pre-commit
