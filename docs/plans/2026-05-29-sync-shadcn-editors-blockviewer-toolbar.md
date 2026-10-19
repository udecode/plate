# sync shadcn editors blockviewer toolbar

Objective:
Implement the accepted `sync-shadcn` `/editors` BlockViewer toolbar slice:
adopt shadcn `/blocks` toolbar order and density, keep Plate install/source and
Pro behavior, keep `Open in v0` excluded, update partial sync tracking without
advancing `lastSyncedCommit`, and verify with focused checks plus browser proof.

Goal plan:
docs/plans/2026-05-29-sync-shadcn-editors-blockviewer-toolbar.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: accepted sync-shadcn implementation slice
- id / link: `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/plan.md`
- title: Editors BlockViewer toolbar parity
- acceptance criteria: device/open/refresh group before Plate command pill,
  refresh reloads preview iframe, no v0 action, Plate install/source and Pro
  behavior retained, status and plan updated as a partial sync, lint/typecheck
  and browser proof pass.

Completion threshold:
- `apps/www/src/components/block-viewer.tsx` uses upstream-style toolbar order:
  device controls, open-new-tab, refresh, then command/pro action.
- `Open in v0` remains absent and no v0 import/action is introduced.
- `docs/sync/shadcn/status.json` no longer lists toolbar cleanup as deferred
  for `/editors`; `lastSyncedCommit` remains unchanged.
- Focused eslint, `pnpm --filter www typecheck`, and desktop/mobile browser
  proof pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-sync-shadcn-editors-blockviewer-toolbar.md` passes.

Verification surface:
- `pnpm --filter www exec eslint src/components/block-viewer.tsx --fix`
- `pnpm --filter www typecheck`
- status JSON parse
- Playwright browser proof against `http://localhost:3002/editors` at
  `1175x1239` and `390x844`
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-sync-shadcn-editors-blockviewer-toolbar.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth:
  `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/plan.md`
- Allowed edit scope: `apps/www/src/components/block-viewer.tsx`, sync run
  plan, sync status JSON, and this goal plan.
- Browser surface: `http://localhost:3002/editors`.
- Tracker sync: N/A, no external issue.
- Non-goals: no v0, no category nav, no block content import, no full baseline
  advancement, no app shell changes.

Output budget strategy:
- Use targeted source reads and compact browser metrics; save screenshots under
  the existing sync run instead of streaming visual evidence.

Blocked condition:
- Block only if upstream/Plate toolbar ownership cannot be mapped, checks fail
  for reasons outside this slice after one honest retry, or browser proof shows
  v0 present or preview refresh broken.

