# plate-next csv cursor date package reviews

Objective:
Close CSV, Cursor, then Date as sequential Plate Next package reviews, with
every package file scored 100 and focused package proof green before advancing.

Goal plan:
docs/plans/2026-07-10-plate-next-csv-cursor-date-package-reviews.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user invoked `$plate-next` and said “ok go next packages”
- mode: package review mode, sequential three-package batch
- target surface: `packages/csv`, `packages/cursor`, `packages/date`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, active package plus the
  smallest Plite/Core owner only
- package review mode: yes
- package review target: CSV, Cursor, then Date; no later package starts before
  the current package closes
- package file checklist gate: 58 tracked rows plus one justified untracked
  proof row materialized below; `[x]` only at score 100
- completion threshold summary: close all three packages in order with package
  tests, typecheck, lint, build, source audits, and related-sweep evidence

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
- semantics: package-count batch, not a timebox
- initial confidence score: file rows start unscored
- improvement loop: close one package fully, then advance
- final score / loop closure: 59/59 rows at score 100

Completion threshold:
- Done when CSV, Cursor, and Date each close sequentially with every tracked and
  untracked package file inventoried and scored 100, focused behavior/type proof
  green, no compatibility sludge, and any genuine substrate gap repaired in the
  smallest Plite/Core owner.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-csv-cursor-date-package-reviews.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package-local Bun tests, followed by package
  typecheck, lint, and build for each package
- package proof: `@platejs/csv`, `@platejs/cursor`, and `@platejs/date` package
  gates, run sequentially
- shared Core gate: N/A unless a correction touches Core/Plite; these are
  product packages and do not enter `check:core` by package name alone
- source audits: stale Slate/Plate API names, inference cheats, nested updates,
  required public reads, unnecessary extension wrappers, and drift from main
- related scoped sweep query / active scope / match count / patched count / deferred count:
  pending
- package file manifest / row count / checked count / deferred count: combined
  tracked and untracked manifests; expected 59 after one justified Cursor proof
  file, actual 59, checked 38, deferred 0
- Plite/Plate gap ledger: initialized below; no known blocker yet
- broad Core drift ledger gate: N/A; broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-csv-cursor-date-package-reviews.md`

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
- allowed edit scope: active package plus the smallest Plite/Core owner needed
  for a proven blocker; this plan file for durable state
- package/API surfaces: CSV parsing/plugin behavior, Cursor geometry/hooks/UI,
  and Date parsing/query/insert/plugin behavior
- docs/browser surfaces: excluded; no app, www, docs, or browser proof in this
  package-review batch
- non-goals: later packages, broad Core sweep, rename pass, compatibility API,
  release/changeset work, and unrelated refactors
- out-of-scope package errors: record and defer unless they prove a public owner
  regression caused by the active package packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- A package cannot reach score 100 because the clean behavior/type shape needs
  a public Plite/Plate API fork that requires user review, or focused proof is
  impossible after three distinct owner-level repair attempts.

Current verdict:
- verdict: checkpoint zero complete; CSV review starts first
- confidence: 0.70 before source review
- next owner: plate-next
- keep / revert / quarantine call: pending per package
- reason: package source has not yet been reviewed against main and Plite law

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Three sequential packages, score-100 file gate, focused proof, no app/docs/browser scope |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` |
| Active goal checked or created | yes | Goal created for CSV, Cursor, Date closure |
| Mode classified as named packet vs broad Core sweep | yes | Package review; no broad Core sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Source and constraints above |
| Broad Core drift ledger initialized when in scope | N/A | Broad Core sweep excluded |
| Source of truth and allowed workspace recorded | yes | Current checkout, origin/main evidence, active package plus smallest owner |
| Output budget strategy recorded | yes | Per-file ledger in plan; concise chat updates |
| Public API fork routing checked | yes | Route only a proven public fork to plan review |
| Gap policy checked | yes | No local workaround for a genuine Plite/Plate gap |
| Related scoped sweep policy checked | yes | Active package plus smallest owner only |
| Review-mode rename freeze checked | yes | No rename churn |
| Package review checklist initialized when in scope | yes | 58 tracked rows plus one justified Cursor proof row below |

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
| Named verification threshold | yes | Run the proof commands named in this plan | CSV 8 tests including ESM; Cursor 12 tests; Date 24 tests; all package gates green |
| Broad Core drift ledger coverage | no | Broad Core sweep excluded | no Core source changed; smallest Plite DOM owner proved directly |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 59/59 rows score 100; 0 unchecked/deferred/missing/extra |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | CSV/Cursor/Date recommendation table complete |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | one Cursor DOM type gap closed; CSV/Date have no missing substrate capability |
| Related scoped sweep after correction | yes | For each correction, run and record same-class search/review results inside the active scope | eight sweep rows record matches, patches, deferrals, and risk |
| Package file checklist | yes | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | 58 tracked plus one justified Cursor proof file; all 59 closed |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | tests, combined source-first typecheck, lint, builds, declarations, and CSV ESM pass |
| Shared Core gate coverage | no | Record why N/A | packages are product owners; no Core source changed; Plite DOM owner passed its own gates |
| Non-Core package error triage | yes | Classify package command failures | all observed failures were named-package regressions and were repaired; no unrelated failure used as proof |
| Source audit | yes | Run exact audit for removed compatibility names | zero stale Slate/root-transform/cast/required-read matches across all three packages |
| Rename ledger | no | Update only when rename churn occurs | no files renamed; existing owner paths preserved |
| Extracted-file inventory | yes | Record every untracked package file | sole untracked row is the justified Cursor rAF regression spec |
| Autoreview / review | yes | Run scoped review gate | frozen diff review against current source and origin/main; two test casts fixed; no unresolved in-scope findings |
| Final lint/check | yes | Run scoped lint/check | combined four-package typecheck/lint/build, all package tests, ESM, and diff check pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below; no remaining in-scope drift, two explicit follow-ups |
| Goal plan complete | yes | Run plan verifier after evidence is complete | `check-complete.mjs` passed after final evidence update |

