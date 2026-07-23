# plate-next table full colocation

Objective:
Fully colocate the table package; done when every manifest row scores 100 or
is explicitly deferred, no unjustified single-owner helper or tx-carrier
remains, and package proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-22-plate-next-table-full-colocation.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api

Plate Next source:
- prompt / link: user said `ok refactor next package` after closing the first
  three full-colocation packages and confirming that shared local helpers stay
  named when reuse or recursion earns the declaration
- mode: one-package exhaustive owner-topology review and implementation
- target surface: `packages/table`, selected from the live package topology
  audit as the highest remaining feature-package concentration (73 production
  files under helper/component/query-style paths)
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes; exact helper-directory,
  public export, caller, one-shot callback, normalization, and standalone
  `tx`-parameter audits inside `packages/table`; outside callers are discovery
  only unless a removed public export requires the smallest boundary repair
- package review mode: yes
- package review target: every current file in `packages/table`, plus the
  smallest Core/Plite owner only if table exposes a real blocker
- package file checklist gate: one row per package file before implementation;
  score 100 is the only checked state
- completion threshold summary: every table file is reviewed; single-owner
  plugin and React-family behavior is colocated; surviving helpers prove reuse
  or an independent boundary; package tests/typecheck/build/lint, barrels when
  changed, `check:core`, source audits, and autoreview pass

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
- semantics: N/A
- initial confidence score: N/A: binary manifest and proof gates
- improvement loop: review one durable owner family at a time, keep only
  multiple-consumer or independent boundaries, and rerun focused proof after
  each coherent packet
- final score / loop closure: every manifest row scores 100 or is explicitly
  deferred for user review, with no unclassified helper topology

Completion threshold:
- Every current `packages/table` file has a checklist row and a source-backed
  owner verdict.
- Every production transform/query/util/helper/component/hook family and every
  standalone `tx`-parameter function is merged into its durable owner or has
  concrete multiple-consumer, standalone algorithm, provider/store/lifecycle,
  public component-family, or proof-tooling evidence.
- No line-count threshold, folder taxonomy, historical export, or test-only
  import justifies a split.
- Runtime behavior and public concepts remain correct versus `origin/main`;
  stale compatibility helpers and exports are hard-cut without aliases.
- Source-first typecheck, package tests, package build, scoped lint, barrel
  generation when exports move, `pnpm check:core`, exact audits, and
  autoreview pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-next-table-full-colocation.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: table owner specs and the complete table package
  test suite after each coherent owner packet
- package proof: `pnpm turbo typecheck --filter=./packages/table`,
  `pnpm --filter @platejs/table test`, `pnpm --filter @platejs/table build`,
  and package-scoped lint/format proof
- shared Core gate: `packages/table` is already listed in
  `tooling/scripts/check-core.mjs`; run `pnpm check:core` at closure
- source audits: exact helper directories/imports/exports, `with*`/`decorate*`,
  one-shot read/update callbacks, standalone `tx` parameters, root option
  helpers, required public reads, plugin result annotations, and explicit
  normalization matches
- related scoped sweep query / active scope / match count / patched count / deferred count:
  table production topology/API/transaction scans: 0 forbidden production
  matches after 77 production-file merges; 49 stale-name matches across the
  broader repo were generated artifacts/history or public type names and were
  left untouched
- package file manifest / row count / checked count / deferred count: populate
  initial 167 / final 72 / 224 reviewed baseline-plus-final rows checked / 0
  deferred
- Plite/Plate gap ledger: N/A unless the owner audit proves a missing builder,
  transaction, query, React-family, or table composition capability
