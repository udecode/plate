# plate next ai migration drift sweep

Objective:
Close the AI migration drift sweep; done when all 65 changed source files are
reviewed, every overexpanded rewrite is simplified or justified, and package
proof/review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-14-plate-next-ai-migration-drift-sweep.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: `ok go then review for any other such drift [$plate-next]`
- mode: package-scoped correction sweep against `origin/main`
- target surface: all 65 changed TypeScript source/spec files under `packages/ai/src`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes; start from the redundant
  `toArray().toReversed().forEach(tx.nodes.remove)` rewrite and inspect every
  changed AI source file for the same overexpanded-migration class
- package review mode: yes, follow-up to the completed 94-file AI packet
- package review target: `packages/ai`; no next package, apps, docs, templates,
  or unrelated package edits
- package file checklist gate: 65 changed source/spec rows materialized below;
  prior complete 94-file package ledger remains in
  `docs/plans/2026-07-13-plate-next-ai-package-review.md`
- completion threshold summary: 65/65 rows scored 100 or explicitly deferred;
  every candidate classified, all safe simplifications applied, focused proof
  and scoped autoreview clean

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
- semantics: N/A: no timed checkpoint
- initial confidence score: 0.70; previous package proof was green but the
  redundant removal traversal proves the simplicity review was incomplete
- improvement loop: compare all 65 changed source files with `origin/main`,
  rank expansion candidates, simplify safe cases, rerun exact same-class
  searches and package proof
- final score / loop closure: 1.00 only with 65/65 rows closed, zero
  unjustified overexpanded rewrites, green proof, and clean scoped review

Completion threshold:
- All 65 changed AI source/spec files are compared with `origin/main` and have
  a score-100 or explicit deferral row.
- Every migration expansion involving manual query/enumeration, callback
  plumbing, repeated transaction calls, copied traversal, fake typing, or
  unnecessary helper state is classified and either simplified or justified
  by behavior/proof.
- `removeAINodes` delegates matching removal directly to `tx.nodes.remove`.
- AI lint, typecheck, fast tests, slow tests, build, exact source audits, final
  scoped autoreview, diff check, and this plan checker pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-ai-migration-drift-sweep.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: direct transform specs for every behavior-affecting
  simplification
- package proof: `pnpm --filter @platejs/ai lint:fix`, `typecheck`, `test`,
  `pnpm test:slow packages/ai/src`, and `pnpm --filter @platejs/ai build`
- shared Core gate: `pnpm --filter @platejs/core typecheck`; the smallest Core
  typing owner was changed so plugin portals expose their existing one-shot tx
  methods
- source audits: all 65 changed source diffs against `origin/main`; exact
  searches for manual enumeration-before-mutation, one-shot callback wrappers,
  stale editor APIs, casts, normalization, and nested/consecutive updates
- related scoped sweep query / active scope / match count / patched count / deferred count:
  record every query and result in the ledger below
- package file manifest / row count / checked count / deferred count: changed
  source manifest from `git diff --name-only origin/main -- packages/ai/src |
  rg '\.(ts|tsx)$'`; 65 expected, actual, and checked; zero deferred
- Plite/Plate gap ledger: Core portal typing fixed; nonblocking nested history
  callback typing limitation recorded
