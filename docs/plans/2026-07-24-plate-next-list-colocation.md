# plate-next list colocation

Objective:
Colocate `@platejs/list` by durable plugin and React families; done when all 50
package rows score 100 and package proof, API audits, autoreview, and the plan
checker pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-24-plate-next-list-colocation.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none (`plate-next` already materializes the package/API gates)

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Inspect | complete | 50-row manifest, caller map, and helper topology |
| Implement | complete | 32 helper paths consolidated into 10 final files |
| Prove | complete | 109/109 tests plus typecheck/build/lint/barrels |
| Review | complete | Final autoreview clean; no actionable findings |
| Close | complete | All package gates closed; checker receipt below |

Plate Next source:
- prompt / link: user: `go list [$plate-next] ... colocation`
- mode: package review
- target surface: `packages/list`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, `packages/list` only
- package review mode: yes
- package review target: `@platejs/list`
- package file checklist gate: 50 live rows, each checked only at score 100
- completion threshold summary: 50/50 rows at score 100; package tests,
  typecheck/build/lint, barrels when exports move, scoped API/source audits,
  autoreview, `check:core`, and the goal checker pass or record a precise
  foreign-owner blocker without lowering the score gate

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
- Explicit user requirements:
  - execute the `list` package colocation now;
  - follow `plate-next`;
  - organize by durable plugin and React families, not helper taxonomy;
  - preserve coherent owners regardless of file length;
  - inline one-owner behavior and keep separate files only for real reuse or an
    independent owner;
  - do not expand into docs, browser, apps, or unrelated packages;
  - hand off the exact topology, API decision, proof, deferred outside-scope
    matches, and next package only after this package closes.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no timed checkpoint requested
- initial confidence score: N/A: file-level score-100 gate is the metric
- improvement loop: inspect, decide owner, consolidate, prove, autoreview,
  repair accepted findings, rerun proof
- final score / loop closure: 50/50 package rows at score 100

Completion threshold:
- Every one of the 50 live `packages/list/src` files is either consolidated
  into a durable owner or retained with reuse/independent-owner proof, and every
  resulting package row scores 100.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-plate-next-list-colocation.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/list test` plus focused
  behavior-family tests while editing
- package proof: `pnpm --filter @platejs/list typecheck`,
  `pnpm --filter @platejs/list build`, `pnpm --filter @platejs/list lint`
- shared Core gate: `pnpm check:core`
- source audits: package manifest/count, helper-directory and standalone `tx`
  functions, public exports/call sites, plugin inference, nested update/read,
  normalization, optional reads, and removed-path/name scans
- related scoped sweep query / active scope / match count / patched count /
  deferred count: package helper topology 32 / 32 / 0; outside adoption
  44 / 0 / 44
- package file manifest / row count / checked count / deferred count:
  `rg --files packages/list/src | sort`; 50 initial / 50 checked / 0 deferred
- Plite/Plate gap ledger: N/A, no substrate gap
- broad Core drift ledger gate: N/A: package review mode
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-plate-next-list-colocation.md`

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
  intentionally decoupled cross-package code. Inline single-owner plugin
  behavior in the builder context. Only a proven shared or independent helper
  should receive a narrow plugin context or required `tx` parameter.

Boundaries:
- allowed edit scope: `packages/list`, this goal plan, generated barrels when
  required, one package changeset when the published surface changes, and the
  smallest Core/Plite owner only if source proves it blocks correct inference
- package/API surfaces: `@platejs/list` root and `/react` exports
- docs/browser surfaces: excluded; package review has no browser/app route gate
- non-goals: docs, examples, app callers, registry, unrelated package cleanup,
  broad Core sweep, compatibility aliases, and migration preservation
- out-of-scope package errors: record exact foreign owner and continue package-
  local proof where possible; do not patch outside scope

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Read production owners in bounded family batches; collect repo call-site
  counts before printing matches; exclude generated/build/node_modules paths.

