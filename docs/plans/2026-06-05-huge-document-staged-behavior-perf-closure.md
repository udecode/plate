# huge-document staged behavior perf closure

Objective:
Close staged huge-document behavior/perf for Shift+Down, Shift+Up, Cmd+A Delete,
typing, undo, scroll, and native/model selection with reversible proof packets.

Goal plan:
docs/plans/2026-06-05-huge-document-staged-behavior-perf-closure.md

Template:
docs/plans/templates/slate-automation.md

Primary template:
docs/plans/templates/slate-automation.md

Applied packs:
- none

Automation source:
- type: user-invoked slate-automation
- prompt / link: latest chat prompt, `[$slate-automation] 2h on
  huge-document staged behavior/perf closure`
- surface / route / package:
  `http://localhost:3100/examples/huge-document?strategy=staged`,
  `.tmp/plite/site/examples/ts/huge-document.tsx`, `plite-react`, browser
  benchmark scripts
- invocation mode: timed mode
- timebox / deadline: 2h loop-start budget; finish active packet with
  keep/revert/quarantine even if wall-clock expires
- completion threshold summary: exact staged-route operations reproduced or
  explicitly scoped, missing oracles repaired, real hot path instrumented,
  reversible packets closed, cross-editor comparison used to explain measured
  difference, and final handoff ledgers complete

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable rows: scope, non-goals, timing,
  stop conditions, deliverables, final handoff sections, verification surfaces,
  and success criteria.
- The initial checkpoint list is only the seed. After every loop, the
  supervisor must reconcile this plan against new evidence and may add, update,
  split, merge, retire, remove, reprioritize, or reopen checkpoints.
- Do not continue into implementation until first extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Done when the staged huge-document route has current evidence for Shift+Down
  latency, Shift+Up parity, Cmd+A Delete latency, follow-up typing, undo, scroll
  stability, and native/model selection agreement; any bug/oracle/perf packet
  has a keep/revert/quarantine decision; cross-editor comparison explains the
  measured difference when useful; no speculative runtime patch remains dirty;
  focused proof commands pass or residual risks have concrete owners.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-huge-document-staged-behavior-perf-closure.md`
  passes.

Verification surface:
- `.tmp/plite` route proof on `/examples/huge-document?strategy=staged`
  using real keyboard operations: Shift+Down, Shift+Up, ControlOrMeta+A,
  Delete/Backspace, typing, undo, scroll.
- Native selection proof via `window.getSelection()` plus model selection from
  the editor browser handle.
- Benchmark metrics: command latency, next-paint latency, long task/LoAF,
  selected text/model selection, DOM nodes, scroll top stability.
- Cross-editor comparison: local `../slate`, `../prosemirror`, `../lexical`
  source or existing local benchmark surfaces only, used to explain differences,
  not to broaden scope.
- Focused package/browser tests added or repaired for this exact lane.
- Parent plan check:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-huge-document-staged-behavior-perf-closure.md`.

Constraints:
- Plite private alpha by default: no release, publish, changeset, PR, or
  branch readiness unless the prompt explicitly asks.
- Run Plite behavior commands from `.tmp/plite`; parent repo commands
  prove plans, docs, skills, and templates only.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a
  stopping checkpoint routes to `plite-plan`.
- Do not patch Plate when the run is scoped to Plite.

Boundaries:
- Source of truth: live `.tmp/plite` source/tests/benchmarks and this active
  plan; `vision` for reusable taste.
- Allowed edit scope: `.tmp/plite` runtime/tests/benchmarks/helpers needed
  for staged huge-doc closure, plus this plan. Parent docs only for this plan.
- Browser surfaces: staged huge-document route only unless a focused comparison
  route is required to explain the diff.
- Package/API surfaces: `plite-react` and browser benchmark/proof helpers when
  the hot path proves ownership there.
- Agent/skill surfaces: only if the loop hits a recurring automation miss.
- Docs/research surfaces: this active plan; durable docs only for accepted
  reusable decisions.
- Non-goals: external issue ledgers, broad API cleanup, release/publish/PR,
  broad pagination architecture, Plate patches, raw-device mobile proof unless
  the lane proves it is the blocker.