Phase / pass table:
| Pass | Status | Evidence |
|------|--------|----------|
| Checkpoint zero and 59-file ledger | complete | 58 tracked rows plus one justified Cursor proof row |
| CSV | complete | 15/15 score 100; eight tests and all package gates green |
| Cursor | complete | 23/23 score 100; 12 tests and Plite DOM owner gates green |
| Date | complete | 21/21 score 100; 24 tests and all package gates green |
| Scoped final review | complete | two test casts removed; rerun proof green; no unresolved in-scope findings |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/csv` | 0 | keep-in-plate after cleanup | CSV | 15/15 score 100; eight tests and package gates green | closed |
| `packages/cursor` | 0 | keep-in-plate after cleanup plus smallest Plite DOM type owner | Cursor / Plite DOM | 23/23 score 100; 12 tests and package gates green; DOM capability owner typechecks/builds | closed |
| `packages/date` | 0 | keep-in-plate after Plite-native migration | Date | 21/21 score 100; 24 tests and package gates green; declaration/source audits clean | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| CSV | Keep CSV parsing and parser registration Plate-owned; use BasePlugin, BaseEditor, editor-level `api.csv` and direct plugin-context API | Slate-named builder/editor, root option/API helpers, umbrella imports, React/Table dependency plumbing | Product parser remains Plate behavior while substrate types come directly from Plite/Core | none |
| Cursor | Keep cursor overlay geometry and React rendering Cursor-owned; consume Plite DOM through a public inferred capability type and require the renderer the package actually needs | fake structural editor aliases, umbrella imports, nullable no-op renderer, mutable cached rectangles, browser-geometry mocks detached from a real editor | Cursor is product proof/UI behavior; only the reusable DOM-capability type belongs to Plite DOM | none |
| Date | Keep date parsing, display labels, adjacency query, and date insertion Plate-owned; expose inferred `editor.update.date.insert` and keep the standalone helper transaction-first | old root `tf.insert.date`, editor-first helper aliases, umbrella imports, package-local normalization workarounds outside the owning transaction | Date is product behavior; Plite already supplies node insertion, reads, selection movement, and explicit normalization | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| CSV | none | N/A | N/A | package proof | closed |
| Cursor | Public type for an editor with installed `api.dom` while preserving value and extension inference | A package-local structural alias would duplicate Plite DOM ownership and erase editor inference | `@platejs/plite-dom` | source-first typecheck, build, declaration use, real mounted editor test | closed with `DOMCapableEditor` |
| Date | none | N/A; Plite intentionally keeps adjacent-text canonicalization explicit, and Date requests it in the same insertion transaction | Date | explicit-path insertion parity test | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| CSV builder/editor/API cleanup | `packages/csv` | `createT?Slate`, `SlateEditor`, root API/options/transforms, `platejs`, `as any`, callbacks | 0 after patch | 5 owner files | 0 | none |
| CSV dependency cleanup | `packages/csv` | source imports vs package dependencies and built artifact imports | 0 stale after patch | package metadata | 0 | none |
| Cursor API/type cleanup | `packages/cursor` | `platejs`, Slate types, `as any`, fake editor shapes, mutable rect caches, optional renderer, legacy DOM helpers | 0 after patch | 12 package owners | 0 | none |
| Cursor animation scheduling fix | `packages/cursor/src/hooks` | truthy animation-frame ID checks and duplicate scheduling paths | 0 stale checks after patch | hook plus focused spec | 0 | none |
| Cursor DOM capability ownership | `packages/cursor`, `packages/plite-dom` | local `SelectionRectsEditor`/DOM structural aliases and public capability exports | 0 inside active package; one analogous Selection owner deferred | Plite DOM type owner plus Cursor consumer | 1 | Selection package should consume the public capability during its own review |
| Date builder/editor/API cleanup | `packages/date` | `createSlate`, `SlateEditor`, `editor.tf`, root APIs, `platejs`, casts, manual plugin generics, nested updates | 0 after patch | 7 package owners plus metadata | 0 | none |
| Date insertion parity | `packages/date/src/lib/transforms` | explicit-path insertion followed by adjacent compatible text | 1 failing row before correction | `insertDate` now requests explicit normalization inside the same tx | 0 | all four insertion rows green |
| Date dependency/declaration cleanup | `packages/date` | source imports, package dependencies, built ESM imports, emitted plugin tx type | 0 stale after patch | package metadata and build output | 0 | none |

Core drift ledger:
- Applies: no; this is a product-package review, not a broad Core sweep
- Manifest command: pending
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: none

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | not in scope | Core | no Core source changed in this packet | N/A |

Package file checklist:
- Applies: yes
- Package: `packages/csv`, then `packages/cursor`, then `packages/date`
- Manifest command: `git ls-files packages/csv packages/cursor packages/date | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 59
- Actual row count: 59
- Checked score-100 count: 59
- Unchecked/deferred count: 0 / 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: none; all three packages are closed

