# full DOM 10k benchmark

Objective:
Close the exact Plate full-DOM 10k performance packet; done when honest metrics
and correctness proof close.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-24-full-dom-10k-benchmark.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: User accepted the recommended exact Plate `domStrategy="full"`, no-content-visibility, 10,000-block benchmark packet after a harsh plan-worthiness review.
- scope: Plate with basic plugins, shallow mixed-block fixture, `full`, content visibility `none`, 10,000-block candidate with a matched 5,000-block scaling baseline; cold/full-DOM readiness, React mount commit, DOM/heap, native typing/selection, and one structural select-all/delete/type/undo flow.
- invocation: `$benchmark only full-dom-10k`
- candidate-identity: fingerprint: commit `a525367f60000a33055e727db062ccc610880ea9` plus the source hashes recorded below.
- plate-main-identity: N/A: only - no current-versus-main comparison was accepted.
- plite-identity: N/A: only - the packet measures the current Plate surface, not a Plate-versus-Plite comparison.
- slate-identity: N/A: only - no Plite-versus-Slate comparison was accepted.
- named-symptom: The default 10k example uses a degraded strategy; the exact 10k full-DOM performance envelope lacks one authoritative packet.
- final-artifacts: artifact: `.tmp/full-dom-5k-react.json`; artifact: `.tmp/full-dom-10k-react.json`; artifact: `.tmp/full-dom-5k-native.json`; artifact: `.tmp/full-dom-10k-native.json`; artifact: `.tmp/full-dom-10k-native-repeat.json`; artifact: `.tmp/full-dom-10k-native-telemetry-smoke.json`. These ignored local proof artifacts are fingerprinted below and are not commit inputs.

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
- requested duration: N/A: no duration requested.
- semantics: N/A: one-shot execution closes the exact packet.
- start / deadline: N/A: no timed checkpoint.
- final loop closure: Finish the active measurement or repair packet, then record green, red with causal owner, or an honest blocker.

Completion threshold:
- Emit matched 5k and 10k artifacts for Plate with basic plugins, shallow mixed blocks, `domStrategy="full"`, and content visibility `none` from the current source identity.
- Require requested and effective strategy `full`, 10,000 mounted top-level blocks, zero full-surface readiness timeouts, successful native text editing and selection, and successful 10k select-all/delete/type/undo restoration.
- Record React mount-commit, full-DOM population/readiness, DOM-node, retained-heap, native type-to-paint, model-ready, selection, structural-edit, and undo metrics. Omit p99 where sample count cannot support it.
- Predeclared materiality: native type-to-paint is red only when 10k p95 exceeds the existing 75 ms interactive budget and the 10k/5k p95 ratio exceeds 1.25 outside repeat-packet noise; mount/DOM/heap scaling above 2.5x for a 2x document is diagnostic red; any correctness failure is red regardless of timing.
- A red packet closes only after causal isolation plus an implementation or architecture owner, or after a genuine blocker meets Autogoal's blocked contract.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`, P1 autoreview passes when
  code changed, and the Autogoal checker passes.

