# Code block external text execution

Objective:
Implement the accepted code-block/external-text repair: truthful benchmarks, correct editing and selection, linear mount validation, and measured incremental syntax ownership.

Goal plan:
docs/plans/2026-09-04-code-block-external-text-execution.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)
- docs (docs/plans/templates/packs/docs.md)
- performance-observability (docs/plans/templates/packs/performance-observability.md)

Major source:
- type: accepted Auto architecture execution
- id / link: docs/plans/artifacts/2026-09-04-code-block-external-text-architecture-audit/review.md
- title: Code block and external text architecture audit
- decision to make: adopt each measured target only after its executable correctness and scale gate
- decision criteria: three behavior failures become permanent green tests; exact-token timing; mount budget 150ms; syntax p95 halves without material input regression

Major lane:
- lane: Auto architecture execute; one-shot execution
- output type: verified local implementation and benchmark receipts
- implementation expected: yes; user said go after the audit and three-phase recommendation
- affected packages / surfaces: plitejs external runtime, platejs code block, copied CodeMirror renderer, benchmarks, docs, tests, release artifacts
- dominant risk: native editing and selection correctness; repeated mount and syntax work

User requirements and accepted scope:
- [x] Continue the prior full source/API/benchmark audit through Auto after the user said go.
- [x] Phase 1: repair the maintained exact inserted-token benchmark oracle and its false-positive regression.
- [x] Phase 1: fix composing Enter/Tab interception, cross-boundary model selection paint, and leading-empty-line Tab in native and CodeMirror paths, with permanent tests.
- [x] Phase 1: update stale code-block API documentation and verify existing Plite contracts and four product tests.
- [x] Phase 2: prototype and adopt linear mount validation after 53 contract tests and matched 1/100/1000-block comparison. Final cold-budget evidence is recorded in tooling-full.json.
- [x] Phase 2: preserve duplicate, lazy, StrictMode and native/external conflict guards; measure 1/100/1000 blocks by 1/2/4 views under the existing 150ms stress budget. The repaired full runner passes all 30 cells.
- [x] Phase 3: prototype CodeMirror-owned incremental syntax with explicit languages; compare matched production exact-token p95 (at least 50% reduction), and input paint (no >10% regression beyond noise).
- [x] Phase 3: preserve neutral annotations, mixed native/external views, canonical history/selection/collaboration and retained full-DOM native rendering.
- [x] Phase 3: cover normal/2k/10k/100k text, continuous typing, language changes, overlapping annotations, composition reset/remote, copy/search/print and code-key parity using applicable existing harnesses.
- [x] Keep the narrow externalText public protocol; justify any shared code-text recipe API from real call sites and run best-api repair if public law changes.
- [x] No requested duration or token budget. No git commit, push, PR, release or external message is authorized.
- [x] No automatic stop between phases. Reject an unproved replacement and record a concrete measured pivot; never raise budgets to manufacture success.
- [x] Final handoff artifact records actual changes, measured before/after, tests, proof gaps and local/unpublished status. The September 5 tooling receipt closes the remaining substrate measurement gate; no native goal is active.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: bounded three-phase execution
- initial confidence score: prior audit has seven source-backed findings; replacement targets provisional
- improvement loop: permanent red proof, owner fix, exact rerun; runtime prototype before adoption
- final score / loop closure: measurable gates and disclosed limitations, not an invented score

