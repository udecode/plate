# plate-next core extracted owners

Objective:
Classify and close the six extracted Core owners without compatibility sludge;
all six must be merged, moved, deleted, or justified and Core proof must pass.

Goal plan:
docs/plans/2026-07-15-plate-next-core-extracted-owners.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user said `go` on the extracted Core owner packet
- mode: named Core extracted-file review and cleanup
- target surface: `BaseEditor.ts`, `PluginConfig.ts`, `getBasePlugin.ts`,
  `PlateRoot.tsx`, `usePlateRootProps.ts`, and `plite-react.ts`, plus their
  direct tests/barrels/callers only
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; six named files only
- correction-triggered related scoped sweep: yes, direct imports/exports and
  origin/main owner equivalents
- package review mode: no; this is a named extracted-owner packet
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: six classified rows, zero unjustified new
  source owners, Core type/tests and `check:core` green

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
- semantics: outcome-gated one-shot execution
- initial confidence score: 0.65 before source-owner comparison
- improvement loop: compare each file to its deleted `origin/main` owner,
  score navigation/ownership value, then merge/delete the highest drift first
- final score / loop closure: every named row has a final verdict and proof

Completion threshold:
- Every named file has an origin/main owner comparison and exactly one final
  verdict: merge-existing-owner, move-to-plite, delete-duplicate,
  justify-new-proof-tooling, or justified durable Core owner.
- No file remains merely because migration extraction was convenient.
- Direct import/export sweeps show no broken or duplicate owner path.
- Core typecheck/tests and `pnpm check:core` pass after any merge/delete.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-plate-next-core-extracted-owners.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Core typecheck, focused affected specs, Core tests
- package proof: `pnpm turbo typecheck --filter=./packages/core` and
  `pnpm --filter @platejs/core test`
- shared Core gate: `pnpm check:core`
- source audits: exact imports/exports/references for all six paths and their
  deleted `origin/main` equivalents
- related scoped sweep query / active scope / match count / patched count / deferred count:
  three rows below; 34 plugin-lookup references with one cast fixed, 23 direct
  Plite React imports with one root import fixed, zero old owner names, zero
  deferred
- package file manifest / row count / checked count / deferred count: N/A;
  named six-file packet
