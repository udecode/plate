# plate-next legacy list colocation

Objective:
Colocate `platejs` by durable plugin and React families; done
when every package row scores 100 and proof, API audits, autoreview, and the
plan checker pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-23-plate-next-legacy-list-colocation.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api

Plate Next source:
- prompt / link: user corrected the package queue to the colocation queue, then
  authorized `packages/platejs/src/features/list` with `go`
- mode: package review plus accepted owner-first implementation
- target surface: `packages/platejs/src/features/list`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, limited to
  `packages/platejs/src/features/list` plus the two exact registry callers that would
  otherwise retain the rejected public API
- package review mode: yes
- package review target: all 79 current files under `packages/platejs/src/features/list`
- package file checklist gate: 79 rows materialized before implementation;
  every final row must score 100
- completion threshold summary: merge/delete every single-owner `with*`,
  query, transform, utility, React hook, and mirrored test split into durable
  plugin or React-family owners; preserve behavior and inference; hard-cut
  rejected raw helper exports; pass package-owned lint/tests/source audits,
  run the broad type/build/Core/browser gates and classify any exact
  foreign-owner blocker, then pass autoreview and the final plan checker

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
- requested duration: none
- semantics: one-shot execution until the package closes
- initial confidence score: 0.35; owner scatter is proven but the complete
  behavior/caller graph is not yet classified
- improvement loop: classify all 79 rows, merge one owner family at a time,
  run focused proof after each meaningful packet, then close broad package
  proof and review
- final score / loop closure: 1.0; 83/83 review rows score 100, package
  tests/lint and both exact registry-adopter audits are clean, scoped source
  audits are empty, autoreview is clean, and only separately owned shared-tree
  gates remain blocked

Completion threshold:
- All 79 checkpoint-zero package rows are reviewed; every surviving final file
  and every merged/deleted row scores 100 with owner and proof evidence.
- Zero production files remain under `lib/queries`, `lib/transforms`,
  `react/hooks`, or as standalone `with*` helpers unless a row proves a durable
  independent or cross-owner job.
- Public common-path mutations use inferred scoped plugin transaction methods;
  raw helper exports and redundant owner nesting are hard-cut without aliases.
- Existing legacy-list-model behavior remains covered by merged owner-family specs,
  with package lint/tests passing; package-local type errors at zero; build,
  shared `check:core`, and browser attempts classified at their exact foreign
  blockers; barrels/source audits complete; autoreview and the final plan
  checker passing.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-plate-next-legacy-list-colocation.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: owner-family Bun specs after each merge packet;
  package-scoped Biome/lint after source moves
- package proof: `pnpm turbo typecheck --filter=./packages/platejs/src/features/list`,
  `pnpm --filter platejs test`,
  `pnpm --filter platejs build`
- shared Core gate: add/confirm `legacy-list-model` in
  `tooling/scripts/check-core.mjs`, then run `pnpm check:core`
- source audits: remaining taxonomy folders, standalone `with*`, production
  functions accepting `tx`, raw-helper exports/imports, nested update calls,
  explicit normalization, casts/annotations hiding inference, and umbrella
  imports
- related scoped sweep query / active scope / match count / patched count / deferred count:
  record every accepted correction; active scope is `packages/platejs/src/features/list`
  plus the two exact direct runtime adopters required by the API hard cut;
  every other repo caller is discovery-only
- package file manifest / row count / checked count / deferred count:
  `rg --files packages/platejs/src/features/list | sort`; 79 / 0 / 0 at checkpoint zero