Blocked condition:
- Stop only after the 2h budget expires and the active packet is closed, or if
  no safe reversible packet remains. Queue soft questions for final handoff.
- Hard stop if the next required move is destructive, commit/PR authority,
  external credential/device access, or an unsafe public/runtime API fork with
  no safe alternate proof/experiment.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.

Automation state:
- surface: huge-document staged behavior/perf
- mode: timed 2h
- checkpoint_policy: dynamic_supervisor
- loops_completed: 8
- goal_status: ready for closeout after `check-complete`
- stop_reason: active packet closed with keep/revert/quarantine decisions and
  no safe low-risk runtime owner left inside the exact route

Current verdict:
- verdict: keep arrow fast path, keep oracle/benchmark repairs, route deeper
  Plite-native selection parity work to the next DOM strategy/selection packet
- confidence: high for exact-route behavior proof; medium for deeper parity
  diagnosis because cross-editor staged harness is useful but not route-equivalent
- next owner: slate-react DOM strategy / selection performance owner
- keep / revert / quarantine call: runtime fast path kept; three speculative
  runtime experiments reverted; bounded-DOM staged experiment quarantined
- reason: exact staged route is stable and verified; remaining parity gap is
  browser/native work plus Plite DOM topology, not the original keydown pipeline

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|----------------------|-------------------|
| checkpoint-zero | slate-automation | done | P0 | Prompt requirements copied into this plan before implementation. | seed closed |
| behavior-proof | slate-ar-stabilize | done | P0 | Focused Playwright staged tests pass on exact default route. | kept |
| oracle-repair | slate-patch / tdd | done | P0 | Added native/model selection checks and staged keyboard command benchmark. | kept |
| hot-path-instrumentation | slate-ar-perf | done | P0 | Benchmark records command, paint, long task, kernel trace, profiler buckets. | kept |
| visual-proof | Playwright | done | P0 | Native selected text checked after Shift+Down and collapse after Shift+Up. | kept |
| cross-editor-comparison | slate-ar-perf | done | P1 | ProseMirror/Lexical comparison confirms native Shift arrows near 16 ms. | kept |
| plite-browser-promotion | plite-browser | queued | P1 | Repeated native/model selection summary helper identified. | next owner |
| mobile-claim-width | slate-automation | scoped | P2 | Desktop staged route only; no raw-device mobile claim made. | scoped |
| huge-document-smoke | slate-ar-stabilize | done | P0 | Shift arrows, select-all/delete, follow-up typing, undo, paste, scroll checks covered. | kept |
| perf-packet | slate-ar-fast / slate-ar-perf | done | P1 | ShiftDown improved from 333.3 ms to 140.6 ms; delete metric repaired to 140.1 ms. | kept |
| final-handoff | slate-automation | done | P0 | Changed list, attention list, checkpoints, commands, risks recorded. | kept |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | all prompt rows | plan creation | prevent prompt compaction misses | closed |
| 1 | add | staged keyboard command benchmark | old Playwright proof used softened route | exact-route metric gap | kept |
| 2 | add | cross-editor native Shift metrics | user allowed comparison to Plite/PM/Lexical | explain why diff | kept |
| 3 | update | delete benchmark metric | delete paint included assertion wait | benchmark honesty | kept |
| 4 | queue | plite-browser helper promotion | native/model selection summary duplicated | reusable helper belongs in plite-browser | queued |
| 5 | scoped | mobile/raw-device | prompt scoped to desktop localhost route | no raw-device claim | scoped |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Objective, constraints, route, stop rules, final handoff, comparison allowance recorded. |
| `plite-automation` source rule read | yes | Skill workflow used through autogoal-backed plan. |
| `vision` read as checkpoint zero | yes | Behavior before perf, native proof before model-only, no hidden debounce. |
| Active goal checked or created | yes | Active goal created for the timed staged-route run. |
| Invocation mode and timebox recorded | yes | Timed 2h loop-start budget with active-packet finish rule. |
| Dynamic checkpoint policy accepted | yes | Checkpoints mutated from evidence during the run. |
| Source of truth and allowed workspaces recorded | yes | `.tmp/plite` runtime/tests/benchmarks plus this parent plan only. |
| Output budget strategy recorded | yes | Evidence written to benchmark artifacts and this plan. |
| Private-alpha release/PR boundary recorded | yes | No release, publish, changeset, PR, or external issue work. |
| Browser proof strategy recorded | yes | Playwright/browser benchmark proof on exact staged route. |
| Package/API proof strategy recorded | yes | `plite-react` keydown runtime and benchmark/test contracts. |
| Mobile/raw-device claim-width policy recorded | yes | Desktop-only proof; raw-device lane not claimed. |
| Skill repair authority and source-rule boundary recorded | yes | No `.agents/**` skill edits needed in this run. |