Completion threshold:
- All accepted phase requirements above are satisfied or a failed replacement is explicitly rejected with a source-backed measured alternative; focused package/browser checks, release/docs artifacts and final production receipts are recorded.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-code-block-external-text-execution.md`
  passes.

Verification surface:
- Permanent Plite/Plate/browser tests, maintained exact-token product runner, production plite-external-text-browser matrix, disposable prototypes and receipts in docs/plans/artifacts/2026-09-04-code-block-external-text-execution/.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.

Boundaries:
- Source of truth: live owning source plus the completed 2026-09-04 audit manifest/report.
- Allowed edit scope: named Plite/Plate code, registry consumers, benchmark/test owners, current docs, release and required generated artifacts.
- External sources: inspect installed CodeMirror implementation and local sibling sources first; official documentation if needed.
- Browser surface: /blocks/code-block-demo, /blocks/code-block-huge-demo, /blocks/code-block-codemirror-demo and existing Plite external-text fixture.
- Tracker sync: N/A: no public ticket or publication requested.
- Non-goals: unrelated source cleanup, generic editor escape APIs, changing serialized code representation, publishing, claiming physical OS IME or print proof from synthetic events.

Output budget strategy:
- Scope searches to bounded owners; save long logs and JSON receipts to the execution artifact directory; recover truncated reads with narrower chunks.

Blocked condition:
- A required runtime cannot be exercised or a proposed replacement repeatedly fails correctness/scale with no safe in-scope alternative. Preserve evidence, reject unsupported claims, continue independent work.

Major state:
- task_type: major
- task_complexity: major
- current_phase: verification
- current_phase_status: tooling_repair_complete
- next_phase: none for the requested tooling repair
- goal_status: no active native goal; earlier blocked state is historical

Current verdict:
- verdict: tooling repaired and verified; the full substrate matrix passes correctness, validity, budgets and noise
- confidence: source-stable local evidence; shared-host elapsed timing does not establish causal product gains
- next owner: none for this repair; work remains local and unpublished
- reason: tooling-full.json contains all 30 cells, 30 samples per mount mode, and four-view cold/warm p95 139.0/106.5ms under the unchanged 150ms budget. Earlier failed receipts remain historical evidence.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-code-block-external-text-execution.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User requirements checklist captured before implementation; explicit go authorizes three phases. |
| Timed checkpoint parsed | yes | N/A: no minimum duration, deadline or token budget requested. |
| `major-task` loaded | no | N/A: shell only; Auto architecture is the governing Plate owner. |
| Active goal checked or created | yes | Active goal objective matches this plan; no token budget. |
| Source of truth read before analysis | yes | Prior audit review.md, 53-source manifest and 26 recent plans; current owning source. |
| Major lane selected | yes | Auto architecture execute; bounded three-phase implementation. |
| Decision criteria stated | yes | Frozen 150ms mount budget; syntax p95 halves; input tolerance; permanent behavior proof. |
| Existing repo patterns / prior decisions checked | yes | Prior audit and Plite/Plate Vision, existing external-text and code-block owners. |
| Helper stack selected | yes | Auto architecture, benchmark, API/layer owners, regression/testing, docs and release workers. |
| External research decision recorded | yes | Installed CodeMirror source and local codemirror-language-data clone; no unsupported external claims. |
| Implementation expectation recorded | yes | User said go after the accepted audit and three-phase plan. |
| Workspace authority selected | yes | All execution commands run in /Users/zbeyens/git/plate-2 or its www/package cwd. |
| Branch / PR expectation decided | yes | next; no commit, push, PR or release. Autoreview prohibited on next. |
| Runtime scale applicability resolved | yes | Projection count × views and text lines are repeated units; performance pack applied before prototypes. |
| Output budget strategy recorded | yes | Scoped reads and file receipts; accidental large hash-manifest output was capped and replaced by summaries. |
| Browser pack selected | yes | Applied for input, caret, composition, selection paint and mixed-view UI. |
| Browser route / app surface identified | yes | Actual /blocks/code-block-demo, huge-demo, codemirror-demo and views-demo; existing Plite fixtures. |
| Browser tool decision recorded | yes | Browser for manual product QA; maintained Chromium tests for regression. OS IME/print dialog excluded. |
| Console/network caveat policy recorded | yes | Runtime errors fail product tests; final Browser console empty. No broader network-health claim. |
| Observable browser case captured | yes | Permanent composition, offset-zero Tab and directional selection specs, red receipts and pixel controls. |
| Package/API pack selected | yes | Plite runtime and Plate code-block behavior plus copied UI. |
| Public surface or package boundary identified | yes | Narrow externalText protocol preserved; parser configuration stays in copied UI. |
| Release artifact path selected | yes | Per-package changesets plus draft registry changelog; generated registry output included. |
| `changeset` skill loaded when `.changeset` is required | yes | Changeset worker applied; plitejs patch, platejs patch, existing platejs major corrected. |
| Barrel/export impact decision recorded | yes | N/A: no package exports or exported file layout added/moved. |
| Runtime scale applicability resolved | yes | Projection count × views and text lines are repeated units; performance pack applied before prototypes. |
| Docs pack selected | yes | Current plugin reference, benchmark README, API doctrine and execution artifacts. |
| `docs-creator` loaded | yes | Docs worker applied to source-backed plugin reference. |
| Docs lane selected | yes | Current-state code-block reference; execution report separates proof status. |
| Target docs and nearest sibling docs read | yes | Code-block plugin/component reference and current source; registry names verified. |
| Docs style doctrine read | yes | Current-state reference voice; Unslop preservation and file-edit pass. |
| Documented source owner identified | yes | BaseCodeBlockPlugin, copied code-block components, demo kits and maintained runner. |
| Performance pack selected | yes | Projection mount, exact inserted-token syntax and input paint. |
| User-facing operation and runtime owner identified | yes | Mount external-text projections; edit the final 10k-line code position and observe the inserted keyword. |
| Scale variables and cohorts fixed | yes | 1/100/1000 blocks × 1/2/4 views; 20/2k/10k/100k code lines; sparse/dense decoration and splice stress. |
| Budget frozen before target measurement | yes | 150ms mount; syntax halves; input <=10% regression beyond 4ms floor; absolute runner budgets unchanged. |
| Baseline and target probe selected | yes | Frozen mount and syntax prototypes; current production substrate and actual product routes. |
| Correctness guard selected | yes | Model, selection, history, remote, composition, native conflicts, duplicate mounts, neutral paint and cleanup. |
| Production detector decision recorded | yes | Maintained synthetic fixture counters and timing receipts; no telemetry or protected input collection. |


Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, performance/observability, or agent-native surfaces as needed.
- [x] Scale-sensitive architecture/API work materializes the performance pack
      and completes an executable current-owner versus proposed-target probe
      before the target is accepted; prose budgets and deferred measurement do
      not satisfy this row.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
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
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
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
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Docs pack: every created or edited docs artifact completed the required `unslop` file-edit pass after claims stabilized, with protected literals and technical claims preserved.
- [x] Docs pack: requirement language, when present, separates hard compatibility, layer-specific setup, recommendations, and repo-only implementation details against live owners.
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
| Named verification threshold | yes | Run the repo audit, consume the Benchmark handoff, or run the review/prototype/artifact check named in this plan | Correctness and syntax requirements pass; cold-mount certification is unresolved, as recorded in Current verdict. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Prior audit manifest/report and final-source-manifest.json; final owner table in implementation.md. |
| Pre-acceptance scale proof | yes | For scale-sensitive architecture, record the frozen budget, current baseline, target prototype/result, cohorts, deterministic cost indicators, timing/noise, source identities, and correctness guard; otherwise give a source-backed zero-runtime N/A | mount-prototype.json and syntax-prototype2-production.json: matched owners, guards and frozen thresholds before adoption. |
| Production scale rerun contract | yes | For implementation, name and run the exact final production-path cohort/budget command plus correctness guard; planning-only work names the future owner and command | external-text-closure.json full 30 cells; syntax-current-composition.json paired actual routes; failures remain explicit. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Phases 1 and 3 pass on their recorded inputs. Phase 2 deterministic/correctness proof passes; tooling-full.json closes the cold-budget and noise gates. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Implementation report records duplicate-provider cut, native full-DOM job and rejected namespace/index/scheduler. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Source hostile challenge and strict ownership gates; no autoreview on next. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Behavior reds become green; timer removed; initial parser target replaced after measured failure. |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | Installed CodeMirror and local language-data source inspected; no web-derived factual claim. |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates; otherwise N/A | Package/browser/docs/API gates recorded below; full performance closure still unresolved. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | implementation.md and this plan; open performance/environment and typecheck caveats explicit. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | Scoped lint logs pass for runtime, package, browser, registry and benchmark owners; final layout lint passes. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Logs/JSON saved to artifacts. Large build-hash output was capped; later reads summarize hashes/counts. |
| Timed checkpoint | yes | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-code-block-external-text-execution.md` | Not complete: performance certification is unresolved. Do not mark the goal complete. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser final production paired-view edit/undo plus permanent product tests. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Final Browser console has no errors; product tests guard runtime errors. No unrelated network claim. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | product-current-composition.json and mixed-views-desktop-current.png / mixed-views-mobile-current.png. |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Native offset-zero RED/52 green; composing key RED/green; directional selection paint controls pass. |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | final-source-manifest.json, current-composition-build.json and per-receipt identities; HEAD a6afd55c30e97c74fe895d1ad005ca75413110f3. |
| Clean final runtime | yes | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A to pushed certification: local unpublished work. Fresh production process and hashed build used for local evidence. |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Current rebuilt composition: 14/14 product cases and 40/40 affected stability runs, zero retries. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Protocol unchanged; local parser and explicit syntax-provider identity; best-api repair entered v144; current source/mirror registry v146 validation passes. |
| Runtime scale contract | yes | Close the materialized performance pack for scale-sensitive runtime work, including pre-acceptance probe and production rerun, or record a source-backed zero-runtime N/A | Deterministic linear visits and syntax target pass. Full cold-duration/noise certification is unresolved. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package behavior has package changesets; copied registry behavior has draft registry changelog. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | bounded-external-code-blocks.md and plate-external-code-blocks.md are separate patch entries; existing major corrected. |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | 2026-09-04-code-block-editing-and-syntax.mdx generated and validated; release unresolved, draft only. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: user-visible package and copied-source changes have their required artifacts. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Strict Plite and Plate build/native tests pass; unrelated www missing-provider typecheck failure disclosed. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no changed package export or exported file topology. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Plugin commands/queries, parser composition, neutral markers and registered previews checked against current source. |
| Required Unslop pass | yes | Run `unslop` in file-edit mode on every created or edited docs artifact; name each file and confirm protected literal content and claims survived | Prose audit and file-edit pass over plugin docs, benchmark README, rule/Vision prose, changesets, registry entry, plan and implementation report; literals retained. |
| Requirements disclosure | yes | Classify requirement claims against package, copied-source, runtime, or build owners, or record N/A | Parser choice belongs to copied UI; canonical state belongs to Plite; synthetic/native proof distinction recorded. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | All four named code-block demos are registered; final real route inspected; component and plugin leaf refs exist. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | pnpm --filter www build:source passes; registry generation also passes. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Kit/manual setup, separate native highlighting descriptor and command/query reference are source-backed. |
| Pre-acceptance scale proof | yes | Before accepting a scale-sensitive API/architecture, record the executable current-versus-target comparison across applicable cohorts, frozen budget, deterministic cost, timing/noise, source identities, and correctness result | mount-prototype.json and syntax-prototype2-production.json: matched owners, guards and frozen thresholds before adoption. |
| Warm latency budget | yes | Prove the changed operation stays within its warm percentile budget using the owning harness | Full substrate 1000-block warm p95 48.5/77.0/113.9ms passes; a later same-input noisy rerun does not certify stability. |
| Large/stress scaling | yes | Prove cost stays within the declared growth/budget across applicable large, stress, and pathological cohorts | 20/2k/10k/100k product corpus passes correctness; four-view cold and one decoration-noise threshold fail. |
| Cold and failure paths | yes | Measure cold behavior and prove failure handling remains owned; do not classify no traffic as healthy | Cold durations measured; duplicate/native/lazy/reset/destroy guards pass; cold budget remains failed. |
| Payload and fan-out | yes | Record payload bytes plus query/render/subscription/cardinality evidence; add bounded reads or work only when the measured owner needs them | Per-receipt model/DOM/patch/fan-out counts and full canonical text hashes; 100k mounted DOM remains 62 lines. |
| Production-path rerun | yes | After implementation, rerun the same cohort/budget contract on the final production path and source identity; planning-only work records N/A with the exact future owner and command | Valid full substrate and syntax pair preserved. Latest native comparison is source-invalid, not promoted. |
| Correctness guard | yes | Run the selected behavior/native/data-integrity guard on the measured final path | Strict Plite; native 52; focused 70; product 14; stability 40; final layout 5. |
| Before/after receipt | yes | Record comparable baseline and final evidence, or N/A only when no runtime behavior or cost can change | Measured mount prototype and final paired syntax receipts in implementation.md; prototype/final distinction explicit. |
| Detector and privacy | yes | Prove the owning runtime detector covers the changed operation without protected data, or record N/A | Synthetic fixture timing and deterministic visits only; no user input or telemetry collection. |
| Performance regression check | yes | Run the deterministic performance harness and relevant checks in the owning workspace | Maintained exact-token false-positive controls and linear visit assertions pass; final budget failures remain open. |


Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Accepted prior audit, full source manifest, explicit go | closed |
| Current-state map | complete | Audit review.md and 53-source manifest | closed |
| Options and recommendation | complete | Three accepted phases; measured prototypes | closed |
| Review / pressure pass | complete | Challenge delta improved; duplicate provider cut; timer rejected by strict gate | closed |
| Implementation | complete | implementation.md and final-source-manifest.json | closed |
| Correctness verification | complete | Strict Plite, native 52, product 14, stability 40, final layout 5 | closed |
| Performance certification | in_progress | syntax passes; final cold mount and noise fail | quiet environment |
| Closeout | in_progress | Report and records written; goal remains active | resolve or explicitly narrow failed gate |

