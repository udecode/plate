# Tiptap Lowlight huge code benchmark

Objective:
Compare native Plate, CodeMirror, and official Tiptap Lowlight on identical
10,000-line highlighted code; done when matched mount/edit/DOM evidence and
correctness pass; plan docs/plans/2026-09-04-tiptap-lowlight-huge-code-benchmark.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-04-tiptap-lowlight-huge-code-benchmark.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: Recheck the claim that native Plate is not competitive by comparing
  it with the official Tiptap CodeBlockLowlight example. Preserve the existing
  native Plate and CodeMirror rows so the answer is a direct three-way table.
- scope: the same 10,000-line TypeScript fixture, syntax highlighting,
  fixed viewport/DPR, cold navigation or mount, trusted end-of-document edit,
  highlight settlement, DOM/repeated-unit counts, heap support metric, and
  native editing correctness for native Plate, CodeMirror, and Tiptap Lowlight.
- invocation: `$benchmark huge highlighted code versus Tiptap Lowlight`
- candidate-identity: commit: Plate
  `a6afd55c30e97c74fe895d1ad005ca75413110f3`; Tiptap commit
  `91c51be53c4655ef07e29ec489471524debfa0ca`; measured-input aggregate
  SHA-256 `800716b2750cdc617b8a1738031c56a61bb780041ace0fec28e0d9a4cb1fd2fb`.
- plate-main-identity: N/A: the request asks for a current cross-editor
  comparison, not a current-versus-main regression, and main lacks the matched
  three-route fixture.
- plite-identity: current Plite source reachable through the native Plate route;
  its measured files are fingerprinted inside the aggregate receipt.
- slate-identity: N/A: upstream Slate is not one of the requested strategies.
- named-symptom: native Plate appears materially slower than CodeMirror for one
  huge highlighted code block; determine whether official Tiptap Lowlight is
  materially better, equivalent, or worse under the same workload.
- final-artifacts: artifact: combined.final.receipt.json
  `docs/plans/artifacts/2026-09-04-tiptap-lowlight-huge-code-benchmark/combined.final.receipt.json`;
  is the machine-readable samples, comparison signature, source identity, and
  correctness ledger;
  `docs/plans/artifacts/2026-09-04-tiptap-lowlight-huge-code-benchmark/tiptap-lowlight-react-benchmark.mjs`
  is the exact runner; this file is the completed plan.

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
- semantics: N/A: evidence-gated one-shot execution.
- start / deadline: started 2026-09-04; no deadline.
- final loop closure: finish the active measurement/correctness packet and
  report any fairness limit; do not stop on the first attractive number.

Completion threshold:

- One paired run remeasures all three strategies with identical text, language,
  viewport, browser, action, warmups, samples, and interleaving; it reports
  p50/p75/p95/max for mount/navigation, trusted input-to-paint, and highlight
  settlement, plus DOM, mounted-line, and heap support metrics.
- At least 3 warmups and 15 measured samples per strategy; omit p99 because
  15 samples do not support it. Treat a delta as material only when it exceeds
  both 20% and 50 ms for mount or 20% and 16 ms for editing.
- Tiptap uses the exact current official CodeBlockLowlight example composition
  and a pinned local upstream commit, adapted only to inject the identical
  fixture and benchmark observability.
