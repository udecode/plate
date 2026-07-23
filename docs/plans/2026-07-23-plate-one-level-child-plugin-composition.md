# Plate one-level child plugin composition

Objective:
Close one-level child-plugin composition; done when current type/runtime
support, target API, adoption slices, and binary readiness gates pass; plan
docs/plans/2026-07-23-plate-one-level-child-plugin-composition.md.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-23-plate-one-level-child-plugin-composition.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:

- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.
- Current one-level child-plugin inference and runtime installation are proven
  supported, partially supported, or unsupported with exact source and focused
  type/runtime evidence.
- The target explicitly supports at most one public child-plugin level. It does
  not add arbitrary recursive authoring, a behavior DSL, profiles, registries,
  or another runtime.
- The plan settles the normal plugin path, child-plugin declaration,
  parent/child API-option-state inference, key/dependency/priority behavior,
  resolution/flattening, diagnostics, exports/docs, adoption, and proof.

Verification surface:

- Source audit of Core plugin types, `InferPluginConfigTree`, authoring
  methods, plugin resolution/merge, runtime publication, public exports, docs,
  representative child-plugin callers, and existing compile/runtime tests.
- `best-api review` of the normal, one-level composition, and advanced call
  sites.
- Planning-only type probes may be added under a disposable local command or
  existing type-test harness; product source remains unchanged.
- Final planning review, Markdown formatting, and `check-complete`.

Constraints:

- Planning only until the user explicitly accepts this exact plan and invokes
  `plate-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- One public child-plugin level is sufficient; do not design or preserve
  infinite recursive nesting.
- Preserve one obvious `plugins: [Plugin]` common path and ordinary plugin
  descriptor composition.
- Child-plugin identity must represent a real composition/ownership boundary,
  not one handler, extension block, or source file.

Boundaries:

- In scope: Plate Core child-plugin declaration, inference, resolution,
  flattened installation, diagnostics, public teaching, and representative
  package adoption.
- Source owners: `packages/core` plugin types and resolver first; expand only
  to concrete package callers and direct Plite publication owners found by
  source evidence.
- Non-goals: implementation, behavior profiles, runtime enable/disable,
  arbitrary-depth plugin trees, file splitting, registry/serialization/
  observability machinery, and unrelated plugin-authoring redesign.
- Direct Plite boundary owners: only extension installation/publication
  reached by resolved Plate child plugins; exact owner is a grounding gate.

Output budget strategy:

- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.
- Use bounded symbol searches for `plugins`, `InferPluginConfigTree`,
  `dependencies`, `resolvePlugins`, and representative nested declarations.
  Exclude generated output, templates, build artifacts, and unrelated packages.

Blocked condition:

- Block only if live types/runtime/tests cannot determine whether children are
  composed or merely declared after all focused owners are read, or if a
  decision-changing public call-shape choice remains that cannot be settled by
  source and the user-stated one-level constraint.

Plate Plan state:
- status: active
- phase: ground
- next: decide
- handoff: not-prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | One-level child plugins, full type-support audit, no arbitrary recursion, planning-only handoff, and execution boundary are recorded above. |
| Active goal and plan verified | yes | Goal tool created the objective naming this exact plan. |
| Current owners read | pending | pending |
| Best API target resolved | pending | `best-api design/review`, or N/A because no reusable call shape changes |
| Mode and execution boundary resolved | yes | Standard agent-led plan hardening; no implementation before explicit acceptance of this exact plan. |

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
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-plate-one-level-child-plugin-composition.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | in_progress | Plan created | Decide |
| Decide | pending | | Prove and hand off |
| Prove and hand off | pending | | User review |

Decision brief:

- outcome: decide whether Plate should keep, harden, or cut parent-owned
  one-level child-plugin composition and prove its type/runtime contract.
- chosen shape: pending live source and `best-api` review.
- strongest rejected alternative: arbitrary recursive plugin trees and a
  parallel capability/behavior composition model.
- consequence: accepted work will be a focused Core typing/resolution hard cut
  plus bounded package/docs adoption, or an evidence-backed keep decision.

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

- User requirement: one child-plugin level is enough; infinite nesting has no
  current product job.
- Prior doctrine: structural additions and nested plugins belong on `.extend`,
  while contextual `.configure` may only modify existing runtime fields.

Decisions and tradeoffs:

- Treat current recursive-looking generics as evidence, not a requirement.
- Do not equate colocation with lack of descriptor identity.

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
- 2026-07-23T14:34:10.687Z Plate Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Ground |
| Where am I going? | Decide, prove, prepare handoff |
| What is the goal? | Resolve and plan the smallest truthful one-level child-plugin contract with complete type/runtime evidence. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:

- The current generic may advertise deeper inference than runtime resolution
  safely supports, or runtime may flatten children while public types retain a
  recursive tree. Grounding must prove both sides before choosing the target.
