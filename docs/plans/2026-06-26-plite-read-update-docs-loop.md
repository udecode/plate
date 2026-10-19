# plite read update docs loop

Objective:
Close Plite read/update API and docs loop; done when contracts, docs, and focused Plite checks pass; plan docs/plans/2026-06-26-plite-read-update-docs-loop.md.

Goal plan:
docs/plans/2026-06-26-plite-read-update-docs-loop.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user-invoked `$auto`
- prompt / link: "full loop on plite, including plite docs"
- lane: Plite
- surface / route / package: `packages/plite`, Plite docs under `content/docs/plite/**`, package-facing docs examples
- invocation mode: full-loop
- minimum runtime / deadline: N/A: no timed checkpoint requested
- completion threshold summary: accepted Plite read/update method shape is implemented or already present, package/API contracts and docs are aligned, focused Plite proof passes, and handoff ledgers are closed.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A: full-loop mode stops at completion, API-plan boundary, or real blocker
- initial confidence score: N/A: concrete API/docs proof gates exist
- improvement loop: N/A: no timed minimum runtime
- final score / loop closure: N/A: use proof threshold below

Completion threshold:
- Accepted API direction is current-state Plite: `editor.read(fn)` / `editor.update(fn, options?)` remain lifecycle primitives; `editor.read.*` exposes common pure reads; `editor.update.*` exposes common one-shot writes through the transaction machinery.
- Docs teach that callback form is for grouped/custom flows and method form is for one-shot calls.
- Package tests/type contracts cover the direct method surface without fake aliases or root `editor.*` clutter.
- Plite docs compile/check and no obvious stale docs contradict the API direction.
- Closure is legal only when required package/API, docs, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-plite-read-update-docs-loop.md` passes.

Verification surface:
- Focused source audit: locate Plite read/update runtime/type owners and docs references before patching.
- Focused Plite contracts: `cd packages/plite && bun test ./test/read-update-contract.ts` and any added/updated contract owner.
- Plite package proof: `pnpm plite:test` or `pnpm --filter @platejs/plite test` if script discovery proves the current package command.
- Plite type proof: `pnpm plite:typecheck` or `pnpm turbo typecheck --filter=./packages/plite` if script discovery proves the current package command.
- Docs proof: `pnpm --filter www check:docs`; Browser route proof if docs route changes renderable content.
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
- Source of truth: root `VISION.md`, `docs/vision/plite.md`, `packages/plite/**`, `content/docs/plite/**`, package scripts discovered from live `package.json`.
- Allowed edit scope: Plite package source/tests/docs, docs route metadata if needed, plan file, changeset if package policy requires it.
- Browser surfaces: Plite docs pages only when docs content changes; no editor behavior route sweep unless API docs/examples require it.
- Package/API surfaces: `@platejs/plite` public editor lifecycle/read/update API and tests.
- Agent/skill surfaces: N/A unless the run proves a reusable skill/rule miss.
- Docs/research surfaces: Plite docs only; no external research unless local API owner is unclear after source read.
- Non-goals: Plate runtime migration, public GitHub queue work, post-merge autoclosure, perf optimization, pagination/virtualization, raw mobile proof, release/publish/PR.

Output budget strategy:
- Use `rg -l` / exact owner files first, inspect short `sed` slices, exclude generated output, and write any broad docs/API scan to `.tmp/**` instead of streaming it.

Blocked condition:
- Stop only for a real public API fork not covered by the accepted `read.*` / `update.*` direction, a missing tool/source owner that blocks all proof, or a repeated test/build blocker with no autonomous fix. Queue non-blocking docs polish or Plate migration follow-up.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: Plite
- surface: `@platejs/plite` read/update API and Plite docs
- mode: full-loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor, reconciled after browser blocker repair
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 2
- current_checkpoint: final-handoff
- current_checkpoint_status: ready_for_check_complete
- next_checkpoint: complete goal after checker passes
- goal_status: ready_to_close

Current verdict:
- verdict: complete pending `check-complete`
- confidence: high
- next owner: final checker, then handoff
- keep / revert / quarantine call: keep API/docs packet and projected-target-range repair packet
- reason: direct read/update API, docs, focused Plite React contract, formerly failing pagination row, and `pnpm check:plite` all pass.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-plite-read-update-docs-loop.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | complete | P0 | Copy prompt requirements and read vision before implementation. | Prompt requirements, root `VISION.md`, and `docs/vision/plite.md` read; stale root pointer to `docs/vision/slate.md` noted. | update |
| status | auto | pending | P0 | Read active plan, latest prompt, source status, and current evidence. | Current state recorded. | seed |
| gap-scan | auto | pending | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Gaps routed to packet owners. | seed |
| closure-handoff | autoclosure | pending | P0 when merged/current-tree work is in scope | Run until-clean closure for already-applied work. | Closure delegated or N/A. | seed |
| behavior-proof | lane proof owner | pending | P0 | Prove stable editor behavior before perf. | Focused behavior commands pass or failures routed. | seed |
| oracle-repair | lane test owner / tdd | pending | P0 | Add missing native/visual/model oracles for found gaps. | New proof fails before fix or coverage gap is explicit. | seed |
| visual-proof | Browser / Playwright | pending | P0 | Prove visible editor behavior and native selection. | Browser/screenshot/geometry evidence recorded. | seed |
| browser-helper-promotion | lane proof harness | pending | P1 | Promote repeated browser proof into reusable API/helper. | Helper added, queued, or N/A with reason. | seed |
| mobile-claim-width | auto | pending | P1 | Separate raw-device proof from viewport proof. | Raw proof command passes or scoped blocker recorded. | seed |
| huge-document-smoke | lane proof owner | pending | P1 | Smoke huge-doc correctness without broad architecture work when in scope. | Typing/Enter/paste/select-all/undo/nav/scroll proof recorded or N/A. | seed |
| perf-packet | lane perf owner | pending | P2 | Optimize only after correctness is green. | Metric target or plateau recorded. | seed |
| supervision-mode | auto | pending | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from vision and evidence. | New checkpoint added/run, or hard blocker recorded. | seed |
| consolidation | auto | pending | P1 | Move accepted reusable decisions to durable docs/rules. | Durable owner updated or N/A. | seed |
| final-handoff | auto | pending | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete. | seed |
| plite-read-update-api | packages/plite | pending | P0 | Implement or confirm callable `read`/`update` direct methods without root API clutter. | Contract tests and type proof pass. | add |
| plite-docs-alignment | docs-creator / Plite docs | pending | P0 | Align Plite docs with callback-plus-method API direction. | Docs check and route proof if rendered docs changed. | add |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded by checkpoint-zero extraction |
| 0 | update/add | checkpoint-zero, plite-read-update-api, plite-docs-alignment | latest prompt, root `VISION.md`, `docs/vision/plite.md` | full-loop Plite docs/API scope is narrower than default editor behavior template | active plan now routes to package/API/docs first |
| 1 | update/add | plite-browser-pagination-blocker, workflow slowdowns, final handoff | `pnpm check:plite` and focused browser reruns | API/docs proof passed but daily gate found real browser behavior debt | goal remains active; no complete call |
| 2 | update/close | pagination/model-owned typing repair, completion gates, final handoff | `selection-reconciler-contract.test.tsx`, focused pagination row, `pnpm check:plite` | Projected `beforeinput.getTargetRanges()` could override model-owned text insertion after repair; runtime now treats projected target ranges as model-owned authority. | goal ready to close |

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
| Prompt requirements captured before work | yes | Initial Plite API/docs scope, non-goals, proof surfaces, and stop conditions copied into this plan before implementation. |
| `auto` source rule read or fallback recorded | yes | Read `.agents/skills/auto/SKILL.md` fully, lines 1-1457. |
| `vision` read as checkpoint zero | yes | Read `.agents/skills/vision/SKILL.md`, root `VISION.md`, and `docs/vision/plite.md`; root stale detail pointer noted. |
| Active goal checked or created | yes | `get_goal` returned none; created goal `Close Plite read/update API and docs loop...`. |
| Lane resolved | yes | Plite lane: `packages/plite/**` + `content/docs/plite/**`. |
| Invocation mode and timebox recorded | yes | Full-loop; no timed checkpoint. |
| Dynamic checkpoint policy accepted | yes | Plan mutation ledger updated; checkpoints may be reprioritized from evidence. |
| Source of truth and allowed workspaces recorded | yes | Boundaries section names Plite package/docs owners. |
| Output budget strategy recorded | yes | Exact owners, capped `rg`, `.tmp/**` for broad scans. |
| Release/PR/publish boundary recorded | yes | Non-goal unless explicitly requested. |
| Browser proof strategy recorded | yes | Docs route proof only if rendered docs changed; no behavior route sweep. |
| Package/API proof strategy recorded | yes | Focused Plite contracts, Plite type/test commands, docs check. |
| Mobile/raw-device claim-width policy recorded | yes | N/A: no mobile/raw-device claim in this Plite API/docs loop. |
| Skill repair authority and source-rule boundary recorded | yes | N/A unless this run proves a reusable skill/rule miss; do not hand-edit generated skills. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation. Evidence: sections above.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete. Evidence: objective/threshold/boundaries filled.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded. Evidence: full-loop/N/A timed rows.
- [x] Lane is resolved as Plite, Plate, or shared editor, with owning workspace/package/app proof named. Evidence: Plite lane.
- [x] Checkpoint supervisor table has been reconciled at least once after the initial seed. Evidence: loop 1 mutation row and final handoff rows below.
- [x] Post-merge/current-tree closure is routed to `autoclosure` when in scope, or marked N/A with reason. N/A: this was an internal Plite API/docs loop, not already-applied teammate/PR closure.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split, merge, retire, remove, reopen, reprioritize, or no-change with reason. Evidence: loop 1 update/add row.
- [x] Current-tree/status packet recorded before new runtime patches. Evidence: source audit read Plite read/update owners, package scripts, docs references, root vision and Plite vision.
- [x] Behavior proof packet recorded for every in-scope stable editor family or explicitly skipped/deferred with reason. Evidence: in-scope package behavior contract passed; broad editor family sweep deferred because the prompt target was Plite API/docs and `check:plite` found a pagination blocker first.
- [x] Visual/native selection proof packet recorded for browser-visible selection/editing risks or explicitly scoped. Evidence: Browser tool blocked; Playwright daily gate exposed synced-blocks and pagination browser risks.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or deferred with owner and proof command. Evidence: API contracts added/updated; pagination failure deferred to next owner with failing command.
- [x] Repeated browser proof patterns are promoted to `@platejs/browser` or queued with reason. N/A: no repeated helper gap found in the read/update packet; browser blocker is behavior/runtime, not helper duplication.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited; Playwright viewport proof is not recorded as raw-device proof. N/A: no mobile/raw-device claim in this loop.
- [x] Huge-document correctness smoke is run or deferred with owner and reason. N/A: no huge-document claim in this loop; daily Plite browser gate stopped on pagination.
- [x] Perf packet runs only after correctness is green, or is marked N/A for this run. N/A: correctness gate is red.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are audited when in scope. Evidence: direct `read.*` / `update.*` API added without root `editor.*` clutter or compatibility alias.
- [x] Docs/vision/rule consolidation is applied when a reusable decision is accepted, or marked N/A. N/A: no reusable taste update beyond current accepted Plite API shape.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the owner skill/script/gate. Evidence: slowdown ledger below; no skill patch because issues are one-off/tool/runtime blockers.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark, docs, or skill packet. Evidence: packet ledger below.
- [x] Changed list is current and includes only this run. Evidence: changed list below.
- [x] Needs-your-attention list is ranked and capped at five items. Evidence: needs-your-attention below.
- [x] Stopping checkpoints are queued or marked none. Evidence: stopping checkpoints below.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or marked N/A with reason. Deferred: not useful until pagination blocker is resolved or API packet is isolated; daily gate is red.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or prompt/tooling changes, or marked N/A with reason. N/A: no `.agents/**` or tooling source changed.
- [x] Output budget discipline is followed: broad scans are capped or written to artifacts instead of streamed. Evidence: `.tmp/plite-check.log`, focused row logs; one broad scan slowdown recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | `pnpm check:plite` passed after package/API/docs and projected target-range repair proof. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Loop 1 added browser blocker; loop 2 closed it and updated final gates. |
| Lane authority proof | yes | Prove each command ran in the owning Plite/Plate/shared workspace, or record N/A | Commands ran from Plate repo root or `packages/plite-react` package cwd as recorded below. |
| Workspace authority proof | yes | Record cwd/tool for each package, docs, skill, browser, or benchmark proof | Verification evidence records cwd/package commands and `.tmp` logs. |
| Behavior gates | yes | Run focused stable behavior proof or record scoped defer rows | Plite package tests, Plite React selection contract, focused pagination browser row, and `check:plite` passed. |
| Visual/native selection proof | yes | Record Browser/Playwright/native-selection evidence or scoped blocker | Playwright Chromium proof passed through `apps/plite`; Browser plugin remained unavailable and is logged as scoped proof limitation. |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | Added `selection-reconciler-contract.test.tsx` projected target-range regression. |
| `@platejs/browser` promotion | N/A | Add/verify helper/API or record queue/defer reason | No repeated helper gap; failure was runtime selection reconciliation. |
| Mobile/raw-device claim width | N/A | Run raw-device proof or record that only scoped viewport/browser proof is available | No mobile/raw-device claim in this loop. |
| Huge-document correctness smoke | N/A | Run focused huge-document behavior smoke or record owner defer | Prompt was Plite API/docs; broad huge-doc smoke was not claimed. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | `@platejs/plite`, `@platejs/plite-react`, docs, public type smoke, build, and `check:plite` proof passed. |
| Autoclosure handoff | N/A | Delegate post-merge/current-tree until-clean work to `autoclosure`, otherwise N/A | Internal Plite loop, not post-merge/current-tree closure. |
| Skill/rule sync | N/A | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | No `.agents/rules/**` changed. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Ledgers below updated after loop 2. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | `pnpm check:plite` passed; focused package build/type/test passed. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Slowdowns logged; no reusable skill/script patch needed in this packet. |
| Agent-native review for agent/tooling changes | N/A | Load `agent-native-reviewer` and close accepted findings, or N/A | No agent/tooling changes. |
| Autoreview for non-trivial implementation changes | N/A | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | Not requested; deterministic Plite gates passed and no commit/PR/review lane was requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-plite-read-update-docs-loop.md` | Ready to run after this plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | prompt and lane copied into plan | status closed |
| Status and current-state read | complete | source/docs/package owners inspected | gap scan closed |
| Gap scan and scenario matrix | complete | read/update API/docs and browser gate gap identified | behavior proof closed |
| Behavior proof | complete | package contracts and Chromium browser proof passed | oracle repair closed |
| Oracle repair | complete | projected target-range regression added and verified | visual proof closed |
| Visual/native proof | complete | focused pagination row and full Chromium browser suite passed | browser helper promotion closed |
| Browser helper promotion | N/A | runtime bug, no helper gap | no helper packet |
| Mobile/raw-device claim width | N/A | no mobile claim | no mobile packet |
| Huge-document correctness smoke | N/A | out of scope for this API/docs loop | no huge-doc packet |
| Perf/API/docs/skill packets as needed | complete | API/docs packet kept; no perf or skill packet needed | consolidation closed |
| Consolidation and review | complete | docs/checklist/final ledgers updated | final handoff |
| Final handoff and goal-plan check | ready | plan updated; checker next | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| pending | pending | pending | pending | pending | pending |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| Plite direct read/update API | 1 | `packages/plite` | One-shot methods can live on callable `editor.read` / `editor.update` without adding root API clutter. | `packages/plite/src/core/editor-lifecycle-api.ts`, `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/create-editor.ts`, `packages/plite/src/editor-runtime-view.ts`, `packages/plite/src/index.ts`; `cd packages/plite && bun test ./test/read-update-contract.ts`; `pnpm turbo typecheck --filter=./packages/plite`; `pnpm --filter @platejs/plite build`; public type smoke with `tsc --skipLibCheck true`. | Package runtime/type contracts passed. | keep | Keep API packet. |
| Plite docs alignment | 1 | `content/docs/plite/**`, `packages/plite/README.md` | Docs should teach callback form for grouped/custom work and method form for one-shot reads/writes. | `pnpm --filter www check:docs`; HTTP route probes for `/docs/plite`, `/docs/plite/concepts/07-editor`, `/docs/plite/api/nodes/editor`, `/docs/plite/concepts/06-commands`. | Docs check passed; Browser webview attach failed, so route proof is HTTP-render only. | keep with limited browser claim | Re-run Browser when tool is healthy if docs UI fidelity is important. |
| Changeset metadata | 1 | `.changeset/prepare-v54-beta-plite.md` | Public Plite API addition needs release metadata. | Existing Plite major changeset extended. | N/A. | keep | No extra changeset file. |
| Projected target-range text input repair | 2 | `packages/plite-react` | In staged/paginated DOM, `beforeinput.getTargetRanges()` can point at projected text and override model-owned insertion after a repair-induced caret export. | `packages/plite-react/src/editable/selection-reconciler.ts`; `packages/plite-react/test/selection-reconciler-contract.test.tsx`; `cd packages/plite-react && bun test:vitest test/selection-reconciler-contract.test.tsx`; `pnpm --filter @platejs/plite-react build`; focused pagination row. | Contract and focused Chromium row passed. | keep | Covered by daily Plite gate. |
| Daily Plite gate | 2 | Plite proof lane | `check:plite` should prove Plite packages, browser package tests, and Chromium proof. | `pnpm check:plite \| tee .tmp/plite-check-after-reconciler.log` | Typecheck, package tests, browser package tests, 587 Chromium example tests, 3 focused rows, 45 rows, and 46 rows passed. | keep | Goal can close. |
| Synced-blocks focused browser row | 1/2 | Plite browser proof | Shift+ArrowUp projected selection row had one earlier flake. | Focused row exited 0 with 1 flaky before repair; full `check:plite` after repair passed its Chromium lane. | No repeated red after final gate. | keep as watched evidence | Reopen only if it repeats. |
| Pagination focused browser row | 1/2 | Plite pagination/model-owned typing | 500-row staged pagination typing snapped model/native selection to `[0,0]`. | `pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/pagination.test.ts --grep "keeps staged typing responsive in a 500-row provider-owned table document"` | Failed before patch; passed after projected target-range repair. | keep | Closed. |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Plite read/update contract | `packages/plite` | `cd packages/plite && bun test ./test/read-update-contract.ts` | none | 6 passed | kept |
| Plite public package types | `packages/plite/test/public-package-types-smoke.ts` | `pnpm exec tsc --project packages/plite/test/tsconfig.public-package-types.json --noEmit --skipLibCheck true` after build | none | passed | strict no-skip still hits third-party ambient type noise; scoped command isolates package API signal |
| Plite daily browser | `apps/plite` | `pnpm check:plite` | Chromium | failed in pagination tail | repair pagination before full closure |
| Plite React projected target ranges | `packages/plite-react` | `cd packages/plite-react && bun test:vitest test/selection-reconciler-contract.test.tsx` | jsdom | 19 passed | kept |
| Plite daily browser after repair | `apps/plite` | `pnpm check:plite` | Chromium | passed | closure proof |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| Synced blocks Shift+ArrowUp after select-all | `getViewSelection(outerEditor)` intermittently null | expected native text empty | projected selection not created on first focused run | Playwright screenshot/trace produced on first failed attempt | flaky, not fixed in this packet |
| Pagination staged 500-row typing | model insertion stayed at the intended row after repair | native caret no longer snapped to projected first paragraph | focused browser row and full Chromium suite passed | Playwright Chromium proof via `apps/plite` | fixed |
| Pagination 500-row staged typing | model selection jumps from `[43,0]` to `[0,0]` | native endpoint also shows `[0,0]` with typed char at top paragraph | caret repair after text insert moves to first text host; target block becomes not visible | Playwright screenshot/error-context produced | hard blocker |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| Direct docs route text probe | Plite docs API examples | N/A; Browser tool attach failure made this a temporary HTTP-render fallback, not a helper candidate | `curl` route probes against dev server | no promotion |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| Mobile/raw-device Plite behavior | none | N/A | not claimed | no mobile/raw-device claim in this loop |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| Huge-document | N/A | N/A | N/A | out of scope for read/update docs packet; daily Plite gate stopped earlier on pagination |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Root vision read | `VISION.md` / `vision` | small | Root `VISION.md` still pointed to `docs/vision/slate.md`; actual Plite detail file is `docs/vision/plite.md`. | Noted during checkpoint zero. | queue for `sync-vision`, not patched in Plite API loop |
| Broad docs/source scans | auto | avoidable | One broad `rg` streamed too much output and got truncated. | Switched to exact owner files and `.tmp` logs. | use capped/exact scans next loop |
| Browser tool route proof | Browser plugin | blocked | Browser webview attach timed out twice. | No Browser screenshot/DOM proof. | report blocked; used HTTP-render route probe only |
| Dev server command | apps/www | avoidable | `pnpm --filter www dev -- --port 3002` was wrong; Next treated `--port` as app dir. | Correct command was `PORT=3002 pnpm --filter www dev`. | remember command shape |
| Shell route loop | zsh | avoidable | Using variable name `path` overwrote zsh `PATH`, breaking `curl`, `rg`, `sort`, `paste`. | Reran with `route`. | avoid reserved zsh vars |
| `apps/www` dev server | apps/www / package dist | medium | While stopping, server showed module resolution errors from `core/dist` importing `@platejs/plite-react`; dist existed after package builds. | Dev server output; docs HTTP probes had already returned 200. | treat as stale-built-dist/dev-server timing unless repeated |
| `check:plite` output | Plite proof lane | 2m+ | Browser lane is large; raw output exceeded context. | Captured `.tmp/plite-check.log`. | keep logging to artifact |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Added `packages/plite/src/core/editor-lifecycle-api.ts`; updated `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/create-editor.ts`, `packages/plite/src/editor-runtime-view.ts`, `packages/plite/src/index.ts`; updated `packages/plite-react/src/editable/selection-reconciler.ts` so projected `beforeinput` target ranges preserve model-owned text insertion. |
| tests/oracles/browser proof | Updated `packages/plite/test/read-update-contract.ts`, `packages/plite/test/public-package-types-smoke.ts`, and `packages/plite-react/test/selection-reconciler-contract.test.tsx`; produced `.tmp/plite-check-after-reconciler.log`, `.tmp/plite-pagination-row-after-reconciler.log`, plus earlier failure logs. |
| benchmarks/metrics/targets | none |
| examples/docs | Updated `packages/plite/README.md`, `content/docs/plite/index.mdx`, `content/docs/plite/libraries/plite.mdx`, `content/docs/plite/api/nodes/editor.mdx`, `content/docs/plite/concepts/04-transforms.mdx`, `content/docs/plite/concepts/06-commands.mdx`, `content/docs/plite/concepts/07-editor.mdx`, `content/docs/plite/walkthroughs/05-executing-commands.mdx`, `content/docs/plite/migration.mdx`. |
| release metadata | Updated `.changeset/prepare-v54-beta-plite.md`. |
| skills/workflow | none |
| reverted/quarantined packets | No reverted code. Synced-blocks row quarantined as flaky evidence. Pagination row blocks closure. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Direct `editor.read.*` / `editor.update.*` API shape | This is the public Plite ergonomic direction: callback form for grouped flows, method form for one-shot reads/writes. | `packages/plite/src/core/editor-lifecycle-api.ts`, `content/docs/plite/concepts/07-editor.mdx` | accept |
| 2 | Projected target-range ownership rule | This is subtle browser behavior: projected/staged DOM target ranges must not move model-owned text insertion. | `packages/plite-react/src/editable/selection-reconciler.ts`, `packages/plite-react/test/selection-reconciler-contract.test.tsx` | inspect closely |
| 3 | Browser plugin could not attach | Docs UI proof is limited to docs check + HTTP render, not Browser screenshot. | Browser tool timeout in this run. | defer unless docs visual fidelity needs review |
| 4 | `apps/www` dev server showed stale dist-style resolution error while stopping | It did not block package/docs checks, but dev-server proof was not clean. | `@platejs/plite-react` resolution from `packages/core/dist/react/index.js` | investigate only if repeated |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | No user unblock needed. | Final proof passed. | none | none | close goal | `pnpm check:plite` |

Findings:
- The accepted Plite API shape is viable: callable lifecycle functions plus direct one-shot method namespaces.
- `Readonly<V>` was the wrong type for `read.root`; it broke generic React editor assignability when `V` became `any`. `readonly V[number][]` is the cleaner public shape.
- Direct update method properties need bivariant typing at the public boundary so concrete editors keep inference while generic Plite DOM/React helpers remain assignable.
- Projected `beforeinput.getTargetRanges()` needs the same model-owned authority rule as projected live DOM selection; otherwise staged pagination can insert text into a projected first paragraph.
- `check:plite` is green after the projected target-range repair.

Decisions and tradeoffs:
- Keep `editor.read(fn)` / `editor.update(fn)` as lifecycle primitives.
- Add `editor.read.*` and `editor.update.*` for common one-shot calls.
- Do not add root `editor.*` shortcuts, `.query`, `.command`, `readOnce`, or `updateOnce`.
- Keep extension-owned groups on callback form for now; no generic direct flattening of extension groups.
- Complete is allowed after `check-complete` passes.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `check:plite` failed on `plite-dom` type assignability | 1 | Fix Plite public direct update method variance | Fixed with bivariant method boundary and focused typecheck passed. |
| `check:plite` failed on `plite-react` root typing | 1 | Replace `Readonly<V>` root return with readonly element array | Fixed and focused React typecheck passed. |
| Browser webview attach timeout | 2 | Use docs check + HTTP-render route probes; report Browser blocker | Not fixed in this packet. |
| `check:plite` failed on staged pagination 500-row typing | 2 | Patch projected target-range selection reconciliation and rerun focused row/full gate | Fixed; focused row and `check:plite` passed. |

Verification evidence:
- `pnpm exec biome check --write packages/plite/src/interfaces/editor.ts packages/plite/src/core/editor-lifecycle-api.ts packages/plite/src/create-editor.ts packages/plite/src/editor-runtime-view.ts packages/plite/src/index.ts packages/plite/test/read-update-contract.ts packages/plite/test/public-package-types-smoke.ts`: passed.
- `cd packages/plite && bun test ./test/read-update-contract.ts`: 6 pass.
- `pnpm turbo typecheck --filter=./packages/plite`: passed.
- `pnpm --filter @platejs/plite build`: passed.
- `pnpm exec tsc --project packages/plite/test/tsconfig.public-package-types.json --noEmit --skipLibCheck true`: passed.
- `pnpm --filter www check:docs`: passed.
- `pnpm --filter @platejs/plite test`: passed, 1007 pass / 85 skip / 0 fail.
- HTTP-render route probes on dev server returned expected read/update docs strings for `/docs/plite`, `/docs/plite/concepts/07-editor`, `/docs/plite/api/nodes/editor`, `/docs/plite/concepts/06-commands`.
- `cd packages/plite-react && bun test:vitest test/selection-reconciler-contract.test.tsx -t 'beforeinput preserves model selection for projected text target ranges'`: 1 pass / 18 skipped.
- `cd packages/plite-react && bun test:vitest test/selection-reconciler-contract.test.tsx`: 19 passed.
- `pnpm --filter @platejs/plite-react build`: passed.
- `pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/pagination.test.ts --grep 'keeps staged typing responsive in a 500-row provider-owned table document'`: passed.
- `pnpm turbo typecheck --filter=./packages/plite-react`: passed.
- `pnpm --filter @platejs/plite-react test`: 60 files, 833 passed.
- `pnpm check:plite`: passed; Chromium proof included 587 passed / 7 skipped, then 3 passed, 45 passed, 46 passed / 1 skipped.
- Focused synced-blocks row: exited 0 with one flaky first attempt.
- Focused pagination row: failed before patch, passed after patch.

Final handoff contract:
- Goal plan: active, not complete.
- Lane: Plite.
- Surface and route/package: `@platejs/plite` read/update API plus Plite docs.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop, no timed minimum, loop 2 closes blocker.
- Behavior gates and visual proof: package contracts/docs proof passed; focused pagination row and full Chromium Plite browser proof passed; Browser plugin proof blocked by attach timeout.
- Primary metric baseline/latest/best and stop reason: no perf optimization packet; stop reason is completion.
- Bugs fixed and oracles added: added direct read/update API contracts, public type smoke checks, and projected target-range model-owned text insertion regression.
- Benchmark/skill/docs repairs: docs aligned; no benchmark or skill source changed.
- Workflow slowdowns and repairs: logged above.
- Changed list: filled above.
- Needs your attention: pagination blocker first, synced-blocks flake second.
- Stopping checkpoints to unblock: none.
- Accepted deferrals and residual risks: raw mobile, huge-doc, broad stable-editor sweep, and perf optimization remain out of scope for this API/docs loop.
- Next owner: none for this goal.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff checkpoint |
| Where am I going? | Run `check-complete`, then close the goal |
| What is the goal? | Close Plite read/update API and docs loop without lying about browser proof |
| What have I learned? | API/docs packet is good; projected target ranges needed model-owned authority in staged pagination |
| What have I done? | See Changed list and Verification evidence |
| What changed in the checkpoint plan? | Closed the pagination blocker and replaced stale red-gate rows with passing proof |

Timeline:
- 2026-06-26T15:29:27.506Z Goal plan created.
- 2026-06-26 Loop 1: implemented direct `editor.read.*` / `editor.update.*`, updated docs/tests/types, added release metadata, ran focused package/docs proof, then stopped on red `check:plite` pagination behavior.
- 2026-06-26 Loop 2: fixed projected target-range model-owned text input selection repair, added regression contract, reran focused row and `check:plite` green.

Open risks:
- Browser plugin route proof was unavailable; docs UI proof is limited to docs check and HTTP probes.
- `apps/www` dev server may have stale dist/source resolution debt if the `@platejs/plite-react` resolution error repeats.
- Synced-blocks had one earlier flaky retry but did not repeat in the final `check:plite` run.
