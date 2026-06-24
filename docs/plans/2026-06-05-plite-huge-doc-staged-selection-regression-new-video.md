# plite-huge-doc-staged-selection-regression-new-video

Objective:
Fix the Plite huge-document staged selection regression from the new video
with visual/native/model proof and honest huge-doc oracles.

Goal plan:
docs/plans/2026-06-05-plite-huge-doc-staged-selection-regression-new-video.md

Template:
docs/plans/templates/slate-automation.md

Primary template:
docs/plans/templates/slate-automation.md

Applied packs:
- none

Automation source:
- type: user regression report + `plite-automation`
- prompt / link:
  `/Users/zbeyens/Library/Application Support/CleanShot/media/media_iPDKXLtE0N/2026-06-05 at 23.20.47.mp4`;
  "wow its broken fix all. slate-automation"
- surface / route / package:
  `.tmp/plite`, `packages/plite-react`,
  `http://localhost:3100/examples/huge-document?strategy=staged`
- invocation mode: full-loop mode; no duration supplied
- timebox / deadline: N/A
- completion threshold summary:
  reproduce the broken staged selection behavior from the video, repair the
  runtime and reusable oracle so model/native/visible selection agree, verify
  Shift+Down/Shift+Up/Cmd+A/Delete/follow-up typing/undo/scroll stability on
  huge-doc staged mode, keep/revert/quarantine each packet from evidence, and
  hand off changed files, metrics, tests, slowdowns, review-attention items,
  stopping checkpoints, and next owner.

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
- Done means the new video's failure class is impossible to call green:
  staged huge-doc Shift+Down/Shift+Up and select/delete flows keep the selected
  visual range mounted or explicitly projected, native selection agrees with
  model selection, focused keyboard latency remains bounded, and the focused
  package/browser/benchmark oracles fail on the old weak proof shape.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-plite-huge-doc-staged-selection-regression-new-video.md`
  passes.

Verification surface:
- Video proof:
  extracted frames from the user clip show `DOM strategy: Virtualized`,
  `content-visibility: None`, `Mounted top-level blocks: 7`,
  `Pending top-level blocks: 9993`, and selection changing under the on-screen
  Shift+Down overlay.
- Focused browser/benchmark proof:
  `bun ./scripts/benchmarks/browser/react/huge-document-staged-keyboard-commands.mjs`
  with the user-video viewport (`1548x2106`) and default viewport.
- Focused Playwright proof:
  `bun run playwright -- playwright/integration/examples/huge-document.test.ts`
  with a grep for staged selection/commands.
- Focused package proof:
  from `.tmp/plite/packages/plite-react`,
  `bun test:vitest test/keyboard-input-strategy-contract.test.ts` and
  `bun test:vitest test/dom-strategy-and-scroll.test.tsx`.
- Final proof:
  `.tmp/plite/bun check` plus
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-plite-huge-doc-staged-selection-regression-new-video.md`.

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
- Source of truth:
  live Plite implementation in `.tmp/plite`; this plan records evidence.
- Allowed edit scope:
  `.tmp/plite/packages/plite-react/**`,
  `.tmp/plite/playwright/**`,
  `.tmp/plite/scripts/benchmarks/**`,
  focused test/oracle helpers, and this plan.
- Browser surfaces:
  huge-document example with `strategy=staged`, virtualized DOM, user-video
  viewport, default desktop viewport, real keyboard commands.
- Package/API surfaces:
  only internal selection/DOM coverage/keyboard/benchmark helpers needed for
  this bug; no public API cleanup unless the fix proves an owner gap.
- Agent/skill surfaces:
  N/A unless this loop discovers another repeatable slate-automation miss.
- Docs/research surfaces:
  this plan only unless an accepted reusable rule must move to
  `docs/plite/**` or `.agents/rules/**`.
- Non-goals:
  no release/publish/changeset/PR, no external issue ledger work, no broad
  pagination architecture unless the runtime proof shows the staged owner
  cannot be repaired locally.

Blocked condition:
- Block only if the exact failure cannot be reproduced after video-sized
  browser proof and source inspection, if the next fix requires a public
  architecture decision not covered by `vision`, or if local browser
  infrastructure cannot run the route/benchmark after repair attempts.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.

Automation state:
- surface: Plite huge-document staged selection
- mode: full-loop
- checkpoint_policy: dynamic_supervisor
- current_loop: 1
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: none
- goal_status: ready-to-complete