- Plite/Plate gap ledger: record only if a clean fold needs a missing owner API
- broad Core drift ledger gate: N/A; not a broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-plate-next-core-extracted-owners.md`

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
- allowed edit scope: the six named Core owners, their direct barrels/callers,
  this goal plan, and the existing Core migration changeset
- package/API surfaces: `@platejs/core` editor/plugin types and Plate root
  wiring only
- docs/browser surfaces: this evidence plan and the existing playground route
  for runtime proof
- non-goals: broad Core review, package review, public API redesign, restoring
  old Slate names, or touching templates
- out-of-scope package errors: none reported by the proof stack

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- No blocker. A missing Plite/Plate capability or an origin owner with
  incompatible responsibilities would have stopped local extraction cleanup;
  neither occurred.

Current verdict:
- verdict: keep all six paths as deliberate hard-cut owner replacements;
  retain three scoped inference/import cleanups
- confidence: 0.98
- next owner: plate-next migration inventory
- keep / revert / quarantine call: keep the direct-import/inference cleanup;
  revert the trial `getBasePlugin` merge
- reason: every path maps one-to-one to an `origin/main` conceptual owner, and
  forcing files together would erase established component/hook and
  lookup/portal ownership boundaries

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Owner reconstruction | complete | Six current files mapped to six durable `origin/main` conceptual owners. | structural trial |
| Structural trial and correction | complete | `getBasePlugin` merge trial reverted; three local import/inference smells fixed. | focused proof |
| Source and extracted-file audit | complete | Six expected/actual rows, zero old names, zero internal local re-export imports. | shared proof |
| Package and Browser proof | complete | Barrels, typecheck, lint, focused/full Core tests, playground runtime, and `check:core` passed. | closure |
| Closure accounting | complete | Review, extracted-file, sweep, change, and handoff ledgers are complete. | goal checker |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Six named Core owners, no unjustified source split, Core proof, concise handoff. |
| `plate-next` skill/rule read | yes | Active skill already read in full for this continuous migration lane. |
| Active goal checked or created | yes | New six-file quantitative goal created before source edits. |
| Mode classified as named packet vs broad Core sweep | yes | Named extracted-owner packet; no broad Core claim. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Durable ownership and direct Plite boundary, not old Slate names. |
| Broad Core drift ledger initialized when in scope | no | N/A; six exact files are materialized below. |
| Source of truth and allowed workspace recorded | yes | Current Core source, `origin/main` deleted owners, and direct callers in plate-2. |
| Output budget strategy recorded | yes | Six-row matrix plus capped import/reference evidence. |
| Public API fork routing checked | yes | Any public API redesign routes to `plate-plan`; none assumed. |
| Gap policy checked | yes | Missing substrate becomes a named gap, never a local wrapper. |
| Related scoped sweep policy checked | yes | Sweep only direct imports, barrels, tests, and deleted owner equivalents. |
| Review-mode rename freeze checked | yes | Existing migration names stay unless a merge/delete removes an extracted path. |
| Package review checklist initialized when in scope | no | N/A; named-file mode. |

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
| Named verification threshold | yes | Run the proof commands named in this plan | Core typecheck, focused tests, all 733 Core tests, Browser proof, and `check:core` passed |
| Broad Core drift ledger coverage | no | N/A for six-file named packet | Exact six-row inventory is complete; no broad Core claim |
| Score gate | yes | Own/fix every score `>=2` | Three score-2 rows fixed; all finish at score 0 |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Keep the six hard-cut owners; reject old names and forced merges |
| Plite/Plate gap ledger | yes | Record blockers or N/A | N/A; current substrate and product owners are sufficient |
| Related scoped sweep after correction | yes | Search the same class in active scope | Three scoped queries recorded below; zero remaining risk |
| Package file checklist | no | N/A for named-file mode | Six-row extracted-file ledger is the governing checklist |
| Package/API proof | yes | Run focused Core proof | Typecheck, lint, focused specs, and full Core tests passed |
| Shared Core gate coverage | yes | Run existing Core gate | `pnpm check:core` passed; no package-list change needed |
| Non-Core package error triage | no | Classify reported errors | No errors reported |
| Source audit | yes | Audit removed Slate names and direct imports | Zero old owner names; zero internal local re-export imports |
| Rename ledger | no | Record postponed rename | N/A; current hard-cut names are accepted, not postponed |
| Extracted-file inventory | yes | Classify every untracked path | Six expected, six actual, zero missing/extra |
| Autoreview / review | yes | Perform source-owner comparison | Manual Plate Next review completed against all six `origin/main` owners |
| Final lint/check | yes | Run scoped lint and shared gate | Core lint and `check:core` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; no needs-attention row |
| Goal plan complete | yes | Run goal checker | Run after this evidence update |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `lib/editor/BaseEditor.ts` | 0 | keep-in-plate / recover-main-owner | Core editor contract | Replaces `origin/main` `SlateEditor.ts` (209 lines) with the direct Plite-backed editor type (181 lines) | keep |
| `lib/plugin/PluginConfig.ts` | 0 | keep-in-plate / recover-main-owner | Core plugin config contract | Replaces the config contract in `origin/main` `BasePlugin.ts` (595 lines); current `BasePlugin.ts` must own the former `SlatePlugin.ts` runtime role | keep |
| `lib/plugin/getBasePlugin.ts` | 0 after fix (was 2) | keep-in-plate / recover-main-owner | resolved plugin lookup | One-to-one replacement for `origin/main` `getSlatePlugin.ts` (66 lines); removed redundant `any` cast | keep separate from plugin portal context |
| `react/components/PlateRoot.tsx` | 0 after fix (was 2) | keep-in-plate / recover-main-owner | Plate React root component | One-to-one replacement for `origin/main` `PlateSlate.tsx` (45 lines); direct Plite import and inferred local element | keep |
| `react/hooks/usePlateRootProps.ts` | 0 after fix (was 2) | keep-in-plate / recover-main-owner | Plate root state wiring | One-to-one replacement for `origin/main` `useSlateProps.ts` (70 lines); callbacks use `useCallback` with parameter inference | keep separate from component |
| `react/plite-react.ts` | 0 | keep-in-plate / recover-main-owner | public Plate React re-export boundary | Replaces `origin/main` `slate-react.ts` (18 lines); internal Core imports resolve directly to `@platejs/plite-react` | keep public boundary only |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Six Core owners | Keep all six as hard-cut owner replacements; internal Core imports Plite directly while `plite-react.ts` stays a public re-export | Restore Slate names, merge lookup into portal context, inline hook into component, or keep local casts/annotations | Current split preserves the same durable owner boundaries as main without Slate compatibility vocabulary | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | no workaround needed | existing Plite/Core owners | completed proof stack | no gap |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Remove `getPlugin` cast | named plugin lookup owner/callers | `rg "getBasePlugin|getPluginType|getPluginKey|getPluginByType|editor\\.getPlugin as any" packages/core/src` | 34 lookup references; 1 cast smell | 1 | 0 | none; typecheck passed |
| Direct Plite import in root | named React root owner/direct imports | `rg "from ['\"].*plite-react|\\.\\.?/plite-react" packages/core/src` | 23 direct package imports; 1 public barrel export; 0 internal local-boundary imports | 1 | 0 | none |
| Hard-cut owner names | all Core source | `rg "SlateEditor|SlatePlugin|getSlatePlugin|PlateSlate|useSlateProps|slate-react" packages/core/src` | 0 | 0 | 0 | none |

Core drift ledger:
- Applies: no; named six-file packet only
- Manifest command: N/A; exact extracted inventory command is recorded below
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A; the extracted-file and review matrices own the six rows
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A for broad Core; named score gate closed
- Top drift rows: `getBasePlugin.ts`, `PlateRoot.tsx`, and
  `usePlateRootProps.ts` started at 2 and finish at 0

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | no broad Core claim | Plate Next | six exact rows are in the review matrix | continue migration inventory |

Package file checklist:
- Applies: no; named-file mode
- Package: `@platejs/core` named owners only
- Manifest command: N/A; exact six-path inventory used
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 6 extracted owners
- Actual row count: 6 extracted owners
- Checked score-100 count: 6 owner classifications complete
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: this named goal and shared gate close

Package file rows:
- [x] N/A — package review mode did not apply; the six checked owner rows are
      in the review and extracted-file matrices.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Lookup owner merge trial | Core plugin lookup | `getBasePlugin` may be convenience extraction | trial merge into `getEditorPlugin.ts`, then compare `origin/main` | reverted: main deliberately separated resolved lookup from portal context | keep owner split |
| Lookup inference cleanup | Core plugin lookup | local `any` cast hides owner typing | `getBasePlugin.ts`, Core typecheck/tests | kept: `editor.getPlugin({ key })` infers correctly | none |
| Plate root import/inference cleanup | Plate React root | internal public re-export import and local annotations add indirection | `PlateRoot.tsx`, `usePlateRootProps.ts`, focused specs, Browser | kept | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/lib/editor/BaseEditor.ts` | recover-main-owner | `SlateEditor.ts` | keep hard-cut owner | source comparison + Core proof |
| `packages/core/src/lib/plugin/PluginConfig.ts` | recover-main-owner | config contract in old `BasePlugin.ts` | keep hard-cut owner; name collision is real because current `BasePlugin.ts` owns old `SlatePlugin.ts` role | source comparison + Core proof |
| `packages/core/src/lib/plugin/getBasePlugin.ts` | recover-main-owner | `getSlatePlugin.ts` | keep, remove cast | source comparison + typecheck/tests |
| `packages/core/src/react/components/PlateRoot.tsx` | recover-main-owner | `PlateSlate.tsx` | keep, import Plite directly | focused specs + Browser |
| `packages/core/src/react/hooks/usePlateRootProps.ts` | recover-main-owner | `useSlateProps.ts` | keep, infer callbacks | focused specs + Browser |
| `packages/core/src/react/plite-react.ts` | recover-main-owner | `slate-react.ts` | keep as public boundary only | import audit + `check:core` |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none | no failures | N/A |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| N/A | none from exact sweeps | no broader edit needed | Plate Next inventory |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | removed redundant plugin lookup cast; made Plate root import Plite directly; replaced memoized callback factories with inferred `useCallback` handlers |
| tests/proof | no test source changes; existing focused/full coverage and Browser proof passed |
| docs/templates/skills | filled this goal plan; extended existing Core migration changeset; templates untouched |
| reverted/quarantined packets | reverted `getBasePlugin` merge trial after owner comparison proved it was drift |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | none | packet is closed | this plan | continue the remaining migration inventory |