Verification surface:
- benchmark commands / artifacts: matched current-source 5k/10k JSON artifacts from the existing editor-perf runner plus an exact native browser trace artifact; commands finalized after source/host readiness.
- correctness commands: exact-route full-strategy/mounted-count/native typing/select-all/delete/type/undo assertions plus the focused owning tests when harness code changes.
- Browser / Chrome / device proof: Browser proof on the local `/dev/editor-perf` or huge-document route after any app-facing harness change; raw device proof is N/A because no device-specific claim is requested.
- source/ref/fingerprint proof: commit plus SHA-256 hashes for lockfile, runner, route, workload, Plite full-DOM owner, browser trace, and benchmark target registry.

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
- allowed runtime/packages/apps: `apps/www/src/app/dev/editor-perf/**`, its runner, the existing huge-document route needed for exact Plate proof, and `packages/plite-react` only if a measured cause proves that owner.
- allowed benchmark/tests/fixtures: current huge mixed-block workload, `benchmarks/slate-v2/donor/browser/react/**`, `benchmarks/targets/slate-v2.json`, focused browser tests, this plan, and generated `.tmp` artifacts.
- allowed baseline checkouts/hosts: current checkout only; same-source 5k cohort is the scaling baseline. No branch switch, worktree, `origin/main`, or sibling Slate checkout.
- non-goals: no public API change, no `domStrategy` semantic change, no virtualization redesign, no rich/nested corpus expansion, no commit/PR/release, and no runtime optimization without conclusive causal evidence.

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- Stop only if the current source cannot build or host the exact route after the repo-prescribed reinstall recovery, Chromium cannot execute the exact lane after three materially different repairs, or a proven cause requires a public/runtime architecture decision that must route through `best-api` and `plite-plan` before implementation.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | `a525367f60000a33055e727db062ccc610880ea9`, exact source hashes below | same source identity | artifact: this plan's source fingerprint evidence |
| lockfile / package manager | `pnpm-lock.yaml` SHA-256 `193f957d...039d7f2`; pnpm 9.15.0, Bun 1.3.12, Node 22.22.1 | identical | artifact: source-and-host readiness evidence |
| build mode / host / port | fresh Next 16.3.2 development host at `http://127.0.0.1:3101`; current-byte telemetry smoke and Browser proof repeated on fresh port `3102` | same host and build | artifact: six JSON files and exact Browser proof recorded below |
| browser / machine / viewport / DPR | Chrome for Testing 137.0.7151.55; macOS 26.3.1 arm64, Apple M5 Max, 128 GiB; Puppeteer default viewport 800x600/DPR 1 unless artifact reports otherwise | identical | artifact: source-and-host readiness command output recorded in this plan |
| route / fixture / document / plugins | Plate basic plugins; huge mixed shallow blocks; 10,000 blocks | identical except 5,000 blocks | artifact: `apps/www/src/app/dev/editor-perf/page.tsx` and `workloads.ts`; Plate core without HeadingPlugin rejects this fixture under current schema validation |
| setup / action / DOM strategy | `full`, visibility `none`; mount/readiness, selection then native type, select-all/delete/type/undo | identical actions and strategy | artifact: `page.tsx` strategy mapping plus this plan's exact scope |
| warmups / samples / interleave order | 3 warmups + 10 React mount samples; 1 warmup + 5 native packets; one 10k repeat packet after the first 5k/10k pair | same source and host; 5k then 10k, followed by the 10k noise check | artifact: six fingerprinted JSON files below |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Scope, metrics, stop condition, non-goals, final artifact, and architecture escalation gate are recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `benchmark` source and methodology read | yes | Read `.agents/skills/benchmark/SKILL.md` and `references/methodology.md` completely before goal creation or measurement. |
| Active goal checked or created | yes | Goal created for this exact plan after `get_goal` returned no active goal. |
| Candidate and baseline identities recorded | yes | Current commit and source fingerprints recorded; same-source 5k cohort is the baseline. |
| Target/runner discovery completed from current source | yes | Existing generic editor-perf runner supports 10k/full/none; current 5k no-chunk preset and browser trace lack the exact combined Plate 10k native packet. |
| Host/build/fixture freshness proved | yes | Generated current docs source, started Next 16.3.2 from the current checkout on port 3100, and received HTTP 200 from `/dev/editor-perf`. |
| Correctness oracle identified | yes | Full requested/effective strategy, mounted-count, native typing/selection, and select-all/delete/type/undo restoration on the exact route. |
| All default lanes inventoried | yes | Complete ordered table below; unrelated lanes use explicit `N/A: only` reasons. |
| `only` narrowing explicitly authorized or N/A | yes | User's `ok go` accepted the explicitly recommended single exact packet; invocation is `$benchmark only full-dom-10k`. |
| Browser/native proof strategy selected | yes | Existing runner for React mount plus current-source native browser trace/harness repair for Plate full DOM. |
| Output budget strategy recorded | yes | see above |
| Commit/PR/release authority recorded | yes | no mutation authorized by default |

