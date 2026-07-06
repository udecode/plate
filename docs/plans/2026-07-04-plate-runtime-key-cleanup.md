# plate runtime key cleanup

Objective:
Move Plate remount key out of editor.runtime; done when runtime.key is gone,
Plate remount tests pass, and check:core passes.

Goal plan:
docs/plans/2026-07-04-plate-runtime-key-cleanup.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user correction / Plate Next runtime boundary cleanup
- id / link: chat continuation after `editor.runtime.key` review
- title: Move Plate remount key out of editor runtime
- acceptance criteria: React remount behavior is preserved, but `runtime.key`
  is no longer stored on `editor.runtime`; Plate owns the remount key through a
  private helper; no Plite substrate pollution; no public compatibility alias.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: no timed checkpoint requested
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Done state:
  1. `extendBaseEditor` / `withPlite` no longer initializes
     `editor.runtime.key`.
  2. `BaseEditor` / `PlateEditor` runtime types no longer expose `key`.
  3. `Plate` and `useSlateProps` get their React remount key from a
     Plate-owned private WeakMap helper.
  4. Existing remount behavior is covered by focused Core tests.
  5. Source audit has no `runtime.key` matches in `packages/core/src`,
     `packages/plite`, or `packages/plite-react`, excluding this plan and old
     historical plans.
  6. `pnpm check:core` passes.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-runtime-key-cleanup.md` passes.

Verification surface:
- Focused tests:
  - `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts src/react/hooks/useSlateProps.spec.tsx src/react/components/Plate.slow.tsx`
- Core/Plite gate:
  - `pnpm check:core`
- Source audit:
  - `rg -n "runtime\\.key|editor\\.runtime\\.key" packages/core/src packages/plite packages/plite-react -g '*.ts' -g '*.tsx'`
- Browser proof: N/A; this is an internal React remount/package API cleanup
  with no route/UI surface changed directly.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `VISION.md`, `docs/vision/plate.md`,
  `docs/vision/common.md`, prior identity plan
  `docs/plans/2026-07-04-plate-next-editor-identity-cleanup.md`, current Core
  source/tests.
- Allowed edit scope: `packages/core/src/react/**`,
  `packages/core/src/lib/editor/**`, this plan. Touch Plite only if a type gap
  proves the key is actually substrate-owned.
- Browser surface: N/A; no content/app route changed.
- Browser strategy: N/A; package tests own this claim.
- Tracker sync: N/A; no issue/PR/tracker target.
- Non-goals: do not rename Plate/Slate components, do not alter `editor.id`,
  do not touch node-id `nanoid`, do not add public API, do not run broad Core
  sweep.

Output budget strategy:
- Use focused `rg` for `runtime.key`, focused source reads around the matches,
  and focused Core tests before `pnpm check:core`. Cap command output.

Blocked condition:
- Block only if preserving React remount behavior requires a public editor
  runtime key after all Plate-owned storage options are tested.

Task state:
- task_type: Plate Next package/runtime cleanup
- task_complexity: normal
- current_phase: implementation
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: hard-cut runtime key storage from editor runtime; keep behavior via
  Plate React private helper
- confidence: 0.91 before patch
- next owner: plate-next
- reason: the only live users are Plate React remount paths; Plite substrate
  has no need for this key.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-runtime-key-cleanup.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User said `ok go` after accepting the recommendation: keep remount behavior, move storage out of public-ish editor runtime. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `plate-next` and `autogoal`. |
| Active goal checked or created | yes | No active goal; created this goal. |
| Source of truth read before edits | yes | Read root/detail vision, prior identity plan, and current `runtime.key` matches. |
| Tracker comments and attachments read | no | N/A: no tracker/attachment target. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Focused `rg` across `docs/solutions`, plans, content, and source found prior identity plan only. |
| TDD decision before behavior change or bug fix | yes | Update existing focused remount/runtime tests; no separate red test needed because this is cleanup of existing covered behavior. |
| Branch decision for code-changing task | no | N/A: user asked for local patch, not branch/PR. |
| Release artifact decision | yes | N/A: internal-only cleanup, no public package user-visible delta. |
| Browser tool decision for browser surface | no | N/A: no route/UI surface changed directly. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Focused searches and capped output only. |
| Package/API pack selected | yes | `package-api` pack selected because Core runtime/package surface changes. |
| Public surface or package boundary identified | yes | Internal Plate React remount helper; no public API intended. |
| Release artifact path selected | no | N/A: no published user-visible delta. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset required. |
| Barrel/export impact decision recorded | yes | No public export intended unless helper needs internal index; run audit after patch. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: the remount key is a
      Plate React host concern, now stored in a private WeakMap helper instead
      of `editor.runtime`.
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
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no changeset.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: not registry-only.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded:
      focused Core tests, Core typecheck, and `pnpm check:core` passed.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no public export/barrel expected.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Focused Core tests passed, source audit clean, Core typecheck passed, `pnpm check:core` passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: cleanup of an existing covered remount behavior, not a user-visible bug fix. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts src/react/hooks/useSlateProps.spec.tsx src/react/components/Plate.slow.tsx` passed: 55 tests. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/core` passed; `pnpm check:core` typecheck lane passed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: helper lives under `packages/core/src/react/internal` and is not exported from public barrels; public export audit clean. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest or lockfile edits. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents/**` edits. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All proof commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no route, content, or rendered UI changed directly. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: package/runtime tests own this claim. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: internal-only host remount storage cleanup; no published user-visible delta. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only this plan doc changed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: editor object replacement might not remount Plate subtree. Proof: remount-focused tests and `useSlateProps` key test passed. Boundary: private React WeakMap helper, not Plite runtime. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: failures matched code/lint and were fixed directly. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: narrow cleanup with focused tests and `check:core`; user did not request review/commit. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm check:core` lint lanes passed for Core/Plite. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Focused searches and capped command output used. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-runtime-key-cleanup.md` | Run after this closeout patch. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `rg` audit found no `runtime.key`; public export audit found no `getPlateEditorInstanceKey` barrel export. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | No release artifact: internal-only runtime storage cleanup. |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A: no published user-visible delta. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Internal-only helper plus runtime type cleanup; no docs, registry, manifest, or public export change. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm turbo typecheck --filter=./packages/core` and `pnpm check:core` passed. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exported file layout changed; helper intentionally private. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | pass | Read current matches and prior identity plan | implementation |
| Implementation | pass | Removed `runtime.key`; added private WeakMap remount helper | verification |
| Verification | pass | Focused tests, source audit, export audit, Core typecheck, `check:core` passed | closeout |
| PR / tracker sync | N/A | No PR/tracker requested | final response |
| Closeout | pass | Final handoff fields filled; completion checker next | final response |

Findings:
- `runtime.key` was a React subtree remount key, not editor runtime state.
- `editor.id` cannot replace it because two editor instances can intentionally
  share the same Plate id while still requiring remount.

Decisions and tradeoffs:
- Store remount identity in a private Plate React `WeakMap<PlateEditor, string>`
  helper.
- Keep the helper out of public barrels; `packages/core/src/react/internal/**`
  is the right owner.
- Do not broaden into editor id, DOM id, Plite runtime identity, or node-id
  cleanup in this packet.

Implementation notes:
- Added `packages/core/src/react/internal/getPlateEditorInstanceKey.ts`.
- `Plate` and `useSlateProps` now read the remount key from that helper.
- `PlateEditorRuntime`, `withPlite`, and `withPlite.spec.ts` no longer mention
  or initialize `runtime.key`.
- Updated remount tests to prove editor-instance replacement still changes the
  React key.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts src/react/hooks/useSlateProps.spec.tsx src/react/components/Plate.slow.tsx`
  passed: 55 tests.
- `rg -n "runtime\\.key|editor\\.runtime\\.key" packages/core/src packages/plite packages/plite-react -g '*.ts' -g '*.tsx'`
  returned no matches.
- `rg -n "export .*getPlateEditorInstanceKey|getPlateEditorInstanceKey" packages/core/src/react/index.ts packages/core/src/index.ts packages/core/src/react/editor/index.ts`
  returned no matches.
- `pnpm turbo typecheck --filter=./packages/core` passed.
- `pnpm check:core` passed: Core tests 701 pass, Plite tests 1900 pass / 85
  skip, Core/Plite lint and typecheck lanes passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker target.
- Confidence line: high / 0.96.
- Flow table:
  - Reproduced: N/A cleanup, existing behavior covered by tests; browser N/A.
  - Verified: focused tests, source audit, export audit, Core typecheck,
    `check:core`; browser N/A.
- Browser check: N/A, no route/UI surface changed directly.
- Outcome: `editor.runtime.key` is gone; React remount identity is Plate-owned
  private state.
- Caveat: none for this packet.
- Design:
  - Chosen boundary: private Plate React WeakMap helper.
  - Why not quick patch: keeping `editor.runtime.key` would continue leaking a
    host remount concern into editor runtime state.
  - Why not broader change: editor id, DOM container id, and Plite runtime
    identity are separate concerns and were not needed to close this leak.
- Verified: focused tests, source audit, export audit, Core typecheck,
  `check:core`.
- PR body verified: N/A, no PR.

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A, no route/UI surface changed directly.
- Caveats: none.

Timeline:
- 2026-07-04T20:21:46.607Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response after completion checker |
| What is the goal? | Move Plate remount key out of `editor.runtime` while preserving remount behavior |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- None known for this packet.