- broad Core drift ledger gate: N/A: one feature package, not broad Core
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-next-table-full-colocation.md`

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
  intentionally decoupled cross-package code. Inline single-owner plugin
  behavior in the builder context. Only a proven shared or independent helper
  should receive a narrow plugin context or required `tx` parameter.

Boundaries:
- allowed edit scope: `packages/table`, its generated barrels, one table
  changeset if published exports/runtime change, this goal plan, and the
  smallest direct caller required to close a removed public export; Core/Plite
  only for a proven blocker
- package/API surfaces: `@platejs/table`
- docs/browser surfaces: N/A by default; package review mode forbids docs/app
  expansion unless a removed public export leaves latest-state source invalid
- non-goals: no second package, no broad Core sweep, no cosmetic public plugin
  rename, no compatibility alias, no line ceiling, no unrelated docs/registry
  edits
- out-of-scope package errors: record and do not fix unless caused by the
  table packet or proving a touched Core/public API regression

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Count/list the table manifest and candidate classes before reading bodies;
  save large ledgers in this plan instead of streaming full-file content;
  exclude `dist`, coverage, generated build output, `node_modules`, `.next`,
  and `.turbo`; cap ordinary reads at one owner family or roughly 300 lines.

Blocked condition:
- Stop only if the same table behavior regression survives three distinct
  owner-correct fixes, or clean colocation requires a public Core/Plite API
  decision that cannot be made inside this package instruction.

Current verdict:
- verdict: review required; default `merge-existing-owner` for single-owner
  topology and `keep-in-plate` only with reuse/independent-boundary evidence
- confidence: medium before the full manifest and caller graph are scored
- next owner: plate-next
- keep / revert / quarantine call: keep the owner consolidation; no packet was
  reverted or quarantined
- reason: table behavior is one plugin subsystem. Its shared algorithms stay
  named inside `BaseTablePlugin.ts`; its single-owner file taxonomy did not earn
  77 separate production files.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User requested the next package refactor; continuation means full owner colocation, no line ceiling, and no needless inlining of genuinely shared/recursive local functions |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read fully; `architecture-cleanup` read fully for the source-shape lens |
| Active goal checked or created | yes | No prior goal; exact table package goal created with this plan path |
| Mode classified as named packet vs broad Core sweep | yes | One-package exhaustive review; broad Core N/A |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Current owner truth and hard cuts, not legacy topology |
| Broad Core drift ledger initialized when in scope | no | N/A: no Core sweep |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`, `packages/table` plus explicitly bounded proof/export owners |
| Output budget strategy recorded | yes | Bounded manifest/candidate reads and generated-output exclusions recorded above |
| Public API fork routing checked | yes | Internal topology is accepted; any newly discovered semantic API fork routes to `plate-plan` before implementation |
| Gap policy checked | yes | Missing substrate/composition capability is recorded as Plite/Plate gap; no local bridge |
| Related scoped sweep policy checked | yes | Table-only exact sweeps; broader callers are deferred except forced boundary repairs |
| Review-mode rename freeze checked | yes | Topology is explicitly mutable; owner-driven merge/delete/rename allowed, cosmetic churn rejected |
| Package review checklist initialized when in scope | yes | Sorted tracked-plus-untracked manifest materialized below with 167 rows before implementation |
| Package/API pack selected | yes | `package-api` rows materialized in this plan |
| Public surface or package boundary identified | yes | `@platejs/table`; export impact will be audited before edits |
| Release artifact path selected | yes | `.changeset` if a published table export/runtime changes; otherwise record exact no-artifact reason |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before adding `.changeset/table-block-insert.md`; major hard cut documented |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` whenever a public or internal barrel path changes |

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
- [x] N/A: broad Core sweep is not in scope, so no Core file ledger is
      required.
- [x] N/A: broad Core sweep is not in scope, so no Core row schema applies.
- [x] N/A: broad Core sweep is not in scope, so Core manifest counts do not
      apply.
- [x] N/A: broad Core sweep is not in scope, so its drift score gate does not
      apply.
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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | 231/231 table tests; table typecheck, build, lint, type contracts, docs parity, and barrels pass |
| Broad Core drift ledger coverage | no | N/A for a one-package review | Core ledger records N/A |
| Score gate | yes | Own/fix every row | 224 baseline-plus-final rows checked at 100; zero deferred |
| Best Plate v2 recommendation | yes | Record final owner shape | `BaseTablePlugin.ts` plus flat React family owners |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No table-owned substrate gap remains |
| Related scoped sweep after correction | yes | Run exact same-class scans | Zero forbidden production matches remain |
| Package file checklist | yes | Record manifest drift and every row | 167 initial, 72 final, 95 fewer files, zero missing final rows |
| Helper topology / lexical tx ownership | yes | Audit helper topology and transaction carriers | No helper taxonomy dirs or `EditorUpdateTransaction` production matches remain |
| Package/API proof | yes | Run package proof | Bun 231/231; build pass; lint 70 files clean; docs parity pass |
| Shared Core gate coverage | yes | Confirm package is covered | `packages/table` already appears in `tooling/scripts/check-core.mjs` |
| Non-Core package error triage | yes | Classify foreign failures | transient utils and Media errors cleared; `check:core` currently stops on an unrelated `@platejs/docx-io` readonly plugin-array error |
| Source audit | yes | Audit removed compatibility names | No removed helper/portal names remain in table production or current table docs |
| Rename ledger | no | N/A: owner-driven renames landed in this packet | No postponed rename |
| Extracted-file inventory | yes | Classify every final path | Final 72-path manifest fully represented; new spec paths are owner-local proof tooling |
| Autoreview / review | yes | Run review gate | clean: zero accepted/actionable findings, confidence 0.78 |
| Final lint/check | yes | Run scoped lint/check | Table lint, typecheck, type contracts, build, tests, barrels, docs parity, and browser render pass; unrelated broad Core blocker recorded |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run checker after final evidence | Final command recorded below |
| Public API / package boundary proof | yes | Audit exports and callers | Scoped Table plugin API/update adopted by active TS/TSX callers and docs |
| Release artifact classification | yes | Classify user-visible delta | Published `@platejs/table` major API hard cut |
| Published package changeset | yes | Add changeset | `.changeset/table-block-insert.md` marks `@platejs/table` major |
| Registry changelog | no | N/A: not registry-only | Package changeset is the owner |
| No release artifact | no | N/A: published API changed | Major changeset required and present |
| Package typecheck/build/test | yes | Run owner checks | Table typecheck/build/tests/lint all pass |
| Barrel/export generation | yes | Regenerate exported layout | `pnpm brl` pass recorded below |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `src/lib/{api,merge,queries,transforms,utils,internal,with*}` | 5 | merge-existing-owner | `BaseTablePlugin.ts` | 77 production files removed; 231/231 tests | done |
| root table helpers | 4 | scoped plugin API/update | `BaseTablePlugin.ts` | active callers and docs use `editor.plugin(TablePlugin)` | done |
| standalone transaction carriers | 5 | inline into tx groups | `BaseTablePlugin.ts` | zero `EditorUpdateTransaction` production matches | done |
| React components/hooks/stores taxonomy | 5 | merge by component/hook family | flat `src/react/*` | five durable owner files plus barrel | done |
| shared algorithms and public types | 1 | keep named in owner/type boundary | `BaseTablePlugin.ts`, `types.ts` | multiple production consumers or public contract | done |
| owner-local specs | 1 | colocate and rename around owner behavior | `src/lib`, `src/react` | 231/231 tests across 52 files | done |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `@platejs/table` | one headless plugin owner; one file per React component/hook family; shared public types separate | helper-taxonomy folders, `with*` files, root editor API aliases, tx-carrier functions, line-count splitting | shortest inference and navigation path while preserving genuinely reused algorithms | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | no table-owned capability gap remains | N/A | N/A | table suite and scoped API type-test | closed |
| resolved transient | `NormalizeTypesPlugin` briefly failed readonly-path checks during concurrent WIP | not owned by table and unrelated to this topology packet | `@platejs/utils` | exact table typecheck rerun | resolved; table typecheck passes |
| resolved shared browser integration | Core publication previously rejected a render component and the registry Table element lacked its editor binding | changing Core or unrelated registry UI inside this package packet would expand its ownership | Core/config and registry owners | `/blocks/table-demo` after shared repair | closed: one editable and one table render; no accessor or missing-editor crash |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| helper topology cut | `packages/table/src` | production dirs and `with*`/`decorate*` filenames | 77 old production files | 77 merged/deleted | 0 | none |
| lexical transaction ownership | table production | `EditorUpdateTransaction` plus nested one-shot update/read callbacks | 0 final forbidden matches | all prior carriers inlined | 0 | grouped test transaction remains test-only |
| old public API cut | package, active TS/TSX callers, table EN/CN docs | root table/create calls and removed helper imports | 0 final active matches | all active callers/docs patched | generated registry JSON excluded by owner rule | none in source |
| React family colocation | `packages/table/src/react` | nested components/hooks/stores and orphan helper scan | 0 nested production dirs | all merged | 0 | none |
| inference/normalization read audit | table production | plugin result annotations, empty configs, `required: true`, explicit normalize calls | 0 | 0 | 0 | none |

Core drift ledger:
- Applies: no: one feature-package review
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
| N/A | N/A | defer-with-owner | Core | Broad Core sweep is outside this one-package instruction | none |

Package file checklist:
- Applies: yes
- Package: `table`
- Manifest command: `find packages/table -type f` filtered to source/config/docs
  file extensions and excluding `dist`/`node_modules`; initial tracked-plus-
  untracked command retained in checkpoint-zero evidence
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 167
- Actual final manifest row count: 72
- Topology delta: 95 fewer physical files
- Reviewed ledger row count: 224 (167 initial paths plus 57 renamed/new final
  paths not present in the initial manifest)
- Checked score-100 count: 224
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: closed; every initial and final path is scored 100

Package file rows:
- [x] `packages/table/CHANGELOG.md` — score: 100 — verdict: keep durable owner/boundary — owner: package boundary — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/README.md` — score: 100 — verdict: keep durable owner/boundary — owner: package boundary — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/package.json` — score: 100 — verdict: keep durable owner/boundary — owner: package boundary — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/index.ts` — score: 100 — verdict: keep durable owner/boundary — owner: package boundary — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.schema.spec.ts` — score: 100 — verdict: keep durable owner/boundary — owner: BaseTablePlugin — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.spec.ts` — score: 100 — verdict: keep durable owner/boundary — owner: BaseTablePlugin — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.ts` — score: 100 — verdict: keep durable owner/boundary — owner: BaseTablePlugin — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/__tests__/getTestTablePlugins.ts` — score: 100 — verdict: keep durable owner/boundary — owner: BaseTablePlugin — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/api/getEmptyCellNode.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/api/getEmptyRowNode.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/api/getEmptyTableNode.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/api/index.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/constants.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/index.ts` — score: 100 — verdict: keep durable owner/boundary — owner: BaseTablePlugin — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/internal/clearSelectedTableCells.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/internal/tableGrid.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/internal/tablePluginContract.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/deleteColumn.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/deleteColumn.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/deleteColumnWhenExpanded.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/deleteRow.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/deleteRow.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/deleteRowWhenExpanded.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/deleteRowWhenExpanded.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/findCellByIndexes.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/getCellIndicesWithSpans.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/getCellPath.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/getSelectionWidth.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/getSelectionWidth.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/getTableGridByRange.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/getTableGridByRange.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/getTableMergedColumnCount.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/index.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/insertTableColumn.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/insertTableColumn.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/insertTableRow.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/insertTableRow.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/isTableRectangular.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/isTableRectangular.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/mergeTableCells.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/splitTableCell.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/merge/tableMergeBehavior.slow.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/normalizeInitialValueTable.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getAdjacentTableCell.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getCellInNextTableRow.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getCellInNextTableRow.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getCellInPreviousTableRow.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getCellInPreviousTableRow.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getColSpan.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getLeftTableCell.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getNextTableCell.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getNextTableCell.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getPreviousTableCell.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getPreviousTableCell.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getRowSpan.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getSelectedCells.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getSelectedCells.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getSelectedCellsBorders.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getSelectedCellsBorders.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getSelectedCellsBoundingBox.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getSelectedCellsBoundingBox.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableAbove.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableCellBorders.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableCellBorders.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableCellSize.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableCellSize.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableColumnCount.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableColumnCount.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableColumnIndex.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableColumnIndex.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableEntries.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableEntries.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableGridAbove.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableGridByRange.slow.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableGridByRange.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableOverriddenColSizes.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableOverriddenColSizes.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableRowIndex.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTableRowIndex.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTopTableCell.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/getTopTableCell.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/index.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/isTableBorderHidden.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/queries/isTableBorderHidden.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/deleteColumn.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/deleteColumn.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/deleteRow.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/deleteRow.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/deleteTable.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/deleteTable.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/index.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/insertTable.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/insertTable.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/insertTableColumn.slow.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/insertTableColumn.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/insertTableRow.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/insertTableRow.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/moveSelectionFromCell.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/moveSelectionFromCell.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/setBorderSize.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/setBorderSize.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/setCellBackground.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/setCellBackground.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/setTableColSize.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/setTableMarginLeft.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/setTableMarginLeft.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/setTableRowSize.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/shouldMoveSelectionFromCell.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/shouldMoveSelectionFromCell.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/transforms/tableSelectionAndSizing.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/types.ts` — score: 100 — verdict: keep durable owner/boundary — owner: BaseTablePlugin — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/utils/computeCellIndices.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/utils/getCellIndices.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/utils/getCellIndices.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/utils/getCellRowIndexByPath.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/utils/getCellType.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/utils/index.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withApplyTable.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withApplyTable.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withDeleteTable.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withDeleteTable.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withGetFragmentTable.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withGetFragmentTable.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withInsertFragmentTable.fitContent.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withInsertFragmentTable.slow.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withInsertFragmentTable.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withInsertTextTable.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withInsertTextTable.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withNormalizeTable.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withNormalizeTable.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withSetFragmentDataTable.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withSetFragmentDataTable.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withTable.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withTable.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withTableCellSelection.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/lib/withTableCellSelection.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseTablePlugin — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/TablePlugin.tsx` — score: 100 — verdict: keep durable owner/boundary — owner: React family owner — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/react/components/TableCellElement/getOnSelectTableBorderFactory.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableCellElement/index.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableCellElement/roundCellSizeToStep.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableCellElement/roundCellSizeToStep.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.integration.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableCellElement/useIsCellSelected.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableCellElement/useTableBordersDropdownMenuContentState.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableCellElement/useTableCellBorders.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableCellElement/useTableCellElement.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableCellElement/useTableCellElementResizable.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableCellElement/useTableCellSize.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableCellElement/useTableCellSize.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableElement/index.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableElement/useSelectedCells.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableElement/useTableColSizes.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableElement/useTableElement.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/TableElement/useTableSelectionDom.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/components/index.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/hooks/index.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/hooks/useCellIndices.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/hooks/useTableMergeState.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/hooks/useTableMergeState.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/index.ts` — score: 100 — verdict: keep durable owner/boundary — owner: React family owner — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/react/onKeyDownTable.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/onKeyDownTable.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/stores/index.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/src/react/stores/useTableStore.ts` — score: 100 — verdict: merge-existing-owner — owner: React family owner — evidence: behavior/spec merged into current owner family; 231/231 table tests and removed-name audit — next: done
- [x] `packages/table/tsconfig.build.json` — score: 100 — verdict: keep durable owner/boundary — owner: package boundary — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/tsconfig.json` — score: 100 — verdict: keep durable owner/boundary — owner: package boundary — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/type-tests/table-plugin-contracts.ts` — score: 100 — verdict: keep durable owner/boundary — owner: package boundary — evidence: current owner/boundary inspected; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.getCellInNextTableRow.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.getCellInPreviousTableRow.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.getCellIndices.spec.ts` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.getNextTableCell.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.getPreviousTableCell.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.getSelectedCells.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.getSelectedCellsBorders.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.getSelectedCellsBoundingBox.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.getTableCellBorders.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.getTableCellSize.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.getTableColumnIndex.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.getTableEntries.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.getTableRowIndex.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.getTopTableCell.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.api.isTableBorderHidden.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.apply.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.delete.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.getColumnCount.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.getFragment.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.getGridAbove.slow.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.getOverriddenColumnSizes.spec.ts` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.getSelectionWidth.spec.ts` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.insertFragment.fitContent.spec.ts` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.insertFragment.slow.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.insertText.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.isRectangular.spec.ts` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.merge.deleteColumn.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.merge.deleteRow.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.merge.deleteRowWhenExpanded.spec.ts` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.merge.getTableGridByRange.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.merge.insertTableColumn.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.merge.insertTableRow.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.merge.tableMergeBehavior.slow.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.normalize.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.selection.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.selectionAndSizing.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.update.deleteColumn.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.update.deleteRow.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.update.deleteTable.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.update.insertTable.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.update.insertTableColumn.slow.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.update.insertTableRow.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.update.moveSelectionFromCell.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.update.setBorderSize.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.update.setCellBackground.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.update.setTableMarginLeft.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/lib/BaseTablePlugin.writeSelection.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: BaseTablePlugin — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/react/TablePlugin.navigation.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: React family owner — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/react/TablePlugin.onKeyDown.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: React family owner — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/react/useTableCellElement.roundCellSizeToStep.spec.ts` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: React family owner — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/react/useTableCellElement.setSelectedCellsBorder.integration.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: React family owner — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/react/useTableCellElement.ts` — score: 100 — verdict: keep durable owner/boundary — owner: React family owner — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/react/useTableCellElement.useTableCellSize.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: React family owner — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/react/useTableElement.ts` — score: 100 — verdict: keep durable owner/boundary — owner: React family owner — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/react/useTableMergeState.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling beside owner — owner: React family owner — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/react/useTableMergeState.ts` — score: 100 — verdict: keep durable owner/boundary — owner: React family owner — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done
- [x] `packages/table/src/react/useTableStore.ts` — score: 100 — verdict: keep durable owner/boundary — owner: React family owner — evidence: current final manifest; 231/231 table tests and scoped source audits — next: done

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| headless topology | `BaseTablePlugin.ts` | helper taxonomy hid one plugin owner | 77 production files plus package callers | merge and hard-cut exports | done |
| React topology | flat React owner files | subcomponent/subhook folders split one family | components/hooks/stores plus keydown | merge by family | done |
| API hard cut | `TablePlugin` scoped portal | root APIs obscured plugin ownership | package, AI, www, EN/CN docs | scoped API/update only | done |
| proof repair | owner-local specs | global Bun mocks and stale names weakened suite | 52 test files | real plugins, local spies, owner naming | done |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Start gates | done | exhaustive package manifest, scope, packs, and proof threshold captured before edits | none |
| Headless implementation | done | 77 production files merged; scoped API/update; no transaction carrier remains | none |
| React implementation | done | flat component/hook family owners and provider/store boundaries | none |
| Package verification | done | 231/231 tests; typecheck/build/lint/type contracts/barrels/docs parity pass | none |
| Broad integration | browser done / foreign blocker | `/blocks/table-demo` renders its toolbar, editable, and table; `check:core` passes audits/contracts then stops in unrelated `@platejs/docx-io` | docx-io owner repairs broad typecheck; no Table work remains |
| Review and closeout | done | autoreview clean; 224 ledger rows at 100; zero deferred | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| renamed `BaseTablePlugin.*.spec.*` files | justify-new-proof-tooling | behavior originated in old split helper specs | keep beside plugin owner | 231/231 tests |
| flat React owner/spec files | merge-existing-owner | behavior originated in nested component/hook folders | keep family files | React focused rows included in full suite |
| `type-tests/table-plugin-contracts.ts` | justify-new-proof-tooling | public portal contract needs compile-only proof | keep package boundary proof | `pnpm test:types` and table typecheck pass |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `@platejs/utils` transient | three readonly `Path` diagnostics appeared during concurrent writes | no table frame or changed table type appeared | resolved by shared owner; exact table typecheck rerun green |
| `@platejs/docx-io` via `check:core` | `docx-export-plugin.tsx:614` passes readonly `PluginReference[]` to mutable `AnyBasePlugin[]` | broad typecheck stops in a foreign package after every audit/contract phase and all Table-owned checks pass | docx-io owner repairs, then rerun `check:core` |
| www browser hydration | server/client random `data-table-cell-id` values differ | demo is usable and renders one editable plus one table; this predates and is outside the Table topology packet | table-cell ID/SSR owner makes ID generation deterministic |
| resolved Core/registry integration | component identity publication and `TableElement` editor binding were repaired by their owners | source is frozen outside this packet | preserve `mergePlugins.ts`, `resolvePlugins.ts`, `resolvePlugins.spec.tsx`, and registry `table-node.tsx`; browser rerun is green |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| generated table registry JSON with old exports | `apps/www/public/r/*.json` | CI-controlled generated output; local edits forbidden | CI regeneration from updated source |
| shared history/schema publication and nested validation | Plite history/schema owners | source-frozen concurrent fixes; table only consumed their proof | preserve exact frozen files |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | all headless behavior in `BaseTablePlugin.ts`; flat React family owners; scoped Table API/update callers; 77 old production files removed |
| tests/proof | specs renamed/colocated; global Bun mocks removed; explicit hook precedence covered; scoped type contract updated |
| docs/templates/skills | EN/CN table docs use final scoped portal; major table changeset; this exhaustive plan ledger |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | unrelated docx-io type blocker | stops the final broad `check:core` typecheck after audits/contracts pass | `packages/docx-io/src/lib/docx-export-plugin.tsx:614` | docx-io owner fixes readonly plugin-array compatibility; rerun broad gate |
| 2 | existing table-cell ID hydration mismatch | random SSR/client `data-table-cell-id` values produce the only captured console error | `/blocks/table-demo` | ID/SSR owner makes cell IDs deterministic; not a colocation blocker |

Findings:
- Baseline table source is already a 149-file migration diff versus
  `origin/main` (5,600 insertions / 6,332 deletions); this packet must preserve
  that live WIP and refactor from current behavior.
- Baseline source-first typecheck passes 14/14 tasks. The package test wrapper
  exits green but emits no test count, so Bun package-path tests remain the
  behavior proof surface.
- Final physical package manifest is 72 files versus 167 initially. The useful
  complexity stayed; the navigation tax did not.
- `BaseTablePlugin.ts` is 5,157 lines. That is coherent and easier for agents
  than hopping through 77 single-owner production files.
- Renaming `withInsertFragmentTable.slow.tsx` to an actual `*.spec.tsx` owner
  name made Bun collect 16 previously skipped tests. Those tests caught that
  grid repair called the local factory instead of the plugin-overridable
  `api.createCell` / `api.createRow`; the command and correction now honor the
  configured plugin API.

Decisions and tradeoffs:
- Keep named local algorithms only when reused, recursive, independently
  testable, or part of the public type contract. Colocation does not mean
  turning a 5,157-line file into one anonymous expression.
- Use only the scoped `TablePlugin` portal publicly; no root aliases or compat
  re-exports.
- Keep `types.ts`, `useTableStore.ts`, and `useTableMergeState.ts` as genuine
  public/independent boundaries. Everything else follows plugin/component/hook
  family ownership.
- Plugin-internal behavior that is intentionally overridable must call its
  resolved scoped API, not the pre-extension local implementation.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| standalone demo blank | 1 | rerun after frozen Core/registry owner repairs | resolved: `/blocks/table-demo` renders one editable and one table with no accessor or missing-editor crash |
| table typecheck transient shared failure | 2 | inspect diagnostic owner instead of patching table | shared owner resolved it; exact table typecheck passes |
| `tsx` EditorKit diagnostic import | 1 | use package-local descriptor scan and browser stack | TablePlugin eliminated as accessor source; broad EditorKit import blocked by unrelated package exports |

Verification evidence:
- Baseline `pnpm turbo typecheck --filter=./packages/table` -> 14/14 tasks pass.
- Baseline `pnpm --filter @platejs/table test` -> exit 0; no counted tests,
  therefore insufficient as the sole behavior oracle.
- `bun test packages/table/src --bail 1` -> 231 pass, 0 fail, 401 expects,
  52 files.
- `pnpm --filter @platejs/table build` -> pass.
- `pnpm --filter @platejs/table lint:fix` -> 70 files checked, no fixes.
- `pnpm --filter www check:docs` -> docs source parity passed.
- `bun test packages/ai/src/lib/utils/getMarkdown.spec.tsx packages/ai/src/lib/utils/replacePlaceholders.spec.tsx`
  -> 6 pass, 0 fail.
- Browser `/blocks/table-demo` after frozen Core/registry repairs -> URL loads,
  heading `Table`, one `[contenteditable=true]`, and one rendered table with the
  expected Plugin/Element/Inline/Void content; no descriptor-accessor or
  missing-editor crash. The only captured console error is the existing random
  `data-table-cell-id` SSR/client hydration mismatch.
- `pnpm --filter @platejs/table typecheck` -> pass.
- `pnpm test:types` -> pass.
- `pnpm brl` -> 56/56 tasks pass.
- `pnpm check:core` -> all audit/contract phases pass, then broad typecheck
  stops at `packages/docx-io/src/lib/docx-export-plugin.tsx:614` because
  readonly `PluginReference[]` is not assignable to mutable `AnyBasePlugin[]`;
  no Table frame is involved.
- `.agents/skills/autoreview/scripts/autoreview --mode local ...` -> clean,
  zero accepted/actionable findings; patch correct; confidence 0.78.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-next-table-full-colocation.md`
  -> complete.

Final handoff contract:
- target surface and mode: exhaustive one-package `@platejs/table` refactor
- files/APIs reviewed: all 167 initial paths and all 72 final paths; scoped
  Table API/update, headless plugin behavior, React families, callers, docs
- broad Core drift score coverage: N/A; no broad Core sweep
- package file checklist coverage: 224 checked rows, zero deferred
- best Plate v2 recommendation: one coherent headless owner plus flat durable
  React family owners
- verdict matrix summary: delete/merge taxonomy; keep only shared algorithms,
  public types, stores, and independent hooks
- Plite/Plate gaps or blockers: no table gap; Core/registry browser integration
  is repaired and verified; only an unrelated docx-io broad-gate failure remains
- related scoped sweep query/active scope/matches/patched/deferred: all table
  topology/API/tx/normalization/inference scans closed at zero forbidden
  production matches
- out-of-scope matches discovered: generated registry output and frozen shared
  history/schema fixes
- changes made: runtime/API/test/docs/changeset/plan groups recorded above
- tests/proof commands: package 231/231, AI 6/6, build/lint/docs and standalone
  browser render pass; unrelated broad-check failure explicit
- old compatibility names audited: yes; zero current table source/docs matches
  except legitimate public option type names
- needs attention: docx-io readonly plugin-array owner and deterministic
  table-cell SSR IDs; neither reopens this package-colocation packet
- next best Plate Next packet: Table is closed; choose the next package

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure |
| Where am I going? | Checker and exact handoff |
| What is the goal? | Fully colocate table without deleting useful shared or independent boundaries |
| What have I learned? | Table's complexity belongs together; only shared algorithms, types, stores, and independent hook boundaries earn names/files |
| What have I done? | Collapsed 77 production files, hard-cut root APIs, flattened React families, preserved behavior with 231 tests, and scored every baseline/final row |

Timeline:
- 2026-07-22T22:08:51.172Z Goal plan created.
- 2026-07-23 Checkpoint zero closed: table selected from live topology counts;
  167 tracked-plus-untracked package rows materialized before implementation.
- 2026-07-23 Baseline proof: table typecheck 14/14 and package test wrapper exit
  0 before ownership edits.
- 2026-07-23 Final package proof: 231/231 tests; table typecheck/build/lint/type
  contracts/barrels/docs parity pass; shared broad-Core/browser blockers were
  initially isolated outside TablePlugin.
- 2026-07-23 Integration rerun: frozen Core/registry owner repairs remove the
  descriptor-accessor and missing-editor crashes; standalone demo renders one
  editable and one table. Broad `check:core` reaches unrelated docx-io drift.

Open risks:
- Broad `check:core` remains red only at unrelated docx-io readonly plugin-array
  drift. The demo's existing random table-cell ID hydration mismatch remains
  visible, but the editor and table render and neither issue reopens this
  colocation packet.
