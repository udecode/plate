# block selection performance

Objective:
Fix block-selection drag jank; done when p95 pointer-to-paint is <16.7 ms with
>=50% reduction, no long tasks, and correctness/browser checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-block-selection-performance.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: Find the culprit behind the recording-backed block-selection drag
  slowdown and fix it.
- scope: The node-selection marquee interaction shown in the 5.058 s recording,
  reproduced on `/blocks/table-demo`; preserve selection correctness.
- invocation: `$benchmark block-selection drag performance` (normal scoped run,
  not `only`)
- candidate-identity: ref: HEAD `d282fd8a33affb40d2b60103b6c1ce370140d2eb`
  plus final SHA-256 `68cacd042e545c2f27d7dd9a83ebdf865af396d0649f465e5d117a1ef514d65b`
  for `packages/core/src/react/components/NodeSelection.tsx`,
  `2421057f52a602ccb53dffc90aec32fc324016ec2b27c84097940eb448f0117c`
  for `packages/core/src/react/components/NodeSelection.spec.tsx`,
  `39ebae4c524dea19a3877b0a642779b6c47f8638a497b11c686d6f3099b69a7e`
  for `apps/www/src/registry/components/editor/floating-toolbar.tsx`, and
  `4c29a864999e9cef853fbdf33de78377ccac3a9bcca56c234881ffa28a8dc454`
  for `apps/www/src/registry/components/editor/floating-toolbar.spec.tsx`, and
  `3613d584461ed28b87364b6766fcb826717f6615868cc862e318cf9c87770318`
  for `tooling/e2e/node-selection.test.ts`.
- plate-main-identity: `cce36d378b2f1e5c775dafe1a67c2215165c982c`;
  the exact component and browser test do not exist on that ref, so it cannot
  serve as a behavior-equivalent product baseline.
- plite-identity: ref: current candidate Plite source at
  `d282fd8a33affb40d2b60103b6c1ce370140d2eb`; selection interface SHA-256
  `6da9fd3cf17d9c15d054c20aef0f73c964fb38bc9d6df4da5f8eb73141f43257`.
- slate-identity: N/A: the marquee is a Plate React/registry UI interaction with
  no matched Slate surface.
- named-symptom: selection rectangle and selected-block paint visibly trail
  the pointer while dragging across the table and neighboring blocks.
- final-artifacts: artifact: this plan contains the five-packet pre/post metrics, focused
  browser proof, scaling proof, and final source/test fingerprints.

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
- final loop closure: complete the current diagnosis/fix/proof packet

Completion threshold:
- On the exact demo drag, at least 60 trusted pointer samples produce
  pointer-to-next-paint p95 <16.7 ms, at least 50% lower than the pre-fix
  candidate, with zero PerformanceObserver long tasks >=50 ms.
