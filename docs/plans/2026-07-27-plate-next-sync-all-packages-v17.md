# plate-next sync all packages v17

Objective:
Sync all active Plate packages plus resolve Yjs to latest Plate Next doctrine;
done when the registry reports zero stale/drifted packages and package
proof/review gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-27-plate-next-sync-all-packages-v17.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api

Plate Next source:
- prompt / link: user requested every remaining package, then `go all of them`
- mode: all-package `plate-next sync`
- target surface: all 42 active tracked packages, including newly enrolled Yjs
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; Core and Utils are base-gate owners, not feature-package
  sync rows
- correction-triggered related scoped sweep: yes, package-local after each fix
- package review mode: yes, sequential
- package review target: best Plate v2 owner-first colocation and plugin
  authoring shape on Plite
- package file checklist gate: one generated manifest per active package before
  its implementation starts
- doctrine version: invalid v16 source state; repair by appending v17 before
  package attestation
- package applied version / fingerprint state: after v17/Yjs enrollment, 18
  v0 unattested; 18 older-version packages with changed source; 6
  older-version packages with unchanged source
- sync mode / target: every active tracked feature package
- sync queue row count: 42 frozen active rows after v17 validates
- completion threshold summary: zero stale/drifted active packages, Yjs
  explicitly enrolled or source-backed excluded, every package manifest closed,
  focused proof and review green, and `version.mjs check all` zero

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
- semantics: continue until complete or genuinely blocked
- initial confidence score: N/A; auditable registry/checklist threshold
- improvement loop: sequential package review, repair, proof, autoreview,
  attestation, status recheck
- final score / loop closure: 0 stale + 0 drifted + 0 unresolved package rows

Completion threshold:
- Append doctrine v17 for the unversioned state-contract rule and regenerate
  the skill from source.
- Yjs is enrolled because it publishes Base/React Plate descriptors and its
  hybrid Plite proof lane does not remove that Plate package boundary.
- Close all 42 tracked packages one at a time.
- Every active package must end at v17 with its exact current fingerprint,
  verification date, evidence plan, and `status <package> = current`.
- Every active package manifest row must score 100 or the whole sync remains
  incomplete; this run does not use mass attestation.
- Package-local typecheck/tests, topology scans, source audits, and autoreview
  must pass; run barrels and changesets only when the actual package diff
  requires them.
- `version.mjs validate`, `status`, and `check all` must finish with zero
  stale/drifted packages.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-plate-next-sync-all-packages-v17.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package-owned typecheck/tests selected from each
  package manifest and change
- package proof: exact file manifest, topology/helper/tx scans, package
  typecheck/tests, package-local autoreview, final fingerprint/status
- shared Core gate: `node tooling/scripts/check-core.mjs` after the final
  package; focused Core proof earlier only when a package exposes an owner
  regression
- source audits: exact package-local searches for helper topology, standalone
  tx/read/api threading, builder stages, state contracts, hooks, compatibility
  aliases, and removed names after each correction
- related scoped sweep query / active scope / match count / patched count / deferred count:
  42 package-local topology/API/state/hook sweeps; every match classified,
  patched, or retained with owner evidence; 0 unresolved deferred rows
- package file manifest / row count / checked count / deferred count: 42
  manifests; every row checked at 100; 0 unchecked; 0 deferred
- version registry validation / starting status / final status: starting
  `validate` fails because doctrine source no longer matches immutable v16;
  final validates at v17 with 42 current, 0 stale, 0 drifted, 1 retired
- package fingerprint command / result: `version.mjs fingerprint <package>
  --json`; all 42 exact fingerprints recorded in the registry and sync ledger
