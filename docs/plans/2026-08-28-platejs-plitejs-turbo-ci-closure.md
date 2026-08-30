# platejs plitejs turbo ci closure

Objective:
Close Platejs/Plitejs entrypoint CI; done when import-law, affected-task,
no-duplication, benchmark, and correctness gates pass; plan
docs/plans/2026-08-28-platejs-plitejs-turbo-ci-closure.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-28-platejs-plitejs-turbo-ci-closure.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: Repair the consolidated `platejs` / `plitejs` task graph before the
  next package cut. Preserve direct-only package dependency permissions at
  entrypoint granularity, including separate root and React permissions; drive
  invalidation from actual imports; eliminate false-green, duplicated, stale,
  and empty CI work; keep the result at least as scalable as the deleted
  multi-package graph.
- scope: `tooling/entrypoints/**`, the entrypoint runners and contracts,
  generated `packages/{platejs,plitejs}` task/typecheck files, root task
  scripts/config, and owning GitHub workflows. `@platejs/ai` is the concrete
  boundary example, not a feature-migration target in this packet.
- invocation: `$benchmark platejs-plitejs turbo-ci closure` accepted as the
  measured implementation lane from the user's `ok go`.
- candidate-identity: fingerprint: current checkout at
  `98184323b5fde44e423d71d8597a6cfeb5c233f8`; evolving tooling fingerprint is
  recomputed after every kept packet; starting fingerprint
  `874552d5cddf48a11501c3ea15c90dc335a1d2c743dcdc3c6537dc0178002691`;
  final focused fingerprint
  `d346898d5230f9708df9f2e740257c000d1f621db3513d91c75df86dfd566483`
  across 76 scoped entries, including the deleted duplicate Plite workflow.
- plate-main-identity: N/A: this measures build orchestration, not Plate editor
  runtime; the immutable baseline is the pre-repair current-tree fingerprint.
- plite-identity: current `packages/plitejs` source at the candidate checkout;
  controlled mutations use one Plite leaf and are restored byte-for-byte.
- slate-identity: N/A: no editor substrate/runtime comparison applies.
- named-symptom: root aggregate checks can no-op under Turbo `--only`; allowed
  import edges are forced into execution edges; a Plite leaf edit reruns
  unrelated contracts and takes 3.769 s versus the old 3.352 s package-wide
  warm baseline; 69 check tasks include empty/over-broad work; general and
  Plite CI overlap.
- final-artifacts: artifact: `docs/plans/2026-08-28-platejs-plitejs-turbo-ci-closure.md`
  plus the canonical graph, generated task/typecheck files, graph contracts,
  and owning workflows.

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
- semantics: N/A: outcome-gated one-shot execution.
- start / deadline: N/A.
- final loop closure: finish the active repair, restore controlled mutations,
  rerun exact benchmark/correctness gates, then close every applicable row.

Completion threshold:
- Root `pnpm typecheck` and `check:core` execute the required Plate/Plite leaf
  source tasks; aggregate runners cannot return a false green under `--only`.
- Import permissions are direct-only and entrypoint-scoped. Allowed-but-unused
  edges do not become Turbo or TypeScript execution dependencies; actual
  production/test/contract imports determine their respective closures.
- No generated runtime-test task has zero owned tests. Contract and type-test
  tasks reference only actual import closures. Package builds remain atomic.
- A controlled Plite leaf edit reruns only its actual reverse closure, does not
  rerun unrelated Plate/Plite contracts, and has warm median wall time below
  3.352 s across three measured runs on this machine.
- Generated lint/test/typecheck tasks are at most 50, materially below the
  current 69, without weakening source, type, test, boundary, or packed-release
  proof.
- CI has one owner for Plate/Plite package checks, restores a source-safe Turbo
  cache or selects an exact changed closure on a cold runner, contains no
  deleted Plite package paths, and does not rerun the same 118 specs in both
  general and dedicated jobs.
