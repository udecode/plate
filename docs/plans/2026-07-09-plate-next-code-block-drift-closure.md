# plate-next code-block drift closure

Objective:
Review every Code Block package file against `origin/main`, repair all
Plite-migration drift without compatibility hacks, and close only when every
file scores 100 and package plus shared Core proof is green.

Goal plan:
docs/plans/2026-07-09-plate-next-code-block-drift-closure.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user requested “review code-block has no drift then fix”
- mode: package review, one-shot execution
- target surface: `packages/code-block`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, Code Block plus smallest
  Plite/Core blocker owner only
- package review mode: yes
- package review target: `packages/code-block`
- package file checklist gate: 60 tracked rows; every row must reach score 100
- completion threshold summary: all 60 rows checked at 100, no unresolved
  behavior/type/owner drift, package typecheck/test/build green, package added
  to `check:core`, shared gate green, scoped autoreview clean

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

Phase / pass table:
| Phase | Status | Notes |
|-------|--------|-------|
| Capture package manifest and origin/main evidence | completed | 60 tracked rows, zero untracked |
| Repair behavior, type, and owner drift | completed | Select All and explicit fragment-target regressions fixed; duplicate proof deleted |
| Run package and shared proof | completed | 86 tests, typecheck, lint, build, and `check:core` green |
| Run scoped autoreview and close ledger | completed | Final review clean; 60/60 rows score 100 |

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: 0.65 before file-by-file audit
- improvement loop: compare every row, patch drift, rerun focused proof
- final score / loop closure: 1.00 per file or remain unchecked

Completion threshold:
- Every tracked Code Block file has one checked score-100 row after comparison
  with `origin/main`; no untracked row is unclassified.
- All changed behavior/type files preserve main-owned behavior while using
  Plite-native APIs with no wrappers, casts, nested updates, or inference loss.
- Code Block typecheck, test, build, lint, and `pnpm check:core` pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-09-plate-next-code-block-drift-closure.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: focused Code Block specs chosen from each repaired
  behavior owner
- package proof: Code Block typecheck, test, build, and lint
- shared Core gate: add Code Block to `tooling/scripts/check-core.mjs`, then
  run `pnpm check:core`
- source audits: old Plate/Slate APIs, explicit inference cheats, nested
  updates, required public reads, and owner/file drift
- related scoped sweep query / active scope / match count / patched count / deferred count:
  five scoped sweeps recorded below; 2 behavior findings patched, 1 duplicate
  proof file deleted, 0 deferred
- package file manifest / row count / checked count / deferred count:
  `git ls-files packages/code-block | sort`; 60 / 60 / 0 final
- Plite/Plate gap ledger: fill only when a clean package migration needs a
  missing owner primitive
