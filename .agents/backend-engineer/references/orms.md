# ORMs and Query Builders

## Prisma

### Core Concepts
- **Schema-first**: Define schema in `schema.prisma`
- **Type-safe**: Generated TypeScript client
- **Migrations**: Built-in migration system
- **Studio**: Visual database browser

### Key APIs
```typescript
// Find many
const users = await prisma.user.findMany({
  where: { email: { contains: 'test' } },
  include: { posts: true }
});

// Create
const user = await prisma.user.create({
  data: { email: 'test@example.com', name: 'Test' }
});

// Update
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Updated' }
});

// Delete
await prisma.user.delete({ where: { id: 1 } });
```

### Best Practices
- Use `include` for relations
- Implement proper error handling
- Use transactions for multi-step operations
- Use `select` to limit returned fields
- Use `skip` and `take` for pagination
- Use `orderBy` for sorting

---

## Drizzle ORM

### Core Concepts
- **SQL-like**: Write SQL-like queries
- **Type-safe**: Excellent TypeScript support
- **Lightweight**: Minimal runtime overhead
- **Multiple databases**: PostgreSQL, MySQL, SQLite

### Key APIs
```typescript
// Select
const users = await db.select().from(users).where(eq(users.email, 'test@example.com'));

// Insert
await db.insert(users).values({ email: 'test@example.com', name: 'Test' });

// Update
await db.update(users).set({ name: 'Updated' }).where(eq(users.id, 1));

// Delete
await db.delete(users).where(eq(users.id, 1));
```

### Best Practices
- Use `relations` for type-safe joins
- Implement proper indexing
- Use `batch` for multiple queries
- Use `with` for relational queries
- Use `returning` for insert/update results

---

## TypeORM

### Core Concepts
- **Decorator-based**: Entity decorators
- **Active Record**: Entity extends base class
- **Data Mapper**: Separate entity and repository
- **Migrations**: Built-in migration system

### Key APIs
```typescript
// Find
const users = await User.find({ where: { email: 'test@example.com' } });

// Create
const user = new User();
user.email = 'test@example.com';
await user.save();

// Update
await User.update({ id: 1 }, { name: 'Updated' });

// Delete
await User.delete({ id: 1 });
```

### Best Practices
- Use Data Mapper pattern for complex applications
- Implement proper indexing
- Use transactions for multi-step operations
- Use repositories for data access
- Use migrations for schema changes

---

## Sequelize

### Core Concepts
- **Promise-based**: Modern async/await support
- **Multiple databases**: PostgreSQL, MySQL, SQLite, MSSQL
- **Migrations**: Built-in migration system
- **Associations**: Model relationships

### Key APIs
```typescript
// Find
const users = await User.findAll({ where: { email: 'test@example.com' } });

// Create
const user = await User.create({ email: 'test@example.com', name: 'Test' });

// Update
await User.update({ name: 'Updated' }, { where: { id: 1 } });

// Delete
await User.destroy({ where: { id: 1 } });
```

### Best Practices
- Use `paranoid: true` for soft deletes
- Implement proper validation
- Use transactions for multi-step operations
- Use scopes for common queries
- Use hooks for business logic

---

## Mongoose (MongoDB)

### Core Concepts
- **Schema-based**: Define schemas for documents
- **Validation**: Built-in schema validation
- **Population**: Reference resolution
- **Middleware**: Pre/post hooks

### Key APIs
```typescript
// Find
const users = await User.find({ email: 'test@example.com' });

// Create
const user = await User.create({ email: 'test@example.com', name: 'Test' });

// Update
await User.findByIdAndUpdate(id, { name: 'Updated' });

// Delete
await User.findByIdAndDelete(id);
```

### Best Practices
- Use `lean()` for read-only queries
- Implement proper indexing
- Use `populate()` for references
- Use `select()` to limit fields
- Use `timestamps: true` for automatic timestamps
- Use middleware for business logic
