# plate-next table package review

Objective:
Review and repair every `packages/table` source/type-test file for a clean Plate
v2 package on Plite, with score-100 or explicit deferral per file.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-14-plate-next-table-package-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api

Plate Next source:
- prompt / link: user invoked `plate-next table`
- mode: full package-review mode
- target surface: all 156 current TypeScript/TSX files under `packages/table`,
  four stale test/fixture hard cuts from the initial 160-file manifest, package
  metadata, existing table changeset, and the smallest Plite/Core owner only if
  a proven blocker requires it
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, table package only
- package review mode: yes
- package review target: `packages/table`
- package file checklist gate: 160 rows materialized before implementation;
  reconciled to 156 current rows after four hard cuts;
  only score-100 rows may be checked
- completion threshold summary: all 156 current rows checked at 100, with four
  deleted rows recorded as hard cuts; table is added to `check:core`; focused and
  shared proof, same-class sweeps, autoreview, changeset, and plan gate pass

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
- requested duration: N/A: none requested
- semantics: N/A: one-shot package review
- initial confidence score: N/A: per-file score gate is the metric
- improvement loop: inventory, drift scan, review every file, repair safe
  package-local drift, prove, rescore, and repeat until all rows close
- final score / loop closure: 156 of 156 current rows score 100; four stale
  initial-manifest rows were hard-cut; no unchecked or deferred row

Completion threshold:
- Every one of the 156 current manifest files has a plan row with score,
  verdict, owner, evidence, and next action; four removed initial rows have a
  hard-cut ledger decision.
- Every row is checked only at score 100, or stays unchecked with an explicit
  deferral reason, owner, proof needed, and next action.
- Table behavior remains at least at `origin/main` parity while old Slate/Plate
  API shapes, fake casts, wrappers, and local inference patches are removed.
- `tooling/scripts/check-core.mjs` includes `table` before closure.
- Package tests/typecheck/lint, `pnpm check:core`, source audits, autoreview,
  changeset review, and the mechanical plan gate pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-table-package-review.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package tests plus focused specs for each corrected
  transform/plugin/normalizer behavior
- package proof: `pnpm turbo typecheck --filter=./packages/table`,
  `pnpm --filter @platejs/table test`, package lint, and build only if artifact
  exports require it
- shared Core gate: add `table` to `reviewedPackageSlugs`, then run
  `pnpm check:core`
- source audits: legacy editor APIs, `nextBlock`, fake casts/inferred local
  annotations, plugin option fallbacks, nested updates, explicit normalization,
  imports/dependencies, and extracted files
- related scoped sweep query / active scope / match count / patched count / deferred count:
  table-local legacy/API/cast/normalization sweeps / `packages/table/src` /
  zero unresolved / all actionable matches patched / zero deferred
- package file manifest / row count / checked count / deferred count:
  `rg --files packages/table | rg '\.(ts|tsx|mts|cts)$' | sort` / 156 / 156 / 0
- Plite/Plate gap ledger: none claimed before source audit; missing substrate is
  patched only at the smallest owner or explicitly deferred
