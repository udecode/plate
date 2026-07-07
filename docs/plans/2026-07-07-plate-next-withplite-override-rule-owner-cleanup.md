# plate-next withPlite override rule owner cleanup

Objective:
Clean `withPlite` override-rule ownership; restore break/delete behavior parity; prove Core stays green.

Goal plan:
docs/plans/2026-07-07-plate-next-withplite-override-rule-owner-cleanup.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user said `go` after review that `defineEditorExtension` rule bridges in `packages/core/src/lib/editor/withPlite.ts` are dirty and should move to `OverridePlugin`.
- mode: named file/API implementation packet, one-shot execution
- target surface: `packages/core/src/lib/editor/withPlite.ts` and `packages/core/src/lib/plugins/override/OverridePlugin.ts`
- review target: best Plate v2 migration on top of Plite, not legacy compatibility
- broad Core sweep: N/A: user asked to implement the reviewed `withPlite` cleanup, not sweep every Core file.
- correction-triggered related Core sweep: yes, search same-class `installPlate*RulesExtension`, `defineEditorExtension`, and `exit/deleteExit` rule handling after patch.
- package review mode: N/A: not a package review request.
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: rule extensions no longer live in `withPlite.ts`; `OverridePlugin` owns normalize/break/delete/merge runtime rules; `exit` / `deleteExit` behavior is restored; focused Core proof passes.

First checkpoint:
- [x] Target copied: `withPlite` rule-extension cleanup.
- [x] Scope copied: Core runtime/plugin implementation plus focused test/barrel/test-utils export needed by proof.
- [x] Non-goals copied: no broad Core sweep, no package-by-package migration, no renaming pass, no public API redesign.
- [x] Stop condition copied: stop only for a Plite/Plate gap that blocks expressing existing override behavior without a bridge.
- [x] Verification copied: focused override/withPlite tests, source audits, `pnpm brl`, and `pnpm check:core`.
- [x] Final handoff copied: changed list, sweeps, proof, gaps, needs attention, next owner.

Timed checkpoint:
- requested duration: N/A: no duration in this prompt.
- semantics: N/A: named implementation packet.
- initial confidence score: N/A: pass/fail threshold is stronger than a score.
- improvement loop: N/A: close after scoped proof.
- final score / loop closure: N/A: `pnpm check:core` is the closure gate.

Completion threshold:
- [x] `withPlite.ts` is reduced to bootstrap/installer orchestration and no longer defines normalize/break/delete/merge rule extensions.
- [x] `OverridePlugin` owns Plate override rule behavior with Plite-native extension implementation.
- [x] Existing typed rule actions in `SlatePlugin.ts` (`exit`, `deleteExit`, `lineBreak`, `lift`, `reset`, `none`) are implemented by the owner helper.
- [x] Named file/API work closes from a scoped source map and focused proof.
- [x] Broad Core sweep threshold is N/A because this was not a broad Core sweep.
- [x] Package review threshold is N/A because this was not package review mode.
- [x] Final mechanical gate is `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-07-plate-next-withplite-override-rule-owner-cleanup.md`.

Verification surface:
- focused tests: `pnpm --filter @platejs/core exec bun test src/lib/plugins/override/withBreakRules.spec.tsx src/lib/editor/withPlite.spec.ts` -> pass, 30 tests.
- package proof: `pnpm turbo typecheck --filter=./packages/core` -> pass.
- barrel proof: `pnpm brl` -> pass.
- shared Core gate: `pnpm check:core` -> pass.
- source audit: no leftover central `installPlate*RulesExtension` or `plate:*rules:plite` matches.
- related Core sweep query / match count / patched count / deferred count: recorded below.
- package file manifest / row count / checked count / deferred count: N/A.
- Plite/Plate gap ledger: N/A, no blocking Plite/Plate gap after moving owner logic.
- broad Core drift ledger gate: N/A.
- final plan check: run after this update.

