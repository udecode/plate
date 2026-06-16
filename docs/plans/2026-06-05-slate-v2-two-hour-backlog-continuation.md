# slate v2 two hour backlog continuation

Objective:
Run timed Slate v2 backlog loops for up to 2h of loop starts, finish any active
packet cleanly, and hand off proof, changes, slowdowns, attention items, stops,
and next owner.

Goal plan:
docs/plans/2026-06-05-slate-v2-two-hour-backlog-continuation.md

Template:
docs/plans/templates/slate-automation.md

Primary template:
docs/plans/templates/slate-automation.md

Applied packs:
- none

Automation source:
- type: user skill invocation
- prompt / link: `[$slate-automation](/Users/zbeyens/git/plate-2/.agents/skills/slate-automation/SKILL.md) 2h loops`
- surface / route / package: unspecified by prompt; continue current Slate v2 automation backlog from `.tmp/slate-v2` and parent Slate-v2 docs/plans only
- invocation mode: timed batch loops
- timebox / deadline: `2h` means keep starting or continuing safe packets while elapsed is under roughly 2h; finish/revert/quarantine the active packet even if the clock is exceeded
- completion threshold summary: checkpoint-zero recorded, backlog read, at least one safe current owner processed with proof and keep/revert/quarantine, dynamic checkpoints reconciled, final handoff sections complete

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
- This run can close only after the prompt contract is copied into this plan,
  the current Slate v2 backlog is read, a safe next owner is selected from
  evidence, at least one behavior/oracle/API/benchmark/workflow packet is
  completed or quarantined, remaining safe owners are either processed while the
  loop-start budget remains or queued as stopping checkpoints, and the final
  handoff contract is filled.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-slate-v2-two-hour-backlog-continuation.md`
  passes.

Verification surface:
- Current backlog/status proof: parent plan reads plus Slate v2 source/package
  command audit, without proactive git state checks.
- First selected proof lane: cross-browser native/model selection parity unless
  current source evidence reroutes to a higher-risk owner.
- Likely commands: focused Playwright greps across chromium/firefox/webkit,
  `bun --filter slate-browser typecheck` if helper/API changes, focused
  `bun --filter slate-browser test:*` when package helpers change, and
  Slate v2 `bun check` only if runtime/API changes justify final broad proof.
- Browser proof strategy: prefer managed/current-tree Playwright for final
  source-sensitive proof; avoid stale `PLAYWRIGHT_BASE_URL` after runtime edits.
- Mobile/raw-device: do not claim raw device behavior unless
  `bun test:mobile-device-proof:raw` can produce real Appium/device artifacts.
- Final plan proof:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-slate-v2-two-hour-backlog-continuation.md`.

Constraints:
- Slate v2 private alpha by default: no release, publish, changeset, PR, or
  branch readiness unless the prompt explicitly asks.
- Run Slate v2 behavior commands from `.tmp/slate-v2`; parent repo commands
  prove plans, docs, skills, and templates only.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a
  stopping checkpoint routes to `slate-plan`.
- Do not patch Plate when the run is scoped to Slate v2.

Boundaries:
- Source of truth: `.tmp/slate-v2` Slate v2 source/tests/benchmarks first;
  parent `docs/plans/**`, `docs/slate-v2/**`, and `.agents/rules/**` only when
  this run needs durable automation/docs repair.
- Allowed edit scope: `.tmp/slate-v2` runtime/tests/benchmarks/helpers and this
  parent plan; skill/rule edits only for proven reusable workflow misses.
- Browser surfaces: exact Slate v2 example routes exercised by Playwright; no
  stale dev-server proof after source edits.
- Package/API surfaces: `slate-browser` helpers only if repeated proof patterns
  deserve promotion; no fake aliases or compatibility layers.
- Agent/skill surfaces: `slate-automation`, `autogoal`, `slate-browser`, or
  benchmark rules only when the loop misses a repeatable workflow requirement.
- Docs/research surfaces: parent Slate-v2 plans and `docs/slate-v2/**` when the
  accepted decision is reusable; no raw history dump.
- Non-goals: release/publish/changeset/PR readiness, external issue-ledger
  checkmark grind, pagination architecture unless this packet proves it owns
  the issue, Plate runtime patches.

