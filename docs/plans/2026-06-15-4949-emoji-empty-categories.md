# 4949 emoji empty categories

Objective:
Fix issue #4949 emoji empty categories; done when reproduced, durable fix verified, PR/tracker sync complete.

Goal plan:
docs/plans/2026-06-15-4949-emoji-empty-categories.md

Template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)

Task source:
- GitHub issue: https://github.com/udecode/plate/issues/4949
- Title: Emoji plugin shows empty categories when scrolling or filtering
- Acceptance criteria: category navigation in the docs emoji picker renders category rows instead of a blank pane.

Completion threshold:
- Issue #4949 is reproduced, fixed at the durable package owner boundary, verified by focused tests and Browser proof, documented with a package changeset, reviewed, PR-created, and synced back to the tracker.
- Task closure is legal only after `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-4949-emoji-empty-categories.md` passes.

Verification surface:
- Issue video transcript and screenshot evidence.
- Focused hook regression for category click visibility.
- `@platejs/emoji` typecheck, focused hook test, lint fix, Browser proof on `/docs/emoji`, final repo `check`, autoreview.

Constraints:
- Preserve existing picker search/selection behavior.
- Prefer the current package owner boundary over waiting for a future emoji-plugin rewrite.
- Do not create registry changelog output because no registry source changed.

Boundaries:
- Source of truth: issue #4949 body, comments, video, screenshot, and local source.
- Edit scope: `packages/emoji` hook/test plus one `@platejs/emoji` changeset.
- Browser surface: local docs route `http://localhost:3002/docs/emoji`.
- Tracker sync: comment after PR exists.

Output budget strategy:
- Use targeted `gh`, `rg`, `sed`, focused tests, and Browser state reads; avoid broad output after the initial accidental search.

Blocked condition:
- Stop only if the bug cannot be reproduced through issue evidence plus package/browser proof, or if the durable fix requires a larger API rewrite.

Task state:
- task_type: public tracker bug
- task_complexity: non-trivial
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: valid
- confidence: high
- next owner: closeout
- reason: category clicks focused the selected section but did not mark it visible, so the registry picker could show the target category header while rows stayed hidden until observer state caught up.

Pre-solution issue challenge:
- Reporter claim: valid. The issue video and screenshot show category navigation landing on empty category panes such as Food & Drink.
- Suggested diagnosis or fix: reporter proposed none; the existing maintainer comment deferred to a future frimousse rewrite.
- Harsh honest feedback: deferring this to a rewrite was a bad fix strategy. The current hook already owns focus and visibility state, so it should render the clicked category immediately.
- Repro ladder:
  - issue video transcript: complete; transcript shows Food & Drink, Activity, Travel & Places, Symbols, and Flags showing only `Pick an emoji...`.
  - source/test repro: complete; failing hook test proved `handleCategoryClick('foods')` dispatched only `SET_FOCUSED_CATEGORY`.
  - Browser proof: complete; local `/docs/emoji` now shows Food & Drink with rendered emoji rows after search.
  - screenshot proof: complete during verification; temporary `.tmp/issue-4949` artifacts removed before PR.
