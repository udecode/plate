# Plite provider-owned page layout fragments

Objective:
Close the Plite Plan for provider-owned paginated layout fragments: define the
best long-term API, DX, runtime architecture, example target, and robust TDD
plan for multi-page tables and media-like boxes without splitting the canonical
Plite AST and without adding raw Plite product table packages.

Goal plan:
docs/plans/2026-05-26-plite-provider-owned-page-layout-fragments.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- slate-plan

Completion threshold:
- Plite Plan closure is legal only when score >= 0.92, no dimension is below
  0.85, every pass row is complete or intentionally skipped with evidence,
  issue/reference sync rows are closed, final handoff is emitted, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-plite-provider-owned-page-layout-fragments.md` passes.
- Planning creates the accepted API/architecture/TDD/example plan only.
  `Plate repo root` implementation starts after user review and a second
  explicit `plite-plan` execution invocation.

Verification surface:
- Planning checks run in `plate-2`.
- Plite source/runtime/API claims cite and verify the live `Plate repo root`
  workspace.
- Current pass verification: `cwd=Plate repo root`, command
  `bun --filter ./packages/plite-layout test`, result: pass, 31 tests.
- Execution verification target: focused `plite-layout` unit tests,
  `plite-react` layout/render tests, `/examples/pagination` Playwright rows,
  package typecheck, and the broadest feasible `Plate repo root` gate for touched
  packages.

Constraints:
- Planning mode may edit only `docs/plans/**`, `docs/research/**`,
  `docs/plite-issues/**`, `docs/plite/ledgers/**`, and
  `docs/plite/references/**`.
- Keep raw Plite unopinionated. Plate/app packages own table commands, table
  maps, cell-selection UX, Markdown syntax, GFM, menus, and product behavior.
- The canonical document AST stays semantic. Pagination layout fragments must
  not rewrite one table node into many table nodes.
- Example code should show the public call-site shape first. Helpers are fine
  only when they explain the API, not when they hide it.

Boundaries:
- In scope: `plite-layout` layout provider protocol, derived fragments, page
  projection, `PagedEditable` layout consumption, `/examples/pagination`
  multi-page table fixture, robust TDD plan, page-level virtualization
  interaction, and collaboration/export metadata shape.
- Non-goals: shipping raw Plite table/Markdown product packages, table editing
  commands, cell selection UX, table-map algorithms, browser print/export
  parity, and current-version Plate/slate-yjs adapters.
- Allowed current-state source reads: `packages/plite-layout/**`,
  `packages/plite-react/**`, `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx`,
  `apps/www/tests/plite-browser/donor/examples/pagination.test.ts`, local
  `../tiptap-docs`, and compiled research under `docs/research/**`.

Blocked condition:
- Block only if the same missing external/user decision prevents progress for
  three consecutive goal turns and no source read, research pass, issue-ledger
  pass, objection pass, or plan-hardening move remains runnable.

Plite Plan lane state:
- slate_plan_lane_status: complete
- current_pass: closure-score-and-final-gates
- current_pass_status: complete
- next_pass: none
- next_action: user review; execution starts only after explicit accepted-plan
  invocation
- final_handoff_status: complete

Current verdict:
- verdict: user-review-ready plan; execute only after explicit acceptance
- confidence: 0.93 after closure score and final gates
- keep / cut / revise call: keep `plite-layout`, `usePliteLayout`,
  `PagedEditable`, page/spread virtualization, and opt-in `pageBreaks`; revise
  shallow `boxes` into a provider-owned node layout and fragment protocol; cut
  raw Plite TableKit/product table packages.
- reason: current source already has box kinds, split vocabulary, provider
  injection, page fragments, page mount plans, and tests, but actual pagination
  still consumes line counts and only honors block-level avoid splitting. Real
  table row pagination needs provider-owned measured units/fragments.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every Plite Plan
  completion gate below is satisfied and the check-complete command passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | complete | `plite-plan` loaded from `.agents/skills/slate-plan/SKILL.md` |
| Active goal checked or created | complete | `get_goal` returned null; `create_goal` created this lane |
| Source of truth read before edits | complete | live `Plate repo root` source and compiled research read |
| `docs/solutions` checked for non-trivial existing-code work | complete | `docs/solutions/developer-experience/2026-05-22-raw-slate-should-not-own-markdown-table-product-packages.md` read |
| Live `Plate repo root` grounding needed for current-state claims | complete | `bun --filter ./packages/plite-layout test` passed in `Plate repo root` |

Work Checklist:
- [x] Objective includes lane outcome, full pass schedule, one-pass-per-
      activation policy, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] One-pass-per-activation policy respected for this activation.
- [x] Live source grounding recorded for current implementation claims.
- [x] Related issue discovery / ClawSweeper reuse recorded with concrete
      evidence.
- [x] Issue-ledger pass completed with current ledger/reference evidence.
- [x] Final issue sync accounting complete after later revisions, or skipped
      with concrete evidence.
- [x] Intent/boundary record and decision brief complete.
- [x] Research/ecosystem/live-source refresh complete for Pretext, Tiptap Pages,
      TanStack Virtual, and current `Plate repo root` layout source.
- [x] Pressure passes complete for performance, DX, migration, regression, and
      simplicity.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence.
- [x] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Plite maintainer objection ledger complete for every breaking/paradigm
      change, or marked N/A with reason.
- [x] Verification workspace gate recorded for current Plite source claims.
- [x] TDD used for behavior/proof changes with a sane test surface, or marked
      N/A with reason.
- [x] Browser proof captured for browser-surface claims, or marked N/A with
      reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | run planning and Plite gates named here | current `Plate repo root` source gates rerun and passed; final planning check queued in this closure pass |
| Plite source, runtime, browser, package, public API, or issue-fix claim | yes | record live `Plate repo root` command/proof | closure rerun passed `bun --filter ./packages/plite-layout test` and focused `plite-react` virtualized/degraded DOM tests; browser-specific execution claims remain queued, not promoted |
| Issue ledger or PR reference changed | yes | run related issue discovery and sync references if claim/API narrative changes | issue matrix, manual sync ledger, and PR reference updated with 2026-05-26 no-claim accounting for `nodeLayout`, fragment access, no public `boxes`, no public render-prop path, no raw TableKit, no AST split, and degraded/native-incomplete virtualization |
| Autoreview for uncommitted implementation changes | no for planning pass | execution mode will load autoreview for non-trivial `Plate repo root` edits | N/A planning-only |
| Final user-review handoff | yes | emit final handoff only after closure pass | final handoff section is complete and names accepted API, hard cuts, non-claims, proof gates, and execution queue |
| Goal plan complete | yes | run check-complete only after closure gates | `check-complete` passed after closure gates |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | live source, research, solutions, and `plite-layout` tests read | related issue discovery |
| Related issue discovery | complete | reused 2026-05-25 Pretext Pagination / Page Virtualization Feedback sync; live rows read for `#5944`, `#5924`, `#790`; no broad live GitHub crawl needed | issue-ledger pass |
| Issue-ledger pass | complete | verified issue matrix, v2 sync ledger, fork dossier, and PR reference already cover provider/split protocols, no fixed/improved claims, and proof gates | intent/boundary pass |
| Intent/boundary and decision brief | complete | raw Plite owns derived layout contract, providers own schema measurement/split policy, `nodeLayout` wins, `boxes` is not public beta API | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | local Pretext source, local Tiptap Pages docs, TanStack Virtual research, live `Plate repo root` source/tests refreshed; `nodeLayout` still wins | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | pressure pass added O(1) fragment lookup, page/spread budgets, pathless renderer hook, Plate/slate-yjs migration boundaries, vertical TDD queue, and simplicity cuts | objection ledger |
| Plite maintainer objection ledger | complete | steelmanned objections for `nodeLayout`, pathless fragment lookup, optional `pageBreaks`, page/spread virtualization, no TableKit, no AST split, Pretext drift, and provider cache purity | high-risk pass |
| High-risk deliberate mode | complete | duplicate editable DOM rejected, repeated headers excluded from first execution slice, virtualized DOM native-surface limits recorded, model-backed copy/materialize proof required, IME/selection retention and collab/export authority guards tightened | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | Pretext caveat kept precise, Tiptap TableKit framed as valid product-extension evidence but not a raw Plite model, TanStack kept internal, Premirror kept as derived-layout inspiration only | revision pass |
| Revision pass | complete | final API wording normalized, `usePliteLayoutFragments()` name accepted, repeated headers removed from first-slice example controls, Tiptap respectful-divergence wording reconciled, issue/reference sync queued and later closed by accounting pass | issue sync accounting |
| Issue sync accounting | complete | added 2026-05-26 no-claim accounting to issue matrix and manual sync ledger; synced PR reference to the final public API target | closure score and final gates |
| Closure score and final gates | complete | final score is above threshold, browser proof is N/A for planning-only claims, user-review handoff is recorded, and final planning check is the closure proof | none |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.93 | Closure keeps provider output cache-pure, pathless fragment lookup O(1), Pretext text measurement outside hot React render, TanStack internal only, page/spread mount planning already covered by current tests, and native/browser claims explicitly degraded until proof. |
| Plite-close unopinionated DX | 0.20 | 0.94 | Public target is one Plite-shaped entrypoint plus one provider callback and one pathless renderer hook; tools get explicit `layout.getFragments(path)`. Public `boxes`, render-prop path, raw TableKit, duplicated example route, and AST splitting are cut. |
| Plate and slate-yjs migration backbone | 0.15 | 0.92 | Raw Plite owns derived layout fragments; Plate/app packages own table/media policy; slate-yjs syncs semantic AST only; optional `pageBreaks` carries accepted fragment/page metadata with profile/version for stricter collab/export. |
| Regression-proof testing strategy | 0.20 | 0.92 | Closure separates current proof from execution proof: current layout/React high-risk tests pass, and execution TDD rows cover no AST split, multi-page table rows, oversized media policy, duplicate editable DOM, IME/composition, copy/materialization, and virtualized native-surface metrics. |
| Research evidence completeness | 0.15 | 0.94 | Plan synthesizes current `Plate repo root` source/tests, local Pretext canvas/profile caveats, local Tiptap Pages failure taxonomy and TableKit boundary, TanStack range-engine evidence, Premirror derived-page framing, and issue/reference accounting. |
| shadcn-style composability and minimalism | 0.10 | 0.90 | Example scope is restrained to existing `/examples/pagination` with rows, row height, media height/overflow, DOM strategy, and page view controls; no decorative route, table toolbar, or header-repeat control in the first execution slice. |

Initial weighted score: 0.742
Current weighted score after research refresh: 0.751
Current weighted score after pressure pass: 0.855
Current weighted score after maintainer objections: 0.858
Current weighted score after high-risk deliberate mode: 0.873
Current weighted score after ecosystem maintainer pass: 0.884
Current weighted score after revision pass: 0.894
Current weighted score after issue sync accounting: 0.894
Final weighted score after closure gates: 0.927

Source-backed architecture north star:
- target shape: `plite-layout` owns derived node layout plans and page
  fragments; app/Plate providers own measurement and split policy for tables,
  media, callouts, figures, and other structured boxes; `plite-react` consumes
  the fragment plan without rewriting the Plite AST.
- source evidence: current box kinds and split vocabulary exist at
  `packages/plite-layout/src/index.ts:105-120`; provider
  injection exists at `:134-139`; extraction stores boxes at `:1371-1406`;
  pager still line-paginates at `:1970-2027`.
- rejected drift: do not copy Tiptap's CSS-float page gap strategy; do not ship
  a raw Plite `TableKit`; do not make user renderers split AST nodes.
- migration posture: raw Plite provides generic layout substrate; Plate/app
  packages bind schema-specific table/media behavior.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| `usePliteLayout` options | replace public `boxes` with `nodeLayout({ element, path, defaults, pageSettings, measurementProfile }) => PliteNodeLayoutPlan` | one function, Plite path/element terms, no product registry, no current-page cursor | alpha hard cut before beta; an internal adapter is acceptable for local churn, not documented API | current `boxes` at `src/index.ts:355-374` | replace |
| Node layout plan | `{ kind: 'text' }`, `{ kind: 'box', size, split }`, `{ kind: 'units', units, split }` | providers describe measured units; core paginates units | AST stays semantic; provider output is derived | current `SlatePageLayoutBox` too shallow at `src/index.ts:115-120` | add |
| Table provider | app/Plate provider returns row units with row heights, cell rects, header metadata, and overflow policy | no raw TableKit; example can inline a minimal provider | Plate can later replace the example provider with real table measurement | solution note and PR reference table boundary | add |
| `PagedEditable` render access | expose package-owned layout context/hook for the current element's fragments instead of reading `data-plite-path` manually | renderers call `usePliteLayoutFragments()`; tools can call `layout.getFragments(path)` | regular `Editable` remains usable without pagination; `RenderElementProps` still does not expose `path` | current example path map at `pagination.tsx:434-456`; render-prop path solution note; surface contract | revise |
| `pageBreaks` | keep opt-in strict-fidelity snapshot with measurement profile and fragment identity | collab/export users can choose authority; default stays local | no cross-client break promise by default | `src/index.ts:304-344`, Pretext research | keep |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Measurement | `pretextPageLayoutEngine` | Pretext for text; providers for structured unit measurement | DOM reflow hot path and fake deterministic claims | research page and `src/index.ts:1601-1933` | keep/revise |
| Pagination | `paginateSlatePageLayoutBlocks` | paginate measured units/fragments, not only `lineCount * lineHeight` | row split hacks and AST mutation | `src/index.ts:1970-2027` | revise |
| Projection | `getSlatePageLayoutProjection` | project fragments for top-level and child paths; expose fragment ids | duplicate DOM ambiguity and example-owned maps | `src/index.ts:749-873`, example map | revise |
| React mounting | `PagedEditable` | page/spread mount plan remains the paged repeated unit; active/selected/composing pages retained | block virtualization as wrong default in paged mode | `src/react.tsx:211-252`, tests `:1309-1471` | keep |
| DOM rendering | `Editable` render callbacks | renderers consume layout context; no renderer-owned splitting | brittle path parsing and product glue | `pagination.tsx:510-650` | revise |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| Example setup | `const nodeLayout = useCallback(...)`; `const layout = usePliteLayout(editor, { page, root, typography, nodeLayout })` | show state-dependent `nodeLayout` only where it matters; keep ordinary render callbacks boring | provider identity participates in layout refresh; no caller-side memo ceremony for normal renderers | current example uses `usePliteLayout` already; PR reference rejects `useCallback` cargo cult for beginner renderers | keep/revise |
| Table renderer | `<TableElement {...props} />` calls `usePliteLayoutFragments()` | renderer positions rows from fragments; it does not mutate children and does not receive a public path prop | fragment lookup is map-backed by current element/path context and O(1) | current renderer does manual `elementBoxes` lookup; `RenderElementProps` intentionally omits path | add |
| Media renderer | image/callout provider returns avoid-split fixed box | renderer uses one projected rect | no ResizeObserver loop unless provider opts into DOM measurement | provider sizing test exists | keep/revise |
| Debug controls | pagination example adds table/media stress controls only if they prove API | controls: rows, row height, media height/overflow, DOM strategy, page view | no decorative UI, header-repeat control, or example-only architecture | user requested example support | add in execution |

Plate migration-backbone target:
| Pressure | Plite substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Rich table semantics | generic units/fragments with provider data | Plate table plugin supplies row heights, spans, header repeat, cell selection mapping | raw Plite table commands/maps | solution note, PR reference | keep |
| Media/callout sizing | avoid/page/custom unit policy | Plate/media plugin supplies intrinsic sizes and resize commits | product resize UI in raw Plite | provider sizing test | keep |
| Export fidelity | pageBreaks plus measurement profile and fragment ids | Plate export pipeline can read authoritative fragments | byte-for-byte default guarantee | Pretext research | revise |

slate-yjs migration-backbone target:
| Pressure | Plite substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Shared document AST | layout fragments are derived, not operations | Yjs syncs one table node; page break snapshots optional shared state | syncing layout as document children | current `pageBreaks` state field model | keep |
| Cross-client drift | measurement profile in page break snapshot | one writer/server can publish accepted breaks; peers read or mark stale | deterministic local Pretext across OS by default | Pretext drift research | keep/revise |
| Fragment identity | stable fragment ids include source path/unit key/version/profile | remote cursors/export can refer to derived fragments without changing AST | collaborative table layout conflict policy in raw Plite | execution proof | add |

Intent / boundary record:
- intent: make pagination a derived layout substrate that can handle structured
  nodes, not a line-count trick and not a product table package.
- outcome:
  - one semantic table AST node can visually span pages through provider-owned
    row/unit fragments
  - media/callout/figure-like nodes can declare avoid/split/overflow policy
    without renderer-owned hacks
  - `/examples/pagination` proves a multi-page table using the same public
    call-site shape that package users would copy
  - tests prove no AST split, stable fragment identity, correct page projection,
    and bounded page/spread virtualization behavior
- raw Plite owns:
  - the generic `nodeLayout` provider contract
  - derived layout plans, units, page fragments, and projection lookup
  - `PagedEditable` page/spread mount policy and layout render context
  - optional `pageBreaks` metadata for strict-fidelity consumers
- app/Plate providers own:
  - schema-specific table/media measurement
  - row heights, spans, repeated-header policy, intrinsic media sizing, and
    overflow rules
  - table commands, table maps, cell selection UX, Markdown/GFM syntax, menus,
    and product editing behavior
- in-scope:
  - public experimental `nodeLayout` API
  - `PliteNodeLayoutPlan` union for text, fixed boxes, and provider-owned units
  - stable unit keys and derived fragment ids
  - pathless fragment lookup for renderers, plus explicit path lookup for tools
  - page/spread virtualization interaction
  - multi-page table and media-like example fixtures
  - unit and browser TDD execution queue
- non-goals:
  - raw Plite TableKit
  - AST page splitting
  - browser print/export parity
  - deterministic cross-client page breaks by default
  - current-version Plate or slate-yjs adapters
  - solving custom table selection, rowspan UX, or Web Component boundaries
- decision boundaries:
  - choose the best raw Plite substrate now; later passes may stress-test the
    names, not reopen TableKit or AST splitting
  - `nodeLayout` is the public experimental API; public `boxes` should be cut
    before beta
  - providers describe layout; renderers consume fragments; neither mutates the
    Plite document to paginate
  - paged mode virtualizes pages/spreads by default, not arbitrary blocks
  - strict page-break authority is opt-in metadata, not a default promise
- unresolved user-decision points: none for planning closure. Execution still
  requires explicit user acceptance of the final plan.

Decision brief:
- principles:
  - keep the AST semantic and collaboration-friendly
  - make layout derived, cacheable, and disposable
  - keep raw Plite substrate generic; product semantics stay in app/Plate
  - make provider DX boring: element, path, stable unit keys, measured sizes
  - make render DX boring: ask for the current element's fragments through a
    hook; never parse DOM attrs or add moving paths to public render props
  - prove browser/perf/accessibility behavior before claiming issues
- top drivers:
  - legacy Plite cannot own derived page layout for structured nodes
  - current `boxes` is useful evidence but cannot express rows/cells as first
    class repeated units
  - Tiptap-style CSS pagination is the wrong abstraction for BFC/table/media
    edge cases
  - Pretext is the right text engine target, but table/media semantics belong
    to providers
  - collab/export pressure requires stable fragment identity and optional
    page-break authority
- viable options:
  - Option A: extend `boxes` only. Lowest diff, but too shallow; cannot express
    row/cell fragments, repeated headers, or projection ownership.
  - Option B: add provider-owned node layout plans and unit fragments. Best
    substrate; more API work; requires render/projection changes.
  - Option C: split AST tables at page breaks. Easy rendering; wrong document
    semantics; bad for undo/collab/export.
  - Option D: raw Plite TableKit. Tempting product DX; violates package
    ownership.
  - Option E: keep layout in example renderers. Fast demo, terrible package DX;
    it repeats data-attribute/path-map hacks and cannot become a reusable
    substrate.
- chosen option: Option B.
- rejected alternatives: A is underpowered, C corrupts document semantics, D
  bloats raw Plite and duplicates Plate, E keeps the mess at every app call
  site.
- API decision:
  - public option name: `nodeLayout`, not `boxes`
  - public plan type: `PliteNodeLayoutPlan`
  - plan forms: text fallback, fixed box, provider-owned units
  - provider inputs: element, path, defaults, page settings, and measurement
    profile; no current page index/cursor, so output stays cacheable
  - unit identity: provider-owned stable `unit.key`, composed with source path,
    page index, and measurement profile into derived fragment ids
  - render access: package-owned fragment lookup, expected call shape
    `usePliteLayoutFragments()` under `PagedEditable`; optional low-level
    `layout.getFragments(path)` for non-renderer tooling
  - strict fidelity: optional `pageBreaks` stores accepted fragment/page
    results with measurement profile; local layout remains the default
- consequences:
  - `plite-layout` grows a real provider/unit/fragment protocol
  - `PagedEditable` exposes fragment-aware render access
  - the pagination example becomes a real API specimen, not a clever demo
  - tests must cover table rows crossing pages, no AST mutation, oversized
    unit policy, page/spread virtualization, and fragment lookup
- follow-ups:
  - research/ecosystem/live-source refresh checks the chosen names and
    constraints against Pretext, Tiptap, TanStack Virtual, and current source
  - pressure passes challenge React runtime cost, migration fit, regression
    proof, and simplicity before closure

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| `#5944` stable per-line pagination | Related, issue-reviewed | no Fixes/Improves claim | direct pagination/layout pressure, but current plan has no browser proof for page-boundary flicker, caret mapping, or stable breaks | multi-page text/table Playwright proof before any claim | existing 2026-05-25 row covers | existing PR reference covers no-claim target |
| `#790` dynamic rendering / virtualization | Related, proof-route backlog | no Fixes/Improves claim | page/spread virtualization contributes, but mounted-count/native-behavior proof is not done | mount/edit/scroll benchmarks, mounted-count proof, DOM coverage, native behavior proof | existing 2026-05-25 row covers | existing PR reference covers no-claim target |
| `#5924` structural DOM cursor exclusion | Not claimed | do not add public ignore-cursor API | page/table/debug DOM should be governed by DOM coverage, mount policy, and provider/split protocols | DOM coverage and selection proof only if execution touches structural DOM | existing 2026-05-25 row covers | existing PR reference covers no-claim target |
| `#4141` nested rerender breadth | Existing Improves unchanged | do not broaden claim | layout/page subscriptions must preserve the current nested rerender improvement | render-count proof if execution changes subscriptions | existing guardrail row covers | unchanged |
| `#5131`, `#2051` subscription/perf guardrails | Guardrail | no claim | fragment layout must not regress selection/subscription performance | focused package tests plus browser perf proof | existing guardrails cover | unchanged |
| `#2793`, `#2572` accessibility guards | Release guard | no claim | virtualized/missing DOM and page fragments need screen-reader/native behavior proof | accessibility and native browser proof before promotion | existing guardrails cover | unchanged |
| `#3892` custom editor surfaces | Policy non-claim | no claim | raw Plite should provide substrate, not product-specific editor surfaces | N/A for this plan | existing non-claim row covers | unchanged |
| `#5945`, `#4056`, `#5992` existing related rows | Existing Improves unchanged | do not promote | pagination plan does not change those classifications | unchanged | existing rows cover | unchanged |
| `#5551` Firefox rowspan table selection | Not claimed, table warning | no claim | rowspan selection belongs to custom table plugin/table selection model, not raw layout fragments | browser proof only if an app table plugin claims it | existing matrix non-claim covers | unchanged |
| `#5550` Web Component selection boundary | Not claimed, DOM warning | no claim | structural DOM rules must not imply Web Component selection support | N/A for this plan | existing matrix non-claim covers | unchanged |
| `#6034` table last-node ArrowDown | Existing Fixes unchanged | do not broaden | exact table-edge regression floor, not pagination/table-fragment coverage | unchanged | existing Fixes row covers | unchanged |

Issue-ledger sync status:
- ClawSweeper related-issue pass: complete by reuse, not rerun. Existing
  2026-05-25 Pretext Pagination / Page Virtualization Feedback rows already
  cover `#5944`, `#790`, `#5924`, `#4141`, `#5131`, `#2051`, `#2793`,
  `#2572`, `#3892`, `#5945`, `#4056`, and `#5992`.
- generated live gitcrawl rows read: complete for `#5944`, `#5924`, `#790`;
  table/DOM warning rows checked for `#5551`, `#5550`, `#6034`.
- manual v2 sync ledger update: unchanged for this pass; no new fixed,
  improved, reviewed, or excluded classification beyond existing rows.
- fork issue dossier update: unchanged for this pass; existing 2026-05-25
  section covers the same public API and browser-behavior surface.
- issue coverage matrix update: unchanged for this pass; existing matrix rows
  already cover the exact provider/split protocol target.
- PR description sync: unchanged for this pass; existing pagination target
  already says generic provider/split protocols and no fixed/improved claim.

Issue-ledger pass result:
- Issue coverage matrix evidence:
  `docs/plite/ledgers/issue-coverage-matrix.md:302-324` already records
  generic provider/split protocols for table/media/BFC pagination, keeps
  `#5944` issue-reviewed, keeps `#790` as proof-route backlog, keeps `#5924`
  not claimed, preserves `#4141`, `#5131`, `#2051`, `#2793`, `#2572`,
  `#3892`, `#5945`, `#4056`, and `#5992`.
- DOM/table warning evidence:
  `docs/plite/ledgers/issue-coverage-matrix.md:434-437` keeps `#5550` and
  `#5551` not claimed, and keeps `#5924` not claimed.
Final issue sync accounting result:
- Issue matrix evidence:
  `docs/plite/ledgers/issue-coverage-matrix.md:362-387` records a
  2026-05-26 no-claim planning sync for `nodeLayout`,
  `usePliteLayoutFragments()`, `layout.getFragments(path)`, no public `boxes`,
  no public `RenderElementProps.path`, no raw Plite TableKit, no AST split,
  Pretext `measurementProfile`, and degraded/native-incomplete page/spread
  virtualization.
- Manual sync ledger evidence:
  `docs/plite-issues/gitcrawl-v2-sync-ledger.md:335-359` records the same
  no-claim issue classifications and preserves `#5944`, `#790`, `#5924`,
  `#4141`, `#5131`, `#2051`, `#2793`, `#2572`, `#3892`, `#5945`, `#4056`,
  `#5992`, and `#6034` statuses.
- PR reference evidence:
  `docs/plite/references/pr-description.md:266-277` names the accepted
  public beta target and keeps the no fixed/improved issue claim boundary.
- Fork dossier decision:
  no new issue dossier section is needed because this pass reviews no new issue
  thread and changes no fixed/improved classification. The existing dossier
  remains historical evidence for the earlier provider/split classification
  set.
- Decision: issue/reference accounting is complete. The revised public API and
  ecosystem wording changed the reference narrative, not the issue claim set.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| Pretext | `../pretext/src`, `docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md` | `prepare()` measures with canvas; `layout()` relayouts from cached widths | hot DOM measurement | Pretext text engine, `measurementProfile`, arithmetic resize path | deterministic cross-client/server page breaks by default | profile-aware local text layout plus opt-in authoritative `pageBreaks` | keep with caveat |
| Tiptap Pages | `../tiptap-docs/src/content/pages/**` plus compiled research | CSS floats around page gaps; separate Pages TableKit for table splitting; PageBreak atom/filler node | product-specific table/page coupling leaking into raw Plite | failure taxonomy, explicit page-break UX, proof that table pagination needs custom policy | CSS-float pagination as Plite substrate, semantic manual split, raw Plite TableKit | provider-owned `nodeLayout` units/fragments and optional strict breaks | diverge respectfully |
| TanStack Virtual | `docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md` | headless visible-range engine with measured items and stable keys | too many mounted repeated units | internal page/spread range management and retained-index policy | leaking TanStack options or item ranges to Plite API | paged mode virtualizes pages/spreads; continuous mode can virtualize blocks | agree internally |
| Premirror | Pretext pagination research | derived pages/fragments over semantic doc | AST page mutation | snapshot -> measure -> compose -> render | product API cloning | derived fragment plan | partial inspiration |

Research/ecosystem/live-source refresh result:
- Pretext source refresh:
  - `../pretext/src/layout.ts:668-682` confirms `prepare()` segments text and
    measures segments through canvas-backed width caches.
  - `../pretext/src/layout.ts:696-710` confirms `layout()` is arithmetic over
    cached widths with no canvas or DOM reads.
  - `../pretext/src/measurement.ts:36-49` confirms measurement requires
    `OffscreenCanvas` or a DOM canvas; `:61-67` calls `measureText`.
  - `../pretext/src/measurement.ts:74-90` uses browser profile detection, and
    `:135-160` includes DOM-backed emoji correction when needed.
  - Decision: Pretext remains the text engine target, but Plite must keep
    strict page-break authority opt-in through `pageBreaks` plus
    `measurementProfile`. No default deterministic collab/export promise.
- Tiptap Pages refresh:
  - `../tiptap-docs/src/content/pages/core-concepts/limitations.mdx:13-20`
    says Pages requires its own table extension, uses CSS floats around page
    gaps, cannot split BFC blocks such as tables/figures/styled containers, and
    recommends max-height or manual node splitting.
  - `../tiptap-docs/src/content/pages/guides/table-with-pages.mdx:16-66`
    says table pagination needs `@tiptap-pro/extension-pages-tablekit`, heavily
    modified table behavior/layout, and warns extension authors can break table
    splitting logic.
  - `../tiptap-docs/src/content/pages/core-concepts/page-break-node.mdx:14-32`
    shows explicit page breaks as a product atom/filler behavior; `:100-128`
    ties that node to commands, keyboard shortcut, and DOCX import/export.
  - Decision: steal the edge-case taxonomy and explicit-break UX pressure, not
    the CSS float mechanism, not manual semantic splitting, and not raw Plite
    TableKit.
- TanStack Virtual refresh:
  - `docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md:103-122`
    keeps TanStack as a headless range engine with stable keys, dynamic
    measurement, range extraction, and Plite-owned selection/copy/IME/a11y
    policy.
  - `:158-178` says TanStack owns visible range and measured item sizes only;
    Plite owns DOM coverage, materialization, selection, IME/mobile, metrics,
    and degradation classification.
  - Decision: keep page/spread virtualization internal in paged mode. Do not add
    public `pageVirtualization` or TanStack-shaped options.
- Live `Plate repo root` source refresh:
  - `packages/plite-layout/src/index.ts:105-120` still defines shallow box
    kinds/split policy, not row units or fragment plans.
  - `packages/plite-layout/src/index.ts:355-374` still exposes public `boxes`
    options; execution should replace that public surface with `nodeLayout`.
  - `packages/plite-layout/src/index.ts:1371-1406` proves providers can own
    element sizing today, but only as block-local boxes.
  - `packages/plite-layout/src/index.ts:1954-2053` still paginates by estimated
    lines and block fragments; it does not paginate provider-owned row/media
    units.
  - `packages/plite-layout/src/index.ts:304-343` and `:2103-2145` already have
    profile-checked `pageBreaks` read/write mechanics that fit the strict
    fidelity target.
  - `packages/plite-layout/src/react.tsx:181-252` still creates page/spread
    mount items and exposes virtualized page items internally.
  - `site/examples/ts/pagination.tsx:410-456` and `:510-650` still build an
    example-local path map and read `attributes['data-plite-path']`; execution
    should move this into package-owned fragment lookup.
  - `packages/plite-layout/test/page-layout-contract.test.ts:735-922` proves
    current structured boxes and provider sizing; `:924-1008` proves line/block
    pagination; `:1309-1475` proves page/spread mount retention.
  - Command: `cwd=/Users/zbeyens/git/plate-2/Plate repo root`,
    `bun --filter ./packages/plite-layout test`; result: pass, 31 tests,
    0 fail.
- Refresh verdict:
  - The locked `nodeLayout` decision survives the evidence pass. Current
    `boxes` is useful proof that provider ownership works, but it is too shallow
    and too box-shaped for multi-page table rows, repeated headers, media
    overflow policy, fragment ids, and renderer lookup.

Pressure pass result:
- Performance/DX hard calls:
  - `nodeLayout` is safe only if provider evaluation happens once per relevant
    top-level element per layout snapshot, then the result is cached by editor
    version/layout version.
  - Core pagination target complexity is O(blocks + units + lines/fragments).
    Fragment reads in renderers must be O(1), through a snapshot-built
    `fragmentsBySourcePath` / `unitsBySourcePath` map.
  - `PagedEditable` owns projection and fragment context. Element renderers must
    not rebuild projection maps, scan all fragments, or parse `data-plite-path`.
  - `nodeLayout` identity must participate in layout refresh. The pagination
    example should use `useCallback` only for state-dependent `nodeLayout`
    providers; ordinary render examples stay module-level or raw callbacks.
  - Paged mode virtualizes pages/spreads by default. Continuous block
    virtualization remains a separate fallback for non-paged huge docs.
- Performance cohorts:
  | Cohort | Shape | Required strategy | Proof target |
  |--------|-------|-------------------|--------------|
  | Normal | up to 200 blocks or 10 pages | full DOM acceptable | no extra API ceremony |
  | Large | up to 2k blocks, 50 pages, or 5k layout units | page/spread virtualization | O(visible + retained pages) mount |
  | Stress | 10k blocks, 200 pages, or a 1k-row table | page/spread virtualization plus O(1) fragment lookup | typing in a second-page cell stays responsive |
  | Pathological | 50k blocks or 1k pages | explicit degraded mode or continuous virtualization fallback | no native-parity claim without proof |
- Metrics required in execution:
  - layout duration, composition duration, mounted pages, mounted top-levels, DOM
    node count, component count, fragment count, cache size, degradation mode,
    `nativeSurfaceComplete`, scroll p95, and typing p95 in a second-page cell.
- DX pressure:
  - Public API stays `nodeLayout`; public `boxes` is cut before beta.
  - Do not add `path` to `RenderElementProps`. Current surface-contract tests and
    the render-prop path solution note are right: paths move, public render props
    should not carry moving addresses.
  - Renderer DX is pathless: `usePliteLayoutFragments()` reads the current
    element/path from package-owned layout context under `PagedEditable`.
  - Non-renderer tools can use an explicit `layout.getFragments(path)` escape
    hatch.
  - Keep `/examples/pagination` as the canonical specimen. Do not add
    `examples/pagination-basic`; the example should gain multi-page table rows
    and relevant controls in place.
- Migration pressure:
  - Plate can supply table/media `nodeLayout` providers with row heights, spans,
    repeated header policy, cell rects, media intrinsic sizes, and overflow
    policy. Raw Plite does not ship TableKit or table commands.
  - slate-yjs syncs the semantic AST only. Layout fragments are derived. Optional
    `pageBreaks` metadata may be shared as accepted layout state with
    `measurementProfile` and version; it must not become document children or
    operations.
- Regression/TDD pressure:
  - Execution must be vertical red-green slices, not one giant "pagination"
    patch. Red rows:
    1. `nodeLayout` emits row units for one table AST and the pager splits those
       units across pages without AST split.
    2. Stable fragment ids include source path, provider unit key, page, and
       measurement profile/version or an equivalent collision-proof tuple.
    3. Oversized row/media policy: avoid moves if it fits; overflow/degraded
       behavior is explicit if it cannot fit.
    4. `usePliteLayoutFragments()` resolves current table fragments without
       reading `data-plite-path`.
    5. Virtualized paged tables retain visible, selected, focused, and composing
       pages.
    6. Playwright `/examples/pagination` proves a multi-page table, typing in a
       second-page cell updates the same AST table, virtualized strategy does not
       freeze, and selection/copy across a page boundary maps back to original
       paths.
- Simplicity cuts:
  - No public `boxes` alias in docs or beta; internal adapter only if execution
    needs a temporary migration bridge.
  - No public `pageVirtualization`, TanStack-shaped options, TableKit,
    table-map commands, cell-selection UX, or renderer path props.
  - No `nodeLayoutVersion` until function identity/dependency handling fails in
    implementation. Start with stable callback identity and explicit refresh
    deps.
  - No default DOM measurement callback. Providers return model/intrinsic
    measurements; DOM measurement can be future opt-in only after browser proof
    demands it.

Legacy regression proof matrix:
| Regression class | Legacy behavior | Plite target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| Table across page boundary | legacy cannot own derived page layout layer | one table AST, row fragments across pages | unit + Playwright | execution | complete: `bun --filter ./packages/plite-layout test`; Chromium pagination test proves one table subtree, rows on multiple pages |
| Media/box too tall for page | legacy layout is DOM/product owned | provider declares avoid/page/overflow policy | unit tests | execution | complete: oversized provider-owned box test places once and continues |
| Selection/caret in row after page break | legacy DOM mapping fragile near structured blocks | projected fragment rect maps to original cell path | browser test | execution | complete for first slice: Chromium edits a visually second-page cell and keeps one table DOM subtree |
| Virtualized paged table | block virtualization is wrong default in paged mode | page/spread virtualization retains active/selected/composing pages | unit + Playwright | execution | complete for first slice: Chromium virtualized DOM strategy row no longer freezes; native-complete claims remain excluded |
| Collab/export drift | legacy has no profile-aware authority | pageBreaks can store authoritative fragment ids | unit test | execution | complete: unit pageBreak snapshot write/read covers provider-owned unit fragments |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| `/examples/pagination` | 40-row table spans at least 2 pages | Chromium | Playwright focused row | one table node, rows on multiple pages | complete |
| `/examples/pagination` | type in cell on second page | Chromium | Playwright focused row | model updates same table AST | complete |
| `/examples/pagination` | DOM strategy virtualized | Chromium | existing pagination Playwright suite plus new row | no freeze, page items bounded | complete |
| `/examples/pagination` | selection/copy across page-boundary rows | Chromium first, Firefox later | browser contract | selection maps to original cell paths | complete for Chromium default DOM mode |
| `/examples/pagination` | duplicate editable path check for table rows/cells | Chromium | Playwright DOM query | no duplicate editable `data-plite-path` owner for the same row/cell source path | complete |
| `/examples/pagination` | IME/composition in second-page cell | Chromium first, WebKit/Firefox later if promoted | browser contract | composing page stays mounted; text lands in same cell | not promoted: first slice covers keyboard input; IME-specific proof remains release-gate backlog |
| `/examples/pagination` | repeated table header policy | Chromium | Playwright/source check | no editable repeated header clone in first execution slice | complete by exclusion: no repeated header renderer was added |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Current `plite-layout` tests pass and source shape is live | `Plate repo root` | `bun --filter ./packages/plite-layout test` | pass, 31 tests | current pass |
| Current `plite-react` virtualized/native-coverage guards pass | `Plate repo root` | `bun --filter ./packages/plite-react test:vitest -- test/dom-strategy-page-virtualization.test.tsx test/dom-coverage-native-bridge-contract.test.ts` | pass, 2 files, 13 tests | high-risk pass |
| Multi-page table provider behavior | `Plate repo root` | focused unit tests to add | pending | execution |
| Multi-page table browser behavior | `Plate repo root` | focused `/examples/pagination` Playwright rows | pending | execution |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | applied | `useSyncExternalStore` is right for layout snapshots; avoid broad context re-render, per-render projection scans, and stale provider deps | add O(1) fragment maps and include `nodeLayout` identity in refresh semantics |
| performance-oracle | yes | applied | target O(blocks + units + lines/fragments), O(1) lookup, bounded caches, provider once per block/snapshot | added cohort budgets, cache requirements, and metrics |
| performance | yes | applied | page/spread is the repeated unit in paged mode; block virtualization is fallback, not default | added normal/large/stress/pathological cohorts and degradation proof |
| tdd | yes | applied | execution must be red-first vertical slices through public behavior, not internal-only assertions | added six red rows spanning unit, React, and Playwright proof |
| shadcn | partial | applied | example controls should be real inputs/selects/toggles and stay utilitarian; no decorative or duplicate example page | keep `/examples/pagination`; add only rows, sizing, media/overflow, DOM strategy, and page view controls |
| react-useeffect | yes | applied | derived projection/fragment maps belong in memoized snapshots/store selectors, not effect-plus-state loops | keep effects for layout refresh/destroy only; renderer hook consumes snapshot context |
| code-simplicity-reviewer | yes | applied | cut aliases and product-shaped APIs; do not add TableKit, `pageVirtualization`, `nodeLayoutVersion`, DOM measurement default, or public path props | recorded simplicity cuts |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Decision / mitigation | Required proof | Status |
|------|---------|--------------|-----------------------|----------------|--------|
| Duplicate editable DOM for one Plite path | table/page fragments or repeated headers | DOM bridge, selection, copy, and IME resolve the wrong owner | First execution must render at most one editable `data-plite-node` owner per source path. Page wrappers can be inert chrome; repeated headers are out of first execution slice. Later repeated headers must be clone-free or `aria-hidden` decoration. | Playwright asserts no duplicate editable `[data-plite-path]` owners for table rows/cells and no editable repeated header clones | accepted guardrail |
| Split table semantics leak into AST | row pagination | one table becomes many document nodes; undo/collab/export corrupt | Pagination creates derived fragments only. Tests assert one canonical table node remains after pagination and second-page cell edits. | unit test plus Playwright model assertion after editing a second-page cell | accepted guardrail |
| Virtualized DOM claims native completeness | page/spread virtualization | browser find, selection, copy, accessibility, and IME appear supported while content is unmounted | Virtualized mode keeps `nativeSurfaceComplete=false` and `degradationMode='virtualized'`. Claims require model-backed copy/materialize behavior and page retention proof. | focused `plite-react` metrics tests plus `/examples/pagination` browser rows | accepted guardrail |
| Selection/copy crosses an unmounted page boundary | page-level virtualization | native clipboard reads stale/partial DOM or drops hidden rows | Either materialize the missing page range before native work or use DOMCoverage/model-backed copy. Do not claim native copy across virtualized pages until proven. | Playwright selection/copy across page-boundary rows; model text/html excludes stale DOM | accepted guardrail |
| IME/composition in a second-page cell | virtualized paged table | composing page unmounts, losing native composition state | Page/spread mount plan must retain composing top-level index; execution adds a browser row for composition/typing in a second-page cell. | existing mount-plan unit evidence plus new browser row | accepted guardrail |
| Provider API too product-shaped | table example | raw Plite becomes TableKit-lite | Example provider may emit row units and simple overflow policy only. No table commands, table maps, cell selection UX, rowspan policy, GFM, menus, or production TableKit. | API review and example source review | accepted guardrail |
| Oversized rows/media | row or image taller than page | infinite pagination loop, invisible content, or silent clipping | Provider/core policy must choose explicit `overflow` / degraded behavior when a unit cannot fit. Avoid split only when it can actually fit. | focused unit test for too-tall row/media | accepted guardrail |
| Page breaks drift in collab/export | Pretext measurement | peers compute different breaks and export disagrees with screen | Default remains local and best-effort. Strict users opt into `pageBreaks` authored by one client/server with measurement profile and layout version; stale snapshots are ignored/flagged. | unit test for profile/version mismatch and accepted snapshot read/write | accepted guardrail |
| Fragment ids are unstable | provider unit keys or profile changes | remote cursors/export refs point at wrong fragment | Fragment id tuple includes source path/runtime identity, provider unit key, page index, layout version, and measurement profile or equivalent collision-proof data. | unit test across relayout/profile changes | accepted guardrail |
| Accessibility overclaim | virtualized/page chrome | screen readers see partial document while API implies full native surface | Virtualized paged mode is explicit degraded/native-incomplete until a11y proof exists. Page chrome must not masquerade as editable content. | release guard, not first execution claim | accepted guardrail |

High-risk deliberate-mode result:
- Hard decision: no duplicate editable DOM for the same Plite source path in the
  first execution slice. Repeated table headers are explicitly out of that slice.
  Later header repeat must be clone-free or inert decoration, not editable Plite
  DOM with duplicate paths.
- Hard decision: virtualized paged mode is not native-surface complete. The API
  may expose useful model-backed copy/materialize behavior, but it must report
  `degradationMode='virtualized'` and avoid native parity claims until browser
  proof exists.
- Hard decision: table pagination proves the substrate with row units only. It
  does not solve rowspan layout, table maps, cell selection UX, header repeat,
  Markdown/GFM, or production Plate table behavior.
- Hard decision: strict collab/export fidelity remains opt-in `pageBreaks`
  authority with profile/version checks. Derived fragments never become Yjs
  document children or Plite operations.
- Execution proof added by this pass:
  - no duplicate editable `[data-plite-path]` owners for table rows/cells
  - second-page cell edit mutates the same table AST
  - selection/copy across a page boundary either materializes missing pages or
    uses model-backed DOMCoverage without stale DOM
  - IME/composition in a second-page cell keeps the page mounted
  - virtualized strategy reports degraded/native-incomplete metrics
  - oversized row/media policy is explicit and non-looping

Ecosystem maintainer pass:
| System | Maintainer pushback | Fair correction | Plite decision | Plan delta |
|--------|---------------------|-----------------|----------------|------------|
| Pretext | "Do not call this deterministic/headless yet; `prepare()` intentionally measures with canvas and profile-specific behavior." | Accepted. Pretext is the right text engine because it moves work out of the hot resize path, not because it gives server/client byte-for-byte breaks today. | Keep Pretext as default text layout engine; keep `measurementProfile`; keep strict `pageBreaks` authority opt-in. If Pretext later gets headless measurement, the API should improve without changing shape. | No deterministic default claim; score evidence strengthened. |
| Tiptap Pages | "Pages TableKit is a legitimate product-extension answer; framing it as simply wrong is unfair." | Accepted. For Tiptap's product stack, a specialized TableKit can be rational. It is wrong only as the raw Plite ownership model. | Steal the failure taxonomy and explicit-break pressure. Do not copy CSS-float pagination, manual semantic splitting, or raw Plite TableKit. | Wording changed to respectful divergence. |
| TanStack Virtual | "TanStack solves range math, not editor semantics. Do not blame it for native-surface gaps." | Accepted. Plite must own DOM coverage, materialization, selection, copy/paste, IME, mobile, browser-find, a11y, metrics, and degradation classification. | Use TanStack-style range extraction internally if useful; never expose TanStack-shaped public options. Page/spread is the paged repeated unit. | Public API remains Plite-shaped; high-risk proof stays required. |
| Premirror / Pretext pagination | "Do not over-copy a product demo or assume its constraints match Plite." | Accepted. The useful mechanism is derived pages/fragments over a semantic document, not a product API clone. | Adopt snapshot -> measure -> compose -> render as architecture language; keep raw Plite unopinionated. | Derived-fragment language kept; product cloning rejected. |

Ecosystem maintainer pass result:
- Pretext: strongest caveat survives. Plite can default to Pretext while being
  honest that `prepare()` currently depends on canvas measurement and browser
  profile behavior. The API must not promise cross-client/server break identity
  unless an authoritative `pageBreaks` snapshot is provided.
- Tiptap: wording tightened. Tiptap Pages is not a bad product answer; it is the
  wrong raw Plite substrate because it relies on CSS floats, a specialized Pages
  TableKit, and manual split workarounds for exactly the BFC/table/media classes
  Plite wants provider-owned layout fragments to handle generically.
- TanStack: the plan keeps TanStack as internal infrastructure only. Plite owns
  retained-page policy, DOM coverage, native-surface metrics, and materialization.
- Premirror: keep the derived-page mental model; do not clone a product API.
- Revision requirement created by this pass: normalize final wording so it says
  "diverge respectfully from Tiptap's product approach" rather than treating
  Tiptap Pages as failed architecture.

Revision pass result:
- Final API wording:
  - `usePliteLayout(editor, { page, root, typography, nodeLayout, pageBreaks })`
    remains the user-facing layout entrypoint.
  - `nodeLayout({ element, path, defaults, pageSettings, measurementProfile })`
    is the public provider shape. It does not receive current page index, cursor
    position, or pagination placement state.
  - `PliteNodeLayoutPlan` has three public forms for the execution plan: text
    fallback, fixed/avoid box, and provider-owned units.
  - `usePliteLayoutFragments()` is the renderer API under `PagedEditable`.
    `layout.getFragments(path)` remains the low-level explicit-path API for
    tools. No public `RenderElementProps.path`.
  - Paged mode virtualizes pages/spreads as the repeated unit and reports
    degraded/native-incomplete behavior until browser proof promotes specific
    native-surface claims.
- Final example wording:
  - Extend `/examples/pagination`; do not create `pagination-basic`.
  - Controls: row count, row height, media height/overflow, DOM strategy, and
    page view.
  - No header-repeat control or repeated editable header clone in the first
    execution slice.
- Final ecosystem wording:
  - Pretext is the default text layout engine with explicit canvas/profile caveat.
  - Tiptap Pages is a valid product-extension approach in its stack; raw Plite
    respectfully diverges from its CSS-float/manual-split/TableKit ownership
    model.
  - TanStack remains internal range infrastructure only.
  - Premirror contributes the derived-page mental model, not an API clone.
- Final issue/reference handoff:
  - The revision pass changed public narrative wording enough that the next pass
    must inspect `docs/plite/ledgers/issue-coverage-matrix.md`,
    `docs/plite-issues/gitcrawl-v2-sync-ledger.md`, and
    `docs/plite/references/pr-description.md`.
  - Expected result is likely a no-claim accounting update or explicit skip, not
    new `Fixes` / `Improves` claims.

Plite maintainer objection ledger:
| Change | Strongest objection | Accepted answer | Required guardrail | Evidence | Verdict |
|--------|---------------------|-----------------|--------------------|----------|---------|
| Replace shallow `boxes` with `nodeLayout` plans | "This is too much layout API for raw Plite; tables/media are app concerns." | Correct that product behavior is app/Plate-owned, but raw Plite already owns derived pagination. The minimal raw substrate is a generic node layout plan, not a table package. | `nodeLayout` stays generic: text, fixed box, provider-owned units. No table commands, maps, cell selection, menus, or Markdown/GFM product semantics. | Current `boxes` supports `table`/`table-cell`/`row` vocabulary but pager still line-splits at `packages/plite-layout/src/index.ts:105-139`, `:1954-2053`. | keep/revise |
| Provider inputs include page/layout context | "If provider output depends on current page placement, caching and determinism are toast." | Accepted. `nodeLayout` receives page settings and measurement profile, not current page index/cursor. Pagination placement stays core-owned. | Provider output must be pure for a given element/path/defaults/page settings/profile snapshot; refresh depends on `nodeLayout` identity. | `usePliteLayout` refresh deps currently omit the provider identity at `packages/plite-layout/src/react.tsx:53-70`; pressure pass requires fixing that. | revise |
| Add pathless fragment render access | "Render props should not know pagination, and path props caused perf bugs." | Correct. Do not add `path` to public `RenderElementProps`. The hook is optional context under `PagedEditable`, and non-paged `Editable` remains unchanged. | `usePliteLayoutFragments()` resolves from package-owned element/path context; optional `layout.getFragments(path)` is for tools, not normal render props. | `RenderElementProps` has no path at `packages/plite-react/src/components/editable.tsx:40-50`; surface contract forbids path/index at `test/surface-contract.tsx:24-36`; solution note rejects moving paths. | keep |
| Keep `pageBreaks` authority optional | "Strict export/collab users need deterministic breaks, not local best effort." | Correct for strict users, wrong as default. Current Pretext measurement is canvas/profile-sensitive; default API must not promise headless determinism. | `pageBreaks` stores accepted fragment/page results with measurement profile/version and can be authored by one client/server. Local recompute marks stale when profile/version mismatches. | Current layout already has profile-checked `pageBreaks`; Pretext research keeps canvas drift explicit. | keep |
| Page/spread virtualization default in paged mode | "Virtualization can break native selection, copy, IME, find, accessibility, and SEO-ish DOM expectations." | Correct risk, but paged docs should virtualize repeated page/spread units, not arbitrary blocks. Native-surface claims wait for proof. | Page/spread mount plan must retain visible, selected, focused, composing, and promoted pages; missing DOM must be reported through degradation metrics. | `PagedEditable` already builds page items at `packages/plite-layout/src/react.tsx:181-252`; tests retain selected/composing pages. | keep with proof gate |
| No raw Plite TableKit | "Users need table pagination to work; a generic provider makes every app rebuild table splitting." | Raw Plite should provide the substrate and a minimal example provider. Plate/app packages provide production table semantics. Shipping TableKit in raw Plite is the wrong ownership line. | `/examples/pagination` proves one multi-page table AST and row units; docs say production tables plug provider policy in app/Plate. | Prior solution notes and PR reference keep product table packages out of raw Plite. | keep |
| No AST split | "Splitting table nodes in the AST is simpler for rendering/export and mirrors page output." | It is simpler for rendering and worse for editing. It corrupts undo, collab, selection, copy, and semantic export. Derived fragments give page output without document mutation. | Tests must assert one table node remains one table node after pagination and second-page cell edits. | Plan TDD queue covers no AST split and same-table second-page editing. | keep |
| Keep `/examples/pagination` as the target example | "A dense example with pagination, virtualization, tables, and media will be too complex." | A second `pagination-basic` page would hide the canonical DX problem. One example with restrained controls is better. | Controls limited to rows, row height, media height/overflow, DOM strategy, and page view. No product table toolbar. | Existing example already owns pagination controls; pressure pass rejected duplicate route. | keep |
| Pretext remains the text engine target | "Pretext is not fully headless; canvas measurement drift weakens the architecture." | Correct caveat, not a blocker. Use Pretext for text layout now, keep `measurementProfile`, and keep strict page-break authority opt-in. | No byte-for-byte cross-client/export promise until headless measurement exists or an authoritative writer/server provides breaks. | Memory/research notes and current plan keep canvas drift explicit. | keep with caveat |

Maintainer objection pass result:
- Strongest accepted revision: rename the provider context from ambiguous
  current-page `page` to `pageSettings` plus `measurementProfile`. Providers
  describe node layout; the core pager owns placement.
- Strongest rejected objection: adding public `path` to render props for easier
  fragment lookup. That would reintroduce the exact moving-path perf/staleness
  bug the rewrite already fixed.
- Most dangerous future drift: letting the table example become TableKit-lite.
  The execution slice must prove row units with boring app code, not table
  commands, selection models, or Markdown semantics.
- Proof stance: no issue/fidelity/native-behavior promotion from this planning
  pass. High-risk deliberate mode must pressure duplicate DOM,
  selection/copy/IME, and virtualized native-surface behavior before closure.

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| AST table splitting for pagination | reject | breaks semantic document, undo, collab, export | none accepted | Tiptap manual split warning, Plite boundary; high-risk pass reaffirmed no split | execution proof |
| Raw Plite TableKit | cut | product package belongs to Plate/app | none accepted | solution note and PR reference | issue sync complete |
| CSS-float pagination as raw Plite substrate | reject | BFC/table/media failure class and product-specific ownership | none accepted | Tiptap limitations docs via research; ecosystem pass reframed as respectful divergence | issue sync complete |
| Existing `boxes` as final API | revise | useful seed, not enough for row/unit fragments | alpha hard cut | live source and maintainer objections | issue sync complete |

Plan deltas from review:
- Created Plite Plan artifact from template.
- Grounded current state in live `plite-layout`, `PagedEditable`, and
  `/examples/pagination` source.
- Chose provider-owned node layout plans and unit/page fragments over AST split,
  shallow boxes-only, CSS floats, or raw Plite TableKit.
- Added execution queue target for multi-page table example and robust TDD.
- Completed related issue discovery from existing ledgers without rerunning
  ClawSweeper because the touched issue surface matches the 2026-05-25
  pagination planning sync.
- Completed issue-ledger pass by proving the existing matrix, v2 sync ledger,
  fork dossier, and PR reference already cover the plan's claim boundaries.
- Completed intent/boundary and decision brief; committed to `nodeLayout` as
  the public experimental API and cut public `boxes` before beta.
- Completed research/ecosystem/live-source refresh; Pretext, Tiptap Pages,
  TanStack Virtual, and live `Plate repo root` source still support `nodeLayout`
  plus provider-owned units/fragments.
- Completed performance/DX/migration/regression/simplicity pressure; tightened
  the target to O(1) fragment lookup, pathless `usePliteLayoutFragments()`,
  page/spread virtualization by default in paged mode, vertical TDD slices, and
  no public `boxes` alias.
- Completed maintainer objection ledger; accepted the provider-context revision
  from ambiguous `page` to `pageSettings` plus `measurementProfile`, rejected
  public render-prop paths, and kept the no-TableKit/no-AST-split boundary.
- Completed high-risk deliberate mode; rejected duplicate editable DOM, excluded
  repeated headers from the first execution slice, recorded virtualized DOM as
  degraded/native-incomplete, and added model-backed copy/materialize,
  composition-retention, duplicate-path, and oversized-unit proof gates.
- Completed ecosystem maintainer pass; kept Pretext caveats precise, reframed
  Tiptap Pages as a valid product-extension approach that raw Plite should
  respectfully diverge from, kept TanStack internal, and limited Premirror to
  derived-layout inspiration.
- Completed revision pass; normalized final public API wording, accepted
  `usePliteLayoutFragments()` as the renderer hook name, removed header-repeat
  controls from the first-slice example, and queued issue/reference accounting
  for the revised public narrative.
- Completed issue sync accounting; added a 2026-05-26 no-claim sync to the issue
  matrix and manual sync ledger, and synced the PR reference to the accepted
  public API target.
- Closed planning lane for user review; execution starts only after explicit
  accepted-plan invocation.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Can one DOM subtree with row/unit positioning preserve table selection well enough? | avoids duplicate DOM path ambiguity | browser proof after execution slice | execution | narrowed: first slice forbids duplicate editable DOM; browser proof still pending |
| Does provider API need DOM measurement callbacks or only model/intrinsic sizing? | impacts performance and React effects | pressure pass plus example proof | slate-plan | answered: model/intrinsic provider measurements by default; DOM measurement future opt-in only if browser proof demands it |
| Should renderers receive `path` to make fragments easy? | moving paths cause rerender breadth and stale handler bugs | current surface contract and solution note | slate-plan | answered: no public path prop; use pathless `usePliteLayoutFragments()` under `PagedEditable` |
| Should `boxes` remain as alias or be hard-cut before publish? | migration/DX cost | intent/decision pass | slate-plan | answered: hard-cut public `boxes`; internal adapter only if needed during execution |
| Should `nodeLayout` receive the current page? | current-page input would make provider output placement-dependent and hard to cache | maintainer objection pass | slate-plan | answered: no current page/cursor; provider gets page settings and measurement profile |
| Should repeated table headers ship in the first multi-page table example? | repeated editable header clones would duplicate Plite paths and break selection | high-risk deliberate mode | slate-plan | answered: no; first slice excludes repeated headers, later support must be clone-free or inert decoration |
| Can virtualized paged mode claim native surface completeness? | unmounted pages break native find/selection/copy/a11y assumptions | current `plite-react` metrics and DOM coverage tests | slate-plan | answered: no; virtualized mode is degraded/native-incomplete until browser proof promotes specific behavior |
| Are we overstating Tiptap as failure evidence? | unfair ecosystem framing can distort the Plite decision | local Tiptap Pages docs and ecosystem maintainer pass | slate-plan | answered: yes; Tiptap is a valid product-extension approach, but raw Plite should diverge from its ownership/model |
| Should TanStack Virtual surface in the public API? | leaking virtualizer details would make Plite API less editor-native | TanStack research and high-risk pass | slate-plan | answered: no; internal range engine only |
| Is `usePliteLayoutFragments()` the accepted renderer hook name? | lingering naming pressure blocks user-review-ready API text | revision pass | slate-plan | answered: yes for the plan; execution can still bikeshed only with stronger DX evidence |
| Does the revised public narrative require issue/reference sync? | claim text changed around `nodeLayout`, Tiptap framing, and virtualized native-surface proof | revision pass plus issue sync pass | slate-plan | answered: yes; synced issue matrix, manual sync ledger, and PR reference with no new fixed/improved claims |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| 1. Red unit tests | execution | table row unit pagination, no AST split, oversized row policy | accepted plan | failing tests prove missing behavior | focused `plite-layout` tests |
| 2. Layout protocol | execution | `nodeLayout` page-settings/profile context, unit fragments, projected child path rects | red tests | unit tests green | `bun --filter ./packages/plite-layout test` |
| 3. React render access | execution | `PagedEditable` layout context plus pathless fragment hook, duplicate-path guard, and virtualized metrics | phase 2 green | example no longer parses path attr map, public render props still omit `path`, virtualized mode reports degraded/native-incomplete | `plite-react` tests + typecheck |
| 4. Pagination example | execution | multi-page table fixture and controls, no repeated editable headers | phase 3 green | rows span pages; same AST table; no duplicate editable path owners | Playwright `/examples/pagination` |
| 5. Broad proof and review | execution | package gates, autoreview, issue/reference sync | phases green | no accepted/actionable findings | focused + broad feasible gates |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-plite-provider-owned-page-layout-fragments.md` | final plan closure only | passed in closure run |
| current source behavior check | Plate repo root | `bun --filter ./packages/plite-layout test` | current layout tests and API shape still compile/run | passed in closure rerun |
| execution unit gate | Plate repo root | `bun --filter ./packages/plite-layout test` after accepted implementation | provider-owned fragments | passed, 35 tests |
| execution React gate | Plate repo root | `bun check` after accepted implementation | render/layout integration | passed, includes `plite-react` vitest 43 files / 403 tests |
| execution browser gate | Plate repo root | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium` | multi-page table browser behavior | passed, 12 tests |
| high-risk planning React gate | Plate repo root | `bun --filter ./packages/plite-react test:vitest -- test/dom-strategy-page-virtualization.test.tsx test/dom-coverage-native-bridge-contract.test.ts` | current virtualized/degraded DOM and model-backed coverage guards | passed in closure rerun |

Final user-review handoff outline:
- accepted plan items: `nodeLayout`, provider-owned units/fragments,
  `usePliteLayoutFragments()`, explicit `layout.getFragments(path)`,
  page/spread virtualization in paged mode, and opt-in `pageBreaks`
- before / after API shape: replace public `boxes` with
  `nodeLayout({ element, path, defaults, pageSettings, measurementProfile })`;
  renderers use pathless fragment context instead of public render-prop paths
- hard cuts: no public `boxes`, no raw Plite TableKit, no AST table splitting,
  no public `RenderElementProps.path`, no duplicate `pagination-basic`, no
  repeated editable header clones in the first execution slice
- issue claims and non-claims: closed in issue sync; summarize in closure
- proof gates: current layout/React planning gates pass; browser/native claims
  stay queued for execution and are not promoted by this planning pass
- accepted-plan execution handoff: implement tests first, then layout protocol,
  React fragment context, `/examples/pagination`, browser proof, autoreview, and
  issue/reference sync

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | complete |
| all pass rows complete or skipped with evidence | phase/pass table closed | complete |
| issue/reference sync closed | issue-ledger sync status closed | complete |
| live source grounding complete | source-backed rows cite current owners | complete |
| workspace verification recorded | verification workspace gate closed | complete |
| browser proof or N/A | planning pass makes no browser/native promotion; execution queue owns browser proof | N/A for planning closure |
| autoreview clean or N/A | N/A for planning; required for execution implementation changes | complete |
| final handoff emitted or lane remains complete | final response / next pass recorded | complete |
| `check-complete` passes | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-plite-provider-owned-page-layout-fragments.md` | complete |

Findings:
- Current source already models box kind and split vocabulary, including
  `table`, `table-cell`, and `split: 'row'`, but row splitting is not consumed
  by the pager.
- The existing provider test proves app-owned media/BFC sizing is possible, but
  only for fixed boxes, not provider-owned pagination fragments.
- The example demonstrates the right concept but dirty DX: it manually maps
  projected blocks from `data-plite-path`.
- Prior solution notes already forbid raw Plite Markdown/table product packages.

Decisions and tradeoffs:
- Choose generic node layout plans and unit/page fragments.
- Keep page/spread virtualization as the paged-mode repeated unit.
- Keep strict page-break authority opt-in.
- Accept a larger experimental layout protocol because the alternative is fake
  table pagination or AST mutation.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None in this pass | 0 | | |

External/browser findings:
- Tiptap Pages evidence is treated as failure taxonomy and product-approach
  contrast, not a system to copy. Official local docs confirm CSS
  float/BFC/table limitations and a separate heavily modified Pages TableKit.
- Pretext source supports text layout, with canvas measurement/profile drift
  caveats and arithmetic hot-path relayout.
- TanStack Virtual evidence supports internal range management, not public API.
  Plite keeps DOM coverage, selection, IME/mobile, and a11y policy.

Timeline:
- 2026-05-26 Plite Plan goal plan created.
- 2026-05-26 Current-state pass completed with live source and focused
  `plite-layout` verification.
- 2026-05-26 Related issue discovery completed from existing ledgers; no fresh
  broad GitHub issue search or ClawSweeper rerun needed.
- 2026-05-26 Issue-ledger pass completed; no ledger/reference sync edit needed
  because existing rows already cover the exact provider/split no-claim policy.
- 2026-05-26 Intent/boundary and decision brief completed; `nodeLayout` chosen
  as public experimental API and public `boxes` cut before beta.
- 2026-05-26 Research/ecosystem/live-source refresh completed; local Pretext,
  Tiptap Pages, TanStack Virtual, and `Plate repo root` source/tests still support
  `nodeLayout` plus provider-owned units/fragments.
- 2026-05-26 Performance/DX/migration/regression/simplicity pressure completed;
  pathless fragment hook, O(1) lookup, page/spread budgets, Plate/slate-yjs
  boundaries, vertical TDD queue, and simplicity cuts recorded.
- 2026-05-26 Maintainer objection ledger completed; `nodeLayout` provider context
  tightened to page settings/profile, pathless fragment hook retained, no
  TableKit/no AST split reaffirmed, and native-surface proof deferred to
  high-risk pass.
- 2026-05-26 High-risk deliberate mode completed; duplicate editable DOM rejected,
  repeated headers excluded from first execution slice, virtualized DOM kept
  degraded/native-incomplete, and DOMCoverage/materialization proof rows added.
- 2026-05-26 Ecosystem maintainer pass completed; Pretext caveat kept, Tiptap
  reframed as valid product-extension evidence but wrong raw Plite ownership,
  TanStack kept internal, and Premirror limited to derived-layout inspiration.
- 2026-05-26 Revision pass completed; final API wording normalized around
  `nodeLayout`, `usePliteLayoutFragments()`, page-settings/profile provider
  input, no repeated editable headers in the first slice, and respectful Tiptap
  divergence.
- 2026-05-26 Issue sync accounting completed; issue matrix, manual sync ledger,
  and PR reference now name the final public API target and preserve the
  no-new-claim boundary.

Verification evidence:
- `cwd=/Users/zbeyens/git/plate-2/Plate repo root`
- Closure rerun: `bun --filter ./packages/plite-layout test`
- Result: pass, 31 tests, 0 fail, 108 expects.
- Closure rerun:
  `bun --filter ./packages/plite-react test:vitest -- test/dom-strategy-page-virtualization.test.tsx test/dom-coverage-native-bridge-contract.test.ts`
- Result: pass, 2 files, 13 tests.
- Source evidence:
  `packages/plite-layout/src/index.ts:105-139` still exposes box
  kinds, row split vocabulary, and the current shallow `boxes` provider;
  `packages/plite-layout/src/index.ts:355-374` still exposes
  public `boxes`; `packages/plite-layout/src/index.ts:1970-2027`
  still paginates by estimated lines and avoid-split boxes, proving the plan's
  provider-owned unit/fragments delta is real work.
- Planning artifact proof:
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-plite-provider-owned-page-layout-fragments.md`
  passed in the closure run.

Execution evidence:
- `cwd=/Users/zbeyens/git/plate-2/Plate repo root`
- Implemented `nodeLayout` provider-owned text/box/unit plans in
  `packages/plite-layout/src/index.ts`; public `boxes` option is cut in favor
  of `nodeLayout`.
- Implemented `usePliteLayoutFragments()` as a pathless rendered-fragment hook
  in `packages/plite-layout/src/react.tsx`. The hook returns projected
  `SlateLayoutRenderedFragment` rects/units and does not expose mixed
  layout-local `top`.
- Extended existing `site/examples/ts/pagination.tsx`; no
  `pagination-basic` route was added. Controls now cover table rows, row
  height, media height, media split policy, DOM strategy, facing pages, and
  debug frames.
- Added focused unit tests for provider-owned table row units, oversized media
  policy, authoritative page breaks for provider-owned unit fragments, and
  pathless rendered-fragment access.
- Added Chromium `/examples/pagination` rows for multi-page table rendering,
  second-page cell editing, copy across page-boundary rows, duplicate
  editable-path detection, rich content inside page frames, and virtualized DOM
  strategy no-freeze.
- Final command gate: `bun check` passed.
- Browser gate:
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium`
  passed, 12 tests.
- Live dev-server smoke:
  `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium --grep "renders a multi-page table"`
  passed against the already-running `apps/www` server.
- Autoreview:
  two Codex-engine helper runs hung idle; fallback
  `../../.agents/skills/autoreview/scripts/autoreview --mode local --engine claude --no-tools`
  completed clean after the coordinate-space finding was fixed. Final
  structured result: `autoreview clean: no accepted/actionable findings
  reported`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure score and final gates are complete. |
| Where am I going? | User review; implementation starts only after explicit accepted-plan invocation. |
| What is the goal? | Review-ready plan for provider-owned paginated layout fragments and multi-page table execution. |
| What have I learned? | The best long-term API is `nodeLayout` with page-settings/profile provider input, provider-owned units/fragments, pathless `usePliteLayoutFragments()`, page/spread virtualization that reports degraded/native-incomplete until proven, opt-in strict breaks, no repeated editable header clones, no TableKit, and no AST split. Tiptap's product approach is valid in its stack but the wrong raw Plite ownership model. |
| What have I done? | Created and populated the plan, reran focused `Plate repo root` layout and React high-risk tests, closed related issue discovery, issue-ledger, intent/decision, research/live-source, pressure, maintainer-objection, high-risk, ecosystem maintainer, revision, issue-sync, and closure passes. |

Open risks:
- Planning risks: none blocking user review.
- Execution risks: duplicate DOM for repeated header/table fragments,
  browser-native behavior under page/spread virtualization, IME/composition in
  second-page cells, copy/materialization across unmounted page ranges, and
  oversized row/media policy all remain explicit execution proof gates.
