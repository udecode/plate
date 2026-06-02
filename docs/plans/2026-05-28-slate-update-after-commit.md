# slate update after commit

Objective:
Add an update-scoped one-shot post-commit effect API to Slate v2 so callers can use `editor.update((tx, { afterCommit }) => ...)`. Effects run exactly once after a successful outer commit, do not run for rollback or no-op updates, preserve the current `tx` mutation/read shape, and leave extension `onCommit` plus transform middleware `next()`/handled behavior intact.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-05-28-slate-update-after-commit.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user-requested API/runtime task
- id / link: current thread
- title: Add `afterCommit` update context to Slate v2
- acceptance criteria: `.tmp/slate-v2` exposes `editor.update((tx, { afterCommit }) => ...)`, effects are one-shot and commit-scoped, current behavior APIs remain intact, focused tests pass, and this plan closes.

Completion threshold:
- `.tmp/slate-v2` type surface supports `editor.update((tx, { afterCommit }) => ...)`.
- Focused tests prove success, rollback, no-op, nested updates, and ordering relative to extension `onCommit`.
- Existing extension/update contract tests still pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-slate-update-after-commit.md` passes.

Verification surface:
- `.tmp/slate-v2` focused Bun tests for the new API and existing extension/update contracts.
- Source audit of `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`, `.tmp/slate-v2/packages/slate/src/core/public-state.ts`, and extension commit listener behavior.
- Autogoal checker for this plan.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.tmp/slate-v2/packages/slate/src` and focused Slate tests.
- Allowed edit scope: `.tmp/slate-v2` source/tests and this goal plan.
- Browser surface: N/A: core Slate transaction API, no UI route.
- Tracker sync: N/A: current thread only, no issue/PR requested.
- Non-goals: no new `behaviors` runtime, no command-bus redesign, no transform middleware contract rewrite, no PR/commit/push.

Blocked condition:
- Stop only if the current transaction/commit architecture cannot support update-local effects without breaking existing public update semantics, and focused source/test evidence shows no narrower compatible path.

