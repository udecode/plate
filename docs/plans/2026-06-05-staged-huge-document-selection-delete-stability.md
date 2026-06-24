# Staged huge-document selection/delete stability

Objective:
Make the exact staged huge-document route stable for the user-reported slow
lanes: `Shift+Down`, `Shift+Up`, `Cmd+A`, `Delete`, and `Cmd+A+Delete`, then
prove surrounding editor behavior stays correct.

Goal plan:
docs/plans/2026-06-05-staged-huge-document-selection-delete-stability.md

Template:
docs/plans/templates/slate-automation.md

Automation source:
- type: user-invoked `plite-automation`
- route: `http://localhost:3100/examples/huge-document?strategy=staged`
- workspace: `/Users/zbeyens/git/plate-2/.tmp/plite`
- invocation mode: batch/full-loop, no timebox, do not rush
- stop rule: keep looping while a safe behavior, oracle, or perf owner remains;
  queue soft taste questions for handoff instead of stopping early

Completion threshold:
Done means the named staged route has replayable browser proof for
`Shift+Down`, `Shift+Up`, `Cmd+A`, `Delete`, `Cmd+A+Delete`, selection
expansion/collapse, typing after selection, Enter, paste, undo/redo,
navigation, and scroll stability. Proof must include real keyboard operations,
Plite model state, native `window.getSelection()` state where relevant, DOM
state, and before/after latency for the reported slow lanes. Runtime changes
must have focused unit/package proof plus focused Playwright proof. The active
goal may close only after this plan is updated and
`node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-staged-huge-document-selection-delete-stability.md`
passes.

Verification surface:
- Exact browser route: `http://localhost:3100/examples/huge-document?strategy=staged`.
- Focused Playwright tests in `.tmp/plite/playwright/integration/examples/huge-document.test.ts`.
- Focused package tests in `.tmp/plite/packages/plite-react/test`.
- Package typecheck through `bun --filter plite-react typecheck`.
- Final Plite gate through `bun check` when not blocked by unrelated state.

Constraints:
- Plite private alpha only: no release, publish, changeset, PR, or branch
  readiness language.
- Behavior proof beats perf proof; native/visual proof beats model-only proof.
- No hidden debounce, delayed cleanup, or fake fixture win.
- No broad pagination/virtualization architecture unless the measured owner is
  exhausted and `plite-plan` takes the decision.
- Do not patch Plate. Parent repo edits are limited to this goal plan.

Boundaries:
- Runtime and tests live under `.tmp/plite`.
- Parent repo owns only `docs/plans/**` control state for this run.
- In scope: staged huge-document selection, selection ownership, delete
  mutation, clipboard/keyboard intent, staged root-group rendering style, and
  focused huge-document Playwright oracles.
- Out of scope: raw mobile/device proof, external issue ledgers, release
  readiness, and broad virtualized architecture work.

Blocked condition:
Stop only if the next safe move requires a product taste decision not covered
by `vision`, a staged architecture decision owned by `plite-plan`, or
a missing browser/device/tool blocks every remaining proof path. None of those
blocked this run.

Automation state:
- current_loop: 6
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: none
- goal_status: ready-for-check-complete

Current verdict:
- verdict: fixed and kept
- confidence: high for the named desktop/browser route after focused package,
  browser, and typecheck proof
- main result: `Cmd+A` dropped from 4860ms to 14ms, `Delete` from more than
  30s/page lock to 151ms, and staged vertical selection p95 from roughly
  1585ms to 438ms in the focused sampler