Findings:
- Calling these files "extracted" was misleading. Each is the hard-cut rename
  or responsibility successor of an existing `origin/main` owner.
- `PluginConfig.ts` is especially justified: the old config-owning
  `BasePlugin.ts` name is occupied by the runtime owner that succeeds
  `SlatePlugin.ts`.
- `getBasePlugin.ts` is not portal boilerplate. Main already separated resolved
  plugin lookup (`getSlatePlugin.ts`) from portal context (`getEditorPlugin.ts`).
- `plite-react.ts` is valuable only as a public Plate re-export boundary;
  internal Core code correctly imports Plite React directly.

Decisions and tradeoffs:
- Keep structural parity with the durable main owners, not superficial low file
  count. Forced consolidation would make navigation and ownership worse.
- Keep current hard-cut names and reject compatibility aliases to old Slate
  names.
- Improve inference/import direction without redesigning the public API.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Trial merge of `getBasePlugin.ts` into portal context | 1 | Compare deleted main owners before retaining structural cleanup | Reverted; main proves separate ownership |
| Core typecheck reported missing exports after restoring trial file | 1 | Regenerate barrels after restoring exported path | `pnpm brl` restored exports; typecheck passed |
| Trial formatter touched `OverridePlugin.ts` | 1 | Restore packet-local source before final proof | Reverted with the trial; no retained unrelated edit |

