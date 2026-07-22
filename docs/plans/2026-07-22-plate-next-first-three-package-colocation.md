# plate-next first three package colocation

Objective:
Colocate plugin-owned behavior in find-replace, link, and suggestion; done when all 3 pass focused proof and stale helper exports are absent.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-22-plate-next-first-three-package-colocation.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api
- docs (supporting public API truth for the removed find-replace helper)

Plate Next source:
- prompt / link: user requested the first batch of three packages after accepting owner-first colocation and explicitly removing any line ceiling
- mode: named plugin-owner packet across three packages
- target surface: `packages/find-replace`, `packages/link`, and `packages/suggestion`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, limited to the three named packages and exact removed helper symbols
- package review mode: no; this is a named owner/API packet, not an exhaustive review of every file in each package
- package review target: N/A
- package file checklist gate: N/A: named owner/API packet
- completion threshold summary: merge the three selected single-consumer helper modules into their plugin owners, regenerate exports, preserve behavior, and pass focused package proof

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
- initial confidence score: N/A: binary three-package threshold
- improvement loop: fix focused proof failures until all three packages close or a real owner blocker is proven
- final score / loop closure: N/A

Completion threshold:
- Exactly three packages are completed: find-replace, link, and suggestion.
- `decorateFindReplace`, `withLink`, and `withSuggestion` no longer exist as separate exported helper modules or stale source references.
- Plugin callback inference is owned inline by `FindReplacePlugin`, `BaseLinkPlugin`, and `BaseSuggestionPlugin`; no one-use context/config ferry types remain.
- Focused tests and source-first typechecks pass for all three packages; `pnpm brl` is clean after export removal.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-next-first-three-package-colocation.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package tests covering find-replace decoration, link runtime behavior, and suggestion behavior
- package proof: source-first typecheck for `./packages/find-replace`, `./packages/link`, and `./packages/suggestion`; package tests; scoped lint
- docs proof: `pnpm --filter www build:source`, `pnpm --filter www check:docs`, and browser proof for the find-replace guide
- shared Core gate: N/A: no Core/Plite owner change planned
- source audits: exact searches for `decorateFindReplace`, `withLink`, `withSuggestion`, their deleted paths, and one-use extension contract types
- related scoped sweep query / active scope / match count / patched count / deferred count: exact symbol searches under the three named packages; record after edits
- package file manifest / row count / checked count / deferred count: N/A: named plugin-owner packet, not package review mode
- Plite/Plate gap ledger: N/A unless implementation exposes a missing builder inference capability
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-next-first-three-package-colocation.md`

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
- Review-mode rename freeze: explicitly overridden by the user for this packet.
  Merge/delete/rename single-consumer helper files when that improves owner
  colocation. Preserve public plugin concepts and keys; do not keep compatibility
  exports.
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
- allowed edit scope: the three named package source/test/barrel surfaces, generated barrels, one changeset per package when the removed export exists on `origin/main`, and active docs that name the removed helpers or renamed proof files
- package/API surfaces: `@platejs/find-replace`, `@platejs/link`, and `@platejs/suggestion`
- docs/browser surfaces: `content/docs/(plugins)/(functionality)/find-replace.mdx` plus active editor-behavior evidence matrices; generated registry JSON and historical/archive docs remain untouched
- non-goals: no fourth package, no Core/Plite API redesign, no unrelated query/transform consolidation, no line ceiling
- out-of-scope package errors: record but do not fix unless caused by this packet

Output budget strategy:
- Use targeted reads of the three plugin/helper/spec files and exact symbol searches; cap test output and exclude generated/build trees.

Blocked condition:
- A required inline callback cannot infer its owning plugin contract without a Core API change, or focused behavior proof repeatedly fails for an unresolved semantic reason after three distinct fixes.

Current verdict:
- verdict: merge-existing-owner for all three helpers
- confidence: high; each helper has one production plugin installer and tests/barrels do not count as independent owners
- next owner: plate-next
- keep / revert / quarantine call: keep; source-first typecheck and focused behavior suites pass after owner colocation
- reason: owner-first colocation removes file hops and inference ferry types without changing behavior

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Three named packages; owner-first colocation; no line ceiling; no compatibility exports; focused proof and handoff recorded above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` and `.agents/rules/plate-next.mdc` read |
| Active goal checked or created | yes | Goal created for this exact three-package threshold |
| Mode classified as named packet vs broad Core sweep | yes | Named plugin-owner packet; broad Core sweep N/A |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Merge helpers into plugin owners and hard-cut stale exports |
| Broad Core drift ledger initialized when in scope | no | N/A: no Core target |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; three named packages plus generated barrels/changesets |
| Output budget strategy recorded | yes | Targeted reads/searches and capped package proof |
| Public API fork routing checked | yes | User explicitly accepted deletion/renaming topology; no unresolved API fork needs `plate-plan` |
| Gap policy checked | yes | Stop for a named builder inference gap; no workaround types |
| Related scoped sweep policy checked | yes | Exact helper symbol/path sweeps inside the three named packages |
| Review-mode rename freeze checked | yes | Explicitly overridden by user; plugin names/keys stay stable |
| Package review checklist initialized when in scope | no | N/A: named owner/API packet, not exhaustive package review mode |
| Package/API pack selected | yes | `package-api` materialized in this plan |
| Public surface or package boundary identified | yes | Three published package barrels lose standalone helper exports |
| Release artifact path selected | yes | One `.changeset` per package only when `origin/main` proves the helper export is published there |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/rules/changeset.mdc` read before baseline audit |
| Barrel/export impact decision recorded | yes | Run `pnpm brl`; never edit generated barrels manually |

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
- [x] Supporting docs pack: latest-state API copy, source parity, and rendered-route proof are closed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Three package builds, 17-task typecheck graph, 62 focused/slow tests, docs checks, and browser proof passed |
| Broad Core drift ledger coverage | no | N/A: named feature-package packet | No Core file or API changed |
| Score gate | yes | Own or cut every scored drift row | All three over-split helpers were cut and merged into their plugin owners |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Owner-first colocation with no helper aliases or line ceiling recorded below |
| Plite/Plate gap ledger | yes | Record blockers or N/A | N/A: builder inference held without a Core or Plite change |
| Related scoped sweep after correction | yes | Search exact removed symbols in active scope | Zero exact matches remain in package source, active content, or behavior matrices |
| Package file checklist | no | N/A: named owner/API packet, not exhaustive package review mode | Package review manifest and score-100 file rows do not apply |
| Package/API proof | yes | Run focused typecheck, test, build, and docs proof | All named commands in Verification evidence passed |
| Shared Core gate coverage | no | N/A: product-only feature packages | `check:core` ownership did not change |
| Non-Core package error triage | yes | Classify proof failures | Wrong-cwd link test and concurrent find-replace build were invocation/environment failures; canonical reruns passed |
| Source audit | yes | Search removed helper/type names | Exact active-scope audit returned zero matches; deleted paths are absent |
| Rename ledger | no | N/A: no rename was postponed | User explicitly allowed renames; both proof files use plugin-owner names |
| Extracted-file inventory | yes | Classify new/renamed proof files | Two rows recorded below; one tracked rename and one untracked owner-named slow proof |
| Autoreview / review | yes | Run structured local review | Clean: zero actionable findings, correctness confidence 0.82 |
| Final lint/check | yes | Run scoped lint and diff checks | Three package lint lanes and scoped `git diff --check` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Recorded below; no user decision required |
| Goal plan complete | yes | Run final mechanical plan check | `[autogoal] complete` returned for this plan |
| Public API / package boundary proof | yes | Audit exports against `origin/main` | All three helpers were public on `origin/main`; generated barrels no longer export them |
| Release artifact classification | yes | Classify published delta | Three breaking public export removals, one per published package |
| Published package changeset | yes | Add one correctly scoped changeset per package | Three single-package major changesets added; no forbidden minor bump exists |
| Registry changelog | no | N/A: no registry source implementation changed | Active docs changed; generated registry JSON remains CI-owned |
| No release artifact | no | N/A: published users see export removals | Major package changesets are required and present |
| Package typecheck/build/test | yes | Run owning package checks | All three builds and the shared source-first typecheck graph passed; 62 tests passed |
| Barrel/export generation | yes | Run `pnpm brl` | 56 of 56 barrel tasks passed and removed the three helper exports |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `decorateFindReplace` / `FindReplacePlugin` | 3 | cut helper; merge behavior into owner | `@platejs/find-replace` | One production installer, one public barrel hop, callback inference available in owner | Keep plugin-owned decoration |
| `withLink` / `BaseLinkPlugin` | 3 | cut helper; merge behavior into owner | `@platejs/link` | One production installer; extension consumes only owning `type` | Keep plugin-owned commands/correction |
| `withSuggestion` / `BaseSuggestionPlugin` | 4 | cut helper; merge behavior into owner | `@platejs/suggestion` | One production installer plus self-plugin lookups and one-use extension contract | Keep inferred `api`/`getOptions` context inline |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Find replace | One `FindReplacePlugin` module owns options, schema, and decoration | Public decorator alias; separate context/range ferry types | Direct builder callback gives the shortest inference and navigation path | none |
| Link | One `BaseLinkPlugin` module owns link commands and content correction | Public `withLink`; forwarding wrapper | Behavior has one installer and no reusable independent identity | none |
| Suggestion | One `BaseSuggestionPlugin` module owns API plus command/correction extension | Public `withSuggestion`; circular `editor.plugin(BaseSuggestionPlugin)` self-lookups | Chained builder context infers `api`, options, editor, and type directly | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No missing builder capability | No workaround was needed | N/A | Typecheck and inferred callback compilation | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Merge three single-consumer helpers | Three named packages | Exact word search for removed helpers/types | 0 remaining | 3 helper modules, 3 barrels, 2 proof filenames | 0 active | Historical plans/solutions and CI-owned registry output intentionally excluded |
| Repair current API docs | Active content and behavior matrices | Exact word search for helper/type names | 0 remaining | 16 stale current-state references | 0 active | Rendered route confirms current owner copy and no old API names |

Core drift ledger:
- Applies: no: no Core target
- Manifest command: N/A: named feature-package packet
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: 0
- Actual row count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A: no Core rows
- Top drift rows: none

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | no Core review | N/A | No Core files touched | none |

Package file checklist:
- Applies: no: named owner/API packet, not package review mode
- Package: `find-replace`, `link`, and `suggestion` owner surfaces only
- Manifest command: N/A: exact owner/helper paths were frozen instead
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 0 exhaustive rows
- Actual row count: 0 exhaustive rows
- Checked score-100 count: 0
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A: all three named owners closed together

Package file rows:
- [x] N/A exhaustive file row — score: 100 — verdict: named API packet — owner: plate-next — evidence: exhaustive package review mode did not apply — next: none

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| find-replace owner merge | `FindReplacePlugin` | Public decorator is a one-consumer inference detour | owner module, owner spec, barrel, docs, changeset | keep | closed |
| link owner merge | `BaseLinkPlugin` | Public installer is a one-consumer inference detour | owner module, runtime/rule specs, barrel, matrices, changeset | keep | closed |
| suggestion owner merge | `BaseSuggestionPlugin` | Public installer adds self-lookup and contract ferry | owner module, fast/slow specs, barrel, matrix, changeset | keep | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/find-replace/src/lib/FindReplacePlugin.spec.ts` | merge-existing-owner | `origin/main` owns `decorateFindReplace.spec.ts` | Rename proof to the runtime owner and invoke `plugin.decorate` | 8 focused tests pass |
| `packages/suggestion/src/lib/BaseSuggestionPlugin.slow.tsx` | merge-existing-owner | No file at either owner name on `origin/main`; renamed from the existing worktree helper-named slow proof | Keep owner-named slow behavior suite | 32 slow tests pass |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| None | No unresolved package error | All canonical package commands pass | none |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Removed helper names | Historical plans/solutions and 3 CI-owned `apps/www/public/r/*.json` files | Historical evidence is immutable; registry JSON is generated and forbidden to edit locally | CI registry generation / historical owners |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Inlined decoration, link commands/correction, and suggestion commands/corrections into their three plugin owners; deleted helper modules and barrel exports |
| tests/proof | Renamed decorator/slow suites to plugin owners and exercised plugin-owned callbacks; no behavior assertions removed |
| docs/templates/skills | Updated find-replace latest-state docs, active behavior matrices, this plan, and three package changesets; no generated registry file edited |
| reverted/quarantined packets | None |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | No user decision required | All named gates pass | this plan | Continue with another three-package batch only on a new request |

