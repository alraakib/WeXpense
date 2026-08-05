# API Design Patterns

## REST API

### URL Design
- Use nouns, not verbs
- Use plural for collections
- Use nested resources for relationships

```
GET    /api/users          # List users
POST   /api/users          # Create user
GET    /api/users/:id      # Get user
PUT    /api/users/:id      # Update user
DELETE /api/users/:id      # Delete user

GET    /api/users/:id/posts # List user's posts
POST   /api/users/:id/posts # Create user's post
```

### Response Format
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Pagination
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## GraphQL

### Schema Definition
```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Query {
  users: [User!]!
  user(id: ID!): User
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}

input CreateUserInput {
  name: String!
  email: String!
}
```

### Resolver
```typescript
const resolvers = {
  Query: {
    users: () => db.user.findMany(),
    user: (_, { id }) => db.user.findUnique({ where: { id } })
  },
  Mutation: {
    createUser: (_, { input }) => db.user.create({ data: input }),
    updateUser: (_, { id, input }) => db.user.update({ where: { id }, data: input }),
    deleteUser: (_, { id }) => db.user.delete({ where: { id } })
  },
  User: {
    posts: (user) => db.post.findMany({ where: { authorId: user.id } })
  }
};
```

## tRPC

### Router Definition
```typescript
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

const appRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.user.findUnique({ where: { id: input.id } });
    }),
  
  createUser: t.procedure
    .input(z.object({
      name: z.string(),
      email: z.string().email()
    }))
    .mutation(async ({ input }) => {
      return db.user.create({ data: input });
    })
});

export type AppRouter = typeof appRouter;
```

## API Versioning

### URL Versioning
```
/api/v1/users
/api/v2/users
```

### Header Versioning
```
Accept: application/vnd.api.v1+json
```

### Query Parameter Versioning
```
/api/users?version=1
```

## Best Practices

- Use consistent naming conventions
- Implement proper error handling
- Use versioning for breaking changes
- Document your API (OpenAPI/Swagger)
- Use rate limiting
- Implement authentication/authorization
- Use caching where appropriate
- Monitor API usage and performance