- The canonical graph can accept future `platejs/<feature>` and
  `platejs/<feature>/react` entries without bespoke CI wiring. Old direct
  package dependencies seed permissions but are audited against real
  production imports; transitive permission and cycles remain forbidden.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`; P1 autoreview is N/A on
  `next` because repo law prohibits it; the Autogoal checker passes.

Verification surface:
- benchmark commands / artifacts: Turbo dry graphs and summaries, exact
  generated task counts, three-run warm aggregate and controlled-leaf timings,
  and the slow mutation contract.
- correctness commands: entrypoint graph/generator tests, generated-state
  check, root typecheck/check-core scheduling proof, `check:plite:contracts`,
  Plite typecheck/test/release-boundary gates, and package build/type proof.
- Browser / Chrome / device proof: Browser renders `/docs/toc` and
  `/cn/docs/toc` because closing the root docs audit required a TOC reference
  repair; Chrome/device remain N/A because no native browser behavior changed.
- source/ref/fingerprint proof: exact HEAD, lockfile/tooling hashes, generated
  file parity, controlled-mutation restoration, and final fingerprint.

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
- Preserve the public `platejs` / `plitejs` entrypoints and atomic shared-`dist`
  builds. Do not perform the next feature-package cut in this packet.
- Peer dependencies remain installation contracts, not architectural
  enforcement. Oxlint owns direct-only internal/external import permission;
  actual imports own task invalidation.
- Do not hand-author generated package task/typecheck files; repair the
  canonical graph/generator and regenerate them.

Boundaries:
- allowed runtime/packages/apps: root tooling/config, `packages/platejs`,
  `packages/plitejs`, workflow/package metadata required by their CI, and the
  exact List/AI/Media/docs owners needed to close the repository gates exposed
  by the cut.
- allowed benchmark/tests/fixtures: entrypoint generator/plugin/slow mutation
  contracts and temporary byte-restored source mutations.
- allowed baseline checkouts/hosts: this checkout and machine only; no sibling
  worktree or external host required.
- non-goals: moving `@platejs/ai` or other feature source, changing public
  editor behavior/API, publishing, release versioning, UI/browser work, or
  benchmarking Plate/Plite/Slate editor runtime.

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- Stop only if the same install/environment failure survives the repo's single
  permitted reinstall recovery and three distinct scoped attempts, or if
  preserving correctness requires a public API/runtime decision outside the
  accepted tooling boundary. Otherwise diagnose and continue.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | same HEAD plus post-repair focused fingerprint | HEAD `98184323...`; pre-repair fingerprint `874552d5...` | artifact: this plan's source identity and final fingerprint rows |
| lockfile / package manager | lock `549df2e8...`; pnpm 9.15.0; Node 22.22.1 | identical | artifact: this plan's Benchmark Source and final lock hash |
| build mode / host / port | local Turbo CLI on this machine; no server port | identical | artifact: exact commands in the metric table |
| browser / machine / viewport / DPR | same local machine; CLI-only, viewport and DPR unused | same local machine and CLI-only mode | artifact: Browser completion gate records the inapplicable UI surface |
| route / fixture / document / plugins | generated Plate/Plite graph plus one Plite leaf mutation | identical source fixture before repair | artifact: controlled mutation rows and restored source hash in this plan |
| setup / action / DOM strategy | warm aggregate checks and controlled add/edit/rename/delete graph contract | identical commands and no editor DOM | artifact: metric table and slow mutation contract |
| warmups / samples / interleave order | one warmup plus three timed leaf runs; exact full-graph forced/warm summaries | same sampling contract | artifact: metric table reports sample count, p50, max, and range |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | request, scope, thresholds, constraints, boundaries, and final handoff are recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `benchmark` source and methodology read | yes | `.agents/skills/benchmark/SKILL.md` and `references/methodology.md` read completely before measurement |
| Active goal checked or created | yes | no prior goal; active goal created with this plan path |
| Candidate and baseline identities recorded | yes | comparison signature and focused starting fingerprint above |
| Target/runner discovery completed from current source | yes | existing `entrypoint-turbo`, runner, graph, package scripts, and workflow owners named in scope; exact inventory is first diagnostic packet |
| Host/build/fixture freshness proved | yes | same checkout/machine; HEAD, Node, pnpm, lockfile, and focused hashes captured before repair |
| Correctness oracle identified | yes | generator/plugin/slow contracts plus Plite type/test/release-boundary and root scheduling gates named above |
| All default lanes inventoried | yes | lane table below resolves all nine methodology lanes |
| `only` narrowing explicitly authorized or N/A | no | N/A: normal scoped run; editor-runtime lanes are genuinely inapplicable, not excluded by `only` |
| Browser/native proof strategy selected | yes | Browser verifies the English and Chinese TOC docs added by root-audit closure; Chrome/device are inapplicable |
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
      execution may use `auto`; target selection may not. N/A: the cause was
      internal task orchestration, not a public API or editor runtime change.
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
| 1 | source-and-host-readiness | yes | complete | HEAD `98184323...`, Node 22.22.1, pnpm 9.15.0, lock `549df2e8...`; controlled leaf restored to SHA-256 `176e13aa...`; graph and CI inventories captured | none |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - no editor product/runtime surface changes | orchestration source has no product smoke surface | none |
| 3 | plate-vs-plite-decomposition | no | N/A: inapplicable - orchestration cost is already isolated outside editor layers | the owner is the task graph, not either editor runtime | none |
| 4 | owner-microbench-and-trace | yes | complete | 69 to 46 generated checks; diff-edit p50 3.596 s to 2.57 s; forced graph 30.574 s to 27.70 s; exact mutation contract green | none |
| 5 | product-mount-matrix | no | N/A: inapplicable - no mount/runtime claim | no editor mount behavior changed | none |
| 6 | trusted-editing-matrix | no | N/A: inapplicable - no editing/runtime claim | no editor action changed | none |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - no substrate/runtime claim | no Slate comparison applies to CI orchestration | none |
| 8 | example-breadth | no | N/A: inapplicable - no example/runtime change | package and workflow source only | none |
| 9 | large-and-stress | no | N/A: inapplicable - task-graph scaling is measured directly | forced full graph and exact mutation closure cover the scaling claim | none |

## Current Cause Checkpoint

- state: none
- last-resolved-cause: `ORCH-001`, recorded below
- cause-id: N/A: no active cause
- lane: N/A: no active cause
- comparable-baseline: N/A: no active cause
- material-delta: N/A: no active cause
- isolated-owner: N/A: no active cause
- causal-intervention: N/A: no active cause
- correctness-guard-result: N/A: no active cause; scoped results are in Cause
  History and repository-wide failures are recorded below
- fix-class: N/A: no active cause
- long-term-target: N/A: no active cause
- decision-owner: N/A: no active cause
- layer-plan: N/A: no active cause
- compatibility-verdict: N/A: no active cause
- fix-owner: N/A: no active cause
- benchmark-command: N/A: no active cause
- benchmark-rerun: N/A: no active cause
- benchmark-rerun-result: N/A: no active cause
- correctness-command: N/A: no active cause
- correctness-rerun: N/A: no active cause
- correctness-rerun-result: N/A: no active cause
- resume-lane: N/A: applicable benchmark breadth is complete

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ORCH-001 | owner-microbench-and-trace | kept | internal-implementation | public import permissions plus separate internal partitions; actual imports alone own execution dependencies | benchmark | N/A: internal task orchestration has no editor layer plan | N/A: internal tooling only; no public compatibility surface changed | entrypoint graph/generator and owning CI workflows | allowed import edges forced unrelated execution; aggregate `--only` returned green without leaves; two workflows owned the same specs | pass: existing package correctness was green; the red surface was orchestration breadth and false-green execution | `pnpm turbo run typecheck --filter=plitejs --filter=platejs...` plus forced/warm full graph | pass: diff p50 2.57 s; forced full 27.70 s; warm p50 0.89 s | DAG/generator/workflow contracts, `check:plite:contracts`, package type/test/release boundaries | pass: 192 contracts, package tests, types, and isolated packed boundaries | slow mutation contract proves exact reverse closure and aggregate rejection |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| baseline inventory | source-and-host-readiness | task graph conflated public permission and execution policy | 69 checks; seven empty test tasks; diff p50 3.596 s | existing focused package proof green | keep as immutable baseline | partition owner |
| graph and runner | owner-microbench-and-trace | separate permissions, partitions, and actual import closure | 46 checks; five-task diff reverse closure | slow mutation and false-green contracts green | keep | CI ownership |
| CI ownership | owner-microbench-and-trace | general CI owns package proof; Plite CI owns adopter/browser proof | 118 consolidated specs are not in the generic suite or dedicated browser workflow twice | 192 workflow/routing contracts green | keep | final package proof |
| broad repository gates | remaining breadth | declaration carriers and stale schema/docs fixtures prevented the root graph from proving the cut | root `pnpm typecheck` and `pnpm check:core` both green after owner repairs | root and scoped Plate/Plite checks are green | keep the owner fixes and the package-native `check:core` test routing | none |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| generated check count | exact graph count | 69 / N/A / N/A / N/A / 69 | 46 / N/A / N/A / N/A / 46 | -23 / -33.3% | exact deterministic count | Turbo dry JSON and generator contract |
| controlled Plite diff edit | 3 baseline + 3 final | 3.596 s / N/A / N/A / N/A / 3.628 s | 2.57 s / N/A / N/A / N/A / 2.83 s | -1.026 s / -28.5% | same file, command, machine; range 2.51-2.83 s | `/usr/bin/time -p pnpm turbo run typecheck --filter=plitejs --filter=platejs...` |
| deleted multi-package target | 3 final | 3.352 s / N/A / N/A / N/A / N/A | 2.57 s / N/A / N/A / N/A / 2.83 s | -0.782 s / -23.3% | target supplied by the pre-cut package graph | same controlled edit |
| forced full graph | 1 baseline + 1 final | 30.574 s / N/A / N/A / N/A / 30.574 s | 27.70 s / N/A / N/A / N/A / 27.70 s | -2.874 s / -9.4% | same 118 package specs and type/lint surface | direct Turbo with `--force` |
| warm full graph | 3 baseline + 3 final | 0.928 s / N/A / N/A / N/A / 0.979 s | 0.89 s / N/A / N/A / N/A / 0.90 s | -0.038 s / -4.1% | candidate scripts remove one nested pnpm launcher; same task action | direct Turbo warm graph |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | graph, mutation, root, package, workflow, and packed-boundary thresholds pass |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-08-28-platejs-plitejs-turbo-ci-closure.md` at cause/resume checkpoints | structurally valid after final evidence update |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | complete |
| Exact post-fix benchmark reruns | yes | Rerun every kept fix against its original lane/baseline | complete; final controlled mutation and forced/warm graph recorded above |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | root and package/tooling gates green; Browser renders both touched TOC docs with a mounted preview and zero errors; Chrome/device N/A |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | HEAD unchanged; controlled source restored to `176e13aa...`; final focused fingerprint `d346898d...` across 76 scoped entries |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | complete; n=3 reports only p50/max and range |
| Durable fix decision | yes | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | `ORCH-001` complete; `best-api repair` reaffirmed that the declaration fix preserves the existing semantic AI update owner and private compiler carrier, so no new API or layer plan applies |
| Package/type/build proof | yes | Run affected package checks/typecheck/build only where owned | `plite:typecheck`, `plite:test`, `check:plite:contracts`, and release boundaries green |
| Browser surface proof | yes | Run Browser for product routes; Chrome/device for native state when applicable, or N/A with reason | `/docs/toc` and `/cn/docs/toc` return 200, show their headings and ownership text, mount one editable preview, and emit zero browser errors |
| Changeset/release artifact | yes | Add only for published package behavior/API changes, otherwise N/A | existing `platejs-product-codecs.md`, `core-plugin-override-contract.md`, `ai-typed-property-mutations.md`, and `quick-media-codecs.md` cover the exact owner repairs |
| Agent rule/skill sync | yes | Run `pnpm install` and mirror/resource checks when agent sources changed, otherwise N/A | `pnpm install` green; `plate-feature` source/mirror section parity is exact |
| Benchmark plan complete validation | yes | Run validator with `--complete` | `Benchmark plan: complete.` after repository-wide correctness closure |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | scoped Ultracite fix/check, Oxlint boundary audit, Oxfmt check, and YAML parse green |
| Timed checkpoint | no | Satisfy requested duration and close current packet, otherwise N/A | N/A: no duration requested |
| P1 autoreview | no | Run dirty local P1 review for non-trivial code/skill changes and close accepted findings, otherwise N/A | N/A: repo law prohibits autoreview on `next` |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-platejs-plitejs-turbo-ci-closure.md` | checker passes after all repository gates close |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | identities, task graph, workflows, and baselines captured | none |
| Ordered diagnosis | complete | `ORCH-001` proved by dry graph, mutation, and false-green reproduction | none |
| Fix and exact rerun | complete | graph/generator/runner/CI repair and exact reruns green | none |
| Remaining breadth | complete | root and package types/tests/contracts/release boundaries plus focused Browser proof green | none |
| Review and closeout | complete | root `pnpm typecheck`, `pnpm check:core`, generated-state, contract, package, packed-boundary, Browser, lint, and plan gates are green | none |

Findings:
- Current graph starts from 69 lint/test/typecheck tasks and conflates allowed
  entrypoint edges with required execution edges.
- Root aggregate runners exit successfully under `TURBO_HASH`; root/check-core
  `--only` calls can therefore skip real Plate/Plite source typecheck/lint work.
- Current workflow ownership overlaps general and Plite CI and retains deleted
  Plite package paths.
- Plate's plugin definition carriers required writable mapped properties so
  declaration builds could preserve inferred node mutation types across
  package boundaries.
- `check:core` must delegate consolidated roots to their generated package
  test graphs; forcing Plite React tests through Bun/Happy DOM duplicated work
  and changed the suite's browser model from its owning Vitest/jsdom runner.

Decisions and tradeoffs:
- Keep public entrypoint DAG and internal task partitions separate: public
  imports are API law; task partitions are build-performance policy.
- Old package dependencies seed direct-only permissions, then current
  production imports sharpen them. `ai` and `ai/react` require distinct
  permissions. Allowed-but-unused permissions never force invalidation.
- Keep one atomic build task per package because both packages share one
  cleaned `dist`; optimize lint/test/typecheck partitions instead.
- Keep the exact slow add/edit/rename/delete/root/leaf mutation contract; it is
  high-signal protection, not redundant CI ceremony.
- General CI owns package checks and a source-safe root Turbo cache. Dedicated
  Plite CI owns adopter and browser proof only. Generic tests exclude the
  consolidated package specs.
- Hash `CI` only for builds and runtime tests whose behavior can change; do not
  invalidate lint/type work for an irrelevant environment variable.
- Replay only errors from cached generated tasks and call the local Turbo
  binary directly inside scripts/runners to remove package-manager launch cost.

Harness/methodology repairs:
- Split public import permissions from internal task partitions and actual
  import closures.
- Aggregate tasks now reject uncached `--only` execution instead of returning a
  false green.
- Generated test tasks exist only when a partition owns runtime tests.
- Added cross-package cycle validation and package/workflow ownership contracts.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| Initial combined contract output exceeded the useful tail | 1 | rerun to a temporary log and inspect only the failing assertion | all focused contracts pass |
| Ruby 2.6 rejected the newer `aliases:` YAML loader option | 1 | use the compatible loader after confirming workflows have no custom classes | every workflow parses |
| `check:plite:contracts` retained one old Plite-workflow ownership assertion | 1 | move the assertion to root CI and forbid package proof in dedicated Plite CI | exact rerun passes 192/192 |
| `pnpm typecheck` fails at `@platejs/list` declaration build | 2 scoped reproductions | repair the writable Plate plugin carriers at their canonical owner | resolved; full root typecheck passes 90/90 tasks |
| `check:core` stops at committed schema-adoption findings | 1 | repair Media Embed and migration fixtures without weakening the audit | resolved; schema adoption audit passes |
| `check:core` ran Plite React tests with Bun/Happy DOM | 3 distinct failures | delegate consolidated roots to the generated package-native graph | resolved; full `check:core` passes |
| Testing Library cloned a prototype-only fake clipboard under Happy DOM | 1 | reuse Plite's own-data-property `createDataTransfer` test helper | resolved under both Bun and Vitest |

Verification evidence:
- DAG/generator/workflow focused contracts: 70/70 green; full Plite contract
  composition: 192/192 green.
- Slow graph proof: aggregate `--only` rejection and exact mutation closure
  3/3 green.
- `pnpm plite:typecheck`: 18/18 generated type tasks plus Browser/Yjs green.
- `pnpm plite:test`: 24/24 cached graph tasks, Browser 108/108, Yjs 224/224.
- `pnpm plite:release:boundaries`: isolated headless/React/Layout/Yjs packed
  consumers green.
- `pnpm typecheck`: 45 package builds and 90 total tasks green.
- `pnpm check:core`: all audits, 42 reviewed package typechecks/lints, generic
  contracts, generated Plate/Plite test graphs, and remaining package tests
  green.
- Turbo dry graph: exactly 46 generated Plate/Plite checks, zero empty runtime
  test tasks, and every aggregate retains its partition dependencies.
- Browser: English and Chinese TOC docs render their changed ownership text and
  editable preview with zero console errors.
- `best-api repair`: root/common/Plate doctrine and the authoring-inference
  reference already require inference at the owning generic, private lowering
  carriers, and no callback annotations; affected worker-skill audit found no
  stale `clearPreviewNodes` or `EditorNodeUnsetOptions<Descendant>` teaching, so
  no doctrine edit was justified.
- Scoped Oxlint, generated-state check, workflow YAML parse, and controlled
  source restoration green.
- Root dry graph retains every Plate/Plite partition dependency and both source
  scripts contain no `--only`.

Final handoff contract:
- goal plan / scope: this plan; entrypoint graph/generator/runners, generated
  Plate/Plite task state, root scripts, and owning workflows
- candidate / baseline identities: same HEAD, lockfile, package manager, machine,
  controlled source, and fixture
- completed / N/A / pending lanes: both applicable benchmark lanes and final
  Browser proof complete; editor runtime/native lanes N/A; no pending lane
- first conclusive cause: `ORCH-001`
- baseline / latest / best metrics: 69 to 46 checks; 3.596 s to 2.57 s diff
  p50; 30.574 s to 27.70 s forced full graph
- fix owner / changed files: canonical entrypoint graph/generator/runners,
  generated Plate/Plite configs, root test routing, CI workflows, and
  `plate-feature` source doctrine
- exact benchmark and correctness reruns: recorded above
- resumed breadth: types, unit contracts, package specs, Browser/Yjs package
  tests, and isolated packed boundaries complete
- packet decisions: keep all graph, owner-inference, audit, runner, and docs
  repairs
- harness/methodology repairs: permission/partition/closure split, false-green
  guard, exact test ownership, cycle contract
- residual claim limits / next owner: GitHub-hosted cache reuse is
  source-verified but not live-observed; no local closure blocker remains

Timeline:
- 2026-08-28T11:58:33.813Z Benchmark goal plan created.
- 2026-08-28 requirements extracted; Benchmark and Autogoal instructions read;
  goal created; HEAD/tool versions/lock and focused pre-repair fingerprint
  captured before measurement.
- 2026-08-28 `ORCH-001` fixed and exact graph/mutation/package/CI reruns passed;
  root closeout exposed unrelated List declaration and schema-adoption failures.
- 2026-08-28 repaired the exact declaration, schema/docs, and package-test-runner
  owners; root and scoped correctness, packed boundaries, and Browser proof
  passed.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Review and closeout complete |
| Where am I going? | Final handoff; no implementation step remains |
| What is the goal? | Make the consolidated Plate/Plite CI dependency-honest, non-duplicated, and measurably more scalable before feature cutout |
| What have I learned? | See Findings and `ORCH-001` |
| What have I done? | Implemented and proved the graph, cache, CI ownership, owner inference, audit, runner, docs, and skill-doctrine repairs |

Open risks:
- GitHub-hosted cache reuse has contract/source proof but no live workflow run
  in this local packet; all locally executable gates are green.
