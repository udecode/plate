# Homepage heading Enter latency benchmark

Objective:
Measure Plate #5064's exact homepage heading Enter latency against `main`,
remove the proven architectural cost, and retain exact editing correctness.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5064-homepage-heading-enter-latency-benchmark.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: Regression closure for Plate #5064 with the best durable fix
- scope: trusted Enter in the homepage Playground heading, matched current/main
  comparison, Plate/Plite decomposition, causal owner intervention, exact rerun,
  and relevant normal-document breadth; huge documents are explicitly excluded
- invocation: `$benchmark issue #5064 homepage heading Enter latency`
- candidate-identity: ref: `1fb72c581095f23ddba3f597f41e8b10608283ef`
  plus source fingerprint
  `f8d6e785e7dbb3b9200ec2561bf9abf1262976b031c18bc4c06841486da77735`
- plate-main-identity: commit: `2f87593f95a1ff2e931cd42fcf73f052b1d0db41`
- plite-identity: fingerprint: candidate Plite rich-text fixture measured in
  `plite-richtext-1.json` from the same checkout
- slate-identity: ref: not required after the cost was isolated above Plite in
  Plate's per-block DnD UI
- named-symptom: trusted Enter in “Welcome to the Plate Playground!” is visibly
  delayed after the reporter-confirmed crash fix
- final-artifacts: artifact: `docs/plans/artifacts/5064-homepage-enter-latency/final-summary.json`

First checkpoint:
- The exact action, source identities, correctness law, default lane inventory,
  output boundary, comment authority, no-lint rule, and no-Autoreview rule were
  recorded before product measurement.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A: one-shot exact-case closure
- final loop closure: completed after the final five-packet measurement and
  five retry-free browser replays

Completion threshold:
- Trusted Enter must insert exactly one block, advance one commit, preserve
  focus and collapsed model/DOM carets, keep the table rendered, and emit no
  runtime error.
- The candidate must avoid a material current-vs-main regression. The
  predeclared materiality rule requires both more than 4 ms absolute delta and
  more than 25% relative delta outside packet noise.
- The original 16/32 ms absolute budgets and zero-long-task budget are rejected
  as invalid host assumptions because exact `main` also misses them: main p95
  is about 70/72 ms and records 5-8 observer long tasks per packet.
- The retained fix must reduce the reproduced 330/370 ms mean and 376/417 ms
  p95 candidate red, pass five final packets, and pass five exact browser runs.
- Every applicable lane must close, the benchmark validator must pass with
  `--complete`, and the Autogoal checker must pass.

Verification surface:
- `apps/www/scripts/run-homepage-input-perf.mts` with trusted `--action enter`
- isolated source-built current and `main` hosts on the same machine/browser
- package tests for Core wrappers, DnD, Plite DOM paths, Table, and Selection
- five repeats of the four exact Playwright cases for #5091, #5065, #5088, and
  the #5064 DnD/editing path
- focused package/app typechecks and Core/DnD barrel checks

Constraints:
- Correctness outranks metric movement. No debounce, delayed work, fixture
  narrowing, focus hack, or hidden DOM degradation may fake a win.
- The best durable owner wins over compatibility. Private-beta wrapper API
  shape may break when the replacement has materially better long-term value.
- No lint, Autoreview, commit, push, PR, issue close, or label mutation.
- A truthful local-candidate issue comment is authorized only after final proof.

Boundaries:
- Runtime changes stay in Plate wrapper composition, DnD, stable Plite DOM path
  ownership, and the exact benchmark runner selected by causal evidence.
- Generated registry JSON is updated only from its source changelog entry;
  `templates/**` and registry build output remain untouched.
- Browser claim width is local Chromium because the in-app Browser connector is
  unavailable; no cross-browser or shipped-state claim is made.

Output budget strategy:
- Large traces remain in `docs/plans/artifacts/5064-homepage-enter-latency/`.
  The plan records only causal packets, final aggregate metrics, and decisions.

Blocked condition:
- The run would block only if the exact current/main hosts, trusted Enter oracle,
  or final browser replay could not be made current. All encountered host and
  harness defects were repaired.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | ref `1fb72c…`; source `f8d6e785…` | commit `2f87593…` | artifact: `final-summary.json` and `main-*.json` |
