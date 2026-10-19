# plate-next table no-drift re-audit

Objective:
Re-audit `packages/table` against `origin/main` and the Plate Next laws; classify
every behavior/API/ownership deviation as intentional migration, real drift, or
an exact Plite/Plate gap.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-14-plate-next-table-no-drift-re-audit.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api

Plate Next source:
- prompt / link: user asked for a no-drift review and, if drift exists, whether
  it comes from a missing Plite API
- mode: package review, report-only
- target surface: current `packages/table` source, tests, type-tests, exports,
  and package metadata versus `origin/main`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, table-local if a correction
  is proposed; no code changes are authorized by this review request
- package review mode: yes
- package review target: `packages/table`
- package file checklist gate: 156 current TypeScript rows materialized before
  substantive review; only score-100 rows may be checked
- completion threshold summary: all 156 rows reviewed; every semantic delta
  from `origin/main` classified; every real drift mapped to an exact missing
  Plite/Plate API or identified as a local migration defect; zero unclassified
  deviations

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
- semantics: one-shot report-only re-audit
- initial confidence score: N/A: file checklist and deviation ledger are the
  measurable gates
- improvement loop: semantic diff inventory, owner/API law audits, focused
  tests, independent review, and classification
- final score / loop closure: 156/156 classified; 142 score 100; 14 explicit
  deferrals; zero unclassified deviation

Completion threshold:
- All 156 current TypeScript files have a checked score-100 row or an explicit
  deferral; zero current file is omitted.
- Every current semantic deviation from `origin/main` is classified as
  intentional Plate v2 migration, local drift, Plite gap, or Plate gap.
- Any drift report names the exact missing capability, smallest owner, why a
  local workaround is wrong, and focused proof; if no gap exists, state that
  the drift is a local bug rather than blaming Plite.
- No product code is changed in this report-only pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-table-no-drift-re-audit.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: current package typecheck and tests; strict
  behavior/ownership review of the current diff against `origin/main`
- package proof: `pnpm --filter @platejs/table typecheck` and
  `pnpm --filter @platejs/table test`
- shared Core gate: current tree already includes `table` in `check:core`;
  previous fresh `pnpm check:core` result may be reused only if no runtime/API
  code changes during this report-only pass
- source audits: old compatibility APIs, fake casts, nested/consecutive
  updates, local structural types, ownership moves, deleted behavior/tests,
  public exports, dependency deltas, and untracked/extracted files
- related scoped sweep query / active scope / match count / patched count / deferred count:
  semantic deviations / `packages/table` / 87 changed production files /
  0 patched / 14 deferred rows
- package file manifest / row count / checked count / deferred count:
  `rg --files packages/table | rg '\\.(ts|tsx|mts|cts)$' | sort` / 156 /
  142 / 14
- Plite/Plate gap ledger: every confirmed drift gets an exact capability and
  owner; `none` only after source/API audit
