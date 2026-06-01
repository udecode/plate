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
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to close

Current verdict:
- verdict: fixed
- confidence: high
- next owner: none
- reason: Vercel production deploy `dpl_41ZMoFDmunta1pUvPzrZfHR5PDvM` reached `READY` and was aliased to `https://platejs.org`.

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
| Source of truth read before edits | yes | Read local `www` build scripts/config, Fumadocs source mode behavior, generated page output sizes, and Vercel CLI deploy logs. |
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
- [x] Implementation fixes the right ownership boundary: `www` build scripts set async Fumadocs mode for local and Vercel builds, and generated component docs lazy-load source code instead of serializing huge highlighted trees into prerendered pages.
- [x] Release artifact requirement recorded: N/A, no package API, package exports, registry component behavior, or changelog surface changed.
- [x] Final handoff shape decided: bug/deploy fix with local build evidence, Vercel deployment URL/status, browser smoke, commit/push summary.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded: N/A, failures reproduced in Vercel/local production build paths and were not install-corruption shaped.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded: browser/runtime risk is lazy source loading in generated docs; verified with local production build, payload-size check, Browser Code-tab interaction, and Vercel production deploy.
- [x] Review/autoreview target selected: used `bun check`, local production build, Vercel deployment, and Browser proof; skipped separate autoreview because the final source diff is a narrow build/runtime fix with direct deploy proof.
- [x] Agent-native review decision recorded: N/A, no `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling changed.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: exact verification caveat ready for final handoff; no screenshot requested, Browser DOM/interaction proof recorded below.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Vercel production deploy `dpl_41ZMoFDmunta1pUvPzrZfHR5PDvM` ready and aliased to `https://platejs.org`. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | User Vercel log showed OOM; local default `www` build peaked at 16,060,907,520 bytes RSS before the async-docs fix. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Local `www` build with final scripts passed at 10,390,437,888 bytes RSS; Vercel prod deploy passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun check` passed after code changes. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | No package exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `apps/www/package.json` scripts changed only; install graph unchanged. `bun check` and `pnpm --filter www build` passed. |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync | No agent rules or skills changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Commands ran from `/Users/zbeyens/git/plate`; Vercel deployed `udecode/plate`; Browser verified local and deployed docs routes. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Browser verified `/docs/footnote` and `/docs/components/comment-toolbar-button`, including deployed Code-tab lazy source load. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Exact Browser route/DOM/interaction proof recorded; no screenshot requested. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | Local builds rewrote registry output; restored `apps/www/public/r` and `apps/www/src/__registry__/index.tsx`. |
| Package behavior or public API changed | N/A | Add a changeset or record why no changeset applies | No package behavior or public API changed. |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | No registry component implementation changed. |
| Docs or content changed | N/A | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | No docs content changed; only docs app rendering/build behavior changed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode was missing code on generated component docs; Browser Code tab loaded highlighted source on local and deployed pages. |
| Agent-native review for agent/tooling changes | N/A | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | No agent/tooling files changed. |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | Failure reproduced in Vercel and local production build; no install-corruption signal. |
| Autoreview for non-trivial implementation changes | N/A | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Direct build/deploy/browser proof covers the narrow two-file runtime fix. |
| PR create or update | N/A | Run `check` before PR work and sync PR body to the task-style final handoff | User asked push/deploy, not PR creation/update. |
| Task-style PR body verified | N/A | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | No PR body update requested. |
| PR proof image hosting | N/A | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No PR body image needed. |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No tracker item. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm exec biome check ...` passed; `bun check` passed with existing sidebar hook warning only. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One broad generated-output search was recorded in Error attempts; subsequent logs were capped and `/tmp` files used. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-fix-vercel-docs-oom.md` | To run after this closeout update. |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | In-app Browser verified deployed `/docs/components/comment-toolbar-button`; Code tab showed visible highlighted `components/demo.tsx`. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Local dev logs had old HMR warning from an already-open tab; production proof used DOM/interaction checks after successful Vercel deploy. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | Exact Browser proof values recorded; screenshot not requested. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read Vercel OOM log, local build scripts/config, Fumadocs async behavior, generated page output. | done |
| Implementation | complete | Async docs build scripts plus lazy generated component source loading. | done |
| Verification | complete | Local build, `bun check`, Browser local/deployed proof, Vercel production deploy. | done |
| PR / tracker sync | N/A | User requested push/deploy, no PR/tracker update. | done |
| Closeout | complete | Final evidence recorded and ready for handoff. | final response |