- broad Core drift ledger gate: N/A: package review, not broad Core
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-table-package-review.md`

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
- allowed edit scope: `packages/table`, its existing table changeset,
  `tooling/scripts/check-core.mjs`, this plan, and the smallest Plite/Core owner
  only when table proves a blocker
- package/API surfaces: table base/react plugins, public helpers/types,
  transforms, queries, merge behavior, React hooks/components, package exports,
  dependencies, tests, and type contracts
- docs/browser surfaces: no docs/app edits or browser proof in package mode;
  package behavior tests are the owning surface
- non-goals: no unrelated package migration, no registry/docs edits, no file
  renames, no global caller rewrite, no compatibility aliases
- out-of-scope package errors: record and defer unless caused by table or a
  smallest-owner change in this packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only when a clean table migration requires a genuine public Plite/Plate
  API fork not already accepted, or the same owner failure persists through
  three distinct focused repair attempts with no safe next move.

Current verdict:
- verdict: `main-parity-cleanup` across table owners, with hard cuts for legacy
  insertion options and redundant mock-only tests/fixtures
- confidence: high after the complete 156-file current-manifest audit
- next owner: next unchecked package in `check:core`
- keep / revert / quarantine call: keep the per-owner Plite-native migration;
  reject the monolithic `TableExtension` donor and compatibility storage
- reason: table is product behavior in Plate, while generic editor primitives
  remain Plite-owned; no Plite/Core blocker remains

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact table package, no duration, package checklist, proof, stop, and handoff requirements recorded |
| `plate-next` skill/rule read | yes | User supplied the complete `plate-next` skill; applied as package-review mode |
| Active goal checked or created | yes | Goal created with this plan path |
| Mode classified as named packet vs broad Core sweep | yes | Full `packages/table` review; not broad Core |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Main is behavior evidence; final API is Plite-native Plate table |
| Broad Core drift ledger initialized when in scope | no | N/A: no broad Core sweep |
| Source of truth and allowed workspace recorded | yes | Current checkout, `origin/main`, VISION, manifest, package metadata, and existing changeset |
| Output budget strategy recorded | yes | Count-first searches, file clusters, capped reads, and plan rows instead of dumping all source |
| Public API fork routing checked | yes | No unaccepted fork yet; any discovered fork routes to `plate-plan` |
| Gap policy checked | yes | Smallest Plite/Core owner only for a proven blocker |
| Related scoped sweep policy checked | yes | Every correction gets a table-local same-class sweep |
| Review-mode rename freeze checked | yes | No file or symbol rename without explicit user acceptance |
| Package review checklist initialized when in scope | yes | 160 initial rows materialized; four stale rows hard-cut; 156 current rows reconciled |
| Package/API pack selected | yes | `package-api` materialized |
| Public surface or package boundary identified | yes | `@platejs/table` base/react exports and package metadata |
| Release artifact path selected | yes | Existing `.changeset/table-block-insert.md`; update only for final delta from `origin/main` |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read before table changeset review |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` only if exported files or barrel layout change |

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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Inventory and baseline | complete | Initial 160-row manifest, typecheck/test failures, and source drift captured | closed |
| API and behavior repair | complete | Per-owner Plite migration plus boundary and atomic-border fixes | closed |
| Package proof | complete | Typecheck, lint, and 268 tests pass | closed |
| Shared proof | complete | `table` added to `check:core`; all 43 lanes pass | closed |
| Review and closure | complete | Final autoreview clean; 156/156 current files score 100; mechanical gate passes | closed |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof | Package typecheck, 268 tests, lint, and `check:core` pass |
| Broad Core drift ledger coverage | no | N/A: package mode | No broad Core edits or claims |
| Score gate | yes | Close current manifest | 156/156 rows at score 100; 0 deferred |
| Best Plate v2 recommendation | yes | Record owner/API shape | Per-owner extensions and typed Plite transactions retained |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No blocking gap; no Core/Plite patch required |
| Related scoped sweep after correction | yes | Sweep table-local bug classes | 171 legacy imports, 410 `any` casts, and 272 legacy API matches reduced to 0 |
| Package file checklist | yes | Reconcile current manifest | 156 expected, 156 actual, 156 checked, 0 missing/extra/deferred |
| Package/API proof | yes | Run focused proof | Package typecheck/test/lint pass |
| Shared Core gate coverage | yes | Add reviewed package | `table` added; `pnpm check:core` passes |
| Non-Core package error triage | no | N/A | Shared gate reports no failures |
| Source audit | yes | Audit removed names | All named legacy/import/cast patterns return 0 production matches |
| Rename ledger | no | N/A | No rename pass; four redundant test/fixture files hard-cut in place |
| Extracted-file inventory | yes | Audit untracked table files | `git ls-files --others --exclude-standard packages/table` returns 0 |
| Autoreview / review | yes | Run structured review | Two in-scope cycles found boundary deletion, stale plan counts, and non-atomic border updates; all repaired with focused proof; final rerun clean with 0 accepted/actionable findings |
| Final lint/check | yes | Run lint and shared check | Package lint and `check:core` pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; no user decision needed |
| Goal plan complete | yes | Run mechanical plan gate | `check-complete.mjs` passes |
| Public API / package boundary proof | yes | Audit exports/API | Typed factories, selectors, queries, tx groups, and type contracts pass |
| Release artifact classification | yes | Classify published delta | Published major table API/runtime migration |
| Published package changeset | yes | Update changeset | `.changeset/table-block-insert.md` records factories, commands, and `nextBlock` cut |
| Registry changelog | no | N/A | No registry files touched |
| No release artifact | no | N/A | Published package delta requires changeset |
| Package typecheck/build/test | yes | Run owning checks | Typecheck, 268 tests, lint pass; artifact build covered by `check:core` dependencies |
| Barrel/export generation | no | N/A | No exported file layout/barrel change; deleted files were tests/fixture only |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `src/lib/BaseTablePlugin.ts` and `src/lib/with*` | 0 | main-parity-cleanup | table | typed factories/tx groups; per-owner extensions; behavior tests | closed |
| `src/lib/{api,merge,queries,transforms,utils}` | 0 | main-parity-cleanup | table | direct Plite reads/updates, live targets, grouped tx proof | closed |
| `src/react/**` | 0 | keep-in-plate | table/react | React-only keyboard, clipboard, DOM, hooks and stores | closed |
| specs and type contracts | 0 | main-parity-cleanup | table | 268 behavior/integration tests; no mock-only delegation assertions | closed |
| package metadata / changeset / `check:core` | 0 | main-parity-cleanup | release/tooling | direct deps, major changeset, shared gate | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `@platejs/table` | Existing owner files composed by `BaseTablePlugin`; root `editor.api.table` factories/queries; public typed `editor.update` command groups; React-only handlers in `TablePlugin` | umbrella `platejs`, `editor.tf`, root mutable editor fields, `nextBlock`, fake casts, monolithic `TableExtension`, plugin-editor portals, compatibility option storage | Preserves product ownership and behavior while using Plite primitives directly | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none | none | N/A | N/A | Package and shared proofs | No Plite/Core gap blocks table |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Legacy imports | `packages/table/src` | umbrella `platejs`, `platejs/react`, Slate imports | 171 on `origin/main`; 0 current | all table owners | 0 | none |
| Legacy editor surface | `packages/table/src` | `editor.tf`, root selection/children, flat query aliases, option fallbacks, `nextBlock`, `.editorApi` | 272 on `origin/main`; 0 current | all table owners | 0 | none |
| Fake type escapes | `packages/table/src` | `as any`, explicit `any`, generic `any` | 410 on `origin/main`; 0 current | production and tests | 0 | honest external test adapters only |
| Explicit normalization | `packages/table/src` | `tx.normalize` / `editor.update.normalize` | 7 | 0 production; 7 explicit normalizer tests retained | 0 | none |
| Boundary deletion review finding | `withDeleteTable*` | real Backspace/Delete integration at four table edges | 2 reproduced regressions | typed delete middleware + 4 integration rows | 0 | none after focused proof |
| Border transaction review finding | table border transform + selected-border React helper | history batch count plus one undo across two selected cells | 1 non-atomic toolbar command | `setBorderSizes` batch API + one-undo integration assertion | 0 | none after focused/full proof |
| Redundant files | current package manifest | compare each test/fixture to real behavior coverage | 4 | hard-cut 4 stale mock/fixture files | 0 | none |

