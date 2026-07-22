# plate-next first three package full colocation

Objective:
Fully colocate find-replace, link, and suggestion; done when no single-owner
helper files or avoidable tx-parameter helpers remain and package proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-22-plate-next-first-three-package-full-colocation.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api
- agent-native

Plate Next source:
- prompt / link: user correction after the first three-package packet: move
  all transforms, queries, utils, and similar single-owner modules inline into
  their plugin; generally avoid new functions with a `tx` parameter
- mode: exhaustive package topology correction across exactly three packages
- target surface: `packages/find-replace`, `packages/link`, and
  `packages/suggestion`, plus the Plate Next rule/template owner needed to
  prevent recurrence
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes; enumerate every production
  transform/query/util/helper module and every function accepting `tx` in the
  three packages
- package review mode: yes; the previous named-helper packet was too narrow
- package review target: all files in the three packages, scored package by
  package before closure
- package file checklist gate: one manifest row per package file; every
  production helper topology row must reach 100 or have a real reuse/boundary
  justification
- completion threshold summary: inline every single-production-owner behavior
  path into its plugin, delete obsolete files/exports, reject newly extracted
  tx-parameter functions, sync the Plate Next doctrine, and pass package proof

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
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: binary manifest and proof gates
- improvement loop: audit one package at a time, inline/delete each unjustified
  helper owner, then rerun its caller/export/tx-parameter sweep before moving on
- final score / loop closure: all three manifests close with zero unjustified
  helper files and zero avoidable tx-parameter functions

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Doctrine correction | completed | Source rule/template updated; generated skill synchronized by `pnpm install` |
| Three-package implementation | completed | 66 baseline rows merged/deleted; 24 owner-proof rows added |
| Package and caller proof | completed | 25/25 typecheck tasks, 156 tests, three builds, lint, barrels, and www typecheck passed |
| Runtime docs proof | completed | Link and suggestion docs rendered their current plugin APIs in Browser |
| Review and closeout | completed | Agent-native review and scoped autoreview passed; 140/140 rows score 100 |

Completion threshold:
- Exactly `find-replace`, `link`, and `suggestion` are reviewed. Minimal
  consumer and reference-doc migrations outside those package trees are
  allowed only to close removed public exports; they are not a fourth package
  review.
- Every file in all three package manifests has a scored row. Every production
  `transforms/`, `queries/`, `utils/`, `helpers/`, `with*`, `decorate*`, and
  similar module is either merged into its single plugin owner or justified by
  multiple production consumers or a real independent boundary.
- No line-count or readability threshold justifies extraction.
- No newly introduced standalone function accepts `tx` merely to ferry the
  active transaction out of a plugin callback. Existing in-scope tx-parameter
  helpers are inlined when single-owner; every survivor has concrete reuse or
  independent-owner evidence.
- Obsolete files and barrel exports are deleted without aliases. Public API
  removals are represented by the existing package changesets or corrected
  changesets when the expanded hard cut changes their truth.
- `.agents/rules/plate-next.mdc` and the Plate Next plan template encode
  lexical inline tx ownership as the default; `pnpm install` syncs the
  generated skill without direct mirror edits.
- Source-first typecheck, focused/package tests, package builds, scoped lint,
  barrel generation when needed, exact source audits, agent-native review, and
  autoreview pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-next-first-three-package-full-colocation.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: owning package suites plus focused owner specs
- package proof: source-first typecheck, test, build, and lint for all three
  packages; `pnpm brl` when file exports change
- shared Core gate: N/A unless a real Core/Plite inference blocker is found
- source audits: complete file/caller/export inventory; exact directory-name,
  helper-export, and `tx`-parameter searches over all three package sources
- related scoped sweep query / active scope / match count / patched count / deferred count:
  record exact counts after each package correction
- package file manifest / row count / checked count / deferred count: generated
  before implementation from all three package trees
