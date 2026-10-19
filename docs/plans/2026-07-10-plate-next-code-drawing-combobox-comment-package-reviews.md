# plate-next code-drawing combobox comment package reviews

Objective:
Close the next three Plate Next package reviews in order: Code Drawing,
Combobox, then Comment, with every file scored 100 and package proof green.

Goal plan:
docs/plans/2026-07-10-plate-next-code-drawing-combobox-comment-package-reviews.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user invoked `$plate-next` and said “ok go 3 next packages”
- mode: one-shot sequential package review
- target surface: `packages/code-drawing`, `packages/combobox`,
  `packages/comment`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, active package plus smallest
  Plite/Core blocker only
- package review mode: yes
- package review target: exactly three packages in order: Code Drawing,
  Combobox, Comment
- package file checklist gate: 22 + 19 + 28 = 69 tracked rows; `[x]` only at
  score 100
- completion threshold summary: close each package before advancing; finish
  after all 69 rows and all three package gates are green, or stop at a real
  public API/owner blocker

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

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero and 69-file manifest | completed | Exact target/order, scope, stop conditions, and proof copied into this plan |
| Package 1: `packages/code-drawing` | completed | 22/22 score 100; 13 tests, typecheck, lint, and build green |
| Package 2: `packages/combobox` | completed | 19/19 score 100; 42 tests, typecheck, lint, build, and source audit green |
| Package 3: `packages/comment` | completed | 28/28 score 100; duplicate spec deleted; 11 tests, typecheck, lint, build, and source audit green |
| Final scoped autoreview and closeout | completed | Clean autoreview, 66 parallel tests green, final plan audit closed |

Timed checkpoint:
- requested duration: none; user requested a package count
- semantics: complete exactly three packages, not a timed soak
- initial confidence score: 0 per unchecked file
- improvement loop: review every file against `origin/main`, patch package
  drift, run focused proof, close at 100, then advance
- final score / loop closure: 69/69 score-100 rows, three package gates green,
  final scoped autoreview clean

Completion threshold:
- `packages/code-drawing`, `packages/combobox`, and `packages/comment` close in
  order with 22/22, 19/19, and 28/28 score-100 rows respectively.
- Every package preserves main-owned behavior while using Plite-native APIs,
  correct plugin ownership, inline inference, and no compatibility wrappers.
- Each package passes source typecheck, package tests, lint, and artifact build.
- Package metadata matches real direct imports; exported barrels are updated
  with `pnpm brl` only if exports change.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-code-drawing-combobox-comment-package-reviews.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package-owned specs selected from each changed
  behavior owner
- package proof: `pnpm turbo typecheck --filter=./packages/<package>`, package
  `test`, `lint`, and `build`
- shared Core gate: classify each package; add to `check:core` only if it
  protects the Core/Plite boundary or a smallest Core/Plite owner changes
- source audits: full file-by-file `origin/main` comparison; old root APIs,
  wrappers, casts, nested updates, optional reads, package deps, extracted files
- related scoped sweep query / active scope / match count / patched count / deferred count:
  one row per correction, scoped to the active package
- package file manifest / row count / checked count / deferred count:
  `git ls-files packages/{code-drawing,combobox,comment}`; 69 / 0 / 0 initially
