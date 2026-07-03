# plate-next undrift create-input-rules

Objective:
Undrift `packages/core/src/lib/plugins/input-rules/createInputRules.ts` by removing local Plite wrapper helpers and proving the focused Core input-rules lane.

Goal plan:
docs/plans/2026-07-01-plate-next-undrift-create-input-rules.md

Primary template:
docs/plans/templates/plate-next.md

Explicit prompt requirements captured:
- Target file: `packages/core/src/lib/plugins/input-rules/createInputRules.ts`.
- Named smell: `getStartPoint(...)` helper is not clean.
- Named smell: `isBlock(...)` helper is not clean.
- Action: undrift this file under `plate-next`.
- Stop condition: named file is cleaned, related same-class search is run, focused proof passes.
- No timing constraint.
- No broad Core sweep requested in this prompt.
- No docs, browser, package sweep, or public API rename requested.

Completion threshold:
- `getStartPoint` and `isBlock` helpers are gone from the target file.
- Plite primitives are used directly where those helpers were hiding them.
- The old input-rule `matchString` behavior stays in the existing Core helper because Plite `EditorBeforeOptions` has no `matchString`, `afterMatch`, or `skipInvalid` option.
- Related same-class grep records no remaining helper wrappers in input-rules.
- Focused input-rules tests, Core typecheck, and Biome pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-next-undrift-create-input-rules.md` passes.

Verification surface:
- focused tests: `pnpm --filter @platejs/core exec bun test src/lib/plugins/input-rules`
- package proof: `pnpm --filter @platejs/core typecheck`
- lint proof: `pnpm exec biome check packages/core/src/lib/plugins/input-rules/createInputRules.ts`
- source audits: `git show origin/main:packages/core/src/lib/plugins/input-rules/createInputRules.ts`, target-file `sed`, same-class `rg`
- related Core sweep: input-rules helper wrapper grep plus same-class plugin grep
- browser proof: not applicable; no UI route changed
- barrel proof: not applicable; no exports changed

Blocked condition:
- Blocked only if Plite lacks a required current primitive for existing input-rule behavior and Core cannot preserve that behavior without a hack. This packet did not hit that blocker.

Constraints:
- Keep Plate product behavior in Core and Plite substrate behavior in Plite.
- Do not create a new wrapper name for the two removed helpers.
- Do not widen into unrelated `node-id` cleanup.
- Do not preserve compatibility shims or old Slate API names.
- Do not run git status or stage files.

Boundaries:
- Allowed edit scope: target file and this plan.
- Package/API surfaces: Core input-rules only.
- Docs/browser surfaces: not applicable.
- Out-of-scope package errors: not applicable; proof stayed in `@platejs/core`.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan lists every explicit requirement above. |
| `plate-next` skill read | yes | `.agents/skills/plate-next/SKILL.md` read before action. |
| `autogoal` active goal | yes | Goal created for this packet. |
| Mode classified | yes | Named file packet, not broad Core sweep. |
| Review target | yes | Best Plate v2/Plite-fit cleanup, no legacy wrappers. |
| Output budget | yes | Targeted `sed`, `rg`, and focused proof only. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Scope capture | done | Prompt requirements copied into this plan. |
| Source comparison | done | Compared target file with `origin/main`. |
| Implementation | done | Removed the two local wrapper helpers. |
| Related sweep | done | Same-class `rg` run and recorded. |
| Verification | done | Focused tests, typecheck, and Biome passed. |

Work Checklist:
- [x] First checkpoint complete with target, scope, stop condition, proof, and non-goals.
- [x] Mode classified as named file packet.
- [x] Compared target file against `origin/main`.
- [x] Removed `getStartPoint` helper.
- [x] Removed `isBlock` helper.
- [x] Kept `getPointBeforeInputRule` because it owns input-rule `matchString` semantics missing from Plite `points.before`.
- [x] Ran related same-class sweep for helper wrappers and Plite read patterns.
- [x] Ran focused package proof.
- [x] Filled changed list, proof, needs-attention, and next owner.

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/input-rules/createInputRules.ts` / `getStartPoint` | 4 | hard-cut | Core input-rules | Helper only hid `RangeApi.start`, `PointApi.isPoint`, and `editor.read.points.start`. | Done. |
| `packages/core/src/lib/plugins/input-rules/createInputRules.ts` / `isBlock` | 4 | hard-cut | Core input-rules | Helper only hid `ElementApi.isElement(node) && editor.read.schema.isBlock(node)`. | Done. |
| `packages/core/src/lib/plugins/input-rules/createInputRules.ts` / `getPointBeforeInputRule` | 1 | keep-in-core | Core input-rules | Plite `EditorBeforeOptions` has only `distance`, `unit`, and `voids`; input rules need `matchString`, `afterMatch`, and `skipInvalid`. | Keep until Plite intentionally accepts text-match point helpers. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User-review need |
|--------|-------------------|-----------------------|--------|------------------|
| Block matching inside input rules | Inline `ElementApi.isElement(...) && editor.read.schema.isBlock(...)` at call sites. | Local `isBlock` wrapper; old `editor.api.isBlock`. | Core should not wrap Plite reads under Plate helper names. | Low. |
| Start-point resolution inside `getPointBeforeInputRule` | Inline `RangeApi.isRange`, `PointApi.isPoint`, and `editor.read.points.start(..., { required: true })`. | Local `getStartPoint` wrapper; duck-typed `'offset' in at`. | The inline code is clearer and safer. | Low. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Not a blocker | Optional future text-match point helper | Promoting `matchString` into Plite is a design decision, not needed for this cleanup. | Plite, if reopened. | Plite API plan and tests. | Defer. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed `getStartPoint` / `isBlock` helpers | `rg -n "const getStartPoint|const isBlock\\(|=> isBlock\\(|match: \\([^)]*\\) => isBlock|PointApi\\.isPoint|editor\\.read\\.schema\\.isBlock" packages/core/src/lib/plugins/input-rules packages/core/src/lib/plugins -g '*.ts' -g '*.tsx'` | Target helper wrappers removed; remaining `schema.isBlock` hits are direct Plite reads in input-rules plus unrelated `node-id` direct reads. | 1 file | `node-id` direct reads are outside this prompt. | Low. |

