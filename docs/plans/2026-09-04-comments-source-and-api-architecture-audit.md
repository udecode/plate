# Comments source and API architecture audit

Objective:
Audit the complete Comments source/API and the past week's related plans; finish with source-backed ranked cuts, a challenged target, explicit proof limits, and at most three adoption phases.

Flow mode:
agent-led plan hardening; read-only product audit.

Linked plans:
- N/A: historical plans are evidence, not child execution goals.

Goal plan:
docs/plans/2026-09-04-comments-source-and-api-architecture-audit.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- performance-observability (docs/plans/templates/packs/performance-observability.md)

Cleanup source:
- type: direct user request
- id / link: current Codex task
- title: Harsh honest feedback on the full Comments source and API
- requested surface: all current Comments package, registry/UI, adapters, public exports, consumers, tests, docs, and directly owning Plite anchor/annotation contracts; related plans from 2026-08-28 through 2026-09-04.
- cleanup intent: reconsider architecture from first principles through Auto; accepted prior plans are evidence rather than constraints.
- acceptance criteria: complete bounded manifest, every public declaration and owner classified, all matching weekly plans accounted for, at least five grounded candidates, at least two materially different targets, hostile challenge delta, at most three adoption phases, exact source/proof references and one next action.

First checkpoint:
- [x] Review all latest Comments plans from the past week (2026-08-28 through 2026-09-04 inclusive); account for related Discussion, Suggestions, anchor/history, rendering, and subscription work where it changes Comments.
- [x] Audit the full current Comments source and API; materialize and close an explicit source/export/consumer manifest.
- [x] Give harsh honest feedback, leading with the maximum materially justified hard cut; separate verified facts from design proposals.
- [x] Use Auto architecture mode and route API/cleanup evidence internally.
- [x] Treat the newly available model as a request for a fresh judgment; no model switch or agent delegation requested.
- [x] Product/source mutations, Git changes, publication, and external messages are not authorized; only this plan and local evidence artifacts may be written.
- [x] No duration or timed loop requested; finish when the audit checklist and final handoff are complete, with proof limits made explicit.
- [x] Final handoff must contain target/owner, strongest finding, alternatives/rejections, challenge delta, adoption phases/checkpoints/pivots/proof, cut obligations, execution state, evidence/artifacts, and one next action.
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no timebox requested
- semantics: audit to completion
- initial confidence / cleanliness score: N/A: evidence-backed priority verdict, not a numeric architecture score
- improvement loop: ideal and alternatives, hostile challenge, third replay only if improved
- final score / loop closure: complete after source and proof accounting