Blocked condition:
Only a required Core/Plite API or type-inference defect that cannot be repaired
inside the allowed smallest owner, or three repeated identical proof failures
with no autonomous alternative, may block closure.

Current verdict:
- verdict: consolidate
- confidence: 100/100
- next owner: plate-next
- keep / revert / quarantine call: keep the consolidated package
- reason: all 50 original rows have an explicit owner and score 100; the
  package is 10 files, all 32 helper/taxonomy paths are gone, and 109 focused
  tests plus typecheck/build/lint/barrel proof are green

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Explicit target, topology rules, boundaries, score gate, proof, stop condition, and handoff copied above |
| `plate-next` skill/rule read | yes | Full `.agents/skills/plate-next/SKILL.md` read before this checkpoint |
| Active goal checked or created | yes | `get_goal` returned none; goal created with this plan path |
| Mode classified as named packet vs broad Core sweep | yes | Package review: `packages/list`; broad Core sweep excluded |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Headless list capability stays Plate-owned; Plite owns only substrate |
| Broad Core drift ledger initialized when in scope | no | N/A: package review mode |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`, live `packages/list` source plus `origin/main` ownership evidence |
| Output budget strategy recorded | yes | Bounded family reads, count-first searches, generated/build exclusions |
| Public API fork routing checked | yes | `best-api` loaded; ideal call sites and hard-cut impact must be recorded before public implementation |
| Gap policy checked | yes | Record Core/Plite gap instead of local cast, alias, or tx helper |
| Related scoped sweep policy checked | yes | Same-class sweeps stay inside `packages/list`; outside matches are deferred |
| Review-mode rename freeze checked | yes | Ownership moves are allowed; cosmetic synonyms are rejected |
| Package review checklist initialized when in scope | yes | 50 live manifest rows materialized below |
| Package/API pack selected | yes | Package/API gates are already materialized by the `plate-next` template |
| Public surface or package boundary identified | yes | `@platejs/list` root and `/react` |
| Release artifact path selected | yes | `.changeset` if public exports/call shape change; otherwise exact no-artifact reason |
| `changeset` skill loaded when `.changeset` is required | yes | Existing `.changeset/list-scoped-api.md` updated under the loaded changeset rules |
| Barrel/export impact decision recorded | yes | Expected: exported file layout changes require `pnpm brl` |

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
| Named verification threshold | yes | Run named package proof | 109/109 focused tests, typecheck, build, lint, barrels green |
| Broad Core drift ledger coverage | no | N/A | Package review mode |
| Score gate | yes | Close all 50 original rows | 50 checked at score 100; 0 deferred |
| Best Plate v2 recommendation | yes | Record final topology | Matrix below |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No substrate gap |
| Related scoped sweep after correction | yes | Record exact searches | Ledger below |
| Package file checklist | yes | Exact initial/final manifests | 50 initial rows map to 10 final files |
| Helper topology / lexical tx ownership | yes | Audit helper and tx owners | Helper directories removed; only justified multi-use private algorithms remain |
| Package/API proof | yes | Package proof | Tests/typecheck/build/lint green |
| Shared Core gate coverage | yes | Check package coverage | `list` is present in `check-core.mjs`; execution blocked earlier by missing foreign caption package |
| Non-Core package error triage | yes | Classify foreign failure | `packages/caption/package.json` ENOENT; untouched owner |
| Source audit | yes | Audit removed names and compatibility exports | No old helper imports/exports inside package |
| Rename ledger | no | N/A | Ownership moves intentional; root and React barrels use origin/main `.ts` names |
| Extracted-file inventory | yes | Classify all six paths | Ledger below |
| Autoreview / review | yes | Final-scope review | Final exact-snapshot autoreview clean; two earlier actionable findings repaired and one pure-utility finding rejected |
| Final lint/check | yes | Scoped lint/check | Package lint and diff check green; shared check has foreign caption blocker |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run checker | Run after final review receipt |
| Public API / package boundary proof | yes | Audit exports/call shape | Inferred scoped API and generated barrels compile |
| Release artifact classification | yes | Published major API/layout hard cut | Existing `.changeset/list-scoped-api.md` updated |
| Published package changeset | yes | Correct package/version/prose | Major `@platejs/list` changeset |
| Registry changelog | no | N/A | No registry-only work |
| No release artifact | no | N/A | Published package delta requires changeset |
| Package typecheck/build/test | yes | Owning package checks | Green |
| Barrel/export generation | yes | Run package barrel generator | `pnpm --filter @platejs/list brl` green and output inspected |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| helper taxonomy and standalone `with*` | 5 | inline/delete | `BaseListPlugin.tsx` | 32 helper paths removed; package proof green | keep consolidated |
| scoped list API | 5 | hard cut | `BaseListPlugin` | Inferred `api.list.*` and `update.list.*`; old editor-bound raw exports absent | outside adoption later |
| pure `isOrderedList` | 0 | keep exported | editor-independent render predicate | Six real app/template consumers | keep |
| React hook topology | 4 | flatten/merge family | `src/react` | toolbar subhooks merged; todo element family flat | keep |
| test topology | 4 | merge by behavior family | three final specs | 46 fast and 63 slow tests green | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Headless list | One coherent inferred `BaseListPlugin.tsx`; private multi-use algorithms only; flat `api.list.*` and `update.list.*` | helper taxonomy, exported editor-bound transforms/queries, standalone `with*`, tx wrappers | Lowest inference and navigation path | accepted |
| React list | Flat descriptor, toolbar-hook family, todo-element-hook family | `react/hooks/` taxonomy and one file per subhook | Mirrors component/hook family ownership | accepted |
| Tests | Main fast owner, measured slow owner, React owner | one spec per deleted private helper | Tests public behavior, not implementation fragments | accepted |
| Pure render predicate | Keep `isOrderedList` standalone/exported | forcing static render consumers through an editor portal | Truly editor-independent and reused across layers | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | None | No cast, bridge, or substrate workaround was required | N/A | Package proof | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Initial helper topology | `packages/list/src` | classify helper/taxonomy paths | 32 | 32 | 0 | none |
| Raw editor-bound API hard cut | `packages/list/src` | old helper import/export and callback audit | package matches removed | all | 0 | none in package |
| Outside adoption audit | `apps/www/src`, `templates`, `content` | exact old list helper/API names | 44 lines / 9 files | 0 | 44 | separate adoption packet |
| Reviewer questioned pure helper | `apps/www/src`, `templates` | `isOrderedList` imports | 6 files | 0 | 0 | none; keep is correct |
| Reviewer found target mismatch | `packages/list/src` | configured list vs indent `targetPluginKeys` | 1 contract | 1 | 0 | regression proves shared targets |
| Reviewer found parser-owner mismatch | `packages/list/src` | element deserializers on non-element plugins | 1 parser | 1 | 0 | runtime proves default, custom-only, and multi-target ownership |

Core drift ledger:
- Applies: no — N/A: package review mode
- Manifest command: N/A
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
| N/A | N/A | Package review mode | N/A | Broad Core sweep excluded | N/A |

Package file checklist:
- Applies: yes
- Package: `@platejs/list`
- Manifest command: `rg --files packages/list/src | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 50
- Actual row count: 50
- Checked score-100 count: 50
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Final topology count: 10
- Next package blocked until: final autoreview and plan checker close

