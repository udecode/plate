# plate next feature plugins audit fixes

Status:
Superseded by the aggregate 98-row P1/P2 closure at
`docs/plans/artifacts/plate-next-all-package-plugin-audit-v18/p1-p2-closure.md`.
This packet's older v18 package-attestation gates are not claimed as complete.

Objective:
Implement all 33 production P1/P2 and 2 test P2 findings in AI, Code Block,
Docx IO, Emoji, Footnote, Selection, and Yjs without touching Core; done when
each row is fixed or honestly blocked and focused package proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-28-plate-next-feature-plugins-audit-fixes.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api

Plate Next source:
- prompt / link: root delegation from the all-package plugin audit
- mode: broad named seven-package implementation packet
- target surface: `packages/{ai,code-block,docx-io,emoji,footnote,selection,yjs}`
  plus the smallest `packages/plite-dom` clipboard transaction owner
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, inside the owned packages
- package review mode: multi-package implementation of an already-completed
  package audit
- package review target: every accepted P1/P2 row from the frozen audit
- package file checklist gate: use the frozen 138-production-file audit
  manifest and exact 35-finding disposition ledger
- doctrine version: 18
- package applied version / fingerprint state: pending
- sync mode / target: no
- sync queue row count: N/A
- completion threshold summary: 35/35 findings fixed or blocked with owner;
  package typechecks/tests and scoped Biome pass; barrel needs recorded for the
  root-owned final `pnpm brl`

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
- improvement loop: fix highest-risk transaction/type rows first, then
  topology and proof
- final score / loop closure: 35 disposition rows plus focused proof

Completion threshold:
- All 33 production P1/P2 and 2 test P2 findings are fixed, or a genuine
  Plite/Core blocker is named with exact owner and proof.
- Do not edit `packages/core`.
- Preserve shared WIP.
- Do not run global `pnpm brl`; record barrel deltas for root after all source
  writers freeze.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-plate-next-feature-plugins-audit-fixes.md`
  passes after final evidence is recorded.

Execution status:
- Source authority was narrowed during execution. This lane now owns
  `ai`, `docx-io`, `emoji`, `selection`, and the smallest `plite-dom`
  clipboard transaction owner. `code-block`, `footnote`, and `yjs` were
  delegated before this lane wrote any of those three packages.
- AI: preview-range ownership, recursive preview stripping, table-cell
  narrowing, Copilot constructor API ownership, inline default word strategy,
  and flat React production topology are repaired. AIChat's first extension
  remains an honest builder limitation: its API/read/update contract shares
  one lexical owner that constructor field factories cannot share without
  publishing private machinery or duplicating state.
- Docx IO: the one-owner `internal/utils` taxonomy is flattened.
- Emoji: data/search defaults live with `EmojiLibrary`; picker contracts and
  defaults live with `useEmojiPicker`; the dead category count is removed.
- Selection: optional peers are typed and installation-checked; component and
  hook families are colocated; SelectionArea types and implementation share
  one flat owner; production boundary casts/`any` are removed; read capability
  is staged and consumed from snapshots/transactions; block paste uses the
  active transaction.
- Plite DOM: `dom()` publishes `tx.clipboard.insertData` when clipboard support
  is enabled, including compile-only enabled/disabled/dynamic-options proof.
- Barrel needs recorded for the root freeze: AI flat React exports; Selection
  root `SelectionArea` plus React `BlockSelection`, `useBlockSelection`, and
  `useCursorOverlay`; removal of stale nested AI/Selection exports. No barrel
  command was run in this lane.
- Proof so far: Docx internal tests 33/33; Plite DOM typecheck; Plite DOM
  clipboard boundary 59/59. AI/Emoji/Selection source-first typechecks are
  blocked before package diagnostics by concurrent Core moves and stale Core
  barrels. Focused package wrappers exit zero, but direct Selection Bun proof
  confirms the same unresolved `@platejs/core` owner blocker and is not counted
  as test execution.

Verification surface:
- focused tests / commands: package-focused Bun tests, source-first Turbo
  typechecks, scoped Biome
- package proof: AI, Code Block, Docx IO, Emoji, Footnote, Selection, Yjs, and
  touched Plite DOM
- shared Core gate: N/A; Core is exclusively owned by another agent
- source audits: no production `any` in owned rows; no nested active updates;
  no stale moved helper/hook names; optional peers check `installed`
- related scoped sweep query / active scope / match count / patched count / deferred count:
  pending
- package file manifest / row count / checked count / deferred count: pending
- version registry validation / starting status / final status: doctrine v18
  validation passed in the frozen audit; package attestation is root-owned after
  all concurrent source writers freeze
- package fingerprint command / result: pending
- Plite/Plate gap ledger: pending
- broad Core drift ledger gate: pending
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-plate-next-feature-plugins-audit-fixes.md`

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
- allowed edit scope: `packages/{ai,code-block,docx-io,emoji,footnote,selection,yjs}`
  and the smallest `packages/plite-dom` owner strictly required by Selection
  clipboard ingress; this plan file
