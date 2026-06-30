# plate core parser plugin drift repair

Objective:
Repair Plate Core parser/plugin drift; done when parser runtime ownership is plugin-owned again, adjacent Core extension drift is audited, focused Core proof passes, and this plan closes.

Goal plan:
docs/plans/2026-06-27-plate-core-parser-plugin-drift-repair.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user-invoked auto repair
- prompt / link: "where the fuck that diff went packages/core/src/lib/plugins/ParserPlugin.ts - $auto repair all plate core for related drift"
- lane: Plate
- surface / route / package: `packages/core`
- invocation mode: full-loop
- minimum runtime / deadline: N/A: no timed checkpoint requested
- completion threshold summary: `ParserPlugin` owns parser runtime installation again; related Core plugin extension drift is audited/repaired; focused Core plugin tests and Core typecheck pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: full-loop to proof boundary
- initial confidence score: N/A: binary package/API repair
- improvement loop: audit adjacent Core plugin extension drift after the parser fix
- final score / loop closure: complete only after source audit, tests, typecheck, and plan check

Completion threshold:
- `ParserPlugin` is no longer an empty marker while parser behavior lives in anonymous `withPlite` glue.
- Parser runtime command installation is owned by the plugin extension path, without restoring legacy `overrideEditor`, `editor.tf`, or public compat aliases.
- Adjacent Core plugin extension ownership drift is audited and normalized where the same mistake is visible.
- Focused Core parser/plugin tests and Core typecheck pass.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-core-parser-plugin-drift-repair.md` passes.

Verification surface:
- Source audit: `ParserPlugin`, runtime parser install path, `withPlite` install sequence, and Core plugin extension declarations.
- Focused tests: `pnpm --filter @platejs/core exec bun test src/lib/plugins/ParserPlugin.spec.ts src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/plugin/createBasePlugin.spec.ts src/lib/plugins/length/LengthPlugin.spec.ts`
- Package typecheck: `pnpm turbo typecheck --filter=./packages/core`
- Final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-core-parser-plugin-drift-repair.md`
- Browser proof: N/A: no browser-visible route touched; this is package runtime/plugin ownership.
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
- Source of truth: `packages/core/src/**` and this plan
- Allowed edit scope: Core parser/runtime/plugin source, focused Core tests, and this plan
- Browser surfaces: N/A: no `content/**`, `apps/www/**`, or browser route change expected
- Package/API surfaces: internal Core plugin/runtime API only; public compat aliases are forbidden
- Agent/skill surfaces: N/A unless Auto/checkpoint workflow itself fails
- Docs/research surfaces: this plan only
- Non-goals: no release/PR/publish; no Plate v2 broad API redesign; no Plite runtime API redesign unless the parser repair proves a missing substrate hook

Output budget strategy:
- Use exact file reads and focused `rg` over `packages/core/src/lib/plugins`, `packages/core/src/lib/editor`, and `packages/core/src/internal`. No repo-wide broad output unless written to an artifact first.

Blocked condition:
- Stop only if the repair requires a new public Plite insert-data API decision instead of Core-local plugin ownership, or if focused Core proof exposes a broader unsafe runtime fork.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: Plate
- surface: `packages/core`
- mode: full-loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 0
- current_checkpoint: checkpoint-zero
- current_checkpoint_status: in_progress
- next_checkpoint: status
- goal_status: active

