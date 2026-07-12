# plate-next excalidraw find-replace floating package reviews

Objective:
Close excalidraw, find-replace, and floating package drift; done when all 61
current rows (60 initial tracked rows plus one regression spec) score 100 or
are explicitly deferred and package proof plus autoreview pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-12-plate-next-excalidraw-find-replace-floating-package-reviews.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user requested `plate-next next 3 packages`
- mode: sequential three-package review
- target surface: `packages/excalidraw`, then `packages/find-replace`, then
  `packages/floating`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, inside the active package
- package review mode: yes
- package review target: 20 excalidraw + 11 find-replace + 29 floating tracked
  files, plus one new floating regression spec accepted during autoreview
- package file checklist gate: exactly 60 rows materialized before source work
- completion threshold summary: close each package before starting the next;
  61/61 current rows score 100 or are explicitly deferred, package proof and
  autoreview pass, then the final plan checker passes

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
- semantics: one-shot completion
- initial confidence score: 0.45
- improvement loop: review and close `excalidraw`, then `find-replace`, then
  `floating`
- final score / loop closure: 1.00; 61/61 rows score 100, package proof passes,
  and autoreview is clean

Completion threshold:
- All 61 current package rows score 100 or carry an explicit user-review deferral.
- `excalidraw` closes before `find-replace`; `find-replace` closes before
  `floating`.
- Package behavior, public types, React lifecycle where applicable, and
  dependency ownership remain covered by focused proof.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-excalidraw-find-replace-floating-package-reviews.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package-local tests, source-first typecheck, build,
  lint, manifests, barrels when exports change, and final autoreview
- package proof: focused package tests plus package typecheck and release build
- shared Core gate: N/A unless a smallest Core/Plite owner must change; these
  are product feature/UI packages
- source audits: umbrella imports, stale Slate/Plate APIs, root editor
  pollution, casts, option portals, transaction nesting, normalization,
  dependency truth, dead exports, React effects/subscriptions, and main parity
- related scoped sweep query / active scope / match count / patched count / deferred count:
  record after each correction; active scope is the current package plus the
  smallest required owner
- package file manifest / row count / checked count / deferred count: 61 / 61 / 0
  after autoreview regression proof
- Plite/Plate gap ledger: record blockers per package; none known at checkpoint
  zero
