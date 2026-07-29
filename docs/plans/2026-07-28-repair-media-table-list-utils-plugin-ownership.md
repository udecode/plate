# repair media table list utils plugin ownership

Objective:
Implement every accepted P1/P2 plugin-ownership repair in media, table, list,
and utils without Core or skill edits, then prove the four package surfaces.

Goal plan:
docs/plans/2026-07-28-repair-media-table-list-utils-plugin-ownership.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: parent implementation handoff from completed read-only audit
- mode: named correction packet across four package owners
- target surface: `packages/{media,table,list,utils}` only
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, limited to the four named
  packages
- package review mode: no; the parent already completed and accepted the audit
- package review target: N/A
- package file checklist gate: N/A
- doctrine version: plate-next v18 plus current plate-plugin-creator
- package applied version / fingerprint state: not modified in this packet
- sync mode / target: no
- sync queue row count: 0
- completion threshold summary: all accepted P1/P2 rows repaired, no Core or
  skill changes, focused package typechecks/tests and scoped formatting pass,
  and barrel regeneration handed to root after all package writers freeze

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
- semantics: one-shot implementation and proof
- initial confidence score: 86
- improvement loop: inspect live owners, patch one package family at a time,
  rerun source sweeps and focused proof
- final score / loop closure: 94; package-local type surfaces and scoped Biome
  are clean, while focused runtime suites are blocked by concurrent missing
  Core barrels and final root regeneration

Completion threshold:
- Every accepted P1/P2 finding in media, table, list, and utils is either fixed
  in its durable owner or recorded as a concrete blocker.
- `packages/core` and skill/version-registry files remain untouched.
- No new `any`, `unknown` cast, callback annotation, context ferry, or
  single-owner helper is introduced to mask inference.
- Focused typechecks pass for `@platejs/media`, `@platejs/table`,
  `@platejs/list`, and `@platejs/utils`; focused affected tests and scoped
  Biome checks pass.
- Barrel regeneration is not run here while concurrent lanes move files; all
  add/delete/move needs are reported to the root lane for one final `pnpm brl`.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-repair-media-table-list-utils-plugin-ownership.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: focused package specs selected after live source
  inspection; `pnpm turbo typecheck` for all four packages; scoped Biome
- package proof: media contracts/migration/placeholder, table mutation/paste
  and plugin tests, list Base/React behavior, utils block-placeholder behavior
- shared Core gate: N/A; Core is explicitly forbidden
- source audits: exact searches for casts/`any`, stale helper imports, React in
  Base List, and hooks inside BlockPlaceholder descriptor
- related scoped sweep query / active scope / match count / patched count / deferred count:
  the exact negative-owner queries in the ledger cover the four named package
  families; 0 stale production matches remain, 0 deferred
- package file manifest / row count / checked count / deferred count: N/A,
  named accepted correction packet
- version registry validation / starting status / final status: N/A, root owns
  registry attestation
- package fingerprint command / result: N/A
- Plite/Plate gap ledger: no gap known; smallest Plite owner allowed only if
  live typing proves it necessary
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-repair-media-table-list-utils-plugin-ownership.md`

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
  'foo' })`. Manual plugin config types are only for real initial state, API,
  read, update, selectors, dependencies, extension capabilities, or external
  public contracts.
- Plugin capability boundary law: classify every contribution against the
  canonical `plate-plugin-creator` protocol. `initialState` declares defaults;
  `store` owns live editor-local state; `selectors` are pure store projections;
  `api` owns non-snapshot plugin services; `read` owns pure supplied-state
  queries; `update` owns active-transaction document mutation; `extension`
  owns genuine editor-wide Plite substrate; `codecs` own format declarations.
  Reject document reads in `api`, document mutations outside `update`, impure
  selectors/reads, plugin-scoped behavior hidden in `extension`, and
  unclassifiable contributions.
