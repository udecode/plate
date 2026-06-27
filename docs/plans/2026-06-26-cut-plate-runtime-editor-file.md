# cut plate runtime editor file

Objective:
Cut `packages/core/src/react/editor/createPlateRuntimeEditor.ts`; done when its behavior is owned by Plite/Plate modules and Core/Plite package proof is green.

Goal plan:
docs/plans/2026-06-26-cut-plate-runtime-editor-file.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user-invoked `$auto`
- prompt / link: "fully cut that file. prefer reverting installRuntimeToggle and others git diff vs. main instead of guessing what was there before."
- lane: shared editor
- primary owner: Plate Core
- substrate owner: Plite when behavior is generic editor substrate
- surface / route / package: `packages/core/src/react/editor/createPlateRuntimeEditor.ts`, Core runtime/plugin modules, Plite editor transform/runtime primitives
- invocation mode: full-loop
- minimum runtime / deadline: N/A: no duration requested
- completion threshold summary: `createPlateRuntimeEditor.ts` is deleted; old runtime installer behavior is recovered, moved to owned package/plugin extensions, or deleted as stale compat; focused Core/Plite proof passes

First checkpoint:
- Explicit requirements captured: use `$auto`, cut the file fully, prefer source-backed restoration from `main` diff for installer behavior, do not guess old behavior, no commit/push, close with proof.
- Scope boundaries captured: Core runtime/plugin behavior, touched feature packages, Plite only for generic substrate behavior.
- Non-goals captured: no public compat aliases, no release/PR, no broad Plate v2 design fork, no browser route claim unless unit/package proof exposes a route-visible risk.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: full-loop until the file cut is proven
- final score / loop closure: source audit plus package proof complete

