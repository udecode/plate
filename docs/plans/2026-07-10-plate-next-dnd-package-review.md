# plate-next dnd package review

Objective:
Close DnD package drift; done when all 41 tracked rows score 100 or are
explicitly deferred and DnD proof plus autoreview pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-10-plate-next-dnd-package-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: corrected user continuation: `plate-next next pkg`; skip the
  already-closed CSV/Cursor/Date and Caption batches
- mode: full package review of the next uncovered sequential package
- target surface: all 41 tracked DnD package source/spec/metadata/config rows;
  zero untracked DnD files
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, limited to DnD and the
  smallest direct Core/Plite owner only if blocked
- package review mode: yes
- package review target: `packages/dnd` 41-row materialized manifest
- package file checklist gate: 41 rows; check only at score 100
- completion threshold summary: 41/41 score 100 or explicit defer; no
  unclassified drift; package tests/typecheck/build/lint, source/dependency
  audits, autoreview, and plan checker pass

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
- semantics: one-shot closure
- initial confidence score: 0.55 because DnD spans React, DOM geometry,
  cross-editor mutation, and four changed path-resolution rows
- improvement loop: review every row against `origin/main`, group by owner,
  patch safe drift, sweep correction classes, prove, review
- final score / loop closure: 1.00 only when all 41 rows close and no accepted
  actionable review finding remains

Completion threshold:
- Every one of the 41 DnD rows has a score-100 check or explicit defer owner.
- Preserve drag/drop, hover, selection, scrolling, and cross-editor behavior
  while cutting stale Slate/Plate compatibility, fake casts, and root helpers.
- Every correction-class match in DnD is classified and closed/deferred.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-dnd-package-review.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: all DnD package specs, with targeted rows first
- package proof: source-first DnD typecheck, package test/build/lint
- shared Core gate: N/A unless a concrete Core/Plite owner changes; DnD is a
  product React package and does not belong in `check:core`
- source audits: all 41 rows for umbrella imports, stale APIs, fake casts,
  root option helpers, asserted public reads, nested updates, callback-only
  subscriptions, dependency truth, and extracted files
- related scoped sweep query / active scope / match count / patched count / deferred count:
  recorded after each correction; active scope is `packages/dnd`
- package file manifest / row count / checked count / deferred count:
  `git ls-files packages/dnd/src packages/dnd/package.json packages/dnd/tsconfig*.json | sort` / 41 / 0 before review / 0
