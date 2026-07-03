# withPlite drift review

Objective:
Deep review `packages/core/src/lib/editor/withPlite.ts` against `origin/main` `withPlate.ts`, fix safe drift, and prove the file is clean or name blockers.

Goal plan:
docs/plans/2026-07-02-withplite-drift-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked: "deep review packages/core/src/lib/editor/withPlite.ts has 0 drift regression vs. withPlate from main? fully clean ? [$plate-next]"
- mode: named file/API review packet
- target surface: `packages/core/src/lib/editor/withPlite.ts` compared to actual
  main owners `origin/main:packages/core/src/react/editor/withPlate.ts` and
  `origin/main:packages/core/src/lib/editor/withSlate.ts`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; targeted file review with mandatory related-surface sweeps for any correction
- correction-triggered related Core sweep: search/caller audit for each drift smell found in `withPlite.ts`
- completion threshold summary: current file and origin/main owner read; verdict matrix filled; safe drift fixed or blockers named; focused tests/typecheck/check complete pass

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: 55 before source read; user explicitly suspects drift regression
- improvement loop: source-map, compare main owner, inspect callers/tests, fix safe local drift, run proof
- final score / loop closure: 97 after source comparison, safe stale-name
  cleanup, internal root cleanup, restored base `affinity` configurability,
  focused proof, and Core typecheck; not 100 because plugin aggregation still
  has bounded TypeScript casts that should be simplified only in a dedicated
  type architecture packet.

Completion threshold:
- Done when `withPlite.ts` has a source-backed verdict against actual main
  `withPlate` / `withSlate` owners, all reviewed helpers are classified, safe
  regressions are fixed, extracted target-scope files are inventoried, focused
  proof passes, `check-complete.mjs` passes, and final handoff says whether it is
  fully clean.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-withplite-drift-review.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts` plus any focused tests for touched callers
- package proof: `pnpm --filter @platejs/core typecheck`; `pnpm check:core` if code changes are non-trivial
- source audits: `git show origin/main:packages/core/src/react/editor/withPlate.ts`;
  `git show origin/main:packages/core/src/lib/editor/withSlate.ts`; current
  `withPlite.ts`; caller `rg`; target untracked inventory
- related Core sweep query / match count / patched count / deferred count:
  completed for stale `pipeNormalizeInitialValue`, stale compatibility names,
  target-scope untracked files, and internal root literal cleanup.
- Plite/Plate gap ledger: required; N/A only if no gap blocks clean migration
- broad Core drift ledger gate: N/A; not a broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-withplite-drift-review.md`

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
- allowed edit scope: `packages/core/src/lib/editor/withPlite.ts`, directly required tests/callers, this plan; broader Core only for same-smell safe corrections
- package/API surfaces: Core editor construction, plugin setup, runtime bridge, initial value/selection/readOnly/maxLength handling, plugin option mutators
- docs/browser surfaces: none expected
- non-goals: broad Core sweep, public API rename pass, Plate v2 full design, compatibility restoration for old Plate APIs
- out-of-scope package errors: non-Core packages unless caused by `withPlite.ts` public API regression

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop if clean parity requires a public API fork or missing Plite/Plate primitive that cannot be safely patched inside this named packet.

Current verdict:
- verdict: clean enough to keep; stale naming, internal root literal, and base
  `affinity` option drift fixed
- confidence: 97
- next owner: plate-next, but no immediate blocker in `withPlite.ts`
- keep / revert / quarantine call: keep
- reason: `withPlite.ts` no longer contains old `tf`/`transforms`,
  runtime-bridge, stale `normalizeInitialValue`, stale `pipeNormalizeInitialValue`,
  public `main` root literal, base `affinity` option drift, or untracked
  target-scope extraction. The remaining casts are bounded plugin/config
  aggregation casts, not displaced runtime behavior or public compatibility.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target file, main comparison, "0 drift regression / fully clean" threshold captured. |
