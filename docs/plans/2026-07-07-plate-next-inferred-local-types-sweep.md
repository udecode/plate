# plate-next inferred-local-types sweep

Objective:
Repair Plate Next inferred-local-type law and remove the Selection
`NodeEntry<TIdElement>[]` local annotation smell.

Goal plan:
docs/plans/2026-07-07-plate-next-inferred-local-types-sweep.md

Completion threshold:
- `.agents/rules/plate-next.mdc` says local variables should not be annotated
  when their initializer should infer the type.
- Generated `.agents/skills/plate-next/SKILL.md` contains the same rule.
- `docs/plans/templates/plate-next.md` carries the same closeout law for future
  Plate Next autogoal plans.
- `packages/selection/src/react/utils/copySelectedBlocks.ts` no longer has
  `const selectedEntries: NodeEntry<TIdElement>[] = ...`.
- Same-class Selection local annotations are repaired or explicitly justified.
- Focused Selection proof passes.

Verification surface:
- `rg -n "Never annotate local variables|Inferred local type law|NodeEntry<TIdElement>\\[\\]|const selectedEntries:|const selectedBlocks:" .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md docs/plans/templates/plate-next.md packages/selection/src --glob '!**/dist/**'`
- `rg -n "NodeEntry<TIdElement>\\[\\]|const selectedEntries:|const selectedBlocks:" packages/selection/src packages/core/src --glob '!**/dist/**'`
- `pnpm prepare`
- `pnpm --filter @platejs/selection lint`
- `pnpm --filter @platejs/selection test`
- `pnpm turbo typecheck --filter=./packages/selection`
- `pnpm --filter @platejs/selection build`
- `pnpm --filter @platejs/core lint`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-07-plate-next-inferred-local-types-sweep.md`

Constraints:
- Patch source rule, not generated skill mirror by hand.
- Preserve type inference; do not replace the smell with casts or local helper
  types.
- Do not broaden into a full Core sweep.
- Keep typed locals only when inference is genuinely worse: empty arrays,
  public/API signatures, external boundary callbacks, or deliberate narrowing.

Boundaries:
- Allowed files: Plate Next rule/template, generated skill mirror via Skiller,
  and focused Selection call sites.
- Browser/docs route proof: N/A, no UI/content route changed.
- Non-goals: no package migration, no broad Core drift ledger, no git action.

Output budget strategy:
- Use focused `rg` audits and small source reads; do not stream broad Core
  matches beyond the exact inferred-local smell.

Blocked condition:
Stop if removing local annotations proves `editor.plugin(...).api...` cannot
infer the needed Selection type; then the blocker is a Core/Selection API type
gap.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked to add the rule to `plate-next` and sweep repair the `NodeEntry<TIdElement>[]` smell |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | Goal created for this exact rule/sweep packet |
| Mode classified as named packet vs broad Core sweep | yes | Named rule plus focused Selection smell sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Preserve owner API inference, no casts/local aliases |
| Broad Core drift ledger initialized when in scope | N/A | Broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | `.agents/rules/plate-next.mdc` is source; `/Users/zbeyens/git/plate-2` |
| Output budget strategy recorded | yes | Focused source audits only |
| Public API fork routing checked | N/A | No public API design fork |
| Gap policy checked | yes | No Core/Selection API type gap after proof |
| Related Core sweep policy checked | yes | Same-class local annotation sweep run across Core/Selection |
| Review-mode rename freeze checked | yes | No rename |
| Package review checklist initialized when in scope | N/A | Not package review mode |

Work Checklist:
- [x] First checkpoint complete: explicit target, non-goals, stop condition,
      verification surface, and final handoff needs are captured.
- [x] Add inferred-local-variable rule to `.agents/rules/plate-next.mdc`.
- [x] Add matching rule row to `docs/plans/templates/plate-next.md`.
- [x] Run `pnpm prepare` so generated `.agents/skills/plate-next/SKILL.md`
      syncs from the source rule.
- [x] Remove inferred local annotation from `copySelectedBlocks.ts`.
- [x] Remove same-class inferred local annotation from `selectBlocks.ts`.
- [x] Audit remaining `NodeEntry<TIdElement>[]` hits and classify why they
      stay.
- [x] Run focused Selection lint/test/typecheck/build proof.
- [x] Run Core lint because the skill mirror/rule changed.
- [x] Record verification and risks.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Rule repair | complete | `.agents/rules/plate-next.mdc`, generated skill mirror, and plan template contain the new inferred-local law |
| Source sweep | complete | Two inferred local annotations removed |
| Remaining-hit triage | complete | Remaining hits are public return type, empty accumulator, and test helper parameter |
| Verification | complete | Focused commands passed |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source rule sync | yes | Update `.mdc`, regenerate skill | `pnpm prepare` passed; generated skill contains rule |
| Same-class source audit | yes | Search exact local annotation smell | `selectedEntries` and `selectedBlocks` annotations gone |
| Remaining-hit justification | yes | Classify remaining `NodeEntry<TIdElement>[]` hits | Public API return type, empty accumulator, test helper parameter |
| Focused package proof | yes | Run Selection lint/test/typecheck/build | Passed |
| Core lint | yes | Check generated skill/rule formatting fallout | Passed |
| Broad Core/package review | no | Not requested | N/A |
| Goal plan complete | yes | Run completion checker | To run after this edit |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `.agents/rules/plate-next.mdc` | 0 | keep-in-plate | Plate Next workflow | Rule added to source owner | None |
| `docs/plans/templates/plate-next.md` | 0 | keep-in-plate | Plate Next autogoal template | Future plans now carry the law | None |
| `packages/selection/src/react/utils/copySelectedBlocks.ts` | 0 | main-parity-cleanup | Selection | Local `NodeEntry<TIdElement>[]` removed; tests pass | None |
| `packages/selection/src/internal/transforms/selectBlocks.ts` | 0 | main-parity-cleanup | Selection | Same-class local annotation removed; tests pass | None |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Inferred `NodeEntry<TIdElement>[]` local annotation | `rg "NodeEntry<TIdElement>\\[\\]|const selectedEntries:|const selectedBlocks:" packages/selection/src packages/core/src` | 3 remaining after patch | 2 | 3 justified | Low: remaining hits are not inferred local smell |

Remaining-hit classification:
| Path | Hit | Decision |
|------|-----|----------|
| `packages/selection/src/react/BlockSelectionPlugin.tsx` | `}) => NodeEntry<TIdElement>[]` | Keep: public plugin API return type |
| `packages/selection/src/react/BlockSelectionPlugin.tsx` | `const collapsedNodes: NodeEntry<TIdElement>[] = []` | Keep: empty array accumulator needs element type |
| `packages/selection/src/react/utils/copySelectedBlocks.spec.tsx` | `entries: NodeEntry<TIdElement>[]` | Keep: test helper boundary parameter |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Removed inferred local annotations in Selection |
| tests/proof | No test behavior changed |
| docs/templates/skills | Updated Plate Next source rule, generated skill mirror, and Plate Next plan template |
| reverted/quarantined packets | None |

Verification evidence:
- `pnpm prepare` passed and regenerated `.agents/skills/plate-next/SKILL.md`.
- Source audit confirms the rule exists in `.agents/rules/plate-next.mdc`,
  `.agents/skills/plate-next/SKILL.md`, and
  `docs/plans/templates/plate-next.md`.
- Exact smell audit confirms `const selectedEntries:` and
  `const selectedBlocks:` are gone.
- `pnpm --filter @platejs/selection lint` passed.
- `pnpm --filter @platejs/selection test` passed: 98 tests, 184 expects.
- `pnpm turbo typecheck --filter=./packages/selection` passed: 12 successful
  tasks.
- `pnpm --filter @platejs/selection build` passed.
- `pnpm --filter @platejs/core lint` passed.

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | None | Rule and source sweep are closed | N/A | Continue package review |

Final handoff contract:
- target surface and mode: Plate Next rule repair plus focused Selection source
  sweep.
- files/APIs reviewed: inferred local variable annotations around
  `NodeEntry<TIdElement>[]`.
- package file checklist summary: N/A.
- verdict matrix: all rows score `0` drift after patch.
- changes made: see Changed list.
- related Core sweep query, match count, patched count, deferred count: see
  Related Core sweep ledger.
- tests/proof commands: see Verification evidence.
- old compatibility names audited: N/A.
- Plite/Plate gaps or blockers: none.
- taste review needed: none.
- next best Plate Next packet: keep reviewing package files for typed local
  annotations that hide inference.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Rule/sweep packet complete |
| Where am I going? | Run completion checker and close goal |
| What is the goal? | Add inferred-local rule and repair Selection smell |
| What learned? | Remaining `NodeEntry<TIdElement>[]` hits are justified boundaries/empty accumulator |
| What done? | Rule, template, generated skill, source cleanup, and proof |

Open risks:
- None for this packet.
