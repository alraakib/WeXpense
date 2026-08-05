# Quality Metrics & Reporting Reference

## Test Metrics

### Coverage Metrics
- **Code Coverage**: % of lines/branches/paths executed by tests
- **Targets**: 80%+ line coverage, 70%+ branch coverage (project-dependent)
- **Mutation Score**: % of mutants killed (Stryker) — target 80%+
- **Critical Path Coverage**: 100% for auth, payment, data integrity paths

### Quality Gates (CI/CD)
| Gate | Action | Threshold |
|------|--------|-----------|
| Lint | Block PR | 0 errors, 0 warnings |
| Typecheck | Block PR | 0 type errors |
| Unit Tests | Block PR | 80%+ coverage, 0 failures |
| Integration Tests | Block merge | 0 failures |
| E2E Tests | Block deploy | Critical flows pass |
| Performance | Block deploy | p95 < 500ms, error < 1% |
| Security Scan | Block merge | No critical/high vulns |
| Mutation Score | Warning | > 60% |

### Test Execution Metrics
- **Pass Rate**: % of passed tests (target > 99%)
- **Execution Time**: Total CI pipeline duration
- **Flaky Rate**: % of tests that pass/fail inconsistently
- **Test Count**: Total tests per component
- **Maintenance Cost**: Time spent on test maintenance

## Flaky Test Management
- **Detection**: Mark tests that pass/fail inconsistently (retry N times)
- **Quarantine**: Move to separate suite, don't block CI
- **Root Cause**: Identify (timing, order dependency, shared state, async)
- **Fix**: Add proper waits, isolation, cleanup
- **Tracking**: Dashboard of flaky tests by team/module

## Bug Tracking Process
1. **Discovery**: Automated test failure, manual testing, production monitoring
2. **Triage**: Severity (critical/major/minor), priority (P0-P3), assignee
3. **Reproduce**: Steps to reproduce, environment, data setup
4. **Investigate**: Root cause, impacted areas, workaround
5. **Fix**: Code change, tests, verification
6. **Verify**: QA re-test, automated test passes
7. **Close**: Deployed, verified in production

## Reporting Templates

### Test Summary Report
```markdown
# Test Summary — Release v2.5.0

## Results
- **Passed**: 1,245 / 1,250 (99.6%)
- **Failed**: 3 (all known, tracked in JIRA-123, JIRA-124, JIRA-125)
- **Skipped**: 2 (feature-flagged, tracked in JIRA-126)
- **Duration**: 12m 34s

## Coverage
- **Lines**: 87%
- **Branches**: 79%
- **Mutation**: 83%

## Performance
- **Endpoint /api/users**: p95 = 120ms (threshold: 500ms) ✓
- **Endpoint /api/orders**: p95 = 890ms (threshold: 500ms) ✗
- **Throughput**: 840 req/s (target: 500 req/s) ✓

## Flaky Tests
- None detected in this run

## Recommendations
1. Investigate /api/orders performance regression (JIRA-127)
2. Increase integration test coverage for payment module
```

### Bug Report Template
```markdown
**Title**: Clear description
**Severity**: Critical / Major / Minor
**Environment**: Development / Staging / Production (vX.Y.Z)
**Steps to Reproduce**:
1. Go to /users page
2. Click "Create New User"
3. Submit form with empty email
**Expected**: Validation error shown
**Actual**: 500 Internal Server Error
**Logs**: [relevant error log excerpt]
**Impact**: Users cannot create accounts
**Workaround**: None
```

## Test Management Tools
- **Test Case Management**: TestRail, Xray (JIRA), Zephyr, qTest
- **Bug Tracking**: JIRA, Linear, GitHub Issues, GitLab Issues
- **CI/CD Integration**: Jenkins, GitHub Actions, GitLab CI
- **Reporting**: Allure, ReportPortal, Grafana (test metrics dashboard)
- **Coverage**: Istanbul/nyc (JS), JaCoCo (Java), coverage.py (Python), gcov (C/C++)
