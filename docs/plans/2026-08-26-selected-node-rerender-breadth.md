# selected-node rerender breadth

Objective:
Identify selected-node rerender causes on /view/editor-ai; done when at least
90% of added commits are causally attributed across five profiles and the
failed-fix proof repair passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-selected-node-rerender-breadth.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: The reporter confirms the first highlight fix is much better but
  selecting many nodes on /view/editor-ai still triggers many rerenders; find
  every material cause and consider React Doctor.
- scope: Exact selected-state drag on /view/editor-ai, from first selected node
  through a large selected set. Diagnose only; no second product patch before
  the mandatory failed-fix repair and architecture checkpoint.
- invocation: `$benchmark selected-node rerender breadth`
- candidate-identity: ref: HEAD
  `d282fd8a33affb40d2b60103b6c1ce370140d2eb`; NodeSelection SHA-256
  `5d360bdb177b5c6ccdebec6850c228584b169d1fab64b2f8c014df345ba6e62e`.
- plate-main-identity: ref: origin/main
  `cce36d378b2f1e5c775dafe1a67c2215165c982c`; it lacks the exact component.
- plite-identity: ref: HEAD
  `d282fd8a33affb40d2b60103b6c1ce370140d2eb`.
- slate-identity: N/A: Slate has no matched node-selection UI.
- named-symptom: The exact route still paints widespread React rerender
  overlays as the selected node count grows.
- final-artifacts: artifact: this plan contains the exact-route React Doctor
  runtime inventory; supporting static output is
  `/tmp/plate-react-doctor-performance.json`; focused NodeSelection unit and
  Chromium behavior results are recorded below

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
- requested duration: N/A: none requested
- semantics: N/A: no timebox
- start / deadline: N/A: no timebox
- final loop closure: finish exact-route attribution and workflow repair before
  any product implementation plan

Completion threshold:
- Five retry-free exact-route profiles use the same gesture and report
  component render/commit counts before selection and while expanding to the
  same large selected set.
- Causal probes account for at least 90% of the added selected-state
  render/commit work by component family; unresolved work is named, measured,
  and routed.
- React Doctor findings are classified as causal, supporting, proof debt, or
  false alarm against runtime evidence.
