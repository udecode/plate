# exact virtualized pagination plan

Objective:
Perfect the Slate v2 exact virtualized pagination architecture plan for user
review: define the long-term exact-and-fast layout model, demote cold-block
estimation to non-authoritative skeleton use only, gate autoresearch behind a
replayable oracle, and keep issue/reference accounting conservative until
execution proof exists.

Goal plan:
docs/plans/2026-05-31-exact-virtualized-pagination-plan.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- none

Completion threshold:
- Slate Plan closure is legal only when score >= 0.92, no dimension is below
  0.85, every pass row is complete or intentionally skipped with evidence,
  issue/reference sync rows are closed, final handoff is emitted, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-exact-virtualized-pagination-plan.md`
  passes.
- Execution-ready architecture must prove these plan decisions:
  - exact layout truth comes from cached measured block/page snapshots, not
    estimated line wrapping;
  - virtualized mode may render skeleton/cold pages, but only with explicit
    `skeleton` or `pending` status;
  - selected, composing, command-target, exported, and authoritative
    collaboration/export pages use measured layout truth;
  - page/spread virtualization stays internal behind virtualized `domStrategy`;
  - table/media/BFC-like content uses provider-owned exact layout units and
    split policy, not AST mutation as the default visual pagination strategy;
  - autoresearch starts only after an exactness oracle and perf matrix exist.

Verification surface:
- Planning-only checks run in `/Users/zbeyens/git/plate-2`.
- Live source grounding is read from `/Users/zbeyens/git/plate-2/Plate repo root`
  and recorded in this plan; no Slate v2 behavior claim is made by root checks.
- Later execution proof must run from
  `/Users/zbeyens/git/plate-2/Plate repo root` and include:
  - `bun --filter slate-layout test`
  - `bun --filter slate-layout typecheck`
  - focused Chromium Playwright rows for pagination startup, rows=800
    virtualized typing/scroll, multi-page table, margin hit testing, selection,
    and fast-scroll mounting
  - an exact-layout oracle comparing full measured layout against virtualized
    incremental snapshots for the same document/font/page inputs
  - a perf matrix comparing staged vs virtualized on rows 8, 500, 800, and the
    default ~1000-page route
  - `bun check` before accepted execution handoff, and `bun check:full` before
    any release-quality browser claim.

Constraints:
- Planning mode only in this activation: no `Plate repo root` implementation
  patch.
- Raw Slate stays unopinionated. Plate owns product pagination UI, export
  policy, table UX, and docs product ergonomics.
- `slate-layout` may own generic layout truth, page snapshots, measurement
  profiles, layout providers, and split policy protocols.
- `slate-react` may consume layout for DOM materialization, page/spread
  mounting, and browser behavior proof, but must not expose TanStack or
  estimation internals as public editor semantics.
- No public API should teach users to tune typing correctness or layout truth
  with arbitrary debounce/estimate knobs.

Boundaries:
- Allowed planning edits: `docs/plans/**`, `docs/research/**`,
  `docs/slate-issues/**`, `docs/slate-v2/ledgers/**`, and
  `docs/slate-v2/references/**`.
- Current source read scope:
  - `packages/slate-layout/src/index.ts`
  - `packages/slate-layout/src/react.tsx`
  - `packages/slate-layout/src/page-mount-plan.ts`
  - `apps/www/src/app/(app)/examples/slate/_examples/pagination.tsx`
  - `apps/www/tests/slate-browser/donor/examples/pagination.test.ts`
- Current research/ledger read scope:
  - `docs/research/README.md`
  - `docs/research/index.md`
  - `docs/research/log.md`
  - `docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md`
  - `docs/research/sources/editor-architecture/layout-measurement-and-ime-lanes.md`
  - `docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md`
  - `docs/slate-issues/gitcrawl-live-open-ledger.md`
  - `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
  - `docs/slate-issues/requirements-from-issues.md`
  - `docs/slate-issues/benchmark-candidate-map.md`
  - `docs/slate-v2/ledgers/issue-coverage-matrix.md`
  - `docs/slate-v2/ledgers/fork-issue-dossier.md`
  - `docs/slate-v2/references/pr-description.md`
- Non-goal for this pass: implementation, commit, PR, broad GitHub issue
  discovery, or broad raw-research refresh.

Blocked condition:
- Blocked only if the next pass requires missing local ledgers/source/research
  that cannot be read or regenerated locally. Do not use blocked while issue,
  research, source-grounding, score-hardening, verifier-design, or plan-edit
  work remains runnable.

Slate Plan lane state:
- slate_plan_lane_status: pending
- current_pass: issue-ledger-pass
- current_pass_status: complete
- next_pass: intent-boundary-pass
- next_action: harden the intent/boundary record and decision brief against the
  completed current-state, related-discovery, and issue-ledger findings
- final_handoff_status: pending

Current verdict:
- verdict: revise the current perf plan into an exact-layout architecture plan;
  current `estimateBlock` is acceptable only as a temporary non-authoritative
  skeleton path.
- confidence: 0.75 after current-state read, related issue discovery, and
  issue-ledger pass.
- keep / cut / revise call: keep Pretext and page-level virtualization; revise
  layout authority; cut any public claim that cold-block estimation is precise.
- reason: live Slate v2 already has a strong layout substrate, page/spread
  mounting, provider-owned table/media units, page-break snapshot vocabulary,
  and high-signal Playwright perf rows. The weak spot is authority: current
  `PretextPageLayoutEngineOptions.estimateBlock` lets virtualized cold prose
  skip exact measurement, so it cannot be the long-term truth for collab, export,
  or selected/editing pages.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every Slate Plan completion
  gate below is satisfied and the plan checker passes.
- This activation completed exactly one scheduled pass: issue-ledger pass.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `slate-plan` invoked; planning mode selected because the latest request asks to perfect the plan. |
| Active goal checked or created | yes | First planning goal hit budget; user asked for a shorter goal; `create_goal` created `Finish remaining Slate Plan passes for exact virtualized pagination. Planning only.` |
| Source of truth read before edits | yes | Read live `slate-layout`, `PagedEditable`, page mount plan, pagination example, focused pagination tests, research pages, and durable issue/reference rows. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: this pass is planning-only and does not patch existing implementation. |
| Live `Plate repo root` grounding needed for current-state claims | yes | Current owners and exact gaps are cited below from `Plate repo root`. |

Work Checklist:
- [x] Objective includes lane outcome, pass policy, completion threshold,
      verification surface, constraints, boundaries, and blocked condition.
- [x] One-pass-per-activation policy respected: this activation completed only
      current-state read and initial score.
- [x] Live source grounding recorded for current implementation claims.
- [x] Related issue discovery / ClawSweeper pass applied or skipped with
      concrete evidence: existing durable pagination rows cover the touched
      surface, so broad live GitHub and ClawSweeper rerun are skipped for this
      pass.
- [x] Issue-ledger pass scanned generated live rows, manual sync ledger,
      historical open ledger, issue/test/benchmark candidate maps, package
      impact matrix, requirements file, coverage matrix, fork dossier, and PR
      reference for exact-pagination relevance.
- [ ] Research and ecosystem synthesis complete for every external system used
      as evidence.
- [ ] Intent/boundary record and decision brief complete.
- [ ] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [ ] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [ ] Slate maintainer objection ledger complete for every breaking/paradigm
      change, or marked N/A with reason.
- [ ] Verification workspace gate recorded for every Slate v2 source, runtime,
      browser, package, public API, or issue-fix claim.
- [ ] TDD used for behavior/proof changes with a sane test surface, or marked
      N/A with reason.
- [ ] Browser proof captured for browser-surface claims, or marked N/A with
      reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Finalize exact oracle, perf matrix, issue sync, and closure proof gates | pending |
| Slate v2 source/runtime/browser/API claim | yes | Record `Plate repo root` command/proof or keep as planning-only | current-state pass has source reads only; behavior proof belongs to execution |
| Issue ledger or PR reference changed | no for issue-ledger pass | Sync ledger/reference rows or record why no sync applies | No sync applies in this pass: the full issue-ledger scan found no new fixed/improved/stale/duplicate claim and existing rows already match the no-new-claim exact-layout target. |
| Autoreview for uncommitted implementation changes | no | Run autoreview in `Plate repo root` after non-trivial execution edits | N/A planning-only |
| Final user-review handoff | pending | Emit final handoff or keep plan pending with next pass | pending |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-exact-virtualized-pagination-plan.md` | pending; not eligible this activation |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | live source, research, issue/reference rows read; initial score 0.72 | related issue discovery |
| Related issue discovery | complete | reused existing durable pagination issue rows in `gitcrawl-v2-sync-ledger.md`, `issue-coverage-matrix.md`, `fork-issue-dossier.md`, live rows for `#5944` and `#790`, and PR reference pagination target; no broad live GitHub or ClawSweeper rerun needed | issue-ledger pass |
| Issue-ledger pass | complete | scanned generated live ledger, manual sync ledger, historical open ledger, cluster/requirements/package surfaces, test and benchmark candidate maps, coverage matrix, fork dossier, and PR reference; added explicit non-claim/guardrail rows for `#5924`, `#4141`, and broader performance backlog | intent/boundary pass |
| Intent/boundary and decision brief | pending | draft below | research refresh |
| Research, ecosystem strategy, live-source refresh | pending | draft below | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | pending | draft below | objection ledger |
| Slate maintainer objection ledger | pending | draft below | high-risk pass |
| High-risk deliberate mode | pending | | ecosystem maintainer pass |
| Ecosystem maintainer pass | pending | | revision pass |
| Revision pass | pending | | issue sync accounting |
| Issue sync accounting | pending | | closure score and final gates |
| Closure score and final gates | pending | | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.75 | Current `PagedEditable` uses `useSyncExternalStore`, memoized geometry/projection, page mount items, and virtualized page surfaces; issue scan confirms `#790`, `#5131`, `#2051`, and `#4141` keep perf proof benchmark-gated. |
| Slate-close unopinionated DX | 0.20 | 0.79 | Current public shape is small: `useSlateLayout`, `PagedEditable`, `pageView`, `domStrategy`, `nodeLayout`, `pageBreaks`. Issue scan confirms custom layout pressure `#3892` should stay generic, not product-specific. |
| Plate and slate-yjs migration backbone | 0.15 | 0.68 | Existing `pageBreaks` read/write vocabulary and `measurementProfile` are promising, and issue scan reinforces metadata/provider protocols; authoritative snapshot semantics, profile drift, and collaboration/export ownership still need pass hardening. |
| Regression-proof testing strategy | 0.20 | 0.76 | Focused Playwright rows already cover rows=800 virtualized perf, startup/dropdown, fast scroll, margin hit testing, selection, and multi-page table stress; issue/test/benchmark maps confirm `#5944` is not direct TDD and `#790` needs benchmark harness proof. |
| Research evidence completeness | 0.15 | 0.76 | Pretext/Tiptap/TanStack compiled pages are read, related discovery reused durable pagination rows, and issue-ledger pass scanned requirements, package impact, test candidate map, benchmark candidate map, historical ledger, live ledger, coverage matrix, fork dossier, and PR reference. |
| shadcn-style composability and minimalism | 0.10 | 0.76 | Pagination example controls are proof-oriented and URL-backed; final plan still needs a sharper public/private split for measurement and skeleton status. |
| Weighted total | 1.00 | 0.75 | Current-state plus related-discovery plus issue-ledger score only; closure threshold is not met. |

Source-backed architecture north star:
- target shape: exact measured layout snapshots are the only authoritative page
  truth. Virtualized rendering may use skeleton/cold estimates only with
  explicit status and must promote to exact measurement for visible, selected,
  composing, command-target, export, collab, and authoritative snapshot paths.
- source evidence:
  - `packages/slate-layout/src/index.ts:401-409` exposes
    `estimateBlock`, currently returning a boolean rather than an accuracy or
    authority contract.
  - `packages/slate-layout/src/index.ts:392-399` already defines
    `pageBreaks` read/write sources, so strict-fidelity snapshots have a
    natural home.
  - `packages/slate-layout/src/index.ts:272-285` stores
    `measurementProfile`, `pageBreaks`, `pageBreaksStatus`, pages, blocks, and
    fragments in snapshots.
  - `packages/slate-layout/src/index.ts:1928-2325` implements
    the Pretext engine and measured block cache, but cold estimation bypasses
    exact Pretext line measurement.
  - `packages/slate-layout/src/react.tsx:620-760` virtualizes
    page surfaces and visible page content through page mount items.
  - `packages/slate-layout/src/page-mount-plan.ts:1-160` maps
    fragments/pages to mount items and filters by viewport/overscan.
  - `apps/www/src/app/(app)/examples/slate/_examples/pagination.tsx:1586-1600` uses
    `estimateBlock` for virtualized rich stress blocks that are not active.
- rejected drift: do not let skeleton estimates masquerade as exact page breaks;
  do not expose TanStack item ranges as the API; do not split table AST nodes
  as the default visual pagination fix; do not make apps choose typing/layout
  correctness by prop tuning.
- migration posture: keep `measurementProfile` and `pageBreaks` as metadata over
  Slate value/commits. Plate/export/collab can opt into authoritative snapshots
  without changing raw Slate's JSON document model.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Layout engine | Keep `engine?: SlatePageLayoutEngine`; add a measured-cache/incremental engine contract instead of public estimation truth | Advanced users can swap engines; normal users use default Pretext | `estimateBlock` should become private/internal or renamed to skeleton-only policy if retained | `index.ts:401-409`, `index.ts:2822-2847` | revise |
| Snapshot status | Add or formalize `layoutStatus` / block-page status: `authoritative`, `pending`, `skeleton` | Consumers can decide whether page breaks are strict enough for export/collab | Keeps current `pageBreaksStatus` idea, expands status semantics | `index.ts:272-285`, `index.ts:392-399` | add |
| Page view | Keep `pageView?: { mode?: 'single' | 'spread'; gap?: number }` | Small display API; no `pageVirtualization` prop | Virtualized page/spread mounting stays driven by `domStrategy` | `react.tsx:360-438`, PR reference pagination target | keep |
| Node layout providers | Keep generic provider/split protocols; strengthen docs/tests for tables/media | Apps/Plate provide exact row/media units without product TableKit in raw Slate | No AST table split required for visual page fragments | `pagination.tsx:1690-1768`, `index.ts:80-114` | keep/revise |
| Authoritative page breaks | Keep `pageBreaks` read/write; define profile-aware snapshot semantics | Strict users can read/write agreed page breaks | Default editing remains local derived layout | `index.ts:392-399`; Pretext research drift evidence | revise |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Measurement | `slate-layout` Pretext engine | Exact block measurement cache keyed by text/runs/style/page width/measurement profile, with dirty invalidation | Canvas/Pretext work on every hot edit | `index.ts:1928-2325` | keep and harden |
| Incremental composition | `slate-layout` snapshot composer | Recompute from earliest dirty block/page until page breaks converge; reuse prefix measurements/fragments | Whole-document layout churn in huge docs | current options have no dirty-input contract | add |
| Skeleton layout | `slate-layout` internal engine path | Non-authoritative cold-page approximation with explicit status and promotion path | False precision in collab/export/page-break truth | `estimateBlock` boolean path | revise hard |
| Page materialization | `slate-layout/react` + `slate-react` domStrategy | Page/spread mount plan owns repeated unit in paged mode; block virtualization remains for continuous/pathological docs | Rendering every page or leaking virtualizer API | `react.tsx:620-760`, `page-mount-plan.ts:1-160` | keep |
| Provider boxes | `nodeLayout` provider | Exact provider-owned units with split policy and intrinsic sizing for rows/media/BFC-like blocks | AST mutation, CSS float tricks, product TableKit in raw Slate | `pagination.tsx:1690-1768`, Tiptap research | keep/revise |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| `useSlateLayout` | `useSlateLayout(editor, { page, typography, nodeLayout, engine?, pageBreaks? })` | Hook returns external-store layout; options remain Slate-shaped | Engine/nodeLayout/page changes refresh settings; hot text path must use dirty invalidation | `react.tsx:95-138` | keep |
| `PagedEditable` | `<PagedEditable layout={layout} pageView={...} domStrategy={...} />` | Page chrome from `renderPage`, content from Slate editable overlay | Virtualized `domStrategy` mounts page surfaces and visible content only | `react.tsx:360-760` | keep |
| Pagination example | Controls demonstrate page/layout stress and URL-backed proof | Example may show rows, row height, media split, page overscan, strategy, stress pages | Example must not teach fake stress page node types or estimation as correctness | `pagination.tsx:443-564`, `pagination.tsx:1586-1600` | keep/revise copy/status |

Plate migration-backbone target:
| Pressure | Slate substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Product pagination UI | Raw Slate exposes exact snapshots, status, page geometry, and providers | Plate wraps with page chrome, export UX, controls, and docs | Raw Slate does not ship product page editor UI | PR reference package baseline | keep |
| Tables/media | Generic provider units and split policy | Plate table/media plugins provide exact row/media geometry and special UX | Raw Slate product TableKit | Tiptap research table warning, current `nodeLayout` example | keep |
| Export/collab strict fidelity | `pageBreaks` authoritative snapshots plus measurement profile | Plate/export can store agreed page breaks or server/client authority | Default local editing does not promise cross-client exactness | Pretext drift research | revise |

slate-yjs migration-backbone target:
| Pressure | Slate substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Page-break determinism | Page breaks are metadata over document state, never document nodes by default | Yjs may sync `pageBreaks` state field when an authoritative source is enabled | No default cross-client byte-identical page breaks while Pretext uses canvas measurement | `pageBreaks` options, Pretext drift evidence | keep with opt-in |
| Pending/skeleton pages | Skeleton layout is local runtime state | Do not sync skeleton/estimated page breaks as authoritative | No collaboration truth from `estimateBlock` | current `estimateBlock` boolean path | revise hard |
| Provider layout | Provider-owned units must be deterministic from document+profile inputs | Sync semantic table/media nodes; derive visual fragments locally or from authoritative snapshot | No AST row splitting as default collaboration model | current table `nodeLayout` units | keep |

Intent / boundary record:
- intent: stop treating virtualized pagination perf as a choice between exact
  but slow and approximate but fast. Long-term answer is exact layout caches plus
  incremental recomposition, with non-authoritative skeletons only where a user
  cannot observe or depend on exact page breaks yet.
- outcome: a user-review-ready plan that lets execution auto-iterate until
  virtualized mode is close to staged mode while preserving exact layout truth
  for active/editing/export/collab paths.
- in-scope: `slate-layout` engine contract, measured cache, snapshot status,
  incremental composition, page/spread virtualization, provider boxes, exactness
  oracle, perf matrix, issue/non-claim accounting, and autoresearch launch gate.
- non-goals: implementing in this pass, replacing Pretext, promising
  cross-platform page-break determinism by default, raw Slate product TableKit,
  exposing TanStack internals, or adding public debounce/estimate props.
- decision boundaries: this plan may choose API direction, internal ownership,
  proof gates, rejected alternatives, and autoresearch criteria without another
  user question. Execution details may vary as long as exactness and perf gates
  pass.
- unresolved user-decision points: none for planning. The remaining uncertainty
  is proof, not direction.

Decision brief:
- principles:
  - exactness is a contract, estimation is a rendering tactic;
  - layout stays derived from Slate state and measurement profile;
  - page virtualization changes mounting, not document truth;
  - provider boxes own complex layout without semantic AST mutation by default;
  - public APIs name Slate concepts, not implementation libraries.
- top drivers:
  - huge-document typing/scroll latency;
  - page-break fidelity for export/collab;
  - table/media split correctness;
  - native browser behavior under missing DOM;
  - small raw Slate DX.
- viable options:
  1. current cold-block estimation as public strategy;
  2. exact incremental layout with skeleton fallback status;
  3. DOM measurement authority for all visible and offscreen blocks;
  4. CSS/page-gap pagination like Tiptap Pages;
  5. AST splitting for tables/pages.
- chosen option: option 2. Exact measured snapshots are authoritative;
  skeletons are clearly marked and promoted. This is the only option that can be
  both fast and honest.
- rejected alternatives:
  - option 1 is fast but lies about precision under collaboration/export;
  - option 3 cannot scale and will reintroduce DOM hot-path dependency;
  - option 4 inherits Tiptap Pages' BFC/table/media limits;
  - option 5 mutates semantics for visual pagination and is poisonous for
    collaboration unless explicitly requested by a product adapter.
- consequences: more layout-state machinery and stronger tests, but much better
  DX: users get exact snapshots/status instead of guessing which pages are fake.
- follow-ups: related issue pass, exactness oracle design, perf matrix, raw
  research refresh only if existing Pretext/Tiptap/TanStack pages are
  insufficient.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| `#5944` | Related, issue-reviewed | Exact pagination/page-break stability is directly related, but this plan does not claim closure yet. | Live ledger names stable per-line pagination as current open issue; existing sync ledger requires page-boundary flicker, caret mapping, and page-break stability proof. | Exact full-vs-virtualized layout oracle plus browser page-boundary caret tests. | Existing row says issue-reviewed, unchanged. | related matrix only |
| `#790` | Related proof-route backlog | Page/spread virtualization addresses dynamic rendering pressure but cannot be claimed until mount/edit/scroll benchmark proof lands. | Existing coverage matrix requires mount/edit/scroll benchmarks, mounted-count proof, DOM coverage, and native behavior proof. | rows 8/500/800/default matrix, DOM/page count, fast scroll, typing, native behavior rows. | Existing row says unchanged/proof-route backlog. | related matrix only |
| `#5924` | Not claimed | Structural page/table/debug DOM pressure is adjacent but the thread has no clean isolated repro and should not become a public ignore-cursor API. | Test candidate map keeps it as not-a-test-candidate and useful only as an advanced-layout capability note. | No direct proof route; keep as provider/split/DOM coverage pressure only. | Existing row says not claimed, unchanged. | related matrix only |
| `#4141` | Existing improves unchanged / guardrail | Nested rerender breadth is already improved by existing runtime benchmark rows; this exact-layout plan must not widen that breadth. | Coverage matrix preserves existing `Improves`; future layout subscriptions must preserve locality. | profiler/render counters during layout snapshot and page virtualization work. | Existing row says improves-claimed, unchanged. | related matrix only |
| `#5131`, `#2051` | Guardrail | Layout snapshots and page virtualization must not widen subscriptions/rerenders. | Existing sync ledger keeps them as subscription/performance guardrails. | render/profiler counters during selection and typing. | unchanged. | related matrix only |
| `#2793`, `#2572` | Release guard / not claimed | Missing-DOM virtualized mode needs screen-reader/a11y policy before broad native parity claims. | Existing rows keep accessibility as guardrail, not fixed claim. | assistive-tech/browser policy proof before any parity claim. | unchanged. | related matrix only |
| `#3892` | Policy non-claim | Generic layout substrate helps custom surfaces; product custom layout engines stay outside raw Slate closure. | Existing rows preserve custom layout as product/adaptor pressure. | docs/API only if public extension point changes. | unchanged. | related matrix only |
| `#5945`, `#4056`, `#5992` | Existing improves unchanged | Large operation/clipboard benchmark claims are not promoted by pagination work. | Existing ledgers own these claims separately. | no pagination proof should rewrite them. | unchanged. | no PR change |
| Broader performance proof-route backlog: `#2733`, `#2669`, `#5216`, `#5592`, `#4202`, `#4210`, `#3748`, `#5349`, `#4025` | Not claimed / backlog | These rows reinforce benchmark discipline but are not fixed or improved by this exact pagination plan. | Coverage matrix groups them as performance proof-route backlog until an execution slice adds exact benchmark, browser, retained-memory, or static-rendering proof. | no proof route in this plan unless execution touches their exact workload. | unchanged. | no PR change |

Issue-ledger sync status:
- ClawSweeper related-issue pass: skipped with evidence for this surface.
  Existing durable rows already cover the immediate pagination surface:
  `#5944`, `#790`, `#5924`, `#4141`, `#5131`, `#2051`, `#2793`, `#2572`,
  `#3892`, `#5945`, `#4056`, and `#5992`.
- generated live gitcrawl rows read: targeted rows read for `#5944` and `#790`.
- manual v2 sync ledger update: not needed in related-discovery pass. Existing
  `gitcrawl-v2-sync-ledger.md` rows already keep `#5944` issue-reviewed,
  `#790` proof-route backlog, `#5924` not claimed, `#5131`/`#2051` guardrails,
  and large-operation issues unchanged.
- fork issue dossier update: not needed in related-discovery pass. Existing
  dossier section already says `pageBreaks` are opt-in, `domStrategy` owns
  internal page/spread virtualization, and table/media/BFC pagination uses
  generic provider/split protocols.
- issue coverage matrix update: not needed in related-discovery pass. Existing
  matrix already has no fixed/improved claim for this pagination target.
- PR description sync: not needed in related-discovery pass. Current reference
  already records the small beta API target, `measurementProfile`,
  `pageBreaks`, and provider protocols.
- full issue-ledger pass: complete. `open-issues-ledger.md`,
  `gitcrawl-clusters.md`, `issue-clusters.md`, `test-candidate-map/`,
  `benchmark-candidate-map.md`, `package-impact-matrix.md`, and
  `requirements-from-issues.md` were scanned for pagination, virtualization,
  dynamic rendering, large-document, page-break, layout, table/media/BFC,
  accessibility, custom layout, subscription, and rerender relevance.
- full issue-ledger conclusion: no additional fixed or improved claim should be
  added. `#5924` and `#4141` are now explicit in the plan matrix; broader
  performance backlog rows remain not claimed unless execution later targets
  their exact workload.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| Pretext | `docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md` | `prepare()` does expensive measurement, `layout()` is arithmetic; measurement remains canvas/profile-sensitive today. | DOM reflow in the hot layout path. | Precompute/hot-path split, measurement profiles, and explicit fidelity caveat. | Default cross-client/server page-break determinism while canvas measurement is the measurement source. | Pretext default engine plus authoritative snapshot opt-in. | partial |
| Premirror | `docs/research/sources/editor-architecture/layout-measurement-and-ime-lanes.md` | snapshot -> measure -> compose -> render; pages/fragments are derived. | Layout becoming document model. | Derived layout lane and page chrome outside content. | Encoding page fragments as Slate document nodes. | `slate-layout` snapshots/fragments stay derived. | agree |
| Tiptap Pages | `docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md` | CSS floats/page gaps plus special table package for tables. | Pretending complex blocks split automatically. | Failure taxonomy: BFC blocks, tables, figures, images, padding, oversized nodes. | CSS-float pagination, manual AST splitting as default, raw Slate product TableKit. | provider-owned split protocols and exact box units. | diverge |
| TanStack Virtual | `docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md` | Headless range engine, measured items, overscan, retained indexes. | Rendering every repeated unit. | Internal range engine and repeated-unit discipline. | Public TanStack-shaped options or letting it own selection/copy/IME/a11y policy. | Internal page/spread mount plan behind `domStrategy`. | partial |
| Current Slate v2 | live `Plate repo root` files listed above | Pretext engine, page mount plan, `PagedEditable`, node layout provider, Playwright perf rows. | Starting from theory only. | Existing substrate and tests. | Current boolean `estimateBlock` as authoritative layout. | exact snapshots + skeleton status + incremental oracle. | revise |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Slate v2 target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| page-boundary caret flicker | Pagination issue pressure reports unstable per-line page behavior | exact measured page breaks for visible/selected pages | browser page-boundary caret and line mapping rows | `slate-layout` + `slate-react` | pending execution |
| virtualized missing DOM | large docs cannot render everything but native behavior depends on DOM | page/spread mount plan with selected/composing/target retention and explicit degradation policy | fast scroll, selection, copy/find/a11y policy rows | `slate-react` | pending execution |
| inaccurate cold pages | estimated blocks can shift page breaks | skeleton status cannot be exported/synced as truth | full measured vs virtualized oracle | `slate-layout` | pending execution |
| table/media page split | CSS/AST hacks break semantics | provider-owned exact units and split policies | multi-page table/media fixture | `slate-layout` + plugins/examples | pending execution |
| subscription/rerender breadth | layout snapshots can cause broad React work | narrow external-store snapshots and memoized projections | profiler/render counters | `slate-layout/react` | pending execution |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| exact oracle | same document rendered full measured vs virtualized/incremental | unit/browser hybrid | new `slate-layout` oracle test | identical authoritative page breaks/fragments for promoted pages | pending |
| rows=800 virtualized perf | `/examples/pagination?page_layout=single&rows=800&strategy=virtualized` | Chromium first | focused existing Playwright row | p95 <= staged envelope, DOM <= 600, page surfaces <= 8 | existing row, final rerun pending |
| default 1000-page route | `?strategy=virtualized` with stress pages | Chromium first | startup/dropdown/typing/scroll Playwright cluster | visible content < 800ms app-ready, no node replay storm, bounded DOM | existing rows, final rerun pending |
| multi-page table | table spanning around 10 pages | Chromium first | table fixture proof + rows 500/800 matrix | no AST split, rows mounted around viewport, click/edit works | existing rows, final rerun pending |
| page margin selection | left/right margin line start/end hit testing | Chromium first | existing margin hit testing rows | native-ish click target resolution | existing rows, final rerun pending |
| a11y/native missing DOM | virtualized page content | later browser/device/AT lane | policy proof before broad parity claim | no false native equivalence claim | guarded |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Current source grounding | `Plate repo root` | targeted `sed` / `rg` reads for `slate-layout`, `PagedEditable`, page mount plan, pagination example, and pagination tests | complete for current-state pass; no behavior proof claimed | slate-plan |
| Planning artifact integrity | `plate-2` | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-exact-virtualized-pagination-plan.md` | pending; not eligible this activation | closure pass |
| Exact layout oracle | `Plate repo root` | command TBD in execution plan | pending | execution |
| Focused layout/package gate | `Plate repo root` | `bun --filter slate-layout test && bun --filter slate-layout typecheck` | pending | execution |
| Focused pagination browser gate | `Plate repo root` | `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "<pagination cluster>" --reporter=line` | pending | execution |
| Fast package gate | `Plate repo root` | `bun check` | pending | execution |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | pending | React external-store/page projection and memoized render work are in scope. | future pass must answer subscription breadth and render loops. |
| performance-oracle | yes | pending | Exactness + virtualization needs complexity and cache invalidation review. | future pass must define dirty-range complexity and memory tags. |
| performance | yes | pending | Needs cohort matrix, interaction p95/p99, DOM/page count, memory/status policy. | future pass must finish perf matrix. |
| tdd | yes | pending | Exactness oracle must be test-first before autoresearch. | execution queue starts with oracle red test. |
| shadcn | maybe | pending | Example controls are UI proof surface, but core API is not UI. | likely skip or constrain to example control minimalism. |
| react-useeffect | yes | pending | `PagedEditable` scroll/resize viewport effects and layout refresh effects are in scope. | future pass should check effect dependencies and external synchronization. |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| skeleton treated as truth | export/collab reads estimated page breaks | inconsistent page numbers/breaks across clients | explicit snapshot/block/page status and promotion before authority | exactness oracle + snapshot status tests | pending |
| incremental layout under-invalidates | edit before page N | stale downstream page breaks | recompute suffix until page-break convergence | full measured vs incremental oracle | pending |
| over-invalidates | every edit | virtualized becomes slower than staged | dirty block/page ranges, prefix reuse, measured cache | perf matrix | pending |
| table/media split lies | large table/media crosses page | visual split mismatches semantic model or selection | provider units with exact split policy | multi-page table/media tests | pending |
| public API bloat | pressure to expose virtualizer/estimate knobs | sticky low-level API | keep public API Slate-shaped and private implementation free | API review | pending |

Slate maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| Exact snapshots plus skeleton status | More states than a simple snapshot. | Extra state is cheaper than lying about precision. | Current `estimateBlock` has no authority vocabulary. | Document status and require promotion for export/collab/selection. | accept, proof pending |
| Incremental composition | Page breaks can ripple far. | Honest suffix recomposition beats whole-doc compose and fake local fixes. | Current `SlatePageLayoutSnapshot` already has blocks/fragments/pages; missing part is dirty input. | Oracle must compare against full measured layout. | accept, proof pending |
| Provider-owned split policy | Plugins must provide sizing/layout hints. | Complex boxes need owner knowledge; raw Slate cannot infer table semantics generically. | Tiptap Pages needed special table package; current `nodeLayout` proves generic provider shape. | Keep raw protocol generic and Plate owns product adapter. | accept |
| Authoritative page breaks opt-in | Default collab/export page breaks can drift. | Honest local default plus opt-in authority is better than false determinism. | Pretext uses canvas measurement today. | Store measurement profile and optional pageBreak snapshot source. | accept |
| Autoresearch after oracle | Delays research automation. | Without an oracle, autoresearch optimizes vibes. | Existing Playwright/perf rows prove the need for exact counters. | Build oracle first, then let autoresearch mutate internals against it. | accept |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| Public `estimateBlock` as precision contract | cut/revise | Boolean estimation cannot represent authority, drift, or promotion. | rename/private or status-gated if retained. | `index.ts:401-409` | API pass |
| Public `pageVirtualization` prop | reject | `domStrategy` already owns DOM materialization; extra prop splits responsibility. | none. | PR reference target | keep out |
| TanStack options in public API | reject | Range engine is implementation detail. | none. | TanStack research | keep internal |
| AST table/page splitting by default | reject | Visual pagination should not mutate semantic/collab model. | none for raw Slate. | Tiptap research | provider split policy |
| Exact measured snapshots | keep | Only credible source for export/collab/selected layout truth. | internal engine/cache work. | current Pretext/measured block cache | implement after plan accepted |
| Skeleton cold pages | keep only as non-authoritative | Needed for huge-doc perceived perf, but never truth. | status API/docs/tests. | current `estimateBlock` route | formalize |

Plan deltas from review:
- Created a fresh Slate Plan from the `slate-plan` template.
- Current-state pass re-grounded the plan in live `Plate repo root` source, not
  old architecture notes.
- Related issue discovery pass reused existing durable pagination issue rows
  and explicitly skipped broad live GitHub/ClawSweeper rerun because no fixed,
  improved, duplicate, stale, or new claim text changed.
- Issue-ledger pass scanned the full cached issue surfaces and promoted
  `#5924`, `#4141`, and the broader performance proof-route backlog from
  sync-status context into explicit plan accounting.
- Reframed "cold-block estimation" as skeleton-only, not precise layout.
- Promoted the exactness oracle to the first execution artifact.
- Moved autoresearch behind the oracle/perf matrix gate.
- Kept existing issue claims conservative: no new fixed or improved issue claim
  from planning.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Should `estimateBlock` stay public under a new name, or become engine-private? | Public shape affects DX and future compatibility. | API pass plus example/readme pressure. | next passes | pending |
| What exact status vocabulary is enough? | Too little lies; too much bloats API. | source/API pass with export/collab examples. | next passes | pending |
| How much suffix recomposition is acceptable after an early edit? | Determines whether exact incremental layout can match staged perf. | oracle + rows 8/500/800/default perf matrix. | execution | pending |
| Does authoritative page-break writing need conflict metadata? | Collab/export strict mode may need source/profile ownership. | slate-yjs/export pass or focused design row. | future pass | pending |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| 1. Exactness oracle | slate-plan execution mode | Full measured layout vs virtualized/incremental layout contract | user accepts ready plan | oracle fails on current skeleton truth where expected, then passes after exact promotion | `bun --filter slate-layout test` |
| 2. Snapshot status/API | slate-plan execution mode | `authoritative` / `pending` / `skeleton` semantics and docs/tests | phase 1 red contract exists | consumers can distinguish strict vs approximate page data | unit tests + typecheck |
| 3. Incremental measured cache | slate-plan execution mode | dirty block/page invalidation, prefix reuse, suffix recomposition | status API set | exact oracle green and perf matrix improves | layout tests + Playwright |
| 4. Provider box hardening | slate-plan execution mode | table/media unit exactness, split policy, multi-page fixture | phase 3 baseline | multi-page table/media no AST split and bounded DOM | Playwright table/media rows |
| 5. Autoresearch loop | codex-autoresearch/autogoal execution mode | optimize internals against oracle/perf matrix | oracle and matrix exist | measurable perf target reached without exactness regression | repeated verifier command |
| 6. Review and closeout | autoreview + slate-plan | dirty-local review, issue sync, PR reference sync | implementation green | no accepted/actionable findings, ledgers current | autoreview + `bun check` |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | `/Users/zbeyens/git/plate-2` | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-exact-virtualized-pagination-plan.md` | final plan/template integrity | pending; not eligible this pass |
| current source grounding | `/Users/zbeyens/git/plate-2/Plate repo root` | targeted source reads listed in Boundaries | current-state claims | complete |
| exact oracle | `/Users/zbeyens/git/plate-2/Plate repo root` | TBD `slate-layout` test command | exactness preserved under virtualization/incremental layout | pending execution |
| perf matrix | `/Users/zbeyens/git/plate-2/Plate repo root` | focused pagination Playwright cluster | virtualized approximates staged envelope at rows 8/500/800/default | pending execution |
| package gate | `/Users/zbeyens/git/plate-2/Plate repo root` | `bun check` | fast source quality gate | pending execution |

Final user-review handoff outline:
- accepted plan items: pending final pass.
- before / after API shape: draft target is current Pretext/page layout API with
  skeleton estimation revised into explicit non-authoritative status and exact
  measured snapshots as truth.
- hard cuts: no public precision claim from `estimateBlock`, no public
  `pageVirtualization`, no TanStack public API, no AST table split default, no
  cross-client page-break determinism by default.
- issue claims and non-claims: draft keeps `#5944` and `#790` related only
  until exact browser/perf proof exists.
- proof gates: exact oracle, perf matrix, focused pagination browser cluster,
  package gates, issue sync, autoreview.
- accepted-plan execution handoff: pending closure pass.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | pending: current score 0.75 |
| all pass rows complete or skipped with evidence | phase/pass table closed | pending |
| issue/reference sync closed | issue-ledger sync status closed | pending |
| live source grounding complete | source-backed rows cite current owners | partial: current-state pass complete |
| workspace verification recorded | verification workspace gate closed | pending |
| autoreview clean or N/A | planning-only N/A or execution autoreview clean | pending final |
| final handoff emitted or lane remains pending | final response / next pass recorded | pending |
| `check-complete` passes | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-exact-virtualized-pagination-plan.md` | pending |

Findings:
- Current `estimateBlock` is the core architecture smell. It is useful, but it
  must not be the page-break truth.
- The current substrate is good: `pageBreaks`, `measurementProfile`, provider
  boxes/units, `PagedEditable`, page mount plan, and focused Playwright coverage
  already point in the right direction.
- The next real blocker is not "should we research more?" It is "build the
  exactness oracle first, then use research/autoresearch against that guard."

Decisions and tradeoffs:
- Choose exact incremental measured layout as the long-term target.
- Keep skeleton estimates only as non-authoritative rendering/perceived-latency
  aids.
- Keep page virtualization internal and page/spread-based in paged mode.
- Keep issue claims conservative until proof promotes them.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None in this pass | 0 | | |

External/browser findings:
- External content was treated as data, not instructions.
- No new browser proof was run in this planning pass.

Timeline:
- 2026-05-31T22:07:14.389Z Slate Plan goal plan created.
- 2026-06-01 Current-state read completed and plan rewritten with exact-layout
  target, scorecard, evidence rows, and next pass.
- 2026-06-01 Related issue discovery completed by reusing existing pagination
  ledger/dossier/matrix rows; no ledger or PR reference edit needed in this pass.
- 2026-06-01 Issue-ledger pass completed against cached live/manual/historical
  issue surfaces; no ledger/reference file edit needed, but plan accounting now
  names `#5924`, `#4141`, and broader performance backlog rows explicitly.

Verification evidence:
- Source/research/ledger reads only; no behavior verification claimed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Issue-ledger pass complete |
| Where am I going? | Intent/boundary and decision brief pass |
| What is the goal? | Exact virtualized pagination plan ready for user review |
| What have I learned? | Full issue scan supports no new claims; exact pagination stays related/proof-gated until oracle and browser benchmarks exist |
| What have I done? | Completed current-state, related issue discovery, and issue-ledger passes |

Open risks:
- Exactness oracle command is not designed yet.
- Public/private status/API shape needs pressure in later passes.
- Issue/reference sync is pending and must stay conservative.