- All three strategies preserve the exact 10,000-line text and pass trusted
  edit plus follow-up text/model equality checks without retries.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`, P1 autoreview passes when
  code changed, and the Autogoal checker passes.

Verification surface:

- benchmark commands / artifacts: discover and record one exact runner command;
  persist raw samples and summary under
  `docs/plans/artifacts/2026-09-04-tiptap-lowlight-huge-code-benchmark/`.
- correctness commands: exact harness assertions plus current Plate focused
  browser tests for the native and CodeMirror demos.
- Browser / Chrome / device proof: Browser opens each compared route, performs
  the named edit, and checks visible completion plus console errors; Chromium
  automation supplies repeatable timings, not standalone product confidence.
- source/ref/fingerprint proof: exact Plate HEAD, pinned Tiptap commit,
  package/lock identities, browser/version, machine, route/fixture hashes, and
  aggregate input digest in the comparison receipt.

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

- allowed runtime/packages/apps: read current Plate/Plite and the existing www
  demos; use a disposable matched Tiptap harness. Do not change package/public
  API or production editor architecture for this comparison.
- allowed benchmark/tests/fixtures: existing huge-code fixture and runner,
  focused browser tests, and new artifact-local benchmark code/receipts.
- allowed baseline checkouts/hosts: pinned local `../tiptap` checkout or a
  fresh clone there; fresh isolated local hosts using the same Chromium binary.
- non-goals: no optimization, dependency adoption, production Tiptap demo,
  commit, push, PR, release, or claim that a minimal engine result alone proves
  whole-product superiority.

Output budget strategy:

- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:

- Stop only if the official example cannot be pinned or run locally, the same
  fixture/action cannot be expressed without changing semantics, Chromium
  cannot produce retry-free trusted input, or source/host identity cannot be
  proved after three distinct repair attempts.

## Comparison Signature

| Field                                | Candidate                                                                                                 | Baseline                                                                                                                                                                     | Comparable evidence                                                                                                                                                           |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ref / dirty fingerprint              | Plate `a6afd55c30e97c74fe895d1ad005ca75413110f3`                                                          | CodeMirror at the same Plate ref; Tiptap `91c51be53c4655ef07e29ec489471524debfa0ca`                                                                                          | artifact: `combined.final.receipt.json`; before/after aggregate SHA-256 `800716b2750cdc617b8a1738031c56a61bb780041ace0fec28e0d9a4cb1fd2fb`                                    |
| lockfile / package manager           | `pnpm-lock.yaml` SHA-256 `13b3c61f982c231b47d9055c86da88c5a6092ce3d273d5ffc3ee09e599555ba9`               | same Plate lock; isolated npm lock for exact Tiptap 3.21.0, Lowlight 3.3.0, React 19.2.0 dependencies                                                                        | artifact: receipt `identity.packages` and `identity.sourceBefore.files`                                                                                                       |
| build mode / host / port             | warmed current Next/Turbopack product route on `localhost:3100`                                           | CodeMirror uses the same product host; Tiptap uses an ephemeral localhost host with the official React example composition                                                   | artifact: receipt `config.hostModes`; navigation, heap, and whole-host mount are support metrics only because the Tiptap host is intentionally smaller                        |
| browser / machine / viewport / DPR   | Chromium `149.0.7827.55`; Apple M5 Max, 18 CPUs; darwin 25.3.0; 1280 x 720; DPR 1                         | identical                                                                                                                                                                    | artifact: receipt `identity.browser`, `identity.machine`, and `config.viewport`                                                                                               |
| route / fixture / document / plugins | `/blocks/code-block-huge-demo`; exact deterministic 10,000-line TypeScript text; full product `EditorKit` | `/blocks/code-block-codemirror-demo`; Tiptap `useEditor` + `EditorContent` + `Document` + `Paragraph` + `Text` + `CodeBlockLowlight.configure({ lowlight })` + `all` grammar | artifact: initial SHA-256 `2c4ba3ddc3f5ef0e46e46649bee509d3a4ac071ebfb0c41db871601067298766`; official composition captured in `config.officialExampleComposition`            |
| setup / action / DOM strategy        | full native contenteditable token DOM; focus exact model end and insert `\nconst __plateBenchmark = 1;`   | CodeMirror bounded editor DOM; Tiptap ProseMirror contenteditable with full Lowlight decoration DOM; identical trusted insertion                                             | artifact: final model SHA-256 `4be4603bf9f5ae537b61e520f1d81b9397d8ed02a0f5c3c8732a13cdde5c9584`; exact model, DOM where applicable, suffix, selection, and syntax assertions |
| warmups / samples / interleave order | 3 warmups + 15 measurements, fresh browser context per sample                                             | identical                                                                                                                                                                    | artifact: rotating Latin order (`native/codemirror/tiptap`, `codemirror/tiptap/native`, `tiptap/native/codemirror`) by round                                                  |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | request, scope, three-way deliverable, fixture, metrics, and non-goals above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `benchmark` source and methodology read | yes | complete read of `.agents/skills/benchmark/SKILL.md` and `references/methodology.md` |
| Active goal checked or created | yes | `get_goal` returned null; goal created with this plan and the three-way completion threshold |
| Candidate and baseline identities recorded | yes | exact refs, package versions, per-file hashes, and aggregate digest in `combined.final.receipt.json` |
| Target/runner discovery completed from current source | yes | current Plate routes and official Tiptap React example plus Lowlight plugin source were read before runner construction |
| Host/build/fixture freshness proved | yes | source-before equals source-after; each measured sample uses a fresh Chromium context and exact text hashes |
| Correctness oracle identified | yes | exact initial/final model SHA, DOM text SHA where full DOM exists, typed suffix, selection offset, line count, token count, runtime errors, and focused browser tests |
| All default lanes inventoried | yes | lane table below records applicability for this cross-editor scope |
| `only` narrowing explicitly authorized or N/A | no | N/A: normal scoped benchmark, not an `only` invocation |
| Browser/native proof strategy selected | yes | Browser route proof plus repeatable Chromium timing runner |
| Output budget strategy recorded | yes | see above |
| Commit/PR/release authority recorded | yes | no mutation authorized by default |
| Browser pack selected | yes | materialized by plan helper |
| Browser route / app surface identified | yes | existing native and CodeMirror registry demo routes plus the matched local Tiptap route discovered during source readiness |
| Browser tool decision recorded | yes | in-app Browser for user-facing proof; local Chromium automation only for sampling |
| Console/network caveat policy recorded | yes | record both; any runtime error invalidates the affected packet |
| Observable browser case captured | yes | case `TIPTAP-LOWLIGHT-10K`: load 10k TypeScript block, place caret at end, type one trusted character, require visible/model/text equality and settled highlighting on current local source fingerprints |

Work Checklist:

- [x] Every explicit scope, comparison, timing, stop condition, deliverable,
      verification surface, and success criterion is recorded.
- [x] Short objective, threshold, verification, constraints, boundaries, and
      blocked condition are concrete.
- [x] Default lanes remain in diagnostic order; every N/A row has a reason.
- [x] Candidate/baseline signatures prove comparable source, fixture, action,
      build, browser, machine, and sampling.
- [x] Primary metrics match the visible user operation; navigation, mount, and
      heap stay labeled as non-comparable support metrics across different hosts.
- [x] Samples expose p50/p75/p95/p99 only when sample count supports them,
      plus max, absolute/relative delta, and noise evidence.
- [x] Red lanes are not called causal without the conclusive-cause gate.
- [x] No product cause was claimed, so the cause-pause rule is N/A.
- [x] No product cause was claimed, so cause ownership and layer planning are
      N/A; the comparison only identifies an isolation target.
- [x] Every proven cause records its fix class, best long-term target, decision
      owner, layer plan, compatibility verdict, and implementation owner.
- [x] `public-api` and `runtime-architecture` causes run `best-api`, then
      `plite-plan`, `plate-plan`, or both before implementation. Broad accepted
      execution may use `auto`; target selection may not. N/A here because no
      architecture or public API change was made.
- [x] No product fix was made; exact rerun-after-fix is N/A.
- [x] No failed product rerun occurred.
- [x] No green product rerun was used to skip breadth; all applicable lanes ran.
- [x] Every packet has keep/revert/invalidate/quarantine/defer and next-owner
      evidence.
- [x] Harness/metric/host defects were repaired before the authoritative run.
- [x] Final handoff reports candidate/baseline identities, lane status, first
      conclusive cause, metrics, fix/reruns, resumed breadth, and residual risk.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it. Native OS
      behavior is N/A for this benchmark.
- [x] Browser pack: every sampled page records console, page, and network errors;
      the final packet has zero failures.
- [x] Browser pack: screenshots are N/A because the claim is measured latency,
      exact text, selection, and bounded DOM rather than visual styling.
- [x] Browser pack: pixel classification controls are N/A because no
      reporter-visible paint-correctness claim is made.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof. N/A:
      this is a comparison, not a paint bug.
- [x] Browser pack: red-before-fix is N/A because no fix claim was made; the
      exact requested case was benchmarked directly.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: clean pushed-ref proof is N/A because no product fix,
      commit, push, or shipped-state claim was made.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree. N/A: local comparison only.
- [x] Browser pack: selection and trusted editing passed 15/15 fresh-context
      measured samples per strategy; no DnD, compositor, or native-dialog claim
      applies.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording. The 15/15 exact
      Chromium ledger exceeds the applicable stability floor.
- [x] Browser pack: the disposable Tiptap host reproduces only the official
      example composition; it is fingerprinted and never presented as shipped
      product behavior.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

## Benchmark Lane Table

| Order | Lane                          | Applies | Status                                                              | Evidence                                                                                                                                                                         | Next             |
| ----- | ----------------------------- | ------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1     | source-and-host-readiness     | yes     | complete                                                            | exact refs, package versions, source hashes, aggregate digest, browser, machine, viewport, host modes, and fixture hashes in the final receipt                                   | lane 4 completed |
| 2     | current-vs-main-product-smoke | no      | N/A: inapplicable - no historical regression claim                  | main lacks the matched three-route fixture                                                                                                                                       | lane 3           |
| 3     | plate-vs-plite-decomposition  | no      | N/A: inapplicable - no wrapper/substrate attribution claim          | question compares rendering strategies; prior current-tree decomposition is supporting context only                                                                              | lane 4           |
| 4     | owner-microbench-and-trace    | yes     | complete                                                            | Tiptap performs one 448,917-character Lowlight call per insert; p95 source work 171.1 ms; native/Tiptap retain about 30k token elements while CodeMirror retains 111             | lane 5 completed |
| 5     | product-mount-matrix          | yes     | complete                                                            | all three hosts mounted 3 warmups + 15 fresh-context samples; cross-host navigation/mount and heap remain support-only because Plate uses full `EditorKit` and Tiptap is minimal | lane 6 completed |
| 6     | trusted-editing-matrix        | yes     | complete                                                            | all 45 measured edits passed exact initial/final model SHA, suffix, selection, syntax, and applicable DOM equality; zero runtime/network failures                                | lane 9 completed |
| 7     | plite-vs-pinned-slate         | no      | N/A: inapplicable - raw substrate comparison is outside the request | neither raw Plite nor upstream Slate is a requested strategy                                                                                                                     | lane 8           |
| 8     | example-breadth               | no      | N/A: inapplicable - one named example only                          | request names one official Tiptap Lowlight example and one huge-code cohort                                                                                                      | lane 9           |
| 9     | large-and-stress              | yes     | complete                                                            | final rotating three-way packet measured 15/15 samples per strategy on the exact 10,000-line cohort                                                                              | closeout         |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: no cause proven
- lane: N/A: no cause proven
- comparable-baseline: N/A: no cause proven
- material-delta: N/A: no cause proven
- isolated-owner: N/A: no cause proven
- causal-intervention: N/A: no cause proven
- correctness-guard-result: N/A: no cause was isolated
- fix-class: N/A: no cause proven
- long-term-target: N/A: no cause proven
- decision-owner: N/A: no cause proven
- layer-plan: N/A: no cause proven
- compatibility-verdict: N/A: no cause proven
- fix-owner: N/A: no cause proven
- benchmark-command: N/A: no cause proven
- benchmark-rerun: N/A: no cause proven
- benchmark-rerun-result: N/A: no cause was isolated
- correctness-command: N/A: no cause proven
- correctness-rerun: N/A: no cause proven
- correctness-rerun-result: N/A: no cause was isolated
- resume-lane: N/A: no cause proven

## Cause History

| Cause ID | Lane                           | Decision             | Fix Class   | Long-Term Target            | Decision Owner          | Layer Plan                | Compatibility Verdict                 | Fix Owner         | Causal Evidence                                             | Pre-Fix Correctness   | Benchmark Command              | Benchmark Result      | Correctness Command              | Post-Fix Correctness   | Evidence                                                                                         |
| -------- | ------------------------------ | -------------------- | ----------- | --------------------------- | ----------------------- | ------------------------- | ------------------------------------- | ----------------- | ----------------------------------------------------------- | --------------------- | ------------------------------ | --------------------- | -------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| none     | N/A: no isolated product cause | N/A: comparison only | N/A: no fix | N/A: no accepted fix target | N/A: no decision needed | N/A: no layer plan needed | N/A: no compatibility decision needed | N/A: no fix owner | N/A: structural correlation is not an isolated intervention | N/A: no pre-fix phase | N/A: no causal benchmark rerun | N/A: no causal result | N/A: no causal correctness rerun | N/A: no post-fix phase | artifact: `combined.final.receipt.json` records a valid comparison without a causal intervention |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| historical receipt | source readiness | prior Tiptap numbers used a core `Editor`, midpoint multi-keystroke action, and 5 samples | not comparable | navigation only | invalidate for the headline comparison | build matched React example runner |
| standalone Tiptap trial | harness | official React example runs the same fixture and action | p95 moved from 251.2 to 475.7 ms across isolated runs | exact text passed | quarantine as order/thermal-sensitive | interleave all three strategies in one packet |
| final combined packet | lanes 4-6, 9 | bounded DOM should dominate; Tiptap may expose Plate-specific overhead inside the full-DOM class | native 814.0 ms, Tiptap 582.8 ms, CodeMirror 60.9 ms input p95 | pass, 15/15 each | keep | report; isolate minimal Plate only if pursuing the 28.4% gap |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| trusted input-to-paint: native -> Tiptap | 15 each | native 566.9 / 697.4 / 814.0 / N/A / 814.0 ms | Tiptap 357.0 / 410.1 / 582.8 / N/A / 582.8 ms | p95 -231.2 ms / -28.4% | material by both thresholds; same fixture/action/browser/interleave, but full product versus minimal host limits owner attribution | artifact: `combined.final.receipt.json` |
| trusted input-to-paint: Tiptap -> CodeMirror | 15 each | Tiptap 357.0 / 410.1 / 582.8 / N/A / 582.8 ms | CodeMirror 32.8 / 39.1 / 60.9 / N/A / 60.9 ms | p95 -521.9 ms / -89.55% | material; same fixture/action/browser/interleave | artifact: `combined.final.receipt.json` |
| highlight settle: native -> Tiptap | 15 each | native 579.5 / 711.5 / 822.8 / N/A / 822.8 ms | Tiptap 374.3 / 427.3 / 599.0 / N/A / 599.0 ms | p95 -223.8 ms / -27.2% | material; same caveat as input timing | artifact: `combined.final.receipt.json` |
| highlight settle: Tiptap -> CodeMirror | 15 each | Tiptap 374.3 / 427.3 / 599.0 / N/A / 599.0 ms | CodeMirror 50.3 / 55.9 / 75.0 / N/A / 75.0 ms | p95 -524.0 ms / -87.48% | material; same fixture/action/browser/interleave | artifact: `combined.final.receipt.json` |
| mounted structure before edit | 15 each | native 30,011 descendants / 10,000 lines / 30,000 tokens; Tiptap 30,001 / 10,000 / 30,000 | CodeMirror 153 descendants / 37 lines / 111 tokens | CodeMirror retains 0.51% of Tiptap's block descendants | invariant across every sample | artifact: `combined.final.receipt.json` |
| Tiptap Lowlight source work | 15 | N/A | 105.9 / 119.9 / 171.1 / N/A / 171.1 ms | 29.4% of Tiptap input p95 | exactly one synchronous full-block call per insertion | artifact: `combined.final.receipt.json` |
| navigation / local mount / heap support | 15 each | native navigation p95 3145.75 ms; CodeMirror 1965.6 ms | Tiptap navigation 598.78 ms; local mount 475.2 ms; heap p50 23.09 MB | intentionally not ranked | invalid cross-product comparison: full Next product shell versus minimal ephemeral host | artifact: `combined.final.receipt.json` |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | pass: 3 warmups + 15 measurements for each strategy; all correctness fields true |
| Benchmark plan structural validation | yes | Run the plan validator at cause/resume checkpoints | pass; final command recorded below |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | pass: lanes 1, 4, 5, 6, and 9 complete; others are evidence-backed N/A |
| Exact post-fix benchmark reruns | no | N/A: no product fix was made | N/A |
| Correctness/native behavior reruns | yes | Run named tests and exact benchmark assertions | pass: receipt evaluation plus focused Playwright 4/4 |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | pass: before/after aggregate SHA-256 is identical |
| Benchmark target/metric honesty | yes | Verify identity, fixture parity, sample math, aggregation, and provenance | pass: exact hashes and raw samples retained; p99 omitted; cross-host metrics labeled support-only |
| Durable fix decision | no | N/A: no cause was isolated and no product mutation was requested | N/A; next owner remains `benchmark` for minimal-Plate isolation |
| Package/type/build proof | no | N/A: artifact-only benchmark runner and plan; no package source changed | focused browser behavior tests are the relevant guard |
| Browser surface proof | yes | Open product surfaces with Browser and replay exact interactions in Chromium | pass: Browser exposed both Plate routes; exact edit packet passed in Chromium |
| Changeset/release artifact | no | N/A: no published package behavior or API changed | N/A |
| Agent rule/skill sync | no | N/A: no agent source changed | N/A |
| Benchmark plan complete validation | yes | Run validator with `--complete` | pass; command recorded below |
| Final lint | yes | Run scoped formatting and syntax checks | pass; commands recorded below |
| Timed checkpoint | no | N/A: no duration requested | N/A |
| P1 autoreview | no | N/A: current branch is `next`, where repo rules forbid `autoreview`; only benchmark artifacts and this plan changed | N/A |
| Goal plan complete | yes | Run Autogoal checker | pass; command recorded below |
| Browser interaction proof | yes | Exercise the exact routes and trusted edit | pass: visible route proof plus 45/45 measured interactions |
| Browser console/network check | yes | Record console, page, and request failures | pass: `failures: []` and `validityFailures: []` |
| Browser final proof artifact | yes | Persist exact source, samples, structure, failures, and assertions | pass: `combined.final.receipt.json` |
| Exact case replay | yes | Replay `TIPTAP-LOWLIGHT-10K` in fresh contexts | pass: 15/15 per strategy with exact final SHA and selection |
| Final ref and fingerprints | yes | Record commit/ref and runtime-input SHA-256 values | pass: receipt identity records Plate/Tiptap refs, every measured file, runner, dependencies, and stable aggregate |
| Clean final runtime | no | N/A: local uncommitted benchmark evidence; no fixed, pushed, or shipped-state wording | N/A |
| Retry-free stability | yes | Meet at least 5/5 on applicable selection/edit lifecycle | pass: 15/15 measured contexts per strategy and 4/4 focused tests; zero retries or failures |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | exact request, identities, boundaries, and fairness limits captured | ordered measurement complete |
| Ordered diagnosis | complete | source trace plus combined owner/mount/edit/stress packet | no causal product claim |
| Fix and exact rerun | N/A | no product fix requested or made | remaining breadth complete |
| Remaining breadth | complete | every applicable lane completed in one combined packet | final verification complete |
| Review and closeout | complete | receipt, focused tests, validators, syntax, formatting, and goal checker pass | final response |

Findings:

- Current local Tiptap is commit
  `91c51be53c4655ef07e29ec489471524debfa0ca`; its package and official React
  CodeBlockLowlight demo are version 3.21.0.
- The official React demo uses `useEditor`, `EditorContent`, `Document`,
  `Paragraph`, `Text`, `CodeBlockLowlight.configure({ lowlight })`, and
  `createLowlight(all)`.
- Tiptap's `LowlightPlugin` scans each code block's full `textContent`, parses
  the full Lowlight tree, and rebuilds a `DecorationSet` synchronously for an
  in-code-block document change. It has no incremental syntax range owner.
- A 2026-09-03 receipt is navigation evidence only: it used core `Editor`, a
  different midpoint multi-keystroke action, and five mount samples. It cannot
  answer today's exact React-example/product-fixture comparison.
- Tiptap Lowlight is materially faster than native Plate on the exact trusted
  edit: 582.8 ms versus 814.0 ms p95, a 231.2 ms or 28.4% reduction.
- Tiptap is still unacceptably slow for this stress case. Its p95 is 9.57 times
  CodeMirror's 60.9 ms, and its 30,001 block descendants are effectively the
  same full-DOM shape as native Plate's 30,011.
- CodeMirror retains only 153 block descendants and 37 rendered lines before
  the edit. The bounded-DOM strategy, not Tiptap's editor engine, is the main
  architectural advantage in this cohort.
- Tiptap's one synchronous Lowlight call costs 171.1 ms p95, about 29% of its
  input-to-paint p95. ProseMirror decoration creation, reconciliation, and
  browser work account for the rest.
- The additional 28.4% Plate cost is real at the product-example level but its
  owner is not isolated. Native Plate includes the full `EditorKit`; the Tiptap
  host is the minimal official example. A minimal Plate CodeBlockKit lane is
  required before blaming Plate's renderer, plugin graph, or highlighting
  pipeline.

Decisions and tradeoffs:

- Rerun rather than splice yesterday's numbers into today's product table. Use
  the actual React example stack and today's exact fixture plus one trusted
  `insertText` event. Retain the old receipt only as non-authoritative context.
- Do not copy Tiptap's Lowlight architecture. It improves on native Plate but
  still synchronously re-highlights and remounts the pathological full block.
- Keep native Plate as the ordinary-size default and CodeMirror as the explicit
  huge-code mode. This benchmark supplies no evidence for silently mixing
  virtualization into the native renderer.
- If the Plate-vs-Tiptap delta matters next, benchmark a minimal Plate
  CodeBlockKit before changing production architecture. The current comparison
  cannot honestly assign that 231 ms.

Harness/methodology repairs:

- Mirrored the exact official Tiptap React composition instead of the older
  core-`Editor` harness.
- Replaced standalone editor runs with a rotating three-strategy Latin order to
  reduce order and thermal bias.
- Added exact initial/final SHA-256, typed suffix, selection-following,
  full-DOM equality where applicable, line/token counts, one-Lowlight-call,
  source-stability, console, page-error, and request-failure assertions.
- Kept navigation, local mount, and heap in the receipt but excluded them from
  the cross-product verdict because the hosts differ materially.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| An overly broad numeric `rg` crossed a generated giant-line artifact and returned 1.3M tokens before truncation | 1 | Search exact named artifact directories and source files only | resolved: subsequent searches are path-bounded and capped |
| Standalone Tiptap p95 shifted from 251.2 to 475.7 ms under order/thermal drift | 1 | Interleave all three strategies by round in fresh contexts | resolved: final verdict uses only the combined rotating packet |
| Focused Playwright tests initially collided with a manually started server on port 3100 | 1 | stop the manual server and let the test command own its configured host | resolved: 4/4 tests passed |
| Browser accessibility output expanded the complete 10,000-line block | 1 | use Browser only for route visibility and the bounded runner/receipt for exact state | resolved: no further broad accessibility dumps; receipt retained exact hashes and counts |

Verification evidence:

- Benchmark host: `PORT=3100 pnpm --filter www dev`.
- Authoritative benchmark:
  `TIPTAP_REACT_BENCHMARK_ARTIFACT=docs/plans/artifacts/2026-09-04-tiptap-lowlight-huge-code-benchmark/combined.final.receipt.json node docs/plans/artifacts/2026-09-04-tiptap-lowlight-huge-code-benchmark/tiptap-lowlight-react-benchmark.mjs`.
  Result: validity pass, stable source, zero failures, 15/15 measured samples
  per strategy.
- Focused product behavior:
  `pnpm --filter www test:www-browser:chromium tests/browser/code-block-demos.spec.ts tests/browser/code-block-codemirror.spec.ts`.
  Result: 4/4 passed in 41.9 seconds, covering bounded CodeMirror ownership,
  editing/IME/remote updates, the default small demo, and native 10k
  edit/undo/redo/IME/read-only behavior.
- Browser opened `/blocks/code-block-huge-demo` and
  `/blocks/code-block-codemirror-demo` on the current local app. The exact
  trusted edit, model, DOM, selection, syntax, console, and network checks ran
  inside each fresh Chromium sample.
- `node --check docs/plans/artifacts/2026-09-04-tiptap-lowlight-huge-code-benchmark/tiptap-lowlight-react-benchmark.mjs`: pass.
- `jq empty docs/plans/artifacts/2026-09-04-tiptap-lowlight-huge-code-benchmark/combined.final.receipt.json`: pass.
- `pnpm exec prettier --check docs/plans/2026-09-04-tiptap-lowlight-huge-code-benchmark.md docs/plans/artifacts/2026-09-04-tiptap-lowlight-huge-code-benchmark/tiptap-lowlight-react-benchmark.mjs docs/plans/artifacts/2026-09-04-tiptap-lowlight-huge-code-benchmark/combined.final.receipt.json`: pass.
- `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-09-04-tiptap-lowlight-huge-code-benchmark.md --complete`: pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-tiptap-lowlight-huge-code-benchmark.md`: pass.