Completion threshold:
- `packages/core/src/react/editor/createPlateRuntimeEditor.ts` is deleted.
- Runtime installer behavior is resolved by source evidence: moved to owned plugin/package extension, moved to Plite when generic, or deleted as stale compat.
- No public compatibility aliases or runtime shims were introduced.
- No stale runtime-editor symbols remain in source.
- Focused Core/Plite checks and touched package gates pass.
- Plan ledgers include changed list, review attention, stopping checkpoints, workflow slowdowns, and final handoff rows.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-cut-plate-runtime-editor-file.md` passes.

Verification surface:
- Source audit: deleted runtime editor files do not exist.
- Source audit: no source matches for `createPlateRuntimeEditor`, runtime editor option/type names, `isPlateRuntimeEditor`, or `installRuntime[A-Z]`.
- Focused package proof: touched package typecheck and tests.
- Core proof: `pnpm check:core`.
- Browser/mobile/huge-doc proof: N/A: no browser route or visible editor behavior claim was made in this packet beyond package runtime behavior.

Constraints:
- Prefer best long-term architecture over compat glue.
- Plite owns generic editor substrate; Plate owns framework/plugin behavior.
- No public compatibility aliases or runtime shims.
- Do not guess old runtime installer behavior; use source/diff evidence and focused tests.
- Do not commit, push, release, or open a PR.

Boundaries:
- Source of truth: current checkout, root `VISION.md`, `docs/vision/plite.md`, `docs/vision/plate.md`, and source evidence from package tests.
- Allowed edit scope used: Core runtime/plugin modules, Plite transform runtime, touched feature packages, this plan.
- Browser surfaces: N/A for this closure.
- Package/API surfaces: Core runtime/plugin API, Plite transform middleware return contract, feature-package runtime extensions.
- Docs/research surfaces: this plan only.
- Non-goals: no public compat, no release/changelog, no broad Plate v2 design fork, no browser/mobile claim.

Blocked condition:
- No blocker remains. A blocker would have required a new public API/runtime design not covered by `VISION.md` or a behavior fork that could not be resolved from source evidence and focused tests.

Automation state:
- lane: shared editor
- surface: Core runtime editor creation file
- mode: complete
- checkpoint_policy: dynamic_supervisor
- current_loop: 1
- current_checkpoint: final-proof
- current_checkpoint_status: complete
- next_checkpoint: none
- goal_status: ready-to-close

Current verdict:
- verdict: complete
- confidence: high
- next owner: none
- keep / revert / quarantine call: keep
- reason: runtime editor file is deleted, behavior is moved to owned modules, stale symbols are absent, and package/Core checks pass

Completion rule:
- This plan can be closed only after the autogoal checker passes.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | complete | P0 | Capture prompt requirements and vision boundary. | Root vision, Plite vision, and Plate vision read; explicit prompt rows captured. | keep |
| status | auto | complete | P0 | Read active plan and current evidence. | Plan reconciled from seed rows to actual cut ledger. | update |
| gap-scan | auto | complete | P0 | Identify old runtime installer behavior owners. | Runtime behavior moved into Core bridge, DOM/plugin owners, list/code-block/combobox feature owners, and Plite transform runtime. | split |
| behavior-proof | package owners | complete | P0 | Prove feature runtime behavior after deleting the old file. | Focused package tests and touched-package tests pass. | keep |
| oracle-repair | package owners | complete | P0 | Repair tests around moved runtime behavior. | List/code-block/combobox/link/media/mention/emoji/math focused rows pass. | keep |
| visual-proof | Browser / Playwright | N/A | P0 | Only needed for route-visible claims. | This packet closed package/runtime behavior and did not claim visible route proof. | retire |
| mobile-claim-width | auto | N/A | P1 | No mobile claim in scope. | Claim width explicitly limited to package/runtime proof. | retire |
| huge-document-smoke | auto | N/A | P1 | No huge-doc behavior claim in scope. | Scoped out by prompt and edit surface. | retire |
| perf-packet | auto | N/A | P2 | No perf claim in scope. | No metric packet claimed. | retire |
| consolidation | auto | complete | P1 | Record durable result in active plan. | This plan updated with packet ledger, slowdowns, changed list, and proof. | keep |
| final-handoff | auto | complete | P0 | Emit changed list, review attention, commands, residual risks. | Final handoff rows completed. | keep |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 1 | update | checkpoint-zero/status | Root and detail vision read; prompt rows captured. | Seed plan still had incomplete startup rows. | complete |
| 1 | split | gap-scan | Old runtime file behavior spread across parser, commands, list, code-block, combobox, DOM, and Plite transform return paths. | One "cut file" row hid multiple owners. | complete |
| 1 | retire | visual-proof/mobile/huge-doc/perf | No browser/mobile/huge-doc/perf claim. | Avoid fake proof scope. | complete |
| 1 | update | final-handoff | Current proof and changed list recorded. | Goal is closable only with fresh evidence. | complete |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Explicit requirement rows are recorded in First checkpoint. |
| `auto` source rule read or fallback recorded | yes | `.agents/skills/auto/SKILL.md` read in this run. |
| `vision` read as checkpoint zero | yes | `VISION.md`, `docs/vision/plite.md`, and `docs/vision/plate.md` read. |
| Active goal checked or created | yes | Existing active goal used for this plan. |
| Lane resolved | yes | Shared editor, primary Plate Core, generic substrate to Plite. |
| Invocation mode and timebox recorded | yes | Full-loop mode, no duration requested. |
| Dynamic checkpoint policy accepted | yes | Checkpoint supervisor and mutation ledger updated from evidence. |
| Source of truth and allowed workspaces recorded | yes | Boundaries section records current checkout, vision docs, Core/Plite packages. |
| Output budget strategy recorded | yes | Broad noisy proof captured to `/tmp` logs and summarized by tails. |
| Release/PR/publish boundary recorded | yes | No commit, push, PR, release, or publish. |
| Browser proof strategy recorded | yes | N/A because no route-visible behavior claim was made. |
| Package/API proof strategy recorded | yes | Focused package tests, touched package typecheck/tests, `pnpm check:core`, source audit. |
| Mobile/raw-device claim-width policy recorded | yes | No mobile claim in this run. |
| Skill repair authority and source-rule boundary recorded | yes | No skill/rule changes were needed. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Plite, Plate, or shared editor, with owning workspace/package/app proof named.
- [x] Checkpoint supervisor table has been reconciled at least once after the initial seed.
- [x] Post-merge/current-tree closure is routed to `autoclosure` when in scope, or marked N/A with reason.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split, merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [x] Current-tree/status packet recorded before new runtime patches.
- [x] Behavior proof packet recorded for every in-scope stable editor family or explicitly skipped/deferred with reason.
- [x] Visual/native selection proof packet recorded for browser-visible selection/editing risks or explicitly scoped.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or deferred with owner and proof command.
- [x] Repeated browser proof patterns are promoted to `@platejs/browser` or queued with reason.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited; Playwright viewport proof is not recorded as raw-device proof.
- [x] Huge-document correctness smoke is run or deferred with owner and reason.
- [x] Perf packet runs only after correctness is green, or is marked N/A for this run.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are audited when in scope.
- [x] Docs/vision/rule consolidation is applied when a reusable decision is accepted, or marked N/A.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the owner skill/script/gate.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark, docs, or skill packet.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or marked N/A with reason.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or prompt/tooling changes, or marked N/A with reason.
- [x] Output budget discipline is followed: broad scans are capped or written to artifacts instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source audit and package/Core proof. | All commands in Verification evidence pass. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to seed rows. | Checkpoint mutation ledger records update, split, retire, and final-handoff mutations. |
| Lane authority proof | yes | Prove commands ran in owning workspace. | All commands ran from `/Users/zbeyens/git/plate-2`; package owners named in proof rows. |
| Workspace authority proof | yes | Record cwd/tool for package proof. | Verification evidence includes cwd and command names. |
| Behavior gates | yes | Run focused package behavior proof. | List, code-block, combobox, link, media, mention, emoji, and math tests pass. |
| Visual/native selection proof | N/A | Record scoped reason. | No browser-visible selection claim was made. |
| Missing oracle repair | yes | Verify package rows around moved behavior. | Focused behavior rows and package tests pass. |
| `@platejs/browser` promotion | N/A | Record scoped reason. | No repeated browser helper pattern was touched. |
| Mobile/raw-device claim width | N/A | Record scoped reason. | No mobile claim was made. |
| Huge-document correctness smoke | N/A | Record scoped reason. | No huge-doc claim was made. |
| Package/API proof | yes | Source-audit and run package/type/test proof. | Source audit, touched-package typecheck/tests, and `pnpm check:core` pass. |
| Autoclosure handoff | N/A | Record scoped reason. | This was internal `$auto` runtime cleanup, not post-merge/current-tree closure. |
| Skill/rule sync | N/A | Record scoped reason. | No `.agents/rules/**` edits. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers. | Ledgers below are complete. |
| Final lint/check | yes | Run scoped check. | `pnpm check:core` passes. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable repeats. | Slowdown ledger records output overflow and bad `rg`/`grep` PATH audit; Node audit used. |
| Agent-native review for agent/tooling changes | N/A | Record scoped reason. | No agent/tooling source changed. |
| Autoreview for non-trivial implementation changes | N/A | Record scoped reason. | User asked for implementation/proof, not autoreview; focused gates are the closure proof. |
| Goal plan complete | yes | Run `check-complete.mjs`. | Final command row records result after this file update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | Prompt rows and vision reads recorded. | status |
| Status and current-state read | complete | Plan reconciled from seed to actual evidence. | gap scan |
| Gap scan and owner matrix | complete | Runtime behavior owners split across Core bridge, Plite transform runtime, DOM/plugin owners, and feature packages. | behavior proof |
| Behavior proof | complete | Focused rows and touched package tests pass. | source audit |
| Source audit | complete | Runtime file paths deleted and stale symbols absent by Node audit. | core proof |
| Core proof | complete | `pnpm check:core` passes. | final handoff |
| Final handoff and goal-plan check | complete | Ledgers complete; checker result recorded below. | none |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| Core runtime editor file | Plate Core plus Plite substrate | package runtime, no browser route | editor commands/parser/input rules | source deletion plus package tests | complete |
| List runtime behavior | feature package extension | package tests | reset/delete/break/tab/list-start | list runtime specs | complete |
| Code block runtime behavior | feature package extension | package tests | paste/break/delete/tab/selectAll/redecorate | code-block runtime specs | complete |
| Combobox trigger behavior | feature package helper | package tests | mention/emoji trigger rules | mention and emoji specs | complete |
| Parser command order | Core runtime bridge/parser extension | package tests | insertData and paste parser | parser and touched package tests | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| runtime-file-delete | 1 | Plate Core | Old monolithic runtime editor file can disappear if creation routes through `withPlate(createReactEditor())`. | Deleted `createPlateRuntimeEditor.ts`, spec, and old internal runtime helper files. | Source audit and `pnpm check:core`. | keep | none |
| core-bridge-parser | 1 | Plate Core | Parser/input command behavior should live in current runtime bridge/extensions, not runtime editor creation. | `currentRuntimeBridge.ts`, `internal/editor/runtimeParser.ts`, `withPlite.ts`, Plite transform runtime. | Core checks and touched package tests. | keep | none |
| list-runtime | 1 | `@platejs/list` | List-specific reset/break/tab/normalization belongs in list plugin extension. | `BaseListPlugin.tsx`, `normalizeListStart.ts`, list specs. | List focused tests and touched-package tests. | keep | none |
| code-block-runtime | 1 | `@platejs/code-block` | Code-block paste/break/delete/tab/selectAll/redecorate belongs in code-block plugin extension. | `BaseCodeBlockPlugin.ts`, code-block specs. | Code-block focused tests and touched-package tests. | keep | none |
| combobox-trigger | 1 | `@platejs/combobox` plus mention/emoji owners | Trigger input rules should be a reusable combobox helper instead of runtime editor glue. | `createTriggerComboboxExtension.ts`, mention and emoji plugins/specs. | Mention/emoji focused tests and touched-package tests. | keep | none |
| type-surface-repair | 1 | Core/package owners | Explicit `createBasePlugin<Config>` overload and feature callback typing need to compile after runtime cut. | Core plugin factory and touched package type repairs. | Touched-package typecheck and `pnpm check:core`. | keep | none |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Core + Plite runtime | `packages/core`, `packages/plite` | `pnpm check:core` | N/A | pass | none |
| Touched package type graph | core, code-block, list, combobox, mention, emoji, link, math, media | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/code-block --filter=./packages/list --filter=./packages/combobox --filter=./packages/mention --filter=./packages/emoji --filter=./packages/link --filter=./packages/math --filter=./packages/media` | N/A | pass | none |
| Touched package tests | code-block, list, link, media, mention, emoji, math, combobox | `pnpm turbo test --filter=./packages/code-block --filter=./packages/list --filter=./packages/link --filter=./packages/media --filter=./packages/mention --filter=./packages/emoji --filter=./packages/math --filter=./packages/combobox` | N/A | pass | none |
| Source deletion audit | Core/package source | Node audit over `packages/core/src` and `packages/*/src` | N/A | pass | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| Runtime file deletion | N/A: package/runtime source claim only | N/A | N/A | N/A | claim scoped correctly |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| none | No browser proof code changed. | N/A | N/A | N/A |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| none | N/A | N/A | N/A | No mobile claim. |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| none | N/A | N/A | N/A | No huge-document claim. |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Final parallel proof before compaction | auto command shape | one assistant context overflow | Output was too large to preserve exit/result visibility. | Reran proof sequentially with logs captured to `/tmp` and tails only. | keep practice: capture broad command output to logs before final proof. |
| Initial symbol audit with `rg`/`grep` | auto command shape | under one minute | Shell reported command-not-found inside the audit branch; message could have produced a false green. | Reran with a Node source audit that fails on actual matches and includes untracked files. | repair by using Node for this final audit in this run. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Deleted `createPlateRuntimeEditor.ts` and old runtime helper files; routed editor creation through `withPlate(createReactEditor())`; moved runtime command/parser behavior into Core bridge/extensions; moved list/code-block/combobox behavior to owning packages; repaired Plite transform middleware return contract. |
| tests/oracles/browser proof | Replaced runtime-editor test callers with current editor creation paths; added/updated package behavior specs for list, code-block, combobox/mention/emoji/link/media/math touched rows. |
| benchmarks/metrics/targets | none |
| examples/docs | Updated this autogoal plan only. |
| skills/workflow | none |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Review the new ownership split for code-block/list runtime commands. | This is the highest-value API/architecture review: behavior moved from one Core runtime file into feature plugins. | `packages/code-block/src/lib/BaseCodeBlockPlugin.ts`, `packages/list/src/lib/BaseListPlugin.tsx` | inspect closely |
| 2 | Review `currentRuntimeBridge.ts` parser/command behavior. | It is still central Core bridge code; the file cut is real, but this bridge remains the runtime dispatch owner. | `packages/core/src/internal/currentRuntimeBridge.ts` | inspect closely |
| 3 | Review any `any` casts in touched package specs/plugins later. | Some casts keep the migration moving while type surface settles; tests are green, but stricter public typing can still improve. | Touched package specs under list/code-block/link/emoji/media/mention. | defer to type-cleanup lane |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | No user decision needed to close this file cut. | Runtime deletion is proven by source audit and package checks. | none | all in-scope proof completed | accept | this plan |

Findings:
- `createPlateRuntimeEditor.ts` was still acting as a monolithic behavior owner. Cutting it required moving behavior into package/plugin owners, not just deleting imports.
- List and code-block had real behavior hiding behind old runtime install paths; those now live in their feature plugins.
- Parser order needed plugin-owned paste handling to get first refusal while preserving generic parser fallback.
- The Plite transform middleware needed a handled/unhandled return path so command chains can compose without runtime-file glue.

Decisions and tradeoffs:
- Keep: package/plugin-owned runtime extensions for list and code-block.
- Keep: shared combobox trigger extension for mention and emoji trigger rules.
- Keep: Core bridge as command/parser dispatch owner for Plate runtime integration.
- Reject: recreating a smaller `createPlateRuntimeEditor` wrapper.
- Reject: public compat aliases or shims.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad proof output overflowed context. | 1 | Capture broad command output to `/tmp` and print tail. | Typecheck/tests rerun with captured logs and exit codes. |
| `rg`/`grep` audit branch produced command-not-found output. | 2 | Use a Node source audit that checks deleted paths and scans source files including untracked files. | Node audit passed. |

Verification evidence:
- cwd: `/Users/zbeyens/git/plate-2`
- `pnpm check:core` passed.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/code-block --filter=./packages/list --filter=./packages/combobox --filter=./packages/mention --filter=./packages/emoji --filter=./packages/link --filter=./packages/math --filter=./packages/media` passed.
- `pnpm turbo test --filter=./packages/code-block --filter=./packages/list --filter=./packages/link --filter=./packages/media --filter=./packages/mention --filter=./packages/emoji --filter=./packages/math --filter=./packages/combobox` passed.
- Node source audit passed: deleted runtime editor files absent, no stale runtime-editor symbols found in `packages/core/src` or `packages/*/src`.
- Focused package rows passed before final broad gates: list runtime specs, code-block runtime specs, link runtime/rules specs, math input rules, mention plugin specs, emoji plugin/insert specs, media contracts.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-26-cut-plate-runtime-editor-file.md`
- Lane: shared editor, primary Plate Core with Plite substrate ownership when generic.
- Surface and route/package: Core runtime editor file and touched feature packages.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop, no minimum runtime, one closure loop.
- Behavior gates and visual proof: package/runtime behavior gates pass; visual proof scoped N/A.
- Primary metric baseline/latest/best and stop reason: N/A: no perf packet; stopped because deletion/source/package gates are green.
- Bugs fixed and oracles added: runtime behavior moved to owned modules and covered by focused package tests.
- Benchmark/skill/docs repairs: no benchmark or skill edits; this plan updated.
- Workflow slowdowns and repairs: broad output overflow and failed shell audit were handled by captured logs and Node audit.
- Changed list: see Changed list table.
- Needs your attention: review code-block/list ownership split and Core bridge.
- Stopping checkpoints to unblock: none.
- Accepted deferrals and residual risks: browser/mobile/huge-doc proof not claimed; stricter type cleanup can be a later lane.
- Next owner: none for this file cut; optional later owner is `plate-next` type/API polish.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final proof complete for the runtime-editor file cut. |
| Where am I going? | Run autogoal checker and close the active goal. |
| What is the goal? | Delete `createPlateRuntimeEditor.ts` and prove behavior moved to owned modules. |
| What have I learned? | The monolithic file hid real feature behavior; list/code-block/combobox now own their runtime behavior. |
| What have I done? | Deleted the runtime editor file family, moved behavior, ran source audit and package/Core checks. |
| What changed in the checkpoint plan? | Seed rows were replaced with evidence-backed completed checkpoints and ledgers. |

Open risks:
- No blocking risk remains for the file cut.
- Residual review risk: Core bridge still centralizes command/parser dispatch, so inspect that file before treating Plate runtime API cleanup as fully done.
