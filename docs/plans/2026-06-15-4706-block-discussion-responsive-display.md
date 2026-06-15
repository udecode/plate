# 4706 block discussion responsive display

Objective:
Fix #4706 block discussion responsive display; done when source issue/video is covered, responsive behavior is fixed or ruled out, verification and PR/tracker sync are complete.

Goal plan:
docs/plans/2026-06-15-4706-block-discussion-responsive-display.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: GitHub issue
- id / link: #4706 https://github.com/udecode/plate/issues/4706
- title: `block-discussion  Cannot display properly when the width is less than 935px`
- acceptance criteria: On the `suggestion-toolbar-button` / Plate Plus discussion example, block discussion cards that are visible on wide layouts must remain reachable/visible when the viewport narrows around 935px, without requiring text edits to force a rerender.

Completion threshold:
- The issue video and screenshots are normalized into tracker evidence, local reproduction identifies whether the failure is Plate-owned or a browser/layout limitation, the highest-leverage fix lands in the owning UI/registry boundary if Plate-owned, responsive browser proof covers wide and ~935px/narrow widths, registry release-artifact needs are closed, PR exists when code changes, #4706 is synced, and final goal checker passes.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-4706-block-discussion-responsive-display.md` passes.

Verification surface:
- Source issue readback with comments, screenshots, and normalized video transcript.
- Focused component/unit tests if an existing spec surface exists; otherwise browser responsive proof is the primary behavior proof.
- `pnpm turbo typecheck --filter=./apps/www`, `pnpm lint:fix`, and registry changelog/generation checks if registry files change.
- Approved Browser proof for the affected route at wide and ~935px/narrow widths, with console/network caveats recorded.
- Autoreview, PR body readback, issue sync-back, and goal plan checker.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: GitHub issue #4706 body, screenshots, comments, and video transcript cache comment.
- Allowed edit scope: likely `apps/www/src/registry/ui/block-discussion.tsx`, closely related registry UI/test/changelog files, and this goal plan. Package code only if source evidence proves the issue is not UI-owned.
- Browser surface: `https://platejs.org/docs/components/suggestion-toolbar-button` equivalent local docs/example route or closest local registry demo containing `discussion-kit` / `block-discussion`.
- Tracker sync: video transcript cache already posted; after verified code, create PR before final issue comment.
- Non-goals: Do not redesign discussion data ownership, suggestion semantics, or the docs page layout beyond what is needed to keep block discussions visible/reachable responsively.

Output budget strategy:
- Initial broad `rg` over `apps/www/src packages docs/solutions` streamed too much output. Recovery: use focused `sed` on `block-discussion` files, targeted `rg --files`, capped browser logs, and screenshots/artifacts instead of broad dumps.

Blocked condition:
- Stop only if the approved Browser/dev server cannot reach any local equivalent of the affected discussion surface after a real attempt, or if evidence proves the behavior is an intentional docs/page responsive collapse rather than a Plate component bug.

Task state:
- task_type: bug
- task_complexity: non-trivial
- current_phase: PR / tracker sync
- current_phase_status: in_progress
- next_phase: closeout
- goal_status: active

