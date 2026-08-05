# Architecture Patterns

## SPA (Single-Page Application)

### Characteristics
- One HTML page, JS handles routing
- Client-side rendering (CSR)
- Fast navigation after initial load
- API-based data fetching

### Pros
- Fast navigation
- Rich interactivity
- Great for authenticated apps

### Cons
- Slower initial load
- SEO challenges
- Requires API backend

### Tech Stack
- React + React Router + Vite
- Vue + Vue Router + Vite
- Svelte + SvelteKit (SPA mode)

---

## SSR (Server-Side Rendering)

### Characteristics
- HTML rendered on server
- Hydration on client
- Better SEO
- Faster initial paint

### Pros
- Excellent SEO
- Faster initial load
- Better Core Web Vitals

### Cons
- Server load
- More complex infrastructure
- Slower page transitions

### Tech Stack
- Next.js (React)
- Nuxt 3 (Vue)
- SvelteKit (Svelte)
- Remix (React)

### Data Flow
```
Request → Server → Fetch Data → Render HTML → Send to Client → Hydrate → Interactive
```

---

## SSG (Static Site Generation)

### Characteristics
- Pre-built HTML at build time
- Deployed to CDN
- Fastest possible load
- No server needed

### Pros
- Extremely fast
- Cheap hosting
- Great SEO
- Secure (no server)

### Cons
- Content is static
- Rebuild needed for changes
- Not suitable for dynamic content

### Tech Stack
- Next.js (static export)
- Astro
- Gatsby
- 11ty

---

## ISR (Incremental Static Regeneration)

### Characteristics
- Hybrid SSG + SSR
- Static pages with revalidation
- On-demand regeneration

### Pros
- Fast static delivery
- Fresh content
- Best of both worlds

### Tech Stack
- Next.js ISR
- Nuxt 3 (Hybrid)

```typescript
// Next.js ISR
export const revalidate = 3600; // Revalidate every hour

export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data }, revalidate: 60 };
}
```

---

## Micro-Frontends

### Characteristics
- Independent frontend apps
- Module Federation
- Shared UI library
- Independent deployments

### Pros
- Team autonomy
- Independent deployments
- Scalable
- Technology agnostic

### Cons
- Bundle size
- Shared state complexity
- Integration testing

### Tech Stack
- Module Federation (Webpack 5)
- Single SPA
- Piral
- Native Federation (Vite)

### Communication
- Custom events
- Shared state (cross-app)
- URL-based state

---

## Islands Architecture

### Characteristics
- Static HTML with interactive islands
- Minimal JavaScript
- Partial hydration

### Pros
- Minimal JS shipped
- Fast loads
- Good for content sites

### Tech Stack
- Astro
- Fresh (Deno)
- Qwik

```
┌─────────────────────────────────┐
│         Static HTML             │
│  ┌──────────┐  ┌──────────┐    │
│  │ Island   │  │ Island   │    │
│  │ (React)  │  │ (Vue)    │    │
│  └──────────┘  └──────────┘    │
│         Static HTML             │
└─────────────────────────────────┘
```

---

## PWA (Progressive Web App)

### Characteristics
- Offline support
- Push notifications
- App-like experience
- Service workers

### Tech Stack
- Workbox (service worker)
- vite-plugin-pwa
- next-pwa

### Manifest
```json
{
  "name": "My App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff"
}
```

---

## Monorepo Frontend

### Characteristics
- Shared packages
- Unified tooling
- Cross-app dependencies

### Tech Stack
- Turborepo
- Nx
- pnpm workspaces

### Structure
```
├── apps/
│   ├── web/           # Main web app
│   ├── admin/         # Admin dashboard
│   └── docs/          # Documentation
├── packages/
│   ├── ui/            # Shared UI components
│   ├── config/        # Shared configs
│   └── utils/         # Shared utilities
├── package.json
├── turbo.json
└── tsconfig.json
```

## Best Practices
- Use SSR/SSG for public-facing sites
- Use SPA for authenticated apps
- Use ISR for content with updates
- Use Astro for content-heavy sites
- Use micro-frontends for large teams
- Monitor bundle size
- Optimize for Core Web Vitals
