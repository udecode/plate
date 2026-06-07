# slate-v2-staged-editable-scrollbar

Objective:
Fix staged huge-document so the editable itself owns a visible scrollbar.

Goal plan:
docs/plans/2026-06-06-slate-v2-staged-editable-scrollbar.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user bug report
- id / link: `http://localhost:3100/examples/huge-document?strategy=staged`
- title: Staged huge-document does not show a scrollbar in the editable
- acceptance criteria:
  - Reproduce the exact staged huge-document route.
  - Confirm whether the editor root, an inner editable node, or the page owns
    overflow before patching.
  - Patch the durable Slate v2 owner; do not add demo-only CSS unless the
    example contract is the actual owner.
  - The editable should have bounded height, `scrollHeight > clientHeight`, and
    scrollable overflow on the staged route.
  - Add/repair browser proof so staged scrollbar ownership cannot regress.
  - Do not commit, push, PR, release, publish, or add changesets.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Done means the staged route reproduces before the fix, the scrollbar owner is
  corrected, focused browser proof confirms the editable is scrollable, and the
  owning Slate v2 package/browser checks pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-06-slate-v2-staged-editable-scrollbar.md` passes.

Verification surface:
- `.tmp/slate-v2` Playwright proof for
  `/examples/huge-document?strategy=staged`.
- Focused browser DOM proof: editable/client scroll metrics and screenshot.
- `bun --filter slate-react typecheck` if Slate React runtime changes.
- Focused Slate React/package tests when the changed owner has unit coverage.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.tmp/slate-v2` source and huge-document browser tests.
- Allowed edit scope: Slate v2 runtime/example/browser tests plus this plan.
- Browser surface: `http://localhost:3100/examples/huge-document?strategy=staged`.
- Tracker sync: N/A, no tracker issue.
- Non-goals: no virtualized scrollbar rework unless shared ownership is proven;
  no release/publish/changeset/PR.

Output budget strategy:
- Scope searches to huge-document, staged DOM strategy, root/editable overflow,
  and existing browser tests. Save screenshots under `/tmp`.

Blocked condition:
- Stop only if the route cannot be served locally and no browser DOM repro can
  be created, or if fixing scrollbar ownership requires a taste/product
  decision not covered by native-like editable behavior.

