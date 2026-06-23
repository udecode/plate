# pagination virtualized overscan control

Status: done

Objective:
- Add virtualized pagination tuning controls to `/examples/pagination`.
- Keep the route URL-backed so stress/perf states are shareable.
- Prove the 1000-page stress fixture remains bounded while overscan changes retained DOM.

Source:
- User asked for more virtualized controls, specifically around how many pages are visible at a time.

Decision:
- Add `pageOverscan` as the user-settable control.
- Keep visible page count derived from viewport/page layout and show it in the meta line.
- Do not add a "render N pages" control; that fights viewport math.
- Keep `stress_pages` as the document scale control.
- Feed the same virtualized overscan into `PagedEditable` page-surface windowing so the example control changes both page shells and editable DOM.

Changed:
- `page_overscan` URL state added to pagination controls.
- Virtualized DOM strategy now receives `overscan: pageOverscan`.
- `plite-layout` page-surface virtualization now derives overscan from the virtualized DOM strategy.
- Toolbar shows `Page overscan` only when DOM strategy is `virtualized`.
- Meta line shows `page overscan` and derived `visible pages`.
- Added `.changeset/paged-editable-virtualized-overscan.md`.
- Query-controls spec loads/stores `page_overscan`.
- Pagination stress spec proves `pageOverscan=4` increases retained pages/DOM, stays bounded, and preserves the table editing proof.

Verification:
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/pagination.test.ts playwright/integration/examples/query-controls.test.ts --project=chromium`
  - Result: 20 passed.
- `bun typecheck:site`
  - Result: passed.
- `bun --filter plite-layout typecheck`
  - Result: passed.
- `bunx tsc --noEmit --project tsconfig.json --pretty false`
  - Result: passed.
- `bun lint:fix`
  - Result: passed, formatted 1 file.
- `bun lint`
  - Result: passed after formatting rerun.
- `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local`
  - Result: no stdout and did not complete; killed stale/local autoreview processes.
- `perl -e 'alarm 60; exec @ARGV' /Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local`
  - Result: no stdout before alarm; killed leftover autoreview child process.

Browser proof:
- Focused Chromium Playwright exercised `/examples/pagination` with `strategy=virtualized`, `page_overscan`, the 1000-page stress fixture, and the 10-page table editing path.
- In-app Browser tool was not exposed by tool discovery in this turn, so browser proof is Playwright-owned.
- Manual Playwright sanity for `http://localhost:3100/examples/pagination?strategy=virtualized&page_overscan=4` showed `page overscan 4`, `stress pages 990`, `pages 1005`, and `12` page surfaces.

Notes:
- With the default stress fixture the route reports about `1005` pages and `11` table pages.
- The visible page count is derived; overscan controls extra retained virtualized pages/DOM around the viewport.

Completion:
- Goal threshold satisfied.
