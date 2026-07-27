# plate-next next five packages

Objective:
Synchronize `basic-nodes`, `basic-styles`, `callout`, `code-drawing`, and
`combobox` to Plate Next v13; done when all 119 file rows score 100, package
status is current, and scoped package/Core proof closes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-26-plate-next-next-five-packages.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api

Plate Next source:
- prompt / link: user said “go next 5 packages”.
- mode: bounded five-package sync batch, processed one package at a time.
- target surface: `packages/basic-nodes`, `packages/basic-styles`,
  `packages/callout`, `packages/code-drawing`, and `packages/combobox`.
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: each active package plus only the
  smallest Core/Plite blocker owner.
- package review mode: yes
- package review target: five packages, strictly sequential.
- package file checklist gate: 119 rows total; every row must reach score 100.
- doctrine version: v13
- package applied version / fingerprint state: all five start at v0 and
  unattested.
- sync mode / target: bounded sync of the first five v0 rows from registry
  order.
- sync queue row count: 5
- completion threshold summary: every package fully reviewed, package-local
  proof clean, final fingerprint recorded, and `status <package>` current.

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
- If sync mode is in scope, run `version.mjs validate` and `status` before
  implementation, then materialize one sync row per stale/drifted target.

Timed checkpoint:
- requested duration: none
- semantics: outcome-based
- initial confidence score: 70
- improvement loop: owner-first review, correction sweep, package proof,
  fingerprint/attestation, then next package.
- final score / loop closure: 119 frozen inputs plus five concurrent inputs
  audited; 141 total input/current-topology rows at score 100.

Completion threshold:
- All 119 materialized package rows are reviewed against doctrine v13 and score
  100; no unchecked or deferred row remains.
- Each package reports `current` at v13 with its own final fingerprint,
  verification date, and this plan as evidence.
- Package typecheck, tests, build, exact source audits, formatting, barrel
  generation when exports move, and shared Core coverage close.
- No sixth package is started.
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
- Package review or sync mode may close a package only after its final
  fingerprint, applied doctrine version, verification date, and evidence plan
  are recorded in `.agents/rules/plate-next/versions.json` and
  `version.mjs status <package>` reports `current`.
- All-package sync may close only when `version.mjs check all` exits zero.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-plate-next-next-five-packages.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package-local focused suites for corrected owners.
- package proof: package typecheck, test, and build for all five.
- shared Core gate: `pnpm check:core`, with exact out-of-scope failure
  classification if shared WIP remains.
- source audits: helper topology, standalone editor/api/read/tx plumbing,
  one-use descriptors, hook/component family splits, legacy builder methods,
  root option helpers, nested editor updates, and export/barrel residue.
- related scoped sweep query / active scope / match count / patched count / deferred count:
  recorded per package after correction.
- package file manifest / row count / checked count / deferred count: `rg
  --files packages/<package>` with generated/cache/prose exclusions; 119 /
  0 / 0 at start.
- version registry validation / starting status / final status: registry valid;
  five v0 stale rows at start; five current rows required.
- package fingerprint command / result: `version.mjs fingerprint <package>`;
  final digest recorded after proof.