Findings:
- See docs/plans/artifacts/2026-09-04-code-block-external-text-execution/implementation.md for current source owners, measurements and proof boundaries.
- Duplicate syntax work is removed in CodeMirror-only composition; mixed views retain neutral ranges.
- Projection validation is linear in mounted projections, but the final four-view cold duration does not pass its frozen budget.
- Physical IME and native print UI remain outside the available proof. The 100k-line corpus is correct but still slow.

Decisions and tradeoffs:
- Keep the narrow external-text protocol and canonical Plite ownership.
- Keep native full DOM as an explicit rendering choice. CodeMirror owns only its mounted DOM, input and incremental parser.
- Keep linear validation in the existing per-Editable runtime; insertion effects invalidate and unregister/destroy release the batch result.
- Reject a shared code-text namespace, global DOM index, extra scheduler and deferred mount.
- Challenge delta: improved. Remove the duplicate Lowlight provider for all-CodeMirror composition and distinguish its contributions explicitly in mixed views. No CSS-class ownership inference.
- Keep the 150ms mount budget unchanged. Preserve failed and source-invalid receipts as such. No cold-budget certification is claimed.

Implementation notes:
- docs/plans/artifacts/2026-09-04-code-block-external-text-execution/implementation.md records final behavior and exact owner paths.
- Docs and registry examples teach explicit renderer choice and parser ownership. Package changesets, generated registry output and draft registry changelog are present.
- Best API and Plite Vision repair entered doctrine v144; the current registry advanced to v146 and validates. No package export layout changed; pnpm brl is N/A.
- No implementation from the later disposable root-traversal or binding-reuse experiments was adopted.

