# fix slate yjs structural replays

Objective:
Fix two Plite yjs-collaboration structural replay crashes in `../plite`.

Goal plan:
docs/plans/2026-06-08-fix-slate-yjs-structural-replays.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user-reported browser repro
- id / link: current Codex thread
- title: yjs-collaboration `random-control-85` and `offline-structural-mix-108`
- acceptance criteria: both targeted replays stop throwing structural browser errors; no `No Yjs node at path 0.0`; no `p > p` nested paragraph / hydration warning.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- `playwright/integration/examples/yjs-collaboration.test.ts` contains behavior regressions for both exact targeted replays.
- The new tests fail on the current behavior before the fix.
- The fix lives in the owning package/runtime path, not as an example-only workaround.
- Focused browser regression for both replays passes.
- Owning `@slate/yjs` package test/typecheck or repo `bun check` proof passes.
- No release, PR, push, or publish work is done.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-08-fix-slate-yjs-structural-replays.md` passes.

Verification surface:
- Focused Playwright grep in `/Users/felixfeng/Desktop/repos/plite` for the two new `yjs-collaboration` tests.
- Focused dev-browser/manual replay for `/examples/yjs-collaboration` if the dev-browser route is usable; otherwise record the existing persistent-profile blocker and use Playwright browser proof.
- `bun --filter @slate/yjs test` and `bun --filter @slate/yjs typecheck`, or a narrower package command if the package owner provides one.
- `bun check` if scoped package proof is insufficient.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: live `/Users/felixfeng/Desktop/repos/plite`, user-provided targeted replay sequences, and current browser repro output.
- Allowed edit scope: `packages/plite-yjs/**`, focused browser tests, and only adjacent runtime/schema helpers if root cause proves outside `@slate/yjs`.
- Browser surface: `/examples/yjs-collaboration`.
- Tracker sync: N/A: no issue/Linear/PR requested.
- Non-goals: no release readiness, no publish, no PR, no push, no broad soak rewrite.

Output budget strategy:
- Use scoped `rg`, `sed`, and focused test output. Cap high-volume command output and avoid broad `site/out` scans.

Blocked condition:
- Block only if the targeted replay cannot be run in any browser harness, or package checks are blocked by unrelated environment failure after one appropriate retry.

Task state:
- task_type: bugfix
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: two confirmed browser/runtime bugs remain
- confidence: high
- next owner: task
- reason: both targeted replays reproduced 5/5 in browser proof.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-08-fix-slate-yjs-structural-replays.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | resolved in verification evidence |
| Skill analysis before edits | yes | loaded `autogoal`, `plite-patch`, and `tdd` skills |
| Active goal checked or created | yes | `create_goal` called for the two replay fixes |
| Source of truth read before edits | yes | read current yjs-collaboration test helpers and `@slate/yjs` operation owners |
| Tracker comments and attachments read | N/A | no tracker/PR issue supplied |
| Video transcript evidence required | N/A | no video supplied |
| `docs/solutions` checked for non-trivial existing-code work | N/A | memory and existing local tests already identify the current owner; no docs/solutions artifact required |
| TDD decision before behavior change or bug fix | yes | add focused failing browser regressions first |
| Branch decision for code-changing task | yes | resolved in verification evidence |
| Release artifact decision | yes | resolved in verification evidence |
| Browser tool decision for browser surface | yes | persistent `dev-browser --connect` is blocked by CDP; Playwright route used for red/green proof |
| PR expectation decision | N/A | user asked fix only |
| Tracker sync expectation decision | N/A | no tracker supplied |
| Output budget strategy recorded | yes | scoped searches and capped outputs |
| Browser pack selected | yes | bug is browser-visible |
| Browser route / app surface identified | yes | `/examples/yjs-collaboration` |
| Browser tool decision recorded | yes | Playwright focused browser proof; dev-browser caveat in handoff if still blocked |
| Console/network caveat policy recorded | yes | fail on structural console/page errors; network out of scope unless page load fails |
| Package/API pack selected | yes | `@slate/yjs` runtime package behavior changes |
| Public surface or package boundary identified | yes | package runtime behavior, no exported API/file layout change expected |
| Release artifact path selected | yes | decide after code: likely `.changeset` for package behavior change |
| `changeset` skill loaded when `.changeset` is required | yes | pending until release artifact decision |
| Barrel/export impact decision recorded | yes | no export/file layout change expected; run `pnpm brl` only if that changes |

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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | yes |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | yes |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | yes |
| TypeScript or typed config changed | yes | Run relevant typecheck | yes |
| Package exports or file layout changed | yes | Run `pnpm brl` before final verification and keep generated barrel updates | yes |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | yes |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | yes |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | yes |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | yes |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | yes |
| CI-controlled template output changed | yes | Restore generated template output or record why it is intentionally kept | yes |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | yes |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | yes |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | yes |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | yes |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | yes |
| Local install corruption suspected | yes | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | yes |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | yes |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | yes |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | yes |
| PR proof image hosting | yes | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | yes |
| Tracker sync-back | yes | Post concise issue/Linear sync after PR exists, or record N/A/blocker | yes |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | yes |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | yes |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | yes |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-08-fix-slate-yjs-structural-replays.md` | yes |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | yes |
| Browser console/network check | yes | Record console/network state or why it is not applicable | yes |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | yes |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | yes |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | yes |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | yes |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | yes |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | yes |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | yes |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | yes |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | created plan | complete |
| Implementation | yes | | complete |
| Verification | yes | | complete |
| PR / tracker sync | yes | | final response |
| Closeout | yes | | final response |

Findings:
- `random-control-85` failed because Plite could edit a synthetic empty text node read from an empty Yjs element; `insert_text` now materializes a real empty `Y.XmlText` before inserting.
- `offline-structural-mix-108` failed because an incompatible local structural merge was elided in Yjs but left the offline Plite editor rendering the rejected nested paragraph; the controller now reimports Yjs canonical value after that fallback.

Decisions and tradeoffs:
- Fix the package/runtime owner in `@slate/yjs`, not the example controls.
- Keep the local fallback import narrow to `incompatible-structural-merge-elided` instead of reconciling every traceable fallback.
- Add a package patch changeset because published `@slate/yjs` behavior changes.

Implementation notes:
- Added materialization for missing empty text targets in `packages/plite-yjs/src/core/operations.ts`.
- Added local editor canonical reimport for rejected incompatible structural merges in `packages/plite-yjs/src/core/controller.ts`.
- Added package and browser regressions for `random-control-85` and `offline-structural-mix-108`.

Review fixes:
- Autoreview found no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Red proof before fix: focused Playwright for `random-control seed 85|offline structural mix seed 108` failed 2/2 with `No Yjs node at path 0.0` and `p p` count 1.
- Package proof: `bun test packages/plite-yjs/test` passed 164/164; `bun --filter @slate/yjs typecheck` passed.
- Browser proof: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium -g "structural|leaf-path|placeholder|seed 85|seed 108|nested paragraphs|root text boundaries|missing Yjs"` passed 17/17.
- Dev-browser proof: self-managed `dev-browser` targeted replay passed 5/5 for both sequences with 0 page errors, 0 structural console logs, 0 invalid paragraph descendants, 4 editors alive. Persistent `--connect 127.0.0.1:9222` remains blocked by `Browser.setDownloadBehavior`.
- Repo proof: `bun check` passed.
- Review proof: `/Users/felixfeng/Desktop/repos/plate-copy/.agents/skills/autoreview/scripts/autoreview --mode local --codex-bin /tmp/codex-fast-wrapper` exited clean with no accepted/actionable findings.

Final handoff contract:
- PR line: N/A: user asked local fix only.
- Issue / tracker line: N/A: no tracker supplied.
- Confidence line: high; red/green package, browser, dev-browser, repo check, and autoreview proof passed.
- Flow table:
  - Reproduced: package red and Playwright red before fix.
  - Verified: package tests/typecheck, focused Playwright structural suite, dev-browser replay, `bun check`.
- Browser check: `/examples/yjs-collaboration` targeted replay and focused Playwright structural grep passed.
- Outcome: two confirmed bugs fixed.
- Caveat: persistent Fehala dev-browser CDP attach still fails; self-managed dev-browser and Playwright proof are clean.
- Design:
  - Chosen boundary: `@slate/yjs` operation/controller behavior.
  - Why not quick patch: example-only filtering would leave package users with the same Yjs/Plite divergence.
  - Why not broader change: only one synthetic text materialization and one rejected merge fallback needed canonical import.
- Verified: see Verification evidence.
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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: focused Playwright 17/17 plus dev-browser targeted 5/5 per scenario.
- Caveats: persistent `dev-browser --connect` profile route remains blocked by local CDP/tool mismatch.

Timeline:
- 2026-06-08T14:44:05.777Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Fix both yjs-collaboration structural replays in `../plite` |
| What have I learned? | See Findings |
| What have I done? | Added regressions, fixed `@slate/yjs`, added changeset, verified tests/browser/review |

Open risks:
- None known for the fixed scenarios. Residual risk is limited to unrelated local dirty files already present in the checkout.
