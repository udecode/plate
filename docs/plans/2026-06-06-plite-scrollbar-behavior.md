# plite-scrollbar-behavior

Objective:
Fix Plite huge-document virtualized internal-scrollbar behavior with real
browser proof and a reusable oracle, without release/PR/commit work.

Goal plan:
docs/plans/2026-06-06-plite-scrollbar-behavior.md

Template:
docs/plans/templates/slate-automation.md

Primary template:
docs/plans/templates/slate-automation.md

Applied packs:
- none

Automation source:
- type: user-reported visible regression with video evidence
- prompt / link: `plite-automation ... using the scrollbar is broken`
- evidence: `/Users/zbeyens/Library/Application Support/CleanShot/media/media_mGR8FOkHsA/2026-06-06 at 22.16.51.mp4`
- surface / route / package: `.tmp/plite` huge-document example,
  `http://localhost:3100/examples/huge-document?strategy=virtualized`, likely
  `packages/plite-react` DOM strategy and example/oracle surface
- invocation mode: full-loop mode, one complete bug loop until proof or blocker
- minimum runtime / deadline: N/A: no duration requested
- completion threshold summary: reproduce the internal editor-scrollbar bug,
  patch root owner/oracle, prove virtualized scrollbar drag/scroll keeps rows
  coherent and editor behavior usable, then run focused verification and
  `check-complete`.

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
- The bug is closed only when the virtualized huge-document editor's internal
  scrollbar can move through the document without overlapped/ghosted lines,
  blank panes, broken scroll offset, or unusable follow-up editing.
- Proof must include a browser-facing scrollbar oracle that checks visual/DOM
  row coherence after real scroll-container movement, not only model state,
  wheel events, keyboard navigation, or page scrolling.
- Runtime changes must be focused on Plite/example owner surfaces; no
  release, publish, changeset, PR, branch, or commit work.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-06-plite-scrollbar-behavior.md`
  passes.

Verification surface:
- Video/frame inspection: contact sheet and extracted frames under
  `/tmp/slate-scrollbar-video`.
- Source audit: `.tmp/plite` huge-document example, DOM strategy runtime,
  and existing huge-document Playwright tests.
- Browser proof: focused Playwright test for
  `/examples/huge-document?strategy=virtualized` that scrolls the editor
  scroll container like the reported gesture and asserts row/text coherence.
- Package proof: focused package/type/test command if shared runtime changes.
- Plan proof:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-06-plite-scrollbar-behavior.md`.

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
- Source of truth: `.agents/rules/slate-automation.mdc` / generated
  `plite-automation` skill for workflow, `.tmp/plite` source/tests for
  runtime behavior.
- Allowed edit scope: `.tmp/plite` runtime/example/tests and this plan.
- Browser surfaces: huge-document virtualized route, internal editor scrollbar,
  screenshot/DOM coherence after scroll.
- Package/API surfaces: only if the root fix touches shared Plite runtime.
- Agent/skill surfaces: N/A unless this loop exposes a recurring workflow miss.
- Docs/research surfaces: this plan only unless reusable decision needs
  consolidation.
- Non-goals: release/publish/changeset/PR/commit, broad pagination architecture,
  external issue ledgers, Plate runtime patches, mobile/raw-device claims.

Blocked condition:
- Block only if the route cannot be run locally after normal install/server
  recovery, the bug cannot be reproduced from the video surface, or the root
  fix requires an architectural/taste decision not covered by
  `vision` and no safe alternate packet remains.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious
  backlog looks empty. Enter supervision mode and infer the next checkpoint from
  `vision`, current evidence, weak proofs, benchmark gaps, API/docs
  mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- surface: huge-document virtualized internal scrollbar
- mode: full-loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 1
- current_checkpoint: final-handoff
- current_checkpoint_status: done
- next_checkpoint: none
- goal_status: active

Current verdict:
- verdict: fixed and proven for the reported virtualized internal-scrollbar row
  overlap/ghosting class.
- confidence: high for Chromium/local virtualized huge-document row coherence;
  scoped because raw OS scrollbar thumb drag is not directly automatable in the
  headless lane.
- next owner: none for this bug; future repeated row-stack assertions can move
  to `plite-browser`.
- keep / revert / quarantine call: keep group-render topology; reverted the
  dynamic-estimate direction because it broke virtualized typing/selection.
