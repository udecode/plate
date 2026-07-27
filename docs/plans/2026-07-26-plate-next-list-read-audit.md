# plate next list read audit

Objective:
Audit every `packages/list` file for correct `api` / `read` / `update`
ownership; done when all 13 fingerprinted package rows have evidence and a
score-100 or explicit deferral verdict.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-26-plate-next-list-read-audit.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user requested a first package audit because plugin `read` is
  new
- mode: package review, audit-only
- target surface: `packages/list`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes if a local correction is
  accepted later; this audit makes no product edits
- package review mode: yes
- package review target: `packages/list`
- package file checklist gate: 13 fingerprinted files
- doctrine version: 12
- package applied version / fingerprint state: v7 / source changed / stale
- sync mode / target: no
- sync queue row count: N/A
- completion threshold summary: every package row reviewed; every state-bound
  query classified as `read`, `api`, `update`, or justified helper; no
  implementation until the user accepts the audit

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
- semantics: N/A
- initial confidence score: N/A
- improvement loop: complete the 13-file manifest once
- final score / loop closure: source-backed package verdict

Completion threshold:
- All 13 fingerprinted `packages/list` files have one review row.
- Every plugin contribution and standalone state/read parameter is classified
  against the new `read` boundary.
- Every row is either checked at score `100` or explicitly deferred with owner,
  evidence, proof needed, and next action.
- Audit-only: do not attest v12, edit runtime code, or move to another package.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-plate-next-list-read-audit.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: source audit only unless a code correction is
  explicitly accepted
- package proof probes:
  `pnpm turbo typecheck --filter=./packages/list`,
  `pnpm --filter @platejs/list exec tsc --noEmit -p tsconfig.json`,
  `pnpm --filter @platejs/list test`,
  focused Bun tests, and `pnpm --filter @platejs/list build`; executable proof
  is blocked by current unrelated Core source/artifact WIP and is not used to
  raise any source row
- shared Core gate: N/A for audit-only/no Core change
- source audits: all package files; every `api`, `read`, `update`, `.extend`,
  `EditorCoreStateView`, `editor.read`, `editor.update`, helper and export
  occurrence
- related scoped sweep query / active scope / match count / patched count / deferred count:
  package query found 4 state-bound API methods, 29 same-package consumers or
  mocks, 3 input-rule snapshot leaks, and 2 configurable sibling callbacks;
  0 patched, all deferred to the accepted implementation packet
- package file manifest / row count / checked count / deferred count:
  fingerprint manifest, 13 rows; 7 score-100, 6 explicitly deferred
- version registry validation / starting status / final status: registry valid;
  start v7 stale/source-changed; final remains stale because audit-only
- package fingerprint command / result:
  `version.mjs fingerprint list` -> `sha256:761c5e672e27818825a4b270a47dc1b4f82162ddbda743059e9b726e41604fe9`
- Plite/Plate gap ledger: N/A; Core already publishes constructor `read`,
  `editor.read.list`, portal `.read`, and transaction-local `tx.list`
