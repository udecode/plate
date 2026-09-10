# Cross-editor performance research and experimental roadmap

Status: completed research and selected experiments. The conditional performance program remains experimental; this is not a claim of overall superiority or an accepted product rewrite.

Objective:
Build the source-backed, measurable route to superior editor performance across human operations, including Wordgard and ProseKit; investigate techniques from VS Code and other strong implementations, React 19 Compiler, and virtualization.

Flow mode:
Experimental audit under Task, Benchmark and Editor Audit. Local research, benchmark tooling and disposable experiments are authorized; production adoption and publication are not.

Goal plan:
docs/plans/2026-09-07-editor-performance-research.md

Completion threshold:
- Inventory every in-scope architecture lane and human-operation family from current source and actual editor capabilities, with exact expected/reviewed/measured/missing/excluded counts.
- Compare current Plite/Plate and named references with pinned source, operation semantics, implementation layers and explicit feature/host limitations. Preserve historical results as historical.
- Execute comparable experiments using existing proof/benchmark owners. Every runnable selected experiment records correctness, source/build identity, work counters, distributions, noise and a keep/reject/inconclusive decision.
- Deliver per-lane scores and ranked experimental opportunities with a declared rubric. Scores are judgments about specific lanes or predicted opportunity, never fabricated timings or one aggregate superiority number.
- Produce a substantial separate virtualization study and React 19 Compiler coverage/source study, each with techniques, costs, constraints, experiments and rejection gates.
- Reconcile source-backed comparison manifests, prior candidates and original governing checklists; validate the final research artifacts and root plan. Explicitly distinguish completed research from the still-incomplete performance program.

Verification surface:
Current benchmark/target registry, existing owned browser runners, local reference source, official primary research/docs, strict concept matrices, experiment receipts and source hashes. Discover exact commands before adding a new runner or using any historical receipt as current evidence.

Constraints:
- Full DOM, staged rendering and virtualization are separate comparison classes. Preserve exact text, selection, history, clipboard, composition, collaboration and accessibility semantics.
- Human browser operations require trusted input and visible-state proof. Model-only operations and source complexity are attribution evidence, not keyboard latency.
- No benchmark retry selection, relaxed correctness or invented p99. Run heavy measurements serially; retain failed and inconclusive attempts.
- React Compiler coverage must be verified separately for packages, copied UI, docs and production/dev hosts. Compiler presence alone does not justify deleting observable identity.
- The desired outcome is superiority across declared operations and constraints. Ties, losses, unsupported capabilities and missing proof remain visible.

Boundaries:
Current checkout only; no commit, push, PR, release, external messages or product-source adoption. Reference checkouts remain read-only. Source research can run independently; heavy browser/benchmark jobs have one owner.

Blocked condition:
Missing source or runtime capability blocks its precise claim. Continue independent research and experiments; do not substitute a proxy without labeling it. Do not close a runnable required experiment as an evidence gap merely to end the task.

Work Checklist:
- [x] Read Poteto Mode Principles and the applicable Benchmark/Editor Audit contracts; preserve the prior completed highlighting work.
- [x] Frame the symmetric source inventory, human-operation denominator, architecture-lane rubric and current benchmark authority.
- [x] Research Wordgard and ProseKit performance architecture and local adoption opportunities.
- [x] Research VS Code/Monaco/CodeMirror and other virtualization techniques in a distinct study.
- [x] Audit current React 19 Compiler coverage and source-backed high-performance React precedents.
- [x] Map other editor baselines and all local architecture lanes; reconcile prior candidates after independent mapping.
- [x] Execute comparable operation benchmarks and decisive disposable technique experiments; preserve all outcomes.
- [x] Aggregate per-lane scores, gaps, material hard cuts, kept/rejected techniques and conditional next experiments.
- [x] Reconcile manifests, evidence, cleanup, source identities and semantic/root-plan validators; prepare the experimental handoff.

Throughput checkpoint:
Reuse the canonical benchmark target and browser ownership first. Partition independent source research into bounded artifacts; one writer owns this plan and decision trail, and one process owns performance measurement. Learn one operation/adapter by hand before extending the existing machinery. Each experiment ends with a result that changes the next experiment; no cascade of untested implementation plans.

