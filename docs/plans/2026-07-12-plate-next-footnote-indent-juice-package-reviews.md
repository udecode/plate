# plate-next footnote indent juice package reviews

Objective:
Close footnote, indent, and juice package drift; done when all 65 reviewed rows
score 100 or are explicitly deferred and package proof plus autoreview pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-12-plate-next-footnote-indent-juice-package-reviews.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user invoked `plate-next next 3 packages`
- mode: sequential three-package review
- target surface: `packages/footnote`, then `packages/indent`, then
  `packages/juice`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, inside the active package
- package review mode: yes
- package review target: 33 footnote + 22 indent + 10 juice reviewed files
- package file checklist gate: 57 current rows materialized before source work;
  seven origin/main indent owners added before recovery implementation
- completion threshold summary: close each package before starting the next;
  65/65 rows score 100 or are explicitly deferred, package proof and
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
- semantics: one-shot completion of exactly three packages
- initial confidence score: 0.40
- improvement loop: review and close `footnote`, then `indent`, then `juice`
- final score / loop closure: complete at 65/65 rows with all proof gates closed

Completion threshold:
- All 65 reviewed package rows score 100 or carry an explicit user-review
  deferral.
- `footnote` closes before `indent`; `indent` closes before `juice`.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-footnote-indent-juice-package-reviews.md`
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
- package file manifest / row count / checked count / deferred count: 65 / 65 / 0
  after indent owner recovery and the internal Footnote navigation owner
- Plite/Plate gap ledger: record blockers per package; none known at checkpoint
  zero
- broad Core drift ledger gate: N/A; broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-footnote-indent-juice-package-reviews.md`

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
- allowed edit scope: the 57 initial manifest rows, seven recovered origin/main
  indent owners, one internal Footnote navigation owner, this goal plan, package changesets,
  lockfile changes caused by valid dependency corrections, generated barrels,
  and the smallest Plite/Core owner required to remove a blocker
- package/API surfaces: `packages/footnote`, `packages/indent`, `packages/juice`
- docs/browser surfaces: package-local README parity is allowed when a reviewed
  public API changes; apps/content docs and browser proof remain excluded
