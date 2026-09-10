# Tiptap Lowlight huge code benchmark

Objective:
Benchmark Tiptap CodeBlockLowlight against the final huge-code matrix; produce
a matched 10k-line Chromium receipt with correctness, DOM, source-cost, and
comparison evidence.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-03-tiptap-lowlight-huge-code-benchmark.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: add Tiptap CodeBlockLowlight to the final Plate, ProseMirror,
  Wordgard, CodeMirror, and Lexical huge-code comparison
- scope: real `@tiptap/extension-code-block-lowlight` with Lowlight 3.3,
  10,000 JavaScript lines, mount, trusted midpoint edit, highlight/source work,
  canonical and DOM text, selection, tokens, DOM/model growth, and comparison
  against the already-frozen final receipts
- invocation: `$benchmark Tiptap CodeBlockLowlight huge code block`
- candidate-identity: commit: inspected Tiptap source
  `91c51be53c4655ef07e29ec489471524debfa0ca`; measured npm package 3.21.0,
  CodeBlockLowlight dist SHA-256
  `a27989b7657f5fc99b845175aa08a89d5a29b38c1248498f481a2e51f3b4b8f5`
- plate-main-identity: N/A: inapplicable - this is an external-editor
  comparison, not a current-versus-main Plate claim
- plite-identity: ref: final local Plate/Plite source and
  `production-code-block-phase3.json`
- slate-identity: N/A: inapplicable - Slate is not requested and Tiptap is a
  ProseMirror extension
- named-symptom: determine whether Tiptap plus real Lowlight preserves
  ProseMirror's huge-block advantage or collapses under whole-document syntax
  decoration work
- final-artifacts: artifact: docs/plans/artifacts/2026-09-03-tiptap-lowlight-huge-code-benchmark/tiptap-lowlight-10k.json plus exact repeat receipt and artifact-local runner

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

- requested duration: N/A: no duration requested
- semantics: N/A: no timed checkpoint
- start / deadline: N/A: no timed checkpoint
- final loop closure: finish the matched packet or report a measured cap with
  the failed contract named

Completion threshold:

- A real production Tiptap CodeBlockLowlight build completes one discarded
  warmup, five mounts, and twenty trusted five-character midpoint edits on the
  10,000-line by 48-character JavaScript fixture, or records a fixed timeout
  cap instead of fake percentiles.
- The receipt reports p50/p75/p95/max for mount, input-to-paint, and observed
  Lowlight source work; model/DOM text, selection, token count, DOM nodes,
  plugin identity, browser signature, and sample arrays are retained.
- Exact initial/final text, mounted syntax tokens, valid midpoint selection,
  and full non-virtualized DOM text are correctness vetoes.
- The final table includes Plate, Tiptap, ProseMirror, Wordgard, CodeMirror,
  and Lexical, with virtualized/proxy rows labeled rather than flattened into
  one dishonest ranking.
- Every applicable lane is complete or N/A with evidence.
- Benchmark plan validation passes with `--complete` and the Autogoal checker
  passes. No product fix or P1 autoreview is required unless runtime code is
  changed.

Verification surface:

- benchmark commands / artifacts: disposable Playwright runner plus final JSON
  receipt under the artifact directory above
- correctness commands: runner assertions for exact text, selection, real
  Lowlight calls, syntax token presence, full DOM coverage, and four trusted
  `abcde` edit bursts
- Browser / Chrome / device proof: Playwright 1.61.0 with Chromium
  149.0.7827.55, 1280x720, DPR 1; trusted keyboard input is required, while
  native profile/OS UI is N/A
- source/ref/fingerprint proof: exact Tiptap commit, package/build hashes,
  Lowlight version, runner hash, fixture hash, and baseline receipt hashes

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

- allowed runtime/packages/apps: read and build `../tiptap`; do not edit its
  source. In Plate, edit only this plan and its disposable benchmark artifacts
  unless a harness dependency requires a narrowly justified package manifest.
- allowed benchmark/tests/fixtures: existing huge-code runners/receipts and a
  Tiptap-specific disposable runner using their frozen fixture/action contract
- allowed baseline checkouts/hosts: local `../tiptap`, `../prosemirror`,
  `../wordgard`, and `../lexical`; installed CodeMirror packages; local
  Playwright Chromium
