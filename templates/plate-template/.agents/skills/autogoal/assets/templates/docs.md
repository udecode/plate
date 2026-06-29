# {{TITLE}}

Objective:
TODO: Write the short create_goal objective, under 240 characters. Put the full docs contract in the sections below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Linked plans:
- None.

Docs source:
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

Timed checkpoint:
- requested duration: pending
- semantics: pending
- initial confidence score: pending
- improvement loop: pending
- final score / loop closure: pending

Completion threshold:
- TODO: Define the exact docs done state.

Verification surface:
- TODO: Name source audit, docs parser/build, link/demo check, preview check, or review proof.

Constraints:
- Follow nearest existing docs style.
- Write current-state docs only. No changelog voice.
- Keep examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.

Boundaries:
- Source of truth: TODO.
- Allowed edit scope: TODO.
- Browser surface: TODO.
- Non-goals: TODO.

Blocked condition:
- TODO: Name missing source code, docs entry, route, product choice, or command failure that stops autonomous docs work.

Completion rule:
- Do not call `update_goal(status: complete)` until required checks are closed and `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| Timed checkpoint parsed | pending | pending |
| Active goal checked or created | pending | pending |
| Target docs read | pending | pending |
| Nearest sibling docs read | pending | pending |
| Documented source code read | pending | pending |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [ ] Target docs and nearest sibling docs were read before writing.
- [ ] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [ ] Documented behavior or API was verified against current source.
- [ ] Fastest success path appears before deeper mechanics or API reference.
- [ ] Named APIs, imports, routes, options, and examples are exact and current.
- [ ] Links and anchors target real pages or are marked N/A.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Docs source-backed claim audit | pending | Verify docs claims against current source | pending |
| Docs links / routes / previews | pending | Verify or record N/A | pending |
| Docs parser/build | pending | Run relevant docs parser/build or record N/A | pending |
| Autoreview | pending | Review final docs against objective, constraints, source truth, and newest user request | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | writing |
| Writing | pending | | verification |
| Verification | pending | | closeout |
| Closeout | pending | | final response |

Findings:
- None yet.

Timeline:
- {{CREATED_AT}}: plan created.

Verification evidence:
- Pending.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Writing, verification, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