Task state:
- task_type: bug fix
- task_complexity: normal browser/runtime regression
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: fixed
- confidence: high
- next owner: final response
- reason: exact staged route now has editor-owned scroll metrics and focused tests pass.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-06-slate-v2-staged-editable-scrollbar.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact route, expected editable scrollbar, proof, and non-goals recorded. |
| Skill analysis before edits | yes | `slate-patch` and `autogoal`: reproduce first, add behavior proof, fix owner. |
| Active goal checked or created | yes | Active goal created for staged editable scrollbar. |
| Source of truth read before edits | yes | Read `site/examples/ts/huge-document.tsx` and `playwright/integration/examples/huge-document.test.ts` before edits. |
| Tracker comments and attachments read | N/A | No tracker or attachment. |
| Video transcript evidence required | N/A | No video in this request. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Current route/runtime regression; source read first. |
| TDD decision before behavior change or bug fix | yes | Browser repro/proof before runtime patch. |
| Branch decision for code-changing task | N/A | No branch/commit/PR requested. |
| Release artifact decision | N/A | Slate v2 private-alpha runtime/test repair; no release/publish. |
| Browser tool decision for browser surface | yes | Use Playwright if in-app Browser remains unavailable. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker sync. |
| Output budget strategy recorded | yes | Searches scoped; screenshots saved under `/tmp`. |
| Browser pack selected | yes | Route proof applies. |
| Browser route / app surface identified | yes | `http://localhost:3100/examples/huge-document?strategy=staged`. |
| Browser tool decision recorded | yes | Playwright route proof; final screenshot/metrics required. |
| Console/network caveat policy recorded | yes | Check console/page errors in final browser proof. |
| Package/API pack selected | yes | Runtime package boundary may be touched. |
| Public surface or package boundary identified | yes | Likely `slate-react` DOM strategy or huge-document example. |
| Release artifact path selected | N/A | No published release artifact for private-alpha bug repair. |
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
- [x] Browser pack: browser proof uses Playwright because the in-app Browser tool was not callable in this thread.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: N/A, private-alpha example/test repair only.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no changeset.
- [x] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset. N/A: no registry work.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. N/A: no public shape change.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no exports.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused browser proof, exact-route browser proof, and site typecheck | Focused staged controls test passed; staged editing test passed; exact route proof captured; `bun typecheck:site` passed. |
| Bug reproduced before fix | yes | Record failing browser metrics | Before patch: exact route editor `overflowY: visible`, `clientHeight: 1078`, `scrollHeight: 1078`; page owned scroll. |
| Targeted behavior verification | yes | Run focused proof for changed behavior | `exposes staged DOM strategy controls and metrics` now asserts editor height, `overflowY:auto`, stable gutter, and `scrollHeight > clientHeight`. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `cd .tmp/slate-v2 && bun typecheck:site` passed. |
| Package exports or file layout changed | N/A | No export/file-layout change | No barrel work. |
| Package manifests, lockfile, or install graph changed | N/A | No manifest/lockfile change | Install graph unchanged. |
| Agent rules or skills changed | N/A | No agent files changed | No skill sync. |
| Workspace authority proof | yes | Run verification in Slate v2 checkout | Commands ran from `.tmp/slate-v2`. |
| Browser surface changed | yes | Capture browser proof | Focused Playwright and exact-route metrics/screenshot captured. |
| Browser final proof | yes | Attach screenshot/caveat | `/tmp/slate-staged-scrollbar-after-gutter.png`; console/page errors empty. |
| CI-controlled template output changed | N/A | No generated template output changed | None. |
| Package behavior or public API changed | N/A | No package API change | Site example/test only. |
| Registry-only component work changed | N/A | No registry work | None. |
| Docs or content changed | yes | Verify incidental plan doc | This autogoal plan records source-backed proof. |
| High-risk mini gate | yes | Record failure mode and owner | Failure mode: staged example had no bounded editable scroller; owner: huge-document example style/control contract. |
| Agent-native review for agent/tooling changes | N/A | No agent/tooling changes | None. |
| Local install corruption suspected | N/A | No env-rot signal | No reinstall needed. |
| Autoreview for non-trivial implementation changes | yes | Review actual diff scope | Scoped review of staged-scrollbar hunks; full nested dirty review skipped because `.tmp/slate-v2` contains older unrelated uncommitted changes. |
| PR create or update | N/A | No PR requested | No PR. |
| Task-style PR body verified | N/A | No PR body | No PR. |
| PR proof image hosting | N/A | No PR body | Local screenshot only. |
| Tracker sync-back | N/A | No tracker issue | No sync. |
| Final handoff contract | yes | Fill final handoff fields below | Completed below. |
| Final lint | N/A | Scoped browser/typecheck proof enough for this example slice | No lint command run. |
| Output budget discipline | yes | Verify no unbounded output | Initial broad rg was noisy; recovered by narrowing to source files and scoped proof. |
| Goal plan complete | yes | Run completion checker | Ready for final `check-complete` run. |
| Browser interaction proof | yes | Exercise target route | Exact URL proof: editor scrollTop moved from 0 to 240 internally. |
| Browser console/network check | yes | Record console/page errors | `consoleEvents: []`, `pageErrors: []`. |
| Browser final proof artifact | yes | Record screenshot | `/tmp/slate-staged-scrollbar-after-gutter.png`. |
| Public API / package boundary proof | yes | Source-audit API/export impact | No exports or package public API changed. |
| Release artifact classification | yes | Classify release artifact | No release artifact: private-alpha example/test repair. |
| Published package changeset | N/A | No release task | No changeset. |
| Registry changelog | N/A | No registry work | No changelog. |
| No release artifact | yes | Record reason | Private-alpha example/test repair; user did not request release/publish. |
| Package typecheck/build/test | yes | Run owning checks | `bun typecheck:site`; focused Playwright tests. |
| Barrel/export generation | N/A | No exports or file layout changed | No `pnpm brl`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Exact route reproduced; source read | implementation complete |
| Implementation | complete | Staged uses bounded editable scroller and height control | verification complete |
| Verification | complete | Focused Playwright, exact route proof, site typecheck | closeout |
| PR / tracker sync | N/A | No PR/tracker requested | final response |
| Closeout | complete | Plan evidence recorded | final response |