Core drift ledger:
- Applies: no: package review only
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
| N/A | N/A | N/A | N/A | Package mode; no broad Core claim | N/A |

Package file checklist:
- Applies: yes
- Package: `@platejs/table`
- Manifest command: `rg --files packages/table | rg '\.(ts|tsx|mts|cts)$' | sort`
- Manifest owner:
  `packages/table/src/**/*.{ts,tsx,mts,cts}` plus
  `packages/table/type-tests/**/*.{ts,tsx,mts,cts}`.
- Expected row count: 156
- Actual row count: 156
- Checked score-100 count: 156
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Initial-manifest hard cuts: `TableExtension.spec.ts`,
  `withApplyTable.spec.ts`, `TableCellElement.fixtures.tsx`, and
  `setSelectedCellsBorder.spec.tsx` were redundant stale proof/fixtures.
- Next package blocked until: closed; every current row is score 100, final
  autoreview is clean, and the mechanical plan gate passes.

Package file rows:
- [x] `packages/table/src/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/BaseTablePlugin.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/BaseTablePlugin.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/__tests__/getTestTablePlugins.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/api/getEmptyCellNode.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/api/getEmptyRowNode.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/api/getEmptyTableNode.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/api/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/constants.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/deleteColumn.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/deleteColumn.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/deleteColumnWhenExpanded.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/deleteRow.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/deleteRow.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/deleteRowWhenExpanded.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/deleteRowWhenExpanded.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/findCellByIndexes.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/getCellIndicesWithSpans.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/getCellPath.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/getSelectionWidth.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/getSelectionWidth.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/getTableGridByRange.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/getTableGridByRange.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/getTableMergedColumnCount.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/insertTableColumn.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/insertTableColumn.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/insertTableRow.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/insertTableRow.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/isTableRectangular.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/isTableRectangular.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/mergeTableCells.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/splitTableCell.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/merge/tableMergeBehavior.slow.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/normalizeInitialValueTable.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getAdjacentTableCell.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getCellInNextTableRow.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getCellInNextTableRow.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getCellInPreviousTableRow.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getCellInPreviousTableRow.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getColSpan.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getLeftTableCell.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getNextTableCell.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getNextTableCell.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getPreviousTableCell.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getPreviousTableCell.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getRowSpan.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getSelectedCells.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getSelectedCells.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getSelectedCellsBorders.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getSelectedCellsBorders.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getSelectedCellsBoundingBox.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getSelectedCellsBoundingBox.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableAbove.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableCellBorders.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableCellBorders.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableCellSize.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableCellSize.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableColumnCount.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableColumnCount.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableColumnIndex.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableColumnIndex.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableEntries.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableEntries.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableGridAbove.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableGridByRange.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableGridByRange.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableOverriddenColSizes.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableOverriddenColSizes.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableRowIndex.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTableRowIndex.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTopTableCell.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/getTopTableCell.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/isTableBorderHidden.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/queries/isTableBorderHidden.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/deleteColumn.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/deleteColumn.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/deleteRow.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/deleteRow.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/deleteTable.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/deleteTable.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/insertTable.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/insertTable.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/insertTableColumn.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/insertTableColumn.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/insertTableRow.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/insertTableRow.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/moveSelectionFromCell.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/moveSelectionFromCell.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/setBorderSize.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/setBorderSize.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/setCellBackground.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/setCellBackground.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/setTableColSize.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/setTableMarginLeft.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/setTableMarginLeft.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/setTableRowSize.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/shouldMoveSelectionFromCell.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/shouldMoveSelectionFromCell.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/transforms/tableSelectionAndSizing.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/types.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/utils/computeCellIndices.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/utils/getCellIndices.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/utils/getCellIndices.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/utils/getCellRowIndexByPath.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/utils/getCellType.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/utils/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withApplyTable.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withApplyTable.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withDeleteTable.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withDeleteTable.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withGetFragmentTable.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withGetFragmentTable.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withInsertFragmentTable.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withInsertFragmentTable.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withInsertTextTable.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withInsertTextTable.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withNormalizeTable.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withNormalizeTable.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withSetFragmentDataTable.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withSetFragmentDataTable.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withTable.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withTable.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withTableCellSelection.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/lib/withTableCellSelection.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/TablePlugin.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableCellElement/getOnSelectTableBorderFactory.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableCellElement/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableCellElement/roundCellSizeToStep.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableCellElement/roundCellSizeToStep.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.integration.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableCellElement/useIsCellSelected.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableCellElement/useTableBordersDropdownMenuContentState.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableCellElement/useTableCellBorders.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableCellElement/useTableCellElement.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableCellElement/useTableCellElementResizable.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableCellElement/useTableCellSize.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableElement/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableElement/useSelectedCells.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableElement/useTableColSizes.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableElement/useTableElement.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/TableElement/useTableSelectionDom.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/components/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/hooks/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/hooks/useCellIndices.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/hooks/useTableMergeState.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/hooks/useTableMergeState.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/onKeyDownTable.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/onKeyDownTable.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/stores/index.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/src/react/stores/useTableStore.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed
- [x] `packages/table/type-tests/table-plugin-contracts.ts` — score: 100 — verdict: main-parity-cleanup — owner: table — evidence: source review + typecheck + 268 tests + lint + legacy audit — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Plugin/API | table | Half-migrated Slate editor surface and weak public ownership | `BaseTablePlugin.ts`, API/type contracts | Typed root table API plus insert/remove/table tx groups | closed |
| Runtime behavior | table | Monolithic donor would erase historical owners | `with*`, queries/transforms/merge | Preserve owner files and compose extensions | closed |
| React boundary | table/react | Clipboard/keyboard/DOM behavior must not leak into base plugin | `src/react/**`, clipboard helper | Keep React-only handling in `TablePlugin` | closed |
| Proof cleanup | table/tests | Mock delegation and dead fixtures hide behavior | specs + four deleted files | Replace with integration/behavior tests; hard-cut duplicates | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| none | N/A | `git ls-files --others --exclude-standard packages/table` returned 0 | No extracted/untracked package files | current manifest reconciled |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | `pnpm check:core` passed | No out-of-scope failure | N/A |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| none required | N/A | Sweeps were table-local by package-mode contract | next unchecked package |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Migrated factories, queries, selectors, transforms, merge/selection/clipboard/keyboard behavior to typed Plite APIs and transaction groups; restored table-boundary delete middleware |
| tests/proof | Repaired behavior tests, added real boundary/selection/merge/border integration coverage, removed mock-only duplicates and fake casts |
| docs/templates/skills | Updated package plan, major changeset, and `check:core` reviewed-package list |
| reverted/quarantined packets | Rejected monolithic `TableExtension` donor; hard-cut four redundant test/fixture files and stale compatibility option storage |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | No user decision required | Package has no unresolved gap or deferral | package/shared proof | Proceed to next unchecked package |

Findings:
- Baseline package typecheck reports 426 TypeScript errors. The dominant cause
  is a half-migrated table package that still consumes removed Slate/Plate
  editor names (`SlateEditor`, `createSlateEditor`, `createSlatePlugin`,
  `editor.tf`, root `editor.selection`, and flat query APIs).
- Baseline package tests load 73 files: 19 pass and 54 fail. Most failures are
  module-load errors from stale `platejs` umbrella imports; one direct spec has
  a hoisted mock initialization bug.
- Historical commit `9fe0552fd5` is not an acceptable donor: it deleted the
  table-owned `with*` modules and concentrated roughly 1,087 lines plus local
  compatibility types/matchers in `TableExtension.ts`.
- The clean owner shape already exists in reviewed packages: keep each behavior
  in its `with*` module as an `ExtendPlateEditorExtension<TableConfig>` and let
  `BaseTablePlugin` compose those extensions.

Decisions and tradeoffs:
- Preserve all existing table helper/normalizer/behavior files. Reject the
  historical monolithic extension and migrate each owner directly to Plite.
- Keep the package packet scoped to `packages/table`; touch Core/Plite only if a
  concrete missing primitive is proven after current API inspection.
- Keep table factories and queries under root `editor.api.table`; keep mutations
  under public transaction groups. Do not expose plugin-editor portals.
- Keep boundary deletion middleware because real Backspace/Delete integration
  reproduced table flattening before the middleware was wired.
- Remove legacy selector option storage while retaining current derived
  selectors backed by editor selection and private cache overrides.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm --filter @platejs/table typecheck`: 426 errors | 1 | Migrate package owners to current Core/Plite APIs, then rerun focused typecheck | resolved: 0 errors |
| `pnpm --filter @platejs/table test`: 19 pass / 54 fail files | 1 | Remove stale umbrella/legacy API imports and repair behavior proof | resolved: 268 pass / 0 fail |
| Historical migrated donor deletes helper owners | 1 | Use it only as archaeology; preserve module ownership and implement current extension callbacks | rejected donor |
| First autoreview: table boundary delete middleware missing | 1 | Reproduce through real public Backspace/Delete commands | accepted; 2 regressions reproduced, middleware wired, 4 boundary rows pass |
| First autoreview: stale 160/0 plan counts | 1 | Reconcile after four hard cuts | accepted; 156 expected/actual/checked, 0 deferred |
| Second autoreview: selected-border action opened multiple updates | 1 | Classify after the two-cycle pause, then prove history behavior | accepted as in-scope; batch API applies all writes in one transaction and one undo reverts all cells |

Verification evidence:
- `pnpm --filter @platejs/table typecheck` — pass.
- `pnpm --filter @platejs/table test` — 268 pass, 0 fail after boundary repair.
- `pnpm --filter @platejs/table lint:fix` — pass, no fixes remaining.
- `bun test --preload ../../config/plite-source-test-setup.ts ./src/lib/withDeleteTable.spec.tsx`
  — 9 pass, 0 fail.
- Focused border transform/integration proof — 13 pass, 0 fail; selected-cell
  border action records one history batch and one undo reverts both cells.
- `pnpm check:core` — pass across 43 Core/reviewed packages, type contracts,
  lint, dependency builds, and all package tests.
- Final `autoreview --mode local` — clean; 0 accepted/actionable findings.
- Source audits — 0 umbrella imports, 0 legacy editor API matches, 0 `any`
  casts, 0 production explicit normalization calls.
- Browser proof — N/A: package mode has no owning app/docs route change.

Final handoff contract:
- target surface and mode: full `@platejs/table` package review
- files/APIs reviewed: 156 current TS/TSX files plus package metadata,
  changeset, four hard cuts, and shared gate inclusion
- broad Core drift score coverage: N/A; no broad Core claim
- package file checklist coverage: 156/156 score 100; 0 deferred/missing/extra
- best Plate v2 recommendation: per-owner table extensions over typed Plite
  reads/API/tx groups; React-only behavior in `TablePlugin`
- verdict matrix summary: runtime/API/tests `main-parity-cleanup`; React
  `keep-in-plate`; four redundant files and compatibility storage `hard-cut`
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: table-local
  legacy imports/APIs/casts/normalization/transaction/delete boundaries; all
  actionable matches patched; 0 deferred
- out-of-scope matches discovered: none required for this package packet
- changes made: typed migration, behavior repairs, test cleanup, changeset,
  `check:core` inclusion
- tests/proof commands: package typecheck/268 tests/lint, boundary focused test,
  `pnpm check:core`, source audits, final autoreview and plan gate
- old compatibility names audited: yes; all named current-source counts are 0
- needs attention: none
- next best Plate Next packet: next package absent from the reviewed list

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final review/proof closure |
| Where am I going? | Clean table handoff, then next unchecked package |
| What is the goal? | Score-100 Plite-native `@platejs/table` package |
| What have I learned? | Per-owner migration works; boundary delete needs explicit middleware |
| What have I done? | Migrated, swept, proved, reviewed, and added table to `check:core` |

Timeline:
- 2026-07-14T11:11:33.798Z Goal plan created.
- 2026-07-14T11:14:00.000Z Materialized all 160 package file rows before implementation; captured typecheck/test and legacy-source baselines.
- 2026-07-14T11:20:00.000Z Rejected the historical monolithic `TableExtension.ts` donor and selected per-owner extension migration.
- 2026-07-14T12:25:00.000Z Closed package typecheck, 266-test, lint, source-audit, and shared `check:core` gates.
- 2026-07-14T12:40:00.000Z Accepted autoreview boundary-delete finding, reproduced both adjacent-table regressions, wired typed middleware, and added four real boundary tests.
- 2026-07-14T12:45:00.000Z Reconciled four hard cuts to a 156-file current manifest with every row score 100.
- 2026-07-14T12:55:00.000Z Accepted the second autoreview finding after the two-cycle scope pause; batched selected-border writes into one undoable transaction and replaced the spy assertion with history proof.
- 2026-07-14T13:10:00.000Z Final autoreview returned clean with no accepted/actionable findings; final `check:core` rerun passed all 43 package lanes.
- 2026-07-14T13:15:00.000Z Mechanical goal-plan gate passed; package packet closed.

Open risks:
- None.