| lockfile / package manager | candidate lock; pnpm 9.15.0; Bun 1.3.12; Node 22.22.1 | exact main lock; same pnpm/Node binaries | artifact: `main-2.json` |
| build mode / host / port | fresh source-built www on port 3061 | isolated source-built main on port 3026 | artifact: `main-recheck-1.json` |
| browser / machine / viewport / DPR | Chromium 137; macOS arm64; 800x600; DPR 1 | identical browser, machine, viewport, and DPR | artifact: `final-summary.json` |
| route / fixture / document / plugins | `/`; real homepage Playground composition | `/`; main homepage Playground composition | artifact: `candidate-red-1.json` and `main-2.json` |
| setup / action / DOM strategy | settled heading caret; trusted Enter; mutation plus second paint; reset outside timing | identical semantic setup/action/measurement | artifact: `final-demand-dnd-nodekey-discussion-3.json` |
| warmups / samples / interleave order | 5 warmups + 20 measurements in each of 5 final packets | 5 warmups + 20 measurements in repeated main packets | artifact: `final-summary.json` |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Requirements captured | yes | Exact issue, durable-fix bias, all lanes, comment boundary, and exclusions were recorded before measurement. |
| Benchmark methodology loaded | yes | Benchmark source and methodology were read completely. |
| Source identities fixed | yes | Candidate ref/fingerprint and isolated main commit are recorded above. |
| Exact oracle ready | yes | Trusted Enter asserts structure, commit, focus, both carets, table survival, and runtime errors. |
| Default lanes inventoried | yes | All nine ordered rows are resolved below. |

Work Checklist:
- [x] Record every explicit scope, comparison, stop condition, deliverable, and
      success criterion before measurement.
- [x] Prove comparable current/main source, host, fixture, action, browser, and
      sample identities.
- [x] Repair the character-only harness so it measures trusted Enter exactly.
- [x] Stop at the first proven owner, select the durable architecture, and
      reject interventions that merely move or hide the cost.
- [x] Fix one owner, rerun the exact benchmark and correctness oracle, then
      resume relevant breadth.
- [x] Record every causal packet as kept, invalidated, or reverted.
- [x] Preserve package behavior with focused tests, typechecks, barrels,
      changesets, and exact browser stability.
