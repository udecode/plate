# Native authored changes and Suggestions

This is a project-owned file template under Task. Apply the project's standing Autogoal request for long-running work unless the user opts out. Apply `.agents/rules/task/references/workflow.md` to timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

Objective:
Choose and prove the native authored-change architecture for Suggestions,
then specify the complete Plite, Plate, collaboration, persistence and UI
adoption. Deliver the full plan without changing production code.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-09-10-native-authored-changes-and-suggestions.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- performance-observability (docs/plans/templates/packs/performance-observability.md)

Mode:

- Deep, with one Task-owned plan. Best API resolves public contracts, Plite
  Plan owns native architecture, Plate Plan supplies product adoption,
  Architect supplies competing designs, and Benchmark owns the embedded
  design experiment. Task retains scope and completion.

Completion threshold:

- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:

- TODO: Name focused source audits and planning checks. Name execution commands
  only for owners the accepted plan will change.

Constraints:

- Planning-only requests stop at handoff. Existing authorization to execute
  continues under Task once readiness is resolved. Otherwise, wait for
  execution authorization.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:

- In scope: native authored edit capture, proposal data and projections,
  dependency-aware decisions, per-author review, native input, local undo,
  optional durable authored history, persistence and collaboration; full
  Suggestions, Comments/Discussion, AI, import/export and copied UI adoption.
- Source owners: current Plite document changes, state/effects, publication,
  history, DOM/React and Yjs; Plate Suggestion, Comments, UI and their callers.
- Non-goals: production implementation, publication, release, other checkouts,
  broad repeat of the completed external research, or automatic migration of
  saved user data. Disposable design probes belong under this plan's artifacts.
- Direct Plate/collaboration adoption owners: enumerate from live source before
  target acceptance; existing owners are candidates for reuse or replacement.

Output budget strategy:

- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:

- An unresolved design-changing behavior, failed planning probe or missing
  control needed for an actual planning claim prevents readiness. Continue
  source investigation and disposable experiments while a useful path remains.
  Missing future production implementation is recorded as an execution gate,
  not a completed runtime claim.

Plite Plan state:

- status: active
- phase: ground
- next: decide
- handoff: not-prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | pending | pending |
| Task plan and execution authority verified | pending | pending |
| Current owners read | pending | pending |
| Best API target resolved | pending | `best-api design/review`, or N/A because no reusable call shape changes |
| Runtime scale applicability resolved | pending | Identify runtime layers, repeated units, size/fan-out variables, and hot work; apply `performance-observability` when any can change, or record a source-backed zero-runtime N/A |
| Pre-acceptance Benchmark probe selected | pending | Name current baseline, target path or disposable prototype, frozen cohorts/budget, deterministic counters, timing/noise, source identities, and correctness guard, or N/A |
| Mode and execution boundary resolved | pending | pending |
| Performance pack selected | pending | pending |
| User-facing operation and runtime owner identified | pending | Name the route, procedure, job, query, command, editor action, or repeated unit and its current owner |
| Scale variables and cohorts fixed | pending | Record the independent size/fan-out/concurrency variables and normal, large, stress, and pathological cohorts that apply |
| Budget frozen before target measurement | pending | Use the owning budget or predeclare absolute and relative thresholds from baseline noise; do not loosen them after measuring |
| Baseline and target probe selected | pending | Name a comparable current-owner baseline and the executable target path or smallest disposable prototype |
| Correctness guard selected | pending | Name the behavior/native/data-integrity proof that must stay green |
| Production detector decision recorded | pending | Name the owning detector and privacy boundary, or record N/A |

Work Checklist:

- [x] Capture the user's full request and preserve planning-only authority.
- [ ] Preserve the Comments motivation and current package-owned data boundary.
- [ ] Cover Google Docs-style editable proposals, accepted content, review
      grouping, comments in pending content, and author-selected decisions.
- [ ] Design authored changes for native review and optional per-author history,
      keeping proposal review, local undo and durable history distinct.
- [ ] Apply Redesign from First Principles to both current and proposed owners;
      compare accepted-base and woven representations, plus a justified
      existing/replacement substrate. Migration cost does not choose the target.
