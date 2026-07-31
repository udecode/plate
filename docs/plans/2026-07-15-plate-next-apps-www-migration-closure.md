# plate next apps www migration closure

Objective:
Close `apps/www` Plate Next migration drift: remove stale migration-ledger
exceptions, preserve only intentional upstream Slate comparison code, and prove
the app and migration audit are green.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-15-plate-next-apps-www-migration-closure.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked whether `apps/www` is fully migrated, then said
  `ok go, following well plate-next`.
- mode: named app migration-closure packet
- target surface: `apps/www` migration scanner rows and their owning audit tool
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, all `apps/www` Slate-import
  overrides and live hits
- package review mode: no
- package review target: N/A: app surface, not `packages/<name>`
- package file checklist gate: N/A: app review mode
- completion threshold summary: zero stale app override rows; every live direct
  Slate import is intentional quarantine; both www type surfaces, migration
  scanner, scoped lint/review, and final plan checker pass

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
- semantics: N/A: no timed request
- initial confidence score: N/A: binary audit threshold
- improvement loop: inspect -> correct owner -> sweep -> prove -> review
- final score / loop closure: binary gates only

Completion threshold:
- `apps/www` has zero stale migration override rows.
- Every live bare Slate import under `apps/www/src` is either removed or has an
  exact current quarantine reason; the upstream comparison benchmark remains.
- The scoped source audit proves no stale override remains for the reviewed app
  scope.
- `tsc --noEmit` passes for `apps/www/tsconfig.json` and
  `apps/www/tsconfig.package-integration.json`.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-plate-next-apps-www-migration-closure.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: migration scanner plus direct app TypeScript checks
- package proof: N/A: app review, no package source change planned
- shared Core gate: N/A: no Core/package change
- source audits: live direct Slate imports, override rows, stale old Plate/Slate
  import/API markers, and scanner stale-override behavior
- related scoped sweep query / active scope / match count / patched count / deferred count:
  migration-scanner bare-Slate regex over `apps/www/src` plus bidirectional
  app override matching; 3 live lines, 2 overrides, 2 stale rows patched, 0
  deferred in app scope
