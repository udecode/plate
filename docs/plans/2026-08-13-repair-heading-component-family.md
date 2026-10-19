# repair heading component family

Objective:
Repair live and static heading component-family reuse; done when H1-H6 wrappers delegate to one descriptor-exact shared renderer and focused proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-13-repair-heading-component-family.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- browser

Plate Next source:
- prompt / link: user asked to fix `apps/www/src/registry/ui/heading-node.tsx` so it reuses `HeadingElement`.
- mode: named file/API packet
- target surface: `apps/www/src/registry/ui/heading-node.tsx` and the same-family static peer `heading-node-static.tsx`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, both heading family owners
- package review mode: no
- package review target: N/A: registry UI named-file packet
- package file checklist gate: N/A: not package review mode
- doctrine version: 70
- package applied version / fingerprint state: N/A: not package review or sync mode
- sync mode / target: no
- sync queue row count: N/A: not sync mode
- completion threshold summary: six live and six static wrappers delegate; each exported wrapper keeps its exact plugin-derived prop type; markup and ElementId behavior stay unchanged; focused type/lint/browser proof is recorded.

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
- semantics: N/A: no timed request
- initial confidence score: N/A: auditable binary threshold
- improvement loop: one implementation and focused proof pass
- final score / loop closure: N/A: binary completion threshold

Completion threshold:
- `H1Element` through `H6Element` delegate to `HeadingElement`; static peers delegate to `HeadingElementStatic`; exact descriptor-derived props compile; visible markup, variants, and persisted-id anchors are preserved; focused source audit, lint/type proof, and browser evidence are recorded.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-repair-heading-component-family.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: scoped TypeScript and Biome checks for both files
- package proof: `pnpm exec tsc --project packages/core/tsconfig.json --noEmit --pretty false` passes
- shared Core gate: Core source typecheck passes; full package typecheck was attempted and is blocked by two unrelated existing `compilePlateModel.spec.ts` missing-`toggle` errors
- source audits: exact wrapper delegation and duplicate-renderer search in both heading files
- related scoped sweep query / active scope / match count / patched count / deferred count:
  `rg -n "return <HeadingElement|return <HeadingElementStatic|<PlateElement|<PliteElement|ElementIdPlugin"` over both heading owners -> 16 matches, 4 owner files patched, 0 deferred
