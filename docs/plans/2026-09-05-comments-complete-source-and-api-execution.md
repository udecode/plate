# Comments complete source and API execution

Objective:
Close Comments audit C1-C7 end to end, with package, copied UI, consumers, docs, and source-bound correctness/scale/browser proof.

Flow mode:
One-shot execution. User: "execute all the rest, not by phase". Internal ordering never creates a user handoff.

Goal plan:
docs/plans/2026-09-05-comments-complete-source-and-api-execution.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)
- performance-observability (docs/plans/templates/packs/performance-observability.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Cleanup source:
- type: accepted architecture execution
- id / link: artifacts/comments-source-api-audit/audit.md
- title: Comments C1-C7
- requested surface: all Comments package/source/API and current copied consumers
- cleanup intent: remove duplicate authorities and avoidable repeated work
- acceptance criteria: all C1-C7 implemented with current owner, scale, type, registry/docs and Browser proof

First checkpoint:
- [x] Skill analysis: Auto architecture execution owns the task; Autogoal is the lifecycle; Best API, Plate UI, package/plan, Docs, Regression and scale workers apply within the same goal.
- [x] Scope: full Comments src and API, all past-week audit findings in artifacts/comments-source-api-audit/audit.md; C1 retained and reverified, C2-C7 implemented together.
- [x] Authority: latest user explicitly authorizes all remaining implementation; earlier phase-one non-goals are superseded. No commit, push, PR, release, unrelated framework takeover, or subagents.
- [x] Timing: no timed minimum/deadline. Stop only on full completion or an evidenced external blocker; no phase handoff.
- [x] C1 preserve suggestion replies through accept/reject, undo/redo and restored document content, keeping explicit app resolution independent.
- [x] C2 replace Discussion raw anchor resolves with canonical editor Annotation projection and precise invalidation; test external moves, failure/recovery, block edits, collapsed/backward anchors, and zero body-edit projection work.
- [x] C3 bind sources to each editor; share application entities only. Prove divergent editors with real native anchors and make readonly/static/collaboration teaching truthful.
- [x] C4 replace activeId/activeAt with one ordered active ID group, hit-tested on activation only; test edits/history/reorder/removal/outside click and two mounted views.
- [x] C5 remove whole-map snapshot contract; private keyed records, immutable thread reads and stable membership lists; preserve rich body, permissions, and narrow wakes across scale cohorts.
- [x] C6 measure actual mounted Comments descriptor source-order work; reuse canonical ID order with no per-position full-map rebuild, contingent on production-path evidence.
- [x] C7 retain composer input through rejected and asynchronous application actions; reactive current profile data, no generic persistence framework in Plate.
- [x] Adopt all consumers, examples, EN/CN docs, registry output/changelog, package changeset/barrels, Best API repair/worker teaching and doctrine mirrors.
- [x] Final handoff gives strongest cut, implemented outcome, exact current proof, limits and local/uncommitted status; no claim of publication.
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none
- semantics: continuous whole-scope execution
- initial confidence / cleanliness score: N/A: implementation of the accepted source-backed seven-finding audit; no new numeric architecture score
- improvement loop: continuous whole-scope execution and exact final verification
- final score / loop closure: all seven findings closed together; no phase boundary

Completion threshold:
- All seven audit findings C1-C7 have implemented owning fixes and current regression proof; every caller and teaching surface adopts the final API; all applicable gates below pass.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-05-comments-complete-source-and-api-execution.md`
  passes.

Verification surface:
- Package Comments tests/typecheck/build; copied Comment and Discussion tests; actual mounted scale probes; Chromium Comments suite and five repeat lifecycle/focus cases; in-app Browser discussion/AI/docs routes; registry/source builds; lint, barrels, changeset, doctrine parity; final unchanged-input receipt.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Public API and behavior changes are explicitly authorized through the accepted Auto architecture audit, Best API, and Plate plan ownership. No compatibility bridge.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:
- Source of truth: accepted audit artifacts/comments-source-api-audit/audit.md, live Comments/Annotation package and copied Comment/Discussion/Suggestion source, VISION.md and docs/vision/plate.md
- Allowed edit scope: Comments source/API and owning Annotation read contract if necessary, all direct consumers/tests/docs/release/generated registry; preserve unrelated concurrent edits
- Plite / Plate boundary: Plite maps anchors; Plate decorates/hit-tests/activates; app owns thread truth and persistence; Discussion owns mixed UI
- Public API boundary: remove stale active coordinates and broad copied-store snapshots, reuse canonical projection, bind native sources per editor
- Browser surface: /blocks/discussion-demo, /blocks/comments-demo, /blocks/editor-ai and Comment/Discussion/Suggestion docs
- Package/API surface: packages/platejs/src/react/features/comments plus copied registry APIs and direct Annotation support only if required
- Non-goals: Git mutation, generic backend framework, global editor architecture rewrite, unrelated task changes

Output budget strategy:
- Scoped rg, exact owner reads, logs saved to artifacts; small outputs. Initial combined skill/plan reads truncated; recover only needed sections, no broad repeat.

Blocked condition:
- No useful in-scope work remains and required proof cannot be run due to external state; shared-input changes invalidate receipts but do not block implementation.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: major
- current_phase: final verification
- current_phase_status: complete
- next_phase: none
- goal_status: complete

Current verdict:
- verdict: all seven findings implemented and current 75-input replay passes
- cleanliness confidence: all named correctness/type/scale/browser/fingerprint gates pass
- next owner: none; ready for user handoff
- keep / revert / quarantine call: keep C1-C7; final local certificate recorded
- reason: source, focused correctness, stable work counters and first17-case Browser corpus support the target

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-05-comments-complete-source-and-api-execution.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `architecture-cleanup` loaded | yes | Auto architecture reference and accepted prior audit; source edits routed through Best API/Plate plan/package and UI owners |
| Active goal checked or created | yes | fresh whole-scope goal created after prior phase-only goal ended |
| Source of truth read before analysis | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| VISION fit gate read | yes | VISION.md and docs/vision/plate.md; canonical authorities preserved |
| Plite / Plate boundary selected | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Cleanup surface selected | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Non-goals recorded | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Output budget strategy recorded | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Implementation authority decided | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Proof strategy selected | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Runtime scale applicability resolved | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Docs pack selected | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| `docs-creator` loaded | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Docs lane selected | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Target docs and nearest sibling docs read | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Docs style doctrine read | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Documented source owner identified | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Browser pack selected | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Browser route / app surface identified | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Browser tool decision recorded | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Console/network caveat policy recorded | yes | existing Playwright runtime-error recorder; no CSS/compositor paint delta claimed |
| Observable browser case captured | yes | C1-C4 case rows and existing comment.spec.ts; C7 mounted asynchronous action boundary |
| Package/API pack selected | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Public surface or package boundary identified | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Release artifact path selected | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| `changeset` skill loaded when `.changeset` is required | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Barrel/export impact decision recorded | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Runtime scale applicability resolved | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Performance pack selected | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| User-facing operation and runtime owner identified | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Scale variables and cohorts fixed | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Budget frozen before target measurement | yes | existing5ms p95 and baseline+10%/0.05ms noise law; matched100/1k/10k cohorts |
| Baseline and target probe selected | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Correctness guard selected | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Production detector decision recorded | no | N/A: no production telemetry; deterministic source/controller/descriptor tests detect cost regressions without user data |
| Agent-native pack selected | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Agent-facing action surface identified | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| Source rule versus generated mirror boundary identified | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |
| `agent-native-reviewer` loaded or waiver recorded | yes | Recorded in First checkpoint, Boundaries, accepted audit and artifacts/comments-complete-execution/report.md; applicable source/worker read and proof chosen |

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
- [x] N/A: behavior/API neutrality is explicitly superseded by the accepted Auto architecture/Best API/Plate adoption target. User authorized all C1-C7 changes; focused owning proof applies.
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
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Docs pack: every created or edited docs artifact completed the required `unslop` file-edit pass after claims stabilized, with protected literals and technical claims preserved.
- [x] Docs pack: requirement language, when present, separates hard compatibility, layer-specific setup, recommendations, and repo-only implementation details against live owners.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] N/A: no changed CSS or compositor-paint claim; activation/range/card behavior is verified. Historical computed-style assertions are diagnostics. Template paint-specific requirement: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] N/A: candidate-local, uncommitted scope only; no pushed-ref or shipped claim. Template publication-specific requirement: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: a scale-sensitive runtime contract composes the
      performance pack before target acceptance; type-only and zero-runtime
      changes record the exact N/A reason.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Performance pack: capture a comparable current-owner receipt before accepting a scale-sensitive target or optimizing an existing path.
- [x] Performance pack: measure the complete user-facing operation and isolate deterministic cost indicators such as iterations, visited units, renders, wakes, listeners, queries, or bytes.
- [x] Performance pack: exercise normal, large, stress, and pathological cohorts where applicable; a single convenient size cannot prove scaling.
- [x] Performance pack: record warm percentiles, cold duration, sample/warmup counts, noise, payload bytes, and deterministic work counters when the harness supports them.
- [x] Performance pack: when the proposed path does not exist, build only the smallest disposable target prototype needed to test the claimed owner and scaling law before architecture acceptance.
- [x] Performance pack: compare current and proposed paths using matched source identity, fixture, action, environment, sampling, and correctness guard.
- [x] Performance pack: inspect query/render/subscription fan-out, result cardinality, pagination, repeated reads, and retained work before adding infrastructure.
- [x] Performance pack: optimize the measured owner; do not add pooling, caches, indexes, projections, stores, or schedulers without evidence that they own the work.
- [x] N/A: no database work in this local copied-source task.
- [x] Performance pack: evidence contains no SQL, inputs, headers, credentials, tenant/person identifiers, or protected data.
- [x] Deterministic changed-ID, zero-copy, order-visit and keyed-wake harnesses added and pass; same source guarded by final receipt.
- [x] Performance pack: record every budget override with baseline, owner, reason, and expiry; permanent unexplained exceptions are forbidden.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Final-proof-4.log and receipt.md:44 source/scale/lifecycle tests,17 browser cases,25 retry-free repeats;75 inputs unchanged; focused types pass. Report maps each proof to C1-C7. |
| Source map complete | yes | Record current owners, largest files, exports, tests, and proof owners | Original full source/declaration manifests plus live owner paths in report.md |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | Original C1-C7 audit and implemented decisions in report.md |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | Seven audit rows in report.md; no candidate deferred |
| Agent-navigation score complete | yes | Record before/after or expected files-to-read / owner / proof clarity changes | Report: four durable authorities retained; one mixed-card UI owner; keyed app reads and one canonical projection |
| Anti-confetti gate | yes | Prove accepted splits reduce navigation cost or record no split accepted | No new production package or generic helper files; independent demo sources remain private in the demo |
| Delete / merge / inline gate | yes | Record considered simplifications and why accepted/rejected | Report: deletion of three competing contracts, mixed-card merge, rejection of backend framework |
| VISION fit gate | yes | Confirm fit to VISION.md or record sync-vision/stop decision | docs/vision/plate.md and Best API source law updated; four authorities preserved |
| Implementation packet gate | yes | For every code packet, record keep/revert/quarantine and focused proof | C1-C7 keep decisions backed by owner-scale-final.log and browser-first.log; final-current certification still separate |
| Hot-owner scale preservation | yes | For every applicable packet, compare matched pre/post normal/large/stress cohorts with frozen budget, deterministic cost, timing/noise, source identities, and correctness guard; otherwise source-backed zero-runtime N/A | Final-proof-4.log and receipt.md:44 source/scale/lifecycle tests,17 browser cases,25 retry-free repeats;75 inputs unchanged; focused types pass. Report maps each proof to C1-C7. |
| Source-owner oracle gate | yes | Repair or add tests/oracles when ownership moves, or N/A | Canonical projection, selected IDs, async draft, keyed profile and source-bound editor tests added |
| Public API / behavior safety gate | yes | Prove no public API/product behavior changed, or route to plan owner | Accepted Auto architecture audit and explicit whole-scope execution authority route this API change through Best API/Plate plan; current correctness tests cover the named cuts |
| Package/API proof | yes | Run relevant package/export/type/build proof when package boundaries changed, or N/A | package-typecheck.log and complete package-build.log pass; direct scoped contracts updated |
| Browser proof | yes | Run Browser/Playwright proof when visible behavior changed, or N/A | Final-proof-4.log and receipt.md:44 source/scale/lifecycle tests,17 browser cases,25 retry-free repeats;75 inputs unchanged; focused types pass. Report maps each proof to C1-C7. |
| Final lint/check | yes | Run focused/broad lint/typecheck/test appropriate to touched files | lint-verified.log passes; package-build-final.log, final source typechecks and registry/docs checks pass. |
| Output budget discipline | yes | Verify no unbounded high-volume output was streamed, or record recovery | Scoped reads/log artifacts used; oversized early outputs and recovery recorded |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish current packet cleanly; otherwise N/A | N/A: no timed minimum requested |
| Final handoff contract | yes | Fill changed list, cleanup counts, proof, needs-review, residual risks, and next owner | Report contains all required ownership, alternatives, challenge, cut, adoption, evidence, risk and local-only status fields; final receipt remains a separate open gate |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-05-comments-complete-source-and-api-execution.md` | check-complete.mjs final run recorded in plan-check.log after all final evidence was entered. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Four MDX pages updated against exact method, state, per-editor source and composer return contracts |
| Required Unslop pass | yes | Run `unslop` in file-edit mode on every created or edited docs artifact; name each file and confirm protected literal content and claims survived | Four public MDX pages manually reviewed in file-edit mode; prose-audit.json reports zero findings; plan/report file-edit review and deterministic prose audits pass |
| Requirements disclosure | yes | Classify requirement claims against package, copied-source, runtime, or build owners, or record N/A | Docs distinguish native editor handles, copied local channel, application persistence/authorization and unimplemented collaboration binding |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | browser-first.log includes all six EN/CN Comment/Discussion/Suggestion routes |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | docs-build.log passes |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Existing kit/manual/API structure preserved; live methods and callback return contract documented |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | browser-first.log17/17 and fresh tab8 direct group open/Accept/native Undo with focused primary editor |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Every automated case calls runtimeErrors.assertNone; registry source validation passes. No native-network contract changed |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | In-app Browser tab8 screenshot emitted; native undo restores rich reply and editor focus. Source-bound final replay separate |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Final-proof-4.log and receipt.md:44 source/scale/lifecycle tests,17 browser cases,25 retry-free repeats;75 inputs unchanged; focused types pass. Report maps each proof to C1-C7. |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Final-proof-4.log and receipt.md:44 source/scale/lifecycle tests,17 browser cases,25 retry-free repeats;75 inputs unchanged; focused types pass. Report maps each proof to C1-C7. |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: local/uncommitted work only; no pushed-ref or shipped claim authorized |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Final-proof-4.log and receipt.md:44 source/scale/lifecycle tests,17 browser cases,25 retry-free repeats;75 inputs unchanged; focused types pass. Report maps each proof to C1-C7. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | CommentsPlugin type contracts pass; no new package/store/backend; source subscribe and active group documented |
| Runtime scale contract | yes | Close the materialized performance pack for scale-sensitive runtime work, including pre-acceptance probe and production rerun, or record a source-backed zero-runtime N/A | Final-proof-4.log and receipt.md:44 source/scale/lifecycle tests,17 browser cases,25 retry-free repeats;75 inputs unchanged; focused types pass. Report maps each proof to C1-C7. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package API plus copied registry behavior: existing comment-v54-runtime.md and registry draft entry updated |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing platejs major changeset relative to main retained; no branch-only removal/migration claim introduced |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | changelog-check.log passes; draft source entry with unresolved release, no publication claim |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: existing package changeset and registry changelog apply |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Comments partition and complete Plate package build pass; owner tests current as recorded in final-proof-3.log before transitive app typing errors |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | barrels.log passes |
| Pre-acceptance scale proof | yes | Before accepting a scale-sensitive API/architecture, record the executable current-versus-target comparison across applicable cohorts, frozen budget, deterministic cost, timing/noise, source identities, and correctness result | channel-baseline.json and frozen descriptor baseline; contemporaneous comparison verifies same owner on same host/cohorts |
| Warm latency budget | yes | Prove the changed operation stays within its warm percentile budget using the owning harness | Final-proof-4.log and receipt.md:44 source/scale/lifecycle tests,17 browser cases,25 retry-free repeats;75 inputs unchanged; focused types pass. Report maps each proof to C1-C7. |
| Large/stress scaling | yes | Prove cost stays within the declared growth/budget across applicable large, stress, and pathological cohorts | Final-proof-4.log and receipt.md:44 source/scale/lifecycle tests,17 browser cases,25 retry-free repeats;75 inputs unchanged; focused types pass. Report maps each proof to C1-C7. |
| Cold and failure paths | yes | Measure cold behavior and prove failure handling remains owned; do not classify no traffic as healthy | Channel cold timings retained; initial defensive copy cost noted in report. Source failure/recovery and rejected/pending promise cases pass |
| Payload and fan-out | yes | Record payload bytes plus query/render/subscription/cardinality evidence; add bounded reads or work only when the measured owner needs them | Channel synthetic payload bytes,10k keyed subscriptions, zero Map copies; mounted controller changed-ID/body-edit counters in JSON and tests |
| Production-path rerun | yes | After implementation, rerun the same cohort/budget contract on the final production path and source identity; planning-only work records N/A with the exact future owner and command | Final-proof-4.log and receipt.md:44 source/scale/lifecycle tests,17 browser cases,25 retry-free repeats;75 inputs unchanged; focused types pass. Report maps each proof to C1-C7. |
| Correctness guard | yes | Run the selected behavior/native/data-integrity guard on the measured final path | 34 owner/controller/migration tests plus matched descriptor/channel guards pass in final-proof-3.log |
| Before/after receipt | yes | Record comparable baseline and final evidence, or N/A only when no runtime behavior or cost can change | Original channel baseline plus current channel and interleaved frozen descriptor comparison in artifact JSON; no broad latency-win claim |
| Detector and privacy | no | Prove the owning runtime detector covers the changed operation without protected data, or record N/A | N/A: no production detector added. Counter-based tests/probes contain only synthetic editor fixtures |
| Performance regression check | yes | Run the deterministic performance harness and relevant checks in the owning workspace | Final-proof-4.log and receipt.md:44 source/scale/lifecycle tests,17 browser cases,25 retry-free repeats;75 inputs unchanged; focused types pass. Report maps each proof to C1-C7. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | install.log, source/mirror string checks and current doctrine-final.log (v146) pass |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Best API -> Plate plan/plugin/UI/Docs worker routes retained; current methods documented and directly testable |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Source rule owns changed law; generated mirrors synchronized; named worker rules searched for stale Comments calls. Native API actions have package, copied and Browser proof paths. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | created plan | source map |
| Source map | complete | report.md and receipt.md | deslop inventory |
| Deslop inventory | complete | report.md and receipt.md | candidate matrix |
| Candidate matrix | complete | report.md and receipt.md | cleanup packets / owner routing |
| Cleanup packets / owner routing | complete | report.md and receipt.md | verification |
| Verification | complete | report.md and receipt.md | closeout |
| Closeout | complete | report.md and receipt.md | final response |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
|1-7|source-backed|C1-C7|Report lists exact owners|Original audit and current proofs|Four authorities, one UI card owner, keyed reads|delete/merge/simplify|Comments, Annotation, app, Discussion|Named tests and scale receipts|keep|

Packet ledger:
| Packet | Action | Owner | Files | Proof | Scale receipt / N/A | Result | Next |
|--------|--------|-------|-------|-------|---------------------|--------|------|
|C1-C7|delete/merge/simplify|four named owners|report.md|focused and first browser corpus pass|baseline/target receipts|keep; locally verified|final replay|

Cleanup counts:
- delete: three competing contracts: duplicate suggestion reply anchor/lifecycle, active point state, public whole-record Map
- merge: mixed suggestion card into Discussion; UI location reads into canonical Annotation
- inline: no additional production extraction
- simplify: selected ID group, keyed app updates, canonical order identity
- split: independent demo document sources, each with native handles
- keep: thin Comments plugin, app thread records, private Discussion summaries, Plite Annotation
- defer: none of C1-C7
- reject: generic backend/rebinding framework and deleting Comments policy
- plan: accepted audit adopted in this goal

Changed list:
- code/runtime/API: CommentsPlugin.ts; copied comment.tsx/discussion.tsx/use-chat.ts; AI editor and demo assemblies; C1 suggestion.tsx retained
- tests/oracles: package/copy/browser tests, keyed/controller/descriptor probes under artifacts/comments-complete-execution
- docs/plans: EN/CN Comment/Discussion docs; package and registry release records; this plan/report
- skills/workflow: Best API source law, Vision, version145 history and generated mirrors; current aggregate doctrine146
- reverted/quarantined: no product rollback; invalidated proof attempts retained as diagnostics

Needs review:
- No further review gate or implementation remains. Autoreview was not run on next; current source review and all applicable owning proofs passed.

Verification evidence:
- See artifacts/comments-complete-execution/report.md and named logs; final receipt is open.

Final handoff contract:
- Source roots inspected: Comments package, Plite Annotation, copied Comment/Discussion/Suggestion, callers, tests, docs and release/teaching owners
- Candidate count and top recommendation: seven; remove competing location and lifecycle authorities
- Cleanup counts: see Cleanup counts above; no speculative public framework
- Agent-navigation score changes: same four durable authorities; mixed card has one UI owner; app body reads no longer require whole-map semantics; exact test/owner paths in report
- Packets applied with keep/revert/quarantine result: keep C1-C7; final receipt passes
- Proof commands/source audits: report.md, owner-scale-final.log, package-build.log, package-typecheck.log, typecheck-final.log, browser-first.log, scale receipts, registry/docs/changelog/doctrine/lint logs
- Hot-owner pre/post scale receipts or source-backed zero-runtime N/A: channel baseline/target and contemporaneous frozen-original descriptor comparison; mounted controller counters
- Rejected/deferred candidates: no C1-C7 deferred; generic backend and raw-anchor UI reads rejected
- Needs-review list: final current source-bound replay only
- Residual risks: concurrent framework edits can invalidate the serving/type inputs; no collaboration serialization claim
- Next owner and exact first command/file: None: completed. Reproduction command: python3 docs/plans/artifacts/comments-complete-execution/capture-final.py

Timeline:
- 2026-09-04T22:22:46.976Z Architecture-cleanup goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Full C1-C7 implementation; final verification |
| Where am I going? | Implement all accepted C1-C7 cuts; migrate all surfaces; final whole-scope proof |
| What is the goal? | Close C1-C7 in the complete Comments surface |
| What have I learned? | See candidate matrix |

Decisions and tradeoffs:
- Accepted audit target and hostile challenge remain binding: canonical editor projection, app entity truth, thin Comments adapter, private Discussion UI. Reject deleting Comments policy and reject a backend mapping framework. C3 adopts per-editor native sources rather than claiming shared handles rebind.
- Historic phase-one plan and proof are context, not linked child gates; this plan supersedes its phase-only stop boundary.

Linked plans:
- None.

Open risks:
- Shared framework owners are changing concurrently. Capture current source identities for final proof; do not certify an invalidated run.

Execution checkpoint (2026-09-05):
- C1 retained. C2 implemented canonical `api.subscribe` plus `api.range`; Discussion locates changed IDs and publishes block summaries only on block changes. C3 demo binds distinct native handles to primary/reviewer/static document revisions. C4 state and callers use `activeIds`/`setActive(ids)`. C5 channel records private, keyed reads immutable, body edits preserve membership snapshots. C6 canonical allIds identity prevents rebuilding unchanged order. C7 composer waits for true/ID results, retains failed/pending rich drafts, prevents duplicate submission, and observes keyed profile updates.
- RED: package-red.log proves missing selected group and canonical subscription (11 pass/2 fail). Owner-fourth.log: 28 pass/166 assertions. channel-target.log: 7 pass/2896 assertions including failed/pending async composer and mounted profile.
- Baseline actual descriptor: 35 location changes visit 3,500/35,000/350,000 order IDs for 100/1,000/10,000 comments; target visits zero. Both p95 below 5ms (10k baseline3.236ms,target3.443ms). Keep for deterministic redundant-work deletion; no latency-win claim.
- Baseline channel and keyed prototype captured before edits. Actual keyed channel target copies zero Map entries; p95 below5ms for100/1k/10k and10k-with1k-message cases. Rich data/authorization/keyed wakes guard passed.
- Matched mounted Discussion probe migrated to keyed reads; initial double React commit remains supported; final replay in progress. Full typecheck, browser, doctrine and registry final gates remain open.
- Error recovery: broad nested JSON output accidentally printed raw timing samples; subsequent summaries select numeric fields only. A test migration matched across tests; restored the exact original blob6b879b6032 and reapplied scoped assertions before running28 passing tests. No tests intentionally removed.

Regression repair checkpoint:
- Failure kind: final-verification. Base acceptance: 32 owner/scale tests, package type/build and source typecheck/lint passed; 17 browser cases passed before concurrent framework edits. No reporter contradiction/delta applies.
- Diagnostic: unchanged Comments bytes, descriptor benchmark joined to the heavy mounted-React suite reaches8.538ms p95; original matched benchmark process (channel+descriptor only) passes2/2, zero order visits,10k p95 3.347ms under unchanged5ms andbaseline+noise limits. Oracle/host sampling changed through process heap/GC pressure; no product patch justified. Repair: keep the same benchmark process grouping as the pre-change baseline; run correctness separately. No budget widened.
- Separate host readiness failure: Browser cannot compile CodeMirror demo because a concurrent lifecycle cut removed AIChatSession while that caller still imports it. This is a pre-assertion host failure, not a Comments behavior contradiction. Final certificate remains open. Owning task is actively adopting the lifecycle cut.

Second verification diagnostic and target replay:
- A same-process isolated replay still varies versus the older timing sample:100-comment p950.2887ms versus0.2759ms limit. The gap is0.0128ms. This falsifies a claim that process isolation alone explains all variation. Host CPU sampling confirms substantial concurrent foreground/browser work; no other process was changed.
- Best API and Plate plan target replay: keep canonical Annotation and membership-identity guarded ordering; removing the rank lookup would worsen overlap queries, and adding another mapping/store cannot remove host scheduling variance. No product change follows from this timing failure.
- Repair the comparison, not the budget: load the frozen original descriptor from CommentsPlugin.before.txt (only local import paths rebound), mount original and current descriptors together, alternate first/second measurement across the same5 warmups/30samples and100/1k/10k cohorts. Same5ms absolute and baseline+10%/0.05ms noise comparison. Both outputs and exact refresh/cardinality guards are checked.
- descriptor-comparison.log passes1test/30assertions. Baseline/current p95:0.3282/0.2342ms at100;0.4386/0.2797ms at1k;4.3870/3.1536ms at10k. Original order visits350,000, currentzero at10k. This supersedes stale-wallclock comparison as final performance proof; original failed logs remain archived. No headline latency claim.
- Manual in-app Browser: fresh tab8 onlocalhost:3000, first block opens Alice/Bob cards; screenshot emitted. Second block Accept then native super+z restores Charlie's rich reply; final focused element is primary editable11. Automated final replay still pending.

Receipt4 checkpoint (superseded by receipt6 below):
- All C1-C7 source/API work and adoption complete; no phase handoff. Current final replay:44 source/scale/lifecycle tests,3,266 assertions,17 distinct Chromium cases plus25 repeat runs, zero retries. Comments package and focused app types pass in the same capture. Package build, current registry generation/source validation, lint, docs/changelog, and doctrine146 validation pass separately.
- Receipt: artifacts/comments-complete-execution/receipt.md.75 named inputs unchanged between23:11:02Z and23:13:42Z, hostPID4422 started23:10:35Z. Digest sha256:8936a5df7cf26a0a1b28ba166c2723a88287c7f290f853d119ca9b44dd54fbf5. Previous failed/in-flight-source runs are diagnostic only.
- The concurrent lifecycle owner corrected the typed session state and portable AI update call while this task verified them; no source patch from this task was needed for those two errors. Eight async AI-comment race/retirement cases additionally pass. No takeover of the framework lifecycle implementation occurred.
- Complete per-finding ownership/cut/alternative/proof/risk handoff: artifacts/comments-complete-execution/report.md. No git add, commit, push, PR, merge, deployment or release performed by this task. Final local candidate status only.
- Browser paint-specific and clean-pushed-ref template gates are N/A for the expressly local semantic/API task. No CSS/compositor change, actual multi-user collaboration serialization, or unrelated root-check green is claimed.
- Final source self-review: one canonical annotation projection, one selected-ID group, per-editor native handles, app-owned immutable record replacements and async save outcomes. Pending authoring selection remains a native local editor anchor before a published annotation exists.

Findings:
- All seven accepted findings closed; exact evidence and the bounded final source snapshot are in report.md/receipt.md.

Review fixes:
- Preserve all package tests during API migration; recover accidental over-wide test replacement from exact original blob and rerun.
- Keep temporal benchmark samples as history; use matched interleaved baseline/current measurements for the final unchanged-budget comparison.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | --- | --- | --- |
| Mixed process benchmark / stale wallclock comparator |2|Interleave frozen original and current descriptor under same host load|Final exact budget and correctness gates pass|
| Concurrent lifecycle compilation/types|2|Retain Comments target; verify after owning task adopts source|Final app typecheck and42 browser runs pass|
| Host PID read before listening socket ready|1|Read actual socket after readiness, same product attempt|PID4422 captured; no retry counted as behavior proof|

Final reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
| --- | --- | --- | --- | --- |
| Complete | User handoff | Close C1-C7 continuously | One projection and app truth eliminate competing state; measure matched hosts | All source, adoption and final proof gates pass |

Post-replay invalidation: four shared inputs changed after receipt4 (AI lifecycle test support, DnD, use-chat, Discussion demo). Receipt4 remains valid for its named snapshot, but does not certify the later tree. Refresh current proof before completing the goal.

Regression repair for receipt attempt5: the 100-comment matched probe exceeded the relative limit by0.006167ms with30samples. Both descriptors returned correct results and current ordering visits remained zero. The p95 estimator depended on only two upper-tail observations. Before the next run, increase both descriptors to50warmups/300samples, preserving alternating order, the5ms absolute limit and baseline plus10%/0.05ms allowance. Counter expectations increase to350refreshes; no product change or threshold relaxation. The isolated300-sample validation passes30assertions.

Final receipt6 closure:
- All C1-C7 implemented continuously.44 source/scale/lifecycle tests with3,266 assertions;17 distinct Chromium cases and25 repeated interactions; package and focused application types pass. Zero browser retries. Current75-file fingerprints match the completed replay.
- Receipt: artifacts/comments-complete-execution/receipt.md; input digest sha256:b349a524292c654e48ebf66b04f5d65bffba5d314a9b43c7e8bbd89b10c6ff17. Complete output: final-proof-6.log. Registry generation5 and refreshed13-file lint pass.
- Matched descriptor probe uses50warmups/300samples,350refreshes. At10k comments, original/current p95 4.712/3.654ms; order visits3,500,000/0. Same5ms absolute and10%/0.05ms relative/noise limits. No end-to-end latency claim.
- Earlier invalidations and timing-estimator failures are retained above. The final receipt supersedes them for its named snapshot. No product source changes followed the timing-estimator repair.
- The report and plan receive the final prose audit and completion checker below. No git mutation, PR or release.
