# Test Data Management & CI Integration Reference

## Test Data Management

### Approaches
- **Fresh per test**: Create data in setup, clean up in teardown
- **Seeded database**: Pre-populated database with known state
- **Fixture files**: JSON/YAML files loaded per test
- **Factories**: Object factories with traits (FactoryBoy, Faker)
- **In-memory DB**: SQLite/H2 for fast tests
- **Testcontainers**: Full database in Docker container

### Factories Example
```typescript
// TypeScript
export const buildUser = (overrides: Partial<User> = {}): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role: 'user',
  created_at: new Date(),
  ...overrides,
});

// In test:
const user = buildUser({ role: 'admin' });
```

### Faker Libraries
- **JS**: @faker-js/faker
- **Python**: Faker
- **Java/Go/Ruby**: Java Faker, gofake, Faker

### Test Isolation
- Clean database state between tests
- Don't share mutable state between tests
- Use transactions + rollback for DB tests
- Mock time-dependent functionality (Date.now, Math.random)
- Reset mocks between tests (clearAllMocks in Jest)

## CI Integration

### GitHub Actions Test Workflow
```yaml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit -- --coverage
      - run: npm run test:integration
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
```

### Test Parallelization
- **Per file/class**: Each test file runs in separate worker
- **Sharding**: Split tests across CI job matrix
- **Jest/Vitest**: `--maxWorkers` or `--shard`
- **Playwright**: `--workers 4` or sharding per spec

### Test Caching
- Cache node_modules (CI dependency caching)
- Cache compiled output (TypeScript, Java, Go)
- Cache container images (Docker layer caching)
- Cache test results (Nx, Bazel, Turborepo)

### Quality Gates in CI
```yaml
# Block PR if quality gates not met
- name: Quality Gate
  if: always()
  run: |
    if [ "$COVERAGE_LINES" -lt 80 ]; then exit 1; fi
    if [ "$TESTS_FAILED" -gt 0 ]; then exit 1; fi
    if [ "$PERF_P95" -gt 500 ]; then exit 1; fi
```

## Contract Testing (Pact)
```typescript
// Provider test
@PactVerification("UserService")
@Test
void verifyUserServicePact() {
    // Consumer expects GET /users/1 returns user
}

// Consumer test
@ExtendWith(PactConsumerTestExt.class)
class UserApiConsumerTest {
    @Pact(consumer = "WebApp", provider = "UserService")
    public V4Pact createUserPact(PactDslWithProvider builder) {
        return builder
            .uponReceiving("a request for user 1")
            .path("/users/1")
            .method("GET")
            .willRespondWith()
            .status(200)
            .body(new PactDslJsonBody()
                .stringType("email", "test@example.com"))
            .toPact();
    }
}
```

## API Contract Validation (OpenAPI)
```typescript
import { OpenAPIValidator } from 'express-openapi-validator';

// Validate actual responses against OpenAPI spec
app.use(
  OpenAPIValidator.middleware({
    apiSpec: './openapi.yaml',
    validateResponses: true,
  })
);
```
