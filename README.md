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

### macOS local testing setup

The following snippet outlines a typical macOS Sonoma (Apple Silicon) setup for evaluating the project locally:

1. Install [Homebrew](https://brew.sh/) if it is not yet available: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`.
2. Install required tooling:
   ```bash
   brew install node@20 pnpm postgresql@15
   ```
3. Make the binaries available on your shell (add to `.zshrc` or `.bashrc` as needed):
   ```bash
   echo 'export PATH="/opt/homebrew/opt/node@20/bin:/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```
4. Start PostgreSQL and create a development database:
   ```bash
   brew services start postgresql@15
   createdb bvmw_app_dev
   ```
5. Clone the repository, install dependencies, and run migrations:
   ```bash
   git clone https://github.com/<your-org>/BVMW_APP.git
   cd BVMW_APP
   pnpm install
   cd apps/backend
   cp .env.example .env
   # update DATABASE_URL to: postgres://$(whoami)@localhost:5432/bvmw_app_dev
   pnpm prisma migrate dev
   pnpm prisma generate
   ```
6. In a second terminal, prepare the Expo client:
   ```bash
   cd apps/mobile
   cp .env.example .env
   pnpm install
   ```
7. Start the services:
   ```bash
   # backend
   cd apps/backend
   pnpm dev

   # mobile (separate terminal)
   cd apps/mobile
   pnpm start
   ```

You can now access the backend at `http://localhost:3000` and connect the Expo app via the QR code shown in the terminal.

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
