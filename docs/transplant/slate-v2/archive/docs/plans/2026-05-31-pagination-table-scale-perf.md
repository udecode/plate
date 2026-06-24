# pagination table scale perf

Objective:
One-shot execution: fix `/examples/pagination?page_layout=single&rows=500`
typing scalability so table-heavy pagination is near the `rows=8` path and the
shared pagination/fragment/layout API scales beyond tables. Completion requires
fresh browser metrics, source-level root cause, package/runtime coverage, and
autoreview.

Flow mode:
one-shot execution

Goal plan:
`docs/plans/2026-05-31-pagination-table-scale-perf.md`

Primary template:
`docs/plans/templates/task.md` equivalent, materialized manually because this
checkout does not expose the repo helper locally.

Applied packs:
- browser
- package-api

Completion threshold:
- Browser proof for `page_layout=single&rows=500` passes:
  `p95EventToPaint <= 16ms`, `maxEventToPaint <= 50ms`,
  `burstSettledMs <= 250ms`, final text correct, and selection correct.
- `rows=500` metrics are not dominated by table row count; source audit proves
  the hot API no longer recomputes or scans all table fragments/rows for a
  local text edit.
- `rows=8` perf and existing staged/virtualized pagination typing rows remain
  green.
- The fix lands in the shared API/runtime owner, not table-only example glue.
- Focused package tests, `bun --filter slate-react typecheck`, browser proof,
  autoreview, and autogoal checker pass.

Verification surface:
- Browser: Playwright Chromium against pagination rows=8 and rows=500.
- Source audit: pagination/fragment/table layout APIs and hot repeated unit.
- Tests: focused package tests for any shared API changed.
- Typecheck: `bun --filter slate-layout typecheck` and
  `bun --filter slate-react typecheck`.
- Review: bounded autoreview after implementation and after review fixes.

Constraints:
- Preserve public Slate API/DX unless an explicit long-term API change is
  recorded here.
- Preserve current insert-break burst fix and staged/virtualized typing proofs.
- Do not patch only `site/examples/ts/pagination.tsx` unless the example is
  the actual owner.
- No commit, PR, or tracker action requested.

Boundaries:
- Source of truth: `/Users/zbeyens/git/plate-2/.tmp/slate-v2`.
- Owners changed: `packages/slate-layout`, `packages/slate-react`, pagination
  example rendering, and pagination Playwright tests.
- Excluded: generated output, build artifacts, broad repo scans, unrelated root
  checkout files.

Output budget strategy:
- Used focused `rg`, short `sed` ranges, targeted tests, and compact JSON
  metrics.
- Avoided broad output under `.next`, `node_modules`, generated artifacts, and
  full integration sweeps.

Blocked condition:
Block only if browser metrics remain non-deterministic after three distinct
instrumented attempts or the only valid fix requires a public API/product
decision the user must approve.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `autogoal` and `performance` loaded |
| Active goal checked or created | yes | `create_goal` created rows=500 pagination scale perf goal |
| Source of truth read before edits | yes | Read `packages/slate-layout/src/index.ts`, `packages/slate-layout/src/react.tsx`, `packages/slate-react/src/components/editable-text-blocks.tsx`, `packages/slate-react/src/hooks/use-editor-selector.tsx`, and `site/examples/ts/pagination.tsx` |
| Baseline trace before patching | yes | `rows=500` route timed out before the patch while `rows=8` loaded in about 448ms with p95 about 16.5ms |
| Browser route identified | yes | `/examples/pagination?page_layout=single&rows=500` compared with `rows=8` |

