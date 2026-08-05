# Folder Structures

## Monolith - Express/Node.js
```
src/
├── config/
│   ├── database.ts
│   ├── env.ts
│   └── logger.ts
├── controllers/
│   ├── user.controller.ts
│   ├── auth.controller.ts
│   └── index.ts
├── services/
│   ├── user.service.ts
│   ├── auth.service.ts
│   └── index.ts
├── repositories/
│   ├── user.repository.ts
│   └── index.ts
├── models/
│   ├── user.model.ts
│   └── index.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   ├── validation.middleware.ts
│   └── index.ts
├── routes/
│   ├── user.routes.ts
│   ├── auth.routes.ts
│   └── index.ts
├── utils/
│   ├── helpers.ts
│   ├── errors.ts
│   └── index.ts
├── types/
│   ├── index.ts
│   └── express.d.ts
├── validators/
│   ├── user.validator.ts
│   └── index.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── migrations/
├── seeds/
├── app.ts
├── server.ts
└── index.ts
```

## Monolith - Hono/Bun
```
src/
├── config/
│   ├── database.ts
│   └── env.ts
├── routes/
│   ├── user.ts
│   ├── auth.ts
│   └── index.ts
├── middleware/
│   ├── auth.ts
│   ├── error.ts
│   └── index.ts
├── services/
│   ├── user.service.ts
│   └── auth.service.ts
├── repositories/
│   ├── user.repository.ts
│   └── index.ts
├── validators/
│   ├── user.ts
│   └── index.ts
├── types/
│   └── index.ts
├── utils/
│   ├── helpers.ts
│   └── index.ts
├── tests/
│   ├── unit/
│   └── integration/
├── app.ts
└── index.ts
```

## Monolith - NestJS
```
src/
├── modules/
│   ├── user/
│   │   ├── user.module.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   └── common/
│       ├── filters/
│       │   └── http-exception.filter.ts
│       ├── guards/
│       │   └── roles.guard.ts
│       ├── interceptors/
│       │   └── logging.interceptor.ts
│       └── pipes/
│           └── validation.pipe.ts
├── config/
│   ├── database.config.ts
│   └── app.config.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── tests/
├── app.module.ts
├── main.ts
└── nest-cli.json
```

## Microservices
```
services/
├── api-gateway/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── auth-service/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── config/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── user-service/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── shared/
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── index.ts
│   └── package.json
├── docker-compose.yml
├── turbo.json
└── package.json
```

## Monorepo (Turborepo)
```
├── apps/
│   ├── web/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── api/
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── shared/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── config/
│       ├── eslint/
│       ├── typescript/
│       └── package.json
├── package.json
├── turbo.json
├── tsconfig.json
└── .github/
    └── workflows/
        └── ci.yml
```
