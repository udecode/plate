# Pagination Virtualized Stress Fixture

Status: done

Objective: make `/examples/pagination` show a realistic virtualized stress document: about 1000 pages total, with the rich table spanning about 10 pages, while keeping mounted DOM bounded.

Source of truth:
- User request: "when virtualized i want to see huge document with ~1k page, a table going spanning 10 pages"
- Workspace: `/Users/zbeyens/git/plate-2/Plate repo root`
- Browser surface: `http://localhost:3100/examples/pagination`

Decision:
- Keep this in the pagination example, not `slate-layout` package internals.
- Use fixed-height `pagination-stress-page` blocks appended after the editable rich fixture when `DOM strategy = virtualized`.
- Keep the table as one Slate table subtree and size its default rows to span roughly 10 pages at normal row height.
- Add a URL-backed `stress_pages` control shown only for virtualized mode.
- Show `table pages` and `stress pages` in the example meta row so the scale is visible without devtools.

Changed behavior:
- Default table rows: `240`, producing `table pages 11` in the current A4 fixture.
- Virtualized stress pages: `990`, producing `pages 1005` with the default fixture.
- Page virtualization keeps the initial mounted surface bounded: 4 page surfaces and under 1000 DOM elements before jumping into the table.
- Selecting a table row in the virtualized table mounts only the relevant page window, not all 240 rows.

Verification:
- `bun typecheck:site`
- `bunx tsc --noEmit --project tsconfig.json --pretty false`
- `bun lint:fix`
- `bun lint`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/pagination.test.ts playwright/integration/examples/query-controls.test.ts --project=chromium`

Result:
- 20 focused Chromium tests passed.
- The new stress test verifies 950-1050 total pages, 8-12 table pages, at least 900 stress pages, page virtualization enabled, and bounded mounted DOM.
- Autoreview was attempted with `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local` from `Plate repo root`; it produced no stdout for several minutes and was stopped. Manual closeout used source inspection plus the focused browser/typecheck/lint proof above.