- tradeoff: staged full-document select-all is intentionally model-backed with
  collapsed native selection, avoiding 1.49M characters of native selection
  export

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|----------------------|-------------------|
| checkpoint-zero | slate-automation | complete | P0 | Prompt scope, stop rules, final sections, exact route, and north-star boundary recorded before patches. | keep |
| exact-repro-shift-down | slate-react/browser | complete | P0 | Baseline `Shift+ArrowDown` keypress 298ms, later repeated p95 about 1585ms before root-group style fix, latest p95 438ms. | keep |
| exact-repro-shift-up | slate-react/browser | complete | P0 | Baseline `Shift+ArrowUp` keypress 361ms, latest repeated p95 427ms. | keep |
| exact-repro-select-all-delete | slate-react/browser | complete | P0 | Baseline `Meta+A` 4860ms, `Delete` exceeded 30s and locked page. Latest `Meta+A` 14ms and `Delete` 151ms. | keep |
| stable-behavior-matrix | slate-react/browser | complete | P0 | Focused Playwright rows cover staged shift, select-all/delete, type, paste, undo, Enter, scroll, middle-block editing, auto partial comparison. | keep |
| oracle-repair | tdd/playwright | complete | P0 | Unit contracts and Playwright tests added for full-block delete, staged model-backed select-all, partial-DOM authoritative selection, clipboard intent, and staged behavior. | keep |
| visual-native-proof | Playwright | complete | P0 | Browser keyboard probes recorded model/native/DOM state; full staged select-all now keeps native selection collapsed and model selection full. | keep |
| plite-browser-promotion | slate-automation | complete | P1 | Repeated route proof became local Playwright helpers `getBrowserSelectAllHotkey` and `pressKeyboardWithTiming`; no package-level `plite-browser` API needed for this packet. | keep |
| mobile-claim-width | slate-automation | complete | P1 | Raw mobile/device proof is out of scope; no raw mobile claim made. | scoped N/A |
| huge-document-smoke | slate-react/browser | complete | P1 | 10k staged and 20k auto partial huge-doc smoke passed for destructive edit and follow-up behavior. | keep |
| perf-packet | slate-react/perf | complete | P1 | Hot lanes had before/after timings and bounded Playwright assertions. No debounce packet added. | keep |
| consolidation | slate-automation | complete | P1 | Active plan records accepted decisions; no `.agents/**` skill miss required source-rule patch. | N/A |
| final-handoff | slate-automation | complete | P0 | Changed list, review attention, stopping checkpoints, commands, slowdowns, and risks are recorded below. | keep |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | split/add | exact route, shift, select-all/delete, stable matrix | user prompt plus north-star read | Prompt named exact slow gestures and multi-loop stability. | Rows created before implementation. |
| 1 | reprioritize | select-all/delete | exact route probe | `Delete` locked for more than 30s after `Meta+A`. | Delete became first runtime owner. |
| 2 | add | projected full-block delete | handle probe and operation audit | Full top-level delete looped over 10k `remove_node` operations. | One `replace_children` fast path added. |
| 3 | reopen/update | staged select-all ownership | Playwright timing and DOM materialization | Staged select-all exported huge native selection and materialized all roots. | Staged broad selection made partial-DOM-backed/model-backed. |
| 4 | add | partial-DOM authoritative selection, clipboard intent | Playwright delete/paste regressions | Keyboard delete and paste imported stale native caret for partial-DOM-backed selections. | Kernel and classifier repaired. |
| 5 | add | staged vertical selection p95 | repeated shift sampler | Root-group `content-visibility:auto` made warm staged vertical selection p95 exceed 1s. | Drop root-group content visibility once staged native surface is complete. |
| 6 | close | final proof and ledger | focused tests, Playwright matrix, typecheck, this plan | All named safe owners had proof or scoped N/A. | Ready for check-complete and final gate. |

Work Checklist:
- [x] First checkpoint copied every explicit prompt requirement, scope boundary,
      timing constraint, stop condition, deliverable, final handoff section,
      verification surface, and success criterion before implementation.
- [x] Objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [x] Invocation mode, no-timebox policy, stop-question policy, and backlog
      ladder are recorded.
- [x] Checkpoint supervisor table was reconciled after each evidence loop.
- [x] Each loop ended with a checkpoint mutation decision.
- [x] Current-tree/status packet recorded before runtime patches.
- [x] Behavior proof packet recorded for every in-scope stable editor family or
      explicitly scoped.
