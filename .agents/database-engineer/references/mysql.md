# MySQL Reference

## Architecture
- **Multi-threaded**: One thread per connection
- **Storage Engines**: InnoDB (default), MyISAM, Memory, CSV
- **InnoDB**: ACID-compliant, row-level locking, MVCC, foreign keys, crash recovery via redo log
- **Buffer Pool**: Primary cache for InnoDB data and indexes

## Key Features
- **Replication**: Async, semi-sync, group replication, GTID-based
- **Partitioning**: Range, List, Hash, Key
- **Full-Text Search**: InnoDB supports FTS with query expansion
- **JSON**: Native JSON data type with functions
- **Views, Stored Procedures, Triggers, Events**

## SQL Examples
```sql
-- Table with constraints
CREATE TABLE users (
  id BINARY(16) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB;

-- Full-text index
ALTER TABLE articles ADD FULLTEXT INDEX idx_fts (title, body);
SELECT * FROM articles WHERE MATCH(title, body) AGAINST('search terms');

-- Partitioning
CREATE TABLE orders (
  id INT NOT NULL,
  order_date DATE NOT NULL,
  amount DECIMAL(10,2),
  PRIMARY KEY (id, order_date)
) PARTITION BY RANGE (YEAR(order_date)) (
  PARTITION p2023 VALUES LESS THAN (2024),
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026)
);
```

## Performance Tuning (InnoDB)
- `innodb_buffer_pool_size`: 70-80% of RAM for dedicated DB
- `innodb_log_file_size`: 1-4GB for write-heavy workloads
- `innodb_flush_log_at_trx_commit`: 1 (safest), 2 (faster with minor data loss risk)
- `innodb_io_capacity`: 200 (HDD), 2000+ (SSD/NVMe)
- `max_connections`: 151 default, use ProxySQL for connection pooling
- `query_cache_type`: Disabled in MySQL 8, use application caching instead
- `tmp_table_size`/`max_heap_table_size`: For in-memory temporary tables

## Monitoring Queries
```sql
-- Slow queries
SELECT * FROM sys.statement_analysis ORDER BY avg_latency DESC LIMIT 10;

-- Running queries
SELECT * FROM performance_schema.processlist WHERE command != 'Sleep';

-- Table sizes
SELECT table_schema, table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables ORDER BY size_mb DESC;

-- InnoDB status
SHOW ENGINE INNODB STATUS\G
```

## Backup & Restore
```bash
mysqldump -h host -u user -p db > dump.sql
mysqldump --all-databases --single-transaction > all.sql
mysql -h host -u user -p db < dump.sql
```

## Best Practices
- Always use InnoDB for production
- Use `utf8mb4` character set (full Unicode support)
- Use connection pooling (ProxySQL, MySQL Router)
- Enable slow query log for performance analysis
- Use `pt-query-digest` for query analysis (Percona Toolkit)
- Regular `OPTIMIZE TABLE` for InnoDB with fragmented indexes
- Use `EXPLAIN` for query execution plan analysis
- Set `sql_mode = STRICT_TRANS_TABLES, NO_ENGINE_SUBSTITUTION`
- Monitor replication lag with `SHOW SLAVE STATUS`
