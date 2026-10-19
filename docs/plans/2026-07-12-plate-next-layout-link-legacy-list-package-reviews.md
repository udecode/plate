# plate-next layout link legacy list package reviews

Objective:
Close layout, link, and legacy-list-model drift; done when 172 rows score 100 or are deferred and proof plus autoreview pass; plan docs/plans/2026-07-12-plate-next-layout-link-legacy-list-package-reviews.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-12-plate-next-layout-link-legacy-list-package-reviews.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user invoked `plate-next next 3 packages`
- mode: sequential package review
- target surface: `packages/layout`, then `packages/link`, then `packages/platejs/src/features/list`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, inside the active package plus the smallest required owner
- package review mode: yes
- package review target: 31 layout + 57 link + 84 legacy-list-model current files
- package file checklist gate: 172 rows materialized before source review; `[x]` only at score `100`
- completion threshold summary: close each package in order; 172/172 rows score 100 or carry explicit user-review deferrals; focused proof, scoped sweeps, autoreview, and final checker pass

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
- requested duration: none
- semantics: one-shot completion of exactly three packages
- initial confidence score: 0.40
- improvement loop: review and close `layout`, then `link`, then `legacy-list-model`
- final score / loop closure: closed at 88 score-100 rows plus 84 explicit deferrals; focused proof and review recorded

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| layout review and migration | completed | 31/31 score 100; lint/typecheck/26 tests/build green |
| link review and migration | completed | 57/57 score 100; lint/typecheck/68 tests/build green |
| legacy-list-model review and routing | completed | 84/84 reviewed and explicitly deferred to linked Plate Plan |
| combined proof and review | completed | manifests exact; source sweeps green; accepted review findings fixed or consciously rejected with origin/main evidence |

Completion threshold:
- All 172 reviewed package rows score 100 or carry an explicit user-review deferral; package order is layout, link, legacy-list-model; focused package proof and final autoreview pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-layout-link-legacy-list-package-reviews.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package-local tests, source-first typecheck, build, lint, manifests, barrels when exports change, final autoreview
- package proof: `pnpm --filter @platejs/<package> test`, `pnpm turbo typecheck --filter=./packages/<package>`, `pnpm --filter @platejs/<package> build`, package lint
- shared Core gate: N/A unless a smallest Core/Plite owner changes; these are feature packages outside `check:core`
- source audits: umbrella imports, removed Slate constructors/APIs, flat editor aliases, casts, callback nesting, normalization, root pollution, dependency truth, and origin/main ownership
- related scoped sweep query / active scope / match count / patched count / deferred count:
  record per correction for the active package; broader matches are deferred
