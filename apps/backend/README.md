# Backend Webhook Examples

Incoming webhooks authenticate with a Bearer token by default. Legacy HMAC signatures remain supported when `WEBHOOK_AUTH_MODE=hmac` is set.

## Configuration

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Database connection string (e.g. `postgresql://user:pass@host:5432/db`). Prisma `file:` URLs for SQLite are also accepted. |
| `WEBHOOK_AUTH_MODE` | `bearer` (default) or `hmac`. Controls which authentication strategy is active. |
| `WEBHOOK_BEARER_TOKENS` | Comma-separated list of allowed tokens. Optional labels can be prefixed via `label:token` (e.g. `sf:token-a,doo:token-b`). |
| `WEBHOOK_SHARED_SECRET` | Legacy HMAC secret. Only evaluated when `WEBHOOK_AUTH_MODE=hmac`. |

Store tokens in your secrets manager and rotate them regularly. Configure separate tokens per source (Salesforce, Doo, …) to keep revocation scoped.

Copy `.env.example` to `.env` and adjust the values for your environment:

```bash
cp .env.example .env
```

Set `WEBHOOK_AUTH_MODE=bearer` and populate `WEBHOOK_BEARER_TOKENS` with at least one token (optionally prefixed by a label such as `sf:`). The legacy `WEBHOOK_SHARED_SECRET` may remain unset unless HMAC mode is required.

## Docker

Build and run the backend in Docker using the repository root as the build context:

```bash
# Build the image
docker build -f apps/backend/Dockerfile -t bvmw-backend .

# Start the container (ensure DATABASE_URL and webhook secrets are set appropriately)
docker run --env-file apps/backend/.env.example -p 3005:3005 bvmw-backend
```

Run Prisma migrations against your database before starting the container in production (e.g. `pnpm --filter backend... prisma:migrate`).


### Start script (build + migrate + run)

Use the helper script to build the image, run Prisma migrations (and check their status), and start the container. Provide your environment file (must contain `DATABASE_URL` and webhook secrets). The script resolves the repository root automatically, so it can be run from any working directory:
=======

### Start script (build + migrate + run)

Use the helper script to build the image, run Prisma migrations (and check their status), and start the container. Provide your environment file (must contain `DATABASE_URL` and webhook secrets):


```bash
./apps/backend/scripts/start-backend-docker.sh apps/backend/.env
```

The script will:

- build the `bvmw-backend` image from the monorepo root
- apply Prisma migrations via `prisma migrate deploy`
- verify migration status
- restart a `bvmw-backend` container on port `3005`


## Bearer Auth Examples

### Campaign Upsert

```bash
TOKEN="${WEBHOOK_BEARER_TOKEN_SF:-replace-me}"
PAYLOAD='{
  "event_type": "campaign.upsert",
  "version": 1,
  "campaign": {
    "id": "701TEST0001",
    "name": "Sommerempfang Berlin",
    "title": "Sommerempfang der Hauptstadtregion",
    "status": "Planned",
    "public": true,
    "start": "2024-08-15T16:00:00+02:00",
    "end": "2024-08-15T20:00:00+02:00",
    "is_online": false,
    "region": "Berlin",
    "venue": {
      "name": "BVMW Hauptstadtbüro",
      "street": "Charlottenstraße 1",
      "postal_code": "10117",
      "city": "Berlin",
      "country": "DE",
      "geo": { "lat": 52.5075, "lon": 13.3904 }
    },
    "tags": ["Netzwerk", "Politik"]
  }
}'

curl -X POST http://localhost:3005/webhooks/salesforce/campaign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: demo-campaign-001" \
  -d "$PAYLOAD"
```

### Attendee Upsert

```bash
TOKEN="${WEBHOOK_BEARER_TOKEN_SF:-replace-me}"
PAYLOAD='{
  "event_type": "attendee.upsert",
  "version": 1,
  "campaign_id": "701TEST0001",
  "person": { "type": "contact", "id": "003TEST0001" },
  "status": "active",
  "doo": { "event_id": "D-123", "booking_id": "B-456" },
  "updated_at": "2024-08-01T09:30:00+02:00"
}'

curl -X POST http://localhost:3005/webhooks/salesforce/attendee \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: demo-attendee-001" \
  -d "$PAYLOAD"
```

Duplicate requests with the same `Idempotency-Key` will return `200 OK` without reprocessing.

## Legacy HMAC Mode

Set `WEBHOOK_AUTH_MODE=hmac` and use the `WEBHOOK_SHARED_SECRET` value to compute signatures. Timestamp and signature headers become mandatory again in this mode.

```bash
SECRET="${WEBHOOK_SHARED_SECRET:-replace-me}"
TIMESTAMP=$(date +%s)
PAYLOAD='{
  "event_type": "campaign.upsert",
  "version": 1,
  "campaign": {
    "id": "701TEST0001",
    "name": "Sommerempfang Berlin"
  }
}'
SIGNATURE=$(printf "%s.%s" "$TIMESTAMP" "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

curl -X POST http://localhost:3005/webhooks/salesforce/campaign \
  -H "Content-Type: application/json" \
  -H "X-Timestamp: $TIMESTAMP" \
  -H "X-Signature: $SIGNATURE" \
  -H "Idempotency-Key: demo-campaign-001" \
  -d "$PAYLOAD"
```

## Additional Recommendations

- Accept new and old tokens in parallel during rotations and then retire the old entries.
- Keep HTTPS enforced and retain the existing rate-limit on `/webhooks`.
- Consider adding IP allowlists for Salesforce and Doo sources where feasible.
