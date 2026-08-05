# Technology Decision & Integration Reference

## Decision Framework

### Template
```markdown
# Decision: [Title]

## Context
What problem are we solving? What are the constraints?

## Options
| Option | Pros | Cons | Cost |
|--------|------|------|------|
| Option A | ... | ... | ... |
| Option B | ... | ... | ... |

## Decision
Chosen: Option A

## Rationale
Why this option over others (explicit trade-offs).

## Consequences
What this means for the team and system going forward.
```

### Evaluation Criteria
- **Team Expertise** — Can the team learn it quickly?
- **Ecosystem** — Community size, package quality, documentation
- **Performance** — Benchmarks for our use case
- **Operations** — Deployment, monitoring, debugging
- **Security** — Track record, CVE response
- **Cost** — License, infrastructure, migration
- **Future-proofing** — Direction, maintenance, alternatives

## Integration Patterns

### Synchronous (HTTP/gRPC)
```
Client → Request → Service → Response → Client
```
- **Pros**: Simple, request-reply semantics, easy debugging
- **Cons**: Coupling, latency chain, partial failure handling
- **Best for**: Queries, CRUD operations, simple operations

### Asynchronous (Message Queue)
```
Client → Event → Broker → Consumer
```
- **Pros**: Loose coupling, load leveling, buffering, retry
- **Cons**: Eventual consistency, debugging complexity
- **Best for**: Notifications, workflows, data sync

### Webhook / Callback
```
Service A → POST → Service B (/webhook)
```
- **Pros**: Real-time, push-based, no polling needed
- **Cons**: Reliability (retry logic needed), security (verify sender)
- **Best for**: External service notifications

## API Design Standards

### RESTful API
- Resource-oriented URLs: `/api/v1/users`, `/api/v1/orders`
- HTTP methods: GET (read), POST (create), PUT/PATCH (update), DELETE
- Status codes: 200/201/204 (success), 400/401/403/404 (client error), 500/502/503 (server error)
- Pagination: `?page=1&limit=20` + Link headers or cursor-based
- Versioning: URL prefix `/v1/` or Accept header
- Error format: `{ error: { code, message, details } }`

### gRPC
- Protocol Buffers for IDL and serialization
- HTTP/2 transport with multiplexing
- Streaming: Unary, Server-streaming, Client-streaming, Bidirectional
- Service definitions: `.proto` files

### GraphQL
- Single endpoint `/graphql`
- Query: `{ users { id name email } }`
- Mutation: `mutation { createUser(input: { ... }) { id } }`
- Subscription: WebSocket-based real-time updates
- Tools: Apollo, Relay, GraphQL Yoga

## Domain-Driven Design (DDD)

### Strategic Design
- **Bounded Context**: Explicit boundaries around a domain model
- **Ubiquitous Language**: Shared language between devs and domain experts
- **Context Map**: Relationships between contexts (partner/supplier/shared kernel)
- **Anti-Corruption Layer**: Translate between bounded contexts

### Tactical Patterns
- **Entity**: Object with identity (User(id), Order(id))
- **Value Object**: Immutable, equality by value (Address, Money)
- **Aggregate**: Cluster of entities with consistency boundary (Order + LineItems)
- **Repository**: Collection-like interface for aggregates
- **Domain Service**: Stateless operations that don't fit entity/value
- **Domain Event**: Something that happened in the domain
- **Factory**: Create complex aggregates

### Example Folder Structure
```
src/
├── user/
│   ├── domain/
│   │   ├── User.ts          # Entity
│   │   ├── Email.ts         # Value Object
│   │   ├── IUserRepo.ts     # Repository Interface
│   │   └── UserService.ts   # Domain Service
│   ├── application/
│   │   ├── CreateUser.ts    # Use Case / Application Service
│   │   └── DTOs/
│   ├── infrastructure/
│   │   ├── UserRepo.ts      # Repository Implementation
│   │   └── UserController.ts/ts
│   └── index.ts
└── shared/
    ├── kernel/
    └── event-bus/
```

## ADRs (Architecture Decision Records)

### Template
```markdown
# ADR-NNN: Title

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[Problem description, constraints, options considered]

## Decision
[What was decided]

## Consequences
[Trade-offs, impacts, migration notes]
```

### When to Write ADRs
- Technology choices (framework, database, queue)
- Architecture changes (monolith → microservices)
- API design decisions (REST vs GraphQL)
- Data model decisions (relational vs document)
- Deployment strategy changes
