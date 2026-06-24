# {{TITLE}}

Objective:
TODO: Write the short create_goal objective, under 240 characters. Put the full
Plate Plan lane contract in the sections below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Completion threshold:
- TODO: Define the exact Plate Plan done state.
- Plate Plan closure is legal only when score >= 0.92, no dimension is below
  0.85, every pass row is complete or intentionally skipped with evidence,
  every required API conflict row has a verdict, Plite/Plate boundary rows are
  closed, proof gates are named, final handoff is emitted, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.

Verification surface:
- TODO: Name the planning checks, source audits, package checks, docs/browser
  proof, or execution commands that prove the threshold.
- Planning-only claims need live source pointers. Execution claims need Plate
  repo root commands for the owning package/app/docs surface.

Constraints:
- Plate v2 may make breaking changes for best architecture, DX, performance,
  testability, and agent-maintainability.
- Minimal breaking change means the smallest public break set that removes the
  real Plite/Plate conflict. It does not mean keeping aliases or shims.
- Plite APIs win when Plate APIs overlap with the Plite substrate.
- No public compatibility aliases, public runtime shims, or docs for old API
  names.
- Private temporary bridges are allowed only with an owner, deletion gate, proof
  route, and no public export.
- Planning mode edits planning/research/behavior-law/reference artifacts only.
  Implementation starts after user acceptance in a separate execution goal.

Boundaries:
- Source of truth: latest user request, root `VISION.md`, relevant
  `docs/vision/**`, `.agents/rules/plate-plan.mdc`, current Plite package APIs,
  and current Plate source/docs/tests.
- Allowed planning edit scope: `docs/plans/**`, `docs/research/**`,
  `docs/vision/**`, `docs/editor-behavior/**` when behavior law changes,
  `docs/plite/**` references when Plite migration evidence is required.
- Allowed execution edit scope: accepted-plan package/app/docs/tests/examples
  owners.
- Browser surface: TODO or N/A.
- Tracker sync: TODO or N/A.
- Non-goals: TODO.

Blocked condition:
- TODO: Name the missing source context, proof command, user decision, access,
  or accepted-plan approval that stops autonomous work.
- Do not use blocked while any source audit, score-hardening, conflict-ledger,
  proof-row, or plan-hardening move remains runnable.

Plate Plan lane state:
- plate_plan_lane_status: pending
- current_pass: current-state-read
- current_pass_status: in_progress
- next_pass: intent-boundary
- next_action: run current pass and update this plan
- final_handoff_status: pending

Current verdict:
- verdict: pending
- confidence: pending
- keep / cut / revise call: pending
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion gate below
  is satisfied and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| Active goal checked or created | pending | pending |
| Source of truth read before edits | pending | pending |
| Plite/Plate boundary surface identified | pending | pending |
| API conflict ledger needed | pending | pending |
| Planning vs execution mode decided | pending | pending |
| Browser proof needed | pending | pending |
| External research needed | pending | pending |

Work Checklist:
- [ ] Short objective plus lane outcome, completion threshold, verification
      surface, constraints, boundaries, and blocked condition are concrete.
- [ ] Planning vs execution mode is explicit.
- [ ] Live source grounding recorded for every current implementation/API/docs
      claim.
- [ ] Plite/Plate boundary map is complete.
- [ ] API conflict ledger is source-discovered and includes every public or
      exported Plate runtime accessor, product command surface, transform
      namespace, plugin extension point, Plite transaction/read/update
      interaction point, runtime/default-route bridge, package export,
      declaration, docs/example API, and legacy substrate bridge that may
      overlap with Plite.
- [ ] Minimal breaking-change matrix is complete.
- [ ] Private bridges, if any, have owner, deletion gate, and proof route.
- [ ] Public API target is concrete.
- [ ] Runtime/default-route target is concrete or N/A with reason.
- [ ] Plugin/feature package target is concrete.
- [ ] Docs/examples/registry target is concrete.
- [ ] Proof matrix names focused package/app/docs commands.
- [ ] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [ ] Objection ledger complete for every public API, package-boundary,
      runtime, docs, or behavior change.