- broad Core drift ledger gate: N/A: no broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-ai-migration-drift-sweep.md`

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
- allowed edit scope: `packages/ai`, this plan, and the existing AI changeset
  only; smallest Plite/Core owner only if a proven blocker appears
- package/API surfaces: preserve current helper owners and current public
  plugin API/tx groups; simplify implementations without compatibility aliases
- docs/browser surfaces: no apps, content, templates, registry, or browser
  proof; package-mode source/proof only
- non-goals: no Table/Yjs/next-package work, no renames/moves/new helper files,
  no broad caller rewrite, no unrelated cleanup
- out-of-scope package errors: record only; do not patch unless caused by this
  packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- For this sweep, inspect counts and ranked diff stats first, then save compact
  source-diff summaries to `/tmp`; do not stream all 65 full diffs at once.

Blocked condition:
- Stop only if simplifying a candidate requires an unresolved public
  Plite/Plate API decision or focused AI proof repeatedly fails in an owner
  outside the allowed boundary.

Current verdict:
- verdict: clean; all 65 changed AI source/spec files are score 100
- confidence: 1.00
- next owner: user-selected next package
- keep / revert / quarantine call: keep the 12 scoped simplifications and the
  smallest Core plugin-portal typing fix; no packet quarantined
- reason: exact audits, 71 fast tests, 17 slow tests, AI/Core typechecks, AI
  build, manifests, and scoped autoreview are clean

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | exact AI scope, correction class, non-goals, proof, stop condition, and handoff recorded above |
| `plate-next` skill/rule read | yes | user supplied the full skill and `.agents/skills/plate-next/SKILL.md` was read |
| Active goal checked or created | yes | new goal targets this exact 65-file plan |
| Mode classified as named packet vs broad Core sweep | yes | package-scoped correction sweep; broad Core N/A |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | direct Plite primitives with main owner preserved; no compatibility goal |
| Broad Core drift ledger initialized when in scope | no | N/A: no broad Core sweep |
| Source of truth and allowed workspace recorded | yes | current checkout plus `origin/main`; AI package only unless a smallest owner blocker is proven |
| Output budget strategy recorded | yes | counts/ranked stats first; capped targeted diffs; generated/build output excluded |
| Public API fork routing checked | yes | no public API fork known; any discovered fork routes to `plate-plan` |
| Gap policy checked | yes | no local workaround for missing substrate; name the smallest owner |
| Related scoped sweep policy checked | yes | all 65 changed AI source/spec files; outside-package matches deferred |
| Review-mode rename freeze checked | yes | no renames, moves, or new helper files |
| Package review checklist initialized when in scope | yes | 65 changed source/spec rows materialized below before implementation |

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
| Named verification threshold | pass | Run the proof commands named in this plan | all named commands green |
| Broad Core drift ledger coverage | N/A | No broad Core sweep | smallest blocking type owner only |
| Score gate | pass | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 65/65 score 100; zero deferred |
| Best Plate v2 recommendation | pass | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | direct plugin/Plite transaction ownership recorded |
| Plite/Plate gap ledger | pass | Record blockers or N/A when no gap blocks the target | one Plate typing gap fixed; one nonblocking history typing limitation recorded |
| Related scoped sweep after correction | pass | For each correction, run and record same-class search/review results inside the active scope | exact query ledger below |
| Package file checklist | pass | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | 65 expected/actual/checked; zero missing/extra/deferred |
| Package/API proof | pass | Run focused typecheck/test/build or record N/A | focused 23, fast 71, slow 17, typecheck, build, manifests |
| Shared Core gate coverage | pass | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | AI is product-only; changed Core owner passes Core typecheck |
| Non-Core package error triage | pass | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | none |
| Source audit | pass | Run exact audit for removed compatibility names or record N/A | no stale APIs, fake editor types, casts, or normalization calls in production |
| Rename ledger | N/A | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | no renames/moves/new files |
| Extracted-file inventory | pass | Record untracked/extracted file command, row count, and bucket for every file in scope | zero untracked AI files |
| Autoreview / review | pass | Run review gate for non-trivial implementation diffs or record N/A | clean, no accepted/actionable findings |
| Final lint/check | pass | Run scoped lint/check or record N/A | AI/Core lint and diff check clean |
| Changed list / top drift / needs attention | pass | Fill handoff ledgers | filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-ai-migration-drift-sweep.md` | `[autogoal] complete` passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and manifest | completed | 65 changed AI source/spec paths materialized before edits | closed |
| Review and correction | completed | 65/65 score 100; scoped drift classes fixed or justified | closed |
| Verification | completed | Focused/package/Core proof and scoped autoreview clean | closed |
| Closeout | completed | Ledgers and handoff filled | final checker |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `removeAINodes` manual match enumeration | 4 | main-parity-cleanup | `@platejs/ai` | `tx.nodes.remove` owns matching, path refs, active state, and safe iteration | fixed directly |
| `removeAINodes` scoped `at` behavior | 4 | main-parity-cleanup | `@platejs/ai` | old manual traversal treated a Path as a subtree; direct Plite targeting does not | test corrected to explicit text path |
| `insertAINodes` / `streamInsertChunk` normalization wrappers | 3 | cut | `@platejs/ai` | active transactions normalize at commit | wrappers deleted |
| `insertBelowAIChat` block-selection insertions | 3 | direct-plugin-tx | `@platejs/ai` | one-shot tx method exists at runtime | use plugin portal one-shot calls |
| `replaceSelectionAIChat` raw Selection helpers | 3 | direct-plugin-tx | `@platejs/ai` | grouped batch needs both plugin tx operations | one outer plugin-typed transaction |
| `BasePluginContextEditor.update` | 3 | Plate-gap-fixed | `@platejs/core` | portal runtime exposed own tx methods but type exposed only core methods | use `BaseEditor<Value, C>['update']`; type-test added |
| `getMarkdown` selection guard | 2 | cut | `@platejs/ai` | `read.nodes.block` already defaults to current selection | guard deleted |
| `aiStreamSnapshot` impossible element throw | 2 | cut | `@platejs/ai` | top-level preview blocks are already `Element[]` | element-owned recursive helper |
| `removeAnchorAIChat` option typing | 2 | simplify | `@platejs/ai` | transform owns its semantic match | public options reduced to `at` |
| `submitAIChat` inferred locals / repeated selection read | 2 | simplify | `@platejs/ai` | initializer and one stored selection own the types/state | annotations and second read deleted |
| `applyTableCellSuggestion` equality predicate | 2 | property-matcher | `@platejs/ai` | exact shallow ID equality | `match: { id }` |
| remaining changed AI source/spec files | 0 | keep-in-plate | `@platejs/ai` | origin/main diff review plus exact audits and full package proof | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| AI migration implementations | Preserve main helper owners while delegating directly to Plite reads/transactions; add logic only for real changed behavior | manual reimplementation of Plite traversal, callback boilerplate, fake types, helper dumps | smallest code and strongest active-transaction semantics | none unless a public API fork appears |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plate gap, fixed | Plugin portal `editor.update` omitted the plugin's own direct tx group from its type | local fake editor aliases or callbacks would hide an existing runtime capability | `packages/core/src/lib/plugin/BasePlugin.ts` | Core type-test and AI typecheck | fixed at owner |
| Plite typing limitation, nonblocking | `history.newBatch(fn)` / `skip(fn)` callback types erase other installed tx groups | annotating or casting nested `tx` would be fake typing | `@platejs/plite-history` | future generic extension-composition design | defer; canonical current shape is one outer typed transaction plus `tx.history.newBatch()` / `skip()` |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| manual enumeration before one matching node mutation | all 65 changed `packages/ai/src` files | `toArray` / reverse-loop / `tx.nodes.*` audit | 2 production matches | 1 | 0 | remaining `applyAISuggestions` loop consumes per-index diff state and reverse paths; justified |
| one-shot callback wrapper | changed AI production files | `editor.update((tx)` audit | 4 | 3 wrapper sites rewritten; 4 grouped callbacks remain | 0 | remaining callbacks each combine history mode with 1+ mutation or undo with redo disposal |
| redundant normalization | changed AI production files | `withoutNormalizing|normalize(` audit | 2 initial / 0 final | 2 | 0 | none |
| fake typing / casts | changed AI production files | exported structural editor types, `Parameters<EditorUpdateTransaction`, production `as any` / `as unknown as` | 2 initial / 0 final | 2 | 0 | test-only external mock casts remain outside production audit |
| redundant selection boilerplate | changed AI production files | `const selection = editor.read.selection()` plus immediate guard | 2 | 1 | 0 | remaining `insertBelowAIChat` consumes the selection range edges; justified |
| equality matcher predicate | changed AI production files | match callback audit | 1 | 1 | 0 | remaining predicates require schema policy, narrowing, ID sets, or truthiness |

