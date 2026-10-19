# plate-next udecode react-hotkeys react-utils utils package reviews

Objective:
Close udecode react-hotkeys, react-utils, and utils reviews; done when every
package row scores 100 or is explicitly deferred and proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-13-plate-next-udecode-react-hotkeys-react-utils-utils-package-reviews.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user invoked `plate-next` and requested the next three packages
- mode: sequential package review
- target surface: `packages/udecode/react-hotkeys`, then
  `packages/udecode/react-utils`, then `packages/udecode/utils`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, inside the active package
- package review mode: yes
- package review target: every tracked and untracked file in the three packages
- package file checklist gate: one row per file; `[x]` only at score `100`;
  explicit deferrals remain unchecked with owner and proof needed
- completion threshold summary: close react-hotkeys before react-utils and
  react-utils before udecode/utils; all 88 rows score 100 or are explicitly
  deferred; stop before any fourth package

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
- improvement loop: review and close react-hotkeys, then react-utils, then utils
- final score / loop closure: 3 of 3 packages closed; 88/88 rows at 100

Completion threshold:
- All 88 react-hotkeys, react-utils, and udecode/utils rows score `100` or carry
  an explicit deferral with reason, owner, proof needed, and next action;
  package lint, source-first typecheck, tests, build, source audits, autoreview,
  and the final checker pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plate-next-udecode-react-hotkeys-react-utils-utils-package-reviews.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package lint, source-first typecheck, tests, and build
- package proof: package-local proof for all three named packages
- shared Core gate: N/A unless a Core/Plite owner changes; these are generic utility packages
- source audits: `origin/main` owner parity, direct dependency ownership,
  type escapes, stale compatibility, unsafe casts, and extracted files
- related scoped sweep query / active scope / match count / patched count / deferred count:
  exact lifecycle/type-escape/removed-symbol/caller audits across each active package; 0 active-package deferrals
- package file manifest / row count / checked count / deferred count: 88 rows,
  initially 0 checked and 0 deferred
