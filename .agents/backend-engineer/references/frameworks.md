# HTTP Frameworks

## Express.js (Node.js)

### Core Concepts
- **Middleware-based**: Request/response pipeline
- **Routing**: File-system like routing
- **Template engines**: Pug, EJS, Handlebars
- **Static files**: Built-in static file serving

### Key APIs
- `express()`: Application factory
- `app.get()`, `app.post()`, etc.: Route handlers
- `app.use()`: Middleware registration
- `express.Router()`: Route modularization
- `req.params`, `req.query`, `req.body`: Request data
- `res.json()`, `res.send()`, `res.status()`: Response methods

### Middleware
- `express.json()`: JSON body parser
- `express.urlencoded()`: URL-encoded parser
- `express.static()`: Static file serving
- Third-party: `cors`, `helmet`, `morgan`, `multer`

### Best Practices
- Use `express.json()` with size limits
- Implement centralized error handling middleware
- Use `helmet` for security headers
- Use `cors` for cross-origin requests
- Use `morgan` for request logging
- Structure routes with `express.Router()`
- Validate input with `joi` or `zod`

---

## Hono (Multi-runtime)

### Core Concepts
- **Ultrafast**: Optimized for edge computing
- **Multi-runtime**: Works on Node.js, Bun, Deno, Cloudflare Workers, etc.
- **Web Standard APIs**: Uses standard Request/Response
- **TypeScript-first**: Excellent type safety

### Key APIs
- `new Hono()`: Application instance
- `app.get()`, `app.post()`: Route handlers
- `c.req.param()`, `c.req.query()`: Request data
- `c.json()`, `c.text()`, `c.html()`: Response helpers
- `c.header()`: Header manipulation

### Middleware
- `basicAuth()`: Basic authentication
- `jwt()`: JWT authentication
- `cors()`: CORS middleware
- `logger()`: Request logging
- `pretty()`: Pretty printing

### Best Practices
- Use Hono for multi-runtime applications
- Leverage built-in middleware
- Use `c.env` for environment variables
- Implement proper error handling
- Use adapters for platform-specific features

---

## Elysia (Bun-optimized)

### Core Concepts
- **Bun-optimized**: Native Bun performance
- **TypeScript-first**: Excellent type inference
- **Plugin system**: Modular architecture
- **Eden Treaty**: End-to-end type safety

### Key APIs
- `new Elysia()`: Application instance
- `.get()`, `.post()`: Route handlers
- `new Elysia().guard()`: Route validation
- `.derive()`: Context derivation
- `.macro()`: Custom macros

### Plugins
- `@elysiajs/jwt`: JWT authentication
- `@elysiajs/cors`: CORS
- `@elysiajs/swagger`: OpenAPI documentation
- `@elysiajs/cron`: Scheduled tasks

### Best Practices
- Use Elysia for Bun-native applications
- Leverage Eden Treaty for type-safe APIs
- Use `guard()` for request validation
- Implement proper plugin architecture
- Use `derive()` for shared context

---

## Fastify (Node.js/Bun)

### Core Concepts
- **High performance**: JSON Schema validation
- **Plugin architecture**: Encapsulated plugins
- **Schema-based**: Request/response serialization
- **TypeScript support**: Excellent type inference

### Key APIs
- `fastify()`: Application instance
- `.get()`, `.post()`: Route handlers
- `.register()`: Plugin registration
- `.decorate()`: Extend instance
- `.addHook()`: Lifecycle hooks
- `.inject()`: Testing utility

### Plugins
- `@fastify/cors`: CORS
- `@fastify/helmet`: Security headers
- `@fastify/rate-limit`: Rate limiting
- `@fastify/swagger`: OpenAPI documentation
- `@fastify/mongodb`: MongoDB integration

### Best Practices
- Use JSON Schema for validation
- Leverage plugin encapsulation
- Use `fastify-plugin` for shared decorators
- Implement proper error handling
- Use `inject()` for testing
- Configure `trustProxy` for reverse proxies

---

## NestJS (Node.js)

### Core Concepts
- **Enterprise-grade**: Angular-inspired architecture
- **TypeScript-first**: Strong typing throughout
- **Modular**: Organized module system
- **Dependency injection**: Built-in DI container

### Key APIs
- `@Controller()`: Route handlers
- `@Injectable()`: Services
- `@Module()`: Module organization
- `@Get()`, `@Post()`: Route decorators
- `@Body()`, `@Param()`, `@Query()`: Parameter decorators
- `@UseGuards()`: Authentication guards

### Features
- Guards: Authentication/authorization
- Interceptors: Request/response transformation
- Pipes: Input validation
- Filters: Exception handling
- Guards: Route protection

### Best Practices
- Use modules for organization
- Implement proper dependency injection
- Use guards for authentication
- Use pipes for validation
- Use interceptors for logging
- Implement proper exception filters

---

## Koa (Node.js)

### Core Concepts
- **Lightweight**: Minimalist framework
- **Middleware**: Async function middleware
- **Context**: Request/response abstraction
- **Cascading**: True middleware composition

### Key APIs
- `new Koa()`: Application instance
- `app.use()`: Middleware registration
- `ctx`: Context object
- `ctx.body`: Response body
- `ctx.status`: Response status
- `ctx.request`, `ctx.response`: Raw objects

### Best Practices
- Use Koa for lightweight applications
- Leverage async/await middleware
- Use `ctx.state` for passing data
- Implement proper error handling
- Use middleware for cross-cutting concerns

---

## AdonisJS (Node.js)

### Core Concepts
- **Full-stack**: MVC framework
- **TypeScript-first**: Strong typing
- **IoC container**: Dependency injection
- **Lucid ORM**: Built-in ORM

### Key APIs
- `router.get()`, `router.post()`: Route handlers
- `HttpContext`: Request/response context
- `@adonisjs/lucid`: ORM
- `@adonisjs/auth`: Authentication

### Best Practices
- Use AdonisJS for full-stack applications
- Leverage IoC container for DI
- Use Lucid ORM for database operations
- Implement proper authentication
- Use middleware for cross-cutting concerns
