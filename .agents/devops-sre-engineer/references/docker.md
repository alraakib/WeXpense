# Docker Reference

## Architecture
- **Client-Server**: Docker CLI -> dockerd (daemon)
- **Components**: Images (read-only templates), Containers (runnable instances), Registries (image storage), Volumes (persistent data), Networks (container communication)
- **Underlying Tech**: Namespaces (isolation), cgroups (resource limits), UnionFS (layers)

## Key Commands
- `docker build -t <name>:<tag> .` — Build image from Dockerfile
- `docker run -d -p 8080:80 --name <name> <image>` — Run container
- `docker compose up -d` — Start Compose services
- `docker ps -a` — List all containers
- `docker images` — List images
- `docker exec -it <container> <cmd>` — Execute in running container
- `docker logs -f <container>` — Follow logs
- `docker system prune -af` — Clean all unused resources

## Dockerfile Best Practices
- Use specific base image tags (not `latest`)
- Multi-stage builds to minimize final image size
- Combine RUN commands to reduce layers
- Use `.dockerignore` to exclude unnecessary files
- Use `COPY --chown` for non-root user
- Set `USER` directive to non-root
- Use health checks via `HEALTHCHECK`
- Leverage build cache by ordering layers (infrequent changes first)

## Multi-stage Build Example
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
USER node
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

## Docker Compose Best Practices
- Use named volumes for persistent data
- Set resource limits per service
- Use `depends_on` for startup ordering
- Use health checks for dependency readiness
- Use `.env` files for environment-specific config
- Use profiles for dev/prod differentiation

## Networking
- **bridge**: Default network, containers communicate via IP
- **host**: Container uses host's network stack
- **overlay**: Multi-host networking (Swarm)
- **none**: No networking
- Custom bridge networks for container DNS resolution

## Volumes
- Named volumes: `docker volume create <name>`
- Bind mounts: `-v /host/path:/container/path`
- tmpfs mounts: In-memory temporary storage
- Use `--mount` syntax for clarity over `-v`