- Plite/Plate gap ledger: fill only for a proven missing owner primitive
- broad Core drift ledger gate: N/A; sequential package review
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-code-drawing-combobox-comment-package-reviews.md`

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
- Optional public-read law: Plate feature-package source handles unresolved
  Plite reads with an early return/no-op. `{ required: true }` is reserved for
  Plite internals with a proven runtime invariant; fixture assertions are the
  test-only exception.
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
- allowed edit scope: active package only, this plan, shared gate tooling when
  justified, and the smallest Plite/Core owner if a proven blocker requires it
- package/API surfaces: Code Drawing plugin/renderers/download/insert;
  Combobox trigger/filter/input hooks; Comment marks/runtime/plugin/hooks
- docs/browser surfaces: out of scope; no `apps/www`, docs, registry, or browser
  work in package-review mode
- non-goals: no fourth package, no broad repo caller rewrite, no rename pass,
  no public compatibility aliases, no unrelated package fixes
- out-of-scope package errors: record and route; do not patch unless they prove
  an active-package or touched owner regression

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only for a public API fork or missing Plite/Plate primitive that cannot
  be repaired in the active package plus smallest owner without broad redesign.

Current verdict:
- verdict: all three packages closed; final scoped autoreview active
- confidence: 69/69 rows closed at score 100
- next owner: plate-next
- keep / revert / quarantine call: one packet per package after focused proof
- reason: all package gates are green; only final review and plan closure remain

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exactly three next packages, sequential closure, no timing or broad sweep |
| `plate-next` skill/rule read | yes | User supplied skill; source rule also read |
| Active goal checked or created | yes | Goal created for the three-package closure |
| Mode classified as named packet vs broad Core sweep | yes | Sequential package review, not broad Core |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Recorded above |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core not requested |
| Source of truth and allowed workspace recorded | yes | Current checkout; `origin/main` as behavior/owner evidence |
| Output budget strategy recorded | yes | 69 durable rows in plan; concise chat updates |
| Public API fork routing checked | yes | Route only a real API fork to `plate-plan` |
| Gap policy checked | yes | Smallest owner or explicit blocker; no local hacks |
| Related scoped sweep policy checked | yes | Active package only plus smallest owner |
| Review-mode rename freeze checked | yes | No rename pass requested |
| Package review checklist initialized when in scope | yes | 22 + 19 + 28 tracked rows; zero untracked |

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
- [x] Optional public-read audit closed: feature-package production code does
      not use `{ required: true }` or non-null assertions to hide unresolved
      Plite reads; each match handles `undefined` or records a Plite-internal
      invariant reason.
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
| Named verification threshold | completed | Run the proof commands named in this plan | all three package typecheck/test/lint/build gates green |
| Broad Core drift ledger coverage | N/A | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | package review only; Core source untouched |
| Score gate | completed | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 69/69 score 100; zero deferred |
| Best Plate v2 recommendation | completed | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | three package rows recorded |
| Plite/Plate gap ledger | completed | Record blockers or N/A when no gap blocks the target | no missing capability |
| Related scoped sweep after correction | completed | For each correction, run and record same-class search/review results inside the active scope | eight scoped sweep rows recorded |
| Package file checklist | completed | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | 69 expected/actual, zero missing/extra/unchecked |
| Package/API proof | completed | Run focused typecheck/test/build or record N/A | 66 package tests plus package typecheck/lint/build |
| Shared Core gate coverage | N/A | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | three packages are product-only; no Core/Plite owner changed |
| Non-Core package error triage | completed | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | no out-of-scope failures observed |
| Source audit | completed | Run exact audit for removed compatibility names or record N/A | zero forbidden source matches across all packages |
| Rename ledger | N/A | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | no rename proposed or applied |
| Extracted-file inventory | completed | Record untracked/extracted file command, row count, and bucket for every file in scope | zero untracked; duplicate Comment runtime spec deleted and merged |
| Autoreview / review | completed | Run review gate for non-trivial implementation diffs or record N/A | clean, zero actionable findings, confidence 0.82 |
| Final lint/check | completed | Run scoped lint/check or record N/A | all package lint and `git diff --check` green |
| Changed list / top drift / needs attention | completed | Fill handoff ledgers | recorded below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-code-drawing-combobox-comment-package-reviews.md` | final plan audit prepared; command rerun after this row closed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/code-drawing` | 5 | main-parity-cleanup | Code Drawing | Removed old Slate plugin/editor/`editor.tf`; restored next-block insertion; package gates green | closed |
| `packages/combobox` | 5 | main-parity-cleanup | Combobox | Migrated transform middleware, live node identity, history/focus, runtime user identity, and hotkeys; all package gates green | closed |
| `packages/comment` | 5 | main-parity-cleanup | Comment | Migrated comment reads/tx/normalizer/hook, removed duplicate runtime spec and stale dependency, strengthened behavior proof; all package gates green | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Code Drawing | Keep rendering/download utilities product-owned; expose insertion through inferred `editor.update.code_drawing.insert`; original helper owns tx algorithm | `createSlatePlugin`, `SlateEditor`, `editor.tf`, generic Plite `nextBlock` flag | Clean Plate composition over Plite tx while preserving insert-after-block behavior | none |
| Combobox | Keep trigger matching product-owned; install it as inferred Plite transform middleware using the active tx; use Plite selection/path/history/focus and Plate runtime user identity | `overrideEditor`, `editor.tf`, root history methods, `findPath`, `editor.meta`, fake hook editors, two-argument `isHotkey` | Preserves main behavior while moving every substrate concern to its typed owner; restored keyboard proof caught and fixed a real hotkey regression | none |
| Comment | Keep comment key utilities and product API Plate-owned; expose reads on `editor.api.comment`, writes on inferred `editor.update.comment`, and normalization as a Plite extension using the active tx | `createTSlatePlugin`, `overrideEditor`, `extendTransforms`, root editor state/transforms, JSON-string document scans, nested plugin API bags, duplicate runtime spec | Preserves main behavior, removes false-positive scan and transient-id bug, and keeps plugin portal API direct while editor API stays namespaced | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No missing Plite/Plate capability for the three reviewed packages | Local wrappers were unnecessary | existing Plite/Core owners | package proof | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| old Slate package surface | `packages/code-drawing` | old imports/types/root transforms plus `as any` audit | 13 initial actionable matches | 13 removed/retyped | 0 | zero old API matches; external test-boundary casts typed through `unknown` |
| next-block behavior | Code Drawing insert owner/spec | middle-of-block insertion proof | 1 regression | 2 owner files | 0 | regression test green |
| old Slate package surface | `packages/combobox` | old imports, `overrideEditor`, root transforms/history/meta, `findPath`, broad casts | 24 initial actionable matches | 24 removed/retyped | 0 | zero forbidden source matches |
| keyboard cancellation | Combobox input hook/spec | all `isHotkey` calls and ArrowLeft/ArrowRight/Backspace/Escape proof | 4 stale call shapes | 1 owner file + proof | 0 | all four cancellation rows green |
| hook proof quality | Combobox hook spec | replace fake editor API bags with live Plate editors and live node identity | 2 fake editor fixtures | 1 spec | 0 | removal and history behavior run through real editor APIs |
| old Slate package surface | `packages/comment` | aggregate imports, old plugin builder/override/transforms, root editor reads/writes, broad casts | 47 initial actionable matches | all removed/retyped | 0 | zero forbidden source matches |
| comment runtime proof | Comment plugin specs | merge duplicate runtime spec assertions into original owner | 1 duplicate file / 5 overlapping rows | 1 spec merged, duplicate deleted | 0 | original owner covers queries, tx, normalizer, overlap, transient behavior |
| comment scan/identity behavior | Comment plugin/API | JSON-string scan and non-null inferred comment id | 2 behavior risks | 2 repaired | 0 | node query prevents false positives; transient removal never invents `comment_undefined` |

Core drift ledger:
- Applies: no; package review only
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
| N/A | 0 | N/A | Core | Core was outside the named package review | closed |

Package file checklist:
- Applies: yes
- Package: `packages/code-drawing`, then `packages/combobox`, then
  `packages/comment`
- Manifest command: `git ls-files packages/<package> | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 69 total: 22 + 19 + 28
- Actual row count: 69 total: 22 + 19 + 28
- Checked score-100 count: 69
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: current package has every row at score 100 and
  its package proof is green

