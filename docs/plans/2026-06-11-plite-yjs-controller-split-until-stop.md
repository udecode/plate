# slate-yjs-controller-split-until-stop

Objective:
Split Plite Yjs controller until remaining splits are low-value or risky; done when controller responsibilities are cleaner and Yjs gates pass.

Goal plan:
docs/plans/2026-06-11-slate-yjs-controller-split-until-stop.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: user request
- id / link: latest chat: "[$autogoal] ... 拆到停为止"
- title: Split Plite Yjs controller until stop
- acceptance criteria: keep extracting coherent controller responsibilities until the next split is low-value, risky, or blocked; preserve Yjs behavior; keep Yjs verification green; no commit/PR/release.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- `packages/plite-yjs/src/core/controller.ts` has split out every clearly coherent low-risk responsibility that can be extracted without creating awkward coupling.
- Stop when the remaining controller responsibilities are either core orchestration, provider lifecycle state machine, or a split whose risk/value ratio is bad.
- Focused tests for each extracted responsibility pass.
- Final `bun --filter @slate/yjs typecheck`, `bun lint`, `bun test ./packages/plite-yjs/test`, and `bun --filter @slate/yjs build` pass.
- Root `bun check` is run when useful and any non-Yjs blocker is isolated.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-slate-yjs-controller-split-until-stop.md` passes.

Verification surface:
- Focused package tests matching each extracted controller responsibility.
- `bun --filter @slate/yjs typecheck`.
- `bun lint`.
- `bun test ./packages/plite-yjs/test`.
- `bun --filter @slate/yjs build`.
- Source audit: `wc -l` and `rg` for controller residual implementation details.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `/Users/felixfeng/Desktop/repos/plite/packages/plite-yjs/src/core/controller.ts`, nearby Yjs core files, and Yjs contract tests.
- Allowed edit scope: `packages/plite-yjs/src/**`, `packages/plite-yjs/test/**` if needed, and this plan file.
- Browser surface: N/A: no UI/browser route changed.
- Tracker sync: N/A: no issue/Linear/PR requested.
- Non-goals: no commit, no PR, no release/publish, no slate-react DOM repair fix, no broad rewrite beyond controller responsibility extraction.

Output budget strategy:
- Use targeted `sed` ranges, `rg` symbol searches, `wc -l`, and capped test output. Do not stream broad repo output or generated trees.

Blocked condition:
- Stop if the next split requires changing public API, provider lifecycle semantics, or behavior not covered by focused tests.
- Stop if Yjs package verification fails and the failing owner is not in the current split.

Task state:
- task_type: refactor
- task_complexity: normal
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: active
- confidence: high once Yjs gates pass
- next owner: task
- reason: user asked to keep splitting controller until a real stop point.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-slate-yjs-controller-split-until-stop.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User requires `$autogoal`, "拆到停为止", controller split work, preserve Yjs gates, no PR/commit unless requested. |
| Skill analysis before edits | yes | Read provided autogoal skill body in latest user message and applied one-shot execution flow. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this goal. |
| Source of truth read before edits | yes | Prior round read `controller.ts`; this goal will continue with focused source reads before each split. |
| Tracker comments and attachments read | no | N/A: no tracker issue or attachment in request. |
| Video transcript evidence required | no | N/A: no video input. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: local refactor with source/test authority; no historical solution needed. |
| TDD decision before behavior change or bug fix | no | N/A: refactor only; existing Yjs contracts are the guard. |
| Branch decision for code-changing task | no | N/A: user did not ask for branch/commit/PR; do not inspect git state. |
| Release artifact decision | no | N/A: private alpha refactor, no release/publish. |
| Browser tool decision for browser surface | no | N/A: no browser/UI surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker sync requested. |
| Output budget strategy recorded | yes | Use targeted `sed`, `rg`, `wc`, capped command output. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation. Evidence: sections above.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
      Evidence: Objective/Completion threshold/Verification surface/Boundaries/Blocked condition filled.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer. Evidence: task source rows and boundaries.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
      Evidence: user-provided AGENTS plus focused reads of controller/provider/awareness/editor adapter surfaces.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. Evidence: split-history, awareness, provider lifecycle, and editor bridge responsibilities extracted; controller left as commit/import orchestration.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A: Plite private alpha refactor; no release/publish request.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable. Evidence: Chinese concise handoff with files/tests/known blocker.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: no branch/commit/PR requested; no proactive git state check.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: root failure is deterministic slate-react test, not install-corruption shaped.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior. Evidence: verification commands run in `/Users/felixfeng/Desktop/repos/plite`.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Evidence: review caught provider status API narrowing; fixed by restoring custom status passthrough.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. Evidence: autoreview `--mode local` against `/Users/felixfeng/Desktop/repos/plite`.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling. N/A: no agent/tooling files touched except this plan ledger.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context. Evidence: commands used targeted files, capped output, and focused tests before full gates.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `bun --filter @slate/yjs typecheck`, `bun lint`, `bun test ./packages/plite-yjs/test`, and `bun --filter @slate/yjs build` all passed in `/Users/felixfeng/Desktop/repos/plite`. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: refactor task, not bug fix; existing contract tests are the guard. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Focused provider/awareness/selection/split-history/structural tests passed: 69 pass; provider custom-status repair passed: 29 pass. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun --filter @slate/yjs typecheck` passed after final edits. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: added internal core adapter files only; no package exports or barrels changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest or lockfile changes. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents` source edits; only plan ledger updated. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All source verification ran in `/Users/felixfeng/Desktop/repos/plite`; plan checker runs in `/Users/felixfeng/Desktop/repos/plate-copy`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser/UI route changed. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: package internals only. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no generated template output touched. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: refactor preserves behavior; provider custom status passthrough restored to avoid API narrowing; no release/changeset requested for Plite private alpha. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry/component work. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | This plan ledger is source-backed by commands and paths; no user-facing docs changed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: custom provider statuses could be dropped. Fixed by preserving arbitrary string status and deriving connection only for known statuses; provider test covers `open`. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling implementation changed. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: failures were deterministic test/review findings, not install corruption. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Read autoreview skill. First run found P2 provider status narrowing; fixed. Second run: `autoreview clean: no accepted/actionable findings reported`. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format | N/A: no PR requested. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker issue or PR requested. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `bun lint` passed; no autofix needed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used capped `sed`, `rg`, `wc`, focused tests, and capped command output. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-slate-yjs-controller-split-until-stop.md` | `[autogoal] complete: docs/plans/2026-06-11-slate-yjs-controller-split-until-stop.md`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Source and skill requirements captured | complete |
| Implementation | done | Extracted split-history, awareness, provider lifecycle, and editor bridge adapters | complete |
| Verification | done | Focused tests, package gates, root check isolation, autoreview clean | complete |
| PR / tracker sync | N/A | No PR/tracker requested | complete |
| Closeout | done | Ledger and final handoff prepared | complete |

Findings:
- Controller was too broad: it owned split undo history, awareness cursor conversion, provider lifecycle state, and Plite remote import mechanics.
- Provider status narrowing was an accepted autoreview finding because custom provider statuses are public observable data.
- Remaining controller code is now commit/import orchestration, seed gating, Yjs transaction application, undo coordination, and public state/tx wiring.

Decisions and tradeoffs:
- Extracted cohesive low-risk adapters instead of chasing an arbitrary line-count target.
- Stopped after editor bridge extraction because further splitting would fracture core orchestration and add callback coupling.
- Kept provider seed/import decisions in controller; provider lifecycle adapter owns transport status only.
- Restored arbitrary string provider status passthrough while keeping `connected()` derived only from known statuses.

Implementation notes:
- Added `/Users/felixfeng/Desktop/repos/plite/packages/plite-yjs/src/core/awareness-adapter.ts`.
- Added `/Users/felixfeng/Desktop/repos/plite/packages/plite-yjs/src/core/provider-lifecycle-adapter.ts`.
- Added `/Users/felixfeng/Desktop/repos/plite/packages/plite-yjs/src/core/editor-adapter.ts`.
- Existing split-history extraction remains in `/Users/felixfeng/Desktop/repos/plite/packages/plite-yjs/src/core/split-history-adapter.ts`.
- `/Users/felixfeng/Desktop/repos/plite/packages/plite-yjs/src/core/controller.ts` is 485 lines after this pass.

Review fixes:
- Autoreview first run found `[P2] Custom provider statuses are now dropped` in `provider.ts`.
- Fixed by making `YjsProviderStatus` accept arbitrary strings again, normalizing any string status, and using fallback connection state for unknown statuses.
- Added/updated provider contract expectations for custom `open` status passthrough and fallback connection derivation.
- Autoreview second run reported no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `bun lint` format failures after new files | 3 | Apply formatter-shaped edits | Resolved; final `bun lint` passed. |
| Autoreview failed on Codex CLI `service_tier=priority` config | 1 | Use temporary wrapper adding `-c service_tier="fast"` | Resolved; autoreview ran and second pass was clean. |
| Root `bun check` fails in slate-react DOM repair contract | 2 | Isolate non-Yjs blocker and keep Yjs gates green | Isolated: `packages/plite-react/test/dom-repair-policy-contract.test.ts:698`, expected false but received true. |

Verification evidence:
- `/Users/felixfeng/Desktop/repos/plite`: `bun test ./packages/plite-yjs/test/provider-contract.spec.ts` -> 29 pass.
- `/Users/felixfeng/Desktop/repos/plite`: focused provider/awareness/selection/split-history/structural suite -> 69 pass.
- `/Users/felixfeng/Desktop/repos/plite`: `bun --filter @slate/yjs typecheck` -> pass.
- `/Users/felixfeng/Desktop/repos/plite`: `bun lint` -> pass.
- `/Users/felixfeng/Desktop/repos/plite`: `bun test ./packages/plite-yjs/test` -> 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/plite`: `bun --filter @slate/yjs build` -> pass.
- `/Users/felixfeng/Desktop/repos/plite`: `bun check` -> fails only at `packages/plite-react/test/dom-repair-policy-contract.test.ts:698`; package typechecks, site/root typechecks, bun tests, slate-layout tests, and lint pass before that unrelated failure.
- `/Users/felixfeng/Desktop/repos/plite`: autoreview second run -> clean, no accepted/actionable findings.
- Source audit: controller is 485 lines; extracted adapters are awareness 199, provider lifecycle 232, editor bridge 114, split history 370.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: high for Yjs refactor; package gates and autoreview are clean.
- Flow table:
  - Reproduced: N/A, refactor task.
  - Verified: focused tests pass, Yjs package gates pass, root blocker isolated.
- Browser check: N/A, no browser/UI surface changed.
- Outcome: controller split to coherent adapters and stopped at core orchestration boundary.
- Caveat: root `bun check` still fails in unrelated slate-react DOM repair contract at line 698.
- Design:
  - Chosen boundary: adapters own implementation-heavy responsibilities; controller owns orchestration and seed/import gates.
  - Why not quick patch: line-count-only splitting would preserve hidden coupling.
  - Why not broader change: remaining code is the actual controller state machine; further extraction would add callback churn.
- Verified: commands listed in Verification evidence.
- PR body verified: N/A, no PR.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: root `bun check` has the known non-Yjs slate-react failure.

Open risks:
- None in `@slate/yjs` verification. Repo-wide check remains blocked by unrelated `packages/plite-react/test/dom-repair-policy-contract.test.ts:698`.

Timeline:
- 2026-06-11T13:58:01.915Z Task goal plan created.
- 2026-06-11T14:00Z Awareness adapter extracted; focused and package Yjs gates passed.
- 2026-06-11T14:06Z Provider lifecycle adapter extracted; provider-focused and package Yjs gates passed.
- 2026-06-11T14:10Z Editor bridge adapter extracted; focused and package Yjs gates passed.
- 2026-06-11T14:18Z Autoreview found provider custom status regression; fixed with provider contract coverage.
- 2026-06-11T14:29Z Autoreview rerun clean; root check isolated unchanged slate-react failure.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run autogoal checker, mark goal complete, final response |
| What is the goal? | Split Plite Yjs controller until the next split is low-value or risky while keeping Yjs gates green |
| What have I learned? | Clean stops after awareness, provider lifecycle, editor bridge, and split-history extraction; provider status passthrough must stay public |
| What have I done? | Extracted four adapters, fixed review-found provider status API narrowing, passed Yjs gates, isolated root non-Yjs blocker |

Open risks:
- Pending.
