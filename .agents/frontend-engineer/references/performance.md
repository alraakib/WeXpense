# Performance Optimization

## Code Splitting

### React Lazy
```typescript
import { lazy, Suspense } from 'react';

const UsersPage = lazy(() => import('./pages/Users'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/users" element={<UsersPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Suspense>
  );
}
```

### Dynamic Import (Vue)
```typescript
const UsersPage = () => import('./pages/Users.vue');
```

## Image Optimization

### Next.js Image
```typescript
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  placeholder="blur"
/>
```

### Lazy Loading
```html
<img loading="lazy" src="image.jpg" alt="" />
```

## Bundle Optimization

### Tree Shaking
- Use ES module imports
- Remove dead code
- Use sideEffects: false in package.json

### Code Splitting
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        ui: ['@radix-ui/react-dialog'],
      },
    },
  },
}
```

## Memoization

### React
```typescript
// Component memoization
const MemoizedComponent = React.memo(MyComponent);

// Value memoization
const sorted = useMemo(() => data.sort(), [data]);

// Function memoization
const handleClick = useCallback(() => doSomething(id), [id]);
```

### Vue
```typescript
import { computed, watch } from 'vue';

const doubled = computed(() => count.value * 2);
```

## Virtualization

### Libraries
- `react-window`: Windowed lists
- `react-virtuoso`: Virtualized lists
- `tanstack-virtual`: Virtual window

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={10000}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>Item {index}</div>
  )}
</FixedSizeList>
```

## Web Vitals

### Metrics to Optimize
- **LCP**: Largest Contentful Paint (< 2.5s)
- **FID**: First Input Delay (< 100ms)
- **CLS**: Cumulative Layout Shift (< 0.1)
- **INP**: Interaction to Next Paint (< 200ms)

### Measurement
```typescript
import { onCLS, onFID, onLCP } from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onLCP(console.log);
```

## Best Practices
- Use code splitting for routes
- Optimize images (WebP, AVIF, responsive)
- Use font-display: swap for web fonts
- Minimize bundle size
- Use dynamic imports
- Implement virtual scrolling
- Use proper caching strategies
- Monitor Core Web Vitals
- Use Lighthouse for auditing
- Implement service workers for PWA
