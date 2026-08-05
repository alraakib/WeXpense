# Performance Optimization

## Caching Strategies

### In-Memory Caching
```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

// Get/Set
const value = cache.get('key');
cache.set('key', value);

// With callback
const data = await cache.getOrSet('key', async () => {
  return await db.query('SELECT * FROM users');
});
```

### Redis Caching
```typescript
import Redis from 'ioredis';

const redis = new Redis();

// Get/Set
await redis.set('key', JSON.stringify(value), 'EX', 300);
const data = JSON.parse(await redis.get('key'));

// Cache-aside pattern
async function getUsers() {
  const cached = await redis.get('users');
  if (cached) return JSON.parse(cached);
  
  const users = await db.user.findMany();
  await redis.set('users', JSON.stringify(users), 'EX', 300);
  return users;
}
```

### HTTP Caching
```typescript
// ETags
app.get('/api/data', (req, res) => {
  const data = getData();
  const etag = generateETag(data);
  
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  
  res.set('ETag', etag);
  res.set('Cache-Control', 'private, max-age=300');
  res.json(data);
});
```

## Database Optimization

### Indexing
```sql
-- Single column
CREATE INDEX idx_users_email ON users(email);

-- Composite
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Partial
CREATE INDEX idx_active_users ON users(email) WHERE active = true;
```

### Query Optimization
```typescript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true }
});

// Use pagination
const users = await prisma.user.findMany({
  skip: 0,
  take: 10,
  orderBy: { createdAt: 'desc' }
});

// Use transactions
await prisma.$transaction([
  prisma.user.update({ where: { id: 1 }, data: { name: 'Updated' } }),
  prisma.log.create({ data: { action: 'update_user' } })
]);
```

## Connection Pooling

### PostgreSQL
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Use pool
const client = await pool.connect();
try {
  const result = await client.query('SELECT * FROM users');
} finally {
  client.release();
}
```

## Compression

```typescript
import compression from 'compression';

app.use(compression());
```

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);
```

## Lazy Loading

```typescript
// Dynamic imports
async function getHeavyModule() {
  const { default: heavyModule } = await import('./heavy-module');
  return heavyModule;
}
```

## Best Practices

- Use connection pooling
- Implement caching at multiple levels
- Use compression
- Implement rate limiting
- Use pagination for large datasets
- Optimize database queries
- Use indexes appropriately
- Monitor performance metrics
- Use CDN for static assets
- Implement lazy loading
