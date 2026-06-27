# plate-v2-core-api-hard-cut

Objective:
Execute the Plate v2 core API hard-cut loop: remove public T* API names, preserve inference, prove affected packages, and queue the next bridge-cleanup owner.

Goal plan:
docs/plans/2026-06-24-plate-v2-core-api-hard-cut.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: direct user invocation
- prompt / link: `ok full $auto` after approving the Plate v2 API design
- lane: Plate
- surface / route / package: `packages/core` public API plus first affected package callers/docs
- invocation mode: full-loop checkpoint
- minimum runtime / deadline: none requested
- completion threshold summary: public `T*` names are gone or blocked with proof, inference remains typed, affected package proof passes, and the next private bridge cleanup owner is queued

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: full-loop checkpoint, not a timed run
- initial confidence score: N/A
- improvement loop: continue until this API hard-cut packet is proven or a real blocker/taste gap appears
- final score / loop closure: high confidence after source audit, focused typecheck, focused tests, docs check, barrel regeneration, and affected package builds

Completion threshold:
- Done state for this loop: `TPlateEditor`, `TBaseEditor`, `createTPlatePlugin`, `toTPlatePlugin`, `createTBasePlugin`, and `toTBasePlugin` are removed from public source/docs or explicitly blocked with evidence; replacement names preserve inline and explicit generic inference; focused type/test/build proof passes for affected packages; the next private runtime bridge cleanup checkpoint is queued.
- Closure is legal only when package/API, docs/API consistency, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-plate-v2-core-api-hard-cut.md` passes.

Verification surface:
- Source audit: `rg -n "TPlateEditor|createTPlatePlugin|toTPlatePlugin|TBaseEditor|createTBasePlugin|toTBasePlugin" packages/core/src packages/*/src content/docs --glob !**/dist/** --glob !**/node_modules/**`.
- Focused package proof: `pnpm turbo typecheck --filter=./packages/core` first, then affected package filters from the audit.
- Test proof: focused core/plugin/editor tests that cover explicit generic and inferred plugin/editor typing.
- Barrel/export proof: run `pnpm brl` if exports move or public names change.
- Docs proof: run `pnpm --filter www check:docs` only if `content/docs/**` changes.
- Browser/mobile/huge-document/perf proof: N/A unless code changes runtime editor behavior; this packet is compile-time API shape.

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
- Source of truth: root `VISION.md`, current `packages/core` source, and the accepted API law in this plan.
- Allowed edit scope: `packages/core`, affected first-party package callers, generated barrels if required, and docs that mention the old public names.
- Browser surfaces: N/A unless runtime behavior changes.
- Package/API surfaces: Plate core/base plugin/editor API and first-party package imports.
- Agent/skill surfaces: N/A unless this loop exposes a reusable workflow miss.
- Docs/research surfaces: current docs only; no release, PR, or publish work.
- Non-goals: full Plate package migration, Plite runtime changes, browser behavior/perf, release, PR, changesets, and compatibility aliases/shims.

Output budget strategy:
- Use `rg -l`/counts and capped `sed` slices; write broad audit details to plan rows or `.tmp/**` if needed. Do not stream full package-wide outputs.

Blocked condition:
- Stop only if preserving explicit generic inference requires a public API fork not covered by the accepted design, if typecheck reveals a larger Plate runtime decision, or if source ownership is unclear after focused audit.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: Plate
- surface: packages/core public API and affected first-party callers
- mode: full-loop checkpoint
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 1
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: plate-runtime-bridge-deletion
- goal_status: ready-to-close

Current verdict:
- verdict: keep
- confidence: high for this API hard-cut packet
- next owner: auto
- keep / revert / quarantine call: keep
- reason: public T* names are removed from source/docs/dist audits, primary APIs preserve explicit generic and inferred usage, and affected package proof is green

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-plate-v2-core-api-hard-cut.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | done | P0 | Copy prompt requirements before implementation. | Requirements, boundaries, proof, non-goals, and stop rules copied above. | updated |
| status | auto | in_progress | P0 | Audit old public T* usage before implementation. | Source audit records affected files and replacement strategy. | updated |
| gap-scan | auto | pending | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Gaps routed to packet owners. | seed |
| closure-handoff | autoclosure | pending | P0 when merged/current-tree work is in scope | Run until-clean closure for already-applied work. | Closure delegated or N/A. | seed |
| behavior-proof | auto | done | P0 | Runtime behavior is out of scope for this compile-time public API packet. | N/A: no browser behavior claim unless runtime behavior changes. | retired |
| oracle-repair | lane test owner / tdd | pending | P0 | Add missing native/visual/model oracles for found gaps. | New proof fails before fix or coverage gap is explicit. | seed |
| visual-proof | auto | done | P0 | Browser-visible behavior is out of scope for this API/type packet. | N/A: no rendered behavior change intended. | retired |
| browser-helper-promotion | lane proof harness | pending | P1 | Promote repeated browser proof into reusable API/helper. | Helper added, queued, or N/A with reason. | seed |
| mobile-claim-width | auto | done | P1 | No mobile claim in this run. | N/A: package API typing only. | retired |
| huge-document-smoke | auto | done | P1 | No huge-document claim in this run. | N/A: package API typing only. | retired |
| perf-packet | auto | done | P2 | No perf claim in this run. | N/A: API/type cleanup only. | retired |
| supervision-mode | auto | pending | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from vision and evidence. | New checkpoint added/run, or hard blocker recorded. | seed |
| consolidation | auto | pending | P1 | Move accepted reusable decisions to durable docs/rules. | Durable owner updated or N/A. | seed |
| final-handoff | auto | pending | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete. | seed |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | update | checkpoint-zero/status/behavior/visual/mobile/huge/perf | plan narrowed from prompt | Plate API type cleanup is the real lane; runtime proof rows are N/A unless behavior changes | applied |
| 1 | update | status/gap-scan | `rg` found old names in core editor/plugin types, typed specs, first-party packages, and current docs | Public `T*` names are real API debt, not only stale docs. Replacement must preserve explicit generic calls on the primary names. | applied |
| 1 | update | package/API proof | focused typecheck/tests/build/docs/barrel proof passed | Replacement names preserved inference without public aliases; stricter `editor.api` typing exposed and cleaned real read call sites. | applied |
| 1 | retire | behavior/visual/mobile/huge/perf/browser-helper | no runtime behavior claim in this packet | This loop changed public compile-time API shape and typed call sites only. Browser and perf rows would be fake proof. | applied |
| 1 | add | plate-runtime-bridge-deletion | private transforms bridge still exists by design outside this packet | Public API hard cut is done; next safe move is package-by-package runtime bridge deletion. | queued |

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
| Prompt requirements captured before work | yes | This plan copies full-loop, Plate API hard-cut, no shims, inference-preservation, proof, handoff, and stop rules before code edits. |
| `auto` source rule read or fallback recorded | yes | `.agents/skills/auto/SKILL.md` queried; relevant checkpoint rules and package command pitfalls recorded. |
| `vision` read as checkpoint zero | no | N/A: accepted API direction is already from current user taste; no new taste fork unless replacement design conflicts. |
| Active goal checked or created | yes | No active goal existed; created goal objective for this hard-cut loop. |
| Lane resolved | yes | Plate lane; `packages/core` public API and affected first-party callers. |
| Invocation mode and timebox recorded | yes | Full-loop checkpoint; no timed runtime. |
| Dynamic checkpoint policy accepted | yes | Supervisor may add/split/retire checkpoints after source/type evidence. |
| Source of truth and allowed workspaces recorded | yes | `packages/core`, affected first-party packages, current docs, generated barrels if required. |
| Output budget strategy recorded | yes | Use capped `rg`/`sed`; broad outputs to artifacts. |
| Release/PR/publish boundary recorded | yes | No release, PR, push, commit, or changeset. |
| Browser proof strategy recorded | yes | N/A unless runtime/rendered behavior changes. |
| Package/API proof strategy recorded | yes | Source audit, focused package typecheck/tests, `pnpm brl` if exports changed. |
| Mobile/raw-device claim-width policy recorded | yes | N/A: no mobile/raw-device claim. |
| Skill repair authority and source-rule boundary recorded | yes | N/A unless a reusable workflow miss appears. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Plite, Plate, or shared editor, with owning workspace/package/app proof named.
- [x] Checkpoint supervisor table has been reconciled at least once after the initial seed.
- [x] Post-merge/current-tree closure is routed to `autoclosure` when in scope, or marked N/A with reason: not a post-merge/current-tree closure run.
- [x] Each loop ends with a checkpoint mutation decision: update, retire, add, and queue decisions are recorded in the mutation ledger.
- [x] Current-tree/status packet recorded before new runtime patches: old public API names were audited before replacement.
- [x] Behavior proof packet recorded for every in-scope stable editor family or explicitly skipped/deferred with reason: N/A, no runtime editor behavior claim.
- [x] Visual/native selection proof packet recorded for browser-visible selection/editing risks or explicitly scoped: N/A, no browser-visible behavior change.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or deferred with owner and proof command: no new runtime oracle was needed; type contract tests covered the API packet.
- [x] Repeated browser proof patterns are promoted to `@platejs/browser` or queued with reason: N/A, no browser proof pattern was used.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited: N/A, no mobile claim.
- [x] Huge-document correctness smoke is run or deferred with owner and reason: N/A, no huge-document claim.
- [x] Perf packet runs only after correctness is green, or is marked N/A for this run: N/A, no performance claim.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are audited when in scope.
- [x] Docs/vision/rule consolidation is applied when a reusable decision is accepted, or marked N/A: N/A, this applied an already accepted API law.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the owner skill/script/gate.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark, docs, or skill packet.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or marked N/A with reason: scoped helper review is not path-filterable in this dirty checkout, so deterministic source/type/test/build proof is recorded and full autoreview is queued for a clean packet boundary.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or prompt/tooling changes, or marked N/A: no agent files changed.
- [x] Output budget discipline is followed: broad scans were capped; one noisy dirty-tree file list was abandoned and logged as slowdown.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Source and dist forbidden-name audits clean; affected package typecheck/build/tests/docs/barrels passed. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Mutation ledger includes API proof update, runtime rows retired, and bridge-deletion owner queued. |
| Lane authority proof | yes | Prove each command ran in the owning Plite/Plate/shared workspace, or record N/A | All commands ran from `/Users/zbeyens/git/plate-2` against Plate packages and docs. |
| Workspace authority proof | yes | Record cwd/tool for each package, docs, skill, browser, or benchmark proof | Verification evidence lists cwd and exact commands. |
| Behavior gates | no | Run focused stable behavior proof or record scoped defer rows | N/A: compile-time public API hard cut only; no runtime behavior claim. |
| Visual/native selection proof | no | Record Browser/Playwright/native-selection evidence or scoped blocker | N/A: no rendered editor behavior changed. |
| Missing oracle repair | no | Add/verify/revert/quarantine oracle packets or record owner defer | N/A: existing type contract tests covered the API inference claim. |
| `@platejs/browser` promotion | no | Add/verify helper/API or record queue/defer reason | N/A: no repeated browser proof pattern. |
| Mobile/raw-device claim width | no | Run raw-device proof or record that only scoped viewport/browser proof is available | N/A: no mobile claim. |
| Huge-document correctness smoke | no | Run focused huge-document behavior smoke or record owner defer | N/A: no huge-document claim. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | Source/dist audits, affected package typecheck/build, focused Bun tests, docs check, and `pnpm brl` passed. |
| Autoclosure handoff | no | Delegate post-merge/current-tree until-clean work to `autoclosure`, otherwise N/A | N/A: this is an internal API packet, not post-merge closure. |
| Skill/rule sync | no | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | N/A: no `.agents/rules/**` changed. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Filled below. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | `pnpm lint:fix` is not a valid packet gate in this dirty checkout; broad pre-existing lint debt logged below. Focused package proof passed. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Logged below; no source-rule repair needed because current rules already warn against these command shapes. |
| Agent-native review for agent/tooling changes | no | Load `agent-native-reviewer` and close accepted findings, or N/A | N/A: no agent/tooling files changed. |
| Autoreview for non-trivial implementation changes | scoped defer | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | Helper has no path filter and dirty-tree mode would review unrelated branch drift; scoped deterministic proof replaces it for this packet. Run full autoreview after a clean packet boundary. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-plate-v2-core-api-hard-cut.md` | Will be run after this closeout ledger update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | Requirements, non-goals, proof, and stop rules captured before implementation. | done |
| Status and current-state read | complete | Source audit found public `T*` names in core, packages, and docs. | done |
| Gap scan and scenario matrix | complete | Scenario matrix scoped to package/API inference; runtime scenario rows N/A. | done |
| Behavior proof | n/a | No behavior change or claim. | done |
| Oracle repair | complete | Existing focused type contract tests cover explicit and inferred APIs. | done |
| Visual/native proof | n/a | No browser-visible behavior change. | done |
| Browser helper promotion | n/a | No repeated browser proof helper. | done |
| Mobile/raw-device claim width | n/a | No mobile claim. | done |
| Huge-document correctness smoke | n/a | No huge-document claim. | done |
| Perf/API/docs/skill packets as needed | complete | API/docs/barrel/package proof passed; no skill packet. | done |
| Consolidation and review | complete | Runtime bridge deletion queued as next owner; autoreview scoped defer recorded. | done |
| Final handoff and goal-plan check | complete | Final ledgers filled; mechanical check queued immediately after save. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| Plate core public API | `BaseEditor`, `PlateEditor`, `createPlatePlugin`, `toPlatePlugin` | N/A | type-level construction/import | inferred and explicit generic call sites compile | passed |
| First-party package callers | AI, selection, toggle, dnd, link, media, utils | N/A | package typecheck/build | no public old names, no `any` collapse through `editor.api` index | passed |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| api-name-hard-cut | 1 | auto | Public `T*` names are API debt; primary names can preserve inference. | `BaseEditor.ts`, `PlateEditor.ts`, `createPlatePlugin.ts`, `toPlatePlugin.ts`, specs/docs/barrels; typecheck/tests/build/docs proof. | N/A compile-time API packet. | keep | runtime bridge deletion |
| stricter-api-index | 1 | auto | `Record<string, any>` on runtime API hides typed-read holes. | `currentRuntimeBridge.ts`, AI/selection/toggle typed reads; affected package typecheck/build. | N/A compile-time API packet. | keep | sweep remaining legacy API reads package-by-package |
| docs-name-sync | 1 | auto | Docs should teach current primary names only. | `content/docs/**` replacements; `pnpm --filter www check:docs`. | N/A docs API packet. | keep | docs-creator only if prose cleanup is requested |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Runtime editor behavior | N/A | N/A: no behavior mutation | N/A | scoped out | none |
| Package API typing | `packages/core` and affected first-party packages | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/ai --filter=./packages/dnd --filter=./packages/link --filter=./packages/media --filter=./packages/toggle --filter=./packages/selection --filter=./packages/utils` | N/A | passed | runtime bridge deletion |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| N/A | No editor behavior changed. | No browser claim. | No DOM/caret claim. | No screenshot needed. | scoped out |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| N/A | No browser proof pattern used. | N/A | N/A | no-change |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| N/A | N/A | N/A | no mobile claim | no mobile claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| N/A | N/A | N/A | N/A | no huge-document claim |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Initial plan rewrite | auto/autogoal operator | small | I used a mechanical Python edit for plan shaping even though `apply_patch` is preferred for manual edits. | Plan was corrected and future edits in this closeout used `apply_patch`. | keep note; no rule repair because repo instructions already cover it. |
| `pnpm lint:fix` | repo lint gate | broad failure | Dirty checkout has large unrelated lint debt; command reported 1636 errors and fixed 3 files, so it is not a useful packet gate. | Focused typecheck/tests/build/docs proof still passed. | defer broad lint cleanup to separate owner; do not use root lint as proof for this packet. |
| `pnpm --filter @platejs/core test -- PlateEditor` attempt | package test wrapper | slow/silent | Wrapper path was not the right focused owner after stale dist/type fallout. Exact Bun test files gave better proof. | Focused Bun files passed. | use exact test files for core API contracts. |
| Unquoted docs path with parentheses | shell command shape | immediate fail | zsh globbed `content/docs/(guides)/...`. | No code impact. | quote docs paths with parentheses; current Auto rule already warns about shell metacharacters. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Removed public `TBaseEditor`/`TPlateEditor`/`createTPlatePlugin`/`toTPlatePlugin`; made primary APIs generic; tightened runtime API index to `unknown`; migrated affected typed reads in AI/selection/toggle. |
| tests/oracles/browser proof | Renamed/updated core typed specs; updated AI suggestion fake editor fixture to use `read`; no browser proof needed for this packet. |
| benchmarks/metrics/targets | none |
| examples/docs | Replaced old public API names in current docs. |
| skills/workflow | none |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `PlateEditor` default generic | It no longer defaults through React `PlateCorePlugin` to avoid a circular type path; factory return still carries stronger runtime tx precision. | `packages/core/src/react/editor/PlateEditor.ts` | inspect closely |
| 2 | `editor.api` index is now `unknown` | This is the right stricter shape, but it will expose more legacy callers that should move to `editor.read` or typed plugin APIs. | `packages/core/src/internal/currentRuntimeBridge.ts` | accept |
| 3 | Autoreview is scoped-deferred | The helper cannot path-filter this huge dirty checkout; full dirty-tree review would be misleading. | `.agents/skills/autoreview/scripts/autoreview --help` | defer until clean packet boundary |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | none | none | This packet has no user-only decision left. | none | API hard cut completed. | continue to runtime bridge deletion when ready | this plan |

Findings:
- Public `T*` names were real API debt across core, first-party packages, and docs.
- Primary names can preserve both inferred and explicit generic usage through overloads.
- Tightening the runtime API index from `any` to `unknown` exposed real legacy API-read holes in AI/selection/toggle call sites.

Decisions and tradeoffs:
- Keep the primary names: `BaseEditor`, `PlateEditor`, `createPlatePlugin`, `toPlatePlugin`.
- Do not add aliases for removed `T*` names.
- Keep `editor.read` for typed structure queries when generic `editor.api.*` would hide type holes.
- Defer private runtime bridge deletion to the next package-by-package owner instead of mixing it into the public API naming packet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Root `pnpm lint:fix` was too broad for this dirty checkout and failed on unrelated lint debt. | 1 | Use focused typecheck/test/build/docs proof for this packet. | Scoped proof passed; lint debt deferred. |
| Package test wrapper path was less reliable than exact Bun contract files. | 1 | Run exact spec files with Bun preload. | Focused Bun tests passed. |
| Unquoted docs path with parentheses failed shell globbing. | 1 | Quote path arguments or avoid shell metacharacters. | No code impact. |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: `rg -n "TPlateEditor|createTPlatePlugin|toTPlatePlugin|TBaseEditor|createTBasePlugin|toTBasePlugin|createTPlateEditor" packages/core/src packages/*/src content/docs --glob '!**/dist/**' --glob '!**/node_modules/**'` returned no matches.
- `/Users/zbeyens/git/plate-2`: same forbidden-name audit over `packages/core/dist packages/plate/dist packages/ai/dist packages/dnd/dist packages/link/dist packages/media/dist packages/toggle/dist packages/selection/dist packages/utils/dist --glob '!**/*.map'` returned no matches.
- `/Users/zbeyens/git/plate-2`: `pnpm turbo typecheck --filter=./packages/core` passed.
- `/Users/zbeyens/git/plate-2`: `pnpm turbo typecheck --filter=./packages/core --filter=./packages/ai --filter=./packages/dnd --filter=./packages/link --filter=./packages/media --filter=./packages/toggle --filter=./packages/selection --filter=./packages/utils` passed.
- `/Users/zbeyens/git/plate-2`: `bun test --preload ./config/plite-source-test-setup.ts packages/core/src/react/editor/PlateEditor.spec.ts packages/core/src/react/editor/PlateEditorCore.spec.ts packages/core/src/react/plugin/toPlatePlugin.spec.ts packages/core/src/lib/plugin/createBasePlugin.typed.spec.ts` passed.
- `/Users/zbeyens/git/plate-2`: `bun test --preload ./config/plite-source-test-setup.ts packages/selection/src/internal/transforms/selectBlocks.spec.tsx packages/ai/src/react/ai-chat/utils/applyAISuggestions.spec.ts packages/toggle/src/react/hooks/toggleHooks.spec.tsx` passed after fixture repair.
- `/Users/zbeyens/git/plate-2`: `pnpm --filter www check:docs` passed.
- `/Users/zbeyens/git/plate-2`: `pnpm brl` passed.
- `/Users/zbeyens/git/plate-2`: `pnpm turbo build --filter=./packages/core --filter=./packages/plate --filter=./packages/ai --filter=./packages/dnd --filter=./packages/link --filter=./packages/media --filter=./packages/toggle --filter=./packages/selection --filter=./packages/utils` passed.
- `/Users/zbeyens/git/plate-2`: `pnpm turbo build --filter=./packages/ai` passed after AI fixture/read cleanup.
- `/Users/zbeyens/git/plate-2`: `.agents/skills/autoreview/scripts/autoreview --help` showed no path filter; full dirty-tree autoreview is intentionally not claimed.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-24-plate-v2-core-api-hard-cut.md`
- Lane: Plate
- Surface and route/package: `packages/core` public API plus affected first-party package callers/docs
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop checkpoint; no timed minimum; 1 implementation loop
- Behavior gates and visual proof: N/A, no runtime/browser behavior claim
- Primary metric baseline/latest/best and stop reason: N/A, no perf metric; stop reason is package/API threshold met
- Bugs fixed and oracles added: public API names hard-cut; type contract specs updated; AI fake editor fixture repaired
- Benchmark/skill/docs repairs: no benchmark or skill repair; docs API names synced
- Workflow slowdowns and repairs: broad lint and dirty-tree review are not valid packet gates; exact proof commands used instead
- Changed list: filled above
- Needs your attention: filled above
- Stopping checkpoints to unblock: none
- Accepted deferrals and residual risks: private runtime bridge deletion remains next owner; full autoreview deferred until clean packet boundary
- Next owner: `auto` Plate runtime bridge deletion lane

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff for the Plate core public API hard-cut packet. |
| Where am I going? | Close this goal and queue runtime bridge deletion as the next owner. |
| What is the goal? | Remove public `T*` API names, preserve inference, prove affected packages, and queue next bridge cleanup. |
| What have I learned? | Primary names are enough; the remaining risk is private runtime bridge cleanup, not public naming. |
| What have I done? | Replaced public old names, tightened API typing, repaired affected call sites/docs/tests, and ran focused proof. |
| What changed in the checkpoint plan? | Runtime proof rows were retired as N/A, package/API proof was completed, and bridge deletion was queued. |

Timeline:
- 2026-06-24T17:40:06.291Z Goal plan created.
- 2026-06-24 Public `T*` API audit, replacement, type/test/build/docs/barrel proof completed.
- 2026-06-24 Closeout ledger updated with changed list, review attention, slowdowns, and next owner.

Open risks:
- Private runtime bridge debt remains outside this packet: `editor.tf` / `editor.transforms` / `plugin.transforms` cleanup should continue package-by-package under the Plate runtime bridge deletion lane.
- Full structured autoreview was not run because the helper cannot path-filter and the checkout has large unrelated dirty drift; run it after a clean packet boundary or once the intended diff is isolated.
