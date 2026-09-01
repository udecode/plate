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
  `plite-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:

- In scope: TODO.
- Source owners: TODO.
- Non-goals: TODO.
- Direct Plate/collaboration adoption owners: TODO or N/A with reason.

Output budget strategy:

- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:

- TODO: Name the evidence, access, or user decision that prevents a resolved
  architecture plan. Do not block while a focused source/proof move remains.

Plite Plan state:

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
| Runtime scale applicability resolved | pending | Identify runtime layers, repeated units, size/fan-out variables, and hot work; apply `performance-observability` when any can change, or record a source-backed zero-runtime N/A |
| Pre-acceptance Benchmark probe selected | pending | Name current baseline, target path or disposable prototype, frozen cohorts/budget, deterministic counters, timing/noise, source identities, and correctness guard, or N/A |
| Mode and execution boundary resolved | pending | pending |

Work Checklist:

- [ ] Outcome, scope, non-goals, constraints, and owners are concrete.
- [ ] Current API/docs/tests/exports/behavior claims cite live source.
- [ ] Reusable public call shape has one `best-api` verdict before target lock.
- [ ] Every scale-sensitive target has a passing executable current-owner versus
      target Benchmark receipt before its decision row locks; paper complexity,
      a review score, or deferred measurement does not satisfy this row.
- [ ] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [ ] Canonical state versus exact-view presentation is classified when
      applicable: no parallel state, copied payload, or editor-global policy
      owner survives without an independent job.
- [ ] Public breaks and any private bridge have complete adoption/deletion answers.
- [ ] Execution slices and focused proof matrix are concrete.
- [ ] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | pending | Resolve every readiness condition | pending |
| Fresh source evidence | pending | Recheck decision-changing current claims | pending |
| Best API review | pending | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | pending |
| Pre-acceptance scale proof | pending | For scale-sensitive decisions, record the matched baseline/target result across applicable cohorts with frozen budget, deterministic cost, timing/noise, source identities, and correctness guard; otherwise source-backed N/A | pending |
| Production scale rerun contract | pending | Put the exact final production-path cohort/budget rerun and correctness guard in every applicable execution slice; planning-only work records its future owner/command | pending |
| Conditional risk and adoption | pending | Complete triggered risk/browser/Benchmark/provenance work or give one scoped N/A reason | pending |
| Verification recorded | pending | Record fresh planning proof and exact execution gates | pending |
| Handoff prepared | pending | Prepare concise ownership, breaks, proof, risks, and execution order | pending |
| P1 autoreview | pending | Run with `--max-priority P1` for implementation changes; P2/P3 are opt-in only, or record planning-only N/A | pending |
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

Scale contract:

- applicability and source evidence: pending
- user operation, current owner, proposed owner: pending
- independent scale variables and normal/large/stress/pathological cohorts: pending
- frozen absolute/relative budget and noise rule: pending
- current baseline command/artifact and source identity: pending
- target command/artifact or disposable prototype and source identity: pending
- deterministic work indicators plus timing result: pending
- correctness/native guard: pending
- final production-path rerun owner and exact command: pending

Conditional evidence:

- High-risk scenarios: TODO or N/A with reason.
- External research: TODO or N/A with reason.
- Issue/PR provenance: TODO or N/A with reason.
- Browser/Benchmark/docs/release/behavior-law owners: TODO or N/A with reason.
- Performance pack, pre-acceptance receipt, and final rerun: TODO or N/A with
  source evidence.

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

- Ownership and target API/runtime: pending.
- Public breaks and Plate/collaboration adoption: pending.
- Applicable browser/Benchmark/docs/provenance decisions: pending.
- Scale applicability, design receipt, and production rerun contract: pending.
- Proof and execution risks: pending.
- Execution order and user attention: pending.

Timeline:

- {{CREATED_AT}} Plite Plan created.

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