- [ ] Resolve edit capture, durable identity, dependencies, concurrent decisions,
      whole-batch atomicity, reload/compaction, position mapping and view intent.
- [ ] Enumerate every affected current consumer and assign its adoption and
      verification, including source, exports, tests, docs, registry and AI.
- [ ] Preserve the full selected Poteto planning/prototype methods through the
      Codex adapter and the project template. Run sequentially under the user's
      tool mapping; do not claim independent-agent design or review.
- [ ] Maintain one Show Me Your Work decision trail linked to original research
      and new experiment receipts. Reuse prior source-grounded evidence when valid.
- [ ] Reconcile Task, Best API, layer plans, Architect, Benchmark, Verify Plate,
      Testing, Technical Writing and all selected principle requirements before
      closure, with exact evidence and scoped inapplicability.
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
- [ ] Performance pack: capture a comparable current-owner receipt before accepting a scale-sensitive target or optimizing an existing path.
- [ ] Performance pack: measure the complete user-facing operation and isolate deterministic cost indicators such as iterations, visited units, renders, wakes, listeners, queries, or bytes.
- [ ] Performance pack: exercise normal, large, stress, and pathological cohorts where applicable; a single convenient size cannot prove scaling.
- [ ] Performance pack: record warm percentiles, cold duration, sample/warmup counts, noise, payload bytes, and deterministic work counters when the harness supports them.
- [ ] Performance pack: when the proposed path does not exist, build only the smallest disposable target prototype needed to test the claimed owner and scaling law before architecture acceptance.
- [ ] Performance pack: compare current and proposed paths using matched source identity, fixture, action, environment, sampling, and correctness guard.
- [ ] Performance pack: inspect query/render/subscription fan-out, result cardinality, pagination, repeated reads, and retained work before adding infrastructure.
- [ ] Performance pack: optimize the measured owner; do not add pooling, caches, indexes, projections, stores, or schedulers without evidence that they own the work.
- [ ] Performance pack: keep transaction-scoped database work serial unless the transaction owner explicitly supports parallel reads.
- [ ] Performance pack: evidence contains no SQL, inputs, headers, credentials, tenant/person identifiers, or protected data.
- [ ] Performance pack: add or extend a deterministic regression harness when the changed path lacked one.
- [ ] Performance pack: record every budget override with baseline, owner, reason, and expiry; permanent unexplained exceptions are forbidden.

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
| P1 autoreview | pending | Apply Task's explicit-review/PR-closeout gate and shared budget; never on next; otherwise N/A with reason | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-10-native-authored-changes-and-suggestions.md` | pending |
| Pre-acceptance scale proof | pending | Before accepting a scale-sensitive API/architecture, record the executable current-versus-target comparison across applicable cohorts, frozen budget, deterministic cost, timing/noise, source identities, and correctness result | pending |
| Warm latency budget | pending | Prove the changed operation stays within its warm percentile budget using the owning harness | pending |
| Large/stress scaling | pending | Prove cost stays within the declared growth/budget across applicable large, stress, and pathological cohorts | pending |
| Cold and failure paths | pending | Measure cold behavior and prove failure handling remains owned; do not classify no traffic as healthy | pending |
| Payload and fan-out | pending | Record payload bytes plus query/render/subscription/cardinality evidence; add bounded reads or work only when the measured owner needs them | pending |
| Production-path rerun | pending | After implementation, rerun the same cohort/budget contract on the final production path and source identity; planning-only work records N/A with the exact future owner and command | pending |
| Correctness guard | pending | Run the selected behavior/native/data-integrity guard on the measured final path | pending |
| Before/after receipt | pending | Record comparable baseline and final evidence, or N/A only when no runtime behavior or cost can change | pending |
| Detector and privacy | pending | Prove the owning runtime detector covers the changed operation without protected data, or record N/A | pending |
| Performance regression check | pending | Run the deterministic performance harness and relevant checks in the owning workspace | pending |

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

- 2026-09-10T15:02:34.126Z Plite Plan created.

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
