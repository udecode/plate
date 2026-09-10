# Tailwind hover selector removal

This is a project-owned file template under Task. Apply the project's standing Autogoal request for long-running work unless the user opts out. Apply `.agents/rules/task/references/workflow.md` to timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

Objective:
Remove the Tailwind compiler patch while preserving component hover/focus behavior and bounded hover cost on the full native 30,000-span code block.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-10-tailwind-hover-selector-removal.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

Applied packs:
- none

## Benchmark Source

- request: User accepted component-owned selector replacement with “go” on 2026-09-10, after explicitly requesting removal of the Tailwind patch.
- scope: App hover/focus CSS, editor controls, source scanning, patch registration and installed compiler; local implementation and proof.
- invocation: Accepted implementation with embedded before/after performance probe; no main-branch product comparison or broad editor benchmark requested.
- candidate-identity: Current next checkout, base f03d2b8c2397638acfe8b50abf4e90139778360f; final input hashes will be retained with artifacts.
- plate-main-identity: N/A: comparison is installed patched Tailwind versus component selectors using pristine Tailwind, not current versus main.
- plite-identity: N/A: no Plite source/runtime changes.
- slate-identity: N/A: CSS invalidation has no substrate comparison.
- named-symptom: Hovering the full native code-block surface must not restyle the 30,000-token subtree.
- final-artifacts: docs/plans/artifacts/2026-09-10-tailwind-hover-selector-removal/

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
- requested duration: N/A: no timed request.
- semantics: N/A: no timed request.
- start / deadline: N/A: no deadline.
- final loop closure: Complete accepted selector removal and all applicable correctness/proof rows.