- package file manifest / row count / checked count / deferred count: 172 / 88 / 84 at closeout
- Plite/Plate gap ledger: record blockers per package; none known at checkpoint zero
- broad Core drift ledger gate: N/A; broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-layout-link-legacy-list-package-reviews.md`

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
- Live node target law: if a caller already has a live descendant, pass it as
  the `NodeTarget` / `at` value or use `editor.read.nodes.path(node)` only when
  a `Path` is required. Do not rediscover it with a type/ID query. Handle an
  unresolved public path instead of asserting it.
- Property matcher law: exact shallow equality uses property objects such as
  `match: { type }`, `match: { id }`, and array-valued one-of matchers.
  Property matchers intentionally ignore `text` and `children`; content and
  structure checks remain predicates. Predicates also remain for computed
  schema policy, path-dependent logic, truthiness semantics, or consumed type
  narrowing.
- Flat node-query aliases are forbidden: no `editor.api.findPath`,
  `editor.api.some`, `read.nodes.pathOf`, Plate wrappers, or implicit type/ID
  scans. Use `editor.read.nodes.path`, `editor.read.nodes.some`, and direct
  node targets.
- Boolean node-query law: when an entry-producing collection query is used only
  for truthiness and `nodes.some` has the same target/match/traversal semantics,
  use `editor.read.nodes.some`. Keep `above`, `block`, `parent`, `previous`, and
  `next` when their ancestor/current-block/relative traversal is the actual
  question, and keep any entry-producing query when the node/path is consumed.
- Optional public-read law: Plate feature-package source handles unresolved
  Plite reads with an early return/no-op. `{ required: true }` is reserved for
  Plite internals with a proven runtime invariant; fixture assertions are the
  test-only exception.
- Explicit normalization law: bare `tx.normalize()` /
  `editor.update.normalize()` is an explicit full-root pass in Plite. Feature
  code may keep it only for a named full-root semantic invariant. Do not use it
  to coalesce equivalent text leaves or preserve old fixture shape. Prefer
  transaction dirty-path normalization, repair a universal invariant in Plite,
  and classify every match in the active scope as `cut`,
  `semantic-dirty-path`, `semantic-full-root`, `explicit-normalizer-test`,
  `lifecycle-option`, or `Plite-owner-gap`.
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
  `defineEditorExtension({ name: pluginName, ... })` just to satisfy types.
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
- allowed edit scope: `packages/layout`, `packages/link`, `packages/platejs/src/features/list`, this plan, package changesets, valid lockfile/barrel changes, and the smallest required Core/Plite owner
- package/API surfaces: `packages/layout`, `packages/link`, `packages/platejs/src/features/list`
- docs/browser surfaces: package-local README parity only when reviewed public API changes; apps/content/browser proof excluded
- non-goals: apps, content docs, registry generation, broad caller migrations, renames, commits, PRs, unrelated packages
- out-of-scope package errors: record without patching unless caused by this batch

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Inspect one package at a time; count searches before printing matches; exclude dist/generated trees.

Blocked condition:
- A public API fork, missing Plite substrate, or repeated package-proof failure that cannot be resolved inside the active package plus smallest-owner scope.

Current verdict:
- verdict: layout and link closed; legacy-list-model reviewed and explicitly deferred to Plate Plan
- confidence: 0.96
- next owner: `plate-plan/legacy-list-model`
- keep / revert / quarantine call: keep the proven layout/link migrations; keep legacy-list-model unchanged until its public API plan is accepted
- reason: 88 rows score 100; all 84 legacy-list-model rows inherit the explicit package-wide deferral below

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact three-package target, ordering, non-goals, stop condition, proof, and handoff recorded |
| `plate-next` skill/rule read | yes | User-supplied complete Plate Next skill read |
| Active goal checked or created | yes | No active goal; matching goal created after this checkpoint |
| Mode classified as named packet vs broad Core sweep | yes | Sequential package review; broad Core excluded |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Constraints and completion threshold above |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | Current checkout, origin/main evidence, named packages, smallest required owner |
| Output budget strategy recorded | yes | Package-at-a-time targeted reads and capped searches |
| Public API fork routing checked | yes | Any discovered fork routes to plate-plan before implementation |
| Gap policy checked | yes | Missing substrate becomes a named Plite/Plate gap |
| Related scoped sweep policy checked | yes | Every correction gets an active-package sweep |
| Review-mode rename freeze checked | yes | Current HEAD paths/names stay fixed |
| Package review checklist initialized when in scope | yes | 172 manifest rows materialized before source review |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
- [x] After every correction, related scoped sweep row is added with query,
      active scope, match count, patched count, deferred count, and remaining
      risk. In package review mode, broader matches are deferred, not patched.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] For package review mode, the package file checklist is generated before
      implementation, with one checkbox per reviewed file.
- [x] For package review mode, every package file row is either checked at
      score `100` with evidence or left unchecked with deferral reason, owner,
      proof needed, and next action for user review.
- [x] For package review mode, no next package is started before the current
      package checklist closes or the user explicitly redirects.
- [x] For Core-adjacent package review, `tooling/scripts/check-core.mjs` is
      updated to include the package, or the plan records why the package is
      product-only and outside `check:core`.
- [x] Direct one-shot API audit closed: single-operation
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic.
- [x] Live node target and matcher audit closed: no supplied live node is
      rediscovered by type/ID, no flat `api.findPath` / `api.some` alias remains
      in scope, equality-only callbacks use property matchers, and every
      remaining predicate has computed/path/truthiness/narrowing semantics.
- [x] Optional public-read audit closed: feature-package production code does
      not use `{ required: true }` or non-null assertions to hide unresolved
      Plite reads; each match handles `undefined` or records a Plite-internal
      invariant reason.
- [x] Explicit normalization audit closed: every `tx.normalize(...)` and
      `editor.update.normalize(...)` match in scope has a ledger verdict;
      feature production calls have a named full-root semantic invariant or are
      cut/moved to the Plite owner; explicit normalizer tests remain test-only
      evidence rather than production precedent.
- [x] Plugin export inference audit closed: plugin export annotations/casts
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
- [x] Empty config inference audit closed: `PluginConfig<'key'>` aliases and
      `createBasePlugin<Config>` generics are removed when the config has no
      typed options, API, tx, selectors, state, or external public contract.
- [x] Plugin extension options audit closed: plugin-owned extension options are
      returned directly from `extendExtension`; `defineEditorExtension` remains
      only for standalone Plite extensions, existing built extensions, or
      explicit non-plugin extension identities.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change (N/A: no exported path was added, removed, or moved).
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | passed | Run the proof commands named in this plan | layout/link lint, source-first typecheck, tests, build green; legacy-list-model explicitly deferred |
| Broad Core drift ledger coverage | N/A | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | product-package mode; broad Core excluded |
| Score gate | passed | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 88 score 100; 84 legacy-list-model rows explicitly deferred |
| Best Plate v2 recommendation | passed | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | recommendation table complete |
| Plite/Plate gap ledger | passed | Record blockers or N/A when no gap blocks the target | layout/link N/A; legacy-list-model API decision routed |
| Related scoped sweep after correction | passed | For each correction, run and record same-class search/review results inside the active scope | legacy source and selection-target query sweeps clean in migrated packages |
| Package file checklist | passed | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | 172/172 rows represented; 88 checked, 84 deferred |
| Package/API proof | passed | Run focused typecheck/test/build or record N/A | layout 26 tests; link 68 tests; both typecheck/build green |
| Shared Core gate coverage | N/A | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | layout/link/legacy-list-model are product packages outside `check:core` |
| Non-Core package error triage | passed | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | root lint failures classified unrelated; legacy-list-model baseline recorded as routed package drift |
| Source audit | passed | Run exact audit for removed compatibility names or record N/A | layout/link no umbrella imports, Slate constructors, `.tf`, bridge casts, or unscoped selection queries |
| Rename ledger | N/A | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | no renames retained or proposed |
| Extracted-file inventory | passed | Record untracked/extracted file command, row count, and bucket for every file in scope | zero package-local untracked files at checkpoint zero; only named changesets/plans added |
| Autoreview / review | passed | Run review gate for non-trivial implementation diffs or record N/A | four Codex runs; three accepted bug classes fixed; final code-block finding rejected as unchanged from origin/main |
| Final lint/check | passed | Run scoped lint/check or record N/A | Biome green across 79 package files |
| Changed list / top drift / needs attention | passed | Fill handoff ledgers | handoff ledgers complete |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-layout-link-legacy-list-package-reviews.md` | passed at closeout |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/layout` | 0 | migrate | layout package | 31/31 score 100; proof green | closed |
| `packages/link` | 0 | migrate | link package | 57/57 score 100; proof green | closed |
| `packages/platejs/src/features/list` | 5 | deferred-user-review | plate-plan/legacy-list-model | 71/84 files carry legacy runtime/test drift; baseline 5 pass, 27 fail, 26 load errors | continue `docs/plans/2026-07-12-legacy-list-model-v2-api.md` |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| layout | Base plugins with inferred `editor.update.column` commands and active transaction helpers | umbrella imports, Slate constructors, bridge access, casts, legacy transform mocks | preserves column behavior on the direct Core/Plite runtime | none |
| link | Base plugin with inferred `editor.update.link`, typed input rules, and direct React owners | umbrella imports, Slate transforms, normalizer selection side effects, bridge tests, casts | preserves link, autolink, split unwrap, validation, and floating trigger behavior | none |
| legacy-list-model | one typed Plate product transaction group; helpers receive the active transaction; typed extension chain | umbrella bridge, Slate editor surface, piecemeal helper conversion, casts | public command/transaction/middleware ownership must be decided as one API | required in linked Plate Plan |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A: layout/link | no missing capability | no workaround retained | Core/Plite already owns required APIs | typecheck/tests/build | closed |
| Plate API: legacy-list-model | product command names, transaction boundaries, and seven middleware owners need one coherent target | converting helpers independently would preserve split legacy ownership and freeze a bad public API | `plate-plan/legacy-list-model` | finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser | deferred-user-review |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| legacy editor aliases/casts | `packages/layout` | `rg` for umbrella imports, `api`/`tf`, `as any`, `as unknown` | 0 after patch | all prior matches | 0 | closed |
| legacy editor aliases/casts | `packages/link` | same audit plus bridge/constructor names | 0 production matches after patch | all prior matches | 0 | closed |
| package-wide legacy runtime | `packages/platejs/src/features/list` | umbrella imports, `.api`/`.tf`, Slate editor/override types, and casts | 71/84 files: 43/50 production and 28/28 specs | 0 | 71 matches plus 13 coupled package rows | API design remains pending in Plate Plan |

Core drift ledger:
- Applies: no; broad Core sweep excluded
- Manifest command: N/A
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
| N/A | N/A | broad Core sweep excluded | N/A | package manifests own coverage | none |

Package file checklist:
- Applies: yes
- Package: `packages/layout`, then `packages/link`, then `packages/platejs/src/features/list`
- Manifest command: `(git ls-files packages/<package>; git ls-files --others --exclude-standard packages/<package>) | sort -u`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 172
- Actual row count: 172
- Checked score-100 count: 88
- Unchecked/deferred count: 84 / 84
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: every row in the active package scores 100 or carries an explicit user-review deferral

Package file rows:
- [x] `packages/layout/.npmignore` — score: 100 — verdict: keep — evidence: package audit and green build — next: closed
- [x] `packages/layout/CHANGELOG.md` — score: 100 — verdict: keep — evidence: historical record audited — next: closed
- [x] `packages/layout/README.md` — score: 100 — verdict: keep — evidence: no stale public API examples — next: closed
- [x] `packages/layout/package.json` — score: 100 — verdict: direct dependencies — evidence: umbrella dependency cut; install/build green — next: closed
- [x] `packages/layout/src/index.ts` — score: 100 — verdict: keep barrel — evidence: build green — next: closed
- [x] `packages/layout/src/lib/BaseColumnPlugin.ts` — score: 100 — verdict: migrate — evidence: inferred Base plugin transaction API; proof green — next: closed
- [x] `packages/layout/src/lib/ColumnRuntimePlugin.spec.ts` — score: 100 — verdict: migrate — evidence: five direct runtime cases green — next: closed
- [x] `packages/layout/src/lib/index.ts` — score: 100 — verdict: keep barrel — evidence: build green — next: closed
- [x] `packages/layout/src/lib/transforms/index.ts` — score: 100 — verdict: keep barrel — evidence: build green — next: closed
- [x] `packages/layout/src/lib/transforms/insertColumn.spec.ts` — score: 100 — verdict: migrate — evidence: public command coverage green — next: closed
- [x] `packages/layout/src/lib/transforms/insertColumn.ts` — score: 100 — verdict: migrate — evidence: active transaction; no casts/aliases — next: closed
- [x] `packages/layout/src/lib/transforms/insertColumnGroup.spec.ts` — score: 100 — verdict: migrate — evidence: public command coverage green — next: closed
- [x] `packages/layout/src/lib/transforms/insertColumnGroup.ts` — score: 100 — verdict: migrate — evidence: active transaction grouping/direct reads — next: closed
- [x] `packages/layout/src/lib/transforms/moveMiddleColumn.spec.ts` — score: 100 — verdict: migrate — evidence: merge and empty behavior green — next: closed
- [x] `packages/layout/src/lib/transforms/moveMiddleColumn.ts` — score: 100 — verdict: migrate — evidence: refs/casts cut; transaction paths — next: closed
- [x] `packages/layout/src/lib/transforms/resizeColumn.spec.ts` — score: 100 — verdict: keep behavior — evidence: four cases green without casts — next: closed
- [x] `packages/layout/src/lib/transforms/resizeColumn.ts` — score: 100 — verdict: simplify — evidence: structural contract; package proof green — next: closed
- [x] `packages/layout/src/lib/transforms/setColumns.spec.tsx` — score: 100 — verdict: migrate — evidence: resize/merge/repeat/no-op/normalization green — next: closed
- [x] `packages/layout/src/lib/transforms/setColumns.ts` — score: 100 — verdict: migrate — evidence: transaction API preserves normalization/content — next: closed
- [x] `packages/layout/src/lib/transforms/toggleColumnGroup.spec.tsx` — score: 100 — verdict: migrate — evidence: wrap/update/merge/no-selection green — next: closed
- [x] `packages/layout/src/lib/transforms/toggleColumnGroup.ts` — score: 100 — verdict: migrate — evidence: direct transaction replacement/selection — next: closed
- [x] `packages/layout/src/lib/utils/columnsToWidths.ts` — score: 100 — verdict: keep — evidence: pure owner audited — next: closed
- [x] `packages/layout/src/lib/utils/index.ts` — score: 100 — verdict: keep barrel — evidence: build green — next: closed
- [x] `packages/layout/src/lib/withColumn.spec.ts` — score: 100 — verdict: delete duplicate — evidence: stale Slate mocks duplicated runtime proof — next: closed
- [x] `packages/layout/src/lib/withColumn.ts` — score: 100 — verdict: migrate — evidence: extension normalizer and transaction select-all green — next: closed
- [x] `packages/layout/src/react/ColumnPlugin.tsx` — score: 100 — verdict: direct owner import — evidence: Core React adapter; build green — next: closed
- [x] `packages/layout/src/react/hooks/index.ts` — score: 100 — verdict: keep barrel — evidence: build green — next: closed
- [x] `packages/layout/src/react/hooks/useDebouncePopoverOpen.ts` — score: 100 — verdict: migrate — evidence: current Core hooks/direct read — next: closed
- [x] `packages/layout/src/react/index.ts` — score: 100 — verdict: keep barrel — evidence: build green — next: closed
- [x] `packages/layout/tsconfig.build.json` — score: 100 — verdict: keep — evidence: typecheck/build green — next: closed
- [x] `packages/layout/tsconfig.json` — score: 100 — verdict: keep — evidence: typecheck green — next: closed
- [x] `packages/link/.npmignore` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/CHANGELOG.md` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/README.md` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/package.json` — score: 100 — verdict: direct dependencies — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/index.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/BaseLinkPlugin.spec.tsx` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/BaseLinkPlugin.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/BaseLinkRuntimePlugin.spec.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/LinkRules.spec.tsx` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/LinkRules.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/index.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/internal/inputRules.spec.tsx` — score: 100 — verdict: delete duplicate — evidence: coverage consolidated into direct runtime suites — next: closed
- [x] `packages/link/src/lib/transforms/index.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/transforms/insertLink.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/transforms/unwrapLink.spec.tsx` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/transforms/unwrapLink.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/transforms/upsertLink.spec.tsx` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/transforms/upsertLink.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/transforms/upsertLinkText.spec.tsx` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/transforms/upsertLinkText.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/transforms/wrapLink.spec.tsx` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/transforms/wrapLink.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/utils/createLinkNode.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/utils/encodeUrlIfNeeded.spec.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/utils/encodeUrlIfNeeded.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/utils/getLinkAttributes.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/utils/index.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/utils/safeDecodeUrl.spec.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/utils/safeDecodeUrl.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/utils/validateUrl.spec.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/utils/validateUrl.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/lib/withLink.spec.tsx` — score: 100 — verdict: delete duplicate — evidence: coverage consolidated into direct runtime suites — next: closed
- [x] `packages/link/src/lib/withLink.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/LinkPlugin.tsx` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/components/FloatingLink/FloatingLinkNewTabInput.tsx` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/components/FloatingLink/FloatingLinkUrlInput.tsx` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/components/FloatingLink/LinkOpenButton.tsx` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/components/FloatingLink/index.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/components/FloatingLink/useFloatingLinkEdit.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/components/FloatingLink/useFloatingLinkEnter.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/components/FloatingLink/useFloatingLinkEscape.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/components/FloatingLink/useFloatingLinkInsert.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/components/FloatingLink/useVirtualFloatingLink.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/components/index.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/components/useLink.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/components/useLinkToolbarButton.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/index.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/transforms/index.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/transforms/submitFloatingLink.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/utils/floatingLinkTriggers.spec.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/utils/getLinkAttributes.spec.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/utils/index.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/utils/triggerFloatingLink.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/utils/triggerFloatingLinkEdit.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/src/react/utils/triggerFloatingLinkInsert.ts` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/tsconfig.build.json` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
- [x] `packages/link/tsconfig.json` — score: 100 — verdict: migrate or keep — evidence: source audit plus scoped lint, typecheck, 64 tests, and build — next: closed
legacy-list-model row deferral (applies individually to every one of the 84 unchecked rows below): verdict `deferred-user-review`; reason: package-wide public command, transaction, and middleware API decision; owner: `plate-plan/legacy-list-model`; proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then run scoped lint, typecheck, tests, build, and browser proof; next action: continue that Plate Plan.