Blocked condition:
- Hard stop only for missing raw device authority/artifacts, inaccessible source
  needed for the selected owner, unsafe architecture fork without enough proof
  to keep/revert/quarantine, or a taste gap not covered by `vision`.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.

Automation state:
- surface: Slate v2 current backlog, initially cross-browser selection parity
- mode: timed batch loops, 2h loop-start budget
- checkpoint_policy: dynamic_supervisor
- current_loop: 2
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: check-complete
- goal_status: active

Current verdict:
- verdict: ready-for-check-complete
- confidence: high for this packet; residual huge-doc architecture gap is routed,
  not solved
- next owner: slate-plan / slate-ar-perf for vertical huge-doc native-selection
  architecture
- keep / revert / quarantine call: keep browser oracle and benchmark honesty
  patches; revert runtime threshold experiment; quarantine
  `content_visibility=element` diagnostic lane
- reason: focused behavior, benchmark, lint/type/test, and rule-sync proof are green

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-slate-v2-two-hour-backlog-continuation.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-automation | complete | P0 | Prompt only says `2h loops`; copied timing, boundary, stop, proof, and handoff contract before implementation; `vision` read. | Requirement rows complete. | update |
| status | slate-automation | complete | P0 | Read active backlog plans and current evidence without proactive git state checks. | Current state recorded. | update |
| gap-scan | slate-automation | complete | P0 | Identified cross-browser fake-green rows, staged content-visibility diagnostic debt, and cross-editor ShiftDown metric ambiguity. | Gaps routed to packet owners. | update |
| behavior-proof | slate-ar-stabilize | complete | P0 | Prove stable editor behavior before perf. | Focused cross-browser selection and staged huge-doc command proof passed. | update |
| oracle-repair | slate-patch / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | Active fake-green rows widened; Firefox split-text caret oracle repaired. | update |
| visual-proof | Playwright / Browser | complete | P0 | Prove visible editor behavior and native selection. | 21 richtext rows and 6 plaintext rows passed across Chromium/Firefox/WebKit. | update |
| cross-browser-selection-parity | slate-browser / Playwright | complete | P0 | Previous backlog scopes Firefox/WebKit native arrow/pointer parity; prove or narrow it before claiming browser-wide selection. | Plaintext Shift+Arrow, selected richtext delete/caret/right-margin, and richtext ArrowLeft/Right rows widened and green across desktop browsers. | keep |
| browser-gated-return-oracle | slate-automation / testing | complete | P0 | Route tests can fake green by `return`ing for browser/project gates instead of `test.skip` or real proof. | Active rows fixed; `slate-automation` rule patched and generated mirror synced. | keep |
| mobile-claim-width | slate-automation | complete | P1 | Separate raw-device proof from viewport proof. | No raw-device claim made; desktop proof remains scoped. | update |
| huge-document-smoke | slate-ar-stabilize | complete | P1 | Smoke huge-doc correctness without broad architecture work. | Staged command benchmark and strict full 5k benchmark passed; cross-editor comparison recorded. | update |
| perf-packet | slate-ar-fast / slate-ar-perf | complete | P2 | Optimize only after correctness is green. | Runtime threshold experiment worsened ShiftDown and was reverted; benchmark wait/metric split kept. | keep/revert |
| consolidation | slate-automation | complete | P1 | Move accepted reusable decisions to durable docs/rules. | `slate-automation` source rule patched and synced. | keep |
| final-handoff | slate-automation | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete; check-complete pending. | update |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded |
| 0 | update/add/reprioritize | checkpoint-zero, status, cross-browser-selection-parity | Prompt has only `2h loops`; previous backlog names cross-browser native selection as scoped gap. | Timed run needs a safe owner; browser-width selection proof is safer than blind staged/full-DOM architecture. | checkpoint-zero complete; cross-browser parity promoted to first packet |
| 1 | update/add | visual-proof, oracle-repair, browser-gated-return-oracle | Firefox/WebKit plaintext Shift+Arrow skipped; richtext right-margin returned early but showed green. | Some browser-width proof was stale or fake-green. | Widened selected rows and added false-pass checkpoint |
| 2 | add/update/reprioritize | huge-document-smoke, perf-packet, cross-editor-benchmark-honesty | Staged keyboard command metrics were good, but strict full diagnostic and cross-editor comparison showed different hot lanes. | Need distinguish `content_visibility=element`, staged steady state, and cold partial-DOM ShiftDown instead of chasing one vague slow number. | Benchmark wait and lane metrics kept; runtime threshold experiment reverted |