- Validity verdict: valid.
- Best long-term fix boundary: package hook `useEmojiPicker`; registry UI already follows the hook's `visibleCategories` contract.
- Hard-stop decision: no hard stop; fix implemented.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded task, autogoal, autoreview, video-transcripts, tdd, changeset, and Browser control skill. |
| Active goal checked or created | yes | `create_goal` created the active goal for this plan. |
| Source of truth read before edits | yes | `gh issue view 4949 --json ...` read issue body, comments, labels, and URL. |
| Tracker comments and attachments read | yes | Issue comment deferring to frimousse read; video and screenshot attachment URLs read. |
| Video transcript evidence required | yes | `generate_video_transcript.sh` produced normalized transcript for the issue video. |
| Pre-solution issue challenge required | yes | Recorded valid claim, bad defer-to-rewrite strategy, and package owner boundary. |
| Reproduction verdict before implementation | yes | Red hook test failed on the existing `SET_FOCUSED_CATEGORY` dispatch. |
| Repro escalation ladder selected | yes | Issue/video, source-level hook test, Browser proof, screenshot proof. |
| Suggested fix reviewed against durable boundary | yes | Future frimousse rewrite rejected as unnecessary for this bug. |
| `docs/solutions` checked for non-trivial existing-code work | yes | No direct prior emoji empty-category solution found; broad search was too noisy and recorded below. |
| TDD decision before behavior change or bug fix | yes | Added failing `useEmojiPicker` regression before source edit. |
| Branch decision for code-changing task | yes | Created `codex/4949-emoji-empty-categories` from `origin/main`. |
| Release artifact decision | yes | Added `.changeset/fix-emoji-category-navigation.md` for `@platejs/emoji` patch. |
| Browser tool decision for browser surface | yes | Used in-app Browser against local `http://localhost:3002/docs/emoji`. |
| PR expectation decision | yes | Code-changing task will create PR after `check`. |
| Tracker sync expectation decision | yes | Comment back on issue #4949 after PR exists. |
| Output budget strategy recorded | yes | See Output budget strategy and Error attempts. |
| Browser pack selected | yes | Browser pack selected at plan creation. |
| Browser route / app surface identified | yes | `/docs/emoji` docs preview. |
| Browser tool decision recorded | yes | Used repo-approved Browser plugin. |
| Console/network caveat policy recorded | yes | Browser console warn/error logs were empty. |
| Registry changelog pack selected | yes | Pack selected conservatively at plan creation. |
| User-visible registry impact classified | no | N/A: no `apps/www/src/registry/**` source changed. |
| Source entry path selected | no | N/A: no registry changelog entry needed. |
| Generator command selected | no | N/A: registry changelog generator not needed. |

