# {{TITLE}}

Objective:
TODO: Repair the owning goal-backed rule/template/helper so this expectation is
handled correctly on future runs.

Goal plan:
{{PLAN_PATH}}

Template:
docs/plans/templates/goal-repair.md

Expectation:
- user expectation: TODO
- observed miss: TODO
- owning skill/template/helper: TODO
- repair classification: pending

Timed checkpoint:
- requested duration: pending
- semantics: pending
- initial confidence score: pending
- improvement loop: pending
- final score / loop closure: pending

Completion threshold:
- TODO: Name the exact repaired behavior.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` passes.

Verification surface:
- TODO: Name the source audit, generated skill sync, smoke plan/checker proof,
  helper test, or other evidence that proves the repair.

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: latest `autogoal repair <expectation>` request.
- Allowed edit scope: TODO.
- Derived skill scope: TODO.
- Non-goals: TODO.

Output budget strategy:
- TODO: Record how command/search output will be scoped, capped, counted, or
  saved as artifacts before broad exploration.

Blocked condition:
- TODO: Name the missing plan path, skill owner, expected behavior, or user
  decision that stops autonomous repair.

Repair state:
- repair_type: pending
- current_phase: intake
- current_phase_status: in_progress
- next_phase: target selection
- goal_status: active

Current verdict:
- verdict: pending
- confidence: pending
- next owner: autogoal repair
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | pending | pending |
| Expectation restated | pending | pending |
| Active goal checked | pending | pending |
| Named plan or skill read | pending | pending |
| Owning source selected | pending | pending |
| Repair classification selected | pending | pending |
| Safety conflict checked | pending | pending |
| Output budget strategy recorded | pending | pending |

Work Checklist:
- [ ] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [ ] Expectation and observed miss are stated with source evidence.
- [ ] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [ ] Secondary owners are justified or marked N/A.
- [ ] Patch touches source-of-truth files only.
- [ ] Derived skill vs generic `autogoal` ownership decision is recorded.
- [ ] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [ ] Deliberate non-repairs are recorded.
- [ ] Final response shape is recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | pending | Patch the selected source owner or record runtime-plan-only repair | pending |
| Generated skill sync | pending | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | pending |
| Template smoke | pending | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | pending |
| Incomplete-plan guard | pending | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | pending |
| Completed-plan representability | pending | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | pending |
| Helper/checker tests | pending | If scripts changed, run focused script tests; otherwise N/A | pending |
| Autoreview / review | pending | Run applicable review gate or record N/A for docs-only/source-rule-only repair | pending |
| Final lint | pending | Run scoped formatter/lint or record ignored-path/N/A reason | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | in_progress | created repair plan | target selection |
| Target selection | pending | | patch |
| Patch | pending | | verification |
| Verification | pending | | closeout |
| Closeout | pending | | final response |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Repair patch notes:
- None yet.

Deliberate non-repairs:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final repair handoff:
- Expectation: pending
- Repaired owner: pending
- Files changed: pending
- Verification: pending
- Caveat: pending

Timeline:
- {{CREATED_AT}} Goal repair plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake |
| Where am I going? | Target selection, patch, verification, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