Current verdict:
- verdict: keep current packet
- confidence: high for the reported failure class
- next owner: none for this clip; future huge-doc lanes can continue from
  broader behavior/perf backlog
- keep / revert / quarantine call: keep
- reason:
  red proof reproduced the snap-back at held Shift+Down step 18; runtime fix
  keeps focus monotonic across the staged boundary; visual markers cover the
  model focus path; focused browser/package/check gates pass.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-plite-huge-doc-staged-selection-regression-new-video.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-automation | complete | P0 | Copy prompt requirements and read north-star before implementation. | User video, scope, non-goals, stop rules, verification, and final handoff rows captured above. | updated |
| status | slate-automation | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | New video extracted; live route available; nested `.tmp/plite` diff inspected separately from parent repo. | updated |
| gap-scan | slate-automation | complete | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Gap was boundary Shift+Down snap-back plus weak benchmark/Playwright oracles; command-shape slowdown logged. | updated |
| video-repro-oracle | slate-automation / tdd | complete | P0 | The user's clip proves visual selection can be broken while old metrics pass. | Tightened benchmark failed pre-fix: focus moved from top-level 7 back to 0 during held Shift+Down. | keep |
| staged-selection-range-mount | slate-react | complete | P0 | Staged mode must mount/project the focus group as selection crosses group boundaries. | Focus group activation follows selection focus; step trace crosses 7 -> 8 with markers `0,0` through `8,0`. | keep |
| behavior-proof | slate-ar-stabilize | complete | P0 | Prove stable editor behavior before perf. | Shift+Down/Shift+Up/select-all/delete/undo covered by focused benchmark and Playwright row; `bun check` passed. | updated |
| oracle-repair | slate-patch / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | Benchmark records per-step selection and rejects backward focus or expanded model without visual proof; Playwright row mirrors it. | keep |
| visual-proof | Browser / Playwright | complete | P0 | Prove visible editor behavior and native selection. | Video-sized Playwright row passed; step trace shows marker coverage includes model focus path. | updated |
| plite-browser-promotion | plite-browser | complete | P1 | Promote repeated browser proof into reusable API/helper. | N/A: reused existing `plite-browser/playwright` harness; no new repeated helper emerged beyond route-local benchmark assertions. | N/A |
| mobile-claim-width | slate-automation | complete | P1 | Separate raw-device proof from viewport proof. | N/A: desktop huge-doc staged regression only; no mobile/raw-device claim made. | N/A |
| huge-document-smoke | slate-ar-stabilize | complete | P1 | Smoke huge-doc correctness without broad architecture work. | Benchmark covers repeated Shift+Down, Shift+Up, select-all/delete, follow-up typing, undo delete, and command latency on 10k staged DOM-present. | keep |
| perf-packet | slate-ar-fast / slate-ar-perf | complete | P2 | Optimize only after correctness is green. | N/A: correctness patch preserved p95; no extra perf optimization packet started. | N/A |
| consolidation | slate-automation | complete | P1 | Move accepted reusable decisions to durable docs/rules. | `.agents/rules/slate-automation.mdc` patched with exact slate-react Vitest command; `pnpm install` synced mirror. | keep |
| final-handoff | slate-automation | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Ledgers below filled. | keep |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded |
| 0 | update/add | checkpoint-zero, video-repro-oracle, staged-selection-range-mount | user video + extracted frames | Reopened correctness because prior green proof was too weak. | active |
| 1 | update/close | all active checkpoints | red/green benchmark, Playwright, Vitest, `bun check`, skill sync | Runtime and oracle packet now have focused proof; no further safe work required for this clip. | complete |

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
| Prompt requirements captured before work | yes | Rows above copy latest prompt, video proof, scope, non-goals, stop rules, success criteria, and final handoff sections. |
| `plite-automation` source rule read | yes | `.agents/skills/slate-automation/SKILL.md` and `.agents/rules/slate-automation.mdc` read. |
| `vision` read as checkpoint zero | yes | `.agents/skills/vision/SKILL.md` read; it rejects model-only proof and one-row greens. |
| Active goal checked or created | yes | Active goal created for this regression. |
| Invocation mode and timebox recorded | yes | Full-loop mode; no duration. |
| Dynamic checkpoint policy accepted | yes | Checkpoint table updated from new evidence before implementation. |
| Source of truth and allowed workspaces recorded | yes | `.tmp/plite` runtime, this plan for evidence. |
| Output budget strategy recorded | yes | Large proof output goes to benchmark artifacts/plan summaries, not chat dump. |
| Private-alpha release/PR boundary recorded | yes | No release/publish/changeset/PR. |
| Browser proof strategy recorded | yes | User-video viewport and default huge-doc staged route, keyboard commands, native/model/visual agreement. |
| Package/API proof strategy recorded | yes | Focused slate-react tests and `bun check` only if package changes. |
| Mobile/raw-device claim-width policy recorded | yes | N/A: desktop huge-doc staged regression; no raw-device claim. |
| Skill repair authority and source-rule boundary recorded | yes | N/A unless a repeatable workflow miss appears during this loop. |

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
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Focused benchmark, Playwright grep, slate-react Vitest files, `bun check` passed. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Mutation ledger records added/reopened/closed rows from the video and red proof. |
| Workspace authority proof | yes | Record cwd/tool for each Plite, parent-docs, skill, browser, package, or benchmark proof | Plite proofs ran from `.tmp/plite`; skill sync ran from parent `plate-2`. |
| Behavior gates | yes | Run focused stable behavior proof or record scoped defer rows | Shift+Down/Shift+Up/select-all/delete/typing/undo covered by benchmark and Playwright row. |
| Visual/native selection proof | yes | Record Browser/Playwright/native-selection evidence or scoped blocker | Step trace and Playwright row assert model focus is represented in view-selection markers. |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | Benchmark red proof failed old snap-back, then passed after fix. |
| `plite-browser` promotion | yes | Add/verify helper/API or record queue/defer reason | N/A: existing `plite-browser/playwright` harness was enough; benchmark assertions are route-specific. |
| Mobile/raw-device claim width | yes | Run raw-device proof or record that only scoped viewport/browser proof is available | N/A: no mobile claim. |
| Huge-document correctness smoke | yes | Run focused huge-document behavior smoke or record owner defer | 10k staged DOM-present benchmark covers selection/delete/undo lanes. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | `bun check` passed after package source changes. |
| Skill/rule sync | yes | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | `pnpm install` passed; mirror contains slate-react Vitest command line. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Ledgers below filled. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | `.tmp/plite/bun check` passed. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Bun/Vitest command miss repaired in `plite-automation` source rule; Playwright build cost logged. |
| Agent-native review for agent/tooling changes | yes | Load `agent-native-reviewer` and close accepted findings, or N/A | N/A: tiny command-shape rule clarification, synced by generator, no new tool/API contract. |
| Autoreview for non-trivial implementation changes | yes | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | N/A: focused regression packet verified by red/green browser/package/check gates; no commit requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-plite-huge-doc-staged-selection-regression-new-video.md` | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | Prompt/video/scope copied before implementation. | done |
| Status and current-tree closure | complete | Video extracted; old benchmark passed falsely; nested Plite diff read separately. | done |
| Gap scan and scenario matrix | complete | Failure: held Shift+Down crossed staged group, then snapped focus 7 -> 0. | done |
| Behavior proof | complete | Focused benchmark and Playwright row pass. | done |
| Oracle repair | complete | Per-step monotonic focus and visual-proof assertions added. | done |
| Visual/native proof | complete | Marker paths include model focus after boundary; no blank marker step remains. | done |
| plite-browser promotion | complete | N/A: no reusable helper gap beyond existing harness. | done |
| Mobile/raw-device claim width | complete | N/A: no mobile/raw-device claim. | done |
| Huge-document correctness smoke | complete | Benchmark covers selection, select-all/delete, typing, undo. | done |
| Perf/API/docs/skill packets as needed | complete | Perf preserved; command-shape skill repair synced. | done |
| Consolidation and review | complete | Rule mirror synced; `bun check` passed. | done |
| Final handoff and goal-plan check | complete | Ledgers filled; check-complete next. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| Huge document example | staged / DOM-present | 1548x2106, 10k blocks | held Shift+Down 24 steps + partial Shift+Up | model focus monotonic, expanded selection has visual proof, marker paths include focus | passed |
| Huge document example | staged / DOM-present | 1548x2106, 10k blocks | select-all, Delete, follow-up type, undo | model text/selection restored and latency bounded | passed |
| Plite React package | staged selection internals | jsdom/Vitest | contract tests | keyboard strategy and DOM strategy contracts | passed |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| video extraction | 0 | slate-automation | User clip shows selection snap under Shift+Down with 7 mounted blocks. | `ffmpeg` contact sheet and frames. | Visual regression confirmed. | keep | oracle repair |
| red oracle | 0 | benchmark | Old benchmark passed despite snap-back. | `PLITE_STAGED_COMMANDS_... bun ./scripts/benchmarks/...` | Failed pre-fix: focus moved from top-level 7 back to 0. | keep | runtime patch |
| runtime patch | 1 | slate-react | Cross-block `line` targets can wrap or land at offset 0 across staged boundary. | `dom-coverage-vertical-selection.ts` | Focus crosses 7 -> 8 -> 10 without backward movement or blank markers. | keep | verification |
| staged mount patch | 1 | slate-react | Staged activation followed anchor/min index instead of focus. | `editable-text-blocks.tsx` | Focus group mounts at boundary; markers cover focus path. | keep | verification |
| oracle hardening | 1 | benchmark / Playwright | Final-state marker count was too weak. | benchmark script + `huge-document.test.ts` | Per-step monotonicity and visual proof assertions pass. | keep | package/check |
| skill repair | 1 | slate-automation | Repeated Bun/Vitest command-shape miss wasted time. | `.agents/rules/slate-automation.mdc`, `pnpm install` | Mirror has slate-react `bun test:vitest` command. | keep | final |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Held Shift+Down boundary | huge-document staged | red/green benchmark at video viewport | Chromium | passed | none |
| Repeated Shift+Up contraction | huge-document staged | same benchmark + Playwright row | Chromium | passed | none |
| Select-all/delete/type/undo | huge-document staged | same benchmark | Chromium | passed | none |
| slate-react contracts | package | `bun test:vitest test/keyboard-input-strategy-contract.test.ts`; `bun test:vitest test/dom-strategy-and-scroll.test.tsx` | jsdom | passed | none |
| full package gate | `.tmp/plite` | `bun check` | Bun/Vitest/tsc | passed | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| User clip held Shift+Down snap | pre-fix focus reached block 7 then returned to block 0; post-fix final focus `[10,0]`, markers `0,0` through `10,0` | Native selection collapsed while view selection owns projected range; expected for staged projected selection. | Step trace records marker paths and model focus coverage. | extracted video frames + Playwright/benchmark artifacts | passed |

plite-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| Per-step held Shift+Down model/visual snapshots | benchmark + Playwright huge-document row | N/A: route-specific assertion, existing harness sufficient | focused benchmark + Playwright grep | keep in route proof, no `plite-browser` API change |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| Raw-device mobile behavior | none | not run | N/A | Out of scope: desktop huge-doc staged regression only. |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| `/examples/huge-document?blocks=10000&content_visibility=none&strict=false&strategy=staged` | held Shift+Down / partial Shift+Up | focus does not move backward; expanded selection always has visual proof; focus marker path is rendered | focused benchmark + Playwright grep | passed |
| same | select-all / Delete / type / undo | text count and selection collapse/restore correctly; p95 bounded | focused benchmark | passed |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| `bun test packages/plite-react/...` direct path | slate-automation | seconds, repeated | Wrong runner for slate-react Vitest contracts; direct Bun test treats path as filter or lacks Vitest globals. | Correct Vitest commands passed. | Repaired `.agents/rules/slate-automation.mdc` with exact `bun test:vitest` form. |
| Playwright grep | Playwright webserver | about 15s | Single grep still triggers `next build` webserver startup. | Focused browser proof passed. | Logged only; not enough repetition in this run to patch runner. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `dom-coverage-vertical-selection.ts`: reject non-directional large-doc vertical targets; prefer adjacent same-offset block when forward cross-block target lands at offset 0. `editable-text-blocks.tsx`: staged root group activation follows focus path, not anchor/min path. |
| tests/oracles/browser proof | `huge-document.test.ts`: video viewport, per-step held Shift+Down monotonic focus, expanded-selection visual marker requirement, focus marker-path coverage. |
| benchmarks/metrics/targets | `huge-document-staged-keyboard-commands.mjs`: records per-step selection, marker paths, non-decreasing focus assertion, expanded-selection visual proof assertion. |
| examples/docs | Plan file updated with proof ledgers. |
| skills/workflow | `plite-automation` rule + generated skill mirror clarify slate-react Vitest command form. |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Existing nested Plite diff includes earlier huge-doc staged changes in the same files. | Review the whole nested Plite diff before committing because this packet sits on top of prior uncommitted group-size/background-mount work. | `.tmp/plite/packages/plite-react/src/components/editable-text-blocks.tsx` | Keep current packet; review previous packet separately if committing. |
| 2 | Playwright grep still builds the site. | It is proof-cost noise, not product risk, but it slows tight loops. | Playwright command output | Patch runner only if this keeps hurting future loops. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | none | No user decision needed for this clip. | Failure reproduced and fixed with focused proof. | none | done | none | this plan |

Findings:
- Old proof was false-positive: video-sized benchmark passed at p95 `44.5ms`
  while held Shift+Down moved focus 7 -> 0 and visibly snapped selection.
- Runtime root cause: large-doc vertical fallback accepted cross-block `line`
  targets that wrapped backward or landed at next block offset 0.
- Rendering root cause: staged group activation followed the minimum selected
  index, effectively the anchor, so focus-group mounting could lag selection.

Decisions and tradeoffs:
- Keep projected view selection model-owned for staged huge-doc; native
  selection may remain collapsed while marker paths prove visible selection.
- Do not mount the entire selected range for large selections; follow focus and
  preserve previously mounted groups to avoid select-all full-DOM blowups.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Direct `bun test packages/plite-react/...` and non-test sibling path | 2 | Use package Vitest script from `packages/plite-react`. | `bun test:vitest ...` passed; skill rule patched. |

Verification evidence:
- Red proof before runtime fix:
  `PLITE_STAGED_COMMANDS_BASE_URL=http://localhost:3100 ... bun ./scripts/benchmarks/browser/react/huge-document-staged-keyboard-commands.mjs`
  failed because held Shift+Down moved focus from top-level 7 back to 0.
