# Editor performance phase 1

This is a project-owned file template under Task. Apply the project's standing Autogoal request for long-running work unless the user opts out. Apply `.agents/rules/task/references/workflow.md` to timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

Objective:
Complete Phase 1 locally: resolve native line selection, Plate fixture readiness and table control failures; adopt lazy history recovery with exact correctness and matched performance proof.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-07-editor-performance-phase-1.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

Applied packs:
- none

## Benchmark Source

- request: user "go phase 1"; accepted scope in docs/plans/2026-09-07-editor-performance-phases.md
- scope: three named correctness/readiness findings and U00 history adoption only. Phases 2–5 stay unstarted.
- invocation: $benchmark only history-locality adoption; the selected Phase 1 requires the original matched history benchmark, not a new whole-editor audit. Patch owns the three behavior repairs.
- candidate-identity: fingerprint: next at a6afd55c30e97c74fe895d1ad005ca75413110f3 plus captured source fingerprints
- plate-main-identity: f366c3f35dd903bd346dc21ac60d9ce46be2dafe; no main regression claim
- plite-identity: fingerprint: same checkout, packages/plitejs source; fingerprint before/after each packet
- slate-identity: N/A: original Phase 1 history control is the same editor without lazy recovery
- named-symptom: programmatic preparation leaves model caret 16 after native Meta-arrow moves to 0/80; Plate heading fixture fails schema; table selection expects a missing drag handle; recovery projection computes unused token changes.
- final-artifacts: artifact: docs/plans/artifacts/2026-09-07-editor-performance-phase-1/

First checkpoint:
- Copy every explicit requirement into checkable rows before measurement or
  code changes.
- Resolve source identities, host/build freshness, fixture/action comparability,
  correctness guards, and every default lane's applicability.
- All applicable lanes are selected by default. Only an explicit `only`
  invocation may mark otherwise relevant lanes
  `N/A: only - <reason>`. Use `N/A: inapplicable - <reason>` only for a lane
  that genuinely cannot apply.

Timed checkpoint:
- requested duration: N/A: no time limit requested
- semantics: finish Phase 1 and stop
- start / deadline: 2026-09-07; no deadline
- final loop closure: close the current phase only after all four acceptance rows pass

