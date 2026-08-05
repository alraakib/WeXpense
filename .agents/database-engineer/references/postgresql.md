# PostgreSQL Reference

## Architecture
- **Multi-process**: One backend process per client connection
- **Shared Buffers**: In-memory cache for data pages
- **WAL (Write-Ahead Log)**: Crash recovery and replication
- **MVCC**: Multi-version concurrency control for isolation
- **Vacuum**: Reclaims dead tuples, updates visibility maps

## Key Features
- **ACID Compliant**: Full transaction support with serializable isolation
- **Extensions**: PostGIS (spatial), pgvector (vector search), pg_partman (partitioning), TimescaleDB (time-series)
- **Replication**: Streaming replication, logical replication, cascading
- **Indexing**: B-tree, Hash, GiST, GIN, SP-GiST, BRIN
- **Full-Text Search**: Built-in with tsvector/tsquery
- **JSON/JSONB**: Native document storage with indexing
- **Foreign Data Wrappers (FDW)**: Query external data sources

## SQL Examples
```sql
-- Table with constraints
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created ON users(created_at DESC);
CREATE INDEX idx_users_name_trgm ON users USING gin(name gin_trgm_ops);

-- Full-text search
CREATE INDEX idx_articles_fts ON articles USING gin(to_tsvector('english', title || ' ' || body));

-- Window functions
SELECT name, salary, RANK() OVER (ORDER BY salary DESC) as rank FROM employees;

-- Recursive CTE
WITH RECURSIVE org_tree AS (
  SELECT id, name, parent_id, 1 as depth FROM employees WHERE parent_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.parent_id, ot.depth + 1 FROM employees e
  JOIN org_tree ot ON e.parent_id = ot.id
)
SELECT * FROM org_tree;
```

## Performance Tuning
- `shared_buffers`: 25% of RAM
- `work_mem`: Per-operation sort memory (1-64MB)
- `maintenance_work_mem`: VACUUM, CREATE INDEX (10% of RAM)
- `effective_cache_size`: OS cache estimate (50-75% of RAM)
- `random_page_cost`: SSD = 1.1, HDD = 4.0
- `max_connections`: Connection pool handles this (recommend pgbouncer)
- `wal_buffers`: 16-64MB for write-heavy workloads

## Monitoring Queries
```sql
-- Slow queries
SELECT query, calls, total_exec_time, mean_exec_time, rows
FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

-- Active queries
SELECT pid, state, query_start, wait_event, query FROM pg_stat_activity
WHERE state != 'idle' ORDER BY query_start;

-- Table size
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC;

-- Missing indexes
SELECT schemaname, tablename, seq_scan, seq_tup_read, idx_scan
FROM pg_stat_user_tables WHERE seq_scan > 1000 ORDER BY seq_scan DESC;
```

## Backup & Restore
```bash
pg_dump -Fc -h host -U user db > db.dump        # Custom format
pg_dumpall -h host -U user > all.sql            # Full cluster
pg_restore -d db db.dump                        # Restore custom dump
```

## Best Practices
- Use connection pooling (PgBouncer, Pgpool-II)
- Use `EXPLAIN ANALYZE` for query optimization
- Regular VACUUM (autovacuum enabled by default)
- Use partitions for large tables (by date, range, list)
- Use `NOTIFY`/`LISTEN` for real-time updates
- Enable `pg_stat_statements` for query performance tracking
- Use JSONB with GIN indexes for document storage
- Set `statement_timeout` to prevent runaway queries
