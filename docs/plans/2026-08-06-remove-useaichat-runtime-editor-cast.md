# remove useAIChat runtime editor cast

Objective:
Remove the fake `runtimeEditor` cast from `useAIChatEditor`; use the existing
non-generic `MarkdownEditor` capability and prove focused AI types and runtime.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-06-remove-useaichat-runtime-editor-cast.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user accepted the hard cut with `ok go`
- mode: named file/API packet
- target surface: `packages/ai/src/react/useAIChat.ts#useAIChatEditor`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes; AI React source for the cast class
- package review mode: no
- package review target: N/A: named API packet, not a package review
- package file checklist gate: N/A: package review is not in scope
- doctrine version: N/A: no reusable doctrine change requested
- package applied version / fingerprint state: N/A: not package review/sync
- sync mode / target: no
- sync queue row count: N/A
- completion threshold summary: no `runtimeEditor`, no `PlateEditorReference`
  workaround in `useAIChatEditor`; AI typecheck and focused hook test pass

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
- initial confidence score: N/A: binary source/type/runtime threshold
- improvement loop: patch, typecheck, focused test, scoped audit
- final score / loop closure: pass all named gates

Completion threshold:
- `useAIChatEditor` accepts `MarkdownEditor` without a local generic or cast,
  uses `editor` directly, focused AI typecheck and hook test pass, and the
  scoped cast/symbol audit has zero stale matches.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-06-remove-useaichat-runtime-editor-cast.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: AI source-first typecheck and
  `packages/ai/src/react/useAIChat.slow.tsx`
- package proof: `pnpm turbo typecheck --filter=./packages/ai` plus focused Bun test
- shared Core gate: N/A: no Core source changes
- source audits: exact `runtimeEditor|PlateEditorReference|unknown as PlateEditor`
  search in AI React source
- related scoped sweep query / active scope / match count / patched count / deferred count:
  `rg -n "runtimeEditor|PlateEditorReference|unknown as PlateEditor"
  packages/ai/src/react --glob '*.ts' --glob '*.tsx'`; 0 matches after patch,
  1 source file patched, 0 deferred
