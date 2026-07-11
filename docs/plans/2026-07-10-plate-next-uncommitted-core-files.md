# plate-next uncommitted core files

Objective:
Close drift in the original seven uncommitted Core paths plus the four direct
type/proof owners required for a clean fix; done when all eleven paths score
100 and Core proof plus autoreview pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-10-plate-next-uncommitted-core-files.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user continuation: `plate-next next pkg`
- mode: changed-file package review continuing the uncommitted-package lane
- target surface: the original seven tracked uncommitted paths under
  `packages/core` plus three smallest direct type owners required to remove
  their cast scaffolding plus the static class-merge regression proof; no
  untracked Core paths exist
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; the user asked for the next package, not `all core`,
  `sweep`, or `full-loop`
- correction-triggered related scoped sweep: yes, limited to these owners and
  the smallest Plite caller/owner needed to prove a correction
- package review mode: yes, narrowed to the continuation's uncommitted packet
- package review target: `packages/core` eleven-path materialized manifest
- package file checklist gate: eleven rows; check only at score 100
- completion threshold summary: eleven of eleven current rows score 100 or carry an
  explicit defer owner; no unclassified drift; `check:core`, focused proof,
  source audits, autoreview, and the plan checker pass

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
- semantics: one-shot closure; no timed minimum
- initial confidence score: 0.60 because the owner family is small but touches
  render/static injection semantics and has not yet been scored
- improvement loop: compare every path with `origin/main`, inspect callers and
  types, score, patch safe drift, sweep the corrected class, prove, review
- final score / loop closure: 1.00: all eleven rows close and no
  accepted actionable review finding remains

Completion threshold:
- Every one of the eleven current Core paths has a score-100 checked row or an
  explicit defer reason, owner, proof needed, and next action.
- Preserve node-prop injection and render/static behavior versus `origin/main`
  while removing compatibility wrappers, fake casts, weak inference, or
  Plate-owned copies of Plite substrate.
- All correction-class matches inside the active scope are classified with
  match, patched, deferred, and remaining-risk counts.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-uncommitted-core-files.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: owner specs for plugin injection plus directly
  affected render/static helpers
- package proof: forced source-first Core typecheck and Core package tests/build
  only when the reviewed surface makes artifact proof meaningful
- shared Core gate: `pnpm check:core`
- source audits: exact eleven-path scans for casts, legacy editor/plugin APIs,
  duplicate injection matchers, local structural types, unsafe root pollution,
  nested updates, explicit normalization, and extracted files
- related scoped sweep query / active scope / match count / patched count / deferred count:
  recorded after each correction; active scope is the seven paths plus the
  smallest direct owner graph
- package file manifest / row count / checked count / deferred count: `git diff
  HEAD --name-only --diff-filter=ACMRTD -- packages/core` plus untracked
  inventory / 11 after direct type/proof owners joined / 11 checked / 0 deferred
