# 4612 safari block selection copy

Objective:
Fix Safari block-selection copy prompt for #4612; done when native event clipboard path is implemented, tests/browser-proof/review/check pass, and PR exists.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-14-4612-safari-block-selection-copy.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: GitHub issue
- id / link: #4612 https://github.com/udecode/plate/issues/4612
- title: `"Copy to clipboard: ⌘+C, Enter" popup showing when trying to copy in Safari`
- acceptance criteria: On Safari/macOS, selecting blocks on platejs.org and pressing Cmd+C should not open the native "Copy to clipboard: ⌘+C, Enter" prompt, and copied block content should be written to the clipboard.

Completion threshold:
- `@platejs/selection` block-selection copy/cut uses the ClipboardEvent-provided `DataTransfer` instead of starting a second programmatic copy, existing fallback behavior remains available for non-event callers, package regression tests and typecheck pass, browser route is checked or explicitly blocked, autoreview has no accepted/actionable findings, PR exists, and #4612 is synced.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-4612-safari-block-selection-copy.md` passes.

Verification surface:
- Failing-then-passing focused `copySelectedBlocks` test proving event-provided clipboard data does not call `copy-to-clipboard`.
- `pnpm turbo typecheck --filter=./packages/selection`.
- `pnpm lint:fix`.
- Browser proof against the Plate editor route when the approved browser tool is available; Safari-specific live proof is best-effort because the repo-approved browser tool is not Safari.
- `pnpm check` before PR.
- Autoreview and PR body readback.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: GitHub issue #4612 body, comments, and screenshot attachment.
- Allowed edit scope: `packages/selection/**`, focused tests, one `@platejs/selection` changeset, and this goal plan.
- Browser surface: top editor / block-selection copy flow on the Plate website or local equivalent.
- Tracker sync: create PR first for verified code, then comment on #4612.
- Non-goals: Do not redesign browser clipboard architecture, remove block selection, or claim native Safari clipboard APIs can be bypassed outside user-initiated copy events.

Output budget strategy:
- Use focused `rg` under `packages/selection`, short `sed` ranges, capped command output, and local artifacts for screenshots. One broad pre-goal `rg` streamed too much output; after goal creation all searches are scoped/capped.

Blocked condition:
- Stop only if the package fix is impossible without changing browser/Safari permission behavior, required repo checks fail from an unrelated blocker after one reinstall retry when appropriate, or PR creation/tracker sync lacks access.

Task state:
- task_type: bug
- task_complexity: non-trivial
- current_phase: PR / tracker sync
- current_phase_status: in_progress
- next_phase: closeout
- goal_status: active

