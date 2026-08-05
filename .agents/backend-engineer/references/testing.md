# Testing

## Unit Testing

### Jest
- Most popular testing framework
- Built-in assertions, mocking, coverage
- TypeScript support via `ts-jest`

```typescript
// Example
describe('UserService', () => {
  it('should create a user', async () => {
    const user = await userService.create({ email: 'test@example.com' });
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

### Vitest
- Vite-native testing
- Fast, modern
- Compatible with Jest API

```typescript
// Example
describe('UserService', () => {
  it('should create a user', async () => {
    const user = await userService.create({ email: 'test@example.com' });
    expect(user).toBeDefined();
  });
});
```

## Integration Testing

### Supertest
- HTTP assertion library
- Works with Express, Koa, etc.

```typescript
import request from 'supertest';
import app from '../app';

describe('POST /api/users', () => {
  it('should create a user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test' })
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
  });
});
```

## E2E Testing

### Playwright
- Cross-browser testing
- Modern, fast

### Cypress
- Easy to write
- Great debugging tools

## Best Practices

### Test Structure
- Use AAA pattern: Arrange, Act, Assert
- One assertion per test
- Use descriptive test names
- Mock external dependencies
- Use test data factories

### Coverage
- Aim for 80%+ coverage
- Focus on critical paths
- Don't chase 100% coverage

### Mocking
- Mock external services
- Mock database calls
- Use dependency injection

### Database Testing
- Use test databases
- Clean up after tests
- Use transactions for isolation
- Use factories for test data