- package file manifest / row count / checked count / deferred count: N/A
- Plite/Plate gap ledger: N/A unless audit exposes a substrate/product blocker
- broad Core drift ledger gate: N/A: no Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-plate-next-apps-www-migration-closure.md`

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
- allowed edit scope: `docs/plans/artifacts/plate-slate-v2-migration/` audit
  owner, this goal plan, and only the smallest `apps/www` source owner if a live
  non-quarantined migration defect is proven
- package/API surfaces: no public package API change
- docs/browser surfaces: generated registry output is excluded; Browser is N/A
  unless runtime source changes
- non-goals: do not remove or rewrite the upstream Slate comparison pane; do
  not broad-sweep packages/Core; do not edit generated registry JSON
- out-of-scope package errors: record, do not fix, unless caused by this packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Count/file-list before printing app-wide matches; exclude generated registry,
  `.next`, `node_modules`, and generated release/docs data.

Blocked condition:
- Stop only if the same audit/typecheck blocker repeats for three goal turns
  and no smaller source fix or focused proof remains.

Current verdict:
- verdict: `main-parity-cleanup`: keep intentional benchmark quarantine; cut
  stale ledger exceptions and strengthen the audit owner
- confidence: 1.00 after correction and proof
- next owner: plate-next
- keep / revert / quarantine call: keep benchmark quarantine; cut stale rows
- reason: a benchmark needs upstream Slate as a real comparison, while stale
  exception metadata makes the migration ledger lie

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| 1. App migration truth | complete | Plite-backed creator route and exact app Slate footprint read. | None. |
| 2. Ledger correction | complete | Two false `editor-perf` quarantine rows deleted; genuine benchmark rows retained. | None. |
| 3. Related sweep and proof | complete | Zero stale/unclassified app rows; scanner, app types, Biome, and diff check pass. | Final mechanical checker. |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target, non-goals, threshold, proof, and handoff recorded above. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read completely. |
| Active goal checked or created | yes | Goal created for this exact plan and threshold. |
| Mode classified as named packet vs broad Core sweep | yes | Named `apps/www` migration-closure packet; not Core/package mode. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Preserve genuine upstream benchmark; cut stale compatibility/accounting sludge. |
| Broad Core drift ledger initialized when in scope | no | N/A: no Core sweep. |
| Source of truth and allowed workspace recorded | yes | Live `apps/www/src`, migration scanner/overrides, and Plate/Plite vision in this checkout. |
| Output budget strategy recorded | yes | Counts/file lists first; generated/noisy trees excluded. |
| Public API fork routing checked | no | N/A: audit metadata/tooling only; no public API fork. |
| Gap policy checked | yes | No gap currently; any discovered blocker must name Plite/Plate owner. |
| Related scoped sweep policy checked | yes | Sweep every app override/live direct Slate hit after correction. |
| Review-mode rename freeze checked | yes | No rename planned. |
| Package review checklist initialized when in scope | no | N/A: app review mode. |

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
- [x] Direct one-shot API audit closed: N/A for metadata-only correction;
      single-operation
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic.
- [x] Live node target and matcher audit closed: N/A for metadata-only
      correction; no supplied live node is
      rediscovered by type/ID, no flat `api.findPath` / `api.some` alias remains
      in scope, equality-only callbacks use property matchers, and every
      remaining predicate has computed/path/truthiness/narrowing semantics.
- [x] Optional public-read audit closed: N/A for metadata-only correction;
      feature-package production code does
      not use `{ required: true }` or non-null assertions to hide unresolved
      Plite reads; each match handles `undefined` or records a Plite-internal
      invariant reason.
- [x] Explicit normalization audit closed: N/A for metadata-only correction;
      every `tx.normalize(...)` and
      `editor.update.normalize(...)` match in scope has a ledger verdict;
      feature production calls have a named full-root semantic invariant or are
      cut/moved to the Plite owner; explicit normalizer tests remain test-only
      evidence rather than production precedent.
- [x] Plugin export inference audit closed: N/A for metadata-only correction;
      plugin export annotations/casts
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
- [x] Empty config inference audit closed: N/A for metadata-only correction;
      `PluginConfig<'key'>` aliases and
      `createBasePlugin<Config>` generics are removed when the config has no
      typed options, API, tx, selectors, state, or external public contract.
- [x] Plugin extension options audit closed: N/A for metadata-only correction;
      plugin-owned extension options are
      returned directly from `extendExtension`; `defineEditorExtension` remains
      only for standalone Plite extensions, existing built extensions, or
      explicit non-plugin extension identities.
- [x] Bridge scoring law applied: N/A; no bridge is changed or retained by this
      metadata packet. Forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation; N/A:
      no public API fork exists.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is N/A; app TypeScript proof passed after the
      metadata correction.
- [x] `pnpm brl` is N/A because no export/barrel changed.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Zero stale/unclassified app rows; both www TypeScript graphs and scanner pass. |
| Broad Core drift ledger coverage | no | Record manifest coverage when broad Core sweep applies | N/A: app metadata packet. |
| Score gate | yes | Prove inspected rows are fixed/owned/deferred | Stale rows cut; intentional benchmark quarantine kept; out-of-scope global drift deferred. |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Plate uses Plite; raw upstream Slate stays only where it is the benchmark subject. |
| Plite/Plate gap ledger | no | Record blockers or N/A | N/A: no missing runtime/product capability. |
| Related scoped sweep after correction | yes | Review same-class app matches | 3 live imports, 2 matching overrides, 0 stale, 0 unclassified. |
| Package file checklist | no | Record package manifest when package review applies | N/A: app review mode. |
| Package/API proof | no | Run package proof or record N/A | N/A: no package source/API changed. |
| Shared Core gate coverage | no | Update Core gate when applicable | N/A: no Core/package change. |
| Non-Core package error triage | no | Classify unrelated failures if encountered | N/A: all scoped commands passed. |
| Source audit | yes | Audit removed compatibility rows | Exact app override/live-import audit passes. |
| Rename ledger | no | Record postponed renames when applicable | N/A: no rename proposed or applied. |
| Extracted-file inventory | yes | Inventory untracked files in target trees | 3 unrelated app files found and kept outside allowed edit scope; none in migration artifact owner. |
| Autoreview / review | no | Run for non-trivial implementation diffs or record N/A | N/A: two stale JSON rows plus deterministic summary regeneration; review matrix and exact audits cover the packet. |
| Final lint/check | yes | Run scoped lint/check | Biome JSON check, both app TypeScript graphs, and `git diff --check` pass. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; 28 non-app stale override rows deferred to the audit-owner packet. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-plate-next-apps-www-migration-closure.md` | Passed with `[autogoal] complete`. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `hit-overrides.json` editor-perf rows | 4 | `hard-cut` | migration audit | Source has no upstream Slate imports; rows were false quarantine. | Deleted. |
| `huge-document-demo.tsx` upstream imports | 0 | `keep-in-plate` / quarantine | benchmark example | Three live imports provide a real upstream comparison pane. | Keep with two matching reasons. |
| `apps/www/package.json` Slate deps | 0 | `keep-in-plate` | benchmark app | `slate` and `slate-react` are imported by the comparison pane; `slate-dom` supports that peer stack. | Keep. |
| migration `summary.md` | 2 | `main-parity-cleanup` | migration scanner | Summary still named deleted `slate-legacy` as top owner. | Regenerated from live source. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `apps/www` upstream Slate footprint | Plate-created editors use Plite; direct upstream Slate exists only in the explicit comparison benchmark. | Removing the comparison, routing it through Plate, or keeping stale quarantine rows. | A benchmark needs a real independent baseline; product runtime needs one Plite owner. | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No missing capability. | N/A | N/A | App source audit and typechecks | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Remove stale `editor-perf` quarantine | `apps/www/src` plus app rows in `hit-overrides.json` | Same bare-Slate regex as migration scanner; bidirectional override/live-hit match | 3 live lines / 2 overrides | 2 stale override rows | 0 in app scope | Only intentional huge-document comparison remains. |