- [ ] `packages/platejs/src/features/list/.npmignore` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/CHANGELOG.md` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/README.md` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/package.json` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/index.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/BaseListInputRules.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/BaseListPlugin.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/BaseTodoListPlugin.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/BaseTodoListPlugin.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/BulletedListRules.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/OrderedListRules.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/TaskListRules.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/index.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/normalizers/index.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/normalizers/normalizeListItem.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/normalizers/normalizeListItem.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/normalizers/normalizeNestedList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/normalizers/normalizeNestedList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/getHighestEmptyList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/getHighestEmptyList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/getListItemEntry.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/getListItemEntry.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/getListRoot.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/getListRoot.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/getListTypes.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/getTaskListProps.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/getTodoListItemEntry.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/getTodoListItemEntry.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/hasListChild.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/hasListChild.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/index.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/isAcrossListItems.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/isListNested.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/isListNested.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/isListRoot.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/queries/someList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/indentListItems.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/index.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/insertListItem.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/insertListItem.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/insertTodoListItem.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/insertTodoListItem.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/moveListItemDown.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/moveListItemSublistItemsToListItemSublist.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/moveListItemSublistItemsToListItemSublist.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/moveListItemUp.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/moveListItems.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/moveListItemsToList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/moveListItemsToList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/moveListSiblingsAfterCursor.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/moveListSiblingsAfterCursor.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/removeFirstListItem.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/removeListItem.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/removeListItem.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/toggleList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/toggleList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/unindentListItems.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/unindentListItems.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/unwrapList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/transforms/unwrapList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withDeleteBackwardList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withDeleteBackwardList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withDeleteForwardList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withDeleteForwardList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withDeleteFragmentList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withDeleteFragmentList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withInsertBreakList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withInsertBreakList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withInsertFragmentList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withInsertFragmentList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withList-tab.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withNormalizeList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/lib/withNormalizeList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/react/ListPlugin.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/react/TodoListPlugin.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/react/hooks/index.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/react/hooks/legacyListModelHooks.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/react/hooks/useListToolbarButton.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/react/hooks/useTodoListElement.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/src/react/index.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/tsconfig.build.json` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/platejs/src/features/list/tsconfig.json` — score: 0 — verdict: deferred-user-review — owner: plate-plan/legacy-list-model — evidence: package-wide public API/transaction/middleware decision; 71/84 drift files — proof needed: finish and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| layout | plate-next | umbrella/Slate runtime drift | 31 rows | 31/31 score 100; direct Base/Plite migration | closed |
| link | plate-next | umbrella/Slate/runtime-test drift | 57 rows | 57/57 score 100; direct Base/Plite migration | closed |
| legacy-list-model | plate-plan/legacy-list-model | package-wide public API/transaction/middleware decision | 84 rows; 71 drift matches; baseline test 5 pass/27 fail/26 load errors | all 84 explicitly deferred to linked Plate Plan | continue `docs/plans/2026-07-12-legacy-list-model-v2-api.md` |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/layout` | none at checkpoint zero | 0 untracked files | N/A | checkpoint-zero manifest |
| `packages/link` | none at checkpoint zero | 0 untracked files | N/A | checkpoint-zero manifest |
| `packages/platejs/src/features/list` | none at checkpoint zero | 0 untracked files | N/A | checkpoint-zero manifest |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| Root `pnpm lint:fix` | hundreds of unrelated pre-existing Plite diagnostics | package-scoped Biome is the relevant gate; no layout/link failure remained | existing Plite owners |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| legacy-list-model legacy runtime patterns | apps/www and markdown serializer callers | package target API is unresolved; callers follow only after plan acceptance | `plate-plan/legacy-list-model` |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | layout and link migrated to direct Base/Plite APIs with inferred transaction groups; duplicate stale specs deleted |
| tests/proof | layout/link runtime suites consolidated around direct owners |
| docs/templates/skills | two changesets; parent Plate Next ledger; legacy-list-model Plate Plan |
| reverted/quarantined packets | formatter-only `toggleList.ts` drift restored; no legacy-list-model implementation attempted |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | legacy-list-model API plan | 84-file package cannot be safely migrated before its public command, transaction, and middleware ownership is accepted | `docs/plans/2026-07-12-legacy-list-model-v2-api.md` | continue Plate Plan intent/boundary pass |