- The failed-fix Regression repair adds executable workflow proof that a
  reporter-visible rerender claim cannot close on a narrow owner proxy alone.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`, manual P1 review passes
  because `autoreview` is forbidden on `next`, and the Autogoal checker passes.

Verification surface:
- benchmark commands / artifacts: exact-route React runtime profiler/component
  inventory, five selected packets, and five matched controls.
- correctness commands: existing NodeSelection unit and Chromium behavior rows.
- Browser / Chrome / device proof: in-app Browser for route state; repository
  Chromium or injected React instrumentation for repeatable counts.
- source/ref/fingerprint proof: exact HEAD/main, lock, runtime source, route
  composition, profiler harness, and React Doctor version.

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
- allowed runtime/packages/apps: read-only Plate/Plite/runtime composition
  diagnosis; Regression source rule/test only for the mandatory proof repair.
- allowed benchmark/tests/fixtures: /view/editor-ai, current NodeSelection
  tests, temporary local instrumentation deleted after evidence capture.
- allowed baseline checkouts/hosts: current localhost candidate and read-only
  origin/main source context.
- non-goals: product optimization, public API changes, commits, pushes, PRs,
  release work, generated registry edits, or table behavior changes.

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- Stop only if the exact route cannot hydrate after one bounded dependency/host
  repair, React component work cannot be instrumented repeatably, or attribution
  requires a product edit before the mandatory architecture checkpoint.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | HEAD `d282fd8a…`; NodeSelection `5d360bdb…` | same current bytes for every selected/control packet | artifact: exact hashes above |
| lockfile / package manager | lock `ea62ed87…`; pnpm 9.15; Node 22.22.1 | same | artifact: unchanged lock fingerprint |
| build mode / host / port | source-first Next dev host at localhost:3000 | same hydrated host per packet | artifact: Browser loaded the exact route after the current product bytes |
| browser / machine / viewport / DPR | in-app Browser Chromium; Apple M5 Max; 1280x720; DPR 1 | same | artifact: five selected packets and five matched gutter controls |
| route / fixture / document / plugins | /view/editor-ai; exact current composition | same | artifact: reporter route and current source |
| setup / action / DOM strategy | clear node selection, pointer-down at editor padding, then 14 paced moves across 10 blocks and release | same duration/path, ending in the left gutter before any block intersection | artifact: React Doctor runtime component events plus 10 visible highlights |
| warmups / samples / interleave order | one warmup; five retry-free selected packets | five matched controls on the same host | artifact: packet ledger below |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | reporter contradiction, exact route, React Doctor request, diagnosis boundary, and threshold recorded |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `benchmark` source and methodology read | yes | Benchmark and methodology read completely |
| Active goal checked or created | yes | active goal points to this plan |
| Candidate and baseline identities recorded | yes | exact refs and source/lock fingerprints above |
| Target/runner discovery completed from current source | yes | NodeSelectionHighlight owner, Editor composition, core/browser rows, and React Doctor dependency found |
| Host/build/fixture freshness proved | yes | exact route hydrated at localhost:3000; title `An AI editor - Plate`; current source was loaded before capture |
| Correctness oracle identified | yes | focused NodeSelection and existing Chromium contracts |
| All default lanes inventoried | yes | applicability resolved below |
| `only` narrowing explicitly authorized or N/A | no | N/A: normal scoped run retains all applicable lanes |
| Browser/native proof strategy selected | yes | Browser route inspection plus repeatable Chromium instrumentation |
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
- [x] A proven cause paused product edits; diagnosis resumed only after source tracing.
- [x] Every proven cause records its fix class, best long-term target, decision
      owner, layer plan, compatibility verdict, and implementation owner.
- [x] `public-api` and `runtime-architecture` causes run `best-api`, then
      `plite-plan`, `plate-plan`, or both before implementation. Broad accepted
      execution may use `auto`; target selection may not.
- [x] No product owner was changed in this diagnosis-only packet, so an exact
      post-fix benchmark is not applicable.
- [x] Failed reruns invalidate or continue the same cause; they do not skip to
      a different green metric.
- [x] The workflow-repair reruns were green before runtime breadth resumed.
- [x] Every packet has keep/revert/invalidate/quarantine/defer and next-owner
      evidence.
- [x] Harness/metric/host defects are repaired before product optimization.
- [x] Failed-fix repair updates the Regression source rule and executable
      workflow contract, then passes source/generated parity.
- [x] Exact-route component-family counts cover at least 90% of added render
      samples
      across five retry-free profiles.
- [x] React Doctor findings are classified against measured runtime evidence.
- [x] Final handoff reports candidate/baseline identities, lane status, first
      conclusive cause, metrics, fix/reruns, resumed breadth, and residual risk.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | exact identities, hydrated route, viewport, probe source, and matched gesture recorded | none |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - origin/main lacks the exact component | no behavior-equivalent product baseline | none |
| 3 | plate-vs-plite-decomposition | yes | complete | repeated work splits into Plate registry subscribers, expected Core selection visuals, and the Plite React commit fence | none |
| 4 | owner-microbench-and-trace | yes | complete | five selected packets, five controls, and one commit-cluster trace attribute 99.24% of positive added samples | none |
| 5 | product-mount-matrix | no | N/A: inapplicable - symptom starts after selection | reporter says initial route is responsive | none |
| 6 | trusted-editing-matrix | yes | complete | 8/8 NodeSelection unit tests and the Chromium focus/clipboard/input/delete/undo row passed | none |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - Slate has no matched UI | no comparable action | none |
| 8 | example-breadth | yes | complete | exact feature-heavy `/view/editor-ai` route profiled; standalone node-selection behavior remains green | none |
| 9 | large-and-stress | yes | complete | each selected packet reached 10 visible highlights; the matched zero-highlight gutter control isolates selection growth | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: cause history is closed; no product fix is active
- lane: N/A: all applicable diagnostic lanes are complete
- comparable-baseline: N/A: no active cause; closed comparisons are in Cause History
- material-delta: N/A: no active cause; closed deltas are in Cause History
- isolated-owner: N/A: every material family is routed in Cause History
- causal-intervention: N/A: diagnosis-only boundary forbids a second product attempt
- correctness-guard-result: N/A: no active cause
- fix-class: N/A: no product fix in this packet
- long-term-target: N/A: recorded per cause below
- decision-owner: N/A: no active cause
- layer-plan: N/A: no active cause
- compatibility-verdict: N/A: no active cause
- fix-owner: N/A: no active cause
- benchmark-command: N/A: no active cause
- benchmark-rerun: N/A: no product fix in this packet
- benchmark-rerun-result: N/A: no product fix in this packet
- correctness-command: N/A: no active cause
- correctness-rerun: N/A: no active cause
- correctness-rerun-result: N/A: no active cause
- resume-lane: N/A: all diagnostic breadth completed

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TOC-001 | owner-microbench-and-trace | deferred | internal-implementation | Keep `read.headings()` pure; make the registry selector document-scoped and structurally equal | benchmark | N/A: internal registry implementation | N/A: no public API change | Plate UI | `TocElement` and its seven buttons recur in every selection commit because the selector returns a fresh array on every editor commit | pass: current selection behavior is green | exact-route React Doctor runtime probe | pass: 80 positive samples, 30.30%, 18.6ms | focused Core unit and Chromium node selection | pass: 8/8 unit and 1/1 Chromium | `toc.tsx:46-48,125-136`; `BaseTocPlugin.ts:48-81`; runtime-state ref equality and every-commit subscription |
| LINK-001 | owner-microbench-and-trace | deferred | internal-implementation | Derive collapsed link `NodeKey | null`; do not subscribe the closed toolbar to the complete Range | benchmark | N/A: internal registry implementation | N/A: no public API change | Plate UI | `LinkFloatingToolbar` appears in every selection commit and its effect depends on the changing Range | pass: current selection behavior is green | exact-route React Doctor runtime probe | pass: 33 positive samples, 12.50%, 5.5ms | focused Core unit and Chromium node selection | pass: 8/8 unit and 1/1 Chromium | `link.tsx:289,333-354` |
| NODE-VIS-001 | owner-microbench-and-trace | kept | internal-implementation | Current equality-filtered selected-node highlight primitive | benchmark | N/A: existing Core React implementation | N/A: no public API change in this packet | Core React | selected-set changes produce the expected highlight and portal work only for selected nodes | pass: current selection behavior is green | exact-route React Doctor runtime probe | pass: 52 positive samples, 19.70%, 11.0ms; 10 visible highlights | focused Core unit and Chromium node selection | pass: 8/8 unit and 1/1 Chromium | `NodeSelection.tsx:25-42,123-170` |
| TOOLBAR-001 | owner-microbench-and-trace | deferred | internal-implementation | Group text-only toolbar controls at their shared registry parent only if still material | benchmark | N/A: internal registry composition | N/A: no public API change | Plate UI | the first text-to-node-selection transition flips toolbar state and traverses the Radix/button subtree | pass: current selection behavior is green | exact-route React Doctor runtime probe | pass: 82 positive samples, 31.06%, 7.6ms total, about 1.5ms per profile | focused Core unit and Chromium node selection | pass: 8/8 unit and 1/1 Chromium | `floating-toolbar.tsx:123-132` plus commit-cluster trace |
| FENCE-001 | owner-microbench-and-trace | kept | internal-implementation | One fence update per editor commit until a separate benchmark proves safe bypass | benchmark | N/A: existing Plite React implementation | N/A: no public API change in this packet | Plite React | `useSyncExternalStore` intentionally tracks `lastCommit().version` | pass: current selection behavior is green | exact-route React Doctor runtime probe | pass: 15 positive samples, 5.68%, 1.6ms | focused Core unit and Chromium node selection | pass: 8/8 unit and 1/1 Chromium | `editable-dom-commit-fence.tsx:47-78` |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| RUNTIME-SELECTED | owner trace | exact selected-state drag exposes every repeated family | 377 Bippy / 924 native samples, 59.1ms Bippy self time, 10 highlights | no runtime errors; no long animation frames | keep as reporter oracle | compare with gutter control |
| RUNTIME-CONTROL | owner trace | same-duration gutter drag removes node-selection work | 131 Bippy / 384 native samples, 16.5ms Bippy self time, 0 highlights | same route and host | keep as matched control | compute positive deltas |
| STATIC-DOCTOR | source scan | static findings identify the regression | 48 generic findings; zero in causal owners | N/A | false alarm for this regression | use runtime probe |
| RUNTIME-DOCTOR | owner trace | current React Doctor runtime probe names repeated components | 262 of 264 positive added samples assigned to known families | exact route and five profiles | causal/supporting | route owners |
| WORKFLOW-REPAIR | harness | narrow wrapper proof can falsely close a route-wide rerender report | Regression and Benchmark contracts red before sync, green after source/mirror sync | contract suites and parity green | keep | no product edit |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| exact-route Bippy render samples | 5 control + 5 selected | 26 / N/A / N/A / N/A / 30 | 77 / N/A / N/A / N/A / 79 | +51 / +196% median | stable 23-30 versus 69-79; five samples do not support tail percentiles | React Doctor runtime probe |
| exact-route Bippy self time | 5 control + 5 selected | 3.1ms / N/A / N/A / N/A / 3.9ms | 12.0ms / N/A / N/A / N/A / 12.3ms | +8.9ms / +287% median | self time avoids native hierarchy double-counting | React Doctor runtime probe |
| exact-route native component track | 5 control + 5 selected | 79 / N/A / N/A / N/A / 84 | 184 / N/A / N/A / N/A / 194 | +105 / +133% median | supporting only; durations are inclusive | React Doctor runtime probe |
| long animation frames | 5 selected | 0 / N/A / N/A / N/A / 0 | 0 / N/A / N/A / N/A / 0 | 0 | the report is real render churn, not a proven long-frame stall at 10 nodes | PerformanceObserver through runtime probe |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Attribute at least 90% across five exact profiles and prove correctness | 262/264 = 99.24%; focused unit and Chromium behavior green |
| Benchmark plan structural validation | yes | Run the benchmark validator | structurally valid |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | lane table has no open applicable row |
| Exact post-fix benchmark reruns | no | N/A: no product fix was authorized or applied | diagnosis-only packet |
| Correctness/native behavior reruns | yes | Run focused package and Chromium behavior proof | 8/8 unit and 1/1 browser row passed |
| Final source/host identity | yes | Recheck exact product bytes and runtime source | HEAD `d282fd8a…`; Core `5d360bdb…`; lock `ea62ed87…`; probe `8ba1fa1e…` |
| Benchmark target/metric honesty | yes | Verify source, fixture, sample math, aggregation, and provenance | exact route/control signature and positive-delta denominator recorded |
| Durable fix decision | yes | Run Best API and Plate Plan target review | cut broad registry subscriptions; keep visible/runtime laws; no new public API |
| Package/type/build proof | no | N/A: no package product source changed | focused tests cover existing behavior |
| Browser surface proof | yes | Run the exact route in Browser | five 10-highlight selected packets and five zero-highlight controls captured |
| Changeset/release artifact | no | N/A: no published behavior or API changed | none |
| Agent rule/skill sync | yes | Sync generated skill mirrors and prove parity | `pnpm install`, both contract suites, and resource parity passed |
| Benchmark plan complete validation | yes | Run validator with `--complete` | complete |
| Final lint | yes | Run a scoped formatting/diff check | scoped worktree/staged `git diff --check` and both `node --check` commands passed |
| Timed checkpoint | no | N/A: no duration requested | none |
| P1 autoreview | yes | Review changed workflow source without invoking forbidden `autoreview` on `next` | manual P1 plus agent-native review completed |
| Goal plan complete | yes | Run the Autogoal completion checker | complete |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | exact identities, route, gesture, control, and success threshold | none |
| Ordered diagnosis | complete | five profiles plus family attribution | none |
| Fix and exact rerun | N/A | no product fix in diagnosis-only scope; workflow repair reruns are green | none |
| Remaining breadth | complete | correctness, route stress, Plate/Core/Plite decomposition | none |
| Review and closeout | complete | Best API, Plate Plan, manual P1, validators, and goal checker | final response |

Findings:
- Reporter contradiction invalidates the earlier route-wide completion claim.
  The prior evidence proved only that NodeSelectionHighlight commits fell from
  20 to 10; it did not count editor-node or provider rerenders on the exact
  route.
- The exact reporter gesture is measurably noisier than a matched gutter drag:
  median Bippy render samples rise from 26 to 77 and median Bippy self time
  rises from 3.1ms to 12.0ms. Ten selected highlights remain visible after each
  gesture. No long animation frame was observed, so this proves broad render
  churn rather than a long-frame stall at this document size.
- React Doctor runtime attribution covers 262 of 264 positive added samples,
  or 99.24%:

  | Family | Added samples | Share | Positive self time | Verdict |
  |---|---:|---:|---:|---|
  | floating-toolbar transition | 82 | 31.06% | 7.6ms | real but first-transition-only; defer |
  | TOC selector and descendants | 80 | 30.30% | 18.6ms | largest repeated waste; fix first |
  | node-selection visuals | 52 | 19.70% | 11.0ms | required visible work; keep |
  | link selection subscriber | 33 | 12.50% | 5.5ms | repeated closed-toolbar waste; fix second |
  | editable DOM commit fence | 15 | 5.68% | 1.6ms | hard runtime owner; keep |
  | anonymous remainder | 2 | 0.76% | 0.2ms | below threshold |

- `TocElement` is the ugliest bug. `useEditorSelector` defaults to reference
  equality and subscribes to every commit. `read.headings()` allocates a new
  array, so every selection commit rerenders the TOC, its seven buttons, and
  wrapper elements even though the document did not change.
- `LinkFloatingToolbar` uses the complete deeply-equal Range as an effect
  dependency. Every genuine drag-step Range change rerenders a toolbar that is
  closed for node selection and reruns both floating hook trees.
- `NodeSelectionHighlight` is no longer the broad culprit. Its selected-node
  equality and commit filter limit it to actual selection-set/structural work.
  Its portal cost is expected and bounded by the 10 visible selected nodes.
- `EditableDOMCommitFence` intentionally follows editor commit versions to
  bracket DOM projection. Its small update is architectural correctness work,
  not a registry subscription leak.
- The toolbar subtree churn occurs when the state first crosses from text/no
  selection to node selection. It does not repeat as the primary TOC/link
  subscriptions do and costs about 1.5ms of positive self time per profile.
- React Doctor's Oxlint plugin is already installed at 0.9.12. The upstream
  repository is cloned locally at
  `79d80072817eb86c74f3dd42ce91c8104f448810`; its current CLI is 0.9.12 and
  includes an exact-route runtime scan in addition to static analysis.
- React Doctor static analysis produced 48 generic findings in 28 files and
  zero findings in the causal owners. Static output is a false alarm/noise for
  this report. The current upstream runtime probe is the useful part.

Decisions and tradeoffs:
- Diagnose only in this goal. A second product attempt is blocked on the
  mandatory failed-fix workflow repair and, because per-node hot work is an
  architecture trigger, Best API plus Plate Plan after causal attribution.
- Harsh API verdict: add nothing public. A new selection hook, TOC hook,
  heading-cache contract, toolbar state namespace, or Plite primitive would be
  API sludge hiding two bad registry subscriptions.
- First implementation slice: keep `read.headings()` as a pure query and make
  `TocElement` update only for document commits, with structural heading-list
  equality. This belongs in copied Plate registry UI, not Plite or Core.
- Second implementation slice: replace `LinkFloatingToolbar`'s complete Range
  subscription with a selector for the collapsed link identity
  (`NodeKey | null`). Keep `useEditorSelection` because exact Range consumers
  still need its truthful contract; this caller is simply using it at the wrong
  granularity.
- Keep `NodeSelectionHighlight` and `EditableDOMCommitFence`. They each have an
  independent visible or runtime job and passed the hard-cut counterfactual.
- Defer toolbar transition work until the two repeated subscription cuts are
  rerun on this exact route. If still material, group text-only controls at the
  shared registry parent. Do not create another public toolbar state API.

Harness/methodology repairs:
- Completed repair-now: Regression and Benchmark source rules now require an
  exact-route phase-specific repeated-component inventory, every family above
  5%, and at least 90% overall attribution. A narrow wrapper metric cannot
  authorize route-wide completion.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| First workflow contract run found generated skill parity red | 1 | run the required source-to-mirror sync | `pnpm install` synced mirrors; both contract suites and resource parity passed |
| Direct React Doctor CLI scan could not control its isolated Chrome reliably | 1 | inject the exact built upstream runtime probe through Browser CDP | exact-route component events captured repeatably |
| First standalone-route probe gesture ended as text selection and was not behavior-comparable | 1 | reject it as performance evidence and use the repository's trusted Chromium node-selection row for breadth | 1/1 behavior row passed; exact performance claims remain scoped to `/view/editor-ai` |
| Package wrapper treated `NodeSelection` as a test path and matched no file | 1 | invoke Bun with the exact spec path | 8/8 tests passed |
| Oxfmt ignored the selected agent/plan paths and checked no target | 1 | use scoped worktree/staged whitespace checks plus Node syntax checks | both `git diff --check` commands and both `node --check` commands passed |

Verification evidence:
- `node --test --test-reporter=dot .agents/rules/regression/scripts/test-first-contract.test.mjs .agents/rules/regression/scripts/validate-regression-plan.test.mjs .agents/skills/regression/scripts/test-first-contract.test.mjs`: passed.
- `node --test --test-reporter=dot .agents/rules/benchmark/scripts/benchmark-contract.test.mjs .agents/skills/benchmark/scripts/benchmark-contract.test.mjs`: passed.
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`: exact.
- Agent-native review: PASS; user action routes to Benchmark, source owners are
  rule files, generated skills are exact, and executable proof is discoverable.