Core drift ledger:
- Applies: no: app review mode
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
| N/A | N/A | N/A | N/A | No Core sweep. | N/A |

Package file checklist:
- Applies: no: app review mode
- Package: N/A
- Manifest command: N/A
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: N/A
- Actual row count: N/A
- Checked score-100 count: N/A
- Unchecked/deferred count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A

Package file rows:
- [x] N/A: no package review checklist applies to `apps/www` app mode.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| App migration ledger truth | migration audit | Two app quarantine rows refer to imports that no longer exist. | `hit-overrides.json`; exact app sweep | Hard-cut stale rows; keep benchmark rows. | Prove types/scanner/plan. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `apps/www/src/registry/changelog/2026-07-13-use-installed-block-insert-commands.json` | N/A: outside allowed edit scope | Absent on `origin/main`; unrelated user changelog source. | Preserve untouched. | Unrelated to Slate/Plite migration hits. |
| `apps/www/src/registry/changelog/entries/2026-07-13-use-installed-block-insert-commands.mdx` | N/A: outside allowed edit scope | Absent on `origin/main`; unrelated user changelog source. | Preserve untouched. | Unrelated to Slate/Plite migration hits. |
| `apps/www/src/registry/components/editor/plate-to-html.tsx` | N/A: outside allowed edit scope | Absent on `origin/main`; referenced by the current registry feature. | Preserve untouched. | No direct Slate import or target migration marker. |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | All scoped commands passed. | N/A | N/A |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| 28 stale non-app rows in `hit-overrides.json` | Core/Diff historical migration metadata | Correction Sweep Law forbids widening an app packet into package cleanup. | Next migration-audit owner packet. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none |
| tests/proof | exact bidirectional app override/import audit |
| docs/templates/skills | removed 2 stale app overrides; regenerated migration summary; updated goal plan |
| reverted/quarantined packets | kept the real huge-document upstream comparison quarantine |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | 28 stale non-app override rows | They make the global historical migration metadata noisy, but do not affect app truth. | `hit-overrides.json` outside app rows | Run the next migration-audit cleanup packet, package-owned and source-verified. |