Findings:
- Exact staged route had no editable scrollbar because bounded editor style was
  only applied to `virtualized`.
- Before patch, the editor had `overflowY: visible`, `clientHeight: 1078`, and
  `scrollHeight: 1078`; the page owned the scroll.

Decisions and tradeoffs:
- Apply bounded editor style to `staged` and `virtualized`, not `full` or
  `auto`, because the report is about staged and full should stay a full
  document surface.
- Keep virtualized-only estimated block size controls, but expose editor height
  for staged too.
- Add `scrollbarGutter: stable` so the editable reserves scrollbar space even
  when overlay scrollbars fade.

Implementation notes:
- `site/examples/ts/huge-document.tsx`: added `hasBoundedEditableScroller`,
  applied height/overflow/gutter to staged and virtualized, and exposed editor
  height for both modes.
- `playwright/integration/examples/huge-document.test.ts`: staged controls test
  now asserts editable scroll ownership.

Review fixes:
- Scoped review found no issue in the staged-scrollbar hunks.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial browser probe referenced outer variables inside page evaluate | 1 | Return console/page errors outside evaluate | Resolved with corrected probe. |
| Initial source search hit generated/minified output | 1 | Narrow to source files and sed ranges | Resolved. |

Verification evidence:
- `cd .tmp/slate-v2 && PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "exposes staged DOM strategy controls"`: 1 passed.
- `cd .tmp/slate-v2 && PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "keeps staged middle-block editing"`: 1 passed.
- `cd .tmp/slate-v2 && bun typecheck:site`: passed.
- Exact route proof: `clientHeight: 420`, `overflowY: auto`,
  `scrollbarGutter: stable`, `scrollHeight: 1078`, `scrollTopAfter: 240`,
  `consoleEvents: []`, `pageErrors: []`.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker issue.
- Confidence line: high; exact URL now has editor-owned scroll metrics and focused tests.
- Flow table:
  - Reproduced: exact-route browser metrics showed page-owned scroll.
  - Verified: exact-route browser metrics and focused Playwright tests.
- Browser check: `/tmp/slate-staged-scrollbar-after-gutter.png`, no console/page errors.
- Outcome: staged huge-document editable is bounded, scrollable, and exposes the editor-height control.
- Caveat: macOS overlay scrollbar thumbs can still fade visually; stable gutter reserves the scrollbar lane and the editor owns scrolling.
- Design:
  - Chosen boundary: huge-document example style/control contract.
  - Why not quick patch: styling only the URL would miss staged mode when selected from the UI.
  - Why not broader change: Slate React core already supports bounded scroll roots; this bug was the example not providing one.
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
- Browser proof: `/tmp/slate-staged-scrollbar-after-gutter.png`.
- Caveats: macOS overlay thumbs can fade, but the gutter is stable and editor scroll ownership is proven.

Timeline:
- 2026-06-06T21:32:24.088Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Fix staged huge-document so the editable itself owns a visible scrollbar |
| What have I learned? | The example only bounded virtualized, leaving staged to page scroll |
| What have I done? | Added staged bounded scroller, stable gutter, height control, and browser proof |

Open risks:
- macOS overlay scrollbar thumbs can fade; the stable gutter plus scroll metrics
  prove the editable owns scroll, but a visible-browser eyeball is still useful.
