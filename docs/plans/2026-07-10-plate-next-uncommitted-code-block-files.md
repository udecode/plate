# plate-next uncommitted code-block files

Objective:
Close drift in all original 31 uncommitted Code Block paths plus required proof
callers; done when every current path scores
100 or is explicitly deferred, safe fixes land, package/Core proof and
autoreview pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-10-plate-next-uncommitted-code-block-files.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user request: "make sure no drift in uncommited code-block files"
- mode: current-tree changed-file package review
- target surface: the original 30 modified and one deleted tracked path under
  `packages/code-block`, plus any direct package proof caller changed by a safe
  correction; no untracked package paths exist
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, inside the current manifest
  plus the smallest Core/Plite owner needed to prove a fix
- package review mode: yes, narrowed by the user's literal `uncommitted` scope
- package review target: uncommitted `packages/code-block` paths only
- package file checklist gate: 32 materialized rows after the typed Lowlight
  correction added its direct formatter proof caller; check only at score 100
- completion threshold summary: all 32 rows score 100 or have an explicit
  defer owner; zero unclassified drift; Code Block tests/typecheck/lint,
  `check:core`, autoreview, source audits, and plan checker pass

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
- semantics: one-shot closure, no timed minimum
- initial confidence score: 0.65; the prior Boolean-query packet is green, but
  the remaining source/test owner shape is not yet fully scored
- improvement loop: compare every path with `origin/main`, inspect live owners,
  score, patch safe drift, run same-class sweeps, prove, review, rescan
- final score / loop closure: 1.00 only with all current rows closed and zero
  accepted actionable review findings

Completion threshold:
- Every current uncommitted Code Block path has a score-100 checked row
  or an explicit defer owner/proof/next action; no path is omitted.
- Safe migration drift is fixed without widening beyond the manifest and the
  smallest required Core/Plite owner.
- All related same-class matches inside the active scope are classified with
  match/patched/deferred counts.
- Code Block tests, source-first typecheck, lint, shared `check:core`, scoped
  autoreview, diff audit, and the plan checker pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-uncommitted-code-block-files.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Code Block focused specs for changed owners
- package proof: `pnpm --filter @platejs/code-block test`, direct and forced
  Turbo source-first typecheck, package lint, artifact build where meaningful
- shared Core gate: `pnpm check:core` because Code Block is already covered
- source audits: exact changed-file scans for compat APIs, casts/annotations,
  nested update calls, explicit normalization, plugin-extension wrappers,
  duplicated language-operation classifiers, and untracked/extracted files
- related scoped sweep query / active scope / match count / patched count / deferred count:
  shared language classifier / changed Code Block paths / 2 / 2 / 0;
  unsafe casts / changed Code Block paths / 130 removed / 130 / 0; canonical Lowlight
  HAST / package owner graph / 3 / 3 / 0; toggle-off behavior / transform
  proof / 1 / 1 / 0; runtime bridge / package source / 1 deleted owner / 1 / 0
- package file manifest / row count / checked count / deferred count: `git diff
  HEAD --name-only --diff-filter=ACMRTD -- packages/code-block` plus untracked
  inventory / 32 after one direct proof caller joined the manifest / 32 / 0