Findings:
- Each removed helper had one production installer; tests and barrels were not independent reuse owners.
- All three helper exports exist on `origin/main`, so this is a breaking hard cut, not cosmetic file cleanup.
- Suggestion colocation removes circular self-plugin lookups by consuming inferred `api` and `getOptions` from the owning builder callback.
- Current find-replace docs and active evidence matrices named deleted helpers/proof files; latest-state docs are repaired while historical and generated artifacts remain untouched.

Decisions and tradeoffs:
- No line ceiling. Split only for real reuse, independent ownership, or proof infrastructure.
- No compatibility exports or aliases. Consumers install the owning plugin.
- Keep real public option/API contracts; remove only one-use extension/context ferry types.
- Three separate major changesets preserve one-package-per-file release truth.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Package-cwd Bun run resolved mixed `packages/core/dist` and source identities for link commands | 1 | Use the root source-alias test lane | Root `bun test` passed all 30 focused tests |
| Find-replace artifact build raced the concurrent dependency graph and could not resolve `@platejs/plite` | 1 | Rerun after the source-first graph settles | Sequential package build passed |
| Dev MDX cache was regenerated once without `PLATE_WWW_DYNAMIC_DOCS=1`, temporarily removing the `docs` export | 1 | Regenerate with the owning env and restart the dev server | Route returned 200 with correct copy and zero console errors |
| Final changeset validation used a malformed `awk` expression, then exposed that autoreview cleanup had removed the working-tree copies of staged new changesets | 1 | Validate with `rg`, restore only the three exact files, and re-run closure checks | Three changeset files restored; no other known untracked file was disturbed |