Mutation rules:
- Add a checkpoint when a new failure, missing oracle, missing metric, API smell,
  visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command,
  exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become
  too large.
- Merge checkpoints when overlap confuses routing or two rows always close
  together.
- Retire or remove checkpoints that are stale, superseded, irrelevant,
  duplicated, or contradicted by current evidence. Record the reason in the
  mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current
  evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The
  user's latest request, `vision`, and current source evidence outrank
  stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Prompt copied: `slate-automation`, `2h loops`, no explicit route, timed batch continuation. |
| `slate-automation` source rule read | yes | Skill contract followed from provided/loaded instructions: autogoal, checkpoint-zero, dynamic checkpoints, final handoff. |
| `vision` read as checkpoint zero | yes | Read `/Users/zbeyens/git/plate-2/.agents/skills/vision/SKILL.md`. |
| Active goal checked or created | yes | Created active autogoal for this run before implementation. |
| Invocation mode and timebox recorded | yes | Timed batch loops, 2h loop-start budget, finish active packet cleanly. |
| Dynamic checkpoint policy accepted | yes | Checkpoint supervisor may add/update/remove/reprioritize after each loop. |
| Source of truth and allowed workspaces recorded | yes | `.tmp/slate-v2` first; parent Slate-v2 docs/plans; no proactive git status. |
| Output budget strategy recorded | yes | Use focused reads/commands; artifact/plan tables for broad evidence. |
| Private-alpha release/PR boundary recorded | yes | No release/publish/changeset/PR readiness unless explicitly asked. |
| Browser proof strategy recorded | yes | Managed/current-tree Playwright for final source-sensitive proof; avoid stale server proof after edits. |
| Package/API proof strategy recorded | yes | `slate-browser` helpers only for repeated proof patterns; typecheck/tests if changed. |
| Mobile/raw-device claim-width policy recorded | yes | No raw mobile claim without raw device artifact command. |
| Skill repair authority and source-rule boundary recorded | yes | Source rules first plus sync only for proven reusable workflow misses. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [x] Invocation mode, timebox/deadline, stop-question policy, and remaining
      backlog ladder are recorded.
- [x] Checkpoint supervisor table has been reconciled at least once after the
      initial seed.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split,
      merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [x] Current-tree/status packet recorded before new runtime patches.
- [x] Behavior proof packet recorded for every in-scope stable editor family or
      explicitly skipped/deferred with reason.
- [x] Visual/native selection proof packet recorded for browser-visible
      selection/editing risks or explicitly scoped.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or
      deferred with owner and proof command.
- [x] Repeated browser proof patterns are promoted to `slate-browser` or queued
      with reason.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited;
      Playwright viewport proof is not recorded as raw-device proof.
- [x] Huge-document correctness smoke is run or deferred with owner and reason.
- [x] Perf packet runs only after correctness is green, or is marked N/A for
      this run.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are
      audited when in scope.
- [x] Docs/north-star/rule consolidation is applied when a reusable decision is
      accepted, or marked N/A.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the
      owner skill/script/gate.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark,
      docs, or skill packet.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or
      marked N/A with reason.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or
      prompt/tooling changes, or marked N/A with reason.
- [x] Output budget discipline is followed: broad scans are capped or written
      to artifacts instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Run the proof commands/artifacts named in this plan | Focused Playwright rows, staged/full/cross-editor benchmarks, release discipline, typecheck, and `bun check` passed. |