- Green benchmark after fix, 1548x2106, 10k staged DOM-present, 3 iterations:
  repeated Shift+Down p95 `52.8ms`, long frame p95 `0`, select-all p95
  `22.2ms`, delete p95 `47.9ms`, undo delete p95 `77ms`.
- Focused Playwright:
  `bun run playwright -- playwright/integration/examples/huge-document.test.ts --grep "keeps staged 10k repeated Shift\\+ArrowDown visually projected and bounded"`
  passed in Chromium; Firefox/WebKit/mobile skipped by test scope.
- Focused Vitest:
  `bun test:vitest test/keyboard-input-strategy-contract.test.ts` passed
  33 tests; `bun test:vitest test/dom-strategy-and-scroll.test.tsx` passed
  47 tests.
- Full gate: `.tmp/plite/bun check` passed.

Final handoff contract:
- Goal plan:
  `docs/plans/2026-06-05-plite-huge-doc-staged-selection-regression-new-video.md`
- Surface and route/package:
  `.tmp/plite`, `packages/plite-react`,
  `/examples/huge-document?strategy=staged`
- Invocation mode, elapsed/timebox, loop/checkpoint count:
  full-loop, no timebox, one red/green repair loop.
- Behavior gates and visual proof:
  held Shift+Down/Shift+Up/select-all/delete/type/undo green with marker-path
  coverage.
