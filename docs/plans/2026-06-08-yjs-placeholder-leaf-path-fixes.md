# Fix Yjs collaboration placeholder DOM and leaf path crashes

Objective:
Fix remaining Plite Yjs collaboration illegal placeholder DOM and non-leaf leaf-path crashes; done when focused repro coverage, Plite proof, and autoreview pass.

Goal plan:
docs/plans/2026-06-08-yjs-placeholder-leaf-path-fixes.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user report plus existing autoresearch reproduction notes
- id / link: `/Users/felixfeng/Desktop/repos/plite/autoresearch.research/yjs-pr21/notes/yjs-collaboration-soak-findings-2026-06-03.md`
- title: Remaining Yjs collaboration placeholder DOM and leaf path crash regressions
- acceptance criteria: fix illegal `p > div` placeholder/hydration warning; fix `Cannot get the leaf node ... non-leaf node` crashes for seeds 42 structural, 42 random, 43 nested block, 46 title paragraph, 49 paragraph; treat seed 55 block quote as high-confidence related proof if the page remains testable.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Done when the focused repro for placeholder illegal DOM fails before the fix and passes after; focused repros for the stable leaf-path seeds fail before the fix and pass after; the relevant package/browser checks in `/Users/felixfeng/Desktop/repos/plite` pass; autoreview reports no accepted/actionable findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-08-yjs-placeholder-leaf-path-fixes.md` passes.

Verification surface:
- `bun test ./packages/plite-yjs/test` or narrower focused package tests if the root cause is pure Yjs document projection.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium -g <focused grep>` for browser-visible repros.
- Relevant package typecheck/lint commands for touched packages.
- Final autoreview for non-trivial implementation changes.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: latest user report plus live `/Users/felixfeng/Desktop/repos/plite` source and `autoresearch.research/yjs-pr21/notes/yjs-collaboration-soak-findings-2026-06-03.md`.
- Allowed edit scope: `/Users/felixfeng/Desktop/repos/plite` runtime/tests plus this plan ledger in `plate-copy`.
- Browser surface: `/examples/yjs-collaboration`.
- Tracker sync: N/A: no issue or PR requested.
- Non-goals: do not chase offline split undo/redo, nested paragraph DOM, root no start/end text node, or No Yjs node seeds 42/96/115 unless current proof shows they still share the same root cause.

Output budget strategy:
- Scope `rg` to `packages/plite-yjs`, `packages/plite-react`, `site/examples/ts/yjs-collaboration.tsx`, and the focused Playwright file; cap large command output with `max_output_tokens`; use focused greps/tests before broad suites.

Blocked condition:
- Block only if the reported repro controls no longer exist in the live example and no equivalent current route/test surface can be found after source inspection and focused Playwright attempts.