Current verdict:
- verdict: fixable in Plate
- confidence: high
- next owner: task
- reason: The hidden input already receives a real ClipboardEvent, but `copySelectedBlocks` starts a second `copy-to-clipboard` programmatic copy, matching the Safari prompt in #4612.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-4612-safari-block-selection-copy.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `task`, `autogoal`, `tdd`, `changeset`, `autoreview`, and Browser instructions before the relevant phases. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created #4612 objective for this plan. |
| Source of truth read before edits | yes | `gh issue view 4612 --repo udecode/plate --json ...` read body/comments. |
| Tracker comments and attachments read | yes | Comments read; screenshot downloaded to `/tmp/plate-4612-safari-copy.png` and inspected. |
| Video transcript evidence required | no | N/A: issue has an image, not video/screen recording. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read clipboard boundary notes: split fragment semantics from browser transport; prove real clipboard path when possible. |
| TDD decision before behavior change or bug fix | yes | Use a focused red/green test for event-provided DataTransfer avoiding `copy-to-clipboard`. |
| Branch decision for code-changing task | yes | Created `codex/4612-safari-block-selection-copy` from `main` before code edits. |
| Release artifact decision | yes | Published `@platejs/selection` runtime behavior changes, so add a patch changeset. |
| Browser tool decision for browser surface | yes | Browser pack applies; use approved Browser if available, otherwise record blocker/waiver and do not claim live Safari proof. |
| PR expectation decision | yes | Code-changing task should create PR after `check`. |
| Tracker sync expectation decision | yes | Comment on #4612 after PR exists. |
| Output budget strategy recorded | yes | Recorded above. |
| Browser pack selected | yes | Applied `browser` pack. |
| Browser route / app surface identified | yes | Plate editor block-selection copy route, ideally `/` or standalone block-selection demo if available. |
| Browser tool decision recorded | yes | Approved Browser first; Safari-specific proof may be unavailable in this runtime. |
| Console/network caveat policy recorded | yes | Check console/network when Browser is available; otherwise record blocker. |
| Package/API pack selected | yes | Applied `package-api` pack. |
| Public surface or package boundary identified | yes | `@platejs/selection` exported runtime utility and block-selection copy/cut behavior. |
| Release artifact path selected | yes | `.changeset` for `@platejs/selection` patch. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded `.agents/skills/changeset/SKILL.md`. |
| Barrel/export impact decision recorded | yes | No exported file add/remove/layout change expected; `pnpm brl` N/A unless diff changes exports. |

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
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `bun test packages/selection/src/react/utils/copySelectedBlocks.spec.tsx`, `pnpm turbo typecheck --filter=./packages/selection`, `pnpm lint:fix`, `pnpm check`, and autoreview passed; PR/tracker sync pending. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Red test failed before implementation: `copyToClipboardMock` was called once when event DataTransfer was provided. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `bun test packages/selection/src/react/utils/copySelectedBlocks.spec.tsx` -> 3 pass, 17 expects. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/selection` -> 8 successful tasks. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exported file add/remove/layout change. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A for patch, though `pnpm run reinstall` was run once to rule out local install corruption after unrelated package-suite failure. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents/**`, `.claude/**`, `.codex/**`, skill, hook, command, or prompt files changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate`; package proof used `@platejs/selection`; Browser opened `http://localhost:3000`. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Browser route loaded with one Slate editor; native clipboard shortcuts are disabled by the in-app browser, so exact shortcut proof is blocked by tool policy. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Exact caveat: approved Browser cannot press Meta+C/clipboard shortcuts; console logs were empty after route load and attempted copy proof. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` output changed. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `.changeset/cold-safari-copy.md` adds `@platejs/selection` patch. |
| Registry-only component work changed | no | Update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, or record N/A | N/A: not registry-only component work. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only the internal goal plan changed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: break non-Safari copy/cut or non-event callers. Proof: red/green direct DataTransfer test, fallback kept, package typecheck, root check, Browser caveat. Boundary: hidden input copy/cut event is browser transport owner. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling files changed. |
| Local install corruption suspected | yes | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | `pnpm --filter @platejs/selection test` failed in unrelated movement tests; `pnpm run reinstall` run once; exact package script still failed, but focused failing files pass alone and root `pnpm check` passed. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | `.agents/skills/autoreview/scripts/autoreview --mode local` -> clean, no accepted/actionable findings, overall 0.84. |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | `pnpm check` passed; PR pending. |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` -> checked 3276 files, no fixes applied. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One pre-goal broad `rg` streamed too much output; all post-goal commands used focused paths/caps. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-4612-safari-block-selection-copy.md` | pending |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | Browser loaded `http://localhost:3000` and found one Slate editor; exact Meta+C proof blocked because Browser disables native clipboard shortcuts. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | `tab.dev.logs({ levels: ['error', 'warning'] })` returned `[]` after route load/attempt. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | Caveat recorded: Browser shortcut limitation prevents exact local copy gesture proof; package test proves event DataTransfer route. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Optional `dataTransfer?: DataTransfer` return boolean preserves no-arg fallback; no export/file-layout changes. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package runtime behavior for `@platejs/selection`. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | `.changeset/cold-safari-copy.md` is one `@platejs/selection` patch file; no forbidden core package minor. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, and do not add a package changeset | N/A: not registry-only. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: changeset applies. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Focused test and package typecheck passed; full package script has unrelated order/runtime pollution, but `pnpm check` passed root gates. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exports or exported file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read #4612 body/comments/screenshot, local block-selection copy implementation, tests, TDD and changeset rules, and clipboard solution notes. | implementation |
| Implementation | complete | Patched `copySelectedBlocks` to accept event DataTransfer and updated copy/cut handlers to pass `e.clipboardData`. | verification |
| Verification | complete | Red test, focused green test, package typecheck, lint, browser caveat, root `pnpm check`, and autoreview recorded. | closeout |
| PR / tracker sync | in_progress | `pnpm check` passed; PR/tracker sync pending. | final response |
| Closeout | pending | | final response |