- [x] Record local-only claim limits and the next integration owner.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | Trusted Enter harness, source fingerprints, and fresh isolated hosts passed. | closed |
| 2 | current-vs-main-product-smoke | yes | complete | Candidate red p95 376/417 ms versus main about 70/72 ms proved a material product regression. | closed after final relative gate |
| 3 | plate-vs-plite-decomposition | yes | complete | Raw Plite rich-text Enter measured 6.9 ms mean and 7.6 ms mutation p95; Plate composition owned the gap. | closed |
| 4 | owner-microbench-and-trace | yes | complete | Removing the DnD wrapper collapsed the gap; selective interventions isolated eager per-block DnD UI/runtime work. | closed with kept cause |
| 5 | product-mount-matrix | no | N/A: inapplicable - #5064 reports settled editing latency and the proven intervention changes dormant interaction work, not editor construction | Fresh-host readiness remains the mount safety check. | closed |
| 6 | trusted-editing-matrix | yes | complete | Five final packets preserved every trusted Enter oracle; ordinary follow-up editing after real DnD also passed 5/5. | closed |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - raw Plite was already far below the product budget and the cause was Plate-only DnD composition | Slate cannot explain an owner absent from both raw editors. | closed |
| 8 | example-breadth | yes | complete | Homepage and standalone Playground packets reproduced the composition cost; DnD exact behavior passed on the homepage. | closed |
| 9 | large-and-stress | no | N/A: inapplicable - the user explicitly excluded huge documents and #5064 is the normal 34-block homepage fixture | The normal repeated-block fixture exercised per-block scaling. | closed |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: closed and preserved in Cause History
- lane: N/A: closed and preserved in Cause History
- comparable-baseline: N/A: closed and preserved in Cause History
- material-delta: N/A: closed and preserved in Cause History
- isolated-owner: N/A: closed and preserved in Cause History
- causal-intervention: N/A: closed and preserved in Cause History
- correctness-guard-result: N/A: closed and preserved in Cause History
- fix-class: N/A: closed and preserved in Cause History
- long-term-target: N/A: closed and preserved in Cause History
- decision-owner: N/A: closed and preserved in Cause History
- layer-plan: N/A: closed and preserved in Cause History
- compatibility-verdict: N/A: closed and preserved in Cause History
- fix-owner: N/A: closed and preserved in Cause History
- benchmark-command: N/A: closed and preserved in Cause History
- benchmark-rerun: N/A: closed and preserved in Cause History
- benchmark-rerun-result: N/A: closed and preserved in Cause History
- correctness-command: N/A: closed and preserved in Cause History
- correctness-rerun: N/A: closed and preserved in Cause History
- correctness-rerun-result: N/A: closed and preserved in Cause History
- resume-lane: N/A: all applicable lanes closed

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| eager-per-block-dnd-runtime | owner-microbench-and-trace | kept | runtime-architecture | Stable block DOM with demand-activated DnD runtime and one root subscription | best-api | plate-plan + plite-plan | hard-cut: wrapper descriptors use `renderPath` and no longer require eager hook factories | benchmark | Removing the DnD wrapper collapsed Enter latency; staged descriptor, prefilter, stable-wrapper, and activation packets localized the repeated cost. | pass: crash-free trusted Enter and its structural/focus/caret oracle were green before optimization | `pnpm --filter www perf:homepage-input -- --action enter --url http://localhost:3061/ --require-browser-handle` | pass: five packets median p95 85/85 ms, below the predeclared 25% relative materiality line versus main; one total long task versus main 5-8 per packet | `PLAYWRIGHT_BASE_URL=http://localhost:3061 pnpm exec playwright test --config=tooling/config/playwright.config.ts tooling/e2e/font-size-selection.test.ts tooling/e2e/table-tab-navigation.test.ts tooling/e2e/block-selection.test.ts tooling/e2e/homepage-dnd.test.ts --project=chromium --workers=1 --repeat-each=5` | pass: 20/20, zero retries, including real DnD followed by edit and selection | `candidate-red-1.json`, `final-demand-dnd-nodekey-discussion-3.json`, and `final-summary.json` |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| enter-harness | source-and-host-readiness | Character typing was a proxy for Enter. | no product metric | exact trusted Enter oracle green | kept | current/main smoke |
| eager-dnd | owner-microbench-and-trace | Every rendered block eagerly mounted DnD hooks, subscriptions, refs, toolbar, and tooltip. | candidate red 330/370 ms mean; removing wrapper restored near-main timing | Enter oracle green | kept cause | durable demand activation |
| selector/path experiments | owner-microbench-and-trace | Selection source, element index, or path subscriptions were primary. | partial or unstable movement | correctness stayed green | invalidated | retain only independently valuable node-key index work |
| demand-driven-dnd | trusted-editing-matrix | Stable lightweight DOM plus preactivated targets removes idle cost without breaking drag. | final median p95 85/85 ms versus main about 70/72 ms | 20/20 browser stability | kept | local handoff |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| initial trusted Enter | 20 | main p50 56-58; p95 70-73 | red p50 326; p95 376 mutation / 417 paint | about +305/+345 ms p95; material | conclusive across semantic-equivalent hosts | `candidate-red-1.json`, `main-2.json` |
| final trusted Enter | 5x20 | recent main p50 56/56; p95 70/72 | median packet p50 68/64; p95 85/85 | +15/+13 ms p95; about +22%/+18%, below dual materiality gate | five packets; zero runtime errors; one candidate long task versus 5-8 main | `final-summary.json` |
| raw Plite control | 20 | N/A: decomposition control | p50 6.7; p95 7.6 mutation | proves Plate composition, not raw Plite, owns the product gap | conclusive owner boundary | `plite-richtext-1.json` |

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Named threshold | yes | Exact correctness passed; final relative delta stayed below the predeclared dual materiality rule; invalid absolute host budgets were rejected against main. |
| Every applicable lane closed | yes | All nine rows are complete or evidence-backed inapplicable. |
| Exact benchmark rerun | yes | Five packets of 20 trusted Enter samples are summarized in `final-summary.json`. |
| Browser correctness | yes | Fresh source-built Chromium passed all four exact cases 5/5, 20/20 total, without retries. |
| Final source identity | yes | Final benchmark-owned source fingerprint is `f8d6e785…` on base ref `1fb72c…`. |
| Durable architecture | yes | Best API plus Plate/Plite layer planning selected descriptor prefiltering, stable DOM, demand DnD activation, root subscription, and live DOM path repair. |
| Package/type/barrel proof | yes | Core 5, DnD 20, Table 35, Selection 88, Plite React 1063 tests passed; scoped typechecks and Core/DnD barrels passed. |
| Changesets/changelog | yes | DnD caller-ref and Plite live-path changesets plus the demand-driven DnD registry changelog source are present. |
| Agent workflow sync | no | N/A: no agent source changed in this benchmark packet. |
| Lint | no | N/A: user explicitly prohibited lint during this session. |
| Autoreview | no | N/A: user explicitly prohibited Autoreview during this session. |
| Final validators | yes | Benchmark `--complete` and both Autogoal checks are the closeout commands. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | completed | Exact action, identities, gates, and all lanes recorded. | closed |
| Ordered diagnosis | completed | Raw Plite and causal interventions isolated eager Plate DnD work. | closed |
| Fix and exact rerun | completed | Durable demand-activation architecture passed benchmark and correctness reruns. | closed |
| Remaining breadth | completed | Relevant editing/example breadth closed; unrelated lanes have concrete N/A reasons. | closed |
| Review and closeout | completed | Typechecks, barrels, changesets, changelog, stability, and local claim limits resolved. | validators and issue comment |