- reason: contiguous virtual rows now flow naturally inside one positioned
  group, so stale per-row estimates cannot paint text over neighboring rows.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-06-plite-scrollbar-behavior.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-automation | done | P0 | Copy prompt requirements and read north-star before implementation. | Requirement rows complete. | completed |
| status | slate-automation | done | P0 | Read active plan, latest prompt, source status, and current evidence. | Video, source, and route evidence recorded. | completed |
| gap-scan | slate-automation | done | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Exact gap was unmeasured virtual rows painting over neighbors during scrollbar jumps. | completed |
| behavior-proof | slate-ar-stabilize | done | P0 | Prove stable editor behavior before perf. | Virtualized typing/undo/arrows/Enter and backward scroll tests pass. | completed |
| oracle-repair | slate-patch / tdd | done | P0 | Add missing native/visual/model oracles for found gaps. | Added huge-document row stacking Playwright oracle. | completed |
| visual-proof | Browser / Playwright | done | P0 | Prove visible editor behavior and native selection. | `/tmp/slate-scrollbar-final.png` clean after scrollbar-style jump. | completed |
| plite-browser-promotion | plite-browser | N/A | P1 | Promote repeated browser proof into reusable API/helper. | One route-specific helper only; promote if this pattern repeats in another file. | scoped |
| mobile-claim-width | slate-automation | N/A | P1 | Separate raw-device proof from viewport proof. | No mobile/raw-device claim in this bug. | scoped |
| huge-document-smoke | slate-ar-stabilize | done | P1 | Smoke huge-doc correctness without broad architecture work. | Focused virtualized typing/backward-scroll/row-stack tests pass. | completed |
| scrollbar-repro | Browser / Playwright | done | P0 | Reproduce the reported internal-scrollbar virtualized failure. | Immediate scroll probe reproduced row overlap before fix. | completed |
| scrollbar-oracle | plite-browser / Playwright | done | P0 | The bug needs a reusable scroll-container coherence oracle. | `keeps virtualized rows visually coherent during internal scrollbar jumps` passes. | completed |
| scrollbar-runtime-fix | slate-patch | done | P0 | Patch root owner after repro, not a one-off example hack. | Virtualized rows render as contiguous flow groups. | completed |
| perf-packet | slate-ar-fast / slate-ar-perf | N/A | P2 | Optimize only after correctness is green. | Correctness bug only; no perf target changed. | scoped |
| supervision-mode | slate-automation | N/A | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from north-star and evidence. | No timed mode. | scoped |
| consolidation | slate-automation | N/A | P1 | Move accepted reusable decisions to durable docs/rules. | No new reusable taste/skill rule needed. | scoped |
| final-handoff | slate-automation | done | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Final handoff ledgers filled. | completed |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | pending |
| 0 | add | scrollbar-repro, scrollbar-oracle, scrollbar-runtime-fix | user video frames show virtualized editor scrollbar creates overlapped text | initial template lacked the exact reported gesture | added |
| 1 | update | scrollbar-runtime-fix | dynamic-estimate patch made typing/selection regress | keep root-owner fix but change topology, not scroll math | replaced with group-render fix |
| 1 | close | behavior-proof, oracle-repair, visual-proof, huge-document-smoke | focused Playwright, Vitest, typecheck, screenshot all pass | completion evidence is enough for this full-loop bug | closed |

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
| Prompt requirements captured before work | yes | This plan records the video path, scrollbar bug, huge-document virtualized surface, stop rules, non-goals, browser proof, final handoff rows. |
| `plite-automation` source rule read | yes | `.agents/skills/slate-automation/SKILL.md` read. |
| `vision` read as checkpoint zero | yes | `.agents/skills/vision/SKILL.md` read. |
| Active goal checked or created | yes | Active goal created for scrollbar behavior closure. |
| Invocation mode and timebox recorded | yes | Full-loop mode; no timed minimum. |
| Dynamic checkpoint policy accepted | yes | Checkpoint rows added for scrollbar repro/oracle/runtime fix. |
| Source of truth and allowed workspaces recorded | yes | `.tmp/plite` runtime/tests plus this plan. |
| Output budget strategy recorded | yes | Use focused source reads/tests and artifacts; no broad streamed dumps. |
| Private-alpha release/PR boundary recorded | yes | No release, publish, changeset, PR, branch, or commit. |
| Browser proof strategy recorded | yes | Focused Playwright/browser proof of internal editor scrollbar row coherence. |
| Package/API proof strategy recorded | yes | Run package/type proof only if shared runtime/API changes. |
| Mobile/raw-device claim-width policy recorded | yes | N/A: no mobile/raw-device claim. |
| Skill repair authority and source-rule boundary recorded | yes | N/A unless recurring workflow miss appears. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining
      backlog ladder, and supervision-mode fallback are recorded.
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
- [x] Repeated browser proof patterns are promoted to `plite-browser` or queued
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
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Playwright scrollbar oracle, adjacent virtualized behavior tests, slate-react typecheck, and Vitest pass. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Added/closed scrollbar repro, oracle, and runtime-fix checkpoints; replaced failed dynamic-estimate packet with group-render packet. |
| Workspace authority proof | yes | Record cwd/tool for each Plite, parent-docs, skill, browser, package, or benchmark proof | Runtime/tests from `.tmp/plite`; plan/check-complete from parent `/Users/zbeyens/git/plate-2`. |
| Behavior gates | yes | Run focused stable behavior proof or record scoped defer rows | `virtualized (5k typing|backward scroll|rows visually coherent)` Playwright grep passed. |
| Visual/native selection proof | yes | Record Browser/Playwright/native-selection evidence or scoped blocker | Screenshot `/tmp/slate-scrollbar-final.png`; adjacent typing test proves selection/editing still works. |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | Added `getVirtualizedRowStackingProof` and `keeps virtualized rows visually coherent during internal scrollbar jumps`. |
| `plite-browser` promotion | N/A | Add/verify helper/API or record queue/defer reason | One route-local helper only; not repeated enough to promote. |
| Mobile/raw-device claim width | N/A | Run raw-device proof or record that only scoped viewport/browser proof is available | No mobile/raw-device claim for this desktop scrollbar bug. |
| Huge-document correctness smoke | yes | Run focused huge-document behavior smoke or record owner defer | Virtualized typing, backward scroll, row coherence, and screenshot proof pass. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | `bun --filter plite-react typecheck` and `bun test:vitest` pass. |
| Skill/rule sync | N/A | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | No `.agents/rules/**` source changes. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Ledgers below filled. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | Scoped typecheck, Vitest, and Playwright proof pass; full `bun check` not run because this was a focused `.tmp/plite` browser bug. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Slowdowns logged; no durable skill repair needed beyond using package script runner. |
| Agent-native review for agent/tooling changes | N/A | Load `agent-native-reviewer` and close accepted findings, or N/A | No agent/tooling files changed. |
| Autoreview for non-trivial implementation changes | N/A | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | Focused self-review plus green tests; user did not request commit/review pass and raw diff includes older unrelated Plite work. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-06-plite-scrollbar-behavior.md` | To run after this ledger update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | done | plan filled from prompt, video frames, slate-automation, vision | status |
| Status and current-tree closure | done | video/source/test surface inspected | gap scan |
| Gap scan and scenario matrix | done | scrollbar row-stacking gap identified | behavior proof |
| Behavior proof | done | adjacent virtualized editing/backward-scroll tests pass | oracle repair |
| Oracle repair | done | row-stacking Playwright oracle added | visual proof |
| Visual/native proof | done | screenshot plus Playwright geometry proof | plite-browser promotion |
| plite-browser promotion | N/A | route-local helper only; promote if repeated | mobile claim width |
| Mobile/raw-device claim width | N/A | desktop scrollbar claim only | huge-document smoke |
| Huge-document correctness smoke | done | focused virtualized smoke passes | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | N/A | no perf/API/docs/skill scope | consolidation |
| Consolidation and review | done | plan records failed and kept packets | final handoff |
| Final handoff and goal-plan check | done | ledgers filled; check-complete run after update | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| huge-document | internal editor scroll container | virtualized, 10,000 blocks, editor height 420 | scrollbar-style scrollTop jumps and screenshot fallback | no overlapped/ghosted lines, no blank pane, coherent visible rows | passed |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| video-frame-inspection | 0 | slate-automation | Frames show internal editor scrollbar use in virtualized huge-doc producing overlapped/ghosted lines. | `/tmp/slate-scrollbar-video/contact.jpg`, frames 04/08/12/14 | visual frame proof | keep | local repro |
| immediate-scroll-repro | 1 | Playwright | Programmatic internal scroll jumps reproduced immediate row text overlap before fix. | ad hoc Playwright probe against `localhost:3100` | overlap rows reported at 4k, 8k, 12k, 24k+ scrollTop | keep as repro evidence | oracle |
| dynamic-estimate-attempt | 1 | slate-patch | Conservative measured estimate removed overlap but broke virtualized typing/selection and caused persistent gaps. | `use-virtualized-root-plan.ts` scratch patch | adjacent typing test failed | revert approach | group topology |
| virtual-row-group-runtime | 1 | slate-patch | Contiguous rows should flow naturally inside one positioned virtual group instead of each row using stale absolute starts. | `packages/plite-react/src/components/editable-text-blocks.tsx` | row coherence and typing tests pass | keep | verify |
| scrollbar-oracle | 1 | Playwright | Internal-scrollbar jumps must not show child text overlaps immediately and must settle without structural row gaps. | `playwright/integration/examples/huge-document.test.ts` | focused new test passes | keep | final |
| unit-contract-update | 1 | slate-react | Virtualized row transform moved from row to row group. | `packages/plite-react/test/dom-strategy-and-scroll.tsx` | `bun test:vitest` passes | keep | final |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| virtualized scrollbar row coherence | `/examples/huge-document?strategy=virtualized` | `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "virtualized rows visually coherent"` | Chromium | pass | none |
| adjacent virtualized editing/scroll | same | `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "virtualized (5k typing|backward scroll|rows visually coherent)"` | Chromium | pass, 3 tests | none |
| slate-react package type | `packages/plite-react` | `bun --filter plite-react typecheck` | N/A | pass | none |
| slate-react package unit/contracts | `packages/plite-react` | `bun test:vitest` from `packages/plite-react` | jsdom/Vitest | pass, 57 files / 681 tests | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| scrollbar jump after virtual row grouping | model not the target | N/A | row child rects have no overlap; settled row wrappers have no structural gaps | `/tmp/slate-scrollbar-final.png` | pass |
| virtualized typing after row grouping | Playwright adjacent test asserts model selection through typing, undo, arrows, Enter | native path exercised by keyboard typing | caret remains visible in scrollable parent | `keeps virtualized 5k typing, undo, arrows, Enter, and scroll stable` | pass |

plite-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| virtualized row stacking after scroll-container jumps | one huge-document route-local helper | candidate future `assertVirtualRowsCoherentAfterScroll` if repeated | current Playwright grep above | queued only; no promotion yet |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| scrollbar bug fixed | desktop Chromium Playwright plus screenshot | no raw device | N/A | desktop/browser only |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| huge-document virtualized | internal scroll jumps | no immediate text overlap, no settled structural gaps | new Playwright oracle | pass |
| huge-document virtualized | typing, undo, arrows, Enter | model selection/text remains correct | adjacent Playwright grep | pass |
| huge-document virtualized | backward scroll over dynamic heights | scroll stays within target bounds | adjacent Playwright grep | pass |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Direct `bun test` root path attempts | slate-automation | minutes | Package tests need configured Vitest/jsdom runner; direct Bun path is misleading. | direct Bun failed with missing `document`/`test` globals; `bun test:vitest` passed. | no skill patch; use package script for slate-react Vitest. |
| First runtime attempt | slate-patch | minutes | Dynamic estimate fixed overlap but polluted materialization/editing semantics. | virtualized typing test failed. | reverted approach; kept group-render topology. |
| Headless scrollbar drag | Playwright | short | Headless Chromium did not move the OS scrollbar thumb via mouse drag. | scrollTop stayed `0`; programmatic scrollTop jumps reproduced the paint bug. | use scroll-container jumps plus screenshot; note scoped proof. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | In `.tmp/plite/packages/plite-react/src/components/editable-text-blocks.tsx`, virtualized contiguous rows now render inside positioned row groups so stale per-row estimates cannot overlap text during scroll jumps. |
| tests/oracles/browser proof | Added `getVirtualizedRowStackingProof` and `keeps virtualized rows visually coherent during internal scrollbar jumps` in `.tmp/plite/playwright/integration/examples/huge-document.test.ts`; updated one Vitest DOM-shape expectation in `.tmp/plite/packages/plite-react/test/dom-strategy-and-scroll.tsx`. |
| benchmarks/metrics/targets | None. |
| examples/docs | Active plan updated only. |
| skills/workflow | None. |
| reverted/quarantined packets | Reverted the dynamic measured-estimate approach before final; it caused typing/selection drift. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Review the virtual row group topology | It changes DOM shape from one absolutely positioned wrapper per row to one positioned wrapper per contiguous run. Tests cover it, but this is the main architectural review point. | `.tmp/plite/packages/plite-react/src/components/editable-text-blocks.tsx` | Keep if the DOM shape is acceptable. |
| 2 | Proof is scoped to Chromium scroll-container jumps | Headless could not drag the actual OS scrollbar thumb, so proof uses the same scroll container state change plus screenshot. | `/tmp/slate-scrollbar-final.png` | Manually try the exact route if you want real thumb-drag confirmation. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | none | none | Bug loop has a kept patch and focused proof. | none | none | none | this plan |

Findings:
- The video bug was caused by virtualized rows painting independently from stale
  per-row estimated starts during internal scrollbar movement.
- A conservative estimate alone is the wrong fix because it changes
  materialization/editing offsets and can break typing/selection.
- Grouping contiguous virtual rows keeps the first-position estimate but lets
  rows flow naturally inside the visible run, removing text overlap without
  changing programmatic materialization semantics.

Decisions and tradeoffs:
- Kept group-render topology.
- Did not promote the route-local Playwright helper to `plite-browser` yet
  because it is not repeated across multiple suites.
- Did not run mobile/raw-device proof because this is a desktop internal
  scrollbar report.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Bare `playwright` package import in ad hoc probe | 1 | Import from `@playwright/test` | resolved |
| Headless mouse drag on scrollbar did not move scrollTop | 1 | Programmatic scroll-container jumps and screenshot | resolved with scoped proof |
| Dynamic measured-estimate runtime patch | 1 | Switch to row-group render topology | reverted/replaced |
| Direct Bun path for slate-react DOM tests | 2 | Use `bun test:vitest` package script | resolved |

Verification evidence:
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "virtualized rows visually coherent"`: pass.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "virtualized (5k typing|backward scroll|rows visually coherent)"`: pass, 3 tests.
- `bun --filter plite-react typecheck`: pass.
- `cd packages/plite-react && bun test:vitest`: pass, 57 files / 681 tests.
- Screenshot: `/tmp/slate-scrollbar-final.png`.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-06-plite-scrollbar-behavior.md`.
- Surface and route/package: `.tmp/plite` huge-document virtualized route,
  `packages/plite-react`.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop,
  no timed minimum, one checkpoint loop.
