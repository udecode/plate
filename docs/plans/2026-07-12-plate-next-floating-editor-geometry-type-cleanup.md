# plate-next floating editor geometry type cleanup

Objective:
Remove the fake floating geometry editor types; done when real DOM editor
typing compiles and floating tests, lint, build, sweep, and review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-12-plate-next-floating-editor-geometry-type-cleanup.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user rejected the exported `BoundingClientRectEditor` local
  structural intersection and requested repair
- mode: named file/API packet
- target surface: `packages/floating/src/utils/getBoundingClientRect.ts` and
  its smallest caller/test graph
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes; audit local editor subset
  types and both rejected type names inside `packages/floating/src`
- package review mode: no; the user named one exported API shape, not the full
  floating package
- package review target: N/A: named API packet
- package file checklist gate: N/A: named API packet
- completion threshold summary: fake types removed, helpers typed with the
  Plite DOM owner contract, tests use real editors, and focused proof is green

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
- semantics: N/A: no timed request
- initial confidence score: N/A: binary source and proof threshold
- improvement loop: fix accepted autoreview findings and rerun proof
- final score / loop closure: complete only at zero accepted findings

Completion threshold:
- `BoundingClientRectEditor` and `DOMRangeEditor` have zero source matches in
  `packages/floating/src`; geometry helpers accept `DOMCapableEditor`; tests
  use real Plate editors without fake structural editor aliases; floating
  typecheck, tests, build, scoped lint, source sweep, and autoreview pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-floating-editor-geometry-type-cleanup.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: floating geometry specs and package lint
- package proof: floating typecheck, tests, and build
- shared Core gate: N/A: floating is a product UI package, not Core-adjacent
- source audits: exact rejected type names and local structural editor types
- related scoped sweep query / active scope / match count / patched count / deferred count:
  `rg -n "BoundingClientRectEditor|DOMRangeEditor|export type ...Editor =|satisfies ...Editor" packages/floating/src`; 0 remaining matches, 8 files patched, 0 deferred in scope
- package file manifest / row count / checked count / deferred count: N/A:
  named API packet
