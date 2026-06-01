# debug docs dev server oom

Objective:
Fix docs dev-server OOM; done when root cause is documented, fix lands, and / plus /docs/ai respond without runaway RSS.

Goal plan:
docs/plans/2026-06-01-debug-docs-dev-server-oom.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user-reported local dev-server failure
- id / link: current Codex thread
- title: Prevent docs dev server OOM/hang
- acceptance criteria: identify root cause, say whether local package count is the limiting factor, patch the responsible code/config when repo-owned, and verify `/` plus `/docs/ai` respond without runaway RSS.

Completion threshold:
- Root cause is recorded with source evidence and a confirmed/rejected local-package-count verdict.
- The responsible repo-owned source/config is patched, or a non-repo-owned limitation is proven with evidence.
- `PORT=3002 pnpm --filter www dev` can serve `/` and `/docs/ai` within a bounded memory window during focused verification.
- `pnpm --filter www check:docs`, relevant typecheck/lint checks, and browser/HTTP proof are recorded.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-debug-docs-dev-server-oom.md` passes.

Verification surface:
- Process/RSS evidence from the docs dev server while requesting `/` and `/docs/ai`.
- Source audit of the route/render/import path that triggers OOM.
- Focused checks: `pnpm --filter www check:docs`, `pnpm --filter www typecheck`, and a scoped lint/fix gate if implementation files change.
- Browser or HTTP proof for `http://localhost:3002/` and `http://localhost:3002/docs/ai`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `apps/www` docs app runtime/config, generated Fumadocs source shape, local dev-server process evidence.
- Allowed edit scope: docs app source/config/scripts and this goal plan; broader package manifests only if root cause proves install graph/config ownership.
- Browser surface: `http://localhost:3002/` and `http://localhost:3002/docs/ai`.
- Tracker sync: N/A: no external issue or PR requested.
- Non-goals: no PR/commit/push, no unrelated docs rewrite, no global package upgrade unless proven necessary.

Output budget strategy:
- Use narrow `rg`, `sed`, `ps`, `lsof`, and route probes. Cap tool output; save large HTML/log/process snapshots to `/tmp` and inspect slices/counts instead of streaming full output.

Blocked condition:
- Block only if the OOM cannot be reproduced or profiled after three distinct bounded attempts, or if the root cause is a Next/Turbopack/runtime bug with no repo-owned mitigation and primary-source evidence is recorded.

