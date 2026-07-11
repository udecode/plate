# plate-next boolean node query diff sweep

Objective:
Close boolean node-query drift in the current diff; done when every candidate
is classified, valid rows use `nodes.some`, and focused checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-10-plate-next-boolean-node-query-diff-sweep.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: resumed `plate-beta` request: "check all git diff" after
  identifying a truthiness-only `nodes.above` in
  `packages/code-block/src/lib/BaseCodeBlockPlugin.ts`
- mode: correction-triggered current-diff API-class sweep
- target surface: changed `packages/**/*.{ts,tsx,mts,cts}` call sites using
  `editor.read.nodes.find`, `block`, `toArray`, `entries`, `above`, `parent`,
  `previous`, or `next` where only truthiness may be consumed
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; this is a named API-class audit over the current diff
- correction-triggered related scoped sweep: yes; every matching changed call
  is classified, but only semantically equivalent boolean queries are patched
- package review mode: no; no package-by-package score-100 claim
- package review target: N/A: current-diff API class crosses packages
- package file checklist gate: N/A: package review mode does not apply
- completion threshold summary: zero unclassified truthiness-only candidates;
  all valid collection-query rows use `read.nodes.some`; ancestor/relative
  rows retain their query only with a recorded semantic reason; focused proof
  and the goal-plan checker pass

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
- semantics: no timed checkpoint
- initial confidence score: 0.72; the named Code Block row is already repaired
  in the checkout, but the rest of the current diff is unclassified
- improvement loop: derive the changed-file manifest, inventory candidates,
  classify traversal semantics, patch exact equivalents, test affected owners,
  review the final delta, and rescan
- final score / loop closure: 1.00 candidate accounting with zero accepted
  actionable review findings

Completion threshold:
- Every changed package source/test candidate using `find`, `block`, `toArray`,
  `entries`, `above`, `parent`, `previous`, or `next` only for truthiness is
  recorded in the related sweep ledger.
- Every collection query with semantics identical to `nodes.some` is migrated
  with `at`, `match`, root, mode, and void behavior preserved.
- Ancestor/current-block/relative queries stay when `nodes.some` cannot preserve
  the exact question; no mechanical `above`/`block`/`parent`/`previous`/`next`
  rewrite.
- Affected package focused tests and source-first typechecks pass; source audit,
  scoped review, lint/check, and this plan's completion checker pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-boolean-node-query-diff-sweep.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: affected package specs discovered from patched rows
- package proof: source-first Turbo typecheck for every changed package in this
  correction packet, plus package tests when the owner has a focused suite
- shared Core gate: N/A unless this correction changes a Core/Plite owner
- source audits: changed-file manifest plus exact `rg`/diff-aware inventory of
  entry-producing node queries and post-fix zero-unclassified accounting
- related scoped sweep query / active scope / match count / patched count / deferred count:
  `git diff HEAD` changed-package TypeScript inventory plus exact
  `editor.read.nodes.(above|block|entries|find|get|next|parent|previous|toArray)`
  audit / 136 tracked files plus one untracked spec / 64 old call sites / one
  `some` conversion plus one duplicated `block` lookup consolidated / zero
  deferred and zero unclassified
- package file manifest / row count / checked count / deferred count: N/A:
  current-diff API-class audit, not package review mode
- Plite/Plate gap ledger: N/A unless equivalence exposes a missing boolean
  ancestor/relative primitive; no gap is currently known
