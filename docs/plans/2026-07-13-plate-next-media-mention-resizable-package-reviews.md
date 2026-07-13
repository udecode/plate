# plate-next media mention resizable package reviews

Objective:
Close Media, Mention, and Resizable Plate Next reviews; done when all 142
package rows score 100 or are explicitly deferred and package proof/autoreview
pass.

Goal plan:
docs/plans/2026-07-13-plate-next-media-mention-resizable-package-reviews.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | Next untouched feature packages resolved from completed ledgers; 141 tracked rows and 0 untracked rows counted | materialize checklist |
| Media review | complete | 107/107 rows score 100; lint, typecheck, 97 tests, and build pass | closed before Mention |
| Mention review | complete | 15/15 rows score 100; lint, typecheck, 7 tests, and build pass | closed before Resizable |
| Resizable review | complete | 20/20 rows score 100; lint, typecheck, 13 tests, and build pass | closed before combined proof |
| Autoreview and closure | complete | 142/142 package rows score 100; combined 117 tests and final autoreview pass | run final checker |

Plate Next source:
- prompt / link: user invoked `plate-next next 3 packages`
- mode: sequential package review
- target surface: `packages/media`, then `packages/mention`, then
  `packages/resizable`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, inside the active package
  plus only the smallest required Plite/Core owner
- package review mode: yes
- package review target: every tracked and untracked file in the three packages
- package file checklist gate: one row per file; `[x]` only at score `100`;
  explicit user-review deferrals remain unchecked with owner and proof needed
- completion threshold summary: close Media before Mention and Mention before
  Resizable; all 142 rows score 100 or are explicitly deferred; scoped proof,
  source audits, autoreview, and the final checker pass

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
- semantics: one-shot completion of exactly the next three untouched feature packages
- initial confidence score: 0.35 before source/baseline audits
- improvement loop: review and close Media, then Mention, then Resizable
- final score / loop closure: 1.00; all 142 rows and proof gates closed

Completion threshold:
- All 142 Media, Mention, and Resizable package rows score `100` or carry an
  explicit user-review deferral with reason, owner, proof needed, and next
  action; package lint, source-first typecheck, tests, build, source audits,
  autoreview, and the final plan checker pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plate-next-media-mention-resizable-package-reviews.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package lint, source-first typecheck, package tests,
  package build, focused behavior tests, and barrels only if exports move
- package proof: `pnpm --filter @platejs/<package> lint:fix`, `typecheck`,
  `test`, and `build`
- shared Core gate: N/A unless the smallest Core/Plite owner changes; these are
  product feature packages and do not belong in `check:core` by default
- source audits: direct dependency ownership, umbrella imports, removed
  Slate/Plate APIs, root editor pollution, casts, explicit inference-hiding
  types, nested/consecutive transactions, optional reads, normalization,
  React effects/subscriptions/memoization, and origin/main owner parity
- related scoped sweep query / active scope / match count / patched count / deferred count:
  record after every correction inside the active package
- package file manifest / row count / checked count / deferred count: 142 rows
  materialized before implementation; keep counts current