- non-goals: app/content docs, examples, apps, registry generation, renames,
  commits, PRs, and unrelated packages
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
- verdict: footnote, indent, and juice closed at 65/65 score-100 rows; combined closeout gates pass
- confidence: 0.98
- next owner: plate-next
- keep / revert / quarantine call: keep all three packets; Juice is a Base-only plugin with dependency truth and no React runtime
- reason: all three packages pass behavior/release proof with no stale API matches

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| checkpoint-zero manifest | complete | 57 current files and rows materialized before source review | footnote |
| footnote review | complete | 33/33 rows score 100; 26 tests, typecheck, build, lint, barrel, and source audit pass | indent |
| indent review | complete | 22/22 rows score 100; seven main owners recovered; 12 tests, typecheck, build, lint, barrel, and source audit pass | juice |
| juice review | complete | 10/10 rows score 100; 2 tests, typecheck, build, lint, dependency audit, and source audit pass | combined closeout |
| combined closeout | complete | review findings accepted/fixed; final review and checker pass | next batch |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact three-package target, ordering, proof, non-goals, stop condition, and handoff are recorded |
| `plate-next` skill/rule read | yes | User-supplied skill plus local `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | Matching durable goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Sequential package review; broad Core excluded |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plate Next source and constraints above |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | Current checkout, origin/main evidence, named packages, smallest blocker owner |
| Output budget strategy recorded | yes | Package-at-a-time targeted reads and capped searches |
| Public API fork routing checked | yes | Any discovered fork routes to plate-plan before implementation |
| Gap policy checked | yes | Missing substrate becomes a named Plite/Plate gap |
| Related scoped sweep policy checked | yes | Every correction gets an active-package sweep |
| Review-mode rename freeze checked | yes | Current HEAD names and paths stay fixed |
| Package review checklist initialized when in scope | yes | 57 current rows materialized before source review; 7 deleted origin/main owners added when indent recovery established the correct manifest |

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
- [x] Public API forks are routed to `plate-plan` before implementation; none discovered.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change; only indent changed barrels.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pass | Run the proof commands named in this plan | 40 tests, 35 typecheck graph tasks, three builds, three lints pass |
| Broad Core drift ledger coverage | N/A | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | broad Core excluded |
| Score gate | pass | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 65/65 rows score 100; 0 unchecked/deferred |
| Best Plate v2 recommendation | pass | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | three package recommendations recorded |
| Plite/Plate gap ledger | pass | Record blockers or N/A when no gap blocks the target | no blocking gap in any package |
| Related scoped sweep after correction | pass | For each correction, run and record same-class search/review results inside the active scope | three scoped rows; 0 forbidden matches remain |
| Package file checklist | pass | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | manifest 65; checked 65; unchecked/deferred/missing/extra 0 |
| Package/API proof | pass | Run focused typecheck/test/build or record N/A | all focused package proof passes |
| Shared Core gate coverage | N/A | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | product feature/parser packages outside check:core |
| Non-Core package error triage | pass | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | no out-of-scope proof failure |
| Source audit | pass | Run exact audit for removed compatibility names or record N/A | 0 umbrella/Slate/cast/flat-API matches remain |
| Rename ledger | N/A | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | no rename; seven deleted main owners restored at existing paths |
| Extracted-file inventory | pass | Record untracked/extracted file command, row count, and bucket for every file in scope | seven indent files classified recover-main-owner; no unexplained file |
| Autoreview / review | pass | Run review gate for non-trivial implementation diffs or record N/A | three runtime findings accepted and fixed; final structured rerun clean |
| Final lint/check | pass | Run scoped lint/check or record N/A | package lints and scoped diff/source checks pass |
| Changed list / top drift / needs attention | pass | Fill handoff ledgers | populated; no deferred attention row |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-footnote-indent-juice-package-reviews.md` | final checker pass |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/footnote` | 100 | hard-cut | Plate feature package over Plite | Direct owners, preserved helper ownership, 26 tests and package checks pass | none |
| `packages/indent` | 100 | recover-main-owner | Plate feature package over Plite | Seven established owners restored with active tx helpers; 12 tests and package checks pass | none |
| `packages/juice` | 100 | hard-cut | Plate Base parser plugin | Base constructor and direct dependency truth; 2 tests and package checks pass | none |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Footnote | Base plugins with `editor.api.footnote` reads, active transaction command groups, canonical navigation feedback, and preserved helper owners | umbrella imports, Slate constructors, `editor.tf`, casts, helper wrappers, displaced registry logic | Clean feature ownership over Plite transactions without compatibility sludge | none |
| Indent | Base plugin delegates to recovered `setIndent` / `indent` / `outdent` and `withIndent` owners; commands live on `editor.update.indent` | plugin-file algorithm dump, deleted helpers, Slate override wrapper, casts, callback-only hook subscriptions | Keeps public concepts and navigation readable while using Plite transactions directly | none |
| Juice | Base plugin injects the HTML parser transform and depends only on Core, Utils, and `juice` | umbrella `platejs`, Slate constructor, React/compiler peers for a non-React package, cast-based tests | Minimal parser ownership with accurate runtime dependencies and no compatibility layer | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Footnote | none | no workaround required | direct Core/Plite/combobox/navigation APIs | package proof | no blocking gap |
| Indent | none | no workaround required | direct Core/Plite injection, tx, normalizer, and shortcut APIs | package proof | no blocking gap |
| Juice | none | no workaround required | direct Core Base plugin API and Utils key registry | package proof | no blocking gap |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Indent owner recovery | `packages/indent` plus origin/main owner map | deleted owner paths, plugin-file algorithm concentration, old APIs/casts, tx nesting, normalization inventory | 7 deleted owners plus original migrated rows | all 22 reviewed rows | 0 | none; 0 forbidden matches remain and test-only normalization is classified |
| Juice hard cut | `packages/juice` | umbrella imports, removed constructor/editor, casts, dependency truth, unnecessary React peers | 3 source/test drift matches plus stale package dependencies | all 10 reviewed rows | 0 | none; 0 forbidden matches remain |

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
- Package: `packages/footnote`, then `packages/indent`, then `packages/juice`
- Manifest command: `(git ls-files packages/<package>; git ls-files --others --exclude-standard packages/<package>) | sort -u`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 65
- Actual row count: 65
- Checked score-100 count: 65
- Unchecked/deferred count: 0 / 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: every row in the current package scores 100 or
  carries an explicit user-review deferral

Package file rows:
- [x] `packages/footnote/src/internal/navigateToFootnote.ts` — score: 100 — verdict: internal-capability-owner — owner: footnote review — evidence: root surface has no React import; Plate feedback and Base fallback behavior pass 26 tests, typecheck, build, lint, and barrel proof — next: none
- [x] `packages/footnote/CHANGELOG.md` — score: 100 — verdict: keep — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/README.md` — score: 100 — verdict: current-api-reference — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/package.json` — score: 100 — verdict: hard-cut umbrella dependency — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/index.ts` — score: 100 — verdict: keep — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/BaseFootnoteDefinitionPlugin.ts` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/BaseFootnoteInputPlugin.ts` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/BaseFootnotePlugins.spec.ts` — score: 100 — verdict: current behavior proof — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/BaseFootnoteReferencePlugin.ts` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/FootnoteRuntimePlugin.spec.ts` — score: 100 — verdict: current behavior proof — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/index.ts` — score: 100 — verdict: keep — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/queries/footnoteRegistry.spec.ts` — score: 100 — verdict: current behavior proof — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/queries/getFootnoteDefinition.ts` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/queries/getFootnoteDefinitionText.ts` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/queries/getFootnoteReferences.ts` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/queries/getNextFootnoteIdentifier.ts` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/queries/index.ts` — score: 100 — verdict: keep — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/registry.ts` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/transforms/createFootnoteDefinition.spec.ts` — score: 100 — verdict: current behavior proof — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/transforms/createFootnoteDefinition.ts` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/transforms/focusFootnoteDefinition.ts` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/transforms/focusFootnoteReference.ts` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/transforms/index.ts` — score: 100 — verdict: keep — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/transforms/insertFootnote.spec.ts` — score: 100 — verdict: current behavior proof — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/transforms/insertFootnote.ts` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/transforms/normalizeDuplicateFootnoteDefinition.ts` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/lib/types.ts` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/react/FootnoteDefinitionPlugin.tsx` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/react/FootnoteInputPlugin.tsx` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/react/FootnoteReferencePlugin.tsx` — score: 100 — verdict: main-parity-cleanup — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/src/react/index.ts` — score: 100 — verdict: keep — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/tsconfig.build.json` — score: 100 — verdict: keep — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/footnote/tsconfig.json` — score: 100 — verdict: keep — owner: footnote review — evidence: source audit plus 24 tests, typecheck, build, and lint pass — next: none
- [x] `packages/indent/src/lib/transforms/indent.ts` — score: 100 — verdict: recover-main-owner — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/lib/transforms/index.ts` — score: 100 — verdict: recover-main-owner — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/lib/transforms/outdent.ts` — score: 100 — verdict: recover-main-owner — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/lib/transforms/setIndent.spec.ts` — score: 100 — verdict: current behavior proof — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/lib/transforms/setIndent.ts` — score: 100 — verdict: recover-main-owner — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/lib/withIndent.spec.tsx` — score: 100 — verdict: current behavior proof — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/lib/withIndent.ts` — score: 100 — verdict: recover-main-owner — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/CHANGELOG.md` — score: 100 — verdict: keep — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/README.md` — score: 100 — verdict: keep — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/package.json` — score: 100 — verdict: dependency-truth — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/index.ts` — score: 100 — verdict: keep — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/lib/BaseIndentPlugin.spec.ts` — score: 100 — verdict: current behavior proof — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/lib/BaseIndentPlugin.ts` — score: 100 — verdict: main-parity-cleanup — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/lib/IndentRuntimePlugin.spec.ts` — score: 100 — verdict: current behavior proof — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/lib/index.ts` — score: 100 — verdict: keep — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/react/IndentPlugin.tsx` — score: 100 — verdict: main-parity-cleanup — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/react/hooks/index.ts` — score: 100 — verdict: direct tx command — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/react/hooks/useIndentButton.ts` — score: 100 — verdict: direct tx command — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/react/hooks/useOutdentButton.ts` — score: 100 — verdict: direct tx command — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/src/react/index.ts` — score: 100 — verdict: keep — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/tsconfig.build.json` — score: 100 — verdict: keep — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/indent/tsconfig.json` — score: 100 — verdict: keep — owner: indent review — evidence: source audit plus 12 tests, typecheck, build, lint, and barrel proof pass — next: none
- [x] `packages/juice/.npmignore` — score: 100 — verdict: keep — owner: juice review — evidence: source/dependency audit plus 2 tests, typecheck, build, and lint pass — next: none
- [x] `packages/juice/CHANGELOG.md` — score: 100 — verdict: keep — owner: juice review — evidence: source/dependency audit plus 2 tests, typecheck, build, and lint pass — next: none
- [x] `packages/juice/README.md` — score: 100 — verdict: current-reference — owner: juice review — evidence: source/dependency audit plus 2 tests, typecheck, build, and lint pass — next: none
- [x] `packages/juice/package.json` — score: 100 — verdict: dependency-truth — owner: juice review — evidence: removed umbrella and unnecessary React/compiler peers; install and package proof pass — next: none
- [x] `packages/juice/src/index.ts` — score: 100 — verdict: keep — owner: juice review — evidence: source/dependency audit plus 2 tests, typecheck, build, and lint pass — next: none
- [x] `packages/juice/src/lib/JuicePlugin.spec.ts` — score: 100 — verdict: current behavior proof — owner: juice review — evidence: Base editor/plugin context with no casts; 2 tests pass — next: none
- [x] `packages/juice/src/lib/JuicePlugin.ts` — score: 100 — verdict: hard-cut — owner: juice review — evidence: Base plugin plus direct Core/Utils imports; source audit and package proof pass — next: none
- [x] `packages/juice/src/lib/index.ts` — score: 100 — verdict: keep — owner: juice review — evidence: source/dependency audit plus 2 tests, typecheck, build, and lint pass — next: none
- [x] `packages/juice/tsconfig.build.json` — score: 100 — verdict: keep — owner: juice review — evidence: source/dependency audit plus 2 tests, typecheck, build, and lint pass — next: none
- [x] `packages/juice/tsconfig.json` — score: 100 — verdict: keep — owner: juice review — evidence: source/dependency audit plus 2 tests, typecheck, build, and lint pass — next: none

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| footnote | plate-next | removed Slate constructors, umbrella imports, cast tests, legacy transforms, and stale registry APIs | 33 rows; 26 tests; typecheck/build/lint/brl; scoped audit | hard cut to Base plugin, direct owners, editor API, and active tx groups | closed; indent |
| indent | plate-next | real helper/normalizer/tab owners deleted and behavior concentrated in plugin | 22 rows; 12 tests; typecheck/build/lint/brl; scoped audit | recover seven main owners with active tx helpers and keep plugin as delegator | closed; juice |
| juice | plate-next | removed Slate constructor/editor, umbrella dependency, cast tests, and non-owner React peers | 10 rows; 2 tests; typecheck/build/lint; scoped audit | hard cut to Base plugin and direct dependency truth | closed; combined closeout |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/footnote` | none | 0 untracked files | N/A | `git ls-files --others --exclude-standard packages/footnote` |
| `packages/indent` | none at checkpoint zero | 0 untracked files | N/A | checkpoint-zero manifest |
| `packages/indent/src/lib/transforms/indent.ts` | recover-main-owner | exists in origin/main with real transform/normalizer/tab behavior | restore current name and migrate body | focused indent tests plus package proof |
| `packages/indent/src/lib/transforms/index.ts` | recover-main-owner | exists in origin/main with real transform/normalizer/tab behavior | restore current name and migrate body | focused indent tests plus package proof |
| `packages/indent/src/lib/transforms/outdent.ts` | recover-main-owner | exists in origin/main with real transform/normalizer/tab behavior | restore current name and migrate body | focused indent tests plus package proof |
| `packages/indent/src/lib/transforms/setIndent.spec.ts` | recover-main-owner | exists in origin/main with real transform/normalizer/tab behavior | restore current name and migrate body | focused indent tests plus package proof |
| `packages/indent/src/lib/transforms/setIndent.ts` | recover-main-owner | exists in origin/main with real transform/normalizer/tab behavior | restore current name and migrate body | focused indent tests plus package proof |
| `packages/indent/src/lib/withIndent.spec.tsx` | recover-main-owner | exists in origin/main with real transform/normalizer/tab behavior | restore current name and migrate body | focused indent tests plus package proof |
| `packages/indent/src/lib/withIndent.ts` | recover-main-owner | exists in origin/main with real transform/normalizer/tab behavior | restore current name and migrate body | focused indent tests plus package proof |
| `packages/juice` | none at checkpoint zero | 0 untracked files | N/A | checkpoint-zero manifest |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | no out-of-scope proof failures | all package commands passed | none |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| none | none recorded | scoped searches stayed inside the three packages | next Plate Next selection owns broader review |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Footnote Base/direct tx migration; Indent owner recovery and active tx helpers; Juice Base-only parser and direct dependency truth |
| tests/proof | Footnote, Indent, and Juice specs migrated/expanded; 40 tests pass across the three packages |
| docs/templates/skills | package READMEs kept current; three major changesets; durable review plan updated |
| reverted/quarantined packets | none; all three cleanup packets kept with proof |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | no deferred row or blocker | all 65 rows score 100 | this plan | continue with the next Plate Next package batch |