- non-goals: optimize Tiptap or Plate, change editor APIs, add virtualization,
  rerun unrelated editor breadth, commit, push, or publish

Output budget strategy:

- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:

- Stop only if the exact Tiptap extension cannot be built or loaded after three
  materially different harness moves, or trusted editing cannot preserve the
  correctness vetoes. A slow or capped result is evidence, not a blocker.

## Comparison Signature

| Field                                | Candidate                                                                                                          | Baseline                                                                                                                           | Comparable evidence                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ref / dirty fingerprint              | Inspected Tiptap `91c51be53c4655ef07e29ec489471524debfa0ca`; measured CodeBlockLowlight 3.21.0 dist `a27989b…b8f5` | Exact source/build hashes embedded in the Plate, ProseMirror, Wordgard, CodeMirror, and Lexical receipts                           | artifact: `tiptap-lowlight-10k.json` stores candidate, runner, fixture, and imported build hashes.                 |
| lockfile / package manager           | Disposable npm install with every Tiptap package pinned to 3.21.0 and Lowlight pinned to 3.3.0                     | Existing Plate pnpm 9.15.0 and pinned external builds from the final matrix                                                        | artifact: both full receipts store the exact resolved package versions.                                            |
| build mode / host / port             | Published production ESM bundled with Bun into an isolated in-memory page                                          | Production/import builds in existing final receipts                                                                                | artifact: runner plus receipts prove the isolated bundle and absence of route/network dependencies.                |
| browser / machine / viewport / DPR   | Playwright 1.61.0, Chromium 149.0.7827.55, macOS arm64; 1280x720, DPR 1                                            | Existing receipts used Playwright 1.61.0 on the same arm64 host; their Chromium build was not recorded                             | artifact: both full receipts store the candidate environment; the missing baseline browser build limits the claim. |
| route / fixture / document / plugins | One Tiptap `CodeBlockLowlight` JavaScript block; 10,000 lines × 48 chars; real Lowlight 3.3                        | Same text/code language; Plate uses real Lowlight; PM/WG/CM dense references use 40k decorations; Lexical uses its code-node model | artifact: comparison rows and snapshots retain real, synthetic, virtual, and proxy differences.                    |
| setup / action / DOM strategy        | Cold mount; native midpoint selection; four trusted `abcde` bursts; all Tiptap DOM remains mounted                 | Same five-character action for Plate/PM/WG/Lexical; CodeMirror's existing one-character virtual row stays labeled                  | artifact: arrays and snapshots prove exact model/DOM text and selection after every edit.                          |
| warmups / samples / interleave order | One discarded warmup; five mounts; twenty edits; retry-free                                                        | Same decisive Plate/PM/WG sample shape; raw Lexical has ten packets; CM has five mounts/twenty edits                               | artifact: config and arrays prove counts; no p99 is reported below 100 samples.                                    |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Tiptap CodeBlockLowlight, inclusion in the final table, and matched huge-code proof are explicit. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `benchmark` source and methodology read | yes | Skill and complete methodology were read before goal creation or measurement. |
| Active goal checked or created | yes | A fresh goal names this plan and the matched receipt/table threshold. |
| Candidate and baseline identities recorded | yes | Tiptap head/package and every existing final artifact owner are named above. |
| Target/runner discovery completed from current source | yes | Existing runners lack Tiptap; a disposable artifact-local runner will reuse their frozen fixture/action. |
| Host/build/fixture freshness proved | yes | Exact 3.21.0 Core, PM, CodeBlock, CodeBlockLowlight, and Lowlight 3.3 packages are pinned in a disposable install; production import and hashes pass. |
| Correctness oracle identified | yes | Exact text, selection, Lowlight call, token, full-DOM, and trusted-input assertions are required. |
| All default lanes inventoried | yes | All nine rows below are applicable or have concrete inapplicability reasons. |
| `only` narrowing explicitly authorized or N/A | no | N/A: normal scoped benchmark; no `only` invocation. |
| Browser/native proof strategy selected | yes | Chromium trusted keyboard input and next-paint timing; native OS UI is irrelevant. |
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
- [x] A proven cause pauses later lanes before another expensive benchmark;
      N/A because this comparison proved no product cause.
- [x] Every proven cause records its fix class, best long-term target, decision
      owner, layer plan, compatibility verdict, and implementation owner.