- broad Core drift ledger gate: N/A; broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-excalidraw-find-replace-floating-package-reviews.md`

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
- allowed edit scope: the 60 initial tracked rows, one accepted floating
  regression spec, this goal plan, package changesets, lockfile changes caused
  by valid dependency corrections, generated barrels, and the smallest
  Plite/Core owner required to remove a blocker
- package/API surfaces: `packages/excalidraw`, `packages/find-replace`,
  `packages/floating`
- docs/browser surfaces: excluded; package review proof is package-local
- non-goals: docs, examples, apps, registry generation, renames, commits, PRs,
  and unrelated packages
- out-of-scope package errors: record without patching unless they prove a
  regression caused by this batch

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- For this package batch, inspect one package at a time, count broad patterns
  before printing matches, and exclude dist/generated/noisy trees.

Blocked condition:
- A public API fork, missing Plite substrate, or repeated package-proof failure
  that cannot be resolved inside the active package plus smallest-owner scope.

Current verdict:
- verdict: all three packages closed at 61/61 score-100 rows; all accepted
  autoreview findings were fixed and the final autoreview is clean
- confidence: 1.00
- next owner: plate-next
- keep / revert / quarantine call: keep all three completed hard cuts
- reason: direct-owner imports, Base plugin APIs, package behavior, dependency
  truth, tests, typechecks, builds, lints, and scoped stale-API sweeps pass

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| checkpoint-zero manifest | complete | 60 tracked, 0 untracked, 60 rows materialized before source review | excalidraw |
| excalidraw review | complete | 20/20 rows score 100; 5 tests, typecheck, build, and lint pass | find-replace |
| find-replace review | complete | 11/11 rows score 100; 7 tests, typecheck, build, and lint pass | floating |
| floating review | complete | 30/30 current rows score 100; 25 tests, typecheck, build, lint, and scoped sweep pass | combined closeout |
| combined closeout | complete | package proof, scoped audits, and final autoreview pass | goal completion |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target, boundaries, stop condition, proof, and handoff copied above |
| `plate-next` skill/rule read | yes | User-provided skill and `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | Matching durable goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Sequential three-package review; no broad Core sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plate Next source and constraints above |
| Broad Core drift ledger initialized when in scope | no | Broad Core sweep excluded |
| Source of truth and allowed workspace recorded | yes | Current checkout, origin/main evidence, named packages, smallest blocker owner |
| Output budget strategy recorded | yes | Package-at-a-time targeted reads and capped searches |
| Public API fork routing checked | yes | Any discovered fork routes to plate-plan before implementation |
| Gap policy checked | yes | Missing substrate becomes a named Plite/Plate gap |
| Related scoped sweep policy checked | yes | Every correction gets an active-package sweep |
| Review-mode rename freeze checked | yes | Current HEAD names and paths stay fixed |
| Package review checklist initialized when in scope | yes | 60 rows materialized before source review |

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
- [x] Public API forks are routed to `plate-plan` before implementation; none were found.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is N/A because no exported source path or barrel changed.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pass | Run the proof commands named in this plan | Tests, source-first typechecks, release builds, and lints pass for all three packages |
| Broad Core drift ledger coverage | N/A | Broad Core sweep excluded | Product packages only; no Core owner changed |
| Score gate | pass | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 61/61 rows score 100; 0 deferred |
| Best Plate v2 recommendation | pass | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Matrix below records three hard cuts and rejected compatibility shapes |
| Plite/Plate gap ledger | pass | Record blockers or N/A when no gap blocks the target | No substrate gap; direct Plite/Core owners cover all required behavior |
| Related scoped sweep after correction | pass | Run and record same-class search/review results inside the active scope | Scoped audit rows below; 0 forbidden matches remain |
| Package file checklist | pass | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | 61 expected, 61 actual, 61 checked, 0 deferred/missing/extra |
| Package/API proof | pass | Run focused typecheck/test/build or record N/A | 5 Excalidraw, 7 find-replace, and 25 floating tests pass; all package checks pass |
| Shared Core gate coverage | N/A | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | All three are product feature/UI packages outside `check:core` |
| Non-Core package error triage | pass | Classify failures outside scope | No package proof reported an out-of-scope product failure |
| Source audit | pass | Run exact audit for removed compatibility names or record N/A | No umbrella imports, removed Slate APIs, fake casts, suppressions, or false generic remain |
| Rename ledger | N/A | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | Rename freeze held; no rename proposed |
| Extracted-file inventory | pass | Record untracked/extracted file command, row count, and bucket for every file in scope | One new floating spec classified as `justify-new-proof-tooling` |
| Autoreview / review | pass | Run review gate for non-trivial implementation diffs or record N/A | Four accepted findings fixed across review cycles; final autoreview clean at 0.87 confidence |
| Final lint/check | pass | Run scoped lint/check or record N/A | Package lints pass; scoped `git diff --check` passes |
| Changed list / top drift / needs attention | pass | Fill handoff ledgers | Filled below; no needs-attention item |
| Goal plan complete | yes | Run final plan checker | Checker is the final command after this ledger is saved |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/excalidraw` | 100 | hard cut | Plate product package over Plite | Direct owners, Base plugin tx, one-shot React load, 5 tests and package checks pass | none |
| `packages/find-replace` | 100 | hard cut | Plate product package over Plite | Base plugin, block-safe inline text aggregation, 7 tests and package checks pass | none |
| `packages/floating` | 100 | hard cut | Plate React/DOM product package over Plite | Grouped read/DOM APIs, virtual-only reference, stable external-sync effects, 25 tests and package checks pass | none |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Excalidraw | Base plugin with typed `extendTx`; direct Core/Plite owners; React wrapper only for loading/render state | umbrella `platejs`, Slate plugin constructors, `editor.tf`, `any` option casts, compatibility wrapper | Clean product-layer composition with inferred transaction API | none |
| Find-replace | Base decorator over direct Core/Plite primitives; aggregate direct text and inline descendants per block | typed Slate plugin constructor, React runtime scaffolding, cast contexts, unrestricted descendant scans | Preserves inline matches without joining nested block boundaries | none |
| Floating | Direct Plite read/DOM APIs, minimal capability types, virtual-only hook, data selector plus effect | flat aliases, cast editors, false generic, side-effect selector, suppressed/open-loop effects | Correct owner boundaries and stable React synchronization | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | no workaround required | direct Core/Plite/Plite DOM/Plite React APIs | package proof | no gap blocks any package |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Excalidraw hard cut | `packages/excalidraw` | umbrella imports, removed Slate/plugin/transform APIs, `any`, fake casts, callback memoization | original drift matches only | all in-scope matches | 0 | none; final query has 0 forbidden matches |
| Find-replace hard cut | `packages/find-replace` | umbrella imports, removed constructors, casts, dependency truth, mixed inline and nested-block behavior review | original drift plus two review findings | all in-scope matches | 0 | none; 7 behavior rows and final query pass |
| Floating hard cut | `packages/floating` | umbrella imports, flat editor aliases, casts, suppressions, false generic, selector/effect review | original drift plus focus-transfer finding | all in-scope matches | 0 | none; 25 behavior rows and final query pass |
| Final autoreview | all three packages, changesets, lockfile, and plan | four strict scoped review cycles | 4 accepted findings total | 4 | 0 | final review reports no actionable findings |

Core drift ledger:
- Applies: no; broad Core sweep was not requested
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
- Package: `packages/excalidraw`, then `packages/find-replace`, then
  `packages/floating`
- Manifest command: `git ls-files packages/excalidraw packages/find-replace packages/floating | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 61 (60 initial tracked rows plus one accepted floating regression spec)
- Actual row count: 61
- Checked score-100 count: 61
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: every row in the current package scores 100 or
  carries an explicit user-review deferral

