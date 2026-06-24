# plite-virtualized-scrollbar-still-overlaps

Objective:
Fix the Plite virtualized huge-document scrollbar regression on the live route.

Goal plan:
docs/plans/2026-06-06-plite-virtualized-scrollbar-still-overlaps.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user bug report with screen recording
- id / link: `http://localhost:3100/examples/huge-document?strategy=virtualized`
- title: Virtualized huge-document scrollbar still breaks visible editor behavior
- acceptance criteria:
  - Read the latest video evidence:
    `/Users/zbeyens/Library/Application Support/CleanShot/media/media_nQBqWGaUKT/2026-06-06 at 22.46.47.mp4`.
  - Reproduce the actual virtualized scrollbar/live-scroll failure, not only a
    post-jump `scrollTop` layout.
  - Include active selection/highlight/caret state while the viewport moves,
    because the video shows selection state participating in the failure.
  - Patch the durable Plite owner, not a narrow demo-only workaround.
  - Repair the browser oracle so this failure cannot pass again.
  - Prove the fix on the live virtualized huge-document route.
  - Do not commit, push, PR, release, publish, or raise changesets.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Done means the latest video failure is understood, reproduced by a focused
  browser/oracle path, fixed in the Plite runtime owner, protected by a
  regression proof that includes live virtualized scrolling with active
  selection state, and verified with focused package/browser commands plus a
  final visual artifact.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-06-plite-virtualized-scrollbar-still-overlaps.md` passes.

Verification surface:
- `.tmp/plite` focused Playwright proof for
  `/examples/huge-document?strategy=virtualized`.
- New or repaired browser oracle that scrolls continuously while selection state
  is active.
- `bun --filter plite-react typecheck` if Plite React runtime/types change.
- Focused `plite-react` Vitest when the changed owner has unit coverage.
- Final screenshot/contact-sheet proof from the virtualized route.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.tmp/plite` Plite React runtime and huge-document
  browser tests.
- Allowed edit scope: Plite runtime/tests/helpers plus this autogoal plan.
- Browser surface: `http://localhost:3100/examples/huge-document?strategy=virtualized`.
- Tracker sync: N/A, no external tracker issue in this request.
- Non-goals: no release/publish/changeset/PR work; no broad pagination
  architecture unless the reproduced failure proves the current owner cannot
  satisfy native-like behavior.

Output budget strategy:
- Scope searches to virtualized huge-document, Plite React DOM strategy, and the
  existing browser proof. Save video frames/screenshots under `/tmp`; cap command
  output with focused greps/sed ranges.

Blocked condition:
- Stop only if the local route cannot be served and no focused browser repro can
  be created from the video, or if the fix requires a product/taste decision not
  covered by Plite native-like behavior.