Completion threshold:
- Every selected weekly plan and every file/public declaration in the final manifest has a reviewed status or a precise exclusion. At least five candidates, two materially different alternatives, one challenge delta, and at most three adoption phases are documented. Focused executable proof is run for material claims; unproved runtime targets remain provisional.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-comments-source-and-api-architecture-audit.md`
  passes.

Verification surface:
- Current source, public exports/types, call sites, docs, weekly plan evidence; focused existing Comments/annotation tests and disposable audit probes where needed. Runtime target acceptance requires a comparable executable probe. No broad product test gate is implied by writing only audit artifacts.

Embedded architecture probe contract (frozen before results):
- Operation: save one comment message body using the existing channel versus a disposable keyed-record implementation of the same edit/permission/immutable-message/narrow-subscription law. This is an owner probe, not browser input latency.
- Cohorts: 100, 1,000, and 10,000 real stored threads with one message each; pathological 10,000 threads with 1,000 messages in the edited thread. Register one keyed subscriber for every stored thread.
- Budget: reuse the historical 5 ms body-edit p95 budget. Candidate must also stay within baseline p95 plus max(0.05 ms, 10%). At 10,000 single-message threads, require at least 2x and 0.1 ms improvement before claiming a material latency win; otherwise report deterministic work only.
- Repeated work: record visited Map entries in one separate instrumented edit, target/unrelated/list/anchor notifications, preserved old thread/body snapshots, and unrelated record identity.
- Sampling: 50 warmups, 300 interleaved baseline/target operations; p50/p95/max, cold construction, and raw samples. No source changes between the compared paths. Fingerprint source, harness, lockfile and runtime version. No production telemetry or protected data.
- Prototype scope: replace whole-map snapshot publication with private keyed records and exact immutable record reads. No new package abstraction, backend protocol, scheduler, or index. Full UI/adoption behavior remains a phase-one gate.

Current observations:
- The 14 direct weekly Comments/Discussion plans are inventoried alongside contextual and incidental matches in `artifacts/comments-source-api-audit/weekly-plan-inventory.json`.
- Existing focused proof: 20 tests, 104 assertions, zero failures across package Comments, channel, and Discussion.
- Historical channel benchmark populated one record and registered 10,000 subscriptions; it did not exercise 10,000 stored records.
- Browser attempt initially found no server; started the existing www dev command for read-only inspection.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not change public API, product UX, or behavior under a cleanup packet.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:
- Source of truth: live checkout; historical plans and memory provide context only.
- Allowed edit scope: this plan and docs/plans/artifacts/comments-source-api-audit/ only.
- Plite / Plate boundary: Plate Comments is primary; Plite owns durable anchor/history/annotation mechanics. App source owns thread truth and UI composition.
- Public API boundary: platejs/comments and matching React/registry consumers; directly involved facade exports only.
- Browser surface: Comments and Discussion demos and editor-ai if relevant and runnable; no product changes.
- Package/API surface: full Comments owner and its direct shared dependencies; unrelated features excluded.
- Non-goals: implementation, broad unrelated cleanup, Git/PR/release work, rewriting past plans, new model configuration, external communications.

Output budget strategy:
- Inventory filenames/counts first; read bounded source and plan slices, exclude generated trees and large logs unless explicitly selected; write receipts locally. Two initial combined skill reads exceeded aggregate output limits; subsequent reads use explicit aggregate caps and narrow recovery slices.

Blocked condition:
- Required source unavailable after bounded alternative reads. Missing browser/runtime evidence limits the claim; it does not block the source/API audit or authorize product changes.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: high, bounded Comments audit
- current_phase: closeout
- current_phase_status: complete
- next_phase: proposed implementation, only upon authorization
- goal_status: audit complete

Current verdict:
- verdict: keep the thin Comments owner; cut duplicated subject lifecycle and location state
- cleanliness confidence: four reproduced correctness findings, two source cost findings, one integration gap
- next owner: Auto routes phase 1 through the local bug and API adoption owners
- keep / revert / quarantine call: keep audit artifacts; no product packet applied
- reason: real product jobs survive while competing authorities are removed; full target remains gated

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-comments-source-and-api-architecture-audit.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint predates source exploration and every requested deliverable is closed in audit.md. |
| Timed checkpoint parsed | no | N/A: no duration was requested. |
| `architecture-cleanup` loaded | yes | Read source skill, Auto architecture reference and Best API before choosing cuts. |
| Active goal checked or created | yes | Created the quantitative audit goal with this plan path; no token budget. |
| Source of truth read before analysis | yes | Full primary source and direct dependency slices listed in source-manifest.json. |
| VISION fit gate read | yes | Read VISION.md and relevant common/Plate entity, projection and lifetime law. |
| Plite / Plate boundary selected | yes | Plite Annotation maps anchors; Plate Comments adapts UI semantics; app owns entities. |
| Cleanup surface selected | yes | Six primary files, direct proof/consumers/docs; 33-file bounded source manifest. |
| Non-goals recorded | yes | Read-only product audit; no implementation, Git or external communication. |
| Output budget strategy recorded | yes | Scoped inventories and bounded recovery after aggregate output truncation. |
| Implementation authority decided | no | N/A: product edits not requested; only plan and disposable evidence artifacts. |
| Proof strategy selected | yes | Existing focused tests, four actual-source counterexamples, live Browser and keyed-edit owner probe. |
| Runtime scale applicability resolved | yes | C5 whole-map writes and C6 order map scale with stored annotations; C2/C4 target proof remains gated. |
| Performance pack selected | yes | performance-observability plus Benchmark methodology; contract frozen before measurement. |
| User-facing operation and runtime owner identified | yes | Save one message body; copied createCommentsChannel.edit owns the isolated measured operation. |
| Scale variables and cohorts fixed | yes | 100/1k/10k stored threads, one subscriber each; 10k with 1000 messages in edited thread. |
| Budget frozen before target measurement | yes | 5 ms p95, baseline tolerance and material-win threshold recorded above before results. |
| Baseline and target probe selected | yes | Actual channel edit versus disposable keyed-record edit with matched behavior. |
| Correctness guard selected | yes | Permissions, rich-body cloning, old snapshots, unrelated identity and one targeted wake. |
| Production detector decision recorded | no | N/A: library/demo has no deployed telemetry owner; deterministic local probe only. |

Work Checklist:
Applicability: this is a read-only audit. Product implementation, moved-owner tests, full post-implementation scale reruns, broad package/type checks and database transaction gates are N/A. The executable target is only the isolated edit prototype; full UI/cold/failure-path acceptance stays with the three proposed phases. All checked implementation rows below mean this explicit N/A, not completed product work.
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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | 20 existing focused tests, four counterexamples, two migration tests, one scale probe; all logged. |
| Source map complete | yes | Record current owners, largest files, exports, tests, and proof owners | source-manifest.json: 33 hashed files and explicit width; declarations.json: 78 reviewed declarations. |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | audit.md C1-C7: competing lifecycle/location state, wide writes, stale oracles and adoption gap. |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | 12 ranked decisions below; 7 findings with exact owners, proofs and proposed changes. |
| Agent-navigation score complete | yes | Record before/after or expected files-to-read / owner / proof clarity changes | Per-candidate expected files/owners and proof/public clarity recorded below; no claimed measured implementation change. |
| Anti-confetti gate | yes | Prove accepted splits reduce navigation cost or record no split accepted | No split accepted; file length alone does not justify another module. |
| Delete / merge / inline gate | yes | Record considered simplifications and why accepted/rejected | Three materially different architectures challenged; deletion of the whole plugin/store rejected for independent jobs. |
| VISION fit gate | yes | Confirm fit to VISION.md or record sync-vision/stop decision | External entities, one canonical Annotation projection, editor-local view state and atomic slots fit current law. |
| Implementation packet gate | no | For every code packet, record keep/revert/quarantine and focused proof | N/A: no product code packet; keep all audit evidence, no source revert required. |
| Hot-owner scale preservation | yes | For every applicable packet, compare matched pre/post normal/large/stress cohorts with frozen budget, deterministic cost, timing/noise, source identities, and correctness guard; otherwise source-backed zero-runtime N/A | Planning only: keyed-write pre-acceptance probe passed; subject/projection/activation runtime changes remain gated. |
| Source-owner oracle gate | no | Repair or add tests/oracles when ownership moves, or N/A | N/A: no ownership moved. Four disposable counterexamples define future desired-behavior oracles. |
| Public API / behavior safety gate | yes | Prove no public API/product behavior changed, or route to plan owner | No product/API edits. Proposed setActive/target adoption routes to Best API repair and Plate plan. |
| Package/API proof | no | Run relevant package/export/type/build proof when package boundaries changed, or N/A | N/A: package exports/types unchanged; source/export/type-test audit complete, no fresh full typecheck claim. |
| Browser proof | yes | Run Browser/Playwright proof when visible behavior changed, or N/A | Live /blocks/discussion-demo Accept then Cmd+Z confirms C1; browser-evidence.md records the observed result. |
| Final lint/check | yes | Run focused/broad lint/typecheck/test appropriate to touched files | Artifact-only task: focused executable proof and source hash verification; root check not required or claimed. |
| Output budget discipline | yes | Verify no unbounded high-volume output was streamed, or record recovery | Initial and one final combined read truncated; reran bounded slices. No evidence inferred from truncated portions. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish current packet cleanly; otherwise N/A | N/A: no timebox requested. |
| Final handoff contract | yes | Fill changed list, cleanup counts, proof, needs-review, residual risks, and next owner | audit.md includes target, ranked cuts, challenge delta, alternatives, three phases, proof limits and exact next action. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-comments-source-and-api-architecture-audit.md` | Run check-complete.mjs after this finalization; command result is recorded in plan-check.log. |
| Pre-acceptance scale proof | yes | Before accepting a scale-sensitive API/architecture, record the executable current-versus-target comparison across applicable cohorts, frozen budget, deterministic cost, timing/noise, source identities, and correctness result | channel-cost.json has matched current/prototype operation receipts; only keyed-write boundary is accepted at owner level. |
| Warm latency budget | yes | Prove the changed operation stays within its warm percentile budget using the owning harness | All four current/target p95 cohorts below frozen 5 ms; 10k single-message delta exceeds frozen material-win threshold. |
| Large/stress scaling | yes | Prove cost stays within the declared growth/budget across applicable large, stress, and pathological cohorts | 100/1k/10k real records plus 1000-message edited thread; deterministic baseline Map visits equal N. |
| Cold and failure paths | yes | Measure cold behavior and prove failure handling remains owned; do not classify no traffic as healthy | Cold durations logged but not comparable full-feature mount. Permissions/invalid bodies tested; async save readiness remains C7. |
| Payload and fan-out | yes | Record payload bytes plus query/render/subscription/cardinality evidence; add bounded reads or work only when the measured owner needs them | Payload bytes, stored cardinality and one subscriber per thread recorded; one target wake and zero unrelated/list/anchor wakes. |
| Production-path rerun | no | After implementation, rerun the same cohort/budget contract on the final production path and source identity; planning-only work records N/A with the exact future owner and command | N/A: planning only. Phase 3 must run the channel-cost contract on the implemented full channel; phase 2 must mount the real descriptor. |
| Correctness guard | yes | Run the selected behavior/native/data-integrity guard on the measured final path | channel-cost.test.ts: 2848 assertions; existing behavior/migration suites remain green. |
| Before/after receipt | yes | Record comparable baseline and final evidence, or N/A only when no runtime behavior or cost can change | Current versus disposable target in channel-cost.json; no post-implementation or browser latency claim. |
| Detector and privacy | yes | Prove the owning runtime detector covers the changed operation without protected data, or record N/A | Local generated fixtures only, no production data or telemetry. |
| Performance regression check | yes | Run the deterministic performance harness and relevant checks in the owning workspace | bun test docs/plans/artifacts/comments-source-api-audit/channel-cost.test.ts: 1 pass, 0 fail. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Intake and source read | complete | First checkpoint; named skills and Vision | Source map closed |
| Source map | complete | 33 files, 78 declarations, 65 weekly textual matches | Inventory closed |
| Deslop inventory | complete | C1-C7 and survivor reasons | Matrix closed |
| Candidate matrix | complete | 12 decisions, three alternatives, challenge improved | Adoption routed |
| Cleanup packets / owner routing | complete | No product packet; three proposed phases | Proof closed |
| Verification | complete | Focused tests, Browser, scale receipt, source hashes | Closeout |
| Closeout | complete | Full audit and proof limits | Present verdict; implementation awaits a new instruction |