- Plite/Plate gap ledger: record exact blocker or N/A
- broad Core drift ledger gate: N/A; this is not an all-Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-uncommitted-core-files.md`

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
- allowed edit scope: the seven original Core paths, direct type/proof owners,
  this plan, and the
  smallest Plite proof owner only if a concrete blocker requires it
- package/API surfaces: node-prop injection matching/piping and React/static
  render-prop composition
- docs/browser surfaces: N/A; package mode explicitly excludes www/browser
- non-goals: no all-Core sweep, public rename pass, docs/examples, feature
  package rewrites, generated registry work, commit, or PR
- out-of-scope package errors: classify and defer unless caused by this packet

Output budget strategy:
- Use exact seven-file reads, bounded caller searches, diff stats, and counts
  before snippets; exclude dist, node_modules, generated output, and apps.
- Store dense scoring in this plan instead of streaming full diffs.

Blocked condition:
- Stop only for a public API fork, a missing Plite/Plate capability, or a
  repeated proof failure with no narrower autonomous diagnosis remaining.

Current verdict:
- verdict: review-first; preserve the main owner family unless source proves
  compatibility or ownership drift
- confidence: 0.60 before file-by-file review
- next owner: plate-next
- keep / revert / quarantine call: keep the eleven-path cleanup; all owners were
  compared with `origin/main`, current callers, focused proof, and shared proof
- reason: this family spans Base, React, and static rendering, so local green
  typing alone cannot prove owner cohesion

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Next-package continuation, uncommitted scope, one-shot closure, proof, stop condition, and handoff are recorded. |
| `plate-next` skill/rule read | yes | User supplied the full current skill; it is applied with autogoal. |
| Active goal checked or created | yes | No active goal existed; Core packet goal created and expanded to eleven direct rows. |
| Mode classified as named packet vs broad Core sweep | yes | Changed-file Core package packet; explicitly not all-Core. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Main is evidence; final target is Plite-native Core ownership. |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep was not requested. |
| Source of truth and allowed workspace recorded | yes | Root/Plate/Common vision, current checkout, `origin/main`, eleven-path final manifest. |
| Output budget strategy recorded | yes | Exact files and bounded caller searches only. |
| Public API fork routing checked | yes | Any real public fork routes to `plate-plan`; none known at checkpoint zero. |
| Gap policy checked | yes | Missing substrate/product capability becomes a named gap, never a local shim. |
| Related scoped sweep policy checked | yes | Corrections sweep the seven paths and smallest direct owner graph only. |
| Review-mode rename freeze checked | yes | Current HEAD names stay fixed unless the user accepts a rename pass. |
| Package review checklist initialized when in scope | yes | Eleven tracked rows materialized after direct type/proof fixes; zero untracked rows. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: changed-file Core package packet; no broad Core sweep,
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
- [x] For broad Core sweep, N/A: the user did not request all-Core; the Core
      this plan, has one row per Core source file before closeout.
- [x] For broad Core sweep, N/A: no full Core manifest is in scope; every
      `verdict`, `owner`, `evidence`, and `next`.
- [x] For broad Core sweep, N/A: the plan records zero missing/extra broad rows
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] For broad Core sweep, N/A: no broad score gate applies; package rows own
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] For package review mode, the original seven-row checklist was generated before
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
- [x] Bridge scoring law applied: no forbidden bridge exists in the manifest;
      no file is score-capped by a bridge. Forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation; none
      were found.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: zero untracked Core files.
      Every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is N/A because no exports, public paths, or barrels changed.
- [x] Old compatibility names are source-audited; zero matches remain in the
      eleven changed paths.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| manifest and owner review | complete | Eleven tracked rows, zero untracked, origin/main and callers reviewed. |
| implementation and scoped sweeps | complete | Active drift fixed; broader debt deferred to named future owners. |
| focused and shared proof | complete | 37/37 focused; Core typecheck/build/lint and `check:core` pass. |
| final review and closure | complete | Final autoreview clean; eleven of eleven rows score 100. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Focused 37/37; Core typecheck/build pass; `check:core` passes. |
| Broad Core drift ledger coverage | no | N/A: named changed-file packet | Missing/extra broad rows both zero by definition. |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Eleven of eleven rows score 100; zero deferred. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Typed Base/React composition on Plite paths; no compatibility bridge. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | N/A: no missing capability blocked the packet. |
| Related scoped sweep after correction | yes | For each correction, run and record same-class search/review results inside the active scope | Six correction classes recorded below. |
| Package file checklist | yes | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | Expected/actual 11; checked 11; deferred/missing/extra 0. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Focused tests, typecheck, build, lint, and shared Core gate pass. |
| Shared Core gate coverage | yes | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | Existing `check:core` already owns Core and all adjacent packages exercised here; no script change required. |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | No non-Core failures. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Cast/legacy/direct-wrapper/normalize/required-path scans all zero. |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | No rename proposed or postponed. |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | Zero untracked Core files. |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs or record N/A | Two findings fixed; final rerun clean, patch correct 0.82. |
| Final lint/check | yes | Run scoped lint/check or record N/A | Core lint clean; `git diff --check` clean; `check:core` exit 0. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; no user decision required. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-uncommitted-core-files.md` | Run after this evidence update. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| injection path resolution | 100 | keep-in-plate | Core plugin injection | Optional live paths fail closed; transform order preserved; focused and shared tests pass. | closed |
| Base/React plugin prop composition | 100 | keep-in-plate | Core render composition | Generic owner types remove 58 weak cast sites while preserving layer-specific context. | closed |
| React fast/full element rendering | 100 | keep-in-plate | Core React renderer | Injected wrapper props and edit-only hook order match the full renderer; final autoreview clean. | closed |
| static render prop composition | 100 | keep-in-plate | Core static renderer | Plugin class output is merged with node and caller classes; regression spec passes. | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Core node-prop/render pipeline | Typed Base/React boundaries over Plite paths; optional public reads; shared React/static class semantics. | `any` bridge casts, asserted stale paths, duplicate wrappers, compatibility aliases. | Keeps Plate product composition in Core and editor substrate/path truth in Plite. | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No missing Plite or Plate capability | No workaround required | N/A | Focused plus shared Core proof | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| optional injection path | eleven changed paths | `editor.read.nodes.path(...)!`, required reads | 0 remaining | 3 callers corrected | 0 | none |
| broad weak casts | eleven changed paths | `as any`, `as unknown`, explicit `any` forms | 58 removed / 0 remaining | 58 | 0 | none |
| edit-only policy input | Core source, bounded owner search | `isEditOnly(... as any)` | 2 total | 1 active owner | 1 | `pipeRenderLeaf.tsx` is a future Core packet, not current drift |
| node-prop composition callers | Core source | `getPluginNodeProps(` excluding owner | 2 | 2 | 0 | none |
| static class parity | static owner plus direct spec | plugin/node/caller class merge inspection | 1 owner | 1 | 0 | none |
| property matcher cleanup | Core plugin/internal bounded search | equality-only predicate review | 1 active plus computed/path predicates outside scope | 1 | 0 | outside predicates retain real path/computed semantics |

