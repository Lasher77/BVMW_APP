# CLAUDE.md - BVMW Mitglieder-App

## Projektübersicht

Die BVMW Mitglieder-App ist eine Fullstack-Anwendung für den Bundesverband mittelständische Wirtschaft (BVMW). Sie ermöglicht Mitgliedern, Events zu entdecken, sich anzumelden, Tickets zu verwalten und News zu lesen.

**Ziel: Native App für Apple App Store und Google Play Store.**

Die App wird mit Expo/React Native entwickelt und über Expo EAS als native App für iOS und Android gebaut und in die Stores veröffentlicht.

## Architektur

```
BVMW_APP/
├── apps/
│   ├── backend/          # Express.js REST API + Webhooks
│   └── mobile/           # Expo React Native App
└── packages/
    ├── config/           # Shared ESLint & Prettier
    └── tsconfig/         # Shared TypeScript Config
```

### Tech Stack

**Backend:**
- Express.js 4.19 + TypeScript (ESM)
- Prisma 5.16 + PostgreSQL
- Zod für Validierung
- Pino für Logging
- Helmet, CORS, Rate Limiting für Security

**Mobile:**
- Expo 54 + React Native 0.81
- React 19 + TypeScript
- React Query für State/Cache (offline-first)
- React Navigation (Bottom Tabs)

**Tooling:**
- pnpm Workspaces (Monorepo)
- Jest für Tests
- ESLint + Prettier

## Wichtige Verzeichnisse

### Backend (`apps/backend/src/`)
- `main.ts` - Server-Einstiegspunkt
- `routes/` - API-Endpunkte (`/api/*`, `/webhooks/*`, `/admin/*`)
- `services/` - Business Logic (eventService, chatService, newsService, webhookService)
- `middleware/` - Auth, Validation
- `prisma/` - Schema, Migrations, Seeds
- `utils/` - Helpers (signature, geo, sanitize)

### Mobile (`apps/mobile/src/`)
- `screens/` - React Native Screens (Home, Events, Tickets, Profile, News)
- `components/` - Wiederverwendbare UI-Komponenten
- `api/` - API Client + React Query Hooks
- `navigation/` - Tab/Stack Navigation
- `theme/` - Design System (Farben, Spacing, Typography)
- `config/` - Feature Flags, Member ID

## Datenbank-Schema (Prisma)

```prisma
Event          # Veranstaltungen (aus Salesforce)
Member         # Mitglieder (Kontakte/Leads)
Registration   # Event-Anmeldungen mit Status
ChatMessage    # Event-bezogene Nachrichten
News           # Nachrichtenartikel
WebhookEvent   # Audit Trail für Webhooks
```

## API-Endpunkte

### REST API (`/api/`)
- `GET /api/events` - Events mit Filtern (Datum, Region, Geo-Distanz, Suche)
- `GET /api/events/:id` - Event-Details
- `GET /api/events/:id/messages` - Chat-Nachrichten
- `POST /api/events/:id/messages` - Nachricht senden
- `GET /api/members/:id/registrations` - Nutzer-Tickets
- `GET /api/news` - News-Liste
- `GET /api/news/:id` - News-Details

### Webhooks (`/webhooks/`)
- `POST /webhooks/salesforce/campaign` - Event-Sync
- `POST /webhooks/salesforce/attendee` - Registrierungs-Sync

Auth: Bearer Token oder HMAC-SHA256 Signature

### Admin (`/admin/`)
- `GET /admin/news` - News-Verwaltung (HTML)

## Entwicklungs-Befehle

```bash
# Root
pnpm install              # Alle Dependencies
pnpm -r build             # Alle Apps bauen
pnpm -r test              # Alle Tests
pnpm -r lint              # Linting

# Backend
cd apps/backend
pnpm dev                  # Dev Server (tsx watch)
pnpm prisma migrate dev   # Migrationen ausführen
pnpm prisma generate      # Prisma Client generieren
pnpm seed                 # Seed-Daten laden
pnpm test                 # Backend Tests

# Mobile
cd apps/mobile
pnpm start                # Expo Dev Server
pnpm test                 # Mobile Tests
```

## Umgebungsvariablen

### Backend (`.env`)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/bvmw_app_dev
PORT=3000
LOG_LEVEL=info
WEBHOOK_AUTH_MODE=bearer|hmac
WEBHOOK_BEARER_TOKENS="sf:token123"
WEBHOOK_SHARED_SECRET="min8chars"
```

### Mobile (`.env`)
```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_MEMBER_ID=003TEST0001
```

## Code-Konventionen

- **TypeScript Strict Mode** - Keine impliziten `any`
- **Services-Pattern** - Business Logic in `services/`, nicht in Routes
- **Zod-Validierung** - Alle API-Inputs validieren
- **React Query** - Für API-Calls in Mobile (5min staleTime)
- **DOMPurify** - HTML-Inhalte sanitizen
- **Luxon** - Für Datums-Handling (Zeitzone: Europa/Berlin)

## Sicherheit

- HMAC-SHA256 Webhook-Signatur mit Timing-safe Vergleich
- Rate Limiting auf Webhooks (30 req/min)
- Input-Validierung mit Zod Schemas
- HTML-Sanitization mit DOMPurify
- Parameterized Queries via Prisma (SQL Injection Prevention)

## Testing

```bash
# Unit Tests
pnpm --filter backend test
pnpm --filter mobile test

