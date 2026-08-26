# selected node rerender fix

Objective:
Cut TOC/link selection rerenders on /view/editor-ai; done when both add 0
repeated renders across 5 profiles and focused unit/Chromium proof passes; plan
docs/plans/2026-08-26-selected-node-rerender-fix.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-selected-node-rerender-fix.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: Implement the accepted selected-node rerender cuts after the exact
  `/view/editor-ai` diagnosis. Treat `go fi` as `go fix`.
- scope: Cut the TOC every-commit fresh-array subscription and the closed link
  toolbar's complete-Range subscription. Rerun the exact route and address the
  deferred toolbar transition only if it remains material after those cuts.
- invocation: `$benchmark selected-node rerender fix`
- candidate-identity: ref: HEAD
  `d282fd8a33affb40d2b60103b6c1ce370140d2eb`; pre-fix TOC
  `4ed96d37f0d978a41e8241c8657a5ac4de19e9cd907592fd76dcba3890071036`;
  pre-fix link
  `6270fec8e35656c673356f8bacdeb0e02c3eb8f59fe5022fef8e9fbbd312d19f`.
- plate-main-identity: ref: origin/main
  `cce36d378b2f1e5c775dafe1a67c2215165c982c`; it lacks the exact selection
  component and is not behavior-comparable.
- plite-identity: ref: HEAD
  `d282fd8a33affb40d2b60103b6c1ce370140d2eb`.
- slate-identity: N/A: Slate has no matched node-selection UI.
- named-symptom: Selecting ten nodes on `/view/editor-ai` produces median 77
  Bippy render samples and 12.0ms self time versus 26 and 3.1ms for the matched
  gutter control. TOC and link families add 80 and 33 samples across five runs.
- final-artifacts: artifact: this plan, generated registry output from the
  current source, five exact-route post-fix packets, focused component/Core
  tests, www typecheck, and Chromium node-selection proof.

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
- final loop closure: finish both accepted cuts, exact reruns, remaining-family
  decision, generated registry proof, and correctness closure

Completion threshold:
- Across five retry-free exact-route post-fix selected packets and five matched
  controls, TOC and `LinkFloatingToolbar` each add zero repeated render samples
  after the initial necessary mount/control event.
- Median selected Bippy render samples are at most 58 and median Bippy self time
  is at most 8.5ms, both at least about 25% lower than the 77/12.0ms pre-fix
  baseline. If the exact owner deltas are zero but route totals miss this bound,
  account for every remaining family above 5% and fix or explicitly route it.
