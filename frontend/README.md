# FraudLens AI frontend

A responsive financial crime investigation workspace built with React, Vite, TypeScript, Tailwind CSS, React Router, and Lucide. Self-hosted Inter typography, graphite surfaces, restrained risk colors, and evidence-first workflows.

## Run locally

Requires Node.js 22.12+ (or 24+) and npm.

```powershell
cd frontend
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Choose **Open workspace**, then use the demo credentials on the sign-in page:

- Email: `analyst@fraudlens.ai`
- Password: `Demo@2026`

All records are synthetic. AI analysis is simulated. The fixed activity snapshot is 12 September 2026; actions use the actual current timestamp. Monetary amounts retain their own currency and are not added across currencies.

## Included workflows

- Integrated animated product website, a shared graphite/copper theme, and validated sign-in with pending/error states and route protection.
- Overview with metrics derived from the demo records, date-range activity chart, risk distribution, suspicious transactions, and case queue.
- Customer search, risk/KYC filters, pagination, profile drawers, linked activity.
- Transaction search, risk/status/direction/customer filters, pagination, detail drawers, investigation generation.
- Report search and risk filtering, scores, confidence, evidence, recommendations, data gaps, and contradictions.
- Alert review and status updates.
- Case board/list, linked reports and customers, status changes, persistent notes/evidence timeline.
- Searchable audit history, global record search, responsive navigation, keyboard-accessible native dialogs, reduced-motion support, empty/loading/error/success states, route-level code splitting, and render error boundary.

## Structure

```text
src/
  app/          Router, authentication, shared data providers
  components/   Shell, UI primitives, drawers, charts, tables, search
    landing/    Product story, scroll sequence, background film, scoped styles
  pages/        Landing, login, and seven workspace pages
  data/         Typed synthetic seed and deterministic report generator
  services/     HTTP client and swappable repository
  hooks/        Async mutation state
  types/        Backend-aligned entities and workflow types
  lib/          Formatting and error helpers
  styles.css    Tailwind entry, design tokens, responsive component styles
tests/          Browser workflow and accessibility tests
public/landing/ Optimized motion assets; no runtime dependency on the source folder
scripts/        Repeatable source-asset preparation
```

## Animated website integration

The public `/` route incorporates the supplied `frotend_aml/frontend` animation into this application. All integrated code and optimized assets live in `frontend`; the original source website is not modified. The landing page uses the same brand, self-hosted Inter font, graphite surfaces, and copper buttons as the login and workspace.

The public page presents the product workflow, investigation capabilities, and analyst control. It does not embed fake dashboard controls, API snippets, or a development roadmap. **Open workspace** routes to `/app/dashboard`, prompts for sign-in when necessary, and opens the existing session directly when already signed in.

The source has 300 PNGs (about 223 MB); the integrated sequence uses the first 220, matching the original animation cutoff. Prepared assets total about 8.8 MB: 220 desktop WebP frames (1440px) and 110 mobile frames (800px). Only nearby frames load, with at most three requests active and a bounded decoded-image cache. Request completions paint the current scroll target to avoid stale-frame jumps. Animation observers, callbacks, and ScrollTriggers are cleaned up on navigation or breakpoint changes.

Reduced-motion preferences use a static poster. A poster also remains available if animation frames fail. The background film loads when visible, pauses offscreen or in a hidden tab, and has a visible play/pause control. It remains muted.

To regenerate assets from the original source folder, run `npm run assets:landing`. This is optional: prepared assets are included in `public/landing`, so normal builds do not need the source website.

## Original story artwork and ambient music

The hero artwork spans the entire viewport. The Trace / Investigate / Decide sections use three original graphite-and-copper illustrations as full-width backgrounds, with live HTML text, responsive composition, and restrained scroll parallax. Reduced-motion preferences disable these effects.

Generated with the **built-in image_gen tool**. Original deliverables are saved in [trace.png](design/generated/trace.png), [investigate.png](design/generated/investigate.png), and [decide.png](design/generated/decide.png). The exact final prompt set and generation mode are in [prompts.json](design/generated/prompts.json). Optimized desktop and mobile WebP assets live in [public/landing/art](public/landing/art); all six total about 298 KiB. Originals are kept outside the public directory so they are not shipped in the production bundle.

The landing page also includes an original ambient score synthesized with Web Audio: slow sustained chords, soft filtered tones, and a reverb tail. Audio attempts to start automatically at a fixed 44% level. If browser autoplay policy blocks it, the first click or keypress starts playback. There is no on/off button or volume slider on the page. Hiding the tab suspends audio; leaving the public page closes the audio context. No external music service, downloaded track, or API key is required. The background video remains muted independently.

## FastAPI integration

Copy `.env.example` to `.env.local` and set `VITE_DATA_MODE=api`. The default `VITE_API_BASE_URL=/api/v1` uses Vite's proxy to `http://127.0.0.1:8000`; run the backend separately. Environment changes require restarting Vite.

The repository connects to the endpoints already in this project:

| Capability       | Endpoint                                 |
| ---------------- | ---------------------------------------- |
| JSON JWT sign-in | `POST /auth/login`                       |
| Current user     | `GET /auth/me`                           |
| Customers        | `GET /customers`                         |
| Transactions     | `GET /transactions`                      |
| AI investigation | `POST /ai/investigate/transactions/{id}` |

The HTTP client sends bearer auth, handles FastAPI errors, supports cancellation, and uses a 15-second timeout. A 401 clears the authenticated session. Real API tokens are held in memory; reloading requires signing in again. A production session strategy (for example an HttpOnly cookie/BFF or backend refresh-token flow), authorization, and rate limiting should be implemented with the backend.

Transaction risk is optional because it is absent from the current transaction response. API mode shows **Not assessed** rather than inventing a risk level. The current report read schema does not return data gaps or contradictions; those sections disclose missing fields. Generated API reports remain in the current session because no report-list endpoint exists.

Alerts, cases, and audit endpoints are not implemented in the backend. API mode displays an explicit availability message and no synthetic records for these pages. Add the future endpoints in `services/repository.ts`; components do not call `fetch` directly. This demo does not claim live monitoring or compliance-grade audit durability.

Demo data changes use `localStorage` (`fraudlens.demo.v1`), with in-memory fallback if storage is unavailable. Demo sign-in uses `sessionStorage` (`fraudlens.session`). To reset the demo, remove these two entries in browser developer tools and reload. Each Playwright test uses a fresh browser context.

## Verify

```powershell
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npm test
```

Tests cover authentication, return routes, search/filter/pagination, report-to-case workflow, note and status persistence, audit entries, mobile navigation, runtime exceptions, document overflow at 1440/820/390px, and WCAG A/AA scans. Screenshots are generated in the ignored `test-results/` directory.

## Production build

`npm run build` produces `dist/`. Serve it through an HTTPS static host with SPA fallback to `index.html` for client-side routes. Configure a same-origin `/api` reverse proxy, or set an explicit API URL and allow the frontend origin in FastAPI CORS. Never place secrets in `VITE_*` variables; they are public build-time configuration.

The demo is a complete interactive frontend, not a substitute for backend authorization, secure sessions, or durable audit storage.
