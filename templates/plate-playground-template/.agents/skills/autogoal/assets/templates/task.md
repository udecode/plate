# {{TITLE}}

Objective:
TODO: Write the short create_goal objective, under 240 characters. Put the full task contract in the sections below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Task source:
- type: pending
- id / link: pending
- title: pending
- acceptance criteria: pending

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- TODO: Define the exact task done state.

Verification surface:
- TODO: Name tests, typecheck, lint, browser proof, source audit, tracker/PR sync, or other artifact proving the threshold.

Constraints:
- Preserve behavior outside scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, commits, pushes, or external comments unless requested or required.

Boundaries:
- Source of truth: TODO.
- Allowed edit scope: TODO.
- Browser surface: TODO.
- Tracker sync: TODO.
- Non-goals: TODO.

Blocked condition:
- TODO: Name the missing source context, repro, access, command, or decision that stops autonomous work.

Completion rule:
- Do not call `update_goal(status: complete)` while required checklist items remain unchecked.
- Do not call `update_goal(status: complete)` until every completion threshold is satisfied, final evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| Active goal checked or created | pending | pending |
| Source of truth read before edits | pending | pending |
| Acceptance criteria captured | pending | pending |
| TDD decision before behavior change or bug fix | pending | pending |
| Browser proof decision for browser surface | pending | pending |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [ ] Short objective plus threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [ ] Task source and acceptance criteria are captured.
- [ ] Nearby implementation patterns are read before edits.
- [ ] Implementation fixes the right ownership boundary.
- [ ] Verification evidence is recorded beside each relevant gate.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the named proof or record blocker | pending |
| TypeScript or typed config changed | pending | Run relevant typecheck | pending |
| Build-sensitive behavior changed | pending | Run relevant build/check | pending |
| Browser surface changed | pending | Capture browser proof | pending |
| Final lint/format | pending | Run relevant lint/format command or record N/A | pending |
| Autoreview | pending | Review final diff/output against objective, acceptance criteria, constraints, and newest user request | pending |
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
