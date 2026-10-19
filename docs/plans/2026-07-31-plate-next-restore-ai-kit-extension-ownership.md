# plate-next restore ai kit extension ownership

Objective:
Restore AI kit behavior to `AIChatPlugin.extend(...)` without a duplicate
plugin; done when the focused source audit and www typecheck pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-31-plate-next-restore-ai-kit-extension-ownership.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: response annotation "This drift should be reverted" with
  user instruction `go`
- mode: named file/API correction
- target surface: `apps/www/src/registry/components/editor/plugins/ai-kit.tsx`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; one registry plugin owner only
- correction-triggered related scoped sweep: yes; inspect the AI registry plugin
  for duplicate `createPlatePlugin` ownership and manual self-portal access
- package review mode: no
- package review target: N/A: registry named-file correction
- package file checklist gate: N/A: not package review
- doctrine version: 34; no doctrine source edit requested
- package applied version / fingerprint state: N/A: not package review or sync
- sync mode / target: no
- sync queue row count: N/A
- completion threshold summary: one `AIChatPlugin.extend(...)` owner, no
  `AIChatKitPlugin`, preserved AIChat configuration, source audit clean, www
  typecheck pass

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
- initial confidence score: N/A: binary named-file correction
- improvement loop: implement once, typecheck, audit, repair only owned fallout
- final score / loop closure: N/A: binary completion threshold

Completion threshold:
- `ai-kit.tsx` extends `AIChatPlugin` directly, does not create/install a
  second AI chat kit plugin, preserves render/shortcut/hook/state behavior,
  and passes the www typecheck plus the focused source audit.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-plate-next-restore-ai-kit-extension-ownership.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm turbo typecheck --filter=./apps/www`
- package proof: N/A: registry file, not package review
- shared Core gate: N/A: no Core/package API change
- source audits: `rg -n "AIChatKitPlugin|createPlatePlugin|AIChatPlugin\\.extend|editor\\.plugin\\(AIChatPlugin\\)" apps/www/src/registry/components/editor/plugins/ai-kit.tsx`
- related scoped sweep query / active scope / match count / patched count / deferred count:
  `rg -n "AIChatKitPlugin|createPlatePlugin|AIChatPlugin\\.extend|editor\\.plugin\\(AIChatPlugin\\)"` across `ai-kit.tsx`, `use-chat.ts`, and
  `settings-dialog.tsx`; 11 relevant matches, 1 owner file patched, 0 deferred;
  no `name: 'aiChatKit'` or `[AIChatPlugin]` dependency wrapper remains
- package file manifest / row count / checked count / deferred count: N/A: not package review
- version registry validation / starting status / final status: N/A: not package review/sync
- package fingerprint command / result: N/A: not package review/sync
- Plite/Plate gap ledger: N/A: existing `.extend()` API expresses the owner
- broad Core drift ledger gate: N/A: not a broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-plate-next-restore-ai-kit-extension-ownership.md`

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
- allowed edit scope: `apps/www/src/registry/components/editor/plugins/ai-kit.tsx`
  and this execution plan only
- package/API surfaces: consume the existing `AIChatPlugin` definition; do not
  change its public API
- docs/browser surfaces: no docs edits; browser N/A because this is an
  ownership-only registry refactor with no intended rendered change
- non-goals: do not alter `packages/ai`, `packages/diff`, generated registry
  output, skills, or unrelated callers
- out-of-scope package errors: report only; do not patch unless caused by this
  named correction

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- The existing plugin builder cannot infer the extended hook context without a
  Core/API change, or focused proof exposes behavior requiring broader scope.

Current verdict:
- verdict: `main-parity-cleanup`
- confidence: high; the live diff shows one coherent AIChat extension split
  into a duplicate descriptor solely to regain owner context manually
- next owner: plate-next
- keep / revert / quarantine call: revert the duplicate-plugin architecture,
  preserve the accepted current APIs inside the restored extension