Review fixes:
- Permanent tests catch composing key interception, offset-zero indentation, single-layer model selection paint and stale selection before focus.
- Strict kernel ownership rejected a raw microtask; the implementation uses existing React lifecycle ownership.
- The first syntax prototype missed its relative target and was rejected; the accepted prototype passed before adoption.
- Full app typecheck found two browser-boundary type errors; both were corrected without raw Plite imports. Its remaining missing-provider diagnostic belongs to another surface.
- Final visual inspection found oversized demo padding; compact desktop and mobile layout then passed five fresh runs.
- No autoreview was invoked: the current branch is next, where repository instructions prohibit it. Source pressure passes and executable owner gates provide the review evidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial syntax prototype below 50% reduction | 1 | Bounded initial work through the existing parser | Accepted measured replacement; syntax-prototype2-production.json |
| Strict kernel ownership rejects raw microtask | 1 | Use insertion/unregister lifecycle only | 70 focused contracts and strict Plite pass |
| Default app tsc heap exhausted | 1 | 12GB heap and full route type generation | Reaches one unrelated missing test-provider import |
| Source changed during benchmark | 3 | Preserve invalid receipts; use exact source and bundle identity | Valid full substrate and syntax pair exist; newest product comparison remains invalid |
| Cold budget and noise fail | repeated | No further timing-based tuning under current load | Await quiet environment; budget unchanged |