- [x] `public-api` and `runtime-architecture` causes run `best-api`, then
      `plite-plan`, `plate-plan`, or both before implementation. Broad accepted
      execution may use `auto`; target selection may not. N/A here because no
      architecture change was proposed or implemented.
- [x] One isolated owner is fixed, then the exact benchmark and correctness
      guard rerun before breadth resumes; N/A because no fix was in scope.
- [x] Failed reruns invalidate or continue the same cause; they do not skip to
      a different green metric; N/A because both exact repeats passed.
- [x] Green reruns resume the first pending applicable lane; N/A because no fix
      rerun occurred.
- [x] Every packet has keep/revert/invalidate/quarantine/defer and next-owner
      evidence.
- [x] Harness/metric/host defects are repaired before product optimization.
- [x] Final handoff reports candidate/baseline identities, lane status, first
      conclusive cause, metrics, fix/reruns, resumed breadth, and residual risk.

## Benchmark Lane Table

| Order | Lane                          | Applies | Status                                                                            | Evidence                                                                                                                                                                    | Next               |
| ----- | ----------------------------- | ------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 1     | source-and-host-readiness     | yes     | complete                                                                          | Tiptap source head, exact 3.21.0 production packages, dist hashes, import graph, Lowlight 3.3, and existing baseline receipts are resolved.                                 | none               |
| 2     | current-vs-main-product-smoke | no      | N/A: inapplicable - no Plate regression claim                                     | This adds an external comparison row without changing Plate.                                                                                                                | none               |
| 3     | plate-vs-plite-decomposition  | no      | N/A: inapplicable - no new Plate/Plite delta                                      | Existing final Plate/Plite receipts remain the candidate truth.                                                                                                             | none               |
| 4     | owner-microbench-and-trace    | yes     | complete                                                                          | `LowlightPlugin` synchronously scans every code block, highlights its full text, flattens every syntax leaf, and rebuilds `DecorationSet` on each in-block document change. | none               |
| 5     | product-mount-matrix          | yes     | complete                                                                          | Exact real-Lowlight run: Tiptap mount p95 117.1 ms; repeat p95 113.3 ms; exact text and 60,003 DOM nodes retained.                                                          | none               |
| 6     | trusted-editing-matrix        | yes     | complete                                                                          | Twenty native `abcde` bursts: p95 474.7 ms; repeat p95 451.7 ms; exact model/DOM text and midpoint selection pass after every burst.                                        | none               |
| 7     | plite-vs-pinned-slate         | no      | N/A: inapplicable - Tiptap is ProseMirror-based and Slate is outside the request  | Bare ProseMirror is the direct substrate control.                                                                                                                           | none               |
| 8     | example-breadth               | no      | N/A: inapplicable - package-level external comparison has no Plate example change | The isolated real extension is the requested product surface.                                                                                                               | none               |
| 9     | large-and-stress              | yes     | complete                                                                          | Both exact 10k-line packets completed uncapped with 490,019 final characters, 20,000 token elements, full DOM coverage, and passing correctness vetoes.                     | final verification |

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