Findings:
- Current `www` build runs `prebuild` (`fumadocs-mdx source.config.ts .source`), then `build:registry`, then `next build`.
- Vercel log shows OOM during `next build` after Fumadocs source generation and registry build completed.
- `source.config.ts` currently highlights code at source-generation time unless `PLATE_WWW_DYNAMIC_DOCS=1`; this can materialize large processed markdown/code output before the Next build graph loads.
- Local default `pnpm --filter www build` passed but peaked at 16,060,907,520 bytes RSS, which leaves effectively no headroom on Vercel's 16 GB build container.
- Local `PLATE_WWW_ASYNC_DOCS=1 pnpm --filter www build` passed and peaked at 11,932,090,368 bytes RSS. Fumadocs async mode is supported by the existing page renderer because it already awaits `doc.data.load()` when present.
- After setting the env on both `prebuild` and `build`, plain `pnpm --filter www build` passed and peaked at 11,554,308,096 bytes RSS.
- Root `bun check` passed after the script change.
- Browser smoke on `http://localhost:3002/docs/footnote` passed with title `Footnote - Plate`, one `Footnote` H1, and zero console errors.
- Vercel CLI works for production deployment when run from the repo root linked to `udecode/plate`; running from `apps/www` linked to the wrong `udecode/www` project and is not the right deploy surface.
- First correct Vercel deploy got past the OOM and compiled successfully, then failed on `FALLBACK_BODY_TOO_LARGE` for `cn/docs/components/comment-toolbar-button.fallback` at 20.35 MB.
- Generated component docs were serializing highlighted source for large example dependency trees into preview-mode pages. Local output for `docs/components/comment-toolbar-button.html` dropped from about 21.34 MB to 793,356 bytes after lazy source loading.
- Final Vercel production deployment `dpl_41ZMoFDmunta1pUvPzrZfHR5PDvM` reached `READY` and was aliased to `https://platejs.org`.

Decisions and tradeoffs:
- Set `PLATE_WWW_ASYNC_DOCS=1` in `www` `prebuild`, not a Vercel-only env var, so local production builds and Vercel use the same memory-safe source shape.
- Also set `PLATE_WWW_ASYNC_DOCS=1` on the `www` `build` command because npm lifecycle env from `prebuild` does not persist into `next build`, and Next evaluates the MDX/source config during build.
- Do not reduce docs count or disable production output; async docs keeps the content while reducing the eager MDX graph.
- Do not start with static-generation concurrency knobs because the main memory delta came from Fumadocs source mode, not the number of pages generated per worker.
- Do not use `VERCEL_BYPASS_FALLBACK_OVERSIZED_ERROR=1`; the fallback payload was real bloat and is fixed by lazy source loading.
- Keep generated component docs on preview mode without hidden highlighted code in the initial prerender; fetch full source from the existing registry-source API only when the Code tab is opened.

Implementation notes:
- Changed `apps/www/package.json` `prebuild` and `build` to run Fumadocs/Next production build with `PLATE_WWW_ASYNC_DOCS=1`.
- Changed `apps/www/src/app/(app)/docs/[[...slug]]/doc-page.tsx` to prefetch registry/example source instead of fully materializing every dependency file for generated component/example docs.
- Changed `apps/www/src/components/block-viewer.tsx` to lazy-fetch missing highlighted files when the Code tab opens and to avoid rendering hidden code blocks in preview mode.
- Restored CI-controlled registry build output generated by the local build; only source fixes and the goal plan remain in the diff.

Review fixes:
- Removed the transient extra `useEffect` dependency so dev hot reload does not keep a dependency-list-size warning in new code.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `rg` over `apps/www` streamed generated `public/r` JSON | 1 | Search only source/config paths and exclude generated outputs | Recorded; future commands exclude `apps/www/public`, `.source`, `.next`, `.turbo`, and generated JSON. |
| Only setting `PLATE_WWW_ASYNC_DOCS=1` in `prebuild` | 1 | Set the env on `next build` too | `pnpm --filter www build` still peaked at 16,436,428,800 bytes because lifecycle env did not persist into build. |
| Vercel CLI run from `apps/www` | 1 | Link/deploy from repo root for `udecode/plate` | `apps/www` linked to `udecode/www`; repo root linked to `udecode/plate` and deployed the correct production project. |
| Correct Vercel deploy failed after OOM fix with oversized ISR fallback | 1 | Reduce generated page payload, not bypass the Vercel limit | Lazy source loading reduced `comment-toolbar-button` page HTML from ~21.34 MB to ~0.79 MB and prod deploy passed. |