- Plite/Plate gap ledger: record any missing capability or N/A
- broad Core drift ledger gate: N/A, not a broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-uncommitted-code-block-files.md`

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
- allowed edit scope: the original 31 paths, direct required package proof
  callers, and this active plan;
  smallest Core/Plite owner only if a proven blocker requires it
- package/API surfaces: current Code Block Base/React plugins, helpers,
  transforms, rules, tests, and the deleted runtime-plugin spec
- docs/browser surfaces: N/A; no docs/UI route is in the uncommitted manifest
- non-goals: no repo-wide migration, rename pass, docs/app/browser changes,
  public alias, or unrelated package cleanup
- out-of-scope package errors: classify and defer unless caused by this packet

Output budget strategy:
- Keep the current manifest in this plan; inspect diffs in bounded cohorts and
  use counts/file lists before snippets. Exclude generated output and builds.
- Save dense scoring/evidence in the plan instead of streaming full diffs.

Blocked condition:
- Stop only for a public API fork, missing Plite/Plate capability, or repeated
  proof failure with no narrower autonomous diagnosis remaining.

Current verdict:
- verdict: keep the current package owners after removing duplicated React/Base
  logic, unsafe test casts, legacy Lowlight shapes, and misplaced proof
- confidence: 1.00 after file-by-file scoring and package/shared proof
- next owner: none; packet closed
- keep / revert / quarantine call: keep all reviewed live paths; hard-cut the
  obsolete runtime-bridge spec; no quarantine
- reason: every current path matches Plate/Plite ownership, preserves main
  behavior, and has direct proof or a source audit

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Literal uncommitted Code Block scope, zero-drift target, proof, and handoff recorded. |
| `plate-next` skill/rule read | yes | Full generated skill read; current source rule applied. |
| Active goal checked or created | yes | No prior goal; original 31-path closure goal created. |
| Mode classified as named packet vs broad Core sweep | yes | Changed-file package review; not broad Core. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Clean Plate product layer on Plite; main is evidence only. |
| Broad Core drift ledger initialized when in scope | no | N/A: not broad Core. |
| Source of truth and allowed workspace recorded | yes | VISION, Plate/Common detail, current checkout, origin/main, and manifest. |
| Output budget strategy recorded | yes | Bounded cohort reads and in-plan ledger. |
| Public API fork routing checked | yes | Route any real fork to plate-plan; none known yet. |
| Gap policy checked | yes | Name Plite/Plate gap instead of local workaround. |
| Related scoped sweep policy checked | yes | Corrections sweep the current manifest and smallest owner graph. |
| Review-mode rename freeze checked | yes | No rename without explicit accepted reason. |
| Package review checklist initialized when in scope | yes | 32 tracked rows after direct proof expansion; no untracked rows. |

Work Checklist:
- [x] Prompt, literal package scope, one-shot stop condition, proof, and
      handoff copied before implementation.
- [x] Classified as a changed-file Code Block package review, not broad Core.
- [x] Every target is classified `keep-in-plate` or `cut-duplicate-proof`.
- [x] No public compatibility alias, Slate shim, command fallback, or duplicate
      Plite wrapper remains in scope.
- [x] No bridge dump, unsafe cast, fake alias, or displaced plugin behavior
      remains in the current paths.
- [x] Gap ledger closed: no Plite or Plate capability gap blocks this packet.
- [x] Every correction has a scoped sweep row and zero deferred package match.
- [x] Broad Core ledger requirements are N/A for this named package packet.
- [x] The 32-row package manifest was materialized before correction closeout.
- [x] All 32 package rows score 100; none is unchecked or deferred.
- [x] No next package was started.
- [x] Code Block is already covered by `pnpm check:core`; no gate edit needed.
- [x] Direct API audit closed; the two remaining `editor.update` callbacks in
      `withInsertDataCodeBlock.ts` group multiple clipboard mutations.
- [x] Node-target, property-matcher, and Boolean-query audits closed.
- [x] Production optional reads handle absence; `{ required: true }` appears
      only in fixture assertions.
- [x] Normalization audit closed: the sole explicit call is the normalizer's
      explicit test; production relies on transaction dirty paths.
- [x] Plugin export/config inference is preserved without result casts.
- [x] The only `defineEditorExtension` match is a standalone test probe.
- [x] The forbidden runtime bridge has zero live matches; its duplicate test
      owner was deleted after colocated behavior coverage was verified.
- [x] Review matrix covers every current path and API owner.
- [x] No public API fork required `plate-plan`.
- [x] Rename freeze held; no new rename packet was introduced.
- [x] Extracted-file gate closed: zero untracked Code Block paths.
- [x] Safe corrections are kept; nothing is quarantined.
- [x] Focused package tests, typecheck, lint, build, shared Core gate, and
      autoreview passed.
- [x] `pnpm brl` is N/A because exports and barrels did not change.
- [x] Compatibility-name source audit returned zero live matches.
- [x] Changed list, top drift, needs-attention, and next owner are recorded.
- [x] Review stayed within the 32-path package manifest and this plan.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source/package/shared proof | Passed; commands recorded below. |
| Broad Core drift ledger coverage | no | Record why N/A | User scoped this to changed Code Block paths. |
| Score gate | yes | Score every current package row | 32 of 32 score 100; zero deferred. |
| Best Plate v2 recommendation | yes | Record final owner shape | Base owns behavior/cache invalidation; React owns refresh. |
| Plite/Plate gap ledger | yes | Record gaps or N/A | No missing capability. |
| Related scoped sweep after correction | yes | Sweep each correction class | Five classes swept with zero deferred match. |
| Package file checklist | yes | Reconcile manifest and rows | Expected 32, actual 32, missing 0, extra 0. |
| Package/API proof | yes | Run focused package proof | Tests, lint, typecheck, forced Turbo typecheck, and build pass. |
| Shared Core gate coverage | yes | Run shared Core proof | `pnpm check:core` includes and passed Code Block. |
| Non-Core package error triage | yes | Classify browser compile failures | Unrelated stale dist reproduced after the prescribed reinstall. |
| Source audit | yes | Scan all named drift classes | Cast, stale API, bridge, nested update, and required-read scans pass. |
| Rename ledger | no | Record why N/A | No postponed or introduced rename. |
| Extracted-file inventory | yes | Inventory untracked package paths | Zero untracked package paths. |
| Autoreview / review | yes | Review scoped final diff | Clean; no accepted/actionable finding, correctness 0.84. |
| Final lint/check | yes | Run final focused checks | Package test/typecheck/lint pass after reinstall. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; no open item. |
| Goal plan complete | yes | Run final plan checker | `[autogoal] complete` passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | 32-path manifest, VISION, origin/main, and owners read | closed |
| Review and correction | completed | Every path scored; five drift classes repaired and swept | closed |
| Verification | completed | Package/Core proof and clean autoreview; browser blocker classified | closed |
| Closeout | completed | Ledgers and handoff complete | final response |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| Base plugin, rules, input-rule proof | 100 | keep-in-plate | Base Code Block | Main parity plus cache/reset/parser specs | closed |
| Decoration cache and formatter proof | 100 | keep-in-plate | Code Block | Canonical typed Lowlight HAST and real lowlight fixtures | closed |
| Code Block transforms and specs | 100 | keep-in-plate | Code Block | Active tx/direct Plite APIs; focused behavior proof | closed |
| Base extension and specs | 100 | keep-in-plate | Code Block | Shared language classifier; Base behavior proof only | closed |
| Data/fragment/normalizer extensions and specs | 100 | keep-in-plate | Code Block | Correct block targeting, grouped tx, dirty-path normalization | closed |
| React plugin and specs | 100 | keep-in-plate | React Code Block | React-only refresh and deserialization proof | closed |
| `CodeBlockRuntimePlugin.spec.ts` | 100 | cut-duplicate-proof | deleted | Forbidden bridge absent; behavior covered by colocated 88-test suite | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Language change handling | One shared Base classifier; Base invalidates before op, React refreshes after op | Duplicated React/Base classifier or runtime bridge | Prevents semantic divergence while keeping React effects out of Base | none |
| Lowlight output | Canonical typed HAST root/element/text traversal | Local legacy `{ value }` compatibility parser and fake casted lowlight | Matches current dependency contract and preserves inference | none |
| Behavior proof | Tests colocated with owning Base/React/transform layer | Monolithic runtime-bridge spec and misplaced React proof | Ownership is visible and direct | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | None | No workaround exists in the final shape | N/A | Package/shared proof | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Duplicate language operation classifier | changed Code Block paths | `set_node` + `lang` classifier inspection | 2 | 2 | 0 | none |
| Unsafe test/source casts | changed Code Block paths | `as any|as unknown` | 130 removed | 130 | 0 | zero current matches |
| Legacy Lowlight output fixtures | decoration/formatter owner graph | fake `{ value }` roots and local structural types | 3 | 3 | 0 | canonical HAST only |
| Missing toggle-off regression | toggle transform owner | compare main behavior with current proof | 1 | 1 | 0 | toggle-on/off both covered |
| Forbidden runtime bridge proof | package source/specs | `currentRuntimeBridge|CodeBlockRuntimePlugin` | 1 deleted owner | 1 | 0 | zero live matches |

Core drift ledger:
- Applies: no
- Manifest command: N/A
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
| N/A | N/A | named package packet | N/A | broad Core not requested | N/A |

Package file checklist:
- Applies: yes, narrowed to the literal uncommitted manifest
- Package: `packages/code-block`
- Manifest command: `git diff HEAD --name-only --diff-filter=ACMRTD -- packages/code-block | sort` plus `git ls-files --others --exclude-standard packages/code-block | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 32
- Actual row count: 32
- Checked score-100 count: 32
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: all 32 rows score 100 or are explicitly deferred

