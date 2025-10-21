# BVMW Mitglieder-App Monorepo

This repository contains the MVP implementation for the BVMW Mitglieder-App. It is structured as a pnpm workspace with a TypeScript/Express backend (BFF) and a React Native (Expo) mobile client.

```
/apps
  /backend    # Express + Prisma API & webhook handlers
  /mobile     # Expo mobile application
/packages
  /config     # Shared linting & formatting config
  /tsconfig   # Shared TypeScript compiler settings
```

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL instance for local development

## Backend (`apps/backend`)

### Environment

```
cp apps/backend/.env.example apps/backend/.env
```

Update `DATABASE_URL` and `WEBHOOK_SHARED_SECRET` as needed.

### Database & Prisma

```
cd apps/backend
pnpm prisma migrate dev
pnpm prisma generate
pnpm seed        # optional seed data
```

### Development

```
pnpm dev
```

The server exposes REST endpoints under `/api/*`, Salesforce webhooks under `/webhooks/*`, and `/healthz` for health checks. An OpenAPI description is available at `apps/backend/openapi.yaml`.

### Testing

Run the full workspace test suite:

```
pnpm test
```

Or target individual apps while iterating:

```
pnpm --filter backend test
pnpm --filter mobile test
```

## Mobile (`apps/mobile`)

### Environment

```
cp apps/mobile/.env.example apps/mobile/.env
```

Set `EXPO_PUBLIC_API_URL` to the backend URL and adjust the demo `EXPO_PUBLIC_MEMBER_ID` if required.

### Development

```
cd apps/mobile
pnpm start
```

Use the Expo CLI output to open the app on iOS, Android, or the web. The default tab navigation includes Home, Events, Tickets, and Profil screens. Event registration opens the configured doo registration URL in an in-app browser.

## Tooling

- Linting: `pnpm -r lint`
- Tests: `pnpm -r test`
- Formatting: shared Prettier configuration under `packages/config`

## Webhooks

Both Salesforce webhooks require `X-Signature`, `X-Timestamp`, and `Idempotency-Key` headers. Sample payloads can be found in the OpenAPI spec. The seed script creates one demo event (`701TEST0001`) and member (`003TEST0001`) to exercise the APIs.

## Notes

- Webhook payloads are stored in the `WebhookEvent` table for traceability and idempotency handling.
- Event descriptions are sanitized server-side using DOMPurify.
- React Query powers the mobile app's offline-first caching behaviour.
- Tests cover webhook signature validation and registration status mapping logic.
