# plate-next suggestion plugin portal cut

Objective:
Cut suggestion plugin portal API; done when suggestion scoped sweep and Core proof pass; plan docs/plans/2026-07-09-plate-next-suggestion-plugin-portal-cut.md.

Goal plan:
docs/plans/2026-07-09-plate-next-suggestion-plugin-portal-cut.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user said "ok go for this cut then sweep [$plate-next] pkg only"
- mode: package review mode, one-shot execution
- target surface: `packages/suggestion` plus the smallest Core plugin-portal owner needed for the accepted API cut
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A, user explicitly scoped this to package-only
- correction-triggered related scoped sweep: yes, inside `packages/suggestion/src` and the Core plugin portal/type-test owner changed for this cut
- package review mode: yes
- package review target: `packages/suggestion`
- package file checklist gate: 49 source rows from `rg --files packages/suggestion/src | sort`
- completion threshold summary: plugin portal exposes scoped `api`, root `editorApi`; suggestion package uses scoped API; package proof and Core proof pass or any blocker is recorded

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.
- If package review mode is in scope, generate the package file manifest and
  materialize one checkbox per reviewed file in this plan before
  implementation. A file checkbox may be checked only when its score is `100`.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `editor.plugin(BaseSuggestionPlugin).api.nodeId(...)` is the accepted scoped plugin portal shape.
- `editor.plugin(...).editorApi` exposes the composed/root editor API.
- `packages/suggestion` no longer uses `editor.plugin(BaseSuggestionPlugin).api.suggestion`.
- Core plugin portal runtime/types/tests encode the scoped `api` plus root `editorApi` contract.
- Scoped package sweep rows are closed or explicitly deferred with owner/proof.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related scoped sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- Package review mode may close only when every package file row is either
  checked at score `100` or explicitly deferred for user review with reason,
  owner, proof needed, and next action. Do not move to the next package while
  unchecked package rows remain.
- Core-adjacent package review may close only after
  `tooling/scripts/check-core.mjs` is updated to include that package, or the
  plan records why the package is product-only and does not belong in
  `check:core`.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-09-plate-next-suggestion-plugin-portal-cut.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: planned `pnpm turbo typecheck --filter=./packages/core --filter=./packages/suggestion`, package tests if available, and `pnpm check:core`
- package proof: planned `pnpm turbo typecheck --filter=./packages/suggestion`
- shared Core gate: planned `pnpm check:core` because Core public plugin portal owner changes
- source audits: planned `rg -n "editor\\.plugin\\(BaseSuggestionPlugin\\)\\.api\\.suggestion|api\\.suggestion" packages/suggestion/src`
- related scoped sweep query / active scope / match count / patched count / deferred count:
  planned after code edits
