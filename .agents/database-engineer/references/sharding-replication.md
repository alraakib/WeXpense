# Sharding & Replication Reference

## Replication Patterns

### PostgreSQL Replication
- **Streaming Replication**: WAL records sent from primary to standby
- **Synchronous Replication**: Primary waits for standby acknowledgment
- **Logical Replication**: Publish/subscribe at table level, cross-version compatible
- **Cascading Replication**: Standby can serve as source for other standbys
- **Use Cases**: Read scaling, HA, geographic distribution, zero-downtime upgrades

### MySQL Replication
- **Async Replication**: Default, low overhead, potential data loss on failover
- **Semi-Sync Replication**: At least one replica acknowledges
- **Group Replication**: Multi-primary, built-in conflict detection
- **GTID**: Global Transaction IDs for simplified failover
- **Use Cases**: Read replicas, HA (InnoDB Cluster), backup source

### MongoDB Replication (Replica Sets)
- **Primary**: Accepts all writes, creates oplog entries
- **Secondaries**: Apply oplog entries, can serve reads (with read preference)
- **Arbiter**: Votes in elections but stores no data
- **Election**: Triggered on primary failure, majority votes new primary
- **Priority**: Set priority 0 for disaster recovery nodes
- **Use Cases**: Automatic failover, read scaling, backup source

## Sharding Strategies

### MongoDB Sharding
- **Shard Key**: Critical choice for distribution
- **Range-based**: Good for range queries, uneven distribution possible
- **Hash-based**: Even distribution, no range query support
- **Zone Sharding**: Geographic data placement
- **Hedged Reads**: Send reads to multiple shards, use fastest response

### PostgreSQL Sharding
- **Citus**: Distributed PostgreSQL (column sharding, reference tables, co-located joins)
- **Schema-based**: Manual partitioning across servers
- **Foreign Data Wrappers**: `postgres_fdw` for cross-server queries
- **Native Partitioning**: Declarative partitioning, not sharding (single server)

### MySQL Sharding
- **Vitess**: Database clustering system for horizontal scaling
- **ProxySQL**: Query routing and load balancing
- **Application-level**: Manual shard routing in application code
- **MySQL Cluster (NDB)**: Auto-sharding, in-memory default

## Shard Key Selection (MongoDB)
- High cardinality (many unique values)
- Low frequency (no hot shards)
- Monotonically increasing values are fine with hashed sharding
- Write-heavy workloads: use hashed sharding
- Read-heavy with range queries: use ranged sharding with good key
- Compound shard keys for better distribution

## Common Topologies
- **Single Primary, Multiple Replicas**: Read scaling, backup source
- **Multi-Primary (Active-Active)**: Write scaling, conflict resolution needed
- **Sharded Cluster**: Horizontal scaling, complex operations
- **Regional Distribution**: Geo-replication for low-latency reads
- **Hybrid**: Shards are replica sets (typical MongoDB deployment)
