# Code block and external text architecture audit

Objective:
Audit the past week's code-block and external-text plans against current Plite/Plate source, public APIs, correctness, and benchmark evidence; deliver ranked findings, a challenged target, and at most three adoption phases.

Goal plan:
docs/plans/2026-09-04-code-block-external-text-architecture-audit.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- performance-observability (docs/plans/templates/packs/performance-observability.md)

Cleanup source:
- type: user-requested Auto architecture audit
- id / link: current Codex task
- title: Code block and external text architecture audit
- requested surface: full code-block/external-text owner graph across Plite, Plate, registry, docs, proof, and benchmark runners
- cleanup intent: harsh honest read-only review, including maximum-value deletion alternatives
- acceptance criteria: complete bounded plan/source manifest, evidence-backed findings, fresh focused benchmark and behavior proof, alternatives and challenge delta, at most three phases, explicit proof limits

Flow mode: agent-led plan hardening. Product/source mutation is not authorized.

User requirements:
- [x] Capture all relevant plans dated August 28 through September 4, 2026, including superseding plans and linked evidence.
- [x] Inspect the complete bounded source and public API, not only plans or a diff.
- [x] Include both Plite substrate and Plate product/composition ownership.
- [x] Audit benchmark design, fairness, freshness, and scalability; run current focused measurements.
- [x] Give harsh honest feedback and challenge accepted plans rather than defer to them.
- [x] Use Auto as the single architecture workflow; keep internal owner transitions continuous.
- [x] No implementation request: write only audit plans, disposable probes, and evidence artifacts.
- [x] No requested duration, token budget, git publication, branch changes, or external messages.
- [x] Final handoff: strongest cut, ranked current findings, measured facts, target/alternatives, challenge delta, up to three phases with proof/pivot rules, artifacts, limits, and one next action.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: bounded audit; at most three design passes
- initial confidence / cleanliness score: N/A: numerical architecture score not requested
- improvement loop: source and plans, ideal alternatives, hostile challenge, optional replay
- final score / loop closure: source-backed verdict and explicit challenge delta

