# plate-next ai package review

Objective:
Close `packages/ai` Plate Next review; done when all 94 package rows score 100
or are explicitly deferred and focused package proof plus final review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-13-plate-next-ai-package-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user said `ok go` after asking which packages remain
- mode: package review, one package at a time
- target surface: `packages/ai`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, inside AI plus the smallest blocking Plite/Core owner
- package review mode: yes
- package review target: every tracked and untracked file in `packages/ai`
- package file checklist gate: 94 initial rows; `[x]` only at score 100
- completion threshold summary: close AI completely before touching Yjs or any framework/tooling/substrate package

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
- semantics: one-shot package closure
- initial confidence score: 0.30 before source and `origin/main` audits
- improvement loop: score every package row, repair safe drift, run focused proof and review
- final score / loop closure: 1.00; all 94 rows score 100 and proof is green

Completion threshold:
- All 94 initial AI package rows score `100` or carry an explicit deferral with
  reason, owner, proof needed, and next action; package lint, source-first
  typecheck, tests, build, source audits, changeset when needed, autoreview,
  and the final checker pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plate-next-ai-package-review.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/ai lint:fix`, source-first package typecheck, package tests, package build
- package proof: AI package runtime/type/test/build plus declarations and barrels when exports change
- shared Core gate: N/A unless the review proves a smallest Core/Plite owner change is required; AI is a product plugin package
- source audits: `origin/main` owner parity, stale editor APIs, active transaction use, callback-only subscriptions, type escapes, public export callers, and dependency ownership
- related scoped sweep query / active scope / match count / patched count / deferred count:
  exact query rows recorded after every correction; active scope AI plus smallest blocking owner
- package file manifest / row count / checked count / deferred count: 94 / 94 / 0
- Plite/Plate gap ledger: record every blocker or explicit N/A
- broad Core drift ledger gate: N/A; broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plate-next-ai-package-review.md`

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
- allowed edit scope: `packages/ai`, this plan, package changeset, and only the smallest proven Plite/Core owner needed to unblock AI
- package/API surfaces: AI plugins, chat/streaming/copilot transforms, hooks, utilities, tests, exports, and metadata
- docs/browser surfaces: package README source audit only; apps/docs/browser proof N/A in package review mode
- non-goals: no Yjs or second package, no broad caller migration, no registry/docs/template work, no rename pass, no unaccepted block-relative API implementation
- out-of-scope package errors: record by owner; do not patch unless caused by the AI packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- For this 94-row package, start with counts and file lists; read source by
  owner folder, exclude `dist`, coverage, `.turbo`, generated output, and cap
  broad searches before opening matches.

Blocked condition:
- Stop only when a clean AI migration requires an unresolved public Plite/Plate
  API decision that the current accepted plan does not settle, or focused proof
  repeatedly fails in an owner outside the allowed package boundary.

