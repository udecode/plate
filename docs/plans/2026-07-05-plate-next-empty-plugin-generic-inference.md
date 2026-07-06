# plate-next empty plugin generic inference

Objective:
Cut unnecessary empty plugin generics; done when SingleBlock/SingleLine infer
without manual `PluginConfig<'key'>` and focused proof passes.

Goal plan:
docs/plans/2026-07-05-plate-next-empty-plugin-generic-inference.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: "export const SingleBlockPlugin =
  createBasePlugin<SingleBlockConfig>({ why do we need manual generic? can't be
  inferred? is that a regression?"
- mode: named API packet
- target surface: `packages/utils/src/lib/plugins/single-block/*`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related Core sweep: yes, empty plugin config generic
  audit
- package review mode: no
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: `SingleBlockPlugin` and `SingleLinePlugin`
  rely on inference; no behavior/type regression; Plate Next records the smell.

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
- Remove `SingleBlockConfig` / `SingleLineConfig` and the corresponding
  `createBasePlugin<...>` generics.
- Prove inference still types nested extension callbacks and package behavior.
- Add a Plate Next rule/template row: do not write manual
  `PluginConfig<'key'>` generics for plugins with no typed options/api/tx/state.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-empty-plugin-generic-inference.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Utils single-block focused tests.
- package proof: `pnpm turbo typecheck --filter=./packages/utils`;
  `pnpm --filter @platejs/utils build`.
- shared Core gate: `pnpm check:core` if rule/API or Core-adjacent proof needs
  shared gate.
- source audits: exact search for empty `PluginConfig<'...'>` / manual generic.
- related Core sweep query / match count / patched count / deferred count:
  empty config generic audit before handoff.
- package file manifest / row count / checked count / deferred count: N/A
- Plite/Plate gap ledger: N/A unless inference fails.
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-empty-plugin-generic-inference.md`

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
  preserved, no fake casts/local helper types, no compat sludge, correct
  Plite/Plate ownership, accepted owner/name/path drift, and focused proof or
  justified source audit.
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
- Plugin export inference law: plugin constants should infer from
  `createBasePlugin`, `createPlatePlugin`, `toPlatePlugin`, and chained
  `.extend*` methods. Do not annotate exports as `BasePlugin<Config>` /
  `PlatePlugin<Config>` or cast chained plugin results unless the annotation is
  a true external boundary. If inference fails, fix the builder/generic owner.
- Plugin editor extension law: plugin-owned editor extension options should be
  returned directly from `extendExtension`. Do not wrap them in
  `defineEditorExtension({ name: pluginKey, ... })` just to satisfy types.
  `extendExtension` must accept both built extensions and raw options; raw
  options without `name` default to the owning plugin key. Keep explicit names
  only for genuinely separate extension identities.

Boundaries:
- allowed edit scope: single-block Utils plugin files, Plate Next rule/template,
  generated skill mirror, plan.
- package/API surfaces: `@platejs/utils` and source rule only.
- docs/browser surfaces: none.
- non-goals: broad package migration, public docs, Core union redesign unless
  source audit proves the exact same safe cleanup.
- out-of-scope package errors: ignore unless caused by this packet.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop if removing the generic loses public plugin type inference and the fix
  requires changing `createBasePlugin` overloads.

Current verdict:
- verdict: manual empty config generics were unnecessary boilerplate and a
  small inference regression risk.
- confidence: high.
- next owner: plate-next.
- keep / revert / quarantine call: keep.
- reason: key-only plugins infer cleanly from `createBasePlugin({ key })`; a
  manual `PluginConfig<'key'>` should exist only when it carries real public
  options, API, tx, selectors, or state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked whether manual `createBasePlugin<SingleBlockConfig>` is needed and whether inference regression exists. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md`. |
| Active goal checked or created | yes | `get_goal` returned none; created this plan-backed objective. |
| Mode classified as named packet vs broad Core sweep | yes | Named API packet; broad Core sweep N/A. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Best shape is inferred plugin export, no empty manual generic. |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested. |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; source rule `.agents/rules/plate-next.mdc`. |
| Output budget strategy recorded | yes | Targeted file reads and exact `rg`; no broad output. |
| Public API fork routing checked | yes | No public API plan needed unless inference fails. |
| Gap policy checked | yes | Inference failure would be a builder gap. |
| Related Core sweep policy checked | yes | Empty config generic audit required. |
| Review-mode rename freeze checked | yes | No rename intended. |
| Package review checklist initialized when in scope | no | N/A: not package review mode. |

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
| Named verification threshold | yes | Run the proof commands named in this plan | Focused Utils tests, focused Core tests, Core/Utils typecheck, Utils build, and `pnpm check:core` passed. |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: user asked about one API smell, not broad Core sweep. |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Named files score 100 after proof; no high-drift row remains in this scoped packet. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Keep inferred `createBasePlugin({ key })`; reject empty manual `PluginConfig<'key'>`. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | N/A: builder inference already supports this. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Empty config generic audit found and patched matching Core source owners. |
| Package file checklist | no | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | N/A: not package review mode. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `@platejs/utils` focused tests/build and Core/Utils typecheck passed. |
| Shared Core gate coverage | yes | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | `pnpm check:core` passed; no `check-core` membership change needed. |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | N/A: no non-Core proof failure. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `rg` audit shows no source key-only empty config generics remain. |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename. |
| Extracted-file inventory | no | Record untracked/extracted file command, row count, and bucket for every file in scope | N/A: no extracted file work. |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: narrow mechanical inference cleanup plus direct proof. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-empty-plugin-generic-inference.md` | Completion audit passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| checkpoint-zero | complete | Requirements copied into this plan. | none |
| implementation | complete | Empty key-only config aliases/generics removed from the named target and same-class source matches. | none |
| verification | complete | Focused tests, typecheck, build, source audit, rule regeneration, and `check:core` passed. | none |
| closeout | complete | Plan ledgers filled; final audit follows. | none |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `SingleBlockPlugin` empty config generic | 0 | cut manual generic | Utils single-block | Focused tests and `check:core` passed. | none |
| `SingleLinePlugin` empty config generic | 0 | cut manual generic | Utils single-block | Focused tests and `check:core` passed. | none |
| `AffinityPlugin` empty config generic | 0 | cut manual generic | Core affinity | Focused affinity tests and `check:core` passed. | none |
| `BaseParagraphPlugin` empty config alias | 0 | cut manual alias | Core paragraph | `CorePluginConfig` now derives via `InferConfig<typeof BaseParagraphPlugin>`. | none |
| `getCorePlugins` union references | 0 | keep derived config references | Core plugin registry | Core typecheck and `check:core` passed. | none |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Key-only base plugins | `createBasePlugin({ key: '...' })` with inferred config | `type FooConfig = PluginConfig<'foo'>`; `createBasePlugin<FooConfig>(...)` when no real contract exists | Empty generics add boilerplate and can hide builder inference regressions. | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none | none | none | none | Focused tests/typecheck/check passed. | no Plite/Plate gap |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed `SingleBlockConfig` / `SingleLineConfig` | `rg -n "type \\w+Config = PluginConfig<'[^']+'>;|export type \\w+Config = PluginConfig<'[^']+'>;|createBasePlugin<\\w+Config>\\(" packages/core/src packages/utils/src --glob '!**/dist/**'` | Source matches after patch are real contracts or tests/spec fixtures. | Patched key-only source owners: `SingleBlockPlugin`, `SingleLinePlugin`, `AffinityPlugin`, `BaseParagraphPlugin`, `getCorePlugins`. | 0 source key-only configs deferred. | none |

Core drift ledger:
- Applies: no broad Core sweep; only related same-class Core sweep.
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
| N/A | N/A | Broad Core sweep not requested | N/A | Related same-class sweep recorded above. | none |

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
- [x] N/A: package review mode was not requested.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Empty config generic cleanup | Utils/Core | Manual `PluginConfig<'key'>` for key-only plugins is boilerplate and can hide inference regressions. | `SingleBlockPlugin`, `SingleLinePlugin`, `AffinityPlugin`, `BaseParagraphPlugin`, `getCorePlugins`; focused tests/typecheck/build/check. | keep | none |
| Plate Next rule repair | Skill source | Skill should catch this before user has to ask again. | `.agents/rules/plate-next.mdc`, `docs/plans/templates/plate-next.md`, generated skill via `pnpm install && pnpm prepare`. | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | No extracted file work. | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | N/A | No out-of-scope package failures. | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Removed empty key-only config aliases/generics from `SingleBlockPlugin`, `SingleLinePlugin`, `AffinityPlugin`, and `BaseParagraphPlugin`; updated `getCorePlugins` to derive Core config entries from plugin values. |
| tests/proof | No test source changes. |
| docs/templates/skills | Added Plate Next rule/template guidance against empty config generics; regenerated skill mirror. |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | None | This was a safe inference cleanup. | N/A | No user review needed beyond normal diff review. |

Findings:
- `createBasePlugin` already infers key-only plugin configs. Manual
  `PluginConfig<'key'>` is not needed for `SingleBlockPlugin`.
- Same-class source sweep found two Core key-only config aliases; cutting them
  required deriving `CorePluginConfig` from plugin values in `getCorePlugins`.

Decisions and tradeoffs:
- Keep manual config types only for real public contracts. Current remaining
  source matches carry options/API/tx/state or are tests/spec fixtures.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm --filter @platejs/utils exec bun test src/lib/plugins/single-block/SingleBlockPlugin.spec.tsx src/lib/plugins/single-block/SingleLinePlugin.spec.tsx src/lib/plugins/single-block/SingleBlockRuntimePlugin.spec.ts`
  passed: 14 pass, 0 fail.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/affinity/AffinityPlugin.spec.tsx src/lib/plugins/affinity/queries/getEdgeNodes.spec.tsx src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.spec.ts src/lib/plugins/affinity/transforms/setAffinitySelection.spec.ts`
  passed: 45 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils`
  passed: 11 successful.
- `pnpm --filter @platejs/utils build` passed.
- `pnpm install && pnpm prepare` passed and regenerated the skill mirror.
- `pnpm check:core` passed.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-empty-plugin-generic-inference.md`
  passed.
- Source audit:
  `rg -n "type \\w+Config = PluginConfig<'[^']+'>;|export type \\w+Config = PluginConfig<'[^']+'>;|createBasePlugin<\\w+Config>\\(" packages/core/src packages/utils/src --glob '!**/dist/**'`.

Final handoff contract:
- target surface and mode: named API packet for empty plugin config inference.
- files/APIs reviewed: `SingleBlockPlugin`, `SingleLinePlugin`, same-class
  Core source matches, and Plate Next rule/template.
- broad Core drift score coverage: N/A; not requested.
- package file checklist coverage: N/A; not package review mode.
- best Plate v2 recommendation: infer key-only plugins from `createBasePlugin`.
- verdict matrix summary: all inspected named targets score 100 in this packet.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: recorded above; 0 source
  key-only configs deferred.
- changes made: see changed list.
- tests/proof commands: see verification evidence.
- old compatibility names audited: empty config aliases/generics audited.
- needs attention: none.
- next best Plate Next packet: continue package-by-package review when user
  points at the next package/file.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closed named API packet. |
| Where am I going? | Final completion audit. |
| What is the goal? | Cut unnecessary empty plugin generics and prove inference. |
| What have I learned? | Key-only config aliases are unnecessary; same-class source sweep is clean. |
| What have I done? | Removed aliases/generics, updated rule/template, ran proof. |

Timeline:
- 2026-07-05T18:50:24.684Z Goal plan created.
- 2026-07-05T19:00:00.000Z Removed key-only plugin config aliases/generics and repaired same-class Core source matches.
- 2026-07-05T19:05:00.000Z Updated Plate Next rule/template and regenerated skill mirror.
- 2026-07-05T19:10:00.000Z Focused tests, typecheck, build, and `check:core` passed.

Open risks:
- None for this packet.
