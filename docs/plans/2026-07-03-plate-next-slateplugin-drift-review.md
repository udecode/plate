# plate-next SlatePlugin drift review

Objective:
Deep review `packages/core/src/lib/plugin/SlatePlugin.ts` against `origin/main`
owners; done when drift/type risks are fixed or explicitly owned and Core proof
passes.

Goal plan:
docs/plans/2026-07-03-plate-next-slateplugin-drift-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked whether
  `packages/core/src/lib/plugin/SlatePlugin.ts` has 0 drift regression vs main
  and is fully clean, using `plate-next`.
- mode: named file/API review packet, not broad Core sweep.
- target surface: `packages/core/src/lib/plugin/SlatePlugin.ts` and direct
  public type/caller surface.
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; the prompt names one file and does not say sweep/all
  core/full-loop.
- correction-triggered related Core sweep: yes, only for smells corrected in
  this packet.
- completion threshold summary: every inspected type/helper in
  `SlatePlugin.ts` has a verdict, no accepted compat/legacy drift remains in
  this file, direct callers/source audits are checked, and focused Core proof
  passes.

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A, no duration requested.
- semantics: N/A.
- initial confidence score: N/A; named-file review uses verdict rows and proof.
- improvement loop: N/A.
- final score / loop closure: N/A.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Named `SlatePlugin` drift review | complete | source map, `ExtendConfig` fix, type contract, legacy audit, typecheck, focused tests, and lint passed |
| Second-pass proof replay | complete | fresh Core typecheck exposed `shortcuts.spec.tsx` handler inference leak from external `@platejs/basic-nodes` dist declarations; test now uses a local typed Core plugin; Core typecheck passed |
| Third-pass repeated review | complete | re-read target and `origin/main`, checked export-name mapping, strict legacy audit, extracted-file inventory, Core typecheck, focused tests, and lint; no new patch needed |

Completion threshold:
- Exact done state: `SlatePlugin.ts` reviewed against current Plite/Plate
  boundary and `origin/main` owner evidence; safe type/compat fixes applied;
  no untracked extracted files in this target scope; focused Core type/test/lint
  proof passes; final answer states whether it is clean and what changed.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-slateplugin-drift-review.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Core plugin type tests and package tests relevant to
  plugin authoring; exact commands recorded after execution.
- package proof: `pnpm --filter @platejs/core typecheck`,
  `pnpm --filter @platejs/core exec bun test ...`, and
  `pnpm --filter @platejs/core lint` unless no code change is made.
- source audits: `origin/main` comparison, direct caller searches, legacy
  symbol audit, extracted-file inventory.
- related Core sweep query / match count / patched count / deferred count:
  recorded after any correction.
- Plite/Plate gap ledger: record N/A unless review finds a true owner gap.
- broad Core drift ledger gate: N/A, not a broad Core sweep.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-slateplugin-drift-review.md`

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
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.

Boundaries:
- allowed edit scope: `packages/core/src/lib/plugin/SlatePlugin.ts`, direct
  type tests/callers if needed, and this plan.
- package/API surfaces: Core plugin config/type surface only.
- docs/browser surfaces: N/A; no docs or visible browser surface in this
  named type review.
- non-goals: no file renames, no broad Core sweep, no package migration, no
  legacy compatibility restoration.
- out-of-scope package errors: ignore unless caused by Core public API changes
  in this packet.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if a clean fix requires a public API fork broader than this file or
  a Plite/Plate owner gap that needs `plate-plan` / `plite-plan`.

Current verdict:
- verdict: main-parity-cleanup kept with one type-order bug fixed.
- confidence: scoped clean after proof.
- next owner: plate-next
- keep / revert / quarantine call: keep.
- reason: `ExtendConfig` generic order had regressed from the accepted
  PluginConfig order and could route selectors into tx; patch restores order and
  adds a type contract.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target file, scope, success criteria, non-goals, and proof surface recorded above. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md` plus `VISION.md`, `docs/vision/plate.md`, `docs/vision/common.md`. |