Package file rows:
- [x] `packages/excalidraw/.npmignore` — score: 100 — verdict: keep — owner: excalidraw review — evidence: manifest/source audit and package proof pass — next: none
- [x] `packages/excalidraw/CHANGELOG.md` — score: 100 — verdict: keep — owner: excalidraw review — evidence: historical generated release record audited — next: none
- [x] `packages/excalidraw/README.md` — score: 100 — verdict: keep — owner: excalidraw review — evidence: current package pointer remains accurate — next: none
- [x] `packages/excalidraw/package.json` — score: 100 — verdict: cut umbrella dependency — owner: excalidraw review — evidence: direct core/plite/plite-react/utils owners; install/build pass — next: none
- [x] `packages/excalidraw/src/index.ts` — score: 100 — verdict: keep — owner: excalidraw review — evidence: barrel audit and build pass — next: none
- [x] `packages/excalidraw/src/lib/BaseExcalidrawPlugin.spec.ts` — score: 100 — verdict: hard-cut test — owner: excalidraw review — evidence: Base editor test passes — next: none
- [x] `packages/excalidraw/src/lib/BaseExcalidrawPlugin.ts` — score: 100 — verdict: hard cut to Base plugin and extendTx — owner: excalidraw review — evidence: test/typecheck/build pass — next: none
- [x] `packages/excalidraw/src/lib/index.ts` — score: 100 — verdict: keep — owner: excalidraw review — evidence: barrel audit and build pass — next: none
- [x] `packages/excalidraw/src/lib/transforms/index.ts` — score: 100 — verdict: keep — owner: excalidraw review — evidence: barrel audit and build pass — next: none
- [x] `packages/excalidraw/src/lib/transforms/insertExcalidraw.spec.ts` — score: 100 — verdict: replace mock/cast test — owner: excalidraw review — evidence: real Base editor transaction tests pass — next: none
- [x] `packages/excalidraw/src/lib/transforms/insertExcalidraw.ts` — score: 100 — verdict: hard cut to transaction API — owner: excalidraw review — evidence: typed options, no casts, focused tests pass — next: none
- [x] `packages/excalidraw/src/lib/types.ts` — score: 100 — verdict: keep — owner: excalidraw review — evidence: public type audit and typecheck pass — next: none
- [x] `packages/excalidraw/src/react/ExcalidrawPlugin.tsx` — score: 100 — verdict: direct owner import — owner: excalidraw review — evidence: core/react import and build pass — next: none
- [x] `packages/excalidraw/src/react/hooks/index.ts` — score: 100 — verdict: keep — owner: excalidraw review — evidence: barrel audit and build pass — next: none
- [x] `packages/excalidraw/src/react/hooks/useExcalidrawElement.spec.tsx` — score: 100 — verdict: remove cast fixtures — owner: excalidraw review — evidence: typed deduplication test passes — next: none
- [x] `packages/excalidraw/src/react/hooks/useExcalidrawElement.ts` — score: 100 — verdict: hard cut lifecycle and update drift — owner: excalidraw review — evidence: one-shot import, typed component/data, transaction write, test/typecheck/lint pass — next: none
- [x] `packages/excalidraw/src/react/index.ts` — score: 100 — verdict: keep — owner: excalidraw review — evidence: barrel audit and build pass — next: none
- [x] `packages/excalidraw/src/react/types.ts` — score: 100 — verdict: simplify — owner: excalidraw review — evidence: public type audit and typecheck pass — next: none
- [x] `packages/excalidraw/tsconfig.build.json` — score: 100 — verdict: keep — owner: excalidraw review — evidence: release build passes — next: none
- [x] `packages/excalidraw/tsconfig.json` — score: 100 — verdict: keep — owner: excalidraw review — evidence: source-first typecheck passes — next: none
- [x] `packages/find-replace/.npmignore` — score: 100 — verdict: keep — owner: find-replace review — evidence: manifest/source audit and package proof pass — next: none
- [x] `packages/find-replace/CHANGELOG.md` — score: 100 — verdict: keep — owner: find-replace review — evidence: historical generated release record audited — next: none
- [x] `packages/find-replace/README.md` — score: 100 — verdict: keep — owner: find-replace review — evidence: current package pointer remains accurate — next: none
- [x] `packages/find-replace/package.json` — score: 100 — verdict: cut umbrella and unused React dependencies — owner: find-replace review — evidence: direct core/plite/utils owners; install/build pass — next: none
- [x] `packages/find-replace/src/index.ts` — score: 100 — verdict: keep — owner: find-replace review — evidence: barrel audit and build pass — next: none
- [x] `packages/find-replace/src/lib/FindReplacePlugin.ts` — score: 100 — verdict: hard cut to Base plugin — owner: find-replace review — evidence: test/typecheck/build pass — next: none
- [x] `packages/find-replace/src/lib/decorateFindReplace.spec.ts` — score: 100 — verdict: replace cast context with real plugin context — owner: find-replace review — evidence: 5 tests pass — next: none
- [x] `packages/find-replace/src/lib/decorateFindReplace.ts` — score: 100 — verdict: direct core/plite owners — owner: find-replace review — evidence: consecutive-text behavior, types, and lint pass — next: none
- [x] `packages/find-replace/src/lib/index.ts` — score: 100 — verdict: keep — owner: find-replace review — evidence: barrel audit and build pass — next: none
- [x] `packages/find-replace/tsconfig.build.json` — score: 100 — verdict: keep — owner: find-replace review — evidence: release build passes — next: none
- [x] `packages/find-replace/tsconfig.json` — score: 100 — verdict: keep — owner: find-replace review — evidence: source-first typecheck passes — next: none
- [x] `packages/floating/.npmignore` — score: 100 — verdict: keep — owner: floating review — evidence: manifest/source audit and package proof pass — next: none
- [x] `packages/floating/CHANGELOG.md` — score: 100 — verdict: keep — owner: floating review — evidence: historical generated release record audited — next: none
- [x] `packages/floating/README.md` — score: 100 — verdict: keep — owner: floating review — evidence: package description remains accurate — next: none
- [x] `packages/floating/package.json` — score: 100 — verdict: cut umbrella dependency — owner: floating review — evidence: direct core/plite DOM/React and utility owners; install/build pass — next: none
- [x] `packages/floating/src/createVirtualElement.spec.ts` — score: 100 — verdict: keep — owner: floating review — evidence: focused tests pass — next: none
- [x] `packages/floating/src/createVirtualElement.ts` — score: 100 — verdict: keep — owner: floating review — evidence: source audit, tests, and typecheck pass — next: none
- [x] `packages/floating/src/hooks/index.ts` — score: 100 — verdict: keep — owner: floating review — evidence: barrel audit and build pass — next: none
- [x] `packages/floating/src/hooks/useFloatingToolbar.spec.tsx` — score: 100 — verdict: add focused regression proof — owner: floating review — evidence: focus-transfer close behavior passes — next: none
- [x] `packages/floating/src/hooks/useFloatingToolbar.ts` — score: 100 — verdict: hard cut subscription/effect drift — owner: floating review — evidence: direct owner hooks, pure version selector, no suppressed dependencies or open loop — next: none
- [x] `packages/floating/src/hooks/useVirtualFloating.ts` — score: 100 — verdict: hard cut false generic and derived state — owner: floating review — evidence: virtual-only type, one layout sync, typecheck/build/lint pass — next: none
- [x] `packages/floating/src/index.ts` — score: 100 — verdict: keep — owner: floating review — evidence: barrel audit and build pass — next: none
- [x] `packages/floating/src/libs/floating-ui.ts` — score: 100 — verdict: keep — owner: floating review — evidence: upstream re-export audit and build pass — next: none
- [x] `packages/floating/src/libs/index.ts` — score: 100 — verdict: keep — owner: floating review — evidence: barrel audit and build pass — next: none
- [x] `packages/floating/src/utils/createVirtualRef.spec.ts` — score: 100 — verdict: replace cast editors — owner: floating review — evidence: typed capability fixtures pass — next: none
- [x] `packages/floating/src/utils/createVirtualRef.ts` — score: 100 — verdict: narrow editor capability — owner: floating review — evidence: source audit and focused tests pass — next: none
- [x] `packages/floating/src/utils/getBoundingClientRect.spec.ts` — score: 100 — verdict: replace cast editors — owner: floating review — evidence: selection and multi-range tests pass — next: none
- [x] `packages/floating/src/utils/getBoundingClientRect.ts` — score: 100 — verdict: hard cut to read/DOM groups — owner: floating review — evidence: no legacy aliases/casts; focused tests and types pass — next: none
- [x] `packages/floating/src/utils/getDOMSelectionBoundingClientRect.spec.ts` — score: 100 — verdict: use real DOM selection — owner: floating review — evidence: 3 tests pass without casts — next: none
- [x] `packages/floating/src/utils/getDOMSelectionBoundingClientRect.ts` — score: 100 — verdict: keep — owner: floating review — evidence: DOM fallback behavior tests pass — next: none
- [x] `packages/floating/src/utils/getRangeBoundingClientRect.spec.ts` — score: 100 — verdict: typed DOM capability fixtures — owner: floating review — evidence: 3 tests pass — next: none
- [x] `packages/floating/src/utils/getRangeBoundingClientRect.ts` — score: 100 — verdict: hard cut flat DOM alias — owner: floating review — evidence: grouped DOM API and fallback tests pass — next: none
- [x] `packages/floating/src/utils/getSelectionBoundingClientRect.spec.ts` — score: 100 — verdict: replace cast editors — owner: floating review — evidence: collapsed/expanded tests pass — next: none
- [x] `packages/floating/src/utils/getSelectionBoundingClientRect.ts` — score: 100 — verdict: hard cut direct selection read — owner: floating review — evidence: Plite range API and focused tests pass — next: none
- [x] `packages/floating/src/utils/index.ts` — score: 100 — verdict: keep — owner: floating review — evidence: barrel audit and build pass — next: none
- [x] `packages/floating/src/utils/makeClientRect.spec.ts` — score: 100 — verdict: keep — owner: floating review — evidence: focused test passes — next: none
- [x] `packages/floating/src/utils/makeClientRect.ts` — score: 100 — verdict: keep — owner: floating review — evidence: geometry audit and tests pass — next: none
- [x] `packages/floating/src/utils/mergeClientRects.spec.ts` — score: 100 — verdict: keep — owner: floating review — evidence: 7 geometry cases pass — next: none
- [x] `packages/floating/src/utils/mergeClientRects.ts` — score: 100 — verdict: keep — owner: floating review — evidence: geometry audit and tests pass — next: none
- [x] `packages/floating/tsconfig.build.json` — score: 100 — verdict: keep — owner: floating review — evidence: release build passes — next: none
- [x] `packages/floating/tsconfig.json` — score: 100 — verdict: keep — owner: floating review — evidence: source-first typecheck passes — next: none

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| excalidraw | plate-next | umbrella imports, removed Slate APIs, casted insertion options, repeated dynamic import | 20 tracked rows; package test/typecheck/build/lint; scoped stale API sweep | hard cut to direct owners, Base plugin transaction API, and one-shot React load | closed; find-replace |
| find-replace | plate-next | umbrella imports, removed typed Slate plugin constructor, cast decorator contexts, false React runtime requirements | 11 tracked rows; package test/typecheck/build/lint; scoped stale API sweep | hard cut to Base plugin and direct core/plite/utils owners | closed; floating |
| floating | plate-next | umbrella imports, flat editor aliases, cast editors, false generic, effect suppression, side-effecting selector, open-loop dependency | 29 initial tracked rows + 1 regression spec; 25 tests; package typecheck/build/lint; scoped stale API/effect sweep | hard cut to direct owners, minimal geometry capabilities, virtual-only hook, and external-sync effects | closed; combined closeout |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/excalidraw` | none | 0 untracked files | N/A | `git ls-files --others --exclude-standard packages/excalidraw` |
| `packages/find-replace` | none | 0 untracked files | N/A | `git ls-files --others --exclude-standard packages/find-replace` |
| `packages/floating` | none at checkpoint zero | 0 initial untracked files | N/A | `git ls-files --others --exclude-standard packages/floating` |
| `packages/floating/src/hooks/useFloatingToolbar.spec.tsx` | justify-new-proof-tooling | absent from origin/main; added after accepted review finding | keep focused focus-transfer regression proof | 25 floating tests pass |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no package proof failures outside the named scope | nothing to triage | none |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| N/A | no broader search was needed after scoped closure | package mode intentionally stopped at named owners | next freshness-selected package |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Excalidraw and find-replace Base APIs; floating read/DOM geometry and React hook cleanup |
| tests/proof | Excalidraw real-editor tests; find-replace mixed-inline contexts; floating typed DOM fixtures and focus-transfer hook proof |
| docs/templates/skills | Three package changesets; this durable plan |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | none | all scoped decisions and proof gates close without user input | package ledgers above | continue with the next freshness-selected package batch |

Findings:
- `excalidraw` baseline tests failed because the package imported removed
  `createSlatePlugin`; this was real runtime drift.
- The insertion helper still exposed `SlateEditor`, umbrella `platejs`, legacy
  transform options, and an `options as any` escape.
- The React hook imported Excalidraw after every render, retained a dead API
  ref, used umbrella hooks, and wrote through the removed `editor.tf` surface.
- `find-replace` baseline tests failed before collection because
  `createTSlatePlugin` no longer exists.
- `find-replace` is a non-React package; its React peers and compiler runtime
  were stale package scaffolding rather than runtime dependencies.
- `floating` reintroduced `open` into the effect dependency list despite its
  own changelog recording that dependency as the infinite-render cause.
- `floating` used a side-effect-only selector to reposition, a suppressed DOM
  listener effect, derived `visible` state, a casted arbitrary reference
  generic, and flat legacy DOM/editor reads.
- Autoreview confirmed find-replace skipped plain text around inline elements;
  block-level descendant text traversal now preserves paths without duplicate
  inline decoration passes.
- Autoreview confirmed an already-open floating toolbar could survive focus
  transfer; the close predicate now owns focused-editor identity explicitly.
- Autoreview confirmed explicit Excalidraw insertion targets were incorrectly
  blocked by a missing selection; explicit `options.at` now bypasses selection
  derivation.
- Autoreview confirmed unrestricted find-replace descendant traversal could
  cross nested block boundaries; each block now owns direct text plus inline
  descendant text only.

Decisions and tradeoffs:
- Hard-cut `excalidraw` to `createBasePlugin().extendTx` and
  `editor.update.excalidraw.insert`; do not retain a compatibility wrapper.
- Keep `useMemo` only for Excalidraw's mutable `initialData` external-library
  boundary; remove callback memoization and the unused imperative API ref.
- No Plite/Core gap exists; direct owners cover the package cleanly.
- Hard-cut `FindReplacePlugin` to `createBasePlugin` and construct real typed
  decorator contexts in tests; do not preserve the old Slate constructor.
- Remove find-replace's React requirements entirely; decoration is a Base
  editor concern.
- Hard-cut floating geometry to minimal read/DOM capability contracts and the
  grouped `api.dom.resolveDOMRange` owner.
- Restrict `useVirtualFloating` to the virtual reference it actually creates;
  remove the false generic rather than preserve it with a cast.
- Keep effects only for browser/Floating UI synchronization, derive visibility
  during render, and subscribe to editor versions as data before updating.
- Accept all grounded autoreview findings as in-scope behavior bugs and add
  regression proof rather than merely changing review-facing code.
- Honor explicit Excalidraw targets without consulting selection; selection is
  required only to derive the default next-block location.
- Let nested blocks decorate themselves; a parent block aggregates only direct
  text children and descendants of direct inline element children.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Baseline Excalidraw test: removed `createSlatePlugin` export | 1 | replace legacy plugin owner instead of reinstalling | fixed; 5 tests pass |
| Excalidraw typecheck: `useReadOnly` is not a Core React export | 1 | use Plite React's canonical `useEditorReadOnly` | fixed; typecheck passes |
| Excalidraw lint formatting | 1 | run package lint fixer | fixed; lint passes |
| Baseline find-replace test: removed `createTSlatePlugin` export | 1 | replace legacy plugin owner and cast contexts | fixed; 7 tests pass |
| Floating tests after real-editor rewrite: frozen Core API could not be reassigned | 2 | expose minimal typed read/DOM capability contracts | fixed; 25 tests pass without casts |
| Autoreview found mixed-inline search and focus-transfer toolbar regressions | 1 review cycle | patch both in scope and add behavior tests | fixed; 7 find-replace and 25 floating tests pass |
| Autoreview found explicit-target insertion still required selection | 1 review cycle | separate explicit location from default selection-derived location | fixed; 5 Excalidraw tests pass |
| Autoreview found descendant search crossed nested block boundaries | 1 review cycle | aggregate only direct text and direct-inline descendants | fixed; nested-block regression passes |
| Final autoreview | 1 review cycle | no action required | clean; 0 actionable findings, 0.87 confidence |

Verification evidence:
- `pnpm install` — pass; lockfile records corrected direct dependency owners.
- `pnpm --filter @platejs/excalidraw test` — 5 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/excalidraw` — 11 tasks pass.
- `pnpm --filter @platejs/excalidraw build` — pass.
- `pnpm --filter @platejs/excalidraw lint` — pass.
- Scoped stale-API/cast sweep — no umbrella imports, removed Slate APIs,
  `any`, fake casts, or callback memoization remain.
