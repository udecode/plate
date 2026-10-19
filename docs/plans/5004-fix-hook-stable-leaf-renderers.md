# Fix hook-stable leaf renderers

Objective:
Fix #5004 hook-stable leaf/text renderers; done when regression tests, package checks, browser proof, review, and plan pass.

Goal plan:
docs/plans/5004-fix-hook-stable-leaf-renderers.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: GitHub issue
- id / link: #5004 https://github.com/udecode/plate/issues/5004
- title: [Bug]: Rules-of-Hooks violation in Leaf: pipeRenderLeaf conditionally invokes hook-calling leaf renderers when marks change
- acceptance criteria: no React hook-order warning when an existing leaf/text node gains or loses a complex mark; preserve existing simple inactive-renderer skip behavior.

Completion threshold:
- Add focused failing-then-passing coverage for complex leaf and text renderers rerendering from inactive to active marks.
- Patch `@platejs/core` render pipelines so complex renderers call hooks in stable order while simple renderers keep the inactive skip optimization.
- Add a patch changeset for `@platejs/core`.
- Run targeted test, package typecheck, lint fix, required browser proof or explicit blocker, autoreview, and final plan check.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5004-fix-hook-stable-leaf-renderers.md` passes.

Verification surface:
- `bun test packages/core/src/react/utils/pipeRenderLeaf.spec.tsx`
- `pnpm turbo typecheck --filter=./packages/core`
- `pnpm lint:fix`
- Browser proof for a package-facing route if a runnable route can be identified; otherwise record blocker/waiver.
- Autoreview on the local diff.
- Source audit that no package export/barrel change is needed.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve the April 2026 inactive simple-renderer performance optimization.

Boundaries:
- Source of truth: GitHub issue #5004 body and comments.
- Allowed edit scope: `packages/core/src/react/utils/pipeRenderLeaf.tsx`, `packages/core/src/react/utils/pipeRenderText.tsx`, focused tests, `.changeset`, and this plan.
- Browser surface: browser surfaced bug; package path may not have a stable standalone route. Use repo-approved browser tool if runnable route is practical.
- Tracker sync: code-changing task skill expects PR/tracker sync after verification unless blocked by repo policy/check failure.
- Non-goals: performance benchmarking, broad render-pipeline redesign, registry UI changes, docs rewrite.

Output budget strategy:
- Use `rg` with targeted terms and capped output. Read only direct source/test/solution files. Avoid broad package dumps and full repo checks until needed.

Blocked condition:
- Stop if focused tests cannot run after one local-env retry for install-shaped failures, if Browser proof has no runnable target, or if required PR/check gates fail outside this diff.

Task state:
- task_type: bug
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: implement
- confidence: high
- next owner: task
- reason: issue includes exact root cause; local source confirms complex renderers call hooks before mark checks.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5004-fix-hook-stable-leaf-renderers.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `task`, `autogoal`, `tdd`, and changeset rules. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created active goal for this plan. |
| Source of truth read before edits | yes | `gh issue view 5004 --comments --json ...` read issue and comment. |
| Tracker comments and attachments read | yes | One Dosu comment read; no attachments/video in issue payload. |
| Video transcript evidence required | no | N/A: no video or screen recording evidence. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read April 2026 inactive renderer fan-out solution. |
| TDD decision before behavior change or bug fix | yes | Add red tests for hook-stable complex leaf/text rerender. |
| Branch decision for code-changing task | yes | No branch command before edits; PR branch handled only if PR stage is reached. |
| Release artifact decision | yes | `.changeset` required: published `@platejs/core` runtime behavior changes. |
| Browser tool decision for browser surface | yes | Use repo-approved Browser if a runnable route is practical; otherwise record blocker. |
| PR expectation decision | yes | Task skill expects PR after verified code unless blocked; repo `check` gate applies first. |
| Tracker sync expectation decision | yes | Sync back after meaningful verified outcome/PR unless blocked. |
| Output budget strategy recorded | yes | Targeted `rg`/`sed`, capped outputs, no full repo dumps. |
| Browser pack selected | yes | Applied browser pack. |
| Browser route / app surface identified | yes | Browser route `/docs/examples/code-block` identified and verified. |
| Browser tool decision recorded | yes | Use Browser plugin, not raw Playwright/Puppeteer. |
| Console/network caveat policy recorded | yes | Browser proof should include console state; if no target, record explicit caveat. |
| Package/API pack selected | yes | Applied package-api pack. |
| Public surface or package boundary identified | yes | Published `@platejs/core` React render pipeline. |
| Release artifact path selected | yes | `.changeset` for `@platejs/core` patch. |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/rules/changeset.mdc`; core package patch only. |
| Barrel/export impact decision recorded | yes | No export/file layout change expected; `pnpm brl` N/A unless diff changes. |

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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `bun test packages/core/src/react/utils/pipeRenderLeaf.spec.tsx`, `pnpm turbo typecheck --filter=./packages/core`, Browser proof, autoreview, and `pnpm check` passed in `/Users/zbeyens/git/plate`. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | New leaf rerender spec failed before fix with React hook-order warning. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `bun test packages/core/src/react/utils/pipeRenderLeaf.spec.tsx` -> 16 pass, 0 fail. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/core` and `pnpm check` typecheck passed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest, lockfile, or dependency graph change. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rule or skill change. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Commands and Browser proof ran in `/Users/zbeyens/git/plate`; browser route owned by `apps/www`. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Browser opened `http://localhost:3000/docs/examples/code-block` and exercised code block language changes. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Route loaded as `code-block-demo - Plate`; JavaScript -> Plain Text -> JavaScript changed syntax count 48 -> 0 -> 48 with no warn/error logs. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` changes. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `.changeset/hook-stable-leaf-renderers.md` adds `@platejs/core` patch. |
| Registry-only component work changed | no | Update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, or record N/A | N/A: not registry-only work. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: runtime plan file only, no user docs/content. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: hook-calling renderers executed in Plite `Leaf`; proof: red/green test and browser language switch; boundary: core pipes own renderer invocation. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling files changed. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no verification failure; `pnpm check` passed. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | First local review found stale plan path; fixed. Second `.agents/skills/autoreview/scripts/autoreview --mode local` clean. |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | `pnpm check` passed; PR #5009 created: https://github.com/udecode/plate/pull/5009. |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | `gh pr view 5009 --repo udecode/plate --json url,body,headRefName,baseRefName,isDraft` verified auto-release block, issue line, confidence, table, and required sections. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: PR body will use textual browser proof, no local image. |
| Tracker sync-back | yes | Post concise issue/Linear sync after PR exists, or record N/A/blocker | Issue comment posted: https://github.com/udecode/plate/issues/5004#issuecomment-4699892610. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff fields below include PR, issue, confidence, tests, browser proof, caveat, design, and verification. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; `pnpm check` lint passed with one pre-existing warning. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One broad route search streamed large output; subsequent searches were scoped and capped. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5004-fix-hook-stable-leaf-renderers.md` | `[autogoal] complete: docs/plans/5004-fix-hook-stable-leaf-renderers.md`. |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | Browser route `/docs/examples/code-block`; first combobox JavaScript -> Plain Text -> JavaScript. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | `tab.dev.logs({ levels: ['error','warn'] })` returned `[]` after both language switches. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | Exact Browser proof recorded in `Verification evidence`; no screenshot needed. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | No `packages/core/src/react/utils/index.ts` or package export change; runtime behavior only. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published `@platejs/core` runtime behavior fix. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | `.changeset/hook-stable-leaf-renderers.md` uses `"@platejs/core": patch`. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, and do not add a package changeset | N/A: no registry files changed. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: changeset required and added. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Focused test, package typecheck, and full `pnpm check` passed. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exports or exported file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | GitHub issue #5004 and comment read; local source and solution note read. | implementation |
| Implementation | complete | Complex renderers mounted as child components in leaf/text pipes; changeset added. | verification |
| Verification | complete | Focused test, package typecheck, Browser proof, autoreview, and `pnpm check` passed. | PR / tracker sync |
| PR / tracker sync | complete | Branch `codex/fix-hook-stable-leaf-renderers` pushed; PR #5009 created; issue #5004 commented. | closeout |
| Closeout | complete | Goal plan final check ready after route and closeout markers were resolved. | final response |