- broad Core drift ledger gate: N/A; package review mode
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-09-plate-next-code-block-drift-closure.md`

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
- Optional public-read law: Plate feature-package source handles unresolved
  Plite reads with an early return/no-op. `{ required: true }` is reserved for
  Plite internals with a proven runtime invariant; fixture assertions are the
  test-only exception.
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
- allowed edit scope: `packages/code-block/**`,
  `tooling/scripts/check-core.mjs`, and the smallest Plite/Core owner only if
  a proven blocker requires it
- package/API surfaces: Code Block plugins, rules, queries, transforms,
  deserializer, formatter, React extension, tests, exports, and metadata
- docs/browser surfaces: out of scope
- non-goals: other package migration, docs/apps/www, naming cleanup, compat
  aliases, broad Plite/Core redesign
- out-of-scope package errors: record and route; do not patch

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only for a public API fork requiring user review or a repeated owner
  failure that cannot be repaired inside Code Block plus its smallest
  Plite/Core blocker.

Current verdict:
- verdict: complete; no known Code Block drift remains
- confidence: 1.00 against the declared package-review proof surface
- next owner: user review or next package through `plate-next`
- keep / revert / quarantine call: keep repaired package; delete duplicated
  runtime spec; revert failed generic-fragment delegation experiment
- reason: every tracked row is closed at 100, both autoreview findings are
  repaired with regressions, and package plus shared gates are green

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact Code Block review/fix target copied above. |
| `plate-next` skill/rule read | yes | User supplied generated skill; source rule governs it. |
| Active goal checked or created | yes | Goal created for 60-row score-100 closure. |
| Mode classified as named packet vs broad Core sweep | yes | Package review mode, not broad Core. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Recorded above. |
| Broad Core drift ledger initialized when in scope | no | N/A: one package. |
| Source of truth and allowed workspace recorded | yes | Current checkout plus `origin/main` evidence. |
| Output budget strategy recorded | yes | Manifest ledger and grouped diffs. |
| Public API fork routing checked | yes | Route only if audit finds a real fork. |
| Gap policy checked | yes | Smallest Plite/Core owner only. |
| Related scoped sweep policy checked | yes | Code Block scope plus blocker owner. |
| Review-mode rename freeze checked | yes | No rename pass requested. |
| Package review checklist initialized when in scope | yes | 60 tracked rows, zero untracked. |

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
- [x] Optional public-read audit closed: feature-package production code does
      not use `{ required: true }` or non-null assertions to hide unresolved
      Plite reads; each match handles `undefined` or records a Plite-internal
      invariant reason.
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
| Named verification threshold | yes | Run the proof commands named in this plan | 86 Code Block tests, source typecheck, lint, artifact build, and `check:core` pass |
| Broad Core drift ledger coverage | no | N/A: named package review | Broad Core sweep was explicitly out of scope |
| Score gate | yes | Close every package row at 100 | 60/60 rows checked; 0 deferred |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Matrix below |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No owner gap remains |
| Related scoped sweep after correction | yes | Record each same-class package sweep | Five rows below |
| Package file checklist | yes | Record counts and per-file proof | 60 expected, 60 actual, 60 checked, 0 missing/extra/deferred |
| Package/API proof | yes | Run package gates | All green |
| Shared Core gate coverage | yes | Add Code Block to `check:core` | `tooling/scripts/check-core.mjs` covers typecheck, lint, and tests |
| Non-Core package error triage | no | Record N/A | No out-of-scope package failure occurred |
| Source audit | yes | Audit removed compatibility and inference smells | No actionable old API or newly added `any` matches |
| Rename ledger | no | N/A: no rename proposed | Current HEAD owners retained |
| Extracted-file inventory | yes | Classify all extracted files | One duplicate spec deleted; zero untracked remain |
| Autoreview / review | yes | Run scoped review until clean | Two P2 findings fixed; final autoreview clean |
| Final lint/check | yes | Run scoped lint/check | Package lint and `check:core` pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run `check-complete.mjs` | Run after this ledger is saved |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `BaseCodeBlockPlugin` / `withCodeBlock` | 5 | repaired-in-plate | Code Block | Restored shortcut routing, second-press Select All fallback, reset/tab/delete behavior; focused and package tests green | closed |
| `withInsertFragmentCodeBlock` | 5 | repaired-in-plate | Code Block | Explicit target resolution plus forward point ref; both target directions covered | closed |
| queries/transforms/rules/decorations | 3 | keep-migrated | Code Block | Main-owned algorithms retained in original owners with Plite-native reads/tx | closed |
| package metadata/config/barrels | 2 | keep | Code Block | Direct package deps, artifact build, lint, and source audit green | closed |
| `CodeBlockRuntimePlugin.spec.ts` | 4 | delete-duplicate | Code Block tests | No main owner; duplicated distributed specs; three unique contracts moved before deletion | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Code Block package | Keep product behavior in original Code Block owners; expose typed plugin tx; use Plite reads and active tx; keep structural multi-line paste package-owned | `overrideEditor`, `editor.tf`, flat API aliases, displaced runtime bridge, generic fragment semantics change | Preserves main behavior without compatibility code or a substrate-specific Code Block exception | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No missing capability remains | Plite already supplies tx shortcuts, refs, explicit targets, and direct reads/updates | Code Block owns composition | Package and shared gates | closed without Plite/Core change |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| duplicate runtime spec | `packages/code-block` | origin/main path inventory plus test-title/expect parity | 1 file | 1 deleted; 3 unique rows moved | 0 | none |
| helper-owner drift | `packages/code-block/src/lib` | file-by-file diff against `origin/main` | 46 modified package files | owner logic recovered throughout active diff | 0 | none found by final review |
| Select All fallback | plugin + extension + spec | `rg -n "selectAll" packages/code-block` | 4 owner/proof references | 2 files | 0 | final autoreview clean |
| explicit fragment targets | fragment middleware + spec | inspect `options.at`, active tx, and both selection/target directions | 2 files | 2 files | 0 | 5 fragment tests green |
| compatibility/type smells | full package diff | old root APIs, wrappers, required public reads, and newly added `any` audit | 0 actionable | 0 | 0 | baseline external adapter `any` and fixture-only `required: true` remain valid |

Core drift ledger:
- Applies: no; this is package review mode
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
| N/A | N/A | package-review scope | N/A | Broad Core sweep not requested | N/A |

Package file checklist:
- Applies: yes
- Package: `packages/code-block`
- Manifest command: `git ls-files packages/code-block | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 60
- Actual row count: 60
- Checked score-100 count: 60
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: cleared; all 60 rows score 100 and package/shared
  proof is green

Package file rows:
- [x] `packages/code-block/.npmignore` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/CHANGELOG.md` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/README.md` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/package.json` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/index.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/BaseCodeBlockPlugin.inputRules.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/BaseCodeBlockPlugin.spec.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/BaseCodeBlockPlugin.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/CodeBlockRules.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/CodeBlockRuntimePlugin.spec.ts` — score: 100 — verdict: delete-duplicate — owner: Code Block tests — evidence: absent from `origin/main`; duplicated distributed owner specs; three unique contracts moved before deletion; 86 tests and shared gates green — next: closed
- [x] `packages/code-block/src/lib/deserializer/htmlDeserializerCodeBlock.spec.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/deserializer/htmlDeserializerCodeBlock.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/deserializer/index.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/ensureStablePythonGrammar.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/formatter/formatter.spec.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/formatter/formatter.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/formatter/index.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/formatter/jsonFormatter.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/formatter/jsonFormatter.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/index.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/queries/getCodeLineEntry.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/queries/getIndentDepth.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/queries/index.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/queries/isCodeBlockEmpty.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/queries/isCodeBlockEmpty.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/queries/isSelectionAtCodeBlockStart.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/queries/isSelectionAtCodeBlockStart.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/setCodeBlockToDecorations.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/deleteStartSpace.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/indentCodeLine.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/indentCodeLine.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/index.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeBlock.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeBlock.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeLine.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeLine.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/insertEmptyCodeBlock.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/insertEmptyCodeBlock.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/outdentCodeLine.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/outdentCodeLine.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/setCodeBlockContent.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/setCodeBlockContent.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/toggleCodeBlock.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/toggleCodeBlock.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/unwrapCodeBlock.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/transforms/unwrapCodeBlock.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/withCodeBlock.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/withCodeBlock.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/withInsertDataCodeBlock.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/withInsertDataCodeBlock.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/withInsertFragmentCodeBlock.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/withInsertFragmentCodeBlock.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/withNormalizeCodeBlock.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/lib/withNormalizeCodeBlock.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/react/CodeBlockPlugin.spec.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/react/CodeBlockPlugin.tsx` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/src/react/index.ts` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/tsconfig.build.json` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed
- [x] `packages/code-block/tsconfig.json` — score: 100 — verdict: keep/repaired — owner: Code Block — evidence: file-by-file `origin/main` review; 86 tests, typecheck, lint, build, `check:core`, and scoped autoreview green — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| owner recovery | Code Block | Logic had moved from original helper owners into a duplicate runtime test/extension shape | `withCodeBlock`, transforms, queries, specs | keep repaired original owners | closed |
| duplicate proof | Code Block tests | One 683-line runtime spec duplicated owner tests | runtime spec plus test-title/expect audit | delete duplicate after moving three unique contracts | closed |
| Select All | Code Block shortcut/tx | Migration lost main's second-press fallback and shortcut registration | plugin, extension, spec | keep repaired | closed |
| explicit fragment target | Code Block fragment middleware | Converted lines could use current selection instead of `options.at` | middleware and spec | keep forward-ref target fix | closed |
| shared gate | Core tooling | Code Block was absent from durable Core-adjacent proof | `check-core.mjs` | keep package typecheck/lint/test rows | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/code-block/src/lib/CodeBlockRuntimePlugin.spec.ts` | delete-duplicate | no `origin/main` owner | delete after moving three unique cases to existing owners | 60 tracked / 59 present / 1 intentional deletion / 0 untracked; 86 tests green |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | No out-of-scope package failures | All invoked gates passed | N/A |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| none actionable | none | Scope remained Code Block plus `check:core` tooling | next package chosen by user |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Recovered original helper ownership; Plite-native reads/tx; restored Select All shortcut/fallback; fixed explicit fragment targets; preserved formatter, paste, normalization, indentation, reset, and decoration behavior |
| tests/proof | 86 tests across 21 files; added leading-whitespace split, collapsed-cursor tab, non-React language update, Select All fallback, and two explicit-target fragment contracts; Code Block added to `check:core` |
| docs/templates/skills | Updated only this autogoal ledger; product docs and skills remained out of scope |
| reverted/quarantined packets | Deleted duplicated runtime spec; reverted generic multi-line fragment delegation after tests proved it ejects later lines from the wrapper |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | No decision required | Package/API shape is closed under the accepted Plate Next rules | 60-row ledger | Move to the next package when ready |

Findings:
- Fixed: Code Block lacked `mod+a` routing and did not fall through after the
  whole block was selected.
- Fixed: explicit fragment insertion targets could be ignored or split across
  the target and current selection.
- Fixed: duplicated runtime proof obscured original test ownership.

Decisions and tradeoffs:
- Keep Code Block-specific multi-line fragment composition in the package;
  changing Plite's generic fragment semantics would be a broader and wrong fix.
- Use a forward point ref only for explicit targets; implicit insertion keeps
  Plite selection advancement.
- Keep main-owned helper names and files; migrate their internals instead of
  introducing migration-only owner churn.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Focused raw `bun test` skipped root preload, so existing global `mock()` calls failed | 1 | Use package-owned `pnpm --filter @platejs/code-block test` | Package suite green |
| Concurrent typecheck/build raced shared Plite `dist` output and produced false missing exports | 1 | Run artifact-facing gates sequentially | Typecheck and build green |
| Delegating converted multi-line fragments to generic Plite insertion ejected later lines from the code block | 1 | Preserve package composition and propagate a ref-backed explicit target | Five fragment tests green |

Verification evidence:
- `pnpm --filter @platejs/code-block test` — 86 pass, 0 fail, 137 expects,
  21 files.
- `pnpm turbo typecheck --filter=./packages/code-block` — pass.
- `pnpm --filter @platejs/code-block lint` — pass, 56 files.
- `pnpm --filter @platejs/code-block build` — pass.
- `pnpm check:core` — pass, including 9 package typechecks, all package lints,
  725 Core tests, full Plite/Core-adjacent tests, and 86 Code Block tests.
- `git diff --check origin/main -- packages/code-block tooling/scripts/check-core.mjs`
  — pass.
- Newly added `any` diff audit — zero matches.
- Final scoped `autoreview` — clean, no actionable findings.
- `pnpm brl` — N/A; no barrel/export owner changed.
- Browser proof — N/A by declared package-review scope; no `apps/www` or docs
  lane was touched.

Final handoff contract:
- target surface and mode: `packages/code-block`, package-by-package Plate Next
  review.
- files/APIs reviewed: all 60 tracked rows, including package metadata,
  plugins, rules, queries, transforms, paste/deserialization, formatting,
  React extension, specs, and configs.
- broad Core drift score coverage: N/A; broad Core sweep was not requested.
- package file checklist coverage: 60/60 score 100; 0 missing, extra, or
  deferred.
- best Plate v2 recommendation: keep product composition in Code Block over
  Plite primitives; no compatibility wrappers or substrate exception.
- verdict matrix summary: 59 kept/repaired files and 1 duplicate deletion.
- Plite/Plate gaps or blockers: none.
- related scoped sweep query/active scope/matches/patched/deferred: five sweeps,
  two behavior findings fixed, one duplicate deleted, zero deferred.
- out-of-scope matches discovered: none actionable.
- changes made: listed above.
- tests/proof commands: all listed verification evidence passed.
- old compatibility names audited: no actionable old root APIs, wrappers,
  newly added `any`, or production `required: true` remains.
- needs attention: none.
- next best Plate Next packet: user-selected next package.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Code Block closure complete |
| Where am I going? | Awaiting the next package |
| What is the goal? | Preserve all Code Block behavior while finishing the Plite-native migration |
| What have I learned? | Shortcut fallback and explicit fragment targets were the last concrete regressions |
| What have I done? | Closed 60 rows, fixed both regressions, deleted duplicate proof, and passed package/shared gates |

Timeline:
- 2026-07-09T23:24:47.435Z Goal plan created.
- 2026-07-10 Package manifest and origin/main drift review completed.
- 2026-07-10 Select All and explicit fragment-target regressions repaired.
- 2026-07-10 Package proof, `check:core`, and final autoreview passed.

Open risks:
- No known Code Block package drift remains. App-level browser integration is a
  later package/app closure lane, intentionally outside this review.