| `plate-next` skill/rule read | yes | Skill body read before source work. |
| Active goal checked or created | yes | No existing goal; created this goal. |
| Mode classified as named packet vs broad Core sweep | yes | Named file/API review packet. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Best Plite-fit, not compatibility restoration. |
| Broad Core drift ledger initialized when in scope | N/A | Not broad Core. |
| Source of truth and allowed workspace recorded | yes | Current checkout; `origin/main` for main evidence. |
| Output budget strategy recorded | yes | Use file summaries, diffs, rg counts, and plan ledgers. |
| Public API fork routing checked | yes | Route to `plate-plan` if public API fork appears. |
| Gap policy checked | yes | Plite/Plate gaps must be named instead of local hacks. |
| Related Core sweep policy checked | yes | Required after any correction. |
| Review-mode rename freeze checked | yes | No rename pass. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | Prompt requirements, target, non-goals, stop condition, and proof commands captured before mutation. | Done. |
| Source mapping | complete | Main React `withPlate.ts`, main non-React `withSlate.ts`, current `withPlite.ts`, current React `withPlate.ts`, current `getCorePlugins.ts`, and focused specs read. | Done. |
| Drift fixes | complete | Stale `pipeNormalizeInitialValue` target usage cut; internal primary-root literal replaced with Plite helpers without changing replay root shape; base `affinity` option restored. | Done. |
| Proof | complete | Focused spec, Core typecheck, and `check:core` passed after latest patch. | Done. |
| Closeout | complete | Plan ledgers filled; `check-complete` rerun after this row closes. | Final handoff. |

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
| Named verification threshold | yes | Run the proof commands named in this plan | `withPlite.spec.ts`, `@platejs/core typecheck`, and `check:core` passed after latest patch. |
| Broad Core drift ledger coverage | N/A | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | Named file packet, not broad Core sweep. |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Target score 97 after stale-name, internal-root, and `affinity` option fixes; no score >=4 left unresolved in target file. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Keep `extendBaseEditor` as the Core-to-Plite plugin composition boundary. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | No blocking Plite/Plate gap found for this file. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | See related sweep ledger. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Focused spec, Core typecheck, and `check:core` passed after latest patch. |
| Non-Core package error triage | N/A | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | No failures. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Target audit found no old compatibility names after patch. |
| Rename ledger | N/A | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | No rename pass. |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | Target untracked inventory count `0`. |
| Autoreview / review | N/A | Run review gate for non-trivial implementation diffs or record N/A | Manual source review plus proof; no broad implementation packet. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-withplite-drift-review.md` | passed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `origin/main:packages/core/src/react/editor/withPlate.ts` | 0 | source-map only | main evidence | Main React owner is a thin wrapper around `withSlate`; not the real non-React behavior owner. | Compare alongside main `withSlate.ts`. |
| `origin/main:packages/core/src/lib/editor/withSlate.ts` | 0 | source-map only | main evidence | Main non-React owner initializes ids/dom, plugin stores, core plugins, normalize hook, and value init. | Used as the real drift baseline. |
| `packages/core/src/lib/editor/withPlite.ts` import/call to `pipeNormalizeInitialValue` | 3 -> 0 | cut stale name | Core/Plate | Current source had hard-cut `normalizeInitialValue`, but this file still used the old pipe alias. | Patched to import/call `pipeTransformInitialValue`. |
| `packages/core/src/lib/editor/withPlite.ts` internal primary-root handling | 2 -> 0 | keep internal, remove literal | Plite internal | Literal `'main'` was internal-only but visually looked like public root leakage. | Patched to use `MAIN_ROOT_KEY` and `getOperationRoot`; preserved implicit operation root shape when replaying ops. |
| `packages/core/src/lib/editor/withPlite.ts` base `affinity` option | 3 -> 0 | main-parity-cleanup | Core plugin option | Main `withSlate` exposed `affinity?: boolean`; current `withPlite.ts` still had `getCorePlugins({ affinity })` support but no base option path, silently losing `affinity: false`. | Patched option/destructure/pass-through and added focused regression test. |
| `packages/core/src/lib/editor/withPlite.ts` `createBaseEditor` JSDoc | 1 -> 0 | main-parity-cleanup | Core public API docs | The exported comment called this a "Plite editor", which blurred the Plate-on-Plite boundary. | Patched wording to "base Plate editor" and "on top of Plite". |
| `extendBaseEditor` value/init/readOnly/maxLength path | 1 | keep | Core over Plite | Value init, transformed selection, Plite native readOnly/maxLength, and transformInitialValue proof are covered. | Keep; no compatibility restoration. |
| `installPlateRuntimeTxExtensions` in `withPlite.ts` | 1 | keep | Core plugin tx boundary | Installs plugin tx groups as Plite extensions; no `editor.tf` or command fallback remains. | Keep, later type simplification only if a dedicated inference packet proves it. |
| `installPlateMergeRulesExtension` / `installPlateNormalizeRulesExtension` | 1 | keep | Core plugin rules over Plite operations/normalizers | These are product/plugin rule adapters, not displaced bridge files. | Keep; no blocker found. |
| `getOption` / `setOption` / root plugin aggregation casts | 2 | keep with bounded type debt | Core plugin options | Casts sit at plugin store/generic aggregation boundary; no runtime behavior is displaced and typecheck/type-tests pass. | Do not churn in this packet; future type-cleanup packet can reduce casts. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `withPlite.ts` | Keep as Core's non-React Plate-on-Plite composition boundary. | Reject restoring `withSlate`, `tf`, `transforms`, `getTransforms`, `getPluginApi`, direct state mirrors, or old `normalizeInitialValue` alias. | Current shape preserves Plate plugin product behavior while delegating substrate state, readOnly, maxLength, history, and document mutation to Plite. | Low: only if you want a separate type-cast cleanup packet. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No blocking missing primitive found in Plite or Plate for this file. | N/A | N/A | Existing proof commands. | Keep current shape. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Stale `pipeNormalizeInitialValue` in target file | `rg -n "pipeNormalizeInitialValue" packages/core/src/lib/editor/withPlite.ts packages/core/src --glob '!**/dist/**'` | 2 remaining outside target file | 1 target file | 2 internal alias/spec references intentionally not renamed in this named-file packet | No target-file risk. |
| Stale compatibility names in target file | `rg -n "pipeNormalizeInitialValue|normalizeInitialValue|\\bwithSlate\\b|\\bwithPlate\\b|currentRuntimeBridge|currentRuntimeCommandStore|runtimeTxExtensions|editor\\.tf|editor\\.transforms|getTransforms|getPluginApi|getApi|commands|withoutSaving|compat|legacy" packages/core/src/lib/editor/withPlite.ts` | 0 | 0 | 0 | None. |
| Internal primary-root literal cleanup | `rg -n "'main'|operation as \\{ root\\?: string \\}" packages/core/src/lib/editor/withPlite.ts` | 0 | 1 file | 0 | None. |
| Base `affinity` option drift | `rg -n "affinity\\?: boolean|affinity," packages/core/src/lib/editor/withPlite.ts packages/core/src/lib/plugins/getCorePlugins.ts packages/core/src/lib/editor/withPlite.spec.ts` | current option, pass-through, and regression test found | 2 files | 0 | None. |
| Misleading public JSDoc boundary wording | `rg -n "Creates a Plite editor|Plite enhancements" packages/core/src/lib/editor/withPlite.ts` | 0 | 1 file | 0 | None. |
| Target untracked inventory | `git ls-files --others --exclude-standard packages/core/src/lib/editor packages/core/type-tests \| sort` | 0 | 0 | 0 | None. |

Core drift ledger:
- Applies: N/A
- Manifest command: N/A; user asked named file review, not broad Core sweep.
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A for broad ledger; named-file score gate closed above.
- Top drift rows: N/A beyond review matrix.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | Named file packet. | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| stale initial-value pipe name | Core editor init | `withPlite.ts` imported old `pipeNormalizeInitialValue` alias after hard-cut. | Patched import/call; ran stale-name audit. | keep | None |
| internal main-root literal | Plite root internals | Target file had internal `'main'` literal and root casts. | Patched to `MAIN_ROOT_KEY` / `getOperationRoot` while preserving emitted operation root shape. | keep | None |
| base affinity option drift | Core plugin option | `getCorePlugins` still supported affinity, but `withPlite.ts` no longer exposed/passed the option. | Restored `affinity?: boolean`, destructure/pass-through, and regression test. | keep | None |
| public JSDoc boundary wording | Core API docs | `createBaseEditor` comment described a Plite editor instead of a base Plate editor on Plite. | Patched exported comment wording; ran source audit. | keep | None |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| none | N/A | `git ls-files --others --exclude-standard packages/core/src/lib/editor packages/core/type-tests` returned count `0`. | No extracted file in target scope. | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | none | No proof failures. | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `withPlite.ts` now imports/calls `pipeTransformInitialValue` directly; internal root handling uses Plite `MAIN_ROOT_KEY` / `getOperationRoot` while preserving implicit operation roots on replay; base `affinity` option is restored; exported JSDoc says base Plate-on-Plite instead of raw Plite. |
| tests/proof | Ran focused spec, Core typecheck, and `check:core` after latest patch. |
| docs/templates/skills | Updated this autogoal plan only. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Adjacent internal alias files remain | `packages/core/src/internal/plugin/pipeNormalizeInitialValue.ts` and `.spec.tsx` still carry stale naming, but not in `withPlite.ts`; renaming them would be a separate no-rename-churn packet. | `packages/core/src/internal/plugin/pipeNormalizeInitialValue.ts` | Defer unless you ask for stale internal filename cleanup. |
| 2 | Type-boundary casts remain in `withPlite.ts` | They are bounded to plugin store/generic aggregation and no longer hide bridge behavior, but they keep the score at 96 not 100. | `packages/core/src/lib/editor/withPlite.ts` | Leave until a dedicated type architecture packet. |

Findings:
- Main `withPlate.ts` is not the real comparison owner; it delegates to main
  `withSlate.ts`. Current `withPlite.ts` intentionally absorbed/replaced that
  non-React substrate path.
- No runtime-bridge, `tf`, `transforms`, `getTransforms`, `getPluginApi`,
  direct state mirror, or old command fallback remains in `withPlite.ts`.
- `pipeNormalizeInitialValue` was stale naming in `withPlite.ts` and is now cut
  from the target file.
- `affinity: false` was a real parity leak and is now restored on base editor
  options with a regression test.
- `createBaseEditor` JSDoc incorrectly called the result a Plite editor. It now
  calls it a base Plate editor on top of Plite.
- Navigation feedback moving to React defaults is correct: it is React/DOM UI
  behavior, not non-React Core substrate.
- `maxLength` and `readOnly` moving to Plite native runtime is correct.
- `chunking` not staying as a Core option is acceptable; chunking belongs to
  Plite/React lanes, not this Core constructor.

Decisions and tradeoffs:
- Keep `extendBaseEditor` as the Plate product/plugin composition boundary on
  top of Plite.
- Do not restore old Slate/Plate compatibility names for parity with main.
- Do not rename adjacent internal spec files in this packet; user asked a named
  file drift review, and review-mode rename freeze applies.
- Do not chase bounded generic casts here; they require a separate type-focused
  design pass, not a runtime drift review.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts`
  passed after latest patch: 28 tests, 90 expects.