Package file rows:
- [x] `packages/csv/.npmignore` — score: 100 — verdict: keep — owner: CSV — evidence: unchanged exclusion contract; build green — next: closed
- [x] `packages/csv/CHANGELOG.md` — score: 100 — verdict: keep-history — owner: CSV — evidence: historical artifact unchanged; no current API claim added — next: closed
- [x] `packages/csv/README.md` — score: 100 — verdict: keep — owner: CSV — evidence: current package description remains accurate — next: closed
- [x] `packages/csv/package.json` — score: 100 — verdict: direct-owner-cleanup — owner: CSV — evidence: real imports map to Core, Plite, Utils, Udecode Utils, and Papa Parse; stale Plate/Table/React dependencies cut; build green — next: closed
- [x] `packages/csv/src/index.ts` — score: 100 — verdict: keep-generated — owner: CSV — evidence: generated barrel exposes the package owner; build green — next: closed
- [x] `packages/csv/src/lib/CsvPlugin.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: CSV — evidence: live BaseEditor proves defaults, editor API, scoped plugin API, and parser callback without `as any`; 1 row green — next: closed
- [x] `packages/csv/src/lib/CsvPlugin.ts` — score: 100 — verdict: main-parity-cleanup — owner: CSV — evidence: inferred BasePlugin, direct owners, live parser-context API, same text/plain behavior; typecheck and runtime proof green — next: closed
- [x] `packages/csv/src/lib/deserializer/index.ts` — score: 100 — verdict: keep-generated — owner: CSV — evidence: generated barrel unchanged and build green — next: closed
- [x] `packages/csv/src/lib/deserializer/utils/deserializeCsv.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: CSV — evidence: six header/array/invalid/tolerance rows green on BaseEditor — next: closed
- [x] `packages/csv/src/lib/deserializer/utils/deserializeCsv.ts` — score: 100 — verdict: main-parity-cleanup — owner: CSV — evidence: same AST behavior with BaseEditor/Descendant types; broad casts and non-null assertion removed; six rows green — next: closed
- [x] `packages/csv/src/lib/deserializer/utils/index.ts` — score: 100 — verdict: keep-generated — owner: CSV — evidence: generated barrel unchanged and build green — next: closed
- [x] `packages/csv/src/lib/esmInterop.slow.ts` — score: 100 — verdict: keep-proof — owner: CSV — evidence: native Node ESM import passes against built artifact — next: closed
- [x] `packages/csv/src/lib/index.ts` — score: 100 — verdict: keep-generated — owner: CSV — evidence: generated public exports match owners and build green — next: closed
- [x] `packages/csv/tsconfig.build.json` — score: 100 — verdict: keep-tooling — owner: CSV — evidence: source root matches flat dist contract; build green — next: closed
- [x] `packages/csv/tsconfig.json` — score: 100 — verdict: keep-tooling — owner: CSV — evidence: source and specs typecheck green — next: closed
- [x] `packages/cursor/.npmignore` — score: 100 — verdict: keep — owner: Cursor — evidence: unchanged exclusion contract; build green — next: closed
- [x] `packages/cursor/CHANGELOG.md` — score: 100 — verdict: keep-history — owner: Cursor — evidence: historical artifact unchanged; no current API claim added — next: closed
- [x] `packages/cursor/README.md` — score: 100 — verdict: keep — owner: Cursor — evidence: current headless overlay description and package link remain accurate — next: closed
- [x] `packages/cursor/package.json` — score: 100 — verdict: direct-owner-cleanup — owner: Cursor — evidence: source imports map to Core, Plite, Plite DOM, Udecode React Utils/Utils, React, and compiler runtime; umbrella dependency removed; build green — next: closed
- [x] `packages/cursor/src/components/CursorOverlay.tsx` — score: 100 — verdict: main-parity-cleanup — owner: Cursor — evidence: generic cursor data remains inferred, public state owns `id`, renderer is honestly required, package types/tests green — next: closed
- [x] `packages/cursor/src/components/index.ts` — score: 100 — verdict: keep-generated — owner: Cursor — evidence: generated barrel still exposes component owner; build green — next: closed
- [x] `packages/cursor/src/hooks/index.ts` — score: 100 — verdict: keep-generated — owner: Cursor — evidence: hook barrel exports the same owner surface plus focused proof remains internal — next: closed
- [x] `packages/cursor/src/hooks/useCursorOverlayPositions.spec.tsx` — score: 100 — verdict: strengthen-proof — owner: Cursor — evidence: real BaseEditor proves relative-container and viewport-coordinate behavior without casts — next: closed
- [x] `packages/cursor/src/hooks/useCursorOverlayPositions.ts` — score: 100 — verdict: fix-behavior-and-types — owner: Cursor — evidence: omitted container correctly uses viewport offsets; provided unmounted container still waits; readonly cache and direct imports typecheck — next: closed
- [x] `packages/cursor/src/hooks/useRefreshOnResize.ts` — score: 100 — verdict: main-parity-cleanup — owner: Cursor — evidence: observer lifecycle preserved with inferred readonly range cache; package proof green — next: closed
- [x] `packages/cursor/src/hooks/useRequestReRender.spec.tsx` — score: 100 — verdict: justify-new-proof-tooling — owner: Cursor — evidence: proves valid rAF ID zero coalesces and immediate refresh cancels a pending frame — next: closed
- [x] `packages/cursor/src/hooks/useRequestReRender.ts` — score: 100 — verdict: fix-regression — owner: Cursor — evidence: explicit null checks handle valid frame ID zero across scheduling, immediate cancel, effect cleanup, and unmount — next: closed
- [x] `packages/cursor/src/index.ts` — score: 100 — verdict: keep-generated — owner: Cursor — evidence: package barrel exports the reviewed public surface; build green — next: closed
- [x] `packages/cursor/src/queries/getCaretPosition.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: Cursor — evidence: forward, backward, and collapsed geometry rows pass without casts — next: closed
- [x] `packages/cursor/src/queries/getCaretPosition.ts` — score: 100 — verdict: main-parity-cleanup — owner: Cursor — evidence: direct Range owner, readonly rect input, unchanged caret-edge behavior; focused proof green — next: closed
- [x] `packages/cursor/src/queries/getCursorOverlayState.spec.ts` — score: 100 — verdict: strengthen-proof — owner: Cursor — evidence: empty, data, caret, selection, and key-to-id mapping pass without `any` — next: closed
- [x] `packages/cursor/src/queries/getCursorOverlayState.ts` — score: 100 — verdict: main-parity-cleanup — owner: Cursor — evidence: output state owns stable `id`, frozen empty rects stay readonly, behavior proof green — next: closed
- [x] `packages/cursor/src/queries/getSelectionRects.spec.ts` — score: 100 — verdict: replace-fake-oracle — owner: Cursor — evidence: mounted real Plate/Plite DOM editor proves unavailable range, detached node, and start/middle/end geometry with offsets — next: closed
- [x] `packages/cursor/src/queries/getSelectionRects.ts` — score: 100 — verdict: owner-correct-migration — owner: Cursor / Plite DOM — evidence: consumes inferred `DOMCapableEditor`, public DOM API, and Plite reads without local structural aliases or casts; tests/typecheck green — next: closed
- [x] `packages/cursor/src/queries/index.ts` — score: 100 — verdict: keep-generated — owner: Cursor — evidence: query barrel preserves reviewed exports; build green — next: closed
- [x] `packages/cursor/src/types.ts` — score: 100 — verdict: public-contract-cleanup — owner: Cursor — evidence: input/output state split is honest, IDs required only after mapping, selection rects readonly, direct owners typecheck — next: closed
- [x] `packages/cursor/tsconfig.build.json` — score: 100 — verdict: keep-tooling — owner: Cursor — evidence: build includes public source and emits valid declarations — next: closed
- [x] `packages/cursor/tsconfig.json` — score: 100 — verdict: keep-tooling — owner: Cursor — evidence: source plus all specs, including new rAF proof, typecheck green — next: closed
- [x] `packages/date/.npmignore` — score: 100 — verdict: keep — owner: Date — evidence: unchanged exclusion contract; build green — next: closed
- [x] `packages/date/CHANGELOG.md` — score: 100 — verdict: keep-history — owner: Date — evidence: historical artifact unchanged; no current API claim added — next: closed
- [x] `packages/date/README.md` — score: 100 — verdict: keep — owner: Date — evidence: current package description and documentation link remain accurate — next: closed
- [x] `packages/date/package.json` — score: 100 — verdict: direct-owner-cleanup — owner: Date — evidence: source imports map to Core, Plite, Utils, Test Utils, React, and compiler runtime; umbrella dependency removed; build green — next: closed
- [x] `packages/date/src/index.ts` — score: 100 — verdict: keep-generated — owner: Date — evidence: package barrel exposes the reviewed public owner; barrel/build green — next: closed
- [x] `packages/date/src/lib/BaseDatePlugin.spec.tsx` — score: 100 — verdict: main-parity-migration — owner: Date — evidence: seven inferred BaseEditor rows prove node flags, tx installation, void deletion, and bidirectional keyboard entry without casts — next: closed
- [x] `packages/date/src/lib/BaseDatePlugin.ts` — score: 100 — verdict: Plite-native-migration — owner: Date — evidence: inferred BasePlugin owns `date.insert`; configured type flows into the same tx helper; declaration and runtime proof green — next: closed
- [x] `packages/date/src/lib/index.ts` — score: 100 — verdict: keep-generated — owner: Date — evidence: existing plugin/query/transform/utils exports preserved; barrel/build green — next: closed
- [x] `packages/date/src/lib/queries/index.ts` — score: 100 — verdict: keep-generated — owner: Date — evidence: adjacency query remains exported from its original owner — next: closed
- [x] `packages/date/src/lib/queries/isPointNextToNode.spec.tsx` — score: 100 — verdict: strengthen-types-preserve-behavior — owner: Date — evidence: seven forward/reverse/explicit/empty/middle/missing-selection rows pass; JSX fixture boundary is runtime-validated, not cast — next: closed
- [x] `packages/date/src/lib/queries/isPointNextToNode.ts` — score: 100 — verdict: main-parity-migration — owner: Date — evidence: same boundary and error behavior through BaseEditor reads; invalid paths return false; no non-null or legacy API — next: closed
- [x] `packages/date/src/lib/transforms/index.ts` — score: 100 — verdict: keep-generated — owner: Date — evidence: insert helper and options type remain exported from original transform owner — next: closed
- [x] `packages/date/src/lib/transforms/insertDate.spec.tsx` — score: 100 — verdict: main-parity-migration — owner: Date — evidence: four rows prove direct tx helper, configured plugin type, explicit location/options, canonical/raw storage, trailing spacer, selection, and text canonicalization — next: closed
- [x] `packages/date/src/lib/transforms/insertDate.ts` — score: 100 — verdict: transaction-first-migration — owner: Date — evidence: inferred node insertion, explicit type input, same normalized date/spacer behavior, same-tx canonicalization, no casts or nested update — next: closed
- [x] `packages/date/src/lib/utils/dateValue.spec.ts` — score: 100 — verdict: keep-proof — owner: Date — evidence: six canonical parse/format/legacy/raw/relative-label rows green — next: closed
- [x] `packages/date/src/lib/utils/dateValue.ts` — score: 100 — verdict: keep-product-behavior — owner: Date — evidence: local-calendar/noon parsing avoids timezone drift; invalid and loose input preserved; focused proof green — next: closed
- [x] `packages/date/src/lib/utils/index.ts` — score: 100 — verdict: keep-generated — owner: Date — evidence: date value helpers remain exported from original owner — next: closed
- [x] `packages/date/src/react/DatePlugin.tsx` — score: 100 — verdict: direct-owner-migration — owner: Date React — evidence: same `toPlatePlugin(BaseDatePlugin)` composition through direct Core React import; build green — next: closed
- [x] `packages/date/src/react/index.ts` — score: 100 — verdict: keep-generated — owner: Date React — evidence: React barrel preserves `DatePlugin`; build green — next: closed
- [x] `packages/date/tsconfig.build.json` — score: 100 — verdict: keep-tooling — owner: Date — evidence: explicit source root matches flat dist contract; build and declarations green — next: closed
- [x] `packages/date/tsconfig.json` — score: 100 — verdict: keep-tooling — owner: Date — evidence: all source and four spec owners typecheck green — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| CSV migration | CSV | Old Slate builder/editor/root API plus fake umbrella and React dependencies | 15 package rows; package tests/typecheck/lint/build; ESM proof | keep repaired | Cursor |
| Cursor migration | Cursor | Umbrella imports, false renderer contract, weak geometry oracle, mutable cache types, and rAF zero-ID bug | 23 package rows; package tests/typecheck/lint/build; source and declaration audits | keep repaired | Date |
| Cursor DOM capability | Plite DOM | Cursor needed exact editor inference plus installed DOM API without a package-local fake shape | `packages/plite-dom/src/plugin/dom-editor.ts`, public barrel, source-first typecheck/build/lint | keep smallest owner fix | Selection follow-up deferred |
| Date migration | Date | Old Slate builder/editor/root transforms plus insertion canonicalization drift under Plite's explicit-normalization law | 21 package rows; 24 tests; package typecheck/lint/build/barrel; source/declaration audits | keep repaired | final scoped review |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/csv`, `packages/date` | N/A | `git ls-files --others --exclude-standard ...` returned zero rows | no extracted files | inventory complete |
| `packages/cursor/src/hooks/useRequestReRender.spec.tsx` | `justify-new-proof-tooling` | no `origin/main` proof owner; bug had no focused regression test | keep beside the existing hook | package test/typecheck green; rAF ID zero and immediate cancellation covered |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `packages/selection/src/react/queries/getSelectionRects.ts` | local structural DOM-capability type duplicates the corrected Cursor pressure | Selection is outside the strict CSV/Cursor/Date sequence | consume `DOMCapableEditor` during the Selection package review; consider later geometry consolidation only with proof |
| Date public docs and generated registry artifacts | still teach `insertDate(editor, options)`, callback-form `tx.date.insert`, and umbrella imports | docs/apps/browser are explicitly outside this three-package review | docs/registry owner after package migration; do not patch generated registry JSON directly |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Cursor geometry capability shape | `packages/selection/src/react/queries/getSelectionRects.ts` | Selection is outside the strict package sequence | Selection package review |
| Date API examples | `content/docs/(plugins)/(elements)/date*.mdx`, generated `apps/www/public/r/*.json` | docs/apps scope explicitly excluded; generated registry output is CI-owned | docs/registry migration packet |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | CSV direct parser/API ownership and typed AST; Cursor honest renderer/state contract, viewport geometry, rAF fix, and Plite DOM capability type; Date BasePlugin transaction, Plite reads, transaction-first insertion, explicit canonicalization, and direct dependencies; lockfile synced |
| tests/proof | CSV parser/ESM proof; Cursor real mounted-editor geometry plus new rAF regression spec; Date 24-row plugin/query/date-value/insertion suite; test-only casts removed |
| docs/templates/skills | this autogoal plan only; product docs/apps intentionally untouched |
| reverted/quarantined packets | none; all three repaired packets kept after focused proof |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Date docs teach the old editor-first helper and callback tx form | Package API is clean but docs/apps were explicitly outside this review | `content/docs/(plugins)/(elements)/date.mdx` | migrate in the docs/registry owner; never edit generated registry JSON directly |
| 2 | Selection carries a package-local DOM-capability shape | Cursor proved the reusable owner belongs in Plite DOM | `packages/selection/src/react/queries/getSelectionRects.ts` | consume `DOMCapableEditor` during Selection's own package review |
| 3 | Caption still reconstructs node identity with `nodes.find` | The latest user review exposed avoidable O(n) migration drift | `packages/caption/src/react/components/CaptionTextarea.tsx` | next Plate Next package review should use `read.nodes.path(element)` or direct node targets |

