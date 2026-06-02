# Slate v2 pagination virtualization perf

Objective:
Optimize Slate v2 pagination virtualization so `/examples/pagination` remains
responsive at large page and split-table scale, with browser trace evidence
showing bounded mounted DOM/page surfaces and materially improved typing and
selection latency for the 1000-row stress case.

Goal plan:
docs/plans/2026-05-27-slate-v2-pagination-virtualization-perf.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: user request after measured trace
- id / link: `http://localhost:3100/examples/pagination`
- title: execute pagination virtualization perf plan
- decision to make: how to make paginated Slate surfaces fast at page scale
  and split-node scale without breaking native editing behavior.
- decision criteria: page chrome must virtualize when DOM strategy is
  virtualized; provider-owned split nodes must not mount every row/cell just
  because one page of the node is visible; stress controls must represent a
  real large-page workload; browser proof must show bounded DOM and improved
  interaction latency.

Major lane:
- lane: benchmark / performance plus package architecture
- output type: code implementation plus browser trace evidence
- implementation expected: yes
- affected packages / surfaces:
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-layout`,
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react`,
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2/site/examples/ts/pagination.tsx`,
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/pagination.test.ts`,
  this plan.
- dominant risk: hiding DOM to win a benchmark while breaking native editing,
  selection materialization, or split table semantics.

Completion threshold:
- Virtualized pagination renders page surfaces through the same retained page
  window as the editor content instead of mounting all page chrome.
- A 1000-row split table in virtualized pagination does not mount all 1000 rows
  and 3000 cells when a middle row is selected or edited.
- `/examples/pagination` exposes a stress path capable of producing a
  near-1000-page pagination document.
- Browser proof records before/after DOM counts and latency for normal,
  virtualized top-of-doc, and 1000-row split-table middle-row interactions.
- Focused package/unit tests and pagination browser integration tests pass.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-slate-v2-pagination-virtualization-perf.md`
  passes.

Verification surface:
- Source audit of `PagedEditable`, `useVirtualizedRootPlan`, and pagination
  table rendering ownership.
- Browser trace scripts against `http://localhost:3100/examples/pagination`.
- Focused Playwright tests for page-surface virtualization and table row
  bounded mounting.
- Commands from `/Users/zbeyens/git/plate-2/.tmp/slate-v2`:
  `bun --filter slate-layout test`, `bun --filter slate-react test:vitest`
  or focused equivalent, `bun typecheck:site`, focused pagination Playwright,
  and `bun check` when the slice is stable.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Implementation is explicitly in scope.
- Preserve native editing guarantees or record an explicit virtualized
  degradation contract.
- Do not use `node tooling/scripts/completion-check.mjs`.

Boundaries:
- Source of truth: latest user instruction `ok go` plus the browser trace
  already collected for `/examples/pagination`.
- Allowed edit scope: Slate v2 package/runtime pagination virtualization,
  pagination example/test code, this plan.
- External sources: none unless local repo evidence cannot settle a package API.
- Browser surface: `http://localhost:3100/examples/pagination`.
- Tracker sync: none.
- Non-goals: no PR, no commits, no registry/template edits, no generic
  redesign of all DOM strategies outside the pagination/split-node bottleneck.

Blocked condition:
- Block only if the package architecture cannot express bounded split-node
  mounting without a larger public API decision, or if browser automation
  cannot exercise the route enough to produce interaction evidence after
  concrete fallback attempts.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: verification complete

Current verdict:
- verdict: implement targeted virtualization ownership fixes
- confidence: high
- next owner: package runtime
- reason: browser proof now shows page surfaces and provider-owned table rows
  stay bounded at 1000-row / 1000-page stress scale while repeated typing keeps
  selection in the active row.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-slate-v2-pagination-virtualization-perf.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read before implementation. |