- broad Core drift ledger gate: N/A: package review, not broad Core
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-table-no-drift-re-audit.md`

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
  intentionally decoupled cross-package code. Plugin-owned helper graphs should
  receive plugin context (`api`, `getOption`, `getOptions`, `setOption`, `tx`)
  or be thin wrappers over the typed plugin API/tx group.

Boundaries:
- allowed edit scope: plan/evidence only; product code remains unchanged
- package/API surfaces: `packages/table`, its `origin/main` owner graph, and
  read-only inspection of the smallest Plite/Core APIs it consumes
- docs/browser surfaces: N/A: package-only source review
- non-goals: implementation, rename pass, repo-wide caller migration, docs/UI,
  and unrelated packages
- out-of-scope package errors: classify and stop; do not patch

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- For this 156-file package, inspect diff counts/file groups first, save or
  slice large diffs, and stream only the exact semantic hunks under review.

Blocked condition:
- Stop only if `origin/main` or the owning Plite/Core API cannot be read, or a
  semantic deviation cannot be classified without a product decision.

Current verdict:
- verdict: not zero-drift; four runtime regression classes, one Plite public
  type-export gap, and five local migration-quality rows remain
- confidence: high; four focused transient repros fail exactly as predicted and
  autoreview independently accepted the merged-paste defect
- next owner: `@platejs/table` for runtime/proof repairs; `@platejs/plite` only
  for the public `EditorNodesReadOptions` export
- keep / revert / quarantine call: do not accept the package as closed; report
  only in this pass, with no product mutation
- reason: all runtime drifts are locally repairable with APIs already present

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target, report-only boundary, gap question, proof, and handoff copied above |
| `plate-next` skill/rule read | yes | User-supplied skill and local `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | New matching goal created after prior goal was complete |
| Mode classified as named packet vs broad Core sweep | yes | `packages/table` package review; not broad Core |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Objective and constraints above |
| Broad Core drift ledger initialized when in scope | no | N/A: no broad Core claim |
| Source of truth and allowed workspace recorded | yes | `origin/main`, current checkout, table source/tests/types |
| Output budget strategy recorded | yes | Count and slice large diffs; exact semantic hunks only |
| Public API fork routing checked | yes | Any discovered fork routes to `plate-plan`; no implementation in this pass |
| Gap policy checked | yes | Exact Plite/Plate capability required; no vague blame |
| Related scoped sweep policy checked | yes | Table-local only; report broader matches |
| Review-mode rename freeze checked | yes | No renames or product edits authorized |
| Package review checklist initialized when in scope | yes | 156 current TypeScript rows materialized before review |
| Package/API pack selected | yes | `package-api` materialized |
| Public surface or package boundary identified | yes | `@platejs/table` base/react exports and metadata |
| Release artifact path selected | no | N/A: report-only follow-up creates no published delta |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset edit in report-only pass |
| Barrel/export impact decision recorded | yes | No product or export edits; `pnpm brl` N/A |

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
- [x] Focused package proof is run after meaningful code changes. N/A: no
      product change; focused failing repros and package proof were run.
- [x] `pnpm brl` is run when exports/barrels change. N/A: no export edit.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no changeset edit.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry work.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. Report-only plan/evidence changes have no package delta.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no product/export edits.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | 4 focused transient regressions reproduced; typecheck and 268-test suite recorded below |
| Broad Core drift ledger coverage | no | Package mode only | N/A |
| Score gate | yes | Own or defer every non-100 row | 142 score-100 rows; 14 explicit deferrals with owner/evidence/next |
| Best Plate v2 recommendation | yes | Record the best current shape | Table-local tx helpers for behavior; one public Plite type export |
| Plite/Plate gap ledger | yes | Name exact capabilities | One Plite type-export gap; zero runtime Plite/Plate gaps |
| Related scoped sweep after correction | yes | Record class sweeps | Four runtime classes plus optional-read/type audits recorded below |
| Package file checklist | yes | Record counts and deferrals | 156 expected/actual, 142 checked, 14 deferred, 0 missing/extra |
| Package/API proof | yes | Run package proof | typecheck passed; 268 tests passed |
| Shared Core gate coverage | yes | Confirm table lane | `table` already belongs to `check:core`; no product edit in this pass |
| Non-Core package error triage | no | No failures | N/A |
| Source audit | yes | Audit old compatibility APIs | no production `any`, callback-read wrapper, normalization call, root option helper, flat node alias, or plugin `.editor` match |
| Rename ledger | no | No rename requested | N/A |
| Extracted-file inventory | yes | Confirm no current temporary/extracted file | `.tmp` proof files deleted; manifest remains 156 |
| Autoreview / review | yes | Run strict package review | accepted P1 merged-table paste drift; classified local, not API gap |
| Final lint/check | yes | Run scoped proof | typecheck/test passed; no product file changed so lint output would be unchanged |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below |
| Goal plan complete | yes | Run final checker | `[autogoal] complete` |
| Public API / package boundary proof | yes | Source-audit exports/types | barrels unchanged; `TableConfig` hard cuts intentional; one missing Plite type export |
| Release artifact classification | no | Report-only plan/evidence | no package artifact |
| Published package changeset | no | No product edit | N/A |
| Registry changelog | no | No registry work | N/A |
| No release artifact | yes | Record reason | agent-only audit; no package user-visible delta from this pass |
| Package typecheck/build/test | yes | Run owner checks | `pnpm turbo typecheck --filter=./packages/table`; `pnpm --filter @platejs/table test` |
| Barrel/export generation | no | No export edit | N/A |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `lib/withInsertFragmentTable.ts` | 5 | real merged/header paste drift | table | two focused repros plus accepted autoreview P1 | restore span/header-aware tx helper expansion |
| `lib/withGetFragmentTable.ts` | 5 | real copy/fragment data-loss drift | table | crossing selection drops the table | retain original node when no subtable resolves |
| `lib/transforms/insertTable.ts` | 4 | real selection drift | table | default insertion inside a table leaves selection in old table | preserve main special-case selection |
| `lib/withApplyTable.ts` | 4 | real first-selection drift | table | `null -> Range` skips clamping | merge operation properties without requiring prior selection |
| `lib/types.ts` / `EditorNodesReadOptions` | 2 | exact Plite public type gap | Plite | type exists internally, absent from barrel | export it and consume it directly |
| optional assertions / wrong row cast | 2 | local migration cleanup | table | five deferred source rows | repair locally; no API work |
| remaining 142 rows | 0 | behavior/owner migration accepted | table | source diff plus green package proof | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| table paste expansion | call the existing tx-aware row/column insertion owners from the active transaction | cloned raw grid surgery or reintroducing old Slate transforms | package already owns merge/header laws | repair required |
| table fragment/selection middleware | preserve main fallbacks using Plite middleware/operation APIs | compat wrapper around old `editor.api`/`editor.tf` | current Plite APIs are sufficient | repair required |
| table find option type | publicly export `EditorNodesReadOptions` from Plite and derive `TableFindOptions` | duplicate `NodeTarget | Span` reconstruction | source type already exists at the Plite owner | small Plite API fix |
| old root `moveLine`/`selectAll`/`tab` interception and `create.block` | keep hard-cut; use table keyboard helpers and explicit typed default blocks | restore legacy global transform/factory APIs | Plate v2 ownership is cleaner and behavior is otherwise covered | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plite type export | public `EditorNodesReadOptions<T>` | table reconstructs the exact internal `WithNodeTargetOrSpan<EditorNodesOptions<T>>` contract | `packages/plite/src/index.ts` | Plite + table typecheck | add export |
| runtime | none | all four behavior fixes have current tx/query/operation APIs and table-local helper owners | `@platejs/table` | focused regression tests | do not blame Plite |
| Plate product API | none blocking | root generic table command interception was intentionally hard-cut; exported helpers cover keyboard behavior | `@platejs/table` if future command ergonomics are desired | API plan only | not drift blocker |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| runtime parity | `packages/table` | semantic diff of all changed production owners against `origin/main` | 87 production files | 0 | 4 runtime classes | named failing cases only |
| missing regression proof | table specs | focused transient tests for insert/copy/paste/first-selection | 4 failed cases | 0 | 4 spec rows | existing suite stays green because cases are absent |
| Plite API gap | table + smallest Plite owner | public/internal type export audit | 1 | 0 | 1 | DX only, no runtime drift |
| migration sludge | table production | `as any`, optional reads, plugin/root aliases, update/read wrappers, normalize calls | 5 deferred source rows; zero forbidden API matches | 0 | 5 | local cleanup only |

