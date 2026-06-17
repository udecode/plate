# {{TITLE}}

Objective:
Repair a goal-backed workflow that missed an expectation.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Expected behavior:
- TODO: State the user expectation or governing workflow rule.

Observed miss:
- TODO: State what actually happened.

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
- TODO: Define what proves the repair is complete.

Verification surface:
- TODO: Name the source audit, regenerated artifact, command, review, or user-visible proof.

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

Blocked condition:
- TODO: Name the missing plan path, skill owner, expected behavior, or user decision that stops autonomous repair.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| Timed checkpoint parsed | pending | pending |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [ ] Expected behavior and observed miss are concrete.
- [ ] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [ ] Source of truth for the missed rule is identified.
- [ ] Root cause is recorded before repair.
- [ ] Repair updates the canonical surface.
- [ ] Generated or downstream copies are refreshed only when applicable.
- [ ] Final evidence proves the missed expectation is now satisfied.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Root cause recorded | pending | Explain why the miss happened | pending |
| Canonical source repaired | pending | Patch the real source of truth | pending |
| Verification proof | pending | Run named proof or record blocker | pending |
| Autoreview | pending | Review repair against expected behavior, observed miss, and newest user request | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | repair |
| Repair | pending | | verification |
| Verification | pending | | closeout |
| Closeout | pending | | final response |

Timeline:
- {{CREATED_AT}}: repair plan created.

Verification evidence:
- Pending.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Repair, verification, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Observed miss |
| What have I done? | See Timeline |

Open risks:
- Pending.
