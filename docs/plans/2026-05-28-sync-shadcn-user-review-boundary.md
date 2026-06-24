# sync shadcn user review boundary

Objective:
Repair `sync-shadcn` so planning mode stops for user review like `plite-plan`.
Planning runs must write the range plan, update planned-state only, ask the
user to review the plan, and stop. Implementation starts only on a later user
instruction that accepts a named plan and slice.

Goal plan:
docs/plans/2026-05-28-sync-shadcn-user-review-boundary.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- none

Expectation:
- user expectation: the plan should stop to ask for review, like `plite-plan`.
- observed miss: `sync-shadcn` asked before implementation but still allowed a
  plan/delegate flow inside the same skill activation.
- owning skill/template/helper: `.agents/rules/sync-shadcn.mdc` and
  `docs/plans/templates/sync-shadcn.md`; generated
  `.agents/skills/sync-shadcn/SKILL.md` must be synced by `pnpm install`.
- repair classification: derived-skill two-phase user-review boundary.

Completion threshold:
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-user-review-boundary.md` passes.
- `.agents/rules/sync-shadcn.mdc` defines planning mode as plan -> stop for
  user review, and implementation mode as a later explicit acceptance.
- `docs/plans/templates/sync-shadcn.md` includes user-review boundary rows in
  threshold, start gates, checklist, completion gates, phase table, and final
  handoff.
- Generated `.agents/skills/sync-shadcn/SKILL.md` contains the boundary after
  `pnpm install`.
- A blank instantiated `sync-shadcn` plan still fails `check-complete.mjs`.
- No `apps/www` implementation files are changed.

Verification surface:
- `pnpm install` generated skill sync.
- Source audits over `.agents/rules/sync-shadcn.mdc`,
  `.agents/skills/sync-shadcn/SKILL.md`, and
  `docs/plans/templates/sync-shadcn.md`.
- Template smoke using `create-goal-scratchpad.mjs --template sync-shadcn`.
- Incomplete-plan guard using `check-complete.mjs` on the smoke plan.
- Final repair plan check with `check-complete.mjs`.

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: latest user correction plus the pasted `plite-plan`
  user-review/execution-mode boundary.
- Allowed edit scope: `.agents/rules/sync-shadcn.mdc`,
  `docs/plans/templates/sync-shadcn.md`, generated skill mirrors from
  `pnpm install`, this repair plan, and a temporary smoke plan for verification.
- Derived skill scope: shadcn docs sync planning and accepted implementation
  handoff only.
- Non-goals: no `apps/www` implementation, no generic `autogoal` changes, no
  new shadcn sync plan run.

Output budget strategy:
- Use exact file reads and capped `rg` audits. No broad upstream diff work is
  needed for this repair.

Blocked condition:
- Block only if `pnpm install` cannot regenerate the skill, the template helper
  cannot instantiate `sync-shadcn`, or the checker cannot validate ordinary
  generated plans after source-consistent fixes.

Repair state:
- repair_type: derived-skill user-review boundary repair
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: repair required
- confidence: high
- next owner: sync-shadcn source rule/template
- reason: `plite-plan` has an explicit user-review boundary; `sync-shadcn`
  needs the same shape before implementation.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-user-review-boundary.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Expectation restated | yes | User asked for plan to stop and ask for review like `plite-plan`. |
| Active goal checked | yes | `get_goal` returned no active goal; `create_goal` created this repair objective. |
| Named plan or skill read | yes | User provided `plite-plan` body; current `sync-shadcn` rule/template and this plan were read. |
| Owning source selected | yes | Repair belongs to `.agents/rules/sync-shadcn.mdc` and `docs/plans/templates/sync-shadcn.md`. |
| Repair classification selected | yes | Derived-skill two-phase planning/review/implementation boundary. |
| Safety conflict checked | yes | No conflict: this prevents accidental implementation and strengthens review gating. |
| Output budget strategy recorded | yes | Exact reads and capped source audits only. |

Work Checklist:
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owners are justified or marked N/A.
- [x] Patch touches source-of-truth files only.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | `.agents/rules/sync-shadcn.mdc` and `docs/plans/templates/sync-shadcn.md` patched. |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed; generated `.agents/skills/sync-shadcn/SKILL.md` includes the review boundary. |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | `node .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs --template sync-shadcn --title "sync shadcn review boundary smoke"` created the smoke plan. |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-review-boundary-smoke.md` failed as expected with unresolved sync gates, including `User-review boundary recorded` and `User review boundary`. |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | Template now includes review status, review stop phase, user-review gate, and final handoff rows. |
| Helper/checker tests | no | If scripts changed, run focused script tests; otherwise N/A | N/A: no helper/checker scripts changed. |
| Autoreview / review | no | Run applicable review gate or record N/A for docs-only/source-rule-only repair | N/A: source-rule/template-only repair, no app implementation patch. |
| Final lint | yes | Run scoped formatter/lint or record ignored-path/N/A reason | `git diff --check -- ...` passed; `pnpm exec biome check ...` passed for supported files. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Exact reads/audits used. One bad quoted `rg` pattern caused shell command substitution; recorded and rerun correctly. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-user-review-boundary.md` | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | Created repair goal and goal-repair plan. | target selection |
| Target selection | complete | Source owner is `sync-shadcn` rule/template; no generic autogoal patch. | patch |
| Patch | complete | Rule/template patched. | verification |
| Verification | complete | `pnpm install`, source audit, smoke template, expected incomplete-plan failure, smoke removal, diff check, and Biome supported-file check passed. | closeout |
| Closeout | complete | Final response will report boundary and verification. | final response |

Findings:
- Current `sync-shadcn` already asked before implementation, but the wording was
  weaker than `plite-plan`: it did not force a separate later activation for
  implementation.
- `plite-plan` explicitly separates planning mode from execution mode and tells
  the user to invoke the skill again after reviewing the plan.

Decisions and tradeoffs:
- Mirror `plite-plan` only for the user-review boundary, not its full score/pass
  machinery. Shadcn sync needs inventory accounting, not a Plite architecture
  scorecard.

Repair patch notes:
- Added a `User Review Boundary` section to `.agents/rules/sync-shadcn.mdc`.
- Updated `docs/plans/templates/sync-shadcn.md` so planning completion includes
  asking for review and later invocation before implementation.

Deliberate non-repairs:
- Do not import Plite Plan scoring/pass schedule. That would be ceremony sludge
  for shadcn sync.
- Do not change `apps/www`; this is workflow repair only.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `rg` pattern used backticks inside a double-quoted shell string and zsh tried to run `sync-shadcn` | 1 | Rerun with single-quoted pattern | Reran audit successfully. |

Verification evidence:
- `pnpm install` passed and Skiller regenerated the generated skill.
- `rg -n 'User Review Boundary|Review the plan|planning mode|implementation mode|later user|later instruction|same activation|accepted plan path|user-review boundary|invoke \`sync-shadcn\` again' .agents/rules/sync-shadcn.mdc .agents/skills/sync-shadcn/SKILL.md docs/plans/templates/sync-shadcn.md`
  found the review boundary in source, generated skill, and template.
- `node .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs --template sync-shadcn --title "sync shadcn review boundary smoke"`
  instantiated the template.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-review-boundary-smoke.md`
  failed as expected for an unfinished plan.