- Plugin authoring stage law: keep every independent contribution in
  `createBasePlugin()` / `createPlatePlugin()`. Keep `.extend()` only for
  imported/prebuilt adaptation, a shared factory unavailable to the
  constructor, or a real earlier-capability type dependency. Keep
  `.configure()` terminal and non-widening. Inline extension options need no
  wrapper; extracted reusable Plate extension factories use the callback
  context's `defineEditorExtension`.
- Inferred local type law: do not annotate local variables whose initializer
  should infer the type. Smells like `const entries: NodeEntry<T>[] =
  editor.read...` or `const value: Value = [...]` hide type regressions at the
  owner API. Remove the annotation and fix the source API if inference is weak.
  Keep annotations only for uninferrable locals such as empty arrays,
  deliberate narrowing/widening, exported/public signatures, or external
  boundary callbacks.
- Plugin state law: plugin defaults use `initialState`; descriptor overrides
  use `.configure({ initialState })`; builder callbacks use inferred `store`;
  consumers use `editor.plugin(FooPlugin).store.get/set/subscribe`; React
  subscriptions use `usePluginStore` or `useEditorPluginStore`. Do not use or
  re-add root or scoped `getOption`, `getOptions`, `setOption`, `setOptions`,
  `usePluginOption`, or a parallel immutable `config` channel. Key+generic
  portals need an owner reason: plugin self-definition cycle, React
  hook/component imported by the plugin itself, non-React layer that must not
  import a React plugin, or intentionally decoupled cross-package code. Inline
  single-owner plugin behavior in the builder context. Only a proven shared or
  independent helper should receive a narrow plugin context or required `tx`
  parameter.

Boundaries:
- allowed edit scope: `packages/media`, `packages/table`, `packages/list`,
  `packages/utils`, plus the smallest Plite type owner only if unavoidable
- package/API surfaces: media plugin factory/placeholder/migration; table
  mutation/paste/read reuse/test fixture typing; List semantic/React split and
  task-list hook plumbing; BlockPlaceholder hook family
- docs/browser surfaces: no docs/apps/browser edits; no runnable app surface is
  part of this package-local packet
- non-goals: no Core edits, no skill/rule/version-registry edits, no P3 cleanup,
  no global `pnpm brl`, no unrelated API redesign
- out-of-scope package errors: classify and report; do not patch other owners

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- The same missing type capability is proven three times to require an owner
  outside the allowed package/Plite scope, or concurrent shared writes make an
  immutable package snapshot impossible.

Current verdict:
- verdict: implement accepted P1/P2 packet
- confidence: 86
- next owner: plate-next
- keep / revert / quarantine call: keep only behavior-preserving owner repairs
- reason: the read-only audit already established each finding and durable
  owner; this turn implements that accepted scope

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Objective, completion threshold, boundaries, proof, handoff, and stop condition recorded |
| `plate-next` skill/rule read | yes | Full `plate-next` v18 skill read |
| Active goal checked or created | yes | No active goal; this plan will back the new goal |
| Mode classified as named packet vs broad Core sweep | yes | Named correction packet; no broad Core sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Owner-first Plate v2 shape recorded above |
| Broad Core drift ledger initialized when in scope | no | N/A |
| Source of truth and allowed workspace recorded | yes | Live `/Users/zbeyens/git/plate-2`; four package owners only |
| Output budget strategy recorded | yes | Targeted reads and focused package proof |
| Public API fork routing checked | yes | No new public fork; accepted implementation only |
| Gap policy checked | yes | No workaround; smallest Plite owner only if proven |
| Related scoped sweep policy checked | yes | Four named package scopes only |
| Review-mode rename freeze checked | no | Implementation explicitly allows durable file moves |
| Package review checklist initialized when in scope | no | N/A; accepted named packet |
| Doctrine registry validated for package review/sync | no | Root owns registry, no sync mode |
| Sync queue materialized when sync mode is in scope | no | N/A |

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
- [x] Broad Core sweep ledger is N/A because Core is explicitly out of scope.
- [x] Broad Core per-file rows are N/A because Core is explicitly out of scope.
- [x] Broad Core manifest accounting is N/A; no Core sweep was authorized:
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] Broad Core drift score gate is N/A:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] Package review checklist is N/A; this is an accepted named correction
      packet, not a fresh package review.