Work Checklist:
- [x] First checkpoint complete: prompt requirements, scope boundary, timing,
      stop condition, deliverables, final handoff sections, verification
      surfaces, and success criteria copied into this plan before implementation.
- [x] Objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [x] Invocation mode, timebox/deadline, stop-question policy, and remaining
      backlog ladder are recorded.
- [x] Checkpoint supervisor table reconciled after evidence.
- [x] Each loop ended with a keep, revert, quarantine, queue, or scoped decision.
- [x] Current-tree/status packet recorded before retained runtime patch.
- [x] Behavior proof packet recorded for the scoped staged route.
- [x] Visual/native selection proof packet recorded for browser-visible selection.
- [x] Missing oracle packets were written and verified.
- [x] Repeated browser proof patterns were queued for `plite-browser` helper work.
- [x] Mobile/raw-device proof claim width explicitly limited.
- [x] Huge-document correctness smoke covered the named staged route.
- [x] Perf packet ran after behavior reproduction and oracle repair.
- [x] Package/API hard cuts and docs/API consistency marked out of scope.
- [x] Docs/north-star/rule consolidation marked out of scope; no reusable taste gap found.
- [x] Workflow slowdowns logged and avoidable benchmark metric issue repaired.
- [x] Packet ledger contains one row per proof, runtime, oracle, benchmark, or experiment packet.
- [x] Changed list is current and limited to this run.
- [x] Needs-your-attention list is ranked and capped.
- [x] Stopping checkpoints are queued.
- [x] Review gate satisfied by focused contracts plus `bun check`; formal autoreview deferred to next commit-prep request.
- [x] Agent-native review marked N/A because no `.agents/**`, hook, command-template, or skill source changed.
- [x] Output budget discipline followed: broad evidence written to artifacts.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Exact staged route benchmark and focused Playwright proof passed. |
| Dynamic checkpoint reconciliation | yes | Checkpoint mutation ledger updated from evidence. |
| Workspace authority proof | yes | Runtime/tests/benchmarks run from `.tmp/plite`; parent plan updated only under `docs/plans`. |
| Behavior gates | yes | Shift arrows, select-all/delete, follow-up typing, undo, paste, scroll checked. |
| Visual/native selection proof | yes | Native selected text after Shift+Down and native collapse after Shift+Up verified. |
| Missing oracle repair | yes | Exact-route Playwright proof and staged keyboard benchmark added/repaired. |
| `plite-browser` promotion | yes | Helper need queued; benchmark-local helper kept for this run. |
| Mobile/raw-device claim width | yes | Desktop route only; no mobile/raw-device claim. |
| Huge-document correctness smoke | yes | Focused huge-document Playwright tests passed. |
| Package/API proof | yes | Runtime patch covered by vitest, Playwright, benchmark, and `bun check`. |
| Skill/rule sync | no | No `.agents/rules/**` edits. |
| Changed list / review attention / stopping checkpoints | yes | Ledgers below. |
| Final lint/check | yes | `bun check` passed after lint-format repairs. |
| Workflow slowdown review | yes | Metric honesty and cross-editor staged equivalence issues logged. |
| Agent-native review for agent/tooling changes | no | No agent/tooling source changed. |
| Autoreview for non-trivial implementation changes | yes | Deferred to commit-prep; current proof is `bun check` plus focused browser and benchmark commands. |
| Goal plan complete | yes | This plan is ready for `check-complete`; result recorded in final response. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | done | Prompt rows captured before implementation. | closed |
| Status and current-tree closure | done | Existing weak test and route mismatch identified. | closed |
| Gap scan and scenario matrix | done | Scenario matrix below. | closed |
| Behavior proof | done | Focused Playwright tests passed on exact route. | closed |
| Oracle repair | done | Native/model checks and staged command benchmark added. | closed |
| Visual/native proof | done | Native text/collapse assertions pass. | closed |
| plite-browser promotion | queued | Reusable helper identified but not needed to close route. | next owner |
| Mobile/raw-device claim width | scoped | Desktop-only claim width. | closed |
| Huge-document correctness smoke | done | Shift, delete, typing, undo, paste, scroll covered. | closed |
| Perf/API/docs/skill packets | done | Runtime fast path kept; API/docs/skills out of scope. | closed |
| Consolidation and review | done | `bun check` passed; deeper review deferred to commit prep. | closed |
| Final handoff and goal-plan check | done | Handoff ledgers complete. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| huge-document route | staged default | 10k blocks, `content_visibility=none` | Shift+Down | native text, model range, p95 latency | done |
| huge-document route | staged default | 10k blocks, `content_visibility=none` | Shift+Up | native collapse, model collapse, p95 latency | done |
| huge-document route | staged default | 10k blocks, `content_visibility=none` | Cmd/Ctrl+A + Delete | model collapse, block deletion, p95 latency | done |
| huge-document route | staged default | 10k blocks, `content_visibility=none` | follow-up typing | text replacement and caret position | done |
| huge-document route | staged default | 10k blocks, `content_visibility=none` | undo type and undo delete | text restoration and model selection | done |
| huge-document route | staged default | 1200 blocks | type, Enter, scroll | caret visible in scroll parent | done |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| P0 baseline | 1 | slate-automation | Existing tests passed but softened route; exact route slow. | `bench:react:huge-document:staged-keyboard-commands:local` | ShiftDown 333.3 ms, ShiftUp 321.8 ms, Delete old metric 283.2 ms. | keep evidence | close mismatch |
| P1 runtime fast path | 2 | slate-react | DOM-current native ArrowUp/Down should bypass Plite keydown pipeline when no custom handler. | `runtime-keyboard-events.ts` | ShiftDown latest 140.6 ms, ShiftUp latest 127.1 ms. | keep | deeper parity later |
| P2 exact-route Playwright oracle | 3 | tdd | Test must cover `content_visibility=none` and native/model agreement. | `huge-document.test.ts` | 2 focused tests passed. | keep | promote helper |
| P3 staged command benchmark | 4 | slate-ar-perf | Need command, paint, long task, kernel, profiler, native/model artifact. | `huge-document-staged-keyboard-commands.mjs`, package script | Fresh artifact written with p95 metrics. | keep | benchmark registry follow-up |
| P4 delete metric repair | 5 | slate-ar-perf | Delete paint was inflated by correctness wait. | staged command benchmark | Delete latest immediate paint 140.1 ms; model-ready remains separate. | keep | no runtime delete patch |
| P5 cross-editor native Shift metrics | 6 | slate-ar-perf | Explain diff vs PM/Lexical. | `huge-document-cross-editor.mjs` | PM/Lexical Shift around 16 ms; Plite auto/simple staged still spikes. | keep | route deeper parity |
| R1 DOM selection text endpoint fast path | 2 | slate-react | Importing DOM selection text endpoints may reduce Shift cost. | temporary selection reconciler patch | No gain; Shift remained about 340 ms. | revert | closed |
| R2 remove post-keydown vertical sync | 2 | slate-react | Scheduled selection sync may cause latency. | temporary runtime-keyboard-events patch | No gain; Shift remained about 340 ms. | revert | closed |
| Q1 bounded staged background mount off | 3 | slate-react | Keeping DOM bounded may reduce Delete/Shift. | temporary root group batch size 0 | Delete improved only partly; Shift unchanged; changed staged contract. | quarantine/revert | next owner only |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Exact staged route | `/examples/huge-document?strategy=staged` | `PLITE_STAGED_COMMANDS_SURFACES=stagedDefault PLITE_STAGED_COMMANDS_ITERATIONS=3 PLITE_STAGED_COMMANDS_BLOCKS=10000 bun run bench:react:huge-document:staged-keyboard-commands:local` | Chromium | passed; ShiftDown 140.6 ms, ShiftUp 127.1 ms, Delete 140.1 ms | deeper parity owner |
| Focused Playwright | `playwright/integration/examples/huge-document.test.ts` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright ... --grep "keeps staged 10k (Shift\\+ArrowDown|select-all delete)"` | Chromium | 2 passed | keep in integration suite |
| Package contracts | `plite-react`, `slate` | vitest focused contracts and benchmark script contract | jsdom/node | 147 + 14 passed | closed |
| Full fast gate | `.tmp/plite` | `bun check` | node/jsdom | passed | closed |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|---------------|--------|
| Shift+Down from block 5000 offset 3 | model anchor `[5000,0]@3`, focus offset numeric | native text length > 0 | native range inside `[data-plite-path="5000,0"]` | Playwright exact-route test | passed |
| Shift+Up collapse | model returns `[5000,0]@3` | native text length 0 | native collapsed true | Playwright exact-route test | passed |
| Select-all/Delete | model selection full doc then `[0,0]@0` after delete | full-doc native selection remains projected/collapsed | projected model-owned selection by design | benchmark + Playwright | accepted with attention item |
| Scroll stability | caret visible in scrollable parent after staged edits | native caret geometry checked through plite-browser assertion | scroll parent visibility assertion | Playwright staged middle-block test | passed |

plite-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| Native/model selection summary | huge-document Playwright test and staged command benchmark | `editor.selection.nativeSummary()` or `editor.assert.nativeSelection(...)` in `plite-browser` | Current helpers duplicated locally | queue next owner |
| Keyboard command timing | staged command benchmark and huge-document tests | benchmark-local command helper first; `plite-browser` promotion after second reuse outside huge-doc | benchmark artifact proves shape | queue |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| Huge-document staged behavior | Desktop Chromium only | Playwright and local Chromium benchmark | passed | no raw-device/mobile claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| staged 10k default | Shift+Down/Up | model/native agreement and bounded latency | focused Playwright + staged benchmark | passed |
| staged 10k default | Cmd/Ctrl+A + Delete | one empty block, collapsed model selection | focused Playwright + staged benchmark | passed |
| staged 10k default | follow-up typing | `after delete` text and caret | focused Playwright | passed |
| staged 10k default | undo type/delete | empty block then original 10k blocks restored | focused Playwright | passed |
| staged 10k default | paste replacement | single pasted block and caret end | focused Playwright | passed |
| staged 1200 | typing, Enter, scroll | caret visible and split text correct | existing staged middle-block test | passed |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Old staged tests | tdd | fast but misleading | used `content_visibility=element`, not exact route | false green against user complaint | repaired to `none` |
| Delete metric | slate-ar-perf | inflated by assertion wait | benchmark measured paint after correctness poll | old Delete 283-530 ms, new immediate paint 140.1 ms | repaired |
| Cross-editor staged surface | slate-ar-perf | misleading | simplified staged harness is not exact route | opt-in `slateStaged` spikes with fewer DOM nodes | kept opt-in, not default |
| Site rebuild | benchmark | about 30 s per fresh proof | static Next build required for route proof | fresh artifact generated | accepted |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/plite-react/src/editable/runtime-keyboard-events.ts`: native ArrowUp/Down fast path for DOM-current selection when no custom `onKeyDown` exists. |
| tests/oracles/browser proof | `playwright/integration/examples/huge-document.test.ts`: exact staged default route, native selection summary checks, tighter Shift bounds. |
| benchmarks/metrics/targets | Added `bench:react:huge-document:staged-keyboard-commands:local`; new staged command benchmark with kernel/profiler/native/model artifacts; cross-editor native Shift metrics plus opt-in `slateStaged`. |
| examples/docs | This parent goal plan updated under `docs/plans`. |
| skills/workflow | No skill or rule source changed. |
| reverted/quarantined packets | Reverted DOM text endpoint fast path, removed-sync experiment, and bounded staged background-mount experiment; quarantined deeper DOM strategy parity work. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Full-doc Cmd+A native selection remains collapsed/projected | Model selection is correct, but `window.getSelection().toString()` is 0 for full-doc selection. | staged benchmark `afterSelectAll.native.textLength=0` | Decide whether projected full-doc selection is acceptable or needs visible/native affordance parity. |
| 2 | Shift arrows are fixed but not ProseMirror/Lexical parity | Exact route is 140.6/127.1 ms; PM/Lexical are about 16 ms in comparison harness. | cross-editor metrics | Route to DOM topology/native selection parity packet. |
| 3 | Plite auto/simple staged native Shift can still spike | Simplified `slateAuto` ShiftDown hit 1599.4 ms p95 in the comparison harness. | cross-editor artifact | Treat as next high-priority DOM strategy lane, not part of this exact route closeout. |
| 4 | `plite-browser` should own native/model selection summaries | The helper was duplicated in test and benchmark. | `getNativeSelectionSummary`, staged command script | Promote in a later helper packet. |
| 5 | Runtime fast path intentionally skips only no-custom-handler ArrowUp/Down | Avoids breaking consumer `onKeyDown`, but it is still a behavior-policy change. | `runtime-keyboard-events.ts` | Review this patch before commit. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| SC-1 | taste/API | Should projected full-doc selection be allowed to have collapsed native text? | Affects Cmd+A visual/native expectations. | native full-doc affordance work | model-correct delete/undo | Accept short term, plan explicit affordance law. |
| SC-2 | perf target | Is 140 ms staged Shift acceptable for private alpha, or target <50 ms? | Determines whether DOM topology work starts now. | deeper parity optimization | exact route stabilized | Set <50 ms for next perf packet. |
| SC-3 | owner | Should `slateAuto` partial-DOM Shift spikes be next lane? | Cross-editor comparison shows worse spikes outside exact route. | auto/partial DOM route | staged exact route | Make it next DOM strategy owner. |
| SC-4 | helper | Promote native/model selection helpers to `plite-browser` now or after one more reuse? | Prevents test proof copy-paste. | helper package edit | local benchmark proof | Promote next time this pattern repeats. |

