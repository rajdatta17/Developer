# Daybreak

Daybreak is a calm, source-aware personal intelligence dashboard for the first
few minutes of the day. It combines local weather, cricket, and football into a
single responsive page, then turns the highest-value facts into a deterministic
Morning Briefing without requiring a paid AI service.

The application is designed for static hosting. Provider calls run locally or
in GitHub Actions, validated results are committed as JSON, and Next.js exports
the complete site to `out/` for free GitHub Pages hosting. No API key is shipped
to the browser.

> **Screenshot placeholder:** Add a current desktop capture here after the first
> production deployment.

## Architecture

```text
External API or fixture
  → provider-specific adapter
  → provider Zod validation
  → normalized domain model
  → freshness/ranking/briefing services
  → atomic public/data/*.json files
  → build-time Zod validation
  → static Next.js UI
```

The main boundaries are:

- `src/domain`: provider-independent data contracts.
- `src/providers`: provider interfaces, raw schemas, and adapters.
- `src/services`: refresh preservation, freshness, ranking, briefing, and
  generated-data loading.
- `scripts`: local and scheduled data refresh entry points.
- `public/data`: versioned, attributed generated artifacts consumed by the UI.
- `src/components`: presentation and narrowly scoped browser interactions.

The checked-in fallback-location weather is canonical for the static page.
Browser geolocation is opt-in and calls the keyless Open-Meteo API directly,
then validates and normalizes the response before updating presentation state.
It never writes coordinates to the repository.

## Current provider status

| Domain | Provider | Credentials | Status |
|---|---|---:|---|
| Weather | Open-Meteo | None | Live adapter |
| Cricket | Realistic mock fixture | None | Replacement interface ready |
| Football | Realistic mock fixture | None | Replacement interface ready |
| Briefing | Daybreak deterministic generator | None | Active |

Mock sports data is explicitly attributed as demonstration data in the UI and
generated files. It is not presented as a production sports feed.

## Local setup

Requirements: Node.js 22+, npm, and Git.