Verification evidence:
- Strict pnpm check:plite passes all four stages, including 735 Chromium tests, 8 skips and 81 batches: docs/plans/artifacts/2026-09-04-code-block-external-text-execution/check-plite-final.log.
- Native 52/52; external-text and kernel ownership 70/70; current composition product 14/14 and eight affected cases repeated five times 40/40; earlier layout 5/5, all with zero retries. Receipts are listed in implementation.md.
- Selection pixels: positive-control pass (80), negative-control pass (0), duplicate-control pass (80), actual difference 0 in both directions.
- Final Browser production route shows compact paired views; a native edit reaches both and undo restores both, with no console errors. Desktop/mobile images are mixed-views-*-current.png.
- Valid syntax p95 405.4 to 119.1ms and input p95 24.3 to 22.0ms. Three warmups plus fifteen measured samples per variant. See syntax-current-composition.json and syntax-current-gate.json.
- Full substrate 30 cells: correctness passes; four-view cold p95 154.2ms exceeds 150ms and 40k sparse warm noise exceeds its threshold. See external-text-closure.json.
- Narrow rerun source and bundle hashes equal the full receipt, but cold/warm reaches 238.8/180.7ms. See mount-environment-check.json. This is failed certification, not a new source regression.
- Package build, scoped lint, docs parser, registry generation and changelog checks pass. App-wide tsc fails on the unrelated missing remote-cursor-overlay test provider.
- Build K6Fws2lwvrhgVHiTuCufx served by a fresh production process on 3110; current-composition-build.json records compiled hashes and final-source-manifest.json records 30 production/test/fixture/harness inputs. Publication remains local.
- Fresh native-codemirror-final.json is invalid: three files changed during measurement. Its budget failures remain recorded, and strict mode exits nonzero.
- Goal completion checker must remain incomplete while the frozen performance gate is unresolved.

Final handoff contract:
- Recommendation: keep the correctness, syntax-owner and linear-validation changes; do not certify full performance closure.
- Confidence: source-backed and measured for the passing lanes; cold-budget closure lacks a stable environment.
- Evidence: docs/plans/artifacts/2026-09-04-code-block-external-text-execution/implementation.md and final-source-manifest.json.
- Tests / commands: strict Plite, package and product receipts listed above.
- Browser proof: real production demo plus permanent Chromium and pixel controls; physical OS IME and print dialog excluded.
- PR / tracker: N/A; local changes only, no git or external publication authorized.
- Caveats: cold mount/noise fail, newest native comparison invalid, pathological typing slow, unrelated app tsc failure.
- Next owner: this task, after quiet-environment input or an explicit decision to leave certification pending.

Timeline:
- 2026-09-04T21:09:48.170Z Major-task goal plan created.
- 2026-09-04T22:30:53Z Final compact-demo production server started on 3110.
- 2026-09-04T22:52:38Z Final layout replay started; 5/5 pass.
- 2026-09-05 local: report and source/build identities recorded; await quiet environment for unresolved timing gates.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Implementation and correctness proof finished; final performance certification unresolved |
| Where am I going? | Quiet four-view cold and 40k sparse replay; then accurate final goal decision |
| What is the goal? | Implement the accepted three-phase repair with frozen proof thresholds |
| What have I learned? | Syntax and linear validation improve measured work; cold timing varies substantially with identical inputs |
| What have I done? | Product source, permanent tests, docs/release artifacts, strict proof, final report and fingerprints |