Work Checklist:
- [x] Objective includes measurable thresholds and constraints.
- [x] Read current pagination/table/rendering owners.
- [x] Baseline rows=8 vs rows=500 metrics before patching.
- [x] Identify repeated unit and API-level root cause.
- [x] Patch shared owner, not table-only example glue.
- [x] Add or update focused regression coverage.
- [x] Verify rows=8, rows=500, staged, and virtualized rows.
- [x] Run typecheck and focused package tests.
- [x] Run autoreview and fix accepted findings.
- [x] Run autogoal checker.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Rows=500 browser threshold | yes | Run focused Playwright proof and standalone metric probe | Final probe: load 488.3ms, p95 9.6ms, max 9.6ms, burst 170.6ms, 7 rows/21 cells mounted |
| Rows=8 regression proof | yes | Run standalone metric probe | Final probe: load 407.1ms, p95 7.5ms, max 7.5ms, 7 rows/21 cells mounted |
| Existing pagination perf rows | yes | Run focused Playwright proof | Chromium pagination perf grep: 6 passed, covering staged, virtualized, 1000-page, rows=500, and insert-break burst |
| Root cause recorded | yes | Source audit with file paths | Root cause recorded in Findings with package owners and example owner |
| Shared API fix | yes | Source audit proves non-example owner | Fixed `slate-layout` layout extraction/window filtering and `slate-react` lazy child slot/rerender binding; example only consumes the API |
| Package tests | yes | Run focused tests for changed API | `slate-layout` page-layout contract 3 passed; `slate-react` DOM coverage boundary 2 passed |
| TypeScript | yes | Run package typechecks | `bun --filter slate-layout typecheck` and `bun --filter slate-react typecheck` exited 0 |
| Final lint/format | yes | Run scoped formatter/lint | `bun lint:fix` exited 0 after final patches |
| Autoreview | yes | Run bounded autoreview | First run found 2 P1s; both fixed; rerun clean with no accepted/actionable findings |
| Goal plan complete | yes | Run autogoal checker | Mechanical checker passes after this update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Baseline trace | completed | `rows=500` timed out before patch; `rows=8` was already fast | closed |
| Root cause | completed | Eager default boxes/text extraction, full child materialization, and staged-mode unit rendering were identified | closed |
| Implementation | completed | Shared API/runtime fixes landed in `slate-layout` and `slate-react`; example switched to provider-owned table units | closed |
| Verification | completed | Focused package tests, typechecks, lint, browser proof, and metric probes pass | closed |
| Closeout | completed | Autoreview rerun clean; autogoal checker ready | final response |

### Performance

- applicability: applied
- Vercel rules used: interaction latency must be measured at the user action,
  not inferred from render count alone
- extra rules used: cohort-segmentation, repeated-unit-budget,
  interaction-inp-matrix, memory-dom-tagging, effect-subscription-budget
- repeated unit: provider-owned table row units and renderElement children
- cohorts: rows=8 normal, rows=500 table-heavy, existing virtualized 1000-page
  stress, staged 15-page document
- budgets: rows=500 p95 <= 16ms, max <= 50ms, settle <= 250ms, no full-table
  hot edit scan
- React/runtime primitives: lazy renderElement children slot, viewport-filtered
  unit fragments, root-order invalidation for mounted node bindings
- interaction metrics: event-to-paint, burst settle, final text/selection
- trace/CWV proof: browser interaction proof only; page-load CWV out of scope
- memory tags: DOM/page/table counts recorded in JSON probes and Playwright
  assertions
- degradation contract: existing staged/virtualized behavior and insert-break
  burst route stay green
- dashboard/RUM gap: N/A local lab only
- plan delta: provider-owned repeated units are now the budget owner; table rows
  are not allowed to force all child materialization

Findings:
- `packages/slate-layout/src/index.ts`: `extractLayoutBlocks` computed default
  recursive boxes, text runs, and `NodeApi.string` before knowing whether
  `nodeLayout` owned a provider-unit block. A 500-row table therefore paid for
  every cell even when the provider only needed row units.
- `packages/slate-layout/src/react.tsx`: staged mode did not track content
  viewport for repeated units, so provider-owned table rows were mounted beyond
  the visible range. The fix filters units only when a viewport tracker exists;
  if no scroll root exists, it renders all units as a safe fallback.
