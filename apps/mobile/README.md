# Mobile App Environment

The Expo application reads a few public environment variables at build time. Ensure the following keys are set (e.g. via `.env` or your CI configuration):

- `EXPO_PUBLIC_API_URL` – Base URL of the backend (e.g. `http://localhost:3000`).
- `EXPO_PUBLIC_MEMBER_ID` – Salesforce member/contact ID used to prefill the "Meine Tickets" screen during development.

Copy `.env.example` to `.env` and adjust the values before running `pnpm start`.

## Zukunftstag Mittelstand

Die mobile Startseite enthält ein Hero-Banner sowie eine sekundäre Card für den
„Zukunftstag Mittelstand“. Beide verlinken in einen In-App-Browser mit der
offiziellen Veranstaltungsseite.

### Konfiguration

- Inhalte und Farben werden zentral in `src/config/zukunftstag.ts`
  gepflegt. Dort können Datum (`ZUKUNFTSTAG_START_ISO`), URL und Location-Label
  angepasst werden.
- Das Feature lässt sich über `FEATURE_ZUKUNFTSTAG_ENABLED` ein- oder
  ausblenden. Bei `false` erscheinen weder Hero noch Card auf der Startseite.
- Texte liegen in `src/i18n/strings.ts` und können dort für weitere Sprachen
  erweitert werden.

### Benötigte Pakete

Die folgenden Abhängigkeiten müssen im `apps/mobile`-Projekt installiert sein:

- `expo-web-browser`
- `expo-linear-gradient`

Installationsbeispiel:

```bash
pnpm --filter mobile add expo-web-browser expo-linear-gradient
```

### Manuelle QA

- Hero-Banner erscheint auf der Startseite und zeigt den Countdown plausibel
  an.
- CTA „Zur Website“ und „Mehr erfahren“-Pill öffnen den In-App-Browser, die
  Rückkehr führt zurück zur vorherigen Scroll-Position.
- Farben entsprechen dem BVMW-Rot (#c40019) und sind auf hellem/dunklem
  Hintergrund kontrastreich.
- Flag `FEATURE_ZUKUNFTSTAG_ENABLED=false` blendet beide Elemente ohne
  Layout-Sprünge aus.
- Scrolling bleibt flüssig, keine visuellen Artefakte beim Laden der Bilder.
