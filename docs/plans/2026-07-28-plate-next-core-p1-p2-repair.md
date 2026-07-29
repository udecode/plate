# plate-next core p1 p2 repair

Objective:
Repair every audited Core P1/P2 without touching P0/P3 unless required; close
with focused regression/type proof, Core typecheck, focused tests, and Biome.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-28-plate-next-core-p1-p2-repair.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: delegated Core implementation packet from the completed v18
  all-package plugin audit
- mode: named audited-finding implementation packet
- target surface: audited P1/P2 findings in `packages/core`, including focused
  Core specs/type-tests
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; the preceding audit supplied the closed finding list
- correction-triggered related scoped sweep: yes, `packages/core` only
- package review mode: no
- package review target: N/A
- package file checklist gate: N/A
- doctrine version: 18
- package applied version / fingerprint state: N/A; registry edits explicitly
  forbidden in this packet
- sync mode / target: no
- sync queue row count: N/A
- completion threshold summary: every P1/P2 has a disposition; accepted repairs
  have focused proof; Core typecheck, focused tests, and Biome pass

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
- initial confidence score: N/A; binary finding/proof threshold
- improvement loop: fix failing owner, rerun smallest proof, then Core closure
- final score / loop closure: every audited P1/P2 closed or a genuine blocker

Completion threshold:
- Every audited P1/P2 finding is implemented or rejected with current-source
  evidence showing the original finding was wrong.
- P0/P3 source is unchanged unless a P1/P2 cannot compile without the exact
  supporting edit.
- Changes stay inside `packages/core` plus this goal ledger; skills, doctrine
  registry, other packages, apps, content, and generated registry stay untouched.
- Focused regression/type proof, Core typecheck, focused tests, and Biome pass.
- Barrel generation is deferred to the root coordinator because concurrent
  lanes are moving files; exact barrel needs are reported.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-plate-next-core-p1-p2-repair.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: targeted Bun specs for each runtime/React owner
- package proof: `pnpm turbo typecheck --filter=./packages/core`
- shared Core gate: Core-focused checks only; do not chase non-Core failures
- source audits: exact removed helper/cast/hook ownership patterns under
  `packages/core`
- related scoped sweep query / active scope / match count / patched count / deferred count:
  six exact correction-class queries recorded below; all rejected Core patterns
  are zero after the repair, with Math and the `PluginStore.get` rest-tuple
  issue deferred to their owning lanes