Package file rows:
- [x] `packages/code-block/src/lib/BaseCodeBlockPlugin.inputRules.spec.tsx` — score: 100 — verdict: proof — owner: input rules — evidence: typed editor fixture and parser guard proof — next: closed
- [x] `packages/code-block/src/lib/BaseCodeBlockPlugin.spec.ts` — score: 100 — verdict: proof — owner: Base plugin — evidence: cache invalidation without React — next: closed
- [x] `packages/code-block/src/lib/BaseCodeBlockPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: Base plugin — evidence: Plite reads, shared classifier, optional guards — next: closed
- [x] `packages/code-block/src/lib/CodeBlockRules.ts` — score: 100 — verdict: keep-in-plate — owner: rules — evidence: tx-owned reset/insert/delete behavior — next: closed
- [x] `packages/code-block/src/lib/CodeBlockRuntimePlugin.spec.ts` — score: 100 — verdict: cut-duplicate-proof — owner: deleted — evidence: forbidden bridge gone and behavior colocated in 88 passing tests — next: closed
- [x] `packages/code-block/src/lib/formatter/formatter.spec.ts` — score: 100 — verdict: proof — owner: formatter — evidence: real typed lowlight fixture — next: closed
- [x] `packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts` — score: 100 — verdict: proof — owner: decoration cache — evidence: canonical HAST cases and error/plaintext proof — next: closed
- [x] `packages/code-block/src/lib/setCodeBlockToDecorations.ts` — score: 100 — verdict: keep-in-plate — owner: decoration cache — evidence: typed canonical HAST traversal, no compatibility parser — next: closed
- [x] `packages/code-block/src/lib/transforms/indentCodeLine.spec.tsx` — score: 100 — verdict: proof — owner: indent transform — evidence: focused suite pass — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeBlock.spec.tsx` — score: 100 — verdict: proof — owner: insert transform — evidence: typed TestEditor fixtures — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeBlock.ts` — score: 100 — verdict: keep-in-plate — owner: insert transform — evidence: direct tx ownership and main parity — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeLine.spec.tsx` — score: 100 — verdict: proof — owner: insert line — evidence: focused suite pass — next: closed
- [x] `packages/code-block/src/lib/transforms/insertEmptyCodeBlock.spec.tsx` — score: 100 — verdict: proof — owner: empty block — evidence: focused suite pass — next: closed
- [x] `packages/code-block/src/lib/transforms/insertEmptyCodeBlock.ts` — score: 100 — verdict: keep-in-plate — owner: empty block — evidence: direct Plite update and selection behavior — next: closed
- [x] `packages/code-block/src/lib/transforms/outdentCodeLine.spec.tsx` — score: 100 — verdict: proof — owner: outdent — evidence: focused suite pass — next: closed
- [x] `packages/code-block/src/lib/transforms/outdentCodeLine.ts` — score: 100 — verdict: keep-in-plate — owner: outdent — evidence: active tx and optional block target — next: closed
- [x] `packages/code-block/src/lib/transforms/setCodeBlockContent.spec.tsx` — score: 100 — verdict: proof — owner: content — evidence: typed required fixture assertion — next: closed
- [x] `packages/code-block/src/lib/transforms/setCodeBlockContent.ts` — score: 100 — verdict: keep-in-plate — owner: content — evidence: direct update and optional live read — next: closed
- [x] `packages/code-block/src/lib/transforms/toggleCodeBlock.spec.tsx` — score: 100 — verdict: proof — owner: toggle — evidence: toggle-on and toggle-off regressions — next: closed
- [x] `packages/code-block/src/lib/transforms/toggleCodeBlock.ts` — score: 100 — verdict: keep-in-plate — owner: toggle — evidence: direct Plite targets and unwrap behavior — next: closed
- [x] `packages/code-block/src/lib/transforms/unwrapCodeBlock.spec.tsx` — score: 100 — verdict: proof — owner: unwrap — evidence: focused suite pass — next: closed
- [x] `packages/code-block/src/lib/transforms/unwrapCodeBlock.ts` — score: 100 — verdict: keep-in-plate — owner: unwrap — evidence: transaction-owned node movement — next: closed
- [x] `packages/code-block/src/lib/withCodeBlock.spec.tsx` — score: 100 — verdict: proof — owner: Base extension — evidence: Base-only operation behavior — next: closed
- [x] `packages/code-block/src/lib/withCodeBlock.ts` — score: 100 — verdict: keep-in-plate — owner: Base extension — evidence: shared typed language classifier and tx middleware — next: closed
- [x] `packages/code-block/src/lib/withInsertDataCodeBlock.spec.tsx` — score: 100 — verdict: proof — owner: data extension — evidence: parser/current-block/mixed selection cases — next: closed
- [x] `packages/code-block/src/lib/withInsertDataCodeBlock.ts` — score: 100 — verdict: keep-in-plate — owner: data extension — evidence: grouped clipboard updates and block semantics — next: closed
- [x] `packages/code-block/src/lib/withInsertFragmentCodeBlock.spec.tsx` — score: 100 — verdict: proof — owner: fragment extension — evidence: current block and mixed fragment cases — next: closed
- [x] `packages/code-block/src/lib/withInsertFragmentCodeBlock.ts` — score: 100 — verdict: keep-in-plate — owner: fragment extension — evidence: live target semantics and active tx — next: closed
- [x] `packages/code-block/src/lib/withNormalizeCodeBlock.spec.tsx` — score: 100 — verdict: proof — owner: normalizer — evidence: explicit normalizer fixture only — next: closed
- [x] `packages/code-block/src/lib/withNormalizeCodeBlock.tsx` — score: 100 — verdict: keep-in-plate — owner: normalizer — evidence: dirty-path normalization and optional reads — next: closed
- [x] `packages/code-block/src/react/CodeBlockPlugin.spec.tsx` — score: 100 — verdict: proof — owner: React plugin — evidence: React refresh/deserialization with real DataTransfer — next: closed
- [x] `packages/code-block/src/react/CodeBlockPlugin.tsx` — score: 100 — verdict: keep-in-plate — owner: React plugin — evidence: React-only refresh over shared Base classifier — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Base/React language handling | Code Block | duplicated classifier and misplaced proof | Base/React source and specs | share classifier; colocate effects proof | closed |
| Lowlight decorations | Code Block | legacy structural parser and fake fixtures | decoration/formatter source and specs | canonical typed HAST | closed |
| Transform/clipboard/normalizer migration | Code Block | target and tx drift risk | transform/extension source and specs | direct Plite ownership with grouped tx only where needed | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| none | N/A | all 31 original paths exist on `origin/main` except the branch-only deleted bridge spec | zero untracked files | manifest proof |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| www Code Block demo | stale built exports in unrelated table/link/resizable/toc packages | package tests and shared gate prove this packet; the prescribed reinstall and retry reproduced the blocker | environment only; no Code Block source edit |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| none | none | scoped sweeps found no outside owner requiring edits | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | shared language classifier; typed HAST decorations; Plite read/update/target cleanup |
| tests/proof | Base/React ownership split, real DataTransfer/lowlight fixtures, toggle-off regression |
| docs/templates/skills | this goal plan only |
| reverted/quarantined packets | obsolete runtime-bridge spec deleted; no quarantine |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | no user decision remains | N/A | 32/32 score 100 | keep packet as reviewed |

