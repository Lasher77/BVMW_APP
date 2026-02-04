# BVMW Mitglieder-App Monorepo

MVP-Implementierung der BVMW Mitglieder-App als pnpm Monorepo mit TypeScript/Express Backend und React Native (Expo) Mobile Client.

```
/apps
  /backend    # Express + Prisma API & Webhook-Handler
  /mobile     # Expo Mobile-Anwendung
/packages
  /config     # Shared Linting & Formatting
  /tsconfig   # Shared TypeScript-Konfiguration
```

## macOS Installation

### Voraussetzungen

- macOS Sonoma oder neuer (Apple Silicon oder Intel)
- Terminal-Zugang
- ca. 2 GB freier Speicherplatz

### Schritt 1: Homebrew installieren

Falls noch nicht vorhanden:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Nach der Installation den angezeigten Befehlen folgen, um Homebrew zum PATH hinzuzufügen.

### Schritt 2: Abhängigkeiten installieren

```bash
brew install node@20 pnpm postgresql@15
```

### Schritt 3: PATH konfigurieren

Füge folgende Zeile zu deiner Shell-Konfiguration hinzu:

**Für Zsh (Standard auf macOS):**
```bash
echo 'export PATH="/opt/homebrew/opt/node@20/bin:/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Für Bash:**
```bash
echo 'export PATH="/opt/homebrew/opt/node@20/bin:/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
```

**Für Intel Macs:** Ersetze `/opt/homebrew` durch `/usr/local`.

### Schritt 4: PostgreSQL starten

```bash
brew services start postgresql@15
```

Prüfe, ob PostgreSQL läuft:
```bash
brew services list
```

### Schritt 5: Datenbank erstellen

```bash
createdb bvmw_app_dev
```

### Schritt 6: Repository klonen

```bash
git clone https://github.com/Lasher77/BVMW_APP.git
cd BVMW_APP
```

### Schritt 7: Dependencies installieren

```bash
pnpm install
```

### Schritt 8: Backend konfigurieren

```bash
cd apps/backend
cp .env.example .env
```

Bearbeite `.env` und setze die `DATABASE_URL`:
```bash
DATABASE_URL="postgresql://$(whoami)@localhost:5432/bvmw_app_dev"
```

Oder manuell in einem Editor:
```
DATABASE_URL="postgresql://deinbenutzername@localhost:5432/bvmw_app_dev"
```

### Schritt 9: Datenbank migrieren

```bash
pnpm prisma migrate dev
pnpm prisma generate
pnpm seed  # Optional: Demo-Daten laden
```

### Schritt 10: Mobile App konfigurieren

In einem neuen Terminal:
```bash
cd apps/mobile
cp .env.example .env
```

Die Standardwerte sollten für lokale Entwicklung funktionieren.

### Schritt 11: Services starten

**Terminal 1 - Backend:**
```bash
cd apps/backend
pnpm dev
```

Das Backend läuft unter `http://localhost:3000`.

**Terminal 2 - Mobile:**
```bash
cd apps/mobile
pnpm start
```

Expo zeigt einen QR-Code. Scanne ihn mit:
- **iOS:** Kamera-App → Link folgen
- **Android:** Expo Go App → QR scannen

## Verfügbare Endpunkte

Nach dem Start:

| URL | Beschreibung |
|-----|--------------|
| `http://localhost:3000/healthz` | Health Check |
| `http://localhost:3000/api/events` | Events-API |
| `http://localhost:3000/api/news` | News-API |
| `http://localhost:3000/admin/news` | News-Verwaltung |

## Nützliche Befehle

### Entwicklung

```bash
# Backend mit Hot-Reload
cd apps/backend && pnpm dev

# Mobile mit Expo
cd apps/mobile && pnpm start

# Alle Apps gleichzeitig (aus Root)
pnpm -r dev
```

### Datenbank

```bash
# Prisma Studio (GUI)
cd apps/backend && pnpm prisma studio

# Neue Migration erstellen
pnpm prisma migrate dev --name beschreibung

# Datenbank zurücksetzen
pnpm prisma migrate reset
```

### Tests & Linting

```bash
# Alle Tests
pnpm -r test

# Nur Backend
pnpm --filter backend test

# Nur Mobile
pnpm --filter mobile test

# Linting
pnpm -r lint
```

### Build

```bash
# Backend bauen
cd apps/backend && pnpm build

# Alle Apps bauen
pnpm -r build
```

## Troubleshooting

### PostgreSQL startet nicht

```bash
# Logs prüfen
brew services info postgresql@15

# Manuell starten
/opt/homebrew/opt/postgresql@15/bin/postgres -D /opt/homebrew/var/postgresql@15
```

### Port 3000 bereits belegt

```bash
# Prozess finden
lsof -i :3000

# Prozess beenden
kill -9 <PID>
```

### Prisma Client veraltet

```bash
cd apps/backend
pnpm prisma generate
```

### Node-Version falsch

```bash
node --version  # Sollte v20.x.x zeigen

# Falls nicht, PATH prüfen oder nvm nutzen
brew unlink node && brew link node@20
```

### Mobile App verbindet nicht zum Backend

1. Prüfe, ob Backend läuft (`http://localhost:3000/healthz`)
2. Prüfe `EXPO_PUBLIC_API_URL` in `apps/mobile/.env`
3. Bei physischem Gerät: Lokale IP statt `localhost` verwenden

```bash
# Lokale IP finden
ipconfig getifaddr en0
```

Dann in `.env`:
```
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

## Projekt-Dokumentation

Für detaillierte Informationen zur Architektur und Entwicklung siehe [CLAUDE.md](./CLAUDE.md).

## Webhooks

Salesforce-Webhooks benötigen `X-Signature`, `X-Timestamp` und `Idempotency-Key` Header. Payload-Beispiele findest du in `apps/backend/openapi.yaml`.

## Lizenz

Proprietär - BVMW