Candidate matrix:
Navigation notation: F = production files needed to understand the owning change; O = authorities for that behavior. Arrows are expected target changes, not measured edits. Proof/public clarity is qualitative and source-backed.

| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | P1 reproduced | C1 subject lifecycle | comment, suggestion, discussion | Undo restores subject but reply remains resolved | F 3→3; O 3→2; one lifecycle oracle; app target explicit | Delete mirrored resolution and duplicate reply anchor | Discussion + app subject binding | Counterexample and live Browser | plan |
| 2 | P1 reproduced | C2 block placement | discussion, CommentsPlugin, Annotation | External move updates range but not trigger | F 3→3; O 2→1 for geometry; precise invalidation proof | Read one canonical projection | Annotation/Comments | External-source relocation test | plan |
| 3 | P1 reproduced | C3 editor binding | Annotation, CommentsPlugin, demo | A native handle supplies wrong coordinates in B | F 3→3; O one per editor; contract becomes explicit | Share entities, bind handles per editor | Annotation + app bindings | Two real divergent editors | plan |
| 4 | P1 reproduced | C4 activation | CommentsPlugin, discussion | Prefix edit moves ranges but not activeAt | F 2→2; state fields 2→1; group intent explicit | Replace point and primary ID with ordered IDs | Comments | Overlap/native-anchor counterexample | plan |
| 5 | P2 measured | C5 whole-map write | comment | Every edit copies N records | F 1→1; O 1→1; narrower read contract and matched probe | Private keyed records with immutable record snapshots | Copied app channel | 100/1k/10k + pathological receipt | simplify |
| 6 | P2 source | C6 order rebuild | CommentsPlugin, Annotation | Every position change builds allIds map | F 2→2; one order owner; timing not proved | Gate on canonical order change | Comments/Annotation | Source; mounted benchmark required | defer |
| 7 | P2 integration | C7 action outcomes | comment and app examples | Void submit clears even when action rejects | F 1→2 for explicit example; O 1→1; failure law becomes visible | App-owned success/failure contract | Copied UI/app | Source; async/rejection example required | plan |
| 8 | Proven current job | Thin Comments plugin | CommentsPlugin | Paint, hit-testing, policy, errors, activation | F 1 retained; deletion spreads jobs; public boundary clear | Retain descriptor | Plate | Existing package suite | keep |
| 9 | Proven current job | Private Discussion store | discussion | Keyed triggers and one DOM target | F 1 retained; O 1; narrow UI proof | Retain keyed presentation summaries | Discussion | Existing Discussion suite | keep |
| 10 | No owner gain | Split comment.tsx by size | comment | File size alone supplies no stable boundary | F would increase; proof/public clarity unchanged | Reject cosmetic extraction | Copied UI | Full declaration audit | reject |
| 11 | Hard data law | Legacy extractor | migration | Existing serialized data needs offline extraction | F 1; O 1; separate offline API/proof | Retain migration boundary | Migration | Two fresh migration tests | keep |
| 12 | Native/runtime law | Static bodies and CSS hover | comment, live/static editor | Saved bodies need no live editors; hover need not publish | Existing owners retained; browser proof local | Retain current render and hover model | UI/rendering | Source plus historical exact-case evidence | keep |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Scale receipt / N/A | Result | Next |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Audit evidence | Read source; write plan, manifest, counterexamples, comparison and report | Auto architecture | This plan and its artifact directory only | Test logs, Browser observation, fingerprints | Isolated current/prototype edit receipt | keep | Present findings |
| Product implementation | N/A: not requested | Future phase owners | No source edits | No fixed/clean claim | Full target probes are phase gates | not applied | Start phase 1 only on implementation instruction |