- Plite/Plate gap ledger: record blocker or N/A
- broad Core drift ledger gate: N/A; package review
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-dnd-package-review.md`

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
- allowed edit scope: all 41 DnD manifest rows, this plan, package changeset,
  and smallest direct Core/Plite owner only for a concrete blocker
- package/API surfaces: DnD plugin, hooks, components, queries, transforms,
  utils, types, metadata, configs, and specs
- docs/browser surfaces: N/A; package mode excludes www/browser
- non-goals: no already-closed package re-review, broad package/Core sweep,
  docs/apps/registry, rename pass, commit, or PR
- out-of-scope package errors: classify/defer unless caused by DnD

Output budget strategy:
- Group exact DnD reads by owner; use counts/file lists before snippets; exclude
  dist, generated output, apps, docs, node_modules, and unrelated packages.

Blocked condition:
- Stop only for a public API fork, missing Core/Plite capability, or repeated
  proof failure with no narrower autonomous diagnosis.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| manifest and baseline | complete | 41 tracked rows, 0 untracked, baseline recorded |
| source migration | complete | 39 live rows score 100, 2 dead rows hard-cut |
| package proof | complete | lint, typecheck, 28 fast tests, 4 DOM tests, build, barrels pass |
| source audits | complete | all named legacy/type/hook/read classes close at zero |
| autoreview | complete | accepted findings fixed; owner claim source-tested |
| handoff | complete | ledgers, changeset, next owner, and plan checker recorded |

Current verdict:
- verdict: keep; 39 live rows score 100 and 2 dead utility rows are hard-cut
- confidence: 1.00
- next owner: plate-next next-package autopilot
- keep / revert / quarantine call: keep the complete DnD packet
- reason: direct Core/Plite ownership, behavior proof, source audits, package
  build, and autoreview all close without a package blocker

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Corrected next-package request, skip ledger, 41-row DnD scope, proof and handoff recorded. |
| `plate-next` skill/rule read | yes | User supplied current skill; autogoal and vision sources read. |
| Active goal checked or created | yes | Prior redundant CSV goal was complete; DnD goal created. |
| Mode classified as named packet vs broad Core sweep | yes | Full DnD package review, not changed-file sampling or broad Core. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | DnD product owners over direct Core/Plite substrate. |
| Broad Core drift ledger initialized when in scope | no | N/A: no broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | Vision, origin/main, completed package ledgers, current DnD manifest. |
| Output budget strategy recorded | yes | Grouped DnD reads and bounded scans only. |
| Public API fork routing checked | yes | Any real fork routes to plate-plan; none known at checkpoint zero. |
| Gap policy checked | yes | Missing capability becomes a named gap, never a local shim. |
| Related scoped sweep policy checked | yes | Corrections sweep DnD only plus smallest blocker owner. |
| Review-mode rename freeze checked | yes | Current DnD names/paths stay fixed. |
| Package review checklist initialized when in scope | yes | 41 tracked rows; zero untracked. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: full DnD package review; not changed-file sampling,
      broad Core, docs/API mismatch, or public API plan.
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
- [x] For broad Core sweep, N/A: not requested.
- [x] For broad Core sweep, N/A: no Core rows apply.
- [x] For broad Core sweep, N/A: broad missing/extra counts are zero.
- [x] For broad Core sweep, N/A: package rows own scoring; the broad drift score gate would require
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
- [x] `pnpm brl` is run when exports/barrels change.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | typecheck, 28 fast tests, 4 DOM tests, build, lint pass |
| Broad Core drift ledger coverage | no | Package-only review | N/A |
| Score gate | yes | Prove all scores are valid | 41/41 reviewed; 39 live score 100, 2 hard-cut score 100 |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | direct Core/Plite product package; no compat bridge |
| Plite/Plate gap ledger | yes | Record blockers or N/A | N/A; Core NodeId owns collision rewriting |
| Related scoped sweep after correction | yes | Record same-class searches | zero legacy/umbrella/root-option/assertion matches remain |
| Package file checklist | yes | Record counts and proof | 41 total, 41 checked, 0 deferred, 0 missing/extra |
| Package/API proof | yes | Run focused package proof | all named commands pass |
| Shared Core gate coverage | no | Classify package | product React package; outside `check:core` |
| Non-Core package error triage | yes | Classify proof failures | none remain |
| Source audit | yes | Audit removed compatibility names | zero scoped matches |
| Rename ledger | no | Rename freeze | no rename proposed |
| Extracted-file inventory | yes | Record untracked inventory | zero untracked DnD rows |
| Autoreview / review | yes | Run structured review | final helper clean; no accepted/actionable findings |
| Final lint/check | yes | Run scoped lint/check | lint and typecheck pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | recorded below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-dnd-package-review.md` | pass: `[autogoal] complete` |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| DnD plugin/hooks/components | 5 | main-parity-cleanup | DnD | stale umbrella APIs, conditional hooks, effect cleanup, weak refs | fixed and proven |
| node/range transforms | 5 | main-parity-cleanup | DnD over Plite | old `api`/`tf`, asserted reads, cross-editor data loss | fixed and proven |
| `getNewDirection` + spec | 3 | hard-cut | none | zero runtime/repo callers | deleted; barrel regenerated |
| metadata/config/barrels | 3 | main-parity-cleanup | DnD package | umbrella dependency and stale Slate keyword | direct dependency truth and build pass |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| DnD runtime | Keep DnD product composition over direct Core/Plite APIs, stable DOM/inert hooks, and grouped cross-editor mutations. | `platejs` umbrella imports, root plugin helpers, `editor.tf`, compatibility aliases, conditional-hook suppressions | Matches Plate product ownership and preserves behavior. | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No missing capability | Local helper not needed | Core NodeId owns inserted-ID collision rewriting | enabled-owner regression test | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| umbrella/API migration | `packages/dnd` | `platejs`, old API, root option, `TElement`, `createSlateEditor` search | 57 baseline / 0 final | all scoped | 0 | none |
| type/hook cleanup | `packages/dnd` | production `any`, assertions, hook suppressions, manual memo search | 90 baseline / 0 final production matches | all scoped | 0 | external test-event casts only |
| dead helper cut | repo discovery, DnD edits | `getNewDirection` caller search | 0 runtime callers | 2 files + barrel | 0 | historical plan mentions only |
| cross-editor corrections | `packages/dnd` | multi-node, same-ID, NodeId-owner behavior tests | 3 regression rows | 3 | 0 | none |