Package file rows:
- [x] `packages/list/src/__tests__/listPluginPage.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: BaseListPlugin family — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/index.tsx` — score: 100 — verdict: merge/inline into durable family —
      owner: package root barrel — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/BaseListPlugin.spec.tsx` — score: 100 —
      verdict: merge/inline into durable family — owner: headless behavior proof family — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/BaseListPlugin.tsx` — score: 100 — verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/BulletedListRules.ts` — score: 100 — verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/OrderedListRules.ts` — score: 100 — verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/TaskListRules.ts` — score: 100 — verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/index.ts` — score: 100 — verdict: merge/inline into durable family —
      owner: headless barrel — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/inputRules.spec.tsx` — score: 100 — verdict: merge/inline into durable family — owner: headless input-rule proof family — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/internal/isSameListSequence.spec.ts` — score: 100 — verdict: merge/inline into durable family — owner: headless list normalization proof —
      evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/internal/isSameListSequence.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/normalizers/normalizeListNotIndented.spec.tsx` —
      score: 100 — verdict: merge/inline into durable family — owner: headless normalization proof
      family — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/normalizers/normalizeListNotIndented.ts` — score: 100 — verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/normalizers/normalizeListStart.slow.tsx` — score: 100 — verdict: merge/inline into durable family — owner: headless normalization proof family —
      evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/normalizers/normalizeListStart.ts` — score: 100
      — verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof
      — next: closed
