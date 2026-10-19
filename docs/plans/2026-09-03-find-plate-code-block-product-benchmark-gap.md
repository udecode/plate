# Find Plate code block product benchmark gap

Objective:
Find why the 10,000-line Plate harness mounts while the real Code Block docs
route crashes, repair the lying benchmark first, then isolate the real hot owner.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-03-find-plate-code-block-product-benchmark-gap.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: user says the Plate benchmark was wrong and asks to find the perf issue
- scope: exact `/docs/code-block` product composition versus the registered
  `plate-code-block-text-flow-browser` harness, from 1,000 through 10,000 highlighted lines
- invocation: `$benchmark Plate code-block product benchmark gap`
- candidate-identity: ref: HEAD `a6afd55c30e97c74fe895d1ad005ca75413110f3` plus dirty source fingerprints below
- plate-main-identity: N/A: inapplicable - the named defect is current product-versus-harness parity, not a main regression
- plite-identity: ref: current Plate checkout HEAD plus source-built packages
- slate-identity: N/A until the product-versus-minimal layer is isolated; prior pinned Slate evidence is contextual only
- named-symptom: the registered minimal 10k harness mounted while the real Code
  Block route crashed at 10k because the product plugin composition disabled
  retained text flow
- final-artifacts: artifact: `docs/plans/artifacts/2026-09-03-find-plate-code-block-product-benchmark-gap/minimal-product-final.json` plus this plan

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
- semantics: one-shot diagnosis and benchmark repair
- start / deadline: 2026-09-03 / N/A
- final loop closure: stop breadth at the first conclusive cause, repair the
  harness or hot owner, rerun exact route and guard, then resume applicable lanes

Completion threshold:
- The benchmark is honest only when the minimal and product lanes declare their
  exact plugin/component/build/DOM differences and no minimal result is labeled
  as Plate product truth. The 10k product route must become queryable without a
  renderer crash; a 5-second navigation-to-queryable ceiling is the frozen product veto.