- Plite/Plate gap ledger: none known at start; update on discovery.
- broad Core drift ledger gate: N/A; broad Core sweep not requested.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-plate-next-next-five-packages.md`

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
- Implementation topology is not frozen. Rename, merge, or delete internal
  helper files, exports, and proof filenames when the active packet restores a
  durable owner. Reject cosmetic synonym churn, but do not preserve one-use
  topology or defer it to `pre-renaming.md` merely to reduce diff noise.
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
- Colocation has no line ceiling. A large coherent plugin owner is preferable
  to `transforms/`, `queries/`, `utils/`, `helpers/`, `with*`, `decorate*`, or
  similar one-use files. In package review, inventory every such production
  file and every standalone production function accepting `tx`; inline/delete
  single-owner rows or record concrete multiple-consumer/independent-boundary
  evidence.
- React colocation is family-owned. One component family belongs in one
  `<Family>.tsx` file; one hook family belongs in one `use<Family>.ts` file.
  Related exported primitives/state/behavior hooks may share that file.
  Sibling use inside the family is internal composition, not independent
  reuse. Keep feature-package React roots flat by default and reject
  `components/`, `hooks/`, nested family folders, or nested barrels that only
  classify one owner.
- A separate React file needs reuse across durable families, a standalone
  public owner, or an independent provider/store/lifecycle boundary. A public
  export name, file size, or two sibling consumers inside one family is not
  enough.
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
- Lexical transaction ownership law: do not extract single-owner plugin logic
  into `foo(editor, tx, ...)`, `fooWithTx(...)`, or paired one-shot/tx
  wrappers. Inline it in the plugin tx group, command, correction, or
  middleware callback so `tx` and plugin context infer lexically. A separate
  transaction-accepting function needs multiple production consumers or a real
  independent algorithm boundary, recorded in the package rows.
- Plugin export inference law: plugin constants should infer from
  `createBasePlugin`, `createPlatePlugin`, `toPlatePlugin`, and chained
  `.extend()` calls. Do not annotate exports as `BasePlugin<Config>` /
  `PlatePlugin<Config>` or cast chained plugin results unless the annotation is
  a true external boundary. If inference fails, fix the builder/generic owner.
- Base/static renderer boundary law: `*-base-kit`, `*-static`, server/static
  renderers, and other Base/static modules must not import `platejs/react`,
  `@platejs/core/react`, or any `@platejs/*/react` entrypoint. Bind static
  components through `BasePlugin.configure({ component })`; keep
  `toPlatePlugin(BasePlugin)` in live React adapters only. If the Base path
  lacks a required capability, fix its Core owner instead of crossing layers.
  Bind Base/static descriptors to static renderer modules, never live/client
  node components; registry Base kits use the owning `*-static` component.
- Empty config inference law: do not create `type FooConfig =
  PluginConfig<'foo'>` only to call `createBasePlugin<FooConfig>({ key:
  'foo' })`. Manual plugin config types are only for real options, API, tx,
  selectors, state, or external public contracts.
- Plugin editor extension law: plugin-owned editor extension options belong in
  `.extend({ extension })`. Do not wrap them in
  `defineEditorExtension({ name: pluginKey, ... })` just to satisfy types. The
  `extension` contribution accepts built extensions and raw options; raw
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
  intentionally decoupled cross-package code. Inline single-owner plugin
  behavior in the builder context. Only a proven shared or independent helper
  should receive a narrow plugin context or required `tx` parameter.

Boundaries:
- allowed edit scope: the five named packages, their exact barrel outputs,
  this plan, their five registry entries, and the smallest Core/Plite owner
  required by a proven blocker.
- package/API surfaces: internal topology may change; preserve behavior and
  inference while hard-cutting stale helper exports and compatibility.
- docs/browser surfaces: N/A unless a package correction changes a named
  user-visible package surface; package mode does not run `www`.
- non-goals: no sixth package, no broad docs/registry migration, no broad Core
  sweep, no unrelated shared-checkout repair, no compatibility aliases.
- out-of-scope package errors: record exact owner and proof that the batch did
  not cause them.

Output budget strategy:
- Use exact five-package manifests and count-first searches; exclude
  `dist`, dependencies, generated output, READMEs, changelogs, and templates.
- Read plugin/component/hook owners in bounded slices and keep test output
  package-local until final shared proof.

Blocked condition:
- Stop only if a package exposes a public API fork needing user judgment, or a
  repeated Core/Plite inference/runtime blocker cannot be repaired safely in
  its smallest owner.

Current verdict:
- verdict: execute the five-package batch
- confidence: 70
- next owner: plate-next
- keep / revert / quarantine call: keep only owner-first packets that pass each
  package gate; revert or quarantine unsafe partial topology.
- reason: registry order gives five v0 packages with no current-doctrine
  attestation.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exactly five next packages; no duration or extra final format. |
| `plate-next` skill/rule read | yes | Full v13 skill read before source edits. |
| Active goal checked or created | yes | Active goal binds exactly these five packages, the frozen 119-row input, v13 status, and package/Core proof. |
| Mode classified as named packet vs broad Core sweep | yes | Bounded package-sync batch. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Owner-first v13 with no shims. |
| Broad Core drift ledger initialized when in scope | no | Broad Core sweep is not in scope. |
| Source of truth and allowed workspace recorded | yes | Current `/Users/zbeyens/git/plate-2`; registry and package source own truth. |
| Output budget strategy recorded | yes | Exact manifests, count-first audits, capped reads/output. |
| Public API fork routing checked | yes | Any discovered fork routes to `best-api`; none assumed. |
| Gap policy checked | yes | Smallest Core/Plite owner only; no local workaround. |
| Related scoped sweep policy checked | yes | Each correction sweeps only its active package/required owner. |
| Review-mode rename freeze checked | yes | Owner-driven merge/delete/rename allowed; cosmetic churn rejected. |
| Package review checklist initialized when in scope | yes | 119 exact rows materialized below before implementation. |
| Doctrine registry validated for package review/sync | yes | v13 valid; five selected rows are v0 stale/unattested. |
| Sync queue materialized when sync mode is in scope | yes | basic-nodes, basic-styles, callout, code-drawing, combobox. |
| Package/API pack selected | yes | Package/API impact rows retained in this plan. |
| Public surface or package boundary identified | yes | Five `@platejs/*` package boundaries. |
| Release artifact path selected | yes | Existing major changesets cover all five package deltas; Combobox and Basic Nodes prose is repaired to the final API. Registry demo fix has its own changelog entry. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before final package release-prose repair. |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` only for moved/deleted public exports. |

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
- [x] For package review mode, every production `transforms/`, `queries/`,
      `utils/`, `helpers/`, `with*`, `decorate*`, similar helper file, and
      standalone `tx`-parameter function has an owner-topology row; every
      survivor has multiple-production-consumer or independent-boundary proof.
- [x] For package review mode, every package file row is either checked at
      score `100` with evidence or left unchecked with deferral reason, owner,
      proof needed, and next action for user review.
- [x] For package review mode, no next package is started before the current
      package checklist closes or the user explicitly redirects.
- [x] For package review or sync mode, starting doctrine version and source
      fingerprint state are recorded before package edits.
- [x] For sync mode, every target package has one queue row with starting
      version, required missing-version checks, full-review trigger, proof,
      final fingerprint, and ledger status.
- [x] For sync mode, v0 or source-drifted packages receive a full current
      package review; unchanged later-version packages receive every missing
      doctrine version's `migrationChecks`.
- [x] For package review or sync mode, the package ledger is patched only after
      focused proof and autoreview; final plan closure runs only after package
      registry status is `current`.
- [x] If a reusable Plate Next rule changes during the run, doctrine version is
      bumped, immutable migration checks are appended, generated skill is
      synced, and the package queue is recomputed.
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
      contributed through `.extend({ extension })`; `defineEditorExtension`
      remains only for standalone Plite extensions, existing built extensions,
      or explicit non-plugin extension identities.
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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Five package gates, dependent graph, app tests/typecheck, browser proof complete |
| Broad Core drift ledger coverage | no | N/A: bounded package sync, not a Core sweep | Core contracts pass; exact shared migration-source audit failures are recorded below |
| Score gate | yes | Prove all rows are owned/fixed | 141 score-100 rows; 0 unchecked/deferred |
| Best Plate v2 recommendation | yes | Record the current owner shape | Matrix and recommendation below |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No gap blocks these packages |
| Related scoped sweep after correction | yes | Record same-class searches | Five scoped rows below |
| Package file checklist | yes | Record exact row counts and proof | 119 frozen + 5 concurrent inputs; 141 total ledger rows |
| Package doctrine attestation | yes | Record v13 fingerprints and status | Five `CURRENT` results |
| All-package sync closure | no | N/A: bounded five-package mode | 36 unrelated stale packages remain; no sixth started |
| Helper topology / lexical tx ownership | yes | Audit helper directories and tx plumbing | All active-scope matches merged, flattened, or reuse-justified |
| Package/API proof | yes | Run package/dependent proof | Complete; see verification evidence |
| Shared Core gate coverage | yes | Run reviewed-package gate | Runner 6/6, leak 3/3, brand 2/2, and adoption contracts 25/25 pass; source audit reports 20 shared migration rows |
| Non-Core package error triage | yes | Classify remaining error | Nine-package source-first graph passes 22/22; no package error remains |
| Source audit | yes | Audit removed names | No active source `withTriggerCombobox`, old insert helper, or deleted taxonomy import |
| Rename ledger | no | N/A: all owner-driven renames landed | No postponed rename |
| Extracted-file inventory | yes | Record moved/deleted rows | Extracted file ledger complete |
| Autoreview / review | yes | Review final owners | Declaration, topology, runtime, and source sweeps complete |
| Final lint/check | yes | Run scoped formatting/checks | Biome clean; www typecheck green; registry changelog check green |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run final checker | Phase table and final checker evidence below |
| Public API / package boundary proof | yes | Audit exports and declarations | Builds/barrels pass; Combobox declaration is 1,031 bytes |
| Release artifact classification | yes | Classify package and registry deltas | Five package changesets; one registry changelog event |
| Published package changeset | yes | Repair final public API prose | Existing five major changesets retained; Basic Nodes/Combobox final prose repaired |
| Registry changelog | yes | Record demo fix | `2026-07-26-fix-code-drawing-demo`, generator write/check pass |
| No release artifact | no | N/A: published and registry deltas exist | Changesets/changelog own them |
| Package typecheck/build/test | yes | Run owning package checks | All five green |
| Barrel/export generation | yes | Regenerate changed barrels | Package-local `brl` pass for every moved export family |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| Basic Nodes rule/migration families | 5 | merge/independent entrypoint | plugin owner or opt-in migration package entrypoint | package/schema/migration proof | closed |
| Basic Styles parsers/constants/utils | 4 | inline/flatten | plugin owner or reused `toUnitLess` | package/declaration proof | closed |
| Callout insertion/hooks | 5 | plugin update + flat hook family | `BaseCalloutPlugin`, `useCalloutEmojiPicker` | package/app/browser proof | closed |
| Code Drawing insertion/types/renderers | 5 | plugin update + durable flat browser modules | `BaseCodeDrawingPlugin`, dispatcher/download owners | package/app/browser proof | closed |
| Combobox extension/filter/hooks | 5 | reusable extension owner + flat durable algorithm/hook family | `createTriggerComboboxExtension`, `filterWords`, `useComboboxInput` | 42/42, graph/build/www/browser | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Five-package batch | Large coherent plugin owners; flat durable algorithms; separate flat React hook families; extracted extension factories only for real multi-plugin reuse | taxonomy folders, one-use tx helpers, decorator-era `with*` names, public grab-bag aliases, declaration explosions | Shortest inference and navigation path without hiding genuine reuse | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | no workaround needed | N/A | package/Core/app/browser proof | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Rule/helper colocation | basic-nodes | helper/rule files, standalone tx/read/editor plumbing, exports | all manifested rows | all one-use rows | 0 | none |
| Parser/utility colocation | basic-styles | parser/constants/utils folders and declarations | all manifested rows | all one-use rows | 0 | none |
| Insert/hook ownership | callout | transforms/hooks folders, tx parameters, app consumers | package + 2 app consumers | all | 0 | none |
| Insert/renderer ownership | code-drawing | transforms/types/utils exports and app consumer | package + app/docs | all | 0 | none |
| Extension/hook/type ownership | combobox + four plugin consumers + AI | `withTriggerCombobox`, types/utils/hooks folders, declaration emit | all source consumers | all | 0 | historical plan/changelog mentions only |

Core drift ledger:
- Applies: no; bounded package sync
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
| N/A | 0 | bounded package run | N/A | broad Core sweep not requested | none |

Package file checklist:
- Applies: yes
- Package: basic-nodes (38), basic-styles (30), callout (15), code-drawing
  (20), combobox (16)
- Manifest command: `rg --files packages/<package> -g '!dist/**' -g
  '!node_modules/**' -g '!README.md' -g '!CHANGELOG.md' -g '!.npmignore'`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 119 frozen at checkpoint zero
- Actual input row count: 124 after five concurrent Basic Nodes migration
  entrypoint files appeared and were audited
- Checked score-100 count: 141 final (124 input rows plus 17 accepted
  current-topology rows)
- Unchecked/deferred count: 0 / 0 final
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: every row for the active package scores 100,
  focused proof passes, fingerprint is recorded, and registry status is
  current.

Package file rows:
- [x] `packages/basic-nodes/package.json` — score: 100 — verdict: keep — owner:
      package boundary — evidence: dependency/export audit plus package proof
- [x] `packages/basic-nodes/src/index.ts` — score: 100 — verdict: keep — owner:
      public barrel — evidence: generated barrel and declaration emit
- [x] `packages/basic-nodes/src/lib/BaseBlockquoteInputRules.spec.tsx` — score:
      100 — verdict: keep — owner: blockquote rule family proof
- [x] `packages/basic-nodes/src/lib/BaseBlockquotePlugin.spec.ts` — score: 100
      — verdict: keep — owner: blockquote behavior proof
- [x] `packages/basic-nodes/src/lib/BaseBlockquotePlugin.ts` — score: 100 —
      verdict: merge owner — owner: blockquote plugin and rules — evidence:
      helper removal, tx-local query, typed declaration, focused proof
- [x] `packages/basic-nodes/src/lib/BaseBoldPlugin.ts` — score: 100 — verdict:
      merge owner — owner: bold plugin and rule family
- [x] `packages/basic-nodes/src/lib/BaseCodePlugin.ts` — score: 100 — verdict:
      merge owner — owner: code plugin and rule family
- [x] `packages/basic-nodes/src/lib/BaseHeadingInputRules.spec.tsx` — score:
      100 — verdict: keep — owner: heading rule family proof
- [x] `packages/basic-nodes/src/lib/BaseHeadingPlugins.spec.ts` — score: 100
      — verdict: keep — owner: heading behavior proof
- [x] `packages/basic-nodes/src/lib/BaseHeadingPlugins.ts` — score: 100 —
      verdict: merge owner — owner: heading plugins and rule family
- [x] `packages/basic-nodes/src/lib/BaseHighlightPlugin.ts` — score: 100 —
      verdict: merge owner — owner: highlight plugin and rule family
- [x] `packages/basic-nodes/src/lib/BaseHorizontalRulePlugin.spec.ts` —
      score: 100 — verdict: keep — owner: horizontal-rule behavior proof
- [x] `packages/basic-nodes/src/lib/BaseHorizontalRulePlugin.ts` — score: 100
      — verdict: merge owner — owner: horizontal-rule plugin and rule family
- [x] `packages/basic-nodes/src/lib/BaseItalicPlugin.ts` — score: 100 —
      verdict: merge owner — owner: italic plugin and rule family
- [x] `packages/basic-nodes/src/lib/BaseKbdPlugin.ts` — score: 100 — verdict:
      keep — owner: kbd plugin
- [x] `packages/basic-nodes/src/lib/BaseMarkInputRules.spec.tsx` — score: 100
      — verdict: keep — owner: mark rule-family proof
- [x] `packages/basic-nodes/src/lib/BaseMarkPlugins.spec.ts` — score: 100 —
      verdict: keep — owner: mark behavior proof
- [x] `packages/basic-nodes/src/lib/BaseScriptPlugin.ts` — score: 100 —
      verdict: merge owner — owner: script plugin and rule family
- [x] `packages/basic-nodes/src/lib/BaseStrikethroughPlugin.ts` — score: 100
      — verdict: merge owner — owner: strikethrough plugin and rule family
- [x] `packages/basic-nodes/src/lib/BaseUnderlinePlugin.ts` — score: 100 —
      verdict: merge owner — owner: underline plugin and rule family
- [x] `packages/basic-nodes/src/lib/BasicBlockRules.ts` — score: 100 —
      verdict: delete — owner: rules moved to owning plugins
- [x] `packages/basic-nodes/src/lib/BasicMarkRules.ts` — score: 100 —
      verdict: delete — owner: rules moved to owning plugins and combo owner
- [x] `packages/basic-nodes/src/lib/MarkComboRules.ts` — score: 100 —
      verdict: keep — owner: genuine cross-plugin mark combinations — evidence:
      typed public rule family with no fabricated plugin owner
- [x] `packages/basic-nodes/src/migrations/ScriptV54Migration.internal.ts` —
      score: 100 — verdict: merge owner — owner: opt-in script migration —
      evidence: concurrent row discovered by final manifest; implementation
      merged into the plugin owner
- [x] `packages/basic-nodes/src/migrations/ScriptV54MigrationPlugin.spec.ts`
      — score: 100 — verdict: keep — owner: opt-in script migration proof —
      evidence: 5/5 focused migration tests
- [x] `packages/basic-nodes/src/migrations/ScriptV54MigrationPlugin.ts` —
      score: 100 — verdict: keep — owner: independent opt-in migration
      entrypoint — evidence: derives configured ScriptPlugin type without
      polluting the current runtime entrypoint
- [x] `packages/basic-nodes/src/migrations/index.ts` — score: 100 — verdict:
      keep — owner: explicit `./migrations` package entrypoint — evidence:
      independent lifecycle boundary
- [x] `packages/basic-nodes/src/lib/ScriptV54MigrationPlugin.spec.ts` —
      score: 100 — verdict: delete transient duplicate — owner: proof stays
      in the independent migrations entrypoint
- [x] `packages/basic-nodes/src/lib/ScriptV54MigrationPlugin.ts` — score: 100
      — verdict: delete transient duplicate — owner: plugin stays in the
      independent migrations entrypoint
- [x] `packages/basic-nodes/src/lib/index.ts` — score: 100 — verdict: keep —
      owner: base barrel — evidence: generated public exports preserve names
- [x] `packages/basic-nodes/src/react/BasicNodesPlugins.spec.tsx` — score: 100
      — verdict: keep — owner: React adapter proof
- [x] `packages/basic-nodes/src/react/BlockquotePlugin.tsx` — score: 100 —
      verdict: keep — owner: blockquote React adapter
- [x] `packages/basic-nodes/src/react/BoldPlugin.tsx` — score: 100 — verdict:
      keep — owner: bold React adapter
- [x] `packages/basic-nodes/src/react/CodePlugin.tsx` — score: 100 — verdict:
      keep — owner: code React adapter
- [x] `packages/basic-nodes/src/react/HeadingPlugins.tsx` — score: 100 —
      verdict: keep — owner: heading React adapters
- [x] `packages/basic-nodes/src/react/HighlightPlugin.tsx` — score: 100 —
      verdict: keep — owner: highlight React adapter
- [x] `packages/basic-nodes/src/react/HorizontalRulePlugin.tsx` — score: 100
      — verdict: keep — owner: horizontal-rule React adapter
- [x] `packages/basic-nodes/src/react/ItalicPlugin.tsx` — score: 100 —
      verdict: keep — owner: italic React adapter
- [x] `packages/basic-nodes/src/react/KbdPlugin.tsx` — score: 100 — verdict:
      keep — owner: kbd React adapter
- [x] `packages/basic-nodes/src/react/ScriptPlugin.tsx` — score: 100 —
      verdict: keep — owner: script React component family
- [x] `packages/basic-nodes/src/react/StrikethroughPlugin.tsx` — score: 100
      — verdict: keep — owner: strikethrough React adapter
- [x] `packages/basic-nodes/src/react/UnderlinePlugin.tsx` — score: 100 —
      verdict: keep — owner: underline React adapter
- [x] `packages/basic-nodes/src/react/index.ts` — score: 100 — verdict: keep —
      owner: React barrel — evidence: generated barrel
- [x] `packages/basic-nodes/tsconfig.build.json` — score: 100 — verdict: keep
      — owner: declaration-build boundary
- [x] `packages/basic-nodes/tsconfig.json` — score: 100 — verdict: keep —
      owner: source-first package typecheck
- [x] `packages/basic-nodes/tsdown.config.mts` — score: 100 — verdict: keep —
      owner: independent `./migrations` release entrypoint — evidence:
      declaration build and package exports

- [x] `packages/basic-styles/package.json` — score: 100 — verdict: keep —
      owner: package boundary — evidence: dependency/export audit and proof
- [x] `packages/basic-styles/src/index.ts` — score: 100 — verdict: keep —
      owner: public barrel
- [x] `packages/basic-styles/src/lib/BaseFontBackgroundColorPlugin.spec.ts`
      — score: 100 — verdict: keep — owner: background-color proof
- [x] `packages/basic-styles/src/lib/BaseFontBackgroundColorPlugin.ts` —
      score: 100 — verdict: keep — owner: background-color plugin
- [x] `packages/basic-styles/src/lib/BaseFontColorPlugin.spec.ts` — score:
      100 — verdict: keep — owner: font-color proof
- [x] `packages/basic-styles/src/lib/BaseFontColorPlugin.ts` — score: 100 —
      verdict: keep — owner: font-color plugin
- [x] `packages/basic-styles/src/lib/BaseFontFamilyPlugin.spec.ts` — score:
      100 — verdict: keep — owner: font-family proof
- [x] `packages/basic-styles/src/lib/BaseFontFamilyPlugin.ts` — score: 100 —
      verdict: keep — owner: font-family plugin
- [x] `packages/basic-styles/src/lib/BaseFontSizePlugin.spec.ts` — score: 100
      — verdict: keep — owner: font-size proof
- [x] `packages/basic-styles/src/lib/BaseFontSizePlugin.ts` — score: 100 —
      verdict: keep — owner: font-size plugin
- [x] `packages/basic-styles/src/lib/BaseFontWeightPlugin.spec.ts` — score:
      100 — verdict: keep — owner: font-weight proof
- [x] `packages/basic-styles/src/lib/BaseFontWeightPlugin.ts` — score: 100 —
      verdict: keep — owner: font-weight plugin
- [x] `packages/basic-styles/src/lib/BaseLineHeightPlugin.spec.ts` — score:
      100 — verdict: keep — owner: line-height proof
- [x] `packages/basic-styles/src/lib/BaseLineHeightPlugin.ts` — score: 100 —
      verdict: inline — owner: line-height plugin; one-use parser and constant
      folded into descriptor
- [x] `packages/basic-styles/src/lib/BaseStyleHtmlCodecs.spec.ts` — score: 100
      — verdict: inline — owner: codec integration proof; one-use serializer
      folded into test to preserve inferred editor type
- [x] `packages/basic-styles/src/lib/BaseTextAlignPlugin.spec.ts` — score: 100
      — verdict: keep — owner: text-align proof
- [x] `packages/basic-styles/src/lib/BaseTextAlignPlugin.ts` — score: 100 —
      verdict: inline — owner: text-align plugin; one-use constant removed
- [x] `packages/basic-styles/src/lib/BaseTextIndentPlugin.spec.ts` — score:
      100 — verdict: keep — owner: text-indent proof
- [x] `packages/basic-styles/src/lib/BaseTextIndentPlugin.ts` — score: 100 —
      verdict: inline — owner: text-indent plugin; parser and constant folded
      into typed descriptor callbacks
- [x] `packages/basic-styles/src/lib/index.ts` — score: 100 — verdict: keep —
      owner: generated base barrel
- [x] `packages/basic-styles/src/lib/utils/index.ts` — score: 100 — verdict:
      delete — owner: taxonomy-only barrel
- [x] `packages/basic-styles/src/lib/utils/toUnitLess.spec.ts` — score: 100 —
      verdict: move — owner: reusable public utility proof; flattened to lib
- [x] `packages/basic-styles/src/lib/utils/toUnitLess.ts` — score: 100 —
      verdict: move — owner: genuinely reused public font-size utility
- [x] `packages/basic-styles/src/lib/toUnitLess.spec.ts` — score: 100 —
      verdict: keep — owner: reusable utility proof
- [x] `packages/basic-styles/src/lib/toUnitLess.ts` — score: 100 — verdict:
      keep — owner: reusable public utility; external app/docs consumers
- [x] `packages/basic-styles/src/react/FontPlugin.tsx` — score: 100 —
      verdict: keep — owner: font React plugin family
- [x] `packages/basic-styles/src/react/LineHeightPlugin.tsx` — score: 100 —
      verdict: keep — owner: line-height React adapter
- [x] `packages/basic-styles/src/react/TextAlignPlugin.tsx` — score: 100 —
      verdict: keep — owner: text-align React adapter
- [x] `packages/basic-styles/src/react/TextIndentPlugin.tsx` — score: 100 —
      verdict: keep — owner: text-indent React adapter
- [x] `packages/basic-styles/src/react/index.ts` — score: 100 — verdict: keep
      — owner: generated React barrel
- [x] `packages/basic-styles/tsconfig.build.json` — score: 100 — verdict:
      keep — owner: declaration-build boundary
- [x] `packages/basic-styles/tsconfig.json` — score: 100 — verdict: keep —
      owner: source-first package typecheck

- [x] `packages/callout/package.json` — score: 100 — verdict: keep — owner:
      package boundary
- [x] `packages/callout/src/index.ts` — score: 100 — verdict: keep — owner:
      public barrel
- [x] `packages/callout/src/lib/BaseCalloutPlugin.spec.ts` — score: 100 —
      verdict: merge owner — owner: all callout base behavior proof
- [x] `packages/callout/src/lib/BaseCalloutPlugin.ts` — score: 100 —
      verdict: merge owner — owner: schema, rules, storage contract, options,
      and insertion capability
- [x] `packages/callout/src/lib/index.ts` — score: 100 — verdict: keep —
      owner: generated base barrel
- [x] `packages/callout/src/lib/transforms/index.ts` — score: 100 — verdict:
      delete — owner: taxonomy-only barrel
- [x] `packages/callout/src/lib/transforms/insertCallout.spec.ts` — score: 100
      — verdict: merge — owner: moved into `BaseCalloutPlugin.spec.ts`
- [x] `packages/callout/src/lib/transforms/insertCallout.ts` — score: 100 —
      verdict: delete — owner: behavior inlined into `tx.callout.insert`
- [x] `packages/callout/src/react/CalloutPlugin.tsx` — score: 100 — verdict:
      keep — owner: callout React adapter
- [x] `packages/callout/src/react/hooks/index.ts` — score: 100 — verdict:
      delete — owner: taxonomy-only barrel
- [x] `packages/callout/src/react/hooks/useCalloutEmojiPicker.slow.tsx` —
      score: 100 — verdict: move — owner: hook family proof flattened to React
      root
- [x] `packages/callout/src/react/hooks/useCalloutEmojiPicker.ts` — score: 100
      — verdict: move — owner: hook remains separate from plugin and flattened
      to React root
- [x] `packages/callout/src/react/useCalloutEmojiPicker.slow.tsx` — score: 100
      — verdict: keep — owner: hook family proof
- [x] `packages/callout/src/react/useCalloutEmojiPicker.ts` — score: 100 —
      verdict: keep — owner: hook family; inferred return has no `any`
- [x] `packages/callout/src/react/index.ts` — score: 100 — verdict: keep —
      owner: generated React barrel
- [x] `packages/callout/tsconfig.build.json` — score: 100 — verdict: keep —
      owner: declaration-build boundary
- [x] `packages/callout/tsconfig.json` — score: 100 — verdict: keep — owner:
      source-first package typecheck

- [x] `packages/code-drawing/package.json` — score: 100 — verdict: keep —
      owner: package/browser renderer dependency boundary
- [x] `packages/code-drawing/src/index.ts` — score: 100 — verdict: keep —
      owner: public barrel
- [x] `packages/code-drawing/src/lib/BaseCodeDrawingPlugin.spec.ts` — score:
      100 — verdict: merge owner — owner: schema and insertion proof
- [x] `packages/code-drawing/src/lib/BaseCodeDrawingPlugin.ts` — score: 100 —
      verdict: merge owner — owner: element/data schema and insertion capability
- [x] `packages/code-drawing/src/lib/constants.ts` — score: 100 — verdict:
      keep — owner: reused domain/UI constants and literal types
- [x] `packages/code-drawing/src/lib/index.ts` — score: 100 — verdict: keep —
      owner: generated base barrel
- [x] `packages/code-drawing/src/lib/transforms/index.ts` — score: 100 —
      verdict: delete — owner: taxonomy-only barrel
- [x] `packages/code-drawing/src/lib/transforms/insertCodeDrawing.spec.ts` —
      score: 100 — verdict: merge — owner: moved into plugin proof
- [x] `packages/code-drawing/src/lib/transforms/insertCodeDrawing.ts` — score:
      100 — verdict: delete — owner: behavior inlined into plugin update
- [x] `packages/code-drawing/src/lib/types.ts` — score: 100 — verdict: merge —
      owner: `CodeDrawingData` moved beside `TCodeDrawingElement`
- [x] `packages/code-drawing/src/lib/utils/download.spec.ts` — score: 100 —
      verdict: move — owner: public download utility proof flattened to lib
- [x] `packages/code-drawing/src/lib/utils/download.ts` — score: 100 —
      verdict: move — owner: externally consumed browser download utility
- [x] `packages/code-drawing/src/lib/utils/index.ts` — score: 100 — verdict:
      delete — owner: taxonomy-only barrel
- [x] `packages/code-drawing/src/lib/utils/renderers.spec.ts` — score: 100 —
      verdict: move — owner: renderer family proof flattened to lib
- [x] `packages/code-drawing/src/lib/utils/renderers.ts` — score: 100 —
      verdict: move — owner: public renderer dispatcher with private engines
- [x] `packages/code-drawing/src/lib/download.spec.ts` — score: 100 —
      verdict: keep — owner: download utility proof
- [x] `packages/code-drawing/src/lib/download.ts` — score: 100 — verdict: keep
      — owner: public download utility
- [x] `packages/code-drawing/src/lib/renderers.spec.ts` — score: 100 —
      verdict: keep — owner: renderer dispatcher/engine proof
- [x] `packages/code-drawing/src/lib/renderers.ts` — score: 100 — verdict:
      simplify — owner: sole public `renderCodeDrawing`; engine functions private
- [x] `packages/code-drawing/src/react/CodeDrawingPlugin.tsx` — score: 100 —
      verdict: keep — owner: code-drawing React adapter
- [x] `packages/code-drawing/src/react/index.ts` — score: 100 — verdict: keep
      — owner: generated React barrel
- [x] `packages/code-drawing/src/viz.d.ts` — score: 100 — verdict: keep —
      owner: external package declaration boundary
- [x] `packages/code-drawing/tsconfig.build.json` — score: 100 — verdict: keep
      — owner: declaration-build boundary
- [x] `packages/code-drawing/tsconfig.json` — score: 100 — verdict: keep —
      owner: source-first package typecheck

- [x] `packages/combobox/package.json` — score: 100 — verdict: keep — owner:
      combobox package boundary — evidence: export/build/typecheck proof
- [x] `packages/combobox/src/index.ts` — score: 100 — verdict: keep — owner:
      generated root barrel — evidence: barrel/build proof
- [x] `packages/combobox/src/lib/index.ts` — score: 100 — verdict: keep —
      owner: generated base barrel — evidence: direct flat owners only
- [x] `packages/combobox/src/lib/types.ts` — score: 100 — verdict: delete —
      owner: types colocated with extension and hook families
- [x] `packages/combobox/src/lib/utils/filterWords.spec.ts` — score: 100 —
      verdict: move — owner: durable word-filter proof — evidence: moved flat
- [x] `packages/combobox/src/lib/utils/filterWords.ts` — score: 100 — verdict:
      move — owner: reusable public word filter — evidence: app consumer plus
      focused tests
- [x] `packages/combobox/src/lib/utils/index.ts` — score: 100 — verdict:
      delete — owner: taxonomy-only barrel — evidence: flat barrel generated
- [x] `packages/combobox/src/lib/withTriggerCombobox.spec.tsx` — score: 100 —
      verdict: rename/move — owner: trigger extension proof — evidence: final
      factory name and constructor-owned fixtures
- [x] `packages/combobox/src/lib/withTriggerCombobox.ts` — score: 100 —
      verdict: rename/move — owner: reusable editor-extension factory —
      evidence: misleading decorator name hard-cut
- [x] `packages/combobox/src/react/hooks/comboboxInputHooks.spec.tsx` — score:
      100 — verdict: move — owner: combobox input hook-family proof
- [x] `packages/combobox/src/react/hooks/index.ts` — score: 100 — verdict:
      delete — owner: taxonomy-only hook barrel — evidence: flat React barrel
- [x] `packages/combobox/src/react/hooks/useComboboxInput.ts` — score: 100 —
      verdict: move/merge — owner: combobox input hook family
- [x] `packages/combobox/src/react/hooks/useHTMLInputCursorState.ts` — score:
      100 — verdict: merge — owner: `useComboboxInput.ts` family — evidence:
      same component-family lifecycle
- [x] `packages/combobox/src/react/index.ts` — score: 100 — verdict: keep —
      owner: generated flat React barrel — evidence: barrel/build proof
- [x] `packages/combobox/tsconfig.build.json` — score: 100 — verdict: keep —
      owner: declaration-build boundary — evidence: build pass
- [x] `packages/combobox/tsconfig.json` — score: 100 — verdict: keep — owner:
      source-first package typecheck — evidence: typecheck pass
- [x] `packages/combobox/src/lib/createTriggerComboboxExtension.spec.tsx` —
      score: 100 — verdict: keep — owner: reusable extension proof —
      evidence: constructor-owned fixtures within 42/42 focused tests
- [x] `packages/combobox/src/lib/createTriggerComboboxExtension.ts` — score:
      100 — verdict: keep — owner: reusable editor-extension factory —
      evidence: four production consumers, 1,014-byte public declaration,
      callback inference, no cast
- [x] `packages/combobox/src/lib/filterWords.spec.ts` — score: 100 — verdict:
      keep — owner: reusable filter proof — evidence: focused tests
- [x] `packages/combobox/src/lib/filterWords.ts` — score: 100 — verdict: keep
      — owner: reusable public algorithm — evidence: app consumer
- [x] `packages/combobox/src/react/useComboboxInput.spec.tsx` — score: 100 —
      verdict: keep — owner: hook-family proof — evidence: runtime hook tests
- [x] `packages/combobox/src/react/useComboboxInput.ts` — score: 100 —
      verdict: keep — owner: complete input hook family — evidence:
      React-root flat topology and 42/42 package tests

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| basic-nodes | 0 | 13 | attested | v1-v13 plus full current review | complete | test/typecheck/build/Biome/schema contracts pass; dedicated migration entrypoint 5/5 and final package proof pass | sha256:f93f0e18eacfd56c880cc6cf548811fe567d00c04bf31bfb7b275a9a35cbe7fc | current |
| basic-styles | 0 | 13 | attested | v1-v13 plus full current review | complete | test/typecheck/build/Biome pass; late runtime-state hard cut uses `initialState` and `store` | sha256:946d95b1034504d3dc0206806b2a3d81333382717011630afc0c15bd5bfc0eb8 | current |
| callout | 0 | 13 | attested | v1-v13 plus full current review | complete | package test/typecheck/build/Biome, slow hook 1/1, app transforms 11/11 pass; www reaches unrelated shared import failures | sha256:2c8ef015f1186bd0335b2d3c36fbb18bfff30818b9956d9b941aae161471964a | current |
| code-drawing | 0 | 13 | attested | v1-v13 plus full current review | complete | package test/typecheck/build/Biome and app transforms 11/11 pass | sha256:1b68a575a04901c357bddaf20e16e43c46784a7dcbf911e42ea93377042b629c | current |
| combobox | 0 | 13 | attested | v1-v13 plus full current review | complete | 42/42 focused tests; nine-package source-first graph 22/22; package/dependent builds; app 1/1 + 11/11; www typecheck pass | sha256:aeba658832778238a4b7f75d8580edc954f397bf2a8a639c639040c6bf79903b | current |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| basic-nodes | root | rule grab-bags and transaction plumbing | `packages/basic-nodes/**`; package proof; schema checker | merge rule families into owners, retain genuine combo owner and dependency-ordered shortcut stage | complete |
| basic-styles | root | one-use helpers, taxonomy-only utility folder, overconstrained test helper | `packages/basic-styles/**`; package proof; broad Core | inline one-use behavior, flatten reusable utility, preserve independent plugin owners | complete |
| callout | root | public tx-plumbing helper plus transforms/hooks taxonomies | package, two app transform consumers, EN/CN docs | inline insertion into plugin update, merge tests, flatten hook family, hard-cut helper | complete |
| code-drawing | root | public tx/type helper, scattered data type, taxonomy folders, leaked engine functions | package, app transform consumer, docs | plugin-owned insertion, merge data contract, flatten durable browser modules, private engines | complete |
| combobox | root | misleading `with*` name, manual public editor alias, split hook family, taxonomy folders, declaration explosion | package plus slash/footnote/mention/emoji/AI consumers and registry demos | reusable constructor-owned extension factory, flat hook family, durable filter owner, bounded public return declaration | complete |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `BasicBlockRules.ts` | one-use owner family | split only by taxonomy | delete; declarations moved to blockquote/heading/hr owners | package tests and public barrel proof |
| `BasicMarkRules.ts` | mixed owner family | split only by taxonomy | delete; declarations moved to mark owners and `MarkComboRules.ts` | package tests and public barrel proof |
| `basic-styles/src/lib/utils/*` | reusable public utility under taxonomy folder | `toUnitLess` has real app/docs consumers | flatten utility and its proof to `src/lib`; delete taxonomy barrel | package proof and generated barrel |
| `callout/src/lib/transforms/*` | plugin-owned insertion | only external uses passed tx/type plumbing | delete and adopt plugin-scoped update or installed tx capability | package/app proof |
| `callout/src/react/hooks/*` | hook family | hook is a React owner, not plugin descriptor behavior | flatten to React root; do not inline into plugin | slow hook proof |
| `code-drawing/src/lib/transforms/*` | plugin-owned insertion | sole external consumer passed tx/type plumbing | delete; plugin update owns insertion and tests | package/app proof |
| `code-drawing/src/lib/utils/*` | two durable public browser modules | `renderCodeDrawing` and `downloadImage` have app/docs consumers | flatten modules to lib; delete taxonomy barrel; private engine implementations | package tests/build |
| `basic-nodes/src/migrations/*` | independent opt-in migration package entrypoint | four source rows plus release config appeared after the initial package freeze | keep the dedicated `./migrations` entrypoint; merge the one-use internal algorithm into its plugin owner | migration 5/5 and package proof |
| `combobox/src/lib/utils/*` | reusable public algorithm under taxonomy folder | `filterWords` has a durable app consumer | flatten algorithm/proof to `src/lib`; delete nested barrel | 42/42 package tests |
| `combobox/src/react/hooks/*` | one hook family | both hooks serve the same inline-combobox family | merge into `useComboboxInput.ts`; move proof beside it; delete nested barrel | hook runtime tests and www typecheck |
| `withTriggerCombobox.ts` | reusable extension factory with decorator-era name | four durable plugin consumers justify extraction, not the `with*` name | rename to `createTriggerComboboxExtension`; keep constructor-owned usage | six-package typecheck graph, builds, declaration audit |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `pnpm check:core` / shared Core migration | Source adoption audit reports 20 rows: schema factories reading `initialState`, contextual configure policy, one-use Paragraph descriptor scaffolding, and two www kit configuration rows | the bounded package and direct-consumer graph passes 22/22; these rows are live Core hard-cut work outside the five-package packet | Core migration owner |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| `withTriggerCombobox` historical mentions | archived plans/artifacts and package changelog history | immutable/historical evidence, not live source or current docs | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | basic-nodes rules colocated with owners; blockquote helpers inlined; active transaction query uses `tx`; obsolete grab-bags deleted |
| code/runtime/API | basic-styles one-use parsers/constants inlined; `toUnitLess` flattened from taxonomy folder; plugin runtime defaults moved to `initialState`/`store` |
| code/runtime/API | callout insertion moved to plugin capability; public tx/type helper deleted; app consumers use scoped plugin update |
| code/runtime/API | code-drawing insertion and data contract merged into plugin; engine exports narrowed to dispatcher; browser modules flattened |
| code/runtime/API | combobox factory renamed to `createTriggerComboboxExtension`; state colocated; filter flattened; hook family merged; declaration bounded; factory context reads `store` |
| code/runtime/API | late Basic Nodes migration family consolidated into one opt-in `./migrations` entrypoint owner |
| code/runtime/API | slash-command, footnote, mention, and emoji consumers adopted `initialState`/`store`; stale descriptor `.options` assertions removed |
| tests/proof | basic-nodes and basic-styles imports/barrels updated; package test/typecheck/build/Biome green |
| tests/proof | callout insertion tests merged into owner; hook family and slow proof flattened |
| tests/proof | code-drawing demo duplicate plugin fixed; mention/callout/code-drawing browser proof clean |
| docs/templates/skills | five package changesets retained/repaired; registry changelog entry generated and checked; v13 registry updated |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Shared Core migration source audit | `check:core` finds 20 live hard-cut rows after all contract suites pass | `packages/core/**`, `apps/www/**` | finish in its active Core owner; do not reopen deleted package APIs |
| 2 | Remaining v13 queue | 36 unrelated packages remain stale; bounded request forbids starting a sixth | version registry | next package is `comment` |

Findings:
- The reusable Combobox extension is justified by four production plugin
  consumers, but its old `with*` name and 37k-token inferred declaration were
  not.
- Browser proof found and closed a duplicate Code Drawing plugin installation
  that package/type proof could not see.
- Four concurrent Basic Nodes migration rows appeared after the initial
  package freeze; final manifest reconciliation caught and flattened them.

Decisions and tradeoffs:
- Keep no line ceiling: coherent owners beat taxonomy folders.
- Keep the opt-in script migration separate from current `BaseScriptPlugin`,
  but colocate its complete algorithm and proof in one flat owner.
- Use a public overload returning
  `AuthoringPlateEditorExtensionInput<C>` so internal callbacks infer while the
  published declaration stays readable.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Moved blockquote shortcut into constructor with its update method | 1 | Restore the dependency-ordered authoring stage instead of annotating or casting | `.extend({ shortcuts })` retained because it consumes the earlier update capability; typecheck/build pass |
| Broad `pnpm check:core` stops in basic-styles test typing | 1 | Treat as the next in-scope package baseline | basic-nodes closed independently; repair under basic-styles |
| Broad `pnpm check:core` stops after 44 package typechecks in plite-react generic contracts | 1 | Record exact out-of-scope owner; do not patch shared Core/Plite work | basic-styles closed independently |
| `bun test packages/callout/...slow.tsx` matched no files | 1 | Use Bun's explicit relative-path form | `bun test ./packages/callout/src/react/useCalloutEmojiPicker.slow.tsx` passes 1/1 |
| Bare app transaction type erased `tx.callout` | 1 | Avoid casts and whole-kit parameter overconstraint; use plugin-scoped update in the generic app helper | www progresses past edited files and transform tests pass 11/11 |
| Moved renderer files retained `../constants` imports | 1 | Fix paths at the new owner depth | package typecheck/build pass |
| Explicit Combobox factory return annotation erased nested callback inference | 1 | Separate the public overload from the inference-preserving implementation and validate with `satisfies` | dependent graph passes; declaration shrank from 37k tokens to 1,031 bytes |
| Downstream builds initially read stale Core declarations during generic experiments | 1 | Build the owning Core package before judging downstream inference | fresh Core build and all five package builds pass; no package-local cast or callback annotation kept |
| Nine-package typecheck found stale descriptor `.options` assertions in Emoji, Slash, and Mention | 1 | Read runtime state through the scoped plugin store | focused tests pass and the source-first graph closes 22/22 |
| Current `check:core` source audit reports 20 shared migration rows | 1 | Preserve the bounded package result and record exact external owner | Core contract suites pass; package graph remains 22/22 |
| Combined app test invocation let an intentionally narrow Bun module mock hide the new package export | 1 | Run the independently-owned mock suite and transform suite in separate Bun processes | 1/1 and 11/11 pass |
| Browser route crashed on duplicate `codeDrawing` descriptors | 1 | Remove the descriptor already supplied by `EditorKit`; do not weaken duplicate-plugin validation | fresh route renders the diagram with zero console errors |
| Late Basic Nodes migration entrypoint files escaped the frozen manifest | 1 | Reconcile current files before final scoring; audit every new row | 124 input rows and 141 total ledger rows close at 100 |

Verification evidence:
- basic-nodes: package test, typecheck, build, Biome, barrel generation, schema
  checker 25/25, declaration inspection, and zero exported `any` owners pass.
- basic-styles: package test, typecheck, build, Biome, barrel generation,
  declaration/export structural audit pass.
- callout: package test/typecheck/build/Biome/barrels pass; slow hook 1/1 and
  app transform family 11/11 pass; no helper/taxonomy/`any` declaration remains.
- code-drawing: package test/typecheck/build/Biome/barrels and declaration
  surface pass; app transform family 11/11 pass.
- combobox: 42/42 focused tests; package build/typecheck/Biome/barrels;
  slash-command/footnote/mention/emoji/AI typechecks; five consumer builds;
  app inline-combobox 1/1 and transforms 11/11; full www typecheck pass.
- combined source-first graph: basic-nodes, basic-styles, callout, code-drawing,
  combobox, slash-command, footnote, mention, and emoji pass 22/22 tasks.
- browser: mention trigger creates the transient input with zero errors;
  callout renders three callouts with zero errors; code-drawing renders its
  generated image with zero errors after duplicate composition repair.
- registry changelog generator write/check passes for 39 events.
- current Core proof: runner contracts 6/6, source declaration leak contracts
  3/3, package declaration brand contracts 2/2, and adoption audit contracts
  25/25 pass; the source adoption audit then reports 20 unrelated live
  migration rows.

Final handoff contract:
- target surface and mode: exactly basic-nodes, basic-styles, callout,
  code-drawing, and combobox; bounded sequential v13 sync; no sixth package.
- files/APIs reviewed: 124 input rows plus 17 accepted current-topology rows.
- broad Core drift score coverage: N/A; not a broad Core sweep.
- package file checklist coverage: 141/141 score 100; 0 unchecked/deferred.
- doctrine start/final version and source-fingerprint state: v0/unattested to
  v13/current for all five.
- version registry evidence and remaining stale/drifted count: five current;
  36 unrelated stale, 0 drifted among the batch.
- best Plate v2 recommendation: coherent plugin owners, flat durable
  algorithms, separate flat React hook families, reusable extension factories
  only for real multi-plugin reuse.
- verdict matrix summary: all active drift cut, merged, moved, or
  reuse-justified.
- Plite/Plate gaps or blockers: none in the five-package surface; the shared
  Core migration source audit remains owned outside this bounded packet.
- related scoped sweep query/active scope/matches/patched/deferred: five rows
  above; all active matches patched; 0 deferred.
- out-of-scope matches discovered: historical `withTriggerCombobox` evidence
  and 20 live shared Core/www migration-source rows.
- changes made: owner colocation, flat commands/hooks/algorithms, hard-cut API
  names, declaration shaping, app adoption, demo composition repair.
- tests/proof commands: package tests/typechecks/builds, nine-package graph,
  app tests/typecheck, Core gate, Biome, barrels, changelog check, browser.
- old compatibility names audited: live source/current docs contain no
  `withTriggerCombobox` or removed insertion-helper consumer.
- needs attention: separate shared Core migration owner only.
- next best Plate Next packet: `comment`, but not started.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure |
| Where am I going? | User handoff |
| What is the goal? | Sync exactly five packages to Plate Next v13 with every package row at score 100 and package/Core proof. |
| What have I learned? | Rule-family grab-bags hide ownership; real reuse justifies an extracted factory, but not decorator-era naming or declaration explosions. |
| What have I done? | Closed and attested all five packages at v13 with 141/141 ledger rows. |

Timeline:
- 2026-07-26T20:23:17.079Z Goal plan created.
- 2026-07-26 basic-nodes fully audited, consolidated, proved, fingerprinted,
  and attested at Plate Next v13.
- 2026-07-26 basic-styles fully audited, flattened, proved, fingerprinted, and
  attested at Plate Next v13.
- 2026-07-26 callout fully audited, consolidated, adopted, proved,
  fingerprinted, and attested at Plate Next v13.
- 2026-07-26 code-drawing fully audited, consolidated, adopted, proved,
  fingerprinted, and attested at Plate Next v13.
- 2026-07-26 combobox fully audited, flattened, renamed, adopted, proved,
  fingerprinted, and attested at Plate Next v13.
- 2026-07-26 browser proof found and repaired duplicate Code Drawing demo
  composition; registry changelog generated and checked.
- 2026-07-26 final manifest reconciled five concurrent Basic Nodes migration
  entrypoint rows and consolidated the algorithm into one plugin owner.

Open risks:
- The shared Core source-adoption audit still reports 20 live hard-cut rows
  after its four contract suites pass. No row belongs to the five-package
  packet or its direct consumer adoption.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Five-package Plate Next v13 sync | complete | 141/141 score 100; five registry checks current; nine-package graph 22/22; focused tests/builds/browser proof green | none |
| Shared Core boundary proof | complete | Four Core contract suites pass and the exact 20-row external source-audit owner is recorded | none |
| Goal-ledger closure | complete | `check-complete.mjs` reports `[autogoal] complete` | none |
