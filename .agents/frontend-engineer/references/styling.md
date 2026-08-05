# Styling Solutions

## Tailwind CSS

### Core Concepts
- **Utility-first**: Single-purpose classes
- **Responsive**: Breakpoint prefixes
- **Dark mode**: `dark:` variant
- **Customization**: `tailwind.config`

```html
<div class="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
  <img class="w-12 h-12 rounded-full" src="avatar.jpg" alt="" />
  <div>
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">John Doe</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400">Developer</p>
  </div>
</div>
```

### Best Practices
- Use utility classes over custom CSS
- Use `@apply` sparingly
- Use design tokens for consistency
- Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Use dark mode with `dark:` variant

---

## CSS Modules

### Core Concepts
- **Scoped styles**: Automatic class name hashing
- **Composition**: `composes` keyword
- **No runtime**: Static CSS output

```css
/* Button.module.css */
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}

.primary {
  background: #3b82f6;
  color: white;
}
```

```typescript
import styles from './Button.module.css';

function Button() {
  return <button className={`${styles.button} ${styles.primary}`}>Click</button>;
}
```

---

## CSS-in-JS

### styled-components
```typescript
import styled from 'styled-components';

const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background: ${props => props.$primary ? '#3b82f6' : 'transparent'};
  color: ${props => props.$primary ? 'white' : '#3b82f6'};
`;
```

### Emotion
```typescript
import { css } from '@emotion/react';
import styled from '@emotion/styled';

const buttonStyle = css`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
`;

const Button = styled.button`
  ${buttonStyle}
  background: #3b82f6;
`;
```

---

## PostCSS & CSS Nesting

```css
.card {
  background: white;
  border-radius: 0.5rem;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  
  &__title {
    font-size: 1.25rem;
    font-weight: 600;
  }
}
```

## Best Practices
- Use Tailwind for utility-first approach
- Use CSS Modules for scoped styles
- Use CSS-in-JS for dynamic styles
- Use PostCSS for modern CSS features
- Keep styles maintainable
- Use design tokens
- Use responsive design principles