- Plite/Plate gap ledger: record every blocker or explicit N/A
- broad Core drift ledger gate: N/A; broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plate-next-udecode-react-hotkeys-react-utils-utils-package-reviews.md`

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
  to remove a proven blocker; plan and changesets only when required
- package/API surfaces: `packages/udecode/react-hotkeys`,
  `packages/udecode/react-utils`, `packages/udecode/utils`
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

Blocked condition:
- Stop only when a required public API/owner decision cannot be derived from
  current source and `origin/main`, or focused proof repeatedly fails in an
  owner outside the allowed package scope.

Current verdict:
- verdict: exactly three packages closed; packet complete
- confidence: 1.0
- next owner: user
- keep / revert / quarantine call: keep all three cleanup packets
- reason: every initial package row scores 100; no fourth package was opened

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | exact 88-file baseline, goal, vision, boundaries, and sequential scope recorded | react-hotkeys |
| react-hotkeys review | complete | 21 reviewed rows at 100: 20 live files plus 1 hard-cut; lint, typecheck, 25 tests, and build pass | react-utils |
| react-utils review | complete | 37 reviewed rows at 100: 29 live files plus 8 hard-cuts; lint, typecheck, 37 tests, build, declarations, and consumer proof complete | udecode/utils |
| udecode/utils review | complete | 30 reviewed rows at 100: 24 live files plus 6 hard-cuts; lint, typecheck, 56 tests, build, declarations, and barrel pass | aggregate proof |
| Aggregate proof and autoreview | complete | aggregate lint/typecheck, 119 tests, three builds, changeset validation, and clean scoped autoreview | mechanical checker |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exactly three next untouched packages; sequential closure; stop before a fourth. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read in full. |
| Active goal checked or created | yes | New active goal created with this plan path. |
| Mode classified as named packet vs broad Core sweep | yes | Sequential three-package review; broad Core sweep N/A. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Generic udecode packages must not acquire Plate/Plite glue. |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested. |
| Source of truth and allowed workspace recorded | yes | Current checkout plus `origin/main`; exact package boundaries recorded above. |
| Output budget strategy recorded | yes | Per-package manifests and capped reads; generated output excluded. |
| Public API fork routing checked | yes | No fork known at checkpoint zero; route to `plate-plan` if source audit exposes one. |
| Gap policy checked | yes | Missing owner capability becomes an explicit gap, not local compatibility code. |
| Related scoped sweep policy checked | yes | Same-class searches stay inside the active package. |
| Review-mode rename freeze checked | yes | Current paths/names frozen. |
| Package review checklist initialized when in scope | yes | Exact 88-file manifest materialized before source review. |

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
| Named verification threshold | yes | Run the proof commands named in this plan | all three package lints, combined source-first typecheck, 119 tests, and three builds pass |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A; broad Core review was not requested |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 88/88 initial rows score 100; 0 deferred |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | three package recommendations recorded below |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | N/A rows recorded; generic packages need no editor capability |
| Related scoped sweep after correction | yes | For each correction, run and record same-class search/review results inside the active scope | exact lifecycle, type-escape, removed-symbol, caller, and declaration audits recorded |
| Package file checklist | yes | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | 88 expected/actual, 88 checked, 0 missing/extra/deferred/untracked |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | package and aggregate proof pass |
| Shared Core gate coverage | no | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | generic udecode packages; no Core/Plite owner changed |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | media and legacy-list-model/resizable failures recorded by owner |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | removed exports have zero package-import callers; declaration indexes are clean |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | no rename proposed or deferred |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | 0 package-untracked files; exact origin/main manifest parity |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs or record N/A | first run found unstable returned ref; fixed and rerun exited clean with no findings |
| Final lint/check | yes | Run scoped lint/check or record N/A | aggregate lint/typecheck/tests/builds and changeset status pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | ledgers complete below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plate-next-udecode-react-hotkeys-react-utils-utils-package-reviews.md` | checker exits 0 with `[autogoal] complete` |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| react-hotkeys package | 100 | keep cleaned owner shape; hard-cut render-phase ref helper | `@udecode/react-hotkeys` | source audit, 26 tests, lint, source-first typecheck, build, clean rerun review | closed |
| react-utils package | 100 | keep typed live primitives/listeners; hard-cut four obsolete exports and their proof files | `@udecode/react-utils` | source audit, 37 tests, lint, source-first and consumer typechecks, build/declarations | closed |
| udecode/utils package | 100 | keep small generic owners; hard-cut unused runtime helpers and obsolete aliases | `@udecode/utils` | exact caller/type-escape audits, 56 tests, lint, source-first typecheck, build/declarations | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| react-hotkeys | Keep listener logic in `useHotkeys`; synchronize callback/options after render; preserve explicit identity only at DOM/context boundaries | render-phase ref mutation, broad DOM casts, lint suppression, compatibility helper extraction | React 18-safe lifecycle and dependency semantics remain local and tested | no |
| react-utils | Keep primitive/ref/listener behavior in existing owners with inferred public generics; cut effect/memo/forwardRef wrappers with no repo callers | broad `any`, render-phase ref writes, post-render selector/memo state, helper preservation for compatibility | live APIs become stricter and lifecycle-correct without new helper files | no |
| udecode/utils | Keep the narrow generic utilities in their existing owners and hard-cut unused runtime/type exports | unchecked generic plumbing, compatibility aliases, and new helper files | live APIs infer cleanly; dead public surface has no repository callers | no |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | no Plate/Plite capability needed | local bridge would be needless coupling | generic udecode package | package-local proof | closed |
| N/A | no Plate/Plite capability needed by react-utils | weakening types to hide an invalid media caller would be a local workaround | media caller owns its event/ref correction | media package typecheck after its migration cleanup | package closed; caller recorded out of scope |
| N/A | no Plate/Plite capability needed by udecode/utils | adding editor-aware wrappers would couple a generic package to the wrong owner | generic utility package | package-local and consumer proof | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| render-phase ref writes, explicit `any`, suppressions, deleted helper references | `packages/udecode/react-hotkeys` | `rg` exact source/test audit | 0 remaining | runtime, tests, and package README corrected | 0 | none |
| broad type escapes, suppressions, render-phase ref writes, obsolete exports | `packages/udecode/react-utils` | exact `rg`, declaration inspection, caller search | 4 obsolete source exports plus 4 proof files; live type/lifecycle matches repaired | 8 hard-cuts and 15 live-owner/proof corrections | 0 in active package | one invalid media image event handler recorded outside scope |
| unused runtime helpers, obsolete type aliases, unchecked generic plumbing | `packages/udecode/utils` | exact symbol/caller/type-escape audits plus declaration inspection | 2 runtime helpers, 2 specs, 2 type files, 14 dead aliases/helpers, and 5 live type/runtime owners | 6 file hard-cuts plus live-owner cleanup | 0 in active package | intentional `AnyObject` escape hatch remains explicitly documented |

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
- Packages: `packages/udecode/react-hotkeys`, `packages/udecode/react-utils`,
  `packages/udecode/utils`
- Manifest command: `git ls-files <package>` plus
  `git ls-files --others --exclude-standard <package>`, excluding generated output
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 88 (react-hotkeys 21, react-utils 37, utils 30)
- Actual row count: 88
- Checked score-100 count: 88
- Unchecked/deferred count: 0 / 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A; exactly three requested packages are closed and no fourth package was opened