Findings:
- Footnote production could not load because it imported removed
  `createSlatePlugin` / `createTSlatePlugin` constructors from the umbrella.
- The registry and helpers preserved real feature ownership but still used
  flat `editor.api` / `editor.tf` surfaces, `SlateEditor`, and broad casts.
- Inline-reference insertion needs one explicit dirty-path normalization before
  selecting the normalized trailing text; normal commit-time normalization
  runs too late and transforms the provisional selection to an invalid path.
- Indent’s green five-test state hid seven deleted origin/main owners; its
  transform, normalizer, and tab algorithms had been concentrated in
  `BaseIndentPlugin` against the package owner law.
- The recovered `setIndent` query must retain an element guard: generic query
  typing does not make text nodes blocks at runtime.
- Juice carried an umbrella dependency, removed Slate constructor/editor use,
  cast-based tests, and React/compiler peers despite exposing no React surface.
- Review found that registry invalidation must inspect inserted/removed
  subtrees, explicit `at` insertion must not require a selection, and Base
  navigation must tolerate the absent React decoration API.
- Final boundary review found the Base/root Footnote graph still imported the
  Core React barrel through navigation feedback.

Decisions and tradeoffs:
- Preserve every established footnote query/transform owner and migrate its
  implementation; reject a plugin-file helper dump.