- Plite/Plate gap ledger: N/A unless inline inference exposes a missing owner API
- broad Core drift ledger gate: N/A: no Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-next-first-three-package-full-colocation.md`

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
- Review-mode rename freeze: keep current `HEAD` names/paths while behavior and
  API drift are under review. Put desirable later renames in
  `docs/plans/pre-renaming.md`; do not turn the active diff into Added/Deleted
  rename soup unless the user explicitly asks for a rename pass.
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
- Colocation has no line ceiling. A large plugin file is not a defect; a graph
  of one-use modules is.
- Prefer the plugin builder callback as the lexical owner of `tx`, `api`,
  options, editor, and plugin type. Do not create a standalone function with a
  `tx` parameter merely to move inferred code out of the plugin. Keep such a
  function only for multiple production consumers or a real independent
  algorithm boundary, with evidence recorded in the manifest.
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
  `defineEditorExtension({ name: pluginKey, ... })` just to satisfy types.
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
  intentionally decoupled cross-package code. Plugin-owned helper graphs should
  receive plugin context (`api`, `getOption`, `getOptions`, `setOption`, `tx`)
  or be thin wrappers over the typed plugin API/tx group.

Boundaries:
- allowed edit scope: the three package trees, their generated barrels and
  existing changesets, this goal plan, `.agents/rules/plate-next.mdc`,
  `docs/plans/templates/plate-next.md`, generated Plate Next skill sync, and
  the smallest AI, registry, app-test, and plugin-doc callers required by the
  hard-cut public APIs
- package/API surfaces: `@platejs/find-replace`, `@platejs/link`, and
  `@platejs/suggestion`
- docs/browser surfaces: `/docs/link` and `/docs/suggestion`, because their
  public helper references moved to plugin API/update groups
- non-goals: no fourth package review, no Core/Plite redesign unless inline
  inference proves a blocker, no compatibility aliases, no line ceiling, no
  unrelated docs/registry/generated-template edits
- out-of-scope package errors: record and do not fix unless caused by this packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Count and list package files first; read only production helper candidates,
  their plugin owners, caller edges, and affected proof files. The earlier
  broad `docs/plans` grep was truncated and will not be repeated.

Blocked condition:
- Stop only if a single-owner callback cannot infer inside its plugin without a
  public Core/Plite API decision, or the same behavior regression survives
  three distinct owner-correct fixes.

Current verdict:
- verdict: merge-existing-owner / hard-cut for every single-owner helper;
  keep only proven reuse or independent boundaries
- confidence: high; all 140 audited rows close at score 100, including 24
  owner-named replacement specs
- next owner: plate-next
- keep / revert / quarantine call: keep the full owner-colocation packet; no
  quarantined packet
- reason: 66 baseline helper/test rows were merged or hard-cut, package proof
  is green, and exact audits find no helper directories or tx-carrier helpers

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | All three packages, every transforms/queries/utils/helper path, avoid new tx-parameter functions, no line ceiling, proof and final handoff recorded above |
| `plate-next` skill/rule read | yes | Full generated skill read before implementation; live source owner identified |
| Active goal checked or created | yes | No active goal existed; goal created for this exact correction plan |
| Mode classified as named packet vs broad Core sweep | yes | Exhaustive review of exactly three feature packages; no Core sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Owner-first inline plugin shape; no helper aliases |
| Broad Core drift ledger initialized when in scope | no | N/A: no Core target |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; exact package and doctrine files listed above |
| Output budget strategy recorded | yes | Manifest/count first; targeted reads with capped output |
| Public API fork routing checked | yes | Internal owner merges are accepted; any newly discovered public API fork stops for `plate-plan` |
| Gap policy checked | yes | Stop for a named inference/API gap; no tx ferry workaround |
| Related scoped sweep policy checked | yes | Full helper/tx/caller audit within the three packages; outside matches deferred |
| Review-mode rename freeze checked | yes | Overridden for owner merges/deletions; public plugin concepts remain stable |
| Package review checklist initialized when in scope | yes | `rg --files packages/find-replace packages/link packages/suggestion | sort`; 116 rows materialized before implementation |
| Package/API pack selected | yes | `package-api` materialized in this plan |
| Public surface or package boundary identified | yes | Three published package sources/barrels and existing breaking changesets |
| Release artifact path selected | yes | Existing major changesets for all three published packages were corrected to describe their full public hard cuts |
| `changeset` skill loaded when `.changeset` is required | yes | Full skill read; one-package major changeset form and latest-state prose applied |
| Barrel/export impact decision recorded | yes | Removed helper exports required `pnpm brl`; generated barrels are current |
| Agent-native pack selected | yes | `agent-native` materialized because Plate Next doctrine changes |
| Agent-facing action surface identified | yes | Plate Next helper ownership and tx-parameter decision rules |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/plate-next.mdc` and plan template; regenerate `.agents/skills/plate-next/SKILL.md` via `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Full skill read; capability map and source-owner audit recorded below |

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
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Typecheck 25/25, 156 focused tests, three builds, lint, barrels, docs typecheck, and browser proof passed |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: exactly three product packages were reviewed |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 140/140 rows score 100; 66 hard-cut/merged baseline rows; zero deferred |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Plugin-owned behavior with lexical tx ownership; no helper graph or line ceiling |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | No blocker; one non-blocking Core transaction typing debt recorded |
| Related scoped sweep after correction | yes | For each correction, run and record same-class search/review results inside the active scope | Exact helper-directory, import/export, old-name, and tx-parameter sweeps recorded below |
| Package file checklist | yes | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | Baseline 116 plus 24 owner-named proof rows; 140 checked; zero deferred |
| Helper topology / lexical tx ownership | yes | Audit every helper directory/file and standalone tx-parameter function; inline/delete single-owner rows or prove reuse/independent ownership | Zero helper directories and zero standalone tx-parameter functions; `diffToSuggestions` is the sole independent algorithm boundary |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | All owning package checks passed |
| Shared Core gate coverage | no | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | Product plugin packages do not belong in `check:core` |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | No unresolved package error; the initial caller inference failures were caused by removed exports and fixed at their boundaries |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | No active old standalone helper imports/exports in package, registry, or plugin-doc scope |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: only tests were renamed to their real plugin owner; no postponed production rename |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | 25 reported paths: one baseline file plus 24 owner-named replacement specs, all inventoried |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs or record N/A | Scoped local autoreview: clean, zero findings, patch correct, confidence 0.72 |
| Final lint/check | yes | Run scoped lint/check or record N/A | Package lint and targeted Biome passed; final plan check is the last gate |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; only non-blocking Core typing debt remains |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-next-first-three-package-full-colocation.md` | Run after final autoreview evidence is recorded |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Standalone helpers hard-cut in favor of typed plugin APIs/update groups; callers and docs migrated |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published breaking API/runtime cleanup in three packages |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Three existing one-package major changesets corrected; no forbidden package/version combination |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: package changes are published; registry edits are caller migrations only |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: published users see hard-cut APIs |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | 25/25 typecheck tasks, 156 tests, and three package builds passed |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl`: 56/56 passed |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed and regenerated Plate Next skill from the rule owner |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Generated skill explicitly says inline single-owner helpers and avoid tx-carrier functions |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Manual capability-map review passed with no actionable finding |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `FindReplacePlugin` decoration | 2 -> 0 | merge-existing-owner | `FindReplacePlugin` | Decoration is lexical plugin behavior; package tests pass | keep inline |
| Link base transforms/rules/utilities | 5 -> 0 | hard-cut / merge-existing-owner | `BaseLinkPlugin` | 28 baseline rows removed; typed API/update groups and 69 tests pass | keep inline |
| Link floating utilities | 4 -> 0 | merge-existing-owner | `LinkPlugin` | Floating API and URL helpers live in the React plugin; callers and tests pass | keep inline |
| Suggestion queries/transforms/utilities/policy | 5 -> 0 | hard-cut / merge-existing-owner | `BaseSuggestionPlugin` | 38 baseline rows removed; typed API/update groups and 79 tests pass | keep inline |
| `diffToSuggestions` | 0 | keep-in-plate | independent algorithm | Pure diff conversion has its own production consumer and focused tests | keep standalone |
| Standalone functions accepting `tx` | 5 -> 0 | hard-cut | owning plugin callback | Exact final search finds zero; temporary link upsert carrier was deleted | prohibit by doctrine |
| Removed public helper callers/docs | 3 -> 0 | hard-cut migration | package plugin APIs | AI, registry, app test, and bilingual docs use installed plugin/update APIs | keep current API only |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `find-replace` | Decoration inline in `FindReplacePlugin` | `decorate*` helper file | One owner and direct inferred callback context | none |
| `link` | Base behavior in `BaseLinkPlugin`; UI behavior in `LinkPlugin` | transforms/utils directories, standalone helpers, tx ferry | Plugin portals give the shortest typed path | none |
| `suggestion` | Queries, values, policy, and mutations in `BaseSuggestionPlugin` | query/transform/util directories, policy file, tx ferry | One semantic owner; a large file is cheaper than a scattered graph | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Non-blocking Core typing debt | `state.transaction(tx)` does not preserve installed plugin tx-group knowledge through command-created transactions | A standalone helper or broad `any` cast would hide the generic loss and recreate the topology bug | Core transaction generic owner | Core type-test proving installed tx groups survive command transaction conversion | Local narrow `PlatePluginTransaction<BaseSuggestionContract>` assertions at the external boundary; no helper extraction; follow-up only |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Full find-replace colocation | `packages/find-replace/src` | helper directories, `decorate*`/`with*` definitions, standalone tx parameters | 0 final | 0 in correction; prior owner merge verified | 0 | none |
| Full link colocation | `packages/link/src` | baseline helper rows plus helper-directory/import/export and tx-parameter searches | 28 baseline rows; 0 final | 28 merged/deleted; temporary tx carrier deleted | 0 | none |
| Full suggestion colocation | `packages/suggestion/src` | baseline helper rows plus helper-directory/import/export and tx-parameter searches | 38 baseline rows; 0 final | 38 merged/deleted | 0 | none |
| Old public helper surface | three packages, AI callers, registry, plugin docs | exact old helper identifier search | 0 final | all discovered callers/docs migrated | 0 | unrelated `getLinkAttributes` component prop intentionally excluded |
| Owner topology | all three package source trees | `find` for `transforms`, `queries`, `utils`, `helpers`; exact top-level tx-function regex | 0 final | all in-scope rows closed | 0 | `ContentSlice.withContent` is an unrelated method call, not a helper definition |

Core drift ledger:
- Applies: no; these are product plugin packages, not Core-adjacent substrate
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: 0
- Actual row count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Top drift rows: none

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | product-only review | Plate feature packages | No `packages/core` file is in scope | none |

Package file checklist:
- Applies: yes
- Package: `find-replace`, `link`, and `suggestion`
- Manifest command: `rg --files packages/find-replace packages/link packages/suggestion | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Baseline row count: 116 (`find-replace` 9, `link` 53, `suggestion` 54)
- Final current manifest count: 74 (`find-replace` 9, `link` 34, `suggestion` 31)
- Added owner-named proof rows: 24 (`link` 9, `suggestion` 15)
- Audited row count: 140 (116 baseline plus 24 added proof rows)
- Baseline kept count: 50
- Baseline hard-cut/merged count: 66
- Checked score-100 count: 140
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: satisfied; all 140 audited rows are score 100

