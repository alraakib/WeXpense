# API Design Patterns & Technology Selection

## RESTful API Design

- **Resource Naming**: Plural nouns (`/users`, `/orders/{id}/line-items`), lowercase kebab-case, hierarchical relationships via path segments. Avoid verbs — use HTTP methods (GET, POST, PUT, PATCH, DELETE).
- **HATEOAS**: Include hypermedia links in responses so clients discover actions dynamically. Use `Link` header or `_links` block. Rarely fully implemented; often pragmatic to return links for key transitions.
- **Pagination**: Cursor-based for consistency (forward-only, handles inserts). Page/offset-based for simple UIs. Return `next`, `prev` cursors in response. Limit default page size to 20-100.
- **Filtering & Sorting**: Query params — `?status=active&role=admin` for filtering; `?sort=-created_at,name` (leading `-` for descending). Use `q` for full-text search.
- **Versioning**:
  - **URL** (`/v1/orders`): Simple, cache-friendly, but pollutes URLs.
  - **Header** (`Accept: application/vnd.api+json;version=2`): Cleaner, but requires client logic.
  - **Content negotiation** (`Accept: application/vnd.myapp.v2+json`): Flexible, supports media-type-specific versions.

```json
// Paginated response
{ "data": [...], "meta": { "cursor": "eyJpZCI6MTB9" }, "links": { "next": "/orders?cursor=eyJpZCI6MTB9" } }
```

---

## GraphQL

- **Schema Design**: Define types, queries, mutations, subscriptions in SDL (Schema Definition Language). Build a schema-first approach — the schema is the contract. Use interfaces, unions, enums for expressiveness.
- **Resolvers**: Functions that fetch data for each field. Each resolver receives `(parent, args, context, info)`. Use DataLoader to batch and cache DB queries per request lifecycle.
- **N+1 Problem**: Multiple queries to DB for related resources. Solved by DataLoader (batches keys, returns promise). Also solvable with look-ahead parsing, join-monster, or Prisma.
- **Federation**: Apollo Federation or GraphQL Mesh. Split monolithic schema into subgraphs. Each subgraph defines entities `@key` and `@extends`. Gateway composes the federated schema.
- **Subscriptions**: Real-time over WebSocket. Define `subscribe` function returning an `AsyncIterator`. Use Redis or MQ-based pub/sub for horizontal scaling.

```graphql
type Query { orders(status: OrderStatus): [Order!]! }
type Order @key(fields: "id") {
  id: ID!
  total: Money!
  lineItems: [LineItem!]!
}
```

---

## gRPC

- **Protocol Buffers**: Define service contracts in `.proto` files. Generate client/server stubs for multiple languages. Strong typing, backward-compatible via field numbers.
- **Streaming Types**: Unary (request → response), Server-streaming (request → stream), Client-streaming (stream → response), Bidirectional (stream ↔ stream).
- **Interceptors**: Middleware for cross-cutting concerns (auth, logging, rate limiting). Applied per-service or per-call. Analogous to Express middleware or HTTP filters.
- **Best Practices**: Use `google.protobuf.Timestamp`/`Duration`. Set max message size (default 4MB). Enable gzip compression. Use health checking protocol (`grpc.health.v1.Health`).

```protobuf
service OrderService {
  rpc PlaceOrder (PlaceOrderRequest) returns (Order);
  rpc StreamOrders (OrderFilter) returns (stream Order);
}
```

---

## WebSocket

- **Handshake**: HTTP upgrade request (`101 Switching Protocols`). Server validates `Sec-WebSocket-Key`, responds with `Sec-WebSocket-Accept`. Binary or text frames.
- **Message Framing**: Data split into frames (opcode, payload length, mask). Control frames for close/ping/pong. Keep-alive with periodic pings.
- **Reconnection Strategies**: Exponential backoff with jitter (`min 1s, max 30s`). Track sequence/last event ID for replay. Buffer messages during reconnect. Use libraries (Socket.IO, SockJS) for automatic fallback.

---

## API Documentation

- **OpenAPI/Swagger**: `openapi.json` or YAML. Tools: Swagger UI (interactive docs), Stoplight, Redoc. Use `@nestjs/swagger`, `@fastify/swagger`, or `drf-spectacular` for auto-generation.
- **GraphQL Introspection**: Query `__schema` for types, fields, directives. Tools: GraphiQL, Apollo Studio, GraphQL Voyager for schema visualization.
- **protoc-gen-doc**: Generate HTML/Markdown/JSON docs from `.proto` files. Integrate into CI. Output per-package or per-service.

---

## Technology Selection Methodology

- **RFC Process**: Propose a technical decision as a written document. Template: Problem, Proposed Solution, Alternatives, Trade-offs, Decision. Open for comment period (3-5 days). Final decision documented as an ADR.
- **ADR Template** (Architecture Decision Record):
  ```
  # ADR-NNN: Title
  - Status: [Proposed | Accepted | Superseded]
  - Context: Why this decision is needed
  - Decision: What was decided
  - Consequences: Trade-offs and impact
  ```
- **Scoring Matrix**: Weighted criteria (performance, scalability, team familiarity, licensing, ecosystem). Score each candidate per criterion. E.g., 5 criteria, 0-5 scale, multiply by weight, sum. Back decisions with data.

| Criterion       | Weight | Kafka | Pulsar |
|-----------------|--------|-------|--------|
| Throughput      | 0.4    | 5     | 5      |
| Operational Simp| 0.25   | 4     | 3      |
| Geo-replication | 0.2    | 3     | 5      |
| Team Expertise  | 0.15   | 4     | 2      |
| **Score**       | 1.0    | 4.2   | 3.8    |

---

## Migration Strategies

- **Strangler Fig**: Incrementally replace parts of a monolith. Route traffic fragment by fragment. Proxy (e.g., Nginx, API Gateway) splits requests between old and new. Lowest risk, longest timeline.
- **Parallel Run**: Run old and new systems simultaneously. Compare outputs. Route mirror traffic. Validate correctness before switching. Requires both systems to be operational during migration.
- **Big Bang**: Cut over entirely at a point in time (feature flag flip or deploy). Fastest, highest risk. Use when integration surface is small and rollback plan is solid. Always have a rollback button.
- **Hybrid**: Strangler for core flows, parallel run for data consistency checks, big bang for leaf services with no external dependency.
