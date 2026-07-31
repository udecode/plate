# plate-next udecode cmdk cn depset package reviews

Objective:
Close udecode cmdk, cn, and depset reviews; done when every package row scores
100 or is explicitly deferred and proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-13-plate-next-udecode-cmdk-cn-depset-package-reviews.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user invoked `plate-next` and requested the next three packages
- mode: sequential package review
- target surface: `packages/udecode/cmdk`, then `packages/udecode/cn`, then
  `packages/udecode/depset`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, inside the active package
  plus only the smallest required owner
- package review mode: yes
- package review target: every tracked and untracked file in the three packages
- package file checklist gate: one row per file; `[x]` only at score `100`;
  explicit deferrals remain unchecked with owner and proof needed
- completion threshold summary: close cmdk before cn and cn before depset; all
  36 initial rows plus justified new proof/tooling rows score 100 or are
  explicitly deferred; stop before any fourth package

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
- semantics: one-shot completion of exactly the next three untouched workspace packages
- initial confidence score: 0.35 before source and `origin/main` audits
- improvement loop: review and close cmdk, then cn, then depset
- final score / loop closure: 1.0; all three package gates and autoreview closed

Completion threshold:
- All 39 final cmdk, cn, and depset rows score `100` or carry an explicit deferral
  with reason, owner, proof needed, and next action; package lint,
  source-first typecheck, tests where present, build, source audits,
  autoreview, and final checker pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plate-next-udecode-cmdk-cn-depset-package-reviews.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package lint, source-first typecheck, package tests
  where present, and package build
- package proof: package-local lint/typecheck/test/build for cmdk, cn, and depset
- shared Core gate: N/A unless the smallest Core/Plite owner changes; these are
  generic utility packages outside the Core/Plite editor boundary
- source audits: `origin/main` owner parity, direct dependency ownership,
  stale compatibility, type cheats, unsafe casts, and extracted files
- related scoped sweep query / active scope / match count / patched count / deferred count:
  record after every correction inside the active package
- package file manifest / row count / checked count / deferred count: 39 rows
  after justified cmdk/cn proof and depset build config; 39 checked, 0 deferred