- `pnpm --filter @platejs/find-replace test` — 7 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/find-replace` — 11 tasks pass.
- `pnpm --filter @platejs/find-replace build` — pass.
- `pnpm --filter @platejs/find-replace lint` — pass.
- Find-replace scoped stale-API/dependency sweep — no matches.
- `pnpm --filter @platejs/floating test` — 25 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/floating` — 10 tasks pass.
- `pnpm --filter @platejs/floating build` — pass.
- `pnpm --filter @platejs/floating lint` — pass.
- Floating scoped legacy API/cast/effect/generic sweep — no matches.
- Current manifest — 61 rows: 60 tracked rows plus the one classified floating
  regression spec; 61 score 100, 0 deferred, 0 missing, 0 extra.
- Scoped `git diff --check` — pass. A repo-wide check reports three unrelated
  pre-existing trailing-whitespace rows under `content/docs`; they are outside
  the named package scope and untouched by this packet.
- Final `autoreview --mode local` — clean, 0 accepted/actionable findings;
  overall confidence 0.87.

Final handoff contract:
- target surface and mode: sequential package review of Excalidraw, then
  find-replace, then floating
- files/APIs reviewed: 60 initial tracked files plus one accepted floating
  regression spec; all runtime, type, dependency, test, and config surfaces