Package file rows:
- [x] `packages/udecode/react-hotkeys/.npmignore` — score: 100 — verdict: keep — owner: react-hotkeys package — evidence: package artifact exclusions match package build output — next: closed
- [x] `packages/udecode/react-hotkeys/CHANGELOG.md` — score: 100 — verdict: keep — owner: react-hotkeys package — evidence: origin/main owner parity; source/package audit; focused proof — next: closed
- [x] `packages/udecode/react-hotkeys/README.md` — score: 100 — verdict: main-parity-cleanup — owner: package docs — evidence: stale react-utils route replaced with verified plugin-shortcuts route — next: closed
- [x] `packages/udecode/react-hotkeys/package.json` — score: 100 — verdict: keep — owner: package metadata — evidence: React peers retained; compiler runtime proven in built JS; scripts and exports pass — next: closed
- [x] `packages/udecode/react-hotkeys/src/index.tsx` — score: 100 — verdict: keep — owner: react-hotkeys package — evidence: origin/main owner parity; source/package audit; focused proof — next: closed
- [x] `packages/udecode/react-hotkeys/src/internal/BoundHotkeysProxyProvider.tsx` — score: 100 — verdict: main-parity-cleanup — owner: react-hotkeys runtime — evidence: typed/runtime owner preserved; explicit external identity boundary; lint/typecheck/tests/build pass — next: closed
- [x] `packages/udecode/react-hotkeys/src/internal/HotkeysProvider.spec.tsx` — score: 100 — verdict: proof — owner: colocated package proof — evidence: 25 package tests pass; callback dependencies, latest callback, disable lifecycle, validators and pressed keys covered — next: closed
- [x] `packages/udecode/react-hotkeys/src/internal/HotkeysProvider.tsx` — score: 100 — verdict: main-parity-cleanup — owner: react-hotkeys runtime — evidence: typed/runtime owner preserved; explicit external identity boundary; lint/typecheck/tests/build pass — next: closed
- [x] `packages/udecode/react-hotkeys/src/internal/deepEqual.ts` — score: 100 — verdict: main-parity-cleanup — owner: react-hotkeys runtime — evidence: typed/runtime owner preserved; explicit external identity boundary; lint/typecheck/tests/build pass — next: closed
- [x] `packages/udecode/react-hotkeys/src/internal/isHotkeyPressed.spec.ts` — score: 100 — verdict: proof — owner: colocated package proof — evidence: 25 package tests pass; callback dependencies, latest callback, disable lifecycle, validators and pressed keys covered — next: closed
- [x] `packages/udecode/react-hotkeys/src/internal/isHotkeyPressed.ts` — score: 100 — verdict: keep — owner: react-hotkeys package — evidence: origin/main owner parity; source/package audit; focused proof — next: closed
- [x] `packages/udecode/react-hotkeys/src/internal/key.ts` — score: 100 — verdict: keep — owner: generated key catalog — evidence: generated const catalog/source/export audit; declaration build pass — next: closed
- [x] `packages/udecode/react-hotkeys/src/internal/parseHotkeys.ts` — score: 100 — verdict: keep — owner: react-hotkeys package — evidence: origin/main owner parity; source/package audit; focused proof — next: closed
- [x] `packages/udecode/react-hotkeys/src/internal/types.ts` — score: 100 — verdict: main-parity-cleanup — owner: public hotkey types — evidence: nested combinations accept readonly input; clean declarations and typecheck — next: closed
- [x] `packages/udecode/react-hotkeys/src/internal/useDeepEqualMemo.ts` — score: 100 — verdict: hard-cut — owner: obsolete hook — evidence: render-phase ref mutation removed; React-18-safe synchronization moved into owning useHotkeys algorithm — next: closed
- [x] `packages/udecode/react-hotkeys/src/internal/useHotkeys.ts` — score: 100 — verdict: main-parity-cleanup — owner: hotkey listener algorithm — evidence: dependency contract preserved without suppression/render ref writes/DOM any casts; callback/options tests pass — next: closed
- [x] `packages/udecode/react-hotkeys/src/internal/useRecordHotkeys.ts` — score: 100 — verdict: main-parity-cleanup — owner: react-hotkeys runtime — evidence: typed/runtime owner preserved; explicit external identity boundary; lint/typecheck/tests/build pass — next: closed
- [x] `packages/udecode/react-hotkeys/src/internal/validators.spec.ts` — score: 100 — verdict: proof — owner: colocated package proof — evidence: 25 package tests pass; callback dependencies, latest callback, disable lifecycle, validators and pressed keys covered — next: closed
- [x] `packages/udecode/react-hotkeys/src/internal/validators.ts` — score: 100 — verdict: main-parity-cleanup — owner: react-hotkeys runtime — evidence: typed/runtime owner preserved; explicit external identity boundary; lint/typecheck/tests/build pass — next: closed
- [x] `packages/udecode/react-hotkeys/tsconfig.build.json` — score: 100 — verdict: keep — owner: package build config — evidence: existing source root preserved; build emits clean declarations — next: closed
- [x] `packages/udecode/react-hotkeys/tsconfig.json` — score: 100 — verdict: keep — owner: react-hotkeys package — evidence: origin/main owner parity; source/package audit; focused proof — next: closed
- [x] `packages/udecode/react-utils/.npmignore` — score: 100 — verdict: keep — owner: react-utils package — evidence: artifact exclusions match the clean declaration build — next: closed
- [x] `packages/udecode/react-utils/CHANGELOG.md` — score: 100 — verdict: keep — owner: package history — evidence: source audit only; release delta is owned by a new package changeset — next: closed
- [x] `packages/udecode/react-utils/README.md` — score: 100 — verdict: keep — owner: package docs — evidence: current `/docs/api/react-utils` route exists and listed live APIs remain exported — next: closed
- [x] `packages/udecode/react-utils/package.json` — score: 100 — verdict: keep — owner: package metadata — evidence: peer/dependency/export audit and built compiler-runtime import pass — next: closed
- [x] `packages/udecode/react-utils/src/Box.tsx` — score: 100 — verdict: keep — owner: primitive components — evidence: slot factory types, declarations, and tests pass — next: closed
- [x] `packages/udecode/react-utils/src/MemoizedChildren.tsx` — score: 100 — verdict: keep — owner: memo boundary — evidence: active registry consumer audit and package build pass — next: closed
- [x] `packages/udecode/react-utils/src/PortalBody.spec.tsx` — score: 100 — verdict: proof — owner: colocated package proof — evidence: body and custom-container cases pass — next: closed
- [x] `packages/udecode/react-utils/src/PortalBody.tsx` — score: 100 — verdict: main-parity-cleanup — owner: portal runtime — evidence: precedence/SSR guard fixed without return cast; tests and declarations pass — next: closed
- [x] `packages/udecode/react-utils/src/Text.tsx` — score: 100 — verdict: keep — owner: primitive components — evidence: slot factory types, declarations, and tests pass — next: closed
- [x] `packages/udecode/react-utils/src/composeEventHandlers.spec.ts` — score: 100 — verdict: proof — owner: colocated package proof — evidence: handler order/default prevention cases pass without fake-event casts — next: closed
- [x] `packages/udecode/react-utils/src/composeEventHandlers.ts` — score: 100 — verdict: main-parity-cleanup — owner: event composition — evidence: structural event constraint removes double cast; tests/typecheck pass — next: closed
- [x] `packages/udecode/react-utils/src/createPrimitiveComponent.spec.tsx` — score: 100 — verdict: proof — owner: colocated package proof — evidence: state/options/props/style/ref/hidden-slot contracts pass — next: closed
- [x] `packages/udecode/react-utils/src/createPrimitiveComponent.tsx` — score: 100 — verdict: main-parity-cleanup — owner: primitive factory — evidence: inferred hook generics, precise refs, required options, data props, and hidden semantics build cleanly without any — next: closed
- [x] `packages/udecode/react-utils/src/createPrimitiveElement.spec.tsx` — score: 100 — verdict: proof — owner: colocated package proof — evidence: intrinsic props/ref cases pass without casts — next: closed
- [x] `packages/udecode/react-utils/src/createPrimitiveElement.tsx` — score: 100 — verdict: keep — owner: intrinsic primitive factory — evidence: source audit, precise declaration, and tests pass — next: closed
- [x] `packages/udecode/react-utils/src/createSlotComponent.spec.tsx` — score: 100 — verdict: proof — owner: colocated package proof — evidence: base/as/asChild/ref cases pass without casts — next: closed
- [x] `packages/udecode/react-utils/src/createSlotComponent.tsx` — score: 100 — verdict: main-parity-cleanup — owner: slot factory — evidence: component ref and props inference replace any/casts; tests/build pass — next: closed
- [x] `packages/udecode/react-utils/src/index.ts` — score: 100 — verdict: generated-barrel-cleanup — owner: package exports — evidence: package `brl` removes four hard-cut exports; declaration index matches — next: closed
- [x] `packages/udecode/react-utils/src/useComposedRef.spec.ts` — score: 100 — verdict: proof — owner: colocated package proof — evidence: object/callback/mixed/cleanup/null-capable ref cases pass without casts — next: closed
- [x] `packages/udecode/react-utils/src/useComposedRef.ts` — score: 100 — verdict: main-parity-cleanup — owner: ref composition — evidence: mutable React 19 refs and nullable callbacks typed directly; external identity boundary documented — next: closed
- [x] `packages/udecode/react-utils/src/useEffectOnce.spec.tsx` — score: 100 — verdict: hard-cut — owner: obsolete proof — evidence: tested only a redundant effect wrapper whose runtime discarded cleanup — next: closed
- [x] `packages/udecode/react-utils/src/useEffectOnce.ts` — score: 100 — verdict: hard-cut — owner: obsolete hook — evidence: zero repo callers; redundant effect wrapper discarded cleanup and hid dependencies — next: closed
- [x] `packages/udecode/react-utils/src/useIsomorphicLayoutEffect.ts` — score: 100 — verdict: keep — owner: React 18 SSR lifecycle — evidence: live stable-callback/listener owner; package and consumer proof pass — next: closed
- [x] `packages/udecode/react-utils/src/useMemoizedSelector.spec.tsx` — score: 100 — verdict: hard-cut — owner: obsolete proof — evidence: proof covered only the deleted post-render selector wrapper — next: closed
- [x] `packages/udecode/react-utils/src/useMemoizedSelector.ts` — score: 100 — verdict: hard-cut — owner: obsolete hook — evidence: zero repo callers; post-render state/effect selector returned stale values — next: closed
- [x] `packages/udecode/react-utils/src/useOnClickOutside.spec.tsx` — score: 100 — verdict: proof — owner: colocated package proof — evidence: nine listener/ref/callback/ignore/scrollbar cases pass — next: closed
- [x] `packages/udecode/react-utils/src/useOnClickOutside.ts` — score: 100 — verdict: main-parity-cleanup — owner: outside-click listener — evidence: typed DOM events, post-render callback sync, exact ref detach, passive cleanup, and readonly inputs pass — next: closed
- [x] `packages/udecode/react-utils/src/useStableFn.spec.tsx` — score: 100 — verdict: proof — owner: colocated package proof — evidence: stable identity/latest body/dependency identity contracts pass — next: closed
- [x] `packages/udecode/react-utils/src/useStableFn.ts` — score: 100 — verdict: main-parity-cleanup — owner: stable callback boundary — evidence: render-phase ref write removed; React 18 layout sync preserves dependency identity contract and core consumer typecheck — next: closed
- [x] `packages/udecode/react-utils/src/useStableMemo.spec.tsx` — score: 100 — verdict: hard-cut — owner: obsolete proof — evidence: proof covered only the deleted post-render memo wrapper — next: closed
- [x] `packages/udecode/react-utils/src/useStableMemo.ts` — score: 100 — verdict: hard-cut — owner: obsolete hook — evidence: zero repo callers; layout-effect state memo returned stale values and extra renders — next: closed
- [x] `packages/udecode/react-utils/src/withProviders.spec.tsx` — score: 100 — verdict: proof — owner: colocated package proof — evidence: nested provider order and props pass — next: closed
- [x] `packages/udecode/react-utils/src/withProviders.tsx` — score: 100 — verdict: main-parity-cleanup — owner: provider composition — evidence: typed readonly provider entries and React nodes replace broad any/casts/suppression — next: closed
- [x] `packages/udecode/react-utils/src/withRef.spec.tsx` — score: 100 — verdict: hard-cut — owner: obsolete proof — evidence: duplicate forwardRef wrapper had zero repo callers — next: closed
- [x] `packages/udecode/react-utils/src/withRef.tsx` — score: 100 — verdict: hard-cut — owner: obsolete wrapper — evidence: zero repo callers; wrapper existed only through broad forwardRef casts — next: closed
- [x] `packages/udecode/react-utils/tsconfig.build.json` — score: 100 — verdict: keep — owner: package build config — evidence: existing rootDir change preserved; clean declaration build passes — next: closed
- [x] `packages/udecode/react-utils/tsconfig.json` — score: 100 — verdict: keep — owner: package config — evidence: source-first package and consumer typechecks pass for in-scope live consumers — next: closed
- [x] `packages/udecode/utils/.npmignore` — score: 100 — verdict: keep — owner: package artifact config — evidence: exclusions match the clean build output — next: closed
- [x] `packages/udecode/utils/CHANGELOG.md` — score: 100 — verdict: keep — owner: package history — evidence: source audit only; release delta is owned by a new package changeset — next: closed
- [x] `packages/udecode/utils/README.md` — score: 100 — verdict: keep — owner: package docs — evidence: no stale API inventory or migration claim — next: closed
- [x] `packages/udecode/utils/package.json` — score: 100 — verdict: keep — owner: package metadata — evidence: scripts, exports, dependencies, and artifact build pass — next: closed
- [x] `packages/udecode/utils/src/environment.ts` — score: 100 — verdict: keep — owner: platform utility — evidence: live repository consumers and source audit — next: closed
- [x] `packages/udecode/utils/src/escapeRegexp.spec.ts` — score: 100 — verdict: proof — owner: colocated package proof — evidence: literal and regex-character behavior passes — next: closed
- [x] `packages/udecode/utils/src/escapeRegexp.ts` — score: 100 — verdict: keep — owner: string utility — evidence: live consumers, focused tests, and declarations pass — next: closed
- [x] `packages/udecode/utils/src/findHtmlParentElement.spec.ts` — score: 100 — verdict: proof — owner: colocated package proof — evidence: matching, traversal, miss, and null cases pass — next: closed
- [x] `packages/udecode/utils/src/findHtmlParentElement.ts` — score: 100 — verdict: keep — owner: DOM utility — evidence: live consumer audit and focused tests pass — next: closed
- [x] `packages/udecode/utils/src/getHandler.spec.ts` — score: 100 — verdict: hard-cut — owner: obsolete proof — evidence: only proved an unused callback wrapper with unchecked casts — next: closed
- [x] `packages/udecode/utils/src/getHandler.ts` — score: 100 — verdict: hard-cut — owner: obsolete runtime helper — evidence: zero repository callers; direct closures infer better and need no compatibility wrapper — next: closed
- [x] `packages/udecode/utils/src/hexToBase64.spec.ts` — score: 100 — verdict: hard-cut — owner: obsolete proof — evidence: only proved an unused browser-global encoding helper — next: closed
- [x] `packages/udecode/utils/src/hexToBase64.ts` — score: 100 — verdict: hard-cut — owner: obsolete runtime helper — evidence: zero package-import callers; docx owns a distinct local conversion algorithm — next: closed
- [x] `packages/udecode/utils/src/index.ts` — score: 100 — verdict: generated-barrel-cleanup — owner: package exports — evidence: package barrel and declaration index omit hard-cut runtime exports — next: closed
- [x] `packages/udecode/utils/src/isUrl.spec.ts` — score: 100 — verdict: proof — owner: colocated package proof — evidence: valid, invalid, non-string, and ReDoS cases pass — next: closed
- [x] `packages/udecode/utils/src/isUrl.ts` — score: 100 — verdict: main-parity-cleanup — owner: URL utility — evidence: unknown input replaces unchecked any; 36 cases pass — next: closed
- [x] `packages/udecode/utils/src/mergeProps.spec.ts` — score: 100 — verdict: proof — owner: colocated package proof — evidence: order, overrides, filters, argument forwarding, and null-query composition pass — next: closed
- [x] `packages/udecode/utils/src/mergeProps.ts` — score: 100 — verdict: main-parity-cleanup — owner: property composition utility — evidence: typed overload and Reflect application replace accumulator/function casts; declarations pass — next: closed
- [x] `packages/udecode/utils/src/sanitizeUrl.spec.ts` — score: 100 — verdict: proof — owner: colocated package proof — evidence: schemes, invalid values, internal links, and permit-invalid cases pass — next: closed
- [x] `packages/udecode/utils/src/sanitizeUrl.ts` — score: 100 — verdict: main-parity-cleanup — owner: URL sanitation utility — evidence: readonly scheme inputs preserve inference; tests and declarations pass — next: closed
- [x] `packages/udecode/utils/src/type-utils.ts` — score: 100 — verdict: main-parity-cleanup — owner: live type guards and binding — evidence: dead null wrappers removed; bindFirst uses unknown tuples and consumer typechecks pass — next: closed
- [x] `packages/udecode/utils/src/types/AnyObject.ts` — score: 100 — verdict: keep explicit escape hatch — owner: public dynamic-object types — evidence: dead AnyFunction removed; AnyObject unchecked contract documented and UnknownObject remains preferred — next: closed
- [x] `packages/udecode/utils/src/types/Deep.ts` — score: 100 — verdict: main-parity-cleanup — owner: recursive partial type — evidence: dead aliases removed; function preservation no longer requires any — next: closed
- [x] `packages/udecode/utils/src/types/FunctionProperties.ts` — score: 100 — verdict: hard-cut — owner: obsolete type aliases — evidence: zero repository imports and unchecked function constraint — next: closed
- [x] `packages/udecode/utils/src/types/Nullable.ts` — score: 100 — verdict: keep — owner: public nullable type — evidence: live repository consumers and declaration audit — next: closed
- [x] `packages/udecode/utils/src/types/WithOptional.ts` — score: 100 — verdict: hard-cut — owner: obsolete type alias — evidence: zero repository imports; native Omit/Partial composition is clearer at callers — next: closed
- [x] `packages/udecode/utils/src/types/index.ts` — score: 100 — verdict: generated-barrel-cleanup — owner: type exports — evidence: package barrel and declaration index omit hard-cut type files — next: closed
- [x] `packages/udecode/utils/src/types/types.ts` — score: 100 — verdict: main-parity-cleanup — owner: live public type operators — evidence: 9 obsolete aliases removed; OmitFirst and UnionToIntersection no longer depend on any — next: closed
- [x] `packages/udecode/utils/tsconfig.build.json` — score: 100 — verdict: keep — owner: package build config — evidence: existing rootDir change preserved; clean declarations emit — next: closed
- [x] `packages/udecode/utils/tsconfig.json` — score: 100 — verdict: keep — owner: package config — evidence: source-first package and targeted consumer typechecks pass — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| react-hotkeys lifecycle and typing cleanup | react-hotkeys | render-phase refs, type escapes, stale docs route | package source; lint; typecheck; tests; build; exact audits | keep cleanup; hard-cut `useDeepEqualMemo` | react-utils |
| react-utils live-owner cleanup | react-utils | broad type escapes and render-phase callback refs in primitives/listeners | package source; declarations; lint; typechecks; 37 tests; build | keep typed owner repairs | udecode/utils |
| react-utils dead export cut | react-utils | unused effect/memo/forwardRef wrappers with stale or cast-heavy semantics | repo caller audit; package barrel/build/declarations | hard-cut four exports and four proof files; major changeset | udecode/utils |
| udecode/utils surface cleanup | udecode/utils | dead exports and unchecked generic implementation details | package source, declarations, exact caller/type-escape audits, lint, typecheck, 56 tests, build, barrel | keep typed live owners; hard-cut 2 runtime helpers, 2 specs, and 2 obsolete type files | aggregate proof |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | no untracked files at checkpoint zero | all 88 paths exist in `origin/main` | no extracted owner decision | exact manifest parity |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `@platejs/media` consumer typecheck | existing Slate-era package errors plus `PreviewImage` types a button mouse event on an image and puts its ref inside hook props | package is outside this sequential packet; weakening react-utils inference would hide a caller bug | media package cleanup: type the image event as `HTMLImageElement` and return the ref through the hook result |
| `platejs` / transitive `@platejs/resizable` consumer typecheck | existing Slate-era editor API drift, including missing migrated editor transform/read surfaces | failures do not reference the removed udecode/utils symbols or changed generic signatures; packages are outside this sequential packet | close those packages in their own Plate Next migration packet |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| local `hexToBase64` implementation | `packages/docx` | distinct package-local algorithm; no import of the removed generic export | docx owner may keep or review independently |
| local `Simplify`, `DeepPartial`, `AnyFunction`, and third-party `StrictExtract` names | plite, core, selection, markdown | independent local/third-party symbols, not imports from `@udecode/utils` | no action in this packet |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | lifecycle/type cleanup in react-hotkeys; primitive/ref/listener typing in react-utils; live generic utility typing in udecode/utils; 15 obsolete files hard-cut across the three packages |
| tests/proof | callback/disable tests, primitive/ref/listener tests, and mergeProps argument/null-query tests; package lint/typecheck/test/build/barrel/declaration audits |
| docs/templates/skills | react-hotkeys README route correction; this goal plan; one changeset per reviewed package |
| reverted/quarantined packets | none; strict package types retained and outside-scope invalid callers recorded instead of weakening owners |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | media image event/ref caller | strict react-utils inference exposes a real caller mismatch | `packages/media/src/lib/media/PreviewImage.tsx` | fix during media migration review; do not weaken react-utils |
| 2 | legacy-list-model/resizable Slate-era drift | targeted consumer proof cannot close those unrelated packages | package typecheck output | handle in their own Plate Next packets |

