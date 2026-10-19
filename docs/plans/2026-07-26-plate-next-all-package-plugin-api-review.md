# plate-next all package plugin API review

Objective:
Review every current package plugin API surface; done when each plugin has a
source-backed `api` / `read` / `update` / `extension` verdict, coverage counts
reconcile, and no package source changes.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-26-plate-next-all-package-plugin-api-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api

Plate Next source:
- prompt / link: user requested “review ALL packages plugins current
  api/update extension, suggest final api/read/update for all of them” and
  explicitly prohibited source changes
- mode: exhaustive cross-package public API audit, review-only
- target surface: every production Plate plugin descriptor declared under
  `packages/**/src/**/*.{ts,tsx,mts,cts}`, including Core built-ins, Base
  descriptors, Plate/React adapters, aliases, and descriptors with no current
  capability fields
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; Core plugin descriptors are included, but this is not
  a file-by-file Core drift sweep
- correction-triggered related scoped sweep: N/A; no implementation correction
  is authorized
- package review mode: no; this is one bounded cross-package API manifest, not
  sequential package migration or attestation
- package review target: N/A
- package file checklist gate: N/A; replaced by one row per production plugin
  declaration
- doctrine version: 12
- package applied version / fingerprint state: read-only context only; no
  package attestation is authorized
- sync mode / target: no
- sync queue row count: 0
- completion threshold summary: manifest count equals reviewed ledger count;
  every row records current and recommended capability ownership; exclusions,
  ambiguities, duplicate aliases, and recommended migration priority reconcile

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
- initial confidence score: N/A; exact row reconciliation is the metric
- improvement loop: enumerate, classify, manually verify every risky/ambiguous
  row, rerun the manifest, then independently review the artifact
- final score / loop closure: 100% declaration coverage, zero unexplained rows,
  zero package source writes

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Doctrine and scope | complete | `plate-next`, `best-api`, Vision, and review-only boundary read |
| Production inventory | complete | 183 descriptors across 37 packages; zero parse/ambiguity gaps |
| Source classification | complete | six family reviews reconcile 183/183 |
| Final aggregation | complete | machine JSON and rendered Markdown validate |
| Independent artifact audit | complete | frozen-snapshot read-only review recorded below |
| Source stability | complete | two byte-identical scanner/validator runs on final hash |

Completion threshold:
- Every production Plate plugin declaration under `packages/**/src` has exactly
  one ledger row with package, symbol, source line, builder kind, current
  `api`/`read`/`update`/`extension` shape, recommended final placement, priority,
  evidence, and next owner.
- The audit records manifest query, source snapshot fingerprint, expected rows,
  reviewed rows, missing rows, duplicate rows, excluded non-production rows,
  and ambiguous rows. Missing, duplicate, and ambiguous counts are zero.
- Current extension behavior is classified as keep editor-wide, move to plugin
  `api`/`read`/`update`, keep lexical/private, or promote to a separate honest
  capability.
- Recommendations obey the final doctrine: state-bound queries on `read`, pure
  services on plugin `api`, mutations on plugin `update`, editor-wide behavior
  in `extension`, independent contributions in constructors, and `.extend()`
  only for real earlier-capability or imported/prebuilt dependencies.
- One ranked P0-P3 summary identifies the cross-package migration sequence and
  every Core/Plite type or runtime gap.
- No file under `packages/**/src` changes. Only this plan and its review
  artifacts may be written.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-plate-next-all-package-plugin-api-review.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: N/A; review-only with no runtime/source change
- package proof: N/A; no package implementation is modified
- shared Core gate: N/A; no Core source or type contract is modified
- source audits: TypeScript-AST declaration manifest plus independent lexical
  reconciliation for builder calls, chained `.extend()`, `api`, `read`,
  `update`, `extension`, and exported plugin symbols
- related scoped sweep query / active scope / match count / patched count / deferred count:
  review-only; matched/reviewed counts recorded, patched count must remain zero