Findings:
- Issue #5004 root cause confirmed locally: `pipeRenderLeaf` / `pipeRenderText` executed hook-calling plugin renderers as plain functions only when matching marks were active.
- Existing April 2026 solution note explains why inactive renderer skipping matters for performance; fix must preserve skipping instead of calling every complex renderer unconditionally.
- Browser route `/docs/examples/code-block` reproduces the practical surface with `plite-code_syntax` decorations.

Decisions and tradeoffs:
- Use React component boundaries for active complex renderers instead of invoking them as plain functions. This keeps hook order stable and preserves inactive-renderer skipping.
- Keep simple renderer path unchanged because it already has no hook-calling plugin renderer and carries the performance optimization.
- Add changeset for published `@platejs/core` runtime behavior; no barrel generation because exports did not change.

Implementation notes:
- `pipeRenderLeaf` wraps active complex render output as `<RenderLeaf {...props}>{props.children}</RenderLeaf>`.
- `pipeRenderText` mirrors the same pattern for active complex text renderers.
- Regression tests rerender inactive -> active complex leaf/text marks and assert no React hook-order console errors.

Review fixes:
- Accepted autoreview P3: stale plan check path still pointed at the original date-based plan filename. Fixed to `docs/plans/5004-fix-hook-stable-leaf-renderers.md`; clean rerun.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad route search streamed too much output | 1 | Use targeted Browser route and capped reads. | Recovered; evidence recorded and later searches capped. |
| Issue comment body used shell backticks inside a double-quoted shell argument | 1 | Interrupt accidental command substitution and repost with `--body-file -`. | Accidental command was interrupted before posting; issue comment reposted successfully with a single-quoted heredoc. |