- package file manifest / row count / checked count / deferred count: N/A: named API packet
- version registry validation / starting status / final status: N/A
- package fingerprint command / result: N/A
- Plite/Plate gap ledger: no gap expected; `MarkdownEditor` already owns the
  exact runtime capabilities consumed by the hook
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-06-remove-useaichat-runtime-editor-cast.md`

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
- allowed edit scope: `packages/ai/src/react/useAIChat.ts`, its focused test only
  if behavior/type proof exposes a real gap, this goal plan, and existing AI
  release prose only if main-relative user impact is missing
- package/API surfaces: `@platejs/ai/react` `useAIChatEditor`
- docs/browser surfaces: no docs edit; package-facing browser proof will be
  attempted only if the existing AI demo route is runnable
- non-goals: no Core generic redesign, no package-wide review, no unrelated AI cleanup
- out-of-scope package errors: record without patching unless caused by this change

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- The plain `MarkdownEditor` contract cannot satisfy the consumed Plite runtime
  API without changing its owner; then stop with the exact Core/Markdown type gap.

Current verdict:
- verdict: hard-cut
- confidence: high; the generic never flows to output and the cast performs no runtime work
- next owner: plate-next
- keep / revert / quarantine call: keep after focused proof
- reason: use the smallest existing capability contract instead of lying through `unknown`

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Plain non-generic `MarkdownEditor`; remove the cast; focused proof; no broader cleanup |
| `plate-next` skill/rule read | yes | Full current generated skill read before implementation |
| Active goal checked or created | yes | No prior goal; active goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Named API packet only |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Hard-cut fake cast; use existing capability contract |
| Broad Core drift ledger initialized when in scope | no | N/A: no broad Core sweep |
| Source of truth and allowed workspace recorded | yes | Current checkout; bounded files listed above |
| Output budget strategy recorded | yes | Targeted reads/searches with capped output |
| Public API fork routing checked | yes | User accepted the concrete signature; no unresolved fork |
| Gap policy checked | yes | Stop only if `MarkdownEditor` lacks a consumed runtime capability |
| Related scoped sweep policy checked | yes | Sweep AI React source for the exact cast class |
| Review-mode rename freeze checked | no | N/A: no rename |
| Package review checklist initialized when in scope | no | N/A: not package review mode |
| Doctrine registry validated for package review/sync | no | N/A: neither mode applies |
| Sync queue materialized when sync mode is in scope | no | N/A: sync not requested |

Work Checklist:
Rows specific to broad Core, package review/sync, plugin descriptors,
transactions, nodes, schema, bridges, and renames are checked as N/A because
this is one named hook-signature packet and none of those surfaces changed.
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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | AI typecheck/build and focused 6-test hook family pass; emitted declaration is non-generic |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: no Core sweep |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | One drift row fixed from cast workaround to direct capability contract |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Plain `MarkdownEditor`; reject local generic and `unknown` cast |
| Plite/Plate gap ledger | no | Record blockers or N/A when no gap blocks the target | N/A: existing `MarkdownEditor` satisfies all consumed runtime APIs |
| Related scoped sweep after correction | yes | For each correction, run and record same-class search/review results inside the active scope | Exact AI React cast audit: 0 matches after patch |
| Package file checklist | no | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | N/A: named API packet |
| Package doctrine attestation | no | Record final applied version, fingerprint, verification date, evidence plan, and `status <package>` result | N/A: not package review/sync |
| All-package sync closure | no | Run `version.mjs check all`, or record N/A when sync-all is not the mode | N/A: sync not requested |
| Helper topology / lexical tx ownership | no | Audit every helper directory/file and standalone tx-parameter function; inline/delete single-owner rows or prove reuse/independent ownership | N/A: no helper or transaction topology changed |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Typecheck, declaration build, and focused 6/6 hook tests pass |
| Shared Core gate coverage | no | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | N/A: no Core or package-review scope |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | Full AI suite: 64 pass, 4 unrelated table-Markdown failures in separate plugin specs |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `runtimeEditor|PlateEditorReference|unknown as PlateEditor`: 0 AI React matches |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename |
| Extracted-file inventory | no | Record untracked/extracted file command, row count, and bucket for every file in scope | N/A: no files added, moved, or extracted |
| P2 autoreview / review | no | Run autoreview with `--max-priority P2` for non-trivial implementation diffs; P3 is opt-in only, or record N/A | N/A: four-line type-only simplification with direct typecheck, declaration, runtime, lint, and browser proof |
| Final lint/check | yes | Run scoped lint/check or record N/A | Scoped Biome and targeted `git diff --check` pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; only unrelated AI table-Markdown test drift remains |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-06-remove-useaichat-runtime-editor-cast.md` | Final checker pass recorded after this ledger was closed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/ai/src/react/useAIChat.ts#useAIChatEditor` | 4 before / 0 after | hard-cut | AI hook family | `runtimeEditor` was only `unknown as PlateEditor`; `MarkdownEditor` typechecks directly | keep simplified signature |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `useAIChatEditor` parameter | `editor: MarkdownEditor` with direct use | generic `E extends PlateEditorReference`; `runtimeEditor`; `unknown as PlateEditor` | The hook does not return or preserve `E`; `MarkdownEditor` already carries read/update/subscription plus Markdown API | none; user accepted |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | None | No workaround remains | Existing Markdown/Core types | Focused typecheck and declaration build | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Delete fake editor alias and generic | `packages/ai/src/react` | `rg -n "runtimeEditor|PlateEditorReference|unknown as PlateEditor" packages/ai/src/react --glob '*.ts' --glob '*.tsx'` | 0 after patch | 1 file | 0 | none |

Core drift ledger:
- Applies: no
- Manifest command: N/A: named AI API packet
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: 0
- Actual row count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | N/A | N/A | No Core scope | none |

Package file checklist:
- Applies: no
- Package: N/A: named API packet within `@platejs/ai`
- Manifest command: N/A
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 0
- Actual row count: 0
- Checked score-100 count: 0
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A

Package file rows:
- [x] N/A: package review mode is not active.

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| N/A | N/A | N/A | N/A | N/A | no | N/A | N/A | N/A: not review/sync |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Remove fake runtime editor cast | AI hook family | Generic brand constraint forced a cast for capabilities already present on `MarkdownEditor` | source patch, typecheck, focused test, build | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | No extracted files | none | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `pnpm --filter @platejs/ai test` | 64 pass, 4 fail in table-cell Markdown reads returning empty strings | Failures are in separate `AIChatPlugin.markdown` and placeholder specs; this packet changes only the hook parameter type | AI Markdown owner; keep outside this named packet |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| exact cast class | none | Zero matches outside the patched hook in scoped AI React source | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Remove `runtimeEditor`, `PlateEditor`, `PlateEditorReference`, and the unused hook generic; use `editor: MarkdownEditor` directly |
| tests/proof | No test source changes; existing hook-family test proves the real inferred editor call and runtime update |
| docs/templates/skills | Add this required goal ledger only; no docs or skill doctrine change |
| reverted/quarantined packets | None |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Full AI suite has four table-Markdown failures | Separate AI package drift; not caused by the hook signature | `AIChatPlugin.markdown.spec.tsx`, `AIChatPlugin.placeholders.spec.tsx` | Repair in the AI Markdown owner, not this packet |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Source correction | complete | Hook uses plain `MarkdownEditor` with no alias, generic, or cast | verification |
| Verification | complete | Typecheck, 6/6 focused tests, declaration build, lint, audit, and Browser proof pass | closeout |
| Closeout | complete | Goal ledger closed; unrelated suite failures routed | none |

