# {{TITLE}}

Objective:
TODO: Write the short create_goal objective, under 240 characters. Put the full major-task contract in the sections below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Major source:
- type: pending
- id / link: pending
- title: pending
- decision to make: pending
- decision criteria: pending

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- TODO: Define the decision, proposal, benchmark, architecture, or migration done state.

Verification surface:
- TODO: Name repo audit, benchmark, external-source audit, review pass, prototype, command, or plan artifact.

Constraints:
- Start from repo evidence before external claims.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this goal explicitly includes it.

Boundaries:
- Source of truth: TODO.
- Allowed edit scope: TODO.
- External sources: TODO.
- Browser surface: TODO.
- Non-goals: TODO.

Blocked condition:
- TODO: Name missing source, benchmark, access, decision, external evidence, or user judgment that stops autonomous work.

Completion rule:
- Do not call `update_goal(status: complete)` until evidence is recorded and `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| Active goal checked or created | pending | pending |
| Source of truth read before analysis | pending | pending |
| Decision criteria stated | pending | pending |
| Existing repo patterns / prior decisions checked | pending | pending |
| External research decision recorded | pending | pending |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [ ] Current state is mapped before proposing a new architecture, migration, benchmark, or plan.
- [ ] Existing repo patterns and prior decisions are recorded before external research.
- [ ] Options, recommendation, tradeoffs, blast radius, and rejection reasons are recorded.
- [ ] Facts, inference, and recommendation are separated.
- [ ] Review or pressure passes are completed, or marked N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Decision criteria satisfied | pending | Map evidence to each criterion | pending |
| Source audit complete | pending | Record repo evidence and external evidence | pending |
| Review / pressure pass | pending | Record review lens or N/A | pending |
| Autoreview | pending | Review final artifact against objective, criteria, constraints, and newest user request | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | research / analysis |
| Current-state map | pending | | options |
| Options and recommendation | pending | | review |
| Review / pressure pass | pending | | closeout |
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
| Where am I going? | Research / analysis, options, review, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
