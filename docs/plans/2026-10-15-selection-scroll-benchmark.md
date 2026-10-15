# Selection scroll frame work

Status: executed; local commit authorized, no push
Playbook: perf-issue

## Brief

### What will change?

Text selection keeps its scrolling speed without delayed updates pulling it backward. The earlier functional fix is committed locally. The owner authorized a local commit of this follow-up. No push is authorized.

### What could go wrong?

A faster drag can still select the wrong characters. Preserve model and DOM selection, direction, release and follow-up typing. On a loaded machine, frame timings remain diagnostic and cannot support a stable speed claim.

## Teach

Text and block selection use the same edge-scroll step. During text dragging, selection updates also preserve the page position. The old code saved that position and restored it immediately, again in a microtask, and again on the next animation frame.

Those delayed restores could overwrite a newer drag step. The change keeps the immediate restoration and removes the delayed writes. It leaves the speed calculation unchanged. Frame timings on this development host remain diagnostic.

## Benchmark Source

- request: Investigate the reported dropped frames after the text/block scroll parity fix; test against existing benchmarks; commit the functional fix once without pushing.
- scope: Ordinary text-selection auto-scroll on /blocks/playground, with block selection as a reference and normal/200/1000-block cohorts.
- invocation: $benchmark selection scroll performance
- candidate-identity: ref: c220db8bb25726e1f1c213430dd1531d4c67107d plus this run's later saved patch and runtime/harness fingerprints
- plate-main-identity: ref: ab9a12bd6a7a2d0828669aea5ac4e137d9a6cc8d; no matching controlled text-drag speed contract; functional baseline is c220db8bb25726e1f1c213430dd1531d4c67107d
- plite-identity: ref: c220db8bb25726e1f1c213430dd1531d4c67107d packages/plitejs source
- slate-identity: N/A: native Slate drag does not implement the controlled speed contract; no cross-library ranking
- named-symptom: Dropped frames while extending text selection during automatic scrolling
- final-artifacts: artifact: docs/plans/artifacts/selection-scroll-performance/
- inherited-budget: N/A: the previous functional change had no frame-time budget; historical block-drag results guide discovery only
- inherited-budget-result: N/A: no inherited timing decision

Boundaries:
- allowed runtime/packages/apps: packages/plitejs selection export owner; exact affected callers only
- allowed benchmark/tests/fixtures: Existing core-text-selection target and selection-edge-scroll browser cases; a local exact-gesture measurement probe because current targets do not time it
- allowed baseline checkouts/hosts: Current pre-edit functional baseline and isolated detached proof worktree if required; only one server and browser worker running at a time
- non-goals: No push, PR, global benchmark sweep, release, personal Chrome or unrelated generated-output cleanup

## Interaction Coverage

- first-interaction: pass: stale-scroll-final-smoke-a1.log starts with an actual text mousedown and verifies zero backward writes
- settled-interaction: pass: synchronous-restore-final.json records 60 held frames, stable anchor, growing native range and release
- route-scope: pass: /blocks/playground plus /blocks/media-demo with 200 and 1000 paragraphs read back
- reporter-profile: N/A: the personal Chrome profile is excluded by the user; isolated headless Chromium only