Task state:
- task_type: bug fix
- task_complexity: normal
- current_phase: intake
- current_phase_status: complete
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: fixed
- confidence: high
- next owner: task
- reason: focused browser repros failed before the patch and pass after; package checks, `bun check`, and autoreview passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-08-yjs-placeholder-leaf-path-fixes.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User requires fixing illegal placeholder `p > div` hydration and leaf-path crash seeds 42/43/46/49 plus seed 55 as suspicious; non-reproduced families are non-goals unless linked by current evidence. |
| Skill analysis before edits | yes | Loaded `autogoal`, `plite-patch`, and `tdd`; using one-shot Plite Patch with red repro first. |
| Active goal checked or created | yes | Active goal created for this bug cluster. |
| Source of truth read before edits | yes | Read live `../plite` notes sections for placeholder DOM and leaf-path seeds, existing Playwright/Yjs harnesses, `plite-dom` bridge, and placeholder runtime. |
| Tracker comments and attachments read | N/A | No tracker issue, attachment, or PR requested. |
| Video transcript evidence required | N/A | No video/screen recording was provided. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | This repo lane uses `autoresearch.research/yjs-pr21` notes and live code as the prior solution source. |
| TDD decision before behavior change or bug fix | yes | Add or update focused failing behavior tests before implementation. |
| Branch decision for code-changing task | N/A | User did not ask for branch/commit/PR; avoid git workflow unless later requested. |
| Release artifact decision | yes | Published package behavior changed in `plite-dom` and `plite-react`; added one patch changeset per package. |
| Browser tool decision for browser surface | yes | Use existing Playwright integration first because the repros are already encoded around `/examples/yjs-collaboration`; Browser plugin only if manual browser proof is needed. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker sync requested. |
| Output budget strategy recorded | yes | Use scoped `rg`, focused tests, and capped command output. |
| Browser pack selected | yes | Browser pack applies because symptoms are DOM/hydration and page crash. |
| Browser route / app surface identified | yes | `/examples/yjs-collaboration` in `/Users/felixfeng/Desktop/repos/plite`. |
| Browser tool decision recorded | yes | Focused Playwright is the primary automated browser proof; Browser plugin remains optional for manual visual proof. |
| Console/network caveat policy recorded | yes | Console errors for illegal DOM and `Cannot get the leaf node` are first-class failures; unrelated Next overlay/control disappearance is downstream crash noise. |
| Package/API pack selected | yes | The likely owner is package runtime behavior in `@slate/yjs` and/or `plite-react`. |
| Public surface or package boundary identified | yes | `plite-dom` DOM-to-Plite point resolution and `plite-react` default placeholder element. |
| Release artifact path selected | yes | `.changeset/fresh-ranges-bow.md` and `.changeset/silent-placeholders-smile.md`. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded `changeset`; used patch changesets with one package per file. |
| Barrel/export impact decision recorded | N/A | No exports or exported file layout changed. |

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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Focused browser repro green, focused package tests green, `bun check` green, autoreview clean. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium -g "placeholder divs|leaf-path crashes"` failed 6/6 before fix: one `p div` assertion and five `Cannot get the leaf node` crashes. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Same focused Playwright command passed 6/6 after fix, twice. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun --filter ./packages/plite-dom typecheck`, `bun --filter ./packages/plite-react typecheck`, `bun --filter ./packages/plite-yjs typecheck`, and `bun check` passed. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | No exports or exported file layout changed. |
| Package manifests, lockfile, or install graph changed | N/A | Run `pnpm install` and relevant package checks | No manifests, lockfile, or install graph changed. |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync | No agent rules or skills changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All runtime/test proof ran in `/Users/felixfeng/Desktop/repos/plite`; plan ledger only lives in `plate-copy`. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Focused Playwright is the repo-owned browser proof for `/examples/yjs-collaboration`; it captured console error failures and final pass. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | No screenshot needed; Playwright route proof passed 6/6 with structural console errors watched. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | No CI-controlled template output changed. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Added patch changesets for `plite-dom` and `plite-react`. |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | No registry-only component work. |
| Docs or content changed | N/A | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Only plan ledger and changesets changed; no user docs. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: stale DOM path could still produce element-path selection; proof: bridge test plus Playwright leaf-path seeds. Placeholder risk: invalid `p > div`; proof: placeholder contract plus Playwright DOM assertion. |
| Agent-native review for agent/tooling changes | N/A | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | No agent/tooling files changed. |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No local install corruption signal. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | `/Users/felixfeng/Desktop/repos/plate-copy/.agents/skills/autoreview/scripts/autoreview --mode local` passed with temp `CODEX_HOME` service_tier fast: `autoreview clean`, overall 0.84. |
| PR create or update | N/A | Run `check` before PR work and sync PR body to the task-style final handoff | No PR requested. |
| Task-style PR body verified | N/A | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | No PR requested. |
| PR proof image hosting | N/A | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No PR requested. |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No tracker requested. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff fields filled. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `bun lint:fix` passed and fixed one file; `bun check` lint stage passed with no fixes applied. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used scoped `rg`, focused tests, and capped output. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-08-yjs-placeholder-leaf-path-fixes.md` | Passed: `[autogoal] complete`. |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | Focused Playwright exercised `/examples/yjs-collaboration` actions for placeholder, seeds 42/43/46/49/55. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | `watchStructuralBrowserErrors` asserted no structural console/page errors in green run. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | Exact route/test proof recorded; no screenshot artifact needed. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `git diff --name-only` shows no export files/package manifests changed; boundary is runtime behavior in existing public packages. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published runtime behavior changes for `plite-dom` and `plite-react`. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Added `.changeset/fresh-ranges-bow.md` for `plite-dom: patch` and `.changeset/silent-placeholders-smile.md` for `plite-react: patch`; no forbidden packages. |
| Registry changelog | N/A | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | Not registry-only work. |
| No release artifact | N/A | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Release artifacts were required and added. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `plite-dom` tests 93 pass; `plite-react` vitest 53 files/480 tests pass; `@slate/yjs` structural test 13 pass; affected package typechecks pass; `bun check` passed. |
| Barrel/export generation | N/A | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | No exports changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | plan created; prompt requirements copied; notes/source read | red repro |
| Implementation | complete | fixed `plite-dom` runtime-id DOM path resolution and `plite-react` placeholder default; added browser/package tests and changesets | verification |
| Verification | complete | focused Playwright, package tests, typechecks, `bun check`, autoreview clean | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | complete | plan evidence recorded | final response |

Findings:
- Browser-only repros failed while package-only Yjs structure tests stayed green; the remaining leaf-path issue lived in DOM-to-Plite selection resolution, not raw Yjs document projection.
- `PlitePlaceholder` defaulted to `div`, which is invalid under the paragraph renderer used by `/examples/yjs-collaboration`.

Decisions and tradeoffs:
- Fixed `plite-dom` to prefer runtime ids over stale `data-plite-path` attributes and to resolve non-text DOM point paths to valid text edge points. This is the durable bridge boundary; example-only selection cleanup would have left the same bug class elsewhere.
- Changed the default `PlitePlaceholder` element to `span`. This preserves custom `as` support while making the default safe inside paragraph text renderers.

Implementation notes:
- `packages/plite-dom/src/plugin/dom-editor.ts`: runtime id path wins before stale mounted path attributes; DOM point resolution no longer returns element paths as Plite points.
- `packages/plite-react/src/components/slate-placeholder.tsx`: default placeholder tag is `span`.
- `playwright/integration/examples/yjs-collaboration.test.ts`: added placeholder invalid-descendant proof and leaf-path crash proofs for seeds 42/43/46/49/55.
- `packages/plite-yjs/test/structural-soak-contract.spec.ts`: added package-level structural invariants for the same command families; these stay green and document that model projection is not the failing layer.

Review fixes:
- Autoreview reported no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `bun test ./packages/plite-dom/test` did not match Bun test file filters | 1 | Run from `packages/plite-dom` with `bun test ./test/*.test.ts` | Passed 93 tests. |
| Autoreview failed on global Codex config `service_tier = "priority"` | 1 | Use temp `CODEX_HOME` with copied auth and `service_tier = "fast"` | Autoreview passed clean. |
| `PLAYWRIGHT_BASE_URL=http://localhost:3101` run hit connection refused after previous webServer exited | 1 | Let Playwright start its own webServer | Focused Playwright passed 6/6. |

Verification evidence:
- Red: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium -g "placeholder divs|leaf-path crashes"` failed 6/6 before fix: one invalid `p div` assertion and five `Cannot get the leaf node` crashes.
- Green browser: same focused Playwright command passed 6/6 after fix, twice.
- Green package tests: `bun test ./packages/plite-yjs/test/structural-soak-contract.spec.ts` 13 pass; `bun test ./packages/plite-react/test/primitives-contract.tsx` 9 pass; `bun test ./test/*.test.ts` from `packages/plite-dom` 93 pass.
- Green package typechecks: `bun --filter ./packages/plite-dom typecheck`, `bun --filter ./packages/plite-react typecheck`, `bun --filter ./packages/plite-yjs typecheck`.
- Green broad check: `bun check` passed lint, package/site/root typecheck, default Bun tests, `plite-layout` tests, and `plite-react` vitest.
- Review: autoreview local passed clean with no accepted/actionable findings; overall 0.84.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker requested.
- Confidence line: high.
- Flow table:
  - Reproduced: package structural tests green but focused browser tests failed 6/6 before fix, proving the bug is browser/DOM bridge visible.
  - Verified: focused browser tests passed 6/6 twice; package tests/typechecks and `bun check` passed.
- Browser check: `/examples/yjs-collaboration` Playwright proof covered placeholder DOM and leaf-path seeds 42/43/46/49/55, with structural console errors watched.
- Outcome: fixed illegal placeholder DOM and non-leaf leaf-path crashes in the reported current repro set.
- Caveat: no PR/commit/push was requested; changes are local.
- Design:
  - Chosen boundary: `plite-dom` DOM-to-Plite point resolution plus `plite-react` placeholder primitive default.
  - Why not quick patch: example-only selection cleanup would leave stale DOM path resolution and default placeholder invalid HTML in other consumers.
  - Why not broader change: Yjs document projection already stayed structurally valid in package tests; changing CRDT operations would be the wrong layer.
- Verified: focused Playwright, package tests, package typechecks, `bun check`, autoreview clean.
- PR body verified: N/A: no PR requested.

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
- PR: N/A: no PR requested.
- Issue / tracker: N/A: no tracker requested.
- Browser proof: focused `/examples/yjs-collaboration` Playwright passed 6/6 twice after failing 6/6 before fix.
- Caveats: local changes are not committed or pushed.

Timeline:
- 2026-06-08T07:44:26.817Z Task goal plan created.
- 2026-06-08T07:51Z Focused Playwright repro failed 6/6 before fix.
- 2026-06-08T07:52Z Fixed `plite-dom` runtime-id path resolution and `plite-react` placeholder default.
- 2026-06-08T07:53Z Focused Playwright repro passed 6/6.
- 2026-06-08T07:54Z Package tests, typechecks, `bun lint:fix`, `bun check`, and autoreview passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Fix remaining Plite Yjs collaboration illegal placeholder DOM and non-leaf leaf-path crashes. |
| What have I learned? | Browser failures came from stale DOM path selection resolution and block default placeholder markup, not raw Yjs projection. |
| What have I done? | Added red/green browser repros, fixed runtime boundaries, added changesets, verified, and ran clean autoreview. |

Open risks:
- Residual risk is low: this covers the currently confirmed repro set, but it does not claim the unrelated non-reproduced families are fixed.