- reason: AI chat kit behavior adapts `AIChatPlugin`; it does not own a second
  independently installable plugin identity

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Annotation means revert `ai-kit.tsx` duplicate-plugin drift; no broader changes. |
| `plate-next` skill/rule read | yes | Read complete generated skill v34 before writing. |
| Active goal checked or created | yes | Created matching goal for this plan. |
| Mode classified as named packet vs broad Core sweep | yes | Named registry plugin correction; no broad sweep. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Restore direct extension ownership using current APIs, not legacy aliases. |
| Broad Core drift ledger initialized when in scope | no | N/A: no Core sweep. |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; one registry source file plus plan. |
| Output budget strategy recorded | yes | Targeted `sed`/`rg` and scoped typecheck output. |
| Public API fork routing checked | no | N/A: accepted existing `.extend()` call shape; no public fork. |
| Gap policy checked | yes | No gap found; stop if inference requires Core change. |
| Related scoped sweep policy checked | yes | Sweep only the named AI kit owner after correction. |
| Review-mode rename freeze checked | yes | No rename planned; delete only the duplicate descriptor identity. |
| Package review checklist initialized when in scope | no | N/A: not package review. |
| Doctrine registry validated for package review/sync | no | N/A: not package review/sync. |
| Sync queue materialized when sync mode is in scope | no | N/A: not sync mode. |

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
| Named verification threshold | yes | Run the proof commands named in this plan | `www` typecheck: 57/57 tasks passed; browser `/blocks/editor-ai`: 200 and editor mounted. |
| Broad Core drift ledger coverage | no | N/A: named registry packet | No Core files touched. |
| Score gate | yes | Score reviewed target | `ai-kit.tsx` score 100 after owner restoration and proof. |
| Best Plate v2 recommendation | yes | Record current shape | One `AIChatPlugin.extend(...)`; no duplicate descriptor. |
| Plite/Plate gap ledger | no | N/A: no gap | Existing builder inference passed. |
| Related scoped sweep after correction | yes | Run same-class search | 11 relevant matches reviewed; 1 owner patched; 0 deferred. |
| Package file checklist | no | N/A: not package review | Registry named-file packet. |
| Package doctrine attestation | no | N/A: not package review/sync | No package ledger edit. |
| All-package sync closure | no | N/A: not sync-all | No sync requested. |
| Helper topology / lexical tx ownership | yes | Audit named owner | No helper extraction or tx plumbing introduced. |
| Package/API proof | yes | Run focused typecheck | `pnpm turbo typecheck --filter=./apps/www` passed 57/57. |
| Shared Core gate coverage | no | N/A: no Core-adjacent package review | No Core change. |
| Non-Core package error triage | no | N/A: proof passed | No failures. |
| Source audit | yes | Audit duplicate descriptor pattern | No `name: 'aiChatKit'`, dependency wrapper, or `createPlatePlugin` remains in the owner. |
| Rename ledger | no | N/A: no postponed rename | Export stays `AIChatKitPlugin` for current consumers. |
| Extracted-file inventory | no | N/A: no extracted files | No file move/add/delete. |
| Autoreview / review | no | N/A: micro one-file ownership correction | Diff manually reviewed against annotation and current consumers. |
| Final lint/check | yes | Run scoped formatting and diff check | Biome checked 1 file with no fixes; `git diff --check` passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; no needs-attention row. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-plate-next-restore-ai-kit-extension-ownership.md` | Passed. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `apps/www/src/registry/components/editor/plugins/ai-kit.tsx` | 0 after fix | `main-parity-cleanup` | `AIChatPlugin.extend(...)` | www typecheck and browser mount pass | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| AI registry kit | Export one widened `AIChatKitPlugin = AIChatPlugin.extend(...)` and install it once | Separate `createPlatePlugin({ dependencies: [AIChatPlugin] })` plus separately configured base plugin | Kit behavior adapts AIChat state/hooks/rendering and has no independent identity | none; user accepted via `go` |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | Existing `.extend()` widens state and infers owner context | N/A | www typecheck | no gap |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Remove duplicate AI kit descriptor | `ai-kit.tsx`, `use-chat.ts`, `settings-dialog.tsx` | `rg -n "AIChatKitPlugin|createPlatePlugin|AIChatPlugin\\.extend|editor\\.plugin\\(AIChatPlugin\\)" ...` plus negative audit for `name: 'aiChatKit'`/dependency wrapper | 11 relevant | 1 owner file | 0 | none; base-plugin portals remain valid and browser-mounted |

Core drift ledger:
- Applies: no; named registry packet
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
| N/A | 0 | not a Core sweep | N/A | no Core files touched | none |

Package file checklist:
- Applies: no; registry named-file packet
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
- [x] N/A: not package review.

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| N/A | N/A | 34 | N/A | N/A | no | named registry proof | N/A | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| AI kit extension ownership | `AIChatPlugin` | Duplicate plugin identity split one coherent adaptation | `ai-kit.tsx`; www typecheck; browser `/blocks/editor-ai` | restore direct `.extend()` | keep |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | no extracted file | existing path retained | none | source inventory |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| Browser console | Existing React warning about a rendered script tag | Route mounted and warning is unrelated to plugin ownership; no AI/plugin error | existing www layout owner |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| N/A | none | focused sweep found no same-class duplicate AI kit descriptor | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Restored `AIChatKitPlugin = AIChatPlugin.extend(...)`; installed it once; removed `createPlatePlugin` wrapper. |
| tests/proof | www typecheck 57/57; Browser `/blocks/editor-ai` mounted; scoped Biome/diff/source audits passed. |
| docs/templates/skills | This execution plan only; no reusable skill/doctrine edit. |
| reverted/quarantined packets | Reverted duplicate `aiChatKit` descriptor architecture while preserving current `editor.getType` APIs. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | none | no open decision | N/A | none |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Restore owner | complete | `AIChatKitPlugin = AIChatPlugin.extend(...)`; duplicate descriptor removed | verify |
| Focused proof | complete | www 57/57, Browser mount, Biome/source/diff audits pass | close |

Findings:
- The live diff had split `AIChatPlugin.extend(...)` into a new
  `createPlatePlugin({ name: 'aiChatKit', dependencies: [AIChatPlugin] })`, then
  installed both descriptors and manually reopened the AIChat portal.
- Current builder inference supports the intended direct extension: its widened
  `chatOptions` state compiles through settings and `useChat` consumers.
- Browser `/blocks/editor-ai` mounted the editor and AI instructional content;
  no AI/plugin runtime error appeared.

Decisions and tradeoffs:
- Keep `AIChatKitPlugin` as the export name so current registry consumers use
  the exact installed widened descriptor; remove only the duplicate runtime
  identity.
- Preserve current `editor.plugin(...).type` calls and the accepted AIChat
  `previewValue` API; this correction does not restore stale API spelling.
- Keep the existing unrelated React script-tag console warning out of scope.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm turbo typecheck --filter=./apps/www` -> 57/57 tasks passed in 1m8.294s;
  docs source parity and registry source checks passed inside the command.