- Plite/Plate gap ledger: none known; record any inferred tx/API typing blocker
- broad Core drift ledger gate: N/A; broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-plate-next-legacy-list-colocation.md`

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
  scope. This packet includes the named package plus the two exact registry
  callers required to adopt the hard-cut transaction names. Broader matches
  become deferred rows or next-package candidates, not edits.
- In package review mode, do not update docs, examples, package callers outside
  the named package, unrelated packages, generated registries, or broad repo
  surfaces unless the user explicitly broadens scope with `all packages`,
  `current tree`, `full-loop`, `sweep`, or the broader owner name. The narrow
  exception is an exact direct runtime adopter that would otherwise keep a
  rejected public API; this packet has exactly two and records both.
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
  `defineEditorExtension({ name: pluginName, ... })` just to satisfy types.
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
- allowed edit scope: `packages/platejs/src/features/list`, its package changeset, generated
  barrels, this plan, `tooling/scripts/check-core.mjs`, and only the smallest
  Core/Plite generic owner if inference proves broken
- package/API surfaces: `platejs` core and React exports
- docs/browser surfaces: excluded; package review does not run apps/www or
  browser proof
- non-goals: unrelated packages, content/docs, registry/apps, broad caller
  migration, compatibility aliases, commits, pushes, or PRs
- out-of-scope package errors: record without patching unless caused by this
  packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Count manifests/caller matches before printing them; inspect owner families
  in bounded chunks; exclude `dist`, generated output, and unrelated packages.

Blocked condition:
- Stop only if a required public behavior cannot be expressed through the
  current inferred plugin builder/transaction contract and three distinct
  owner-level repair attempts prove a Core/Plite decision is required.

Current verdict:
- verdict: merge-existing-owner plus hard-cut raw helper topology
- confidence: 1.0 for the package result
- next owner: the next user-selected package
- keep / revert / quarantine call: keep
- reason: the package now has one core implementation owner, one core
  behavior-family spec, one todo behavior spec, flat React hook families, and
  no raw helper topology or compatibility aliases

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact package, colocation law, no line ceiling, lexical tx ownership, React family law, proof, stop condition, and handoff copied above |
| `plate-next` skill/rule read | yes | Read complete generated skill before package work |
| Active goal checked or created | yes | Goal created for this exact plan after `get_goal` returned none |
| Mode classified as named packet vs broad Core sweep | yes | Named `packages/platejs/src/features/list` package review; broad Core sweep excluded |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plate Next source and constraints above |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; boundaries above |
| Output budget strategy recorded | yes | Bounded owner-family reads and counted searches above |
| Public API fork routing checked | yes | User accepted scoped flat plugin APIs and owner-first hard cuts; `best-api` loaded for exact verbs |
| Gap policy checked | yes | Blocked condition and gap ledger rules above |
| Related scoped sweep policy checked | yes | Package-only correction sweeps; external callers discovery-only |
| Review-mode rename freeze checked | yes | N/A: current Plate Next law explicitly permits owner-driven merge/delete topology; cosmetic renames remain rejected |
| Package review checklist initialized when in scope | yes | 79 checkpoint-zero rows below |
| Package/API pack selected | yes | `package-api` materialized and recorded |
| Public surface or package boundary identified | yes | `platejs` root and React exports |
| Release artifact path selected | yes | `.changeset` required for published helper hard cuts and scoped command API |
| `changeset` skill loaded when `.changeset` is required | yes | Read the complete skill before repairing `.changeset/legacy-list-model-v54-runtime.md` |
| Barrel/export impact decision recorded | yes | Exported helper layout will change; run `pnpm brl` |

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
| Named verification threshold | yes | Run the proof commands named in this plan | Package tests/lint pass; package and two direct-adopter error filters are empty; source audits are empty |
| Broad Core drift ledger coverage | no | N/A for named feature-package review | Broad Core sweep was explicitly excluded |
| Score gate | yes | Prove every initial and final row | 83/83 rows score 100; 0 unchecked/deferred |
| Best Plate v2 recommendation | yes | Record accepted current shape | Scoped flat plugin updates plus owner-first colocation recorded below |
| Plite/Plate gap ledger | no | Record N/A when no gap blocks the target | No package API or inference gap remains |
| Related scoped sweep after correction | yes | Audit each corrected pattern | Five bounded zero-residual sweeps recorded below |
| Package file checklist | yes | Reconcile initial and final manifests | 79 initial rows, 15 final files, 68 removed/moved and 4 deliberate new owners |
| Helper topology / lexical tx ownership | yes | Remove single-owner tx helpers | Six surviving tx algorithms have 3-7 production calls each; all others are lexical |
| Package/API proof | yes | Run focused typecheck/test/build | Package tests/lint pass; package-owned type errors are zero; artifact build cannot resolve the shared Core declaration owner |
| Shared Core gate coverage | yes | Confirm package in `check-core` and run gate | `legacy-list-model` is reviewed; runner/leak/brand contracts pass 22/22 before unrelated schema-adoption drift |
| Non-Core package error triage | yes | Classify proof failures | Core declaration and shared markdown/plite-dom/suggestion/table audit failures are out of scope |
| Source audit | yes | Audit hard-cut names and topology | No raw list helper, nested update, helper-folder, `any`, non-null, or explicit plugin annotation remains in production |
| Rename ledger | no | N/A: no postponed rename | All accepted owner moves landed directly |
| Extracted-file inventory | yes | Classify deliberate new paths | Four untracked owner paths are `merge-existing-owner` / `move-existing-owner`; plan is the only extra plan artifact |
| Autoreview / review | yes | Run final review gate | Final Codex autoreview exits 0 with no actionable findings after two accepted fixes |
| Final lint/check | yes | Run scoped checks | Package Biome 13 files clean; www graph has zero errors in the two direct adopters and foreign Markdown/AI errors |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run final checker | Final checker exits 0 on the closed ledger |
| Public API / package boundary proof | yes | Audit root and React exports | Root exports only `BaseListPlugin` family; React exports flat descriptors/hooks |
| Release artifact classification | yes | Classify published impact | Published major API hard cut |
| Published package changeset | yes | Repair one package changeset | Complete `changeset` skill read; `.changeset/legacy-list-model-v54-runtime.md` matches final API |
| Registry changelog | no | N/A: not registry-only work | Two registry files are required package-API adopters, not the release owner |
| No release artifact | no | N/A: published API changed | Major changeset is required and present |
| Package typecheck/build/test | yes | Run owning checks | Tests/lint pass, package-local type errors zero; type graph stops in code-block/Core and artifact build cannot resolve `@platejs/core` declarations |
| Barrel/export generation | yes | Run `pnpm brl` | 56/56 barrel tasks pass |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `src/lib/BaseListPlugin.ts` | 0 | keep | legacy-list-model core family | Owns descriptors, rules, queries, mutations, commands, middleware, and corrections; only reused private algorithms remain top-level | none |
| `src/lib/BaseListPlugin.spec.tsx` | 0 | merge-existing-owner | legacy-list-model behavior family | Replaces method/file-mirrored specs; retains nuanced unwrap, task-state inheritance, and configured-type behavior through public owners | none |
| `src/lib/BaseTodoListPlugin.spec.ts` | 0 | keep | classic todo behavior | Covers schema, break insertion/fallback, and scoped toggle | none |
| `src/react/ListPlugin.tsx` | 0 | merge-existing-owner | React descriptor family | Owns all React descriptor conversions including todo | none |
| flat React hook files | 0 | move-existing-owner | toolbar and todo element hook families | No taxonomy folder/barrel; inferred public hook state; configured toolbar type covered | none |
| raw query/transform/`with*` exports | 5 | hard-cut | `BaseListPlugin` private implementation | Zero residual exports/imports; changeset gives scoped migration | none |
| `update.toggle.list`, `tab`, `untab` | 5 | hard-cut | scoped plugin transaction API | Adopted as `toggle`, `indent`, `outdent` in package and two direct registry callers | none |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| legacy list model mutations | `editor.plugin(ListPlugin).update.{toggle,indent,outdent}` | raw tx helpers, global editor aliases, nested `toggle.list`, compat aliases | Shortest inferred path with one obvious owner | accepted by user |
| implementation topology | one `BaseListPlugin.ts` plus one todo behavior spec | `queries/`, `transforms/`, `with*`, per-method specs | All behavior is plugin-owned; no line ceiling | accepted by user |
| React topology | descriptors together; flat hook-family files | `hooks/` taxonomy, one descriptor file per subplugin | Family ownership beats file taxonomy | accepted by user |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | N/A | N/A | Package calls infer without annotations | no gap |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| flatten root update API | package plus two direct registry adopters | `toggle\.list|update\.(tab|untab)` | 15 initial | 15 | 0 | none |
| hard-cut raw mutations | package plus two direct registry adopters | `indentListItems|unindentListItems|/transforms/` | 34 initial owner files/imports | 34 | 0 | docs outside package mode remain separately owned |
| lexical tx ownership | package production | top-level functions accepting `tx` plus use counts | 6 survivors | 0 | 6 justified reused algorithms | each has 3-7 production calls |
| React family colocation | package React root | `react/hooks|TodoListPlugin.tsx` | 6 old paths | 6 | 0 | none |
| inference/slop audit | package production | `as any`, `: any`, non-null assertions, plugin annotations, nested updates | 3 final pre-cleanup assertions | 3 | 0 | none |

Core drift ledger:
- Applies: no; N/A because this is a named feature-package review
- Manifest command: N/A for broad Core; `rg --files packages/core/src` was not
  run because this packet is feature-package scoped
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
| N/A | N/A | feature-package scope | N/A | broad Core sweep excluded | N/A |

Package file checklist:
- Applies: yes
- Package: `packages/platejs/src/features/list`
- Manifest command: `rg --files packages/platejs/src/features/list | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 79
- Actual row count: 79
- Checked score-100 count: 83 final rows: 79 checkpoint-zero rows plus 4 deliberate moved/merged owners
- Unchecked/deferred count: 0 final
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Final current-tree reconciliation: 15 files; 11 checkpoint-zero paths survive, 68 checkpoint-zero paths were merged/deleted/moved, and 4 deliberate owner paths were added. Missing rows: 0. Extra rows: 0.
- Next package blocked until: closed; every checkpoint-zero and final owner row is score 100.