# Spezifische Tests
cd apps/backend && pnpm test -- --testPathPattern=webhook
```

Test-Fokus: Webhook-Signatur-Validierung, Status-Mapping, API-Responses

## Wichtige Patterns

### Idempotency
Webhooks nutzen `Idempotency-Key` Header. Duplikate werden in `WebhookEvent` erkannt.

### Status-Mapping
Salesforce-Status → App-Status:
- "registered", "invited", "sent", "responded" → `registered`
- "pending" → `pending`
- "rejected", "cancelled" → `rejected`/`cancelled`
- "attended" → `attended`

### Geo-Features
Haversine-Distanz für Events in der Nähe (lat/lng in `userLat`/`userLng` Query Params)

### Feature Flags
`FEATURE_ZUKUNFTSTAG_ENABLED` in Mobile für A/B Testing

## Häufige Aufgaben

### Neues API-Endpunkt hinzufügen
1. Route in `apps/backend/src/routes/api.ts` definieren
2. Service-Funktion in `apps/backend/src/services/` erstellen
3. Zod-Schema für Validierung hinzufügen
4. OpenAPI-Spec aktualisieren (`openapi.yaml`)

### Neue Mobile-Screen hinzufügen
1. Screen in `apps/mobile/src/screens/` erstellen
2. Navigation in `apps/mobile/src/navigation/` registrieren
3. API-Hook in `apps/mobile/src/hooks/` bei Bedarf

### Datenbank-Änderung
1. `prisma/schema.prisma` anpassen
2. `pnpm prisma migrate dev --name beschreibung`
3. `pnpm prisma generate`

## Debugging

- Backend-Logs: Pino mit Pretty-Print in Dev (`LOG_LEVEL=debug`)
- Mobile: React Native Debugger, Expo Dev Tools
- API: OpenAPI-Spec in `apps/backend/openapi.yaml`
- DB: `pnpm prisma studio` für GUI

## Deployment

- Backend: Node.js 20+, `pnpm build && node dist/main.js`
- Mobile: Expo EAS Build für iOS/Android
- DB: `pnpm prisma migrate deploy`

## Roadmap

### Phase 1: Technische Verbesserungen (Aktuell)

| Priorität | Feature | Status | Notizen |
|-----------|---------|--------|---------|
| 1 | Push-Notifications | ✅ Fertig | Expo Notifications + Backend-Integration |
| 2 | WebSocket für Chat | ⬜ Offen | Echtzeit-Nachrichten statt Polling |
| 3 | Bilder-Upload | ⬜ Offen | Direkter Upload für News-Bilder |
| 4 | Offline-Sync Queue | ⬜ Offen | Aktionen offline speichern, später sync |
| 5 | API-Versionierung | ⬜ Offen | `/api/v1/` für Abwärtskompatibilität |
| 6 | Authentifizierung | ⬜ Offen | Magic Link, Salesforce-ID per Webhook |

### Phase 1b: UX-Verbesserungen (Parallel)

| Feature | Status | Notizen |
|---------|--------|---------|
| Dark Mode | ✅ Fertig | ThemeContext + System-Präferenz Support |
| Skeleton Loading | ✅ Fertig | Animierte Platzhalter für Cards |
| Pull-to-Refresh | ✅ Fertig | Auf allen Screens implementiert |

### Phase 2: Feature-Erweiterungen (Später)

| Feature | Notizen |
|---------|---------|
| Networking-Features | Teilnehmer-Verzeichnis, Kontaktaustausch |
| Kalender-Integration | Events zu Apple/Google Calendar |
| Favoriten | Events/News speichern |
| Benachrichtigungs-Präferenzen | Nutzer-Einstellungen |
| Event-Feedback | Bewertungen nach Teilnahme |
| Dokumenten-Bereich | Präsentationen, Handouts |
| Mitgliederverzeichnis | Andere Mitglieder finden |

### Authentifizierung (Konzept)

**Ansatz:** Magic Link Authentication (kein Passwort)

- Nutzer gibt E-Mail ein → erhält Magic Link per E-Mail → Klick loggt ein
- Salesforce Lead-ID/Contact-ID kommt per Webhook und wird auf App-User gespeichert
- Backend verwaltet Sessions/JWT
- Kein Passwort-Reset nötig (Magic Links sind selbst-heilend)

**Technische Umsetzung:**
- E-Mail-Service: Resend, SendGrid oder AWS SES
- Token: Kurzlebig (15 Min), einmalig verwendbar, in DB gespeichert
- Deep Link: `bvmw://auth/verify?token=xxx` öffnet App direkt
