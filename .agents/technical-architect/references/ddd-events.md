# Domain-Driven Design & Event-Driven Architecture

## DDD Strategic Design

- **Bounded Context**: Explicit boundary around a domain model; defines where terms have specific meaning. Each context has its own ubiquitous language and internal model. Contexts communicate via context maps.
- **Ubiquitous Language**: Shared vocabulary between domain experts and developers embedded in code, tests, and conversations. Never translate between business and technical terms.
- **Context Map**: Relationships between bounded contexts — partnership, shared kernel, customer-supplier, conformist, anticorruption layer, open host service, published language, separate ways, big ball of mud.
- **Subdomains**: Core (competitive advantage), supporting (custom but not core), generic (off-the-shelf). Allocate bounded contexts strategically.

---

## DDD Tactical Patterns

- **Entity**: Object with a unique identity (ID) that persists across state changes. Use `===` / `equals()` semantics. Mutable.
- **Value Object**: Immutable object defined by its attributes (e.g., `Money`, `Address`, `Email`). No identity. Replace rather than modify.
- **Aggregate**: Cluster of entities/value objects treated as a unit. One aggregate root (e.g., `Order` owns `OrderLine`). Root is the only entry point; external references hold the root's ID only.
- **Aggregate Design Rules**:
  - Keep aggregates small — design for consistency boundaries, not data containers
  - Reference other aggregates by ID only
  - One transaction = one aggregate modification
- **Domain Event**: Something meaningful that happened in the domain (past-tense, e.g., `OrderPlaced`). Published after the aggregate is mutated. Triggers side effects.
- **Repository**: Collection-like interface for retrieving/persisting aggregates. One per aggregate root. Hide storage details.
- **Domain Service**: Stateless operation that doesn't naturally fit on an entity/value object. Operates on multiple aggregates.

```typescript
// Aggregate root example
class Order {
  constructor(readonly id: OrderId, readonly lines: OrderLine[]) {}
  addLine(product: ProductId, qty: number): void { /* validate, append, raise domain event */ }
  submit(): void { this.events.push(new OrderSubmittedEvent(this.id)); }
}
```

---

## Event-Driven Architecture

- **Event Sourcing**: Persist all state changes as an append-only event stream. Current state = fold of all past events. Enables audit trail, temporal queries, event rebuilding.
- **CQRS** (Command Query Responsibility Segregation): Separate write model (commands) from read model (queries). Write side uses domain model + event sourcing; read side uses denormalized projections. Scales read/write independently.
- **Event Storming**: Workshop technique (large wall, sticky notes) to discover domain events (orange), commands (blue), aggregates (yellow), policies (purple), external systems (pink). Flow: chaos → events timeline → aggregates → bounded contexts.

---

## Message Brokers

- **Apache Kafka**: Durable log-based broker. Best for event streaming, replay, high throughput. Partition-based ordering. Consumer groups for scale. At-least-once by default; exactly-once with idempotent producer + transactional API.
- **RabbitMQ**: AMQP-based. Best for task queues, RPC, routing flexibility (exchanges: direct, topic, fanout, headers). Push-based delivery. Lower throughput than Kafka.
- **NATS**: Lightweight, high-performance pub/sub. At-most-once by default (JetStream adds persistence). Good for edge, IoT, cloud-native.
- **Apache Pulsar**: Separated compute/storage (BookKeeper). Supports both queuing (exclusive) and streaming (shared). Geo-replication native. Tiered storage to S3/GCS.

---

## Event Schema Management

- **Avro**: Compact binary format, schema evolution (forward/backward compatibility), Schema Registry for validation. Used heavily in Kafka ecosystem.
- **Protobuf**: Strong typing, code generation, efficient serialization. Schema defined in `.proto` files. `protoc` compiler. Well-suited for gRPC + eventing.
- **JSON Schema**: Human-readable, no compilation step. Heavier wire format. Good for HTTP APIs, low-throughput events.
- **Schema Registry** (Confluent / Apicurio / Karapace): Stores schemas by subject (`<topic>-value`, `<topic>-key`). Enforces compatibility (BACKWARD, FORWARD, FULL, NONE). Client serializes with schema ID in wire format.

---

## Saga Patterns

- **Choreography**: Each service publishes events; other services react. No central coordinator. Tight coupling to event schema. Harder to trace flows.
- **Orchestration**: Central orchestrator (saga execution coordinator) tells each service what to do, publishes compensating actions on failure. More control, single point of coordination.
- **Compensation**: Each step defines a compensating action (e.g., `OrderConfirmed` → `OrderCancelled`). Sagas must be idempotent.

---

## Eventual Consistency & Outbox Pattern

- **Eventual Consistency**: After a write, different read models may be stale for a bounded window. Acceptable for non-critical reads. Use with optimistic concurrency.
- **Outbox Pattern**: Write domain event to an "outbox" table in the same DB transaction as the aggregate. A separate process (polling or CDC log-tail) publishes to the broker. Guarantees at-least-once delivery without 2PC.

```sql
BEGIN TRANSACTION;
  INSERT INTO orders (id, ...) VALUES (...);
  INSERT INTO outbox (event_type, payload, created_at) VALUES ('OrderPlaced', '...', NOW());
COMMIT;
-- Background worker:
SELECT * FROM outbox ORDER BY id LIMIT 100;
-- Publish each to Kafka/RabbitMQ, then DELETE.
```