- Plite/Plate gap ledger: record every blocker or explicit N/A
- broad Core drift ledger gate: N/A; broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plate-next-udecode-cmdk-cn-depset-package-reviews.md`

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
- allowed edit scope: the three named packages plus the smallest owner needed
  to remove a proven blocker; plan and changeset only when required
- package/API surfaces: `packages/udecode/cmdk`, `packages/udecode/cn`, and
  `packages/udecode/depset`
- docs/browser surfaces: package README files are reviewed but not rewritten
  unless source/API drift requires it; app/docs/browser proof is out of scope
- non-goals: no fourth package, no broad Core sweep, no unrelated caller
  migration, no rename pass, no generated registry/template work
- out-of-scope package errors: record and do not patch unless caused by this packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- This packet uses per-package manifests, focused source reads, counted audits,
  and excludes `dist`, `node_modules`, coverage, and `.turbo` output.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | exact 36-file baseline and sequential scope recorded | cmdk |
| Package review | complete | cmdk 11/11, cn 12/12, depset 16/16 at score 100 | proof |
| Aggregate proof | complete | lint, source-first typecheck, 20 tests, builds, CLI/declaration audits green | review |
| Autoreview | complete | scoped helper exited clean with zero actionable findings | checker |

Blocked condition:
- Stop only when a required public API/owner decision cannot be derived from
  current source and `origin/main`, or focused proof repeatedly fails in an
  owner outside the allowed package scope.

Current verdict:
- verdict: keep all three packages in their generic udecode owners after scoped cleanup
- confidence: 1.0
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: 39/39 rows close at 100; aggregate proof and scoped autoreview are clean

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exactly three next packages; sequential closure; stop before a fourth. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read in full. |
| Active goal checked or created | yes | Active goal created with this plan path. |
| Mode classified as named packet vs broad Core sweep | yes | Sequential three-package review; broad Core sweep N/A. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Recorded above; generic udecode packages must not acquire Plate/Plite glue. |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested. |
| Source of truth and allowed workspace recorded | yes | Current checkout plus `origin/main`; exact package boundaries recorded above. |
| Output budget strategy recorded | yes | Per-package manifests and capped reads; generated output excluded. |
| Public API fork routing checked | yes | No fork known at checkpoint zero; reopen if source audit exposes one. |
| Gap policy checked | yes | Missing owner capability becomes an explicit gap, not local compatibility code. |
| Related scoped sweep policy checked | yes | Same-class searches stay inside the active package. |
| Review-mode rename freeze checked | yes | Current paths/names frozen. |
| Package review checklist initialized when in scope | yes | 36 initial tracked rows materialized; three justified new proof/tooling rows bring final parity to 39. |

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
- [x] `pnpm brl` is run when exports/barrels change.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | aggregate lint/typecheck/20 tests/build passed for all three packages |
| Broad Core drift ledger coverage | no | N/A: broad Core sweep not requested | exact package manifests own this packet |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 39/39 score 100; 0 unchecked; 0 deferred |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | three recommendation rows resolved |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | explicit N/A row for every package |
| Related scoped sweep after correction | yes | For each correction, run and record same-class search/review results inside the active scope | three scoped sweep rows; zero remaining matches |
| Package file checklist | yes | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | cmdk 11, cn 12, depset 16; exact 39-row parity |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | all package commands green |
| Shared Core gate coverage | no | N/A: generic udecode packages expose no editor/Core API | `check:core` unchanged |
| Non-Core package error triage | yes | Classify proof failures | all failures were scoped formatting/type/test/build issues and resolved |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | explicit-any, suppression, unsafe-exec, and Plate-import audits closed |
| Rename ledger | no | N/A: no rename proposed or postponed | current paths retained |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | three files inventoried as justified proof/tooling |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs or record N/A | scoped local autoreview clean; 0 accepted/actionable findings; confidence 0.84 |
| Final lint/check | yes | Run scoped lint/check or record N/A | aggregate lint and source-first typecheck passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | populated below; no user blocker |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plate-next-udecode-cmdk-cn-depset-package-reviews.md` | final rerun passed after resolving the phase table and evidence row |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/udecode/cmdk` | 0 | main-parity-cleanup | cmdk fork/runtime | 11/11 rows at 100; 3 tests; lint/typecheck/build pass | closed |
| `packages/udecode/cn` | 0 | main-parity-cleanup | cn public HOCs | 12/12 rows at 100; 5 tests; clean declarations; lint/typecheck/build pass | closed |
| `packages/udecode/depset` | 0 | main-parity-cleanup | depset CLI | 16/16 rows at 100; 12 tests; safe process execution; lint/typecheck/build/CLI smoke pass | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| cmdk fork | Keep cmdk behavior and public exports; remove type escapes and make selected-item ARIA state reactive | `any`, TS suppressions, stale render-time DOM memo, Plate/Plite wrappers | Generic command-menu runtime has no editor ownership; React boundary stays local and typed | none |
| cn helpers | Keep `cn`, `withCn`, `withProps`, and `withVariants`; make their public inference real and preserve refs/default/variant behavior | Hard-cutting documented APIs; `any` props; wrapper types that erase required props | Package has a distinct generic UI job and no Plate/Plite editor ownership | none |
| depset CLI | Keep the existing CLI owner; validate JSON/external inputs, execute binaries without a shell, respect explicit install authority, and split JS/DTS build tools under TS7 | Shell command strings, `any` package data, `--yes` implying install, declaration bundler crash | Existing owner is correct; fixes are local runtime, safety, and build-contract repairs | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | None for cmdk | No workaround needed | cmdk runtime | focused package proof | cmdk closed |
| N/A | None for cn | No workaround needed | cn package | focused package proof | cn closed |
| N/A | None for depset | No editor substrate/product gap exists | depset CLI | focused package proof | depset closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Remove cmdk type escapes and stale selected-item DOM memo | `packages/udecode/cmdk` | `rg -n 'as any|: any|<any>|@ts-ignore|@ts-expect-error|eslint-disable|platejs|@platejs/' packages/udecode/cmdk --glob '!**/dist/**' --glob '!**/CHANGELOG.md'` | 0 after patch | 1 runtime, 1 scorer, 1 proof file | 0 | none |
| Remove cn HOC type escapes | `packages/udecode/cn` | `rg -n 'as any|: any|<any>|@ts-ignore|@ts-expect-error|eslint-disable|\\bany\\b|@platejs/' packages/udecode/cn/src packages/udecode/cn/package.json` | 0 after patch | 3 HOC owners, 1 proof file | 0 | one documented CVA parameter-boundary assertion; declaration and runtime proof clean |
| Remove depset unsafe/type escapes | `packages/udecode/depset` | explicit-any audit plus `rg -n '\\bexec\\(|\\bexecSync\\(|execPromise|`npm view' packages/udecode/depset/src` | 0 after patch | CLI, error and test owners; build config | 0 | none |

Core drift ledger:
- Applies: no; broad Core sweep is outside this named package packet
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
| N/A | N/A | broad Core not requested | package manifests | package-scoped packet | N/A |

Package file checklist:
- Applies: yes
- Packages: `packages/udecode/cmdk`, `packages/udecode/cn`,
  `packages/udecode/depset`
- Manifest command: `git ls-files <package>` plus
  `git ls-files --others --exclude-standard <package>`, excluding generated
  `dist`, `node_modules`, coverage, and `.turbo` output
- Manifest owner: every tracked/untracked package file, including source,
  specs, package metadata, README/changelog/license, and TypeScript/build config
- Expected row count: 39 (cmdk 11, cn 12, depset 16)
- Actual row count: 39
- Checked score-100 count: 39
- Unchecked/deferred count: 0 / 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: all three packages closed; stop before a fourth package

Package file rows:
- [x] `packages/udecode/cmdk/.npmignore` — score: 100 — verdict: keep — owner: cmdk package — evidence: package artifact/build audit — next: closed
- [x] `packages/udecode/cmdk/CHANGELOG.md` — score: 100 — verdict: keep — owner: cmdk package — evidence: historical metadata only; source API unchanged — next: closed
- [x] `packages/udecode/cmdk/README.md` — score: 100 — verdict: keep — owner: cmdk package — evidence: public hook description matches exports — next: closed
- [x] `packages/udecode/cmdk/package.json` — score: 100 — verdict: keep — owner: cmdk package — evidence: direct dependency/import audit and build passed — next: closed
- [x] `packages/udecode/cmdk/src/cmdk.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling — owner: cmdk runtime proof — evidence: selected-item ARIA regression passes — next: closed
- [x] `packages/udecode/cmdk/src/cmdk.tsx` — score: 100 — verdict: main-parity-cleanup — owner: cmdk runtime — evidence: zero explicit any/suppressions; typed contexts/store/refs; live ARIA selection test passes — next: closed
- [x] `packages/udecode/cmdk/src/index.ts` — score: 100 — verdict: keep — owner: cmdk exports — evidence: barrel and build passed — next: closed
- [x] `packages/udecode/cmdk/src/internal/command-score.spec.ts` — score: 100 — verdict: keep — owner: cmdk scoring proof — evidence: focused scorer cases pass — next: closed
- [x] `packages/udecode/cmdk/src/internal/command-score.ts` — score: 100 — verdict: main-parity-cleanup — owner: cmdk scoring — evidence: recursive scorer fully typed; behavior tests pass — next: closed
- [x] `packages/udecode/cmdk/tsconfig.build.json` — score: 100 — verdict: keep — owner: cmdk build config — evidence: source-root artifact build passed — next: closed
- [x] `packages/udecode/cmdk/tsconfig.json` — score: 100 — verdict: keep — owner: cmdk typecheck config — evidence: source-first typecheck passed — next: closed
- [x] `packages/udecode/cn/.npmignore` — score: 100 — verdict: keep — owner: cn package — evidence: package artifact/build audit — next: closed
- [x] `packages/udecode/cn/CHANGELOG.md` — score: 100 — verdict: keep — owner: cn package — evidence: historical metadata only; current API proof is package-local — next: closed
- [x] `packages/udecode/cn/README.md` — score: 100 — verdict: keep — owner: cn package — evidence: package purpose and docs link match exports — next: closed
- [x] `packages/udecode/cn/package.json` — score: 100 — verdict: keep — owner: cn package — evidence: direct imports/peers match source and build — next: closed
- [x] `packages/udecode/cn/src/cn.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling — owner: cn public API proof — evidence: 5 inference/runtime/ref/variant tests pass — next: closed
- [x] `packages/udecode/cn/src/cn.ts` — score: 100 — verdict: keep — owner: cn runtime — evidence: Tailwind conflict regression passes — next: closed
- [x] `packages/udecode/cn/src/index.tsx` — score: 100 — verdict: keep — owner: cn exports — evidence: barrel and artifact build pass — next: closed
- [x] `packages/udecode/cn/src/withCn.tsx` — score: 100 — verdict: main-parity-cleanup — owner: cn component utility — evidence: required props and intrinsic class inference pass without any — next: closed
- [x] `packages/udecode/cn/src/withProps.tsx` — score: 100 — verdict: main-parity-cleanup — owner: cn component utility — evidence: typed default props, class merging, ref forwarding, clean declaration output — next: closed
- [x] `packages/udecode/cn/src/withVariants.tsx` — score: 100 — verdict: main-parity-cleanup — owner: cn component utility — evidence: typed public props; only CVA external-boundary assertion remains documented; runtime filtering passes — next: closed
- [x] `packages/udecode/cn/tsconfig.build.json` — score: 100 — verdict: keep — owner: cn build config — evidence: source-root artifact build passed — next: closed
- [x] `packages/udecode/cn/tsconfig.json` — score: 100 — verdict: keep — owner: cn typecheck config — evidence: source-first typecheck passed — next: closed
- [x] `packages/udecode/depset/CHANGELOG.md` — score: 100 — verdict: keep — owner: depset package — evidence: historical metadata only; release delta covered by changeset — next: closed
- [x] `packages/udecode/depset/LICENSE` — score: 100 — verdict: keep — owner: depset package — evidence: package licensing unchanged — next: closed
- [x] `packages/udecode/depset/README.md` — score: 100 — verdict: keep — owner: depset package — evidence: `--yes` and `--install` contract matches repaired runtime — next: closed
- [x] `packages/udecode/depset/package.json` — score: 100 — verdict: main-parity-cleanup — owner: depset package — evidence: direct dependencies audited; test script added; TS7 build passes; homepage fixed — next: closed
- [x] `packages/udecode/depset/src/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: depset CLI — evidence: typed package/npm/CLI boundaries; `execFile` safety; install policy matches flags; CLI smoke passes — next: closed
- [x] `packages/udecode/depset/src/utils/get-package-manager.spec.ts` — score: 100 — verdict: proof — owner: package-manager proof — evidence: typed detector contract; 5 tests pass — next: closed
- [x] `packages/udecode/depset/src/utils/get-package-manager.ts` — score: 100 — verdict: keep — owner: package-manager detection — evidence: detector and fallback cases pass — next: closed
- [x] `packages/udecode/depset/src/utils/handle-error.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: error-handling proof — evidence: typed never-return exit mock; 3 tests pass — next: closed
- [x] `packages/udecode/depset/src/utils/handle-error.ts` — score: 100 — verdict: main-parity-cleanup — owner: error handling — evidence: true `never` contract and cast-free Zod formatting; tests pass — next: closed
- [x] `packages/udecode/depset/src/utils/logger.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: logger proof — evidence: typed console mock; 2 tests pass — next: closed
- [x] `packages/udecode/depset/src/utils/logger.ts` — score: 100 — verdict: keep — owner: logger — evidence: focused logger proof passes — next: closed
- [x] `packages/udecode/depset/src/utils/spinner.spec.ts` — score: 100 — verdict: proof — owner: spinner proof — evidence: 2 tests pass — next: closed
- [x] `packages/udecode/depset/src/utils/spinner.ts` — score: 100 — verdict: keep — owner: spinner — evidence: typed ora delegation and tests pass — next: closed
- [x] `packages/udecode/depset/tsconfig.build.json` — score: 100 — verdict: justify-new-proof-tooling — owner: depset declaration build — evidence: TS7 declaration emit passes and excludes specs — next: closed
- [x] `packages/udecode/depset/tsconfig.json` — score: 100 — verdict: keep — owner: depset typecheck config — evidence: source-first typecheck passes — next: closed
- [x] `packages/udecode/depset/tsdown.config.ts` — score: 100 — verdict: main-parity-cleanup — owner: depset JS build — evidence: TS7-incompatible bundled DTS disabled; JS plus tsc declarations build passes — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| cmdk | command runtime | Fork type escapes hid stale selected-item ARIA state | 11 rows plus focused test/lint/typecheck/build | keep cleanup | closed |
| cn | public React HOCs | `any` erased prop/ref/variant inference | 12 rows plus declaration/runtime proof | keep typed API | closed |
| depset | CLI | Untyped external data and shell execution hid unsafe behavior/build drift | 16 rows plus CLI/test/build proof | keep safe CLI owner | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/udecode/cmdk/src/cmdk.spec.tsx` | justify-new-proof-tooling | no `origin/main` file; behavior owner is `src/cmdk.tsx` | keep colocated regression proof | selected-item ARIA test passes; typecheck/lint pass |
| `packages/udecode/cn/src/cn.spec.tsx` | justify-new-proof-tooling | no `origin/main` file; proof covers the four exported helpers | keep consolidated public API proof | 5 tests, typecheck, lint, and build pass |
| `packages/udecode/depset/tsconfig.build.json` | justify-new-proof-tooling | no `origin/main` file; TS7 plan names `tsc` as declaration owner | keep dedicated declaration config | build emits runtime declarations, zero spec declarations |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | No unresolved out-of-scope proof failure | Aggregate package graph passed | N/A |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Generic React helper type escapes | `packages/udecode/react-utils` | Future workspace package; cn only re-exports it and no cn correction requires changing its owner | review `@udecode/react-utils` in its own package packet |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Typed cmdk runtime/scorer and reactive selected-item ARIA; typed cn HOCs; validated/shell-safe depset CLI with explicit install authority and TS7 declarations |
| tests/proof | New cmdk ARIA and cn HOC regression files; typed depset mocks; aggregate 20-test proof; CLI and declaration smoke |
| docs/templates/skills | This goal plan and one patch changeset per published package; no docs/templates/skills edited |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | none | packet has no unresolved decision or blocker | three closed package ledgers | continue with `packages/udecode/react-hotkeys` next |

Findings:
- Completed package ledgers already cover `packages/utils`; the next untouched
  workspace packages after Toggle are `packages/udecode/cmdk`,
  `packages/udecode/cn`, and `packages/udecode/depset`.
- Manifest parity is exact at checkpoint zero: 36 tracked files, 0 untracked,
  and 36 `origin/main` paths.
- Cmdk inherited explicit `any`, TS suppressions, and a file-wide hook lint
  suppression from its fork. The selected-item DOM id was memoized once before
  the list existed, so `aria-activedescendant` could remain stale.
- Cn's three public HOCs erased props through `any`; the repaired signatures
  preserve required props, intrinsic props, refs, variant props, and generated
  declaration readability.
- Depset's green typecheck hid unvalidated package/npm data, shell interpolation
  of user input, an install-authority bug, and a reproducible TS7 declaration
  bundler crash.

Decisions and tradeoffs:
- Preserve cmdk public/runtime behavior while typing its actual state, context,
  scorer, ref, and slot boundaries; add one colocated regression file because
  the ARIA bug had no existing behavior proof.
- Keep cn's documented HOC surface and fix its owning generics; the single
  `PropsWithoutRef` to CVA parameter assertion is an external generic boundary,
  documented inline and backed by public API tests.
- Keep depset in one CLI owner file; use Zod at data/Commander boundaries,
  `execFile`/`execFileSync` for processes, and the repo's accepted tsdown-JS +
  tsc-declaration split instead of creating algorithm helper files.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial combined import audit had an invalid zsh bracket pattern | 1 | Run simpler literal `rg` audits | resolved |
| New cmdk TSX test lacked the classic JSX React import | 1 | Import React explicitly | resolved; test passes |
| Jest-DOM matcher types were not in package typecheck scope | 1 | Assert the raw attribute value | resolved; typecheck passes |
| Cn `withProps` overloads tripped the unified-signature lint rule | 1 | Use one explicit union signature and a named return type | resolved; lint and declaration build pass |
| Testing Library role query returns `HTMLElement` | 1 | Narrow with `instanceof HTMLButtonElement` | resolved without casts; typecheck passes |
| Depset baseline build crashed in `rolldown-plugin-dts` under TS7 | 1 | Reuse the accepted TS7 split: tsdown JS with DTS disabled, then `tsc` declarations | resolved; artifact build passes |
| Typed `@antfu/ni` mock rejected impossible `null`/`pnpm@10` fixtures | 1 | Align fixtures with the dependency's actual `Agent | undefined` contract | resolved; 12 tests pass |
| Built depset CLI exposed the wrong Commander action callback boundary | 1 | Parse Commander's third parsed-options argument directly instead of calling `.opts()` on it | resolved; end-to-end update/no-install proof passes |

Verification evidence:
- cmdk: `pnpm --filter @udecode/cmdk lint` passed (8 files).
- cmdk: `pnpm turbo typecheck --filter=./packages/udecode/cmdk` passed.
- cmdk: `pnpm --filter @udecode/cmdk test` passed (3 tests).
- cmdk: `pnpm --filter @udecode/cmdk build` passed.
- cmdk stale/type audit returned zero matches after patch.
- cn: `pnpm --filter @udecode/cn lint` passed (9 source/test files).
- cn: `pnpm turbo typecheck --filter=./packages/udecode/cn` passed, including
  source dependency builds for `@udecode/utils` and `@udecode/react-utils`.
- cn: `pnpm --filter @udecode/cn test` passed (5 tests).
- cn: `pnpm --filter @udecode/cn build` passed; public declarations preserve
  named `WithPropsComponent` and `WithVariantsProps` contracts.
- cn type-escape audit returned zero matches after patch.
- depset: `pnpm --filter depset lint` passed (13 source/config files).
- depset: `pnpm turbo typecheck --filter=./packages/udecode/depset` passed.
- depset: `pnpm --filter depset test` passed (12 tests).
- depset: `pnpm --filter depset build` passed; JS and declarations emitted,
  with zero spec declaration artifacts.
- depset: built `--help` and `--version` smoke passed (`0.1.2`).
- depset: end-to-end fake-npm CLI proof updated `1.0.0` to `2.0.0` under
  `--yes`, exited 0, and confirmed install was not invoked.
- depset: explicit-any and shell-string execution audits returned zero matches;
  `npm view 'kleur@<=4.1.5' version --json` confirmed the safe argument shape.
- aggregate: `pnpm --filter @udecode/cmdk --filter @udecode/cn --filter depset lint`,
  tests, builds, and combined Turbo source-first typecheck passed; 20 tests total.
- review: `.agents/skills/autoreview/scripts/autoreview --mode local --prompt
  "Scope is strictly ..." --stream-engine-output` exited clean with zero
  accepted/actionable findings (confidence 0.84).

Final handoff contract:
- target surface and mode: sequential package review for cmdk, cn, depset
- files/APIs reviewed: all 39 package rows and every public/runtime owner touched
- broad Core drift score coverage: N/A; generic udecode packages, no Core sweep
- package file checklist coverage: 39/39 score 100; 0 missing/extra/unchecked/deferred
- best Plate v2 recommendation: retain generic owners; delete type/safety drift; add no Plate/Plite wrapper
- verdict matrix summary: three cleanup packets kept and closed
- Plite/Plate gaps or blockers: none; three explicit N/A rows
- related scoped sweep query/active scope/matches/patched/deferred: three rows; zero remaining scoped matches; zero deferred
- out-of-scope matches discovered: generic type escapes remain in future `@udecode/react-utils` owner
- changes made: runtime/API typing, ARIA correctness, process safety, install policy, TS7 declaration build, proof
- tests/proof commands: aggregate lint, source-first typecheck, 20 tests, three builds, CLI/declaration/audit smoke
- old compatibility names audited: N/A; no compatibility name was cut
- needs attention: none
- next best Plate Next packet: `packages/udecode/react-hotkeys`; not started

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | All three packages and final review closed; checker remains |
| Where am I going? | Mechanical closeout only |
| What is the goal? | Close all 39 final rows at score 100 or explicit deferral, then pass proof/review/checker. |
| What have I learned? | All three packages hid real defects behind green baseline checks: stale ARIA state, erased HOC inference, and unsafe CLI/install/build boundaries. |
| What have I done? | Closed all 39 rows at score 100 and added one patch changeset per published package. |

Timeline:
- 2026-07-13T17:40:23.898Z Goal plan created.
- 2026-07-13 Checkpoint zero closed: requirements, boundaries, goal, vision,
  and exact 36-file manifest recorded before package source review.
- 2026-07-13 Cmdk closed: 11/11 rows at 100; explicit type escapes removed;
  selected-item ARIA regression added; lint/typecheck/3 tests/build passed.
- 2026-07-13 Cn closed: 12/12 rows at 100; public HOC inference repaired;
  lint/typecheck/5 tests/build and declaration audit passed.
- 2026-07-13 Depset closed: 16/16 rows at 100; typed data/process boundaries,
  install authority, TS7 build, 12 tests, CLI smoke, and audits passed.
- 2026-07-13 Final aggregate proof passed; real depset CLI update/no-install
  proof passed; scoped autoreview returned zero accepted/actionable findings.

Open risks:
- No active risk blocks this packet. Generic helper type escapes in
  `packages/udecode/react-utils` remain outside scope for a future package review.
