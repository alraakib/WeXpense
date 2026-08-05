# Test Management & Reporting

## Test Planning

- **Test Plan structure**: Scope, objectives, test levels (unit/integration/system/UAT), entry/exit criteria, test environment, schedule, roles, risks, assumptions
- **Risk-Based Testing (RBT)**: Prioritize test scenarios by likelihood × impact matrix
  - Critical path features → maximum coverage
  - Low-risk regression → smoke/sanity only
- **Effort estimation**: Function point analysis, use-case points, historical velocity, or test-point analysis
- **Entry criteria**: Code complete, unit tests pass, environment stable, test data available
- **Exit criteria**: All planned tests executed, no critical/P0 defects open, coverage targets met, stakeholder sign-off

---

## Test Case Management Systems

| Tool | Key Features |
|---|---|
| TestRail | Custom fields, milestones, test run tracking, Jira integration |
| Zephyr (Scale/Enterprise) | Native Jira, BDD/Gherkin support, real-time metrics |
| Xray | Test plan execution, requirement traceability, BDD, automated test imports |
| qTest | Test cycles, parameterized tests, release management, analytics |
| PractiTest | Hierarchical views, custom filters, shared steps, dashboard API |
| Allure | Open-source reporting framework, rich test ops dashboards, history trends |

## Bug Tracking Workflows

- **Bug lifecycle**: New → Triaged → Assigned → In Progress → Fixed → Verified → Closed → (Optional) Reopened
- **Severity vs Priority**:
  - Severity (technical impact): Blocker (no workaround) → Critical (core broken) → Major (feature broken) → Minor (cosmetic) → Trivial
  - Priority (business urgency): P0 (immediate fix) → P1 (before next release) → P2 (this sprint) → P3 (backlog)
- **Bug report essentials**: Summary, steps to reproduce, actual/expected results, environment, screenshots/logs, severity, priority, affected version

---

## Test Metrics & KPIs

- **Execution metrics**: Pass rate (% passed / total executed), fail rate, block rate
- **Coverage metrics**: Requirement coverage, code coverage (line, branch, function, path), risk coverage
- **Defect metrics**: Open defect count, defect density (defects / feature size), defect removal efficiency (DRE), mean time to detect (MTTD), mean time to repair (MTTR)
- **Automation metrics**: Automation coverage (automated / total tests), flaky test rate, CI pipeline duration
- **Velocity metrics**: Tests written per sprint, execution time reduction over releases

## Traceability Matrix (RTM)

- Bidirectional mapping: Requirements ↔ Test cases ↔ Defects ↔ Code changes
- Used to: Prove coverage completeness, assess regression impact, audit compliance
- **Format**: Spreadsheet or tool-powered (Xray, TestRail custom links, Jira issue links)
- **Compliance traceability**: Required for DO-178C (aviation), FDA (medical devices), SOX (financial reporting)

---

## Reporting Dashboards

- **Stakeholder dashboard**: Pass/fail trend (last 10 builds), requirement coverage %, open defects by severity, automation/ manual split
- **Sprint dashboard**: Tests executed vs planned, new defects by day, re-test results, automation pass/fail per module
- **Release dashboard**: Regression pass rate, blocker count, automation health, environment stability
- **Common tools**: Grafana + InfluxDB (custom), Allure TestOps, TestRail dashboards, Tableau/Power BI for enterprise reporting

## Test Environment Management

- Environment types: Dev, QA, Staging, Pre-Prod, Production (read-only)
- Environment readiness checklist: Data seeding, config/variable parity, network access, 3rd-party stubs/mocks
- Configuration-as-code: Docker Compose, Kubernetes (Dev/Test namespaces), Terraform for ephemeral environments
- **Data hygiene**: Anonymized prod copies for staging, synthetic data for smoke/regression, specific edge-case data sets per feature

## Test Data Strategies

- Production cloning (masked): Most realistic data but PII compliance risk; use tokenization/masking/format-preserving encryption
- Synthetic generation: Faker (JS/Python), Mockaroo, test data factories (Factory Boy, Fabricator)
- API seeding: Predefined state via REST endpoints before test suite runs
- Teardown strategy: Database rollback, transaction rollback, API cleanup endpoint, ephemeral environment destroy
