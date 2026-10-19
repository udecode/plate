# selected node render performance

Objective:
Fix selected-node drag jank; done when selected-state pointer p95 is below
16.7 ms, highlight commits fall at least 50%, and correctness/browser checks
pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-selected-node-render-performance.md

## Benchmark Source

- request: The supplied 7.567 second recording shows fast block selection until
  nodes become selected, followed by heavy selected-node rerendering. Find and
  fix the owner.
- scope: Selected-state node-selection marquee rendering on /view/editor-ai.
  Preserve node selection and the repaired table drag behavior.
- invocation: $benchmark selected-node render performance
- candidate-identity: ref: HEAD d282fd8a33affb40d2b60103b6c1ce370140d2eb;
  starting NodeSelection.tsx SHA-256 68cacd042e545c2f27d7dd9a83ebdf865af396d0649f465e5d117a1ef514d65b;
  final SHA-256 5d360bdb177b5c6ccdebec6850c228584b169d1fab64b2f8c014df345ba6e62e.
- plate-main-identity: ref: origin/main cce36d378b2f1e5c775dafe1a67c2215165c982c;
  it lacks the exact component and is source context only.
- plite-identity: ref: HEAD d282fd8a33affb40d2b60103b6c1ce370140d2eb.
- slate-identity: N/A: inapplicable - Slate has no matched marquee/highlight UI.
- named-symptom: Every selected highlight rerenders as the selection grows.
- final-artifacts: artifact: this plan records the deterministic React
  comparison, five selected-state browser packets, correctness breadth, and
  final fingerprints.

Completion threshold:
- Five packets of 80 trusted selected-state pointer moves each have p95 below
  16.7 ms and zero long tasks.
- Ten selected-set changes cause ten or fewer highlight commits, at least 50%
  below the pre-fix 20.
- Existing portals do not rerender as the selected set grows.
- Expansion, contraction, focus, clipboard, delete, undo, native highlight
  suppression, block handles, and table resize cursor behavior pass.
- Every applicable lane and every kept-fix rerun is complete.

Verification surface:
- React Profiler owner comparison; trusted pointer-to-paint Chromium packets on
  /view/editor-ai; focused core tests; node-selection, DnD, and relevant table
  Chromium rows; affected Plite check; in-app Browser.
- Exact refs, lockfile, runtime, source, test, and changeset hashes are recorded.

Constraints:
- Correctness and native editor behavior outrank metric movement.
- No debounce, delayed work, changed fixture, degraded DOM, duplicate selection
  store, plugin, commit, push, PR, publication, release, or tracker mutation.
- Fix one proven owner, rerun its exact red metric and correctness guard, then
  resume breadth.

Boundaries:
- Runtime scope is core NodeSelectionHighlight and its focused test.
- Existing browser fixtures and deleted temporary metric rows are proof scope.
- Public selection API and table-cell semantics are non-goals.

Blocked condition:
- Stop only if the exact route cannot hydrate after bounded repair, React work
  cannot be measured, or the owner requires an unresolved public API decision.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | HEAD d282fd8a; source 5d360bdb; spec 853437ba | same checkout before fix; source 68cacd04 | artifact: exact hashes in Benchmark Source |
| lockfile / package manager | lock ea62ed87; pnpm 9.15.0; Node 22.22.1 | same graph | artifact: unchanged lock fingerprint |
| build mode / host / port | fresh Next dev host at localhost:3000 | same mode and host | artifact: hydrated Browser and Chromium |
| browser / machine / viewport / DPR | Playwright Chromium 1.61.0; Apple M5 Max; 1104x778; DPR 1 | same | artifact: recording and matched runner |
| route / fixture / document / plugins | /view/editor-ai; exact recording editor | same owner fixture | artifact: recording frames and route text |
| setup / action / DOM strategy | trusted drag, then alternating expansion and contraction | same 20-block owner action; browser latency baseline unavailable | artifact: deterministic owner pre/post and candidate browser packets |
| warmups / samples / interleave order | hydrated warmup; five packets x 80 | pre-fix owner row, isolated fix, exact rerun, breadth | artifact: metric ledger below |