Work Checklist:
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
      execution may use `auto`; target selection may not.
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
| 1 | source-and-host-readiness | yes | complete | Current source fingerprints, tool/browser/machine identity, fresh Next 16.3.2 host, HTTP 200 route, exact fixture, actions, and 5k/10k commands are resolved. | Run large-and-stress. |
| 2 | current-vs-main-product-smoke | no | N/A: only - no current/main regression comparison requested | The exact contract is same-source 5k/10k scaling. | large-and-stress after readiness |
| 3 | plate-vs-plite-decomposition | no | N/A: only - no layer-tax comparison requested | Plate basic plugins are the named surface; Plite is not a baseline. | large-and-stress after readiness |
| 4 | owner-microbench-and-trace | no | N/A: only - run only if the exact packet becomes red and needs causal isolation | No cause exists before measurement. | large-and-stress after readiness |
| 5 | product-mount-matrix | no | N/A: only - one exact Plate full-DOM route replaces breadth | React mount commit remains a metric inside the exact packet. | large-and-stress after readiness |
| 6 | trusted-editing-matrix | no | N/A: only - one exact native typing/selection flow replaces breadth | Native typing remains a metric and correctness gate inside the exact packet. | large-and-stress after readiness |
| 7 | plite-vs-pinned-slate | no | N/A: only - no external substrate comparison requested | No sibling baseline will be opened. | large-and-stress after readiness |
| 8 | example-breadth | no | N/A: only - shallow mixed blocks are the accepted exact fixture | Rich/nested workload breadth was explicitly not selected. | large-and-stress after readiness |
| 9 | large-and-stress | yes | complete | Matched React and native 5k/10k artifacts, one 10k repeat, structural restoration, current-byte telemetry smoke, and Browser DOM proof are green. | Close without a product fix or architecture plan. |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: no cause proven
- lane: N/A: no cause proven
- comparable-baseline: N/A: no cause proven
- material-delta: N/A: no cause proven
- isolated-owner: N/A: no cause proven
- causal-intervention: N/A: no cause proven
- correctness-guard-result: N/A: no cause proven
- fix-class: N/A: no cause proven
- long-term-target: N/A: no cause proven
- decision-owner: N/A: no cause proven
- layer-plan: N/A: no cause proven
- compatibility-verdict: N/A: no cause proven
- fix-owner: N/A: no cause proven
- benchmark-command: N/A: no cause proven
- benchmark-rerun: N/A: no cause proven
- benchmark-rerun-result: N/A: no cause proven
- correctness-command: N/A: no cause proven
- correctness-rerun: N/A: no cause proven
- correctness-rerun-result: N/A: no cause proven
- resume-lane: N/A: no cause proven

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| none | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: first 77.0 ms p95 did not repeat above 75 ms | N/A: no pre-fix correctness state | N/A: no cause benchmark | N/A: no cause result | N/A: no cause correctness command | N/A: no cause post-fix state | Exact packet is green at the budget edge; no runtime/API plan justified. |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| 5k exact Plate | large-and-stress | same-source full-DOM baseline | React mount, native typing, DOM, heap, structural flow | green | keep | run 10k candidate |
| 10k exact Plate | large-and-stress | test the accepted 10k envelope | First native p95 77.0 ms; repeat 74.8 ms; mount/DOM/heap below 2.5x scaling red | green | keep; no cause | close exact packet |
| 10k current-byte telemetry smoke | large-and-stress | falsify dishonest mounted/pending telemetry after P1 review | 10,000 actual top-level blocks, 10,000 text nodes, zero pending, zero timeout | green | keep harness fix | P1 review and closeout |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| React mount commit | 10 measured per size | 4059.5 / not published / 5428.6 / omitted / 5428.6 ms | 7926.1 / not published / 10428.6 / omitted / 10428.6 ms | +3866.6 ms / 1.95x median; 1.92x max | same source/host; under 2.5x red | 5k/10k React artifacts |
| API input owner probe | 20 per size | 21.5 / not published / 25.1 / omitted / 25.1 ms | 44.1 / not published / 55.4 / omitted / 55.4 ms | +22.6 ms / 2.05x median; 2.21x p95 | proxy only, not native typing | 5k/10k React artifacts |
| Native type-to-paint, worst position | 5 packets per size | p50 not used / not published / 39.2 / omitted / 39.2 ms | first p95 77.0 ms; repeat p95 74.8 ms; p99 omitted | first ratio 1.96x; repeat falls below 75 ms gate | one nonrepeating boundary spike; no cause | 5k/10k native + repeat artifacts |
| Navigation to ready | 5 packets per size | p95/max 13,870.24 ms | p95/max 19,554.51 ms | +5684.27 ms / 1.41x | cold dev-host metric; separately labeled | 5k/10k native artifacts |
| Model ready | 5 packets per size | p95/max 75.7 ms | p95/max 113.1 ms | +37.4 ms / 1.49x | native packet owner metric | 5k/10k native artifacts |
| DOM tags | 5 packets per size | p95/max 22,275 | p95/max 42,275 | +20,000 / 1.90x | under 2.5x red | 5k/10k native artifacts |
| Retained heap | 5 packets per size | p95/max 272.75 MiB | p95/max 496.86 MiB | +224.11 MiB / 1.82x | under 2.5x red; machine-specific | 5k/10k native artifacts |
| 10k structural flow | 1 measured structural packet | N/A: correctness target is 10k | select-all 430.6; delete 1129.5; type 90.6; undo restore 8536.2 ms | N/A | restoration green; timing descriptive | 10k native artifact |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | Green with one nonrepeating 77.0 ms boundary sample; repeat p95 74.8 ms. |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-08-24-full-dom-10k-benchmark.md` | Run after this frozen plan update. |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | Complete; only large-and-stress applies. |
| Exact post-fix benchmark reruns | yes | Rerun every kept harness fix against its original lane/baseline | Exact 10k repeat and current-byte telemetry smoke are green. |
| Correctness/native behavior reruns | yes | Run named tests and Browser proof required by the claim | 20 tests pass; native structural restoration and Browser 10k DOM proof pass. |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | Source and artifact SHA-256 fingerprints below. |
| Benchmark target/metric honesty | yes | Verify fixture parity, sample math, aggregation, and artifact provenance | Actual DOM-derived mounted/pending counts replaced model-derived telemetry; p99 omitted from claims. |
| Durable fix decision | no | N/A: no product or architecture cause proved | No Plite Plan. |
| Package/type/build proof | yes | Run affected www typecheck | `pnpm --filter www typecheck` passed on the current bytes. |
| Browser surface proof | yes | Run Browser for the exact product route | Browser saw `full`/`full`, `plate-basic`, 10,000 top-level elements, and 10,000 text nodes. |
| Changeset/release artifact | no | N/A: benchmark harness/fixture proof only; no published package behavior change | N/A |
| Agent rule/skill sync | no | N/A: no agent source owned by this packet | N/A |
| Benchmark plan complete validation | yes | Run validator with `--complete` | Passed on the frozen plan bytes. |
| Final lint | yes | Run scoped equivalent | `pnpm exec ultracite check` passed for all five code files. |
| Timed checkpoint | no | N/A: no duration requested | N/A |
| P1 autoreview | no | Run dirty local P1 review and close accepted findings | The final allowed pass rejected this plan's `checkpoint_ready` overclaim. The three-invocation cap is exhausted; this packet does not claim review-clean or commit-safe status. |
| Goal plan complete | no | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-full-dom-10k-benchmark.md` | The mechanical checker passes, but the semantic P1 completion gate failed. The packet remains blocked. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | source fingerprints, fresh host, route HTTP 200, Chrome/machine identity, exact commands | large-and-stress |
| Ordered diagnosis | complete | exact-only large-and-stress packet and noise repeat complete | close without product cause |
| Fix and exact rerun | complete | fixture, scenario selection, focus, readiness, and telemetry harness repairs survived exact reruns | review |
| Remaining breadth | N/A: only | no additional lane applies to the accepted exact-only invocation | review |
| Review and closeout | blocked | benchmark and correctness proof is green, but the final allowed P1 pass rejected the plan's commit-safety claim | blocked checkpoint handoff |

