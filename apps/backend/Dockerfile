# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && apk add --no-cache libc6-compat openssl

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/backend/prisma ./apps/backend/prisma
RUN pnpm install --frozen-lockfile --filter backend...

FROM base AS builder
COPY --from=deps /app /app
COPY apps/backend ./apps/backend
RUN pnpm --filter backend... prisma:generate
RUN pnpm --filter backend... build
# pnpm prune no longer supports --filter; dependencies were already scoped during install
RUN CI=true pnpm prune --prod

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY apps/backend/.env.example ./apps/backend/.env.example
EXPOSE 3005
CMD ["node", "apps/backend/dist/main.js"]