Findings:
- Layout behavior was sound; drift lived in the umbrella imports, removed Slate plugin/editor APIs, bridge-based runtime spec, casts, and duplicate legacy mock suite.
- Link needed the same hard cut plus one architecture correction: caret escape belongs in `insertText` middleware, not a selection-mutating normalizer that cannot reach a Plite fixpoint.
- legacy-list-model is architecture work, not cleanup: 43/50 production files and 28/28 specs carry legacy runtime patterns, while baseline tests stop at 26 removed-export load errors.
- Structured review exposed three migration bug classes: direction-dependent column Select All, document-root link queries, and split unwrap dropping the trailing linked fragment. All were fixed with focused regression coverage.

Decisions and tradeoffs:
- Commands live at inferred `editor.update.column`; helpers accept the active transaction. The duplicated `withColumn.spec.ts` was deleted because direct runtime coverage owns the same behavior.
- Link commands live at `editor.update.link`; input-rule variants use typed factories instead of match casts. Duplicate `withLink` and internal markdown suites were consolidated into direct runtime coverage.
- legacy-list-model implementation is intentionally deferred. Plate Plan pass 1 recorded current state; the next activation owns the intent/boundary pass. No public API was guessed in this packet.
- The reviewer suggestion to disable space/Enter autolink inside code blocks was rejected for this packet: origin/main has the same `getAutolinkMatch` behavior, so it is a separate behavior decision rather than migration drift.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Root `pnpm lint:fix` hit unrelated pre-existing Plite diagnostics | 1 | use package-scoped Biome | `pnpm exec biome check packages/layout --write` green |
| Layout typecheck exposed an assertion against a structurally added property | 1 | assert the resulting object shape | fixed without casts |
| Width normalization test exposed missing explicit dirty-path flush | 1 | preserve origin/main behavior with `tx.normalize({ force: false })` | 25 tests green |
| Link source-only typecheck exposed tx-group and utility-owner mismatches | 1 | use named `link` tx group and direct utility packages | source build green |
| Link selection-mutating normalizer repeated draft states | 1 | move caret escape to `insertText` middleware | 64 tests green |
| Split unwrap initially targeted the wrong split half | 1 | unwrap `PathApi.next` of the original link | all three directional cases green |
| legacy-list-model baseline package test loads removed `platejs` exports | 1 | route the package-wide public API decision to Plate Plan | 5 pass, 27 fail, 26 module-load errors recorded; implementation deferred |
| Parallel layout artifact build read Plite declarations while they were being rebuilt | 1 | rerun the artifact build serially after source-first typecheck | build green; classified as proof-command race, not source failure |
| Autoreview: backward full-column Select All was direction-dependent | 1 | compare ordered `RangeApi.edges` and add backward-selection coverage | fixed; layout 26 tests green |
| Autoreview: link reads without `at` scanned the document root | 2 review runs | scope every selection-owned `nodes.some/find` and add unrelated-node/multiple-link tests | fixed; exact sibling sweep clean |
| Autoreview: split unwrap unwrapped the full suffix for a middle selection | 1 | split ordered endpoints and unwrap only the selected segment | fixed; prefix/middle/suffix regression green |
| Autoreview: code-block space/Enter behavior | 1 | compare origin/main before expanding | rejected: identical pre-existing behavior, outside migration-drift contract |

