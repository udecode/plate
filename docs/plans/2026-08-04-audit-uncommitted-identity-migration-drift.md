# audit uncommitted identity migration drift

Objective:
Audit every uncommitted file for stale identity hard-cut drift; done when the
complete baseline diff manifest is classified and every accepted finding is
listed without changing product source.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-04-audit-uncommitted-identity-migration-drift.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user request: "there is other such drift, audit all
  (uncommitted) to list them all"
- mode: broad current-tree read-only review
- target surface: every tracked modification and pre-existing untracked file
  at the audit baseline, excluding this audit's own plan/artifacts
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; scope is the complete uncommitted manifest across the
  checkout, not every unchanged Core file
- correction-triggered related scoped sweep: yes; inventory all stale legacy
  identity literals and name/type/key conflation in the frozen manifest
- package review mode: no
- package review target: N/A: cross-checkout diff audit
- package file checklist gate: N/A: one row per baseline uncommitted file
- doctrine version: 56
- package applied version / fingerprint state: N/A: no package attestation or
  source change
- sync mode / target: no
- sync queue row count: N/A
- completion threshold summary: 100% of the frozen baseline manifest has a
  classification; every accepted same-class drift has an exact file/line,
  identity role, owner, and required correction; no product source is changed

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
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: completion is manifest-count based
- improvement loop: classify candidates, validate against current schema and
  accepted migration contracts, then rescan the frozen manifest
- final score / loop closure: 100% manifest coverage and zero unclassified
  candidate matches

Completion threshold:
- Every tracked modification and pre-existing untracked file in the frozen
  baseline manifest has one audit row.
- Every snake_case or other legacy identity candidate introduced, retained, or
  touched by the uncommitted diff is classified as accepted drift, valid
  migration-only legacy input, valid external-format syntax, unrelated data,
  or false positive.
- Every accepted drift is listed for the user with exact source evidence and
  the smallest owning correction.
- No `packages/**`, `apps/**`, `content/**`, tooling, skill, or other product
  source is changed; only this goal plan and its audit artifact may be written.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-audit-uncommitted-identity-migration-drift.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: read-only diff/source scans; no runtime tests
  required for a listing-only audit
- package proof: N/A: no package source changes
- shared Core gate: N/A: no Core source changes
- source audits: frozen `git diff --name-status`, untracked inventory, diff
  literal extraction, accepted-plan/changeset comparison, and final candidate
  rescan
- related scoped sweep query / active scope / match count / patched count / deferred count:
  exact 23-identity literals plus schema/name/type/key and custom-MDX codec
  scans / frozen 626-file manifest / 186 candidate-bearing rows, 17 accepted
  drift rows / 0 patched / 17 deferred for implementation
- package file manifest / row count / checked count / deferred count: N/A:
  complete checkout diff manifest replaces package checklist
