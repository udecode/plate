---
date: 2026-05-04
topic: plite-full-issue-ledger-architecture-ralplan
status: ready-for-ralph-execution-planning
skill: slate-ralplan
source_ledger: docs/plite-issues/open-issues-ledger.md
corpus_rows: 682
---

# Plite Full Issue Ledger Architecture Ralplan

## Verdict

The earlier sync was too narrow. It proved a few exact v2 claims, but it did not do the thing the issue corpus demands: every issue needs an explicit outcome. This pass makes that accounting concrete.

The hard take: **do not fix 682 issues one by one.** That is maintenance theater. Fix the architecture classes that recur, explicitly reject invalid/stale/product/docs noise, and require exact repro proof before any issue gets a `Fixes #...` line.

## Intent And Boundary

- intent: turn the full frozen Plite issue ledger into v2 rewrite law.
- outcome: every ledger row is classified as an exact existing claim, v2 architecture target, docs/example lane, ecosystem boundary, repro-needed row, or triage-close row.
- in scope: `docs/plite-issues/open-issues-ledger.md`, this plan, the generated 682-row issue matrix, macro theme sync, raw cluster sync, and PR reference accounting.
- non-goals: no Plite implementation patch, no fake issue closure claims, no product/editor-framework API creep in raw Plite.
- decision boundary: exact issue closure requires matching implementation proof. Cluster sync is not closure.

## Source Of Truth

- per-row ledger: `docs/plite-issues/open-issues-ledger.md`
- generated row matrix: `docs/plans/2026-05-04-plite-full-issue-ledger-architecture-ralplan-issue-matrix.md`
- macro corpus: `docs/plite-issues/issue-clusters.md`
- package ownership: `docs/plite-issues/package-impact-matrix.md`
- requirement law: `docs/plite-issues/requirements-from-issues.md`
- implementation claim ledger: `docs/plite/ledgers/issue-coverage-matrix.md`
- maintainer PR body source: `docs/plite/references/pr-description.md`

## Corpus Facts

The frozen ledger has `682` issue rows and `378` raw primary clusters. The macro corpus count remains `682` from the 2026-04-02 snapshot.

Official macro counts from `issue-clusters.md`:

| Macro theme                                        |                            Issues | Decision                                                     |
| -------------------------------------------------- | --------------------------------: | ------------------------------------------------------------ |
| Mobile, IME, And Input Semantics                   |                               129 | v2 shared input/composition runtime                          |
| Performance And Scalability                        |                                13 | benchmark-gated cross-cut; high leverage despite low count   |
| React Runtime, Identity, And Subscription Model    |                               111 | snapshot-driven selector/projection runtime                  |
| Selection, Focus, And DOM Bridge                   |                               172 | dedicated DOM selection/focus bridge                         |
| Clipboard, Serialization, And External Formats     |                                37 | explicit clipboard/import-export boundary                    |
| Core Model, Operations, Normalization, And History |                                69 | transaction-first core engine                                |
| API, Typing, And Extensibility                     |                                33 | tighter unopinionated public API                             |
| Docs, Examples, Support Noise, And Repo Churn      |                               118 | not v2 architecture                                          |
| Decorations, Marks, And Annotations                | 19 explicit plus adjacent fallout | projection/annotation/mark lane, not legacy decorate lock-in |

Package pressure from `package-impact-matrix.md`:

| Ownership lane   | Issues | Decision                         |
| ---------------- | -----: | -------------------------------- |
| runtime boundary |    407 | primary v2 owner                 |
| core engine      |    113 | engine rewrite owner             |
| maintainer noise |    162 | keep out of package architecture |

## Generated Action Buckets

These buckets are execution-owner buckets, not a replacement for the official macro taxonomy. They intentionally route rows by the best v2 owner: input, DOM, React runtime, core engine, clipboard, API/DX, performance, or non-claim triage.