Package file rows:

### code-drawing
- [x] `packages/code-drawing/CHANGELOG.md` — score: 100 — verdict: keep-in-plate — owner: code-drawing — evidence: byte-equivalent to origin/main; owner audit and package gates green — next: closed
- [x] `packages/code-drawing/README.md` — score: 100 — verdict: keep-in-plate — owner: code-drawing — evidence: byte-equivalent to origin/main; owner audit and package gates green — next: closed
- [x] `packages/code-drawing/package.json` — score: 100 — verdict: main-parity-cleanup — owner: code-drawing — evidence: file-by-file main review; Plite-native owner and package gates green — next: closed
- [x] `packages/code-drawing/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: code-drawing — evidence: byte-equivalent to origin/main; owner audit and package gates green — next: closed
- [x] `packages/code-drawing/src/lib/BaseCodeDrawingPlugin.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: code-drawing — evidence: main behavior retained and strengthened; 13 tests plus typecheck/lint/build green — next: closed
- [x] `packages/code-drawing/src/lib/BaseCodeDrawingPlugin.ts` — score: 100 — verdict: main-parity-cleanup — owner: code-drawing — evidence: file-by-file main review; Plite-native owner and package gates green — next: closed
- [x] `packages/code-drawing/src/lib/constants.ts` — score: 100 — verdict: keep-in-plate — owner: code-drawing — evidence: byte-equivalent to origin/main; owner audit and package gates green — next: closed
- [x] `packages/code-drawing/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: code-drawing — evidence: byte-equivalent to origin/main; owner audit and package gates green — next: closed
- [x] `packages/code-drawing/src/lib/transforms/index.ts` — score: 100 — verdict: keep-in-plate — owner: code-drawing — evidence: byte-equivalent to origin/main; owner audit and package gates green — next: closed
- [x] `packages/code-drawing/src/lib/transforms/insertCodeDrawing.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: code-drawing — evidence: main behavior retained and strengthened; 13 tests plus typecheck/lint/build green — next: closed
- [x] `packages/code-drawing/src/lib/transforms/insertCodeDrawing.ts` — score: 100 — verdict: main-parity-cleanup — owner: code-drawing — evidence: file-by-file main review; Plite-native owner and package gates green — next: closed
- [x] `packages/code-drawing/src/lib/types.ts` — score: 100 — verdict: keep-in-plate — owner: code-drawing — evidence: byte-equivalent to origin/main; owner audit and package gates green — next: closed
- [x] `packages/code-drawing/src/lib/utils/download.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: code-drawing — evidence: main behavior retained and strengthened; 13 tests plus typecheck/lint/build green — next: closed
- [x] `packages/code-drawing/src/lib/utils/download.ts` — score: 100 — verdict: keep-in-plate — owner: code-drawing — evidence: byte-equivalent to origin/main; owner audit and package gates green — next: closed
- [x] `packages/code-drawing/src/lib/utils/index.ts` — score: 100 — verdict: keep-in-plate — owner: code-drawing — evidence: byte-equivalent to origin/main; owner audit and package gates green — next: closed
- [x] `packages/code-drawing/src/lib/utils/renderers.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: code-drawing — evidence: main behavior retained and strengthened; 13 tests plus typecheck/lint/build green — next: closed
- [x] `packages/code-drawing/src/lib/utils/renderers.ts` — score: 100 — verdict: main-parity-cleanup — owner: code-drawing — evidence: file-by-file main review; Plite-native owner and package gates green — next: closed
- [x] `packages/code-drawing/src/react/CodeDrawingPlugin.tsx` — score: 100 — verdict: main-parity-cleanup — owner: code-drawing — evidence: file-by-file main review; Plite-native owner and package gates green — next: closed
- [x] `packages/code-drawing/src/react/index.ts` — score: 100 — verdict: keep-in-plate — owner: code-drawing — evidence: byte-equivalent to origin/main; owner audit and package gates green — next: closed
- [x] `packages/code-drawing/src/viz.d.ts` — score: 100 — verdict: main-parity-cleanup — owner: code-drawing — evidence: file-by-file main review; Plite-native owner and package gates green — next: closed
- [x] `packages/code-drawing/tsconfig.build.json` — score: 100 — verdict: main-parity-cleanup — owner: code-drawing — evidence: file-by-file main review; Plite-native owner and package gates green — next: closed
- [x] `packages/code-drawing/tsconfig.json` — score: 100 — verdict: keep-in-plate — owner: code-drawing — evidence: byte-equivalent to origin/main; owner audit and package gates green — next: closed