Findings:
- The generic editor-perf runner already accepts 10k, `chunking=false` (`full`), visibility `none`, and mount/input commands; its checked-in exact no-chunk preset is only 5k.
- The registered native browser trace measures auto/staged/virtualized surfaces, not Plate `full`; exact native proof requires a narrow harness repair rather than a runtime plan.
- Existing browser trace infrastructure already records DOM, heap, native typing, selection, and select-all/delete/type/undo; reuse it instead of creating a second registry.
- The first 10k native packet touched 77.0 ms p95, but the exact repeat was 74.8 ms. The predeclared red condition did not repeat, so a product cause is not proven.
- Full-DOM cost is bluntly expensive: 10k navigation-to-ready reached 19.55 seconds and undo restoration reached 8.54 seconds on this exact dev-host machine. Those are real measurements, not proof of a regression or API defect.

Decisions and tradeoffs:
- Use a same-source 5k cohort as the scaling baseline because the accepted question is the 10k envelope, not current/main or Plate/Plite speed.
- Keep API insertion as a labeled owner probe only; native keyboard-to-paint is the primary editing metric.
- Treat mount, DOM, and heap as expected O(N) supporting metrics; do not pretend full DOM can have constant footprint.

Harness/methodology repairs:
- The generic runner cannot target one scenario, so an exact Plate packet currently runs unrelated scenarios first. Add a narrow `--scenario plate-basic` control before retrying; keep the default all-scenario behavior for existing presets and callers.
- The first calibration attempt disproved the original `Plate core minimal + huge-mixed-block` signature: current schema validation rejects the fixture's `h1` nodes because that scenario intentionally has no HeadingPlugin. Use `plate-basic`, the valid current huge-document Plate owner, instead of weakening schema validation or silently changing the fixture.
- Current Plate schema validation also proved the shared huge-document fixture stale: it emitted legacy `h1`/`p` nodes. Repair the fixture to `heading { level: 1 }`/`paragraph` and pin that contract with the focused workload test before accepting any timing.
- The first repaired 5k mount phase exceeded the original 300-second phase timeout. That timeout covers 3 warmups plus 10 measured full mounts, so it does not show a five-minute individual mount. Keep the sample contract, omit the nonessential prebuilt-mount phase, and raise the exact phase timeout to 900 seconds.
- A contaminated old dev host stalled the aggregate batch. A fresh current-source host completed the unchanged sample contract; do not attribute host contamination to product code.
- The native structural trace attempted select-all on a fresh page before focus. Explicitly focus the exact editor before the native shortcut.
- Native readiness timing originally began after editor readiness. Start it before navigation so `navigationToReadyMs` means what it says.
- P1 review rejected mounted/pending counts derived from the model length. For the Plate full surface, derive both from actual direct editor DOM children and fail readiness unless the real text-node count reaches the requested document size.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| `rg` parsed a leading `--preset` search pattern as a flag | 1 | Add `--` before the pattern. | Resolved; the focused runner-argument search succeeded. |
| `pnpm --filter www dev -- --hostname ...` passed the literal `--` to Next as a project directory | 1 | Run the generated-source host through `pnpm --filter www exec next dev --hostname ...`. | Resolved; current-source host is ready on port 3100. |
| First post-readiness Benchmark validator rejected three Comparison Signature evidence cells containing `pending` | 1 | Replace placeholders with exact source/plan artifact owners before measurement. | Resolved by source-backed artifact references. |
| Exact 5k calibration lost `window.__editorPerfHarness` after `prebuilt-mount` on three recovery attempts | 3 | Inspect the page crash instead of retrying the same command. | Root cause identified: the runner benchmarked every scenario; `plate-core` cannot mount `huge-mixed-block` because its schema has no heading owner. Exact scenario targeting is the harness repair. |
| Selected `plate-basic` still crashed on legacy `h1` after scenario targeting | 3 | Trace the current HeadingPlugin schema and shared fixture conversion. | Resolved in source: the fixture emits `heading { level: 1 }` and `paragraph`; its 20 focused workload tests pass. |
| Repaired 5k mount batch exceeded its 300-second phase timeout | 1 | Preserve 3+10 samples, remove nonessential prebuilt-mount, and raise only the exact phase timeout to 900 seconds. | Resolved on a fresh host; exact 5k and 10k artifacts completed. |
| Old dev host stalled the exact batch while unrelated generated-registry/typecheck work was active | 1 | Stop the contaminated host and use a fresh current-source port without changing the benchmark contract. | Resolved on port 3101. |
| Structural select-all page had no focused editor | 1 | Focus the exact editor before the native shortcut. | Resolved; delete/type/two-undo restoration passed at 10k. |
| P1 review found model-derived mounted/pending telemetry could claim full DOM without inspecting rendered DOM | 1 | Derive Plate full-surface counts from actual direct editor DOM children and text nodes. | Resolved; current-byte smoke and Browser both observed 10,000/10,000 with zero pending. |
| Final P1 review bundle was invalidated by unrelated concurrent repo writes | 1 | Freeze owned files and rerun the final allowed pass against their exact hashes. | The final pass rejected the plan's `checkpoint_ready` overclaim. No review-clean or packet commit-safety claim remains. |