Current verdict:
- verdict: keep
- confidence: high for scoped Core packet
- next owner: plate-next for broader `OverridePlugin.overrideEditor` retirement, if reopened
- keep / revert / quarantine call: keep
- reason: parser runtime installation is plugin-owned again, related Core plugin extension drift was audited, focused tests/typecheck/lint pass

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-core-parser-plugin-drift-repair.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | complete | P0 | Copy prompt requirements before implementation. | User prompt copied into Automation source; scoped to `packages/core` parser/plugin drift. | update |
| status | auto | complete | P0 | Read active plan, latest prompt, and current evidence. | Source reads covered `ParserPlugin`, `runtimeParser`, `withPlite`, `DOMPlugin`, `HistoryPlugin`, `LengthPlugin`, `getCorePlugins`. | update |
| gap-scan | auto | complete | P0 | Identify related Core plugin drift. | Audit found empty `ParserPlugin`, unconditional parser install in `withPlite`, old `DOMPlugin` extension boilerplate, and unrelated `OverridePlugin.overrideEditor`. | split |
| closure-handoff | autoclosure | complete | N/A | Post-merge/current-tree closure not requested. | N/A: this is a focused Auto repair packet. | retire |
| behavior-proof | core test owner | complete | P0 | Prove parser behavior. | Focused Core tests passed: 34 pass / 0 fail. | update |
| oracle-repair | core test owner | complete | P0 | Add missing ownership oracle. | Added regression proving replacing `ParserPlugin` removes parser runtime behavior. | update |
| visual-proof | Browser / Playwright | complete | N/A | No browser route or visual selection surface touched. | N/A: package runtime/plugin command ownership only. | retire |
| browser-helper-promotion | lane proof harness | complete | N/A | No repeated browser proof pattern. | N/A: no browser proof involved. | retire |
| mobile-claim-width | auto | complete | N/A | No mobile claim. | N/A: no mobile/browser claim. | retire |
| huge-document-smoke | lane proof owner | complete | N/A | No huge-document behavior touched. | N/A: parser plugin ownership only. | retire |
| perf-packet | lane perf owner | complete | N/A | No perf claim. | N/A: no performance packet. | retire |
| supervision-mode | auto | complete | N/A | No timed minimum runtime. | N/A: full-loop packet reached proof boundary. | retire |
| consolidation | auto | complete | P1 | Record reusable decision in plan. | Decision recorded: plugin-owned runtime behavior should not live in unconditional `withPlite` glue. | update |
| final-handoff | auto | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows filled below. | update |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded by scoped rows |
| 1 | update | checkpoint-zero/status | source reads and prompt extraction | repair needed concrete ownership scope | complete |
| 1 | split | gap-scan | `rg` audit and focused source reads | distinguish parser drift from unrelated `OverridePlugin` legacy hook | complete |
| 1 | retire | browser/mobile/huge/perf rows | no route, visual, device, huge-doc, or metric touched | avoid fake proof ceremony | complete |

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
| Prompt requirements captured before work | yes | Automation source records the exact user prompt and scoped repair target. |
| `auto` source rule read or fallback recorded | yes | `.agents/skills/auto/SKILL.md` read completely in chunks. |
| `vision` read as checkpoint zero | no | N/A: no taste/API fork; source evidence determined the repair. |
| Active goal checked or created | yes | `get_goal` returned no active goal; `create_goal` created this scoped objective. |
| Lane resolved | yes | Plate lane, `packages/core`. |
| Invocation mode and timebox recorded | yes | Full-loop mode; no timed checkpoint. |
| Dynamic checkpoint policy accepted | yes | Checkpoint table reconciled after evidence. |
| Source of truth and allowed workspaces recorded | yes | `packages/core/src/**` and this plan. |
| Output budget strategy recorded | yes | Exact file reads and focused `rg` only. |
| Release/PR/publish boundary recorded | yes | N/A: not requested. |
| Browser proof strategy recorded | yes | N/A: no browser-visible surface touched. |
| Package/API proof strategy recorded | yes | Focused Core tests, lint fix, Core typecheck, source audit. |
| Mobile/raw-device claim-width policy recorded | yes | N/A: no mobile claim. |
| Skill repair authority and source-rule boundary recorded | yes | N/A: no skill/rule miss found. |