### combobox
- [x] `packages/combobox/.npmignore` — score: 100 — verdict: keep-in-plate — owner: combobox — evidence: byte-equivalent to origin/main; owner audit and package gates green — next: closed
- [x] `packages/combobox/CHANGELOG.md` — score: 100 — verdict: keep-in-plate — owner: combobox — evidence: byte-equivalent to origin/main; historical only — next: closed
- [x] `packages/combobox/README.md` — score: 100 — verdict: keep-in-plate — owner: combobox — evidence: byte-equivalent to origin/main; package-local README unchanged — next: closed
- [x] `packages/combobox/package.json` — score: 100 — verdict: main-parity-cleanup — owner: combobox — evidence: direct Core/Plite/test-utils owners declared; stale aggregate peer removed; build green — next: closed
- [x] `packages/combobox/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: combobox — evidence: byte-equivalent to origin/main; export audit green — next: closed
- [x] `packages/combobox/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: combobox — evidence: byte-equivalent to origin/main; export audit green — next: closed
- [x] `packages/combobox/src/lib/types.ts` — score: 100 — verdict: main-parity-cleanup — owner: combobox — evidence: BaseEditor/Element contracts replace Slate aliases; typecheck green — next: closed
- [x] `packages/combobox/src/lib/utils/filterWords.spec.ts` — score: 100 — verdict: keep-in-plate — owner: combobox — evidence: byte-equivalent to origin/main; 12 filter rows green — next: closed
- [x] `packages/combobox/src/lib/utils/filterWords.ts` — score: 100 — verdict: keep-in-plate — owner: combobox — evidence: byte-equivalent to origin/main; package tests green — next: closed
- [x] `packages/combobox/src/lib/utils/index.ts` — score: 100 — verdict: keep-in-plate — owner: combobox — evidence: byte-equivalent to origin/main; export audit green — next: closed
- [x] `packages/combobox/src/lib/withTriggerCombobox.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: combobox — evidence: real BaseEditor/Plite APIs preserve all trigger, query, explicit-at, and userId behavior; 23 rows green — next: closed
- [x] `packages/combobox/src/lib/withTriggerCombobox.ts` — score: 100 — verdict: main-parity-cleanup — owner: combobox — evidence: active tx middleware, optional reads, Plate runtime identity, no compatibility API; source audit green — next: closed
- [x] `packages/combobox/src/react/hooks/comboboxInputHooks.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: combobox — evidence: live editor/node proof covers blur, four keyboard cancellations, undo/redo, and DOM cursor state — next: closed
- [x] `packages/combobox/src/react/hooks/index.ts` — score: 100 — verdict: keep-in-plate — owner: combobox — evidence: byte-equivalent to origin/main; export audit green — next: closed
- [x] `packages/combobox/src/react/hooks/useComboboxInput.ts` — score: 100 — verdict: main-parity-cleanup — owner: combobox — evidence: Plite node identity/history/focus and curried hotkeys; behavior proof green — next: closed
- [x] `packages/combobox/src/react/hooks/useHTMLInputCursorState.ts` — score: 100 — verdict: keep-in-plate — owner: combobox — evidence: byte-equivalent to origin/main; DOM cursor proof green — next: closed
- [x] `packages/combobox/src/react/index.ts` — score: 100 — verdict: keep-in-plate — owner: combobox — evidence: byte-equivalent to origin/main; export audit green — next: closed
- [x] `packages/combobox/tsconfig.build.json` — score: 100 — verdict: main-parity-cleanup — owner: combobox — evidence: package-local rootDir required by current build lane; build green — next: closed
- [x] `packages/combobox/tsconfig.json` — score: 100 — verdict: keep-in-plate — owner: combobox — evidence: byte-equivalent to origin/main; strict typecheck green — next: closed