Package file rows:
- [x] `packages/platejs/src/features/list/CHANGELOG.md` — score: 100 — verdict: keep — owner: package owner — evidence: final manifest, scoped lint/tests/type adoption — next: none.
- [x] `packages/platejs/src/features/list/README.md` — score: 100 — verdict: keep — owner: package owner — evidence: final manifest, scoped lint/tests/type adoption — next: none.
- [x] `packages/platejs/src/features/list/package.json` — score: 100 — verdict: keep — owner: package owner — evidence: final manifest, scoped lint/tests/type adoption — next: none.
- [x] `packages/platejs/src/features/list/src/index.ts` — score: 100 — verdict: keep — owner: package owner — evidence: final manifest, scoped lint/tests/type adoption — next: none.
- [x] `packages/platejs/src/features/list/src/lib/BaseListInputRules.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/BaseListPlugin.schema.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/BaseListPlugin.ts` — score: 100 — verdict: keep — owner: `BaseListPlugin` plugin family — evidence: final manifest, scoped lint/tests/type adoption — next: none.
- [x] `packages/platejs/src/features/list/src/lib/BaseTodoListPlugin.spec.ts` — score: 100 — verdict: keep — owner: `BaseTodoListPlugin` behavior family — evidence: final manifest, scoped lint/tests/type adoption — next: none.
- [x] `packages/platejs/src/features/list/src/lib/BaseTodoListPlugin.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/BulletedListRules.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/OrderedListRules.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/TaskListRules.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/index.ts` — score: 100 — verdict: keep — owner: package owner — evidence: final manifest, scoped lint/tests/type adoption — next: none.
- [x] `packages/platejs/src/features/list/src/lib/queries/getHighestEmptyList.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/getHighestEmptyList.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/getListItemEntry.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/getListItemEntry.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/getListRoot.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/getListRoot.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/getListTypes.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/getTaskListProps.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/getTodoListItemEntry.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseTodoListPlugin.spec.ts` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/getTodoListItemEntry.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/hasListChild.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/hasListChild.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/index.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/isAcrossListItems.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/isListNested.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/isListNested.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/isListRoot.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/queries/someList.ts` — score: 100 — verdict: delete-duplicate — owner: `lib/BaseListPlugin.ts` — evidence: zero production consumers; behavior covered through plugin commands — next: deleted.
- [x] `packages/platejs/src/features/list/src/lib/transforms/indentListItems.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/index.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/insertListItem.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/insertListItem.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/insertTodoListItem.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseTodoListPlugin.spec.ts` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/insertTodoListItem.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/moveListItemDown.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/moveListItemSublistItemsToListItemSublist.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/moveListItemSublistItemsToListItemSublist.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/moveListItemUp.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/moveListItems.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/moveListItemsToList.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/moveListItemsToList.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/moveListSiblingsAfterCursor.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/moveListSiblingsAfterCursor.ts` — score: 100 — verdict: delete-duplicate — owner: `lib/BaseListPlugin.ts` — evidence: zero production consumers; behavior covered through plugin commands — next: deleted.
- [x] `packages/platejs/src/features/list/src/lib/transforms/removeFirstListItem.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/removeListItem.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/removeListItem.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/toggleList.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/toggleList.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/unindentListItems.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/unindentListItems.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/unwrapList.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/transforms/unwrapList.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withDeleteBackwardList.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withDeleteBackwardList.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withDeleteForwardList.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withDeleteForwardList.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withDeleteFragmentList.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withDeleteFragmentList.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withInsertBreakList.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withInsertBreakList.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withInsertFragmentList.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withInsertFragmentList.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withList-tab.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withList.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withList.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withNormalizeList.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.spec.tsx` — evidence: behavior-family spec preserves public behavior coverage; package tests pass — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/lib/withNormalizeList.ts` — score: 100 — verdict: merge-existing-owner — owner: `lib/BaseListPlugin.ts` — evidence: implementation is private and colocated; only multi-consumer algorithms remain module-local — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/react/ListPlugin.tsx` — score: 100 — verdict: keep — owner: `ListPlugin` React descriptor family — evidence: final manifest, scoped lint/tests/type adoption — next: none.
- [x] `packages/platejs/src/features/list/src/react/TodoListPlugin.tsx` — score: 100 — verdict: merge-existing-owner — owner: `react/ListPlugin.tsx` — evidence: flat React family topology plus green package tests — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/react/hooks/index.ts` — score: 100 — verdict: merge-existing-owner — owner: `react/index.ts` — evidence: flat React family topology plus green package tests — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/react/hooks/legacyListModelHooks.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: `react/ListPlugin.spec.tsx` — evidence: flat React family topology plus green package tests — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/react/hooks/useListToolbarButton.ts` — score: 100 — verdict: merge-existing-owner — owner: `react/useListToolbarButton.ts` — evidence: flat React family topology plus green package tests — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/react/hooks/useTodoListElement.ts` — score: 100 — verdict: merge-existing-owner — owner: `react/useTodoListElement.ts` — evidence: flat React family topology plus green package tests — next: deleted old path.
- [x] `packages/platejs/src/features/list/src/react/index.ts` — score: 100 — verdict: keep — owner: package owner — evidence: final manifest, scoped lint/tests/type adoption — next: none.
- [x] `packages/platejs/src/features/list/tsconfig.build.json` — score: 100 — verdict: keep — owner: package owner — evidence: final manifest, scoped lint/tests/type adoption — next: none.
- [x] `packages/platejs/src/features/list/tsconfig.json` — score: 100 — verdict: keep — owner: package owner — evidence: final manifest, scoped lint/tests/type adoption — next: none.

- [x] `packages/platejs/src/features/list/src/lib/BaseListPlugin.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: core list behavior family — evidence: merged input, schema, toggle, delete, break, paste, indent, edit, and correction behaviors; package tests pass — next: none.
- [x] `packages/platejs/src/features/list/src/react/ListPlugin.spec.tsx` — score: 100 — verdict: move-existing-owner — owner: React hook family — evidence: flat hook behavior spec passes — next: none.
- [x] `packages/platejs/src/features/list/src/react/useListToolbarButton.ts` — score: 100 — verdict: move-existing-owner — owner: list toolbar hook family — evidence: flat public hook owner and scoped `update.toggle` adoption — next: none.
- [x] `packages/platejs/src/features/list/src/react/useTodoListElement.ts` — score: 100 — verdict: move-existing-owner — owner: todo element hook family — evidence: flat public hook owner with inferred state return — next: none.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| plugin core family | `BaseListPlugin` / `BaseTodoListPlugin` | `with*`, queries, transforms, and method-level specs are one-owner scatter | `packages/platejs/src/features/list/src/lib` | merged implementation and behavior specs; raw exports hard-cut | closed |
| React families | `ListPlugin` plus two hook families | hook taxonomy split family-only behavior | `packages/platejs/src/features/list/src/react` | descriptors merged; hooks/spec moved flat; inferred return restored | closed |
| scoped API adoption | package plus two direct registry callers | rejected nested/raw mutations would break callers | package tests, toolbar, classic transforms | adopted `toggle`, `indent`, `outdent` | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `src/lib/BaseListPlugin.spec.tsx` | merge-existing-owner | replaces checkpoint-zero behavior specs | keep as the core behavior-family spec | 85 named package test blocks pass; retained public behavior paths |
| `src/react/ListPlugin.spec.tsx` | move-existing-owner | replaces nested hook spec | keep as flat React-family spec | configured toolbar type regression passes |
| `src/react/useListToolbarButton.ts` | move-existing-owner | same public hook family, flat path | keep | direct-adopter type filter and configured-type hook spec |
| `src/react/useTodoListElement.ts` | move-existing-owner | same public hook family, flat path | keep | inferred state and hook spec |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| package typecheck graph | nine `code-block` errors and four Core injection-model errors | graph reaches foreign owners; package-local `src/` error filter is zero | code-block/Core owners |
| package artifact build | cannot resolve `@platejs/core` declarations, followed by contextual-inference cascades | missing artifact owner removes builder context; package tests and source-first error filter remain clean | Core artifact owner |
| www typecheck graph | shared `EditorDocumentValue`, Markdown capability, and generated source errors | both exact legacy-list-model adopter error filters are zero | Markdown/AI/www source owners |
| `pnpm check:core` schema audit | shared markdown, plite-dom, suggestion, and table rows fail after 22/22 runner/leak/brand contracts | no legacy-list-model match and no failure caused by this packet | owning package packets |
| legacy-list-model browser demo | duplicate `footnoteReference` plugins throws before list code mounts | shared registry composition error, unrelated to list API adoption | registry/Core composition owner |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| raw helper reference sections | EN/CN legacy-list-model docs | package-review mode excludes docs; source/changeset is authoritative for this packet | docs owner |
| shared code-block/Core type drift | `BaseCodeBlockPlugin.ts` and Core injection-model compilation | unrelated concurrent shared-tree WIP | code-block/Core owners |
| shared Markdown/AI/www type drift | broad www typecheck | unrelated concurrent schema/API WIP; exact adopters are clean | Markdown/AI/www owners |
| duplicate footnote runtime descriptor | legacy-list-model demo composition | browser blocker predates and precedes list plugin mount | registry/Core owner |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | merged 32 helper/`with*` production owners into `BaseListPlugin`; flattened `toggle`/`indent`/`outdent`; merged React descriptors and flattened hooks |
| tests/proof | merged method/file specs into core, todo, and React behavior families; migrated public API calls |
| docs/templates/skills | repaired existing major package changeset and this goal plan; no product docs/templates |
| reverted/quarantined packets | recovered one failed mechanical inline attempt from intact source owners; deleted all temporary scripts |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | shared type/artifact graph blockers | prevent broad type/build proof despite zero legacy-list-model or direct-adopter errors | `BaseCodeBlockPlugin.ts`, Core injection-model files, and missing Core declarations | code-block/Core owners repair their active WIP |
| 2 | shared demo duplicate plugin | prevents browser runtime proof before list plugin mount | `resolvePlugins.ts:1309` | registry/Core owner removes duplicate `footnoteReference` |