Work Checklist:
- [x] Requirements, threshold, constraints, boundaries, stop condition, and
      proof surface are recorded.
- [x] Comparable identities, metrics, samples, noise boundary, and all lane
      applicability are recorded.
- [x] One causal owner was fixed before exact benchmark and correctness reruns.
- [x] All applicable lanes resumed and completed after the green rerun.
- [x] Final evidence, claim limits, review, and risks are recorded.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | recording matched /view/editor-ai; localhost hydrated | none |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - origin/main lacks the component | no matched fixture | none |
| 3 | plate-vs-plite-decomposition | yes | complete | direct Plite projection committed once; Plate highlight twice | none |
| 4 | owner-microbench-and-trace | yes | complete | 20 commits became 10; 10 portal calls for 10 growing sets | none |
| 5 | product-mount-matrix | no | N/A: inapplicable - symptom starts only after selection | pre-selection mount is responsive | none |
| 6 | trusted-editing-matrix | yes | complete | focus, clipboard, input, delete, undo, drag, native range passed | none |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - Slate has no matched UI | no comparable action | none |
| 8 | example-breadth | yes | complete | Browser, node/DnD, and four table rows passed | none |
| 9 | large-and-stress | yes | complete | 20 blocks and 5 x 80 selected-state moves met budget | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: resolved cause retained in Cause History
- lane: N/A: resolved cause retained in Cause History
- comparable-baseline: N/A: resolved cause retained in Cause History
- material-delta: N/A: resolved cause retained in Cause History
- isolated-owner: N/A: resolved cause retained in Cause History
- causal-intervention: N/A: resolved cause retained in Cause History
- correctness-guard-result: N/A: resolved cause retained in Cause History
- fix-class: N/A: resolved cause retained in Cause History
- long-term-target: N/A: resolved cause retained in Cause History
- decision-owner: N/A: resolved cause retained in Cause History
- layer-plan: N/A: resolved cause retained in Cause History
- compatibility-verdict: N/A: resolved cause retained in Cause History
- fix-owner: N/A: resolved cause retained in Cause History
- benchmark-command: N/A: resolved cause retained in Cause History
- benchmark-rerun: N/A: resolved cause retained in Cause History
- benchmark-rerun-result: N/A: resolved cause retained in Cause History
- correctness-command: N/A: resolved cause retained in Cause History
- correctness-rerun: N/A: resolved cause retained in Cause History
- correctness-rerun-result: N/A: resolved cause retained in Cause History
- resume-lane: N/A: all applicable lanes complete

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SELECTED-HIGHLIGHT-001 | owner-microbench-and-trace | kept | internal-implementation | one highlight commit per selection change with stable existing portals | benchmark | N/A: internal React implementation | N/A: public props and selection semantics unchanged | NodeSelectionHighlight | same 20-block editor and 10 growing sets produced 20 highlight commits against 10 direct projection commits | pass: 7 tests and 32 assertions | pnpm --filter @platejs/core exec bun test src/react/components/NodeSelection.perf.tmp.spec.tsx | pass: highlight 10 commits and control 10 | pnpm --filter @platejs/core exec bun test src/react/components/NodeSelection.spec.tsx | pass: 8 tests, 45 assertions, 10 commits, 10 portal calls | exact owner comparison and browser breadth |

Metric table:
| Action | Samples | Baseline | Candidate | Delta / confidence |
|---|---|---|---|---|
| highlight commits | 10 growing sets | 20 | 10 | -10 / -50%; deterministic Profiler |
| portal calls | 10 growing sets | exact old count not retained | 10 | candidate proves only newly added portals render |
| pointer-to-paint | 5 x 80 | no matched pre-fix browser packet | p95 .1 ms in every packet; maxima .2, 5.1, 5.3, 4.3, 5.2 ms | 400 samples; absolute post-fix proof |
| long tasks at least 50 ms | 400 moves | no matched pre-fix browser packet | 0 | five independent packets |