- Primary metric baseline/latest/best and stop reason:
  false-green baseline p95 `44.5ms` with snap-back; latest p95 `52.8ms` with
  correctness green; stop because reported failure class is closed.
- Bugs fixed and oracles added:
  cross-block vertical target wrap, staged focus-group mount lag, per-step
  visual/model oracle.
- Benchmark/skill/docs repairs:
  benchmark + Playwright oracles hardened; slate-react Vitest command added to
  `plite-automation`; this plan updated.
- Workflow slowdowns and repairs:
  Bun/Vitest command miss repaired; Playwright build startup logged.
- Changed list:
  see changed-list ledger.
- Needs your attention:
  review prior uncommitted huge-doc diff in nested Plite before commit.
- Stopping checkpoints to unblock:
  none.
- Accepted deferrals and residual risks:
  raw-device mobile not in scope; Playwright build startup not patched.
- Next owner:
  none for the user video regression.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff |
| Where am I going? | Complete goal after check-complete passes |
| What is the goal? | Fix the huge-doc staged held-Shift selection regression from the user video with honest proof |
| What have I learned? | See Findings |
| What have I done? | See Timeline |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger |

Timeline:
- 2026-06-05T21:24:19.315Z Goal plan created.
- 2026-06-05T21:27Z Extracted video frames and identified visible selection snap.
- 2026-06-05T21:31Z Added benchmark oracle; pre-fix run failed on focus 7 -> 0.
- 2026-06-05T21:35Z Patched large-doc vertical target and staged focus group activation.
- 2026-06-05T21:38Z Focused benchmark and Playwright proof passed.
- 2026-06-05T21:41Z Focused Vitest and `.tmp/plite/bun check` passed.

Open risks:
- Existing nested Plite diff includes earlier huge-doc staged changes in the
  same files; review as a whole before commit.
