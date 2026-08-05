# Routing

## React Router

### Core Concepts
- **Client-side routing**: SPA navigation
- **Nested routes**: Layout inheritance
- **Loaders/Actions**: Data loading and mutations

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'users',
        loader: () => fetch('/api/users'),
        element: <Users />,
        children: [
          { path: ':id', element: <UserDetail /> },
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
```

### Best Practices
- Use loaders for data fetching
- Use actions for mutations
- Use nested routes for layouts
- Use error boundaries for error handling

---

## TanStack Router

### Core Concepts
- **TypeScript-first**: Full type inference
- **File-based routing**: Optional
- **Built-in caching**: SWR patterns

```typescript
import { createRouter, RouterProvider } from '@tanstack/react-router';

const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    usersRoute,
  ]),
});

export function App() {
  return <RouterProvider router={router} />;
}
```

---

## Vue Router

### Core Concepts
- **Nested routes**: Layout inheritance
- **Navigation guards**: Route protection
- **Lazy loading**: Route-level code splitting

```typescript
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./layouts/Default.vue'),
      children: [
        { path: '', component: () => import('./pages/Home.vue') },
        { path: 'users', component: () => import('./pages/Users.vue') },
      ],
    },
  ],
});

// Navigation guard
router.beforeEach((to, from) => {
  const isAuthenticated = useAuthStore().isAuthenticated;
  if (to.meta.requiresAuth && !isAuthenticated) return '/login';
});
```

### Best Practices
- Use lazy loading for routes
- Use navigation guards for auth
- Use nested routes for layouts
- Use route meta for configuration

## Routing Architecture

### SPA Routing
- **Client-side**: All routing in browser
- **No page reloads**: Fast navigation
- **SEO**: Requires SSR for indexing

### SSR Routing
- **Server-rendered**: Full page HTML
- **Better SEO**: Indexed by search engines
- **Slower navigation**: Full page reloads

### Hybrid Routing
- **Next.js/Nuxt/SvelteKit**: Mix of SSR + client
- **Best of both**: SEO + fast navigation
- **Automatic**: Framework handles switching

## Best Practices
- Use React Router for React SPAs
- Use TanStack Router for type-safe routing
- Use Vue Router for Vue apps
- Use file-based routing in meta-frameworks
- Implement lazy loading
- Use route guards for auth
- Use nested routes for layouts