Findings:
- The original false green came from testing `content_visibility=element`, while
  the scoped URL uses staged default / `content_visibility=none`.
- The old Delete p95 mixed command paint with assertion/model-readiness wait.
  Immediate Delete paint is now measured separately from correctness readiness.
- Shift Arrow latency was mostly Plite keydown pipeline before the kept patch;
  after the patch, profiler data shows only about 6 ms inside Plite JS for the
  vertical selection sample and the rest is browser/native/DOM topology work.
- ProseMirror and Lexical native Shift arrows are near 16 ms in the local
  comparison harness; Plite still has DOM strategy parity debt.

Decisions and tradeoffs:
- Keep the ArrowUp/Down fast path only when `onKeyDown` is absent, so consumers
  with custom handlers still receive their keydown events.
- Keep the exact-route benchmark and Playwright oracle repairs.
- Keep cross-editor native Shift metrics, but leave `slateStaged` opt-in because
  the simplified staged harness is not equivalent to the huge-document route.
- Do not patch Delete runtime in this packet; the bad number was primarily a
  benchmark metric issue, not a proven core delete defect.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| DOM text-endpoint selection import fast path | 1 | Measure before keeping | Reverted; no Shift gain. |
| Remove post-keydown vertical sync | 1 | Measure before keeping | Reverted; no Shift gain. |
| Disable staged background mount | 1 | Check contract and metrics | Reverted/quarantined; Delete partly improved but Shift did not and contract changed. |
| Cross-editor `slateStaged` first run failed typing | 1 | Use browser-handle/native selection setup | Repaired harness; kept surface opt-in. |
| `bun check` lint failure | 1 | Fix formatter and regex issues | Repaired; `bun check` passed. |

