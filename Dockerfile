FROM node:22-alpine AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate && pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @ukbt/truth tokens:build && pnpm --filter @ukbt/web build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/apps/web/dist ./dist
COPY --from=builder /app/apps/web/public ./public
EXPOSE 8080
CMD npx serve ./dist
