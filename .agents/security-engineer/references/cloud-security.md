# Cloud & Infrastructure Security Reference

## IAM (Identity & Access Management)

### AWS IAM
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject"],
    "Resource": "arn:aws:s3:::my-bucket/*",
    "Condition": {"IpAddress": {"aws:SourceIp": "10.0.0.0/16"}}
  }]
}
```
- Use IAM roles (not users) for services (EC2 instance profiles, IRSA for EKS)
- Use IAM policies with least privilege (grant specific actions, resources, conditions)
- Use permission boundaries for delegated administration
- Use service control policies (SCP) for organization guardrails
- Enable IAM Access Analyzer for unused permissions
- Rotate access keys regularly, prefer instance profiles

### GCP IAM
```json
{
  "bindings": [
    {
      "role": "roles/storage.objectViewer",
      "members": ["serviceAccount:sa@project.iam.gserviceaccount.com"]
    }
  ]
}
```
- Use Workload Identity for GKE (bind K8s SA to GCP SA)
- Use custom roles with least privilege
- Use organization policies for constraints
- Use VPC Service Controls for data exfiltration prevention

### Azure RBAC
```json
{
  "roleName": "Custom S3 Reader",
  "permissions": [{
    "actions": ["Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read"],
    "notActions": []
  }]
}
```
- Use Managed Identity for Azure resources (no credentials to manage)
- Use Azure RBAC with built-in roles minimum
- Use Azure Policy for governance

## Network Security
- **VPC Isolation**: Private subnets for databases, public subnets for load balancers
- **Security Groups**: Stateful firewalls (allow specific ports/IPs)
- **NACLs**: Stateless, subnet-level rules (deny list by default)
- **WAF**: Web Application Firewall (AWS WAF, Cloud Armor, Azure WAF, CloudFlare)
- **DDoS Protection**: AWS Shield, Cloud Armor, Azure DDoS Protection
- **VPC Endpoints**: Private connectivity to cloud services (no internet egress)
- **Service Mesh**: Istio/Linkerd for mTLS, authorization policies

## Container Security
- **Image Scanning**: Trivy, Snyk, Docker Scout, Amazon ECR scanning, GCP Artifact Analysis
- **Runtime Security**: Falco (behavioral monitoring), Aqua Security, Sysdig
- **Supply Chain Security**: SLSA framework, Sigstore (Cosign), SBOM (CycloneDX, SPDX)
- **Dockerfile Best Practices**: Non-root user, distroless base, no secrets in build args, pinned base image digests
- **K8s Security**: Pod Security Standards, OPA/Gatekeeper, Kyverno, kube-bench

## Security Scanning Tools
### Application Security
- **SAST**: SonarQube, Semgrep, Checkmarx, Snyk Code, CodeQL
- **DAST**: OWASP ZAP, Burp Suite, Acunetix, Synk App
- **SCA**: Snyk Open Source, Dependabot, Renovate, OWASP Dependency-Check
- **Container Scanning**: Trivy, Grype, Clair, Docker Scout
- **Infrastructure Scanning**: Checkov, tfsec, Terrascan, kube-bench, kubescape

### Cloud Security Posture Management (CSPM)
- AWS Security Hub, GCP Security Command Center, Azure Defender for Cloud
- Wiz, Orca Security, Lacework, Palo Alto Prisma Cloud
- Enable automatic remediation for least-privilege rules

## Compliance Frameworks
- **SOC 2**: Trust Services Criteria (security, availability, processing, confidentiality, privacy)
- **PCI DSS**: Payment card data security
- **HIPAA**: Healthcare data privacy
- **GDPR**: European data protection
- **FedRAMP**: US government cloud authorization
- **ISO 27001**: Information security management
- **Key Requirements**: Access control, encryption, audit logging, incident response, vulnerability management, vendor risk
