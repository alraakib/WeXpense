# Real-Time Data Processing

## Apache Kafka

### Core Concepts
- **Topic**: Named channel, logical log of records
- **Partition**: Ordered, immutable sequence; parallelism unit (1 partition = 1 consumer thread)
- **Offset**: Unique sequential ID per record within a partition
- **Producer**: Writes records to topic partitions (key → partition via hash)
- **Consumer**: Reads records from partitions, tracks offset
- **Consumer Group**: Load-balanced consumers — each partition assigned to one consumer

### Producer Configuration
```properties
# Idempotent delivery
enable.idempotence=true
acks=all
retries=2147483647
max.in.flight.requests.per.connection=5

# Compression
compression.type=snappy  # or lz4, zstd, gzip
batch.size=16384
linger.ms=5
```

### Consumer Configuration
```properties
# Offset management
enable.auto.commit=false
auto.offset.reset=earliest
isolation.level=read_committed  # for exactly-once

# Performance
fetch.min.bytes=1024
max.poll.records=500
max.partition.fetch.bytes=1048576  # 1MB
session.timeout.ms=45000
```

### Consumer Group Rebalancing
- **Eager rebalance** (default): All consumers stop, partitions reassigned globally
- **Cooperative rebalancing** (`partition.assignment.strategy=CooperativeStickyAssignor`): Incremental, only revoked partitions stop
- **Static group membership**: `group.instance.id` prevents rebalance on restart

---

## Kafka Connect
- **Source connector**: Reads from external system → writes to Kafka topic
- **Sink connector**: Reads from Kafka topic → writes to external system
- **Single Message Transform (SMT)**: Lightweight per-record transforms (rename, mask, filter, cast)
- **Converters**: AvroConverter, ProtobufConverter, JsonConverter, StringConverter
- **Distributed mode**: Cluster of workers, REST API for management, automatic rebalancing
- **Exactly-once sink**: Idempotent writes + transactional producer (Kafka 2.5+)

### Common Connectors
| Source | Sink |
|--------|------|
| Debezium (Postgres, MySQL, MongoDB, SQL Server) | JDBC Sink (Postgres, MySQL) |
| JDBC Source (polling-based) | S3 Sink (Parquet, Avro, JSON) |
| MQTT Source | Elasticsearch Sink |
| JMS Source | BigQuery Sink |
| file / spooldir | Snowflake Sink |

### Debezium CDC
```json
// Debezium Postgres connector config
{
    "name": "postgres-orders-connector",
    "config": {
        "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
        "database.hostname": "postgres.example.com",
        "database.port": "5432",
        "database.user": "debezium",
        "database.password": "secret",
        "database.dbname": "orders_db",
        "plugin.name": "pgoutput",
        "table.include.list": "public.orders",
        "slot.name": "debezium_orders",
        "snapshot.mode": "initial",
        "transforms": "unwrap",
        "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState",
        "key.converter": "org.apache.kafka.connect.json.JsonConverter",
        "value.converter": "org.apache.kafka.connect.json.JsonConverter"
    }
}
```

## Schema Registry
- Centralized schema store for Kafka — enforces schema compatibility
- **Avro**: Compact binary format, rich schema evolution, `.avsc` files
- **Protobuf**: Strongly typed, efficient, `.proto` files
- **JSON Schema**: Native JSON, `.json` files
- **Compatibility levels**: `BACKWARD` (can read old data with new schema), `FORWARD` (new data can be read by old consumers), `FULL`, `NONE`
- **Schema evolution rules**: Can add optional fields, remove deprecated fields (with default), cannot delete required fields
- **Wire format**: Magic byte (0) + 4-byte schema ID + serialized payload

```avro
{
    "type": "record",
    "name": "Order",
    "namespace": "com.example.orders",
    "fields": [
        {"name": "order_id", "type": "string"},
        {"name": "customer_id", "type": "string"},
        {"name": "amount", "type": "double"},
        {"name": "currency", "type": "string", "default": "USD"},
        {"name": "created_at", "type": {"type": "long", "logicalType": "timestamp-millis"}}
    ]
}
```

---

## Kafka Streams / ksqlDB

### Kafka Streams
```java
// Stateful stream processing
StreamsBuilder builder = new StreamsBuilder();

KStream<String, Order> orders = builder.stream("orders");

orders
    .filter((key, order) -> order.getStatus().equals("COMPLETED"))
    .groupBy((key, order) -> order.getCategory())
    .windowedBy(TimeWindows.of(Duration.ofMinutes(5)))
    .aggregate(
        () -> new CategoryRevenue(),
        (key, order, agg) -> agg.add(order.getAmount()),
        Materialized.with(Serdes.String(), new CategoryRevenueSerde())
    )
    .toStream()
    .to("category_revenue_5min");
```