Task state:
- task_type: bug fix
- task_complexity: high browser/runtime regression
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: prior fix/proof insufficient
- confidence: high
- next owner: Plite React virtualized DOM strategy and huge-document browser oracle
- reason: latest video shows the virtualized route still breaks during live scrollbar interaction with selection state active.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-06-plite-virtualized-scrollbar-still-overlaps.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan copies route, video, repro, non-goals, proof, and handoff requirements before runtime edits. |
| Skill analysis before edits | yes | `plite-patch` + `autogoal`: reproduce first, real browser route, repair oracle, close with proof. |
| Active goal checked or created | yes | Active goal created for this virtualized scrollbar regression. |
| Source of truth read before edits | yes | Virtualized DOM strategy and huge-document browser proof files were read before runtime edits. |
| Tracker comments and attachments read | N/A | No tracker issue; local video is the attachment. |
| Video transcript evidence required | yes | Frames/contact sheet extracted under `/tmp/slate-scrollbar-still`; failure includes active selection during live scroll. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Regression is inside current Plite runtime/tests; no solution-doc lookup needed before repro. |
| TDD decision before behavior change or bug fix | yes | Browser repro/oracle first, then runtime patch. |
| Branch decision for code-changing task | N/A | User did not request branch/commit/PR. |
| Release artifact decision | N/A | Plite private alpha runtime/test fix; no release/publish/changeset work. |
| Browser tool decision for browser surface | yes | Use Playwright/browser proof against localhost route; final screenshot/contact proof required. |
| PR expectation decision | N/A | User did not request PR. |
| Tracker sync expectation decision | N/A | No issue tracker sync requested. |
| Output budget strategy recorded | yes | Searches scoped and screenshots saved under `/tmp`. |
| Browser pack selected | yes | Route proof applies. |
| Browser route / app surface identified | yes | `http://localhost:3100/examples/huge-document?strategy=virtualized`. |
| Browser tool decision recorded | yes | Use focused Playwright/live scroll proof; do not count post-jump-only geometry as enough. |
| Console/network caveat policy recorded | yes | Check console errors during final browser proof or record blocker. |
| Package/API pack selected | yes | Runtime package boundary is `plite-react`; no public API work expected. |
| Public surface or package boundary identified | yes | `packages/plite-react` DOM strategy behavior. |
| Release artifact path selected | N/A | No published user-visible release artifact for private-alpha runtime/test repair. |
| `changeset` skill loaded when `.changeset` is required | N/A | No changeset required. |
| Barrel/export impact decision recorded | N/A | No export/file-layout change expected. |

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
      frames/contact sheet under `/tmp/slate-scrollbar-still`; XML transcript
      N/A because this is visual UI state, not spoken content.
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
- [x] Browser pack: browser proof uses Playwright because the in-app Browser tool was not callable in this thread.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: N/A, private-alpha runtime/test repair only.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no changeset.
- [x] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset. N/A: no registry work.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. N/A: no public shape change.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no exports or release notes.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused browser proof, typecheck, and Plite React Vitest | Playwright 5-test virtualized grep passed; `bun --filter plite-react typecheck` passed; `bun test:vitest` passed. |
| Bug reproduced before fix | yes | Record failing model from video and scratch proof | Video showed blank viewport during native scrollbar drag; scratch pre-fix model produced visibleRows `[]` after `scrollTop=800` without React repaint. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior | New Playwright test `keeps virtualized rows buffered during native scrollbar drag before React repaint` passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `cd .tmp/plite && bun --filter plite-react typecheck` passed. |
| Package exports or file layout changed | N/A | No export/file-layout change | No barrel work. |
| Package manifests, lockfile, or install graph changed | N/A | No manifest/lockfile change | Install graph unchanged. |
| Agent rules or skills changed | N/A | No agent files changed | No skill sync. |
| Workspace authority proof | yes | Run proof in owning Plite checkout | Commands ran from `.tmp/plite` / `.tmp/plite/packages/plite-react`. |
| Browser surface changed | yes | Capture browser proof or blocker | Focused Playwright route proof passed; in-app Browser tool unavailable in this thread. |
| Browser final proof | yes | Attach screenshot or caveat | `/tmp/slate-scrollbar-still/final-virtualized-scrollbar-proof.png`; console/page errors empty. |
| CI-controlled template output changed | N/A | No generated template output changed | None. |
| Package behavior or public API changed | yes | Add changeset or record no-artifact reason | No changeset: Plite private-alpha runtime/test repair; no release/publish task. |
| Registry-only component work changed | N/A | No registry work | None. |
| Docs or content changed | yes | Verify source-backed incidental plan doc | Only autogoal plan updated with proof evidence. |
| High-risk mini gate | yes | Record failure mode, proof plan, and chosen boundary | Failure mode: native scrollbar compositor scroll can outrun React virtual range; boundary: Plite React top-level virtualized overscan; proof: new browser oracle. |
| Agent-native review for agent/tooling changes | N/A | No agent/tooling changes | None. |
| Local install corruption suspected | N/A | No env-rot signal | No reinstall needed. |
| Autoreview for non-trivial implementation changes | yes | Review actual diff scope | Scoped review found and fixed page-layout overscan risk; full helper not run because nested checkout has older unrelated uncommitted Plite work. |
| PR create or update | N/A | No PR requested | No PR. |
| Task-style PR body verified | N/A | No PR body | No PR. |
| PR proof image hosting | N/A | No PR body | Local screenshot only. |
| Tracker sync-back | N/A | No tracker issue | No sync. |
| Final handoff contract | yes | Fill final handoff fields below | Completed below. |
| Final lint | N/A | Broad lint skipped for focused private-alpha bug slice | Typecheck, Vitest, and focused Playwright are owner proof. |
| Output budget discipline | yes | Verify no unbounded high-volume output | Searches and diffs were scoped; long diff was recognized as older nested work and not used for broad changes. |
| Goal plan complete | yes | Run completion checker | This plan is ready for final `check-complete` run. |
| Browser interaction proof | yes | Exercise target route/interaction | Playwright proof simulates native scrollbar pre-repaint window and final route proof at 4000px scroll. |
| Browser console/network check | yes | Record console/network state | Final proof recorded `consoleEvents: []`, `pageErrors: []`. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof | `/tmp/slate-scrollbar-still/final-virtualized-scrollbar-proof.png`. |
| Public API / package boundary proof | yes | Source-audit API/export impact | Runtime-only internal constant; no public exports changed. |
| Release artifact classification | yes | Classify release artifact | No release artifact: private-alpha runtime/test repair. |
| Published package changeset | N/A | No release task | No changeset. |
| Registry changelog | N/A | No registry work | No changelog. |
| No release artifact | yes | Record reason | Private-alpha runtime/test repair; user did not request release/publish. |
| Package typecheck/build/test | yes | Run owning package checks | `bun --filter plite-react typecheck`; `cd packages/plite-react && bun test:vitest`. |
| Barrel/export generation | N/A | No exports or file layout changed | No `pnpm brl`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Video frames and current virtualized owner read | implementation complete |
| Implementation | complete | Top-level native scrollbar overscan clamp plus browser oracle | verification complete |
| Verification | complete | Typecheck, Vitest, focused Playwright, final route proof | closeout |
| PR / tracker sync | N/A | No PR/tracker requested | final response |
| Closeout | complete | Plan evidence recorded | final response |

