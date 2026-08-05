# System Design & Scalability Reference

## Scalability Dimensions

### Vertical Scaling (Scale Up)
- Bigger servers (CPU, RAM, disk)
- Simpler, no architecture changes
- Limited by max hardware, cost grows super-linearly

### Horizontal Scaling (Scale Out)
- More servers behind load balancer
- Requires stateless or distributed-state design
- Near-linear cost scaling
- Types: Replication, Sharding, Partitioning

### Database Scaling
- **Read Replicas**: Handle read-heavy workloads
- **Connection Pooling**: PgBouncer, ProxySQL, RDS Proxy
- **Caching Layer**: Redis/Memcached before DB
- **CQRS**: Separate read/write paths
- **Sharding**: Horizontal data partitioning
- **Denormalization**: Reduce joins for read performance

### Caching Strategies
- **Application Cache**: In-memory (NodeCache, caffeine) for hot data
- **Distributed Cache**: Redis, Memcached for shared state
- **CDN**: Static assets, API responses (CloudFront, CloudFlare)
- **HTTP Caching**: ETags, Cache-Control headers
- **Database Cache**: Buffer pool (InnoDB, shared_buffers), query cache (deprecated)

### Cache Patterns
| Pattern | Description | Use Case |
|---------|-------------|----------|
| Cache-Aside | App checks cache first, loads from DB on miss | General purpose |
| Read-Through | Cache auto-loads on miss from DB | DB query cache |
| Write-Through | Write to cache and DB simultaneously | Consistent writes |
| Write-Behind | Write to cache, async write to DB | Write throughput |
| Write-Around | Write to DB, invalidate cache | Write-heavy, read-cold |

## CAP Theorem
- **Consistency**: All nodes see same data at same time
- **Availability**: Every request gets a response (may be stale)
- **Partition Tolerance**: System continues despite network partition
- C+A (no P): Traditional single-node databases
- C+P (no A): Distributed databases during partition (ZooKeeper, etcd)
- A+P (no C): Eventually consistent systems (DNS, CDN, gossip protocols)

## Load Balancing Patterns

### Algorithms
| Algorithm | Behavior | Best For |
|-----------|----------|----------|
| Round Robin | Sequential distribution | Equal-capacity servers |
| Least Connections | Send to least busy server | Varying request duration |
| IP Hash | Client IP maps to server | Session persistence |
| Weighted | Distribution based on capacity | Heterogeneous servers |
| Random | Random selection | Simple distribution |

### Health Checks
- **Active**: Periodic probes to /health endpoint
- **Passive**: Track connection failures (circuit breaker)
- **Startup**: Initial delay before routing traffic
- **Liveness**: Is instance alive? Restart if not
- **Readiness**: Can instance handle traffic? Remove if not

## Fault Tolerance Patterns

### Circuit Breaker
```
Closed → Open (when failures > threshold) → Half-Open (after timeout)
```
- **Closed**: Requests pass through normally
- **Open**: Requests fail fast (no wait), calling code handles fallback
- **Half-Open**: Allow test request, success = close, fail = stay open
- Tools: Opossum (Node), Resilience4j (Java), Hystrix

### Retry with Backoff
- **Exponential Backoff**: 100ms, 200ms, 400ms, 800ms, 1600ms... + jitter
- **Maximum Retries**: Usually 3-5
- **Idempotency**: Retry-safe operations (same result on repeat)

### Bulkhead
- Isolate resources by thread pool/semaphore per service
- Prevents one failing service from consuming all threads
- Example: Separate thread pools for auth vs orders vs payments

### Timeouts
- **Connect Timeout**: Time to establish connection (500ms-5s)
- **Read Timeout**: Time to receive response head (5-30s)
- **Request Timeout**: Total request duration (30-60s)
- Always set timeouts — unset timeouts = resource leak

## Data Flow Design

### Event-Driven Data Flow
```
User Service  ──{UserCreated}──→ Kafka ──→ Email Service
                                  │
                                  ├──→ Analytics Service
                                  │
                                  └──→ Search Indexer
```

### CDC (Change Data Capture)
- Capture DB changes in real-time
- Tools: Debezium (Kafka Connect), AWS DMS, GoldenGate
- Use cases: Sync search index, invalidate cache, update analytics

### Batch Processing
- **Tools**: Spark, MapReduce, Spring Batch
- **Patterns**: ETL, data warehousing, report generation
- **Scheduling**: Cron, Airflow, dagster, Prefect

### Streaming Processing
- **Tools**: Kafka Streams, Flink, Spark Streaming
- **Use Cases**: Real-time analytics, fraud detection, monitoring