Findings:
- The next untouched workspace packages after depset are
  `packages/udecode/react-hotkeys`, `packages/udecode/react-utils`, and
  `packages/udecode/utils`; the third is distinct from already-reviewed
  `packages/utils`.
- Checkpoint-zero manifest parity is exact: 88 tracked files, 0 untracked, and
  88 `origin/main` paths.

Decisions and tradeoffs:
- Generic packages remain editor-agnostic; no Plate/Plite wrapper or bridge was added.
- Public runtime/type removals use major changesets; direct platform/language constructs replace compatibility helpers.
- `AnyObject` remains as an explicitly unchecked escape hatch because live Core consumers rely on that contract; `UnknownObject` is the preferred narrowing surface.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial `useHotkeys` rewrite exposed a non-assignable nested readonly predicate and an uninitialized dependency ref | 1 | widen the public readonly key shape and initialize the optional ref explicitly | source-first typecheck passes |
| Initial react-utils ref widening made base primitive refs less precise | 1 | restore `ComponentRef<T>` and test the `asChild` common HTMLElement boundary without casts | package typecheck and declarations preserve precise base refs |
| Removing `useStableFn` dependencies broke the core consumer that intentionally changes callback identity with an atom | 1 | retain the explicit dependency contract and move only the latest-function ref update after render | core consumer typecheck passes |
| Consumer proof exposed the invalid media image event/ref hook | 1 | keep strict owner types and classify the caller instead of weakening the package | core/link/caption pass; media row recorded out of scope |
| First udecode/utils source-first typecheck exposed a stale generic argument in the unused `getHandler` spec | 1 | verify repository callers and hard-cut the dead helper/spec instead of repairing compatibility-only proof | package typecheck passes; exact caller audit is empty |
| Initial broad utils consumer command included a nonexistent package filter and later reached existing legacy-list-model/resizable migration failures | 1 | rerun targeted known consumers and classify unrelated package failures by owner | core, react-utils, floating, basic-nodes, csv, markdown, and link pass; unrelated failures recorded |
| First scoped autoreview found the returned `useHotkeys` element ref changed identity on every render | 1 | return React's stable state setter directly and add a ref-identity regression test in the existing owner | focused lint/typecheck, 26 tests, build, and clean autoreview rerun pass |

