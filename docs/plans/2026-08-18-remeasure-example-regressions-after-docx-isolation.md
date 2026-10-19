# remeasure example regressions after docx isolation

Objective:
Re-measure the previously confirmed example regressions after DOCX isolation against exact main, keeping route, bundle, heap, huge-document, and blocker claims honest.

Goal plan:
docs/plans/2026-08-18-remeasure-example-regressions-after-docx-isolation.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: follow-up performance verification requested by the user
- prompt / link: "measure again regressions"
- lane: Plate registry/browser performance
- surface / route / package: fourteen previously comparable `/blocks/*-demo` examples, huge document, default editor entry graph, and dedicated DOCX example graph
- invocation mode: full-loop, measurement-only
- minimum runtime / deadline: N/A: no duration requested
- completion threshold summary: repeat startup and fresh-tab heap five times when the real current route host is runnable; always repeat bundle graph; classify huge and any host blocker without proxy-green claims

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: exact comparison thresholds apply
- improvement loop: status -> host authority -> correctness -> five-run startup/heap -> bundle -> huge -> rank
- final score / loop closure: N/A

Completion threshold:
- Exact `origin/main` and local candidate ref/fingerprints are recorded.
- The prior seven startup and eight heap regression families are repeated with five alternating retry-free runs on the real route host, or each blocked row names the exact host failure and is not called fixed.
- Default-editor versus dedicated-DOCX bundle graphs are freshly rebuilt and compared to the pre-fix 401,202-byte DOCX chunk evidence.
- Huge-document route correctness is replayed before any interaction metric.
- Final output separates confirmed improvement, unchanged regression, new regression, invalid comparison, and blocked exact claim.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-remeasure-example-regressions-after-docx-isolation.md` passes.

Verification surface:
- Exact refs, SHA-256 production fingerprints, and prior artifacts under `.tmp/main-next-example-performance/`.
- Fresh Browser/dev or production host only when it executes the real current candidate without generated/source substitutions.
- Five alternating cache-disabled startup runs and five fresh-tab CDP heap runs for runnable comparable routes.
- Fresh Bun metafiles for default EditorKit and dedicated DOCX example; input/module counts and bytes.
- Huge route mount/error proof; public benchmark evidence remains rejected unless fresh semantics become valid.
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
- Source of truth: exact `origin/main`, current local candidate files/fingerprints, real runnable hosts, and fresh measurement artifacts; no generated proxy host.
- Allowed edit scope: this plan and `.tmp` measurement artifacts only; no product, generated registry, benchmark, skill, or runtime patch in this pass.
- Browser surfaces: prior fourteen shared routes plus huge document; Browser first, exact current host required.
- Package/API surfaces: read-only bundle/import graph and existing tests as correctness guards.
- Agent/skill surfaces: N/A unless a repeated measurement workflow defect is proven.
- Docs/research surfaces: prior performance and DOCX isolation plans as active context only.
- Non-goals: fixing remaining regressions, regenerating CI-controlled registry output, pagination, mobile/raw-device claims, commit/push/PR/issue mutation.

Output budget strategy:
- Reuse named route lists and artifacts; exclude generated registry JSON, `.next`, logs, and `node_modules` from scans except exact bundle outputs; write raw measurement JSON to `.tmp/post-docx-example-performance/`; never flush repeated dev-server errors into chat.

Blocked condition:
- Route metrics are blocked if the real current checkout cannot compile because CI-controlled generated registry output is stale and no approved real host exists. Continue bundle/source/test measurements, then report route rows blocked rather than building a proxy.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: Plate registry/browser performance
- surface: prior example regressions after DOCX isolation
- mode: full-loop measurement-only
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 2
- current_checkpoint: final-handoff
- current_checkpoint_status: completed
- next_checkpoint: repair generated registry host, then rerun exact route matrix
- goal_status: measurement complete with route blockers

Current verdict:
- verdict: bundle regression fixed; route regressions not reverified
- confidence: high for controlled bundle/module-load evidence and host blocker; zero confidence in current route startup/heap/huge performance because candidate code never executes
- next owner: generated registry owner, then exact route replay
- keep / revert / quarantine call: keep bundle and Browser blocker evidence; quarantine module-load timing as supporting only; retain previous route regressions as open
- reason: five stable controlled builds remove the DOCX tax, but the real app host is broken before route code

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-remeasure-example-regressions-after-docx-isolation.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | completed | P0 | Copy prompt requirements and read vision before measurement. | Requirements and root/common/Plate doctrine recorded. | update |
| status | auto | completed | P0 | Read exact refs, prior artifacts, candidate fingerprints, and host state. | Exact main/local refs and stale generated imports recorded. | update |
| gap-scan | auto | completed | P0 | Separate exact-route, controlled-bundle, supporting microbenchmark, and huge claims. | Claim widths and owners recorded. | split |
| closure-handoff | autoclosure | completed | N/A | Measurement-only; no current-tree closure requested. | N/A recorded. | retire |
| behavior-proof | lane proof owner | completed | P0 | Correctness before perf. | Main huge mounts; candidate route host fails before target code. | update |
| oracle-repair | lane test owner / tdd | completed | N/A | No product/test mutation authorized. | Host and benchmark repair deferred to exact owners. | defer |
| visual-proof | Browser | completed | P0 | Prove real host status. | Fresh Browser replay: candidate zero editors with generated-index error; main huge two editors. | update |
| browser-helper-promotion | lane proof harness | completed | N/A | No repeated real-route proof could run. | Existing host must be repaired first. | retire |
| mobile-claim-width | auto | completed | N/A | Desktop Chromium only. | N/A recorded. | retire |
| huge-document-smoke | lane proof owner | completed | P0 | Replay mount before interactions. | Main pass; candidate blocked before huge code. | update |
| perf-packet | lane perf owner | completed | P0 | Re-measure owned DOCX cost and route regressions. | Five bundle builds and five module-load runs complete; route rows blocked. | update |
| supervision-mode | auto | completed | N/A | No timed minimum. | N/A. | retire |
| consolidation | auto | completed | N/A | No reusable doctrine changed. | Evidence consolidated in plan and artifacts. | retire |
| final-handoff | auto | completed | P0 | Rank fixed/open/blocked claims. | Ledgers and artifacts complete. | update |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded by checkpoint-zero update |
| 0 | update | checkpoint-zero, status, perf-packet, huge-document-smoke | User requested a repeat after DOCX isolation; route host may be blocked by stale generated registry. | Require real current host; always run bundle graph; never proxy-green. | checkpoint-zero complete |
| 1 | split | behavior-proof, perf-packet, huge-document-smoke | Candidate route host fails before target code; controlled current-source bundle remains measurable. | Route metrics blocked; bundle and supporting module-load packets continue. | complete |
| 1 | update | perf-packet | Five bundle builds are byte-stable; default removes 84 heavy inputs and 722.5 KB gzip. | Keep bundle evidence. | complete |
| 2 | update | visual-proof, huge-document-smoke | Exact main huge mounts two editors; current huge mounts zero due generated index. | Block huge performance claim. | complete |
| 2 | update | final-handoff | Previous startup/heap rows classified by EditorKit ownership; independent rows remain open. | Measurement loop complete. | complete |

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
| Prompt requirements captured before work | yes | Repeat prior regressions after DOCX isolation and report honest current state. |
| `auto` source rule read or fallback recorded | yes | Complete generated Auto skill plus Performance lens read. |
| `vision` read as checkpoint zero | yes | Vision router, root Vision, common, and Plate detail read; behavior and real-host proof outrank metrics. |
| Active goal checked or created | yes | Matching measurement goal created after `get_goal` returned none. |
| Lane resolved | yes | Plate registry/browser performance. |
| Invocation mode and timebox recorded | yes | Full-loop measurement-only; no duration. |
| Dynamic checkpoint policy accepted | yes | Host failure may split route and bundle packets. |
| Source of truth and allowed workspaces recorded | yes | Exact main clone, current root candidate, real Browser host, and `.tmp` artifacts only. |
| Output budget strategy recorded | yes | Exact route/artifact reads; raw results artifacted; no server-log flushing. |
| Release/PR/publish boundary recorded | N/A | No Git or public mutation. |
| Browser proof strategy recorded | yes | Real current host only; five alternating and fresh-tab runs; proxy hosts quarantined. |
| Package/API proof strategy recorded | yes | Read-only bundle graph plus existing focused correctness/type results. |
| Mobile/raw-device claim-width policy recorded | N/A | Desktop Chromium only. |
| Skill repair authority and source-rule boundary recorded | yes | Repair only if repeat measurement workflow itself is wrong; no skill edits planned. |

Work Checklist:
- [x] First checkpoint complete: repeat scope, real-host rule, thresholds, artifacts, non-goals, and final classification are recorded before measurement.
- [x] Objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Full-loop mode, no duration, dynamic checkpoints, and no soft questions are recorded.
- [x] Lane is Plate registry/browser performance with exact main clone and current root candidate.
- [x] Checkpoint supervisor reconciled after host, bundle, module-load, and huge passes.
- [x] Autoclosure is N/A: no implementation/current-tree cleanup requested.
- [x] Each loop records split/update/retire decisions in the mutation ledger.
- [x] Status packet recorded; no runtime patch made.
- [x] Behavior proof: exact-main huge passes; candidate route families are blocked before code execution.
- [x] Visual proof scoped to route mount/error state; no native selection claim.
- [x] Missing route/huge oracle repair deferred to generated registry owner; public 10k benchmark remains rejected from prior proof.
- [x] Browser helper promotion N/A until the real route host compiles.
- [x] Mobile/raw-device claim width limited to desktop Chromium.
- [x] Huge-document mount smoke complete: main 2 editors, candidate 0 with exact blocker.
- [x] Perf packet ran only where correctness/host allowed; route metrics remain blocked.
- [x] Package/API audit is read-only; no public shape changed.
- [x] Docs/Vision/rule consolidation N/A: no new doctrine.
- [x] Workflow slowdowns logged with narrower reruns and redirected logs.
- [x] Packet ledger covers host, bundle, module-load, huge, and route-classification evidence.
- [x] Changed list includes only this run's plan and `.tmp` artifacts.
- [x] Needs-your-attention list ranked below.
- [x] Stopping checkpoint records generated registry repair before route replay.
- [x] P2 autoreview N/A: no product implementation diff.
- [x] Agent-native review N/A: no agent/tooling changes.
- [x] Output budget followed after the first failed exact-ref bundle command; later failures were artifacted/capped.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Repeat exact runnable metrics or record exact blocker | Five bundle and module-load runs complete; route/heap rows blocked by real host. |
| Dynamic checkpoint reconciliation | complete | Split route versus controlled evidence | Mutation ledger loops 1-2. |
| Lane authority proof | complete | Plate root/current source and exact-main host | Paths/refs in Verification evidence. |
| Workspace authority proof | complete | Record cwd/tool | Plate root, isolated exact-ref clones, Browser hosts, and `.tmp` artifacts recorded. |
| Behavior gates | complete | Correctness before perf | Main huge pass; candidate host failure. |
| Visual/native selection proof | complete | Route mount/error only | Browser exact error and editor counts; native selection N/A. |
| Missing oracle repair | complete | Defer with owner | Generated registry owner must repair host; benchmark owner still invalid from prior run. |
| `@platejs/browser` promotion | complete | N/A | No real route repetition ran. |
| Mobile/raw-device claim width | complete | N/A | Desktop Chromium only. |
| Huge-document correctness smoke | complete | Replay main/candidate | Main 2 editors, candidate 0/error. |
| Package/API proof | complete | N/A | No package/API mutation. |
| Autoclosure handoff | complete | N/A | Measurement-only. |
| Skill/rule sync | complete | N/A | No skill/rule changes. |
| Changed list / review attention / stopping checkpoints | complete | Fill ledgers | Complete below. |
| Final lint/check | complete | Validate JSON artifacts and plan | JSON artifacts parse; plan checker run after final update. |
| Workflow slowdown review | complete | Log command/host failures | Complete below. |
| Agent-native review for agent/tooling changes | complete | N/A | No agent changes. |
| P2 autoreview for non-trivial implementation changes | complete | N/A | No product implementation diff. |
| Goal plan complete | complete | Run checker | Run after this final evidence update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | completed | Requirements and Vision recorded. | status |
| Status and current-state read | completed | Exact refs, artifacts, stale generated imports, and candidate fingerprints recorded. | gap scan |
| Gap scan and scenario matrix | completed | Exact-route versus controlled/supporting claim widths split. | behavior proof |
| Behavior proof | completed | Main huge pass; candidate host fails before target code. | visual proof |
| Oracle repair | completed | N/A/deferred to generated registry and benchmark owners. | visual proof |
| Visual/native proof | completed | Browser route/error/editor-count replay complete. | perf packet |
| Browser helper promotion | completed | N/A until host compiles. | perf packet |
| Mobile/raw-device claim width | completed | Desktop Chromium only. | huge smoke |
| Huge-document correctness smoke | completed | Main 2 editors; candidate 0/error. | perf packet |
| Perf/API/docs/skill packets as needed | completed | Five bundle builds; five module-load runs; route rows blocked. | consolidation |
| Consolidation and review | completed | Evidence artifacts and ranked verdict complete; no code review needed. | final handoff |
| Final handoff and goal-plan check | completed | Ledgers complete; checker runs after final edit. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| prior startup regressions | seven examples | desktop Chromium / real Next host | route load | median ready time across five alternating runs | blocked: candidate host compilation |
| prior heap regressions | eight examples | desktop Chromium / five fresh tabs | mount | median JS heap and DOM | blocked: candidate host compilation |
| DOCX bundle boundary | default EditorKit versus same current source plus full DocxKit | Bun browser bundle | five deterministic builds | raw/gzip bytes and heavy input count | complete |
| DOCX module-load cost | same current bundle pair | desktop Chromium static host | five alternating fresh tabs | ready, script, task, heap | complete, supporting only |
| huge document | exact main versus candidate | desktop Chromium real Next hosts | mount before interaction | editor count, error state, ready/heap on main | complete with candidate blocker |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| host-authority | 1 | auto/Browser | Real candidate host may fail before route code | exact refs, generated import audit, fresh Browser host | main runnable; candidate generated-index failure | keep | generated registry owner |
| bundle-stability | 1 | performance | DOCX isolation should remove heavy converter graph deterministically | five default/full current-source Bun builds | 0 versus 84 heavy inputs; 722.5 KB gzip removed | keep | route replay after host repair |
| module-load | 1 | performance/Browser | Removed graph should reduce parse/eval/heap | five alternating fresh static pages | -111 ms ready, -80.9 ms script, -81.3 ms task, -4.99 MB heap median | quarantine as supporting | do not call route fixed |
| huge-replay | 2 | Browser | Huge must mount before interaction perf | exact-main and candidate Browser pages | main 2 editors; candidate 0/generated error | keep blocker evidence | generated registry owner |
| prior-row-classification | 2 | auto | DOCX change may not own every prior regression | exact current source import audit | six startup rows EditorKit-owned; multiple-editors and seven heap rows independent | keep | retain independent rows open |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| exact-main huge | `/blocks/huge-document-demo` | Browser | desktop Chromium | 2 editors, no errors | pass |
| candidate routes | DOCX, huge, and all dynamic blocks | Browser | desktop Chromium | 0 editors; generated index module-not-found before target code | blocked |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| route mount/error | N/A | N/A | editor count/error only | Browser exact host evidence | complete; no selection claim |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| repeated route startup/heap | prior 14-route matrix | existing Browser harness | rerun only after real candidate host compiles | defer |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| all claims | desktop Chromium Browser/CDP | local Mac | complete | desktop browser only; no mobile/raw-device claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| exact main default 10k | mount | editor exists before timing | Browser `:3200` | pass: 2 editors, 2034 ms cold ready, 19.24 MB heap, 100,508 nodes, no errors |
| candidate default 10k | mount | editor exists before timing | Browser `:3100` | blocked: 0 editors, stale generated index |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| exact-ref Bun bundle | performance setup | two failed attempts | exact refs resolve package exports to unbuilt `dist`; nested clone also confused workspace resolution | proved this is not a fair cross-ref Bun lane | stop; use prior exact Next route-transfer evidence plus same-current-source controlled bundle |
| first failed Bun build output | output budget | one 36k-token error artifact before truncation | stderr was not redirected on the first attempt | no metric evidence | all later build/server output redirected and summarized |
| main production start | command shape | one failed attempt | `pnpm --filter www start -- --hostname` forwarded literal `--` | no product evidence | switched to `pnpm --filter www exec next start`; passed |
| candidate Next host | generated registry owner | deterministic blocker | CI-controlled generated index imports many deleted files | exact Browser blocker evidence | do not regenerate locally or substitute a proxy host |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none |
| tests/oracles/browser proof | Browser exact-host replay artifacts only |
| benchmarks/metrics/targets | `.tmp/post-docx-example-performance/bundle-stability.json`, `module-load.json`, `summary.json`, and Bun metafiles |
| examples/docs | this measurement plan only |
| skills/workflow | none |
| reverted/quarantined packets | module-load microbenchmark quarantined as supporting-only; exact-route startup/heap rows remain blocked |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Generated registry blocks every current route measurement | Without a real host, startup/heap/huge cannot be called fixed | `apps/www/src/__registry__/index.tsx:2004` and Browser `:3100` | repair generated owner first, then replay |
| 2 | DOCX bundle tax is genuinely removed | Five builds remove 84 heavy inputs and about 722.5 KB gzip | `.tmp/post-docx-example-performance/bundle-stability.json` | accept bundle fix |
| 3 | Multiple-editors startup remains open | It never consumed EditorKit, so DOCX isolation cannot own its previous 1.67x regression | `apps/www/src/registry/examples/multiple-editors-demo.tsx` | rerun after host repair; expect separate owner |
| 4 | Seven prior heap regressions remain independently open | Only legacy-list-model among the eight consumes EditorKit | `.tmp/post-docx-example-performance/summary.json` | do not infer memory closure |
| 5 | Huge-document performance remains unknown | Main mounts; candidate fails before huge code | Browser `:3200` versus `:3100` | fix host, then schema/interaction replay |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| PERF-REPLAY-1 | proof-width | Repair CI-owned generated registry and provide a real current candidate host | Required for every exact route claim | startup, heap, huge interactions | bundle/source/module evidence continued | repair source registry workflow, regenerate in CI, then rerun the same 14-route harness | `apps/www/src/__registry__/index.tsx:2004` |

Findings:
- Exact refs remain main `2f87593f95a1ff2e931cd42fcf73f052b1d0db41` and local candidate `dirty:a18bab5bba2d73e446523cbd848c5baeb19935f4`.
- Five deterministic current-source builds show the default editor at 7,364,036 raw bytes and 2,157,462-2,157,472 gzip bytes with zero heavy DOCX IO inputs. Re-adding full `DocxKit` yields 9,857,663 raw and 2,879,989 gzip bytes with 84 heavy inputs.
- DOCX isolation removes 2,493,627 raw bytes (25.30%), 722,517-722,527 gzip bytes (25.09%), and all 84 heavy converter inputs from the default entry graph.
- Five alternating static Browser module-load runs support the same direction: median ready 362 -> 251 ms, script 224.5 -> 143.6 ms, task 233.4 -> 152.1 ms, and heap 26.31 -> 21.32 MB. This is supporting parse/eval evidence, not route proof.
- The real candidate route host fails before target code because generated `src/__registry__/index.tsx` imports deleted files. Startup and fresh-tab heap regressions therefore cannot be remeasured honestly.
- Six of seven prior startup regressions import EditorKit and plausibly benefit; `multiple-editors-demo` is independent and remains open.
- Only `list-demo` among the eight prior heap regressions imports EditorKit. The other seven memory rows remain open and were not fixed by this packet.
- Fresh huge replay: exact main mounts two editors with no errors; candidate mounts zero because the generated registry fails first.

Decisions and tradeoffs:
- Keep same-current-source full-DOCX versus paste-only bundle comparison because it isolates the exact ownership change without cross-ref build contamination.
- Quarantine the static module-load numbers as supporting only; they exclude Next routing and editor mount.
- Do not run a generated/proxy app host. It would answer a different question and recreate the verification mistake the user explicitly rejected earlier.
- Preserve prior startup/heap regressions as open until the real current route host is repaired and five alternating/fresh-tab runs complete.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Exact-ref Bun bundle streamed large unresolved-package output | 1 | Redirect stderr and inspect only the first exact failure | Recorded as invalid cross-ref bundle lane. |
| Isolated `/tmp` exact-ref installs still resolved exports to missing built `dist` during Bun build | 1 | Stop trying to coerce that lane; use the prior exact Next network artifact and a same-current-source controlled bundle | Resolved without source patches. |
| `pnpm start -- --hostname` forwarded a literal separator | 1 | Use `pnpm --filter www exec next start` | Exact-main host started. |
| Candidate Browser routes compile stale generated registry before target code | 2 routes | Stop after exact repeated signature; redirect logs; do not proxy | Candidate route metrics blocked. |

Verification evidence:
- `.tmp/post-docx-example-performance/bundle-stability.json`: five stable default/full builds and byte/input counts.
- `.tmp/post-docx-example-performance/module-load.json`: five alternating Browser module-load rows and medians, explicitly supporting-only.
- `.tmp/post-docx-example-performance/summary.json`: ranked fixed/open/blocked verdict and prior-row ownership classification.
- Browser candidate `http://127.0.0.1:3100/blocks/docx-demo` and `/blocks/huge-document-demo`: 0 editors; console `src/__registry__/index.tsx:2004` module-not-found.
- Browser exact main `http://127.0.0.1:3200/blocks/huge-document-demo`: 2 editors, 2034 ms cold ready, 19,236,092 heap bytes, 100,508 nodes, no errors.
- JSON validation passed for all three final measurement artifacts.

