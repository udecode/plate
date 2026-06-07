# Slate v2 eight hour automation

Objective:
Timed 8h Slate v2 automation: close current-tree quality, then keep running
evidence-driven behavior, visual, oracle, perf, API/docs, and workflow packets.

Goal plan:
docs/plans/2026-06-07-slate-v2-eight-hour-automation.md

Template:
docs/plans/templates/slate-automation.md

Primary template:
docs/plans/templates/slate-automation.md

Applied packs:
- none

Automation source:
- type: direct user invocation
- prompt / link: `[$slate-automation] ... 8 hours`
- surface / route / package: unspecified; default to Slate v2 private-alpha
  current tree under `.tmp/slate-v2`, with supervision-mode selection from
  current evidence.
- invocation mode: timed
- minimum runtime / deadline: 8h minimum active runtime; start
  2026-06-07 13:51:36 CEST; target deadline 2026-06-07 21:51:36 CEST.
- completion threshold summary: do not hand off before the 8h minimum unless
  interrupted or hard-blocked. Close or quarantine each packet. Queue soft
  questions. Keep going through supervision mode if obvious backlog dries up.

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
- Minimum 8h active timed automation elapsed, active packet has a
  keep/revert/quarantine decision, and required current-tree behavior, visual,
  package/API, docs/skill/workflow, changed-list, review-attention,
  stopping-checkpoint, slowdown, and final handoff rows are either proven,
  explicitly deferred, or N/A with evidence.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-07-slate-v2-eight-hour-automation.md`
  passes.

Verification surface:
- First packet: current-tree closure with `.tmp/slate-v2` focused checks
  (`bun check`, then narrower package/browser proof depending on failures).
- Browser-visible packets: prefer Playwright routes through `slate-browser`;
  use fresh dev server or managed server and screenshots/geometry for visual
  issues.
- Huge-document packets: `playwright/integration/examples/huge-document.test.ts`
  focused greps for staged/virtualized typing, select-all, Shift+Arrow,
  scrollbar/row coherence, plus package contracts.
- API/docs packets: source grep and package typecheck for touched packages;
  docs audit in parent when docs are changed.
- Skill/workflow packets: patch `.agents/rules/**`, run `pnpm install`, mirror
  audit with `rg`, and agent-native review when rules change.
- Mobile/raw-device: raw-device proof only if device lane exists; otherwise
  record claim width and do not imply raw-device coverage.

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
- Source of truth: `.tmp/slate-v2` live source/tests/benchmarks first;
  `docs/slate-v2/agent-start.md`, `slate-north-star`, and active plans for
  current control-plane truth.
- Allowed edit scope: `.tmp/slate-v2/packages/slate*`, `.tmp/slate-v2/site`,
  `.tmp/slate-v2/playwright`, `.tmp/slate-v2/scripts/benchmarks`, parent
  `docs/plans/**`, `docs/slate-v2/**`, `.agents/rules/**` only when workflow
  repair is proven.
- Browser surfaces: stable Slate v2 examples; huge-document when evidence says
  it is the highest-risk current lane.
- Package/API surfaces: `slate`, `slate-dom`, `slate-react`, `slate-browser`,
  `slate-history` docs/tests if API/DX mismatch is found.
- Agent/skill surfaces: source rules under `.agents/rules/**`; generated
  skills only via `pnpm install`.
- Docs/research surfaces: active plan, `docs/slate-v2/**`, and durable
  issue/benchmark evidence. No public changelog prose.
- Non-goals: release/publish/changeset/PR readiness, broad experimental
  pagination architecture without evidence, Plate package/test edits, branch
  creation, commit/push/PR unless explicitly requested later.

Blocked condition:
- Hard stop only for user interruption, destructive/commit/push/PR authority,
  external credential/device gap blocking all meaningful work, unsafe
  public/runtime API fork with no safe alternate packet, repeated tool/source
  blocker with no autonomous move, or missing reusable taste not covered by
  `slate-north-star` when no safe alternate owner remains.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious
  backlog looks empty. Enter supervision mode and infer the next checkpoint from
  `slate-north-star`, current evidence, weak proofs, benchmark gaps, API/docs
  mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- surface: unspecified Slate v2 current-tree automation
- mode: timed
- minimum_runtime: 8h
- target_deadline: 2026-06-07 21:51:36 CEST
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 50
- current_checkpoint: virtualized-native-text-beforeinput-boundary
- current_checkpoint_status: done
- next_checkpoint: private-alpha-full-browser-sweep-rerun
- goal_status: active

Current verdict:
- verdict: timed minimum elapsed; active packet kept; handoff-ready with one queued stopping checkpoint
- confidence: autoreview findings have direct proof, huge-document benchmark/browser proof is green, promoted selection oracle is checked, stale benchmark key/terminology is cut, current-source grep is clean, `bun check` passes, the post-huge-doc Chromium stable example sweep passes, the Firefox/WebKit stable selection band passes, the public API/DX hard cut has focused package proof, focused browser input smoke passes after the UA hard cut, the virtualized pagination projection/selection failure cluster is repaired with focused proof, the synced-blocks child-root Shift+Arrow race is repaired with unit plus browser proof, and the retry-green huge-document virtualized rows now pass strict repeat/full proof after both virtualized caret repair and explicit native text history merge metadata.
- next owner: slate-ar-stabilize / rerun full private-alpha browser gate
- keep / revert / quarantine call: keep left-gutter scrollbar detection, stabilized scrollbar proof helper, staged bounded-surface classifier/label/key repair, direct-gate closure after stalled review rerun, promoted model/native selection agreement oracle, public `slate-browser` first-party parity rename, old `slate-dom` UA legacy flag removal, virtualized pagination bounded row hitboxes, nested child-root DOM-selection projection repair, same-burst native text repair flushing before every new `beforeinput`, and full benchmark rechecks
- reason: 8h minimum elapsed; the active virtualized huge-document native text packet has focused repeat, full huge-document, cross-browser, package, build, and fast-check proof. Do not start the full private-alpha browser gate in this handoff; queue it as the next checkpoint.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-07-slate-v2-eight-hour-automation.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-automation | done | P0 | Copy prompt requirements and read north-star before implementation. | `slate-north-star`, `agent-start`, and this plan filled with 8h timed rows. | update |
| status | slate-automation | done | P0 | Read active plan, latest prompt, current source/control evidence without relying on chat. | Current docs read; first packet chosen. | update |
| gap-scan | slate-automation | done | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Routed first to huge-document proof, then stable example behavior sweep. | update |
| current-tree-closure | slate-automation | done | P0 | Establish that the just-committed current Slate v2 tree has no obvious fast gate break before deeper packets. | `bun check` passed after `bun lint:fix` fixed formatting. | update |
| huge-document-browser-proof | slate-ar-stabilize / Playwright | done | P0 | Highest-risk current docs lane is huge-doc behavior/perf claim width after recent selection/runtime work. | Fresh managed Playwright build/server: 7 focused Chromium rows passed in 14.7s. | update |
| stable-example-sweep | slate-ar-stabilize / Playwright | done | P0 | No named surface means core stable examples need behavior proof before deeper perf/API packets. | Core stable example Chromium sweep passed: 199 passed, 5 expected skips. | update |
| cross-browser-selection-sweep | slate-ar-stabilize / Playwright | done | P0 | Chromium green is not enough for native browser editing/selection risk; Firefox/WebKit often diverge. | Targeted Firefox/WebKit rows passed: 157 passed, 45 expected skips. | update |
| huge-document-visual-screenshot | slate-ar-stabilize / Playwright | done | P0 | Recent user-visible huge-doc failures were visible double highlights, bad scrollbars, and wrong Shift+Arrow target; screenshots/geometry need a direct pass. | Focused visual/geometry proof passed: staged visual projection, staged/full-DOM parity, virtualized drag autoscroll, blank-gap drag. | update |
| perf-honesty-baseline | slate-ar-perf | done | P0 | Correctness is green enough to measure; current docs still mark huge-doc perf superiority scoped/unfinished. | Full huge-doc benchmark rerun passed with budget failures 0 after benchmark-honesty patch. | update |
| post-benchmark-hygiene | slate-automation | done | P0 | Benchmark script changed; run formatter/check proof before next broader packet. | `bun lint:fix` no fixes; `bun check` passed. | update |
| api-docs-hygiene-audit | slate-automation | done | P1 | Behavior/perf gates are green; next likely private-alpha rot is stale API aliases, compat wording, or docs/API mismatch. | Focused audit patched stale wording/test labels/comment only; no runtime API cut found safe in this packet. | update |
| command-pitfall-skill-repair | slate-automation | done | P0 | The run hit a focused Bun command-shape miss for slate-dom test directories. | Source rule patched, `pnpm install` synced mirror, mirror audit passed, agent-native review clean. | add |
| mobile-claim-width-proof | slate-automation | done | P1 | Desktop/browser oracles are solid enough to check local mobile proof width; raw-device proof must stay explicit. | Scoped mobile release proof and mobile Playwright semantic/touch rows passed; raw-device remains unclaimed. | update |
| cross-editor-huge-document-benchmark | slate-ar-perf | done | P1 | Local huge-doc perf is honest and green; next pressure is comparison against sibling editor implementations. | Cross-editor benchmark passed and exposed Slate virtualized Shift+Down command as the next hotspot. | update |
| virtualized-shift-down-hotspot | slate-ar-perf / slate-patch | done | P0 | Cross-editor evidence showed Slate virtualized vertical Shift+Down was slower than ProseMirror/Lexical while typing was good. | Kept persistent view-selection decoration source, small top-level selection-impact fast path, conditional native-scrollbar overscan, deferred native text repair flush, and benchmark oracle repairs. Focused browser proof passed, 20-iteration virtualized benchmark passed, full cross-editor comparison passed, full huge-doc benchmark passed with 0 budget failures, `bun check` passed. | update |
| cross-editor-benchmark-oracle-repair | slate-ar-perf | done | P0 | 20-iteration benchmark exposed weak native-caret setup and exact typed-count assertions. | Harness now waits for mounted Slate text, anchors native DOM selection before typing, asserts delta typed-count, waits for pending native repair, and emits rich debug state on failure. 20-iteration virtualized benchmark passed. | add |
| virtualized-scrollbar-overscan-budget | slate-patch / Playwright | done | P0 | Permanent 96-row virtualized overscan protected native scrollbar drag but over-materialized ordinary select/type. | Overscan buffer now activates only for pointer-down on the vertical scrollbar gutter. Browser scrollbar-drag row passed; virtualized DOM p95 dropped from 1307/1432-class to 155 scoped and 304 full-trace. | add |
| post-overscan-huge-document-browser-sweep | slate-ar-stabilize / Playwright | done | P0 | Conditional overscan changes virtualized materialization; run the full huge-document browser suite before broadening. | Full Chromium `huge-document.test.ts` passed: 28/28. | update |
| post-overscan-cross-browser-huge-document-focus | slate-ar-stabilize / Playwright | done | P0 | Chromium green is not enough for native editing/materialization after virtualized overscan changes. | Focused Firefox/WebKit huge-doc rows passed where applicable: 8 passed, 18 explicit skips for Chromium-only rows. | update |
| post-runtime-stable-example-sweep | slate-ar-stabilize / Playwright | done | P0 | Runtime packet touched generic selection impact and beforeinput; huge-doc green is not enough. | Chromium stable sweep passed 199/204 with 5 expected skips; Firefox/WebKit targeted selection/input band passed 169 with 51 expected skips. | update |
| slate-browser-promotion-audit | slate-browser / slate-automation | done | P1 | The run added repeated mounted-text/native-caret proof logic in benchmark/test code. Decide whether it belongs in `slate-browser` or only benchmark harness. | Added `setNativeDOMSelection` browser-handle primitive and `editor.dom.waitForTextPath`, `collapseAtTextPath`, `waitForPendingNativeTextInputRepair` Playwright helpers. Huge-doc tests and cross-editor benchmark use the promoted path. `slate-browser`/`slate-react` focused typechecks passed, `slate-browser test:core` passed, focused huge-doc browser rows passed, focused cross-editor benchmark passed, `bun check` passed. | update |
| behavior-proof | slate-ar-stabilize | done | P0 | Prove stable editor behavior before perf. | Specific huge-document, stable example, cross-browser, and shadow-DOM rows now carry this proof. Reopen if new behavior evidence appears. | merge |
| oracle-repair | slate-patch / tdd | done | P0 | Add missing native/visual/model oracles for found gaps. | Kept overscan-zero typing, native scrollbar, cross-editor typed-count/native-caret, staged diagnostic, interaction-sequence metric, and shadow-DOM DOM-helper oracles. Reopen on new gap. | merge |
| visual-proof | Browser / Playwright | done | P0 | Prove visible editor behavior and native selection. | Huge-document visual/geometry rows, stable native selection band, and shadow-DOM native-caret row passed. | merge |
| slate-browser-promotion | slate-browser | done | P1 | Promote repeated browser proof into reusable API/helper. | Helper promoted and verified in loop 19. | update |
| benchmark-diagnostics-staged-native-surface | slate-ar-perf | done | P1 | Full huge-doc benchmark still reports staged native-surface timeout diagnostics even when strict budgets pass. Decide whether this is a lying metric, a stale diagnostic, or a real staged behavior/perf gap. | `waitForNativeSurface` now classifies `staged` as bounded, matching runtime strategy handling. Focused staged trace: nativeSurface timedOut 10 -> 0, p95 ~18-20ms. Full benchmark: budget failures 0, diagnostic failures 0, staged diagnostic trace duration ~134s -> ~14s, staged nativeSurface timedOut 0, `bun check` passed. | update |
| slate-browser-readme-dx-sync | slate-browser / docs | done | P1 | `slate-browser/playwright` added a `dom` helper namespace but README still documents only selection and locator namespaces. | README now documents the DOM namespace and canonical `waitForTextPath`/`collapseAtTextPath` usage. `bun lint:fix`, `bun --filter slate-browser typecheck`, `bun --filter slate-browser test:core`, and `rg` source/docs audit passed. | update |
| huge-document-select-then-type-hotspot | slate-ar-perf | done | P1 | Full huge-doc benchmark reports `selectThenTypeToPaintMs` p95 around 240-270ms while `typeToPaintMs` is ~32ms and model type-to-paint is ~40ms. Decide if this is real follow-up typing latency, benchmark padding, or an unbudgeted perf gap. | The metric included the full scripted interaction sequence before typing, not just follow-up typing latency. Renamed source metrics to `interactionSequenceToPaintMs` / `interactionSequenceToPaintP95Ms` with no alias. Focused virtualized trace prints the new name and true `typeToPaintMs` remains ~32ms; full smoke wrapper passed; `bun check` passed. | update |
| current-tree-coherence-audit | slate-automation / review | done | P0 | Several runtime, benchmark, browser-helper, docs, and skill packets are kept. Audit the dirty tree for stale experiments, fake aliases, docs/API mismatch, orphan tests, and missing proof before more edits. | Diff audit found stale plan rows, a shadow-root gap in promoted native selection helper, and a stale `slate-browser` build-output workflow slowdown. Helper and rule repaired; focused proof passed. | update |
| shadow-dom-native-helper-repair | slate-browser / slate-react | done | P0 | The promoted `setNativeDOMSelection` helper used `ownerDocument.getSelection()` and missed the local `ShadowRoot` selection root used elsewhere in runtime code. | Helper now resolves selection through `Document | ShadowRoot` and dispatches realm-safe shadow-root `selectionchange`. New shadow-DOM browser row passed after `bun lint:fix` and `bun --filter slate-react typecheck`. | add |
| stale-slate-browser-dist-skill-repair | slate-automation | done | P0 | Playwright can import stale generated `slate-browser` output after source helper changes, producing false helper-missing failures. | Source rule now requires `bun --filter ./packages/slate-browser build` before browser proofs that import changed `slate-browser/playwright` helpers; `pnpm install` synced mirror and grep audit passed. | add |
| cross-browser-shadow-dom-helper-proof | slate-ar-stabilize / Playwright | done | P1 | Chromium proved the shadow-DOM helper row; Firefox/WebKit should cover native selection root divergence before moving on. | Firefox focused row passed. WebKit is explicitly skipped because a direct probe shows `document.getSelection().addRange()` for nested shadow DOM leaves `rangeCount: 0`; native proof not claimed there. | update |
| webkit-shadow-dom-native-selection-limit | slate-automation / Playwright | done | P1 | The focused row failed in WebKit; decide whether this is a Slate bug, harness bug, or engine limitation. | Direct WebKit probe on `/examples/shadow-dom` found nested shadow editor present, document selection present, but adding a collapsed range inside the shadow editor returns `rangeCount: 0`. Test now skips WebKit with that reason. | add |
| post-shadow-helper-fast-check | slate-automation | done | P0 | Loop 23-24 changed Slate React, slate-browser Playwright helpers, a browser test, parent rules, and generated skill mirror. | `bun check` passed after loop 23-24 focused helper/rule edits. | update |
| autoreview-current-tree-diff | autoreview / slate-automation | done | P0 | The kept diff now spans runtime selection/perf, helper API, Playwright tests, benchmarks, docs, and workflow rules. | Local autoreview found two actionable/partly-actionable issues. Left native-scrollbar gutter detection/proof was repaired and focused row passed. The staged DOM-present finding exposed a stale benchmark label/premise; staged now classifies as bounded and the focused trace reports timedOut 0. Rerun review stalled for 5m and returned empty, so the packet closed with direct proof plus slowdown log. | update |
| full-huge-document-benchmark-recheck | slate-ar-perf | done | P0 | Benchmark classifier and labels changed after the last full benchmark; focused trace is green but the full wrapper must prove strict and diagnostic budgets still pass. | Full benchmark passed: budget failures 0, diagnostic failures 0, staged diagnostic timedOut 0, max budget ratio 0.79, diagnostic max ratio 0.61, virtualized type-to-paint p95 32.9ms, virtualized DOM p95 304, editor elements p95 15. | update |
| post-left-scrollbar-full-huge-document-browser-sweep | slate-ar-stabilize / Playwright | done | P0 | Runtime scrollbar gutter detection changed after the last full huge-document browser suite. | Full Chromium `huge-document.test.ts` passed 28/28. | update |
| post-left-scrollbar-cross-browser-huge-document-focus | slate-ar-stabilize / Playwright | done | P1 | The runtime scrollbar/native input path is browser-facing; Chromium full suite is not enough for Firefox/WebKit claim width. | Initial run found cross-engine fixed-offset oracle failures in virtualized 5k typing. Repaired oracle to assert model/native DOM selection agreement with tight browser-native offset ranges. Final focused Firefox/WebKit band passed: 12 passed, 6 expected skips. | update |
| slate-browser-selection-agreement-helper-promotion | slate-browser / slate-automation | done | P1 | The cross-browser virtualized row needed a model/native DOM selection agreement oracle; keeping it local would repeat the proof gap. | Promoted `editor.assert.collapsedModelDOMSelection`, documented it in `slate-browser` README, ran `bun --filter slate-browser typecheck`, `bun --filter slate-browser test:core`, `bun --filter ./packages/slate-browser build`, exact Firefox/WebKit row, focused Firefox/WebKit band, and full Chromium huge-doc suite. | add |
| post-selection-helper-fast-check | slate-automation | done | P0 | Package helper API, README, and browser tests changed after the last fast check. | `bun check` passed after helper promotion. | update |
| benchmark-staged-dom-present-key-hard-cut | slate-ar-perf / hard-cut | done | P1 | The human label no longer lies, but the internal benchmark key `stagedDomPresent` still encodes the false full-DOM premise and can recreate the same review/automation miss. | Renamed the internal benchmark surface key to `stagedActiveDOMGroup` with no alias, updated wrapper surfaces/artifact path owners and contract test. Focused trace and full benchmark passed; source grep found no current `stagedDomPresent` references. | update |
| post-benchmark-key-hard-cut-fast-check | slate-automation | done | P0 | Benchmark scripts and contract tests changed after the last `bun check`. | `bun check` passed after benchmark key hard cut. | update |
| staged-native-surface-docs-terminology-audit | docs / slate-automation | done | P1 | Benchmark code had stale `DOM-present` terminology; current docs/API prose may carry the same false full-DOM premise. | Patched current Slate React docs and current test labels to use staged/full-DOM/native DOM wording. Scoped current-source grep has no `DOM-present` references outside historical plans/generated site output. Slate React Vitest and `bun check` passed. | update |
| post-huge-doc-stable-example-sweep | slate-ar-stabilize / Playwright | done | P0 | Huge-document lanes are green after several runtime/oracle/benchmark packets; stable examples need a fresh broad behavior pass so the run does not overfit huge-doc. | Chromium sweep over richtext, plaintext, markdown shortcuts, editable voids, placeholder, hidden content, and DOM coverage passed: 199 passed, 5 expected skips. | update |
| post-huge-doc-cross-browser-stable-selection-band | slate-ar-stabilize / Playwright | done | P0 | Chromium stable examples are green, but Firefox/WebKit are the usual native selection/input divergence lanes. | Focused Firefox/WebKit band for selection, caret, arrows, select-all, undo, paste, scroll, IME/composition, right-margin, triple click, and Shift rows passed: 157 passed, 45 expected skips. | update |
| public-api-dx-alias-audit | slate-automation / hard-cut | done | P1 | Behavior proof is broad enough to spend a packet on the user's clean-API taste: no stale compat aliases, fake old names, or changelog-style current docs. | Cut `SLATE_BROWSER_FIRST_LEGACY_PARITY_FAMILIES` / `SlateBrowserFirstLegacyParityFamily` with no alias, removed old Chrome/Edge/Firefox/Safari legacy UA flags from `slate-dom`, cleaned benchmark README compatibility wording, grep for removed names is clean, focused package proof and `bun check` passed. | update |
| post-api-dx-browser-input-smoke | slate-ar-stabilize / Playwright | done | P0 | `HAS_BEFORE_INPUT_SUPPORT` remains browser-facing after the UA hard cut; current engines need a quick native input smoke. | Focused Chromium/Firefox/WebKit rows for native insert, IME/composition, paste, and caret repair passed: 18 passed, 6 expected skips. | update |
| private-alpha-full-browser-sweep | slate-ar-stabilize / Playwright | failed-owner-found | P0 | The current kept diff spans runtime, browser helpers, DOM environment, benchmarks, docs, and workflow rules; focused proof is green enough for the broader private-alpha browser gate. | `bun check:full` passed fast checks and release-proof guards, then failed in Chromium virtualized pagination projection/selection rows. Killed after the owner cluster was clear. | update |
| virtualized-pagination-projection-repair | slate-patch / Playwright | done | P0 | Full gate exposed a coherent Chromium failure cluster in page-level virtualized pagination: projected block offsets, first-block click cursor moves, selected-text alignment, virtualized double-click, margin drag/click selection, split paragraph editing, rows=800 journey, and perf envelope. | Reproduced failures with retries off. Patched virtualized page rows to carry page-content horizontal bounds and use a positioned per-row coordinate system with bounded static hitboxes. DOM probe now hits the actual Slate text leaf and anchors native/model selection at `0,0`; focused 10-row cluster passed; `slate-react` and `slate-layout` typecheck passed. | update |
| synced-blocks-child-root-shift-selection-race | slate-patch / Playwright | done | P0 | Resumed full integration exposed a cold race where a second Shift+ArrowLeft inside a synced child root could bubble to the owner before model selection import caught up. | Patched internal-target keyboard projection to prefer the nested editable's live DOM selection before stale child runtime selection. Added focused unit coverage for both imported child selection and stale-import/native-DOM race. Cold browser probe passed 20/20, exact Playwright row passed 10/10 with retries off, full Chromium synced-blocks file passed 45/45, unit contracts passed, and `slate-react` typecheck passed. | add |
| private-alpha-full-browser-sweep-resume | slate-ar-stabilize / Playwright | flaky-owner-found | P0 | The owner clusters from `bun check:full` are repaired; resume broader browser proof before choosing another packet. | Resumed `bun check:full` completed after fast gates, proof guards, soak, build, and integration: 1735 passed, 571 skipped, 2 flaky retry-green rows. Flaky rows are both virtualized huge-document native typing/undo paths, so the sweep is not closeable until isolated retries-off. | update |
| huge-document-virtualized-flake-isolation | slate-ar-stabilize / Playwright | done | P0 | Retry-green rows are weak proof and both point at virtualized native typing/selection repair. | Reproduced retries-off. Patched virtualized native text insert ownership/late caret repair and promoted resolved DOM-selection diagnostics. Final proof: Chromium exact row 20/20, Firefox exact row 10/10, focused unit/type/build proof passed. | update |
| post-virtualized-flake-broader-huge-document-proof | slate-ar-stabilize / Playwright | done | P0 | Focused flake rows passing is not enough after runtime/browser-helper changes. | First broader repeat exposed a second owner: rapid native text repair history batches split, leaving `XX` after undo. Patched explicit native text history merge metadata. Final proof: Chromium/Firefox exact repeat 40/40, full Chromium huge-document 28/28, `bun check` passed. | update |
| private-alpha-full-browser-sweep-rerun | slate-ar-stabilize / Playwright | queued-stopping-checkpoint | P0 | The previous full gate only had retry-green huge-doc virtualized rows; that owner cluster now has strict proof. | Rerun `bun check:full`. If it finds a new owner, isolate and patch/quarantine. If it passes, resume supervision mode from the next evidence gap. | add |
| virtualized-native-text-beforeinput-boundary | slate-patch / Playwright | done | P0 | The broader virtualized 5k row still split rapid `abc` + Enter as `Cac` / `defb...` because same-burst insertText allowed stale pending native repair to overwrite the live caret before the next character. | Temporary probe reproduced `Cac` / `defb...`; patch flushes pending native text repair before every new `beforeinput`; probe then produced `Cabc` / `def...`; exact 5k row passed 10/10 and post-build smoke; broader 5-row virtualized sweep passed 5/5; original native-caret row passed 20/20; full Chromium huge-document passed 28/28; Firefox/WebKit 5k focused row passed; `bun check`, package builds, and `bun build:next` passed. Scratch probe deleted. | add |
| mobile-claim-width | slate-automation | done | P1 | Separate raw-device proof from viewport proof. | Scoped mobile proof passed; raw-device lane is explicitly unclaimed. | merge |
| huge-document-smoke | slate-ar-stabilize | done | P1 | Smoke huge-doc correctness without broad architecture work. | Focused and full huge-document browser rows plus benchmark behaviors cover typing, select-all, Shift+Arrow, scrollbar, row coherence, and staged controls/editing. | merge |
| perf-packet | slate-ar-fast / slate-ar-perf | done | P2 | Optimize only after correctness is green. | Virtualized ShiftDown/overscan packet and benchmark honesty packets were kept with before/after metrics. Reopen on new metric gap. | merge |
| supervision-mode | slate-automation | pending | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from north-star and evidence. | New checkpoint added/run, or hard blocker recorded. | seed |
| consolidation | slate-automation | pending | P1 | Move accepted reusable decisions to durable docs/rules. | Durable owner updated or N/A. | seed |
| final-handoff | slate-automation | done | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows filled from loop 50 proof; final response should stay concise and point to the queued full browser gate. | update |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded by extraction |
| 0 | update | checkpoint-zero | `slate-north-star`, `agent-start`, prompt `8 hours`, plan edits | Copied explicit timing, mode, stop, deliverable, proof, and private-alpha requirements before implementation. | done |
| 0 | add | current-tree-closure | no named surface; latest prior work touched broad runtime/docs/tests | Need a fast current-tree gate before choosing deeper supervision packets. | pending |
| 1 | update | current-tree-closure | `.tmp/slate-v2`: `bun check`; first run failed format/import-order, `bun lint:fix`, rerun passed. | Current tree fast gate is green; formatting drift repaired. | done |
| 1 | add | huge-document-browser-proof | current docs: huge-doc superiority is scoped and recent work touched selection/virtualized runtime. | Need replayable browser behavior before perf/API packet. | pending |
| 2 | update | huge-document-browser-proof | `.tmp/slate-v2`: managed `bun playwright ... huge-document.test.ts --grep ...`; fresh build/server, no base URL. | Staged controls/editing and virtualized select-all, typing, Shift+Arrow reverse, row coherence, scrollbar buffer all green. | done |
| 2 | add | stable-example-sweep | prompt has no surface; north-star says behavior first, then perf/API. | Stable examples are next cheapest broad confidence packet. | pending |
| 3 | update | stable-example-sweep | `.tmp/slate-v2`: managed Chromium sweep across richtext, plaintext, markdown shortcuts, editable voids, custom placeholder, hidden content, DOM coverage. | Core stable examples passed: 199 passed, 5 expected browser/project skips. | done |
| 3 | add | cross-browser-selection-sweep | Chromium-only proof does not cover Firefox/WebKit native editing divergence. | Target high-risk stable rows in Firefox/WebKit before perf/API work. | pending |
| 4 | update | cross-browser-selection-sweep | `.tmp/slate-v2`: managed Firefox/WebKit sweep using grep `selection|caret|Arrow|select-all|undo|paste|scroll|IME|composition|right-margin|triple click|Shift`. | Targeted native-editing selection band passed: 157 passed, 45 expected skips in 2.3m. | done |
| 4 | add | huge-document-visual-screenshot | Recent huge-document regressions were visible even when model metrics looked plausible. | Add direct visual/screenshot proof before performance packet. | pending |
| 5 | update | huge-document-visual-screenshot | `.tmp/slate-v2`: focused huge-doc Chromium greps for `visually projected`, staged/full-DOM vertical parity, downward drag autoscroll, blank-gap drag. | All targeted visual/geometry rows passed: 3 rows in 17.9s plus visually projected row in 8.7s. | done |
| 5 | add | perf-honesty-baseline | Behavior and visual proofs are green; huge-doc perf remains a known scoped risk. | Measure before patching or deciding no runtime patch. | pending |
| 6 | update | perf-honesty-baseline | First `bun run bench:react:huge-document:full:local` exposed one strict budget failure: `virtualizedDomNodesP95=1432` vs budget 400. Source/trace showed full-document DOM was being used for a strict virtualized editor DOM budget while editor-owned elements were 203. | Patched benchmark wrapper to budget `virtualizedEditorElementsP95` strictly and keep `virtualizedDocumentDomNodesP95` as diagnostic full-page DOM. Rerun: budget failures 0, max strict ratio 0.79, diagnostic max ratio 0.95. | done |
| 6 | add | post-benchmark-hygiene | `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-full.mjs` changed. | Need formatter/check proof before continuing. | pending |
| 7 | update | post-benchmark-hygiene | `.tmp/slate-v2`: `bun lint:fix`; `bun check`. | Formatter applied no changes; fast check passed lint, package/site/root typecheck, Bun tests, slate-layout tests, Slate React Vitest. | done |
| 7 | add | api-docs-hygiene-audit | Current timed run has no named surface; after correctness/perf proof, stale API/docs is the next highest-value private-alpha supervision packet. | Search stale compat/API/docs wording and either patch or mark N/A. | pending |
| 8 | update | api-docs-hygiene-audit | Scoped greps across `.tmp/slate-v2` packages/site/docs and parent docs/rules; inspected candidate hits. | Most hits were legitimate `backward` semantics, changelogs, internal ledgers, shadcn/path aliases, or legacy-parity test labels. Patched only stale current-surface wording: CSS comment, DOM desync comment, two Slate React provider test labels. Focused tests and `bun check` passed. | done |
| 8 | add | command-pitfall-skill-repair | `bun test ./packages/slate-dom/test` failed because directory filter does not match the repo's Bun test contract shape. | Source rule now forbids package test directories as focused Bun filters and recommends exact contract files/package scripts. `pnpm install` synced generated skill. | done |
| 8 | add | mobile-claim-width-proof | Stable desktop/browser and huge-doc proof are green; mobile proof width remains an explicit completion gate. | Run available local mobile proof without overstating raw-device coverage. | pending |
| 9 | update | mobile-claim-width-proof | `.tmp/slate-v2`: `bun test:mobile-device-proof`; mobile Playwright grep over richtext/dom-coverage/huge-document. | Claim-width script passed and explicitly refused raw-device claims. Mobile Playwright passed 2 applicable rows, skipped 2 desktop-only huge-doc rows. | done |
| 9 | add | cross-editor-huge-document-benchmark | Huge-doc local budgets are now honest and green; comparison pressure is the next useful perf packet. | Run cross-editor benchmark and record keep/defer route. | pending |
| 10 | update | cross-editor-huge-document-benchmark | `.tmp/slate-v2`: `bun run bench:react:huge-document:cross-editor:local`; sibling ProseMirror/Lexical build outputs existed. | Benchmark passed. Slate virtualized type-to-paint p95 33.8/33.1ms beats ProseMirror 49.5/52.8 and Lexical 75.3/67.4, but virtualized Shift+Down p95 is 49.9/60ms and command p95 is 34.7/49.1ms vs ProseMirror/Lexical ~15-16ms paint and ~1-2ms command. | done |
| 10 | add | virtualized-shift-down-hotspot | Cross-editor benchmark identified a specific remaining large-doc perf gap. | Inspect traces/source, patch only if behavior-preserving, verify with focused Playwright and benchmark. | pending |
| 11 | update | virtualized-shift-down-hotspot | Scoped pre-patch benchmark reproduced middle-block Shift+Down command/to-paint p95 ~47.5/59.5ms with 437 renders. Patch keeps the view-selection decoration source stable instead of toggling the projection provider on first model-owned expanded selection. Scoped post-patch benchmark: first Shift+Down command/to-paint p95 ~8.7/23.4ms with 7 renders; type stayed ~32.9ms. | Keep investigating because repeated Shift+Down and Shift+Up still have occasional p95 outliers despite low render counts. | in_progress |
| 12 | add | cross-editor-benchmark-oracle-repair | 20-iteration virtualized benchmark failed with `typed text was not visible` after the harness reselected the model block without re-anchoring native DOM selection. | Benchmark must test real native typing at the mounted Slate text, not a stale DOM selection. | done |
| 13 | split | virtualized-shift-down-hotspot, virtualized-scrollbar-overscan-budget | Artifact showed ShiftDown render count was fixed but cold middle select still rendered 438 rows because permanent scrollbar-drag overscan kept a large virtualized window mounted. | Separate the fixed ShiftDown fanout from the remaining materialization budget tax. | done |
| 14 | update | virtualized-scrollbar-overscan-budget | Conditional scrollbar-gutter overscan patch plus focused Playwright: rows buffered, overscan-zero burst typing, repeated Shift all passed. 5-iteration virtualized benchmark: middle select 91.2ms -> 41.6ms, DOM 1307 -> 155, ShiftDown 45.4ms -> 23.2ms. | Keep patch after behavior proof and measured win. | done |
| 15 | update | virtualized-shift-down-hotspot | 20-iteration virtualized benchmark passed: middle ShiftDown to-paint p95 22.4ms, command 6.3ms, repeated ShiftDown 22.8ms, ShiftUp 22ms, DOM 155. Full cross-editor comparison passed; full huge-doc benchmark passed with budget failures 0; `bun check` passed. | Packet is kept; remaining ProseMirror/Lexical command gap is measured residual, not dirty work. | done |
| 15 | add | post-overscan-huge-document-browser-sweep | Runtime materialization changed after focused rows and benchmarks passed. | Need full huge-document Chromium browser suite before broadening to other stable/API/perf packets. | pending |
| 16 | update | post-overscan-huge-document-browser-sweep | `.tmp/slate-v2`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium`. | Full huge-document browser suite passed 28/28 after overscan/runtime packet. | done |
| 16 | add | post-overscan-cross-browser-huge-document-focus | Full Chromium sweep is green, but native selection/materialization engines differ. | Run focused Firefox/WebKit rows before widening. | pending |
| 17 | update | post-overscan-cross-browser-huge-document-focus | `.tmp/slate-v2`: focused Firefox/WebKit huge-document grep over staged editing, virtualized typing/materialization/scroll rows. | Passed where applicable: 8 passed, 18 explicit skips for Chromium-only rows. | done |
| 17 | add | post-runtime-stable-example-sweep | Selection-impact and beforeinput changes are generic runtime changes. | Rerun stable example proof after the runtime packet. | pending |
| 18 | update | post-runtime-stable-example-sweep | `.tmp/slate-v2`: stable example Chromium sweep; focused Firefox/WebKit selection/input grep. | Chromium passed 199 with 5 expected skips; Firefox/WebKit passed 169 with 51 expected skips. | done |
| 18 | add | slate-browser-promotion-audit | Cross-editor benchmark and huge-doc tests now contain mounted-text/native-caret helper idioms. | Decide if a reusable `slate-browser` helper is the right owner before more copy-paste. | pending |
| 19 | update | slate-browser-promotion-audit, slate-browser-promotion | `.tmp/slate-v2`: added `setNativeDOMSelection` to the Slate React browser handle, added `editor.dom.waitForTextPath`, `collapseAtTextPath`, and `waitForPendingNativeTextInputRepair` to `slate-browser/playwright`, routed huge-doc tests and cross-editor benchmark through the promoted path. Focused package typechecks passed, `slate-browser test:core` passed, focused huge-doc Chromium rows passed after building stale package output, focused cross-editor benchmark passed, `bun check` passed. | Repeated proof idiom had a clear reusable owner. First browser run failed because Playwright imported stale `slate-browser` dist; build requirement logged as workflow slowdown. | done |
| 19 | add | benchmark-diagnostics-staged-native-surface | Prior full huge-doc benchmark passed strict budgets while staged native-surface diagnostic rows timed out around 10s. | Passing aggregate budgets should not hide misleading diagnostics. | pending |
| 20 | update | benchmark-diagnostics-staged-native-surface | `.tmp/slate-v2`: patched `scripts/benchmarks/browser/react/huge-document-browser-trace.mjs` so staged is counted as bounded. Focused staged trace passed with `timedOut=0`; full huge-doc benchmark passed with strict/diagnostic failures 0; `bun check` passed. | The timeout was a benchmark readiness classifier bug, not a product runtime failure. | done |
| 20 | add | slate-browser-readme-dx-sync | `packages/slate-browser/README.md` does not mention the new `editor.dom` namespace. | API/DX docs should describe the current clean API, not force agents to infer helpers from source. | pending |
| 21 | update | slate-browser-readme-dx-sync | `.tmp/slate-v2`: updated `packages/slate-browser/README.md`; `bun lint:fix`; `bun --filter slate-browser typecheck`; `bun --filter slate-browser test:core`; source/docs `rg` audit. | New helper API is now discoverable from the package README without changelog prose. | done |
| 21 | add | huge-document-select-then-type-hotspot | Full huge-doc benchmark after loop 20 reports selectThenTypeToPaint p95 ~241-272ms on auto/staged/virtualized lanes, while ordinary type-to-paint remains ~32ms. | A perf benchmark should not hide an unbudgeted follow-up typing latency metric if it reflects user-visible behavior. | pending |
| 22 | update | huge-document-select-then-type-hotspot | `.tmp/slate-v2`: renamed `selectThenTypeToPaintMs` to `interactionSequenceToPaintMs` in browser trace scripts and full benchmark summary. Focused virtualized trace passed and printed the new metric name; full benchmark smoke passed; `bun check` passed. | It was benchmark padding from the whole scripted interaction sequence, not true typing latency. | done |
| 22 | add | current-tree-coherence-audit | Current kept packets now touch runtime selection/perf, benchmark wrappers, slate-browser helpers, README/docs, and workflow rules. | Audit before more broad work so no dirty experiment or docs/API mismatch survives by accident. | pending |
| 23 | update | current-tree-coherence-audit | Diff audit found stale ledger rows, a shadow-root selection gap in promoted `setNativeDOMSelection`, and a repeated stale `slate-browser` build-output slowdown. | Repaired the helper with local `Document | ShadowRoot` selection and realm-safe `selectionchange`, added a shadow-DOM native-caret browser row, and patched `slate-automation` source rule to require `bun --filter ./packages/slate-browser build` before browser proofs after helper/source changes. | done |
| 23 | add | cross-browser-shadow-dom-helper-proof | New DOM helper row passed Chromium only; shadow-root selection is browser-sensitive. | Run the focused row in Firefox/WebKit before the next broad packet. | pending |
| 24 | update | cross-browser-shadow-dom-helper-proof | `.tmp/slate-v2`: focused Firefox/WebKit shadow-DOM helper row failed first because WebKit drops programmatic native ranges inside nested shadow DOM; direct WebKit probe confirmed `rangeCount: 0` after `document.getSelection().addRange(range)`. | Kept Firefox proof, added explicit WebKit skip reason, reran with `bun lint:fix`, `slate-react`/`slate-browser` typechecks, `slate-browser test:core`, `slate-browser build`, and focused Firefox/WebKit row: 1 passed, 1 skipped. | done |
| 24 | add | post-shadow-helper-fast-check | Loop 23-24 touched runtime/helper/test/rule surfaces after the last full fast check. | Need a fresh `bun check` before broadening. | pending |
| 25 | update | post-shadow-helper-fast-check | `.tmp/slate-v2`: `bun check`. | Passed lint, package/site/root typecheck, Bun package tests, slate-layout tests, and Slate React Vitest 57 files / 685 tests. | done |
| 25 | add | autoreview-current-tree-diff | Non-trivial kept diff spans runtime/helper/test/benchmark/docs/workflow surfaces. | Structured review before more broad work can catch coherence issues while the diff is still understandable. | pending |
| 26 | update | autoreview-current-tree-diff | Local autoreview reported two findings: staged DOM-present classifier and native scrollbar left-gutter detection. Source inspection proved the staged finding had a false full-DOM premise but a real stale label/classifier risk; the left-gutter finding was valid. | Repair the true owners instead of blindly satisfying the review wording. | in_progress |
| 27 | update | autoreview-current-tree-diff | `.tmp/slate-v2`: focused left native-scrollbar row passed after runtime/test proof repair; focused staged trace reports both staged surfaces bounded, complete 0, timedOut 0. | Actionable findings closed by direct proof. | done |
| 28 | add | full-huge-document-benchmark-recheck | Benchmark classifier changed after the last full run. | Full wrapper must prove no hidden strict/diagnostic budget regression. | pending |
| 29 | update | full-huge-document-benchmark-recheck | `.tmp/slate-v2`: `bun run bench:react:huge-document:full:local`. | Full benchmark passed with budget failures 0 and diagnostic failures 0; staged diagnostic rows are bounded and timedOut 0. | done |
| 29 | add | post-left-scrollbar-full-huge-document-browser-sweep | `use-virtualized-root-plan.ts` changed runtime scrollbar detection. | Full huge-document browser suite should run after focused row and benchmark. | pending |
| 30 | update | post-left-scrollbar-full-huge-document-browser-sweep | `.tmp/slate-v2`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium`. | Full Chromium suite passed 28/28. | done |
| 30 | add | post-left-scrollbar-cross-browser-huge-document-focus | Runtime scrollbar/native input path is browser-facing. | Run Firefox/WebKit focused rows before moving out of huge-document behavior. | pending |
| 31 | update | post-left-scrollbar-cross-browser-huge-document-focus | First Firefox/WebKit focused band failed the virtualized 5k typing row with browser-specific fixed-offset selection mismatches after native typing/undo. | Repaired the oracle to require text correctness plus collapsed model/native DOM selection agreement with tight offset ranges. | done |
| 31 | add | slate-browser-selection-agreement-helper-promotion | The repaired oracle is reusable browser proof infrastructure. | Promote to `slate-browser` instead of leaving local proof soup. | pending |
| 32 | update | slate-browser-selection-agreement-helper-promotion | `.tmp/slate-v2`: `bun --filter slate-browser typecheck`; `bun --filter slate-browser test:core`; `bun --filter ./packages/slate-browser build`; exact failed Firefox/WebKit row; focused Firefox/WebKit band; full Chromium huge-doc suite. | Helper API, README, and huge-doc proof passed. | done |
| 32 | add | post-selection-helper-fast-check | Helper API/docs/test changed after last `bun check`. | Run fast check before next packet. | pending |
| 33 | update | post-selection-helper-fast-check | `.tmp/slate-v2`: `bun check`. | Passed lint, package/site/root typecheck, Bun package tests, slate-layout tests, and Slate React Vitest 57 files / 685 tests. | done |
| 33 | add | benchmark-staged-dom-present-key-hard-cut | The stale key still says `stagedDomPresent` after label repair. | Hard-cut the key to prevent future false full-DOM assumptions. | pending |
| 34 | update | benchmark-staged-dom-present-key-hard-cut | `.tmp/slate-v2`: source key renamed to `stagedActiveDOMGroup`; focused trace passed; full benchmark passed; source grep clean; `bun test ./packages/slate/test/core-benchmark-scripts-contract.ts` passed. | No compatibility alias kept; stale key removed. | done |
| 34 | add | post-benchmark-key-hard-cut-fast-check | Benchmark scripts and contract test changed after last fast check. | Run fast check. | pending |
| 35 | update | post-benchmark-key-hard-cut-fast-check | `.tmp/slate-v2`: `bun check`. | Passed lint, package/site/root typecheck, Bun package tests, slate-layout tests, and Slate React Vitest 57 files / 685 tests. | done |
| 35 | add | staged-native-surface-docs-terminology-audit | Staged/full-DOM terminology had produced one false benchmark premise. | Audit current docs/tests for the same phrase. | pending |
| 36 | update | staged-native-surface-docs-terminology-audit | `.tmp/slate-v2`: patched current docs/test labels; scoped grep no current `DOM-present` references; Slate React Vitest passed; `bun check` passed. | Terminology cleanup kept. | done |
| 36 | add | post-huge-doc-stable-example-sweep | Huge-doc has received many packets. | Run fresh stable example browser proof before another perf/API packet. | pending |
| 37 | update | post-huge-doc-stable-example-sweep | `.tmp/slate-v2`: Chromium stable example sweep over richtext, plaintext, markdown shortcuts, editable voids, placeholder, hidden content, and DOM coverage. | Broad stable Chromium proof passed after huge-doc/runtime/oracle packets. | done: 199 passed, 5 expected skips |
| 37 | add | post-huge-doc-cross-browser-stable-selection-band | Chromium stable proof is green, but native editing engines diverge on selection/input. | Run focused Firefox/WebKit selection/input band before another API/perf packet. | pending |
| 38 | update | post-huge-doc-cross-browser-stable-selection-band | `.tmp/slate-v2`: focused Firefox/WebKit stable example band over selection, caret, arrows, select-all, undo, paste, scroll, IME/composition, right-margin, triple click, and Shift rows. | Cross-browser native-editing proof passed after the huge-doc and browser-helper packets. | done: 157 passed, 45 expected skips |
| 38 | add | public-api-dx-alias-audit | User taste is clean current API/docs with no fake aliases or stale compatibility clutter. | Audit current Slate v2 packages/docs for deprecated/compat/alias/legacy/changelog prose and patch only true current-source rot. | pending |
| 39 | update | public-api-dx-alias-audit | `.tmp/slate-v2`: cut stale `slate-browser` first-legacy public names with no alias; removed old `slate-dom` UA legacy flags and public `IS_FIREFOX_LEGACY`; rewrote environment contract around `InputEvent.prototype.getTargetRanges`; cleaned benchmark README compatibility wording; grep for removed names clean. | Current API/docs should describe only what is current. | done: focused `slate-dom`/`slate-browser` proof and `bun check` passed |
| 39 | add | post-api-dx-browser-input-smoke | `HAS_BEFORE_INPUT_SUPPORT` is browser-facing after the hard cut. | Run focused browser input rows across Chromium/Firefox/WebKit. | pending |
| 40 | update | post-api-dx-browser-input-smoke | `.tmp/slate-v2`: focused Chromium/Firefox/WebKit Playwright rows for native insert, IME/composition, paste, caret repair, placeholder selection, and undo. | Current engines still exercise native input correctly after the UA hard cut. | done: 18 passed, 6 expected skips |
| 40 | add | private-alpha-full-browser-sweep | Focused behavior/API gates are green and timed runtime remains. | Run the local full browser gate before choosing the next optimization/review packet. | pending |
| 41 | update | private-alpha-full-browser-sweep | `.tmp/slate-v2`: `bun check:full` passed `bun check`, release-discipline/proof/mobile/soak guards, then failed in Chromium virtualized pagination rows. | Full gate found a coherent owner cluster; continuing the whole suite would waste time after a failed gate. | failed-owner-found, killed after cluster capture |
| 41 | add | virtualized-pagination-projection-repair | Failing rows include projected block offsets, first two virtualized block clicks, selected text alignment, virtualized double-click, margin drag/click selection, split paragraph editing, rows=800 journey, and perf envelope. | Reproduce with retries off and patch/quarantine exact owner. | pending |
| 42 | update | virtualized-pagination-projection-repair | Focused probe showed projected blocks were visible but page-virtualized row groups and wrappers stole hits; rows from spread pages share vertical starts by design, so row hitboxes need horizontal bounds. | Patched `slate-layout` to expose page-content bounds per top-level item and `slate-react` virtual rows to use positioned rows plus bounded static hitboxes. Focused 10-row Chromium cluster and touched package typechecks passed. | done |
| 42 | add | private-alpha-full-browser-sweep-resume | The failed owner cluster is repaired and focused proof is green. | Resume broader pagination/full-browser proof instead of stopping at the focused fix. | pending |
| 42 | update | private-alpha-full-browser-sweep-resume | Full Chromium `pagination.test.ts` passed 47/47 against the rebuilt server. | Broader pagination proof did not expose a new owner cluster. | in-progress; resume full private-alpha browser proof |
| 43 | add | synced-blocks-child-root-shift-selection-race | Resumed `check:full`: fast gate, release discipline, slate-browser proof, mobile claim-width proof, and persistent browser soak passed, then Chromium timed out one synced-blocks Shift+Arrow projection row across retries. A cold probe reproduced the row. | Diagnose as a real race: second Shift+ArrowLeft can arrive before parent/child selectionchange import catches the child-root native selection. | pending |
| 44 | update | synced-blocks-child-root-shift-selection-race, private-alpha-full-browser-sweep-resume | Patched the internal-target keydown bridge to read the nested editable live DOM selection before stale runtime selection; added unit coverage for imported child selection and stale-import/native-DOM race. | Focused unit pair passed, keyboard/content-root contract files passed 56/56, `slate-react` typecheck passed, rebuilt `slate-react` + static site, cold probe passed 20/20, exact browser row passed 10/10 retries off, full synced-blocks Chromium file passed 45/45, all-project grep produced 3 Chromium passes and 9 expected project skips. | keep packet; resume broader integration stage |
| 45 | add | huge-document-virtualized-flake-isolation | `bun check:full` completed but reported two retry-green virtualized huge-document rows: Chromium undo left `CXXondico...` instead of restoring original text, and Firefox middle-block typing reached the right text but stale selection offset 10 instead of 11 twice before passing retry #2. | Retry-green is not acceptable proof for the known huge-document lane; isolate with retries disabled before closing the full-sweep checkpoint. | in_progress |
| 46 | update | huge-document-virtualized-flake-isolation | Exact retries-off repeats reproduced the owner: Chromium virtualized 5k row failed 4/20 before repair with stale native/model caret and undo drift; Firefox exact row failed 3/10 before repair with model/native offset 10 vs expected 11. | Kept stricter virtualized native text insert ownership, delayed virtualized caret rechecks, resolved DOM-selection oracle diagnostics, and focused unit coverage. Final retries-off proof passed: Chromium row 20/20, Firefox row 10/10. | done |
| 46 | add | post-virtualized-flake-broader-huge-document-proof | Runtime and `slate-browser` oracle code changed to fix the focused flake. | Focused rows are green, but full huge-document behavior must be replayed before moving to another lane. | in_progress |
| 47 | update | post-virtualized-flake-broader-huge-document-proof | Cross-browser repeat after scheduler cleanup failed again: Chromium left `CXXondico...` after undo twice; Firefox left model selection at offset 10 twice. Temporary probe showed the text bug was history batching, not visual timing. | Native text input history metadata now explicitly returns `merge` for rapid follow-up native text repairs and `push` only after the merge interval. New contract test added. Final proof: focused history/repair/input tests 50/50, Chromium/Firefox exact repeat 40/40, full Chromium huge-document 28/28, `bun check` passed 58 Slate React files / 694 tests. | done |
| 47 | add | private-alpha-full-browser-sweep-rerun | Known owner cluster from the previous full gate is repaired with strict repeat proof. | Rerun `bun check:full`; minimum runtime has elapsed, so this is queued for the next run instead of starting a new long gate in handoff. | queued-stopping-checkpoint |
| 50 | add | virtualized-native-text-beforeinput-boundary | Broader virtualized 5k proof still split rapid same-burst typing as `Cac` / `defb...`; pending native text repair was allowed to survive into the next `insertText` and then stale-repair the live caret. | Same-burst `insertText` now flushes pending native text repair before the new beforeinput. Temp probe confirmed `Cabc` / `def...`, then was deleted. Exact 5k row passed 10/10 and post-build smoke; broader virtualized cluster passed 5/5; original native-caret row passed 20/20; full Chromium huge-document passed 28/28; Firefox/WebKit focused 5k row passed; `bun check`, package builds, and `bun build:next` passed. | done |
| 35 | update | post-benchmark-key-hard-cut-fast-check | `.tmp/slate-v2`: `bun check`. | Passed lint, package/site/root typecheck, Bun package tests, slate-layout tests, and Slate React Vitest 57 files / 685 tests. | done |
| 35 | add | staged-native-surface-docs-terminology-audit | Code had stale `DOM-present` terminology. | Audit current docs/API wording so docs do not revive the false premise. | pending |

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
  user's latest request, `slate-north-star`, and current source evidence outrank
  stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | `8 hours` copied as minimum runtime; final handoff/stop/checkpoint requirements copied from skill into plan rows. |
| `slate-automation` source rule read | yes | User provided full invoked skill body; plan follows timed-mode contract. |
| `slate-north-star` read as checkpoint zero | yes | `.agents/skills/slate-north-star/SKILL.md` read 2026-06-07. |
| Active goal checked or created | yes | Codex goal created: timed 8h Slate v2 automation. |
| Invocation mode and timebox recorded | yes | Timed mode, 8h minimum, target 2026-06-07 21:51:36 CEST. |
| Dynamic checkpoint policy accepted | yes | Supervisor may add/update/split/merge/retire/reprioritize/reopen rows each loop. |
| Source of truth and allowed workspaces recorded | yes | Boundaries section filled. |
| Output budget strategy recorded | yes | Use focused reads, capped output, artifact broad scans, no giant raw corpus dumps. |
| Private-alpha release/PR boundary recorded | yes | No release/publish/changeset/PR/branch unless explicitly requested later. |
| Browser proof strategy recorded | yes | Use `slate-browser`/Playwright, fresh server/build when package exports change, screenshot/geometry for visual issues. |
| Package/API proof strategy recorded | yes | Package typechecks/tests/source audits per touched package. |
| Mobile/raw-device claim-width policy recorded | yes | Raw-device proof only if actual raw-device lane exists; viewport proof stays scoped. |
| Skill repair authority and source-rule boundary recorded | yes | Source-rule patches only, `pnpm install`, mirror audit, agent-native review. |

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
| Named verification threshold | done | Run the proof commands/artifacts named in this plan | Loop 50 focused/repeat/full huge-document, cross-browser focused, package, build, and `bun check` proof recorded above. |
| Dynamic checkpoint reconciliation | done | Prove the plan was updated from evidence and not frozen to the initial seed | Checkpoint rows reconciled through loop 50; stale seed rows merged and the final full-browser gate is queued as a stopping checkpoint. |
| Workspace authority proof | done | Record cwd/tool for each Slate v2, parent-docs, skill, browser, package, or benchmark proof | Packet ledger records `.tmp/slate-v2` versus parent `.agents`/plan ownership. |
| Behavior gates | done | Run focused stable behavior proof or record scoped defer rows | Huge-document, stable examples, cross-browser selection band, mobile scoped rows, and shadow-DOM focused row passed. |
| Visual/native selection proof | done | Record Browser/Playwright/native-selection evidence or scoped blocker | Huge-document visual/geometry rows and shadow-DOM native-caret helper proof passed. |
| Missing oracle repair | done | Add/verify/revert/quarantine oracle packets or record owner defer | Native-caret/materialization, typed-count delta, staged native-surface, interaction-sequence metric, overscan-zero typing, scrollbar, and shadow-DOM helper oracles kept for current evidence. |
| `slate-browser` promotion | done | Add/verify helper/API or record queue/defer reason | Promoted native DOM path/materialization helpers in loop 19 with package, browser, benchmark, and `bun check` proof. |
| Benchmark diagnostic honesty | done | Ensure staged/full-DOM diagnostics do not hide known false timeouts | Staged native-surface classifier repaired in loop 20; full benchmark strict and diagnostic failures 0. |
| Mobile/raw-device claim width | done | Run raw-device proof or record that only scoped viewport/browser proof is available | Scoped mobile proof passed; raw Android/iOS device proof not claimed. |
| Huge-document correctness smoke | done | Run focused huge-document behavior smoke or record owner defer | Focused and full huge-document browser/benchmark packets passed for current evidence. |
| Package/API proof | done | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | `slate-browser` and `slate-react` focused typechecks/tests passed; fresh loop 25 `bun check` passed after loop 23-24 changes. |
| Skill/rule sync | done | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | `pnpm install` synced generated `slate-automation` mirror; source/mirror grep passed. |
| Changed list / review attention / stopping checkpoints | done | Fill final handoff ledgers from current packet evidence | Changed list, needs-your-attention, and `full-browser-gate` stopping checkpoint are filled above. |
| Final lint/check | done | Run scoped lint/check or record why no code changed | Loop 50 `bun check` passed after same-burst beforeinput boundary repair; final package builds, `bun build:next`, and post-build focused browser smoke passed. |
| Workflow slowdown review | done | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Command-directory pitfall and stale `slate-browser` output pitfall repaired in source rule and generated mirror. |
| Agent-native review for agent/tooling changes | done | Load `agent-native-reviewer` and close accepted findings, or N/A | `agent-native-reviewer` loaded for `.agents` command-rule changes; no parity/action finding for command guidance. |
| Autoreview for non-trivial implementation changes | done | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | Local autoreview found two findings. Actionable ownership was repaired with focused Playwright/benchmark proof and `bun check`; clean rerun stalled for 5m and returned empty, logged as workflow slowdown. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-07-slate-v2-eight-hour-automation.md` | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | done | `slate-north-star`, `agent-start`, scoreboard, release claim, prompt `8 hours`; plan rows filled. | status |
| Status and current-tree closure | done | `bun check` passed after `bun lint:fix` fixed 4 formatting/import-order files. | gap scan |
| Gap scan and scenario matrix | done | First evidence-driven owner: huge-document browser proof; next stable examples/API/docs by result. | behavior proof |
| Behavior proof | done | Huge-document focused browser proof green; stable Chromium example sweep green; targeted Firefox/WebKit selection sweep green. | visual/native proof |
| Oracle repair | done | Virtualized native caret repair, resolved DOM-selection diagnostics, cross-editor native-caret setup, staged native-surface classifier, scrollbar, overscan-zero, shadow-DOM, and synced child-root oracles kept. | reopen only on new gap |
| Visual/native proof | done | Stable examples include native/model/caret/geometry rows across Chromium, Firefox, WebKit; huge-doc visual/geometry rows passed. | slate-browser promotion |
| slate-browser promotion | done | Browser handle + Playwright helper promotion kept; focused typechecks, `slate-browser test:core`, huge-doc focused browser rows, focused cross-editor benchmark, and `bun check` passed. | benchmark hygiene |
| Mobile/raw-device claim width | done | `bun test:mobile-device-proof` passed scoped proxy/semantic claim-width guard; mobile Playwright semantic/touch rows passed. Raw Android/iOS device proof not claimed. | huge-document smoke |
| Huge-document correctness smoke | done | Focused repeat rows, broader virtualized cluster, full Chromium huge-document 28/28, and Firefox/WebKit focused 5k proof passed after loop 50. | full private-alpha browser gate queued |
| Perf/API/docs/skill packets as needed | done | Huge-doc full benchmark passed after metric-owner repair; API/docs hygiene and skill repairs completed earlier in the run. | reopen on new evidence |
| Consolidation and review | done | Changed list, slowdown log, needs-attention, and stopping checkpoint filled. | final response |
| Final handoff and goal-plan check | done | Handoff contract filled; checker run next. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| current tree | all packages | package/type/test graph | fast closure | lint/type/unit/package tests | `bun check` passed after loop 50 edits |
| huge-document | 5k/10k paragraphs | staged/virtualized | type, Enter, select-all, undo/redo, Shift+Arrow, scrollbar | model, native, visual row geometry, perf timings | focused repeat rows, broader virtualized cluster, and full Chromium 28/28 passed after loop 50 |
| stable examples | richtext/plaintext/markdown/editable voids/hidden content | Chromium first, Firefox/WebKit if failure history or claim width requires | click/type/paste/undo/select/nav | model/native/visible text/console | passed after huge-doc packets through loop 40; reopen if broader proof finds generic runtime issue |
| API/DX docs | slate/slate-react/slate-history docs/examples | source docs | grep/source audit | latest API only, no aliases/changelog prose | passed focused audit; reopen on new public API/helper change that needs docs |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| current-tree-closure-001 | 1 | slate-automation | Fast current-tree gate may expose broken lint/type/unit fallout from recent broad selection/runtime work. | `.tmp/slate-v2`: `bun check`; `bun lint:fix`; `bun check` | First `bun check` failed formatting/import-order only; formatter fixed 4 files; rerun passed lint, package/site/root typecheck, Bun tests, Slate React Vitest 57 files / 685 tests. | keep | huge-document-browser-proof |
| huge-document-browser-proof-002 | 2 | slate-ar-stabilize / Playwright | Recent broad selection/runtime work needs real staged/virtualized browser proof before perf claims. | `.tmp/slate-v2`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "virtualized (browser select-all|5k typing|rows visually coherent|rows buffered|repeated Shift)|exposes staged DOM strategy controls|keeps staged middle-block editing"` | Fresh managed build/server; 7 Chromium rows passed in 14.7s. | keep | stable-example-sweep |
| stable-example-sweep-003 | 3 | slate-ar-stabilize / Playwright | Core editor examples may expose stable behavior regressions not covered by huge-document. | `.tmp/slate-v2`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/placeholder.test.ts playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium` | Managed browser proof: 199 passed, 5 expected skips in 2.1m. Covered richtext, plaintext, markdown shortcuts, editable voids, custom placeholder, hidden content blocks, and DOM coverage boundaries. | keep | cross-browser-selection-sweep |
| cross-browser-selection-sweep-004 | 4 | slate-ar-stabilize / Playwright | High-risk native selection/editing rows may diverge in Firefox/WebKit despite Chromium passing. | `.tmp/slate-v2`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright ... --project=firefox --project=webkit --grep "selection|caret|Arrow|select-all|undo|paste|scroll|IME|composition|right-margin|triple click|Shift"` | Managed browser proof: 157 passed, 45 expected skips in 2.3m across Firefox/WebKit. Covered native selection, caret, Arrow, select-all, undo, paste, scroll, IME/composition where engine-supported. | keep | huge-document-visual-screenshot |
| huge-document-visual-screenshot-005 | 5 | slate-ar-stabilize / Playwright | Huge-document visible bugs can evade model-only assertions; staged and virtualized need screenshot/geometry proof before perf work. | `.tmp/slate-v2`: `bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "keeps staged repeated Shift\\+ArrowDown aligned with full DOM|keeps downward drag selection autoscroll|keeps blank-gap drag selection"` and `--grep "visually projected"` | 4 focused Chromium rows passed: staged 10k Shift+Down visually projected/bounded, staged/full-DOM vertical parity, virtualized downward drag autoscroll direction, blank-gap drag selection no document-start regression. | keep | perf-honesty-baseline |
| perf-honesty-baseline-006 | 6 | slate-ar-perf | Huge-doc metrics may still be weak even after behavior proof; measure before any optimization. | `.tmp/slate-v2`: `bun run bench:react:huge-document:full:local` before/after benchmark patch. | Before: command success but 1 budget failure, `virtualizedDomNodesP95=1432` vs budget 400, max ratio 3.58. After benchmark-honesty patch: `budgetFailureCount=0`, `maxBudgetRatio=0.79`, diagnostic max ratio 0.95, `virtualizedDomNodesP95=1432`, strict `virtualizedEditorElementsP95=203`, `virtualizedTypeToPaintP95Ms=32.4`, `virtualizedSelectionReadyP95Ms=73.9`, `legacyCompareWorstP95Ratio=0.85`. | keep | post-benchmark-hygiene |
| post-benchmark-hygiene-007 | 7 | slate-automation | Changed benchmark script may need formatting/check proof. | `.tmp/slate-v2`: `bun lint:fix`; `bun check` | Formatter made no changes; `bun check` passed. | keep | api-docs-hygiene-audit |
| api-docs-hygiene-audit-008 | 8 | slate-automation | Public/internal docs or package surfaces may still contain stale compat/alias/migration wording after recent hard cuts. | Scoped `rg` audit, focused reads, `bun test:vitest -- test/slate-runtime-provider-contract.test.tsx`, `bun test ./packages/slate-dom/test/bridge.ts ./packages/slate-dom/test/dom-coverage.ts ./packages/slate-dom/test/public-surface-contract.ts`, `bun lint:fix && bun check`. | Patched stale wording only; no safe runtime/API deletion in this packet. Verification passed, including full fast check. | keep | mobile-claim-width-proof |
| command-pitfall-skill-repair-009 | 8 | slate-automation | The failed slate-dom directory command is a reusable automation slowdown. | Parent: patched `.agents/rules/slate-automation.mdc`; `pnpm install`; mirror audit `rg`; agent-native review. | Generated `.agents/skills/slate-automation/SKILL.md` contains the new rule; no agent-native parity finding. | keep | mobile-claim-width-proof |
| mobile-claim-width-proof-010 | 9 | slate-automation | Local proof can cover semantic/mobile viewport handles, but raw-device proof needs a real device lane. | `.tmp/slate-v2`: `bun test:mobile-device-proof`; `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts playwright/integration/examples/huge-document.test.ts --project=mobile --grep "generated mobile semantic editing|mobile touch near hidden|keeps virtualized browser select-all|keeps blank-gap drag selection"` | Scoped release proof passed; mobile Playwright 2 passed / 2 expected skips. Raw-device proof remains unavailable/unclaimed. | keep | cross-editor-huge-document-benchmark |
| cross-editor-huge-document-benchmark-011 | 10 | slate-ar-perf | Compare Slate v2 huge-doc lanes against sibling Slate/ProseMirror/Lexical after local budgets are honest. | `.tmp/slate-v2`: `bun run bench:react:huge-document:cross-editor:local` | Passed and wrote `tmp/slate-react-huge-document-cross-editor-benchmark*.json`. Slate virtualized wins typing but loses Shift+Down command/paint against ProseMirror/Lexical. | keep | virtualized-shift-down-hotspot |
| virtualized-shift-down-hotspot-012 | 11-15 | slate-ar-perf / slate-patch | Evidence-backed huge-doc perf gap: virtualized vertical Shift+Down fanout and permanent overscan materialization tax. | `.tmp/slate-v2`: patched `packages/slate-react/src/components/slate.tsx`, `packages/slate/src/core/public-state.ts`, `packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts`, `packages/slate-react/src/editable/runtime-before-input-events.ts`, benchmark/browser oracles. Commands: focused Playwright rows, scoped 5-iteration benchmark, 20-iteration benchmark, full cross-editor benchmark, full huge-doc benchmark, `bun lint:fix && bun check`. | Focused browser rows passed after formatter: scrollbar buffer, overscan-zero burst typing, repeated Shift. 20-iteration virtualized benchmark passed: middle ShiftDown p95 22.4ms / command 6.3ms / repeated 22.8ms / ShiftUp 22ms / DOM 155. Full huge-doc benchmark passed with budget failures 0. | keep | post-overscan-huge-document-browser-sweep |
| cross-editor-benchmark-oracle-repair-013 | 12-15 | slate-ar-perf | Cross-editor harness had weak native-caret setup and exact typed-count assertion; 20-iteration run found drift before runtime confidence. | `scripts/benchmarks/browser/react/huge-document-cross-editor.mjs` | 20-iteration virtualized benchmark failed before the final harness repair and passed after it. Debug state now captures active element, block text, input state, mounted text, native/model/view selection. | keep | use as oracle for later huge-doc packets |
| virtualized-scrollbar-overscan-budget-014 | 13-15 | slate-patch / Playwright | Permanent 96-row virtualized overscan fixed scrollbar drag but made ordinary virtualized selection/type pay a large DOM/render tax. | `packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts`; `playwright/integration/examples/huge-document.test.ts` | Browser scrollbar-drag row still passed with pointer-gutter activation. DOM p95 improved: scoped virtualized middle 1307 -> 155; full benchmark virtualized document DOM 1432-class -> 304, editor elements 203 -> 15. | keep | full huge-document browser sweep |
| post-overscan-huge-document-browser-sweep-015 | 16 | slate-ar-stabilize / Playwright | Conditional overscan changes materialization behavior beyond focused rows. | `.tmp/slate-v2`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium` | Full Chromium huge-document suite passed 28/28. | keep | Firefox/WebKit huge-document focus |
| post-overscan-cross-browser-huge-document-focus-016 | 17 | slate-ar-stabilize / Playwright | Chromium green is not enough after virtualized materialization changes. | `.tmp/slate-v2`: focused Firefox/WebKit huge-document grep over staged editing, virtualized typing/materialization/scroll rows | Passed where applicable: 8 passed, 18 explicit Chromium-only skips. | keep | stable runtime sweep |
| post-runtime-stable-example-sweep-017 | 18 | slate-ar-stabilize / Playwright | Selection-impact and beforeinput changes are generic runtime changes. | `.tmp/slate-v2`: stable example Chromium sweep plus focused Firefox/WebKit selection/input grep | Chromium passed 199/204 with 5 expected skips; Firefox/WebKit passed 169 with 51 expected skips. | keep | slate-browser promotion audit |
| slate-browser-promotion-018 | 19 | slate-browser / slate-automation | Repeated mounted-text/native-caret proof code belongs in a reusable helper. | Added `SlateBrowserHandle.setNativeDOMSelection`, `editor.dom.waitForTextPath`, `collapseAtTextPath`, `waitForPendingNativeTextInputRepair`; built stale `slate-browser` output before rerun. | `slate-browser`/`slate-react` typechecks passed, `slate-browser test:core` passed, focused huge-doc browser rows passed, focused cross-editor benchmark passed, `bun check` passed. | keep | benchmark diagnostic repair |
| staged-native-surface-diagnostic-019 | 20 | slate-ar-perf | Full benchmark strict budgets passed while staged native-surface diagnostic timed out around 10s. | `scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`; focused staged trace; full benchmark | Staged classifier fixed as bounded: timedOut 10 -> 0, p95 ~18-20ms; full benchmark strict/diagnostic failures 0; `bun check` passed. | keep | README DX sync |
| slate-browser-readme-dx-sync-020 | 21 | slate-browser / docs | New helper namespace was not discoverable from README. | `packages/slate-browser/README.md`; `bun lint:fix`; `bun --filter slate-browser typecheck`; `bun --filter slate-browser test:core`; `rg` source/docs audit | README documents `editor.dom.waitForTextPath` and `collapseAtTextPath`; focused package proof passed. | keep | benchmark metric naming audit |
| interaction-sequence-metric-rename-021 | 22 | slate-ar-perf | `selectThenTypeToPaintMs` looked like typing latency but measured the whole scripted interaction sequence. | Renamed metric in browser trace scripts and full benchmark summary; focused virtualized trace; full smoke; `bun check` | New `interactionSequenceToPaintMs` name prints; true `typeToPaintMs` remains ~32ms; full smoke and fast check passed. | keep | current-tree coherence audit |
| shadow-dom-native-helper-repair-022 | 23 | slate-browser / slate-react | Coherence audit found `setNativeDOMSelection` bypassed the local shadow-root selection root. | `packages/slate-react/src/editable/browser-handle.ts`; `playwright/integration/examples/shadow-dom.test.ts`; `bun lint:fix`; `bun --filter slate-react typecheck`; focused Chromium shadow-DOM row | New helper uses `Document | ShadowRoot` selection and realm-safe `selectionchange`; focused row passed. | keep | cross-browser shadow-DOM helper proof |
| stale-slate-browser-dist-skill-repair-023 | 23 | slate-automation | First helper browser proof failed because Playwright imported stale generated `slate-browser` output. | Parent `.agents/rules/slate-automation.mdc`; generated `.agents/skills/slate-automation/SKILL.md`; `pnpm install`; mirror grep | Source and mirror now require `bun --filter ./packages/slate-browser build` before browser proofs after helper/source changes. | keep | cross-browser shadow-DOM helper proof |
| cross-browser-shadow-dom-helper-proof-024 | 24 | slate-ar-stabilize / Playwright | Shadow-root native selection is browser-sensitive; prove helper row beyond Chromium. | `.tmp/slate-v2`: direct WebKit probe; focused Firefox/WebKit row; `bun lint:fix`; `bun --filter slate-react typecheck`; `bun --filter slate-browser typecheck`; `bun --filter slate-browser test:core`; `bun --filter ./packages/slate-browser build` | Firefox passed. WebKit direct probe shows programmatic native range inside nested shadow DOM leaves `rangeCount: 0`, so test skips WebKit with explicit reason. Rerun passed: 1 passed, 1 skipped. | keep | fast current-tree check |
| post-shadow-helper-fast-check-025 | 25 | slate-automation | Helper/test/rule edits need a fresh fast check before review or broader work. | `.tmp/slate-v2`: `bun check` | Passed lint, package/site/root typecheck, Bun package tests, slate-layout tests, and Slate React Vitest 57 files / 685 tests. | keep | autoreview current-tree diff |
| autoreview-current-tree-diff-026 | 26-28 | autoreview / slate-automation | Local review should catch real regressions in the broad runtime/helper/benchmark/test diff. | `.tmp/slate-v2`: local `autoreview`; patched `use-virtualized-root-plan.ts`, `huge-document.test.ts`, `huge-document-browser-trace.mjs`, `huge-document-staged-keyboard-commands.mjs`; focused scrollbar row; focused staged trace; `bun lint:fix`; `bun --filter slate-react typecheck`; `bun check` | Left native-scrollbar gutter detection now handles left scrollbars/RTL overlay cases and the Chromium proof passes. Staged benchmark no longer treats staged as full DOM; both staged surfaces classify as bounded with timedOut 0. Review rerun stalled and returned empty after 5m, so direct proof is the closing evidence. | keep | full huge-document benchmark recheck |
| full-huge-document-benchmark-recheck-027 | 29 | slate-ar-perf | Benchmark classifier changed after the last full benchmark. | `.tmp/slate-v2`: `bun run bench:react:huge-document:full:local` | Passed. `react_huge_doc_full_budget_failure_count=0`, `react_huge_doc_full_diagnostic_budget_failure_count=0`, staged diagnostic timedOut 0, `react_huge_doc_full_virtualized_type_to_paint_p95_ms=32.9`, `react_huge_doc_full_virtualized_dom_nodes_p95=304`, `react_huge_doc_full_virtualized_editor_elements_p95=15`. | keep | full huge-document browser sweep |
| post-left-scrollbar-full-huge-document-browser-sweep-028 | 30 | slate-ar-stabilize / Playwright | Runtime scrollbar gutter detection changed after last full browser suite. | `.tmp/slate-v2`: full Chromium `huge-document.test.ts` | Passed 28/28, including staged Shift+Arrow, select-all delete, virtualized typing/undo/redo, repeated Shift+Arrow, internal scrollbar jumps, native scrollbar drag, drag autoscroll, blank-gap drag, and manual scroll-away typing. | keep | cross-browser huge-document focus |
| cross-browser-huge-document-selection-oracle-029 | 31-32 | slate-ar-stabilize / slate-browser | Firefox/WebKit exposed fixed-offset assumptions after native typing/undo in virtualized 5k row. | `.tmp/slate-v2`: promoted `editor.assert.collapsedModelDOMSelection`; updated huge-doc row; `bun --filter slate-browser typecheck`; `bun --filter slate-browser test:core`; `bun --filter ./packages/slate-browser build`; exact row; focused Firefox/WebKit band; full Chromium suite. | Text changes remain exact. Selection proof now requires collapsed model selection and native DOM selection to agree at the browser-native caret with tight allowed offsets. Final proof: exact Firefox/WebKit row 2/2 passed; focused band 12 passed / 6 expected skips; full Chromium huge-doc 28/28 passed. | keep | fast check |
| benchmark-staged-key-hard-cut-030 | 34 | slate-ar-perf / hard-cut | `stagedDomPresent` key preserved the false premise after label/classifier repair. | `.tmp/slate-v2`: hard-cut key to `stagedActiveDOMGroup`; `rg -n "stagedDomPresent" scripts packages site docs/libraries docs/plans`; focused staged trace; full benchmark; focused contract test. | No current source references to old key. Focused trace passed with `stagedActiveDOMGroup` bounded 3 / timedOut 0. Full benchmark passed with strict failures 0, diagnostic failures 0, staged diagnostic timedOut 0. Contract test passed 14/14. | keep | fast check |
| staged-native-surface-docs-terminology-031 | 35-36 | docs / slate-automation | Current docs/tests still used `DOM-present` for staged root groups after benchmark hard cut. | `.tmp/slate-v2`: patched `docs/libraries/slate-react/editable.md`, Slate React test labels; scoped current-source grep; Slate React Vitest; `bun check`. | Current reference docs now distinguish bounded/staged materialization rows from complete full-DOM rows. Current tests use staged/native DOM wording. Scoped current source has no `DOM-present` references outside historical plans/generated site output. | keep | stable example sweep |
| virtualized-pagination-projection-repair-032 | 42 | slate-patch / Playwright | `bun check:full` found Chromium virtualized pagination projection/selection failures after release-proof guards passed. Visible text rendered, but projected block offsets and selection/click rows failed because page-level virtual row wrappers overlapped spread pages and stole hits. | `.tmp/slate-v2`: patched `packages/slate-layout/src/react.tsx`, `packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts`, `packages/slate-react/src/components/editable-text-blocks.tsx`; DOM probe at `http://localhost:3101/examples/pagination?strategy=virtualized`; focused 2-row repro; focused 10-row failure cluster; `bun --filter slate-react typecheck`; `bun --filter slate-layout typecheck`. | Probe now hits the actual Slate text leaf and anchors DOM/model selection at `0,0`. The 10-row cluster passed: projected offsets, click cursor moves, selected-text alignment, virtualized double-click, margin drag/click, wrapped-line margin, split paragraph editing, rows=800 journey, and perf envelope. | keep | private-alpha full browser sweep resume |
| post-pagination-repair-browser-sweep-033 | 42 | slate-ar-stabilize / Playwright | The focused cluster may miss adjacent virtualized pagination/table/scroll rows. | `.tmp/slate-v2`: `PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium` | Full Chromium pagination suite passed 47/47 against the rebuilt server, including virtualized startup, click/selection, rows=800, 1000-page, table, wheel/jump, leading-break, and rich Markdown rows. | keep | full private-alpha browser sweep |
| synced-blocks-child-root-shift-race-034 | 43-44 | slate-patch / Playwright | Full private-alpha integration exposed a cold synced-blocks projection race: a second Shift+ArrowLeft in a child content root could bubble to the owner before model selection import caught up, leaving the view selection null. | `.tmp/slate-v2`: patched `packages/slate-react/src/editable/keyboard-input-strategy.ts`; added focused tests in `packages/slate-react/test/keyboard-input-strategy-contract.test.ts`; rebuilt `slate-react` and the static site; ran focused unit/type/browser proof. | Internal-target keydown now prefers the nested editable live DOM selection before stale runtime selection. Proof: focused unit pair passed, keyboard/content-root contract files passed 56/56, `slate-react` typecheck passed, cold browser probe passed 20/20, exact browser row passed 10/10 with retries off, and full synced-blocks Chromium file passed 45/45. | keep | resume full private-alpha browser sweep |
| virtualized-native-input-caret-flake-035 | 45-47 | slate-patch / slate-browser / Playwright | Resumed full sweep completed with two retry-green huge-doc virtualized rows. Retries-off repeats reproduced stale virtualized native/model caret ownership: Chromium 5k typing/undo failed 4/20 before repair, and Firefox middle-block typing failed 3/10 before repair with model/native offset 10 when 11 was expected. A later 40-row Chromium/Firefox repeat exposed the remaining owner: rapid native text repair could split one physical type burst into two history batches, leaving `XX` after undo. | `.tmp/slate-v2`: patched `packages/slate-react/src/editable/dom-repair-queue.ts`, `packages/slate-react/src/editable/input-history.ts`, `packages/slate-react/src/editable/browser-handle.ts`, `packages/slate-browser/src/playwright/index.ts`, `packages/slate-react/test/dom-repair-policy-contract.test.ts`, `packages/slate-react/test/input-history-contract.test.ts`; ran focused Vitest, `slate-react`/`slate-browser` typechecks, package builds, static site build, exact flaky-row repeats, full huge-document proof, and `bun check`. | Virtualized native text repair now treats same-path/wrong-offset DOM selection as model-owned, schedules delayed virtualized caret rechecks, and the assertion helper compares model selection against resolved DOM selection rather than only raw browser offsets. Native text repair metadata explicitly merges rapid follow-up batches and pushes only after idle. Final proof: focused history/repair/input tests 50/50, Chromium/Firefox exact repeat 40/40, full Chromium huge-document 28/28, `bun check` passed. | keep | full private-alpha browser sweep |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| current-tree fast gate | `.tmp/slate-v2` packages/site/root | `bun check` | N/A | pass after formatting fix | huge-document browser proof |
| huge-document focused browser | `site/examples/ts/huge-document.tsx` staged/virtualized | managed `bun playwright ... huge-document.test.ts --grep ...` | Chromium | pass, 7 rows / 14.7s | stable example sweep |
| stable examples | richtext/plaintext/markdown/editable voids/placeholder/hidden/dom coverage | managed `bun playwright` over seven example specs | Chromium | pass, 199 passed / 5 expected skips / 2.1m | cross-browser selection sweep |
| cross-browser selection band | stable examples high-risk rows | managed Firefox/WebKit `bun playwright` grep selection/caret/arrows/undo/paste/scroll/IME/right-margin/triple-click/Shift | Firefox/WebKit | pass, 157 passed / 45 expected skips / 2.3m | huge-document visual screenshot |
| huge-document visual/geometry | `site/examples/ts/huge-document.tsx` staged/virtualized | focused `huge-document.test.ts` visual/geometry greps | Chromium | pass, 4 rows total | perf honesty baseline |
| huge-document full perf | `.tmp/slate-v2` benchmark suite | `bun run bench:react:huge-document:full:local` before and after metric-owner patch | Chromium/browser + headless | pass after patch; strict budget failures 0 | post-benchmark hygiene |
| post-benchmark hygiene | `.tmp/slate-v2` | `bun lint:fix`; `bun check` | N/A | pass | API/docs hygiene audit |
| API/docs hygiene | `.tmp/slate-v2` package/site docs and source, parent rules/docs | scoped `rg`, focused file reads, focused package tests, `bun check`; parent `pnpm install`/mirror audit | N/A | pass | mobile claim-width proof |
| mobile claim-width | `.tmp/slate-v2` | `bun test:mobile-device-proof`; focused mobile Playwright grep | mobile project / proof script | pass scoped; raw device unclaimed | cross-editor huge-doc benchmark |
| cross-editor huge-doc benchmark | `.tmp/slate-v2` plus sibling `/Users/zbeyens/git/{prosemirror,lexical}` build outputs | `bun run bench:react:huge-document:cross-editor:local` | Chromium/browser benchmark | pass; hotspot identified | virtualized Shift+Down hotspot |
| virtualized ShiftDown / overscan packet | `.tmp/slate-v2` huge-document virtualized | Focused Playwright rows, 20-iteration virtualized benchmark, full cross-editor comparison, full huge-doc benchmark, `bun check` | Chromium/browser + package checks | pass; kept runtime/oracle patches | full huge-document browser sweep |
| shadow-DOM native helper | `.tmp/slate-v2` shadow-dom example | `bun lint:fix`; `bun --filter slate-react typecheck`; `bun --filter slate-browser typecheck`; `bun --filter slate-browser test:core`; `bun --filter ./packages/slate-browser build`; focused `shadow-dom.test.ts` native-caret row | Chromium/Firefox; WebKit scoped skip | pass; WebKit native range limitation directly probed and documented | fast current-tree check |
| virtualized pagination projection/selection | `.tmp/slate-v2` pagination example | DOM probe plus focused Chromium `pagination.test.ts` virtualized failure cluster | Chromium | pass, 10 focused rows; `slate-react` and `slate-layout` typechecks passed | resume private-alpha full browser sweep |
| pagination full Chromium | `.tmp/slate-v2` pagination example | Full `pagination.test.ts` after projection repair | Chromium | pass, 47/47 | resume private-alpha full browser sweep |
| synced-blocks child-root Shift+Arrow projection | `.tmp/slate-v2` synced-blocks example | focused unit pair, full keyboard/content-root contract files, cold browser probe, exact Playwright row, full synced-blocks Chromium file | Chromium + Vitest | pass: probe 20/20, exact row 10/10 retries off, full file 45/45 | resume private-alpha full browser sweep |
| huge-document virtualized retry-green flake rows | `.tmp/slate-v2` huge-document example | exact retries-off Chromium and Firefox repeats after virtualized native caret/history repair | Chromium/Firefox + Vitest/type/build | pass: Chromium/Firefox exact repeat 40/40 after failing 4/40 before history metadata repair; full Chromium huge-document 28/28; `bun check` passed | full private-alpha browser sweep |
| huge-document virtualized undo selection repair | `.tmp/slate-v2` huge-document example + `slate-history` | temporary browser probe, focused history contract, exact 5k row repeat | Chromium/Firefox + Bun tests/type/build | pass: probe showed stale `selectionBefore` fixed from offset 5 to 1; exact 5k row 20/20 retries off | adjacent huge-document flake cluster |
| huge-document virtualized select-all/delete typing repair | `.tmp/slate-v2` huge-document example + Slate React input router | temporary browser probe, focused input-router contract, exact select-all row repeat, adjacent huge-doc cluster | Chromium + Vitest/type/build | pass: select-all row failed 1/20 before patch, then 20/20; adjacent cluster 25 pass / 5 expected Firefox skips; `bun check` passed | full private-alpha browser sweep |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| stable examples high-risk selection band | model/native/caret assertions in test rows | selection/caret/Arrow/select-all/undo/paste/scroll/IME/right-margin/triple-click rows | managed Playwright, Firefox/WebKit | pass |
| huge-document visual selection rows | model selection plus native/view-selection/geometry proof in tests | staged visual projection, staged/full-DOM parity, virtualized drag autoscroll, blank-gap selection | managed Playwright, Chromium | pass |
| shadow-DOM helper native caret | model selection after type | native caret placed by `editor.dom.collapseAtTextPath` in nested shadow root | focused Playwright, Chromium/Firefox | pass; WebKit native proof not claimed because direct probe shows dropped programmatic shadow-DOM range |
| synced-blocks child-root Shift+Arrow | projected view selection crosses from nested child root into owner sibling | native DOM selection is the fresh source when model import is stale | focused unit DOM-selection race and Playwright synced-blocks row | pass; avoids stale model-only projection |
| huge-document virtualized native typing after scroll/edit | model selection after native insert, undo, ArrowLeft/Right, and Enter | native caret is resolved back to Slate path/offset, not just raw DOM offset | Chromium/Firefox exact retries-off rows plus resolved DOM-selection oracle | pass; catches same-path wrong-offset virtualized caret drift |
| huge-document virtualized rapid typing undo | model text and history after a single physical type burst | native text repair batches explicitly merge in history metadata | Chromium/Firefox 40-row repeat after one failing repeat; full huge-document browser file | pass; catches split-history `XX` leftovers after undo |
| huge-document virtualized undo after stale native burst selection | model and DOM selection restore to the original insert offset after undo | native text repair can report a stale pre-insert caret inside the inserted span | focused history contract plus temporary browser probe and exact 5k row 20/20 | pass; undo restores offset 1 instead of stale offset 5/10/11 |
| huge-document virtualized select-all/delete rapid typing | model text equals physical typed order after whole-document delete | DOM input repair refuses deeply stale same-path coalescing and flushes the pending burst first | focused input-router contract plus select-all row 20/20 and adjacent cluster | pass; catches scrambled `afterded...` text after rapid type |

slate-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| mounted text-path readiness | huge-document browser tests, cross-editor benchmark | `editor.dom.waitForTextPath(path, { timeoutMs, align })` | `bun --filter slate-browser typecheck`; `bun --filter slate-browser test:core`; focused huge-doc rows | keep |
| native caret setup at Slate text path | huge-document browser tests, cross-editor benchmark, shadow-DOM helper proof | `SlateBrowserHandle.setNativeDOMSelection(selection)` plus `editor.dom.collapseAtTextPath(point, options)` | `bun --filter slate-react typecheck`; focused huge-doc rows; focused shadow-DOM native-caret row | keep; repaired to use local `Document | ShadowRoot` selection |
| pending native text-input repair wait | cross-editor benchmark and huge-doc typing proof | `editor.dom.waitForPendingNativeTextInputRepair({ timeoutMs })` | `bun --filter slate-browser test:core`; focused cross-editor benchmark | keep |
| resolved native DOM selection agreement diagnostics | huge-document virtualized flake isolation | `SlateBrowserHandle.getDOMSelection()` plus `editor.assert.collapsedModelDOMSelection` resolved DOM snapshot and kernel-trace tail | focused `slate-browser` typecheck/build and exact huge-doc Chromium/Firefox repeats | keep; raw DOM offsets remain diagnostic, resolved DOM path/offset is the assertion owner |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| mobile semantic/touch behavior | local proof script + Playwright mobile project | `bun test:mobile-device-proof`; focused mobile Playwright grep | pass scoped; 2 applicable Playwright rows passed, 2 desktop-only rows skipped | mobile viewport/semantic proxy only |
| raw Android/iOS device behavior | raw-device lane | not available in this run | not claimed | requires `SLATE_BROWSER_RAW_MOBILE_REQUIRED=1` and real device artifact |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| huge-document staged/virtualized | select-all/delete, typing, undo/redo, arrows, row coherence, scrollbar buffer, staged controls/editing | model/native/visual/perf bounded assertions in focused rows | focused `bun playwright ... huge-document.test.ts --project=chromium --grep ...` | pass before perf packet |
| huge-document virtualized overscan zero | middle-block burst typing, repeated ShiftDown/ShiftUp, native scrollbar drag buffer | native caret, model selection, row buffer before repaint, staged parity | focused `bun playwright ... --grep "virtualized (rows buffered|overscan-zero middle-block burst typing|repeated Shift)"` after formatter | pass |
| huge-document full benchmark | 5k browser trace and overlays | strict budgets and diagnostics | `bun run bench:react:huge-document:full:local` | pass, budget failures 0 |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| `bun check` initial failure | current-tree-closure | <1s fail, ~30s rerun | Formatting drift from prior broad runtime work blocked the fast gate. | Biome named four fixable files; `bun lint:fix` fixed them; `bun check` passed. | keep as hygiene; no skill repair because command shape was correct |
| `bun run bench:react:huge-document:full:local` | perf-honesty-baseline | multi-minute benchmark | Correct benchmark owner, but slow enough to require artifact-based summary and no rerun unless metric owner changes. | Before/after artifacts in `.tmp/slate-v2/tmp/slate-react-huge-document-full-benchmark*.json`. | keep; no skill repair because full perf packet needs this cost |
| `bun test ./packages/slate-dom/test` | API/docs hygiene | immediate fail | Directory path is not a focused Bun test owner in this repo; `bunfig.toml` ignores `*.test.*` and contract owners use plain `.ts` files. | Exact contract files passed: `bridge.ts`, `dom-coverage.ts`, `public-surface-contract.ts`. | repaired `slate-automation` source rule and generated mirror |
| `rg` with backticks inside double quotes | skill mirror audit | immediate shell warning | Backticks in the pattern triggered shell command substitution. | Rerun with single-quoted pattern passed. | log only; generic shell hygiene, no skill repair |
| 20-iteration cross-editor benchmark failed before harness repair | virtualized-shift-down-hotspot | immediate benchmark fail after several iterations | Harness re-selected model selection before typing but did not re-anchor native DOM selection at the mounted Slate text; exact typed-count assertion also ignored prior iterations. | Harness now anchors native caret, asserts count delta, waits for pending native repair, and emits debug state. | repaired benchmark oracle |
| focused huge-doc Playwright after `slate-browser` helper source edit | slate-browser promotion | immediate false red | Playwright imported stale generated `slate-browser` package output, so `editor.dom` was missing even though source had it. | `bun --filter ./packages/slate-browser build` fixed the proof path; subsequent focused huge-doc and benchmark rows passed. | repaired `slate-automation` source rule and generated mirror |
| local autoreview rerun after accepted fixes | autoreview-current-tree-diff | 5m then empty output | The review engine stayed in heartbeat mode and returned no findings/output after the process was stopped. | Direct closure proof replaced the missing clean rerun: focused scrollbar row passed, focused staged trace passed honestly, `bun check` passed. | log for final handoff; do not block timed run on an empty review rerun |
| browser proof after `slate-react` source edit | synced-blocks-child-root-shift-selection-race | one stale rerun | `bun build:next` alone kept the site on stale `slate-react` package output, so the first browser probe still saw old runtime code. | Running `bun --filter slate-react build` before `bun build:next` made the patch visible; the cold probe then passed 20/20. | log for final handoff; same dist trap as `slate-browser` |
| virtualized flake trace probe | huge-document-virtualized-flake-isolation | one scratch probe cycle | The first trace probe was too broad/noisy, then a resolved DOM probe used non-exact path resolution and briefly hid the mismatch. | Promoted resolved DOM-selection diagnostics into `slate-browser` assertion output and deleted the scratch probe. | keep promoted diagnostic; do not keep ad hoc probe |
| virtualized history split repeat | post-virtualized-flake-broader-huge-document-proof | one failed 40-row repeat plus temporary probe | The single full Chromium file passed, but the stricter Chromium/Firefox repeat found 4 failures. The temporary probe without the exact assertion path passed, proving a one-pass browser sweep was too weak for this lane. | Added explicit native text history merge metadata and a focused input-history contract, then deleted the temporary probe. | repair kept; repeat rows are now required evidence for this flake family |
| virtualized undo selection probe | huge-document-virtualized-undo-selection-repair | one intentionally failing scratch probe | The exact 5k row failed because the saved history selection-before was stale even though text undo was correct. | Added stale native text burst history contract and deleted the scratch probe after proving DOM/model caret offset 1. | repair kept; repeat row required |
| virtualized select-all delete typing probe | huge-document-select-all-delete-typing-repair | one huge noisy scratch probe, then compacted rerun | Initial probe dumped full 5k replacement payload; useful signal was repeated insertion chunks at stale offset 5 after select-all/delete. | Bounded DOM input coalescing, added focused contract, compacted and deleted scratch probe. | repair kept; probe noise logged as slowdown |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| runtime selection/perf | kept persistent view-selection decoration source, small top-level selection-impact fast path, conditional native-scrollbar overscan, deferred native text repair flush, virtualized native text insert caret ownership/recheck repair, explicit native text history merge metadata, shadow-root aware `setNativeDOMSelection`, and nested child-root DOM-selection projection repair |
| input/history repair | kept stale native text burst history selection-before recovery, undo-time selection-op filtering, bounded same-path DOM input coalescing after full-document delete, and same-burst `insertText` pre-flush of pending native text repair |
| tests/oracles/browser proof | added overscan-zero middle-block burst typing row, native scrollbar gutter row update, shadow-DOM native-caret helper row, virtualized native caret repair contract tests, native text history metadata contract tests, stale native burst undo contract, deeply stale DOM input coalescing contract, same-burst beforeinput flush contract, repair-authority inventory row, resolved DOM-selection assertion diagnostics, and child-root stale-import Shift+Arrow regression tests |
| benchmarks/metrics/targets | repaired huge-doc full benchmark strict DOM budget to use editor-owned elements; repaired cross-editor native caret setup, typed-count delta oracle, pending text-repair wait, debug payload, staged bounded-surface classifier/label/key, and interaction-sequence metric naming |
| slate-browser API/DX | added `editor.dom.waitForTextPath`, `collapseAtTextPath`, `waitForPendingNativeTextInputRepair`, `editor.assert.collapsedModelDOMSelection`, browser-handle native selection export, browser-handle DOM-selection readback, resolved DOM-selection diagnostics, kernel-trace assertion tails, and README coverage |
| examples/docs | `.tmp/slate-v2/site/public/index.css`, `packages/slate-dom` comment, and Slate React provider test labels use current-state wording |
| skills/workflow | `.agents/rules/slate-automation.mdc` and generated `.agents/skills/slate-automation/SKILL.md` patched for focused Bun directory-filter pitfall and stale `slate-browser` package-output pitfall |
| reverted/quarantined packets | reverted earlier blunt `deferNativeTextInputRepair={false}` experiment; no active quarantine |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| review-1 | Decide whether to run `bun check:full` immediately next | The latest active packet is clean, but the full private-alpha browser gate has not rerun after the loop-50 same-burst native text boundary fix. | `.tmp/slate-v2` full browser gate | Recommended next run: `slate-automation private-alpha-full-browser-sweep-rerun` or another timed batch that starts with `bun check:full`. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| full-browser-gate | deferred-checkpoint | Rerun the full private-alpha browser gate after loop 50. | Focused/unit/full huge-document proof is strong, but `bun check:full` is the broad release-quality browser gate and may expose a new owner. | `private-alpha-full-browser-sweep-rerun` | Handoff now because the 8h minimum elapsed and the active packet is clean. | Run this as the first checkpoint of the next automation call. | `.tmp/slate-v2`: `bun check:full` |

Findings:
- The promoted native DOM selection helper needed the same `Document | ShadowRoot`
  selection-root handling used elsewhere in Slate React.
- Playwright can load stale `slate-browser` package output after helper source
  edits unless `bun --filter ./packages/slate-browser build` runs before browser proofs.
- In WebKit, a direct probe against `/examples/shadow-dom` found the nested
  shadow editor and document selection, but `document.getSelection().addRange()`
  for a text node inside that shadow root leaves `rangeCount: 0`; native
  programmatic caret proof is not claimable there.

Decisions and tradeoffs:
- Keep the helper promotion, but make it shadow-root aware and covered by a
  nested shadow-DOM native-caret browser row.
- Keep the Slate automation rule repair for stale generated package output;
  this is a workflow repair, not a runtime product patch.
- Keep the WebKit row as an explicit skip with a probe-backed reason instead of
  turning an engine limitation into a false Slate regression.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Focused browser proof after `slate-browser` helper source edit loaded stale generated output | 1 | Run `bun --filter ./packages/slate-browser build` before browser proofs that import changed helpers | Repaired source rule and generated mirror |
| Browser probe after `slate-react` source edit still used stale package output | 1 | Run `bun --filter slate-react build` before `bun build:next` for site/browser proof after Slate React source edits | Rebuilt package output, reran static site build, then cold probe passed 20/20 |

Verification evidence:
- `.tmp/slate-v2`: `bun lint:fix`; `bun --filter slate-react typecheck`;
  focused Chromium `shadow-dom.test.ts` native-caret helper row passed.
- Parent: `pnpm install`; source/mirror `rg` audit for the new
  `slate-browser` build-output rule passed.
- `.tmp/slate-v2`: focused native-scrollbar drag row passed after left-gutter
  proof repair: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright
  playwright/integration/examples/huge-document.test.ts --project=chromium
  --grep "native scrollbar drag"`.
- `.tmp/slate-v2`: focused staged trace passed with honest bounded
  classification: `stagedDomPresent` complete 0 / bounded 3 / timedOut 0,
  `stagedContentVisibility` complete 0 / bounded 3 / timedOut 0.
- `.tmp/slate-v2`: `bun check` passed after autoreview repairs.
- `.tmp/slate-v2`: `bun --filter slate-react test:vitest -- -t
  "nested .*selection"` passed 2 focused child-root projection tests.
- `.tmp/slate-v2`: `bun --filter slate-react test:vitest --
  keyboard-input-strategy-contract.test.ts content-root-navigation-contract.test.ts`
  passed 56/56.
- `.tmp/slate-v2`: `bun --filter slate-react typecheck` passed after the
  nested DOM-selection bridge.
- `.tmp/slate-v2`: `bun --filter slate-react build && bun build:next` rebuilt
  package output and the static site before browser proof.
- `.tmp/slate-v2`: cold synced-boundary browser probe passed 20/20 before the
  scratch script was deleted.
- `.tmp/slate-v2`: exact synced-blocks row passed 10/10 with retries off:
  `PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0
  PLAYWRIGHT_WORKERS=1 bun playwright
  playwright/integration/examples/synced-blocks.test.ts --project=chromium
  --grep "promotes local Shift\\+Arrow selection from inside a synced content root into owner siblings"
  --repeat-each=10`.
- `.tmp/slate-v2`: full Chromium synced-blocks file passed 45/45.
- `.tmp/slate-v2`: `bun --filter slate-react test:vitest --
  dom-repair-policy-contract.test.ts input-router-contract.test.tsx` passed
  48/48 after virtualized caret repair.
- `.tmp/slate-v2`: `bun --filter slate-react typecheck`; `bun --filter
  slate-browser typecheck`; `bun --filter slate-react build`; `bun --filter
  slate-browser build`; `bun build:next` passed after virtualized caret and
  browser-helper changes.
- `.tmp/slate-v2`: exact Chromium retry-green huge-doc row passed 20/20 with
  retries off:
  `PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0
  PLAYWRIGHT_WORKERS=1 bun playwright
  playwright/integration/examples/huge-document.test.ts --project=chromium
  --grep "keeps virtualized 5k typing, undo, arrows, Enter, and scroll stable"
  --repeat-each=20`.
- `.tmp/slate-v2`: exact Firefox retry-green huge-doc row passed 10/10 with
  retries off:
  `PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0
  PLAYWRIGHT_WORKERS=1 bun playwright
  playwright/integration/examples/huge-document.test.ts --project=firefox
  --grep "keeps virtualized middle-block typing after an earlier visible edit"
  --repeat-each=10`.
- `.tmp/slate-v2`: after scheduler cleanup, a stricter Chromium/Firefox
  two-row repeat failed 4/40 before the history metadata repair: Chromium left
  `CXXondico...` after undo twice; Firefox left model selection at offset 10
  twice.
- `.tmp/slate-v2`: `bun --filter slate-react test:vitest --
  input-history-contract.test.ts dom-repair-policy-contract.test.ts
  input-router-contract.test.tsx` passed 50/50 after explicit native text
  history merge metadata.
- `.tmp/slate-v2`: `bun lint:fix`; `bun --filter slate-react typecheck`; `bun
  --filter slate-react build`; `bun build:next` passed after the native text
  history metadata repair.
- `.tmp/slate-v2`: Chromium/Firefox repeat for the two virtualized huge-doc
  rows passed 40/40 after the history metadata repair:
  `PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0
  PLAYWRIGHT_WORKERS=1 bun playwright
  playwright/integration/examples/huge-document.test.ts --project=chromium
  --project=firefox --grep "keeps virtualized (5k typing|middle-block typing
  after an earlier visible edit)" --repeat-each=10`.
- `.tmp/slate-v2`: full Chromium `huge-document.test.ts` passed 28/28 after
  the history metadata repair.
- `.tmp/slate-v2`: `bun check` passed after the history metadata repair:
  Slate React Vitest 58 files / 694 tests.
- `.tmp/slate-v2`: focused stale native burst undo browser probe confirmed
  model and DOM caret offset 1 after undo, then the temporary probe was deleted.
- `.tmp/slate-v2`: `bun test ./packages/slate-history/test/history-contract.ts`
  passed 43/43 after stale native burst undo selection contract.
- `.tmp/slate-v2`: exact Chromium/Firefox 5k row passed 20/20 with retries off:
  `PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0
  PLAYWRIGHT_WORKERS=1 bun playwright
  playwright/integration/examples/huge-document.test.ts --project=chromium
  --project=firefox --grep "keeps virtualized 5k typing, undo, arrows, Enter, and scroll stable"
  --repeat-each=10`.
- `.tmp/slate-v2`: focused select-all/delete typing probe reproduced scrambled
  text before the DOM coalescing repair, then passed after rebuilt package/site
  output and was deleted.
- `.tmp/slate-v2`: `bun --filter slate-react test:vitest --
  input-router-contract.test.tsx` passed 29/29 after the deeply stale DOM input
  contract.
- `.tmp/slate-v2`: exact Chromium select-all/delete row passed 20/20 with
  retries off:
  `PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0
  PLAYWRIGHT_WORKERS=1 bun playwright
  playwright/integration/examples/huge-document.test.ts --project=chromium
  --grep "keeps virtualized browser select-all delete, typing, undo, and redo bounded"
  --repeat-each=20`.
- `.tmp/slate-v2`: adjacent virtualized huge-document cluster passed 25/25
  applicable rows with 5 expected Firefox skips:
  select-all/delete, 5k typing/undo/arrows, and middle-block typing.
- `.tmp/slate-v2`: combined Slate React runtime tests passed 72/72; Slate
  History contract set passed 61/61; `slate-react` and `slate-history`
  typechecks passed; package builds and `bun build:next` passed.
- `.tmp/slate-v2`: `bun check` passed after formatting repair: Slate React
  Vitest 58 files / 703 tests.
- `.tmp/slate-v2`: temporary same-burst `abc\n` probe reproduced `Cac` /
  `defb...`, then passed as `Cabc` / `def...` after pending native text repair
  flushing before every new beforeinput. The probe file was deleted.
- `.tmp/slate-v2`: `bun --filter slate-react test:vitest --
  runtime-before-input-events-contract.test.ts input-router-contract.test.tsx
  dom-repair-policy-contract.test.ts selection-runtime-contract.test.ts
  browser-handle-contract.test.ts` passed 85/85.
- `.tmp/slate-v2`: exact Chromium virtualized 5k row passed 10/10 with retries
  off:
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright
  playwright/integration/examples/huge-document.test.ts --project=chromium
  --grep "keeps virtualized 5k typing, undo, arrows, Enter, and scroll stable"
  --repeat-each=10`.
- `.tmp/slate-v2`: broader Chromium virtualized cluster passed 5/5:
  select-all/delete, 5k typing/undo/arrows/Enter, repeated Shift+Arrow,
  middle-block typing after visible edit, and insert-break bursts.
- `.tmp/slate-v2`: original Chromium native-caret row passed 20/20 with retries
  off:
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright
  playwright/integration/examples/huge-document.test.ts --project=chromium
  --grep "keeps virtualized overscan-zero middle-block burst typing at the native caret"
  --repeat-each=20`.
- `.tmp/slate-v2`: full Chromium `huge-document.test.ts` passed 28/28.
- `.tmp/slate-v2`: Firefox/WebKit focused native text row passed where
  applicable: 2 passed, 4 expected skips for Chromium-only rows.
- `.tmp/slate-v2`: `bun --filter slate-react test:vitest --
  browser-handle-contract.test.ts dom-repair-policy-contract.test.ts
  input-router-contract.test.tsx selection-controller-contract.ts
  selection-runtime-contract.test.ts runtime-before-input-events-contract.test.ts
  selection-reconciler-contract.test.tsx input-history-contract.test.ts`
  passed 101/101.
- `.tmp/slate-v2`: `bun --filter slate-browser typecheck`, `bun --filter
  slate-browser test:core` 48/48, and `bun --filter ./packages/slate-browser build`
  passed.
- `.tmp/slate-v2`: `bun check` passed: lint, package/site/root typecheck, Bun
  tests, Slate Layout tests, Slate React Vitest 58 files / 712 tests.
- `.tmp/slate-v2`: final `bun --filter slate-react build`, `bun --filter
  slate-browser build`, `bun build:next`, and post-build Chromium exact 5k
  smoke passed.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-07-slate-v2-eight-hour-automation.md`
- Surface and route/package: `.tmp/slate-v2`, primarily `packages/slate-react`,
  `packages/slate-browser`, `playwright/integration/examples/huge-document.test.ts`,
  and huge-document benchmark scripts.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: timed 8h
  minimum elapsed; handoff after loop 50 with active packet clean.
- Behavior gates and visual proof: focused, repeated, full Chromium, and
  Firefox/WebKit focused huge-document proof passed for the active packet.
- Primary metric baseline/latest/best and stop reason: active loop was
  correctness, not a perf packet; baseline bug `Cac` / `defb...`, latest/best
  `Cabc` / `def...`; stop because timebox elapsed and active packet is kept.
- Bugs fixed and oracles added: same-burst pending native text repair now
  flushes before every new beforeinput; contract and repair-authority audit
  updated; temporary probe deleted.
- Benchmark/skill/docs repairs: no new benchmark or skill source edit in loop
  50; prior benchmark/skill repairs remain kept.
- Workflow slowdowns and repairs: stale package/app output after source edits
  still matters; package builds plus `bun build:next` are required before
  browser proof. The old stale-server kill pattern is avoided.
- Changed list: filled above.
- Needs your attention: full private-alpha browser sweep should be first next
  checkpoint if continuing.
- Stopping checkpoints to unblock: `full-browser-gate`.
- Accepted deferrals and residual risks: `bun check:full` not rerun after loop
  50 because the 8h minimum elapsed and the active packet is clean.
- Next owner: `slate-ar-stabilize` / `private-alpha-full-browser-sweep-rerun`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Loop 50 done; timed minimum elapsed; active packet is kept and handoff-ready. |
| Where am I going? | Next run should start with the full private-alpha browser gate rerun. |
| What is the goal? | 8h minimum Slate v2 private-alpha automation across behavior, visual/native proof, perf, API/docs, workflow repair, changed list, review-attention, and final handoff gates. |
| What have I learned? | Promoted helpers must preserve shadow-root selection semantics; browser package proofs need fresh built package output after helper/runtime edits; WebKit drops programmatic native ranges inside nested shadow DOM; child-root keydown projection must read live DOM selection when model import is stale; virtualized text insert repair must not trust same-path native selection when the offset is stale; rapid native text repairs must explicitly merge history batches or undo can leave early inserted text behind; same-burst native text repair must flush before the next beforeinput, including `insertText`. |
| What have I done? | Kept runtime/perf/oracle/docs/workflow packets through loop 50; repaired virtualized pagination hitboxes, the synced-blocks child-root Shift+Arrow race, huge-document virtualized retry-green native caret/history flakes, undo/select-all stale DOM input, and same-burst beforeinput native text boundaries with focused unit/browser proof. |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger |

Timeline:
- 2026-06-07T11:51:24.718Z Goal plan created.
- 2026-06-07 15:25 CEST Loop 23 coherence audit completed with shadow-DOM helper repair and stale `slate-browser` output skill repair.
- 2026-06-07 15:40 CEST Loop 24 cross-browser shadow-DOM helper proof completed: Firefox pass, WebKit scoped skip backed by direct probe.
- 2026-06-07 15:41 CEST Loop 25 fast check completed: `bun check` passed.
- 2026-06-07 17:20 CEST Loop 42 virtualized pagination projection repair completed with focused cluster proof and full Chromium pagination 47/47.
- 2026-06-07 17:49 CEST Loop 44 synced-blocks child-root Shift+Arrow race repaired with focused unit/type/browser proof and full Chromium synced-blocks 45/45.
- 2026-06-07 18:43 CEST Loop 46 virtualized huge-document retry-green flakes repaired with focused unit/type/build proof plus Chromium 20/20 and Firefox 10/10 exact repeats.
- 2026-06-07 18:58 CEST Loop 47 second-order virtualized huge-document history split repaired: failed Chromium/Firefox repeat 4/40 before patch, then 40/40 pass, full Chromium huge-doc 28/28, and `bun check` pass.
- 2026-06-07 20:08 CEST Loop 48 virtualized 5k undo selection repaired: stale native burst selection-before recovered to insert offset; exact 5k Chromium/Firefox row 20/20.
- 2026-06-07 20:18 CEST Loop 49 virtualized select-all/delete rapid typing repaired: select-all row failed 1/20 before patch, then 20/20; adjacent huge-doc cluster 25 pass / 5 expected skips; `bun check` passed.
- 2026-06-07 22:05 CEST Loop 50 same-burst beforeinput boundary repaired:
  temporary probe failed as `Cac` / `defb...`, then passed as `Cabc` /
  `def...`; exact row 10/10, broader virtualized cluster 5/5, original
  native-caret row 20/20, full Chromium huge-doc 28/28, Firefox/WebKit focused
  5k proof, `bun check`, package builds, `bun build:next`, and post-build smoke
  all passed.

Open risks:
- Full private-alpha browser gate still needs to rerun after the loop-50
  same-burst native text boundary repair.