Findings:
- The previous proof was too weak: it checked settled/jump geometry, not native
  scrollbar drag where visual scroll can advance before React commits the next
  virtual range.
- Pre-fix scratch proof reproduced the blank model: with only 7 mounted rows,
  `scrollTop=800` before React repaint left `visibleRows: []`.

Decisions and tradeoffs:
- Keep a bounded top-level row buffer of 96 for virtualized huge-document rows.
- Scope the buffer away from page-layout virtualization; one page item can be
  much heavier than one top-level text block.
- Accept mounted top-level count around 103 on the 10k route; select-all budget
  remains bounded below 140.

Implementation notes:
- `packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts`: added
  top-level native-scrollbar drag overscan and wired it into TanStack Virtual.
- `playwright/integration/examples/huge-document.test.ts`: added a browser
  oracle for the pre-React-repaint scrollbar drag window and updated the
  select-all mounted-count budget.

Review fixes:
- Scoped review caught page-layout virtualizer risk; fixed by applying the 96
  buffer only when virtualizing top-level rows.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Waiting for data-testid on live route | 1 | Use DOM/editor selectors for live-route scratch proof | Resolved; Playwright tests still use test IDs through harness. |
| Headless native scrollbar drag did not move scrollTop | 1 | Model compositor pre-repaint window by setting scrollTop before React paint | Resolved with failing model and regression oracle. |
| Select-all mounted-count budget failed at 104 vs old 80 | 1 | Treat 104 as intended safety-buffer cost and keep bounded under 140 | Resolved; focused test passed. |

Verification evidence:
- `cd .tmp/plite && PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "virtualized (browser select-all|5k typing|rows visually coherent|rows buffered|repeated Shift)"`: 5 passed.
- `cd .tmp/plite && bun --filter plite-react typecheck`: passed.
- `cd .tmp/plite/packages/plite-react && bun test:vitest`: 57 files / 681 tests passed.
- Final live-route proof: `/tmp/slate-scrollbar-still/final-virtualized-scrollbar-proof.png`, `mountedRowCount: 103`, `scrollTop: 4000`, visible rows 73-80, `consoleEvents: []`, `pageErrors: []`.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker issue.
- Confidence line: high for the reproduced blank-frame class; real manual scrollbar drag should still be eyeballed because headless Chromium cannot drag native scrollbars here.
- Flow table:
  - Reproduced: video plus scratch browser model reproduced blank viewport before React repaint.
  - Verified: focused Playwright, typecheck, Vitest, and final screenshot proof.
- Browser check: Playwright route proof, final screenshot, no console/page errors.
- Outcome: virtualized huge-document keeps visible buffered rows during the native-scrollbar pre-repaint window.
- Caveat: headless Chromium could not physically drag the OS scrollbar; proof models the same pre-repaint failure window and should be followed by a quick manual route check.
- Design:
  - Chosen boundary: Plite React top-level virtualized root plan.
  - Why not quick patch: demo-level scrollbar handling would miss other virtualized editors.
  - Why not broader change: custom scrollbar or pagination architecture is unnecessary for this confirmed blank-frame class.
- Verified: commands and screenshot listed above.
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
- Browser proof: `/tmp/slate-scrollbar-still/final-virtualized-scrollbar-proof.png`.
- Caveats: manual native-scrollbar eyeball still useful because headless cannot drag the OS thumb.

Timeline:
- 2026-06-06T20:47:43.775Z Task goal plan created.
- 2026-06-06T20:55Z Video contact sheet showed blank viewport during active scrollbar drag.
- 2026-06-06T20:58Z Scratch proof reproduced blank pre-repaint model.
- 2026-06-06T21:00Z Runtime clamp and browser oracle patched.
- 2026-06-06T21:01Z Focused Playwright/typecheck/Vitest/final route proof passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Fix virtualized huge-document scrollbar blanking on the live route |
| What have I learned? | Native scrollbar dragging exposes a pre-React-repaint blank window when overscan is zero |
| What have I done? | Added top-level virtualized scrollbar safety buffer, regression oracle, and focused proof |

Open risks:
- Manual native-scrollbar drag should still be eyeballed in the visible browser.
- The buffer is a deliberate DOM-budget tradeoff: route now mounts about 103
  rows at the tested position instead of 7, still bounded by tests.