| Action bucket                | Rows | Owner                                           |
| ---------------------------- | ---: | ----------------------------------------------- |
| `v2-input-runtime`           |  147 | slate-react-v2 + plite-dom-v2 input runtime     |
| `v2-core-engine`             |  104 | plite core engine                            |
| `skip-invalid`               |   76 | maintainer triage                               |
| `v2-dom-selection`           |   65 | plite-dom-v2 + slate-react-v2 selection runtime |
| `skip-stale`                 |   60 | current-repro triage                            |
| `needs-repro`                |   45 | repro-first triage                              |
| `skip-maintainer-noise`      |   45 | docs/examples/repo lane                         |
| `already-accounted`          |   30 | existing proof ledger                           |
| `v2-clipboard-serialization` |   28 | plite-dom-v2 + plite clipboard boundary      |
| `v2-react-runtime`           |   28 | slate-react-v2 runtime                          |
| `docs-examples`              |   18 | docs/examples lane                              |
| `skip-duplicate`             |   16 | maintainer triage                               |
| `v2-performance-benchmark`   |   12 | benchmark/performance lane                      |
| `ecosystem-boundary`         |    7 | ecosystem boundary                              |
| `v2-api-dx`                  |    1 | plite public API/DX                          |

## V2 Sync Status After This Pass

| Status             | Rows |
| ------------------ | ---: |
| `cluster-synced`   |  387 |
| `triage-closed`    |  152 |
| `issue-reviewed`   |   64 |
| `not-claimed`      |   58 |
| `improves-claimed` |   18 |
| `fixes-claimed`    |    3 |

No row remains `not-started`. That does not mean every issue is fixed. It means every row has a deliberate v2 outcome.

## Classification Rules

1. Preserve exact implementation claims already recorded in `issue-coverage-matrix.md`.
2. Close invalid, likely-invalid, duplicate, and stale rows at triage level. They do not get architecture work by default.
3. Keep docs, examples, repo tooling, release noise, and support questions out of the v2 core unless the same pressure reproduces in package tests.
4. Keep ecosystem/product requests outside raw Plite. Raw Plite should expose substrate primitives, not product policy.
5. Mark unclear rows as repro-needed, not architecture-needed.
6. Route valid runtime rows to the shared input, DOM selection, React runtime, clipboard, core engine, API/DX, or performance lanes.
7. Use `cluster-synced` for architecture absorption. Use `Fixes #...` only after exact repro proof.

## Decisions By Bucket

### `v2-input-runtime`

Sample rows: #6022, #5989, #5984, #5983, #5931, #5891, #5883, #5836

Keep. This is the top macro priority. Resolve through first-class composition lifecycle, beforeinput policy, Android/iOS proof, keyboard-layout handling, placeholder/empty-state rules, and no DOM/model desync during suppressed input.

### `v2-dom-selection`

Sample rows: #6034, #5874, #5867, #5847, #5749, #5632, #5628, #5559

Keep. DOM point/path, focus, voids, inlines, zero-width, table selection, nested editors, shadow DOM, drag/drop, and contenteditable boundaries belong in `plite-dom-v2` plus React lifecycle integration. The current live proof owner includes `packages/plite-dom/test/bridge.ts` and `packages/plite-dom/test/dom-coverage.ts`.

### `v2-react-runtime`

Sample rows: #5826, #5806, #5690, #5689, #5669, #5603, #5473, #5404

Keep. React runtime issues are not solved by making core React-shaped. They need committed snapshots, stable editor identity, selector-first subscriptions, provider replacement correctness, and sidecar projection/annotation/widget stores. Live source already exposes these lanes in `packages/plite-react/src/index.ts` and tests them in `provider-hooks-contract.tsx`, `annotation-store-contract.tsx`, and projection tests.

### `v2-core-engine`

Sample rows: #5977, #5811, #5771, #5733, #5691, #5629, #5599, #5587

Keep. Core model pressure justifies transactions, stable runtime identity, op-first external semantics, normalization debt, commit metadata, and history grouping. It does not justify throwing away Plite's JSON model. Live proof owners include `packages/plite/test/operations-contract.ts` and `packages/plite/test/collab-history-runtime-contract.ts`.

### `v2-clipboard-serialization`

Sample rows: #5630, #5616, #5429, #5328, #5233, #5151, #3857, #3801

Keep. Clipboard and serialization need explicit boundaries: schema-safe fragment formats, model-backed copy when DOM coverage is incomplete, stale-DOM prevention, and HTML import/export ownership. Do not absorb every third-party document serializer into raw Plite.

### `v2-api-dx`

Sample rows: #3802

Keep selectively. DX matters, but compatibility clutter is the trap. Favor `editor.read`, `editor.update`, extension methods, public-surface contracts, and JSDoc clarity over resurrecting legacy `Editor.*` teaching or arbitrary helper growth.

### `v2-performance-benchmark`