```bash
git clone https://github.com/USERNAME/raj-intelligence-dashboard.git
cd raj-intelligence-dashboard
npm ci
cp .env.example .env.local
npm run data:refresh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For an offline deterministic refresh:

```bash
WEATHER_PROVIDER=mock npm run data:refresh
```

## Environment configuration

`.env.local` is optional and ignored by Git. The refresh script loads it when
present. Supported values are documented in `.env.example`.

| Variable | Purpose | Default |
|---|---|---|
| `DAYBREAK_LOCATION_NAME` | Fallback location label | `New York` |
| `DAYBREAK_LATITUDE` | Fallback latitude | `40.7128` |
| `DAYBREAK_LONGITUDE` | Fallback longitude | `-74.0060` |
| `DAYBREAK_TIMEZONE` | IANA timezone for Open-Meteo | `America/New_York` |
| `WEATHER_PROVIDER` | `open-meteo` or `mock` | `open-meteo` |
| `CRICKET_PROVIDER` | Current implementation: `mock` | `mock` |
| `FOOTBALL_PROVIDER` | Current implementation: `mock` | `mock` |
| `NEXT_PUBLIC_BASE_PATH` | Static project-page path at build time | Empty |
| `CRICKET_API_KEY` | Reserved for a future provider | Empty |
| `FOOTBALL_API_KEY` | Reserved for a future provider | Empty |

Do not prefix provider secrets with `NEXT_PUBLIC_`; that would include them in
browser JavaScript.

## Data refresh

```bash
npm run data:refresh
npm run data:validate
```

The refresh process is idempotent. A provider result is validated and normalized
before its file is atomically replaced. If a provider fails, Daybreak retains
the last valid content, updates its error/freshness metadata, and reports the
degraded state in `public/data/status.json`.

Generated files:

```text
public/data/weather.json
public/data/cricket.json
public/data/football.json
public/data/briefing.json
public/data/status.json
```

## Quality commands

```bash
npm run lint
npm run typecheck
npm run test:run
npm run data:validate
npm run build
```

Run the complete application gate with:

```bash
npm run check
```

Vitest watch mode is available through `npm test`. The unit suite covers provider
normalization, freshness boundaries, ranking, deterministic briefing behavior,
and last-valid preservation.

## Static build and preview

```bash
npm run build
npm run preview
```

The build must produce `out/`. The preview command serves that directory at
[http://localhost:3000](http://localhost:3000).

To reproduce the GitHub project-page path locally at build time:

```bash
NEXT_PUBLIC_BASE_PATH=/raj-intelligence-dashboard npm run build
```

The exported page will then expect to be served beneath that path.

## GitHub Pages deployment

1. Push the repository to GitHub with `main` as the default branch.
2. Open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Ensure Actions can run and the `github-pages` environment permits `main`.
5. Run **Deploy Daybreak to GitHub Pages** manually, or push to `main`.

`.github/workflows/deploy-pages.yml` installs with `npm ci`, runs linting,
type-checking, tests, and a static build, uploads `out/`, then deploys it through
the GitHub Pages deployment action. It builds with:

```text
NEXT_PUBLIC_BASE_PATH=/raj-intelligence-dashboard
```

The resulting URL is:

```text
https://USERNAME.github.io/raj-intelligence-dashboard/
```

## Scheduled refresh and repository settings

`.github/workflows/refresh-data.yml` runs every three hours at minute 17 and can
also be started manually. It refreshes providers, validates the output, commits
only changed files beneath `public/data`, and explicitly dispatches the Pages
workflow after a successful commit.

Repository requirements:

1. Under **Settings → Actions → General → Workflow permissions**, allow the
   workflow to write repository contents.
2. If `main` is protected, allow GitHub Actions to bypass the relevant rule or
   change the refresh workflow to open a pull request instead of pushing.
3. Add optional location overrides as repository **Variables**, not secrets.
4. Add provider credentials as repository **Secrets** only when real sports
   adapters are installed.

Reserved secret names:

```text
CRICKET_API_KEY
FOOTBALL_API_KEY
```

No additional deployment token or personal access token is required. The refresh
workflow receives only `contents: write` and `actions: write`; the deployment job
receives `pages: write` and `id-token: write`.

## Replacing a provider

1. Add the raw response schema beside the adapter under
   `src/providers/<domain>/<provider>/schema.ts`.
2. Implement the existing typed provider contract. Accept external payloads as
   `unknown`, validate them, then return only normalized domain models.
3. Add realistic fixtures and normalization tests. Tests must not call a live API.
4. Wire the provider selection in `scripts/refresh-data.ts` and validate required
   environment values before the first request.
5. Update `.env.example`, source attribution, this provider table, and the refresh
   workflow's secret mapping.
6. Verify a forced provider failure preserves the previous generated file.

Provider payload types must never be imported into `src/components`.

## Troubleshooting

### Static assets or JSON return 404 on Pages

Confirm the build used `NEXT_PUBLIC_BASE_PATH=/raj-intelligence-dashboard` and
that public asset URLs use the shared base-path helper. Re-run the deploy workflow
after correcting the build environment.

### Refresh succeeds but the site does not update

The refresh workflow must be allowed both to push generated files and dispatch
Actions. Check its `Commit and push changed data` and `Dispatch Pages deployment`
steps. A push made with `GITHUB_TOKEN` does not by itself start another push
workflow, which is why explicit dispatch is required.

### A provider is marked stale or failed

Inspect `public/data/status.json` and the domain file's `error` object. Daybreak
continues showing the last valid data with its original generation timestamp.
Run `npm run data:refresh` locally to reproduce the provider error.

### Build rejects generated data

Run `npm run data:validate`. The error identifies the invalid file and Zod path.
Do not bypass validation; repair the adapter or restore the last valid JSON.

### Geolocation does not run

Geolocation requires HTTPS in production or localhost during development. It is
requested only after explicit user action. Denial leaves fallback weather intact.

## Known limitations

- Cricket and football currently use demonstration fixtures until documented
  production providers and competition scopes are selected.
- A three-hour refresh cadence is a snapshot service, not a real-time score feed.
- Browser-geolocated weather is session-local and cannot update committed JSON on
  static GitHub Pages.
- Scheduled GitHub Actions may start later than their nominal cron time.
- The deterministic briefing is intentionally factual and bounded; it does not
  provide free-form analysis comparable to an LLM.

## Roadmap

1. Select licensed free-tier cricket and football providers.
2. Add configurable teams, competitions, and relevance preferences.
3. Add severe-weather emphasis and provider-supported alerts.
4. Add historical briefing snapshots without increasing client payload size.
5. Add an optional `BriefingGenerator` implementation backed by an LLM while
   retaining deterministic fallback and source grounding.