Verification evidence:
- Source identity: commit `a525367f60000a33055e727db062ccc610880ea9`; runner `71a120d0...6fdbc`, route `6375ba05...3c758`, workload test `ab6eb3bd...d3fbe`, fixture `42ed3613...ec0b`, and native trace `8118deaa...16a` before this final plan-only evidence update.
- Host: current-source Next 16.3.2 at `http://127.0.0.1:3101`; current-byte telemetry and Browser proof repeated on port 3102.
- Browser/machine: Chrome for Testing 137.0.7151.55; macOS 26.3.1 arm64; Apple M5 Max; 128 GiB.
- React command pair: `pnpm --filter www perf:editor --url http://127.0.0.1:3101/dev/editor-perf --blocks <5000|10000> --chunking false --visibility none --scenario-workload huge-mixed-block --scenario plate-basic --benchmarks mount,input --timeout 900000 --out ../../.tmp/full-dom-<5k|10k>-react.json`.
- Artifact SHA-256: 5k React `8e7df200...36102`; 10k React `cf7d9f07...f364`; 5k native `101f3062...550af`; 10k native `f1ebcbfa...0f3f3`; 10k native repeat `8f871b55...481ff`; telemetry smoke `daca92f8...d7fcb9`.
- Current-byte proof: `pnpm --filter www typecheck` passed; focused Bun test passed 20/20 with 26 assertions; trace `node --check`, scoped Ultracite, and `git diff --check` passed.

