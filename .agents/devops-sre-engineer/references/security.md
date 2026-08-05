# DevOps Security Reference

## Container Security
- **Image Scanning**: Trivy, Snyk, Clair, Docker Scout
- **Runtime Security**: Falco, Aqua Security, Sysdig
- **Supply Chain**: Sigstore (Cosign), SLSA provenance
- **Base Images**: Minimal (distroless, alpine), pinned digests
- **Best Practices**:
  - Use non-root user in containers
  - Read-only root filesystem
  - Drop all capabilities, add specific ones only
  - Security context with runAsNonRoot
  - Scan images in CI before push
  - Sign images with Cosign
  - Use Distroless base images when possible

## Kubernetes Security
- **RBAC**: Least-privilege, role-based access
- **Pod Security**: Pod Security Admission (baseline/restricted)
- **Network Policies**: Zero-trust networking (default deny)
- **Secrets**: Encrypted at rest with KMS, external secrets operator
- **PSP Migration**: Pod Security Standards via admission controllers
- **Best Practices**:
  - Enable audit logging on API server
  - Use OIDC for cluster authentication
  - Enable Pod Security Standards at namespace level
  - Use OPA/Gatekeeper or Kyverno for policy enforcement
  - Disable automountServiceAccountToken when unused
  - Use seccomp profiles
  - Use AppArmor for additional restriction
  - Regular cluster security scanning (kube-bench, trivy)

## Cloud Security
- **IAM**: Least-privilege, roles, policies
- **Data Protection**: Encryption at rest and in transit
- **Network Security**: VPC, security groups, WAF
- **Compliance**: SOC2, HIPAA, PCI-DSS, FedRAMP
- **Best Practices**:
  - Enable CloudTrail/CloudAudit logging
  - Use infrastructure as code for security policies
  - Implement secret rotation (AWS Secrets Manager, Vault)
  - Use cloud provider security tools (Security Hub, GuardDuty, Defender)
  - Automate compliance checks in CI/CD

## CI/CD Security
- **Supply Chain**: Dependency scanning, SBOM generation
- **Secrets**: Never hardcode, use vault/secret managers
- **Pipeline**: Isolated runners, signed commits, SLSA compliance
- **Tools**: Dependabot, Renovate, Snyk, npm audit

## Incident Response
- **Investigation**: Audit logs, container forensics
- **Containment**: Network policies, pod deletion, node isolation
- **Recovery**: Rollback deployments, restore from backup
- **Post-Mortem**: Root cause analysis, blameless culture