| Active goal checked or created | N/A | File plan created per repo autogoal workflow; no lifecycle tool mutation needed for this scoped review. |
| Mode classified as named packet vs broad Core sweep | yes | Named file/API packet; broad Core sweep N/A. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Completion threshold and constraints record Plite-fit, no legacy compat. |
| Broad Core drift ledger initialized when in scope | N/A | Not in scope. |
| Source of truth and allowed workspace recorded | yes | Current checkout `/Users/zbeyens/git/plate-2`; `origin/main` used as evidence. |
| Output budget strategy recorded | yes | Targeted `sed`/`rg` reads and capped output. |
| Public API fork routing checked | yes | Any broader public API fork routes out; none accepted before review. |
| Gap policy checked | yes | Gap ledger section in plan. |
| Related Core sweep policy checked | yes | Correction-triggered sweep required and recorded if a correction is made. |
| Review-mode rename freeze checked | yes | No active rename pass; keep current paths/names. |

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
| Named verification threshold | yes | Run the proof commands named in this plan | `pnpm --filter @platejs/core typecheck` passed; focused plugin/tests passed; lint passed. |
| Broad Core drift ledger coverage | N/A | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | Named-file packet only. |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Only score 2 row was `ExtendConfig` generic order; fixed and proved. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Keep `SlatePlugin.ts` as current type owner for review mode; fix tx/selectors order; do not restore old transforms. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | N/A: no Plite/Plate primitive gap blocked this file. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | `rg` audits recorded below. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Core typecheck, focused tests, lint passed. |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | Broader turbo check hit unrelated Core declaration-build DOM export leak; recorded below and not blocking this named-file review. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Legacy names audit returned no matches in target Core plugin/type-test scope. |
| Rename ledger | N/A | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | No rename proposed. |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | `git ls-files --others --exclude-standard packages/core/src/lib/plugin packages/core/type-tests \| sort` returned 0 rows. |
| Autoreview / review | N/A | Run review gate for non-trivial implementation diffs or record N/A | Scoped type-order fix with focused proof; no separate autoreview needed. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm --filter @platejs/core lint` passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-slateplugin-drift-review.md` | Passed. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugin/SlatePlugin.ts` overall | 1 | main-parity-cleanup | Core plugin typing | Old Slate runtime plugin members live in current `BasePlugin.ts` / `PlatePlugin.ts`; this file is now the base config/type carrier. No legacy `transforms`/`@platejs/slate` hits in target audit. | keep |
| `ExtendConfig` | 2 -> 0 | main-parity-cleanup | Core plugin typing | Generic order incorrectly put `ES` before `ETx`; callers pass options/API/tx/selectors. Fixed to `EO, EA, ETx, ES, EState` and added type proof. | keep |
| `InferTxFromExtensions` | 1 -> 0 | hard-cut | Core plugin typing | `rg -n "InferTxFromExtensions" ...` found only the definition. Removed unused export. | keep cut |
| `packages/core/src/react/utils/shortcuts.spec.tsx` handler typing | 2 -> 0 | source-first test cleanup | Core strict test typing | `pnpm --filter @platejs/core typecheck` exposed implicit `any` in `handlers.onKeyDown` because the test imported `@platejs/basic-nodes/react` built declarations whose plugin config still widens to `any`. Replaced with a local typed Core plugin so the handler stays contextually typed without annotations. | keep |
| `AnyPluginConfig` broad fields | 1 | keep-in-plate | Core plugin typing | Existing migration plans record broad carrier hardening was rejected by typecheck; this run did not reopen that broad type redesign. | defer-with-owner only if a dedicated plugin-carrier redesign is requested |
| Old React Slate export names | 0 | hard-cut | Plate/React plugin typing | `comm` export-name comparison shows old names like `SlatePlugin`, `SlatePluginMethods`, `SlateShortcut`, `OverrideEditor`, and `NormalizeInitialValue` are absent from the current combined base/react plugin owners. This is accepted hard-cut behavior, not drift to restore. | keep cut |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `SlatePlugin.ts` type owner | Keep current owner/name during review mode; fix real type drift only. | Do not restore old `transforms`/`SlatePlugin` runtime API; do not rename file in this packet. | Old runtime API is intentionally split across current base/react plugin owners; rename churn is forbidden in review mode. | Low |
| `ExtendConfig` | Mirror `PluginConfig` generic order: options, api, tx, selectors, state. | Do not keep selectors-before-tx; do not add compat overloads. | Existing call sites such as link/toggle/media pass the fifth slot as selectors. | None |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No gap found | No local workaround needed | N/A | N/A | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| `ExtendConfig` generic order | `rg -n "ExtendConfig<" packages/*/src packages/core/type-tests --glob '!**/dist/**'` | 8 definition/caller/test hits | 1 type owner plus 1 type-test proof | 0 | Callers remain intentionally using `ExtendConfig`; no further patch needed. |
| Removed unused `InferTxFromExtensions` | `rg -n "InferTxFromExtensions" packages/core/src packages/core/type-tests packages/*/src --glob '!**/dist/**'` | 0 after patch | 1 definition removed | 0 | none |
| Legacy plugin compat audit | `rg -n "normalizeInitialValue|InferTransforms|extendTransforms|getTransforms\\b|getPluginApi\\b|editor\\.tf\\b|plugin\\.transforms\\b|aboveSlate\\?:|@platejs/slate" packages/core/src/lib/plugin packages/core/type-tests --glob '!**/dist/**'` | 0 | 0 | 0 | none |
| Core strict test inference leak | `rg -n "@platejs/basic-nodes" packages/core/src packages/core/type-tests --glob '!**/dist/**'` | 1 before patch, 0 after patch | 1 test import replaced with local typed Core plugin | 0 | none |
| Repeated strict legacy audit | `rg -n "normalizeInitialValue|InferTransforms|transforms:|\\.transforms\\b|extendTransforms|getTransforms\\b|getPluginApi\\b|editor\\.tf\\b|plugin\\.transforms\\b|aboveSlate\\?:|@platejs/slate|InferTxFromExtensions|ExtendEditorTransforms|SlateShortcut|SlatePluginMethods|SlatePluginConfig|AnySlatePlugin|\\bEditorPlugin<" packages/core/src/lib/plugin packages/core/type-tests packages/core/src/react --glob '!**/dist/**'` | 0 | 0 | 0 | none |

Core drift ledger:
- Applies: N/A, named-file packet only.
- Manifest command: N/A.
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A.
- Actual row count: N/A.
- Missing row count: N/A.
- Extra row count: N/A.
- Score gate: N/A.
- Top drift rows: N/A.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | Broad Core sweep not requested. | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| `ExtendConfig` slot repair | Core plugin typing | selectors and tx generic slots were swapped after transform-to-tx migration | `SlatePlugin.ts`, `slate-plugin-contracts.ts`, Core typecheck/tests/lint | keep | no follow-up needed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | 0 untracked files in target scope | closed | `git ls-files --others --exclude-standard packages/core/src/lib/plugin packages/core/type-tests \| sort` returned no rows |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `pnpm turbo typecheck --filter=./packages/core --filter=./packages/link --filter=./packages/media --filter=./packages/toggle --filter=./packages/ai` | Core declaration build reports `DOMEditorClipboardCapability` from bundled `@platejs/plite-dom` marker declarations cannot be named. | This is DOM/plite-dom declaration-build debt, not `SlatePlugin.ts` plugin config drift. Core source/test/type-test proof passes after the strict-test fix. | Separate DOM declaration-build packet. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/core/src/lib/plugin/SlatePlugin.ts`: fixed `ExtendConfig` generic order and removed unused `InferTxFromExtensions`. |
| tests/proof | `packages/core/type-tests/slate-plugin-contracts.ts`: added full-slot `ExtendConfig` contract. `packages/core/src/react/utils/shortcuts.spec.tsx`: replaced cross-package basic-nodes import with a local typed Core plugin so strict handler inference is tested without package dist drift. |
| docs/templates/skills | `docs/plans/2026-07-03-plate-next-slateplugin-drift-review.md`: this review ledger. |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | File name still says `SlatePlugin.ts` | Review-mode rename freeze says do not churn names; this is only a later naming question. | `packages/core/src/lib/plugin/SlatePlugin.ts` | Keep for this packet; rename only in an explicit naming pass. |
| 2 | Broad `AnyPluginConfig` carrier remains | It is ugly but previously proven deliberate until a dedicated generic-carrier redesign. | `packages/core/src/lib/plugin/SlatePlugin.ts` | Do not tweak piecemeal. |

