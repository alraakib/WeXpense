# System Architecture Patterns Reference

## Monolithic Architecture

### Layered Monolith
```
Presentation  →  Application  →  Domain  →  Infrastructure
    (API)         (Services)      (Models)     (DB, External)
```
- **Pros**: Simple, fast development, easy debugging, single deployment
- **Cons**: Scaling bottlenecks, team coupling, technology lock-in
- **Best For**: Small teams, early-stage products, simple domains
- **Folders**: controllers/ → services/ → repositories/ → models/

### Modular Monolith
```
┌─────────────────────────────────┐
│  API Gateway                    │
├─────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ User │ │Order │ │Payment│   │
│  │Module│ │Module│ │Module │   │
│  └──────┘ └──────┘ └──────┘   │
├─────────────────────────────────┤
│  Shared Infrastructure          │
└─────────────────────────────────┘
```
- **Pros**: Domain boundaries without network overhead, future service extraction
- **Cons**: Module isolation is discipline-dependent
- **Best For**: Growing teams, clear domain boundaries

## Microservices Architecture

### Characteristics
- **Domain-Driven**: Services aligned to bounded contexts
- **Independent**: Deploy, scale, and evolve independently
- **Decentralized**: Each service owns its data store
- **Resilient**: Failure isolation, bulkhead pattern
- **Communication**: Sync (HTTP/gRPC), Async (message queues/events)

### Service Decomposition
```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│  Auth   │  │  User   │  │  Order  │  │Payment  │
│ Service │  │ Service │  │ Service │  │ Service │
└────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
     │            │            │            │
     └────────────┴─────┬──────┴────────────┘
                        │
                 ┌──────┴──────┐
                 │  API Gateway │
                 └──────┬──────┘
                        │
                   [Clients]
```

### Anti-Patterns
- Distributed monolith (services call each other synchronously)
- Shared database between services
- Too fine-grained (nanoservices)
- Inconsistent domain boundaries

### API Gateway Pattern
- **Single Entry Point**: Route requests to appropriate services
- **Cross-cutting**: Authentication, rate limiting, logging, caching
- **Protocol Translation**: HTTP to gRPC
- **Response Aggregation**: Combine multiple service responses
- **Tools**: Kong, APISIX, Envoy, AWS API Gateway, Zuul

## Event-Driven Architecture

### Core Concepts
- **Events**: Immutable records of something that happened
- **Event Bus**: Pub/sub message broker (Kafka, RabbitMQ, Redis Streams)
- **Event Sourcing**: Store state as sequence of events
- **CQRS**: Separate read and write models
- **Saga Pattern**: Distributed transaction coordination

### Event Types
- **Domain Event**: Something significant in the domain (OrderPlaced)
- **Integration Event**: Cross-service notification (UserCreated)
- **Snapshot**: Current state derived from event stream

### Message Broker Comparison
| Feature | Kafka | RabbitMQ | Redis Streams |
|---------|-------|----------|---------------|
| Ordering | Per partition | Per queue | Per stream |
| Retention | Configurable | Ack-delete | Configurable |
| Throughput | 10M+/sec | 100K+/sec | 1M+/sec |
| Consumer Groups | Yes | Yes | Yes |
| At-least-once | Yes | Yes | Yes |
| Best For | Event sourcing, streams | Task queues, RPC | Real-time, caching |

### Saga Pattern (Choreography)
```yaml
OrderPlaced → InventoryReserved → PaymentProcessed → OrderConfirmed
                  ↓ (failure)          ↓ (failure)
           InventoryRelease    PaymentRefund
```

### Saga Pattern (Orchestration)
- Orchestrator service coordinates saga steps
- Each step returns success/failure
- Orchestrator executes compensating transactions on failure
- Tools: Temporal, Camunda, AWS Step Functions

## Hexagonal (Ports & Adapters) Architecture
```
              [Controllers/API]
                      |
    ┌─────────────────┴─────────────────┐
    │           Application              │
    │  ┌─────────────────────────────┐  │
    │  │         Domain              │  │
    │  │  (Entities, Services,       │  │
    │  │   Port Interfaces)          │  │
    │  └───────────┬─────────────────┘  │
    │              │                    │
    └──────────────┼────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │    Inbound   │   Outbound   │
    │    Adapters  │   Adapters   │
    │  (HTTP, CLI) │  (DB, Queue) │
    └──────────────┴──────────────┘
```
- Core domain has no external dependencies
- All I/O goes through ports (interfaces) and adapters (implementations)
- Highly testable: swap adapters for tests (in-memory DB, mock API)
