# 4985 ordered list heading paragraph numbering

Objective:
Fix #4985 ordered-list start regression; done when paragraph lists after numbered headings start at 1 and package checks pass; plan docs/plans/4985-ordered-list-heading-paragraph-numbering.md.

Goal plan:
docs/plans/4985-ordered-list-heading-paragraph-numbering.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: GitHub issue
- id / link: #4985, https://github.com/udecode/plate/issues/4985
- title: [Bug]: ordered list numbering continues from heading to paragraph
- acceptance criteria: ordered list numbering must not continue from a heading
  block to a paragraph block; a paragraph ordered list typed after a numbered
  heading starts from 1; heading numbering and paragraph list numbering are
  independent.

Completion threshold:
- A behavior regression test fails on the current `@platejs/list` behavior and
  passes after the fix.
- `@platejs/list` normalizes ordered-list `start` values so heading numbering
  does not seed non-heading list numbering, while non-heading mixed-block
  continuation still works. Configured heading node types are treated as
  headings, nested headings do not break outer list tracks, and non-numbered
  headings do not reset ordered paragraph numbering.
- A patch changeset exists for `@platejs/list`.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/4985-ordered-list-heading-paragraph-numbering.md` passes.

Verification surface:
- Focused `@platejs/list` unit test for heading-to-paragraph ordered-list start
  behavior.
- Package source-first typecheck for `packages/list`.
- Lint fix pass.
- Source audit for export/barrel impact and browser applicability.
- Autoreview gate with accepted findings closed.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: GitHub issue #4985 and its single bot comment.
- Allowed edit scope: `packages/list/**`, focused tests, `.changeset/**`, and
  this goal plan.
- Browser surface: issue says Browser surface No; no standalone browser route is
  required for the list normalizer behavior.
- Tracker sync: create/update PR before issue comment unless blocked by check,
  then comment only with a meaningful outcome or blocker.
- Non-goals: no heading feature redesign, no broad list architecture rewrite, no
  docs changes unless the source audit proves docs are needed.

Output budget strategy:
- Use `rg`/`rg --files` scoped to `packages/list` and short `sed` ranges. Exclude
  generated/build outputs and cap broad reads to filenames or top matches.

Blocked condition:
- Stop only if the package cannot run focused tests/typecheck after one
  corruption retry when the failure shape smells local, or if PR creation/check
  is blocked by auth/CI/tool access.

Task state:
- task_type: bug
- task_complexity: non-trivial measurable package fix
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: fixed in PR #5011
- confidence: high
- next owner: reviewer
- reason: focused regressions, package typecheck, lint, autoreview, `pnpm check`,
  PR body verification, and issue sync all passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/4985-ordered-list-heading-paragraph-numbering.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `task`, `autogoal`, `tdd`, `changeset`, local `.agents/AGENTS.md`. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created active goal for this plan. |
| Source of truth read before edits | yes | `gh issue view 4985 --repo udecode/plate --comments --json ...`. |
| Tracker comments and attachments read | yes | Issue has one bot comment and one screenshot attachment; no video. |
| Video transcript evidence required | no | N/A: issue evidence is a static image, not video/screen recording. |
| `docs/solutions` checked for non-trivial existing-code work | yes | `find docs/solutions -maxdepth 2 -type f | head -80`; no list-normalizer match found in capped scan. |
| TDD decision before behavior change or bug fix | yes | Use one focused behavior regression test before implementation. |
| Branch decision for code-changing task | yes | Started on `main`; after `pnpm check`, created `codex/fix-4985-list-heading-numbering`. |
| Release artifact decision | yes | Published package behavior changes, so add `.changeset` for `@platejs/list`. |
| Browser tool decision for browser surface | no | N/A: issue marks Browser surface No; focused package test owns this behavior. |
| PR expectation decision | yes | Active `task` workflow requires PR after verified code unless blocked by check/auth. |
| Tracker sync expectation decision | yes | Sync issue after PR or report blocker; no early tracker comment. |
| Output budget strategy recorded | yes | Narrow `packages/list` searches and short reads; no unbounded repo scans. |
| Package/API pack selected | yes | Applied `package-api` pack to plan. |
| Public surface or package boundary identified | yes | Runtime behavior of published `@platejs/list` normalizer. |
| Release artifact path selected | yes | `.changeset` patch for `@platejs/list`. |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/rules/changeset.mdc`. |
| Barrel/export impact decision recorded | yes | Internal helper added under `lib/internal`; `pnpm --filter @platejs/list brl` passed with no public barrel changes. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
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
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work updates `tooling/data/plate-ui-changelog.mdx` and generated `/registry/changelog/*` JSON instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm check` passed in `/Users/zbeyens/git/plate`; PR #5011 created and issue #4985 synced. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | `pnpm --filter @platejs/list test normalizeListStart` failed before fix: paragraph items after numbered headings normalized as `3`, `4`. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `pnpm --filter @platejs/list test isSameListSequence`; `pnpm test:slow packages/list/src/lib/normalizers/normalizeListStart.slow.tsx`; `pnpm --filter @platejs/list test toggleList` passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/list` passed. |
| Package exports or file layout changed | yes | Run `pnpm brl` before final verification and keep generated barrel updates | Internal helper added under `lib/internal`; `pnpm --filter @platejs/list brl` passed with no generated public barrel changes. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no package manifest or lockfile changed. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rules or skills changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Owning cwd `/Users/zbeyens/git/plate`; package commands scoped to `@platejs/list`; root `pnpm check` passed. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: issue marks Browser surface No; no runnable package route owns this normalizer behavior. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: browser proof waived for package normalizer behavior. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` output changed. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `.changeset/fix-list-heading-paragraph-start.md` added for `@platejs/list` patch behavior fix. |
| Registry-only component work changed | no | Update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, or record N/A | N/A: no registry files changed. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only goal plan docs changed as workflow artifact. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: over-splitting mixed block lists or under-splitting numbered heading/paragraph tracks; proof covers numbered headings, nested headings, non-numbered headings, configured heading node types, non-heading blockquotes, and polite restarts. Boundary: list normalizer and toggle restart path own numbering. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: failures were expected red tests or review findings, not install corruption. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | `.agents/skills/autoreview/scripts/autoreview --mode local` clean; earlier P2 findings accepted and fixed. |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | `pnpm check` passed; PR #5011 created at https://github.com/udecode/plate/pull/5011. |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | `gh pr view 5011 --repo udecode/plate --json url,body,headRefName,baseRefName,isDraft` verified auto-release block and required task format. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: PR body has no browser proof image. |
| Tracker sync-back | yes | Post concise issue/Linear sync after PR exists, or record N/A/blocker | Commented on #4985: https://github.com/udecode/plate/issues/4985#issuecomment-4700114410. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff fields completed below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed, no fixes applied after the final helper move. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Broad output came only from required `pnpm check`; exploratory reads were scoped. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/4985-ordered-list-heading-paragraph-numbering.md` | To run after this evidence update. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `rg` audit of package index/normalizer exports showed no export surface change; runtime behavior change only. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package runtime behavior fix for `@platejs/list`. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | `.changeset/fix-list-heading-paragraph-start.md` contains only `"@platejs/list": patch`. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, and do not add a package changeset | N/A: not registry-only work. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: release artifact required and added. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm --filter @platejs/list test isSameListSequence`; `pnpm test:slow packages/list/src/lib/normalizers/normalizeListStart.slow.tsx`; `pnpm --filter @platejs/list test toggleList`; `pnpm turbo typecheck --filter=./packages/list` passed. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm --filter @platejs/list brl` passed; helper lives under `internal`, which barrelsby excludes. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Issue, comment, skills, local AGENTS, and capped docs/solutions scan read. | done |
| Implementation | complete | Normalizer and `toggleList` sibling checks share heading/non-heading list-track boundary. | done |
| Verification | complete | Focused tests, package typecheck, lint, autoreview, and `pnpm check` passed. | done |
| PR / tracker sync | complete | PR #5011 created; issue #4985 commented. | done |
| Closeout | complete | Final plan evidence recorded. | final response |

Findings:
- Issue #4985 reports a regression in `@platejs/list@49.2.0` / `platejs@49.2.12`:
  ordered-list paragraph numbering continues from numbered headings when both
  use decimal style.
- Acceptance criteria target independence between heading numbering and
  paragraph list numbering.
- Bot comment points at `normalizeListStart.ts` / previous-list lookup as the
  likely root cause; local source confirmed that `normalizeListStart` used only
  `listStyleType` to find the previous list item.
- `toggleList` also used `getPreviousList` to decide whether
  `listRestartPolite` should apply; it needed the same boundary as the
  normalizer.

Decisions and tradeoffs:
- Use package normalizer ownership, not caller config, because the bug occurs in
  default numbering semantics once headings are configured as list targets.
- Do not use browser proof for this pass: the issue declares no browser surface,
  and a package-level normalizer test gives cleaner coverage.
- Add a changeset because published users see runtime behavior change.
- Narrow the boundary to heading-vs-non-heading list tracks instead of raw
  element type. That fixes heading-to-paragraph independence while preserving
  mixed non-heading ordered lists such as paragraph plus blockquote.
- Use editor-resolved heading node types, not raw `h1`-`h6` strings, because
  Plate plugins can configure `node.type`.
- Keep the shared sequence predicate internal to avoid adding accidental public
  API.

Implementation notes:
- `isSameListSequence` is a private list helper that compares list style plus
  heading/non-heading track using editor-resolved heading types.
- Heading/non-heading sequence boundaries break sibling lookup only when the
  sibling is at the same indent and has the same defined list style as the
  current item.
- `normalizeListStart` now continues ordered starts only when the previous
  matching list item has the same list style and belongs to the same resolved
  heading category as the current item.
- `toggleList` now merges plugin/caller sibling options once and uses the same
  heading-category query when deciding whether a polite restart is first in its
  list track.
- Tests cover heading-to-paragraph independence, non-heading mixed-block
  continuation, nested headings, non-numbered headings, polite restart after
  headings, configured heading node types, and polite restart after blockquotes.

Review fixes:
- Autoreview P2 accepted: `listRestartPolite` still used old cross-type
  previous-list semantics. Fixed `toggleList` restart boundary and added a
  polite restart regression after numbered headings.
- Autoreview P2 accepted: raw element-type boundary over-split non-heading
  mixed ordered lists. Narrowed the predicate to heading-vs-non-heading tracks
  and added non-heading blockquote controls.
- Autoreview P2 accepted: public normalizer callers can pass plain Slate
  editors without `editor.getType`. Added fallback to raw heading keys.
- Autoreview P2 accepted: using only a query could skip numbered headings and
  resume an earlier paragraph track. Moved heading/paragraph transitions into a
  scoped `breakQuery`.
- Autoreview P2 accepted: hard heading boundary stopped outer-list lookup at
  nested headings. Scoped boundary to same-indent siblings.
- Autoreview P2 accepted: hard heading boundary treated plain or differently
  styled headings as list breaks. Scoped boundary to the same defined list
  style.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial heading fixture stripped list props because indent/list target plugins were paragraph-only | 1 | Configure both BaseIndentPlugin and BaseListPlugin for heading targets in the test harness | Fixed regression fixture; red test then showed paragraph starts `3`, `4`. |
| Autoreview found restart-politeness mismatch | 1 | Apply same sibling boundary in `toggleList` | Fixed and tested. |
| Autoreview found raw-type boundary over-split mixed non-heading lists | 1 | Use editor-resolved heading-category boundary | Fixed and tested. |
| Autoreview found plain `Editor` callers could crash on `editor.getType` | 1 | Add raw heading-key fallback when `getType` is absent | Fixed and tested. |
| Autoreview found query-only heading split could skip headings and resume earlier paragraph numbering | 1 | Move same-track heading/paragraph split into `breakQuery` | Fixed and tested. |
| Autoreview found hard heading split broke outer lists across nested headings | 1 | Require same indent before breaking lookup | Fixed and tested. |
| Autoreview found hard heading split broke lists across non-list or differently styled headings | 1 | Require same defined list style before breaking lookup | Fixed and tested. |
| Shared helper initially lived in a barrel-exported query module | 1 | Move helper under `lib/internal` and run package barrel generation | Fixed; no public barrel changes. |

Verification evidence:
- `pnpm --filter @platejs/list test normalizeListStart` failed before fix with
  paragraph starts `3`, `4`; passed after fix.
- `pnpm --filter @platejs/list test isSameListSequence` passed after final fix
  with 111 fast tests after moving `normalizeListStart` to the slow lane.
- `pnpm test:slow packages/list/src/lib/normalizers/normalizeListStart.slow.tsx`
  passed after final fix with 36 slow tests.
- `pnpm --filter @platejs/list test toggleList` passed after final fix with 111
  fast tests after moving `normalizeListStart` to the slow lane.
- `pnpm test:slowest` passed after the slow-lane move; the fast-suite budget no
  longer reports `normalizeListStart` over the file threshold.
- `pnpm turbo typecheck --filter=./packages/list` passed.
- `pnpm lint:fix` passed, no fixes applied after the final boundary change.
- `pnpm --filter @platejs/list brl` passed with no generated public barrel
  changes.
- `.agents/skills/autoreview/scripts/autoreview --mode local` passed clean after
  accepted fixes; final clean result reported no accepted/actionable findings.
- `pnpm check` passed. It emitted an existing eslint warning in
  `apps/www/src/components/ui/sidebar.tsx` and exited 0.
- `gh pr view 5011 --repo udecode/plate --json url,body,headRefName,baseRefName,isDraft`
  verified the PR body.
- `gh issue comment 4985 --repo udecode/plate ...` posted
  https://github.com/udecode/plate/issues/4985#issuecomment-4700114410.

Final handoff contract:
- PR line: https://github.com/udecode/plate/pull/5011
- Issue / tracker line: #4985 synced with PR/comment.
- Confidence line: high, 95-100%.
- Flow table:
  - Reproduced: red `pnpm --filter @platejs/list test normalizeListStart`, browser N/A.
  - Verified: focused fast/slow tests, package typecheck, lint, autoreview, `pnpm check`, browser N/A.
- Browser check: N/A; issue says Browser surface No and behavior is package normalizer-owned.
- Outcome: ordered paragraph lists start independently after numbered headings.
- Caveat: `pnpm check` emitted existing eslint warning in `apps/www/src/components/ui/sidebar.tsx` but passed.
- Design:
  - Chosen boundary: same-indent, same defined list-style heading-vs-non-heading
    list tracks in list continuation lookup.
  - Why not quick patch: caller config cannot own persisted `listStart` normalization.
  - Why not broader change: raw element-type split regressed valid mixed non-heading ordered lists.
  - Why internal helper: public barrel export would be API noise.
- Verified: targeted and full checks listed above.
- PR body verified: yes, `gh pr view 5011 --repo udecode/plate --json ...`.

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
- PR: https://github.com/udecode/plate/pull/5011
- Issue / tracker: https://github.com/udecode/plate/issues/4985#issuecomment-4700114410
- Browser proof: N/A, no browser surface for package normalizer behavior.
- Caveats: existing eslint warning during `pnpm check`, command exited 0.

Timeline:
- 2026-06-13T23:11:53.317Z Task goal plan created.
- 2026-06-13T23:14Z Renamed date-based helper output to ticket-prefixed plan
  path required by repo policy.
- 2026-06-13T23:15Z Active goal created for #4985.
- 2026-06-14T00:02Z Red regression reproduced in `normalizeListStart`.
- 2026-06-14T00:08Z Normalizer fix and tests passed.
- 2026-06-14T00:20Z Autoreview P2 restart finding fixed.
- 2026-06-14T00:32Z Autoreview P2 mixed-block finding fixed.
- 2026-06-14T00:40Z Final autoreview clean.
- 2026-06-14T00:50Z `pnpm check` passed.
- 2026-06-14T00:53Z PR #5011 created and body verified.
- 2026-06-14T00:54Z Issue #4985 synced.
- 2026-06-14T01:20Z Helper made internal and custom heading node-type coverage
  added; final `pnpm check` passed.
- 2026-06-14T01:50Z Autoreview-driven boundary refinements added: same indent,
  same defined list style, plain-editor fallback, nested heading and
  non-numbered heading coverage; final autoreview clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Fix #4985 so paragraph ordered lists after numbered headings start at 1, with focused package proof. |
| What have I learned? | The correct boundary is same-indent, same defined list-style heading-vs-non-heading tracks using editor-resolved heading types; raw element type is too strict and global heading breaks are too blunt. |
| What have I done? | Fixed normalizer and toggle restart logic, added regressions, verified, opened PR, synced issue. |

Open risks:
- None beyond normal PR review/CI.