Completion threshold:
- Every relevant plan and bounded owner is classified; at least five candidate cuts have source and proof; benchmark claims are reconciled against current runner code and fresh focused evidence; final report includes the required handoff and passes the plan checker.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-code-block-external-text-architecture-audit.md`
  passes.

Verification surface:
- A durable report and manifests under docs/plans/artifacts/2026-09-04-code-block-external-text-architecture-audit, current source fingerprints, focused existing tests and benchmark reruns, browser checks of the three code-block demos, and the Autogoal plan checker.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not change public API, product UX, or behavior under a cleanup packet.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:
- Source of truth: current packages/plitejs, packages/platejs, registry/examples, docs and executable benchmark/proof owners
- Allowed edit scope: this plan and its artifact directory; build outputs only as required to run current proof
- Plite / Plate boundary: shared; Plite owns canonical text, selection, history, view protocol; Plate owns code semantics and product composition
- Public API boundary: external-text protocol, coverage/view APIs, code-block descriptors and commands, registry adapter installation
- Browser surface: /blocks/code-block-demo, /blocks/code-block-huge-demo, /blocks/code-block-codemirror-demo, Plite external-text example
- Package/API surface: full reachable owners of those features, including serialization, highlighting, history, composition, selection and DOM projection
- Non-goals: unrelated feature review, product/runtime/skill edits, commits, pushes, PRs, release or deployment claims

Output budget strategy:
- Scope searches by owner and date; persist large manifests/results; read complete bounded source in chunks. Recover from the initial oversized discovery output by narrower queries.

Blocked condition:
- Required evidence unavailable with no safe alternate probe. Record the exact limit; do not turn missing proof into a favorable architecture claim.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: major audit
- current_phase: closeout
- current_phase_status: complete
- next_phase: user decision on phase 1
- goal_status: audit verified; ready for completion

Current verdict:
- verdict: keep one-Text protocol; cut external whole-block syntax transport and repeated mount scans; repair boundary failures
- cleanliness confidence: seven source-backed findings; replacement implementations remain provisional
- next owner: Auto phase 1
- keep / revert / quarantine call: keep audit artifacts only; no product packet applied
- reason: corrected oracle, current scale rerun, CPU profile and boundary diagnostics overturn broader closure claims

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-code-block-external-text-architecture-audit.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User requirements above captured before work; audit-only scope. |
| Timed checkpoint parsed | yes | No duration or token budget requested. |
| `architecture-cleanup` loaded | yes | Auto architecture, architecture-cleanup, best-api, benchmark/methodology and Vision read. |
| Active goal checked or created | yes | One durable goal points to this plan. |
| Source of truth read before analysis | yes | Live owner files and past-week plans; memory used only to find prior work. |
| VISION fit gate read | yes | VISION.md and relevant common/Plite/Plate doctrine read. |
| Plite / Plate boundary selected | yes | Shared Plite substrate, Plate code semantics, copied CodeMirror view. |
| Cleanup surface selected | yes | Final manifest: 53 files; plan inventory: 26 plans. |
| Non-goals recorded | yes | No product/API/skill edits, publication or unrelated repo audit. |
| Output budget strategy recorded | yes | Scoped searches, chunked reads and artifacted receipts. |
| Implementation authority decided | yes | Read-only product audit; this plan and its artifact directory are the write scope. |
| Proof strategy selected | yes | Exact-token paired probe, full production substrate run, profile, focused tests and real route inspection. |
| Runtime scale applicability resolved | yes | Text/decorations, block/view fan-out and splice count grow; performance pack applies. |
| Performance pack selected | yes | performance-observability pack applied. |
| User-facing operation and runtime owner identified | yes | Typing/highlight settle in code demos and external projection mount in ExternalTextRuntime.register. |
| Scale variables and cohorts fixed | yes | Frozen 30-cell substrate matrix; unchanged 10000-line TypeScript product fixture. |
| Budget frozen before target measurement | yes | Existing caps retained: product input 200ms/settle 600ms; 1000-block mount 150ms; no overrides. |
| Baseline and target probe selected | yes | Original paired runner versus corrected oracle on same product; current substrate/profile. Replacement runtime is not accepted. |
| Correctness guard selected | yes | Canonical text, DOM/subscription limits, focused suites, current product corpus and new boundary assertions. |
| Production detector decision recorded | no | N/A: no deployed detector changes; synthetic demo fixtures and local counters only. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Source map records largest files, owner files, package exports, public /
      private boundaries, tests, and proof owners for the surface.
- [x] Deslop inventory records wrappers, pass-through modules, duplicate
      helpers, vague names, stale compatibility, over-broad barrels, orphan
      tests, and stale source-owner oracles.
- [x] Candidate matrix ranks at least five candidates unless the prompt names a
      smaller surface.
- [x] Every candidate has a decision: delete, merge, inline, simplify, split,
      keep, defer, reject, or plan.
- [x] Every candidate records an agent-navigation score: files-to-read,
      owners-touched, proof clarity, public/private clarity, and net effect.
- [x] Anti-confetti rule applied: no split is accepted without durable owner,
      stable name, focused proof, and lower future navigation cost.
- [x] Merge/delete/inline are considered as seriously as extraction.
- [x] VISION fit is recorded; missing reusable taste routes to `vision` or
      `sync-vision`.
- [x] Implementation packets are behavior-neutral, public-API-neutral, narrow,
      reversible, and have focused proof.
- [x] Every hot-owner packet has a frozen pre-packet scale receipt and exact
      post-packet production rerun plus correctness guard; paper complexity or
      "benchmark later" cannot justify keep.
- [x] Each implementation packet ends keep, revert, or quarantine.
- [x] Source-owner oracle is added or repaired when ownership moves, or N/A
      reason is recorded.
- [x] Focused proof is run before broad proof for changed code.
- [x] Broad proof is run after multiple packets, import churn, or public/package
      boundary changes.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed.
- [x] Performance pack: capture a comparable current-owner receipt before accepting a scale-sensitive target or optimizing an existing path.
- [x] Performance pack: measure the complete user-facing operation and isolate deterministic cost indicators such as iterations, visited units, renders, wakes, listeners, queries, or bytes.
- [x] Performance pack: exercise normal, large, stress, and pathological cohorts where applicable; a single convenient size cannot prove scaling.
- [x] Performance pack: record warm percentiles, cold duration, sample/warmup counts, noise, payload bytes, and deterministic work counters when the harness supports them.
- [x] Performance pack: when the proposed path does not exist, build only the smallest disposable target prototype needed to test the claimed owner and scaling law before architecture acceptance.
- [x] Performance pack: compare current and proposed paths using matched source identity, fixture, action, environment, sampling, and correctness guard.
- [x] Performance pack: inspect query/render/subscription fan-out, result cardinality, pagination, repeated reads, and retained work before adding infrastructure.
- [x] Performance pack: optimize the measured owner; do not add pooling, caches, indexes, projections, stores, or schedulers without evidence that they own the work.
- [x] Performance pack: keep transaction-scoped database work serial unless the transaction owner explicitly supports parallel reads.
- [x] Performance pack: evidence contains no SQL, inputs, headers, credentials, tenant/person identifiers, or protected data.
- [x] Performance pack: add or extend a deterministic regression harness when the changed path lacked one.
- [x] Performance pack: record every budget override with baseline, owner, reason, and expiry; permanent unexplained exceptions are forbidden.

Applicability of checked work items:
- Implementation-packet, post-implementation broad-proof, source-move, and runtime-preservation items are N/A: no product packet was applied. Audit probes are kept as evidence.
- Pre-acceptance prototype and current-versus-replacement items are N/A for acceptance: replacement syntax and mount implementations explicitly remain provisional. Phase 2/3 freeze their proof gates; this audit does not claim they are faster.
- Current-owner performance items are satisfied by full substrate replay, isolated profile and exact-token paired probe. Existing correctness suites pass; diagnostic and budget failures are the reported outcome.
- Database serialization and deployed detectors are N/A: no database/deployment work. Permanent regression-suite repairs are proposed phase 1, while disposable diagnostic assertions are supplied here.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Scope, seven findings, nine cuts, receipts, challenge delta and three phases are complete in review.md. |
| Source map complete | yes | Record current owners, largest files, exports, tests, and proof owners | source-manifest.json has 23 primary owners/references, 19 boundary traces, 11 proof owners and hashes. |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | Duplicate key algorithms/oracles, stale docs and repeated validation identified; no file-size extraction. |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | Nine ranked decisions and source/proof references in review.md. |
| Agent-navigation score complete | yes | Record before/after or expected files-to-read / owner / proof clarity changes | Cut ledger records current files/owners and expected proof/API effects; no invented numeric architecture score. |
| Anti-confetti gate | yes | Prove accepted splits reduce navigation cost or record no split accepted | No file split or wrapper proposed solely for size. |
| Delete / merge / inline gate | yes | Record considered simplifications and why accepted/rejected | Syntax transport, validation scans, duplicate benchmark logic and stale docs challenged; core protocol retained. |
| VISION fit gate | yes | Confirm fit to VISION.md or record sync-vision/stop decision | Model/history/view laws retained; proposed syntax teaching has exact future best-api repair obligations. |
| Implementation packet gate | no | For every code packet, record keep/revert/quarantine and focused proof | N/A: no product implementation authorized/applied; artifact probes kept. |
| Hot-owner scale preservation | no | For every applicable packet, compare matched pre/post normal/large/stress cohorts with frozen budget, deterministic cost, timing/noise, source identities, and correctness guard; otherwise source-backed zero-runtime N/A | N/A: replacement targets remain provisional; baseline and profile evidence recorded without acceptance. |
| Source-owner oracle gate | yes | Repair or add tests/oracles when ownership moves, or N/A | Corrected exact-token diagnostic proves oracle defect; permanent repair belongs to phase 1. |
| Public API / behavior safety gate | yes | Prove no public API/product behavior changed, or route to plan owner | No product/API changes; current shapes, survivors and rejected escape hatches recorded. |
| Package/API proof | yes | Run relevant package/export/type/build proof when package boundaries changed, or N/A | 56 focused Plite and 51 code-block tests pass; inference contract/exports read. No boundary changed. |
| Browser proof | yes | Run Browser/Playwright proof when visible behavior changed, or N/A | Four product browser tests pass across three routes; Browser inspected CodeMirror. Diagnostic fails three intended invariants. |
| Final lint/check | yes | Run focused/broad lint/typecheck/test appropriate to touched files | Artifact/source validation appropriate to review-only work; no root check/product-clean claim. Plan checker below. |
| Output budget discipline | yes | Verify no unbounded high-volume output was streamed, or record recovery | Oversized reads were recovered with narrower chunks; supporting depth and remaining proof limits disclosed. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish current packet cleanly; otherwise N/A | N/A: no requested duration. |
| Final handoff contract | yes | Fill changed list, cleanup counts, proof, needs-review, residual risks, and next owner | review.md contains final verdict, changes, metrics, limits, challenge, three phases and next action. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-code-block-external-text-architecture-audit.md` | Run check-complete.mjs; store result in plan-check.log. |
| Pre-acceptance scale proof | no | Before accepting a scale-sensitive API/architecture, record the executable current-versus-target comparison across applicable cohorts, frozen budget, deterministic cost, timing/noise, source identities, and correctness result | N/A: runtime replacements not accepted; phases 2/3 require matched executable prototypes and correctness before adoption. |
| Warm latency budget | yes | Prove the changed operation stays within its warm percentile budget using the owning harness | Current mount and native product budgets fail; completed audit finding, not green implementation proof. |
| Large/stress scaling | yes | Prove cost stays within the declared growth/budget across applicable large, stress, and pathological cohorts | All 30 substrate cohorts run; isolated 1000-block mount failure reproduced. |
| Cold and failure paths | yes | Measure cold behavior and prove failure handling remains owned; do not classify no traffic as healthy | Cold/warm mount measured; contract suite covers rejects/resets/cleanup; uncovered boundary defects recorded. |
| Payload and fan-out | yes | Record payload bytes plus query/render/subscription/cardinality evidence; add bounded reads or work only when the measured owner needs them | 448889-unit product; block/view matrix; million-entry projection filter; 418 substrate fingerprints. |
| Production-path rerun | yes | After implementation, rerun the same cohort/budget contract on the final production path and source identity; planning-only work records N/A with the exact future owner and command | Current substrate rebuilt and replayed. Product production Next and replacement reruns are future gates. |
| Correctness guard | yes | Run the selected behavior/native/data-integrity guard on the measured final path | 107 focused tests and four product tests pass; three diagnostic assertions fail on current source and remain findings. |
| Before/after receipt | yes | Record comparable baseline and final evidence, or N/A only when no runtime behavior or cost can change | Original versus exact-oracle receipt on unchanged source; no product implementation before/after claim. |
| Detector and privacy | no | Prove the owning runtime detector covers the changed operation without protected data, or record N/A | N/A: no deployed detector; synthetic public fixtures, no protected data. |
| Performance regression check | yes | Run the deterministic performance harness and relevant checks in the owning workspace | Full substrate red and isolated profile confirms mount cause; corrected product reveals false settle. Exact failures preserved. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | prompt captured; 26 plans screened | source map |
| Source map | complete | 53-file manifest and hashes | inventory |
| Deslop inventory | complete | seven source-backed findings | challenge |
| Candidate matrix | complete | nine decisions and three design passes | owner routing |
| Cleanup packets / owner routing | complete | no product changes; proposed phases 1-3 | evidence |
| Verification | complete | tests, diagnostic failures, scale/profile and fingerprints | closeout |
| Closeout | complete | review.md and this record | user decision on phase 1 |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | Strong | External syntax transport | BaseCodeBlockPlugin, CM adapter, decoration manager, external runtime | 15/15 false early settle; true p50 399.5ms | 6 syntax-path files to renderer/language ownership, provisional | remove round trip | Plate renderer | exact-token receipt | plan |
| 2 | Strong | Repeated root validation | external runtime, binding, commit fence | million projection visits at 1000 blocks | same 3 owners, no new store | validate once per relevant change | Plite runtime | 30-cell receipt/profile | plan |
| 3 | Strong | Unguarded composition keys | CM adapter | composing Enter changes canonical text | 1 owner, exact oracle | honor composition first | copied renderer | boundary probe | plan |
| 4 | Strong | Missing selection paint | adapter, protocol, runtime | model selection exists but is unpainted | same 3 contracts, no new selection owner | implement model paint | copied renderer | boundary probe | plan |
| 5 | Strong | Duplicate code key rules | native plugin, adapter | Tab indents wrong line | one rule owner plus integrations; public placement provisional | consolidate behavior | code-block package | source and keyboard probe | plan |
| 6 | Strong | Dated duplicate benchmark logic | paired/Tiptap runners | same faulty oracle copied | 2 drifting oracles to existing maintained owner | merge executable authority | benchmark | source audit | merge |
| 7 | Strong | One Text, external protocol, retained DOM | source manifest | distinct current model/native jobs | preserve canonical owners | keep | Plite/Plate | 107 focused tests | keep |
| 8 | Strong | Stale API teaching | code-block.mdx | nonexistent queries/syntax-mark claim | reference live descriptor reads | delete stale teaching | docs | exports/source search | delete |
| 9 | Strong | Universal CM or CodeLine/island model | historical plans/VISION | changes native/model contract | deletion displaces ownership | reject | architecture | contract comparison | reject |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Scale receipt / N/A | Result | Next |
|--------|--------|-------|-------|-------|---------------------|--------|------|
| Audit | review/probes/replays | Auto architecture | this plan and artifact directory | review.md with receipt links | current baseline/profile; no accepted runtime target | keep | phase 1 if implementation requested |