Verification evidence:
- `PLITE_STAGED_COMMANDS_SURFACES=stagedDefault PLITE_STAGED_COMMANDS_ITERATIONS=3 PLITE_STAGED_COMMANDS_BLOCKS=10000 bun run bench:react:huge-document:staged-keyboard-commands:local`
  passed after fresh build. Latest p95: ShiftDown 140.6 ms, ShiftUp 127.1 ms,
  SelectAll 32.4 ms, Delete 140.1 ms, UndoDelete 70.5 ms.
- Baseline before kept runtime patch on exact staged route: ShiftDown 333.3 ms,
  ShiftUp 321.8 ms, Delete old mixed metric 283.2 ms.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "keeps staged 10k (Shift\\+ArrowDown|select-all delete)"`
  passed, 2 tests.
- `bun --filter plite-react test:vitest -- test/editing-kernel-contract.test.ts test/keyboard-input-strategy-contract.test.ts test/dom-strategy-and-scroll.test.tsx test/projected-command-contract.test.ts`
  passed, 147 tests.
- `bun test ./packages/plite/test/core-benchmark-scripts-contract.ts` passed,
  14 tests.
- `CROSS_EDITOR_HUGE_SURFACES=slateAuto,prosemirror,lexical CROSS_EDITOR_HUGE_ITERATIONS=1 CROSS_EDITOR_HUGE_BLOCKS=10000 CROSS_EDITOR_HUGE_TYPE_OPS=10 bun run bench:react:huge-document:cross-editor:local`
  passed. ProseMirror/Lexical Shift arrows were about 16 ms; Plite auto still
  showed native Shift spikes.
- `bun check` passed: lint, package/site/root typecheck, bun tests, slate-layout
  tests, and slate-react vitest.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-05-huge-document-staged-behavior-perf-closure.md`
