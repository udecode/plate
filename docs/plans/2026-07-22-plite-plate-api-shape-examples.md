# Plite Plate API Shape Examples

Objective:
Make every ranked Plite/Plate API audit packet visually judgeable; done when
25/25 packets have explicit before/after shapes and planning gates pass.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-22-plite-plate-api-shape-examples.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard`: this refines an existing source-backed architecture audit without
  implementation or new external research.

Completion threshold:
- The ranked audit contains exactly 25 numbered shape contracts, ranks 0-24,
  and every contract has explicit `Before` and `After` examples.
- Bundled packets show every material sub-change, not one token example that
  hides the rest.
- Rejected tempting rewrites show the rejected shape beside the retained shape.
- The source audit, link check, `git diff --check`, and `check-complete` pass.

Verification surface:
- Artifact audit of
  `docs/plans/artifacts/plite-plate-agent-native-api-shape-audit/api-shape-ledger.md`.
- A bounded parser verifies ranks 0-24 each contain `Before` and `After`.
- Markdown local-link audit, `git diff --check`, and this plan's
  `check-complete.mjs` gate.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plite-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Do not implement package/app source. These examples are proposed target
  contracts and must be labeled when exact naming remains an execution choice.
- Preserve the audit's accepted distinctions: imported pure builders, justified
  command/schema factories, strict versus optional hooks, and Plate-owned DOM
  policy.

Boundaries:
- In scope: all 25 ranked packets and the rejected-shape pressure pass in the
  existing API-shape ledger.
- Source owners: Plite core/React/DOM/layout/browser and Plate core/React/Yjs
  public authoring surfaces already cited by the ledger.
- Non-goals: implementation, migration aliases, package export changes,
  runtime/browser claims, and a second decision ledger.
- Direct Plate/collaboration adoption owners: documented inside each affected
  packet; no caller migration occurs in this planning-only refinement.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if the existing packet decision cannot determine a coherent target
  shape without a new user intent decision. Wording or naming uncertainty is
  resolved by choosing and labeling an illustrative target, not by stopping.

Plite Plan state:
- status: ready
- phase: prove-and-hand-off
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | 25/25 numbered before/after contracts; bundled sub-changes and rejected rewrites included. |
| Active goal and plan verified | yes | Goal objective names this exact plan and auditable threshold. |
| Current owners read | yes | Existing live-source ledger plus root and Plite vision doctrine re-read on 2026-07-22. |
| Mode and execution boundary resolved | yes | Standard agent-led plan hardening; planning artifacts only. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims remain sourced by the
  existing ledger; this refinement adds no new current-state claims.
- [x] Add one explicit before/after shape contract for every rank 0-24.
- [x] Expand bundled packets so every material sub-change is visible.
- [x] Show the four strongest rejected rewrites beside retained shapes.
- [x] Run the 25/25 parser, local-link audit, `git diff --check`, and plan checker.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Exactly 25 ranks, every pair explicit, bundled changes and rejected alternatives visible. |
| Fresh source evidence | yes | Recheck decision-changing current claims | No new current-state claim; existing source-backed ledger retained, current shortcut/target/tx owners spot-checked. |
| Conditional risk and adoption | no | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | N/A: planning presentation only; implementation and caller adoption remain in the accepted execution packets. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | 25/25 parser, bundled-packet audit, local-link audit, and `git diff --check` pass. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Link the shape-contract section and state that no product implementation occurred. |
| Autoreview | no | Run for implementation changes or record planning-only N/A | N/A: no implementation source changed; focused artifact self-review found no missing rank or hidden bundle member. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plite-plate-api-shape-examples.md` | `[autogoal] complete` on 2026-07-22 after final evidence update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Existing ledger, vision doctrine, and 25-packet ranking read | Decide |
| Decide | completed | Added 25 numbered contracts and four rejected-rewrite pairs | Prove and hand off |
| Prove and hand off | completed | Parser, bundle audit, link audit, and diff check pass | User review |

Decision brief:
- outcome: every recommendation can be judged from concrete TypeScript-like
  before/after usage without reading the whole prose ledger.