Work Checklist:
- [x] Objective, threshold, verification, constraints, boundaries, and blocked condition recorded.
- [x] Issue source, comments, video, and screenshot read.
- [x] Video transcript evidence cached/read as normalized XML output.
- [x] Public bug claim challenged before implementation.
- [x] Repro ladder followed: issue evidence, source test, Browser proof, screenshot.
- [x] Hard-stop rule followed; issue was reproduced and valid.
- [x] Nearby implementation patterns read before edits.
- [x] Implementation fixed the package hook owner boundary.
- [x] Release artifact decision recorded; `@platejs/emoji` changeset added.
- [x] Branch handling recorded.
- [x] Workspace authority recorded for proof commands.
- [x] High-risk note recorded: package-boundary browser behavior guarded by focused hook test and Browser proof.
- [x] Autoreview target selected for the local diff.
- [x] Agent-native review decision recorded: N/A, no agent/tooling code changed.
- [x] Output budget discipline recorded, including accidental broad search.
- [x] Browser route, interaction path, console state, and screenshot proof recorded.
- [x] Registry changelog pack resolved as N/A because no registry source changed.
- [x] Package-test suite caveat recorded and not widened into this fix.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused tests, typecheck, lint, Browser proof, final check, review | Focused test, package typecheck, lint, Browser proof, autoreview, and `pnpm check` passed. |
| Pre-solution issue challenge verdict | yes | Record claim, repro, validity, boundary, hard-stop decision | See Pre-solution issue challenge. |
| Repro escalation ladder | yes | Source-level plus Browser proof | Red hook test and Browser Food & Drink proof complete. |
| Bug reproduced before fix | yes | Record failing test | `bun test packages/emoji/src/react/hooks/useEmojiPicker.spec.tsx` failed before fix on expected visible category dispatch. |
| Targeted behavior verification | yes | Run focused test/proof | `bun test packages/emoji/src/react/hooks/useEmojiPicker.spec.tsx` passed after fix. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/emoji` passed. |
| Package exports or file layout changed | no | No barrel run | N/A: no exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | no | No install run | N/A: no manifest/lockfile changes. |
| Agent rules or skills changed | no | No skill sync | N/A: no agent rules/skills changed. |
| Workspace authority proof | yes | Run commands in `/Users/zbeyens/git/plate` | All test/typecheck/browser commands ran from this repo. |
| Browser surface changed | yes | Capture Browser proof | Browser showed Food & Drink with 133 rendered buttons. |
| Browser final proof | yes | Save screenshot or caveat | Browser state read proved Food & Drink rendered 133 visible emoji buttons after search; console warn/error logs empty. Temporary screenshot artifacts removed before PR. |
| CI-controlled template output changed | no | No restore needed | N/A: no templates changed. |
| Package behavior or public API changed | yes | Add changeset | `.changeset/fix-emoji-category-navigation.md`. |
| User-visible registry output changed | no | No registry changelog | N/A: package hook changed, registry source unchanged. |
| Docs or content changed | no | No docs proof | N/A: docs source unchanged. |
| High-risk mini gate | yes | Record failure mode and proof plan | Failure mode was invisible category rows; guarded by hook regression and Browser proof. |
| Agent-native review for agent/tooling changes | no | No agent review | N/A: no agent/tooling code changed. |
| Local install corruption suspected | no | No reinstall | N/A: package-suite failure isolated to package script mock/order behavior; focused/root commands own this task. |
| Autoreview for non-trivial implementation changes | yes | Run final local review | `.agents/skills/autoreview/scripts/autoreview --mode local` passed after fixing the accepted search-clearing finding. |
| PR create or update | yes | Run `check`, commit, push, open PR | PR #5024: https://github.com/udecode/plate/pull/5024. |
| Task-style PR body verified | yes | Verify with `gh pr view --json body` | `gh pr view 5024 --json number,url,title,body` verified the PR body includes issue link, confidence, tests, Browser proof, caveat, and outcome. |
| PR proof image hosting | no | No hosted image needed | N/A: PR can cite Browser proof text; screenshot kept local. |
| Tracker sync-back | yes | Comment on issue after PR exists | Issue comment posted: https://github.com/udecode/plate/issues/4949#issuecomment-4709980737. |
| Final handoff contract | yes | Fill final answer with PR/issue/tests/browser/outcome | To complete after PR/tracker sync. |
| Final lint | yes | Run `pnpm lint:fix` | Passed. |
| Output budget discipline | yes | Record accidental output and recovery | See Error attempts. |
| Goal plan complete | yes | Run autogoal checker | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-4949-emoji-empty-categories.md` passed after PR/tracker sync. |
| Browser interaction proof | yes | Exercise target route | Opened picker, searched `pizza`, then clicked Food & Drink on `http://localhost:3002/docs/emoji`. |
| Browser console/network check | yes | Check logs | `tab.dev.logs({ levels: ['error','warn'] })` returned `[]`. |
| Browser final proof artifact | yes | Screenshot/route proof | Browser state proof captured; temporary screenshot artifacts removed before PR. |
| Registry impact classification | yes | Record N/A | N/A: no registry source changed. |
| Registry changelog source | no | No entry | N/A. |
| Registry changelog generation | no | No generator | N/A. |
| Registry changelog check | no | No check | N/A. |
| Registry generator test | no | No generator change | N/A. |
| Registry package release split | yes | Record package changeset only | Package changeset only. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | issue body/comments/video/screenshot read | implementation |
| Implementation | done | hook fix and regression test | verification |
| Verification | done | focused test, typecheck, lint, Browser proof, autoreview, `pnpm check` | publish |
| PR / tracker sync | done | PR #5024 created and issue #4949 commented | closeout |
| Closeout | done | autogoal checker passed after PR/tracker sync | final response |

Findings:
- The issue is valid.
- The package hook focused the clicked category but left `visibleCategories` unchanged, so the registry picker could render the category header with zero rows.
- The old “future frimousse rewrite” answer was too passive; this bug has a small current owner-boundary fix.

Decisions and tradeoffs:
- Fix `useEmojiPicker` by marking the clicked category visible before scrolling.
- Keep the registry UI unchanged because it correctly renders rows from `visibleCategories`.
- Do not add registry changelog output because copied registry source did not change.

Implementation notes:
- `handleCategoryClick` now gets the grid once, builds a visibility map where only the clicked category is `true`, dispatches `SET_FOCUSED_AND_VISIBLE_CATEGORIES`, then scrolls to the target section.
- Regression test asserts the clicked `foods` category is visible immediately and the scroll position is preserved.