### Performance

- applicability: applied
- extra rules used: effect-subscription-budget, interaction-inp-matrix,
  repeated-unit-budget
- repeated unit: existing selected portal per selected-set change
- budgets: one highlight commit per changed set; render only newly added
  portals; one guarded pre-paint retry only if structure replaces a portal host
- primitives: direct target projection, selector equality/commit filtering,
  React.memo per portal, guarded layout host repair
- degradation contract: one editor selection authority; native DOM, focus,
  clipboard, delete, undo, contraction, handles, and cursor remain intact
- dashboard/RUM gap: no production RUM covers this registry interaction

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Exact request and route | yes | recording matched to /view/editor-ai |
| Comparable owner baseline | yes | same 20-block Profiler action before and after |
| Correctness oracle | yes | focused core and browser contracts |
| Git/public mutation | no | no commit, push, PR, publication, or release |

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Named metric threshold | yes | 20 to 10 commits; all five p95 values .1 ms; zero long tasks |
| Exact benchmark and correctness reruns | yes | owner rerun and 8-test core suite passed |
| Package and browser breadth | yes | core typecheck, check:plite:dev, 2 tooling and 4 table rows passed |
| Changeset | yes | existing core changeset updated; SHA-256 a346d598 |
| Agent sync | no | no agent source changed |
| Review and final checkers | yes | scoped lint, whitespace, manual P1, benchmark, and Autogoal checks passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison | completed | identities, route, owner, lanes | none |
| Ordered diagnosis | completed | direct control isolated extra commit | none |
| Fix and exact rerun | completed | 20 commits became 10 | none |
| Remaining breadth | completed | 400 moves and six Chromium rows | none |
| Review and closeout | completed | affected check, lint, review, validators | none |

Findings:
- The recording is /view/editor-ai, not table-demo.
- NodeSelectionHighlight rendered old targets, then copied new targets into
  layout-effect state, committing the layer twice per selection change.
- Inline portals recreated every existing selected child.
- Plite selection publication already costs one required commit. Another store
  or plugin would add overhead without touching the culprit.

Decisions:
- Derive targets during render and memoize each portal.
- Keep one equality-guarded layout retry for rare structural host replacement.
- Keep public props and the single selection authority unchanged.

Verification evidence:
- Pre-fix temporary owner test: highlight 20 commits versus control 10.
- Post-fix temporary owner test: highlight 10 and control 10.
- Permanent core suite: 8 passed and 45 assertions.
- Five Chromium performance repeats: 400 samples, all p95 .1 ms, zero long
  tasks.
- Node-selection and homepage-DnD Chromium: 2 passed.
- Relevant table-selection Chromium: 4 passed.
- In-app Browser: 8 selected blocks and no native text range after pointerup.
- Core typecheck: 10 tasks passed.
- pnpm check:plite:dev passed affected tests, types, contracts, and smoke.
- Scoped Ultracite, diff check, manual P1 review, and plan checkers passed.

Final handoff:
- Owner: packages/core/src/react/components/NodeSelection.tsx.
- Changed proof: NodeSelection.spec.tsx, existing core changeset, and this plan.
- Relative claim: deterministic React work fell 50%.
- Absolute claim: 400 post-fix pointer samples stayed at p95 .1 ms with no long
  tasks.
- No behavior-equivalent browser latency baseline exists.
- The separate table paint-only synthetic positive control fails before product
  pixels; its harness owns that proof debt. The four requested table behavior
  rows pass.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Complete |
| Where am I going? | Stable handoff |
| What is the goal? | Remove selected-node rerender jank without weakening selection |
| What did I learn? | Derived target state and inline portals caused repeated React work |
| What did I do? | Halved commits, reused portals, and proved browser behavior |

Open risks:
- No production RUM covers this interaction.
- Browser latency is absolute post-fix evidence; the 50% relative result is the
  deterministic React owner metric.
- The unrelated table synthetic pixel-control harness still needs repair.