Findings:
- No unresolved in-scope finding after the final scoped review.
- Two test-only type assertions were accepted findings and removed before the
  final proof rerun.

Decisions and tradeoffs:
- Keep CSV, Cursor, and Date product behavior in their Plate packages.
- Add only `DOMCapableEditor` to Plite DOM; reject package-local fake editor
  shapes and broader runtime movement.
- Keep Date insertion canonicalization explicit inside its transaction because
  Plite intentionally does not canonicalize every ordinary operation.
- Hard-cut old Slate/root transform surfaces; no aliases or compatibility
  wrappers were added.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| CSV `.extend(({ api }) => ...)` captured a pre-resolution API object at runtime | 1 | use the live parser callback context | parser now calls the resolved `api.deserialize`; runtime proof green |
| Cursor spec attempted to assign immutable `editor.api.dom` methods | 1 | mount a real editor and mock browser geometry only | real Plate/Plite DOM proof replaced fake editor mutation |
| Direct `bun test` on `getSelectionRects.spec.ts` bypassed package preload and lacked global DOM `Range` | 1 | run the package-owned test command | `pnpm --filter @platejs/cursor test` passes all 12 rows |
| `PlateEditor<V, P>` did not express the installed DOM capability without a local structural type | 1 | add the smallest public capability type at Plite DOM owner | `DOMCapableEditor` preserves value/extension inference; owner and consumer gates green |
| Date tests initially failed to import removed `createSlatePlugin` / `createSlateEditor` exports | 1 | migrate the package owner instead of adding compatibility exports | BasePlugin/BaseEditor and direct package imports now pass all proof |
| Date JSX test fixture cast failed strict typecheck | 1 | validate the fixture shape at runtime | query proof has no `any`, `unknown` cast, or inference suppression |
| Date explicit-path insertion left adjacent text leaves split | 1 | follow Plite's explicit canonicalization law inside the owning tx | `tx.normalize()` restores the package's exact `" b"` output; all insertion rows pass |

