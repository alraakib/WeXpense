# Validation Libraries

## Zod

### Core Concepts
- TypeScript-first schema validation
- Static type inference
- Zero dependencies
- JSON Schema support

### Basic Usage
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.enum(['user', 'admin'])
});

type User = z.infer<typeof UserSchema>;

// Validate
const result = UserSchema.safeParse(data);
if (result.success) {
  const user = result.data;
} else {
  console.error(result.error);
}
```

### Advanced Features
```typescript
// Transform
const schema = z.string().transform(val => val.toUpperCase());

// Refine
const schema = z.object({
  password: z.string(),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword);

// Discriminated Union
const schema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), content: z.string() }),
  z.object({ type: z.literal('image'), url: z.string().url() })
]);
```

### Integration with Frameworks
- **Express**: `express-zod-validator`
- **Fastify**: Built-in JSON Schema (compatible)
- **Hono**: `zod-validator`

---

## Joi

### Core Concepts
- Schema validation
- Chainable API
- Rich validation rules

### Basic Usage
```typescript
import Joi from 'joi';

const schema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().positive()
});

const { error, value } = schema.validate(data);
```

---

## class-validator

### Core Concepts
- Decorator-based validation
- Works with class-validator
- Integration with class-transformer

### Basic Usage
```typescript
import { IsString, IsEmail, IsOptional, validate } from 'class-validator';

class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  age?: number;
}

const dto = new CreateUserDto();
const errors = await validate(dto);
```

---

## Valibot

### Core Concepts
- Similar to Zod
- Smaller bundle size
- TypeScript-first

### Basic Usage
```typescript
import * as v from 'valibot';

const UserSchema = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  age: v.optional(v.number())
});
```

---

## Best Practices

- Validate all input on server side
- Use TypeScript for type safety
- Use allowlists over blocklists
- Validate at API boundaries
- Use middleware for automatic validation
- Return meaningful error messages
- Log validation failures
