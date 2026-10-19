# 1,000-line code docs and Tiptap Lowlight benchmark

Objective:
Show 1,000 native code lines in the docs and compare the exact preview with the official Tiptap Lowlight React example using matched text and trusted input.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-06-code-block-1000-tiptap-benchmark.md

Template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: "Maybe 1000 instead of 100 ? Then can you benchmark vs tiptap lowlight example."
- scope: native docs preview at 1,000 TypeScript lines, Tiptap's official CodeBlockLowlight React composition with the identical fixture, mount/readiness, trusted insertion, highlight settlement, exact text/selection and mounted DOM; desktop and narrow docs verification.
- invocation: `$benchmark code docs at 1000 lines versus Tiptap Lowlight example`
- candidate-identity: fingerprint: 53ad906c7e40feb4c1a5700f9ca65d150bc5ee40902dca21df36f05c9ac7549a across 2448 inputs; HEAD a6afd55c30e97c74fe895d1ad005ca75413110f3.
- plate-main-identity: N/A: external example comparison, no current-versus-main regression claim.
- plite-identity: current source reached through the Plate docs editor; included in source fingerprints.
- slate-identity: N/A: neither raw Plite nor upstream Slate is a requested comparator.
- named-symptom: avoid a pathological docs preview while retaining a useful large sample.
- final-artifacts: artifact: docs/plans/artifacts/2026-09-06-code-block-1000-tiptap-benchmark/

Completion threshold:

- Docs show exactly 1,000 highlighted native lines; the linked native stress route retains 10,000.
- Reuse the existing Tiptap comparison runner with 3 warmups and 15 measured fresh-context samples per editor, alternating order, exact text hashes, selection and syntax checks, no retries.
- Report p50/p75/p95/max and raw samples; omit p99 at this sample count.
- Freeze materiality before results: at least 20% and 16ms for input/settlement, at least 20% and 50ms for comparable mount metrics, with consistent paired direction and packet spread. Small or unstable differences are inconclusive.
- Whole docs navigation and the smaller Tiptap host are reported separately; host navigation is not an engine-speed comparison. Runtime mode and dependency differences must remain explicit.
- Pass the existing three-case docs/default/stress browser spec, source checks, applicable registry generation, narrow and actual Chrome docs checks, and plan validation.

Constraints:

- Match the 1,000-line text, explicit TypeScript, Lowlight grammars, Chromium, viewport, DPR and trusted input. Keep full native DOM in both editors.
- Preserve the original 10,000-line fixture and historical receipts. No runtime optimization, Tiptap adoption, publication or other checkout is requested.
- Build the disposable Tiptap host from pinned installed dependencies and record its official local source. Preserve current user browser tabs.
- No duration or native goal requested. Structured review is N/A on `next`.

Verification surface:

- Existing Tiptap runner, adapted for the docs root and two selected strategies.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter www test:www-browser:chromium code-block-demos.spec.ts`.
- `pnpm --filter www typecheck`, scoped lint, registry build and changelog validation.

Blocked condition:
Missing runnable comparator or invalid fixture/source/native-input proof prevents a timing verdict; repair the benchmark before reporting results.

## Interaction Coverage

- first-interaction: pass: comparison.json initial trusted insertion, exact text/DOM/caret in 30 measured samples.
- settled-interaction: pass: comparison.json followup single x key, exact text/DOM/caret in all 30 measured samples.
- route-scope: pass: actual /docs/code-block native preview; browser.log and chrome-profile.json include scrolling and narrow layout.
- reporter-profile: pass: chrome-profile.json verifies Chrome Ziad; quantitative timings are separately labeled clean Chromium.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | fingerprint: 53ad906c7e40feb4c1a5700f9ca65d150bc5ee40902dca21df36f05c9ac7549a | commit: 91c51be53c4655ef07e29ec489471524debfa0ca; installed packages hashed | artifact: smoke.json identity.sourceBefore |
| lockfile / package manager | current pnpm lock | isolated npm lock; React 19.2.8, Tiptap 3.21.0, Lowlight 3.3.0 | artifact: smoke.json identity.packages and sourceBefore |
| build mode / host / port | Next development, StrictMode, localhost:3000 | Bun development bundle, StrictMode, ephemeral localhost | artifact: smoke.json config.hostModes; host navigation not an engine comparison |
| browser / machine / viewport / DPR | Chromium 149.0.7827.55, 1280 x 720, DPR 1 | same browser and Mac | artifact: smoke.json identity.machine and config.viewport |
| route / fixture / document / plugins | /docs/code-block native preview; full EditorKit | official Document, Paragraph, Text, CodeBlockLowlight | artifact: smoke.json exact shared hash; composition difference explicit |
| setup / action / DOM strategy | select code end, trusted insert, settled x key, full DOM | same | artifact: smoke.json samples and correctness |
| warmups / samples / interleave order | 3 / 15 / AB-BA | same | artifact: comparison.json full packet passes; smoke.json is excluded readiness-only evidence |

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | smoke has stable 2448-input source signature, exact 1000-line model/DOM and caret in both editors; zero attempts failed | measure full packet |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - no historical regression comparison | requested comparator is Tiptap | lane 3 |
| 3 | plate-vs-plite-decomposition | no | N/A: inapplicable - no wrapper or substrate attribution claim | product examples compared as configured | lane 4 |
| 4 | owner-microbench-and-trace | yes | complete | artifact: comparison.json Lowlight calls and DOM counts; no new cause claimed | complete |
| 5 | product-mount-matrix | yes | complete | artifact: comparison.json records both host readiness distributions; README.md states mount comparability limit | complete |
| 6 | trusted-editing-matrix | yes | complete | artifact: comparison.json 15/15 samples each, trusted initial insertion and settled x key, exact model/DOM/caret | complete |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - raw substrate comparison not requested | neither raw Plite nor Slate is compared | lane 8 |
| 8 | example-breadth | no | N/A: inapplicable - one named code example | unrelated feature examples cannot answer this comparison | lane 9 |
| 9 | large-and-stress | yes | complete | artifact: comparison.json 1000-line cohort plus browser.log 10000-line editing correctness | complete |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: no optimization cause claimed
- lane: N/A: comparison only
- comparable-baseline: N/A: no cause claimed
- material-delta: N/A: no cause claimed
- isolated-owner: N/A: examples differ in composition
- causal-intervention: N/A: no runtime optimization
- correctness-guard-result: N/A: no causal optimization; comparison correctness passes in comparison.json.
- fix-class: N/A: fixture size requested directly
- long-term-target: N/A: no runtime design change
- decision-owner: N/A: no runtime design change
- layer-plan: N/A: no runtime design change
- compatibility-verdict: N/A: no public API change
- fix-owner: N/A: no runtime optimization
- benchmark-command: N/A: no red benchmark repair
- benchmark-rerun: N/A: no runtime optimization
- benchmark-rerun-result: N/A: no runtime optimization; comparison.json is the completed measurement.
- correctness-command: N/A: no runtime repair
- correctness-rerun: N/A: no runtime repair
- correctness-rerun-result: N/A: no runtime optimization; browser.log passes the changed fixture and stress case.
- resume-lane: N/A: no cause pause

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| none | N/A: comparison only | N/A: no cause claimed | N/A: no runtime fix | N/A: no runtime fix | N/A: no runtime fix | N/A: no runtime fix | N/A: no API change | N/A: no runtime fix | N/A: no cause claimed | N/A: no runtime fix | N/A: no red benchmark repair | N/A: no runtime fix | N/A: no runtime fix | N/A: no runtime fix | Plan records comparison-only scope; no causal verdict |

Work Checklist:
- [x] Set and verify the 1,000-line docs fixture.
- [x] Capture the current source, comparator and host identities.
- [x] Complete the paired comparison and preserve all attempts.
- [x] Verify real docs desktop/narrow behavior and retained stress correctness.
- [x] Record results, limitations and successful final checks.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Requested preview | yes | exactly 1,000 lines in docs | pass: browser.log and chrome-profile.json |
| Paired benchmark | yes | matched text/action and stable source | pass: comparison.json and final-source-check.json |
| Correctness and source checks | yes | focused browser, types, generation | pass: browser.log, typecheck.log, registry.log, lint.log, changelog-check.log |
| Interaction coverage | yes | exact docs and actual Chrome | pass: chrome-profile.json and screenshots |
| Benchmark plan complete | yes | validator and plan checker | pass: completion-check.log |
| Autoreview | no | N/A: forbidden on next | N/A |
| Publication | no | N/A: not requested | N/A |

## Readiness checkpoint

React and React DOM are 19.2.8 in both hosts; Tiptap 3.21.0 and Lowlight 3.3.0
are pinned in the isolated dependency lock. Tiptap uses development mode and
StrictMode to match Next. Its official nested code stylesheet is included.
The official example source is pinned to 91c51be53c4655ef07e29ec489471524debfa0ca.

The initial smoke is correctness-only: one sample per editor, no failures,
all text/DOM/caret checks pass. Its sole validity failure is the intentional
count below 15. It is excluded from timing conclusions.

All three focused browser cases and website typecheck pass. Chrome Ziad shows
1,000 lines, 3,042 native editor descendants and final line result01000.

The full packet records initial trusted insertion of the 28-character syntax
probe and a separate trusted x key after syntax settlement. No standalone
engine-mount ratio will be inferred from docs-versus-Tiptap-host navigation.

## Final result


The docs preview uses 1,000 lines; its separate native stress route keeps 10,000.
The measured text is identical in both editors: 43,889 characters and 3,000
syntax-token elements, with all 1,000 lines mounted.

| Operation | Plate p50 / p95 | Tiptap p50 / p95 |
|---|---:|---:|
| Trusted 28-character insertion to paint | 36.2 / 39.3 ms | 39.5 / 40.8 ms |
| Settled single x key to paint | 36.3 / 42.0 ms | 31.3 / 32.5 ms |
| Inserted syntax highlighting settled | 205.8 / 209.7 ms | 56.2 / 57.8 ms |

Insertion has no material winner. Tiptap's settled key was faster in all 15
pairs, but its 9.5ms p95 advantage is below the predeclared 16ms materiality
floor. Highlight settlement has a material Tiptap advantage: 151.9ms at p95,
72.4% lower, in all 15 pairs. Plate schedules syntax refresh after 120ms;
Tiptap performs one synchronous Lowlight pass per insertion, taking 12.3ms p95.
The scheduling facts match current source; this comparison does not isolate a
new causal optimization or justify changing that policy.

Whole-host readiness is separate: the full Plate docs page reaches queryable
highlighted content in 2,030.4 / 2,055.9ms (p50 / p95); the smaller Tiptap host
in 137.9 / 138.9ms. Tiptap's instrumented local mount is 69.7 / 70.3ms. These
are different hosts and composition costs; no engine-mount ratio is valid.


Final source read-back: all 2448 files and the measured Tiptap bundle match.
Full results and limits: artifacts/2026-09-06-code-block-1000-tiptap-benchmark/README.md.

Exact benchmark command:
```bash
TIPTAP_REACT_BENCHMARK_LINES=1000 TIPTAP_REACT_BENCHMARK_STRATEGIES=native,tiptap TIPTAP_REACT_BENCHMARK_PLATE_URL=http://localhost:3000 TIPTAP_REACT_BENCHMARK_NATIVE_ROUTE=/docs/code-block TIPTAP_REACT_BENCHMARK_PLATE_ROOT='#code-block-huge-demo .plite-editor' TIPTAP_REACT_BENCHMARK_REACT_ENV=development TIPTAP_REACT_BENCHMARK_REACT_STRICT=1 TIPTAP_REACT_BENCHMARK_ARTIFACT=docs/plans/artifacts/2026-09-06-code-block-1000-tiptap-benchmark/comparison.json bun docs/plans/artifacts/2026-09-04-tiptap-lowlight-huge-code-benchmark/tiptap-lowlight-react-benchmark.mjs
```

Boundaries:
- Product edits: native docs fixture size, docs copy, its existing browser expectations and draft registry changelog; retain the 10,000-line stress route.
- Benchmark edits: existing Tiptap comparison runner, isolated dependencies, plan and receipts. No package runtime, public API, other checkout or publication work.

Verification evidence:
- Fresh final paired receipt: comparison.json passes with 15 samples per editor, all exact initial/final/follow-up model, DOM and caret checks, no retries or browser failures.
- Final-source-check.json passes for 2448 inputs and the built Tiptap bundle.
- Three focused browser tests and website typecheck pass; registry build, changelog validation, scoped lint and runner syntax checks pass.
- Chrome-profile.json and desktop/mobile screenshots record the real docs check; the temporary tab is closed and viewport override reset.

Open risks:
- Example composition and CSS differ; whole-host navigation and heap cannot establish an engine comparison.
- Development-mode results do not certify production load times or a deployed page.
- Fifteen samples support this scoped comparison, not p99 or physical-device latency claims.