Verification evidence:
| Command | Result |
|---------|--------|
| `sed -n '1,220p' packages/core/src/lib/plugins/input-rules/createInputRules.ts` | Reviewed current target file. |
| `git show origin/main:packages/core/src/lib/plugins/input-rules/createInputRules.ts \| sed -n '1,220p'` | Compared against main shape. |
| `sed -n '2060,2095p' packages/plite/src/interfaces/editor.ts` | Verified `EditorBeforeOptions` has no `matchString`, `afterMatch`, or `skipInvalid`. |
| `pnpm --filter @platejs/core exec bun test src/lib/plugins/input-rules` | 7 pass, 0 fail. |
| `pnpm --filter @platejs/core typecheck` | Passed. |
| `pnpm exec biome check packages/core/src/lib/plugins/input-rules/createInputRules.ts` | Passed, no fixes applied. |

Changed files:
| Area | Files |
|------|-------|
| code | `packages/core/src/lib/plugins/input-rules/createInputRules.ts` |
| plan | `docs/plans/2026-07-01-plate-next-undrift-create-input-rules.md` |

Needs attention:
- None. This was a small named-file cleanup.

Current verdict:
- verdict: done
- confidence: high
- keep / revert / quarantine: keep
- next owner: none for this packet
- reason: helper wrappers removed; focused proof is green.

Reboot status:
- Resume from this plan if interrupted.

Open risks:
- If we later want text-match point scanning as public Plite API, open a `plite-plan` packet. Do not sneak it into Core as another wrapper.