### comment
- [x] `packages/comment/.npmignore` — score: 100 — verdict: keep-in-plate — owner: comment — evidence: byte-equivalent to origin/main; owner audit green — next: closed
- [x] `packages/comment/CHANGELOG.md` — score: 100 — verdict: keep-in-plate — owner: comment — evidence: byte-equivalent to origin/main; historical only — next: closed
- [x] `packages/comment/README.md` — score: 100 — verdict: keep-in-plate — owner: comment — evidence: byte-equivalent to origin/main; package-local README unchanged — next: closed
- [x] `packages/comment/package.json` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: direct Core/Plite/Utils owners declared; aggregate peer and unused lodash removed; build green — next: closed
- [x] `packages/comment/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: comment — evidence: byte-equivalent to origin/main; export audit green — next: closed
- [x] `packages/comment/src/lib/BaseCommentPlugin.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: original owner absorbs runtime proof; 9 plugin behavior rows green without fake editor/casts — next: closed
- [x] `packages/comment/src/lib/BaseCommentPlugin.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: inferred editor API/tx, active transaction, typed Plite reads, no JSON scan or compatibility API — next: closed
- [x] `packages/comment/src/lib/BaseCommentRuntimePlugin.spec.ts` — score: 100 — verdict: delete-duplicate — owner: comment — evidence: absent from origin/main; all five useful assertions merged into `BaseCommentPlugin.spec.ts`; package tests green — next: deleted
- [x] `packages/comment/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: comment — evidence: byte-equivalent to origin/main; export audit green — next: closed
- [x] `packages/comment/src/lib/utils/getCommentCount.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: real TCommentText contract replaces broad cast; utility proof green — next: closed
- [x] `packages/comment/src/lib/utils/getCommentCount.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: direct Utils type owner; behavior unchanged — next: closed
- [x] `packages/comment/src/lib/utils/getCommentKey.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: direct KEYS owner; behavior unchanged — next: closed
- [x] `packages/comment/src/lib/utils/getCommentKeyId.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: direct KEYS owner; behavior unchanged — next: closed
- [x] `packages/comment/src/lib/utils/getCommentKeys.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: real TCommentText contract replaces broad cast; utility proof green — next: closed
- [x] `packages/comment/src/lib/utils/getCommentKeys.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: direct Utils type owner; behavior unchanged — next: closed
- [x] `packages/comment/src/lib/utils/getDraftCommentKey.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: direct KEYS owner; behavior unchanged — next: closed
- [x] `packages/comment/src/lib/utils/getTransientCommentKey.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: direct KEYS owner; behavior unchanged — next: closed
- [x] `packages/comment/src/lib/utils/index.ts` — score: 100 — verdict: keep-in-plate — owner: comment — evidence: byte-equivalent to origin/main; export audit green — next: closed
- [x] `packages/comment/src/lib/utils/isCommentKey.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: direct KEYS owner; behavior unchanged — next: closed
- [x] `packages/comment/src/lib/utils/isCommentNodeById.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: broad Node input retained with real TextApi guard; no structural cast — next: closed
- [x] `packages/comment/src/lib/utils/isCommentText.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: real Plite Text guard and Utils product type; typecheck green — next: closed
- [x] `packages/comment/src/lib/withComments.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: original normalizer owner retained; raw extension and active tx replace override/root transforms — next: closed
- [x] `packages/comment/src/react/CommentPlugin.tsx` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: direct Core React owner; wrapper behavior unchanged — next: closed
- [x] `packages/comment/src/react/hooks/index.ts` — score: 100 — verdict: keep-in-plate — owner: comment — evidence: byte-equivalent to origin/main; export audit green — next: closed
- [x] `packages/comment/src/react/hooks/useCommentId.ts` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: selector reads Plite selection and direct typed plugin portal; typecheck green — next: closed
- [x] `packages/comment/src/react/index.ts` — score: 100 — verdict: keep-in-plate — owner: comment — evidence: byte-equivalent to origin/main; export audit green — next: closed
- [x] `packages/comment/tsconfig.build.json` — score: 100 — verdict: main-parity-cleanup — owner: comment — evidence: package-local rootDir required by current build lane; build green — next: closed
- [x] `packages/comment/tsconfig.json` — score: 100 — verdict: keep-in-plate — owner: comment — evidence: byte-equivalent to origin/main; strict typecheck green — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Code Drawing | Plate product package | Source still used removed Slate APIs; generic Plite insertion split the selected paragraph | package source/specs/metadata; 13 tests plus typecheck/lint/build | keep repaired | move to Combobox |
| Combobox | Plate product package | Old override/root APIs and fake hook editors hid keyboard/live-node regressions | package source/specs/metadata; 42 tests plus typecheck/lint/build | keep repaired | move to Comment |
| Comment | Plate product package | Old transforms/root APIs, JSON scan, duplicate proof file, and transient id bug | package source/specs/metadata; 11 tests plus typecheck/lint/build | keep repaired; delete duplicate | final review |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/code-drawing` | N/A | 22 tracked/present; 0 deleted/untracked | no extracted-file debt | manifest audit |
| `packages/combobox` | N/A | 19 tracked/present; 0 deleted/untracked | no extracted-file debt | manifest audit |
| `packages/comment` | `delete-duplicate` | 28 tracked at checkpoint zero; duplicate runtime spec absent from origin/main | merge unique proof into original spec and delete duplicate | 11 tests green |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | none | no out-of-scope proof failures | none |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| legacy consumers of migrated package APIs | later package-review packages | sequential package scope forbids broad caller migration | next Plate Next package reviews |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Plite-native Code Drawing insertion; Combobox transform/history/focus/live-node flow; Comment API/tx/normalizer/hook; direct package dependencies |
| tests/proof | 66 package tests; real editor/live-node hook proof; Comment duplicate proof consolidated; package typecheck/lint/build |
| docs/templates/skills | this 69-row autogoal ledger only |
| reverted/quarantined packets | reverted generic Code Drawing selection insertion after it split text; deleted duplicate Comment runtime spec |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | none | scoped autoreview found no actionable issue | three package diffs | continue with the next package review only when requested |

Findings:
- Scoped autoreview: zero actionable findings, overall correctness `patch is correct`, confidence 0.82.

Decisions and tradeoffs:
- Keep product behavior in its package owner; use Plite reads/tx/extensions for substrate work.
- Keep plugin portal APIs direct while editor-wide APIs remain namespaced.
- Do not add Code Drawing, Combobox, or Comment to `check:core`; they are product-only packages and no Core/Plite owner changed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Code Drawing default node insert split the selected paragraph | 1 | resolve current block and insert at its next path | regression test green |
| Combobox imported removed `useSelected` and its migrated hotkey proof used incomplete event data | 2 | use `useElementSelected`; test real `is-hotkey` contract with live editors/events | 42 tests green |
| Comment tx extension treated plugin-context API as editor-namespaced API | 1 | use direct `api.node/nodes/nodeId` inside plugin portal/extension context | typecheck and 11 tests green |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/code-drawing`
- `pnpm --filter @platejs/code-drawing test` — 13 pass
- `pnpm --filter @platejs/code-drawing lint`
- `pnpm --filter @platejs/code-drawing build`
- `pnpm turbo typecheck --filter=./packages/combobox`
- `pnpm --filter @platejs/combobox test` — 42 pass
- `pnpm --filter @platejs/combobox lint`
- `pnpm --filter @platejs/combobox build`
- `pnpm turbo typecheck --filter=./packages/comment`
- `pnpm --filter @platejs/comment test` — 11 pass
- `pnpm --filter @platejs/comment lint`
- `pnpm --filter @platejs/comment build`
- scoped `autoreview --mode local` with parallel 66-test command — clean
- `git diff --check` and forbidden-name audits — green