Findings:
- Checkpoint zero has 79 files. The primary scatter is seven production
  `with*` files, eleven production query files, fourteen production transform
  files, their method-level specs, and a nested React hook taxonomy.
- The prior 2026-07-12 package review explicitly deferred all legacy-list-model rows
  to an unfinished public API plan. The newest user instruction accepts the
  owner-first colocation direction; current callers prove the flat verbs.
- Final topology is 15 files from 79: one 2,563-line implementation owner, one
  3,885-line core behavior spec, one todo spec, one React descriptor family,
  two flat hook families, and one React-family spec.

Decisions and tradeoffs:
- Keep the current package boundary and legacy-list-model product concept; reject
  raw helper files/exports as the reusable interface. Repeated callers should
  use the scoped plugin API/tx surface.
- Keep tests for public behavior, not deleted implementation boundaries:
  nuanced unwrap, task-state inheritance, and configured-type cases live in
  owner-family specs; raw query return values and helper-forwarding spies do
  not survive the hard cut.
- Do not merge Yjs-style protocol owners by analogy. This packet is justified
  by legacy-list-model's plugin-owned graph, not file count alone.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad external import search entered generated `apps/www/public` JSON and exceeded the intended output budget | 1 | Exclude public/generated/templates/plans and count files before printing matches | Resolved with a 16-file bounded source/docs caller list |