Final handoff contract:
- goal plan / scope: exact current-source Plate basic, shallow mixed 5k/10k, full DOM, no content visibility.
- candidate / baseline identities: commit plus owned source/artifact hashes above; 5k and 10k share source, host, fixture, actions, and browser.
- completed / N/A / blocked lanes: large-and-stress complete; all other lanes explicit N/A under `only`; validator and mechanical goal checks pass, while the final P1 gate rejected packet commit safety.
- first conclusive cause: none.
- baseline / latest / best metrics: tables above; repeat 10k native p95 is 74.8 ms versus 39.2 ms at 5k.
- fix owner / changed files: benchmark harness/fixture only; six owned repo files listed in the stable checkpoint handoff.
- exact benchmark and correctness reruns: exact 10k repeat, 10k telemetry smoke, native structural restoration, and Browser actual-DOM proof green.
- resumed breadth: N/A: exact-only packet complete.
- packet decisions: keep the atomic harness/proof packet; do not start a runtime or public API change.
- harness/methodology repairs: selected scenario, current schema fixture, fresh host, explicit focus, honest navigation timing, actual-DOM telemetry.
- residual claim limits / next owner: exact machine/dev-host evidence only; no cross-machine, production-build, or broad editor-performance claim. No Plite Plan owner is justified without a repeatable red cause.
- commit authority boundary: this benchmark packet does not claim commit safety. Any checkout-wide commit uses the coordinator's separate user authorization and preserves this blocked result.

Timeline:
- 2026-08-24T12:08:50.059Z Benchmark goal plan created.
- 2026-08-24 Requirements, owner routing, source fingerprints, exact-only lane inventory, materiality rules, and output boundaries recorded before measurement.
- 2026-08-24 First 5k calibration failed identically three times. Browser logs proved an invalid `plate-core`/mixed-heading combination, so the packet moved to the valid `plate-basic` owner and selected-scenario harness repair before measurement.
- 2026-08-24 Selected-scenario rerun exposed legacy fixture node types, then the repaired 5k mount batch exceeded its original aggregate timeout. Fixture proof is green; exact timing rerun uses the same samples with a 900-second phase timeout.
- 2026-08-24 Matched 5k/10k React and native artifacts completed. Correctness, DOM, heap, and scaling guards stayed green. A first 77.0 ms 10k native p95 did not repeat above 75 ms.
- 2026-08-24 P1 review forced mounted/pending telemetry to inspect the actual Plate DOM. Current-byte trace and Browser proof observed 10,000 actual top-level elements, 10,000 text nodes, and zero pending.
- 2026-08-24 The final allowed P1 pass rejected the plan's `checkpoint_ready` overclaim. The code proof remains green, but the packet closes as blocked rather than claiming review-clean or commit-safe status.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Frozen atomic checkpoint closeout |
| Where am I going? | Blocked handoff; the reviewer cap is exhausted and no commit-safety claim remains |
| What is the goal? | Close the exact Plate full-DOM 10k packet with honest metrics and correctness proof. |
| What have I learned? | Exact Plate 10k full DOM is expensive but correct; the only budget crossing was one nonrepeating boundary sample, so no product cause is proven. |
| What have I done? | Repaired the narrow harness and fixture, emitted matched artifacts, repeated the noisy 10k lane, proved structural restoration and actual DOM counts, and froze the owned bytes. |

Open risks:
- The current editor-perf runner's React `mount` metric is commit duration, not navigation-to-interactive; cold full-DOM readiness must stay separately labeled.
- The metrics come from one Apple M5 Max dev-host environment. They do not establish production-build latency, cross-hardware budgets, or broad editor performance.
- The 10k native p95 sits on the 75 ms boundary. A future repeatable crossing may justify causal diagnosis; this packet does not.