- `test ! -e docs/plans/2026-05-28-sync-shadcn-review-boundary-smoke.md`
  passed after deleting the smoke file.
- `git diff --check -- .agents/rules/sync-shadcn.mdc .agents/skills/sync-shadcn/SKILL.md docs/plans/templates/sync-shadcn.md docs/plans/2026-05-28-sync-shadcn-user-review-boundary.md AGENTS.md .agents/AGENTS.md`
  passed.
- `pnpm exec biome check .agents/AGENTS.md AGENTS.md docs/plans/templates/sync-shadcn.md docs/plans/2026-05-28-sync-shadcn-user-review-boundary.md docs/sync/shadcn/status.json`
  passed for the supported file Biome checked.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-user-review-boundary.md`
  passed.

Final repair handoff:
- Expectation: planning mode stops for review before implementation.
- Repaired owner: `.agents/rules/sync-shadcn.mdc` and
  `docs/plans/templates/sync-shadcn.md`.
- Files changed: `.agents/rules/sync-shadcn.mdc`, generated
  `.agents/skills/sync-shadcn/SKILL.md`,
  `docs/plans/templates/sync-shadcn.md`, and this repair plan.
- Verification: `pnpm install`, source audit, smoke plan, expected incomplete
  smoke failure, smoke removal, `git diff --check`, and Biome supported-file
  check.
- Caveat: no `apps/www` implementation in this repair.

Timeline:
- 2026-05-28T14:15:58.611Z Goal repair plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake |
| Where am I going? | Target selection, patch, verification, closeout |
| What is the goal? | Add a Plite Plan-style user-review stop to `sync-shadcn`. |
| What have I learned? | The previous sync flow asked a question but did not make implementation a later activation. |
| What have I done? | Patched source rule/template, regenerated skill, smoke-tested template, and verified source audits. |

Open risks:
- None.