Verification evidence:
- Layout: `pnpm exec biome check packages/layout --write` green (27 files).
- Layout: `pnpm turbo typecheck --filter=./packages/layout` green (11 tasks).
- Layout: `pnpm --filter @platejs/layout test` green (26 tests, 66 assertions).
- Layout: `pnpm --filter @platejs/layout build` green.
- Layout source audit: no umbrella imports, old `api`/`tf` aliases, `as any`, or `as unknown` remain.
- Link: `pnpm exec biome check packages/link --write` green (52 files).
- Link: `pnpm turbo typecheck --filter=./packages/link` green (12 tasks).
- Link: `pnpm --filter @platejs/link test` green (68 tests, 97 assertions).
- Link: `pnpm --filter @platejs/link build` green.
- Link production audit: no umbrella imports, Slate constructors, bridge access, compatibility aliases, or casts remain.
- Link selection-query audit: no production `nodes.some/find` selection-owned call remains without explicit `at`.
- legacy-list-model audit: 71/84 files match legacy umbrella/runtime/editor/cast patterns (43/50 production; 28/28 specs); current formatter-only source drift restored to zero.
- Autoreview: `.agents/skills/autoreview/scripts/autoreview --mode local --prompt <frozen layout/link scope> --stream-engine-output`; three accepted bug classes fixed, one unchanged origin/main behavior consciously rejected.
- Goal checker: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-layout-link-legacy-list-package-reviews.md` green.

Final handoff contract:
- target surface and mode: sequential package review for layout, link, legacy-list-model
- files/APIs reviewed: 172/172 manifest rows; 88 score 100 and 84 explicitly deferred
- broad Core drift score coverage: N/A; product packages only
- package file checklist coverage: layout 31/31 closed, link 57/57 closed, legacy-list-model 84/84 reviewed/deferred
- best Plate v2 recommendation: direct inferred Base/Plite transactions; legacy-list-model target pending linked Plate Plan
- verdict matrix summary: layout/link migrate and close; legacy-list-model defer-user-review
- Plite/Plate gaps or blockers: legacy-list-model public product API and ownership decision
- related scoped sweep query/active scope/matches/patched/deferred: layout/link closed; legacy-list-model 71 matches, 0 patched, all 84 rows deferred
- out-of-scope matches discovered: apps/www and markdown serializer callers depend on legacy-list-model
- changes made: layout/link runtime, tests, direct dependencies, changesets, review plans
- tests/proof commands: scoped Biome, package typecheck, package tests, package build; final combined proof green
- old compatibility names audited: layout/link clean; legacy-list-model recorded for the architecture packet
- needs attention: continue and accept `docs/plans/2026-07-12-legacy-list-model-v2-api.md`
- next best Plate Next packet: only after legacy-list-model Plate Plan is ready and accepted

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final combined proof and autoreview |
| Where am I going? | Close the parent packet with an explicit legacy-list-model architecture deferral |
| What is the goal? | Close 172 layout/link/legacy-list-model rows with package proof and autoreview |
| What have I learned? | Link edge selection belongs in transform middleware; legacy-list-model needs one package API decision |
| What have I done? | Closed 88 rows and reviewed/deferred all 84 legacy-list-model rows |

Timeline:
- 2026-07-12T01:47:54.966Z Goal plan created.
- 2026-07-12 Layout closed: 31/31 rows score 100; scoped lint, typecheck, 25 tests, and build green.
- 2026-07-12 Link closed: 57/57 rows score 100; scoped lint, typecheck, 64 tests, and build green.
- 2026-07-12 legacy-list-model reviewed: 71/84 drift files; baseline 5 pass/27 fail/26 load errors; all 84 rows deferred to Plate Plan after current-state pass.

Open risks:
- legacy-list-model target API is intentionally unresolved until the linked Plate Plan completes and receives user acceptance.