Findings:
- `runtimeEditor` performed no runtime conversion; it existed only to recover
  capabilities erased by the unnecessary `PlateEditorReference` generic.
- `MarkdownEditor` defaults to the broad `BaseEditor` capability and satisfies
  `useEditorRuntimeState`, `read`, and `update` directly.
- The emitted declaration is `(editor: MarkdownEditor, content: string) => readonly BaseElement[]`.

Decisions and tradeoffs:
- Prefer the non-generic capability contract because the input editor type does
  not flow to the return type.
- Do not add a new runtime-editor alias or change Core; both would preserve the
  type workaround instead of deleting it.
- No changeset edit: the existing AI v54 changeset owns the main-relative hook
  migration, while this correction removes branch-only type sludge.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `bun test packages/ai/src/react/useAIChat.slow.tsx` was parsed as a name filter | 1 | Prefix the path with `./` | `bun test ./packages/ai/src/react/useAIChat.slow.tsx` passed 6/6 |
| Full AI fast suite exposed unrelated table-Markdown failures | 1 | Keep focused hook proof and route the separate owner | 64 passed; 4 unrelated failures recorded above |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/ai` -> 39/39 tasks pass.
- `bun test ./packages/ai/src/react/useAIChat.slow.tsx` -> 6 pass, 0 fail.
- `pnpm --filter @platejs/ai build` -> pass; declaration is non-generic.
- `pnpm exec biome check packages/ai/src/react/useAIChat.ts` -> pass.
- targeted `git diff --check` -> pass.
- exact AI React cast audit -> 0 matches.
- Browser `http://localhost:3000/blocks/editor-ai` -> editor rendered, Mod+J
  opened the AI command list, and console had 0 warnings/errors. The new
  port-3001 server returned 404 for registry routes, so it was stopped.

Final handoff contract:
- target surface and mode: named `useAIChatEditor` API packet
- files/APIs reviewed: `packages/ai/src/react/useAIChat.ts`, focused hook test,
  Markdown/Core capability types, emitted declaration, callers
- broad Core drift score coverage: N/A
- package file checklist coverage: N/A
- doctrine start/final version and source-fingerprint state: N/A
- version registry evidence and remaining stale/drifted count: N/A
- best Plate v2 recommendation: plain `MarkdownEditor`; no generic or cast
- verdict matrix summary: one `hard-cut`, zero gaps/bridges/deferred fixes
- Plite/Plate gaps or blockers: none for this target
- related scoped sweep query/active scope/matches/patched/deferred: exact cast
  query in AI React; 0 matches after patch; 1 file patched; 0 deferred
- out-of-scope matches discovered: four existing table-Markdown test failures
- changes made: simplify hook parameter and direct editor use
- tests/proof commands: typecheck, focused 6-test runtime proof, declaration
  build, Biome, diff check, source audit, Browser route/menu/console
- old compatibility names audited: `runtimeEditor`, `PlateEditorReference`,
  `unknown as PlateEditor`
- needs attention: separate AI table-Markdown regression owner
- next best Plate Next packet: resume the user's next named package/API review

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure |
| Where am I going? | Final goal-plan check and handoff |
| What is the goal? | Delete the fake hook generic/cast and prove the plain capability contract |
| What have I learned? | The cast was branch-only type sludge; `MarkdownEditor` is sufficient |
| What have I done? | Patched source; passed focused type/runtime/build/lint/browser proof; recorded unrelated suite failures |

Timeline:
- 2026-08-06T15:16:31.559Z Goal plan created.
- 2026-08-06 Hook simplified to `MarkdownEditor` with direct editor use.
- 2026-08-06 AI typecheck, focused runtime test, build, lint, source audit, and
  Browser proof passed; unrelated full-suite failures classified.

Open risks:
- No risk in the target hook remains. Four unrelated AI table-Markdown tests
  remain failing in the shared checkout and need their own owner.
