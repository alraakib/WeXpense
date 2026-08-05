# Folder Structures

## React SPA (Vite + React Router)
```
src/
├── components/
│   ├── ui/            # Reusable UI components
│   ├── layout/        # Layout components
│   └── shared/        # Shared components
├── pages/
│   ├── Home.tsx
│   ├── Users.tsx
│   └── Login.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useUsers.ts
├── services/
│   ├── api.ts
│   └── auth.ts
├── stores/
│   └── auth.store.ts
├── types/
│   └── index.ts
├── utils/
│   └── helpers.ts
├── lib/
│   └── constants.ts
├── styles/
│   ├── globals.css
│   └── tailwind.css
├── tests/
│   ├── components/
│   ├── pages/
│   └── hooks/
├── app.tsx
├── main.tsx
├── vite.config.ts
└── tsconfig.json
```

## Next.js App Router
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── settings/
│   └── api/
│       ├── auth/
│       └── users/
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   └── useMediaQuery.ts
├── types/
│   └── index.ts
├── styles/
│   └── globals.css
├── middleware.ts
├── next.config.ts
└── tsconfig.json
```

## Vue SPA (Vite + Vue Router)
```
src/
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── pages/
│   ├── Home.vue
│   ├── Users.vue
│   └── Login.vue
├── composables/
│   ├── useAuth.ts
│   └── useUsers.ts
├── stores/
│   └── auth.store.ts
├── router/
│   └── index.ts
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── utils/
│   └── helpers.ts
├── assets/
│   └── images/
├── styles/
│   └── main.css
├── App.vue
├── main.ts
├── vite.config.ts
└── tsconfig.json
```

## Nuxt 3
```
app/
├── pages/
│   ├── index.vue
│   └── users/
│       └── [id].vue
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── composables/
│   ├── useAuth.ts
│   └── useUsers.ts
├── stores/
│   └── auth.ts
├── middleware/
│   └── auth.ts
├── plugins/
│   └── api.ts
├── server/
│   ├── api/
│   │   └── users.ts
│   └── middleware/
├── layouts/
│   └── default.vue
├── public/
├── app.vue
├── nuxt.config.ts
└── tsconfig.json
```

## SvelteKit
```
src/
├── routes/
│   ├── +page.svelte
│   ├── +layout.svelte
│   ├── +page.server.ts
│   ├── login/
│   │   ├── +page.svelte
│   │   └── +page.server.ts
│   └── users/
│       ├── +page.svelte
│       └── [id]/
│           └── +page.svelte
├── lib/
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   ├── server/
│   │   └── db.ts
│   └── utils/
├── hooks/
│   ├── client.ts
│   └── server.ts
├── app.html
├── app.css
├── svelte.config.js
└── tsconfig.json
```

## Micro-Frontend (Module Federation)
```
packages/
├── host/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── remotes/
│   └── package.json
├── auth-app/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── bootstrap.tsx
│   └── package.json
├── dashboard-app/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── bootstrap.tsx
│   └── package.json
└── shared-lib/
    ├── src/
    └── package.json
```

## Monorepo (Turborepo)
```
├── apps/
│   ├── web/
│   │   ├── src/
│   │   └── package.json
│   └── docs/
│       ├── src/
│       └── package.json
├── packages/
│   ├── ui/
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   ├── config-eslint/
│   ├── config-typescript/
│   └── shared-utils/
├── package.json
├── turbo.json
└── tsconfig.json
```