Open risks:
- Frozen 150ms cold-mount budget is not met in the valid full matrix; no exception or budget override is granted.
- Full matrix has one noisy 40k sparse-decoration row.
- Other tasks can change source during timing; each receipt must retain before/after validity.
- Physical OS IME and native print dialog are not certified. The 100k-line corpus remains slow.
- App-wide typecheck has one unrelated missing test-provider import. No root green-check or published-state claim is made.

Frozen proof contract:
- Prior audit baseline: exact CM input p50/p95 25.6/45.2ms, syntax 399.5/525.4ms on development host. These are diagnostic; phase 3 needs a fresh matched production pair.
- Current production substrate: 1000-block warm mount 219.9/668.8/853.7ms for 1/2/4 views. Preserve existing 150ms budget and all correctness guards.
- DOM paint needs classified screenshot pixels with positive, absent and duplicate controls; synthetic IME is not physical OS certification.
- Final browser runs use a fresh serving process, current source fingerprints and five retry-free warm boundary runs. Clean pushed-ref certification is N/A: work remains local and unpublished.
- Performance lane inventory is inherited from audit; this is a bounded architecture repair, not an unrelated whole-repo benchmark campaign.

Phase 1 checkpoint:
- Native leading-empty-line indentation has permanent red-before-green proof; the final native suite passes 52/52.
- Synthetic composing Enter/Tab has mounted red-before-green proof. Physical OS composition is not claimed.
- CodeMirror indentation supplies the post-insertion caret explicitly. Permanent browser tests assert both text and caret; native package tests cannot substitute for this adapter behavior.
- Directional model selection paint has positive, absent and duplicate pixel controls. The runtime supplies current state before focus, and the adapter avoids no-op paint dispatch during focus.

Phase 1 local proof and phase 2 acceptance:
- Corrected benchmark owner: benchmarks/editor/benchmarks/plate-code-block-browser.mjs and shared inserted-token oracle, with both old runner commands using it. Oracle controls pass 2/2.
- Final verification supersedes the initial focused runs: native 52/52, external-text and kernel ownership 70/70, product 14/14 and stability 40/40. The accepted prototype had all 53 external-text contracts passing before adoption.
- Selection pixel controls: positive 80, absent 0, duplicate 80, actual difference 0. The later caret case exposed stale state before focus, covered by a new Plite package RED. The CM paint field must also avoid no-op dispatch during focus; extra nested focus dispatch was rejected. Final implementation sends effects only when the painted range changes.
- Phase 2 frozen prototype: mount-prototype.json reports p95 baseline/target 210.6/43.8ms, 417.5/68.6ms, 790.3/126.1ms at 1000 blocks by 1/2/4 views. Target visits exactly 1000/2000/4000, with editing/undo/redo/remote/selection/cleanup guards passing.
- Disposable source override passes all 53 external-text contracts, including duplicate-before-mount, native conflicts, lazy children, StrictMode, focus freshness and the new one-pass cost test. Production source adopted only after these results.
- Chosen private owner: ExternalTextRuntime holds one DOM validation snapshot per React layout batch. Each external projection invalidates before layout via insertion effect; unregister and destroy release the snapshot. No added subscription, model store or public API. Existing per-Editable entries and native projection checks retain authority.
- Rejected: per-block root selectors still scan repeatedly; a retained global DOM index adds invalidation complexity; deferring adapter mount changes lifecycle timing without need.
- Plite packet: runtime, external component and contract tests. The strict package/browser corpus passes on its recorded inputs; production cold-duration and stress-noise certification remains unresolved.

Phase 3 acceptance and source repair:
- The first parser prototype achieved only a 34% reduction and was rejected. CodeMirror's parser schedules remaining work through deferred slices; bounded initial parse work uses its existing parser and leaves its scheduler in charge.
- The accepted prototype uses at most 100ms of initial parser work. Matched production, three warmups and fifteen measured samples per variant: exact inserted-token p95 466.0ms to 193.8ms (58.41% reduction); input p95 33.4ms to 35.8ms (+2.4ms, +7.19%, within the frozen tolerance); navigation p95 1066.68ms to 768.27ms. Source fingerprints match before and after. Receipt: syntax-prototype2-production.json.
- Prototype corpus: 20/2000/10000/100000 lines passes exact final token, canonical text, caret, continuous typing and bounded DOM. The largest three cohorts retain 62 DOM lines. Continuous input plus syntax took 704/719/860/4665ms respectively; these include the fixed typing delay and are not per-key latency percentiles. The pathological cohort remains slow.
- Production composition omits CodeHighlightPlugin for CodeMirror-only editors. Mixed views retain it for native syntax and distinguish only its contributions with data-code-block-syntax. Neutral overlapping ranges remain in both views. No schema, external-text command, public parser control, second history or editor escape is added.
- Production mixed-view and existing CM flows pass six cases, including remote changes and replacement during synthetic composition, language changes, native full DOM, clipboard/search/print-media, history, read-only and code keys. The disposable route is removed.
- New shared code-text recipe API rejected: the current native transaction and CM ChangeSet application owners remain distinct. The offset-zero arithmetic is small; a new exported recipe namespace would not remove those owners. Both paths have permanent behavior tests.
- Best API repair updates the smallest rule and Plite Vision owner. The affected Plate/Plite plan, plugin, UI, docs and migration workers contain no conflicting syntax-owner teaching. Doctrine advances to v144; pnpm install regenerates mirrors and version validation passes.
- Package release notes split the mixed-package file. Registry changelog, dependency metadata, examples and current docs describe the final composition.