Findings:
- `ExtendConfig` was not fully clean before this pass: tx/selectors generic
  order was swapped for full generic callers.
- Fresh Core test typecheck also found a proof-lane issue in
  `shortcuts.spec.tsx`: handler context was not inferred because the test
  depended on stale/broad built declarations from `@platejs/basic-nodes/react`.
- No old `transforms`/`@platejs/slate` compat names remain in the target
  plugin/type-test scope.
- No extracted/untracked target-scope files remain.

Decisions and tradeoffs:
- Keep `SlatePlugin.ts` current owner/name for review mode; no rename pass.
- Fix `ExtendConfig` order rather than adding overloads or package-local
  workaround types.
- Leave broad `AnyPluginConfig` carrier redesign out of this packet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm turbo typecheck --filter=./packages/core --filter=./packages/link --filter=./packages/media --filter=./packages/toggle --filter=./packages/ai` hit Core declaration-build errors for `DOMEditorClipboardCapability` leaking from `@platejs/plite-dom` bundled marker declarations | 1 | Do not use this broad build-oriented command to close a named `SlatePlugin.ts` review; keep it for the DOM/plugin declaration owner packet. | Recorded as out-of-scope declaration-build debt. |
| `pnpm --filter @platejs/core typecheck` failed on `shortcuts.spec.tsx` implicit `any` for `{ editor, event }` | 1 | Fix the test owner/import coupling instead of annotating inferred handler args. | Replaced external basic-nodes plugin import with local typed Core plugin; Core typecheck passed. |

Verification evidence:
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/core exec bun test src/react/utils/shortcuts.spec.tsx src/react/plugin/toPlatePlugin.spec.ts src/lib/plugin/createBasePlugin.spec.ts src/lib/plugin/createBasePlugin.typed.spec.ts` passed, 44 tests.
- Repeated pass: `pnpm --filter @platejs/core exec bun test src/react/utils/shortcuts.spec.tsx src/react/plugin/toPlatePlugin.spec.ts src/lib/plugin/createBasePlugin.spec.ts src/lib/plugin/createBasePlugin.typed.spec.ts src/lib/plugin/getEditorPlugin.spec.ts` passed, 48 tests.
- `pnpm --filter @platejs/core lint` passed.
- `rg -n "InferTxFromExtensions|ExtendConfig<" packages/core/src packages/core/type-tests packages/ai/src packages/link/src packages/media/src packages/toggle/src --glob '!**/dist/**'` shows no `InferTxFromExtensions` and expected `ExtendConfig` callers/tests.
- Legacy symbol audit for old transforms/getters/Slate import names returned no matches in `packages/core/src/lib/plugin` and `packages/core/type-tests`.
- `rg -n "@platejs/basic-nodes" packages/core/src packages/core/type-tests --glob '!**/dist/**'` returned no matches after the strict-test fix.

