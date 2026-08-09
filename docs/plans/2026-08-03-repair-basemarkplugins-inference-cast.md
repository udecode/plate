# repair BaseMarkPlugins inference cast

Objective:
Remove the `BaseMarkPlugins` input-rule cast at the true inference owner; done
when the plugin stays fully inferred, the scoped cast-class audit is clean, and
Basic Nodes type/tests plus focused review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-03-repair-basemarkplugins-inference-cast.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user identified
  `packages/basic-nodes/src/lib/BaseMarkPlugins.ts` and the explicit
  `as { markdown: InputRuleFactory<{ variant: '*' | '_' }> }` drift.
- mode: named file/API packet
- target surface: `BaseMarkPlugins` input-rule contextual inference plus the
  smallest owning Core/Input Rules generic if required
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, exact `InputRuleFactory`
  casts in Basic Nodes plus the smallest shared generic caller graph
- package review mode: no; this is a named-file inference repair, not a full
  Basic Nodes package review
- package review target: N/A
- package file checklist gate: N/A
- doctrine version: v50; no doctrine change expected
- package applied version / fingerprint state: N/A for named-file mode
- sync mode / target: no
- sync queue row count: N/A
- completion threshold summary: zero compensating casts in the active scope;
  inline contextual inference preserved; focused type/tests and autoreview pass

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
- initial confidence score: N/A; binary inference and proof gate
- improvement loop: repair local authoring only if inference is already sound;
  otherwise repair the smallest shared generic owner
- final score / loop closure: zero active-scope casts plus green proof/review

Completion threshold:
- `BaseMarkPlugins` infers the Markdown input-rule factory without a result
  cast or explicit callback annotation.
- The scoped cast-class sweep has zero unexplained matches.
- Basic Nodes source-first typecheck, focused input-rule behavior proof, scoped
  lint/diff check, and autoreview pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-03-repair-basemarkplugins-inference-cast.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Basic Nodes mark/input-rule tests selected from the
  live caller graph
- package proof: `pnpm turbo typecheck --filter=./packages/basic-nodes`
- shared Core gate: only if the owning Core/Input Rules generic changes
- source audits: exact `InputRuleFactory` result-cast class in Basic Nodes and
  smallest shared owner graph
- related scoped sweep query / active scope / match count / patched count / deferred count:
  pending
- package file manifest / row count / checked count / deferred count: N/A,
  named-file mode
- version registry validation / starting status / final status: N/A,
  named-file mode with no doctrine sync