Final handoff contract:
- target surface and mode: sequential Plate Next package review for Code Drawing, Combobox, Comment
- files/APIs reviewed: all 69 checkpoint-zero rows
- broad Core drift score coverage: N/A; Core untouched
- package file checklist coverage: 69/69 score 100; zero deferred
- best Plate v2 recommendation: product ownership over Plite reads/tx/extensions; no compatibility wrappers
- verdict matrix summary: three `main-parity-cleanup` packages closed
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: eight rows above; zero deferred in package scope
- out-of-scope matches discovered: later package consumers only
- changes made: runtime/API migration, stronger tests, dependency cleanup, duplicate proof deletion
- tests/proof commands: 66 tests plus three package typecheck/lint/build gates and clean autoreview
- old compatibility names audited: zero forbidden source matches
- needs attention: none
- next best Plate Next packet: next package in the sequential package ledger, only on a new invocation

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final plan closure |
| Where am I going? | Goal complete after `check-complete` |
| What is the goal? | Close Code Drawing, Combobox, and Comment at score 100 |
| What have I learned? | Main behavior survives cleanly through Plite-owned reads/tx/extensions; fake proof hid real keyboard drift |
| What have I done? | Closed 69 rows and all three package gates; clean autoreview |

Timeline:
- 2026-07-10T00:12:24.285Z Goal plan created.
- 2026-07-10 Code Drawing closed: 22/22, 13 tests and package gates green.
- 2026-07-10 Combobox closed: 19/19, 42 tests and package gates green.
- 2026-07-10 Comment closed: 28/28, 11 tests and package gates green.
- 2026-07-10 Scoped autoreview clean with zero actionable findings.

Open risks:
- No known package-scope risk. Consumer packages still using old package APIs remain owned by their future sequential Plate Next reviews.