- Plite/Plate gap ledger: expected none; `DOMCapableEditor` already exists
- broad Core drift ledger gate: N/A: not a broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-floating-editor-geometry-type-cleanup.md`

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
- allowed edit scope: `packages/floating/src/utils` production callers and
  their tests; the active goal plan
- package/API surfaces: remove uncommitted fake exported editor types and use
  `@platejs/plite-dom`'s `DOMCapableEditor`
- docs/browser surfaces: N/A: type/source-shape cleanup with package tests;
  package review policy excludes app/browser proof
- non-goals: no full floating package review, no repo-wide editor type sweep,
  no renames, no unrelated package edits
- out-of-scope package errors: report only; do not repair unless caused by this
  packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Applied: exact utility/test reads, scoped `rg`, and capped package commands;
  generated trees and unrelated packages excluded.

Blocked condition:
- Stop only if the real DOM editor contract cannot accept Plate editors or the
  focused proof exposes a missing Plite DOM owner API that cannot be fixed
  within the named packet.

Current verdict:
- verdict: hard-cut fake local editor types; use existing Plite DOM contract
- confidence: 95 before proof
- next owner: plate-next
- keep / revert / quarantine call: keep if all focused gates pass
- reason: local structural aliases duplicate and weaken the real editor owner

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Repair the rejected exported intersection; no duration or broader scope requested |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md` completely |
| Active goal checked or created | yes | No goal existed; created this plan-backed goal |
| Mode classified as named packet vs broad Core sweep | yes | Named floating editor geometry API packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Reuse `DOMCapableEditor`; do not preserve fake aliases |
| Broad Core drift ledger initialized when in scope | no | N/A: no broad Core sweep |
| Source of truth and allowed workspace recorded | yes | User prompt, target source/tests, `origin/main`, VISION files; cwd `/Users/zbeyens/git/plate-2` |
| Output budget strategy recorded | yes | Targeted `sed`/`rg`, capped package commands, no generated trees |
| Public API fork routing checked | yes | No design fork: existing `DOMCapableEditor` is the settled owner |
| Gap policy checked | yes | No gap found; existing Plite DOM capability covers the helper |
| Related scoped sweep policy checked | yes | Sweep `packages/floating/src` for rejected aliases and local editor subset types |
| Review-mode rename freeze checked | yes | No names or paths renamed |
| Package review checklist initialized when in scope | no | N/A: named API packet, not package review |

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
| Named verification threshold | yes | Run the proof commands named in this plan | Floating lint, typecheck, 25 tests, build, source sweep, and autoreview pass |
| Broad Core drift ledger coverage | no | N/A | Named floating API packet; no Core sweep |
| Score gate | yes | Prove inspected rows are owner-correct | All four API/helper rows and four spec rows score 100 after proof |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Use generic `DOMCapableEditor`; hard-cut fake subset aliases and fake fixtures |
| Plite/Plate gap ledger | no | N/A | Existing Plite DOM capability covers the surface |
| Related scoped sweep after correction | yes | Search same-class types inside active scope | 0 rejected alias/local structural editor matches remain |
| Package file checklist | no | N/A | Named API packet, not package review |
| Package/API proof | yes | Run focused typecheck/test/build | All three commands pass in `/Users/zbeyens/git/plate-2` |
| Shared Core gate coverage | no | N/A | Floating is a product UI package and this packet changes no Core contract |
| Non-Core package error triage | no | N/A | No out-of-scope proof failures occurred |
| Source audit | yes | Audit removed branch-only compatibility names | `BoundingClientRectEditor|DOMRangeEditor` has 0 matches in `packages/floating/src` |
| Rename ledger | no | N/A | No rename proposed or applied |
| Extracted-file inventory | yes | Inventory untracked files in target scope | 0 untracked files in `packages/floating/src/utils`; one existing hook spec is outside scope |
| Autoreview / review | yes | Run frozen-scope local review | Codex autoreview clean, 0 accepted/actionable findings, confidence 0.86 |
| Final lint/check | yes | Run scoped lint/check | `pnpm --filter @platejs/floating lint:fix` passes |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; no unresolved attention row |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-floating-editor-geometry-type-cleanup.md` | Pass: `[autogoal] complete` |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `getBoundingClientRect.ts` | 0 | hard-cut / keep-in-plate | Floating over Plite DOM | Fake types removed; real capability + mounted specs; proof green | closed at 100 |
| `getRangeBoundingClientRect.ts` | 0 | keep-in-plate | Floating over Plite DOM | Generic real capability and mounted range proof | closed at 100 |
| `getSelectionBoundingClientRect.ts` | 0 | keep-in-plate | Floating over Plite DOM | Real selection read and DOM capability; proof green | closed at 100 |
| `createVirtualRef.ts` | 0 | keep-in-plate | Floating | Preserves editor inference and fallback behavior | closed at 100 |
| four geometry specs | 0 | main-parity-cleanup | Floating tests | Real `createPlateEditor` + mounted `PlateTest`; no fake editor casts/types | closed at 100 |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Floating geometry editor parameter | `DOMCapableEditor<V, TExtensions>` on each exported helper | Local structural editor aliases, `Pick<DOMApi>`, `any`, fake partial fixtures | Plite DOM owns the capability and generics preserve concrete editor inference | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | Existing `DOMCapableEditor` already expresses the installed capability | `@platejs/plite-dom` | floating typecheck and real-editor specs | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Remove fake geometry editor types | `packages/floating/src` | `rg -n "BoundingClientRectEditor|DOMRangeEditor|export type ...Editor =|satisfies ...Editor"` | 0 remaining | 8 files | 0 | none in scope |

Core drift ledger:
- Applies: no; named floating API packet
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
| N/A | 0 | not in scope | Core | User named floating geometry type | none |

Package file checklist:
- Applies: no; named API packet
- Package: `@platejs/floating`
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
- Next package blocked until: N/A: no package review was started

Package file rows:
- [x] N/A: named API packet; inspected files are recorded in the review matrix.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Floating geometry editor typing | Floating / Plite DOM | Exported local subset aliases duplicate the real DOM editor contract | four helpers, four specs, focused package proof | keep repaired packet | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| No untracked file in `packages/floating/src/utils` | N/A | target owner paths exist on `origin/main` | no extracted-file action | `git ls-files --others --exclude-standard packages/floating/src/utils` returned 0 |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none | all scoped commands passed | none |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Untracked `packages/floating/src/hooks/useFloatingToolbar.spec.tsx` | Floating toolbar hook | Existing unrelated test outside named geometry API graph | leave to its active owner |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | four geometry helpers use generic `DOMCapableEditor`; fake aliases deleted |
| tests/proof | four specs use real mounted Plate editors; package proof and review green |
| docs/templates/skills | this active goal plan only |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | none | packet is closed | N/A | no action |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Owner/source review | complete | Existing `DOMCapableEditor` owns the capability; fake local aliases identified | implement |
| Implementation and focused proof | complete | 8 files repaired; lint, typecheck, 25 tests, and build pass | sweep/review |
| Scoped sweep and autoreview | complete | 0 rejected type matches; 0 actionable review findings | mechanical closeout |
| Goal closure | complete | All evidence and handoff rows resolved | run final checker |

Findings:
- `BoundingClientRectEditor` intersected a second fake `read` surface onto a
  local DOM subset even though Plite DOM already exports `DOMCapableEditor`.
- `DOMCapableEditor` must be carried generically so concrete Plate value and
  extension inference remains assignable.
- `editor.api` is a read snapshot, so mutation-based API mocks are dishonest;
  mounted `PlateTest` editors exercise the real DOM mapping path.
- `origin/main` never exposed the two rejected aliases. The existing
  `.changeset/floating-v54-runtime.md` already covers the actual floating v54
  delta; no branch-only removal changeset is warranted.

Decisions and tradeoffs:
- Hard-cut both local aliases -> use the Plite DOM owner directly -> exported
  helpers gain generic boilerplate but preserve exact editor inference.
- Mount real Plate editors in geometry specs -> slightly slower tests -> avoids
  casts, fake fixtures, and mutation of read snapshots.
- Browser proof N/A -> package-local DOM/model behavior is fully observable in
  mounted jsdom specs and package-review policy excludes app routes.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Bare `DOMCapableEditor` default rejected concrete Plate values | 1 | Preserve `V` and `TExtensions` on each helper | Typecheck passes |
| Spying on `editor.api.dom` and imported static DOM owner did not affect the live read snapshot/module instance | 2 | Mount `PlateTest` and stub only jsdom layout geometry | 25 tests pass |

Verification evidence:
- `pnpm --filter @platejs/floating lint:fix` -> pass, 27 files checked.
- `pnpm turbo typecheck --filter=./packages/floating` -> pass, 10/10 tasks.
- `pnpm --filter @platejs/floating test` -> pass, 25 tests, 48 assertions.
- `pnpm --filter @platejs/floating build` -> pass.
- Scoped alias/local-editor-type sweep -> 0 remaining rejected matches.
- `.agents/skills/autoreview/scripts/autoreview --mode local --prompt <frozen scope>`
  -> clean, 0 accepted/actionable findings, overall confidence 0.86.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-floating-editor-geometry-type-cleanup.md`
  -> pass: `[autogoal] complete`.