- [x] Package-review helper inventory is N/A; named helper families were
      audited directly:
      `utils/`, `helpers/`, `with*`, `decorate*`, similar helper file, and
      standalone `tx`-parameter function has an owner-topology row; every
      survivor has multiple-production-consumer or independent-boundary proof.
- [x] Package-review score-100 rows are N/A:
      score `100` with evidence or left unchecked with deferral reason, owner,
      proof needed, and next action for user review.
- [x] Package sequencing gate is N/A for this four-owner accepted packet.
- [x] Doctrine fingerprint attestation is N/A; no review/sync mode or registry
      edits were authorized.
- [x] Sync queue rows are N/A:
      version, required missing-version checks, full-review trigger, proof,
      final fingerprint, and ledger status.
- [x] Sync migration checks are N/A:
      package review; unchanged later-version packages receive every missing
      doctrine version's `migrationChecks`.
- [x] Package review/sync ledger patch is N/A:
      focused proof and autoreview; final plan closure runs only after package
      registry status is `current`.
- [x] No reusable Plate Next rule changed; skills and registry remained
      untouched as required.
- [x] `check:core` coverage is N/A; these are product feature packages and Core
      is explicitly owned by another concurrent lane.
- [x] Direct one-shot API audit closed for the named corrections:
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic.
- [x] Live node target and matcher audit closed for the named corrections:
      rediscovered by type/ID, no flat `api.findPath` / `api.some` alias remains
      in scope, equality-only callbacks use property matchers, and every
      remaining predicate has computed/path/truthiness/narrowing semantics.
- [x] Optional public-read audit closed for the named corrections:
      not use `{ required: true }` or non-null assertions to hide unresolved
      Plite reads; each match handles `undefined` or records a Plite-internal
      invariant reason.
- [x] Explicit normalization audit closed; none of the named corrections added
      or preserved a normalization wrapper:
      `editor.update.normalize(...)` match in scope has a ledger verdict;
      feature production calls have a named full-root semantic invariant or are
      cut/moved to the Plite owner; explicit normalizer tests remain test-only
      evidence rather than production precedent.
- [x] Plugin export inference audit closed:
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
- [x] Empty config inference audit closed:
      `createBasePlugin<Config>` generics are removed when the config has no
      typed initial state, API, read, update, selectors, dependencies,
      extension capabilities, or external public contract.
- [x] Plugin capability boundary audit closed:
      exactly one canonical `initialState` / `store` / `selectors` / `api` /
      `read` / `update` / `extension` / `codecs` owner and obeys that owner's
      purity, snapshot, transaction, and editor-scope boundary.
- [x] Plugin authoring stage audit closed:
      constructor; every `.extend()` names an imported/prebuilt adaptation,
      constructor-inaccessible shared factory, or earlier capability type; no
      `.configure()` call widens the descriptor.
- [x] Bridge scoring law is N/A; no forbidden bridge exists in the named
      correction families.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] No public API fork was introduced; `plate-plan` routing is N/A.
- [x] Rename freeze is N/A because implementation topology changes were
      explicitly accepted; the move/delete list is handed to root for barrels.
- [x] Extracted-file recovery inventory is recorded for every new/moved file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept and recorded with package-local type
      evidence plus scoped Biome.
- [x] Focused package proof was run after meaningful code changes; concurrent
      Core barrel deletion blocks final green runtime proof.
- [x] Barrel regeneration is deliberately handed to root for one final
      `pnpm brl` after every package writer freezes.