Verification evidence:
- react-hotkeys: package lint passes; source-first typecheck passes; 26 tests
  pass with 54 expectations; build and declarations pass; exact source audit
  finds zero remaining explicit `any`, suppression, render-phase helper, or DOM
  listener cast matches.
- react-utils: package lint, source-first typecheck, 37 tests with 58
  expectations, build, declaration inspection, and package barrel generation
  pass; core/link/caption consumer typechecks pass; tracked manifest remains 37
  initial rows with 29 live files, 8 hard-cuts, and 0 untracked files.
- udecode/utils: package lint, source-first typecheck, 56 tests with 66
  expectations, build, declaration inspection, and package barrel generation
  pass; tracked manifest remains 30 initial rows with 24 live files, 6
  hard-cuts, and 0 untracked files; exact removed-symbol import audit is empty.
- aggregate: all three package lints, combined source-first typecheck, 119 tests,
  three builds, and `pnpm changeset status` pass; final scoped Codex autoreview
  exits clean with no accepted/actionable findings after one accepted P1 fix.

Final handoff contract:
- target surface and mode: sequential package review of exactly react-hotkeys, react-utils, and udecode/utils
- files/APIs reviewed: all 88 initial package rows; 73 live files and 15 hard-cuts
- broad Core drift score coverage: N/A; generic utility package packet, no Core owner changed
- package file checklist coverage: 88/88 score 100; 0 deferred; 0 missing/extra/untracked
- best Plate v2 recommendation: keep generic owners narrow and inferred; hard-cut unused wrappers/aliases rather than preserve compatibility sludge
- verdict matrix summary: all three packages score 100 and are kept after cleanup
- Plite/Plate gaps or blockers: none inside scope
- related scoped sweep query/active scope/matches/patched/deferred: exact type-escape, removed-name, caller, declaration, and lifecycle audits recorded above; 0 active-package deferrals
- out-of-scope matches discovered: media caller mismatch, legacy-list-model/resizable migration drift, and independent same-name local types/helpers
- changes made: lifecycle/runtime typing repairs, focused regression tests, generated barrels, 15 hard-cuts, package-scoped changesets
- tests/proof commands: package lint, source-first typecheck, tests, builds, barrels, declaration and caller audits; aggregate commands below
- old compatibility names audited: all hard-cut runtime/type exports have zero `@udecode/utils` imports; obsolete React utility exports have zero callers
- needs attention: media and legacy-list-model/resizable rows above, outside this packet
- next best Plate Next packet: intentionally not selected; user requested exactly three packages

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | packet complete |
| Where am I going? | Stop before a fourth package and hand back the closed three-package packet. |
| What is the goal? | Close all 88 rows at score 100 or explicit deferral, then pass proof/review/checker. |
| What have I learned? | Generic utility cleanup needs stricter existing owners and direct hard cuts, not compatibility wrappers or new abstraction files. |
| What have I done? | Closed all 88 rows across three packages, including 15 file hard-cuts, with focused proof. |

