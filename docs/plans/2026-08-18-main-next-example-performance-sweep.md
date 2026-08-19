# main next example performance sweep

Objective:
Find performance regressions across runnable Plate/Plite examples versus main, including huge document; done when a frozen-harness exact-ref matrix covers comparable routes, suspicious deltas are repeated, and ranked evidence names each owner.

Goal plan:
docs/plans/2026-08-18-main-next-example-performance-sweep.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: performance investigation and example sweep
- prompt / link: user request to find other perf issues versus main, including huge document
- lane: shared Plate/Plite example and browser-performance lane
- surface / route / package: all runnable comparable example routes on exact `origin/main` and `origin/next`; huge document gets a dedicated interaction/memory pass
- invocation mode: full-loop, finding/proof only
- minimum runtime / deadline: N/A: no duration requested
- completion threshold summary: inventory comparable examples, run one frozen alternating-branch sweep, repeat every suspicious delta five times, and rank confirmed regressions with correctness/owner evidence

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: route coverage and quantitative thresholds apply
- improvement loop: full-loop until the complete comparable matrix and suspicious reruns close
- final score / loop closure: N/A

Completion threshold:
- Exact pushed refs for `origin/main` and `origin/next` are recorded; both use isolated fresh builds/hosts and one frozen harness.
- Every example route runnable on both refs is measured or classified non-comparable with source evidence. Pagination is excluded because the user did not name it.
- The broad pass records route readiness, startup/ready latency, one representative interaction where editable, long tasks, DOM count, and heap when the browser exposes it.
- Huge document records normal/large/stress cohorts where the route supports them, plus startup, top/middle/end typing, scroll, Enter burst, paste/undo, DOM/memory tags, long tasks, correctness, and degradation mode.
- A suspicious regression requires both >=20% relative and >=20 ms absolute interaction degradation, or >=25% memory/DOM growth, or a new correctness/long-task failure. Every suspicious row is rerun five retry-free alternating branch runs.
- Final output ranks confirmed regressions, rejected noise/non-comparable rows, proof limits, and next owners. No runtime patch is made in this pass.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-main-next-example-performance-sweep.md` passes.

Verification surface:
- Git ref/source inventory for exact `origin/main` and `origin/next`
- one frozen Chromium/Playwright measurement harness and raw JSON artifacts under `.tmp/main-next-example-performance/`
- alternating branch blocks with route, interaction, long-task, DOM, heap, and correctness receipts
- dedicated huge-document trace/interaction artifact and existing huge-document behavior tests as oracle context
- exact reruns for every threshold-crossing row; no average-only claims
- source audit mapping each confirmed hot lane to its current owner without implementation changes
- Plite package proof uses `pnpm plite:test` and `pnpm plite:typecheck`.
- Plite daily proof uses `pnpm check:plite`.
- Plite focused browser proof uses `pnpm --filter plite test:plite-browser:chromium <file-or--grep>`.
- `apps/plite` reuses `apps/www` Plite examples; never maintain a second example source tree.
- Plite release/deletion proof adds explicit closure gates such as package
  build, docs checks, benchmark target audit, and
  `pnpm check:plite:browser-matrix` when those claims are in scope.

Constraints:
- Resolve lane first: Plite, Plate, or shared editor. Use `autoclosure` for post-merge/current-tree until-clean closure.
- Release, PR, and publish work are in scope only when the prompt explicitly asks for them or the active lane requires them.
- Plite-lane proof runs from the Plate repo root against transplanted Plite packages and routes. Do not use donor-checkout proof.
- Plate-lane proof runs in the owning Plate package, app, or docs route. Plite runtime proof does not prove Plate docs, registry, plugin, or package DX.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a stopping checkpoint routes to `plite-plan`.
- Do not patch Plate when the run is scoped to Plite. Do not patch Plite runtime when the run is scoped to Plate docs/product unless a shared-editor owner row names that boundary.
- Use root `VISION.md` and relevant `docs/vision/*.md` for durable taste.
- Do not create compatibility aliases or runtime shims unless the checkpoint explicitly requires them.

Boundaries:
- Source of truth: exact refreshed `origin/main` and `origin/next` commits; current source only supplies a frozen harness after compatibility audit
- Allowed edit scope: this plan and `.tmp/main-next-example-performance/**` measurement artifacts only; no product/runtime fixes
- Browser surfaces: desktop Chromium example routes and dedicated huge-document scenarios; exact Chrome only if a confirmed delta needs human/profile proof
- Package/API surfaces: read-only owner mapping and existing test/benchmark commands
- Agent/skill surfaces: N/A unless the sweep itself exposes a reusable harness failure
- Docs/research surfaces: current plans/vision/test sources as proof context; no docs rewrite
- Non-goals: fixing regressions, public issue mutation, commit/push/PR/release, raw mobile devices, pagination, or treating dirty current source as either branch

Output budget strategy:
- Count route/test inventories before printing names; write raw sweep and trace output to `.tmp/main-next-example-performance/**`; show only compact ranked summaries and inspect exact suspect owners.

Blocked condition:
- Block only if neither branch can build a common proof host, Chromium cannot run, or no semantically comparable example surface exists after exact source mapping. Individual broken routes are classified and the sweep continues.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: shared Plate/Plite performance investigation
- surface: comparable examples plus huge document
- mode: full-loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 3
- current_checkpoint: final-handoff
- current_checkpoint_status: completed
- next_checkpoint: fix packets require separate user authority
- goal_status: investigation complete; active goal tool remains owned by unrelated #5066 promotion

Current verdict:
- verdict: regressions confirmed
- confidence: high for route correctness, startup latency, fresh-tab heap, and bundle evidence; no valid huge-document interaction comparison because `next` cannot mount and the branch-native benchmark is invalid
- next owner: `patch` for one normalized fix packet at a time; first cut eager DOCX/CSV cost from `EditorKit`, then repair schema coverage and the huge benchmark lifecycle
- keep / revert / quarantine call: keep evidence; quarantine branch-native public benchmark results
- reason: five alternating Browser runs confirm threshold-crossing deltas, while exact Browser replay proves seven `next` route failures

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-main-next-example-performance-sweep.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | completed | P0 | Copy prompt requirements and read vision before implementation. | Requirements and root/common/Plite/Plate doctrine recorded. | update |
| status | auto | completed | P0 | Read active plan, latest prompt, source status, and current evidence. | Exact refs, 26 common registry demos, branch-only surfaces, huge source, and harness divergence recorded. | update |
| gap-scan | auto | completed | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | 26-route matrix, five-run confirmations, bundle/CPU evidence, and benchmark rejection recorded. | update |
| closure-handoff | autoclosure | completed | N/A | No post-merge/current-tree implementation packet was authorized. | Investigation-only scope recorded. | retire |
| behavior-proof | lane proof owner | completed | P0 | Prove stable editor behavior before perf. | Fourteen comparable editors stayed ready in every confirmation run; seven other next routes failed exact Browser replay. | update |
| oracle-repair | lane test owner / tdd | completed | N/A | No runtime/test mutation was authorized. | Missing schema and benchmark oracles are queued by exact failure signature. | defer |
| visual-proof | Browser | completed | P0 | Prove visible editor behavior. | In-app Browser verified main huge mount, next huge error UI, and six other next error routes. | update |
| browser-helper-promotion | lane proof harness | completed | N/A | This run found a broken existing harness; no new helper should be promoted before it is repaired. | Branch-native public benchmark quarantined. | defer |
| mobile-claim-width | auto | completed | N/A | Desktop Chromium only; no mobile claim. | Claim width recorded. | retire |
| huge-document-smoke | lane proof owner | completed | P0 | Smoke huge-doc correctness. | Main mounts two editors; next fails before mount on unknown `h1`, so interaction rows are correctly blocked. | update |
| perf-packet | lane perf owner | completed | P0 | Measure only after correctness. | Seven startup and eight heap regressions confirmed; broken routes remain correctness findings. | update |
| supervision-mode | auto | completed | N/A | No timebox/minimum runtime. | N/A recorded. | retire |
| consolidation | auto | completed | N/A | Investigation made no durable doctrine/API decision. | Evidence lives in plan and `.tmp` artifacts. | retire |
| final-handoff | auto | completed | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Final ledgers complete. | update |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded by loops 1-3 |
| 0 | update | checkpoint-zero | Vision and requirement extraction | Perf cannot outrank behavior/native correctness; dirty current tree is not a branch baseline. | complete |
| 0 | reprioritize | status, gap-scan, huge-document-smoke, perf-packet | User explicitly requested full example sweep and huge document. | exact-ref inventory first |
| 1 | update | status | `origin/main=2f87593...`, `origin/next=a18bab5...`; 26 common Plate demo sources, one renamed markdown demo, no Plite host on main. | Cross-branch surface is shared `/blocks/*-demo`; Plite-only routes are context only. | complete |
| 1 | reprioritize | gap-scan, perf-packet, huge-document-smoke | Existing runner and route implementation differ; one frozen external harness is required. | build isolated refs, then broad sweep |
| 2 | split | behavior-proof, huge-document-smoke, perf-packet | Broad sweep found seven next mount failures and fourteen comparable editors. | correctness failures separated from performance candidates |
| 2 | update | perf-packet | Five alternating Browser runs confirmed seven ready-time regressions and eight fresh-tab heap regressions. | keep confirmed rows; reject one-shot noise |
| 3 | reopen | browser-helper-promotion | Main public preset emitted zero/stale rows; next lost the harness between benchmarks. | quarantine benchmark evidence and queue harness repair |
| 3 | update | final-handoff | Bundle/source/CPU evidence identifies eager DOCX/CSV imports and Plate-on-Plite initialization as first owners. | investigation complete |

Mutation rules:
- Add a checkpoint when a new failure, missing oracle, missing metric, API smell, visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command, exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become too large.
- Merge checkpoints when overlap confuses routing or two rows always close together.
- Retire or remove checkpoints that are stale, superseded, irrelevant, duplicated, or contradicted by current evidence. Record the reason in the mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The user's latest request, `vision`, and current source evidence outrank stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Sweep examples versus main, include huge document, find/prove issues, do not patch in this pass. |
| `auto` source rule read or fallback recorded | yes | Read complete generated Auto skill and Performance lens. |
| `vision` read as checkpoint zero | yes | Read root `VISION.md` plus common, Plite, and Plate detail owners; behavior and native proof gate every perf claim. |
| Active goal checked or created | yes | Existing #5066 promotion goal is blocked and cannot be replaced; user explicitly authorized this different task, so this plan records degraded goal control. |
| Lane resolved | yes | Shared Plate/Plite browser performance with exact branch owners. |
| Invocation mode and timebox recorded | yes | Full-loop; no duration. |
| Dynamic checkpoint policy accepted | yes | Reconcile route/metric/owner checkpoints after every measurement block. |
| Source of truth and allowed workspaces recorded | yes | Refreshed remote refs and isolated proof hosts; current dirty checkout is not a branch baseline. |
| Output budget strategy recorded | yes | Raw artifacts to `.tmp`; compact summaries only. |
| Release/PR/publish boundary recorded | yes | Out of scope. |
| Browser proof strategy recorded | yes | Frozen Chromium harness, alternating branches, five retry-free confirmation runs, exact Chrome only for confirmed deltas when useful. |
| Package/API proof strategy recorded | yes | Existing tests/benchmarks are oracle context; no API edits. |
| Mobile/raw-device claim-width policy recorded | yes | Desktop Chromium only; no raw-device claim. |
| Skill repair authority and source-rule boundary recorded | yes | The defect is in the checked-in public benchmark lifecycle/results, not reusable skill doctrine; repair belongs to a later benchmark Patch packet. |

Work Checklist:
- [x] First checkpoint complete: sweep all comparable examples versus main, include huge document, quantify/rerun/rank findings, do not patch, and report proof limits/next owners.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is shared editor performance, with exact remote refs and isolated browser hosts as owners.
- [x] Vision checkpoint zero complete: fair legacy/current metrics, correctness guards, DOM/memory tags, and degraded-mode native behavior are mandatory.
- [x] Checkpoint supervisor reconciled after broad, confirmation, and huge-control passes.
- [x] Post-merge/current-tree closure is N/A: no implementation packet was authorized.
- [x] Each loop records its checkpoint mutation in the ledger.
- [x] Current-tree/status packet recorded; no runtime patch was made.
- [x] Current-tree/status packet recorded: dirty current checkout excluded; exact remote refs and shared route topology recorded.
- [x] Behavior proof packet covers fourteen stable cross-branch editors and seven next failures.
- [x] Visual proof is scoped to route mount/error state; native selection is N/A because no interaction-performance claim survived on broken huge routes.
- [x] Missing schema and benchmark oracles are deferred to their fix packets with exact signatures.
- [x] Browser helper promotion is deferred: repair the existing benchmark lifecycle before adding another helper.
- [x] Mobile/raw-device claim width explicitly limited to desktop Chromium.
- [x] Huge-document correctness smoke ran: main mounts; next fails on unknown `h1`.
- [x] Perf measurement ran only on the fourteen routes that stayed correct across both refs.
- [x] Package/API hard cuts and docs consistency are N/A: read-only investigation.
- [x] Docs/vision/rule consolidation is N/A: no reusable doctrine decision was accepted.
- [x] Workflow slowdowns are logged with different-move resolutions.
- [x] Packet ledger contains source topology, route correctness, load, memory, bundle/CPU, and huge benchmark packets.
- [x] Changed list is current and investigation-only.
- [x] Needs-your-attention list is ranked and capped at four items.
- [x] Stopping checkpoints are queued below.
- [x] P2 autoreview is N/A: no product implementation diff.
- [x] Agent-native review is N/A: no agent/tooling source changed.
- [x] Output budget discipline followed after the first generated-output mistake; raw data is artifacted.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Five alternating load and fresh-tab memory runs for every suspicious comparable route | `.tmp/main-next-example-performance/confirmed-summary.json` |
| Dynamic checkpoint reconciliation | complete | Broad findings split correctness, performance, and benchmark-harness packets | mutation ledger loops 2-3 |
| Lane authority proof | complete | Exact-ref production hosts and shared Browser session | main `:3200`, next `:3201` |
| Workspace authority proof | complete | Source/build commands ran in isolated exact-ref clones; plan/artifacts live in root checkout | paths in Verification evidence |
| Behavior gates | complete | Fourteen cross-branch editors green; seven next route failures classified | Browser proof ledger |
| Visual/native selection proof | complete | Visible mount/error state proved; selection N/A for load/heap-only claims | Browser proof ledger |
| Missing oracle repair | complete | Deferred to fix packets with exact route/error owners | stopping checkpoints |
| `@platejs/browser` promotion | complete | N/A until broken public benchmark is repaired | benchmark packet |
| Mobile/raw-device claim width | complete | Desktop Chromium only | claim-width ledger |
| Huge-document correctness smoke | complete | Main mounted two editors; next mounted none | huge ledger |
| Package/API proof | complete | N/A: no package/API mutation | changed list |
| Autoclosure handoff | complete | N/A: investigation only | boundary |
| Skill/rule sync | complete | N/A: no `.agents/rules/**` changes | changed list |
| Changed list / review attention / stopping checkpoints | complete | Filled below | final ledgers |
| Final lint/check | complete | JSON parse and goal-plan checker; no product lint applies | verification evidence |
| Workflow slowdown review | complete | Six slow/failing workflow shapes recorded | workflow table |
| Agent-native review for agent/tooling changes | complete | N/A: no agent/tooling source changed | changed list |
| P2 autoreview for non-trivial implementation changes | complete | N/A: no implementation diff | changed list |
| Goal plan complete | complete | Run checker after final edits | verification evidence |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | completed | Requirements plus root/common/Plite/Plate Vision read. | status |
| Status and current-state read | completed | Exact refs, route intersection, branch-only routes, runner/route diffs, and huge controls recorded. | gap scan |
| Gap scan and scenario matrix | completed | 26-route frozen sweep produced fourteen comparable routes, seven next failures, and non-comparable rows. | behavior proof |
| Behavior proof | completed | Exact Browser replay classified every next failure. | confirmation runs |
| Oracle repair | completed | Deferred; no mutation authority. | visual proof |
| Visual/native proof | completed | Main/next huge and all broken next routes inspected in Browser. | helper audit |
| Browser helper promotion | completed | Existing public benchmark rejected; repair queued. | huge smoke |
| Mobile/raw-device claim width | completed | Desktop Chromium only. | huge smoke |
| Huge-document correctness smoke | completed | Main mounts; next fails before editor. | perf packet |
| Perf/API/docs/skill packets as needed | completed | Startup, memory, bundle, CPU, and benchmark packets recorded. | final handoff |
| Consolidation and review | completed | No product/agent mutation; evidence consolidated in plan/artifacts. | final handoff |
| Final handoff and goal-plan check | completed | Ledgers complete; checker run after edits. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| comparable example sweep | 26 common routes; fourteen stable editors | desktop Chromium / exact-ref production hosts | route load and fresh-tab mount | five-run ready latency, fresh-tab heap, DOM, correctness | complete |
| huge document | shared public route plus 10k public benchmark control | desktop Chromium | mount before interaction | main mounts; next schema failure blocks interaction; public benchmark rejected as invalid | complete with blocker |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| source-topology | 1 | auto | Main lacks Plite routes; branch-native perf harnesses differ | exact `git ls-tree`, package scripts, huge source, runner diff | 26 shared Plate demos; huge common; main/next markdown rename classified | keep | isolated builds/frozen harness |
| exact-ref-hosts | 1 | auto | Both refs need comparable production hosts | sequential frozen installs; compile-only production builds; `:3200` and `:3201` | both hosts served shared routes; next full prerender separately failed on resizable docs | keep | broad route sweep |
| route-correctness | 2 | Browser | Next schema/runtime migration may break examples before perf | exact Browser replay on huge plus six other failures | seven next routes show error UI with exact runtime signatures | keep | route fix packets |
| startup-confirmation | 2 | Browser | One-shot startup deltas may be cold-load noise | five alternating cache-disabled runs on all fourteen stable editors | seven routes exceed both 20% and 20 ms; ratios 1.67x-3.00x | keep | eager bundle/core initialization owners |
| fresh-memory | 2 | Browser/CDP | Same-tab heap would fake retention | five fresh tabs per branch for all fourteen stable editors | eight routes exceed 25%; ratios 1.25x-1.79x | keep | default/editor runtime memory owners |
| bundle-cpu-owner | 3 | source + Browser/CDP | Default EditorKit eagerly imports optional converters | network bytes, fresh CPU profile, built chunk/source audit | next adds 401,202 transferred bytes in one 1.61 MB DOCX chunk; source eagerly imports mammoth, JSZip, juice, PapaParse | keep | cut optional converters from startup path |
| huge-public-benchmark | 3 | repo benchmark | 10k control could preserve engine proof despite public-route failure | branch-native `perf:editor:public` on both exact refs | rejected: main mount rows are zero/stale; next loses harness between mount and input | quarantine | repair benchmark lifecycle/results reset |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| stable comparable editors | fourteen `/blocks/*-demo` routes | five alternating Browser loads plus five fresh-tab memory loads | in-app Browser | all 140 startup rows and 140 memory rows mounted an editor | keep performance evidence |
| broken next editors | huge, hundreds, playground, editable voids, tabbable, table no-merge, version history | exact Browser navigation and error logs | in-app Browser | seven failures before usable editor state | route-specific schema/plugin repair |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| route mount/error state | N/A: no selection claim | N/A | editor count plus error-state DOM | Browser DOM and runtime error logs | main huge visible with two editors; next huge and six routes show load-error UI |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| frozen route performance | 26 common example routes | repair existing public benchmark instead of adding another helper | branch-native `perf:editor:public` plus Browser proof | defer: benchmark lifecycle/results are invalid |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| example startup and heap regressions | desktop browser only | in-app Browser desktop Chromium with CDP metrics | complete | desktop Chromium only; no mobile/raw-device claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| main `/blocks/huge-document-demo` default 10k | mount | two editable editors visible | Browser exact-ref host | pass |
| next `/blocks/huge-document-demo` default 10k | mount before gestures | editor must exist | Browser exact-ref host | fail: unknown `h1` at `[0]`; all gesture/perf rows blocked |
| `/dev/editor-perf` public 10k control | mixed/code mount and input | valid non-stale statistics on both refs | `pnpm --filter www perf:editor:public` | rejected: main zero/stale rows; next harness disappears |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| broad generated `git grep` | auto discovery | immediate / should be zero | query crossed generated public registry JSON | proved only that huge docs exist, with massive irrelevant output | stop broad generated scans; exact source only |
| package-script loop | auto command shape | one failed attempt | `${ref}:path` was written as `$ref:path`, triggering shell substring expansion; Node reducer also missed a parenthesis | no evidence | corrected with braced ref and single-quoted reducer; compact scripts read succeeded |
| parallel exact-ref installs | Bun/skiller cache | one failed parallel attempt | both installs wrote the same shared Bun cache path | no usable install | reran sequentially; both installs passed |
| next full production build | www prerender | one failed full build | unrelated `/docs/api/resizable` `ReferenceError: number is not defined` | proved full next docs build is not green | used compile-only production builds for a comparable route host; did not patch docs |
| standalone broad telemetry | discovery harness | one repair | `.tmp` script could not resolve Puppeteer from its own directory | no first-run artifact | resolved dependency from `apps/www/package.json`; telemetry is discovery only and Browser is the proof boundary |
| same-tab CDP heap | measurement design | one rejected probe | heap/listener state accumulates across navigations | would create fake memory growth | replaced with five fresh Browser tabs per route and branch |
| zsh `path` variable | source audit | one failed loop | assigning lowercase `path` overwrote zsh's tied `PATH` array | no source evidence | renamed variable to `chunk_file`; rerun succeeded |
| branch-native public benchmark | benchmark owner | main hung after output; next failed | main retained timers and emitted stale/zero results; next transiently removed `__editorPerfHarness` | invalid huge benchmark evidence | main process stopped after artifact write; both results quarantined |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none |
| tests/oracles/browser proof | `.tmp/main-next-example-performance/broad-sweep.json`; `.tmp/main-next-example-performance/confirmed-summary.json` |
| benchmarks/metrics/targets | `.tmp/main-next-example-performance/main-public-perf.json`, quarantined as invalid |
| examples/docs | this investigation plan only |
| skills/workflow | none; no source skill change |
| reverted/quarantined packets | public 10k branch-native benchmark evidence and same-tab heap readings |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Huge document and six other next examples are broken before perf | Correctness blocks every honest huge interaction claim | next `a18bab5`, Browser error signatures | fix schema/plugin coverage before optimizing |
| 2 | Default EditorKit eagerly loads optional DOCX/CSV stacks | Adds one 1.61 MB raw / 401 KB transferred DOCX chunk and contributes startup/heap tax | next `editor.ts`, `DocxIOPlugin.tsx`, chunk `111mtyu0_7zzs.js` | lazy-load converter implementations or remove them from default EditorKit |
| 3 | Seven stable examples start 1.67x-3.00x slower | Repeated Browser proof exceeds the comparison threshold | `confirmed-summary.json` | profile/fix full EditorKit and multi-editor initialization as separate Patch cases |
| 4 | Public 10k benchmark cannot verify either branch | Main emits stale/zero rows; next loses its harness | `main-public-perf.json`, next runner failure | repair result reset, harness lifetime, assertions, and process exit before using it as a gate |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| PERF-EXAMPLES-1 | implementation | Should optional DOCX/CSV conversion remain in default `EditorKit` startup? | It owns the clearest bundle/memory regression | no fix attempted | full sweep completed | no: keep APIs opt-in and load implementations on use | `apps/www/src/registry/components/editor/editor.ts` |
| PERF-EXAMPLES-2 | implementation | Which schema/plugin repair packet goes first? | Huge, hundreds, and playground block highest-value behavior | no fix attempted | other stable routes measured | huge/playground schema coverage first | `.tmp/main-next-example-performance/confirmed-summary.json` |
| PERF-EXAMPLES-3 | benchmark | Repair or replace the public 10k harness? | Current output can falsely look green | no benchmark fix attempted | route/browser proof completed | repair existing owner; assert non-zero fresh job-local rows | `apps/www/scripts/run-editor-perf.mts` |

Findings:
- `origin/main` is `2f87593f95a1ff2e931cd42fcf73f052b1d0db41`; `origin/next` is `a18bab5bba2d73e446523cbd848c5baeb19935f4`.
- Main has no `apps/plite` or `/examples/plite/*`; next has 44 Plite example source files. Those routes are not cross-branch comparisons.
- The honest shared surface is 26 registry `*-demo` sources served by `/blocks/<name>` on both refs. Main-only `markdown-to-slate-demo` and next-only `markdown-to-plite-demo` are the same renamed family but excluded from strict route identity comparisons.
- `huge-document-demo` is common and exposes compatible block/chunk/content-visibility controls. Next renames the comparison engine to `upstream-slate` and changes runtime implementation, which is part of the target delta.
- Both refs ship `perf:editor:public`, but runner and `/dev/editor-perf` source differ materially; branch-native summaries are supporting evidence only, not the frozen cross-branch sweep.
- Fourteen routes mounted on both refs in every confirmation run. Seven have confirmed median startup regressions: list classic 3.00x, copilot 2.41x, find/replace 2.33x, code drawing 2.32x, markdown streaming 2.20x, Excalidraw 1.83x, and multiple editors 1.67x.
- Eight routes have confirmed fresh-tab heap regressions of 25%-79%. The worst are multiple editors (15.9 MB -> 28.5 MB), select editor (11.4 MB -> 19.3 MB), controlled (10.2 MB -> 15.5 MB), and marks install (11.8 MB -> 17.5 MB).
- `EditorKit` on next eagerly adds `CsvPlugin` and `DocxIOPlugin`. `DocxIOPlugin` eagerly imports `juice`, `mammoth`, and `JSZip`; `CsvPlugin` eagerly imports PapaParse. The resulting DOCX chunk is 1,610,705 raw bytes and 401,202 transferred bytes. Route JS transfer increases by 398,795 bytes overall.
- The next huge route does not mount: `Unknown editor element type "h1" at [0]`. The same failure breaks hundreds-editors; five additional next examples fail on missing schema/plugin contracts.
- The public 10k benchmark is invalid on both refs: main emits zero mount rows and reuses mixed input values in the code-only job; next loses `__editorPerfHarness` between mount and input. It cannot support a huge-document performance claim.

Decisions and tradeoffs:
- Use one frozen harness and alternating branch blocks; branch-specific harnesses would confound the comparison.
- Require absolute and relative thresholds so sub-millisecond noise does not become a fake regression.
- Preserve correctness/native behavior as a hard gate; a faster broken mode loses.
- Treat virtualization, shells, staged DOM, and model-backed selection as degraded until their native behavior rows pass; do not reward DOM reduction alone.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `git grep` crossed generated public registry JSON and produced ~110k tokens before truncation | 1 | Stop generated-output discovery; inspect exact source registry, route, and harness owners only | Recovered immediately; raw generated output is excluded from every later checkpoint. |
| Ref/path shell interpolation and malformed Node reducer in package-script inventory | 1 | Brace `${ref}:path` and use a single-quoted reducer | Corrected command returned compact main/next perf scripts. |
| Parallel installs raced the shared Bun/skiller cache | 1 | Run exact-ref installs sequentially | Both frozen installs passed. |
| Same-tab Browser heap grew across route navigations | 1 | Use fresh tabs for every branch/route/run | Stable five-run heap rows produced. |
| zsh `path` assignment removed command lookup | 1 | Rename to `chunk_file` | Chunk ownership audit passed. |
| Public 10k main process stayed alive after artifact output | 1 | Stop only after the artifact was complete; inspect semantics before reuse | Artifact kept but quarantined. |
| Public 10k next runner lost its window harness | 1 | Do not retry into a green result; classify lifecycle failure | Benchmark evidence rejected. |

Verification evidence:
- Exact refs: main `2f87593f95a1ff2e931cd42fcf73f052b1d0db41`; next `a18bab5bba2d73e446523cbd848c5baeb19935f4`.
- Isolated hosts: `/Users/zbeyens/git/plate-2/.tmp/main-next-example-performance/main` on `127.0.0.1:3200`; sibling `next` clone on `127.0.0.1:3201`.
- Broad matrix: `.tmp/main-next-example-performance/broad-sweep.json` covers all 26 common route identities.
- Confirmed matrix: `.tmp/main-next-example-performance/confirmed-summary.json` records five alternating startup runs and five fresh-tab heap runs.
- Browser proof: main huge mounted two editors; next huge and six other routes showed load-error UI with exact logged errors.
- Network proof: common route JS transfer main 2,790,376 bytes versus next 3,189,171 bytes; next DOCX chunk 401,202 transferred bytes.
- CPU proof: list classic sampled 217.8 ms total on main versus 411.8 ms on next; next spent 75.7 ms in Turbopack module runtime and loaded eager DOCX/Plate model chunks.
- Huge control: `.tmp/main-next-example-performance/main-public-perf.json` exists but is rejected for zero/stale rows; next command failed on missing `__editorPerfHarness`.

Final handoff contract:
- Goal plan: this file; investigation complete under degraded goal-tool control because #5066 owns the active durable goal.
- Lane: shared Plate/Plite example performance.
- Surface and route/package: 26 common `/blocks/*-demo` routes; default `EditorKit`; `@platejs/docx-io`; public huge route and benchmark.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop; no minimum runtime; three evidence loops.
- Behavior gates and visual proof: fourteen stable cross-branch editors; seven exact next failures; Browser proof complete.
- Primary metric baseline/latest/best and stop reason: startup and fresh heap versus exact main; stopped after all threshold rows received five confirmations and owners were grounded.
- Bugs fixed and oracles added: none; investigation-only authority.
- Benchmark/skill/docs repairs: none; public benchmark repair queued, evidence plan updated.
- Workflow slowdowns and repairs: recorded above; every retry changed method.
- Changed list: plan and `.tmp` evidence only.
- Needs your attention: fix correctness first, then eager converters, then startup/memory and benchmark gate.
- Stopping checkpoints to unblock: three implementation/benchmark decisions queued above.
- Accepted deferrals and residual risks: no huge interaction comparison until next mounts; no mobile/raw-device claim; no Plite-only main comparison.
- Next owner: one `patch` case at a time, beginning with optional converter startup cost or huge schema failure.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff: exact regressions and proof gaps ranked |
| Where am I going? | Separate Patch packets after implementation authority |
| What is the goal? | Find and prove performance regressions across examples versus main without patching them |
| What have I learned? | Next has eager optional-converter cost, repeated startup/heap regressions, seven broken routes, and an invalid huge benchmark |
| What have I done? | Swept 26 routes, confirmed fourteen stable routes five times for startup and heap, Browser-replayed failures, and traced bundle/CPU owners |
| What changed in the checkpoint plan? | Correctness, performance, bundle, and benchmark packets were split and closed as evidence-only rows |

Timeline:
- 2026-08-18T09:55:37.334Z Goal plan created.
- 2026-08-18: read Auto, Performance, Autogoal, Vision, and root/common/Plite/Plate doctrine; checkpoint zero complete.
- 2026-08-18: grounded exact main/next refs; found 26 common Plate demos, one renamed markdown family, no main Plite host, and a common huge-document route.
- 2026-08-18: built isolated compile-only production hosts after next full docs prerender failed on an unrelated resizable page.
- 2026-08-18: broad sweep found fourteen comparable editors and seven next correctness failures.
- 2026-08-18: five alternating Browser startup runs and five fresh-tab memory runs confirmed seven load and eight heap regressions.
- 2026-08-18: bundle/source/CPU audit traced a 401 KB transferred DOCX chunk to eager default EditorKit imports.
- 2026-08-18: public 10k benchmark rejected on both refs; final evidence consolidated.

Open risks:
- The blocked #5066 goal remains unrelated and must not be marked complete by this sweep.
- `main` has no `apps/plite` or `/examples/plite/*`; cross-branch claims must use shared Plate registry/demo routes, while Plite-only measurements remain next-side context.
- Startup timing measures route-to-visible-editor, not INP; #5066 native typing remains a separate open issue.
- Heap is fresh-tab JS heap after mount, not retained-memory leak proof. Growth is real at that boundary but still needs allocation-owner work before a fix.
- Huge-document interaction performance is unknown on next because the route and benchmark are both broken. Any green claim would be fiction.
