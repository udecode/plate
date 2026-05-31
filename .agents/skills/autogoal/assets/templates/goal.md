# {{TITLE}}

Objective:
TODO: Write the exact active goal objective.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

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
| Active goal checked or created | pending | pending |
| Source of truth read before edits | pending | pending |
| TDD decision before behavior change or bug fix | pending | pending |
| Browser proof decision for browser surface | pending | pending |

Work Checklist:
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