Package file rows:
- [x] `packages/find-replace/CHANGELOG.md` — score: 100 — verdict: keep-in-plate — owner: @platejs/find-replace package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/find-replace/README.md` — score: 100 — verdict: keep-in-plate — owner: @platejs/find-replace package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/find-replace/package.json` — score: 100 — verdict: keep-in-plate — owner: @platejs/find-replace package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/find-replace/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/find-replace package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/find-replace/src/lib/FindReplacePlugin.spec.ts` — score: 100 — verdict: keep-in-plate — owner: FindReplacePlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/find-replace/src/lib/FindReplacePlugin.ts` — score: 100 — verdict: keep-in-plate — owner: FindReplacePlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/find-replace/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: FindReplacePlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/find-replace/tsconfig.build.json` — score: 100 — verdict: keep-in-plate — owner: @platejs/find-replace package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/find-replace/tsconfig.json` — score: 100 — verdict: keep-in-plate — owner: @platejs/find-replace package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/CHANGELOG.md` — score: 100 — verdict: keep-in-plate — owner: @platejs/link package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/README.md` — score: 100 — verdict: keep-in-plate — owner: @platejs/link package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/package.json` — score: 100 — verdict: keep-in-plate — owner: @platejs/link package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/link package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/lib/BaseLinkPlugin.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: BaseLinkPlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/lib/BaseLinkPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: BaseLinkPlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/lib/BaseLinkRuntimePlugin.spec.ts` — score: 100 — verdict: keep-in-plate — owner: BaseLinkPlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/lib/LinkRules.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: BaseLinkPlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/lib/LinkRules.ts` — score: 100 — verdict: hard-cut — owner: BaseLinkPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: BaseLinkPlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/lib/transforms/index.ts` — score: 100 — verdict: hard-cut — owner: BaseLinkPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/lib/transforms/insertLink.ts` — score: 100 — verdict: hard-cut — owner: BaseLinkPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/lib/transforms/unwrapLink.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseLinkPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/link/src/lib/transforms/unwrapLink.ts` — score: 100 — verdict: hard-cut — owner: BaseLinkPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/lib/transforms/upsertLink.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseLinkPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/link/src/lib/transforms/upsertLink.ts` — score: 100 — verdict: hard-cut — owner: BaseLinkPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/lib/transforms/upsertLinkText.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseLinkPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/link/src/lib/transforms/upsertLinkText.ts` — score: 100 — verdict: hard-cut — owner: BaseLinkPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/lib/transforms/wrapLink.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseLinkPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/link/src/lib/transforms/wrapLink.ts` — score: 100 — verdict: hard-cut — owner: BaseLinkPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/lib/utils/createLinkNode.ts` — score: 100 — verdict: hard-cut — owner: BaseLinkPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/lib/utils/encodeUrlIfNeeded.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseLinkPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/link/src/lib/utils/encodeUrlIfNeeded.ts` — score: 100 — verdict: hard-cut — owner: BaseLinkPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/lib/utils/getLinkAttributes.ts` — score: 100 — verdict: hard-cut — owner: BaseLinkPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/lib/utils/index.ts` — score: 100 — verdict: hard-cut — owner: BaseLinkPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/lib/utils/safeDecodeUrl.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseLinkPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/link/src/lib/utils/safeDecodeUrl.ts` — score: 100 — verdict: hard-cut — owner: BaseLinkPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/lib/utils/validateUrl.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseLinkPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/link/src/lib/utils/validateUrl.ts` — score: 100 — verdict: hard-cut — owner: BaseLinkPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/react/LinkPlugin.tsx` — score: 100 — verdict: keep-in-plate — owner: LinkPlugin / link UI surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/react/components/FloatingLink/FloatingLinkNewTabInput.tsx` — score: 100 — verdict: keep-in-plate — owner: LinkPlugin / link UI surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/react/components/FloatingLink/FloatingLinkUrlInput.tsx` — score: 100 — verdict: keep-in-plate — owner: LinkPlugin / link UI surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/react/components/FloatingLink/LinkOpenButton.tsx` — score: 100 — verdict: keep-in-plate — owner: LinkPlugin / link UI surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/react/components/FloatingLink/index.ts` — score: 100 — verdict: keep-in-plate — owner: LinkPlugin / link UI surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/react/components/FloatingLink/useFloatingLinkEdit.ts` — score: 100 — verdict: keep-in-plate — owner: LinkPlugin / link UI surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/react/components/FloatingLink/useFloatingLinkEnter.ts` — score: 100 — verdict: keep-in-plate — owner: LinkPlugin / link UI surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/react/components/FloatingLink/useFloatingLinkEscape.ts` — score: 100 — verdict: keep-in-plate — owner: LinkPlugin / link UI surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/react/components/FloatingLink/useFloatingLinkInsert.ts` — score: 100 — verdict: keep-in-plate — owner: LinkPlugin / link UI surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/react/components/FloatingLink/useVirtualFloatingLink.ts` — score: 100 — verdict: keep-in-plate — owner: LinkPlugin / link UI surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/react/components/index.ts` — score: 100 — verdict: keep-in-plate — owner: LinkPlugin / link UI surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/react/components/useLink.ts` — score: 100 — verdict: keep-in-plate — owner: LinkPlugin / link UI surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/react/components/useLinkToolbarButton.ts` — score: 100 — verdict: keep-in-plate — owner: LinkPlugin / link UI surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/react/index.ts` — score: 100 — verdict: keep-in-plate — owner: LinkPlugin / link UI surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/src/react/transforms/index.ts` — score: 100 — verdict: hard-cut — owner: LinkPlugin / link UI surface — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/react/transforms/submitFloatingLink.ts` — score: 100 — verdict: hard-cut — owner: LinkPlugin / link UI surface — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/react/utils/floatingLinkTriggers.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: LinkPlugin / link UI surface — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/link/src/react/utils/getLinkAttributes.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: LinkPlugin / link UI surface — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/link/src/react/utils/index.ts` — score: 100 — verdict: hard-cut — owner: LinkPlugin / link UI surface — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/react/utils/triggerFloatingLink.ts` — score: 100 — verdict: hard-cut — owner: LinkPlugin / link UI surface — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/react/utils/triggerFloatingLinkEdit.ts` — score: 100 — verdict: hard-cut — owner: LinkPlugin / link UI surface — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/src/react/utils/triggerFloatingLinkInsert.ts` — score: 100 — verdict: hard-cut — owner: LinkPlugin / link UI surface — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/link/tsconfig.build.json` — score: 100 — verdict: keep-in-plate — owner: @platejs/link package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/link/tsconfig.json` — score: 100 — verdict: keep-in-plate — owner: @platejs/link package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/CHANGELOG.md` — score: 100 — verdict: keep-in-plate — owner: @platejs/suggestion package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/README.md` — score: 100 — verdict: keep-in-plate — owner: @platejs/suggestion package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/package.json` — score: 100 — verdict: keep-in-plate — owner: @platejs/suggestion package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/suggestion package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.slow.tsx` — score: 100 — verdict: keep-in-plate — owner: BaseSuggestionPlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.spec.ts` — score: 100 — verdict: keep-in-plate — owner: BaseSuggestionPlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: BaseSuggestionPlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/src/lib/diffToSuggestions.spec.ts` — score: 100 — verdict: keep-in-plate — owner: diffToSuggestions algorithm boundary — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/src/lib/diffToSuggestions.ts` — score: 100 — verdict: keep-in-plate — owner: diffToSuggestions algorithm boundary — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: BaseSuggestionPlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/src/lib/insertBreakSuggestion.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: BaseSuggestionPlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/src/lib/queries/findSuggestionNode.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/queries/findSuggestionNode.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/queries/findSuggestionProps.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/queries/findSuggestionProps.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/queries/index.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/transforms/acceptSuggestion.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/transforms/acceptSuggestion.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/transforms/addMarkSuggestion.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/transforms/addMarkSuggestion.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/transforms/deleteFragmentSuggestion.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/transforms/deleteSuggestion.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/transforms/deleteSuggestion.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/transforms/getSuggestionProps.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/transforms/getSuggestionProps.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/transforms/index.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/transforms/insertFragmentSuggestion.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/transforms/insertFragmentSuggestion.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/transforms/insertTextSuggestion.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/transforms/rejectSuggestion.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/transforms/rejectSuggestion.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/transforms/removeMarkSuggestion.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/transforms/removeMarkSuggestion.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/transforms/removeNodesSuggestion.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/transforms/removeNodesSuggestion.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/transforms/setSuggestionNodes.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/transforms/setSuggestionNodes.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/types.ts` — score: 100 — verdict: keep-in-plate — owner: BaseSuggestionPlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/src/lib/update-policy.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/utils/SkipSuggestionDeletes.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/utils/SkipSuggestionDeletes.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/utils/getActiveSuggestionDescriptions.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/utils/getActiveSuggestionDescriptions.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/utils/getSuggestionId.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/utils/getSuggestionKeys.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/utils/getSuggestionKeys.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/utils/getSuggestionNodeEntries.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: BaseSuggestionPlugin — evidence: coverage renamed adjacent to the plugin owner; focused suite green — next: deleted old path
- [x] `packages/suggestion/src/lib/utils/getSuggestionNodeEntries.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/utils/getTransientSuggestionKey.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/lib/utils/index.ts` — score: 100 — verdict: hard-cut — owner: BaseSuggestionPlugin — evidence: behavior merged into plugin owner; export/caller/source audits green — next: deleted
- [x] `packages/suggestion/src/react/SuggestionPlugin.tsx` — score: 100 — verdict: keep-in-plate — owner: SuggestionPlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/src/react/index.ts` — score: 100 — verdict: keep-in-plate — owner: SuggestionPlugin — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/tsconfig.build.json` — score: 100 — verdict: keep-in-plate — owner: @platejs/suggestion package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep
- [x] `packages/suggestion/tsconfig.json` — score: 100 — verdict: keep-in-plate — owner: @platejs/suggestion package surface — evidence: source audited; owning typecheck/test/build/lint proof green — next: keep

- [x] `packages/link/src/lib/BaseLinkPlugin.getAttributes.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseLinkPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/link/src/lib/BaseLinkPlugin.unwrap.spec.tsx` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseLinkPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/link/src/lib/BaseLinkPlugin.upsert.spec.tsx` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseLinkPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/link/src/lib/BaseLinkPlugin.upsertText.spec.tsx` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseLinkPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/link/src/lib/BaseLinkPlugin.validateUrl.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseLinkPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/link/src/lib/BaseLinkPlugin.wrap.spec.tsx` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseLinkPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/link/src/react/LinkPlugin.decodeUrl.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: LinkPlugin / link UI surface — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/link/src/react/LinkPlugin.encodeUrl.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: LinkPlugin / link UI surface — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/link/src/react/LinkPlugin.triggers.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: LinkPlugin / link UI surface — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.accept.spec.tsx` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.activeDescriptions.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.addMark.spec.tsx` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.delete.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.findNode.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.findProps.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.getProps.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.insertFragment.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.keys.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.nodeEntries.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.reject.spec.tsx` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.removeMark.spec.tsx` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.removeNodes.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.setNodes.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.skipDeletes.spec.ts` — score: 100 — verdict: keep-in-plate (justify-new-proof-tooling) — owner: BaseSuggestionPlugin — evidence: owner-named replacement spec preserves moved coverage; focused suite green — next: keep

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| find-replace | `FindReplacePlugin` | Decoration must stay with its only plugin owner | full package manifest and focused proof | keep merged owner | none |
| link | `BaseLinkPlugin` / `LinkPlugin` | Transform/util/rule files obscure inference and ownership | 53 baseline rows, caller/export sweep, 69 tests | delete 28 baseline rows; keep 25; add 9 owner specs | none |
| suggestion | `BaseSuggestionPlugin` | Query/transform/util/policy graph is one plugin split across files | 54 baseline rows, caller/export sweep, 79 tests | delete 38 baseline rows; keep 16; add 15 owner specs | none |
| doctrine | Plate Next source rule/template | Prior preservation rule blocked the best topology | source rule, template, generated skill, `pnpm install` | encode no line ceiling and lexical tx ownership | use for next package |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| 9 `packages/link/**Plugin*.spec.*` paths listed above | justify-new-proof-tooling | Old tests lived under helper paths; no matching owner-named path on `origin/main` | keep beside `BaseLinkPlugin` / `LinkPlugin` | 69 tests pass |
| 16 `packages/suggestion/**BaseSuggestionPlugin*.{spec,slow}.*` paths listed above | justify-new-proof-tooling | Old tests lived under helper paths or the slow owner proof was already extracted; no matching path on `origin/main` | keep beside `BaseSuggestionPlugin` | 79 tests pass |
| Inventory command | 25 paths total | `git ls-files --others --exclude-standard packages/find-replace packages/link packages/suggestion` | Every path has an individual score-100 package row; 24 are additional to the 116-row baseline and one was already in it | zero unclassified paths |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | no unresolved out-of-scope package failure | all touched callers and package proof are green | none |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| `getLinkAttributes` | `apps/www/src/registry/ui/inline-void-suggestion.slow.tsx` component prop | Unrelated local prop, not the removed Link helper | keep; registry component owner |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Plugin-owned find-replace decoration, link APIs/updates/rules, and suggestion APIs/updates/policy; obsolete helper files and exports deleted; minimal AI/registry/app callers migrated |
| tests/proof | Helper-path specs renamed beside plugin owners; 156 tests, package typechecks/builds/lint, barrels, www typecheck, and browser docs proof pass |
| docs/templates/skills | Link and suggestion English/Chinese docs use plugin APIs; three major changesets corrected; Plate Next rule/template/generated skill enforce full colocation |
| reverted/quarantined packets | Duplicate branch-only changesets deleted; temporary `applyLinkUpsert(editor, tx, ...)` extraction deleted; no quarantined code |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Core command-transaction generic preservation | Suggestion commands need narrow local assertions because installed tx groups are lost through `state.transaction(tx)` | `BaseSuggestionPlugin.ts` command callbacks | Fix in Core with a type-test later; do not recreate tx helpers |

Findings:
- The harsh answer is confirmed by source: these packages were badly
  over-split. Sixty-six baseline rows existed only to route one plugin's own
  behavior through filenames and imports.
- No line ceiling is useful here. `BaseSuggestionPlugin.ts` is large but has a
  single semantic owner, local inference, and direct tests. Splitting it by
  verb would make agent navigation and type flow worse.
- Reuse, not visual size, is the extraction threshold. `diffToSuggestions`
  remains standalone because it is a pure independent algorithm; the rest did
  not clear that bar.
- Agent-native review passed: `plate-next` routes to its source rule and plan
  template, the generated skill exposes the new action rule, and `pnpm install`
  owns synchronization. No actionable discoverability gap remains.

Decisions and tradeoffs:
- Hard-cut public standalone helpers without aliases; plugin API/update groups
  are the only current public path.
- Keep the three Biome-required top-level URL regexes in `BaseLinkPlugin.ts`;
  they are performance-owned constants, not behavior modules.
- Use narrow contract assertions only where Core loses installed transaction
  group knowledge. Do not hide that debt behind a new function accepting `tx`.
- Migrate only callers and latest-state docs forced by removed exports; do not
  broaden this into a fourth package review.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad combined `rg` output was noisy/truncated | 1 | Split by exact topology pattern and bounded scope | Final exact searches are zero |
| Inline defaults with `satisfies` narrowed option literals | 1 | Put defaults under the real explicit plugin contract generic | Source-first typecheck passes |
| Biome rejected callback return and inline regex allocation | 2 | Use a block callback; retain three top-level compiled regexes | Scoped lint passes |
| AI/www generic editors lacked installed suggestion group knowledge | 1 | Assert the plugin contract only at the external generic boundary | AI and www typechecks pass |
| Browser cold compile exceeded first navigation window | 1 | Reuse the same tab after server warmup | Both docs routes rendered and were inspected |
| Suggestion docs emitted hydration warning for Browser-injected iframe attribute | 1 | Compare warning diff and page output | Tool attribute only; docs content/API render and no product exception observed |
| TypeScript 7 package exposes version-only root API | 1 | Use the installed Babel TypeScript parser for the structural audit | AST audit proves zero top-level production functions with a direct `tx` parameter |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/find-replace --filter=./packages/link --filter=./packages/suggestion --filter=./packages/ai`: 25/25 tasks passed.
- `pnpm --filter www typecheck`: passed, including docs source parity and
  registry source checks.
- `bun test packages/find-replace/src`: 8 passed; `bun test
  packages/link/src`: 69 passed; `bun test packages/suggestion/src`: 79 passed.
- Package builds for `@platejs/find-replace`, `@platejs/link`, and
  `@platejs/suggestion`: passed.
- Package `lint:fix` plus targeted Biome: passed with no remaining fix.
- `pnpm brl`: 56/56 passed. Final `pnpm install`: lockfile current and Plate
  Next generated skill synchronized.
- Exact source audits: zero helper directories, zero helper barrel/import
  references, zero standalone tx-parameter functions, zero relevant
  `with*`/`decorate*` definitions, and zero old standalone helper identifiers
  in active package/caller/plugin-doc scope.
- Browser: `/docs/link` rendered typed update/plugin API examples with no
  console error; `/docs/suggestion` rendered plugin API and update tables. Its
  only console warning diff was the Browser-injected iframe match attribute.
- `.agents/skills/autoreview/scripts/autoreview --mode local ...`: clean, zero
  actionable findings; `patch is correct`, confidence 0.72.

Final handoff contract:
- target surface and mode: exhaustive package topology correction for
  `find-replace`, `link`, and `suggestion`
- files/APIs reviewed: 116 baseline rows plus 24 added owner-proof rows; all
  plugin APIs, tx groups, exports, public callers, and current plugin docs
- broad Core drift score coverage: N/A; no Core sweep and no Core source edit
- package file checklist coverage: 140/140 score 100; zero deferred; 66
  baseline rows merged/hard-cut
- best Plate v2 recommendation: lexical plugin ownership, inference-first,
  extract only for actual reuse or independent algorithm ownership
- verdict matrix summary: find-replace merged; link and suggestion helper
  graphs hard-cut; `diffToSuggestions` kept as the sole algorithm boundary
- Plite/Plate gaps or blockers: no blocker; one Core generic-preservation debt
- related scoped sweep query/active scope/matches/patched/deferred: exact
  helper directories/imports/exports/tx functions/old API names; zero final,
  66 baseline rows patched, zero deferred
- out-of-scope matches discovered: one unrelated `getLinkAttributes` registry
  component prop, intentionally unchanged
- changes made: runtime/API colocation, owner-named tests, caller/doc migration,
  changesets, Plate Next doctrine and generated skill sync
- tests/proof commands: typecheck, 156 tests, three builds, lint, barrels, www
  typecheck, exact audits, Browser, agent-native review, autoreview
- old compatibility names audited: yes; zero relevant active matches
- needs attention: optional Core transaction-generic follow-up only
- next best Plate Next packet: audit the next feature package by full manifest,
  using the corrected doctrine instead of helper-name sampling

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final review gate |
| Where am I going? | Clean handoff after autoreview and plan validation |
| What is the goal? | Full plugin colocation across the first three packages |
| What have I learned? | Reuse is the only valid extraction threshold here |
| What have I done? | Closed 140 rows, deleted/merged 66 baseline rows, and passed implementation proof |

Timeline:
- 2026-07-22T15:47:58.590Z Goal plan created.
- 2026-07-22 Package manifests audited; full helper topology correction applied.
- 2026-07-22 Public callers, bilingual docs, changesets, and Plate Next doctrine synchronized.
- 2026-07-22 Package, app-doc, source-audit, agent-native, and Browser proof passed.
- 2026-07-22 Scoped autoreview passed with zero findings.

Open risks:
- Non-blocking Core generic debt described above. No package runtime blocker.
