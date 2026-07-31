# plate-next root option helper hard cut

Objective:
Hard-cut Plate root option helpers; callers use scoped plugin context or
`editor.plugin(...)`; repair Plate Next rule/template to enforce it.

Goal plan:
docs/plans/2026-07-08-plate-next-root-option-helper-hard-cut.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user requested `$autogoal` hard cut and repair `$plate-next`
  after accepting that root `editor.getOption/getOptions/setOption/setOptions`
  should die for Plate v2.
- mode: one-shot execution with Plate Next review lens
- target surface: Plate root plugin option helpers and Plate Next workflow rule
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; this is a named public API hard cut with related
  source sweeps
- correction-triggered related Core sweep: yes, root option helper patterns
- package review mode: no
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: no public/root `editor.getOption`,
  `editor.getOptions`, `editor.setOption`, or `editor.setOptions` callers
  remain in source/type-test code; plugin context and `editor.plugin(...)`
  remain as the Plate-owned option API; Plate Next source/template says root
  option helpers are forbidden.

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
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Root Plate option helpers are hard-cut from public `BaseEditor` surface.
- Runtime/plugin context implements scoped option helpers without calling root
  option helpers.
- All source and type-test callers migrate:
  `editor.getOption(Foo, key, ...)` -> `editor.plugin(Foo).getOption(key, ...)`;
  `editor.getOptions(Foo)` -> `editor.plugin(Foo).getOptions()`;
  `editor.setOption(Foo, key, value)` -> `editor.plugin(Foo).setOption(key, value)`;
  `editor.setOptions(Foo, patch)` -> `editor.plugin(Foo).setOptions(patch)`.
- Key/generic fallback is allowed only as a scoped plugin portal:
  `editor.plugin<FooConfig>(KEYS.foo).getOption(...)`, with a concrete owner
  reason when used in reviewed package code.
- Scoped plugin context helpers (`getOption`, `getOptions`, `setOption`,
  `setOptions`) remain because plugin options are Plate product composition,
  not Plite substrate.
- `usePluginOption` / `useEditorPluginOption` remain for render subscriptions;
  callback-only data must be read inside the callback from `editor.plugin(...)`
  or plugin context.
- Plate Next source rule and generated skill mirror are updated from
  "prefer root option helpers with plugin object" to "root option helpers are
  forbidden public API."
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-08-plate-next-root-option-helper-hard-cut.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands:
  - `pnpm --filter @platejs/selection test src/react/hooks/useBlockSelectable.spec.tsx src/react/utils/copySelectedBlocks.spec.tsx` passed; package script ran 98 tests across 25 files.
  - `pnpm --filter @platejs/plite typecheck` passed.
  - `pnpm --filter @platejs/plite test ./test/operations-contract.ts --grep "applies and inverts huge replace_children ranges without argument spreading"` passed.
  - `pnpm --filter www check:docs` passed.
  - `pnpm check:core` passed.
- package proof: `pnpm check:core` is the owning aggregate for Core plus current Core-adjacent selection/utils/plite proof.
- shared Core gate: `pnpm check:core` passed.
- source audits:
  - `rg -n "\\b(editor|context\\.editor|basePlateEditor|createdPlateEditor|plateEditor)\\.(getOption|getOptions|setOption|setOptions)\\(" packages --glob '!**/dist/**' --glob '*.{ts,tsx,mts,cts}'` returned no matches.
  - `rg -n "editor\\.getOption\\(FooPlugin|editor\\.setOption\\(FooPlugin|editor\\.getOptions\\(FooPlugin|Root plugin option helpers are forbidden|Plugin option law" .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md docs/plans/templates/plate-next.md` returned only the new forbidden-helper rule in source, template, and generated skill.
  - `rg -n "\\.(getOption|getOptions|setOption|setOptions)\\(" packages/core/src/lib/editor packages/core/src/react/plugin packages/core/src/react/stores packages/selection/src packages/utils/src --glob '!**/dist/**'` returned scoped plugin/context calls only.