Sample rows: #5992, #5216, #3752, #3751, #3748, #4210, #4202, #4056

Keep with hard gates. The GitHub diff-line lesson applies: make repeated units cheap first, isolate rare state, use event delegation, ban effects in hot repeated units, index lookups, and add explicit cohort/perf/native-behavior proof. Virtualization stays experimental and policy-gated.

### `needs-repro`

Sample rows: #5994, #5974, #5972, #5944, #5918, #5839, #5813, #5798

Do not architect around these yet. They stay reviewed but not claimed until a current minimal repro exists. Repro-first is not bureaucracy here; it prevents designing for ghosts.

### `skip-invalid`, `skip-duplicate`, `skip-stale`

Invalid sample: #6016, #5958, #5912, #5895, #5838, #5824, #5820, #5748

Duplicate sample: #6007, #5698, #3723, #3710, #3705, #3466, #3433, #3369

Stale sample: #5961, #5956, #5928, #5924, #5894, #5844, #5833, #5617

Do not do these as v2 architecture. Close/merge/repro-refresh them. A rewrite should not become a landfill for invalid reports, known duplicates, or old environment rot.

### `skip-maintainer-noise`, `docs-examples`, `ecosystem-boundary`

Maintainer-noise sample: #5786, #5757, #5612, #5520, #5507, #5436, #5403, #5400

Docs/examples sample: #5750, #5000, #4825, #4773, #4575, #4573, #4570, #4532

Ecosystem sample: #5588, #5253, #5067, #5037, #4792, #4302, #4083

Keep these outside core architecture. Docs/examples can and should improve, but they are not proof that raw Plite needs product-shaped APIs. Ecosystem requests need substrate primitives, not baked-in product policy.

## Decision Brief

Principles:

- Plite stays unopinionated and data-model-first.
- Runtime ownership becomes explicit; browser and React timing debt cannot keep leaking into core.
- Exact issue closure needs exact proof.
- Invalid/stale/docs/ecosystem noise gets a reason, not silence.

Chosen option: full-row classification plus macro/cluster sync.

Rejected options:

- Fix every issue individually: impossible and architecturally dumb. Most rows are symptoms of shared runtime classes.
- Count only exact fixes: too narrow; it ignores architecture absorption.
- Mark clusters covered without row-level comments: repeats the earlier mistake.
- Pull docs/ecosystem requests into raw Plite: bloats the core and rewards bad issue taxonomy.

Consequence: v2 execution should work by bucket gates, not issue-number theater. Exact `Fixes #...` rows come only after dedicated repro tests land.

## Performance Pass

- applicability: applied.
- Vercel rules used: JS index maps, O(1) lookup discipline, no hot repeated-unit effects, event-listener dedupe, rare-state isolation, content-visibility as DOM-present option, idle work with max latency.
- extra performance rules used: cohort segmentation, repeated-unit budget, rare-state isolation, event-delegation budget, effect/subscription budget, interaction INP matrix, memory/DOM tagging, degradation contract, staged readiness, editor native behavior proof.
- repeated unit: editor block/text leaf/render segment; DOM coverage boundary group for missing-DOM modes.
- cohorts: normal, large, stress, pathological.
- budgets: no per-block Plite-owned event handlers, no repeated-unit effects by default, O(1) or indexed lookups, heap/DOM/component/listener tags in stress runs.
- React/runtime primitives: selectors, external stores, transitions/deferred work only for non-urgent UI; React features do not solve DOM selection, IME, or clipboard.
- interaction metrics: typing, arrow selection, select-all, copy, paste, cut, drag selection, IME, mobile touch, full-doc replace.
- degradation contract: staged DOM-present is safe default; shell and virtualized modes are explicit/experimental and must document native behavior loss.
- plan delta: performance rows route into architecture buckets only when measurable. They do not justify making virtualization the default.

## Exact Claims And Non-Claims

The PR auto-close count remains `3`:

- Fixes #6013
- Fixes #5605
- Fixes #5709

The current issue-coverage matrix remains the exact implementation claim ledger. This plan adds full corpus classification, not new exact closure proof.

## Execution Phasing

1. Close current exact-claim ledger discipline: keep `Fixes` rows rare and proof-backed.
2. Convert action buckets into RALPH execution batches:
   - input runtime proof
   - DOM selection bridge proof
   - React runtime/projection proof
   - clipboard/import-export proof
   - core transaction/history/normalization proof
   - API/DX cleanup
   - performance cohorts and experimental virtualization gates
