# wordgard huge code block benchmark

Objective:
Add Wordgard to the huge-code-block evidence and trace bounded DOM projection
prior art; done when comparable results, source owners, and plan checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-02-wordgard-huge-code-block-benchmark.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: Benchmark the existing 100/1,000/5,000/10,000-line code-block
  workload against `../wordgard`, then explain the source technique behind one
  canonical Text projected into bounded DOM strings and identify real prior
  art.
- scope: Extend the existing matched Chromium probe with Wordgard without
  changing its text fixture, middle-line caret, five-character trusted input,
  warmup/sample count, metrics, or correctness guard. Audit only the text-model
  and DOM-position mechanisms needed to answer the technique question.
- invocation: `$benchmark wordgard huge-code-block`; Editor Audit supplies a
  narrow source-level mechanism comparison only.
- candidate-identity: fingerprint: Wordgard commit
  `b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54`, package 0.5.1, measured dist
  SHA-256 `3d9be7a8...0b8d0f4d`, and harness SHA-256
  `f2042bb6...251043ff`.
- plate-main-identity: N/A: this is not a current-versus-main product
  regression claim.
- plite-identity: commit: `a6afd55c30e97c74fe895d1ad005ca75413110f3`;
  measured `plitejs/react` dist SHA-256 `723dba65...f9960ff`.
- slate-identity: fingerprint: Slate 0.124.1 dist SHA-256 `fae3731d...582fec9` and
  Slate React 0.124.2 dist SHA-256 `57557790...5a7478b`; rerun in the same
  packet as Wordgard.
- named-symptom: huge single code blocks create excessive model/DOM work and
  slow cold mount plus trusted middle-line typing.
- final-artifacts: artifact: `docs/plans/artifacts/2026-09-02-remove-code-line-model/huge-code-block-probe.json`
  SHA-256 `6e296985...a6b19b76`; artifact:
  `docs/plans/artifacts/2026-09-02-remove-code-line-model/wordgard-stability.json`
  SHA-256 `ee2ef384...1c946ab`; benchmark script, this run plan, and the amended
  CodeLine architecture plan.

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
- semantics: finish the complete narrow comparison and source answer.
- start / deadline: 2026-09-02 / no deadline.
- final loop closure: close after Wordgard is comparable or explicitly proven
  incomparable, technique provenance is source-backed, and both validators
  pass.

Completion threshold:

- Wordgard runs with the same 48-character lines, four cohorts, one discarded
  warmup, ten measured samples, Chromium/machine, real middle-line input, exact
  post-text guard, and p50/p75/p95/max plus heap/model/DOM counters as the
  existing receipt; any unavoidable semantic difference is called out.
- Technique provenance cites exact owners in Wordgard, Plite, and at least two
  reference editors, distinguishing exact render-only segmentation from ropes,
  leaf splitting, line models, and viewport virtualization.
- Every applicable lane is complete or N/A with evidence.
- No product fix is in scope; any harness extension passes its exact rerun and
  content guard.
- Benchmark plan validation passes with `--complete`, P1 autoreview passes when
  code changed, and the Autogoal checker passes.

Verification surface:

- benchmark commands / artifacts: extended
  `docs/plans/artifacts/2026-09-02-remove-code-line-model/huge-code-block-probe.mjs`
  and canonical JSON receipt.
- correctness commands: probe exact text, inserted character count,
  middle-line selection target, and mounted editable surface guards.
- Browser / Chrome / device proof: headless Chromium trusted-input harness;
  broader native behavior remains an implementation gate in the parent plan,
  not a claim from this reference extension.
- source/ref/fingerprint proof: full commits for `../wordgard`,
  `../prosemirror`, `../lexical`; package versions for Slate; SHA-256 for
  measured runtime/harness inputs when local state is not described by HEAD.

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

- allowed runtime/packages/apps: read Wordgard and local reference source;
  change only benchmark/run-plan artifacts and the evidence section of the
  existing CodeLine architecture plan.
- allowed benchmark/tests/fixtures: the existing huge-code-block probe and its
  canonical receipt; a minimal Wordgard adapter inside that probe.
- allowed baseline checkouts/hosts: `../wordgard`, `../prosemirror`,
  `../lexical`, current Plate/Plite checkout, installed Slate packages, and
  local Chromium. No pulls, branch switches, commits, or remote mutation.
- non-goals: Wordgard product ranking, full editor audit, product-source
  implementation, public API change, release claim, or broad native-behavior
  certification.