- package file manifest / row count / checked count / deferred count: N/A;
  plugin declaration manifest is the owning completeness gate
- version registry validation / starting status / final status: read-only
  doctrine validation; no package status changes
- package fingerprint command / result: N/A; cross-package source snapshot
  fingerprint replaces per-package attestation
- Plite/Plate gap ledger: every recommendation blocked by current builder,
  projection, portal, or transaction typing receives an exact owner/proof row
- broad Core drift ledger gate: N/A; not a broad Core file review
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-plate-next-all-package-plugin-api-review.md`

Constraints:
- Review only. Never modify `packages/**/src`, package tests, manifests,
  exports, changesets, generated output, skills, rules, or Vision.
- “ALL” means no sampling: each production plugin descriptor receives a row,
  even when its final recommendation is “keep as-is” or it exposes no
  capability.
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
  'foo' })`. Manual plugin config types are only for real options, API, tx,
  selectors, state, or external public contracts.
- Plugin editor extension law: plugin-owned editor extension options belong in
  `.extend({ extension })`. Do not wrap them in
  `defineEditorExtension({ name: pluginName, ... })` just to satisfy types. The
  `extension` contribution accepts built extensions and raw options; raw
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
- allowed edit scope: this plan and
  `docs/plans/artifacts/2026-07-26-plate-next-all-package-plugin-api-review/**`
- package/API surfaces: read-only `packages/**/src`; public barrels/types and
  representative production callers may be read to resolve ownership
- docs/browser surfaces: docs may be read as call-site evidence; no docs edits,
  dev server, or Browser proof
- non-goals: no implementation, API hard cut, package attestation, changeset,
  barrel generation, package build/test, registry adoption, or skill repair
- out-of-scope package errors: N/A unless they prevent source parsing; no
  unrelated failure may broaden this review

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Generate machine-readable TSV/JSON inventories under the artifact directory,
  inspect counts and high-risk slices in chat, and keep the exhaustive ledger
  in the artifact instead of printing hundreds of rows.
- Exclude `dist`, generated output, tests/specs, fixtures, templates,
  `node_modules`, caches, and apps from the production declaration manifest;
  count each exclusion class separately.

Blocked condition:
Stop only if the current source cannot be parsed or a descriptor remains
ambiguous after AST ownership, barrel/export, and production-caller inspection.
Do not resolve ambiguity by changing source.

Current verdict:
- verdict: review complete; 183/183 production plugin descriptors classified
- confidence: high — AST builder accounting, six package-family source reviews,
  final source-snapshot reconciliation, and an independent artifact review
- next owner: `plate-plan` for an accepted migration; P0 order is AI,
  Navigation, then Table