Task state:
- task_type: API/runtime enhancement
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: implemented and verified
- confidence: high
- next owner: final response
- reason: focused contracts, package typecheck, full Slate package tests, targeted formatting, changeset, source audit, and final autoreview are closed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-slate-update-after-commit.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `autogoal`; loaded `changeset` for package release artifact and `autoreview` for closeout review. |
| Active goal checked or created | yes | `get_goal` returned no active goal; `create_goal` opened Slate update afterCommit objective. |
| Source of truth read before edits | yes | Read current `.tmp/slate-v2` `editor.update`, `EditorUpdateTransaction`, `EditorUpdateOptions`, `onCommit`, middleware `next()`, and commit notification paths. |
| Tracker comments and attachments read | no | N/A: no tracker issue or attachments in this request. |
| Video transcript evidence required | no | N/A: no video/screen recording for this API task. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: current source is authoritative and task is narrow API extension. |
| TDD decision before behavior change or bug fix | yes | Add focused tests for `afterCommit` before/with implementation and preserve existing contract tests. |
| Branch decision for code-changing task | no | N/A: no branch/PR requested; do not run git hygiene. |
| Release artifact decision | yes | Record after source audit: likely `.changeset` if this package publishes types/API from `.tmp/slate-v2`; otherwise explicit N/A if sibling repo policy treats this as test-only/local. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker sync requested. |
| Package/API pack selected | yes | `package-api` pack applied because public update callback type changes. |
| Public surface or package boundary identified | yes | Public Slate package `Editor.update` callback signature and `EditorUpdateTransaction` companion context. |
| Release artifact path selected | yes | Added `.tmp/slate-v2/.changeset/slate-update-after-commit.md` for published `slate` patch API/type delta. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded `.agents/skills/changeset/SKILL.md`; changeset uses one package and patch bump. |
| Barrel/export impact decision recorded | yes | Public type export added in `.tmp/slate-v2/packages/slate/src/index.ts`; Slate v2 has no generated barrel command for this source index. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `bun test ./packages/slate/test/update-after-commit-contract.ts ./packages/slate/test/editor-runtime-view-contract.ts ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/extension-methods-contract.ts ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/collab-adapter-extension-contract.ts` in `.tmp/slate-v2` -> 448 pass; `bun test ./packages/slate/test` -> 975 pass, 94 skip, 0 fail. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Initial `bun test ./packages/slate/test/update-after-commit-contract.ts` failed 6/6 because `afterCommit` context was undefined. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `update-after-commit-contract.ts` covers success, no-op, rollback, nested updates, effect-triggered updates, `onCommit`-triggered updates, ordering, and stale registration. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun --filter slate typecheck` in `.tmp/slate-v2` -> pass. |
| Package exports or file layout changed | yes | Run `pnpm brl` before final verification and keep generated barrel updates | N/A to `pnpm brl`: Slate v2 source index is hand-owned. `.tmp/slate-v2/packages/slate/src/index.ts` exports `EditorUpdateContext`; public-surface test passes. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest, lockfile, or install graph change. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rules or skills changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All Slate proof commands ran in `/Users/zbeyens/git/plate-2/.tmp/slate-v2`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: core Slate runtime/type API, no browser route. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no CI-controlled templates touched. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Added `.tmp/slate-v2/.changeset/slate-update-after-commit.md`. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: not registry work. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: runtime plan and changeset only, no user docs. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure modes tested: rollback/no-op leakage, nested queue ordering, `onCommit` mutation drift, root-bound view wrong snapshot, stale registration, public type export. Boundary: update lifecycle context, not `tx` mutation API. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: failures were code/format-related, not install corruption. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Final `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local ...` in `.tmp/slate-v2` -> clean, no accepted/actionable findings. |
| PR create or update | no | Run `check` before PR work and sync PR body to final handoff | N/A: no PR requested. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker target. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff section filled. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `bun biome check <touched files>` in `.tmp/slate-v2` -> pass. Full `bun check` attempted once and stopped on unrelated `packages/slate-react/src/hooks/use-slate-node-ref.tsx` import formatting. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-slate-update-after-commit.md` | Will run after this final plan update. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `rg` shows `EditorUpdateContext` in `interfaces/editor.ts`, `core/public-state.ts`, and root `src/index.ts`; public-surface test added. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published `slate` package API/types/runtime patch. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | `.tmp/slate-v2/.changeset/slate-update-after-commit.md` uses `"slate": patch`; forbidden core-package minor rule not triggered. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | N/A: not registry-only work. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: release artifact required and added. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `bun --filter slate typecheck` -> pass; `bun test ./packages/slate/test` -> 975 pass, 94 skip, 0 fail. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no generated barrel tooling in Slate v2 for this source index; manual root type export verified. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read current `editor.update`, `EditorUpdateTransaction`, extension `onCommit`, middleware `next()`, commit notification path. | implementation |
| Implementation | complete | Added `EditorUpdateContext`, root-scoped afterCommit queue, public export, view forwarding, changeset. | verification |
| Verification | complete | Focused tests, package typecheck, full Slate tests, touched-file format pass. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Final autoreview clean; plan checker next. | final response |

Findings:
- Current public `BaseEditor.update` accepts `(transaction) => void` plus `EditorUpdateOptions`; no second update context exists.
- `EditorUpdateTransaction` is the mutation/read API; keeping effects out of it preserves the `tx` contract.
- Extension-level `onCommit` already exists and is backed by commit listeners; the new value is action-local one-shot effects.
- Transform middleware already has `next()` and handled-result semantics, so adding `behaviors` would be unnecessary churn for this task.
- Full `bun check` is not a reliable patch gate right now because it stops on unrelated existing Biome import ordering in `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx`.

Decisions and tradeoffs:
- API shape: prefer `editor.update((tx, { afterCommit }) => ...)` over `tx.afterCommit` because effects belong to update lifecycle, not transaction mutation.
- Scope: additive context only; no `behaviors`, no `raise`, no command-bus redesign.

Implementation notes:
- Implemented an update-local effect queue attached to the outer transaction. Entries capture the active root at registration, materialize commit-bound root snapshots before `onCommit` listeners run, flush after commit notification, and drop on rollback/no-op.

Review fixes:
- Autoreview finding accepted: lazy afterCommit snapshot could drift if an earlier afterCommit handler started another update. Fixed by materializing snapshots before running handlers and added regression coverage.
- Autoreview finding accepted: `EditorUpdateContext` was missing from the root public export list. Fixed in `.tmp/slate-v2/packages/slate/src/index.ts` and added public-surface coverage.
- Autoreview finding accepted: `onCommit` listeners could advance the editor before afterCommit snapshot capture. Fixed by materializing afterCommit contexts before `notifyListeners` and added regression coverage.
- Autoreview finding accepted: root-bound view handlers could receive a base-root snapshot. Fixed by storing each afterCommit handler's active root and added nested root-bound view coverage.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial new contract test failed because second `editor.update` callback arg was undefined | 1 | Implement update context and queue | Resolved; focused tests pass. |
| `bun check` stopped on unrelated `slate-react` import-order formatting | 1 | Use changed-file formatting plus owning package tests/typecheck; do not silently rewrite unrelated file | Recorded caveat; targeted gates pass. |
| Autoreview found lazy snapshot and missing public export | 1 | Materialize snapshots and export type | Resolved; reran tests/review. |
| Autoreview found `onCommit` drift and root-bound view snapshot issue | 1 | Root-scope queue entries and pre-notification snapshot materialization | Resolved; final autoreview clean. |