| Baseline Turbo typecheck built shared Core and stopped on `getPlateCorePlugins` TS2527 unique-symbol declaration error before legacy-list-model ran | 1 | Use package-owned/source-first checks after implementation; classify the pre-existing Core build failure separately | Open out-of-scope baseline blocker for the broad graph only |
| First merge script included `.spec.ts` because `.endsWith('.ts')` matched specs | 1 | Restore exact current WIP owner, add explicit `.spec.` and barrel exclusions, then rerun bounded merge | Fully recovered before further edits; final package tests pass |
| First extension-inline script stripped object-return arrows as blocks | 1 | Restore six extension wrappers from intact old owner files and stop using the blind transform | Fully recovered; Biome/parser clean and temporary script deleted |
| TypeScript compiler-API audit used the TS7 package shim, which exposes only version metadata | 2 | Stop retrying the unavailable API and use bounded lexical/usage audits | Resolved; no repo files created |
| One source search used an unmatched zsh glob | 1 | Rerun with exact existing paths and repo globs | Resolved immediately |
| First autoreview pass after test retention found configured-type shell and toolbar regressions | 1 | Verify Core reference semantics, resolve installed types by key, and add owner-level regression tests | Both fixes pass; final autoreview clean |
| Browser smoke returned HTTP 500 before list mount | 1 | Inspect console/server owner and stop rather than patch unrelated runtime | Classified duplicate `footnoteReference` shared blocker |