| Dynamic checkpoint reconciliation | complete | Prove the plan was updated from evidence and not frozen to the initial seed | Mutation ledger records fake-green oracle, huge-doc benchmark honesty, runtime experiment revert, and architecture defer. |
| Workspace authority proof | complete | Record cwd/tool for each Slate v2, parent-docs, skill, browser, package, or benchmark proof | Slate v2 commands ran in `.tmp/slate-v2`; parent `pnpm install` synced `.agents/rules/**` to `.agents/skills/**`. |
| Behavior gates | complete | Run focused stable behavior proof or record scoped defer rows | 6 plaintext + 24 richtext desktop cross-browser rows passed. |
| Visual/native selection proof | complete | Record Browser/Playwright/native-selection evidence or scoped blocker | Model selection, native selection/selected text, DOM caret, visual caret, and right-margin geometry rows passed in Playwright desktop browsers. |
| Missing oracle repair | complete | Add/verify/revert/quarantine oracle packets or record owner defer | Firefox split text-node caret shape accepted by helper; fake-green `return` rows replaced with real desktop proof or `test.skip`. |
| `slate-browser` promotion | complete | Add/verify helper/API or record queue/defer reason | No public helper promoted: the repeated issue is a workflow/oracle rule, repaired in `slate-automation`; broader helper extraction remains queued. |
| Mobile/raw-device claim width | complete | Run raw-device proof or record that only scoped viewport/browser proof is available | No raw mobile claim made; raw device lane remains blocked until real device artifacts exist. |
| Huge-document correctness smoke | complete | Run focused huge-document behavior smoke or record owner defer | Staged keyboard commands, strict full 5k, and cross-editor benchmark passed; architecture gap routed. |
| Package/API proof | complete | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | No package/API exports changed; `bun --filter slate-react typecheck` and `bun check` passed. |
| Skill/rule sync | complete | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | Parent `pnpm install`; `rg` found new rule in source and generated `SKILL.md`. |
| Changed list / review attention / stopping checkpoints | complete | Fill final handoff ledgers from current packet evidence | Ledgers filled below. |
| Final lint/check | complete | Run scoped lint/check or record why no code changed | `.tmp/slate-v2` `bun lint:fix`, `bun test:release-discipline`, `bun --filter slate-react typecheck`, and `bun check` passed. |
| Workflow slowdown review | complete | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Fake-green rows and staged warmup benchmark were repaired; failed runtime threshold experiment reverted. |
| Agent-native review for agent/tooling changes | complete | Load `agent-native-reviewer` and close accepted findings, or N/A | Manual agent-native pass: source rule and generated mirror improve future agent proof parity; no user-only workflow, missing tool, or isolated state introduced. |
| Autoreview for non-trivial implementation changes | complete | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | Structured autoreview rerun clean after fixing accepted findings. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-slate-v2-two-hour-backlog-continuation.md` | Passed after stale closeout rows were patched. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | prompt rows, source boundaries, stop rules, north-star read | status |
| Status and current-tree closure | complete | backlog plans show staged/full-DOM and cross-browser selection as remaining gaps | gap scan |
| Gap scan and scenario matrix | complete | fake-green browser rows and huge-doc benchmark-honesty gaps selected | behavior proof |
| Behavior proof | complete | plaintext/richtext rows widened and green across Chromium/Firefox/WebKit | oracle repair |
| Oracle repair | complete | Firefox split text-node caret shape accepted; fake-green `return` rows repaired | visual proof |
| Visual/native proof | complete | model/native/DOM/visual caret proof passed in focused rows | slate-browser promotion |
| slate-browser promotion | complete | no public helper promoted; durable rule repair chosen | mobile claim width |
| Mobile/raw-device claim width | complete | no raw mobile claim made | huge-document smoke |
| Huge-document correctness smoke | complete | staged commands, full strict, and cross-editor proof passed | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | complete | benchmark wait/metrics kept, runtime experiment reverted, skill rule synced | consolidation |
| Consolidation and review | complete | validation green; autoreview clean; agent-native pass complete | final handoff |
| Final handoff and goal-plan check | complete | final handoff filled; `check-complete` passed after stale-row failure was patched | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| stable selection | richtext/plaintext | chromium/firefox/webkit | arrows, pointer, selected Backspace/Delete, insertion before punctuation | model + native selection + DOM endpoint/caret | complete |
| huge-document | staged/full-DOM | chromium desktop | click, Shift+Arrow, select/delete | perf plus native/model selection | complete smoke; architecture gap routed |
| huge-document cross-editor | slateAuto/slateStaged/slateVirtualized/prosemirror/lexical | chromium desktop | type, select, Shift+Arrow | lane-specific p95, DOM nodes, long task | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| P0 checkpoint-zero | 0 | slate-automation | Prompt has minimal parameters; must not miss timing/stop/handoff defaults. | this plan | plan contract complete | keep | status/gap scan |
| P1 cross-browser selection | 1 | slate-browser / Playwright | Browser-width selection proof was scoped or fake-green. | widened route tests and Playwright commands | 30 widened desktop rows passed | keep | validation |
| P2 workflow skill repair | 1 | slate-automation | Browser/project-gated `return` rows fake pass. | `.agents/rules/slate-automation.mdc`, `pnpm install` | mirror contains new rule | keep | validation |
| P3 staged/full-DOM perf diagnosis | 2 | slate-ar-perf / benchmark | ShiftDown vs click/content-visibility debt needed exact owner. | staged commands, full strict, cross-editor benchmarks | content-visibility row quarantined; cross-editor wait/metrics kept; runtime threshold reverted | keep/revert/quarantine | validation |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| cross-browser selection scoped gap | current backlog | focused Playwright selection rows across chromium/firefox/webkit | Playwright | complete: 30 rows green | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| browser-width selection parity | previous backlog says Firefox/WebKit are scoped | native selection and DOM caret assertions per browser | focused Playwright | 24 richtext rows + 6 plaintext rows pass | keep widened rows |

slate-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| fake browser/project gates | richtext/plaintext route tests | no `slate-browser` API yet; this is first a workflow/oracle rule | focused richtext/plaintext cross-browser runs plus skill mirror audit | repair `slate-automation`, queue broader helper/API only when repeated selectors stabilize |
| native/model caret helpers | richtext/plaintext/huge-doc rows | existing local helper needed split-text-node support for Firefox | richtext cross-browser run | keep helper repair, do not promote public API this run |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| raw Android/iOS editor behavior | none in prompt | raw Appium/device command only | not run | no raw mobile claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| staged/full-DOM prior debt | Shift+Arrow/select/delete/click | staged commands + full strict + cross-editor compare | complete | default staged commands bounded; `content_visibility=element` click quarantined; staged start ShiftDown remains slower than ProseMirror/Lexical |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| stale Playwright server proof | browser proof | previous run found stale `PLAYWRIGHT_BASE_URL` can lie | current-tree managed Playwright for final source-sensitive proof | evidence quality | used managed proof after edits |
| browser-gated `return` | route tests/oracles | `rg -U` found many project/browser gate returns across example specs | first selected rows had fake pass/skips | avoidable oracle weakness | patch active rows; add skill repair |
| cross-editor staged warmup | benchmark | cross-editor measured staged before native surface completion | slateStaged ShiftDown ~1.2s before wait | benchmark honesty gap | wait for staged native surface before steady-state comparison |
| parallel Playwright specs | local workflow | running richtext and plaintext Playwright specs concurrently | Next build lock failed plaintext startup | avoidable local slowdown | rerun Playwright specs sequentially; keep future local browser proofs one webServer build at a time |
| over-broad Firefox model selection assertion | test oracle | first autoreview found collapsed-first-block predicate could hide wrong leaf/offset | false-positive path in Delete-before-punctuation row | accepted review finding | replace with exact allowed browser model-selection shapes |
| single-node DOM caret helper | test oracle | autoreview found widened rows still assumed/then over-relaxed single DOM text-node caret shape | split-node and mid-node false-positive risk | accepted review finding | use split-aware helpers that also reject mid-node caret tails |
| staged benchmark metrics callback | benchmark | autoreview found DOM-strategy metrics callback could add Slate-only observer overhead to measured iterations | benchmark honesty risk | accepted review finding | collect metrics only for staged warmup, rerender without callback before measured iterations |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none kept; one runtime vertical fast-path threshold experiment was reverted |
| tests/oracles/browser proof | widened selected richtext/plaintext Playwright rows to real desktop cross-browser proof; repaired split text-node caret helper |
| examples/docs | this plan |
| benchmarks/metrics/targets | cross-editor benchmark waits for staged steady native surface and emits lane-specific metrics |
| release/test inventory | bumped browser-proof inventory count after the gate confirmed only classified count drift |
| skills/workflow | `slate-automation` source rule patched with browser-gated return false-positive rule and synced via `pnpm install` |
| reverted/quarantined packets | runtime vertical fast-path threshold experiment reverted; `content_visibility=element` diagnostic quarantined |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Slate vertical ShiftDown still loses badly to ProseMirror/Lexical in huge-doc lanes. | After benchmark repair: staged steady start ~450ms, middle ~142ms; auto/virtualized cold partial-DOM ~1.2s; ProseMirror/Lexical ~16ms. | cross-editor benchmark | Next owner should be architecture/perf, not another threshold tweak. |
| 2 | Staged/full-DOM architecture debt remains real. | Strict full diagnostic still shows `content_visibility=element` click around 249ms and DOM around 20355. | huge-document perf ledger | Route to `slate-plan` / `slate-ar-perf` with reversible design packets. |
| 3 | Raw mobile proof is unavailable unless a device lane exists. | Desktop/browser proof cannot prove Android/iOS IME/clipboard. | raw mobile checkpoint | Keep claim scoped until raw device artifacts exist. |
| 4 | Browser-gated `return` is a broad oracle smell beyond the active rows. | It reports pass instead of skip or proof when a project/browser is excluded. | `rg -U` audit | Continue cleanup opportunistically; the reusable rule is now patched. |
| 5 | Cross-browser selection coverage improved, but this was not a full repo sweep. | This run widened selected stable rows, not every possible browser-specific selection route. | focused Playwright greps | Keep adding browser-width rows when touching selection tests. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| SC-cross-browser-selection | closed checkpoint | Can Firefox/WebKit native pointer/arrow parity be made first-class now? | This packet proved selected stable rows across Chromium/Firefox/WebKit. | Full repo sweep still open. | Focused selected rows are green. | Continue opportunistically, not a blocker for this run. | current packet |
| SC-staged-full-dom | architecture defer | Should staged/full-DOM become the next architecture/perf packet after selection parity? | It is still the bad huge-doc lane. | Staged/full-DOM optimization. | Selection parity proof and benchmark honesty. | Experiment only with keep/revert/quarantine, no constant tweak. | previous full-confidence plan |
| SC-raw-mobile | hard boundary | Can this machine provide raw device proof artifacts? | Raw mobile cannot be inferred. | Raw Android/iOS claim. | Desktop/browser proof. | Keep blocked until device lane exists. | mobile proof policy |
| SC-slate-vertical-native-layout | architecture/perf | Should huge-doc vertical selection abandon native layout, simplify DOM, or introduce a special visual selection overlay? | ProseMirror/Lexical are much faster on native ShiftDown; the simple model-strategy threshold experiment was worse. | Runtime architecture choice for vertical selection over huge DOM. | Tests/benchmark honesty and non-runtime work. | Route to `slate-plan` / `slate-ar-perf` with a proper design packet. | cross-editor metrics |

Findings:
- Checkpoint-zero complete: the prompt gives only `2h loops`, so this run is a
  timed continuation from the current Slate v2 automation backlog.
- Previous backlog names two useful continuation owners: staged/full-DOM
  architecture/perf debt and cross-browser native selection breadth.
- Cross-browser selection parity is the first safe owner because it narrows a
  claim-width gap without rearchitecting staged/full-DOM blindly.
- Staged/full-DOM stays queued behind evidence; no constant/group-size tweak is
  allowed without keep/revert/quarantine metrics.
- Existing Firefox/WebKit Shift+Arrow plaintext rows were stale skips; they
  pass when widened to desktop all-browser proof.
- The richtext right-margin row was a fake-green return on non-Chromium; once
  widened, it passes Chromium/Firefox/WebKit.
- Firefox can represent an inserted character before punctuation as a separate
  text node/leaf while preserving visible text, model text, collapsed model
  selection, native caret, and visual caret. The oracle now accepts that exact
  browser shape instead of overfitting Chromium/WebKit leaf paths.
- Staged keyboard command route at 10k is bounded across default, DOM-present,
  and content-visibility variants: ShiftDown about 141ms p95 and Delete about
  124-132ms p95.
- Strict full 5k benchmark still shows `content_visibility=element` as a bad
  diagnostic row: start click-to-paint about 249ms, click-to-selection-ready
  about 238ms, long task about 231ms, DOM about 20355. Default promoted budgets
  pass.
- Cross-editor comparison shows the remaining vertical-selection architecture
  gap: ProseMirror/Lexical ShiftDown p95 about 16ms, Slate staged steady start
  about 450ms and middle about 142ms, and Slate auto/virtualized cold partial
  lanes about 1.2s.

Decisions and tradeoffs:
- Treat `2h` as loop-start budget, not a hard kill switch. The active packet
  must end cleanly.
- Do not ask the user for routing just because the prompt is broad. Pick the
  safest high-value backlog owner and queue soft decisions.
- Keep the benchmark wait/metric split because it makes the cross-editor
  comparison honest.
- Revert the runtime top-level-count threshold experiment because it worsened
  staged ShiftDown from about 475ms to about 1.27s.
- Quarantine `content_visibility=element` as an experimental example diagnostic,
  not a default runtime regression. Docs already say element-level
  `content-visibility` can be slower than none.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Multiline `rg` without `-U` | 1 | rerun with `rg -U` | found browser-gated `return` rows |
| Over-specific final selection path after Firefox punctuation insert | 2 | assert behavior contract: collapsed first-block model selection plus native/visual caret | richtext cross-browser packet passed 21/21 |
| Runtime threshold experiment for huge vertical arrows | 1 | revert and classify as architecture/perf owner | reverted after staged ShiftDown worsened to about 1.27s |

Verification evidence:
- Active autogoal created.
- Read `autogoal` and `vision` before implementation.
- Read prior full-confidence and staged selection/delete plans.
- `.tmp/slate-v2`: current tests as-is skipped plaintext Shift+Arrow in
  Firefox/WebKit, proving claim-width debt.
- `.tmp/slate-v2`: widened plaintext Shift+Arrow rows passed
  Chromium/Firefox/WebKit, 6/6.
- `.tmp/slate-v2`: selected richtext delete/caret/right-margin rows passed
  Chromium/Firefox/WebKit, 24/24 after oracle repair.
- `.tmp/slate-v2`: richtext ArrowLeft/ArrowRight row passed
  Chromium/Firefox/WebKit, 3/3 after widening.
- Parent repo: `pnpm install` synced the `slate-automation` browser-gated
  return rule into `SKILL.md`; mirror audit found the rule.
- `.tmp/slate-v2`: staged keyboard command benchmark passed and wrote
  `tmp/slate-react-huge-document-staged-keyboard-commands-surfaces-stagedDefault-stagedDomPresent-stagedContentVisibility-blocks-10000-iters-3.json`.
- `.tmp/slate-v2`: strict full 5k benchmark passed promoted budgets and kept
  `content_visibility=element` as diagnostic debt.
- `.tmp/slate-v2`: cross-editor benchmark ran before and after benchmark repair;
  final all-surface run wrote
  `tmp/slate-react-huge-document-cross-editor-benchmark-surfaces-slateAuto-slateStaged-slateVirtualized-prosemirror-lexical-blocks-5000-iters-3-ops-10.json`.
- `.tmp/slate-v2`: small-config staged cross-editor proof passed with
  `CROSS_EDITOR_HUGE_SURFACES=slateStaged CROSS_EDITOR_HUGE_BLOCKS=500
  CROSS_EDITOR_HUGE_ITERATIONS=1 CROSS_EDITOR_HUGE_TYPE_OPS=5`, proving the
  metrics-based staged wait does not hang below the staged threshold.
- `.tmp/slate-v2`: latest 24-row richtext packet passed after split-aware
  caret-end and caret-between helpers rejected the accepted false-positive
  review paths.
- `.tmp/slate-v2`: `bun test:release-discipline && bun check` passed after
  review-triggered fixes.
- `.tmp/slate-v2`: `node --check scripts/benchmarks/browser/react/huge-document-cross-editor.mjs` and `node --check scripts/benchmarks/browser/react/huge-document-full.mjs` passed.
- `.tmp/slate-v2`: structured autoreview final rerun exited clean:
  `autoreview clean: no accepted/actionable findings reported`.
- Parent repo: manual agent-native pass on `.agents/rules/slate-automation.mdc`
  and generated `SKILL.md` found no parity gap; the change improves agent proof
  behavior and introduces no user-only action or isolated agent state.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-05-slate-v2-two-hour-backlog-continuation.md`