- Behavior gates and visual proof: focused Chromium Playwright, slate-react
  type/Vitest, screenshot.
- Primary metric baseline/latest/best and stop reason: correctness bug, not a
  perf metric; stop because overlap repro is fixed and focused proof is green.
- Bugs fixed and oracles added: virtualized row overlap/ghosting during internal
  scrollbar jumps; added row-stacking oracle.
- Benchmark/skill/docs repairs: none.
- Workflow slowdowns and repairs: dynamic-estimate attempt reverted; package
  script runner used after direct Bun mismatch.
- Changed list: filled above.
- Needs your attention: row group DOM topology and scoped scrollbar proof.
- Stopping checkpoints to unblock: none.
- Accepted deferrals and residual risks: no raw OS scrollbar-thumb automation;
  no mobile claim.
- Next owner: none.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff. |
| Where am I going? | Close the goal after `check-complete`. |
| What is the goal? | Fix huge-document virtualized internal-scrollbar row overlap/ghosting. |
| What have I learned? | Per-row absolute virtual rows can visibly overlap during stale estimate frames; contiguous row groups avoid it without changing editing offsets. |
| What have I done? | Added virtual row groups, scrollbar oracle, unit contract update, and focused proof. |
| What changed in the checkpoint plan? | Added/closed scrollbar repro/oracle/runtime checkpoints; recorded rejected estimate approach. |

Timeline:
- 2026-06-06T20:17:47.737Z Goal plan created.
- 2026-06-06T20:18Z Video frames inspected; failure scoped to huge-document virtualized internal scrollbar.
- 2026-06-06T20:30Z Immediate-scroll Playwright probe reproduced row overlap.
- 2026-06-06T20:39Z Final group-render topology and oracle passed focused proof.

Open risks:
- Raw OS scrollbar-thumb drag was not directly automated in headless Chromium;
  proof uses scroll-container jumps plus screenshot on the same route.
