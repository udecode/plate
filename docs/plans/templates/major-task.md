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

Major lane:
- lane: pending
- output type: pending
- implementation expected: pending
- affected packages / surfaces: pending
- dominant risk: pending

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
- TODO: Define the exact decision, proposal, benchmark, architecture, or
  migration done state.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.

Verification surface:
- TODO: Name the repo audit, benchmark, external-source audit, review pass,
  prototype, command, or plan artifact proving the threshold.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.

Boundaries:
- Source of truth: TODO.
- Allowed edit scope: TODO.
- External sources: TODO.
- Browser surface: TODO.
- Tracker sync: TODO.
- Non-goals: TODO.

Output budget strategy:
- TODO: Record how command/search output will be scoped, capped, counted, or
  saved as artifacts before broad exploration.

Blocked condition:
- TODO: Name the missing source, benchmark, access, design decision, external
  evidence, or user judgment that stops autonomous major-task work.

Major state:
- task_type: major
- task_complexity: major
- current_phase: intake
- current_phase_status: in_progress
- next_phase: research / analysis
- goal_status: active

Current verdict:
- verdict: pending
- confidence: pending
- next owner: major-task
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| Timed checkpoint parsed | pending | pending |
| `major-task` loaded | pending | pending |
| Active goal checked or created | pending | pending |
| Source of truth read before analysis | pending | pending |
| Major lane selected | pending | pending |
| Decision criteria stated | pending | pending |
| Existing repo patterns / prior decisions checked | pending | pending |
| Helper stack selected | pending | pending |
| External research decision recorded | pending | pending |
| Implementation expectation recorded | pending | pending |
| Workspace authority selected | pending | pending |
| Branch / PR expectation decided | pending | pending |
| Output budget strategy recorded | pending | pending |

Work Checklist:
- [ ] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [ ] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [ ] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [ ] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [ ] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [ ] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [ ] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [ ] Facts, inference, and recommendation are separated.
- [ ] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [ ] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [ ] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [ ] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [ ] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | pending |
| Current-state source audit | pending | Map current owner, boundaries, constraints, and affected surfaces | pending |
| Decision criteria closure | pending | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | pending |
| Options / tradeoffs / rejection record | pending | Record viable options, chosen recommendation, and why alternatives lose | pending |
| Review / pressure pass | pending | Run selected reviewer/lens or record N/A with reason | pending |
| Review findings closure | pending | Fix or explicitly reject accepted/actionable findings and record closure proof | pending |
| External-source audit | pending | Cite official/local clone/external sources when used, or record N/A | pending |
| Implementation gates | pending | If code changed, close primary-template and touched-surface gates; otherwise N/A | pending |
| Final handoff contract | pending | Record recommendation, evidence, caveats, residual risk, and next owner | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent when files changed | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | research / analysis |
| Current-state map | pending | | options |
| Options and recommendation | pending | | review |
| Review / pressure pass | pending | | implementation decision |
| Implementation or plan artifact | pending | | verification |
| Verification | pending | | closeout |
| Closeout | pending | | final response |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Implementation notes:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final handoff contract:
- Recommendation: pending
- Confidence: pending
- Evidence: pending
- Tests / commands: pending
- Browser proof: pending
- PR / tracker: pending
- Caveats: pending
- Next owner: pending

Timeline:
- {{CREATED_AT}} Major-task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Research / analysis, options, review, verification, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