- Plite/Plate gap ledger: record every blocker or explicit N/A
- broad Core drift ledger gate: N/A; broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plate-next-media-mention-resizable-package-reviews.md`

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
- allowed edit scope: `packages/media`, `packages/mention`,
  `packages/resizable`, this plan, package-specific changesets, lockfile changes
  caused by direct dependency corrections, and only the smallest required
  Plite/Core blocker owner
- package/API surfaces: preserve user-visible Media/Mention/Resizable behavior
  while migrating to direct Core/Plite owners and current transactions/reads
- docs/browser surfaces: no apps/www, content docs, registry, dev server, or
  browser proof; package-review mode explicitly excludes them
- non-goals: no broad package caller rewrite, infrastructure-package review,
  global migration, rename pass, or speculative public API redesign
- out-of-scope package errors: classify and record unless caused by the named
  packages or the smallest shared owner changed here

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- For this 142-row packet, inspect counts and filenames before matching lines;
  keep per-package source maps and proof output package-scoped.

Blocked condition:
- a clean migration requires a public Plite/Plate API fork that cannot be
  chosen without user acceptance; route it to `plate-plan` with exact owner and
  proof instead of adding a workaround

Current verdict:
- verdict: all three packages closed at 142/142; combined proof and autoreview clean
- confidence: 1.00 after package proof, source audit, and clean autoreview
- next owner: plate-next can select the next untouched package packet
- keep / revert / quarantine call: keep all three package migrations and focused regression tests
- reason: each package has direct Core/Plite ownership, no compatibility bridge, no unresolved substrate gap, and complete package proof

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | exactly next three packages, sequential closure, no duration/broad sweep, proof and final handoff recorded |
| `plate-next` skill/rule read | yes | user supplied current skill and local skill was read before package actions |
| Active goal checked or created | yes | matching active goal created for this plan and 142-row threshold |
| Mode classified as named packet vs broad Core sweep | yes | sequential package review; broad Core excluded |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | objective, constraints, and verification surface above |
| Broad Core drift ledger initialized when in scope | no | N/A: no broad Core sweep |
| Source of truth and allowed workspace recorded | yes | current checkout, origin/main evidence, named package source/tests/metadata |
| Output budget strategy recorded | yes | counts and filenames first; capped per-package reads |
| Public API fork routing checked | yes | any public fork routes to `plate-plan` before implementation |
| Gap policy checked | yes | missing substrate becomes a named Plite/Plate gap, never a local bridge |
| Related scoped sweep policy checked | yes | same-class sweep required inside active package after every correction |
| Review-mode rename freeze checked | yes | current names/owners preserved unless an accepted hard cut requires otherwise |
| Package review checklist initialized when in scope | yes | 141 tracked rows at checkpoint zero: Media 106, Mention 15, Resizable 20; 0 untracked; one Media regression spec added and inventoried during repair |

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
- [x] N/A: no broad Core sweep; the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [x] N/A: no broad Core sweep; every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [x] N/A: no broad Core sweep; the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] N/A: no broad Core sweep; the drift score gate is closed in this plan:
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
- [x] N/A: no export path or barrel changed, so `pnpm brl` is not required.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Media 97, Mention 7, Resizable 13 tests; lint, typecheck, and builds pass |
| Broad Core drift ledger coverage | no | Record N/A because broad Core sweep does not apply | N/A: no Core files changed or reviewed |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 142/142 score 100; 0 deferred |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | three recommendation rows complete |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | no Plite/Plate gaps remain |
| Related scoped sweep after correction | yes | For each correction, run and record same-class search/review results inside the active scope | nine scoped sweep rows complete; 0 deferred |
| Package file checklist | yes | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | 142 expected/actual/checked; 0 missing/extra/deferred |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | all three package proof stacks pass |
| Shared Core gate coverage | no | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | product feature packages; no Core owner changed |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | no out-of-scope proof failures |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | old imports/APIs/casts/normalization audit clean; test-only required read accepted |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | no postponed rename |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | one new Media regression spec justified; no extracted production file |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs or record N/A | first pass found two Media defects; both fixed; second pass clean at 0.82 confidence |
| Final lint/check | yes | Run scoped lint/check or record N/A | package lint/typecheck/tests/build and diff check pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | complete below; needs attention none |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plate-next-media-mention-resizable-package-reviews.md` | checker passes |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/media` | 0 after repair | keep-in-plate | Media product package | 107/107 rows score 100; 97 tests and package proof pass | closed |
| `packages/mention` | 0 after repair | keep-in-plate | Mention product package | 15/15 rows score 100; 7 tests and package proof pass | closed |
| `packages/resizable` | 0 after repair | keep-in-plate | Resizable React product package | 20/20 rows score 100; 13 tests and package proof pass | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Media | Keep product plugins/composition in Plate; use direct Core/Plite reads, updates, plugin portals, and named clipboard extensions | Slate editor/plugin factories, `editor.tf`, root option helpers, history-mark bridges, broad store casts, implicit colliding editor extensions | Product behavior belongs in Plate while editor substrate stays in Plite; explicit extension identities preserve both upload and embed middleware | none |
| Mention | Keep mention/combobox product composition in Plate; expose insertion through an inferred `insert` tx group and accept a typed plugin instance for option lookup | Slate factories, `editor.tf`, dynamic key casts, `any` mention payloads, and old override middleware | Grouped insertion, selection placement, and optional trailing space stay atomic while Plite owns paths, points, and text/node mutations | none |
| Resizable | Keep React resize composition in Plate; use current editor hooks/direct writes, package-owned resize units, inferred stores, and guarded DOM events | umbrella imports, `editor.tf`, broad atom-store casts, dead `readOnly` option, non-null DOM assertions, and pnpm-internal CSS declaration leakage | Resizing is Plate UI behavior; direct Core/Plite mutation and explicit local domain types keep editor and declaration ownership clean | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A for Media | none | no local workaround retained | N/A | package proof | closed |
| N/A for Mention | none | no local workaround retained | N/A | package proof | closed |
| N/A for Resizable | none | no local workaround retained | N/A | package proof | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Media old API hard cut | `packages/media` | umbrella imports, Slate factories/types, `editor.tf`, root option helpers, transaction/normalization/cast audit | package-wide | all production matches | 0 | only current capability APIs such as `editor.api.dom` remain |
| Media clipboard collision | `packages/media` | inspect all image clipboard extensions and focused upload/embed tests | 2 extensions | 2 named | 0 | both middleware paths proven together |
| Media validation test repair | `packages/media/src/react/placeholder` | unsafe casts, swallowed errors, optional size handling | 5 affected specs/utils | 5 | 0 | 97-test package suite passes |
| Media explicit-path insertion | `packages/media/src/lib/media-embed` | selection reads before honoring explicit `at` | 1 production match, 1 regression row | 2 | 0 | explicit-path insertion passes with no selection |
| Media file-drop option semantics | `packages/media/src/react/placeholder` | `disableFileDrop` condition and package references | 1 production match, 1 regression row | 2 | 0 | default and disabled branches proven |
| Mention old API hard cut | `packages/mention` | Slate factories/types, `editor.tf`/flat reads, casts, callback inference, package ownership | package-wide | all production/test matches | 0 | only current Core/Plite APIs remain |
| Mention selection placement | `packages/mention` | block-end and mid-block insertion behavior through one active transaction | 2 focused rows | 2 | 0 | explicit post-mention text insertion avoids deferred-normalization selection drift |
| Resizable old API hard cut | `packages/resizable` | umbrella imports, flat transforms, store casts, dead options, non-null DOM assertions | package-wide | all matches | 0 | only current Core/Plite and React utility owners remain |
| Resizable declaration portability | `packages/resizable` | package build after source-first typecheck | 4 TS2883 rows | 4 | 0 | package-owned `ResizeLength` prevents pnpm-internal `csstype` leakage |

Core drift ledger:
- Applies: no; broad Core sweep was not requested and no Core file changed
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Top drift rows: none

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | broad Core sweep excluded | N/A | no Core edits | closed |

Package file checklist:
- Applies: yes
- Package: `media` -> `mention` -> `resizable`
- Manifest command: `(git ls-files packages/media packages/mention packages/resizable; git ls-files --others --exclude-standard packages/media packages/mention packages/resizable) | sort -u`
- Manifest owner:
  every tracked file under `packages/media`, `packages/mention`, and
  `packages/resizable`; untracked inventory reported one focused Media regression spec.
- Expected row count: 142
- Actual row count: 142
- Checked score-100 count: 142
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: every row in the active package is score 100 or
  explicitly deferred with owner, proof needed, and next action.

Package file rows:
- [x] `packages/media/.npmignore` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/CHANGELOG.md` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/README.md` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/package.json` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/BaseAudioPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/BaseFilePlugin.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/BaseMediaPluginContracts.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/BaseVideoPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/image/BaseImagePlugin.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/image/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/image/transforms/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/image/transforms/insertImage.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/image/transforms/insertImageFromFiles.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/image/utils/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/image/utils/isImageUrl.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/image/utils/isImageUrl.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/image/withImageEmbed.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/image/withImageEmbed.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/image/withImageUpload.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/image/withImageUpload.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media-embed/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media-embed/parseIframeUrl.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media-embed/parseIframeUrl.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media-embed/parseTwitterUrl.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media-embed/parseTwitterUrl.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media-embed/parseVideoUrl.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media-embed/parseVideoUrl.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media-embed/transforms/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media-embed/transforms/insertMediaEmbed.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media-embed/transforms/insertMediaEmbed.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media/insertMedia.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media/insertMedia.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media/parseMediaUrl.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media/parseMediaUrl.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/media/types.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/placeholder/BasePlaceholderPlugin.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/placeholder/BasePlaceholderPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/placeholder/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/placeholder/transforms/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/placeholder/transforms/insertPlaceholder.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/placeholder/transforms/insertPlaceholder.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/placeholder/transforms/setMediaNode.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/lib/placeholder/transforms/setMediaNode.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/image/ImagePreviewStore.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/image/components/Image.tsx` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/image/components/PreviewImage.tsx` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/image/components/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/image/components/useScaleInput.tsx` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/image/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/image/openImagePreview.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/image/useImagePreview.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/image/useZoom.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/FloatingMedia.tsx` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/FloatingMediaEditButton.tsx` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/FloatingMediaStore.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/FloatingMediaUrlInput.tsx` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/submitFloatingMedia.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/submitFloatingMedia.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/media/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/media/mediaStore.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/media/useMediaController.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/media/useMediaState.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/media/useMediaState.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/media/useMediaToolbarButton.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/PlaceholderPlugin.tsx` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/PlaceholderPlugin.spec.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: media package review — evidence: proves default and disabled file-drop branches; 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: keep regression test
- [x] `packages/media/src/react/placeholder/hooks/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/hooks/usePlaceholderElement.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/hooks/usePlaceholderPopover.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/hooks/usePlaceholderPopover.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/internal/application.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/internal/audio.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/internal/image.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/internal/mimes.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/internal/misc.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/internal/text.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/internal/utils.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/internal/video.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/placeholderStore.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/transforms/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/transforms/insertMedia.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/type.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/utils/createUploadError.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/utils/fileSizeToBytes.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/utils/fileSizeToBytes.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/utils/getMediaType.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/utils/groupFilesByType.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/utils/groupFilesByType.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/utils/history.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/utils/history.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/utils/index.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/utils/matchFileType.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/utils/matchFileType.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/utils/validateFileItem.spec.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/utils/validateFileItem.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/placeholder/utils/validateFiles.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/src/react/plugins.ts` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/tsconfig.build.json` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/media/tsconfig.json` — score: 100 — verdict: keep-in-plate — owner: media package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 97 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/.npmignore` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/CHANGELOG.md` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/README.md` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/package.json` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/src/lib/BaseMentionPlugin.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/src/lib/BaseMentionPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/src/lib/getMentionOnSelectItem.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/src/lib/getMentionOnSelectItem.ts` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/src/lib/types.ts` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/src/react/MentionPlugin.tsx` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/src/react/index.ts` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/tsconfig.build.json` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/mention/tsconfig.json` — score: 100 — verdict: keep-in-plate — owner: mention package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 7 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/.npmignore` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/CHANGELOG.md` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/README.md` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/package.json` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/src/components/Resizable.tsx` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/src/components/ResizeHandle.tsx` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/src/components/index.ts` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/src/components/useResizableStore.ts` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/src/types.ts` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/src/utils/index.ts` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/src/utils/isTouchEvent.ts` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/src/utils/resizeLengthClamp.spec.ts` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/src/utils/resizeLengthClamp.ts` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/src/utils/resizeLengthToRelative.spec.ts` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/src/utils/resizeLengthToRelative.ts` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/src/utils/resizeLengthToStatic.spec.ts` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/src/utils/resizeLengthToStatic.ts` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/tsconfig.build.json` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed
- [x] `packages/resizable/tsconfig.json` — score: 100 — verdict: keep-in-plate — owner: resizable package review — evidence: current Core/Plite ownership audit, origin/main behavior comparison, 13 package tests, source-first typecheck, lint, and build — proof needed: none — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Media | plate-next | migrated package retained old Plate/Slate APIs, colliding implicit extensions, compatibility history logic, fake-green validation tests, and inverted drop semantics | package-wide audits; lint; typecheck; 97 tests; build | hard-cut legacy paths, restore public behavior, keep clean product ownership | closed |
| Mention | plate-next | package was entirely on old factories/transforms and hid payload/selection behavior behind `any` | package-wide audits; lint; typecheck; 7 tests; build | direct Core/Plite plugin + tx-group migration | closed |
| Resizable | plate-next | old umbrella hooks/transforms, atom casts, unchecked DOM events, and leaked dependency-internal declaration types | package-wide audits; lint; typecheck; 13 tests; build | direct current hooks/mutations, guarded events, portable resize types | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/media/src/react/placeholder/PlaceholderPlugin.spec.ts` | justify-new-proof-tooling | absent from origin/main; added after autoreview found inverted behavior | keep focused regression test | 97 Media tests and clean final autoreview |
| `packages/media` remainder | none | 106 tracked / 0 untracked at checkpoint zero | no extracted production source | manifest proof |
| `packages/mention` | none | 15 tracked / 0 untracked at checkpoint zero | no extracted source | manifest proof |
| `packages/resizable` | none | 20 tracked / 0 untracked at checkpoint zero | no extracted source | manifest proof |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| None | no failures | N/A | closed |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| None | none | N/A | closed |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | direct Core/Plite ownership across Media and Mention; current React/editor APIs in Resizable; transaction grouping, optional reads, DOM guards, portable types, and correct file-drop/embed behavior |
| tests/proof | migrated package tests to real editors, added focused Media file-drop regression coverage, and repaired fake-green validation/error rows |
| docs/templates/skills | this goal plan plus one major changeset per package; no product docs, templates, or skill edits |
| reverted/quarantined packets | none; no compatibility bridge or generated file kept |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| None | no user decision needed | all three packages meet the score/proof gate | this plan | continue with the next untouched package packet |