- [x] Visual/native selection proof packet recorded for browser-visible
      selection/editing risk.
- [x] Missing oracle packets were written and verified.
- [x] Repeated browser proof patterns were promoted to local Playwright helpers;
      no package-level `plite-browser` API was needed.
- [x] Mobile/raw-device proof was scoped out and no raw-device claim was made.
- [x] Huge-document correctness smoke was run.
- [x] Perf packet ran after correctness evidence and recorded before/after
      numbers.
- [x] Package/API/docs audit found no public API/doc hard-cut work in this
      packet.
- [x] Docs/north-star/rule consolidation was applied to this active plan; no
      reusable taste or skill-source patch was needed.
- [x] Workflow slowdowns were logged and avoidable repeats were repaired in
      command choice/test helpers.
- [x] Packet ledger contains one row per runtime, oracle, and proof packet.
- [x] Changed list is current and limited to this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Autoreview/review gate was performed as scoped self-review of touched
      runtime/tests after focused proof.
- [x] Agent-native review is N/A because no `.agents/**`, hooks, skill, or
      prompt/tooling source changed.
- [x] Output budget discipline was repaired after initial broad scans by using
      targeted reads and focused proof commands.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact route, `Shift+Down`, `Shift+Up`, `Cmd+A+Delete`, multi-loop stability, all editor behavior families, stop rules, and final handoff sections were copied into the plan. |
