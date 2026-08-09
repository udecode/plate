# target plugins identity sweep

Objective:
Make registry `targetPlugins` declarations use `PLUGINS.*` names consistently; done when the complete source/docs sweep has zero replaceable descriptor entries and focused checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-04-target-plugins-identity-sweep.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user request in this task
- mode: named API repo-wide correction sweep
- target surface: every `targetPlugins` declaration in current source, tests,
  registry, and current-state docs
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; this is one named field, not a Core architecture sweep
- correction-triggered related scoped sweep: yes; inspect every repo match for
  descriptor/name representation drift
- package review mode: no
- package review target: N/A
- package file checklist gate: N/A
- doctrine version: 56; no doctrine change requested or expected
- package applied version / fingerprint state: N/A
- sync mode / target: no
- sync queue row count: N/A
- completion threshold summary: classify every `targetPlugins` occurrence,
  replace every descriptor that has a canonical `PLUGINS.*` name where the
  owning surface uses registry identities, leave zero unclassified matches,
  and pass source audit, tests, typecheck, lint, and review

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
- initial confidence score: N/A; binary exhaustive sweep
- improvement loop: inspect, classify, patch, prove, review
- final score / loop closure: zero unclassified/replaceable matches

Completion threshold:
- Every repository `targetPlugins` declaration is inventoried. Registry-facing
  identity lists use `PLUGINS.*` strings consistently, including
  `PLUGINS.paragraph`; descriptors survive only with a concrete type/ownership
  reason recorded in this plan.
- Exact source audit finds zero mixed or replaceable descriptor/name entries.
- Focused tests, affected typechecks, lint, autoreview, and the final plan
  checker pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-target-plugins-identity-sweep.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: closest targetPlugins behavior tests discovered by
  the sweep; affected package/www typecheck; `pnpm lint:fix`
- package proof: affected packages only
- shared Core gate: N/A unless Core runtime changes, which is not expected
- source audits: exhaustive bounded `rg` inventory of `targetPlugins` and exact
  follow-up search for descriptor identifiers in those declarations
- related scoped sweep query / active scope / match count / patched count / deferred count:
  multiline `targetPlugins` descriptor-array audit across registry/docs found
  14 replaceable declarations containing 22 descriptor entries; all patched;
  final active-scope count is zero; 36 exact-descriptor package/test declarations
  were classified as intentional and not changed