Findings:
- Media carried the heaviest drift: old editor APIs, colliding clipboard extensions, history compatibility logic, weak validation tests, selection-gated explicit insertion, and inverted `disableFileDrop` semantics.
- Mention needed one atomic insertion transaction to preserve selection behavior under deferred normalization.
- Resizable needed direct current hooks, guarded DOM events, and package-owned resize types to produce portable declarations.

Decisions and tradeoffs:
- Kept product behavior in Plate and editor substrate in Plite; no wrapper API or compatibility alias added.
- Preserved grouped transactions only where multiple mutations and selection placement must be atomic; one-shot reads/writes stay direct.
- Added one focused Media spec after autoreview because the public option regression deserved executable proof.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Direct handler test tried to replace frozen `editor.api.dom.resolveEventRange` | 1 | invoke the public `pipeHandler` pipeline instead | resolved; regression tests pass |

Verification evidence:
- Media: lint, source-first typecheck, 97 tests, and build pass.
- Mention: lint, source-first typecheck, 7 tests, and build pass.
- Resizable: lint, source-first typecheck, 13 tests, and build pass.
- Combined autoreview test gate: 117 tests pass; final review reports no actionable findings at 0.82 confidence.
- Combined source-first Turbo typecheck: 15/15 tasks pass for the three-package graph.
- Source audit: no umbrella `platejs`/Slate imports, old transforms/root option helpers, production explicit normalization, broad `any` casts, or unresolved compatibility bridge; one `{ required: true }` match is test-only fixture assertion.
- `git diff --check` passes for the scoped packages, changesets, lockfile, and plan.