Constraints:
- [x] Review mode targets the best Plate v2 shape: clean Plate product layer on top of Plite, no legacy compatibility goal.
- [x] Plate owns product composition; Plite owns editor substrate.
- [x] Core must not wrap Plite editor APIs under Plate names.
- [x] No public compat aliases, old Slate shims, or docs for old API names.
- [x] No local hacks: no bridge dump, helper dump, broad `any` cast, duplicated wrapper, command fallback, or fake alias kept in this packet.
- [x] Related Core sweep ran after correction.
- [x] Review-mode rename freeze applied: restored old `withBreakRules.spec.tsx` filename instead of keeping `.ts` drift.
- [x] Extracted-file recovery gate closed.
- [x] Private bridges are N/A: no private bridge added.
- [x] Broad Core/package review constraints are N/A.
- [x] Direct one-shot Plite API law respected for this packet. Remaining callback form in `withPlite.ts` is grouped tx-extension installation, not a one-line read/write wrapper.
- [x] Plugin export inference law respected for touched plugin constants.
- [x] Plugin editor extension law respected: `OverridePlugin.extendExtension(...)` owns raw extension helpers; `withPlite` keeps only the generic `plate-plugin-tx` Plite extension.

Boundaries:
- allowed edit scope: `packages/core/src/lib/editor/withPlite.ts`, `packages/core/src/lib/plugins/override/**`, focused tests/barrels, `packages/test-utils/src/jsx.ts`, and this goal plan.
- package/API surfaces: Core runtime/plugin implementation only.
- docs/browser surfaces: N/A, no docs or visible UI route.
- non-goals: no renaming pass, no full Core sweep, no package-by-package migration, no public API redesign beyond preserving already typed rule actions.
- out-of-scope package errors: none encountered.

Output budget strategy:
- Used targeted `sed`/`rg`; full command output was redirected for `pnpm check:core` and tailed.
- Large proof output is stored at `/tmp/plate2-check-core.log`.

Blocked condition:
- N/A: no blocker remained.