Work Checklist:
- [x] First checkpoint complete: explicit prompt captured; no timing constraint; deliverable is repaired Core parser/plugin drift with proof.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Plate `packages/core`, with package tests/typecheck proof named.
- [x] Checkpoint supervisor table has been reconciled after source evidence.
- [x] Post-merge/current-tree closure is marked N/A because this is not already-applied closure.
- [x] Loop ended with checkpoint mutation decisions: update/split/retire.
- [x] Current-state packet recorded through source reads before patching.
- [x] Behavior proof packet recorded through focused Core parser/plugin tests.
- [x] Visual/native selection proof marked N/A because no browser/editor route surface changed.
- [x] Missing oracle packet written: parser replacement no longer gets parser runtime behavior.
- [x] Repeated browser proof promotion marked N/A because no browser proof pattern was involved.
- [x] Mobile/raw-device proof marked N/A because no mobile claim exists.
- [x] Huge-document correctness smoke marked N/A because huge-doc behavior was untouched.
- [x] Perf packet marked N/A because no metric/perf claim exists.
- [x] Package/API hard-cut audit completed for parser runtime ownership and adjacent Core plugin extension declarations.
- [x] Docs/vision/rule consolidation marked N/A because no reusable taste rule changed.
- [x] Workflow slowdown logged: first focused test caught DOM extension-name conflict; fixed and reran.
- [x] Packet ledger contains source repair, oracle, proof, and audit rows.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped.
- [x] Stopping checkpoints are marked none for this run.
- [x] Autoreview/review gate marked N/A: focused package proof sufficient for small scoped packet; user did not ask pre-commit review.
- [x] Agent-native review marked N/A: no `.agents/**`, commands, skills, hooks, or prompt/tooling changed.
- [x] Output budget discipline followed: focused file reads and `rg` only.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused source audit, tests, lint, typecheck | Tests: 34 pass / 0 fail; Core typecheck passed; lint fix passed. |
| Dynamic checkpoint reconciliation | yes | Update table from evidence | Seed rows updated/split/retired after source audit. |
| Lane authority proof | yes | Prove commands ran in owning workspace | Commands ran from `/Users/zbeyens/git/plate-2`, targeting `@platejs/core`. |
| Workspace authority proof | yes | Record cwd/tool for each proof | All proof commands ran in Plate repo root. |
| Behavior gates | yes | Run focused Core parser/plugin behavior proof | `ParserPlugin.spec.ts`, `DOMPlugin.spec.ts`, `createBasePlugin.spec.ts`, `LengthPlugin.spec.ts` passed. |
| Visual/native selection proof | no | Record scoped reason | N/A: package command/plugin ownership only. |
| Missing oracle repair | yes | Add/verify ownership regression | `ParserPlugin.spec.ts` proves replacing `ParserPlugin` disables parser runtime behavior. |
| `@platejs/browser` promotion | no | Record reason | N/A: no browser helper pattern. |
| Mobile/raw-device claim width | no | Record reason | N/A: no mobile/device claim. |
| Huge-document correctness smoke | no | Record reason | N/A: no huge-document behavior touched. |
| Package/API proof | yes | Source audit and package proof | Audit shows no unconditional parser install in `withPlite`; tests/typecheck green. |
| Autoclosure handoff | no | Record reason | N/A: not current-tree/post-merge closure. |
| Skill/rule sync | no | Record reason | N/A: no `.agents/rules/**` changes. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers | Ledgers below filled. |
| Final lint/check | yes | Run scoped lint/typecheck | `pnpm --filter @platejs/core lint:fix`; `pnpm turbo typecheck --filter=./packages/core` passed. |
| Workflow slowdown review | yes | Log slow step | First focused test failed on `dom` extension-name conflict; fixed by naming `core-dom`; rerun passed. |
| Agent-native review for agent/tooling changes | no | Record reason | N/A: no agent/tooling changes. |
| Autoreview for non-trivial implementation changes | no | Record reason | N/A: small scoped package packet with focused proof; user did not request pre-commit review. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-core-parser-plugin-drift-repair.md` | To run after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | prompt and scoped proof recorded | status |
| Status and current-state read | complete | source reads and `rg` audits recorded | gap scan |
| Gap scan and scenario matrix | complete | parser drift and adjacent Core plugin extension drift classified | behavior proof |
| Behavior proof | complete | focused Core tests passed | oracle repair |
| Oracle repair | complete | parser replacement regression added | visual proof |
| Visual/native proof | complete | N/A: no browser-visible surface | browser helper promotion |
| Browser helper promotion | complete | N/A: no repeated browser helper | mobile claim width |
| Mobile/raw-device claim width | complete | N/A: no mobile claim | huge-document smoke |
| Huge-document correctness smoke | complete | N/A: no huge-doc surface | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | complete | no perf/docs/skill packet needed | consolidation |
| Consolidation and review | complete | decision recorded; `OverridePlugin` follow-up ranked | final handoff |
| Final handoff and goal-plan check | complete | final ledgers filled | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| `packages/core` parser runtime | base and React Plate editors | N/A package tests | `insertData` with parser match, fallback, plugin replacement | editor value and command return | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| parser-plugin-ownership | 1 | `@platejs/core` | `ParserPlugin` became empty while parser behavior installed unconditionally in `withPlite`. | `runtimeParser.ts`, `ParserPlugin.ts`, `withPlite.ts`, `ParserPlugin.spec.ts` | focused tests passed; no visual proof applies | keep | none |
| dom-plugin-extension-shape | 1 | `@platejs/core` | `DOMPlugin` used old `extend({ extensions: defineEditorExtension(...) })` boilerplate. | `DOMPlugin.ts`, `DOMPlugin.spec.ts` | focused tests passed after explicit `core-dom` name | keep | none |
| adjacent-drift-audit | 1 | `@platejs/core` | Need verify related Core plugin drift. | `rg` audit over Core plugin/editor/internal paths | no unconditional parser install or plugin `extensions: defineEditorExtension` remains | keep | `OverridePlugin` follow-up only |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Core parser/plugin behavior | `@platejs/core` | `pnpm --filter @platejs/core exec bun test src/lib/plugins/ParserPlugin.spec.ts src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/plugin/createBasePlugin.spec.ts src/lib/plugins/length/LengthPlugin.spec.ts` | N/A | 34 pass / 0 fail | none |
| Core package type safety | `@platejs/core` | `pnpm turbo typecheck --filter=./packages/core` | N/A | pass | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| N/A package runtime ownership | N/A | N/A | N/A | N/A | no browser-visible surface touched |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| N/A | N/A | N/A | N/A | no browser helper work |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| N/A | N/A | N/A | N/A | no mobile claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| N/A | N/A | N/A | N/A | no huge-document surface |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| first focused test run | `@platejs/core` | under 1s | `DOMPlugin` default extension name `dom` conflicted with React/DOM extension | failure: `Editor extension "dom" conflicts with "react"` | fixed by explicit `core-dom` extension name, reran green |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `ParserPlugin` owns `createPlateRuntimeParserExtension`; `withPlite` no longer installs parser runtime unconditionally; `DOMPlugin` uses `.extendExtension({ name: 'core-dom' })`. |
| tests/oracles/browser proof | Added parser replacement regression; focused Core tests passed. |
| benchmarks/metrics/targets | none |
| examples/docs | none |
| skills/workflow | none |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `OverridePlugin.overrideEditor` remains | It is unrelated to parser drift, but it is still the old override hook for merging plugin element behavior into Plite read/schema APIs. | `packages/core/src/lib/plugins/override/OverridePlugin.ts` | inspect later under `plate-next`; do not mix into this parser packet |
| 2 | `DOMPlugin` extension name is explicit | Default `dom` name conflicts with React/DOM extension; explicit name is necessary here. | `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | accept |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | none | no user decision needed | none | focused repair completed | continue with later Plate-next cleanup when desired | this plan |

