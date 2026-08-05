# Testing

## Vitest (Recommended)

### Core Concepts
- **Vite-native**: Fast, modern
- **Jest compatible**: Familiar API
- **TypeScript**: Built-in support

```typescript
// Component test
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDefined();
  });
  
  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

---

## Jest

### Core Concepts
- **Zero config**: Works out of box
- **Mocking**: Built-in mock system
- **Coverage**: Built-in reporter

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('button click triggers action', async () => {
  const handleClick = jest.fn();
  render(<button onClick={handleClick}>Submit</button>);
  
  await userEvent.click(screen.getByText('Submit'));
  expect(handleClick).toHaveBeenCalled();
});
```

---

## Playwright (E2E)

### Core Concepts
- **Cross-browser**: Chrome, Firefox, Safari
- **Auto-wait**: Handles timing
- **Codegen**: Record interactions

```typescript
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## Cypress (E2E)

### Core Concepts
- **Real browser**: Runs in browser
- **Time travel**: Debug snapshots
- **Network control**: Stub/mock network

```typescript
describe('Login', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('[name="email"]').type('user@example.com');
    cy.get('[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

---

## Testing Library

### Core Concepts
- **User-centric**: Tests from user perspective
- **Accessible**: Query by role/text
- **Framework agnostic**: Works with React, Vue, etc.

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Query priority
// 1. getByRole (most accessible)
// 2. getByLabelText
// 3. getByPlaceholderText
// 4. getByText
// 5. getByDisplayValue
// 6. getByTitle
// 7. getByTestId (last resort)

test('form works', async () => {
  render(<LoginForm />);
  
  // Find by label
  const emailInput = screen.getByLabelText(/email/i);
  await userEvent.type(emailInput, 'test@example.com');
  
  // Find by role
  const submitButton = screen.getByRole('button', { name: /submit/i });
  await userEvent.click(submitButton);
  
  // Wait for async
  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

## Storybook

### Core Concepts
- **Component development**: Isolated UI
- **Visual testing**: Visual regression
- **Documentation**: Auto-generated docs

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click Me',
  },
};
```

## Best Practices
- Use Vitest over Jest for Vite projects
- Use Testing Library for component tests
- Use Playwright for E2E testing
- Use Storybook for visual regression
- Test user behavior, not implementation
- Use data-testid as last resort
- Mock external services
- Aim for meaningful coverage
