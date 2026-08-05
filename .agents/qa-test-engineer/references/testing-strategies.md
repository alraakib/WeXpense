# Testing Strategies Reference

## Test Pyramid
```
        /\
       /  \          E2E (5%) — Slow, brittle, high confidence
      /    \
     /      \        Integration (15%) — Service/API/DB level tests
    /        \
   /__________\      Unit (80%) — Fast, reliable, isolated
```

## Testing Categories

### Unit Tests
- Test smallest units of code (functions, methods, classes)
- Isolated: mock/stub all dependencies
- Fast: hundreds per second
- Cover: business logic, edge cases, error handling
- Tools: Jest, Vitest, JUnit, pytest, Go test

### Integration Tests
- Test interactions between components (DB, API, external services)
- Use real dependencies when practical (test containers)
- Cover: data access, API contracts, middleware, error flows
- Tools: Supertest, Testcontainers, Spring Boot Test

### End-to-End (E2E) Tests
- Test complete user flows through the system
- Use real browser, real database
- Cover: critical user journeys, happy paths
- Tools: Playwright, Cypress, Selenium, Puppeteer

### Component/Service Tests
- Test a single service in isolation (stub external deps)
- Test API contracts, message handling, business logic
- Tools: Pact (contract testing), WireMock (stubs), Mountebank

### Visual Regression Tests
- Compare UI screenshots against baselines
- Cover: component states, responsive layouts, themes
- Tools: Percy, Chromatic, Applitools, Playwright screenshot

## Test Design Techniques

### Coverage Types
- **Line Coverage**: % of executable lines executed
- **Branch Coverage**: % of decision branches (if/else, switch)
- **Path Coverage**: % of possible execution paths
- **Mutation Testing**: Introduce bugs, check if tests catch them (Stryker)

### Test Case Design
- **Equivalence Partitioning**: Divide inputs into equivalence classes
- **Boundary Value Analysis**: Test at boundaries of valid ranges
- **Decision Table**: Map conditions to outcomes
- **State Transition**: Test state changes and transitions
- **Pairwise Testing**: Combine parameters for efficient coverage

### Test Doubles
- **Mock**: Pre-programmed expectations, verify interactions
- **Stub**: Provide canned answers to calls
- **Spy**: Record calls, verify after the fact
- **Fake**: Working implementation (in-memory DB)
- **Dummy**: Passed but never used

## Test-Driven Development (TDD)
1. Write failing test (RED)
2. Write minimal code to pass (GREEN)
3. Refactor while tests pass (REFACTOR)
- Benefits: Clean design, testable code, regression safety

## Behavior-Driven Development (BDD)
```gherkin
Feature: User Login
  Scenario: Successful login with valid credentials
    Given a registered user "alice@example.com" with password "P@ssw0rd"
    When the user submits the login form with valid credentials
    Then the user is redirected to the dashboard
    And a success message "Welcome back, Alice!" is displayed
```
- Tools: Cucumber, SpecFlow, Behat, behave
- Common language between stakeholders, devs, QA
- Executable specifications

## Testing in CI/CD
- **Stage 1 - Lint + Typecheck**: Static analysis (fast)
- **Stage 2 - Unit Tests**: Parallel execution (fast)
- **Stage 3 - Integration Tests**: With test containers (medium)
- **Stage 4 - E2E Tests**: On staging deploy (slow)
- **Stage 5 - Visual Regression**: After E2E (slow)
- Best Practices: Fail fast, cache node_modules, parallelize by file/class