Verification evidence:
- `pnpm brl`: 56/56 tasks passed.
- `pnpm turbo typecheck --filter=./packages/find-replace --filter=./packages/link --filter=./packages/suggestion`: 17/17 tasks passed.
- Root focused Bun suite: 30 passed, 0 failed, 56 expectations across five files.
- `pnpm test:slow -- packages/suggestion/src/lib/BaseSuggestionPlugin.slow.tsx`: 32 passed, 0 failed, 108 expectations.
- All three package artifact builds passed; all three scoped lint lanes passed.
- `pnpm --filter www check:docs`: docs source parity passed.
- Browser `http://localhost:3000/docs/find-replace`: title `Find - Plate`, correct owner/match-scope copy, no removed names, zero console errors.
- Exact active-scope source audit: zero matches for all removed helpers and ferry types; all three deleted module paths are absent.
- Structured autoreview: zero actionable findings; patch correct; confidence 0.82.
- Scoped `git diff --check`: passed.

Final handoff contract:
- target surface and mode: named owner/API packet across exactly `find-replace`, `link`, and `suggestion`
- files/APIs reviewed: three plugin owners, three deleted helper modules/exports, owner-named proof files, active API docs, and release artifacts
- broad Core drift score coverage: N/A: no Core scope
- package file checklist coverage: N/A: not exhaustive package review mode
- best Plate v2 recommendation: colocate single-consumer plugin behavior in the plugin builder; extract only for reuse or independent ownership
- verdict matrix summary: three hard cuts, three owner merges, zero compatibility aliases
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: exact removed-name search; active package/docs scope; 0 remaining; 3 helpers, 3 barrels, 2 proof names, and 16 docs references patched; 0 active deferred
- out-of-scope matches discovered: historical plans/solutions plus three generated registry JSON files
- changes made: owner colocation, helper deletion, proof renames, barrel regeneration, latest-state docs, and three major changesets
- tests/proof commands: all evidence listed above passed
- old compatibility names audited: yes; zero exact active-scope matches and deleted paths absent
- needs attention: none
- next best Plate Next packet: select the next three one-consumer plugin helper owners in a separate batch

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Scope and baseline | complete | Exactly three packages frozen; `origin/main` export truth captured |
| Owner colocation | complete | Three helpers merged and deleted; inference held |
| Public surface and docs | complete | Barrels, changesets, current docs, and active evidence references repaired |
| Proof and review | complete | Typecheck, 62 tests, builds, lint, docs, browser, audits, and autoreview passed |
| Goal closure | complete | Plan evidence complete; `check-complete.mjs` passed |

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | First three-package batch at final mechanical closure |
| Where am I going? | Mark the quantitative goal complete after `check-complete.mjs` passes |
| What is the goal? | Colocate plugin-owned behavior in exactly find-replace, link, and suggestion with green proof and no stale active exports |
| What have I learned? | Single-consumer plugin helpers were navigation and inference debt; no Core gap blocks owner colocation |
| What have I done? | Implemented three hard cuts, repaired release/docs truth, and passed all proof/review gates |

Timeline:
- 2026-07-22T15:07:06.473Z Goal plan created.
- 2026-07-22T15:10:00Z Baseline confirmed all three helpers are exported on `origin/main`; major changesets required.
- 2026-07-22T15:14:00Z Three helpers merged into plugin owners; barrels regenerated; source-first types and focused behavior passed.
- 2026-07-22T15:20:00Z Current docs repaired; source parity and rendered route passed.
- 2026-07-22T15:25:14Z Structured autoreview returned zero actionable findings.
- 2026-07-22T15:27:00Z Autogoal mechanical completion check passed.

Open risks:
- CI-owned registry JSON still contains the old find-replace API copy until registry generation runs; local editing is forbidden by repository policy.
- The major changesets intentionally require direct-helper consumers to install the owning plugin instead; no compatibility alias softens that break.