- package file manifest / row count / checked count / deferred count: N/A: not package review
- version registry validation / starting status / final status: N/A: not package review or sync
- package fingerprint command / result: N/A: not package review or sync
- Plite/Plate gap ledger: resolved Plate typing gap: renderer primitives carried invariant plugin context they did not consume
- broad Core drift ledger gate: N/A: named registry packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-repair-heading-component-family.md`

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
- allowed edit scope: two heading registry UI files, the two owning Core renderer primitive files, required package changeset/registry changelog artifacts, focused Core type proof, and this plan
- package/API surfaces: `packages/core` renderer primitive input typing may change only enough to accept exact presentation-family unions; no runtime behavior or exported symbol changes
- docs/browser surfaces: affected registry demo route only for proof
- non-goals: no plugin/schema/API redesign, no unrelated registry cleanup, no skill edits
- out-of-scope package errors: record but do not patch unless caused by this packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- stop only if exact descriptor generics cannot express one renderer without casts, or the app route is unavailable after one bounded verification attempt; report the owning typing/runtime blocker.

Current verdict:
- verdict: main-parity-cleanup
- confidence: 98 after focused proof; browser route caveat remains external
- next owner: plate-next
- keep / revert / quarantine call: keep if exact types and behavior proof pass
- reason: current duplication came from incorrectly narrowing the shared renderer to H1; one generic family owner restores owner truth without an API change.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact named-file fix, family peer scope, no timing, focused proof, and handoff are recorded above. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md`, doctrine v70. |
| Active goal checked or created | yes | `get_goal` returned no active goal; this plan is the goal shell. |
| Mode classified as named packet vs broad Core sweep | yes | Named registry UI packet; broad Core sweep is explicitly N/A. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | `main-parity-cleanup`: one component family owner with exact descriptor props. |
| Broad Core drift ledger initialized when in scope | no | N/A: no Core sweep. |
| Source of truth and allowed workspace recorded | yes | Current checkout plus `origin/main` ownership evidence; only the two heading owners may change. |
| Output budget strategy recorded | yes | Targeted reads/searches with capped output; no broad repo dumps. |
| Public API fork routing checked | no | N/A: no public API change. |
| Gap policy checked | yes | Any failed generic inference is a Core typing gap; no cast workaround allowed. |
| Related scoped sweep policy checked | yes | Sweep both live and static family owners after the correction. |
| Review-mode rename freeze checked | no | N/A: no rename. |
| Package review checklist initialized when in scope | no | N/A: not package review. |
| Doctrine registry validated for package review/sync | no | N/A: not package review or sync. |
| Sync queue materialized when sync mode is in scope | no | N/A: not sync mode. |
| Browser pack selected | yes | Registry app source is touched; browser proof applies. |
| Browser route / app surface identified | yes | Find the smallest demo importing `heading-node` before starting proof. |
| Browser tool decision recorded | yes | Use Browser for ordinary registry UI proof; no native Chrome/OS surface. |
| Console/network caveat policy recorded | yes | Record existing unrelated errors separately; do not claim a clean console if blocked. |

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
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Focused app and Core TypeScript pass; 6/6 runtime tests pass; Biome passes. |
| Broad Core drift ledger coverage | no | N/A: named packet, not broad Core sweep | N/A: no broad ledger. |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Four reviewed owners are resolved below; no score >=4. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | One presentation-family renderer per live/static owner; exact descriptor props at exports; primitive input types match runtime consumption. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | Plate renderer typing gap fixed at Core owner. |
| Related scoped sweep after correction | yes | For each correction, run and record same-class search/review results inside the active scope | 16 matches reviewed, 4 owner files patched, 0 deferred. |
| Package file checklist | no | N/A: not package review | N/A. |
| Package doctrine attestation | no | N/A: not package review or sync | N/A. |
| All-package sync closure | no | N/A: not sync-all | N/A. |
| Helper topology / lexical tx ownership | no | N/A: no plugin helper/tx surface touched | N/A. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Core source TypeScript and focused app TypeScript pass. |
| Shared Core gate coverage | yes | Run the smallest Core owner proof | Core source TypeScript passes; full Core package typecheck blocker is unrelated and recorded. |
| Non-Core package error triage | yes | Classify unrelated proof failures | www full typecheck failures in list/suggestion/table/source are unrelated; no heading errors remain. |
| Source audit | yes | Run exact ownership/delegation audit | One live primitive, one static primitive/ElementId lookup, and six delegating wrappers each. |
| Rename ledger | no | N/A: no rename | N/A. |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | Exact inventory returned 3 intentional release artifacts and 0 extracted production/spec/config files. |
| P2 autoreview / review | no | Record why automated review cannot safely isolate this packet | Helper failed closed on unrelated oversized untracked `editor.schema.json`; manual scoped diff review found no actionable issue. |
| Final lint/check | yes | Run scoped lint/check | Biome checked all four source files with no remaining fixes. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-repair-heading-component-family.md` | Passed after final evidence update. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or record blocker | `/blocks/single-block-demo` attempted; route returned 500 before rendering because generated `plate-types.ts` is missing. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Console captured the same missing-module build error; no heading runtime loaded. |
| Browser final proof artifact | no | Record exact caveat | N/A: a browser screenshot of the unrelated compile overlay would not prove headings; focused runtime tests provide the behavioral proof. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `heading-node.tsx` | 2 | main-parity-cleanup | live heading component family | `origin/main` delegated; focused exact-prop TypeScript passes | keep shared renderer plus exact wrappers |
| `heading-node-static.tsx` | 2 | main-parity-cleanup | static heading component family | one ElementId lookup and focused exact-prop TypeScript pass | keep shared renderer plus exact wrappers |
| `plate-nodes.tsx` renderer input | 2 | keep-in-plate | Core React primitive | source typecheck and 5 runtime tests pass | keep context-minimal input plus exact-first overload |
| `plite-nodes.tsx` renderer input | 2 | keep-in-plate | Core static primitive | source typecheck and focused static consumer compile pass | keep context-minimal input plus exact-first overload |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Heading component family | Descriptor-owned prop union in one presentation renderer; exact descriptor props at every H1-H6 export | H1 widening, casts, six duplicated bodies, or a local fake context | Preserves AX and inference while matching runtime ownership | no |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plate gap (resolved) | Primitive renderer props carried the full invariant plugin portal despite not consuming it | A heading-local cast/type mirror would hide the same family failure elsewhere | `packages/core/src/{react,static}/components/*-nodes.tsx` | Core source typecheck plus exact family consumer compile | fixed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Shared heading renderers restored | two heading owners plus two Core primitive owners | delegation/primitive/ElementId `rg` query | 16 | 4 owner files | 0 | browser route remains blocked by unrelated missing generated file |

Core drift ledger:
- Applies: no, named Core owner packet only
- Manifest command: N/A: no broad Core sweep
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
| N/A | 0 | N/A: no broad Core sweep | N/A | N/A | N/A |

Package file checklist:
- Applies: no
- Package: N/A: named registry/Core packet
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
- [x] N/A: package review mode does not apply.

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| N/A | N/A | 70 | N/A | N/A | no | N/A | N/A | N/A: not package review/sync |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Heading family reuse | registry heading families + Core renderer inputs | exact descriptor unions could not forward through primitives | four source owners and focused proof | keep | close plan |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `.changeset/fix-heading-family-renderer-types.md` | N/A: required release artifact | no origin/main owner expected | keep Core patch changeset | changeset contract |
| `apps/www/src/registry/changelog/{entries/2026-08-13-fix-heading-renderer-types.mdx,2026-08-13-fix-heading-renderer-types.json}` | N/A: required registry release artifacts | no origin/main owner expected | keep source plus generated event | changelog `--check` passes |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `pnpm turbo typecheck --filter=./packages/core` | two missing `toggle` properties in `compilePlateModel.spec.ts` | outside four-file packet; Core source itself passes | existing Core test owner |
| www full TypeScript/browser route | missing `plate-types.ts` plus list/suggestion/table WIP errors | no heading errors; focused heading project passes | existing shared WIP owners |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| N/A | none in the named family/primitive class | scoped sweep found no outside-scope same-class owner | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | live/static H1-H6 wrappers delegate; Core primitive inputs no longer require unused invariant context |
| tests/proof | existing heading and Core primitive tests rerun; focused TypeScript/Biome/source/browser checks recorded |
| docs/templates/skills | execution plan, one Core patch changeset, and one generated registry changelog event; no reusable doctrine changed |
| reverted/quarantined packets | generic-plugin and concrete-union local attempts rejected; no cast retained |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Browser route cannot render | unrelated generated `plate-types.ts` is missing | `/blocks/single-block-demo` | leave to the existing registry generation owner; do not expand this packet |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Heading family repair and proof | complete | Four owners repaired; focused TypeScript, 6/6 tests, Biome, source audit, changeset, and registry changelog check pass | final goal checker and handoff |

Findings:
- Both generic and concrete unions of descriptor-owned heading props fail when forwarded to `PlateElement` / `PliteElement`. Their private component-prop types carry the complete invariant plugin context although runtime consumes only render/DOM props and live `plugin.rules.selection.affinity`. This is the smallest Core typing owner.

Decisions and tradeoffs:
- Keep exact H1-H6 wrapper props and a descriptor-owned union at the shared presentation renderer. Narrow the primitive input contract to fields it actually consumes; reject casts, H1 widening, six duplicated render bodies, and a heading-local fake context.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Generic and concrete descriptor unions inferred H1 at the primitive call | 2 | Repair the Core primitive input owner | Resolved with runtime-minimal props plus exact-first/family-fallback overloads; no cast |
| Registry browser route missing generated `plate-types.ts` | 1 | Record the external blocker; do not expand scope | Focused tests and TypeScript prove this packet; browser caveat remains |
| P2 autoreview could not safely bundle unrelated oversized untracked schema | 1 | Manual four-file diff review | No actionable scoped issue found |

Verification evidence:
- `pnpm exec tsc --project packages/core/tsconfig.json --noEmit --pretty false` -> pass.
- `pnpm exec tsc --project node_modules/.cache/plate-heading-tsconfig.json --pretty false` -> pass for both heading owners.
- `bun test packages/core/src/react/components/plate-nodes.spec.tsx apps/www/src/registry/ui/heading-node.spec.tsx` -> 6/6 pass.
- `pnpm exec biome check --write <four source files>` -> pass, no remaining fixes.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` -> 56/56 source/generated events agree.
- Browser `/blocks/single-block-demo` -> blocked before rendering by unrelated missing `apps/www/src/registry/components/editor/plate-types.ts`.
- P2 autoreview -> failed closed before model review because unrelated oversized untracked `editor.schema.json` could not be safely bundled; manual four-file review found no actionable issue.

Final handoff contract:
- target surface and mode: named live/static heading component-family packet.
- files/APIs reviewed: two heading owners and live/static Core renderer primitives.
- broad Core drift score coverage: N/A: not broad Core mode.
- package file checklist coverage: N/A: not package review mode.
- doctrine start/final version and source-fingerprint state: v70 reaffirmed; no doctrine or package attestation change.
- version registry evidence and remaining stale/drifted count: N/A: not package review/sync.
- best Plate v2 recommendation: one presentation renderer per family with descriptor-exact exported wrappers.
- verdict matrix summary: two main-parity-cleanups and two keep-in-Plate Core owner repairs.
- Plite/Plate gaps or blockers: Plate renderer typing gap fixed; browser remains blocked by unrelated generated-file absence.
- related scoped sweep query/active scope/matches/patched/deferred: exact query above, two heading plus two Core owners, 16 matches, 4 owner files patched, 0 deferred.
- out-of-scope matches discovered: none in the same class; unrelated check/browser blockers recorded separately.
- changes made: wrapper delegation, context-minimal renderer inputs with exact-first union fallback overloads, Core patch changeset, and registry changelog entry.
- tests/proof commands: focused TypeScript, 6/6 tests, Biome, source audit; browser attempt recorded.
- old compatibility names audited: N/A: no compatibility API cut.
- needs attention: missing generated `plate-types.ts` prevents registry browser proof.
- next best Plate Next packet: resume the user's selected next package, not registry generation, unless they redirect.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final evidence closure |
| Where am I going? | Goal checker, then handoff |
| What is the goal? | One live/static heading family renderer with exact descriptor props and focused proof |
| What have I learned? | Core primitive props carried unused invariant context and blocked unions |
| What have I done? | Repaired both families and the smallest Core typing owner; focused proof passes |

Timeline:
- 2026-08-13T12:22:32.025Z Goal plan created.
- 2026-08-13 source review found H1-narrowed family duplication in live and static owners.
- 2026-08-13 Core input typing was narrowed to runtime-consumed fields; exact family unions compile without casts.
- 2026-08-13 focused TypeScript, 6/6 runtime tests, Biome, and source audit passed.
- 2026-08-13 Browser route attempt was blocked by unrelated missing generated `plate-types.ts`.
- 2026-08-13 Core patch changeset and registry changelog source/generated artifacts were added; 56/56 changelog events validate.

Open risks:
- Browser-rendered heading proof is unavailable until the existing registry generated-file blocker is repaired; runtime and compile proof are green.
