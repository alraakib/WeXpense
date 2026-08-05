# Redis Reference

## Architecture
- **In-Memory**: Single-threaded event loop, sub-millisecond latency
- **Persistence**: RDB (point-in-time snapshots), AOF (append-only log), or both
- **Replication**: Primary-replica with async replication
- **Sentinel**: High availability with automatic failover
- **Cluster**: Automatic sharding across multiple nodes (hash slots)

## Data Structures
```bash
# Strings (caching, counters, sessions)
SET user:1 "Alice"
GET user:1
INCR page_views:2024-01-01
SETEX session:token 3600 "user_data"  # TTL

# Lists (queues, logs)
LPUSH queue:jobs "task1"
RPOP queue:jobs
LLEN queue:jobs

# Sets (unique items, tags)
SADD user:1:tags "redis" "database"
SMEMBERS user:1:tags
SISMEMBER user:1:tags "redis"

# Sorted Sets (leaderboards, rate limiting)
ZADD leaderboard 100 "user1" 200 "user2"
ZREVRANGE leaderboard 0 9 WITHSCORES
ZINCRBY leaderboard 50 "user1"

# Hashes (objects)
HSET user:1 name "Alice" email "alice@example.com"
HGETALL user:1
HINCRBY user:1 login_count 1

# Streams (event logs, message queues)
XADD events * type "login" user_id "1"
XREAD BLOCK 0 STREAMS events 0

# Bitmaps (analytics)
SETBIT daily:active:2024-01-01 12345 1
BITCOUNT daily:active:2024-01-01
```

## Use Cases
- **Caching**: Session storage, API response cache, database query cache
- **Rate Limiting**: Sliding window, token bucket
- **Queues**: Bull/BullMQ for job processing, message queues
- **Real-time**: Pub/Sub, streaming with Redis Streams
- **Leaderboards**: Sorted sets for gaming/social
- **Distributed Locking**: Redlock algorithm with SET NX
- **Counters**: Page views, likes, API calls
- **Geospatial**: GEOADD, GEORADIUS for location data

## Best Practices
- Always set TTL for cache keys (eviction policy: allkeys-lru or volatile-lru)
- Use connection pooling (ioredis pool, redis-py ConnectionPool)
- Use pipelining for bulk operations (reduces round trips)
- Use SCAN instead of KEYS in production
- Avoid long-running commands (KEYS, SMEMBERS on large sets)
- Use Lua scripting for atomic multi-key operations
- Monitor memory with INFO memory and MEMORY USAGE
- Enable AOF persistence for data durability
- Configure maxmemory-policy for eviction
- Use Redis Cluster for datasets > 10GB
