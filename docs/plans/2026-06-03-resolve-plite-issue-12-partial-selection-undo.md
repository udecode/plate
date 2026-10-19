# resolve slate issue 12 partial selection undo

Objective:
Resolve udecode/slate issue #12 by proving current Plite partial drag-selection replacement undo behavior, patching only if red, then posting verified issue sync.

Goal plan:
docs/plans/2026-06-03-resolve-slate-issue-12-partial-selection-undo.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: GitHub issue
- id / link: udecode/slate#12 https://github.com/udecode/slate/issues/12
- title: [examples] Undo restores only part of a replaced partial text selection
- acceptance criteria: On current `.tmp/plite`, a real browser drag-selection of `plain ` in `/examples/plaintext`, typing `simple`, then pressing Undo restores `This is editable plain text, just like a <textarea>!`; extra named routes (`inlines`, `styling`, `code-highlighting`) are verified or caveated before closure.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Done when issue #12 is classified from current `.tmp/plite` truth as `red-current -> fixed`, `already-accounted`, `needs-manual-proof`, or `blocked`; the classification has replayable browser evidence for the manual drag-selection path; a concise no-PR issue comment is posted; the issue is closed only at `95%+` confidence; and this plan passes `check-complete`.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-resolve-slate-issue-12-partial-selection-undo.md` passes.

Verification surface:
- Required: `PLAYWRIGHT_BASE_URL=http://localhost:3100 bun playwright test playwright/integration/examples/plaintext.test.ts --project=chromium --grep "<issue row>"` from `.tmp/plite`, using real mouse drag selection rather than only synthetic `selectDOM`.
- Required if code changes: focused owner package/typecheck commands for touched packages, plus broader `bun check` when runtime/package risk justifies it.
- Required issue sync: `gh issue comment https://github.com/udecode/slate/issues/12 -R udecode/slate --body-file <file>`, then `gh issue close ...` only at `95%+`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: GitHub issue #12 body/comments/attachments, current `.tmp/plite` source/tests, and live browser proof.
- Allowed edit scope: `.tmp/plite` browser tests and durable runtime/package owners if current behavior is red; this plan for evidence.
- Browser surface: `http://localhost:3100/examples/plaintext`; extra issue-named examples only if needed for closure/caveat.
- Tracker sync: post directly on issue #12 with `gh issue comment --body-file`; no PR metadata and no `Fixes ...` line.
- Non-goals: no PR, no commit, no release/publish/changeset noise unless a code change creates a real package artifact requirement, no broad pagination/virtualization work.

Output budget strategy:
- Scope `rg` to `.tmp/plite/playwright`, package owners, and docs solution/ledger paths; cap command output with `max_output_tokens`; save screenshots under `/tmp/slate-issue-12`; record only exact commands/evidence in final comment.

Blocked condition:
- Blocked only if current `.tmp/plite` cannot run the required browser proof after a real attempt, issue attachments are inaccessible enough to make the flow ambiguous, or the required manual drag/native browser path cannot be honestly automated; then comment with a human repro request and leave open.