- Surface and route/package: Slate v2 current backlog, initially cross-browser
  selection parity plus huge-document staged/full-DOM benchmark honesty.
- Invocation mode, elapsed/timebox, loop/checkpoint count: timed batch loops,
  2h loop-start budget, 2 loops plus review/closeout.
- Behavior gates and visual proof: 6 plaintext Shift+Arrow rows and 24 selected
  richtext rows passed across Chromium/Firefox/WebKit with model/native/DOM/
  visual caret assertions.
- Primary metric baseline/latest/best and stop reason: staged steady-state
  cross-editor latest has Slate staged ShiftDown 448.7ms start and 141.6ms
  middle vs ProseMirror 16.3/16.4ms and Lexical 16.1/16.3ms; Slate auto
  start is 1240.3ms and Slate virtualized start is 1204.2ms. Runtime threshold
  experiment worsened staged to about 1.27s, so it was reverted.
- Bugs fixed and oracles added: fake-green browser/project `return` rows were
  converted to real desktop proof or `test.skip`; Firefox split text-node
  caret shape is accepted without weakening model/native/visual behavior; the
  caret-end helper rejects mid-node tail false positives.
- Benchmark/skill/docs repairs: cross-editor benchmark waits for Slate staged
  native surface using temporary DOM-strategy metrics, removes the callback
  before measured iterations, emits lane-specific metrics, and
  `slate-automation` now warns against browser-gated fake-green rows.