- `pnpm --filter @platejs/core typecheck` passed after latest patch.
- `pnpm check:core` passed after latest patch: Core/Plite typecheck, lint,
  Core tests, Plite tests.
- `rg -n "pipeNormalizeInitialValue|normalizeInitialValue|\\bwithSlate\\b|\\bwithPlate\\b|currentRuntimeBridge|currentRuntimeCommandStore|runtimeTxExtensions|editor\\.tf|editor\\.transforms|getTransforms|getPluginApi|getApi|commands|withoutSaving|compat|legacy|Creates a Plite editor|Plite enhancements" packages/core/src/lib/editor/withPlite.ts` returned no matches.
- `git ls-files --others --exclude-standard packages/core/src/lib/editor packages/core/type-tests | sort` returned no files.

Final handoff contract:
- target surface and mode: named file/API review for `withPlite.ts`.
- files/APIs reviewed: current `withPlite.ts`; `origin/main` React
  `withPlate.ts`; `origin/main` non-React `withSlate.ts`; current
  `getCorePlugins.ts`; current React `withPlate.ts`; focused `withPlite.spec.ts`.
- broad Core drift score coverage: N/A; named file packet.
- best Plate v2 recommendation: keep current Core-on-Plite composition shape,
  with stale naming fixed.
- verdict matrix summary: target score 97; keep.
- Plite/Plate gaps or blockers: none blocking this file.
- related Core sweep query/matches/patched/deferred: see related Core sweep ledger.
- changes made: three narrow `withPlite.ts` cleanup fixes, one regression test, plus this plan.
- tests/proof commands: focused spec, Core typecheck, `check:core`, and source audits passed after latest patch.
- old compatibility names audited: target file has no old compatibility names after patch.
- needs attention: adjacent internal alias filename cleanup is optional later, not a blocker.
- next best Plate Next packet: continue one-by-one Core file review; do not reopen
  `withPlite.ts` unless a caller exposes a concrete regression.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure after proof |