Task state:
- task_type: issue-resolution browser behavior bug
- task_complexity: normal
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: already-accounted with proof gap repaired
- confidence: 95-100%
- next owner: issue comment and close
- reason: Current v2 restores selected text after real mouse-drag replacement undo on Plain Text plus the extra issue-named Inlines, Styling, and Code Highlighting routes.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-resolve-slate-issue-12-partial-selection-undo.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Explicit scope, non-goals, proof surface, issue-comment/close rules, and final handoff constraints are copied into this plan before implementation. |
| Skill analysis before edits | yes | Read `plite-automation`, `resolve-slate-issue`, `autogoal`, and `vision`. |
| Active goal checked or created | yes | `create_goal` started objective for issue #12 with this plan path. |
| Source of truth read before edits | yes | `gh issue view https://github.com/udecode/slate/issues/12 -R udecode/slate --comments --json number,title,body,comments,labels,state,url`. |
| Tracker comments and attachments read | yes | Issue body/comments read; screenshots downloaded to `/tmp/slate-issue-12` and inspected. |
| Video transcript evidence required | yes | N/A: issue body has an optional video placeholder but no attached video URL in fetched issue data. |
| `docs/solutions` checked for non-trivial existing-code work | yes | `rg` found relevant prior solution/ledger rows, including the old caveat that #12 only covered synthetic Plain Text proof. |
| TDD decision before behavior change or bug fix | yes | Add or use smallest current-state browser proof first; patch runtime only if that proof is red. |
| Branch decision for code-changing task | yes | N/A: user wants to stay on v2/current checkout; do not create branches. |
| Release artifact decision | yes | N/A unless runtime/package code changes create a published behavior delta; continuous private alpha, no release/publish noise. |
| Browser tool decision for browser surface | yes | Use replayable Playwright/plite-browser for issue closure; use in-app Browser only if visual/manual proof remains ambiguous. |
| PR expectation decision | yes | No PR work; `resolve-slate-issue` forbids opening/mentioning PRs. |
| Tracker sync expectation decision | yes | Post concise no-PR GitHub issue comment only after verified classification. |
| Output budget strategy recorded | yes | See Output budget strategy. |
| Browser pack selected | yes | Browser pack applies to `/examples/plaintext` editing behavior. |
| Browser route / app surface identified | yes | `http://localhost:3100/examples/plaintext`. |
| Browser tool decision recorded | yes | Playwright with `plite-browser` real mouse drag selection is the primary route proof. |
| Console/network caveat policy recorded | yes | Check console/runtime errors in Playwright through `recordPliteBrowserRuntimeErrors` where applicable; no network feature in scope. |
| Package/API pack selected | yes | Package/API pack applies only if runtime/package code changes. |
| Public surface or package boundary identified | yes | Potential owners: `plite-react` selection/input/history path or `plite-history`; no public API change expected. |
| Release artifact path selected | yes | `N/A: continuous private alpha issue proof unless code change creates an explicit package artifact decision`. |
| `changeset` skill loaded when `.changeset` is required | yes | N/A: `plite-browser` is private and this is continuous private alpha proof/test work. |
| Barrel/export impact decision recorded | yes | N/A: no barrel/export generation path changed; `plite-browser` dist was rebuilt from source. |

Work Checklist:
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
- [x] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Focused Chromium issue rows passed `5 passed`; `bun check` passed. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | N/A: current v2 did not reproduce the issue once the real mouse path and platform Undo hotkey were used; prior issue screenshots/comments recorded the historical red. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_BASE_URL=http://localhost:3100 bun playwright test ... --project=chromium --grep "mouse drag undo restores"` passed 5 rows. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun --filter plite-browser typecheck`; also covered by `bun check`. |
| Package exports or file layout changed | yes | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no file layout/barrel change; `plite-browser` dist rebuilt from existing export entry. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | N/A: no manifest/lockfile/install graph change. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | N/A: no agent rule/skill change. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All Plite behavior/package proof ran from `/Users/zbeyens/git/plate-2/.tmp/plite`. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Replayable Playwright browser proof is the issue oracle; no UI implementation changed. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Exact command/browser route proof recorded; screenshots from issue were downloaded/inspected. |
| CI-controlled template output changed | yes | Restore generated template output or record why it is intentionally kept | N/A: no CI-controlled templates touched. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | No changeset: `plite-browser` is private, and this is internal proof harness API during private alpha. |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only goal plan evidence changed outside `.tmp/plite`. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: helper could select wrong range/spacer; proof covers Plain Text, Inlines text/link, Styling, Code Highlighting. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling files changed. |
| Local install corruption suspected | yes | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no local install corruption signature; stale `plite-browser` dist resolved by package rebuild. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: issue classification/test-oracle patch only; no runtime behavior change, and user previously asked to stop autoreview loops. |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: `resolve-slate-issue` forbids PR work. |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | yes | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR. |
| Tracker sync-back | yes | Post concise issue/Linear sync after PR exists, or record N/A/blocker | Posted https://github.com/udecode/slate/issues/12#issuecomment-4615379686 and closed issue #12. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `bun check` ran lint with 0 errors; no autofix needed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Mostly capped outputs; one `rg` over dist source map was too broad, then recovered by scoping later proof output. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-resolve-slate-issue-12-partial-selection-undo.md` | `[autogoal] complete`. |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | Chromium Playwright performed real mouse drag selection, replacement typing, and platform Undo on Plain Text, Inlines, Styling, and Code Highlighting. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Runtime-error recorder not needed for unchanged runtime; focused Playwright rows completed without browser/runtime errors. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | Issue screenshots inspected; passing Playwright rows are final proof. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `PliteBrowserEditorHarness.selection.dragTextRange` added under existing `plite-browser/playwright` export; package build/typecheck green. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Internal proof harness/test-only change in private alpha; no release artifact. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A: private `plite-browser`; no publish/release. |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | N/A: no registry change. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Internal private alpha proof harness/test-only; no user-visible published delta. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `bun --filter plite-browser build`, `bun --filter plite-browser typecheck`, `bun --filter plite-browser test:core`, `bun check`. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no barrel/export generation path. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | issue source/comments/screenshots, docs ledgers, skills read | implementation |
| Implementation | done | added `plite-browser` drag-range helper and issue-route proof rows | verification |
| Verification | done | focused Chromium rows, package build/typecheck/core tests, `bun check` passed | tracker sync |
| PR / tracker sync | done | Posted https://github.com/udecode/slate/issues/12#issuecomment-4615379686 and closed issue #12 | final response |
| Closeout | done | `check-complete` passed. | final response |