Current verdict:
- verdict: AI package review complete
- confidence: 1.00
- next owner: `packages/table` for its independent Plate Next packet
- keep / revert / quarantine call: keep the AI and smallest Plite History owner packet
- reason: all 94 AI rows score 100; scoped lint, typecheck, 71 fast tests,
  17 slow tests, build, Plite History proof, dependency audit, and source audits pass

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | `ok go` resolved to AI first; one package only; stop before Yjs; proof and handoff requirements recorded |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read in full |
| Active goal checked or created | yes | active goal points to this exact 94-row AI plan |
| Mode classified as named packet vs broad Core sweep | yes | package review; broad Core sweep N/A |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | current Plate product layer over Plite, no compatibility preservation |
| Broad Core drift ledger initialized when in scope | no | N/A: no broad Core request |
| Source of truth and allowed workspace recorded | yes | current checkout and `origin/main`; package plus smallest blocking owner only |
| Output budget strategy recorded | yes | counted manifests and capped owner-folder reads; generated output excluded |
| Public API fork routing checked | yes | block-relative insertion decisions route to the existing named plan; no local alias or unaccepted API fork |
| Gap policy checked | yes | missing substrate becomes a named Plite/Plate gap, not an AI helper workaround |
| Related scoped sweep policy checked | yes | same-class corrections stay inside AI plus smallest blocking owner |
| Review-mode rename freeze checked | yes | current HEAD names and owners stay fixed |
| Package review checklist initialized when in scope | yes | exact 94-file tracked manifest, 94 origin/main rows, 0 untracked |

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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | green AI and Plite History proof recorded below |
| Broad Core drift ledger coverage | no | N/A: package review, no broad Core sweep | N/A |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred | 94/94 rows score 100; adjacent gaps have owners |
| Best Plate v2 recommendation | yes | Record current shape and rejected hacks | recorded below |
| Plite/Plate gap ledger | yes | Record blockers and deferrals | recorded below |
| Related scoped sweep after correction | yes | Record same-class searches inside active scope | recorded below |
| Package file checklist | yes | Record manifest and closure counts | 94 expected, 94 actual, 94 checked, 0 deferred |
| Package/API proof | yes | Run focused typecheck/test/build | green |
| Shared Core gate coverage | no | N/A: AI is product policy; Plite History has its own package proof | N/A |
| Non-Core package error triage | yes | Classify graph failures outside the packet | Resizable and Table recorded below |
| Source audit | yes | Audit removed compatibility and aggregate imports | zero remaining matches in AI source |
| Rename ledger | no | N/A: no paths renamed | N/A |
| Extracted-file inventory | yes | Record untracked package files | zero untracked files |
| Autoreview / review | yes | Run structured review and verify findings | AI findings fixed; unrelated app findings deferred |
| Final lint/check | yes | Run package lint and proof | green |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plate-next-ai-package-review.md` | run after final review evidence |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| package metadata, exports, and dependency graph | 0 | main-parity-cleanup | `@platejs/ai` | all runtime imports target `@platejs/core`, `@platejs/plite`, `@platejs/utils`, or `@udecode/utils`; optional AI SDK peers restored | none |
| `BaseAIPlugin` and preview lifecycle | 0 | keep-in-plate | `@platejs/ai` | typed plugin API/tx groups and real-editor lifecycle tests | none |
| AI history batching and undo | 0 | keep-in-plate | `@platejs/ai` | typed state-field tag; merged multi-chunk undo and redo-discard tests | none |
| explicit state-aware batch merge and `discardRedo` | 0 | move-to-plite | `@platejs/plite-history` | 62 direct contract tests plus package tests/typecheck/build | none |
| AI chat plugins, hooks, and actions | 0 | keep-in-plate | `@platejs/ai` | React 18-safe effect refs; 17 slow hook/action tests | none |
| streaming and suggestion transforms | 0 | keep-in-plate | `@platejs/ai` | active transactions, optional reads, real-editor fixtures | none |
| block-relative insertion convenience | 1 | defer-with-owner | named Plite API plan | explicit `PathApi.next` remains correct and tested | decide in `2026-07-13-plite-block-relative-insertion-api.md` |
| suggestion decision atomicity | 1 | defer-with-owner | `@platejs/suggestion` | public helpers still own updates; no raw tx leaked through AI | address in Suggestion packet |
| Table runtime integration | 1 | defer-with-owner | `@platejs/table` | AI uses typed non-merged fixture; Table build exposes independent legacy API drift | Table packet |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `@platejs/ai` | Plate-owned product plugins composed from direct Plite/Core owners; plugin APIs for reads and internal tx groups for mutation | mutable history batches, raw tx in public helpers, umbrella `platejs` imports, fake capability editor types, `{ required: true }`, old Slate shims | preserves product ownership while using one editor substrate | none for AI; adjacent API plans remain independent |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| resolved Plite gap | discard an AI redo branch and explicitly merge batches carrying state patches | mutating `history.redos` or tagging batch objects exposes history internals | `@platejs/plite-history` | undo/redo/state-patch contract tests | implemented and green |
| deferred Plite gap | ergonomic block-relative insertion | another AI-only wrapper would duplicate generic placement policy | named Plite API plan | accepted public API plan plus Plite tests | keep explicit paths until accepted |
| deferred Plate gap | one transaction for accepting/rejecting multiple suggestions | passing raw tx through AI public transforms breaks ownership | `@platejs/suggestion` | Suggestion API design and package proof | defer to Suggestion packet |
| deferred Plate gap | migrated Table runtime for live integration proof | AI-local casts or copied Table behavior would hide Table drift | `@platejs/table` | Table package migration and real integration test | defer to Table packet |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| stale Slate/editor APIs and forced reads | `packages/ai/src` | `rg` for `createSlateEditor`, `SlateEditor`, `editor.tf`, `getApi`, `getTransforms`, `required: true`, assertions, and normalize | 0 remaining | all scoped matches | 0 | none in AI |
| aggregate package imports | `packages/ai/src` | `rg "from ['\"]platejs(?:/react)?['\"]"` | 94 initial, 0 remaining | 94 | 0 | outside packages remain package-owned |
| render-time/effect event compatibility | AI hooks | `rg useEffectEvent packages/ai/src` | 2 initial, 0 remaining | 2 | 0 | none |
| active transaction reads | AI mutation helpers and plugin middleware | inspect transaction callbacks for committed `editor.read` calls | 5 | 5 | 0 | insertion, cleanup, suggestion, chat trigger, and copilot paths have transaction composition proof |
| AI history internals | AI plus Plite History | audit direct batch fields and mutable redo access | 3 | 3 | 0 | none |
| AI SDK loading contract | copilot trigger | `rg "chat?.isLoading" packages/ai/src` | 1 initial, 0 remaining | 1 | 0 | none |
| public dependency declarations | `packages/ai/package.json` and source imports | import-owner and manifest audit | 6 deltas | 6 | 0 | none |
| stale targets across AI undo | AI transforms calling `BaseAIPlugin.api.undo()` | inspect pre-undo nodes/paths consumed after undo | 1 | 1 | 0 | all sibling undo call sites audited |
| completion response formats | AI Copilot fetch path | inspect response parsing and stream contract | 1 JSON-only path | 1 | 0 | JSON and text-stream regressions both covered |
| final content plus ready transition | `useChatChunk` | combined status/content lifecycle review | 1 | 1 | 0 | combined transition regression covered |

Core drift ledger:
- Applies: no; package review did not request broad Core
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
| N/A | N/A | N/A | N/A | package review only | N/A |

Package file checklist:
- Applies: yes
- Package: `packages/ai`
- Manifest command: `git ls-files packages/ai` plus `git ls-files --others --exclude-standard packages/ai`; compare `git ls-tree -r --name-only origin/main packages/ai`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 94
- Actual row count: 94
- Checked score-100 count: 94
- Unchecked/deferred count: 0 / 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: satisfied; all AI rows score 100

Package file rows:
- [x] `packages/ai/.npmignore` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/CHANGELOG.md` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/README.md` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/package.json` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/BaseAIPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/transforms/aiStreamSnapshot.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/transforms/aiStreamSnapshot.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/transforms/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/transforms/insertAINodes.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/transforms/insertAINodes.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/transforms/removeAIMarks.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/transforms/removeAIMarks.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/transforms/removeAINodes.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/transforms/removeAINodes.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/transforms/undoAI.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/transforms/undoAI.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/transforms/withAIBatch.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/transforms/withAIBatch.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/types.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/utils/getEditorPrompt.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/utils/getEditorPrompt.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/utils/getMarkdown.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/utils/getMarkdown.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/utils/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/utils/replacePlaceholders.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/lib/utils/replacePlaceholders.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/AIChatPlugin.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/AIChatPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/hooks/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/hooks/useAIChatEditor.slow.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/hooks/useAIChatEditor.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/hooks/useChatChunk.slow.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/hooks/useChatChunk.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/hooks/useEditorChat.slow.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/hooks/useEditorChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/internal/types.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/streaming/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/streaming/streamDeserializeInlineMd.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/streaming/streamDeserializeMd.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/streaming/streamInsertChunk.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/streaming/streamSerializeMd.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/streaming/utils/escapeInput.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/streaming/utils/getListNode.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/streaming/utils/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/streaming/utils/isSameNode.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/streaming/utils/nodesWithProps.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/streaming/utils/streamingNodeUtils.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/streaming/utils/utils.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/streaming/utils/utils.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/transforms/acceptAIChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/transforms/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/transforms/insertBelowAIChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/transforms/removeAnchorAIChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/transforms/replaceSelectionAIChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/utils/acceptAISuggestions.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/utils/aiChatActions.slow.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/utils/applyAISuggestions.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/utils/applyAISuggestions.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/utils/applyTableCellSuggestion.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/utils/getLastAssistantMessage.slow.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/utils/getLastAssistantMessage.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/utils/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/utils/nestedContainerUtils.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/utils/rejectAISuggestions.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/utils/resetAIChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/utils/submitAIChat.slow.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/utils/submitAIChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai-chat/withAIChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai/AIPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai/utils/aiCommentToRange.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai/utils/findTextRangeInBlock.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/ai/utils/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/CopilotPlugin.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/renderCopilotBelowNodes.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/transforms/acceptCopilot.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/transforms/acceptCopilotNextWord.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/transforms/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/utils/callCompletionApi.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/utils/callCompletionApi.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/utils/getNextWord.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/utils/getNextWord.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/utils/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/utils/triggerCopilotSuggestion.slow.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/utils/triggerCopilotSuggestion.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/utils/withoutAbort.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/copilot/withCopilot.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/src/react/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/tsconfig.build.json` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none
- [x] `packages/ai/tsconfig.json` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: source audit plus green lint, typecheck, 71 fast tests, 17 slow tests, and build — next: none

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| plugin/runtime migration | `@platejs/ai` | old Slate/Plate APIs and weak plugin typing survived migration | AI source, specs, lint/typecheck/tests/build | keep corrected owner shape | none |
| history contract | `@platejs/plite-history` | AI mutated history internals because typed control was missing | history extension, merge policy, contract/type tests | move generic control to Plite History | none |
| dependency ownership | `@platejs/ai` | internal source imported the `platejs` user aggregator | package manifest and all AI imports | use direct owners; cut `platejs` dependency | none |
| block-relative insertion | Plite API plan | a local AI helper would preempt a public API decision | explicit placement paths and named plan | defer API; keep literal correct path | named plan |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | exact package scope, 94-row manifest, non-goals, proof, and stop condition recorded | none |
| Source and owner review | complete | all 94 files compared to current APIs and `origin/main` ownership | none |
| Package migration | complete | AI runtime, hooks, transforms, tests, and dependencies use current direct owners | none |
| Smallest owner repair | complete | Plite History control and state-aware merge added with contract tests | none |
| Focused proof | complete | AI and Plite History lint/typecheck/tests/build green | none |
| Closeout | complete | 94/94 score 100; final scoped autoreview clean; ledgers and handoff filled | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | tracked 94, untracked 0, origin/main 94 | no extracted files | manifest parity exact |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `@platejs/resizable` via source-first Turbo graph | existing `editor.tf` and `useReadOnly` migration failures stop the graph before AI | package-local AI typecheck is green; AI did not cause these errors | Resizable package packet |
| `@platejs/table` build | broad legacy Table editor APIs | AI production keeps the real Table import; test fixture isolates only a non-merged grid contract | Table package packet |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| `applyAISuggestions` callers and legacy casts | `apps/www`, templates, content docs | package mode forbids app/docs/template caller migration | app/docs lane after packages settle |
| old Plate editor API examples | content docs and generated registry output | generated/docs surfaces are separate and currently teach pre-v2 APIs | docs/registry migration owner |
| aggregate `platejs` imports | other unmigrated feature packages | each package must land its own Plate Next packet | package queue |
| block-relative insertion boilerplate | Media and other product packages | public API plan is not accepted | named Plite API plan |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | migrated AI plugins/hooks/transforms; direct owner imports; typed AI state/history; added Plite History `discardRedo` and state-aware explicit merge |
| tests/proof | replaced fake Slate tests with real editors; added preview, multi-chunk undo, chat status, suggestion transaction, and history state-patch regressions |
| docs/templates/skills | completed this package ledger and added AI/Plite History changesets; no product docs/templates touched |
| reverted/quarantined packets | no runtime packet quarantined; block-relative public API remains planning-only |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Table package drift | prevents real live Table integration proof and has broad old API usage | `packages/table` | run the next package packet there |
| 2 | Suggestion decision atomicity | multi-suggestion accept/reject cannot share one transaction without owner support | `packages/suggestion` | design in the Suggestion owner; do not pass public raw tx |
| 3 | app/docs legacy callers | package API changed but package mode cannot rewrite generated/templates/docs surfaces | `apps/www`, `content`, `templates` | migrate after package contracts stabilize |

Findings:
- Baseline `turbo typecheck` cannot reach `@platejs/ai`: the dependency graph fails first in `@platejs/resizable` on existing `editor.tf` and `useReadOnly` errors outside this package.
- The AI source audit found and closed legacy editor APIs, forced reads, weak hook lifecycles, fake editor tests, direct history mutation, stale AI SDK loading state, and 94 aggregate `platejs` import lines.
- Final scoped review caught and closed stale insert-below paths across undo and JSON-only Copilot completion parsing.
- A subsequent scoped pass caught the exported Combobox option type without a declared dependency; the complete production import manifest is now declared.
- The final hook pass caught whole-response replay when final content and `ready` arrived together; chunk and finish state now advance atomically.
- The final transaction pass caught committed selection/tree reads inside `insertAINodes`, `removeAINodes`, and AI chat trigger middleware; all three now query the active transaction and have composed-write regressions.
- Final scoped autoreview found no current-checkout actionable defects in AI or Plite History and rated the patch correct.
- Direct AI TypeScript proof clears every runtime/source and package-local test file; no `createSlateEditor`, `SlateEditor`, fake callback annotation, or old transform shim remains.
- Refreshing declarations succeeded for Markdown, Selection, and Suggestion. Building Table exposes broad pre-existing Table migration errors, so Table source is a later package owner rather than an AI edit.

Decisions and tradeoffs:
- Keep AI preview/chat/copilot behavior in `@platejs/ai`; it is product policy, not generic editor substrate.
- Replace direct history-batch mutation (`batch.ai`, `batch.shouldAbort`, `redos.pop()`) with typed history state patches. AI batch identity and copilot suggestion text belong in local state fields so undo/redo can restore them atomically with document edits.
- Treat preview accept/cancel as API orchestration because each action intentionally spans history modes; keep ordinary document writes transaction-backed.
- Add the smallest required Plite History owner API for permanently discarding a canceled redo branch; do not expose mutable history stacks or keep a package-local cast.
- Preserve literal AI streaming placement paths until the block-relative Plite API plan is accepted; do not invent an AI-only wrapper.
- Keep optional `@ai-sdk/react` and `ai` peers because exported AI types reference them, while importing Plate/Plite internals only from direct owner packages.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm turbo typecheck --filter=./packages/ai && pnpm --filter @platejs/ai test && pnpm --filter @platejs/ai build` stopped in `@platejs/resizable` before AI proof (`editor.tf` missing; `useReadOnly` missing export) | 1 | Run AI-local source typecheck/test/build separately; keep `resizable` out of this package packet | Out-of-scope dependency blocker recorded; unresolved outside AI |
| `pnpm --filter @platejs/table build` reports widespread legacy Table editor APIs | 1 | Keep AI against the available Table declarations; migrate Table only in its own package packet | Out-of-scope Table owner recorded; no Table source patched |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/ai --filter=./packages/plite-history`: Plite History typecheck passed; graph then stopped on the same unrelated Resizable errors before AI.
- `pnpm --filter @platejs/ai lint:fix`: 91 files checked, clean.
- `pnpm --filter @platejs/ai typecheck`: pass.
- `pnpm --filter @platejs/ai test`: 71 pass, 0 fail.
- `pnpm test:slow packages/ai/src`: 17 pass, 0 fail.
- `pnpm --filter @platejs/ai build`: pass.
- `pnpm test:manifests`: pass after cutting the unused `platejs` peer.
- scoped `autoreview` for AI, Plite History, owned changesets/lockfile, and this plan: clean, no accepted actionable findings.
- `pnpm --filter @platejs/plite-history lint:fix`, `typecheck`, `test`, and `build`: pass; package suite 18 pass.
- direct Plite History contract run: 62 pass, 0 fail.
- AI source audit for old editor APIs, forced reads, normalize calls, suppressions, stale loading state, and aggregate `platejs` imports: zero matches.
- `pnpm --filter @platejs/markdown build`, `pnpm --filter @platejs/selection build`, and `pnpm --filter @platejs/suggestion build`: pass.
- `pnpm brl`: N/A; no exported file was added, removed, moved, or newly exported.
- Browser proof: N/A by Plate Next package mode; no app/docs surface was touched.

Final handoff contract:
- target surface and mode: `packages/ai`, one-package Plate Next review
- files/APIs reviewed: all 94 package files plus the smallest Plite History owner
- broad Core drift score coverage: N/A; no broad Core sweep
- package file checklist coverage: 94 total, 94 score 100, 0 unchecked, 0 deferred
- best Plate v2 recommendation: direct-owner Plate product plugins over Plite; no compat layer or user aggregator dependency
- verdict matrix summary: AI keep-in-plate; generic history control move-to-plite; three adjacent gaps defer-with-owner
- Plite/Plate gaps or blockers: no AI blocker; Table, Suggestion atomicity, and block-relative API remain owner-scoped follow-ups
- related scoped sweep query/active scope/matches/patched/deferred: recorded above; all AI matches patched, broader owners deferred
- out-of-scope matches discovered: app/docs/templates and other package aggregate imports
- changes made: runtime/API, tests, dependencies, changesets, and plan recorded above
- tests/proof commands: all focused package commands green; Turbo graph blocker classified
- old compatibility names audited: zero remaining matches in AI source
- needs attention: Table first, then Suggestion atomicity and app/docs fallout
- next best Plate Next packet: `packages/table`

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | AI package closure |
| Where am I going? | package handoff; Table is the next independent packet |
| What is the goal? | 94/94 AI files at score 100 with package and owner proof |
| What have I learned? | AI product ownership is sound; History needed two typed controls; Table is the next blocker |
| What have I done? | migrated, tested, audited, and scored the complete package |

Timeline:
- 2026-07-13T19:56:26.868Z Goal plan created.
- 2026-07-13 Baseline proof attempted; unrelated `@platejs/resizable` graph failure isolated from the AI package.
- 2026-07-13 Initial source smell map completed; hooks, editor API calls, casts, and streaming placement selected for exact audit.
- 2026-07-13 AI runtime, hooks, transforms, tests, and direct dependencies migrated to current Plate/Plite owners.
- 2026-07-13 Plite History gained typed redo disposal and explicit state-aware batch merging with contract proof.
- 2026-07-13 94 package rows closed at score 100; package and owner proof green.
- 2026-07-13 Final scoped autoreview clean after active-transaction composition regressions; package closed.

Open risks:
- `docs/plans/2026-07-13-plite-block-relative-insertion-api.md` is planning-only and not accepted. AI keeps the explicit `PathApi.next` placement temporarily; this row is deferred to that plan instead of implementing an unaccepted Plite API.
- Suggestion accept/reject helpers each own an update, so AI cannot group a multi-suggestion decision into one batch without a suggestion-owned transaction API. Keep the behavior explicit and defer atomic batching to `packages/suggestion`; do not pass raw transactions through public AI helpers.
- Table package migration is required before replacing the typed non-merged Table fixture with live runtime integration proof.
- App/docs/template callers still contain legacy APIs and casts; package mode deliberately did not touch them.
