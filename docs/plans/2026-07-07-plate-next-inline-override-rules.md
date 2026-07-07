# plate-next inline override rules

Objective:
Inline OverridePlugin rule helpers; delete the split `with*Rules` helper files; preserve behavior and Core proof.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-07-plate-next-inline-override-rules.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user invoked `$plate-next` and said they do not like the `withBreakRules` split; move all those rule helpers into `OverridePlugin` inline in the plugin.
- mode: named Core file/API implementation packet.
- target surface: `packages/core/src/lib/plugins/override/OverridePlugin.ts` and split helper files under `packages/core/src/lib/plugins/override/with*Rules.ts`.
- review target: best Plate v2 migration on top of Plite, not legacy compatibility.
- broad Core sweep: N/A: user asked a specific cleanup, not full Core review.
- correction-triggered related Core sweep: yes, search for split helper imports/exports/files and extension owner drift after patch.
- package review mode: N/A.
- package review target: N/A.
- package file checklist gate: N/A.
- completion threshold summary: split `with*Rules` files gone, logic inline in `OverridePlugin.ts`, no helper exports, behavior proof and `pnpm check:core` pass.

First checkpoint:
- [x] Target: inline `withBreakRules` plus sibling `withDeleteRules`, `withMergeRules`, `withNormalizeRules` into `OverridePlugin`.
- [x] Scope boundary: Core override plugin files, focused spec/barrel cleanup, this goal plan.
- [x] Timing: no duration.
- [x] Stop condition: stop only if inlining exposes a real Plite/Plate gap that prevents behavior preservation without a hack.
- [x] Deliverables: changed list, proof commands, related sweep, gaps/needs attention.
- [x] Verification surface: focused override test, typecheck or `check:core`, `pnpm brl` if barrels change, source audit for removed helper files/exports.
- [x] Success criteria: no split helper files remain, `OverridePlugin.ts` owns rule behavior inline, no behavior regression.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- [x] `OverridePlugin.ts` contains the normalize/break/delete/merge rule implementation inline.
- [x] `withBreakRules.ts`, `withDeleteRules.ts`, `withMergeRules.ts`, and `withNormalizeRules.ts` are removed.
- [x] `override/index.ts` no longer exports removed helper files.
- [x] `deleteExit` proof still passes.
- [x] `pnpm brl` ran after barrel changes.
- [x] `pnpm check:core` passes.
- [x] `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-07-plate-next-inline-override-rules.md` is the final mechanical gate.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core exec bun test src/lib/plugins/override/OverridePlugin.spec.tsx src/lib/editor/withPlite.spec.ts` -> pass, 30 tests.
- package proof: `pnpm check:core` -> pass.
- shared Core gate: `pnpm check:core` -> pass.
- source audits: split helper symbol audit -> zero matches; override directory file audit -> only `OverridePlugin.ts`, `OverridePlugin.spec.tsx`, `index.ts`.
- related Core sweep query / match count / patched count / deferred count: recorded below.
- package file manifest / row count / checked count / deferred count: N/A.
- Plite/Plate gap ledger: N/A.
- broad Core drift ledger gate: N/A.
- final plan check: run after this plan update.

Constraints:
- [x] Review mode targets the best Plate v2 shape: clean Plate product layer on top of Plite, no legacy compatibility goal.
- [x] Plate owns product composition; Plite owns editor substrate.
- [x] No public compat aliases, old Slate shims, or docs for old API names.
- [x] No bridge/helper dump. In this packet, helper split itself was the smell.
- [x] No public plugin concept renamed.
- [x] Behavior preserved.
- [x] No Plite/Plate gap was hidden behind local workaround.
- [x] Related Core sweep ran.
- [x] Direct one-shot Plite API law respected for touched code.
- [x] Plugin export inference law respected.

Boundaries:
- allowed edit scope: `packages/core/src/lib/plugins/override/**`, barrels, focused tests, and this plan.
- package/API surfaces: Core override plugin implementation only.
- docs/browser surfaces: N/A.
- non-goals: broad Core sweep, package migration, public API redesign.
- out-of-scope package errors: none.

Output budget strategy:
- Used targeted `sed`/`rg`; redirected `pnpm check:core` to `/tmp/plate2-inline-override-check-core.log` and tailed it.

Blocked condition:
- N/A: no blocker remained.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint rows checked. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md`. |
| `autogoal` skill read | yes | Read `.agents/skills/autogoal/SKILL.md`. |
| Vision read | yes | Read `VISION.md`, `docs/vision/plate.md`, `docs/vision/common.md`. |
| Active goal checked or created | yes | Created active goal for this packet. |
| Mode classified | yes | Named Core file/API packet; broad Core sweep N/A. |
| Review target recorded | yes | Best Plate v2 / Plite-fit / no legacy compat. |
| Output budget strategy recorded | yes | Targeted reads, capped proof output. |
| Gap policy checked | yes | No gap after implementation. |
| Related Core sweep policy checked | yes | Sweep rows below. |
| Package review checklist initialized when in scope | no | N/A: no package review mode. |

Work Checklist:
- [x] First checkpoint complete.
- [x] Mode classified as named Core file/API packet.
- [x] Inline rule implementations into `OverridePlugin.ts`.
- [x] Delete split helper files.
- [x] Remove helper barrel exports/imports.
- [x] Preserve focused `deleteExit` behavior proof.
- [x] Run related Core sweeps and record counts.
- [x] Run proof commands.
- [x] Fill review matrix, gap ledger, extracted/deleted file decision, changed list, needs-attention rows.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused tests and Core proof | Focused tests pass; `pnpm check:core` pass. |
| Best Plate v2 recommendation | yes | Record current shape and rejected split-helper alternative | Recommendation table below. |
| Plite/Plate gap ledger | yes | Record blockers or N/A | N/A row below. |
| Related Core sweep after correction | yes | Record same-class search/review results | Sweep ledger below. |
| Package file checklist | no | N/A reason | N/A: not package review mode. |
| Package/API proof | yes | Run focused test and Core proof | Focused tests pass; `pnpm check:core` pass. |
| Source audit | yes | Audit removed helpers/imports/exports | Zero split-helper symbol matches. |
| `pnpm brl` | yes | Run because barrel exports change | `pnpm brl` pass. |
| Final lint/check | yes | Run `pnpm check:core` | pass. |
| Changed list / needs attention | yes | Fill handoff ledgers | Rows below. |
| Goal plan complete | yes | Run final checker | Run after this plan update. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/override/OverridePlugin.ts` | 0 | main-parity-cleanup | OverridePlugin | Inline break/delete/merge/normalize rule logic; focused tests and Core gate pass. | Keep. |
| `packages/core/src/lib/plugins/override/withBreakRules.ts` | 0 | merge-existing-owner | OverridePlugin | Deleted; logic merged into owner. | Keep deleted. |
| `packages/core/src/lib/plugins/override/withDeleteRules.ts` | 0 | merge-existing-owner | OverridePlugin | Deleted; logic merged into owner. | Keep deleted. |
| `packages/core/src/lib/plugins/override/withMergeRules.ts` | 0 | merge-existing-owner | OverridePlugin | Deleted; logic merged into owner. | Keep deleted. |
| `packages/core/src/lib/plugins/override/withNormalizeRules.ts` | 0 | merge-existing-owner | OverridePlugin | Deleted; logic merged into owner. | Keep deleted. |
| `packages/core/src/lib/plugins/override/OverridePlugin.spec.tsx` | 0 | justify-new-proof-tooling | OverridePlugin proof | Old `withBreakRules.spec.tsx` name became false after helper deletion; proof moved to owner spec. | Keep. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User-review need |
|--------|-------------------|----------------------|--------|------------------|
| Override rule implementation | Inline in `OverridePlugin.ts` | Split `with*Rules` helper files for one plugin owner | User explicitly prefers fewer hops; helpers are not reused outside the plugin. | Low. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | N/A | N/A | N/A | N/A | No Plite/Plate gap. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed split rule helpers | `rg -n "withBreakRules|withDeleteRules|withMergeRules|withNormalizeRules" packages/core/src packages/core/type-tests` | 0 | 0 | 0 | none |
| Collapsed override directory shape | `rg --files packages/core/src/lib/plugins/override` | 3 files | 4 helper files deleted, spec moved to owner name, barrel cleaned | 0 | none |
| Preserve `deleteExit` behavior | `rg -n "deleteExit|emptyLineEnd|OverridePlugin" packages/core/src/lib/plugins/override packages/core/src/lib/plugin/SlatePlugin.ts packages/callout/src` | 19 | 1 owner spec retained under `OverridePlugin.spec.tsx` | 0 | none |

Extracted/deleted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/lib/plugins/override/withBreakRules.ts` | merge-existing-owner | Exists on `origin/main`, but no longer has standalone owner after user correction. | Delete; merge implementation into `OverridePlugin.ts`. | Zero helper references; Core proof pass. |
| `packages/core/src/lib/plugins/override/withDeleteRules.ts` | merge-existing-owner | Exists on `origin/main`, but no longer has standalone owner after user correction. | Delete; merge implementation into `OverridePlugin.ts`. | Zero helper references; Core proof pass. |
| `packages/core/src/lib/plugins/override/withMergeRules.ts` | merge-existing-owner | Exists on `origin/main`, but no longer has standalone owner after user correction. | Delete; merge implementation into `OverridePlugin.ts`. | Zero helper references; Core proof pass. |
| `packages/core/src/lib/plugins/override/withNormalizeRules.ts` | merge-existing-owner | Exists on `origin/main`, but no longer has standalone owner after user correction. | Delete; merge implementation into `OverridePlugin.ts`. | Zero helper references; Core proof pass. |
| `packages/core/src/lib/plugins/override/OverridePlugin.spec.tsx` | justify-new-proof-tooling | `origin/main` had `withBreakRules.spec.tsx`; that name became false after helper deletion. | Keep owner-named spec. | Focused test pass. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Inline override rules | complete | Helpers deleted, `OverridePlugin.ts` owns logic, focused tests pass, `pnpm brl` pass, `pnpm check:core` pass. | Close goal. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Inlined break/delete/merge/normalize rule logic into `OverridePlugin.ts`; removed four split helper files; cleaned `override/index.ts`. |
| tests/proof | Moved `withBreakRules.spec.tsx` to `OverridePlugin.spec.tsx`; kept `deleteExit` regression. |
| docs/templates/skills | Updated this goal plan only. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `OverridePlugin.ts` is larger | This is the direct tradeoff you asked for: fewer files, more local code. | `packages/core/src/lib/plugins/override/OverridePlugin.ts` | Keep unless the file becomes painful after broader review. |

Findings:
- Split helper files were not reused outside `OverridePlugin`; they added navigation cost.
- After inlining, the only files under `override/` are `OverridePlugin.ts`, `OverridePlugin.spec.tsx`, and `index.ts`.

Timeline:
- 2026-07-07 Created plan and active goal.
- 2026-07-07 Inlined rule logic into `OverridePlugin.ts`.
- 2026-07-07 Deleted four split helper files and cleaned barrel.
- 2026-07-07 Moved stale `withBreakRules.spec.tsx` proof to `OverridePlugin.spec.tsx`.
- 2026-07-07 Focused tests passed.
- 2026-07-07 `pnpm brl` passed.
- 2026-07-07 `pnpm check:core` passed.

Decisions and tradeoffs:
- Inline rule behavior despite larger `OverridePlugin.ts` because one-owner locality beats helper hopping here.
- Rename the spec to owner name because the old helper-name spec became actively false.

Review fixes:
- `check:core` first failed on formatter wrapping in `OverridePlugin.ts`; accepted and patched.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm check:core` formatter failure in `OverridePlugin.ts` | 1 | Patch exact formatter wrap, rerun same gate. | Resolved; `pnpm check:core` passes. |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/override/OverridePlugin.spec.tsx src/lib/editor/withPlite.spec.ts` -> pass, 30 tests.
- `pnpm brl` -> pass.
- `pnpm check:core` -> pass.
- `rg -n "withBreakRules|withDeleteRules|withMergeRules|withNormalizeRules" packages/core/src packages/core/type-tests` -> 0 matches.
- `rg --files packages/core/src/lib/plugins/override` -> 3 files: `OverridePlugin.ts`, `OverridePlugin.spec.tsx`, `index.ts`.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closing packet | Final plan checker, then handoff | Remove split helper files while preserving behavior | Helper split adds hops | Implementation and proof complete |

Open risks:
- None for this named packet.