Verification evidence:
- RED: `bun test packages/core/src/react/utils/pipeRenderLeaf.spec.tsx` failed before production fix on new complex leaf hook-order test with React "change in the order of Hooks" warning.
- GREEN: `bun test packages/core/src/react/utils/pipeRenderLeaf.spec.tsx` -> 16 pass, 0 fail, 34 expects.
- Package typecheck: `pnpm turbo typecheck --filter=./packages/core` -> 5 tasks successful.
- Lint fix: `pnpm lint:fix` -> checked 3272 files, no fixes applied.
- Browser: `pnpm dev` served `http://localhost:3000`; Browser route `/docs/examples/code-block` loaded as `code-block-demo - Plate`; first code block switched JavaScript -> Plain Text -> JavaScript, syntax count 48 -> 0 -> 48, warn/error logs `[]`.
- Autoreview: first `.agents/skills/autoreview/scripts/autoreview --mode local` accepted one plan-path finding; after fix, rerun clean with no accepted/actionable findings.
- PR gate: `pnpm check` passed lint, full package build/typecheck, fast/slow/slowest tests. Lint emitted one pre-existing warning in `apps/www/src/components/ui/sidebar.tsx`.

Final handoff contract:
- PR line: https://github.com/udecode/plate/pull/5009
- Issue / tracker line: Fixes #5004; synced at https://github.com/udecode/plate/issues/5004#issuecomment-4699892610
- Confidence line: 95-100%
- Flow table:
  - Reproduced: focused test failed before fix; Browser route exercised after fix
  - Verified: focused test, package typecheck, Browser proof, `pnpm check`, autoreview
- Browser check: `/docs/examples/code-block`, JavaScript -> Plain Text -> JavaScript, no warn/error logs
- Outcome: complex leaf/text renderers no longer change Plite `Leaf` hook order when marks appear or disappear
- Caveat: `pnpm check` lint reports one existing warning in `apps/www/src/components/ui/sidebar.tsx`
- Design:
  - Chosen boundary: `@platejs/core` render pipes own plugin renderer invocation
  - Why not quick patch: unconditional complex renderer calls would undo inactive-renderer performance work
  - Why not broader change: no public API/export change needed
- Verified: focused test, package typecheck, browser proof, full `pnpm check`, autoreview
- PR body verified: `gh pr view 5009 --repo udecode/plate --json url,body,headRefName,baseRefName,isDraft`

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
- PR: https://github.com/udecode/plate/pull/5009
- Issue / tracker: https://github.com/udecode/plate/issues/5004#issuecomment-4699892610
- Browser proof: `/docs/examples/code-block` language switch, no warn/error logs
- Caveats: pre-existing `sidebar.tsx` lint warning during `pnpm check`

Timeline:
- 2026-06-13T21:28:47.259Z Task goal plan created.
- 2026-06-13T21:30Z Issue #5004 and comment read.
- 2026-06-13T21:36Z New focused hook-order test failed before fix.
- 2026-06-13T21:38Z Core leaf/text pipes patched and focused test passed.
- 2026-06-13T21:39Z Changeset added.
- 2026-06-13T21:40Z Package typecheck and lint fix passed.
- 2026-06-13T21:46Z Browser proof passed on `/docs/examples/code-block`.
- 2026-06-13T21:53Z Autoreview first run accepted stale plan-path finding.
- 2026-06-13T21:57Z Autoreview rerun clean after plan-path fix.
- 2026-06-13T22:00Z `pnpm check` passed.
- 2026-06-13T22:01Z Branch `codex/fix-hook-stable-leaf-renderers` created, commit `cbc70dd446` created, and branch pushed.
- 2026-06-13T22:02Z PR #5009 opened and PR body verified with `gh pr view --json body`.
- 2026-06-13T22:03Z Issue #5004 sync comment posted after one shell-quoting retry.
- 2026-06-13T22:05Z Goal plan checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final plan check, mark goal complete, final response |
| What is the goal? | Fix #5004 hook-stable leaf/text renderers with tests, browser proof, changeset, PR, and plan closure |
| What have I learned? | Component boundaries fix the hook warning without losing inactive-renderer skipping |
| What have I done? | Implemented, tested, browser-verified, reviewed, passed `pnpm check`, opened PR, and synced issue |

Open risks:
- None.