3. For each batch, pull issue IDs from `docs/plans/2026-05-04-plite-full-issue-ledger-architecture-ralplan-issue-matrix.md`, add exact tests only for rows with current repros, and update `issue-coverage-matrix.md` only when proof lands.
4. Keep docs/examples/ecosystem/noise rows out of raw Plite implementation unless they reproduce as package-level failures.

## Ralph Execution Ledger

| Pass                                                       | Status                                                          | Owner                                                                                                   | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Next                                                                                                                                              |
| ---------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input-runtime-proof-tracer`                               | complete for first vertical slice; wider bucket remains pending | `packages/plite-react` input runtime                                                      | Added focused contract for active IME composition keydown staying browser/composition-owned; `bun --filter plite-react test:vitest -- editing-kernel-contract`; `bun --filter plite-react typecheck`; focused Biome check/fix.                                                                                                                                                                                                                                                                                                                                         | Continue with `dom-selection-bridge-proof`; keep exact issue claims unchanged until current repro proof maps to a specific issue.                 |
| `dom-selection-bridge-proof`                               | complete for first vertical slice; wider bucket remains pending | `packages/plite-dom` selection runtime                                                    | Added focused contract for editor-owned unmapped event targets resolving through browser caret ranges; `bun test plite-dom/test/bridge.test.ts` from `Plate repo root/packages`; `bun --filter plite-dom typecheck`; focused Biome check/fix.                                                                                                                                                                                                                                                                                                                            | Continue with the `v2-input-runtime` bucket plan because it is the largest unresolved ClawSweeper bucket and the pending target already names it. |
| `v2-input-runtime-bucket-ralplan`                          | Plite Ralplan done                                              | `packages/plite-react` input runtime                                                      | `docs/plans/2026-05-04-plite-clawsweeper-v2-input-runtime-ralplan.md`; `.tmp/completion-checks/plite-clawsweeper-v2-input-runtime-ralplan.md`; final score `0.92`; no new fixed issue claims.                                                                                                                                                                                                                                                                                                                                                                    | Continue with `v2-input-runtime-execution`.                                                                                                       |
| `v2-input-runtime-execution`                               | complete for available local proof lane                         | `packages/plite-react` input runtime                                                      | `.tmp/completion-checks/plite-clawsweeper-v2-input-runtime-execution.md` records focused unit/browser proof, Plite Browser proof, PR reference sync, and raw mobile non-claim boundary.                                                                                                                                                                                                                                                                                                                                                                             | Continue with `v2-react-runtime-bucket-ralplan`.                                                                                                  |
| `v2-react-runtime-bucket-ralplan`                          | Plite Ralplan done                                              | `packages/plite-react` runtime                                                            | `docs/plans/2026-05-04-plite-clawsweeper-v2-react-runtime-ralplan.md` selects the next cluster, completes current-state read, ClawSweeper related issue discovery, issue-ledger routing, live source refresh, performance/DX/migration proof gates, objection/high-risk pass, issue-sync accounting, and closure at score `0.92`; #5509/#3309 moved to `v2-react-runtime`; no new fixed issue claims.                                                                                                                                                               | Continue with `ralph` execution: provider/hook identity and selector fanout.                                                                      |
| `v2-react-runtime-execution`                               | complete for available local proof lane                         | `packages/plite-react` runtime                                                            | `.tmp/completion-checks/plite-clawsweeper-v2-react-runtime-execution.md` records exported `EditorSelectorOptions<TEditor>`, generic selector typecheck coverage, focused provider/surface tests, sidecar contract tests, PR reference sync, and unchanged fixed issue claims.                                                                                                                                                                                                                                                                                       | Continue with `v2-clipboard-serialization-bucket-ralplan`.                                                                                        |
| `v2-clipboard-serialization-bucket-ralplan`                | Plite Ralplan done                                              | `packages/plite-dom` clipboard runtime                                                    | `docs/plans/2026-05-04-plite-clawsweeper-v2-clipboard-serialization-ralplan.md` selects the next cluster, reviews representative gitcrawl rows #5328/#4857/#5233/#3486/#4542/#5151/#4802/#4806, refreshes live source owners, syncs PR and fork ledgers, and closes at score `0.91`; no new fixed issue claims.                                                                                                                                                                                                                                                     | Continue with `ralph` execution: fail-closed internal fragment import.                                                                            |
| `v2-clipboard-serialization-execution`                     | complete for Slice 1                                            | `packages/plite-dom` clipboard runtime                                                    | `.tmp/completion-checks/plite-clawsweeper-v2-clipboard-serialization-execution.md` records fail-closed internal fragment import tests and implementation; #5328/#4857 moved to `Improves`; fixed issue claims unchanged.                                                                                                                                                                                                                                                                                                                                            | Continue with Slice 2: fragment insertion shape and selection placement.                                                                          |
| `v2-clipboard-fragment-insertion-shape-execution`          | complete for Slice 2                                            | `packages/plite` fragment insertion                                                       | `.tmp/completion-checks/plite-clawsweeper-v2-clipboard-fragment-insertion-shape-execution.md` records focused core and DOM clipboard proof for rich fragment target-block preservation; #5151 moved to `Improves`; fixed issue claims unchanged.                                                                                                                                                                                                                                                                                                                    | Continue with Slice 3: inline void copy/cut/paste.                                                                                                |
| `v2-clipboard-inline-void-execution`                       | complete for Slice 3                                            | `packages/plite-dom` clipboard runtime                                                    | `.tmp/completion-checks/plite-clawsweeper-v2-clipboard-inline-void-execution.md` records selected inline void copy/paste/cut package proof and the safe non-spacer fragment attach fix; #4802/#4806 moved to `Improves`; fixed issue claims unchanged.                                                                                                                                                                                                                                                                                                              | Continue with Slice 4: structural cut/delete.                                                                                                     |
| `v2-clipboard-structural-cut-delete-execution`             | complete for Slice 4                                            | `packages/plite-react`; `packages/plite`                                    | `.tmp/completion-checks/plite-clawsweeper-v2-clipboard-structural-cut-delete-execution.md` records selected block-void cut proof, list delete model proof, #3857/#3801/#3469 moved to `Improves`, and unchanged fixed claims.                                                                                                                                                                                                                                                                                                                                       | Continue with Slice 5: API and extension surface.                                                                                                 |
| `v2-clipboard-api-extension-surface-execution`             | complete for Slice 5                                            | `packages/plite-dom`; `packages/plite-react`; `apps/www/examples` | `.tmp/completion-checks/plite-clawsweeper-v2-clipboard-api-extension-surface-execution.md` records options-object `withDOM`/`withReact`, keyed embedded fragments, public insertData handler typing, docs/examples, #5233/#3486/#4569 fixed, and #1024/#4613 improved.                                                                                                                                                                                                                                                                                              | Continue with Slice 6: large payload performance.                                                                                                 |
| `v2-clipboard-large-payload-performance-execution`         | complete for bounded Slice 6                                    | `benchmarks/plite/donor`; `packages/plite-dom`                                  | `.tmp/completion-checks/plite-clawsweeper-v2-clipboard-large-payload-performance-execution.md` records bounded large-payload benchmark artifacts and a rejected slower optimization candidate; #4056/#5945/#5992 remain not fixed from that slice.                                                                                                                                                                                                                                                                                                                  | Continue with the separate #5992 range-delete / replace_children plan.                                                                            |
| `range-delete-replace-children-ralplan`                    | complete                                                        | `packages/plite`; `apps/www/tests/plite-browser/donor/stress`                                       | `.tmp/completion-checks/plite-range-delete-replace-children-ralplan.md` records `replace_children` apply/inverse/ref/history/collab proof, benchmark proof, and browser stress; #2288 and #5992 are `Improves`, not auto-close fixes.                                                                                                                                                                                                                                                                                                                               | Continue with DOM selection boundary proof.                                                                                                       |
| `dom-selection-boundary-proof`                             | complete                                                        | `packages/plite-dom`; `packages/plite-react`; browser examples              | `.tmp/completion-checks/plite-dom-selection-boundary-proof-ralplan.md` records exact fixed claims for #6034/#3871/#5847/#3991/#4301/#4074/#3148/#3429/#4789/#4984 and explicit non-claims for #5355/#4618.                                                                                                                                                                                                                                                                                                                                                          | Continue with `v2-core-engine-history-selection-undo-ralplan`.                                                                                    |
| `v2-core-engine-history-selection-undo-ralplan`            | Plite Ralplan done                                              | `packages/plite`; `packages/plite-history`                                  | `docs/plans/2026-05-06-plite-core-history-selection-undo-ralplan.md` selects clusters 6 and 27 plus #4559 as the next issue-backed core lane, completes ClawSweeper related rows for #3534/#3551/#3705/#3756/#3921/#4559 plus #1770/#2288/#3741/#3752, syncs the fork dossier/matrix/PR count, and closes at score `0.93`; exact issue claims unchanged.                                                                                                                                                                                                            | Continue with `ralph` execution: red issue-shaped history tests.                                                                                  |
| `v2-core-engine-history-selection-undo-execution`          | complete for first proof slice                                  | `packages/plite-history`                                                                  | `.tmp/completion-checks/plite-core-history-selection-undo-execution.md` records package proofs for #3534/#3551/#4559, improved partial `set_selection` proof for #3705/#3921, focused verification, and PR/coverage/dossier sync.                                                                                                                                                                                                                                                                                                                                   | Continue with the next `plite-ralplan` bucket selection.                                                                                          |
| `v2-core-engine-structural-delete-normalization-ralplan`   | Plite Ralplan done                                              | `packages/plite`                                                                          | `docs/plans/2026-05-07-plite-core-structural-delete-normalization-ralplan.md` selects structural delete, merge/split barriers, and normalization fixpoint proof as the next core lane; routes #4121/#2500/#3965/#5811/#3950/#1654 as targets, keeps #5972 repro-first, excludes #5977/#3964/#3973 from this lane, and syncs coverage/PR/dossier accounting.                                                                                                                                                                                                         | Continue with `ralph` execution: red issue-shaped delete and normalization tests.                                                                 |
| `v2-core-engine-structural-delete-normalization-execution` | complete for focused package proof slice                        | `packages/plite`                                                                          | `.tmp/completion-checks/plite-core-structural-delete-normalization-execution.md` records fixed claims for #4121/#2500/#3965/#3950, improved claims for #5811/#1654, the `isIsolating` Backspace/merge fix, focused package tests, typecheck, lint, and PR/coverage/dossier sync.                                                                                                                                                                                                                                                                                    | Continue with `plite-ralplan` next-bucket selection or a follow-up split-specific #1654 plan if needed.                                           |
| `inline-delete-boundary-repro-ralplan`                     | Plite Ralplan done                                              | `apps/www/tests/plite-browser/donor/examples/inlines.test.ts`; owner classified by red proof          | `docs/plans/2026-05-07-plite-inline-delete-boundary-repro-ralplan.md` selects #5972 as the next browser-first lane, runs gitcrawl/ClawSweeper discovery, rejects public API expansion, maps Lexical/ProseMirror/Tiptap delete-boundary strategy, and keeps the issue `Related` until exact inlines proof lands.                                                                                                                                                                                                                                                     | Continue with `ralph` execution: add the red empty editable inline Backspace browser row, classify owner, then patch the narrow path.             |
| `inline-delete-boundary-repro-execution`                   | complete                                                        | `packages/plite`; browser inlines example                                                 | `.tmp/completion-checks/plite-inline-delete-boundary-repro-ralplan.md` records the core delete target fix and cross-browser inlines proof for #5972; fixed issue claims and PR reference are synced.                                                                                                                                                                                                                                                                                                                                                                | Continue with `v2-operation-extensibility-validation-ralplan`.                                                                                    |
| `v2-operation-extensibility-validation-ralplan`            | Plite Ralplan done                                              | `packages/plite` operation API/runtime                                                    | `docs/plans/2026-05-07-plite-operation-extensibility-validation-ralplan.md` selects #5977 as the next active target, routes #5558 as related operation type-guard DX pressure, rejects arbitrary custom operation acceptance, and keeps exact fixed claims unchanged until issue-shaped proof lands.                                                                                                                                                                                                                                                                | Continue with `ralph` execution: prove #5977 editor detection first, then add the smallest API/runtime fix.                                       |
| `v2-operation-extensibility-validation-execution`          | complete                                                        | `packages/plite`; `packages/plite-dom`                                      | `.tmp/completion-checks/plite-operation-extensibility-validation-execution.md` records fixed proof for #5977, improved proof for #5558, strict built-in `Operation.isOperation`, concrete operation subtype guards, and fail-closed unknown replay.                                                                                                                                                                                                                                                                                                                 | Continue with the next `plite-ralplan` bucket selection.                                                                                          |
| `v2-core-caret-movement-word-insert-break-ralplan`         | Plite Ralplan done                                              | `packages/plite` caret movement and split selection                                       | `docs/plans/2026-05-07-plite-core-caret-movement-word-insert-break-ralplan.md` selects #3964/#3973 as the next active targets, routes #3499/#4357/#4195/#3841/#5629/#4648 as related/non-claim rows, rejects public `normalizePoint` and punctuation policy expansion for this lane, and keeps exact fixed claims unchanged until issue-shaped proof lands.                                                                                                                                                                                                         | Continue with `ralph` execution: red package tests for marked `insertBreak` selection and multi-leaf word movement.                               |
| `v2-core-caret-movement-word-insert-break-execution`       | complete                                                        | `packages/plite` caret movement and split selection                                       | `.tmp/completion-checks/plite-core-caret-movement-word-insert-break-execution.md` records package regression proof for #3964/#3973/#4357, keeps #3499/#4195/#3841/#5629/#4648 related or not claimed, and syncs PR/coverage/dossier accounting.                                                                                                                                                                                                                                                                                                                     | Continue with the next `plite-ralplan` bucket selection.                                                                                          |
| `v2-insert-fragment-at-location-ralplan`                   | Plite Ralplan done                                              | `packages/plite` fragment insertion                                                       | `docs/plans/2026-05-07-plite-insert-fragment-at-location-ralplan.md` selects #5412/#5429 as the next active core transform targets, keeps #5089/#4542/#5151/#3557/#3155 related or improved, and rejects #5080/#3891/#5129 as separate owners.                                                                                                                                                                                                                                                                                                                      | Continue with `ralph` execution: red package tests for explicit `insertFragment({ at })` and empty-node caret placement.                          |
| `v2-insert-fragment-at-location-execution`                 | complete                                                        | `packages/plite` fragment insertion                                                       | `.tmp/completion-checks/plite-insert-fragment-at-location-execution.md` records exact package proof for #5412/#5429, verifies focused `insertFragment` tests, typecheck, lint, and syncs PR/coverage/dossier accounting.                                                                                                                                                                                                                                                                                                                                            | Continue with the next `plite-ralplan` bucket selection.                                                                                          |
| `v2-multiblock-fragment-middle-insert-ralplan`             | Plite Ralplan done                                              | `packages/plite`; `packages/plite-dom` fragment insertion                   | `docs/plans/2026-05-07-plite-multiblock-fragment-middle-insert-ralplan.md` selects #5089 as the exact middle-paragraph multi-block fragment insertion target, keeps #4542/#3155 related, and requires package plus DOM clipboard boundary proof before any fixed claim.                                                                                                                                                                                                                                                                                             | Continue with `ralph` execution: exact package and DOM clipboard tests.                                                                           |
| `v2-multiblock-fragment-middle-insert-execution`           | complete                                                        | `packages/plite`; `packages/plite-dom` fragment insertion                   | `.tmp/completion-checks/plite-multiblock-fragment-middle-insert-execution.md` records package and DOM clipboard proof for #5089, no source patch, focused tests, typecheck, lint, and PR/coverage/dossier sync.                                                                                                                                                                                                                                                                                                                                                     | Continue with the next `plite-ralplan` bucket selection.                                                                                          |
| `v2-editor-nodes-reverse-order-ralplan`                    | Plite Ralplan done                                              | `packages/plite` query traversal                                                          | `docs/plans/2026-05-07-plite-editor-nodes-reverse-order-ralplan.md` selects #5080 as the next package-only query traversal target, confirms the live `state.nodes.match({ reverse: true })` mismatch, completes related issue discovery for #5684/#5028/#3885, syncs the fork dossier/matrix/PR reference, narrows the first implementation owner to `editor/nodes.ts`, chooses forward traversal plus reverse emitted matched entries as the patch strategy, completes performance/TDD pressure, accepts the objection/high-risk pass, and closes at score `0.92`. | Continue with `ralph` execution: red public query-contract test, then `editor/nodes.ts` patch.                                                    |

## Readiness Score

- corpus accounting: 0.98
- architecture mapping: 0.91
- live-source grounding: 0.84
- exact issue closure proof: 0.35 by design, because this pass is not implementation
- execution readiness for RALPH: 0.88

Verdict: ready for RALPH execution planning. Not ready to claim more fixed issues.