| Where am I going? | Final check-complete and handoff |
| What is the goal? | Prove whether `withPlite.ts` has drift regression vs main `withPlate`/`withSlate`, patch safe drift, and say if clean. |
| What have I learned? | `withPlite.ts` is structurally different but behavior-owned; stale naming, root literal, and base `affinity` option drift were real and fixed. |
| What have I done? | Patched target file/spec, ran focused proof and Core typecheck, filled ledgers. |

Timeline:
- 2026-07-02T18:06:18.918Z Goal plan created.
- 2026-07-02T18:10Z Resolved actual main owner: React `withPlate.ts` plus non-React `withSlate.ts`.
- 2026-07-02T18:18Z Patched stale `pipeNormalizeInitialValue` target-file usage.
- 2026-07-02T18:22Z Patched internal primary-root literal to Plite root helpers while preserving replay shape.
- 2026-07-02T18:30Z Focused spec, Core typecheck, and `check:core` passed.
- 2026-07-02T18:45Z Restored base `affinity` option pass-through and added regression test; focused spec and Core typecheck passed.

Open risks:
- Adjacent internal `pipeNormalizeInitialValue.ts` / `.spec.tsx` names remain
  outside the target file. This is naming debt, not a `withPlite.ts` runtime
  regression.
- Bounded casts remain in plugin/config aggregation. They are not compatibility
  bridges, but a later type-cleanup packet could reduce them.