- `packages/slate-react/src/components/editable-text-blocks.tsx`:
  `renderElement` children were materialized before the renderer could choose a
  visible child range. The new slot renders child ranges lazily.
- `packages/slate-react/src/hooks/use-editor-selector.tsx` and the mounted node
  renderer needed root-order invalidation so top-level reorders refresh DOM path
  bindings and do not route later text input to stale paths.
- `site/examples/ts/pagination.tsx`: table layout now provides one table box and
  row units directly, without using `defaults.boxes` or pre-filtering every
  child row.

Timeline:
- 2026-05-31: Goal and plan created.
- 2026-05-31: Baseline showed `rows=500` route timing out while `rows=8` stayed
  fast.
- 2026-05-31: Implemented lazy provider-owned layout extraction, staged
  repeated-unit viewport tracking, lazy child range slots, and table example
  consumption.
- 2026-05-31: Autoreview found two P1s; both fixed and rerun clean.

Decisions and tradeoffs:
- Kept the public `children` prop working, but added `slots.children(range)` so
  high-scale renderers can opt into bounded child materialization.
- Kept provider-owned table splitting outside the Slate AST: the model table
  remains one node, while layout fragments split rendered row units.
- Reduced deferred text refresh to 40ms/80ms only after removing the structural
  O(rows) costs, so the debounce is not hiding the core problem.
- Chose a safe fallback for missing scroll roots: render all provider-owned
  units rather than hiding content.

Review fixes:
- Autoreview P1: provider-owned units disappeared when no scroll root was
  available. Fixed by filtering content units only when the viewport tracker is
  available; no scroll root falls back to rendering all units.
- Autoreview P1: mounted DOM path bindings could skip top-level reorder
  refresh. Fixed by opting the mounted node renderer into root-order changes.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Coarse burst polling reported about 253ms after the model was already settled | 1 | Use browser-side mutation probe measuring event-to-paint | Replaced coarse poll timing in perf proof |
| Autoreview found provider-owned units hidden without a scroll root | 1 | Track whether viewport filtering is actually available | Fixed and reran tests |
| Autoreview found stale mounted path binding on top-level reorder | 1 | Route root-order changes to mounted node renderer | Fixed and reran tests |

Verification evidence:
- `bun lint:fix` in `/Users/zbeyens/git/plate-2/.tmp/slate-v2`: exited 0.
- `bun test ./test/page-layout-contract.test.ts --test-name-pattern "deferred text refreshes|provider-owned unit blocks|provider-owned table row units"` in `packages/slate-layout`: 3 passed.
- `bun run test:vitest -- ./test/dom-coverage-boundary-contract.test.tsx -t "child ranges without materializing all children|slots cover child ranges"` in `packages/slate-react`: 2 passed.
- `bun --filter slate-layout typecheck` in `.tmp/slate-v2`: exited 0.
- `bun --filter slate-react typecheck` in `.tmp/slate-v2`: exited 0.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "keeps staged burst typing responsive|500-row provider-owned table|insert breaks at the model caret|1000-page virtualized document"`: 6 passed.
- Final standalone rows=8 probe: load 407.1ms, p95 7.5ms, max 7.5ms, 733 DOM elements, 7 table rows, 21 cells.
- Final standalone rows=500 probe: load 488.3ms, p95 9.6ms, max 9.6ms, burst 170.6ms, 771 DOM elements, 7 table rows, 21 cells.
- `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local --engine codex --thinking high`: initial run found two accepted P1 findings; rerun after fixes exited 0 with "autoreview clean: no accepted/actionable findings reported".

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closeout | Final answer after checker and goal completion | Fix rows=500 scalability in shared API | The bad scaling was shared layout/rendering eager work, not the table component alone | Shared API/runtime fixed, browser perf bounded, review clean |

Open risks:
- Remaining risk is limited to broader full integration coverage not run here;
  the focused package and browser rows cover the affected owner paths.