Current verdict:
- verdict: main-parity-cleanup
- confidence: 100 for this named packet.
- next owner: plate-next
- keep / revert / quarantine call: keep.
- reason: `origin/main` owner was `OverridePlugin` + rule helpers; current code now preserves that owner with Plite-native implementation and green Core proof.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint rows above are checked. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md`. |
| Active goal checked or created | yes | Continued active goal for this packet. |
| Mode classified as named packet vs broad Core sweep | yes | Named `withPlite`/`OverridePlugin` packet; broad Core sweep N/A. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Constraints and recommendation rows record it. |
| Broad Core drift ledger initialized when in scope | no | N/A: not a broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | Current checkout `/Users/zbeyens/git/plate-2`; `origin/main` used as ownership evidence. |
| Output budget strategy recorded | yes | Targeted searches plus `/tmp/plate2-check-core.log`. |
| Public API fork routing checked | yes | No public API fork; restored existing `BreakRules` actions. |
| Gap policy checked | yes | No gap after owner move. |
| Related Core sweep policy checked | yes | Sweep rows below. |
| Review-mode rename freeze checked | yes | Restored `.tsx` spec path. |
| Package review checklist initialized when in scope | no | N/A: no package review mode. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan before implementation.
- [x] Mode classified: named file/API packet.
- [x] Best Plate v2 call recorded for every reviewed target.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim, duplicate Plate wrapper around Plite, old command fallback, or old docs path kept.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake alias, or displaced product/plugin behavior kept as a shortcut.
- [x] Gap ledger updated: N/A, no blocker.
- [x] Related Core sweep row added with query, match count, patched count, deferred count, and remaining risk.
- [x] Broad Core sweep rows N/A: not broad Core sweep.
- [x] Package review rows N/A: not package review mode.
- [x] Direct one-shot API audit closed for touched files.
- [x] Plugin export inference audit closed for touched files.
- [x] Empty config inference audit closed for touched files.
- [x] Plugin extension options audit closed for touched files.
- [x] Bridge scoring law applied: no forbidden bridge added or imported.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are N/A.
- [x] Review-mode rename freeze applied.
- [x] Extracted-file recovery gate closed.
- [x] Safe cleanup packet kept with proof.
- [x] Focused package proof run after meaningful code changes.
- [x] `pnpm brl` run because exports/barrels changed.
- [x] Old compatibility names source-audited.
- [x] Changed list, top drift rows, needs-attention rows, and next owner filled.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run proof commands named in this plan | Focused tests pass; Core typecheck pass; `pnpm check:core` pass. |
| Broad Core drift ledger coverage | no | Record N/A reason | N/A: named packet, not broad Core sweep. |
| Score gate | yes | Prove target score valid | Score 100 for named packet after source audit and `pnpm check:core`. |
| Best Plate v2 recommendation | yes | Record recommended current shape and rejected alternatives | Recommendation table below. |
| Plite/Plate gap ledger | yes | Record blockers or N/A | N/A row below. |
| Related Core sweep after correction | yes | Record same-class Core search/review results | Sweep ledger below. |
| Package file checklist | no | Record N/A reason | N/A: no package review mode. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm turbo typecheck --filter=./packages/core`, focused tests, `pnpm brl`, `pnpm check:core`. |
| Shared Core gate coverage | yes | Run shared gate | `pnpm check:core` pass. |
| Non-Core package error triage | yes | Classify non-Core failures if any | No non-Core failures. |
| Source audit | yes | Run exact audit | Zero central installer matches; `deleteExit` owner/callers accounted. |
| Rename ledger | no | Update `pre-renaming.md` only if rename postponed | N/A: accidental `.ts` spec drift restored to origin/main `.tsx` path. |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket | Five files inventoried, all bucketed below. |
| Autoreview / review | yes | Run review gate or record equivalent | Plate Next self-review plus origin/main ownership check, related sweeps, and Core proof. |
| Final lint/check | yes | Run scoped check | `pnpm check:core` pass. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Rows below. |
| Goal plan complete | yes | Run final checker | Run after this plan update. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/editor/withPlite.ts` rule installers | 0 | main-parity-cleanup | Core editor bootstrap | Rule-specific normalize/break/delete/merge extension logic removed; only generic `plate-plugin-tx` extension remains. | Keep. |
| `packages/core/src/lib/plugins/override/OverridePlugin.ts` | 0 | main-parity-cleanup | OverridePlugin | Owns node schema behavior and extends break/delete/merge/normalize rule helpers. | Keep. |
| `packages/core/src/lib/plugins/override/withBreakRules.ts` | 0 | recover-main-owner | OverridePlugin rule helper | Restored origin/main owner path with Plite `transforms.insertBreak`; implements `exit` and `deleteExit`. | Keep. |
| `packages/core/src/lib/plugins/override/withDeleteRules.ts` | 0 | recover-main-owner | OverridePlugin rule helper | Restored origin/main owner path with Plite `transforms.deleteBackward`. | Keep. |
| `packages/core/src/lib/plugins/override/withMergeRules.ts` | 0 | recover-main-owner | OverridePlugin rule helper | Restored origin/main owner path with Plite `operations.apply` / query behavior. | Keep. |
| `packages/core/src/lib/plugins/override/withNormalizeRules.ts` | 0 | recover-main-owner | OverridePlugin rule helper | Restored origin/main owner path with Plite normalize hook. | Keep. |
| `packages/core/src/lib/plugins/override/withBreakRules.spec.tsx` | 0 | recover-main-owner | OverridePlugin proof | Restored origin/main spec filename and added `deleteExit` regression coverage. | Keep. |
| `packages/test-utils/src/jsx.ts` `TestEditor` export | 0 | justify-new-proof-tooling | test-utils | Core test typecheck needed source-owned `TestEditor` export rather than local fake fixture type. | Keep. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Override rules | Keep `OverridePlugin` owner and adjacent rule helpers; implement with Plite extension callbacks. | Central `installPlate*RulesExtension` functions in `withPlite.ts`; bridge dump; rename pass. | Product/plugin override behavior belongs with `OverridePlugin`; `withPlite` should bootstrap generic runtime concerns only. | Low: current diff follows the previously reviewed direction. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | N/A | N/A | N/A | N/A | No blocking Plite/Plate gap in this packet. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed central rule installers from `withPlite.ts` | `rg -n "installPlateBreakRulesExtension|installPlateDeleteRulesExtension|installPlateMergeRulesExtension|installPlateNormalizeRulesExtension|plate:break-rules:plite|plate:delete-rules:plite|plate:merge-rules:plite|plate:normalize-rules:plite" packages/core/src` | 0 | 0 | 0 | none |
| Moved rule helper ownership to `OverridePlugin` | `rg -n "defineEditorExtension\\(|withBreakRules|withDeleteRules|withMergeRules|withNormalizeRules" packages/core/src/lib/editor/withPlite.ts packages/core/src/lib/plugins/override` | 18 | 5 files kept under override; 1 generic `defineEditorExtension` kept in `withPlite` for tx extension | 0 | none |
| Restored `exit` / `deleteExit` behavior | `rg -n "deleteExit|emptyLineEnd|BreakRules|action === 'exit'|action === 'deleteExit'" packages/core/src/lib/plugins/override packages/core/src/lib/plugin/SlatePlugin.ts packages/basic-nodes/src packages/callout/src` | 27 | 1 regression test added under old spec path | 0 | none |

Core drift ledger:
- Applies: N/A: not a broad Core sweep.
- Manifest command: N/A
- Manifest owner: N/A
- Optional type-test owner: N/A
- Ledger location: N/A
- Expected row count: 0
- Actual row count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Top drift rows: none for this named packet.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | N/A | N/A | Not a broad Core sweep. | N/A |

Package file checklist:
- Applies: N/A
- Package: N/A
- Manifest command: N/A
- Expected row count: 0
- Actual row count: 0
- Checked score-100 count: 0
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Next package blocked until: N/A

Package file rows:
- [x] N/A: not package review mode.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Override rule owner cleanup | OverridePlugin | Rule extensions in `withPlite.ts` were migration sludge. | Override helpers, focused tests, `pnpm brl`, `pnpm check:core`. | keep | Continue Plate package review one package at a time. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/lib/plugins/override/withBreakRules.spec.tsx` | recover-main-owner | Exists on `origin/main` under same path. | Keep old path; add `deleteExit` coverage. | `git ls-tree -r --name-only origin/main packages/core/src/lib/plugins/override`; focused test pass. |
| `packages/core/src/lib/plugins/override/withBreakRules.ts` | recover-main-owner | Exists on `origin/main` under same path. | Keep old path; migrate implementation to Plite extension transform. | `pnpm check:core` pass. |
| `packages/core/src/lib/plugins/override/withDeleteRules.ts` | recover-main-owner | Exists on `origin/main` under same path. | Keep old path; migrate implementation to Plite extension transform. | `pnpm check:core` pass. |
| `packages/core/src/lib/plugins/override/withMergeRules.ts` | recover-main-owner | Exists on `origin/main` under same path. | Keep old path; migrate implementation to Plite operation/query hooks. | `pnpm check:core` pass. |
| `packages/core/src/lib/plugins/override/withNormalizeRules.ts` | recover-main-owner | Exists on `origin/main` under same path. | Keep old path; migrate implementation to Plite normalize hook. | `pnpm check:core` pass. |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none | no out-of-scope failures | N/A |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Owner cleanup packet | complete | Override rules moved to `OverridePlugin`; focused tests, `pnpm brl`, and `pnpm check:core` pass. | Close goal. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Moved normalize/break/delete/merge rule extension logic out of `withPlite.ts`; restored `OverridePlugin` as owner; added `withBreakRules.ts`, `withDeleteRules.ts`, `withMergeRules.ts`, `withNormalizeRules.ts`; exported override helpers in barrel. |
| tests/proof | Restored `withBreakRules.spec.tsx` path and added `deleteExit` regression; exported `TestEditor` from `packages/test-utils/src/jsx.ts` so Core tests use the source-owned fixture type. |
| docs/templates/skills | Updated this goal plan only. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Review `OverridePlugin` helper ownership once in diff | This is the main API/owner decision of the packet. | `packages/core/src/lib/plugins/override/OverridePlugin.ts` | Approve if you agree rule behavior should stay in old `override/` owner during review mode. |
| 2 | No broad Core sweep was run | User asked this specific packet, not all Core. | This plan | Run a separate `plate-next` broad sweep only when wanted. |