- The visible marquee and selected paths follow contraction as well as
  expansion, and the existing node-selection browser contract passes.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`, P1 autoreview passes when
  code changed, and the Autogoal checker passes.

Verification surface:
- benchmark commands / artifacts: exact pre/post browser interaction packets on
  `/blocks/table-demo`, recorded below from the same local host.
- correctness commands: focused node-selection unit/browser tests plus the
  exact existing `tooling/e2e/node-selection.test.ts` contract.
- Browser / Chrome / device proof: in-app Browser trusted marquee drag, DOM
  selection snapshot, console check, and pointer-to-paint sampling.
- source/ref/fingerprint proof: exact HEAD/main refs and SHA-256 fingerprints
  for every changed runtime/test file.

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
- allowed runtime/packages/apps: the literal node-selection UI owner and a
  lower Plate/Plite owner only if measurement proves the cost lives there.
- allowed benchmark/tests/fixtures: existing node-selection demo/tests and one
  focused metric helper or browser row when needed for durable proof.
- allowed baseline checkouts/hosts: read-only `origin/main` source identity;
  candidate pre-fix/post-fix on the same local app host and machine.
- non-goals: table-cell selection semantics, unrelated selection API redesign,
  commits, pushes, PRs, releases, and generated-file hand edits.

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- Stop only if the exact demo cannot run after bounded host repair, trusted
  pointer timing cannot be observed, or the fix requires an unresolved public
  API/runtime-architecture choice rather than an internal implementation edit.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | HEAD `d282fd8a…`; final core SHA `68cacd04…`; toolbar SHA `39ebae4c…` | same live checkout before intervention; `origin/main` is not behavior-equivalent | artifact: exact hashes in Benchmark Source and metric packets below |
| lockfile / package manager | lock SHA `ea62ed87…`; pnpm 9.15.0; Node 22.22.1 | same | artifact: exact local process recorded in Benchmark Source |
| build mode / host / port | Next development host at `http://localhost:3000`; registry regenerated before final proof | same host before/after | artifact: fresh restart and successful exact browser rows recorded below |
| browser / machine / viewport / DPR | Playwright 1.61.0 Chromium; Apple M5 Max; 1280x720; DPR 1 | same | artifact: five packets per side with one worker recorded below |
| route / fixture / document / plugins | `/blocks/table-demo`; exact rendered registry demo | same | artifact: recording and table fixture named in Benchmark Source |
| setup / action / DOM strategy | trusted pointer marquee from blank editor space across table and adjacent blocks | identical | artifact: exact recording-backed browser interaction recorded below |
| warmups / samples / interleave order | >=1 warmup, >=60 pointer samples per packet | pre-fix first, causal intervention, post-fix exact rerun | artifact: fixed same-session sequence recorded in the packet ledger |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | request, scope, threshold, constraints, boundaries, and non-goals above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `benchmark` source and methodology read | yes | `.agents/skills/benchmark/SKILL.md` and `references/methodology.md` read completely |
| Active goal checked or created | yes | active one-shot goal points to this plan |
| Candidate and baseline identities recorded | yes | exact refs and pre-fix source/test hashes above |
| Target/runner discovery completed from current source | yes | owner `node-selection.tsx`; route/test `tooling/e2e/node-selection.test.ts` |
| Host/build/fixture freshness proved | yes | `pnpm --filter www build:registry`, fresh Next restart, and hydrated Playwright rows passed |
| Correctness oracle identified | yes | existing unit contract and `tooling/e2e/node-selection.test.ts` |
| All default lanes inventoried | yes | complete table below with explicit applicability |
| `only` narrowing explicitly authorized or N/A | no | N/A: invocation is a normal scoped Benchmark run |
| Browser/native proof strategy selected | yes | in-app Browser trusted drag and timing instrumentation |
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
| 1 | source-and-host-readiness | yes | complete | localhost host, regenerated registry, warm fixture, trusted pointer samples | none |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - origin/main lacks the exact component and test | origin/main lacks the exact component and test | none |
| 3 | plate-vs-plite-decomposition | yes | complete | Plite selection writes were cheap only when unchanged writes were removed at the Plate controller; React toolbar work was a separate tail cost | none |
| 4 | owner-microbench-and-trace | yes | complete | 5x73 pre/post samples, layout-read counts, DOM commits, and long tasks | none |
| 5 | product-mount-matrix | no | N/A: inapplicable - symptom starts after mount and hydration | symptom starts after mount and hydration | none |
| 6 | trusted-editing-matrix | yes | complete | exact Chromium pointer drag plus clipboard, delete, undo, focus, and native-range assertions passed | none |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - Slate has no matched marquee component/action | Slate has no matched marquee component/action | none |
| 8 | example-breadth | yes | complete | node-selection demo and all four table-selection Chromium rows passed | none |
| 9 | large-and-stress | yes | complete | 100 selectable blocks across 10 separately painted moves perform exactly 100 candidate layout reads | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: resolved cause is retained in Cause History
- lane: N/A: resolved cause is retained in Cause History
- comparable-baseline: N/A: resolved cause is retained in Cause History
- material-delta: N/A: resolved cause is retained in Cause History
- isolated-owner: N/A: resolved cause is retained in Cause History
- causal-intervention: N/A: resolved cause is retained in Cause History
- correctness-guard-result: N/A: resolved cause is retained in Cause History
- fix-class: N/A: resolved cause is retained in Cause History
- long-term-target: N/A: resolved cause is retained in Cause History
- decision-owner: N/A: resolved cause is retained in Cause History
- layer-plan: N/A: resolved cause is retained in Cause History
- compatibility-verdict: N/A: resolved cause is retained in Cause History
- fix-owner: N/A: resolved cause is retained in Cause History
- benchmark-command: N/A: resolved cause is retained in Cause History
- benchmark-rerun: N/A: resolved cause is retained in Cause History
- benchmark-rerun-result: N/A: resolved cause is retained in Cause History
- correctness-command: N/A: resolved cause is retained in Cause History
- correctness-rerun: N/A: resolved cause is retained in Cause History
- correctness-rerun-result: N/A: resolved cause is retained in Cause History
- resume-lane: N/A: all applicable lanes are complete

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BLOCK-SELECT-TOOLBAR | plate-vs-plite-decomposition | kept | internal-implementation | mount the text toolbar only for text selections | benchmark | N/A: internal UI boundary needs no layer plan | N/A: no public contract changed | FloatingToolbar | recording and browser test showed Ask AI during node selection; unmounting it cut worst frames but not the whole p95 | pass: node-set transitions and native selection behavior remained correct | exact toolbar-isolation intervention on the same localhost drag packet | pass: worst DOM max fell from about 40 ms to 19.7 ms | bun test apps/www/src/registry/components/editor/floating-toolbar.spec.tsx | pass: all 3 toolbar unit tests and the browser absence assertion passed | exact node-selection browser row and focused toolbar unit test |
| BLOCK-SELECT-001 | owner-microbench-and-trace | kept | internal-implementation | one core NodeSelection drag controller with one model selection authority | benchmark | N/A: internal implementation needs no layer plan | N/A: exact selection semantics and public props remain unchanged | NodeSelectionDrag | 2,960 layout reads and 72 explicit selection writes for 73 moves; intervention reduced both without changing selection | pass: baseline node-set transitions, contraction, focus, clipboard, delete, and undo were correct | PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm exec playwright test --config tooling/config/playwright.config.ts tooling/e2e/node-selection-perf.tmp.test.ts --project=chromium --repeat-each=5 --workers=1 | pass: 5 of 5 packets met the threshold with 73 trusted moves and zero long tasks | pnpm --filter @platejs/core exec bun test src/react/components/NodeSelection.spec.tsx; bun test apps/www/src/registry/components/editor/floating-toolbar.spec.tsx; PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm exec playwright test --config tooling/config/playwright.config.ts tooling/e2e/node-selection.test.ts --project=chromium --workers=1; PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --dir apps/www exec playwright test --config playwright.config.ts tests/browser/table-selection.spec.ts --project=chromium --workers=1 | pass: 15 tests passed across the named unit and Chromium rows | five pre/post packets and focused commands below |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| P0 | readiness | 127.0.0.1 host blocked assets and never hydrated | invalid | no marquee | invalidate | use localhost and warm fixture |
| P1 | decomposition | text floating toolbar consumes node selection projection | max about 40 ms; toolbar visible | toolbar absence failed | keep fix, continue | isolate remaining repeated work |
| P2 | trace | each pointer frame rereads every selectable rect and republishes equal selection | 2,960 reads; pointer p95 median 1.6 ms | baseline semantics otherwise pass | conclusive cause | repair core controller |
| P3 | exact rerun | cached geometry and exact no-op suppression remove repeated work | 92 reads; pointer p95 0.3 ms | pass | keep | resume breadth |
| P4 | breadth | cached geometry remains correct after scroll and at 100 blocks | 100 reads for 100 blocks across 10 painted moves | pass | keep | close |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| table drag pointer-to-paint | 5 packets x 73 trusted moves | median packet 1.3 / 1.4 / 1.6 / 13.7 / 39.9 ms | every packet 0.1 / 0.2 / 0.3; median p99 8.5; median max 9.4 ms | p95 -1.3 ms / -81.25% | all five candidate p95 values were 0.3 ms; zero long tasks | plan metric packet |
| selection DOM commit | 5 packets x 74-76 commits | median packet 1.9 / 2.0 / 7.3 / 19.9 / 37.0 ms | median packet 0.1 / 0.2 / 4.7 / 9.4 / 15.9 ms | p50 -1.8 ms / -94.7%; p95 -2.6 ms / -35.6% | transition frames remain below 16.7 ms p95; one isolated max 25.1 ms | plan metric packet |
| layout reads | same gesture | 2,960 per packet | 92 per packet | -2,868 / -96.9% | identical in all five candidate packets | instrumented getBoundingClientRect |
| long tasks >=50 ms | same gesture | 0 | 0 | unchanged | all ten packets | PerformanceObserver |
| 100-block repeated-unit proof | 100 blocks x 10 painted moves | prior shape predicts 1,000+ reads | 100 reads | removes pointer-frame multiplier | deterministic unit assertion | NodeSelection.spec.tsx |