Output budget strategy:

- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:

- Stop only if Wordgard has no runnable editable code/text surface and no
  source-backed adapter can preserve the same document/action semantics after
  three materially different attempts. Report it as incomparable rather than
  manufacturing a misleading number.

## Comparison Signature

| Field                                | Candidate                                                                                    | Baseline                                                                                                                           | Comparable evidence                                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| ref / dirty fingerprint              | Wordgard `b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54`, 0.5.1, dist `3d9be7a8...0b8d0f4d`       | Plate/Plite `a6afd55c30e97c74fe895d1ad005ca75413110f3`, Plite React dist `723dba65...f9960ff`; peer identities embedded in receipt | artifact: canonical receipt `sourceIdentities` plus harness `f2042bb6...251043ff`                                     |
| lockfile / package manager           | Wordgard `package-lock.json`; npm 10.9.4 build                                               | Plate `pnpm-lock.yaml`; pnpm 9.15.0 Plite build; Bun 1.3.12 orchestrator                                                           | artifact: both builds ran inside every probe invocation before one browser bundle                                     |
| build mode / host / port             | fresh `npm run prepare`, bundled browser ESM, in-memory page                                 | fresh `bun --filter plitejs build`, same browser bundle/page                                                                       | artifact: probe script and successful full command; no server or port involved                                        |
| browser / machine / viewport / DPR   | Chromium 149.0.7827.55; macOS 26.3.1 arm64, Apple M5 Max; 1280x720/DPR 1                     | identical                                                                                                                          | artifact: local browser/environment probe plus receipt platform/Playwright 1.61.0 fields                              |
| route / fixture / document / plugins | Wordgard Doc + CodeBlock + LineBreak; one 48-character-per-line `<pre>`                      | one Plite code block with CodeLine/Text pairs; same exact fixture text                                                             | artifact: maximum-cohort fixture SHA-256 `ae3aac39...1952102f` in canonical receipt and source adapter                |
| setup / action / DOM strategy        | normal Wordgard full DOM; select midpoint and type `XXXXX` through Playwright keyboard       | normal Plite full DOM; identical selection target and trusted input                                                                | artifact: exact-text assertion, line count, text length, model count, and DOM count pass in every sample              |
| warmups / samples / interleave order | 1 discarded warmup + 10 samples at 100/1k/5k/10k; separate 20-sample 5k/10k stability packet | same warmup + 10 samples in fixed per-cohort order                                                                                 | artifact: canonical and stability receipts preserve every sample; p99 omitted because sample counts do not support it |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Wordgard comparison, technique origin, and prior-art question are copied above. |
| Timed checkpoint parsed | N/A | No duration was requested. |
| `benchmark` source and methodology read | yes | Skill and full methodology read before measurement. |
| Active goal checked or created | yes | Goal created for this exact plan path before source exploration. |
| Candidate and baseline identities recorded | yes | Exact commits, versions, and measured-build hashes are above and embedded in the receipt. |
| Target/runner discovery completed from current source | yes | Existing huge-code-block probe was the sole runner; Wordgard exposes the required editable CodeBlock through its package root. |
| Host/build/fixture freshness proved | yes | The probe rebuilt Plite and Wordgard, bundled once, and used one Chromium page for the matched packet. |
| Correctness oracle identified | yes | Select the computed middle offset, type five real characters, then require byte-exact full text, line count, and inserted length. |
| All default lanes inventoried | yes | Complete table below; product lanes are N/A only where this reference probe cannot answer them. |
| `only` narrowing explicitly authorized or N/A | N/A | User requested one added baseline inside a named architecture probe, not `$benchmark only`; genuinely irrelevant product lanes are marked inapplicable. |
| Browser/native proof strategy selected | yes | Trusted Chromium input plus exact text/caret guard; no broader native claim. |
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

