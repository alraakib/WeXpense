# Containerization & Image Optimization Reference

## Dockerfile Patterns

### Multi-Stage Build
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
USER appuser
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

### Image Optimization
- **Base Image**: Distroless, Alpine (5MB), or slim variants
- **Layer Caching**: Order from least to most frequently changing
  - system deps -> package.json -> install -> source -> build
- **Layer Reduction**: Chain RUN commands with `&&` and cleanup in same layer
- **`.dockerignore`**: Exclude node_modules, .git, *.md, tests, CI config
- **Multi-stage**: Build dependencies in one stage, copy artifacts to final

### Security Hardening
- Use `USER` directive (never run as root)
- Set `RUN apk add --no-cache` for Alpine
- Use specific package versions
- `RUN chown -R appuser:appgroup /app`
- Read-only filesystem: `--read-only` flag
- Drop capabilities: `--cap-drop=ALL --cap-add=NEEDED`
- Use `COPY --chown` to set ownership

## Image Size Comparison
- `node:20` = ~1.1 GB
- `node:20-slim` = ~230 MB
- `node:20-alpine` = ~130 MB
- `gcr.io/distroless/nodejs20-debian12` = ~120 MB
- Custom distroless with only binary = ~30-50 MB

## Kubernetes Resource Optimization
- Set CPU/memory requests and limits
- Use `VerticalPodAutoscaler` for initial sizing
- Use `HorizontalPodAutoscaler` for scaling
- Use `cluster-autoscaler` for node scaling
- Prefer spot/preemptible instances for stateless workloads
- Use pod resource requests for scheduling efficiency
- Enable compression in API responses
- Use connection pooling for external services

## Performance Testing
- **Load Testing**: k6, Locust, wrk, hey
- **Stress Testing**: Full capacity to breaking point
- **Soak Testing**: Extended period at normal load
- **Chaos Engineering**: Chaos Monkey, Litmus, Gremlin
- **Benchmarks**: Compare versions/configs
