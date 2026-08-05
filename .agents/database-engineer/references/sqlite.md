# SQLite Reference

## Architecture
- **Embedded**: Serverless, zero-configuration, in-process library
- **Single File**: Entire database in one file on disk
- **MVCC**: Multi-version concurrency control for isolation
- **WAL Mode**: Write-Ahead Logging for concurrent reads
- **Pragma**: Configuration options via PRAGMA statements

## Key Features
- **ACID**: Full transaction support
- **Zero Config**: No setup, no server process
- **Portable**: Single file, cross-platform
- **Small Footprint**: < 600KB library size
- **FTS5**: Full-Text Search extension
- **JSON1**: JSON functions and operators
- **R-Tree**: Spatial indexing

## Performance Configuration
```sql
PRAGMA journal_mode=WAL;           -- Write-Ahead Logging for better concurrency
PRAGMA synchronous=NORMAL;         -- Balance safety/speed (WAL mode)
PRAGMA cache_size=-64000;          -- 64MB page cache
PRAGMA busy_timeout=5000;          -- Wait 5s before busy error
PRAGMA foreign_keys=ON;            -- Enforce FK constraints
PRAGMA mmap_size=268435456;        -- 256MB memory-mapped I/O
PRAGMA temp_store=MEMORY;          -- Store temp tables in memory
```

## Best Practices
- Use WAL mode for production (readers don't block writers)
- Enable foreign keys explicitly (off by default)
- Use prepared statements for performance
- Use transactions for batch operations
- Use `EXPLAIN QUERY PLAN` for optimization
- Regular `PRAGMA integrity_check` for data integrity
- Use `VACUUM` to reclaim space after large deletes
- Keep the database file on SSD for best performance
- For concurrent writes, consider PostgreSQL instead

## Limitations
- No user management or access control
- Limited concurrent writes (one writer at a time)
- No network access (embedded only)
- Limited ALTER TABLE support (use CREATE + INSERT)
- 140TB max database size (practical limit much lower)