Task state:
- task_type: visual toolbar sync
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: implemented
- confidence: high
- next owner: user review
- reason: toolbar slice shipped with focused checks, iframe-refresh proof, and
  sync status updated

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-sync-shadcn-editors-blockviewer-toolbar.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `sync-shadcn`, `autogoal`, `task`, and `shadcn-parity`; read upstream and Plate `BlockViewer`. |
| Active goal checked or created | yes | Active goal created for accepted toolbar slice. |
| Source of truth read before edits | yes | Read accepted sync plan and toolbar slice. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: fresh accepted sync plan is the source of truth. |
| TDD decision before behavior change or bug fix | no | N/A: visual toolbar sync verified by browser proof. |
| Branch decision for code-changing task | yes | N/A: no branch/PR requested; edited current checkout. |
| Release artifact decision | no | N/A: docs app component only; no package release. |
| Browser tool decision for browser surface | yes | Used Playwright on local dev route because no direct Browser tool was callable. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Targeted reads, compact command/browser output, screenshots saved in sync run. |
| Docs pack selected | yes | Applied because sync status/run plan changed. |
| `docs-creator` loaded | no | N/A: sync bookkeeping, not user-facing docs prose. |
| Docs lane selected | yes | Supporting sync artifact update. |
| Target docs and nearest sibling docs read | yes | Read sync run plan and status JSON. |
| Docs style doctrine read | no | N/A: no user-facing docs content changed. |
| Documented source owner identified | yes | Source owner is `docs/sync/shadcn/**`. |
| Browser pack selected | yes | Applied because visible `/editors` toolbar changed. |
| Browser route / app surface identified | yes | `http://localhost:3002/editors`. |
| Browser tool decision recorded | yes | Playwright proof with desktop/mobile screenshots. |
| Console/network caveat policy recorded | yes | Known Potion iframe X-Frame/sandbox warnings recorded; no page errors or failed requests. |

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
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named checks and browser proof | Focused eslint, typecheck, status JSON parse, browser proof, and screenshots completed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: visual sync slice. |
| Targeted behavior verification | yes | Run focused proof | Browser asserted device/open/refresh before command, refresh reload, no v0, no overflow. |
| TypeScript or typed config changed | yes | Run typecheck | `pnpm --filter www typecheck` passed. |
| Package exports or file layout changed | no | Run `pnpm brl` or record N/A | N/A: no package exports/file layout. |
| Package manifests, lockfile, or install graph changed | no | Run install checks or record N/A | N/A: no manifest or lockfile change. |
| Agent rules or skills changed | no | Run sync or record N/A | N/A: no agent rules/skills changed. |
| Workspace authority proof | yes | Run proof in owning workspace | Commands ran from `/Users/zbeyens/git/plate`; browser proof hit `apps/www` route. |
| Browser surface changed | yes | Capture browser proof | Desktop/mobile screenshots saved in sync run. |
| Browser final proof | yes | Attach screenshot or caveat | Screenshots saved; known Potion iframe warnings only. |
| CI-controlled template output changed | no | Restore output or record N/A | N/A. |
| Package behavior or public API changed | no | Add changeset or record N/A | N/A. |
| Registry-only component work changed | no | Update changelog or record N/A | N/A. |
| Docs or content changed | yes | Verify sync docs/status | Status JSON parses; run plan updated with implementation result. |
| High-risk mini gate | yes | Record failure mode and proof | Risk: adding v0 or breaking iframe refresh; browser proof asserts no v0 and refresh reloads content. |
| Agent-native review for agent/tooling changes | no | Run review or record N/A | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | Retry reinstall or record N/A | N/A: checks passed. |
| Autoreview for non-trivial implementation changes | no | Run review or record N/A | N/A: narrow visual component sync with targeted checks/browser proof. |
| PR create or update | no | Run check before PR work or record N/A | N/A: no PR requested. |
| Task-style PR body verified | no | Verify PR body or record N/A | N/A: no PR. |
| PR proof image hosting | no | Host images or record N/A | N/A: no PR. |
| Tracker sync-back | no | Post tracker sync or record N/A | N/A: no tracker. |
| Final handoff contract | yes | Fill final handoff fields | Filled below. |
| Final lint | yes | Run scoped equivalent | `pnpm --filter www exec eslint src/components/block-viewer.tsx --fix` passed. |
| Output budget discipline | yes | Verify scoped output | Targeted command output and saved screenshots only. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-sync-shadcn-editors-blockviewer-toolbar.md` | To run after this fill. |
| Docs source-backed claim audit | yes | Verify docs claims | Claims backed by source, sync plan, status JSON, and browser proof. |
| Docs links / routes / previews | yes | Verify route/anchors/previews | `/editors` route and iframe refresh verified. |
| Docs MDX/content parser | no | Run content parser or record N/A | N/A: no MDX content changed. |
| Plugin page specifics | no | Apply plugin page rules or record N/A | N/A. |
| Browser interaction proof | yes | Exercise route/interaction | Clicked Refresh Preview and waited for iframe content. |
| Browser console/network check | yes | Record console/network state | No page errors or failed requests; known iframe warnings recorded. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof | `plate-editors-toolbar-desktop-after.png` and `plate-editors-toolbar-mobile-after.png`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read accepted sync plan plus upstream/Plate `BlockViewer`. | implementation |
| Implementation | complete | Patched `BlockViewer`; updated sync status and run plan. | verification |
| Verification | complete | Focused eslint, typecheck, JSON parse, browser desktop/mobile proof. | closeout |
| PR / tracker sync | N/A | No PR or tracker requested. | final response |
| Closeout | complete | Plan filled; final response ready after completion check. | final response |

Findings:
- Plate toolbar had command/pro action before device controls and no refresh
  action.
- Upstream toolbar order is device controls, open-new-tab, refresh, command
  pill, then v0; v0 remains explicitly excluded.

Decisions and tradeoffs:
- Adopted toolbar order, sizing, and refresh behavior.
- Kept Plate install command text/source model and Pro `Get the code` behavior.
- Did not copy upstream v0 action.

Implementation notes:
- Added `iframeKey` state to remount preview iframes on refresh.
- Reordered toolbar actions to match upstream `/blocks` without v0.
- Controlled preview/code tabs from `view` so toolbar state tracks view changes.
- Fixed the local exhaustive-deps warning by memoizing `files`.

Review fixes:
- First desktop screenshot caught the refreshed iframe before reload completed;
  reran browser proof with an iframe-content wait.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Browser proof with `networkidle` | 1 | Use `domcontentloaded` plus iframe content wait | Passed |
| Desktop screenshot captured blank iframe after immediate refresh | 1 | Wait for iframe heading after refresh before screenshot | Passed |
| Strict text match inside iframe found two elements | 1 | Target iframe `h1` specifically | Passed |

Verification evidence:
- `pnpm --filter www exec eslint src/components/block-viewer.tsx --fix` passed.
- `pnpm --filter www typecheck` passed.
- `node -e 'JSON.parse(require("fs").readFileSync("docs/sync/shadcn/status.json","utf8")); console.log("status json ok")'` passed.
- Browser proof on `http://localhost:3002/editors` at desktop: device/open/refresh controls visible before command pill, command text is Plate install command, refresh reloads iframe content, `Open in v0` absent, no horizontal overflow.
- Browser proof on `http://localhost:3002/editors` at mobile: no `Open in v0`, no horizontal overflow.
- Screenshots saved:
  `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/screenshots/plate-editors-toolbar-desktop-after.png`
  and
  `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/screenshots/plate-editors-toolbar-mobile-after.png`.
