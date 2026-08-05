# Meta-Frameworks (Full-Stack)

## Next.js (React)

### Core Concepts
- **App Router**: File-based routing system
- **RSC**: React Server Components
- **Server Actions**: Form/server mutations
- **Streaming**: Progressive rendering

### Key Features
- **Routing**: File-based in `app/` directory
- **Layouts**: Shared UI with nested layouts
- **Loading UI**: Streaming with loading.tsx
- **Error Handling**: error.tsx boundaries
- **Data Fetching**: fetch() with caching
- **Server Actions**: Form mutations
- **Middleware**: Request interception
- **Image Optimization**: Built-in Image component
- **Font Optimization**: Built-in font loading

### Folder Structure (App Router)
```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page
├── loading.tsx         # Loading state
├── error.tsx           # Error boundary
├── page.tsx           # Route page
├── api/               # Route handlers
│   └── users/
│       └── route.ts
└── [id]/
    ├── page.tsx
    └── layout.tsx
```

### Best Practices
- Use Server Components by default
- Use Client Components for interactivity
- Use Server Actions for mutations
- Use ISR for static/dynamic hybrid
- Use Middleware for auth/redirects
- Use Route Groups for organization

---

## Nuxt 3 (Vue)

### Core Concepts
- **File-based routing**: `pages/` directory
- **Auto-imports**: Composables, components
- **Hybrid rendering**: SSR, SSG, ISR, SPA
- **Server engine**: Nitro for server-side

### Key Features
- `useAsyncData()`: Data fetching
- `useFetch()`: HTTP requests
- `useState()`: Shared state
- `useRuntimeConfig()`: Runtime config
- Middleware: Route protection
- Plugins: Extend Nuxt

### Folder Structure
```
app/
├── pages/
├── components/
├── composables/
├── middleware/
├── plugins/
├── server/
│   ├── api/
│   └── middleware/
├── layouts/
├── public/
├── nuxt.config.ts
└── app.vue
```

### Best Practices
- Use `useFetch()` for data fetching
- Use auto-imports
- Use Nitro for API routes
- Use `definePageMeta()` for metadata

---

## SvelteKit

### Core Concepts
- **File-based routing**: `routes/` directory
- **Server-side rendering**: SSR by default
- **Form actions**: Server mutations
- **Endpoints**: API routes

### Key Features
- `load()` functions: Data fetching
- `use:enhance`: Progressive form enhancement
- `$page.store`: Page state
- `goto()`: Programmatic navigation
- Params: Dynamic routes

### Folder Structure
```
src/
├── routes/
│   ├── +page.svelte
│   ├── +layout.svelte
│   ├── +server.ts
│   └── [slug]/
│       └── +page.svelte
├── lib/
│   ├── components/
│   └── server/
├── app.html
├── hooks.server.ts
└── svelte.config.js
```

### Best Practices
- Use `+server.ts` for API routes
- Use form actions for mutations
- Use `$lib` for shared code
- Use hooks for auth/session

---

## Remix (React)

### Core Concepts
- **Nested routes**: Components for each route
- **Loaders**: Server-side data loading
- **Actions**: Server-side mutations
- **Progressive enhancement**: Works without JS

### Key APIs
```typescript
export async function loader({ params }: LoaderFunctionArgs) {
  return json(await db.user.findUnique({ where: { id: params.id } }));
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  return redirect('/users');
}

export default function UserPage() {
  const user = useLoaderData<typeof loader>();
  return <div>{user.name}</div>;
}
```

### Best Practices
- Use loaders for data fetching
- Use actions for mutations
- Use `<Form>` for progressive enhancement
- Use nested routes for layouts
- Use `useFetcher` for non-navigation

---

## Astro

### Core Concepts
- **Zero JS by default**: Ships minimal JS
- **Island architecture**: Interactive components
- **Multi-framework**: Use React, Vue, Svelte together
- **Content collections**: Markdown/MDX

### Key Features
- `.astro` components: Template language
- Content collections: Type-safe content
- Image optimization: Built-in
- View transitions: SPA-like navigation

### Best Practices
- Use Astro for content-heavy sites
- Use islands for interactivity
- Use content collections for blogs
- Use View Transitions for navigation