Current verdict:
- verdict: fixed in local docs-preview wrapper
- confidence: high
- next owner: PR / tracker sync
- reason: The public issue route embeds `discussion-pro`; at browser width 935px the local docs iframe measured 873px wide, while the Pro discussion rail appears only when the iframe viewport is at least 900px. `discussion-pro` now declares a 900px iframe minimum, and `BlockViewer` exposes horizontal scroll when the preview panel is narrower.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-4706-block-discussion-responsive-display.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `task`; loaded `video-transcripts`, `autogoal`, `plate-ui`, and `shadcn` as supporting guards. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this #4706 objective. |
| Source of truth read before edits | yes | `gh issue view 4706 --repo udecode/plate --json ...` read body, labels, comments, screenshots, and video URL. |
| Tracker comments and attachments read | yes | Comments read; screenshots downloaded to `/tmp/plate-4706-wide.png` and `/tmp/plate-4706-narrow.png`; video transcript generated. |
| Video transcript evidence required | yes | Required and satisfied with normalized XML from `generate_video_transcript.sh`; tracker cache posted at https://github.com/udecode/plate/issues/4706#issuecomment-4705540660. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read prior block-discussion stale path and shared-index solution notes; registry helper note says registry UI helper changes must update registry metadata/changelog. |
| TDD decision before behavior change or bug fix | yes | Use focused component test only if a current responsive/block-discussion spec surface exists; current `block-discussion.spec.tsx` referenced by old note is absent, so browser responsive proof may be primary. |
| Branch decision for code-changing task | yes | Created `codex/4706-block-discussion-responsive` from `origin/main` before code edits. |
| Release artifact decision | yes | If `apps/www/src/registry/**` changes, use registry changelog path; no package changeset unless published package code changes. |
| Browser tool decision for browser surface | yes | Use approved Browser tool for local responsive route proof; do not substitute standalone Playwright. |
| PR expectation decision | yes | Code-changing task should create PR after `check`. |
| Tracker sync expectation decision | yes | Transcript cache posted; final #4706 sync after PR or blocker. |
| Output budget strategy recorded | yes | Recorded above; broad output accident noted and recovery scoped. |
| Browser pack selected | yes | Applied `browser` pack. |
| Browser route / app surface identified | yes | Affected public route is `/docs/components/suggestion-toolbar-button`; local equivalent or closest `discussion-demo`/component docs route will be used. |
| Browser tool decision recorded | yes | Approved Browser first; live platejs.org can inform reproduction, local route owns fix proof. |
| Console/network caveat policy recorded | yes | Browser console/network proof will be recorded or explicitly caveated. |
| Package/API pack selected | yes | Applied `package-api` pack for registry release artifact gates. |
| Public surface or package boundary identified | yes | Public registry UI item `block-discussion`; no package export shape expected. |
| Release artifact path selected | yes | Registry changelog if registry UI changes; no `.changeset` for registry-only diff. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: not expected unless package code changes. |
| Barrel/export impact decision recorded | yes | No package exports/file-layout changes expected; `pnpm brl` N/A unless package exports change. |

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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Browser proof, `pnpm turbo typecheck --filter=./apps/www`, `pnpm lint:fix`, autoreview, and `pnpm check` passed. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Reproduced by measuring local docs at 935px: embedded `discussion` iframe width was 873px; direct Pro iframe hides cards below 900px. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Browser proof: local `/docs/components/suggestion-toolbar-button` at 935px gives iframe `minWidth=900px`, wrapper `clientWidth=873`, `scrollWidth=900`, cards visible in screenshot. At 700px wrapper scroll reaches cards. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./apps/www` passed after final patch. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest, lockfile, or install graph changes. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rules or skills changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Proof ran in `/Users/zbeyens/git/plate` against local `apps/www` dev route. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Browser proof captured via in-app Browser/node bridge on local route. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Screenshots saved: `/tmp/plate-4706-local-935-after-scroll-fix.jpg`, `/tmp/plate-4706-local-700-scrolled-after-scroll-fix.jpg`. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: docs-preview infrastructure only; no published package behavior/API delta. |
| Registry-only component work changed | no | Update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, or record N/A | N/A: changed `apps/www/src/components`, not `apps/www/src/registry/**`. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Incidental docs-preview infra only; rendered local route verified. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: oversized iframe could clip cards. Accepted autoreview finding fixed by scrollable wrapper; Browser proof covers 935px visible and 700px reachable. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no local env rot signal. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | First run found clipped min-width bug; fixed. Final `.agents/skills/autoreview/scripts/autoreview --mode local` passed clean. |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | `pnpm check` passed; PR pending. |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A likely: PR body can cite route/DOM proof without images; pending final body. |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed, no fixes applied. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Accidental broad `rg` and raw screenshot-byte outputs are recorded below; recovered with focused searches and saved screenshot files. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-4706-block-discussion-responsive-display.md` | pending |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | Local docs route verified at 935px and 700px with in-app Browser/node bridge. |
| Browser console/network check | caveat | Record console/network state or why it is not applicable | Browser wrapper did not expose event listeners (`tab.playwright.on is not a function`); DOM and screenshot proof recorded instead. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | `/tmp/plate-4706-local-935-after-scroll-fix.jpg` and `/tmp/plate-4706-local-700-scrolled-after-scroll-fix.jpg`. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Only internal `apps/www` docs-preview metadata was extended; no package exports changed. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Docs-preview site behavior only; no package/registry release artifact. |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | N/A: no published package delta. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, and do not add a package changeset | N/A: no registry files changed. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Internal docs-preview behavior only, no published package or registry artifact. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm turbo typecheck --filter=./apps/www` and `pnpm check` passed. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exports or barrels touched. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read #4706 source, comments, screenshots, video transcript, prior block-discussion notes, and current component. | implementation |
| Implementation | complete | `discussion-pro` declares a 900px iframe minimum; `BlockViewer` wraps fallback iframes in a scrollable container when a minimum width is present. | verification |
| Verification | complete | Browser proof, app typecheck, lint, autoreview, and `pnpm check` passed. | PR / tracker sync |
| PR / tracker sync | pending | `pnpm check` passed before PR. | final response |
| Closeout | pending | | final response |

Findings:
- Issue #4706 reports `block-discussion` cards disappear or render incorrectly when width drops below about 935px on the Plate Plus `suggestion-toolbar-button` example.
- Normalized video transcript:
  - [00:00] The browser displays the "Suggestion Toolbar Button" documentation page.
  - [00:01] The "Discussions" section is visible on the right side.
  - [00:02] The user narrows the browser window.
  - [00:03] The "Discussions" section remains visible while narrowing.
  - [00:04] Width reaches about 935px.
  - [00:05] The "Discussions" section disappears as the window narrows further.
- Wide screenshot shows discussion/suggestion cards visible in a right-side rail beside the editor content.
- Narrow screenshot shows inline suggestion marks still visible but no discussion/suggestion cards in the rail.
- Current `BlockDiscussion` renders `children` in `w-full`, then a zero-size `relative left-0 size-0` trigger beside it. That shape can lose the discussion trigger/rail when the editor consumes available width.
- Prior solution notes warn that `BlockDiscussion` should keep path ownership inside the rerendering component and that registry UI helper changes must be reflected in registry artifacts.
- The old `apps/www/src/registry/ui/block-discussion.spec.tsx` referenced by solution notes is not present in the current checkout.
- OSS `discussion-demo` did not reproduce: at local `/blocks/discussion-demo`, the popover remained visible at 935px.
- Direct `https://pro.platejs.org/iframe/discussion` shows discussion cards at iframe widths 900px and 935px, but hides them at 873px and below.
- Local `/docs/components/suggestion-toolbar-button` at browser width 935px embeds the Pro iframe at 873px before the fix, which explains why the reporter saw the cards disappear around that viewport.
- After the fix, local `/docs/components/suggestion-toolbar-button` at browser width 935px embeds `discussion` with CSS width/min-width 900px inside a wrapper with `clientWidth=873`, `scrollWidth=900`, and `overflow-x: auto`; cards are visible in the screenshot.

Decisions and tradeoffs:
- Treat this as docs-preview infrastructure, not `BlockDiscussion` component logic: the local OSS component works, and the failure is the embedded Pro demo receiving an iframe viewport below its own desktop rail breakpoint.
- Use a per-Pro-preview iframe minimum rather than changing all `BlockViewer` iframes or hardcoding a global desktop width.
- Preserve reachability below 900px by putting the oversized iframe inside a horizontal scroll wrapper; a min-width inside the existing `overflow-hidden` panel is insufficient.
- No package changeset or registry changelog: this changes `apps/www/src/components/**` docs preview behavior only, with no published package or registry file delta.

Implementation notes:
- Ownership boundary: `apps/www/src/components/component-preview-pro.tsx` and `apps/www/src/components/block-viewer.tsx`.
- `ComponentPreviewPro` now gives `discussion` a 900px minimum iframe viewport by default, with an `iframeMinWidth` prop escape hatch for future Pro examples.
- `BlockViewer` applies `iframeMinWidth` to fallback iframe previews and wraps them in `overflow-x-auto overflow-y-hidden` so the content is reachable when the docs preview panel is narrower than the requested iframe viewport.
- High-risk note: the first implementation applied `minWidth` directly inside the existing hidden-overflow panel, which could crop the iframe below 900px. Autoreview caught this; the accepted fix is the scrollable wrapper plus 935px and 700px Browser proof.

Review fixes:
- Accepted autoreview finding: iframe min-width was clipped by hidden overflow. Fixed with a scrollable wrapper. Final autoreview passed clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad source `rg` streamed too much output | 1 | Use focused `sed`/`rg --files` and browser artifacts | Recovered; useful files identified and broad output noted. |
| Second broad source search and raw screenshot-byte output streamed too much output | 2 | Use focused commands and write screenshots to `/tmp` instead of printing binary | Recovered; screenshots saved as files and inspected visually. |
| Direct `pnpm --dir apps/www exec tsc --noEmit --pretty false --incremental false` failed on generated docs source | 1 | Use repo-required `pnpm turbo typecheck --filter=./apps/www` | Correct command passed; direct `tsc` was the wrong lane. |

Verification evidence:
- Browser source proof:
  - Before fix, local docs route at 935px had embedded iframe width 873px.
  - Direct Pro iframe hid cards at 873px and showed them at 900px/935px.
  - After fix, local docs route at 935px: iframe width/min-width 900px, wrapper client width 873px, scroll width 900px, cards visible.
  - After fix, local docs route at 700px with wrapper scrolled: wrapper client width 650px, scroll width 900px, scrollLeft 250, cards reachable.
  - Screenshots: `/tmp/plate-4706-local-935-after-scroll-fix.jpg`, `/tmp/plate-4706-local-700-scrolled-after-scroll-fix.jpg`.
- Browser caveat: console/request listeners were unavailable in this Browser bridge (`tab.playwright.on is not a function`); DOM and visual proof were captured instead.
- `pnpm lint:fix` passed, no fixes applied.
- `pnpm turbo typecheck --filter=./apps/www` passed after final patch.
- `.agents/skills/autoreview/scripts/autoreview --mode local` final run passed clean after fixing the accepted clipping finding.
- `pnpm check` passed. Caveats in green run: pre-existing `apps/www/src/components/ui/sidebar.tsx` hook warning; test output printed the existing "Detected multiple @platejs/core instances!" warning, with all tests passing.

Final handoff contract:
- PR line: pending
- Issue / tracker line: pending
- Confidence line: pending
- Flow table:
  - Reproduced: tests pending, browser pending
  - Verified: tests pending, browser pending
- Browser check: pending
- Outcome: pending
- Caveat: pending
- Design:
  - Chosen boundary: pending
  - Why not quick patch: pending
  - Why not broader change: pending
- Verified: pending
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
- 2026-06-15T07:21:47.391Z Task goal plan created.

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