- Five exact-route selected packets: Bippy 79/77/75/77/69; native
  194/184/188/183/175; 10 highlights each; elapsed 974.2-1006.1ms; zero long
  animation frames.
- Five matched gutter controls: Bippy 26/30/26/23/26; native
  81/71/79/84/69; zero highlights; elapsed 972.1-1047.7ms.
- `bun test packages/core/src/react/components/NodeSelection.spec.tsx`: 8
  passed, 0 failed.
- `pnpm e2e tooling/e2e/node-selection.test.ts --project=chromium`: 1 passed.
- React Doctor static artifact: version 0.9.12, 48 diagnostics, zero in the
  causal owner files.
- Final identities: HEAD
  `d282fd8a33affb40d2b60103b6c1ce370140d2eb`; origin/main
  `cce36d378b2f1e5c775dafe1a67c2215165c982c`; Core selection
  `5d360bdb177b5c6ccdebec6850c228584b169d1fab64b2f8c014df345ba6e62e`;
  lock
  `ea62ed870ad5f17d0f37b65285d7bddc819184f8245dc5f9d5e2c76eee7d7c5d`;
  React Doctor probe
  `8ba1fa1e7a558e876878872c58681e42cda4be0d128996d2fa3a7a5c4c7476c7`.
- Benchmark structural and `--complete` validation passed.
- Autogoal completion check passed.
- Scoped worktree/staged `git diff --check` and Node syntax checks passed.