- Surface and route/package:
  `/examples/huge-document?strategy=staged`, `.tmp/plite`, `plite-react`
- Invocation mode, elapsed/timebox, loop/checkpoint count: timed 2h mode; active
  packet completed; 8 packet loops recorded.
- Behavior gates and visual proof: exact-route Playwright and staged benchmark
  passed with native/model selection checks.
- Primary metric baseline/latest/best: ShiftDown 333.3 -> 140.6 ms; ShiftUp
  321.8 -> 127.1 ms; Delete old mixed 283.2 ms -> honest immediate 140.1 ms.
- Bugs fixed and oracles added: exact-route false green fixed; native/model
  Shift oracle added; delete metric repaired.
- Benchmark/skill/docs repairs: benchmark command added; cross-editor native
  Shift metric added; no skill edit needed.
- Workflow slowdowns and repairs: route mismatch and delete metric issue fixed;
  cross-editor staged equivalence logged.
- Changed list: see Changed list table.
- Needs your attention: see ranked table.
- Stopping checkpoints to unblock: SC-1 through SC-4.
- Accepted deferrals and residual risks: raw-device mobile, full-doc native
  selection affordance, deeper Plite/PM/Lexical parity.
- Next owner: DOM strategy/native selection parity packet, then `plite-browser`
  helper promotion.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after exact staged-route proof. |
