# {{TITLE}}

Objective:
TODO: Write the short goal objective.

Flow mode:
agent-led plan hardening

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Primary template:
{{TEMPLATE_PATH}}

Applied packs:
- none

Mode:
- TODO: `standard` or `deep`. Quick mode does not create this plan.

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:
- TODO: Name focused source audits and planning checks. Name execution commands
  only for owners the accepted plan will change.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plate-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: TODO.
- Source owners: TODO.
- Non-goals: TODO.
- Direct Plite boundary owners: TODO or N/A with reason.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- TODO: Name the evidence, access, or user decision that prevents a resolved
  architecture plan. Do not block while a focused source/proof move remains.

Plate Plan state:
- status: active
- phase: ground
- next: decide
- handoff: not-prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | pending | pending |
| Active goal and plan verified | pending | pending |
| Current owners read | pending | pending |
| Best API target resolved | pending | `best-api design/review`, or N/A because no reusable call shape changes |
| Mode and execution boundary resolved | pending | pending |

Work Checklist:
- [ ] Outcome, scope, non-goals, constraints, and owners are concrete.
- [ ] Current API/docs/tests/exports claims cite live source.
- [ ] Reusable public call shape has one `best-api` verdict before target lock.
- [ ] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [ ] Public breaks and any private bridge have complete adoption/deletion answers.
- [ ] Execution slices and focused proof matrix are concrete.
- [ ] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | pending | Resolve every readiness condition | pending |
| Fresh source evidence | pending | Recheck decision-changing current claims | pending |
| Best API review | pending | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | pending |
| Conditional risk and adoption | pending | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | pending |
| Verification recorded | pending | Record fresh planning proof and exact execution gates | pending |
| Handoff prepared | pending | Prepare concise ownership, breaks, proof, risks, and execution order | pending |
| Autoreview | pending | Run for implementation changes or record planning-only N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | in_progress | Plan created | Decide |
| Decide | pending | | Prove and hand off |
| Prove and hand off | pending | | User review |

Decision brief:
- outcome: TODO
- chosen shape: TODO
- strongest rejected alternative: TODO
- consequence: TODO

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| TODO | TODO | TODO | TODO | TODO | TODO |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| TODO | TODO | TODO | pending |

Conditional evidence:
- High-risk scenarios: TODO or N/A with reason.
- External research: TODO or N/A with reason.
- Issue/PR provenance: TODO or N/A with reason.
- Docs/registry/browser/release/behavior-law owners: TODO or N/A with reason.

Findings:
- TODO

Decisions and tradeoffs:
- TODO

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| None | 0 | N/A | N/A |

Verification evidence:
- Pending.

Final handoff prepared:
- Ownership and target API: pending.
- Public breaks and adoption: pending.
- Applicable runtime/package/docs/browser decisions: pending.
- Proof and execution risks: pending.
- Execution order and user attention: pending.

Timeline:
- {{CREATED_AT}} Plate Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Ground |
| Where am I going? | Decide, prove, prepare handoff |
| What is the goal? | TODO |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
