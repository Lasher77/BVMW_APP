# Backend Webhook Examples

The Salesforce webhooks expect a Unix timestamp and HMAC signature that matches the value of `WEBHOOK_SHARED_SECRET`. The snippets below show how to craft signed requests with `curl` for local testing.

## Campaign Upsert

```bash
SECRET="${WEBHOOK_SHARED_SECRET:-replace-me}"
TIMESTAMP=$(date +%s)
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
SIGNATURE=$(printf "%s.%s" "$TIMESTAMP" "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

curl -X POST http://localhost:3000/webhooks/salesforce/campaign \
  -H "Content-Type: application/json" \
  -H "X-Timestamp: $TIMESTAMP" \
  -H "X-Signature: $SIGNATURE" \
  -H "Idempotency-Key: demo-campaign-001" \
  -d "$PAYLOAD"
```

## Attendee Upsert

```bash
SECRET="${WEBHOOK_SHARED_SECRET:-replace-me}"
TIMESTAMP=$(date +%s)
PAYLOAD='{
  "event_type": "attendee.upsert",
  "version": 1,
  "campaign_id": "701TEST0001",
  "person": { "type": "contact", "id": "003TEST0001" },
  "status": "active",
  "doo": { "event_id": "D-123", "booking_id": "B-456" },
  "updated_at": "2024-08-01T09:30:00+02:00"
}'
SIGNATURE=$(printf "%s.%s" "$TIMESTAMP" "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

curl -X POST http://localhost:3000/webhooks/salesforce/attendee \
  -H "Content-Type: application/json" \
  -H "X-Timestamp: $TIMESTAMP" \
  -H "X-Signature: $SIGNATURE" \
  -H "Idempotency-Key: demo-attendee-001" \
  -d "$PAYLOAD"
```

Adjust IDs and timestamps as needed. Duplicate requests with the same `Idempotency-Key` will return `200 OK` without reprocessing.