Final handoff contract:
- target surface and mode: sequential full-package review of Media, Mention, then Resizable
- files/APIs reviewed: every tracked and new package file; 142 total rows
- broad Core drift score coverage: N/A; broad Core excluded and no Core file changed
- package file checklist coverage: 142/142 score 100; 0 missing, extra, unchecked, or deferred
- best Plate v2 recommendation: keep all three as clean Plate product packages over direct Core/Plite APIs
- verdict matrix summary: three keep-in-plate package rows, drift 0 after repair
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: nine package-scoped repair sweeps; all matches patched; 0 deferred
- out-of-scope matches discovered: none
- changes made: package migrations, behavior repairs, regression proof, metadata/lockfile updates, and three package-specific changesets
- tests/proof commands: package lint/typecheck/test/build plus combined test-backed autoreview
- old compatibility names audited: yes; no old production API/import/bridge remains
- needs attention: none
- next best Plate Next packet: let `plate-next` resolve the next untouched three packages from completed ledgers

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure |
| Where am I going? | Final plan checker, then handoff |
| What is the goal? | Close Media, Mention, and Resizable at score 100 with package proof and clean autoreview |
| What have I learned? | Media had two final behavior defects despite green package proof; reviewer-backed regression tests closed them |
| What have I done? | Reviewed and repaired 142 rows across three packages; all proof gates are green |

Timeline:
- 2026-07-13T08:23:24.743Z Goal plan created.
- 2026-07-13 Media closed before Mention with direct Core/Plite APIs and package proof.
- 2026-07-13 Mention closed before Resizable with atomic insertion/selection behavior proven.
- 2026-07-13 Resizable closed with portable declarations and guarded React/DOM behavior.
- 2026-07-13 Final autoreview defects repaired; combined 117-test gate and second autoreview clean.
- 2026-07-13 Final combined typecheck and autogoal completion checker pass.

Open risks:
- None inside the reviewed package scope. Browser/app caller proof is intentionally excluded by `plate-next` package-review mode.
