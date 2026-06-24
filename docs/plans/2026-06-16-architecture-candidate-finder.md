# architecture candidate finder

Objective:
Find Plate/Plite architecture deepening candidates; done when at least 5 source-backed areas are ranked with owners/proof paths.

Goal plan:
docs/plans/2026-06-16-architecture-candidate-finder.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- none

Major source:
- type: user-invoked skill
- id / link: `$improve-codebase-architecture`
- title: Broad Plate/Plite architecture candidate finder
- decision to make: Which source-backed architecture deepening candidates are
  worth planning, supervising, deferring, or rejecting now?
- decision criteria:
  - Start from root `VISION.md`, relevant `docs/vision/**`, and current source.
  - Inspect at least five candidate areas across Plate and Plite unless source
    proof narrows the useful surface sooner.
  - Separate facts, inference, and recommendation.
  - Every candidate row names files, owner, proof path, and keep/defer/reject
    decision.
  - Do not patch runtime packages in this candidate-finding pass.

Major lane:
- lane: architecture candidate finding
- output type: durable ranked candidate artifact plus completed goal plan
- implementation expected: no runtime implementation; docs/plan artifact only
- affected packages / surfaces: Plate packages, Plite sibling checkout,
  docs/analysis, docs/vision, `.agents` routing context
- dominant risk: generic refactor menu without source proof

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no duration requested.
- initial confidence score: N/A: source-backed candidate count is the metric.
- improvement loop: N/A.
- final score / loop closure: N/A.

Completion threshold:
- Artifact `docs/analysis/2026-06-16-architecture-candidate-finder.md` exists.
- At least five candidate areas are inspected and recorded.
- At least one top recommendation is selected, with owner and first command or
  file to inspect.
- Every ranked row includes strength, files, source facts, inference,
  recommendation, owner, proof path, and decision.
- Rejected/deferred candidates have reasons.
- No runtime package refactor is performed.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-architecture-candidate-finder.md`
  passes.

Verification surface:
- Source audit over repo vision, architecture docs, package manifests, source
  file counts, package dependencies, package test counts, API/docs smell scans,
  and focused source slices for candidate owners.
- Artifact audit for `docs/analysis/2026-06-16-architecture-candidate-finder.md`.
- Mechanical closeout:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-architecture-candidate-finder.md`.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.

Boundaries:
- Source of truth: root `VISION.md`, `docs/vision/common.md`,
  `docs/vision/slate.md`, `docs/vision/plate.md`,
  `docs/analysis/editor-architecture-candidates.md`, package/source/test/docs
  files in this checkout, and `.tmp/plite` when present.
- Allowed edit scope: this plan and
  `docs/analysis/2026-06-16-architecture-candidate-finder.md`.
- External sources: N/A by default; local repo and sibling checkout first.
- Browser surface: N/A; no visible UI behavior is being claimed.
- Tracker sync: N/A.
- Non-goals: runtime refactor, public API redesign implementation, package
  changes, PR/commit, release docs, external OSS research.

Output budget strategy:
- Use capped `sed`, `rg -l`, `rg --count-matches`, package manifest summaries,
  and focused source slices. Write broad synthesis into the docs artifact
  instead of dumping raw scans into chat.

Blocked condition:
- Block only if fewer than five candidate areas can be source-inspected, or if
  the strongest candidate requires a product/API direction not covered by
  `VISION.md` and no other useful candidates remain.

Major state:
- task_type: major
- task_complexity: major
- current_phase: intake
- current_phase_status: in_progress
- next_phase: research / analysis
- goal_status: active

Current verdict:
- verdict: proceed
- confidence: medium
- next owner: improve-codebase-architecture
- reason: Broad candidate finding has a clear artifact threshold and no runtime
  mutation.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-architecture-candidate-finder.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| Timed checkpoint parsed | yes | N/A: no duration requested. |
| `major-task` loaded | yes | Read generated `major-task` plan template and previous major-task source in this thread. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created active goal for this plan. |
| Source of truth read before analysis | partial | Read `$improve-codebase-architecture`, `autogoal`, root `VISION.md`, `docs/vision/common.md`, and architecture candidate map; still reading Plite/Plate detail files before findings. |
| Major lane selected | yes | architecture candidate finding. |
| Decision criteria stated | yes | See Major source. |
| Existing repo patterns / prior decisions checked | pending | pending |
| Helper stack selected | yes | `improve-codebase-architecture`, `autogoal`, `major-task` plan shell; no extra helpers unless evidence demands. |
| External research decision recorded | yes | N/A by default; local source first. |
| Implementation expectation recorded | yes | No runtime implementation; artifact only unless a tiny docs correction is unavoidable. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`, plus `.tmp/plite` for Plite source when present. |
| Branch / PR expectation decided | yes | N/A: no branch/PR/commit requested. |
| Output budget strategy recorded | yes | Capped reads and artifact synthesis. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
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
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-architecture-candidate-finder.md` | pending |

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
- 2026-06-16T21:45:50.897Z Major-task goal plan created.
- 2026-06-16T21:46Z Active goal created and checkpoint-zero requirements
  recorded.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Source audit |
| Where am I going? | Research / analysis, options, review, verification, closeout |
| What is the goal? | Rank source-backed Plate/Plite architecture candidates. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
