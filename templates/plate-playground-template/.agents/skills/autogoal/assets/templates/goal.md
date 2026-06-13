# {{TITLE}}

Objective:
TODO: Write the short create_goal objective, under 240 characters. Put the full contract in the sections below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- TODO: Define the exact measurable or auditable done state.

Verification surface:
- TODO: Name the command, artifact, browser proof, source audit, or report that proves the threshold.

Constraints:
- TODO: List constraints or write `no extra constraints`.

Boundaries:
- TODO: List allowed files, packages, tools, repos, routes, or data.

Blocked condition:
- TODO: Name the condition that stops autonomous work.

Completion rule:
- Do not call `update_goal(status: complete)` while required checklist items remain unchecked.
- Do not call `update_goal(status: complete)` until final evidence is recorded and `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| Active goal checked or created | pending | pending |
| Source of truth read before edits | pending | pending |
| TDD decision before behavior change or bug fix | pending | pending |
| Browser proof decision for browser surface | pending | pending |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [ ] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [ ] Work phases are updated with evidence.
- [ ] Decisions and tradeoffs are recorded.
- [ ] Failed attempts and next different moves are recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the named proof or record blocker | pending |
| Typecheck/build/test proof | pending | Run relevant owner checks or record N/A | pending |
| Browser proof | pending | Exercise the affected browser surface or record N/A | pending |
| Autoreview | pending | Review final diff/output against objective, constraints, and newest user request | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | implementation |
| Implementation | pending | | verification |
| Verification | pending | | closeout |
| Closeout | pending | | final response |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Timeline:
- {{CREATED_AT}}: plan created.

Verification evidence:
- Pending.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