Final handoff contract:
- goal plan / scope: diagnosis and proof-workflow repair complete; no product
  optimization applied
- candidate / baseline identities: current exact-route bytes versus matched
  same-route gutter control
- completed / N/A lanes: all applicable lanes complete; product-mount,
  main-product, and Slate comparison lanes are inapplicable
- first conclusive cause: TOC every-commit fresh-array selector
- baseline / latest / best metrics: median 26 versus 77 Bippy samples and 3.1ms
  versus 12.0ms Bippy self time
- fix owner / changed files: future product work belongs to Plate registry UI;
  this packet changed only the Benchmark/Regression proof workflow and this plan
- exact benchmark and correctness reruns: no product rerun applies; workflow
  contracts, 8 unit tests, and 1 Chromium row are green
- resumed breadth: Plate/Core/Plite attribution, exact-route stress, and
  standalone behavior proof complete
- packet decisions: cut TOC/link broad subscriptions; keep selection visuals
  and commit fence; defer one-off toolbar work
- harness/methodology repairs: exact-route repeated-family inventory, every
  family above 5%, and at least 90% attribution are required for rerender claims
- residual claim limits / next owner: no claim about long-frame latency or
  larger documents; Plate UI implementation must rerun this exact five-packet
  benchmark before closure

Timeline:
- 2026-08-26T17:51:58.164Z Benchmark goal plan created.
- 2026-08-26T17:54Z Reporter contradiction recorded; prior route-wide green
  invalidated; current identities and lane applicability resolved.