Verification evidence:
- CSV: `pnpm --filter @platejs/csv test` passed, 7 tests.
- CSV: `pnpm --filter @platejs/csv exec bun test ./src/lib/esmInterop.slow.ts`
  passed, 1 test.
- CSV: package typecheck, lint, and build passed.
- CSV: stale API/import/dependency audits returned zero matches.
- Cursor: `pnpm --filter @platejs/cursor test` passed, 12 tests and 18
  expectations with no React warnings.
- Cursor: package typecheck, lint, and build passed.
- Cursor: stale umbrella/API/cast/fake-editor/mutable-cache/rAF audits returned
  zero matches.
- Plite DOM: source-first typecheck, lint, and build passed after adding the
  inferred public `DOMCapableEditor` capability type; barrel audit required no
  generated changes.
- Cursor/Plite DOM: scoped `git diff --check` passed.
- Date: `pnpm --filter @platejs/date test` passed, 24 tests and 36
  expectations.
- Date: source-first Turbo typecheck, package lint, build, and barrel generation
  passed.
- Date: stale Slate/root-transform/cast/required-read/nested-update/import
  audits returned zero matches; built declarations expose inferred
  `date.insert` and transaction-first `insertDate`.
- Date/lockfile: scoped `git diff --check` passed.

Final handoff contract:
- target surface and mode: sequential package review for CSV, Cursor, Date
- files/APIs reviewed: all 59 tracked/untracked rows plus smallest Plite DOM
  owner