Strict verification correction:
- The first strict package run rejected the cache's raw queueMicrotask through the existing kernel ownership inventory. This is an architecture gate failure, not a failed reporter behavior assertion. The guard needed no weakening or exemption.
- The timer is deleted. React insertion effects invalidate before registrations, and unregister/destroy release the private per-Editable snapshot. Seventy external-text and kernel ownership contracts pass together. No additional scheduler or subscription remains.
- The two earlier full substrate receipts are invalid because other tasks changed source during measurement. They are retained as diagnostics. Noisy stress rows and invalid fingerprints cannot certify closure.
- Full app tsc exceeded its default 4GB heap. A 12GB run reached diagnostics: partial Next builds narrowed route types, and two browser-boundary type errors were found and corrected. Regenerated route types and docs allowed a current-source rerun. Its only diagnostic is the unrelated missing Plate Yjs test-provider import in remote-cursor-overlay.spec.tsx; see www-typecheck-current.log.

Current composition replay:
- Shared-checkout edits added AIChatSession and DndRoot around the code-block demos after the earlier proof. Rebuilt K6Fws2lwvrhgVHiTuCufx and reran all 14 product cases and all 40 stability cases successfully.
- Only two unrelated AI test files changed during the build; their helper is imported only by specs. Product source remained unchanged during the build.
- The current paired syntax receipt is source-stable and passes validity, all absolute budgets and the relative gate: syntax p95 405.4 to 119.1ms (-70.62%), input 24.3 to 22.0ms, navigation 720.22 to 772.54ms (+7.26%).
- Browser inspection of the rebuilt 10k route finds one CodeMirror host, 36 viewport lines with syntax and no console errors.

Final substrate replay:
- substrate-final-cells.json tests four-view mount and the 40k sparse-decoration cell. It fails: mount 260.6ms cold and 192.0ms warm, plus noise thresholds. This is the latest measurement.
- Both compiled bundles match external-text-closure.json. The source set differs only in packages/plitejs/src/yjs/core/document.ts; that edit does not change this fixture bundle, and source stays stable within the latest run.
- No timer, DOM-owner traversal or binding-reuse prototype was added to chase these readings. The 150ms budget is unchanged. Correctness and syntax verification are complete for their recorded inputs; full performance certification remains open.
- The environment question remains unanswered. No quiet-window assumption, stop of user apps, budget override or goal-complete claim is made.

Continuation audit two:
- The previous goal turn made progress: implementation, current composition replay, valid syntax comparison and final evidence. This continuation adds a deterministic owner diagnostic and revalidates current source and host activity.
- mount-owner-counts.json records 24,000 owner lookups and 144,000 ancestor visits for 4,000 projections. The root-traversal prototype reduces getRootNode calls from 144,000 to 24,000 while preserving lookup/ancestor counts. Both variants complete the existing exercise and cleanup calls without page errors; instrumented timing is not certification.
- The frozen baseline bundle matches the current substrate receipt. The earlier paired uninstrumented prototype still has 159.4ms cold p95, above the 150ms gate. No production traversal change is accepted from this evidence.
- Current host activity still includes several CPU-heavy processes and elevated load. continuation-2.json records aggregate values without app names. No quiet window is confirmed; the same performance-environment blocker has recurred in two consecutive goal turns.
- One owned source fingerprint changed. external-text-comment-relation.json proves the only change is removal of an ESLint suppression comment; runtime code matches the recorded source. No behavior replay is invalidated by that comment-only edit.
- Keep the full goal active. No budget exception, narrower completion threshold or completion claim is allowed.

