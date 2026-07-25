<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Daybreak Engineering Guide

## Purpose

Daybreak is a static personal intelligence dashboard for weather, cricket, and
football. Its primary artifact is a concise deterministic Morning Briefing.
GitHub Pages is the production runtime, so every design decision must remain
compatible with a static `out/` export.

## Architectural principles

- Keep presentation, domain logic, providers, and refresh orchestration separate.
- External payloads enter as `unknown`, pass through provider-specific Zod
  schemas, and are normalized before any UI code sees them.
- UI components depend only on normalized domain types or presentation view
  models. Never import provider payload types into components.
- Generated JSON under `public/data/` is the production data boundary and is
  validated again when the static page is built.
- Preserve the last valid provider content when a refresh fails. A failure may
  update error/freshness metadata but may not replace valid content with an
  empty payload.
- Keep the briefing generator and cross-topic ranker pure and deterministic.
  Inject time instead of reading the clock inside domain functions.
- Favor synchronous, build-time rendering. Limit Client Components to browser
  capabilities such as theme, local date, geolocation, and restrained motion.

## GitHub Pages restrictions

- `next.config.ts` must keep `output: "export"`; `npm run build` must create
  `out/`.
- Do not add API routes, server actions, request-dependent route handlers, SSR,
  ISR, cookies, middleware/proxy logic, or a continuously running server.
- Do not use default Next image optimization in the static export.
- Test both local `/` and the project base path
  `/raj-intelligence-dashboard/`.
- Prefix arbitrary `public/` assets with the shared base-path helper. Do not
  assume root-relative `/data/...` URLs work on Pages.
- Secrets are available only to local refresh scripts or GitHub Actions. Never
  expose provider keys through `NEXT_PUBLIC_*` variables or browser bundles.

## Provider rules

- Define the provider contract before adding an implementation.
- Keep raw Zod schemas next to the adapter that owns them.
- Adapters must provide clear source attribution and useful non-secret errors.
- Document new environment variables in `.env.example` using blank values.
- Mock providers and realistic fixtures remain first-class for local work and CI.
- Do not scrape or call undocumented endpoints unless an integration is clearly
  marked optional and experimental.
- Refresh scripts must be idempotent, use timeouts, validate before writing, and
  write JSON atomically.

## Design rules

- Use editorial hierarchy, generous whitespace, quiet translucent surfaces,
  restrained shadows, and medium-radius cards. Avoid generic admin-dashboard
  patterns, neon, excessive gradients, badge clutter, and gratuitous charts.
- Maintain excellent light/dark contrast and visible `:focus-visible` states.
- Support 320px mobile width without horizontal scrolling.
- Reserve layout space for asynchronous browser-only content to avoid CLS.
- Respect `prefers-reduced-motion`. Framer Motion is permitted only for subtle,
  purposeful state transitions.
- Use semantic regions and headings. Icon-only controls require accessible names.

## Coding standards

- TypeScript is strict. Do not use `any` or suppress errors to make a build pass.
- Prefer small typed functions and discriminated unions over giant components or
  boolean-heavy APIs.
- Use PEP-like clarity for scripts: validate configuration early, include file or
  provider context in errors, and set a non-zero exit status on failure.
- Store machine timestamps as ISO 8601 UTC. Format user-facing timestamps in the
  browser's local timezone only where appropriate.
- Avoid new dependencies when platform APIs or existing packages are sufficient.

## Tests

- Unit-test every provider normalizer, freshness boundary, ranking rule, and
  briefing branch.
- Test that failed refreshes retain the previous valid content.
- Use React Testing Library for observable behavior and accessible queries.
- Tests must not depend on live provider APIs or the machine clock.
- A feature is incomplete until lint, type-check, tests, data validation, and the
  static build pass without console errors.

## Commands

```bash
npm run dev
npm run data:refresh
npm run data:validate
npm run lint
npm run typecheck
npm run test
npm run test:run
npm run build
npm run preview
npm run check
```

Use `WEATHER_PROVIDER=mock npm run data:refresh` for deterministic offline data.

## Definition of done

- External data is validated and normalized at the provider boundary.
- Failed providers are isolated and last-valid data is preserved.
- All generated files include source, generation, freshness, and error metadata
  appropriate to the domain.
- Morning Briefing contains three to six evidence-based sentences and never
  invents an event.
- Empty, loading, stale, and provider-error states are usable and accessible.
- The page is keyboard-accessible, responsive at 320px, stable during hydration,
  and free of horizontal overflow.
- `npm run check` passes and `out/` contains a working local and Pages-path build.
- Documentation and `.env.example` match the implemented commands and providers.