- Cause requires an isolated owner and a causal disable/enable intervention.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`, P1 autoreview passes when
  code changed, and the Autogoal checker passes.

Verification surface:
- benchmark commands / artifacts: registered target, exact docs route probe,
  matched plugin/component reductions, DOM/token/heap/work counters
- correctness commands: exact model text, one canonical Text, full DOM text,
  syntax tokens, editor editability, and existing target correctness command
- Browser / Chrome / device proof: in-app Browser for the exact product route;
  registered headless Chromium only for matched harness timing
- source/ref/fingerprint proof: HEAD, lockfile, fixture, runner, plugin kit,
  component, and built-runtime hashes embedded in receipts

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
- allowed runtime/packages/apps: read all Plate/Plite/editor-kit/code-block
  owners; change benchmark harness first; runtime changes only after conclusive cause
- allowed benchmark/tests/fixtures: existing registered target, current Code
  Block demo, disposable exact-composition probes, focused correctness tests
- allowed baseline checkouts/hosts: current checkout and disposable temporary
  hosts only; no branch switch, worktree, commit, push, or PR
- non-goals: `editor-ai`, mixed virtualization, viewport-only token paint,
  CodeLine restoration

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- Stop only if the exact product composition cannot run in any local Chromium
  host after three materially different isolation moves, or if the cause is a
  public/runtime architecture decision requiring a new accepted layer plan.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | HEAD plus `code-block-value.tsx` SHA `df5d9bc...`, ListKit SHA `7c90512...`, runner file SHA `f71b07a...` | prior registered artifact commit `a6afd55...`, custom runner receipt SHA `d82858...` | artifact: `minimal-product-final.json` records custom runner receipt SHA `c0ede0d...`; plain file SHA and receipt SHA use different algorithms and are not compared |
| lockfile / package manager | pnpm lock SHA `0ec2e45...`; pnpm 9.15.0 | same checkout | artifact: fresh runner build plus lock fingerprint recorded in this plan |
| build mode / host / port | source dev docs route, localhost:3000 | bundled package dist, temporary HTTP host | artifact: Browser product veto plus `minimal-product-final.json`; lanes intentionally retain different build modes |
| browser / machine / viewport / DPR | in-app Chromium, macOS arm64, visible docs viewport | Playwright headless Chromium, 1280x720, DPR 1 | artifact: Browser exact product proof plus headless receipt; product Browser is a veto, not a timing baseline |
| route / fixture / document / plugins | full docs route, generic demo/full EditorKit, one 10k TypeScript code Text | one code block, CodeBlock plus CodeHighlight only, matched 10k TypeScript product text | artifact: Browser exact product proof plus `minimal-product-final.json`; fixture matches and composition difference is named |
| setup / action / DOM strategy | navigation, hydration, editable DOM; full DOM | direct root mount then midpoint trusted typing; full DOM | artifact: Browser exact queryable/edit/undo proof plus runner full-DOM receipt |
| warmups / samples / interleave order | crash repros plus one exact post-fix product navigation veto | one discarded warmup, five mounts, twenty edits | artifact: `minimal-product-final.json` records all timing samples; product sample is a veto only |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | exact product-versus-harness diagnosis and no `editor-ai` recorded |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `benchmark` source and methodology read | yes | full skill and methodology read before new measurements |
| Active goal checked or created | yes | create after this checkpoint is complete |
| Candidate and baseline identities recorded | yes | HEAD and source hashes above; stale artifact called out |
| Target/runner discovery completed from current source | yes | registered target and runner source located |
| Host/build/fixture freshness proved | yes | fresh target and durable artifact record current runner, dist build, fixture, language, and host |
| Correctness oracle identified | yes | exact text/model/DOM/tokens/editability plus registered correctness command |
| All default lanes inventoried | yes | table below retains all nine lanes |
| `only` narrowing explicitly authorized or N/A | no | N/A: normal scoped run, all applicable lanes retained |
| Browser/native proof strategy selected | yes | Browser exact route; headless runner for isolated matched probes |
| Output budget strategy recorded | yes | see above |
| Commit/PR/release authority recorded | yes | no mutation authorized by default |

Work Checklist:
- [x] Every explicit scope, comparison, timing, stop condition, deliverable,
      verification surface, and success criterion is recorded.
- [x] Short objective, threshold, verification, constraints, boundaries, and
      blocked condition are concrete.
- [x] Default lanes remain in diagnostic order; every N/A row has a reason.
- [x] Candidate/baseline signatures identify current mismatches that lane 1 must repair before comparable timing.
      build, browser, machine, and sampling.
- [x] Primary metric is product navigation-to-queryable editable DOM with crash as a hard veto; minimal mount remains a proxy.
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
| 1 | source-and-host-readiness | yes | complete | fresh target rerun passed 58 code tests and reused 18 matching Chromium rows; durable artifact fingerprints the current build and runner | lane 2 |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - user reports harness/product mismatch, not main regression | origin/main recorded only as context | lane 3 |
| 3 | plate-vs-plite-decomposition | yes | complete | minimal exact fixture stayed retained; full product fell back only when ListPlugin was present; plaintext full kit stayed retained | lane 4 |
| 4 | owner-microbench-and-trace | yes | complete | prefix bisection isolated ListPlugin; `inject.isElement: true` changed the exact 10k route from crash to retained rendering | cause gate passed; lane 5 resumed |
| 5 | product-mount-matrix | yes | complete | pre-fix 1k fallback took about 51s and 10k crashed; fixed full EditorKit 10k became exact/queryable in 4,021ms | lane 6 |
| 6 | trusted-editing-matrix | yes | complete | timing-grade minimal runner: input p95 334.8ms, exact input/model/DOM/selection/undo; Browser press used only for correctness because its action stabilization adds about 2.5s | lane 7 |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - prior substrate comparison cannot explain product composition tax | prior evidence remains contextual | lane 8 |
| 8 | example-breadth | yes | complete | `/docs/code-block` exercised the real registry component and full EditorKit; `editor-ai` remained excluded | lane 9 |
| 9 | large-and-stress | yes | complete | exact 10k product text, one Text, 30k token elements, 90,003 minimal-runner DOM nodes, full DOM coverage, trusted typing, and undo all passed | closeout |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: no active cause - BCB-001 is kept in Cause History
- lane: N/A: no active cause - all applicable lanes are complete
- comparable-baseline: N/A: no active cause - final evidence is in Cause History
- material-delta: N/A: no active cause - final evidence is in Cause History
- isolated-owner: N/A: no active cause - final evidence is in Cause History
- causal-intervention: N/A: no active cause - final evidence is in Cause History
- correctness-guard-result: N/A: no active cause - final evidence is in Cause History
- fix-class: N/A: no active cause - final evidence is in Cause History
- long-term-target: N/A: no active cause - final evidence is in Cause History
- decision-owner: N/A: no active cause - final evidence is in Cause History
- layer-plan: N/A: no active cause - final evidence is in Cause History
- compatibility-verdict: N/A: no active cause - final evidence is in Cause History
- fix-owner: N/A: no active cause - final evidence is in Cause History
- benchmark-command: N/A: no active cause - final evidence is in Cause History
- benchmark-rerun: N/A: no active cause - final evidence is in Cause History
- benchmark-rerun-result: N/A: no active cause - final evidence is in Cause History
- correctness-command: N/A: no active cause - final evidence is in Cause History
- correctness-rerun: N/A: no active cause - final evidence is in Cause History
- correctness-rerun-result: N/A: no active cause - final evidence is in Cause History
- resume-lane: N/A: no active cause - all applicable lanes are complete

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BCB-001 | owner-microbench-and-trace | kept | internal-implementation | keep list prop injection explicitly element-scoped; do not add inference machinery or delete retained rendering | benchmark | N/A: inapplicable - existing inject scope contract was misconfigured; no public API or runtime architecture changed | N/A: inapplicable - internal scope metadata correction preserves list item props and serialization | `list.tsx` and `list-static.tsx`, with `list.spec.tsx` as the guard | ListPlugin alone disabled retained flow; `isElement: true` restored it and made exact 10k queryable | pass: exact 10k text, final line, editability, retained host, native insertion, undo, and zero browser errors | Browser exact full EditorKit `/docs/code-block` 10k navigation-to-queryable probe | pass: exact retained product route became queryable in 4,021ms; separate minimal kernel target honestly remains red at max budget ratio 1.67 | `bun test apps/www/src/registry/components/editor/list.spec.tsx` plus registered code-block correctness command | pass: 3 ListKit tests, 58 code-block tests, 18 matching Chromium proof rows, and exact product edit/undo | Browser and `minimal-product-final.json` |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| BCB-READY-001 | source-and-host-readiness | registered artifact was stale and composition-unfair | prior synthetic JS artifact versus exact product TypeScript fixture | correctness passed | invalidate prior headline | rerun matched fixture and narrow target wording |
| BCB-001 | owner-microbench-and-trace | unscoped ListPlugin element injection disables retained text flow globally | 10k crash before; 4,021ms navigation-to-queryable after | exact text/edit/undo pass | keep | finish lanes and close |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| product navigation / queryable | pre: 10k two crash repros; 1k one complete fallback at about 51s | crash / about 51s at 1k | fixed 10k: 4,021ms exact queryable | crash removed; larger fixture meets 5s veto | high for cause; one post-fix navigation sample, used as veto not percentile | Browser exact route |
| minimal kernel mount-to-paint | 5 | N/A: stale synthetic fixture invalidated | p50 214.9 / p75 216.9 / p95 219.6 / max 219.6 | p95 is 1.08x 204ms budget | timing-grade headless Chromium; exact fixture | `minimal-product-final.json` |
| minimal kernel input-to-paint | 20 | N/A: stale synthetic fixture invalidated | p50 280.7 / p75 301.4 / p95 334.8 / max 345.8 | p95 is 1.67x 200ms budget | timing-grade headless Chromium; exact midpoint native input | `minimal-product-final.json` |
| minimal kernel highlight settle | 20 | N/A: stale synthetic fixture invalidated | p50 591.0 / p75 610.1 / p95 648.4 / max 654.9 | p95 is 1.08x 600ms budget | Lowlight source p95 75.1ms; render residual p95 583.3ms | `minimal-product-final.json` |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | complete | Run the exact metrics, comparisons, and correctness proof named above | exact 10k product route passed the 5s veto; minimal runner produced full sample receipt |
| Benchmark plan structural validation | complete | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-09-03-find-plate-code-block-product-benchmark-gap.md` at cause/resume checkpoints | checkpoint validation passed |
| Every applicable lane closed | complete | Complete or mark N/A with concrete reason | 7 complete, 2 inapplicable, 0 pending |
| Exact post-fix benchmark reruns | complete | Rerun every kept fix against its original lane/baseline | exact full EditorKit 10k route passed; minimal target reran on exact fixture |
| Correctness/native behavior reruns | complete | Run named tests and Browser/Chrome/device proof required by the claim | 3 ListKit, 58 code-block, 18 Chromium rows, Browser insert/undo |
| Final source/host identity | complete | Prove final artifacts still match candidate and baseline identities | hashes and fresh runner receipt recorded above |
| Benchmark target/metric honesty | complete | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | target says minimal kernel and runs exact TypeScript fixture; product is a separate veto |
| Durable fix decision | complete | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | internal ListKit scope correction kept; no architecture/public-API plan applies |
| Package/type/build proof | complete | Run affected package checks/typecheck/build only where owned | focused Bun tests and package build inside target passed; broad www typecheck remains blocked by unrelated migration export drift |
| Browser surface proof | complete | Run Browser for product routes; Chrome/device for native state when applicable, or N/A with reason | exact 10k retained route, final line, editability, insert, undo, zero errors passed before unrelated registry-wide import blocked fresh tabs |
| Changeset/release artifact | complete | Add only for published package behavior/API changes, otherwise N/A | N/A: registry-only work uses the generated registry changelog |
| Agent rule/skill sync | complete | Run `pnpm install` and mirror/resource checks when agent sources changed, otherwise N/A | N/A: no agent source changed |
| Benchmark plan complete validation | complete | Run validator with `--complete` | passed |
| Final lint | complete | Run `pnpm lint:fix` or scoped equivalent | scoped Ultracite check passed on all changed code/config files |
| Timed checkpoint | complete | Satisfy requested duration and close current packet, otherwise N/A | N/A: no duration requested |
| P1 autoreview | complete | Run dirty local P1 review for non-trivial code/skill changes and close accepted findings, otherwise N/A | N/A: current checkout is `next`, where repo rules prohibit autoreview |
| Goal plan complete | complete | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-03-find-plate-code-block-product-benchmark-gap.md` | passed after all gates resolved |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | source identities and mismatches recorded | ordered diagnosis |
| Ordered diagnosis | complete | ListPlugin isolated by product composition bisection | cause gate |
| Fix and exact rerun | complete | element-only scope restored retained 10k product rendering | remaining breadth |
| Remaining breadth | complete | exact fixture runner and product correctness lanes closed | final verification |
| Review and closeout | complete | lint, tests, registry, changelog, complete benchmark validator, and Autogoal checker pass | final response |

Findings:
- The prior Plate headline came from a minimal two-plugin bundled harness, not
  the real Code Block docs composition.
- The stored artifact was stale and used a cheaper JavaScript fixture. The
  registered target now names the minimal kernel and runs the exact product
  TypeScript fixture.
- ListPlugin supplied an element-only `transformProps` injection without
  `inject.isElement`. `pipeRenderText` therefore classified it as possible text
  work and disabled retained text flow for every Text in the editor.
- The one-property correction restored retained flow. The full EditorKit route
  renders one exact editable 10k Text without a renderer crash.
- The repaired minimal target is still red: input p95 is 334.8ms against 200ms.
  This is real residual rendering/highlighting cost, not permission to call the
  whole Plate product fast.

Decisions and tradeoffs:
- Keep the existing explicit scope contract. ListPlugin's callback reads an
  element and targets element plugins, so `isElement: true` is the correct
  semantic declaration, not a benchmark-only bypass.
- Do not add core target inference for one incorrect registry configuration.
  The explicit scope is clearer and already used by other kits.
- Keep the 10k demo. The fixed product route meets the product veto and exposes
  the remaining red editing budget instead of hiding it behind a 1k fixture.

Harness/methodology repairs:
- The runner records fixture kind, language, and React environment.
- The registered target uses the exact product-shaped TypeScript fixture.
- Target wording says `minimal two-plugin code-block kernel`; product
  composition remains a separate Browser veto.
- Browser locator keypress duration is excluded from timing claims because its
  roughly 2.5s action stabilization persisted even when no input was inserted.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| Browser `pressSequentially` lost focus while retained DOM updated | 1 | use one atomic native keypress through the stable editable root | insertion and undo passed |
| Fresh Browser tab exposed unrelated missing `migratePlateV55` generated-registry import after registry rebuild | 1 | retain the already-complete exact final interactive proof and report the unrelated post-build blocker | relevant final runtime source bytes are unchanged from the passing 10k proof |

Verification evidence:
- Pre-diagnosis symptom evidence lives in
  `docs/plans/2026-09-03-add-huge-code-block-demo.md`.
- Fresh minimal receipt:
  `docs/plans/artifacts/2026-09-03-find-plate-code-block-product-benchmark-gap/minimal-product-final.json`.
- Registry generation passed and emitted `isElement: true` in both interactive
  and static list payloads.

Final handoff contract:
- goal plan / scope: exact Code Block product-versus-minimal benchmark gap; `editor-ai` excluded
- candidate / baseline identities: HEAD `a6afd55...`; source hashes and fresh runner receipt recorded above
- completed / N/A / pending lanes: 7 complete; 2 inapplicable; 0 pending
- first conclusive cause: BCB-001, unscoped ListPlugin element injection disabled retained text flow
- baseline / latest / best metrics: product crash to 4,021ms queryable; minimal input p95 334.8ms and still red
- fix owner / changed files: ListKit interactive/static scope declarations and regression spec; benchmark target/runner honesty; 10k demo/changelog
- exact benchmark and correctness reruns: product exact text/edit/undo/zero errors, 3 ListKit tests, 58 code tests, 18 Chromium rows, registry build
- resumed breadth: pending
- packet decisions: pending
- harness/methodology repairs: pending
- residual claim limits / next owner: pending

Timeline:
- 2026-09-03T10:29:07.891Z Benchmark goal plan created.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Intake and comparison authority |
| Where am I going? | Ordered diagnosis, fix/rerun, remaining breadth, closeout |
| What is the goal? | Find and repair the product-versus-minimal benchmark gap, then isolate the real hot owner. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Dev-mode docs overhead and concurrent machine memory pressure can amplify the
  symptom. Production and minimal hosts must be measured separately before the cause gate.