Findings:
- React and Base duplicated the exact language-change classifier; one shared
  typed helper now drives pre-op cache invalidation and post-op React refresh.
- Decoration parsing preserved a legacy Lowlight output shape and tests faked
  that contract; source and proof now use canonical typed HAST.
- The deleted runtime bridge spec was a duplicate legacy proof owner; current
  Base/React/transform specs retain its relevant behaviors.
- No Plite/Plate capability gap or public API fork remains.

Decisions and tradeoffs:
- Keep Code Block product behavior in Plate and editor mechanics on Plite APIs.
- Keep the two grouped clipboard transaction callbacks; splitting them would
  lose atomicity and shared state.
- Keep the standalone `defineEditorExtension` test probe; it is not a plugin
  extension wrapper.
- Skip barrels because no export surface changed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| React deserialization fixture omitted `text/plain` | 1 | use the package's typed `createDataTransfer` helper | fixed; tests pass |
| Formatter proof returned legacy `{ value }` output | 1 | use a real `createLowlight(common)` instance | fixed; tests pass |
| First source-audit shell joined file names into one path | 1 | scan the package tree and rerun changed-path queries with NUL-safe input | fixed; valid audit recorded |
| Browser demo hit stale unrelated workspace exports | 2 | ran the repo-prescribed reinstall once, then retried the exact route | still blocked outside Code Block; no source edit |

