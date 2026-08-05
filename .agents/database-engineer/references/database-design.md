# Database Design Reference

## Normalization

### Normal Forms
- **1NF**: Atomic columns, no repeating groups
- **2NF**: 1NF + all non-key columns depend on full primary key
- **3NF**: 2NF + no transitive dependencies (non-key depends only on key)
- **BCNF**: 3NF + every determinant is a candidate key
- **4NF**: BCNF + no multi-valued dependencies

### Denormalization (When to Use)
- Read-heavy workloads, reduce JOINs
- Reporting/analytics queries
- Caching pre-computed values (counts, totals)
- Time-series data (bucket pattern)
- Embedded documents (MongoDB)

## Indexing Strategies

### Index Types
- **B-Tree**: Default, good for range/equality (PostgreSQL, MySQL, SQLite)
- **Hash**: Fast equality lookups only (MySQL MEMORY, PostgreSQL with HASH)
- **GIN**: Full-text search, JSONB, arrays (PostgreSQL)
- **GiST**: Full-text, geometry, range types (PostgreSQL)
- **BRIN**: Block-range indexes for very large tables (PostgreSQL)
- **Covering Index**: Includes all columns needed by query

### Index Best Practices
- Index columns in WHERE, JOIN, ORDER BY, GROUP BY
- Index foreign keys used in JOINs
- Use composite indexes with column order: equality first, then range
- Avoid over-indexing (impacts write performance)
- Monitor unused indexes and remove them
- Use partial indexes for filtered queries
- Use expression indexes for function-based filters
- Consider index-only scans (covering indexes)

### Composite Index Ordering
```sql
-- Good: equality first, then range
CREATE INDEX idx ON table (status, created_at);
-- Query: WHERE status = 'active' AND created_at > '2024-01-01'
-- Uses index efficiently (equality on status, range on created_at)

-- Bad: range first
CREATE INDEX idx ON table (created_at, status);
-- Query: WHERE status = 'active' AND created_at > '2024-01-01'
-- Less efficient (can't use status for lookup after range)
```

## Query Optimization
- Use `EXPLAIN ANALYZE` to understand execution plans
- Avoid SELECT * — fetch only needed columns
- Use LIMIT/OFFSET or keyset pagination (not OFFSET for large datasets)
- Use connection pooling to reduce connection overhead
- Batch inserts with single transaction
- Use CTEs for complex queries (readability + optimization fence)
- Avoid N+1 queries — use JOINs or batch loading (GraphQL dataloader)
- Use materialized views for expensive aggregations
- Prefer JOINs over subqueries when possible
- Use window functions over self-joins

## Data Types Best Practices
- Use UUIDs for distributed systems (store as BINARY(16) in MySQL, UUID in PostgreSQL)
- Use TIMESTAMPTZ (PostgreSQL) or TIMESTAMP WITH TIME ZONE for time values
- Use DECIMAL/NUMERIC for monetary values (never FLOAT)
- Use TEXT/VARCHAR for strings (TEXT in PostgreSQL has no performance penalty)
- Use ENUM sparingly (adds coupling, hard to alter)
- Prefer NATURAL (integer) IDs for internal references
- Use JSON(A)/JSONB only when schema is truly dynamic

## Migration Strategies
- Use migration tools: Flyway, Liquibase, Prisma Migrate, Alembic
- Always create down migrations for rollback support
- Test migrations on staging before production
- Add columns as nullable (use backfill for NOT NULL)
- Avoid long-running locks (use pgroll or gh-ost for zero-downtime)
- Version control all migrations
- Use migration checksums for integrity