- Changeset baseline audit -> rejected aliases absent from `origin/main`;
  existing `.changeset/floating-v54-runtime.md` covers the package delta.
- `pnpm brl` N/A: no file/export barrel changed; star barrel remains correct.
- App Browser N/A: no route/UI surface changed; mounted DOM specs own proof.

Final handoff contract:
- target surface and mode: named floating geometry editor API packet
- files/APIs reviewed: four helpers and four same-owner specs
- broad Core drift score coverage: N/A: no Core sweep
- package file checklist coverage: N/A: no package review
- best Plate v2 recommendation: generic `DOMCapableEditor`, no local subset
- verdict matrix summary: one hard-cut and eight score-100 inspected rows
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: rejected
  alias/local editor type query in `packages/floating/src`; 0 remaining, 8
  patched files, 0 deferred in scope
- out-of-scope matches discovered: existing untracked toolbar hook spec only
- changes made: fake types removed; real-editor generic typing/tests installed
- tests/proof commands: lint, typecheck, 25 tests, build, source audit,
  autoreview all pass
- old compatibility names audited: `BoundingClientRectEditor` and
  `DOMRangeEditor`, 0 remaining
- needs attention: none
- next best Plate Next packet: return to the prior package sequence; do not
  widen this correction into another package automatically

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final mechanical closure |
| Where am I going? | Complete this bounded goal after checker pass |
| What is the goal? | Remove fake floating geometry editor types and prove the real owner shape |
| What have I learned? | Real editor inference needs generic propagation; read snapshots are not mock mutation points |
| What have I done? | Repaired 8 files and closed all focused proof/review gates |

Timeline:
- 2026-07-12T09:43:10.677Z Goal plan created.
- 2026-07-12 target source, `origin/main`, VISION, Plite DOM owner, and caller
  graph reviewed; named API mode fixed.
- 2026-07-12 fake aliases removed and helper signatures migrated to generic
  `DOMCapableEditor`.
- 2026-07-12 fake fixtures replaced with mounted real-editor DOM specs.
- 2026-07-12 lint, typecheck, 25 tests, build, source audit, changeset baseline
  audit, and frozen-scope autoreview passed.

Open risks:
- None in the named packet.