Final handoff contract:
- target surface and mode: named-file review for `packages/core/src/lib/plugin/SlatePlugin.ts`.
- files/APIs reviewed: `SlatePlugin.ts`, `ExtendConfig`, `AnyPluginConfig`,
  direct `ExtendConfig` callers, type contract.
- broad Core drift score coverage: N/A, not requested.
- best Plate v2 recommendation: keep current owner/name in review mode; fixed
  `ExtendConfig` order; do not restore old Slate transform/plugin API.
- verdict matrix summary: one score-2 type regression fixed; no remaining
  blocking drift in this file.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: recorded in related sweep ledger.
- changes made: `ExtendConfig` order fix, dead `InferTxFromExtensions` cut,
  type contract added, Core shortcut test decoupled from basic-nodes package
  declarations.
- tests/proof commands: Core typecheck, focused plugin tests, Core lint.
- old compatibility names audited: yes, zero hits in target scope.
- needs attention: later naming / broad carrier redesign if user wants it; a
  separate DOM declaration-build packet should own the
  `DOMEditorClipboardCapability` name leak.
- next best Plate Next packet: continue one-by-one review of the next Core
  plugin type owner, likely `packages/core/src/react/plugin/PlatePlugin.ts` if
  not already accepted.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final handoff after mechanical plan check |
| What is the goal? | Deep review `SlatePlugin.ts`; fix/own drift and prove Core. |
| What have I learned? | `ExtendConfig` had a real generic-order regression; rest of target-scope compat audit is clean. |
| What have I done? | Fixed type order, removed one unused export, added type proof, ran Core proof. |

Timeline:
- 2026-07-03T20:22:19.758Z Goal plan created.
- 2026-07-03: Read `plate-next`, root/common/plate vision, target file, and
  `origin/main` evidence.
- 2026-07-03: Fixed `ExtendConfig` order, cut unused `InferTxFromExtensions`,
  and added type-test coverage.
- 2026-07-03: Ran Core typecheck, focused plugin tests, lint, source audits, and
  extracted-file inventory.

Open risks:
- None blocking this named-file review.