Cleanup counts:
- delete: 1 proposed documentation candidate; zero product deletions applied
- merge: 1 proposed benchmark candidate; zero product merges applied
- inline: 0
- simplify: 0 separately counted
- split: 0
- keep: 1 grouped model/protocol/native-owner decision
- defer: 0 separately counted; provisional implementations remain within five plans
- reject: 1 grouped universal-renderer/persisted-island alternative
- plan: 5

Changed list:
- code/runtime/API: none
- tests/oracles: artifact-only exact-token runner and boundary diagnostic
- docs/plans: this plan, review.md, manifests, receipts/logs/profile and screenshot
- skills/workflow: none; future best-api repair recorded
- reverted/quarantined: no product attempts; diagnostic artifacts retained with explicit limits

Needs review:
- Phase 1 implementation is the next action; this request authorizes the audit.
- Runtime replacements remain provisional until matched prototypes preserve correctness and scale.

Verification evidence:
- Plite: 56 focused tests across external text, retained flow and DOM point indexing pass.
- Plate: 51 code-block tests pass.
- Product: four Chromium tests across three code demos pass; in-app Browser inspected CodeMirror.
- Boundary diagnostic: three correct-behavior assertions fail, proving composition Enter, model paint and leading-line Tab defects. No fix claimed.
- Production substrate: 30 cohorts, 418 stable source hashes, six mount-budget failures plus one noise failure. Isolated mount failure reproduces.
- Paired product: 3 warmups/15 samples per renderer, corrected exact-token oracle; all 15 CM samples false under old oracle. Native timing noise disclosed.
- Final manifest: 53 unchanged files; source-manifest-verification.json. Full command/receipt links and limits in review.md.
- Final receipt recheck: all 418 substrate inputs match; the paired run's generated public/r/registry.json changed afterward, while its sampled implementation inputs remain identical. Aggregate final-checkout equivalence is not claimed.
- Audit plan checker: plan-check.log.