- [ ] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [ ] Final handoff outline lists every accepted decision, not only highlights.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Plite/Plate boundary rows closed | pending | Every mixed owner split, moved, or explicitly deferred with evidence | pending |
| API conflict ledger closed | pending | Every required row has verdict and proof/adoption answer | pending |
| Breaking changes accepted | pending | Every breaking change has objection row, adoption answer, docs/example answer, and proof route | pending |
| Private bridges controlled | pending | Owner, deletion gate, and no public export/docs | pending |
| Package/source execution changed | pending | Run focused owner typecheck/test/build and `pnpm brl` if exports changed | pending |
| Docs/content changed | pending | Run docs checks and browser proof when route changed | pending |
| Browser behavior claim | pending | Run Plite/browser or accepted Plate app proof command | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Autoreview for implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md` and close accepted/actionable findings, or record N/A for planning-only | pending |
| Final user-review handoff | pending | Emit final handoff or keep the plan pending with next pass | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | in_progress | created plan | intent-boundary |
| Intent, scope, boundary, non-goals | pending | | Plite/Plate boundary audit |
| Plite/Plate boundary audit | pending | | API conflict inventory |
| API conflict inventory | pending | | minimal breaking-change strategy |
| Minimal breaking-change strategy | pending | | runtime/performance/testability |
| Runtime, performance, testability pass | pending | | docs/examples/registry |
| Docs, examples, registry pass | pending | | research/ecosystem |
| Research/ecosystem/live-source pass | pending | | objection ledger |
| Objection and steelman pass | pending | | high-risk pass |
| High-risk deliberate pass | pending | | revision |
| Revision pass | pending | | verification/final handoff |
| Verification and final handoff gate | pending | | final response |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| Plite/Plate boundary correctness | 0.20 | pending | |
| Plate API/DX quality | 0.20 | pending | |
| Runtime, performance, and testability | 0.20 | pending | |
| Minimal breaking-change strategy | 0.15 | pending | |
| Product/plugin/docs/examples coherence | 0.15 | pending | |
| Research, source evidence, and proof completeness | 0.10 | pending | |

Plite/Plate boundary map:
| Surface | Current owner | Target owner | Keep / move / cut / bridge / defer | Evidence | Verdict |
|---------|---------------|--------------|------------------------------------|----------|---------|
| pending | pending | pending | pending | pending | pending |

API conflict ledger:
| Surface | Current shape | Conflict | Target shape | Verdict | Adoption/docs/proof answer |
|---------|---------------|----------|--------------|---------|---------------------------|
| runtime accessors | source-discover | pending | pending | pending | pending |
| product command surfaces | source-discover | pending | pending | pending | pending |
| transform namespaces | source-discover | pending | pending | pending | pending |
| plugin extension points | source-discover | pending | pending | pending | pending |
| Plite transaction/read/update interaction points | source-discover | pending | pending | pending | pending |
| runtime/default-route bridges | source-discover | pending | pending | pending | pending |
| package exports and declarations | source-discover | pending | pending | pending | pending |
| docs/examples teaching public API | source-discover | pending | pending | pending | pending |
| legacy substrate bridges | source-discover | pending | pending | pending | pending |

Minimal breaking-change matrix:
| Break | Why required | Smaller option rejected | User impact | Migration route | Proof |
|-------|--------------|-------------------------|-------------|-----------------|-------|
| pending | pending | pending | pending | pending | pending |

Public API target:
| Surface | Proposed shape | User-facing DX | Boundary owner | Evidence | Verdict |
|---------|----------------|----------------|----------------|----------|---------|
| pending | pending | pending | pending | pending | pending |

Private bridge and deletion gates:
| Bridge | Owner | Why temporary | Public exposure check | Deletion gate | Proof |
|--------|-------|---------------|-----------------------|---------------|-------|
| pending | pending | pending | pending | pending | pending |

Runtime / default-route target:
| Layer | Current shape | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| pending | pending | pending | pending | pending | pending |

Plugin / feature package target:
| Package / feature | Current API | Target API | Break level | Proof command | Verdict |
|-------------------|-------------|------------|-------------|---------------|---------|
| pending | pending | pending | pending | pending | pending |

Docs / examples / registry target:
| Surface | Current docs/example | Target docs/example | Check command | Status |
|---------|----------------------|---------------------|---------------|--------|
| pending | pending | pending | pending | pending |

Proof matrix:
| Claim | Cwd | Command / proof | Expected signal | Status |
|-------|-----|-----------------|-----------------|--------|
| pending | pending | pending | pending | pending |

Research / ecosystem synthesis:
| System | Source | Mechanism | Steal | Reject | Plate target | Verdict |
|--------|--------|-----------|-------|--------|--------------|---------|
| pending | pending | pending | pending | pending | pending | pending |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| architecture-cleanup | pending | pending | | |
| performance | pending | pending | | |
| tdd | pending | pending | | |
| docs-creator | pending | pending | | |
| react | pending | pending | | |
| react-useeffect | pending | pending | | |
| components / plate-ui | pending | pending | | |
| autoreview | pending | pending | | |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| pending | pending | pending | pending | pending | pending |

Objection ledger:
| Change | Who feels pain | Objection | Tradeoff | Evidence | Adoption/docs/proof answer | Verdict |
|--------|----------------|-----------|----------|----------|----------------------------|---------|
| pending | pending | pending | pending | pending | pending | pending |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| pending | pending | pending | pending | pending | pending |

Plan deltas from review:
- None yet.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| pending | pending | pending | pending | pending |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| pending | plate-plan execution mode | pending | pending | pending | pending |

Final user-review handoff outline:
- accepted boundary decisions: pending
- accepted API conflict verdicts: pending
- breaking changes: pending
- private bridges and deletion gates: pending
- docs/examples/registry changes: pending
- proof gates: pending
- next execution owners: pending
- needs user attention: pending

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | pending |
| all pass rows complete or skipped with evidence | phase/pass table closed | pending |
| Plite/Plate boundary closed | boundary map closed | pending |
| API conflict ledger closed | ledger rows have verdicts | pending |
| live source grounding complete | source-backed rows cite current owners | pending |
| workspace verification recorded | proof matrix closed | pending |
| autoreview clean or N/A | `.agents/skills/autoreview/SKILL.md` loaded and clean for implementation changes, or N/A with reason | pending |
| final handoff emitted or lane remains pending | final response / next pass recorded | pending |
| `check-complete` passes | `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Current-state read and initial score |
| Where am I going? | Run the next incomplete Plate Plan pass |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- {{CREATED_AT}} Plate Plan goal plan created.