- [x] Removed helper/config/cast names are source-audited.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Package-local type surfaces contain no Media/Table/Utils errors and no new List React errors; runtime suites await final Core barrels |
| Broad Core drift ledger coverage | no | N/A | Core explicitly forbidden and owned by another lane |
| Score gate | no | N/A | Accepted named correction packet, not package review |
| Best Plate v2 recommendation | yes | Record the recommended shape | Four target recommendations recorded below |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No package API gap; only concurrent integration proof blockers |
| Related scoped sweep after correction | yes | Run same-class searches | Four zero-match production sweeps recorded below |
| Package file checklist | no | N/A | Accepted named correction packet |
| Package doctrine attestation | no | N/A | No review/sync mode and no registry edits |
| All-package sync closure | no | N/A | Not sync-all mode |
| Helper topology / lexical tx ownership | yes | Audit named helpers and tx owners | Migration/paste one-owner helpers merged; real Table mutation planner and shared media factory retained |
| Package/API proof | yes | Run focused typecheck/tests | Scoped Biome passes; runtime suites blocked by concurrent missing Core barrels |
| Shared Core gate coverage | no | N/A | Product packages; Core is outside scope |
| Non-Core package error triage | yes | Classify proof errors | Core input-rule/barrel and Plite React errors are outside this lane |
| Source audit | yes | Audit removed helper/config/cast names | Exact production queries return zero matches |
| Rename ledger | no | N/A | Accepted topology changes are not postponed |
| Extracted-file inventory | yes | Classify new/moved files | Rows recorded below |
| Autoreview / review | yes | Review non-trivial diffs | Self-review and exact owner sweeps complete; root performs integrated final review |
| Final lint/check | yes | Run scoped lint/check | Biome 21/21 files clean |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Recorded below |
| Goal plan complete | yes | Run the autogoal checker after root barrels/tests | Pending root integration proof |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `media/BaseMediaPlugin` | 5 | repaired | media semantic plugin | real `PluginReference`, inferred descriptor results, no double casts; compile-only not-`any` assertions | root reruns integrated proof |
| `media/BasePlaceholderPlugin` + React adapter | 4 | split | Base/React owners | Base owns schema/insert only; React owns state, dependencies, selectors, API, handlers | root reruns integrated proof |
| `media/migrations/MediaV54Migration*` | 4 | merged | migration plugin | algorithm colocated; internal file deleted; public behavior proof retained | root regenerates barrels |
| `table/internal/mutation` | 5 | repaired | table mutation planner | typed mutable model and direct tx operations replace `unknown`/`never` casts | root reruns focused suites |
| `table/internal/paste` | 3 | merged | BaseTablePlugin paste update | one-use prepared-plan applier inlined at owner | done |
| table React selection hooks | 3 | reuse portal | Table plugin read API | both hooks call scoped `read.getSelection` | done |
| table test plugin factory | 4 | repaired | package test utility | plugin array and special override infer without callback `any` | done |
| `list/BaseListPlugin` + React adapter | 4 | split | Base/React owners | Base is renderer-neutral `.ts`; live JSX wrapper belongs to `ListPlugin.tsx` | root reruns focused suites |
| `list/useTodoListElement` | 3 | repaired | hook family | consuming hook acquires editor directly | done |
| `utils/BlockPlaceholderPlugin` | 4 | split hook family | plugin plus `useBlockPlaceholder` | hook family extracted; exact context comes from reusable base descriptor plus `WithAnyKey` | root reruns focused suite |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| media | inferred reusable factory, slim semantic Placeholder, React state/dependencies, migration algorithm in its plugin | casts, dead config types, helper file by implementation kind | durable owners and builder inference | none |
| table | typed independent mutation planner, one-owner paste wrapper inline, plugin read portal reused | `unknown`/`never`, tx ferry wrappers, raw owner reconstruction | preserves the real algorithm boundary and scoped API | none |
| list | renderer-neutral Base plugin plus live React adapter | JSX in Base, empty adapter, editor ferry | real runtime boundary | none |
| utils | declarative plugin plus one hook-family file | hooks inside descriptor or one hook per file | hook family is the durable React owner | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none known | N/A | casts/annotations remain forbidden | package owner first; smallest Plite type owner only if live proof requires it | focused typecheck | attempt package-local repair |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| media inference/ownership | named Media factory, Placeholder, migration owners | `rg "as unknown|as never|MediaV54Migration\\.internal|Placeholder(Api|Selectors|Updates|Rule)" ... --glob '!*.spec.*'` | 0 | 0 | 0 | none |
| table mutation/paste typing | named mutation, paste, fixture owners | `rg "applyPreparedTablePastePlan|as unknown|as never|=> any" ...` | 0 | 0 | 0 | none |
| table scoped read reuse | `packages/table/src/react` | `rg "readTableSelection" packages/table/src/react` | 0 | 0 | 0 | none |
| Base/React and hook boundaries | BaseList plus BlockPlaceholder descriptor | React/hook import searches in the semantic descriptor owners | 0 | 0 | 0 | none |