Findings:
- #4612 screenshot shows Safari native copy prompt after Cmd+A/C on selected Plate blocks.
- Latest issue comment points at block-selection copy using `copy-to-clipboard`; local code confirms `BlockSelectionAfterEditable` receives a ClipboardEvent but calls `copySelectedBlocks(editor)`, which starts `copyToClipboard(' ', ...)`.
- `copySelectedBlocks` already knows how to serialize selected blocks into a `DataTransfer`; it should write into the event clipboard data when one exists and keep the old fallback only for non-event callers.

Decisions and tradeoffs:
- Fix the event transport path in `@platejs/selection` instead of treating this as an unavoidable Safari limitation.
- Keep the existing programmatic fallback for callers that invoke `copySelectedBlocks(editor)` outside a copy event.
- No compatibility break: new optional `DataTransfer` parameter and boolean return refine existing behavior.

Implementation notes:
- Code: `copySelectedBlocks(editor, dataTransfer?)` writes directly when `dataTransfer` is provided; `BlockSelectionAfterEditable` passes `e.clipboardData` and prevents default only after a successful write.
- High-risk note: failure mode is breaking non-Safari copy/cut or non-event utility callers. Proof plan is focused regression tests for direct-event and fallback paths, package typecheck/lint/check, and browser proof when available. Boundary is right because React event wiring owns browser transport and the utility owns selected-block serialization.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad pre-goal `rg` streamed too much output | 1 | Use focused paths and caps | Recovered; post-goal searches/read commands scoped. |
| `pnpm --filter @platejs/selection test` / `bun test packages/selection/src` fail movement tests with `editor.api.debug` missing | 2 | Rule out install rot, run focused files and root gate | `pnpm run reinstall` did not change package-script failure; failing file passes alone; root `pnpm check` passed. |
| Browser native shortcut proof blocked | 2 | Record approved Browser limitation | `locator.press('Meta+C')` and `tab.cua.keypress({keys:['Meta','C']})` both blocked with native clipboard shortcut policy. |

Verification evidence:
- Red: `bun test packages/selection/src/react/utils/copySelectedBlocks.spec.tsx` failed before implementation because `copyToClipboardMock` was called once for provided DataTransfer.
- Green focused: `bun test packages/selection/src/react/utils/copySelectedBlocks.spec.tsx` -> 3 pass, 17 expects.
- Package typecheck: `pnpm turbo typecheck --filter=./packages/selection` -> 8 successful tasks.
- Package full-script caveat: `pnpm --filter @platejs/selection test` still fails unrelated order/runtime pollution after reinstall; root check below passed.
- Lint fix: `pnpm lint:fix` -> no fixes applied.
- Browser: in-app Browser loaded `http://localhost:3000`, found one `[data-slate-editor="true"]`, console warnings/errors `[]`; native clipboard shortcuts disabled by Browser, so no exact Safari/Meta+C browser proof.
- Root PR gate: `pnpm check` -> passed.
- Autoreview: `.agents/skills/autoreview/scripts/autoreview --mode local` -> clean, no accepted/actionable findings.

Final handoff contract:
- PR line: pending
- Issue / tracker line: pending
- Confidence line: pending
- Flow table:
  - Reproduced: red focused test, browser screenshot/source from issue
  - Verified: focused test, package typecheck, root check, browser route/caveat
- Browser check: Local homepage loaded and console was clean; exact clipboard shortcut blocked by Browser policy, and this is not a Safari engine.
- Outcome: Block-selection copy/cut uses native event clipboard data instead of starting a second programmatic copy through `copy-to-clipboard`.
- Caveat: Live Safari prompt cannot be proven from the in-app browser; package test locks the Safari-triggering call path.
- Design:
  - Chosen boundary: `@platejs/selection` hidden input copy/cut event wiring plus selected-block clipboard serializer.
  - Why not quick patch: Browser prompt is caused by using `copy-to-clipboard` inside an existing copy event, so suppressing the prompt or disabling copy would be wrong.
  - Why not broader change: Core Slate clipboard serialization already works with `DataTransfer`; the bug is the block-selection transport path.
- Verified: red/green focused test, `pnpm turbo typecheck --filter=./packages/selection`, `pnpm lint:fix`, `pnpm check`, Browser route/caveat, autoreview.
- PR body verified: pending

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
- PR: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-06-14T20:45:41.384Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
