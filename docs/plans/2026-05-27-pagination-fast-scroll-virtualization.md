# pagination fast scroll virtualization

Status: done

Objective:
- Fix fast-scroll stalls on `/examples/pagination` with `strategy=virtualized`.
- Keep the 1000-page stress document and 10-page table bounded during fast jumps.
- Prove the fix with browser interaction metrics, DOM budgets, focused Playwright coverage, typecheck, lint, and package release artifact.

Source:
- User report: fast scrolling in the virtualized pagination example breaks because rendering takes too long.

Root cause:
- `PagedEditable` page-surface overscan used a broad implicit viewport buffer.
- Table row materialization followed that broad page window.
- A fast jump into the table mounted up to `240` rows / `720` cells and produced a local worst frame around `200ms`.

Fix:
- Interpret virtualized page overscan literally for page-surface windowing.
- Keep table layout units constrained to the actual visible content range.
- Retain selected unit paths so programmatic selection/editing still materializes the selected row.
- Keep the `page_overscan` control and route state from the prior slice.

Changed:
- `packages/slate-layout/src/react.tsx`
  - Derives page-surface overscan from virtualized DOM strategy.
  - Removes the extra implicit page-sized overscan buffer.
  - Adds visible-content-range unit filtering.
  - Keeps selected unit paths mounted even outside the visible range.
- `playwright/integration/examples/pagination.test.ts`
  - Adds a fast-jump regression asserting bounded rows, cells, DOM, and page surfaces.
- `.changeset/paged-editable-virtualized-overscan.md`
  - Patch changeset for `slate-layout`.

Performance proof:
- Before fix, local jump through the stress route hit about `200ms`, with `240` rows / `720` cells / `3360` elements.
- After fix, `page_overscan=1` fast-jump sweep over `81` scroll positions:
  - p95: about `24ms`
  - max local jump: about `99ms`
  - max rows: `34`
  - max cells: `102`
  - max DOM elements: `678`
  - max page surfaces: `8`

Verification:
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/pagination.test.ts --project=chromium --grep "1000-page"`
  - Result: 1 passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/pagination.test.ts playwright/integration/examples/query-controls.test.ts --project=chromium`
  - Result: 20 passed.
- `bun --filter slate-layout typecheck`
  - Result: passed.
- `bun typecheck:site`
  - Result: passed.
- `bunx tsc --noEmit --project tsconfig.json --pretty false`
  - Result: passed.
- `bun lint:fix`
  - Result: passed; formatted one file.
- `bun lint`
  - Result: passed.
- `perl -e 'alarm 60; exec @ARGV' /Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local`
  - Result: no stdout before alarm; no leftover autoreview process remained.

Browser note:
- Tool discovery did not expose the in-app Browser control, so browser proof is Playwright-owned against `http://localhost:3100/examples/pagination`.

Performance lane:
- repeated unit: page surfaces and table rows/cells.
- budget: stress route should stay under 80 mounted table rows / 240 cells during a fast jump with default overscan.
- interaction: fast scroll/jump through 1000-page route.
- memory/DOM tag: DOM element count, page surfaces, mounted rows, mounted cells.
- degradation contract: virtualized mode keeps off-viewport content out of native DOM; selected paths are retained for editing.

Completion:
- Goal threshold satisfied.