- package/API surfaces: the 35 accepted audit findings only
- docs/browser surfaces: N/A; no docs/apps/browser work
- non-goals: no `packages/core`, no unrelated API decisions, no global barrel
  regeneration, no package version attestation while other writers are active
- out-of-scope package errors: report; never patch outside owned directories

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Read exact owners and caller lists; use counts before large output; never
  stream full test logs unless a failure needs inspection.

Blocked condition:
- The same missing Core/Plite owner blocks progress after three distinct
  in-scope attempts, or shared concurrent writes make safe ownership impossible.

Current verdict:
- verdict: pending
- confidence: pending
- next owner: plate-next
- keep / revert / quarantine call: pending
- reason: pending

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Objective, constraints, boundaries, proof, and final handoff are recorded above |
| `plate-next` skill/rule read | yes | v18 skill read completely |
| Active goal checked or created | yes | `get_goal` returned null; this plan is the goal ledger |
| Mode classified as named packet vs broad Core sweep | yes | Seven-package named implementation packet; Core excluded |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Frozen audit findings use v18 owner/capability law |
| Broad Core drift ledger initialized when in scope | no | N/A: Core is excluded and separately owned |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; boundaries above |
| Output budget strategy recorded | yes | Narrow owner/caller reads and capped proof output |
| Public API fork routing checked | yes | No unresolved call-shape fork in this lane |
| Gap policy checked | yes | Only smallest truthful Plite DOM owner allowed; Core gaps block |
| Related scoped sweep policy checked | yes | Owned packages plus required Plite DOM only |
| Review-mode rename freeze checked | yes | Owner-driven moves allowed; no cosmetic churn |
| Package review checklist initialized when in scope | yes | Frozen audit covered 138 production files and 35 accepted rows |
| Doctrine registry validated for package review/sync | yes | Frozen audit: `version.mjs validate` passed at v18 |
| Sync queue materialized when sync mode is in scope | no | N/A: not sync mode |
| Package/API pack selected | yes | package-api rows materialized in this plan |
| Public surface or package boundary identified | yes | Seven package sources plus Plite DOM clipboard ingress |
| Release artifact path selected | yes | N/A for child lane: root will classify aggregate release impact |
| `changeset` skill loaded when `.changeset` is required | no | N/A: root owns aggregate release artifact decision |
| Barrel/export impact decision recorded | yes | Record deltas; root runs one global `pnpm brl` after source freeze |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [ ] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [ ] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
- [ ] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [ ] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [ ] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
- [ ] After every correction, related scoped sweep row is added with query,
      active scope, match count, patched count, deferred count, and remaining
      risk. In package review mode, broader matches are deferred, not patched.