- Console caveat: known Potion iframe X-Frame-Options/sandbox warnings appeared; there were no page errors or failed requests.

Reboot status:
- Current and complete as of 2026-05-29: toolbar patch, sync bookkeeping, and
  browser proof are done; final mechanical checks remain.

Open risks:
- None for the accepted slice.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high; checks and browser proof passed.
- Flow table:
  - Reproduced: N/A for bug repro; source plan and screenshots identified the delta.
  - Verified: focused eslint/typecheck and desktop/mobile browser proof.
- Browser check: desktop refresh/open/device/command order verified; mobile no overflow.
- Outcome: `/editors` BlockViewer toolbar now follows shadcn `/blocks` order without v0.
- Caveat: Potion iframe emits known external sandbox/X-Frame warnings.
- Design:
  - Chosen boundary: `BlockViewer` toolbar owns this behavior.
  - Why not quick patch: refresh needed provider state and iframe key, not just class changes.
  - Why not broader change: upstream v0 and block content remain excluded by policy.
- Verified: eslint, typecheck, status JSON parse, browser proof.
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
- Browser proof: screenshots saved in the sync run folder.
- Caveats: known Potion iframe warnings only.

Timeline:
- 2026-05-29T20:45:59.181Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete after implementation and verification |
| Where am I going? | Final response |
| What is the goal? | Ship shadcn `/blocks` toolbar parity for Plate `/editors` without v0 |
| What have I learned? | Toolbar owner is `BlockViewer`; refresh needed iframe remount state |
| What have I done? | Patched toolbar, updated sync status/run plan, verified in browser |

Open risks:
- None.