Findings:
- `origin/main` already had `override/with*Rules` files and specs; the clean fix is owner recovery, not a new runtime bridge.
- `withPlite.ts` still legitimately uses `defineEditorExtension` once for the generic `plate-plugin-tx` installer.

Decisions and tradeoffs:
- Moved rule behavior back under `OverridePlugin` -> preserves main owner/readability while using Plite extension hooks.
- Restored `withBreakRules.spec.tsx` instead of keeping `.ts` -> avoids Added/Deleted review noise.
- Kept helper files exported -> `pnpm brl` confirmed barrels.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First `check:core` after move failed on unused imports/format only. | 2 | Patch exact imports/format lines, rerun same gate. | Resolved; `pnpm check:core` passes. |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/override/withBreakRules.spec.tsx src/lib/editor/withPlite.spec.ts` -> pass, 30 tests.
- `pnpm turbo typecheck --filter=./packages/core` -> pass.
- `pnpm brl` -> pass.
- `pnpm check:core` -> pass.
- `rg` central installer audit -> 0 matches.
- `rg` extension owner audit -> 18 matches, all expected owner/helper references.
- `rg` break action audit -> 27 matches, typed actions and callout usage accounted.

Final handoff contract:
- target surface and mode: named Plate Next packet for `withPlite` / `OverridePlugin`.
- files/APIs reviewed: `withPlite.ts`, `OverridePlugin.ts`, override rule helpers/spec, `TestEditor` test-utils export.
- broad Core drift score coverage: N/A.
- package file checklist coverage: N/A.
- best Plate v2 recommendation: keep old `OverridePlugin` owner; no central rule installer in `withPlite`.
- verdict matrix summary: all reviewed rows score 0 drift / confidence 100 for this packet.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: recorded above.
- changes made: recorded above.
- tests/proof commands: recorded above.
- old compatibility names audited: central installer names audited to zero matches.
- needs attention: review `OverridePlugin` ownership in diff if desired.
- next best Plate Next packet: continue one-package review; do not broaden from this packet automatically.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closing the named `withPlite` override-rule owner packet. |
| Where am I going? | Run final plan checker and close the active goal. |
| What is the goal? | Rule extensions live under `OverridePlugin`, `deleteExit` parity is restored, Core proof passes. |
| What have I learned? | The old main owner paths exist; restoring them reduces review noise and removes `withPlite` sludge. |
| What have I done? | Moved rule behavior to override helpers, restored spec path, added regression proof, ran Core proof. |

Timeline:
- 2026-07-07T13:32:51.116Z Goal plan created.
- 2026-07-07T13:40Z Read `plate-next` and `autogoal` skill bodies after compaction; continued same active goal.
- 2026-07-07T13:43Z Restored old `withBreakRules.spec.tsx` path.
- 2026-07-07T13:44Z Focused override/withPlite tests passed.
- 2026-07-07T13:45Z Core typecheck passed.
- 2026-07-07T13:45Z `pnpm brl` passed.
- 2026-07-07T13:47Z First `check:core` run exposed only formatter/import cleanup.
- 2026-07-07T13:49Z Final `pnpm check:core` passed.
- 2026-07-07T13:50Z Source audits completed.

Open risks:
- None for this named packet.