- package fingerprint command / result: N/A
- Plite/Plate gap ledger: record N/A if inline inference already works; otherwise
  name the exact generic owner
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-03-repair-basemarkplugins-inference-cast.md`

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
- Base/static renderer boundary law: Base constructors stay renderer-neutral.
  Base `.extend()` also rejects component authoring. Static/base kits bind the
  owning server-safe `*-static` renderer through terminal
  `BasePlugin.configure({ component })` without importing a Plate React
  entrypoint. Live React adapters use
  `toPlatePlugin(BasePlugin).configure({ component })`.
- Definition inference law: do not create `PluginConfig`, pass a whole-plugin
  factory generic, or call an extracted descriptor definition `FooConfig`.
  Let `createBasePlugin({ name: 'foo' })` infer the descriptor and use
  `DefinitionOf<typeof FooPlugin>` only when a real exported definition
  contract is needed, named `FooDefinition`.
- Plugin capability boundary law: classify every contribution against the
  canonical `plate-plugin-creator` protocol. `initialState` declares defaults;
  `store` owns live editor-local state; `selectors` are pure store projections;
  `api` owns non-snapshot plugin services; `read` owns pure supplied-state
  queries; `update` owns active-transaction document mutation; flat native
  Plite fields own genuine editor-wide substrate; `codecs` own format
  declarations.
  Reject document reads in `api`, document mutations outside `update`, impure
  selectors/reads, plugin-scoped behavior hidden in native fields, and
  unclassifiable contributions.
- Plugin authoring stage law: keep every independent contribution in
  `createBasePlugin()` / `createPlatePlugin()`. Keep `.extend()` only for
  imported/prebuilt adaptation, a shared factory unavailable to the
  constructor, or a real earlier-capability type dependency. Keep
  `.configure()` terminal and non-widening. Native Plite fields stay flat on
  the plugin; independently reusable standalone Plite descriptors use
  `defineEditorExtension`.
- Dependency type boundary law: root
  `EditorExtensionDependencyReference` is shallow and non-generic. Keep finite
  name-keyed capability/provider carriers and their value-sensitive HKT under
  `@platejs/plite/internal`, never recursively encode exact dependency
  ancestry, and require static name+capability equivalence plus runtime exact
  descriptor identity.
- Core lowering law: author-source-to-canonical-lowered aliases are internal.
  Do not export or teach an intermediate plugin type between the one author
  object and its exact descriptor.
- React bridge law: low-level composition is exactly `react({ dom })` with one
  required object and the exact DOM descriptor. Permit one explicit erased
  implementation boundary only for the TypeScript 7 invariant-union reduction
  limit.
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
  `usePluginOption`, or a parallel immutable `config` channel. Name-only
  portals need an owner reason: plugin self-definition cycle, React
  hook/component imported by the plugin itself, non-React layer that must not
  import a React plugin, or intentionally decoupled cross-package code. Inline
  single-owner plugin behavior in the builder context. Only a proven shared or
  independent helper should receive a narrow plugin context or required `tx`
  parameter.

Boundaries:
- allowed edit scope: `packages/basic-nodes/src/lib/BaseMarkPlugins.ts`, its
  focused specs/type tests, and only the smallest shared Input Rules/Core type
  owner proven necessary
- package/API surfaces: preserve the public plugin and input-rule call shape;
  do not add an alternative API
- docs/browser surfaces: N/A unless a public call shape unexpectedly changes
- non-goals: no full Basic Nodes review, no broad Core sweep, no package sync,
  no unrelated cast cleanup
- out-of-scope package errors: record but do not repair

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Block only if TypeScript cannot contextually infer this finite variant factory
  without changing the accepted public input-rule API; name the exact owner and
  failed compile proof before stopping.

Current verdict:
- verdict: likely hard-cut cast; confirm whether local syntax or shared generic
  owns the inference loss
- confidence: 0.85 before live source/type proof
- next owner: plate-next
- keep / revert / quarantine call: keep only a source-backed inference repair
- reason: result casts on plugin authoring hide builder/generic regressions

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact cast, owning-inference repair, zero compensating annotations/casts, focused proof, and no unrelated migration are recorded. |
| `plate-next` skill/rule read | yes | Complete v50 generated skill read before source edits. |
| Active goal checked or created | yes | `get_goal` returned no active goal; this plan defines the new binary objective. |
| Mode classified as named packet vs broad Core sweep | yes | Named file/API packet; broad Core sweep and full package review are explicitly excluded. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Cast is presumptively cut; shared generic repaired only if live proof requires it. |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep is not requested. |
| Source of truth and allowed workspace recorded | yes | Current checkout under `/Users/zbeyens/git/plate-2`; exact allowed paths are in Boundaries. |
| Output budget strategy recorded | yes | Targeted reads/searches only; no generated trees or broad output. |
| Public API fork routing checked | yes | No new call shape is proposed; a discovered public fork would route to `best-api` before implementation. |
| Gap policy checked | yes | Local cast is forbidden; any true inference gap must be fixed at the smallest Input Rules/Core owner. |
| Related scoped sweep policy checked | yes | Sweep is limited to exact factory-result casts in Basic Nodes and the minimal generic caller graph. |
| Review-mode rename freeze checked | yes | No rename or topology change is proposed. |
| Package review checklist initialized when in scope | no | N/A: named-file mode, not full package review. |
| Doctrine registry validated for package review/sync | no | N/A: no package attestation or sync mode. |
| Sync queue materialized when sync mode is in scope | no | N/A: sync mode is not requested. |

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
- [x] Definition inference audit closed: `PluginConfig`, caller-supplied
      whole-plugin generics, `InferConfig`, and extracted `*Config` aliases are
      removed; real exported definitions use
      `DefinitionOf<typeof FooPlugin>` and the `FooDefinition` name.
- [x] Plugin capability boundary audit closed: every plugin contribution has
      exactly one canonical `initialState` / `store` / `selectors` / `api` /
      `read` / `update` / flat native field / `codecs` owner and obeys that
      owner's purity, snapshot, transaction, and editor-scope boundary.
- [x] Plugin authoring stage audit closed: independent contributions are in the
      constructor; every `.extend()` names an imported/prebuilt adaptation,
      constructor-inaccessible shared factory, or earlier capability type; no
      `.configure()` call widens the descriptor.
- [x] Dependency type boundary audit closed: root references are shallow and
      non-generic; internal carriers/HKTs stay internal and finite; static
      portals prove name+capability equivalence; runtime portals prove exact
      descriptor identity.
- [x] Core lowering / React bridge audit closed: author-source normalization
      aliases are internal, and every low-level React composition call is the
      exact `react({ dom })` object form with no extra erasure.
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
| Named verification threshold | yes | Run the proof commands named in this plan | 13/13 Turbo tasks, both declaration builds, 54/54 focused tests, and both zero-match declaration audits passed. |
| Broad Core drift ledger coverage | no | N/A for a named API packet | No broad Core sweep was requested or performed. |
| Score gate | yes | Own and resolve every scoped drift row | All scoped drift scores `>=4` were fixed at the Basic Nodes or Core owner. |
| Best Plate v2 recommendation | yes | Record the accepted inferred factory shape | The recommendation table records cast-free exports and a portable exact factory return boundary. |
| Plite/Plate gap ledger | yes | Record the resolved owner gap | The only gap was Core declaration portability; no Plite capability was missing. |
| Related scoped sweep after correction | yes | Run the same-class Basic Nodes sweep | Eleven casts found, eleven removed, zero deferred, zero remaining. |
| Package file checklist | no | N/A for named-file mode | No full Basic Nodes package review or attestation was claimed. |
| Package doctrine attestation | no | N/A for named-file mode | Doctrine v50 already forbids compensating export casts; no rule changed. |
| All-package sync closure | no | N/A because sync-all is not the mode | No package sync was requested. |
| Helper topology / lexical tx ownership | no | N/A for this type-only factory boundary | No helper topology or transaction-parameter function changed. |
| Package/API proof | yes | Run focused typecheck, tests, and declaration builds | All named proof commands passed; evidence is recorded below. |
| Shared Core gate coverage | no | N/A because this is not Core-adjacent package review | The packet directly verified Core and Basic Nodes without changing `check-core.mjs` scope. |
| Non-Core package error triage | yes | Classify any unrelated failures | No proof command reported an unrelated package failure. |
| Source audit | yes | Audit the removed cast class and private declaration carrier | Both exact `rg`/zero-match checks passed. |
| Rename ledger | no | N/A because no rename was postponed or introduced | Existing file and public API names were preserved. |
| Extracted-file inventory | yes | Classify all three new in-scope files | One type contract and two goal/review artifacts are justified below; all are absent from `origin/main`. |
| Autoreview / review | yes | Run scoped Codex autoreview | Final narrowed review exited zero with no accepted/actionable findings, confidence 0.82. |
| Final lint/check | yes | Run package lint and plan checker | Core and Basic Nodes lint passed; final plan checker is the last closure command. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; no user-attention item remains. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-03-repair-basemarkplugins-inference-cast.md` | Run after this final evidence update. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `BaseMarkPlugins.ts` rule exports | 5 | cut casts | Basic Nodes | Eight compensating result casts removed; source typecheck, build, and tests pass. | complete |
| `BaseHeadingPlugins.ts` rule export | 5 | cut cast | Basic Nodes | One compensating result cast removed; source typecheck, build, and tests pass. | complete |
| `BaseBlockPlugins.ts` rule exports | 5 | cut casts | Basic Nodes | Two compensating result casts removed; source typecheck, build, and tests pass. | complete |
| `createRuleFactory` overload boundary | 5 | fix owner generic | Core Input Rules | Exact result family, explicit-only options, and portable unbound editor context compile. | complete |
| `InputRuleFactory` public type | 4 | keep five-parameter compatible extension | Core Input Rules | First four generics are preserved; fifth result is constrained to `InputRule`. | complete |
| `input-rule-factory-contracts.ts` | 0 | keep proof | Core type contracts | Covers optional defaults, required options, leaked config fields, and exact mark-rule result. | complete |
| input-rule changeset paragraph | 0 | keep release contract | Core release prose | Describes exact editor/rule family, explicit options, and portable declarations relative to main. | complete |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Feature-owned input-rule exports | Inline `createRuleFactory(...)` inference with no result cast; Core publishes an exact portable return type. | Per-export `as InputRuleFactory`, explicit callback parameter types, fake local editor shapes, or widening every rule to the `InputRule` union. | The builder owns inference and declaration portability; packages should only declare real required/default options. | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plate gap, resolved | Core's default `BaseEditor` alias emitted a private installed-plugin carrier from unbound factory declarations. | Package casts hid TS2883 and erased exact rule-family information. | Core Input Rules | Core and Basic Nodes declaration builds plus emitted `.d.ts` audit. | Add public `InputRuleEditor` declaration carrier and exact result generic; no Plite change. |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| `BaseMarkPlugins` cast removal | Basic Nodes source | `rg -n "as \\{ markdown: InputRuleFactory|type InputRuleFactory" packages/basic-nodes/src --glob '*.{ts,tsx}'` | 11 before | 11 | 0 | zero matches after repair |
| private editor declaration leak | Basic Nodes emitted declarations | `rg -n "InternalBaseEditorWithInstalledPlugins" packages/basic-nodes/dist --glob '*.d.ts' --glob '*.d.mts' --glob '*.d.cts'` | 11 TS2883 failures before owner fix | 11 declarations repaired by one Core owner change | 0 | zero matches after rebuild |