Findings:
- Normal `createPlateEditor` / `usePlateEditor` routes are Plite-backed.
- `editor-perf` already uses raw Plite for its baseline; its two upstream-Slate
  override rows were stale.
- The huge-document registry demo intentionally imports upstream Slate and
  Slate React for a real side-by-side benchmark.
- The global override file has 28 additional stale non-app rows; they are
  outside this app packet and explicitly deferred.

Decisions and tradeoffs:
- Hard-cut false quarantine metadata; do not delete the independent benchmark
  baseline just to achieve a dishonest zero-import badge.
- Keep this packet app-scoped; do not mutate Core/Diff metadata discovered by
  the broader source audit.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial diagnostic scanner regenerated its summary during the preceding read-only status turn. | 1 | Restore it then regenerate only after explicit implementation authority. | Restored before authorization; this packet intentionally regenerated it from live source. |
| First completion check found the generated plan lacked a materialized phase/status row. | 1 | Add the app packet's actual three execution phases instead of weakening the checker. | Phase table added with source, correction, and proof evidence. |

Verification evidence:
- `node .../scan-plate-slate-migration.mjs` -> 5,202 files scanned, command
  exits 0, current summary regenerated.
- Bidirectional app override/live-import audit -> 3 live lines, 2 overrides,
  0 stale, 0 unclassified.
- `pnpm --filter www exec tsc --noEmit -p tsconfig.json` -> pass.
- `pnpm --filter www exec tsc --noEmit -p tsconfig.package-integration.json`
  -> pass.
- `pnpm exec biome check .../hit-overrides.json .../summary.md` -> pass.
- `git diff --check -- <packet files>` -> pass.
- Global stale-override accounting -> 28 deferred non-app rows, 0 app rows.
- `check-complete.mjs` -> `[autogoal] complete`.

Final handoff contract:
- target surface and mode: named `apps/www` migration-ledger closure
- files/APIs reviewed: app direct Slate imports, app override rows, package
  deps, benchmark owners, scanner output
- broad Core drift score coverage: N/A
- package file checklist coverage: N/A
- best Plate v2 recommendation: Plite-backed app; real upstream comparison only
- verdict matrix summary: 2 stale rows hard-cut; benchmark quarantine kept
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: 3 live lines,
  2 live overrides, 2 stale rows patched, 0 app deferrals
- out-of-scope matches discovered: 28 stale non-app override rows
- changes made: override cleanup and deterministic migration summary refresh
- tests/proof commands: scanner, two TypeScript graphs, Biome, diff check
- old compatibility names audited: bare Slate imports and stale app overrides
- needs attention: only the deferred global override cleanup
- next best Plate Next packet: global migration override-ledger cleanup by owner

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | App migration packet implemented and verified |
| Where am I going? | Final checklist/checker closure |
| What is the goal? | Honest `apps/www` migration ledger with only intentional Slate quarantine |
| What have I learned? | App runtime is Plite-backed; only the huge-document comparison needs upstream Slate |
| What have I done? | Cut 2 stale rows, regenerated summary, swept app hits, and passed app proof |

Timeline:
- 2026-07-15T07:53:27.694Z Goal plan created.
- 2026-07-15 App override/source inventory classified; two stale editor-perf
  rows identified and removed.
- 2026-07-15 App correction sweep and TypeScript/scanner/lint proof passed.
- 2026-07-15 Final global/app accounting and mechanical goal-plan checker
  passed.

Open risks:
- 28 stale non-app historical override rows remain deferred to their own
  migration-audit packet; no app migration risk remains.