| Cause ID | Lane                           | Decision                      | Fix Class         | Long-Term Target                  | Decision Owner          | Layer Plan         | Compatibility Verdict          | Fix Owner                    | Causal Evidence                                                       | Pre-Fix Correctness   | Benchmark Command     | Benchmark Result   | Correctness Command             | Post-Fix Correctness   | Evidence                                                                                       |
| -------- | ------------------------------ | ----------------------------- | ----------------- | --------------------------------- | ----------------------- | ------------------ | ------------------------------ | ---------------------------- | --------------------------------------------------------------------- | --------------------- | --------------------- | ------------------ | ------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| none     | N/A: comparison-only benchmark | N/A: no product fix requested | N/A: no fix class | N/A: no long-term target selected | N/A: no decision needed | N/A: no layer plan | N/A: no compatibility decision | N/A: no implementation owner | N/A: source attribution was descriptive without a causal intervention | N/A: no pre-fix state | N/A: no fix benchmark | N/A: no fix result | N/A: no fix correctness command | N/A: no post-fix state | Real package source, source-time probes, and two exact packets support comparison claims only. |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| TIPTAP-001 | product-mount-matrix, trusted-editing-matrix, large-and-stress | Real CodeBlockLowlight may preserve bare ProseMirror's huge-block performance despite real syntax work. | Tiptap mount p95 117.1 ms and input p95 474.7 ms; Plate 135.6/214.0 ms immediate and 522.3 ms highlighted settle. | pass: exact model text, exact DOM text, full DOM, midpoint selection, and 20,000 token elements | keep comparison receipt; reject any claim that Tiptap is an editing-performance solution | `benchmark` owns any future matched rerun; architecture remains with `plite-plan`/`plate-plan`. |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| Real Lowlight mount: Plate -> Tiptap | 5 vs 5 | 130.8 / 134.2 / 135.6 / N/A / 135.6 ms | 113.3 / 114.1 / 117.1 / N/A / 117.1 ms | -18.5 ms / -13.6% at p95 | Repeat Tiptap p95 113.3 ms; the mount result reproduces. | `production-code-block-phase3.json`; `tiptap-lowlight-10k.json`; repeat |
| Immediate trusted `abcde`: Plate -> Tiptap | 20 vs 20 | 183.0 / 205.9 / 214.0 / N/A / 215.3 ms | 442.2 / 456.3 / 474.7 / N/A / 485.9 ms | +260.7 ms / +121.8% at p95 | Repeat Tiptap p95 451.7 ms; every burst passes correctness. | same artifacts |
| Fully highlighted `abcde`: Plate -> Tiptap | 20 vs 20 | 490.7 / 514.2 / 522.3 / N/A / 523.5 ms | 442.2 / 456.3 / 474.7 / N/A / 485.9 ms | -47.6 ms / -9.1% at p95 | Repeat Tiptap p95 451.7 ms, -13.5%; modest total-settle win, awful immediate response. | same artifacts |
| Lowlight source work per `abcde`: Plate -> Tiptap | 20 vs 20 | 62.1 / 63.9 / 64.6 / N/A / 65.7 ms | 193.8 / 196.8 / 200.8 / N/A / 202.4 ms | +136.2 ms / +210.8% at p95 | Tiptap makes exactly five full-block calls per burst; repeat source p95 196.9 ms. | same artifacts |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | Two exact 10k packets and the smoke completed with all correctness vetoes true. |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-09-03-tiptap-lowlight-huge-code-benchmark.md` at cause/resume checkpoints | Structural validation passed before execution; final validation is listed below. |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | All nine lane rows are complete or concretely inapplicable. |
| Exact post-fix benchmark reruns | no | N/A: no fix was made | Two exact comparison packets were still retained for noise evidence. |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | Real Playwright trusted input passed exact text, selection, full DOM, and token assertions twice. |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | Both receipts record identical candidate build, fixture, runner, baseline, package, browser, and host identities. |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | p99 is omitted below 100 samples; virtual, synthetic, line-shaped, synchronous, and deferred contracts stay labeled. |
| Durable fix decision | no | N/A: comparison only | No product cause or fix was selected. |
| Package/type/build proof | no | N/A: no package source changed | Production package imports and browser bundling are exercised by the runner. |
| Browser surface proof | yes | Use isolated Chromium because no product route changed | Playwright 1.61.0 / Chromium 149.0.7827.55 trusted-input packets passed. |
| Changeset/release artifact | no | N/A: no published package behavior changed | Only plan and benchmark artifacts were added. |
| Agent rule/skill sync | no | N/A: no agent source changed | No install or mirror regeneration applies. |
| Benchmark plan complete validation | yes | Run validator with `--complete` | Final command listed under Verification evidence. |
| Final lint | yes | Run scoped Prettier and syntax checks | Final commands listed under Verification evidence. |
| Timed checkpoint | no | N/A: no duration requested | Packet closed by its explicit completion threshold. |
| P1 autoreview | no | N/A: artifact-local runner and plan only; no runtime or skill code changed | Autoreview is also prohibited on `next`. |
| Goal plan complete | yes | Run the Autogoal completion checker | Final command listed under Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | Exact sources, versions, hashes, fixtures, actions, and claim limits recorded. | none |
| Ordered diagnosis | complete | All applicable lanes executed in order; source owner traced before browser measurement. | none |
| Fix and exact rerun | N/A: no fix | No product cause or implementation was in scope; exact comparison repeat retained for noise. | none |
| Remaining breadth | complete | Plate, Tiptap, ProseMirror, Wordgard, CodeMirror, and Lexical rows reconciled. | none |
| Review and closeout | complete | Scoped formatting, syntax, artifact, benchmark-contract, plan, and goal validators run. | final response |

Findings:

- Tiptap CodeBlockLowlight 3.21.0 extends the normal ProseMirror code block and
  adds one `LowlightPlugin`.
- On every document change whose old or new selection is inside a code block,
  the plugin calls Lowlight on the block's entire `textContent`, flattens the
  syntax tree, recreates all inline decorations, and builds a new
  `DecorationSet` synchronously inside plugin-state `apply`.
- This architecture preserves ProseMirror's one-text document model but does
  not incrementally parse or map unchanged syntax ranges.
- The exact real-Lowlight Tiptap DOM matches Plate: one model text leaf,
  20,000 highlighted elements, 40,000 DOM text nodes, 60,003 total DOM nodes,
  and 100% text coverage.
- A five-character browser burst creates five Tiptap transactions and exactly
  five whole-block Lowlight calls. Plate coalesces the same burst into one
  deferred Lowlight call.
- Tiptap's canonical p95 is 117.1 ms mount, 474.7 ms input-to-highlighted-paint,
  and 200.8 ms inside Lowlight. The exact repeat is 113.3, 451.7, and 196.9 ms.
- Plate's p95 is 135.6 ms mount, 214.0 ms input paint, and 522.3 ms fully
  highlighted settle. Tiptap finishes all work 9-14% sooner in these packets,
  but blocks the edit path more than twice as long before first paint.

Decisions and tradeoffs:

- Measure the exact published 3.21.0 production package, not a source rewrite.
  The local 91c51be source supplies ownership evidence; dist hashes supply
  measured identity.
- Keep CodeMirror labeled virtual and Lexical labeled as a code-model proxy.
  Neither can become an unqualified full-DOM Lowlight winner.
- Do not adopt Tiptap's Lowlight plugin as the target architecture. Its bare
  ProseMirror substrate is healthy; its full synchronous re-highlight on every
  character is the wrong behavior for huge code.
- Retain Plate's one-Text/full-DOM direction and async coalescing. The next
  performance target remains incremental syntax work and cheaper decorated DOM,
  not structural code-line nodes or hidden virtualization in the normal lane.

Harness/methodology repairs:

- Pinned all Tiptap peers to 3.21.0 after npm's broad peer range mixed 3.21.0
  and 3.31.1.
- Replaced an unavailable `esbuild` call with the repo's established Bun
  browser bundler and used Lowlight's public entrypoint for the `all` registry.
- Kept an exact repeat after the first valid packet; the repeat exposed high
  runtime variance instead of letting one favorable p95 decide the ranking.
- Corrected `runnerSha256` to hash the file bytes directly instead of reusing
  the path-aware multi-file build hash helper.
- Matched Plate's discarded warmup shape with all four trusted edit bursts,
  rather than warming only the first burst.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| npm resolved CodeBlockLowlight's broad `^3.21.0` peer to CodeBlock 3.31.1, conflicting with Core 3.21.0 | 1 | Pin `@tiptap/extension-code-block` and `@tiptap/pm` to 3.21.0 explicitly | exact 3.21.0 dependency set installed; production import passes |
| Smoke bundling called unavailable `pnpm exec esbuild`; a direct Bun probe then exposed that `all` is exported by Lowlight's public entrypoint, not `lib/index.js` | 1 | Use the repo's established Bun browser bundler and import `lowlight/index.js` | smoke and both full packets pass |
| First complete-plan validation required machine-readable `artifact:` prefixes on final-artifacts and every Comparison Signature evidence cell | 1 | Preserve the evidence and add the required prefixes | final complete validation passes |
| Closeout found `runnerSha256` used a path-aware multi-file hash helper | 1 | Add a byte-only single-file SHA-256 helper and regenerate both final receipts | receipt hash matches `shasum -a 256` |

Verification evidence:

- `TIPTAP_BENCH_LINES=200 TIPTAP_BENCH_ITERATIONS=1 TIPTAP_BENCH_TYPE_OPS=1 ... tiptap-lowlight-browser.mjs`: pass; exact text, selection, full DOM, and syntax tokens.
- `node .../tiptap-lowlight-browser.mjs`: pass; canonical 10k receipt p95
  117.1 ms mount / 474.7 ms edit / 200.8 ms Lowlight source.
- Exact repeat with `TIPTAP_BENCH_ARTIFACT=.../tiptap-lowlight-10k-repeat.json`:
  pass; p95 113.3 / 451.7 / 196.9 ms and identical correctness/source hashes.
- `node --test .agents/skills/benchmark/scripts/benchmark-contract.test.mjs`:
  final pass recorded after plan closure.
- `node --check .../tiptap-lowlight-browser.mjs`, `jq empty` on all new JSON,
  scoped Prettier, benchmark `--complete`, and Autogoal completion checks:
  final passes recorded after plan closure.

Final handoff contract:

- goal plan / scope: this file; real Tiptap CodeBlockLowlight on the frozen 10k
  huge-code contract plus the six-editor final table
- candidate / baseline identities: Tiptap source 91c51be, exact 3.21.0 published
  packages, Lowlight 3.3.0, and frozen artifact hashes recorded in both receipts
- completed / N/A / pending lanes: five applicable lanes complete; four lanes
  concretely inapplicable; zero pending
- first conclusive cause: none; this was comparison, not a causal fix loop
- baseline / latest / best metrics: Plate 135.6/214.0/522.3 ms versus Tiptap
  canonical 117.1/474.7/474.7 ms; exact Tiptap repeat 113.3/451.7/451.7 ms
- fix owner / changed files: no product fix; this plan, one runner, one smoke
  receipt, and two full receipts only
- exact benchmark and correctness reruns: two full packets pass every veto with
  identical build, fixture, runner, baseline, browser, and host signatures
- resumed breadth: final comparison rows reconciled after Tiptap measurement
- packet decisions: keep TIPTAP-001 as comparison evidence; reject Tiptap
  Lowlight as a performance architecture
- harness/methodology repairs: peer pins, public Lowlight import, Bun bundling,
  explicit DPR/environment metadata, and repeat noise receipt
- residual claim limits / next owner: PM/WG are synthetic decoration stress,
  CodeMirror is virtual, Lexical is a line-model proxy, and old receipts omit
  the exact Chromium build; `benchmark` owns any refreshed matched matrix

Timeline:

- 2026-09-03T10:09:26.961Z Benchmark goal plan created.
- 2026-09-03: inspected Tiptap 91c51be and found full-block synchronous Lowlight decoration rebuilds on edits inside code blocks.
- 2026-09-03: first disposable npm install exposed broad-peer drift to CodeBlock 3.31.1; exact 3.21.0 peer pins are required.
- 2026-09-03: pinned every Tiptap package to 3.21.0 and Lowlight to 3.3.0; production import and SHA-256 identity checks pass.
- 2026-09-03: smoke passed after replacing unavailable esbuild plumbing and correcting the Lowlight public import.
- 2026-09-03: final canonical and repeat 10k packets passed; Tiptap p95 input-to-highlighted-paint was 474.7 ms and 451.7 ms.
- 2026-09-03: all final comparison rows, correctness receipts, claim limits, and validation gates closed.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | The matched Tiptap packet, exact repeat, final comparison, and validation are complete. |
| Where am I going? | Return the honest six-editor table and architecture verdict. |
| What is the goal? | Add a real Tiptap CodeBlockLowlight row to the final huge-code table without hiding contract differences. |
| What have I learned? | Tiptap's one-text model mounts well, but five synchronous full-block highlights make a five-character burst take 452-475 ms p95. |
| What have I done? | Measured the exact published extension twice, proved correctness and DOM shape, reconciled all six rows, and closed every lane. |

Open risks:

- Only Plate and Tiptap use real Lowlight with the same 20,000-token/60,003-DOM-node result. ProseMirror and Wordgard use synthetic 40,000-decoration stress.
- CodeMirror renders only 0.55-0.81% of document text and uses one-character edits; its 16.1 ms result is a virtualized product contract, not a normal-lane comparison.
- Lexical is a 20,000-node line-model proxy without a matched real-Lowlight lane.
- Candidate packets share exact Chromium 149 and host metadata. Older baseline receipts record Playwright 1.61 and arm64, but not their Chromium build.
- Tiptap's two final p95 values are 451.7 and 474.7 ms. Both beat Plate's old
  522.3 ms settle receipt, but the missing baseline Chromium build and
  separate-run noise make the 9-14% total-settle margin descriptive, not law.