| `plite-automation` source rule read | yes | The run used autogoal, dynamic checkpoints, packet ledger, stop checkpoint, changed-list, and final-handoff contract. |
| `vision` read | yes | Taste boundary checked before implementation; no uncovered taste gap blocked runtime work. |
| Active goal checked or created | yes | Active autogoal thread `019e6aa0-8ace-7e73-b0e9-166d6fbc4a30` owns this plan. |
| Invocation mode recorded | yes | Batch/full-loop, no timebox, continue while safe owners remain. |
| Source of truth recorded | yes | Runtime/tests in `.tmp/plite`; parent repo owns this plan only. |
| Private-alpha boundary recorded | yes | No release, publish, changeset, PR, or ship-readiness language. |
| Browser proof strategy recorded | yes | Exact route Playwright/native/model/DOM probes plus focused Playwright tests. |
| Mobile proof policy recorded | yes | Raw mobile/device proof out of scope; no raw mobile claim. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove exact slow gestures and stable editor behaviors. | Staged `Meta+A` 4860ms to 14ms, `Delete` >30s to 151ms, shift p95 bounded, focused behavior matrix green. |
| Dynamic checkpoint reconciliation | yes | Update plan from each loop. | Six mutation-ledger rows record add/update/reopen/reprioritize/close decisions. |
| Workspace authority proof | yes | Record cwd/tool for Plite and parent docs. | Runtime commands ran in `.tmp/plite`; this plan updated in parent `docs/plans`. |
| Behavior gates | yes | Run focused stable behavior proof. | Staged 10k and auto partial huge-document Playwright rows passed. |
| Visual/native selection proof | yes | Record model/native/DOM evidence. | Browser probes recorded model full selection with native collapsed for staged select-all, and collapsed model/native state after delete. |
| Missing oracle repair | yes | Add and verify contract/browser tests. | Unit and Playwright tests added for full-block delete, staged selection, partial-DOM ownership, clipboard intent, and huge-doc behavior. |
| `plite-browser` promotion | yes | Promote repeated proof or record no package helper. | Local Playwright helpers added; no package-level helper needed. |
| Mobile/raw-device claim width | yes | Avoid fake mobile proof. | Raw mobile scoped out; no device claim made. |
| Huge-document correctness smoke | yes | Run focused huge-doc smoke. | `keeps staged 10k...`, staged middle-block, and auto partial 5k/20k rows passed. |
| Package/API proof | yes | Run package tests/typecheck for touched package. | `bun --filter plite-react test:vitest ...` and `bun --filter plite-react typecheck` passed. |
| Skill/rule sync | yes | Run sync only if `.agents/**` changed. | N/A: no `.agents/**` source changed. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers. | Sections below are current. |
| Final lint/check | yes | Run Plite final gate or record blocker. | Final `bun check` row records outcome. |
| Workflow slowdown review | yes | Log slow steps and repairs. | Workflow slowdown table below records command pitfalls and runtime lock. |
| Agent-native review for agent/tooling changes | yes | Run or mark N/A. | N/A: no agent/tooling source changed. |
| Autoreview for non-trivial implementation changes | yes | Review touched runtime/tests after proof. | Scoped self-review found no actionable issue after focused tests and typecheck. |
| Goal plan complete | yes | Run check-complete. | Final command row records `check-complete` result. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | Prompt rows and north-star boundary recorded. | closed |
| Status and current-tree closure | complete | Route/source/test owners identified. | closed |
| Exact route reproduction | complete | Slow shift/select-all/delete reproduced with timings. | closed |
| Hot-owner analysis | complete | Delete loop, staged native selection export, partial-DOM ownership, and root-group style owners identified. | closed |
| Runtime patches | complete | Mutation, selection strategy, kernel, classifier, and root-group style fixes applied. | closed |
| Oracle repair | complete | Focused unit/browser tests added and verified. | closed |
| Visual/native proof | complete | Model/native/DOM metrics recorded from real browser route. | closed |
| Huge-document correctness smoke | complete | Staged and auto partial browser rows passed. | closed |
| Perf packet | complete | Before/after timings recorded for named slow lanes. | closed |
| Consolidation and review | complete | Plan ledger and self-review complete; no skill-source patch needed. | closed |
| Final handoff and goal-plan check | complete | Plan ready for final command gate and handoff. | closed |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| huge-document | 10k staged | chromium desktop | `Shift+ArrowDown` / `Shift+ArrowUp` | bounded native/model selection, no DOM explosion | complete |
| huge-document | 10k staged | chromium desktop | `Meta+A` / `Delete` | model-backed select-all, one-paragraph delete, fast follow-up typing | complete |
| huge-document | 10k staged | chromium desktop | paste / undo | replacement paste and undo restore | complete |
| huge-document | 10k staged middle block | chromium desktop | type / undo / Enter / scroll | normal editing and viewport stability | complete |
| huge-document | auto partial 5k and 20k | chromium desktop | select-all / paste / undo | adjacent partial-DOM regression guard | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| P1 baseline | 1 | Playwright | Exact route stalls. | Bun Playwright probe. | `Shift+Down` 298ms, `Shift+Up` 361ms, `Meta+A` 4860ms, `Delete` >30s lock. | keep baseline | closed |
| P2 delete fast path | 2 | `mutation-controller.ts` | Full top-level delete should not replay 10k removes. | `projected-command-contract.test.ts`. | One `replace_children` operation verified. | keep | closed |
| P3 staged select-all ownership | 3 | runtime strategy | Staged broad selection should be partial-DOM-backed/model-backed. | `runtime-root-engine.ts`, `keyboard-input-strategy.ts`, `dom-strategy-and-scroll.tsx`. | `Meta+A` latest 14ms, native collapsed, model full selection. | keep | closed |
| P4 authoritative partial selection | 4 | editing kernel/input classifier | Delete/paste must not import stale native caret for partial-DOM-backed selections. | `editing-kernel.ts`, `input-controller.ts`, `editing-kernel-contract.ts`. | Staged delete and auto partial paste rows pass. | keep | closed |
| P5 staged vertical p95 | 5 | `editable-text-blocks.tsx` | Root-group content visibility hurts native vertical selection after warmup. | repeated shift sampler and staged Playwright test. | Staged shift p95 about 438ms latest. | keep | closed |
| P6 final verification | 6 | tests/typecheck/check | Runtime/oracles must stay coherent. | Focused Vitest, Playwright, typecheck, final check. | Commands listed below. | keep | closed |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Full-block delete contract | `plite-react` | `bun --filter plite-react test:vitest -- test/projected-command-contract.test.ts -t "delete-fragment over every top-level block"` | N/A | pass | none |
| Staged select-all model ownership | `plite-react` | `bun --filter plite-react test:vitest -- test/dom-strategy-and-scroll.test.tsx -t "staged domStrategy keeps broad select-all"` | N/A | pass | none |
| Partial-DOM selection preservation | `plite-react` | `bun --filter plite-react test:vitest -- test/editing-kernel-contract.test.ts -t "partial-DOM-backed model selection"` | N/A | pass | none |
| Staged 10k slow lanes | exact route | Playwright grep `keeps staged 10k` | chromium | pass, 2 tests | none |
| Staged/auto partial matrix | exact route | Playwright grep `keeps staged 10k|keeps staged middle-block|keeps auto partial-dom select-all|keeps auto partial-dom 20k` | chromium | pass, 5 tests | none |
| Plite React package tests | `plite-react` | `bun --filter plite-react test:vitest -- test/editing-kernel-contract.test.ts test/dom-strategy-and-scroll.test.tsx test/projected-command-contract.test.ts` | N/A | pass, 119 tests | none |
| Package typecheck | `plite-react` | `bun --filter plite-react typecheck` | N/A | pass | none |
| Final Plite gate | `.tmp/plite` | `bun check` | N/A | pass after formatting touched Playwright test | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|---------------|--------|
| Baseline staged select-all | model `[0,0]` to `[9999,0]` after slow export | about 1,492,426 chars | DOM materialized to 10k mounted blocks | exact-route Playwright probe | failure captured |
| Latest staged select-all | model `[0,0]` to `[9999,0]`, input state `partial-dom-backed` | 0 chars, native collapsed | DOM does not export giant native range | exact-route Playwright probe | fixed |
| Latest delete after select-all | model one empty paragraph, selection `[0,0]` offset 0 | collapsed | DOM nodes 8, mounted 1 | exact-route Playwright probe | fixed |
| Latest typing after delete | model text `after delete`, selection offset 12 | collapsed | stable one-block editor | exact-route Playwright probe | fixed |
| Latest vertical selection | model/native selection expands within mounted block | about 40 chars in sample | no all-root materialization | repeated shift sampler | bounded |

