# Database Systems

## PostgreSQL

### Connection Libraries
- `pg` (node-postgres): Most popular
- `postgres.js`: Modern, TypeScript-first
- `@neondatabase/serverless`: Serverless PostgreSQL

### Best Practices
- Use connection pooling
- Implement read replicas for scaling
- Use prepared statements for repeated queries
- Enable SSL for production
- Use migrations for schema changes
- Implement proper indexing

### Common Patterns
```sql
-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Transactions
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

---

## MySQL

### Connection Libraries
- `mysql2`: Modern, Promise-based
- `knex`: Query builder with migrations

### Best Practices
- Use connection pooling
- Implement read replicas
- Use transactions for data integrity
- Enable SSL for production
- Use UTF8MB4 character set

---

## MongoDB

### ODM Libraries
- `mongoose`: Most popular ODM
- `mongodb`: Official driver

### Best Practices
- Use connection pooling
- Implement proper indexing
- Use change streams for real-time updates
- Use transactions for multi-document operations
- Implement schema validation
- Use lean queries for read-only operations

### Schema Design
```javascript
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
```

---

## Redis

### Client Libraries
- `ioredis`: Feature-rich Redis client
- `redis`: Official Redis client

### Use Cases
- Caching
- Session storage
- Rate limiting
- Pub/Sub messaging
- Queue management

### Best Practices
- Use connection pooling
- Implement proper key naming
- Use TTL for cache expiration
- Implement pub/sub for real-time features
- Use Redis Cluster for scaling

---

## SQLite

### Libraries
- `better-sqlite3`: Synchronous, fast
- `sqlite3`: Async, callback-based
- `bun:sqlite`: Bun native

### Use Cases
- Development/testing
- Embedded applications
- Edge computing
- Local data storage

### Best Practices
- Use WAL mode for better concurrency
- Implement proper indexing
- Use prepared statements
- Enable foreign keys
