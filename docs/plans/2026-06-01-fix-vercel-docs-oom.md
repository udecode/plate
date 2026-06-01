# fix vercel docs oom

Objective:
Fix Vercel docs build OOM; done when Vercel deploy for current PR succeeds without OOM; plan docs/plans/2026-06-01-fix-vercel-docs-oom.md.

Goal plan:
docs/plans/2026-06-01-fix-vercel-docs-oom.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user-reported Vercel deployment failure
- id / link: Vercel build log excerpt in thread; current branch `codex/fumadocs-migration`
- title: Vercel docs build OOM after Fumadocs migration
- acceptance criteria: deployed Vercel build succeeds without enabling paid Turbo Builds; if deployment still fails, inspect the next failure and loop until success or a real blocker.

Completion threshold:
- Vercel deployment for the current checkout exits successfully and the deployment inspection reports a ready/successful deployment.
- The fix is committed and pushed to `codex/fumadocs-migration` if code changes are needed.
- Local verification includes the smallest reliable build/check command that proves the memory fix before deploy.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-fix-vercel-docs-oom.md` passes.

Verification surface:
- Source audit of `apps/www` build config, Fumadocs source generation, Next config, Vercel config, and package scripts.
- Local build/check command for the `www` build path, with memory-sensitive output capped.
- Vercel CLI deploy/inspect evidence showing the deployment reached ready/success.
- Browser smoke on a docs route after app-facing changes.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: Vercel build logs, `apps/www` build scripts/config, `.source`/Fumadocs generation, Next build behavior.
- Allowed edit scope: `apps/www/**`, root/Vercel/build config, docs plan, and directly related scripts/config needed to reduce build memory.
- Browser surface: `http://localhost:3002/docs/footnote` or another affected docs route.
- Tracker sync: N/A, no issue/Linear ticket provided.
- Non-goals: do not enable paid Turbo Builds; do not delete docs content to make the build pass; do not mask OOM by skipping required production output.

Output budget strategy:
- Use focused `rg`/`sed` reads for build config and Fumadocs surfaces.
- Cap command output at 12k-20k tokens; if Vercel/build logs are huge, save logs to `/tmp` and inspect focused slices.
- Exclude `node_modules`, `.next`, `.turbo`, generated docs output, and lockfile dumps from broad searches unless they are the named source of truth.

Blocked condition:
- Blocked only if Vercel auth/project access is unavailable, Vercel deploy cannot be started/inspected from this machine, or the same OOM remains after at least three materially different root-cause-directed fixes and no further source evidence identifies the next owner.

Task state:
- task_type: build/deploy bug
- task_complexity: normal
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: pending
- confidence: pending
- next owner: implementation
- reason: Need source read to identify why Fumadocs/Next production build exceeds 16 GB on Vercel.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-fix-vercel-docs-oom.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `autogoal`, `debug`, and Vercel CLI guidance. |
| Active goal checked or created | yes | No active goal existed; created goal for Vercel OOM deploy loop. |
| Source of truth read before edits | in_progress | User supplied Vercel OOM excerpt; next source reads are local build/Vercel config and deploy logs. |
| Tracker comments and attachments read | N/A | No tracker item provided. |
| Video transcript evidence required | N/A | No video or screen recording in scope. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Build/deploy OOM; memory notes searched instead. |
| TDD decision before behavior change or bug fix | yes | Not TDD-first; failure is build/deploy OOM, repro is build/deploy command. |
| Branch decision for code-changing task | yes | Continue current PR branch `codex/fumadocs-migration`; user asked to deploy/fix current work. |
| Release artifact decision | yes | No package release artifact unless package manifest/API changes appear. |
| Browser tool decision for browser surface | yes | Use approved Browser smoke on docs route after app-facing changes. |
| PR expectation decision | yes | Push fix to current PR branch because user requested deploy loop. |
| Tracker sync expectation decision | N/A | No tracker item. |
| Output budget strategy recorded | yes | Focused reads and capped logs recorded above. |
| Browser pack selected | yes | `browser` pack applied because `apps/www` changes require route proof. |
| Browser route / app surface identified | yes | Use `/docs/footnote` unless source read identifies a better affected route. |
| Browser tool decision recorded | yes | Use in-app Browser plugin, not standalone Playwright. |
| Console/network caveat policy recorded | yes | Browser proof must include console errors check or explicit caveat. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [ ] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [ ] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/deploy fix with local build evidence, Vercel deployment URL/status, browser smoke, commit/push summary.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [ ] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [ ] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [ ] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [ ] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Bug reproduced before fix | pending | Record failing test/repro or N/A with reason | pending |
| Targeted behavior verification | pending | Run focused test/proof for changed behavior or record N/A | pending |
| TypeScript or typed config changed | pending | Run relevant typecheck | pending |
| Package exports or file layout changed | pending | Run `pnpm brl` before final verification and keep generated barrel updates | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Workspace authority proof | pending | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | pending |
| Browser surface changed | pending | Capture Browser Use proof or record explicit waiver/blocker | pending |
| Browser final proof | pending | Attach screenshot or exact browser verification caveat when browser proof applies | pending |
| CI-controlled template output changed | pending | Restore generated template output or record why it is intentionally kept | pending |
| Package behavior or public API changed | pending | Add a changeset or record why no changeset applies | pending |
| Registry-only component work changed | pending | Update `docs/components/changelog.mdx` or record N/A | pending |
| Docs or content changed | pending | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | pending |
| High-risk mini gate | pending | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | pending |
| Local install corruption suspected | pending | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | pending |
| Autoreview for non-trivial implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | pending |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-fix-vercel-docs-oom.md` | pending |
| Browser interaction proof | pending | Exercise the target route/interaction with the approved browser tool or record blocker | pending |
| Browser console/network check | pending | Record console/network state or why it is not applicable | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route proof or exact caveat | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | implementation |
| Implementation | pending | | verification |
| Verification | pending | | closeout |
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:
- Current `www` build runs `prebuild` (`fumadocs-mdx source.config.ts .source`), then `build:registry`, then `next build`.
- Vercel log shows OOM during `next build` after Fumadocs source generation and registry build completed.
- `source.config.ts` currently highlights code at source-generation time unless `PLATE_WWW_DYNAMIC_DOCS=1`; this can materialize large processed markdown/code output before the Next build graph loads.
- Local default `pnpm --filter www build` passed but peaked at 16,060,907,520 bytes RSS, which leaves effectively no headroom on Vercel's 16 GB build container.
- Local `PLATE_WWW_ASYNC_DOCS=1 pnpm --filter www build` passed and peaked at 11,932,090,368 bytes RSS. Fumadocs async mode is supported by the existing page renderer because it already awaits `doc.data.load()` when present.
- After setting the env on both `prebuild` and `build`, plain `pnpm --filter www build` passed and peaked at 11,554,308,096 bytes RSS.
- Root `bun check` passed after the script change.
- Browser smoke on `http://localhost:3002/docs/footnote` passed with title `Footnote - Plate`, one `Footnote` H1, and zero console errors.

Decisions and tradeoffs:
- Set `PLATE_WWW_ASYNC_DOCS=1` in `www` `prebuild`, not a Vercel-only env var, so local production builds and Vercel use the same memory-safe source shape.
- Also set `PLATE_WWW_ASYNC_DOCS=1` on the `www` `build` command because npm lifecycle env from `prebuild` does not persist into `next build`, and Next evaluates the MDX/source config during build.
- Do not reduce docs count or disable production output; async docs keeps the content while reducing the eager MDX graph.
- Do not start with static-generation concurrency knobs because the main memory delta came from Fumadocs source mode, not the number of pages generated per worker.

Implementation notes:
- Changed `apps/www/package.json` `prebuild` and `build` to run Fumadocs/Next production build with `PLATE_WWW_ASYNC_DOCS=1`.
- Restored CI-controlled registry build output generated by the local build; only the package script and goal plan remain in the diff.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `rg` over `apps/www` streamed generated `public/r` JSON | 1 | Search only source/config paths and exclude generated outputs | Recorded; future commands exclude `apps/www/public`, `.source`, `.next`, `.turbo`, and generated JSON. |
| Only setting `PLATE_WWW_ASYNC_DOCS=1` in `prebuild` | 1 | Set the env on `next build` too | `pnpm --filter www build` still peaked at 16,436,428,800 bytes because lifecycle env did not persist into build. |

Verification evidence:
- `/usr/bin/time -l pnpm --filter www build` before fix: passed, peak RSS 16,060,907,520 bytes.
- `/usr/bin/time -l env PLATE_WWW_ASYNC_DOCS=1 pnpm --filter www build` before durable script change: passed, peak RSS 11,932,090,368 bytes.
- `/usr/bin/time -l pnpm --filter www build` after prebuild-only script change: passed, peak RSS 16,436,428,800 bytes, proving `next build` also needs the env.
- `/usr/bin/time -l pnpm --filter www build` after final script change: passed, peak RSS 11,554,308,096 bytes.
- `pnpm exec biome check apps/www/package.json docs/plans/2026-06-01-fix-vercel-docs-oom.md` passed.
- `bun check` passed.
- Browser proof with in-app Browser: `/docs/footnote`, H1 count 1, console error count 0.

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
- 2026-06-01T17:43:29.525Z Task goal plan created.

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