- Keep `editor.api.footnote` as the feature read owner and move commands to
  `editor.update.footnote` / `editor.update.insert.footnote`.
- Classify `tx.normalize({ force: false })` in `insertFootnote` as
  `semantic-dirty-path`: the focused caret regression proves the inline-void
  trailing-text target must exist before selection is written.
- Recover indent’s transform and `withIndent` owners under their established
  paths, require the active tx in mutation helpers, and keep the plugin as the
  typed command delegator.
- Keep indent’s two `editor.update.normalize({ force: true })` calls only as
  `explicit-normalizer-test` triggers for intentionally invalid fixtures.
- Keep Juice as a Base parser injection, use direct Core/Utils dependencies,
  and remove React runtime requirements rather than preserving peer sludge.
- Accept all three review findings as same-owner Footnote blockers; fix them
  with subtree invalidation, selection-independent explicit insertion, and a
  headless Base-editor navigation test rather than compatibility wrappers.
- Keep navigation feedback when the active transaction exposes that capability;
  otherwise use the Base DOM/selection fallback from an unexported internal
  owner, leaving the root production graph React-free.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Generated manifest patch omitted diff prefixes after its first row | 1 | regenerate every added row with an explicit patch prefix | fixed; 57 rows materialized |
| Footnote typecheck could not resolve newly declared direct dependencies | 1 | run required `pnpm install` before deeper type debugging | fixed; workspace links and lockfile updated |
| Inline caret stayed at the source selection or shifted to invalid `[0, 3]` | 3 | run a semantic dirty-path normalization before selecting normalized trailing text | fixed; both inline-caret regressions pass |
| Recovered `setIndent` initially applied indent props to text leaves | 1 | restore the source-owned `ElementApi.isElement` runtime guard | fixed; 12 indent tests pass |
| Juice baseline tests imported removed `createSlatePlugin` / `createSlateEditor` | 1 | migrate the plugin and test context to direct Base APIs | fixed; 2 Juice tests pass |
| Combined manifest shell arithmetic used command output as an expression | 1 | use ordinary command substitution before reporting the count | fixed; final manifest count 65 |
| Explicit-target regression expected no leading inline-void spacer | 1 | align the assertion with Plite inline-void normalization | fixed; 26 Footnote tests pass |
| Autoreview cycle 1 found nested registry invalidation and explicit-target insertion bugs | 1 | verify code paths, patch both, add regressions | fixed; focused proof pass |
| Autoreview cycle 2 found Base navigation calling a React-only API | 1 | keep the Base command and make decoration refresh optional; run runtime tests on `createBaseEditor` | fixed; focused proof pass |
| Autoreview cycle 3 found stale pending plan gates | 1 | populate all closeout evidence before the final rerun | fixed; plan and final review pass |
| Final boundary review found a Core React import in the root Footnote graph and stale 64-row evidence | 1 | introduce an internal capability-aware navigator and extend the manifest to 65 | fixed; Plate feedback, Base fallback, package proof, and manifest pass |