plite-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| OS-specific select-all hotkey | huge-document Playwright tests | `getBrowserSelectAllHotkey` local helper | staged 10k Playwright grep | kept locally |
| keyboard timing wrapper | huge-document Playwright tests | `pressKeyboardWithTiming` local helper | staged shift/select-all tests | kept locally |
| package-level plite-browser API | not repeated outside this route in this packet | none | focused tests were enough | no package API change |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| Staged huge-document desktop/browser stability | Chromium Playwright route proof | focused Playwright greps | pass | desktop browser only |
| Raw mobile/device stability | none | not run | scoped out | no mobile claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| 10k staged | `Shift+ArrowDown` / `Shift+ArrowUp` | bounded timing and selection state | staged 10k Playwright row | pass |
| 10k staged | `Meta+A` / `Delete` | fast model-backed full delete to empty paragraph | staged 10k Playwright row | pass |
| 10k staged | type after delete | inserted text and collapsed selection | staged 10k Playwright row | pass |
| 10k staged | paste and undo | paste replacement and undo restore | staged 10k Playwright row | pass |
| 10k staged middle block | type, undo, Enter, scroll | editing and viewport stability | staged middle-block row | pass |
| 20k auto partial | select-all, paste, undo | adjacent partial-DOM behavior preserved | auto partial 20k row | pass |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Broad initial `rg` | slate-automation command shape | seconds, noisy | Search scope too wide for known route. | Owner families found with too much output. | Repaired by targeted reads. |
| Unquoted URL in shell | command shape | one failed command | zsh globbed `?strategy=staged`. | no product evidence | Quote URLs in probes. |
| Node REPL Playwright import | proof setup | two failed attempts | Bun nested package/runtime mismatch and persistent binding issue. | no product evidence | Use Bun stdin with `@playwright/test`. |
| Wrong Bun unit command | proof setup | two failed attempts | Vitest tests were run through Bun's native test runner. | command failures only | Use `bun --filter plite-react test:vitest -- <file> -t <name>`. |
| Wrong DOM test path | proof setup | one failed attempt | Source helper file is not the Vitest wrapper. | no product evidence | Use `test/dom-strategy-and-scroll.test.tsx`. |
| Initial staged `Delete` | runtime | more than 30s | 10k-operation delete plus stale native import path. | severe real failure | Runtime fixed and covered. |
| Auto partial paste regression during patching | runtime/oracle | one Playwright failure | `Cmd+V` classified as native selection move and imported stale native caret. | useful adjacent regression | Classifier fixed and test kept. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `.tmp/plite/packages/plite-react/src/editable/mutation-controller.ts`; `.tmp/plite/packages/plite-react/src/editable/runtime-root-engine.ts`; `.tmp/plite/packages/plite-react/src/editable/keyboard-input-strategy.ts`; `.tmp/plite/packages/plite-react/src/editable/editing-kernel.ts`; `.tmp/plite/packages/plite-react/src/editable/input-controller.ts`; `.tmp/plite/packages/plite-react/src/components/editable-text-blocks.tsx` |
| tests/oracles/browser proof | `.tmp/plite/packages/plite-react/test/projected-command-contract.test.ts`; `.tmp/plite/packages/plite-react/test/dom-strategy-and-scroll.tsx`; `.tmp/plite/packages/plite-react/test/editing-kernel-contract.ts`; `.tmp/plite/playwright/integration/examples/huge-document.test.ts` |
| benchmarks/metrics/targets | no benchmark source changed this run; metrics came from focused route probes and Playwright timing helpers |
| examples/docs | parent `docs/plans/2026-06-05-staged-huge-document-selection-delete-stability.md` |
| skills/workflow | no `.agents/**` source changed |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Full-doc staged select-all uses model-backed selection with collapsed native selection. | This is the perf-correct fix, but it means the browser does not paint a giant native blue selection over 1.49M characters. | staged select-all proof | Accept for now; consider a lightweight selected-all affordance later if the UX feels too invisible. |
| 2 | Staged vertical selection is bounded but not tiny. | Latest p95 is about 438ms, much better than the 1s-plus failure but not sub-100ms. | shift sampler | Treat as stable enough for this packet; use a later perf loop if you want a stricter target. |
| 3 | Raw mobile/device behavior is not claimed. | This packet used desktop Chromium route proof. | mobile claim ledger | Keep raw-device proof as a separate lane. |
| 4 | Pre-existing dirty Plite files outside this packet may still exist. | They are from earlier loops and were intentionally ignored here. | changed list scope | Review separately before committing a broader tree. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | none | No blocker for this prompt. | All safe owners for the named route had proof or scoped N/A. | none | final gate and handoff | none | this plan |