| Where am I going? | Final response after `check-complete` and goal close. |
| What is the goal? | Stabilize staged huge-document Shift arrows, delete, typing, undo, scroll, and model/native selection on exact route. |
| What have I learned? | Original proof tested the wrong route; after fix, remaining gap is DOM/native selection parity. |
| What have I done? | Kept one runtime fast path, added/repaired oracles and benchmarks, reverted failed experiments, ran full fast check. |
| What changed in the checkpoint plan? | Added exact-route keyboard benchmark, delete metric repair, cross-editor native Shift metrics, and queued helper/stopping decisions. |

Timeline:
- 2026-06-05T13:50:51.687Z Goal plan created.
- 2026-06-05T14:00Z Existing weak route proof identified.
- 2026-06-05T14:15Z Exact-route staged keyboard benchmark added.
- 2026-06-05T14:35Z ArrowUp/Down DOM-current fast path kept after failed alternatives.
- 2026-06-05T15:15Z Delete benchmark metric repaired.
- 2026-06-05T16:27Z `bun check` passed.

Open risks:
- Full-doc Cmd+A native selection affordance remains a product/taste decision.
- Plite native Shift parity with ProseMirror/Lexical is not solved below 50 ms.
- Cross-editor simplified `slateStaged` is opt-in because it is not equivalent
  to the exact huge-document route.