Core drift ledger:
- Applies: no; product package correction sweep
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
| N/A | N/A | N/A | N/A | no broad Core sweep | N/A |

Package file checklist:
- Applies: yes; correction sweep over the changed AI implementation surface
- Package: `packages/ai`
- Manifest command: `git diff --name-only origin/main -- packages/ai/src | rg '\.(ts|tsx)$' | sort`; prior full package manifest is 94 tracked and 0 untracked
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 65 changed source/spec files
- Actual row count: 65
- Checked score-100 count: 65
- Unchecked/deferred count: 0 / 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: all 65 rows close and proof/review pass

Package file rows:
- [x] `packages/ai/src/lib/BaseAIPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/transforms/aiStreamSnapshot.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/transforms/aiStreamSnapshot.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/transforms/insertAINodes.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/transforms/insertAINodes.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/transforms/removeAIMarks.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/transforms/removeAIMarks.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/transforms/removeAINodes.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/transforms/removeAINodes.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/transforms/undoAI.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/transforms/undoAI.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/transforms/withAIBatch.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/transforms/withAIBatch.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/utils/getEditorPrompt.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/utils/getEditorPrompt.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/utils/getMarkdown.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/utils/getMarkdown.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/utils/replacePlaceholders.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/lib/utils/replacePlaceholders.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/AIChatPlugin.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/AIChatPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/hooks/useAIChatEditor.slow.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/hooks/useAIChatEditor.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/hooks/useChatChunk.slow.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/hooks/useChatChunk.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/hooks/useEditorChat.slow.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/hooks/useEditorChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/streaming/streamDeserializeInlineMd.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/streaming/streamDeserializeMd.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/streaming/streamInsertChunk.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/streaming/streamSerializeMd.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/streaming/utils/getListNode.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/streaming/utils/isSameNode.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/streaming/utils/nodesWithProps.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/streaming/utils/streamingNodeUtils.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/transforms/acceptAIChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/transforms/insertBelowAIChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/transforms/removeAnchorAIChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/transforms/replaceSelectionAIChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/utils/acceptAISuggestions.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/utils/aiChatActions.slow.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/utils/applyAISuggestions.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/utils/applyAISuggestions.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/utils/applyTableCellSuggestion.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/utils/getLastAssistantMessage.slow.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/utils/getLastAssistantMessage.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/utils/nestedContainerUtils.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/utils/rejectAISuggestions.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/utils/resetAIChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/utils/submitAIChat.slow.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/utils/submitAIChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai-chat/withAIChat.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai/AIPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai/utils/aiCommentToRange.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/ai/utils/findTextRangeInBlock.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/copilot/CopilotPlugin.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/copilot/renderCopilotBelowNodes.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/copilot/transforms/acceptCopilot.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/copilot/transforms/acceptCopilotNextWord.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/copilot/utils/callCompletionApi.spec.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/copilot/utils/callCompletionApi.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/copilot/utils/triggerCopilotSuggestion.slow.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/copilot/utils/triggerCopilotSuggestion.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/copilot/utils/withoutAbort.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed
- [x] `packages/ai/src/react/copilot/withCopilot.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/ai — evidence: origin/main diff reviewed; exact drift audits plus 71 fast, 17 slow, and typecheck proof — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| AI implementation simplification | `@platejs/ai` | migrations may reproduce Plite traversal or add scaffolding beyond main behavior | all 65 changed source/spec diffs plus focused source searches | clean: 12 simplifications, 65/65 score 100 | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | no untracked files under `packages/ai` | none to classify | `git ls-files --others --exclude-standard packages/ai` returned zero rows |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none yet | N/A | no proof failure yet | record if discovered |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| same overexpanded migration shapes outside AI | other packages | package correction sweep is AI-only | defer to each owning package packet |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | direct node removal; direct plugin tx calls; redundant normalization/selection/type scaffolding cut; Core plugin-portal update typing fixed |
| tests/proof | scoped remove target corrected; Core direct plugin update type contract added |
| docs/templates/skills | this goal plan only |
| reverted/quarantined packets | strict editor generic attempt rejected; no packet quarantined |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | no user decision required | package is clean; history nested-callback typing limitation is nonblocking and avoided without a cast | `@platejs/plite-history` | address only in a dedicated generic extension-composition packet |