### Performance

- applicability: applied
- Vercel rules used: N/A; no extra React primitive was needed
- extra rules used: css-layout-hotpath, effect-subscription-budget, interaction-inp-matrix, repeated-unit-budget
- repeated unit: selectable block per pointer frame
- cohorts: table fixture 46 DOM candidates; stress proof 100 selectable blocks; pathological dynamic layout handled by scroll/resize invalidation
- budgets: one candidate measurement per stable gesture, zero repeated selection publications when paths and direction are unchanged, one root listener set, zero per-block listeners
- React/runtime primitives: imperative transform/size writes for transient marquee motion; selector boundary unmounts text-toolbar work for node selection
- interaction metrics: trusted drag pointer-to-paint and DOM-commit p50/p75/p95/p99/max
- trace/CWV proof: interaction packet only; load CWV is out of scope
- memory tags: one cached candidate entry per mounted selectable block for the gesture lifetime, released on pointer end
- degradation contract: native DOM remains present; selection, clipboard, delete, undo, focus, scroll invalidation, and empty native range are preserved
- dashboard/RUM gap: no production RUM row exists for this local registry interaction
- plan delta: none

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | p95 below 16.7 ms and at least 50% lower | 0.3 ms, -81.25%, zero long tasks |
| Benchmark plan structural validation | yes | run validator | passed |
| Every applicable lane closed | yes | complete or concrete N/A | lane table complete |
| Exact post-fix benchmark reruns | yes | five exact packets | 5/5 passed |
| Correctness/native behavior reruns | yes | named unit and Chromium rows | passed |
| Final source/host identity | yes | final hashes and fresh host | recorded above |
| Benchmark target/metric honesty | yes | trusted moves, warmup, same fixture/action | 365 samples per side |
| Durable fix decision | yes | internal owner and compatibility verdict | recorded above |
| Package/type/build proof | yes | affected Plite check, core typecheck, registry generation, and editor check | passed |
| Browser surface proof | yes | Browser inspection plus executable Chromium proof | Browser CUA did not hydrate reliably; repo Playwright exact route passed |
| Changeset/release artifact | yes | update existing core changeset | single-selection-authority-core.md updated |
| Agent rule/skill sync | no | N/A: no agent source changed | none |
| Benchmark plan complete validation | yes | run validator with --complete | passed |
| Final lint | yes | scoped Ultracite | passed |
| Timed checkpoint | no | N/A: no duration requested | none |
| P1 autoreview | no | N/A: autoreview is forbidden on next | manual P1 review passed with no blocker |
| Goal plan complete | yes | run Autogoal checker | passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | completed | identities and comparable local baseline | none |
| Ordered diagnosis | completed | toolbar tail cost plus core repeated-write/layout cause | none |
| Fix and exact rerun | completed | five green post-fix packets | none |
| Remaining breadth | completed | 100-block, node-selection, and table-selection proof | none |
| Review and closeout | completed | lint, typecheck, build, tests, manual P1 review, and final checkers passed | none |