| Order | Lane                          | Applies | Status                                                                 | Evidence                                                                                                                                      | Next                   |
| ----- | ----------------------------- | ------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1     | source-and-host-readiness     | yes     | complete                                                               | Commits, measured-build hashes, build commands, browser/machine identity, fixture SHA, action, sample policy, and exact oracle are resolved.  | Lane 4                 |
| 2     | current-vs-main-product-smoke | no      | N/A: inapplicable - no product regression claim                        | No current/main product change or regression is claimed.                                                                                      | Lane 4 after readiness |
| 3     | plate-vs-plite-decomposition  | no      | N/A: inapplicable - parent packet already isolates the layers          | The parent receipt contains current Plite CodeLines and private Plite targets; this follow-up adds a reference editor.                        | Lane 4 after readiness |
| 4     | owner-microbench-and-trace    | yes     | complete                                                               | Added the Wordgard adapter, exact model/DOM counters, build fingerprints, and source trace of its CodeBlock parser, TextTile, and offset map. | Lane 6                 |
| 5     | product-mount-matrix          | no      | N/A: inapplicable - no product route or composition claim              | Cold mount remains measured inside the owner probe.                                                                                           | Lane 6                 |
| 6     | trusted-editing-matrix        | yes     | complete                                                               | All seven surfaces passed real middle-line `XXXXX` input and the byte-exact post-text assertion for every sample.                             | Lane 7                 |
| 7     | plite-vs-pinned-slate         | yes     | complete                                                               | Slate 0.124.1/React 0.124.2 reran inside the same seven-surface packet.                                                                       | Lane 9                 |
| 8     | example-breadth               | no      | N/A: inapplicable - one code-block representation is the named fixture | Feature breadth cannot answer this model/DOM representation question.                                                                         | Lane 9                 |
| 9     | large-and-stress              | yes     | complete                                                               | Canonical 100/1k/5k/10k packet completed; Wordgard 5k/10k received a separate 20-sample stability packet after noisy ordering.                | Closeout               |

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
- benchmark-rerun-result: N/A: no product cause proven
- correctness-command: N/A: no cause proven
- correctness-rerun: N/A: no cause proven
- correctness-rerun-result: N/A: no product cause proven
- resume-lane: N/A: no cause proven

## Cause History

