# Threat Modeling & Secure SDLC Reference

## Threat Modeling

### STRIDE (Microsoft)
| Threat | Property Violated | Example |
|--------|------------------|---------|
| **S**poofing | Authentication | Impersonating another user via stolen session token |
| **T**ampering | Integrity | Modifying request data in transit |
| **R**epudiation | Non-repudiation | User denies performing an action |
| **I**nformation Disclosure | Confidentiality | Data leak via IDOR |
| **D**enial of Service | Availability | Overwhelming API with requests |
| **E**levation of Privilege | Authorization | Gaining admin access via privilege escalation |

### DREAD (Risk Scoring)
- **D**amage Potential, **R**eproducibility, **E**xploitability, **A**ffected Users, **D**iscoverability
- Rate each 1-3, sum to prioritize

### Attack Trees
- Root node: attacker goal
- Child nodes: ways to achieve the goal
- AND/OR nodes for prerequisite relationships

### PASTA (Process for Attack Simulation & Threat Analysis)
1. Define objectives
2. Define technical scope
3. Decompose application
4. Threat analysis
5. Vulnerability analysis
6. Attack enumeration
7. Risk and impact analysis

## Secure SDLC

### Phases
1. **Design**: Threat modeling, architecture review, security requirements
2. **Development**: Secure coding standards, SAST in CI, dependency scanning
3. **Testing**: DAST, penetration testing, fuzz testing
4. **Deploy**: Container scanning, IaC security, secrets scanning, approval gates
5. **Operations**: Runtime monitoring, incident response, vulnerability management

### Shift Left
- Integrate security early in development
- SAST runs on every commit
- Dependency scanning on every PR
- Container scanning in CI/CD pipeline
- IaC scanning before terraform apply

## Security Champions Program
- Designate security champions in each team
- Provide training: OWASP Top 10, secure coding, threat modeling
- Champions review security designs and code
- Champions escalate findings to security team
- Monthly syncs with security team

## Incident Response
1. **Preparation**: Runbooks, tools, access, communication plan
2. **Detection**: Monitoring, alerts, user reports
3. **Triage**: Severity assessment, containment decision
4. **Containment**: Isolate affected systems, block malicious IPs, rotate credentials
5. **Eradication**: Remove malware, patch vulnerabilities, close attack vectors
6. **Recovery**: Restore from backup, verify no persistence, monitor
7. **Post-Mortem**: Root cause, timeline, improvements, blameless culture

## Vulnerability Management
- **CVE**: Common Vulnerabilities and Exposures (standard identifiers)
- **CVSS**: Common Vulnerability Scoring System (0-10 severity)
- **EPSS**: Exploit Prediction Scoring System (probability of exploitation)
- **VPR**: Vulnerability Priority Rating (Tenable, combines severity + threat context)
- **Prioritization**: EPSS + CVSS + business impact + exploitability in the wild
- **SLA**: Critical (24-48hr), High (72hr), Medium (14 days), Low (30-90 days)