Task state:
- task_type: bug fix / performance diagnosis
- task_complexity: normal
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: pending
- confidence: pending
- next owner: task
- reason: root cause investigation in progress.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-debug-docs-dev-server-oom.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `autogoal` and `debug`; followed root-cause-first debugging. |
| Active goal checked or created | yes | `get_goal` returned null, then `create_goal` created active goal for this plan. |
| Source of truth read before edits | yes | Read `apps/www/source.config.ts`, `apps/www/next.config.ts`, `apps/www/src/lib/source.ts`, docs route, search route, generated `.source/*`, and Fumadocs runtime generation. |
| Tracker comments and attachments read | N/A: no tracker link | User reported failure directly in thread. |
| Video transcript evidence required | N/A: no video | No video evidence supplied for this task. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: local dev-server runtime bug | Used repo source and generated Fumadocs/Next output; no solution artifact applied. |
| TDD decision before behavior change or bug fix | N/A: process/RSS regression | Verification is bounded dev-server route proof plus typecheck/docs checks. |
| Branch decision for code-changing task | N/A: no branch requested | Work continues on current checkout; no git branch hygiene requested. |
| Release artifact decision | N/A: dev-server bug unless package public behavior changes | No changeset unless package manifest/public API changes. |
| Browser tool decision for browser surface | yes | Prefer Browser plugin for final route proof; use HTTP/process probes for memory profiling. |
| PR expectation decision | N/A: no PR requested | No commit/push/PR. |
| Tracker sync expectation decision | N/A: no tracker | No issue/Linear sync. |
| Output budget strategy recorded | yes | Narrow commands and `/tmp` artifacts only. |
| Browser pack selected | yes | Applied `browser` pack. |
| Browser route / app surface identified | yes | `/` and `/docs/ai` on `localhost:3002`. |
| Browser tool decision recorded | yes | Browser proof if server is stable; HTTP proof is acceptable for low-level memory profiling. |
| Console/network caveat policy recorded | yes | Final proof checks route responses; console/network only if Browser automation is reachable after fix. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
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
| Named verification threshold | yes | Run route/RSS proof plus docs/type checks | `NODE_OPTIONS=--max-old-space-size=4096 PORT=3002 pnpm --filter www dev` served `/`, `/docs/ai`, `/api/search?query=insertNode`; repeat hits stabilized near 12.1 GB RSS instead of runaway growth. |
| Bug reproduced before fix | yes | Record failing test/repro | Baseline capped repro: `/` rose to ~16 GB RSS and `/docs/ai` hit V8 heap OOM; original unbounded process reached ~37 GB RSS and stopped answering. |
| Targeted behavior verification | yes | Run focused proof | Fixed run: `/` 200, `/docs/ai` 200, `/api/search?query=insertNode` 200 under 4 GB V8 heap cap; repeat requests did not keep growing materially. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed. |
| Package exports or file layout changed | N/A | No package exports changed | No `pnpm brl` needed. |
| Package manifests, lockfile, or install graph changed | yes | Check manifest impact | `apps/www/package.json` script changed only; no dependency or lockfile change, so `pnpm install` not needed. |
| Agent rules or skills changed | N/A | No agent files changed | No sync needed. |
| Workspace authority proof | yes | Verify in owner workspace | Commands ran from `/Users/zbeyens/git/plate` against `apps/www`. |
| Browser surface changed | yes | Capture route proof or caveat | HTTP/process proof used because Browser MCP did not expose a usable in-app navigation tool in this turn. |
| Browser final proof | yes | Record exact caveat | Route proof: `/` and `/docs/ai` returned 200 on localhost:3002; no screenshot captured. |
| CI-controlled template output changed | N/A | No template output changed | Generated `.source` files are expected local output from checks/dev. |
| Package behavior or public API changed | N/A | No public package API changed | No changeset. |
| Registry-only component work changed | N/A | No registry component behavior changed | No registry changelog. |
| Docs or content changed | N/A | No docs content changed | Plan file only. |
| High-risk mini gate | yes | Record realistic failure mode and boundary | Risk: dev code highlighting is simpler than production; boundary is dev-only env `PLATE_WWW_DYNAMIC_DOCS=1`, production build still keeps Shiki highlighting. |
| Agent-native review for agent/tooling changes | N/A | No agent tooling changed | No agent-native review. |
| Local install corruption suspected | N/A | Not an install corruption signature | Failure reproduced as deterministic route compile/RSS growth. |
| Autoreview for non-trivial implementation changes | N/A: not run | Record reason | User requested autogoal/debug, not autoreview; source-backed checks and route proof are recorded. |
| PR create or update | N/A | No PR requested | No commit/push/PR. |
| Task-style PR body verified | N/A | No PR requested | No PR body. |
| PR proof image hosting | N/A | No PR requested | No hosted image. |
| Tracker sync-back | N/A | No tracker | No issue/Linear sync. |
| Final handoff contract | yes | Fill final handoff fields | See final handoff contract below. |
| Final lint | partial | Run lint or scoped equivalent | `pnpm --filter www lint:fix` fails on existing parser/config errors across generated and TS files; scoped eslint on touched app files passed, with `next.config.ts` ignored by repo lint config. |
| Output budget discipline | partial | Record accidental output and recovery | Two broad generated-file outputs were accidentally streamed (`.source/browser.ts`, `.source/dynamic.ts`); recovered by using capped probes and summaries. |
| Goal plan complete | yes | Run completion checker | To run after this plan update with `.agents/skills/autogoal/scripts/check-complete.mjs`. |
| Browser interaction proof | partial | Exercise route or record blocker | HTTP route proof used; Browser plugin did not expose direct page-control tool. |
| Browser console/network check | N/A | Low-level server memory fix | Console/network not the failure surface. |
| Browser final proof artifact | yes | Record route proof | `/tmp/www-nohighlight-probe-1.out`, `/tmp/www-nohighlight-probe-2.out`, and route/RSS lines recorded in this plan. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Reproduced OOM and traced generated Fumadocs/Next route graph. | done |
| Implementation | complete | Patched dev docs source, dev aliases, search/copy markdown, code highlighting, and home preview import boundary. | done |
| Verification | complete | Route/RSS proof, `check:docs`, `typecheck`, scoped eslint. | done |
| PR / tracker sync | N/A | No PR/tracker requested. | done |
| Closeout | complete | Final handoff ready. | done |

Findings:
- Previous server OOM evidence: `next-server (v16.2.6)` reached roughly 37 GB RSS and stopped answering both `/docs/ai` and `/`; an earlier process hit V8 heap limit near 65 GB.
- Bounded repro before fix: `/` compiled to runaway RSS and `/docs/ai` failed with V8 heap OOM in `JsonParse` / `GlobalEval`.
- `includeProcessedMarkdown` and search/copy processed markdown amplified memory; switching those paths to raw avoids eager processed markdown.
- Fumadocs `async` alone did not fix it because generated `server.ts` still exposed a dynamic import map and Next compiled every MDX body target.
- Dev-only Fumadocs `dynamic` removes the all-MDX body import map; `collections/server` is aliased to `.source/dynamic.ts` only when `PLATE_WWW_DYNAMIC_DOCS=1`.
- The home page imported the full playground editor graph; it is now behind a client-only dynamic boundary.
- The number of local packages is not the root cause by itself. It hurts when docs dev aliases every workspace package to source and the route imports the full editor kit. Default docs dev now prefers built `dist` aliases; `PLATE_WWW_DEV_SOURCE=1` opts back into source aliases for package hacking.