- version registry validation / starting status / final status: N/A: review-only
- package fingerprint command / result: N/A: review-only
- Plite/Plate gap ledger: record only if a clean classification lacks an owner
- broad Core drift ledger gate: N/A: not an all-Core review
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-audit-uncommitted-identity-migration-drift.md`

Constraints:
- Audit and list only. Do not fix product source in this task.
- Treat the later accepted hard cut as authoritative over older plans that
  intentionally preserved snake_case persisted identities.
- Distinguish plugin capability `name`, persisted element `type`, persisted
  property `key`, external format node `type`, and external MDX tag `name`.
- Legacy literals are valid only in explicit migration inputs/tests or a
  separately accepted external wire format; do not assume stability without
  current source-backed evidence.
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
- allowed edit scope: this goal plan and a bounded audit artifact under
  `docs/plans/artifacts/audit-uncommitted-identity-migration-drift/`
- package/API surfaces: read every file in the frozen uncommitted manifest;
  inspect unchanged owners only when needed to classify a changed line
- docs/browser surfaces: read-only; browser proof is N/A for a static audit
- non-goals: no fixes, formatting, tests, package attestation, skill repair,
  release work, or unrelated architecture review
- out-of-scope package errors: N/A: no compilation/test execution is required

Output budget strategy:
- Freeze tracked and untracked filenames into one artifact, count first, then
  inspect candidate-producing diffs in bounded batches.
- Extract only changed-line literals and descriptor/schema/codecs/migration
  context; exclude generated output, `node_modules`, caches, and build output.
- Store the complete per-file classification in TSV and stream only counts,
  candidate slices, and accepted findings.

Blocked condition:
- Stop only if the baseline diff cannot be enumerated or an accepted identity
  decision cannot be resolved from current source, plans, changesets, and tests.

Current verdict:
- verdict: accepted identity drift remains in 17 of 626 frozen baseline files
- confidence: high
- next owner: plate-next implementation packet
- keep / revert / quarantine call: hard-cut the stale aliases and make custom
  MDX element codecs resolve one schema-owned identity
- reason: current source, compiler contracts, codec runtime context, changesets,
  tests, and current docs disagree on the accepted camel-case identity law

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Freeze | complete | 626 baseline rows captured | Classify |
| Classify | complete | 626/626 rows classified; 17 accepted drift rows | Report |
| Report | complete | Exact owners, correction shape, fallout, and proof recorded | Implement in a separate packet |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Audit all uncommitted files, list every same-class drift, and do not fix source |
| `plate-next` skill/rule read | yes | Read complete generated skill for doctrine v56 |
| Active goal checked or created | yes | New matching goal created after `get_goal` returned null |
| Mode classified as named packet vs broad Core sweep | yes | Broad current-tree diff review; not an all-Core manifest |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Later accepted identity hard cut outranks compatibility preservation |
| Broad Core drift ledger initialized when in scope | no | N/A: audit covers changed files only |
| Source of truth and allowed workspace recorded | yes | Current checkout plus accepted plans, changesets, schemas, migrations, and tests; writes limited to audit artifacts |
| Output budget strategy recorded | yes | Count-first frozen manifest and TSV classifications |
| Public API fork routing checked | no | N/A: accepted identity target already exists; this task reports drift only |
| Gap policy checked | yes | Report a Plite/Plate gap only when no current owner can express the correction |
| Related scoped sweep policy checked | yes | Complete frozen uncommitted manifest is the active sweep scope |
| Review-mode rename freeze checked | yes | No established concept rename proposed; only accepted hard-cut drift classified |
| Package review checklist initialized when in scope | no | N/A: not package review mode |
| Doctrine registry validated for package review/sync | no | N/A: no package review or sync |
| Sync queue materialized when sync mode is in scope | no | N/A: not sync mode |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: broad current-tree diff audit; not broad Core, package,
      docs-only, or API-plan execution.
- [x] Freeze and count every baseline tracked modification and pre-existing
      untracked file, excluding this audit's own plan/artifacts.
- [x] Add one TSV classification row per frozen file and prove zero missing or
      extra rows.
- [x] Extract every changed-line candidate for legacy snake_case identities,
      raw identity literals, and `name`/`type`/`key` conflation.
- [x] Validate every candidate against its current descriptor schema,
      migration owner, codec contract, tests, changeset, and accepted plan.
- [x] List every accepted drift with exact source, role, owner, severity, and
      smallest required correction; classify every rejected candidate.
- [x] Rerun the candidate scan against the frozen manifest and prove no
      unclassified matches remain.
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
      focused proof and P2 autoreview; final plan closure runs only after package
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
| Named verification threshold | yes | Classify the complete frozen manifest | 626/626 rows; zero missing, extra, or unreviewed |
| Broad Core drift ledger coverage | no | N/A: not an all-Core review | Changed Core files remain in the ordinary manifest |
| Score gate | yes | Own every accepted row | 17 accepted rows grouped below; none closed as keep |
| Best Plate v2 recommendation | yes | Record one current identity law | Custom Plate MDX element tags follow resolved schema type; standard mdast/HTML names stay external |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No runtime capability gap; one Plate checker coverage gap |
| Related scoped sweep after correction | no | N/A: listing-only, no correction | Final read-only rescan recorded |
| Package file checklist | no | N/A: cross-checkout audit | Complete checkout manifest used instead |
| Package doctrine attestation | no | N/A: no package sync | Doctrine v56 was read |
| All-package sync closure | no | N/A: not sync mode | No version ledger mutation |
| Helper topology / lexical tx ownership | no | N/A: identity-only review | No topology verdicts mixed into this audit |
| Package/API proof | no | N/A: no product source changes | Static source and contract proof only |
| Shared Core gate coverage | no | N/A: no Core source changes | No gate mutation |
| Non-Core package error triage | yes | Classify checker failure | Existing extend-stage allowlist drift; unrelated to identity findings |
| Source audit | yes | Scan all current baseline content | 23 exact legacy hits, custom codec pass, name/type/key pass, old-API pass |
| Rename ledger | no | N/A: no postponed file rename | No rename proposed |
| Extracted-file inventory | yes | Include all baseline untracked files | 28 untracked rows classified in the 626-row manifest |
| P2 autoreview / review | no | N/A: no implementation diff | Read-only audit |
| Final lint/check | yes | Validate artifacts | manifest comparison and diff checks recorded below |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run check-complete | Pass recorded below |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| Media v54 migration sequence | 5 | cut | @platejs/media | migration recognizes only installed current types | migrate media_embed before caption handling and add combined proof |
| Custom Plate MDX element codecs | 4 | cut | feature packages | 10 codec declarations across 7 changed files use literal source/tag identities | use the resolved schema type symmetrically for decode source and encoded tag |
| Markdown source/type maps | 4 | cut | Core + @platejs/markdown | legacy aliases plus PluginName-derived StrictPlateType | delete legacy aliases and stop calling capability names document types |
| Current docs/examples/test labels | 3 | cut | docs/registry/package tests | current teaching still exposes column_group, subscript/superscript property labels, or slash_input | teach only the final identities |
| Standard mdast/HTML names | 0 | keep | format owners | image/img, link/a, sub/sup, list/table tags are external syntax | do not confuse them with Plate persisted identities |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Custom Plate MDX element codec | `from: type`, decode with the resolved schema type, encode `name: type` | snake-case aliases, default-name literals, dual decode aliases | one schema identity round-trips and respects editor schema overrides | none |
| Standard mdast or HTML syntax | fixed format-owned source/tag names | renaming `img`, `link`, `sub`, `sup`, table/list mdast nodes to Plate types | these identities belong to the external format | none |
| v54 media migration | rewrite legacy media type before caption migration in one versioned path | requiring users to discover and order two unrelated migration steps | old media_embed documents otherwise bypass the caption migrator | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plate tooling | identity checker does not inspect Markdown codec `from` and emitted MDX `name` | manual audits will regress again | tooling/scripts/check-plate-schema-adoption.mjs | positive and negative checker fixtures | defer to implementation packet |
| Runtime | none | N/A | existing codec schema context | configured-type roundtrip test | no Plite change needed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| media_embed report | frozen 626-file manifest | exact 23 legacy types plus custom codec AST inventory | 186 candidate-bearing rows; 17 accepted files | 0 | 17 | unchanged fallout listed below |
| name/type/key separation | frozen 626-file manifest | PLUGINS/name storage flows, old portal APIs, schema fallbacks | 51 direct conflation candidates plus bounded fallback/API matches | 0 | 0 accepted beyond rows already listed | checker lacks codec-tag coverage |

Core drift ledger:
- Applies: no; this is not an all-Core review.
- Manifest command: N/A.
- Expected / actual / missing / extra: N/A.
- Top drift row in changed Core content:
  `packages/core/src/lib/plugin/MarkdownNodeCodec.ts` retains the two legacy
  custom source aliases.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| packages/core/src/lib/plugin/MarkdownNodeCodec.ts | 4 | cut | Core Markdown codec contract | SourceNodeMap still includes column_group and media_embed | retain only current source identities |

Package file checklist:
- Applies: no; the 626-row checkout manifest replaces a package checklist.
- Package: N/A.
- Expected / actual / missing / extra: 626 / 626 / 0 / 0.
- Checked score-100 / deferred: N/A / 17 accepted drift rows.
- Next package blocked until: N/A.

Package file rows:
- [x] N/A: this was a cross-checkout read-only audit.

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| N/A | 56 doctrine | 56 | N/A | N/A | no | source audit | N/A | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Custom MDX identities | feature packages | custom tags bypass schema identity | callout, code-drawing, layout, date, toc, media | cut | one implementation packet |
| Markdown identity types | @platejs/markdown + Core | capability names are relabeled as Plate types | types.ts and MarkdownNodeCodec.ts | cut | remove aliases/conflation |
| Media migration | @platejs/media | legacy type bypasses caption migration | migration source/spec/changeset | repair | combined migration proof |
| Teaching cleanup | docs/registry/tests | current surfaces preserve old vocabulary | four accepted files | cut | update after runtime contract |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| 28 baseline untracked files | inventoried-current-WIP | baseline-only audit | no edit | every row exists in manifest.tsv |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| schema adoption checker | stale production extend-stage allowlists in callout, code-drawing, layout, math, and table | no identity diagnostic; audit is read-only | repair with the topology packet, not here |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| column_group | markdown.cn.mdx, AI prompt, columnSurface.spec.ts, www Markdown snapshot | files were unchanged at the frozen baseline | include as implementation fallout |
| media_embed | mediaSurface.spec.ts and www Markdown snapshot | files were unchanged at the frozen baseline | include as implementation fallout |
| historical old names | CHANGELOG files and explicit migration fixtures | provenance or migration input is valid | keep |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none |
| tests/proof | audit manifest only |
| docs/templates/skills | this goal plan only |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Media migration order | old media_embed skips caption migration | packages/media/src/migrations/MediaV54MigrationPlugin.ts | repair first |
| 2 | Ten custom MDX codecs | schema overrides do not own both directions | feature plugin owners | make source/tag symmetric |
| 3 | Markdown public type map | public name/type conflation plus legacy aliases | packages/markdown/src/lib/types.ts | cut or accurately rename the dead helper surface |
| 4 | Teaching fallout | old tags remain user-visible | docs/examples/tests | update after runtime law |

Findings:
- P0: `MediaV54MigrationPlugin` builds its recognized set from installed
  current schema types. A persisted `media_embed` node therefore bypasses the
  caption migration. Its focused test constructs only current types, while the
  media changeset tells users to install this plugin without ordering the
  separate AST identity rewrite.
- P1: Ten custom Plate-owned MDX element codecs across callout, code-drawing,
  layout, date, toc, and media do not use one resolved type in both directions.
  Layout and media embed retain the legacy snake-case tag; audio, file, and
  video encode the resolved type but decode only their default literal.
- P1: Core's Markdown source union still legitimizes `column_group` and
  `media_embed`.
- P1: Markdown's public `StrictPlateType` is derived from `PluginName`, then
  `plateToMdast` still maps `codeLine` to `code_line` and `columnGroup`
  to `column_group`. The helper has no internal caller, so it is stale public
  name/type machinery rather than a required runtime path.
- P2: The English Markdown guide, Markdown demo, chat fixture comments, and two
  suggestion test names retain current-facing legacy vocabulary.
- Rejected candidates: old values in migration fixtures and release prose,
  standard mdast/HTML/DOM names such as `image`, `img`, `link`, `sub`,
  `sup`, `ol`, `ul`, `li`, `tr`, `td`, and `th`, custom Plite
  fixture names, registry capability maps, and checker-negative fixtures.

Decisions and tradeoffs:
- A custom Plate MDX tag is part of the plugin's schema-backed document
  contract, so it follows resolved `schema.type`.
- A standard mdast or HTML tag belongs to that external format and stays fixed.
- No compatibility alias or dual decoder is recommended. The accepted hard cut
  plus migration owns old documents.
- The audit changes no product source.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| One combined multi-file diff exceeded the bounded output | 1 | split by owner | completed |
| TypeScript 7 package exposes no compiler API from require('typescript') | 1 | use the installed Babel parser | completed |
| First Babel child walk omitted nested nodes | 1 | fix array/object child enumeration | completed |
| Schema adoption checker exits on unrelated extend-stage allowlists | 1 | classify separately and keep identity scan source-backed | non-blocking |

Verification evidence:
- 2026-08-04 frozen baseline: 565 modified, 28 added, 5 deleted, and 28
  untracked files; 626 total.
- Fresh manifest comparison: 626 current rows, 626 manifest rows, 0 missing,
  0 extra, 0 status mismatches, 0 unreviewed.
- Exact legacy scan: 23 matches. Nineteen are accepted drift occurrences; four
  are a migration fixture/prose occurrence or a substring false positive.
- Candidate classification: 17 accepted files, 169 files with reviewed valid
  candidates, 434 files with no identity candidate, 5 deletions, and 1 binary.
- Custom Markdown codec AST inventory: 10 custom element codec declarations in
  7 changed feature files.
- Direct name/type/key conflation scan: 51 matches in 22 files; target maps,
  capability references, and checker-negative fixtures were rejected, while
  the separate Markdown `PluginName` type-level conflation was accepted.
- Old portal/API scan found no production `getPluginType`, `getType`,
  `plugin.type`, `schema.element.type`, `KEYS`, `NODES`, or
  `STYLE_KEYS` survivor.
- `node tooling/scripts/check-plate-schema-adoption.mjs` reports only the
  unrelated extend-stage allowlist drift recorded above; it reports no identity
  diagnostic.
- `git diff --no-index --check /dev/null <audit-artifact>` returned no
  whitespace diagnostics for either audit file; exit 1 is the expected
  no-index difference result.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-04-audit-uncommitted-identity-migration-drift.md` passes.