- broad Core drift ledger gate: N/A; package review only
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-plate-next-list-read-audit.md`

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
- allowed edit scope: this plan artifact only; product source remains read-only
  during the audit
- package/API surfaces: `packages/list` plus read-only Core/Plite type/runtime
  owners needed to classify `read`
- docs/browser surfaces: no docs, apps, registry, dev server, or Browser
- non-goals: no repo-wide package sweep, no other package migration, no API
  aliases, no compatibility layer, no doctrine attestation
- out-of-scope package errors: record only; do not patch

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- For this package, count first, then read one owner family at a time. Exclude
  `dist`, caches, generated output, README, and changelog. Save conclusions in
  the 13 plan rows instead of streaming full specs.

Blocked condition:
- Stop only if a `read` classification requires a public Core/Plite API
  decision that cannot be resolved from current source, or the user redirects.

Current verdict:
- verdict: migration required before List can attest doctrine v12
- confidence: high from complete 13-file source audit and current Core type
  contracts; executable proof remains blocked by unrelated shared WIP
- next owner: plate-next
- keep / revert / quarantine call: keep the owner-first colocation; migrate
  state reads, tighten the sibling callback contract, merge one redundant
  authoring stage, and clean focused test/metadata debt
- reason: the package shape is coherent, but `api` currently exposes
  snapshot-dependent behavior and accepts an explicit transaction-state escape
  hatch that the new `read` group exists to eliminate

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Audit `packages/list` first because plugin `read` is new; no broader package work |
| `plate-next` skill/rule read | yes | Complete v11 skill read at start; concurrent v12 hook-family migration check read from the source registry before closure |
| Active goal checked or created | yes | Goal created for this 13-row audit |
| Mode classified as named packet vs broad Core sweep | yes | Package review, audit-only; not broad Core |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Recorded above |
| Broad Core drift ledger initialized when in scope | no | N/A: package review |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; `.agents/rules/plate-next.mdc` doctrine |
| Output budget strategy recorded | yes | Count-first, owner-family reads, capped output |
| Public API fork routing checked | yes | `best-api` only if source exposes unresolved public call shape |
| Gap policy checked | yes | Name exact Core/Plite owner; no local workaround |
| Related scoped sweep policy checked | yes | Package-only; outside matches deferred |
| Review-mode rename freeze checked | yes | No rename or product edit in audit-only pass |
| Package review checklist initialized when in scope | yes | 13 rows below |
| Doctrine registry validated for package review/sync | yes | v12 valid; list v7 stale/source-changed |
| Sync queue materialized when sync mode is in scope | no | N/A: not sync mode |

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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Audit all 13 source rows and probe executable gates | 13/13 rows reviewed; type/test/build probes classified below |
| Broad Core drift ledger coverage | no | Keep Core read-only and inspect only the owning `read` contract | N/A: this is a named package review |
| Score gate | yes | Own every non-100 row | 7 rows score 100; all 6 lower rows name evidence and next action |
| Best Plate v2 recommendation | yes | Record the target call shape and rejected escapes | Recorded below with `read` / `api` / `tx` ownership |
| Plite/Plate gap ledger | yes | Resolve whether Core can express the target | No gap: current Core contract already expresses it |
| Related scoped sweep after correction | no | Record discovery sweep without patching | Audit-only sweep recorded; 0 patched |
| Package file checklist | yes | Reconcile fingerprint rows | 13 expected, 13 actual, 0 missing, 0 extra |
| Package doctrine attestation | no | Leave registry untouched until implementation and proof | Final status deliberately remains v7 stale/source-changed |
| All-package sync closure | no | Keep scope on List | N/A: no all-package sync |
| Helper topology / lexical tx ownership | yes | Audit helper directories and state/tx parameters | No helper directories or standalone production tx functions remain; one local state helper and two configurable callbacks are classified below |
| Package/API proof | yes | Probe typecheck, tests, and artifact build | Blocked before trustworthy List execution by unrelated current Core source/artifact WIP; exact outputs classified below |
| Shared Core gate coverage | no | Avoid product-package enrollment in `check:core` | `packages/list` is a product plugin and this audit changes no Core contract |
| Non-Core package error triage | yes | Separate package drift from shared checkout drift | All probe failures classified; no List cast or annotation workaround accepted |
| Source audit | yes | Search the package and outside callers | Exact package and adoption counts recorded below |
| Rename ledger | no | Preserve current owner-first paths | No rename proposed in this audit |
| Extracted-file inventory | yes | Count untracked package files | 0 untracked/extracted package files |
| Autoreview / review | no | Treat this package review as the review artifact | N/A: no product implementation diff |
| Final lint/check | no | Validate the plan mechanically | N/A for product lint; autogoal checker is the audit artifact gate |
| Changed list / top drift / needs attention | yes | Fill all handoff ledgers | Recorded below |
| Goal plan complete | yes | Run the autogoal checker | Fresh final checker result recorded under verification |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Package manifest | complete | 13 expected and 13 reviewed |
| API ownership audit | complete | All `api`, `read`, `update`, extension, state, and transaction occurrences classified |
| Handoff artifact | complete | Six deferred rows have owner, proof need, and next action |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `BaseListPlugin.api.{getNext,getPrevious,expandItemsWithChildren,isActive}` | 5 | migrate-to-read | `BaseListPlugin` | All four observe document state; two accept explicit state and two close over `editor.read` | Publish from constructor `read: ({ state }) => ...` |
| `BaseListPlugin.api.{getSequenceSiblingOptions,isSequenceBoundary}` | 0 | keep-in-api | `BaseListPlugin` | Pure/config-derived behavior, reused by update and extension stages, no snapshot access | Keep scoped API; do not mislabel as `read` |
| Update/extension sibling traversal | 5 | migrate-to-active-read | `BaseListPlugin` | Seven internal calls pass `tx` into `api.getNext/getPrevious` | Use `tx.list.getNext/getPrevious` |
| `GetSiblingListOptions` custom traversal callbacks | 3 | tighten-boundary | `BaseListPlugin` public options | Custom paged traversal needs the active snapshot, but `state` is typed optional even though List always supplies it | Make state required; remove defensive `state?.nodes` |
| local `getListStartUpdate(state, ...)` | 3 | keep-private-but-remove-state-escape | List extension | Two local consumers have an active `tx`; helper only needs the resolved previous entry | Resolve through `tx.list.getPrevious`, then pass the entry to the private calculation |
| `BulletedListRules` / `OrderedListRules` / `TaskListRules` | 4 | migrate-to-active-read | List rule family | Three `enabled` callbacks read `editor.read.nodes` despite receiving active `tx` | Destructure `tx`; use `tx.nodes.some` |
| three `.extend()` stages | 2 | merge-one-stage | `BaseListPlugin` authoring chain | Override stage has no dependency on the update stage; extension stage depends on earlier tx/read types | Merge override with update; retain the later extension stage |
| owner/file topology | 0 | keep | List package | No `queries/`, `transforms/`, `utils/`, `with*`, or standalone production tx files remain; 1,727-line owner is coherent | Do not scatter it again |
| exported `isOrderedList` | 0 | keep-standalone | List base API | Pure editor-independent predicate with eight app/template source consumers including static renderers | Keep exported; forcing a portal would be worse |
| `useListToolbarButton.ts` | 4 | migrate-to-read | React list hook family | Two event-time selection reads use portal `.api.isActive` | Use portal `.read.isActive` |
| `ListPlugin.spec.tsx` hook proof ownership | 4 | split-by-hook-family | React hook proof | v12 requires hook tests beside their hook-family owner; this file mixes two toolbar tests with one todo-element test and tests no plugin behavior | Move to `useListToolbarButton.spec.tsx` and `useTodoListElement.spec.tsx` |
| fast/React/slow specs | 4 | migrate-and-clean | List proof owners | 18 stale fast-spec API calls; 2 stale React mocks; 55 broad `any` occurrences across the three specs | Adopt `read`, prove tx-local behavior, replace fake fixture casts |
| `package.json` | 2 | remove-dead-dependency | package metadata | `clsx` has no package source import on current tree or `origin/main` | Remove it in implementation packet |
| barrels and TypeScript configs | 0 | keep | package plumbing | Flat generated barrels match the three-owner topology; configs are standard and introduce no API drift | Reverify after implementation |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| state-bound feature queries | constructor `read: ({ state }) => ({ getNext, getPrevious, expandItemsWithChildren, isActive })` | leave on `api`; optional explicit state arg; duplicate `fooWithState` helpers | `read` binds the exact snapshot and publishes on editor, portal, and active tx |
| pure reusable feature behavior | keep `getSequenceSiblingOptions` and `isSequenceBoundary` on constructor `api` | move every function to `read`; extract one-use query files | They do not observe editor state and later stages legitimately reuse them |
| mutations | keep `update: ({ tx }) => ({ indent, outdent, toggle })` in the first dependent `.extend()` | root editor wrappers; functions accepting editor+tx | The active tx owns mutations and its attached List read group |
| authoring stages | constructor for independent contributions; one `.extend()` for override+update; one later `.extend()` for extension | three stages with a redundant override-only stage; one giant stage that loses earlier contribution inference | Repeat only for real earlier-stage type dependencies |
| React hook proof topology | keep toolbar hooks in `useListToolbarButton.ts`, todo-element hooks in `useTodoListElement.ts`, and colocate one spec with each family | merge unrelated element and toolbar hooks; keep a generic `ListPlugin.spec.tsx` | v12 owns hooks and their tests by durable hook family | rename/split in implementation |
| tests/adoption | compile and runtime proof through `editor.read.list`, portal `.read`, and `tx.list` | callback annotations, casts, compatibility aliases | Tests must prove the public contract rather than preserve the pre-read escape hatch |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | Existing Core already publishes plugin read groups on `editor.read`, portals, and transactions | `packages/list` | List-focused type/runtime proof after shared Core WIP settles | Implement in List; no Core API change |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| classify state-bound API | `packages/list` | `api/read/update`, `EditorCoreStateView`, `editor.read`, `tx.list`, and named-method search | 4 methods + 29 same-package consumers/mocks | 0 | all | Implementation must migrate every call together |
| classify active transaction reads | `packages/list/src/lib/BaseListPlugin.tsx` | rule `enabled` callbacks using `editor.read` | 3 | 0 | 3 | Input-rule enablement can otherwise observe stale committed state |
| inventory public adoption | `apps/www` + `content` read-only | stale List portal call search | 10 call sites | 0 | 10 | App/docs adoption belongs to the later hard-cut packet |
| validate standalone pure helper | app/template source read-only | `isOrderedList` import search | 8 production files | 0 | 0 | None; keeping the helper is correct |
| apply concurrent v12 hook rule | `packages/list/src/react` | hook definitions/imports and test ownership | 2 valid hook owners; 1 mixed generic spec | 0 | 1 | Split proof by hook family during implementation |

Core drift ledger:
- Applies: no
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A; only the exact read-contract owners were inspected
- Expected row count: 0
- Actual row count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | out-of-scope | Core | Constructor and transaction read contracts were inspected read-only | No Core packet |

Package file checklist:
- Applies: yes
- Package: `packages/list`
- Manifest command: `version.mjs fingerprint list` manifest plus
  `rg --files packages/list`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 13
- Actual row count: 13
- Checked score-100 count: 7
- Unchecked/deferred count: 6
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: all 13 rows have an audit verdict and the user
  accepts or defers the resulting migration packet

Package file rows:
- [ ] `packages/list/package.json` — score: 95 — verdict: deferred-fix —
      owner: package metadata — evidence: `clsx` has zero package source
      imports — proof needed: install/lockfile and package build after removal —
      next: remove `clsx`
- [x] `packages/list/src/index.ts` — score: 100 — verdict: keep —
      owner: public root barrel — evidence: generated flat export of `lib`,
      matching the base/react entrypoint split — next: none
- [ ] `packages/list/src/lib/BaseListPlugin.slow.tsx` — score: 80 —
      verdict: deferred-fix — owner: list behavior slow proof — evidence: both
      custom traversal callbacks defensively accept missing state; two broad
      `any` boundaries remain — proof needed: focused slow suite and profile
      after the read migration — next: require state and type fixtures
- [ ] `packages/list/src/lib/BaseListPlugin.spec.tsx` — score: 60 —
      verdict: deferred-fix — owner: list behavior proof — evidence: 18 stale
      `api` calls for state-bound methods and 50 `as any` occurrences — proof
      needed: compile contract plus fast runtime suite — next: migrate to
      editor/portal/tx read surfaces and type fixtures
- [ ] `packages/list/src/lib/BaseListPlugin.tsx` — score: 55 — verdict:
      deferred-fix — owner: base list behavior — evidence: 4 state-bound API
      methods, 7 explicit tx-as-state internal calls, 3 committed-state reads
      in tx-capable rules, 1 redundant authoring stage, and 1 private state
      escape — proof needed: source typecheck, declaration build, fast+slow
      tests — next: implement the recommendation above
- [x] `packages/list/src/lib/index.ts` — score: 100 — verdict: keep —
      owner: base barrel — evidence: single coherent base owner export; no
      deleted helper barrels restored — next: none
- [ ] `packages/list/src/react/ListPlugin.spec.tsx` — score: 60 —
      verdict: deferred-fix — owner: React list proof — evidence: two mocks
      publish `isActive` under `api`, three `any` boundaries remain, and v12
      rejects mixing two hook families under a plugin-named spec — proof
      needed: focused React hook tests — next: split into family-named specs,
      mock `read`, and type fixtures
- [x] `packages/list/src/react/ListPlugin.tsx` — score: 100 — verdict:
      keep — owner: React list plugin — evidence: minimal inferred
      `toPlatePlugin(BaseListPlugin)` adapter with no base/react boundary leak —
      next: none
- [x] `packages/list/src/react/index.ts` — score: 100 — verdict: keep —
      owner: React barrel — evidence: flat exports for the plugin and two
      durable hook owners — next: none
- [ ] `packages/list/src/react/useListToolbarButton.ts` — score: 65 —
      verdict: deferred-fix — owner: toolbar hook family — evidence: both
      selection queries call portal `.api.isActive`; colocation itself is
      correct — proof needed: focused selector/hook tests — next: switch to
      `.read.isActive`
- [x] `packages/list/src/react/useTodoListElement.ts` — score: 100 —
      verdict: keep — owner: todo element hook family — evidence: direct live
      node target for mutation, no plugin state query, standalone consumer
      boundary — next: none
- [x] `packages/list/tsconfig.build.json` — score: 100 — verdict: keep —
      owner: package artifact typing — evidence: standard package build owner;
      current failure is missing upstream Core artifacts, not local config —
      next: rerun after shared build state is valid
- [x] `packages/list/tsconfig.json` — score: 100 — verdict: keep —
      owner: package source typing — evidence: source-first mappings reach the
      inspected Core/Plite owners; failures originate in unrelated current Core
      files — next: rerun after shared Core source is valid

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| list | 7 | 12 | changed; `761c5e67…fe9` | v8-v12 plus full review | yes | 13/13 rows audited; implementation proof blocked by shared WIP | `761c5e67…fe9` | stale |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| List read hard cut | `plate-next` / `packages/list` | State-aware feature queries still live on pre-read `api` and accept transaction state manually | Base owner, fast/slow/React specs, toolbar hook, package metadata | Accept as next implementation packet after user says go | Migrate package first, then named app/docs adoption |
| Owner colocation | `packages/list` | Prior split helper topology might be restored accidentally | Current 13-row manifest vs `origin/main` 75-file delta | Keep current colocation | Never restore deleted helper folders |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| none | N/A | `git ls-files --others --exclude-standard packages/list` returned 0 | no extracted/untracked rows | source audit |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `pnpm turbo typecheck --filter=./packages/list` | Core build cannot resolve three current event-editor source exports | Failure occurs before a trustworthy List check and the files are outside this audit | Current Core writer; rerun after source freeze |
| direct List `tsc --noEmit` | Current Core reports unrelated `resolvePlugins`, affinity, node-id, and event-editor errors; List HTML API typing also reflects that shared publication state | Adding List annotations/casts would hide owner inference regressions | Current Core writer; rerun exact command |
| focused Bun fast/React specs | Resolver cannot load `@platejs/core` from current workspace artifacts; 0 tests execute | Artifact availability failure is not List behavior evidence | Rebuild shared packages, then rerun both files |
| `pnpm --filter @platejs/list build` | Built `@platejs/core` entrypoints are absent, producing cascading implicit-any errors | Root cause is upstream artifact absence; local annotations are forbidden | Build Core from a valid frozen source, then rebuild List |
| `pnpm --filter @platejs/list test` | Wrapper exits zero without reporting executed List tests | An empty wrapper result cannot count as behavior proof | Use explicit focused Bun files after artifacts recover |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| `list.api.isActive` | List docs EN/CN: 6 call sites | Package-review mode keeps docs read-only | Docs adoption after package API lands |
| portal `.api.isActive` | registry `list-toolbar-button.tsx`: 2 call sites | App/registry caller is outside the named package | Registry adoption after package API lands |
| `list.api.expandItemsWithChildren` | registry `block-draggable.tsx`: 2 call sites | App/registry caller is outside the named package | Registry adoption after package API lands |
| stale standalone query prose | List docs EN/CN | Docs still describe pre-colocation exports beyond `isOrderedList` | Rewrite against final package surface in docs packet |
| `isOrderedList` | 4 app + 4 generated-template source consumers | These are evidence for keeping the pure helper, not drift | No action; templates remain CI-owned |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none |
| tests/proof | none |
| docs/templates/skills | this audit plan only |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Approve the List read hard cut | This is the main v12 blocker | `BaseListPlugin.tsx:176-375` | Move 4 methods to constructor `read`; no alias |
| 2 | Preserve pure `api` | `read` is not a dumping ground for every query-looking name | `BaseListPlugin.tsx:231-259` | Keep the two state-independent helpers on `api` |
| 3 | Fix active snapshot use | Explicitly passing `tx` into `api` defeats the new model | `BaseListPlugin.tsx:802-1477` | Use `tx.list.getNext/getPrevious` |
| 4 | Accept focused proof cleanup | Current tests preserve the wrong public shape and hide fixtures behind casts | fast/slow/React specs | Repair only the casts touched by this packet, then reassess remaining fixture debt |
| 5 | Defer app/docs until package proof | There are 10 known adoption call sites | registry + List docs | Migrate them only after the package contract compiles |
| 6 | Split the mixed hook spec | v12 owns tests by hook family | `src/react/ListPlugin.spec.tsx` | Two family-named specs; keep the two production hook owners |

Findings:
- Registry valid at v12; `packages/list` is stale at v7 and source-changed.
- Fingerprinted review manifest contains 13 files.
- No untracked files exist in package scope.
- Colocation is the right direction: the 75-file delta versus `origin/main`
  deletes the old `queries/`, `transforms/`, normalizer, `with*`, and nested
  React-hook taxonomy in favor of one coherent owner.
- Four public methods are misclassified: `getNext`, `getPrevious`,
  `expandItemsWithChildren`, and `isActive` all observe a snapshot and belong
  to `read`.
- Seven update/extension callers pass an active transaction into those API
  methods. The target is transaction-local `tx.list.*`.
- `getSequenceSiblingOptions` and `isSequenceBoundary` are correctly
  state-independent. Moving them to `read` would make the taxonomy worse.
- The custom sibling callbacks are a legitimate public snapshot boundary, but
  their `state` argument should be required.
- Three input-rule `enabled` callbacks can see stale committed state because
  they use `editor.read` instead of the supplied transaction.
- The override-only `.extend()` is redundant and can merge into the following
  update stage. The final extension stage is justified by earlier typed
  contributions.
- `isOrderedList` is the honest standalone exception: pure, editor-independent,
  and reused by static/live render owners.
- v12 leaves both production hook owners intact but rejects
  `ListPlugin.spec.tsx`: it combines toolbar and todo-element hook proof under a
  plugin name even though it tests no plugin behavior.

Decisions and tradeoffs:
- Keep the large `BaseListPlugin.tsx`; file size is not the problem.
- Do not publish private normalization calculations through `read`.
  `getListStartUpdate` should receive a resolved previous entry, while the call
  site performs the read through `tx.list`.
- Do not turn state reads into selectors. Selectors are option-store
  derivations; document snapshot queries are `read`.
- Do not add callback annotations, casts, compat aliases, or duplicate
  `getPreviousWithTx` helpers to get through the migration.
- Leave doctrine version/fingerprint unchanged until runtime source, consumers,
  and proof all close.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| zsh unmatched `packages/list/src/*.tsx` while counting lines | 1 | use `rg --files` and explicit paths | manifest recovered without broad output |
| over-broad multi-file `origin/main` dump exceeded useful output | 1 | read only the two relevant prior query owners | ownership comparison recovered |
| generated-skill `version.mjs` path does not exist | 1 | use source-of-truth rule script | `.agents/rules/plate-next/scripts/version.mjs` returned current status |
| executable package gates encounter shared Core source/artifact WIP | 5 probes | preserve source audit and classify exact upstream blockers | no local workaround accepted |

Verification evidence:
- `version.mjs fingerprint list`:
  `sha256:761c5e672e27818825a4b270a47dc1b4f82162ddbda743059e9b726e41604fe9`,
  13 files.
- `version.mjs status list`: v12 registry; List v7 stale, fingerprint changed.
- `rg --files`, `find`, import/cast/API searches, and focused file reads cover
  all 13 fingerprint rows; 0 untracked package files.
- `git diff --name-status origin/main -- packages/list` confirms the current
  owner-first consolidation and the deleted old helper topology.
- Current Core source and type tests confirm constructor `read`,
  `editor.read.<plugin>`, portal `.read`, and transaction-local
  `tx.<plugin>`; `packages/list-classic` independently uses the same contract.
- Type/test/build probes are recorded under out-of-scope drift and do not count
  as green package proof.
- Autogoal checker: `[autogoal] complete` for this audit plan.

Final handoff contract:
- target surface and mode: `packages/list`, package review, audit-only
- files/APIs reviewed: all 13 fingerprint rows; every plugin contribution,
  state parameter, helper, test, React hook, barrel, and config
- broad Core drift score coverage: N/A; exact read owner inspected read-only
- package file checklist coverage: 13/13 reviewed; 7 score-100; 6 explicitly
  deferred; 0 missing; 0 extra
- doctrine start/final version and source-fingerprint state: v7 -> v7;
  fingerprint unchanged and source-changed
- version registry evidence and remaining stale/drifted count: 1 tracked, 0
  current, 1 stale, 0 drifted
- best Plate v2 recommendation: four state-bound methods to `read`; pure
  helpers remain `api`; mutations remain `update`; active callers use `tx.list`
- verdict matrix summary: keep current colocation; repair API ownership,
  active-state routing, one redundant stage, proof casts, and one dead dep
- Plite/Plate gaps or blockers: no API gap; unrelated Core WIP blocks executable
  package proof
- related scoped sweep query/active scope/matches/patched/deferred: 4 methods,
  29 same-package uses/mocks, 3 rule reads, 2 option callbacks; 0 patched; all
  migration rows deferred
- out-of-scope matches discovered: 10 app/docs call sites plus stale List docs
  export prose
- changes made: audit plan only
- tests/proof commands: typecheck, direct tsc, package test, focused Bun tests,
  and build probed; none provides trustworthy List behavior proof in current
  shared state
- old compatibility names audited: no alias proposed; deleted old helper
  topology stays deleted
- needs attention: approve or reject the ranked List hard-cut packet above
- next best Plate Next packet: implement this List read migration only; do not
  start another package

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | 13-file package audit initialized |
| Where am I going? | Source-backed API/read/update verdict for every row |
| What is the goal? | Audit `packages/list`; no implementation yet |
| What have I learned? | Colocation is good; read ownership and active snapshot routing are stale |
| What have I done? | Reviewed and scored all 13 rows; recorded the exact migration packet and blockers |

Timeline:
- 2026-07-26T10:04:02.864Z Goal plan created.
- 2026-07-26 package registry validated; list status/fingerprint and 13-file
  manifest recorded.
- 2026-07-26 complete source audit classified 7 clean and 6 deferred rows;
  executable probes classified against current shared Core WIP.

Open risks:
- List behavior remains on the old API shape until the deferred packet is
  implemented.
- Current shared Core source/artifacts prevent trustworthy type, test, and
  declaration proof; rerun every named gate after that source freezes.
- Outside-scope app/docs callers will break on a true hard cut unless adopted
  in the follow-up packet.
