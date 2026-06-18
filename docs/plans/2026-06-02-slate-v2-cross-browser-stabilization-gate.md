# Slate v2 cross-browser stabilization gate

Objective:
Commit Slate v2 contract fixes if needed, then run focused cross-browser stabilization gates for old failure examples.

Goal plan:
docs/plans/2026-06-02-slate-v2-cross-browser-stabilization-gate.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: chat request
- id / link: current Codex thread
- title: commit fixes and run old-failure cross-browser gate
- acceptance criteria: `Plate repo root` contract fixes committed or already committed, old failure cluster passes across Chromium/Firefox/WebKit/mobile, concrete regressions patched if found, and goal completion check passes.

Completion threshold:
- Confirm the three Slate v2 contract fixes are committed in `Plate repo root` or commit them.
- Run focused cross-browser Playwright gate for `dom-coverage-boundaries`, `query-controls`, `markdown-shortcuts`, `plaintext`, and `hidden-content-blocks`.
- If the gate finds a concrete regression, patch it and rerun the targeted failing proof.
- Record skipped rows as intentional project/browser skips, not failures.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-slate-v2-cross-browser-stabilization-gate.md` passes.

Verification surface:
- `Plate repo root` git state and `HEAD` commit contents.
- Focused cross-browser Playwright command for the old failure cluster.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-slate-v2-cross-browser-stabilization-gate.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `/Users/zbeyens/git/plate-2/Plate repo root` for Slate v2 tests and runtime examples.
- Allowed edit scope: focused Slate v2 test/runtime files only if a concrete gate failure appears.
- Browser surface: DOM coverage, query controls, markdown shortcuts, plaintext, and hidden-content examples.
- Tracker sync: N/A, no issue/Linear requested.
- Non-goals: no PR, push, review branches, or unrelated cleanup.

Output budget strategy:
- Use focused files and one cross-browser command with capped output. Do not stream full integration-local.

Blocked condition:
- Block only if the owning checkout cannot run Playwright after one retry, or if a failure requires a product/API decision outside the old-failure gate.

Task state:
- task_type: gate and commit verification
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-to-complete

Current verdict:
- verdict: complete
- confidence: high
- next owner: user
- reason: Existing commit contains the three contract fixes and the focused cross-browser gate passed with zero failures.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-slate-v2-cross-browser-stabilization-gate.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `autogoal`, `git-commit`, and Slate AR gate routing. |
| Active goal checked or created | yes | Created goal for commit plus cross-browser stabilization. |
| Source of truth read before edits | yes | Read `Plate repo root` git state, latest commit, target files, and gate command. |
| Tracker comments and attachments read | N/A | Chat request only. |
| Video transcript evidence required | N/A | No video supplied for this pass. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Gate-only run; no new implementation needed. |
| TDD decision before behavior change or bug fix | yes | Existing gates would be red proof; none failed. |
| Branch decision for code-changing task | yes | Stayed on `Plate repo root` branch `v2`; no branch creation. |
| Release artifact decision | N/A | No package release change. |
| Browser tool decision for browser surface | yes | Used Playwright browser gates. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker requested. |
| Output budget strategy recorded | yes | Focused file list and capped output. |
| Browser pack selected | yes | Browser pack applies through cross-browser Playwright. |
| Browser route / app surface identified | yes | DOM coverage, query controls, markdown shortcuts, plaintext, hidden-content examples. |
| Browser tool decision recorded | yes | Playwright is the proof surface. |
| Console/network caveat policy recorded | yes | No manual route proof; Playwright failures/traces would carry browser errors. |

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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused cross-browser proof | 142 passed, 22 skipped, 0 failed. |
| Bug reproduced before fix | N/A | No new failure appeared in this pass | Existing commit already contained prior fixes. |
| Targeted behavior verification | yes | Run focused test proof | Old failure cluster passed across Chromium/Firefox/WebKit/mobile. |
| TypeScript or typed config changed | N/A | No new code changes after existing commit | N/A. |
| Package exports or file layout changed | N/A | No package export or file layout change | N/A. |
| Package manifests, lockfile, or install graph changed | N/A | No manifest or install changes | N/A. |
| Agent rules or skills changed | N/A | No agent rules changed | N/A. |
| Workspace authority proof | yes | Run verification in owning checkout | Command ran in `/Users/zbeyens/git/plate-2/Plate repo root`. |
| Browser surface changed | yes | Browser examples proof | Playwright exercised the target examples. |
| Browser final proof | yes | Record command result | 142 passed, 22 skipped. |
| CI-controlled template output changed | N/A | No template output touched | N/A. |
| Package behavior or public API changed | N/A | No package behavior or public API change in this pass | N/A. |
| Registry-only component work changed | N/A | No registry work | N/A. |
| Docs or content changed | N/A | Goal ledger only | N/A. |
| High-risk mini gate | yes | Browser behavior gate | Cross-browser gate passed. |
| Agent-native review for agent/tooling changes | N/A | No agent/tooling files changed | N/A. |
| Local install corruption suspected | N/A | No env-rot signal | N/A. |
| Autoreview for non-trivial implementation changes | N/A | Existing commit already contained changes; user wanted gates next | N/A. |
| PR create or update | N/A | No PR requested | N/A. |
| Task-style PR body verified | N/A | No PR requested | N/A. |
| PR proof image hosting | N/A | No PR requested | N/A. |
| Tracker sync-back | N/A | No tracker requested | N/A. |
| Final handoff contract | yes | Fill final evidence | Done below. |
| Final lint | N/A | No new code changes in this pass after existing commit | Prior `bun check` already passed for committed contract fixes. |
| Output budget discipline | yes | Focused command, capped output | Done. |
| Goal plan complete | yes | Run completion checker | Run after this update. |
| Browser interaction proof | yes | Playwright target routes | 142 passed, 22 skipped. |
| Browser console/network check | N/A | No manual browser proof | Playwright would surface failures/traces. |
| Browser final proof artifact | yes | Command output recorded | No failure traces because gate passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read commit state and target gates | verification |
| Implementation | complete | Existing commit `faa3b003 fix` already contains the three fixes; no new patch needed | verification |
| Verification | complete | Cross-browser gate passed | closeout |
| PR / tracker sync | N/A | No PR or tracker requested | final response |
| Closeout | complete | Plan updated, checker run next | final response |

Findings:
- `Plate repo root` was clean at start of commit step; the expected fixes were already committed in `faa3b003 fix`.
- `faa3b003 fix` contains `playwright/stress/generated-editing.test.ts`, `scripts/benchmarks/browser/react/huge-document-overlays.tsx`, and `scripts/benchmarks/browser/react/pagination-virtualized-char-burst.mjs`.
- Focused old-failure cluster passed across Chromium, Firefox, WebKit, and mobile: 142 passed, 22 skipped, 0 failed.

Decisions and tradeoffs:
- Did not create an empty duplicate commit because `Plate repo root` had no diff and `HEAD` already contained the three fixes.
- Did not patch skipped tests; skips are intentional project/browser skips, not failures.

Implementation notes:
- No new implementation patch was needed in this pass.

Review fixes:
- N/A.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Expected dirty contract fixes were already committed | 1 | Inspect `HEAD` contents before committing | Confirmed `faa3b003 fix` contains the three files; skipped empty commit. |

Verification evidence:
- `Plate repo root git status --short --untracked-files=all`: clean.
- `Plate repo root git show --stat --oneline --decorate --name-only HEAD`: `faa3b003 (HEAD -> v2) fix`, containing the three contract files.
- Cross-browser gate command in `/Users/zbeyens/git/plate-2/Plate repo root`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright -- playwright/integration/examples/dom-coverage-boundaries.test.ts playwright/integration/examples/query-controls.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/hidden-content-blocks.test.ts --project=chromium --project=firefox --project=webkit --project=mobile`.
- Cross-browser gate result: 142 passed, 22 skipped, 0 failed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A, no new failures.
  - Verified: 142 passed, 22 skipped, 0 failed in focused cross-browser gate.
- Browser check: Playwright cross-browser proof.
- Outcome: old failure cluster is green across Chromium/Firefox/WebKit/mobile.
- Caveat: three fixes were already committed before this pass; no duplicate commit created.
- Design:
  - Chosen boundary: existing browser gate, no code patch.
  - Why not quick patch: no failure to patch.
  - Why not broader change: gate is green.
- Verified: cross-browser gate passed.
- PR body verified: N/A.

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
- Browser proof: 142 passed, 22 skipped.
- Caveats: no new commit created because the fixes were already in `faa3b003`.

Timeline:
- 2026-06-02T17:36:35.509Z Task goal plan created.
- 2026-06-02T19:36Z Goal created for commit plus cross-browser stabilization.
- 2026-06-02T19:37Z Confirmed `Plate repo root` was clean and `faa3b003 fix` already contains the three fixes.
- 2026-06-02T19:39Z Focused cross-browser old-failure gate passed with 142 passed, 22 skipped, 0 failed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Commit/finalize contract fixes and run focused old-failure cross-browser gate |
| What have I learned? | Fixes were already committed; cross-browser cluster is green |
| What have I done? | Verified commit state and ran the focused gate |

Open risks:
- None blocking.