Verification evidence:
- Baseline `pnpm --filter platejs test` -> exit 0.
- Baseline `pnpm turbo typecheck --filter=./packages/platejs/src/features/list` -> stopped
  before the package at the unrelated shared Core build error
  `getPlateCorePlugins.ts(10,14) TS2527`.
- Final `pnpm --filter platejs test` -> exit 0.
- Final `pnpm --filter platejs lint` -> 13 files clean.
- Final family inventory -> 85 named `it`/`test` blocks across three owner
  specs, plus the two retained input-rule matrices; six public behavior cases
  and one configured-schema case were restored during closure.
- Final package source-first typecheck audit -> command exits 1 in nine
  `code-block` and four Core rows; zero package-local `src/` errors.
- Final package artifact build -> exits 2 because `@platejs/core` declarations
  cannot resolve, then emits contextual-inference cascades.
- `pnpm --filter www exec tsc --noEmit -p tsconfig.json --pretty false` ->
  exits 1 in shared Markdown/AI/www schema WIP; zero errors mention
  `list-toolbar-button.tsx` or `transforms.ts`.
- `pnpm brl` -> 56/56 tasks pass.
- `pnpm check:core` -> runner/leak/brand contracts pass 22/22; subsequent
  schema-adoption audit fails only in shared markdown/plite-dom/suggestion/table.
