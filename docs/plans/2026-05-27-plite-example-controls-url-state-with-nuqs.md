# Plite example controls URL state with nuqs

Status: done

Objective: install `nuqs` in `Plate repo root` and make shareable example controls read from and write to the URL query string.

Source of truth:
- User request: "install nuqs, so controls of any example is stored in url. scan each example to use nuqs where relevant."
- Workspace: `/Users/zbeyens/git/plate-2/Plate repo root`

Decision:
- Use one app-level `NuqsAdapter` in `site/pages/_app.tsx`.
- Use `useQueryState` / `useQueryStates` directly in examples instead of another app state abstraction.
- Add one tiny helper for bounded integer parsers so URL input cannot request impossible row/page sizes.
- Keep editor content, document model state, and transient diagnostics out of query params.

Migrated examples:
- `android-tests`: selected test case via `?test=...`; removed hash state.
- `decorations-async`: decoration source via `?source=prop|hook`; removed manual `URLSearchParams`.
- `dom-coverage-boundaries`: hidden boundary toggles via `?outer_hidden=false` style params.
- `hidden-content-blocks`: accordion/collapsible/tab/policy controls via query params.
- `huge-document`: performance controls via the existing query key shape, now nuqs-owned.
- `pagination`: preset, margins, DOM strategy, row count/height, media split/height, page layout, debug via query params.
- `search-highlighting`: search text via `?q=...`.

Scanned and intentionally skipped:
- Document/content state examples such as `document-state`, `embeds`, `check-lists`, `code-highlighting`, `tables`, and `multi-root-document`: their controls mutate the editor model or state-field demo itself.
- Transient runtime examples such as `mentions`, `linting`, and `comment-mode`: local counters, popup search, or diagnostics are not shareable setup controls.

Verification:
- `bun typecheck:site`
- `bunx tsc --noEmit --project tsconfig.json --pretty false`
- `bun lint:fix`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/query-controls.test.ts playwright/integration/examples/decorations-async.test.ts playwright/integration/examples/huge-document.test.ts --project=chromium`

Result:
- 15 focused Chromium integration tests passed.
- No manual example URL parsing remains under `site/examples/ts`.
- No package changeset needed: this is private site/example tooling plus test coverage, not a published package API or runtime delta.
