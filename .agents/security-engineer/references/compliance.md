# Security Compliance Frameworks

## SOC 2 (Service Organization Control 2)

- **Type I**: Point-in-time assessment of control design (cheaper, faster, 6-month validity)
- **Type II**: Controls operating effectiveness over 3-12 months (preferred by enterprises)
- **Trust Service Criteria**: Security (common), Availability, Processing Integrity, Confidentiality, Privacy
- **Auditor Process**: Readiness assessment → Evidence collection → Auditor testing → Report issuance
- **Key artifacts**: Security policies, access reviews, penetration tests, monitoring logs, vendor assessments
- **Common findings**: Missing access reviews, incomplete change management, insufficient monitoring

## HIPAA (Health Insurance Portability and Accountability Act)

- **PHI (Protected Health Information)**: Any individually identifiable health data (18 identifiers)
- **BAAs (Business Associate Agreements)**: Required for any vendor touching PHI
- **Administrative Safeguards**: Risk analysis, training, contingency planning (45 CFR §164.308)
- **Physical Safeguards**: Facility access, workstation security, device/media controls (§164.310)
- **Technical Safeguards**: Access control, audit controls, integrity, transmission security (§164.312)
- **Breach Notification**: Must notify affected individuals within 60 days; HHS within 60 days (500+ pop)

---

## PCI-DSS (Payment Card Industry Data Security Standard)

- **12 Requirements** across 6 categories: Build/maintain secure network, protect cardholder data, maintain vulnerability program, implement strong access control, regularly monitor/test, maintain security policy
- **SAQ Levels**: A (card-not-present, no storage) through D (full scope) based on processing volume
- **Scope Reduction**: Tokenization, network segmentation, cardholder data minimization
- **ASV Scanning**: Quarterly external vulnerability scans by Approved Scanning Vendor
- **Annual Assessment**: QSA (Qualified Security Assessor) for Level 1 merchants (>6M transactions)

## GDPR (General Data Protection Regulation)

- **Data Subject Rights**: Access, rectification, erasure (right to be forgotten), data portability, restrict processing
- **DPA (Data Protection Agreement)**: Required between controller and processor
- **DPO (Data Protection Officer)**: Mandatory for public authorities, large-scale monitoring, or special category data
- **72-Hour Breach Notification**: Must notify supervisory authority within 72 hours of awareness
- **Territorial Scope**: Applies to any org processing data of EU residents, regardless of location

---

## FedRAMP (Federal Risk and Authorization Management Program)

- **Impact Levels**: Low (no sensitive info), Moderate (PII, sensitive but unclassified), High (life safety, law enforcement)
- **Authorization Process**: Agency Authority to Operate (JAB P-ATO preferred)
- **Key controls**: 400+ NIST SP 800-53 controls mapped to FedRAMP baseline
- **Continuous Monitoring**: Monthly scans, annual assessments, ongoing reporting via OSCAL/automation

## ISO 27001

- **ISMS (Information Security Management System)**: Plan-Do-Check-Act framework
- **Annex A Controls**: 93 controls across 4 domains (organizational, people, physical, technological)
- **Certification**: Stage 1 (documentation review) → Stage 2 (implementation audit) → Surveillance audits (annual) → Recertification (3 year)
- **SOA (Statement of Applicability)**: Documents which controls are in/out of scope with justification

---

## SOX (Sarbanes-Oxley Act)

- **ITGC (IT General Controls)**: Logical access, change management, computer operations, program development
- **Section 404**: Management and auditor assessment of internal controls over financial reporting
- **Key requirements**: Segregation of duties, audit trails, system access reviews, backup/recovery testing
- **Relevant systems**: Any system processing financial data (ERP, billing, payroll, revenue recognition)

## Compliance Automation

- **Vanta**: SOC 2, HIPAA, ISO 27001; ~200+ integrations; automated evidence collection
- **Drata**: SOC 2, HIPAA, PCI, GDPR; continuous monitoring with 100+ SaaS integrations
- **Secureframe**: SOC 2, ISO 27001, PCI, HIPAA; AI-powered evidence scheduling
- **Common features**: Automated evidence collection (API pulls, agent-based), policy templates, control mapping, test scheduling, vendor risk management, auditor dashboards

## Continuous Compliance Monitoring

- Automated control testing at scheduled intervals (daily/weekly)
- Real-time alerting on control failures (drift detection)
- Self-service evidence portals for auditors
- API-driven evidence aggregation (avoid manual screenshots)
- Quarterly risk assessments tied to control health