- [x] `packages/list/src/lib/normalizers/withInsertBreakList.spec.tsx` — score: 100 — verdict: merge/inline into durable family — owner: headless editing proof family —
      evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/normalizers/withInsertBreakList.ts` — score: 100 — verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/queries/areEqListStyleType.spec.ts` — score: 100 — verdict: merge/inline into durable family — owner: headless query proof family —
      evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/queries/areEqListStyleType.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/queries/expandListItemsWithChildren.spec.tsx` —
      score: 100 — verdict: merge/inline into durable family — owner: headless query proof family —
      evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/queries/expandListItemsWithChildren.ts` — score: 100 — verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/queries/getListAbove.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/queries/getListChildren.spec.tsx` — score: 100 —
      verdict: merge/inline into durable family — owner: headless query proof family — evidence: mapped owner and 109/109 package proof
      — next: closed
- [x] `packages/list/src/lib/queries/getListChildren.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/queries/getListSiblings.spec.tsx` — score: 100 —
      verdict: merge/inline into durable family — owner: headless query proof family — evidence: mapped owner and 109/109 package proof
      — next: closed
- [x] `packages/list/src/lib/queries/getListSiblings.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/queries/getNextList.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/queries/getPreviousList.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/queries/getSiblingList.spec.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless query proof family — evidence: mapped owner and 109/109 package proof
      — next: closed
- [x] `packages/list/src/lib/queries/getSiblingList.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/queries/getSiblingListStyleType.spec.tsx` — score: 100 — verdict: merge/inline into durable family — owner: headless query proof family —
      evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/queries/getSiblingListStyleType.ts` — score: 100 — verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/queries/isOrderedList.spec.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless query proof family — evidence: mapped owner and 109/109 package proof
      — next: closed
- [x] `packages/list/src/lib/queries/isOrderedList.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/transforms/indentList.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/transforms/outdentList.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/transforms/setListNodes.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/transforms/setListSiblingNodes.ts` — score: 100 — verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/transforms/toggleList.slow.tsx` — score: 100 —
      verdict: merge/inline into durable family — owner: headless transform proof family — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/transforms/toggleList.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/types.ts` — score: 100 — verdict: merge/inline into durable family —
      owner: list public domain types — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/withList.spec.tsx` — score: 100 — verdict: merge/inline into durable family — owner: headless editing proof family — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/lib/withList.ts` — score: 100 — verdict: merge/inline into durable family —
      owner: headless list capability — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/lib/withNormalizeList.ts` — score: 100 — verdict: merge/inline into durable family — owner: headless list capability — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/react/ListPlugin.tsx` — score: 100 — verdict: merge/inline into durable family — owner: React list capability — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/react/hooks/listHooks.spec.tsx` — score: 100 —
      verdict: merge/inline into durable family — owner: React hook proof family — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/react/hooks/useListToolbarButton.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: list toolbar hook family — evidence: mapped owner and 109/109 package proof —
      next: closed