Findings:
- The reporter-visible lag was real: the current candidate initially measured
  roughly 330 ms mutation mean and 370 ms second-paint mean.
- Raw Plite Enter was about 7 ms. The dominant cost came from Plate rendering
  every block through eager DnD hook/UI machinery, not from Plite editing.
- Stable lightweight block wrappers plus demand-activated DnD runtimes remove
  the dangerous repeated work. One root subscription replaces per-block global
  DnD state subscriptions.
- Real drag exposed stale declarative DOM paths after a move. Plite React now
  repairs the live node path after external rerenders, so moved blocks remain
  editable.

Decisions and tradeoffs:
- Keep the new wrapper descriptor API and `renderPath` hard cut. It lets cheap,
  hook-free eligibility run before expensive wrapper composition.
- Keep caller-owned refs in `useDraggable`; it enables stable outer DOM while
  the runtime mounts only during interaction.
- Reject “remove DnD,” eager static toolbar controls, cached path authority,
  and per-block store subscriptions. Each either breaks behavior or retains the
  repeated cost.

Harness/methodology repairs:
- Added exact trusted Enter support to the existing homepage runner instead of
  creating another target.
- Final closure compares against what `main` can actually achieve on the same
  host; impossible absolute budgets are diagnostic mistakes, not product law.

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
|---|---|---|---|
| Root Node could not resolve Puppeteer | 1 | Run through the www dependency context. | repaired |
| Cached node path became stale after DnD | 1 | Keep editor key lookup authoritative and repair declarative DOM attributes after render. | exact DnD/edit proof passed |
| Lightweight button collapsed the selectable gutter width | 1 | Preserve a stable 22px selectable gutter hit area. | #5088 exact replay passed 5/5 |

Verification evidence:
- Final metrics: median mutation mean/p50/p95 67.1/68.3/85.0 ms and second
  paint 64.8/63.7/85.0 ms across five 20-sample packets; zero runtime errors.
- Recent main: mutation 60.1/56.1/69.7 ms and second paint 58.9/55.7/71.8 ms.
- Final browser replay: 20/20 on a freshly restarted source-built www host.
- Package proof: Core 5, DnD 20, Table 35, Selection 88, Plite React 1063.
- `pnpm --filter www typecheck`, all scoped package typechecks, and Core/DnD
  barrel checks passed. Lint and Autoreview were intentionally not run.

Final handoff contract:
- status: locally completed, uncommitted, unpushed, not integrated or shipped
- first conclusive cause: eager per-block Plate DnD runtime/UI composition
- durable owner: Core wrapper descriptor contract, DnD caller-owned refs,
  demand-driven registry DnD, and Plite React live path repair
- next owner: commit/push integration and pushed-ref replay before any public
  `completed` label or shipped claim

Timeline:
- 2026-08-20: exact Enter harness and comparable current/main hosts established.
- 2026-08-20: Plate/Plite decomposition and causal interventions isolated DnD.
- 2026-08-20: durable architecture implemented; benchmark, browser, package,
  type, and barrel closure passed.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | local benchmark closure complete |
| Where am I going? | issue comments, then pushed-ref replay by the integration owner |
| What is the goal? | remove #5064's Enter lag without hiding or breaking editor behavior |
| What have I learned? | eager per-block DnD UI/runtime work caused the regression; raw Plite did not |
| What have I done? | implemented demand activation, repaired moved-node DOM paths, and proved the final packet |

Open risks:
- The fixes are uncommitted and unpushed. Public completion and shipped-state
  claims remain forbidden until exact pushed-ref replay.
- Chromium is the only browser used for this local claim because the in-app
  Browser connector was unavailable.