Findings:
- Full top-level delete was replaying thousands of structural operations; one
  `replace_children` operation is the correct projected mutation for this case.
- Staged select-all must be partial-DOM-backed/model-backed. Exporting a native
  selection over the whole 10k-block document materialized the world and made
  `Delete` unusable.
- Partial-DOM-backed selections are authoritative for destructive commands and
  clipboard shortcuts. Importing the stale native caret breaks delete and paste.
- Staged root-group `content-visibility:auto` is useful during warmup, but
  keeping it after all staged roots mount hurts native vertical selection p95.

Decisions and tradeoffs:
- Keep the projected full-block delete fast path because it preserves the root
  and selection while removing the 10k-operation loop.
- Keep staged broad selection model-backed because the alternative is giant
  native selection export and full DOM materialization.
- Keep local Playwright helpers rather than adding a package-level
  `plite-browser` API because the repeated pattern is still route-local.
- Do not add mobile claims because no raw device lane ran.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Unquoted route URL in shell | 1 | quote URL | resolved |
| Node REPL Playwright import/binding | 2 | Bun stdin runner | resolved |
| Bun native test command for Vitest file | 2 | `bun --filter plite-react test:vitest` | resolved |
| Wrong DOM test wrapper path | 1 | use `.test.tsx` wrapper | resolved |
| Playwright test formatting from new helper calls | 1 | run Biome formatter | resolved |
| Playwright delete regression after model-backed select-all | 1 | make partial-DOM-backed selection authoritative | resolved |
| Playwright paste regression in auto partial lane | 1 | classify clipboard shortcuts separately | resolved |