Completion threshold:
- Selection passes exact model/native endpoints and follow-up typing from both handle and trusted-pointer preparation, five retry-free warm runs on final source. Evidence: selection-browser-final-02.log (20/20).
- The actual Plate performance route mounts its promised schema; table selection has a source-backed, passing control contract.
- Lazy history recovery passes existing history/anchor tests and frozen replacement gain gates in all four Plite/Plate 1k/10k cohorts; other action controls retain correctness and regression budgets.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`, Task review applicability is resolved (Autoreview prohibited on next), and the Autogoal checker passes.

Verification surface:
- benchmark commands / artifacts: commands.json; history-distributions-01.json (216/216 correct, all four frozen gain gates pass) under final-artifacts
- correctness commands: commands.json; 174 selection package tests, 72 history tests, 31 workload tests pass
- Browser / Chrome / device proof: 20/20 final Chromium selection cases; fixture/table trusted input in Codex in-app browser; no physical-device claim
- source/ref/fingerprint proof: final-source-before-history-benchmark.json, selection-final-build.json, fixture-table-browser-receipt.json; distribution captures before/after source hashes

Constraints:
- Correctness and native editor behavior outrank metric movement.
- Do not hide latency with debounce, delayed work, changed fixtures, degraded
  DOM, or a narrower action.
- Do not create another benchmark target registry or permanent run ledger.
- A conclusive cause pauses later lanes; it does not complete the goal.
- A proven cause selects the best long-term durable target, not the cheapest
  compatible patch. Before stability, hard-cut API or architecture when that
  buys materially better lasting value; preserve only a named hard correctness,
  security, serialized-data, native-behavior, or runtime law.
- After a fix, rerun the exact red lane and correctness guard before breadth.
- Do not commit, push, open a PR, comment, publish, or release unless separately
  authorized.

Boundaries:
- allowed runtime/packages/apps: named Plite selection/history owners, Plate performance fixture and table UI where diagnosis proves ownership
- allowed benchmark/tests/fixtures: existing cross-editor runner, owned history tests, Plite navigation browser tests, www editor/table performance harnesses
- allowed baseline checkouts/hosts: current checkout with frozen source overrides for paired baseline; no checkout switch or worktree
- non-goals: Phases 2–5, listener consolidation, history representation rewrite, general performance budgets beyond U00, publication

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- Missing native/browser capability or reproducible valid baseline that cannot be repaired within this scope; use the native goal repeated-blocker rule. An unresolved required behavior or performance gate prevents completion.

## Interaction Coverage

- first-interaction: pass: actual route mounts 100 blocks after URL config; trusted click/type followed by exact undo/redo; history first-type is included in frozen distribution
- settled-interaction: pass: four selection scenarios each pass five consecutive runs; actual table single-row and multi-row states pass
- route-scope: pass: /plite/plaintext on owned static app, /dev/editor-perf?scenario=plate-basic&blocks=100&chunking=false, /dev/table-perf
- reporter-profile: N/A: no external reporter or native profile was supplied; desktop Chromium handles Meta arrows; physical mobile is unclaimed

Use `pass: <proof>` or `N/A: <concrete reason>` for each phase and host.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | next a6afd55c plus final-source-before-history-benchmark.json; production history ed9dadde | Same source except frozen history be3d46be | artifact: history-adoption-signature.json and history-control-overrides.json |
| lockfile / package manager | Current pnpm-lock.yaml; Bun 1.3.12 driver | Identical lockfile and dependency directory | artifact: final-source-before-history-benchmark.json and distribution identity |
| build mode / host / port | Production minified compiler8 bundle; temporary 127.0.0.1 server | Same server and compiler8; history-only override | artifact: history-distributions-01.json config and bundles |
| browser / machine / viewport / DPR | Chromium 149 on Apple M5 Max; 1280x720; DPR 1 | Same browser process and machine, rotating arms | artifact: history-distributions-01.json identity and config |
| route / fixture / document / plugins | Cross-editor retained native renderer;100/1000/10000 paragraphs; Plite and Plate feature-equivalent arms | Same generated document and plugin contract per editor | artifact: history-distributions-01.json attempts and config |
| setup / action / DOM strategy | First type, burst, replacement, bold, undo, redo, split, join; full DOM | Identical trusted input, selection setup and correctness oracle | artifact: commands.json#historyDistribution and packet rows |
| warmups / samples / interleave order | 3 warmups plus 15 measured samples; rotating arms per sample | Same paired sequence; baseline label experiment restores old file | artifact: history-distributions-01.json attempts and history-adoption-signature.json |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Initial four acceptance rows and boundaries match the accepted Phase 1 plan |
| Timed checkpoint parsed | no | N/A: no duration requested; stop after Phase 1 |
| `benchmark` source and methodology read | yes | Task/Benchmark/Verify Plate/Patch/Poteto methods read at intake; source obligations retained in checklist |
| Task plan reused; standing Autogoal request or explicit opt-out resolved | yes | One native Phase 1 goal and this benchmark plan |
| Candidate and baseline identities recorded | yes | Comparison Signature; source fingerprints and single-file history control |
| Target/runner discovery completed from current source | yes | Owned cross-editor and actual-route runners; no second target registry |
| Host/build/fixture freshness proved | yes | selection-final-build.json; final-source.json; fixture-final-receipt.json;863 stable measured sources |
| Correctness oracle identified | yes | Exact text/marks/native-model caret/focus/history, schema rejection and table selected-cell/control counts |
| All default lanes inventoried | yes | Nine lanes retained; seven selected-scope lanes complete, two explicitly narrowed |
| `only` narrowing explicitly authorized or N/A | yes | User selected only Phase 1 of the accepted program; same-editor H1 adoption comparison |
| Browser/native proof strategy selected | yes | Owned Chromium native input and actual in-app browser routes; no raw-device claim |
| Output budget strategy recorded | yes | Raw receipts stored in artifacts; inspect scoped summaries |
| Commit/PR/release authority recorded | yes | Local only; no stage, commit, push, PR or external messages |

Work Checklist:
- [x] Read Poteto principles and matched bug/performance playbooks in full; Task/Benchmark/Autogoal/Patch/Verify Plate methods loaded.
- [x] SEL-1: reproduce handle-prepared line-start/end, capture selectionchange and kernel trace, prove the cause, repair the owner, replay pointer-prepared control and five final warm runs. Source: Phase 1; Patch steps 1–6.
- [x] FIXTURE-1: reproduce actual heading schema failure, correct its canonical fixture/schema owner, prove normal full-DOM route readiness with trusted editing. Source: Phase 1; Verify Plate Launch/Drive.
- [x] TABLE-1: reproduce missing handle on exact selection route, establish intended control and fix UI or wrong assertion, prove hover/cursor/selection and final state. Source: Phase 1; Patch pointer proof.
- [x] H1: freeze current baseline, verify prior causal experiment applicability, adopt lazy recovery in existing history owner, run original correctness and four-cohort performance gates. Source: Phase 1; Benchmark causal gate.
- [x] Preserve native text/focus/selection/undo/redo/anchor recovery and source identities across accepted changes. Source: Verify Plate editor-proof.
- [x] Inspect final diff, run affected source-first package tests/types, scoped lint and any required registry/barrel/changeset generation. Source: repository Packages/Tooling; Task workflow.
- [x] Maintain append-only decisions, self-audit evidence, reconcile source checklists, update Phase 1 status and stop. Source: Show Me Your Work; Autogoal checklist retention.
- [x] Every explicit scope, comparison, timing, stop condition, deliverable,
      verification surface, and success criterion is recorded.
- [x] Short objective, threshold, verification, constraints, boundaries, and
      blocked condition are concrete.
- [x] Default lanes remain in diagnostic order; every N/A row has a reason.
- [x] Candidate/baseline signatures prove comparable source, fixture, action,
      build, browser, machine, and sampling.
- [x] Primary metrics match the visible user operation; proxies stay labeled.
- [x] Samples expose p50/p75/p95/p99 only when sample count supports them,
      plus max, absolute/relative delta, and noise evidence.
- [x] Red lanes are not called causal without the conclusive-cause gate.
- [x] A proven cause pauses later lanes before another expensive benchmark.
- [x] Every proven cause records its fix class, best long-term target, decision
      owner, layer plan, compatibility verdict, and implementation owner.
- [x] `public-api` and `runtime-architecture` causes run `best-api`, then
      `plite-plan`, `plate-plan`, or both before implementation. Broad accepted
      execution may use `task autonomous`; target selection may not.
- [x] One isolated owner is fixed, then the exact benchmark and correctness
      guard rerun before breadth resumes.
- [x] Failed reruns invalidate or continue the same cause; they do not skip to
      a different green metric.
- [x] Green reruns resume the first pending applicable lane.
- [x] Every packet has keep/revert/invalidate/quarantine/defer and next-owner
      evidence.
- [x] Harness/metric/host defects are repaired before product optimization.
- [x] Final handoff reports candidate/baseline identities, lane status, first
      conclusive cause, metrics, fix/reruns, resumed breadth, and residual risk.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | final-source.json; selection-final-build.json; HTTP 500 to 200; fixture-final-receipt.json; table-control-validation.json | Phase 1 closed |
| 2 | current-vs-main-product-smoke | no | N/A: only - selected Phase 1 uses same-editor history control | Current scope compares adopted and frozen prior history on the same source | outside Phase 1 |
| 3 | plate-vs-plite-decomposition | yes | complete | history-results.json: all four Plite/Plate 1k/10k replacement gates pass; no material regressions | Phase 1 closed |
| 4 | owner-microbench-and-trace | yes | complete | history-counter-validation.json: 6 to 0 token projections; 7 commits, 77 selector events and 0 renders retained | Phase 1 closed |
| 5 | product-mount-matrix | yes | complete | fixture-final-receipt.json: Plate basic and minimal both mount 100 blocks; 31 workload/schema tests; history packet 180 measured mounts | Phase 1 closed |
| 6 | trusted-editing-matrix | yes | complete | selection-browser-final-02.log: 20/20; history packet: 1440 measured actions; final fixture/table native input receipts | Phase 1 closed |
| 7 | plite-vs-pinned-slate | no | N/A: only - selected Phase 1 uses same-editor history control | Current scope compares adopted and frozen prior history on the same source | outside Phase 1 |
| 8 | example-breadth | yes | complete | Selected Phase 1 breadth only: handle/pointer line start/end, 8 workload constructors, table single/multiple row controls and 8 history actions | Phase 1 closed |
| 9 | large-and-stress | yes | complete | Original selected 100/1000/10000 full-DOM history cohorts; all 216 attempts correct; all four 1k/10k replacement gains pass | Phase 1 closed |

## Current Cause Checkpoint
- state: none
- cause-id: N/A: completed causes are archived below; no active cause remains
- lane: N/A: completed causes are archived below; no active cause remains
- comparable-baseline: N/A: completed causes are archived below; no active cause remains
- material-delta: N/A: completed causes are archived below; no active cause remains
- isolated-owner: N/A: completed causes are archived below; no active cause remains
- causal-intervention: N/A: completed causes are archived below; no active cause remains
- correctness-guard-result: N/A: completed causes are archived below; no active cause remains
- fix-class: N/A: completed causes are archived below; no active cause remains
- long-term-target: N/A: completed causes are archived below; no active cause remains
- decision-owner: N/A: completed causes are archived below; no active cause remains
- layer-plan: N/A: completed causes are archived below; no active cause remains
- compatibility-verdict: N/A: completed causes are archived below; no active cause remains
- fix-owner: N/A: completed causes are archived below; no active cause remains
- benchmark-command: N/A: completed causes are archived below; no active cause remains
- benchmark-rerun: N/A: completed causes are archived below; no active cause remains
- benchmark-rerun-result: N/A: completed causes are archived below; no active cause remains
- correctness-command: N/A: completed causes are archived below; no active cause remains
- correctness-rerun: N/A: completed causes are archived below; no active cause remains
- correctness-rerun-result: N/A: completed causes are archived below; no active cause remains
- resume-lane: N/A: completed causes are archived below; no active cause remains

## Cause History
| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SEL-1 | source-and-host-readiness | kept | correctness | Use existing selection authority to cancel superseded model exports | patch | N/A: repair existing native selection protocol | N/A: no public shape or owner change | Plite editable input state and deferred selection exports | Exact selectionchange plus queued-writer stack; native offsets 0/80 were overwritten by model offset 16 | pass: red oracle reproduces 12 line failures; exact-route pointer controls pass | selection-immediate-candidate-03.json recorded command | pass: 18/18 diagnostic actions across Plite/retained Plite/Plate at 100/10000 | commands.json#selectionFinal | pass: 20/20 retry-free cases and 174 package tests | selection-export-trace-01.json; selection-browser-final-02.log; selection-package-02.log |
| FIXTURE-1 | source-and-host-readiness | kept | correctness | Share strict fixture schema declarations and mount configured scenario | patch | N/A: private fixture repair | N/A: validation and public API retained | apps/www/src/app/dev/editor-perf | SSR default editor received heading without schema before URL configuration | pass: HTTP 500 and exact unknown-heading stack captured | Actual /dev/editor-perf route, 100 blocks, chunking false | pass: HTTP 200; full 100-block DOM on Plate basic and minimal | commands.json#fixtureContracts plus trusted route replay | pass:31 tests including invalid heading rejection; native typing/undo/redo and0 runtime errors | fixture-final-receipt.json; fixture-schema-tests-final.log |
| TABLE-1 | source-and-host-readiness | kept | correctness | Observe current row controls with a positive single-row control | patch | N/A: benchmark assertion repair | N/A: current UI behavior retained | apps/www/scripts/run-table-perf.mts and table-perf/contract.ts | Current table source hides row handles across rows; old cell-handle attribute is absent | pass: exact 40x40 selection reproduces100cells and obsolete0-vs1 handle mismatch | run-table-perf.mts selection40x40 with10x10 and1x10 selections | pass:100cells/0row handles;10cells/40row handles | table-control-validation.json plus trusted row click/Shift-click | pass: selected row text correct;3x3highlight and0handles across rows | table-control-validation.json; fixture-table-browser-receipt.json |
| H1 | plate-vs-plite-decomposition | kept | internal-implementation | Keep one history owner and delete unused recovery projection work | benchmark | N/A: private implementation; public shape and runtime ownership stay unchanged | N/A: no compatibility adapter or public contract change | packages/plitejs/src/history/history-extension.ts | Frozen single-file intervention; 6 unused token projections become 0 while 7 commits, 77 selector events and 0 renders remain | pass: original 72 history/anchor tests and 8 diagnostic attempts | commands.json#historyDistribution | pass: 216/216 correct; all 4 replacement gates pass; 0 material regressions | commands.json#historyContracts | pass: 72/72 tests and 64 counter-run native actions | history-results.json; history-counter-validation.json; history-tests.log |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| Selection baseline and trace | readiness | Stale programmatic provenance and queued export | 12 local line failures before; 0 after | Exact native/model endpoints and typed text | keep owner repair | closed |
| Selection incremental probes | readiness | Separate idle readiness from immediate native ownership | Partial probes left immediate cases red until both queued writers respected native ownership | All attempts retained; only final20-test receipt closes route proof | retain diagnostics | closed |
| Fixture red/green | readiness | Default heading lacks schema before query config | HTTP 500 to200; both requested and minimal editors have100 DOM blocks |31 fixture tests; trusted typing/undo/redo | keep strict fixture repair | closed |
| Table red/multi/single | readiness | Assertion counts a removed cell handle | Correct current contract:0 row handles across rows;40 in single-row control |100 or10 selected cells as requested | keep assertion repair; retain timing residual | Phase 2/3 timing owner |
| History distribution01 | decomposition | Avoid unused history recovery projection |4/4 gain gates;216 correct attempts;863 stable source entries |1440 measured native actions and180 mounts | keep adopted production source | closed |
| History counters01 | owner trace | Verify deleted work, preserved commits and renders |6 token fallbacks to0;7commits/77selectors/0renders |8 attempts and 64 native actions | keep causal attribution | closed |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| plite replacement / 1000 |15 per arm| 58.2/58.7/66.9/omitted/66.9 ms | 32.3/33.6/34.4/omitted/34.4 ms | -25.9 ms / -44.5% | larger IQR 7.2 ms; frozen gates pass | history-results.json |
| plite replacement / 10000 |15 per arm| 392.0/395.2/406.5/omitted/406.5 ms | 76.4/79.3/80.0/omitted/80.0 ms | -315.6 ms / -80.5% | larger IQR 7.8 ms; frozen gates pass | history-results.json |
| plate replacement / 1000 |15 per arm| 66.9/73.7/74.0/omitted/74.0 ms | 33.2/33.5/49.0/omitted/49.0 ms | -33.7 ms / -50.4% | larger IQR 7.5 ms; frozen gates pass | history-results.json |
| plate replacement / 10000 |15 per arm| 451.3/456.1/461.8/omitted/461.8 ms | 85.2/86.3/87.8/omitted/87.8 ms | -366.1 ms / -81.1% | larger IQR 6.0 ms; frozen gates pass | history-results.json |

Primary editing metric is event-to-frame opportunity, not measured compositor paint. p95 is descriptive and equals the maximum for 15 nearest-rank samples; p99 is omitted. All108 cells, max, IQR, raw samples and the secondary full-snapshot completion clock are retained in history-results.json/csv. No samples are pooled with the previous Node-hosted experiment.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Exact phase criteria | 20 browser cases,277 package/fixture/history tests;4/4 frozen history gains |
| Benchmark plan structural validation | yes | Validate checkpoints | plan-checkpoint-validation-02.log: structurally valid |
| Every applicable lane closed | yes | Seven complete; two N/A | Benchmark Lane Table |
| Exact post-fix benchmark reruns | yes | Replay selected cases | 216 history attempts; exact selection, fixture and table cases |
| Correctness/native behavior reruns | yes | Run exact guards | selection-browser-final-02.log; history-tests.log; fixture-final-receipt.json; table-control-validation.json |
| Final source/host identity | yes | Compare final fingerprints | final-source.json;863 stable distribution sources; fresh fixture-final-receipt.json |
| Benchmark target/metric honesty | yes | Recompute raw stats and preserve contracts | summarize-history.py independently matches108 primary summary cells; snapshots and proxy clocks labeled |
| Durable fix decision | yes | Use existing owning models and private fixture contract | Cause History:3 correctness repairs and1 private implementation deletion; no public API or architecture change |
| Package/type/build proof | yes | Affected source-first checks | package-types.log:11 tasks pass; www-types-final.log:exit0 with 16GB heap; selection static build fresh |
| Browser surface proof | yes | Exact routes and controls | 20 Chromium cases; actual fixture and table trusted input; narrow screenshot gap explicitly unclaimed |
| Changeset/release artifact | no | N/A: branch-only v2 implementation | Changeset release baseline inspected: packages/plitejs absent on origin/main; no migration/removal entry for branch-only repairs; existing new-package release entries retained |
| Agent rule/skill sync | no | N/A: no agent source changes | No rules, skills or reusable workflow changes |
| Benchmark plan complete validation | yes | Run validator --complete | final-plan-validation.log |
| Final lint | yes | Scoped source lint and owned runner syntax checks | final-lint.log; fixture-schema-lint.log; benchmark mjs files are repo-lint excluded and pass node --check |
| Timed checkpoint | no | N/A: no duration requested | Completed selected phase; later phases unstarted |
| P1 autoreview | no | N/A: prohibited on next | No explicit review or PR authority; no review invocation |
| Goal plan complete | yes | Run native goal checker | goal-plan-validation.log |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | Four explicit acceptance rows and frozen original H1 gates | closed |
| Ordered diagnosis | complete | Selection writer trace; exact fixture500; current table UI; history projection counter | closed |
| Fix and exact rerun | complete | Three repaired findings; history gains pass4/4 | closed |
| Remaining breadth | complete |277 tests;20 browser cases;216 distribution attempts;8 counter attempts | closed |
| Review and closeout | complete | Diff/self-audit and source checks; Autoreview N/A on next | stop after Phase 1 |

Findings:
- Selection baseline 01: 8 attempts, 12 local line failures. Existing kernel traces prove stale programmatic provenance; document events show correct native offsets 0/80 and unchanged model offset 16. Artifact: selection-baseline-01-summary.json.
- New actual-route tests reproduce both handle failures and pass both pointer controls. Exact test: plaintext.test.ts `imports native line boundaries after`; selection-browser-red-02.log.
- Incremental implementation first closed idle-prepared cases but left immediate cases open. No exact-route completion was claimed. Frozen current-source diagnostics expose the isUpdatingSelection guard and an 80ms sync-selection callback; selection-export-trace-01.json plus saved exact bundle attribute the writer to mutation-controller.ts.
- Current implementation enters native import on the kernel DOM transition, clears the superseded update flag, and makes deferred model exports respect current model-selection ownership. Immediate cross-editor candidate 03 passes 18 actions across custom Plite, retained Plite and Plate at 100/10,000 blocks. Actual-route 20/20 and wider package 174/174 proof pass.
- Original audit remains sealed baseline evidence. Current selectionchange/kernel traces and exact export-stack capture prove the delayed-writer cause.
- Fixture root cause: default SlateScenarioEditor is a Plate editor and its mixed-block initial value lacked heading schema. Private fixture schema plugins cover all 8 selectable workloads; mount waits for URL configuration. Strict validation stays enabled.
- Table UI source deliberately hides row handles across selected rows. The runner now counts current row buttons; exact 40x40 checks pass 100 cells / 0 handles and 10 cells / 40 handles. Timing failures remain outside Phase 1.
- Lazy recovery is adopted with SHA ed9dadde655468a76ebfea03d6cafbcb42655782177190a304e9aa85c3ab0eac; original SHA be3d46be2cfc6c757286ffe00dbef554fae6c8320a6e669306a6c1ffb8c75408 is frozen in the control override.
- Package source typechecks pass. App source typecheck passes with 16GB after default-heap exhaustion. No source change was needed for the heap failure.

Throughput checkpoint:
- Work serially in the current checkout: selection, fixture, table control, history adoption, final checks. Reuse existing runner contracts and avoid concurrent heavy benchmarks. No subagents or publication.
- Fix Root Causes selects runtime trace before a selection patch. Model the Domain keeps existing selection provenance and history owners. Laziness Protocol favors deleting unused recovery work. Sequence Work into Verifiable Units requires each local repair to pass before the next.
- Decision trail: docs/plans/artifacts/2026-09-07-editor-performance-phase-1/decisions.tsv.

Decisions and tradeoffs:
- Retain the existing programmatic selection exporters for their current job, but let the same model-selection preference gate all delayed writes once native input takes ownership. No timer or second selection owner was added.
- Keep strict schema validation. Minimal benchmark fixtures use schema-only plugins; heading properties come from the canonical BaseHeadingPlugin declaration. Query readiness precedes editor mount.
- Measure the current row control and preserve multi-row suppression. Table timing budgets remain unchanged and outside this phase's performance claim.
- Keep canonical history changes and anchor recovery. Delete only the unused projection when there is no recovery payload. This preserves the demonstrated recovery path and removes six full-document fallbacks.
- No public API, package export, registry source or agent rule changed. Best API doctrine repair, layer planning, barrel/registry generation and agent-source sync are N/A. Changeset guidance was checked against main; no branch-only bug-fix/migration entry was added.

Harness/methodology repairs:
- Separate selection diagnostics from the existing optional idle wait; capture selectionchange and kernel traces without hiding the immediate sequence.
- Save exact generated bundles for queued-writer stack attribution. This happens before measured browser input.
- Replace an obsolete cell-handle DOM selector with the actual row button and verify a positive single-row control.
- Preserve original failed receipts, final source hashes, all samples, separate counter timings and the reverse baseline override. The arm named experiment restores old history; compiler8 serves adopted production bytes.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| Managed runner rejected --workers/--retries flags before assertions | 1 | Use owned managed command without unsupported flags | selection-browser-red.log preserved; red-02 ran 4 tests |
| Idle-prepared first probe omitted immediate native ownership handoff | 1 | Separate diagnostic observation from the existing idle wait and replay exact route | selection-immediate-diagnostic-01.json proves both immediate race windows; no completion claimed |
| Initial batched skill output truncated | 1 | Read bounded exact sections and do not dump numerical tables | Required implementation methods read in focused calls |
| Direct runner rejected explicit --retries=0 |1| Omit override; owned direct mode supplies retry 0 | final-02 runs 20/20 with 1 worker and 5 repeats |
| App typecheck exhausted default Node heap |1| Use 16GB heap with identical command/source | www-types-final.log:exit0 |
| Benchmark mjs files excluded by repo lint |1| Preserve configured exclusions and run syntax/execution proof | node --check passes;224 browser benchmark attempts pass |
| In-app narrow screenshot returned blank |1| Restore viewport and retain DOM observation separately | No narrow visual-layout or physical-device claim |

Verification evidence:
- **Selection:** exact red route fails 2 handle cases and passes 2 pointer controls; final source passes all 4 cases on 5 consecutive retry-free runs (20/20), plus 174 selection package tests. Immediate cross-editor diagnostics pass 18/18 actions at 100/10000.
- **Fixture:** initial HTTP 500 unknown-heading stack; final HTTP 200 with100 full-DOM blocks on both Plate basic and minimal baseline. Final browser confirms exact typed text, undo and redo with0 runtime errors. All 31 workload tests pass, including strict invalid-heading rejection.
- **Table:** exact 40x40 table passes100 selected cells / 0 row handles for 10x10 selection and 10 selected cells / 40 row handles for 1x10 selection. Trusted row handle click and Shift-click produce the expected native row text and 3x3 highlight.
- **History:** 72 contract tests pass;216/216 distribution attempts and 64 counter-run actions pass. Plite replacement medians:58.2 to 32.3 ms at 1k and392.0 to 76.4 ms at 10k. Plate:66.9 to 33.2 ms at 1k and451.3 to 85.2 ms at 10k. All4 frozen gains pass;0 material regressions. Counters show 6 to 0 fallback projections with 7 commits, 77 selector events and 0 renders unchanged.
- **Source/tooling:**863 measured source entries stable; final-source.json confirms all 11 captured package/runner/test inputs unchanged after final proof. Package typechecks and app typecheck pass; scoped lint and runner syntax checks pass. See commands.json and retained logs.

Final handoff contract:
- goal plan / scope: this Phase 1 record; all 4 selected acceptance rows complete; stop
- candidate / baseline identities: next a6afd55c plus final fingerprints; same-source reverse override restores original history be3d46be from adopted ed9dadde
- completed / N/A / pending lanes: 7 complete; 2 explicitly narrowed; 0 pending in Phase 1
- first conclusive cause: native caret handoff retained stale programmatic provenance and allowed a queued 80 ms export to overwrite native movement
- baseline / latest / best metrics: one final matched distribution; all 4 replacement medians improve 44.5–81.1%; no lucky-run selection
- fix owner / changed files: existing Plite selection/history; private www performance fixture and table runner; native regression tests and diagnostic helpers
- exact benchmark and correctness reruns: commands.json; history-results.json/csv; final browser, package, fixture and table receipts
- resumed breadth: selected mount,8-operation,example and100/1000/10000 cohorts completed after each local repair
- packet decisions: retain diagnostics; keep all 4 final repairs; leave later phase performance targets untouched
- harness/methodology repairs: diagnostic idle separation, exact bundle stack source, actual row-control selector and strict fixture readiness
- residual claim limits / next owner: frame-opportunity clocks, descriptive p95, no p99; no physical-device or narrow visual-layout claim; Phase 2/3 owns remaining table timing and broader costs

Timeline:
- 2026-09-07T11:03:59.141Z Benchmark goal plan created.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Phase 1 complete locally; all four accepted items pass |
| Where am I going? | Stop; Phase 2 requires its own request |
| What is the goal? | Complete Phase 1 only |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- No unresolved required Phase 1 finding. Table timing budgets remain red in the earlier dev-route measurements; performance repair belongs to Phase 2/3.
- The100-block Plate type-burst comparison is unclear under the frozen noise rule (candidate median 7.2 ms faster, below 8 ms floor; larger IQR 8.2 ms). No speed claim is made for that cell.
- Browser clocks measure frame opportunities, not compositor paint;15 samples support descriptive p95 only. No arbitrary-schema, collaboration, IME, virtualization, physical-device or narrow visual-layout certification is claimed.
- All work remains local, with no commit, push or PR.
