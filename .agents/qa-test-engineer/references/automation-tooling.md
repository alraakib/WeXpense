# Automation & Tooling Reference

## JavaScript/TypeScript Testing

### Vitest (Recommended for Vite/TS projects)
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('UserService', () => {
  it('should create a user', async () => {
    const user = await userService.create({ email: 'test@example.com' });
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  it('should handle duplicate email', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(existingUser);
    await expect(userService.create({ email: 'test@example.com' }))
      .rejects.toThrow('Email already exists');
  });
});
```

### Jest
```typescript
jest.mock('../services/userService');
describe('User API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // Jest-compatible (Vitest is drop-in replacement for most features)
});
```

### Playwright (E2E)
```typescript
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Welcome back')).toBeVisible();
});
```

### Supertest (API/Integration)
```typescript
import request from 'supertest';
import app from '../app';

describe('POST /api/users', () => {
  it('should return 201 for valid input', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test' });
    expect(res.status).toBe(201);
  });
});
```

## Python Testing

### pytest (Unit + Integration)
```python
import pytest
from app.services import user_service

@pytest.mark.asyncio
async def test_create_user():
    user = await user_service.create("test@example.com")
    assert user.email == "test@example.com"

@pytest.fixture
def db_session():
    session = create_test_session()
    yield session
    session.rollback()
```

### Selenium / Playwright (E2E)
```python
from playwright.sync_api import Page, expect

def test_login(page: Page):
    page.goto("http://localhost:3000/login")
    page.fill("[name='email'", "test@example.com")
    page.click("button[type='submit']")
    expect(page).to_have_url("**/dashboard")
```

## Java/Kotlin Testing

### JUnit 5 + Mockito
```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock UserRepository userRepository;
    @InjectMocks UserService userService;

    @Test
    void createUser_ValidInput_ReturnsUser() {
        when(userRepository.save(any())).thenReturn(new User("test@example.com"));
        User result = userService.create("test@example.com");
        assertEquals("test@example.com", result.email());
    }
}
```

### Testcontainers
```java
@Testcontainers
class UserRepositoryTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Test
    void saveAndFind() {
        // Tests with real PostgreSQL in container
    }
}
```

## Go Testing

```go
func TestCreateUser(t *testing.T) {
    mockRepo := new(MockUserRepository)
    mockRepo.On("Save", mock.Anything).Return(&User{Email: "test@example.com"}, nil)
    service := NewUserService(mockRepo)
    
    user, err := service.Create("test@example.com")
    assert.NoError(t, err)
    assert.Equal(t, "test@example.com", user.Email)
}
```

## Ruby Testing

```ruby
RSpec.describe UserService do
  let(:repository) { instance_double(UserRepository) }
  subject { described_class.new(repository) }

  it 'creates a user' do
    expect(repository).to receive(:save).with(hash_including(email: 'test@example.com'))
    result = subject.create('test@example.com')
    expect(result.email).to eq('test@example.com')
  end
end
```

## .NET Testing

```csharp
[TestFixture]
public class UserServiceTests
{
    private Mock<IUserRepository> _mockRepo;
    private UserService _service;

    [SetUp]
    public void Setup()
    {
        _mockRepo = new Mock<IUserRepository>();
        _service = new UserService(_mockRepo.Object);
    }

    [Test]
    public async Task CreateUser_ValidEmail_ReturnsUser()
    {
        _mockRepo.Setup(r => r.Save(It.IsAny<User>())).ReturnsAsync(new User("test@example.com"));
        var result = await _service.Create("test@example.com");
        Assert.That(result.Email, Is.EqualTo("test@example.com"));
    }
}
```
