# Backend & API Performance

## Caching Patterns

- **In-memory cache (NodeCache, lru-cache):** Fastest (microsecond reads), limited by process memory. Use for computed data, config, small reference data.
- **Distributed cache (Redis, KeyDB, Dragonfly):** Shared across instances, supports TTL, eviction policies (LRU, LFU, TTL). Use for session store, rate limit counters, heavy query results.
- **Multi-tier caching:** L1 (in-memory, fast) + L2 (Redis, larger) fallback pattern
- **Cache invalidation strategies:** TTL-based (simplest), write-through, write-behind, cache-aside (lazy loading)
- **Cache stampede prevention:** Locking (Redlock), probabilistic early expiration (XFetch), stale-while-revalidate

```js
// cache-aside pattern
async function getCached(key, fetchFn, ttl = 60) {
  const cached = await cache.get(key);
  if (cached) return cached;
  const data = await fetchFn();
  await cache.set(key, data, ttl);
  return data;
}
```

---

## HTTP Caching

- **ETag:** Weak validator for content negotiation. Use `etag` (Node.js) or `fastify-etag`
- **Cache-Control:**
  - `public, max-age=31536000, immutable` — fingerprinted static assets
  - `no-cache` — must revalidate with ETag (HTML, API responses)
  - `private, no-store` — sensitive/authenticated responses
- **CDN integration:** Set `s-maxage` or `CDN-Cache-Control` headers for shared caches
- **Vary header:** `Vary: Accept-Encoding, Accept, Authorization`
- **Conditional requests:** `If-None-Match` (ETag) and `If-Modified-Since` (304 Not Modified)

---

## Database Query Optimization

- **N+1 detection:** Use Prisma `prisma.$queryRawUnsafe` logging, Sequelize logging, or `knex` query events. Enable logging in dev and watch for repeated identical queries inside loops.
- **Indexing strategy:**
  - B-tree indexes for equality + range queries
  - Composite indexes — leftmost prefix rule (column order matters)
  - Covering indexes — include all selected columns to avoid table lookups
  - Partial indexes for filtered queries (WHERE conditions)
- **Query analysis:** `EXPLAIN ANALYZE` (PostgreSQL), `EXPLAIN` (MySQL), `slow_query_log`
- **Pagination:** Keyset pagination (cursor-based) instead of OFFSET for large datasets
- **Denormalization:** Pre-computed aggregates, materialized views for read-heavy workloads
- **Connection limit:** Pool exhaustion causes cascading failure — monitor `pg-pool` or `mysql2` pool metrics

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123 AND status = 'active';
```

---

## Connection Pooling

- **Database pooling:** `pg-pool` (PostgreSQL), `mysql2` pool, `redis` `maxRetriesPerRequest` and `enableReadyCheck`
- **Optimal pool size:** `(core_count * 2) + effective_spindle_count` rule of thumb. Start with 25-50 for most apps.
- **HTTP keep-alive:** Reuse TCP connections for API calls. Use `agentkeepalive` or built-in `http.Agent` with `keepAlive: true`
- **Monitor:** Pool wait queue length, connection acquisition time, idle connections

```js
const { Pool } = require('pg');
const pool = new Pool({ max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 });
```

---

## Async Processing

- **Message queues:** Bull/BullMQ (Redis-based), RabbitMQ (AMQP), Kafka (event streaming)
- **Worker threads:** `worker_threads` module for CPU-intensive tasks (image processing, video encoding, data transforms)
- **Background jobs pattern:** Producer adds job to queue, consumer processes, results stored for polling/webhook
- **Delayed/retry jobs:** Bull supports `delay`, `attempts`, `backoff` options
- **Throttling:** `p-limit` for concurrency control, `bottleneck` for rate-limited APIs

```js
// BullMQ job producer
const job = await queue.add('email', { to: user.email, template: 'welcome' }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
});
```

---

## Profiling Tools

- **`0x`:** Flame graph generator — `npx 0x -o server.js`
- **`clinic.js`:** Doctor (event loop), Bubbleprof (async ops), Flame (CPU) — `npx clinic doctor -- node server.js`
- **Node.js `--inspect`:** Chrome DevTools for profiling, heap snapshots, CPU flame charts
- **Heap snapshots:** `heapdump` package or `node --heapsnapshot-signal` — take snapshot on SIGUSR2, analyze in Chrome DevTools Memory tab
- **Async hooks:** `async_hooks` module (use sparingly — perf impact) for tracking async resource lifetime

```bash
node --inspect server.js  # then open chrome://inspect
node --cpu-prof --heap-prof server.js  # V8 built-in profiling
```

---

## Memory Leak Detection

- **Heap snapshot comparison:** Take snapshot A → perform action → take snapshot B → compare (filter "detached" or "not reachable")
- **GC monitoring:** `--trace-gc` flag, `process.memoryUsage()` polling, `why-is-node-running` package
- **Common leak sources:** Closures capturing large objects, global singletons, unregistered listeners, unclosed connections, growing Maps/Sets
- **Monitoring:** Grafana dashboard with `nodejs_heap_size_used_bytes`, `nodejs_external_memory_bytes`
- **Alerts:** Set thresholds for heap growth rate, GC pause time > 100ms

---

## Event Loop Monitoring

- **`toobusy-js`:** Measures event loop lag, responds with 503 when saturated
- **Lag detection:** Monitor `eventLoopUtilization()` (Node 14+), `process.hrtime()` diff
- **Signature of blocked event loop:** High `before` vs `after` time in `perf_hooks` `monitorEventLoopDelay`
- **`why-is-node-running`:** Debug why Node.js process stays alive (long-lived handles/connections)

```js
const toobusy = require('toobusy-js');
app.use((req, res, next) => {
  if (toobusy()) return res.status(503).send('Server too busy');
  next();
});
```

---

## Compression & Rate Limiting

- **Compression:** `compression` (Express), `fastify-compress` — gzip/brotli, brotli preferred (11-20% smaller than gzip)
- **Rate limiting:** `express-rate-limit`, `@fastify/rate-limit` — in-process; use Redis-backed for distributed rate limiting
- **Backpressure:** Handle backpressure in streams (`drain` events), use `stream.pipeline()` for proper error/handoff
- **Response streaming:** Use streams for large datasets instead of buffering entire response

```js
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({ windowMs: 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use('/api/', limiter);
```

---

## API Response Optimization

- **Pagination:** Cursor-based (preferred) or offset-based. Include `cursor`, `has_more`, `next_url` in response
- **Field selection:** `?fields=id,name,email` — reduce response payload size, parse with GraphQL-style selectors
- **Batch endpoints:** `/api/batch` for N-in-1 requests, reducing round trips
- **Compression headers:** Always accept and prefer `br` (brotli) encoding
- **Response time budgets:** Set p95 latency budget (e.g., < 500ms), monitor SLIs/SLOs