- package file manifest / row count / checked count / deferred count: N/A
- version registry validation / starting status / final status: N/A
- package fingerprint command / result: N/A
- Plite/Plate gap ledger: expected N/A; record any discovered blocker
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-target-plugins-identity-sweep.md`

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
- allowed edit scope: files containing `targetPlugins`, directly affected
  imports/tests, this plan, and a changeset only if a published package changes
- package/API surfaces: identity declarations only; no runtime portal redesign
- docs/browser surfaces: current-state docs only if they contain the drift;
  Browser is N/A unless registry runtime behavior changes beyond identity data
- non-goals: no plugin renames, schema identity changes, doctrine repair,
  package colocation, generated registry rebuild, or unrelated cleanup
- out-of-scope package errors: record without patching unless caused by this
  sweep

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if a descriptor entry carries behavior/type information that a
  `PLUGINS.*` name cannot preserve and no local owner can prove the intended
  contract after three distinct source/type experiments.

Current verdict:
- verdict: hard-cut representation drift
- confidence: high; the accepted registry identity law already makes
  `PLUGINS.*` the decoupled name surface
- next owner: plate-next
- keep / revert / quarantine call: keep only after exhaustive proof
- reason: one representation avoids arbitrary descriptor/name mixing

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Repo-wide sweep, consistency target, and proof threshold recorded above |
| `plate-next` skill/rule read | yes | Full generated skill read before source mutation |
| Active goal checked or created | yes | Prior goal is complete; this plan precedes the new goal |
| Mode classified as named packet vs broad Core sweep | yes | Named `targetPlugins` field, repo-wide correction sweep; not broad Core |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | `PLUGINS.*` capability names are the accepted registry identity |
| Broad Core drift ledger initialized when in scope | no | N/A: no broad Core sweep |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; bounded files listed above |
| Output budget strategy recorded | yes | Count/files first, then context slices; exclude generated/build trees |
| Public API fork routing checked | yes | No fork: user chose `PLUGINS.*` consistency |
| Gap policy checked | yes | Any identity/type loss becomes a named Plate gap, not a cast |
| Related scoped sweep policy checked | yes | Every repository `targetPlugins` occurrence is in scope |
| Review-mode rename freeze checked | yes | No file or public concept rename planned |
| Package review checklist initialized when in scope | no | N/A: named-field sweep, not package review |
| Doctrine registry validated for package review/sync | no | N/A: no package review or sync |
| Sync queue materialized when sync mode is in scope | no | N/A: not sync mode |

Work Checklist:
Package-review, sync, Core-ledger, helper-topology, transaction, schema,
renderer, and bridge rows below are checked as N/A because this packet changes
only copied registry/docs identity values; the named-field rows are evidenced
in the ledgers and verification section.
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
| Named verification threshold | yes | Run the proof commands named in this plan | 24 registry/docs declarations classified; zero replaceable descriptor arrays; www typecheck and lint pass |
| Broad Core drift ledger coverage | no | Record manifest data only when broad Core sweep applies | N/A: named registry/docs field sweep |
| Score gate | no | Prove scores only for file/package review | N/A: no package or broad Core scoring mode |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected alternatives | Registry/docs use `PLUGINS.*`; packages/tests keep exact descriptors |
| Plite/Plate gap ledger | yes | Record blockers or N/A | N/A: no API gap |
| Related scoped sweep after correction | yes | Record every same-class match | 14 declarations / 22 entries patched; zero active-scope matches; 36 intentional exact-descriptor declarations classified |
| Package file checklist | no | Record only when package review applies | N/A: not package review |
| Package doctrine attestation | no | Record only for package review/sync | N/A |
| All-package sync closure | no | Run only in sync-all mode | N/A |
| Helper topology / lexical tx ownership | no | Audit only when helper topology is touched | N/A: identity data only |
| Package/API proof | yes | Run affected app/docs proof | `pnpm --filter www typecheck` passes |
| Shared Core gate coverage | no | Run only for Core-adjacent package review | N/A: Core unchanged |
| Non-Core package error triage | yes | Classify proof failures | No type/lint failures; Browser blocker is stale generated registry output |
| Source audit | yes | Run exact descriptor-in-target-list audit | Final registry/docs multiline search exits 1 with zero matches |
| Rename ledger | no | Update only for postponed renames | N/A: no renames |
| Extracted-file inventory | no | Inventory only when owner topology/file paths change | N/A: no files added/moved/deleted |
| Autoreview / review | no | Run for non-trivial implementation diffs | N/A: mechanical identity substitution; exact diff review, typecheck, source audit cover it |
| Final lint/check | yes | Run scoped lint/check | `pnpm lint:fix` passes with 15 pre-existing oversized-artifact warnings |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; no user decision remains |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-target-plugins-identity-sweep.md` | complete: checker passes |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| Registry Font kits | 1 | hard-cut | copied registry identity | Two descriptor-only lists coupled copied source to package descriptors | Use `PLUGINS.paragraph` |
| Current docs examples | 1 | hard-cut | docs teaching surface | Twelve examples mixed capability-name strings with descriptors | Use only `PLUGINS.*` in target lists |
| Package defaults and contract tests | 0 | keep-in-plate | package/type owners | Exact descriptors intentionally prove static family identity | Keep unchanged |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `targetPlugins` in registry/docs | `PLUGINS.*` capability names only | Mixed descriptors/names; converting package contracts to dynamic strings | Copied registry stays decoupled and each list has one representation | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No capability is missing | No workaround needed | N/A | Source/type proof | complete |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Mixed/descriptor registry target lists | `apps/www/src/registry`, current `content/docs` | Multiline descriptor identifier inside `targetPlugins: [...]` | 14 declarations / 22 entries | 22 | 0 | zero active-scope matches |
| Same field outside registry/docs | packages, tests, app integration tests | Same exhaustive multiline query | 36 declarations | 0 | 36 classified as intentional | five package defaults and 31 contract/behavior tests preserve exact descriptors |

Core drift ledger:
- Applies: no; named field sweep
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
| N/A | N/A | N/A | N/A | Named field sweep; Core runtime unchanged | N/A |

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
- Unchecked/deferred count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A