- related Core sweep query / match count / patched count / deferred count:
  root source helper audit returned 0 remaining root callers; scoped audit reviewed current option helper callsites in Core, selection, and utils.
- package file manifest / row count / checked count / deferred count:
  N/A: this was not package review mode.
- Plite/Plate gap ledger: N/A, no Plite substrate gap blocks the target.
- broad Core drift ledger gate: N/A, this was a named API hard cut, not a broad Core sweep.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-08-plate-next-root-option-helper-hard-cut.md`

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
- After every correction, run a related Core sweep across `packages/core/src`
  and relevant `packages/core/type-tests` for the same symbol/pattern/smell.
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
- allowed edit scope: Plate/Plite package source and tests needed for the
  option-helper cut; `.agents/rules/plate-next.mdc`,
  `docs/plans/templates/plate-next.md`, generated skill mirror via
  `pnpm install`; this plan.
- package/API surfaces: `packages/core` public editor/plugin types, runtime
  plugin context, current package callers.
- docs/browser surfaces: docs/browser proof N/A unless docs examples teach the
  removed root helpers.
- non-goals: do not move plugin options to Plite; do not redesign all plugin
  config storage; do not rename plugins/files; do not preserve root helper
  aliases.
- out-of-scope package errors: failures unrelated to root option helper cut are
  recorded, not repaired in this goal.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- stop only if a package requires root option helpers for a real cycle that
  cannot be solved by scoped plugin context, `editor.plugin(...)`, or a private
  owner-local helper without reintroducing public root helpers.

Current verdict:
- verdict: hard-cut root option helpers; keep scoped plugin context helpers
- confidence: 0.97 after source audits and `pnpm check:core`
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: root helpers are gone from the public editor surface and callers use
  scoped plugin portals/context without a compatibility alias.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Root option helper hard cut | done | code, docs, Plate Next rule/template, source audits, focused tests, and `pnpm check:core` are closed |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint section captured hard cut, Plate Next repair, proof, non-goals, and N/A broad/package modes |
| `plate-next` skill/rule read | yes | read generated skill from prompt and source rule `.agents/rules/plate-next.mdc` |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this hard-cut objective |
| Mode classified as named packet vs broad Core sweep | yes | named public API hard cut, not broad Core sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | root helpers are legacy public API; scoped plugin context remains |
| Broad Core drift ledger initialized when in scope | no | N/A: named API hard cut; related sweep audit recorded instead |
| Source of truth and allowed workspace recorded | yes | current checkout `/Users/zbeyens/git/plate-2`; source rule `.agents/rules/plate-next.mdc` |
| Output budget strategy recorded | yes | use counts/file lists first, focused reads and capped output |
| Public API fork routing checked | yes | user accepted the hard-cut decision in chat; this is execution of that cut |
| Gap policy checked | yes | record Plate gap only if scoped plugin portal cannot replace a root call |
| Related Core sweep policy checked | yes | sweep root option helper patterns after code correction |
| Review-mode rename freeze checked | yes | no rename pass |
| Package review checklist initialized when in scope | no | N/A: not package review mode |

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
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk.
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
| Named verification threshold | yes | Run the proof commands named in this plan | `pnpm check:core` passed; focused selection/plite/docs commands passed |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named API hard cut, not broad Core sweep |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Target rows below are 95-100; no high-drift row remains in this named packet |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Root helpers die; scoped plugin portal/context remains |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | N/A: no Plite gap; plugin option state is Plate product composition |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | root helper source audit returned 0 remaining root callers |
| Package file checklist | no | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | N/A: not package review mode |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | focused selection tests passed; Plite typecheck/focused test passed; `pnpm check:core` passed |
| Shared Core gate coverage | no | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | N/A: no package review target; existing `check:core` already covered the touched Core-adjacent packages |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | Browser app proof hit unrelated `apps/www` export drift; recorded in needs-attention |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | source root helper audit returned no matches in package TS/TSX source |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename packet |
| Extracted-file inventory | no | Record untracked/extracted file command, row count, and bucket for every file in scope | N/A: no extracted-file review packet |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs or record N/A | Plate Next self-review and source audits completed; no separate autoreview requested |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-08-plate-next-root-option-helper-hard-cut.md` | passed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/editor/SlateEditor.ts` root option helpers | 0 | hard-cut | Core editor type surface | root helper methods removed; source audit found no root package callers | keep |
| `packages/core/src/lib/editor/withPlite.ts` root option runtime assignments | 0 | hard-cut | Core runtime bridge into Plite | runtime assignments removed; `pnpm check:core` passed | keep |
| `packages/core/src/lib/plugin/getEditorPlugin.ts` scoped option helpers | 1 | keep-in-plate | Plate plugin context | scoped helpers read/write `editor.getOptionsStore(plugin)`; `pnpm check:core` passed | keep, watch future type simplification only |
| selection package option callers | 0 | main-parity-cleanup | `@platejs/selection` | callers use `editor.plugin(...)`; 98 selection tests passed | keep |
| utils block placeholder option callers | 0 | main-parity-cleanup | `@platejs/utils` | caller uses scoped plugin portal/context; `pnpm check:core` passed | keep |
| docs examples teaching root helpers | 0 | hard-cut | docs | docs examples rewritten to scoped plugin portal; `pnpm --filter www check:docs` passed | keep |
| Plate Next rule/template | 0 | hard-cut | `.agents/rules/plate-next.mdc` and `docs/plans/templates/plate-next.md` | source/template/generated skill all say root helpers are forbidden | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Plate plugin options | Use `editor.plugin(FooPlugin).getOption/getOptions/setOption/setOptions` and plugin context helpers; use `usePluginOption` for render subscriptions | root `editor.getOption/getOptions/setOption/setOptions`; compat aliases; moving plugin options to Plite | plugin options are Plate product composition, and scoped portal avoids root API clutter | low; API decision already accepted |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | scoped Plate portal/context covers the use case | N/A | N/A | no blocker |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Root option helper removal | `rg -n "\\b(editor|context\\.editor|basePlateEditor|createdPlateEditor|plateEditor)\\.(getOption|getOptions|setOption|setOptions)\\(" packages --glob '!**/dist/**' --glob '*.{ts,tsx,mts,cts}'` | 0 remaining root callers | all source callers found during migration were patched | 0 | low |
| Plate Next rule repair | `rg -n "editor\\.getOption\\(FooPlugin|editor\\.setOption\\(FooPlugin|editor\\.getOptions\\(FooPlugin|Root plugin option helpers are forbidden|Plugin option law" .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md docs/plans/templates/plate-next.md` | 3 new-rule hits, 0 stale-root-helper examples | source rule/template/generated mirror patched | 0 | low |
| Scoped helper sanity | `rg -n "\\.(getOption|getOptions|setOption|setOptions)\\(" packages/core/src/lib/editor packages/core/src/react/plugin packages/core/src/react/stores packages/selection/src packages/utils/src --glob '!**/dist/**'` | scoped portal/context/test hits only | invalid root calls removed | 0 | low |

Core drift ledger:
- Applies: no, N/A named API hard cut
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: none for this named packet

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | Not a broad Core sweep | N/A |

Package file checklist:
- Applies: no
- Package: N/A
- Manifest command: N/A
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: N/A
- Actual row count: N/A
- Checked score-100 count: N/A
- Unchecked/deferred count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A

Package file rows:
- [x] N/A: not package review mode.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| root option helper hard cut | Plate Core | root plugin option helpers clutter editor public API and conflict with scoped Plate plugin ownership | Core editor/runtime/context, selection/utils callers, docs, Plate Next rule/template | keep | continue future Plate packages with scoped plugin portal law |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | N/A | No extracted-file review in this named packet |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `apps/www` browser route proof | local dev route `/docs/editor-methods` failed to render because unrelated exports are missing: `combineTransformMatchOptions`, `createExcludeDiffFragmentExtension`, `createSlatePlugin`, `useReadOnly`, `useScrollRef`, `useSelected`, `withTriggerCombobox` | docs source validation passed and package proof passed; app export drift is outside root option helper cut | next Plate package/export cleanup lane |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | removed public root option helpers from Core editor types/runtime; moved option reads/writes to scoped plugin context and `editor.plugin(...)`; migrated selection/utils callers |
| tests/proof | updated selection mocks/specs to scoped portal; added Bun timeout option to the huge Plite operation contract test so `check:core` is stable |
| docs/templates/skills | rewrote docs examples to scoped plugin portal; patched `.agents/rules/plate-next.mdc`, `docs/plans/templates/plate-next.md`, regenerated `.agents/skills/plate-next/SKILL.md` |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Browser proof blocked by unrelated app export drift | `apps/www` cannot render the docs route locally, independent of this hard cut | missing exports listed in out-of-scope package drift | handle in the next package/export cleanup lane before relying on docs browser proof |
| 2 | Scoped context implementation still centralizes some type boundary casts | not a blocker, but future simplification could tighten `getEditorPlugin` internals | `packages/core/src/lib/plugin/getEditorPlugin.ts` | leave for a focused type-simplification packet if it starts leaking |

Findings:
- Root public helpers were unnecessary API clutter. Scoped plugin portal/context gives the same power without polluting the editor root.

Decisions and tradeoffs:
- Keep plugin option state in Plate, not Plite.
- Keep `usePluginOption` for render subscriptions.
- Allow key/generic fallback only with a concrete owner reason such as self-cycle or decoupled cross-package code.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm check:core` timed out one Plite huge operation row under full-suite load | 1 | give that single stress row an explicit Bun timeout options object, then rerun focused proof and `check:core` | fixed |
| Browser docs route proof hit unrelated app export drift | 1 | record out-of-scope owner instead of patching unrelated packages in this goal | recorded |