- [ ] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [ ] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [ ] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [ ] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [ ] For package review mode, the package file checklist is generated before
      implementation, with one checkbox per reviewed file.
- [ ] For package review mode, every production `transforms/`, `queries/`,
      `utils/`, `helpers/`, `with*`, `decorate*`, similar helper file, and
      standalone `tx`-parameter function has an owner-topology row; every
      survivor has multiple-production-consumer or independent-boundary proof.
- [ ] For package review mode, every package file row is either checked at
      score `100` with evidence or left unchecked with deferral reason, owner,
      proof needed, and next action for user review.
- [ ] For package review mode, no next package is started before the current
      package checklist closes or the user explicitly redirects.
- [ ] For package review or sync mode, starting doctrine version and source
      fingerprint state are recorded before package edits.
- [ ] For sync mode, every target package has one queue row with starting
      version, required missing-version checks, full-review trigger, proof,
      final fingerprint, and ledger status.
- [ ] For sync mode, v0 or source-drifted packages receive a full current
      package review; unchanged later-version packages receive every missing
      doctrine version's `migrationChecks`.
- [ ] For package review or sync mode, the package ledger is patched only after
      focused proof and autoreview; final plan closure runs only after package
      registry status is `current`.
- [ ] If a reusable Plate Next rule changes during the run, doctrine version is
      bumped, immutable migration checks are appended, generated skill is
      synced, and the package queue is recomputed.
- [ ] For Core-adjacent package review, `tooling/scripts/check-core.mjs` is
      updated to include the package, or the plan records why the package is
      product-only and outside `check:core`.
- [ ] Direct one-shot API audit closed: single-operation
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic.
- [ ] Live node target and matcher audit closed: no supplied live node is
      rediscovered by type/ID, no flat `api.findPath` / `api.some` alias remains
      in scope, equality-only callbacks use property matchers, and every
      remaining predicate has computed/path/truthiness/narrowing semantics.
- [ ] Optional public-read audit closed: feature-package production code does
      not use `{ required: true }` or non-null assertions to hide unresolved
      Plite reads; each match handles `undefined` or records a Plite-internal
      invariant reason.
- [ ] Explicit normalization audit closed: every `tx.normalize(...)` and
      `editor.update.normalize(...)` match in scope has a ledger verdict;
      feature production calls have a named full-root semantic invariant or are
      cut/moved to the Plite owner; explicit normalizer tests remain test-only
      evidence rather than production precedent.
- [ ] Plugin export inference audit closed: plugin export annotations/casts
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
- [ ] Empty config inference audit closed: `PluginConfig<'key'>` aliases and
      `createBasePlugin<Config>` generics are removed when the config has no
      typed initial state, API, read, update, selectors, dependencies,
      extension capabilities, or external public contract.
- [ ] Plugin capability boundary audit closed: every plugin contribution has
      exactly one canonical `initialState` / `store` / `selectors` / `api` /
      `read` / `update` / `extension` / `codecs` owner and obeys that owner's
      purity, snapshot, transaction, and editor-scope boundary.
- [ ] Plugin authoring stage audit closed: independent contributions are in the
      constructor; every `.extend()` names an imported/prebuilt adaptation,
      constructor-inaccessible shared factory, or earlier capability type; no
      `.configure()` call widens the descriptor.