Core drift ledger:
- Applies: no; named API packet only
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: 0 by scope classification
- Extra row count: 0 by scope classification
- Score gate: N/A beyond the two reviewed Core owner files in the review matrix
- Top drift rows: `createRuleFactory.ts` (5, fixed), `types.ts` (4, fixed)

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | broad ledger not applicable | named packet | Two touched Core owners are covered by the review matrix. | none |

Package file checklist:
- Applies: no; named-file mode
- Package: `@platejs/basic-nodes`
- Manifest command: N/A
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: N/A
- Actual row count: three explicitly reviewed package owner files
- Checked score-100 count: three named files in the review matrix
- Unchecked/deferred count: 0 inside the named packet
- Missing row count: 0 inside the named packet
- Extra row count: 0 inside the named packet
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A; no package-review queue was opened

Package file rows:
- [x] N/A — named-file mode is closed by the three Basic Nodes review-matrix rows; no full-package score claim is made.

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| N/A | v50 doctrine read | v50 | named-file mode | none | no | focused packet proof | N/A | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Basic Nodes rule export inference | Core Input Rules | Package casts hide a shared declaration-inference defect. | Three Basic Nodes rule owners, two Core factory/type owners, one compile-only contract. | Remove all casts and repair Core's portable exact return boundary. | complete |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/type-tests/input-rule-factory-contracts.ts` | justify-new-proof-tooling | absent from `origin/main`; Core `type-tests/` is the existing owner | keep | `pnpm --filter @platejs/core typecheck` compiles its positive and negative contracts. |
| `docs/plans/2026-08-03-repair-basemarkplugins-inference-cast.md` | justify-new-proof-tooling | absent from `origin/main`; required autogoal ledger | keep | final plan checker |
| `docs/plans/artifacts/repair-basemarkplugins-inference-cast/review-dataset.md` | justify-new-proof-tooling | absent from `origin/main`; scoped autoreview evidence | keep | narrowed Codex autoreview exited zero |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | no unrelated package failure appeared | N/A | none |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| none | exact cast-class search was clean outside the 11 repaired Basic Nodes rows | N/A | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Removed 11 Basic Nodes rule-result casts; repaired Core factory option/result inference and portable unbound declaration context. Runtime implementation is unchanged. |
| tests/proof | Added Core compile-only input-rule factory contracts; ran typecheck, declaration builds, focused tests, source/declaration audits, lint, barrels, and autoreview. |
| docs/templates/skills | Updated the existing Core changeset paragraph and added this goal plus scoped review evidence. No skill doctrine changed. |
| reverted/quarantined packets | Rejected local casts, callback annotations, fake structural editor aliases, and broad result widening. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | no remaining scoped issue | all acceptance gates pass | review matrix | none |