Verification evidence:
- `bun --filter plite-react test:vitest -- test/projected-command-contract.test.ts -t "delete-fragment over every top-level block"` passed.
- `bun --filter plite-react test:vitest -- test/dom-strategy-and-scroll.test.tsx -t "staged domStrategy keeps broad select-all"` passed.
- `bun --filter plite-react test:vitest -- test/editing-kernel-contract.test.ts -t "partial-DOM-backed model selection"` passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "keeps staged 10k"` passed, 2 tests.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "keeps auto partial-dom select-all"` passed.
- `bun --filter plite-react test:vitest -- test/editing-kernel-contract.test.ts test/dom-strategy-and-scroll.test.tsx test/projected-command-contract.test.ts` passed, 119 tests.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "keeps staged 10k|keeps staged middle-block|keeps auto partial-dom select-all|keeps auto partial-dom 20k"` passed, 5 tests.
- `bun --filter plite-react typecheck` passed.
- Initial final `bun check` failed only on Biome formatting in the touched
  Playwright file; `bunx biome format --write playwright/integration/examples/huge-document.test.ts`
  fixed it.
- Final `bun check` passed: lint, package/site/root typecheck, Bun tests
  `1180 pass / 95 skip / 0 fail`, `plite-layout` `47 pass / 0 fail`, and
  `plite-react` Vitest `57 files / 666 tests` passed.
- Final `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-staged-huge-document-selection-delete-stability.md`
  passed.

Final handoff contract:
- Goal plan: this file.
- Surface and route/package: staged huge-document route, `plite-react`.
- Invocation mode, elapsed/timebox, loop/checkpoint count: batch/full-loop,
  six loops, no timebox.
- Behavior gates and visual proof: staged and auto partial browser rows passed;
  model/native/DOM probes recorded.
- Primary metric baseline/latest/best and stop reason: `Meta+A` 4860ms to
  14ms, `Delete` >30s to 151ms, staged shift p95 about 1585ms to 438ms; stopped
  because all named safe owners are covered.
- Bugs fixed and oracles added: full-block delete, staged selection ownership,
  partial-DOM authoritative selection, clipboard shortcut intent, staged
  root-group style after warmup.
- Benchmark/skill/docs repairs: route-level timing oracles and this plan; no
  skill-source patch.
- Workflow slowdowns and repairs: recorded above.
- Changed list: recorded above.
- Needs your attention: recorded above.
- Stopping checkpoints to unblock: none.
- Accepted deferrals and residual risks: raw mobile proof and optional
  selected-all visual affordance.
- Next owner: none for this prompt after final command gates pass.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final command gate and handoff. |
| Where am I going? | Close the active goal and hand off. |
| What is the goal? | Stabilize staged huge-document slow selection/delete behavior without breaking stable editor behaviors. |
| What have I learned? | The main owners were 10k-operation delete, staged native select-all export, partial-DOM selection authority, clipboard classification, and root-group content visibility after staged warmup. |
| What have I done? | Patched runtime, added unit/browser oracles, measured before/after, and updated this plan. |
| What changed in the checkpoint plan? | Baseline rows were split into six evidence loops and closed with explicit keep/N/A decisions. |

Timeline:
- 2026-06-05: Created the goal plan, reproduced the exact route failures,
  patched the runtime/oracles, verified focused tests, and prepared final gates.

Open risks:
- No blocker remains for this prompt. Residual risks are limited to raw mobile
  proof not claimed, optional selected-all UX affordance, and stricter future
  perf targets for staged vertical selection.