- Plite/Plate gap ledger: no unresolved gap blocks the package sync
- broad Core drift ledger gate: N/A; no broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-plate-next-sync-all-packages-v17.md`

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
- allowed edit scope: `.agents/rules/plate-next*`, generated skill mirror via
  `pnpm install`, `tooling/scripts/check-core.mjs` only for enrollment/gate
  truth, all queued `packages/<slug>/**`, package-owned changesets/barrels, and
  this plan/evidence artifacts
- package/API surfaces: internal topology and plugin authoring first; public
  API changes require `best-api` review and complete in-repo adoption
- docs/browser surfaces: out of scope unless a package API hard cut requires
  current-state docs adoption; no www/browser proof for topology-only package
  work
- non-goals: no legacy compatibility, no broad Plite redesign, no unrelated
  app polish, no synthetic mass attestation, no Core/Utils full rescan
- out-of-scope package errors: only classifiable when the failing package has
  not started and the failure cannot prove a shared Core regression

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Keep per-package manifests and audit evidence under
  `docs/plans/artifacts/2026-07-27-plate-next-sync-all-packages-v17/`; inspect
  counts and targeted slices instead of streaming repository-wide matches.
- Cap source reads to the active owner/family and split large files into
  explicit ranges. Record high-volume command results as files and summarize
  exact counts in this plan.

Blocked condition:
- After three consecutive attempts, the same missing user decision, external
  state, or unfixable owner/tooling failure prevents every remaining
  autonomous path. A difficult or failing package is not itself a blocker.

Current verdict:
- verdict: pass
- confidence: high
- next owner: none; Plate Next registry monitoring resumes on future drift
- keep / revert / quarantine call: keep all 42 attested package packets
- reason: every active package is at v17 with exact source fingerprints,
  package proof, owner-first topology evidence, and zero registry drift

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Package sync | pass | 42 current, 0 stale, 0 drifted, 1 retired |
| Shared Core gate | pass | 4,066 source/docs files audited and 45 reviewed packages typechecked |
| Final review | pass | Copilot configured-ID renderer and fail-closed descriptor/editor-lineage enforcement repaired, proved, and re-reviewed clean at confidence 0.84 |
| Goal closure | pass | Registry and plan completion check are green |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan's source, threshold, constraints, boundaries, and handoff |
| `plate-next` skill/rule read | yes | Full generated skill and source doctrine read |
| Active goal checked or created | yes | Goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | All-package sync; no broad Core sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plate Next source and constraints |
| Broad Core drift ledger initialized when in scope | no | N/A: feature-package sync |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; source rule plus versions registry |
| Output budget strategy recorded | yes | Artifacted manifests and capped package-local reads |
| Public API fork routing checked | yes | `best-api` only when a package exposes a real public fork |
| Gap policy checked | yes | Plite/Plate gap, never a compatibility workaround |
| Related scoped sweep policy checked | yes | Package-local correction sweep |
| Review-mode rename freeze checked | yes | Topology changes are allowed when owner-first; cosmetic churn rejected |
| Package review checklist initialized when in scope | yes | Active-package manifest is generated immediately before each package |
| Doctrine registry validated for package review/sync | yes | v17 valid: 42 active, 1 retired |
| Sync queue materialized when sync mode is in scope | yes | Frozen 42-row queue below |
| Package/API pack selected | yes | package-api |
| Public surface or package boundary identified | yes | All 42 tracked Plate feature packages; Yjs enrolled as the Plate collaboration package |
| Release artifact path selected | yes | Per package: changeset only for published user-visible delta; otherwise exact N/A |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded at closeout; every published package delta already has one package-scoped changeset relative to `main` |
| Barrel/export impact decision recorded | yes | Package barrels regenerated wherever exported files moved; packages without export movement record N/A in packet proof |

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
- [x] Empty config inference audit closed: `PluginConfig<'key'>` aliases and
      `createBasePlugin<Config>` generics are removed when the config has no
      typed initial state, API, read, update, selectors, dependencies,
      extension capabilities, or external public contract.
- [x] Plugin capability boundary audit closed: every plugin contribution has
      exactly one canonical `initialState` / `store` / `selectors` / `api` /
      `read` / `update` / `extension` / `codecs` owner and obeys that owner's
      purity, snapshot, transaction, and editor-scope boundary.
- [x] Plugin authoring stage audit closed: independent contributions are in the
      constructor; every `.extend()` names an imported/prebuilt adaptation,
      constructor-inaccessible shared factory, or earlier capability type; no
      `.configure()` call widens the descriptor.
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
| Named verification threshold | yes | Run the proof commands named in this plan | 42 package packets and final registry proof recorded |
| Broad Core drift ledger coverage | no | N/A: no broad Core sweep | package sync only; `check:core` source audit still passed across 4,066 files |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | every manifest row 100; 0 deferred |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | aggregate recommendation plus 42 packet decisions recorded |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | no unresolved feature-package gap |
| Related scoped sweep after correction | yes | For each correction, run and record same-class search/review results inside the active scope | package-local sweep ledger and packet evidence complete |
| Package file checklist | yes | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | 42/42 manifests closed; 0 unchecked/deferred |
| Package doctrine attestation | yes | Record final applied version, fingerprint, verification date, evidence plan, and `status <package>` result | all 42 exact v17 rows in `versions.json` |
| All-package sync closure | yes | Run `version.mjs check all` | 42 current, 0 stale, 0 drifted, 1 retired |
| Helper topology / lexical tx ownership | yes | Audit helper files and standalone tx-parameter functions | every survivor justified by reuse/independent boundary |
| Package/API proof | yes | Run focused typecheck/test/build | packet ledger records each package gate |
| Shared Core gate coverage | yes | Run final Core/reviewed-package gate | schema/docs audits, Core tests, and declaration contracts pass |
| Non-Core package error triage | yes | Classify failures | two unchanged Yjs slow-runtime rows recorded separately from the green package sync gates |
| Source audit | yes | Audit removed compatibility names | exact package/caller/docs scans pass |
| Rename ledger | no | N/A: no postponed cosmetic rename | owner-first moves recorded directly in manifests |
| Extracted-file inventory | yes | Classify every in-scope new/moved file | 0 unresolved extracted files |
| Autoreview / review | yes | Run review gate | every packet reviewed; final Core/Markdown confirmation reviews recorded below |
| Final lint/check | yes | Run scoped lint/check | package lint/Biome plus registry/checker gates pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below |
| Goal plan complete | yes | Run plan checker | final checker command recorded after reviews |
| Public API / package boundary proof | yes | Audit APIs, exports, and package boundaries | public hard cuts/callers/docs/barrels covered per packet |
| Release artifact classification | yes | Classify user-visible deltas | published package changes from `main` |
| Published package changeset | yes | One package per changeset; no forbidden Core minor | 42/42 tracked packages covered; 0 multi-package files; 0 forbidden minors |
| Registry changelog | no | N/A: not registry-only work | registry callers changed only as package API consumers |
| No release artifact | no | N/A: package deltas are published | every tracked package has a changeset |
| Package typecheck/build/test | yes | Run owning package checks | complete per packet; final 45-package typecheck passes |
| Barrel/export generation | yes | Run barrels when exported layout changed | packet ledger records barrel runs; unchanged packages N/A |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/dnd` | 5 | colocate | Dnd package | 36 source files collapsed to 10 owner/family files; 32/32 behavior tests pass | keep current |
| Dnd selection helpers | 2 | keep standalone, colocate | cross-layer selection + DOM focus command family | external production consumer in table registry; mutation plus DOM focus cannot honestly live in plugin `read`/`update` | `blockSelection.ts` |
| Dnd node helpers | 2 | colocate | `useDndNode` React-DnD hook family | all production consumers are the hook family; public root exports preserved | `useDndNode.ts` |
| Dnd environment probe | 1 | keep boundary | SSR/browser module-load boundary | SSR proof must replace React-DnD hooks before family module evaluation | `dndEnvironment.ts` |
| `packages/docx` | 5 | colocate | Docx package | 42 TypeScript modules collapsed to five owner/proof files; only three public APIs survive | keep current |
| Docx cleaner utilities | 5 | merge/private | `cleanDocx` algorithm owner | only `cleanDocx` has external production consumers; `isDocxContent` is shared by the plugin and cleaner | `cleanDocx.ts` |
| Docx transform utilities | 5 | inline | `DocxPlugin` parser callback | list/indent normalization has one production owner and no editor/runtime plumbing | `DocxPlugin.ts` |
| `packages/docx-io` | 5 | colocate | Docx IO package | 59 source files reduced to 41; plugin pipeline, renderer owners, public surface, and OOXML part graph fully audited | keep current |
| DOCX import preprocessing | 5 | inline/private | `DocxIOPlugin.api.import` | only production owner; public helper/token exports leaked private transport state | merged into plugin and hard-cut helpers |
| DOCX renderer cycle | 4 | merge owner | XML builder + document renderer | two helper modules imported each other; image/list builders belong to XML builder | one-directional import graph, zero cycles |
| OOXML schema modules | 2 | keep independent | each zipped DOCX archive part | each module emits a distinct archive part or relationship document; not implementation-kind taxonomy | keep schema owners |
| Docx IO utilities | 2 | keep shared | list, unit, and VNode algorithms | every survivor has two production owners; one-use image/color/font/URL utilities merged | keep three shared utilities |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Dnd | one flat plugin owner, one scroller component family, one Dnd hook family, one cross-layer block-selection command owner, one SSR boundary | taxonomy folders, one file per hook/helper/transform, fake plugin methods that mix document mutation with DOM focus | smallest truthful owners; keeps inference and root API without helper navigation | no |
| Docx | one plugin owner plus one standalone HTML-cleaner algorithm owner; keep only `DocxPlugin`, `cleanDocx`, and reused `isDocxContent` public | `docx-cleaner/utils`, one-file-per-DOM-step, exported RTF internals, fake Plate wrappers | `cleanDocx` is genuinely reused by Docx IO; every other cleaner step is private implementation | no |
| Docx IO | one public `DocxIOPlugin` import/export owner, one standalone HTML-to-DOCX boundary, one document/archive assembler, one XML renderer, distinct OOXML part generators, and three proven shared utilities | public preprocessing/token helpers, helper directory, one-use utility modules, renderer cycle, one file per fixture | import markers are private; `DocxComment.references` returns stable points without leaking tokens; OOXML parts remain honest independent documents | no |
| All remaining packages | one coherent plugin owner per capability family, one component file per main family, one hook file per hook family, and separate files only for reuse or an independent boundary | taxonomy folders, one-use helper exports, private descriptor scaffolding, duplicated editor-bound APIs, editor/tx/read/api parameter plumbing, and compatibility aliases | the packet ledger records the exact keep/merge/inline decision and proof for every package | no |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none unresolved | local compatibility workarounds were rejected throughout | owning package or Core generic | package proof plus `check:core` source audit | no open gap blocks v17 closure |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Dnd owner-first colocation | `packages/dnd` | full 36-file manifest plus imports/declaration census | 36 | 26 files removed/localized | 0 | none |
| Dnd v17 state contract | `packages/dnd` | `PluginState`, `initialState`, `configure`, casts/annotations scan | 1 state owner | 1 | 0 | none |
| Dnd helper/tx topology | `packages/dnd/src` | taxonomy paths plus functions accepting editor/tx | 3 surviving owner files | 0 | 0 | every survivor has cross-layer, hook-family, or SSR-boundary proof |
| Docx owner-first colocation | `packages/docx/src` | 42-module manifest, export and external-consumer census | 42 TS modules before | 37 removed/merged | 0 | five TypeScript owner/proof files remain |
| Docx public API cut | repo callers excluding `packages/docx` | former cleaner export names plus `@platejs/docx` imports | only `cleanDocx` and `DocxPlugin` have external production consumers | 27 accidental exports made private/removed | 0 | major changeset updated |
| Docx plugin/state topology | `packages/docx/src` | editor/tx/api/read/store parameters, casts, definition wrappers, state defaults | 0 matches requiring repair | 0 | 0 | descriptor infers directly; plugin owns no state |
| Docx IO owner-first colocation | `packages/docx-io/src` | 59-file initial manifest, local import graph, export/caller census | 59 source files before | 18 files removed/merged | 0 | 41 final source/proof files |
| Docx IO import owner/API cut | package plus real callers/docs | `preprocessMammothHtml|extractComments|buildCommentToken|getCommentTokenPrefix|getCommentTokenSuffix|PreprocessMammothHtmlResult` | package files, app integration test, generated artifacts | package/app source patched; six exports removed | generated registry/templates deferred to their CI owners | final source has no stale imports |
| Docx IO helper/utility topology | `packages/docx-io/src/lib/internal` | local importer count for every production file; cycle DFS | 27 production files; one renderer cycle before | one-use color/image/font/URL code merged; dead barrel removed; cycle cut | 0 | zero cycles; each utility survivor has two consumers; schema survivors own distinct OOXML parts |
| Docx IO plugin/state topology | `packages/docx-io/src` | editor/tx/api/read/store parameter, legacy builder, cast, normalize scans | only inferred plugin callback context | 0 compatibility matches | 0 | exported typed state/default; no tx/read plumbing |

Core drift ledger:
- Applies: no; this is the 42-package feature sync, not a broad Core sweep
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
| N/A | 0 | not a broad Core sweep | Core | `check:core` still audited 4,066 current source/docs files and typechecked all 45 Core/reviewed packages | no row-level Core ledger required |

Package file checklist:
- Applies: yes
- Package: Dnd — closed
- Manifest command: `rg --files packages/dnd/src | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 10
- Actual row count: 10
- Checked score-100 count: 10
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: satisfied; Dnd is current at v17

Package file rows:
- [x] `packages/dnd/src/DndPlugin.slow.tsx` — score: 100 — verdict:
      keep slow proof — owner: plugin/render/store integration — evidence: 4/4
      slow rows pass — next: keep
- [x] `packages/dnd/src/DndPlugin.tsx` — score: 100 — verdict: keep plugin
      owner — owner: Dnd identity/state/handlers/useHooks — evidence: exported
      state contract, typed defaults, inferred constructor, typecheck — next:
      keep
- [x] `packages/dnd/src/DndScroller.tsx` — score: 100 — verdict: merged
      component family — owner: edge-scroller components — evidence:
      `ScrollArea`, `Scroller`, and `DndScroller` colocated; slow store/render
      proof passes — next: keep
- [x] `packages/dnd/src/blockSelection.spec.ts` — score: 100 — verdict:
      merged behavior-family proof — owner: cross-layer selection commands —
      evidence: focused fast suite passes — next: keep
- [x] `packages/dnd/src/blockSelection.ts` — score: 100 — verdict: merged
      standalone owner — owner: selection mutation plus DOM focus — evidence:
      external table consumer and cross-layer semantics justify editor input;
      no tx plumbing — next: keep
- [x] `packages/dnd/src/dndEnvironment.ts` — score: 100 — verdict: keep
      independent boundary — owner: SSR-safe React-DnD module selection —
      evidence: inert-hook module-load test passes — next: keep
- [x] `packages/dnd/src/index.ts` — score: 100 — verdict: generated barrel —
      owner: package exports — evidence: package `brl` regenerated five flat
      owners; root names preserved — next: keep generated
- [x] `packages/dnd/src/useDndNode.spec.ts` — score: 100 — verdict: merged
      hook-family behavior proof — owner: drop/hover/direction algorithms —
      evidence: real geometry and same/cross-editor behavior pass — next: keep
- [x] `packages/dnd/src/useDndNode.ssr.spec.tsx` — score: 100 — verdict:
      keep independent SSR proof — owner: inert module-load boundary —
      evidence: React-DnD hooks remain uncalled without DOM — next: keep
- [x] `packages/dnd/src/useDndNode.ts` — score: 100 — verdict: merged hook
      family — owner: drag/drop hooks and React-DnD algorithms — evidence:
      typecheck, 28 fast tests, clean autoreview, no taxonomy imports — next:
      keep

Package file checklist:
- Applies: yes
- Package: Docx — closed
- Manifest command: `rg --files packages/docx/src | sort`
- Expected row count: 22
- Actual row count: 22
- Checked score-100 count: 22
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: satisfied; Docx is current at v17

Package file rows:
- [x] `packages/docx/src/index.ts` — score: 100 — verdict: generated barrel —
      owner: package exports — evidence: package `brl` green — next: keep
- [x] `packages/docx/src/lib/DocxPlugin.spec.ts` — score: 100 — verdict:
      plugin behavior family proof — owner: parser integration — evidence:
      list/indent/image/plain-HTML rows pass — next: keep
- [x] `packages/docx/src/lib/DocxPlugin.ts` — score: 100 — verdict: merged
      plugin owner — owner: DOCX paste parser — evidence: one inferred
      `createBasePlugin` descriptor, inline transform behavior, no casts or
      runtime parameter plumbing — next: keep
- [x] `packages/docx/src/lib/cleanDocx.slow.ts` — score: 100 — verdict: slow
      fixture proof — owner: exact Word HTML snapshots — evidence: 5/5 pass —
      next: keep
- [x] `packages/docx/src/lib/cleanDocx.spec.ts` — score: 100 — verdict: merged
      behavior proof — owner: cleaner/RTF/VML behavior — evidence: 9/9 pass —
      next: keep
- [x] `packages/docx/src/lib/cleanDocx.ts` — score: 100 — verdict: merged
      standalone algorithm owner — owner: reusable DOCX HTML cleanup —
      evidence: `cleanDocx` has Docx IO consumers; private pipeline owns all
      DOM/RTF helpers; `isDocxContent` is reused by the plugin — next: keep
- [x] `packages/docx/src/lib/index.ts` — score: 100 — verdict: generated
      barrel — owner: public API — evidence: exports only two owner modules —
      next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/brs.html` — score:
      100 — verdict: fixture — owner: line-break behavior — evidence: slow
      snapshot passes — next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/custom-styles.html` —
      score: 100 — verdict: fixture — owner: retained DOCX corpus — evidence:
      no production import/topology role — next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/empty-paragraphs.html`
      — score: 100 — verdict: fixture — owner: empty-paragraph behavior —
      evidence: slow snapshot passes — next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/nested-lists.html` —
      score: 100 — verdict: fixture — owner: retained DOCX corpus — evidence:
      no production import/topology role — next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/v-shapes.html` —
      score: 100 — verdict: fixture — owner: retained VML corpus — evidence:
      direct VML behavior proof covers the owner — next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/whitespaces-1.html` —
      score: 100 — verdict: fixture — owner: whitespace behavior — evidence:
      slow snapshot passes — next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/whitespaces-2.html` —
      score: 100 — verdict: fixture — owner: whitespace behavior — evidence:
      slow snapshot passes — next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/whitespaces-3.html` —
      score: 100 — verdict: fixture — owner: whitespace behavior — evidence:
      slow snapshot passes — next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/output/brs.html` — score:
      100 — verdict: expected fixture — owner: line-break behavior — evidence:
      slow snapshot passes — next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/output/custom-style-reference.html`
      — score: 100 — verdict: expected fixture — owner: retained DOCX corpus —
      evidence: no production import/topology role — next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/output/empty-paragraphs.html`
      — score: 100 — verdict: expected fixture — owner: empty-paragraph
      behavior — evidence: slow snapshot passes — next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/output/nested-lists.html` —
      score: 100 — verdict: expected fixture — owner: retained DOCX corpus —
      evidence: no production import/topology role — next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/output/whitespaces-1.html` —
      score: 100 — verdict: expected fixture — owner: whitespace behavior —
      evidence: slow snapshot passes — next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/output/whitespaces-2.html` —
      score: 100 — verdict: expected fixture — owner: whitespace behavior —
      evidence: slow snapshot passes — next: keep
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/output/whitespaces-3.html` —
      score: 100 — verdict: expected fixture — owner: whitespace behavior —
      evidence: slow snapshot passes — next: keep

Package file checklist:
- Applies: yes
- Package: Docx IO — closed
- Manifest command: `rg --files packages/docx-io/src | sort`
- Expected row count: 41
- Actual row count: 41
- Checked score-100 count: 41
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: satisfied; Docx IO is current at v17

Package file rows:
- [x] `packages/docx-io/src/index.ts` — score: 100 — verdict: generated
      barrel — owner: package exports — evidence: package `brl` green — next:
      keep
- [x] `packages/docx-io/src/lib/DocxIOPlugin.import.spec.ts` — score: 100 —
      verdict: import behavior-family proof — owner: import conversion,
      warnings, comment points, marker removal — evidence: 3/3 focused rows
      pass — next: keep
- [x] `packages/docx-io/src/lib/DocxIOPlugin.slow.tsx` — score: 100 —
      verdict: merged slow fixture family — owner: five real DOCX import
      fixtures — evidence: 5/5 rows pass through public plugin API — next:
      keep
- [x] `packages/docx-io/src/lib/DocxIOPlugin.spec.ts` — score: 100 — verdict:
      plugin/export behavior proof — owner: state, static rendering, defaults —
      evidence: full fast suite passes — next: keep
- [x] `packages/docx-io/src/lib/DocxIOPlugin.tsx` — score: 100 — verdict:
      merged plugin owner — owner: editor-aware DOCX import and explicit-value
      export — evidence: typed state/default, inferred callback, private
      preprocessing, marker-free nodes with `Point[]` references, Node/browser
      Mammoth proof, clean final autoreview — next: keep
- [x] `packages/docx-io/src/lib/html-to-docx.spec.ts` — score: 100 — verdict:
      public conversion proof — owner: standalone HTML-to-DOCX entrypoint —
      evidence: fast suite passes — next: keep
- [x] `packages/docx-io/src/lib/html-to-docx.ts` — score: 100 — verdict: keep
      public boundary — owner: standalone HTML-to-DOCX conversion — evidence:
      external API and app roundtrip proof — next: keep
- [x] `packages/docx-io/src/lib/index.ts` — score: 100 — verdict: generated
      barrel — owner: public package API — evidence: exports only plugin and
      HTML conversion owners; preprocessing export removed — next: keep
- [x] `packages/docx-io/src/lib/internal/constants.ts` — score: 100 —
      verdict: keep shared normalized contract — owner: renderer defaults —
      evidence: seven production importers; distinct from optional public input
      types — next: keep
- [x] `packages/docx-io/src/lib/internal/docx-document.slow.ts` — score: 100 —
      verdict: slow archive/font proof — owner: assembled DOCX document —
      evidence: slow suite passes — next: keep
- [x] `packages/docx-io/src/lib/internal/docx-document.ts` — score: 100 —
      verdict: keep archive assembler — owner: independent DOCX zip/document
      lifecycle — evidence: owns archive parts and font table; one production
      consumer at the public engine boundary — next: keep
- [x] `packages/docx-io/src/lib/internal/html-to-docx.slow.ts` — score: 100 —
      verdict: slow end-to-end engine proof — owner: HTML-to-DOCX conversion —
      evidence: slow suite passes — next: keep
- [x] `packages/docx-io/src/lib/internal/html-to-docx.ts` — score: 100 —
      verdict: keep engine boundary — owner: normalized HTML-to-DOCX pipeline —
      evidence: composes document, renderer, public input types; typecheck and
      roundtrip pass — next: keep
- [x] `packages/docx-io/src/lib/internal/namespaces.ts` — score: 100 —
      verdict: keep shared OOXML vocabulary — owner: namespace declarations —
      evidence: twelve production importers — next: keep
- [x] `packages/docx-io/src/lib/internal/render-document-file.spec.ts` —
      score: 100 — verdict: renderer behavior proof — owner: VNode dispatch —
      evidence: focused/full fast suite passes — next: keep
- [x] `packages/docx-io/src/lib/internal/render-document-file.ts` — score:
      100 — verdict: keep renderer owner — owner: VNode-to-OOXML dispatch —
      evidence: cycle removed; two production consumers; one-directional import
      to XML builder — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/content-types.ts` — score:
      100 — verdict: keep OOXML part owner — owner: `[Content_Types].xml` —
      evidence: distinct zipped archive document — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/core.spec.ts` — score: 100 —
      verdict: part proof — owner: core properties XML — evidence: fast suite
      passes — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/core.ts` — score: 100 —
      verdict: keep OOXML part owner — owner: `docProps/core.xml` — evidence:
      distinct zipped archive document — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/document-rels.ts` — score:
      100 — verdict: keep OOXML part owner — owner: document relationships XML
      — evidence: distinct relationship document — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/document.template.spec.ts` —
      score: 100 — verdict: template proof — owner: Word document XML —
      evidence: fast suite passes — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/document.template.ts` —
      score: 100 — verdict: keep OOXML part owner — owner:
      `word/document.xml` template — evidence: distinct archive part, two
      assembly uses — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/font-table.ts` — score: 100 —
      verdict: keep OOXML part owner — owner: `word/fontTable.xml` — evidence:
      distinct archive part — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/generic-rels.ts` — score: 100
      — verdict: keep OOXML part owner — owner: generic relationship XML —
      evidence: distinct reusable relationship document — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/numbering.ts` — score: 100 —
      verdict: keep OOXML part owner — owner: `word/numbering.xml` — evidence:
      distinct list-numbering archive part — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/rels.ts` — score: 100 —
      verdict: keep OOXML part owner — owner: package root relationships —
      evidence: distinct `_rels/.rels` document — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/settings.ts` — score: 100 —
      verdict: keep OOXML part owner — owner: `word/settings.xml` — evidence:
      distinct archive part — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/styles.spec.ts` — score: 100 —
      verdict: styles proof — owner: Word style declarations — evidence: fast
      suite passes — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/styles.ts` — score: 100 —
      verdict: keep OOXML part owner — owner: `word/styles.xml` — evidence:
      distinct archive part — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/theme.spec.ts` — score: 100 —
      verdict: theme proof — owner: Word theme XML — evidence: fast suite
      passes — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/theme.ts` — score: 100 —
      verdict: keep OOXML part owner — owner: `word/theme/theme1.xml` —
      evidence: distinct archive part — next: keep
- [x] `packages/docx-io/src/lib/internal/schemas/web-settings.ts` — score: 100
      — verdict: keep OOXML part owner — owner: `word/webSettings.xml` —
      evidence: distinct archive part — next: keep
- [x] `packages/docx-io/src/lib/internal/types.ts` — score: 100 — verdict:
      keep public-engine input contract — owner: optional HTML-to-DOCX
      operation inputs — evidence: three production importers and public type
      re-exports; distinct from normalized constants — next: keep
- [x] `packages/docx-io/src/lib/internal/utils/list.spec.ts` — score: 100 —
      verdict: shared algorithm proof — owner: list option normalization —
      evidence: fast suite passes — next: keep
- [x] `packages/docx-io/src/lib/internal/utils/list.ts` — score: 100 — verdict:
      keep shared algorithm — owner: list option model — evidence: two
      production consumers (`docx-document`, public input types) — next: keep
- [x] `packages/docx-io/src/lib/internal/utils/unit-conversion.spec.ts` —
      score: 100 — verdict: shared algorithm proof — owner: CSS/OOXML units —
      evidence: fast suite passes — next: keep
- [x] `packages/docx-io/src/lib/internal/utils/unit-conversion.ts` — score:
      100 — verdict: keep shared algorithm — owner: CSS/OOXML unit conversion —
      evidence: two production consumers (`html-to-docx`, `xml-builder`) —
      next: keep
- [x] `packages/docx-io/src/lib/internal/utils/vnode.spec.ts` — score: 100 —
      verdict: shared algorithm proof — owner: VNode traversal — evidence: fast
      suite passes — next: keep
- [x] `packages/docx-io/src/lib/internal/utils/vnode.ts` — score: 100 —
      verdict: keep shared algorithm — owner: VNode traversal — evidence: two
      production consumers (`render-document-file`, `xml-builder`) — next:
      keep
- [x] `packages/docx-io/src/lib/internal/xml-builder.spec.ts` — score: 100 —
      verdict: merged XML behavior-family proof — owner: XML rendering, colors,
      images, URLs — evidence: consolidated fast suite passes — next: keep
- [x] `packages/docx-io/src/lib/internal/xml-builder.ts` — score: 100 —
      verdict: merged XML owner — owner: paragraph/table/list/image OOXML
      construction — evidence: one-use color/image/URL helpers merged; list and
      image builders cut the prior cycle; typecheck, tests, final autoreview
      clean — next: keep

Package file checklist:
- Applies: yes
- Package: Emoji — active
- Manifest command: `rg --files packages/emoji/src | sort`
- Initial row count: 44
- Expected final row count: 12
- Actual final row count: 12
- Checked score-100 count: 12
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: none; Emoji is current at v17.

Package file rows:
- [x] `packages/emoji/src/index.ts` — score: 100 — verdict: keep generated
      root barrel — owner: package exports — evidence: `brl`, build, and public
      consumer typecheck pass — next: keep
- [x] `packages/emoji/src/lib/BaseEmojiPlugin.spec.ts` — score: 100 —
      verdict: merged base-plugin contract proof — owner: Base Emoji plugin —
      evidence: required dependency, state, schema, insertion, and override
      rows pass — next: keep
- [x] `packages/emoji/src/lib/BaseEmojiPlugin.ts` — score: 100 — verdict:
      merged base owner — owner: descriptors, state contract, settings, data,
      and insertion — evidence: one-use constants/types merged; plugin callback
      inference preserved; build/typecheck/review clean — next: keep
- [x] `packages/emoji/src/lib/EmojiGrid.spec.ts` — score: 100 — verdict:
      merged grid-family proof — owner: grid and section behavior — evidence:
      row grouping, offsets, updates, ordering, and missing-section safety pass
      — next: keep
- [x] `packages/emoji/src/lib/EmojiGrid.ts` — score: 100 — verdict: merged
      standalone model owner — owner: generic grid and section model —
      evidence: real non-plugin public algorithm boundary; optional lookup
      adopted by every caller; typecheck/review clean — next: keep
- [x] `packages/emoji/src/lib/EmojiLibrary.spec.ts` — score: 100 — verdict:
      merged catalog/search-family proof — owner: emoji search model —
      evidence: lookup, scoring, exact match, reset, and per-dataset isolation
      rows pass — next: keep
- [x] `packages/emoji/src/lib/EmojiLibrary.ts` — score: 100 — verdict: merged
      standalone model owner — owner: catalog indexing and inline/floating
      search — evidence: three nested utility families collapsed without
      mutable singleton state; typecheck/review clean — next: keep
- [x] `packages/emoji/src/lib/index.ts` — score: 100 — verdict: keep
      generated base barrel — owner: base exports — evidence: `brl` and
      declaration build pass — next: keep
- [x] `packages/emoji/src/react/EmojiPlugin.tsx` — score: 100 — verdict: keep
      React descriptor owner — owner: Plate descriptor conversion — evidence:
      required React dependency exactness and build pass — next: keep
- [x] `packages/emoji/src/react/index.ts` — score: 100 — verdict: keep
      generated React barrel — owner: React exports — evidence: `brl`, app
      imports, and `www` typecheck pass — next: keep
- [x] `packages/emoji/src/react/useEmojiPicker.spec.tsx` — score: 100 —
      verdict: merged hook-family proof — owner: picker/storage/floating model
      behavior — evidence: public-action search, selection, scrolling,
      observer, frequent section, instance isolation, and storage rows pass —
      next: keep
- [x] `packages/emoji/src/react/useEmojiPicker.ts` — score: 100 — verdict:
      merged hook-family owner — owner: picker hooks, observer lifecycle,
      floating picker library, and browser storage — evidence: hook family
      remains outside plugin file; implementation helpers are private; no
      `any`/non-null assertions; tests, live demo, and clean final autoreview —
      next: keep

Package file checklist:
- Applies: yes
- Package: Excalidraw — active
- Manifest command: `rg --files packages/excalidraw/src | sort`
- Initial row count: 14
- Expected final row count: 8
- Actual final row count: 8
- Checked score-100 count: 8
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: none; Excalidraw is current at v17.

Package file rows:
- [x] `packages/excalidraw/src/index.ts` — score: 100 — verdict: keep
      generated root barrel — owner: package exports — evidence: `brl`, build,
      and consumer typecheck pass — next: keep
- [x] `packages/excalidraw/src/lib/BaseExcalidrawPlugin.spec.ts` — score: 100
      — verdict: merged behavior-family proof — owner: schema and insertion
      contract — evidence: void schema, data validation, persisted width,
      selection guard, explicit target, and transaction capability pass —
      next: keep
- [x] `packages/excalidraw/src/lib/BaseExcalidrawPlugin.ts` — score: 100 —
      verdict: merged Base owner — owner: element/data types, compiled schema,
      and insertion update — evidence: one-use transform and types merged;
      callback inference, build, typecheck, and review clean — next: keep
- [x] `packages/excalidraw/src/lib/index.ts` — score: 100 — verdict: keep
      generated Base barrel — owner: Base exports — evidence: `brl` and
      declaration build pass — next: keep
- [x] `packages/excalidraw/src/react/ExcalidrawPlugin.tsx` — score: 100 —
      verdict: keep React descriptor owner — owner: Base-to-React conversion —
      evidence: component configuration remains terminal; build and final
      review clean — next: keep
- [x] `packages/excalidraw/src/react/index.ts` — score: 100 — verdict: keep
      generated React barrel — owner: React exports — evidence: `brl` and full
      www typecheck pass — next: keep
- [x] `packages/excalidraw/src/react/useExcalidrawElement.spec.tsx` — score:
      100 — verdict: merged hook-family proof — owner: component loading,
      persistence, dedupe, and read-only behavior — evidence: component thunk,
      undefined-field JSON normalization, write, and read-only rows pass —
      next: keep
- [x] `packages/excalidraw/src/react/useExcalidrawElement.ts` — score: 100 —
      verdict: merged hook-family owner — owner: dynamic component and drawing
      state bridge — evidence: separate from plugin descriptor; external
      payload normalized at the persistence boundary; live canvas has zero
      errors; final autoreview clean — next: keep

Package file checklist:
- Applies: yes
- Package: Floating — active
- Manifest command: `rg --files packages/floating/src | sort`
- Initial row count: 24
- Expected final row count: 6
- Actual final row count: 6
- Checked score-100 count: 6
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: all Floating rows are score 100 and registry
  status is current.

Package file rows:
- [x] `packages/floating/src/floating-ui.ts` — score: 100 — verdict: keep
      flat dependency facade — owner: public Floating UI re-exports —
      evidence: moved without export changes; package build and Link/www
      consumers pass — next: keep
- [x] `packages/floating/src/geometry.spec.ts` — score: 100 — verdict:
      merged geometry-family proof — owner: rectangle, range, selection, and
      virtual-reference behavior — evidence: 23 focused rows pass — next: keep
- [x] `packages/floating/src/geometry.ts` — score: 100 — verdict: merged
      geometry owner — owner: public geometry helpers — evidence: all former
      public names preserved; no taxonomy folders or stale imports; final
      review says behavior-preserving — next: keep
- [x] `packages/floating/src/index.ts` — score: 100 — verdict: keep generated
      root barrel — owner: package exports — evidence: package barrel, build,
      Link/www consumer typechecks pass — next: keep
- [x] `packages/floating/src/useFloating.spec.tsx` — score: 100 — verdict:
      merged hook-family proof — owner: virtual positioning and toolbar
      lifecycle — evidence: real Plate provider rows plus full 25/25 package
      suite pass — next: keep
- [x] `packages/floating/src/useFloating.ts` — score: 100 — verdict: merged
      hook-family owner — owner: virtual floating and toolbar hooks — evidence:
      hooks remain outside plugin/component owners; live selection opens the
      toolbar with zero browser errors; final review clean — next: keep

Package file checklist:
- Applies: yes
- Package: Indent — active
- Manifest command: `rg --files packages/indent/src | sort`
- Initial row count: 9
- Expected final row count: 7
- Actual final row count: 7
- Checked score-100 count: 7
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: all Indent rows are score 100 and registry
  status is current.

Package file rows:
- [x] `packages/indent/src/index.ts` — score: 100 — verdict: keep generated
      root barrel — owner: package exports — evidence: barrel/build/consumer
      typechecks pass — next: keep
- [x] `packages/indent/src/lib/BaseIndentPlugin.spec.ts` — score: 100 —
      verdict: merged behavior-family proof — owner: schema, codecs, update,
      shortcut, and normalization contracts — evidence: all 10 rows pass in
      one owner spec — next: keep
- [x] `packages/indent/src/lib/BaseIndentPlugin.ts` — score: 100 — verdict:
      consolidated Base owner — owner: indent schema, codecs, correction,
      injection, and updates — evidence: parser and blockquote query inline;
      sole shortcut stage consumes earlier typed updates; clean review —
      next: keep
- [x] `packages/indent/src/lib/index.ts` — score: 100 — verdict: keep
      generated Base barrel — owner: Base exports — evidence: package barrel
      and build pass — next: keep
- [x] `packages/indent/src/react/IndentPlugin.tsx` — score: 100 — verdict:
      keep React descriptor owner — owner: Base-to-React conversion —
      evidence: no hook definitions; package and www typechecks pass — next:
      keep
- [x] `packages/indent/src/react/index.ts` — score: 100 — verdict: keep
      generated React barrel — owner: React exports — evidence: both hook
      names remain public; registry caller typechecks — next: keep
- [x] `packages/indent/src/react/useIndentButton.ts` — score: 100 — verdict:
      merged hook-family owner — owner: indent and outdent button behavior —
      evidence: hooks flattened outside descriptor; live toolbar moves 48px
      to 72px and back with zero errors — next: keep

Package file checklist:
- Applies: yes
- Package: Juice — active
- Manifest command: `rg --files packages/juice/src | sort`
- Initial row count: 4
- Expected final row count: 4
- Actual final row count: 4
- Checked score-100 count: 4
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: all Juice rows are score 100 and registry status
  is current.

Package file rows:
- [x] `packages/juice/src/index.ts` — score: 100 — verdict: keep generated
      root barrel — owner: package exports — evidence: barrel and build pass —
      next: keep
- [x] `packages/juice/src/lib/JuicePlugin.spec.ts` — score: 100 — verdict:
      keep colocated behavior proof — owner: HTML transform branches —
      evidence: real prepared HTML context, 2/2 package rows, and DOCX
      integration pass — next: keep
- [x] `packages/juice/src/lib/JuicePlugin.ts` — score: 100 — verdict: keep
      minimal Base owner — owner: CSS inlining parser transform — evidence:
      behavior already inline; no state, helpers, stages, or React layer;
      clean review — next: keep
- [x] `packages/juice/src/lib/index.ts` — score: 100 — verdict: keep generated
      Base barrel — owner: Base exports — evidence: package barrel/build pass —
      next: keep

Package file checklist:
- Applies: yes
- Package: Math — active
- Manifest command: `rg --files packages/math/src | sort`
- Initial row count: 23
- Expected final row count: 8
- Actual final row count: 8
- Checked score-100 count: 8
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: all Math rows are score 100 and registry status
  is current.

Package file rows:
- [x] `packages/math/src/index.ts` — score: 100 — verdict: keep generated root
      barrel — owner: package exports — evidence: barrel/build/www typechecks
      pass — next: keep
- [x] `packages/math/src/lib/BaseEquationPlugin.spec.tsx` — score: 100 —
      verdict: merged equation-family proof — owner: block/inline schemas,
      insertion, navigation, rules, and static rendering — evidence: all Base
      and rule rows share one owner spec; 15/15 rows pass — next: keep
- [x] `packages/math/src/lib/BaseEquationPlugin.ts` — score: 100 — verdict:
      merged Base equation-family owner — owner: both plugins, insertion
      updates, `MathRules`, and static KaTeX rendering — evidence: direct
      `tx` helpers deleted; private rule helpers inline; package/app/docs
      adoption and clean review — next: keep
- [x] `packages/math/src/lib/index.ts` — score: 100 — verdict: keep generated
      Base barrel — owner: Base exports — evidence: former public surviving
      names resolve from one family owner — next: keep
- [x] `packages/math/src/react/EquationPlugin.tsx` — score: 100 — verdict:
      merged React descriptor-family owner — owner: block and inline React
      conversions — evidence: no hooks inside; package/www typechecks pass —
      next: keep
- [x] `packages/math/src/react/index.ts` — score: 100 — verdict: keep
      generated React barrel — owner: React exports — evidence: both
      descriptors and both hooks remain public — next: keep
- [x] `packages/math/src/react/useEquation.spec.tsx` — score: 100 — verdict:
      merged hook-family proof — owner: equation input editing, dismissal, and
      navigation — evidence: focused hook row and live edit pass — next: keep
- [x] `packages/math/src/react/useEquation.ts` — score: 100 — verdict: merged
      hook-family owner — owner: editable KaTeX rendering and equation input —
      evidence: hooks stay outside descriptors; live `E = mc^2` to `E = mc^3`
      update has zero errors — next: keep

Package file checklist:
- Applies: yes
- Package: Mention — active
- Manifest command: `rg --files packages/mention/src | sort`
- Initial row count: 7
- Expected final row count: 6
- Actual final row count: 6
- Checked score-100 count: 6
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: all Mention rows are score 100 and registry
  status is current.

Package file rows:
- [x] `packages/mention/src/index.ts` — score: 100 — verdict: keep generated
      root barrel — owner: package exports — evidence: barrel/build/www
      typechecks pass — next: keep
- [x] `packages/mention/src/lib/BaseMentionPlugin.spec.tsx` — score: 100 —
      verdict: keep behavior-family proof — owner: dependency, trigger,
      insertion, spacing, deletion, and navigation contracts — evidence:
      10/10 rows pass, including typed `@` transient input — next: keep
- [x] `packages/mention/src/lib/BaseMentionPlugin.ts` — score: 100 — verdict:
      consolidated Base family owner — owner: mention/input descriptors,
      public types, trigger extension, and scoped insert update — evidence:
      one-use type file merged; ignored `search` field deleted; inference and
      final review clean — next: keep
- [x] `packages/mention/src/lib/index.ts` — score: 100 — verdict: keep
      generated Base barrel — owner: Base exports — evidence:
      `TMentionItemBase<TKey = unknown>` and plugin surfaces resolve — next:
      keep
- [x] `packages/mention/src/react/MentionPlugin.tsx` — score: 100 — verdict:
      keep React descriptor-family owner — owner: mention and input React
      conversions with required dependency replacement — evidence: exact
      dependency spec and www typecheck pass — next: keep
- [x] `packages/mention/src/react/index.ts` — score: 100 — verdict: keep
      generated React barrel — owner: React exports — evidence: registry and
      docs consumers compile — next: keep

Package file checklist:
- Applies: yes
- Package: Plate — active
- Manifest command: `rg --files packages/plate/src | sort`
- Initial row count: 4
- Expected final row count: 4
- Actual final row count: 4
- Checked score-100 count: 4
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: all Plate rows are score 100 and registry status
  is current.

Package file rows:
- [x] `packages/plate/src/index.tsx` — score: 100 — verdict: keep umbrella
      Base entrypoint — owner: public Core, Plite, and utility re-exports —
      evidence: package build/typecheck and type contract pass — next: keep
- [x] `packages/plate/src/react/index.tsx` — score: 100 — verdict: keep React
      umbrella entrypoint — owner: public Core and utility React re-exports —
      evidence: explicit `useEditorMounted` binding preserves the public
      export; package build/typecheck pass — next: keep
- [x] `packages/plate/src/static/index.ts` — score: 100 — verdict: keep static
      entrypoint — owner: renderer-safe Core static exports — evidence:
      package build/typecheck pass — next: keep
- [x] `packages/plate/src/type.spec.ts` — score: 100 — verdict: keep umbrella
      type/runtime proof — owner: `BaseEditor`, `createBaseEditor`, and
      utility interoperability — evidence: 1/1 row and two assertions pass —
      next: keep

Package file checklist:
- Applies: yes
- Package: Resizable — active
- Manifest command: `rg --files packages/resizable/src | sort`
- Initial row count: 14
- Expected final row count: 5
- Actual final row count: 5
- Checked score-100 count: 5
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: all Resizable rows are score 100 and registry
  status is current.

Package file rows:
- [x] `packages/resizable/src/index.ts` — score: 100 — verdict: keep generated
      root barrel — owner: package exports — evidence: barrel/build and
      consumer typechecks pass — next: keep
- [x] `packages/resizable/src/Resizable.tsx` — score: 100 — verdict: merged
      component-family owner — owner: public wrapper and handle primitive —
      evidence: no hooks remain in component code; live handle drag passes —
      next: keep
- [x] `packages/resizable/src/useResizable.ts` — score: 100 — verdict: merged
      hook/store-family owner — owner: both state/props hook pairs and their
      scoped stores/providers — evidence: no `any` casts, package declarations
      pass, and Media registry consumers compile — next: keep
- [x] `packages/resizable/src/resizeLength.ts` — score: 100 — verdict: merged
      length-algorithm owner — owner: public resize types, conversions, and
      clamps plus private touch narrowing at the hook call site — evidence:
      literal-return bug fixed, percentage contract enforced, tests/docs and
      review pass — next: keep
- [x] `packages/resizable/src/resizeLength.spec.ts` — score: 100 — verdict:
      merged algorithm proof — owner: conversions and all clamp combinations —
      evidence: 8/8 rows and 21 assertions pass — next: keep

Package file checklist:
- Applies: yes
- Package: Selection — active
- Manifest command: `rg --files packages/selection/src | sort`
- Initial row count: 66
- Expected final row count: 17
- Actual final row count: 17
- Checked score-100 count: 17
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: all Selection rows are score 100 and registry
  status is current.

Package file rows:
- [x] `packages/selection/src/index.ts` — score: 100 — verdict: keep generated
      Base barrel — owner: public selection-area option types — evidence:
      package barrel/build and consumer typechecks pass — next: keep
- [x] `packages/selection/src/selectionAreaTypes.ts` — score: 100 — verdict:
      merged public contract owner — owner: selection-area configuration types —
      evidence: immutable-option boundary slow proof passes — next: keep
- [x] `packages/selection/src/internal/SelectionArea.ts` — score: 100 —
      verdict: merged private engine owner — owner: event dispatch, DOM
      selection, geometry, scroll, and trigger behavior — evidence: nine
      engine/helper modules collapsed with focused proof green — next: keep
- [x] `packages/selection/src/internal/SelectionArea.spec.ts` — score: 100 —
      verdict: merged engine proof — owner: drag threshold, scroll, and event
      publication — evidence: 4/4 rows pass — next: keep
- [x] `packages/selection/src/__tests__/testPlugins.ts` — score: 100 — verdict:
      keep reused fixture owner — owner: nested/table schema fixtures shared by
      the plugin family — evidence: multiple navigation and transaction rows
      consume it — next: keep
- [x] `packages/selection/src/react/index.ts` — score: 100 — verdict: keep
      generated React barrel — owner: plugin/component/hook public exports —
      evidence: removed cursor-geometry aliases stay absent — next: keep
- [x] `packages/selection/src/react/BlockMenuPlugin.tsx` — score: 100 —
      verdict: keep plugin owner — owner: menu state, scoped API, and
      API-dependent handlers — evidence: staged capability is genuine; 4/4
      behavior rows pass — next: keep
- [x] `packages/selection/src/react/BlockMenuPlugin.spec.tsx` — score: 100 —
      verdict: keep plugin-family proof — owner: show/hide/context lifecycle —
      evidence: 4/4 rows pass — next: keep
- [x] `packages/selection/src/react/BlockSelectionPlugin.tsx` — score: 100 —
      verdict: consolidated plugin/component owner — owner: state, scoped
      read/API/update, command integration, shortcuts, and the private shadow
      input integration component — evidence: the reverse component import and
      runtime cycle are gone; helper exports remain hard-cut — next: keep
- [x] `packages/selection/src/react/BlockSelectionPlugin.spec.tsx` —
      score: 100 — verdict: merged plugin-family proof — owner: API, commands,
      selection movement, transactions, clipboard, and rollback — evidence:
      prior taxonomy specs merged; test-boundary editor type preserves compiler
      inference — next: keep
- [x] `packages/selection/src/react/CursorOverlayPlugin.tsx` — score: 100 —
      verdict: narrowed plugin owner — owner: cursor state, scoped API, and
      editor event integration — evidence: generic geometry removed to
      `@platejs/cursor`; read-only rendering preserved — next: keep
- [x] `packages/selection/src/react/CursorOverlayPlugin.spec.tsx` — score: 100 —
      verdict: keep plugin-family proof — owner: cursor state/event behavior —
      evidence: focused rows pass — next: keep
- [x] `packages/selection/src/react/internal/useCursorOverlayPlugin.ts` —
      score: 100 — verdict: keep private hook-family owner — owner:
      block-selection-driven cursor cleanup — evidence: hook definition is
      outside plugin code and not publicly barreled — next: keep
- [x] `packages/selection/src/react/useBlockSelection.ts` — score: 100 —
      verdict: merged public hook-family owner — owner: selectable/selected
      state, fragments, and aggregate selection state —
      evidence: one public block-selection hook family replaces the former
      taxonomy — next: keep
- [x] `packages/selection/src/react/useSelectionArea.ts` — score: 100 —
      verdict: keep independent lifecycle hook family — owner: SelectionArea
      mount, DOM event bridge, and immutable option materialization — evidence:
      splitting this hook from the block hooks removes the plugin/hook runtime
      cycle while keeping hook code outside the plugin owner — next: keep
- [x] `packages/selection/src/react/useBlockSelection.spec.tsx` — score: 100 —
      verdict: merged hook-family proof — owner: selectable props, fragments,
      and aggregate state — evidence: 3/3 rows pass — next: keep
- [x] `packages/selection/src/react/useBlockSelection.slow.tsx` — score: 100 —
      verdict: keep lifecycle proof — owner: selection-engine mount and
      immutable option materialization — evidence: explicit 2/2 rows exercise
      the independent `useSelectionArea` owner — next: keep

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| dnd | 0 | 17 | none | v1-v17 | yes | 28 fast + 4 slow; typecheck; lint; barrel; topology scans; clean autoreview | sha256:39ce75639b68fd47a7da9ad8cb32cfac59c819b3735c8c83c74f08399559b162 | current |
| docx | 0 | 17 | none | v1-v17 | yes | 13 fast + 5 slow; typecheck; lint; barrel; topology/export scans; clean autoreview | sha256:16b0960105668dd20294685083a39ca599abd58c3f0cfadb5d94667c4238e5a5 | current |
| docx-io | 0 | 17 | none | v1-v17 | yes | 87 fast + 36 slow + 5 app roundtrip; typecheck; lint; barrel; import/cycle/export scans; clean final autoreview | sha256:f8997ddc886a60fc6559445669d19423079703b9ecf26dbb77c0e94b50354cdf | current |
| emoji | 0 | 17 | none | v1-v17 | yes | 23 tests; package build/typecheck/lint/barrel/topology; full www typecheck; live demo; two-pass autoreview | sha256:671bdb87a7988131c2350e6b3bc474bd57cd4de83df5b3095dfb5fcbb28b9543 | current |
| excalidraw | 0 | 17 | none | v1-v17 | yes | 8 tests; package build/typecheck/lint/barrel; full www typecheck; live demo; two-pass final autoreview | sha256:a9cd2e7fa449539a92dcb627649a2854cb3f73a42435416b41c4dfef788bf163 | current |
| floating | 0 | 17 | none | v1-v17 | yes | 25 tests; build/typecheck/barrel/Biome; Link + full www typecheck; live toolbar demo; final autoreview | sha256:384424236b7163d4afd05b1b0c7bf0b5150403eab4553ea38c4f4fd3c4b7d5d4 | current |
| indent | 0 | 17 | none | v1-v17 | yes | 10 tests; build/typecheck/barrel/Biome; List + Toggle + full www typecheck; live toolbar demo; clean autoreview | sha256:c877d05662a458b5d4ec82bc4d74204841bfdeec9eeebc511dd3349e8a5a3a4a | current |
| juice | 0 | 17 | none | v1-v17 | yes | 2 package tests + 1 DOCX integration; build/typecheck/barrel/Biome; clean autoreview | sha256:3d5de788ff4fb5df8cec6a7f87139691322e2888b8dbb879c92ce0332b4c8904 | current |
| math | 0 | 17 | none | v1-v17 | yes | 16 tests; build/typecheck/barrel/Biome; full www typecheck; EN/CN docs; live equation edit; clean autoreview | sha256:938d92d9c495ad614d569f12c6a93260ed7c107fb3a9ab34476bac94ad44d9df | current |
| mention | 0 | 17 | none | v1-v17 | yes | 10 tests; build/typecheck/barrel/Biome; full www typecheck; EN/CN docs; live render; two-pass autoreview | sha256:90ee0df32bb14f92afa57cd75d798ac271ac71b3cfb5726531cf2a1069bdd8b9 | current |
| plate | 0 | 17 | none | v1-v17 | yes | 1 test; build/typecheck/Biome; clean autoreview | sha256:737c67959a4197b1e2dc1a89ea2d6d0941a0e6009a4c63e3a1fbda514adf49d9 | current |
| resizable | 0 | 17 | none | v1-v17 | yes | 8 tests; build/typecheck/barrel/Biome; Media/Table/www typechecks; live drag; two-pass autoreview | sha256:dbe763dd988cbc9fdcb249f0c384402bb993c76a1a06acfe6a2dec94cfd18615 | current |
| selection | 0 | 17 | none | v1-v17 | yes | 80 fast + 2 slow; Cursor 14; build/typecheck/barrel/Biome; www/docs; two live demos; final review repaired standalone CursorOverlay integration and direct export chain | sha256:403839df8202d5d61e9b89309b240180d31947737a805bcd10c1f8a1a2c8ff0c | current |
| slash-command | 0 | 17 | none | v1-v17 | yes | 3 tests; build/typecheck/barrel/Biome; full www typecheck; live trigger; two-pass autoreview | sha256:d54532f3e718a2e5fee206ad900992355117cb7f5d471532e3709d88e6276ea1 | current |
| tabbable | 0 | 17 | none | v1-v17 | yes | 12 tests; build/typecheck/barrel/Biome; full www/docs; live render; two-pass review | sha256:e2f389c1c5c093f7b255796b188c76ae6f3f031482a2a9c9f4df61275a453086 | current |
| tag | 0 | 17 | none | v1-v17 | yes | 10 Tag + 29 NodeId rows; build/typecheck/barrel/Biome; full www/docs; live keyboard insert; constructor-owned read/update plus one dependent read stage | sha256:b36cb76d2fb7aa34c3dd92e1fa3e3befb9d5dae73910e5372a19c3f25d90725f | current |
| test-utils | 0 | 17 | none | v1-v17 | yes | 9 tests; build/typecheck/barrel/Biome; consumer compile through Core/package graph; clean review | sha256:4ab82a50f1e70245a4c6a8a99c8c2c942e291628544b8eb42584f1ba0753907a | current |
| find-replace | 7 | 17 | changed | v8-v17 | yes | 8 tests; build/typecheck/barrel/Biome; EN/CN docs; full www typecheck; live search; clean batch review | sha256:8a77d766272d13eff49bb64ae5f3aa487439090dc4948eaf2155e1bf9dc9f9f2 | current |
| link | 7 | 17 | changed | v8-v17 | yes | package tests/build/typecheck/barrel/Biome; live floating-link controls; clean batch review | sha256:28386ced98814317741ea69e02fd0cb48acb446a0cafa738532688fe0992afcd | current |
| list-classic | 7 | 17 | changed | v8-v17 | yes | package tests/build/typecheck/barrel/Biome; topology audit; clean batch review | sha256:34d8d9bb337dfe416e31a95158fdb6f109e7ae3d829ac3afd655d1ad0bfa2439 | current |
| media | 7 | 17 | changed | v8-v17 | yes | 82 tests; typecheck/Biome; live media render/selection; shared URL-policy insertion and rejected-image fallback regressions; clean final review | sha256:cb5fbc23db4e28d04c1de5a59742e2bc279615d73fa66014f0c2d481d95c0564 | current |
| suggestion | 7 | 17 | changed | v8-v17 | yes | package tests plus AI typecheck; build/barrel/Biome; live suggestion popover; clean batch review | sha256:496a102eecc437c5be89ff83beddc3c11cdbf2a6381bc73bdf933813e330e447 | current |
| table | 7 | 17 | changed | v8-v17 | yes | 234 fast + 155 slow; typecheck/Biome; clipboard export-projection/range/node-copy regressions; live cell toolbar; clean final review | sha256:cd0063d1b0bcada4c549ebca6722644e62754e73487cef0dfe370142a913a6e8 | current |
| ai | 11 | 17 | changed | v12-v17 | yes | 26-file package fingerprint; 65 fast + 19 slow; build/typecheck/lint/barrel/Biome; app integration; docs parity; live AI demo; final fence regression review | sha256:5fdf26155aaf2d1217e972ad8eb855add06791a1cdcbd036653eb21c708e4c2e | current |
| code-block | 12 | 17 | changed | v13-v17 | yes | 11-file package fingerprint; 68 tests in two owner-family specs; typecheck/Biome; live highlighted demo; clean final review | sha256:f91fab069efa16a4c3c03dbe3a79a20e45afa6f1c2f9ac20559efa457355e4e7 | current |
| footnote | 12 | 17 | changed | v13-v17 | yes | 10-file package fingerprint; 33 tests in Base/React family specs; build/typecheck/lint/barrel/Biome; schema integration; live demo; clean autoreview | sha256:84b53c29f87ea63a9c2e3e20fc5e9f846c2cd79abc184c65e73c23149e4f28b1 | current |
| layout | 12 | 17 | changed | v13-v17 | yes | 10-file package fingerprint; 22 tests in one Base owner-family spec; build/typecheck/lint/barrel/Biome; live columns demo; clean autoreview | sha256:081be6e4c33fc031412cffa661c814a4316cfbe60f931f069601037f693094d3 | current |
| list | 12 | 17 | changed | v13-v17 | yes | 14-file package fingerprint; 51 fast + 63 slow tests; build/typecheck/lint/barrel/Biome; live playground; clean autoreview | sha256:bafa0444d493179e3e00efd96b14212275185e871052e02d0eaf40191fd1a7c5 | current |
| toc | 12 | 17 | changed | v13-v17 | yes | 11-file package fingerprint; 15 tests in Base/React families; build/typecheck/lint/barrel/Biome; clean docs route; clean autoreview | sha256:33008bee7ff64e7748c1415ad42729c79f899d1bf5ac4ec341bffb20c9cff639 | current |
| toggle | 12 | 17 | changed | v13-v17 | yes | 12-file package fingerprint; 15 tests; typecheck/Biome; configured-type Enter/toolbar regression; terminal configure inference contract; clean final review | sha256:9dd05b9630746e0c420d02b0880255df14a2f2102608c5713ccf5cdbda5913f9 | current |
| basic-nodes | 13 | 17 | changed | v14-v17 | yes | 18-file package fingerprint; 57 tests in five owner-family specs; build/typecheck/lint/barrel/Biome; clean live basic-marks editor; clean autoreview | sha256:8c31d76e003f7b6eafc1d7b8dc39ed53f7db7a9dc538383d2a4f9946be69cfb6 | current |
| basic-styles | 13 | 17 | changed | v14-v17 | yes | 9-file package fingerprint; 36 tests in one owner-family spec; build/typecheck/lint/barrel/Biome; clean live font editor; clean autoreview | sha256:c72fdd1a89d036a76096ab2b3814b91e48d4ac7c040477d81316a12a93d88260 | current |
| callout | 13 | 17 | matches | v14-v17 | no | 4 tests; artifact build/lint/Biome; live docs; clean autoreview; source-first typecheck blocked by unrelated Utils declaration WIP | sha256:2c8ef015f1186bd0335b2d3c36fbb18bfff30818b9956d9b941aae161471964a | current |
| code-drawing | 13 | 17 | matches | v14-v17 | yes | 14-file package fingerprint; 13 tests; build/typecheck/lint/barrel/Biome; repaired live demo; clean autoreview | sha256:8a35bc231e4666aa8da66c911df02c4ee0d3a86509c4da09dcbae8ec00a70ecf | current |
| combobox | 13 | 17 | changed | v14-v17 | no | 12-file package fingerprint; 42 tests; build/typecheck/lint/Biome; clean live docs; clean autoreview | sha256:0462f8d72a0828377dfa0fde9858041d49e2d282f8a37b902332af096408ac82 | current |
| comment | 16 | 17 | changed | v17 | no | 12-file package fingerprint; 13 tests; build/typecheck/lint/Biome; clean live docs; clean autoreview | sha256:805268dd7388a547ed3481ab7a2bbf6d4a9970949d2657bd3893c307d36d84d6 | current |
| csv | 16 | 17 | changed | v17 | yes | 8-file package fingerprint; 8 fast + 1 ESM test; build/typecheck/lint/Biome; clean live docs; clean autoreview | sha256:26f52ed1687eb4c734921b9027b1481665efbcfc6238b4abf5d81dc64c5f009e | current |
| cursor | 16 | 17 | matches | v17 | no | 10-file fingerprint; 14 tests; build/typecheck/lint/barrel/Biome; clean live docs; two-pass review | sha256:da28b1074db027d956d2b69971f8ab79d357e4a5e00e705f419de91125f3d2cd | current |
| date | 16 | 17 | matches | v17 | no | 11-file package fingerprint; 17 tests; build/typecheck/lint/Biome; clean live docs; clean autoreview | sha256:51a842375b52d74cebf213bd78c11d8b7e8c00b3cbfe7f29fbc26e3ebdfe7a13 | current |
| diff | 16 | 17 | matches | v17 | no | 10-file fingerprint; 37 tests; typecheck/Biome; ordinary DOM clipboard export-projection regression; clean final review | sha256:5366f3ebeab88dc1503707ac337244518dc3ef388b451f8a39957f04af9aa099 | current |
| markdown | 16 | 17 | matches | v17 | yes | 81-file fingerprint; 201 fast + 32 slow; 79 AI/app integration rows; build/typecheck/lint/barrel/Biome; docs/browser; final review | sha256:17bc1e41b0d3394a8b4619f6b86bfa84ac2aa7d3d5bf8760411e2c65046f3203 | current |
| yjs | 0 | 17 | none | v1-v17 | yes | 216 fast tests; 75/77 unchanged slow-runtime rows; typecheck/Biome; two-editor live sync; clean final review | sha256:52133cd9c9ddfc2c2ca129357974d6b369872f304d53048f1bf22bfc5d5c9ad8 | current |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Dnd | `packages/dnd` | implementation-kind folders and one-file-per-hook/test fragmentation | 36-file manifest, package proof, autoreview | collapsed to 10 files; attested v17 | Docx |
| Docx | `packages/docx` | 42 utility/test modules and 30 cleaner exports for one parser/cleaner family | 22-file final manifest, consumer census, package proof, autoreview | collapsed to five TypeScript owner/proof files; attested v17 | Docx IO |
| Docx IO | `packages/docx-io` | helper taxonomy, public transport helpers, one-use utilities, and a renderer cycle around a real OOXML engine | 59-file initial/41-file final manifest, import graph, 128 package/app tests, typecheck, two-pass autoreview | private import pipeline colocated; marker-free comment points; renderer cycle cut; distinct OOXML parts preserved; attested v17 | Emoji |
| Emoji | `packages/emoji` | 10 taxonomy folders, one-file-per-class/types, and split subcomponent hook/storage/observer helpers | 44-file initial/12-file final manifest, 23 tests, build/typecheck/lint/barrels, full www typecheck, live demo, two-pass autoreview | collapsed to four production family owners plus React descriptor; honest optional grid lookup adopted; attested v17 | Excalidraw |
| Excalidraw | `packages/excalidraw` | one-use transform/types folders, split hook family, incomplete element schema, and unsafe external persistence | 14-file initial/8-file final manifest, 8 tests, build/typecheck/lint/barrels, full www typecheck, live demo, two final autoreviews | insertion/types merged into Base owner; hook family flattened; persisted width and JSON payload contract repaired; attested v17 | Floating |
| Floating | `packages/floating` | geometry split one function per file across taxonomy folders and a fragmented hook family | 24-file initial/6-file final manifest, 25 tests, build/typecheck/barrel/Biome, Link + full www typecheck, live demo, final autoreview | one flat geometry owner, one hook-family owner, and one dependency facade; exports preserved; attested v17 | Indent |
| Indent | `packages/indent` | one-use plugin helpers, split runtime specs, split button hooks, and a hook taxonomy folder | 9-file initial/7-file final manifest, 10 tests, build/typecheck/barrel/Biome, List/Toggle/www typechecks, live demo, clean autoreview | parser/query inline; one behavior spec; one flat hook family; justified shortcut capability stage; attested v17 | Juice |
| Juice | `packages/juice` | possible over-splitting in a tiny parser-only package | 4-file initial/final manifest, 2 package tests, DOCX integration row, build/typecheck/barrel/Biome, clean autoreview | keep unchanged: plugin, spec, and generated barrels are the honest minimum; attested v17 | Math |
| Math | `packages/math` | exported tx helpers, split block/inline twins, rule and utility modules, hook taxonomy, and one hook per file | 23-file initial/8-file final manifest, 16 tests, build/typecheck/barrel/Biome, full www typecheck, EN/CN docs, live edit, clean autoreview | one Base family, one React descriptor family, one hook family; direct transform helpers hard-cut to scoped updates; attested v17 | Mention |
| Mention | `packages/mention` | one-type file, unsafe public item key, and ignored search text in a persisted command | 7-file initial/6-file final manifest, 10 tests, build/typecheck/barrel/Biome, full www typecheck, EN/CN docs, live render, final Codex review | public item type merged and made generic-safe; fake search field removed; trigger runtime covered; attested v17 | Plate |
| Plate | `packages/plate` | possible unnecessary indirection in the umbrella package | 4-file initial/final manifest, 1 test, build/typecheck/Biome, clean autoreview | keep unchanged: three entrypoints plus one interoperability proof are the honest minimum; attested v17 | Resizable |
| Resizable | `packages/resizable` | separate component, store, type, utility, helper, and one-spec-per-function files for one resize family | 14-file initial/5-file final manifest, 8 tests, build/typecheck/barrel/Biome, Media/Table/www typechecks, live drag, two-pass review | one component family, one hook/store family, one algorithm family; dead option/helper hard-cut; relative and clamp types repaired; attested v17 | Selection |
| Selection | `packages/selection` | duplicated Cursor geometry plus engine/utils/query/hook/component/spec taxonomy around three plugin families | 66-file initial/17-file final manifest, 79 fast + 2 slow + 13 Cursor tests, package/app/docs gates, two live demos, two-pass review | one private selection engine, one block hook family, one component owner, three plugin families; generic cursor ownership moved to `@platejs/cursor`; attested v17 | Slash Command |
| Slash Command | `packages/slash-command` | possible indirection in a tiny Base/React plugin family | 6-file initial/final source manifest, 3 tests, build/typecheck/barrel/Biome, full www typecheck, live trigger, two-pass autoreview | keep the owner family intact; retain the generic extension adapter because it preserves consumer inference and the typed state owner because the exported runtime contract must govern defaults; attested v17 | Tabbable |
| Tabbable | `packages/tabbable` | split public types, duplicate path comparison, and one behavior spec per method family | 9-file initial/7-file final source manifest, 12 tests, build/typecheck/barrel/Biome, full www/docs, live render, two-pass review | types merged into Base owner, behavior proof merged, standard path primitives used, render component kept separate; attested v17 | Tag |
| Tag | `packages/tag` | split hook family/specs, unstaged dependent reads, stale root API docs, and schema-unsafe UI metadata persistence | 10-file initial/6-file final source manifest, 10 Tag + 29 NodeId rows, package/Core/www/docs/browser proof, two-pass review | staged plugin reads/updates, one hook-family owner, one Base spec, value-only persisted tags; fixed NodeId inline-insert policy at Core owner; attested v17 | Test Utils |
| Test Utils | `packages/test-utils` | one unused DOM wrapper and a one-use public map alias | 6-file initial/5-file final source manifest, 9 tests, build/typecheck/barrel/Biome, consumer graph, clean review | delete unused `getHtmlDocument`; inline the map type; keep clipboard and hyperscript as distinct owners; attested v17 | Yjs |
| Yjs | `packages/yjs` | a 606-line React hook implementation lived in the barrel, plus a document-only text-delta helper file | 29-file initial/28-file final production manifest, 215 tests, build/typecheck/Biome, two-editor live sync, two-pass autoreview | move the complete hook family to `useYjs.ts`; inline text-delta helpers into the document owner; preserve distinct collaboration-engine subsystems; attested v17 | Find Replace |
| Find Replace | `packages/find-replace` | stale docs treated mutable search state as immutable configuration | 4-file source manifest, 8 tests, package/www proof, live search, clean review | keep the minimal plugin family; repair EN/CN state/API docs; attested v17 | Link |
| Link | `packages/link` | split floating-link subcomponent hooks, repeated autolink reads, repeated end-of-link mutations, and method-level spec files | 12-file source manifest, package/app/browser proof, clean review | one floating-link hook family, staged read/update capabilities, behavior-family specs; attested v17 | List Classic |
| List Classic | `packages/list-classic` | possible remaining plugin-helper fragmentation after the large colocation cut | 10-file source manifest, package proof, topology audit, clean review | keep the maintenance-only runtime owner, two genuine hook families, and real dependent stages; attested v17 | Media |
| Media | `packages/media` | hooks in component files, one-file trivial descriptors, and split FloatingMedia/Image families | 38-file source manifest, package/app/browser proof, clean review | separate store/hook/component family owners; merge trivial Base media descriptors; keep reused cross-plugin insertion and media algorithms; attested v17 | Suggestion |
| Suggestion | `packages/suggestion` | standalone diff transform/type files and method-level fast spec shards | 7-file source manifest, package/AI/app/browser proof, clean review | plugin-owned `api.diff`, types in Base owner, one fast behavior spec plus one slow lane; attested v17 | Table |
| Table | `packages/table` | shared writes reintroduced an editor-threading paste helper after prior staged cleanup | 50-file source manifest, package/app/browser proof, helper/stage audit, clean review | capture paste-source state in the final plugin stage; keep reused grid/mutation/paste/selection algorithm owners and behavior-family tests; attested v17 | AI |
| AI | `packages/ai` | standalone one-owner text helpers, fragmented hook/test families, and a range helper briefly placed on the React chat owner | 26-file package fingerprint, package/app/docs/browser proof, three-pass autoreview | own text-range lookup on headless `BaseAIPlugin`; keep `AIChatPlugin` React orchestration cycle-free; merge Copilot and chat hook/test families; document the real chat adapter; attested v17 | Code Block |
| Code Block | `packages/code-block` | vendored single-owner grammar helper exported publicly and nine method-level test shards | 11-file package fingerprint, 68 tests, build/typecheck/lint/barrel/Biome, live syntax-highlighted demo, two-pass autoreview | internalize Python stabilization in the Base owner; preserve public `CodeBlockRules`; keep typed shortcut/Lowlight stages; consolidate proof into one Base and one React family; attested v17 | Footnote |
| Footnote | `packages/footnote` | three tiny Base descriptor/type shards, three trivial React wrappers, and five behavior-spec shards | 10-file package fingerprint, 33 tests, build/typecheck/lint/barrel/Biome, schema integration, live footnote demo, clean autoreview | one Base owner, one React owner, and separate Base/React proof families; preserve headless navigation fallback and public names; attested v17 | Layout |
| Layout | `packages/layout` | split schema/update proof files around one already-coherent Base owner | 10-file package fingerprint, 22 tests, build/typecheck/lint/barrel/Biome, live columns demo, clean autoreview | merge Base proof into one owner-family spec; keep the public reused debounce hook separate and retain the typed shortcut stage; attested v17 | List |
| List | `packages/list` | possible residual helper/threading drift after the read-capability hard cut | 14-file package fingerprint, 51 fast + 63 slow tests, build/typecheck/lint/barrel/Biome, live playground, clean autoreview | keep the single Base runtime owner, genuine typed dependency stages, two distinct public hook families, one fast family and one slow proof lane; attested v17 | Toc |
| Toc | `packages/toc` | one-use state declaration, isolated public type file, method-level Base specs, and stale React plugin mocks | 11-file package fingerprint, 15 tests, build/typecheck/lint/barrel/Biome, clean docs route, clean autoreview | inline typed state, own Heading in Base, merge Base proof, retain one React hook-family owner, and repair NavigationFeedback mocks; attested v17 | Toggle |
| Toggle | `packages/toggle` | two one-use state declarations and a public render wrapper used only by the plugin | 12-file package fingerprint, 14 tests, build/typecheck/lint/barrel/Biome, clean live docs editor, clean autoreview | inline state; inline hidden-child rendering in the typed selector-consuming stage; keep named hooks in `useToggle`; hard-cut the render export; attested v17 | Basic Nodes |
| Basic Nodes | `packages/basic-nodes` | one tiny file per mark/block/React descriptor plus per-method input-rule specs | 18-file package fingerprint, 57 tests, build/typecheck/lint/barrel/Biome, clean live basic-marks editor, clean autoreview | collapse to Base block/heading/mark families, one React descriptor family, five owner-family specs, and retain the genuine v54 migration boundary; attested v17 | Basic Styles |
| Basic Styles | `packages/basic-styles` | one 30-95 line file per style plugin, four trivial React wrappers, and ten spec shards | 9-file package fingerprint, 36 tests, build/typecheck/lint/barrel/Biome, clean live font editor, clean autoreview | collapse all style descriptors and public utility into one Base family, one React descriptor family, and one behavior-family spec; preserve public names; attested v17 | Callout |
| Callout | `packages/callout` | possible over-splitting in a tiny Base/React/hook family | 11-file package fingerprint, 3 fast + 1 slow tests, artifact build/lint/Biome, clean live docs, clean autoreview | keep unchanged: shared storage key is reused across Base and hook owners; public insert options belong to Base; hook and slow proof are genuine React owners; attested v17 | Code Drawing |
| Code Drawing | `packages/code-drawing` plus package demo | plugin-owned constants isolated from Base owner; demo duplicates plugin already present in EditorKit | 14-file package fingerprint, 13 tests, build/typecheck/lint/barrel/Biome, clean live docs, clean autoreview | move enums/defaults into Base owner; keep reusable renderer/download browser owners; remove duplicate demo registration; attested v17 | Combobox |
| Combobox | `packages/combobox` | possible over-splitting across one extension, one filter, and one hook family | 12-file package fingerprint, 42 tests, build/typecheck/lint/Biome, clean live docs, clean autoreview | keep unchanged: generic extension, public filter algorithm, and React hook family are three honest reusable owners; attested v17 | Comment |
| Comment | `packages/comment` | possible residual split after earlier utility-family colocation | 12-file package fingerprint, 13 tests, build/typecheck/lint/Biome, clean live docs, clean autoreview | keep one Base runtime owner, one public reusable comment-mark metadata family, one React hook family, and their distinct proof owners; attested v17 | CSV |
| CSV | `packages/csv` | one-use state declaration and codec consuming a same-object plugin API | 8-file package fingerprint, 8 fast + 1 ESM test, build/typecheck/lint/Biome, clean live docs, clean autoreview | inline typed state factory; stage codecs after `api.deserialize`; retain one Base owner and genuine release-artifact proof; attested v17 | Cursor |
| Cursor | `packages/cursor` | possible component/hook/geometry/type over-split plus stale Range-keyed geometry cache | 10-file package fingerprint, 14 tests, build/typecheck/lint/barrel/Biome, clean live docs, two-pass review | keep the distinct component, hook, geometry, and public type owners; invalidate cached rectangles when `minSelectionWidth` changes; attested v17 | Date |
| Date | `packages/date` | possible split between a tiny plugin and date-value utility | 11-file package fingerprint, 17 tests, build/typecheck/lint/Biome, clean live docs, clean autoreview | keep unchanged: Markdown and registry consumers justify the public date-value algorithm owner; Base and trivial React descriptor remain separate; attested v17 | Diff |
| Diff | `packages/diff` | a 20-line public type shard split from its sole algorithm owner | 10-file package fingerprint, 37 tests, build/typecheck/lint/barrel/Biome, clean version-history docs, clean autoreview | merge public diff types into `computeDiff`; preserve the independent fragment-extension owner; attested v17 | Markdown |
| Markdown | `packages/markdown` plus AI/app/docs consumers | four internal orchestration shards, duplicate editor-bound helper APIs, and a deep inferred root capability | 81-file package fingerprint, 201 fast + 32 slow package tests, 79 app/AI integration rows, build/typecheck/lint/barrel/Biome, docs parity, clean live docs, final review | consolidate orchestration in one conversion owner; expose only `editor.api.markdown.{serialize,deserialize,deserializeInline}`; hard-cut duplicate editor-bound wrappers; keep distinct conversion algorithms and `serializeInlineMd`; repair AI streaming/NodeId integration; attested v17 | Complete |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| all package-local moved/new owner files | merge-existing-owner | checked through each before/after manifest and import/export census | keep only owner-first replacements recorded in the packet ledger; 0 unresolved extracted files | 42 closed manifests, barrels, package builds, and exact source fingerprints |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none current | the shared Plite/Core capability owner closed its transient generic-contract failures during final proof | Core source/tests/declaration contracts now pass; no compatibility patch remains in a feature package | none |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| whole-www typecheck diagnostics | Core editor construction, Docx IO generic boundary, and unrelated registry demos | package, docs parity, Browser, and 45-package Core typechecks isolate these from the synced package surfaces | existing Core/Docx/www owners |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | all 42 tracked packages reviewed; one-use production helpers/components/hooks/types merged into honest owners; staged plugin capabilities preserved only for typed dependencies; Markdown root service hard-cut; Core constructor returns made declaration-portable |
| tests/proof | package test families colocated; regressions added for Cursor cache, standalone CursorOverlay, AI fence closure, Copilot NodeId, clipboard export projection, Media URL policy, configured Toggle types, schemas, declaration portability, and temporal descriptor/editor lineage; `check:core` audits 4,066 source/docs files and Core source/tests/contracts pass |
| docs/templates/skills | Plate Next v17 source and generated skill synced; package registry versioned; EN/CN API docs and package changesets aligned; CI-owned templates untouched |
| reverted/quarantined packets | none; every accepted packet is attested, 0 unresolved extracted/deferred rows |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| P2 | Yjs slow runtime | named-root import records snapshot reconciliation and structural seed 131 converges to a different deterministic value; both controller/test owners are unchanged by this packet | `packages/yjs/test/{remote-import-contract,structural-soak-contract}.slow.ts` | repair as a dedicated Yjs runtime packet; do not rewrite expectations during colocation |

Findings:
- The doctrine source contains a reusable state-contract rule absent from the
  immutable v16 fingerprint. `version.mjs validate`, `status`, and `check all`
  correctly refuse to run until a new version is appended.
- The validated registry has 42 active packages: 18 at v0, 6 at v7, 1 at v11,
  6 at v12, 5 at v13, and 6 at v16.
- After v17, all 42 are stale: 18 are unattested, 18 have changed source and
  require full review, and 6 have unchanged source and require only missing
  migration checks plus proof.
- `core`, `plite`, and `utils` are explicit base packages in `check:core`.
  Yjs is a hybrid Plite integration but also exports Base/React Plate
  descriptors, so it is now enrolled as a reviewed feature package.

Decisions and tradeoffs:
- Treat the state-contract doctrine drift as v17, never rewrite v16 -> preserves
  immutable migration history.
- Process oldest applied version first and one package at a time -> follows the
  sync contract and prevents fake bulk attestations.
- Keep Core/Utils outside full feature-package review -> they already have a
  different base-gate owner; edit them only for an actual shared owner defect.
- Enroll Yjs in both the version registry and `check:core` -> its existing
  Plite checks prove collaboration substrate, while Plate Next must still own
  its exported plugin topology and inference.
- Keep Docx IO's OOXML schema files separate despite single assembly consumers
  -> each owns a distinct zipped document/relationship part; flattening them
  into the assembler would erase a real file-format boundary.
- Accept the Docx IO review P3 and return `DocxComment.references: Point[]`
  with marker-free nodes -> preserves comment positions without resurrecting
  public token-format helpers.
- Keep `Grid.section()` optional and adopt the app caller instead of restoring
  its historical non-null assertion -> the model exposes lookup reality while
  mapped callers consume the section they already have.
- Keep the picker hook/storage/observer/floating-library family in one hook
  owner, separate from `EmojiPlugin.tsx` -> hooks do not belong in plugin
  descriptor files, and the former helpers have no independent lifecycle.
- Keep Excalidraw's React hook outside the plugin descriptor but merge its
  public prop type and tests into the hook-family owner -> one coherent React
  behavior boundary without a `hooks/` taxonomy.
- Normalize Excalidraw's external `onChange` payload through JSON at the
  persistence boundary -> imported UI state contains `undefined` and Maps,
  while editor node properties intentionally require strict JSON.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Dnd focused Bun command run from package cwd skipped root preloads | 1 | run from repository root | 28/28 pass |
| Dnd slow filename lacked explicit `./` path | 1 | use Bun path form | 4/4 pass |
| Docx Codex autoreview exceeded the 1 MiB local bundle limit | 1 | use the runner's Claude engine, which accepts the bundle | first pass found one P3; second pass clean |
| Docx IO slow suite retained deleted preprocessing import | 1 | route fixtures through `DocxIOPlugin.api.import` | 36/36 slow package rows pass |
| Docx IO app roundtrip used browser-only Mammoth input shape under Bun | 1 | pass both external Mammoth `buffer` and `arrayBuffer` keys without a cast | 5/5 app roundtrips pass |
| Docx IO comment regression test reset the cleaner implementation | 1 | clear calls while preserving the mock implementation | focused import proof 3/3 passes |
| Docx IO marker removal tried to mutate frozen decoded leaves | 1 | immutably rebuild changed leaves and their ancestors while recording points | focused import proof and final autoreview clean |
| Docx IO first autoreview found private markers leaking through public nodes | 1 | add `DocxComment.references`, strip markers, inline preprocessing into plugin owner, adopt public API in integration proof | second autoreview clean |
| Emoji package typecheck did not cover one registry caller of optional `Grid.section()` | 1 | consume the section already yielded by `sections()` and run full www typecheck plus Browser proof | www typecheck and live Food category scroll pass |
| Emoji first autoreview found an undocumented removed public type | 1 | document `EmojiInputConfig` and its direct `InferConfig` replacement | second autoreview clean |
| Excalidraw app transform typed the whole generic editor as `MyEditor` | 1 | scope the typed capability only around the active transaction | `editor.plugin(BaseExcalidrawPlugin).editor.update` preserves broad callers and infers `tx.excalidraw` |
| Excalidraw live demo installed the descriptor twice | 2 | let `EditorKit` own its already-configured `ExcalidrawKit`; reapply after a shared writer restored the old file | fresh Browser tab renders one canvas with zero errors |
| Excalidraw persisted `onChange` data preserved `undefined` fields | 1 | normalize the external payload before strict editor JSON publication and assert the saved value | hook proof passes and fresh Browser tab logs zero errors |
| Scoped `pnpm lint:fix` wrapper ignored its paths and checked the whole checkout | 1 | use direct `pnpm exec biome check --write <scope>` | Excalidraw's 13 scoped files clean; unrelated diagnostics remain outside this packet |
| Floating merged hook spec mocked all of `@udecode/utils`, polluting geometry proof | 1 | use real dependencies and mock only the local Floating UI facade | 25/25 package tests pass |
| Floating hook test inferred an incompatible generic `Value` through `ReturnType<typeof createPlateEditor>` | 1 | type the test boundary as `PlateEditor` and keep production inference untouched | source-first typecheck and 25/25 tests pass |
| Floating autoreview reported an unstaged snapshot | 1 | reject the staging-only finding because this task has no add/commit authority; review the verified working tree | code review clean at confidence 0.85 |
| Indent moved shortcuts into the constructor before update capability existed | 1 | retain one ordered stage because shortcut inference consumes generated update methods | package declaration build and clean review confirm the stage |
| Indent first staged edit omitted one closing object brace | 1 | repair the exact syntax and rerun the full package gates | 10/10 tests, typecheck, and build pass |
| Juice integration helper was invoked without a runnable spec owner | 2 | run an actual representative `.slow.tsx` consumer row with explicit `./` path | DOCX inline-formatting integration 1/1 passes |
| Math inline boundary regexes were moved into the rule callback | 1 | retain top-level compiled regex constants required by the performance gate | scoped Biome passes without reintroducing helper functions |
| Math Browser first click selected the inline void without opening its editor | 1 | click the selected equation again, then target the visible `E = mc^2` textarea | expression re-renders as exponent 3 with zero errors |
| Mention Browser text injection bypassed the native insert-text command path | 4 | prove the exact trigger transaction at package level and use Browser for rendered-node/error proof | new `@` transient-input row passes; live demo renders mention nodes with zero errors |
| Mention first autoreview found stale CN search docs and an undocumented key narrowing | 1 | remove the CN field, use `TKey = unknown`, and document the generic | final Codex review clean |
| Mention Claude confirmation review hit its session limit | 1 | rerun the same narrow bundle through the Codex engine | final review clean at confidence 0.83 |
| Resizable declaration build exposed a non-portable `csstype` width inference | 1 | own the store width as a portable `number \| string` state contract | package build/typecheck pass without `any` |
| Resizable literal-preserving clamp generic made changed results type as the input literal | 1 | replace it with number/percentage-string overloads | focused proof and all consumers pass |
| Resizable first autoreview found the old arbitrary-string type in EN docs | 1 | document the percentage template contract exactly | confirmation review clean at confidence 0.89 |
| Final AI review found the Copilot renderer still read `element.id` | 1 | resolve the configured NodeId property through `editor.read.schema` and add a `_id` regression | focused test, Browser demo, and confirmation review clean |
| Final Core review found local descriptor bindings bypassed the extend-stage allowlist | 1 | follow locally created descriptor bindings through the AST | checker regression and full 4,066-file audit pass |
| Core confirmation found computed `Base['extend']` syntax bypassed the audit | 1 | resolve static computed members and reject dynamic computed calls on locally created descriptors | 27/27 checker tests and full source audit pass |
| Core confirmation found optional builder calls used different AST node types | 1 | reject optional plugin-authoring calls on locally created descriptors and cover creator aliases plus later assignments | 27/27 checker tests and full source audit pass |
| Core confirmation found extracted `.extend` methods bypassed call-site analysis | 1 | reject property extraction and destructuring from locally created descriptors | 27/27 checker tests and full source audit pass |
| Core confirmation found factory-value aliases and namespace calls were not resolved | 1 | resolve imported, local, reassigned, destructured, and namespace-qualified plugin creators before classifying descriptors | 27/27 checker tests and full source audit pass |
| Core confirmation found computed object-pattern extraction bypassed direct-key checks | 1 | reject computed and rest destructuring from locally created plugin descriptors | 27/27 checker tests and full source audit pass |
| Core confirmation found whole-options replacement and later explicit writes could leave stale child paths | 2 | make object/identity spreads and member replacements order-aware | stale schema children are invalidated and explicit later writes win |
| Core confirmation found static computed keys were final-value and file-global instead of temporal and lexical | 3 | resolve string bindings at each property site and stop at lexical shadowing | computed schema/options reads and writes are point-in-time and scope-correct |
| Core confirmation found constructor and descriptor identity leaked through shadowing or future assignments | 4 | track lineage events at each call and capture alias provenance at construction time | descriptor/editor identity is lexical, point-in-time, and reassignment-safe |
| Core confirmation found conditional/logical containers and logical assignments bypassed static analysis | 3 | traverse static branches and fail closed on `??=`, `||=`, and `&&=` | all static alternatives are audited without accepting ambiguous mutation |
| Core confirmation found `Object.assign` options and schema sources bypassed merge analysis | 5 | model inline/aliased/computed targets and ordered static sources | direct, aliased, conditional, logical, and computed assign paths are covered |
| Core confirmation found writes through mutable object aliases invisible from the original binding | 1 | track object identity tokens and sever identity on reassignment | alias writes are visible while replacement creates a fresh identity |
| Broad alias traversal caused a temporary recursive expansion overflow in six files | 1 | restrict deep traversal to merge/spread paths and add cycle guards | full 4,066-file audit completes in about 7 seconds |
| Review proposed accepting unresolved computed option keys carrying named lineage | 1 | reject the finding and preserve the documented fail-closed boundary | explicit negative regression passes; dynamic key cannot hide named schema lineage |
| First object-property rejection was too blunt | 1 | replace syntax rejection with the temporal static binding graph | legitimate owner patterns pass while equivalent bypasses fail |
| First checker autoreview launch had broken shell quoting | 1 | terminate it and rerun the same bounded review input safely | final scoped autoreview completed clean |
| Final checker autoreview | 1 | re-review the complete hardened checker and tests | no accepted/actionable P1/P2 findings; patch correct at confidence 0.84 |
| Final registry gate found live shared writes after attestation | 1 | re-audit Code Block, Diff, Media, Table, Toggle, and Yjs instead of copying fingerprints | all six package manifests re-proved and re-attested from exact live source |
| Shared Plite capability publication temporarily broke downstream proof | 6 | stay off the moving owner and rerun only after Plite's own typecheck passed | package behavior proof resumed against one coherent base; no local compatibility patch added |
| First drift review found ordinary clipboard projections and Table slice depths were wrong | 2 | route ordinary DOM clipboard through `slice.export` and close only actual Table projections | DOM clipboard 58/58 plus Table fast/slow proof pass |
| Applying export projection inside Plite React's projected-view clipboard lacked a runtime capability | 1 | revert the attempted out-of-scope patch completely | `projected-clipboard.ts` has no task diff; ordinary clipboard owner remains fixed |
| Table handler tests invoked staged handlers without their full plugin context | 3 | use `pipeHandler` or `getEditorPlugin` in the exact test owner | Table fast suite passes |
| Table slow helper kept a text range where production creates a structural cell selection | 1 | promote the test range through `read.createCellSelection` | Table slow suite passes 155/155 |
| Yjs slow closure exposed two deterministic unchanged runtime failures | 6 | repeat each row three times and compare failing source/tests with `HEAD` | 216/216 fast and typecheck pass; named-root import trace plus structural seed 131 remain baseline runtime debt |
| Drift review found Media insertion bypassed URL policy and Toggle used the literal type | 2 | normalize inside the scoped insert owner and resolve Toggle through its configured plugin type | Media 82/82, Toggle 15/15, and package typechecks pass |
| Toggle's custom-type regression exposed a terminal configure type intersection | 1 | replace terminal `type`/`enabled` fields at the Core generic owner | Toggle source typecheck and compile-only Plate schema contract pass without casts |
| Table projection dropped ordinary range tables | 1 | preserve original table nodes unless exactly one active table can be projected | ordinary spanning-range regression plus Table 234/234 fast pass |
| Final clipboard review found specialized Table copy bypassed projections and rejected image URLs were swallowed | 2 | use `editor.read.slice.export()` and return the scoped insert result to the clipboard chain | exact projection and rejected-policy regressions pass; Table/Media typechecks pass |
| Final Table slow run had one lookup timing spike | 1 | repeat the exact benchmark three times, then rerun the full slow lane | focused benchmark passes 3/3 and full Table slow proof passes 155/155 |
| Final six-package/Core review | 1 | re-review the complete live closure scope after every accepted fix | no accepted/actionable P1-P3 findings; patch correct at confidence 0.78 |

Verification evidence:
- `node .agents/rules/plate-next/scripts/version.mjs validate` -> v17 valid,
  42 active packages plus one retired.
- Copilot configured-ID closure: `ghost-text.spec.tsx` passes with `_id`;
  `/blocks/copilot-demo` renders with zero console warnings/errors; focused
  current-tree review is clean at confidence 0.82.
- Plugin-authoring enforcement: checker tests pass 27/27; local, aliased,
  reassigned, static/dynamic-computed, optional, temporal, lexical,
  conditional/logical, spread, rest, and `Object.assign` descriptor/editor
  paths are covered; unresolved computed lineage fails closed; the source
  adoption audit passes across 4,066 files in about 7 seconds; final scoped
  autoreview is clean at confidence 0.84.
- Final drift closure: Code Block 68/68, Diff 37/37, Media 82/82, Table
  234/234 fast plus 155/155 slow, Toggle 15/15, Yjs 216/216 fast, and Plite
  DOM clipboard 58/58; all six package typechecks pass in 21/21 Turbo tasks.
- Yjs slow audit: 75/77 pass; the named-root event-trace row and structural
  seed 131 fail deterministically three times each with no task diff in their
  controller/test owners. They are recorded as pre-existing runtime debt, not
  hidden by changed expectations.
- Final scoped autoreview across the six drifted packages, ordinary DOM
  clipboard, and terminal configure generic reports no actionable P1-P3
  findings at confidence 0.78.
- Dnd: `bun test packages/dnd/src` -> 28 pass; explicit slow file -> 4 pass.
- Dnd: `pnpm turbo typecheck --filter=./packages/dnd` -> 12/12 tasks pass.
- Dnd: package `lint:fix`, `brl`, `git diff --check`, topology and stale-path
  scans -> clean.
- Dnd: scoped Codex autoreview -> no accepted/actionable findings, confidence
  0.82.
- Dnd: `status dnd` -> current at v17 with fingerprint
  `sha256:39ce75639b68fd47a7da9ad8cb32cfac59c819b3735c8c83c74f08399559b162`.
- Docx: `bun test packages/docx/src` -> 13/13; explicit slow file -> 5/5.
- Docx: `pnpm turbo typecheck --filter=./packages/docx` -> 12/12 tasks;
  package lint/barrel/diff/topology/export scans clean.
- Docx: first autoreview found one P3 release-note omission; repaired React
  peer-removal prose; second autoreview clean at confidence 0.90.
- Docx: `status docx` -> current at v17 with fingerprint
  `sha256:16b0960105668dd20294685083a39ca599abd58c3f0cfadb5d94667c4238e5a5`.
- Docx IO: `bun test packages/docx-io/src` -> 87/87 fast; three explicit
  slow files -> 36/36; app roundtrip -> 5/5.
- Docx IO: `pnpm turbo typecheck --filter=./packages/docx-io` -> 14/14
  tasks; package lint/barrel/diff checks clean.
- Docx IO: local import graph -> 27 production files, zero cycles; each
  surviving utility has two production consumers; distinct schema modules own
  separate OOXML archive parts.
- Docx IO: first autoreview found one P3 private-token leak; accepted and
  replaced with marker-free nodes plus typed comment points; second
  autoreview clean at confidence 0.82.
- Docx IO: app and docs callers use the public plugin/output shape; major
  changeset lists the hard cuts.
- Docx IO: `status docx-io` -> current at v17 with fingerprint
  `sha256:f8997ddc886a60fc6559445669d19423079703b9ecf26dbb77c0e94b50354cdf`.
- Emoji: 44 initial files collapsed to 12 final source/proof files and eight
  production files with no nested taxonomy folders or import cycles.
- Emoji: `bun test packages/emoji/src` -> 23/23; package declaration build,
  source-first typecheck, lint, barrels, topology scans, and diff check pass.
- Emoji: full `www` typecheck passes after the optional-grid caller adoption.
  Browser `/blocks/emoji-demo` opens the picker, renders all nine categories,
  scrolls Food & Drink into view, and logs no warnings/errors.
- Emoji: first autoreview found one P1 caller adoption gap and one P3 changeset
  omission; both accepted; second autoreview clean at confidence 0.85.
- Emoji: `status emoji` -> current at v17 with fingerprint
  `sha256:671bdb87a7988131c2350e6b3bc474bd57cd4de83df5b3095dfb5fcbb28b9543`.
- Excalidraw: 14 initial files collapsed to eight source/proof files and six
  production files; transform/types/hook taxonomy folders removed.
- Excalidraw: `bun test packages/excalidraw/src` -> 8/8; package build,
  source-first typecheck, direct scoped Biome, barrels, and diff check pass.
- Excalidraw: full `www` typecheck and focused registry transforms 11/11 pass.
  Browser `/blocks/excalidraw-demo` renders one drawing canvas and logs zero
  errors after duplicate descriptor, persisted width, and JSON payload fixes.
- Excalidraw: first final autoreview clean at confidence 0.85; the browser
  persistence finding was repaired; second final autoreview clean at
  confidence 0.85.
- Excalidraw: `status excalidraw` -> current at v17 with fingerprint
  `sha256:a9cd2e7fa449539a92dcb627649a2854cb3f73a42435416b41c4dfef788bf163`.
- Floating: 24 initial files collapsed to six source/proof owners; public
  geometry and hook exports remain package-root exports.
- Floating: `bun test packages/floating/src` -> 25/25; package build,
  source-first typecheck, barrel, direct Biome, stale-path scan, and diff check
  pass; Link and full www typechecks pass.
- Floating: Browser `/blocks/floating-toolbar-demo` selects `Bold text`, opens
  the floating toolbar, and logs zero errors.
- Floating: final autoreview says the working-tree patch is correct at
  confidence 0.85; its sole staging-only finding is outside this task's
  authority and does not affect source quality.
- Floating: `status floating` -> current at v17 with fingerprint
  `sha256:384424236b7163d4afd05b1b0c7bf0b5150403eab4553ea38c4f4fd3c4b7d5d4`.
- Indent: nine initial files collapsed to seven source/proof owners; parser
  and blockquote behavior are inline, runtime tests share the Base spec, and
  both React button hooks share one flat hook-family owner.
- Indent: `bun test packages/indent/src` -> 10/10; package build,
  source-first typecheck, barrel, direct Biome, stale-path scan, and diff check
  pass; List, Toggle, and full www typechecks pass.
- Indent: Browser `/blocks/indent-demo` moves the selected block from 48px to
  72px and back through the toolbar with zero errors.
- Indent: final autoreview clean at confidence 0.90; the sole `.extend()`
  stage is confirmed as a real typed dependency from shortcuts to updates.
- Indent: `status indent` -> current at v17 with fingerprint
  `sha256:c877d05662a458b5d4ec82bc4d74204841bfdeec9eeebc511dd3349e8a5a3a4a`.
- Juice: four initial/final files retained; the only behavior is inline in its
  Base plugin and the separate spec is real proof, not production scattering.
- Juice: `bun test packages/juice/src` -> 2/2; representative DOCX integration
  -> 1/1; package build, source-first typecheck, barrel, direct Biome, and diff
  check pass.
- Juice: final autoreview clean at confidence 0.90; no state, React layer,
  stale helpers, stages, or configuration channel exists.
- Juice: `status juice` -> current at v17 with fingerprint
  `sha256:3d5de788ff4fb5df8cec6a7f87139691322e2888b8dbb879c92ce0332b4c8904`.
- Math: 23 initial files collapsed to eight source/proof owners; both Base
  plugins, rules, insertion updates, and static rendering share one Base
  family, while both React descriptors and both hooks each share one owner.
- Math: `insertEquation` and `insertInlineEquation` are deleted; app actions
  and EN/CN docs use `editor.plugin(Base*EquationPlugin).update.insert`.
- Math: `bun test packages/math/src` -> 16/16; package build, source-first
  typecheck, barrel, direct Biome, stale-path scan, diff check, and full www
  typecheck pass.
- Math: Browser `/blocks/equation-demo` edits `E = mc^2` to `E = mc^3`,
  re-renders KaTeX, and logs zero errors.
- Math: final autoreview clean at confidence 0.88.
- Math: `status math` -> current at v17 with fingerprint
  `sha256:938d92d9c495ad614d569f12c6a93260ed7c107fb3a9ab34476bac94ad44d9df`.
- Mention: seven initial files collapsed to six; the item type lives with the
  Base family as `TMentionItemBase<TKey = unknown>`, and the ignored `search`
  insertion field is removed from source, registry calls, EN/CN docs, and
  changeset prose.
- Mention: `bun test packages/mention/src` -> 10/10; package build,
  source-first typecheck, barrel, direct Biome, diff check, and full www
  typecheck pass.
- Mention: Browser `/blocks/mention-demo` renders installed mention nodes with
  zero errors; exact typed-trigger publication is covered at the package
  command boundary because Browser synthetic typing bypasses that native path.
- Mention: first review findings repaired; final Codex autoreview clean at
  confidence 0.83.
- Mention: `status mention` -> current at v17 with fingerprint
  `sha256:90ee0df32bb14f92afa57cd75d798ac271ac71b3cfb5726531cf2a1069bdd8b9`.
- Plate: four initial/final files retained; the package is an intentional
  umbrella with no plugin behavior or helper taxonomy to colocate.
- Plate: `bun test packages/plate/src` -> 1/1; package build, typecheck, and
  direct Biome pass. No barrel script exists because each file is itself an
  entrypoint.
- Plate: final Codex autoreview clean at confidence 0.82.
- Plate: `status plate` -> current at v17 with fingerprint
  `sha256:737c67959a4197b1e2dc1a89ea2d6d0941a0e6009a4c63e3a1fbda514adf49d9`.
- Resizable: 14 initial files collapsed to five owners; component, hook/store,
  and length-algorithm families are flat with one merged proof file.
- Resizable: unused `ResizableOptions.readOnly` and one-use `isTouchEvent` are
  hard-cut; relative lengths are percentage templates; clamp results widen to
  the correct number/string kind.
- Resizable: `bun test packages/resizable/src` -> 8/8; package build,
  typecheck, barrel, direct Biome, and Media/Table/full www typechecks pass.
- Resizable: Browser `/blocks/media-demo` drags the selected image from 55% to
  505px with zero warnings/errors.
- Resizable: first docs finding repaired; confirmation review clean at
  confidence 0.89.
- Resizable: `status resizable` -> current at v17 with fingerprint
  `sha256:dbe763dd988cbc9fdcb249f0c384402bb993c76a1a06acfe6a2dec94cfd18615`.
- Selection: 66 initial source/proof files collapsed to 17 honest owners; the
  duplicate cursor geometry/query/type/hook stack moved to `@platejs/cursor`.
- Selection: 79 fast + 2 explicit slow rows and 13 Cursor rows pass; both
  packages build/typecheck, barrels/Biome/docs/full www pass.
- Selection: Browser block drag selects the complete block family and cursor
  overlay preserves a text selection after “Ask AI” takes focus, with zero
  warnings/errors.
- Selection: first autoreview findings (read-only render suppression and
  missing direct www dependency) repaired; confirmation review clean at
  confidence 0.86.
- Selection: `status selection` -> current at v17 with fingerprint
  `sha256:403839df8202d5d61e9b89309b240180d31947737a805bcd10c1f8a1a2c8ff0c`.

Final handoff contract:
- target surface and mode: sequential `plate-next sync` across all 42 active
  tracked feature packages, with Yjs explicitly enrolled
- files/APIs reviewed: every package source/proof manifest; public exports,
  plugin stages, helpers, tx/read/api threading, React families, docs, callers,
  release artifacts, and Browser surfaces where applicable
- broad Core drift score coverage: N/A; no broad Core sweep. The shared gate
  still audited 4,066 source/docs files and typechecked 45 packages.
- package file checklist coverage: 42/42 manifests closed at score 100; 0
  unchecked, 0 deferred, 0 unresolved extracted files
- doctrine start/final version and source-fingerprint state: invalid mutable
  v16 source -> immutable v17; every current package fingerprint exact
- version registry evidence and remaining stale/drifted count:
  `version.mjs validate/status/check all` -> 42 current, 0 stale, 0 drifted,
  1 retired
- best Plate v2 recommendation: keep coherent owner files large; merge
  one-use helpers/types/subcomponents; keep hook families outside plugin files;
  stage only genuine typed capability dependencies; publish one canonical API
- verdict matrix summary: all 42 packets kept; no quarantine or compatibility
  alias accepted
- Plite/Plate gaps or blockers: no colocation blocker; two deterministic
  pre-existing Yjs slow-runtime rows remain outside this feature-package sync;
  the shared Plite/Core source/test/declaration gate passes
- related scoped sweep query/active scope/matches/patched/deferred: 42
  package-local topology/API/state/hook sweeps; every match classified; 0
  unresolved deferred
- out-of-scope matches discovered: unrelated whole-www Core/Docx/demo
  diagnostics
- changes made: owner-first colocation, capability staging cleanup, flat
  commands, test-family consolidation, Markdown root API hard cut, portable
  constructor inference, exact checker/registry ownership
- tests/proof commands: package tests/build/typecheck/lint/barrels, focused app
  integrations, docs parity, Browser routes, schema adoption audit, 45-package
  Core typecheck, registry validate/status/check
- old compatibility names audited: exact package-local and repo caller/docs
  scans pass; generated registry/template outputs excluded as CI-owned
- needs attention: Yjs named-root event import and structural seed 131 only
- next best Plate Next packet: none; future work starts from registry drift,
  not another untracked package queue

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | All 42 active packages are closed at v17 |
| Where am I going? | Final review and goal-checker handoff |
| What is the goal? | Zero stale/drifted tracked packages and a resolved Yjs owner |
| What have I learned? | owner-first colocation needs an exact Core checker and declaration-portable constructor boundary |
| What have I done? | synced, proved, reviewed, and attested all 42 packages with zero registry drift |

Timeline:
- 2026-07-27T15:30:05.063Z Goal plan created.
- 2026-07-27T15:35:00+02:00 Read Plate Next and autogoal completely,
  created the active goal, and recorded the all-package scope.
- 2026-07-27T15:40:00+02:00 Registry audit found invalid v16 doctrine
  fingerprint, 41 tracked packages, and untracked plugin-bearing Yjs.
- 2026-07-27T15:48:00+02:00 Appended immutable v17, regenerated the skill,
  enrolled Yjs, and validated the frozen 42-package queue.
- 2026-07-27T16:02:00+02:00 Closed Dnd: 36 to 10 source files, 32 tests
  green, typecheck/lint/barrel clean, autoreview clean, v17 status current.
- 2026-07-27T18:52:00+02:00 Closed Docx: 42 to five TypeScript
  owner/proof files, 18 tests green, typecheck/lint/barrel clean, two-pass
  autoreview clean, v17 status current.
- 2026-07-28T00:08:00+02:00 Closed Yjs: moved the 606-line React hook family
  out of the barrel, inlined document-only delta helpers, passed 215 tests,
  build/typecheck/Biome, live Ada-to-Lin sync, and two-pass autoreview.
- 2026-07-28T02:18:00+02:00 Closed AI: moved fuzzy text-range lookup to the
  headless Base owner, consolidated Copilot/chat hook and test families,
  repaired adapter docs, passed package and focused app proof, live AI render,
  and three-pass autoreview.
- 2026-07-28T02:37:00+02:00 Closed Code Block: internalized the vendored Python
  grammar, consolidated nine proof shards into one Base and one React family,
  passed 68 tests plus build/typecheck/lint, live highlighting, and two-pass
  autoreview.
- 2026-07-28T02:48:00+02:00 Closed Footnote: collapsed descriptor, type, React,
  and proof shards into one Base and one React family, passed 33 tests plus
  build/typecheck/lint, schema integration, live navigation render, and clean
  autoreview.
- 2026-07-28T02:42:00+02:00 Closed Layout: merged split schema/update proof
  into one Base owner-family spec, passed 22 tests plus build/typecheck/lint,
  live column rendering, and clean autoreview.
- 2026-07-28T02:48:00+02:00 Closed List unchanged: its large Base owner and
  two typed dependent stages are coherent; passed 51 fast + 63 slow tests,
  build/typecheck/lint, live playground rendering, and clean autoreview.
- 2026-07-28T02:54:00+02:00 Closed Toc: inlined typed state, moved Heading
  into the Base owner, merged Base proof, repaired NavigationFeedback mocks,
  and passed 15 tests, build/typecheck/lint, live docs, and clean autoreview.
- 2026-07-28T02:59:00+02:00 Closed Toggle: inlined state, removed its
  one-use render export, placed hidden-child rendering in the typed
  selector-consuming stage, and passed 14 tests, build/typecheck/lint, live
  docs, and clean autoreview.
- 2026-07-28T03:09:00+02:00 Closed Basic Nodes: reduced 37 source files to 14
  source owners/barrels, preserved all public symbols, passed 57 tests plus
  build/typecheck/lint, live basic-marks rendering, and clean autoreview.
- 2026-07-28T03:17:00+02:00 Closed Basic Styles: reduced 25 source files to
  six source owners/barrels, preserved every public symbol, passed 36 tests
  plus build/typecheck/lint, live font rendering, and clean autoreview.
- 2026-07-28T03:22:00+02:00 Closed Callout unchanged: its Base, hook, React
  descriptor, and slow hook proof are the honest owners; 4 tests, artifact
  build/lint/Biome, live docs, and autoreview pass. Source-first typecheck is
  blocked only by unrelated Utils declaration WIP.
- 2026-07-28T03:28:00+02:00 Closed Code Drawing: moved plugin-owned
  enums/defaults into Base, retained reusable renderer/download owners, and
  removed the demo's duplicate plugin registration. All 13 tests plus
  build/typecheck/lint/barrel/Biome, live docs, and autoreview pass.
- 2026-07-28T03:31:00+02:00 Closed Combobox unchanged: its generic extension,
  public filter, and React hook family are honest owners; all 42 tests plus
  build/typecheck/lint/Biome, live docs, and autoreview pass.
- 2026-07-28T03:35:00+02:00 Closed Comment unchanged: one Base runtime, one
  reusable comment-mark metadata family, and one React hook family; all 13
  tests plus build/typecheck/lint/Biome, live docs, and autoreview pass.
- 2026-07-28T03:39:00+02:00 Closed CSV: inlined its typed state factory and
  staged the text codec after `api.deserialize`; 8 fast plus one native-ESM
  test, build/typecheck/lint/Biome, live docs, and autoreview pass.
- 2026-07-28T03:44:00+02:00 Closed Date unchanged: the Base descriptor,
  reusable date-value conversion family, and trivial React descriptor are the
  honest owners; 17 tests plus build/typecheck/lint/Biome, live docs, and
  autoreview pass.
- 2026-07-27T20:20:00+02:00 Closed Docx IO: 59 to 41 source/proof files, 128
  package/app tests green, typecheck/lint/barrel/import graph clean, accepted
  comment-boundary review fix, final autoreview clean, v17 status current.
- 2026-07-27T21:18:00+02:00 Closed Emoji: 44 to 12 source/proof files, 23
  package tests plus full www typecheck and live demo green, accepted optional
  grid caller and release-note review fixes, final autoreview clean, v17 status
  current.
- 2026-07-27T22:35:00+02:00 Closed Excalidraw: 14 to eight source/proof files,
  8 package tests plus build/typecheck/lint/barrels and full www typecheck
  green; live canvas has zero errors after schema/persistence/demo repairs;
  final autoreview clean, v17 status current.
- 2026-07-27T22:50:50+02:00 Closed Floating: 24 to six source/proof files,
  25 tests plus build/typecheck/barrel/Biome and Link/www consumers green;
  live selection toolbar has zero errors; final working-tree review clean;
  v17 status current.
- 2026-07-27T23:01:56+02:00 Closed Indent: nine to seven source/proof files,
  10 tests plus build/typecheck/barrel/Biome and List/Toggle/www consumers
  green; live indent/outdent toolbar proof has zero errors; clean autoreview;
  v17 status current.
- 2026-07-27T23:06:23+02:00 Closed Juice unchanged at four files: 2 package
  tests plus one DOCX integration, build/typecheck/barrel/Biome, and final
  review green; v17 status current.
- 2026-07-27T23:18:45+02:00 Closed Math: 23 to eight source/proof files, hard
  cut direct transaction helpers to scoped updates, 16 tests plus
  build/typecheck/barrel/Biome/www docs green, live KaTeX edit clean, final
  autoreview clean; v17 status current.
- 2026-07-27T23:31:05+02:00 Closed Mention: seven to six source/proof files,
  removed fake search command data, added trigger proof, 10 tests plus
  build/typecheck/barrel/Biome/www and EN/CN docs green, final review clean;
  v17 status current.
- 2026-07-27T23:34:23+02:00 Closed Plate unchanged at four files: umbrella
  exports plus interoperability proof pass test/build/typecheck/Biome; final
  review clean; v17 status current.
- 2026-07-27T23:49:11+02:00 Closed Resizable: 14 to five source/proof files,
  hard-cut dead option/helper, repaired relative/clamp types, 8 tests plus
  package/consumer/live drag proof green; final review clean; v17 current.
- 2026-07-28T00:25:54+02:00 Closed Selection: 66 to 17 source/proof files,
  cut duplicated Cursor geometry, merged engine/hook/plugin proof families,
  94 focused rows plus package/app/docs/browser proof green; final review
  clean; v17 current.
- 2026-07-28T00:36:37+02:00 Closed Slash Command unchanged at six
  source/proof files: generic extension adapter and typed state owner retained,
  3 tests plus package/www/browser proof green, final review clean; v17
  current.
- 2026-07-28T01:01:43+02:00 Closed Tabbable: nine to seven source/proof files,
  merged types and specs, removed duplicate path comparison, 12 rows plus
  package/www/docs/browser proof green; final review clean; v17 current.
- 2026-07-28T01:01:43+02:00 Closed Tag: ten to six source/proof files, staged
  plugin capabilities and one hook family; browser proof exposed and verified
  the Core NodeId inline-policy repair; 39 focused rows plus package/www/docs
  proof green; final review clean; v17 current.
- 2026-07-28T01:01:43+02:00 Closed Test Utils: six to five source/proof files,
  deleted the unused DOM wrapper and one-use type alias; 9 rows plus
  build/typecheck/barrel/Biome and review green; v17 current.
- 2026-07-28T04:05:00+02:00 Closed Cursor and Diff: retained honest reusable
  families, merged Diff types into its algorithm owner, repaired Cursor cache
  invalidation, and passed package/docs/Browser/review gates.
- 2026-07-28T04:35:00+02:00 Closed Markdown and AI: consolidated conversion
  orchestration, hard-cut duplicate editor-bound helpers, retained only
  `editor.api.markdown`, and repaired NodeId plus streamed fence regressions.
- 2026-07-28T05:10:00+02:00 Final Core gate repaired stale exact allowlists,
  direct plugin export chains, and constructor declaration portability; source
  audit passed across 4,066 files and all 45 Core/reviewed package typechecks
  passed; the later shared capability publication also closed Core
  source/test/declaration contracts.
- 2026-07-28T05:15:00+02:00 Registry validated 42 current, 0 stale, 0 drifted,
  and 1 retired; every tracked package has a package-scoped changeset.
- 2026-07-28T06:30:00+02:00 Re-audited six packages changed after attestation,
  repaired clipboard projection, Media URL policy, configured Toggle type
  inference, and Table range-copy regressions; final review clean.

Open risks:
- Two pre-existing deterministic Yjs slow-runtime rows remain; no tracked Plate
  package is stale, drifted, or failing its package/Core-reviewed typecheck.