Findings:
- The `BaseMarkPlugins` cast was migration drift, not a legitimate public boundary.
- The same drift class covered 11 exports across mark, heading, and block rules.
- Source typecheck passed without casts, but declaration build failed with TS2883 because unbound factory returns expanded `BaseEditor` into Core's private installed-plugin carrier.
- A public `InputRuleEditor` interface is the smallest declaration boundary that keeps author callbacks typed without leaking the private carrier.
- `NoInfer<TDefaults>` is required so rule-definition fields such as `type`, `start`, and `trigger` do not become consumer options.

Decisions and tradeoffs:
- Preserve the first four `InputRuleFactory` generics and add a constrained exact result as the fifth, avoiding a needless public reorder.
- Keep plugin-bound factories on their exact plugin editor type; use `InputRuleEditor` only for unbound exported factories.
- Do not change runtime behavior or introduce another factory API.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Cast-free package declaration build produced TS2883 private-name failures. | 1 | Move from package annotations to the shared Core declaration boundary. | Resolved with `InputRuleEditor` and exact public overload results. |
| Direct `BaseEditor`, conditional factory aliases, and brand-shaped carriers still emitted the private type or widened results. | 3 | Use one public external-boundary interface and preserve exact result as a generic. | Resolved; both declaration builds pass. |
| Initial Basic Nodes rebuild still showed leaked definition fields because Core dist preceded the `NoInfer` change. | 1 | Rebuild Core before the dependent package. | Resolved; emitted options contain only declared fields plus `enabled`/`priority`. |
| Full local autoreview bundle exceeded the 1,048,576-character engine limit. | 1 | Freeze a repo-relative scoped dataset and review against an empty `HEAD` branch bundle. | Resolved; 7,440-character Codex review completed cleanly. |