- Workflow slowdowns and repairs: stale server proof avoided by current-tree
  Playwright; benchmark warmup fixed; release-discipline inventory drift fixed;
  failed runtime threshold packet reverted; parallel Playwright build lock
  logged; autoreview-driven oracle/benchmark fixes landed.
- Changed list: parent `slate-automation` rule/mirror and this plan; Slate v2
  richtext/plaintext route tests, cross-editor benchmark, and escape-hatch
  inventory contract.
- Needs your attention: huge-doc vertical native-selection architecture,
  staged/full-DOM diagnostic debt, raw mobile lane absence, broader fake-green
  return cleanup, and selection coverage opportunistic expansion.
- Stopping checkpoints to unblock: `SC-staged-full-dom`,
  `SC-raw-mobile`, and `SC-slate-vertical-native-layout`; cross-browser
  selected-row checkpoint is closed but not a full repo sweep.
- Accepted deferrals and residual risks: no raw mobile claim, no public
  `slate-browser` helper promotion, no full selection repo sweep, no runtime
  huge-doc architecture fix kept.
- Next owner: `slate-plan` / `slate-ar-perf` for huge-doc vertical selection
  architecture, with reversible packets and keep/revert/quarantine metrics.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Validation and review gates are green; `check-complete` is the only closeout row left. |