- broad Core drift ledger gate: N/A: not a broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-boolean-node-query-diff-sweep.md`

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
- allowed edit scope: this goal plan plus changed package source/tests that are
  proven same-class boolean-query corrections; no unrelated current-diff edits
- package/API surfaces: existing `editor.read.nodes.*` consumers only; Plite
  public API is fixed and `editor.api.some` stays dead
- docs/browser surfaces: N/A: no visible UI or docs claim; no browser run
- non-goals: no public API rename, no new alias, no broad package migration,
  no cleanup unrelated to boolean query result consumption
- out-of-scope package errors: classify existing migration failures by owner;
  do not repair them unless this correction caused the failure

Output budget strategy:
- Derive changed files with `git diff --name-only`, then run bounded `rg` only
  on those files; emit counts and candidate snippets, not the 477-file diff.
- Exclude generated output, dependencies, `templates/**`, logs, and historical
  plans from candidate scans unless a named source claim requires them.
- Read only candidate files and focused tests; cap broad command output and
  write a ledger artifact if the candidate set exceeds one screen.

Blocked condition:
- Block only if live Plite source cannot establish whether a candidate's
  ancestor/relative traversal is equivalent to `nodes.some`, or if every
  owning focused proof command is unavailable. Current source is expected to
  be sufficient, so continue autonomously otherwise.

Current verdict:
- verdict: keep `editor.read.nodes.some` for the parser's range-wide collection
  question; keep `nodes.block` and other ancestor/relative queries when their
  distinct traversal is required
- confidence: 1.00 after full candidate accounting, focused proof,
  `check:core`, and correction review
- next owner: plate-next
- keep / revert / quarantine call: keep the Base Code Block parser `some`;
  revert reset/clipboard/fragment `block` over-conversions; retain the safe
  duplicated clipboard lookup consolidation
- reason: `some` scans a range while `block` resolves the current block or an
  ancestor; mixed expanded selections prove those questions differ

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Session reconstruction | complete | Exact `plate-beta` task and latest unfinished request read. | current-tree grounding |
| Current-tree grounding and candidate inventory | complete | 136 tracked changed TypeScript files plus one untracked spec inventoried; 64 old call sites classified. | semantic classification |
| Semantic classification and correction | complete | One valid `some` conversion retained; three current-block conversions reverted; duplicate clipboard lookup consolidated. | focused proof |
| Focused proof and review | complete | Code Block 87/87, source-first checks, lint, `check:core`, and scoped autoreview pass after accepted fixes. | closure accounting |
| Closure accounting and handoff | complete | Candidate ledger has zero unclassified/deferred rows; generated doctrine synced; plan checker is the final command. | complete |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Explicit file correction, current-diff sweep scope, proof threshold, and handoff requirements copied into this plan before edits. |
| `plate-next` skill/rule read | yes | Full generated skill read; source rule already contains the Boolean node-query law. |
| Active goal checked or created | yes | No goal existed; current-diff boolean-query goal created. |
| Mode classified as named packet vs broad Core sweep | yes | Current-diff API-class correction sweep; not broad Core/package review. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Canonical shape is `editor.read.nodes.some`; no flat alias. |
| Broad Core drift ledger initialized when in scope | no | N/A: not a broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | `VISION.md`, `docs/vision/plate.md`, `docs/vision/common.md`, prior API plan, current checkout, and named Code Block owner read. |
| Output budget strategy recorded | yes | Changed-file-first bounded search strategy recorded above. |
| Public API fork routing checked | yes | Prior Plite plan already rejected API forks/aliases; implementation consumes the settled API. |
| Gap policy checked | yes | Any missing exact boolean traversal becomes a named Plite gap; no local wrapper. |
| Related scoped sweep policy checked | yes | Entire current diff is the explicit same-class audit boundary. |
| Review-mode rename freeze checked | yes | No names or files will be renamed. |
| Package review checklist initialized when in scope | no | N/A: package review mode does not apply. |

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
- [x] `pnpm brl` is run when exports/barrels change. N/A: no exports or barrels changed.
- [x] Old compatibility names are source-audited when cut. N/A: no compatibility name was cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Code Block 87/87; package and forced Turbo typechecks pass. |
| Broad Core drift ledger coverage | no | Record manifest counts when broad Core sweep applies | N/A: named current-diff API-class audit. |
| Score gate | no | Prove high drift is owned/fixed/deferred | N/A: no package score review; all candidate verdicts are recorded. |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | `some` only for equivalent range-wide existence; no aliases or mechanical ancestor rewrites. |
| Plite/Plate gap ledger | yes | Record blockers or N/A | N/A: existing reads express both required questions. |
| Related scoped sweep after correction | yes | Record same-class results | 136 tracked files, one untracked spec, 64 old sites, zero unclassified/deferred. |
| Package file checklist | no | Record package manifest when package review applies | N/A: not package review mode. |
| Package/API proof | yes | Run focused proof | Code Block tests/typecheck/lint and forced Turbo graph pass. |
| Shared Core gate coverage | yes | Run owner gate | Existing `check:core` includes Code Block and passed. |
| Non-Core package error triage | yes | Classify proof failures | Code Block artifact build inference debt is unchanged and outside this source-query packet. |
| Source audit | yes | Audit query class | Exact changed-file method inventory reconciles with the candidate ledger. |
| Rename ledger | no | Record postponed renames | N/A: no rename proposed or made. |
| Extracted-file inventory | yes | Classify every untracked in-scope file | One Cursor spec classified `justify-new-proof-tooling`; zero query matches. |
| Autoreview / review | yes | Run scoped review | Final scoped rerun clean: no accepted/actionable findings; patch correct at 0.84 confidence. |
| Final lint/check | yes | Run scoped lint/check | Code Block lint and `pnpm check:core` pass; scoped `git diff --check` passes. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; only unrelated artifact-build inference debt remains. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-boolean-node-query-diff-sweep.md` | Pass. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `BaseCodeBlockPlugin.ts` parser guard | 0 | keep `nodes.some` | Code Block | range-wide code-line existence exactly matches the parser guard | keep |
| `withCodeBlock.ts` reset gate | 0 | keep `nodes.block` | Code Block | unwrap targets the current/ancestor code block | keep |
| `withInsertDataCodeBlock.ts` paste routing | 0 | consolidate duplicate `nodes.block` reads | Code Block | mixed-selection regression proves range-wide `some` is wrong | keep with regression |
| `withInsertFragmentCodeBlock.ts` fragment routing | 0 | keep `nodes.block` | Code Block | explicit-target/current-block behavior already has focused tests | keep |
| Plate Next Boolean node-query law | 0 | clarify collection versus ancestor/current-block reads | Plate Next | source rule, generated skill, and template agree | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| truthiness-only node reads | `nodes.some` only when target, match, and traversal are identical; otherwise retain `block`/ancestor/relative read | flat aliases, Plate wrappers, non-null casts, mechanical result-shape rewrites | result shape alone does not establish traversal equivalence | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | existing `nodes.some` and `nodes.block` express the two required semantics | Plite read API | live source plus focused tests | no gap |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| missed Boolean node-query conversion | changed tracked/untracked package TypeScript in `git diff HEAD` | changed-file exact inventory of `above`, `block`, `entries`, `find`, `get`, `next`, `parent`, `previous`, `toArray` | 64 old sites across 136 tracked files; one untracked spec has zero sites | one `some` conversion retained; one duplicate `block` lookup consolidated; three unsafe conversions reverted | 0 | 0 unclassified; traversal distinction is now doctrine and test-backed |

Core drift ledger:
- Applies: no; this is not a broad Core sweep
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
| N/A | 0 | not a broad Core sweep | Core | named current-diff API-class boundary | none |

Package file checklist:
- Applies: no; this is not package review mode
- Package: N/A
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
- N/A: package review mode does not apply.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Code Block Boolean query correction | Code Block | entry-producing reads were converted from result shape without proving traversal equivalence | four runtime owners, one regression spec, focused proof, `check:core`, autoreview | keep parser `some`; retain current-block reads; consolidate duplicate paste lookup | close |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/cursor/src/hooks/useRequestReRender.spec.tsx` | `justify-new-proof-tooling` | absent on `origin/main` | unrelated existing focused hook proof; no edit | exact query-class search found zero matches |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `@platejs/code-block` artifact build | package-wide generated-declaration callback inference errors across existing files | direct source typecheck, forced Turbo typecheck, focused tests, lint, and `check:core` pass; failure is broader source/dist inference debt, not caused by query traversal edits | Code Block/Core type-owner follow-up |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| none | none | all 64 old call sites in the active changed-file class were classified | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | retained parser `nodes.some`; restored current-block `nodes.block` in reset/data/fragment paths; kept one hoisted paste lookup |
| tests/proof | added mixed expanded-selection parser-delegation regression |
| docs/templates/skills | corrected Plate Next Boolean-query law in source rule/template and synced generated skill; completed plan and candidate ledger |
| reverted/quarantined packets | reverted three unsafe range-wide `some` conversions after source audit/review |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Code Block artifact declaration inference debt | standalone package build still reports broad callback inference errors despite green source checks | `pnpm --filter @platejs/code-block build` | handle as a separate Core/Code Block type-owner packet; do not mix it into this semantic correction |

Findings:
- `nodes.some` scans the supplied/current range; `nodes.block` resolves the
  current block/ancestor. Truthiness does not make those traversals equivalent.
- The only valid conversion in the reviewed Code Block packet is the parser
  guard in `BaseCodeBlockPlugin.ts`.
- The original two clipboard `block` calls can still be safely consolidated
  into one hoisted Boolean without changing traversal.

Decisions and tradeoffs:
- Keep the smallest canonical read for the actual question, not merely the
  smallest result type.
- Add the mixed-selection regression because collapsed-selection tests cannot
  distinguish range-wide existence from current-block traversal.
- Leave artifact declaration inference debt to its owning type packet; source
  behavior and this correction's graph are independently green.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Mechanical `block` to `some` conversions changed mixed-selection routing | 1 | inspect live Plite traversal implementations and add a distinguishing test | three conversions reverted; regression passes |
| Code Block artifact build reported broad declaration inference errors | 1 | rerun direct and forced source-first typechecks | source graph passes; recorded as out-of-scope type-owner debt |
| First closeout review found stale plan evidence | 1 | fill every gate/ledger from completed proof | plan reconciled and completion checker rerun |

Verification evidence:
- `pnpm --filter @platejs/code-block test`: 87 pass, 0 fail.
- `pnpm --filter @platejs/code-block typecheck`: pass.
- `pnpm turbo typecheck --filter=./packages/code-block --force`: 12/12 tasks pass.
- `pnpm --filter @platejs/code-block lint`: 56 files clean.
- `pnpm check:core`: pass, including Core/Plite/Utils/Basic Nodes/Basic
  Styles/Indent/Selection/Diff/Code Block typecheck, lint, and tests.
- `CI=1 pnpm install --no-frozen-lockfile`: pass; Plate Next generated skill
  synced from the source rule.
- scoped `git diff --check`: pass.
- scoped autoreview: semantic P1 and stale-plan P2 accepted and repaired;
  final rerun clean with no accepted/actionable findings.

Final handoff contract:
- target surface and mode: resumed `plate-beta` current-diff Boolean node-query
  correction, one-shot execution
- files/APIs reviewed: 136 tracked changed package TypeScript files, one
  untracked spec, and all `read.nodes` entry-producing call sites in scope
- broad Core drift score coverage: N/A; not a broad Core sweep
- package file checklist coverage: N/A; not package review mode
- best Plate v2 recommendation: use `nodes.some` only for traversal-equivalent
  existence; preserve `nodes.block`/ancestor/relative semantics
- verdict matrix summary: five old Boolean sites reviewed; one `some` kept,
  three current `block` calls retained, one duplicate `block` lookup removed
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: exact
  changed-file nine-method inventory / 64 old sites / one semantic conversion
  plus one deduplication / zero deferred
- out-of-scope matches discovered: none
- changes made: runtime correction, mixed-selection regression, doctrine sync,
  ledger/plan closure
- tests/proof commands: Code Block tests/typechecks/lint, forced Turbo graph,
  `check:core`, diff check, autoreview, completion checker
- old compatibility names audited: N/A; no compatibility cut
- needs attention: separate artifact-declaration inference debt only
- next best Plate Next packet: none required for this API class; type-owner debt
  may be scheduled separately

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure evidence complete. |
| Where am I going? | Final verified handoff. |
| What is the goal? | Close Boolean node-query drift with zero unclassified candidates and green focused proof. |
| What have I learned? | Range-wide existence and current-block truthiness are distinct semantics. |
| What have I done? | Classified the diff, corrected runtime/doctrine, added regression proof, and closed review findings. |

Timeline:
- 2026-07-10T17:42:55.861Z Goal plan created.
- 2026-07-10 Candidate ledger completed for 136 tracked files and one
  untracked spec.
- 2026-07-10 Accepted review found mixed-selection traversal regression;
  unsafe conversions reverted and regression added.
- 2026-07-10 Focused source proof and `check:core` passed; closeout evidence
  reconciled after final plan review.
- 2026-07-10 Autogoal completion checker passed.
- 2026-07-10 Final scoped autoreview reported no accepted/actionable findings;
  patch correct at 0.84 confidence and parallel `check:core` passed.

Open risks:
- Standalone Code Block artifact build retains broader declaration-inference
  debt; direct source checks and the shared Core gate pass.