- `pnpm exec biome check --write apps/www/src/registry/components/editor/plugins/ai-kit.tsx`
  -> checked 1 file, no fixes.
- Browser `http://localhost:3000/blocks/editor-ai` -> HTTP 200, editor toolbar,
  editable textbox, and `AI-Powered Editing` content mounted. Console contained
  only the existing rendered-script warning, not an AI/plugin error.
- Focused positive/negative `rg` audit -> one `AIChatPlugin.extend(...)`; no
  `createPlatePlugin`, `name: 'aiChatKit'`, or dependency wrapper remains in
  the owner.
- `git diff --check` on code and plan -> pass.
- Goal-plan checker -> complete.

Final handoff contract:
- target surface and mode: named registry API correction in `ai-kit.tsx`
- files/APIs reviewed: `ai-kit.tsx`, its `use-chat.ts` and
  `settings-dialog.tsx` consumers, `AIChatPlugin.extend/configure` ownership
- broad Core drift score coverage: N/A; no Core sweep
- package file checklist coverage: N/A; not package review
- doctrine start/final version and source-fingerprint state: v34 unchanged; N/A
  package fingerprint
- version registry evidence and remaining stale/drifted count: N/A; no sync
- best Plate v2 recommendation: one widened `AIChatPlugin` installed once
- verdict matrix summary: `main-parity-cleanup`, fixed and proven
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: focused AI
  kit/consumer query; 11 relevant matches; 1 owner patched; 0 deferred
- out-of-scope matches discovered: none; unrelated browser script warning noted
- changes made: removed duplicate plugin and restored direct `.extend()` owner
- tests/proof commands: www typecheck, Biome, Browser mount, source audit,
  `git diff --check`
- old compatibility names audited: duplicate `aiChatKit` identity and
  dependency wrapper absent; no compatibility alias added
- needs attention: none
- next best Plate Next packet: return to the user's current named review target

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final verification closure |
| Where am I going? | Goal-plan check, then handoff |
| What is the goal? | Restore direct AIChat extension ownership without duplicate plugin identity. |
| What have I learned? | Current inference supports the clean one-owner shape. |
| What have I done? | Patched, typechecked, browser-smoked, formatted, and audited. |

Timeline:
- 2026-07-31T10:36:40.240Z Goal plan created.
- 2026-07-31T10:38Z Restored `AIChatKitPlugin = AIChatPlugin.extend(...)`
  and removed duplicate membership.
- 2026-07-31T10:40Z `www` typecheck passed 57/57 tasks.
- 2026-07-31T10:42Z Browser `/blocks/editor-ai` mounted successfully.
- 2026-07-31T10:43Z Biome and focused source/diff audits passed.

Open risks:
- None for this packet. Existing rendered-script browser warning is unrelated
  and remains with the www layout owner.