- No package tests or Browser run applies because no product source changed.

Final handoff contract:
- target surface and mode: every frozen uncommitted file; read-only identity
  hard-cut audit
- files/APIs reviewed: 626/626 baseline rows
- broad Core drift score coverage: N/A; one changed Core identity owner listed
- package file checklist coverage: N/A; complete checkout manifest substituted
- doctrine start/final version and source-fingerprint state: v56 / v56 / N/A
- version registry evidence and remaining stale/drifted count: N/A / 17 files
- best Plate v2 recommendation: one resolved schema type for both directions of
  custom Plate MDX codecs; fixed names only for external standards
- verdict matrix summary: 1 P0 group, 3 P1 groups, 1 P2 group
- Plite/Plate gaps or blockers: no runtime gap; checker coverage gap only
- related scoped sweep query/active scope/matches/patched/deferred: exact legacy,
  codec AST, name/type/key, fallback, and old-API scans / 626 files / 186
  candidate-bearing files / 0 / 17
- out-of-scope matches discovered: unchanged CN docs, AI prompt, Markdown specs,
  and www snapshot
- changes made: plan and manifest only
- tests/proof commands: manifest equality, bounded source scans, schema checker,
  and final plan/diff checks
- old compatibility names audited: all 23 accepted first-party legacy types plus
  old catalogs and portal APIs
- needs attention: media migration first, then codec symmetry, Markdown types,
  then teaching fallout
- next best Plate Next packet: implement these 17 rows plus the named unchanged
  fallout in one identity-codec closure packet

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Read-only audit complete |
| Where am I going? | User handoff with exact findings |
| What is the goal? | Classify every frozen uncommitted file and list all accepted identity drift |
| What have I learned? | The hard cut is incomplete mainly at custom Markdown codec and media migration owners |
| What have I done? | Classified 626/626 rows without changing product source |

Timeline:
- 2026-08-04T17:46:27.116Z Goal plan created.
- 2026-08-04 Frozen baseline captured and candidate scans completed.
- 2026-08-04 All 626 rows classified and accepted findings recorded.

Open risks:
- The implementation packet must include unchanged fallout or tests/docs will
  preserve the legacy tags.
- The custom-tag-equals-schema-type law should be added to the checker/doctrine
  during implementation to prevent recurrence.