- Node-selection highlights, focus, clipboard, input, delete, undo, TOC document
  updates, and link edit/insert toolbar behavior remain correct.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`, P1 autoreview passes when
  code changed, and the Autogoal checker passes.

Verification surface:
- benchmark commands / artifacts: current React Doctor 0.9.12 runtime probe on
  `/view/editor-ai`; five selected packets, five gutter controls, family deltas,
  self time, visible highlights, and long-animation-frame count.
- correctness commands: focused `toc.tsx`, `link.tsx`, and NodeSelection specs;
  www source-first typecheck; existing Chromium node-selection row.
- Browser / Chrome / device proof: in-app Browser exact route at 1280x720/DPR 1;
  repository Chromium for focus/clipboard/input/delete/undo.
- source/ref/fingerprint proof: exact HEAD, origin/main, lock, pre/post product
  source, generated registry source, and React Doctor probe fingerprints.

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
- allowed runtime/packages/apps: `apps/www/src/registry/components/editor/toc.tsx`,
  `link.tsx`, their focused specs, and `floating-toolbar.tsx` only if the exact
  rerun keeps its transition material; generated registry output only through
  `pnpm --filter www build:registry`.
- allowed benchmark/tests/fixtures: `/view/editor-ai`, existing node-selection
  demo/Chromium row, current React Doctor probe, and this plan.
- allowed baseline checkouts/hosts: current localhost candidate, same-route
  gutter control, and read-only source identity for origin/main.
- non-goals: new public selection/TOC/link APIs, package extraction, Plite/Core
  changes, compatibility helpers, unrelated registry cleanup, commits, pushes,
  PRs, releases, or generated-file hand edits.

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- Stop only if the exact route cannot hydrate after one bounded host repair,
  the runtime probe cannot reproduce the pre-fix family counts, or preserving
  link/TOC correctness requires a new public API contrary to the accepted cut.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | HEAD `d282fd8a…`; TOC `4ed96d37…`; link `6270fec8…` | same source before product edit; pre-fix packets from the completed diagnosis | artifact: exact identities and prior diagnosis plan |
| lockfile / package manager | lock `ea62ed87…`; pnpm 9.15; Node 22.22.1 | same | artifact: unchanged lock fingerprint |
| build mode / host / port | source-first Next dev at localhost:3000 | same hydrated host and fresh reload after edit | artifact: Browser route readiness packet |
| browser / machine / viewport / DPR | in-app Browser Chromium; Apple M5 Max; 1280x720; DPR 1 | same | artifact: exact post-fix selected/control packets |
| route / fixture / document / plugins | `/view/editor-ai`; exact current composition | same route/document/plugin set | artifact: reporter route and current source |
| setup / action / DOM strategy | clear selection, pointer-down in editor padding, 14 paced moves across ten blocks, release | same path/time ending in gutter for zero selected blocks | artifact: runtime events and visible-highlight count |
| warmups / samples / interleave order | one warmup; five retry-free post-fix selected packets | five matched controls; compare against five pre-fix packets | artifact: packet ledger and raw runtime snapshot summary |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | accepted fix scope, exact route, performance thresholds, correctness, and no-public-API boundary recorded |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `benchmark` source and methodology read | yes | source and full methodology read this turn |
| Active goal checked or created | yes | goal points to this exact plan and threshold |
| Candidate and baseline identities recorded | yes | exact refs and pre-fix source/lock/probe fingerprints above |
| Target/runner discovery completed from current source | yes | accepted TOC/link owners, focused specs, registry generator, www typecheck, and Chromium row identified |
| Host/build/fixture freshness proved | yes | immediately preceding exact-route packets use the same current product fingerprints; refresh again before mutation |
| Correctness oracle identified | yes | focused component/Core specs plus existing Chromium node-selection behavior |
| All default lanes inventoried | yes | applicability resolved below |
| `only` narrowing explicitly authorized or N/A | no | N/A: normal scoped run retains every applicable lane |
| Browser/native proof strategy selected | yes | Browser exact route plus repository Chromium correctness row |
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
| 1 | source-and-host-readiness | yes | complete | exact identities and immediately preceding exact-route packets match current product fingerprints | none |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - origin/main lacks the exact component | no behavior-equivalent product baseline | none |
| 3 | plate-vs-plite-decomposition | yes | complete | prior exact diagnosis split repeated waste into Plate registry subscribers while Core visuals and Plite fence remained valid | none |
| 4 | owner-microbench-and-trace | yes | complete | REGISTRY-SUBS-001 is green: TOC and LinkFloatingToolbar each record zero selected-profile renders | none |
| 5 | product-mount-matrix | no | N/A: inapplicable - symptom begins after selection | initial route mount is not the named regression | none |
| 6 | trusted-editing-matrix | yes | complete | Chromium keeps focus, clipboard, input, delete, and undo green; Browser opens the link edit toolbar | none |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - Slate has no matched UI | no comparable action | none |
| 8 | example-breadth | yes | complete | `/view/editor-ai` and the standalone Chromium node-selection route both pass | none |
| 9 | large-and-stress | yes | complete | five exact ten-node profiles keep 10 highlights, zero long animation frames, and median 49 Bippy samples | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: archived in Cause History
- lane: N/A: archived in Cause History
- comparable-baseline: N/A: archived in Cause History
- material-delta: N/A: archived in Cause History
- isolated-owner: N/A: archived in Cause History
- causal-intervention: N/A: archived in Cause History
- correctness-guard-result: N/A: archived in Cause History
- fix-class: N/A: archived in Cause History
- long-term-target: N/A: archived in Cause History
- decision-owner: N/A: archived in Cause History
- layer-plan: N/A: archived in Cause History
- compatibility-verdict: N/A: archived in Cause History
- fix-owner: N/A: archived in Cause History
- benchmark-command: N/A: archived in Cause History
- benchmark-rerun: N/A: archived in Cause History
- benchmark-rerun-result: N/A: archived in Cause History
- correctness-command: N/A: archived in Cause History
- correctness-rerun: N/A: archived in Cause History
- correctness-rerun-result: N/A: archived in Cause History
- resume-lane: N/A: all applicable lanes complete

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REGISTRY-SUBS-001 | owner-microbench-and-trace | kept | internal-implementation | pure headings query with document-scoped structural equality, and link toolbar keyed by collapsed link identity instead of the complete Range | benchmark | N/A: internal copied registry implementation | N/A: no public API change | Plate UI registry source | TOC added 80 samples and link added 33 across five pre-fix selected profiles | pass: pre-fix 8/8 NodeSelection unit and 1/1 Chromium behavior row | in-app Browser React Doctor probe on `/view/editor-ai`, five selected and five gutter-control packets | pass: five selected profiles have median 49 Bippy samples and 6.9ms self time; TOC and LinkFloatingToolbar record zero renders | focused TOC spec, NodeSelection spec, www typecheck, and Chromium node-selection row | pass: 29 focused unit tests, www typecheck, one Chromium behavior row, and Browser link behavior are green | post-fix source and generated registry hashes plus exact-route packets |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| PREFLIGHT | source-and-host-readiness | accepted pre-fix diagnosis remains comparable | 77 Bippy samples and 12.0ms median selected versus 26 and 3.1ms control | 8/8 Core and 1/1 Chromium green | keep as baseline | owner fix |
| REGISTRY-SUBS-001 | owner-microbench-and-trace | TOC fresh arrays and full-Range link subscription cause repeated selected-state work | post-fix median 49 Bippy samples and 6.9ms versus pre-fix 77 and 12.0ms | 29 focused unit tests, www typecheck, Browser link behavior, and Chromium row green | keep both cuts | resume breadth |
| POST-FIX-BREADTH | trusted-editing/example/stress | remaining selected work is bounded selection visuals, the commit fence, and one toolbar transition | five profiles keep 10 highlights and zero long animation frames; no TOC/link render appears | route, link toolbar, focus, clipboard, input, delete, undo all green | keep selection visuals/fence/toolbar lifecycle | close |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| exact-route selected drag | 5 pre-fix | 26 / N/A / N/A / N/A / 30 control | 77 / N/A / N/A / N/A / 79 selected | +51 / +196% median | stable five-packet signal; tail percentiles omitted | completed diagnosis plan |
| exact-route Bippy self time | 5 pre-fix | 3.1ms / N/A / N/A / N/A / 3.9ms control | 12.0ms / N/A / N/A / N/A / 12.3ms selected | +8.9ms / +287% median | self time avoids hierarchy double-counting | completed diagnosis plan |
| exact-route selected drag | 5 post-fix | 24 / N/A / N/A / N/A / 25 control | 49 / N/A / N/A / N/A / 53 selected | +25 / +104% median; -36% from pre-fix selected | 10 highlights and zero long animation frames in every selected packet | current React Doctor runtime probe |
| exact-route Bippy self time | 5 post-fix | 2.8ms / N/A / N/A / N/A / 2.9ms control | 6.9ms / N/A / N/A / N/A / 7.7ms selected | +4.1ms / +146% median; -42.5% from pre-fix selected | exact source, route, gesture, viewport, and DPR; tail percentiles omitted | current React Doctor runtime probe |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | pass: median 49/6.9ms, zero TOC/link renders, and all named correctness checks green |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-08-26-selected-node-rerender-fix.md` at cause/resume checkpoints | pass: structural validator passed before implementation and will run complete below |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | pass: every applicable lane is complete and every skipped lane is inapplicable |
| Exact post-fix benchmark reruns | yes | Rerun every kept fix against its original lane/baseline | pass: five selected and five matched controls captured |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | pass: focused units, Browser exact route, and repository Chromium are green |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | pass: HEAD and origin/main unchanged; source/generated/probe hashes recorded below |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | pass: same route, gesture, 1280x720/DPR 1, five samples, and self-time aggregation |
| Durable fix decision | yes | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | pass: internal copied-registry cuts; no public API or package owner added |
| Package/type/build proof | yes | Run affected package checks/typecheck/build only where owned | pass: registry generation and `pnpm turbo typecheck --filter=./apps/www` |
| Browser surface proof | yes | Run Browser for product routes; Chrome/device for native state when applicable, or N/A with reason | pass: exact route has 10 highlights and link edit toolbar opens; Chromium behavior row passes |
| Changeset/release artifact | no | Add only for published package behavior/API changes, otherwise N/A | N/A: copied registry implementation only; no package API or release behavior changed |
| Agent rule/skill sync | no | Run `pnpm install` and mirror/resource checks when agent sources changed, otherwise N/A | N/A: no agent source changed |
| Benchmark plan complete validation | yes | Run validator with `--complete` | pass: benchmark plan is complete |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | pass: scoped Ultracite check and generated registry build are clean |
| Timed checkpoint | no | Satisfy requested duration and close current packet, otherwise N/A | N/A: no timebox requested |
| P1 autoreview | no | Run dirty local P1 review for non-trivial code/skill changes and close accepted findings, otherwise N/A | N/A: `next` forbids autoreview; manual P1 source/diff review found no blocker |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-selected-node-rerender-fix.md` | pass: all completion evidence is resolved |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | exact pre-fix source, host, route, action, and thresholds recorded | none |
| Ordered diagnosis | complete | prior 99.24% route attribution and current cause checkpoint | none |
| Fix and exact rerun | complete | both registry subscriptions cut; five selected and five controls captured | none |
| Remaining breadth | complete | Browser route/link behavior, focused units, www typecheck, and Chromium green | none |
| Review and closeout | complete | manual P1 review, generated registry output, source hashes, and final checkers | final response |

Findings:
- Exact prior diagnosis attributed 99.24% of positive added work. TOC and link
  are the two repeated registry subscription defects; node-selection visuals
  and the commit fence are legitimate work.
- Shadcn check: no primitive, styling, provider, or registry-item contract is
  involved. Both fixes stay direct copied editor UI.
- Five post-fix selected packets are 49/49/53/51/45 Bippy samples and
  7.5/7.7/6.8/6.5/6.9ms self time. Every packet has 10 highlights and zero
  long animation frames.
- Five matched controls are 24/23/24/25/25 Bippy samples and
  2.8/2.5/2.5/2.9/2.9ms self time.
- `TocElement` and `LinkFloatingToolbar` appear zero times in both Bippy and
  native selected traces. The named repeated leaks are gone.
- The remaining toolbar work is a bounded text-toolbar lifecycle transition,
  not selection-step churn. Controls record more `TextFloatingToolbar`
  samples than selected profiles, so it fails the causal cut gate.

Decisions and tradeoffs:
- Add no public hook, cache contract, package helper, or Plite/Core API. Use the
  existing narrow selector contract at the copied registry owner.
- Fix both subscriptions in one Plate UI registry-owner packet, then rerun the
  exact route before deciding the toolbar transition.
- Keep the outer text-toolbar node-selection guard. Removing it would retain
  hidden toolbar hooks across selection commits to avoid one legitimate
  lifecycle transition.
- Registry changelog: N/A. The visible behavior is unchanged; only subscription
  frequency changes.

Harness/methodology repairs:
- None. The current exact-route runtime probe reproduced the old owners and
  proved their removal without changing the fixture or metric.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| Combined Bun invocation inherited the TOC module mock into the link spec | 1 | run each focused spec in its own Bun process | TOC 2/2 and link 16/16 pass independently |
| Browser keypress on a heading lost the resolved locator after focus moved | 1 | rely on the document-commit selector contract plus generated route proof | no fixture mutation occurred; TOC selector test and Browser route remain green |
| In-app Browser CDP defaulted to an isolated execution context | 1 | bind the main execution context explicitly | exact React Doctor component events captured |

Verification evidence:
- Pre-fix evidence: five exact-route packets and five matched controls in
  `docs/plans/2026-08-26-selected-node-rerender-breadth.md`.
- Runtime post-fix: median selected 49 Bippy samples and 6.9ms self time versus
  24 and 2.8ms control; pre-fix selected medians were 77 and 12.0ms.
- Runtime ownership: zero `TocElement` and zero `LinkFloatingToolbar` samples
  across five selected packets; 10 highlights and zero long animation frames
  in every packet.
- `bun test apps/www/src/registry/components/editor/toc.spec.tsx`: 2 passed.
- `bun test apps/www/src/registry/components/editor/link-toolbar.spec.ts`: 16
  passed.
- `bun test apps/www/src/registry/components/editor/floating-toolbar.spec.tsx`:
  3 passed.
- `bun test packages/core/src/react/components/NodeSelection.spec.tsx`: 8
  passed.
- `pnpm e2e tooling/e2e/node-selection.test.ts --project=chromium`: 1 passed.
- `pnpm turbo typecheck --filter=./apps/www`: 59 tasks passed.
- `pnpm --filter www build:registry`: 379 canonical payloads and 15 sparse
  overlays generated.
- Browser `/view/editor-ai`: ten selected highlights render and clicking the
  React link opens one `Edit link` toolbar without navigation.
- Final fingerprints: HEAD `d282fd8a33affb40d2b60103b6c1ce370140d2eb`;
  origin/main `cce36d378b2f1e5c775dafe1a67c2215165c982c`; TOC
  `26399aa92fbf0fd11f4cc3b9d50070fb99af62401cceee33038b499d343ad435`;
  link `b81380a8c98042356b954ee377156b087f2d93f7629e11898c00a13c9bab40dc`;
  TOC test `ac08beb1dd04d940ec68f082546cf396f10a45e82e4d59cc06c52db81daa4c5f`;
  generated TOC `5bd8d70d0626e53541f76217f51fb896c1dbef38ecf13159f607718e6563e5e2`;
  generated link `1b0a4a33c82afb91a9947a25c4261b7ede410d14e86c90a688ef404f970d77c2`;
  link overlays `1dd1220f34fe6de619c95aefc01cbb1c9e2a89206da22b37eeeb61ac414a4b79`;
  lock `ea62ed870ad5f17d0f37b65285d7bddc819184f8245dc5f9d5e2c76eee7d7c5d`;
  React Doctor probe
  `8ba1fa1e7a558e876878872c58681e42cda4be0d128996d2fa3a7a5c4c7476c7`.

Final handoff contract:
- goal plan / scope: selected-node rerender cut complete in copied registry UI
- candidate / baseline identities: current HEAD source hashes versus immutable
  pre-fix packets and matched same-route gutter controls
- completed / N/A / pending lanes: all applicable lanes complete; main-product,
  mount, and Slate lanes are inapplicable; none pending
- first conclusive cause: TOC every-commit fresh-array subscription, grouped
  with the full-Range link toolbar subscription under REGISTRY-SUBS-001
- baseline / latest / best metrics: pre-fix selected 77/12.0ms; post-fix
  selected 49/6.9ms; post-fix control 24/2.8ms
- fix owner / changed files: Plate UI registry `toc.tsx`, `link.tsx`, focused
  TOC proof, generated TOC/link payloads, and this plan
- exact benchmark and correctness reruns: five selected plus five controls,
  29 focused units, www typecheck, Browser link proof, and one Chromium row
- resumed breadth: trusted editing, feature-heavy route, standalone behavior,
  and ten-node stress complete
- packet decisions: keep both selector cuts; keep selection visuals, commit
  fence, and bounded toolbar lifecycle; add no public API
- harness/methodology repairs: none required
- residual claim limits / next owner: ten-node development-route result only;
  100+ selected nodes and production latency remain unmeasured and need a new
  Benchmark packet if they become a reported problem

Timeline:
- 2026-08-26T19:03:06.097Z Benchmark goal plan created.
- 2026-08-26T19:09Z TOC document-scoped structural selector and link-key
  selector implemented with focused green type proof.
- 2026-08-26T19:23Z Five selected and five control packets captured; both
  named owners record zero renders and thresholds pass.
- 2026-08-26T19:31Z Focused units, Browser behavior, generated registry,
  Chromium, and www typecheck completed.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Review and closeout complete |
| Where am I going? | Final handoff |
| What is the goal? | Zero repeated TOC/link renders across five exact profiles with correctness green |
| What have I learned? | Stable derived selector values cut the repeated waste; the remaining toolbar transition is bounded and non-causal |
| What have I done? | Applied both cuts, generated registry payloads, captured exact metrics, and closed correctness breadth |

Open risks:
- Development-mode component self time supports owner attribution, not a
  production latency claim.
- Ten selected nodes are proven. Very large selected sets need a separate
  stress threshold rather than extrapolation.