Findings:
- The recording is the block-selection marquee crossing the table, not table-cell selection.
- The text floating toolbar treated the projected node-selection range as text selection and mounted expensive, incorrect UI.
- NodeSelectionDrag reread every selectable DOM rect and published selection on every pointer frame even when exact paths and direction were unchanged.
- Plite explicit selection writes publish by contract; the correct no-op owner is the drag controller, which already knows whether its derived target changed.
- The remaining selected-node transition frames are below the 16.7 ms p95 budget.

Decisions and tradeoffs:
- Keep one core selection authority. Do not introduce a preview selection store, debounce, transition, or second plugin.
- Cache geometry only for one active gesture. Any scroll, resize, or auto-scroll marks it dirty and remeasures before the next hit test.
- Move only transient rectangle pixels imperatively. Editor node selection still commits synchronously whenever exact paths or direction change.
- Unmount text-toolbar subscriptions for node selection instead of teaching each toolbar query to tolerate the wrong selection kind.

Harness/methodology repairs:
- Switched from 127.0.0.1 to localhost because Next blocked the former asset origin.
- Added a one-second warmup after initial two-frame readiness; unwarmed packets measured hydration rather than drag.
- Restarted Next after registry generation temporarily invalidated the registry alias.
- Used the repo Playwright lane for executable proof after the in-app Browser CUA tab remained an unhydrated SSR shell.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| 127.0.0.1 page had SSR content without hydrated pointer listeners | 1 | use localhost | repaired |
| two-frame-only warmup captured 371-378 ms hydration long tasks | 1 packet group | add fixed warmup | invalidated and rerun |
| app-cwd Bun command lacked the root DOM preload | 1 | run Bun from repo root | repaired |
| registry generation invalidated the running Next alias | 1 | restart exact host | repaired |
| in-app Browser CUA did not produce hydrated editor selection | 2 tabs | keep Browser inspection, use repo Chromium runner for executable proof | documented limitation |
| Oxfmt ignored the plan path | 1 | use the owning structural validators and whitespace check | excluded by repository formatter configuration |