Core drift ledger:
- Applies: no: package review only
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
| N/A | N/A | N/A | N/A | Package mode; no broad Core claim | N/A |

Package file checklist:
- Applies: yes
- Package: `@platejs/table`
- Manifest command: `rg --files packages/table | rg '\\.(ts|tsx|mts|cts)$' | sort`
- Manifest owner:
  `packages/table/src/**/*.{ts,tsx,mts,cts}` plus `packages/table/type-tests/**/*.{ts,tsx,mts,cts}`.
- Expected row count: 156
- Actual row count: 156
- Checked score-100 count: 142
- Unchecked/deferred count: 14
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: classification is complete; product repair remains a separate user-authorized pass

Package file rows:
- [x] `packages/table/src/index.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/BaseTablePlugin.spec.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/BaseTablePlugin.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/__tests__/getTestTablePlugins.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/api/getEmptyCellNode.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/api/getEmptyRowNode.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/api/getEmptyTableNode.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/api/index.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/constants.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/index.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/deleteColumn.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/deleteColumn.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/deleteColumnWhenExpanded.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/deleteRow.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [ ] `packages/table/src/lib/merge/deleteRow.ts` — score: 90 — verdict: local type drift — owner: @platejs/table — evidence: `nextRow` is a row but is cast to `TTableCellElement` — next: repair cast/type inference
- [x] `packages/table/src/lib/merge/deleteRowWhenExpanded.spec.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/deleteRowWhenExpanded.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/findCellByIndexes.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/getCellIndicesWithSpans.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/getCellPath.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/getSelectionWidth.spec.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/getSelectionWidth.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/getTableGridByRange.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/getTableGridByRange.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/getTableMergedColumnCount.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/index.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/insertTableColumn.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [ ] `packages/table/src/lib/merge/insertTableColumn.ts` — score: 90 — verdict: optional-read debt — owner: @platejs/table — evidence: `read.nodes.parent(...)!` violates the feature-package optional-read law — next: early-return unresolved parent
- [x] `packages/table/src/lib/merge/insertTableRow.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [ ] `packages/table/src/lib/merge/insertTableRow.ts` — score: 90 — verdict: optional-read debt — owner: @platejs/table — evidence: `read.nodes.parent(...)!` violates the feature-package optional-read law — next: early-return unresolved parent
- [x] `packages/table/src/lib/merge/isTableRectangular.spec.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/isTableRectangular.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/mergeTableCells.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/splitTableCell.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/merge/tableMergeBehavior.slow.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/normalizeInitialValueTable.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getAdjacentTableCell.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getCellInNextTableRow.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getCellInNextTableRow.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getCellInPreviousTableRow.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getCellInPreviousTableRow.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getColSpan.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getLeftTableCell.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getNextTableCell.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getNextTableCell.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getPreviousTableCell.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getPreviousTableCell.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getRowSpan.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getSelectedCells.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getSelectedCells.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getSelectedCellsBorders.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getSelectedCellsBorders.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getSelectedCellsBoundingBox.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getSelectedCellsBoundingBox.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableAbove.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableCellBorders.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableCellBorders.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableCellSize.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableCellSize.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableColumnCount.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableColumnCount.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableColumnIndex.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableColumnIndex.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableEntries.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableEntries.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableGridAbove.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableGridByRange.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableGridByRange.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableOverriddenColSizes.spec.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableOverriddenColSizes.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableRowIndex.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTableRowIndex.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTopTableCell.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/getTopTableCell.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/index.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/isTableBorderHidden.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/queries/isTableBorderHidden.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/deleteColumn.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/deleteColumn.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/deleteRow.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/deleteRow.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/deleteTable.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/deleteTable.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/index.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [ ] `packages/table/src/lib/transforms/insertTable.spec.tsx` — score: 80 — verdict: proof gap — owner: @platejs/table — evidence: only explicit `select: true` is covered; main's default in-table selection is untested — next: add default-selection regression
- [ ] `packages/table/src/lib/transforms/insertTable.ts` — score: 55 — verdict: behavior drift — owner: @platejs/table — evidence: transient focused proof expected inserted table path `1`, received old table path `0` — next: preserve main's unconditional in-table selection
- [x] `packages/table/src/lib/transforms/insertTableColumn.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/insertTableColumn.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/insertTableRow.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/insertTableRow.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/moveSelectionFromCell.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/moveSelectionFromCell.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/setBorderSize.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/setBorderSize.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/setCellBackground.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/setCellBackground.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/setTableColSize.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/setTableMarginLeft.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/setTableMarginLeft.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/setTableRowSize.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/shouldMoveSelectionFromCell.spec.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/shouldMoveSelectionFromCell.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/transforms/tableSelectionAndSizing.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [ ] `packages/table/src/lib/types.ts` — score: 85 — verdict: Plite type-export gap — owner: @platejs/plite — evidence: `EditorNodesReadOptions` exists internally but is absent from the public barrel, forcing local reconstruction — next: export the owning type then simplify `TableFindOptions`
- [x] `packages/table/src/lib/utils/computeCellIndices.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/utils/getCellIndices.spec.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [ ] `packages/table/src/lib/utils/getCellIndices.ts` — score: 90 — verdict: optional assertion debt — owner: @platejs/table — evidence: `element.id!` and `computeCellIndices(...)!` hide the already-supported missing-id path — next: make the fallback explicit
- [x] `packages/table/src/lib/utils/getCellRowIndexByPath.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/utils/getCellType.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/utils/index.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [ ] `packages/table/src/lib/withApplyTable.spec.tsx` — score: 85 — verdict: proof gap — owner: @platejs/table — evidence: migrated integration tests omit the `null -> Range` selection transition — next: add first-selection regression
- [ ] `packages/table/src/lib/withApplyTable.ts` — score: 60 — verdict: behavior drift — owner: @platejs/table — evidence: transient focused proof expected focus root `1`, received `2` when selection starts as null — next: merge `operation.newProperties` even when the prior selection is null
- [x] `packages/table/src/lib/withDeleteTable.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/withDeleteTable.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [ ] `packages/table/src/lib/withGetFragmentTable.spec.tsx` — score: 80 — verdict: proof gap — owner: @platejs/table — evidence: no selection-crossing-table case — next: add full-table fallback regression
- [ ] `packages/table/src/lib/withGetFragmentTable.ts` — score: 50 — verdict: behavior/data-copy drift — owner: @platejs/table — evidence: transient focused proof expected a table in the fragment, received none — next: keep the original table when no subtable resolves
- [ ] `packages/table/src/lib/withInsertFragmentTable.spec.tsx` — score: 60 — verdict: proof gap — owner: @platejs/table — evidence: expansion tests omit header-column and merged-span grids — next: add both regressions
- [ ] `packages/table/src/lib/withInsertFragmentTable.ts` — score: 35 — verdict: behavior/structure drift — owner: @platejs/table — evidence: focused proofs changed a new header cell `th -> td` and left a colspan sibling row at 3 cells instead of 4; autoreview independently accepted the span-aware expansion defect — next: expand through existing tx-aware row/column helpers
- [x] `packages/table/src/lib/withInsertTextTable.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/withInsertTextTable.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/withNormalizeTable.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/withNormalizeTable.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/withSetFragmentDataTable.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/withSetFragmentDataTable.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/withTable.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/withTable.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/withTableCellSelection.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/lib/withTableCellSelection.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/TablePlugin.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableCellElement/getOnSelectTableBorderFactory.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableCellElement/index.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableCellElement/roundCellSizeToStep.spec.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableCellElement/roundCellSizeToStep.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.integration.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableCellElement/useIsCellSelected.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableCellElement/useTableBordersDropdownMenuContentState.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableCellElement/useTableCellBorders.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableCellElement/useTableCellElement.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableCellElement/useTableCellElementResizable.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableCellElement/useTableCellSize.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableElement/index.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableElement/useSelectedCells.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableElement/useTableColSizes.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableElement/useTableElement.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/TableElement/useTableSelectionDom.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/components/index.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/hooks/index.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/hooks/useCellIndices.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/hooks/useTableMergeState.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/hooks/useTableMergeState.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/index.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/onKeyDownTable.spec.tsx` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [ ] `packages/table/src/react/onKeyDownTable.ts` — score: 95 — verdict: optional-read debt — owner: @platejs/table — evidence: repeated `editor.read.selection()!` assertions instead of one guarded snapshot — next: retain the selection locally
- [x] `packages/table/src/react/stores/index.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/src/react/stores/useTableStore.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep
- [x] `packages/table/type-tests/table-plugin-contracts.ts` — score: 100 — verdict: keep-in-table — owner: @platejs/table — evidence: source diff classified; package proof green — next: keep

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| fragment paste | table | cloned grid bypasses table laws | `withInsertFragmentTable*`, focused header/span repros | real local drift | repair + regressions |
| fragment copy | table | missing fallback drops table | `withGetFragmentTable*`, crossing-selection repro | real local drift | repair + regression |
| selection | table | migration changed main defaults/null transition | `insertTable*`, `withApplyTable*`, two repros | real local drift | repair + regressions |
| API/type | Plite | read-node option type is private | table `types.ts`, Plite interface/barrel | exact type-export gap | export + typecheck |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Start gates | done | Scope, source, report-only boundary, and manifest captured | none |
| Semantic review | done | 156 rows classified; exact main/current behavior audited | none |
| Focused proof | done | Five failing assertions across four runtime drift classes | none |
| Package proof | done | typecheck and 268 tests passed | none |
| Independent review | done | accepted merged-paste P1, local table owner | none |
| Closeout | done | matrices, gaps, deferrals, and handoff filled | user decides whether to repair |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| none | N/A | current manifest and deleted-file inventory checked | no extracted/untracked table file retained by this audit | temporary repro specs deleted; manifest 156 |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | no proof failure | N/A | N/A |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| `EditorNodesReadOptions` barrel export | Plite | report-only package pass | smallest Plite owner |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none; report-only |
| tests/proof | four transient focused repro files created, run, and deleted; package proof rerun |
| docs/templates/skills | this audit plan only |
| reverted/quarantined packets | temporary repro files deleted after evidence capture |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | table paste expansion | can corrupt header/merged grid structure | `withInsertFragmentTable.ts` | fix first using existing tx-aware insert owners |
| 2 | crossing-table copy | copied fragment silently omits a table | `withGetFragmentTable.ts` | restore fallback |
| 3 | insertion/first-selection parity | selection ends in the wrong place | `insertTable.ts`, `withApplyTable.ts` | restore main semantics |
| 4 | Plite type export | table duplicates internal read option type | `EditorNodesReadOptions` | public export; no runtime API redesign |

Findings:
- Zero-drift claim is false: four runtime regression classes reproduced.
- Current package tests pass because all four regression cases are absent.
- Runtime repairs need no new Plite or Plate API.
- The only exact Plite deficiency is the missing public export of the already
  existing `EditorNodesReadOptions<T>` type.
- The earlier closure evidence said four deleted files; current diff contains
  three deletions. That was plan-count drift, not product behavior.

Decisions and tradeoffs:
- Keep intentional v2 hard cuts: no old root table transform interception, no
  legacy block factory, no Slate clipboard MIME compatibility layer.
- Do not port paste expansion as more raw clone surgery; call the table-owned
  merge/header-aware algorithms with the active transaction.
- Do not invent a Plate wrapper for Plite node reads; export the exact Plite
  option type.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| first 156-row patch construction malformed | 1 | materialize rows with corrected patch generation | resolved |
| broad pattern audit exceeded output budget | 1 | split into focused capped audits | resolved |
| root `bun -e` / temp test alias resolution | 3 | place transient proof under package and run package-local Bun | resolved |
| first Bun filter treated path as a name | 1 | prefix path with `./` | resolved |
| shell regex contained unquoted backticks | 1 | use a single-quoted regex | resolved |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/table` passed: 13/13 tasks.
- `pnpm --filter @platejs/table test` passed: 268 tests, 427 assertions.
- Transient focused proof intentionally failed 4/4 parity cases: default table
  insertion selection `0 != 1`; crossing fragment omitted table; header
  expansion produced `td` instead of `th`; merged colspan sibling row stayed
  length 3 instead of 4. A fifth focused assertion proved first selection focus
  root `2 != 1`; it belongs to the same selection class.