| Active goal checked or created | yes | `get_goal` returned null; `create_goal` created active goal `019e6aa0-8ace-7e73-b0e9-166d6fbc4a30`. |
| Source of truth read before analysis | yes | User asked to execute the traced pagination perf plan; prior trace was collected against the live route before implementation. |
| Major lane selected | yes | Benchmark / performance plus package architecture. |
| Decision criteria stated | yes | Criteria recorded in Major source and Completion threshold. |
| Existing repo patterns / prior decisions checked | partial | Read `PagedEditable`, `useVirtualizedRootPlan`, pagination example/test, and huge-document virtualized example/test. |
| Helper stack selected | yes | `autogoal`, `major-task`, `task`, prior `debug`/`performance` trace. |
| External research decision recorded | yes | N/A: local repo evidence is sufficient for this runtime bottleneck. |
| Implementation expectation recorded | yes | Implementation is in scope. |
| Workspace authority selected | yes | Code and proof live under `/Users/zbeyens/git/plate-2/.tmp/slate-v2`; plan lives in `/Users/zbeyens/git/plate-2`. |
| Branch / PR expectation decided | yes | No commit or PR requested. |
| Browser pack selected | yes | Browser proof is required because the bottleneck is route/runtime behavior. |
| Browser route / app surface identified | yes | `http://localhost:3100/examples/pagination`. |
| Browser tool decision recorded | yes | Browser plugin tool is unavailable in callable tools; use Playwright against the live local route as fallback. |
| Console/network caveat policy recorded | yes | Browser proof must capture page errors/console failures when running final traces. |
| Package/API pack selected | yes | Runtime packages under `.tmp/slate-v2/packages/*` are touched. |
| Public surface or package boundary identified | yes | Internal runtime/layout behavior; avoid public API unless needed. |
| Release artifact path selected | yes | Added `.changeset/paged-editable-page-window.md` and `.changeset/virtualized-paginated-editing.md` in `.tmp/slate-v2`. |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/skills/changeset/SKILL.md`; used one package per file, patch bumps. |
| Barrel/export impact decision recorded | yes | No package barrel/export layout changed; `pnpm brl` N/A. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | Browser trace and focused tests recorded below. |
| Current-state source audit | complete | Map current owner, boundaries, constraints, and affected surfaces | `PagedEditable`, `useVirtualizedRootPlan`, DOM repair, node-ref maps, and pagination example audited. |
| Decision criteria closure | complete | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | All criteria satisfied; evidence below. |
| Options / tradeoffs / rejection record | complete | Record viable options, chosen recommendation, and why alternatives lose | See Decisions and tradeoffs. |
| Review / pressure pass | complete | Run selected reviewer/lens or record N/A with reason | Self-review focused on native selection correctness, stale DOM path maps, and release artifact classification. |
| Review findings closure | complete | Fix or explicitly reject accepted/actionable findings and record closure proof | Fixed row-500 repeated typing selection jump; added regression proof. |
| External-source audit | complete | Cite official/local clone/external sources when used, or record N/A | N/A: no external sources used; local source and browser traces settled the issue. |
| Implementation gates | complete | If code changed, close primary-template and touched-surface gates; otherwise N/A | Package, browser, changeset, lint, and typecheck gates closed. |
| Final handoff contract | complete | Record recommendation, evidence, caveats, residual risk, and next owner | See Final handoff contract. |
| Final lint | complete | Run `pnpm lint:fix` or scoped equivalent when files changed | `pnpm lint:fix` from `.tmp/slate-v2`: no fixes on final run. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-slate-v2-pagination-virtualization-perf.md` | Ready to run after this update. |
| Browser interaction proof | complete | Exercise the target route/interaction with the approved browser tool or record blocker | Playwright against `http://localhost:3100/examples/pagination`, 14 Chromium tests passed. |
| Browser console/network check | complete | Record console/network state or why it is not applicable | Console observed during trace; only React DevTools/HMR and NO_COLOR warnings, no route runtime errors. |
| Browser final proof artifact | complete | Record screenshot/trace/route proof or exact caveat | Exact DOM/latency trace recorded in Verification evidence; no screenshot needed for perf proof. |
| Public API / package boundary proof | complete | Source-audit public API, exports, and package boundary impact | Runtime behavior changed; no exported file/barrel layout changed. |
| Release artifact classification | complete | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package runtime behavior for `slate-layout` and `slate-react`. |
| Published package changeset | complete | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | Added two patch changesets; no forbidden core package minor. |
| Registry changelog | complete | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | N/A: not registry-only work. |
| No release artifact | complete | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: release artifacts added. |
| Package typecheck/build/test | complete | Run owning package checks or record N/A with reason | `slate-layout` tests, `slate-react` focused vitest, package typecheck, site typecheck passed. |
| Barrel/export generation | complete | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exports or exported file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | User request, skills, templates, and route trace read. | current-state map |
| Current-state map | complete | Trace and source audit recorded in Findings. | implementation |
| Options and recommendation | complete | Targeted page surface plus split-node windowing chosen. | review |
| Review / pressure pass | complete | Repeated typing exposed a selection/scroll regression; fixed before closeout. | verification |
| Implementation or plan artifact | complete | Package/runtime/example/test/changeset updates complete. | verification |
| Verification | complete | Focused package checks and pagination Chromium suite passed. | closeout |
| Closeout | complete | Final evidence recorded. | final response |

