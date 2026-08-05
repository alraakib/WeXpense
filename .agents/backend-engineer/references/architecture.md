# Architecture Patterns

## Monolith Architecture

### Single Process
- All code in one process
- Shared memory
- Simple deployment
- Easy debugging

### Structure
```
src/
├── controllers/        # Request handlers
├── services/          # Business logic
├── repositories/      # Data access
├── models/            # Data models
├── middleware/         # Request middleware
├── routes/            # Route definitions
├── utils/             # Utilities
├── config/            # Configuration
├── types/             # TypeScript types
└── index.ts           # Entry point
```

### Best Practices
- Use controller-service-repository pattern
- Separate concerns clearly
- Use dependency injection
- Implement proper error handling
- Use middleware for cross-cutting concerns

---

## Microservices Architecture

### Service Decomposition
- **API Gateway**: Single entry point
- **Auth Service**: Authentication/authorization
- **User Service**: User management
- **Order Service**: Order processing
- **Payment Service**: Payment processing
- **Notification Service**: Email/SMS/push

### Communication Patterns
- **Synchronous**: HTTP/gRPC
- **Asynchronous**: Message queues (RabbitMQ, Kafka, Redis)

### Service Structure
```
services/
├── api-gateway/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── auth-service/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── user-service/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
└── shared/
    ├── types/
    └── utils/
```

### Best Practices
- Use API Gateway pattern
- Implement circuit breakers
- Use message queues for async communication
- Implement service discovery
- Use distributed tracing
- Implement health checks
- Use container orchestration (Kubernetes)

---

## Monorepo Architecture

### Tools
- **Turborepo**: Build system
- **Nx**: Build system
- **Lerna**: Package management
- **pnpm workspaces**: Package management

### Structure
```
├── package.json        # Root config
├── turbo.json         # Turborepo config
├── packages/
│   ├── shared/        # Shared utilities
│   ├── ui/            # UI components
│   ├── config/        # Shared config
│   └── app/           # Main application
├── apps/
│   ├── web/           # Web app
│   └── api/           # API server
└── tsconfig.json      # Root TypeScript config
```

### Best Practices
- Use `workspace:*` for local dependencies
- Use catalogs for shared versions
- Use `--filter` for selective operations
- Implement proper dependency management
- Use shared configurations

---

## Controller-Service-Repository Pattern

### Controller Layer
- Handles HTTP requests
- Validates input
- Calls service layer
- Returns response

### Service Layer
- Contains business logic
- Orchestrates repository calls
- Handles transactions
- Returns data

### Repository Layer
- Data access logic
- Database queries
- ORM operations
- Returns data

### Example
```typescript
// Controller
class UserController {
  constructor(private userService: UserService) {}
  
  async getUser(req: Request, res: Response) {
    const user = await this.userService.getUser(req.params.id);
    res.json(user);
  }
}

// Service
class UserService {
  constructor(private userRepo: UserRepository) {}
  
  async getUser(id: number) {
    return this.userRepo.findById(id);
  }
}

// Repository
class UserRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

---

## CQRS (Command Query Responsibility Segregation)

### Commands
- Write operations
- Side effects
- State changes

### Queries
- Read operations
- No side effects
- Return data

### Benefits
- Optimized read/write models
- Better scalability
- Clear separation of concerns

### Implementation
```typescript
// Command
class CreateUserCommand {
  constructor(
    private userRepo: UserRepository,
    private eventBus: EventBus
  ) {}
  
  async execute(data: CreateUserDto) {
    const user = await this.userRepo.create(data);
    await this.eventBus.publish(new UserCreatedEvent(user));
    return user;
  }
}

// Query
class GetUserQuery {
  constructor(private userReadRepo: UserReadRepository) {}
  
  async execute(id: number) {
    return this.userReadRepo.findById(id);
  }
}
```

---

## Event-Driven Architecture

### Patterns
- **Event Sourcing**: Store events, not state
- **CQRS**: Separate read/write models
- **Saga**: Distributed transactions
- **Pub/Sub**: Publish-subscribe messaging

### Message Queues
- **RabbitMQ**: AMQP protocol
- **Kafka**: Distributed event streaming
- **Redis Pub/Sub**: Simple messaging
- **Bull/BullMQ**: Redis-based queues

### Benefits
- Loose coupling
- Async processing
- Event replay
- Scalability

### Best Practices
- Use idempotent handlers
- Implement dead letter queues
- Use event versioning
- Implement proper error handling
- Use distributed tracing