- Source audits -> zero old nested/raw APIs, helper taxonomy directories,
  production `any`/non-null/plugin annotations, nested update callbacks, or
  unowned single-use tx functions.
- Final `.agents/skills/autoreview/scripts/autoreview --mode local --prompt
  <scoped legacy-list-model contract>` -> exit 0, `autoreview clean: no
  accepted/actionable findings reported`; two prior P2 configured-type
  findings were accepted, repaired, and regression-tested.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-07-23-plate-next-legacy-list-colocation.md` -> exit 0,
  `[autogoal] complete`.
- Browser `/blocks/list-demo` -> blocked before list mount by duplicate
  `footnoteReference`; server and browser report the same owner error.

Final handoff contract:
- target surface and mode: complete named `packages/platejs/src/features/list` review
- files/APIs reviewed: 79 checkpoint-zero rows plus 4 deliberate owner paths
- broad Core drift score coverage: N/A; broad Core sweep excluded
- package file checklist coverage: 83/83 score 100, 0 deferred
- best Plate v2 recommendation: one core owner, behavior-family tests, flat
  React families, scoped `toggle`/`indent`/`outdent`
- verdict matrix summary: keep 15 final files; merge/delete/move 68 initial
  paths; add 4 deliberate moved/merged owners
- Plite/Plate gaps or blockers: no package gap; shared code-block/Core,
  Markdown/AI/www, artifact, and demo-composition blockers only
- related scoped sweep query/active scope/matches/patched/deferred: five sweeps
  above, zero package residuals
- out-of-scope matches discovered: docs references, shared type/artifact WIP,
  and duplicate footnote runtime composition
- changes made: implementation/test/React colocation, API adoption, changeset
- tests/proof commands: recorded above
- old compatibility names audited: zero in package and direct runtime adopters
- needs attention: shared type/artifact and demo composition blockers
- next best Plate Next packet: user selects after this package closes

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Package and goal closure complete |
| Where am I going? | Hand the completed package back to the user |
| What is the goal? | Complete: all initial and final package rows score 100 |
| What have I learned? | Only six private tx algorithms deserve names; each has 3-7 production consumers |
| What have I done? | Collocated package, hard-cut raw API, retained behavior-family coverage, repaired configured types, adopted callers, repaired changeset, and ran proof |

Timeline:
- 2026-07-23T17:41:00.669Z Goal plan created.
- 2026-07-23 checkpoint zero: read `plate-next`, `autogoal`, `best-api`, and
  `architecture-cleanup`; created active goal; recorded package boundary,
  public API/release impact, manifest, and zero-file extracted inventory before
  implementation.
- 2026-07-23 closure: reduced 79 files to 15, closed 83 review rows, ran
  package/app/Core/browser proof, accepted and fixed two autoreview findings,
  classified the shared blockers, and passed the final checker.

Open risks:
- Product docs still contain raw-helper reference sections; package mode leaves
  those for the docs owner.
- Artifact build and browser smoke remain blocked by separately owned shared
  Core/registry drift recorded above.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| checkpoint zero | complete | 79/79 initial rows materialized |
| core colocation | complete | one implementation owner, no helper taxonomy |
| React colocation | complete | flat descriptors/hooks/spec |
| public API adoption | complete | scoped flat calls in package and direct callers |
| package proof | complete with shared blockers | tests/lint and scoped error filters pass; shared blockers classified |
| final review | complete | final Codex autoreview exits 0 with no actionable findings |
| final checker | complete | checker exits 0 on the recorded final evidence |