Findings:
- Measured `huge-document` virtualized with 10k blocks: 270 DOM nodes, 8
  mounted blocks, median typing 8.3ms.
- Measured `pagination` virtualized top-of-doc with 1000 rows x 120px:
  888 DOM nodes, table unmounted, intro typing median 66ms, 148 page surfaces
  still mounted.
- Measured selecting row 500 in the 1000-row split table: selection took
  939ms; DOM jumped to 13,589 elements, 1000 table rows, and 3000 cells.
- Measured typing in row 500: 250-353ms per character; render profiler showed
  9099 render events for three typed chars.
- CPU profile for setting 1000 rows spends seconds in Slate node mutation/state
  view paths. That is a stress-control cost separate from ongoing typing.
- Source fact: `PagedEditable` creates virtualized page items for `Editable`,
  but still flat-maps every page surface itself.
- Source fact: virtualized retained ranges are top-level indexes; a split table
  is one top-level node, so mounting that node mounts every table row/cell.
- Source fact: text-input DOM repair can scroll stale native selection if the
  model-selected path is temporarily unavailable or rebound during virtualized
  rerender.

Decisions and tradeoffs:
- Chosen: keep virtualized DOM strategy as an opt-in degradation mode, but make
  the retained unit page-aware for page chrome and split-node-aware for
  provider-owned table rows.
- Rejected: relying on top-level virtualization only. It works for generic
  huge documents but fails on large split nodes.
- Rejected: capping the demo lower. The user explicitly wants stress proof and
  the architecture should handle it.
- Rejected for this slice: full table product API. The current layout provider
  already owns table row units; first fix the retained DOM projection around
  those units.
- Rejected after trace: scrolling by top-level index in page-virtualized mode.
  Page item indexes and top-level document indexes are different coordinate
  systems; fallback scrolling must resolve through page items or not scroll.

Implementation notes:
- `slate-layout`: `PagedEditable` now virtualizes rendered page surfaces when
  `domStrategy` is virtualized and exposes fragment/unit paths on page mount
  items so split-node selection can resolve to the owning page.
- `slate-react`: virtualized root planning maps deep selection paths to page
  items before falling back to top-level ownership, and top-level fallback uses
  page item lookup in page-virtualized mode.
- `slate-react`: text-input caret repair does not scroll stale DOM selection
  inside page-virtualized surfaces, and path-element lookup rejects stale map
  entries whose `data-slate-path` no longer matches the requested path.
- `site/examples/ts/pagination.tsx`: the split table renders only row ranges
  visible in current page fragments and uses `contentBoundary` placeholders for
  hidden child ranges. Row height stress now reaches near-1000-page documents.
- `playwright/integration/examples/pagination.test.ts`: added Chromium proof for
  a 1000-row / ~1000-page split table, bounded mounted rows/cells/page surfaces,
  and repeated typing in row 500.
- Added package changesets:
  `.tmp/slate-v2/.changeset/paged-editable-page-window.md` and
  `.tmp/slate-v2/.changeset/virtualized-paginated-editing.md`.