Core drift ledger:
- Applies: no
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A; Core explicitly forbidden
- Top drift rows: pending

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | Core not in this packet | concurrent Core owner | no Core edits made | root integrates |

Package file checklist:
- Applies: no
- Package: N/A; named correction packet across four accepted owners
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
- [x] N/A — accepted named packet, not package review mode.

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| Media/Table/List/Utils | v18 | v18 | registry untouched | N/A | no | focused source/type/Biome | root-owned | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| media | media package | factory casts, misplaced Placeholder state/deps, migration helper split | named media owners and focused tests | repaired and source-frozen | root barrels/proof |
| table | table package | mutation casts, one-use paste wrapper, raw read bypass, fixture `any` | named table owners and focused tests | repaired and source-frozen | root proof |
| list | list package | Base/React boundary leak and editor ferry | named list owners and focused tests | repaired and source-frozen | root proof |
| utils | utils package | BlockPlaceholder hooks embedded in descriptor | named utils owners and focused tests | repaired and source-frozen | root barrels/proof |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/list/src/lib/BaseListPlugin.ts` | recover-main-owner | replaces JSX-bearing `.tsx` owner | keep renderer-neutral semantic owner | root barrel |
| `packages/list/src/react/ListPlugin.spec.tsx` | justify-new-proof-tooling | live wrapper had no React-owner proof | keep focused behavior proof | root test |
| `packages/media/src/lib/BaseMediaPlugin.ts` | merge-existing-owner | consolidates shared media plugin family | keep coherent shared factory/owners | root barrel |
| `packages/media/src/migrations/MediaV54MigrationPlugin.ts` | merge-existing-owner | absorbs one-owner `.internal` algorithm | keep plugin owner; delete internal file | root barrel |
| `packages/utils/src/react/hooks/useBlockPlaceholder.ts` | recover-main-owner | hooks moved out of descriptor, one hook family | keep family owner | root barrel |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| Core source/barrels | missing `isType`, `pipeOnNodeChange`, `pipeOnTextChange`, `event-editor/index`; input-rule config inference errors | no named package-local error in Media/Table/Utils; concurrent Core owner is still writing | Core lane then root regeneration |
| Plite React | editor-context comparison errors during package typecheck | outside four package owners and unchanged by this packet | Plite React owner/root |
| List dependency inference | missing `indent` capability and input-rule variance in existing Base/spec lines | BaseIndent/Core dependency authoring is concurrently changing; new `ListPlugin`/todo files report no errors | Core/Indent lane then root rerun |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| production double casts / dead helper names | none in named owners | N/A | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Media factory/Placeholder/migration ownership; Table mutation/paste/read owners; List Base/React and todo hooks; Utils BlockPlaceholder hook family |
| tests/proof | React List wrapper proof; migration canonical/foreign behavior proof; Table fixtures infer without `any`; compile-only Media not-`any` assertions retained |
| docs/templates/skills | this goal ledger only; no skill/version/source-rule edits |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Final barrels | concurrent lanes deleted/moved Core and package files | root checkout | run one global `pnpm brl` after all writers freeze |
| 2 | Integrated focused proof | current Bun/typecheck resolution stops on missing Core barrels and concurrent Plite errors | exact commands below | rerun after barrels/Core freeze |

Findings:
- Accepted audit findings are enumerated in the review matrix; no P3 row is in
  implementation scope.

Decisions and tradeoffs:
- Keep `defineMediaPlugin`, `applyTableMutationPlan`, raw
  `readTableSelection`, and `planTableCellDrop`: each has real reuse or an
  independent algorithm boundary.
- Inline `applyPreparedTablePastePlan` and the V54 migration algorithm because
  each has one production owner.
- Do not run global `pnpm brl` while concurrent source lanes move files; root
  performs one final regeneration after immutable handoffs.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Utils hook manual `PluginConfig` narrowed contextual `read`/schema | 3 | derive exact base config and apply `WithAnyKey` | resolved without casts |
| Focused runtime suites stop on missing Core source barrels | 3 | do not patch foreign owner; hand exact blocker to root | pending root regeneration |
| Four package typechecks stop on Core input-rule/barrel and Plite React errors | 3 | filter package-local diagnostics and freeze assigned source | no Media/Table/Utils local errors; List React split files clean |

Verification evidence:
- `pnpm exec biome check <21 named files>`: 21/21 clean.
- Exact production source sweeps for media casts/dead Placeholder contracts,
  Table tx/paste wrappers, raw Table React selection reads, React in Base List,
  and hooks in BlockPlaceholder descriptor: 0 matches.
- `pnpm --filter @platejs/{media,table,utils} typecheck` filtered to `^src/`:
  0 package-local diagnostics.
- `pnpm --filter @platejs/list typecheck`: no diagnostics in the new
  `ListPlugin.tsx`, `ListPlugin.spec.tsx`, or changed task-list hook; remaining
  Base/spec diagnostics are concurrent BaseIndent/input-rule capability drift.
- Focused Table run reached 13 passing mutation tests / 5,205 assertions before
  missing Core barrels stopped imported plugin suites.
- All other focused runtime suites stop before test collection on the same
  missing Core barrel entries. Root owns the final rerun after regeneration.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| implementation | complete | all ten accepted rows repaired |
| source audit | complete | four zero-match sweep families |
| package-local type review | complete | no Media/Table/Utils local errors; new List React files clean |
| integrated runtime proof | blocked-external | concurrent Core barrels and Plite React errors |
| root handoff | ready | assigned source frozen; barrel/test commands recorded |

Final handoff contract:
- target surface and mode: named accepted P1/P2 correction packet in
  `packages/{media,table,list,utils}`
- files/APIs reviewed: ten rows in the review matrix
- broad Core drift score coverage: N/A; Core forbidden
- package file checklist coverage: N/A; not package review mode
- doctrine start/final version and source-fingerprint state: v18; registry
  untouched by instruction
- version registry evidence and remaining stale/drifted count: N/A
- best Plate v2 recommendation: owner-first shapes recorded above
- verdict matrix summary: 10/10 repaired; source frozen
- Plite/Plate gaps or blockers: no package API gap; final proof waits on
  concurrent Core barrels and Plite React owner
- related scoped sweep query/active scope/matches/patched/deferred: four named
  query families, 0 remaining matches, 0 deferred
- out-of-scope matches discovered: Core input-rule/barrel, Plite React, and
  BaseIndent dependency inference only
- changes made: exact group list recorded above
- tests/proof commands: exact commands and partial results recorded above
- old compatibility names audited: yes, 0 remaining production matches
- needs attention: root runs one barrel generation and reruns focused proof
- next best Plate Next packet: root integration only; no more source writes in
  this lane

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Source-frozen package handoff |
| Where am I going? | Root barrel regeneration and integrated proof |
| What is the goal? | Repair all accepted P1/P2 owners in four packages without Core/skill edits |
| What have I learned? | Package-local typing is clean; shared source barrels prevent final runtime collection |
| What have I done? | Repaired 10/10 rows, audited owners, formatted 21 files, and recorded blockers |

Timeline:
- 2026-07-28T22:32:15.979Z Goal plan created.

Open risks:
- Final integrated runtime proof and unfiltered package typechecks require the
  concurrent Core/Plite writers to freeze and root to regenerate barrels.
