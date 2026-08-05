FROM oven/bun:1.2 AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY src ./src
COPY package.json bun.lock ./
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["bun", "run", "src/index.ts"]