Core drift ledger:
- Applies: no; not a broad Core sweep
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Top drift rows: N/A until a future explicit broad sweep

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | changed-file Core packet | N/A | broad Core not requested | N/A |

Package file checklist:
- Applies: yes, narrowed to the continuation's uncommitted manifest
- Package: `packages/core`
- Manifest command: `git diff HEAD --name-only --diff-filter=ACMRTD -- packages/core | sort` plus `git ls-files --others --exclude-standard packages/core | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 11 after direct owner/proof expansion
- Actual row count: 11
- Checked score-100 count: 11
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: all eleven rows score 100 or are explicitly deferred

Package file rows:
- [x] `packages/core/src/internal/plugin/isEditOnlyDisabled.ts` — score: 100 — verdict: keep-in-plate — owner: edit-only policy — evidence: typed `Pick<AnyBasePlugin, 'editOnly'>`; Core proof clean — next: closed
- [x] `packages/core/src/internal/plugin/pipeInjectNodeProps.tsx` — score: 100 — verdict: keep-in-plate — owner: injection pipeline — evidence: generic props, immutable accumulation, all three callers assign the result — next: closed
- [x] `packages/core/src/internal/plugin/pluginInjectNodeProps.spec.ts` — score: 100 — verdict: keep-in-plate — owner: injection proof — evidence: no casts; stale live-node regression preserves transform order — next: closed
- [x] `packages/core/src/internal/plugin/pluginInjectNodeProps.ts` — score: 100 — verdict: keep-in-plate — owner: injection resolver — evidence: optional path guard, direct typed node access, no assertion — next: closed
- [x] `packages/core/src/lib/types/RenderElementProps.ts` — score: 100 — verdict: keep-in-plate — owner: render callback contract — evidence: runtime nullability, React ref, and children contract match callers — next: closed
- [x] `packages/core/src/lib/utils/getInjectMatch.ts` — score: 100 — verdict: keep-in-plate — owner: injection matcher — evidence: exact property matcher and optional plugin key; focused proof clean — next: closed
- [x] `packages/core/src/lib/utils/getPluginNodeProps.ts` — score: 100 — verdict: keep-in-plate — owner: node-prop composition — evidence: generic input/output and precise Base/React callback boundary; both callers reviewed — next: closed
- [x] `packages/core/src/react/utils/getRenderNodeProps.ts` — score: 100 — verdict: keep-in-plate — owner: React render props — evidence: explicit Base/React context discrimination, optional path, zero weak casts — next: closed
- [x] `packages/core/src/react/utils/pipeRenderElement.tsx` — score: 100 — verdict: keep-in-plate — owner: React element renderer — evidence: typed fast/full paths, injected wrapper attributes, stable edit-only hook order; final autoreview clean — next: closed
- [x] `packages/core/src/static/utils/getRenderNodeStaticProps.ts` — score: 100 — verdict: keep-in-plate — owner: static render props — evidence: portable exported union, typed composition, full class merge; build clean — next: closed
- [x] `packages/core/src/static/utils/getRenderNodeStaticProps.spec.ts` — score: 100 — verdict: keep-in-plate — owner: static render props proof — evidence: plugin class preservation regression passes — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| typed injection/render cleanup | Core | weak casts obscured Base/React/static contracts | eleven manifest paths; focused proof; `check:core` | keep | closed at 11/11 score 100 |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| none | N/A | zero untracked Core files | no recovery needed | `git ls-files --others --exclude-standard packages/core` returned zero |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | no non-Core failures | shared gate passed all adjacent packages | N/A |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| `isEditOnly(... as any)` | `packages/core/src/react/utils/pipeRenderLeaf.tsx` | Outside original uncommitted manifest; touching it would pull a separate cast-heavy renderer into this packet. | future Core packet |
| weak casts in render proof/caller files | `getRenderNodeProps.spec.ts`, `pipeRenderElement.spec.tsx`, `pluginRenderElement.tsx` | Pre-existing files outside the uncommitted manifest; 57 sites need their own whole-file score pass. | future Core packet |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Typed injection and render composition across ten Core owners; optional stale paths; Base/React context discrimination; fast/full/static parity. |
| tests/proof | Stale-node injection regression and static plugin-class regression. |
| docs/templates/skills | This goal plan only; no product docs or generated surfaces. |
| reverted/quarantined packets | Reverted the incorrect optional `useNodePath` experiment; no quarantine remains. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | No user decision blocks this packet. | All eleven rows and proof gates closed. | N/A | Continue with `packages/csv` as the next package. |

Findings:
- The original seven-file diff correctly makes stale `editor.read.nodes.path`
  optional for path-based injection, but touched render files still hid their
  contracts behind broad `any` casts.
- Three smallest Core type owners were required: edit-only plugin input,
  render callback nullability, and generic node-prop composition.
- Autoreview found static/React class merge drift: static output discarded the
  class returned by `plugin.node.props`.
- Autoreview found two React fast-path parity defects: wrappers received stale
  pre-injection attributes, and edit-only wrapper factories were skipped before
  their hooks could run. Both now match the full path.
- `useNodePath` is a React render-lifecycle invariant, not the same optional
  public lookup as stale injection paths; returning `null` there removed nine
  established render behaviors.

Decisions and tradeoffs:
- Expand from seven to eleven current Core rows only for direct type/proof owners; do
  not sweep unrelated render helpers or feature packages.
- Keep the stale injection path guard and property matcher cleanup.
- Preserve the `useNodePath` invariant while removing unsafe `any` scaffolding.
- Preserve plugin-provided classes in both React and static prop composition.
- Preserve `belowNodes` wrapper factory call order in read-only mode and apply
  injected attributes consistently to wrappers and rendered elements.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Treating `useNodePath` as optional returned `null` from fast render paths | 1 | restore the render-lifecycle invariant while keeping optional public path reads | focused render suite returned to 18/18 pass |
| `check:core` artifact build could not name the inferred static return type | 1 | add an explicit exported union return contract | Core build and typecheck pass locally |

Verification evidence:
- `bun test` across the six affected injection/render/static suites: 37 pass,
  0 fail, 91 assertions.
- `pnpm --filter @platejs/core typecheck`: pass.
- `pnpm --filter @platejs/core build`: pass.
- `pnpm --filter @platejs/core lint:fix`: clean, no fixes on final pass.
- `pnpm check:core`: pass on the final source; Core 726/726 and every adjacent
  package suite passed, including Code Block 88/88.
- Final autoreview: clean, patch correct 0.82, no accepted/actionable findings.
- Final manifest/audits: 11 tracked, 0 untracked, 0 weak casts, 0 stale APIs,
  0 direct wrapper calls, 0 normalize calls, 0 required/asserted public paths,
  and clean `git diff --check`.

Final handoff contract:
- target surface and mode: changed-file package review of `packages/core`
- files/APIs reviewed: eleven tracked injection/render/static owner and proof files
- broad Core drift score coverage: N/A; no all-Core sweep requested
- package file checklist coverage: 11/11 score 100; 0 deferred/missing/extra/untracked
- best Plate v2 recommendation: typed Core product composition over Plite path/read truth
- verdict matrix summary: four owner groups kept in Plate at score 100
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: six rows above;
  active drift fully patched, one separate leaf renderer deferred to a future packet
- out-of-scope matches discovered: one `isEditOnly` cast plus 57 weak casts in
  three pre-existing render proof/caller files
- changes made: optional path handling, generic prop composition, cast removal,
  React fast/full wrapper parity, static class parity, direct regressions
- tests/proof commands: focused 37/37, Core typecheck/build/lint, `check:core`,
  final autoreview, source audits, diff check
- old compatibility names audited: zero matches in the eleven paths
- needs attention: none
- next best Plate Next packet: `packages/csv`

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Eleven-path Core packet closed |
| Where am I going? | Next package: `packages/csv` |
| What is the goal? | Preserve the 11/11 score-100 closure and move only after handoff. |
| What have I learned? | See Findings |
| What have I done? | Typed and proved the Core injection/render packet; see Timeline. |

Timeline:
- 2026-07-10T22:01:12.757Z Goal plan created.
- 2026-07-11 Original seven-path manifest reviewed; three direct type owners added.
- 2026-07-11 First cleanup pass exposed and corrected the `useNodePath`/stale-read distinction.
- 2026-07-11 Autoreview finding accepted: static plugin class merge repaired with direct proof.
- 2026-07-11 Autoreview findings accepted: fast wrappers receive injected
  attributes and edit-only wrapper factories keep stable hook order.
- 2026-07-11 Final autoreview and `check:core` passed; eleven rows closed at 100.

Open risks:
- No active packet risk. Deferred pre-existing leaf/render cast debt is recorded
  as a separate future Core packet and does not affect the eleven changed files.