- keep / revert / quarantine call: N/A; source is read-only
- reason: 140 rows keep their capability placement; 43 rows need a move,
  missing capability, identity repair, or constructor-only cleanup

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | ALL package plugins; current API/update/extension; final API/read/update; zero source changes |
| `plate-next` skill/rule read | yes | Generated v12 skill read completely |
| Active goal checked or created | yes | New quantitative audit goal created after confirming no active goal |
| Mode classified as named packet vs broad Core sweep | yes | Cross-package bounded API audit; not broad Core file review or package sync |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Final ownership laws copied above |
| Broad Core drift ledger initialized when in scope | no | N/A: Core file-by-file drift is not requested |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`, current `packages/**/src` |
| Output budget strategy recorded | yes | Count-first AST/lexical manifests and durable artifacts |
| Public API fork routing checked | yes | `best-api` owns recommendations; no implementation routing until user accepts |
| Gap policy checked | yes | Exact Core/Plite owner and proof required for blocked recommendations |
| Related scoped sweep policy checked | no | N/A: no corrections or source edits |
| Review-mode rename freeze checked | yes | No rename or implementation is authorized |
| Package review checklist initialized when in scope | no | N/A: declaration ledger is the exhaustive owner |
| Doctrine registry validated for package review/sync | no | N/A: no attestation or sync; doctrine v12 read |
| Sync queue materialized when sync mode is in scope | no | N/A: not sync mode |
| Package/API pack selected | yes | Public API audit rows are materialized |
| Public surface or package boundary identified | yes | Production Plate plugin declarations under package source |
| Release artifact path selected | no | N/A: review-only artifact has no published package delta |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset |
| Barrel/export impact decision recorded | yes | Read exports as evidence; write none |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: exhaustive cross-package plugin API audit, not broad
      Core file review, package migration, or sync.
- [x] Best Plate v2 call recorded for all 183 rows in
      `plugin-api-review.json`; 140 keep, 6 P0, 34 P1, 2 P2, 1 P3.
- [x] Legacy/backcompat decision recorded: accepted recommendations are hard
      ownership cuts with no compat aliases or duplicate root/plugin surfaces.
- [x] Hack check recorded: blocked moves name the real state/transaction owner;
      none recommends `any`, a wrapper dump, or a callback annotation.
- [x] Gap ledger records each blocker and smallest owner. The only cross-owner
      protocol blocker is AI's replayable preview/composite-history update.
- [x] Related scoped sweep closed without corrections: six package-family
      reviewers inspected descriptor owners plus adjacent editor/tx helpers;
      matches are reflected in the 183-row ledger, patched count is zero.
- [x] Broad Core drift ledger: N/A. Only 18 Core plugin descriptors are in
      scope; all 18 have exact rows in the exhaustive ledger.
- [x] Package review file checklist and doctrine attestation: N/A. This is one
      cross-package declaration review and makes no package edits/status claims.
- [x] Package sync/version queue: N/A. No sync or doctrine version change.
- [x] `check:core` adoption: N/A. No source, tooling, or package gate changed.
- [x] Direct one-shot, node-target, matcher, optional-read, normalization,
      inference, empty-config, and bridge implementation gates: N/A to this
      review-only capability-placement audit. Relevant owner problems found
      while reading a descriptor are recorded as gaps, not patched.
- [x] Plugin extension ownership audit closed: each current extension
      contribution is classified as genuinely editor-wide or moved in the
      recommendation to plugin `api`, `read`, `selectors`, or `update`.
- [x] Review matrix is the exhaustive 183-row machine ledger and rendered
      report linked below.
- [x] Public API implementation is routed to `plate-plan`; this run stops at
      review.
- [x] Review-mode rename freeze, extracted-file recovery, cleanup packet,
      compatibility-name source cut, package tests, barrels, and lint: N/A.
      No source rename, extraction, implementation, or generated output.
- [x] Changed list, ranked drift, needs-attention rows, and next owner are
      filled below.
- [x] Output budget discipline followed: concise plan summary plus full durable
      JSON/Markdown ledgers.
- [x] Package/API impact recorded: recommendations would be public hard cuts,
      but this review artifact changes no published package behavior.
- [x] Release artifact matrix: no changeset or registry changelog because this
      run writes review documents only.
- [x] Package proof and barrel generation: N/A; no package or export changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Reconcile every descriptor against the final snapshot | 183/183; zero missing, extra, duplicate, ambiguous, or parse-error rows |
| Broad Core drift ledger coverage | no | N/A | 18 Core plugin rows reviewed; no broad Core file claim |
| Score gate | yes | Rank all recommended moves | 140 keep, 6 P0, 34 P1, 2 P2, 1 P3 |
| Best Plate v2 recommendation | yes | Record current/final surfaces per row | `plugin-api-review.{json,md}` |
| Plite/Plate gap ledger | yes | Record blockers and real owners | Filled below and expanded per row in the artifact |
| Related scoped sweep after correction | no | N/A: no correction | Six read-only family sweeps; patched 0 |
| Package file checklist | no | N/A | Declaration ledger owns completeness |
| Package doctrine attestation | no | N/A | Review-only, no package status mutation |
| All-package sync closure | no | N/A | Not sync mode |
| Helper topology / lexical tx ownership | yes | Inspect adjacent package-owned editor/tx helpers | Missing capability promotions recorded for Code Block, Emoji, Mention, Selection, Tabbable, Tag, TOC, Toggle, and Markdown |
| Package/API proof | no | N/A | No source or runtime behavior changed |
| Shared Core gate coverage | no | N/A | No check owner changed |
| Non-Core package error triage | no | N/A | No package proof command |
| Source audit | yes | Parse production source and reconcile builders | Scanner and validator commands below |
| Rename ledger | no | N/A | Recommendations only; no rename landed or deferred in source |
| Extracted-file inventory | no | N/A | No source file created/moved/deleted |
| Autoreview / review | yes | Independent artifact-only review | Final read-only artifact audit recorded below |
| Final lint/check | yes | Validate generated JSON/Markdown and goal plan | Validator plus `check-complete.mjs` |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run `check-complete.mjs` | Final command recorded below |
| Public API / package boundary proof | yes | Record every proposed public move without implementing it | Full 183-row ledger |
| Release artifact classification | yes | Classify current diff | Agent-only review artifact; no published user-visible package delta |
| Published package changeset | no | N/A | No package change |
| Registry changelog | no | N/A | No registry change |
| No release artifact | yes | Record reason | Review-only plan/artifacts |
| Package typecheck/build/test | no | N/A | No package source/types/runtime changed |
| Barrel/export generation | no | N/A | No export or exported layout changed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| Basic nodes | 1 P3 / 32 | 31 keep; fold one independent shortcut stage | `basic-nodes` | `review-basic-nodes.json` | constructor cleanup only |
| Core + styles | 1 P0, 3 P1 / 34 | Navigation, Debug, ElementState, View need ownership/name repair | Core | `review-core-styles.json` | Navigation first |
| AI through Footnote | 3 P0, 10 P1 / 35 | split AI state/controller work; add Code Block, DOCX IO, Emoji, Comment, Footnote capabilities | package owners + Core for composite AI update | `review-early-packages.json` | AI protocol before adoption |
| Indent through Math | 7 P1, 2 P2 / 31 | Link/Markdown/root API and legacy-list-model read corrections; two constructor folds | package owners | `review-mid-packages.json` | root feature API cuts |
| Media through Suggestion | 7 P1 / 26 | option selectors, state reads, named updates, deterministic suggestion identity | package owners | `review-media-packages.json` | Selection/Suggestion first |
| Tabbable through Yjs | 2 P0, 9 P1 / 25 | Table query split plus missing Tabbable/Tag/TOC/Toggle reads | package owners | `review-late-packages.json` | Table first |
| Exhaustive ledger | 43 changed / 183 | one current/final row per descriptor | `plate-next` | `plugin-api-review.json` and rendered `plugin-api-review.md` | hand accepted target to `plate-plan` |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| All plugins | `api` service/controller; deterministic active-state `read`; option/store `selectors`; tx-bound `update`; editor-wide `extension` | root feature groups authored through extension, state queries in api/selectors, tx helpers taking editor/tx | one owner and one honest state model per operation | accept migration batches before source work |
| AI | replayable preview field; `read.hasPreview`; document/history methods in update; chat UI/network controllers in api delegating named updates | WeakMap preview state; moving entire mixed controller workflows wholesale into update | separates UI/session effects from editor mutation without losing history semantics | Core composite-update design needed |
| Navigation | plugin key `navigation`; pure selectors; scoped updates; effects/onCommit only in extension | `navigationFeedback` key plus root `api.navigation` and `tx.navigation`; mutating selector | current API is duplicated and a query clears state | no open API choice |
| Table | construction/schema/host services in api; 32 state queries in read; no document selectors; existing mutations in update | explicit state parameters and option selectors that inspect document selection | largest current read misclassification | no open API choice |
| Feature root APIs | plugin-scoped API/read/update for Debug, ElementState, Link, Markdown, Footnote, DOCX IO | feature namespaces injected through root extension | plugin identity already exists; root publication adds a second owner | hard cut, no alias |
| Helper promotions | add scoped reads/updates for Code Block, Emoji, Mention, Selection, Tabbable, Tag, TOC, Toggle; deterministic Suggestion identity split | exported one-owner editor/tx helpers and nondeterministic reads | shorter typed path and transaction ownership | package-by-package adoption |
| Authoring topology | constructor first; retain `.extend()` only for imported/prebuilt or earlier-capability dependency | independent shortcut/extension stages | `.extend()` is a type continuation, not a registry category | cleanup after capability moves |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plate state gap | AI preview is held in a WeakMap, so `hasPreview` cannot be a deterministic active-snapshot read | renaming the same WeakMap method to `read` would lie about replayability | `BaseAIPlugin` using an `ai.preview` extension field/effect | committed and active-tx reads agree; preview rollback/cancel tests | required before AI move |
| Core/Plate update gap | AI accept/cancel spans multiple commits and history operations | stuffing a multi-commit controller into one normal plugin update changes history semantics; leaving editor mutations in api keeps the wrong owner | Core composite update/history contract plus BaseAI adoption | preview accept/cancel undo stack and transaction replay tests | P0 design gate |
| Plate delegation gap | AIChat `hide/reset/reload/submit/show` mix UI/network control with document/history work | moving whole controller methods into update would put network/UI effects in tx; embedding direct or unnamed editor writes in api is equally wrong | AIChat api controllers orchestrating named BaseAI/AIChat/Core updates | controller tests prove identical UI behavior and named update/history calls | implement with AI P0 |
| Plate read gap | Footnote queries use an editor-keyed mutable registry that allocates anchors and invalidates only after transaction change | exposing the same registry calls under `read` would not observe the active transaction snapshot and would mutate during a read | Footnote Base owner | registry-free state-view queries or immutable cache keyed by state revision; committed/tx parity tests | required before Footnote move |
| Service/read boundary | DOCX export renders components and can fetch remote images; Table `getCellIndices` logs warnings | async IO is not replayable read, and logging is a read side effect | DOCX IO and Table owners | explicit-value `api.toBlob`; side-effect-free Table read returning data/diagnostics | required in package batches |
| No Core gap | Markdown, Link, Comment, Suggestion, and remaining helper promotions | local aliases would only preserve rejected ownership | owning packages; current builder already supports api/read/selectors/update/extension | package type inference, focused behavior tests, declaration build | direct hard cuts |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Exhaustive declaration inventory | `packages/**/src/**/*.{ts,tsx,mts,cts}` production source | Babel AST builder/derived-descriptor scan | 185 builder calls; 6 Core implementation calls; 183 plugin rows | 0 | 0 unreviewed | final source can drift concurrently, so scanner is rerun at freeze |
| Basic nodes helper sweep | `basic-nodes` | descriptor owners plus adjacent editor/tx helpers | 32 plugin rows | 0 | 1 recommendation | none after constructor cleanup row |
| Core/styles helper sweep | Core descriptors + `basic-styles`, Callout | descriptor/root publication and standalone helper review | 34 plugin rows | 0 | 4 recommendations | broader Core files explicitly outside scope |
| Early package helper sweep | AI through Footnote | descriptor owners plus standalone editor/tx/package helpers | 35 plugin rows | 0 | 13 recommendations | AI composite-update design |
| Mid package helper sweep | Indent through Math | descriptor owners plus standalone editor/tx/package helpers | 31 plugin rows | 0 | 9 recommendations | none beyond recorded package adoption |
| Media package helper sweep | Media through Suggestion | descriptor owners, React boundaries, standalone helper review | 26 plugin rows | 0 | 7 recommendations | cross-plugin media prompt and DOM geometry deliberately stay standalone |
| Late package helper sweep | Tabbable through Yjs | descriptor owners plus standalone helper review | 25 plugin rows | 0 | 11 recommendations | none beyond recorded package adoption |

Core drift ledger:
- Applies: no; this is not a broad Core file review
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A; the exhaustive plugin ledger still contains all 18
  Core plugin descriptors
- Expected row count: N/A
- Actual row count: 18 Core plugin descriptors
- Missing row count: 0 plugin descriptors
- Extra row count: 0 plugin descriptors
- Score gate: Navigation P0; Debug, ElementState, View P1; 14 keep
- Top drift rows: Navigation root API/update duplication and mutating query

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | broad Core file review not claimed | Core | 18 exact plugin rows in full artifact | separate `plate-next all core` only if requested |

Package file checklist:
- Applies: no; declaration ledger replaces sequential package-file scoring
- Package: all plugin-owning packages
- Manifest command: `node docs/plans/artifacts/2026-07-26-plate-next-all-package-plugin-api-review/scan-plugin-surfaces.mjs`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 183 production plugin descriptors
- Actual row count: 183
- Checked score-100 count: N/A; review verdicts replace implementation scores
- Unchecked/deferred count: 0 review rows; 43 implementation recommendations
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A; no package implementation started

Package file rows:
- [x] N/A — the 183 descriptor rows live in `plugin-api-review.json`; this run
      does not claim package file score 100 or package migration closure.

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| N/A | doctrine v12 read | v12 | source snapshot stable across two final runs | N/A | API review only | 183/183 ledger | `sha256:a14885d61abb5666f97c331088a4729fbcaacbd76659fb279b3e02ba851157f5` | no registry write |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Inventory | `plate-next` | “ALL” needs a real denominator | scanner + source manifest | 183 descriptors, 37 packages | freeze final snapshot |
| Classification | six package-family reviewers | api/read/update/extension ownership may drift independently | six `review-*.json` files | 140 keep, 43 recommendations | aggregate |
| Reconciliation | `plate-next` | concurrent source writes can stale row IDs/lines | validator remaps by package/file/symbol | zero missing/extra/duplicate/ambiguous | rerun twice at freeze |
| Final audit | independent read-only reviewer | wrong semantics can survive count reconciliation | generated JSON/Markdown plus risky source owners | clean after seven accepted repairs | close |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | no source extraction | N/A | review-only artifacts are the requested deliverable | no package source write |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no package command run | no implementation/type/runtime change | implementation packet owns future proof |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Cross-plugin media URL prompt orchestration | Image + MediaEmbed + browser prompt | not one plugin capability and review forbids source work | keep standalone |
| Cursor overlay geometry/hooks | DOM/React layout owners | not replayable editor-state reads | keep React/DOM-owned |
| Suggestion `diffToSuggestions` | independent configurable diff algorithm | not editor/plugin state | keep standalone |
| Generic Date/DnD helpers | Core/cross-domain/React-DnD boundaries | forcing them into one feature plugin would lie about ownership | keep standalone or route separately |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none |
| tests/proof | none; review-only scanner, validator, source manifest, and machine ledger added under plan artifacts |
| docs/templates/skills | this goal plan and review artifacts only; no template, skill, rule, Vision, app, or package docs |
| reverted/quarantined packets | removed one noisy lexical-candidate scratch artifact; no source packet |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | AI preview/history | only recommendation blocked by a real cross-owner protocol problem | rows 1-3 | design composite update/history plus replayable preview state before moving names |
| 2 | Navigation | current query mutates/clears state and root api/update duplicate one plugin | row 80 | rename owner to `navigation`, pure selectors, scoped updates |
| 3 | Table | largest read misclassification: 30+ state queries and document selectors | rows 164/168 | move snapshot queries to read in one Base owner, adapter inherits |
| 4 | Root feature APIs | Debug, ElementState, Link, Markdown, Footnote, DOCX IO hide plugin identity in extension | rows 67, 70, 88, 98/101, 110/111, 128 | hard-cut to scoped api/read/update; no aliases |
| 5 | Missing scoped helpers | one-owner editor/tx helpers remain in Code Block, Emoji, Mention, Selection, Tabbable, Tag, TOC, Toggle | linked changed rows | absorb into named read/update owners package by package |

Findings:
- The current design is healthier than the surrounding churn suggests:
  140/183 descriptors already have the right capability placement.
- `update` is mostly correct. The big debt is state queries living in `api` or
  selectors and feature namespaces injected through root `extension`.
- `read` must mean deterministic active-state computation. It cannot hide
  `nanoid`, `Date.now`, WeakMaps, option-only state, DOM layout, or network/UI
  controllers.
- `api` is not “pure only.” It is the correct owner for plugin services and
  UI/network/DOM/session controllers. Controllers may orchestrate named updates;
  direct transaction logic and unnamed document/selection/history mutation may
  not live in API.
- `extension` is not a namespace escape hatch. Keep it for editor-wide
  lifecycle, commands, corrections, codecs, fields/effects, and host substrate.
- `.extend()` is justified by type/ownership dependency, not by registry
  category. Only three low-priority independent stages need constructor folds.

Decisions and tradeoffs:
- Markdown serialization of the current document belongs at
  `editor.read.markdown.serialize()`. Explicit-input deserialize and inline
  serialize services stay at `editor.api.markdown.*` through normal keyed plugin
  projection. Only `editor.api.markdown.serialize()` is cut because it would
  bypass the active snapshot model.
- DOCX `toBlob` stays API and requires an explicit value/snapshot; rendering and
  remote image IO disqualify it from `read`.
- Footnote reads must cut the mutable anchor registry and compute from the
  supplied state view, or use an immutable state-revision cache.
- Table's `writeSelection` stays API because writing `DataTransfer` is a host
  side effect; `read.getCellIndices` also has to lose its debug logging.
- Suggestion identity lookup and identity creation split: deterministic lookup
  is `read.findIdentity`; clock/random fallback is explicit
  `api.createIdentity`.
- AI chat show/hide/reset/reload/submit stay API controllers, but their hidden
  editor writes must delegate to named updates.
- Cross-plugin media prompts, DOM cursor geometry, and independent diff
  algorithms remain standalone; colocation does not mean lying about a plugin
  owner.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| TypeScript 7 compiler API could not parse the live source graph reliably | 1 | use Babel parser on production candidates | zero parse errors |
| Early scanner counted nested/builder-implementation calls as descriptors | 2 | separate Core implementation calls and outer chain roots; add reconciliation equation | 185 calls - 6 implementation calls = 179 builder roots; +4 derived rows = 183 |
| Shared source changed during review | 2 observed snapshot changes | key reviews by package/file/symbol and remap line/ID on final scan | final stability rerun required before close |
| Broad lexical helper candidate list was noisy | 1 | rely on owner-family source review and per-row decision notes | scratch artifact deleted |

Verification evidence:
- `node docs/plans/artifacts/2026-07-26-plate-next-all-package-plugin-api-review/scan-plugin-surfaces.mjs`
  → 1,339 production source files fingerprinted; 147 candidate files; 185 AST
  builder calls; 6 builder implementation calls; 179 builder-root rows; 4
  separately derived rows; 1 typed generic plugin decorator; 183 plugin rows;
  0 parse/duplicate/ambiguous rows.
- `node docs/plans/artifacts/2026-07-26-plate-next-all-package-plugin-api-review/validate-and-build-review.mjs`
  → invokes a fresh scan before reading the raw manifest; 183/183 reviewed; 37
  packages; 0 missing/extra/duplicate rows.
- Two consecutive fresh validator runs produced the same combined artifact
  digest:
  `bb8be2ef2534599e74c5c354580f2b3967b1c2e2e41d8c0773dcd4d2e3b50a8a`.
- `pnpm exec biome check` on both artifact scripts and `jq empty` on every
  review JSON file pass.
- Six read-only owner reviews reconcile 32 + 34 + 35 + 31 + 26 + 25 = 183.
- Package typecheck/tests/build/lint/Browser: N/A. No package source, types,
  runtime, exports, docs route, or UI changed.
- Independent artifact audit accepted seven findings: keyed Markdown
  projection, controller orchestration law, DOCX service placement, Footnote
  registry purity, Table logging, atomic validation, and typed generic plugin
  decorator accounting. Its focused recheck is clean after all seven repairs
  and independently confirms the final source fingerprint.

Final handoff contract:
- target surface and mode: all production Plate plugin descriptors under
  `packages/**/src`; exhaustive review-only
- files/APIs reviewed: 1,339 source files fingerprinted; 147 candidate files
  parsed; 183 plugin descriptors across 37 packages classified
- broad Core drift score coverage: N/A; all 18 Core plugin descriptors included
- package file checklist coverage: N/A; descriptor ledger is 183/183
- doctrine start/final version and source-fingerprint state: v12 read; no
  doctrine write; final hash recorded by scanner
- version registry evidence and remaining stale/drifted count: N/A; no package
  attestation/sync
- best Plate v2 recommendation: one honest owner per operation using
  api/read/selectors/update/extension law above
- verdict matrix summary: 140 keep; 6 P0; 34 P1; 2 P2; 1 P3
- Plite/Plate gaps or blockers: replayable AI preview state and composite
  update/history semantics; all other moves fit current capability model
- related scoped sweep query/active scope/matches/patched/deferred: AST plus six
  package-family owner reviews; 183 reviewed; 0 patched; 43 recommendations
- out-of-scope matches discovered: cross-plugin media prompt, DOM cursor
  geometry, independent suggestion diff, generic Date/DnD helpers
- changes made: plan and artifacts only; no package source changes by this task
- tests/proof commands: scanner, validator, independent artifact audit, goal
  checker; package/browser proof N/A
- old compatibility names audited: recommendations explicitly reject aliases;
  no source cut performed
- needs attention: AI P0, Navigation P0, Table P0, then feature root API P1s
- next best Plate Next packet: `plate-plan` for the accepted AI/Core contract,
  otherwise Navigation is the cleanest self-contained implementation batch

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | final review closeout |
| Where am I going? | immutable 183-row recommendation handoff |
| What is the goal? | classify every package plugin without source changes |
| What have I learned? | 140 placements keep; read/root-extension ownership drives the 43 recommendations |
| What have I done? | enumerated, reviewed, reconciled, rendered, and independently audited all rows |

Timeline:
- 2026-07-26T11:45:35.482Z Goal plan created.
- 2026-07-26: Babel AST inventory reconciled 183 production descriptors across
  37 packages.
- 2026-07-26: Six package-family reviews classified all current/final surfaces
  and adjacent missing capability candidates.
- 2026-07-26: Aggregated machine ledger and rendered report generated against
  the final source snapshot.
- 2026-07-26: Independent artifact recheck closed clean after seven accepted
  corrections; two fresh validator runs remained byte-stable.

Open risks:
- Implementation can regress published declaration inference even when
  source-first type tests pass; every accepted package batch needs package
  declaration build proof.
- AI P0 cannot be implemented as a mechanical namespace move without changing
  preview/history behavior.
- This shared checkout had concurrent source writers during the review. The
  final scanner/validator is therefore run twice and the snapshot hash must
  remain identical before handoff.