Verification evidence:
- pnpm --filter @platejs/core exec bun test src/react/components/NodeSelection.spec.tsx: 7 passed.
- bun test apps/www/src/registry/components/editor/floating-toolbar.spec.tsx: 3 passed.
- PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm exec playwright test --config tooling/config/playwright.config.ts tooling/e2e/node-selection.test.ts --project=chromium --workers=1: 1 passed.
- PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --dir apps/www exec playwright test --config playwright.config.ts tests/browser/table-selection.spec.ts --project=chromium --workers=1: 4 passed.
- pnpm turbo typecheck --filter=./packages/core: 10 tasks passed.
- pnpm check:plite:dev: passed all affected typecheck, test, contract, and Chromium smoke steps.
- pnpm --filter www editor:check: passed.
- pnpm --filter www build:registry: passed.
- scoped Ultracite: passed.
- exact post-fix performance packets: 5 passed, each with 73 trusted moves and zero long tasks.

Final handoff contract:
- goal plan / scope: exact table-demo block-selection drag
- candidate / baseline identities: same local HEAD/host/fixture; origin/main inapplicable
- completed / N/A / unresolved lanes: all applicable lanes complete; none unresolved
- first conclusive cause: repeated full-DOM geometry reads and equal editor selection publications per pointer frame
- baseline / latest / best metrics: pointer p95 1.6 ms to 0.3 ms; reads 2,960 to 92
- fix owner / changed files: core NodeSelection, registry FloatingToolbar, focused tests, existing changeset
- exact benchmark and correctness reruns: green
- resumed breadth: 100-block scaling and four table-cell selection rows green
- packet decisions: invalid harness packets excluded; both runtime fixes kept
- harness/methodology repairs: host, warmup, and server restart recorded
- residual claim limits / next owner: no production RUM; in-app Browser CUA hydration was unavailable

Timeline:
- 2026-08-26T14:43:18.981Z Benchmark goal plan created.
- 2026-08-26T15:00Z Recording matched to table-demo and localhost harness repaired.
- 2026-08-26T15:25Z Five pre-fix packets captured.
- 2026-08-26T15:45Z Floating toolbar node-selection boundary repaired.
- 2026-08-26T16:00Z Core geometry cache and unchanged-selection suppression implemented.
- 2026-08-26T16:20Z Five final packets and correctness breadth passed.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Complete |
| Where am I going? | Final handoff |
| What is the goal? | Smooth block selection without weakening one selection authority |
| What have I learned? | Repeated equal editor writes, not Plite selection semantics, dominated continuous drag work |
| What have I done? | Removed toolbar work, cached gesture geometry, skipped equal selection writes, and proved exact behavior |

Open risks:
- No production RUM covers this registry interaction; the claim is bounded to
  the exact local Chromium fixture and deterministic scaling proof.