Verification evidence:
- Fresh final source-first proof: `pnpm turbo typecheck --filter=./packages/core --filter=./packages/basic-nodes` — 13/13 tasks passed.
- Declaration portability: `pnpm --filter @platejs/core build && pnpm --filter @platejs/basic-nodes build` — both passed.
- Focused behavior/type proof: `bun test packages/core/src/lib/plugins/input-rules/createRuleFactory.spec.ts packages/core/src/lib/plugin/defineBasePlugin.typed.spec.ts packages/basic-nodes/src/lib/BaseMarkPlugins.spec.ts packages/basic-nodes/src/lib/BaseHeadingPlugins.spec.ts packages/basic-nodes/src/lib/BaseBlockPlugins.spec.ts` — 54/54 passed.
- Cast audit: `rg -n "as \\{ markdown: InputRuleFactory|type InputRuleFactory" packages/basic-nodes/src --glob '*.{ts,tsx}'` — zero matches.
- Declaration leak audit: `rg -n "InternalBaseEditorWithInstalledPlugins" packages/basic-nodes/dist --glob '*.d.ts' --glob '*.d.mts' --glob '*.d.cts'` — zero matches.
- Formatting/lint: Core checked 315 files and fixed the two current-run files; Basic Nodes checked 18 files; final rerun reported no Core fixes.
- Barrels: `pnpm brl` — 56/56 package tasks passed.
- Review: `.agents/skills/autoreview/scripts/autoreview --mode branch --base HEAD --dataset docs/plans/artifacts/repair-basemarkplugins-inference-cast/review-dataset.md ...` — clean, no accepted/actionable findings, correctness 0.82.
- Browser proof: N/A; this packet changes TypeScript declaration inference only and has no runtime/UI behavior.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Diagnose cast | completed | Source audit found 11 compensating casts. |
| Repair owner | completed | Core factory/type declaration boundary fixed. |
| Prove package output | completed | Typecheck, declaration builds, 54 tests, and zero-match audits passed. |
| Review and close | completed | Scoped Codex autoreview clean; final plan check follows. |

Final handoff contract:
- target surface and mode: named Basic Nodes input-rule export/API packet.
- files/APIs reviewed: three Basic Nodes rule owners, Core `createRuleFactory`/types, one Core type contract, and matching release prose.
- broad Core drift score coverage: N/A; no broad sweep claimed.
- package file checklist coverage: N/A; three named package files reviewed, no full-package claim.
- doctrine start/final version and source-fingerprint state: v50 to v50; no doctrine change or package fingerprint attestation.
- version registry evidence and remaining stale/drifted count: N/A for named-file mode.
- best Plate v2 recommendation: cast-free inline factory inference with one exact portable Core declaration boundary.
- verdict matrix summary: five high-drift code/API rows fixed; proof and release rows kept.
- Plite/Plate gaps or blockers: resolved Core declaration-portability gap; no remaining blocker or Plite gap.
- related scoped sweep query/active scope/matches/patched/deferred: Basic Nodes exact cast class, 11/11/0; emitted private carrier, 11 repaired/0 deferred.
- out-of-scope matches discovered: none.
- changes made: removed casts, repaired factory generics/declaration carrier, added compile-only contract, updated existing changeset.
- tests/proof commands: listed in Verification evidence; all pass.
- old compatibility names audited: exact `InputRuleFactory` cast pattern is absent from Basic Nodes source.
- needs attention: none.
- next best Plate Next packet: return to the user's selected package lane; this packet does not invent the next target.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure after green proof and clean scoped review. |
| Where am I going? | Run the plan checker, complete the goal, and hand off. |
| What is the goal? | Remove Basic Nodes input-rule result casts by fixing the true Core inference/declaration owner. |
| What have I learned? | The casts hid TS2883 and option leakage, not a legitimate package boundary. |
| What have I done? | Removed 11 casts, fixed Core, added type contracts, and passed all named gates. |

Timeline:
- 2026-08-03T21:57:01.758Z Goal plan created.
- 2026-08-03T22:05:00Z Cast-free source proof passed; declaration build exposed TS2883.
- 2026-08-03T22:09:00Z Core portable exact factory boundary and contracts passed.
- 2026-08-03T22:12:40Z Scoped Codex autoreview completed cleanly.

Open risks:
- None in the scoped packet. `InputRuleEditor` is intentionally public only as an external declaration carrier; plugin-bound factories still preserve their exact editor context.