| Where am I going? | Run `check-complete`, then final response and goal completion if it passes. |
| What is the goal? | Close the 2h slate-automation batch with clean packet decisions and no dirty half-patch. |
| What have I learned? | Cross-browser selected stable rows are green; huge-doc vertical selection remains an architecture/perf gap. |
| What have I done? | Widened selection proof, repaired split-node/mid-node caret oracles, repaired benchmark honesty, synced skill rule, reverted bad runtime experiment, closed autoreview findings. |
| What changed in the checkpoint plan? | Cross-browser parity closed for selected rows; staged/full-DOM and vertical native layout moved to next-owner stopping checkpoints. |

Timeline:
- 2026-06-05T16:21:36.216Z Goal plan created.
- 2026-06-05T16:22:01Z Checkpoint-zero requirements extracted; current backlog points first to cross-browser selection parity, then staged/full-DOM debt.
- 2026-06-05T16:33Z Cross-browser plaintext/richtext selection packet widened and green.
- 2026-06-05T16:55Z Staged/full/cross-editor huge-doc benchmark packet recorded; runtime threshold experiment reverted.
- 2026-06-05T17:11Z Release-discipline inventory, `slate-react` typecheck, and `bun check` green.
- 2026-06-05T17:45Z Autoreview accepted over-broad selection, single-node caret, under-threshold staged wait, metrics-overhead, and mid-node caret findings; all fixed and reproven.
- 2026-06-05T19:34Z Final structured autoreview clean; latest release-discipline, `bun check`, richtext 24-row packet, small staged benchmark, and full cross-editor comparison green.

Open risks:
- Browser-width proof improved but is not a full selection-suite audit.
- Huge-doc vertical native selection still needs an architecture/perf owner;
  local threshold tweaks are proven worse.
- Raw mobile remains unproven without real device artifacts.