Verification evidence:
- `pnpm install` — pass; direct dependency links and lockfile updated.
- `pnpm --filter @platejs/footnote test` — 26 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/footnote` — 13 tasks pass.
- `pnpm --filter @platejs/footnote build` — pass.
- `pnpm --filter @platejs/footnote lint` — pass.
- Footnote legacy API/cast audit — 0 forbidden matches; the sole explicit
  normalization is classified `semantic-dirty-path` above.
- Footnote scoped `git diff --check` — pass.
- `pnpm --filter @platejs/indent test` — 12 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/indent` — 11 tasks pass.
- `pnpm --filter @platejs/indent build` — pass.
- `pnpm --filter @platejs/indent lint` — pass.
- `pnpm --filter @platejs/indent brl` — pass; recovered exports generated in
  the established barrels.
- Indent legacy API/cast audit — 0 forbidden matches; two normalization calls
  are explicit normalizer tests only.
- Indent manifest and scoped diff check — 22 current rows, 0 missing; pass.
- `pnpm install` after Juice dependency correction — pass; lockfile current.
- `pnpm --filter @platejs/juice test` — 2 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/juice` — 11 tasks pass.
- `pnpm --filter @platejs/juice build` — pass.
- `pnpm --filter @platejs/juice lint:fix` — pass; no fixes needed.
- Juice legacy API/cast/dependency audit — 0 forbidden matches.
- Juice manifest and scoped diff check — 10 current rows, 0 missing; pass.

Final handoff contract:
- target surface and mode: sequential package review for Footnote, Indent, Juice
- files/APIs reviewed: 65 package rows; Base plugins, editor APIs/tx groups,
  queries/transforms/normalizers/hooks, React wrappers, tests, exports, metadata
- broad Core drift score coverage: N/A; broad Core excluded
- package file checklist coverage: 65/65 score 100; 0 unchecked/deferred/missing/extra
- best Plate v2 recommendation: keep all three proven packets as recorded above
- verdict matrix summary: Footnote hard-cut, Indent recover-main-owner, Juice hard-cut
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: umbrella and
  removed Slate APIs, flat editor APIs, casts, transaction nesting,
  normalization, owner deletion, and dependency truth across each active
  package; all in-scope matches patched; 0 deferred/remaining forbidden matches
- out-of-scope matches discovered: none
- changes made: direct Base/Plite migrations, restored Indent owners, accurate
  dependencies, three changesets, current README references, regression tests
- tests/proof commands: 40 tests; 35 typecheck graph tasks; three builds; three
  lints; Indent barrel; install; manifest/source/diff audits; autoreview; checker
- old compatibility names audited: yes; 0 matches remain in the three packages
- needs attention: none
- next best Plate Next packet: select the next untouched package batch by the
  skill freshness order

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Three-package packet closed |
| Where am I going? | Drift-scored Plate Next closure |
| What is the goal? | Close all 65 footnote/indent/juice rows with package proof and autoreview |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-12T00:50:09.532Z Goal plan created.
- 2026-07-12 Footnote closed at 33/33 score-100 rows with 26 tests and all package checks.
- 2026-07-12 Indent closed at 22/22 score-100 rows after recovering seven origin/main owners; 12 tests and all package checks pass.
- 2026-07-12 Juice closed at 10/10 score-100 rows with direct Base dependencies, 2 tests, and all package checks.
- 2026-07-12 Autoreview findings accepted and fixed: nested registry invalidation, explicit-target insertion, and headless navigation; final rerun clean.
- 2026-07-12 Final manifest/source/diff audits and autogoal checker pass.

Open risks:
- none in this packet