- broad Core drift score coverage: N/A; product packages only, no Core changes
- package file checklist coverage: 61/61 score 100; 0 deferred/missing/extra
- best Plate v2 recommendation: keep all three hard cuts to direct
  Core/Plite owners and reject compatibility wrappers
- verdict matrix summary: Excalidraw 100, find-replace 100, floating 100
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: package-local
  legacy API, cast, dependency, lifecycle, and behavior sweeps; every in-scope
  match patched, 0 deferred, 0 forbidden matches remain
- out-of-scope matches discovered: none retained; unrelated docs whitespace is
  reported only by the repo-wide diff check
- changes made: direct dependencies/APIs, corrected behavior, typed tests,
  three major changesets, lockfile, and this closure plan
- tests/proof commands: 5 + 7 + 25 tests; three source-first typechecks,
  release builds, lints, scoped audits, diff check, and final autoreview pass
- old compatibility names audited: yes; no umbrella imports, removed Slate
  constructors, `editor.tf`, fake casts, suppressions, or false generic remain
- needs attention: none
- next best Plate Next packet: next freshness-selected package after floating;
  not started in this batch

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | All 61 current rows and review gates are closed |
| Where am I going? | Drift-scored Plate Next closure |
| What is the goal? | Close all current excalidraw/find-replace/floating rows with package proof and autoreview |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-12T00:02:59.802Z Goal plan created.
- 2026-07-12 Excalidraw closed at 20/20 score-100 rows with 5 tests and package checks.
- 2026-07-12 Find-replace closed at 11/11 score-100 rows with 7 tests and package checks.
- 2026-07-12 Floating closed at 30/30 score-100 rows with 25 tests and package checks.
- 2026-07-12 Four accepted autoreview findings were fixed; final autoreview is clean.

Open risks:
- none inside the named package scope