Verification evidence:
- `pnpm --filter @platejs/code-block test`: 88 pass, 0 fail.
- `pnpm --filter @platejs/code-block typecheck`: pass.
- `pnpm turbo typecheck --filter=./packages/code-block --force`: 12/12 pass.
- `pnpm --filter @platejs/code-block lint:fix`: pass.
- `pnpm --filter @platejs/code-block build`: pass.
- `pnpm check:core`: pass under autoreview.
- Autoreview: clean, no accepted/actionable findings, correctness 0.84.
- `git diff --check -- packages/code-block`: pass.
- Browser `/blocks/code-block-demo`: blocked before and after the prescribed
  reinstall by unrelated stale `table`, `link`, `resizable`, and `toc` dist
  exports; no Code Block error was reached.
- Changed-path audits: zero unsafe casts, stale APIs, bridge names, nested
  updates, and production required reads; sole explicit normalize is its test.

Final handoff contract:
- target surface and mode: original 31 uncommitted Code Block paths plus one
  direct formatter proof caller; changed-file package review
- files/APIs reviewed: 32/32 current paths; Base/React plugins, rules,
  decorations, transforms, clipboard/fragment/normalizer extensions and proof
- broad Core drift score coverage: N/A; named package packet
- package file checklist coverage: 32 checked at 100, zero deferred/missing/extra
- best Plate v2 recommendation: keep clean Plate product owners over direct
  Plite APIs; share operation classification; isolate React effects