- **State stores**: RocksDB-backed, changelog topics for fault tolerance
- **Exactly-once**: `processing.guarantee=exactly_once_v2`
- **Interactive queries**: Query state stores via REST API

### ksqlDB
```sql
-- Create stream from Kafka topic
CREATE STREAM orders (
    order_id STRING,
    customer_id STRING,
    amount DOUBLE,
    status STRING,
    created_at TIMESTAMP
) WITH (
    KAFKA_TOPIC = 'orders',
    VALUE_FORMAT = 'AVRO'
);

-- Continuous query
CREATE TABLE category_revenue AS
SELECT
    category,
    SUM(amount) AS total_revenue,
    COUNT(*) AS order_count
FROM orders
WINDOW TUMBLING (SIZE 5 MINUTES)
WHERE status = 'COMPLETED'
GROUP BY category
EMIT CHANGES;
```

---

## Apache Flink

### Streaming Jobs
- **DataStream API**: Low-level, event-by-event processing with operators
- **Table API / SQL**: Declarative, SQL-based stream processing, identical to batch
- **ProcessFunction**: Fine-grained control over timers, state, side outputs
- **Sources/Sinks**: Kafka, Kinesis, Pulsar, files, JDBC, Elasticsearch

### Windowing
- **Tumbling**: Fixed non-overlapping windows
- **Sliding**: Overlapping windows with fixed slide interval
- **Session**: Windows based on activity gaps (inactivity gap)
- **Global**: All events in a single window, custom trigger
- **Watermark strategy**: `forBoundedOutOfOrderness(Duration.ofSeconds(10))` — tolerance for late data

### State and Fault Tolerance
- **Managed state**: ValueState, ListState, MapState, ReducingState, AggregatingState
- **Checkpoints**: Full snapshots of state + source offsets, stored in DFS (S3/GCS)
- **Savepoints**: Manual, user-initiated checkpoints for version upgrades
- **Exactly-once**: `Semantic.EXACTLY_ONCE` checkpointing with Kafka source/sink
- **RocksDB state backend**: For large state (disk-based), heap for smaller state (faster)

```java
// Flink Kafka consumer with watermark and state
DataStream<Order> orders = env
    .addSource(new FlinkKafkaConsumer<>("orders", new AvroDeserializationSchema<>(Order.class), props))
    .assignTimestampsAndWatermarks(
        WatermarkStrategy
            .<Order>forBoundedOutOfOrderness(Duration.ofSeconds(5))
            .withTimestampAssigner((order, timestamp) -> order.getCreatedAt().getTime())
    );

orders
    .keyBy(Order::getCategory)
    .window(TumblingEventTimeWindows.of(Time.minutes(5)))
    .aggregate(new RevenueAggregator())
    .addSink(new FlinkKafkaProducer<>("category_revenue", new AvroSerializationSchema<>(CategoryRevenue.class), props));
```

## Streaming vs Batch Tradeoffs
| Dimension | Batch | Streaming |
|-----------|-------|-----------|
| Latency | Minutes to hours | Milliseconds to seconds |
| Throughput | Very high (bulk) | High (per-record overhead) |
| Data completeness | Guaranteed (retrospective) | Probabilistic (late data) |
| State management | Stateless (re-run) | Stateful (checkpointing) |
| Reprocessing | Trivial (rerun) | Complex (reset offsets, rewind) |
| Operational complexity | Low | High |
| Best for | Reports, historical analytics | Alerts, dashboards, ML features |

## Exactly-Once Semantics
- **At-most-once**: No retries, data may be lost (lowest overhead)
- **At-least-once**: Retries on failure, may cause duplicates (idempotent consumers needed)
- **Exactly-once**: Transactional writes across producer + consumer + sink
- **Kafka EOS**: Idempotent producer + transactional API (`transactional.id`)
- **Flink EOS**: Checkpointed state + transactionally aligned Kafka producer
- **Sink idempotency**: UPSERT/MERGE or dedup table for sink (practical exactly-once)
- **Downstream dedup**: Use event IDs, windowed dedup (Redis, state store)

## MirrorMaker (Cluster Replication)
- **MM2**: Active-passive cross-region replication
- **Topic config sync**: `replication.factor`, `min.insync.replicas` propagated
- **Consumer offset sync**: Maintains consumer group offsets in target cluster
- **Heartbeat topics**: `heartbeat.*` for cluster health monitoring
- **Config**: `mm2.properties` with source → target cluster mappings
- **Use cases**: Disaster recovery, migration, geo-located consumers
- **Alternative**: Confluent Cluster Linking (managed, simpler)