Completion threshold:
- Compiler patch and pnpm registration absent, installed upstream compiler verified; generated app CSS contains no universal group/peer hover/focus rules. Editor controls, composed headings, sidebar actions and floating labels retain their intended behavior. Registry output regenerated.
- Frozen hover contract: preserve the existing <100 ms maximum RecalcStyleDuration guard. In matched packets reject a material regression when candidate p95 grows by both >5 ms and >25% beyond baseline and observed packet spread. Report first entry separately; do not claim a speed improvement from values within noise. Full native descendants and code text must remain unchanged; adjacent typing and undo must pass.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`, P1 autoreview is N/A on next, and the Autogoal checker passes.

Verification surface:
- benchmark commands / artifacts: Existing www code-block-native-interactions.spec.ts plus supported Chrome CDP for matched CSS owner measurement; retain baseline.css and candidate.css, raw packets, fingerprints and logs.
- correctness commands: pnpm --filter www test:www-browser:chromium tests/browser/code-block-native-interactions.spec.ts; affected UI browser tests and component-owned CSS behavior cases.
- Browser / Chrome / device proof: Existing repository Playwright runner for repeatable tests; real Chrome Ziad profile via CUA for final native pointer and scroll proof. No raw mobile-device claim.
- source/ref/fingerprint proof: Baseline CSS SHA256 e4f34be4000e02dfbcd3cb40104bf56f56b156219927ca844912b1b0af8c557d; baseline lock e8f39bfde02f1e8bb5b886ea0576bf2299e97099901e8dd3398a95f81c1c0d4f; final hashes pending.

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
- allowed runtime/packages/apps: apps/www component source and globals.css, root package.json/pnpm-lock.yaml, patches, generated registry output.
- allowed benchmark/tests/fixtures: Existing www browser runner and its affected UI/native test owners; local plan artifacts.
- allowed baseline checkouts/hosts: Current checkout only. Initial baseline server 3297 PID 94396 cwd apps/www verified. Task-owned fresh dev server 3299 uses .next-tailwind-proof and source aliases.
- non-goals: Package/editor algorithms, virtualization, React patches, upstream compiler fork, global CSS rewriting, publication, unrelated upstream style catalogs.

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- A reproducible correctness failure in the accepted selectors or materially regressed matched hover cost keeps this task open. A browser capability gap is reported at its exact claim boundary while all independent source and automated proof continues.

## Interaction Coverage

- first-interaction: pending
- settled-interaction: pending
- route-scope: pending
- reporter-profile: pending

Use `pass: <proof>` or `N/A: <concrete reason>` for each phase and host.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | pending | pending | pending |
| lockfile / package manager | pending | pending | pending |
| build mode / host / port | pending | pending | pending |
| browser / machine / viewport / DPR | pending | pending | pending |
| route / fixture / document / plugins | pending | pending | pending |
| setup / action / DOM strategy | pending | pending | pending |
| warmups / samples / interleave order | pending | pending | pending |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | pending | pending |
| Timed checkpoint parsed | pending | pending |
| `benchmark` source and methodology read | yes | pending |
| Task plan reused; standing Autogoal request or explicit opt-out resolved | yes | pending |
| Candidate and baseline identities recorded | pending | pending |
| Target/runner discovery completed from current source | pending | pending |
| Host/build/fixture freshness proved | pending | pending |
| Correctness oracle identified | pending | pending |
| All default lanes inventoried | yes | pending |
| `only` narrowing explicitly authorized or N/A | pending | pending |
| Browser/native proof strategy selected | pending | pending |
| Output budget strategy recorded | yes | see above |
| Commit/PR/release authority recorded | yes | no mutation authorized by default |

Work Checklist:
- [ ] User: Replace expensive application group/peer hover/focus selectors and preserve hover media queries, keyboard focus, touch visibility, open/active states and nested-owner behavior.
- [ ] User: Remove the Tailwind patch and registration; verify installed upstream source.
- [ ] User: Exclude source test fixtures from Tailwind scanning.
- [ ] User: Compare against patched CSS on the full 30,000-span route; preserve all native DOM.
- [ ] AGENTS / Plate UI: Regenerate registry output on next and inspect generated source. No package exports change, so brl N/A.
- [ ] Plate UI: Registry changelog disposition and affected source type/lint proof.
- [ ] Task: No commit/push/PR requested; Autoreview N/A on next.
- [ ] Verify Plate: Preserve source/host/action/results and screenshot, clean only task-owned sessions.
- [ ] Every explicit scope, comparison, timing, stop condition, deliverable,
      verification surface, and success criterion is recorded.
- [ ] Short objective, threshold, verification, constraints, boundaries, and
      blocked condition are concrete.
- [ ] Default lanes remain in diagnostic order; every N/A row has a reason.
- [ ] Candidate/baseline signatures prove comparable source, fixture, action,
      build, browser, machine, and sampling.
- [ ] Primary metrics match the visible user operation; proxies stay labeled.
- [ ] Samples expose p50/p75/p95/p99 only when sample count supports them,
      plus max, absolute/relative delta, and noise evidence.
- [ ] Red lanes are not called causal without the conclusive-cause gate.
- [ ] A proven cause pauses later lanes before another expensive benchmark.
- [ ] Every proven cause records its fix class, best long-term target, decision
      owner, layer plan, compatibility verdict, and implementation owner.
- [ ] `public-api` and `runtime-architecture` causes run `best-api`, then
      `plite-plan`, `plate-plan`, or both before implementation. Broad accepted
      execution may use `task autonomous`; target selection may not.
- [ ] One isolated owner is fixed, then the exact benchmark and correctness
      guard rerun before breadth resumes.
- [ ] Failed reruns invalidate or continue the same cause; they do not skip to
      a different green metric.
- [ ] Green reruns resume the first pending applicable lane.
- [ ] Every packet has keep/revert/invalidate/quarantine/defer and next-owner
      evidence.
- [ ] Harness/metric/host defects are repaired before product optimization.
- [ ] Final handoff reports candidate/baseline identities, lane status, first
      conclusive cause, metrics, fix/reruns, resumed breadth, and residual risk.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | in_progress | Patched baseline CSS saved; native baseline test 1/1 passed in 4.9s; fresh unpatched host starting. | Finish compiler and host identity. |
| 2 | current-vs-main-product-smoke | N/A: inapplicable - accepted comparison is patched versus unpatched CSS on the same current product | N/A | No origin/main product claim. | none |
| 3 | plate-vs-plite-decomposition | N/A: inapplicable - only component CSS changes, no editor layer changes | N/A | CSS owner isolated in prior hover trace and accepted source assessment. | none |
| 4 | owner-microbench-and-trace | yes | pending | Compare patched baseline and current component selectors; verify style invalidation work and controls. | Matched owner probe. |
| 5 | product-mount-matrix | N/A: inapplicable - no mount architecture or mount performance claim | N/A | Fresh route readiness remains in lane 1; style parsing captured by compiled-output audit. | none |
| 6 | trusted-editing-matrix | yes | pending | Existing native code-block suite covers adjacent typing, undo and full DOM. | Run final native suite. |
| 7 | plite-vs-pinned-slate | N/A: inapplicable - CSS-only product presentation, no substrate change | N/A | No engine comparison claim. | none |
| 8 | example-breadth | yes | pending | Affected gutters, column/row/media controls, comments/suggestions, drawing toolbar, floating labels, emoji, sidebar and composed heading links. | Existing tests plus focused current-source selector oracle. |
| 9 | large-and-stress | yes | pending | 30,000-span native code block, first and settled entry, outer and embedded scrolling. | Final real Chrome proof. |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: no cause proven
- lane: N/A: no cause proven
- comparable-baseline: N/A: no cause proven
- material-delta: N/A: no cause proven
- isolated-owner: N/A: no cause proven
- causal-intervention: N/A: no cause proven
- correctness-guard-result: pending
- fix-class: N/A: no cause proven
- long-term-target: N/A: no cause proven
- decision-owner: N/A: no cause proven
- layer-plan: N/A: no cause proven
- compatibility-verdict: N/A: no cause proven
- fix-owner: N/A: no cause proven
- benchmark-command: N/A: no cause proven
- benchmark-rerun: N/A: no cause proven
- benchmark-rerun-result: pending
- correctness-command: N/A: no cause proven
- correctness-rerun: N/A: no cause proven
- correctness-rerun-result: pending
- resume-lane: N/A: no cause proven

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| pending | pending | pending | pending | pending | pending | pending |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| pending | pending | pending | pending | pending | pending | pending |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | pending | Run the exact metrics, comparisons, and correctness proof named above | pending |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-09-10-tailwind-hover-selector-removal.md` at cause/resume checkpoints | pending |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | pending |
| Exact post-fix benchmark reruns | pending | Rerun every kept fix against its original lane/baseline | pending |
| Correctness/native behavior reruns | pending | Run named tests and Browser/Chrome/device proof required by the claim | pending |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | pending |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | pending |
| Durable fix decision | pending | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | pending |
| Package/type/build proof | pending | Run affected package checks/typecheck/build only where owned | pending |
| Browser surface proof | pending | Run Browser for product routes; Chrome/device for native state when applicable, or N/A with reason | pending |
| Changeset/release artifact | pending | Add only for published package behavior/API changes, otherwise N/A | pending |
| Agent rule/skill sync | pending | Run `pnpm install` and mirror/resource checks when agent sources changed, otherwise N/A | pending |
| Benchmark plan complete validation | yes | Run validator with `--complete` | pending |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | pending |
| Timed checkpoint | pending | Satisfy requested duration and close current packet, otherwise N/A | pending |
| P1 autoreview | pending | Use Task's review gate and remaining budget; never on next; otherwise N/A with reason | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-10-tailwind-hover-selector-removal.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | in_progress | created plan | fast symptom lane |
| Ordered diagnosis | pending | | cause gate or next lane |
| Fix and exact rerun | pending | | resume breadth |
| Remaining breadth | pending | | final verification |
| Review and closeout | pending | | final response |

Findings:
- Internal implementation: presentation belongs to the components. Keep the existing native DOM and CSS-only state; no package API or new shared abstraction is needed.

Decisions and tradeoffs:
- Internal implementation: presentation belongs to the components. Keep the existing native DOM and CSS-only state; no package API or new shared abstraction is needed.

Harness/methodology repairs:
- Internal implementation: presentation belongs to the components. Keep the existing native DOM and CSS-only state; no package API or new shared abstraction is needed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final handoff contract:
- goal plan / scope: pending
- candidate / baseline identities: pending
- completed / N/A / pending lanes: pending
- first conclusive cause: pending
- baseline / latest / best metrics: pending
- fix owner / changed files: pending
- exact benchmark and correctness reruns: pending
- resumed breadth: pending
- packet decisions: pending
- harness/methodology repairs: pending
- residual claim limits / next owner: pending

Timeline:
- 2026-09-10T15:06:27.892Z Benchmark goal plan created.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Intake and comparison authority |
| Where am I going? | Ordered diagnosis, fix/rerun, remaining breadth, closeout |
| What is the goal? | Remove the Tailwind compiler patch with equivalent component behavior and bounded full-DOM hover. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
