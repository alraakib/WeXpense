# Database Performance & Monitoring Reference

## Key Metrics

### Throughput
- Queries per second (QPS) / Transactions per second (TPS)
- Rows read/written per second
- WAL/log bytes generated per second

### Latency
- Query execution time (p50, p95, p99)
- Connection acquisition time
- Replication lag (seconds)

### Resource Usage
- CPU utilization (user/system/iowait)
- Memory usage (buffers, cache, connections)
- Disk I/O (read/write IOPS, latency, throughput)
- Network I/O

### Connection Management
- Active/idle connections
- Connection wait time
- Connection pool utilization

## PostgreSQL Monitoring
```sql
-- Query performance
SELECT query, calls, total_exec_time, mean_exec_time, rows, shared_hit_ratio
FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 20;

-- Connection count
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;

-- Cache hit ratio
SELECT 'cache_hit' AS metric, ROUND(sum(blks_hit) * 100.0 / sum(blks_read + blks_hit), 2)
FROM pg_stat_database;

-- Replication lag
SELECT application_name, state, pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn)
FROM pg_stat_replication;

-- Table bloat
SELECT schemaname, tablename, n_dead_tup, n_live_tup,
  ROUND(n_dead_tup * 100.0 / GREATEST(n_live_tup + n_dead_tup, 1), 2) AS dead_pct
FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 20;
```

## MySQL Monitoring
```sql
-- Query performance
SELECT digest_text, count_star, avg_latency, sum_rows_examined
FROM performance_schema.events_statements_summary_by_digest
ORDER BY avg_latency DESC LIMIT 20;

-- InnoDB status
SHOW ENGINE INNODB STATUS\G

-- Buffer pool
SELECT pool_id, pages_data, pages_free, pages_dirty,
  pages_data / (pages_data + pages_free) * 100 AS usage_pct
FROM information_schema.INNODB_BUFFER_POOL_STATS;

-- Replication lag
SHOW SLAVE STATUS\G
-- Check Seconds_Behind_Master

-- Table cache
SHOW GLOBAL STATUS LIKE 'Open_tables';
SHOW GLOBAL STATUS LIKE 'Opened_tables';
```

## MongoDB Monitoring
```javascript
// Current operations
db.currentOp({ "active": true, "secs_running": { "$gt": 5 } });

// Server status
db.serverStatus().metrics;
db.serverStatus().connections;
db.serverStatus().network;

// Operations counters
db.serverStatus().opcounters;

// Replica set status
rs.status();

// Profiling
db.setProfilingLevel(1, { slowms: 100 });
db.system.profile.find({ millis: { $gt: 1000 } }).sort({ ts: -1 }).limit(20);
```

## Database-Specific Tools
- **PostgreSQL**: pg_stat_statements, pgBadger, pgMustard, explain.depesz.com
- **MySQL**: performance_schema, sys schema, pt-query-digest (Percona), MySQLTuner
- **MongoDB**: mongostat, mongotop, Atlas Monitoring, MongoDB Compass
- **Redis**: redis-cli --stat, RedisInsight, MONITOR command
- **General**: Prometheus exporters (postgres_exporter, mysqld_exporter, redis_exporter), Grafana dashboards

## Slow Query Analysis
1. Enable slow query logging
2. Collect slow query samples over representative period
3. Analyze with `EXPLAIN ANALYZE` / execution plan
4. Identify: full table scans, missing indexes, bad join order, large sorts, row lookups
5. Optimize: add indexes, rewrite queries, denormalize, cache

## Capacity Planning
- Monitor growth rate: storage, QPS, connection count
- Set alerts at 70% (warning) and 85% (critical) utilization
- Plan for 2-3x traffic growth over next year
- Consider vertical scaling (bigger instance) vs horizontal (read replicas, sharding)
- Test with production traffic patterns (synthetic load testing with pgbench, mysqlslap, sysbench)