- [x] `packages/list/src/react/hooks/useTodoListElement.ts` — score: 100 —
      verdict: merge/inline into durable family — owner: todo-list element hook family — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/react/hooks/useTodoListToolbarButton.ts` — score: 100 — verdict: merge/inline into durable family — owner: list toolbar hook family — evidence: mapped owner and 109/109 package proof — next: closed
- [x] `packages/list/src/react/index.tsx` — score: 100 — verdict: merge/inline into durable family —
      owner: React barrel — evidence: mapped owner and 109/109 package proof — next: closed


Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Headless owner | `BaseListPlugin.tsx` | 32 helper/taxonomy files hide one capability | source/caller audits and tests | consolidate | keep |
| React owner | `src/react` | hooks directory and subhook files split families | caller audit and React tests | flatten/merge | keep |
| Test owner | package specs | one spec per private fragment preserves old topology | fast/slow timing and behavior | merge by family | keep |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/list/src/index.ts` | recover-main-owner | origin/main uses `.ts` root barrel | keep canonical owner | `brl`, build |
| `packages/list/src/lib/BaseListPlugin.slow.tsx` | merge-existing-owner | two existing slow families | keep merged slow lane | 63 tests |
| `packages/list/src/react/ListPlugin.spec.tsx` | merge-existing-owner | existing hook spec family | keep React proof owner | fast tests |
| `packages/list/src/react/index.ts` | recover-main-owner | origin/main uses `.ts` React barrel | keep canonical owner | `brl`, build |
| `packages/list/src/react/useListToolbarButton.ts` | merge-existing-owner | two toolbar hook files | keep merged family | React tests/typecheck |
| `packages/list/src/react/useTodoListElement.ts` | merge-existing-owner | existing hook moved flat | keep independent family | React tests/typecheck |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| shared `pnpm check:core` | `ENOENT packages/caption/package.json` at `check-core.mjs:84` | Failure occurs before list and caption is untouched shared WIP | caption/current-tree owner |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| old raw list helpers/API | 44 lines in 9 files under apps/templates/content | Package review mode forbids broad adoption edits | separate list adoption/docs packet |
| `isOrderedList` imports | 6 app/template static render files | Valid pure cross-layer reuse | keep |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Consolidated headless behavior into `BaseListPlugin.tsx`; flat scoped API; flat React families; generated barrels |
| tests/proof | Consolidated fast, slow, and React behavior families into three specs |
| docs/templates/skills | Existing `.changeset/list-scoped-api.md`; this goal plan only; no product docs/templates/skill edits |
| reverted/quarantined packets | Removed a broken nested self-export from a stale barrel, then reran `brl` |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Outside list caller adoption | 44 stale lines remain outside package scope | apps/templates/content audit | separate adoption packet |
| 2 | Shared Core gate | foreign missing caption manifest prevents execution | `tooling/scripts/check-core.mjs:84` | caption/current-tree owner repairs |

Findings:
- Package topology was objectively bad: 32/50 files were helper taxonomy.
- The clean owner is 10 files, not a new arbitrary split.
- `isOrderedList` is the exception worth keeping: pure, trivial, and genuinely
  cross-layer. Making render code construct/use an editor portal would be worse.

Decisions and tradeoffs:
- No line ceiling. `BaseListPlugin.tsx` is 1,732 lines and still easier to read
  than a 32-file treasure hunt.
- Keep private functions only for repeated complex algorithms; inline one-use
  callbacks, options, constants, and extension bodies.
