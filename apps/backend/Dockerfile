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


FROM base AS prod-deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/backend/prisma ./apps/backend/prisma
RUN pnpm install --frozen-lockfile --filter backend... --prod
# Generate the Prisma client in the production dependency layer so it is
# available when the runtime container starts up.
# Use the Prisma CLI version that matches the project dependencies to avoid
# breaking changes introduced in newer releases.
RUN pnpm dlx prisma@5.16.1 generate --schema apps/backend/prisma/schema.prisma
# Prisma generates its engines inside the pnpm store, not under package-level node_modules.
# Copy the generated engines from the builder stage so the production image can access them
# without installing dev dependencies.
COPY --from=builder /app/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma ./node_modules/.pnpm/@prisma+client@*/node_modules/.prisma
COPY --from=builder /app/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma ./apps/backend/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma


FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY apps/backend/.env.example ./apps/backend/.env.example
EXPOSE 3005
CMD ["pnpm", "--filter", "backend...", "start"]