- Autoreview command: branch review against `origin/main`, high reasoning,
  strict `packages/table` prompt. Result: accepted P1 span-aware paste defect,
  local table owner, no missing Plite/Plate API.
- Production audits returned zero `as any`, `unknown as`, read callback,
  explicit normalize, root option helper, flat node-query alias, or plugin
  `.editor` matches. The two `editor.update(...)` callbacks are grouped writes.

Final handoff contract:
- target surface and mode: `packages/table`, package review, report-only
- files/APIs reviewed: 156 current TS/TSX files plus exact main diff and the
  smallest Plite/Core owners
- broad Core drift score coverage: N/A
- package file checklist coverage: 156/156 classified; 142 score 100; 14
  explicit deferrals
- best Plate v2 recommendation: local tx-based runtime repairs; one Plite type export
- verdict matrix summary: four runtime drift classes, one type gap, five local
  quality rows, four missing regression rows
- Plite/Plate gaps or blockers: one non-runtime Plite export gap; no Plate gap
- related scoped sweep query/active scope/matches/patched/deferred: 87 changed
  production files reviewed / table / 0 patched / 14 rows deferred
- out-of-scope matches discovered: Plite barrel owner only
- changes made: audit plan/evidence only
- tests/proof commands: package typecheck/test, focused transient repros,
  source audits, autoreview
- old compatibility names audited: intentional hard cuts kept; none restored
- needs attention: paste, copy, then selection; type export can follow
- next best Plate Next packet: repair these table rows before another package

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Report-only table re-audit complete |
| Where am I going? | User decision: repair or stop |
| What is the goal? | Classify all table drift and exact API causes |
| What have I learned? | Runtime drift is local; only the read-option type export belongs to Plite |
| What have I done? | Source audit, focused repros, package proof, autoreview, 156-row classification |

Timeline:
- 2026-07-14T13:14:17.247Z Goal plan created.
- 2026-07-14 package manifest and `origin/main` semantic diff classified.
- 2026-07-14 focused repros proved copy, paste, and selection drift.
- 2026-07-14 package typecheck/test passed; autoreview accepted paste P1.

Open risks:
- Runtime regressions remain in product code because this pass was explicitly
  report-only. Green package checks must not be used to close the package.