Core drift ledger:
- Applies: no; package review
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | DnD package review | N/A | broad Core not requested | N/A |

Package file checklist:
- Applies: yes
- Package: `packages/dnd`
- Manifest command: `git ls-files packages/dnd/src packages/dnd/package.json packages/dnd/tsconfig.json packages/dnd/tsconfig.build.json | sort` plus untracked inventory
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 41
- Actual row count: 41
- Checked score-100 count: 41
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: closed; this package is complete

Package file rows:
- [x] `packages/dnd/package.json` — score: 100 — verdict: main-parity-cleanup — owner: DnD package boundary — evidence: direct Core/Plite/Utils imports, peer audit, artifact import audit — next: keep
- [x] `packages/dnd/src/DndPlugin.slow.tsx` — score: 100 — verdict: main-parity-cleanup — owner: DnD plugin proof — evidence: 4/4 explicit DOM/plugin tests pass without fake editors — next: keep
- [x] `packages/dnd/src/DndPlugin.tsx` — score: 100 — verdict: main-parity-cleanup — owner: DnD plugin — evidence: scoped portal, direct DOM API, effect cleanup, handler proof — next: keep
- [x] `packages/dnd/src/components/Scroller/DndScroller.tsx` — score: 100 — verdict: main-parity-cleanup — owner: DnD scroller — evidence: exact effect dependency and package proof — next: keep
- [x] `packages/dnd/src/components/Scroller/ScrollArea.tsx` — score: 100 — verdict: main-parity-cleanup — owner: DnD scroll area — evidence: typed events/refs, throttle/RAF cleanup, zero-frame guard, style ownership — next: keep
- [x] `packages/dnd/src/components/Scroller/Scroller.tsx` — score: 100 — verdict: keep-in-plate — owner: DnD scroller — evidence: thin product composition, typecheck/build — next: keep
- [x] `packages/dnd/src/components/Scroller/index.ts` — score: 100 — verdict: keep-in-plate — owner: barrel — evidence: `pnpm brl` and build — next: keep
- [x] `packages/dnd/src/components/index.ts` — score: 100 — verdict: keep-in-plate — owner: barrel — evidence: `pnpm brl` and build — next: keep
- [x] `packages/dnd/src/components/useDraggable.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: draggable proof — evidence: inert environment test passes without `any` — next: keep
- [x] `packages/dnd/src/components/useDraggable.ts` — score: 100 — verdict: main-parity-cleanup — owner: draggable hook — evidence: unconditional hooks and typed connector — next: keep
- [x] `packages/dnd/src/components/useDropLine.ts` — score: 100 — verdict: main-parity-cleanup — owner: drop-line hook — evidence: direct Core hooks and no ID cast — next: keep
- [x] `packages/dnd/src/hooks/index.ts` — score: 100 — verdict: keep-in-plate — owner: barrel — evidence: `pnpm brl` and build — next: keep
- [x] `packages/dnd/src/hooks/useDndNode.ts` — score: 100 — verdict: main-parity-cleanup — owner: DnD node hook — evidence: stable hook order, typed refs, no foreign spec props — next: keep
- [x] `packages/dnd/src/hooks/useDragNode.ts` — score: 100 — verdict: main-parity-cleanup — owner: drag hook — evidence: live Plite read, fresh React-DnD spec, inert owner — next: keep
- [x] `packages/dnd/src/hooks/useDropNode.ts` — score: 100 — verdict: main-parity-cleanup — owner: drop hook — evidence: discriminated drag items, typed refs, inert owner — next: keep
- [x] `packages/dnd/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: barrel — evidence: `pnpm brl` and artifact build — next: keep
- [x] `packages/dnd/src/queries/getBlocksWithId.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: block query proof — evidence: real editor behavior test passes — next: keep
- [x] `packages/dnd/src/queries/getBlocksWithId.ts` — score: 100 — verdict: main-parity-cleanup — owner: block query — evidence: generic value inference, root exclusion, direct entries/schema APIs — next: keep
- [x] `packages/dnd/src/queries/index.ts` — score: 100 — verdict: keep-in-plate — owner: barrel — evidence: `pnpm brl` and build — next: keep
- [x] `packages/dnd/src/transforms/focusBlockStartById.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: focus proof — evidence: found/missing behavior passes — next: keep
- [x] `packages/dnd/src/transforms/focusBlockStartById.ts` — score: 100 — verdict: main-parity-cleanup — owner: focus transform — evidence: optional reads and direct selection/DOM APIs — next: keep
- [x] `packages/dnd/src/transforms/index.ts` — score: 100 — verdict: keep-in-plate — owner: barrel — evidence: `pnpm brl` and build — next: keep
- [x] `packages/dnd/src/transforms/onDropNode.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: drop proof — evidence: same/cross editor, multi-node, guard, adjacency, collision rows pass — next: keep
- [x] `packages/dnd/src/transforms/onDropNode.ts` — score: 100 — verdict: main-parity-cleanup — owner: drop transform — evidence: live paths, property matcher, grouped source removal, no data loss — next: keep
- [x] `packages/dnd/src/transforms/onHoverNode.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: hover proof — evidence: target, collapse, clear, previous, outside rows pass — next: keep
- [x] `packages/dnd/src/transforms/onHoverNode.ts` — score: 100 — verdict: main-parity-cleanup — owner: hover transform — evidence: optional path/node handling and direct selection/DOM APIs — next: keep
- [x] `packages/dnd/src/transforms/removeBlocksAndFocus.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: remove/focus proof — evidence: real editor removal behavior passes — next: keep
- [x] `packages/dnd/src/transforms/removeBlocksAndFocus.ts` — score: 100 — verdict: main-parity-cleanup — owner: remove/focus transform — evidence: generic inference and direct range/update APIs — next: keep
- [x] `packages/dnd/src/transforms/selectBlockById.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: selection proof — evidence: found/missing behavior passes — next: keep
- [x] `packages/dnd/src/transforms/selectBlockById.ts` — score: 100 — verdict: main-parity-cleanup — owner: selection transform — evidence: optional reads and direct range/update APIs — next: keep
- [x] `packages/dnd/src/transforms/selectBlocksBySelectionOrId.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: multi-select proof — evidence: null/in/out selection rows pass — next: keep
- [x] `packages/dnd/src/transforms/selectBlocksBySelectionOrId.ts` — score: 100 — verdict: main-parity-cleanup — owner: multi-select transform — evidence: direct selection/range APIs and inferred entries — next: keep
- [x] `packages/dnd/src/types.ts` — score: 100 — verdict: main-parity-cleanup — owner: public DnD types — evidence: direct Element/PlateEditor owners and typed refs — next: keep
- [x] `packages/dnd/src/utils/dndEnvironment.ts` — score: 100 — verdict: main-parity-cleanup — owner: DnD environment — evidence: typed inert connectors and SSR test — next: keep
- [x] `packages/dnd/src/utils/getHoverDirection.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: direction proof — evidence: vertical/horizontal/self/cross-editor collision rows pass — next: keep
- [x] `packages/dnd/src/utils/getHoverDirection.ts` — score: 100 — verdict: main-parity-cleanup — owner: direction utility — evidence: discriminated items, typed ref, editor-scoped ID guard — next: keep
- [x] `packages/dnd/src/utils/getNewDirection.spec.ts` — score: 100 — verdict: hard-cut — owner: none — evidence: only tested dead helper; zero runtime callers — next: deleted
- [x] `packages/dnd/src/utils/getNewDirection.ts` — score: 100 — verdict: hard-cut — owner: none — evidence: zero runtime/repo callers — next: deleted
- [x] `packages/dnd/src/utils/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: barrel — evidence: dead export removed and `pnpm brl` passes — next: keep
- [x] `packages/dnd/tsconfig.build.json` — score: 100 — verdict: keep-in-plate — owner: DnD build — evidence: artifact build passes — next: keep
- [x] `packages/dnd/tsconfig.json` — score: 100 — verdict: keep-in-plate — owner: DnD typecheck — evidence: source-first typecheck passes — next: keep

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| runtime/API migration | DnD package | umbrella imports, old editor APIs, conditional hooks, unsafe refs | all 39 live rows | keep | prove and review |
| dead direction helper | DnD utils | exported helper has zero runtime callers | helper, spec, barrel | hard-cut | changeset + build |
| cross-editor behavior | DnD transforms | target-path lookup and multi-node insertion/removal can lose data | drop/hover sources and specs | keep fixed packet | collision and NodeId-owner proof |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| none | N/A | all current paths match origin/main ownership; 2 deletions are explicit hard-cuts | no extracted files | 0 untracked rows |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | all scoped package commands pass | N/A | N/A |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| root DnD option and old DOM calls | `apps/www/src/registry/ui/block-draggable.tsx` and generated registry output | package mode forbids registry edits | registry/Plate UI package review |
| historical migration language | `content/docs/migration/v48.mdx` | historical docs are not current package source | docs owner; no package blocker |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | direct Core/Plite/Utils ownership; stable hooks; typed refs/events; root-safe queries; grouped and lossless cross-editor drops; dead helper cut |
| tests/proof | real editor fixtures; 28 fast rows; 4 DOM/plugin rows; cross-editor multi-node, same-ID, and NodeId-owner regressions |
| docs/templates/skills | DnD Plate Next plan closed; one DnD changeset added; no product docs/apps touched |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | no taste/API blocker remains | 41/41 checklist | proceed to next package |

Findings:
- Existing package ledgers prove CSV, Cursor, Date, and Caption already closed;
  DnD is the first uncovered sequential package.
- DnD baseline: 19 tests pass, 3 fail because `createSlateEditor` and
  `createTPlatePlugin` no longer exist in current Plate exports.
- Full 41-row audit finds 57 stale umbrella/API matches and 90 weak cast sites;
  the four changed path-resolution files are only the tip of the packet.
- React hooks conditionally skipped `useDndNode`, `useDrag`, and `useDrop`;
  stable DOM/inert hook owners remove the suppressions.
- Cross-editor drops resolved source nodes against the target editor and could
  remove multiple source blocks after inserting only one; grouped source
  removal now follows complete ordered insertion.
- Core `NodeIdPlugin`, enabled by default outside test mode, owns inserted-ID
  collision rewriting; DnD passes target editor identity only to distinguish
  same-editor hover suppression.

Decisions and tradeoffs:
- Review all 41 rows, not only four uncommitted paths.
- Preserve DnD product ownership; migrate editor model/reads/updates/DOM calls
  directly to Plite/Core instead of adding compatibility exports.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial package tests used removed aggregate exports | 1 | migrate tests/source to direct owners | resolved; 28 + 4 tests pass |
| Explicit slow-test command lacked DOM preload | 1 | use repo Happy DOM preload | resolved; 4/4 pass |
| Autoreview: cross-editor same IDs blocked | 1 | pass target editor ID to hover helper | accepted, fixed, regression added |
| Autoreview: duplicate target IDs | 1 | inspect Core NodeId owner | rejected as DnD fix; explicit enabled-owner test proves rewrite |
| Autoreview: plan still pending | 1 | close all ledger rows and proof | accepted, fixed |

Verification evidence:
- `pnpm --filter @platejs/dnd lint:fix` — pass; 39 live files.
- `pnpm --filter @platejs/dnd typecheck` — pass.
- `pnpm --filter @platejs/dnd test` — pass; 28 tests, 39 assertions.
- `pnpm --filter @platejs/dnd exec bun test --preload ../../tooling/config/bunTestSetup.ts ./src/DndPlugin.slow.tsx` — pass; 4 tests, 23 assertions.
- `pnpm --filter @platejs/dnd build` — pass; artifact imports match direct dependencies.
- `pnpm --filter @platejs/dnd brl` — pass after dead export removal.
- Manifest: 41 tracked review rows = 39 live + 2 deleted; 0 untracked,
  0 missing, 0 extra, 0 deferred.
- Final audits: 0 umbrella imports, 0 stale editor APIs, 0 production `any`,
  0 hook suppressions, 0 manual memo hooks, 0 asserted production reads,
  0 normalization calls, 0 root option helpers.
- Autoreview: same-editor-ID finding accepted/fixed; duplicate-ID finding
  rejected with Core owner source plus passing explicit owner test; later runs
  found no runtime issue; final helper reports no accepted/actionable findings.

Final handoff contract:
- target surface and mode: full `packages/dnd` package review
- files/APIs reviewed: 41 tracked rows; 39 live, 2 hard-cut
- broad Core drift score coverage: N/A; product React package
- package file checklist coverage: 41/41 score 100, 0 unchecked/deferred
- best Plate v2 recommendation: keep DnD product owners over direct Core/Plite
- verdict matrix summary: 39 main-parity/keep rows, 2 hard-cut rows
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: DnD legacy,
  cast, hook, read, mutation, dependency, and dead-helper classes; all scoped
  matches patched, 0 deferred
- out-of-scope matches discovered: registry DnD consumers still contain old
  root option/DOM APIs; deferred to registry owner
- changes made: direct dependencies/APIs, stable hooks, cleanup-safe scroller,
  lossless cross-editor moves, dead helper removal, real tests, changeset
- tests/proof commands: all package proof commands pass
- old compatibility names audited: zero scoped matches
- needs attention: none
- next best Plate Next packet: `packages/docx`, subject to the same completed
  package-ledger skip check at the next invocation

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Drift-scored Plate Next closure |
| What is the goal? | Close all 41 DnD rows at score 100 or explicit defer. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-10T23:09:27.194Z Goal plan created.
- 2026-07-11 Corrected skip ledger selected DnD after already-closed CSV/Cursor/Date/Caption.
- 2026-07-11 Baseline recorded: 19 pass, 3 fail; 57 legacy matches, 90 cast sites.
- 2026-07-11 Migrated all live DnD owners to direct Core/Plite APIs and stable hooks.
- 2026-07-11 Fixed cross-editor multi-node data loss and same-ID hover behavior.
- 2026-07-11 Hard-cut dead `getNewDirection` source/spec/export.
- 2026-07-11 Closed package proof: 28 fast tests, 4 DOM tests, typecheck, lint,
  build, barrels, dependency/source audits.
- 2026-07-11 Autoreview findings classified and plan ledger closed.
- 2026-07-11 Final autoreview clean: no accepted/actionable findings.

Open risks:
- No DnD package blocker. Registry consumers remain explicitly out of scope.