Cleanup counts:
- delete: 0
- merge: 0
- inline: 0
- simplify: 1
- split: 0
- keep: 4
- defer: 1
- reject: 1
- plan: 5
These are 12 candidate decisions, not applied source changes. All implementation counts are zero.

Changed list:
- code/runtime/API: none
- tests/oracles: disposable audit counterexamples and keyed-edit comparison under the artifact directory; no product test edits
- docs/plans: this plan, full audit, weekly/source/declaration inventories, logs, receipts and Browser record
- skills/workflow: none; exact required Best API repair is recorded in audit.md
- reverted/quarantined: none; all disposable code stays under the artifact directory

Needs review:
- Implementation is not authorized by this audit request. Phase 1 is the first recommended execution packet.
- Subject archive behavior and divergent editor revision binding need explicit product/data rules during adoption.
- Activation/projection targets require real mounted scale and browser proof before acceptance.
- C7 is an integration gap, not a reproduced backend failure.

Verification evidence:
All commands ran in `/Users/zbeyens/git/plate-2`.
- `bun test packages/platejs/src/react/features/comments/CommentsPlugin.spec.tsx apps/www/src/registry/components/editor/comment.spec.tsx apps/www/src/registry/components/editor/discussion.spec.tsx`: 20 pass, 0 fail, 104 assertions; `existing-tests.log`.
- `bun test docs/plans/artifacts/comments-source-api-audit/counterexamples.test.tsx packages/platejs/src/migrations/extractLegacyCommentRanges.spec.ts`: 6 pass, 0 fail, 23 assertions; `final-counterexamples.log`. Four intentionally assert current incorrect behavior.
- `bun test docs/plans/artifacts/comments-source-api-audit/channel-cost.test.ts`: 1 pass, 0 fail, 2848 assertions; `channel-cost.log` and `channel-cost.json`.
- Browser real route replay: Accept → native Cmd+Z restores suggestion but omits existing reply; `browser-evidence.md`.
- `python3 docs/plans/artifacts/comments-source-api-audit/finalize-audit.py`: 33 manifest files and three benchmark source fingerprints match; 78 declarations classified; `source-verification.json`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-comments-source-and-api-architecture-audit.md`: final result in `artifacts/comments-source-api-audit/plan-check.log`.
- Full root check, package typecheck, browser corpus, native IME, collaboration and deployed proof were not rerun; no product changes require a broader mutation gate.

Final handoff contract:
- Source roots inspected: complete Comments/migration and copied Comments/Discussion owners; 33 direct source/proof/consumer/docs files at declared width.
- Candidate count and top recommendation: 12 decisions; delete suggestion replies' second lifecycle and keep the thin Comments plugin.
- Cleanup counts: 5 plan, 1 simplify, 1 defer, 4 keep, 1 reject; zero applied source edits.
- Agent-navigation score changes: expected authority reductions recorded per candidate; no cosmetic file splitting accepted.
- Packets applied with keep/revert/quarantine result: keep local audit artifacts; no product packet applied.
- Proof commands/source audits: 20 focused tests, 4 counterexamples, 2 migration tests, 1 scale comparison, live Browser and matching fingerprints.
- Hot-owner pre/post scale receipts or source-backed zero-runtime N/A: owner-level keyed-write target measured; final production reruns are N/A for this read-only audit and exact phase gates are recorded.
- Rejected/deferred candidates: delete entire plugin, delete entire UI store, symptom-only patches and line-count splits rejected; order rebuild optimization awaits mounted measurement.
- Needs-review list: subject archive policy, editor/revision binding, full mounted target proof, app action outcomes.
- Residual risks: current C1-C4 failures remain; no full browser, collaboration, typecheck or release certification.
- Next owner and exact first command/file: Auto routes phase 1 to the local bug/API owners; extend `apps/www/tests/browser/comment.spec.ts`'s accept/reject case at line 924 with Accept → Undo → existing reply, then cut mirrored resolution through Discussion composition.
- Target/alternatives/challenge/adoption: `artifacts/comments-source-api-audit/audit.md` contains the four authorities, three alternatives, improved challenge delta, three phases, pivots and cut obligations.

Timeline:
- 2026-09-04T19:26:50.335Z Architecture-cleanup goal plan created and requirements frozen.
- 2026-09-04 Primary source/API and weekly plans reconciled; four counterexamples reproduced.
- 2026-09-04 Existing focused/migration tests and matched scale probe passed; real Browser confirmed suggestion undo symptom.
- 2026-09-04 Audit, declaration decisions and source fingerprints finalized for handoff.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Audit complete; product source unchanged |
| Where am I going? | Present verdict and one next action; implementation is a separate instruction |
| What is the goal? | Full bounded source/API and weekly-plan review with ranked challenged cuts |
| What have I learned? | Thin plugin survives; duplicated suggestion lifecycle, geometry reads and activation coordinates fail current counterexamples |

Open risks:
- Current product still exhibits C1-C4. The audit's passing counterexamples certify reproduction only.
- Per-editor shared-data binding and subject archival need honest policy; a new public framework is not justified.
- Full mounted scale and browser/native proof remain phase gates. The storage prototype cannot certify the whole channel.

Errors and recovery:
- Initial Browser connection refused: started the existing www server and reloaded the real demo.
- Browser tab export unsupported: saved an explicit written observation record, without claiming a trace export.
- Initial probe cleanup produced warnings: unmounted React before destroying its source; final combined probe log is clean.
- Some aggregate output truncated and one guessed docs path was absent: recovered through bounded reads and the exact source manifest, without inferring missing content.