- broad Core drift score coverage: N/A; no Core source changed
- package file checklist coverage: 59/59 score 100, zero unchecked/deferred
- best Plate v2 recommendation: keep product owners; use direct Plite/Core
  substrate and inferred plugin tx groups
- verdict matrix summary: CSV/Cursor/Date closed; all post-fix drift scores 0
- Plite/Plate gaps or blockers: Cursor DOM capability closed; none open
- related scoped sweep query/active scope/matches/patched/deferred: eight rows
  above; two adjacent-owner matches deferred intentionally
- out-of-scope matches discovered: Date docs/registry, Selection DOM shape,
  Caption path lookup
- changes made: code/runtime/API, tests/proof, metadata, lockfile, plan
- tests/proof commands: all package tests, CSV ESM, combined typecheck/lint/build,
  barrel and source/diff audits
- old compatibility names audited: zero stale matches in the three packages
- needs attention: three ranked follow-ups above; none blocks this package batch
- next best Plate Next packet: `packages/caption`, starting with node-target/path
  cleanup and a fresh per-file ledger

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final scoped review |
| Where am I going? | Close the autogoal after cross-package diff and plan audits |
| What is the goal? | Close 59 package rows at score 100 with focused proof |
| What have I learned? | Cursor needed one genuine Plite DOM capability type; real mounted-editor geometry proof exposed both viewport and detached-node behavior more honestly than fake editor shapes |
| What have I done? | Closed all 59 package rows: CSV 15, Cursor 23, Date 21 |

Timeline:
- 2026-07-10T06:01:41.593Z Goal plan created.
- 2026-07-10 Checkpoint zero closed: CSV 15 rows, Cursor 22 rows, Date 21 rows; zero untracked files.
- 2026-07-10 CSV closed: 15/15 score 100; 8 tests, typecheck, lint, build, ESM and source audits green.
- 2026-07-10 Cursor closed: 23/23 score 100; 12 tests, typecheck, lint,
  build, declaration/source audits, and Plite DOM owner proof green.
- 2026-07-10 Date closed: 21/21 score 100; 24 tests, typecheck, lint,
  build, barrel, declaration/source audits, and explicit insertion parity green.
- 2026-07-10 Final scoped review closed: two test casts removed, all affected
  proof rerun green, and the autogoal verifier passed.

Open risks:
- None in the reviewed package batch. Date docs, Selection DOM typing, and
  Caption path lookup are explicit follow-up owners, not hidden closure debt.