- 2026-08-26T18:02Z Regression and Benchmark false-green contracts repaired,
  synced, tested, and agent-native reviewed.
- 2026-08-26T18:26Z Current React Doctor runtime probe attached to the exact
  route; five selected packets and five matched controls captured.
- 2026-08-26T18:35Z Positive added work attributed 99.24%; Best API and Plate
  Plan cut/keep/defer decisions recorded.
- 2026-08-26T18:46Z Focused Core unit and Chromium behavior guards passed.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Review and closeout |
| Where am I going? | Final diagnosis handoff; no product edit in this packet |
| What is the goal? | Attribute at least 90% of selected-state rerenders and repair the false-green proof |
| What have I learned? | TOC and link registry subscriptions are the repeated waste; selection visuals and the commit fence are legitimate work |
| What have I done? | Repaired the route-wide oracle, attributed 99.24% across five profiles, routed every material family, and proved behavior |

Open risks:
- Ten selected nodes do not produce a long animation frame on this machine.
  The user's visible complaint is broad render highlighting; latency at 100+
  selected nodes remains unmeasured.
- Runtime component self time is sampled in a development build and is suited
  to owner attribution, not production latency claims.
- React Doctor dropped older ring-buffer events after the current-window events
  in profiles four and five. Current-window counts remained stable, and the
  five-profile family distribution did not change.