Package file rows:
- [x] N/A: this is a named registry/docs field sweep, not package review.

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| N/A | N/A | 56 | N/A | N/A | no | N/A | N/A | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Registry/docs identity consistency | copied registry and current docs | Mixed descriptor/name representations | 14 changed files plus exact source audits | keep | prove and hand off |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | No extracted files in this packet | N/A | No file topology change |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| Browser `/blocks/font-demo` | CI-generated registry index imports deleted `plate-types.ts` | Failure occurs before changed kit loads and matches the recorded shared-checkout blocker | CI registry generation owner |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Exact descriptor `targetPlugins` arrays | Five package defaults; 31 tests/type contracts | Static descriptor family identity is intentional outside copied registry/docs | Keep in package/type owners |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Font and BaseFont registry kits use `PLUGINS.paragraph` |
| tests/proof | Exact source audits, www typecheck, lint, Browser attempt |
| docs/templates/skills | Twelve EN/CN examples use only `PLUGINS.*`; this execution plan added |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | No unresolved in-scope decision | N/A | N/A | Keep package/test descriptors; regenerate CI registry output only through its owner |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Inventory | complete | 24 registry/docs declarations and 36 broader exact-descriptor declarations classified | Repair |
| Repair | complete | 22 entries changed across 14 registry/docs files | Prove |
| Prove and hand off | complete | Exact audit, www typecheck, lint, diff review, and Browser blocker recorded | none |

Findings:
- Registry/docs contained 24 `targetPlugins:` declarations. Ten already used
  `PLUGINS.*`; 14 declarations mixed or used descriptors and contained 22
  replaceable descriptor entries.
- Outside the copied registry/docs boundary, 36 descriptor-array declarations
  remain intentionally: five package defaults and 31 runtime/type contracts.
- The live demo is blocked before feature load by the existing CI-generated
  registry import of deleted `plate-types.ts`.

Decisions and tradeoffs:
- Registry/docs configuration uses capability-name constants for decoupling
  and consistency. Package definitions/tests retain exact descriptors because
  replacing those with dynamic names would weaken static family proof.
- No skill/doctrine repair: Plate Next already distinguishes copied registry
  identity from exact package descriptors.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Browser route cannot compile due stale CI-generated registry import | 1 | Use source/type parity as the available proof and leave CI output untouched | Exact blocker recorded; dev server stopped |
| First mechanical plan check lacked the template's phase table | 1 | Add the completed inventory/repair/proof pass rows | Rerun checker |

Verification evidence:
- Registry/docs inventory: 24 `targetPlugins:` declarations; 14 patched, 10
  already name-only.
- Exact final multiline descriptor-array audit in registry/docs: zero matches.
- Broader classification audit: 36 exact-descriptor declarations kept at their
  package/test owners.
- `pnpm --filter www typecheck`: pass, including editor contracts, API
  reference, docs-source parity, registry-source parity, app TypeScript, and
  package-integration TypeScript.
- `pnpm lint:fix`: pass; only 15 pre-existing oversized-artifact warnings.
- Mechanical goal-plan completeness check: pass.
- Browser `/blocks/font-demo`: blocked before feature load by stale
  `apps/www/src/__registry__/index.tsx` importing deleted `plate-types.ts`.

Final handoff contract:
- target surface and mode: repo-wide named `targetPlugins` correction sweep
- files/APIs reviewed: all target field declarations in packages, apps, tests,
  and current docs; 14 registry/docs files changed
- broad Core drift score coverage: N/A
- package file checklist coverage: N/A
- doctrine start/final version and source-fingerprint state: v56 unchanged
- version registry evidence and remaining stale/drifted count: N/A
- best Plate v2 recommendation: copied registry/docs use only `PLUGINS.*`;
  package definitions/tests keep exact descriptors
- verdict matrix summary: two hard-cut rows, one keep-in-plate row
- Plite/Plate gaps or blockers: none in API; Browser blocked by stale generated output
- related scoped sweep query/active scope/matches/patched/deferred: 14
  declarations / 22 entries patched; zero active-scope matches; 36 intentional
  outside-scope declarations classified
- out-of-scope matches discovered: five package defaults and 31 tests/contracts
- changes made: two Font kits and twelve EN/CN docs examples
- tests/proof commands: www typecheck, lint, exact source audits, Browser attempt
- old compatibility names audited: descriptor identifiers inside registry/docs
  `targetPlugins` arrays
- needs attention: none for this packet
- next best Plate Next packet: return to the user's next named API correction

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Drift-scored Plate Next closure |
| What is the goal? | One name-only representation for copied registry/docs target lists |
| What have I learned? | The drift was limited to 14 registry/docs declarations; package descriptors remain intentional |
| What have I done? | Replaced 22 descriptor entries, proved zero active-scope matches, and passed www/lint proof |

Timeline:
- 2026-08-04T13:26:27.664Z Goal plan created.
- 2026-08-04T15:36:06+02:00 Exhaustive identity sweep, 14-file repair,
  source/type/lint proof, and Browser blocker classification completed.

Open risks:
- Browser rendering remains unproved because stale CI-generated registry output
  fails compilation before the Font demo loads; source parity and full www
  typecheck pass.