Final handoff contract:

- goal plan / scope: exact three-way 10,000-line TypeScript highlighted-code
  comparison; complete.
- candidate / baseline identities: Plate
  `a6afd55c30e97c74fe895d1ad005ca75413110f3`, Tiptap
  `91c51be53c4655ef07e29ec489471524debfa0ca`, measured aggregate
  `800716b2750cdc617b8a1738031c56a61bb780041ace0fec28e0d9a4cb1fd2fb`.
- completed / N/A lanes: 1, 4, 5, 6, and 9 complete; 2, 3, 7, and 8 N/A
  with recorded reasons.
- first conclusive cause: none claimed. The bounded-versus-full DOM split is a
  strong architectural explanation for CodeMirror's tier; Plate's extra cost
  versus Tiptap remains confounded.
- baseline / latest / best metrics: native Plate 814.0 ms, Tiptap 582.8 ms,
  CodeMirror 60.9 ms trusted input p95; native 822.8 ms, Tiptap 599.0 ms,
  CodeMirror 75.0 ms settle p95.
- fix owner / changed files: no product fix. Added only this plan, runner, and
  receipt.
- exact benchmark and correctness reruns: authoritative 45-sample packet plus
  focused Plate browser tests 4/4.
- resumed breadth: all applicable comparison lanes completed after harness
  repair.