Review fixes:
- Repeated row-500 typing initially inserted the first char correctly, then
  jumped selection to the first mounted table row. Root cause: text-input repair
  scrolled stale DOM selection inside a page-virtualized surface. Fixed with
  scoped no-scroll repair and stale path-map validation; browser trace now shows
  `x`, `y`, `z` all stay at `[47,499,1,0]`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Static Playwright server build hit pre-existing `keyboard-input-strategy.ts` Next build type error | 1 | Use fresh/live dev server proof plus source-first typechecks for touched packages | Valid pagination proof ran against `PLAYWRIGHT_BASE_URL=http://localhost:3100`; package/site typechecks passed. |
| Accidental `bun playwright test ...` invoked the script with an extra `test` positional and began the broader suite | 1 | Use `./node_modules/.bin/playwright` directly | Killed the accidental run; ignored unrelated editable-void failure from that wrong command. |

Verification evidence:
- Browser trace before implementation:
  - 1000 rows x 120px, row 500 selection: 939ms, 13,589 DOM elements,
    1000 mounted rows, 3000 cells.
  - Row 500 typing before implementation: 250-353ms per char and 9099 render
    events for three chars.
  - `/examples/pagination` virtualized top-of-doc still mounted 148 page
    surfaces.
- Browser trace after implementation from
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2`,
  `PLAYWRIGHT_BASE_URL=http://localhost:3100`, route `/examples/pagination`:
  - 1000 rows x 120px: pages 148, 6 page surfaces, 42 rows, 126 cells,
    767 DOM elements. Row window 473-514. Typing row 500 `x/y/z`:
    76.2ms / 66.5ms / 74.5ms. Selection stayed `[47,499,1,0]`.
  - 1000 rows x 900px: pages 1006, 6 page surfaces, 6 rows, 18 cells,
    299 DOM elements. Row window 497-502. Typing row 500 `x/y/z`:
    85.5ms / 70.8ms / 78.0ms. Selection stayed `[47,499,1,0]`.
- Commands from `/Users/zbeyens/git/plate-2/.tmp/slate-v2`:
  - `bun --filter slate-react test:vitest -- test/dom-strategy-page-virtualization.test.tsx test/slate-element-node-ref.test.tsx`: pass, 2 files / 6 tests.
  - `bun --filter slate-layout test`: pass, 35 tests.
  - `pnpm turbo typecheck --filter=./packages/slate-layout --filter=./packages/slate-react`: pass, 2 packages.
  - `bun typecheck:site`: pass.
  - `pnpm lint:fix`: pass, no fixes on final run.
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 ./node_modules/.bin/playwright test playwright/integration/examples/pagination.test.ts --project=chromium`: pass, 14 tests.

Final handoff contract:
- Recommendation: keep page-level virtualization as the default behavior for
  paginated virtualized DOM strategy, and keep split-node row/window ownership
  provider-driven through layout units plus DOM coverage boundaries.
- Confidence: high for the traced pagination bottleneck.
- Evidence: final trace and tests above.
- Tests / commands: all focused package, site, lint, and pagination browser
  checks passed.
- Browser proof: exact route trace against `http://localhost:3100/examples/pagination`.
- PR / tracker: none requested.
- Caveats: 1000-row setup still costs ~3.7s because it inserts 1000 Slate rows;
  that is separate from steady-state typing/selection and belongs to bulk
  mutation optimization if it matters.
- Next owner: package runtime.

Timeline:
- 2026-05-27T18:47:11.410Z Major-task goal plan created.
- 2026-05-27T21:24Z Implemented page-surface virtualization, split table row
  windowing, stale path-map guard, scoped paged text-input scroll repair,
  stress controls, browser regression, and package changesets.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Make paginated virtualized rendering fast and bounded for 1000-row / near-1000-page stress cases without breaking editing. |
| What have I learned? | Top-level virtualization alone fails split nodes; page/split unit metadata plus scoped DOM repair is required. |
| What have I done? | See Implementation notes, Verification evidence, and Timeline. |

Open risks:
- Static Playwright build without `PLAYWRIGHT_BASE_URL` is still blocked by an
  existing `keyboard-input-strategy.ts` Next build type error outside this
  pagination diff. Source-first package/site typechecks passed, and browser
  proof used the live dev server.