Timeline:
- 2026-07-13T18:36:01.643Z Goal plan created.
- 2026-07-13 Checkpoint zero closed: exact three-package order, 88-file
  manifest, zero extracted files, goal, vision, boundaries, and proof gates recorded.
- 2026-07-13 React-hotkeys closed: 21/21 rows score 100; lifecycle/type
  cleanup, callback dependency regressions, README route repair, lint,
  source-first typecheck, 26 tests, build, exact audits, and clean final review completed.
- 2026-07-13 React-utils closed: 37/37 rows score 100; four obsolete
  exports and their specs hard-cut; live primitive/ref/listener owners repaired;
  lint, source-first and consumer typechecks, 37 tests, build, barrel,
  declarations, exact audits, and package changeset completed.
- 2026-07-13 Udecode/utils closed: 30/30 rows score 100; two unused runtime
  helpers, two specs, and two obsolete type files hard-cut; live generic owners
  tightened; lint, source-first and targeted consumer typechecks, 56 tests,
  build, barrel, declarations, exact audits, and package changeset completed.
- 2026-07-13 Aggregate closeout passed: three package lints, combined
  source-first typecheck, 119 tests, three builds, changeset validation, and
  scoped Codex autoreview; one unstable returned ref finding was fixed and the
  rerun returned no accepted/actionable findings.
- 2026-07-13 Mechanical completion checker exited 0 with `[autogoal] complete`.

Open risks:
- No in-scope open risk; media and legacy-list-model/resizable corrections stay in
  their owning future packets.