- verdict matrix summary: six live owner groups kept, one duplicate proof cut
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: five rows
  above; every current match classified, zero deferred
- out-of-scope matches discovered: none requiring source changes
- changes made: language classifier sharing, typed HAST cleanup, proof
  ownership/cast cleanup, toggle-off regression, runtime bridge proof hard-cut
- tests/proof commands: package test/typecheck/forced typecheck/lint/build,
  `check:core`, autoreview, audits, diff check, browser attempt
- old compatibility names audited: zero bridge/stale API matches
- needs attention: none
- next best Plate Next packet: none; await user direction

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure |
| Where am I going? | Goal completion |
| What is the goal? | Zero drift across all current Code Block paths |
| What have I learned? | See Findings |
| What have I done? | Scored 32 paths, fixed drift, proved, reviewed |

Timeline:
- 2026-07-10T21:30:56.039Z Goal plan created.
- 2026-07-10 Code Block source/spec owners reviewed against `origin/main`.
- 2026-07-10 Language, HAST, test ownership, casts, and toggle proof repaired.
- 2026-07-10 Package/shared proof and clean autoreview completed.

Open risks:
- Browser demo proof is blocked by unrelated stale workspace package `dist`
  exports even after the one prescribed dependency reset. The Code Block
  behavior itself has direct package and shared-Core automated coverage.
