# Mobile App Environment

The Expo application reads a few public environment variables at build time. Ensure the following keys are set (e.g. via `.env` or your CI configuration):

- `EXPO_PUBLIC_API_URL` – Base URL of the backend (e.g. `http://localhost:3000`).
- `EXPO_PUBLIC_MEMBER_ID` – Salesforce member/contact ID used to prefill the "Meine Tickets" screen during development.

Copy `.env.example` to `.env` and adjust the values before running `pnpm start`.