Use `pass: <proof>` or `N/A: <concrete reason>` for each phase and host.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | c220db8bb2 plus the synchronous-selection-restore candidate patch | c220db8bb2; captured SHA256 covers the drag and geometry modules; selection-controller identity is reconstructed from HEAD in final-identity.json | artifact: docs/plans/artifacts/selection-scroll-performance/rewind-baseline.json |
| lockfile / package manager | same pnpm lockfile and local installed dependencies | same pnpm lockfile and local installed dependencies | artifact: docs/plans/artifacts/selection-scroll-performance/rewind-baseline.json |
| build mode / host / port | development source; reused localhost:3000; diagnostic counts only | development source on localhost:3558; no production timing claim | artifact: docs/plans/artifacts/selection-scroll-performance/rewind-baseline.json |
| browser / machine / viewport / DPR | installed headless Chromium; 12 logical CPUs; 16 GiB; 1280x720; DPR1 | same machine, browser and viewport | artifact: docs/plans/artifacts/selection-scroll-performance/rewind-baseline.json |
| route / fixture / document / plugins | /blocks/playground; 35-block full fixture; EditorKit | same full fixture and plugin configuration | artifact: docs/plans/artifacts/selection-scroll-performance/rewind-baseline.json |
| setup / action / DOM strategy | actual text mousedown then held outside viewport; 60 frames; full DOM | same gesture; rewind-control suppresses only backward scroll writes as a diagnostic intervention | artifact: docs/plans/artifacts/selection-scroll-performance/rewind-baseline.json |
| warmups / samples / interleave order | one unreported warmup; 60 frames per packet; five baseline and five candidate packets for the final work-count check | same-code and rewind suppression controls before any product edit | artifact: docs/plans/artifacts/selection-scroll-performance/rewind-baseline.json |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Benchmark Source and the prior commit c220db8bb2; no push |
| `benchmark` source and methodology read | yes | Benchmark and perf-issue workflow applied before measurement |
| Existing plan reused | yes | This plan coordinates this one performance run |
| Candidate and baseline identities recorded | yes | final-identity.json; served-source-identity.json; preserved baseline packets |
| Target/runner discovery completed from current source | yes | core-text-selection in benchmarks/targets/slate-v2.json; editor/DnD runners checked |
| Host/build/fixture freshness proved | yes | served-source-identity.json; fixture readback in scale-200.json and scale-1000.json |
| Correctness oracle identified | yes | preserve-scroll-red-a1.log and stale-scroll-red-a1.log fail for the named defect |
| All default lanes inventoried | yes | Nine rows above; six applicable and three inapplicable |
| `only` narrowing explicitly authorized or N/A | no | N/A: scope supplied; no only narrowing claimed |
| Browser/native proof strategy selected | yes | Real mouse in isolated Chromium; no personal Chrome |
## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | served-source-identity.json and core-baseline-a2.log | None |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - origin/main lacks this controlled text-drag speed contract | Compare with the freshly committed functional owner instead of different native behavior | None |
| 3 | plate-vs-plite-decomposition | yes | complete | Plite core baseline plus core/runtime/DOM frame attribution in the real Plate route | Isolate the hot owner |
| 4 | owner-microbench-and-trace | yes | complete | comparison.json records five matched-fixture candidate packets with zero backward writes; core-timing-final-a2.log checks seven core lanes | None |
| 5 | product-mount-matrix | no | N/A: inapplicable - no mount or initial rendering change is proposed | The report concerns an already-mounted held drag | None |
| 6 | trusted-editing-matrix | yes | complete | final-browser-a2.log: 80 passed across five repetitions, no retries; final-react-a1.log: 76 passed | None |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - no matched controlled-scroll Slate workload or substrate ranking | DOM selection frame work is the target | None |
| 8 | example-breadth | yes | complete | synchronous-restore-probe-a3.log and plain-scale-a3.log | None |
| 9 | large-and-stress | yes | complete | scale-200.json and scale-1000.json; zero backward writes, 1680px per 60 frames, correct growing range and release | None |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: cause closed; see Cause History
- lane: N/A: cause closed; see Cause History
- comparable-baseline: N/A: cause closed; see Cause History
- material-delta: N/A: cause closed; see Cause History
- isolated-owner: N/A: cause closed; see Cause History
- causal-intervention: N/A: cause closed; see Cause History
- correctness-guard-result: N/A: cause closed; see Cause History
- fix-class: N/A: cause closed; see Cause History
- long-term-target: N/A: cause closed; see Cause History
- decision-owner: N/A: cause closed; see Cause History
- layer-plan: N/A: cause closed; see Cause History
- compatibility-verdict: N/A: cause closed; see Cause History
- fix-owner: N/A: cause closed; see Cause History
- benchmark-command: N/A: cause closed; see Cause History
- benchmark-rerun: N/A: cause closed; see Cause History
- benchmark-rerun-result: N/A: cause closed; see Cause History
- correctness-command: N/A: cause closed; see Cause History
- correctness-rerun: N/A: cause closed; see Cause History
- correctness-rerun-result: N/A: cause closed; see Cause History
- resume-lane: N/A: cause closed; see Cause History

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| selection-scroll-restore-order | owner-microbench-and-trace | kept | correctness | Restore only synchronous selection-export scroll effects; preserve later scrolling | bug-fix | N/A: same owner | N/A: no public change | packages/plitejs/src/react/editable/selection-controller.ts | rewind-control.json suppresses the stale writes and eliminates stalled samples | pass: baseline native range grows and release stops; red regression exposes 60 backward writes | pnpm --dir apps/www exec node ../../docs/plans/artifacts/selection-scroll-performance/scroll-probe.mjs --url http://localhost:3000 --out ../../docs/plans/artifacts/selection-scroll-performance/synchronous-restore-final.json | pass: synchronous-restore-final-a1.log and a3 through a6.log; comparison.json | PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter www test:www-browser:chromium tests/browser/selection-edge-scroll.spec.ts -g 'never restores an older' --retries=0 | pass: stale-scroll-final-smoke-a1.log; final-browser-a2.log includes five no-retry runs | Port relocation 3558 to3000 documented below; preserve-scroll-red-a1.log and final-react-a1.log prove immediate restoration and later-scroll retention |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| native-coordinate control | owner-microbench-and-trace | Range lookup dominates | Reduced range reads but no useful total task-time change | pass | rejected; no product edit | None |
| toolbar control | owner-microbench-and-trace | Toolbar work dominates | No useful total-task change | pass | rejected; no product edit | None |
| scheduling candidates | owner-microbench-and-trace | Move drag after restore | Fresh regression still reports 1 to 3 rewinds | fail | reverted | Current synchronous fix supersedes both |
| synchronous restoration | owner-microbench-and-trace | Old deferred scroll snapshots undo newer movement | 57 to58 rewinds per 60 frames becomes0 | pass | kept | Complete |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| Backward writes / held drag | 5 packets x60 frames per side | median58; range57–58 | median0; range0–0 | 58 fewer at median; 100% removed | Discrete write counts; no timing claim | comparison.json |
| Stationary scroll samples | 5 packets x59 adjacent samples | median3; range2–3 | median0; range0–0 | 3 fewer at median | Real scrollTop readback | comparison.json |
| rAF gap, diagnostic only | 5 packets x59 gaps | packet median p50 13.4ms; p95 27.2ms; p99 N/A | packet median p50 11.2ms; p95 27.1ms; p99 N/A | No speed verdict | Different dev hosts, memory pressure varied; small tails | comparison.json |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | Zero backward writes and growing stable-anchor native range, five packet repetitions |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-10-15-selection-scroll-benchmark.md` at cause/resume checkpoints | Passed at cause checkpoints and final close |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | Six complete; three concretely inapplicable |
| Exact post-fix benchmark reruns | yes | Rerun every kept fix against its original lane/baseline | Same runner/fixture/action with documented host-port relocation; comparison.json |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | final-browser-a2.log, 80 passed; final-react-a1.log, 76 passed |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | final-identity.json; served-source-identity.json; final-candidate.patch |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | core-timing-final-a2.log; core-known-bad-a1.log rejects no-op insertion; old timing discarded |
| Durable fix decision | yes | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | One correctness fix at the existing selection export owner, no public API change |
| Package/type/build proof | yes | Run affected package checks/typecheck/build only where owned | final-types-a1.log exit0; final-react-a1.log exit0; scoped lint clean |
| Browser surface proof | yes | Run Browser for product routes; Chrome/device for native state when applicable, or N/A with reason | Automated Chromium proof and in-app desktop-light drive passed; hand-drive-final-a3.log and hand-drive-selection.jpg |
| Changeset/release artifact | yes | Add only for published package behavior/API changes, otherwise N/A | .changeset/plite-drag-visible-scroll.md updated; no release or push |
| Benchmark plan complete validation | yes | Run validator with `--complete` | Passed --complete at final close |
| Plan complete | yes | Run `node .agents/pstack/plan-open.mjs docs/plans/2026-10-15-selection-scroll-benchmark.md` | plan-open.mjs passed; hand-drive-final-a3.log closes the manual scroll check |

Verification evidence:
- Browser final-browser-a2.log, React final-react-a1.log and types final-types-a1.log passed.
- Core core-timing-final-a2.log passed; the known-bad no-op insert failed with false !== true in core-known-bad-a1.log.
- Core benchmark now uses current creation/read APIs and excludes snapshots/assertions from timed operations. Earlier core timings are discarded; no CPU or production FPS improvement is claimed.

## Measurement contract

First collect one exact-gesture baseline packet before freezing a time budget. Primary diagnostic work is layout/range reads, selector result sizes and selection publications per actual scrolled frame. Record scroll distance, stable anchor, growing focus and native text so a no-op cannot win. Time rAF gaps and CDP task/layout/style work separately from an instrumented CPU profile. Do not add inclusive profiler buckets together.

For an accepted deterministic reduction, require at least 50% fewer identified wasted operations at unchanged fixture/action and a passing correctness guard. Any time-based verdict additionally requires five interleaved packets, a same-code noise control, a planted-slowdown control and a quiet host. A loaded host permits only work-count conclusions. No timing receipt is rewritten from diagnostic dev runs.

## Resources

At intake the host has 16 GiB and 12 logical CPUs. Memory pressure was at warning and later returned to normal. Do not start a browser or build while it is at warning. Keep one server, one headless test browser and one worker; do not stop other chats' processes. Stop owned processes after each measurement session and at handoff.

## Candidate history

The first two candidates only changed scheduling in root-interaction-controller. One warm probe passed, but fresh gesture tests still observed one to three backward writes. Both candidates were reverted completely before the current fix. The regression remains strict.

The synchronous restoration test deliberately makes native selection export move the scroll position. It proves that export still restores that immediate side effect, while a later explicit scroll survives the queued scheduler work. The test failed with 100 instead of 128 before the deletion and passed afterward.

The 3558 service was stopped after the memory guard refused browser launches. The existing 3000 server serves this checkout with source aliases. The served-source-identity.json artifact confirms both immediate restore calls and the absence of deferred restoration. Reruns use the same fixture, action, dependencies and work-count assertions on that host; port relocation is a documented command deviation. No before/after wall-clock verdict uses the relocated host.

The first large-fixture attempts on the authored playground did not install the requested document, so their readback guards failed and produced no accepted measurement. The existing media-demo route accepts the same browser-handle replacement. Both 200- and 1000-block runs read back the requested sizes before recording.

The full browser replay initially stopped because its pause assertion also compared the page's maximum scrollable height. The failure showed only maxScrollTop changing from 2570 to 2920; current scrollTop, model selection and native text remained unchanged. The check now compares those required state fields explicitly at pause and release. It still rejects movement or a changed range. The failed log and screenshot are retained; no timing retry is discarded.

## Demo

1. Open http://localhost:3000/blocks/playground. Start selecting ordinary text, hold above or below the viewport, then move back to the middle and release. Scrolling keeps the block-selection step and stops without delayed backward jumps.

## Main changes

- Remove the microtask and animation-frame scroll restoration from selection export; keep the immediate restore.
- Add a real drag regression for backward scroll writes and extend the existing preserve-scroll contract for later scrolling.
- Repair the existing core benchmark API calls and move its validation outside the timed region.

## Close

The functional fix is local commit c220db8bb2. The owner subsequently authorized one local commit of the performance follow-up and explicitly prohibited pushing. This commit includes only the selection export fix, its tests, the benchmark repair, the existing changeset update and this plan.

Five normal-fixture baseline packets recorded 57–58 backward writes per 60 frames and two or three stationary samples. Five final candidate packets recorded zero backward writes and zero stationary samples, each moving 1680px. Both 200- and 1000-paragraph probes also moved 1680px with a growing native range, stable anchor and correct release. These are work-count and correctness observations. Development-host rAF timings do not establish a production FPS gain.

The two scheduling-only candidates were reverted after fresh-gesture regressions failed. Native-coordinate and toolbar controls did not isolate a useful latency improvement and produced no product edits. The retained change removes stale delayed restoration at its original owner.

The read-only same-family audit found the benchmark timer boundary, host-identity wording and missing final sample repetition. All three were addressed. It was a limited evidence/code audit, not a complete transcript audit. No product-code blocking finding was reported.

Final correctness proof is 80 browser passes across five repetitions with zero retries, 76 React passes, the React typecheck, scoped lint and the repaired seven-lane core target. The false-positive total-page-height assertion was repaired without relaxing actual scroll or selection stability.

Only the existing 3000 service was reused. Temporary 3558 services were stopped, and owned headless browsers closed. The user's Chrome was not opened or controlled.

## Hand drive

The in-app browser connected and memory pressure returned to normal. With the owner's authorization, the existing 3000 server was stopped before starting one drive server. The old .next-drive cache crashed inside Turbopack. Reusing the previously tested .next-text-scroll directory served the real page successfully with drive reporting enabled. Neither cache was deleted.

At 1280×720 in light, a real held mouse drag moved scrollTop from 980 to 2100, then reversed to 1092. Moving back to the middle settled at 1064 and stayed there; releasing also stayed at 1064. The native selected text grew. Clicking a heading afterward accepted an x and undo restored it. The screenshot was read for selection paint, clipping and layout. hand-drive-final-a3.log reports covered and exits0. This closes the manual interaction check, without claiming a production FPS measurement.

![Text selection after manual edge scrolling](artifacts/selection-scroll-performance/hand-drive-selection.jpg)

The successful verification tab was closed, its viewport override was reset and the drive server was stopped. The original 3000 service was restored, then stopped at the owner's request so they can start it themselves. The two failed-navigation tabs remain subject to the browser tool's data-URL restriction; no personal Chrome was opened.

## Open work

- The initial in-app page load logged a date hydration mismatch, with January 15, 2024 on the server and 2024年1月15日 on the client. This was observed before the fresh light-page interaction; the later drive visit passed. No pre-existing or patch-causation claim is made. Owner: Sin. Tracking: this plan and hand-drive-console.json. Stop: resolve or assign the first-load date-language mismatch separately from Selection.
