# Monitoring & Observability Reference

## Prometheus

### Architecture
- **Pull Model**: Server scrapes metrics from targets
- **TSDB**: Local time-series database
- **PromQL**: Query language for metrics
- **Alertmanager**: Deduplication, grouping, routing of alerts
- **Service Discovery**: Kubernetes, Consul, EC2, file-based

### Key Concepts
- **Metrics Types**: Counter, Gauge, Histogram, Summary
- **Labels**: Key-value pairs for multi-dimensional data
- **Jobs & Instances**: Scrape target identification
- **Recording Rules**: Pre-computed expressions
- **Alerting Rules**: Define alert conditions

### PromQL Examples
```
rate(http_requests_total[5m])
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
avg by (instance) (node_cpu_seconds_total{mode="idle"})
```

### Best Practices
- Use `_total` suffix for counters
- Use `_seconds` for durations
- Use `_bytes` for sizes
- Add appropriate labels (service, env, method, status)
- Keep cardinality manageable (avoid high-cardinality labels)
- Use recording rules for expensive queries
- Set appropriate scrape intervals (15-30s default)
- Configure Alertmanager for routing, inhibition, and silences

## Grafana

### Features
- Dashboard creation with panels (graphs, tables, stat)
- Multi-source data mixing
- Alert rules with notification channels
- Annotations for deployment tracking
- Explore mode for ad-hoc querying
- Team/organization management

### Best Practices
- Use template variables for reusability
- Use dashboard folders for organization
- Set appropriate refresh intervals
- Use Grafana Loki for log correlation
- Use annotations to correlate events
- Link panels with cross-link functionality

## Exporters
- **node_exporter**: Host-level metrics (CPU, memory, disk, network)
- **blackbox_exporter**: HTTP/HTTPS/TCP/ICMP probing
- **cadvisor**: Container metrics
- **kube-state-metrics**: Kubernetes object metrics
- **postgres_exporter**: PostgreSQL metrics
- **redis_exporter**: Redis metrics

## Alerting
- **Critical**: Pager/call, 15min response time
- **Warning**: Slack/email, 1hr response time
- **Info**: Dashboard notification
- Use `for` field to prevent flapping alerts
- Use severity labels for routing
- Use `runbook_url` annotation
- Implement alert fatigue prevention
- Use inhibition rules for maintenance
- Test alerts with unit testing framework