Data shape:
One operation inventory keyed by human action, semantic capability, fixture/scale, architecture owner, current runner and evidence status; source comparison manifests remain the Editor Audit authority. Measurements, source judgments and predicted opportunities are distinct records linked by stable operation/lane/candidate IDs.

Source-linked obligations:
- Task: `.agents/rules/task/references/workflow.md` owns authority, current checkout, proof reuse and publication boundaries.
- Autogoal: `.agents/skills/autogoal/references/method.md` owns checklist retention and final reconciliation.
- Benchmark: `.agents/skills/benchmark/SKILL.md` and `references/methodology.md` own lanes, comparability, causal experiments, metrics and complete-mode validation.
- Editor Audit: `.agents/skills/editor-audit/SKILL.md` and `.agents/rules/editor-audit/references/feature-matrix.md` own symmetric atomic coverage, six qualitative dimensions, per-reference provenance and candidate disposition. The user's numeric per-lane request adds a clearly labeled scoring view; it does not replace source evidence.
- Poteto Mode/Swarm: frame, independent research, aggregate and report; native tools remain subject to actual authority. Build the Lever drives reuse/extension of a rerunnable inventory; Model the Domain separates evidence classes; Sequence Verifiable Units prevents untested plan cascades.
- Verify Plate owns browser claims and cleanup. Physical-device/OS IME evidence cannot be supplied by viewport or synthetic composition tests.
- Technical Writing and Show Me Your Work own clear prose and an append-only decision trail linked to actual evidence.

Evidence and current findings:
The previous highlighting adoption is complete in `2026-09-06-code-block-plate-plite-tiptap-perf-audit.md`. Its R4 receipts concern matched code highlighting only and do not establish broad superiority. Local checkouts exist for Wordgard, ProseKit, VS Code, Monaco, CodeMirror, Lexical, Tiptap, ProseMirror view, Slate and Quill. Current `rich-text-editors-benchmark.mjs` explicitly aggregates a Slate-only scope; its row count cannot establish cross-editor coverage.

Next action:
No selected research execution remains. The report and 34 independent conditional experiments are the handoff. Lazy history recovery projection is the first supported adoption candidate; each further intervention requires its own frozen contract and exact proof. Product adoption, publication and a universal performance claim remain outside this completed research scope.

Verification evidence:
- `artifacts/2026-09-07-editor-performance-research/report.md` links every measured result and all source studies. Broad/Compiler/history/extended distributions contain 1,314 distinct dataset cells; their absolute timings are never pooled.
- 31 selected headless targets ran in 34 attempts; five budget failures remain failures. Four React/JSDOM diagnostics ran with 17 scenarios, including the preserved initial callback failure. Exact aggregates independently recompute source statistics and retain unsupported and ungated rows.
- Four actual Plite full/auto/virtualized screens, three fresh managed Chromium guards, normal Plite full-DOM route, two trusted playground actions and four table smoke jobs were executed. Development-host, readiness, timing and UI failures remain explicit in the product-route result. No production or physical-device certificate is inferred.
- All 225 concept rows across ten reference matrices pass strict validation. The 68-family operation ledger, 43-lane scorecard, 48-target registry and 122-row prior-candidate reconciliation have exact denominators. Reference byte readback, local owners and derivative links are independently checked.
- `final-product-source-verification.json` verifies 618 unique loaded package source files against all five sealed browser packets. The 2,512-file product host snapshots match across the measured interval; later unrelated changelog-file changes are separately recorded. Final app/browser doctor retains the matching compiled host.
- `final-tooling-verification.json` records eight syntax checks and identical normalized emitted code for all five final formatted benchmark helpers; original measured versions are archived. Focused website lint and explicit benchmark formatting pass. `target-registry-final.log` verifies all 48 targets.
- `other-editors/results-explorer-browser-proof.json` records desktop/narrow filter and failure-state proof plus 16 exact CSV-export rows from real browser downloads. Temporary viewport overrides, browser tabs and owned WWW/static servers are cleaned up.
- Final Benchmark complete-mode and Autogoal results are recorded in `artifacts/2026-09-07-editor-performance-research/final-plan-validation.log` after this checklist reconciliation. No Autoreview applies on `next`; no package/public API, registry UI or reusable workflow rule changed, so package build, barrels, registry generation and doctrine repair are inapplicable.