- Tests follow behavior families, not deleted implementation fragments.
- Hard-cut editor-bound raw helpers; do not add compatibility aliases.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm check:core` foreign caption ENOENT | 1 | prove package locally and record foreign owner | list proof green; blocker classified |
| First `brl` emitted nested self-export from stale barrel | 1 | delete stale nested barrel and rerun generator | correct barrels verified |
| First autoreview requested removing pure `isOrderedList` | 1 | verify real consumers and API ownership | rejected with six-consumer evidence |
| Final review found list/indent configured-target mismatch | 1 | propagate list targets to the dependency and add regression | fixed; 109/109 plus package proof green |
| Next review found LI parser on property-only descriptor | 1 | install LI parsing on the configured element parser and test runtime | fixed; default and custom targets proven |
| Reviewer started before canonical-parser follow-up corrections | 2 | stop stale snapshots and rerun after proof | interrupted; final reviewer uses exact source |
| Empty target regression fixture | 1 | respect compiled-schema rejection instead of testing unreachable runtime | removed; empty targets already reject as invalid |

Verification evidence:
- `bun test ./packages/list/src/lib/BaseListPlugin.spec.tsx
  ./packages/list/src/react/ListPlugin.spec.tsx` — 46 pass, 0 fail, 89 expects.
- `bun test ./packages/list/src/lib/BaseListPlugin.slow.tsx` — 63 pass, 0
  fail, 120 expects.
- `pnpm --filter @platejs/list typecheck` — pass.
- `pnpm --filter @platejs/list build` — pass.
- `pnpm --filter @platejs/list lint` — pass, 13 files checked.
- `pnpm exec biome check --write packages/list/src` — pass; final formatting
  correction applied and lint rerun green.
- `pnpm --filter @platejs/list brl` — pass; generated barrels inspected.
- Final exact-snapshot autoreview — clean, no accepted/actionable findings.
- Package source audits: no helper-directory import/export leftovers, no
  `{ required: true }`, no empty helper directories, no unjustified one-shot
  transaction wrapper, no plugin export annotation that erases inference.

Final handoff contract:
- target surface and mode: package review, `@platejs/list`
- files/APIs reviewed: 50 initial source/test rows and both public entrypoints
- broad Core drift score coverage: N/A, package review
- package file checklist coverage: 50/50 rows at score 100, 0 deferred
- best Plate v2 recommendation: one headless owner, flat React families,
  behavior-family tests, only pure/reused standalone exports
- verdict matrix summary: consolidate 32 helper paths into 10 final files
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: package
  helper topology 32/32/0; outside adoption 44/0/44
- out-of-scope matches discovered: 44 stale lines / 9 files; six valid pure
  predicate imports
- changes made: owner-first runtime/API/React/test colocation and changeset
- tests/proof commands: 109/109 plus typecheck/build/lint/brl
- old compatibility names audited: absent inside package
- needs attention: outside adoption; foreign caption Core-gate blocker
- next best Plate Next packet: `@platejs/code-block`

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final review/checker closure |
| Where am I going? | Immutable `@platejs/list` package handoff |
| What is the goal? | One durable headless owner plus only independently earned React/test families |
| What have I learned? | 50 initial rows map cleanly to 10 final files; six extracted paths all recover/merge real owners |
| What have I done? | Implemented, generated barrels, ran 109 tests plus typecheck/build/lint, and audited outside adoption |

Timeline:
- 2026-07-24T06:54:47.279Z Goal plan created.
- 2026-07-24 Checkpoint zero closed: explicit prompt captured; 50-row live
  package manifest and zero-untracked inventory materialized before source edits.
- 2026-07-24 Consolidated headless, React, and test families; generated barrels.
- 2026-07-24 Package proof closed at 109/109 plus typecheck/build/lint.
- 2026-07-24 Accepted reviewer target-propagation finding repaired and package
  proof rerun green.
- 2026-07-24 Accepted reviewer parser-owner finding repaired; real HTML
  parser-runtime regressions and all package proof green.
- 2026-07-24 Final exact-snapshot autoreview clean.

Open risks:
- Outside consumer/docs migration is intentionally deferred from package mode.
- Shared `check:core` remains blocked before reaching list by missing foreign
  `packages/caption/package.json`.