| Cause ID | Lane                 | Decision             | Fix Class            | Long-Term Target     | Decision Owner       | Layer Plan           | Compatibility Verdict | Fix Owner            | Causal Evidence      | Pre-Fix Correctness               | Benchmark Command       | Benchmark Result     | Correctness Command               | Post-Fix Correctness         | Evidence                                                                                                                    |
| -------- | -------------------- | -------------------- | -------------------- | -------------------- | -------------------- | -------------------- | --------------------- | -------------------- | -------------------- | --------------------------------- | ----------------------- | -------------------- | --------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| none     | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven  | N/A: no cause proven | N/A: no cause proven | N/A: no pre-fix correctness state | N/A: no cause benchmark | N/A: no cause result | N/A: no cause correctness command | N/A: no cause post-fix state | This packet is comparative evidence, not a product intervention; the accepted parent plan remains the implementation owner. |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| Wordgard adapter smoke | source-and-host-readiness | Wordgard can preserve the exact code-block text/action contract | 100-line exact-text probe | green | keep adapter | full packet |
| Seven-surface packet | owner-microbench-and-trace | Wordgard provides a valid line-shaped reference | 100/1k/5k/10k mount, typing, model, DOM, heap, long tasks | green | keep receipt | repeat noisy Wordgard stress rows |
| Wordgard stability | large-and-stress | Canonical 5k/10k ordering understated run-to-run noise | 20 measured samples per stress cohort | green | keep as noise evidence; do not replace matched packet | source audit |
| Bounded-projection source trace | owner-microbench-and-trace | Identify exact and partial prior art | CodeMirror exact; Slate partial; Wordgard/ProseMirror/Lexical negative classifications | source-backed | keep | closeout |
| Product implementation | N/A | This follow-up does not authorize product changes | N/A | N/A | defer to accepted parent plan | Plite projection owner |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| 5k mount-to-paint, Wordgard vs current Plite CodeLines | 10 measured each | 885.7 / 1073.2 / 1255.9 / omitted / 1255.9 ms | 62.4 / 63.7 / 101.4 / omitted / 101.4 ms | median -823.3 ms / 0.07x; p95 -1154.5 ms / 0.08x | Matched packet; candidate p95 has one spike | canonical receipt |
| 5k trusted type-to-paint, Wordgard vs current Plite CodeLines | 10 measured each | 212.6 / 251.1 / 260.6 / omitted / 260.6 ms | 122.3 / 123.4 / 140.3 / omitted / 140.3 ms | median -90.3 ms / 0.58x; p95 -120.3 ms / 0.54x | Exact text green; p99 omitted | canonical receipt |
| 10k mount-to-paint, Wordgard vs current Plite CodeLines | 10 measured each | 1294.2 / 1543.9 / 1789.5 / omitted / 1789.5 ms | 56.1 / 56.6 / 57.5 / omitted / 57.5 ms | median -1238.1 ms / 0.04x; p95 -1732.0 ms / 0.03x | Matched result is unusually low; Wordgard-only 20-sample repeat is 80.0 / 87.9 / 90.3 / omitted / 94.5 ms | canonical + stability receipts |
| 10k trusted type-to-paint, Wordgard vs current Plite CodeLines | 10 measured each | 284.1 / 339.0 / 438.7 / omitted / 438.7 ms | 99.2 / 99.3 / 124.3 / omitted / 124.3 ms | median -184.9 ms / 0.35x; p95 -314.4 ms / 0.28x | Wordgard-only repeat is 156.9 / 173.3 / 181.7 / omitted / 190.0 ms; still decisively below current Plite p95 | canonical + stability receipts |
| 5k trusted type-to-paint, private chunks vs Wordgard | 10 measured each | Wordgard 122.3 / 123.4 / 140.3 / omitted / 140.3 ms | private chunks 166.9 / 182.3 / 199.2 / omitted / 199.2 ms | target median +44.6 ms / 1.36x; p95 +58.9 ms / 1.42x | Private chunks win mount/footprint, not editing | canonical receipt |
| 10k structure, current / Wordgard / private chunks | 10 measured each | current: 20,001 model / 50,004 total DOM | Wordgard: 20,000 / 20,006; private chunks: 2 / 476 | Wordgard retains model O(lines); private target removes 99% of DOM and effectively all repeated model nodes | Deterministic counters; stronger than process-wide heap | canonical receipt |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | Canonical 10-sample seven-surface packet plus 20-sample Wordgard stability packet passed. |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-09-02-wordgard-huge-code-block-benchmark.md` | Passed on the measured plan before final closeout. |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | Complete; all nine lanes are resolved above. |
| Exact post-fix benchmark reruns | yes | Rerun every kept harness fix against its original lane/baseline | Shared-package import repair passed smoke and full packets; DOM count repair passed full and stability packets. |
| Correctness/native behavior reruns | yes | Run named trusted-input proof required by the claim | Every measured sample passed middle-line selection and byte-exact text; broader native behavior is explicitly not claimed. |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | Commits and measured build/harness hashes are embedded in both receipts. |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | Added text-node and total-node counters; all DOM claims use total descendants; p99 is omitted. |
| Durable fix decision | no | N/A: no new product cause or fix in this follow-up | Parent Plite/Plate plan remains the implementation owner. |
| Package/type/build proof | yes | Run affected package builds only where owned | Every probe invocation passed fresh `bun --filter plitejs build` and Wordgard `npm run prepare`. |
| Browser surface proof | no | N/A: no product route or UI source changed | The benchmark itself ran in headless Chromium with trusted input; no app-facing behavior claim is made. |
| Changeset/release artifact | no | N/A: benchmark and plan artifacts only | No published behavior or API changed. |
| Agent rule/skill sync | no | N/A: no agent source changed | No sync required. |
| Benchmark plan complete validation | yes | Run validator with `--complete` | Passed on the frozen completed plan. |
| Final lint | yes | Run scoped equivalent | `node --check`, Prettier check on the script and both plans, and scoped `git diff --check` passed. |
| Timed checkpoint | no | N/A: no duration requested | N/A |
| P1 autoreview | no | N/A: repo instructions forbid `autoreview` on `next` | Exact executable reruns and scoped static checks cover this benchmark-only change. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-02-wordgard-huge-code-block-benchmark.md` | Passed on the final plan bytes. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | requirements, identities, fixture/action parity, lane inventory | owner probe |
| Ordered diagnosis | complete | seven-surface packet and source trace | harness repair/repeat |
| Fix and exact rerun | complete | shared-module import and honest DOM counters survived exact reruns | remaining breadth |
| Remaining breadth | complete | Slate rerun, all cohorts, and Wordgard stability packet complete | final verification |
| Review and closeout | complete | exact receipts, scoped static checks, Benchmark `--complete`, and Autogoal checks pass | final response |

Findings:

- Wordgard's CodeBlock admits Text and LineBreak leaves. Its whitespace parser
  splits newline text into LineBreak nodes, producing roughly two model nodes
  and two DOM descendants per source line in this fixture.