Findings:
- Current v2 no longer reproduces the reported corruption when the manual mouse-drag path is exercised with the real platform Undo hotkey.
- The old proof gap was real: synthetic `selectDOM` alone was not enough, so the issue stayed open correctly.
- The clean long-term proof owner is `plite-browser/playwright` selection API plus route rows, not runtime code.

Decisions and tradeoffs:
- Keep runtime unchanged; current behavior is green.
- Add `editor.selection.dragTextRange(...)` to make manual drag-selection proof reusable.
- Close at 95-100% only after covering the extra issue-named routes.

Implementation notes:
- Added `PliteBrowserDragTextRangeOptions` and `PliteBrowserEditorHarness.selection.dragTextRange`.
- Added real mouse-drag replacement undo rows for Plain Text, Inlines plain text, Inlines link text, Styling, and Code Highlighting.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Focused Playwright first failed with `ERR_CONNECTION_REFUSED` | 1 | Start `bun serve` in `.tmp/plite` | Server started on http://localhost:3100 and proof reran. |
| New helper missing at runtime | 1 | Rebuild private `plite-browser` package | `bun --filter plite-browser build` refreshed dist. |
| `page.keyboard.press('ControlOrMeta+Z')` did not trigger Undo | 1 | Use platform hotkey from `navigator.userAgent` | All issue-route rows passed. |

Verification evidence:
- `cd /Users/zbeyens/git/plate-2/.tmp/plite && bun --filter plite-browser build`
- `cd /Users/zbeyens/git/plate-2/.tmp/plite && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_BASE_URL=http://localhost:3100 bun playwright test playwright/integration/examples/plaintext.test.ts playwright/integration/examples/inlines.test.ts playwright/integration/examples/styling.test.ts playwright/integration/examples/code-highlighting.test.ts --project=chromium --grep "mouse drag undo restores"` -> 5 passed.
- `cd /Users/zbeyens/git/plate-2/.tmp/plite && bun --filter plite-browser typecheck`
- `cd /Users/zbeyens/git/plate-2/.tmp/plite && bun --filter plite-browser test:core` -> 44 passed.
- `cd /Users/zbeyens/git/plate-2/.tmp/plite && bun check` -> passed; lint emitted one existing pagination hook warning, 0 errors.

Final handoff contract:
- PR line: N/A; no PR work for `resolve-slate-issue`.
- Issue / tracker line: udecode/slate#12 comment posted https://github.com/udecode/slate/issues/12#issuecomment-4615379686; issue closed.
- Confidence line: 🟢 95-100% confidence.
- Flow table:
  - Reproduced: issue screenshots/comments show the historical bug; current v2 did not reproduce it with real drag proof.
  - Verified: 5 focused Chromium rows green across Plain Text, Inlines, Styling, and Code Highlighting.
- Browser check: Open `/examples/plaintext`, drag-select `plain `, type `simple`, press platform Undo, confirm original full text; extra issue-named routes checked with same shape.
- Outcome: current v2 restores the original selected text; proof gap is repaired.
- Caveat: no runtime patch was needed; this is an already-accounted closure with stronger browser proof.
- Design:
  - Chosen boundary: `plite-browser/playwright` drag-range helper plus route integration rows.
  - Why not quick patch: `N/A; already green in current v2`.
  - Why not broader change: no runtime behavior change was needed after current route proof.
- Verified: focused Chromium rows, `plite-browser` build/typecheck/core tests, `bun check`.
- PR body verified: N/A; no PR.

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
- Issue / tracker: https://github.com/udecode/slate/issues/12#issuecomment-4615379686; issue closed.
- Browser proof: 5 focused Chromium real mouse-drag rows passed.
- Caveats: one existing pagination lint warning appeared in `bun check`; 0 errors and unrelated to this issue.

Timeline:
- 2026-06-03T17:58:32.420Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | Resolve issue #12 from current Plite truth, comment verified outcome, and close only at 95-100% confidence. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- None.