Open risks:
- The research outcome is complete; universal editor superiority and the conditional implementation program are not. Forty-nine human families have no matched root browser action/mount case, and no whole human family is declared closed. Exact missing cases and compatible R4 proof are listed in the operation ledger.
- Native line-start/end convergence, table UI/latency, playground Enter, five headless budgets and full Plate performance-route readiness remain unresolved findings. This research scope does not authorize product repairs; causal hypotheses are not accepted fixes.
- Physical IME/mobile/assistive technology, browser find/print under windowing, provider/network collaboration, complete feature parity and real copied-UI consumer compilation remain distinct unproved contracts.
- Source fitness scores and predicted opportunity are judgments, not timings. Virtualized and full-DOM presentations have different scrolling/native contracts; event/frame and later snapshot clocks do not certify compositor presentation.


## Benchmark Source

- invocation: `$benchmark cross-editor performance research`, experimental audit with current editor references
- candidate-identity: fingerprint: each source-first bundle records every loaded input before and after its packet
- plite-identity: fingerprint: current workspace source entry graph; `config/workspace-source-entries.mjs`
- plate-main-identity: N/A: external editor research on the current checkout; no historical main regression claim
- slate-identity: fingerprint: exact sibling Slate ref and loaded source inputs recorded by the cross-editor runner
- final-artifacts: artifact: docs/plans/artifacts/2026-09-07-editor-performance-research/

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
| --- | --- | --- | --- | --- | --- |
| 1 | source-and-host-readiness | yes | complete | artifact: final-adapter-smoke-01.json; 10 surfaces including the retained Plite control pass all 19 operations with stable loaded inputs | Minimal decomposition |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - current external-editor research without a historical main claim | No isolated Plate checkout is authorized or required for this comparison | Decomposition |
| 3 | plate-vs-plite-decomposition | yes | complete | cross-editor-distributions-01.json: 540 attempts pass the original 19-action guards, 450 measured; schema 1 clock and weak rich-format limitations retained. compiler-correctness-01.json: 12/12 six-arm control attempts pass stronger guards | Owner probes |
| 4 | owner-microbench-and-trace | yes | complete | History: 4/4 frozen gains and 72 tests; Compiler: 83 ties/one unclear; Find: inconclusive; 31 headless targets in 34 attempts with five budget failures; 4 React/JSDOM diagnostics executed, all outcomes retained | Mount matrix |
| 5 | product-mount-matrix | yes | complete | product-routes/results.md: normal Plite full-DOM 100 route and table mount executed; Plate mixed performance route fails schema readiness before mount. Four production static Plite screens cover full/auto/virtualized at 1k/10k. DEV and static builds remain separate | Research result retained |
| 6 | trusted-editing-matrix | yes | complete | 34-action exact smoke; broad 600 plus extended 480 cells, 456 complete extended cells and 24 failed line cells; trusted playground typing passes and Enter misses DEV mutation budget. Exact failed/unsupported semantics remain visible | Research result retained |
| 7 | plite-vs-pinned-slate | yes | complete | broad-results.md and extended-results.md compare exact pinned Slate loaded source against both Plite renderers on matched 100/1k/10k fixtures; source/feature/clock limits explicit | Research result retained |
| 8 | example-breadth | yes | complete | feature/headless owners, four React diagnostics, actual playground/table routes and fresh virtual guards executed; source-matched R4 cases reused only with current fingerprints. Table job failures retained; physical/unmatched cases named in 68-family ledger | Research result retained |
| 9 | large-and-stress | yes | complete | full-DOM 100/1k/10k cross-editor cohorts, 32KiB paste/replacement, 50k publication, 1k-plugin typegraph and decoration/inline pathological cases; separate full/virtualized screens. Losses and ungated latency are explicit | Experimental handoff |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- lane: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- comparable-baseline: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- material-delta: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- isolated-owner: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- causal-intervention: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- correctness-guard-result: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- fix-class: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- long-term-target: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- decision-owner: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- layer-plan: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- compatibility-verdict: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- fix-owner: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- benchmark-command: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- benchmark-rerun: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- benchmark-rerun-result: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- correctness-command: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- correctness-rerun: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- correctness-rerun-result: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate
- resume-lane: N/A: terminal H1 prototype recorded in Cause History; experimental adoption remains separate


## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H1-lazy-history-recovery-projection | plate-vs-plite-decomposition | kept | internal-implementation | Evaluate the existing history recovery projection only when its current consumer needs it; preserve canonical changes and anchor-bearing recovery | benchmark | N/A: narrow internal prototype; no public API or architecture adoption is authorized | N/A: no public or serialized contract changes in the disposable experiment | Existing Plite history extension; research override only, product source unchanged | Six token fallbacks removed; required replacement gains 44-82 percent on both recorded clocks with constant commit/selector counts | pass: Control arms pass exact text, bold and marked-document undo/redo in history-locality-correctness-01.json | recorded-command: artifacts/2026-09-07-editor-performance-research/experiment-commands.json history.distribution | pass: history-locality-distributions-01.json has 216/216 passing attempts, 4/4 replacement gates, zero material regressions and one unclear undo cell; 863 source entries stable | recorded-command: artifacts/2026-09-07-editor-performance-research/experiment-commands.json history.correctness | pass: history-locality-contracts-02.log records 72 tests and actual transformed-source loader receipt; browser diagnostic has 8/8 passing attempts | artifact: artifacts/2026-09-07-editor-performance-research/other-editors/history-results.md; accepted prototype only |

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
| --- | --- | --- | --- |
| ref / dirty fingerprint | fingerprint: all loaded current workspace files | fingerprint: each exact reference source and dependency graph | artifact: per-packet build inputs |
| lockfile / package manager | Workspace lock and exact React 19.2.8 | Same React for React hosts; pinned scratch comparator dependencies | artifact: per-packet package and lock hashes |
| build mode / host / port | Production source-first esbuild; Compiler toggle is a named experimental arm | Same build options and local server; imperative and React hosts identified | artifact: per-packet config |
| browser / machine / viewport / DPR | Chromium, local host, 1280x720, DPR 1 | Same binary/context options and rotating interleave | artifact: per-packet identity |
| route / fixture / document / plugins | Paragraph/text/bold/history minimal host; separate rich feature cohorts | Same fixture and available semantics; unsupported operations explicit | artifact: operation inventory and adapter guards |
| setup / action / DOM strategy | Full DOM; trusted input versus command probes recorded separately | Same native action and final-text/caret/history guards | artifact: raw attempts |
| warmups / samples / interleave order | Diagnostic 0/1; distributions 3/15; no p99 at that sample count | Same counts and rotating order; no retries | artifact: all attempts retained |

## Interaction Coverage

- first-interaction: pass: matched adapter mount/first insertion attempts and normal actual-route mount/start-block diagnostics are recorded. Clock excludes earlier bundle load for adapter packets; failed Plate route readiness is retained.
- settled-interaction: pass: exact action results and distributions exist for typing, selection, replacement, deletion, split/join, marks, clipboard and history; failed line navigation and unsupported HTML presets are separately reported. This records research coverage, not universal correctness.
- route-scope: pass: actual Plite example, Plate playground and table routes exercised by their owned runners; product-routes/results.md records development mode and all failures. Static full/virtualized route proof is separate from minimal adapter evidence.
- reporter-profile: N/A: no reporter profile is named; raw device and OS input remain explicit research gaps

## Frozen experiment rules

For cross-editor descriptive measurements, retain every result without declaring an aggregate winner. A material timing difference must exceed both 20% and 2 ms for model work, 20% and 8 ms for browser input, or 20% and 25 ms for mount, and exceed the larger compared interquartile range. p95 from 15 samples is descriptive; p99 is omitted. Technique acceptance also requires a deterministic work reduction and all exact correctness guards. Normal input target is below 50 ms p95 to the next observed paint opportunity; large/stress target is below 100 ms, and mount targets are 250 ms at 100 blocks, 1 s at 1000 and 3 s at 10000. These are research targets, not retrospective product guarantees. A two-frame completion fence is a settled DOM proxy, not a compositor presentation timestamp; report its clock accurately.

The existing `huge-document-cross-editor.mjs` owns the comparison with current source-first adapters, semantic guards and per-packet provenance. Its executable workload is recorded in the canonical 48-target registry. The Wordgard/ProseKit 59-family inventory is an initial input to the final 68-family union, not a separate complete denominator.