Findings:
- `removeAINodes` manually enumerates matches and removes reversed paths even
  though Plite's transaction-native `nodes.remove({ at, match })` already owns
  matching, path refs, iteration safety, and active transaction state.
- The manual traversal also changed `at: Path` into subtree semantics; direct
  Plite behavior targets the exact node, matching `origin/main` intent.
- Plugin portals had the runtime direct tx methods but Core's portal editor
  type hid them. Fixing the owner removed five callback/helper accommodations.
- All 65 changed AI source/spec files close at score 100. The full package has
  94 tracked files and zero untracked files.

Decisions and tradeoffs:
- Preserve direct-owner imports and active `tx` requirements, but reject
  migration code that copies a Plite primitive's internal algorithm.
- Keep callbacks only for genuinely grouped transactions. Use a plugin portal
  for direct plugin tx methods; do not invent structural editor capability
  aliases.
- Keep the `applyAISuggestions` reverse loop: each row has conditional
  replacement semantics and consumes both node and path, so no Plite primitive
  owns the whole algorithm.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial changed-source pathspec also matched repository-wide `*.ts`/`*.tsx`, producing a wrong count of 3473 | 1 | Restrict by `packages/ai/src` first, then filter extensions with `rg` | Correct manifest is 65 |
| Typed `insertBelowAIChat`'s whole editor as only `BlockSelectionPlugin` | 1 | Fix the portal's actual direct-update type owner | Core portal type plus call sites compile |
| Used `history.newBatch(fn)` with plugin tx groups inside the nested callback | 1 | Use one plugin-typed outer transaction and call `tx.history.newBatch()` | Preserves grouping and inference without a cast |
| AI typecheck read stale Core declarations after the source type fix | 1 | Build only the changed Core artifact, then rerun exact AI typecheck | Passed; Core source/type-tests also pass |