Review fixes:
- Autoreview found a valid regression in the first patch: category clicks after search no longer cleared search state. Fixed by dispatching `SET_FOCUSED_AND_VISIBLE_CATEGORIES` with `isSearching: false`, `searchValue: ''`, and `hasFound: false`, then adding a remount-aware scroll retry.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Over-broad `rg "emoji|Emoji|frimousse|empty categor|category"` streamed noisy unrelated docs output | 1 | Narrowed to emoji package/docs paths and capped later outputs | Recovered; no further broad search output. |
| `pnpm --filter @platejs/emoji test` failed in package script on two unrelated mock/export-order specs | 1 | Ran failing specs in isolation from repo root and kept focused regression as authoritative | Isolated specs passed; not widened into this issue. |
| Browser coordinate click at x=1098/y=399 failed | 1 | Used DOM/source-derived toolbar button locator index 23 | Picker opened and proof completed. |
| Browser evaluator used TypeScript `as HTMLElement` syntax | 1 | Retried with plain JavaScript | Food & Drink proof completed. |
| Browser initially still showed old behavior after source fix | 1 | Built `@platejs/emoji` so the docs app consumed updated package artifacts | Search-then-category Browser proof passed after `pnpm --filter @platejs/emoji build`. |
| Search results unmounted category refs, making an immediate scroll attempt fragile | 1 | Added `contentRoot.contains(sectionRoot)` and a layout-effect retry keyed by pending category | Hook test covers delayed remount scroll; Browser search proof passed. |

Verification evidence:
- `gh issue view 4949 --json number,title,state,author,body,comments,labels,assignees,milestone,createdAt,updatedAt,url` in `/Users/zbeyens/git/plate` -> issue source and comments read.
- `generate_video_transcript.sh` on issue video -> transcript shows multiple category clicks leading to only `Pick an emoji...`.
- Red test: `bun test packages/emoji/src/react/hooks/useEmojiPicker.spec.tsx` failed before fix because `handleCategoryClick('foods')` dispatched `SET_FOCUSED_CATEGORY` without `visibleCategories`.
- Green focused test: `bun test packages/emoji/src/react/hooks/useEmojiPicker.spec.tsx` -> 3 pass, 0 fail.
- Typecheck: `pnpm turbo typecheck --filter=./packages/emoji` -> successful.
- Lint: `pnpm lint:fix` -> successful.
- Autoreview: `.agents/skills/autoreview/scripts/autoreview --mode local` -> `autoreview clean: no accepted/actionable findings reported`.
- Final check: `pnpm check` -> successful.
- Browser: local dev server `pnpm --dir apps/www dev` served `http://localhost:3002`; Browser opened `/docs/emoji`, clicked emoji toolbar button index 23, searched `pizza`, clicked `Food & Drink`, and measured `searchValue: ""`, `headerText: "Food & Drink"`, `foodButtonCount: 133`, `visibleFoodButtonCount: 133`, first labels `🍇 🍈 🍉 🍊 🍋 🍌 🍍 🥭 🍎 🍏 🍐 🍑`, console warn/error logs `[]`.
- Screenshot: captured during verification, then removed with `.tmp/issue-4949` before PR.

Final handoff contract:
- PR line: https://github.com/udecode/plate/pull/5024.
- Issue / tracker line: https://github.com/udecode/plate/issues/4949#issuecomment-4709980737.
- Confidence line: high; focused package regression plus Browser proof.
- Flow table:
  - Reproduced: issue video/screenshot plus red hook test.
  - Verified: focused hook test, emoji package typecheck, lint fix, Browser search-then-Food & Drink proof, autoreview, final `pnpm check`.

Reboot status:
- Current branch is `codex/4949-emoji-empty-categories`.
- Dev server session 70413 was stopped after Browser proof.
- Remaining steps: amend/push closeout record, mark goal complete.

Open risks:
- None for the scoped bug. The broader package test script has existing mock/order instability when run via `pnpm --filter @platejs/emoji test`; both implicated specs pass in isolation and the focused regression covers this change.
