# MongoDB Reference

## Architecture
- **Document Store**: JSON-like BSON documents with dynamic schema
- **Replica Set**: Primary + secondaries with automatic failover
- **Sharded Cluster**: Shards (data), Config Servers (metadata), Mongos (query router)
- **WiredTiger**: Default storage engine, document-level concurrency, compression
- **Change Streams**: Real-time data changes (like CDC)

## Key Features
- **Aggregation Pipeline**: Data processing pipeline with stages ($match, $group, $project, $sort, $lookup)
- **Indexes**: Single field, compound, multikey (arrays), text, geospatial, hashed, TTL, partial, sparse
- **Atlas Search**: Built-in full-text search with Lucene integration
- **Vector Search**: Native vector similarity search for AI/ML workloads
- **ACID Transactions**: Multi-document transactions (4.0+) with snapshot isolation
- **Time Series**: Optimized collections for time-series data

## Query Examples
```javascript
// CRUD
db.users.insertOne({ name: "Alice", email: "alice@example.com" });
db.users.find({ name: "Alice" }).sort({ created_at: -1 }).limit(10);
db.users.updateOne({ _id: ObjectId("...") }, { $set: { name: "Bob" } });
db.users.deleteMany({ status: "inactive" });

// Aggregation Pipeline
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$customer_id", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } },
  { $limit: 10 },
  { $lookup: {
      from: "customers",
      localField: "_id",
      foreignField: "customer_id",
      as: "customer"
  } }
]);

// Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.orders.createIndex({ customer_id: 1, created_at: -1 });
db.articles.createIndex({ title: "text", body: "text" });
db.sessions.createIndex({ created_at: 1 }, { expireAfterSeconds: 86400 });

// Change Stream
const pipeline = [{ $match: { "fullDocument.status": "active" } }];
const changeStream = db.users.watch(pipeline);
```

## Performance Tuning
- `wiredTigerCacheSizeGB`: 50% of RAM (default) or adjust
- Use `explain("executionStats")` for query profiling
- Monitor with `db.currentOp()` and `db.serverStatus()`
- Use `$project` early in aggregation to reduce document size
- Avoid `$unwind` on large arrays when possible
- Use covered queries (all fields in index) for fastest reads
- Batch writes with `ordered: false` for bulk operations

## Data Modeling
- **Embedding**: Embed related data for one-to-few relationships
- **Referencing**: Store ObjectIds for one-to-many or many-to-many
- **Polymorphic**: Use discriminator fields for varied document structures
- **Bucket Pattern**: For time-series, group data into time buckets
- **Computed Pattern**: Pre-aggregate counts/sums in documents
- **Subset Pattern**: Store frequently accessed fields in parent doc

## Backup & Restore
```bash
mongodump --uri="mongodb://host:27017/db" --out=./backup
mongorestore --uri="mongodb://host:27017/db" ./backup
mongodump --archive=db.archive --uri="mongodb://host:27017/db"
```

## Best Practices
- Use replica sets in production (never standalone)
- Choose shard key carefully for even data distribution
- Enable authorization (SCRAM or x.509)
- Keep working set in RAM for best performance
- Use `maxTimeMS()` to prevent slow queries
- Monitor with `mongostat` and `mongotop`
- Enable auditing for compliance
- Regular backups from a secondary node