Verification evidence:
- `bun test ./packages/slate/test/update-after-commit-contract.ts` in `.tmp/slate-v2` initially failed 6/6 before implementation because `afterCommit` context was undefined.
- `bun test ./packages/slate/test/update-after-commit-contract.ts ./packages/slate/test/editor-runtime-view-contract.ts ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/extension-methods-contract.ts ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/collab-adapter-extension-contract.ts` in `.tmp/slate-v2` -> 448 pass, 0 fail.
- `bun --filter slate typecheck` in `.tmp/slate-v2` -> pass.
- `bun biome check packages/slate/src/interfaces/editor.ts packages/slate/src/core/public-state.ts packages/slate/src/create-editor.ts packages/slate/src/core/editor-runtime.ts packages/slate/src/editor-runtime-view.ts packages/slate/src/index.ts packages/slate/test/update-after-commit-contract.ts packages/slate/test/editor-runtime-view-contract.ts packages/slate/test/public-surface-contract.ts .changeset/slate-update-after-commit.md` in `.tmp/slate-v2` -> pass.
- `bun test ./packages/slate/test` in `.tmp/slate-v2` -> 975 pass, 94 skip, 0 fail.
- Final autoreview in `.tmp/slate-v2` -> clean, no accepted/actionable findings.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker requested.
- Confidence line: high after focused tests, package typecheck, full Slate package tests, targeted formatting, source audit, changeset, and clean final autoreview.
- Flow table:
  - Reproduced: new focused contract failed before implementation with undefined `afterCommit` context.
  - Verified: focused tests, package typecheck, full Slate package tests, targeted formatting, final autoreview.
- Browser check: N/A: no browser surface.
- Outcome: `editor.update((tx, { afterCommit }) => ...)` is implemented with one-shot commit-bound effects.
- Caveat: full `.tmp/slate-v2` `bun check` currently stops on unrelated `slate-react` import formatting outside this patch.
- Design:
  - Chosen boundary: update lifecycle context, not `tx`.
  - Why not quick patch: raw handler flushing after notify was not robust against nested effects, `onCommit` mutation, or root-bound views.
  - Why not broader change: transform middleware already owns `next()`/handled behavior; no `behaviors` runtime is needed.
- Verified: see verification evidence above.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: full `bun check` unrelated formatting failure noted.

Timeline:
- 2026-05-28T20:16:08.447Z Task goal plan created.
- 2026-05-28T20:16Z Active goal created for Slate update-scoped `afterCommit`.
- 2026-05-28T20:17Z Source read established current `editor.update((tx) => ...)`, extension `onCommit`, and middleware `next()` contracts.
- 2026-05-28T20:20Z Added red `update-after-commit-contract.ts`; failed 6/6 before implementation.
- 2026-05-28T20:25Z Implemented update context and initial afterCommit queue; focused tests and typecheck passed.
- 2026-05-28T20:28Z Added changeset for `slate` patch API delta.
- 2026-05-28T20:30Z `bun check` stopped on unrelated `slate-react` import formatting; changed-file formatting and package-owned checks used instead.
- 2026-05-28T20:38Z First autoreview found lazy snapshot drift and missing public export; fixed both.
- 2026-05-28T20:50Z Second autoreview found `onCommit` drift and root-bound view snapshot issue; fixed with root-scoped entries and pre-notification materialization.
- 2026-05-28T21:02Z Final autoreview clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | Add update-scoped one-shot `afterCommit` context to Slate v2 without changing `tx` or behavior middleware semantics. |
| What have I learned? | The robust shape needs root-scoped queue entries and commit-bound snapshots materialized before `onCommit` can mutate live state. |
| What have I done? | Implemented API/runtime/types/export/tests/changeset; closed final review and verification gates. |

Open risks:
- Full `.tmp/slate-v2` `bun check` remains blocked by unrelated `packages/slate-react/src/hooks/use-slate-node-ref.tsx` Biome import formatting that predates this patch scope.
