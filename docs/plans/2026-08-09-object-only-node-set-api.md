# Object-only node set API

Objective:
Hard-cut positional `nodes.set`; done when only object patches remain, adoption
audits are clean, and affected proofs pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-09-object-only-node-set-api.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard` accepted-target execution. The user accepted the exact object-only
  call shape and said `ok go` on 2026-08-09.

Completion threshold:
- `nodes.set(props, options?)` is the sole public form.
- Zero source, test, docs, or example uses of positional
  `nodes.set(keyOrHandle, value, options?)` remain.
- Positional public types and implementation branches are deleted with no
  compatibility alias or shim.
- Affected Plite/Plate package typechecks, focused tests, lint, P2 autoreview,
  and `check-complete` pass.

Verification surface:
- Source audit of `nodes.set` declarations, implementations, exports, tests,
  docs, and all workspace callers, excluding generated/build dependencies.
- Source-first typecheck for every modified package and focused Plite tests.
- `pnpm lint:fix`, affected doc/example validation where available, and P2
  autoreview.

Constraints:
- Execution is authorized by the user's `ok go` after accepting the exact
  object-only target. This plan records that accepted execution.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Keep transform options separate from node properties.
- Preserve schema-derived key/value checking on object patches; fix the owning
  generic instead of restoring positional overloads or adding annotations.

Boundaries:
- In scope: the Plite `nodes.set` public contract/runtime, compile tests, every
  Plate/Plite consumer, and current-state docs/examples teaching the API.
- Source owners: `packages/plite` for the primitive; consuming packages own
  their object-patch adoption.
- Non-goals: redesigning other node transforms, property persistence, schema
  identity, or plugin APIs.
- Direct Plate/collaboration adoption owners: all matches found by the bounded
  workspace source audit; collaboration is N/A unless that audit finds a call.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if object patches cannot retain schema key/value inference after
  three distinct owner-level generic repairs and no safe inferred surface
  remains; compile evidence must name the minimal failing case.

Plite Plan state:
- status: active
- phase: ground
- next: decide
- handoff: accepted execution in progress

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | pending | pending |
| Active goal and plan verified | yes | `create_goal` active; this exact plan path is in the objective |
| Current owners read | pending | pending |
| Best API target resolved | yes | Accepted target: `nodes.set(props, options?)` only; options remain separate |
| Mode and execution boundary resolved | yes | One-shot accepted-target execution; no unrelated API work |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [ ] Current API/docs/tests/exports/behavior claims cite live source.
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
| Conditional risk and adoption | pending | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | pending |
| Verification recorded | pending | Record fresh planning proof and exact execution gates | pending |
| Handoff prepared | pending | Prepare concise ownership, breaks, proof, risks, and execution order | pending |
| P2 autoreview | pending | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-09-object-only-node-set-api.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | in_progress | Plan created | Decide |
| Decide | pending | | Prove and hand off |
| Prove and hand off | pending | | User review |

Decision brief:
- outcome: one obvious, atomic, typed node-property patch API.
- chosen shape: `tx.nodes.set(props, options?)`.
- strongest rejected alternative: retaining `set(keyOrHandle, value, options?)`
  for computed schema properties.
- consequence: schema-owned updates must be expressed as typed patch objects;
  the owning generic must preserve computed-key inference without positional
  escape hatches.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Node property mutation | Four object/key/handle/dynamic overload families | One object-patch overload | Plite editor update primitive | Atomic multi-property writes, fewer concepts, normal TS object syntax | Migrate every consumer/test/doc | Compile-only key/value tests plus runtime set tests | Computed generic keys may widen; repair object typing at owner | cut |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Primitive | `packages/plite` | Public types and runtime dispatch | Accepted object-only target | Positional branches/types removed; object inference preserved | Focused tests and package typecheck |
| 2. Adoption | Plate/Plite consumers | Production, tests, docs, examples | Primitive compiles | Zero positional matches; behavior unchanged | Per-package typecheck/tests and source audit |
| 3. Closure | Workspace | Lint, barrels/changeset if triggered, review, plan | Slices 1-2 pass | No P0-P2 findings; all gates closed | lint, autoreview, checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Object patch is sole public form | Current declarations and all call sites | Type tests and zero-match audit | pending |
| Node props stay separate from transform options | Existing object/option split | Focused runtime/type proof | pending |
| Schema-derived property/value typing survives | Current compile tests | Updated positive and negative compile tests | pending |

Conditional evidence:
- High-risk scenarios: object patch accidentally accepts wrong schema values;
  computed property patches widen to arbitrary records; option fields are
  mistaken for document props.
- External research: N/A; the accepted target is grounded in current public
  contracts and TypeScript proof.
- Issue/PR provenance: N/A; user-directed local architecture migration.
- Browser/benchmark/docs/release/behavior-law owners: docs and package API
  apply; browser and benchmarks are N/A unless the audit finds a user-visible
  runtime path whose behavior cannot be proven below the browser.

Findings:
- Accepted API law: document properties are the first object argument;
  transform targeting/policy remains the second options argument.

Decisions and tradeoffs:
- Cut every positional overload rather than teaching two equivalent mutation
  paths. Computed schema keys do not justify a second public verb or signature;
  typing must be solved in the object-patch owner.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| None | 0 | N/A | N/A |

Verification evidence:
- Goal setup: active objective points to this plan; source and command evidence
  pending.

Final handoff prepared:
- Ownership and target API/runtime: pending.
- Public breaks and Plate/collaboration adoption: pending.
- Applicable browser/benchmark/docs/provenance decisions: pending.
- Proof and execution risks: pending.
- Execution order and user attention: pending.

Timeline:
- 2026-08-09T20:55:35.101Z Plite Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Ground |
| Where am I going? | Decide, prove, prepare handoff |
| What is the goal? | Make object patches the only `nodes.set` API and migrate every caller with inference preserved. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Computed generic keys may require an internal typed patch constructor; do not
  expose that machinery unless a real remaining caller proves it necessary.