- Wordgard is dramatically faster than current Plite CodeLines despite nearly
  identical model-node growth. At 10,000 lines it has 20,000 model nodes and
  20,006 total DOM descendants versus current Plite's 20,001 and 50,004.
  The current Plate/React rendering stack, not line count alone, owns much of
  the observed tax.
- Wordgard's `TextTile` wraps one string and one DOM Text, but `addText` merges
  adjacent text without a length cap. Its cached `TextblockMap` flattens a
  block and maps document positions to string offsets. Useful machinery, but
  not the proposed bounded render-only projection.
- CodeMirror 6 is the exact prior art. `buildtile.ts` fixes `Chunk = 512`,
  reads at most 512 characters per span step, emits `TextTile`s, and maps
  document positions to tile-local DOM offsets. Its viewport virtualization is
  separate and is not part of the proposed Plite contract.
- Slate is partial prior art. One logical Text can become several decorated
  leaves, and `DOMEditor.toDOMPoint` walks rendered string spans while
  accumulating their true lengths. Slate does not fixed-size chunk undecorated
  plain text.
- ProseMirror uses one TextViewDesc/DOM Text for undecorated plain text.
  Lexical's tested code block and Wordgard use model segmentation. Neither is
  the bounded render-only technique.
- The private Plite target still wins cold mount and structure: at 10,000
  lines, 2 model nodes and 476 total DOM descendants. It loses trusted editing
  to Wordgard and ProseMirror in this packet. Calling it “best performance”
  would be bullshit; it is the cleaner scalable target with an unresolved
  input-path tax.

Decisions and tradeoffs:

- Keep the CodeLine hard cut. Wordgard weakens the claim that line-shaped
  models are intrinsically slow; it does not give Plate's public/persisted
  CodeLine an independent document job.
- Name the technique **bounded render-only text tiling**. Keep one canonical
  model Text, split only the rendered DOM strings, and translate between model
  offsets and tile-local DOM offsets.
- Borrow CodeMirror's bounded TextTile idea and Slate's model-to-many-rendered
  strings mapping. Do not copy CodeMirror virtualization or Wordgard's line
  model into Plite.
- Do not market the prototype's typing result as solved. Production work must
  profile and close the remaining Plite input/DOM-repair cost while preserving
  the parent plan's native behavior gates.

Harness/methodology repairs:

- Import Wordgard once through its package root. Separate absolute imports
  instantiated duplicate `wordgard/state` modules and broke extension identity.
- Count DOM element descendants, text descendants, and all descendants. The old
  `domNodes` field counted elements only; the frozen budget and all new claims
  use `domTotalNodes`.
- Fingerprint the harness and every measured build. Commit IDs alone do not
  identify rebuilt or locally modified dist bytes.
- Repeat Wordgard's 5k/10k rows with 20 samples because the matched packet's
  10k result was faster than 5k. Keep the matched comparison as canonical and
  the repeat as the honest noise bound.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| Importing Wordgard subpackages by separate absolute paths created duplicate `wordgard/state` identities and failed extension `instanceof` checks | 1 | Import the package root once and take `editor`, `state`, and `types` from that shared module graph | Resolved; 100-line smoke and the full packet passed |
| Canonical Wordgard 10k timings were lower than 5k | 1 | Run a separate 20-sample Wordgard-only stress packet without changing fixture or action | Resolved as noise evidence: repeat 10k p50/p95 is 80.0/90.3 ms mount and 156.9/181.7 ms type |
| Initial Benchmark validator rejected unresolved template values and invalid Applies cells | 1 | Replace template placeholders with exact identities and use separate `Applies=no` plus reasoned N/A status | Resolved; normal and complete validators pass |
| Initial scoped Prettier check rejected this run plan | 1 | Format only the owned plan, then rerun the full scoped static check | Resolved; `node --check`, Prettier check, and scoped `git diff --check` pass |
| First complete validator could not parse an artifact prefix split across lines | 1 | Put `artifact: <path>` on the Benchmark Source field's first line | Resolved; complete validator passes |

Verification evidence:

- Canonical command: `CODEBLOCK_PROBE_ITERATIONS=10 bun docs/plans/artifacts/2026-09-02-remove-code-line-model/huge-code-block-probe.mjs`; all 7 surfaces x 4 cohorts x 10 measured samples passed.
- Stability command: `CODEBLOCK_PROBE_SURFACES=wordgard CODEBLOCK_PROBE_COHORTS=5000,10000 CODEBLOCK_PROBE_ITERATIONS=20 CODEBLOCK_PROBE_ARTIFACT=wordgard-stability.json bun docs/plans/artifacts/2026-09-02-remove-code-line-model/huge-code-block-probe.mjs`; all 40 samples passed.
- Canonical artifact SHA-256 `6e29698595e5fa0e97023d6d9a53f76fcd6c94d4ab6fc556461f8163a6b19b76`; stability artifact `ee2ef384514b5391df838a690e9d4b6d430d36137b469809cb062da271c946ab`.
- Source audit identities: Wordgard `b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54`; CodeMirror View 6.41.0 at `fbff59ba004d80d8c914f64c42586387b08706ac`; Slate source `945a484df2497e4c448b33f417b0de2a49840032`.
- Wordgard owners: `src/types/schema.ts:46-54`, `src/doc/parse.ts:338-365`, `src/editor/tile.ts:668-708,1259-1270`, and `src/state/textblock.ts:18-90`.
- Exact prior-art owners: CodeMirror `src/buildtile.ts:19,53-64,543-556`, `src/tile.ts:301-343,383-425`, and `src/docview.ts:300-324`; Slate React `components/text.tsx:43-65` and Slate DOM `dom-editor.ts:576-635`.

Final handoff contract:

- goal plan / scope: add Wordgard to the exact huge-code-block packet and trace bounded render-only text prior art; no product implementation.
- candidate / baseline identities: exact Wordgard, Plate/Plite, Slate, Lexical, ProseMirror, harness, and build hashes are embedded in the canonical receipt.
- completed / N/A / pending lanes: five applicable lanes complete; four product/breadth lanes N/A; no benchmark lane pending.
- first conclusive cause: none in this follow-up. Wordgard falsifies line-model node count as a universal causal explanation.
- baseline / latest / best metrics: current Plite, Wordgard, private chunks, and contextual peers are reported above; private chunks win structure/mount but not trusted typing.
- fix owner / changed files: benchmark adapter and run-plan evidence only; no product source changed.
- exact benchmark and correctness reruns: canonical 10-sample packet and Wordgard 20-sample stress repeat passed exact-text guards.
- resumed breadth: trusted editing, pinned Slate, and all four cohorts completed after harness repair.
- packet decisions: keep both receipts and the adapter; defer production work to the accepted Plite-first parent plan.
- harness/methodology repairs: shared Wordgard module graph, honest total-DOM metric, measured-build fingerprints, and noise repeat.
- residual claim limits / next owner: one machine, headless Chromium, plain unhighlighted code, fixed-width lines. Plite Plan owns production projection and input-path profiling; Plate Plan owns CodeLine deletion/adoption.

Timeline:

- 2026-09-02T13:50:44.444Z Benchmark goal plan created.
- 2026-09-02 Wordgard adapter passed exact-text smoke after shared-module repair.
- 2026-09-02 Seven-surface 100/1k/5k/10k packet completed with one warmup and ten measured samples per row.
- 2026-09-02 Wordgard-only 20-sample stress repeat bounded the suspicious 5k/10k noise.
- 2026-09-02 CodeMirror, Slate, Wordgard, ProseMirror, and Lexical mechanisms classified from local source.
- 2026-09-02 Scoped static checks, Benchmark complete validation, and Autogoal closeout passed.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Final validation |
| Where am I going? | Closeout and answer |
| What is the goal? | Add a fair Wordgard result and source-backed prior-art answer to the CodeLine decision. |
| What have I learned? | Wordgard is fast with line-shaped state; CodeMirror is the exact bounded TextTile precedent; the Plite target still needs input-path work. |
| What have I done? | Added Wordgard, repaired metric honesty, ran canonical and stability packets, and traced exact/partial prior art. |

Open risks:

- Timings are from one Apple M5 Max and headless Chromium. They rank this
  controlled workload, not every editor or device.
- Wordgard mount includes its normal HTML ingestion path; the other adapters
  construct their native document shapes. This is end-to-end contextual mount,
  not a renderer-only microbenchmark. Trusted typing is more directly matched.
- The fixture is plain, unhighlighted, fixed-width code. Token decorations,
  wrapping, IME, browser find, cross-tile selections, undo, and collaboration
  remain production gates in the parent plan.
- The private Plite target's typing p95 trails Wordgard and ProseMirror. Removing
  CodeLine without fixing that path would clean the model and still leave a
  mediocre editor.
