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

Completion threshold:
- TODO: Define what proves the repair is complete.

Verification surface:
- TODO: Name the source audit, regenerated artifact, command, review, or user-visible proof.

Work Checklist:
- [ ] Expected behavior and observed miss are concrete.
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
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Timeline:
- {{CREATED_AT}}: repair plan created.