Final handoff contract:
- Goal plan: this file.
- Lane: Plate registry/browser performance.
- Surface and route/package: prior fourteen examples, huge document, default EditorKit, full DOCX control.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop measurement-only; no minimum; two loops.
- Behavior gates and visual proof: exact main huge pass; current Browser host blocker on DOCX and huge routes.
- Primary metric baseline/latest/best and stop reason: full-DOCX control -> paste-only default removes 722.5 KB gzip and 84 heavy inputs; exact route metrics stopped at host blocker.
- Bugs fixed and oracles added: none; no product mutation.
- Benchmark/skill/docs repairs: none; measurement artifacts and plan only.
- Workflow slowdowns and repairs: exact-ref Bun lane rejected, output redirected, correct Next start command used.
- Changed list: plan plus `.tmp/post-docx-example-performance/**` artifacts.
- Needs your attention: generated registry owner first; independent multiple-editor and heap rows remain open.
- Stopping checkpoints to unblock: repair generated registry and rerun the exact 14-route matrix.
- Accepted deferrals and residual risks: module-load proof is supporting only; startup/heap/huge current claims remain blocked.
- Next owner: generated registry source/CI workflow, then Auto performance replay.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff complete |
| Where am I going? | Generated registry repair, then exact route replay |
| What is the goal? | Re-measure prior regressions after DOCX isolation without proxy-green claims |
| What have I learned? | Bundle tax is fixed; real route startup/heap/huge remain unverified because candidate host is broken |
| What have I done? | Five bundle builds, five Browser module loads, exact-main/current huge replay, ownership classification, and artifact validation |
| What changed in the checkpoint plan? | Split route, bundle, module-load, and huge packets; blocked exact route rows and kept controlled evidence |

Timeline:
- 2026-08-18T12:42:49.209Z Goal plan created.
- 2026-08-18: read Auto, Performance, Autogoal, Vision, exact refs, prior artifacts, and current host blockers.
- 2026-08-18: five bundle builds proved 25.09% gzip and 84-heavy-input removal from default editor.
- 2026-08-18: five alternating Browser module loads measured supporting parse/eval/heap improvement.
- 2026-08-18: exact-main huge passed; current DOCX and huge routes failed before target code on stale generated index.

Open risks:
- No exact current route startup or fresh-tab heap measurements exist after the fix.
- Huge-document schema/interaction state is hidden behind the earlier generated-registry failure.
- `multiple-editors-demo` startup and seven non-EditorKit heap regressions were outside the DOCX ownership change and remain likely open.