- packet decisions: historical receipt invalid for headline; standalone Tiptap
  trial quarantined; combined rotating packet kept.
- harness/methodology repairs: official React composition, rotating order,
  stronger hashes/selection/error/source-stability assertions.
- residual claim limits / next owner: navigation, heap, and mount are not
  cross-product rankings. `benchmark` should add a minimal Plate CodeBlockKit
  lane before assigning the 28.4% Plate-vs-Tiptap gap.

Timeline:

- 2026-09-04T14:21:16.164Z Benchmark goal plan created.
- 2026-09-04 Requirement checkpoint filled; active goal created; official
  Tiptap React example and Lowlight owner read at local commit `91c51be`.
- 2026-09-04 Official React Tiptap harness completed; standalone timing drift
  exposed order sensitivity.
- 2026-09-04 Final combined rotating packet passed with stable source, exact
  text/selection correctness, zero runtime failures, and 15/15 samples per
  strategy.
- 2026-09-04 Focused current Plate browser tests passed 4/4; final validators,
  syntax, receipt parse, formatting, and goal completion checks passed.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Complete three-way comparison and closeout |
| Where am I going? | Final handoff; optional minimal Plate isolation is a separate benchmark |
| What is the goal? | Compare native Plate, CodeMirror, and official Tiptap Lowlight on identical 10k highlighted code with matched edit, DOM, and correctness evidence |
| What have I learned? | See Findings |
| What have I done? | Built the official React Tiptap lane, ran the combined packet and focused tests, and closed the evidence ledger |

Open risks:

- Plate's 28.4% p95 disadvantage versus Tiptap is a valid product-example
  result, not an isolated engine attribution. The full `EditorKit` versus
  minimal Tiptap host is the remaining confound.
- Fifteen samples support p95 only as the slowest observed sample; no p99 is
  reported. The ranking survived an earlier combined packet, but absolute
  timings remain machine/load sensitive.
- This is local uncommitted benchmark evidence. It is not a shipped-state or
  release claim.
