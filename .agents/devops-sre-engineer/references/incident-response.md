# Incident Response & SRE Reference

## SLOs, SLIs, SLAs
- **SLI (Service Level Indicator)**: Measured metric (latency p99, error rate, uptime)
- **SLO (Service Level Objective)**: Target value for SLI (p99 < 200ms, 99.9% uptime)
- **SLA (Service Level Agreement)**: Contractual commitment to SLO (with penalties)
- **Error Budget**: (1 - SLO) * total time = allowed downtime
- **Burn Rate**: How fast error budget is consumed

### Common SLIs
- Availability: % of successful requests
- Latency: p50, p95, p99 response times
- Throughput: requests/second
- Error Rate: % of failed requests
- Saturation: resource utilization

## Incident Response Process

### Triage (0-5 min)
1. Acknowledge alert
2. Determine severity (SEV1: critical, SEV2: high, SEV3: medium, SEV4: low)
3. Declare incident with timestamp
4. Gather initial information

### Investigation (5-30 min)
1. Check dashboards (latency, error rates, saturation)
2. Review recent deployments/changes
3. Examine logs for error patterns
4. Check dependency health
5. Trace request flows

### Mitigation (30-60 min)
1. Rollback recent deployment if regression
2. Scale resources if capacity issue
3. Redirect traffic if regional outage
4. Restart/recycle services if stuck state
5. Apply hotfix if critical bug

### Resolution
1. Verify fix with monitoring
2. Communicate resolution
3. Post-mortem within 48 hours

## Runbook Example
```markdown
# High Error Rate Runbook

**Severity**: SEV2
**Response Time**: 15 minutes

## Symptoms
- Error rate > 1% in dashboard
- Users report 500 errors

## Checks
1. Check recent deployments: `kubectl rollout history deployment/<service>`
2. Check pod status: `kubectl get pods -o wide`
3. Check logs: `kubectl logs -l app=<service> --tail=100`
4. Check dependencies: database connections, Redis, upstream APIs
5. Check resource usage: `kubectl top pods`

## Mitigation
1. If deployment issue: `kubectl rollout undo deployment/<service>`
2. If capacity issue: Update HPA min replicas
3. If DB issue: Check connection pool, slow queries
4. Escalate to on-call engineer if unresolved in 30 min
```

## On-Call Best Practices
- Clear escalation paths (L1 -> L2 -> Engineering Lead)
- Follow-the-sun rotation for 24/7 coverage
- No engineering work during on-call (focus on incidents)
- Handover documentation between shifts
- Auto-escalation if no acknowledgment after N minutes
- Incident commander role for major incidents
- Blameless post-mortems with action items
- Regular fire drills and tabletop exercises