Findings:
- `ParserPlugin.ts` was reduced to an empty marker while parser behavior lived in `installPlateRuntimeParserExtension(editor)` called unconditionally from `withPlite.ts`.
- `DOMPlugin.ts` had related extension-boilerplate drift but needed an explicit non-conflicting extension name.
- `HistoryPlugin.ts` and `LengthPlugin.ts` already used acceptable extension ownership shapes.
- `OverridePlugin.ts` still uses `.overrideEditor(withOverrides)`, but that is a broader Plate-next cleanup, not parser drift.

Decisions and tradeoffs:
- Keep parser/plain-text insert-data behavior inside `ParserPlugin` because normal editors install the core plugin by default.
- Do not invent a new public Plite insert-data API in this packet; Core command installation remains internal until a broader Plite plan accepts a substrate hook.
- Use explicit `core-dom` extension name because default `dom` conflicts with React/DOM extension.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Default `DOMPlugin` extension name `dom` conflicted with React extension | 1 | use plugin-owned extension with explicit non-conflicting name | renamed extension to `core-dom`; focused tests passed |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/ParserPlugin.spec.ts src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/plugin/createBasePlugin.spec.ts src/lib/plugins/length/LengthPlugin.spec.ts` -> 34 pass, 0 fail.
- `pnpm --filter @platejs/core lint:fix` -> pass, fixed 2 files.
- Rerun focused Core tests -> 34 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/core` -> pass.
- `pnpm check:core` -> pass: Core + Plite typecheck, Core type contracts, Core/Plite lint, Core tests, and Plite tests green.
- Source audit: no `installPlateRuntimeParserExtension(editor)` call remains outside `runtimeParser`; no Core plugin source has `extensions: defineEditorExtension`; no `plate:dom` / `plate:parser` hit remains.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-27-plate-core-parser-plugin-drift-repair.md`
- Lane: Plate
- Surface and route/package: `packages/core`
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop; no timed minimum; one repair loop
- Behavior gates and visual proof: focused Core package tests passed; visual proof N/A
- Primary metric baseline/latest/best and stop reason: N/A; package ownership repair, not perf
- Bugs fixed and oracles added: parser plugin ownership fixed; parser replacement regression added
- Benchmark/skill/docs repairs: none
- Workflow slowdowns and repairs: DOM extension-name conflict fixed
- Changed list: filled above
- Needs your attention: filled above
- Stopping checkpoints to unblock: none
- Accepted deferrals and residual risks: broader `OverridePlugin.overrideEditor` cleanup deferred to Plate-next
- Next owner: none for parser packet; `plate-next` if continuing broader Core cleanup

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final plan check |
| Where am I going? | Run `check-complete`, complete goal, hand off |
| What is the goal? | Repair Plate Core parser/plugin drift with focused package proof |
| What have I learned? | See Findings |
| What have I done? | See Timeline |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger |

Timeline:
- 2026-06-27T10:57:56.430Z Goal plan created.
- 2026-06-27 Parser ownership drift confirmed from `ParserPlugin.ts`, `runtimeParser.ts`, and `withPlite.ts`.
- 2026-06-27 Parser runtime installation moved behind `ParserPlugin.extendExtension(...)`.
- 2026-06-27 `DOMPlugin` normalized to `.extendExtension(...)` with explicit `core-dom` name after conflict proof.
- 2026-06-27 Focused Core tests, lint fix, rerun, and Core typecheck passed.

Open risks:
- `OverridePlugin.overrideEditor` remains broader Plate-next debt, not repaired here.