Verification evidence:
- `pnpm --filter @platejs/selection test src/react/hooks/useBlockSelectable.spec.tsx src/react/utils/copySelectedBlocks.spec.tsx` passed; package script ran 98 tests across 25 files.
- `pnpm --filter @platejs/plite typecheck` passed.
- `pnpm --filter @platejs/plite test ./test/operations-contract.ts --grep "applies and inverts huge replace_children ranges without argument spreading"` passed.
- `pnpm --filter www check:docs` passed.
- `pnpm check:core` passed.
- Source audit for root helpers in package TS/TSX source returned no matches.
- Plate Next rule/template/generated mirror audit returned only the new forbidden-helper rule.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-08-plate-next-root-option-helper-hard-cut.md` passed.

Final handoff contract:
- target surface and mode: named Plate public API hard cut for root option helpers.
- files/APIs reviewed: Core editor public type/runtime/context, scoped plugin portal callsites in Core/selection/utils, docs examples, Plate Next rule/template/mirror.
- broad Core drift score coverage: N/A, not broad Core sweep.
- package file checklist coverage: N/A, not package review mode.
- best Plate v2 recommendation: root helpers die; scoped plugin portal/context stays.
- verdict matrix summary: hard-cut root helpers, keep scoped context, keep docs/skills aligned.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: root source helper audit returned 0 remaining root callers; stale rule audit returned 0 stale examples; no deferred rows.
- changes made: code/runtime/API, tests/proof, docs/templates/skills listed above.
- tests/proof commands: listed in verification evidence.
- old compatibility names audited: root helper audit returned no package source callers.
- needs attention: browser proof blocked by unrelated app export drift.
- next best Plate Next packet: continue package-by-package migration with the scoped plugin portal law enforced.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final verification |
| Where am I going? | Close the root option helper hard cut |
| What is the goal? | Root Plate option helpers removed; scoped plugin portal/context enforced; Plate Next repaired |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-08T11:49:35.276Z Goal plan created.
- 2026-07-08 Root helper API removed from Core editor public/runtime surface.
- 2026-07-08 Source callers, docs examples, tests, and Plate Next rule/template regenerated to scoped plugin portal/context.
- 2026-07-08 Focused tests, docs check, source audits, and `pnpm check:core` passed.

Open risks:
- Browser route proof remains blocked by unrelated `apps/www` export drift.