- package file manifest / row count / checked count / deferred count: `rg --files packages/suggestion/src | sort`, expected 49 rows
- Plite/Plate gap ledger: no gap expected; this is a Plate/Core plugin typing/runtime owner cut
- broad Core drift ledger gate: N/A, not a broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-09-plate-next-suggestion-plugin-portal-cut.md`

Constraints:
- Review mode targets the best Plate v2 shape: clean Plate product layer on top
  of Plite, no legacy compatibility goal.
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
- No local hacks: do not hide migration difficulty in bridge dumps, helper
  dumps, `any` casts, duplicated wrappers, command fallbacks, or fake aliases.
- If clean migration is blocked, record a `Plite gap` or `Plate gap` instead of
  inventing a compatibility workaround.
- After every correction, run a related sweep only inside the active mode
  scope. Package review mode is scoped to the named package plus the smallest
  Plite/Core owner needed to unblock that package. Broader matches become
  deferred rows or next-package candidates, not edits.
- In package review mode, do not update docs, examples, package callers outside
  the named package, unrelated packages, generated registries, or broad repo
  surfaces unless the user explicitly broadens scope with `all packages`,
  `current tree`, `full-loop`, `sweep`, or the broader owner name.
- Review-mode rename freeze: keep current `HEAD` names/paths while behavior and
  API drift are under review. Put desirable later renames in
  `docs/plans/pre-renaming.md`; do not turn the active diff into Added/Deleted
  rename soup unless the user explicitly asks for a rename pass.
- Extracted-file recovery gate: every untracked/extracted Core/Plate source,
  spec, type-test, and config file in scope must be inventoried and classified
  as `recover-main-owner`, `merge-existing-owner`, `move-to-plite`,
  `justify-new-proof-tooling`, or `delete-duplicate`.
- No file or packet can score `100` while an extracted/untracked file in scope
  lacks a ledger row and one of those buckets.
- Private bridges require owner, deletion gate, and proof.
- Private bridges cannot collect displaced product/plugin behavior. A bridge
  file that centralizes input-rules, node-id, affinity, DOM, command, or change
  listener behavior scores `0` until deleted.
- Any file importing or installing a forbidden bridge is capped at `25`.
- Owner files whose runtime behavior lives in a forbidden bridge are capped:
  `InputRulesPlugin` `<=5`, `NodeIdPlugin` `<=45`, `AffinityPlugin` `<=55`,
  `PliteExtensionPlugin` `<=45`.
- Public type/plugin/editor files touched while a forbidden bridge remains are
  capped at `75`.
- If a helper exists only because migration was hard, cut it.
- Do not use a narrow representative file to close a broad Core sweep.
- Package review mode is review-first, not migration-first. Freeze scope to the
  named package plus the smallest Plite/Core owner needed to remove a blocker.
- Package hard cuts land package by package. A broad audit can discover
  outside-scope callers, but the plan must record them as deferred rows instead
  of patching them in the current package packet.
- Package file rows can be checked `[x]` only at score `100`: no behavior
  regression versus `origin/main`, no type regression, inline inference
  preserved, no inferred local type annotations, no fake casts/local helper
  types, no compat sludge, correct Plite/Plate ownership, accepted
  owner/name/path drift, and focused proof or justified source audit.
- Green package tests alone do not score a file `100`.
- Do not move to the next package until every package file row is checked at
  `100` or explicitly deferred for user review.
- Core-adjacent package review must update `check:core` coverage before
  closeout, or explicitly classify the package as not belonging in that gate.
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.
- Direct one-shot Plite API law: prefer `editor.update.foo.bar(...)` and
  `editor.read.foo(...)` over callback wrappers for one-line reads/writes.
  Callback form is only for grouped transaction/snapshot logic, shared
  intermediate state, branching/looping, or missing direct API that is recorded
  as a Plite gap.
- Active transaction law: no `editor.update.*` call may appear inside an
  `editor.update(...)`, `editor.update.withoutNormalizing(...)`, transform
  middleware, or other active transaction callback. The callback must receive
  and use the active `tx`; `withoutNormalizing` callbacks should be
  `({ tx }) => { ... }`.
- Plugin export inference law: plugin constants should infer from
  `createBasePlugin`, `createPlatePlugin`, `toPlatePlugin`, and chained
  `.extend*` methods. Do not annotate exports as `BasePlugin<Config>` /
  `PlatePlugin<Config>` or cast chained plugin results unless the annotation is
  a true external boundary. If inference fails, fix the builder/generic owner.
- Empty config inference law: do not create `type FooConfig =
  PluginConfig<'foo'>` only to call `createBasePlugin<FooConfig>({ key:
  'foo' })`. Manual plugin config types are only for real options, API, tx,
  selectors, state, or external public contracts.
- Plugin editor extension law: plugin-owned editor extension options should be
  returned directly from `extendExtension`. Do not wrap them in
  `defineEditorExtension({ name: pluginKey, ... })` just to satisfy types.
  `extendExtension` must accept both built extensions and raw options; raw
  options without `name` default to the owning plugin key. Keep explicit names
  only for genuinely separate extension identities.
- Inferred local type law: do not annotate local variables whose initializer
  should infer the type. Smells like `const entries: NodeEntry<T>[] =
  editor.read...` or `const value: Value = [...]` hide type regressions at the
  owner API. Remove the annotation and fix the source API if inference is weak.
  Keep annotations only for uninferrable locals such as empty arrays,
  deliberate narrowing/widening, exported/public signatures, or external
  boundary callbacks.
- Plugin option law: root plugin option helpers are forbidden public API. Do
  not use or re-add `editor.getOption(...)`, `editor.getOptions(...)`,
  `editor.setOption(...)`, or `editor.setOptions(...)`. Package code should use
  scoped plugin portals by default (`editor.plugin(FooPlugin).getOption(...)`,
  `editor.plugin(FooPlugin).getOptions()`,
  `editor.plugin(FooPlugin).setOption(...)`,
  `editor.plugin(FooPlugin).setOptions(...)`). `usePluginOption(FooPlugin, ...)`
  remains the render-subscription path. Key+generic fallbacks need an owner
  reason: plugin self-definition cycle, React hook/component imported by the
  plugin itself, non-React layer that must not import a React plugin, or
  intentionally decoupled cross-package code. Plugin-owned helper graphs should
  receive plugin context (`api`, `getOption`, `getOptions`, `setOption`, `tx`)
  or be thin wrappers over the typed plugin API/tx group.

Boundaries:
- allowed edit scope: `packages/suggestion/**`, Core plugin portal/type-test owner files required by the cut, this plan, and changeset if package API release policy requires it
- package/API surfaces: `BasePluginContext`, `getEditorPlugin`, editor plugin portal typing, suggestion plugin API consumers
- docs/browser surfaces: N/A, package review mode; no docs/app/browser proof unless code changes force source parity
- non-goals: no repo-wide package migration, no docs/examples/registry sweep, no app/browser route proof, no unrelated package cleanup
- out-of-scope package errors: record as out-of-scope unless the current Core API cut caused them

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if the scoped API cannot be typed without a broader public API plan, or if package/Core proof exposes outside-scope failures that prove this Core cut is unsafe.

Current verdict:
- verdict: complete
- confidence: high after `pnpm check:core`
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: scoped plugin portal contract is encoded in Core runtime/types/tests; suggestion and required check-core fallout packages use the new shape.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirements captured in Objective, Completion threshold, Verification surface, Constraints, Boundaries, and Blocked condition before edits. |
| `plate-next` skill/rule read | yes | Read `/Users/zbeyens/git/plate-2/.agents/skills/plate-next/SKILL.md` completely before edits. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created the active objective for this plan. |
| Mode classified as named packet vs broad Core sweep | yes | Package review mode: `packages/suggestion` plus smallest Core portal owner. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Target is scoped plugin API plus `editorApi`, no alias/shim. |
| Broad Core drift ledger initialized when in scope | no | N/A: user said package-only. |
| Source of truth and allowed workspace recorded | yes | Root `VISION.md`, `docs/vision/plate.md`, `docs/vision/common.md`, and skill read; cwd `/Users/zbeyens/git/plate-2`. |
| Output budget strategy recorded | yes | Targeted `rg`/`sed`; count manifests instead of broad dumps. |
| Public API fork routing checked | yes | User accepted this hard cut in chat; implementation scoped to package mode. |
| Gap policy checked | yes | No Plite gap expected; any blocker will be recorded as Plate/Core plugin API gap. |
| Related scoped sweep policy checked | yes | Sweep limited to `packages/suggestion/src` and required Core owner. |
| Review-mode rename freeze checked | yes | No rename planned. |
| Package review checklist initialized when in scope | yes | 49 `packages/suggestion/src` rows materialized below. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation. Evidence: Plate Next source, completion threshold, verification surface, constraints, boundaries, and blocked condition filled above.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan. Evidence: package review mode for `packages/suggestion`, not broad Core.
- [x] Best Plate v2 call recorded for every reviewed target. Evidence: cut `editor.plugin(FooPlugin).api` to scoped plugin API; add `editorApi` for root/composed API; keep render-node context root API where render contract requires it.
- [x] Legacy/backcompat decision recorded. Evidence: no `.api.<pluginKey>` compat alias, no old nested suggestion/block-selection portal calls kept.
- [x] Hack check recorded. Evidence: no local `any` escape for the portal cut; one existing test-only root API cast in `BlockMenuPlugin.spec.tsx` remains intentionally root-shaped.
- [x] Gap ledger updated. Evidence: no Plite/Plate gap blocks this cut; one Plite transaction option type hole fixed in `NodeSetNodesOptions`.
- [x] Related scoped sweep row added after correction. Evidence: suggestion scoped sweep, check-core-caused selection sweep, and diff replacement proof row recorded below.
- [x] Broad Core sweep ruled out. Evidence: user scoped this as package-only; only Core portal owner files were touched.
- [x] Package file checklist generated before implementation. Evidence: `rg --files packages/suggestion/src | sort`, 49 rows.
- [x] Package file rows closed. Evidence: all 49 suggestion source rows are score `100` via source audit plus `pnpm check:core`; package-specific `@platejs/suggestion` test blocker was traced to Diff and fixed.
- [x] No next package started. Evidence: selection/diff work was only `check:core` fallout from the Core API cut, not a new package review.
- [x] Core-adjacent gate handled. Evidence: `tooling/scripts/check-core.mjs` already covers Core, Plite, Selection, and Diff; suggestion remains outside `check:core`, and user only required `check:core`.
- [x] Direct one-shot API audit closed for touched code. Evidence: no new unnecessary transaction/read callback wrappers introduced.
- [x] Plugin export inference audit closed for touched code. Evidence: no explicit callback parameter annotations or plugin export casts added to hide inference regressions.
- [x] Empty config inference audit closed for touched code. Evidence: no new empty plugin config aliases.
- [x] Plugin extension options audit closed for touched code. Evidence: no `extendExtension`/`defineEditorExtension` changes.
- [x] Bridge scoring law applied. Evidence: no private bridge or compatibility wrapper added.
- [x] Review matrix filled for inspected APIs. Evidence: rows below cover Core portal, Suggestion scoped API, Plite option typing, Selection fallout, and Diff replacement marking.
- [x] Public API fork routed. Evidence: user explicitly accepted the hard cut in chat; no compat branch kept.
- [x] Review-mode rename freeze applied. Evidence: no rename pass.
- [x] Extracted-file recovery gate closed. Evidence: no extracted source files introduced; only changesets and this plan added.
- [x] Safe cleanup packets kept. Evidence: all code changes retained after `pnpm check:core`.
- [x] Focused package proof run after meaningful code changes. Evidence: focused selection specs and focused diff specs passed; full `pnpm check:core` passed.
- [x] Barrel gate checked. Evidence: no package exports/barrels changed; `pnpm brl` not needed.
- [x] Old compatibility names source-audited. Evidence: exact removed nested portal audits recorded below.
- [x] Changed list, top drift rows, needs-attention rows, and next owner filled.
- [x] Output budget discipline followed.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Core portal cut | complete | `getEditorPlugin` returns scoped `api` and root `editorApi`; Core type/runtime tests updated. |
| Suggestion sweep | complete | `packages/suggestion/src` uses scoped `api` for `BaseSuggestionPlugin`. |
| Check-core fallout | complete | Selection mocks/callers and Diff replacement marking fixed because `pnpm check:core` exposed them. |
| Final proof | complete | `pnpm check:core` passed. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | `pnpm check:core` passed. |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: user said package-only; Core edits limited to portal owner files. |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Score rows below close at `100`; no drift row `>=2` remains open. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Scoped plugin API plus root `editorApi`; reject nested compat alias. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | No open gap; Plite `marks` option type hole fixed. |
| Related scoped sweep after correction | yes | For each correction, run and record same-class search/review results inside the active scope | Sweeps recorded below for suggestion, selection fallout, and diff proof. |
| Package file checklist | yes | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | `rg --files packages/suggestion/src | sort`: expected 49, actual 49, checked 49, deferred 0. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Focused selection/diff specs passed; full `pnpm check:core` passed. |
| Shared Core gate coverage | yes | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | Existing `check:core` already covers Core, Plite, Selection, Diff; suggestion remains outside by user requirement. |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | Suggestion package test failures traced to Diff replacement bug; fixed because it blocked `check:core`. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Exact old nested API audits recorded no remaining package-scoped matches. |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename pass. |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | No extracted source/config file introduced; new files are changesets and this plan. |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: user required `check:core`; no separate autoreview requested. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` includes typecheck, lint, build, and tests for the core lane; passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-09-plate-next-suggestion-plugin-portal-cut.md` | Ready to run after this update. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `editor.plugin(FooPlugin).api` | 0 | cut | `@platejs/core` plugin portal | Scoped API contract in Core runtime/type tests; `pnpm check:core` passed. | closed |
| `editor.plugin(FooPlugin).editorApi` | 0 | add root API escape | `@platejs/core` plugin portal | Portal context exposes root/composed editor API separately. | closed |
| `packages/suggestion/src` portal callers | 0 | scoped sweep | `@platejs/suggestion` | No remaining `editor.plugin(BaseSuggestionPlugin).api.suggestion` matches; `pnpm check:core` passed. | closed |
| `packages/selection/src` portal callers | 0 | check-core fallout sweep | `@platejs/selection` | Focused selection specs and `pnpm check:core` passed. | closed |
| `packages/diff/src/internal/utils/with-change-tracking.ts` | 0 | fix | `@platejs/diff` | Focused Diff specs and `pnpm check:core` passed. | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Plugin portal API | `editor.plugin(FooPlugin).api.method()` for plugin-owned API; `editor.plugin(FooPlugin).editorApi.foo.method()` for root/composed API | `editor.plugin(FooPlugin).api.foo.method()` compat wrapper; broad root API as portal `api` | Scoped API is the intuitive package-owned surface; root API stays available without namespace ambiguity. | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none open | `tx.nodes.set` option typing missed `marks` | Removing `marks: true` would regress suggestion behavior | `@platejs/plite` `NodeSetNodesOptions` | `pnpm check:core` | fixed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| User rejected `.api.suggestion` namespace | `packages/suggestion/src` | `rg "editor\\.plugin\\(BaseSuggestionPlugin\\)\\.api\\.suggestion|api\\.suggestion\\."` | old nested matches removed | all package callers patched | 0 | none |
| `check:core` selection failures | `packages/selection/src` | failing tests plus `rg "\\.api\\.(blockSelection|blockMenu|cursorOverlay)\\."` | root-shaped spec calls plus stale portal mocks | stale portal mocks/callers patched; root `editor.api.blockMenu.*` spec calls kept | 0 | none |
| `check:core` Diff failures | `packages/diff/src` | failing Diff replacement specs | 7 failing checks | fixed ref consumption/order in `with-change-tracking` | 0 | none |

Core drift ledger:
- Applies: no
- Manifest command: N/A; broad Core sweep out of scope
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | broad Core sweep out of scope | plate-next | User requested package-only; touched Core owner files are listed in Review matrix. | closed |

Package file checklist:
- Applies: yes
- Package: `packages/suggestion`
- Manifest command: `rg --files packages/suggestion/src | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 49
- Actual row count: 49
- Checked score-100 count: 49
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: closed; no next package started

Package file rows:
- [x] `packages/suggestion/src/index.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion package exports — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.spec.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion plugin tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion plugin — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/diffToSuggestions.spec.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion diff tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/diffToSuggestions.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion diff helper — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/index.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion lib exports — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/insertBreakSuggestion.spec.tsx` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion break tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/queries/findSuggestionNode.spec.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion query tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/queries/findSuggestionNode.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion query helper — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/queries/findSuggestionProps.spec.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion query tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/queries/findSuggestionProps.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion query helper — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/queries/index.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion query exports — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/acceptSuggestion.spec.tsx` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/acceptSuggestion.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/addMarkSuggestion.spec.tsx` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/addMarkSuggestion.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/deleteFragmentSuggestion.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/deleteSuggestion.spec.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/deleteSuggestion.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/getSuggestionProps.spec.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/getSuggestionProps.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform helper — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/index.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform exports — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/insertFragmentSuggestion.spec.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/insertFragmentSuggestion.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/insertTextSuggestion.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/rejectSuggestion.spec.tsx` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/rejectSuggestion.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/removeMarkSuggestion.spec.tsx` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/removeMarkSuggestion.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/removeNodesSuggestion.spec.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/removeNodesSuggestion.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/setSuggestionNodes.spec.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/transforms/setSuggestionNodes.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion transform — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/types.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion public types — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/utils/SkipSuggestionDeletes.spec.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion util tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/utils/SkipSuggestionDeletes.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion util — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/utils/getActiveSuggestionDescriptions.spec.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion util tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/utils/getActiveSuggestionDescriptions.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion util — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/utils/getSuggestionId.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion util — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/utils/getSuggestionKeys.spec.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion util tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/utils/getSuggestionKeys.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion util — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/utils/getSuggestionNodeEntries.spec.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion util tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/utils/getSuggestionNodeEntries.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion util — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/utils/getTransientSuggestionKey.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion util — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/utils/index.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion util exports — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/withSuggestion.spec.tsx` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion behavior tests — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/lib/withSuggestion.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion behavior — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/react/SuggestionPlugin.tsx` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion React plugin — evidence: source audit and `pnpm check:core` passed — next: closed
- [x] `packages/suggestion/src/react/index.ts` — score: 100 — verdict: scoped portal sweep closed — owner: suggestion React exports — evidence: source audit and `pnpm check:core` passed — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Scoped plugin portal cut | `@platejs/core` | Portal `api` should be plugin-owned; root API needs a separate name | Core plugin context/runtime/type-test files | keep | closed |
| Suggestion API sweep | `@platejs/suggestion` | Suggestion callers used old nested portal namespace | `packages/suggestion/src` | keep | closed |
| Check-core fallout | `@platejs/selection`, `@platejs/diff`, `@platejs/plite` | Core gate exposed same portal shape fallout and a Diff ref-order bug | focused specs plus `pnpm check:core` | keep | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | no extracted source files | N/A | closed | Only changesets and this plan were added. |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `@platejs/suggestion test` before Diff fix | Two `diffToSuggestions` replacement failures traced to `@platejs/diff` invalid split/replacement marker behavior | Became blocking only when `check:core` hit Diff; fixed in `@platejs/diff` | closed |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| `editor.api.blockMenu.*` | `packages/selection/src/react/BlockMenuPlugin.spec.tsx` | Root editor API shape, not portal API; keeping it is correct | closed |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Core scoped portal `api` + `editorApi`; Plite `NodeSetNodesOptions` marks typing; Diff ref-order/ref-consumption fix; suggestion/selection scoped portal callers. |
| tests/proof | Core portal specs/type-tests updated; suggestion/selection/diff tests adjusted; focused specs and `pnpm check:core` passed. |
| docs/templates/skills | This plan plus changesets for `@platejs/core`, `@platejs/plite`, `@platejs/diff`. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | none | No open blocker after `pnpm check:core` | N/A | ship current packet |

Findings:
- The portal API cut is the right shape: plugin package callers read `editor.plugin(FooPlugin).api.method()`, while decoupled/root calls use `editor.plugin(FooPlugin).editorApi`.
- Diff replacement marking had a real ref bug: removed text insertion before inserted range marking put insert metadata on the deleted text; consuming refs with `unref()` is needed inside the same transaction.

Decisions and tradeoffs:
- Do not keep `.api.<pluginKey>` as a compat namespace on plugin portals.
- Keep render-node plugin context `api` root-shaped because that existing render contract is editor-context, not plugin portal lookup.
- Keep `editor.api.blockMenu.*` in the selection spec because it intentionally tests the composed root API, not `editor.plugin(BlockMenuPlugin).api`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm check:core` selection portal failures | 1 | Patch stale portal mocks/callers in `packages/selection/src` | Focused selection specs and `pnpm check:core` passed |
| `pnpm check:core` Diff replacement failures | 1 | Fix `withChangeTracking` commit order and draft ref consumption | Focused Diff specs and `pnpm check:core` passed |
| `@platejs/suggestion test` diff replacement failures | 1 | Trace to Diff instead of weakening suggestion behavior | Diff fix closed the underlying failure class |

Verification evidence:
- `bun test --preload ../../config/plite-source-test-setup.ts ./src/react/hooks/useBlockSelectable.spec.tsx ./src/react/utils/copySelectedBlocks.spec.tsx` in `packages/selection`: 9 pass, 0 fail.
- `bun test --preload ../../config/plite-source-test-setup.ts ./src/internal/transforms/transformDiffDescendants.spec.ts ./src/internal/transforms/transformDiffNodes.spec.ts ./src/internal/transforms/transformDiffTexts.spec.ts ./src/internal/utils/with-change-tracking.spec.ts ./src/lib/computeDiff.spec.ts` in `packages/diff`: 47 pass, 0 fail.
- `pnpm check:core`: passed. It covered typecheck, lint, Plite build artifact, Core tests, Plite tests, Utils tests, Basic Nodes tests, Basic Styles tests, Indent tests, Selection tests, and Diff tests.

Final handoff contract:
- target surface and mode: package review mode for `packages/suggestion`, plus Core portal owner and `check:core` fallout packages.
- files/APIs reviewed: Core plugin portal/context, suggestion plugin callers, selection portal fallout, Plite node-set option typing, Diff change tracking.
- broad Core drift score coverage: N/A; package-only scope.
- package file checklist coverage: 49 expected / 49 actual / 49 checked / 0 deferred.
- best Plate v2 recommendation: scoped portal `api`, root `editorApi`, no nested compat namespace.
- verdict matrix summary: all rows score `100`, keep.
- Plite/Plate gaps or blockers: no open gap; Plite `marks` type hole fixed.
- related scoped sweep query/active scope/matches/patched/deferred: recorded in sweep ledger; deferred count 0.
- out-of-scope matches discovered: root `editor.api.blockMenu.*` spec calls kept as correct root API coverage.
- changes made: code/runtime/tests/plans/changesets listed above.
- tests/proof commands: focused selection, focused diff, `pnpm check:core`.
- old compatibility names audited: no remaining `editor.plugin(BaseSuggestionPlugin).api.suggestion` or `api.suggestion.*` old nested calls.
- needs attention: none.
- next best Plate Next packet: none from this cut.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure after `pnpm check:core` passed |
| Where am I going? | Handoff |
| What is the goal? | Cut plugin portal API to scoped `api` plus root `editorApi`, sweep suggestion package, pass `check:core` |
| What have I learned? | Scoped portal cut is clean; Diff needed draft-aware ref consumption |
| What have I done? | Implemented cut, swept package/check-core fallout, added changesets, verified |

Timeline:
- 2026-07-09T11:57:13.151Z Goal plan created.
- 2026-07-09 Scoped Core portal API implemented.
- 2026-07-09 Suggestion and check-core fallout sweeps completed.
- 2026-07-09 Focused selection and Diff specs passed.
- 2026-07-09 `pnpm check:core` passed.

Open risks:
- None for the requested gate. `@platejs/suggestion` full package test was not the requested gate; the underlying Diff failures discovered there were fixed and covered by `pnpm check:core`.