Verification evidence:
- Source evidence: `packages/plite/src/transforms-node/remove-nodes.ts` proves
  direct matching removal already uses transaction state and path refs.
- Focused behavior: six specs, 23 pass / 0 fail.
- Package behavior: AI fast 71 pass / 0 fail; AI slow 17 pass / 0 fail.
- Types/build: AI typecheck, Core typecheck/type-tests, Core build needed for
  cross-package declarations, AI build.
- Hygiene: AI/Core lint fix, manifests, exact source audits, and scoped diff
  check pass. No export/barrel change, so `pnpm brl` is N/A.
- Browser: N/A; these transaction/type changes have no standalone package UI
  route. Package behavior and compile-time contracts are the runnable surface.
- Review: `.agents/skills/autoreview/scripts/autoreview --mode local --prompt
  <AI plus two Core owners>` returned clean with no accepted/actionable
  findings (`overall: patch is correct (0.82)`).

Final handoff contract:
- target surface and mode: package correction sweep over 65 changed AI files
- files/APIs reviewed: 65/65 AI source/spec files plus the smallest Core portal
  update type owner and its type-test
- broad Core drift score coverage: N/A; no broad Core sweep
- package file checklist coverage: 65/65 score 100; zero deferred/missing/extra
- best Plate v2 recommendation: direct Plite/plugin tx ownership; grouped outer
  transactions only where multiple mutations/history semantics require them
- verdict matrix summary: 12 safe simplifications; remaining complex loops and
  callbacks justified by consumed state or grouped behavior
- Plite/Plate gaps or blockers: Core portal typing fixed; nonblocking nested
  history callback typing limitation deferred to Plite History
- related scoped sweep query/active scope/matches/patched/deferred: ledger above;
  zero unjustified production matches remain, zero deferred AI fixes
- out-of-scope matches discovered: other packages intentionally not audited
- changes made: runtime/type simplifications plus one behavior correction and
  one Core type contract
- tests/proof commands: all named commands green; counts above
- old compatibility names audited: no stale flat option/query APIs, fake editor
  aliases, production casts, or normalization calls
- needs attention: none
- next best Plate Next packet: user-selected next package

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closed AI correction sweep |
| Where am I going? | User-selected next package |
| What is the goal? | Review all 65 changed AI source/spec files and remove every unjustified overexpanded migration |
| What have I learned? | Most migration complexity was valid, but direct plugin tx typing hid several unnecessary wrappers |
| What have I done? | Closed 65/65 rows, simplified 12 drift cases, fixed the Core portal type owner, and passed proof/review |

Timeline:
- 2026-07-14 Goal plan created, corrected to the local date, and filled before implementation.
- 2026-07-14 AI drift sweep closed: 65/65 score 100, proof green, autoreview clean.

Open risks:
- `@platejs/plite-history` nested control callbacks do not retain other
  installed tx groups in their callback type. Current AI code avoids the gap
  with one correctly typed outer transaction; no runtime risk remains.
