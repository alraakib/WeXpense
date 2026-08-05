# Logging Reference

## ELK Stack (Elasticsearch, Logstash, Kibana)
- **Elasticsearch**: Distributed search and analytics engine, stores logs
- **Logstash**: Server-side data processing pipeline (input -> filter -> output)
- **Kibana**: Visualization and dashboarding
- **Beats**: Lightweight shippers (Filebeat, Metricbeat, Winlogbeat)

### Best Practices
- Use index lifecycle management (ILM) for log retention
- Use index templates for consistent mapping
- Use aliases for zero-downtime reindexing
- Structure logs as JSON for better querying
- Use Elasticsearch snapshot/restore for backups
- Limit field count to prevent mapping explosion

## Loki (Grafana Loki)
- **Design**: Only indexes metadata (labels), not log content
- **LogQL**: Query language (like PromQL for logs)
- **Promtail**: Agent to ship logs, discovers K8s pods
- **Pros**: Cheap, simple, native Grafana integration

### Best Practices
- Use structured logging (JSON)
- Add useful labels (service, env, level) but avoid cardinality explosion
- Use `chunk_target_size` for optimal chunk size
- Enable retention with table manager
- Use `boltdb_shipper` for single-binary deployments

## Structured Logging (Application)
```json
{
  "level": "info",
  "timestamp": "2025-01-15T10:30:00Z",
  "service": "user-service",
  "trace_id": "abc123",
  "message": "User created",
  "user_id": "123",
  "duration_ms": 45
}
```

## Logging Patterns
- **Centralized Aggregation**: All logs shipped to central system
- **Correlation IDs**: Use trace/span IDs for request tracing
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Sampling**: Log high-volume debug logs at reduced rate
- **PII Redaction**: Never log passwords, tokens, PII
- **Alert Integration**: ERROR logs -> Alertmanager -> paging

## Log Shipping
- **Fluentd**: Unified logging layer, plugins for many outputs
- **Fluent Bit**: Lightweight, C-based, lower resource usage
- **Vector**: Rust-based, high performance, multi-source
- **Promtail**: Grafana Loki-specific log shipper
- **Filebeat**: Elastic-specific log shipper