- [ ] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [ ] Review matrix is filled for every inspected file/API/helper.
- [ ] Public API forks are routed to `plate-plan` before implementation.
- [ ] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [ ] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [ ] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [ ] Focused package proof is run after meaningful code changes.
- [ ] `pnpm brl` is run when exports/barrels change.
- [ ] Old compatibility names are source-audited when cut.
- [ ] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [ ] Output budget discipline followed.
- [ ] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [ ] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [ ] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [ ] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [ ] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [ ] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [ ] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [ ] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the proof commands named in this plan | pending |
| Broad Core drift ledger coverage | pending | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | pending |
| Score gate | pending | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | pending |
| Best Plate v2 recommendation | pending | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | pending |
| Plite/Plate gap ledger | pending | Record blockers or N/A when no gap blocks the target | pending |
| Related scoped sweep after correction | pending | For each correction, run and record same-class search/review results inside the active scope | pending |
| Package file checklist | pending | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | pending |
| Package doctrine attestation | pending | Record final applied version, fingerprint, verification date, evidence plan, and `status <package>` result | pending |
| All-package sync closure | pending | Run `version.mjs check all`, or record N/A when sync-all is not the mode | pending |
| Helper topology / lexical tx ownership | pending | Audit every helper directory/file and standalone tx-parameter function; inline/delete single-owner rows or prove reuse/independent ownership | pending |
| Package/API proof | pending | Run focused typecheck/test/build or record N/A | pending |
| Shared Core gate coverage | pending | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | pending |
| Non-Core package error triage | pending | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | pending |
| Source audit | pending | Run exact audit for removed compatibility names or record N/A | pending |
| Rename ledger | pending | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | pending |
| Extracted-file inventory | pending | Record untracked/extracted file command, row count, and bucket for every file in scope | pending |
| Autoreview / review | pending | Run review gate for non-trivial implementation diffs or record N/A | pending |
| Final lint/check | pending | Run scoped lint/check or record N/A | pending |
| Changed list / top drift / needs attention | pending | Fill handoff ledgers | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-plate-next-feature-plugins-audit-fixes.md` | pending |
| Public API / package boundary proof | pending | Source-audit public API, exports, and package boundary impact | pending |
| Release artifact classification | pending | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | pending |
| Published package changeset | pending | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | pending |
| Registry changelog | pending | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | pending |
| No release artifact | pending | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | pending |
| Package typecheck/build/test | pending | Run owning package checks or record N/A with reason | pending |
| Barrel/export generation | pending | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pending |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| pending | pending | pending | pending | pending | pending |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| pending | pending | pending | pending | pending |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| pending | pending | pending | pending | pending | pending |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| pending | pending | pending | pending | pending | pending | pending |

Core drift ledger:
- Applies: pending
- Manifest command: pending
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: pending
- Actual row count: pending
- Missing row count: pending
- Extra row count: pending
- Score gate: pending
- Top drift rows: pending

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| pending | pending | pending | pending | pending | pending |

Package file checklist:
- Applies: pending
- Package: pending
- Manifest command: pending
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: pending
- Actual row count: pending
- Checked score-100 count: pending
- Unchecked/deferred count: pending
- Missing row count: pending
- Extra row count: pending
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: pending

Package file rows:
- [ ] `pending` — score: pending — verdict: pending — owner: pending —
      evidence: pending — next: pending

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| pending | pending | pending | pending | pending | pending | pending | pending | pending |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| pending | pending | pending | pending | pending | pending |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| pending | pending | pending | pending | pending |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| pending | pending | pending | pending |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| pending | pending | pending | pending |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | pending |
| tests/proof | pending |
| docs/templates/skills | pending |
| reverted/quarantined packets | pending |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| pending | pending | pending | pending | pending |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final handoff contract:
- target surface and mode: pending
- files/APIs reviewed: pending
- broad Core drift score coverage: pending
- package file checklist coverage: pending
- doctrine start/final version and source-fingerprint state: pending
- version registry evidence and remaining stale/drifted count: pending
- best Plate v2 recommendation: pending
- verdict matrix summary: pending
- Plite/Plate gaps or blockers: pending
- related scoped sweep query/active scope/matches/patched/deferred: pending
- out-of-scope matches discovered: pending
- changes made: pending
- tests/proof commands: pending
- old compatibility names audited: pending
- needs attention: pending
- next best Plate Next packet: pending

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Drift-scored Plate Next closure |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-28T22:30:54.743Z Goal plan created.

Open risks:
- Pending.