Verification evidence:
- `pnpm brl` — pass, 56/56 tasks (run again after the reverted merge restored
  the public file).
- `pnpm turbo typecheck --filter=./packages/core` — pass, 10/10 tasks.
- `pnpm --filter @platejs/core lint` — pass, 396 files.
- `pnpm --filter @platejs/core exec bun test ./src/react/hooks/usePlateRootProps.spec.tsx ./src/react/utils/pluginRenderElement.spec.tsx`
  — pass, 6 tests.
- `pnpm --filter @platejs/core test` — pass, 733 tests.
- `pnpm check:core` — pass, exit 0 across the complete configured gate.
- Browser: ran `pnpm --filter www dev`, opened
  `http://localhost:3000/blocks/playground`, confirmed one
  `[data-plite-editor="true"]`, typed `ROOT_OWNER_PROOF` into the heading,
  confirmed editor text updated, observed zero warning/error logs and HTTP 200,
  then stopped the server.
- Extracted inventory: exact `git ls-files --others --exclude-standard --`
  command over the six paths returned six paths; missing 0, extra 0.
- Old-name audit over Core source for `SlateEditor`, `SlatePlugin`,
  `getSlatePlugin`, `PlateSlate`, `useSlateProps`, and `slate-react` returned 0.
- Internal-boundary audit found zero relative imports of `plite-react`; the
  only local occurrence is the intended public barrel export.

Final handoff contract:
- target surface and mode: six named Core extracted-owner review
- files/APIs reviewed: all six requested files and their direct owners/callers
- broad Core drift score coverage: N/A; no broad Core claim
- package file checklist coverage: N/A; exact six-row inventory is 6/6 complete
- best Plate v2 recommendation: keep all six hard-cut owner replacements
- verdict matrix summary: six recover-main-owner rows; three score-2 cleanup
  rows fixed to 0; zero merge/delete candidates remain
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: three rows
  above; 2 retained source corrections plus 1 old-name audit, deferred 0
- out-of-scope matches discovered: none
- changes made: cast removal, direct Plite import, inferred root callbacks,
  changeset/plan evidence
- tests/proof commands: barrels, Core typecheck/lint/focused/full tests,
  Browser playground, and full `check:core` all green
- old compatibility names audited: yes; zero matches in Core source
- needs attention: none
- next best Plate Next packet: refresh the remaining migration inventory and
  select the next unclassified owner/package; do not revisit these six

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Six-file Core owner packet closed |
| Where am I going? | Next remaining migration inventory row |
| What is the goal? | Keep deliberate hard-cut owners, remove migration sludge, prove Core |
| What have I learned? | All six paths replace durable main owners; forced merging is drift |
| What have I done? | Classified 6/6, fixed three local smells, passed the full proof stack |

Timeline:
- 2026-07-15T00:55:58.657Z Goal plan created.
- 2026-07-15 Source-mapped all six files to `origin/main` owners and reverted a
  structurally wrong merge trial.
- 2026-07-15 Retained direct-import/inference cleanup and passed Core package,
  Browser, and shared-gate proof.

Open risks:
- None in this packet.
