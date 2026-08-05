# DevOps & Deployment

## Docker

### Dockerfile Best Practices
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    depends_on:
      - db
  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## CI/CD

### GitHub Actions
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

## Logging

### Winston
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Pino
```typescript
import pino from 'pino';

const logger = pino({
  level: 'info',
  formatters: {
    level: (label) => ({ level: label })
  }
});
```

## Monitoring

### Health Checks
```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Metrics
- Request count
- Response time
- Error rate
- CPU/memory usage
- Database connections

## Graceful Shutdown

```typescript
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await server.close();
  await database.disconnect();
  process.exit(0);
});
```

## Environment Variables

### Configuration
```typescript
import { z } from 'zod';

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

export const config = configSchema.parse(process.env);
```