Blocked audit three:
- The previous turn made progress through deterministic root-query counts and source verification. The same performance-environment blocker persists for a third consecutive goal turn.
- Current host observation: aggregate CPU 1589.7%, 28 processes above 20%, load averages 21.06/15.56/15.07 on 18 logical CPUs. continuation-3-check.json records the observation without application names.
- The external-text test file changed its act callbacks. Source inspection preserves all behavior assertions, and a fresh source-stable run passes all 53 contracts. Evidence: external-text-current-contracts.log.
- The runtime component difference remains comment-only. No new product change is needed from this continuation.
- The goal is marked blocked, not complete. Final cold-mount and decoration-noise certification requires a stable host environment. The full objective, phase requirements and 150ms budget remain unchanged. No failed receipt is promoted to a pass.
- Resume by checking current inputs, then replaying the outstanding substrate cells in the stable environment. If those pass, complete the required full-scope performance validation and goal completion audit. Do not infer completion from the existing green syntax and correctness lanes.

Benchmark tooling repair:
- [x] Read Poteto principles and the current Task/Benchmark methods. Build the Lever selects a maintained rerunnable runner; Model the Domain separates correctness, provenance, noise and budget outcomes.
- [x] Reproduce it yourself on the matching surface via the control skill: historical raw receipts and current runner show five-sample maximum-as-p95, one-page warm sampling and profiler inclusion.
- [x] Binary-search the cause: fixture timing includes frame scheduling; mount summaries mix profiler overhead, and all failure categories share one flag. Source/call flow is runner -> compiled fixture install/exercise -> distributions -> undifferentiated failures.
- [x] Plan the fix: retain one runner; a pure measurement-summary/evaluation owner supplies independently testable statistics and verdicts. Alternative global host lock/calibration service rejected because it changes machine ownership and cannot establish editor causality. Sequential design review under repository delegation rules; no independent model claim.
- [x] Verify on the same surface: five regression controls, both previously failed cells, separate profiler capture, complete 30-cell matrix, and empty-selection CLI rejection all pass their expected outcomes.
- [x] Stage the commits: skip; no Git publication authority.
- [x] Run Opening a PR: skip; no PR requested and next forbids Autoreview.
- Throughput checkpoint: one writer, one benchmark process; stats/verdict tests precede the browser run. No product source edits or general workflow edits are needed.
- Acceptance: 3 discarded rounds and 30 measured samples for each mount mode; warm samples distributed across fresh contexts; profiler collected separately; absolute budgets unchanged; noise retains ratio 1.6 with a declared 4ms absolute jitter floor; no green result on missing samples, errors, invalid evidence, noise or missed budgets. Correctness/source errors exit 1; inconclusive shared-host timing exits 2. No unchanged retry-until-green loop.

Tooling repair checkpoint:
- The user authorizes the benchmark tooling repair and reports a quiet workstation. Current Task rules already classify shared-host timing as diagnostic and prohibit retry-until-green. This repair changes executable benchmark tooling, not general agent workflows; Maintain Workflow is inapplicable.
- Model the Domain separates correctness/provenance failures from elapsed-budget misses and noise. All three must pass for evaluation.pass; invalid/correctness failure exits 1 and inconclusive timing exits 2. No failed budget is hidden or raised.
- Build the Lever produces external-text-measurement.mjs and five regression controls, wired through test:external-text-measurement. Regression controls cover sample validity, p95/max separation, absolute jitter floor and non-passing verdicts.
- Sampling uses three discarded rounds and 30 measured fresh-context pairs. One unmeasured remount precedes each measured warm remount. Applicable baseline/target order alternates AB/BA. Every measured mount's counters are checked.
- The profile path uses a separate page after mount sampling and writes one profile per selected cell. tooling-profile.json contains 30 unprofiled samples per mode plus the separate profile file.
- tooling-focused.json passes both previously failed cells: 1000 blocks × 4 views cold/warm p95 140.4/107.2ms; 40k sparse decorations 47.3/42.5ms. Both have 30 samples per mode, all correctness checks, all budgets and noise passing. These observations are not a causal product speed comparison.
- Provenance retains broad before/after source inventories. Source-only changes require a stable rebuild with the identical fixture bundle. Runner, measurement helper or lockfile changes invalidate the receipt. Missing files and failed rechecks remain explicit failures without erasing the captured measurement.
- Full matrix verification is running once with the final runner. Original failed receipts remain immutable. No native goal is created, no product source changed, no publication performed.

Tooling repair final verification:
- tooling-full.json passes all 30 cells, with 30 samples per mount mode and stable source fingerprints. Correctness/validity, budgets and noise all pass; exit 0. Four-view cold/warm mount p95 is 139.0/106.5ms; the 40k-decoration cohort is 45.7/40.5ms.
- The final runner rejects an empty cohort selection with exit 1 and retains its diagnostic receipt. Five measurement regression controls, syntax, scoped Ultracite check and diff whitespace check pass.
- The only runner edit after the matrix is whitespace-only brace formatting, verified and recorded in tooling-format-relation.json. Final regression and negative CLI checks follow that edit.
- The requested tooling repair is complete locally. tooling-repair.md is the concise handoff. Previous timing failures remain unchanged historical receipts. No product-speed causality claim, native-goal mutation or publication follows from the quiet run.