- chosen shape: one numbered contract per execution packet, with additional
  pairs inside bundled packets and an explicit rejection gallery.
- strongest rejected alternative: a single representative example per broad
  packet; rejected because it would still hide material public breaks.
- consequence: the artifact becomes implementation-reviewable while remaining
  planning-only.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| API-shape visibility | Classified prose and a 25-row ranking | 25 numbered before/after contracts plus rejected-shape gallery | Existing ledger | User must see what each packet means | Planning artifact only; implementation owners unchanged | Parser and link audit | Examples could accidentally imply compatibility or settled internal names | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1 | API audit artifact | Add ranks 0-24 before/after contracts and rejection gallery | Existing decisions resolved | 25/25 visible pairs | Bounded parser |
| 2 | Goal plan | Reconcile evidence and handoff | Slice 1 complete | All plan gates resolved | Link audit, diff check, checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Exactly 25 packet contracts | Heading/parser audit reports 25 unique ranks 0-24 | N/A: planning-only | pass |
| Every packet has both shapes | Per-section marker audit reports `Before` and `After` for all 25 | N/A: planning-only | pass |
| No bundled change is hidden | Focused packet 4/6/11/12/20/22/23 term audit | N/A: planning-only | pass |
| No broken local evidence links | Markdown local-link audit resolves every local target | N/A: planning-only | pass |

Conditional evidence:
- High-risk scenarios: N/A; no runtime/API implementation occurs.
- External research: N/A; this is a presentation refinement of a completed
  live-source audit.
- Issue/PR provenance: N/A; no issue-backed claim.
- Browser/benchmark/release/behavior-law owners: N/A; planning-only docs change.
  Docs proof applies through the parser, link audit, and diff check.

Findings:
- The execution ranking is exhaustive but not visually self-sufficient: only a
  subset of target shapes appear elsewhere in the ledger.
- “All” means all 25 packets, including every material member of cleanup,
  layout, React, and browser bundles.

Decisions and tradeoffs:
- Use illustrative public examples, not pseudo-internal implementation code.
- Label names as target contracts; do not add compatibility forms merely to
  make migration look easier.

Review fixes:
- User finding: “all” was not visually auditable from classifications and a
  ranking alone -> accepted -> added 25 numbered before/after contracts and a
  four-item rejected-rewrite gallery.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| None | 0 | N/A | N/A |

Verification evidence:
- `node` shape/link audit -> PASS: 25/25 contracts, unique ranks 0-24,
  `Before`/`After` present, every local link resolves.
- Focused bundled-packet audit -> PASS for transaction, lifecycle, React,
  layout, cleanup, and browser/mobile sub-changes.
- `git diff --check -- <goal-plan> <api-shape-ledger>` -> pass with no output.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plite-plate-api-shape-examples.md`
  -> `[autogoal] complete`.

Final handoff prepared:
- Ownership and target API/runtime: link all 25 numbered shape contracts.
- Public breaks and Plate/collaboration adoption: each contract shows the
  caller-visible replacement; the original ranking retains execution order.
- Applicable browser/benchmark/docs/provenance decisions: docs-only proof;
  browser, benchmark, release, and provenance are N/A for this refinement.
- Proof and execution risks: examples are architecture contracts, not compile
  evidence; each accepted implementation packet still owes its named proof.
- Execution order and user attention: review the concrete shapes before
  accepting any implementation plan.

Timeline:
- 2026-07-22T16:23:10.335Z Plite Plan created.
- 2026-07-22T18:27:16+02:00 Added ranks 0-24 before/after contracts and four
  rejected-rewrite comparisons; shape/link/bundle/diff checks pass.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Planning refinement and all verification are complete. |
| Where am I going? | Hand the concrete shapes to the user for review. |
| What is the goal? | Make all 25 audit packets visually judgeable before implementation. |
| What have I learned? | A ranked concept ledger is not enough when the target public spelling is the decision. |
| What have I done? | Added and mechanically audited all 25 pairs plus rejected alternatives. |

Open risks:
- No open planning risk. Implementation remains intentionally unstarted and
  must compile/prove each target shape in its ranked packet.