Decisions and tradeoffs:
- Debug flow: reproduce and trace before fixing. Do not mask the symptom with a larger heap unless evidence proves a tool limit and no repo-owned route/import mitigation exists.

Implementation notes:
- `apps/www/package.json`: `dev` sets `PLATE_WWW_DYNAMIC_DOCS=1` for `build:source` and `next dev`.
- `apps/www/source.config.ts`: dev dynamic docs, no dev Shiki/rehype pretty-code highlighting, raw code metadata preserved for copy buttons.
- `apps/www/next.config.ts`: Turbopack filesystem cache remains disabled, workspace dev aliases prefer `dist` with `PLATE_WWW_DEV_SOURCE=1` source opt-in, and dev docs alias `collections/server` to `.source/dynamic.ts`.
- `apps/www/src/app/(app)/docs/[[...slug]]/doc-page.tsx`: loads async/dynamic MDX body before rendering and uses raw markdown for copy.
- `apps/www/src/app/api/search/route.ts`: search indexes raw markdown to avoid processed markdown hydration.
- `apps/www/src/components/playground-preview-lazy.tsx` and home pages: defer the heavy playground preview graph.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `async: true` Fumadocs collection still OOMed | 1 | Use dev-only dynamic compilation instead of import map | Fixed with `PLATE_WWW_DYNAMIC_DOCS=1` and alias to `.source/dynamic.ts`. |
| Webpack dev fallback still OOMed/hung | 1 | Stop bundler swap, reduce route graph | Fixed by route graph changes instead. |
| Broad generated-file output streamed | 2 | Use capped probes and summaries | Recorded; subsequent proof kept concise. |

Verification evidence:
- `pnpm --filter www check:docs` passed.
- `pnpm --filter www typecheck` passed.
- `pnpm --filter www lint:fix` failed on existing lint parser/config problems across generated and TS files; scoped eslint on touched app files passed, with `next.config.ts` ignored by repo lint config.
- Bounded server proof with `NODE_OPTIONS='--max-old-space-size=4096' PORT=3002 pnpm --filter www dev`:
  - `/`: 200, first-hit RSS ~2.9 GB -> ~4.5 GB.
  - `/docs/ai`: 200, first-hit RSS ~4.5 GB -> ~10.5 GB.
  - `/api/search?query=insertNode`: 200, first-hit RSS ~10.5 GB -> ~12.4 GB.
  - Repeat `/`, `/docs/ai`, `/api/search?query=insertNode`, `/docs/installation/plate-ui`: all 200; RSS stayed around ~12.0-12.1 GB instead of runaway growth.
- Final live server proof with `PORT=3002 pnpm --filter www dev`: `/` 200 and `/docs/ai` 200; RSS ended around ~10.4 GB after compiling those two routes.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker.
- Confidence line: high for preventing runaway/OOM on target routes; medium on absolute memory footprint because Next dev still retains roughly 12 GB after compiling heavy docs/search routes.
- Flow table:
  - Reproduced: route/RSS OOM reproduced; browser N/A.
  - Verified: route/RSS proof passed; browser proof replaced by HTTP/process proof.
- Browser check: HTTP/process proof used; in-app Browser control tool was not exposed.
- Outcome: Dev server no longer runs away to 30GB+ on `/` and `/docs/ai`; target routes respond under a 4GB V8 heap cap and stabilize.
- Caveat: First-hit dev compile is still heavy, around 12GB RSS after docs/search compile. That is a Next/Fumadocs/large-MDX dev cost, not pure package count.
- Design:
  - Chosen boundary: dev-only dynamic docs compilation, dev dist aliases, deferred home playground, raw search/copy markdown, dev-only raw code blocks.
  - Why not quick patch: larger heap would hide the runaway and keep 30GB zombies possible.
  - Why not broader change: no package API or docs content change needed.
- Verified: `check:docs`, `typecheck`, scoped eslint, route/RSS proof.
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
- Browser proof: HTTP/process proof only.
- Caveats: first-hit dev RSS remains high but stable; full lint script has pre-existing parser/config failures.

Timeline:
- 2026-06-01T10:41:09.890Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Fix docs dev-server OOM; prove root cause, patch if repo-owned, and verify `/` plus `/docs/ai`. |
| What have I learned? | See Findings and Verification evidence. |
| What have I done? | Patched docs dev graph and verified target routes. |

Open risks:
- First-hit dev compile still retains roughly 12GB RSS after `/docs/ai` and search; acceptable compared with the prior runaway, but still expensive.
- Dev docs code blocks skip Shiki highlighting under `PLATE_WWW_DYNAMIC_DOCS=1`; production/non-dynamic generation keeps Shiki.