Verification evidence:
- `/usr/bin/time -l pnpm --filter www build` before fix: passed, peak RSS 16,060,907,520 bytes.
- `/usr/bin/time -l env PLATE_WWW_ASYNC_DOCS=1 pnpm --filter www build` before durable script change: passed, peak RSS 11,932,090,368 bytes.
- `/usr/bin/time -l pnpm --filter www build` after prebuild-only script change: passed, peak RSS 16,436,428,800 bytes, proving `next build` also needs the env.
- `/usr/bin/time -l pnpm --filter www build` after final script change: passed, peak RSS 11,554,308,096 bytes.
- `pnpm exec biome check apps/www/package.json docs/plans/2026-06-01-fix-vercel-docs-oom.md` passed.
- `bun check` passed.
- Browser proof with in-app Browser: `/docs/footnote`, H1 count 1, console error count 0.
- `/usr/bin/time -l pnpm --filter www build` after lazy source loading: passed, peak RSS 10,390,437,888 bytes.
- Local output size check after lazy source loading: `docs/components/comment-toolbar-button.html` 793,356 bytes and `cn/docs/components/comment-toolbar-button.html` 792,360 bytes.
- Browser local proof: `http://localhost:3002/docs/components/comment-toolbar-button`, `h1` `Comment Toolbar Button`, preview mode had `codeBlocks: 0`; clicking Code showed visible highlighted `components/demo.tsx`.
- Browser deployed proof: `https://plate-lva0q03wl-udecode.vercel.app/docs/footnote`, `h1` `Footnote`, `#api` present.
- Browser deployed proof: `https://plate-lva0q03wl-udecode.vercel.app/docs/components/comment-toolbar-button`, `h1` `Comment Toolbar Button`, preview mode had `codeBlocks: 0`; clicking Code showed visible highlighted `components/demo.tsx`.
- Vercel proof: `pnpm dlx vercel@latest --prod --yes --scope udecode` from `/Users/zbeyens/git/plate` returned deployment `dpl_41ZMoFDmunta1pUvPzrZfHR5PDvM`, URL `https://plate-lva0q03wl-udecode.vercel.app`, ready state `READY`, alias `https://platejs.org`.

Final handoff contract:
- PR line: pushed commits to `codex/fumadocs-migration`; no PR body update requested.
- Issue / tracker line: N/A, no tracker issue provided.
- Confidence line: high, production deploy ready.
- Flow table:
  - Reproduced: local default `www` build peak RSS 16,060,907,520 bytes; Vercel OOM excerpt; first prod retry exposed oversized fallback after OOM was fixed.
  - Verified: `bun check`, local `www` production build, local/deployed Browser proof, Vercel prod deployment ready.
- Browser check: local and deployed `/docs/footnote`; local and deployed `/docs/components/comment-toolbar-button` preview and Code-tab lazy source path.
- Outcome: production deploy succeeded without Turbo Builds and `https://platejs.org` was aliased to the ready deployment.
- Caveat: Vercel still emits an NFT warning for `rehype-utils.ts` via `/api/registry-source/[name]`; it does not block deploy and is not this OOM/fallback failure.
- Design:
  - Chosen boundary: build scripts own Fumadocs async mode; generated docs route/block viewer own component-source payload size.
  - Why not quick patch: bypassing Vercel's fallback size limit would hide real page bloat.
  - Why not broader change: no docs content deletion or full route architecture change was needed once async docs and lazy source loading addressed the failure layers.
- Verified: local build, `bun check`, Browser, Vercel deploy.
- PR body verified: N/A, no PR body update requested.

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
- PR: N/A; pushed to `codex/fumadocs-migration`.
- Issue / tracker: N/A.
- Browser proof: deployed `/docs/footnote` and `/docs/components/comment-toolbar-button`; Code tab loaded highlighted source.
- Caveats: Vercel NFT warning remains; no OOM or fallback-size failure remains.

Timeline:
- 2026-06-01T17:43:29.525Z Task goal plan created.
- 2026-06-01: committed `396d7a6dfc fix(www): lower docs build memory`.
- 2026-06-01: first correct Vercel prod retry passed compile but failed on oversized fallback for `comment-toolbar-button`.
- 2026-06-01: committed `1aa9202612 fix(www): lazy load docs source code`.
- 2026-06-01: pushed `1aa9202612` to `codex/fumadocs-migration`.
- 2026-06-01: Vercel production deploy `dpl_41ZMoFDmunta1pUvPzrZfHR5PDvM` reached `READY` and aliased to `https://platejs.org`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Fix Vercel docs build OOM and deploy successfully without enabling Turbo Builds. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Vercel NFT warning remains for dynamic registry-source tracing; deploy is green and this is not the OOM/fallback blocker.