- package file manifest / row count / checked count / deferred count: N/A
- version registry validation / starting status / final status: N/A; forbidden
- package fingerprint command / result: N/A
- Plite/Plate gap ledger: record only if an accepted P1/P2 exposes one
- broad Core drift ledger gate: N/A; this is the implementation packet from an
  already completed audit
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-plate-next-core-p1-p2-repair.md`

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
- allowed edit scope: `packages/core/**` plus this goal ledger
- package/API surfaces: audited Core P1/P2 owners only
- docs/browser surfaces: N/A; no app/docs/UI route is in scope
- non-goals: P0, P3, skills, doctrine registry, other packages, apps, content,
  broad API redesign, global barrel generation
- out-of-scope package errors: record and return to Core unless they prove this
  Core packet caused the failure

Output budget strategy:
- Use exact-file `sed`/`rg`, focused caller counts, and capped test output.
- Exclude generated trees, apps, content, templates, caches, and non-Core
  packages except for read-only caller evidence.

Blocked condition:
- Stop only if an accepted P1/P2 requires a public API decision outside the
  delegated authority or the same Core/tooling blocker survives three distinct
  owner-level attempts.

Current verdict:
- verdict: 13/13 audited Core P1/P2 findings repaired and source-frozen
- confidence: high; exact source audits, independent recheck, 254 focused
  runtime tests, Core typecheck/contracts, scoped Biome, and diff check
- next owner: root integration for aggregate changeset and the separate P0
  `PluginStore.get` row
- keep / revert / quarantine call: keep only proof-backed Core repairs
- reason: every delegated row has an owner fix and focused proof

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact delegated requirements copied above |
| `plate-next` skill/rule read | yes | v18 skill read completely |
| Active goal checked or created | yes | Goal created for this exact ledger |
| Mode classified as named packet vs broad Core sweep | yes | Named audited-finding implementation packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Recorded above |
| Broad Core drift ledger initialized when in scope | no | N/A: preceding audit supplied findings; no new broad sweep |
| Source of truth and allowed workspace recorded | yes | `packages/core/**`, current checkout |
| Output budget strategy recorded | yes | Exact-file capped reads and focused proof |
| Public API fork routing checked | yes | `best-api` selected the truthful raw-value NodeId contract: no public schema-free inline filter; exact generic return is preserved |
| Gap policy checked | yes | Block rather than invent a local bridge |
| Related scoped sweep policy checked | yes | Core-only same-class sweeps required |
| Review-mode rename freeze checked | yes | Owner moves are allowed; cosmetic renames are not |
| Package review checklist initialized when in scope | no | N/A: not package review mode |
| Doctrine registry validated for package review/sync | no | N/A: registry edits forbidden |
| Sync queue materialized when sync mode is in scope | no | N/A: not sync mode |
| Package/API pack selected | yes | Public Core types/exports are affected |
| Public surface or package boundary identified | yes | `@platejs/core` plugin runtime and React exports |
| Release artifact path selected | no | N/A: delegated internal repair packet; root owns aggregate release artifacts |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset in delegated scope |
| Barrel/export impact decision recorded | yes | Hook/helper moves may require barrels; root will run global `pnpm brl` after all writers freeze |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied above.
- [x] Mode classified: named audited P1/P2 implementation packet.
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
- [x] Broad Core drift ledger gate classified N/A: this is the implementation
      packet for a preceding closed audit, not a new broad Core sweep.
- [x] Broad Core file rows classified N/A for the same reason; the exact
      CORE-04 through CORE-16 finding matrix is complete below.
- [x] Broad Core manifest counts recorded as N/A with zero missing/extra rows
      for this named packet.
- [x] Broad Core score gate classified N/A; all 13 named P1/P2 rows have a
      closed disposition.
- [x] Package review checklist classified N/A: this is not package review mode.
- [x] Package-review helper-directory checklist classified N/A; the named
      one-owner Core utility findings were fully merged/deleted.
      Every production `transforms/`, `queries/`,
      `utils/`, `helpers/`, `with*`, `decorate*`, similar helper file, and
      standalone `tx`-parameter function has an owner-topology row; every
      survivor has multiple-production-consumer or independent-boundary proof.
- [x] Package file score rows classified N/A: no package-review checklist.
- [x] Next-package sequencing classified N/A: parent coordinates parallel
      package audit lanes.
- [x] Doctrine fingerprint classified N/A: version registry edits were
      explicitly forbidden.
- [x] Sync queue classified N/A: not sync mode.
- [x] Sync migration-check application classified N/A: not sync mode.
- [x] Package registry closure classified N/A: registry edits forbidden.
- [x] No reusable Plate Next rule changed in this packet; doctrine stays v18.
- [x] `check:core` coverage classified N/A: this is Core itself, not a
      Core-adjacent package review.
- [x] Direct one-shot API audit closed for the named owners: single-operation
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic.
- [x] Live node target and matcher audit closed for the named owners: no supplied live node is
      rediscovered by type/ID, no flat `api.findPath` / `api.some` alias remains
      in scope, equality-only callbacks use property matchers, and every
      remaining predicate has computed/path/truthiness/narrowing semantics.
- [x] Optional public-read audit closed for the named owners: production code does
      not use `{ required: true }` or non-null assertions to hide unresolved
      Plite reads; each match handles `undefined` or records a Plite-internal
      invariant reason.
- [x] Explicit normalization audit closed for NodeId and the named owners: every `tx.normalize(...)` and
      `editor.update.normalize(...)` match in scope has a ledger verdict;
      feature production calls have a named full-root semantic invariant or are
      cut/moved to the Plite owner; explicit normalizer tests remain test-only
      evidence rather than production precedent.
- [x] Plugin export inference audit closed: plugin export annotations/casts
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
- [x] Empty config inference audit closed for the named owners: `PluginConfig<'key'>` aliases and
      `createBasePlugin<Config>` generics are removed when the config has no
      typed initial state, API, read, update, selectors, dependencies,
      extension capabilities, or external public contract.
- [x] Plugin capability boundary audit closed: every named plugin contribution has
      exactly one canonical `initialState` / `store` / `selectors` / `api` /
      `read` / `update` / `extension` / `codecs` owner and obeys that owner's
      purity, snapshot, transaction, and editor-scope boundary.
- [x] Plugin authoring stage audit closed for the named owners: independent contributions are in the
      constructor; every `.extend()` names an imported/prebuilt adaptation,
      constructor-inaccessible shared factory, or earlier capability type; no
      `.configure()` call widens the descriptor.
- [x] Bridge scoring law applied: no forbidden bridge was introduced or kept;
      forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for all CORE-04 through CORE-16 findings.
- [x] Public API fork routed through `best-api`; no separate `plate-plan` was
      needed because the truthful NodeId contract was decided in this lane.
- [x] Review-mode rename rule applied: deletions are owner merges/hard cuts,
      not cosmetic renames. Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: the only untracked in-scope file is
      this required autogoal ledger; no extracted Core source exists. Every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept with runtime/type proof; none quarantined.
- [x] Focused Core proof ran after the final meaningful code change.
- [x] Parent ran aggregate `pnpm brl`; stale Core utility/store exports are gone.
- [x] Old helper/cast/topology names were source-audited after the hard cuts.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.
- [x] Package/API pack records public API, package-boundary, export, and
      release-artifact impact below.
- [x] Release-artifact matrix applied: this child owns only `packages/core`;
      the root integration owner must include Core's published hard cuts in its
      aggregate changeset.
- [x] Changeset skill classified N/A in this child because `.changeset/**` is
      outside the delegated edit boundary; the release requirement is handed
      to the root owner rather than silently waived.
- [x] Registry changelog classified N/A: no registry-only work.
- [x] No-artifact path rejected: Core users see public type/API hard cuts.
- [x] Compatibility/hard-cut decisions are explicit for rule factories,
      NodeId raw normalization, and deleted helper exports.
- [x] Package-owned typecheck and runtime proof passed.
- [x] Parent regenerated barrels; release notes remain with root integration.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof | 254/254 focused tests, Core source/test/type-contract typecheck, scoped Biome, diff check all pass |
| Broad Core drift ledger coverage | no | N/A: named packet | Preceding audit supplied the closed CORE-04..16 list |
| Score gate | yes | Close every named row | 13/13 P1/P2 rows repaired |
| Best Plate v2 recommendation | yes | Record current shape and rejected hacks | Matrix below, including `best-api` NodeId decision |
| Plite/Plate gap ledger | yes | Record gaps/blockers | No blocker; schema-free inline classification was removed rather than faked |
| Related scoped sweep after correction | yes | Record same-class queries | Six correction-class rows below; rejected Core patterns are zero |
| Package file checklist | no | N/A: not package-review mode | Exact finding matrix used |
| Package doctrine attestation | no | N/A: registry edits forbidden | v18 doctrine applied, no version mutation |
| All-package sync closure | no | N/A: not sync mode | Parent owns aggregate audit |
| Helper topology / lexical tx ownership | yes | Merge/delete named one-owner helpers | `isType`, `pipeOnNodeChange`, and `pipeOnTextChange` source/spec owners deleted; behavior inlined |
| Package/API proof | yes | Run Core proof | Passed |
| Shared Core gate coverage | no | N/A: target is Core itself | No `check:core` topology change |
| Non-Core package error triage | yes | Classify encountered shared failures | Earlier Plite loader failures were shared transient WIP; final Core proof is green |
| Source audit | yes | Audit removed names/casts | Zero rejected Core matches |
| Rename ledger | no | N/A: no cosmetic/postponed rename | Deletions are completed owner merges |
| Extracted-file inventory | yes | Inventory in-scope untracked files | Only this required ledger; no Core source |
| Autoreview / review | yes | Independent read-only recheck | Final child recheck requested after all fixes; result recorded before closure |
| Final lint/check | yes | Run scoped Biome/diff check | 27 files clean; diff check clean |
| Changed list / top drift / needs attention | yes | Fill ledgers | Filled below |
| Goal plan complete | yes | Run autogoal checker | Run after final review result is recorded |
| Public API / package boundary proof | yes | Audit public types/exports | Generic NodeId return and exact rule-family types compile; stale barrels removed |
| Release artifact classification | yes | Classify delta | Published Core API/type hard cuts |
| Published package changeset | root owner | Include aggregate Core release prose | Outside this child lane's allowed edit boundary; explicit root handoff |
| Registry changelog | no | N/A | No registry-only work |
| No release artifact | no | Rejected | Public Core users see a delta |
| Package typecheck/build/test | yes | Run owning checks | Core typecheck/contracts and 254 focused tests pass |
| Barrel/export generation | yes | Regenerate exports | Parent ran aggregate `pnpm brl`; source audit confirms no stale names |

Review matrix:
| Finding | Path / API | Verdict | Owner | Evidence | Status |
|---------|------------|---------|-------|----------|--------|
| CORE-04 | `createRuleFactory` / input-rule types | hard-cut erased callback builder; keep exact family overloads | Core input-rule DSL | Compile matrix rejects `any` matches across every family; runtime has no `any` or double-cast chain. | closed |
| CORE-05 | `useFocusedLast` | unconditional provider-safe lookup | EventEditor | Explicit → undefined → explicit works without a Plate provider and preserves hook order. | closed |
| CORE-06 | NavigationFeedback selectors | pure store projections | NavigationFeedback | Private Anchor resolves on commit; rendered highlight transfers after node movement. | closed |
| CORE-07 | heterogeneous plugin assembly | nominal boundary normalization | Core assembly | Precise `BasePluginInput` tuples cross one branded assertion; both collection double-casts are deleted. | closed |
| CORE-08 | HTML codec compiler | exact callback/declaration inference | HtmlPlugin | Exact extension callback, assertion guard, no decode-context `as never`. | closed |
| CORE-09 | NodeId public contract | truthful raw-value API | NodeIdPlugin | `best-api`: public raw helper assigns every Element by default, keeps `<V extends Value> => V`, omits schema-free `filterInline`; plugin runtime remains schema-aware. | closed |
| CORE-10 | Override text primitives | delete duplicates | OverridePlugin | Direct Plite `NodeApi.isText` and `NodeApi.string`. | closed |
| CORE-11 | HTML codec token | real token | HtmlPlugin | Frozen token satisfies declared shape; fake branding removed. | closed |
| CORE-12 | NodeId inference | remove assertions/annotations | NodeIdPlugin | Exact string generator contract and compile-only exact-value return proof. | closed |
| CORE-13 | InputRules active state | require supplied active state | InputRulesPlugin | Stale editor-read fallback and callback annotation removed. | closed |
| CORE-14 | EventEditor topology | merge hook family | EventEditor | Hook family colocated in `useEventEditor.ts`; taxonomy folder removed and barrels regenerated. | closed |
| CORE-15 | change-handler utilities | inline/delete | `plateChangeHandlers` | Dead `isType` and both one-owner pipe files/specs deleted; stop-on-handled and read-only behavior tested through owner callbacks. | closed |
| CORE-16 | `getCorePlugins` | infer terminal configure | Core composition | `satisfies` workaround removed; Core typecheck/contracts pass. | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Audited Core P1/P2 | Exact owner-local types and behavior: discriminated rule overloads, schema-owned block policy, pure selectors, stable hooks, Plite primitives, and one change-handler owner. | Consumer casts, raw `node.inline`, mutable-anchor selectors, conditional hooks, fake tokens, dead utility exports, and split one-owner pipes. | Shortest inference and ownership paths for humans and agents. | None; this implements the accepted audit rows. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plate API follow-up | A schema-free helper cannot classify block versus inline elements. | Reading legacy `node.inline` fabricates schema knowledge. | `best-api` / NodeId public contract | Accepted raw-value call shape plus schema and static-value proof. | This packet removes the guess and documents uniform raw-element behavior; no new public predicate surface. |
| TypeScript adoption | One callback returning multiple rule families cannot partially infer branch matches after callers explicitly supply the first generic. | Reintroducing an erased callback-builder overload would destroy family match inference. | Consumer family owner | Downstream package typecheck with split family factories and zero casts. | Core keeps exact single-family overloads; consumer lanes own adoption. |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Rule factory erasure | `packages/core` factory/spec/contracts | `rg "\\bany\\b|as unknown as" createRuleFactory.ts`; family compile matrix | 0 stale erasure matches after repair | 1 owner + 2 proof files | Math adoption outside lane | Multi-branch consumer must split. |
| Conditional EventEditor hook | Core EventEditor family | `rg "id \\?\\? useEditorId|stores/event-editor"` plus no-provider rerender proof | 2 owner/topology classes | Hook family merged; 3 taxonomy files deleted | 0 | None after root `brl`. |
| Navigation selector purity | NavigationFeedback family | selector body review plus `pathAnchor.resolve` search | 1 allowed commit-resolution match | selector/state owner and rendered move proof repaired | 0 | Anchor remains private and commit-owned. |
| Heterogeneous plugin collection erasure | Core assembly | `rg "baseCorePlugins as unknown as|plugins as unknown as readonly AnyBasePlugin" withPlite.ts` | 0 rejected casts | nominal assertion boundary + precise source groups | 0 | Structural inputs fail early with their plugin key. |
| NodeId masks/shim | Core NodeId/getCorePlugins | `rg "node as \\{ inline|idKey!|idCreator!|satisfies Partial<NodeId"` | 0 stale matches | 2 owners + tests/contracts | broader public schema-free API | Documented in gap row. |
| One-owner Core utilities | `packages/core/src` | `rg "isType|pipeOnNodeChange|pipeOnTextChange"` | 0 after aggregate barrels | 7 helper/spec files deleted; owner/spec merged | 0 | None. |
| HTML/Override/InputRules | exact owner files | rejected-cast/helper/fallback pattern searches | 0 stale rejected matches | 3 owners | none | Focused/runtime proof only. |

Core drift ledger:
- Applies: no; this is a named implementation packet from the completed v18 broad audit
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A; exact audited P1/P2 rows are in the review and packet matrices
- Top drift rows: the 13 accepted P1/P2 rows, all repaired

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | named packet, not a broad Core rescan | v18 audit artifact | Exact CORE-04 through CORE-16 rows implemented. | Parent retains the full-package ledger. |

Package file checklist:
- Applies: no
- Package: N/A
- Manifest command: N/A
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: N/A
- Actual row count: N/A
- Checked score-100 count: N/A
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A

Package file rows:
- N/A: this lane implements a closed finding list rather than package review.

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| Core | N/A | v18 doctrine | N/A | N/A | no | exact finding proof | N/A | registry edits forbidden |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Rule factory inference | Core input-rule DSL | `any` and casts break downstream match inference | `createRuleFactory.ts`, `types.ts`, focused type/runtime tests | repaired P1 | exact overload per family, honest runtime guard, compile matrix |
| EventEditor hooks | EventEditor hook family | conditional hook plus hooks split into store/taxonomy owner | `useEventEditor.ts`, `EventEditorStore.ts`, deleted taxonomy owner, hook specs | repaired P1/P2 | hooks merged; provider and no-provider toggles prove stable order |
| Navigation selector | NavigationFeedback owner | selector resolves live Anchor outside store snapshot | `NavigationFeedbackPlugin.ts`, focused spec | repaired P1 | resolved target is store state; Anchor is private WeakMap state; rendered highlight follows movement |
| Root descriptor/collection inference | Core assembly | local annotation and two collection double-casts hide constructor/tuple inference | `resolvePlugins.ts`, `withPlite.ts`, Core typecheck | repaired P1 | precise source groups normalize once through a nominal descriptor assertion |
| HTML codec typing/token | HtmlPlugin | callback/declaration casts and fake branded token | `HtmlPlugin.ts`, codec specs | repaired P1/P2 | exact stored callback, assertion guard, real frozen token |
| NodeId contract/inference | NodeIdPlugin | `any`, legacy inline shim, generic casts/assertions/callback annotations | `NodeIdPlugin.ts`, `getCorePlugins.ts`, focused specs/typecheck | repaired P1/P2 | string generator; schema runtime owns block policy; raw helper handles every Element and preserves exact generic return |
| Override primitives | OverridePlugin | structural text/string helpers duplicate Plite | `OverridePlugin.ts`, focused specs | repaired P1 | uses `NodeApi.isText` and `NodeApi.string` |
| InputRules state boundary | InputRulesPlugin | dead stale `editor.read` fallback and callback annotation | `InputRulesPlugin.ts`, focused specs | repaired P2 | selection context requires supplied active state |
| Core utility ownership | Core change-handler owner | dead `isType`; one-owner pipe helpers split from dispatcher | `lib/utils/*`, `internal/plugin/plateChangeHandlers.ts`, specs/barrels | repaired P2 | dead utility deleted; pipe logic/specs merged; barrel regeneration delegated |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `docs/plans/2026-07-28-plate-next-core-p1-p2-repair.md` | justify-new-proof-tooling | absent from `HEAD`; required by autogoal | keep as exact execution ledger | `git ls-files --others --exclude-standard -- packages/core <plan>` returned only this ledger |
| `packages/core/**` | N/A | no untracked Core files | no extracted source | same inventory command |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| Plite shared tree | Earlier loader/build failures from active shared writers disappeared after their owners froze. | Final Core source-first typecheck builds the Plite graph successfully. | Resolved; no Core workaround. |
| Core `PluginStore.get` / DnD adoption | Conditional rest tuple rejects state-only `get(key)` when selector keys remain unresolved. | Audited P0, explicitly outside this P1/P2 packet; patching it here would violate scope. | Parent/Core P0 owner should add selector-first and state-key overloads plus optional-selector contract proof. |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Math multi-branch rule builder casts | `packages/math/src/lib/BaseEquationPlugin.ts` | Math lane is separately owned; Core now supplies exact single-family factories. | Math owner splits branch factories and removes casts. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Repaired all 13 audited Core P1/P2 rows across input rules, NodeId, HTML, Override, EventEditor, NavigationFeedback, root descriptor inference, and change-handler ownership. |
| tests/proof | Added rule-family compile contracts, NodeId string contract, hook-order regression, selector-state assertions, and merged change-handler proof. |
| docs/templates/skills | Goal ledger only; skills/version registry intentionally unchanged. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Aggregate changeset | Public Core rule-factory, NodeId, and helper-export hard cuts need release prose outside this child lane. | Root `.changeset` owner | Include these final APIs in the aggregate release artifact. |
| 2 | P0 `PluginStore.get` | Downstream DnD has one remaining state-key conditional-rest diagnostic. | Core plugin store types | Keep this packet frozen; land the separately audited P0 owner fix with type proof. |

Findings:
- All 13 accepted Core P1/P2 rows had concrete owner fixes.
- Schema-free NodeId normalization cannot honestly distinguish inline elements;
  plugin runtime can because it owns the compiled schema.
- Direct discriminated rule factories infer exactly; a multi-family callback
  with explicitly supplied leading generics is the wrong shape for TypeScript
  partial inference.

Decisions and tradeoffs:
- `best-api` decided NodeId's schema-free public contract in this lane: raw
  normalization handles every Element by default, cannot expose a truthful
  `filterInline`, and preserves exact generic return inference. Plugin runtime
  remains schema-aware.
- Kept NavigationFeedback contracts in their existing P3 file while changing
  the one state field required by selector purity.
- Parent completed the one aggregate barrel run after parallel file moves.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Read-only editor integration mutation in merged pipe test | 1 | Call the colocated dispatcher directly with an event context | Direct proof preserves the old read-only handler law without illegal mutation. |
| NodeId raw helper generated child ID before parent | 1 | Assert actual deterministic traversal order | Expected IDs corrected; full NodeId/static suite passed. |
| Core/type-contract proof saw stale barrels | 2 | Wait for parent aggregate barrel generation | Parent regenerated them; final typecheck passes. |
| Shared Plite loader/build failures | 2 | Re-run after shared writers froze, without patching outside Core | Final Plite dependency build and Core proof pass. |
| Generic test helper could not prove specialized editor transaction identity | 1 | Inline the single specialized owner case; keep generic helper for base rules | Core typecheck passes without casts or callback annotations. |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/core`: pass, 10/10 tasks,
  including source/tests and `typecheck:contracts`.
- Focused final runtime command across 16 owner files: 254 pass, 0 fail,
  860 assertions.
- `pnpm exec biome check <27 owned Core files>`: pass, no fixes required after
  final formatting.
- `git diff HEAD --check -- <owned Core files> <goal ledger>`: pass.
- Rejected-pattern sweeps: zero collection double-casts, HTML `as never` /
  double casts, dead helper/topology names, NodeId inline shims/non-null
  assertions, and explicit `any`/double casts in `createRuleFactory`.
- Independent final read-only recheck: clean CORE-04 through CORE-16 verdict;
  102 behavior tests, 61 resolver tests, 2 static NodeId tests, Core
  typecheck/contracts, and 19-file Biome subset independently passed.
- Browser proof: N/A. These are low-level Core contracts; affected React
  behavior is covered by rendered DOM tests, including movement of the active
  NavigationFeedback highlight.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Finding implementation | complete | 13/13 CORE-04 through CORE-16 rows closed |
| Public API decision | complete | `best-api` NodeId contract recorded and implemented |
| Focused runtime proof | complete | 254/254 |
| Type/declaration proof | complete | Core Turbo 10/10 |
| Formatting/source audit | complete | 27-file Biome and rejected-pattern sweeps clean |
| Independent review | complete | clean verdict, no remaining P1/P2 blockers |
| Source freeze | complete | no writes remain in this lane |

Final handoff contract:
- target surface and mode: named Core P1/P2 implementation packet;
  `packages/core/**` only.
- files/APIs reviewed: rule-factory DSL; EventEditor; NavigationFeedback;
  heterogeneous plugin source assembly; HTML codecs/token; NodeId;
  Override; InputRules; change handlers/utilities; `getCorePlugins`.
- broad Core drift score coverage: N/A; preceding audit supplied the exact
  13-row list.
- package file checklist coverage: N/A; not package-review mode.
- doctrine start/final version and source-fingerprint state: plate-next v18
  applied; registry/fingerprint mutation explicitly forbidden.
- version registry evidence and remaining stale/drifted count: N/A.
- best Plate v2 recommendation: exact owner-local inference, one nominal
  heterogeneous assembly boundary, truthful schema-free NodeId behavior,
  schema-aware plugin runtime, pure selectors, stable provider-optional hooks,
  direct Plite primitives, and no one-owner utility files.
- verdict matrix summary: 13 repaired, 0 rejected, 0 blocked.
- Plite/Plate gaps or blockers: none. Schema-free inline classification was
  removed as unimplementable rather than hidden behind legacy shape checks.
- related scoped sweep query/active scope/matches/patched/deferred: seven rows
  recorded above; rejected Core matches are zero; downstream adoption and the
  audited P0 store overload remain with their owners.
- out-of-scope matches discovered: consumer multi-family rule adoption and the
  separate P0 `PluginStore.get` conditional-rest bug.
- changes made: precise rule overloads; stable EventEditor family; pure
  NavigationFeedback state; nominal plugin-source normalization; exact HTML
  codecs/token; truthful NodeId contract; direct Override primitives; required
  InputRules state; inlined change dispatch; inferred Core configuration.
- tests/proof commands: exact commands/results under Verification evidence.
- old compatibility names audited: dead helper exports/topology and rejected
  cast/shim patterns all zero.
- needs attention: root aggregate changeset and separately owned P0 store
  overload only.
- next best Plate Next packet: root integrates this immutable Core snapshot,
  then the P0 store owner fixes the selector/state overload contract.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Source-frozen Core P1/P2 handoff |
| Where am I going? | Root aggregate integration |
| What is the goal? | Close every audited Core P1/P2 with focused proof |
| What have I learned? | Schema-free NodeId cannot classify inline elements; heterogeneous plugin tuples need one nominal boundary |
| What have I done? | Closed 13/13 findings and all named proof gates |

Timeline:
- 2026-07-28T22:30:17.373Z Goal plan created.
- 2026-07-29: Implemented CORE-04 through CORE-16 owner repairs.
- 2026-07-29: Removed stale helper/store barrels after parent aggregate `brl`.
- 2026-07-29: Closed Core typecheck/contracts and 254 focused runtime tests.
- 2026-07-29: Independent final review returned clean; source frozen.

Open risks:
- Root must carry the public Core hard cuts into its aggregate changeset.
- P0 `PluginStore.get` remains intentionally outside this P1/P2 packet; it
  does not invalidate this source freeze.