Open risks:
- Seven current findings remain unfixed; audit completion does not mean product cleanliness.
- No physical OS IME, screen-reader/mobile, native OS print, real collaboration transport or production Next product certification.
- Product source fingerprint is narrower than its full transitive graph. Historical engine comparisons were not rerun.

Final handoff contract:
- Source roots inspected: Plite, Plate, registry/examples/tests, public docs, benchmark and historical plan owners.
- Candidate count and top recommendation: nine; cut external whole-block syntax transport while retaining the narrow protocol.
- Cleanup counts: five plans, one merge, one keep, one documentation delete, one rejection; no product edits.
- Agent-navigation score changes: expected file/owner effects in cut ledger; no unmeasured numeric architecture score.
- Packets applied with keep/revert/quarantine result: keep artifact-only audit.
- Proof commands/source audits: 107 focused and four product tests pass; exact diagnostic/budget failures and commands in review.md.
- Hot-owner pre/post scale receipts or source-backed zero-runtime N/A: current baseline/profile only; no runtime target accepted or improvement claimed.
- Rejected/deferred candidates: universal CM, CodeLine/island schema, generic command escape; syntax implementation remains provisional.
- Needs-review list: phase-1 oracles and later native/multi-view proof obligations.
- Residual risks: Open risks above.
- Next owner and exact first command/file: Auto phase 1 begins at the paired runner code-block-variants-product-benchmark.mjs:359 and this artifact directory's audit-browser.spec.ts; permanent changes belong in existing owning suites.

Timeline:
- 2026-09-04T19:28:25.817Z Architecture-cleanup goal plan created.
- 2026-09-04 Source audit, current replays/profile, boundary diagnostics, tests and report completed; no product mutation.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Audit complete; current implementation findings remain |
| Where am I going? | User decision on proposed phase 1 |
| What is the goal? | Harsh source/API/benchmark audit of past-week code-block and external-text work |
| What have I learned? | Model/protocol survive; oracle, boundaries, mount scaling, duplicate rules and docs need repair |
